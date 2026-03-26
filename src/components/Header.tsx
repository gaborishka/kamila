"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOutAction } from "@/lib/auth-actions";

export default function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="bg-slate-50/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200/20">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-2xl font-black tracking-tighter text-blue-900">
          Kamila
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/history"
            className="text-slate-500 hover:text-blue-600 transition-all duration-200"
          >
            History
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/call/new"
            className="bg-primary text-on-primary px-5 py-2 rounded-md font-bold active:scale-[0.98] transition-transform shadow-sm"
          >
            New Call
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-9 h-9 rounded-full border-2 border-slate-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold">
                  {user.name?.[0] || "U"}
                </div>
              )}
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="text-slate-500 hover:bg-blue-50/50 transition-all duration-200 p-2 rounded-full"
            >
              <span className="material-symbols-outlined text-3xl">account_circle</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
