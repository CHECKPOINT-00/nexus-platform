import { FileText } from "lucide-react";
import { VersionSelector } from "../../../../../components/case/version-selector";
import type { LifecycleUnit } from "../types";

interface IntakeTabProps {
  versions: LifecycleUnit[];
  selectedVersionCode: string;
  onVersionChange: (code: string) => void;
  intakeData: {
    idea?: string;
    customer?: string;
    pain_point?: string;
    alternatives?: string;
    drive_url?: string;
  } | null;
}

export function IntakeTab({
  versions,
  selectedVersionCode,
  onVersionChange,
  intakeData,
}: IntakeTabProps) {
  return (
    <>
      {/* Version selector + drive link */}
      <div className="flex justify-between items-center bg-surface p-4 border border-default-200/50 rounded-lg">
        <VersionSelector
          versions={versions}
          selectedVersionCode={selectedVersionCode}
          onVersionChange={onVersionChange}
        />
        {intakeData?.drive_url && (
          <a
            href={intakeData.drive_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary underline font-medium hover:text-primary-600 flex items-center gap-1"
          >
            <FileText className="w-4 h-4" />
            Mở link tài liệu gốc
          </a>
        )}
      </div>

      {/* Intake fields */}
      <div className="flex flex-col gap-6 bg-surface p-6 border border-default-200/50 rounded-lg mt-3">
        <div className="flex flex-col gap-1">
          <h4 className="text-xs font-bold text-default-400 uppercase">Ý tưởng kinh doanh</h4>
          <p className="text-sm text-default-800 whitespace-pre-wrap mt-1 leading-relaxed">
            {intakeData?.idea || "Chưa cung cấp"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-default-100 pt-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-bold text-default-400 uppercase">Khách hàng mục tiêu</h4>
            <p className="text-sm text-default-800 whitespace-pre-wrap mt-1 leading-relaxed">
              {intakeData?.customer || "Chưa cung cấp"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-bold text-default-400 uppercase">Nỗi đau / Vấn đề</h4>
            <p className="text-sm text-default-800 whitespace-pre-wrap mt-1 leading-relaxed">
              {intakeData?.pain_point || "Chưa cung cấp"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-default-100 pt-4">
          <h4 className="text-xs font-bold text-default-400 uppercase">Giải pháp thay thế</h4>
          <p className="text-sm text-default-800 whitespace-pre-wrap mt-1 leading-relaxed">
            {intakeData?.alternatives || "Chưa cung cấp"}
          </p>
        </div>
      </div>
    </>
  );
}
