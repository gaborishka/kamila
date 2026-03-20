const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
  };
}

interface CreateAgentParams {
  companyName: string;
  tosData: Record<string, unknown>;
  redditTips: string[];
  consumerRights: string[];
  webhookUrl: string;
}

export async function createAgent({
  companyName,
  tosData,
  redditTips,
  consumerRights,
  webhookUrl,
}: CreateAgentParams) {
  const systemPrompt = `You are Kamila, a professional and relentless consumer rights advocate. You are calling ${companyName}'s customer support on behalf of your client.

Your goal is to obtain a refund or compensation for the customer. Be polite but firm. Never give up easily.

## Terms of Service Key Points:
${JSON.stringify(tosData, null, 2)}

## Proven Strategies from Other Customers:
${redditTips.map((t, i) => `${i + 1}. ${t}`).join("\n")}

## Consumer Rights & Legal Arguments:
${consumerRights.map((r, i) => `${i + 1}. ${r}`).join("\n")}

## Instructions:
- Introduce yourself as calling on behalf of the customer
- Clearly state the problem and desired resolution
- If the operator denies the request, cite specific Terms of Service sections
- If they still resist, mention consumer protection laws and regulatory bodies
- Stay calm, professional, and persistent
- If offered a partial resolution, negotiate for better terms
- Collect the operator's name and any reference numbers
- Use {{customer_name}}, {{order_number}}, and {{problem_description}} as provided`;

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
          ],
        },
        tts: {
          voice_id: "21m00Tcm4TlvDq8ikWAM",
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

interface OutboundCallParams {
  agentId: string;
  toNumber: string;
  customerName: string;
  orderNumber: string;
  problemDescription: string;
}

export async function initiateOutboundCall({
  agentId,
  toNumber,
  customerName,
  orderNumber,
  problemDescription,
}: OutboundCallParams) {
  const res = await fetch(`${ELEVENLABS_API_BASE}/convai/twilio/outbound-call`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      agent_id: agentId,
      agent_phone_number_id: process.env.TWILIO_PHONE_NUMBER,
      to_number: toNumber,
      conversation_initiation_client_data: {
        dynamic_variables: {
          customer_name: customerName,
          order_number: orderNumber,
          problem_description: problemDescription,
        },
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to initiate call: ${error}`);
  }

  return res.json();
}
