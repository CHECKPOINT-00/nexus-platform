"use client";

import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef } from "react";

type HealthResponse = {
  ok: boolean;
};

const rows = Array.from({ length: 100 }, (_, index) => `Row ${index + 1}`);

export function HomeClient() {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  const healthQuery = useQuery<HealthResponse>({
    queryKey: ["health"],
    queryFn: async () => {
      if (!apiBaseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL missing");
      }

      const response = await fetch(`${apiBaseUrl}/health`);

      if (!response.ok) {
        throw new Error("API health check failed");
      }

      return response.json() as Promise<HealthResponse>;
    },
  });

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  const healthText = useMemo(() => {
    if (healthQuery.isPending) {
      return "Checking API...";
    }

    return healthQuery.data?.ok ? "API online" : "API offline";
  }, [healthQuery.data?.ok, healthQuery.isPending]);

  return (
    <section>
      <p>{healthText}</p>

      <div
        ref={parentRef}
        style={{ height: 240, overflow: "auto", position: "relative" }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rows[virtualRow.index]}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
