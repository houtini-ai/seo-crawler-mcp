-- Missing Security Headers - CSP (MEDIUM)
-- Pages missing Content-Security-Policy header
-- Priority: MEDIUM
-- Category: security

SELECT 
  url,
  title,
  status_code,
  depth,
  security_headers_csp
FROM pages
WHERE (security_headers_csp IS NULL OR security_headers_csp = '')
  AND status_code = 200
ORDER BY depth ASC
LIMIT 100;
