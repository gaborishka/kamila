import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

    await prisma.call.update({
      where: { id },
      data: {
        status: "completed",
        callEndedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to end call:", error);
    return NextResponse.json({ error: "Failed to end call" }, { status: 500 });
  }
}
