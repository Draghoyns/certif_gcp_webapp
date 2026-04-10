import { NextRequest, NextResponse } from "next/server";
import {
  loadQuestions,
  filterByTags,
  weightedSample,
  updateQuestionFields,
} from "@/lib/questions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tagsParam = searchParams.get("tags");
  const count = parseInt(searchParams.get("count") ?? "10", 10);

  const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : [];

  const all = loadQuestions();
  const filtered = filterByTags(all, tags);
  const sampled = weightedSample(filtered, count);

  return NextResponse.json(sampled);
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json()) as {
    questionId?: number;
    explanation?: string;
    question?: string;
  };

  if (typeof body.questionId !== "number") {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }

  const updated = updateQuestionFields(body.questionId, {
    explanation: body.explanation,
    question: body.question,
  });

  if (!updated) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, question: updated });
}
