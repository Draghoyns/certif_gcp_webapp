export interface Question {
  id: number;
  question: string;
  options: Record<string, string>;
  correct: string[];
  tags: string[];
  timesAnswered: number;
  timesCorrect: number;
  explanation?: string;
  hint?: string;
}

export interface SessionResult {
  questionId: number;
  selectedAnswers: string[];
  isCorrect: boolean;
}

export type CertificationType = "MLE" | "DE";

export const MLE_TAGS = [
  "Data Ingestion & Preparation",
  "Data exploration & Baseline",
  "Experimental protocol",
  "Operationalization & Iterations",
  "Serving & Deployment",
  "Monitor",
] as const;

export const DE_TAGS = [
  "Data Ingestion & Pipelines",
  "Storage & Databases",
  "Analytics & Query Optimization",
  "Architecture & Cost Management",
] as const;

export type Tag = (typeof MLE_TAGS)[number] | (typeof DE_TAGS)[number];

export const CERTIFICATION_TAGS: Record<CertificationType, readonly string[]> = {
  MLE: MLE_TAGS,
  DE: DE_TAGS,
};

export function getTagsForCertification(
  certificationType: CertificationType | null
): string[] {
  if (certificationType === "DE") return [...DE_TAGS];
  return [...MLE_TAGS];
}

export const TAG_LABELS: Record<string, string> = {
  "Data Ingestion & Preparation": "Data Ingestion & Preparation",
  "Data exploration & Baseline": "Data Exploration & Baseline",
  "Experimental protocol": "Experimental Protocol",
  "Operationalization & Iterations": "Operationalization & Iterations",
  "Serving & Deployment": "Serving & Deployment",
  Monitor: "Monitor",
  "Data Ingestion & Pipelines": "Data Ingestion & Pipelines",
  "Storage & Databases": "Storage & Databases",
  "Analytics & Query Optimization": "Analytics & Query Optimization",
  "Architecture & Cost Management": "Architecture & Cost Management",
};

export const TAG_COLORS: Record<string, string> = {
  "Data Ingestion & Preparation": "#4285F4",
  "Data exploration & Baseline": "#34A853",
  "Experimental protocol": "#FBBC04",
  "Operationalization & Iterations": "#EA4335",
  "Serving & Deployment": "#1A73E8",
  Monitor: "#0F9D58",
  "Data Ingestion & Pipelines": "#4285F4",
  "Storage & Databases": "#0F9D58",
  "Analytics & Query Optimization": "#FBBC04",
  "Architecture & Cost Management": "#EA4335",
};
