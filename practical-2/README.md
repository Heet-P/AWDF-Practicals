# Practical 2: State Management and Routing in React

This extends the Practical 1 portfolio with **React Router v6** (multi-page, no full reloads) and **useState**.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

## Routes added

| Path | Component |
| --- | --- |
| `/` | `pages/Home.jsx` (Header + About + Skills) |
| `/projects` | `pages/Projects.jsx` |
| `/contact` | `pages/Contact.jsx` (controlled form) |
| `*` | `pages/NotFound.jsx` (custom 404) |

## What's implemented

| Requirement | Where |
| --- | --- |
| `BrowserRouter` wraps the app once | `src/main.jsx` |
| `Routes` / `Route` for 3+ routes | `src/App.jsx` |
| Navigation with `NavLink` (not `<a>`) | `components/NavBar.jsx` |
| useState #1: controlled input, shown live | `Contact.jsx` → `message` |
| useState #2: toggles UI visibility | `Contact.jsx` → `showHelp` (help hint) |
| **Supplementary / assignment:** 404 route | `NotFound.jsx` on `path="*"` |
| **Supplementary / assignment:** dark/light toggle on the root element | `App.jsx` → `theme` state toggles `html.dark` |
| **Supplementary:** live character count | `Contact.jsx` (`message.length / 280`) |

## Key questions

* **Link vs `<a>`.** `<a href>` makes the browser request a new HTML page, which reloads the page and loses all state. `<Link>` / `<NavLink>` call `history.pushState`, so React Router swaps the component without a reload.
* **Props vs state.** Props are read-only data passed in by a parent. State is data a component owns and changes over time. The text being typed changes on every keystroke, so it must be state.
* **Controlled input.** The input's `value` comes from state, and `onChange` updates that state. React is the single source of truth, which is why the preview and the counter stay in sync.
