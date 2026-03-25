import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAgent, getSignedUrl } from "@/lib/elevenlabs";
import twilio from "twilio";

declare global {
  // eslint-disable-next-line no-var
  var __pendingCalls: Map<string, {
    signedUrl: string;
    dynamicVariables: Record<string, string>;
    createdAt: number;
  }>;
}

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

    if (call.status === "live" || call.status === "completed") {
      return NextResponse.json({ error: "Call already in progress" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const prepSteps = (call.prepSteps as { id: string; label: string; status: string; snippet: string | null }[]) || [];

    // 1. Create ElevenLabs agent (with all tools, prompt, TOS data)
    const agent = await createAgent({
      companyName: call.companyName,
      callId: id,
      tosData: (call.tosData as Record<string, unknown>) || {},
      redditTips: (call.redditTips as string[]) || [],
      consumerRights: (call.consumerRights as string[]) || [],
      webhookUrl: appUrl,
      additionalInfo: (call.additionalInfo as Record<string, string>) || undefined,
      language: call.language || "en",
    });

    // 2. Get signed WebSocket URL for connecting to the agent
    const signedUrl = await getSignedUrl(agent.agent_id);

    // 3. Store config so the WebSocket bridge handler can pick it up
    if (!globalThis.__pendingCalls) {
      globalThis.__pendingCalls = new Map();
    }
    globalThis.__pendingCalls.set(id, {
      signedUrl,
      dynamicVariables: {
        customer_name: call.customerName,
        order_number: call.orderNumber || "N/A",
        problem_description: call.problemDescription,
      },
      createdAt: Date.now(),
    });

    // 4. Initiate Twilio outbound call with TwiML → WebSocket bridge
    const wsUrl = appUrl.replace("https://", "wss://").replace("http://", "ws://");

    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    const twilioCall = await twilioClient.calls.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: call.supportPhone,
      twiml: `<Response><Connect><Stream url="${wsUrl}/media-stream"><Parameter name="callId" value="${id.replace(/[<>"&]/g, "")}"/></Stream></Connect></Response>`,
    });

    // 5. Update call status
    await prisma.call.update({
      where: { id },
      data: {
        status: "live",
        agentId: agent.agent_id,
        callStartedAt: new Date(),
        prepSteps: prepSteps.map((s) => ({ ...s, status: "complete" })),
      },
    });

    return NextResponse.json({
      success: true,
      agentId: agent.agent_id,
      callSid: twilioCall.sid,
    });
  } catch (error) {
    console.error("Dial failed:", error);
    return NextResponse.json({ error: "Failed to dial" }, { status: 500 });
  }
}
