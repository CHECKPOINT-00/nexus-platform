"use client";

import React from "react";
import { Case } from "@/types";
import { XCircle, RefreshCw } from "lucide-react";
import { Button, Card, Text, Stack, Group, Badge } from "@mantine/core";
import { canReactivatePayment } from "@/lib/pricing";
import { useReactivatePayment } from "../hooks/useReactivatePayment";
import { notifications } from "@mantine/notifications";

interface ExpiredPaymentNoticeProps {
  caseData: Case;
}

export default function ExpiredPaymentNotice({ caseData }: ExpiredPaymentNoticeProps) {
  const { reactivatePayment, isReactivating } = useReactivatePayment(caseData.id);

  if (caseData.payment_status !== "expired") {
    return null;
  }

  const allowReactivate = canReactivatePayment(caseData);

  const handleReactivate = async () => {
    try {
      await reactivatePayment();
      notifications.show({
        title: "Kích hoạt thành công",
        message: "Hạn thanh toán đã được gia hạn thêm 72 giờ.",
        color: "green",
      });
    } catch (err: any) {
      notifications.show({
        title: "Có lỗi xảy ra",
        message: err?.message || "Không thể kích hoạt lại thanh toán lúc này.",
        color: "red",
      });
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className="bg-danger-soft/20 border-danger/30 animate-fade-in">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <XCircle className="w-5 h-5 text-danger shrink-0" />
            <Text fw={600} size="sm" className="font-heading text-text-app">
              Giao dịch hết hạn thanh toán
            </Text>
          </Group>
          <Badge color="red" variant="light">Hết hạn</Badge>
        </Group>

        {allowReactivate ? (
          <>
            <Text size="xs" c="dimmed" className="font-body leading-relaxed">
              Thời gian thanh toán 72 giờ của hồ sơ này đã hết hạn. Tuy nhiên, bạn vẫn có thể khôi phục và kích hoạt lại thanh toán trong vòng 7 ngày kể từ lúc hết hạn.
            </Text>
            <Group gap="xs" mt="xs">
              <Button
                loading={isReactivating}
                onClick={handleReactivate}
                color="brand"
                leftSection={<RefreshCw className="w-4 h-4" />}
                size="sm"
                className="font-body font-semibold text-xs h-9 cursor-pointer"
              >
                Kích hoạt lại thanh toán
              </Button>
            </Group>
          </>
        ) : (
          <Text size="xs" c="dimmed" className="font-body leading-relaxed">
            Hồ sơ đã quá hạn thanh toán 7 ngày và đã tự động đóng vĩnh viễn. Vui lòng gửi hồ sơ mới nếu bạn vẫn có nhu cầu phản biện.
          </Text>
        )}
      </Stack>
    </Card>
  );
}
