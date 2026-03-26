export default function Footer() {
  return (
    <footer className="bg-slate-50 py-12 px-6 border-t border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-2">
          <div className="text-lg font-bold text-blue-900">Kamila AI</div>
          <p className="text-sm text-slate-500">
            © 2026 Kamila AI. Credits: ElevenLabs, Firecrawl.
          </p>
        </div>
        <div className="flex items-center gap-8">
          <a
            className="text-sm text-slate-500 hover:text-blue-600 underline underline-offset-4 transition-colors duration-200"
            href="#"
          >
            GitHub
          </a>
          <a
            className="text-sm text-slate-500 hover:text-blue-600 underline underline-offset-4 transition-colors duration-200"
            href="#"
          >
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
}
