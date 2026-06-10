import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncH } from "../middleware/error.js";
import { listIdeas, createIdea, upvoteIdea } from "../controllers/idea.controller.js";

const r = Router();
r.use(requireAuth);
r.get("/ideas", asyncH(listIdeas));
r.post("/ideas", asyncH(createIdea));
r.post("/ideas/:id/upvote", asyncH(upvoteIdea));
export default r;
