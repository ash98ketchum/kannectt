import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-4xl font-bold tracking-tight">ReachOut</h1>
      <p className="text-neutral-400 text-lg text-center max-w-md">
        AI-personalised job application emails. Upload once, send everywhere.
      </p>
      <div className="flex gap-4">
        <Link href="/signup" className="px-5 py-2 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition">
          Get Started — Free
        </Link>
        <Link href="/login" className="px-5 py-2 border border-neutral-700 rounded-lg hover:border-neutral-500 transition">
          Sign In
        </Link>
      </div>
    </main>
  );
}
