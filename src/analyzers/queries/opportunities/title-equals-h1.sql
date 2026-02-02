-- Pages with Title = H1 (OPPORTUNITY)
-- Pages where title and H1 are identical (opportunity for differentiation)
-- Priority: LOW
-- Category: optimization

SELECT 
  url,
  title,
  h1,
  word_count,
  status_code,
  depth
FROM pages
WHERE title = h1
  AND title IS NOT NULL 
  AND TRIM(title) != ''
  AND h1 IS NOT NULL
  AND TRIM(h1) != ''
  AND status_code = 200
ORDER BY word_count DESC
LIMIT 100;
