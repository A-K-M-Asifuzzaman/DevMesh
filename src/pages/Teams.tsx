import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Layers, MessageSquare, X, Check, Settings } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { Team } from "@/types";

const stageTone = { idea: "magenta", building: "cyan", launched: "lime" } as const;

const TECH_STACK = [
  "React","Next.js","Vue","TypeScript","Node.js","Python","Go","Rust",
  "PostgreSQL","MongoDB","Docker","AWS","Firebase","TailwindCSS","GraphQL",
];

const ROLES = ["Frontend Dev","Backend Dev","Full-Stack Dev","Mobile Dev","UI/UX Designer","DevOps","Data Scientist","Product Manager"];

export default function Teams() {
  const { data: myTeams, loading, setData: setMyTeams } = useAsync(api.teams);
  const { data: allTeams, loading: allLoading, setData: setAllTeams } = useAsync(api.allTeams);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<"mine" | "discover">("mine");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);

  // Create form
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [stack, setStack] = useState<string[]>([]);
  const [openRoles, setOpenRoles] = useState<string[]>([]);
  const [stage, setStage] = useState<"idea" | "building" | "launched">("idea");

  const createTeam = async () => {
    if (!name.trim()) { toast("Team name is required", "error"); return; }
    setCreating(true);
    try {
      const team = await api.createTeam({ name: name.trim(), tagline: tagline.trim(), stack, openRoles, stage });
      setMyTeams((prev) => [team, ...(prev ?? [])]);
      setShowCreate(false);
      setName(""); setTagline(""); setStack([]); setOpenRoles([]); setStage("idea");
      toast(`Team "${team.name}" created! 🎉`);
    } catch (err: any) {
      toast(err.message ?? "Failed to create team", "error");
    } finally {
      setCreating(false);
    }
  };

  const joinTeam = async (teamId: string) => {
    setJoining(teamId);
    try {
      const team = await api.joinTeam(teamId);
      setMyTeams((prev) => [team, ...(prev ?? [])]);
      setAllTeams((prev) => (prev ?? []).filter((t) => t.id !== teamId));
      toast(`Joined ${team.name}!`);
      setTab("mine");
    } catch (err: any) {
      toast(err.message ?? "Failed to join team", "error");
    } finally {
      setJoining(null);
    }
  };

  const openTeamChat = async (team: Team) => {
    if (team.conversationId) {
      navigate("/chat", { state: { roomId: team.conversationId } });
      return;
    }
    try {
      const joined = await api.joinTeam(team.id);
      if (joined.conversationId) {
        navigate("/chat", { state: { roomId: joined.conversationId } });
      } else {
        navigate("/chat");
      }
    } catch {
      navigate("/chat");
    }
  };

  const isMyTeam = (team: Team) =>
    team.members.some((m) => m.id === user?.id);

  const discoverTeams = (allTeams ?? []).filter((t) => !isMyTeam(t));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Teams</h1>
          <p className="text-sm text-slate-400">Your workspaces and open teams to join.</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New team
        </Button>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1 w-fit">
        {(["mine", "discover"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "relative rounded-lg px-4 py-2 text-sm font-medium transition",
              tab === t ? "text-white" : "text-slate-400 hover:text-slate-200",
            )}
          >
            {tab === t && <motion.span layoutId="team-tab" className="absolute inset-0 rounded-lg bg-white/[0.08]" />}
            <span className="relative capitalize">{t === "mine" ? "My Teams" : "Discover"}</span>
          </button>
        ))}
      </div>

      {/* Create Team Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <GlassCard className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-white">Create a Team</h2>
                  <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">Team name *</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. DevMesh Alpha" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-neon-cyan/50" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">Tagline</label>
                    <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="What are you building?" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-neon-cyan/50" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">Stage</label>
                    <div className="flex gap-2">
                      {(["idea","building","launched"] as const).map((s) => (
                        <button key={s} onClick={() => setStage(s)} className={cn("flex-1 rounded-xl border py-2 text-xs font-medium capitalize transition", stage === s ? `border-neon-cyan bg-neon-cyan/10 text-neon-cyan` : "border-white/10 text-slate-500 hover:text-white")}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">Tech stack</label>
                    <div className="flex flex-wrap gap-1.5">
                      {TECH_STACK.map((t) => (
                        <button key={t} onClick={() => setStack((s) => s.includes(t) ? s.filter((x) => x !== t) : [...s, t])} className={cn("rounded-lg border px-2.5 py-1 text-xs transition", stack.includes(t) ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan" : "border-white/10 text-slate-400 hover:text-white")}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">Open roles</label>
                    <div className="flex flex-wrap gap-1.5">
                      {ROLES.map((r) => (
                        <button key={r} onClick={() => setOpenRoles((s) => s.includes(r) ? s.filter((x) => x !== r) : [...s, r])} className={cn("rounded-lg border px-2.5 py-1 text-xs transition", openRoles.includes(r) ? "border-neon-magenta bg-neon-magenta/10 text-neon-magenta" : "border-white/10 text-slate-400 hover:text-white")}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button className="flex-1" loading={creating} onClick={createTeam} disabled={!name.trim()}>
                    Create team
                  </Button>
                  <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My Teams */}
      {tab === "mine" && (
        <>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
            </div>
          ) : !myTeams || myTeams.length === 0 ? (
            <GlassCard className="py-16 text-center">
              <Users className="mx-auto mb-4 h-10 w-10 text-neon-cyan opacity-40" />
              <p className="text-slate-400">You're not in any teams yet.</p>
              <div className="mt-4 flex justify-center gap-3">
                <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Create team</Button>
                <Button variant="outline" onClick={() => setTab("discover")}>Discover teams</Button>
              </div>
            </GlassCard>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myTeams.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <GlassCard interactive className="h-full">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-semibold text-white truncate">{t.name}</h3>
                        <p className="text-sm text-slate-400 truncate">{t.tagline || "No tagline yet"}</p>
                      </div>
                      <Badge tone={stageTone[t.stage]}>{t.stage}</Badge>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {t.members.slice(0, 5).map((m) => (
                          <button key={m.id} onClick={() => navigate(`/profile/${m.id}`)}>
                            <Avatar src={m.avatar} name={m.name} size={30} className="ring-2 ring-ink-950 hover:ring-neon-cyan transition" />
                          </button>
                        ))}
                        {t.members.length > 5 && (
                          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/10 ring-2 ring-ink-950 text-xs text-slate-400">
                            +{t.members.length - 5}
                          </div>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Users className="h-3 w-3" />{t.members.length} members
                      </span>
                    </div>

                    {t.stack.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {t.stack.map((s) => <Badge key={s}>{s}</Badge>)}
                      </div>
                    )}

                    {t.openRoles.length > 0 && (
                      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neon-cyan">
                          <Layers className="h-3.5 w-3.5" /> Open roles
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {t.openRoles.map((r) => <Badge key={r} tone="cyan">{r}</Badge>)}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" className="flex-1" onClick={() => openTeamChat(t)}>
                        <MessageSquare className="h-3.5 w-3.5" /> Team chat
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Discover Teams */}
      {tab === "discover" && (
        <>
          {allLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
          ) : discoverTeams.length === 0 ? (
            <GlassCard className="py-16 text-center">
              <p className="text-slate-400">No other teams to discover right now.</p>
              <Button className="mt-4" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Create one</Button>
            </GlassCard>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {discoverTeams.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <GlassCard interactive className="h-full">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-semibold text-white truncate">{t.name}</h3>
                        <p className="text-sm text-slate-400 truncate">{t.tagline || "No tagline yet"}</p>
                      </div>
                      <Badge tone={stageTone[t.stage]}>{t.stage}</Badge>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {t.members.slice(0, 4).map((m) => (
                          <Avatar key={m.id} src={m.avatar} name={m.name} size={28} className="ring-2 ring-ink-950" />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">{t.members.length} members</span>
                    </div>

                    {t.stack.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {t.stack.slice(0, 4).map((s) => <Badge key={s}>{s}</Badge>)}
                      </div>
                    )}

                    {t.openRoles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {t.openRoles.map((r) => <Badge key={r} tone="magenta">{r}</Badge>)}
                      </div>
                    )}

                    <Button
                      size="sm"
                      className="mt-4 w-full"
                      loading={joining === t.id}
                      onClick={() => joinTeam(t.id)}
                    >
                      <Check className="h-3.5 w-3.5" /> Request to join
                    </Button>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
