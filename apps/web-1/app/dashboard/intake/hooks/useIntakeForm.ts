import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { IntakeData } from "../_types/intake.types";

const LOCAL_STORAGE_KEY = "nexus_intake_draft";

const INITIAL_VALUES: IntakeData = {
  package_id: "",
  current_blocker: "",
  current_situations: [],
  case_summary: "",
  contact: {
    full_name: "",
    student_code: "",
    team_role: "",
    zalo: "",
    email: "",
    telegram: "",
  },
  team_context: {
    group_no: "",
    project_name: "",
    team_status_summary: "",
  },
  support_needs: {
    primary_need: "",
    extra_notes: "",
  },
  documents: [
    {
      source_type: "drive",
      drive_url: "",
      document_type: "",
      role_description: "",
    },
  ],
  lecturer_feedback: "",
  deadline: "",
  urgency: "normal",
  expected_outputs: "",
  boundary_confirmations: [],
  school: "",
  course_context: "",
};

export function useIntakeForm(initialPackageId?: string | null) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoaded, setIsLoaded] = useState(false);

  const [draftValues, setDraftValues] = useState<IntakeData>({
    ...INITIAL_VALUES,
    package_id: initialPackageId || "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setDraftValues((prev) => ({
            ...prev,
            ...parsed,
            package_id: initialPackageId || parsed.package_id || "",
          }));
        } catch (e) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
      setIsLoaded(true);
    }
  }, [initialPackageId]);

  const submitMutation = useMutation({
    mutationFn: async (data: IntakeData) => {
      const response = await apiClient.post("/cases", data);
      return response.data;
    },
    onSuccess: (newCase) => {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      router.push(`/dashboard/case/${newCase.id}`);
    },
  });

  const form = useForm({
    defaultValues: draftValues,
    onSubmit: async ({ value }) => {
      await submitMutation.mutateAsync(value);
    },
  });

  useEffect(() => {
    if (isLoaded) {
      form.reset(draftValues);
    }
  }, [isLoaded, draftValues, form]);

  const saveDraft = (values: IntakeData) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values));
    }
  };

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setDraftValues({
      ...INITIAL_VALUES,
      package_id: initialPackageId || "",
    });
    form.reset({
      ...INITIAL_VALUES,
      package_id: initialPackageId || "",
    });
  };

  return {
    form,
    isLoaded,
    saveDraft,
    clearDraft,
    isSubmitting: submitMutation.isPending,
    error: submitMutation.error ? (submitMutation.error as any).response?.data?.message || "Đã xảy ra lỗi khi tạo hồ sơ." : null,
  };
}
