"use client";

import React, { useMemo, useState } from "react";
import { Anchor, Badge, Card, Group, Stack, Table, Tabs, Text, Title } from "@mantine/core";
import { CheckCircle, ExternalLink, FileText, FolderOpen, Lock } from "lucide-react";
import type {
  DocumentCheckpoint,
  DocumentFile,
  DocumentUnit,
  DocumentWorkspace as DocumentWorkspaceType,
} from "@/types/case";

interface DocumentWorkspaceProps {
  workspace: DocumentWorkspaceType | null;
  selectedVersion?: number;
}

export default function DocumentWorkspace({ workspace, selectedVersion = 0 }: DocumentWorkspaceProps) {
  const [activeCheckpoint, setActiveCheckpoint] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"overview" | "versions" | "assessments">("overview");

  const selectedCheckpoint = useMemo(() => {
    if (!workspace || workspace.checkpoints.length === 0) return null;

    const active = workspace.checkpoints.find((cp) => cp.checkpoint_id === activeCheckpoint);
    if (active) return active;
    return workspace.checkpoints.find((cp) => cp.checkpoint_id === workspace.selected_checkpoint_id) ?? null;
  }, [activeCheckpoint, workspace]);

  if (!workspace || workspace.checkpoints.length === 0 || !selectedCheckpoint) {
    return (
      <Card withBorder padding="xl" radius="md">
        <Stack gap="md" align="center" py="xl">
          <FolderOpen className="w-12 h-12 text-text-muted" />
          <Text size="lg" fw={500} c="dimmed">
            Chưa có tài liệu
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Hồ sơ này chưa có tài liệu nào được tải lên hoặc liên kết.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {workspace.checkpoints.length > 1 && (
        <Card withBorder padding="md" radius="md">
          <Group gap="xs">
            <Text size="sm" fw={500}>
              Checkpoint:
            </Text>
            {workspace.checkpoints.map((cp) => (
              <Badge
                key={cp.checkpoint_id}
                variant={cp.checkpoint_id === selectedCheckpoint.checkpoint_id ? "filled" : "light"}
                color="brand"
                style={{ cursor: "pointer" }}
                onClick={() => setActiveCheckpoint(cp.checkpoint_id)}
              >
                {cp.checkpoint_code}
              </Badge>
            ))}
          </Group>
        </Card>
      )}

      <Card withBorder padding="lg" radius="md">
        <Tabs
          value={activeSection}
          onChange={(val) => setActiveSection((val ?? "overview") as typeof activeSection)}
        >
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<FolderOpen className="w-4 h-4" />}>
              Tổng quan
            </Tabs.Tab>
            <Tabs.Tab value="versions" leftSection={<FileText className="w-4 h-4" />}>
              Phiên bản ({selectedCheckpoint.version_units.length})
            </Tabs.Tab>
            <Tabs.Tab value="assessments" leftSection={<CheckCircle className="w-4 h-4" />}>
              Đánh giá ({selectedCheckpoint.assessment_units.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <CheckpointOverview checkpoint={selectedCheckpoint} />
          </Tabs.Panel>

          <Tabs.Panel value="versions" pt="md">
            <UnitSection title="Phiên bản" icon={<FileText className="w-4 h-4" />} units={selectedCheckpoint.version_units} selectedVersion={selectedVersion} />
          </Tabs.Panel>

          <Tabs.Panel value="assessments" pt="md">
            <UnitSection title="Đánh giá" icon={<CheckCircle className="w-4 h-4" />} units={selectedCheckpoint.assessment_units} />
          </Tabs.Panel>
        </Tabs>
      </Card>
    </Stack>
  );
}

function CheckpointOverview({ checkpoint }: { checkpoint: DocumentCheckpoint }) {
  const { overview, version_units, assessment_units } = checkpoint;

  return (
    <Stack gap="md">
      <div className="py-2">
        <Text size="lg" className="font-heading">
          {checkpoint.checkpoint_code}
        </Text>
        <Text c="dimmed">
          {overview.selected_label}
        </Text>
      </div>

      <div className="grid grid-cols-3 border border-border-app bg-surface-app divide-x divide-border-app">
        {/* Phiên bản */}
        <div className="p-6 text-center space-y-1">
          <Text c="dimmed" size="xs" tt="uppercase" className="tracking-wider">
            Phiên bản
          </Text>
          <Text style={{ fontSize: "28px", fontWeight: 300 }}>
            {overview.version_count}
          </Text>
        </div>

        {/* Đánh giá */}
        <div className="p-6 text-center space-y-1">
          <Text c="dimmed" size="xs" tt="uppercase" className="tracking-wider">
            Đánh giá
          </Text>
          <Text style={{ fontSize: "28px", fontWeight: 300 }}>
            {overview.assessment_count}
          </Text>
        </div>

        {/* Tổng tệp */}
        <div className="p-6 text-center space-y-1">
          <Text c="dimmed" size="xs" tt="uppercase" className="tracking-wider">
            Tổng tệp
          </Text>
          <Text style={{ fontSize: "28px", fontWeight: 300 }}>
            {overview.total_files}
          </Text>
        </div>
      </div>

      {version_units.length === 0 && assessment_units.length === 0 && (
        <div className="border border-border-app bg-surface-app p-8 text-center flex flex-col items-center justify-center gap-3">
          <FolderOpen className="w-10 h-10 text-text-muted" />
          <Text c="dimmed" ta="center">
            Chưa có tài liệu nào trong checkpoint này.
          </Text>
        </div>
      )}
    </Stack>
  );
}

function UnitSection({
  title,
  icon,
  units,
  selectedVersion,
}: {
  title: string;
  icon: React.ReactNode;
  units: DocumentUnit[];
  selectedVersion?: number;
}) {
  const isAssessment = title === "Đánh giá";

  const rows = useMemo(() => {
    return units.flatMap((unit) =>
      unit.files.map((file) => {
        const isSelected = typeof selectedVersion === "number" && selectedVersion === unit.version_no;
        const url = file.file_url || file.download_url;
        const hasAction = !!(file.open_action && url);

        const getFileDisplayName = () => {
          const name = file.original_name || file.canonical_name || "";
          const fileUrl = url || "";

          // Check if it's a URL link (Google Drive / no extension / starts with http)
          const isUrl = file.source_kind === "drive" || name.startsWith("http") || (!file.extension && fileUrl);

          if (isUrl) {
            return fileUrl;
          }

          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(name) && fileUrl) {
            return fileUrl;
          }

          // Append extension if name doesn't have it
          let finalName = name;
          if (finalName && file.extension) {
            const ext = file.extension.startsWith(".") ? file.extension : `.${file.extension}`;
            if (!finalName.endsWith(ext)) {
              finalName = `${finalName}${ext}`;
            }
          }

          return finalName || fileUrl || "Tài liệu không tên";
        };

        const displayName = getFileDisplayName();
        const isLink = file.source_kind === "drive" || displayName.startsWith("http");

        const getFormatLabel = () => {
          if (isLink) {
            return "LINK";
          }
          if (file.extension) {
            return file.extension.replace(/^\./, "").toUpperCase();
          }
          if (file.mime_type) {
            const parts = file.mime_type.split("/");
            if (parts.length > 1) {
              const sub = parts[1].toUpperCase();
              if (sub === "OCTET-STREAM") return "FILE";
              return sub;
            }
          }
          return "FILE";
        };

        const formatLabel = getFormatLabel();

        let sourceLabel = "Tải lên";
        let sourceColor = "gray";
        if (file.source_kind === "drive") {
          sourceLabel = "Google Drive";
          sourceColor = "blue";
        } else if (file.source_kind === "generated") {
          sourceLabel = "Hệ thống";
          sourceColor = "teal";
        }

        return {
          key: `${unit.unit_code}-${file.id}`,
          unit,
          file,
          isSelected,
          displayName,
          url,
          hasAction,
          sourceLabel,
          sourceColor,
          formatLabel,
        };
      })
    );
  }, [units, selectedVersion]);

  return (
    <Stack gap="sm">
      {rows.length === 0 ? (
        <Text size="sm" c="dimmed">
          Chưa có mục nào.
        </Text>
      ) : (
        <div className="border border-border-app bg-surface-app overflow-hidden">
          <Table.ScrollContainer minWidth={600}>
            <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
              <Table.Thead className="bg-surface-soft">
                <Table.Tr>
                  <Table.Th style={{ width: isAssessment ? "130px" : "110px" }}>
                    {isAssessment ? "Đợt đánh giá" : "Phiên bản"}
                  </Table.Th>
                  {isAssessment ? (
                    <Table.Th style={{ width: "150px" }}>Liên kết bản nộp</Table.Th>
                  ) : (
                    <Table.Th style={{ width: "120px" }}>Vai trò</Table.Th>
                  )}
                  <Table.Th>Tài liệu / Đường dẫn</Table.Th>
                  <Table.Th style={{ width: "140px" }}>Nguồn</Table.Th>
                  <Table.Th style={{ width: "110px" }}>Định dạng</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row) => (
                  <Table.Tr
                    key={row.key}
                    style={row.isSelected ? { backgroundColor: "var(--color-brand-subtle)" } : undefined}
                  >
                    <Table.Td>
                      <Text c={row.isSelected ? "brand" : undefined}>
                        {isAssessment ? `Đợt ${row.unit.assessment_no}` : `v${String(row.unit.version_no).padStart(2, "0")}`}
                        {!isAssessment && row.isSelected && " (Đang chọn)"}
                      </Text>
                    </Table.Td>
                    {isAssessment ? (
                      <Table.Td>
                        {row.unit.linked_version_no ? (
                          <Text>v{String(row.unit.linked_version_no).padStart(2, "0")}</Text>
                        ) : (
                          <Text c="dimmed">—</Text>
                        )}
                      </Table.Td>
                    ) : (
                      <Table.Td>
                        <Text>
                          {row.file.is_primary ? "Chính" : "Đính kèm"}
                        </Text>
                      </Table.Td>
                    )}
                    <Table.Td>
                      {row.hasAction ? (
                        <Anchor
                          href={row.url ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="always"
                          color="brand"
                          className="hover:text-brand-hover transition-colors break-all whitespace-normal block"
                          style={{ maxWidth: "450px" }}
                        >
                          {row.displayName}
                        </Anchor>
                      ) : (
                        <Group gap="xs" wrap="nowrap">
                          <Lock className="w-3.5 h-3.5 text-text-muted" />
                          <Text c="dimmed" className="break-all whitespace-normal block" style={{ maxWidth: "450px" }}>
                            {row.displayName}
                          </Text>
                        </Group>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text>{row.sourceLabel}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text style={{ fontFamily: "monospace" }}>{row.formatLabel}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </div>
      )}
    </Stack>
  );
}
