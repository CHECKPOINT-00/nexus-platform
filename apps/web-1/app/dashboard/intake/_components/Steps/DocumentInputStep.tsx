"use client";

import React, { useState } from "react";
import { Alert, Checkbox, Button, Tooltip } from "@mantine/core";
import { CheckCircle2, HelpCircle, Copy, Download } from "lucide-react";
import DriveValidatorInput from "../DriveValidatorInput";

interface DocumentInputStepProps {
  form: any;
  values: any;
}

const DOCUMENT_TYPE_OPTIONS = [
  { label: "Báo cáo ý tưởng (Draft Report)", value: "Báo cáo ý tưởng" },
  { label: "Slide thuyết trình (Pitch Deck)", value: "Slide thuyết trình" },
  {
    label: "Phân tích đối thủ (Competitor Analysis)",
    value: "Phân tích đối thủ cạnh tranh",
  },
  {
    label: "Khảo sát & Phỏng vấn khách hàng (Customer Research)",
    value: "Khảo sát khách hàng",
  },
  {
    label: "Đề cương phân công (Task Assignment)",
    value: "Đề cương phân công",
  },
  {
    label: "Tài liệu bổ sung khác (Other resources)",
    value: "Tài liệu bổ sung",
  },
];

const TEMPLATE_MD_URL = "/idea-template/TEMPLATE_STARTUP_CHECKPOINT1_V2.md";
const TEMPLATE_DOCX_URL = "/idea-template/TEMPLATE_STARTUP_CHECKPOINT1_V2.docx";

