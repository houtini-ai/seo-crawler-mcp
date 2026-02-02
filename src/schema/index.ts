/**
 * Zod validation schemas for Crawlee MCP
 * Based on DATA_SCHEMA.md v1.0.0
 * 
 * These schemas enforce data integrity at runtime
 */

import { z } from 'zod';

export const CrawlConfigSchema = z.object({
  crawlId: z.string().uuid(),
  startUrl: z.string().url(),
  maxDepth: z.number().int().min(1).max(10),
  maxPages: z.number().int().min(1).max(10000),
  userAgent: z.enum(['chrome', 'googlebot']),
  crawlExternal: z.boolean(),
  respectRobots: z.boolean(),
  concurrency: z.number().int().min(1).max(20),
  delay: z.number().min(0),
  timeout: z.number().min(1000),
  includeExtensions: z.array(z.string()),
  excludeExtensions: z.array(z.string()),
  includePatterns: z.array(z.string()),
  excludePatterns: z.array(z.string()),
  outputPath: z.string(),
  createdAt: z.string().datetime()
});

export const CrawlErrorSchema = z.object({
  url: z.string(),
  errorType: z.enum(['timeout', 'network', 'parse', 'unknown']),
  message: z.string(),
  timestamp: z.string().datetime()
});

export const CrawlMetadataSchema = z.object({
  crawlId: z.string().uuid(),
  status: z.enum(['queued', 'running', 'paused', 'completed', 'failed']),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  duration: z.number().nullable(),
  stats: z.object({
    discovered: z.number().int().min(0),
    crawled: z.number().int().min(0),
    failed: z.number().int().min(0),
    skipped: z.number().int().min(0),
    depth: z.number().int().min(0),
    speed: z.number().min(0)
  }),
  errors: z.array(CrawlErrorSchema)
});

export const RedirectSchema = z.object({
  from: z.string().url(),
  to: z.string().url(),
  statusCode: z.number().int()
});

export const SchemaItemSchema = z.object({
  type: z.string(),
  properties: z.record(z.string())
});

export const ImageDataSchema = z.object({
  src: z.string(),
  alt: z.string(),
  width: z.number().nullable(),
  height: z.number().nullable()
});

export const HreflangLinkSchema = z.object({
  lang: z.string(),
  url: z.string().url()
});

export const PageDataSchema = z.object({
  url: z.string().url(),
  crawlId: z.string().uuid(),
  statusCode: z.number().int(),
  contentType: z.string(),
  responseTime: z.number().min(0),
  size: z.number().int().min(0),
  redirects: z.array(RedirectSchema),
  depth: z.number().int().min(0),
  isInternal: z.boolean(),
  linkedFrom: z.array(z.string().url()),
  title: z.string(),
  metaDescription: z.string(),
  h1: z.string(),
  h2: z.array(z.string()),
  h3: z.array(z.string()),
  wordCount: z.number().int().min(0),
  lang: z.string(),
  charset: z.string(),
  metaTags: z.record(z.string()),
  viewport: z.string(),
  robots: z.string(),
  author: z.string(),
  keywords: z.string(),
  generator: z.string(),
  themeColor: z.string(),
  canonicalUrl: z.string(),
  jsonLd: z.array(z.any()),
  schemaOrg: z.array(SchemaItemSchema),
  ogTags: z.record(z.string()),
  twitterTags: z.record(z.string()),
  images: z.array(ImageDataSchema),
  internalLinks: z.number().int().min(0),
  externalLinks: z.number().int().min(0),
  hreflang: z.array(HreflangLinkSchema),
  securityHeaders: z.object({
    contentSecurityPolicy: z.string().nullable(),
    strictTransportSecurity: z.string().nullable(),
    xFrameOptions: z.string().nullable(),
    referrerPolicy: z.string().nullable()
  }),
  headingCounts: z.object({
    h1: z.number().int().min(0),
    h2: z.number().int().min(0),
    h3: z.number().int().min(0),
    h4: z.number().int().min(0),
    h5: z.number().int().min(0),
    h6: z.number().int().min(0)
  }),
  headingHierarchy: z.array(z.string()),
  headingSequentialErrors: z.array(z.string()),
  linkMetrics: z.object({
    externalTargetBlankCount: z.number().int().min(0),
    externalTargetBlankNoRelCount: z.number().int().min(0),
    protocolRelativeLinksCount: z.number().int().min(0)
  }),
  analytics: z.object({
    googleAnalytics: z.boolean(),
    gtag: z.boolean(),
    ga4Id: z.string(),
    gtmId: z.string(),
    facebookPixel: z.boolean(),
    hotjar: z.boolean(),
    mixpanel: z.boolean()
  }),
  crawledAt: z.string().datetime(),
  error: z.string().nullable()
});

export const LinkDataSchema = z.object({
  crawlId: z.string().uuid(),
  sourceUrl: z.string().url(),
  targetUrl: z.string().url(),
  anchorText: z.string(),
  isInternal: z.boolean(),
  targetDomain: z.string(),
  targetStatus: z.number().int().nullable(),
  placement: z.enum(['navigation', 'footer', 'body']),
  discoveredAt: z.string().datetime()
});

export const RunSeoAuditInputSchema = z.object({
  url: z.string().url(),
  maxPages: z.number().int().min(1).max(10000).optional(),
  depth: z.number().int().min(1).max(10).optional(),
  userAgent: z.enum(['chrome', 'googlebot']).optional()
});

export const RunSeoAuditOutputSchema = z.object({
  crawlId: z.string().uuid(),
  outputPath: z.string(),
  status: z.string(),
  stats: z.object({
    discovered: z.number().int().min(0),
    crawled: z.number().int().min(0),
    failed: z.number().int().min(0),
    skipped: z.number().int().min(0),
    depth: z.number().int().min(0),
    speed: z.number().min(0)
  })
});
