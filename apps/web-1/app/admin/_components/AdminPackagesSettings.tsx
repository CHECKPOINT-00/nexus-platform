import React, { useState } from "react";
import { ServicePackage } from "@/types";
import { Table, NumberInput, Button, Card, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { formatPrice } from "@/lib/pricing";

interface AdminPackagesSettingsProps {
  packages: ServicePackage[];
  onUpdatePrice: (args: { packageId: string; price: number }) => Promise<any>;
  isUpdating: boolean;
}

export default function AdminPackagesSettings({
  packages,
  onUpdatePrice,
  isUpdating,
}: AdminPackagesSettingsProps) {
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});

  const getPrice = (pkg: ServicePackage) => {
    return editingPrices[pkg.id] !== undefined ? editingPrices[pkg.id] : pkg.price;
  };

  const handlePriceChange = (id: string, value: string | number) => {
    const numValue = typeof value === "number" ? value : parseFloat(value as string) || 0;
    setEditingPrices((prev) => ({ ...prev, [id]: numValue }));
  };

  const handleUpdate = async (pkg: ServicePackage) => {
    const price = getPrice(pkg);
    if (price < 0) {
      notifications.show({
        title: "Lỗi",
        message: "Giá tiền phải lớn hơn hoặc bằng 0",
        color: "red",
      });
      return;
    }
    try {
      await onUpdatePrice({ packageId: pkg.id, price });
      notifications.show({
        title: "Thành công",
        message: `Đã cập nhật đơn giá cho gói "${pkg.name}" thành ${formatPrice(price)}`,
        color: "green",
      });
    } catch (e: any) {
      notifications.show({
        title: "Lỗi",
        message: e?.message || "Gặp lỗi khi cập nhật giá gói.",
        color: "red",
      });
    }
  };

  if (packages.length === 0) {
    return (
      <Card withBorder padding="xl" radius="md">
        <Text ta="center" c="dimmed">
          Không có gói dịch vụ nào trên hệ thống.
        </Text>
      </Card>
    );
  }

  return (
    <Card withBorder padding="md" radius="md" style={{ width: "100%" }}>
      <Table.ScrollContainer minWidth={600}>
        <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead className="bg-brand-soft">
            <Table.Tr>
              <Table.Th className="text-left">Tên gói dịch vụ</Table.Th>
              <Table.Th className="text-left w-64">Đơn giá hiện tại (VNĐ)</Table.Th>
              <Table.Th className="text-left w-64">Thiết lập giá mới (VNĐ)</Table.Th>
              <Table.Th className="text-center w-36">Thao tác</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {packages.map((pkg) => {
              const currentInputVal = getPrice(pkg);
              const isModified = currentInputVal !== pkg.price;
              return (
                <Table.Tr key={pkg.id} className="hover:bg-surface-soft/30 transition-colors">
                  <Table.Td>
                    <Stack gap="xs">
                      <Text fw={600} className="text-text-app">
                        {pkg.name}
                      </Text>
                      {pkg.features && Array.isArray(pkg.features) && (
                        <Text size="xs" c="dimmed">
                          {pkg.features.join(" • ")}
                        </Text>
                      )}
                      {pkg.last_price_changed_at && (
                        <Text size="xs" c="dimmed">
                          Cập nhật lần cuối: {new Date(pkg.last_price_changed_at).toLocaleString("vi-VN")}
                          {pkg.previous_price !== null && pkg.previous_price !== undefined
                            ? ` (từ ${formatPrice(pkg.previous_price)})`
                            : ""}
                        </Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={600}>
                      {formatPrice(pkg.price)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      value={currentInputVal}
                      onChange={(val) => handlePriceChange(pkg.id, val)}
                      min={0}
                      thousandSeparator="."
                      decimalSeparator=","
                      suffix=" VNĐ"
                      placeholder="Nhập giá mới..."
                      radius="md"
                    />
                  </Table.Td>
                  <Table.Td className="text-center">
                    <Button
                      onClick={() => handleUpdate(pkg)}
                      disabled={isUpdating || !isModified}
                      loading={isUpdating}
                      variant="filled"
                      color="brand"
                      size="xs"
                      radius="md"
                    >
                      Cập nhật
                    </Button>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}
