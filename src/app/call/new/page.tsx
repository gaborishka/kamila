"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUpload from "@/components/FileUpload";
import { COUNTRIES, LANGUAGES } from "@/lib/language";

export default function NewCallPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const defaultCountryIndex = COUNTRIES.findIndex(c => c.code === "+1" && c.country === "United States");
  const [countryIndex, setCountryIndex] = useState(defaultCountryIndex);
  const [language, setLanguage] = useState(COUNTRIES[defaultCountryIndex].lang);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supportPhone = `${COUNTRIES[countryIndex].code}${phoneNumber}`;
      const formData = new FormData();
      formData.append("companyName", companyName);
      formData.append("supportPhone", supportPhone);
      if (companyUrl) formData.append("companyUrl", companyUrl);
      formData.append("problemDescription", problemDescription);
      formData.append("customerName", customerName);
      if (orderNumber) formData.append("orderNumber", orderNumber);
      formData.append("language", language);
      if (file) formData.append("file", file);

      const res = await fetch("/api/calls", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Failed to create call. Please try again.");
        return;
      }

      const data = await res.json();
      if (data.id) {
        router.push(`/call/${data.id}/preparing`);
      }
    } catch (error) {
      console.error("Failed to create call:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5 flex flex-col justify-center">
          <div className="mb-8">
            <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-4 block">
              New Resolution
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface leading-tight mb-6">
              Let Kamila <br />Handle the{" "}
              <span className="text-primary italic">Hold Music.</span>
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed max-w-md">
              Our AI advocate contacts support teams, navigates IVRs, and
              secures your refunds while you get back to your life.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/15 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bolt
                </span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Average wait time saved</h4>
                <p className="text-3xl font-black text-primary tracking-tight">42 minutes</p>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_20px_40px_rgba(19,27,46,0.06)] border border-outline-variant/15">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 01: Company */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-sm">01</span>
                  <h2 className="text-xl font-bold tracking-tight">The Company</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="companyName" className="text-xs font-bold tracking-wide uppercase text-on-surface-variant">
                      Company name or website URL
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        if (e.target.value.startsWith("http")) setCompanyUrl(e.target.value);
                      }}
                      className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-md px-4 py-3 transition-all"
                      placeholder="e.g. Delta Airlines"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="supportPhone" className="text-xs font-bold tracking-wide uppercase text-on-surface-variant">
                      Support phone number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryIndex}
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          setCountryIndex(idx);
                          setLanguage(COUNTRIES[idx].lang);
                        }}
                        className="bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-md px-4 py-3 transition-all text-sm shrink-0 appearance-none"
                      >
                        {COUNTRIES.map((c, i) => (
                          <option key={`${c.code}-${c.country}`} value={i}>
                            {c.flag} {c.country} ({c.code})
                          </option>
                        ))}
                      </select>
                      <input
                        id="supportPhone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 min-w-0 bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-md px-4 py-3 transition-all"
                        placeholder="(800) 000-0000"
                        required
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-500 italic flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">info</span>
                  If you don&apos;t know the number, paste their website and we&apos;ll find it
                </p>
              </div>

              {/* Section 02: Problem */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-sm">02</span>
                  <h2 className="text-xl font-bold tracking-tight">Your Problem</h2>
                </div>
                <div className="space-y-4">
                  <FileUpload onFileSelect={setFile} file={file} />
                  <div className="space-y-2">
                    <label htmlFor="problemDescription" className="text-xs font-bold tracking-wide uppercase text-on-surface-variant">
                      Describe your problem
                    </label>
                    <textarea
                      id="problemDescription"
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-md px-4 py-3 transition-all resize-none"
                      placeholder="My flight was delayed 4 hours..."
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 03: Your Data */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-sm">03</span>
                  <h2 className="text-xl font-bold tracking-tight">Your Data</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div className="space-y-2">
                    <label htmlFor="customerName" className="text-xs font-bold tracking-wide uppercase text-on-surface-variant">
                      Your name
                    </label>
                    <input
                      id="customerName"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-md px-4 py-3 transition-all"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="orderNumber" className="text-xs font-bold tracking-wide uppercase text-on-surface-variant">
                      Order number / booking reference{" "}
                      <span className="text-slate-400 normal-case font-normal">(Optional)</span>
                    </label>
                    <input
                      id="orderNumber"
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-md px-4 py-3 transition-all"
                      placeholder="ABC-12345"
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <label htmlFor="language" className="text-xs font-bold tracking-wide uppercase text-on-surface-variant">
                    Call language
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-md px-4 py-3 transition-all text-sm"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-on-surface-variant/70 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    Auto-detected from country. Change if support speaks a different language.
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Creating your case...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">call</span>
                      Call for me
                    </>
                  )}
                </button>
                {error && (
                  <p className="text-center mt-4 text-sm text-error font-medium">{error}</p>
                )}
                <p className="text-center mt-3 text-xs text-on-surface-variant uppercase tracking-widest font-bold">
                  Relentless Resolution Guarantee
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Background blurs */}
      <div className="hidden lg:block fixed bottom-10 right-10 pointer-events-none opacity-20">
        <div className="w-64 h-64 bg-primary rounded-full blur-[100px]"></div>
      </div>
      <div className="hidden lg:block fixed top-40 left-10 pointer-events-none opacity-10">
        <div className="w-96 h-96 bg-secondary rounded-full blur-[120px]"></div>
      </div>

      <Footer />
    </>
  );
}
