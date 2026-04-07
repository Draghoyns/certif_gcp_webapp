import { NextRequest, NextResponse } from "next/server";
import {
  loadQuestions,
  filterByTags,
  weightedSample,
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
