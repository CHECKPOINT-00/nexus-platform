"use client";

import React, { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CasePaymentPage({ params }: PageProps) {
  const { id: caseId } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/case/${caseId}?tab=payment`);
  }, [caseId, router]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-12">
      <LoadingSkeleton variant="text-block" count={1} />
      <LoadingSkeleton variant="card" count={2} />
    </div>
  );
}
