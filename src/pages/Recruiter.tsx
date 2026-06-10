import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bookmark, BookmarkCheck, MapPin, SlidersHorizontal, ArrowDownWideNarrow,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { trustTier, TRUST_LABELS } from "@/lib/trust";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { DevUser, TrustBreakdown } from "@/types";

const thresholds = [0, 30, 70, 90];

export default function Recruiter() {
  const { data: users, loading } = useAsync(api.users);
  const toast = useToast();
  const [minScore, setMinScore] = useState(0);
  const [sortDesc, setSortDesc] = useState(true);
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    const list = (users ?? []).filter((u) => u.trustScore >= minScore);
    return list.sort((a, b) =>
      sortDesc ? b.trustScore - a.trustScore : a.trustScore - b.trustScore,
    );
  }, [users, minScore, sortDesc]);

  const toggle = (u: DevUser) => {
    setShortlist((s) => {
      const next = new Set(s);
      if (next.has(u.id)) next.delete(u.id);
      else { next.add(u.id); toast(`${u.name} added to shortlist`); }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Recruiter Dashboard</h1>
          <p className="text-sm text-slate-400">AI-ranked talent, filtered by verified Trust Score.</p>
        </div>
        <Badge tone="lime">
          <BookmarkCheck className="h-3 w-3" /> {shortlist.size} shortlisted
        </Badge>
      </header>

      {/* Controls */}
      <GlassCard className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <SlidersHorizontal className="h-4 w-4" /> Min trust
        </div>
        <div className="flex gap-1.5">
          {thresholds.map((t) => (
            <button
              key={t}
              onClick={() => setMinScore(t)}
              className={cn(
                "rounded-lg border px-3 py-1 text-xs transition",
                minScore === t
                  ? "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan"
                  : "border-white/10 text-slate-400 hover:text-white",
              )}
            >
              {t === 0 ? "All" : `${t}+`}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => setSortDesc((v) => !v)}>
          <ArrowDownWideNarrow className="h-4 w-4" />
          {sortDesc ? "Highest first" : "Lowest first"}
        </Button>
      </GlassCard>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="No developers above this threshold" description="Lower the minimum trust score to see more candidates." />
      ) : (
        <div className="space-y-3">
          {rows.map((u, i) => {
            const tier = trustTier(u.trustScore);
            const listed = shortlist.has(u.id);
            return (
              <motion.div key={u.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard interactive className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  {/* identity */}
                  <div className="flex items-center gap-3 lg:w-64">
                    <Avatar src={u.avatar} name={u.name} size={48} status={u.availability} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{u.name}</p>
                      <p className="truncate text-xs text-slate-400">{u.role}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500"><MapPin className="h-3 w-3" />{u.location}</p>
                    </div>
                  </div>

                  {/* trust + breakdown bars */}
                  <div className="flex items-center gap-4 lg:flex-1">
                    <div className="text-center">
                      <p className="font-display text-2xl font-bold" style={{ color: tier.color }}>{u.trustScore}</p>
                      <span className="text-[10px]" style={{ color: tier.color }}>{tier.emoji} {tier.label}</span>
                    </div>
                    <div className="grid flex-1 grid-cols-5 gap-2">
                      {(Object.keys(u.trustBreakdown) as (keyof TrustBreakdown)[]).map((k) => (
                        <div key={k}>
                          <div className="mb-1 h-16 w-full overflow-hidden rounded-md bg-white/5">
                            <div
                              className="mt-auto w-full rounded-md bg-neon-grad"
                              style={{ height: `${u.trustBreakdown[k]}%`, marginTop: `${100 - u.trustBreakdown[k]}%` }}
                            />
                          </div>
                          <p className="truncate text-center text-[9px] text-slate-500">{TRUST_LABELS[k]}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* actions */}
                  <div className="flex items-center gap-2 lg:w-40 lg:justify-end">
                    <div className="flex flex-wrap gap-1">
                      {u.skills.slice(0, 2).map((s) => <Badge key={s.name}>{s.name}</Badge>)}
                    </div>
                    <Button
                      size="sm"
                      variant={listed ? "subtle" : "outline"}
                      onClick={() => toggle(u)}
                    >
                      {listed ? <BookmarkCheck className="h-4 w-4 text-neon-lime" /> : <Bookmark className="h-4 w-4" />}
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
