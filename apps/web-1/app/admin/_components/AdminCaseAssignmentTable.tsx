"use client";

import React, { useState, useEffect, useRef } from "react";
import { User } from "@/types";
import {
  UserCheck, CheckCircle, Loader2, XCircle, Info,
  MoreVertical, CheckCheck, Ban, HelpCircle,
} from "lucide-react";
import { Button, Select, ListBox, ListBoxItem, Modal, TextArea, Chip } from "@heroui/react";

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
}

function ActionMenu({ item, isLoading, onAccept, onReject, onInfo, onAssign }: ActionMenuProps) {
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
    </div>
  );
}
