import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, Users, MessageSquare, Rocket, Trophy,
  Search, Github, Check, Globe, Code2, ChevronDown, Zap, Shield,
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

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] },
  }),
};

/* ── Data ── */
const features = [
  { icon: Sparkles, title: "AI Team Matchmaking",  desc: "Compatibility scored on skills, stack, and ambition — not just keywords.", span: "md:col-span-2" },
  { icon: Search,   title: "Semantic Search",       desc: "Find people by what they can build, powered by vector embeddings.", span: "" },
  { icon: Users,    title: "Team Workspaces",       desc: "Kanban, tasks, shared notes, and real-time presence in one place.", span: "" },
  { icon: MessageSquare, title: "Real-time Chat",  desc: "Typing indicators, reactions, and notifications via Socket.io.", span: "" },
  { icon: Rocket,   title: "Startup Builder",       desc: "Post an idea, recruit cofounders, find your missing skill.", span: "" },
  { icon: Trophy,   title: "Hackathon Mode",        desc: "Assemble a balanced team in under 60 seconds.", span: "md:col-span-2" },
] as const;

const steps = [
  { num: "01", icon: Code2,     title: "Build your profile",  desc: "AI indexes your skills, projects, and goals into a vector profile for precise matching." },
  { num: "02", icon: Sparkles,  title: "Get AI-matched",      desc: "Our engine ranks developers by complementarity — you get teammates who fill your gaps." },
  { num: "03", icon: Rocket,    title: "Build together",      desc: "Shared workspace with tasks, Kanban, and real-time chat. Everything in one place." },
] as const;

const testimonials = [
  { quote: "DevMesh found me a cofounder with exactly the skills I was missing. We shipped our MVP in 6 weeks.", name: "Sarah Chen",     role: "CEO @ BuildFast",   initials: "SC" },
  { quote: "The AI matching is scary accurate. My hackathon team had zero skill overlap — we won first place.",  name: "Marcus Johnson", role: "Full-Stack Dev",    initials: "MJ" },
  { quote: "I went from solo dev to a team of 4 in under a week. The compatibility scores just work.",           name: "Priya Sharma",   role: "Tech Lead @ StartAI", initials: "PS" },
];

const stats = [
  { value: "40K+",  label: "Developers" },
  { value: "200K+", label: "AI Matches" },
  { value: "95%",   label: "Satisfaction" },
  { value: "500+",  label: "Teams Formed" },
];

const useCases = [
  { icon: Trophy,  title: "Hackathon Teams",      desc: "Assemble a balanced team in under 60 seconds — filtered by availability, timezone, and skill gaps.", tag: "60-second teams" },
  { icon: Rocket,  title: "Startup Cofounders",   desc: "Post your idea, define what you need, and AI surfaces matched builders with complementary skills.",   tag: "Cofounder matching" },
  { icon: Globe,   title: "Remote Collaboration", desc: "Timezone-aware matching for distributed teams. Real-time workspaces keep everyone aligned.",          tag: "Async-first" },
] as const;

const tiers = [
  { name: "Free",    price: "$0",  tag: "For exploring",    highlight: false, cta: "Start free",  features: ["Public profile", "5 AI matches / mo", "Join 1 team", "Community search"] },
  { name: "Pro",     price: "$12", tag: "For builders",     highlight: true,  cta: "Go Pro",      features: ["Unlimited AI matches", "Semantic search", "Unlimited teams", "Profile analytics", "Priority in discovery"] },
  { name: "Startup", price: "$49", tag: "For founding teams", highlight: false, cta: "Scale up",  features: ["Everything in Pro", "Cofounder matching", "Recruiter visibility stats", "Team workspace seats", "AI idea generation"] },
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
    { label: "Features",    href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "AI Matching", href: "#matching" },
    { label: "Pricing",     href: "#pricing" },
  ],
  Company: [
    { label: "About",   href: "#" },
    { label: "Blog",    href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy",  href: "#" },
    { label: "Terms",    href: "#" },
    { label: "Security", href: "#" },
  ],
};

