"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Send, CreditCard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/directory",  label: "Directory",  icon: BookOpen },
  { href: "/send",       label: "Send",       icon: Send },
  { href: "/credits",    label: "Credits",    icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 shrink-0 border-r border-neutral-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-neutral-800">
        <span className="font-bold text-sm tracking-tight">ReachOut</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
              pathname === href
                ? "bg-neutral-800 text-neutral-100 font-medium"
                : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900"
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-neutral-800">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 transition">
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
