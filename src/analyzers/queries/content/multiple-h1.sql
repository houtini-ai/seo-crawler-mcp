-- Multiple H1 Tags (MEDIUM)
-- Pages with more than one H1 tag (can confuse search engines)
-- Priority: MEDIUM
-- Category: content

SELECT 
  url,
  title,
  heading_count_h1,
  h1,
  status_code,
  depth
FROM pages
WHERE heading_count_h1 > 1
  AND status_code = 200
ORDER BY heading_count_h1 DESC, depth ASC
LIMIT 100;
