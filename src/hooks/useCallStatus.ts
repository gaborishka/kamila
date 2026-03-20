"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Call } from "@/types/call";

export function useCallStatus(callId: string) {
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!callId || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "calls", callId),
      (snapshot) => {
        if (snapshot.exists()) {
          setCall({ id: snapshot.id, ...snapshot.data() } as Call);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to call:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [callId]);

  return { call, loading };
}
