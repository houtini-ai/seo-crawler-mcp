-- Thin Content (MEDIUM)
-- Pages with insufficient content (< 300 words)
-- Priority: MEDIUM
-- Category: content

SELECT 
  url,
  title,
  word_count,
  status_code,
  depth,
  internal_links
FROM pages
WHERE word_count < 300
  AND status_code = 200
  AND content_type LIKE '%text/html%'
ORDER BY word_count ASC
LIMIT 100;
