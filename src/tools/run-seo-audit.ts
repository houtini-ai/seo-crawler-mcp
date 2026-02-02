/**
 * Run SEO Audit Tool Handler
 * Phase 2: Full implementation with crawling engine
 */

import { randomUUID } from 'crypto';
import path from 'path';
import os from 'os';
import { RunSeoAuditInputSchema } from '../schema/index.js';
import type { RunSeoAuditInput, RunSeoAuditOutput, CrawlConfig } from '../types/index.js';
import { UrlManager } from '../core/UrlManager.js';
import { ContentExtractor } from '../core/ContentExtractor.js';
import { LinkExtractor } from '../core/LinkExtractor.js';
import { CrawlStorage } from '../core/CrawlStorage.js';
import { CrawlOrchestrator } from '../core/CrawlOrchestrator.js';
import { debug } from '../utils/debug.js';

export async function runSeoAudit(params: RunSeoAuditInput): Promise<RunSeoAuditOutput> {
  // DEBUG: Log raw incoming parameters
  debug('[MCP] Raw params received:', JSON.stringify(params, null, 2));
  
  const validated = RunSeoAuditInputSchema.parse(params);
  
  // DEBUG: Log validated parameters
  debug('[MCP] Validated params:', JSON.stringify(validated, null, 2));
  
  const crawlId = randomUUID();
  
  // Extract hostname for folder naming
  const hostname = new URL(validated.url).hostname.replace(/^www\./, '');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const folderName = `${hostname}_${timestamp}_${crawlId.slice(0, 8)}`;
  
  // Cross-platform output directory resolution
  // Priority: OUTPUT_DIR env var > home directory fallback
  const baseDir = process.env.OUTPUT_DIR || path.join(os.homedir(), 'seo-audits');
  const outputPath = path.join(baseDir, folderName);
  
  debug('[MCP] Output path resolved:', outputPath);
  
  const config: CrawlConfig = {
    crawlId,
    startUrl: validated.url,
    maxDepth: validated.depth ?? 3,
    maxPages: validated.maxPages ?? 1000,
    userAgent: validated.userAgent ?? 'chrome',
    crawlExternal: false,
    respectRobots: true,
    concurrency: 5,
    delay: 1000,
    timeout: 30000,
    includeExtensions: ['html', 'htm', 'php', 'asp', 'aspx', 'jsp'],
    excludeExtensions: ['pdf', 'doc', 'zip', 'exe', 'jpg', 'png', 'gif', 'css', 'js', 'xml', 'rss', 'atom', 'json'],
    includePatterns: [],
    excludePatterns: [],
    outputPath,
    createdAt: new Date().toISOString()
  };
  
  // DEBUG: Log final config being passed to orchestrator
  debug('[MCP] Final crawl config:', JSON.stringify(config, null, 2));
  
  const storage = new CrawlStorage(outputPath, validated.url);
  await storage.initialize();
  await storage.saveConfig(config);
  
  const baseDomain = new URL(config.startUrl).hostname;
  const urlManager = new UrlManager(baseDomain);
  const contentExtractor = new ContentExtractor();
  const linkExtractor = new LinkExtractor(baseDomain);
  
  const orchestrator = new CrawlOrchestrator(
    config,
    urlManager,
    contentExtractor,
    linkExtractor,
    storage
  );
  
  const metadata = await orchestrator.run();
  
  // Generate CSV export
  await storage.generateCsvExport();
  
  return {
    crawlId: config.crawlId,
    outputPath: config.outputPath,
    status: metadata.status,
    stats: metadata.stats
  };
}
