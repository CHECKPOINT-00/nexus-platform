"use client";

import React, { useState, useEffect, useRef } from "react";
import { User } from "@/types";
import {
  UserCheck, CheckCircle, Loader2, XCircle, Info,
  MoreVertical, CheckCheck, Ban, HelpCircle, ExternalLink,
  FolderOpen, Target, Users, Mail, Phone, Calendar
} from "lucide-react";
import { Button, Select, ListBox, ListBoxItem, Modal, TextArea, Chip } from "@heroui/react";
import { apiClient } from "@/lib/api-client";

interface AdminCaseAssignmentTableProps {
  cases: any[];
  supporters: User[];
  onAssign: (caseId: string, supporterId: string) => Promise<void>;
  isAssigning: boolean;
  onAccept: (caseId: string) => Promise<void>;
  onReject: (caseId: string, reason: string) => Promise<void>;
  onRequestMoreInfo: (caseId: string, query: string) => Promise<void>;
}

// ─── Row Action Menu ─────────────────────────────────────────────────────────
interface ActionMenuProps {
  item: any;
  isLoading: boolean;
  onAccept: () => void;
  onReject: () => void;
  onInfo: () => void;
  onAssign: () => void;
  onViewDetails: () => void;
}

function ActionMenu({ item, isLoading, onAccept, onReject, onInfo, onAssign, onViewDetails }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isTriage = item.internal_status === "triage_pending";

  const menuItemCls =
    "flex items-center gap-2.5 w-full px-3 py-2 text-[11px] font-body text-text-app hover:bg-surface-soft rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div ref={ref} className="relative flex justify-center">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isLoading}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-soft text-text-muted hover:text-text-app transition-colors cursor-pointer disabled:opacity-40"
        aria-label="Hành động"
      >
        {isLoading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <MoreVertical className="w-4 h-4" />
        }
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 min-w-[200px] bg-surface-app border border-border-strong rounded-xl shadow-xl p-1.5 flex flex-col gap-0.5">
          <button
            className={menuItemCls}
            onClick={() => { setOpen(false); onViewDetails(); }}
          >
            <Info className="w-3.5 h-3.5 text-brand shrink-0" />
            <span>Xem chi tiết</span>
          </button>

          <div className="h-px bg-border-strong/45 my-1" />

          {isTriage ? (
            <>
              <p className="px-3 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wide">Triage</p>
              <button
                className={menuItemCls}
                onClick={() => { setOpen(false); onAccept(); }}
              >
                <CheckCheck className="w-3.5 h-3.5 text-success shrink-0" />
                <span>Duyệt hồ sơ</span>
              </button>
              <button
                className={`${menuItemCls} text-danger`}
                onClick={() => { setOpen(false); onReject(); }}
              >
                <Ban className="w-3.5 h-3.5 shrink-0" />
                <span>Từ chối hồ sơ</span>
              </button>
              <button
                className={`${menuItemCls} text-warning`}
                onClick={() => { setOpen(false); onInfo(); }}
              >
                <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Yêu cầu làm rõ</span>
              </button>
            </>
          ) : (
            <>
              <p className="px-3 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wide">Phân công</p>
              {item.assigned_supporter && (
                <p className="px-3 py-1.5 text-[10px] text-text-muted italic">
                  Supporter hiện tại: <span className="font-semibold text-text-app">{item.assigned_supporter.name}</span>
                </p>
              )}
              <button
                className={menuItemCls}
                onClick={() => { setOpen(false); onAssign(); }}
              >
                <UserCheck className="w-3.5 h-3.5 text-brand shrink-0" />
                <span>{item.assigned_supporter ? "Phân công lại" : "Chọn Supporter"}</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminCaseAssignmentTable({
  cases,
  supporters,
  onAssign,
  isAssigning,
  onAccept,
  onReject,
  onRequestMoreInfo,
}: AdminCaseAssignmentTableProps) {
  const activeCases = cases.filter(
    (c) =>
      c.internal_status === "triage_pending" ||
      c.internal_status === "accepted_unassigned" ||
      c.internal_status === "assigned"
  );

  const [loadingCaseId, setLoadingCaseId] = useState<string | null>(null);

  // Modal: Reject
  const [rejectingCaseId, setRejectingCaseId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Modal: Request Info
  const [infoRequestCaseId, setInfoRequestCaseId] = useState<string | null>(null);
  const [infoQuery, setInfoQuery] = useState("");

  // Modal: Assign Supporter
  const [assignCaseId, setAssignCaseId] = useState<string | null>(null);
  const [assignSelectedId, setAssignSelectedId] = useState<string>("");

  // Modal: View Case Detail
  const [detailCaseId, setDetailCaseId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const handleViewDetails = async (caseId: string) => {
    setDetailCaseId(caseId);
    setIsFetchingDetail(true);
    try {
      const response = await apiClient.get(`/admin/cases/${caseId}`);
      setDetailData(response.data);
    } catch (e) {
      console.error("Error fetching case details:", e);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleAcceptClick = async (caseId: string) => {
    if (window.confirm("Xác nhận duyệt hồ sơ này là hợp lệ để tiến hành phản biện?")) {
      setLoadingCaseId(caseId);
      try { await onAccept(caseId); }
      catch (e) {}
      finally { setLoadingCaseId(null); }
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingCaseId || rejectReason.trim().length < 10) return;
    setLoadingCaseId(rejectingCaseId);
    try {
      await onReject(rejectingCaseId, rejectReason.trim());
      setRejectingCaseId(null);
      setRejectReason("");
    } catch (e) {}
    finally { setLoadingCaseId(null); }
  };

  const handleInfoRequestSubmit = async () => {
    if (!infoRequestCaseId || infoQuery.trim().length < 5) return;
    setLoadingCaseId(infoRequestCaseId);
    try {
      await onRequestMoreInfo(infoRequestCaseId, infoQuery.trim());
      setInfoRequestCaseId(null);
      setInfoQuery("");
    } catch (e) {}
    finally { setLoadingCaseId(null); }
  };

  const handleAssignSubmit = async () => {
    if (!assignCaseId || !assignSelectedId) return;
    setLoadingCaseId(assignCaseId);
    try {
      await onAssign(assignCaseId, assignSelectedId);
      setAssignCaseId(null);
      setAssignSelectedId("");
    } catch (e) {}
    finally { setLoadingCaseId(null); }
  };

  const openAssignModal = (caseId: string) => {
    setAssignCaseId(caseId);
    setAssignSelectedId("");
  };

  if (activeCases.length === 0) {
    return (
      <div className="p-8 border border-border-app rounded-2xl bg-surface-app text-center flex flex-col items-center justify-center gap-3 font-body text-xs text-text-app">
        <div className="w-10 h-10 rounded-full bg-surface-soft border border-border-app text-text-subtle flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-success" />
        </div>
        <div className="space-y-0.5">
          <p className="font-heading font-semibold text-xs text-text-app">Không có Case nào cần xử lý</p>
          <p className="font-body text-[11px] text-text-muted">
            Tất cả các dự án đã được xử lý xong hoặc không tìm thấy case.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border-app rounded-2xl overflow-hidden bg-surface-app shadow-sm font-body text-xs text-text-app">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-surface-soft border-b border-border-app">
            <tr>
              <th className="p-4 pl-6 text-left font-heading font-bold text-[11px] text-text-muted">Mã dự án</th>
              <th className="p-4 text-left font-heading font-bold text-[11px] text-text-muted">Nhóm / Đề tài</th>
              <th className="p-4 text-left font-heading font-bold text-[11px] text-text-muted">Gói dịch vụ</th>
              <th className="p-4 text-left font-heading font-bold text-[11px] text-text-muted">Hồ sơ</th>
              <th className="p-4 text-left font-heading font-bold text-[11px] text-text-muted">Trạng thái</th>
              <th className="p-4 text-center font-heading font-bold text-[11px] text-text-muted w-16">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-app/45">
            {activeCases.map((item) => {
              const isLoadingThis = loadingCaseId === item.id;

              return (
                <tr key={item.id} className="hover:bg-surface-soft/30 transition-colors">
                  <td className="p-4 pl-6 font-heading font-bold text-xs">
                    {item.case_code}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-text-app">{item.team_name || "Chưa đặt tên"}</div>
                    <div className="text-[10px] text-text-muted">Chủ sở hữu: {item.owner_name}</div>
                  </td>
                  <td className="p-4 text-text-muted">
                    {item.package_name}
                  </td>
                  <td className="p-4">
                    <Chip color={item.completeness >= 80 ? "success" : "warning"} variant="soft" size="sm">
                      <Chip.Label>{item.completeness}% chi tiết</Chip.Label>
                    </Chip>
                  </td>
                  <td className="p-4">
                    <Chip
                      color={
                        item.internal_status === "triage_pending"
                          ? "default"
                          : item.internal_status === "accepted_unassigned"
                          ? "warning"
                          : "success"
                      }
                      variant="soft"
                      size="sm"
                    >
                      <Chip.Label>
                        {item.internal_status === "triage_pending"
                          ? "Chờ Triage"
                          : item.internal_status === "accepted_unassigned"
                          ? "Chờ Phân Công"
                          : "Đã phân công"}
                      </Chip.Label>
                    </Chip>
                  </td>
                  <td className="p-4">
                    <ActionMenu
                      item={item}
                      isLoading={isLoadingThis}
                      onAccept={() => handleAcceptClick(item.id)}
                      onReject={() => setRejectingCaseId(item.id)}
                      onInfo={() => setInfoRequestCaseId(item.id)}
                      onAssign={() => openAssignModal(item.id)}
                      onViewDetails={() => handleViewDetails(item.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Assign Supporter Modal ── */}
      <Modal isOpen={assignCaseId !== null} onOpenChange={() => { setAssignCaseId(null); setAssignSelectedId(""); }}>
        <Modal.Backdrop />
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-md bg-surface-app border border-border-app rounded-2xl shadow-xl overflow-hidden flex flex-col outline-none">
            <Modal.Header className="p-4 border-b border-border-app flex items-center gap-1.5 text-brand font-heading font-bold text-sm bg-surface-soft/40">
              <UserCheck className="w-4 h-4" />
              <span>Phân công Supporter</span>
            </Modal.Header>
            <Modal.Body className="p-5 space-y-3">
              <p className="text-[11px] text-text-muted">Chọn Supporter chuyên môn phụ trách đánh giá và hỗ trợ case này.</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-app">Supporter</label>
                <Select
                  aria-label="Chọn Supporter"
                  placeholder="Chọn Supporter"
                  selectedKey={assignSelectedId || null}
                  onSelectionChange={(key) => setAssignSelectedId(key?.toString() || "")}
                  isDisabled={isAssigning}
                  className="w-full"
                >
                  <Select.Trigger className="w-full h-9 px-3 bg-surface-soft border border-border-strong rounded-lg text-[11px] font-body text-text-app focus:outline-brand flex items-center justify-between cursor-pointer">
                    <Select.Value className="truncate" />
                  </Select.Trigger>
                  <Select.Popover className="bg-surface-app border border-border-strong rounded-xl shadow-xl p-1 min-w-full z-50">
                    <ListBox items={supporters} className="outline-none flex flex-col gap-0">
                      {(sup) => (
                        <ListBoxItem
                          key={sup.id}
                          id={sup.id}
                          textValue={sup.name}
                          className="px-2.5 py-1.5 text-xs rounded-md hover:bg-surface-soft cursor-pointer text-text-app outline-none select-none block transition-colors"
                        >
                          <span className="font-semibold">{sup.name}</span>
                          <span className="text-text-muted ml-1">({sup.email})</span>
                        </ListBoxItem>
                      )}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </Modal.Body>
            <Modal.Footer className="p-4 border-t border-border-app flex gap-3 bg-surface-soft/20">
              <Button onPress={() => { setAssignCaseId(null); setAssignSelectedId(""); }} variant="ghost" className="flex-1 bg-surface-app border border-border-strong text-text-muted">Hủy</Button>
              <Button
                onPress={handleAssignSubmit}
                isDisabled={!assignSelectedId || isAssigning}
                className="flex-1 bg-brand text-white flex items-center justify-center gap-1.5"
              >
                {isAssigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                Xác nhận Phân công
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>

      {/* ── Reject Modal ── */}
      <Modal isOpen={rejectingCaseId !== null} onOpenChange={() => setRejectingCaseId(null)}>
        <Modal.Backdrop />
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-md bg-surface-app border border-border-app rounded-2xl shadow-xl overflow-hidden flex flex-col outline-none">
            <Modal.Header className="p-4 border-b border-border-app flex items-center gap-1.5 text-danger font-heading font-bold text-sm bg-surface-soft/40">
              <XCircle className="w-4 h-4" />
              <span>Từ chối hồ sơ phản biện</span>
            </Modal.Header>
            <Modal.Body className="p-5 space-y-4">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-text-app">Lý do từ chối (Bắt buộc, tối thiểu 10 ký tự)</label>
                <TextArea
                  placeholder="Nhập lý do chi tiết từ chối hồ sơ..."
                  value={rejectReason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                  className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-brand px-3 py-2 min-h-20"
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="p-4 border-t border-border-app flex gap-3 bg-surface-soft/20">
              <Button onPress={() => setRejectingCaseId(null)} variant="ghost" className="flex-1 bg-surface-app border border-border-strong text-text-muted">Hủy</Button>
              <Button onPress={handleRejectSubmit} isDisabled={rejectReason.length < 10} className="flex-1 bg-danger text-white">Xác nhận Từ chối</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>

      {/* ── Request More Info Modal ── */}
      <Modal isOpen={infoRequestCaseId !== null} onOpenChange={() => setInfoRequestCaseId(null)}>
        <Modal.Backdrop />
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-md bg-surface-app border border-border-app rounded-2xl shadow-xl overflow-hidden flex flex-col outline-none">
            <Modal.Header className="p-4 border-b border-border-app flex items-center gap-1.5 text-warning font-heading font-bold text-sm bg-surface-soft/40">
              <Info className="w-4 h-4" />
              <span>Yêu cầu bổ sung thông tin</span>
            </Modal.Header>
            <Modal.Body className="p-5 space-y-4">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-text-app">Yêu cầu làm rõ (Bắt buộc, tối thiểu 5 ký tự)</label>
                <TextArea
                  placeholder="Ví dụ: Link Drive không chia sẻ công khai. Vui lòng cấp quyền xem cho nhóm..."
                  value={infoQuery}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInfoQuery(e.target.value)}
                  className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-brand px-3 py-2 min-h-20"
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="p-4 border-t border-border-app flex gap-3 bg-surface-soft/20">
              <Button onPress={() => setInfoRequestCaseId(null)} variant="ghost" className="flex-1 bg-surface-app border border-border-strong text-text-muted">Hủy</Button>
              <Button onPress={handleInfoRequestSubmit} isDisabled={infoQuery.length < 5} className="flex-1 bg-brand text-white">Gửi yêu cầu</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>

      {/* ── Case Detail Modal ── */}
      <Modal isOpen={detailCaseId !== null} onOpenChange={() => { setDetailCaseId(null); setDetailData(null); }}>
        <Modal.Backdrop />
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-2xl bg-surface-app border border-border-app rounded-2xl shadow-xl overflow-hidden flex flex-col outline-none">
            <Modal.Header className="p-4 border-b border-border-app flex items-center justify-between bg-surface-soft/40">
              <div className="flex items-center gap-1.5 text-brand font-heading font-bold text-sm">
                <Info className="w-4 h-4" />
                <span>Chi tiết dự án: {detailData?.case?.case_code || (isFetchingDetail ? "Đang tải..." : "")}</span>
              </div>
            </Modal.Header>
            <Modal.Body className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {isFetchingDetail ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-muted">
                  <Loader2 className="w-8 h-8 animate-spin text-brand" />
                  <p className="text-xs">Đang tải thông tin chi tiết dự án...</p>
                </div>
              ) : !detailData ? (
                <div className="text-center py-12 text-danger font-semibold text-xs">
                  Không thể tải chi tiết dự án. Vui lòng thử lại sau.
                </div>
              ) : (
                <div className="space-y-6 text-xs text-text-app">
                  {/* Section 1: General Info */}
                  <div>
                    <h4 className="font-heading font-bold text-sm text-text-app mb-3 flex items-center gap-2 border-b border-border-app pb-1">
                      <FolderOpen className="w-4 h-4 text-brand" />
                      <span>Thông tin chung</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-soft/30 p-4 rounded-xl border border-border-app/50">
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-text-muted uppercase font-semibold">Tên nhóm / Dự án</div>
                        <div className="font-bold text-sm text-text-app">{detailData.case.team_name || "Chưa đặt tên"}</div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-text-muted uppercase font-semibold">Gói dịch vụ</div>
                        <div className="font-bold text-sm text-text-app">{detailData.case.package?.name || "N/A"}</div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-text-muted uppercase font-semibold">Trường học</div>
                        <div className="font-semibold text-text-app">{detailData.case.school || "N/A"}</div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-text-muted uppercase font-semibold">Bối cảnh môn học</div>
                        <div className="font-semibold text-text-app">{detailData.case.course_context || "N/A"}</div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-text-muted uppercase font-semibold">Ngày tạo</div>
                        <div className="text-text-app flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-text-muted" />
                          <span>{new Date(detailData.case.created_at).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-text-muted uppercase font-semibold">Trạng thái nội bộ</div>
                        <div>
                          <Chip
                            color={
                              detailData.case.internal_status === "triage_pending"
                                ? "default"
                                : detailData.case.internal_status === "accepted_unassigned"
                                ? "warning"
                                : "success"
                            }
                            variant="soft"
                            size="sm"
                          >
                            <Chip.Label>
                              {detailData.case.internal_status === "triage_pending"
                                ? "Chờ Triage"
                                : detailData.case.internal_status === "accepted_unassigned"
                                ? "Chờ Phân Công"
                                : "Đã phân công"}
                            </Chip.Label>
                          </Chip>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Contact Info */}
                  {detailData.intake_snapshot?.contact && (
                    <div>
                      <h4 className="font-heading font-bold text-sm text-text-app mb-3 flex items-center gap-2 border-b border-border-app pb-1">
                        <Users className="w-4 h-4 text-brand" />
                        <span>Người liên hệ chính (Đại diện nhóm)</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-soft/30 p-4 rounded-xl border border-border-app/50">
                        <div className="space-y-1.5">
                          <div className="text-[10px] text-text-muted uppercase font-semibold">Họ tên</div>
                          <div className="font-bold text-text-app">{detailData.intake_snapshot.contact.full_name || "N/A"}</div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="text-[10px] text-text-muted uppercase font-semibold">Mã sinh viên</div>
                          <div className="font-bold text-text-app">{detailData.intake_snapshot.contact.student_code || "N/A"}</div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="text-[10px] text-text-muted uppercase font-semibold">Email</div>
                          <div className="text-text-app flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-text-muted" />
                            <span>{detailData.intake_snapshot.contact.email || "N/A"}</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="text-[10px] text-text-muted uppercase font-semibold">Zalo / Telegram</div>
                          <div className="text-text-app flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-text-muted" />
                            <span>Zalo: {detailData.intake_snapshot.contact.zalo || "N/A"}</span>
                            {detailData.intake_snapshot.contact.telegram && (
                              <span className="text-text-muted">| Telegram: {detailData.intake_snapshot.contact.telegram}</span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <div className="text-[10px] text-text-muted uppercase font-semibold">Vai trò trong nhóm</div>
                          <div className="text-text-app">{detailData.intake_snapshot.contact.team_role || "N/A"}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 3: Idea and Support Needs */}
                  <div>
                    <h4 className="font-heading font-bold text-sm text-text-app mb-3 flex items-center gap-2 border-b border-border-app pb-1">
                      <Target className="w-4 h-4 text-brand" />
                      <span>Ý tưởng & Nhu cầu hỗ trợ</span>
                    </h4>
                    <div className="space-y-4 bg-surface-soft/30 p-4 rounded-xl border border-border-app/50">
                      {detailData.intake_snapshot?.case_summary && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] text-text-muted uppercase font-semibold">Tóm tắt ý tưởng đề tài</div>
                          <p className="text-text-app leading-relaxed bg-surface-app p-3 rounded-lg border border-border-app/35 whitespace-pre-wrap">
                            {detailData.intake_snapshot.case_summary}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {detailData.intake_snapshot?.support_needs?.primary_need && (
                          <div className="space-y-1.5 md:col-span-2">
                            <div className="text-[10px] text-text-muted uppercase font-semibold">Nhu cầu hỗ trợ chính</div>
                            <div className="font-semibold text-brand-dark bg-brand-soft/20 px-3 py-1.5 rounded-lg border border-brand/10 w-fit">
                              {detailData.intake_snapshot.support_needs.primary_need}
                            </div>
                          </div>
                        )}
                        {detailData.intake_snapshot?.expected_outputs && (
                          <div className="space-y-1.5 md:col-span-2">
                            <div className="text-[10px] text-text-muted uppercase font-semibold">Kỳ vọng đầu ra</div>
                            <p className="text-text-app leading-relaxed bg-surface-app p-3 rounded-lg border border-border-app/35 whitespace-pre-wrap">
                              {detailData.intake_snapshot.expected_outputs}
                            </p>
                          </div>
                        )}
                        {detailData.intake_snapshot?.support_needs?.extra_notes && (
                          <div className="space-y-1.5 md:col-span-2">
                            <div className="text-[10px] text-text-muted uppercase font-semibold">Ghi chú thêm cho Supporter</div>
                            <p className="text-text-app leading-relaxed bg-surface-app p-3 rounded-lg border border-border-app/35 whitespace-pre-wrap">
                              {detailData.intake_snapshot.support_needs.extra_notes}
                            </p>
                          </div>
                        )}
                        {detailData.intake_snapshot?.lecturer_feedback && (
                          <div className="space-y-1.5 md:col-span-2">
                            <div className="text-[10px] text-text-muted uppercase font-semibold">Góp ý từ giảng viên (nếu có)</div>
                            <p className="text-text-app leading-relaxed bg-surface-app p-3 rounded-lg border border-border-app/35 whitespace-pre-wrap">
                              {detailData.intake_snapshot.lecturer_feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Documents */}
                  {detailData.intake_snapshot?.documents && detailData.intake_snapshot.documents.length > 0 && (
                    <div>
                      <h4 className="font-heading font-bold text-sm text-text-app mb-3 flex items-center gap-2 border-b border-border-app pb-1">
                        <FolderOpen className="w-4 h-4 text-brand" />
                        <span>Tài liệu đính kèm</span>
                      </h4>
                      <div className="space-y-3 bg-surface-soft/30 p-4 rounded-xl border border-border-app/50">
                        {detailData.intake_snapshot.documents.map((doc: any, idx: number) => (
                          <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-surface-app border border-border-app/40 rounded-lg gap-3">
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="font-bold text-text-app truncate">
                                {doc.document_type || "Tài liệu đính kèm"}
                              </div>
                              {doc.role_description && (
                                <p className="text-[10px] text-text-muted">{doc.role_description}</p>
                              )}
                            </div>
                            {doc.drive_url && (
                              <a
                                href={doc.drive_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-brand hover:underline shrink-0"
                              >
                                <span>Mở Google Drive</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Modal.Body>
            <Modal.Footer className="p-4 border-t border-border-app flex gap-3 bg-surface-soft/20">
              <Button onPress={() => { setDetailCaseId(null); setDetailData(null); }} className="w-full bg-surface-app border border-border-strong text-text-muted">Đóng</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>
    </div>
  );
}
