"""DevMesh AI — recommendation + trust analysis microservice.

Designed to degrade gracefully: if OPENAI_API_KEY is absent or the API errors,
every endpoint falls back to deterministic heuristics so the Node backend
(and therefore the product) never blocks on the LLM.
"""
from __future__ import annotations

import os
from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel

try:
    from openai import OpenAI
    _client: Optional["OpenAI"] = OpenAI() if os.getenv("OPENAI_API_KEY") else None
except Exception:  # openai not installed / misconfigured
    _client = None

app = FastAPI(title="DevMesh AI Service", version="0.1.0")


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class Skill(BaseModel):
    name: str
    level: int = 0


class TrustBreakdown(BaseModel):
    profile: int = 0
    github: int = 0
    certificates: int = 0
    projects: int = 0
    activity: int = 0


class TrustAnalyzeRequest(BaseModel):
    bio: Optional[str] = ""
    skills: list[Skill] = []
    breakdown: TrustBreakdown
    score: int = 0


class TrustAnalyzeResponse(BaseModel):
    suggestions: list[str]
    consistency: float          # 0..1 — how well bio/skills cohere
    flagged: bool               # likely fake/weak profile


class Candidate(BaseModel):
    id: str
    stack: list[str] = []
    trust_score: int = 0
    bio: str = ""


class RecommendRequest(BaseModel):
    me_stack: list[str] = []
    me_bio: str = ""
    candidates: list[Candidate] = []


class Ranked(BaseModel):
    id: str
    score: int


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"ok": True, "llm": _client is not None}


@app.post("/trust/analyze", response_model=TrustAnalyzeResponse)
def trust_analyze(req: TrustAnalyzeRequest):
    b = req.breakdown
    # Heuristic skill-consistency: do the stated skills line up with proof?
    proof = (b.github + b.projects + b.certificates) / 3
    claimed = (sum(s.level for s in req.skills) / len(req.skills)) if req.skills else 0
    consistency = max(0.0, 1.0 - abs(claimed - proof) / 100.0)
    flagged = req.score < 30 or (claimed > 70 and proof < 25)

    if _client:
        try:
            return _llm_trust(req, consistency, flagged)
        except Exception:
            pass
    return TrustAnalyzeResponse(
        suggestions=_rule_suggestions(req),
        consistency=round(consistency, 2),
        flagged=flagged,
    )


@app.post("/recommend", response_model=list[Ranked])
def recommend(req: RecommendRequest):
    me = {s.lower() for s in req.me_stack}
    ranked: list[Ranked] = []
    for c in req.candidates:
        overlap = len(me & {s.lower() for s in c.stack})
        compat = min(100, 50 + overlap * 12)
        # 80% compatibility + 20% trust — mirrors the Node ranking.
        ranked.append(Ranked(id=c.id, score=round(compat * 0.8 + c.trust_score * 0.2)))
    ranked.sort(key=lambda r: r.score, reverse=True)
    return ranked


@app.post("/search")
def search(payload: dict):
    # Reference stub: in production, embed the query and run ANN over the
    # developer vector index (pgvector / Pinecone). Falls back to echo here.
    return {"query": payload.get("q", ""), "results": [], "mode": "stub"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _rule_suggestions(req: TrustAnalyzeRequest) -> list[str]:
    b, out = req.breakdown, []
    if b.projects < 60:
        out.append("Add 2-3 projects with descriptions, tech stack, and live links.")
    if b.certificates < 60:
        out.append("Add verified certificates — verified issuers weigh more.")
    if b.github < 60:
        out.append("Connect GitHub to surface repos, commits, and language diversity.")
    if b.profile < 60:
        out.append("Complete your bio, role, and availability.")
    if b.activity < 60:
        out.append("Join a team and stay active in chats.")
    if req.score < 50:
        out.insert(0, "Below recruiter visibility threshold — prioritize projects and certificates.")
    return out[:4]


def _llm_trust(req: TrustAnalyzeRequest, consistency: float, flagged: bool) -> TrustAnalyzeResponse:
    skills = ", ".join(f"{s.name}({s.level})" for s in req.skills) or "none"
    prompt = (
        "You are a technical recruiter assistant. Given a developer's profile, "
        "return 3-4 short, specific, actionable suggestions to raise their trust score. "
        f"Bio: {req.bio!r}. Skills: {skills}. Sub-scores: {req.breakdown.model_dump()}. "
        f"Overall: {req.score}/100. One suggestion per line, no numbering."
    )
    resp = _client.chat.completions.create(  # type: ignore[union-attr]
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=180,
        temperature=0.4,
    )
    text = resp.choices[0].message.content or ""
    lines = [l.strip("-• ").strip() for l in text.splitlines() if l.strip()]
    return TrustAnalyzeResponse(
        suggestions=lines[:4] or _rule_suggestions(req),
        consistency=round(consistency, 2),
        flagged=flagged,
    )
