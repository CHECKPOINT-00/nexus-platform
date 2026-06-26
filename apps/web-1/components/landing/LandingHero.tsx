import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, HelpCircle } from "lucide-react";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-bg-app transition-colors duration-200">
      {/* Decorative background grid/elements */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 dark:opacity-10" />

      <div className="max-w-5xl mx-auto text-center space-y-8">
        {/* Sub-badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/20 bg-brand-subtle text-brand text-xs font-body font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ứng dụng Đánh giá & Phản biện Checkpoint 1 (CP1)</span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-text-app">
          Kiểm định Ý tưởng & Đánh giá Checkpoint 1{" "}
          <span className="text-brand relative inline-block">
            Chuẩn Xác
            <span className="absolute bottom-1.5 left-0 w-full h-1 bg-brand-soft -z-10" />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto font-body text-base sm:text-lg text-text-muted">
          Nexus giúp các nhóm sinh viên kiểm định nội dung Checkpoint 1 (CP1) theo đúng tiêu chí chấm điểm học thuật, phát hiện lỗi logic lập luận bằng AI và nhận báo cáo thẩm định từ các Supporter giàu kinh nghiệm.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/auth"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-body text-sm font-semibold bg-accent-warm hover:bg-accent-warm-hover text-white px-6 py-3 rounded-lg shadow-md shadow-accent-warm/10 transition-all transform hover:-translate-y-0.5 cursor-pointer animate-none"
          >
            <span>Bắt đầu ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#packages"
            className="w-full sm:w-auto inline-flex items-center justify-center font-body text-sm font-semibold text-text-muted hover:text-text-app px-6 py-3 rounded-lg border border-border-strong hover:bg-surface-soft transition-colors cursor-pointer"
          >
            Xem bảng giá dịch vụ
          </a>
        </div>

        {/* Micro-trust indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto border-t border-border-app">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-heading font-medium text-sm text-text-app">Tin cậy & Rõ ràng</h4>
              <p className="font-body text-xs text-text-subtle">Mọi nhận định AI đều đi kèm bằng chứng cụ thể.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-heading font-medium text-sm text-text-app">Đánh giá Tự động</h4>
              <p className="font-body text-xs text-text-subtle">Hệ thống AI lập tức kiểm định ý tưởng sau khi nộp.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-heading font-medium text-sm text-text-app">Hỗ trợ Đồng hành</h4>
              <p className="font-body text-xs text-text-subtle">Kết nối với supporter là các chuyên gia/mentor.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
