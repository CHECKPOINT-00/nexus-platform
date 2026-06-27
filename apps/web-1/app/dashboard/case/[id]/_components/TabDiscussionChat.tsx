"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCaseChat } from "../hooks/useCaseChat";
import { useSession } from "@/lib/auth-client";
import { Send, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { ActionIcon, Textarea } from "@mantine/core";

interface TabDiscussionChatProps {
  caseId: string;
}

export default function TabDiscussionChat({ caseId }: TabDiscussionChatProps) {
  const { data: session } = useSession();
  const { messages, isLoading, error, sendMessage, isSending } = useCaseChat(caseId);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      await sendMessage(inputText.trim());
      setInputText("");
    } catch (err) {
      // Handled by hook
    }
  };

  const isMyMessage = (msg: any) => {
    return msg.sender_auth_user_id === session?.user?.id;
  };

  const getSenderName = (msg: any) => {
    if (isMyMessage(msg)) return "Tôi";
    return msg.sender?.name || "Người dùng";
  };

  const getSenderBadge = (role?: string) => {
    if (role === "admin") return "Admin";
    if (role === "supporter") return "Supporter";
    return "Sinh viên";
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-surface-app border border-border-app rounded-lg p-6 md:p-8 space-y-6 flex flex-col h-[500px] animate-fade-in">
      {/* Messages list container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-text-muted">
            <MessageSquare className="w-8 h-8 text-text-subtle" />
            <p className="font-body text-xs">Chưa có tin nhắn nào. Gửi phản hồi để bắt đầu trao đổi.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = isMyMessage(msg);
            const role = msg.sender?.role;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Message Box */}
                <div className="space-y-1">
                  {/* Sender name & badge */}
                  <p className={`text-[10px] text-text-muted font-body flex items-center gap-1.5 ${isMe ? "justify-end" : ""}`}>
                    <span className="font-semibold text-text-app">{getSenderName(msg)}</span>
                    {!isMe && (
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        role === "admin" 
                          ? "bg-danger-soft text-danger" 
                          : role === "supporter" 
                          ? "bg-brand-soft text-brand" 
                          : "bg-surface-muted text-text-muted border border-border-app"
                      }`}>
                        {getSenderBadge(role)}
                      </span>
                    )}
                  </p>

                  {/* Bubble content */}
                  <div className={`p-3 rounded-2xl text-xs font-body leading-relaxed break-words max-w-md ${
                    isMe 
                      ? "bg-brand text-white rounded-tr-none" 
                      : "bg-surface-soft border border-border-app text-text-app rounded-tl-none"
                  }`}>
                    {msg.content}
                  </div>
                  
                  {/* Time stamp */}
                  <p className={`text-[9px] text-text-subtle font-body ${isMe ? "text-right" : ""}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Area */}
      <form onSubmit={handleSend} className="border-t border-border-app pt-4 flex gap-3 items-end">
        <Textarea
          aria-label="Nhập câu hỏi hoặc nội dung phản hồi"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập câu hỏi hoặc nội dung phản hồi..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          minRows={1}
          maxRows={4}
          autosize
        />
        
        <ActionIcon
          type="submit"
          disabled={!inputText.trim() || isSending}
          size={40}
          radius="md"
          color="brand"
          className="shrink-0 cursor-pointer"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </ActionIcon>
      </form>

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-danger text-[10px] font-body">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{(error as any)?.message || String(error)}</span>
        </div>
      )}
    </div>
  );
}
