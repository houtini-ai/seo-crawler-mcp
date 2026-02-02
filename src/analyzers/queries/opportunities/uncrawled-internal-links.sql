-- Un-crawled Internal Links (OPPORTUNITIES)
-- Internal links discovered but not crawled (likely due to depth or page limits)
-- Priority: LOW
-- Category: opportunities
-- Impact: These links were discovered during the crawl but not visited, usually because the crawler reached its depth limit or page count limit. Not necessarily broken - just outside the crawl scope.
-- Fix: Review these URLs to determine if they should be included in future crawls. Consider increasing maxPages or maxDiscoveryDepth if important sections of your site are being missed.

SELECT 
  l.source_url,
  l.target_url,
  l.anchor_text,
  l.placement,
  COUNT(*) as occurrences
FROM links l
LEFT JOIN pages p ON l.target_url = p.url
WHERE l.is_internal = 1 
  AND p.url IS NULL  -- Link discovered but page never crawled
GROUP BY l.target_url, l.source_url
ORDER BY occurrences DESC
LIMIT 100;
