-- DataMigration: Align unit_type to spec vocabulary
-- Date: 2026-07-01
-- Context: Code dùng 3 vocabularies (intake/outbound/revision). Spec chốt version/assessment.

-- Step 1: Backup (optional but recommended)
CREATE TABLE IF NOT EXISTS lifecycle_units_backup AS 
SELECT * FROM lifecycle_units 
WHERE created_at < NOW();

-- Step 2: Update existing rows
UPDATE "lifecycle_units"
SET "unit_type" = 'version'
WHERE "unit_type" IN ('intake', 'outbound', 'revision');

-- Step 3: Verify
SELECT unit_type, COUNT(*) as count
FROM lifecycle_units
GROUP BY unit_type;

-- Expected result:
-- unit_type | count
-- ----------+-------
-- version   | <total>

-- Step 4: Rollback nếu cần
-- UPDATE "lifecycle_units"
-- SET "unit_type" = 'intake'
-- WHERE "unit_type" = 'version' AND "unit_code" = 'v00';
-- 
-- UPDATE "lifecycle_units"
-- SET "unit_type" = 'revision'
-- WHERE "unit_type" = 'version' AND "unit_code" != 'v00';
