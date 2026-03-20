import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const callRef = getAdminDb().collection("calls").doc(id);
    const callDoc = await callRef.get();

    if (!callDoc.exists) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    await callRef.update({
      status: "completed",
      callEndedAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to end call:", error);
    return NextResponse.json({ error: "Failed to end call" }, { status: 500 });
  }
}
