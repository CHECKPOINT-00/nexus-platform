"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../../lib/api-client";
import { validateDriveLink } from "../../../../lib/utils/drive-validator";
import { STEPS, type ServicePackage, type IntakeFormState } from "../types";

const DRAFT_KEY = "nexus_intake_draft";

export function useIntakeForm() {
  const router = useRouter();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [driveValidationError, setDriveValidationError] = useState("");

  // Form fields
  const [packageId, setPackageId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [school, setSchool] = useState("");
  const [courseContext, setCourseContext] = useState("");
  const [idea, setIdea] = useState("");
  const [customer, setCustomer] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [alternatives, setAlternatives] = useState("");
  const [teamCapability, setTeamCapability] = useState("");
  const [driveUrl, setDriveUrl] = useState("");

  const { data: packages, isLoading: loadingPackages } = useQuery<ServicePackage[]>({
    queryKey: ["packages"],
    queryFn: () => apiClient<ServicePackage[]>("/api/packages"),
  });

  // Restore from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    try {
      const parsed: IntakeFormState & { currentStepIdx?: number } = JSON.parse(saved);
      setPackageId(parsed.packageId || "");
      setTeamName(parsed.teamName || "");
      setSchool(parsed.school || "");
      setCourseContext(parsed.courseContext || "");
      setIdea(parsed.idea || "");
      setCustomer(parsed.customer || "");
      setPainPoint(parsed.painPoint || "");
      setAlternatives(parsed.alternatives || "");
      setTeamCapability(parsed.teamCapability || "");
      setDriveUrl(parsed.driveUrl || "");
      setCurrentStepIdx(parsed.currentStepIdx || 0);
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  const saveDraft = (newStepIdx?: number) => {
    const draft = {
      packageId, teamName, school, courseContext, idea,
      customer, painPoint, alternatives, teamCapability, driveUrl,
      currentStepIdx: newStepIdx !== undefined ? newStepIdx : currentStepIdx,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  };

  const handleNext = () => {
    const stepId = STEPS[currentStepIdx]?.id;
    if (stepId === "package" && !packageId) {
      setFormError("Vui lòng lựa chọn gói dịch vụ để tiếp tục.");
      return;
    }
    if (stepId === "idea" && !idea) {
      setFormError("Vui lòng mô tả ý tưởng khởi nghiệp của bạn.");
      return;
    }
    if (stepId === "customer_pain" && (!customer || !painPoint)) {
      setFormError("Vui lòng nhập đầy đủ thông tin về khách hàng mục tiêu và vấn đề cốt lõi.");
      return;
    }
    if (stepId === "document") {
      const check = validateDriveLink(driveUrl);
      if (!check.isValid) {
        setDriveValidationError(check.error || "");
        return;
      }
    }
    setFormError("");
    setDriveValidationError("");
    const nextIdx = currentStepIdx + 1;
    setCurrentStepIdx(nextIdx);
    saveDraft(nextIdx);
  };

  const handlePrev = () => {
    setFormError("");
    setDriveValidationError("");
    const prevIdx = currentStepIdx - 1;
    setCurrentStepIdx(prevIdx);
    saveDraft(prevIdx);
  };

  const handleSubmit = async () => {
    const check = validateDriveLink(driveUrl);
    if (!check.isValid) {
      setDriveValidationError(check.error || "");
      return;
    }
    setLoading(true);
    setFormError("");
    try {
      const result = await apiClient<{ id: string }>("/api/cases", {
        method: "POST",
        json: {
          package_id: packageId, team_name: teamName, school, course_context: courseContext,
          idea, customer, pain_point: painPoint, alternatives,
          team_capability: teamCapability, drive_url: driveUrl,
        },
      });
      localStorage.removeItem(DRAFT_KEY);
      router.push(`/dashboard/case/${result.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tạo dự án. Vui lòng kiểm tra lại kết nối.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  const activeStep = STEPS[currentStepIdx]?.id || "";

  return {
    // Step state
    currentStepIdx,
    activeStep,
    // Form fields & setters
    packageId, setPackageId,
    teamName, setTeamName,
    school, setSchool,
    courseContext, setCourseContext,
    idea, setIdea,
    customer, setCustomer,
    painPoint, setPainPoint,
    alternatives, setAlternatives,
    teamCapability, setTeamCapability,
    driveUrl, setDriveUrl,
    // Query
    packages, loadingPackages,
    // Errors
    formError, driveValidationError, setDriveValidationError,
    // Actions
    loading, saveDraft, handleNext, handlePrev, handleSubmit,
  };
}
