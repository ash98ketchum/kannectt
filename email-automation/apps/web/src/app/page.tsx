import Link from "next/link";
import {
  Mail, Zap, Users, CreditCard, Shield, BarChart2,
  ArrowRight, Check, Star, Gift, Brain, Upload,
  Send, Search, Unlock, ChevronRight,
} from "lucide-react";

/* ─── Static data ─────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Brain,
    title: "Groq-powered personalisation",
    desc: "LLaMA 3 reads your resume and crafts a unique email for every company — referencing their real products, tech stack, and culture. Under 1 second per email.",
    tag: "AI Engine",
  },
  {
    icon: Upload,
    title: "One resume, infinite reach",
    desc: "Upload your PDF once. Our AI extracts your projects, skills, and experience to personalise every outreach automatically. No manual editing.",
    tag: "Resume",
  },
  {
    icon: Users,
    title: "Verified recruiter directory",
    desc: "Browse thousands of verified recruiter and hiring manager contacts by company, role, and department. Unlock emails only when you're ready to send.",
    tag: "Directory",
  },
  {
    icon: Send,
    title: "Bulk send with one click",
    desc: "Queue up to 50 targets at once. Our system sends with natural delays to avoid spam filters, attaches your resume, and logs every result.",
    tag: "Automation",
  },
  {
    icon: Shield,
    title: "Spam-safe delivery",
    desc: "Sends via your own Gmail using App Passwords — so emails come from your real address, not a shady domain. Recruiters actually see them.",
    tag: "Deliverability",
  },
  {
    icon: BarChart2,
    title: "Full send history",
    desc: "Track every email sent — company, subject, date, and status. Know exactly who you've reached out to and when.",
    tag: "Analytics",
  },
];

const STEPS = [
  { n: "01", icon: Upload, title: "Upload your resume", desc: "Drop your PDF. Our AI extracts skills, projects, and experience in seconds." },
  { n: "02", icon: Search, title: "Find recruiters", desc: "Search our directory by company or role. Unlock contacts for the companies you want." },
  { n: "03", icon: Brain,  title: "AI writes the email", desc: "Click send — Groq personalises your pitch for each company automatically." },
  { n: "04", icon: Send,   title: "Deliver & track", desc: "Emails land in inboxes, not spam. Track everything from your dashboard." },
];

const PACKAGES = [
  {
    name: "Starter", credits: 20, price: "₹2", popular: false,
    perks: ["~6 personalised emails", "Resume auto-attached", "Directory access", "Send history"],
  },
  {
    name: "Pro", credits: 60, price: "₹5", popular: true,
    perks: ["~20 personalised emails", "Resume auto-attached", "15 contact unlocks", "Priority delivery", "Full history"],
  },
  {
    name: "Power", credits: 150, price: "₹10", popular: false,
    perks: ["~50 personalised emails", "Resume auto-attached", "50 contact unlocks", "Priority delivery", "Full history"],
  },
];

const TESTIMONIALS = [
  { name: "Priya S.", role: "SDE Intern → Full-time at Razorpay", text: "I got 3 interviews in a week after using kannectt. The personalisation is insane — recruiters actually replied." },
  { name: "Arjun M.", role: "CS grad, placed at Zepto", text: "Sent 40 cold emails in 20 minutes. 8 replies. Previously I spent hours writing each one manually." },
  { name: "Neha T.", role: "Data Engineer at Meesho", text: "The recruiter directory alone is worth it. Found direct hiring manager contacts for 15 companies I was targeting." },
];

const STATS = [
  { value: "50k+", label: "Emails sent" },
  { value: "12%",  label: "Average reply rate" },
  { value: "<1s",  label: "Personalisation speed" },
  { value: "300",  label: "Free credits on signup" },
];

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-black text-white overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-neutral-800/80 px-6 h-14 flex items-center justify-between backdrop-blur-xl bg-black/70">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
            <Mail size={13} className="text-black" />
          </div>
          <span className="font-bold text-sm tracking-tight">kannectt</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How it works</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-neutral-400 hover:text-white transition hidden sm:block">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-white text-black px-4 py-1.5 rounded-lg font-semibold hover:bg-neutral-200 transition flex items-center gap-1.5"
          >
            Get 300 credits free <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center px-4 pt-24 pb-20 gap-8 overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-white/[0.03] rounded-full blur-3xl" />
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 border border-neutral-800 bg-neutral-900/60 rounded-full px-4 py-1.5 text-xs text-neutral-400">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Live — Groq LLM · sub-second personalisation
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight max-w-4xl leading-[1.05] bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
          Land your dream job<br/>with AI cold emails
        </h1>

        <p className="text-neutral-400 text-lg sm:text-xl max-w-2xl leading-relaxed">
          Upload your resume once. Our AI personalises every email for every company.
          Send to recruiters and hiring managers in seconds — not hours.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/signup"
            className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-neutral-100 transition text-base flex items-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          >
            Start free — 300 credits
            <ArrowRight size={16} />
          </Link>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Check size={14} className="text-green-400" /> No credit card required
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-16 pt-8 border-t border-neutral-800/50 w-full max-w-3xl">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold">{s.value}</p>
              <p className="text-xs text-neutral-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-24 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-medium mb-3">Features</p>
          <h2 className="text-4xl font-bold tracking-tight">Everything you need to get hired</h2>
          <p className="text-neutral-400 mt-3 max-w-xl mx-auto">Not a template blaster. Every email is written by AI using your resume and the company&apos;s actual context.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, tag }) => (
            <div key={title} className="group border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-neutral-600 transition bg-neutral-950/50 hover:bg-neutral-900/50">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:border-neutral-700 transition">
                  <Icon size={18} className="text-neutral-400 group-hover:text-white transition" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-full">
                  {tag}
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm mb-2">{title}</p>
                <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 py-24 border-t border-neutral-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-medium mb-3">How it works</p>
            <h2 className="text-4xl font-bold tracking-tight">From zero to inbox in 4 steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {STEPS.map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="flex gap-4 border border-neutral-800 rounded-2xl p-6 bg-neutral-950/50">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                    <Icon size={16} className="text-neutral-400" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1">Step {n}</p>
                  <p className="font-semibold text-sm mb-1.5">{title}</p>
                  <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Referral CTA ─────────────────────────────────────────────────── */}
      <section className="px-6 py-16 border-t border-neutral-800/50">
        <div className="max-w-3xl mx-auto">
          <div className="border border-yellow-900/60 bg-yellow-950/20 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-yellow-950 border border-yellow-900 flex items-center justify-center shrink-0">
              <Gift size={24} className="text-yellow-400" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-lg text-yellow-100">Refer friends, earn credits</h3>
              <p className="text-sm text-yellow-200/60 mt-1">
                Share your referral link after signing up. Every friend who joins gives you <strong className="text-yellow-300">50 bonus credits</strong>.
                They start with 300 credits, you earn 50 — everyone wins.
              </p>
            </div>
            <Link href="/signup" className="shrink-0 bg-yellow-400 text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-yellow-300 transition whitespace-nowrap">
              Sign up &amp; invite
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="px-6 py-24 border-t border-neutral-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-medium mb-3">Pricing</p>
            <h2 className="text-4xl font-bold tracking-tight">Pay for what you send</h2>
            <p className="text-neutral-400 mt-3">No subscriptions. No monthly fees. Top up credits when you need them via UPI, GPay, or card.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PACKAGES.map(pkg => (
              <div key={pkg.name} className={`relative rounded-2xl p-6 flex flex-col gap-5 border transition ${
                pkg.popular
                  ? "border-white/20 bg-white/5 shadow-[0_0_60px_rgba(255,255,255,0.06)]"
                  : "border-neutral-800 bg-neutral-950/50"
              }`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-white text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Most popular
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-neutral-300">{pkg.name}</p>
                  <p className="text-4xl font-bold mt-2 tracking-tight">{pkg.price}</p>
                  <p className="text-xs text-neutral-500 mt-1">{pkg.credits} credits</p>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {pkg.perks.map(p => (
                    <li key={p} className="flex items-center gap-2 text-xs text-neutral-400">
                      <Check size={12} className="text-green-400 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center transition flex items-center justify-center gap-1 ${
                    pkg.popular
                      ? "bg-white text-black hover:bg-neutral-100"
                      : "border border-neutral-700 hover:border-neutral-500 text-neutral-300"
                  }`}
                >
                  Get started <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-neutral-600">
            {["Pay via UPI / GPay / PhonePe", "No subscription ever", "Credits never expire", "300 credits free on signup"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check size={11} className="text-neutral-700" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-neutral-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-medium mb-3">Social proof</p>
            <h2 className="text-4xl font-bold tracking-tight">People getting interviews</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, text }) => (
              <div key={name} className="border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4 bg-neutral-950/50">
                <div className="flex gap-0.5">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Credit cost reference ─────────────────────────────────────────── */}
      <section className="px-6 py-16 border-t border-neutral-800/50">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-6 text-center">Credit costs</h3>
          <div className="border border-neutral-800 rounded-xl overflow-hidden">
            {[
              { action: "Send 1 personalised email",          cost: "3 credits" },
              { action: "Generate template from resume (AI)", cost: "4 credits" },
              { action: "Unlock 1 recruiter contact",         cost: "3–5 credits" },
              { action: "Bulk send batch (10 emails)",        cost: "25 credits" },
              { action: "First email ever (signup bonus)",    cost: "Free" },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/50 last:border-0">
                <span className="text-sm text-neutral-300">{row.action}</span>
                <span className="text-sm font-medium text-neutral-500">{row.cost}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-neutral-800/50">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-8">
          <div className="relative">
            <div className="absolute inset-0 -z-10 w-[500px] h-[300px] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 bg-indigo-500/10 rounded-full blur-3xl" />
            <h2 className="text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
              Start reaching out today
            </h2>
          </div>
          <p className="text-neutral-400 text-lg max-w-xl">
            300 free credits. No card. No subscription. Just upload your resume and start landing interviews.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link
              href="/signup"
              className="bg-white text-black px-10 py-3.5 rounded-xl font-bold hover:bg-neutral-100 transition text-base flex items-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
            >
              Create free account
              <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="text-sm text-neutral-500 hover:text-neutral-300 transition">
              Already have an account →
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-neutral-600">
            {["300 free credits", "No credit card", "UPI / GPay supported", "Real email required"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check size={11} className="text-neutral-700" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-800/50 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
              <Mail size={11} className="text-black" />
            </div>
            <span className="font-bold text-sm">kannectt</span>
            <span className="text-neutral-700 text-xs ml-2">AI-powered job outreach</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-neutral-600">
            <Link href="/login"  className="hover:text-neutral-400 transition">Sign in</Link>
            <Link href="/signup" className="hover:text-neutral-400 transition">Sign up</Link>
            <a href="#features"  className="hover:text-neutral-400 transition">Features</a>
            <a href="#pricing"   className="hover:text-neutral-400 transition">Pricing</a>
          </div>
          <p className="text-xs text-neutral-700">© 2026 kannectt. Built for job seekers.</p>
        </div>
      </footer>

    </main>
  );
}
