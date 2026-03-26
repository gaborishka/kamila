import { NextRequest, NextResponse } from "next/server";
import { prisma, serializeCall } from "@/lib/db";
import { auth } from "@/lib/auth";

async function syncFromElevenLabs(callId: string, conversationId: string) {
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
      { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY || "" } }
    );
    if (!res.ok) return;

    const data = await res.json();
    if (data.status !== "done") return;

    const analysis = data.analysis || {};
    const dataCollection = analysis.data_collection || {};
    const transcript = data.transcript || [];

    // Determine result
    const resolutionType = dataCollection.resolution_type || "denied";
    let resultType: "success" | "partial" | "failed" = "failed";
    if (resolutionType === "full_refund") resultType = "success";
    else if (["partial_refund", "store_credit", "replacement"].includes(resolutionType))
      resultType = "partial";

    const resolutionAmount = dataCollection.resolution_amount
      ? parseFloat(dataCollection.resolution_amount)
      : undefined;

    // Save transcript
    if (transcript.length > 0) {
      const existing = await prisma.transcriptMessage.count({ where: { callId } });
      if (existing === 0) {
        await prisma.transcriptMessage.createMany({
          data: transcript.map((msg: { role: string; message: string; time_in_call_secs?: number }) => ({
            callId,
            speaker: msg.role === "agent" ? "kamila" : "operator",
            text: msg.message,
            timestamp: msg.time_in_call_secs ? msg.time_in_call_secs * 1000 : 0,
            citedTos:
              msg.message?.toLowerCase().includes("terms of service") ||
              msg.message?.toLowerCase().includes("section") ||
              msg.message?.toLowerCase().includes("policy"),
          })),
        });
      }
    }

    // Update call
    await prisma.call.update({
      where: { id: callId },
      data: {
        status: "completed",
        callEndedAt: new Date(),
        resultType,
        resultAmount: resolutionAmount,
        resultCurrency: dataCollection.currency || "EUR",
        operatorName: dataCollection.operator_name || null,
        referenceNumber: dataCollection.reference_number || null,
        resultSummary: analysis.call_successful
          ? `Resolution achieved: ${resolutionType.replace("_", " ")}`
          : `Call ended without full resolution. Suggested next step: escalation.`,
        audioUrl: `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`,
      },
    });
  } catch (e) {
    console.error("ElevenLabs sync failed:", e);
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    let call = await prisma.call.findUnique({ where: { id } });
    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }
    if (call.userId && call.userId !== session?.user?.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Sync from ElevenLabs if call has no result yet
    if (!call.resultType && call.conversationId) {
      await syncFromElevenLabs(id, call.conversationId);
      call = await prisma.call.findUnique({ where: { id } });
      if (!call) {
        return NextResponse.json({ error: "Call not found" }, { status: 404 });
      }
    }

    return NextResponse.json(serializeCall(call));
  } catch (error) {
    console.error("Error fetching call:", error);
    return NextResponse.json({ error: "Failed to fetch call" }, { status: 500 });
  }
}
