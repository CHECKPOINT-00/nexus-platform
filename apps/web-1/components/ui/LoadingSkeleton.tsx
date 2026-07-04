import { Skeleton, Card } from "@mantine/core";

interface LoadingSkeletonProps {
  variant?: "card" | "table-row" | "text-block" | "avatar";
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({ variant = "text-block", count = 1, className }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === "card") {
    return (
      <div className={className || "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"}>
        {items.map((_, i) => (
          <Card key={i} p="lg" radius="md" withBorder className="space-y-5 bg-surface-app">
            <div className="flex justify-between items-center">
              <Skeleton height={20} radius="sm" className="w-2/5" />
              <Skeleton height={16} radius="sm" className="w-1/5" />
            </div>
            <div className="space-y-3">
              <Skeleton height={12} radius="sm" className="w-full" />
              <Skeleton height={12} radius="sm" className="w-4/5" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <Skeleton height={32} radius="sm" className="w-1/3" />
              <Skeleton height={16} radius="sm" className="w-1/4" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (variant === "table-row") {
    return (
      <div className="space-y-4 w-full">
        {items.map((_, i) => (
          <div key={i} className="flex gap-4 p-4 items-center bg-surface-app border border-border-app rounded-md">
            <Skeleton circle height={48} width={48} />
            <div className="flex-1 space-y-2">
              <Skeleton height={16} radius="sm" className="w-1/4" />
              <Skeleton height={12} radius="sm" className="w-2/3" />
            </div>
            <Skeleton height={32} radius="sm" className="w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <div className="flex items-center gap-3">
        <Skeleton circle height={40} width={40} />
        <div className="flex flex-col gap-1">
          <Skeleton height={12} width={80} radius="sm" />
          <Skeleton height={8} width={56} radius="sm" />
        </div>
      </div>
    );
  }

  // text-block
  return (
    <div className="space-y-3 w-full">
      {items.map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height={16} radius="sm" className="w-2/5" />
          <Skeleton height={12} radius="sm" className="w-full" />
          <Skeleton height={12} radius="sm" className="w-5/6" />
        </div>
      ))}
    </div>
  );
}
