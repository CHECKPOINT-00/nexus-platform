"use client";

import React from "react";
import { Dropdown, Button } from "@heroui/react";
import { ChevronDown, Layers } from "lucide-react";

interface VersionSelectorProps {
  versions: number[];
  selectedVersion: number;
  onVersionChange: (version: number) => void;
}

export default function VersionSelector({
  versions,
  selectedVersion,
  onVersionChange,
}: VersionSelectorProps) {
  if (versions.length <= 1) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-soft border border-border-app rounded-lg text-xs font-semibold font-body text-text-muted">
        <Layers className="w-3.5 h-3.5" />
        <span>Phiên bản: v{selectedVersion} (Mới nhất)</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Dropdown>
        <Dropdown.Trigger>
          <Button
            variant="ghost"
            className="border border-border-app bg-surface-app text-text-app hover:bg-surface-soft text-xs font-semibold font-body h-9 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-brand" />
            <span>Phiên bản: v{selectedVersion}</span>
            <ChevronDown className="w-3 h-3 text-text-muted" />
          </Button>
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu
            aria-label="Chọn phiên bản tài liệu"
            onAction={(key) => onVersionChange(Number(key))}
            className="font-body text-xs"
          >
            {versions.map((ver) => (
              <Dropdown.Item
                id={ver.toString()}
                key={ver}
                className={selectedVersion === ver ? "text-brand font-bold" : "text-text-app"}
              >
                Phiên bản v{ver} {ver === Math.max(...versions) ? "(Mới nhất)" : ""}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}
