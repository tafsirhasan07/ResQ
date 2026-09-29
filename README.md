# ResQ

ResQ is a unified emergency and public-support web application integrating Crisis Desk, Public Infrastructure reporting, Donate Funds and Shelter discovery into one Next.js full-stack project.

## Stack

- Next.js 14 + React 18 + TypeScript
- Tailwind CSS
- MongoDB via Mongoose when `MONGODB_URI` is configured
- Persistent local JSON development store when MongoDB is unavailable
- JWT session cookie authentication
- Gemini integration when `GEMINI_API_KEY` is configured, with deterministic local AI fallback
- Development/test donation mode

## Run locally

```bash
cp .env.example .env.local
npm install
npm run seed
npm run dev
```

Open http://localhost:3000.

### Local demo accounts

- Admin: `admin@resq.local` / `Admin@12345`
- Staff: `staff@resq.local` / `Staff@12345`
- Citizen: `citizen@resq.local` / `Citizen@12345`

These accounts are for local development only. Do not use them in a public deployment.

If MongoDB is configured, ResQ uses the `resq` database through the supplied URI. Without MongoDB, the development store persists in `storage/resq.json` so the complete local workflow can still be exercised.

## Production notes

- Rotate any credentials that were present in the original archive before deployment.
- Set a strong `JWT_SECRET`.
- Configure `MONGODB_URI`.
- Configure `GEMINI_API_KEY` if external AI analysis is desired.
- Replace the development payment adapter with merchant-approved bKash/Nagad/card gateway integrations before accepting real money.
- Replace local file storage with managed object storage for production media.
