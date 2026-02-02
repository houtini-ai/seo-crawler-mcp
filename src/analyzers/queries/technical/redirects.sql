-- Redirect Chains (MEDIUM)
-- Pages that redirect (3xx status codes)
-- Priority: MEDIUM
-- Category: technical

SELECT 
  url,
  status_code,
  canonical_url,
  depth,
  redirects
FROM pages
WHERE status_code >= 300 AND status_code < 400
ORDER BY status_code ASC, depth ASC
LIMIT 100;
