"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Call } from "@/types/call";

export function useCallStatus(callId: string) {
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const statusRef = useRef<string | undefined>(undefined);

  const fetchCall = useCallback(async () => {
    if (!callId) return;
    try {
      const res = await fetch(`/api/calls/${callId}`);
      if (res.ok) {
        const data = await res.json();
        setCall(data);
        statusRef.current = data.status;
      }
    } catch (error) {
      console.error("Error fetching call:", error);
    } finally {
      setLoading(false);
    }
  }, [callId]);

  useEffect(() => {
    if (!callId) {
      setLoading(false);
      return;
    }

    fetchCall();

    const interval = setInterval(() => {
      if (statusRef.current === "completed") return;
      fetchCall();
    }, 2000);

    return () => clearInterval(interval);
  }, [callId, fetchCall]);

  return { call, loading };
}
