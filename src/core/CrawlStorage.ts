/**
 * CrawlStorage - Database-backed storage for crawl data
 * 
 * Version: 2.0.0 - SQLite Migration
 * 
 * Responsibilities:
 * - Create and manage crawl directory structure
 * - Initialize SQLite database via CrawlDatabase
 * - Proxy all data operations to database
 * - Keep config.json as human-readable file
 * - Generate CSV exports from database
 * 
 * Migration from JSON files to SQLite for:
 * - Better query performance
 * - Easier analysis and reporting
 * - Smaller disk footprint
 * - Industry-standard storage format
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import type { CrawlConfig, CrawlMetadata, PageData, LinkData } from '../types/index.js';
import { CrawlConfigSchema } from '../schema/index.js';
import { CrawlDatabase } from './CrawlDatabase.js';

export class CrawlStorage {
  private baseDir: string;
  private db!: CrawlDatabase;
  private dbPath: string;
  private baseUrl?: string;

  constructor(outputPath: string, baseUrl?: string) {
    this.baseDir = outputPath;
    this.dbPath = join(outputPath, 'crawl-data.db');
    this.baseUrl = baseUrl;
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
    // Initialize database after directory exists
    this.db = new CrawlDatabase(this.dbPath);
  }

  // Config operations - Keep as JSON file for human readability
  async saveConfig(config: CrawlConfig): Promise<void> {
    const validated = CrawlConfigSchema.parse(config);
    const filePath = join(this.baseDir, 'config.json');
    await fs.writeFile(filePath, JSON.stringify(validated, null, 2), 'utf-8');
  }

  async loadConfig(): Promise<CrawlConfig> {
    const filePath = join(this.baseDir, 'config.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return CrawlConfigSchema.parse(JSON.parse(content));
  }

  // Metadata operations - Proxy to database
  async saveMetadata(metadata: CrawlMetadata, config?: CrawlConfig): Promise<void> {
    this.db.saveCrawlMetadata(metadata, this.baseUrl, config);
  }

  async loadMetadata(): Promise<CrawlMetadata | null> {
    const config = await this.loadConfig();
    return this.db.getCrawlMetadata(config.crawlId);
  }

  async updateMetadata(updates: Partial<CrawlMetadata>): Promise<void> {
    this.db.updateCrawlMetadata(updates);
  }

  // Page data operations - Proxy to database
  async savePageData(page: PageData): Promise<void> {
    this.db.savePage(page);
  }

  async savePageDataBatch(pages: PageData[]): Promise<void> {
    this.db.savePageBatch(pages);
  }

  async loadPageData(url: string): Promise<PageData | null> {
    return this.db.getPage(url);
  }

  async loadAllPageData(): Promise<PageData[]> {
    return this.db.getAllPages();
  }

  // Link data operations - Proxy to database
  async saveLinkData(links: LinkData[]): Promise<void> {
    this.db.saveLinks(links);
  }

  async loadLinkData(): Promise<LinkData[]> {
    return this.db.getAllLinks();
  }

  async appendLinkData(newLinks: LinkData[]): Promise<void> {
    this.db.saveLinks(newLinks);
  }

  // CSV export - Generate from database
  async generateCsvExport(): Promise<void> {
    const csvPath = join(this.baseDir, 'crawl-export.csv');
    this.db.exportToCsv(csvPath);
  }

  // Utility methods
  async exists(): Promise<boolean> {
    try {
      await fs.access(this.baseDir);
      return true;
    } catch {
      return false;
    }
  }

  async getStats(): Promise<{
    totalPages: number;
    totalLinks: number;
    hasMetadata: boolean;
    hasConfig: boolean;
  }> {
    const [pageCount, linkCount, hasConfig] = await Promise.all([
      Promise.resolve(this.db.getPageCount()),
      Promise.resolve(this.db.getLinkCount()),
      fs.access(join(this.baseDir, 'config.json')).then(() => true).catch(() => false)
    ]);

    const metadata = await this.loadMetadata();

    return {
      totalPages: pageCount,
      totalLinks: linkCount,
      hasMetadata: metadata !== null,
      hasConfig
    };
  }

  // Cleanup
  close(): void {
    this.db.close();
  }

  // Direct database access for advanced queries
  getDatabase(): CrawlDatabase {
    return this.db;
  }
}
