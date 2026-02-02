-- Broken Internal Links (CRITICAL)
-- Internal links pointing to pages that actually returned HTTP errors (404, 500, etc.)
-- Priority: CRITICAL
-- Category: critical
-- Impact: Poor user experience, wasted crawl budget, and loss of link equity. Users encounter dead ends and search engines waste resources crawling broken links.
-- Fix: View URLs that link to errors using the 'inlinks' tab and export them in bulk. Update broken links to point to correct URLs or remove them. Consider implementing 301 redirects for permanently moved content.
-- Note: This query only reports links to pages that were crawled AND returned errors. Un-crawled links are reported separately in the opportunities category.

SELECT 
  l.source_url,
  l.target_url,
  l.anchor_text,
  l.placement,
  p.status_code,
  COUNT(*) as occurrences
FROM links l
INNER JOIN pages p ON l.target_url = p.url  -- Only check pages we actually crawled
WHERE l.is_internal = 1 
  AND p.status_code >= 400  -- Only actual HTTP errors (404, 500, etc.)
GROUP BY l.target_url, l.source_url, p.status_code
ORDER BY occurrences DESC
LIMIT 100;
