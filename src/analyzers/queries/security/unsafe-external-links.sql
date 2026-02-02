-- Unsafe External Links (MEDIUM)
-- External links with target="_blank" but missing rel="noopener noreferrer"
-- Priority: MEDIUM
-- Category: security

SELECT 
  url,
  title,
  link_ext_target_blank_count,
  link_ext_target_blank_no_rel_count,
  status_code,
  depth
FROM pages
WHERE link_ext_target_blank_no_rel_count > 0
  AND status_code = 200
ORDER BY link_ext_target_blank_no_rel_count DESC
LIMIT 100;
