"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, Spinner } from "@heroui/react";
import { apiClient } from "../../lib/api-client";
import { Check } from "lucide-react";
import Link from "next/link";

interface ServicePackage {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export function PricingCards() {
  const { data: packages, isLoading, error } = useQuery<ServicePackage[]>({
    queryKey: ["packages"],
    queryFn: () => apiClient<ServicePackage[]>("/api/packages"),
  });

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <Spinner />
        <p className="text-sm text-default-500 mt-2">Đang tải các gói dịch vụ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-danger">
        <p>Không thể tải thông tin gói dịch vụ. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 w-full max-w-4xl mx-auto px-4">
      {packages?.map((pkg, idx) => {
        const isFree = pkg.price === 0;
        // Dynamically highlight the second plan (idx === 1) as the recommended one
        const isFeatured = idx === 1;

        return (
          <Card
            key={pkg.id}
            className={`border transition-all flex flex-col justify-between hover:scale-[1.03] duration-300 relative ${
              isFeatured 
                ? "border-accent ring-2 ring-accent/20 shadow-lg scale-[1.02] bg-surface" 
                : "border-default-200/60 shadow-sm bg-surface/80 backdrop-blur-md"
            }`}
          >
            {isFeatured && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-accent-foreground font-extrabold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm z-20 whitespace-nowrap">
                Khuyên dùng
              </span>
            )}
            <Card.Header className="flex flex-col items-start gap-2 p-8 pb-6">
              <Card.Title className="text-xl font-bold font-display text-default-800">
                {pkg.name}
              </Card.Title>
              <span className="text-3xl font-black mt-2 font-display text-accent">
                {formatCurrency(pkg.price)}
              </span>
            </Card.Header>
            <hr className="border-t border-default-200/50 w-full" />
            <Card.Content className="p-8 flex-1 flex flex-col justify-between gap-8">
              <ul className="flex flex-col gap-4">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-base text-default-600">
                    <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/intake"
                className={`inline-flex items-center justify-center h-12 w-full font-bold mt-auto rounded-lg text-base shadow-sm active:scale-95 transition-all duration-200 ${
                  isFeatured
                    ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                    : "border border-default-300 hover:border-accent/40 text-default-700 bg-background hover:bg-default-50 hover:text-accent"
                }`}
              >
                {isFree ? "Dùng thử miễn phí" : "Đăng ký dịch vụ"}
              </Link>
            </Card.Content>
          </Card>
        );
      })}
    </div>
  );
}
