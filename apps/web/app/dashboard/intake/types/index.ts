export interface ServicePackage {
  id: string;
  name: string;
  price: number;
}

export interface IntakeFormState {
  packageId: string;
  teamName: string;
  school: string;
  courseContext: string;
  idea: string;
  customer: string;
  painPoint: string;
  alternatives: string;
  teamCapability: string;
  driveUrl: string;
}

export const STEPS = [
  { id: "package", label: "Chọn gói" },
  { id: "context", label: "Thông tin nhóm" },
  { id: "idea", label: "Ý tưởng" },
  { id: "customer_pain", label: "Khách hàng & Vấn đề" },
  { id: "alternatives", label: "Giải pháp thay thế" },
  { id: "document", label: "Tài liệu Drive" },
] as const;

export type StepId = typeof STEPS[number]["id"];
