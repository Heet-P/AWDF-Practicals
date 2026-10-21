# Practical 5: MongoDB Integration and Schema Design with Mongoose

This replaces the in-memory array from Practical 4 with **MongoDB** via **Mongoose**, using a validated schema.

## Run

```bash
npm install
cp .env.example .env        # set MONGO_URI (local MongoDB or Atlas)
npm start                   # http://localhost:5000
```

Data now survives a server restart. Check it in MongoDB Compass (`taskdb.tasks`).

## Schema (`models/Task.js`)

| Field | Type | Rules |
| --- | --- | --- |
| `title` | String | **required** (custom message), trimmed by a pre-save hook |
| `description` | String | default `''` |
| `completed` | Boolean | default `false` |
| `priority` | String | **Supplementary / assignment:** enum `low` / `medium` / `high`, default `medium` |
| `createdAt` | Date | default `Date.now` |

## What's implemented

| Requirement | Where |
| --- | --- |
| Connection string from `.env` (never hard-coded) | `server.js`, `.env.example` |
| Server only listens after MongoDB connects | `server.js` |
| CRUD via `Task.find / create / findByIdAndUpdate / findByIdAndDelete` | `controllers/taskController.js` |
| `try/catch` + `next(err)` in every handler | same |
| Validation errors returned as clean JSON | `middleware/errorHandler.js` |
| **Supplementary:** pre-save hook trims the title | `models/Task.js` |
| **Supplementary / assignment:** `GET /tasks/:id` with JSON 404 | `getTask` |
| `runValidators: true` on update, so enum rules also apply to PUT | `updateTask` |

Example validation response:

```json
{ "error": "Validation failed",
  "details": { "title": "title is required", "priority": "priority must be low, medium or high" } }
```

## Key questions

* **Why a schema if MongoDB is schema-less?** MongoDB will store any shape, including typos and missing fields. Mongoose gives the *application* one consistent shape, so every task has the same fields and types.
* **Why not rely on frontend validation?** Anyone can call the API directly (Postman, curl, scripts) and skip the UI. The server is the last line of defence.
* **Where is an invalid request stopped?** In Mongoose's `validate()`, which runs before `save` sends anything to MongoDB. It throws a `ValidationError`, the `catch` passes it to `next(err)`, and the error handler turns it into a 400. The database is never touched.
