import { NextResponse } from "next/server";
import { saveQuestionsSnapshot } from "@/lib/questions";

export async function POST() {
  try {
    const snapshot = saveQuestionsSnapshot();
    return NextResponse.json({ ok: true, snapshot });
  } catch {
    return NextResponse.json(
      { error: "Failed to save progress snapshot" },
      { status: 500 }
    );
  }
}