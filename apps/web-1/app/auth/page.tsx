"use client";

import AuthShell from "@/components/layout/AuthShell";
import AuthPanel from "./_components/AuthPanel";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function AuthPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (isPending || session) {
    return (
      <AuthShell>
        <div className="py-8 flex flex-col items-center justify-center min-h-[300px]">
          <LoadingSkeleton variant="avatar" />
          <p className="mt-4 text-sm text-text-muted font-body animate-pulse">Đang tải phiên làm việc...</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthPanel />
    </AuthShell>
  );
}
