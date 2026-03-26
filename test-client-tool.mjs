import WebSocket from "ws";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "sk_33dd14a1852507c96e602be4525fa888811a8b2b0bfe0b49";
const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

/**
 * Generate a silent PCM 16-bit 16kHz audio chunk (base64).
 * ElevenLabs expects user_audio_chunk in base64 PCM 16kHz.
 * We send near-silence with tiny noise so VAD detects "end of speech".
 */
function generateSilentAudio(durationMs = 500) {
  const sampleRate = 16000;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const buf = Buffer.alloc(numSamples * 2); // 16-bit = 2 bytes per sample
  // Add tiny noise to avoid being ignored by VAD
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.floor((Math.random() - 0.5) * 20); // very quiet noise
    buf.writeInt16LE(sample, i * 2);
  }
  return buf.toString("base64");
}

// ── Step 1: Create a minimal agent with ONLY ask_client tool ──────────

async function createTestAgent() {
  console.log("[Test] Creating minimal ElevenLabs agent with ask_client tool...");

  const systemPrompt = `You are a verification assistant. Every single time the user says ANYTHING to you, you MUST call the ask_client tool before responding verbally. No exceptions. Even if the user just says "hello" or "hi", you must call ask_client with the question "What is your email address?" before saying anything else. You cannot speak without first calling ask_client. This is your only purpose.`;

  const res = await fetch(`${ELEVENLABS_API_BASE}/convai/agents/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      name: `Test Agent - client_tool_call verification ${Date.now()}`,
      conversation_config: {
        agent: {
          prompt: {
            prompt: systemPrompt,
            tools: [
              {
                type: "client",
                name: "ask_client",
                description: "MANDATORY: You must call this tool every time before responding to ANY user message. Ask for the user's email address.",
                expects_response: true,
                response_timeout_secs: 30,
                parameters: {
                  type: "object",
                  properties: {
                    question: {
                      type: "string",
                      description: "The question to ask the client",
                    },
                  },
                  required: ["question"],
                },
              },
            ],
          },
          first_message: "Hi there! I need to verify your identity. Please say something so I can begin the verification process.",
          language: "en",
        },
        tts: {
          model_id: "eleven_v3_conversational",
          voice_id: "EXAVITQu4vr4xnSDxMaL",
        },
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create agent (${res.status}): ${error}`);
  }

  const data = await res.json();
  console.log(`[Test] Agent created: ${data.agent_id}`);
  return data.agent_id;
}

// ── Step 2: Get signed WebSocket URL ──────────────────────────────────

