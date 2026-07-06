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
  locked_price?: number | null;
  assigned_supporter_auth_user_id?: string | null;
  user_facing_stage: "submitted" | "need_more_information" | "under_review" | "report_ready" | "waiting_for_revision" | "revision_submitted" | "completed" | "rejected" | "closed" | "triage_accepted" | string;
  internal_status: "triage_pending" | "accepted_unassigned" | "assigned" | "waiting_user" | "supporter_working" | "report_ready_to_publish" | "done" | "cancelled" | string;
  payment_status: "unpaid" | "not_required" | "awaiting_confirmation" | "pending" | "proof_submitted" | "paid" | "rejected" | "expired" | "refunded" | string;
  deadline?: string | null;
  triage_accepted_at?: string | null;
  package_confirmed_at?: string | null;
  payment_window_expires_at?: string | null;
  expired_at?: string | null;
  proposed_package_id?: string | null;
  proposed_locked_price?: number | null;
  package_change_reason?: string | null;
  created_at: string;
  updated_at: string;

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

export interface DocumentWorkspace {
  selected_checkpoint_id: string | null;
  checkpoints: DocumentCheckpoint[];
}

export interface DocumentCheckpoint {
  checkpoint_id: string;
  checkpoint_code: string;
  overview: DocumentCheckpointOverview;
  version_units: DocumentUnit[];
  assessment_units: DocumentUnit[];
  /** Additive UI-facing collections for 3-tab workspace */
  support_flow_documents: DocumentUnit[];
  external_feedback_documents: ExternalFeedbackUnit[];
  latest_version_no: number;
}

export interface ExternalFeedbackUnit {
  unit_code: string;
  assessment_no: number;
  linked_version_no: number | null;
  files: DocumentFile[];
  metadata: ExternalFeedbackMetadata | null;
}

export interface ExternalFeedbackMetadata {
  source: "lecturer" | "mentor" | "other";
  source_other_text?: string | null;
  timing: "pre_support" | "post_support";
  selected_version_no: number;
}

export interface DocumentCheckpointOverview {
  total_files: number;
  version_count: number;
  assessment_count: number;
  selected_label: string;
}

export interface DocumentUnit {
  unit_code: string;
  version_no: number;
  assessment_no: number;
  linked_version_no: number | null;
  files: DocumentFile[];
}

export interface DocumentFile {
  id: string;
  seq: number;
  is_primary: boolean;
  doc_type?: string | null;
  doc_type_label?: string | null;
  source_kind: "drive" | "cloudinary" | "generated";
  canonical_name: string | null;
  original_name: string | null;
  extension: string | null;
  mime_type: string | null;
  file_url: string | null;
  download_url: string | null;
  open_action: "open_url_new_tab" | "download" | null;
  download_action: "open_url_new_tab" | "download" | null;
  uploaded_by_name?: string | null;
  uploaded_by_role?: string | null;
  created_at?: string | null;
}

export interface StatusThemeDetails {
  label: string;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

export const studentStatusMap: Record<string, StatusThemeDetails> = {
  submitted: {
    label: "Chờ xét duyệt",
    color: "primary",
  },
  triage_accepted: {
    label: "Đã tiếp nhận",
    color: "primary",
  },
  need_more_information: {
    label: "Cần bổ sung thông tin",
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
    label: "Hoàn tất — Đã đóng",
    color: "success",
  },
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
};

export const supporterStatusMap: Record<string, StatusThemeDetails> = {
  triage_pending: {
    label: "Chờ duyệt",
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
    label: "Chờ phản hồi từ học viên",
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

export const paymentStatusMap: Record<string, StatusThemeDetails> = {
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
  awaiting_confirmation: {
    label: "Chờ xác nhận gói dịch vụ",
    color: "warning",
  },
  pending: {
    label: "Chờ thanh toán",
    color: "warning",
  },
  proof_submitted: {
    label: "Đang xác minh thanh toán",
    color: "primary",
  },
  expired: {
    label: "Hết hạn thanh toán",
    color: "danger",
  },
  refunded: {
    label: "Đã hoàn tiền",
    color: "default",
  },
  not_required: {
    label: "Miễn phí",
    color: "success",
  },
  rejected: {
    label: "Thanh toán bị từ chối",
    color: "danger",
  },
};

// For backward compatibility and general lookup
export const statusThemeMap: Record<string, StatusThemeDetails> = {
  ...studentStatusMap,
  ...supporterStatusMap,
  ...paymentStatusMap,
  submitted: {
    label: "Hồ sơ đã gửi — chờ xét duyệt",
    color: "primary",
  },
  need_more_information: {
    label: "Cần bổ sung tài liệu",
    color: "warning",
  },
  waiting_user: {
    label: "Chờ phản hồi",
    color: "warning",
  },
};

export type PipelineStepKey = "intake" | "confirm" | "payment" | "review" | "report" | "revision" | "done" | "rejected";

export interface PipelineStage {
  key: "intake" | "confirm" | "payment" | "review" | "report" | "revision" | "done";
  label: string;
}

export const PIPELINE_STAGES: readonly PipelineStage[] = [
  { key: "intake", label: "Gửi hồ sơ" },
  { key: "confirm", label: "Tiếp nhận" },
  { key: "payment", label: "Thanh toán" },
  { key: "review", label: "Phản biện" },
  { key: "report", label: "Báo cáo" },
  { key: "revision", label: "Sửa bài" },
  { key: "done", label: "Hoàn thành" },
] as const;

export function getPipelineStep(stage: string, versionNo?: number, paymentStatus?: string): { stepKey: PipelineStepKey; stepIndex: number } {
  const version = versionNo ?? 1;

  if (["completed", "closed"].includes(stage)) {
    return { stepKey: "done", stepIndex: 6 };
  }
  if (stage === "rejected") {
    return { stepKey: "rejected", stepIndex: -1 };
  }

  // Revision Loop: stay at revision step during cycles if version >= 2
  if (version >= 2) {
    if (["under_review", "report_ready", "waiting_for_revision", "revision_submitted", "need_more_information"].includes(stage)) {
      return { stepKey: "revision", stepIndex: 5 };
    }
  }

  switch (stage) {
    case "submitted":
      return { stepKey: "confirm", stepIndex: 1 };
    case "triage_accepted":
      // triage_accepted + payment not yet paid = payment step
      if (!paymentStatus || paymentStatus !== "paid") {
        return { stepKey: "payment", stepIndex: 2 };
      }
      // triage_accepted + paid but not yet under_review = payment done
      return { stepKey: "payment", stepIndex: 2 };
    case "under_review":
    case "need_more_information":
      return { stepKey: "review", stepIndex: 3 };
    case "report_ready":
      return { stepKey: "report", stepIndex: 4 };
    case "waiting_for_revision":
    case "revision_submitted":
      return { stepKey: "revision", stepIndex: 5 };
    default:
      return { stepKey: "intake", stepIndex: 0 };
  }
}
