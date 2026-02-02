/**
 * Core TypeScript types for Crawlee MCP
 * Based on DATA_SCHEMA.md v1.0.0
 */

export interface CrawlConfig {
  crawlId: string;
  startUrl: string;
  maxDepth: number;
  maxPages: number;
  userAgent: 'chrome' | 'googlebot';
  crawlExternal: boolean;
  respectRobots: boolean;
  concurrency: number;
  delay: number;
  timeout: number;
  includeExtensions: string[];
  excludeExtensions: string[];
  includePatterns: string[];
  excludePatterns: string[];
  outputPath: string;
  createdAt: string;
}

export interface CrawlMetadata {
  crawlId: string;
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed';
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  stats: {
    discovered: number;
    crawled: number;
    failed: number;
    skipped: number;
    depth: number;
    speed: number;
  };
  errors: CrawlError[];
}

export interface CrawlError {
  url: string;
  errorType: 'timeout' | 'dns' | 'connection' | 'ssl' | 'auth' | 'not_found' | 'rate_limit' | 'server_error' | 'network' | 'parse' | 'unknown';
  message: string;
  timestamp: string;
}

export interface PageData {
  url: string;
  crawlId: string;
  statusCode: number;
  contentType: string;
  responseTime: number;
  size: number;
  redirects: Redirect[];
  depth: number;
  isInternal: boolean;
  linkedFrom: string[];
  title: string;
  metaDescription: string;
  h1: string;
  h2: string[];
  h3: string[];
  wordCount: number;
  lang: string;
  charset: string;
  metaTags: Record<string, string>;
  viewport: string;
  robots: string;
  author: string;
  keywords: string;
  generator: string;
  themeColor: string;
  canonicalUrl: string;
  jsonLd: any[];
  schemaOrg: SchemaItem[];
  ogTags: Record<string, string>;
  twitterTags: Record<string, string>;
  images: ImageData[];
  internalLinks: number;
  externalLinks: number;
  hreflang: HreflangLink[];
  
  // Security Headers
  securityHeaders: {
    contentSecurityPolicy: string | null;
    strictTransportSecurity: string | null;
    xFrameOptions: string | null;
    referrerPolicy: string | null;
  };
  
  // Heading Structure
  headingCounts: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  headingHierarchy: string[];
  headingSequentialErrors: string[];
  
  // Link Security Metrics
  linkMetrics: {
    externalTargetBlankCount: number;
    externalTargetBlankNoRelCount: number;
    protocolRelativeLinksCount: number;
  };
  
  analytics: {
    googleAnalytics: boolean;
    gtag: boolean;
    ga4Id: string;
    gtmId: string;
    facebookPixel: boolean;
    hotjar: boolean;
    mixpanel: boolean;
  };
  crawledAt: string;
  error: string | null;
}

export interface Redirect {
  from: string;
  to: string;
  statusCode: number;
}

export interface SchemaItem {
  type: string;
  properties: Record<string, string>;
}

export interface ImageData {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface HreflangLink {
  lang: string;
  url: string;
}

export interface LinkData {
  crawlId: string;
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  isInternal: boolean;
  targetDomain: string;
  targetStatus: number | null;
  placement: 'navigation' | 'footer' | 'body';
  discoveredAt: string;
}

export interface RunSeoAuditInput {
  url: string;
  maxPages?: number;
  depth?: number;
  userAgent?: 'chrome' | 'googlebot';
}

export interface RunSeoAuditOutput {
  crawlId: string;
  outputPath: string;
  status: string;
  stats: {
    discovered: number;
    crawled: number;
    failed: number;
    skipped: number;
    depth: number;
    speed: number;
  };
}
