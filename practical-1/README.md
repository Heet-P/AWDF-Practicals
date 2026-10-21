# Practical 1: Introduction to React and Component Architecture

A student portfolio built with **Vite + React**, made of small reusable components that receive their data as props.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

## What's implemented

| Requirement | Where |
| --- | --- |
| Vite + React project | `package.json`, `vite.config.js` |
| 4+ reusable components: Header, About, Skills, Footer | `src/components/` |
| Composed into one single-page layout | `src/App.jsx` |
| Props into 2+ components | `name`, `tagline`, `themeColor` → Header · `bio` → About · `skillList` → Skills · `name`, `email` → Footer |
| **Supplementary:** NavBar highlights the active section | `NavBar.jsx` (IntersectionObserver) |
| **Supplementary:** skills array rendered dynamically | `Skills.jsx` (`skillList.map`) |
| **Supplementary:** theme colour prop as inline style | `Header.jsx` (`style={{ color: themeColor }}`) |
| **Assignment:** Projects component with 3 projects | `Projects.jsx` |

All data lives in `App.jsx` and flows down to the components, so no component hard-codes content.

```
App.jsx
├── NavBar.jsx    (sections → active link)
├── Header.jsx    (name, tagline, themeColor)
├── About.jsx     (bio)
├── Skills.jsx    (skillList)
├── Projects.jsx  (projects)
└── Footer.jsx    (name, email)
```

## Key questions

* **Role of each component?** Each one owns exactly one part of the page: the Header shows identity, About shows the bio, Skills shows the list, Footer shows contact. `App` only composes them and owns the data.
* **How does React re-render when props change?** When a parent re-renders with new props, React calls the child function again. It then compares the new JSX with the previous output (reconciliation) and updates only the DOM nodes that actually changed.
* **Why reusability matters at scale?** A fix or style change is made in one place, not copied across files. Components can be tested in isolation, and teams can work on separate components without conflicts.
