import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  TeamMemberInput as SharedTeamMemberInput,
  TeamFitInput as SharedTeamFitInput,
} from "@repo/validation";

export type TeamMemberInput = SharedTeamMemberInput;
export type TeamFitInput = SharedTeamFitInput;

export type TeamFitReport = {
  overview: string;
  fitLevel: "strong" | "moderate" | "weak" | "poor";
  fitLabel: string;
  strengths: Array<{ area: string; detail: string; evidence: string }>;
  weaknesses: Array<{
    area: string;
    severity: string;
    detail: string;
    recommendation: string;
  }>;
  recommendations: string[];
};

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosErr = error as {
      response?: { data?: { message?: string } };
    };
    if (axiosErr.response?.data?.message) {
      return axiosErr.response.data.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

export function useTeamFitMutation() {
  return useMutation<TeamFitReport, Error, TeamFitInput>({
    mutationFn: async (input: TeamFitInput) => {
      const res = await apiClient.post<TeamFitReport>(
        "/ai-engine/team-fit",
        input,
      );
      return res.data;
    },
    onError: (error) => {
      const message = extractErrorMessage(error);
      console.error("[useTeamFitMutation]", message);
    },
  });
}

export default useTeamFitMutation;
