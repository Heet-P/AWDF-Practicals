# Practical 11: Containerisation with Docker and Docker Compose

The whole stack (React frontend, Express backend, MongoDB) runs with **one command**.

## Run

```bash
docker compose up --build
# open http://localhost:5173
docker ps            # three containers: task-ui, task-api, taskdb
docker compose down  # stop (add -v to also delete the database volume)
```

No manual steps are needed. Optionally, copy `.env.example` to `.env` to set your own `JWT_SECRET`.

## Architecture (`docker-compose.yml`)

```
app-network (bridge)
├── frontend  task-ui   nginx serving the built React app   host 5173 → 80
├── backend   task-api  node server.js                      host 5000 → 5000
└── mongodb   taskdb    mongo:7 + named volume mongo-data   host 27017 → 27017
```

## What's implemented

| Requirement | Where |
| --- | --- |
| Backend Dockerfile (layer-cached `npm ci`) | `backend/Dockerfile` |
| Frontend Dockerfile | `frontend/Dockerfile` |
| Compose file orchestrating all 3 services | `docker-compose.yml` |
| Port mappings + internal bridge network | `ports:`, `networks: app-network` |
| Backend reaches MongoDB by **service name** | `MONGO_URI: mongodb://mongodb:27017/taskdb` |
| Backend waits until MongoDB is actually ready | `healthcheck` + `depends_on: condition: service_healthy` |
| **Supplementary / assignment:** `.dockerignore` excludes `node_modules` and `.env` | `backend/.dockerignore`, `frontend/.dockerignore` |
| **Supplementary:** multi-stage frontend build (~75 MB final image vs 273 MB for the Node backend image) | `frontend/Dockerfile` (node build → nginx) |
| **Supplementary / assignment:** named volume so data persists | `volumes: mongo-data` |
| SPA routing in nginx (refreshing `/tasks` works) | `frontend/nginx.conf` |

**Deviations from the PDF**
* The images use `node:22-alpine` instead of `node:18`. Node 18 is end-of-life, and Vite 8 needs Node 20.19+.
* The frontend is served by nginx on port 80 (mapped to 5173) instead of `vite preview`.

## Key questions

* **Why `mongodb` and not `localhost`?** Inside a container, `localhost` is that container itself. Compose runs a DNS on `app-network` that resolves each service name to its container.
  The **browser**, however, runs on the host. So the frontend's `VITE_API_URL` is `http://localhost:5000` (the host-mapped port), not `http://backend:5000`.
* **EXPOSE vs `ports:`.** `EXPOSE` only documents which port the app listens on inside the image. `ports: "5000:5000"` actually publishes it on the host.
* **Why not copy `node_modules`?** Native modules compiled on Windows/macOS won't run on Linux containers. It also bloats the build context and breaks reproducibility. `npm ci` inside the image installs exactly what `package-lock.json` specifies.
