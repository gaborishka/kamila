"use client";

import Link from "next/link";
import { useCallHistory } from "@/hooks/useCallHistory";
import type { Call } from "@/types/call";

export default function HistoryPage() {
  const { calls, loading } = useCallHistory();

  const totalCalls = calls.length;
  const successCalls = calls.filter((c: Call) => c.result?.type === "success").length;
  const totalRecovered = calls.reduce(
    (sum: number, c: Call) => sum + (c.result?.amount || 0),
    0
  );

  const statusBadge = (type?: string) => {
    switch (type) {
      case "success":
        return "bg-secondary-container text-on-secondary-container";
      case "partial":
        return "bg-tertiary-fixed text-on-tertiary-fixed-variant";
      default:
        return "bg-error-container text-on-error-container";
    }
  };

  return (
    <div className="bg-slate-50 font-body text-on-background min-h-screen">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-slate-50 z-40 border-r border-slate-200/15">
        <div className="px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
            </div>
            <div>
              <h1 className="text-blue-800 font-black text-lg">Kamila AI</h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">The Relentless Advocate</p>
            </div>
          </div>
          <nav className="space-y-1">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="text-xs uppercase tracking-widest font-semibold">Dashboard</span>
            </Link>
            <Link href="/history" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 border-r-4 border-blue-700 rounded-l-lg">
              <span className="material-symbols-outlined">history</span>
              <span className="text-xs uppercase tracking-widest font-semibold">Call History</span>
            </Link>
          </nav>
          <div className="mt-10">
            <Link href="/call/new" className="w-full gradient-primary text-on-primary py-3 rounded-md font-bold shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span>
              Start New Call
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/15 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-xl font-bold tracking-tight text-slate-900">Kamila AI</span>
          <Link href="/call/new" className="gradient-primary text-white px-4 py-2 rounded-md text-sm font-bold">
            New Call
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="md:ml-64 pt-20 md:pt-0 min-h-screen pb-24 md:pb-12">
        <div className="px-6 md:px-12 py-10">
          <header className="mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-on-surface text-editorial mb-2">History</h2>
            <p className="text-on-surface-variant font-medium">Review your relentless advocacy outcomes.</p>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-surface-container-low p-8 rounded-xl shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Total Calls</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-on-surface">{totalCalls}</span>
                <span className="text-blue-600 font-bold mb-1">calls made</span>
              </div>
            </div>
            <div className="bg-surface-container-low p-8 rounded-xl shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Success Rate</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-secondary">{successCalls}</span>
                <span className="text-secondary font-bold mb-1">successful</span>
              </div>
            </div>
            <div className="gradient-primary p-8 rounded-xl shadow-lg">
              <p className="text-xs font-bold uppercase tracking-widest text-on-primary-container mb-4 opacity-80">Total Recovered</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-on-primary">€{totalRecovered}</span>
                <span className="text-on-primary font-bold mb-1 opacity-90">to date</span>
              </div>
            </div>
          </div>

          {/* Call List */}
          {loading ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
            </div>
          ) : calls.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-outline text-6xl mb-4 block">phone_disabled</span>
              <h3 className="text-xl font-bold mb-2">No calls yet</h3>
              <p className="text-on-surface-variant mb-6">Start your first call and let Kamila fight for you.</p>
              <Link href="/call/new" className="inline-block gradient-primary text-on-primary px-8 py-3 rounded-md font-bold">
                Start New Call
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {calls.map((call: Call) => (
                <article key={call.id} className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(19,27,46,0.04)] ghost-border hover:translate-y-[-2px] transition-transform duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-2xl">business</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-on-surface">{call.companyName}</h3>
                          <span className={`px-3 py-1 ${statusBadge(call.result?.type)} text-[10px] font-bold uppercase tracking-wider rounded-full`}>
                            {call.result?.type?.toUpperCase() || "PENDING"}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant">
                          {new Date(call.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                        <p className="text-on-surface font-medium mt-2 italic">&quot;{call.problemDescription}&quot;</p>
                      </div>
                    </div>
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-tighter text-on-surface-variant opacity-60">Amount Recovered</p>
                        <p className={`text-3xl font-black ${call.result?.amount ? "text-blue-700" : "text-slate-400"}`}>
                          €{call.result?.amount || 0}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href={`/call/${call.id}/result`}
                          className="px-5 py-2.5 bg-surface-container-high text-on-surface font-bold text-sm rounded-md ghost-border hover:bg-surface-container-highest transition-colors"
                        >
                          View details
                        </Link>
                        <Link
                          href="/call/new"
                          className="px-5 py-2.5 gradient-primary text-on-primary font-bold text-sm rounded-md shadow-sm hover:opacity-90 transition-opacity"
                        >
                          Call again
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-200/10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-2xl z-50">
        <Link href="/" className="flex flex-col items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
        </Link>
        <Link href="/history" className="flex flex-col items-center justify-center text-blue-700 bg-blue-50/50 rounded-xl px-3 py-1">
          <span className="material-symbols-outlined">history</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">History</span>
        </Link>
        <Link href="/call/new" className="flex flex-col items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">add_circle</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">New Call</span>
        </Link>
      </nav>
    </div>
  );
}