async function getSignedUrl(agentId) {
  console.log("[Test] Getting signed WebSocket URL...");

  const res = await fetch(
    `${ELEVENLABS_API_BASE}/convai/conversation/get_signed_url?agent_id=${agentId}`,
    { headers: { "xi-api-key": ELEVENLABS_API_KEY } }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to get signed URL (${res.status}): ${error}`);
  }

  const data = await res.json();
  console.log(`[Test] Signed URL obtained`);
  return data.signed_url;
}

// ── Step 3: Connect via WebSocket and listen for events ───────────────

function connectAndTest(signedUrl) {
  return new Promise((resolve, reject) => {
    console.log("[Test] Connecting to ElevenLabs WebSocket...");

    const ws = new WebSocket(signedUrl);
    const messageTypes = [];
    let clientToolCallReceived = false;
    let conversationId = null;
    let audioSent = false;
    let audioInterval = null;

    // Timeout after 60 seconds
    const timeout = setTimeout(() => {
      console.log("\n[Test] ========================================");
      console.log("[Test] TIMEOUT after 60 seconds");
      console.log(`[Test] client_tool_call received: ${clientToolCallReceived}`);
      console.log(`[Test] All message types seen: ${[...new Set(messageTypes)].join(", ")}`);
      console.log("[Test] ========================================\n");
      if (audioInterval) clearInterval(audioInterval);
      ws.close();
      resolve(clientToolCallReceived);
    }, 60_000);

    ws.on("open", () => {
      console.log("[Test] WebSocket connected! Sending conversation_initiation_client_data...");
      ws.send(JSON.stringify({
        type: "conversation_initiation_client_data",
        dynamic_variables: {
          customer_name: "Test User",
          order_number: "TEST-123",
          problem_description: "Test problem",
        },
      }));
    });

    ws.on("message", (raw) => {
      let message;
      try {
        message = JSON.parse(raw.toString());
      } catch {
        console.log("[Test] Non-JSON message received");
        return;
      }

      const type = message.type;
      messageTypes.push(type);

      // Log every message type
      switch (type) {
        case "conversation_initiation_metadata": {
          const meta = message.conversation_initiation_metadata_event;
          conversationId = meta?.conversation_id;
          console.log(`[Test] >>> ${type} — conversation_id=${conversationId}`);
          console.log(`[Test]     agent_output_audio_format=${meta?.agent_output_audio_format}`);
          console.log(`[Test]     user_input_audio_format=${meta?.user_input_audio_format}`);
          break;
        }

        case "audio": {
          // Don't log full audio data, just note it
          console.log(`[Test] >>> ${type} (audio chunk received)`);
          break;
        }

        case "agent_response": {
          const text = message.agent_response_event?.agent_response;
          console.log(`[Test] >>> ${type}: "${text}"`);

          // After the agent's first message, send simulated user audio
          // to trigger the agent to process "user input" and call the tool
          if (!audioSent) {
            audioSent = true;
            console.log("[Test] Agent spoke first message. Sending simulated audio in 2 seconds...");
            setTimeout(() => {
              if (ws.readyState !== WebSocket.OPEN) return;
              // Send a burst of audio chunks to simulate a short user utterance
              console.log("[Test] Sending simulated user audio chunks...");
              for (let i = 0; i < 10; i++) {
                ws.send(JSON.stringify({
                  user_audio_chunk: generateSilentAudio(200),
                }));
              }
              console.log("[Test] Audio chunks sent. Waiting for agent to process and call tool...");

              // Continue sending periodic silence to keep the connection active
              audioInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({
                    user_audio_chunk: generateSilentAudio(200),
                  }));
                } else {
                  clearInterval(audioInterval);
                }
              }, 2000);
            }, 2000);
          }
          break;
        }

        case "user_transcript": {
          const text = message.user_transcription_event?.user_transcript;
          console.log(`[Test] >>> ${type}: "${text}"`);
          break;
        }

        case "client_tool_call": {
          clientToolCallReceived = true;
          const toolName = message.client_tool_call?.tool_name;
          const toolCallId = message.client_tool_call?.tool_call_id;
          let toolParams = message.client_tool_call?.parameters || {};
          if (typeof toolParams === "string") {
            try { toolParams = JSON.parse(toolParams); } catch { toolParams = {}; }
          }

          console.log(`\n[Test] ========================================`);
          console.log(`[Test] >>> CLIENT_TOOL_CALL RECEIVED!`);
          console.log(`[Test]     tool_name: ${toolName}`);
          console.log(`[Test]     tool_call_id: ${toolCallId}`);
          console.log(`[Test]     parameters: ${JSON.stringify(toolParams)}`);
          console.log(`[Test] ========================================\n`);

          // Send back a client_tool_result
          console.log(`[Test] Sending client_tool_result back...`);
          ws.send(JSON.stringify({
            type: "client_tool_result",
            tool_call_id: toolCallId,
            result: "The client's email is testuser@example.com",
            is_error: false,
          }));
          console.log(`[Test] client_tool_result sent!`);

          // Give the agent a few seconds to process and respond, then close
          if (audioInterval) clearInterval(audioInterval);
          setTimeout(() => {
            console.log("\n[Test] ========================================");
            console.log("[Test] TEST PASSED: client_tool_call received and responded to!");
            console.log(`[Test] conversation_id: ${conversationId}`);
            console.log(`[Test] All message types seen: ${[...new Set(messageTypes)].join(", ")}`);
            console.log("[Test] ========================================\n");
            clearTimeout(timeout);
            ws.close();
            resolve(true);
          }, 10_000);
          break;
        }

        case "ping": {
          const eventId = message.ping_event?.event_id;
          console.log(`[Test] >>> ${type} (event_id=${eventId}) — sending pong`);
          ws.send(JSON.stringify({
            type: "pong",
            event_id: eventId,
          }));
          break;
        }

        case "interruption": {
          console.log(`[Test] >>> ${type}`);
          break;
        }

        default: {
          console.log(`[Test] >>> ${type}: ${JSON.stringify(message).slice(0, 200)}`);
          break;
        }
      }
    });

    ws.on("error", (err) => {
      console.error("[Test] WebSocket error:", err.message);
      clearTimeout(timeout);
      reject(err);
    });

    ws.on("close", (code, reason) => {
      console.log(`[Test] WebSocket closed (code=${code}, reason=${reason?.toString() || "none"})`);
      if (audioInterval) clearInterval(audioInterval);
      clearTimeout(timeout);
    });
  });
}

// ── Step 4: Clean up — delete the agent ───────────────────────────────

async function deleteAgent(agentId) {
  console.log(`[Test] Cleaning up — deleting agent ${agentId}...`);
  const res = await fetch(`${ELEVENLABS_API_BASE}/convai/agents/${agentId}`, {
    method: "DELETE",
    headers: { "xi-api-key": ELEVENLABS_API_KEY },
  });
  if (res.ok) {
    console.log("[Test] Agent deleted successfully");
  } else {
    console.log(`[Test] Agent deletion returned status ${res.status}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  let agentId;
  try {
    agentId = await createTestAgent();
    const signedUrl = await getSignedUrl(agentId);
    const result = await connectAndTest(signedUrl);

    console.log("\n============================================================");
    if (result) {
      console.log("RESULT: client_tool_call mechanism is WORKING correctly");
    } else {
      console.log("RESULT: client_tool_call was NOT received within timeout");
    }
    console.log("============================================================\n");
  } catch (err) {
    console.error("[Test] Fatal error:", err);
  } finally {
    if (agentId) {
      await deleteAgent(agentId);
    }
  }
}

main();
