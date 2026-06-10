import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncH } from "../middleware/error.js";
import { myTeams, allTeams, createTeam, joinTeam } from "../controllers/team.controller.js";

const r = Router();
r.use(requireAuth);
r.get("/teams/mine", asyncH(myTeams));
r.get("/teams", asyncH(allTeams));
r.post("/teams", asyncH(createTeam));
r.post("/teams/:id/join", asyncH(joinTeam));
export default r;
