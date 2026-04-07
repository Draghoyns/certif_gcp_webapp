"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ALL_TAGS, TAG_LABELS, TAG_COLORS } from "@/lib/types";
import { useTagContext } from "./TagContext";

const NAV = [
  { href: "/", label: "Quiz", icon: "📝" },
  { href: "/analytics", label: "Analytics", icon: "📊" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { selectedTags, toggleTag, selectAll, clearAll } = useTagContext();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-60 flex flex-col overflow-hidden"
      style={{ backgroundColor: "#202124", color: "#E8EAED" }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid #3C4043" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">☁️</span>
          <span className="font-bold text-base leading-tight">GCP MLE Quiz</span>
        </div>
        <p className="text-xs" style={{ color: "#9AA0A6" }}>
          Pro ML Engineer Prep
        </p>
      </div>

      {/* Navigation */}
      <nav className="px-3 pt-4 pb-3">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-sm font-medium transition-colors"
              style={{
                backgroundColor: active ? "#4285F4" : "transparent",
                color: active ? "#fff" : "#BDC1C6",
              }}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid #3C4043", margin: "0 12px" }} />

      {/* Tag Filter */}
      <div className="flex-1 overflow-y-auto px-3 pt-4 pb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9AA0A6" }}>
            Topics
          </span>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-xs hover:underline"
              style={{ color: "#4285F4" }}
            >
              All
            </button>
            <span style={{ color: "#5F6368" }}>·</span>
            <button
              onClick={clearAll}
              className="text-xs hover:underline"
              style={{ color: "#9AA0A6" }}
            >
              None
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {ALL_TAGS.map((tag) => {
            const active = selectedTags.includes(tag);
            const color = TAG_COLORS[tag] ?? "#4285F4";
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-left transition-opacity w-full"
                style={{
                  backgroundColor: active ? `${color}22` : "transparent",
                  opacity: active ? 1 : 0.45,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span style={{ color: active ? "#E8EAED" : "#BDC1C6" }}>
                  {TAG_LABELS[tag]}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs mt-4 px-1" style={{ color: "#5F6368" }}>
          {selectedTags.length} / {ALL_TAGS.length} topics selected
        </p>
      </div>
    </aside>
  );
}
