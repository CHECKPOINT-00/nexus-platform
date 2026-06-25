"use client";

import Link from "next/link";
import { usePackages } from "@/hooks/usePackages";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { Card } from "@heroui/react";
import { Check } from "lucide-react";

export default function PackagePreview() {
  const { data: packages, isLoading, error } = usePackages();

  if (isLoading) {
    return (
      <section id="packages" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-3xl font-semibold mb-10 text-text-app">Dịch vụ phản biện & Đánh giá</h2>
        <LoadingSkeleton variant="card" count={3} />
      </section>
    );
  }

  if (error || !packages) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(price);
  };

  const getFeaturesList = (features: any): string[] => {
    if (Array.isArray(features)) return features;
    try {
      if (typeof features === "string") {
        const parsed = JSON.parse(features);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  };

  return (
    <section id="packages" className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-app transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-text-app">Gói dịch vụ kiểm định & Phản biện</h2>
          <p className="font-body text-text-muted">
            Chọn gói đồng hành phù hợp với mục tiêu dự án của bạn. Nhận báo cáo kiểm định chất lượng tức thì và hỗ trợ chuyên nghiệp từ đội ngũ supporter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {packages.map((pkg) => {
            const featuresList = getFeaturesList(pkg.features);
            const isRecommended = pkg.name.toLowerCase().includes("premium") || pkg.name.toLowerCase().includes("pro");

            return (
              <Card
                key={pkg.id}
                className={`flex flex-col p-8 bg-surface-app border transition-all relative ${
                  isRecommended
                    ? "border-brand ring-2 ring-brand/10 shadow-lg scale-[1.02]"
                    : "border-border-app shadow-sm hover:border-brand/40"
                }`}
              >
                {isRecommended && (
                  <div className="absolute top-0 right-8 transform -translate-y-1/2 z-10">
                    <span className="bg-brand text-white font-body text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                      Phổ biến
                    </span>
                  </div>
                )}

                <div className="mb-6 space-y-2">
                  <h3 className="font-heading text-xl font-bold text-text-app">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-3xl font-bold text-text-app">{formatPrice(pkg.price)}</span>
                    <span className="font-body text-xs text-text-subtle">/ dự án</span>
                  </div>
                </div>

                <ul className="flex-grow space-y-4 mb-8">
                  {featuresList.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-text-muted font-body">
                      <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/auth?packageId=${pkg.id}&tab=register`}
                  className={`w-full inline-flex items-center justify-center font-body text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors cursor-pointer text-center ${
                    isRecommended
                      ? "bg-brand text-white hover:bg-brand-hover shadow-md"
                      : "bg-surface-app border border-border-strong text-text-muted hover:text-text-app hover:bg-surface-soft"
                  }`}
                >
                  Bắt đầu dự án
                </Link>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
