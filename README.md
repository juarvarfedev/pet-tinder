# Pet Rating App

A full-stack pet swipe app with a modern React frontend and a database-backed Express backend.

This project was vibecoded with assistance from GitHub Copilot and developed using prompt engineering techniques to guide iterative implementation and fixes.

This project is deployed on Render. The live demo is available at:
- https://pet-tinder-v6ix.onrender.com/

## Features

- Swipe-style card interface for rating pets
- Like / pass actions
- Undo support for the previous rating
- Keyboard shortcuts:
  - L = Like
  - P = Pass
  - U = Undo
- Backend-powered pet data fetched from PostgreSQL
- Local seed script to populate the `pets` table

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
   - `npm install`
2. Create and configure `.env`:
   - `cp .env.example .env`
   - set `DATABASE_URL` to your PostgreSQL connection string
3. Seed the database:
   - `npm run seed`
4. Run the frontend and backend in development:
   - `npm run dev:client`
   - `npm run dev:server`
5. Build for production:
   - `npm run build`
6. Start the production server:
   - `npm start`

## Notes

- The backend serves the built frontend from `dist/client`.
- `server/src/index.ts` is the active API entrypoint.
- `server/src/db.ts` initializes Drizzle with PostgreSQL using `DATABASE_URL`.

## License

This project is for learning and demo purposes.

## Deployment

If you want to deploy the app on Render yourself, use these commands in the Render dashboard for the service:

Build Command

```
npm run build
```

Start Command

```
npm start
```

Make sure Render sets the environment variable `DATABASE_URL` (Postgres) on the service.

Notes about the runtime and build artifacts

- `npm run build` produces the production artifacts: `dist/client` (frontend) and `dist/server` (compiled server).
- The `start` script runs `NODE_ENV=production node dist/server/index.js`. Ensure the `build` step runs before `start` so `dist/server/index.js` exists.
- The server listens on the port defined by the `PORT` environment variable (Render provides this automatically). If `PORT` is not set, the server defaults to `3000`.
- If you need to seed the database on Render (or locally), the project provides `npm run seed` which uses `ts-node` to run `server/src/seed.ts` against the configured `DATABASE_URL`.

## Workshop / Credit

This project was created as part of the AI Bootcamp from masters.dev. Workshop details:

- https://master.dev/workshops/vibe-coding-bootcamp/
