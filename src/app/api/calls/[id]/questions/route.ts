import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — list pending (unanswered) questions for a call
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const questions = await prisma.clientQuestion.findMany({
      where: { callId: id, answer: null },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      questions.map((q) => ({
        id: q.id,
        callId: q.callId,
        question: q.question,
        answer: q.answer,
        createdAt: q.createdAt.getTime(),
        answeredAt: q.answeredAt?.getTime(),
      }))
    );
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

// POST — submit an answer to a question
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { questionId, answer } = body;

    if (!questionId || !answer) {
      return NextResponse.json(
        { error: "Missing questionId or answer" },
        { status: 400 }
      );
    }

    // Verify the question belongs to this call
    const question = await prisma.clientQuestion.findFirst({
      where: { id: questionId, callId: id },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Save the answer
    await prisma.clientQuestion.update({
      where: { id: questionId },
      data: { answer, answeredAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error answering question:", error);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}
