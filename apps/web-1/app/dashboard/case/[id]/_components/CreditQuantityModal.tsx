"use client";

import React, { useState } from "react";
import { Modal, Button, NumberInput, Stack, Text, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { formatPrice } from "@/lib/pricing";
import { usePackagePrice } from "@/lib/usePackagePrice";
import { useShortageDepositRedirect } from "./use-shortage-deposit-redirect";

interface CreditQuantityModalProps {
  caseId: string;
  opened: boolean;
  onClose: () => void;
  packageId: string;
}

const MIN_TOPUP_AMOUNT = 2000;

export default function CreditQuantityModal({ caseId, opened, onClose, packageId }: CreditQuantityModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState<number>(1);

  const { startShortageDeposit, isPending: isShortagePending } = useShortageDepositRedirect(caseId);
  const { data: pkg } = usePackagePrice(packageId, opened);

  const unitPrice = pkg?.price ?? 0;

    const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/orders", {
        idempotency_key: crypto.randomUUID(),
        items: [
          {
            service_type: "credit_audit",
            quantity,
            metadata_json: { case_id: caseId },
          },
        ],
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      notifications.show({
        title: "Tạo đơn hàng thành công",
        message: `Đơn hàng #${data.orderId} đã được tạo.`,
        color: "teal",
      });
      router.refresh();
      handleClose();
    },
    onError: (error: Error) => {
      const responseData = (
        error as {
          response?: {
            data?: {
              code?: string;
              message?: string;
              details?: { current?: number; required?: number };
            };
          };
        }
      ).response?.data;
      const code = responseData?.code;
      const message = responseData?.message;

      if (code === "INSUFFICIENT_BALANCE") {
        const details = responseData?.details;
        const shortage = details
          ? Math.max(Number(details.required) - Number(details.current), 0)
          : quantity * unitPrice;
        const suggestedTopup = Math.max(shortage, MIN_TOPUP_AMOUNT);
        void startShortageDeposit({ quantity, suggestedTopup }).finally(() => {
          handleClose();
        });
        return;
      }

      notifications.show({
        title: "Tạo đơn hàng thất bại",
        message: message || "Vui lòng thử lại sau.",
        color: "red",
      });
    },
  });

  const handleClose = () => {
    mutation.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<Text fw={700} size="sm">Mua credit</Text>}
      size="md"
      radius="md"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Chọn số lượng credit muốn mua. Mỗi credit tương ứng với một lượt đánh giá từ Supporter.
        </Text>

        <NumberInput
          label="Số lượng credit"
          description="Từ 1 đến 50 credit"
          value={quantity}
          onChange={(val) => setQuantity(Number(val) || 1)}
          min={1}
          max={50}
          allowDecimal={false}
          allowNegative={false}
        />

        <div className="bg-surface-soft rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Đơn giá</span>
            <span className="font-semibold">{formatPrice(unitPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Số lượng</span>
            <span className="font-semibold">{quantity}</span>
          </div>
          <div className="border-t border-border-app pt-2 flex justify-between">
            <span className="font-semibold">Tổng cộng</span>
            <span className="font-semibold text-brand">
              {formatPrice(quantity * unitPrice)}
            </span>
          </div>
        </div>

        <Group justify="flex-end" mt="sm">
          <Button
            variant="default"
            onClick={handleClose}
            disabled={mutation.isPending || isShortagePending}
          >
            Hủy
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            loading={mutation.isPending || isShortagePending}
            disabled={mutation.isPending || isShortagePending}
          >
            Xác nhận mua
          </Button>
        </Group>

        {mutation.isError && (
          <Text c="red" size="xs">
            {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Đã xảy ra lỗi."}
          </Text>
        )}
      </Stack>
    </Modal>
  );
}
