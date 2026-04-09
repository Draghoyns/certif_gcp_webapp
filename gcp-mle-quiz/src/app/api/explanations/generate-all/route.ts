import { NextRequest, NextResponse } from "next/server";
import { loadQuestions, saveQuestions } from "@/lib/questions";
import { generateSingleParagraphExplanation } from "@/lib/explanations";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    overwrite?: boolean;
  };

  const overwrite = Boolean(body.overwrite);
  const questions = loadQuestions();

  let updated = 0;
  let failed = 0;
  const explanationsById: Record<string, string> = {};
  const errors: Array<{ questionId: number; error: string }> = [];

  for (const q of questions) {
    if (!overwrite && String(q.explanation ?? "").trim()) {
      continue;
    }

    try {
      const explanation = await generateSingleParagraphExplanation(
        q.question,
        q.options,
        q.correct ?? []
      );
      q.explanation = explanation;
      explanationsById[String(q.id)] = explanation;
      updated += 1;
    } catch (error) {
      failed += 1;
      errors.push({
        questionId: q.id,
        error: error instanceof Error ? error.message : "Generation failed",
      });
    }
  }

  saveQuestions(questions);

  return NextResponse.json({
    ok: true,
    total: questions.length,
    updated,
    failed,
    explanationsById,
    errors,
  });
}
