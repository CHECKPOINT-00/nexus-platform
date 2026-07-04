import { listActiveDocumentTypes } from "../infrastructure/persistence/document-type.repository.js";
import { validateDocumentTypeQuery } from "./validate-document-write.js";

export async function listDocumentTypesUseCase(filters: {
  flow?: string;
  unit_scope?: string;
}) {
  const validated = validateDocumentTypeQuery(filters);
  const items = await listActiveDocumentTypes(validated);

  return {
    items: items.map((item: {
      code: string;
      label: string;
      flow: string;
      unit_scope: string;
      sort_order: number;
    }) => ({
      code: item.code,
      label: item.label,
      flow: item.flow,
      unit_scope: item.unit_scope,
      sort_order: item.sort_order,
    })),
  };
}
