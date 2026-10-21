# Practical 6: Full Stack Integration (React + Node + MongoDB)

The React frontend now talks to the Express + MongoDB backend. You can create, read, update and delete tasks from the UI, and everything is persisted.

```
practical-6/
├── backend/    Express + Mongoose API (Practical 5 + CORS)    → localhost:5000
└── frontend/   React app (Practical 3 + Tasks page)            → localhost:5173
```

## Run (two terminals)

```bash
# Terminal 1
cd backend && npm install && cp .env.example .env && npm start

# Terminal 2
cd frontend && npm install && npm run dev      # open http://localhost:5173/tasks
```

## Flow

```
UI form → POST /tasks → MongoDB → response → state updated → list re-renders
```

## What's implemented

| Requirement | Where |
| --- | --- |
| CORS enabled on Express | `backend/server.js` → `app.use(cors())` |
| One shared base URL | `frontend/src/api.js` (`VITE_API_URL`, default `http://localhost:5000`) |
| GitHub data replaced with our own `/tasks` | `frontend/src/pages/Tasks.jsx` |
| Create / view / update (toggle, rename) / delete from the UI | `Tasks.jsx`, `TaskForm.jsx`, `TaskItem.jsx` |
| Loading + error state on every API call | initial load (spinner / retry), per-row busy state, toast on failure |
| UI updated from the **server's response** | `handleUpdate`, `handleDelete` |
| **Supplementary:** optimistic create, rolled back on failure | `handleCreate` (temporary task marked `pending`) |
| **Supplementary / assignment:** confirm before delete | `components/ConfirmDialog.jsx` (native `<dialog>`) |
| **Supplementary / assignment:** toast notifications | `components/Toast.jsx` (context + `useToast()`) |

Tested end to end in a browser: create → toggle → rename → reload (data persists) → delete with confirm.

## Key questions

* **What does CORS change?** The browser blocks JavaScript on `localhost:5173` from reading responses from `localhost:5000` (a different origin) unless the server sends `Access-Control-Allow-Origin`. The `cors()` middleware adds that header.
* **Why update from the response, not assume success?** A write can fail (validation, network, server down). If the UI shows success anyway, it lies, and refreshing the page reveals the real data. The server's copy also contains fields the client doesn't know, like `_id` and `createdAt`.
* **Risk of not handling write errors?** The user thinks their task was saved or deleted when it wasn't. That is silent data loss, worse than a failed page load because nobody notices.
