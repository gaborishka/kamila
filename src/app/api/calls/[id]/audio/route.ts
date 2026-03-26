import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const call = await prisma.call.findUnique({ where: { id } });
    if (!call?.conversationId) {
      return NextResponse.json({ error: "No recording available" }, { status: 404 });
    }

    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${call.conversationId}/audio`,
      { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY || "" } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Recording not available" }, { status: 404 });
    }

    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching audio:", error);
    return NextResponse.json({ error: "Failed to fetch audio" }, { status: 500 });
  }
}
