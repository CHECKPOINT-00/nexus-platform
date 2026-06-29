import Link from "next/link";
import { FolderPlus } from "lucide-react";

export default function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-16 text-center border-2 border-dashed border-border-strong rounded-2xl bg-surface-app transition-colors duration-200">
      <div className="w-16 h-16 rounded-2xl bg-brand-soft text-brand flex items-center justify-center mb-6">
        <FolderPlus className="w-8 h-8" />
      </div>
      
      <h3 className="font-heading text-xl font-bold text-text-app mb-2">Chưa có hồ sơ phản biện nào</h3>
      <p className="font-body text-text-muted text-sm max-w-md mb-8 leading-relaxed">
        Bắt đầu bằng cách gửi thông tin ý tưởng khởi nghiệp và liên kết tài liệu Drive của bạn để chạy phản biện chuẩn checkpoint đầu tiên.
      </p>

      <Link
        href="/dashboard/intake"
        className="inline-flex items-center justify-center gap-2 font-body text-sm font-semibold bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-lg shadow-sm shadow-brand/10 transition-colors cursor-pointer"
      >
        <span>Tạo hồ sơ mới</span>
      </Link>
    </div>
  );
}
