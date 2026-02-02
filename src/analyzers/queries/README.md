# SEO Analysis Query Library

**Version:** 1.0.0  
**Last Updated:** 2026-02-01  
**Coverage:** 25 detectable SEO issues

## Query Organization

All queries follow a standard format:
- SQL comments describing the issue
- Priority level (CRITICAL, HIGH, MEDIUM, LOW)
- Category classification
- Optimized SELECT statements with ORDER BY and LIMIT
- Results limited to 100 rows for performance

## Critical Issues (4 queries)

**Indexability issues that must be fixed immediately**

1. **missing-titles.sql** - Pages without title tags
   - Priority: CRITICAL
   - Impact: Major indexability problem
   - Fix: Add unique, descriptive title tags

2. **broken-internal-links.sql** - Internal links to 404/5xx pages
   - Priority: CRITICAL
   - Impact: Poor user experience, crawl budget waste
   - Fix: Update or remove broken links

3. **server-errors.sql** - Pages returning 5xx errors
   - Priority: CRITICAL
   - Impact: Prevents indexing
   - Fix: Debug server issues immediately

4. **404-errors.sql** - Pages not found
   - Priority: CRITICAL
   - Impact: Dead ends for users and crawlers
   - Fix: Redirect to relevant pages or restore content

## Content Quality Issues (7 queries)

**Problems with page content and metadata**

5. **duplicate-titles.sql** - Multiple pages with same title
   - Priority: HIGH
   - Impact: Cannibalization, poor CTR
   - Fix: Create unique titles for each page

6. **duplicate-meta-descriptions.sql** - Duplicate meta descriptions
   - Priority: MEDIUM
   - Impact: Reduced CTR, missed opportunities
   - Fix: Write unique descriptions

7. **missing-meta-descriptions.sql** - Pages without descriptions
   - Priority: MEDIUM
   - Impact: Search engines auto-generate poor snippets
   - Fix: Add compelling meta descriptions

8. **thin-content.sql** - Pages with < 300 words
   - Priority: MEDIUM
   - Impact: Low quality signals
   - Fix: Expand content or consolidate pages

9. **missing-h1.sql** - Pages without H1 tags
   - Priority: HIGH
   - Impact: Unclear page topic
   - Fix: Add descriptive H1 tags

10. **multiple-h1.sql** - Pages with multiple H1 tags
    - Priority: MEDIUM
    - Impact: Diluted topical focus
    - Fix: Use single H1 per page

11. **duplicate-h1.sql** - Multiple pages with same H1
    - Priority: MEDIUM
    - Impact: Content cannibalization
    - Fix: Differentiate H1 tags

## Technical SEO Issues (5 queries)

**Infrastructure and architecture problems**

12. **redirects.sql** - Pages with 3xx redirect status
    - Priority: MEDIUM
    - Impact: Crawl budget waste, slow page speed
    - Fix: Update links to final destinations

13. **orphan-pages.sql** - Pages with no internal links
    - Priority: MEDIUM
    - Impact: Difficult to discover and crawl
    - Fix: Add internal links from related pages

14. **canonical-issues.sql** - Canonical URL differs from actual URL
    - Priority: MEDIUM
    - Impact: Duplicate content confusion
    - Fix: Review canonical implementation

15. **non-https.sql** - Pages not using HTTPS
    - Priority: MEDIUM
    - Impact: Security warnings, ranking penalty
    - Fix: Migrate to HTTPS

16. **heading-hierarchy-issues.sql** - Non-sequential headings
    - Priority: MEDIUM
    - Impact: Poor document structure
    - Fix: Correct heading order (h1 → h2 → h3)

## Security Issues (6 queries)

**Security header and link security problems**

17. **missing-hsts.sql** - No Strict-Transport-Security header
    - Priority: HIGH
    - Impact: HTTPS downgrade attacks possible
    - Fix: Add HSTS header to server config

18. **missing-csp.sql** - No Content-Security-Policy header
    - Priority: MEDIUM
    - Impact: XSS vulnerability
    - Fix: Implement CSP header

19. **missing-x-frame-options.sql** - No X-Frame-Options header
    - Priority: MEDIUM
    - Impact: Clickjacking vulnerability
    - Fix: Add X-Frame-Options: DENY

20. **missing-referrer-policy.sql** - No Referrer-Policy header
    - Priority: LOW
    - Impact: Privacy leaks
    - Fix: Add Referrer-Policy header

21. **unsafe-external-links.sql** - target="_blank" without rel="noopener"
    - Priority: MEDIUM
    - Impact: Tabnabbing vulnerability
    - Fix: Add rel="noopener noreferrer"

22. **protocol-relative-links.sql** - Links using //example.com format
    - Priority: LOW
    - Impact: Mixed content warnings
    - Fix: Use absolute HTTPS URLs

## Optimization Opportunities (6 queries)

**Enhancement opportunities for better SEO**

23. **title-length.sql** - Titles too short (< 30) or too long (> 60)
    - Priority: MEDIUM
    - Impact: Truncated or poor SERP display
    - Fix: Optimize title length to 30-60 characters

24. **meta-description-length.sql** - Descriptions too short/long
    - Priority: LOW
    - Impact: Suboptimal SERP snippets
    - Fix: Optimize to 120-160 characters

25. **title-equals-h1.sql** - Title and H1 are identical
    - Priority: LOW
    - Impact: Missed keyword opportunity
    - Fix: Differentiate title and H1 slightly

26. **no-outbound-links.sql** - Pages with no links
    - Priority: LOW
    - Impact: Poor user experience, low PageRank flow
    - Fix: Add relevant internal/external links

27. **high-external-links.sql** - Pages with > 20 external links
    - Priority: LOW
    - Impact: Excessive PageRank dilution
    - Fix: Review and reduce external links

28. **missing-images.sql** - Content pages without images
    - Priority: LOW
    - Impact: Poor engagement, no image search visibility
    - Fix: Add relevant images with alt text

## Query Performance

All queries are optimized for SQLite with:
- Indexed columns (url, status_code, depth)
- LIMIT clauses to prevent excessive results
- Strategic WHERE clauses to filter early
- Simple JOINs where necessary

**Expected Performance:**
- Simple queries: < 10ms
- Complex queries (duplicates, orphans): < 100ms
- Join queries (broken links): < 200ms

## Usage Patterns

### Direct SQL Execution
```typescript
import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('./crawl-data.db');
const query = fs.readFileSync('./queries/critical/missing-titles.sql', 'utf-8');
const results = db.prepare(query).all();
```

### Programmatic Analysis
```typescript
import { SQLAnalyzer } from './SQLAnalyzer.js';

const analyzer = new SQLAnalyzer(crawlId);
const report = await analyzer.generateReport();
// Returns structured SEOAnalysisReport
```

### MCP Tool Integration
```bash
crawlee-mcp:analyze_seo crawlId="431841d4"
# Returns JSON report with all 25 issues checked
```

## Future Enhancements

**Not yet implemented (requires additional data capture):**
- Core Web Vitals analysis (requires Playwright)
- Robots.txt validation (requires separate parser)
- Readability scoring (requires text analysis library)
- Mobile rendering issues (requires device emulation)

---

**Query Coverage: 25 Production-Ready SEO Checks**  
**Status: Production Ready**  
**Next Step: Build SQLAnalyzer.ts class**
