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
