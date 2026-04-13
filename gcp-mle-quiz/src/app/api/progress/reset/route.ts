import { NextResponse } from "next/server";
import { resetAllProgress } from "@/lib/questions";

export async function POST() {
  try {
    const resetCount = resetAllProgress();
    return NextResponse.json({ ok: true, resetCount });
  } catch {
    return NextResponse.json(
      { error: "Failed to reset progress" },
      { status: 500 }
    );
  }
}