import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 z-10">
              <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-wider rounded-full mb-6">
                The Digital Verdict
              </span>
              <h1 className="text-5xl lg:text-7xl font-headline font-black text-on-surface leading-[1.1] text-editorial mb-6">
                Stop wasting hours on hold.{" "}
                <span className="text-primary">Kamila calls for you.</span>
              </h1>
              <p className="text-xl text-on-surface-variant leading-relaxed max-w-2xl mb-10">
                Upload your receipt, describe the problem, and let AI fight for
                your refund. Finally, someone will solve this for me.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/call/new"
                  className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-md font-bold text-lg hover:shadow-lg transition-all active:scale-95 text-center"
                >
                  Get My Money Back
                </Link>
                <div className="flex items-center gap-3 px-4">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-sm">person</span>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-sm">person</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-bold text-on-surface">247 refunds recovered</div>
                    <div className="text-on-surface-variant">$12,400 saved this month</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="relative w-full aspect-square">
                <div className="absolute inset-0 bg-primary/5 rounded-[2rem] transform rotate-3"></div>
                <div className="absolute inset-0 glass-panel ghost-border rounded-[2rem] p-8 flex flex-col justify-center items-center shadow-xl">
                  <div className="flex flex-col items-center gap-8 w-full max-w-xs">
                    <div className="w-16 h-16 bg-surface-container-highest rounded-xl flex items-center justify-center text-primary-container shadow-sm">
                      <span className="material-symbols-outlined text-4xl">phone_in_talk</span>
                    </div>
                    <div className="h-12 w-0.5 bg-gradient-to-b from-primary/20 to-primary"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-container rounded-2xl flex items-center justify-center text-on-primary shadow-2xl relative">
                      <span className="material-symbols-outlined text-5xl">psychology</span>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center border-2 border-surface shadow-md">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-12 w-0.5 bg-gradient-to-b from-primary to-secondary/40"></div>
                    <div className="w-16 h-16 bg-secondary-container rounded-xl flex items-center justify-center text-on-secondary-container shadow-sm">
                      <span className="material-symbols-outlined text-4xl">payments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Stats */}
        <section className="bg-surface-container-low py-12">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-black text-primary mb-1">98%</div>
              <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-primary mb-1">2.4k</div>
              <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Active Cases</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-primary mb-1">12m</div>
              <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Avg. Hold Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-primary mb-1">100%</div>
              <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Relentless</div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-headline font-black text-on-surface mb-4">
                A simple brief for your digital attorney
              </h2>
              <p className="text-on-surface-variant text-lg">
                Kamila doesn&apos;t just automate tasks; she executes strategies.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "upload_file", step: "01", title: "Upload your receipt", desc: "Simply snap a photo or upload a screenshot. Kamila extracts every detail, policy, and deadline automatically." },
                { icon: "edit_note", step: "02", title: "Describe the problem", desc: "Tell her what went wrong in your own words. No legal jargon required. She converts your frustration into a formal case." },
                { icon: "call", step: "03", title: "Kamila gets to work", desc: "She stays on hold, talks to agents, cites terms of service, and gets your money back while you enjoy your coffee." },
              ].map((item) => (
                <div key={item.step} className="group p-8 rounded-xl bg-surface-container-lowest ghost-border hover:shadow-2xl transition-all duration-300">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined font-bold">{item.icon}</span>
                  </div>
                  <div className="text-xs font-bold text-primary uppercase mb-2">Step {item.step}</div>
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Kamila */}
        <section className="py-32 px-6 bg-on-surface text-surface relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black mb-10 leading-tight">
                  Why Kamila is your <br />
                  <span className="text-primary-fixed-dim">unstoppable advocate.</span>
                </h2>
                <div className="space-y-8">
                  {[
                    { title: "Reads 50 pages of Terms of Service in seconds", desc: "She knows the fine print better than the agents on the phone. Every loophole is identified." },
                    { title: "Finds what worked for others on Reddit", desc: "Collective intelligence at your service. She uses proven strategies from thousands of successful refund stories." },
                    { title: "Stays calm, polite, and relentless", desc: "No emotional burnout. She maintains professional pressure until the resolution is achieved." },
                    { title: "Never gets tired of being on hold", desc: "Infinite patience. She waits through the elevator music so you don't have to." },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-6">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">check</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                        <p className="text-surface-variant/80">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-surface-container-lowest/5 rounded-3xl p-1 shadow-inner">
                <div className="bg-surface-container-highest/10 p-8 rounded-[1.4rem] ghost-border">
                  <div className="space-y-8">
                    {[
                      { time: "09:00 AM", title: "Call Initiated with Airline", desc: 'Kamila: "Requesting supervisor regarding Section 4.2 flight delay..."', color: "bg-secondary", glow: "shadow-[0_0_10px_rgba(0,108,73,0.5)]" },
                      { time: "10:15 AM", title: "Negotiation in Progress", desc: '"Currently on hold. Est. wait time: 42 mins."', color: "bg-tertiary", glow: "shadow-[0_0_10px_rgba(102,63,0,0.5)]" },
                      { time: "11:04 AM", title: "Refund Approved: $428.50", desc: "Case closed. Transfer pending to original payment method.", color: "bg-secondary", glow: "shadow-[0_0_10px_rgba(0,108,73,0.5)]", isLast: true, titleClass: "text-secondary-fixed" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="relative">
                          <div className={`w-3 h-3 rounded-full ${item.color} ${item.glow} z-10 relative`}></div>
                          {!item.isLast && <div className="absolute top-3 bottom-[-32px] left-1.5 w-[2px] bg-surface-variant/30"></div>}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-primary-fixed-dim uppercase tracking-widest mb-1">{item.time}</div>
                          <div className={`font-bold ${item.titleClass || "text-white"}`}>{item.title}</div>
                          <div className="text-sm text-surface-variant/70">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto bg-surface-container rounded-3xl p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full -ml-32 -mb-32"></div>
            <h2 className="text-4xl lg:text-6xl font-headline font-black mb-8 relative z-10">
              Stop the stress. <br />Start your refund.
            </h2>
            <p className="text-xl text-on-surface-variant mb-12 max-w-2xl mx-auto relative z-10">
              Join 247+ users who have already reclaimed their time and money from stubborn corporations.
            </p>
            <Link
              href="/call/new"
              className="inline-block bg-primary text-on-primary px-10 py-5 rounded-md font-bold text-xl hover:shadow-xl hover:-translate-y-1 transition-all active:translate-y-0 relative z-10"
            >
              Get My Money Back Now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
