import { Skeleton, Card } from "@heroui/react";

interface LoadingSkeletonProps {
  variant?: "card" | "table-row" | "text-block" | "avatar";
  count?: number;
}

export default function LoadingSkeleton({ variant = "text-block", count = 1 }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {items.map((_, i) => (
          <Card key={i} className="p-5 space-y-5 bg-surface-app border border-border-app rounded-xl">
            <div className="flex justify-between items-center">
              <Skeleton className="w-2/5 rounded-lg">
                <div className="h-5 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-1/5 rounded-lg">
                <div className="h-4 rounded-lg bg-default-200"></div>
              </Skeleton>
            </div>
            <div className="space-y-3">
              <Skeleton className="w-full rounded-lg">
                <div className="h-3 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-4/5 rounded-lg">
                <div className="h-3 rounded-lg bg-default-200"></div>
              </Skeleton>
            </div>
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="w-1/3 rounded-lg">
                <div className="h-8 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-1/4 rounded-lg">
                <div className="h-4 rounded-lg bg-default-200"></div>
              </Skeleton>
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
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-1/4 rounded-lg">
                <div className="h-4 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-2/3 rounded-lg">
                <div className="h-3 rounded-lg bg-default-200"></div>
              </Skeleton>
            </div>
            <Skeleton className="w-20 rounded-lg">
              <div className="h-8 rounded-lg bg-default-200"></div>
            </Skeleton>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="flex rounded-full w-10 h-10" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-20 rounded-lg" />
          <Skeleton className="h-2 w-14 rounded-lg" />
        </div>
      </div>
    );
  }

  // text-block
  return (
    <div className="space-y-3 w-full">
      {items.map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="w-2/5 rounded-lg">
            <div className="h-4 rounded-lg bg-default-200"></div>
          </Skeleton>
          <Skeleton className="w-full rounded-lg">
            <div className="h-3 rounded-lg bg-default-300"></div>
          </Skeleton>
          <Skeleton className="w-5/6 rounded-lg">
            <div className="h-3 rounded-lg bg-default-200"></div>
          </Skeleton>
        </div>
      ))}
    </div>
  );
}
