export interface Question {
  id: number;
  question: string;
  options: Record<string, string>;
  correct: string[];
  optionExplanations?: Record<string, string>;
  tags: string[];
  timesAnswered: number;
  timesCorrect: number;
  explanation?: string;
}

export interface SessionResult {
  questionId: number;
  selectedAnswers: string[];
  isCorrect: boolean;
}

export const ALL_TAGS = [
  "Data Ingestion & Preparation",
  "Data exploration & Baseline",
  "Experimental protocol",
  "Operationalization & Iterations",
  "Serving & Deployment",
  "Monitor",
] as const;

export type Tag = (typeof ALL_TAGS)[number];

export const TAG_LABELS: Record<string, string> = {
  "Data Ingestion & Preparation": "Data Ingestion & Preparation",
  "Data exploration & Baseline": "Data Exploration & Baseline",
  "Experimental protocol": "Experimental Protocol",
  "Operationalization & Iterations": "Operationalization & Iterations",
  "Serving & Deployment": "Serving & Deployment",
  Monitor: "Monitor",
};

export const TAG_COLORS: Record<string, string> = {
  "Data Ingestion & Preparation": "#4285F4",
  "Data exploration & Baseline": "#34A853",
  "Experimental protocol": "#FBBC04",
  "Operationalization & Iterations": "#EA4335",
  "Serving & Deployment": "#1A73E8",
  Monitor: "#0F9D58",
};
