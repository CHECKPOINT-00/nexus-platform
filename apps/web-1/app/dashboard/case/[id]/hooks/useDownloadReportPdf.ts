"use client";

import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { apiClient } from "@/lib/api-client";

export function useDownloadReportPdf(caseId: string) {
  return useMutation({
    mutationFn: async (overrideFilename?: string | void) => {
      const response = await apiClient.get(`/reports/${caseId}/pdf`, {
        responseType: "blob",
      });

      let filename = overrideFilename;
      if (!filename) {
        const disposition = response.headers["content-disposition"] as string | undefined;
        if (disposition && disposition.includes("filename=")) {
          const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            filename = match[1].replace(/['"]/g, "").trim();
          }
        }
      }
      if (!filename) {
        filename = `Bao_cao_phan_bien_${caseId.slice(0, 8)}.pdf`;
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return filename;
    },
    onSuccess: (filename) => {
      notifications.show({
        title: "Tải báo cáo thành công",
        message: `Đã tải xuống file ${filename}`,
        color: "teal",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Không thể tải báo cáo PDF",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi tạo hoặc tải file PDF. Vui lòng thử lại sau.",
        color: "red",
      });
    },
  });
}
