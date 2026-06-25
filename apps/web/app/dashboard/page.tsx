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
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black font-display tracking-tight text-default-800">Dự án của bạn</h1>
          <p className="text-base text-default-500 mt-1">
            Xem danh sách các dự án phản biện và tình trạng phản hồi.
          </p>
        </div>
        {hasCases && (
          <Link
            href="/dashboard/intake"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Tạo dự án mới
          </Link>
        )}
      </div>

      {hasCases ? (
        <div className="border border-default-200/60 rounded-xl overflow-hidden bg-surface shadow-md">
          <Table aria-label="Danh sách dự án">
            <TableHeader>
              <TableColumn className="text-sm font-bold py-4">MÃ DỰ ÁN</TableColumn>
              <TableColumn className="text-sm font-bold py-4">TÊN NHÓM</TableColumn>
              <TableColumn className="text-sm font-bold py-4">MÔN HỌC / BÀI TẬP</TableColumn>
              <TableColumn className="text-sm font-bold py-4">TRẠNG THÁI</TableColumn>
              <TableColumn className="text-sm font-bold py-4">NGÀY TẠO</TableColumn>
              <TableColumn className="w-12 py-4"></TableColumn>
            </TableHeader>
            <TableBody>
              {cases.map((c) => (
                <TableRow
                  key={c.id}
                  className="hover:bg-default-100/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/dashboard/case/${c.id}`)}
                >
                  <TableCell className="font-mono font-bold text-default-800 text-base py-4">
                    {c.case_code}
                  </TableCell>
                  <TableCell className="text-base text-default-700 py-4">{c.team_name || "Chưa đặt tên"}</TableCell>
                  <TableCell className="text-base text-default-700 py-4">{c.course_context || "Không rõ"}</TableCell>
                  <TableCell className="py-4">{renderStatus(c)}</TableCell>
                  <TableCell className="text-xs text-default-400 py-4">
                    {new Date(c.created_at).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="py-4">
                    <Button isIconOnly variant="ghost" size="sm">
                      <ArrowRight className="w-5 h-5 text-default-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Empty State (Rule 16 & 37) */
        <div className="flex flex-col items-center text-center justify-center p-16 border border-default-200/60 rounded-2xl bg-surface shadow-md min-h-[420px] max-w-2xl mx-auto my-6">
          <div className="bg-accent/10 p-5 rounded-full mb-6">
            <ClipboardList className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-xl font-bold font-display text-default-850 mb-3">
            Chưa có dự án phản biện nào
          </h2>
          <p className="text-base text-default-500 mb-8 leading-relaxed max-w-sm">
            Bạn cần gửi thông tin ý tưởng và liên kết tài liệu Checkpoint để bắt đầu nhận phản biện từ hệ thống và supporter.
          </p>
          <Link
            href="/dashboard/intake"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Bắt đầu dự án phản biện đầu tiên
          </Link>
        </div>
      )}
    </div>
  );
}
