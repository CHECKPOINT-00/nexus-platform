"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  AlertCircle,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Lightbulb,
  Play,
  ShieldAlert,
  AlertTriangle,
  Award,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button, Badge, Progress, Paper, Text, Group, Stack, Card, Accordion } from "@mantine/core";

export interface RichReportData {
  projectName?: string;
  overallScore?: number;
  verdict?: string;
  executiveSummary?: string;
  categoryScores?: {
    problemClarity?: number;
    marketViability?: number;
    businessModel?: number;
    competitiveMoat?: number;
    executionFeasibility?: number;
  };
  fieldStatuses?: Array<{
    field: string;
    status: string;
    note?: string;
  }>;
  criticalWeaknesses?: Array<{
    id?: string;
    title?: string;
    severity?: "BLOCKER" | "MAJOR" | "MINOR";
    sectionOrSlide?: string;
    rootCause?: string;
    recommendation?: string;
  }>;
  keyStrengths?: string[];
  mandatoryQuestions?: string[];
  actionPlan?: string[];
  reportMarkdown?: string;
  findings?: Array<{
    field: string;
    status: string;
    evidence: string;
    reason: string;
    question: string;
    next_action: string;
  }>;
}

interface TabReportFindingsProps {
  report: { content_md: string } | null;
  caseId?: string;
}

