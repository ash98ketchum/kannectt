export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-bold text-lg tracking-tight">ReachOut</span>
          <p className="text-neutral-500 text-xs mt-1">by Kannectt</p>
        </div>
        {children}
      </div>
    </div>
  );
}
