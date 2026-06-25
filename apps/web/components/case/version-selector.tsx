"use client";

import { Select, ListBox } from "@heroui/react";

interface LifecycleUnit {
  id: string;
  unit_code: string;
  unit_type: string;
  version_no: number;
  created_at: string;
}

interface VersionSelectorProps {
  versions: LifecycleUnit[];
  selectedVersionCode: string;
  onVersionChange: (code: string) => void;
}

export function VersionSelector({
  versions,
  selectedVersionCode,
  onVersionChange,
}: VersionSelectorProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getVersionLabel = (version: LifecycleUnit) => {
    const isOriginal = version.version_no === 0;
    return `${isOriginal ? "Bản gốc" : `Bản sửa đổi`} ${version.unit_code} - nộp ngày ${formatDate(version.created_at)}`;
  };

  const selectedVersionObj = versions.find(v => v.unit_code === selectedVersionCode);

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-xs">
      <span className="text-xs font-bold text-default-500 uppercase tracking-wider block">
        Chọn phiên bản tài liệu
      </span>
      <Select
        placeholder="Chọn phiên bản..."
        value={selectedVersionCode}
        onChange={(val) => {
          if (val) onVersionChange(val as string);
        }}
        variant="secondary"
        className="w-full"
      >
        <Select.Trigger className="rounded-lg border border-default-200 bg-surface p-2 text-sm flex items-center justify-between">
          <Select.Value>
            {selectedVersionObj ? getVersionLabel(selectedVersionObj) : "Chọn phiên bản..."}
          </Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox className="bg-surface border border-default-200 rounded-lg p-1">
            {versions.map((v) => (
              <ListBox.Item
                key={v.unit_code}
                id={v.unit_code}
                textValue={v.unit_code}
                className="hover:bg-default-100 p-2 rounded cursor-pointer text-sm"
              >
                {getVersionLabel(v)}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}
