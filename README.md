# Crawlee MCP - an SEO Site Crawler for LLMs

[![npm version](https://img.shields.io/npm/v/@houtini/crawlee-mcp.svg)](https://www.npmjs.com/package/@houtini/crawlee-mcp)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue?style=flat-square)](https://registry.modelcontextprotocol.io)
[![Known Vulnerabilities](https://snyk.io/test/github/houtini-ai/crawlee-mcp/badge.svg)](https://snyk.io/test/github/houtini-ai/crawlee-mcp)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

**Crawl and analyse your website for errors and issues that probably affect your site's SEO**

I wanted to build on my experience working with the MCP protocol SDK to see just how far we can extend an AI assistant's capabilities. I decided that I'd quite like to build a crawler to check my site's "technical SEO" health and came across Crawlee - which seemed like the ideal library to base the crawl component of my MCP.

What's interesting is that MCP usually indicates a server connection of some sort. This is not so with Crawlee MCP. The MCP protocol is probably more powerful than I realised - this is a self-contained application wrapped in the MCP SDK that handles everything locally:

- Smart request scheduling and queue management
- Automatic retry logic and error handling  
- Respectful crawling with configurable delays
- Memory-efficient streaming for large sites
- Better-SQLite3 embedded database storing every crawled page's HTML, metadata, headers, link relationships, and site structure
- Custom SQL analysis engine with 25+ specialised queries detecting content issues, technical SEO problems, security vulnerabilities, and optimisation opportunities

Claude (or your AI assistant of choice) can orchestrate this entire stack through simple function calls. The crawl runs asynchronously, stores everything in SQLite, and then Claude can query that data through natural language - "analyse this crawl for seo opportunities" or "report on internal broken links" - and the MCP server translates that into sophisticated SQL analysis.

You can also run it in terminal for larger crawls over 1000 pages.

---

## Installation

### For Beginners

If you're new to MCP servers, I'd recommend reading these first:
- [How to Add an MCP Server to Claude Desktop](https://houtini.com/how-to-add-an-mcp-server-to-claude-desktop/)
- [Claude Desktop Beginner's Guide](https://houtini.com/claude-desktop-beginners-guide/)

I'd also suggest installing [Desktop Commander](https://houtini.com/desktop-commander/) first - it's useful for working with the crawl output files. See the [Desktop Commander setup guide](https://github.com/wonderwhy-er/DesktopCommanderMCP) for details.

### Quick Install (NPX)

Add this to your Claude Desktop config file:

**Windows:** `C:\Users\[YourName]\AppData\Roaming\Claude\claude_desktop_config.json`  
**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "crawlee-mcp": {
      "command": "npx",
      "args": ["-y", "@houtini/crawlee-mcp"],
      "env": {
        "OUTPUT_DIR": "C:\\seo-audits"
      }
    }
  }
}
```

Restart Claude Desktop. Four tools will be available:
- `crawlee-mcp:run_seo_audit`
- `crawlee-mcp:analyze_seo`
- `crawlee-mcp:query_seo_data`
- `crawlee-mcp:list_seo_queries`

### Development Install

```bash
cd C:\MCP\crawlee-mcp
npm install
npm run build
```

Then use the local path in your config:

```json
{
  "mcpServers": {
    "crawlee-mcp": {
      "command": "node",
      "args": ["C:\\MCP\\crawlee-mcp\\build\\index.js"],
      "env": {
        "OUTPUT_DIR": "C:\\seo-audits"
      }
    }
  }
}
```

---

## How to Use This

### Complete SEO Audit

The typical workflow goes like this:

1. **Crawl the website**
   ```
   Use crawlee-mcp to crawl https://example.com with maxPages=2000
   ```

2. **Run the analysis**
   ```
   Analyse the crawl at C:/seo-audits/example.com_2026-02-01_abc123
   ```

3. **Investigate specific issues**
   ```
   Show me the broken internal links from that crawl
   ```

Claude handles the rest - calling the right tools, parsing the results, and presenting everything in readable format.

### Security Audit

If you're specifically worried about security headers:

1. **List available security queries**
   ```
   What security checks can you run on an SEO crawl?
   ```

2. **Run security-focused analysis**
   ```
   Check the security issues in crawl C:/seo-audits/example.com_2026-02-01_abc123
   ```

3. **Deep dive on specific problems**
   ```
   Show me all pages with unsafe external links
   ```

---

## What Gets Detected

The analysis engine catches 25 out of 29 issues that Screaming Frog finds. Here's what that covers:

### Critical Issues (4 checks)
- Missing title tags - pages without titles don't rank
- Broken internal links - 404/5xx responses that hurt crawlability
- Server errors - 5xx responses indicating site problems
- 404 errors - broken pages that need fixing or redirecting

### Content Quality (7 checks)
- Duplicate titles across different pages
- Duplicate meta descriptions
- Duplicate H1 tags
- Missing meta descriptions
- Missing H1 tags
- Multiple H1 tags on single pages
- Thin content - pages under 300 words

### Technical SEO (5 checks)
- Redirect chains and loops
- Orphan pages with no internal links
- Canonical URL mismatches
- Non-HTTPS pages still in use
- Heading hierarchy problems (H3 before H2, etc)

### Security (6 checks)
- Missing Content-Security-Policy headers
- Missing HSTS (Strict-Transport-Security)
- Missing X-Frame-Options (clickjacking protection)
- Missing Referrer-Policy
- Unsafe external links (target="_blank" without rel="noopener")
- Protocol-relative links (//example.com)

### Optimisation (6 checks)
- Title tags too long or too short
- Meta descriptions length issues
- Title matches H1 (opportunity for differentiation)
- Pages with no outbound links
- Pages with excessive external links
- Pages missing images

---

## Data Storage

The crawler stores everything in SQLite databases organised by domain and date:

```
C:/seo-audits/example.com_2026-02-01_abc123/
├── crawl-data.db          # SQLite database
│   ├── pages              # Every page crawled
│   ├── links              # All link relationships
│   ├── errors             # Crawl errors
│   └── crawl_metadata     # Statistics
├── config.json            # Crawl settings
└── crawl-export.csv       # Optional CSV export
```

I've tested this on my simracingcockpit.gg site - 1,828 pages, 298,708 link relationships, crawled in 15 minutes. Database came out at 15MB. The analysis queries run in under 600ms even on the full dataset.

---

## Performance

What I've found through testing:

**Crawl Performance:**
- 1,828 pages in 15 minutes
- 298,708 link relationships tracked
- 15MB database size

**Query Performance:**
- Simple queries: under 10ms
- Complex queries: under 100ms  
- Join queries: under 200ms
- Full analysis: under 600ms

The SQLite approach works well here. Everything stays local, no API rate limits to worry about, and the query performance is more than adequate for SEO analysis.

---

## Limitations

There are 4 Screaming Frog checks I haven't implemented yet:

- **Core Web Vitals** - requires Playwright for real browser metrics
- **Robots.txt validation** - needs parser library
- **Readability scoring** - requires text analysis library
- **Mobile rendering issues** - needs device emulation

These missing checks bring coverage to 86%. All are planned for v3.0, but frankly the 25 implemented checks catch most of what matters for technical SEO.

---

## Technical Details

**Built with:**
- TypeScript 5.3
- Crawlee 3.7 (HttpCrawler)
- better-sqlite3 12.6
- Cheerio 1.0 (HTML parsing)
- MCP SDK 1.0

The code uses ES modules throughout, with proper Zod validation on inputs and comprehensive error handling. I've kept the architecture clean - separate modules for crawling, analysis, formatting, and tool definitions.

**Deployment:**
- Local MCP server via Node.js
- No external dependencies
- Configurable output directory  
- Concurrent crawling (5 workers)

---

## MCP Tools Reference

### run_seo_audit

Crawl a website and extract comprehensive SEO data into SQLite.

**Parameters:**
- `url` (required) - Website URL to crawl
- `maxPages` (optional) - Maximum pages to crawl (default: 1000)
- `depth` (optional) - Maximum crawl depth (default: 3)
- `userAgent` (optional) - "chrome" or "googlebot" (default: "chrome")

**Example:**
```typescript
run_seo_audit({
  url: "https://example.com",
  maxPages: 2000,
  depth: 5,
  userAgent: "chrome"
})
```

**Returns:** Crawl ID and output path

---

### analyze_seo

Run comprehensive SEO analysis on a completed crawl.

**Parameters:**
- `crawlPath` (required) - Path to crawl output directory
- `format` (optional) - "structured", "summary", or "detailed" (default: "structured")
- `includeCategories` (optional) - Filter by categories: "critical", "content", "technical", "security", "opportunities"
- `maxExamplesPerIssue` (optional) - Maximum example URLs per issue (default: 10)

**Example:**
```typescript
analyze_seo({
  crawlPath: "C:/seo-audits/example.com_2026-02-01_abc123",
  format: "structured",
  includeCategories: ["critical", "security"],
  maxExamplesPerIssue: 5
})
```

**Returns:** Structured report with issues, affected URLs, and fix recommendations

---

### query_seo_data

Execute specific SEO queries by name.

**Parameters:**
- `crawlPath` (required) - Path to crawl output directory
- `query` (required) - Query name (see list_seo_queries)
- `limit` (optional) - Maximum results (default: 100)

**Example:**
```typescript
query_seo_data({
  crawlPath: "C:/seo-audits/example.com_2026-02-01_abc123",
  query: "broken-internal-links",
  limit: 50
})
```

**Returns:** Query results with affected URLs and context

---

### list_seo_queries

Discover available SEO analysis queries.

**Parameters:**
- `category` (optional) - Filter by category
- `priority` (optional) - Filter by priority level

**Example:**
```typescript
list_seo_queries({
  category: "security",
  priority: "HIGH"
})
```

**Returns:** List of available queries with descriptions and priorities

---

## Available Queries

The analysis engine includes 28 predefined SQL queries organised by category:

**Critical (4):**
- missing-titles
- broken-internal-links  
- server-errors
- not-found-errors

**Content (7):**
- duplicate-titles
- duplicate-descriptions
- duplicate-h1s
- missing-descriptions
- missing-h1s
- multiple-h1s
- thin-content

**Technical (5):**
- redirect-pages
- redirect-chains
- orphan-pages
- canonical-issues
- non-https-pages

**Security (6):**
- missing-csp
- missing-hsts
- missing-x-frame-options
- missing-referrer-policy
- unsafe-external-links
- protocol-relative-links

**Opportunities (6):**
- title-length-issues
- description-length-issues
- title-equals-h1
- no-outbound-links
- high-external-links
- missing-images

---

## Development

```bash
# Build
npm run build

# Development mode
npm run dev

# Run tests
npm test
```

---

## Version History

### v2.0.0 (2026-02-01)
- Added comprehensive SQL-based analysis engine
- 28 SEO queries covering 25 out of 29 Screaming Frog checks
- Three analysis tools: analyze_seo, query_seo_data, list_seo_queries
- 86% coverage of standard SEO audit requirements

### v1.1.0 (2026-02-01)
- Enhanced data collection with security headers
- Heading structure validation (H1-H6)
- Link security analysis
- Response time accuracy improvements

### v1.0.0 (2026-01-31)
- Initial release with SQLite storage
- LibreCrawl pattern implementation
- Basic crawl tool (run_seo_audit)

---

## Licence

Apache License 2.0

Copyright 2026 Richard Baxter

This product includes software developed by Apify and the Crawlee project.
See NOTICE file for details.

---

## Support

**GitHub:** https://github.com/houtini-ai/crawlee-mcp  
**Issues:** https://github.com/houtini-ai/crawlee-mcp/issues  
**Author:** Richard Baxter <richard@houtini.ai>

---

**Tags:** seo, crawler, audit, technical-seo, mcp, crawlee, sqlite, web-scraping, site-analysis