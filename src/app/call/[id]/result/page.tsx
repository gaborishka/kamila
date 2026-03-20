"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCallStatus } from "@/hooks/useCallStatus";
import { useTranscript } from "@/hooks/useTranscript";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ResultPage() {
  const params = useParams();
  const callId = params.id as string;
  const { call, loading } = useCallStatus(callId);
  const { messages } = useTranscript(callId, call?.status);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!call) {
    return (
      <>
        <Header />
        <main className="max-w-5xl mx-auto px-6 py-20 text-center">
          <span className="material-symbols-outlined text-outline text-6xl mb-4 block">phone_disabled</span>
          <h1 className="text-3xl font-black mb-4">Call not found</h1>
          <p className="text-on-surface-variant mb-8">This call doesn&apos;t exist or hasn&apos;t been created yet.</p>
          <Link href="/call/new" className="inline-block gradient-primary text-on-primary px-8 py-3 rounded-md font-bold">
            Start New Call
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const result = call.result;
  const isSuccess = result?.type === "success";
  const isPartial = result?.type === "partial";

  const statusConfig = {
    success: { label: "Resolution Secured", badge: "bg-secondary-container text-on-secondary-container", headlineColor: "" },
    partial: { label: "Partial Resolution", badge: "bg-tertiary-fixed text-on-tertiary-fixed-variant", headlineColor: "" },
    failed: { label: "Resolution Pending", badge: "bg-error-container text-on-error-container", headlineColor: "" },
  };

  const config = statusConfig[result?.type || "failed"];

  const callDuration = call.callStartedAt && call.callEndedAt
    ? Math.floor((call.callEndedAt - call.callStartedAt) / 1000)
    : 0;
  const durationMin = Math.floor(callDuration / 60);
  const durationSec = callDuration % 60;

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-12 relative">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl -z-10"></div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.badge} text-xs font-bold tracking-wider uppercase mb-4`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                {config.label}
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-on-background leading-none">
                {isSuccess ? "Refund approved!" : isPartial ? "Partial resolution" : "Call completed"}
              </h1>
            </div>
            {result?.amount && (
              <div className="text-right">
                <div className="text-primary text-5xl font-black tracking-tighter">
                  {result.currency || "€"}{result.amount.toFixed(2)}
                </div>
                <div className="text-on-surface-variant font-medium">Returned within 5-7 days</div>
              </div>
            )}
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-xl ghost-border flex flex-col justify-between min-h-[200px]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-on-surface-variant text-xs font-bold tracking-widest uppercase mb-1">Company</p>
                  <h3 className="text-2xl font-bold">{call.companyName}</h3>
                </div>
                <span className="material-symbols-outlined text-primary text-3xl">support_agent</span>
              </div>
              <div className="flex gap-12">
                <div>
                  <p className="text-on-surface-variant text-xs font-bold tracking-widest uppercase mb-1">Call Duration</p>
                  <p className="text-xl font-bold">{durationMin}:{durationSec.toString().padStart(2, "0")}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs font-bold tracking-widest uppercase mb-1">Status</p>
                  <p className={`text-xl font-bold ${isSuccess ? "text-secondary" : isPartial ? "text-tertiary" : "text-error"}`}>
                    {result?.type?.toUpperCase() || "COMPLETED"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-primary text-on-primary p-8 rounded-xl flex flex-col justify-between">
              <div>
                <p className="opacity-70 text-xs font-bold tracking-widest uppercase mb-1">Audio Evidence</p>
                <h3 className="text-xl font-bold mb-4">{call.audioUrl ? "Recording Saved" : "No Recording"}</h3>
              </div>
              {call.audioUrl && (
                <button className="w-full bg-surface-container-lowest text-primary py-3 rounded-md font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                  <span className="material-symbols-outlined">play_circle</span>
                  Play Recording
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 space-y-12">
            {/* Arguments Used */}
            {call.arguments && call.arguments.length > 0 && (
              <section>
                <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">gavel</span>
                  Relentless Arguments Used
                </h4>
                <div className="space-y-4">
                  {call.arguments.map((arg: { id: string; title: string; description: string }) => (
                    <div key={arg.id} className="p-5 bg-surface-container-low rounded-lg border-l-4 border-primary">
                      <p className="font-bold text-primary mb-1">{arg.title}</p>
                      <p className="text-on-surface-variant text-sm">{arg.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Transcript */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">description</span>
                  Full Transcript
                </h4>
              </div>
              <div className="bg-surface-container-lowest rounded-xl ghost-border overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto p-6 space-y-6">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${
                        msg.speaker === "kamila" ? "bg-primary" : "bg-surface-variant text-on-surface-variant"
                      }`}>
                        {msg.speaker === "kamila" ? "KAM" : "OPS"}
                      </div>
                      <div>
                        <p className={`text-xs font-bold mb-1 uppercase tracking-tighter ${
                          msg.speaker === "kamila" ? "text-primary" : "text-on-surface-variant"
                        }`}>
                          {msg.speaker === "kamila" ? "Kamila AI" : "Operator"} • {new Date(msg.timestamp).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })}
                        </p>
                        <p className="text-on-surface-variant leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-center text-on-surface-variant py-8">Transcript will appear once available.</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-8">
            {/* Share */}
            <div className="bg-surface-container-high p-8 rounded-xl">
              <h5 className="font-bold mb-4">Share your win</h5>
              <p className="text-sm text-on-surface-variant mb-6">
                &quot;Kamila saved me {result?.currency || "€"}{result?.amount || "0"} from {call.companyName}! Legal automation is here.&quot;
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 bg-white p-3 rounded-lg ghost-border font-bold text-xs hover:bg-slate-50 transition-all">
                  <span className="material-symbols-outlined text-base">share</span> Twitter
                </button>
                <button className="flex items-center justify-center gap-2 bg-white p-3 rounded-lg ghost-border font-bold text-xs hover:bg-slate-50 transition-all">
                  <span className="material-symbols-outlined text-base">content_copy</span> Copy Link
                </button>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h5 className="font-bold px-2">Next Steps</h5>
              <Link href="/history" className="group flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl ghost-border hover:bg-primary hover:text-white transition-all">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined p-2 bg-surface-container-low rounded-lg group-hover:bg-primary-container">history</span>
                  <div>
                    <p className="font-bold text-sm">View Dispute History</p>
                    <p className="text-xs opacity-70">Track all active claims</p>
                  </div>
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </Link>
              <Link href="/call/new" className="group flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl ghost-border hover:bg-primary hover:text-white transition-all">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined p-2 bg-surface-container-low rounded-lg group-hover:bg-primary-container">add</span>
                  <div>
                    <p className="font-bold text-sm">Start New Call</p>
                    <p className="text-xs opacity-70">Fight another dispute</p>
                  </div>
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>

            {/* Escalation (for failed/partial) */}
            {!isSuccess && (
              <div className="p-6 bg-error-container/30 rounded-xl border border-error/10">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-error">warning</span>
                  <div>
                    <p className="font-bold text-error mb-1">Didn&apos;t get the full amount?</p>
                    <p className="text-xs text-on-error-container leading-relaxed mb-4">
                      You can escalate via the National Enforcement Body (NEB) or try calling again with additional arguments.
                    </p>
                    <Link
                      href="/call/new"
                      className="inline-block bg-error text-on-error px-4 py-2 rounded-md text-xs font-bold hover:opacity-90 transition-all"
                    >
                      Try Again
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
