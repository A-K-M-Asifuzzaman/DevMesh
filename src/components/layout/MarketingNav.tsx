import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#matching", label: "AI Matching" },
  { href: "#pricing", label: "Pricing" },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="grid h-8 w-8 place-items-center rounded-lg text-white/30 transition-colors hover:text-white/70"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function MarketingNav() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const scrollTo = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="fixed inset-x-0 top-4 z-50 mx-auto max-w-5xl px-4 sm:px-5"
      >
        <div
          className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-2.5"
          style={{
            background: "rgba(0,0,0,0.82)",
            borderColor: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px)",
          }}
        >
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => { e.preventDefault(); scrollTo(l.href); }}
                className="rounded-lg px-3.5 py-2 text-sm text-white/40 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <button
              onClick={() => nav("/login")}
              className="rounded-lg px-3.5 py-2 text-sm text-white/40 transition-colors hover:text-white"
            >
              Log in
            </button>
            <Button variant="white" size="sm" onClick={() => nav("/signup")}>
              Get started
            </Button>
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              className="grid h-8 w-8 place-items-center rounded-lg text-white/40 transition-colors hover:text-white"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-4 top-[4.5rem] z-40 rounded-2xl border p-3 md:hidden"
            style={{
              background: "rgba(5,5,5,0.97)",
              borderColor: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(24px)",
            }}
          >
            <nav className="flex flex-col">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => { e.preventDefault(); scrollTo(l.href); }}
                  className="rounded-xl px-4 py-3 text-sm text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-3">
              <Button variant="outline" size="sm" className="w-full" onClick={() => { setOpen(false); nav("/login"); }}>
                Log in
              </Button>
              <Button variant="white" size="sm" className="w-full" onClick={() => { setOpen(false); nav("/signup"); }}>
                Get started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
