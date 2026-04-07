import { NextRequest, NextResponse } from "next/server";
import { loadQuestions, getTagStats, updateProgress } from "@/lib/questions";

export async function GET() {
  const questions = loadQuestions();
  const stats = getTagStats(questions);
  return NextResponse.json({ stats });
}

export async function POST(request: NextRequest) {
  const { questionId, isCorrect } = (await request.json()) as {
    questionId: number;
    isCorrect: boolean;
  };
  updateProgress(questionId, isCorrect);
  return NextResponse.json({ ok: true });
}
