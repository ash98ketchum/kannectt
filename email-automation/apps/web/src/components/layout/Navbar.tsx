import Link from "next/link";

const NAV = [
  { href: "/dashboard",  label: "Dashboard" },
  { href: "/directory",  label: "Directory" },
  { href: "/send",       label: "Send" },
  { href: "/credits",    label: "Credits" },
];

export default function Navbar() {
  return (
    <nav className="border-b border-neutral-800 bg-neutral-950 px-6 h-12 flex items-center gap-6">
      <span className="font-bold text-sm tracking-tight mr-4">ReachOut</span>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm text-neutral-400 hover:text-neutral-100 transition"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
