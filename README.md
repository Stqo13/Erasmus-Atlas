🌍 Erasmus Atlas — Cultural Exchange & Analytics Platform

Erasmus Atlas is an interactive web app that visualizes Erasmus+ student experiences across Europe — combining a real-time map, analytics dashboards, and AI-powered insights.

<p align="center"> <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Erasmus%2B_Logo.svg/512px-Erasmus%2B_Logo.svg.png" width="220" alt="Erasmus+" /> </p>
✨ Core Features
🗺️ Interactive Map

Explore student posts on a dynamic MapLibre GL map.

Click markers to read tips and stories.

Bounding box queries keep performance fast.

🧭 Post System

Authenticated users can submit posts with geolocation, title, and story.

Posts instantly appear on the map (with moderation support planned).

📊 Analytics (Coming Soon)

Compare Erasmus satisfaction, costs, nightlife, and academics by city/country.

AI-generated “insights” highlight trends and differences.

🤖 AI (Future Phase)

Sentiment analysis and topic auto-tagging.

Natural-language summaries like
“Spain’s nightlife satisfaction rose +8 pts this quarter, ranking top-2 in the EU.”

🏗️ Tech Stack
Layer	Technology	Notes
Frontend	Vue 3
, Vite
, TypeScript
, Pinia
, Vue Router
, Tailwind CSS
	Fast SPA with reactive data and clean UI
Map	MapLibre GL JS
	Open-source, high-performance maps
Backend	Fastify
, TypeScript
, Zod
, JWT
	REST API with validation and authentication
Database	PostgreSQL
 + PostGIS
	Geospatial queries and geometry storage
ORM / Queries	Native SQL with node-pg
	Lightweight and fast
Workers	BullMQ
 (optional)	Background AI / image / moderation tasks
Cache	Redis
 (optional)	Query caching, job queues
Storage	MinIO
 / S3 compatible	For image uploads
Dev Tools	pnpm
, Vite
, Nodemon
, ESLint
	Developer experience
🧩 Monorepo Structure
erasmus-atlas/
│
├── apps/
│   ├── api/           # Fastify REST API (Node.js + TypeScript)
│   ├── web/           # Vue 3 frontend with Vite + Tailwind
│   └── workers/       # BullMQ jobs (AI tagging, moderation, etc.)
│
├── db/
│   ├── migrations/    # node-pg-migrate scripts
│   ├── seeds/         # Initial data seeds
│   └── schema.sql     # Optional schema reference
│
├── uploads/           # User images / media
└── docs/              # Documentation & architecture notes

⚙️ Local Setup
Prerequisites

🟦 Node.js ≥ 18

📦 pnpm ≥ 8 (npm i -g pnpm)

🐘 PostgreSQL (with PostGIS enabled)

🧭 PgAdmin 4 (optional, for DB inspection)

1️⃣ Clone & install
git clone https://github.com/<your-username>/Erasmus-Atlas.git
cd Erasmus-Atlas
pnpm install

2️⃣ Configure environment

Create .env.local files inside each app as needed:

db/.env.local

DATABASE_URL=postgres://postgres:<password>@localhost:5432/erasmus_atlas


apps/api/.env.local

DATABASE_URL=postgres://postgres:<password>@localhost:5432/erasmus_atlas
JWT_SECRET=supersecret
PORT=8080

3️⃣ Create DB & run migrations
pnpm -C db migrate:up
pnpm dotenv -e db/.env.local -- node db/seeds/seed.cjs

4️⃣ Run backend
pnpm -C apps/api dev


The API will start at: http://127.0.0.1:8080

5️⃣ Run frontend
pnpm -C apps/web dev


Web app available at: http://localhost:5173

🚀 Current Features Implemented

✅ JWT-based auth (register/login)
✅ Create, list, and view posts
✅ Display posts on map
✅ Tailwind-styled UI
✅ Data seeding + PostGIS integration

🧠 Roadmap
Stage	Feature	Status
1. Core Platform	Auth, posts, map	✅ Done
2. Polish	Tailwind UI, toasts, nav	🟢 In progress
3. Analytics	Country/city dashboards	⏳ Planned
4. AI Features	Sentiment, auto-tagging	⏳ Planned
5. Admin Tools	Moderation, CSV import	⏳ Planned
🧑‍💻 Development Notes

Run all commands via pnpm -C <app> to stay scoped.

Backend uses node-pg with raw SQL for full control.

Frontend uses Pinia for global state and Axios for API calls.

PostGIS adds the geometry(Point, 4326) column for map coordinates.

🌟 Screenshots (optional placeholders)

(You can add your own screenshots later!)

<p align="center"> <img src="https://placehold.co/600x300?text=Map+View+Preview" width="600" /> <br/> <img src="https://placehold.co/600x300?text=Post+Form+Preview" width="600" /> </p>
🧾 License

MIT © 2025 — Created by [Your Name]
Built for the Erasmus+ Project.

❤️ Acknowledgments

Erasmus+ Programme (EU)

MapLibre GL
 for open-source maps

Tailwind CSS
 for modern design

Fastify
 for the fastest Node.js web framework
