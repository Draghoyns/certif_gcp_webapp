"use client";

import { useEffect, useState } from "react";
import type { Question } from "@/lib/types";
import { TAG_LABELS, TAG_COLORS } from "@/lib/types";

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswers: string[];
  confirmed: boolean;
  explanation: string | null;
  onSelect: (answer: string) => void;
  onConfirm: () => void;
  onNext: () => void;
  isLast: boolean;
}

export default function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswers,
  confirmed,
  explanation,
  onSelect,
  onConfirm,
  onNext,
  isLast,
}: Props) {
  const letters = Object.keys(question.options).sort();
  const correctSet = new Set(question.correct ?? []);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    setCopyStatus(null);
  }, [question.id]);

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

  const requiredSelections = getRequiredSelections(question.question);
  const isSelectionComplete = selectedAnswers.length === requiredSelections;
  const isSingleSelect = requiredSelections <= 1;

  function getOptionStyle(letter: string) {
    const base: React.CSSProperties = {
      width: "100%",
      textAlign: "left",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1.5px solid",
      cursor: confirmed ? "default" : "pointer",
      transition: "all 0.15s",
      fontSize: "14px",
      lineHeight: "1.5",
    };

    if (!confirmed) {
      if (selectedAnswers.includes(letter)) {
        return {
          ...base,
          borderColor: "#4285F4",
          backgroundColor: "#E8F0FE",
          color: "#1A73E8",
          fontWeight: 500,
        };
      }
      return {
        ...base,
        borderColor: "#DADCE0",
        backgroundColor: "#fff",
        color: "#3C4043",
      };
    }

    // After confirmation
    if (correctSet.has(letter)) {
      return {
        ...base,
        borderColor: "#34A853",
        backgroundColor: "#E6F4EA",
        color: "#137333",
        fontWeight: 600,
      };
    }
    if (selectedAnswers.includes(letter) && !correctSet.has(letter)) {
      return {
        ...base,
        borderColor: "#EA4335",
        backgroundColor: "#FCE8E6",
        color: "#C5221F",
        fontWeight: 500,
      };
    }
    return {
      ...base,
      borderColor: "#DADCE0",
      backgroundColor: "#F8F9FA",
      color: "#80868B",
    };
  }

  function getOptionPrefix(letter: string) {
    if (!confirmed) return letter + ".";
    if (correctSet.has(letter)) return "✓";
    if (selectedAnswers.includes(letter) && !correctSet.has(letter)) return "✗";
    return letter + ".";
  }

  const sortedSelected = [...selectedAnswers].sort();
  const sortedCorrect = [...(question.correct ?? [])].sort();
  const isCorrect =
    confirmed &&
    sortedSelected.length === sortedCorrect.length &&
    sortedSelected.every((value, idx) => value === sortedCorrect[idx]);

  const buildCopyText = () => {
    const lines = [`Question: ${question.question}`];
    for (const letter of letters) {
      lines.push(`${letter}. ${question.options[letter]}`);
    }
    return lines.join("\n");
  };

  const handleCopyQuestion = async () => {
    const text = buildCopyText();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy failed");
    }

    setTimeout(() => setCopyStatus(null), 1800);
  };

  return (
    <div
      className="rounded-2xl shadow-sm overflow-hidden"
      style={{ backgroundColor: "#fff", border: "1px solid #DADCE0" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid #F1F3F4" }}
      >
        <span className="text-sm font-medium" style={{ color: "#5F6368" }}>
          Question {questionIndex + 1} / {totalQuestions}
        </span>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {question.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${TAG_COLORS[tag] ?? "#4285F4"}18`,
                color: TAG_COLORS[tag] ?? "#4285F4",
              }}
            >
              {TAG_LABELS[tag] ?? tag}
            </span>
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="px-6 py-5">
        <p className="text-base leading-relaxed font-medium" style={{ color: "#202124" }}>
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div className="px-6 pb-4 flex flex-col gap-2.5">
        {!confirmed && (
          <p className="text-xs" style={{ color: "#5F6368" }}>
            {isSingleSelect
              ? "Select one answer."
              : `Select ${requiredSelections} answers.`}
          </p>
        )}
        {letters.map((letter) => (
          <button
            key={letter}
            style={getOptionStyle(letter)}
            onClick={() => !confirmed && onSelect(letter)}
          >
            <span className="flex gap-3">
              <span
                className="font-bold flex-shrink-0 w-5"
                style={{ color: "inherit" }}
              >
                {getOptionPrefix(letter)}
              </span>
              <span>{question.options[letter]}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Confirm / Result feedback */}
      <div
        className="px-6 pb-6"
        style={{ borderTop: confirmed ? "1px solid #F1F3F4" : "none", paddingTop: confirmed ? "20px" : "0" }}
      >
        {!confirmed ? (
          <button
            onClick={onConfirm}
            disabled={!isSelectionComplete}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all"
            style={{
              backgroundColor: isSelectionComplete ? "#4285F4" : "#F1F3F4",
              color: isSelectionComplete ? "#fff" : "#BDC1C6",
              cursor: isSelectionComplete ? "pointer" : "not-allowed",
            }}
          >
            Confirm Answer
          </button>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Result badge */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
              style={{
                backgroundColor: isCorrect ? "#E6F4EA" : "#FCE8E6",
                color: isCorrect ? "#137333" : "#C5221F",
              }}
            >
              <span>{isCorrect ? "🎉" : "❌"}</span>
              <span>
                {isCorrect
                  ? "Correct!"
                  : `Incorrect — correct answer${question.correct.length > 1 ? "s are" : " is"} ${question.correct.join(", ")}`}
              </span>
            </div>

            {/* Explanation */}
            <div
              className="rounded-lg p-4 text-sm leading-relaxed"
              style={{ backgroundColor: "#F8F9FA", color: "#3C4043" }}
            >
              <div
                className="flex items-center gap-2 mb-2 font-semibold text-xs uppercase tracking-wider"
                style={{ color: "#4285F4" }}
              >
                <span>✦</span> Explanation
              </div>
              <p>{explanation ?? "No explanation available."}</p>
            </div>

            {/* Next / Finish button */}
            <button
              onClick={onNext}
              className="w-full py-3 rounded-lg font-semibold text-sm text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#4285F4" }}
            >
              {isLast ? "See Results →" : "Next Question →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