export default function TabReportFindings({ report, caseId }: TabReportFindingsProps) {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const parsedReport = useMemo<RichReportData | null>(() => {
    if (!report?.content_md) return null;
    try {
      const data = JSON.parse(report.content_md) as unknown;
      if (data && typeof data === "object") {
        return data as RichReportData;
      }
    } catch {
      // Content is plain markdown or unparsed string
    }
    return null;
  }, [report?.content_md]);

  const handleDownloadPdf = () => {
    if (!caseId) return;
    window.open(`/api/reports/${caseId}/pdf`, "_blank");
  };

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

  // 1. Trường hợp có dữ liệu cấu trúc chuẩn Checkpoint 1 (OMP Rich Report)
  if (parsedReport && (typeof parsedReport.overallScore === "number" || parsedReport.categoryScores)) {
    const score = parsedReport.overallScore ?? 65;
    const verdict = parsedReport.verdict || (score >= 80 ? "READY FOR REALITY CHECK" : score >= 60 ? "PARTIALLY READY FOR REALITY CHECK" : "NOT READY FOR REALITY CHECK");

    const getVerdictBadge = () => {
      if (score >= 80) {
        return <Badge color="green" size="lg" variant="filled">ĐỦ ĐIỀU KIỆN KIỂM CHỨNG (READY)</Badge>;
      }
      if (score >= 60) {
        return <Badge color="yellow" size="lg" variant="filled">ĐỦ ĐIỀU KIỆN MỘT PHẦN (PARTIALLY READY)</Badge>;
      }
      return <Badge color="red" size="lg" variant="filled">CHƯA ĐỦ ĐIỀU KIỆN (NOT READY)</Badge>;
    };

    return (
      <Stack gap="lg" className="animate-fade-in font-body pb-12">
        {/* Top Header Card */}
        <Paper withBorder radius="md" p="lg" className="bg-surface-app border-border-app">
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <div>
              <Group gap="xs" align="center">
                <Award className="w-5 h-5 text-brand" />
                <Text fw={700} size="md" className="font-heading text-text-app">
                  Báo Cáo Thẩm Định Ý Tưởng Khởi Nghiệp (Checkpoint 1)
                </Text>
              </Group>
              <Text size="xs" c="dimmed" mt={4}>
                Dự án: {parsedReport.projectName || "Dự án sinh viên"} • Tra cứu đối chiếu 14 tiêu chí chuẩn học kỳ EXE101
              </Text>
            </div>

            {caseId && (
              <Button
                leftSection={<Download size={16} />}
                color="brand"
                size="sm"
                onClick={handleDownloadPdf}
                className="font-semibold cursor-pointer"
              >
                Tải Báo Cáo PDF (A4 Vector)
              </Button>
            )}
          </Group>

          {/* Score & Verdict Box */}
          <div className="mt-6 p-5 rounded-lg bg-surface-soft border border-border-app flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Text size="xs" fw={600} c="dimmed" className="uppercase tracking-wider">
                Điểm Đánh Giá Tổng Quát
              </Text>
              <div className="text-3xl font-black text-text-app mt-1">
                {score} <span className="text-base font-normal text-text-muted">/ 100</span>
              </div>
            </div>
            <div>{getVerdictBadge()}</div>
          </div>
        </Paper>

        {/* Executive Summary */}
        {parsedReport.executiveSummary && (
          <Paper withBorder radius="md" p="md" className="bg-surface-app border-border-app">
            <Text fw={600} size="sm" mb="xs" className="font-heading text-text-app flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              Tóm Tắt Đánh Giá Điều Hành
            </Text>
            <Text size="xs" className="text-text-muted leading-relaxed whitespace-pre-wrap">
              {parsedReport.executiveSummary}
            </Text>
          </Paper>
        )}

        {/* 5 Category Scores */}
        {parsedReport.categoryScores && (
          <Card withBorder radius="md" p="md" className="bg-surface-app border-border-app">
            <Text fw={600} size="sm" mb="md" className="font-heading text-text-app">
              Thước Đo 5 Trọng Tâm Khởi Nghiệp
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Group justify="space-between" mb={4}>
                  <Text size="xs">Độ rõ của Vấn đề (Problem Clarity)</Text>
                  <Text size="xs" fw={700}>{parsedReport.categoryScores.problemClarity ?? 60}%</Text>
                </Group>
                <Progress value={parsedReport.categoryScores.problemClarity ?? 60} color="blue" size="sm" radius="xl" />
              </div>

              <div>
                <Group justify="space-between" mb={4}>
                  <Text size="xs">Tiềm năng Thị trường (Market Viability)</Text>
                  <Text size="xs" fw={700}>{parsedReport.categoryScores.marketViability ?? 60}%</Text>
                </Group>
                <Progress value={parsedReport.categoryScores.marketViability ?? 60} color="teal" size="sm" radius="xl" />
              </div>

              <div>
                <Group justify="space-between" mb={4}>
                  <Text size="xs">Mô hình Kinh doanh (Business Model)</Text>
                  <Text size="xs" fw={700}>{parsedReport.categoryScores.businessModel ?? 60}%</Text>
                </Group>
                <Progress value={parsedReport.categoryScores.businessModel ?? 60} color="indigo" size="sm" radius="xl" />
              </div>

              <div>
                <Group justify="space-between" mb={4}>
                  <Text size="xs">Rào cản Cạnh tranh (Competitive Moat)</Text>
                  <Text size="xs" fw={700}>{parsedReport.categoryScores.competitiveMoat ?? 60}%</Text>
                </Group>
                <Progress value={parsedReport.categoryScores.competitiveMoat ?? 60} color="violet" size="sm" radius="xl" />
              </div>

              <div className="md:col-span-2">
                <Group justify="space-between" mb={4}>
                  <Text size="xs">Tính khả thi Thực thi (Execution Feasibility)</Text>
                  <Text size="xs" fw={700}>{parsedReport.categoryScores.executionFeasibility ?? 60}%</Text>
                </Group>
                <Progress value={parsedReport.categoryScores.executionFeasibility ?? 60} color="cyan" size="sm" radius="xl" />
              </div>
            </div>
          </Card>
        )}

        {/* 14 Field Statuses */}
        {parsedReport.fieldStatuses && parsedReport.fieldStatuses.length > 0 && (
          <Card withBorder radius="md" p="md" className="bg-surface-app border-border-app">
            <Text fw={600} size="sm" mb="sm" className="font-heading text-text-app">
              Bảng Rà Soát 14 Tiêu Chí Chuẩn EXE101
            </Text>
            <Accordion variant="separated" radius="md">
              {parsedReport.fieldStatuses.map((fs, idx) => {
                const isGood = fs.status.toLowerCase().includes("good");
                return (
                  <Accordion.Item key={idx} value={`field-${idx}`}>
                    <Accordion.Control>
                      <Group justify="space-between" wrap="nowrap">
                        <Text size="xs" fw={600}>{fs.field}</Text>
                        <Badge size="xs" color={isGood ? "green" : "orange"} variant="light">
                          {fs.status}
                        </Badge>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text size="xs" c="dimmed">{fs.note || "Không có ghi chú thêm."}</Text>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Card>
        )}

        {/* Critical Weaknesses */}
        {parsedReport.criticalWeaknesses && parsedReport.criticalWeaknesses.length > 0 && (
          <Card withBorder radius="md" p="md" className="bg-surface-app border-border-app">
            <Text fw={600} size="sm" mb="sm" className="font-heading text-text-app flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Danh Mục Lỗi Logic Cần Khắc Phục
            </Text>
            <Stack gap="sm">
              {parsedReport.criticalWeaknesses.map((w, idx) => {
                const isBlocker = w.severity === "BLOCKER";
                const isMajor = w.severity === "MAJOR";
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      isBlocker
                        ? "bg-red-500/5 border-red-500/20"
                        : isMajor
                        ? "bg-orange-500/5 border-orange-500/20"
                        : "bg-yellow-500/5 border-yellow-500/20"
                    }`}
                  >
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" fw={700} c={isBlocker ? "red" : isMajor ? "orange" : "yellow"}>
                        {w.title || `Vấn đề #${idx + 1}`}
                      </Text>
                      <Badge size="xs" color={isBlocker ? "red" : isMajor ? "orange" : "yellow"}>
                        {w.severity || "MAJOR"}
                      </Badge>
                    </Group>
                    {w.sectionOrSlide && (
                      <Text size="xs" c="dimmed" mb={4}>Vị trí: {w.sectionOrSlide}</Text>
                    )}
                    {w.rootCause && (
                      <Text size="xs" className="mb-2"><strong>Nguyên nhân cốt lõi:</strong> {w.rootCause}</Text>
                    )}
                    {w.recommendation && (
                      <Text size="xs" c="teal"><strong>Khuyến nghị khắc phục:</strong> {w.recommendation}</Text>
                    )}
                  </div>
                );
              })}
            </Stack>
          </Card>
        )}

        {/* Mandatory Questions & Key Strengths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parsedReport.keyStrengths && parsedReport.keyStrengths.length > 0 && (
            <Card withBorder radius="md" p="md" className="bg-surface-app border-border-app">
              <Text fw={600} size="sm" mb="sm" className="font-heading text-text-app flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Điểm Sáng Đáng Ghi Nhận
              </Text>
              <ul className="space-y-2 text-xs text-text-muted pl-4 list-disc">
                {parsedReport.keyStrengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </Card>
          )}

          {parsedReport.mandatoryQuestions && parsedReport.mandatoryQuestions.length > 0 && (
            <Card withBorder radius="md" p="md" className="bg-surface-app border-border-app">
              <Text fw={600} size="sm" mb="sm" className="font-heading text-text-app flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-brand" />
                Câu Hỏi Bắt Buộc Nhóm Phải Trả Lời
              </Text>
              <ul className="space-y-2 text-xs text-text-muted pl-4 list-disc">
                {parsedReport.mandatoryQuestions.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Action Plan */}
        {parsedReport.actionPlan && parsedReport.actionPlan.length > 0 && (
          <Card withBorder radius="md" p="md" className="bg-surface-app border-border-app">
            <Text fw={600} size="sm" mb="sm" className="font-heading text-text-app flex items-center gap-1.5">
              <Play className="w-4 h-4 text-brand" />
              Kế Hoạch Hành Động 7 Ngày Khắc Phục
            </Text>
            <Stack gap="xs">
              {parsedReport.actionPlan.map((act, idx) => (
                <Text key={idx} size="xs" className="text-text-muted">
                  <strong>Ngày {idx + 1}:</strong> {act}
                </Text>
              ))}
            </Stack>
          </Card>
        )}

        {/* Bottom Download PDF Button */}
        {caseId && (
          <Group justify="center" mt="md">
            <Button
              leftSection={<Download size={18} />}
              size="md"
              color="brand"
              onClick={handleDownloadPdf}
              className="font-semibold cursor-pointer"
            >
              Tải Báo Cáo PDF (Bản A4 Vector Chính Thức)
            </Button>
          </Group>
        )}
      </Stack>
    );
  }

  // 2. Trường hợp là báo cáo theo format cũ (findings list)
  const findings = parsedReport?.findings || [];
  if (findings.length > 0) {
    return (
      <div className="bg-surface-app border border-border-app rounded-lg p-6 md:p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between pb-2 border-b border-border-app/55">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-brand" />
            <div>
              <h3 className="font-heading font-semibold text-sm text-text-app">Kết quả phản biện thực tế</h3>
              <p className="font-body text-text-muted text-xs">
                Dưới đây là các điểm cần làm rõ/cải thiện được tìm thấy trong bản nộp của bạn.
              </p>
            </div>
          </div>
          {caseId && (
            <Button size="xs" color="brand" leftSection={<Download size={14} />} onClick={handleDownloadPdf}>
              Tải PDF
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {findings.map((finding, idx) => {
            const isExpanded = !!expandedIndices[idx];
            return (
              <div key={idx} className="border border-border-app rounded-md overflow-hidden bg-surface-app">
                <div
                  onClick={() => toggleExpand(idx)}
                  className="p-4 md:p-5 flex justify-between items-center gap-4 cursor-pointer select-none bg-surface-soft/40"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold font-body uppercase border border-brand text-brand">
                      {finding.field}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-danger-soft text-danger border border-danger/10 text-xs font-semibold font-body">
                      {finding.status}
                    </span>
                    <h4 className="font-heading font-semibold text-xs text-text-app line-clamp-1">
                      {finding.question}
                    </h4>
                  </div>
                  <div className="text-text-subtle shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border-app p-5 space-y-4 font-body text-xs leading-relaxed text-text-app animate-slide-down">
                    <div className="space-y-1">
                      <span className="font-semibold text-text-muted flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-text-subtle" />
                        Bằng chứng dẫn chiếu:
                      </span>
                      <blockquote className="border-l-2 border-border-strong pl-3 py-1 bg-surface-soft text-text-muted italic rounded-r">
                        {finding.evidence || "Không tìm thấy thông tin đối chiếu trong tài liệu nộp."}
                      </blockquote>
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-text-muted flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-text-subtle" />
                        Lý do đánh giá:
                      </span>
                      <p className="pl-5 text-text-app">{finding.reason}</p>
                    </div>

                    <div className="space-y-1 p-3 bg-brand-soft/20 border border-brand/10 rounded-lg">
                      <span className="font-semibold text-brand flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-brand" />
                        Câu hỏi phản biện:
                      </span>
                      <p className="pl-5 text-brand-hover font-medium">{finding.question}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-success flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 text-success" />
                        Hành động tiếp theo gợi ý:
                      </span>
                      <p className="pl-5 text-text-app whitespace-pre-wrap">{finding.next_action}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Fallback khi là Plain Markdown thuần
  return (
    <Card withBorder radius="md" p="lg" className="bg-surface-app border-border-app animate-fade-in font-body">
      <Group justify="space-between" mb="md">
        <Text fw={700} size="md">Báo Cáo Phản Biện</Text>
        {caseId && (
          <Button size="xs" color="brand" leftSection={<Download size={14} />} onClick={handleDownloadPdf}>
            Tải PDF
          </Button>
        )}
      </Group>
      <div className="prose prose-sm max-w-none text-text-app leading-relaxed whitespace-pre-wrap">
        {report.content_md}
      </div>
    </Card>
  );
}
