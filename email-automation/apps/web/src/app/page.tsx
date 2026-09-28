import Link from "next/link";
import { Mail, Zap, Users, Lock } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="border-b border-neutral-800 px-6 h-14 flex items-center justify-between">
        <span className="font-bold text-sm tracking-tight">ReachOut</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-neutral-400 hover:text-neutral-100 transition">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-white text-black px-4 py-1.5 rounded-lg font-medium hover:bg-neutral-200 transition"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 gap-8">
        <div className="inline-flex items-center gap-2 border border-neutral-800 rounded-full px-4 py-1.5 text-xs text-neutral-400">
          <Zap size={12} className="text-yellow-400" />
          Powered by Groq LLM — personalised in under 1 second
        </div>

        <h1 className="text-5xl font-bold tracking-tight max-w-2xl leading-tight">
          Send job applications that actually get replies
        </h1>

        <p className="text-neutral-400 text-lg max-w-xl">
          Upload your resume once. Our AI personalises your email for every company.
          Send to recruiters and careers pages in one click.
        </p>

        <div className="flex gap-4 items-center">
          <Link
            href="/signup"
            className="bg-white text-black px-6 py-2.5 rounded-lg font-semibold hover:bg-neutral-200 transition text-sm"
          >
            Start free — 1 email included
          </Link>
          <Link
            href="/dashboard"
            className="border border-neutral-700 px-6 py-2.5 rounded-lg hover:border-neutral-500 transition text-sm"
          >
            View demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-neutral-800 px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { icon: Mail,  title: "AI-personalised",  desc: "Each email tailored to the company and role" },
            { icon: Zap,   title: "1-click send",      desc: "Resume attached automatically every time" },
            { icon: Users, title: "Recruiter directory", desc: "Browse verified recruiter contacts by company" },
            { icon: Lock,  title: "Credit-based",      desc: "Pay only for what you send. Start free." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                <Icon size={14} className="text-neutral-400" />
              </div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-neutral-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
