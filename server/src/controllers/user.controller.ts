import type { Response } from "express";
import { User } from "../models/User.js";
import { Message } from "../models/Message.js";
import { env } from "../config/env.js";
import {
  computeTrustScore,
  aiTrustSuggestions,
  isLowQuality,
} from "../services/trustScore.service.js";
import type { AuthedRequest } from "../middleware/auth.js";

export async function recomputeTrust(userId: string) {
  const user = await User.findById(userId);
  if (!user) return null;
  const { trustScore, trustBreakdown } = computeTrustScore(user);
  user.set({ trustScore, trustBreakdown, trustUpdatedAt: new Date() });
  await user.save();
  return { trustScore, trustBreakdown };
}

export async function updateProfile(req: AuthedRequest, res: Response) {
  const allowed = [
    "name", "bio", "role", "location", "availability", "skills", "stack",
    "github", "website", "twitter", "githubStats", "certificatesCount", "projectsCount",
  ];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (k in req.body) patch[k] = req.body[k];

  const user = await User.findByIdAndUpdate(req.userId, patch, { new: true });
  if (!user) return res.status(404).json({ error: "Not found" });

  const { trustScore, trustBreakdown } = computeTrustScore(user);
  user.set({ trustScore, trustBreakdown, trustUpdatedAt: new Date() });
  await user.save();

  res.json({ user });
}

export async function myTrust(req: AuthedRequest, res: Response) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "Not found" });
  const { trustScore, trustBreakdown } = computeTrustScore(user);
  const suggestions = await aiTrustSuggestions(user, env.aiServiceUrl);
  res.json({ trustScore, trustBreakdown, suggestions, flagged: isLowQuality(user) });
}

export async function recruiterList(req: AuthedRequest, res: Response) {
  const minScore = Number(req.query.minScore ?? 0);
  const sort = req.query.sort === "asc" ? 1 : -1;
  const skill = req.query.skill ? String(req.query.skill) : null;

  const filter: Record<string, unknown> = { trustScore: { $gte: minScore } };
  if (skill) filter["skills.name"] = skill;

  const developers = await User.find(filter)
    .sort({ trustScore: sort })
    .limit(100)
    .select("name handle avatar role location skills trustScore trustBreakdown availability")
    .lean();

  res.json({ developers });
}

export async function listUsers(req: AuthedRequest, res: Response) {
  const users = await User.find({ _id: { $ne: req.userId } })
    .select("name handle avatar role location skills trustScore availability stack")
    .limit(100)
    .lean();
  res.json({ users });
}

export async function getUser(req: AuthedRequest, res: Response) {
  const user = await User.findById(req.params.id)
    .select("-password")
    .lean();
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({ user });
}

export async function rankedMatches(req: AuthedRequest, res: Response) {
  const me = await User.findById(req.userId).lean();
  if (!me) return res.status(404).json({ error: "Not found" });

  const candidates = await User.find({ _id: { $ne: me._id } })
    .select("name handle avatar role skills stack trustScore trustBreakdown availability bio")
    .limit(200)
    .lean();

  const myStack = new Set((me.stack ?? []).map((s) => s.toLowerCase()));

  const scored = candidates.map((c) => {
    const sharedStack = (c.stack ?? []).filter((s) => myStack.has(s.toLowerCase()));
    const compat = Math.min(100, 50 + sharedStack.length * 12);
    const score = Math.round(compat * 0.8 + c.trustScore * 0.2);
    return { user: c, score, sharedStack };
  });

  scored.sort((a, b) => b.score - a.score);
  res.json({ matches: scored.slice(0, 20) });
}

export async function myActivity(req: AuthedRequest, res: Response) {
  const now = new Date();
  const result: { day: string; views: number; matches: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][start.getDay()];

    const [sent, received] = await Promise.all([
      Message.countDocuments({ sender: req.userId, createdAt: { $gte: start, $lte: end } }),
      Message.countDocuments({ receiver: req.userId, createdAt: { $gte: start, $lte: end } }),
    ]);

    result.push({ day: dayName, views: received, matches: sent });
  }

  res.json({ activity: result });
}

export async function featuredUsers(_req: AuthedRequest, res: Response) {
  const users = await User.find()
    .sort({ trustScore: -1 })
    .limit(4)
    .select("name handle avatar role trustScore availability stack skills")
    .lean();
  res.json({ users });
}