export default function DocumentInputStep({ form, values }: DocumentInputStepProps) {
  const [templateMessage, setTemplateMessage] = useState<string>("");

  const handleTemplateAction = async (value: "copy_markdown" | "download_docx") => {
    try {
      if (value === "copy_markdown") {
        const response = await fetch(TEMPLATE_MD_URL);
        if (!response.ok) {
          throw new Error("Không thể tải template Markdown.");
        }
        const text = await response.text();
        await navigator.clipboard.writeText(text);
        setTemplateMessage("Đã copy template Markdown. Bạn có thể dán ra ngoài để điền nhanh.");
      }

      if (value === "download_docx") {
        window.open(TEMPLATE_DOCX_URL, "_blank", "noopener,noreferrer");
        setTemplateMessage("Đã mở file .docx template trong tab mới để bạn tải về.");
      }
    } catch (error) {
      setTemplateMessage(
        value === "copy_markdown"
          ? "Copy template Markdown thất bại. Hãy thử lại hoặc tải file .docx."
          : "Không thể mở file .docx template. Hãy thử lại sau.",
      );
    }
  };

  return (
    <div className="space-y-5 font-body">
      <div className="flex items-center gap-1.5 pb-1">
        <h3 className="font-heading text-base font-bold text-text-app">Hồ sơ của nhóm đã có sẵn chưa?</h3>
        <Tooltip
          label="Dán link thư mục hoặc Google Docs nhóm đã chuẩn bị. Supporter sẽ đọc trực tiếp từ đây, nên bạn không cần viết lại toàn bộ ý tưởng."
          position="top"
          multiline
          w={260}
          withArrow
        >
          <span className="flex items-center">
            <HelpCircle className="w-4 h-4 text-text-muted hover:text-text-app cursor-help" />
          </span>
        </Tooltip>
      </div>

      <Alert
        variant="light"
        color="blue"
        radius="md"
        title="Chưa có hồ sơ hoặc ý tưởng còn mơ hồ?"
        icon={<CheckCircle2 className="w-4 h-4" />}
      >
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Nếu nhóm chưa có proposal đủ rõ, hãy dùng template có sẵn để điền nhanh các phần cốt lõi. Sau khi hoàn tất, đưa file vào Google Drive rồi dán link ở đây.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <Button
              variant="default"
              size="xs"
              leftSection={<Copy className="w-3.5 h-3.5 text-blue-500" />}
              onClick={() => handleTemplateAction("copy_markdown")}
              className="font-body font-semibold cursor-pointer h-9 px-3 rounded-lg text-xs bg-surface-app hover:bg-surface-hover border-border-app text-text-app"
            >
              Copy template Markdown
            </Button>
            <Button
              variant="default"
              size="xs"
              leftSection={<Download className="w-3.5 h-3.5 text-blue-500" />}
              onClick={() => handleTemplateAction("download_docx")}
              className="font-body font-semibold cursor-pointer h-9 px-3 rounded-lg text-xs bg-surface-app hover:bg-surface-hover border-border-app text-text-app"
            >
              Tải file .docx template
            </Button>
          </div>
          {templateMessage ? <p className="text-xs text-text-muted font-medium mt-1">{templateMessage}</p> : null}
        </div>
      </Alert>

      <form.Field name="documents">
        {(parentField: any) => {
          const docs = parentField.state.value || [];
          const firstDoc = docs[0] || {
            source_type: "drive",
            drive_url: "",
            document_type: "",
            role_description: "",
          };

          const selectedTypes = firstDoc.document_type
            ? firstDoc.document_type
                .split(", ")
                .map((t: string) => t.trim())
                .filter(Boolean)
            : [];

          const handleUrlChange = (url: string) => {
            const nextDoc = {
              ...firstDoc,
              drive_url: url,
            };
            parentField.handleChange([nextDoc]);
          };

          const handleCheckboxChange = (checkboxValues: string[]) => {
            const nextDocType = checkboxValues.join(", ");
            const nextRoleDesc =
              checkboxValues.length > 0
                ? `Thư mục tài liệu của nhóm chứa: ${nextDocType}`
                : "Thư mục tài liệu của nhóm";

            const nextDoc = {
              ...firstDoc,
              document_type: nextDocType,
              role_description: nextRoleDesc,
            };
            parentField.handleChange([nextDoc]);
            parentField.handleBlur();
          };

          const hasUrlError =
            (parentField.state.meta.isTouched || !!firstDoc.drive_url) &&
            (!firstDoc.drive_url || !/^https?:\/\/(drive|docs)\.google\.com\/.*/.test(firstDoc.drive_url.trim()));

          const hasTypeSelectionError = parentField.state.meta.isTouched && selectedTypes.length === 0;

          return (
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-sm font-bold text-text-app">
                    Liên kết thư mục Google Drive hồ sơ <span className="text-danger">*</span>
                  </label>
                  <Tooltip
                    label="Supporter và hệ thống AI sẽ đọc tài liệu trong thư mục này để chuẩn bị phản biện. Hãy đảm bảo đã cấp quyền 'Bất kỳ ai có liên kết'."
                    multiline
                    w={220}
                    withArrow
                  >
                    <span className="flex items-center">
                      <HelpCircle className="w-3.5 h-3.5 text-text-muted hover:text-text-app cursor-help" />
                    </span>
                  </Tooltip>
                </div>
                <DriveValidatorInput
                  value={firstDoc.drive_url || ""}
                  onChange={handleUrlChange}
                  isInvalid={hasUrlError}
                  errorMessage={
                    hasUrlError
                      ? !firstDoc.drive_url
                        ? "Đường dẫn thư mục Google Drive là bắt buộc."
                        : "Đường dẫn phải là liên kết Google Drive hoặc Google Docs hợp lệ."
                      : undefined
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-sm font-bold text-text-app">
                    Tài liệu minh chứng nhóm đã chuẩn bị <span className="text-danger">*</span>
                  </label>
                  <Tooltip
                    label="Chọn các tài liệu nhóm đã chuẩn bị sẵn bên trong thư mục Google Drive nộp phản biện."
                    multiline
                    w={220}
                    withArrow
                  >
                    <span className="flex items-center">
                      <HelpCircle className="w-3.5 h-3.5 text-text-muted hover:text-text-app cursor-help" />
                    </span>
                  </Tooltip>
                </div>
                <div
                  className={`p-4 border rounded-xl bg-surface-soft/60 mt-2 transition-all ${
                    hasTypeSelectionError ? "border-danger bg-danger-soft/5" : "border-border-strong"
                  }`}
                >
                  <Checkbox.Group value={selectedTypes} onChange={handleCheckboxChange}>
                    <div className="flex flex-col gap-2.5">
                      {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                        <Checkbox key={opt.value} value={opt.value} label={opt.label} radius="sm" size="xs" />
                      ))}
                    </div>
                  </Checkbox.Group>
                </div>

                {hasTypeSelectionError && (
                  <p className="text-xs text-red-500 font-body pl-1 mt-1">
                    Vui lòng chọn ít nhất một loại tài liệu có trong thư mục.
                  </p>
                )}
              </div>
            </div>
          );
        }}
      </form.Field>
    </div>
  );
}
