import { findManyCasesByRole } from "../infrastructure/persistence/case.repository.js";

export async function listCasesUseCase(session: any) {
  return await findManyCasesByRole(session.user.id, session.user.role);
}
