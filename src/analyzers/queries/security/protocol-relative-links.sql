-- Protocol-Relative Links (LOW)
-- Links using protocol-relative URLs (//example.com) which can cause mixed content warnings
-- Priority: LOW
-- Category: security

SELECT 
  url,
  title,
  link_protocol_relative_count,
  status_code,
  depth
FROM pages
WHERE link_protocol_relative_count > 0
  AND status_code = 200
ORDER BY link_protocol_relative_count DESC
LIMIT 100;
