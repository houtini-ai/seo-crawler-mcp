-- Orphan Pages (MEDIUM)
-- Pages not linked from any other internal page
-- Priority: MEDIUM
-- Category: technical

SELECT 
  p.url,
  p.title,
  p.depth,
  p.word_count,
  p.status_code
FROM pages p
WHERE p.url NOT IN (
    SELECT DISTINCT target_url 
    FROM links 
    WHERE is_internal = 1
  )
  AND p.depth > 0
  AND p.status_code = 200
ORDER BY p.word_count DESC, p.depth ASC
LIMIT 100;
