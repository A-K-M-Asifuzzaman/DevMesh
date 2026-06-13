import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, Users, MessageSquare, Rocket, Trophy,
  Search, Github, Check, Globe, Code2, ChevronDown, Zap, Shield,
  Kanban, X, Star, Mail,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Logo } from "@/components/ui/Logo";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { DevUser } from "@/types";

gsap.registerPlugin(ScrollTrigger);

/* ── Animation presets ────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ── Feature detail modal data ─────────────────────────────────────── */
const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Team Matchmaking",
    desc: "Compatibility scored on skills, stack, and ambition — not just keywords.",
    detail: "Our RAG-powered engine embeds every profile into a vector space and ranks matches by cosine similarity weighted for complementarity. You see WHY you match, not just that you do.",
    link: "#matching",
    linkLabel: "See how matching works",
    span: "md:col-span-2",
    accent: "from-[#00d9ff]/15 to-transparent",
  },
  {
    icon: Search,
    title: "Semantic Search",
    desc: "Find people by what they can build, powered by vector embeddings.",
    detail: "Type what you need — 'someone who can build real-time WebSocket APIs' — and get ranked results, not keyword matches.",
    link: "#matching",
    linkLabel: "Try semantic search",
    span: "",
    accent: "from-[#4d7fff]/12 to-transparent",
  },
  {
    icon: Kanban,
    title: "Team Workspaces",
    desc: "Kanban, tasks, shared notes, and real-time presence in one place.",
    detail: "Every team gets a Jira-style board with To Do → In Progress → Review → Done columns, assignees, and priority labels. No extra tools needed.",
    link: "/teams",
    linkLabel: "Go to Teams",
    span: "",
    accent: "from-[#00d9ff]/10 to-transparent",
  },
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    desc: "Typing indicators, reactions, and notifications via Socket.io.",
    detail: "Team chats and direct messages update in real-time. Message reactions, read receipts, and push notifications keep everyone in sync.",
    link: "/chat",
    linkLabel: "Open chat",
    span: "",
    accent: "from-[#4d7fff]/12 to-transparent",
  },
  {
    icon: Rocket,
    title: "Startup Builder",
    desc: "Post an idea, recruit cofounders, find your missing skill.",
    detail: "Post your startup idea, define the roles you need, and let AI surface matched builders. Accept or reject applications, all in one flow.",
    link: "/startups",
    linkLabel: "Post an idea",
    span: "",
    accent: "from-[#00d9ff]/10 to-transparent",
  },
  {
    icon: Trophy,
    title: "Hackathon Mode",
    desc: "Assemble a balanced team in under 60 seconds.",
    detail: "Filter by availability, timezone, and skill gaps. Post a hackathon idea and watch applications roll in from developers ready to hack.",
    link: "/startups",
    linkLabel: "Find a team",
    span: "md:col-span-2",
    accent: "from-[#4d7fff]/12 to-transparent",
  },
] as const;

const steps = [
  { num: "01", icon: Code2, title: "Build your profile",  desc: "AI indexes your skills, projects, and goals into a vector profile for precise matching." },
  { num: "02", icon: Sparkles, title: "Get AI-matched",   desc: "Our engine ranks developers by complementarity — you get teammates who fill your gaps." },
  { num: "03", icon: Rocket, title: "Build together",     desc: "Shared workspace with tasks, Kanban, and real-time chat. Everything in one place." },
] as const;

const testimonials = [
  { quote: "DevMesh found me a cofounder with exactly the skills I was missing. We shipped our MVP in 6 weeks.", name: "Sarah Chen",     role: "CEO @ BuildFast",    initials: "SC", stars: 5 },
  { quote: "The AI matching is scary accurate. My hackathon team had zero skill overlap — we won first place.",  name: "Marcus Johnson", role: "Full-Stack Dev",     initials: "MJ", stars: 5 },
  { quote: "I went from solo dev to a team of 4 in under a week. The compatibility scores just work.",           name: "Priya Sharma",   role: "Tech Lead @ StartAI", initials: "PS", stars: 5 },
];

