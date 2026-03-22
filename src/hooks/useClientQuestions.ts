"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ClientQuestion } from "@/types/call";

export function useClientQuestions(callId: string, callStatus?: string) {
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const statusRef = useRef(callStatus);
  statusRef.current = callStatus;

  const fetchQuestions = useCallback(async () => {
    if (!callId) return;
    try {
      const res = await fetch(`/api/calls/${callId}/questions`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }, [callId]);

  const answerQuestion = useCallback(
    async (questionId: string, answer: string) => {
      try {
        const res = await fetch(`/api/calls/${callId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, answer }),
        });
        if (res.ok) {
          // Remove from list immediately
          setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        }
      } catch (error) {
        console.error("Error answering question:", error);
      }
    },
    [callId]
  );

  useEffect(() => {
    if (!callId) return;

    fetchQuestions();

    if (statusRef.current === "completed") return;

    const interval = setInterval(() => {
      if (statusRef.current === "completed") return;
      fetchQuestions();
    }, 1000);

    return () => clearInterval(interval);
  }, [callId, fetchQuestions, callStatus]);

  return { questions, answerQuestion };
}
