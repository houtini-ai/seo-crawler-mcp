-- Canonical Issues (MEDIUM)
-- Pages where canonical URL differs from actual URL
-- Priority: MEDIUM
-- Category: technical

SELECT 
  url,
  canonical_url,
  title,
  status_code,
  depth
FROM pages
WHERE canonical_url IS NOT NULL 
  AND canonical_url != ''
  AND canonical_url != url
  -- Ignore trailing slash differences (normalize both URLs)
  AND RTRIM(canonical_url, '/') != RTRIM(url, '/')
  AND status_code = 200
ORDER BY depth ASC
LIMIT 100;
