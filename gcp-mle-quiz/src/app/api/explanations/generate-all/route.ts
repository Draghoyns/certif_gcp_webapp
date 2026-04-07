import { NextRequest, NextResponse } from "next/server";
import { loadQuestions, saveQuestions } from "@/lib/questions";

function extractJsonBlock(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced ? fenced[1].trim() : trimmed;
}

async function generateSingleParagraphExplanation(
  questionText: string,
  options: Record<string, string>,
  correct: string[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const optionLines = Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}. ${v}`)
    .join("\n");

  const prompt = [
    "You are a Google Cloud Professional Machine Learning Engineer tutor.",
    "Generate teaching-quality explanations for a multiple-choice exam question.",
    "Requirements:",
    "- Return strict JSON only.",
    '- JSON schema: { "optionSentences": { "A": "one sentence", "B": "one sentence", ... } }',
    "- Write exactly one sentence for each option letter present and include every option letter.",
    "- Be specific to this question context.",
    "- For correct options, state why they are correct.",
    "- For incorrect options, state why they are not the best choice.",
    "- Keep each sentence concise and clear.",
    "",
    `Question: ${questionText}`,
    "Options:",
    optionLines,
    `Correct options: ${correct.join(", ")}`,
  ].join("\n");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 768,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini request failed: ${res.status}`);
  }

  const body = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const rawText =
    body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("\n") ?? "";

  if (!rawText.trim()) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed = JSON.parse(extractJsonBlock(rawText)) as {
    optionSentences?: Record<string, string>;
  };

  const sentences: string[] = [];
  for (const letter of Object.keys(options).sort()) {
    const value = String(parsed.optionSentences?.[letter] ?? "").trim();
    if (!value) {
      throw new Error(`Missing generated sentence for option ${letter}`);
    }
    const normalizedSentence = /[.!?]$/.test(value) ? value : `${value}.`;
    sentences.push(`${letter}: ${normalizedSentence}`);
  }

  return sentences.join(" ");
}

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
