# Practical 3: API Integration and Data Rendering in React

The Projects page now fetches live repositories from the **GitHub REST API**, handling the loading, error and success states.

## Run

```bash
npm install
npm run dev        # http://localhost:5173/projects
```

Change the username in `src/data.js` (`githubUser`). The default is `octocat`.

## Flow

```
Projects.jsx
  useEffect([attempt])  → fetch on mount (and when Retry is pressed)
  useState: repos, loading, error
  [loading] → <Spinner />
  [error]   → <ErrorMessage onRetry />
  [success] → search input + <RepoList data={filtered} />
```

## What's implemented

| Requirement | Where |
| --- | --- |
| Fetch a public REST API on mount with `useEffect` | `pages/Projects.jsx` |
| 3 state variables: data / loading / error | `repos`, `loading`, `error` |
| Loading spinner component | `components/Spinner.jsx` |
| Error message component | `components/ErrorMessage.jsx` |
| Repo name + URL rendered for each item | `components/RepoList.jsx` |
| `.finally()` always clears loading | `Projects.jsx` |
| **Supplementary / assignment:** Retry button | bumps `attempt`, which re-runs the effect |
| **Supplementary / assignment:** search filter by name | `query` state |
| **Supplementary:** star count | `★ stargazers_count` in `RepoList.jsx` |

Extra: `res.ok` is checked, so a 404 or a rate-limit response shows the error state instead of crashing on `.map`. An `ignore` flag also prevents state updates from a stale request.

**To test the error path**, set `githubUser` to a name that doesn't exist, or go offline in DevTools.

## Key questions

* **Why `useEffect` and not fetch in the body?** The component body runs on every render. Fetching there would call `setRepos`, which triggers a render, which fetches again: an infinite loop. `useEffect(..., [])` runs once after mount.
* **Loading vs error.** Loading means "no answer yet". Error means "the answer is a failure". They need different UI and different actions (wait vs retry), so both are tracked separately.
* **Without them?** The user would see a blank page with no feedback while waiting. On a failure, `data.map` would throw and crash the app.
