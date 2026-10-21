# Practical 9: In-Memory Caching and Query Optimisation

This adds **node-cache** to the backend: `GET /tasks` and `GET /tasks/:id` are cached (60 s TTL), and the cache is invalidated on every write.
The frontend is unchanged from Practical 8.

## Run

```bash
cd backend && npm install && cp .env.example .env && npm start
npm run benchmark                       # seeds 2000 tasks and times 5 requests
# set CACHE_ENABLED=false in .env, restart, run the benchmark again for the uncached numbers
```

## Flow

```
GET /tasks → cache.get('tasks:<userId>')
               HIT  → return immediately            (X-Cache: HIT)
               MISS → MongoDB → cache.set → return   (X-Cache: MISS)

POST / PUT / DELETE → write to MongoDB → cache.del(list key [+ single-task key])
```

## Results (full report: [`backend/docs/caching.md`](backend/docs/caching.md))

| GET /tasks (2000 tasks) | Avg |
| --- | --- |
| Cache HIT (readings 2–5) | **17.4 ms** |
| No cache (5 readings) | **32.5 ms** |

## What's implemented

| Requirement | Where |
| --- | --- |
| Shared cache instance, `stdTTL: 60` | `backend/cache.js` |
| Read-through caching on GET | `controllers/taskController.js` → `cached()` |
| Invalidation on POST, PUT and DELETE | `invalidate()` |
| Response-time comparison, 3+ readings per case | `scripts/benchmark.js`, `docs/caching.md` |
| **Supplementary / assignment:** `GET /tasks/:id` cached under its own key | `keys.task(userId, id)` |
| **Supplementary / assignment:** hit/miss counter via a debug endpoint | `GET /debug/cache` |
| **Supplementary:** TTL configurable for experiments | `CACHE_TTL` in `.env` |
| Query optimisation | `.lean()` + compound index `{ user: 1, createdAt: -1 }` |

**Note:** the cache keys are per user (`tasks:<userId>`). The PDF's single `all_tasks` key would leak one user's tasks to another now that Practical 7 made tasks private.

## Key questions

* **Why invalidate on every write?** Otherwise `GET` keeps returning the old list for up to 60 s after a change. Users see edits "not saving", which is a correctness bug.
* **Reasonable TTL?** 30–120 s for a task list. A longer TTL gives more hits but a bigger staleness window if some write path forgets to invalidate. A shorter TTL is fresher but gives fewer hits.
* **Why not with multiple servers?** Each Node process has its own memory. A write on server A doesn't clear server B's cache, so B serves stale data. A shared cache like Redis is needed.
