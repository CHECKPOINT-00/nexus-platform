import { Input } from "@heroui/react";
import { AlertCircle } from "lucide-react";

interface StepDocumentProps {
  driveUrl: string;
  driveValidationError: string;
  onDriveUrlChange: (v: string) => void;
  onClearError: () => void;
}

export function StepDocument({
  driveUrl, driveValidationError, onDriveUrlChange, onClearError,
}: StepDocumentProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-orange-50/50 dark:bg-orange-950/5 p-4 rounded-md border border-orange-200/40 text-sm text-default-600 leading-relaxed">
        <span className="font-bold text-default-800 block mb-1">Quy định liên kết tài liệu:</span>
        Vui lòng cung cấp link Google Drive chứa file tài liệu checkpoint của nhóm. Đảm bảo liên kết đã được cấp quyền truy cập dạng{" "}
        <strong>&ldquo;Bất kỳ ai có liên kết đều có thể xem&rdquo;</strong> để supporter/AI đọc được bài.
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="drive-url" className="text-sm font-bold text-default-700">
          Đường dẫn tài liệu Google Drive / Docs
        </label>
        <Input
          id="drive-url"
          type="url"
          placeholder="https://drive.google.com/file/d/..."
          value={driveUrl}
          onChange={(e) => {
            onDriveUrlChange(e.target.value);
            onClearError();
          }}
        />
        {driveValidationError && (
          <span className="text-xs text-danger-500 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {driveValidationError}
          </span>
        )}
      </div>
    </div>
  );
}
