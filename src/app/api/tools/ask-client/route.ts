import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 60_000;

export async function POST(req: NextRequest) {
  const callId = req.nextUrl.searchParams.get("callId");
  if (!callId) {
    return NextResponse.json({ error: "Missing callId" }, { status: 400 });
  }

  let body: { question?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const question = body.question;
  if (!question) {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }

  // Create the question record
  const q = await prisma.clientQuestion.create({
    data: { callId, question },
  });

  // Long-poll: wait for the client to answer
  const start = Date.now();
  while (Date.now() - start < POLL_TIMEOUT_MS) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const updated = await prisma.clientQuestion.findUnique({
      where: { id: q.id },
    });

    if (updated?.answer) {
      return NextResponse.json({
        response: updated.answer,
      });
    }
  }

  // Timeout — tell the agent to continue without it
  return NextResponse.json({
    response:
      "The client did not respond in time. Please continue without this information or try asking the operator directly.",
  });
}
