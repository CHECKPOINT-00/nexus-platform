import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Select, ListBox,
} from "@heroui/react";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AdminCase, Supporter } from "../types";
import type { UseMutationResult } from "@tanstack/react-query";

interface CasesTabProps {
  cases: AdminCase[] | undefined;
  supporters: Supporter[] | undefined;
  assignMutation: UseMutationResult<any, any, { caseId: string; supporterId: string }, any>;
}

export function CasesTab({ cases, supporters, assignMutation }: CasesTabProps) {
  const router = useRouter();

  const handleAssign = (caseId: string, supporterId: string) => {
    assignMutation.mutate({ caseId, supporterId });
  };

  return (
    <div className="border border-default-200/50 rounded-lg overflow-hidden bg-surface mt-4">
      <Table aria-label="Danh sách dự án của hệ thống">
        <TableHeader>
          <TableColumn>MÃ DỰ ÁN</TableColumn>
          <TableColumn>HỌC VIÊN</TableColumn>
          <TableColumn>MÔN HỌC / TEAM</TableColumn>
          <TableColumn>THANH TOÁN</TableColumn>
          <TableColumn>GÁN SUPPORTER</TableColumn>
          <TableColumn className="w-12"> </TableColumn>
        </TableHeader>
        <TableBody>
          {cases?.map((c) => (
            <TableRow key={c.id} className="hover:bg-default-50 transition-colors">
              <TableCell className="font-mono font-bold text-default-800 text-sm">
                {c.case_code}
              </TableCell>
              <TableCell className="text-xs text-default-600">
                <p className="font-semibold text-default-800">{c.owner.name}</p>
                <p className="text-default-400">{c.owner.email}</p>
              </TableCell>
              <TableCell className="text-xs">
                <p className="font-medium text-default-700">{c.course_context || "Không rõ"}</p>
                <p className="text-default-400">{c.team_name || "Chưa đặt tên"}</p>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                    c.payment_status === "paid"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400"
                  }`}
                >
                  {c.payment_status === "paid" ? "Đã trả" : "Chưa trả"}
                </span>
              </TableCell>
              <TableCell>
                <Select
                  aria-label="Chọn supporter"
                  value={c.assigned_supporter_auth_user_id || ""}
                  onChange={(val) => { if (val) handleAssign(c.id, val as string); }}
                  className="max-w-[200px] w-full"
                >
                  <Select.Trigger className="rounded-lg border border-default-200 bg-surface p-2 text-xs flex items-center justify-between">
                    <Select.Value>
                      {c.assigned_supporter_auth_user_id && supporters
                        ? supporters.find((s) => s.id === c.assigned_supporter_auth_user_id)?.name || "Gán supporter..."
                        : "Gán supporter..."}
                    </Select.Value>
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox className="bg-surface border border-default-200 rounded-lg p-1">
                      {supporters?.map((s) => (
                        <ListBox.Item
                          key={s.id}
                          id={s.id}
                          textValue={s.name}
                          className="hover:bg-default-100 p-2 rounded cursor-pointer text-xs"
                        >
                          {s.name} ({s.email})
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      )) || []}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/dashboard/case/${c.id}`)}
                >
                  <Eye className="w-4 h-4 text-default-500" />
                </Button>
              </TableCell>
            </TableRow>
          )) || []}
        </TableBody>
      </Table>
    </div>
  );
}
