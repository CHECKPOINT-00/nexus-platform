"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
import { SlaTimer } from "../../components/shared/sla-timer";
import { ArrowRight, Inbox } from "lucide-react";
import { useEffect } from "react";

interface User {
  name: string;
  email: string;
}

interface Case {
  id: string;
  case_code: string;
  team_name: string | null;
  course_context: string | null;
  user_facing_stage: string;
  payment_status: string;
  internal_status: string;
  created_at: string;
  deadline?: string | null;
  owner: User;
}

export default function SupporterQueue() {
  const router = useRouter();
  const { data: session, isPending: loadingSession } = authClient.useSession();

  // Fetch supporter's queue cases
  const { data: cases, isLoading: loadingCases } = useQuery<Case[]>({
    queryKey: ["supporter-cases"],
    queryFn: () => apiClient<Case[]>("/api/cases"),
    enabled: !!session,
  });

  // Redirect if not supporter or admin
  useEffect(() => {
    if (!loadingSession) {
      if (!session) {
        router.push("/auth");
      } else if ((session.user as { role?: string }).role !== "supporter" && (session.user as { role?: string }).role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [session, loadingSession, router]);

  if (loadingSession || loadingCases) {
    return (
      <div className="flex flex-col justify-center items-center py-24">
        <Spinner size="lg" />
        <p className="text-sm text-default-500 mt-2">Đang tải hàng chờ phản biện...</p>
      </div>
    );
  }

  if (!session) return null;

  const renderStatus = (c: Case) => {
    switch (c.user_facing_stage) {
      case "intake":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Chờ phản biện</span>;
      case "auditing":
      case "reviewing":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Đang phản biện</span>;
      case "done":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">Đã phản hồi</span>;
      case "Need Clarification":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Chờ HV làm rõ</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-default-100 text-default-700">{c.user_facing_stage}</span>;
    }
  };

  const hasCases = cases && cases.length > 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-display text-default-800">Hàng chờ phản biện</h1>
        <p className="text-sm text-default-500 mt-0.5">
          Danh sách các dự án được gán cho bạn. Hãy theo dõi bộ đếm SLA để phản hồi đúng hạn.
        </p>
      </div>

      {hasCases ? (
        <div className="border border-default-200/50 rounded-lg overflow-hidden bg-surface">
          <Table aria-label="Hàng chờ phản biện của Supporter">
            <TableHeader>
              <TableColumn>MÃ DỰ ÁN</TableColumn>
              <TableColumn>TÊN NHÓM</TableColumn>
              <TableColumn>ĐẠI DIỆN HỌC VIÊN</TableColumn>
              <TableColumn>MÔN HỌC</TableColumn>
              <TableColumn>ĐẾM NGƯỢC SLA</TableColumn>
              <TableColumn>TRẠNG THÁI</TableColumn>
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
                  <TableCell className="text-sm text-default-700 font-semibold">
                    {c.team_name || "Chưa đặt tên"}
                  </TableCell>
                  <TableCell className="text-xs text-default-600">
                    <p className="font-medium text-default-700">{c.owner.name}</p>
                    <p className="text-default-400 truncate max-w-[150px]">{c.owner.email}</p>
                  </TableCell>
                  <TableCell className="text-sm text-default-700">{c.course_context || "Không rõ"}</TableCell>
                  <TableCell>
                    <SlaTimer
                      createdAt={c.created_at}
                      deadline={c.deadline}
                      userFacingStage={c.user_facing_stage}
                    />
                  </TableCell>
                  <TableCell>{renderStatus(c)}</TableCell>
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
        <div className="flex flex-col items-center text-center justify-center p-12 border border-dashed border-default-300 rounded-lg bg-surface min-h-[300px] max-w-xl mx-auto">
          <div className="bg-default-100 p-4 rounded-full mb-4">
            <Inbox className="w-8 h-8 text-default-400" />
          </div>
          <h2 className="text-lg font-bold font-display text-default-800 mb-1">
            Không có dự án chờ xử lý
          </h2>
          <p className="text-sm text-default-500 max-w-md">
            Hiện tại bạn chưa được phân công quản lý dự án nào hoặc tất cả dự án đã được xử lý xong.
          </p>
        </div>
      )}
    </div>
  );
}
