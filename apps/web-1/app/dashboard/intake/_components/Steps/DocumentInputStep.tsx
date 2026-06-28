"use client";

import React from "react";
import { Checkbox, Tooltip } from "@mantine/core";
import { HelpCircle } from "lucide-react";
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

export default function DocumentInputStep({
  form,
  values,
}: DocumentInputStepProps) {
  return (
    <div className="space-y-5 font-body">
      <div className="space-y-1">
        <h3 className="font-heading text-base font-bold text-text-app">
          Tài liệu đầu vào &amp; Minh chứng
        </h3>
        <p className="font-body text-xs text-text-muted">
          Cung cấp liên kết thư mục làm việc Google Drive và các tài liệu đi kèm.
        </p>
      </div>

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

          const handleCheckboxChange = (values: string[]) => {
            const nextDocType = values.join(", ");
            const nextRoleDesc =
              values.length > 0
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
            (!firstDoc.drive_url ||
              firstDoc.drive_url.length > 500 ||
              !/^https?:\/\/(drive|docs)\.google\.com\/.*/.test(
                firstDoc.drive_url.trim(),
              ));

          const hasTypeSelectionError =
            parentField.state.meta.isTouched && selectedTypes.length === 0;

          return (
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-text-app">
                    Liên kết thư mục Google Drive dự án{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <Tooltip
                    label="Vui lòng cấp quyền xem liên kết thư mục ('Bất kỳ ai có liên kết đều có thể xem') để AI có thể truy cập các tài liệu bên trong."
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
                  maxLength={1000}
                  errorMessage={
                    hasUrlError
                      ? !firstDoc.drive_url
                        ? "Đường dẫn thư mục Google Drive là bắt buộc."
                        : firstDoc.drive_url.length > 500
                        ? "Đường dẫn không được vượt quá 500 ký tự."
                        : "Đường dẫn phải là liên kết Google Drive hoặc Google Docs hợp lệ."
                      : undefined
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-text-app">
                    Các tài liệu có trong thư mục{" "}
                    <span className="text-danger">*</span>
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
                    hasTypeSelectionError
                      ? "border-danger bg-danger-soft/5"
                      : "border-border-strong"
                  }`}
                >
                  <Checkbox.Group
                    value={selectedTypes}
                    onChange={handleCheckboxChange}
                  >
                    <div className="flex flex-col gap-2.5">
                      {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                        <Checkbox
                          key={opt.value}
                          value={opt.value}
                          label={opt.label}
                          radius="sm"
                          size="xs"
                        />
                      ))}
                    </div>
                  </Checkbox.Group>
                </div>

                {hasTypeSelectionError && (
                  <p className="text-[10px] text-danger font-body font-semibold pl-1 mt-0.5">
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
