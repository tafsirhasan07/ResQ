# ResQ Architecture

ResQ is a single Next.js full-stack application. Crisis Desk and Infrastructure remain domain-specific modules, but share authentication, tracking, notifications, authorization and persistence. Donate Funds and Shelter use the same API/database layer and unified admin shell.

## Runtime layers

- `app/`: user pages and server API routes
- `components/`: shared UI and report/tracking workflows
- `lib/`: authentication, persistence and AI/domain services
- `types/`: shared domain contracts
- `storage/`: local development persistence fallback
- `public/uploads/`: local development media storage

## Persistence

When `MONGODB_URI` is configured, `lib/db.ts` uses MongoDB collections. When MongoDB is unavailable, it uses `storage/resq.json` so local development remains usable without pretending a production database exists.

## Security

Authentication is server-issued JWT in an HTTP-only cookie. Admin/staff APIs enforce role checks server-side. Environment secrets are not included in source. The original archive is preserved separately; any original credentials should be rotated before deployment.
