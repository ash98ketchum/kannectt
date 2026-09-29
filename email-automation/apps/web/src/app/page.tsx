"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  Mail, Zap, Users, CreditCard, Shield, BarChart2,
  ArrowRight, Check, Star, Gift, Brain, Upload,
  Send, Search, ChevronRight,
} from "lucide-react";

/* ─── Data ─────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: Brain,    title: "Groq-powered AI",         desc: "LLaMA 3 reads your resume and crafts a unique pitch for every company — referencing their real products and culture. Under 1 second.",  tag: "AI Engine"      },
  { icon: Upload,   title: "One resume, infinite reach", desc: "Upload your PDF once. AI extracts your projects, skills, and experience to personalise every outreach automatically.",               tag: "Resume"         },
  { icon: Users,    title: "Recruiter directory",     desc: "Browse thousands of verified hiring manager contacts by company, role, and department. Unlock emails only when ready.",                  tag: "Directory"      },
  { icon: Send,     title: "Bulk send in one click",  desc: "Queue up 50 targets at once. Natural delays avoid spam filters. Resume auto-attached. Every result logged.",                           tag: "Automation"     },
  { icon: Shield,   title: "Spam-safe delivery",      desc: "Sends via your real Gmail — so emails come from your actual address, not a shady domain. Recruiters actually see them.",               tag: "Deliverability" },
  { icon: BarChart2,title: "Full send history",       desc: "Track every email — company, subject, date, status. Know exactly who you've reached and when.",                                        tag: "Analytics"      },
];
const STEPS = [
  { n: "01", icon: Upload, title: "Upload your resume",  desc: "Drop your PDF. AI extracts skills, projects, and experience instantly." },
  { n: "02", icon: Search, title: "Find recruiters",     desc: "Search by company or role. Unlock contacts you want to reach." },
  { n: "03", icon: Brain,  title: "AI writes the email", desc: "Groq personalises your pitch for each company automatically." },
  { n: "04", icon: Send,   title: "Deliver & track",     desc: "Emails land in inboxes, not spam. Track everything from your dashboard." },
];
const PACKAGES = [
  { name: "Starter", credits: 20,  price: "₹20",  popular: false, perks: ["~6 personalised emails","Resume auto-attached","Directory access","Send history"] },
  { name: "Pro",     credits: 60,  price: "₹50",  popular: true,  perks: ["~20 personalised emails","Resume auto-attached","15 contact unlocks","Priority delivery","Full history"] },
  { name: "Power",   credits: 150, price: "₹100", popular: false, perks: ["~50 personalised emails","Resume auto-attached","50 contact unlocks","Priority delivery","Full history"] },
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

/* ─── Animated particle orbs background ────────────────────────────────── */
function LiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);

    const orbs = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 200 + Math.random() * 300,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      hue: [30, 40, 35, 25, 45, 20][i],   // warm cream/amber tones
      alpha: 0.04 + Math.random() * 0.04,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      orbs.forEach(o => {
        o.x += o.dx; o.y += o.dy;
        if (o.x < -o.r) o.x = W + o.r;
        if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r;
        if (o.y > H + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},40%,65%,${o.alpha})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-10 opacity-100" />;
}

