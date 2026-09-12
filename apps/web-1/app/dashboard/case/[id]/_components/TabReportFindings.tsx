"use client";

import React, { useMemo, useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { Button, Group, Stack, Tooltip, LoadingOverlay } from "@mantine/core";
import { useDownloadReportPdf } from "../hooks/useDownloadReportPdf";

export interface RichReportData {
  projectName?: string;
  overallScore?: number;
  verdict?: string;
  pdfUrl?: string;
  [key: string]: unknown;
}

interface TabReportFindingsProps {
  report: {
    content_md: string;
    metadata_json?: Record<string, unknown> | null;
    created_at?: string | Date | null;
  } | null;
  caseId?: string;
}

function makeDownloadSlug(name: string): string {
  return (
    name
      .replace(/[đĐ]/g, "d")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 50) || "project"
  );
}

function getReportPdfFilename(projectName: string, createdAt?: string | Date | null): string {
  const slug = makeDownloadSlug(projectName);
  const d = createdAt ? new Date(createdAt) : new Date();
  const validDate = isNaN(d.getTime()) ? new Date() : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp = `${validDate.getFullYear()}${pad(validDate.getMonth() + 1)}${pad(validDate.getDate())}${pad(validDate.getHours())}${pad(validDate.getMinutes())}${pad(validDate.getSeconds())}`;
  return `${slug}_input_clarification_${timestamp}.pdf`;
}

export default function TabReportFindings({ report, caseId }: TabReportFindingsProps) {
  const [pdfLoading, setPdfLoading] = useState(true);
  const parsedReport = useMemo<RichReportData | null>(() => {
    if (report?.metadata_json && typeof report.metadata_json === "object") {
      return report.metadata_json as unknown as RichReportData;
    }
    if (!report?.content_md) return null;
    try {
      const data = JSON.parse(report.content_md) as unknown;
      if (data && typeof data === "object") {
        return data as RichReportData;
      }
    } catch {
      // Content is plain markdown
    }
    return null;
  }, [report]);

  // Reset loading state when PDF URL changes (e.g., new report selected)


  if (!report) {
    return (
      <div className="bg-surface-app border border-border-app rounded-lg p-8 md:p-12 text-center flex flex-col items-center justify-center gap-4 animate-fade-in font-body">
        <div className="w-12 h-12 rounded-full bg-surface-soft border border-border-app text-text-subtle flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h4 className="font-heading font-semibold text-sm text-text-app">Chưa có báo cáo phản biện</h4>
          <p className="font-body text-xs text-text-muted leading-relaxed">
            Báo cáo phản biện chính thức sẽ hiển thị ở đây sau khi hệ thống hoàn tất thẩm định ý tưởng khởi nghiệp.
          </p>
        </div>
      </div>
    );
  }

  const projectName = parsedReport?.projectName || "Dự án khởi nghiệp";

  const reportFilename = useMemo(() => {
    return getReportPdfFilename(projectName, report?.created_at);
  }, [projectName, report?.created_at]);

  const pdfViewUrl = caseId ? `/api/cases/${caseId}/report/${reportFilename}?view=inline` : "";

  // Reset loading state when PDF URL changes (e.g., new report selected)
  React.useEffect(() => {
    if (pdfViewUrl) {
      setPdfLoading(true);
    }
  }, [pdfViewUrl]);

  const { mutate: downloadPdf, isPending: isDownloadingPdf } = useDownloadReportPdf(caseId || "");

  const handleDownloadPdf = () => {
    if (!caseId) return;
    setPdfLoading(true);
    downloadPdf(reportFilename);
  };



  return (
    <Stack gap="md" className="animate-fade-in font-body pb-8">
      {/* Action Buttons */}
      {caseId && (
        <Group gap="xs" justify="flex-end">
          <Tooltip label="Mở file PDF trong tab mới để in ấn hoặc đọc toàn màn hình">
            <Button
              component="a"
              href={pdfViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="default"
              size="sm"
              leftSection={<ExternalLink size={15} />}
              className="font-medium"
            >
              Mở tab mới
            </Button>
          </Tooltip>

          <Button
            leftSection={<Download size={15} />}
            color="brand"
            size="sm"
            loading={isDownloadingPdf}
            onClick={handleDownloadPdf}
            className="font-semibold cursor-pointer"
          >
            Tải Báo Cáo PDF
          </Button>
        </Group>
      )}

      {/* Embedded PDF Viewer */}
        {/* Embedded PDF Viewer with lazy loading */}
        {caseId && (
          <div className="relative w-full h-[820px] rounded-xl overflow-hidden border border-border-app bg-surface-app">
            <LoadingOverlay visible={pdfLoading} />
            <iframe
              src={pdfViewUrl}
              className="w-full h-full border-0"
              title={`Báo cáo phản biện - ${projectName}`}
              onLoad={() => setPdfLoading(false)}
            />
          </div>
        )}

    </Stack>
  );
}
