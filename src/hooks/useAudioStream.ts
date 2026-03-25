"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// µ-law decoding (ITU-T G.711)
function decodeMulaw(mulawByte: number): number {
  mulawByte = ~mulawByte & 0xff;
  const sign = mulawByte & 0x80;
  const exponent = (mulawByte >> 4) & 0x07;
  const mantissa = mulawByte & 0x0f;
  let sample = ((mantissa << 1) + 33) << exponent;
  sample -= 33;
  return sign ? -sample : sample;
}

/** Decode a base64 µ-law buffer into Float32 PCM samples */
function mulawToFloat32(base64: string): Float32Array {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const samples = new Float32Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    samples[i] = decodeMulaw(bytes[i]) / 32768;
  }
  return samples;
}

export function useAudioStream(callId: string, callStatus?: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const nextTimeAgent = useRef(0);
  const nextTimeOperator = useRef(0);

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume;
    }
  }, [volume]);

  // Start or resume audio — can be called from user gesture
  const startAudio = useCallback(() => {
    const ctx = ctxRef.current;
    if (ctx && ctx.state === "suspended") {
      ctx.resume().then(() => {
        setNeedsGesture(false);
        setIsPlaying(true);
      });
    }
  }, []);

  useEffect(() => {
    if (!callId || callStatus !== "live") return;

    const audioCtx = new AudioContext({ sampleRate: 8000 });
    const gain = audioCtx.createGain();
    gain.gain.value = volume;
    gain.connect(audioCtx.destination);
    ctxRef.current = audioCtx;
    gainRef.current = gain;
    nextTimeAgent.current = 0;
    nextTimeOperator.current = 0;

    // Check if browser blocked autoplay
    if (audioCtx.state === "suspended") {
      setNeedsGesture(true);
    } else {
      setIsPlaying(true);
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/audio-listen?callId=${callId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (audioCtx.state === "running") setIsPlaying(true);
    };

    ws.onmessage = (event) => {
      if (!ctxRef.current || ctxRef.current.state === "closed") return;

      let data: { source: string; audio: string };
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      const samples = mulawToFloat32(data.audio);
      if (samples.length === 0) return;

      const buffer = ctxRef.current.createBuffer(1, samples.length, 8000);
      buffer.getChannelData(0).set(samples);

      const source = ctxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(gainRef.current!);

      const now = ctxRef.current.currentTime;
      const timeRef = data.source === "agent" ? nextTimeAgent : nextTimeOperator;
      if (timeRef.current < now) {
        timeRef.current = now;
      }
      source.start(timeRef.current);
      timeRef.current += buffer.duration;
    };

    ws.onclose = () => setIsPlaying(false);
    ws.onerror = () => setIsPlaying(false);

    return () => {
      ws.close();
      audioCtx.close();
      setIsPlaying(false);
      setNeedsGesture(false);
    };
  }, [callId, callStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  return { isPlaying, needsGesture, startAudio, volume, setVolume };
}
