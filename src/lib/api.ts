import type {
  DevUser, MatchSuggestion, Team, StartupIdea, Task,
  ChatRoom, ChatMessage, ActivityPoint, Project, Certificate,
  AppNotification, ConnectionItem,
} from "@/types";

export const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

// ── Auth helpers ──────────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem("token") ?? "";
export const getMyId = () => localStorage.getItem("userId") ?? "";

export async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(opts?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as any).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

// ── Normalisers ───────────────────────────────────────────────────────────────

export function normalizeUser(u: Record<string, any>): DevUser {
  return {
    id: String(u._id ?? u.id ?? ""),
    name: u.name ?? "",
    handle: u.handle ?? "",
    avatar:
      u.avatar ||
      `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(u.handle ?? u.name ?? "user")}`,
    role: u.role ?? "",
    bio: u.bio ?? "",
    location: u.location ?? "",
    availability: u.availability ?? "open",
    tier: u.tier ?? "free",
    userType: u.userType ?? "developer",
    onboardingComplete: u.onboardingComplete ?? false,
    skills: u.skills ?? [],
    stack: u.stack ?? [],
    github: u.github,
    website: u.website,
    twitter: u.twitter,
    followers: u.followers ?? 0,
    projects: u.projectsCount ?? u.projects ?? 0,
    rep: u.rep ?? 0,
    certificates: u.certificatesCount ?? u.certificates ?? 0,
    trustScore: u.trustScore ?? 0,
    trustBreakdown: u.trustBreakdown ?? {
      profile: 0, github: 0, certificates: 0, projects: 0, activity: 0,
    },
  };
}

export function normalizeUserFull(u: Record<string, any>): DevUser & { certificatesList: Certificate[] } {
  const base = normalizeUser(u);
  const certificatesList: Certificate[] = (u.certificates ?? []).map((c: any) => ({
    id: String(c._id ?? c.id ?? ""),
    name: c.name ?? "",
    issuer: c.issuer ?? "",
    year: c.year,
    credentialUrl: c.credentialUrl,
    imageUrl: c.imageUrl,
  }));
  return { ...base, certificatesList };
}

function normalizeTeam(t: Record<string, any>): Team {
  return {
    id: String(t._id ?? t.id ?? ""),
    name: t.name ?? "",
    tagline: t.tagline ?? "",
    members: (t.members ?? []).map(normalizeUser),
    openRoles: t.openRoles ?? [],
    stack: t.stack ?? [],
    stage: t.stage ?? "idea",
    conversationId: t.conversation ? String(t.conversation) : undefined,
    ownerId: t.owner ? String(t.owner._id ?? t.owner) : undefined,
  };
}

function normalizeIdea(i: Record<string, any>): StartupIdea {
  return {
    id: String(i._id ?? i.id ?? ""),
    title: i.title ?? "",
    pitch: i.pitch ?? "",
    author: normalizeUser(i.author ?? {}),
    lookingFor: i.lookingFor ?? [],
    tags: i.tags ?? [],
    upvotes: Array.isArray(i.upvotes) ? i.upvotes.length : (i.upvotes ?? 0),
    comments: i.commentsCount ?? i.comments ?? 0,
  };
}

function normalizeTask(t: Record<string, any>): Task {
  return {
    id: String(t._id ?? t.id ?? ""),
    title: t.title ?? "",
    status: t.status ?? "todo",
    assignee: t.assignee ? normalizeUser(t.assignee) : undefined,
    priority: t.priority ?? "med",
  };
}

function normalizeConversation(c: Record<string, any>): ChatRoom {
  const myId = getMyId();
  const isDm = c.kind === "dm";
  const others = (c.participants ?? []).filter((p: any) => String(p._id ?? p) !== myId);
  const partner = isDm ? (others[0] ?? null) : null;
  return {
    id: String(c._id ?? ""),
    kind: c.kind ?? "dm",
    name: isDm ? (partner?.name ?? "Unknown") : (c.team?.name ?? "Team Room"),
    avatar: isDm ? (partner?.avatar ?? undefined) : undefined,
    members: (c.participants ?? []).map(normalizeUser),
    online: false,
    unread: 0,
    lastMessage: c.lastMessage ?? "",
    ts: c.lastMessageAt
      ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "",
  };
}

function normalizeMessage(m: Record<string, any>, roomId: string): ChatMessage {
  const myId = getMyId();
  const senderId = m.sender?._id ? String(m.sender._id) : String(m.sender ?? "");
  return {
    id: String(m._id ?? m.id ?? ""),
    roomId,
    senderId,
    fromMe: senderId === myId,
    text: m.text ?? "",
    ts: m.createdAt
      ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : (m.ts ?? ""),
    seenBy: (m.seenBy ?? []).map((id: any) => String(id)),
    reactions: (m.reactions ?? []).map((r: any) => ({
      emoji: r.emoji,
      by: (r.by ?? []).map((id: any) => String(id)),
    })),
    edited: m.edited ?? false,
    senderName: m.sender?.name,
    senderAvatar: m.sender?.avatar,
  };
}

