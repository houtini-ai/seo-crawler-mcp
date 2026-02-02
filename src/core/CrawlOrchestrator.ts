// Copyright 2026 Richard Baxter
// Licensed under the Apache License, Version 2.0

/**
 * CrawlOrchestrator - Main coordinator for crawling
 * 
 * Responsibilities:
 * - Initialize and manage Crawlee crawler
 * - Coordinate UrlManager, ContentExtractor, LinkExtractor, CrawlStorage
 * - Apply filters (extensions, patterns, robots.txt)
 * - Track progress and errors
 * - Handle crawl lifecycle (start, pause, completion)
 */

import { HttpCrawler, RequestQueue, Configuration, type Request, type CrawlingContext, log } from 'crawlee';
import { MemoryStorage } from '@crawlee/memory-storage';
import { load } from 'cheerio';
import type { CrawlConfig, CrawlMetadata, CrawlError } from '../types/index.js';
import { UrlManager } from './UrlManager.js';
import { ContentExtractor } from './ContentExtractor.js';
import { LinkExtractor } from './LinkExtractor.js';
import { CrawlStorage } from './CrawlStorage.js';

export class CrawlOrchestrator {
  private crawler: any;
  private metadata: CrawlMetadata;
  private linkBuffer: any[] = [];
  private readonly LINK_BUFFER_SIZE = 100;
  private memoryStorage?: MemoryStorage; // Track storage for cleanup

  constructor(
    private config: CrawlConfig,
    private urlManager: UrlManager,
    private contentExtractor: ContentExtractor,
    private linkExtractor: LinkExtractor,
    private storage: CrawlStorage
  ) {
    // Suppress ALL Crawlee logging for MCP stdout cleanliness
    log.setLevel(log.LEVELS.OFF);
    
    this.metadata = this.createInitialMetadata();
    // initializeCrawler is now async, will be called in run()
  }

  private createInitialMetadata(): CrawlMetadata {
    return {
      crawlId: this.config.crawlId,
      status: 'queued',
      startedAt: null,
      completedAt: null,
      duration: null,
      stats: {
        discovered: 0,
        crawled: 0,
        failed: 0,
        skipped: 0,
        depth: 0,
        speed: 0
      },
      errors: []
    };
  }

  private async initializeCrawler(): Promise<void> {
    // CRITICAL FIX: Create isolated storage with unique directory per crawl
    // This prevents RequestQueue state persistence between crawls
    // Use unique storage dir based on crawlId to ensure complete isolation
    const storageDir = `./crawlee-storage-${this.config.crawlId}`;
    this.memoryStorage = new MemoryStorage({ localDataDirectory: storageDir });
    
    // Create isolated configuration using the memory storage
    const configuration = new Configuration({
      storageClient: this.memoryStorage,
      persistStorage: false, // Don't persist between runs
    });
    
    // Create isolated RequestQueue using the configuration
    const requestQueue = await RequestQueue.open(undefined, { config: configuration });
    
    // User agent strings
    const userAgents = {
      chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    };
    
    const userAgent = userAgents[this.config.userAgent as keyof typeof userAgents] || userAgents.chrome;
    
    const crawlerConfig = {
      maxRequestsPerCrawl: this.config.maxPages,
      maxConcurrency: 20,
      minConcurrency: 5,
      maxRequestRetries: 5,
      requestHandlerTimeoutSecs: this.config.timeout / 1000,
      navigationTimeoutSecs: 30,
      additionalMimeTypes: ['text/html', 'application/xhtml+xml'],
      requestQueue, // Use isolated request queue (which already has the isolated config)
      preNavigationHooks: [
        async ({ request }: any) => {
          request.headers = {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          };
        }
      ],
      requestHandler: async (context: CrawlingContext) => {
        const { request, response, body, crawler } = context as any;
        if (!response || !body) return;
        
        const $ = load(body.toString());
        await this.processPage(request.url, body.toString(), $, response, crawler);
      },
      failedRequestHandler: async (context: CrawlingContext, error: Error) => {
        const { request } = context as any;
        await this.handleFailedRequest(request, error);
      }
    };

    this.crawler = new HttpCrawler(crawlerConfig as any);
  }

