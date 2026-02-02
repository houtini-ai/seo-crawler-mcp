-- Pages with No Outbound Links (LOW)
-- Pages with no internal or external links
-- Priority: LOW
-- Category: optimization

SELECT 
  url,
  title,
  word_count,
  internal_links,
  external_links,
  status_code,
  depth
FROM pages
WHERE (internal_links = 0 AND external_links = 0)
  AND status_code = 200
ORDER BY word_count DESC, depth ASC
LIMIT 100;
