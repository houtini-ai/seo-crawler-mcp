-- Meta Description Length Issues (LOW)
-- Meta descriptions that are too short (< 120 chars) or too long (> 160 chars)
-- Priority: LOW
-- Category: optimization

SELECT 
  url,
  title,
  meta_description,
  meta_description_length,
  status_code,
  CASE 
    WHEN meta_description_length < 120 THEN 'Too Short'
    WHEN meta_description_length > 160 THEN 'Too Long'
  END as issue_type
FROM pages
WHERE (meta_description_length < 120 OR meta_description_length > 160)
  AND meta_description IS NOT NULL 
  AND TRIM(meta_description) != ''
  AND status_code = 200
ORDER BY 
  CASE 
    WHEN meta_description_length < 120 THEN 1
    ELSE 2
  END,
  meta_description_length ASC
LIMIT 100;
