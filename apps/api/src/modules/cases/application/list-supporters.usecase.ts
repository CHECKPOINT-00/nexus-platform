import { listAllSupporters } from "../infrastructure/persistence/case.repository.js";

export async function listSupportersUseCase() {
  return await listAllSupporters();
}
