SELECT unit_type, COUNT(*) as count
FROM lifecycle_units
GROUP BY unit_type
ORDER BY unit_type;
