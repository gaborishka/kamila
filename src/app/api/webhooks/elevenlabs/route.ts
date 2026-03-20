import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.ELEVENLABS_WEBHOOK_SECRET;
  const authHeader = req.headers.get("x-webhook-secret") || req.nextUrl.searchParams.get("secret");

  if (!webhookSecret) {
    console.warn("ELEVENLABS_WEBHOOK_SECRET not set — webhook auth is disabled");
  }
  if (webhookSecret && authHeader !== webhookSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Find the call by conversation_id or agent_id
    const agentId = body.agent_id;
    const conversationId = body.conversation_id;

    let call;
    if (conversationId) {
      call = await prisma.call.findFirst({
        where: { conversationId },
      });
    }
    if (!call && agentId) {
      call = await prisma.call.findFirst({
        where: { agentId },
      });
    }

    if (!call) {
      console.error("No matching call found for webhook");
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Parse webhook data
    const analysis = body.analysis || {};
    const dataCollection = analysis.data_collection || {};
    const transcript = body.transcript || [];

    // Determine result type
    const resolutionType = dataCollection.resolution_type || "denied";
    let resultType: "success" | "partial" | "failed" = "failed";
    if (resolutionType === "full_refund") resultType = "success";
    else if (["partial_refund", "store_credit", "replacement"].includes(resolutionType))
      resultType = "partial";

    const resolutionAmount = dataCollection.resolution_amount
      ? parseFloat(dataCollection.resolution_amount)
      : undefined;

    // Store transcript (idempotent: delete existing + re-insert in transaction)
    if (transcript.length > 0) {
      await prisma.$transaction([
        prisma.transcriptMessage.deleteMany({ where: { callId: call.id } }),
        prisma.transcriptMessage.createMany({
          data: transcript.map((msg: { role: string; message: string; time_in_call_secs?: number }) => ({
            callId: call.id,
            speaker: msg.role === "agent" ? "kamila" : "operator",
            text: msg.message,
            timestamp: msg.time_in_call_secs ? msg.time_in_call_secs * 1000 : Date.now(),
            citedTos:
              msg.message?.toLowerCase().includes("terms of service") ||
              msg.message?.toLowerCase().includes("section") ||
              msg.message?.toLowerCase().includes("policy"),
          })),
        }),
      ]);
    }

    // Update call document
    await prisma.call.update({
      where: { id: call.id },
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
        audioUrl: body.recording_url || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
