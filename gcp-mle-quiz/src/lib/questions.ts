import fs from "fs";
import path from "path";
import type { Question } from "./types";

const QUESTIONS_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "questions.json"
);

export function loadQuestions(): Question[] {
  const raw = fs.readFileSync(QUESTIONS_PATH, "utf-8");
  return JSON.parse(raw) as Question[];
}

export function saveQuestions(questions: Question[]): void {
  fs.writeFileSync(
    QUESTIONS_PATH,
    JSON.stringify(questions, null, 2),
    "utf-8"
  );
}

/** Weighted probability for a question to appear in the next session. */
export function getQuestionWeight(q: Question): number {
  if (q.timesAnswered === 0) return 2.5; // unseen: medium-high priority
  const accuracy = q.timesCorrect / q.timesAnswered;
  if (accuracy >= 0.9) return 0.3; // mastered: rarely show
  if (accuracy >= 0.7) return 1.0; // good
  if (accuracy >= 0.4) return 2.0; // struggling
  return 4.0; // weak spot: show often
}

/** Sample `n` questions using weighted roulette-wheel without replacement. */
export function weightedSample(questions: Question[], n: number): Question[] {
  if (questions.length <= n)
    return [...questions].sort(() => Math.random() - 0.5);

  const pool = [...questions];
  const poolWeights = pool.map(getQuestionWeight);
  const result: Question[] = [];

  while (result.length < n && pool.length > 0) {
    const total = poolWeights.reduce((s, w) => s + w, 0);
    let r = Math.random() * total;
    let i = 0;
    while (i < poolWeights.length - 1 && r > poolWeights[i]) {
      r -= poolWeights[i];
      i++;
    }
    result.push(pool.splice(i, 1)[0]);
    poolWeights.splice(i, 1);
  }
  return result;
}

export function filterByTags(questions: Question[], tags: string[]): Question[] {
  if (tags.length === 0) return [];
  return questions.filter((q) => q.tags.some((t) => tags.includes(t)));
}

export function updateProgress(questionId: number, isCorrect: boolean): void {
  const questions = loadQuestions();
  const q = questions.find((q) => q.id === questionId);
  if (!q) return;
  q.timesAnswered += 1;
  if (isCorrect) q.timesCorrect += 1;
  saveQuestions(questions);
}

export interface ExplanationUpdatePayload {
  explanation?: string;
  optionExplanations?: Record<string, string>;
}

export function updateQuestionExplanations(
  questionId: number,
  payload: ExplanationUpdatePayload
): Question | null {
  const questions = loadQuestions();
  const q = questions.find((item) => item.id === questionId);
  if (!q) return null;

  if (typeof payload.explanation === "string") {
    q.explanation = payload.explanation;
  }

  if (payload.optionExplanations && typeof payload.optionExplanations === "object") {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(payload.optionExplanations)) {
      const letter = key.trim().toUpperCase();
      if (!q.options[letter]) continue;
      normalized[letter] = String(value ?? "").trim();
    }
    q.optionExplanations = normalized;
  }

  saveQuestions(questions);
  return q;
}

export interface TagStat {
  tag: string;
  total: number;
  answered: number;
  correct: number;
  accuracy: number; // 0-1
}

export function getTagStats(questions: Question[]): TagStat[] {
  const map: Record<string, { total: number; answered: number; correct: number }> = {};

  for (const q of questions) {
    for (const tag of q.tags) {
      if (!map[tag]) map[tag] = { total: 0, answered: 0, correct: 0 };
      map[tag].total += 1;
      if (q.timesAnswered > 0) {
        map[tag].answered += 1;
        map[tag].correct += q.timesCorrect / q.timesAnswered;
      }
    }
  }

  return Object.entries(map)
    .map(([tag, s]) => ({
      tag,
      total: s.total,
      answered: s.answered,
      correct: s.correct,
      accuracy: s.answered > 0 ? s.correct / s.answered : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy); // weakest first
}