function enrichMatch(raw: Record<string, any>): MatchSuggestion {
  const user = normalizeUser(raw.user ?? {});
  const sharedStack: string[] = raw.sharedStack ?? [];
  const complementary = user.skills
    .filter((s) => !sharedStack.map((x) => x.toLowerCase()).includes(s.name.toLowerCase()))
    .sort((a, b) => b.level - a.level)
    .slice(0, 3)
    .map((s) => s.name);

  const reasons: string[] = [];
  if (sharedStack.length > 0)
    reasons.push(`Shared stack: ${sharedStack.slice(0, 2).join(" & ")}`);
  if (complementary.length > 0)
    reasons.push(`Brings ${complementary[0]} to your stack`);
  if (user.availability === "available")
    reasons.push("Available now for new projects");
  else if (user.availability === "open")
    reasons.push("Open to new opportunities");
  if (user.trustScore >= 80)
    reasons.push("Highly verified developer profile");
  if (reasons.length < 2)
    reasons.push("Strong compatibility across skills and goals");

  return { user, score: raw.score, reasons: reasons.slice(0, 3), sharedStack, complementary };
}

function normalizeProject(p: Record<string, any>): Project {
  return {
    id: String(p._id ?? p.id ?? ""),
    owner: String(p.owner ?? ""),
    title: p.title ?? "",
    description: p.description,
    stack: p.stack ?? [],
    repoUrl: p.repoUrl,
    liveUrl: p.liveUrl,
    image: p.image,
  };
}

function normalizeNotification(n: Record<string, any>): AppNotification {
  const p = n.payload ?? {};
  return {
    id: String(n._id ?? n.id ?? ""),
    type: p.subType ?? n.type ?? "system",
    message: p.message ?? "",
    read: n.read ?? false,
    fromId: p.fromId,
    fromName: p.fromName,
    fromAvatar: p.fromAvatar,
    payload: p,
    createdAt: n.createdAt ?? new Date().toISOString(),
  };
}

// ── API surface ───────────────────────────────────────────────────────────────

