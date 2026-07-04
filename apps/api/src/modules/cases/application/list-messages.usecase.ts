import { listCaseMessages } from "../infrastructure/persistence/case.repository.js";

export async function listMessagesUseCase(caseId: string) {
  return await listCaseMessages(caseId);
}
