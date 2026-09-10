# Roaya grounded assistant

The assistant is part of Roaya's existing public layout and calls the existing Express API at `POST /api/v1/rag/chat`.

## How grounding works

1. `npm run rag:build` extracts bilingual public website copy into `roaya-website/rag/corpus.json`. Admin screens and internal files are excluded.
2. A free local relevance gate searches the committed corpus plus live, published CMS records first.
3. Unrelated questions are refused locally, before any model request is made.
4. Optional OpenAI vector search runs only after the local gate passes and only when `RAG_ENABLE_VECTOR_SEARCH=true`.
5. Supported questions use a short, focused context and a capped answer; repeated requests are served from an in-memory cache.
6. The default generator is a local Ollama model, so normal chat usage has no per-token API charge.
7. The generation prompt allows answers only from retrieved passages. API keys never reach Angular.

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and fill the existing database/JWT settings.
2. Install Ollama, then download the local multilingual model with `ollama pull qwen3.5:4b` (about 3.4 GB).
3. Keep `RAG_GENERATION_PROVIDER=ollama`; no OpenAI API key is needed.
4. For a local chatbot-only demo, run `npm run dev:rag` from the repository root. This starts port 3001 without requiring PostgreSQL or Redis.
5. Start the Angular website normally on port 4200 (or its selected development port).

If Ollama is unavailable, the assistant safely falls back to grounded excerpts from Roaya content instead of calling OpenAI.

OpenAI remains an optional provider. To use it, set `RAG_GENERATION_PROVIDER=openai` and `OPENAI_API_KEY`. For optional semantic vector search, run `npm run rag:sync`, copy the printed `OPENAI_VECTOR_STORE_ID` into `backend/.env`, and set `RAG_ENABLE_VECTOR_SEARCH=true`.

Re-run `npm run rag:sync` after major static content changes. Published CMS content is also searched live and is refreshed in the assistant cache every 60 seconds.

## Safety controls

- Public endpoint rate limit: 12 requests/minute/IP.
- Maximum question: 800 characters; maximum history: 8 messages.
- Default local model: `qwen3.5:4b` through Ollama with thinking disabled.
- Responses are capped at 320 generated tokens.
- Optional OpenAI calls use `store: false`.
- At most four retrieved chunks and 4,200 context characters are sent to the model.
- Identical requests are cached for 10 minutes (up to 200 entries per server process).
- Retrieved content is explicitly treated as reference data, not instructions.
- Sources shown in the UI are restricted to internal Roaya paths.
