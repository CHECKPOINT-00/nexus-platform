"use client";

import { useForm } from "@tanstack/react-form";
import { Tabs, Input, Button } from "@heroui/react";
import { Send, FileText } from "lucide-react";
import { VersionSelector } from "../../../../../components/case/version-selector";
import { ActivityLog } from "./activity-log";
import { FindingCard } from "./finding-card";
import type { CaseDetails, Message, LifecycleUnit, Finding, IntakeData } from "../types";
import type { UseMutationResult } from "@tanstack/react-query";

interface WorkspaceMobileProps {
  c: CaseDetails;
  versions: LifecycleUnit[];
  selectedVersionCode: string;
  onVersionChange: (code: string) => void;
  intakeData: IntakeData | null;
  approvedFindings: Finding[];
  messages: Message[] | undefined;
  currentUserId: string | undefined;
  sendMessageMutation: UseMutationResult<unknown, unknown, string, unknown>;
}

export function WorkspaceMobile({
  c,
  versions,
  selectedVersionCode,
  onVersionChange,
  intakeData,
  approvedFindings,
  messages,
  currentUserId,
  sendMessageMutation,
}: WorkspaceMobileProps) {
  const form = useForm({
    defaultValues: {
      message: "",
    },
    onSubmit: async ({ value, formApi }) => {
      if (!value.message.trim()) return;
      sendMessageMutation.mutate(value.message, {
        onSuccess: () => formApi.reset(),
      });
    },
  });

  return (
    <div className="lg:hidden mt-4">
      <Tabs variant="secondary" className="w-full">
        <Tabs.ListContainer>
          <Tabs.List
            aria-label="Tabs điều khiển di động"
            className="border-b border-default-200 w-full flex justify-between"
          >
            <Tabs.Tab id="mob-work" className="flex-1 text-center">
              Dự án
              <Tabs.Indicator className="bg-orange-500" />
            </Tabs.Tab>
            <Tabs.Tab id="mob-report" className="flex-1 text-center">
              Phản biện
              <Tabs.Indicator className="bg-orange-500" />
            </Tabs.Tab>
            <Tabs.Tab id="mob-timeline" className="flex-1 text-center">
              Lịch sử
              <Tabs.Indicator className="bg-orange-500" />
            </Tabs.Tab>
            <Tabs.Tab id="mob-chat" className="flex-1 text-center">
              Thảo luận
              <Tabs.Indicator className="bg-orange-500" />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        {/* Work tab */}
        <Tabs.Panel id="mob-work">
          <div className="flex flex-col gap-4 mt-3">
            <div className="flex justify-between items-center bg-surface p-4 border border-default-200/50 rounded-lg">
              <VersionSelector
                versions={versions}
                selectedVersionCode={selectedVersionCode}
                onVersionChange={onVersionChange}
              />
              {intakeData?.drive_url && (
                <a
                  href={intakeData.drive_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline font-medium hover:text-primary-600 flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" />
                  Tài liệu gốc
                </a>
              )}
            </div>
            <div className="flex flex-col gap-4 bg-surface p-4 border border-default-200/50 rounded-lg">
              <h4 className="text-xs font-bold text-default-400 uppercase">Ý tưởng kinh doanh</h4>
              <p className="text-sm text-default-800 whitespace-pre-wrap">
                {intakeData?.idea || "Chưa cung cấp"}
              </p>
            </div>
          </div>
        </Tabs.Panel>

        {/* Report tab */}
        <Tabs.Panel id="mob-report">
          <div className="flex flex-col gap-4 mt-3">
            {approvedFindings.length > 0 ? (
              approvedFindings.map((f, idx) => (
                <FindingCard key={idx} finding={f} index={idx} />
              ))
            ) : (
              <div className="p-8 text-center bg-surface border border-dashed border-default-300 rounded-lg text-default-400 text-sm">
                Chưa có báo cáo phản biện.
              </div>
            )}
          </div>
        </Tabs.Panel>

        {/* Timeline tab */}
        <Tabs.Panel id="mob-timeline">
          <div className="p-4 border border-default-200/50 bg-surface rounded-lg mt-3">
            <ActivityLog events={c.events} />
          </div>
        </Tabs.Panel>

        {/* Chat tab */}
        <Tabs.Panel id="mob-chat">
          <div className="p-4 border border-default-200/50 bg-surface rounded-lg flex flex-col h-[400px] mt-3">
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 text-xs">
              {messages?.map((m) => {
                const isMsgOwner = m.sender_auth_user_id === currentUserId;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col gap-1 max-w-[85%] ${
                      isMsgOwner ? "self-end items-end" : "self-start"
                    }`}
                  >
                    <span className="text-[10px] text-default-400">{m.sender.name}</span>
                    <p
                      className={`p-2.5 rounded-md leading-relaxed ${
                        isMsgOwner
                          ? "bg-orange-500 text-white rounded-br-none"
                          : "bg-default-100 text-default-800 rounded-bl-none"
                      }`}
                    >
                      {m.content}
                    </p>
                  </div>
                );
              })}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="flex gap-2 border-t border-default-100 pt-3 mt-3"
            >
              <form.Field name="message">
                {(field) => (
                  <Input
                    aria-label="Nhập tin nhắn di động"
                    placeholder="Trao đổi tin nhắn..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
              <Button
                isIconOnly
                size="sm"
                variant="primary"
                type="submit"
                isPending={sendMessageMutation.isPending}
                isDisabled={sendMessageMutation.isPending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
