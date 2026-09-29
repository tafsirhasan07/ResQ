# ResQ API

## Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Crisis

- `GET/POST /api/crisis`
- `GET /api/crisis/:id`
- `PATCH /api/crisis/:id/status`
- `PATCH /api/crisis/:id/assign`
- `PATCH /api/crisis/:id/verify`
- `GET /api/crisis/track?code=...`

## Infrastructure

- `GET/POST /api/infrastructure`
- `GET /api/infrastructure/:id`
- `PATCH /api/infrastructure/:id/status`
- `PATCH /api/infrastructure/:id/assign`
- `GET /api/infrastructure/track?code=...`

## Donations

- `GET/POST /api/donations/campaigns`
- `GET /api/donations/:id`
- `POST /api/donations/donate`

## Shelters

- `GET/POST /api/shelters`
- `GET/PATCH /api/shelters/:id`
- `GET /api/shelters/nearby?lat=...&lon=...&radius=20`

## Platform

- `GET/PATCH /api/notifications`
- `GET /api/track?code=...`
- `POST /api/upload`
- `GET /api/admin/stats`
- `GET/PATCH /api/admin`
