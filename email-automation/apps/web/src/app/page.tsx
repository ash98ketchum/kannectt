import Link from "next/link";
import {
  Mail, Zap, Users, CreditCard, Shield, BarChart2,
  ArrowRight, Check, Star, Gift, Brain, Upload,
  Send, Search, ChevronRight,
} from "lucide-react";

/* ─── Data ───────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: Brain,    title: "Groq-powered AI",         desc: "LLaMA 3 reads your resume and crafts a unique pitch for every company — referencing their real products and culture. Under 1 second.",  tag: "AI Engine",      glow: "bg-indigo-500/20" },
  { icon: Upload,   title: "One resume, infinite reach", desc: "Upload your PDF once. AI extracts your projects, skills, and experience to personalise every outreach automatically.",               tag: "Resume",         glow: "bg-violet-500/20" },
  { icon: Users,    title: "Recruiter directory",     desc: "Browse thousands of verified hiring manager contacts by company, role, and department. Unlock emails only when ready.",                  tag: "Directory",      glow: "bg-cyan-500/20"   },
  { icon: Send,     title: "Bulk send in one click",  desc: "Queue up 50 targets at once. Natural delays avoid spam filters. Resume auto-attached. Every result logged.",                           tag: "Automation",     glow: "bg-emerald-500/20"},
  { icon: Shield,   title: "Spam-safe delivery",      desc: "Sends via your real Gmail — so emails come from your actual address, not a shady domain. Recruiters actually see them.",               tag: "Deliverability", glow: "bg-orange-500/20" },
  { icon: BarChart2,"title": "Full send history",     desc: "Track every email — company, subject, date, status. Know exactly who you've reached and when.",                                        tag: "Analytics",      glow: "bg-pink-500/20"   },
];

const STEPS = [
  { n: "01", icon: Upload, title: "Upload your resume",  desc: "Drop your PDF. AI extracts skills, projects, and experience instantly." },
  { n: "02", icon: Search, title: "Find recruiters",     desc: "Search by company or role. Unlock contacts you want to reach." },
  { n: "03", icon: Brain,  title: "AI writes the email", desc: "Groq personalises your pitch for each company automatically." },
  { n: "04", icon: Send,   title: "Deliver & track",     desc: "Emails land in inboxes, not spam. Track everything from your dashboard." },
];

const PACKAGES = [
  { name: "Starter", credits: 20,  price: "₹20",  popular: false, perks: ["~6 personalised emails", "Resume auto-attached", "Directory access", "Send history"] },
  { name: "Pro",     credits: 60,  price: "₹50",  popular: true,  perks: ["~20 personalised emails", "Resume auto-attached", "15 contact unlocks", "Priority delivery", "Full history"] },
  { name: "Power",   credits: 150, price: "₹100", popular: false, perks: ["~50 personalised emails", "Resume auto-attached", "50 contact unlocks", "Priority delivery", "Full history"] },
];

const TESTIMONIALS = [
  { name: "Priya S.", role: "SDE Intern → Full-time at Razorpay", text: "Got 3 interviews in a week. The personalisation is insane — recruiters actually replied to my cold emails." },
  { name: "Arjun M.", role: "CS grad, placed at Zepto",           text: "Sent 40 cold emails in 20 minutes. 8 replies. Previously I spent hours writing each one manually." },
  { name: "Neha T.", role: "Data Engineer at Meesho",             text: "The recruiter directory alone is worth it. Found direct hiring manager contacts for 15 companies I was targeting." },
];

const STATS = [
  { value: "50k+", label: "Emails sent" },
  { value: "12%",  label: "Avg reply rate" },
  { value: "<1s",  label: "AI speed" },
  { value: "300",  label: "Free credits" },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main className="relative flex flex-col min-h-screen bg-[#0A0A0B] text-white overflow-x-hidden">

      {/* === AMBIENT BACKGROUND === */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[700px] w-[900px] rounded-full bg-indigo-600/8 blur-[140px]" />
        <div className="absolute bottom-1/3 right-0 h-[500px] w-[600px] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[500px] rounded-full bg-cyan-600/6 blur-[100px]" />
      </div>

      {/* === NAV === */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] px-6 h-14 flex items-center justify-between backdrop-blur-xl bg-[#0A0A0B]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.5)]">
            <Mail size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">kannectt</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <a href="#features"     className="hover:text-white transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors duration-200">How it works</a>
          <a href="#pricing"      className="hover:text-white transition-colors duration-200">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block text-sm text-white/50 hover:text-white transition-colors duration-200">
            Sign in
          </Link>
          <Link href="/signup" className="group inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-[0.98]">
            Get started free
            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="relative flex flex-col items-center text-center px-6 pt-28 pb-24 gap-8">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-white/50">Groq LLM · sub-second personalisation</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tighter leading-[1.02] max-w-5xl">
          <span className="bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent">
            Land your dream job<br />with AI cold emails
          </span>
        </h1>

        {/* Sub */}
        <p className="text-base sm:text-lg text-white/55 max-w-xl leading-relaxed">
          Upload your resume once. Our AI personalises every email for every company.
          Reach recruiters and hiring managers in seconds — not hours.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/signup" className="group relative inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-bold text-white transition-all duration-300 hover:bg-indigo-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.45)] active:scale-[0.98]">
            Start free — 300 credits
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <Link href="/login" className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-base font-medium text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white">
            Sign in
            <ChevronRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <p className="flex items-center gap-1.5 font-mono text-xs text-white/30 uppercase tracking-widest">
          <Check size={11} className="text-emerald-400" /> No credit card required
        </p>

        {/* Stats strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-px w-full max-w-2xl rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.07]">
          {STATS.map(s => (
            <div key={s.label} className="flex flex-col items-center justify-center gap-1 bg-[#0A0A0B] py-6 px-4">
              <p className="font-mono text-3xl font-bold text-white">{s.value}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === FEATURES BENTO === */}
      <section id="features" className="px-6 py-24 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-white/35 mb-4">Features</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            Everything you need to get hired
          </h2>
          <p className="mt-4 text-white/50 max-w-lg mx-auto text-base leading-relaxed">
            Not a template blaster. Every email is written by AI using your resume and the company&apos;s actual context.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, tag, glow }) => (
            <div key={title} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06] hover:-translate-y-0.5">
              {/* Per-card ambient glow */}
              <div className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full ${glow} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="mb-5 flex items-start justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <Icon size={17} className="text-white/70" />
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/30 border border-white/[0.08] bg-white/[0.03] px-2 py-1 rounded-full">
                    {tag}
                  </span>
                </div>
                <h3 className="mb-2.5 text-base font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section id="how-it-works" className="px-6 py-24 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-xs uppercase tracking-widest text-white/35 mb-4">How it works</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
              From zero to inbox in 4 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STEPS.map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="group flex gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]">
                <div className="shrink-0 flex flex-col items-center gap-3">
                  <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                    <Icon size={16} className="text-indigo-400" />
                  </div>
                  <span className="font-mono text-[10px] text-white/20">{n}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-base text-white mb-2">{title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === REFERRAL BANNER === */}
      <section className="px-6 py-16 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-8">
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              <div className="h-14 w-14 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-center shrink-0">
                <Gift size={24} className="text-amber-400" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-lg text-white mb-1">Refer friends, earn credits</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  Share your referral link after signing up. Every friend who joins gives you{" "}
                  <span className="font-mono font-bold text-amber-400">+50 credits</span>.
                  They get 300 credits, you earn 50 — everyone wins.
                </p>
              </div>
              <Link href="/signup" className="shrink-0 group inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black transition-all duration-300 hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                Sign up &amp; invite
                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === PRICING === */}
      <section id="pricing" className="px-6 py-24 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-xs uppercase tracking-widest text-white/35 mb-4">Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
              Pay only for what you send
            </h2>
            <p className="mt-4 text-white/50 max-w-md mx-auto">
              No subscriptions. No monthly fees. Top up via UPI, GPay, PhonePe, or card.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PACKAGES.map(pkg => (
              <div key={pkg.name} className={`relative flex flex-col gap-6 rounded-2xl border p-7 transition-all duration-300 ${
                pkg.popular
                  ? "border-indigo-500/40 bg-indigo-600/[0.08] shadow-[0_0_60px_rgba(99,102,241,0.12)]"
                  : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.05]"
              }`}>
                {pkg.popular && (
                  <>
                    <div className="pointer-events-none absolute -top-px left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white shadow-[0_0_12px_rgba(99,102,241,0.6)]">
                        <Zap size={9} fill="currentColor" /> Most popular
                      </span>
                    </div>
                  </>
                )}
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-white/35 mb-3">{pkg.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-bold tracking-tighter text-white">{pkg.price}</span>
                  </div>
                  <p className="font-mono text-xs text-white/30 mt-1">{pkg.credits} credits</p>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {pkg.perks.map(p => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-white/60">
                      <Check size={12} className={pkg.popular ? "text-indigo-400 shrink-0" : "text-white/30 shrink-0"} />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`group inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300 ${
                  pkg.popular
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                    : "border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white"
                }`}>
                  Get started
                  <ChevronRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {["Pay via UPI / GPay / PhonePe", "No subscription ever", "Credits never expire", "300 credits free on signup"].map(t => (
              <span key={t} className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-white/30">
                <Check size={10} className="text-white/20" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* === TESTIMONIALS === */}
      <section className="px-6 py-24 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-xs uppercase tracking-widest text-white/35 mb-4">Social proof</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
              People landing interviews
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map(({ name, role, text }) => (
              <div key={name} className="flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]">
                <div className="flex gap-0.5">
                  {Array(5).fill(0).map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm leading-relaxed text-white/60 flex-1">&ldquo;{text}&rdquo;</p>
                <div className="border-t border-white/[0.06] pt-4">
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="font-mono text-[11px] text-white/30 mt-0.5">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FINAL CTA === */}
      <section className="px-6 py-32 border-t border-white/[0.06]">
        <div className="relative max-w-3xl mx-auto text-center flex flex-col items-center gap-8">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-indigo-500/10 blur-[100px]" />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-white/35">Start today</p>
          <h2 className="text-5xl sm:text-6xl font-bold tracking-tighter bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent leading-tight">
            Stop writing emails.<br />Start getting interviews.
          </h2>
          <p className="text-white/50 text-base max-w-lg leading-relaxed">
            300 free credits. No card. No subscription. Upload your resume and start reaching out in the next 5 minutes.
          </p>
          <Link href="/signup" className="group relative inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-10 py-4 text-base font-bold text-white transition-all duration-300 hover:bg-indigo-500 hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] active:scale-[0.98]">
            Create free account
            <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <div className="flex flex-wrap justify-center gap-6">
            {["300 free credits", "No credit card", "UPI & GPay", "Real email required"].map(t => (
              <span key={t} className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-white/25">
                <Check size={10} className="text-white/20" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="border-t border-white/[0.06] px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
              <Mail size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm">kannectt</span>
            <span className="font-mono text-[11px] text-white/25 ml-1">AI job outreach</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-xs text-white/30">
            <Link href="/login"  className="hover:text-white/60 transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-white/60 transition-colors">Sign up</Link>
            <a href="#features"  className="hover:text-white/60 transition-colors">Features</a>
            <a href="#pricing"   className="hover:text-white/60 transition-colors">Pricing</a>
          </div>
          <p className="font-mono text-[11px] text-white/20">© 2026 kannectt</p>
        </div>
      </footer>

    </main>
  );
}
