import { createServer } from "http";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

// Shared state: dial route stores call config, WebSocket handler reads it
globalThis.__pendingCalls = globalThis.__pendingCalls || new Map();
const audioListeners = new Map();

// Cleanup stale pending calls (TTL 60s)
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of globalThis.__pendingCalls) {
    if (now - entry.createdAt > 60_000) {
      globalThis.__pendingCalls.delete(id);
    }
  }
}, 30_000);

// ── Audio format conversion (mulaw 8kHz → PCM 16kHz) ──────────────────

/** Decode an 8-bit µ-law sample to 16-bit linear PCM (ITU-T G.711) */
function mulawToLinear(byte) {
  byte = ~byte & 0xff;
  const sign = byte & 0x80;
  const exponent = (byte >> 4) & 0x07;
  const mantissa = byte & 0x0f;
  let sample = ((mantissa << 1) + 33) << exponent;
  sample -= 33;
  return sign ? -sample : sample;
}

/** Convert mulaw 8-bit 8kHz (base64) → PCM 16-bit 16kHz (base64) */
function mulaw8kToPcm16k(b64) {
  const mulawBuf = Buffer.from(b64, "base64");
  // Upsample 8k→16k = duplicate each sample. Output is 16-bit LE.
  const out = Buffer.alloc(mulawBuf.length * 4);
  for (let i = 0; i < mulawBuf.length; i++) {
    const sample = mulawToLinear(mulawBuf[i]);
    out.writeInt16LE(sample, i * 4);
    out.writeInt16LE(sample, i * 4 + 2);
  }
  return out.toString("base64");
}

// ── App setup ──────────────────────────────────────────────────────────

await app.prepare();

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${hostname}:${port}`);
  await handle(req, res, url);
});

const mediaWss = new WebSocketServer({ noServer: true });
const audioWss = new WebSocketServer({ noServer: true });

// Remove any upgrade listeners Next.js registered during prepare(),
// then register our handler as the sole listener
const nextUpgradeHandler =
  typeof app.getUpgradeHandler === "function"
    ? app.getUpgradeHandler()
    : null;

server.removeAllListeners("upgrade");

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url, `http://${hostname}:${port}`);
  if (url.pathname === "/media-stream") {
    mediaWss.handleUpgrade(req, socket, head, (ws) => mediaWss.emit("connection", ws));
  } else if (url.pathname === "/audio-listen") {
    audioWss.handleUpgrade(req, socket, head, (ws) => {
      ws._callId = url.searchParams.get("callId");
      audioWss.emit("connection", ws);
    });
  } else if (nextUpgradeHandler) {
    nextUpgradeHandler(req, socket, head);
  }
});

// ── Browser audio listeners ────────────────────────────────────────────
audioWss.on("connection", (ws) => {
  const callId = ws._callId;
  if (!callId) { ws.close(); return; }
  if (!audioListeners.has(callId)) audioListeners.set(callId, new Set());
  audioListeners.get(callId).add(ws);
  ws.on("close", () => {
    audioListeners.get(callId)?.delete(ws);
    if (audioListeners.get(callId)?.size === 0) audioListeners.delete(callId);
  });
});

