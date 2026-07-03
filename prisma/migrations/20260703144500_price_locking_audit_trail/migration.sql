ALTER TABLE "service_packages"
  ADD COLUMN "previous_price" INTEGER,
  ADD COLUMN "last_price_changed_at" TIMESTAMP(3),
  ADD COLUMN "last_price_changed_by" TEXT;

ALTER TABLE "cases"
  ADD COLUMN "locked_price" INTEGER;

CREATE INDEX "service_packages_last_price_changed_by_idx"
  ON "service_packages"("last_price_changed_by");

ALTER TABLE "service_packages"
  ADD CONSTRAINT "service_packages_last_price_changed_by_fkey"
  FOREIGN KEY ("last_price_changed_by") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

WITH payment_backfill AS (
  SELECT DISTINCT ON (p.case_id)
    p.case_id,
    p.amount
  FROM "payments" p
  WHERE p.amount IS NOT NULL
  ORDER BY p.case_id, p.created_at ASC, p.id ASC
)
UPDATE "cases" c
SET "locked_price" = COALESCE(pb.amount, sp.price)
FROM "service_packages" sp
LEFT JOIN payment_backfill pb ON pb.case_id = c.id
WHERE c.package_id = sp.id
  AND c.locked_price IS NULL;
