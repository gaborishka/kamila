import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.ELEVENLABS_WEBHOOK_SECRET;
  const authHeader = req.headers.get("x-webhook-secret") || req.nextUrl.searchParams.get("secret");
  if (webhookSecret && authHeader !== webhookSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Find the call by agent_id or conversation_id
    const agentId = body.agent_id;
    const conversationId = body.conversation_id;

    let callQuery;
    if (conversationId) {
      callQuery = await getAdminDb()
        .collection("calls")
        .where("conversationId", "==", conversationId)
        .limit(1)
        .get();
    } else if (agentId) {
      callQuery = await getAdminDb()
        .collection("calls")
        .where("agentId", "==", agentId)
        .limit(1)
        .get();
    }

    if (!callQuery || callQuery.empty) {
      console.error("No matching call found for webhook");
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    const callDoc = callQuery.docs[0];
    const callRef = callDoc.ref;

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

    // Store transcript messages
    const batch = getAdminDb().batch();
    for (const msg of transcript) {
      const msgRef = callRef.collection("transcript").doc();
      batch.set(msgRef, {
        speaker: msg.role === "agent" ? "kamila" : "operator",
        text: msg.message,
        timestamp: msg.time_in_call_secs ? msg.time_in_call_secs * 1000 : Date.now(),
        citedTos: msg.message?.toLowerCase().includes("terms of service") ||
                  msg.message?.toLowerCase().includes("section") ||
                  msg.message?.toLowerCase().includes("policy"),
      });
    }
    await batch.commit();

    // Update call document
    await callRef.update({
      status: "completed",
      callEndedAt: Date.now(),
      result: {
        type: resultType,
        amount: resolutionAmount,
        currency: "EUR",
        operatorName: dataCollection.operator_name || null,
        referenceNumber: dataCollection.reference_number || null,
        summary: analysis.call_successful
          ? `Resolution achieved: ${resolutionType.replace("_", " ")}`
          : `Call ended without full resolution. Suggested next step: escalation.`,
      },
      audioUrl: body.recording_url || null,
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
