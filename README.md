# Pet Rating App

A full-stack pet swipe app with a modern React frontend and a database-backed Express backend.

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
