import type { DocumentWriteInput } from "../../documents/application/document-dto.js";

export interface CreateCaseRequest {
  package_id: string;
  school?: string;
  course_context?: string;
  deadline?: string;
  team_context?: {
    project_name?: string;
    group_no?: string;
  };
  contact?: {
    full_name: string;
    student_code: string;
    team_role: string;
    zalo: string;
    email: string;
  };
  current_blocker?: string;
  current_situations?: string[];
  case_summary?: string;
  support_needs?: {
    primary_need: string;
  };
  /** Backward-compatible documents array; fields are validated and canonicalized by the server. */
  documents?: Array<DocumentWriteInput>;
  boundary_confirmations?: string[];
}

export interface SubmitRevisionRequest {
  change_summary: string;
  /** Each document must provide at least one of `file_url` or `drive_url`. */
  documents: Array<DocumentWriteInput>;
  remaining_blockers?: string;
}

export interface UpdateCaseSettingsRequest {
  team_name?: string;
  school?: string;
  course_context?: string;
  group_no?: string;
}
