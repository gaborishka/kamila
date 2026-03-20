"use client";

import { useState, useEffect } from "react";
import type { Call } from "@/types/call";

export function useCallHistory() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calls")
      .then((res) => res.json())
      .then((data) => {
        setCalls(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching calls:", error);
        setLoading(false);
      });
  }, []);

  return { calls, loading };
}
