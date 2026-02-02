-- Server Errors (5xx) (CRITICAL)
-- Pages returning 500, 502, 503, 504 errors
-- Priority: CRITICAL
-- Category: indexability

SELECT 
  url,
  status_code,
  depth,
  linked_from,
  crawled_at
FROM pages
WHERE status_code >= 500 AND status_code < 600
ORDER BY status_code ASC, depth ASC
LIMIT 100;
