export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#0A0905]">
      <div className="w-full max-w-md">

        {/* Wordmark */}
        <div className="mb-10">
          <span className="font-display text-cream-300 text-sm tracking-[0.25em] uppercase font-medium">
            kannectt
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}
