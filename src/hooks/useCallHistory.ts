"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Call } from "@/types/call";

export function useCallHistory() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "calls"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Call[];
        setCalls(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to calls:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { calls, loading };
}
