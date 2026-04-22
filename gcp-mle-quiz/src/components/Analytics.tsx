"use client";

import { useEffect, useState } from "react";
import type { TagStat } from "@/lib/questions";
import { TAG_LABELS, TAG_COLORS } from "@/lib/types";
import { useThemeContext } from "./ThemeContext";
import { useTagContext } from "./TagContext";

export default function Analytics() {
  const { theme } = useThemeContext();
  const { availableTags } = useTagContext();
  const [stats, setStats] = useState<TagStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">("success");

  const loadStats = async () => {
    const response = await fetch("/api/progress");
    const data = await response.json();
    setStats(data.stats ?? []);
  };

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!feedbackMessage) return;

    const timeoutId = window.setTimeout(() => {
      setFeedbackMessage(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [feedbackMessage]);

  const handleResetProgress = async () => {
    const confirmed = window.confirm(
      "Reset all progress counters for every question? This cannot be undone from the dashboard."
    );

    if (!confirmed) return;

    try {
      setIsResetting(true);
      setFeedbackMessage(null);

      const response = await fetch("/api/progress/reset", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reset progress");
      }

      await loadStats();
      setFeedbackTone("success");
      setFeedbackMessage("Progress reset successfully.");
    } catch {
      setFeedbackTone("error");
      setFeedbackMessage("Reset failed.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveSnapshot = async () => {
    try {
      setIsSavingSnapshot(true);
      setFeedbackMessage(null);

      const response = await fetch("/api/progress/snapshot", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to save snapshot");
      }

      const data = (await response.json()) as {
        snapshot?: { fileName?: string };
      };

      setFeedbackTone("success");
      setFeedbackMessage(
        data.snapshot?.fileName
          ? `Snapshot saved: ${data.snapshot.fileName}`
          : "Snapshot saved."
      );
    } catch {
      setFeedbackTone("error");
      setFeedbackMessage("Snapshot save failed.");
    } finally {
      setIsSavingSnapshot(false);
    }
  };

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

  const statsByTag = new Map(stats.map((item) => [item.tag, item]));
  const scopedStats: TagStat[] = availableTags.map((tag) => {
    const found = statsByTag.get(tag);
    if (found) return found;
    return {
      tag,
      total: 0,
      answered: 0,
      correct: 0,
      accuracy: 0,
    };
  });

  const answered = scopedStats.filter((s) => s.answered > 0);
  const notStarted = scopedStats.filter((s) => s.answered === 0);
  const isDark = theme === "dark";
  const surface = isDark ? "var(--surface-bg)" : "#fff";
  const surfaceMuted = isDark ? "var(--surface-muted)" : "#F1F3F4";
  const primaryText = "var(--text-primary)";
  const secondaryText = "var(--text-secondary)";
  const mutedText = "var(--text-muted)";
  const border = "var(--border-color)";
  const borderSoft = "var(--border-soft)";

  return (
    <div className="flex flex-col gap-6">
      {/* Summary bar */}
      <div
        className="rounded-2xl p-6 shadow-sm"
        style={{ backgroundColor: surface, border: `1px solid ${border}` }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: primaryText }}>
          Overall Progress
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Topics Covered",
              value: `${answered.length} / ${scopedStats.length}`,
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
              value: scopedStats.reduce((s, t) => s + t.answered, 0),
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
              <div className="text-xs mt-1" style={{ color: secondaryText }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleResetProgress}
              disabled={isResetting || isSavingSnapshot}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{
                backgroundColor: isResetting || isSavingSnapshot ? "#F1F3F4" : "#EA4335",
                color: isResetting || isSavingSnapshot ? "#BDC1C6" : "#fff",
                cursor: isResetting || isSavingSnapshot ? "not-allowed" : "pointer",
              }}
            >
              {isResetting ? "Resetting..." : "Reset Progress"}
            </button>
            <button
              onClick={handleSaveSnapshot}
              disabled={isResetting || isSavingSnapshot}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{
                backgroundColor: isResetting || isSavingSnapshot ? "#F1F3F4" : "#34A853",
                color: isResetting || isSavingSnapshot ? "#BDC1C6" : "#fff",
                cursor: isResetting || isSavingSnapshot ? "not-allowed" : "pointer",
              }}
            >
              {isSavingSnapshot ? "Saving..." : "Save Progress"}
            </button>
          </div>

          {feedbackMessage && (
            <p
              className="text-sm"
              style={{ color: feedbackTone === "success" ? "#137333" : "#C5221F" }}
            >
              {feedbackMessage}
            </p>
          )}
        </div>
      </div>

      {/* Fragile topics */}
      {answered.length > 0 && (
        <div
          className="rounded-2xl shadow-sm overflow-hidden"
          style={{ backgroundColor: surface, border: `1px solid ${border}` }}
        >
          <div className="px-6 py-4" style={{ borderBottom: `1px solid ${borderSoft}` }}>
            <h2 className="text-base font-bold" style={{ color: primaryText }}>
              🎯 Topics to Focus On
            </h2>
            <p className="text-sm mt-0.5" style={{ color: secondaryText }}>
              Sorted by accuracy — lowest first
            </p>
          </div>

          <div className="divide-y" style={{ borderColor: borderSoft }}>
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
                      <span className="font-medium text-sm" style={{ color: primaryText }}>
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
                    style={{ backgroundColor: surfaceMuted }}
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
                  <div className="text-xs mt-1" style={{ color: mutedText }}>
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
          style={{ backgroundColor: surface, border: `1px solid ${border}` }}
        >
          <h2 className="text-base font-bold mb-3" style={{ color: primaryText }}>
            📚 Topics Not Yet Practiced
          </h2>
          <div className="flex flex-wrap gap-2">
            {notStarted.map((s) => (
              <span
                key={s.tag}
                className="text-sm px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: surfaceMuted,
                  color: secondaryText,
                }}
              >
                {TAG_LABELS[s.tag] ?? s.tag} ({s.total})
              </span>
            ))}
          </div>
        </div>
      )}

      {scopedStats.length === 0 && (
        <div
          className="rounded-2xl p-10 text-center shadow-sm"
          style={{ backgroundColor: surface, border: `1px solid ${border}` }}
        >
          <p className="text-4xl mb-3">📊</p>
          <p className="text-base font-semibold" style={{ color: primaryText }}>
            No data yet
          </p>
          <p className="text-sm mt-1" style={{ color: secondaryText }}>
            Complete a quiz session to see your analytics here.
          </p>
        </div>
      )}
    </div>
  );
}
