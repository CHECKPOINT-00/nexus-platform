import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useState } from "react";

export function usePaymentUpload(caseId: string) {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("caseId", caseId);
      formData.append("file", file);

      setUploadProgress(0);

      const response = await apiClient.post("/payments/proof", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      return response.data;
    },
    onSuccess: () => {
      // Invalidate case details query to pick up pending_verification payment state
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      setUploadProgress(100);
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  return {
    uploadProof: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    error: uploadMutation.error ? (uploadMutation.error as any).response?.data?.message || "Không thể tải lên minh chứng thanh toán." : null,
    reset: () => {
      uploadMutation.reset();
      setUploadProgress(0);
    },
  };
}
