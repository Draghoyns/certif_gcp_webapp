"use client";

import { useState, useEffect, useCallback } from "react";
import type { Question, SessionResult } from "@/lib/types";
import { TAG_LABELS } from "@/lib/types";
import QuestionCard from "./QuestionCard";
import { useTagContext } from "./TagContext";

type Phase = "loading" | "quiz" | "session-complete";

export default function QuizSession() {
  const { selectedTags } = useTagContext();

  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [points, setPoints] = useState(0);

  const normalizeAnswers = (answers: string[]) =>
    [...new Set(answers)].sort();

  const getRequiredSelections = (questionText: string) => {
    const m = questionText.match(/\((?:choose|select)\s+(\w+)\.?\)/i);
    if (!m) return 1;

    const raw = m[1].toLowerCase();
    const wordToNumber: Record<string, number> = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
    };
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : (wordToNumber[raw] ?? 1);
  };

  const toggleSelection = (letter: string) => {
    if (!current || confirmed) return;
    const required = getRequiredSelections(current.question);

    setSelectedAnswers((prev) => {
      if (required <= 1) return [letter];
      if (prev.includes(letter)) return prev.filter((v) => v !== letter);
      if (prev.length >= required) return prev;
      return [...prev, letter];
    });
  };

  const loadQuestions = useCallback(async () => {
    setPhase("loading");
    const tagsParam = selectedTags.join(",");
    const url = `/api/questions?tags=${encodeURIComponent(tagsParam)}&count=10`;
    const res = await fetch(url);
    const data: Question[] = await res.json();
    setQuestions(data);
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setConfirmed(false);
    setResults([]);
    setPoints(0);
    setPhase("quiz");
  }, [selectedTags]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const current = questions[currentIndex];

  const handleConfirm = () => {
    if (!current || selectedAnswers.length === 0) return;
    if (selectedAnswers.length !== getRequiredSelections(current.question)) return;

    setConfirmed(true);
    const normalizedSelected = normalizeAnswers(selectedAnswers);
    const normalizedCorrect = normalizeAnswers(current.correct ?? []);
    const isCorrect =
      normalizedSelected.length === normalizedCorrect.length &&
      normalizedSelected.every((value, idx) => value === normalizedCorrect[idx]);

    if (isCorrect) setPoints((p) => p + 1);

    // Save progress
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: current.id, isCorrect }),
    });

    setResults((prev) => [
      ...prev,
      { questionId: current.id, selectedAnswers: normalizedSelected, isCorrect },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setPhase("session-complete");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswers([]);
      setConfirmed(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: "#4285F4", borderTopColor: "transparent" }}
          />
          <p style={{ color: "#5F6368" }}>Loading questions…</p>
        </div>
      </div>
    );
  }

  // ── No questions for selected tags ───────────────────────────────────────
  if (phase === "quiz" && questions.length === 0) {
    return (
      <div
        className="rounded-2xl p-10 text-center shadow-sm"
        style={{ backgroundColor: "#fff", border: "1px solid #DADCE0" }}
      >
        <p className="text-4xl mb-4">🔍</p>
        <p className="text-lg font-semibold mb-2" style={{ color: "#202124" }}>
          No questions found
        </p>
        <p style={{ color: "#5F6368" }}>
          Select at least one topic in the sidebar to start a session.
        </p>
      </div>
    );
  }

  // ── Session complete ─────────────────────────────────────────────────────
  if (phase === "session-complete") {
    const pct = Math.round((points / questions.length) * 100);
    const emoji = pct >= 80 ? "🏆" : pct >= 50 ? "📈" : "💪";
    return (
      <div
        className="rounded-2xl shadow-sm overflow-hidden"
        style={{ backgroundColor: "#fff", border: "1px solid #DADCE0" }}
      >
        <div
          className="px-8 py-6"
          style={{ borderBottom: "1px solid #F1F3F4", textAlign: "center" }}
        >
          <span className="text-5xl">{emoji}</span>
          <h2 className="text-2xl font-bold mt-3 mb-1" style={{ color: "#202124" }}>
            Session Complete!
          </h2>
          <p style={{ color: "#5F6368" }}>
            You scored{" "}
            <strong style={{ color: "#4285F4" }}>
              {points} / {questions.length}
            </strong>{" "}
            ({pct}%)
          </p>
        </div>

        {/* Per-question recap */}
        <div className="px-8 py-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9AA0A6" }}>
            Results
          </p>
          <div className="flex flex-col gap-2">
            {results.map((r, i) => {
              const q = questions.find((q) => q.id === r.questionId);
              return (
                <div
                  key={r.questionId}
                  className="flex items-start gap-3 text-sm py-2 px-3 rounded-lg"
                  style={{
                    backgroundColor: r.isCorrect ? "#E6F4EA" : "#FCE8E6",
                  }}
                >
                  <span
                    className="font-bold flex-shrink-0"
                    style={{ color: r.isCorrect ? "#137333" : "#C5221F" }}
                  >
                    {i + 1}. {r.isCorrect ? "✓" : "✗"}
                  </span>
                  <span
                    className="line-clamp-2"
                    style={{ color: r.isCorrect ? "#137333" : "#C5221F" }}
                  >
                    {q?.question.slice(0, 90)}…
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={loadQuestions}
            className="flex-1 py-3 rounded-lg font-semibold text-sm text-white"
            style={{ backgroundColor: "#4285F4" }}
          >
            New Session →
          </button>
          <a
            href="/analytics"
            className="flex-1 py-3 rounded-lg font-semibold text-sm text-center"
            style={{
              border: "1.5px solid #4285F4",
              color: "#4285F4",
            }}
          >
            View Analytics
          </a>
        </div>
      </div>
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Session header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5 flex-wrap">
          {selectedTags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#E8F0FE", color: "#1A73E8" }}
            >
              {TAG_LABELS[tag] ?? tag}
            </span>
          ))}
          {selectedTags.length > 4 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#E8F0FE", color: "#1A73E8" }}
            >
              +{selectedTags.length - 4} more
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Mini progress bar */}
          <div className="flex gap-1">
            {questions.map((_, i) => {
              const r = results.find((r) => r.questionId === questions[i].id);
              return (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: r
                      ? r.isCorrect
                        ? "#34A853"
                        : "#EA4335"
                      : i === currentIndex
                      ? "#4285F4"
                      : "#DADCE0",
                  }}
                />
              );
            })}
          </div>
          <span className="text-sm font-bold" style={{ color: "#4285F4" }}>
            {points} pts
          </span>
        </div>
      </div>

      {current && (
        <QuestionCard
          question={current}
          questionIndex={currentIndex}
          totalQuestions={questions.length}
          selectedAnswers={selectedAnswers}
          confirmed={confirmed}
          explanation={current.explanation ?? null}
          onSelect={toggleSelection}
          onConfirm={handleConfirm}
          onNext={handleNext}
          isLast={currentIndex + 1 >= questions.length}
        />
      )}
    </div>
  );
}
