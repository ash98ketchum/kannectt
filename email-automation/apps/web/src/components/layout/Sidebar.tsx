"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Send, CreditCard, Gift, LogOut, Mail, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard",  label: "Dashboard",    icon: LayoutDashboard },
  { href: "/directory",  label: "Directory",    icon: BookOpen },
  { href: "/send",       label: "Send",         icon: Send },
  { href: "/credits",    label: "Credits",      icon: CreditCard },
  { href: "/referral",   label: "Refer & Earn", icon: Gift },
  { href: "/settings",   label: "Gmail Setup",  icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="w-56 shrink-0 border-r border-[#1E1C17] flex flex-col h-screen sticky top-0 bg-[#0D0C09]">

      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[#1E1C17]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-cream-300 rounded flex items-center justify-center">
            <Mail size={12} className="text-[#0A0905]" />
          </div>
          <span className="font-display text-lg text-[#E8DDD0] tracking-wide font-medium">kannectt</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5 pt-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition",
                active
                  ? "bg-cream-300/10 text-cream-300 font-medium"
                  : "text-[#6B6456] hover:text-[#E8DDD0] hover:bg-[#1A1915]"
              )}
            >
              <Icon size={14} className={active ? "text-cream-300" : ""} />
              {label}
              {href === "/referral" && (
                <span className="ml-auto text-[9px] font-bold text-cream-300 bg-cream-300/10 border border-cream-300/20 px-1.5 py-0.5 rounded-full">
                  +50
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#1E1C17]">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#3D3A33] hover:text-[#E8DDD0] hover:bg-[#1A1915] transition"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
