"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button, Text, Group, Stack, NumberInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

interface BuyRoundModalProps {
  caseId: string;
  opened: boolean;
  onClose: () => void;
}

export default function BuyRoundModal({
  caseId,
  opened,
  onClose,
}: BuyRoundModalProps) {
  const router = useRouter();
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");
  const [roundQuantity, setRoundQuantity] = useState<number>(1);

  useEffect(() => {
    if (opened) {
      setIdempotencyKey(crypto.randomUUID());
    }
  }, [opened]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/cases/${caseId}/buy-round`, {
        packageId: "pkg_tf_audit",
        idempotencyKey,
        quantity: roundQuantity,
      });
      return res.data;
    },
    onSuccess: () => {
      notifications.show({
        title: "Mua lượt thành công",
        message: "Đang chuyển đến trang thanh toán...",
        color: "teal",
      });
      router.push(`/dashboard/case/${caseId}/payment`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Không thể mua lượt audit. Vui lòng thử lại sau.";
      notifications.show({
        title: "Mua lượt thất bại",
        message,
        color: "red",
      });
    },
  });

  const handleClose = () => {
    mutation.reset();
    onClose();
  };

  const price = 39000;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={700} size="sm">
          Mua thêm lượt audit
        </Text>
      }
      size="md"
      radius="md"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Bạn sắp mua thêm lượt audit cho hồ sơ này. Giá mỗi lượt là{" "}
          <b>{price.toLocaleString("vi-VN")}₫</b>.
          Sau khi xác nhận, bạn sẽ được chuyển đến trang thanh toán.
        </Text>

        <NumberInput
          label="Số lượt"
          description="Chọn số lượt audit muốn mua"
          value={roundQuantity}
          onChange={(val) => setRoundQuantity(Number(val) || 1)}
          min={1}
          max={50}
          allowDecimal={false}
          allowNegative={false}
        />

        <Text size="sm" fw={600}>
          Tổng cộng:{" "}
          {(roundQuantity * price).toLocaleString("vi-VN")}₫
        </Text>

        <Group justify="flex-end" mt="sm">
          <Button
            variant="default"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={mutation.isPending}
          >
            Xác nhận mua ({roundQuantity} lượt — tổng{" "}
            {(roundQuantity * price).toLocaleString("vi-VN")}₫)
          </Button>
        </Group>

        {mutation.isError && (
          <Text c="red" size="xs">
            {(mutation.error as any)?.response?.data?.message ||
              "Đã xảy ra lỗi. Vui lòng thử lại."}
          </Text>
        )}
      </Stack>
    </Modal>
  );
}
