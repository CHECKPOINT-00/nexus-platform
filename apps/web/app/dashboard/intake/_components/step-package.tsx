import { Select, ListBox } from "@heroui/react";
import type { ServicePackage } from "../types";

interface StepPackageProps {
  packageId: string;
  packages: ServicePackage[] | undefined;
  onSelect: (id: string) => void;
}

export function StepPackage({ packageId, packages, onSelect }: StepPackageProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-orange-50/50 dark:bg-orange-950/5 p-4 rounded-md border border-orange-200/40 text-sm text-default-600 leading-relaxed">
        <span className="font-bold text-default-800 block mb-1">Mục tiêu bước này:</span>
        Lựa chọn gói phản biện mong muốn của nhóm. Gói dịch vụ quyết định số vòng supporter tham gia đánh giá và SLA cam kết.
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="package-select" className="text-sm font-bold text-default-700">
          Lựa chọn gói dịch vụ phản biện
        </label>
        <Select
          id="package-select"
          placeholder="Chọn gói cước dịch vụ..."
          value={packageId}
          onChange={(val) => { if (val) onSelect(val as string); }}
          className="w-full"
        >
          <Select.Trigger className="rounded-lg border border-default-200 bg-surface p-2 text-sm flex items-center justify-between">
            <Select.Value>
              {packageId && packages
                ? packages.find((p) => p.id === packageId)?.name || "Chọn gói cước dịch vụ..."
                : "Chọn gói cước dịch vụ..."}
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox className="bg-surface border border-default-200 rounded-lg p-1">
              {packages?.map((pkg) => (
                <ListBox.Item
                  key={pkg.id}
                  id={pkg.id}
                  textValue={pkg.name}
                  className="hover:bg-default-100 p-2 rounded cursor-pointer text-sm"
                >
                  {pkg.name} ({pkg.price === 0 ? "Miễn phí" : `${pkg.price.toLocaleString("vi-VN")} đ`})
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              )) || []}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
    </div>
  );
}
