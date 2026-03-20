import { NextRequest, NextResponse } from "next/server";
import { prisma, serializeCall } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const call = await prisma.call.findUnique({ where: { id } });
    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }
    return NextResponse.json(serializeCall(call));
  } catch (error) {
    console.error("Error fetching call:", error);
    return NextResponse.json({ error: "Failed to fetch call" }, { status: 500 });
  }
}
