-- Missing Security Headers - Referrer-Policy (LOW)
-- Pages missing Referrer-Policy header (privacy protection)
-- Priority: LOW
-- Category: security

SELECT 
  url,
  title,
  status_code,
  depth,
  security_headers_referrer
FROM pages
WHERE (security_headers_referrer IS NULL OR security_headers_referrer = '')
  AND status_code = 200
ORDER BY depth ASC
LIMIT 100;
