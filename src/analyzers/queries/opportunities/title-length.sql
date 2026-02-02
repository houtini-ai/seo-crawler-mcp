-- Title Length Issues (MEDIUM)
-- Titles that are too short (< 30 chars) or too long (> 60 chars)
-- Priority: MEDIUM
-- Category: optimization

SELECT 
  url,
  title,
  title_length,
  status_code,
  depth,
  CASE 
    WHEN title_length < 30 THEN 'Too Short'
    WHEN title_length > 60 THEN 'Too Long'
  END as issue_type
FROM pages
WHERE (title_length < 30 OR title_length > 60)
  AND title IS NOT NULL 
  AND TRIM(title) != ''
  AND status_code = 200
ORDER BY 
  CASE 
    WHEN title_length < 30 THEN 1
    ELSE 2
  END,
  title_length ASC
LIMIT 100;
