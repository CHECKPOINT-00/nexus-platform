"use client";

import React, { useMemo, useState } from "react";
import { Anchor, Badge, Card, Group, Stack, Tabs, Text, Title } from "@mantine/core";
import { CheckCircle, ExternalLink, FileText, FolderOpen } from "lucide-react";
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
          variant="outline"
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
  const totalFiles = version_units.reduce((sum, unit) => sum + unit.files.length, 0) +
    assessment_units.reduce((sum, unit) => sum + unit.files.length, 0);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={5}>{checkpoint.checkpoint_code}</Title>
          <Text size="sm" c="dimmed">
            {overview.selected_label}
          </Text>
        </div>
        <Badge variant="light" color="brand" size="lg">
          {totalFiles} tài liệu
        </Badge>
      </Group>

      <Card withBorder padding="md" radius="sm">
        <Stack gap="xs">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Phiên bản
          </Text>
          <Text fw={700}>{overview.version_count}</Text>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Đánh giá
          </Text>
          <Text fw={700}>{overview.assessment_count}</Text>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Tổng tệp
          </Text>
          <Text fw={700}>{overview.total_files}</Text>
        </Stack>
      </Card>

      {version_units.length === 0 && assessment_units.length === 0 && (
        <Card withBorder padding="lg" radius="sm">
          <Stack gap="xs" align="center" py="md">
            <FolderOpen className="w-10 h-10 text-text-muted" />
            <Text size="sm" c="dimmed" ta="center">
              Chưa có tài liệu nào trong checkpoint này.
            </Text>
          </Stack>
        </Card>
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
  return (
    <Stack gap="sm">
      <Group gap="xs">
        {icon}
        <Title order={6}>{title}</Title>
      </Group>
      {units.length === 0 ? (
        <Text size="sm" c="dimmed">
          Chưa có mục nào.
        </Text>
      ) : (
        units.map((unit) => (
          <UnitCard key={unit.unit_code} unit={unit} selectedVersion={selectedVersion} />
        ))
      )}
    </Stack>
  );
}

function UnitCard({ unit, selectedVersion }: { unit: DocumentUnit; selectedVersion?: number }) {
  const isSelected = typeof selectedVersion === "number" && selectedVersion === unit.version_no;

  return (
    <Card withBorder padding="md" radius="sm" data-selected={isSelected || undefined}>
      <Group justify="space-between" align="flex-start">
        <div>
          <Text fw={700}>{unit.unit_code}</Text>
          <Text size="xs" c="dimmed">
            v{String(unit.version_no).padStart(2, "0")} • {unit.files.length} tệp
          </Text>
        </div>
        {isSelected && <Badge color="brand">Đang chọn</Badge>}
      </Group>

      <Stack gap="xs" mt="sm">
        {unit.files.map((file) => (
          <FileRow key={file.id} file={file} />
        ))}
      </Stack>
    </Card>
  );
}

function FileRow({ file }: { file: DocumentFile }) {
  const url = file.file_url || file.download_url;
  const hasAction = file.open_action && url;

  return (
    <Group justify="space-between" align="center" wrap="nowrap">
      <div>
        <Text size="sm" fw={500}>
          {file.original_name || file.canonical_name || file.id}
        </Text>
        <Text size="xs" c="dimmed">
          {file.source_kind} • {file.mime_type || "unknown"}
        </Text>
      </div>
      {hasAction ? (
        <Anchor
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Badge variant="light" color="brand" style={{ cursor: "pointer" }}>
            <Group gap={4}>
              <ExternalLink className="w-3 h-3" />
              {file.open_action === "download" ? "Tải xuống" : "Mở"}
            </Group>
          </Badge>
        </Anchor>
      ) : (
        <Badge variant="light" color="gray">
          Khóa
        </Badge>
      )}
    </Group>
  );
}
