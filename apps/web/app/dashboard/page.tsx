"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
} from "@heroui/react";
import { apiClient } from "../../lib/api-client";
import { authClient } from "../../lib/auth-client";
import { Plus, ArrowRight, ClipboardList } from "lucide-react";
import { useEffect } from "react";

interface Case {
  id: string;
  case_code: string;
  team_name: string | null;
  course_context: string | null;
  user_facing_stage: string;
  payment_status: string;
  internal_status: string;
  created_at: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const { data: session, isPending: loadingSession } = authClient.useSession();

  // Get cases
  const { data: cases, isLoading: loadingCases } = useQuery<Case[]>({
    queryKey: ["my-cases"],
    queryFn: () => apiClient<Case[]>("/api/cases"),
    enabled: !!session,
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loadingSession && !session) {
      router.push("/auth");
    }
  }, [session, loadingSession, router]);

  if (loadingSession || loadingCases) {
    return (
      <div className="flex flex-col justify-center items-center py-24">
        <Spinner size="lg" />
        <p className="text-sm text-default-500 mt-2">Đang tải dữ liệu của bạn...</p>
      </div>
    );
  }

  if (!session) return null;

  const renderStatus = (c: Case) => {
    // Determine user-friendly color and label based on state (Rule 9)
    if (c.payment_status === "unpaid") {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-default-100 text-default-700">Chưa thanh toán</span>;
    }
    if (c.payment_status === "pending_verification") {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Chờ duyệt thanh toán</span>;
    }
    
    // Paid states
    switch (c.user_facing_stage) {
      case "intake":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Chờ gán supporter</span>;
      case "auditing":
      case "reviewing":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Đang phản biện</span>;
      case "done":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">Đã có báo cáo</span>;
      case "Need Clarification":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400">Cần làm rõ</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-default-150 text-default-700">{c.user_facing_stage}</span>;
    }
  };

  const hasCases = cases && cases.length > 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-default-800">Dự án của bạn</h1>
          <p className="text-sm text-default-500 mt-0.5">
            Xem danh sách các dự án phản biện và tình trạng phản hồi.
          </p>
        </div>
        {hasCases && (
          <Link
            href="/dashboard/intake"
            className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tạo dự án mới
          </Link>
        )}
      </div>

      {hasCases ? (
        <div className="border border-default-200/50 rounded-lg overflow-hidden bg-surface">
          <Table aria-label="Danh sách dự án">
            <TableHeader>
              <TableColumn>MÃ DỰ ÁN</TableColumn>
              <TableColumn>TÊN NHÓM</TableColumn>
              <TableColumn>MÔN HỌC / BÀI TẬP</TableColumn>
              <TableColumn>TRẠNG THÁI</TableColumn>
              <TableColumn>NGÀY TẠO</TableColumn>
              <TableColumn className="w-12"></TableColumn>
            </TableHeader>
            <TableBody>
              {cases.map((c) => (
                <TableRow
                  key={c.id}
                  className="hover:bg-default-100/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/dashboard/case/${c.id}`)}
                >
                  <TableCell className="font-mono font-bold text-default-800 text-sm">
                    {c.case_code}
                  </TableCell>
                  <TableCell className="text-sm text-default-700">{c.team_name || "Chưa đặt tên"}</TableCell>
                  <TableCell className="text-sm text-default-700">{c.course_context || "Không rõ"}</TableCell>
                  <TableCell>{renderStatus(c)}</TableCell>
                  <TableCell className="text-xs text-default-400">
                    {new Date(c.created_at).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <Button isIconOnly variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4 text-default-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Empty State (Rule 16 & 37) */
        <div className="flex flex-col items-center text-center justify-center p-12 border border-dashed border-default-300 rounded-lg bg-surface min-h-[350px] max-w-xl mx-auto">
          <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-full mb-4">
            <ClipboardList className="w-8 h-8 text-orange-600 dark:text-orange-500" />
          </div>
          <h2 className="text-lg font-bold font-display text-default-800 mb-2">
            Chưa có dự án phản biện nào
          </h2>
          <p className="text-sm text-default-500 mb-6 leading-relaxed">
            Bạn cần gửi thông tin ý tưởng và liên kết tài liệu Checkpoint để bắt đầu nhận phản biện từ hệ thống và supporter.
          </p>
          <Link
            href="/dashboard/intake"
            className="inline-flex items-center justify-center h-10 px-8 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-colors shadow-sm"
          >
            Bắt đầu dự án phản biện đầu tiên
          </Link>
        </div>
      )}
    </div>
  );
}
