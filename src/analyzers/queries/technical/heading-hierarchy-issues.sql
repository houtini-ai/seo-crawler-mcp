-- Heading Hierarchy Issues (MEDIUM)
-- Pages with non-sequential heading structures (h1 -> h3, skipping h2)
-- Priority: MEDIUM
-- Category: technical

SELECT 
  url,
  title,
  heading_hierarchy,
  heading_sequential_errors,
  heading_count_h1,
  heading_count_h2,
  heading_count_h3
FROM pages
WHERE heading_sequential_errors IS NOT NULL 
  AND heading_sequential_errors != '[]'
  AND status_code = 200
ORDER BY depth ASC
LIMIT 100;
