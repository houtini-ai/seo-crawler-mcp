-- High External Link Count (LOW)
-- Pages with unusually high number of external links
-- Priority: LOW
-- Category: optimization

SELECT 
  url,
  title,
  external_links,
  internal_links,
  word_count,
  status_code,
  depth
FROM pages
WHERE external_links > 20
  AND status_code = 200
ORDER BY external_links DESC
LIMIT 100;
