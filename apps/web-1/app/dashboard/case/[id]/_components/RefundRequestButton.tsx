"use client";

import React, { useState } from "react";
import { Case } from "@/types";
import { RotateCcw } from "lucide-react";
import { Button, Modal, Text, Group } from "@mantine/core";
import { canRequestRefund } from "@/lib/pricing";
import { useRequestRefund } from "../hooks/useRequestRefund";
import { notifications } from "@mantine/notifications";

interface RefundRequestButtonProps {
  caseData: Case;
}

export default function RefundRequestButton({ caseData }: RefundRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { requestRefund, isRequesting } = useRequestRefund(caseData.id);

  if (!canRequestRefund(caseData)) {
    return null;
  }

  const handleRefund = async () => {
    try {
      await requestRefund("Yêu cầu hoàn tiền từ học sinh");
      notifications.show({
        title: "Đã gửi yêu cầu hoàn tiền",
        message: "Yêu cầu hoàn tiền 100% đã được gửi lên hệ thống và đang chờ admin xử lý.",
        color: "green",
      });
      setIsOpen(false);
    } catch (err: any) {
      notifications.show({
        title: "Có lỗi xảy ra",
        message: err?.message || "Không thể gửi yêu cầu hoàn tiền lúc này.",
        color: "red",
      });
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        color="red"
        variant="light"
        leftSection={<RotateCcw className="w-4 h-4" />}
        size="sm"
        className="font-body font-semibold text-xs h-9 cursor-pointer"
      >
        Hủy hồ sơ & hoàn tiền 100%
      </Button>

      <Modal
        opened={isOpen}
        onClose={() => setIsOpen(false)}
        title="Xác nhận hủy hồ sơ & hoàn tiền"
        centered
        radius="md"
        size="sm"
      >
        <div className="space-y-4 font-body">
          <Text size="sm" className="text-text-muted leading-relaxed">
            Chuyên gia chưa được phân công cho hồ sơ này, bạn được phép hủy hồ sơ và nhận lại <strong>100% tiền phí</strong> đã thanh toán.
          </Text>
          <Text size="xs" c="red" fw={600} className="bg-danger-soft p-2.5 rounded-lg">
            Hành động này không thể hoàn tác sau khi admin phê duyệt hoàn tiền.
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="subtle" color="gray" size="xs" onClick={() => setIsOpen(false)}>
              Quay lại
            </Button>
            <Button color="red" size="xs" loading={isRequesting} onClick={handleRefund}>
              Xác nhận hoàn tiền
            </Button>
          </Group>
        </div>
      </Modal>
    </>
  );
}
