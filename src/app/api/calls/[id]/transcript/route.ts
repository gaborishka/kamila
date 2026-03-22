import { NextRequest, NextResponse } from "next/server";
import { prisma, serializeTranscript } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const messages = await prisma.transcriptMessage.findMany({
      where: { callId: id },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json(messages.map(serializeTranscript));
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return NextResponse.json({ error: "Failed to fetch transcript" }, { status: 500 });
  }
}
