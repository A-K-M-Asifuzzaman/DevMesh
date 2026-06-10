import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "#features", label: "Features" },
  { href: "#matching", label: "AI Matching" },
  { href: "#pricing", label: "Pricing" },
];

export function MarketingNav() {
  const nav = useNavigate();
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="fixed inset-x-0 top-3 z-50 mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-2xl border border-white/10 bg-ink-950/60 px-4 py-2.5 backdrop-blur-xl"
    >
      <Link to="/">
        <Logo />
      </Link>
      <nav className="hidden items-center gap-1 md:flex">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            {l.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => nav("/login")}>
          Log in
        </Button>
        <Button size="sm" onClick={() => nav("/signup")}>
          Get started
        </Button>
      </div>
    </motion.header>
  );
}
