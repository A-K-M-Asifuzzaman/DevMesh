import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Users,
  MessageSquare,
  Rocket,
  Trophy,
  Search,
  BarChart3,
  Github,
  Check,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { DevUser } from "@/types";

gsap.registerPlugin(ScrollTrigger);

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] },
  }),
};

const toneClass: Record<string, string> = {
  cyan: "border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan",
  blue: "border-neon-blue/30 bg-neon-blue/10 text-neon-blue",
  lime: "border-neon-lime/30 bg-neon-lime/10 text-neon-lime",
  magenta: "border-neon-magenta/30 bg-neon-magenta/10 text-neon-magenta",
};

const features = [
  { icon: Sparkles, title: "AI Team Matchmaking", desc: "Compatibility scoring that reads skills, stack, and ambition — not just keywords.", tone: "cyan", span: "md:col-span-2" },
  { icon: Search, title: "Semantic Search", desc: "Find people by what they can build, powered by vector embeddings.", tone: "blue", span: "" },
  { icon: Users, title: "Team Workspaces", desc: "Kanban, tasks, shared notes, realtime presence.", tone: "lime", span: "" },
  { icon: MessageSquare, title: "Realtime Chat", desc: "Typing indicators, presence, and notifications over Socket.io.", tone: "magenta", span: "" },
  { icon: Rocket, title: "Startup Builder", desc: "Post an idea, recruit cofounders, find your missing skill.", tone: "cyan", span: "" },
  { icon: Trophy, title: "Hackathon Mode", desc: "Assemble a balanced team in under 60 seconds.", tone: "blue", span: "md:col-span-2" },
] as const;

const tiers = [
  { name: "Free", price: "$0", tag: "For exploring", features: ["Public profile", "5 AI matches / mo", "Join 1 team", "Community search"], cta: "Start free", highlight: false },
  { name: "Pro", price: "$12", tag: "For builders", features: ["Unlimited AI matches", "Semantic search", "Unlimited teams", "Profile analytics", "Priority in discovery"], cta: "Go Pro", highlight: true },
  { name: "Startup", price: "$49", tag: "For founding teams", features: ["Everything in Pro", "Cofounder matching", "Recruiter visibility stats", "Team workspace seats", "AI idea generation"], cta: "Scale up", highlight: false },
];


