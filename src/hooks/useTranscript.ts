"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { TranscriptMessage } from "@/types/call";

export function useTranscript(callId: string, callStatus?: string) {
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const statusRef = useRef(callStatus);
  statusRef.current = callStatus;

  const fetchTranscript = useCallback(async () => {
    if (!callId) return;
    try {
      const res = await fetch(`/api/calls/${callId}/transcript`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
    } finally {
      setLoading(false);
    }
  }, [callId]);

  useEffect(() => {
    if (!callId) {
      setLoading(false);
      return;
    }

    fetchTranscript();

    // Only poll while call is active
    if (statusRef.current === "completed") return;

    const interval = setInterval(() => {
      if (statusRef.current === "completed") return;
      fetchTranscript();
    }, 2000);

    return () => clearInterval(interval);
  }, [callId, fetchTranscript, callStatus]);

  return { messages, loading };
}
