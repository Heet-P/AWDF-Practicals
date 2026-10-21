# Practical 4: Building a RESTful API with Node.js and Express

A **Task Manager API** with full CRUD on an in-memory array, a request logger, and a global error handler.

## Run

```bash
npm install
npm start          # http://localhost:5000
```

Test with `tasks.http` (VS Code REST Client), Postman or Thunder Client.

## Endpoints

| Method | Path | Success | Errors |
| --- | --- | --- | --- |
| GET | `/tasks` | 200 | |
| GET | `/tasks/:id` | 200 | 400 bad id · 404 |
| POST | `/tasks` | 201 | 400 missing title · 415 not JSON |
| PUT | `/tasks/:id` | 200 | 400 · 404 · 415 |
| DELETE | `/tasks/:id` | 200 | 400 · 404 |
| any | unknown route | | 404 JSON |
| GET | `/debug/error` | | 500 (demo of the error handler) |

## Middleware pipeline (`server.js`)

```
express.json() → logger → routes → notFound (404) → errorHandler (500)
                          └─ per route: validateId → requireJson → controller
```

| File | Purpose |
| --- | --- |
| `middleware/logger.js` | logs `METHOD URL - timestamp` for every request |
| `middleware/requireJson.js` | **Supplementary / assignment:** rejects POST/PUT without `Content-Type: application/json` (415) |
| `middleware/validateId.js` | **Supplementary:** route-specific id check before the controller |
| `middleware/notFound.js` | **Supplementary / assignment:** structured JSON 404 |
| `middleware/errorHandler.js` | global handler, registered last; logs the stack but never sends it |
| `controllers/taskController.js` | `getAllTasks`, `getTask`, `createTask`, `updateTask`, `deleteTask` |

## Key questions

* **Why is the error handler last?** Express runs middleware in registration order. An error handler (4 arguments) only receives errors raised by middleware registered *before* it. Placed first, it would never see route errors.
* **`app.use()` vs route-specific middleware?** `app.use(fn)` runs for every request (logger, JSON parser). `router.post('/', requireJson, handler)` runs only for that route.
* **Why not send stack traces?** They expose file paths, library versions and internal logic to attackers, and they mean nothing to API users. The handler logs them on the server and returns a generic message.
