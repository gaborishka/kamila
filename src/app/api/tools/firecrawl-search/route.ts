import { NextRequest, NextResponse } from "next/server";
import { searchWeb } from "@/lib/firecrawl";

export async function POST(req: NextRequest) {
  const toolSecret = process.env.TOOL_WEBHOOK_SECRET;
  const authHeader = req.headers.get("authorization");
  if (toolSecret && authHeader !== `Bearer ${toolSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const query = body.query;

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const results = await searchWeb(query);
    const formatted = results
      .map((r: { title?: string; markdown?: string }) => `${r.title || ""}: ${r.markdown || ""}`)
      .join("\n\n---\n\n");

    return NextResponse.json({ results: formatted });
  } catch (error) {
    console.error("Firecrawl search failed:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