const stats = [
  { value: "40K+",  label: "Developers" },
  { value: "200K+", label: "AI Matches" },
  { value: "95%",   label: "Satisfaction" },
  { value: "500+",  label: "Teams Formed" },
];

const useCases = [
  { icon: Trophy,  title: "Hackathon Teams",     desc: "Assemble a balanced team in under 60 seconds — filtered by availability, timezone, and skill gaps.",          tag: "60-second teams" },
  { icon: Rocket,  title: "Startup Cofounders",  desc: "Post your idea, define what you need, and AI surfaces matched builders with complementary skills.",            tag: "Cofounder matching" },
  { icon: Globe,   title: "Remote Collaboration", desc: "Timezone-aware matching for distributed teams. Real-time workspaces keep everyone aligned.",                  tag: "Async-first" },
] as const;

const tiers = [
  { name: "Free",    price: "$0",  tag: "For exploring",      highlight: false, cta: "Start free",   features: ["Public profile", "5 AI matches / mo", "Join 1 team", "Community search"] },
  { name: "Pro",     price: "$12", tag: "For builders",       highlight: true,  cta: "Go Pro",       features: ["Unlimited AI matches", "Semantic search", "Unlimited teams", "Profile analytics", "Priority in discovery"] },
  { name: "Startup", price: "$49", tag: "For founding teams", highlight: false, cta: "Scale up",     features: ["Everything in Pro", "Cofounder matching", "Recruiter visibility stats", "Team workspace seats", "AI idea generation"] },
];

const faqs = [
  { q: "How does the AI matching work?",      a: "We embed every developer profile into a high-dimensional vector space. Matches are ranked by cosine similarity weighted for complementarity — you get teammates who fill your gaps, not clones of your resume." },
  { q: "Is DevMesh free to start?",            a: "Yes. The free tier includes a public profile, 5 AI matches per month, and access to one team workspace. Pro unlocks unlimited matches, semantic search, and multiple teams." },
  { q: "Can I use DevMesh for hackathons?",    a: "Absolutely — Hackathon Mode is one of our most popular features. Filter by skill, availability, and timezone, then form a balanced team in under 60 seconds." },
  { q: "How is this different from LinkedIn?", a: "LinkedIn is built for networking and job hunting. DevMesh is built for building — cofounder search, hackathon teams, and project workspaces with real collaboration tools." },
  { q: "What is the Trust Score?",             a: "A composite signal of profile completeness, verified projects, peer endorsements, and collaboration history. It helps teammates gauge reliability before connecting." },
];

const footerLinks = {
  Product: [
    { label: "Features",     href: "#features",    type: "scroll" as const },
    { label: "How it works", href: "#how-it-works", type: "scroll" as const },
    { label: "AI Matching",  href: "#matching",     type: "scroll" as const },
    { label: "Pricing",      href: "#pricing",      type: "scroll" as const },
  ],
  Company: [
    { label: "About",   href: "#cta",                   type: "scroll" as const },
    { label: "Blog",    href: "https://github.com",      type: "external" as const },
    { label: "Careers", href: "#cta",                   type: "scroll" as const },
    { label: "Contact", href: "mailto:hello@devmesh.ai", type: "external" as const },
  ],
  Legal: [
    { label: "Privacy",  href: "#faq", type: "scroll" as const },
    { label: "Terms",    href: "#faq", type: "scroll" as const },
    { label: "Security", href: "#faq", type: "scroll" as const },
  ],
};

/* ── Section typography helpers ───────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#00d9ff]/50">
      {children}
    </p>
  );
}
function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
      {children}
    </h2>
  );
}
function Sub({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/35 sm:text-base">{children}</p>;
}

/* ── FAQ accordion ────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.05] last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-white/65 transition-colors hover:text-white">{q}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-white/20 transition-transform duration-300",
            open && "rotate-180 text-[#00d9ff]/50",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-white/30">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Hero product preview ─────────────────────────────────────────── */
