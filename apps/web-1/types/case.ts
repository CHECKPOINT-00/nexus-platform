import { User } from "./user";
import { ServicePackage } from "./package";
import { Payment } from "./payment";

export interface Case {
  id: string;
  case_code: string;
  group_no?: string | null;
  owner_auth_user_id: string;
  team_name?: string | null;
  school?: string | null;
  course_context?: string | null;
  current_checkpoint?: string | null;
  package_id?: string | null;
  assigned_supporter_auth_user_id?: string | null;
  user_facing_stage: "submitted" | "need_more_information" | "under_review" | "report_ready" | "waiting_for_revision" | "revision_submitted" | "completed" | "rejected" | "closed" | string;
  internal_status: "triage_pending" | "accepted_unassigned" | "assigned" | "waiting_user" | "supporter_working" | "report_ready_to_publish" | "done" | "cancelled" | string;
  payment_status: "unpaid" | "pending_verification" | "paid" | "rejected" | string;
  deadline?: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  owner?: User;
  assigned_supporter?: User | null;
  package?: ServicePackage | null;
  members?: CaseMember[];
  checkpoints?: Checkpoint[];
  lifecycle_units?: LifecycleUnit[];
  reports?: Report[];
  payments?: Payment[];
  messages?: CaseMessage[];
  events?: CaseEvent[];
}

export interface CaseMember {
  id: string;
  case_id: string;
  auth_user_id: string;
  role_in_team?: string | null;
  access_level: "owner" | "member" | string;
  created_at: string;
  user?: User;
}

export interface Checkpoint {
  id: string;
  case_id: string;
  checkpoint_code: string;
  checkpoint_status: "draft" | "submitted" | "reviewed" | "approved" | string;
  latest_version_no: number;
  latest_assessment_no: number;
  drive_folder_id?: string | null;
  created_at: string;
  updated_at: string;
  lifecycle_units?: LifecycleUnit[];
  reports?: Report[];
}

export interface LifecycleUnit {
  id: string;
  case_id: string;
  checkpoint_id: string;
  unit_code: string;
  unit_type: string;
  version_no: number;
  assessment_no: number;
  linked_version_no?: number | null;
  drive_folder_id?: string | null;
  content?: string | null;
  file_url?: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  case_id: string;
  checkpoint_id: string;
  lifecycle_unit_id?: string | null;
  audit_round_id?: string | null;
  report_type: string;
  content_md: string;
  status: "draft" | "sent" | "APPROVED" | string;
  created_by: string;
  approved_by_auth_user_id?: string | null;
  sent_at?: string | null;
  document_id?: string | null;
  created_at: string;
  updated_at: string;

  approved_by?: User | null;
  case?: Case;
}

export interface CaseMessage {
  id: string;
  case_id: string;
  sender_auth_user_id: string;
  sender_role_snapshot?: string | null;
  content: string;
  created_at: string;
  sender?: User;
}

export interface CaseEvent {
  id: string;
  case_id: string;
  event_type: string;
  actor_auth_user_id: string;
  document_id?: string | null;
  report_id?: string | null;
  audit_round_id?: string | null;
  payment_id?: string | null;
  meeting_id?: string | null;
  metadata_json?: any;
  created_at: string;
  actor?: User;
  report?: Report | null;
  payment?: Payment | null;
}

export interface StatusThemeDetails {
  label: string;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

export const statusThemeMap: Record<string, StatusThemeDetails> = {
  // User Facing Stages
  submitted: {
    label: "Hồ sơ đã gửi — chờ xét duyệt",
    color: "primary",
  },
  need_more_information: {
    label: "Cần bổ sung tài liệu",
    color: "warning",
  },
  under_review: {
    label: "Đang phản biện",
    color: "primary",
  },
  report_ready: {
    label: "Báo cáo phản biện sẵn sàng",
    color: "success",
  },
  waiting_for_revision: {
    label: "Chờ bản sửa từ nhóm",
    color: "warning",
  },
  revision_submitted: {
    label: "Đã nộp bản sửa",
    color: "primary",
  },
  completed: {
    label: "Hoàn thành",
    color: "success",
  },
  rejected: {
    label: "Bị từ chối",
    color: "danger",
  },
  closed: {
    label: "Đã đóng",
    color: "default",
  },

  // Legacy Checkpoint & internal statuses mapped gracefully
  draft: {
    label: "Bản nháp",
    color: "default",
  },
  approved: {
    label: "Đã duyệt",
    color: "success",
  },
  APPROVED: {
    label: "Đã duyệt",
    color: "success",
  },
  sent: {
    label: "Đã gửi báo cáo",
    color: "success",
  },

  // Payment statuses
  unpaid: {
    label: "Chưa thanh toán",
    color: "warning",
  },
  pending_verification: {
    label: "Chờ duyệt thanh toán",
    color: "warning",
  },
  pendingVerification: {
    label: "Chờ duyệt thanh toán",
    color: "warning",
  },
  paid: {
    label: "Đã thanh toán",
    color: "success",
  },

  // Case/Checkpoint auditing statuses (Internal)
  triage_pending: {
    label: "Chờ triage",
    color: "default",
  },
  accepted_unassigned: {
    label: "Chờ phân công Supporter",
    color: "default",
  },
  assigned: {
    label: "Đã phân công",
    color: "primary",
  },
  waiting_user: {
    label: "Chờ phản hồi",
    color: "warning",
  },
  supporter_working: {
    label: "Supporter đang xử lý",
    color: "primary",
  },
  report_ready_to_publish: {
    label: "Báo cáo chờ gửi",
    color: "success",
  },
  done: {
    label: "Hoàn thành",
    color: "success",
  },
  cancelled: {
    label: "Đã hủy",
    color: "danger",
  },
};
