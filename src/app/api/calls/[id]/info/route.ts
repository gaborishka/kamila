import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

interface PrepStep {
  id: string;
  label: string;
  status: string;
  snippet: string | null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const call = await prisma.call.findUnique({ where: { id } });

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    if (call.status !== "needs_info") {
      return NextResponse.json({ error: "Call is not awaiting info" }, { status: 400 });
    }

    const body = await req.json();
    const rawAnswers = body.answers;

    if (!rawAnswers || typeof rawAnswers !== "object") {
      return NextResponse.json({ error: "Missing answers" }, { status: 400 });
    }

    // Only accept answers for questions that were actually asked
    const missingInfo = call.missingInfo as { questions: { id: string }[] } | null;
    const validIds = new Set(missingInfo?.questions?.map((q) => q.id) || []);
    const answers: Record<string, string> = {};
    for (const [key, val] of Object.entries(rawAnswers)) {
      if (validIds.has(key) && typeof val === "string") {
        answers[key] = val.slice(0, 1000); // cap answer length
      }
    }

    // Update prepSteps to mark review as complete and set dialing as active
    const steps = (call.prepSteps as unknown as PrepStep[]) || [];
    const updatedSteps: Prisma.InputJsonValue = steps.map((s) => ({
      ...s,
      ...(s.id === "review" ? { status: "complete", snippet: "Additional details provided — case strengthened." } : {}),
      ...(s.id === "dialing" ? { status: "active" } : {}),
    })) as unknown as Prisma.InputJsonValue;

    await prisma.call.update({
      where: { id },
      data: {
        status: "preparing",
        additionalInfo: answers,
        missingInfo: { sufficient: true, questions: [] },
        prepSteps: updatedSteps,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save additional info:", error);
    return NextResponse.json({ error: "Failed to save info" }, { status: 500 });
  }
}
