"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { TranscriptMessage } from "@/types/call";

export function useTranscript(callId: string) {
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!callId || !db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "calls", callId, "transcript"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as TranscriptMessage[];
        setMessages(msgs);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to transcript:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [callId]);

  return { messages, loading };
}
