# Practical 10: Asynchronous Processing with Event-Driven Architecture

Creating a task now emits a `task-created` event. A background listener handles the slow notification *after* the API has already responded. It uses only Node's built-in `events` module, with no external queue.

## Run

```bash
cd backend && npm install && cp .env.example .env && npm start
# create a task from the UI or with tasks.http request #12, then watch the server console
```

## Flow

```
POST /tasks → save to MongoDB → res.status(201).json(task) → emit('task-created')
                                         │                         │
                              client has its answer       listeners.js (2 s simulated work)
                                                          → [Notification] title, user, timestamp
```

## Evidence (full log: [`backend/docs/events.md`](backend/docs/events.md))

```
[API] Response sent at 08:07:34.137Z
[Listener] task-created received at 08:07:34.138Z
...
[Notification] Task "Send weekly report" created for ev@t.com | finished at 08:07:36.153Z (after 2000 ms)
```

The client got its `201` in **6 ms**. The notification finished **2 s later**.

## What's implemented

| Requirement | Where |
| --- | --- |
| Dedicated emitter module | `backend/events.js` (`class TaskEvents extends EventEmitter`) |
| Listener in a separate file, required once at startup | `backend/listeners.js`, `server.js` |
| `task-created` emitted after the response | `controllers/taskController.js` → `createTask` |
| Logs the title, timestamp and assigned user | `listeners.js` |
| Timestamps at the response point and the handler point | `[API] Response sent` vs `[Notification] ... finished` |
| **Supplementary:** slow handler (2 s, `NOTIFY_DELAY_MS`) | `listeners.js` |
| **Supplementary / assignment:** `task-deleted` event with its own message | `deleteTask` + listener |
| **Supplementary / assignment:** `error` listener catches handler failures | create a task titled `fail-notify demo` |

## Key questions

* **Why doesn't emit() block the response?** `emit()` calls listeners synchronously, but these listeners are `async`. Each runs until its first `await` and then yields, so the slow work continues later on the event loop. The response was also already sent before `emit()` was called.
* **What if the logic were inside the route?** Every `POST /tasks` would take 2 s or more, and a notification failure would turn a successful save into an error for the user.
* **Why not for millions of events?** Events live only in this process's memory: they are lost on a crash or restart, with no retries, persistence or multi-server distribution. Production systems use a queue such as RabbitMQ, BullMQ or SQS.
