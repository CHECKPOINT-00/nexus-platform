"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePaymentUpload } from "../hooks/usePaymentUpload";
import { Case } from "@/types";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  CreditCard, 
  Copy, 
  Clock,
  ExternalLink,
  Receipt,
  Calendar,
  X
} from "lucide-react";
import { Button, Badge, Group, Alert, Card, Tabs, Table } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { 
  getCaseEffectivePrice, 
  formatPrice, 
  validatePaymentProof, 
  canUploadProof, 
  paymentWindowRemaining,
  isPaymentSatisfied
} from "@/lib/pricing";

interface TabPaymentProps {
  caseData: Case;
}

export default function TabPayment({ caseData }: TabPaymentProps) {
  const caseId = caseData.id;
  const { uploadProof, isUploading, uploadProgress, error: uploadError, reset } = usePaymentUpload(caseId);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [step, setStep] = useState<1 | 2>(1);
  const [randomSuffix, setRandomSuffix] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storageKey = `nexus-payment-suffix-${caseId}`;
      let suffix = localStorage.getItem(storageKey);
      if (!suffix) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        suffix = "";
        for (let i = 0; i < 4; i++) {
          suffix += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        localStorage.setItem(storageKey, suffix);
      }
      setRandomSuffix(suffix);
    }
  }, [caseId]);

  useEffect(() => {
    if (!caseData || !caseData.payment_window_expires_at) return;
    
    const updateTimer = () => {
      setTimeLeft(paymentWindowRemaining(caseData));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [caseData]);

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "Đã hết hạn";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
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
    if (validatePaymentProof(file)) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await uploadProof({ file: selectedFile, transferContent: addInfo });
      if (typeof window !== "undefined") {
        localStorage.removeItem(`nexus-payment-suffix-${caseId}`);
      }
      setSelectedFile(null);
      setIsSuccess(true);
      notifications.show({
        title: "Gửi minh chứng thành công",
        message: "Hóa đơn chuyển khoản đã được tải lên và đang chờ Admin duyệt.",
        color: "teal",
      });
      setTimeout(() => {
        setIsSuccess(false);
        setStep(1);
      }, 2000);
    } catch (e) {
      // Error handled by hook
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    notifications.show({
      title: "Đã sao chép",
      message: `Đã sao chép ${label} vào bộ nhớ tạm.`,
      color: "green",
      autoClose: 2000,
    });
  };

  const removeFile = () => {
    setSelectedFile(null);
    reset();
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
      case "verified":
        return <Badge color="teal" variant="light" className="font-normal text-[10px]">Đã duyệt</Badge>;
      case "pending_verification":
      case "proof_submitted":
      case "pending":
        return <Badge color="yellow" variant="light" className="font-normal text-[10px]">Chờ xác nhận</Badge>;
      case "rejected":
        return <Badge color="red" variant="light" className="font-normal text-[10px]">Bị từ chối</Badge>;
      case "refunded":
        return <Badge color="gray" variant="light" className="font-normal text-[10px]">Đã hoàn tiền</Badge>;
      default:
        return <Badge color="gray" variant="light" className="font-normal text-[10px]">{status}</Badge>;
    }
  };

  const amount = getCaseEffectivePrice(caseData);
  const addInfo = `${caseData.case_code}${randomSuffix}`.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  const bankId = process.env.NEXT_PUBLIC_PAYMENT_BANK_ID || "mb";
  const accNo = process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NO || "0909090909";
  const accName = process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME || "NEXUS PLATFORM";
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accNo}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accName)}`;
  const paymentsList = caseData.payments || [];
  const requiresUpload = canUploadProof(caseData);
  const isSatisfied = isPaymentSatisfied(caseData);

  return (
    <div className="space-y-6 animate-fade-in font-body text-xs text-text-app">
      {/* Title Header */}
      <div className="flex justify-between items-start border-b border-border-app/40 pb-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-text-app">Quản lý Thanh toán &amp; Hóa đơn</h2>
          <p className="text-xs text-text-muted mt-1">
            Xem thông tin tài khoản chuyển khoản, thực hiện giao dịch và quản lý các minh chứng hóa đơn.
          </p>
        </div>
        {caseData.payment_window_expires_at && requiresUpload && (
          <span className="text-red-500 font-semibold font-mono flex items-center gap-1 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 px-2.5 py-1 rounded text-xs">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Thời gian còn lại: {formatCountdown(timeLeft)}</span>
          </span>
        )}
      </div>

      <Tabs defaultValue="info" color="brand" variant="default" radius="md">
        <Tabs.List className="border-b border-border-app/50 mb-6">
          <Tabs.Tab value="info" leftSection={<CreditCard className="w-4 h-4" />}>
            <span className="text-sm">Thông tin thanh toán &amp; Nộp minh chứng</span>
          </Tabs.Tab>
          <Tabs.Tab value="history" leftSection={<Receipt className="w-4 h-4" />}>
            <span className="text-sm">Hóa đơn &amp; Minh chứng đã nộp ({paymentsList.length})</span>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="info" className="pt-2">
          <div className="max-w-4xl space-y-6">
            {isSatisfied ? (
              <div className="bg-success-soft/30 border border-success/15 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 shadow-sm py-10">
                <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h3 className="font-heading font-bold text-base text-text-app">Đã thanh toán thành công</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Hồ sơ của bạn đã được thanh toán và kích hoạt đầy đủ quyền lợi xử lý chuyên môn. Supporter sẽ sớm bắt đầu làm việc.
                  </p>
                </div>
              </div>
            ) : caseData.payment_status === "proof_submitted" || caseData.payment_status === "pending_verification" ? (
              <div className="bg-brand-soft/30 border border-brand/15 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 shadow-sm py-10">
                <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h3 className="font-heading font-bold text-base text-text-app">Đang chờ xác nhận giao dịch</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Minh chứng chuyển khoản của bạn đã được tiếp nhận. Đội ngũ kiểm toán của Nexus sẽ phê duyệt giao dịch trong thời gian sớm nhất (thường dưới 15 phút).
                  </p>
                </div>
              </div>
            ) : requiresUpload ? (
              <div className="space-y-4">
                {/* Steps Indicator */}
                <div className="flex items-center gap-6 pb-2 w-full max-w-md">
                  <div className={`flex items-center gap-2 flex-1 pb-2 border-b-2 ${step === 1 ? "border-brand" : "border-border-app"}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 1 ? "bg-brand text-white" : "bg-success-soft text-success"}`}>
                      {step > 1 ? "✓" : "1"}
                    </span>
                    <span className={`font-bold ${step === 1 ? "text-text-app" : "text-text-muted"}`}>Thông tin chuyển khoản</span>
                  </div>
                  <div className={`flex items-center gap-2 flex-1 pb-2 border-b-2 ${step === 2 ? "border-brand" : "border-border-app"}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? "bg-brand text-white" : "bg-surface-soft text-text-muted border border-border-app"}`}>
                      2
                    </span>
                    <span className={`font-bold ${step === 2 ? "text-text-app" : "text-text-subtle"}`}>Tải lên biên lai</span>
                  </div>
                </div>

                {step === 1 ? (
                  <div className="bg-surface-app border border-border-app p-6 rounded-2xl space-y-5 shadow-sm">
                    <h3 className="font-heading font-bold text-sm text-text-app flex items-center gap-2 border-b border-border-app/55 pb-3">
                      <CreditCard className="w-4 h-4 text-brand" />
                      <span>Thông tin chuyển khoản ngân hàng &amp; QR</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                      <div className="md:col-span-3 space-y-0.5 divide-y divide-border-app/45">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-text-muted">Ngân hàng</span>
                          <span className="font-bold">{process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME || "Chưa cấu hình"}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-text-muted">Số tài khoản</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm tracking-wide text-brand select-all">{accNo}</span>
                            <button onClick={() => copyToClipboard(accNo, "số tài khoản")} className="p-1 text-text-muted hover:text-brand hover:bg-brand-soft/40 rounded transition-all cursor-pointer">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-text-muted">Chủ tài khoản</span>
                          <span className="font-bold">{accName}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-text-muted">Số tiền cần chuyển</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-brand text-sm select-all">{formatPrice(amount)}</span>
                            <button onClick={() => copyToClipboard(amount.toString(), "số tiền")} className="p-1 text-text-muted hover:text-brand hover:bg-brand-soft/40 rounded transition-all cursor-pointer">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-text-muted">Nội dung chuyển khoản</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs uppercase px-2 py-0.5 bg-brand-soft/40 border border-brand/10 rounded text-brand font-mono select-all">
                              {addInfo}
                            </span>
                            <button onClick={() => copyToClipboard(addInfo, "nội dung chuyển khoản")} className="p-1 text-text-muted hover:text-brand hover:bg-brand-soft/40 rounded transition-all cursor-pointer">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex justify-center items-center w-full">
                        <img src={qrUrl} alt="Mã QR Chuyển khoản" className="w-full max-w-[150px] aspect-square object-contain animate-fade-in" />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border-app/40 text-[11px] leading-relaxed">
                      <div className="flex gap-2 text-red-500 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p>Vui lòng ghi chính xác nội dung chuyển khoản để hệ thống tự động nhận diện giao dịch nhanh nhất.</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border-app/40">
                      <Button size="sm" color="brand" onClick={() => setStep(2)} className="font-semibold cursor-pointer">
                        Tôi đã chuyển khoản, gửi minh chứng
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-app border border-border-app p-6 rounded-2xl space-y-5 shadow-sm">
                    <h3 className="font-heading font-bold text-sm text-text-app flex items-center gap-2 border-b border-border-app/55 pb-3">
                      <UploadCloud className="w-4 h-4 text-brand" />
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
                            dragActive ? "border-brand bg-brand-subtle/10" : "border-border-strong hover:border-brand/40 bg-surface-soft/40"
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                            className="hidden"
                          />
                          <div className="w-10 h-10 rounded-full bg-brand-soft/40 text-brand flex items-center justify-center">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-text-app">Kéo thả biên lai giao dịch vào đây hoặc click để chọn file</p>
                            <p className="text-text-muted">Hỗ trợ JPG, PNG, WEBP, HEIC hoặc HEIF (tối đa 5MB)</p>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-border-app rounded-xl p-4 bg-surface-soft/40 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-brand-soft/40 text-brand flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-text-app truncate">{selectedFile.name}</p>
                              <p className="text-text-muted">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          {!isUploading && (
                            <button onClick={removeFile} className="p-1 rounded-full hover:bg-surface-muted text-text-muted hover:text-text-app cursor-pointer">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-text-muted">
                          <span>Đang tải file lên...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                          <div className="bg-brand h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Errors & Success */}
                    {uploadError && (
                      <div className="flex items-start gap-2 p-3 bg-danger-soft border border-danger/20 text-danger rounded-lg">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {isSuccess && (
                      <div className="flex items-center gap-2 p-3 bg-success-soft border border-success/20 text-success rounded-lg">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Gửi minh chứng thành công! Đang lưu thông tin giao dịch...</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-border-app justify-end">
                      <Button onClick={() => setStep(1)} disabled={isUploading} variant="default" className="font-semibold cursor-pointer">
                        Quay lại
                      </Button>
                      <Button onClick={handleUpload} disabled={!selectedFile || isUploading || isSuccess} color="brand" className="font-semibold cursor-pointer">
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác nhận gửi minh chứng"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface-app border border-border-app p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 py-10 shadow-sm">
                <AlertCircle className="w-8 h-8 text-text-muted" />
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-sm text-text-app">Trạng thái thanh toán không hỗ trợ tải lên minh chứng</h3>
                  <p className="text-xs text-text-muted">
                    Hồ sơ hiện tại đang ở trạng thái: <strong className="text-brand">{caseData.payment_status}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="history" className="pt-2">
          <div className="space-y-4">
            {paymentsList.length === 0 ? (
              <Card withBorder radius="md" p="md" className="bg-surface-app/40 text-center py-8">
                <p className="text-text-muted text-xs">Chưa có giao dịch thanh toán hoặc minh chứng nào được nộp cho dự án này.</p>
              </Card>
            ) : (
              <Table.ScrollContainer minWidth={800}>
                <Table striped highlightOnHover withTableBorder verticalSpacing="sm" horizontalSpacing="md">
                  <Table.Thead className="bg-brand-soft">
                    <Table.Tr>
                      <Table.Th className="text-left font-semibold text-text-app">Ngày nộp</Table.Th>
                      <Table.Th className="text-left font-semibold text-text-app">Số tiền</Table.Th>
                      <Table.Th className="text-left font-semibold text-text-app">Nội dung chuyển khoản</Table.Th>
                      <Table.Th className="text-left font-semibold text-text-app">Trạng thái</Table.Th>
                      <Table.Th className="text-left font-semibold text-text-app">Biên lai</Table.Th>
                      <Table.Th className="text-left font-semibold text-text-app">Lý do từ chối (nếu bị từ chối)</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {paymentsList.map((payment) => (
                      <Table.Tr key={payment.id} className="hover:bg-surface-soft/30 transition-colors">
                        <Table.Td className="whitespace-nowrap">
                          {new Date(payment.created_at).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </Table.Td>
                        <Table.Td className="text-text-app whitespace-nowrap">
                          {formatPrice(payment.amount)}
                        </Table.Td>
                        <Table.Td>
                          <span className="font-mono text-xs uppercase px-2 py-0.5 bg-surface-muted border border-border-app/40 rounded text-text-app">
                            {payment.transfer_content || "-"}
                          </span>
                        </Table.Td>
                        <Table.Td>
                          {getPaymentStatusBadge(payment.status)}
                        </Table.Td>
                        <Table.Td>
                          {payment.proof_file_url ? (
                            <a 
                              href={payment.proof_file_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-brand hover:underline inline-flex items-center gap-1.5 cursor-pointer font-normal"
                            >
                              <span>Xem ảnh</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-text-muted">-</span>
                          )}
                        </Table.Td>
                        <Table.Td className="max-w-xs truncate text-text-muted" title={payment.rejection_reason || undefined}>
                          {payment.status === "rejected" && payment.rejection_reason ? (
                            <span className="text-danger italic font-normal">{payment.rejection_reason}</span>
                          ) : (
                            "-"
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </div>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
