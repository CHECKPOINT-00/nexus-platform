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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-10">
      {packages?.map((pkg) => {
        const isFree = pkg.price === 0;
        return (
          <Card
            key={pkg.id}
            className="border border-default-200/60 transition-all hover:border-orange-500/40 flex flex-col justify-between"
          >
            <Card.Header className="flex flex-col items-start gap-1 p-6">
              <Card.Title className="text-lg font-bold font-display text-default-800">
                {pkg.name}
              </Card.Title>
              <span className="text-2xl font-black mt-2 font-display text-orange-600 dark:text-orange-500">
                {formatCurrency(pkg.price)}
              </span>
            </Card.Header>
            <hr className="border-t border-default-200/50 w-full" />
            <Card.Content className="p-6 flex-1 flex flex-col justify-between gap-6">
              <ul className="flex flex-col gap-3">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-default-600">
                    <Check className="w-4 h-4 text-success-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/intake"
                className="inline-flex items-center justify-center h-10 w-full font-semibold border border-default-300 hover:border-orange-500/40 mt-auto rounded-md text-sm text-default-700 bg-background hover:bg-default-50 transition-colors"
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
