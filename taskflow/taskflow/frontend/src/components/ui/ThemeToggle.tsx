"use client";
import { useTheme } from "@/lib/theme-context";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="p-2 rounded-lg transition-all duration-200"
      style={{
        backgroundColor: "var(--surface-2)",
        border: "1px solid var(--border)",
        color: "var(--text-muted)",
      }}
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}