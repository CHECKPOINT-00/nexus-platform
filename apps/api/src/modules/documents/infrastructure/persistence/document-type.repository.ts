import { prisma } from "../../../../db.js";
import type {
  DocumentTypeFlow,
  DocumentUnitScope,
} from "../../domain/document-types.js";

export type DocumentTypeOption = {
  code: string;
  label: string;
  flow: string;
  unit_scope: string;
  is_active: boolean;
  sort_order: number;
};

export async function listActiveDocumentTypes(filters?: {
  flow?: DocumentTypeFlow;
  unit_scope?: DocumentUnitScope;
}): Promise<DocumentTypeOption[]> {
  const rows = await prisma.$queryRaw<Array<DocumentTypeOption>>`
    SELECT code, label, flow, unit_scope, is_active, sort_order
    FROM document_types
    WHERE is_active = true
      AND (${filters?.flow ?? null}::text IS NULL OR flow = ${filters?.flow ?? null})
      AND (${filters?.unit_scope ?? null}::text IS NULL OR unit_scope = ${filters?.unit_scope ?? null})
    ORDER BY sort_order ASC, label ASC
  `;

  return rows;
}

export async function findActiveDocumentTypeByCode(code: string): Promise<DocumentTypeOption | null> {
  const rows = await prisma.$queryRaw<Array<DocumentTypeOption>>`
    SELECT code, label, flow, unit_scope, is_active, sort_order
    FROM document_types
    WHERE code = ${code}
      AND is_active = true
    LIMIT 1
  `;

  return rows[0] ?? null;
}
