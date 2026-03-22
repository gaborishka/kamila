const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
  };
}

interface CreateAgentParams {
  companyName: string;
  callId: string;
  tosData: Record<string, unknown>;
  redditTips: string[];
  consumerRights: string[];
  webhookUrl: string;
  additionalInfo?: Record<string, string>;
}

export async function createAgent({
  companyName,
  callId,
  tosData,
  redditTips,
  consumerRights,
  webhookUrl,
  additionalInfo,
}: CreateAgentParams) {
  const additionalInfoSection = additionalInfo && Object.keys(additionalInfo).length > 0
    ? `\n## Additional Details Provided by Client:\n${Object.entries(additionalInfo).map(([key, val]) => `- ${key.replace(/[#\n\r]/g, "")}: ${val.replace(/[#\n\r]/g, " ").slice(0, 500)}`).join("\n")}\n`
    : "";

  const systemPrompt = `You are Kamila, a professional and relentless consumer rights advocate. You are calling ${companyName}'s customer support on behalf of your client.

Your goal is to obtain a refund or compensation for the customer. Be polite but firm. Never give up easily.

## Terms of Service Key Points:
${JSON.stringify(tosData, null, 2)}

## Proven Strategies from Other Customers:
${redditTips.map((t, i) => `${i + 1}. ${t}`).join("\n")}

## Consumer Rights & Legal Arguments:
${consumerRights.map((r, i) => `${i + 1}. ${r}`).join("\n")}
${additionalInfoSection}
## Instructions:
- Introduce yourself as calling on behalf of the customer
- Clearly state the problem and desired resolution
- If the operator denies the request, cite specific Terms of Service sections
- If they still resist, mention consumer protection laws and regulatory bodies
- Stay calm, professional, and persistent
- If offered a partial resolution, negotiate for better terms
- Collect the operator's name and any reference numbers
- Use {{customer_name}}, {{order_number}}, and {{problem_description}} as provided
- If you need information that wasn't provided (like order number, date, exact amount, account details), use the ask_client tool to ask the customer. They are listening to the call live and can provide information in real-time. While waiting for their response, tell the operator something like "Let me check that with my client" to keep the conversation natural.`;

  const res = await fetch(`${ELEVENLABS_API_BASE}/convai/agents/create`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name: `Kamila - Refund Agent for ${companyName}`,
      conversation_config: {
        agent: {
          prompt: { prompt: systemPrompt },
          first_message: "Hello, my name is Kamila. I'm calling on behalf of my client regarding a recent issue with your service. Could you please connect me with someone who can help with refund requests?",
          language: "en",
          tools: [
            {
              type: "webhook",
              name: "search_web",
              description: "Search the web for additional legal arguments, consumer rights information, or company policies",
              api_schema: {
                url: `${webhookUrl}/api/tools/firecrawl-search`,
                method: "POST",
                request_body: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description: "The search query to find relevant information",
                    },
                  },
                  required: ["query"],
                },
              },
            },
            {
              type: "webhook",
              name: "ask_client",
              description: "Ask your client (the person who initiated this call) for information you need but don't have. Use this when the operator asks for details like order number, account number, date of purchase, exact amount, or any other information not in your briefing. The client is listening live and will respond.",
              api_schema: {
                url: `${webhookUrl}/api/tools/ask-client?callId=${callId}`,
                method: "POST",
                request_body: {
                  type: "object",
                  properties: {
                    question: {
                      type: "string",
                      description: "The question to ask the client, e.g. 'What is your order number?' or 'When did you make the purchase?'",
                    },
                  },
                  required: ["question"],
                },
              },
            },
          ],
        },
        tts: {
          model_id: "eleven_v3_conversational",
          voice_id: "EXAVITQu4vr4xnSDxMaL", // Sarah - Mature, Reassuring, Confident
          expressivity: 1.0,
          agent_output_audio_format: "ulaw_8000", // Twilio native format — no conversion needed
        },
      },
      platform_settings: {
        evaluation_criteria: [
          {
            id: "obtained_resolution",
            name: "obtained_resolution",
            description: "Whether the agent successfully obtained a refund, compensation, or other resolution for the customer",
          },
        ],
        data_collection: {
          resolution_type: {
            type: "string",
            description: "Type of resolution obtained: full_refund, partial_refund, store_credit, replacement, escalation, denied",
          },
          resolution_amount: {
            type: "string",
            description: "Amount of refund or compensation obtained, if any",
          },
          operator_name: {
            type: "string",
            description: "Name of the support operator if provided",
          },
          reference_number: {
            type: "string",
            description: "Any reference or case number provided by the operator",
          },
        },
        post_call_webhook_url: `${webhookUrl}/api/webhooks/elevenlabs`,
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create agent: ${error}`);
  }

  return res.json();
}

/** Get a signed WebSocket URL for connecting to an ElevenLabs agent */
export async function getSignedUrl(agentId: string): Promise<string> {
  const res = await fetch(
    `${ELEVENLABS_API_BASE}/convai/conversation/get_signed_url?agent_id=${agentId}`,
    { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY || "" } }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to get signed URL: ${error}`);
  }

  const data = await res.json();
  return data.signed_url;
}
