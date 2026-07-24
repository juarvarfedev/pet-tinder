# Pet Rating App

A full-stack pet swipe app with a modern React frontend and a database-backed Express backend.

This project was vibecoded with assistance from GitHub Copilot and developed using prompt engineering techniques to guide iterative implementation and fixes.

This project is deployed on Render. The live demo is available at:
- https://pet-tinder-v6ix.onrender.com/

## Features

- Better Auth sign-in/sign-up gate before users can access the pet deck
- Mobile-first Tinder-style pet adoption deck
- Touch swipe gestures: right to save a pet, left to pass
- Like / pass actions with animated visual feedback
- In-session saved-pet count and undo support for the previous decision
- Keyboard shortcuts:
  - L = Save pet
  - P = Pass
  - U = Undo
- Backend-powered pet data fetched from PostgreSQL
- Local seed script to populate the `pets` table
- Email/password authentication backed by Better Auth and the same Drizzle/PostgreSQL database

## Tech Stack

- React 18
- Vite
- TypeScript
- Tailwind CSS
- Express 5
- Drizzle ORM
- PostgreSQL
- Node.js

## Project Structure

- `client/` — React frontend source
- `server/` — Express backend source with Drizzle schema and seed logic
- `dist/` — production build output for frontend and backend
- `.env.example` — environment variable template
- `package.json` — scripts and dependencies

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create and configure `.env`:
   ```bash
   cp .env.example .env
   ```

   ```env
   DATABASE_URL=your_postgres_connection_string
   BETTER_AUTH_SECRET=use_a_random_secret_of_at_least_32_characters
   BETTER_AUTH_API_KEY=your_better_auth_infrastructure_dashboard_key
   BETTER_AUTH_URL=http://localhost:3000
   BETTER_AUTH_TRUSTED_ORIGIN=http://localhost:5173
   ```
3. Create the Better Auth tables once for the database named by `DATABASE_URL`:
   ```bash
   npm run auth:setup
   ```
4. Optionally seed pets:
   ```bash
   npm run seed
   ```
5. Run the frontend and backend in separate terminals:
   ```bash
   npm run dev:client
   npm run dev:server
   ```
6. Build for production:
   ```bash
   npm run build
   ```
7. Start the production server:
   ```bash
   npm start
   ```

## Authentication

Better Auth provides email/password authentication at `/api/auth/*`. Its tables
(`user`, `session`, `account`, and `verification`) share the same PostgreSQL
database as the app.

The optional Better Auth Infrastructure Dashboard plugin is enabled. It needs
`BETTER_AUTH_API_KEY` for dashboard analytics and admin endpoints. This API key
is separate from `BETTER_AUTH_SECRET`, which signs application sessions.

Confirm the service is available:

```bash
curl http://localhost:3000/api/auth/ok
```

Create a test account:

```bash
curl -i -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

`GET /api/me` returns the current session when the request includes the Better
Auth session cookie.

## Using the Pet Deck

After signing in, browse pets by swiping the card or using the action buttons:

- Swipe right / press **L** — save a pet you would like to adopt
- Swipe left / press **P** — pass on a pet
- Press **U** or use the undo button — reverse the latest decision

The deck is responsive and supports touch interactions on mobile devices.

## Notes

- The backend serves the built frontend from `dist/client`.
- `server/src/index.ts` is the active API entrypoint.
- `server/src/db.ts` initializes Drizzle with PostgreSQL using `DATABASE_URL`.
- Better Auth is mounted at `/api/auth/*`; use its standard email/password endpoints or a Better Auth client.
- `npm run auth:setup` is idempotent: it creates only missing Better Auth tables and does not modify the `pets` table or its data.
- The existing Drizzle migration history is legacy/nonstandard. Do not use `npm run drizzle:generate` as a new baseline until that history has been normalized.

## License

This project is for learning and demo purposes.

## Deployment

If you want to deploy the app on Render yourself, use these commands in the Render dashboard for the service:

Build Command

```
npm ci && npm run build:render
```

Start Command

```
npm start
```

Set these environment variables on the Render web service:

```env
DATABASE_URL=your_render_postgres_connection_string
BETTER_AUTH_SECRET=a_stable_random_secret_of_at_least_32_characters
BETTER_AUTH_API_KEY=your_better_auth_infrastructure_dashboard_key
BETTER_AUTH_URL=https://pet-tinder-v6ix.onrender.com
BETTER_AUTH_TRUSTED_ORIGIN=https://pet-tinder-v6ix.onrender.com
```

`npm run build:render` runs the idempotent `auth:setup` command during each
Render build, ensuring the Better Auth tables exist without modifying the pets
table or its data.

Notes about the runtime and build artifacts

- `npm run build` produces the production artifacts: `dist/client` (frontend) and `dist/server` (compiled server).
- The `start` script runs `NODE_ENV=production node dist/server/index.js`. Ensure the `build` step runs before `start` so `dist/server/index.js` exists.
- The server listens on the port defined by the `PORT` environment variable (Render provides this automatically). If `PORT` is not set, the server defaults to `3000`.
- If you need to seed the database on Render (or locally), the project provides `npm run seed`, which runs `server/src/seed.ts` against the configured `DATABASE_URL`.

## Workshop / Credit

This project was created as part of the AI Bootcamp from masters.dev. Workshop details:

- https://master.dev/workshops/vibe-coding-bootcamp/