/* ── Icon container — monochromatic, premium ── */
const IC = ({ icon: Icon }: { icon: React.ElementType }) => (
  <div className="mb-5 grid h-8 w-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.04]">
    <Icon className="h-4 w-4 text-white/50" />
  </div>
);

/* ── Component ── */
export default function Landing() {
  const [featured, setFeatured] = useState<DevUser[]>([]);
  const featuresRef = useRef<HTMLElement>(null);
  const pricingRef  = useRef<HTMLElement>(null);
  const stepsRef    = useRef<HTMLElement>(null);

  useEffect(() => { api.featuredUsers().then(setFeatured).catch(() => {}); }, []);

  /* GSAP — features */
  useEffect(() => {
    const s = featuresRef.current;
    if (!s) return;
    gsap.fromTo(s.querySelectorAll(".f-card"),
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: s, start: "top 78%", once: true } });
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  /* GSAP — pricing */
  useEffect(() => {
    const s = pricingRef.current;
    if (!s) return;
    gsap.fromTo(s.querySelectorAll(".p-card"),
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: s, start: "top 80%", once: true } });
  }, []);

  /* GSAP — steps */
  useEffect(() => {
    const s = stepsRef.current;
    if (!s) return;
    gsap.fromTo(s.querySelectorAll(".s-card"),
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.14, ease: "power2.out",
        scrollTrigger: { trigger: s, start: "top 80%", once: true } });
  }, []);

  return (
    <div className="relative min-h-screen">
      <MarketingNav />

      {/* ── HERO ── */}
      <section className="mx-auto flex max-w-5xl flex-col items-center px-4 pb-20 pt-36 text-center sm:pb-28 sm:pt-44 sm:px-5">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/40">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan" />
          RAG-powered developer matching
        </motion.div>

        <motion.h1
          variants={fadeUp} initial="hidden" animate="show" custom={1}
          className="max-w-4xl font-display text-5xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Where developers
          <br />
          find{" "}
          <span className="text-grad">their people</span>.
        </motion.h1>

        <motion.p
          variants={fadeUp} initial="hidden" animate="show" custom={2}
          className="mt-6 max-w-lg text-base leading-relaxed text-white/35 sm:text-lg"
        >
          AI-powered compatibility matching across skills, stack, and ambition.
          Find cofounders, teammates, and collaborators who actually complement you.
        </motion.p>

        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={3}
          className="mt-9 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Link to="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              Build your mesh <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
              <Github className="h-4 w-4" /> Continue with GitHub
            </Button>
          </Link>
        </motion.div>

        {/* Hero app preview */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="mt-14 w-full">
          <GlassCard glow className="mx-auto max-w-2xl p-0 overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="ml-3 font-mono text-[11px] text-white/20">devmesh.ai / discover</span>
            </div>
            {/* Preview cards */}
            <div className="space-y-2 p-4">
              {(featured.length ? featured.slice(0, 3) : [
                { id: "1", name: "Alex Rivera",  role: "ML Engineer",    trustScore: 94, stack: ["PyTorch", "FastAPI"] },
                { id: "2", name: "Jordan Kim",   role: "Frontend Lead",  trustScore: 89, stack: ["React", "TypeScript"] },
                { id: "3", name: "Sam Okafor",   role: "DevOps & Cloud", trustScore: 87, stack: ["K8s", "Terraform"] },
              ] as DevUser[]).map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[11px] font-semibold text-white/50">
                    {u.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{u.name}</p>
                    <p className="truncate text-xs text-white/30">{u.role || "Developer"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden gap-1 sm:flex">
                      {(u.stack ?? []).slice(0, 2).map((s) => (
                        <span key={s} className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/30">{s}</span>
                      ))}
                    </div>
                    <ScoreRing value={u.trustScore} size={44} />
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section>
        <hr className="section-line" />
        <div className="mx-auto grid max-w-5xl grid-cols-2 px-4 sm:grid-cols-4 sm:px-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
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
        <hr className="section-line" />
      </section>

      {/* ── FEATURES ── */}
      <section ref={featuresRef} id="features" className="mx-auto max-w-5xl px-4 py-24 sm:px-5 sm:py-32">
        <Label>The platform</Label>
        <H2>Everything a team needs,<br className="hidden sm:block" /> meshed together.</H2>
        <Sub>Profiles, matching, workspaces, chat, startups, hackathons — one surface.</Sub>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className={cn("f-card", f.span)}>
              <GlassCard interactive className="h-full">
                <IC icon={f.icon} />
                <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/35">{f.desc}</p>
              </GlassCard>
            </div>
          ))}
        </div>
      </section>

      <hr className="section-line mx-auto max-w-5xl" />

      {/* ── HOW IT WORKS ── */}
      <section ref={stepsRef} id="how-it-works" className="mx-auto max-w-5xl px-4 py-24 sm:px-5 sm:py-32">
        <Label>Process</Label>
        <H2>From profile to team in minutes.</H2>
        <Sub>Three steps. No resume screening. No cold DMs.</Sub>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.num} className="s-card relative">
              <GlassCard className="h-full">
                <span className="mb-5 block font-mono text-xs font-semibold text-neon-cyan/60">{s.num}</span>
                <IC icon={s.icon} />
                <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/35">{s.desc}</p>
              </GlassCard>
            </div>
          ))}
        </div>
      </section>

      <hr className="section-line mx-auto max-w-5xl" />

      {/* ── AI MATCHING ── */}
      <section id="matching" className="mx-auto max-w-5xl px-4 py-24 sm:px-5 sm:py-32">
        <GlassCard glow className="grid items-center gap-8 p-6 sm:p-10 md:grid-cols-2 md:p-14">
          <div>
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/15 bg-neon-cyan/[0.06] px-3 py-1 text-xs font-medium text-neon-cyan">
              <Sparkles className="h-3 w-3" /> Compatibility engine
            </span>
            <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
              Matching that understands<br />
              <span className="text-grad">how you build.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/40">
              Every profile is embedded into a vector space and scored on shared stack,
              complementary skills, availability, and goals — with the <em>why</em> explained.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "Vector embeddings of skills & projects",
                "RAG explanations for every match",
                "Cofounder & hackathon team modes",
              ].map((x) => (
                <li key={x} className="flex items-center gap-2.5 text-sm text-white/50">
                  <Check className="h-3.5 w-3.5 shrink-0 text-neon-cyan" /> {x}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="mt-7 inline-block">
              <Button size="md" className="gap-2">
                Try it free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Match list */}
          <div className="space-y-2.5">
            {(featured.length ? featured.slice(0, 3) : [
              { id: "a", name: "Alex Rivera",  role: "ML Engineer",    trustScore: 94 },
              { id: "b", name: "Jordan Kim",   role: "Frontend Lead",  trustScore: 89 },
              { id: "c", name: "Sam Okafor",   role: "DevOps & Cloud", trustScore: 87 },
            ] as DevUser[]).map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3"
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[11px] font-semibold text-white/50">
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

      <hr className="section-line mx-auto max-w-5xl" />

      {/* ── TESTIMONIALS ── */}
      <section className="mx-auto max-w-5xl px-4 py-24 sm:px-5 sm:py-32">
        <Label>Stories</Label>
        <H2>Builders who found their people.</H2>
        <Sub>Real teams. Real matches. Real products shipped.</Sub>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <GlassCard className="flex h-full flex-col">
                <div className="mb-4 flex gap-0.5">
                  {[...Array(5)].map((_, si) => (
                    <span key={si} className="text-sm text-white/20">★</span>
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-white/40">
                  "{t.quote}"
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[11px] font-semibold text-white/50">
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

      <hr className="section-line mx-auto max-w-5xl" />

      {/* ── USE CASES ── */}
      <section className="mx-auto max-w-5xl px-4 py-24 sm:px-5 sm:py-32">
        <Label>Use cases</Label>
        <H2>Built for every kind of builder.</H2>
        <Sub>Whether you're hacking, founding, or shipping open source.</Sub>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {useCases.map((u, i) => (
            <motion.div
              key={u.title}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <GlassCard interactive className="h-full">
                <IC icon={u.icon} />
                <span className="mb-3 inline-block rounded-md border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-white/35">
                  {u.tag}
                </span>
                <h3 className="text-sm font-semibold text-white">{u.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/35">{u.desc}</p>
                <Link to="/signup" className="mt-5 inline-flex items-center gap-1 text-xs text-neon-cyan/70 hover:text-neon-cyan transition-colors">
                  Get started <ArrowRight className="h-3 w-3" />
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <hr className="section-line mx-auto max-w-5xl" />

      {/* ── TRUST PILLARS ── */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Shield, title: "Verified profiles",     desc: "GitHub & LinkedIn verification keeps the community high-signal and spam-free." },
            { icon: Zap,    title: "Instant matching",      desc: "AI match results in seconds. No waiting rooms, no manual screening." },
            { icon: Search, title: "Transparent scoring",   desc: "Every match shows a full breakdown of why you're compatible — no black boxes." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5"
            >
              <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.04]">
                <item.icon className="h-4 w-4 text-white/40" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/30">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <hr className="section-line mx-auto max-w-5xl" />

      {/* ── PRICING ── */}
      <section ref={pricingRef} id="pricing" className="mx-auto max-w-5xl px-4 py-24 sm:px-5 sm:py-32">
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
                    "border-neon-cyan/20 shadow-[0_0_0_1px_rgba(0,217,255,0.12),0_0_40px_-8px_rgba(0,217,255,0.15)]",
                )}
              >
                {t.highlight && (
                  <span className="mb-4 inline-block rounded-full border border-neon-cyan/15 bg-neon-cyan/[0.06] px-2.5 py-0.5 text-[10px] font-semibold text-neon-cyan">
                    Most popular
                  </span>
                )}
                <p className="text-xs text-white/30">{t.tag}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-white">{t.price}</span>
                  <span className="text-sm text-white/20">/mo</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-grad">{t.name}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/40">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon-cyan/60" /> {f}
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

      <hr className="section-line mx-auto max-w-5xl" />

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto max-w-2xl px-4 py-24 sm:px-5 sm:py-32">
        <Label>FAQ</Label>
        <H2>Questions, answered.</H2>

        <div className="mt-10 space-y-0 divide-y divide-white/[0.05]">
          {faqs.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      <hr className="section-line" />

      {/* ── FINAL CTA ── */}
      <section className="mx-auto max-w-5xl px-4 py-32 text-center sm:px-5">
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Your next cofounder is<br />
          <span className="text-grad">one match away.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-5 text-base text-white/30"
        >
          Join 40,000+ developers already building their mesh. No credit card required.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Link to="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 px-8 sm:w-auto">
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

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.05]">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-5">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <Logo />
              <p className="mt-3 max-w-[200px] text-sm leading-relaxed text-white/25">
                AI-powered developer collaboration. Find your team, build your startup.
              </p>
              <a
                href="https://github.com" target="_blank" rel="noopener noreferrer"
                aria-label="GitHub"
                className="mt-5 inline-grid h-8 w-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/30 transition-colors hover:border-white/[0.12] hover:text-white/60"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/20">{group}</p>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-sm text-white/30 transition-colors hover:text-white/70">
                        {l.label}
                      </a>
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

/* ── Section typography helpers ── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-neon-cyan/50">
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
  return <p className="mt-3 max-w-xl text-sm text-white/35 sm:text-base">{children}</p>;
}

/* ── FAQ accordion ── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-white/70 transition-colors hover:text-white">{q}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-white/20 transition-transform duration-300",
            open && "rotate-180 text-neon-cyan/50",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-white/30">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
