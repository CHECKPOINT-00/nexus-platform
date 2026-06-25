"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@heroui/react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggler() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button isIconOnly variant="ghost" size="sm" className="w-8 h-8 opacity-0" />;
  }

  const isDark = theme === "dark";

  return (
    <Button
      isIconOnly
      variant="ghost"
      size="sm"
      onPress={() => setTheme(isDark ? "light" : "dark")}
      className="text-text-muted hover:text-brand transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}
