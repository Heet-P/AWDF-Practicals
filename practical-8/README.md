# Practical 8: Performance Optimisation and Lazy Loading in React

The frontend now uses route-based code splitting (`React.lazy` + `Suspense`) and lazy-loads a heavy chart library. The before/after numbers below were measured.
The backend is unchanged from Practical 7.

## Run

```bash
cd backend && npm install && cp .env.example .env && npm start
cd ../frontend && npm install && npm run dev
npm run build      # shows the separate chunk files
```

## Results (full report: [`docs/performance.md`](docs/performance.md))

| | Before | After |
| --- | --- | --- |
| Initial JS bundle (build) | 548.92 kB (164.80 kB gzip) | 164.07 kB (54.40 kB gzip) |
| JS transferred on first visit | 159.8 KB | 56.1 KB |
| Load on Slow 3G (median of 3) | 3507 ms | 1831 ms |

## What's implemented

| Requirement | Where |
| --- | --- |
| `lazy()` for the Tasks, Contact, Login and NotFound routes | `frontend/src/App.jsx` |
| `Suspense` around the `Routes` block only, so the NavBar and Footer stay visible | `App.jsx` |
| Meaningful fallback UI | `components/DelayedFallback.jsx` → spinner |
| Before/after measurements + screenshot | `docs/performance.md`, `docs/suspense-fallback-slow3g.png` |
| **Supplementary / assignment:** heavy third-party component (recharts) loaded only on demand | `pages/Tasks.jsx` → `lazy(() => import('../components/TaskChart.jsx'))`, behind "Show chart" |
| **Supplementary:** 300 ms minimum-delay fallback (no flicker) | `DelayedFallback.jsx` |
| **Supplementary / assignment:** an unnecessary re-render, found and fixed | `TaskItem.jsx` wrapped in `memo()` + `useCallback` handlers in `Tasks.jsx` |

## Key questions

* **Initial bundle vs lazy chunk?** The initial bundle downloads before anything renders. A lazy chunk downloads the first time its route or component is actually needed.
* **Why faster if the total code is the same?** The first screen only waits for the code it needs. The rest is fetched later, in the background or on demand, and some users never visit those pages at all.
* **When is it not worth it?** In tiny apps (like Practical 1), each chunk adds a network round-trip and a loading state, which can cost more than it saves.
