-- Missing Meta Descriptions (MEDIUM)
-- Pages without meta descriptions
-- Priority: MEDIUM
-- Category: content
-- Impact: Search engines auto-generate snippets which are often poor quality and don't entice clicks. Missed opportunity to control your SERP messaging and improve click-through rates.
-- Fix: Write unique, compelling meta descriptions (120-160 characters) for key pages. Focus on benefits and include a call-to-action. Avoid duplicating title tag content.

SELECT 
  url,
  title,
  word_count,
  depth
FROM pages
WHERE (meta_description IS NULL OR meta_description = '' OR TRIM(meta_description) = '')
  AND status_code = 200
  AND content_type LIKE '%text/html%'
  AND depth <= 5
ORDER BY word_count DESC
LIMIT 100;
