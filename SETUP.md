# Setup

1. Copy `.env.example` to `.env.local`.
2. Set a strong `JWT_SECRET`.
3. Add `MONGODB_URI` for MongoDB-backed persistence. If omitted, the app uses its local development store.
4. Optionally set `GEMINI_API_KEY` for external crisis analysis; local deterministic triage remains available without it.
5. Run `npm install`.
6. Run `npm run seed` if you want the demo data immediately.
7. Run `npm run dev` and open `http://localhost:3000`.

The development accounts are documented in `README.md`.
