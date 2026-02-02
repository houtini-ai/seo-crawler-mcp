-- Duplicate H1 Tags (MEDIUM)
-- Multiple pages sharing the same H1 tag
-- Priority: MEDIUM
-- Category: content

SELECT 
  h1,
  COUNT(*) as page_count,
  GROUP_CONCAT(url, '|||') as urls,
  MIN(title) as example_title
FROM pages
WHERE h1 IS NOT NULL 
  AND TRIM(h1) != ''
  AND status_code = 200
GROUP BY h1
HAVING COUNT(*) > 1
ORDER BY page_count DESC
LIMIT 50;
