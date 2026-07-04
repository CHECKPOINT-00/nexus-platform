-- DropTable
DROP TABLE "lifecycle_units_backup";

-- CreateTable
CREATE TABLE "document_records" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "checkpoint_id" TEXT NOT NULL,
    "lifecycle_unit_id" TEXT,
    "unit_code" TEXT,
    "direction" TEXT,
    "doc_type" TEXT NOT NULL DEFAULT 'generic',
    "seq" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "source_kind" TEXT NOT NULL,
    "canonical_name" TEXT,
    "original_name" TEXT,
    "extension" TEXT,
    "mime_type" TEXT,
    "file_url" TEXT,
    "download_url" TEXT,
    "cloudinary_public_id" TEXT,
    "uploaded_by_auth_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_records_case_id_idx" ON "document_records"("case_id");

-- CreateIndex
CREATE INDEX "document_records_checkpoint_id_idx" ON "document_records"("checkpoint_id");

-- CreateIndex
CREATE INDEX "document_records_lifecycle_unit_id_idx" ON "document_records"("lifecycle_unit_id");

-- CreateIndex
CREATE INDEX "document_records_uploaded_by_auth_user_id_idx" ON "document_records"("uploaded_by_auth_user_id");

-- CreateIndex
CREATE INDEX "document_records_case_id_checkpoint_id_idx" ON "document_records"("case_id", "checkpoint_id");

-- CreateIndex
CREATE INDEX "document_records_case_id_source_kind_idx" ON "document_records"("case_id", "source_kind");

-- AddForeignKey
ALTER TABLE "document_records" ADD CONSTRAINT "document_records_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_records" ADD CONSTRAINT "document_records_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_records" ADD CONSTRAINT "document_records_lifecycle_unit_id_fkey" FOREIGN KEY ("lifecycle_unit_id") REFERENCES "lifecycle_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_records" ADD CONSTRAINT "document_records_uploaded_by_auth_user_id_fkey" FOREIGN KEY ("uploaded_by_auth_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
