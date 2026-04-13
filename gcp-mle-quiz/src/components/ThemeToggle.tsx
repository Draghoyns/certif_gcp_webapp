"use client";

import { useThemeContext } from "./ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext();
  const icon = theme === "light" ? "☼" : "☽";
  const nextLabel = theme === "light" ? "dark" : "light";

  return (
    <button
      onClick={toggleTheme}
      className="p-1 text-xl leading-none transition-opacity hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={{ color: "var(--text-primary)" }}
      aria-label={`Switch to ${nextLabel} mode`}
      title={`Switch to ${nextLabel} mode`}
    >
      {icon}
    </button>
  );
}