export const api = {
  // Auth
  me: async (): Promise<DevUser & { certificatesList: Certificate[] }> => {
    const { user } = await apiFetch<{ user: any }>("/auth/me");
    return normalizeUserFull(user);
  },

  completeOnboarding: async (data: Record<string, unknown>): Promise<DevUser> => {
    const { user } = await apiFetch<{ user: any }>("/auth/onboarding", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeUser(user);
  },

  updateAvatar: async (avatar: string): Promise<DevUser> => {
    const { user } = await apiFetch<{ user: any }>("/auth/avatar", {
      method: "PATCH",
      body: JSON.stringify({ avatar }),
    });
    return normalizeUser(user);
  },

  // Users
  users: async (): Promise<DevUser[]> => {
    const { users } = await apiFetch<{ users: any[] }>("/users");
    return users.map(normalizeUser);
  },

  user: async (id: string): Promise<(DevUser & { certificatesList: Certificate[] }) | undefined> => {
    try {
      const { user } = await apiFetch<{ user: any }>(`/users/${id}`);
      return normalizeUserFull(user);
    } catch {
      return undefined;
    }
  },

  featuredUsers: async (): Promise<DevUser[]> => {
    const res = await fetch(`${API_BASE}/public/featured`);
    const { users } = await res.json();
    return (users ?? []).map(normalizeUser);
  },

  updateProfile: async (patch: Record<string, unknown>): Promise<DevUser> => {
    const { user } = await apiFetch<{ user: any }>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    return normalizeUser(user);
  },

  // Matching
  matches: async (): Promise<MatchSuggestion[]> => {
    const { matches } = await apiFetch<{ matches: any[] }>("/matches");
    return matches.map(enrichMatch);
  },

  // Teams
  teams: async (): Promise<Team[]> => {
    const { teams } = await apiFetch<{ teams: any[] }>("/teams/mine");
    return teams.map(normalizeTeam);
  },

  allTeams: async (): Promise<Team[]> => {
    const { teams } = await apiFetch<{ teams: any[] }>("/teams");
    return teams.map(normalizeTeam);
  },

  createTeam: async (data: { name: string; tagline?: string; stack?: string[]; openRoles?: string[]; stage?: string }): Promise<Team> => {
    const { team } = await apiFetch<{ team: any }>("/teams", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeTeam(team);
  },

  joinTeam: async (id: string): Promise<Team> => {
    const { team } = await apiFetch<{ team: any }>(`/teams/${id}/join`, { method: "POST" });
    return normalizeTeam(team);
  },

  // Ideas / Startups
  ideas: async (): Promise<StartupIdea[]> => {
    const { ideas } = await apiFetch<{ ideas: any[] }>("/ideas");
    return ideas.map(normalizeIdea);
  },

  createIdea: async (data: { title: string; pitch: string; lookingFor?: string[]; tags?: string[] }): Promise<StartupIdea> => {
    const { idea } = await apiFetch<{ idea: any }>("/ideas", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeIdea(idea);
  },

  upvoteIdea: async (id: string): Promise<{ upvotes: number; voted: boolean }> => {
    return apiFetch(`/ideas/${id}/upvote`, { method: "POST" });
  },

  // Tasks
  tasks: async (): Promise<Task[]> => {
    const { tasks } = await apiFetch<{ tasks: any[] }>("/tasks");
    return tasks.map(normalizeTask);
  },

  createTask: async (data: { teamId: string; title: string; priority?: string; assigneeId?: string }): Promise<Task> => {
    const { task } = await apiFetch<{ task: any }>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeTask(task);
  },

  updateTask: async (id: string, patch: Partial<Task> & { assigneeId?: string }): Promise<Task> => {
    const { task } = await apiFetch<{ task: any }>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    return normalizeTask(task);
  },

  // Chat
  rooms: async (): Promise<ChatRoom[]> => {
    const { conversations } = await apiFetch<{ conversations: any[] }>("/conversations");
    return conversations.map(normalizeConversation);
  },

  messages: async (roomId: string): Promise<ChatMessage[]> => {
    const { messages } = await apiFetch<{ messages: any[] }>(`/conversations/${roomId}/messages`);
    return messages.map((m) => normalizeMessage(m, roomId));
  },

  clearChat: async (roomId: string): Promise<void> => {
    await apiFetch(`/conversations/${roomId}/messages`, { method: "DELETE" });
  },

  openDm: async (userId: string): Promise<ChatRoom> => {
    const { conversation } = await apiFetch<{ conversation: any }>(
      `/conversations/dm/${userId}`,
      { method: "POST" },
    );
    return normalizeConversation(conversation);
  },

  // Activity & Trust
  activity: async (): Promise<ActivityPoint[]> => {
    const { activity } = await apiFetch<{ activity: ActivityPoint[] }>("/users/me/activity");
    return activity;
  },

  trust: async () => {
    return apiFetch<{ trustScore: number; trustBreakdown: any; suggestions: string[]; flagged: boolean }>(
      "/users/me/trust",
    );
  },

  // Connections
  connections: async (): Promise<ConnectionItem[]> => {
    const { connections } = await apiFetch<{ connections: any[] }>("/connections");
    return connections.map((c) => ({ connectionId: c.connectionId, user: normalizeUser(c.user) }));
  },

  pendingRequests: async () => {
    const { pending } = await apiFetch<{ pending: any[] }>("/connections/pending");
    return pending as any[];
  },

  connectionStatus: async (userId: string) => {
    return apiFetch<{ status: string; connectionId?: string }>(`/connections/status/${userId}`);
  },

  sendConnectionRequest: async (userId: string) => {
    return apiFetch<{ ok: boolean }>(`/connections/request/${userId}`, { method: "POST" });
  },

  acceptConnection: async (connectionId: string) => {
    return apiFetch<{ ok: boolean; conversationId?: string }>(`/connections/${connectionId}/accept`, { method: "POST" });
  },

  rejectConnection: async (connectionId: string) => {
    return apiFetch<{ ok: boolean }>(`/connections/${connectionId}/reject`, { method: "POST" });
  },

  removeConnection: async (userId: string) => {
    return apiFetch<{ ok: boolean }>(`/connections/${userId}`, { method: "DELETE" });
  },

  // Notifications
  notifications: async (): Promise<AppNotification[]> => {
    const { notifications } = await apiFetch<{ notifications: any[] }>("/notifications");
    return notifications.map(normalizeNotification);
  },

  notificationUnreadCount: async (): Promise<number> => {
    const { count } = await apiFetch<{ count: number }>("/notifications/unread-count");
    return count;
  },

  markNotificationRead: async (id: string) => {
    return apiFetch<{ ok: boolean }>(`/notifications/${id}/read`, { method: "PATCH" });
  },

  markAllNotificationsRead: async () => {
    return apiFetch<{ ok: boolean }>("/notifications/read-all", { method: "PATCH" });
  },

  // Projects
  myProjects: async (): Promise<Project[]> => {
    const { projects } = await apiFetch<{ projects: any[] }>("/projects/me");
    return projects.map(normalizeProject);
  },

  userProjects: async (userId: string): Promise<Project[]> => {
    const { projects } = await apiFetch<{ projects: any[] }>(`/projects/${userId}`);
    return projects.map(normalizeProject);
  },

  createProject: async (data: Omit<Project, "id" | "owner">): Promise<Project> => {
    const { project } = await apiFetch<{ project: any }>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeProject(project);
  },

  updateProject: async (id: string, data: Partial<Omit<Project, "id" | "owner">>): Promise<Project> => {
    const { project } = await apiFetch<{ project: any }>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return normalizeProject(project);
  },

  deleteProject: async (id: string) => {
    return apiFetch<{ ok: boolean }>(`/projects/${id}`, { method: "DELETE" });
  },

  // Certificates (embedded in user)
  addCertificate: async (data: { name: string; issuer: string; year?: number; credentialUrl?: string; imageUrl?: string }) => {
    const { certificate } = await apiFetch<{ certificate: any }>("/certificates", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return certificate;
  },

  deleteCertificate: async (certId: string) => {
    return apiFetch<{ ok: boolean }>(`/certificates/${certId}`, { method: "DELETE" });
  },
};
