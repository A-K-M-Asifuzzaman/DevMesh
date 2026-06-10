import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Eye, Sparkles, Users, TrendingUp, ArrowUpRight, Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useAsync } from "@/hooks/useAsync";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { fmt } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const stagger = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }),
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: activity, loading: aLoading } = useAsync(api.activity);
  const { data: matches, loading: mLoading } = useAsync(api.matches, []);
  const { data: tasks, loading: tLoading } = useAsync(api.tasks);
  const { data: teams } = useAsync(api.teams, []);

  const stats = useMemo(() => [
    { label: "Followers", value: fmt(user?.followers ?? 0), delta: "+followers", icon: Eye, tone: "cyan" as const },
    { label: "AI Matches", value: String(matches?.length ?? 0), delta: "suggested", icon: Sparkles, tone: "magenta" as const },
    { label: "Teams", value: String(teams?.length ?? 0), delta: "workspaces", icon: Users, tone: "lime" as const },
    { label: "Reputation", value: fmt(user?.rep ?? 0), delta: "rep score", icon: TrendingUp, tone: "blue" as const },
  ], [user, matches, teams]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            {greeting()}, {user?.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-sm text-slate-400">Here's how your mesh is performing.</p>
        </div>
        <Link to="/discover">
          <Button size="sm">
            <Sparkles className="h-4 w-4" /> Find teammates
          </Button>
        </Link>
      </header>

      {/* Stat bento */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} variants={stagger} initial="hidden" animate="show" custom={i}>
            <GlassCard interactive className="relative overflow-hidden">
              <s.icon className="absolute -right-3 -top-3 h-16 w-16 text-white/[0.03]" />
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className="mt-2 font-display text-3xl font-bold text-white">{s.value}</p>
              <Badge tone={s.tone} className="mt-3">
                <ArrowUpRight className="h-3 w-3" /> {s.delta}
              </Badge>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Activity chart */}
        <GlassCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-white">Engagement</h3>
              <p className="text-xs text-slate-500">Messages sent & received · last 7 days</p>
            </div>
            <Badge tone="cyan">Live</Badge>
          </div>
          {aLoading || !activity ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={activity} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34e7e4" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#34e7e4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMatch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff4d9d" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ff4d9d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,12,20,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
                <Area type="monotone" dataKey="views" name="Received" stroke="#34e7e4" strokeWidth={2} fill="url(#gViews)" />
                <Area type="monotone" dataKey="matches" name="Sent" stroke="#ff4d9d" strokeWidth={2} fill="url(#gMatch)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        {/* AI suggestions */}
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display font-semibold text-white">Top AI matches</h3>
            <Link to="/discover" className="text-xs text-neon-cyan hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {mLoading || !matches
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
              : matches.length === 0
              ? <p className="text-xs text-slate-500 text-center py-4">No matches yet — complete your profile to get ranked.</p>
              : matches.slice(0, 3).map((m) => (
                  <div key={m.user.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
                    <Avatar src={m.user.avatar} name={m.user.name} status={m.user.availability} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{m.user.name}</p>
                      <p className="truncate text-xs text-slate-500">{m.user.role || "Developer"}</p>
                    </div>
                    <ScoreRing value={m.score} size={42} />
                  </div>
                ))}
          </div>
        </GlassCard>
      </div>

      {/* Kanban preview */}
      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-white">
              {teams && teams.length > 0 ? `${teams[0].name} · Board` : "Team Board"}
            </h3>
            <p className="text-xs text-slate-500">
              {teams && teams.length > 0
                ? `Shared with ${teams[0].members.length} teammate${teams[0].members.length !== 1 ? "s" : ""}`
                : "Join or create a team to see tasks"}
            </p>
          </div>
          <Button variant="subtle" size="sm"><Plus className="h-3.5 w-3.5" /> Task</Button>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {(["todo", "in_progress", "review", "done"] as const).map((col) => (
            <div key={col} className="rounded-xl bg-white/[0.02] p-3">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                {col.replace("_", " ")}
              </p>
              <div className="space-y-2">
                {tLoading || !tasks
                  ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
                  : tasks
                      .filter((t) => t.status === col)
                      .map((t) => (
                        <div key={t.id} className="rounded-lg border border-white/10 bg-ink-800/60 p-2.5">
                          <p className="text-sm text-slate-200">{t.title}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <Badge tone={t.priority === "high" ? "magenta" : t.priority === "med" ? "cyan" : "default"}>
                              {t.priority}
                            </Badge>
                            {t.assignee && <Avatar src={t.assignee.avatar} name={t.assignee.name} size={22} />}
                          </div>
                        </div>
                      ))}
                {!tLoading && tasks?.filter((t) => t.status === col).length === 0 && (
                  <p className="text-[11px] text-slate-600 text-center py-2">Empty</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
