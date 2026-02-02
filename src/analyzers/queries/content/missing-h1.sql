-- Missing H1 Tags (HIGH)
-- Pages without H1 headings
-- Priority: HIGH
-- Category: content
-- Impact: H1 tags are critical for SEO and accessibility. Their absence makes it unclear to search engines and users what the page is about. Impacts topic clarity and ranking potential.
-- Fix: Ensure every important page has exactly one descriptive H1 tag that clearly indicates the main topic. Include primary keywords naturally without keyword stuffing.

SELECT 
  url,
  title,
  word_count,
  depth
FROM pages
WHERE (h1 IS NULL OR h1 = '' OR TRIM(h1) = '')
  AND status_code = 200
  AND content_type LIKE '%text/html%'
ORDER BY word_count DESC
LIMIT 100;
