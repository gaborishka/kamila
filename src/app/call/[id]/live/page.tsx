"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCallStatus } from "@/hooks/useCallStatus";
import { useTranscript } from "@/hooks/useTranscript";
import { useClientQuestions } from "@/hooks/useClientQuestions";
import { useAudioStream } from "@/hooks/useAudioStream";
import Footer from "@/components/Footer";

export default function LiveCallPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params.id as string;
  const { call } = useCallStatus(callId);
  const { messages } = useTranscript(callId, call?.status);
  const { questions, answerQuestion } = useClientQuestions(callId, call?.status);
  const { isPlaying, needsGesture, startAudio, volume, setVolume } = useAudioStream(callId, call?.status);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (call?.callStartedAt) {
        setCallDuration(Math.floor((Date.now() - call.callStartedAt) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [call?.callStartedAt]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages]);

  // Redirect when call ends (but wait if there are pending questions)
  useEffect(() => {
    if (call?.status === "completed") {
      if (questions.length > 0) {
        // Give user time to answer pending questions before redirecting
        const timeout = setTimeout(() => {
          router.push(`/call/${callId}/result`);
        }, 30000); // 30s grace period
        return () => clearTimeout(timeout);
      }
      router.push(`/call/${callId}/result`);
    }
  }, [call?.status, callId, router, questions.length]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const args = call?.arguments || [];
  const strategy = call?.strategy || "Analyzing the situation and preparing optimal negotiation strategy...";

  return (
    <>
      {/* Header with live indicator */}
      <header className="bg-slate-50/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200/20">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black tracking-tighter text-blue-900">Kamila</span>
            <nav className="hidden md:flex gap-6">
              <a className="text-slate-500 hover:text-blue-600 transition-all duration-200" href="/history">History</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-surface-container rounded-lg border border-outline-variant/15">
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Speaking</span>
              <span className="text-sm font-mono font-bold text-primary">{formatTime(callDuration)}</span>
            </div>
            <button
              onClick={async () => {
                try {
                  await fetch(`/api/calls/${callId}/end`, { method: "POST" });
                } catch (e) {
                  console.error("Failed to end call:", e);
                }
                router.push(`/call/${callId}/result`);
              }}
              aria-label="End call"
              className="bg-error text-on-error px-5 py-2 rounded-md font-bold text-sm transition-transform active:scale-[0.98] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">call_end</span>
              End Call
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 px-6 py-8 h-[calc(100vh-80px)] overflow-hidden">
        {/* Left: Transcript */}
        <div className="md:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
          {/* Audio player */}
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/10 flex items-center gap-6">
            {needsGesture ? (
              <button
                onClick={startAudio}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-md font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-sm">volume_up</span>
                Enable Audio
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined ${isPlaying ? "text-secondary" : "text-outline"}`}>
                  {isPlaying ? "hearing" : "hearing_disabled"}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  {isPlaying ? "Live Audio" : "Connecting..."}
                </span>
              </div>
            )}
            <div className="flex-grow flex items-center gap-1 h-8">
              {mounted && isPlaying && [3, 5, 8, 4, 6, 3, 5, 2, 6, 8, 5, 3, 4, 6, 8, 4, 5, 3].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${h * 3 + 8}px`,
                    opacity: 0.2 + (h / 10),
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 pr-2">
              <span className="material-symbols-outlined text-outline text-sm">
                {volume === 0 ? "volume_off" : volume < 0.5 ? "volume_down" : "volume_up"}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1 accent-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Kamila needs info from you */}
          {questions.length > 0 && (
            <div className="flex flex-col gap-3 animate-in slide-in-from-top">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-tertiary-container/30 border-2 border-tertiary rounded-xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-tertiary">
                      Kamila needs your help
                    </span>
                  </div>
                  <p className="text-sm font-medium text-on-surface">{q.question}</p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const answer = answerInputs[q.id]?.trim();
                      if (answer) {
                        answerQuestion(q.id, answer);
                        setAnswerInputs((prev) => {
                          const next = { ...prev };
                          delete next[q.id];
                          return next;
                        });
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={answerInputs[q.id] || ""}
                      onChange={(e) =>
                        setAnswerInputs((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="Type your answer..."
                      className="flex-grow px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-tertiary"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-tertiary text-on-tertiary px-4 py-2 rounded-lg text-sm font-bold transition-transform active:scale-[0.97] flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                      Send
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}

          {/* Transcript */}
          <div ref={transcriptRef} className="flex-grow bg-surface-container-low rounded-xl p-8 overflow-y-auto no-scrollbar flex flex-col gap-8 relative">
            <div className="flex justify-center">
              <span className="text-[10px] font-bold tracking-widest text-outline-variant uppercase">
                {mounted ? `Today • ${new Date().toLocaleTimeString()}` : ""}
              </span>
            </div>

            {messages.length === 0 && (
              <div className="text-center text-on-surface-variant py-12">
                <span className="material-symbols-outlined text-4xl mb-4 block">phone_in_talk</span>
                <p>Waiting for connection...</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 max-w-[85%] ${msg.speaker === "kamila" ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.speaker === "kamila" ? "bg-primary" : "bg-outline-variant"}`}>
                  <span className="material-symbols-outlined text-sm text-white">
                    {msg.speaker === "kamila" ? "auto_awesome" : "support_agent"}
                  </span>
                </div>
                <div className={`flex flex-col gap-2 ${msg.speaker === "kamila" ? "items-end" : ""}`}>
                  <span className={`text-[11px] font-bold uppercase tracking-wide ${msg.speaker === "kamila" ? "text-primary" : "text-on-surface-variant"}`}>
                    {msg.speaker === "kamila" ? "Kamila AI" : `Operator${call?.companyName ? ` (${call.companyName})` : ""}`}
                  </span>
                  <div className={`p-4 rounded-lg ${msg.speaker === "kamila" ? "bg-primary-container rounded-tr-none shadow-sm" : "bg-surface-container-highest rounded-tl-none"}`}>
                    <p className="text-sm leading-relaxed text-on-surface">
                      {msg.citedTos
                        ? msg.text.split(/(Section \d+\.\d+|Terms of Service|refund policy|consumer rights?)/gi).map((part: string, i: number) =>
                            i % 2 === 1
                              ? <span key={i} className="bg-primary/20 border-b border-primary font-bold px-1">{part}</span>
                              : <span key={i}>{part}</span>
                          )
                        : msg.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {call?.status === "live" && (
              <div className="flex gap-4 max-w-[85%] ml-auto flex-row-reverse opacity-70">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-white">more_horiz</span>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="bg-primary-container/40 p-4 rounded-lg rounded-tr-none flex gap-1">
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "-0.15s" }}></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "-0.3s" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div className="sticky bottom-0 flex justify-center pb-2">
              <div className="bg-surface-container-highest/80 backdrop-blur-sm px-3 py-1 rounded-full border border-outline-variant/20 flex items-center gap-2">
                <span className="text-[10px] font-bold text-primary uppercase">Live Transcript Sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Arsenal */}
        <aside className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight text-on-surface">Kamila&apos;s Arsenal</h2>
              <span className="bg-tertiary-container text-on-tertiary text-[10px] font-bold px-2 py-0.5 rounded uppercase">Active Analysis</span>
            </div>

            <div className="space-y-4">
              {args.map((arg: { id: string; title: string; description: string; source: string; used: boolean }) => (
                <div
                  key={arg.id}
                  className={`p-4 rounded-lg bg-surface-container-lowest relative overflow-hidden group ${
                    arg.used ? "border-l-4 border-secondary shadow-sm" : "border-l-4 border-outline-variant/30 hover:border-primary transition-colors cursor-help"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`material-symbols-outlined text-xl ${arg.used ? "text-secondary" : "text-outline"}`}
                      style={arg.used ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {arg.used ? "check_circle" : arg.source === "tos" ? "description" : arg.source === "reddit" ? "forum" : "gavel"}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-on-surface">{arg.title}</h3>
                      <p className="text-xs text-on-surface-variant mt-1">{arg.description}</p>
                    </div>
                  </div>
                  {arg.used && <div className="absolute right-0 top-0 h-full w-1 bg-secondary/10 group-hover:w-2 transition-all"></div>}
                </div>
              ))}

              {args.length === 0 && (
                <div className="text-center text-on-surface-variant py-4">
                  <p className="text-sm">Arguments loading...</p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-outline-variant/10">
              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-sm">psychology</span>
                  <span className="text-[11px] font-bold text-primary uppercase">Kamila&apos;s Strategy</span>
                </div>
                <p className="text-xs leading-relaxed text-on-surface-variant italic">
                  &quot;{strategy}&quot;
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <Footer />
    </>
  );
}
