import React from "react";
import { TextField, Input, FieldError } from "@heroui/react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface DriveValidatorInputProps {
  value: string;
  onChange: (val: string) => void;
  isInvalid?: boolean;
  errorMessage?: string;
}

export default function DriveValidatorInput({
  value,
  onChange,
  isInvalid,
  errorMessage,
}: DriveValidatorInputProps) {
  const hasValue = !!value;
  const isValid = hasValue && !isInvalid;

  const endContent = hasValue ? (
    <div className="flex items-center">
      {isValid ? (
        <CheckCircle2 className="w-4 h-4 text-success" />
      ) : (
        <AlertCircle className="w-4 h-4 text-danger" />
      )}
    </div>
  ) : null;

  return (
    <div className="space-y-2">
      <TextField isInvalid={isInvalid} className="w-full">
        <div className="relative flex items-center">
          <Input
            id="drive_url"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
            className={`w-full bg-surface-soft border rounded-lg text-xs h-10 font-body text-text-app focus:outline-none px-3 pr-10 transition-all ${
              isInvalid
                ? "border-danger focus:border-danger ring-1 ring-danger/20 text-danger"
                : "border-border-strong focus:border-brand"
            }`}
          />
          {endContent && (
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              {endContent}
            </div>
          )}
        </div>
        <FieldError className="text-[10px] text-danger font-body font-semibold pl-1 mt-0.5">
          {errorMessage}
        </FieldError>
      </TextField>
    </div>
  );
}
