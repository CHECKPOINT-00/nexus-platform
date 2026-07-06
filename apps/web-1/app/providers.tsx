"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

const theme = createTheme({
  primaryColor: "brand",
  colors: {
    brand: [
      "#eff6ff", // 50
      "#dbeafe", // 100
      "#bfdbfe", // 200
      "#93c5fd", // 300
      "#60a5fa", // 400
      "#3b82f6", // 500
      "#2563eb", // 600
      "#1d4ed8", // 700
      "#1e40af", // 800
      "#1e3a8a", // 900
    ],
    blue: [
      "#eff6ff",
      "#dbeafe",
      "#bfdbfe",
      "#93c5fd",
      "#60a5fa",
      "#3b82f6",
      "#2563eb",
      "#1d4ed8",
      "#1e40af",
      "#1e3a8a",
    ],
    green: [
      "#ecfdf5",
      "#d1fae5",
      "#a7f3d0",
      "#6ee7b7",
      "#34d399",
      "#10b981",
      "#059669",
      "#047857",
      "#065f46",
      "#064e3b",
    ],
    orange: [
      "#fffbeb",
      "#fef3c7",
      "#fde68a",
      "#fcd34d",
      "#fbbf24",
      "#f59e0b",
      "#d97706",
      "#b45309",
      "#92400e",
      "#78350f",
    ],
    red: [
      "#fef2f2",
      "#fee2e2",
      "#fecaca",
      "#fca5a5",
      "#f87171",
      "#ef4444",
      "#dc2626",
      "#b91c1c",
      "#991b1b",
      "#7f1d1d",
    ],
  },
  fontFamily: "var(--font-google-sans-flex), sans-serif",
  headings: {
    fontFamily: "var(--font-google-sans-flex), sans-serif",
  },
});

const tanstackDevtoolsPlugins = [formDevtoolsPlugin()];

export default function Providers({ children }: { children: React.ReactNode }) {
  // Use React.useState to ensure that QueryClient is created once per session
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider attribute="data-mantine-color-scheme" defaultTheme="light" enableSystem>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications position="top-right" zIndex={1000} />
          <ModalsProvider>
            {children}
          </ModalsProvider>
        </MantineProvider>
      </NextThemesProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <TanStackDevtools plugins={tanstackDevtoolsPlugins} />
    </QueryClientProvider>
  );
}
