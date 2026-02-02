-- 404 Not Found Errors (CRITICAL)
-- Pages returning 404 errors
-- Priority: CRITICAL
-- Category: indexability

SELECT 
  url,
  depth,
  linked_from,
  crawled_at
FROM pages
WHERE status_code = 404
ORDER BY depth ASC
LIMIT 100;
