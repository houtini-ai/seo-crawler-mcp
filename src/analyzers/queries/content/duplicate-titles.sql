-- Duplicate Title Tags (HIGH)
-- Multiple pages sharing the same title tag
-- Priority: HIGH
-- Category: content
-- Impact: Title duplication causes keyword cannibalization where pages compete against each other. Reduces click-through rates as users can't distinguish between pages in search results.
-- Fix: Create unique, descriptive title tags for each page that accurately reflect the page's specific content and target different keyword variations.

SELECT 
  title,
  GROUP_CONCAT(url, ', ') as duplicate_urls,
  COUNT(*) as count
FROM pages
WHERE title IS NOT NULL 
  AND title != ''
  AND status_code = 200
GROUP BY title
HAVING count > 1
ORDER BY count DESC
LIMIT 100;
