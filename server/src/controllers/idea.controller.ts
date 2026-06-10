import type { Response } from "express";
import { z } from "zod";
import { StartupIdea } from "../models/StartupIdea.js";
import type { AuthedRequest } from "../middleware/auth.js";

const AUTHOR_FIELDS = "name handle avatar role trustScore";

const createSchema = z.object({
  title: z.string().min(3),
  pitch: z.string().optional().default(""),
  lookingFor: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
});

function mapIdea(idea: any) {
  return {
    ...idea,
    id: String(idea._id),
    upvotes: Array.isArray(idea.upvotes) ? idea.upvotes.length : (idea.upvotes ?? 0),
    comments: idea.commentsCount ?? 0,
  };
}

export async function listIdeas(req: AuthedRequest, res: Response) {
  const ideas = await StartupIdea.find()
    .populate("author", AUTHOR_FIELDS)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json({ ideas: ideas.map(mapIdea) });
}

export async function createIdea(req: AuthedRequest, res: Response) {
  const body = createSchema.parse(req.body);
  const idea = await StartupIdea.create({ ...body, author: req.userId });
  const populated = await StartupIdea.findById(idea._id).populate("author", AUTHOR_FIELDS).lean();
  res.status(201).json({ idea: mapIdea(populated) });
}

export async function upvoteIdea(req: AuthedRequest, res: Response) {
  const idea = await StartupIdea.findById(req.params.id);
  if (!idea) return res.status(404).json({ error: "Not found" });
  const hasVoted = (idea.upvotes as any[]).some((id: any) => String(id) === req.userId);
  if (hasVoted) {
    (idea as any).upvotes = (idea.upvotes as any[]).filter((id: any) => String(id) !== req.userId);
  } else {
    (idea.upvotes as any[]).push(req.userId);
  }
  await idea.save();
  res.json({ upvotes: idea.upvotes.length, voted: !hasVoted });
}
