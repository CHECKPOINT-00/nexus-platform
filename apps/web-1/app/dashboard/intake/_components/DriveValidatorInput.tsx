import React, { useState } from "react";
import { Input } from "@heroui/react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface DriveValidatorInputProps {
  value: string;
  onChange: (val: string) => void;
  onValidStateChange?: (isValid: boolean) => void;
}

export default function DriveValidatorInput({ value, onChange, onValidStateChange }: DriveValidatorInputProps) {
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (url: string) => {
    if (!url) {
      setError("Đường dẫn tài liệu là bắt buộc");
      onValidStateChange?.(false);
      return false;
    }
    
    // Regular expression for google drive / docs URL
    const isDriveUrl = /^(https?:\/\/)?(drive|docs)\.google\.com\/(drive\/folders\/|file\/d\/|document\/d\/|presentation\/d\/|spreadsheets\/d\/|folderview\?|open\?|)/.test(url) && url.includes("google.com");
    
    if (!isDriveUrl) {
      setError("Đường dẫn phải là liên kết Google Drive hoặc Google Docs hợp lệ");
      onValidStateChange?.(false);
      return false;
    }

    setError(null);
    onValidStateChange?.(true);
    return true;
  };

  const handleInputChange = (val: string) => {
    onChange(val);
    validateUrl(val);
  };

  const isValid = value && !error;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id="drive_url"
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="https://drive.google.com/file/d/..."
          className="w-full bg-surface-soft border border-border-app rounded-lg text-sm h-10 font-body text-text-app focus:outline-brand pr-10"
        />
        {value && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            {isValid ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <AlertCircle className="w-5 h-5 text-danger" />
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-danger font-body flex items-start gap-1">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      <p className="text-[11px] text-text-subtle font-body">
        * Lưu ý: Vui lòng cấp quyền xem liên kết ("Bất kỳ ai có liên kết đều có thể xem") để AI có thể phân tích tài liệu.
      </p>
    </div>
  );
}
