-- Missing Images (LOW)
-- Pages with no images
-- Priority: LOW
-- Category: optimization

SELECT 
  url,
  title,
  word_count,
  images,
  status_code,
  depth
FROM pages
WHERE (images = '[]' OR images IS NULL OR images = '')
  AND word_count > 300
  AND status_code = 200
ORDER BY word_count DESC
LIMIT 100;