export default function Landing() {
  const [featured, setFeatured] = useState<DevUser[]>([]);
  const featuresRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);

  useEffect(() => {
    api.featuredUsers().then(setFeatured).catch(() => {});
  }, []);

  // GSAP: features bento cards
  useEffect(() => {
    const section = featuresRef.current;
    if (!section) return;
    const cards = section.querySelectorAll(".feature-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 50, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          once: true,
        },
      }
    );
    return () => { ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, []);

  // GSAP: pricing cards
  useEffect(() => {
    const section = pricingRef.current;
    if (!section) return;
    const cards = section.querySelectorAll(".pricing-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
      }
    );
  }, []);

  return (
    <div className="relative">
      <MarketingNav />

      {/* Hero */}
      <section className="relative mx-auto flex max-w-5xl flex-col items-center px-4 pt-32 pb-16 text-center sm:px-5 sm:pt-36 sm:pb-20">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-neon-cyan/10 blur-[120px]" />
          <div className="absolute right-10 top-40 h-64 w-64 rounded-full bg-neon-magenta/10 blur-[100px]" />
        </div>

        <motion.div variants={fade} initial="hidden" animate="show" custom={0}>
          <Badge tone="cyan" className="mb-5 sm:mb-6">
            <Sparkles className="h-3 w-3" /> Now with RAG-powered teammate matching
          </Badge>
        </motion.div>
        <motion.style
          variants={fade}
          initial="hidden"
          animate="show"
          custom={1}
        />
        <motion.h1
          variants={fade}
          initial="hidden"
          animate="show"
          custom={1}
          style={{ y: heroY }}
          className="max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Where developers
          <br />
          find <span className="text-grad">their people</span>.
        </motion.h1>
        <motion.p
          variants={fade}
          initial="hidden"
          animate="show"
          custom={2}
          className="mt-5 max-w-xl text-balance text-base text-slate-400 sm:mt-6 sm:text-lg"
        >
          DevMesh AI matches you with collaborators, cofounders, and teammates
          using compatibility scoring across skills, stack, and ambition.
        </motion.p>
        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          custom={3}
          className="mt-7 flex flex-col items-center gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:justify-center"
        >
          <Link to="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="group w-full sm:w-auto">
              Build your mesh
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Github className="h-4 w-4" /> Log in
            </Button>
          </Link>
        </motion.div>

        {/* Floating match preview */}
        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          custom={4}
          className="relative mt-12 w-full sm:mt-16"
        >
          <GlassCard glow className="mx-auto max-w-3xl p-0">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3 text-xs text-slate-500 sm:px-5">
              <span className="h-2.5 w-2.5 rounded-full bg-neon-magenta/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-neon-lime/70" />
              <span className="ml-2 hidden font-mono sm:block">devmesh.ai/discover</span>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
              {featured.slice(0, 2).map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.15 }}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left sm:gap-4 sm:p-4"
                >
                  <ScoreRing value={u.trustScore} label="trust" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{u.name}</p>
                    <p className="truncate text-xs text-slate-400">{u.role || "Developer"}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-neon-cyan">
                      {u.stack.slice(0, 2).join(" · ") || "Full-stack"}
                    </p>
                  </div>
                </motion.div>
              ))}
              {featured.length === 0 && (
                <div className="col-span-2 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <ScoreRing value={92} label="match" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">AI Teammate Match</p>
                    <p className="truncate text-xs text-slate-400">Sign up to see your real matches</p>
                    <p className="mt-1 text-xs text-neon-cyan">Powered by vector embeddings</p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* social proof */}
        <div className="mt-10 flex items-center gap-3 text-xs uppercase tracking-widest text-slate-600 sm:mt-14 sm:gap-4">
          <span className="hairline w-10 sm:w-16" />
          Trusted by 40,000+ developers
          <span className="hairline w-10 sm:w-16" />
        </div>
      </section>

      {/* Features bento — GSAP animated */}
      <section ref={featuresRef} id="features" className="mx-auto max-w-5xl px-4 py-16 sm:px-5 sm:py-20">
        <SectionHead
          kicker="The platform"
          title="Everything a team needs, meshed together"
          sub="Profiles, matching, workspaces, chat, startups, hackathons — one surface."
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:mt-10">
          {features.map((f) => (
            <div key={f.title} className={cn("feature-card", f.span)}>
              <GlassCard interactive className="h-full">
                <div className={cn("mb-4 grid h-10 w-10 place-items-center rounded-xl border", toneClass[f.tone])}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{f.desc}</p>
              </GlassCard>
            </div>
          ))}
        </div>
      </section>

      {/* AI matching strip */}
      <section id="matching" className="mx-auto max-w-5xl px-4 py-16 sm:px-5 sm:py-20">
        <GlassCard glow className="grid items-center gap-6 p-6 sm:gap-8 sm:p-8 md:grid-cols-2 md:p-12">
          <div>
            <Badge tone="magenta" className="mb-4">
              <Sparkles className="h-3 w-3" /> Compatibility engine
            </Badge>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Matching that understands <span className="text-grad">how you build</span>
            </h2>
            <p className="mt-4 text-sm text-slate-400 sm:text-base">
              We embed every profile into a vector space and score compatibility on
              shared stack, complementary skills, availability, and goals. The result
              is a ranked shortlist — with the <em>why</em> spelled out.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              {["Vector embeddings of skills & projects", "RAG explanations for every match", "Cofounder & hackathon modes"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-neon-lime" /> {x}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="mt-6 inline-block">
              <Button className="group">
                Try it free
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {featured.slice(0, 4).map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
              >
                <Avatar src={u.avatar} name={u.name} status={u.availability} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{u.name}</p>
                  <p className="truncate text-xs text-slate-500">{u.role || "Developer"}</p>
                </div>
                <ScoreRing value={u.trustScore} size={48} />
              </motion.div>
            ))}
            {featured.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">
                Sign up to see AI-ranked developer profiles
              </p>
            )}
          </div>
        </GlassCard>
      </section>

      {/* Pricing — GSAP animated */}
      <section ref={pricingRef} id="pricing" className="mx-auto max-w-5xl px-4 py-16 sm:px-5 sm:py-20">
        <SectionHead kicker="Pricing" title="Start free. Scale when you ship." sub="Powered by Stripe subscriptions." />
        <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-1 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className="pricing-card">
              <GlassCard
                glow={t.highlight}
                className={cn("flex h-full flex-col", t.highlight && "shadow-glow-blue")}
              >
                {t.highlight && (
                  <Badge tone="blue" className="mb-3 w-fit">Most popular</Badge>
                )}
                <p className="text-sm text-slate-400">{t.tag}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-white">{t.price}</span>
                  <span className="text-sm text-slate-500">/mo</span>
                </div>
                <p className="mt-1 font-display text-lg font-semibold text-grad">{t.name}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-300">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-neon-cyan" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className="mt-6">
                  <Button variant={t.highlight ? "primary" : "outline"} className="w-full">
                    {t.cta}
                  </Button>
                </Link>
              </GlassCard>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-5 sm:py-24">
        <BarChart3 className="mx-auto mb-6 h-8 w-8 animate-float text-neon-cyan" />
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          Your next cofounder is <span className="text-grad">one match away</span>.
        </h2>
        <Link to="/signup" className="mt-6 inline-block sm:mt-8">
          <Button size="lg" className="group">
            Get started — it's free
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Button>
        </Link>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-slate-600 sm:py-10">
        <p>© {new Date().getFullYear()} DevMesh AI · Built for builders.</p>
      </footer>
    </div>
  );
}

function SectionHead({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div className="text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon-cyan">{kicker}</p>
      <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl lg:text-4xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:text-base">{sub}</p>
    </div>
  );
}
