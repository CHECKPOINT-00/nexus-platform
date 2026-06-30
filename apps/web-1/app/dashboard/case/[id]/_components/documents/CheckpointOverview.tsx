"use client";

import React from "react";
import { Card, Text, Group, Stack, SimpleGrid, Badge, Title } from "@mantine/core";
import { FileText, CheckCircle, FolderOpen } from "lucide-react";
import type { DocumentCheckpoint } from "@/types/case";

interface CheckpointOverviewProps {
  checkpoint: DocumentCheckpoint;
}

export default function CheckpointOverview({ checkpoint }: CheckpointOverviewProps) {
  const { overview, version_units, assessment_units } = checkpoint;

  const totalFiles = version_units.reduce((sum, u) => sum + u.files.length, 0) +
    assessment_units.reduce((sum, u) => sum + u.files.length, 0);

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

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Card withBorder padding="md" radius="sm">
          <Group gap="sm">
            <FolderOpen className="w-8 h-8 text-brand" />
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Phiên bản
              </Text>
              <Text size="xl" fw={700}>
                {overview.version_count}
              </Text>
            </div>
          </Group>
        </Card>

        <Card withBorder padding="md" radius="sm">
          <Group gap="sm">
            <CheckCircle className="w-8 h-8 text-success" />
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Đánh giá
              </Text>
              <Text size="xl" fw={700}>
                {overview.assessment_count}
              </Text>
            </div>
          </Group>
        </Card>

        <Card withBorder padding="md" radius="sm">
          <Group gap="sm">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Tổng tệp
              </Text>
              <Text size="xl" fw={700}>
                {overview.total_files}
              </Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

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
