-- Non-HTTPS Pages (MEDIUM)
-- Pages not using HTTPS protocol
-- Priority: MEDIUM
-- Category: technical

SELECT 
  url,
  title,
  status_code,
  depth,
  linked_from
FROM pages
WHERE url NOT LIKE 'https://%'
  AND status_code = 200
ORDER BY depth ASC
LIMIT 100;
