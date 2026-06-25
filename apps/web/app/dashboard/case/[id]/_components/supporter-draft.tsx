import { useState } from "react";
import { Card, Button, TextArea } from "@heroui/react";
import type { Report } from "../types";
import type { UseMutationResult } from "@tanstack/react-query";

interface SupporterDraftProps {
  draftReport: Report | undefined;
  approvedReport: Report | undefined;
  generateDraftMutation: UseMutationResult<any, any, void, any>;
  saveDraftMutation: UseMutationResult<any, any, { reportId: string; content: string }, any>;
  approveReportMutation: UseMutationResult<any, any, string, any>;
}

export function SupporterDraft({
  draftReport,
  approvedReport,
  generateDraftMutation,
  saveDraftMutation,
  approveReportMutation,
}: SupporterDraftProps) {
  const [generatingReport, setGeneratingReport] = useState(false);
  const [editingReportText, setEditingReportText] = useState("");
  const [approvingReport, setApprovingReport] = useState(false);

  const triggerAiDraft = () => {
    setGeneratingReport(true);
    generateDraftMutation.mutate(undefined, {
      onSuccess: (data: any) => setEditingReportText(data.content_md),
      onSettled: () => setGeneratingReport(false),
    });
  };

  const triggerApproveReport = () => {
    if (!draftReport) return;
    if (confirm("Xác nhận phê duyệt và gửi báo cáo này cho sinh viên?")) {
      setApprovingReport(true);
      approveReportMutation.mutate(draftReport.id, {
        onSettled: () => setApprovingReport(false),
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {!draftReport && !approvedReport && (
        <div className="p-8 border border-dashed border-default-300 rounded-lg bg-surface text-center flex flex-col items-center gap-4">
          <p className="text-sm text-default-500">
            AI chưa tạo bản nháp phản biện cho dự án này. Hãy kích hoạt động cơ phản biện AI.
          </p>
          <Button
            onPress={triggerAiDraft}
            variant="ghost"
            isPending={generatingReport}
            className="font-bold shadow-sm"
          >
            Kích hoạt Phản biện AI
          </Button>
        </div>
      )}

      {draftReport && (
        <Card className="border border-orange-200 bg-orange-50/20 shadow-none rounded-md">
          <Card.Header className="border-b border-orange-100 p-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold font-display text-orange-800">Soạn thảo báo cáo phản biện</h3>
              <p className="text-[10px] text-orange-600 mt-0.5">
                Bản nháp phản biện tự động sinh từ AI, bạn có thể chỉnh sửa tự do trước khi duyệt.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={triggerApproveReport}
                isPending={approvingReport}
                className="font-bold shadow-sm"
              >
                Phê duyệt &amp; Gửi báo cáo
              </Button>
            </div>
          </Card.Header>
          <Card.Content className="p-4">
            <TextArea
              aria-label="Soạn thảo báo cáo"
              value={editingReportText || draftReport.content_md}
              onChange={(e) => setEditingReportText(e.target.value)}
              rows={15}
              className="bg-background text-sm font-mono"
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button
                size="sm"
                variant="ghost"
                className="border-default-300"
                onClick={() =>
                  saveDraftMutation.mutate({ reportId: draftReport.id, content: editingReportText })
                }
              >
                Lưu nháp tạm thời
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
}
