"use client";

import React from "react";
import { Modal, Button, Badge, Loader } from "@mantine/core";
import { ExternalLink } from "lucide-react";
import { useAdminCaseDetail } from "../hooks/useAdminCases";

interface AdminCaseDetailModalProps {
  caseId: string | null;
  onClose: () => void;
  onReject: (caseId: string) => void;
  onRequestMoreInfo: (caseId: string) => void;
  onApprove: (caseId: string) => void;
  onAssign: (caseId: string) => void;
}

export default function AdminCaseDetailModal({
  caseId,
  onClose,
  onReject,
  onRequestMoreInfo,
  onApprove,
  onAssign,
}: AdminCaseDetailModalProps) {
  const { data: detailData, isLoading: isFetchingDetail, error: queryError } = useAdminCaseDetail(caseId);

  const error = queryError
    ? (queryError as any)?.response?.data?.error || (queryError as any)?.message || "Không thể tải chi tiết dự án."
    : null;

  return (
    <Modal
      opened={caseId !== null}
      onClose={onClose}
      title={
        <span className="font-heading font-bold text-base text-text-app">
          Chi tiết dự án: {detailData?.case?.case_code || (isFetchingDetail ? "Đang tải..." : "")}
        </span>
      }
      size="lg"
      centered
    >
      <div className="space-y-6 font-body text-sm text-text-app max-h-[70vh] overflow-y-auto pr-1">
        {isFetchingDetail ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-muted">
            <Loader size="md" color="blue" />
            <p className="text-xs">Đang tải thông tin chi tiết dự án...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-danger font-semibold text-xs">
            {error}
          </div>
        ) : !detailData ? null : (
          <div className="space-y-6">
            {/* Section 1: General Info */}
            <div>
              <h4 className="font-heading font-bold text-sm text-text-app mb-3">
                Thông tin chung
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-surface-app p-5 rounded-xl border border-border-app shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs text-text-subtle font-medium">Tên nhóm / Dự án</span>
                  <p className="font-bold text-sm text-text-app break-words break-all whitespace-normal">{detailData.case.team_name || "Chưa đặt tên"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-text-subtle font-medium">Gói dịch vụ</span>
                  <p className="font-bold text-sm text-brand">{detailData.case.package?.name || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-text-subtle font-medium">Trường học</span>
                  <p className="font-semibold text-sm text-text-app break-words break-all whitespace-normal">{detailData.case.school || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-text-subtle font-medium">Bối cảnh môn học</span>
                  <p className="font-semibold text-sm text-text-app break-words break-all whitespace-normal">{detailData.case.course_context || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-text-subtle font-medium">Ngày tạo</span>
                  <p className="text-sm font-medium text-text-app">
                    {new Date(detailData.case.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-text-subtle font-medium">Trạng thái nội bộ</span>
                  <div className="pt-0.5">
                    <Badge
                      color={
                        detailData.case.internal_status === "triage_pending"
                          ? "gray"
                          : detailData.case.internal_status === "accepted_unassigned"
                          ? "yellow"
                          : "green"
                      }
                      variant="light"
                      size="sm"
                    >
                      {detailData.case.internal_status === "triage_pending"
                        ? "Chờ Triage"
                        : detailData.case.internal_status === "accepted_unassigned"
                        ? "Chờ Phân Công"
                        : "Đã phân công"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Info */}
            {detailData.intake_snapshot?.contact && (
              <div>
                <h4 className="font-heading font-bold text-sm text-text-app mb-3">
                  Người liên hệ chính (Đại diện nhóm)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-surface-app p-5 rounded-xl border border-border-app shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-text-subtle font-medium">Họ tên</span>
                    <p className="font-bold text-sm text-text-app break-words break-all whitespace-normal">{detailData.intake_snapshot.contact.full_name || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-subtle font-medium">Mã sinh viên</span>
                    <p className="font-semibold text-sm text-text-app break-words break-all whitespace-normal">{detailData.intake_snapshot.contact.student_code || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-subtle font-medium">Email</span>
                    <p className="text-sm font-medium text-text-app break-words break-all whitespace-normal">{detailData.intake_snapshot.contact.email || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-subtle font-medium">Zalo / Telegram</span>
                    <p className="text-sm font-medium text-text-app break-words break-all whitespace-normal">
                      Zalo: {detailData.intake_snapshot.contact.zalo || "N/A"}
                      {detailData.intake_snapshot.contact.telegram && (
                        <span className="text-text-muted"> | Telegram: {detailData.intake_snapshot.contact.telegram}</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <span className="text-xs text-text-subtle font-medium">Vai trò trong nhóm</span>
                    <p className="text-sm text-text-app break-words break-all whitespace-normal">{detailData.intake_snapshot.contact.team_role || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Idea and Support Needs */}
            <div>
              <h4 className="font-heading font-bold text-sm text-text-app mb-3">
                Ý tưởng &amp; Nhu cầu hỗ trợ
              </h4>
              <div className="space-y-4 bg-surface-app p-5 rounded-xl border border-border-app shadow-sm">
                {detailData.intake_snapshot?.case_summary && (
                  <div className="space-y-1">
                    <span className="text-xs text-text-subtle font-medium">Tóm tắt ý tưởng đề tài</span>
                    <p className="text-sm text-text-app leading-relaxed whitespace-pre-wrap break-words break-all">
                      {detailData.intake_snapshot.case_summary}
                    </p>
                  </div>
                )}

                {detailData.intake_snapshot?.support_needs?.primary_need && (
                  <div className="space-y-1">
                    <span className="text-xs text-text-subtle font-medium">Nhu cầu hỗ trợ chính</span>
                    <p className="text-sm font-medium text-text-app break-words break-all whitespace-normal">
                      {detailData.intake_snapshot.support_needs.primary_need}
                    </p>
                  </div>
                )}

                {detailData.intake_snapshot?.expected_outputs && (
                  <div className="space-y-1">
                    <span className="text-xs text-text-subtle font-medium">Kỳ vọng đầu ra</span>
                    <p className="text-sm text-text-app leading-relaxed whitespace-pre-wrap break-words break-all">
                      {detailData.intake_snapshot.expected_outputs}
                    </p>
                  </div>
                )}

                {detailData.intake_snapshot?.support_needs?.extra_notes && (
                  <div className="space-y-1">
                    <span className="text-xs text-text-subtle font-medium">Ghi chú thêm cho Supporter</span>
                    <p className="text-sm text-text-app leading-relaxed whitespace-pre-wrap break-words break-all">
                      {detailData.intake_snapshot.support_needs.extra_notes}
                    </p>
                  </div>
                )}

                {detailData.intake_snapshot?.lecturer_feedback && (
                  <div className="space-y-1">
                    <span className="text-xs text-text-subtle font-medium">Góp ý từ giảng viên (nếu có)</span>
                    <p className="text-sm text-text-app leading-relaxed whitespace-pre-wrap break-words break-all">
                      {detailData.intake_snapshot.lecturer_feedback}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Documents */}
            {detailData.intake_snapshot?.documents && detailData.intake_snapshot.documents.length > 0 && (
              <div>
                <h4 className="font-heading font-bold text-sm text-text-app mb-3">
                  Tài liệu đính kèm
                </h4>
                <div className="bg-surface-app p-5 rounded-xl border border-border-app shadow-sm divide-y divide-border-app/40">
                  {detailData.intake_snapshot.documents.map((doc: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-3 first:pt-0 last:pb-0 gap-4">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="font-bold text-sm text-text-app truncate">
                          {doc.document_type || "Tài liệu đính kèm"}
                        </p>
                        {doc.role_description && (
                          <p className="text-xs text-text-muted">{doc.role_description}</p>
                        )}
                      </div>
                      {doc.drive_url && (
                        <a
                          href={doc.drive_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-sm text-brand hover:underline shrink-0"
                        >
                          <span>Mở Google Drive</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4 border-t border-border-app gap-3">
          <Button
            onClick={onClose}
            variant="default"
          >
            Đóng
          </Button>

          <div className="flex gap-2">
            {detailData?.case?.internal_status === "triage_pending" && (
              <>
                <Button
                  onClick={() => { if (detailData) { onRequestMoreInfo(detailData.case.id); } }}
                  variant="outline"
                  color="yellow"
                  className="font-semibold cursor-pointer"
                >
                  Yêu cầu làm rõ
                </Button>
                <Button
                  onClick={() => { if (detailData) { onReject(detailData.case.id); } }}
                  variant="outline"
                  color="red"
                  className="font-semibold cursor-pointer"
                >
                  Từ chối
                </Button>
                <Button
                  onClick={() => { if (detailData) { onApprove(detailData.case.id); } }}
                  color="green"
                  className="font-semibold cursor-pointer"
                >
                  Duyệt hồ sơ
                </Button>
              </>
            )}

            {detailData?.case && (detailData.case.internal_status === "accepted_unassigned" || detailData.case.internal_status === "assigned") && (
              <Button
                onClick={() => { if (detailData) { onAssign(detailData.case.id); } }}
                color="brand"
                className="font-semibold cursor-pointer"
              >
                {detailData.case.internal_status === "assigned" ? "Phân công lại" : "Phân công Supporter"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
