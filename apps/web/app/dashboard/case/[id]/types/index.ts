export interface UserType {
  id: string;
  name: string;
  email: string;
}

export interface LifecycleUnit {
  id: string;
  unit_code: string;
  unit_type: string;
  version_no: number;
  content: string | null;
  file_url: string | null;
  created_at: string;
}

export interface CaseEvent {
  id: string;
  event_type: string;
  actor: UserType;
  created_at: string;
  metadata_json: unknown;
}

export interface Report {
  id: string;
  report_type: string;
  content_md: string;
  status: string;
  created_at: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  proof_file_url: string | null;
  rejection_reason: string | null;
}

export interface CaseDetails {
  id: string;
  case_code: string;
  team_name: string | null;
  school: string | null;
  course_context: string | null;
  user_facing_stage: string;
  internal_status: string;
  payment_status: string;
  created_at: string;
  deadline: string | null;
  owner_auth_user_id: string;
  assigned_supporter_auth_user_id: string | null;
  owner: UserType;
  assigned_supporter: UserType | null;
  checkpoints: {
    id: string;
    checkpoint_code: string;
    lifecycle_units: LifecycleUnit[];
  }[];
  events: CaseEvent[];
  reports: Report[];
  payments: Payment[];
  package?: {
    id: string;
    name: string;
    price: number;
  } | null;
}

export interface Message {
  id: string;
  content: string;
  sender_auth_user_id: string;
  sender_role_snapshot: string;
  created_at: string;
  sender: UserType;
}

export interface Finding {
  field: string;
  status: string;
  evidence: string;
  reason: string;
  question?: string;
  next_action?: string;
}

export interface IntakeData {
  drive_url?: string;
  idea?: string;
  customer?: string;
  pain_point?: string;
  alternatives?: string;
  team_capability?: string;
}
