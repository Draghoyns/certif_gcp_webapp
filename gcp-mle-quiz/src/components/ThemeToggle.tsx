"use client";

import { useThemeContext } from "./ThemeContext";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <line x1="12" y1="2.5" x2="12" y2="5.3" />
        <line x1="12" y1="18.7" x2="12" y2="21.5" />
        <line x1="2.5" y1="12" x2="5.3" y2="12" />
        <line x1="18.7" y1="12" x2="21.5" y2="12" />
        <line x1="5.1" y1="5.1" x2="7.1" y2="7.1" />
        <line x1="16.9" y1="16.9" x2="18.9" y2="18.9" />
        <line x1="5.1" y1="18.9" x2="7.1" y2="16.9" />
        <line x1="16.9" y1="7.1" x2="18.9" y2="5.1" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M15.8 3.8a8.8 8.8 0 1 0 4.4 15.9 8.4 8.4 0 0 1-4.2 1.1A8.8 8.8 0 0 1 7.2 12a8.7 8.7 0 0 1 8.6-8.2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext();
  const nextLabel = theme === "light" ? "dark" : "light";

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 leading-none transition-opacity hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={{ color: "var(--text-primary)" }}
      aria-label={`Switch to ${nextLabel} mode`}
      title={`Switch to ${nextLabel} mode`}
    >
      {theme === "light" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
