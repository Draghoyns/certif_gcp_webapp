"use client";

import { useEffect, useState } from "react";
import type { TagStat } from "@/lib/questions";
import { TAG_LABELS, TAG_COLORS } from "@/lib/types";

export default function Analytics() {
  const [stats, setStats] = useState<TagStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-10 h-10 rounded-full border-4 animate-spin"
          style={{ borderColor: "#4285F4", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const answered = stats.filter((s) => s.answered > 0);
  const notStarted = stats.filter((s) => s.answered === 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary bar */}
      <div
        className="rounded-2xl p-6 shadow-sm"
        style={{ backgroundColor: "#fff", border: "1px solid #DADCE0" }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: "#202124" }}>
          Overall Progress
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Topics Covered",
              value: `${answered.length} / ${stats.length}`,
              color: "#4285F4",
            },
            {
              label: "Avg. Accuracy",
              value:
                answered.length > 0
                  ? `${Math.round(
                      (answered.reduce((s, t) => s + t.accuracy, 0) /
                        answered.length) *
                        100
                    )}%`
                  : "—",
              color: "#34A853",
            },
            {
              label: "Questions Seen",
              value: stats.reduce((s, t) => s + t.answered, 0),
              color: "#FBBC04",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="text-center p-4 rounded-xl"
              style={{ backgroundColor: `${color}12` }}
            >
              <div className="text-2xl font-bold" style={{ color }}>
                {value}
              </div>
              <div className="text-xs mt-1" style={{ color: "#5F6368" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fragile topics */}
      {answered.length > 0 && (
        <div
          className="rounded-2xl shadow-sm overflow-hidden"
          style={{ backgroundColor: "#fff", border: "1px solid #DADCE0" }}
        >
          <div className="px-6 py-4" style={{ borderBottom: "1px solid #F1F3F4" }}>
            <h2 className="text-base font-bold" style={{ color: "#202124" }}>
              🎯 Topics to Focus On
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "#5F6368" }}>
              Sorted by accuracy — lowest first
            </p>
          </div>

          <div className="divide-y" style={{ borderColor: "#F1F3F4" }}>
            {answered.map((s) => {
              const color = TAG_COLORS[s.tag] ?? "#4285F4";
              const pct = Math.round(s.accuracy * 100);
              const status =
                pct >= 80 ? "✅" : pct >= 50 ? "⚠️" : "❌";
              return (
                <div key={s.tag} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-sm" style={{ color: "#202124" }}>
                        {TAG_LABELS[s.tag] ?? s.tag}
                      </span>
                      <span>{status}</span>
                    </div>
                    <div className="text-sm font-semibold" style={{ color }}>
                      {pct}% ({s.answered} seen)
                    </div>
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: "#F1F3F4" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          pct >= 80 ? "#34A853" : pct >= 50 ? "#FBBC04" : "#EA4335",
                      }}
                    />
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#9AA0A6" }}>
                    {s.total} questions in category
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Not started */}
      {notStarted.length > 0 && (
        <div
          className="rounded-2xl p-6 shadow-sm"
          style={{ backgroundColor: "#fff", border: "1px solid #DADCE0" }}
        >
          <h2 className="text-base font-bold mb-3" style={{ color: "#202124" }}>
            📚 Topics Not Yet Practiced
          </h2>
          <div className="flex flex-wrap gap-2">
            {notStarted.map((s) => (
              <span
                key={s.tag}
                className="text-sm px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: "#F1F3F4",
                  color: "#5F6368",
                }}
              >
                {TAG_LABELS[s.tag] ?? s.tag} ({s.total})
              </span>
            ))}
          </div>
        </div>
      )}

      {stats.length === 0 && (
        <div
          className="rounded-2xl p-10 text-center shadow-sm"
          style={{ backgroundColor: "#fff", border: "1px solid #DADCE0" }}
        >
          <p className="text-4xl mb-3">📊</p>
          <p className="text-base font-semibold" style={{ color: "#202124" }}>
            No data yet
          </p>
          <p className="text-sm mt-1" style={{ color: "#5F6368" }}>
            Complete a quiz session to see your analytics here.
          </p>
        </div>
      )}
    </div>
  );
}
