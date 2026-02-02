-- Missing Security Headers - X-Frame-Options (MEDIUM)
-- Pages missing X-Frame-Options header (clickjacking protection)
-- Priority: MEDIUM
-- Category: security

SELECT 
  url,
  title,
  status_code,
  depth,
  security_headers_x_frame
FROM pages
WHERE (security_headers_x_frame IS NULL OR security_headers_x_frame = '')
  AND status_code = 200
ORDER BY depth ASC
LIMIT 100;
