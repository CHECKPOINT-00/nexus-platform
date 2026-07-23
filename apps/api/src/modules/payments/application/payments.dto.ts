export interface UploadPaymentProofRequest {
  caseId: string;
  file: {
    name: string;
    size: number;
    arrayBuffer: () => Promise<ArrayBuffer>;
  };
}

export interface VerifyPaymentRequest {
  status: "paid" | "rejected";
  rejection_reason?: string;
}

export interface CreatePaymentRequest {
  caseId: string;
  amount: number;
  metadataJson?: Record<string, unknown>;
}

export interface CreatePaymentResponse {
  paymentId: string;
  bankInfo: BankInfo;
}

export interface GetPaymentResponse {
  id: string;
  case_id: string;
  case_code?: string;
  package_id: string;
  amount: number;
  status: string;
  proof_file_url: string | null;
  metadata_json: Record<string, unknown> | null;
  rejection_reason: string | null;
  verified_by_auth_user_id: string | null;
  verified_at: string | null;
  created_at: string;
  bankInfo: BankInfo;
}

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  transferContent: string;
}
