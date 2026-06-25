import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button,
} from "@heroui/react";
import { Check, X } from "lucide-react";
import type { AdminPayment } from "../types";
import type { UseMutationResult } from "@tanstack/react-query";

interface PaymentsTabProps {
  payments: AdminPayment[] | undefined;
  onApprove: (paymentId: string) => void;
  onReject: (paymentId: string) => void;
}

export function PaymentsTab({ payments, onApprove, onReject }: PaymentsTabProps) {
  return (
    <div className="border border-default-200/50 rounded-lg overflow-hidden bg-surface mt-4">
      <Table aria-label="Danh sách thanh toán chờ duyệt">
        <TableHeader>
          <TableColumn>MÃ DỰ ÁN</TableColumn>
          <TableColumn>HỌC VIÊN / NHÓM</TableColumn>
          <TableColumn>SỐ TIỀN</TableColumn>
          <TableColumn>MINH CHỨNG (PROOF)</TableColumn>
          <TableColumn>TRẠNG THÁI</TableColumn>
          <TableColumn>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody>
          {payments && payments.length > 0 ? (
            payments.map((p) => (
              <TableRow key={p.id} className="hover:bg-default-50 transition-colors">
                <TableCell className="font-mono font-bold text-default-800 text-sm">
                  {p.case.case_code}
                </TableCell>
                <TableCell className="text-xs">
                  <p className="font-semibold text-default-800">{p.case.owner.name}</p>
                  <p className="text-default-400">{p.case.team_name || "Chưa đặt tên"}</p>
                </TableCell>
                <TableCell className="font-mono text-sm font-semibold text-orange-600">
                  {p.amount.toLocaleString("vi-VN")} đ
                </TableCell>
                <TableCell>
                  {p.proof_file_url ? (
                    <a
                      href={p.proof_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline hover:text-primary-600"
                    >
                      Xem minh chứng
                    </a>
                  ) : (
                    <span className="text-xs text-default-400">Không có ảnh</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      p.status === "paid"
                        ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : p.status === "rejected"
                        ? "bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400"
                        : "bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400"
                    }`}
                  >
                    {p.status === "paid" ? "Đã xác nhận" : p.status === "rejected" ? "Đã từ chối" : "Đang chờ duyệt"}
                  </span>
                </TableCell>
                <TableCell>
                  {p.status === "pending_verification" || p.status === "proof_uploaded" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApprove(p.id)}
                        className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReject(p.id)}
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold"
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        Từ chối
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-default-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="text-center text-default-400 text-xs py-8" colSpan={6}>
                Không có giao dịch thanh toán nào cần phê duyệt.
              </TableCell>
              <TableCell className="hidden" colSpan={0}></TableCell>
              <TableCell className="hidden" colSpan={0}></TableCell>
              <TableCell className="hidden" colSpan={0}></TableCell>
              <TableCell className="hidden" colSpan={0}></TableCell>
              <TableCell className="hidden" colSpan={0}></TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
