ALTER TABLE "document_records"
ADD COLUMN "metadata_json" JSONB;

CREATE TABLE "document_types" (
  "code" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "flow" TEXT NOT NULL,
  "unit_scope" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "document_types_pkey" PRIMARY KEY ("code")
);

CREATE INDEX "document_types_flow_unit_scope_is_active_idx"
ON "document_types"("flow", "unit_scope", "is_active");

INSERT INTO "document_types" ("code", "label", "flow", "unit_scope", "sort_order")
VALUES
  ('revision_document', 'Bản sửa đổi', 'revision', 'version', 10),
  ('revision_attachment', 'Tài liệu bổ sung bản sửa', 'revision', 'version', 20),
  ('supporter_output', 'Output hỗ trợ', 'supporter_output', 'version', 30),
  ('supporter_attachment', 'Tài liệu đính kèm hỗ trợ', 'supporter_output', 'version', 40),
  ('external_feedback', 'Đánh giá bên ngoài', 'external_feedback', 'assessment', 50),
  ('external_evidence', 'Minh chứng bên ngoài', 'external_feedback', 'assessment', 60);