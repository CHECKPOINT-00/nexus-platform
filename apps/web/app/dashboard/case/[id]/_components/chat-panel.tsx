"use client";

import { useForm } from "@tanstack/react-form";
import { Input, Button } from "@heroui/react";
import { Send, MessageSquare } from "lucide-react";
import type { Message } from "../types";
import type { UseMutationResult } from "@tanstack/react-query";

interface ChatPanelProps {
  messages: Message[] | undefined;
  currentUserId: string | undefined;
  sendMessageMutation: UseMutationResult<any, any, string, any>;
}

export function ChatPanel({ messages, currentUserId, sendMessageMutation }: ChatPanelProps) {
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
    <div className="p-4 border border-default-200/50 bg-surface rounded-lg flex flex-col h-[400px]">
      <h3 className="text-sm font-bold mb-4 font-display text-default-800 uppercase tracking-wider flex items-center gap-1.5">
        <MessageSquare className="w-4 h-4 text-orange-500" />
        Thảo luận
      </h3>

      {/* Messages list */}
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
              <span className="text-[10px] text-default-400">
                {m.sender.name} ({m.sender_role_snapshot === "supporter" ? "Mentor" : "Học viên"})
              </span>
              <p
                className={`p-2.5 rounded-md leading-relaxed ${
                  isMsgOwner
                    ? "bg-orange-500 text-white rounded-br-none"
                    : "bg-default-100 text-default-800 rounded-bl-none border border-default-200/50"
                }`}
              >
                {m.content}
              </p>
            </div>
          );
        })}
      </div>

      {/* Input form */}
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
              aria-label="Nhập tin nhắn"
              placeholder="Nhập nội dung trao đổi..."
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
  );
}
