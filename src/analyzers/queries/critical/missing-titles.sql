-- Missing Title Tags (CRITICAL)
-- Pages without title tags - catastrophic for SEO
-- Priority: CRITICAL
-- Category: critical
-- Impact: Pages are essentially invisible to search engines. Title tags are the most important on-page SEO element and their absence prevents proper indexing and ranking.
-- Fix: Add unique, descriptive title tags (50-60 characters) to all pages immediately. Include primary keywords and brand name where appropriate.

SELECT 
  url,
  word_count,
  heading_count_h1
FROM pages
WHERE (title IS NULL OR title = '' OR TRIM(title) = '')
  AND status_code = 200
  AND depth <= 5
ORDER BY word_count DESC
LIMIT 100;
