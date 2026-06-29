"use client";

import React, { useState, useRef } from "react";
import { Drawer, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { usePaymentUpload } from "../hooks/usePaymentUpload";
import { Case } from "@/types";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";

interface PaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: Case;
}

export default function PaymentDrawer({ isOpen, onClose, caseData }: PaymentDrawerProps) {
  const { uploadProof, isUploading, uploadProgress, error, reset } = usePaymentUpload(caseData.id);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      notifications.show({
        title: "Kích thước file quá lớn",
        message: "Kích thước file vượt quá 5MB. Vui lòng chọn file nhỏ hơn.",
        color: "red",
      });
      return;
    }
    // Validate type (image or pdf)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      notifications.show({
        title: "Định dạng không hợp lệ",
        message: "Chỉ chấp nhận định dạng ảnh (JPG, PNG, WEBP) hoặc PDF.",
        color: "red",
      });
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await uploadProof(selectedFile);
      setSelectedFile(null);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e) {
      // Error handled by hook
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    reset();
  };

  const handleClose = () => {
    setSelectedFile(null);
    reset();
    onClose();
  };

  return (
    <Drawer
      opened={isOpen}
      onClose={handleClose}
      title={
        <div>
          <h3 className="font-heading text-lg font-bold text-text-app">Thanh toán &amp; Xác minh</h3>
          <p className="font-body text-xs text-text-muted mt-0.5">
            Thực hiện chuyển khoản và tải lên minh chứng để kích hoạt hồ sơ.
          </p>
        </div>
      }
      position="right"
      size="md"
    >
      <div className="space-y-6 pt-4 font-body text-xs text-text-app">
        {/* Bank Transfer Instructions */}
        <div className="bg-brand-subtle/20 border border-brand/10 p-5 rounded-xl space-y-4">
          <h4 className="font-heading font-semibold text-sm text-brand flex items-center gap-2">
            <CreditCardIcon className="w-4 h-4" />
            <span>Thông tin chuyển khoản</span>
          </h4>
          
          <div className="space-y-3 font-body text-xs text-text-app divide-y divide-brand/5">
            <div className="flex justify-between items-center py-2">
              <span className="text-text-muted">Ngân hàng</span>
              <span className="font-bold">MB Bank (Ngân hàng Quân Đội)</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-text-muted">Số tài khoản</span>
              <span className="font-bold text-sm tracking-wide text-brand">0909090909</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-text-muted">Chủ tài khoản</span>
              <span className="font-bold">NEXUS PLATFORM</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-text-muted">Số tiền cần chuyển</span>
              <span className="font-bold text-brand text-sm">
                {formatPrice(caseData.package?.price || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-text-muted">Nội dung chuyển khoản</span>
              <span className="font-bold text-xs uppercase px-2 py-1 bg-brand-soft/40 border border-brand/10 rounded text-brand font-mono">
                {caseData.case_code} thanh toan
              </span>
            </div>
          </div>
          
          <p className="font-body text-[11px] text-text-muted leading-relaxed italic text-center pt-2">
            Lưu ý: Vui lòng ghi chính xác nội dung chuyển khoản để hệ thống tự động nhận diện giao dịch nhanh hơn.
          </p>
        </div>

        {/* Upload Dropzone */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-app font-body">Tải lên biên lai chuyển tiền</label>
          
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
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="font-body text-xs font-semibold text-text-app">
                  Kéo thả biên lai giao dịch vào đây hoặc click để chọn file
                </p>
                <p className="font-body text-[10px] text-text-muted">
                  Hỗ trợ định dạng JPG, PNG, WEBP hoặc PDF (tối đa 5MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-border-app rounded-xl p-4 bg-surface-soft/40 flex items-center justify-between gap-4">
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
                  className="p-1 rounded-full hover:bg-surface-muted text-text-muted hover:text-text-app cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Progress / Status / Action */}
        {isUploading && (
          <div className="space-y-2 font-body text-xs">
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

        {error && (
          <div className="flex items-start gap-2 p-3 bg-danger-soft border border-danger/20 text-danger rounded-lg text-xs font-body">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {uploadProgress === 100 && !error && !isUploading && (
          <div className="flex items-center gap-2 p-3 bg-success-soft border border-success/20 text-success rounded-lg text-xs font-body">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Gửi minh chứng thành công! Đang đóng cửa sổ...</span>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-border-app">
          <Button
            onClick={handleClose}
            disabled={isUploading}
            variant="default"
            className="flex-1 text-text-muted hover:text-text-app font-body font-semibold text-xs h-10 cursor-pointer"
          >
            Đóng
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            color="brand"
            className="flex-1 font-body font-semibold text-xs h-10 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang gửi...</span>
              </>
            ) : (
              <span>Gửi minh chứng</span>
            )}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