function broadcastAudio(callId, source, payload) {
  const listeners = audioListeners.get(callId);
  if (!listeners || listeners.size === 0) return;
  const msg = JSON.stringify({ source, audio: payload });
  for (const ws of listeners) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

function isCitingTos(text) {
  const lower = text.toLowerCase();
  return lower.includes("terms of service") || lower.includes("section") || lower.includes("policy");
}

// ── Twilio ↔ ElevenLabs bridge ─────────────────────────────────────────
mediaWss.on("connection", (twilioWs) => {
  console.log("[Bridge] Twilio connected");

  let streamSid = null;
  let callId = null;
  let elevenLabsWs = null;

  twilioWs.on("error", (e) => console.error("[Bridge] Twilio WS error:", e));

  twilioWs.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    switch (msg.event) {
      case "start": {
        streamSid = msg.start.streamSid;
        callId = msg.start.customParameters?.callId;
        console.log(`[Bridge] Stream started — callId=${callId}`);

        const pending = globalThis.__pendingCalls.get(callId);
        if (!pending) {
          console.error("[Bridge] No pending call config for", callId);
          return;
        }
        globalThis.__pendingCalls.delete(callId);

        elevenLabsWs = new WebSocket(pending.signedUrl);

        elevenLabsWs.on("open", () => {
          console.log("[Bridge] Connected to ElevenLabs");
          elevenLabsWs.send(JSON.stringify({
            type: "conversation_initiation_client_data",
            dynamic_variables: pending.dynamicVariables,
          }));
        });

        elevenLabsWs.on("message", (elRaw) => {
          let message;
          try { message = JSON.parse(elRaw.toString()); } catch { return; }

          switch (message.type) {
            case "conversation_initiation_metadata": {
              const meta = message.conversation_initiation_metadata_event;
              const convId = meta?.conversation_id;
              console.log(`[Bridge] conversation_id=${convId} output=${meta?.agent_output_audio_format} input=${meta?.user_input_audio_format}`);
              if (convId && callId) {
                prisma.call.update({
                  where: { id: callId },
                  data: { conversationId: convId },
                }).catch(console.error);
              }
              break;
            }

            case "audio": {
              const payload = message.audio?.chunk || message.audio_event?.audio_base_64;
              if (!payload || !streamSid) break;
              twilioWs.send(JSON.stringify({
                event: "media",
                streamSid,
                media: { payload },
              }));
              broadcastAudio(callId, "agent", payload);
              break;
            }

            case "agent_response": {
              const text = message.agent_response_event?.agent_response;
              if (text && callId) {
                console.log(`[Bridge] Kamila: ${text.slice(0, 80)}...`);
                prisma.transcriptMessage.create({
                  data: { callId, speaker: "kamila", text, timestamp: Date.now(), citedTos: isCitingTos(text) },
                }).catch(console.error);
              }
              break;
            }

            case "user_transcript": {
              const text = message.user_transcription_event?.user_transcript;
              if (text && callId) {
                console.log(`[Bridge] Operator: ${text.slice(0, 80)}...`);
                prisma.transcriptMessage.create({
                  data: { callId, speaker: "operator", text, timestamp: Date.now(), citedTos: false },
                }).catch(console.error);
              }
              break;
            }

            case "interruption": {
              if (streamSid) {
                twilioWs.send(JSON.stringify({ event: "clear", streamSid }));
              }
              break;
            }

            case "ping": {
              if (message.ping_event?.event_id) {
                elevenLabsWs.send(JSON.stringify({
                  type: "pong",
                  event_id: message.ping_event.event_id,
                }));
              }
              break;
            }
          }
        });

        elevenLabsWs.on("error", (e) => console.error("[Bridge] ElevenLabs WS error:", e));
        elevenLabsWs.on("close", () => console.log("[Bridge] ElevenLabs disconnected"));
        break;
      }

      case "media": {
        if (elevenLabsWs?.readyState === WebSocket.OPEN) {
          // ElevenLabs expects PCM 16kHz input — convert from Twilio mulaw 8kHz
          elevenLabsWs.send(JSON.stringify({
            user_audio_chunk: mulaw8kToPcm16k(msg.media.payload),
          }));
        }
        if (callId) broadcastAudio(callId, "operator", msg.media.payload);
        break;
      }

      case "stop": {
        console.log("[Bridge] Twilio stream stopped");
        if (elevenLabsWs?.readyState === WebSocket.OPEN) elevenLabsWs.close();
        break;
      }
    }
  });

  twilioWs.on("close", () => {
    console.log("[Bridge] Twilio disconnected");
    if (elevenLabsWs?.readyState === WebSocket.OPEN) elevenLabsWs.close();
  });
});

// ── Start ──────────────────────────────────────────────────────────────
server.listen(port, hostname, () => {
  console.log(`> Ready on http://${hostname}:${port}`);
});
