"use client";

import React, { useState, useEffect, useMemo } from "react";
import { User } from "@/types";
import {
  UserCheck, CheckCircle, Loader2, XCircle, Info,
  MoreVertical, CheckCheck, Ban, HelpCircle, ExternalLink,
  FolderOpen, Target, Users, Mail, Phone, Calendar, Search
} from "lucide-react";
import { Button, Select, Modal, Textarea, Badge, ActionIcon, Table, Menu, Pagination, TextInput, Group } from "@mantine/core";
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
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 5;

  const [loadingCaseId, setLoadingCaseId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("all");
  const [selectedCompleteness, setSelectedCompleteness] = useState("all");
  const [sortBy, setSortBy] = useState("created_at_desc");

  const extractErrorMessage = (error: any) => error?.response?.data?.error || error?.message || "Đã xảy ra lỗi";

  const handleViewDetails = async (caseId: string) => {
    setActionError(null);
    setDetailCaseId(caseId);
    setIsFetchingDetail(true);
    try {
      const response = await apiClient.get(`/admin/cases/${caseId}`);
      setDetailData(response.data);
    } catch (e) {
      setActionError(extractErrorMessage(e));
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleAcceptClick = async (caseId: string) => {
    if (window.confirm("Xác nhận duyệt hồ sơ này là hợp lệ để tiến hành phản biện?")) {
      setLoadingCaseId(caseId);
      setActionError(null);
      try { await onAccept(caseId); }
      catch (e) { setActionError(extractErrorMessage(e)); }
      finally { setLoadingCaseId(null); }
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingCaseId || rejectReason.trim().length < 10) return;
    setLoadingCaseId(rejectingCaseId);
    setActionError(null);
    try {
      await onReject(rejectingCaseId, rejectReason.trim());
      setRejectingCaseId(null);
      setRejectReason("");
    } catch (e) { setActionError(extractErrorMessage(e)); }
    finally { setLoadingCaseId(null); }
  };

  const handleInfoRequestSubmit = async () => {
    if (!infoRequestCaseId || infoQuery.trim().length < 5) return;
    setLoadingCaseId(infoRequestCaseId);
    setActionError(null);
    try {
      await onRequestMoreInfo(infoRequestCaseId, infoQuery.trim());
      setInfoRequestCaseId(null);
      setInfoQuery("");
    } catch (e) { setActionError(extractErrorMessage(e)); }
    finally { setLoadingCaseId(null); }
  };

  const handleAssignSubmit = async () => {
    if (!assignCaseId || !assignSelectedId) return;
    setLoadingCaseId(assignCaseId);
    setActionError(null);
    try {
      await onAssign(assignCaseId, assignSelectedId);
      setAssignCaseId(null);
      setAssignSelectedId("");
    } catch (e) { setActionError(extractErrorMessage(e)); }
    finally { setLoadingCaseId(null); }
  };

  const openAssignModal = (caseId: string) => {
    setAssignCaseId(caseId);
    setAssignSelectedId("");
  };

  // Extract unique packages dynamically
  const uniquePackages = useMemo(() => {
    const pkgs = new Set<string>();
    cases.forEach((c) => {
      if (c.package_name) pkgs.add(c.package_name);
    });
    return Array.from(pkgs);
  }, [cases]);

  // Filter and sort cases
  const filteredAndSortedCases = useMemo(() => {
    let result = [...cases];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.case_code?.toLowerCase().includes(query) ||
          c.team_name?.toLowerCase().includes(query) ||
          c.owner_name?.toLowerCase().includes(query)
      );
    }

    if (selectedPackage && selectedPackage !== "all") {
      result = result.filter((c) => c.package_name === selectedPackage);
    }

    if (selectedCompleteness === "high") {
      result = result.filter((c) => c.completeness >= 80);
    } else if (selectedCompleteness === "low") {
      result = result.filter((c) => c.completeness < 80);
    }

    result.sort((a, b) => {
      if (sortBy === "created_at_desc") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "created_at_asc") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "completeness_desc") {
        return b.completeness - a.completeness;
      }
      if (sortBy === "completeness_asc") {
        return a.completeness - b.completeness;
      }
      if (sortBy === "case_code_asc") {
        return (a.case_code || "").localeCompare(b.case_code || "");
      }
      if (sortBy === "case_code_desc") {
        return (b.case_code || "").localeCompare(a.case_code || "");
      }
      return 0;
    });

    return result;
  }, [cases, searchQuery, selectedPackage, selectedCompleteness, sortBy]);

  // Reset page when filtering or cases change
  useEffect(() => {
    setActivePage(1);
  }, [cases.length, searchQuery, selectedPackage, selectedCompleteness, sortBy]);

  if (cases.length === 0) {
    return (
      <div className="p-8 border border-border-app rounded-lg bg-surface-app text-center flex flex-col items-center justify-center gap-3 font-body text-xs text-text-app">
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

  const totalPages = Math.ceil(filteredAndSortedCases.length / itemsPerPage);
  const paginatedCases = filteredAndSortedCases.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  return (
    <div className="space-y-4 font-body text-xs text-text-app">
      {actionError && (
        <div className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-danger text-xs">
          {actionError}
        </div>
      )}
      {/* Search and Filters */}
      <Group gap="sm" mb="md" style={{ width: "100%" }}>
        <TextInput
          placeholder="Tìm theo mã dự án, tên nhóm, chủ sở hữu..."
          leftSection={<Search className="w-4 h-4 text-text-muted" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          radius="md"
          style={{ flexGrow: 1 }}
        />
        <Select
          placeholder="Gói dịch vụ"
          data={[{ value: "all", label: "Tất cả các gói" }, ...uniquePackages.map(p => ({ value: p, label: p }))]}
          value={selectedPackage}
          onChange={(val) => setSelectedPackage(val || "all")}
          radius="md"
          style={{ width: 160 }}
        />
        <Select
          placeholder="Độ chi tiết hồ sơ"
          data={[
            { value: "all", label: "Mọi độ chi tiết" },
            { value: "high", label: "Chi tiết (≥ 80%)" },
            { value: "low", label: "Cần bổ sung (< 80%)" },
          ]}
          value={selectedCompleteness}
          onChange={(val) => setSelectedCompleteness(val || "all")}
          radius="md"
          style={{ width: 180 }}
        />
        <Select
          placeholder="Sắp xếp"
          data={[
            { value: "created_at_desc", label: "Mới nhất" },
            { value: "created_at_asc", label: "Cũ nhất" },
            { value: "completeness_desc", label: "Độ chi tiết (Giảm dần)" },
            { value: "completeness_asc", label: "Độ chi tiết (Tăng dần)" },
            { value: "case_code_asc", label: "Mã dự án (A-Z)" },
            { value: "case_code_desc", label: "Mã dự án (Z-A)" },
          ]}
          value={sortBy}
          onChange={(val) => setSortBy(val || "created_at_desc")}
          radius="md"
          style={{ width: 180 }}
        />
      </Group>

      <Table.ScrollContainer minWidth={800}>
        <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead className="bg-brand-soft">
            <Table.Tr>
              <Table.Th className="text-left">Mã dự án</Table.Th>
              <Table.Th className="text-left">Nhóm / Đề tài</Table.Th>
              <Table.Th className="text-left">Gói dịch vụ</Table.Th>
              <Table.Th className="text-left">Hồ sơ</Table.Th>
              <Table.Th className="text-left">Trạng thái</Table.Th>
              <Table.Th className="text-center w-24">Thao tác</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredAndSortedCases.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6} className="text-center py-8 text-text-muted">
                  Không tìm thấy kết quả phù hợp với bộ lọc hiện tại.
                </Table.Td>
              </Table.Tr>
            ) : (
              paginatedCases.map((item) => {
                const isLoadingThis = loadingCaseId === item.id;

                return (
                  <Table.Tr key={item.id} className="hover:bg-surface-soft/30 transition-colors">
                    <Table.Td className="font-heading font-bold text-xs">
                      {item.case_code}
                    </Table.Td>
                    <Table.Td>
                      <div className="font-semibold text-text-app">{item.team_name || "Chưa đặt tên"}</div>
                      <div className="text-[10px] text-text-muted">Chủ sở hữu: {item.owner_name}</div>
                    </Table.Td>
                    <Table.Td className="text-text-muted">
                      {item.package_name}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={item.completeness >= 80 ? "green" : "yellow"} variant="light" size="sm">
                        {item.completeness}% chi tiết
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={
                          item.internal_status === "triage_pending"
                            ? "gray"
                            : item.internal_status === "accepted_unassigned"
                            ? "yellow"
                            : "green"
                        }
                        variant="light"
                        size="sm"
                      >
                        {item.internal_status === "triage_pending"
                          ? "Chờ Triage"
                          : item.internal_status === "accepted_unassigned"
                          ? "Chờ Phân Công"
                          : "Đã phân công"}
                      </Badge>
                    </Table.Td>
                    <Table.Td className="text-center">
                      <Button
                        variant="subtle"
                        size="xs"
                        color="brand"
                        onClick={() => handleViewDetails(item.id)}
                        disabled={isLoadingThis}
                        className="font-semibold cursor-pointer mx-auto"
                      >
                        {isLoadingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "Xem chi tiết"
                        )}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            total={totalPages}
            value={activePage}
            onChange={setActivePage}
            size="sm"
            color="brand"
            radius="md"
          />
        </div>
      )}

      {/* ── Assign Supporter Modal ── */}
      <Modal
        opened={assignCaseId !== null}
        onClose={() => { setAssignCaseId(null); setAssignSelectedId(""); }}
        title={
          <div className="flex items-center gap-1.5 text-brand font-heading font-bold text-sm">
            <UserCheck className="w-4 h-4" />
            <span>Phân công Supporter</span>
          </div>
        }
        centered
      >
        <div className="space-y-4 font-body">
          <p className="text-[11px] text-text-muted">Chọn Supporter chuyên môn phụ trách đánh giá và hỗ trợ case này.</p>
          <Select
            label="Supporter"
            placeholder="Chọn Supporter"
            data={supporters.map(sup => ({ value: sup.id, label: `${sup.name} (${sup.email})` }))}
            value={assignSelectedId}
            onChange={(val) => setAssignSelectedId(val || "")}
            disabled={isAssigning}
            radius="md"
            comboboxProps={{ withinPortal: false }}
          />
          <div className="flex gap-3 pt-4 border-t border-border-app">
            <Button
              onClick={() => { setAssignCaseId(null); setAssignSelectedId(""); }}
              variant="default"
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handleAssignSubmit}
              disabled={!assignSelectedId || isAssigning}
              color="brand"
              leftSection={isAssigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
              className="flex-1"
            >
              Xác nhận Phân công
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Reject Modal ── */}
      <Modal
        opened={rejectingCaseId !== null}
        onClose={() => setRejectingCaseId(null)}
        title={
          <div className="flex items-center gap-1.5 text-danger font-heading font-bold text-sm">
            <XCircle className="w-4 h-4" />
            <span>Từ chối hồ sơ phản biện</span>
          </div>
        }
        centered
      >
        <div className="space-y-4 font-body">
          <Textarea
            label="Lý do từ chối (Bắt buộc, tối thiểu 10 ký tự)"
            placeholder="Nhập lý do chi tiết từ chối hồ sơ..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            minRows={3}
            autosize
            variant="default"
            radius="md"
          />
          <div className="flex gap-3 pt-4 border-t border-border-app">
            <Button
              onClick={() => setRejectingCaseId(null)}
              variant="default"
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handleRejectSubmit}
              disabled={rejectReason.length < 10}
              color="red"
              className="flex-1"
            >
              Xác nhận Từ chối
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Request More Info Modal ── */}
      <Modal
        opened={infoRequestCaseId !== null}
        onClose={() => setInfoRequestCaseId(null)}
        title={
          <div className="flex items-center gap-1.5 text-warning font-heading font-bold text-sm">
            <Info className="w-4 h-4" />
            <span>Yêu cầu bổ sung thông tin</span>
          </div>
        }
        centered
      >
        <div className="space-y-4 font-body">
          <Textarea
            label="Yêu cầu làm rõ (Bắt buộc, tối thiểu 5 ký tự)"
            placeholder="Ví dụ: Link Drive không chia sẻ công khai. Vui lòng cấp quyền xem cho nhóm..."
            value={infoQuery}
            onChange={(e) => setInfoQuery(e.target.value)}
            minRows={3}
            autosize
            variant="default"
            radius="md"
          />
          <div className="flex gap-3 pt-4 border-t border-border-app">
            <Button
              onClick={() => setInfoRequestCaseId(null)}
              variant="default"
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handleInfoRequestSubmit}
              disabled={infoQuery.length < 5}
              color="brand"
              className="flex-1"
            >
              Gửi yêu cầu
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Case Detail Modal ── */}
      <Modal
        opened={detailCaseId !== null}
        onClose={() => { setDetailCaseId(null); setDetailData(null); }}
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
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
              <p className="text-xs">Đang tải thông tin chi tiết dự án...</p>
            </div>
          ) : !detailData ? (
            <div className="text-center py-12 text-danger font-semibold text-xs">
              Không thể tải chi tiết dự án. Vui lòng thử lại sau.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section 1: General Info */}
              <div>
                <h4 className="font-heading font-bold text-sm text-text-app mb-3">
                  Thông tin chung
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-surface-app p-5 rounded-xl border border-border-app shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-text-subtle font-medium">Tên nhóm / Dự án</span>
                    <p className="font-bold text-sm text-text-app">{detailData.case.team_name || "Chưa đặt tên"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-subtle font-medium">Gói dịch vụ</span>
                    <p className="font-bold text-sm text-brand">{detailData.case.package?.name || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-subtle font-medium">Trường học</span>
                    <p className="font-semibold text-sm text-text-app">{detailData.case.school || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-subtle font-medium">Bối cảnh môn học</span>
                    <p className="font-semibold text-sm text-text-app">{detailData.case.course_context || "N/A"}</p>
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
                      <p className="font-bold text-sm text-text-app">{detailData.intake_snapshot.contact.full_name || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-text-subtle font-medium">Mã sinh viên</span>
                      <p className="font-semibold text-sm text-text-app">{detailData.intake_snapshot.contact.student_code || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-text-subtle font-medium">Email</span>
                      <p className="text-sm font-medium text-text-app">{detailData.intake_snapshot.contact.email || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-text-subtle font-medium">Zalo / Telegram</span>
                      <p className="text-sm font-medium text-text-app">
                        Zalo: {detailData.intake_snapshot.contact.zalo || "N/A"}
                        {detailData.intake_snapshot.contact.telegram && (
                          <span className="text-text-muted"> | Telegram: {detailData.intake_snapshot.contact.telegram}</span>
                        )}
                      </p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <span className="text-xs text-text-subtle font-medium">Vai trò trong nhóm</span>
                      <p className="text-sm text-text-app">{detailData.intake_snapshot.contact.team_role || "N/A"}</p>
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
                      <p className="text-sm text-text-app leading-relaxed whitespace-pre-wrap">
                        {detailData.intake_snapshot.case_summary}
                      </p>
                    </div>
                  )}

                  {detailData.intake_snapshot?.support_needs?.primary_need && (
                    <div className="space-y-1">
                      <span className="text-xs text-text-subtle font-medium">Nhu cầu hỗ trợ chính</span>
                      <p className="text-sm font-medium text-text-app">
                        {detailData.intake_snapshot.support_needs.primary_need}
                      </p>
                    </div>
                  )}

                  {detailData.intake_snapshot?.expected_outputs && (
                    <div className="space-y-1">
                      <span className="text-xs text-text-subtle font-medium">Kỳ vọng đầu ra</span>
                      <p className="text-sm text-text-app leading-relaxed whitespace-pre-wrap">
                        {detailData.intake_snapshot.expected_outputs}
                      </p>
                    </div>
                  )}

                  {detailData.intake_snapshot?.support_needs?.extra_notes && (
                    <div className="space-y-1">
                      <span className="text-xs text-text-subtle font-medium">Ghi chú thêm cho Supporter</span>
                      <p className="text-sm text-text-app leading-relaxed whitespace-pre-wrap">
                        {detailData.intake_snapshot.support_needs.extra_notes}
                      </p>
                    </div>
                  )}

                  {detailData.intake_snapshot?.lecturer_feedback && (
                    <div className="space-y-1">
                      <span className="text-xs text-text-subtle font-medium">Góp ý từ giảng viên (nếu có)</span>
                      <p className="text-sm text-text-app leading-relaxed whitespace-pre-wrap">
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
              onClick={() => { setDetailCaseId(null); setDetailData(null); }}
              variant="default"
            >
              Đóng
            </Button>

            <div className="flex gap-2">
              {detailData?.case?.internal_status === "triage_pending" && (
                <>
                  <Button
                    onClick={() => { if (detailData) { setInfoRequestCaseId(detailData.case.id); setDetailCaseId(null); } }}
                    variant="outline"
                    color="yellow"
                    className="font-semibold cursor-pointer"
                  >
                    Yêu cầu làm rõ
                  </Button>
                  <Button
                    onClick={() => { if (detailData) { setRejectingCaseId(detailData.case.id); setDetailCaseId(null); } }}
                    variant="outline"
                    color="red"
                    className="font-semibold cursor-pointer"
                  >
                    Từ chối
                  </Button>
                  <Button
                    onClick={() => { if (detailData) { handleAcceptClick(detailData.case.id); setDetailCaseId(null); } }}
                    color="green"
                    className="font-semibold cursor-pointer"
                  >
                    Duyệt hồ sơ
                  </Button>
                </>
              )}

              {detailData?.case && (detailData.case.internal_status === "accepted_unassigned" || detailData.case.internal_status === "assigned") && (
                <Button
                  onClick={() => { if (detailData) { openAssignModal(detailData.case.id); setDetailCaseId(null); } }}
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
    </div>
  );
}
