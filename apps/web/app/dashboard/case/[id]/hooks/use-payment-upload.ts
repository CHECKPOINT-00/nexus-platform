"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function usePaymentUpload(caseId: string) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const onOpen = () => setIsOpen(true);
  const onOpenChange = (open: boolean) => setIsOpen(open);

  const handleFileUpload = async () => {
    if (!file) {
      setUploadError("Vui lòng chọn tệp ảnh minh chứng.");
      return;
    }
    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("case_id", caseId);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/payments/proof`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Tải tệp thất bại");
      }

      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      setFile(null);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải tệp lên.";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  return {
    isOpen,
    onOpen,
    onOpenChange,
    file,
    setFile,
    uploading,
    uploadError,
    setUploadError,
    handleFileUpload,
  };
}
