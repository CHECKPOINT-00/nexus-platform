import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { notifications } from "@mantine/notifications";

export function useCloseCase(caseId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/supporter/cases/${caseId}/close`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["supporter-cases"] });
      notifications.show({
        title: "Đã đóng case",
        message: "Case đã được đánh dấu hoàn tất và đóng thành công.",
        color: "green",
      });
    },
    onError: (err: any) => {
      notifications.show({
        title: "Không thể đóng case",
        message: err?.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
        color: "red",
      });
    },
  });

  return {
    closeCase: mutation.mutateAsync,
    isClosing: mutation.isPending,
  };
}
