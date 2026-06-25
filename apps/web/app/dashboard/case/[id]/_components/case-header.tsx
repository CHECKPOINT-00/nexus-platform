import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SlaTimer } from "../../../../../components/shared/sla-timer";

interface CaseHeaderProps {
  caseCode: string;
  teamName: string | null;
  courseContext: string | null;
  school: string | null;
  createdAt: string;
  deadline: string | null;
  userFacingStage: string;
}

export function CaseHeader({
  caseCode,
  teamName,
  courseContext,
  school,
  createdAt,
  deadline,
  userFacingStage,
}: CaseHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-default-100 pb-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-default-500 hover:text-default-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold font-display text-default-800">
            Dự án {teamName || caseCode}
          </h1>
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-default-100 text-default-800">
            {caseCode}
          </span>
        </div>
        <p className="text-xs text-default-400 pl-8">
          Môn học: {courseContext || "EXE101"} | Trường: {school || "FPT University"}
        </p>
      </div>

      <div className="flex items-center gap-3 pl-8 md:pl-0">
        <span className="text-xs text-default-400">Đếm ngược phản hồi (SLA):</span>
        <SlaTimer createdAt={createdAt} deadline={deadline} userFacingStage={userFacingStage} />
      </div>
    </div>
  );
}
