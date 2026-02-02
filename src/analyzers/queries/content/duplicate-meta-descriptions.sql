-- Duplicate Meta Descriptions (MEDIUM)
-- Multiple pages sharing the same meta description
-- Priority: MEDIUM
-- Category: content

SELECT 
  meta_description,
  COUNT(*) as page_count,
  GROUP_CONCAT(url, '|||') as urls,
  MIN(title) as example_title
FROM pages
WHERE meta_description IS NOT NULL 
  AND TRIM(meta_description) != ''
  AND status_code = 200
GROUP BY meta_description
HAVING COUNT(*) > 1
ORDER BY page_count DESC
LIMIT 50;
