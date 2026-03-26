"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCallStatus } from "@/hooks/useCallStatus";
import Footer from "@/components/Footer";

interface MissingQuestion {
  id: string;
  label: string;
  placeholder: string;
  reason: string;
}

const FIRECRAWL_STEPS = new Set(["tos", "reddit", "legal"]);

function FirecrawlBadge() {
  return (
    <span className="inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded bg-orange-50 text-orange-600">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8l5-8v4h3l-5 8z" fill="currentColor"/>
      </svg>
      <span className="text-[9px] font-bold tracking-wide uppercase">Firecrawl</span>
    </span>
  );
}

export default function PreparingPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params.id as string;
  const { call, loading } = useCallStatus(callId);
  const prepStarted = useRef(false);
  const [prepError, setPrepError] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittingInfo, setSubmittingInfo] = useState(false);
  const dialStarted = useRef(false);

  const needsInfo = call?.status === "needs_info";
  const missingQuestions: MissingQuestion[] =
    call?.missingInfo && !call.missingInfo.sufficient
      ? call.missingInfo.questions
      : [];

  // Trigger preparation pipeline
  useEffect(() => {
    if (!callId || prepStarted.current) return;
    prepStarted.current = true;

    async function startPreparation() {
      try {
        const prepRes = await fetch(`/api/calls/${callId}/prepare`, { method: "POST" });
        if (!prepRes.ok) {
          setPrepError("Failed to prepare case. Please try again.");
          return;
        }
        const prepData = await prepRes.json();

        // If Gemini says we have enough info, dial immediately
        if (prepData.sufficient !== false) {
          const dialRes = await fetch(`/api/calls/${callId}/dial`, { method: "POST" });
          if (!dialRes.ok) {
            setPrepError("Failed to initiate call. Please try again.");
          }
        }
        // If not sufficient, the polling will pick up "needs_info" status and show the form
      } catch (error) {
        console.error("Preparation failed:", error);
        setPrepError("Something went wrong. Please try again.");
      }
    }

    startPreparation();
  }, [callId]);

  // Auto-redirect when call goes live
  useEffect(() => {
    if (call?.status === "live") {
      router.push(`/call/${callId}/live`);
    }
    if (call?.status === "completed") {
      router.push(`/call/${callId}/result`);
    }
  }, [call?.status, callId, router]);

  // After user submits info and status goes back to "preparing", trigger dial
  useEffect(() => {
    if (call?.status === "preparing" && call?.additionalInfo && !dialStarted.current && prepStarted.current) {
      dialStarted.current = true;

      async function doDial() {
        try {
          const dialRes = await fetch(`/api/calls/${callId}/dial`, { method: "POST" });
          if (!dialRes.ok) {
            setPrepError("Failed to initiate call. Please try again.");
          }
        } catch (error) {
          console.error("Dial failed:", error);
          setPrepError("Something went wrong. Please try again.");
        }
      }

      doDial();
    }
  }, [call?.status, call?.additionalInfo, callId]);

  async function handleInfoSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmittingInfo(true);
    setPrepError("");

    try {
      const res = await fetch(`/api/calls/${callId}/info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) {
        setPrepError("Failed to submit details. Please try again.");
      }
    } catch (error) {
      console.error("Info submit failed:", error);
      setPrepError("Something went wrong. Please try again.");
    } finally {
      setSubmittingInfo(false);
    }
  }

  const prepSteps = call?.prepSteps || [
    { id: "tos", label: "Reading their Terms of Service...", status: "pending", snippet: null },
    { id: "reddit", label: "Searching for refund strategies...", status: "pending", snippet: null },
    { id: "legal", label: "Finding legal requirements...", status: "pending", snippet: null },
    { id: "building", label: "Building your case...", status: "pending", snippet: null },
    { id: "review", label: "Reviewing your case...", status: "pending", snippet: null },
    { id: "dialing", label: "Dialing...", status: "pending", snippet: null },
  ];

  const completedSteps = prepSteps.filter((s: { status: string }) => s.status === "complete").length;
  const progress = (completedSteps / prepSteps.length) * 100;

  return (
    <>
      <header className="bg-slate-50/80 backdrop-blur-md border-b border-slate-200/20 shadow-sm fixed top-0 w-full z-50">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <span className="text-2xl font-black tracking-tighter text-blue-900">Kamila</span>
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full">
            <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Secure Session</span>
          </div>
        </div>
      </header>

      <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <div className="max-w-3xl w-full">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-primary-container shadow-xl mb-8 relative">
              <span className="material-symbols-outlined text-on-primary text-4xl">
                {needsInfo ? "help" : "cognition"}
              </span>
              <div className="absolute inset-0 rounded-xl border-2 border-primary/30 step-pulse"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4">
              {needsInfo ? "Almost ready" : "Preparing your case"}
            </h1>
            <p className="text-on-surface-variant text-lg">
              {needsInfo
                ? "Kamila needs a few more details to build the strongest case."
                : "Kamila is analyzing legal precedents and company policies."}
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
            {/* Left: Steps + Missing Info Form */}
            <div className="md:col-span-7 space-y-4">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(19,27,46,0.04)] border border-outline-variant/15">
                <h2 className="text-[10px] uppercase tracking-[0.1em] font-bold text-outline mb-6">
                  Relentless Strategy Engine
                </h2>
                <div className="space-y-6">
                  {prepSteps.map((step: { id: string; label: string; status: string; snippet?: string | null }) => (
                    <div key={step.id} className={`flex items-start gap-4 ${step.status === "pending" ? "opacity-40" : ""}`}>
                      <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{
                        backgroundColor:
                          step.status === "complete" ? "#006c49" :
                          step.status === "active" ? "#0056d2" : "#c3c6d6",
                      }}>
                        {step.status === "complete" ? (
                          <span className="material-symbols-outlined text-[14px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        ) : step.status === "active" ? (
                          <div className="w-2 h-2 rounded-full bg-white step-pulse"></div>
                        ) : null}
                      </div>
                      <div>
                        <p className={`text-sm flex items-center flex-wrap ${step.status === "active" ? "font-bold text-primary" : "font-semibold text-on-surface"}`}>
                          {step.label}
                          {FIRECRAWL_STEPS.has(step.id) && step.status !== "pending" && <FirecrawlBadge />}
                        </p>
                        {step.snippet && step.status === "complete" && (
                          <div className="mt-2 p-3 bg-surface-container-low rounded-lg border-l-4 border-secondary">
                            <p className="text-xs font-mono text-secondary leading-relaxed">{step.snippet}</p>
                          </div>
                        )}
                        {step.status === "active" && (
                          <div className="flex gap-1 mt-2">
                            <div className="h-1 w-8 bg-primary rounded-full"></div>
                            <div className="h-1 w-8 bg-surface-variant rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-1/2 animate-pulse"></div>
                            </div>
                            <div className="h-1 w-8 bg-surface-variant rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Info Form */}
              {needsInfo && missingQuestions.length > 0 && (
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(19,27,46,0.04)] border border-outline-variant/15 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-tertiary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-tertiary-container text-lg">edit_note</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-on-surface">Additional Details Needed</h3>
                      <p className="text-xs text-on-surface-variant">This will strengthen your case significantly</p>
                    </div>
                  </div>

                  <form onSubmit={handleInfoSubmit} className="space-y-5">
                    {missingQuestions.map((q) => (
                      <div key={q.id} className="space-y-2">
                        <label htmlFor={q.id} className="text-xs font-bold tracking-wide uppercase text-on-surface-variant">
                          {q.label}
                        </label>
                        <input
                          id={q.id}
                          type="text"
                          value={answers[q.id] || ""}
                          onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                          className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-md p-3 text-sm transition-all"
                          placeholder={q.placeholder}
                          required
                        />
                        <p className="text-xs text-on-surface-variant/70 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">info</span>
                          {q.reason}
                        </p>
                      </div>
                    ))}

                    <button
                      type="submit"
                      disabled={submittingInfo}
                      className="w-full py-4 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submittingInfo ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                          Updating case...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-lg">arrow_forward</span>
                          Continue to call
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Right: Metadata */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-primary text-on-primary p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-on-primary/60 mb-2">
                    {needsInfo ? "Status" : "Estimated Prep Time"}
                  </h3>
                  <div className="text-4xl font-black mb-4">
                    {needsInfo ? "Paused" : "20s"}
                  </div>
                  <div className="w-full bg-on-primary/20 h-2 rounded-full mb-2">
                    <div className="bg-secondary-fixed h-full rounded-full shadow-[0_0_8px_rgba(111,251,190,0.5)] transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-xs text-on-primary/80">
                    {needsInfo
                      ? "Fill in the details below so Kamila can build the strongest case."
                      : "Kamila is optimizing for the shortest hold time."}
                  </p>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-container rounded-full blur-3xl opacity-50"></div>
              </div>

              <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/15">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary">database</span>
                    <span className="text-xs font-bold uppercase tracking-tight text-on-surface">Data Intelligence</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-orange-50/80 rounded-lg">
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0 shadow-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8l5-8v4h3l-5 8z" fill="white"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-orange-900">Firecrawl</p>
                      <p className="text-[10px] text-orange-700/80">Terms of Service, Reddit, Legal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg">
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">Gemini AI</p>
                      <p className="text-[10px] text-on-surface-variant">Case validation & analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg">
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shrink-0 shadow-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="white"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">ElevenLabs</p>
                      <p className="text-[10px] text-on-surface-variant">Voice agent & live call</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(0,108,73,0.4)]"></div>
                  <span className="text-xs font-semibold text-on-surface">Secure AI Link</span>
                </div>
                <span className="text-[10px] font-mono text-outline">ENCRYPTED:AES-256</span>
              </div>
            </div>
          </div>

          <div className="text-center text-outline text-xs max-w-md mx-auto">
            <p>
              {needsInfo
                ? "Your data is encrypted and only used for this call session."
                : "Do not close this window. Kamila will notify you the moment the representative joins the call."}
            </p>
          </div>
          {prepError && (
            <div className="mt-8 text-center">
              <p className="text-error font-bold mb-4">{prepError}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-block bg-primary text-on-primary px-6 py-3 rounded-md font-bold"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
