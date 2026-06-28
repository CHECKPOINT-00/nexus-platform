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
  current_situations?: string[];
  case_summary?: string;
  support_needs?: {
    primary_need: string;
  };
  documents?: Array<{
    drive_url: string;
    document_type: string;
  }>;
  boundary_confirmations?: string[];
}

export interface SubmitRevisionRequest {
  change_summary: string;
  documents: Array<{
    drive_url: string;
    file_url?: string;
  }>;
  remaining_blockers?: string;
}

export interface UpdateCaseSettingsRequest {
  team_name?: string;
  school?: string;
  course_context?: string;
  group_no?: string;
}
