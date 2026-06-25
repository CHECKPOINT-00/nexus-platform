"use client";

import React, { useState, useRef, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useCaseDetails } from "../hooks/useCaseDetails";
import { usePaymentUpload } from "../hooks/usePaymentUpload";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  CreditCard, 
  X, 
  QrCode 
} from "lucide-react";
import { Button } from "@heroui/react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CasePaymentPage({ params }: PageProps) {
  const { id: caseId } = use(params);
  const router = useRouter();
  
  // Auth Check
  const { data: session, isPending: isAuthPending } = useSession();
  
  useEffect(() => {
    if (!isAuthPending && !session) {
      router.push("/auth");
    }
  }, [session, isAuthPending, router]);

  const { caseData, isLoading: isCaseLoading, error: caseError } = useCaseDetails(caseId);
  const { uploadProof, isUploading, uploadProgress, error: uploadError, reset } = usePaymentUpload(caseId);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    reset();
    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file vượt quá 5MB. Vui lòng chọn file nhỏ hơn.");
      return;
    }
    // Validate type (image or pdf)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Chỉ chấp nhận định dạng ảnh (JPG, PNG, WEBP) hoặc PDF.");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await uploadProof(selectedFile);
      setSelectedFile(null);
      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/case/${caseId}`);
      }, 1500);
    } catch (e) {
      // Error handled by hook
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    reset();
  };

  if (isAuthPending || isCaseLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <LoadingSkeleton variant="text-block" count={1} />
        <LoadingSkeleton variant="card" count={2} />
      </div>
    );
  }

  if (caseError || !caseData) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="p-4 bg-danger-soft border border-danger/10 text-danger rounded-xl font-body text-sm">
          Không thể tải dữ liệu dự án. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  const amount = caseData.package?.price || 0;
  const addInfo = `${caseData.case_code} thanh toan`;
  const qrUrl = `https://img.vietqr.io/image/mb-0909090909-print.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=NEXUS%20PLATFORM`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 animate-fade-in font-body text-xs text-text-app">
      {/* Header Back Navigation */}
      <div className="flex items-center gap-3">
        <Button
          onPress={() => router.push(`/dashboard/case/${caseId}`)}
          variant="ghost"
          className="border border-border-strong text-text-muted hover:text-text-app text-xs font-semibold font-body h-9 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer bg-surface-app"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại dự án</span>
        </Button>
        <div>
          <h2 className="font-heading text-lg font-bold text-text-app">Thanh toán &amp; Xác minh giao dịch</h2>
          <p className="text-xs text-text-muted">Mã case: {caseData.case_code}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Left Column: Bank Details & QR (3 cols) */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-surface-app border border-border-app p-6 rounded-2xl space-y-5 shadow-sm">
            <h3 className="font-heading font-bold text-sm text-text-app flex items-center gap-2 border-b border-border-app/55 pb-3">
              <CreditCard className="w-4.5 h-4.5 text-brand" />
              <span>Thông tin chuyển khoản ngân hàng</span>
            </h3>

            <div className="space-y-3.5 divide-y divide-border-app/45 text-xs">
              <div className="flex justify-between items-center py-2">
                <span className="text-text-muted font-medium">Ngân hàng</span>
                <span className="font-bold text-text-app">MB Bank (Ngân hàng Quân Đội)</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-muted font-medium">Số tài khoản</span>
                <span className="font-bold text-sm tracking-wide text-brand select-all">0909090909</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-muted font-medium">Chủ tài khoản</span>
                <span className="font-bold text-text-app">NEXUS PLATFORM</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-muted font-medium">Số tiền cần chuyển</span>
                <span className="font-bold text-brand text-sm">
                  {formatPrice(amount)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-muted font-medium">Nội dung chuyển khoản</span>
                <span className="font-bold text-xs uppercase px-2.5 py-1 bg-brand-soft/40 border border-brand/10 rounded text-brand font-mono select-all">
                  {addInfo}
                </span>
              </div>
            </div>

            <div className="p-3 bg-brand-subtle/20 border border-brand/10 rounded-lg text-[11px] text-brand leading-relaxed">
              <strong>Lưu ý quan trọng:</strong> Vui lòng quét mã QR hoặc ghi chính xác nội dung chuyển khoản ở trên để hệ thống tự động nhận diện giao dịch nhanh hơn.
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic VietQR Code (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface-app border border-border-app p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm h-full min-h-[300px]">
            <h4 className="font-heading font-bold text-xs text-text-app mb-3 flex items-center gap-1.5 justify-center">
              <QrCode className="w-4 h-4 text-brand" />
              <span>Quét mã VietQR chuyển khoản</span>
            </h4>
            
            <div className="relative p-3 bg-white rounded-xl border border-border-app shadow-inner overflow-hidden max-w-[200px]">
              <img 
                src={qrUrl} 
                alt="Mã QR Chuyển khoản VietQR" 
                className="w-full h-auto aspect-square object-contain"
              />
            </div>
            
            <p className="font-body text-[10px] text-text-muted mt-3 leading-normal max-w-xs">
              Mã QR chứa sẵn số tiền và nội dung. Chỉ cần mở ứng dụng ngân hàng và quét để thanh toán.
            </p>
          </div>
        </div>

        {/* Full Width Bottom: Proof Upload Area */}
        <div className="md:col-span-5">
          <div className="bg-surface-app border border-border-app p-6 rounded-2xl space-y-5 shadow-sm">
            <h3 className="font-heading font-bold text-sm text-text-app flex items-center gap-2 border-b border-border-app/55 pb-3">
              <UploadCloud className="w-4.5 h-4.5 text-brand" />
              <span>Tải lên biên lai chuyển khoản thành công</span>
            </h3>

            {/* Upload Dropzone */}
            <div className="space-y-3">
              {!selectedFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    dragActive
                      ? "border-brand bg-brand-subtle/10"
                      : "border-border-strong hover:border-brand/40 bg-surface-soft/40"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-brand-soft/40 text-brand flex items-center justify-center">
                    <UploadCloud className="w-5.5 h-5.5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-body text-xs font-semibold text-text-app">
                      Kéo thả biên lai giao dịch vào đây hoặc click để chọn file
                    </p>
                    <p className="font-body text-[10px] text-text-muted">
                      Hỗ trợ định dạng ảnh JPG, PNG, WEBP hoặc file PDF (tối đa 5MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-border-app rounded-xl p-4 bg-surface-soft/40 flex items-center justify-between gap-4 animate-fade-in">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-brand-soft/40 text-brand flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 font-body text-xs">
                      <p className="font-semibold text-text-app truncate">{selectedFile.name}</p>
                      <p className="text-text-muted">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  {!isUploading && (
                    <button
                      onClick={removeFile}
                      className="p-1.5 rounded-full hover:bg-surface-muted text-text-muted hover:text-text-app cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-2 font-body text-xs animate-fade-in">
                <div className="flex justify-between text-text-muted">
                  <span>Đang tải file lên...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Error */}
            {uploadError && (
              <div className="flex items-start gap-2.5 p-3 bg-danger-soft border border-danger/20 text-danger rounded-lg text-xs font-body animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Upload Success */}
            {isSuccess && (
              <div className="flex items-center gap-2.5 p-3 bg-success-soft border border-success/20 text-success rounded-lg text-xs font-body animate-fade-in">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                <span>Gửi minh chứng thành công! Đang tự động chuyển hướng về trang dự án...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border-app justify-end">
              <Button
                onPress={() => router.push(`/dashboard/case/${caseId}`)}
                isDisabled={isUploading}
                variant="ghost"
                className="border border-border-strong text-text-muted hover:text-text-app font-body font-semibold text-xs h-10 px-5 rounded-lg cursor-pointer transition-colors bg-surface-app"
              >
                Hủy bỏ
              </Button>
              <Button
                onPress={handleUpload}
                isDisabled={!selectedFile || isUploading || isSuccess}
                className="bg-brand text-white font-body font-semibold text-xs h-10 px-6 rounded-lg hover:bg-brand-hover cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm shadow-brand/10 transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <span>Xác nhận gửi minh chứng</span>
                )}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
