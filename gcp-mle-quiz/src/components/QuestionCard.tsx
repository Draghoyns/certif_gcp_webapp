"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Question } from "@/lib/types";
import { TAG_LABELS, TAG_COLORS } from "@/lib/types";

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  progressDots: Array<"correct" | "incorrect" | "current" | "pending">;
  selectedAnswers: string[];
  confirmed: boolean;
  explanation: string | null;
  onSelect: (answer: string) => void;
  onConfirm: () => void;
  onNext: () => void;
  onSaveExplanation: (explanation: string) => Promise<void>;
  isLast: boolean;
}

export default function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  progressDots,
  selectedAnswers,
  confirmed,
  explanation,
  onSelect,
  onConfirm,
  onNext,
  onSaveExplanation,
  isLast,
}: Props) {
  const letters = Object.keys(question.options).sort();
  const correctSet = new Set(question.correct ?? []);
  const [explanationDraft, setExplanationDraft] = useState(explanation ?? "");
  const [isEditingExplanation, setIsEditingExplanation] = useState(false);
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const explanationTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setExplanationDraft(explanation ?? "");
    setIsEditingExplanation(false);
    setIsHintVisible(false);
    setSaveStatus(null);
  }, [question.id, explanation]);

  const autoResizeExplanationTextarea = () => {
    const textarea = explanationTextareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    if (isEditingExplanation) {
      autoResizeExplanationTextarea();
    }
  }, [isEditingExplanation, explanationDraft]);

  const requiredSelections = question.correct.length;
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
  const hasHint = Boolean(question.hint?.trim());
  const hintMarkdown = (question.hint ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (/^[-*]\s+/.test(line) ? line : `- ${line}`))
    .join("\n");
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
          <button
            onClick={handleCopyQuestion}
            className="text-xs px-2.5 py-1 rounded-md font-semibold"
            aria-label="Copy question and options"
            title="Copy question and options"
            style={{
              backgroundColor: "#E8F0FE",
              color: "#1A73E8",
            }}
          >
            ⧉
          </button>
          {copyStatus && (
            <span
              className="text-xs font-medium"
              style={{ color: copyStatus === "Copied" ? "#137333" : "#C5221F" }}
            >
              {copyStatus}
            </span>
          )}

          {/* Tags */}
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

      {/* Main content with desktop right rail */}
      <div className="px-6 py-5 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:gap-6">
        <div>
          {!isSingleSelect && (
            <div
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
              style={{ backgroundColor: "#FEF7E0", color: "#B06000" }}
            >
              <span>☑</span>
              <span>Select {requiredSelections} answers</span>
            </div>
          )}
          <p className="text-base leading-relaxed font-medium" style={{ color: "#202124" }}>
            {question.question}
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
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
        </div>

        <div className="mt-5 lg:mt-0 flex flex-col gap-4">
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: "#E8F0FE", border: "1px solid #D2E3FC" }}
          >
            {!confirmed && !isSingleSelect && (
              <p className="text-xs mb-2" style={{ color: "#1A73E8" }}>
                {selectedAnswers.length} / {requiredSelections} selected
              </p>
            )}

            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#1A73E8" }}>
              Progress
            </p>
            <div className="flex gap-1 flex-wrap">
              {progressDots.map((state, idx) => (
                <div
                  key={idx}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      state === "correct"
                        ? "#34A853"
                        : state === "incorrect"
                        ? "#EA4335"
                        : state === "current"
                        ? "#4285F4"
                        : "#DADCE0",
                  }}
                />
              ))}
            </div>
          </div>

          {!confirmed && hasHint && (
            <div
              className="rounded-lg p-4 text-sm leading-relaxed"
              style={{ backgroundColor: "#FFFDE7", color: "#3C4043", border: "1px solid #FEEAA0" }}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div
                  className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider"
                  style={{ color: "#B06000" }}
                >
                  <span>💡</span> Hint
                </div>
                <button
                  onClick={() => setIsHintVisible((prev) => !prev)}
                  className="rounded-md px-2 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: "#FEEAA0",
                    color: "#8D5A00",
                  }}
                  aria-expanded={isHintVisible}
                  aria-controls="question-hint-content"
                  aria-label={isHintVisible ? "Hide hint" : "Show hint"}
                  title={isHintVisible ? "Hide hint" : "Show hint"}
                >
                  {isHintVisible ? "Hide hint" : "Show hint"}
                </button>
              </div>
              {isHintVisible && (
                <div id="question-hint-content" className="prose prose-sm max-w-none" style={{ color: "inherit" }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-0">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-0">{children}</ol>,
                    }}
                  >
                    {hintMarkdown}
                  </ReactMarkdown>
                </div>
              )}
              {!isHintVisible && (
                <p className="text-xs" style={{ color: "#8D5A00" }}>
                  Hint hidden. Click Show hint to reveal guidance.
                </p>
              )}
            </div>
          )}

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

              <div
                className="rounded-lg p-4 text-sm leading-relaxed"
                style={{ backgroundColor: "#F8F9FA", color: "#3C4043" }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div
                    className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider"
                    style={{ color: "#4285F4" }}
                  >
                    <span>✦</span> Explanation
                  </div>
                  <button
                    onClick={() => {
                      setSaveStatus(null);
                      if (isEditingExplanation) {
                        setExplanationDraft(explanation ?? "");
                      }
                      setIsEditingExplanation((prev) => !prev);
                    }}
                    className="rounded-md px-2 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: "#E8F0FE",
                      color: "#1A73E8",
                    }}
                    aria-label={isEditingExplanation ? "Close explanation editor" : "Edit explanation"}
                    title={isEditingExplanation ? "Close editor" : "Edit explanation"}
                  >
                    {isEditingExplanation ? "✕" : "✎"}
                  </button>
                </div>

                {isEditingExplanation ? (
                  <>
                    <textarea
                      ref={explanationTextareaRef}
                      value={explanationDraft}
                      onChange={(e) => setExplanationDraft(e.target.value)}
                      onInput={autoResizeExplanationTextarea}
                      rows={1}
                      className="w-full rounded-md p-2 text-sm mb-3 resize-none overflow-hidden"
                      style={{ border: "1px solid #DADCE0", backgroundColor: "#fff" }}
                    />

                    {saveStatus && (
                      <p className="text-xs mb-2" style={{ color: saveStatus.startsWith("Saved") ? "#137333" : "#C5221F" }}>
                        {saveStatus}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            setIsSaving(true);
                            setSaveStatus(null);
                            await onSaveExplanation(explanationDraft);
                            setSaveStatus("Saved to dataset.");
                            setIsEditingExplanation(false);
                          } catch {
                            setSaveStatus("Save failed.");
                          } finally {
                            setIsSaving(false);
                          }
                        }}
                        disabled={isSaving}
                        className="px-3 py-2 rounded-md text-xs font-semibold"
                        style={{
                          backgroundColor: isSaving ? "#F1F3F4" : "#34A853",
                          color: isSaving ? "#BDC1C6" : "#fff",
                        }}
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setExplanationDraft(explanation ?? "");
                          setSaveStatus(null);
                          setIsEditingExplanation(false);
                        }}
                        disabled={isSaving}
                        className="px-3 py-2 rounded-md text-xs font-semibold"
                        style={{
                          backgroundColor: "#fff",
                          color: "#5F6368",
                          border: "1px solid #DADCE0",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : explanationDraft.trim() ? (
                  <div className="prose prose-sm max-w-none" style={{ color: "inherit" }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
                      }}
                    >
                      {explanationDraft}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span style={{ color: "#80868B" }}>No explanation text.</span>
                )}
              </div>

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
    </div>
  );
}
