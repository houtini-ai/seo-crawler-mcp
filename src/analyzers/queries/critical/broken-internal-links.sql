-- Broken Internal Links (CRITICAL)
-- Internal links pointing to pages that don't exist or return errors
-- Priority: CRITICAL
-- Category: critical
-- Impact: Poor user experience, wasted crawl budget, and loss of link equity. Users encounter dead ends and search engines waste resources crawling broken links.
-- Fix: View URLs that link to errors using the 'inlinks' tab and export them in bulk. Update broken links to point to correct URLs or remove them. Consider implementing 301 redirects for permanently moved content.

SELECT 
  l.source_url,
  l.target_url,
  l.anchor_text,
  l.placement,
  COUNT(*) as occurrences
FROM links l
LEFT JOIN pages p ON l.target_url = p.url
WHERE l.is_internal = 1 
  AND (p.url IS NULL OR p.status_code >= 400)
GROUP BY l.target_url, l.source_url
ORDER BY occurrences DESC
LIMIT 100;
