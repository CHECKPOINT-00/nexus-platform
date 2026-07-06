"use client";

import React, { useState } from "react";
import { Table, Button, Badge, Group, TextInput, Modal, Textarea, Card, Stack, Text } from "@mantine/core";
import { Search, Check, X, CreditCard, ShieldAlert } from "lucide-react";
import { formatPrice } from "@/lib/pricing";
import { notifications } from "@mantine/notifications";

interface AdminRefundTableProps {
  refunds: any[];
  onProcess: (params: {
    refundId: string;
    decision: "approve" | "reject" | "complete";
    rejectionReason?: string;
    receiptFileUrl?: string;
  }) => Promise<void>;
  isProcessing: boolean;
}

export default function AdminRefundTable({ refunds, onProcess, isProcessing }: AdminRefundTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);
  const [decisionType, setDecisionType] = useState<"approve" | "reject" | "complete" | null>(null);
  const [reason, setReason] = useState("");

  const filteredRefunds = refunds.filter((r) =>
    r.case?.case_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = async () => {
    if (!selectedRefundId || !decisionType) return;
    if (decisionType === "reject" && !reason.trim()) {
      notifications.show({
        title: "Thiếu lý do từ chối",
        message: "Vui lòng nhập lý do từ chối hoàn tiền.",
        color: "red",
      });
      return;
    }

    try {
      await onProcess({
        refundId: selectedRefundId,
        decision: decisionType,
        rejectionReason: decisionType === "reject" ? reason : undefined,
      });
      notifications.show({
        title: "Xử lý thành công",
        message: `Đã xử lý yêu cầu hoàn tiền thành công.`,
        color: "green",
      });
      setSelectedRefundId(null);
      setDecisionType(null);
      setReason("");
    } catch (err: any) {
      notifications.show({
        title: "Lỗi",
        message: err?.message || "Không thể xử lý yêu cầu hoàn tiền lúc này.",
        color: "red",
      });
    }
  };

  const getTierBadgeColor = (tier: number) => {
    if (tier === 1) return "green";
    if (tier === 2) return "yellow";
    return "red";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "requested":
        return <Badge color="yellow">Chờ duyệt (requested)</Badge>;
      case "approved":
        return <Badge color="blue">Đã duyệt (approved)</Badge>;
      case "completed":
        return <Badge color="green">Đã hoàn tiền (completed)</Badge>;
      case "rejected":
        return <Badge color="red">Bị từ chối (rejected)</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 font-body text-xs text-text-app">
      {/* 3-Tier Policy Guide Card */}
      <Card withBorder radius="md" className="bg-brand-soft/10 border-brand/20 p-5 animate-fade-in">
        <Stack gap="xs">
          <Group gap="xs">
            <ShieldAlert className="w-5 h-5 text-brand" />
            <Text fw={600} size="sm" className="font-heading text-text-app">
              Chính sách hoàn tiền 3 tầng đối chiếu (Refund Policy Rules)
            </Text>
          </Group>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <Card padding="sm" radius="xs" withBorder className="bg-surface-app border-green-500/20">
              <Group gap="xs" mb={4}>
                <Badge color="green">Tầng 1 (Tier 1)</Badge>
                <Text fw={600} size="xs">Hoàn tiền 100%</Text>
              </Group>
              <Text size="xs" c="dimmed">Khi học sinh yêu cầu hủy hồ sơ và chuyên gia <strong>chưa được phân công</strong> phụ trách dự án.</Text>
            </Card>
            <Card padding="sm" radius="xs" withBorder className="bg-surface-app border-yellow-500/20">
              <Group gap="xs" mb={4}>
                <Badge color="yellow">Tầng 2 (Tier 2)</Badge>
                <Text fw={600} size="xs">Hoàn tiền 50%</Text>
              </Group>
              <Text size="xs" c="dimmed">Khi đang trong quá trình phản biện và thời gian thực hiện <strong>dưới 50% SLA</strong> hạn định.</Text>
            </Card>
            <Card padding="sm" radius="xs" withBorder className="bg-surface-app border-red-500/20">
              <Group gap="xs" mb={4}>
                <Badge color="red">Tầng 3 (Tier 3)</Badge>
                <Text fw={600} size="xs">Không hoàn tiền (0%)</Text>
              </Group>
              <Text size="xs" c="dimmed">Khi báo cáo phản biện <strong>đã được xuất bản</strong> hoặc dự án đã <strong>quá hạn SLA</strong>.</Text>
            </Card>
          </div>
        </Stack>
      </Card>

      {/* Filter and Table Container */}
      <div className="space-y-4">
        <Group>
          <TextInput
            placeholder="Tìm theo mã hồ sơ..."
            leftSection={<Search className="w-4 h-4 text-text-muted" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            radius="md"
            style={{ width: 280 }}
          />
        </Group>

        <Table.ScrollContainer minWidth={600}>
          <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead className="bg-brand-soft">
              <Table.Tr>
                <Table.Th>Mã hồ sơ</Table.Th>
                <Table.Th>Số tiền</Table.Th>
                <Table.Th>Phân tầng</Table.Th>
                <Table.Th>Trạng thái</Table.Th>
                <Table.Th>Ngày yêu cầu</Table.Th>
                <Table.Th className="text-center w-40">Thao tác</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredRefunds.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} className="text-center py-8 text-text-muted">
                    Không tìm thấy yêu cầu hoàn tiền nào.
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredRefunds.map((ref) => (
                  <Table.Tr key={ref.id}>
                    <Table.Td className="font-heading font-bold">{ref.case?.case_code}</Table.Td>
                    <Table.Td className="font-semibold text-brand">{formatPrice(ref.amount)}</Table.Td>
                    <Table.Td>
                      <Badge color={getTierBadgeColor(ref.tier)} variant="light">
                        Tầng {ref.tier} ({ref.tier === 1 ? "100%" : ref.tier === 2 ? "50%" : "0%"})
                      </Badge>
                    </Table.Td>
                    <Table.Td>{getStatusBadge(ref.status)}</Table.Td>
                    <Table.Td>{new Date(ref.requested_at).toLocaleString("vi-VN")}</Table.Td>
                    <Table.Td className="text-center">
                      <Group gap="xs" justify="center">
                        {ref.status === "requested" && (
                          <>
                            <Button
                              size="xs"
                              color="green"
                              onClick={() => {
                                setSelectedRefundId(ref.id);
                                setDecisionType("approve");
                              }}
                            >
                              Duyệt
                            </Button>
                            <Button
                              size="xs"
                              color="red"
                              variant="outline"
                              onClick={() => {
                                setSelectedRefundId(ref.id);
                                setDecisionType("reject");
                              }}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                        {ref.status === "approved" && (
                          <Button
                            size="xs"
                            color="blue"
                            leftSection={<CreditCard className="w-3.5 h-3.5" />}
                            onClick={() => {
                              setSelectedRefundId(ref.id);
                              setDecisionType("complete");
                            }}
                          >
                            Hoàn tất
                          </Button>
                        )}
                        {ref.status === "completed" && (
                          <span className="text-success font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Thành công
                          </span>
                        )}
                        {ref.status === "rejected" && (
                          <span className="text-danger font-semibold flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> Từ chối
                          </span>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>

      {/* Decision Modal */}
      <Modal
        opened={selectedRefundId !== null}
        onClose={() => {
          setSelectedRefundId(null);
          setDecisionType(null);
          setReason("");
        }}
        title={
          <span className="font-heading font-bold text-sm text-text-app">
            {decisionType === "approve"
              ? "Duyệt yêu cầu hoàn tiền"
              : decisionType === "reject"
              ? "Từ chối hoàn tiền"
              : "Hoàn tất thủ tục hoàn tiền"}
          </span>
        }
        centered
        radius="md"
      >
        <Stack gap="md" className="font-body text-xs text-text-app">
          {decisionType === "approve" && (
            <p className="text-sm">
              Bạn có chắc chắn muốn duyệt yêu cầu hoàn tiền này? Trạng thái giao dịch sẽ chuyển sang <strong>Đã Duyệt (approved)</strong> để tiến hành thanh toán lại cho học sinh.
            </p>
          )}

          {decisionType === "complete" && (
            <p className="text-sm">
              Xác nhận đã thực hiện chuyển tiền hoàn trả cho học sinh? Hành động này sẽ đóng hồ sơ và đánh dấu trạng thái hoàn tiền là <strong>Đã Hoàn Tiền (completed)</strong>.
            </p>
          )}

          {decisionType === "reject" && (
            <div className="space-y-3">
              <p className="text-sm">Vui lòng cung cấp lý do từ chối để gửi thông báo giải thích cho học sinh:</p>
              <Textarea
                label="Lý do từ chối"
                placeholder="Nhập lý do chi tiết..."
                value={reason}
                onChange={(e) => setReason(e.currentTarget.value)}
                required
                rows={3}
              />
            </div>
          )}

          <Group justify="flex-end" gap="xs" pt="sm">
            <Button
              variant="default"
              onClick={() => {
                setSelectedRefundId(null);
                setDecisionType(null);
                setReason("");
              }}
            >
              Hủy
            </Button>
            <Button
              color={decisionType === "reject" ? "red" : "green"}
              onClick={handleAction}
              loading={isProcessing}
            >
              Xác nhận
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
