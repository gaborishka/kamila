import Link from "next/link";

export default function Header() {
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
          <div className="text-slate-500 hover:bg-blue-50/50 transition-all duration-200 p-2 rounded-full cursor-pointer">
            <span className="material-symbols-outlined text-3xl">account_circle</span>
          </div>
        </div>
      </nav>
    </header>
  );
}
