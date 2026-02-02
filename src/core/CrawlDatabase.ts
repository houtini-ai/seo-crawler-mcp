import Database from 'better-sqlite3';
import type {
  CrawlMetadata,
  PageData,
  LinkData,
  CrawlError,
} from '../types/index.js';
import { writeFileSync } from 'fs';

export class CrawlDatabase {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initializeTables();
    this.migrateToEnhancedSchema();
  }

  private initializeTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS crawl_metadata (
        crawl_id TEXT PRIMARY KEY,
        base_url TEXT NOT NULL,
        base_domain TEXT NOT NULL,
        status TEXT DEFAULT 'running',
        
        max_depth INTEGER,
        max_pages INTEGER,
        user_agent TEXT,
        
        urls_discovered INTEGER DEFAULT 0,
        urls_crawled INTEGER DEFAULT 0,
        urls_failed INTEGER DEFAULT 0,
        urls_skipped INTEGER DEFAULT 0,
        max_depth_reached INTEGER DEFAULT 0,
        
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        duration_ms INTEGER,
        speed_pages_per_sec REAL,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crawl_id TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        
        status_code INTEGER,
        content_type TEXT,
        size INTEGER,
        response_time INTEGER,
        
        depth INTEGER,
        is_internal BOOLEAN,
        linked_from TEXT,
        
        title TEXT,
        title_length INTEGER,
        meta_description TEXT,
        meta_description_length INTEGER,
        h1 TEXT,
        h2 TEXT,
        h3 TEXT,
        
        word_count INTEGER,
        lang TEXT,
        charset TEXT,
        
        canonical_url TEXT,
        robots TEXT,
        viewport TEXT,
        
        meta_tags TEXT,
        og_tags TEXT,
        twitter_tags TEXT,
        json_ld TEXT,
        schema_org TEXT,
        
        has_google_analytics BOOLEAN,
        ga4_id TEXT,
        has_gtm BOOLEAN,
        gtm_id TEXT,
        has_facebook_pixel BOOLEAN,
        has_hotjar BOOLEAN,
        
        images TEXT,
        internal_links INTEGER,
        external_links INTEGER,
        
        hreflang TEXT,
        redirects TEXT,
        
        crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (crawl_id) REFERENCES crawl_metadata(crawl_id)
      );
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_pages_url ON pages(url);
      CREATE INDEX IF NOT EXISTS idx_pages_status_code ON pages(status_code);
      CREATE INDEX IF NOT EXISTS idx_pages_depth ON pages(depth);
      CREATE INDEX IF NOT EXISTS idx_pages_word_count ON pages(word_count);
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crawl_id TEXT NOT NULL,
        source_url TEXT NOT NULL,
        target_url TEXT NOT NULL,
        
        anchor_text TEXT,
        is_internal BOOLEAN,
        target_domain TEXT,
        target_status INTEGER,
        placement TEXT,
        
        discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (crawl_id) REFERENCES crawl_metadata(crawl_id)
      );
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_links_source ON links(source_url);
      CREATE INDEX IF NOT EXISTS idx_links_target ON links(target_url);
      CREATE INDEX IF NOT EXISTS idx_links_internal ON links(is_internal);
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS errors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crawl_id TEXT NOT NULL,
        url TEXT NOT NULL,
        
        error_type TEXT,
        error_message TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (crawl_id) REFERENCES crawl_metadata(crawl_id)
      );
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_errors_type ON errors(error_type);
    `);
  }

  private migrateToEnhancedSchema(): void {
    try {
      this.db.exec(`
        ALTER TABLE pages ADD COLUMN security_headers_csp TEXT;
      `);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) throw e;
    }

    try {
      this.db.exec(`
        ALTER TABLE pages ADD COLUMN security_headers_hsts TEXT;
      `);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) throw e;
    }

    try {
      this.db.exec(`
        ALTER TABLE pages ADD COLUMN security_headers_x_frame TEXT;
      `);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) throw e;
    }

    try {
      this.db.exec(`
        ALTER TABLE pages ADD COLUMN security_headers_referrer TEXT;
      `);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) throw e;
    }

    try {
      this.db.exec(`
        ALTER TABLE pages ADD COLUMN heading_count_h1 INTEGER DEFAULT 0;
      `);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) throw e;
    }

    try {
      this.db.exec(`
        ALTER TABLE pages ADD COLUMN heading_count_h2 INTEGER DEFAULT 0;
      `);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) throw e;
    }

    try {
      this.db.exec(`
        ALTER TABLE pages ADD COLUMN heading_count_h3 INTEGER DEFAULT 0;
      `);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) throw e;
    }

    try {
      this.db.exec(`
        ALTER TABLE pages ADD COLUMN heading_count_h4 INTEGER DEFAULT 0;
      `);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) throw e;
    }

    try {
      this.db.exec(`
        ALTER TABLE pages ADD COLUMN heading_count_h5 INTEGER DEFAULT 0;
      `);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) throw e;
    }

    try {
      this.db.exec(`
        ALTER TABLE pages ADD COLUMN heading_count_h6 INTEGER DEFAULT 0;
      `);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) throw e;
    }

    try {
      this.db.exec(`
        ALTER TABLE pages ADD COLUMN heading_hierarchy TEXT;
      `);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) throw e;
    }

    try {
      this.db.exec(`
        ALTER TABLE pages ADD COLUMN heading_sequential_errors TEXT;
      `);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) throw e;
    }

    try {
      this.db.exec(`
        ALTER TABLE pages ADD COLUMN link_ext_target_blank_count INTEGER DEFAULT 0;
      `);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) throw e;
    }

    try {
      this.db.exec(`
        ALTER TABLE pages ADD COLUMN link_ext_target_blank_no_rel_count INTEGER DEFAULT 0;
      `);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) throw e;
    }

    try {
      this.db.exec(`
        ALTER TABLE pages ADD COLUMN link_protocol_relative_count INTEGER DEFAULT 0;
      `);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) throw e;
    }
  }

  saveCrawlMetadata(metadata: CrawlMetadata, baseUrl?: string, config?: any): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO crawl_metadata (
        crawl_id, base_url, base_domain, status,
        max_depth, max_pages, user_agent,
        urls_discovered, urls_crawled, urls_failed, urls_skipped, max_depth_reached,
        started_at, completed_at, duration_ms, speed_pages_per_sec
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Extract base domain from base URL if provided
    let baseDomain = 'unknown';
    let actualBaseUrl = baseUrl || '';
    
    if (baseUrl) {
      try {
        const parsed = new URL(baseUrl);
        baseDomain = parsed.hostname;
        actualBaseUrl = baseUrl;
      } catch {
        // Invalid URL, use defaults
      }
    }
    
    stmt.run(
      metadata.crawlId,
      actualBaseUrl,
      baseDomain,
      metadata.status,
      config?.maxDepth ?? 0,
      config?.maxPages ?? 0,
      config?.userAgent ?? 'chrome',
      metadata.stats.discovered,
      metadata.stats.crawled,
      metadata.stats.failed,
      metadata.stats.skipped,
      metadata.stats.depth,
      metadata.startedAt,
      metadata.completedAt,
      metadata.duration,
      metadata.stats.speed
    );
  }

  updateCrawlMetadata(updates: Partial<CrawlMetadata>): void {
    if (!updates.crawlId) {
      throw new Error('crawlId is required for updateCrawlMetadata');
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.startedAt !== undefined) {
      fields.push('started_at = ?');
      values.push(updates.startedAt);
    }
    if (updates.completedAt !== undefined) {
      fields.push('completed_at = ?');
      values.push(updates.completedAt);
    }
    if (updates.duration !== undefined) {
      fields.push('duration_ms = ?');
      values.push(updates.duration);
    }
    if (updates.stats !== undefined) {
      fields.push('urls_discovered = ?', 'urls_crawled = ?', 'urls_failed = ?', 'urls_skipped = ?', 'max_depth_reached = ?', 'speed_pages_per_sec = ?');
      values.push(
        updates.stats.discovered,
        updates.stats.crawled,
        updates.stats.failed,
        updates.stats.skipped,
        updates.stats.depth,
        updates.stats.speed
      );
    }

    if (fields.length === 0) {
      return;
    }

    values.push(updates.crawlId);
    const sql = `UPDATE crawl_metadata SET ${fields.join(', ')} WHERE crawl_id = ?`;
    this.db.prepare(sql).run(...values);
  }

  getCrawlMetadata(crawlId: string): CrawlMetadata | null {
    const row = this.db.prepare(`
      SELECT * FROM crawl_metadata WHERE crawl_id = ?
    `).get(crawlId) as any;

    if (!row) return null;

    return {
      crawlId: row.crawl_id,
      status: row.status,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      duration: row.duration_ms,
      stats: {
        discovered: row.urls_discovered,
        crawled: row.urls_crawled,
        failed: row.urls_failed,
        skipped: row.urls_skipped,
        depth: row.max_depth_reached,
        speed: row.speed_pages_per_sec
      },
      errors: this.getAllErrors(crawlId)
    };
  }

  savePage(page: PageData): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO pages (
        crawl_id, url, status_code, content_type, size, response_time,
        depth, is_internal, linked_from,
        title, title_length, meta_description, meta_description_length,
        h1, h2, h3,
        word_count, lang, charset,
        canonical_url, robots, viewport,
        meta_tags, og_tags, twitter_tags, json_ld, schema_org,
        has_google_analytics, ga4_id, has_gtm, gtm_id, has_facebook_pixel, has_hotjar,
        images, internal_links, external_links,
        hreflang, redirects, crawled_at,
        security_headers_csp, security_headers_hsts, security_headers_x_frame, security_headers_referrer,
        heading_count_h1, heading_count_h2, heading_count_h3, heading_count_h4, heading_count_h5, heading_count_h6,
        heading_hierarchy, heading_sequential_errors,
        link_ext_target_blank_count, link_ext_target_blank_no_rel_count, link_protocol_relative_count
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?
      )
    `);

    stmt.run(
      page.crawlId,
      page.url,
      page.statusCode,
      page.contentType,
      page.size,
      page.responseTime,
      page.depth,
      page.isInternal ? 1 : 0,
      JSON.stringify(page.linkedFrom),
      page.title,
      page.title.length,
      page.metaDescription,
      page.metaDescription.length,
      page.h1,
      JSON.stringify(page.h2),
      JSON.stringify(page.h3),
      page.wordCount,
      page.lang,
      page.charset,
      page.canonicalUrl,
      page.robots,
      page.viewport,
      JSON.stringify(page.metaTags),
      JSON.stringify(page.ogTags),
      JSON.stringify(page.twitterTags),
      JSON.stringify(page.jsonLd),
      JSON.stringify(page.schemaOrg),
      page.analytics.googleAnalytics ? 1 : 0,
      page.analytics.ga4Id,
      page.analytics.gtag ? 1 : 0,
      page.analytics.gtmId,
      page.analytics.facebookPixel ? 1 : 0,
      page.analytics.hotjar ? 1 : 0,
      JSON.stringify(page.images),
      page.internalLinks,
      page.externalLinks,
      JSON.stringify(page.hreflang),
      JSON.stringify(page.redirects),
      page.crawledAt,
      page.securityHeaders.contentSecurityPolicy,
      page.securityHeaders.strictTransportSecurity,
      page.securityHeaders.xFrameOptions,
      page.securityHeaders.referrerPolicy,
      page.headingCounts.h1,
      page.headingCounts.h2,
      page.headingCounts.h3,
      page.headingCounts.h4,
      page.headingCounts.h5,
      page.headingCounts.h6,
      JSON.stringify(page.headingHierarchy),
      JSON.stringify(page.headingSequentialErrors),
      page.linkMetrics.externalTargetBlankCount,
      page.linkMetrics.externalTargetBlankNoRelCount,
      page.linkMetrics.protocolRelativeLinksCount
    );
  }

  savePageBatch(pages: PageData[]): void {
    const transaction = this.db.transaction((pages: PageData[]) => {
      for (const page of pages) {
        this.savePage(page);
      }
    });

    transaction(pages);
  }

  getPage(url: string): PageData | null {
    const row = this.db.prepare(`
      SELECT * FROM pages WHERE url = ?
    `).get(url) as any;

    if (!row) return null;

    return this.rowToPageData(row);
  }

  getAllPages(): PageData[] {
    const rows = this.db.prepare(`
      SELECT * FROM pages ORDER BY depth, url
    `).all() as any[];

    return rows.map(row => this.rowToPageData(row));
  }

  getPageCount(): number {
    const result = this.db.prepare(`
      SELECT COUNT(*) as count FROM pages
    `).get() as any;

    return result.count;
  }

  private rowToPageData(row: any): PageData {
    return {
      url: row.url,
      crawlId: row.crawl_id,
      statusCode: row.status_code,
      contentType: row.content_type,
      responseTime: row.response_time,
      size: row.size,
      redirects: JSON.parse(row.redirects || '[]'),
      depth: row.depth,
      isInternal: Boolean(row.is_internal),
      linkedFrom: JSON.parse(row.linked_from || '[]'),
      title: row.title || '',
      metaDescription: row.meta_description || '',
      h1: row.h1 || '',
      h2: JSON.parse(row.h2 || '[]'),
      h3: JSON.parse(row.h3 || '[]'),
      wordCount: row.word_count,
      lang: row.lang || '',
      charset: row.charset || '',
      metaTags: JSON.parse(row.meta_tags || '{}'),
      viewport: row.viewport || '',
      robots: row.robots || '',
      author: '',
      keywords: '',
      generator: '',
      themeColor: '',
      canonicalUrl: row.canonical_url || '',
      jsonLd: JSON.parse(row.json_ld || '[]'),
      schemaOrg: JSON.parse(row.schema_org || '[]'),
      ogTags: JSON.parse(row.og_tags || '{}'),
      twitterTags: JSON.parse(row.twitter_tags || '{}'),
      images: JSON.parse(row.images || '[]'),
      internalLinks: row.internal_links,
      externalLinks: row.external_links,
      hreflang: JSON.parse(row.hreflang || '[]'),
      securityHeaders: {
        contentSecurityPolicy: row.security_headers_csp || null,
        strictTransportSecurity: row.security_headers_hsts || null,
        xFrameOptions: row.security_headers_x_frame || null,
        referrerPolicy: row.security_headers_referrer || null
      },
      headingCounts: {
        h1: row.heading_count_h1 || 0,
        h2: row.heading_count_h2 || 0,
        h3: row.heading_count_h3 || 0,
        h4: row.heading_count_h4 || 0,
        h5: row.heading_count_h5 || 0,
        h6: row.heading_count_h6 || 0
      },
      headingHierarchy: JSON.parse(row.heading_hierarchy || '[]'),
      headingSequentialErrors: JSON.parse(row.heading_sequential_errors || '[]'),
      linkMetrics: {
        externalTargetBlankCount: row.link_ext_target_blank_count || 0,
        externalTargetBlankNoRelCount: row.link_ext_target_blank_no_rel_count || 0,
        protocolRelativeLinksCount: row.link_protocol_relative_count || 0
      },
      analytics: {
        googleAnalytics: Boolean(row.has_google_analytics),
        gtag: Boolean(row.has_gtm),
        ga4Id: row.ga4_id || '',
        gtmId: row.gtm_id || '',
        facebookPixel: Boolean(row.has_facebook_pixel),
        hotjar: Boolean(row.has_hotjar),
        mixpanel: false
      },
      crawledAt: row.crawled_at,
      error: null
    };
  }

  saveLinks(links: LinkData[]): void {
    if (links.length === 0) return;

    const stmt = this.db.prepare(`
      INSERT INTO links (
        crawl_id, source_url, target_url, anchor_text,
        is_internal, target_domain, target_status, placement, discovered_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction((links: LinkData[]) => {
      for (const link of links) {
        stmt.run(
          link.crawlId,
          link.sourceUrl,
          link.targetUrl,
          link.anchorText,
          link.isInternal ? 1 : 0,
          link.targetDomain,
          link.targetStatus,
          link.placement,
          link.discoveredAt
        );
      }
    });

    transaction(links);
  }

  getAllLinks(): LinkData[] {
    const rows = this.db.prepare(`
      SELECT * FROM links ORDER BY source_url, target_url
    `).all() as any[];

    return rows.map(row => ({
      crawlId: row.crawl_id,
      sourceUrl: row.source_url,
      targetUrl: row.target_url,
      anchorText: row.anchor_text || '',
      isInternal: Boolean(row.is_internal),
      targetDomain: row.target_domain,
      targetStatus: row.target_status,
      placement: row.placement as 'navigation' | 'footer' | 'body',
      discoveredAt: row.discovered_at
    }));
  }

  getLinkCount(): number {
    const result = this.db.prepare(`
      SELECT COUNT(*) as count FROM links
    `).get() as any;

    return result.count;
  }

  saveError(error: CrawlError): void {
    const stmt = this.db.prepare(`
      INSERT INTO errors (crawl_id, url, error_type, error_message, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      error.url,
      error.url,
      error.errorType,
      error.message,
      error.timestamp
    );
  }

  getAllErrors(crawlId: string): CrawlError[] {
    const rows = this.db.prepare(`
      SELECT * FROM errors WHERE crawl_id = ? ORDER BY timestamp
    `).all(crawlId) as any[];

    return rows.map(row => ({
      url: row.url,
      errorType: row.error_type as CrawlError['errorType'],
      message: row.error_message,
      timestamp: row.timestamp
    }));
  }

  exportToCsv(outputPath: string): void {
    const query = `
      SELECT 
        url AS "Address",
        status_code AS "Status Code",
        CASE WHEN status_code = 200 THEN 'OK' ELSE 'Error' END AS "Status",
        content_type AS "Content Type",
        size AS "Size (bytes)",
        word_count AS "Word Count",
        title AS "Title",
        title_length AS "Title Length",
        meta_description AS "Meta Description",
        meta_description_length AS "Meta Description Length",
        h1 AS "H1-1",
        LENGTH(h1) AS "H1-1 Length",
        canonical_url AS "Canonical Link Element",
        robots AS "Robots",
        lang AS "Language",
        charset AS "Charset",
        depth AS "Depth",
        is_internal AS "Is Internal",
        linked_from AS "Linked From",
        internal_links AS "Internal Links",
        external_links AS "External Links",
        has_google_analytics AS "Has Google Analytics",
        ga4_id AS "GA4 ID",
        has_gtm AS "Has GTM",
        gtm_id AS "GTM ID"
      FROM pages
      ORDER BY depth, url
    `;

    const rows = this.db.prepare(query).all() as any[];
    const csv = this.generateCsvFromRows(rows);
    writeFileSync(outputPath, csv, 'utf-8');
  }

  private generateCsvFromRows(rows: any[]): string {
    if (rows.length === 0) return '';

    const headers = Object.keys(rows[0]);
    const csvLines = [headers.join(',')];

    for (const row of rows) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvLines.push(values.join(','));
    }

    return csvLines.join('\n');
  }

  close(): void {
    this.db.close();
  }
}
