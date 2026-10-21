# AWDF Practicals (ITUE301)

This repo has 13 practicals, each in its own folder (`practical-1` … `practical-13`). One Docker command runs all of them at once, each on its own port, with a landing page that links to every practical.

---

## Run everything (step by step)

### 1. One-time setup

1. Install **Docker Desktop** and **WSL 2** (both are already done on this machine).
2. Open **Docker Desktop** and wait until the bottom-left corner says **Engine running**.

### 2. Start all practicals

Open a terminal in this folder (`AWDF/`). In VS Code: **Terminal → New Terminal**.

```bash
# Optional: only needed for a real AI key (Practical 13) or your own JWT secret
copy .env.example .env        # PowerShell / cmd   (Git Bash: cp .env.example .env)

docker compose up --build -d
```

* The **first run takes about 5–10 minutes**, because it builds 23 small images. Later starts take seconds.
* `-d` runs everything in the background, so you can close the terminal.

### 3. Check that it's running

```bash
docker compose ps
```

You should see **24 services**, all `Up`, and `mongodb` should show `(healthy)`.

### 4. Open the landing page

**<http://localhost:3000>**

The pill at the top right should say **13 / 13 running**. Click any card, then **Open live app**.

### 5. Use the apps

| Practical | Open in browser | API |
| --- | --- | --- |
| 1 Components & props | <http://localhost:3001> | n/a |
| 2 State & routing | <http://localhost:3002> | n/a |
| 3 API integration | <http://localhost:3003/projects> | GitHub |
| 4 REST API (in-memory) | <http://localhost:3004/tasks> | itself |
| 5 MongoDB + Mongoose | <http://localhost:3005/tasks> | itself |
| 6 Full stack | <http://localhost:3006/tasks> | :5006 |
| 7 Authentication | <http://localhost:3007> | :5007 |
| 8 Lazy loading | <http://localhost:3008> | :5008 |
| 9 Caching | <http://localhost:3009> | :5009 |
| 10 Events | <http://localhost:3010> | :5010 |
| 11 Docker | <http://localhost:3011> | :5011 |
| 12 CI | <http://localhost:3012> | :5012 |
| 13 AI | <http://localhost:3013> | :5013 |

* **From Practical 7 on, you must register first.** Each practical has its **own database** (`practical7`, `practical8`, …), so an account made in one doesn't exist in the others.
* Practicals 4 and 5 are APIs only. Use `practical-4/tasks.http` / `practical-5/tasks.http` (VS Code REST Client) or Postman to POST, PUT and DELETE.
* MongoDB is exposed on `localhost:27017`, so **MongoDB Compass** can connect to `mongodb://localhost:27017` and show each practical's database.

---

## Everyday commands

| What | Command |
| --- | --- |
| Stop everything (keeps data) | `docker compose stop` |
| Start again (fast, no rebuild) | `docker compose up -d` |
| Stop and remove containers (keeps data) | `docker compose down` |
| **Wipe all data** too | `docker compose down -v` |
| Rebuild after you change code, e.g. Practical 7 | `docker compose up --build -d p7 p7-api` |
| Watch one backend's console | `docker compose logs -f p10-api` |

**Viva demos using logs:**
* `docker compose logs -f p10-api`: create a task in <http://localhost:3010> and watch `[API] Response sent` appear before `[Notification] …`.
* `docker compose logs -f p4`: see the request logger from Practical 4.
* Open <http://localhost:3009/tasks>, refresh it a few times, then open <http://localhost:5009/debug/cache> to see the cache `hits` and `misses` go up. In DevTools → Network, the `/tasks` response header shows `X-Cache: HIT` or `MISS`.

---

## Run a single practical with npm (hot reload, for editing code)

Each folder's `README.md` has its exact steps. The pattern is:

```bash
docker compose up -d mongodb          # reuse the Docker MongoDB on localhost:27017

cd practical-7/backend
copy .env.example .env
npm install
npm start                             # API on http://localhost:5000

# second terminal
cd practical-7/frontend
npm install
npm run dev                           # app on http://localhost:5173
```

These use ports **5000 / 5173**, so they don't clash with the all-in-one stack.

### Special cases

* **Practical 11's own `docker-compose.yml`** (the one the practical asks for) also uses port 27017. Run `docker compose down` here first, then:
  ```bash
  cd practical-11
  docker compose up --build        # → http://localhost:5173
  ```
* **Practical 12 / 13 tests** need MongoDB on 27017:
  ```bash
  docker compose up -d mongodb
  cd practical-12/backend && npm install && npm test     # 10 tests
  cd practical-13/backend && npm install && npm test     # 13 tests
  ```
  The GitHub Actions workflow only runs once `practical-12/` is pushed as the root of its own GitHub repository.
* **Practical 13 with a real AI key:** put `OPENAI_API_KEY=sk-...` in `.env` (this folder), then run `docker compose up -d p13-api`. Without a key, the AI button shows a friendly fallback, which is the graceful degradation the practical asks for.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `failed to connect to the docker API` | Docker Desktop isn't running. Open it and wait for **Engine running**. |
| `port is already allocated` | Something else is using that port, often Practical 11's own compose or a local `mongod`. Stop it, or run `docker compose down` in the other folder. |
| Landing page says **Not running** | Run `docker compose ps`. If services are missing, run `docker compose up -d`. |
| A page loads but tasks don't | The API may still be starting. Wait 10 s, then run `docker compose logs p7-api`. |
| You changed code and nothing happened | Containers run built images, so rebuild: `docker compose up --build -d <service>`. |
| Out of disk space | `docker system prune` removes old images and build cache. |

---

## Folder map

```
AWDF/
├── index.html            landing page (served on :3000)
├── docker-compose.yml    all practicals at once
├── docker/               shared Dockerfiles used by docker-compose.yml
├── practical-1 … 3/      React (Vite)
├── practical-4 … 5/      Express API
└── practical-6 … 13/     backend/ + frontend/
```
