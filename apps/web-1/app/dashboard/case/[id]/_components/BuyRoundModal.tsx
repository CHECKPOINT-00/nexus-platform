"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button, Text, Group, Stack } from "@mantine/core";
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
          Mua thêm lượt audit (39k)
        </Text>
      }
      size="md"
      radius="md"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Bạn sắp mua thêm một lượt audit cho hồ sơ này. Giá mỗi lượt là{" "}
          <b>{price.toLocaleString("vi-VN")}₫</b>.
          Sau khi xác nhận, bạn sẽ được chuyển đến trang thanh toán.
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
            Xác nhận mua
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