const DEMO_DEVS = [
  { initials: "AR", name: "Alex Rivera",  role: "ML Engineer",    score: 94, stack: ["PyTorch","FastAPI"], color: "#00d9ff" },
  { initials: "JK", name: "Jordan Kim",   role: "Frontend Lead",  score: 89, stack: ["React","TypeScript"], color: "#4d7fff" },
  { initials: "SO", name: "Sam Okafor",   role: "DevOps & Cloud", score: 87, stack: ["K8s","AWS"], color: "#00d9ff" },
];

function HeroPreview({ featured }: { featured: DevUser[] }) {
  const devs = featured.length >= 3
    ? featured.slice(0, 3).map((u, i) => ({
        initials: u.name.split(" ").map((n) => n[0]).join(""),
        name: u.name,
        role: u.role || "Developer",
        score: u.trustScore,
        stack: u.stack?.slice(0, 2) ?? [],
        color: i % 2 === 0 ? "#00d9ff" : "#4d7fff",
      }))
    : DEMO_DEVS;

  return (
    <div className="relative">
      {/* Outer atmospheric glow */}
      <div
        className="absolute -inset-4 rounded-3xl opacity-40"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,217,255,0.08) 0%, transparent 70%)" }}
      />

      {/* Window chrome */}
      <div
        className="relative overflow-hidden rounded-2xl border"
        style={{
          background: "rgba(4,4,4,0.96)",
          borderColor: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 0 1px rgba(0,217,255,0.06), 0 32px 80px rgba(0,0,0,0.9)",
        }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.05] px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-white/[0.07]" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/[0.07]" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/[0.07]" />
          </div>
          <div className="mx-3 flex-1">
            <div className="mx-auto h-5 max-w-[200px] rounded-md bg-white/[0.04] flex items-center px-2.5">
              <span className="text-[10px] text-white/20">devmesh.ai / discover</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00d9ff] animate-pulse" />
            <span className="text-[10px] text-[#00d9ff]/60">Live</span>
          </div>
        </div>

        {/* App shell */}
        <div className="flex min-h-[280px]">
          {/* Sidebar */}
          <div className="hidden sm:flex w-10 flex-col items-center gap-3 border-r border-white/[0.04] py-4">
            {[Sparkles, Users, MessageSquare, Kanban, Rocket].map((Icon, i) => (
              <div
                key={i}
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-lg transition",
                  i === 0
                    ? "bg-[#00d9ff]/[0.1] text-[#00d9ff]/70"
                    : "text-white/15",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            ))}
          </div>

          {/* Main panel */}
          <div className="flex-1 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-white/50">AI Matches</span>
              <span className="rounded-full bg-[#00d9ff]/[0.07] border border-[#00d9ff]/15 px-2 py-0.5 text-[10px] text-[#00d9ff]/60">
                {devs.length} found
              </span>
            </div>

            <div className="space-y-2">
              {devs.map((dev, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.18, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.04] transition cursor-pointer group"
                >
                  <div
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[10px] font-bold"
                    style={{
                      background: `${dev.color}14`,
                      borderColor: `${dev.color}25`,
                      color: `${dev.color}99`,
                    }}
                  >
                    {dev.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-white truncate">{dev.name}</p>
                    <p className="text-[11px] text-white/30 truncate">{dev.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex gap-1">
                      {dev.stack.map((s) => (
                        <span key={s} className="rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[9px] text-white/25">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div
                      className="rounded-lg border px-2 py-0.5 text-xs font-bold"
                      style={{
                        background: `${dev.color}0d`,
                        borderColor: `${dev.color}20`,
                        color: `${dev.color}cc`,
                      }}
                    >
                      {dev.score}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Match reasons */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="mt-3 rounded-xl border border-[#00d9ff]/10 bg-[#00d9ff]/[0.03] p-3"
            >
              <p className="mb-1.5 text-[10px] font-semibold text-[#00d9ff]/50 uppercase tracking-wider">Why matched</p>
              <div className="space-y-1">
                {["Shared: TypeScript, Docker, AWS", "Complementary: ML + Frontend expertise", "Both available for new projects"].map((r, i) => (
                  <p key={i} className="flex items-center gap-2 text-[11px] text-white/30">
                    <Check className="h-2.5 w-2.5 text-[#00d9ff]/50 shrink-0" />
                    {r}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Feature card with modal ──────────────────────────────────────── */
function FeatureCard({ feature }: { feature: typeof FEATURES[number] }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const Icon = feature.icon;

  const handleAction = () => {
    setOpen(false);
    if (feature.link.startsWith("#")) {
      const el = document.querySelector(feature.link);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(feature.link);
    }
  };

  return (
    <>
      <div className={cn("f-card", feature.span)}>
        <button
          onClick={() => setOpen(true)}
          className="w-full h-full text-left"
        >
          <GlassCard
            interactive
            className={cn(
              "h-full relative overflow-hidden group cursor-pointer",
              "transition-all duration-300",
            )}
          >
            {/* Gradient bg on hover */}
            <div
              className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                `bg-gradient-to-br ${feature.accent}`,
              )}
            />
            <div className="relative">
              {/* Icon */}
              <div className="mb-5 grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04] group-hover:border-[#00d9ff]/20 group-hover:bg-[#00d9ff]/[0.05] transition-all duration-300">
                <Icon className="h-4 w-4 text-white/40 group-hover:text-[#00d9ff]/70 transition-colors duration-300" />
              </div>
              <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/35">{feature.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-white/20 group-hover:text-[#00d9ff]/50 transition-colors duration-300">
                Learn more <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-300" />
              </div>
            </div>
          </GlassCard>
        </button>
      </div>

      {/* Feature detail modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md"
            >
              <GlassCard glow className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#00d9ff]/20 bg-[#00d9ff]/[0.07]">
                    <Icon className="h-5 w-5 text-[#00d9ff]/70" />
                  </div>
                  <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white transition mt-0.5">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">{feature.detail}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button className="flex-1" onClick={handleAction}>
                    {feature.linkLabel} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Main component ───────────────────────────────────────────────── */
export default function Landing() {
  const [featured, setFeatured] = useState<DevUser[]>([]);
  const featuresRef = useRef<HTMLElement>(null);
  const pricingRef  = useRef<HTMLElement>(null);
  const stepsRef    = useRef<HTMLElement>(null);

  useEffect(() => { api.featuredUsers().then(setFeatured).catch(() => {}); }, []);

  useEffect(() => {
    const s = featuresRef.current;
    if (!s) return;
    gsap.fromTo(
      s.querySelectorAll(".f-card"),
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out",
        scrollTrigger: { trigger: s, start: "top 80%", once: true } },
    );
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  useEffect(() => {
    const s = pricingRef.current;
    if (!s) return;
    gsap.fromTo(
      s.querySelectorAll(".p-card"),
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: s, start: "top 80%", once: true } },
    );
  }, []);

  useEffect(() => {
    const s = stepsRef.current;
    if (!s) return;
    gsap.fromTo(
      s.querySelectorAll(".s-card"),
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.14, ease: "power3.out",
        scrollTrigger: { trigger: s, start: "top 80%", once: true } },
    );
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <MarketingNav />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HERO                                                          */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-36 sm:pb-24 sm:pt-44 sm:px-6">
        {/* Radial glow behind hero */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: "900px", height: "600px",
            background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,217,255,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Text */}
          <div>
            {/* Badge */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="show" custom={0}
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs text-white/40"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#00d9ff] shadow-[0_0_6px_#00d9ff]" />
              RAG-powered developer matching
              <span className="ml-1 rounded-full bg-[#00d9ff]/[0.1] border border-[#00d9ff]/20 px-2 py-0.5 text-[#00d9ff]/70 text-[10px] font-semibold">
                New
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp} initial="hidden" animate="show" custom={1}
              className="font-display text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[1.03] tracking-tight text-white"
            >
              Where developers
              <br />
              find{" "}
              <span
                style={{
                  background: "linear-gradient(110deg,#00d9ff 0%,#4d7fff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                their people.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp} initial="hidden" animate="show" custom={2}
              className="mt-6 max-w-lg text-base leading-relaxed text-white/40 sm:text-lg"
            >
              AI-powered compatibility matching across skills, stack, and ambition.
              Find cofounders, teammates, and collaborators who actually complement you.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="show" custom={3}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 font-semibold">
                  Build your mesh
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  <Github className="h-4 w-4" /> Continue with GitHub
                </Button>
              </Link>
            </motion.div>

            {/* Social proof mini */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="show" custom={4}
              className="mt-8 flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {["MR","AK","JL","SP","TC"].map((initials) => (
                  <div
                    key={initials}
                    className="grid h-7 w-7 place-items-center rounded-full border border-black text-[9px] font-bold text-white/60"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400/60 text-yellow-400/60" />
                  ))}
                </div>
                <p className="text-[11px] text-white/25">Loved by 40,000+ developers</p>
              </div>
            </motion.div>
          </div>

          {/* Right: Product preview */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="relative lg:block"
          >
            <HeroPreview featured={featured} />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* STATS STRIP                                                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section>
        <hr className="border-0 border-t border-white/[0.05]" />
        <div className="mx-auto grid max-w-5xl grid-cols-2 px-4 sm:grid-cols-4 sm:px-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className={cn(
                "flex flex-col items-center py-10 text-center",
                i < stats.length - 1 && "border-r border-white/[0.05]",
              )}
            >
              <span className="font-display text-3xl font-bold text-white sm:text-4xl">{s.value}</span>
              <span className="mt-1.5 text-xs uppercase tracking-[0.15em] text-white/25">{s.label}</span>
            </motion.div>
          ))}
        </div>
        <hr className="border-0 border-t border-white/[0.05]" />
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* FEATURES                                                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section ref={featuresRef} id="features" className="mx-auto max-w-5xl px-4 py-24 sm:px-6 sm:py-32">
        <Label>The platform</Label>
        <H2>
          Everything a team needs,
          <br className="hidden sm:block" /> meshed together.
        </H2>
        <Sub>Profiles, matching, workspaces, chat, startups, hackathons — one surface. Click any card to explore.</Sub>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </section>

      <hr className="border-0 border-t border-white/[0.05] mx-auto max-w-5xl" />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section ref={stepsRef} id="how-it-works" className="mx-auto max-w-5xl px-4 py-24 sm:px-6 sm:py-32">
        <Label>Process</Label>
        <H2>From profile to team in minutes.</H2>
        <Sub>Three steps. No resume screening. No cold DMs.</Sub>

        <div className="relative mt-12 grid gap-4 sm:grid-cols-3">
          {/* Connecting line (desktop) */}
          <div className="pointer-events-none absolute inset-x-0 top-14 hidden h-px sm:block"
            style={{ background: "linear-gradient(90deg, transparent 8%, rgba(0,217,255,0.15) 30%, rgba(77,127,255,0.15) 70%, transparent 92%)" }}
          />

          {steps.map((s, i) => (
            <div key={s.num} className="s-card relative">
              <GlassCard className="h-full" glow={i === 1}>
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#00d9ff]/50">{s.num}</span>
                  {/* Dot on the connecting line */}
                  <div className="h-2 w-2 rounded-full border border-[#00d9ff]/30 bg-[#00d9ff]/[0.15]" />
                </div>
                <div className="mb-5 grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04]">
                  <s.icon className="h-4 w-4 text-white/40" />
                </div>
                <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/35">{s.desc}</p>
              </GlassCard>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-0 border-t border-white/[0.05] mx-auto max-w-5xl" />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* AI MATCHING                                                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section id="matching" className="mx-auto max-w-5xl px-4 py-24 sm:px-6 sm:py-32">
        <GlassCard glow className="relative overflow-hidden grid items-center gap-8 p-6 sm:p-10 md:grid-cols-2 md:p-14">
          {/* Background accent */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,217,255,0.05) 0%, transparent 70%)" }}
          />

          <div className="relative">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#00d9ff]/15 bg-[#00d9ff]/[0.06] px-3 py-1 text-xs font-medium text-[#00d9ff]">
              <Sparkles className="h-3 w-3" /> Compatibility engine
            </span>
            <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
              Matching that understands
              <br />
              <span style={{ background: "linear-gradient(110deg,#00d9ff,#4d7fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                how you build.
              </span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/40">
              Every profile is embedded into a vector space and scored on shared stack,
              complementary skills, availability, and goals — with the <em>why</em> explained.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Vector embeddings of skills & projects",
                "RAG explanations for every match",
                "Cofounder & hackathon team modes",
              ].map((x) => (
                <li key={x} className="flex items-center gap-3 text-sm text-white/50">
                  <div className="h-5 w-5 shrink-0 grid place-items-center rounded-md bg-[#00d9ff]/[0.08] border border-[#00d9ff]/15">
                    <Check className="h-3 w-3 text-[#00d9ff]/70" />
                  </div>
                  {x}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="mt-8 inline-block">
              <Button size="md" className="gap-2">
                Try it free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Match cards */}
          <div className="relative space-y-2.5">
            {(featured.length ? featured.slice(0, 3) : [
              { id: "a", name: "Alex Rivera",  role: "ML Engineer",    trustScore: 94 },
              { id: "b", name: "Jordan Kim",   role: "Frontend Lead",  trustScore: 89 },
              { id: "c", name: "Sam Okafor",   role: "DevOps & Cloud", trustScore: 87 },
            ] as DevUser[]).map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] hover:border-white/[0.08] transition cursor-pointer"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#00d9ff]/20 bg-[#00d9ff]/[0.07] text-[11px] font-bold text-[#00d9ff]/70">
                  {u.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{u.name}</p>
                  <p className="truncate text-xs text-white/30">{u.role || "Developer"}</p>
                </div>
                <ScoreRing value={u.trustScore} size={44} />
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </section>

      <hr className="border-0 border-t border-white/[0.05] mx-auto max-w-5xl" />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TESTIMONIALS                                                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6 sm:py-32">
        <Label>Stories</Label>
        <H2>Builders who found their people.</H2>
        <Sub>Real teams. Real matches. Real products shipped.</Sub>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <GlassCard className="flex h-full flex-col">
                {/* Stars */}
                <div className="mb-4 flex gap-0.5">
                  {[...Array(t.stars)].map((_, si) => (
                    <Star key={si} className="h-3.5 w-3.5 fill-yellow-400/50 text-yellow-400/50" />
                  ))}
                </div>
                {/* Quote mark */}
                <div className="mb-2 font-serif text-3xl leading-none text-white/10">"</div>
                <blockquote className="flex-1 text-sm leading-relaxed text-white/40">
                  {t.quote}
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-white/[0.05] pt-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[11px] font-bold text-white/50">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/25">{t.role}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <hr className="border-0 border-t border-white/[0.05] mx-auto max-w-5xl" />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* USE CASES                                                     */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6 sm:py-32">
        <Label>Use cases</Label>
        <H2>Built for every kind of builder.</H2>
        <Sub>Whether you're hacking, founding, or shipping open source.</Sub>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {useCases.map((u, i) => (
            <motion.div
              key={u.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link to="/signup">
                <GlassCard interactive className="h-full group cursor-pointer">
                  <div className="mb-4 grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04] group-hover:border-[#00d9ff]/20 group-hover:bg-[#00d9ff]/[0.05] transition-all duration-300">
                    <u.icon className="h-4 w-4 text-white/40 group-hover:text-[#00d9ff]/70 transition-colors duration-300" />
                  </div>
                  <span className="mb-3 inline-block rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-white/30">
                    {u.tag}
                  </span>
                  <h3 className="text-sm font-semibold text-white">{u.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/35">{u.desc}</p>
                  <div className="mt-5 flex items-center gap-1 text-xs text-white/20 group-hover:text-[#00d9ff]/50 transition-colors duration-300">
                    Get started <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <hr className="border-0 border-t border-white/[0.05] mx-auto max-w-5xl" />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TRUST PILLARS                                                 */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Shield, title: "Verified profiles",   desc: "GitHub & LinkedIn verification keeps the community high-signal and spam-free." },
            { icon: Zap,    title: "Instant matching",    desc: "AI match results in seconds. No waiting rooms, no manual screening." },
            { icon: Search, title: "Transparent scoring", desc: "Every match shows a full breakdown of why you're compatible — no black boxes." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300"
            >
              <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04]">
                <item.icon className="h-4 w-4 text-white/35" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/30">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <hr className="border-0 border-t border-white/[0.05] mx-auto max-w-5xl" />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* PRICING                                                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section ref={pricingRef} id="pricing" className="mx-auto max-w-5xl px-4 py-24 sm:px-6 sm:py-32">
        <Label>Pricing</Label>
        <H2>Start free. Scale when you ship.</H2>
        <Sub>No credit card required. Cancel anytime.</Sub>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className="p-card">
              <GlassCard
                className={cn(
                  "flex h-full flex-col",
                  t.highlight &&
                    "border-[#00d9ff]/20 shadow-[0_0_0_1px_rgba(0,217,255,0.1),0_0_60px_-12px_rgba(0,217,255,0.2)]",
                )}
              >
                {t.highlight && (
                  <span className="mb-4 inline-block rounded-full border border-[#00d9ff]/20 bg-[#00d9ff]/[0.07] px-2.5 py-0.5 text-[10px] font-semibold text-[#00d9ff]">
                    Most popular
                  </span>
                )}
                <p className="text-xs text-white/30">{t.tag}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-white">{t.price}</span>
                  <span className="text-sm text-white/20">/mo</span>
                </div>
                <p className="mt-1 text-sm font-semibold"
                  style={{
                    background: "linear-gradient(110deg,#00d9ff,#4d7fff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {t.name}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/40">
                      <div className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded bg-[#00d9ff]/[0.07]">
                        <Check className="h-2.5 w-2.5 text-[#00d9ff]/70" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className="mt-8">
                  <Button
                    variant={t.highlight ? "primary" : "outline"}
                    className="w-full"
                  >
                    {t.cta}
                  </Button>
                </Link>
              </GlassCard>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-0 border-t border-white/[0.05] mx-auto max-w-5xl" />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* FAQ                                                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section id="faq" className="mx-auto max-w-2xl px-4 py-24 sm:px-6 sm:py-32">
        <Label>FAQ</Label>
        <H2>Questions, answered.</H2>
        <div className="mt-10">
          {faqs.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      <hr className="border-0 border-t border-white/[0.05]" />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* CTA                                                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section id="cta" className="relative mx-auto max-w-5xl px-4 py-32 text-center sm:px-6">
        {/* Glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "600px", height: "400px",
            background: "radial-gradient(ellipse, rgba(0,217,255,0.07) 0%, transparent 70%)",
          }}
        />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Your next cofounder is
          <br />
          <span style={{ background: "linear-gradient(110deg,#00d9ff,#4d7fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            one match away.
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="relative mt-5 text-base text-white/30"
        >
          Join 40,000+ developers already building their mesh. No credit card required.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="relative mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Link to="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 px-8 sm:w-auto font-semibold">
              Get started — it's free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Log in
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.05]">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            <div className="sm:col-span-2 md:col-span-1">
              <Logo />
              <p className="mt-3 max-w-[200px] text-sm leading-relaxed text-white/25">
                AI-powered developer collaboration. Find your team, build your startup.
              </p>
              <a
                href="https://github.com" target="_blank" rel="noopener noreferrer"
                aria-label="GitHub"
                className="mt-5 inline-grid h-8 w-8 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/30 transition-colors hover:border-white/[0.12] hover:text-white/60"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>

            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/20">{group}</p>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l.label}>
                      {l.type === "external" ? (
                        <a
                          href={l.href}
                          target={l.href.startsWith("mailto") ? undefined : "_blank"}
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-white/30 transition-colors hover:text-white/70"
                        >
                          {l.label}
                          {!l.href.startsWith("mailto") && (
                            <ArrowRight className="h-2.5 w-2.5 rotate-[-45deg]" />
                          )}
                          {l.href.startsWith("mailto") && <Mail className="h-2.5 w-2.5" />}
                        </a>
                      ) : (
                        <button
                          onClick={() => scrollTo(l.href)}
                          className="text-sm text-white/30 transition-colors hover:text-white/70"
                        >
                          {l.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.05] pt-8 text-xs text-white/20 sm:flex-row">
            <p>© {new Date().getFullYear()} DevMesh AI. Built for builders.</p>
            <p>Made with care for the developer community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
