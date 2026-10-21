# Practical 13: AI API Integration into a Web Application

A **"✦ Suggest with AI"** button on the task form drafts a description and suggests a priority from the task title. You can edit the draft, accept it or dismiss it. When the AI is unavailable, the app keeps working normally.

## Run

```bash
cd backend && npm install && cp .env.example .env
# put your key in .env → OPENAI_API_KEY=sk-...   (leave it empty to see the graceful fallback)
npm start
cd ../frontend && npm install && npm run dev
```

With Docker: put `OPENAI_API_KEY=...` in the root `.env`, then run `docker compose up --build`.

## Flow

```
React TaskForm ── "Suggest with AI" ──► POST /api/ai/suggest  (auth + rate limit)
                                               │  API key read from .env, server-side only
                                               ▼
                                     OpenAI chat.completions (gpt-4o-mini, JSON mode)
                                               │
   editable suggestion card ◄── { description, priority, fallback: false }
   friendly notice          ◄── { fallback: true }   (bad key, timeout, quota, no key)
```

## What's implemented

| Requirement | Where |
| --- | --- |
| A meaningful AI feature (description + priority from the title) | `backend/controllers/aiController.js` |
| API key only on the backend (`.env`), never in React | `aiController.js`; the frontend calls `/api/ai/suggest` |
| Graceful degradation (200 + `fallback: true`, 10 s timeout) | `fallback()` in `aiController.js` |
| Rendered as an editable suggestion, not raw JSON | `frontend/src/components/TaskForm.jsx` → `.ai-card` |
| **Supplementary / assignment:** loading state | button shows "Thinking..." |
| **Supplementary:** rate limit of 1 request per task per minute (429 + `Retry-After`) | `backend/middleware/aiRateLimit.js` |
| **Supplementary / assignment:** visible AI disclaimer | "AI-generated. Review and edit it before saving." |
| Only logged-in users can spend quota | mounted behind `auth` in `app.js` |
| Tests never call the real API | 3 new tests: fallback, 429, 401 (**13 total**) |

Verified:

* A real request with an invalid key gets a 401 from OpenAI, the UI shows the fallback notice, and the task is still created.
* The success path was tested against a local mock of the OpenAI API (via `OPENAI_BASE_URL`).

## Key questions

* **Why call the AI from the backend?** Anything in React ships to the browser. The key would be visible in DevTools → Network or in the JS bundle, and anyone could spend your quota.
* **Graceful degradation?** When a dependency you don't control fails, the core app keeps working with reduced features. The AI is a nice-to-have, so creating tasks must never depend on it.
* **Privacy and governance.** Only the task title is sent. User emails, IDs and other tasks are never sent. Personal data, passwords, API keys, health or financial details, and anything confidential should not go to a third-party model, which may log or retain it.