  async run(): Promise<CrawlMetadata> {
    try {
      console.error('[ORCH DEBUG] Starting orchestrator.run()');
      console.error('[ORCH DEBUG] Config:', JSON.stringify(this.config, null, 2));
      
      // Initialize crawler with isolated storage
      await this.initializeCrawler();
      console.error('[ORCH DEBUG] Crawler initialized with isolated MemoryStorage');
      
      await this.storage.initialize();
      console.error('[ORCH DEBUG] Storage initialized');
      
      this.metadata.status = 'running';
      this.metadata.startedAt = new Date().toISOString();
      await this.storage.saveMetadata(this.metadata, this.config);
      console.error('[ORCH DEBUG] Metadata saved, status=running');
      
      this.urlManager.addDiscovered(this.config.startUrl, 0);
      console.error('[ORCH DEBUG] Start URL added to UrlManager');
      
      console.error('[ORCH DEBUG] About to call crawler.run()...');
      await this.crawler.run([this.config.startUrl]);
      console.error('[ORCH DEBUG] Crawler.run() completed');
      
      if (this.linkBuffer.length > 0) {
        await this.storage.saveLinkData(this.linkBuffer);
        this.linkBuffer = [];
      }
      
      const endTime = Date.now();
      const startTime = new Date(this.metadata.startedAt!).getTime();
      
      this.metadata.status = 'completed';
      this.metadata.completedAt = new Date().toISOString();
      this.metadata.duration = endTime - startTime;
      this.metadata.stats.depth = this.urlManager.getMaxDepth();
      this.metadata.stats.speed = this.metadata.duration > 0 
        ? (this.metadata.stats.crawled / (this.metadata.duration / 1000))
        : 0;
      
    } catch (error: any) {
      console.error('[ORCH ERROR] Fatal error in run():', error);
      console.error('[ORCH ERROR] Stack:', error.stack);
      this.metadata.status = 'failed';
      this.metadata.errors.push({
        url: '',
        errorType: 'unknown',
        message: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
    // No explicit cleanup needed - MemoryStorage is garbage collected
    // and Crawlee automatically purges default storages
    
    await this.storage.saveMetadata(this.metadata, this.config);
    return this.metadata;
  }

  private async processPage(
    url: string,
    html: string,
    $: any,
    response: any,
    crawler: any
  ): Promise<void> {
    this.urlManager.markVisited(url);
    
    const pageData = this.contentExtractor.extract(url, html, $, {
      crawlId: this.config.crawlId,
      depth: this.urlManager.getDepth(url),
      statusCode: response.status || 200,
      contentType: response.headers?.['content-type'] || 'text/html',
      responseTime: 0,
      size: html.length,
      isInternal: this.urlManager.isInternal(url),
      linkedFrom: this.urlManager.getSourcePages(url),
      redirects: []
    }, response);
    
    const links = this.linkExtractor.extract($, url, this.config.crawlId);
    
    const currentDepth = this.urlManager.getDepth(url);
    const linksToAdd: string[] = [];
    
    for (const link of links) {
      if (this.shouldCrawlUrl(link.targetUrl)) {
        // Only check depth - let Crawlee's RequestQueue handle de-duplication
        if (currentDepth < this.config.maxDepth) {
          // Still track in urlManager for metadata purposes
          if (!this.urlManager.isDiscovered(link.targetUrl)) {
            this.urlManager.addDiscovered(link.targetUrl, currentDepth + 1, url);
          }
          linksToAdd.push(link.targetUrl);
        } else {
          this.metadata.stats.skipped++;
        }
      } else {
        this.metadata.stats.skipped++;
      }
    }
    
    if (linksToAdd.length > 0) {
      await crawler.addRequests(linksToAdd);
    }
    
    await this.storage.savePageData(pageData);
    
    this.linkBuffer.push(...links);
    if (this.linkBuffer.length >= this.LINK_BUFFER_SIZE) {
      await this.storage.saveLinkData(this.linkBuffer);
      this.linkBuffer = [];
    }
    
    this.metadata.stats.crawled++;
    this.metadata.stats.discovered = this.urlManager.getTotalDiscovered();
    
    if (this.metadata.stats.crawled % 10 === 0) {
      await this.storage.updateMetadata(this.metadata);
    }
  }

  private async handleFailedRequest(request: Request, error: Error): Promise<void> {
    this.metadata.stats.failed++;
    
    const errorType = this.categorizeError(error);
    const errorMessage = error.message || 'Unknown error';
    const errorMessages = request.errorMessages || [];
    
    const fullErrorDetails = errorMessages.length > 0 
      ? `${errorMessage} (Retry ${request.retryCount}: ${errorMessages.join(', ')})`
      : errorMessage;
    
    this.metadata.errors.push({
      url: request.url,
      errorType: errorType,
      message: fullErrorDetails,
      timestamp: new Date().toISOString()
    });
  }

  private categorizeError(error: Error): CrawlError['errorType'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('dns') || message.includes('getaddrinfo')) return 'dns';
    if (message.includes('connect') || message.includes('econnrefused')) return 'connection';
    if (message.includes('ssl') || message.includes('certificate')) return 'ssl';
    if (message.includes('401') || message.includes('403')) return 'auth';
    if (message.includes('404')) return 'not_found';
    if (message.includes('429') || message.includes('rate limit')) return 'rate_limit';
    if (message.includes('500') || message.includes('502') || message.includes('503')) return 'server_error';
    
    return 'network';
  }

  private shouldCrawlUrl(url: string): boolean {
    const ext = this.getFileExtension(url);
    
    // Always exclude blocked extensions
    if (ext && this.config.excludeExtensions.includes(ext)) {
      return false;
    }
    
    // If URL has no extension, treat as HTML (allow it)
    // If URL has extension, check against include list
    if (ext && this.config.includeExtensions.length > 0 && 
        !this.config.includeExtensions.includes(ext)) {
      return false;
    }
    
    if (this.config.excludePatterns.length > 0) {
      if (this.config.excludePatterns.some(pattern => {
        try {
          return new RegExp(pattern).test(url);
        } catch {
          return false;
        }
      })) {
        return false;
      }
    }
    
    if (this.config.includePatterns.length > 0) {
      if (!this.config.includePatterns.some(pattern => {
        try {
          return new RegExp(pattern).test(url);
        } catch {
          return false;
        }
      })) {
        return false;
      }
    }
    
    if (!this.config.crawlExternal && !this.urlManager.isInternal(url)) {
      return false;
    }
    
    return true;
  }

  private getFileExtension(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      const parts = pathname.split('.');
      if (parts.length > 1) {
        return parts[parts.length - 1].toLowerCase();
      }
    } catch {}
    return '';
  }
}
