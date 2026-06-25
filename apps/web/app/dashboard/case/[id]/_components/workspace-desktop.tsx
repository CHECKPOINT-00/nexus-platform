import { Tabs } from "@heroui/react";
import { ActivityLog } from "./activity-log";
import { IntakeTab } from "./intake-tab";
import { ReportTab } from "./report-tab";
import { SupporterDraft } from "./supporter-draft";
import { ChatPanel } from "./chat-panel";
import type { CaseDetails, Message, LifecycleUnit, Finding, Report, IntakeData } from "../types";
import type { UseMutationResult } from "@tanstack/react-query";

interface WorkspaceDesktopProps {
  c: CaseDetails;
  versions: LifecycleUnit[];
  selectedVersionCode: string;
  onVersionChange: (code: string) => void;
  intakeData: IntakeData | null;
  isSupporter: boolean;
  draftReport: Report | undefined;
  approvedReport: Report | undefined;
  approvedFindings: Finding[];
  messages: Message[] | undefined;
  currentUserId: string | undefined;
  generateDraftMutation: UseMutationResult<unknown, unknown, void, unknown>;
  saveDraftMutation: UseMutationResult<unknown, unknown, { reportId: string; content: string }, unknown>;
  approveReportMutation: UseMutationResult<unknown, unknown, string, unknown>;
  sendMessageMutation: UseMutationResult<unknown, unknown, string, unknown>;
}

export function WorkspaceDesktop({
  c,
  versions,
  selectedVersionCode,
  onVersionChange,
  intakeData,
  isSupporter,
  draftReport,
  approvedReport,
  approvedFindings,
  messages,
  currentUserId,
  generateDraftMutation,
  saveDraftMutation,
  approveReportMutation,
  sendMessageMutation,
}: WorkspaceDesktopProps) {
  return (
    <div className="hidden lg:grid grid-cols-12 gap-6 items-start">
      {/* Left: Activity log */}
      <div className="col-span-3 flex flex-col gap-4">
        <div className="p-4 border border-default-200/50 bg-surface rounded-lg">
          <h3 className="text-sm font-bold mb-4 font-display text-default-800 uppercase tracking-wider">
            Lịch sử hoạt động
          </h3>
          <ActivityLog events={c.events} />
        </div>
      </div>

      {/* Middle: Workspace tabs */}
      <div className="col-span-6 flex flex-col gap-4">
        <Tabs variant="secondary">
          <Tabs.ListContainer>
            <Tabs.List aria-label="Tài nguyên dự án" className="border-b border-default-200">
              <Tabs.Tab id="inputs">
                Ý tưởng nộp
                <Tabs.Indicator className="bg-orange-500" />
              </Tabs.Tab>
              <Tabs.Tab id="report">
                Nhận xét phản biện
                <Tabs.Indicator className="bg-orange-500" />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          <Tabs.Panel id="inputs">
            <IntakeTab
              versions={versions}
              selectedVersionCode={selectedVersionCode}
              onVersionChange={onVersionChange}
              intakeData={intakeData}
            />
          </Tabs.Panel>

          <Tabs.Panel id="report">
            <div className="flex flex-col gap-4 mt-3">
              {isSupporter && (
                <SupporterDraft
                  draftReport={draftReport}
                  approvedReport={approvedReport}
                  generateDraftMutation={generateDraftMutation}
                  saveDraftMutation={saveDraftMutation}
                  approveReportMutation={approveReportMutation}
                />
              )}
              <ReportTab
                approvedFindings={approvedFindings}
                userFacingStage={c.user_facing_stage}
                isSupporter={isSupporter}
              />
            </div>
          </Tabs.Panel>
        </Tabs>
      </div>

      {/* Right: Chat */}
      <div className="col-span-3 flex flex-col gap-4">
        <ChatPanel
          messages={messages}
          currentUserId={currentUserId}
          sendMessageMutation={sendMessageMutation}
        />
      </div>
    </div>
  );
}
