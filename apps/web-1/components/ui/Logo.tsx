"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface LogoProps {
  className?: string;
  height?: number | string;
}

export default function Logo({ className, height = 52 }: LogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to light theme logo (Black_Colored.svg) during SSR to prevent layout shift
  const isDark = mounted && theme === "dark";
  const logoSrc = isDark ? "/logo/White_Colored.svg" : "/logo/Black_Colored.svg";

  return (
    <img
      src={logoSrc}
      alt="Nexus Logo"
      style={{ height }}
      className={className}
    />
  );
}

