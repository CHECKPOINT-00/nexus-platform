"use client";

import React from "react";
import { Menu, Button } from "@mantine/core";
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
      <Menu shadow="md" width={180} position="bottom-start">
        <Menu.Target>
          <Button
            variant="default"
            leftSection={<Layers className="w-3.5 h-3.5 text-brand" />}
            rightSection={<ChevronDown className="w-3 h-3 text-text-muted" />}
            className="text-text-app hover:bg-surface-soft text-xs font-semibold font-body h-9 px-3 cursor-pointer"
          >
            <span>Phiên bản: v{selectedVersion}</span>
          </Button>
        </Menu.Target>
        <Menu.Dropdown className="bg-surface-app border border-border-app p-1 rounded-lg">
          {versions.map((ver) => (
            <Menu.Item
              key={ver}
              onClick={() => onVersionChange(ver)}
              className={`font-body text-xs cursor-pointer ${
                selectedVersion === ver ? "text-brand font-bold" : "text-text-app"
              }`}
            >
              Phiên bản v{ver} {ver === Math.max(...versions) ? "(Mới nhất)" : ""}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
