# Practical 7: Authentication and Middleware Pipeline

This adds **register / login with bcrypt + JWT**, protects every task route, and validates input on the server. Each user only sees their own tasks.

## Run

```bash
cd backend && npm install && cp .env.example .env    # set a long random JWT_SECRET
npm start
cd ../frontend && npm install && npm run dev          # http://localhost:5173 → redirects to /login
```

`backend/tasks.http` walks through register → login → token → protected routes → tampered token.

## Pipeline

```
POST /auth/register → validateCredentials → bcrypt.hash → save User → 201
POST /auth/login    → validateCredentials → bcrypt.compare → jwt.sign (1h) → { token }

/tasks/*  →  auth (verify Bearer token, set req.user)  →  validateTask  →  controller
```

## What's implemented

| Requirement | Where |
| --- | --- |
| User schema; the password hash is never sent back (`toJSON`) | `backend/models/User.js` |
| bcrypt hashing (cost 10) | `controllers/authController.js` |
| JWT with expiry from `.env` (`JWT_EXPIRES_IN=1h`) | `signToken()` |
| Auth middleware: missing → 401, tampered → 401, expired → 401 "Token expired" | `middleware/auth.js` |
| Applied to **all** task routes | `server.js` → `app.use('/tasks', auth, taskRoutes)` |
| Server-side validation + sanitisation (trim, type checks, whitelist) | `middleware/validate.js` |
| `JWT_SECRET` only from `.env`; the server refuses to start without it | `server.js` |
| Tasks scoped to the logged-in user | `Task.user` + every query filters on `req.user.id` |
| **Supplementary / assignment:** `GET /auth/me` | `authController.me` |
| **Supplementary / assignment:** 401 → redirect to login | `frontend/src/api.js` clears the token and fires `auth:logout` → `ProtectedRoute` |
| **Supplementary:** logout clears the token | `frontend/src/auth.jsx` |

Verified:

* Stored passwords start with `$2b$10$`.
* A `user` field sent in the body is ignored.
* An expired token sends the browser back to `/login`.

## Key questions

* **Why hash even in a demo?** Databases leak, and people reuse passwords. A bcrypt hash can't be reversed, it is salted per user (so identical passwords look different), and it is slow on purpose, which makes brute force impractical.
* **What does the auth middleware verify?** It checks that the token's signature was made with our `JWT_SECRET` (so it hasn't been tampered with) and that it hasn't expired. If the token is missing or invalid, it returns 401 and the controller never runs.
* **Why validate on the server too?** The frontend can be bypassed with Postman or curl. Only the server's checks are guaranteed to run.
