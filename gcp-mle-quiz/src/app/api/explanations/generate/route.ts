import { NextRequest, NextResponse } from "next/server";
import { loadQuestions, updateQuestionExplanations } from "@/lib/questions";
import { generateSingleParagraphExplanation } from "@/lib/explanations";

interface GenerationResult {
  explanation: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { questionId?: number };

  if (typeof body.questionId !== "number") {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }

  const questions = loadQuestions();
  const q = questions.find((item) => item.id === body.questionId);

  if (!q) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  try {
    const generatedExplanation = await generateSingleParagraphExplanation(
      q.question,
      q.options,
      q.correct ?? [],
      1024
    );

    const generated: GenerationResult = { explanation: generatedExplanation };
    const updated = updateQuestionExplanations(q.id, generated);

    return NextResponse.json({ ok: true, question: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
