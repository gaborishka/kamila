import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { createAgent, initiateOutboundCall } from "@/lib/elevenlabs";

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

    const callData = callDoc.data();
    if (!callData) {
      return NextResponse.json({ error: "Call data is empty" }, { status: 404 });
    }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create ElevenLabs agent
    const agent = await createAgent({
      companyName: callData.companyName,
      tosData: callData.tosData || {},
      redditTips: callData.redditTips || [],
      consumerRights: callData.consumerRights || [],
      webhookUrl: appUrl,
    });

    // Initiate outbound call
    const callResult = await initiateOutboundCall({
      agentId: agent.agent_id,
      toNumber: callData.supportPhone,
      customerName: callData.customerName,
      orderNumber: callData.orderNumber || "N/A",
      problemDescription: callData.problemDescription,
    });

    // Update call status
    await callRef.update({
      status: "live",
      agentId: agent.agent_id,
      conversationId: callResult.conversation_id || null,
      callStartedAt: Date.now(),
      "prepSteps": callData.prepSteps.map((s: { id: string }) => ({
        ...s,
        status: "complete",
      })),
    });

    return NextResponse.json({ success: true, agentId: agent.agent_id });
  } catch (error) {
    console.error("Dial failed:", error);
    return NextResponse.json({ error: "Failed to dial" }, { status: 500 });
  }
}
