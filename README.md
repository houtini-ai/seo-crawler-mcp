# SEO Crawler MCP - Website Crawler & SEO Analyzer for LLMs

[![npm version](https://img.shields.io/npm/v/@houtini/seo-crawler-mcp.svg)](https://www.npmjs.com/package/@houtini/seo-crawler-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@houtini/seo-crawler-mcp.svg)](https://www.npmjs.com/package/@houtini/seo-crawler-mcp)
[![Build Status](https://github.com/houtini-ai/seo-crawler-mcp/workflows/CI/badge.svg)](https://github.com/houtini-ai/seo-crawler-mcp/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Type Definitions](https://img.shields.io/badge/types-included-blue)](https://www.npmjs.com/package/@houtini/seo-crawler-mcp)
[![Known Vulnerabilities](https://snyk.io/test/github/houtini-ai/seo-crawler-mcp/badge.svg)](https://snyk.io/test/github/houtini-ai/seo-crawler-mcp)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue?style=flat-square)](https://registry.modelcontextprotocol.io)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

**Crawl and analyse your website for errors and issues that probably affect your site's SEO**

I wanted to build on my experience working with the MCP protocol SDK to see just how far we can extend an AI assistant's capabilities. I decided that I'd quite like to build a crawler to check my site's "technical SEO" health and came across Crawlee - which seemed like the ideal library to base the crawl component of my MCP.

What's interesting is that MCP usually indicates a server connection of some sort. This is not so with SEO Crawler MCP. The MCP protocol is probably more powerful than I realised - this is a self-contained application wrapped in the MCP SDK that handles everything locally:

- Smart request scheduling and queue management
- Automatic retry logic and error handling  
- Respectful crawling with configurable delays
- Memory-efficient streaming for large sites
- Better-SQLite3 embedded database storing every crawled page's HTML, metadata, headers, link relationships, and site structure
- Custom SQL analysis engine with 25+ specialised queries detecting content issues, technical SEO problems, security vulnerabilities, and optimisation opportunities

Claude (or your AI assistant of choice) can orchestrate this entire stack through simple function calls. The crawl runs asynchronously, stores everything in SQLite, and then Claude can query that data through natural language - "analyse this crawl for seo opportunities" or "report on internal broken links" - and the MCP server translates that into sophisticated SQL analysis.

**You can also run crawls directly from the terminal** - perfect for large sites or background processing. The CLI mode lets you run a crawl, get the output directory, and then hand that over to Claude for AI-powered analysis via the MCP tools.

### Credits

The core crawling architecture is inspired by the logic and patterns from the [LibreCrawl](https://github.com/libre-crawl/core) project. We've adapted their proven crawling methodology for use within the MCP protocol whilst adding comprehensive SEO analysis capabilities.

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
    "seo-crawler-mcp": {
      "command": "npx",
      "args": ["-y", "@houtini/seo-crawler-mcp"],
      "env": {
        "OUTPUT_DIR": "C:\\seo-audits"
      }
    }
  }
}
```

Restart Claude Desktop. Four tools will be available:
- `seo-crawler-mcp:run_seo_audit`
- `seo-crawler-mcp:analyze_seo`
- `seo-crawler-mcp:query_seo_data`
- `seo-crawler-mcp:list_seo_queries`

### Development Install

```bash
cd C:\MCP\seo-crawler-mcp
npm install
npm run build
```

Then use the local path in your config:

```json
{
  "mcpServers": {
    "seo-crawler-mcp": {
      "command": "node",
      "args": ["C:\\MCP\\seo-crawler-mcp\\build\\index.js"],
      "env": {
        "OUTPUT_DIR": "C:\\seo-audits",
        "DEBUG": "false"
      }
    }
  }
}
```

**Environment Variables:**
- `OUTPUT_DIR`: Directory where crawl results are saved (required)
- `DEBUG`: Set to `"true"` to enable verbose debug logging (optional, default: `"false"`)

**CLI Usage for Local Development:**

When running the CLI from a local build (not installed via npm), use `node` directly:

```bash
# Run crawl
node C:\MCP\seo-crawler-mcp\build\cli.js crawl https://example.com --max-pages=20

# Analyze results
node C:\MCP\seo-crawler-mcp\build\cli.js analyze C:\seo-audits\example.com_2026-02-02_abc123

# List queries
node C:\MCP\seo-crawler-mcp\build\cli.js queries --category=critical
```

---

## CLI Mode (Terminal Usage)

For large crawls or background processing, you can run crawls directly from the terminal.

**Note:** These examples use `npx` for globally installed packages. For local development, see the "Development Install" section above.
      }
    }
  }
}
```

---

## CLI Mode (Terminal Usage)

For large crawls or background processing, you can run crawls directly from the terminal:

### Run a Crawl

```bash
# Basic crawl
npx @houtini/seo-crawler-mcp crawl https://example.com

# Large crawl with custom settings
npx @houtini/seo-crawler-mcp crawl https://example.com --max-pages=5000 --depth=5

# Using Googlebot user agent
npx @houtini/seo-crawler-mcp crawl https://example.com --user-agent=googlebot
```

### Quick Analysis

```bash
# Show summary statistics
npx @houtini/seo-crawler-mcp analyze C:/seo-audits/example.com_2026-02-01_abc123

# Detailed JSON output
npx @houtini/seo-crawler-mcp analyze C:/seo-audits/example.com_2026-02-01_abc123 --format=detailed
```

### List Available Queries

```bash
# All queries
npx @houtini/seo-crawler-mcp queries

# Security queries only
npx @houtini/seo-crawler-mcp queries --category=security

# Critical priority queries
npx @houtini/seo-crawler-mcp queries --priority=CRITICAL
```

### Workflow: Terminal + Claude

1. **Run large crawl from terminal** (runs in background, can close terminal)
   ```bash
   npx @houtini/seo-crawler-mcp crawl https://bigsite.com --max-pages=5000
   ```

2. **Get the output path** from the crawl results
   ```
   Output Path: C:\seo-audits\bigsite.com_2026-02-02T10-15-30_abc123
   ```

3. **In Claude Desktop, analyze with AI**
   ```
   Analyze the crawl at C:\seo-audits\bigsite.com_2026-02-02T10-15-30_abc123
   Show me the critical issues
   What are the biggest SEO problems?
   Give me a detailed report on broken internal links
   ```

This workflow is perfect for:
- Large sites (1000+ pages) where you want the crawl to run overnight
- Multiple sites you want to crawl in batch
- Automated crawling via cron jobs or scheduled tasks
- Keeping terminal-based workflow whilst using Claude for intelligent analysis

---

## How to Use This

### Complete SEO Audit

The typical workflow goes like this:

1. **Crawl the website**
   ```
   Use seo-crawler-mcp to crawl https://example.com with maxPages=2000
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

The analysis engine includes 25 comprehensive SEO checks across five categories:

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
â”œâ”€â”€ crawl-data.db          # SQLite database
â”‚   â”œâ”€â”€ pages              # Every page crawled
â”‚   â”œâ”€â”€ links              # All link relationships
â”‚   â”œâ”€â”€ errors             # Crawl errors
â”‚   â””â”€â”€ crawl_metadata     # Statistics
â”œâ”€â”€ config.json            # Crawl settings
â””â”€â”€ crawl-export.csv       # Optional CSV export
```

---

## Performance

Typical crawl performance metrics:

**Crawl Speed:**
- Medium site (1,500-2,000 pages): ~15 minutes
- 300,000+ link relationships tracked
- Database size: ~15MB for 2,000 pages

**Query Performance:**
- Simple queries: under 10ms
- Complex queries: under 100ms  
- Join queries: under 200ms
- Full analysis: under 600ms

The SQLite approach works well here. Everything stays local, no API rate limits to worry about, and the query performance is more than adequate for SEO analysis.

---

## Limitations

There are 4 additional checks planned for v3.0:

- **Core Web Vitals** - requires Playwright for real browser metrics
- **Robots.txt validation** - needs parser library
- **Readability scoring** - requires text analysis library
- **Mobile rendering issues** - needs device emulation

The current 25 checks cover the most critical aspects of technical SEO that directly impact search engine crawling, indexing, and ranking.

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

The analysis engine includes 28 predefined SQL queries organised by category. Each query includes detailed impact analysis and fix recommendations.

### Critical Issues (4 queries)

**missing-titles**
- **What it finds:** Pages without title tags
- **Why it matters:** Title tags are the most important on-page SEO element. Without them, pages are essentially invisible to search engines.
- **Fix:** Add unique, descriptive title tags (50-60 characters) to all pages immediately.

**broken-internal-links**
- **What it finds:** Internal links pointing to 404/5xx error pages
- **Why it matters:** Broken links hurt crawlability and waste crawl budget. They create dead ends for users and search engines.
- **Fix:** Update or remove broken links. Add redirects for moved pages.

**server-errors**
- **What it finds:** Pages returning 5xx status codes
- **Why it matters:** Indicates server problems that prevent search engines from indexing content.
- **Fix:** Investigate server issues, check error logs, ensure adequate resources.

**not-found-errors**
- **What it finds:** Pages returning 404 status codes
- **Why it matters:** Lost indexing opportunities and poor user experience.
- **Fix:** Add 301 redirects or remove links to non-existent pages.

### Content Quality (7 queries)

**duplicate-titles**
- **What it finds:** Multiple pages sharing identical title tags
- **Why it matters:** Confuses search engines about which page to rank for queries.
- **Fix:** Make each page's title tag unique and descriptive of its specific content.

**duplicate-descriptions**
- **What it finds:** Multiple pages with identical meta descriptions
- **Why it matters:** Reduces click-through rates as snippets look identical in search results.
- **Fix:** Write unique meta descriptions (150-160 characters) for each page.

**duplicate-h1s**
- **What it finds:** Multiple pages sharing the same H1 heading
- **Why it matters:** H1 tags signal page topic - duplicates dilute topical clarity.
- **Fix:** Ensure each page has a unique H1 that accurately describes its content.

**missing-descriptions**
- **What it finds:** Pages without meta description tags
- **Why it matters:** Search engines create their own snippets, often poorly representing content.
- **Fix:** Add compelling meta descriptions (150-160 characters) for all important pages.

**missing-h1s**
- **What it finds:** Pages without H1 headings
- **Why it matters:** H1 is a primary signal of page topic and structure.
- **Fix:** Add descriptive H1 tags to all content pages.

**multiple-h1s**
- **What it finds:** Pages with more than one H1 tag
- **Why it matters:** Dilutes topical focus and confuses heading hierarchy.
- **Fix:** Use only one H1 per page. Convert other H1s to H2 or H3.

**thin-content**
- **What it finds:** Pages with less than 300 words of content
- **Why it matters:** Thin content provides little value and ranks poorly.
- **Fix:** Expand content with valuable information or consolidate into existing pages.

### Technical SEO (5 queries)

**redirect-pages**
- **What it finds:** Pages that redirect to other URLs
- **Why it matters:** Multiple redirects waste crawl budget and slow page loads.
- **Fix:** Update internal links to point directly to final destination.

**redirect-chains**
- **What it finds:** URLs that redirect multiple times before reaching destination
- **Why it matters:** Each redirect adds latency and risks breaking the chain.
- **Fix:** Implement direct redirects from source to final destination.

**orphan-pages**
- **What it finds:** Pages with no internal links pointing to them
- **Why it matters:** Search engines may never discover orphan pages.
- **Fix:** Add internal links from relevant pages to connect orphans to site structure.

**canonical-issues**
- **What it finds:** Pages where canonical URL doesn't match actual URL
- **Why it matters:** Signals duplicate content or indexing preference conflicts.
- **Fix:** Ensure canonical tags point to the correct version of each page.

**non-https-pages**
- **What it finds:** Pages still using HTTP instead of HTTPS
- **Why it matters:** Security risk, ranking penalty, and browser warnings.
- **Fix:** Implement HTTPS across entire site with proper redirects.

### Security (6 queries)

**missing-csp**
- **What it finds:** Pages without Content-Security-Policy headers
- **Why it matters:** Vulnerability to XSS attacks and code injection.
- **Fix:** Implement CSP headers to control resource loading.

**missing-hsts**
- **What it finds:** Pages without Strict-Transport-Security headers
- **Why it matters:** Allows protocol downgrade attacks.
- **Fix:** Add HSTS headers to enforce HTTPS connections.

**missing-x-frame-options**
- **What it finds:** Pages without X-Frame-Options headers
- **Why it matters:** Vulnerability to clickjacking attacks.
- **Fix:** Add X-Frame-Options headers (DENY or SAMEORIGIN).

**missing-referrer-policy**
- **What it finds:** Pages without Referrer-Policy headers
- **Why it matters:** Potential privacy and security leakage.
- **Fix:** Implement appropriate referrer policy for your use case.

**unsafe-external-links**
- **What it finds:** Links with target="_blank" but without rel="noopener"
- **Why it matters:** Security vulnerability allowing opened page to control opener window.
- **Fix:** Add rel="noopener noreferrer" to all target="_blank" links.

**protocol-relative-links**
- **What it finds:** Links using // instead of https://
- **Why it matters:** Can cause mixed content issues and security warnings.
- **Fix:** Use absolute HTTPS URLs for all external resources.

### Optimisation Opportunities (6 queries)

**title-length-issues**
- **What it finds:** Title tags shorter than 30 characters or longer than 60
- **Why it matters:** Too short titles waste opportunity; too long get truncated in search results.
- **Fix:** Aim for 50-60 characters for optimal display in search results.

**description-length-issues**
- **What it finds:** Meta descriptions shorter than 120 or longer than 160 characters
- **Why it matters:** Poor descriptions reduce click-through rates.
- **Fix:** Write descriptions between 150-160 characters for full display.

**title-equals-h1**
- **What it finds:** Pages where title tag matches H1 exactly
- **Why it matters:** Missed opportunity to target different keywords or angles.
- **Fix:** Make title and H1 complementary but not identical for broader keyword coverage.

**no-outbound-links**
- **What it finds:** Pages with zero external links
- **Why it matters:** Can appear spammy or siloed; linking to quality sources builds trust.
- **Fix:** Add relevant external links to authoritative sources where appropriate.

**high-external-links**
- **What it finds:** Pages with excessive external links (20+)
- **Why it matters:** Can appear spammy and leaks PageRank unnecessarily.
- **Fix:** Reduce external links to most relevant and valuable resources.

**missing-images**
- **What it finds:** Pages without any images
- **Why it matters:** Images improve engagement and provide additional ranking signals.
- **Fix:** Add relevant, optimized images with proper alt text.

---

### Using Queries

**In Claude Desktop:**
```
List all available queries
Show me the critical queries only
Run the missing-titles query on my crawl
What does the orphan-pages query check for?
```

**In CLI:**
```bash
# List all queries
seo-crawler-mcp queries

# Filter by category
seo-crawler-mcp queries --category=security

# Filter by priority
seo-crawler-mcp queries --priority=CRITICAL
```

Each query returns:
- Affected URLs
- Relevant context (word count, status codes, etc.)
- Count of affected pages
- Organized by severity

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

### v2.0.1 (2026-02-02)
- Fixed MemoryStorage cleanup bug (added explicit purge in finally block)
- Added CLI mode for terminal-based crawling
- Removed proprietary tool references from documentation
- Ensures guaranteed fresh state between consecutive crawls

### v2.0.0 (2026-02-01)
- Added comprehensive SQL-based analysis engine
- 28 SEO queries covering industry-standard audit requirements
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

**GitHub:** https://github.com/houtini-ai/seo-crawler-mcp  
**Issues:** https://github.com/houtini-ai/seo-crawler-mcp/issues  
**Author:** Richard Baxter <hello@houtini.com>

---

**Tags:** seo, crawler, audit, technical-seo, mcp, crawlee, sqlite, web-scraping, site-analysis
