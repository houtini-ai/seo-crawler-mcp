-- Missing Security Headers - HSTS (HIGH)
-- Pages missing Strict-Transport-Security header
-- Priority: HIGH
-- Category: security

SELECT 
  url,
  title,
  status_code,
  depth,
  security_headers_hsts
FROM pages
WHERE (security_headers_hsts IS NULL OR security_headers_hsts = '')
  AND status_code = 200
  AND url LIKE 'https://%'
ORDER BY depth ASC
LIMIT 100;
