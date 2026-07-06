"use client";

import React from "react";
import { Case } from "@/types";
import { AlertCircle } from "lucide-react";
import { Button, Card, Text, Stack, Group, Badge } from "@mantine/core";
import { formatPrice } from "@/lib/pricing";
import { useConfirmPackage } from "../hooks/useConfirmPackage";
import { notifications } from "@mantine/notifications";

interface PackageConfirmationCardProps {
  caseData: Case;
}

export default function PackageConfirmationCard({ caseData }: PackageConfirmationCardProps) {
  const { confirmPackage, isConfirming } = useConfirmPackage(caseData.id);

  if (caseData.payment_status !== "awaiting_confirmation") {
    return null;
  }

  // Check if there is a proposed package change
  const hasProposedChange =
    !!caseData.proposed_package_id &&
    caseData.proposed_package_id !== caseData.package_id;

  const handleConfirm = async (acceptProposed: boolean) => {
    try {
      await confirmPackage(acceptProposed);
      notifications.show({
        title: "Xác nhận thành công",
        message: "Bạn đã xác nhận gói dịch vụ thành công. Hãy tiến hành thanh toán.",
        color: "green",
      });
    } catch (err: any) {
      notifications.show({
        title: "Có lỗi xảy ra",
        message: err?.message || "Không thể xác nhận gói dịch vụ lúc này.",
        color: "red",
      });
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className="bg-warning-soft/20 border-warning/30 animate-fade-in">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <AlertCircle className="w-5 h-5 text-warning shrink-0" />
            <Text fw={600} size="sm" className="font-heading text-text-app">
              Xác nhận gói dịch vụ & chi phí phản biện
            </Text>
          </Group>
          <Badge color="warning" variant="light">Xác nhận gói</Badge>
        </Group>

        <Text size="xs" c="dimmed" className="font-body leading-relaxed">
          Quản trị viên đã xem xét hồ sơ của bạn và đề xuất gói dịch vụ phản biện phù hợp. Vui lòng xác nhận gói để tiến hành thanh toán và kích hoạt phản biện.
        </Text>

        {hasProposedChange ? (
          // Proposed change UI
          <Card padding="md" radius="sm" withBorder className="bg-surface-app border-warning/10 space-y-4">
            <div>
              <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
                Gói được đề xuất mới:
              </Text>
              <Group justify="space-between" mt={4}>
                <Text size="sm" fw={600} className="text-text-app">
                  {caseData.proposed_package_id} (Đề xuất mới)
                </Text>
                <Text size="sm" fw={700} className="text-brand">
                  {formatPrice(caseData.proposed_locked_price ?? 0)}
                </Text>
              </Group>
              {caseData.package_change_reason && (
                <Text size="xs" mt={6} className="font-body text-text-muted bg-warning-soft/30 p-2 rounded">
                  <strong>Lý do thay đổi:</strong> {caseData.package_change_reason}
                </Text>
              )}
            </div>

            <hr className="border-border-app" />

            <div>
              <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
                Gói bạn đã chọn ban đầu:
              </Text>
              <Group justify="space-between" mt={4}>
                <Text size="sm" className="text-text-muted">
                  {caseData.package?.name || caseData.package_id}
                </Text>
                <Text size="sm" fw={600} className="text-text-muted">
                  {formatPrice(caseData.locked_price ?? caseData.package?.price ?? 0)}
                </Text>
              </Group>
            </div>

            <Group gap="xs" mt="md">
              <Button
                loading={isConfirming}
                onClick={() => handleConfirm(true)}
                color="brand"
                size="sm"
                className="font-body font-semibold text-xs h-9 cursor-pointer"
              >
                Xác nhận gói đề xuất
              </Button>
              <Button
                loading={isConfirming}
                onClick={() => handleConfirm(false)}
                variant="light"
                color="brand"
                size="sm"
                className="font-body font-semibold text-xs h-9 cursor-pointer"
              >
                Giữ gói gốc
              </Button>
            </Group>
          </Card>
        ) : (
          // Regular confirmation UI
          <Card padding="md" radius="sm" withBorder className="bg-surface-app border-border-app">
            <Group justify="space-between">
              <div>
                <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
                  Gói dịch vụ đã chọn:
                </Text>
                <Text size="sm" fw={600} mt={4} className="text-text-app">
                  {caseData.package?.name || caseData.package_id}
                </Text>
              </div>
              <div className="text-right">
                <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
                  Chi phí:
                </Text>
                <Text size="md" fw={700} mt={4} className="text-brand">
                  {formatPrice(caseData.locked_price ?? caseData.package?.price ?? 0)}
                </Text>
              </div>
            </Group>

            <Group gap="xs" mt="md">
              <Button
                loading={isConfirming}
                onClick={() => handleConfirm(false)}
                color="brand"
                size="sm"
                className="font-body font-semibold text-xs h-9 cursor-pointer"
              >
                Xác nhận gói dịch vụ
              </Button>
            </Group>
          </Card>
        )}
      </Stack>
    </Card>
  );
}
