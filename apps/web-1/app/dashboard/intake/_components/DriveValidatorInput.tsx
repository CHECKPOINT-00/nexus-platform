import React from "react";
import { TextInput } from "@mantine/core";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface DriveValidatorInputProps {
  value: string;
  onChange: (val: string) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  maxLength?: number;
}

export default function DriveValidatorInput({
  value,
  onChange,
  isInvalid,
  errorMessage,
  maxLength,
}: DriveValidatorInputProps) {
  const hasValue = !!value;
  const isValid = hasValue && !isInvalid;

  const rightSection = hasValue ? (
    <div className="flex items-center pr-3">
      {isValid ? (
        <CheckCircle2 className="w-4 h-4 text-success" />
      ) : (
        <AlertCircle className="w-4 h-4 text-danger" />
      )}
    </div>
  ) : null;

  return (
    <div className="space-y-2">
      <TextInput
        id="drive_url"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://drive.google.com/drive/folders/..."
        error={isInvalid ? errorMessage : undefined}
        rightSection={rightSection}
        variant="default"
        radius="md"
        maxLength={maxLength}
      />
    </div>
  );
}
