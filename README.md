# 🌍 Erasmus Atlas — Interactive Erasmus+ Experience Map

**Erasmus Atlas** is a modern web platform that visualizes **Erasmus+ student life across Europe** — blending personal posts, interactive maps, and country analytics.  
It’s designed to showcase real student experiences and provide insights into living, studying, and traveling abroad.

---

## ✨ Features Overview

### 🗺️ Interactive Map  
- Explore posts from Erasmus students across **Europe’s real cities**.  
- Markers cluster automatically and display multiple posts per city.  
- Each post includes a topic (Food, Housing, Nightlife, etc.) with color-coded markers.  
- Posts are stored with **PostGIS geometry** for real spatial queries.

### 🧭 Community Posts  
- Users can **register, log in, and share posts** with a title, body, and location.  
- Choose a city or coordinates directly from the map.  
- Posts appear instantly after submission.  

### 📊 Analytics Dashboard  
- Built-in dashboard summarizing key metrics like:  
  *Most active countries*, *Popular topics*, *Post growth trends*, and *sentiment overview*.  
- ECharts-powered visualizations that update live from the database.  

### 🎨 Modern UI/UX  
- Full Tailwind design using the custom **plum–rose–sand** palette  
  (`#3B3B58`, `#A7C6ED`, `#D9B3C4`, `#6F2C91`, `#F2E1D4`).  
- Responsive layout for desktop & mobile.  
- Smooth transitions, clean typography, and a structured layout inspired by modern learning dashboards.  

### 🧠 Smart Insights *(in progress)*  
- Mock AI-generated summaries:  
  _“Spain’s nightlife posts increased 23% this semester.”_  
- Planned sentiment and keyword analysis per country.

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-------------|----------|
| **Frontend** | Vue 3 + Vite + TypeScript + Pinia + Tailwind CSS | Reactive SPA and UI |
| **Map** | MapLibre GL JS | Open-source interactive maps |
| **Backend** | Fastify + TypeScript + Zod | REST API with JWT auth and validation |
| **Database** | PostgreSQL + PostGIS | Geospatial storage & queries |
| **ORM** | node-pg | Lightweight, raw SQL control |
| **Visualization** | Apache ECharts | Dynamic, animated analytics |
| **Dev tools** | pnpm, Nodemon, ESLint | Fast, reproducible development |

---

## 🧩 Monorepo Layout

```
erasmus-atlas/
│
├── apps/
│   ├── api/           # Fastify REST API (Node + TypeScript)
│   ├── web/           # Vue 3 frontend (Vite + Tailwind)
│   └── workers/       # Optional background jobs (AI, moderation)
│
├── db/
│   ├── migrations/    # node-pg-migrate files
│   ├── seeds/         # Hard-coded cities & posts
│   └── reset.cjs      # Database reset utility
│
├── uploads/           # Future image uploads
└── docs/              # Documentation & architecture notes
```

---

## ⚙️ Local Setup

### 🔧 Requirements
- Node.js ≥ 18  
- pnpm ≥ 8 (`npm i -g pnpm`)  
- PostgreSQL (with **PostGIS** extension)  
- PgAdmin 4 *(optional)*  

### 1️⃣ Clone & install dependencies
```bash
git clone https://github.com/<your-username>/Erasmus-Atlas.git
cd Erasmus-Atlas
pnpm install
```

### 2️⃣ Environment configuration
Create `.env.local` in `/db` and `/apps/api`:

**db/.env.local**
```bash
DATABASE_URL=postgres://postgres:<password>@localhost:5432/erasmus_atlas
```

**apps/api/.env.local**
```bash
DATABASE_URL=postgres://postgres:<password>@localhost:5432/erasmus_atlas
JWT_SECRET=supersecret
PORT=8080
```

### 3️⃣ Database setup
```bash
pnpm -C db migrate:up
pnpm dotenv -e db/.env.local -- node db/seeds/seed_hard_cities.cjs
pnpm dotenv -e db/.env.local -- node db/seeds/seed_hard_posts.cjs
```

### 4️⃣ Start the backend
```bash
pnpm -C apps/api dev
# → API at http://127.0.0.1:8080
```

### 5️⃣ Start the frontend
```bash
pnpm -C apps/web dev
# → Web app at http://localhost:5173
```

---

## 🚀 Implemented So Far

✅ JWT Auth (login/register/logout)  
✅ Interactive map with clustered posts  
✅ City & country seeds with real coordinates  
✅ Analytics dashboard with ECharts  
✅ Custom Tailwind theme  
✅ Reset + reseed workflow  

---

## 🧭 Roadmap 2025

| Phase | Feature | Status |
|--------|----------|--------|
| **1. Core Map + Auth** | Users, posts, clustering | ✅ Complete |
| **2. Data Expansion** | Hard-coded EU cities & posts | ✅ Complete |
| **3. Analytics Dashboard** | Charts & country stats | 🟢 Active |
| **4. Design Polish** | Responsive theme + transitions | 🟢 In progress |
| **5. AI Insights** | Sentiment & summaries | ⏳ Planned |
| **6. Admin Tools** | Post moderation, import/export | ⏳ Planned |

---

## 💡 Development Notes

- Run per-app commands via `pnpm -C <app> ...`  
- Tailwind theme defined in `apps/web/tailwind.config.cjs`  
- Custom PostGIS queries used instead of ORM for speed  
- All seeds are **idempotent** — safe to re-run after resets  

---

## 📸 Preview

<p align="center">
  <img src="https://placehold.co/800x400?text=Erasmus+Atlas+Map" width="700" />
  <br/>
  <img src="https://placehold.co/800x400?text=Erasmus+Analytics+Dashboard" width="700" />
</p>

---

## 🧾 License
MIT © 2025 — Built with ❤️ for the **Erasmus+ Project**

---

## 🙌 Acknowledgments
- [Erasmus+ Programme (EU)](https://erasmus-plus.ec.europa.eu/)  
- [MapLibre GL](https://maplibre.org/)  
- [Tailwind CSS](https://tailwindcss.com/)  
- [Fastify](https://fastify.dev/)  
- [PostGIS](https://postgis.net/)  
