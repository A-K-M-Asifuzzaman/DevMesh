# DevMesh AI — AI Service (FastAPI)

LLM/embedding microservice consumed by the Node backend.

Endpoints:
- `POST /recommend`     → teammate/cofounder ranking via embeddings + trust blend
- `POST /trust/analyze` → skill-consistency analysis → improvement suggestions
- `POST /search`        → semantic developer search

Run:
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY=sk-...
uvicorn app.main:app --reload --port 8000
```
Without `OPENAI_API_KEY` the service runs in heuristic fallback mode so the
platform keeps working offline.