/* ─── Reusable section label ─────────────────────────────────────────────── */
const Label = ({ children }: { children: string }) => (
  <p className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-cream-400/50 mb-4">{children}</p>
);

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main className="relative flex flex-col min-h-screen bg-[#0A0905] text-[#E8DDD0] overflow-x-hidden">
      <LiveBackground />

      {/* === NAV === */}
      <nav className="sticky top-0 z-50 border-b border-cream-300/[0.08] px-8 h-16 flex items-center justify-between backdrop-blur-xl bg-[#0A0905]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-cream-300 rounded-lg flex items-center justify-center">
            <Mail size={13} className="text-[#0A0905]" />
          </div>
          <span className="font-display text-lg text-cream-300 tracking-wide font-medium">kannectt</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-cream-300/40">
          <a href="#features"     className="hover:text-cream-300 transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-cream-300 transition-colors duration-200">How it works</a>
          <a href="#pricing"      className="hover:text-cream-300 transition-colors duration-200">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-sm text-cream-300/40 hover:text-cream-300 transition-colors duration-200">
            Sign in
          </Link>
          <Link href="/signup" className="group inline-flex items-center gap-1.5 rounded-xl bg-cream-300 px-5 py-2 text-sm font-semibold text-[#0A0905] transition-all duration-300 hover:bg-cream-200 active:scale-[0.98]">
            Get started free
            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="relative flex flex-col items-center text-center px-6 pt-32 pb-28 gap-8">
        {/* Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cream-300/[0.12] bg-cream-300/[0.04] px-5 py-1.5 backdrop-blur-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-cream-300/60 animate-pulse" />
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-300/40">Groq LLM · sub-second personalisation</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-6xl sm:text-7xl lg:text-9xl font-light text-[#E8DDD0] tracking-tight leading-[1.0] max-w-5xl">
          Land your dream job<br />
          <em className="not-italic text-cream-400/70">with AI cold emails</em>
        </h1>

        <p className="text-base text-cream-300/45 max-w-md leading-relaxed">
          Upload your resume once. Our AI personalises every email for every company.
          Reach recruiters in seconds — not hours.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/signup" className="group inline-flex items-center gap-2 rounded-2xl bg-cream-300 px-8 py-4 text-base font-semibold text-[#0A0905] transition-all duration-300 hover:bg-cream-200 active:scale-[0.98]">
            Start free — 300 credits
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <Link href="/login" className="group inline-flex items-center gap-2 rounded-2xl border border-cream-300/[0.12] px-6 py-4 text-base text-cream-300/60 transition-all duration-300 hover:border-cream-300/25 hover:text-cream-300">
            Sign in
            <ChevronRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-cream-300/25">
          <Check size={10} className="text-cream-300/40" /> No credit card required
        </p>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-px w-full max-w-2xl rounded-2xl overflow-hidden border border-cream-300/[0.07] bg-cream-300/[0.07]">
          {STATS.map(s => (
            <div key={s.label} className="flex flex-col items-center justify-center gap-1 bg-[#0A0905] py-6 px-4">
              <p className="font-display text-4xl font-light text-cream-300">{s.value}</p>
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-cream-300/30">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === FEATURES === */}
      <section id="features" className="px-8 py-24 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <Label>Features</Label>
          <h2 className="font-display text-5xl sm:text-6xl font-light text-[#E8DDD0] tracking-tight">
            Everything you need to get hired
          </h2>
          <p className="mt-4 text-cream-300/40 max-w-md mx-auto text-sm leading-relaxed">
            Not a template blaster. Every email is written by AI using your resume and the company&apos;s actual context.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map(({ icon: Icon, title, desc, tag }) => (
            <div key={title} className="group relative overflow-hidden rounded-2xl border border-cream-300/[0.07] bg-cream-300/[0.02] p-7 transition-all duration-300 hover:border-cream-300/[0.14] hover:bg-cream-300/[0.04] hover:-translate-y-0.5">
              <div className="relative">
                <div className="mb-5 flex items-start justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cream-300/[0.1] bg-cream-300/[0.05]">
                    <Icon size={17} className="text-cream-300/60" />
                  </div>
                  <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-cream-300/25 border border-cream-300/[0.08] bg-cream-300/[0.03] px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                </div>
                <h3 className="mb-2.5 text-base font-medium text-cream-200">{title}</h3>
                <p className="text-sm leading-relaxed text-cream-300/40">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section id="how-it-works" className="px-8 py-24 border-t border-cream-300/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Label>How it works</Label>
            <h2 className="font-display text-5xl sm:text-6xl font-light text-[#E8DDD0] tracking-tight">
              From zero to inbox in 4 steps
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STEPS.map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="flex gap-5 rounded-2xl border border-cream-300/[0.07] bg-cream-300/[0.02] p-7 transition-all duration-300 hover:border-cream-300/[0.14] hover:bg-cream-300/[0.04]">
                <div className="shrink-0 flex flex-col items-center gap-3">
                  <div className="h-10 w-10 rounded-xl border border-cream-300/[0.1] bg-cream-300/[0.05] flex items-center justify-center">
                    <Icon size={16} className="text-cream-300/60" />
                  </div>
                  <span className="font-sans text-[10px] text-cream-300/20 font-semibold tracking-widest">{n}</span>
                </div>
                <div>
                  <h3 className="font-medium text-base text-cream-200 mb-2">{title}</h3>
                  <p className="text-sm leading-relaxed text-cream-300/40">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === REFERRAL === */}
      <section className="px-8 py-16 border-t border-cream-300/[0.06]">
        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-cream-300/[0.12] bg-cream-300/[0.03] p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cream-300/5 blur-3xl" />
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              <div className="h-14 w-14 rounded-2xl border border-cream-300/20 bg-cream-300/[0.06] flex items-center justify-center shrink-0">
                <Gift size={22} className="text-cream-300/70" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-display text-2xl font-light text-cream-200 mb-1">Refer friends, earn credits</h3>
                <p className="text-sm text-cream-300/40 leading-relaxed">
                  Every friend who joins gives you <span className="font-semibold text-cream-300">+50 credits</span>.
                  They get 300 credits, you earn 50 — everyone wins.
                </p>
              </div>
              <Link href="/signup" className="shrink-0 group inline-flex items-center gap-1.5 rounded-xl bg-cream-300 px-5 py-2.5 text-sm font-semibold text-[#0A0905] transition-all duration-300 hover:bg-cream-200">
                Sign up &amp; invite
                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === PRICING === */}
      <section id="pricing" className="px-8 py-24 border-t border-cream-300/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Label>Pricing</Label>
            <h2 className="font-display text-5xl sm:text-6xl font-light text-[#E8DDD0] tracking-tight">
              Pay only for what you send
            </h2>
            <p className="mt-4 text-cream-300/40 max-w-md mx-auto text-sm">
              No subscriptions. No monthly fees. Top up via UPI, GPay, PhonePe, or card.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PACKAGES.map(pkg => (
              <div key={pkg.name} className={`relative flex flex-col gap-6 rounded-2xl border p-7 transition-all duration-300 ${
                pkg.popular
                  ? "border-cream-300/30 bg-cream-300/[0.05]"
                  : "border-cream-300/[0.07] bg-cream-300/[0.02] hover:border-cream-300/[0.14]"
              }`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-cream-300 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#0A0905]">
                      <Zap size={9} fill="currentColor" /> Most popular
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-cream-300/35 mb-3">{pkg.name}</p>
                  <p className="font-display text-6xl font-light text-cream-200 tracking-tight">{pkg.price}</p>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-cream-300/30 mt-1">{pkg.credits} credits</p>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {pkg.perks.map(p => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-cream-300/50">
                      <Check size={11} className="text-cream-300/40 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold transition-all duration-300 ${
                  pkg.popular
                    ? "bg-cream-300 text-[#0A0905] hover:bg-cream-200"
                    : "border border-cream-300/[0.12] text-cream-300/60 hover:border-cream-300/25 hover:text-cream-300"
                }`}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {["Pay via UPI / GPay / PhonePe","No subscription ever","Credits never expire","300 credits free on signup"].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-cream-300/25">
                <Check size={9} className="text-cream-300/20" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* === TESTIMONIALS === */}
      <section className="px-8 py-24 border-t border-cream-300/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Label>Social proof</Label>
            <h2 className="font-display text-5xl sm:text-6xl font-light text-[#E8DDD0] tracking-tight">
              People landing interviews
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map(({ name, role, text }) => (
              <div key={name} className="flex flex-col gap-5 rounded-2xl border border-cream-300/[0.07] bg-cream-300/[0.02] p-7 transition-all duration-300 hover:border-cream-300/[0.14]">
                <div className="flex gap-0.5">
                  {Array(5).fill(0).map((_, i) => <Star key={i} size={11} className="fill-cream-400/60 text-cream-400/60" />)}
                </div>
                <p className="text-sm leading-relaxed text-cream-300/50 flex-1 font-display text-base font-light">&ldquo;{text}&rdquo;</p>
                <div className="border-t border-cream-300/[0.07] pt-4">
                  <p className="text-sm font-medium text-cream-200">{name}</p>
                  <p className="text-[10px] font-semibold tracking-wider uppercase text-cream-300/30 mt-0.5">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section className="px-8 py-32 border-t border-cream-300/[0.06]">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-8">
          <Label>Start today</Label>
          <h2 className="font-display text-6xl sm:text-7xl font-light text-[#E8DDD0] tracking-tight leading-tight">
            Stop writing emails.<br />
            <em className="not-italic text-cream-400/60">Start getting interviews.</em>
          </h2>
          <p className="text-cream-300/40 text-base max-w-md leading-relaxed">
            300 free credits. No card. No subscription. Upload your resume and start reaching out in the next 5 minutes.
          </p>
          <Link href="/signup" className="group inline-flex items-center gap-2 rounded-2xl bg-cream-300 px-10 py-4 text-base font-semibold text-[#0A0905] transition-all duration-300 hover:bg-cream-200 active:scale-[0.98]">
            Create free account
            <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <div className="flex flex-wrap justify-center gap-6">
            {["300 free credits","No credit card","UPI & GPay","Real email required"].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-cream-300/20">
                <Check size={9} className="text-cream-300/25" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="border-t border-cream-300/[0.06] px-8 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-cream-300 rounded-md flex items-center justify-center">
              <Mail size={11} className="text-[#0A0905]" />
            </div>
            <span className="font-display text-base text-cream-300 tracking-wide">kannectt</span>
            <span className="text-[10px] font-semibold tracking-widest uppercase text-cream-300/20 ml-1">AI job outreach</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] font-semibold tracking-wider uppercase text-cream-300/25">
            <Link href="/login"  className="hover:text-cream-300/60 transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-cream-300/60 transition-colors">Sign up</Link>
            <a href="#features"  className="hover:text-cream-300/60 transition-colors">Features</a>
            <a href="#pricing"   className="hover:text-cream-300/60 transition-colors">Pricing</a>
          </div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-cream-300/15">© 2026 kannectt</p>
        </div>
      </footer>
    </main>
  );
}
