import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAgent, initiateOutboundCall } from "@/lib/elevenlabs";

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const prepSteps = (call.prepSteps as { id: string; label: string; status: string; snippet: string | null }[]) || [];

    // Create ElevenLabs agent
    const agent = await createAgent({
      companyName: call.companyName,
      tosData: (call.tosData as Record<string, unknown>) || {},
      redditTips: (call.redditTips as string[]) || [],
      consumerRights: (call.consumerRights as string[]) || [],
      webhookUrl: appUrl,
    });

    // Initiate outbound call
    const callResult = await initiateOutboundCall({
      agentId: agent.agent_id,
      toNumber: call.supportPhone,
      customerName: call.customerName,
      orderNumber: call.orderNumber || "N/A",
      problemDescription: call.problemDescription,
    });

    // Update call status
    await prisma.call.update({
      where: { id },
      data: {
        status: "live",
        agentId: agent.agent_id,
        conversationId: callResult.conversation_id || null,
        callStartedAt: new Date(),
        prepSteps: prepSteps.map((s) => ({ ...s, status: "complete" })),
      },
    });

    return NextResponse.json({ success: true, agentId: agent.agent_id });
  } catch (error) {
    console.error("Dial failed:", error);
    return NextResponse.json({ error: "Failed to dial" }, { status: 500 });
  }
}
