# Setup

## Local development

1. Copy `.env.example` to `.env.local`.
2. Set `JWT_SECRET` to a random value of at least 32 characters and set `MONGODB_URI` if you want MongoDB-backed local data.
3. Optionally set `GEMINI_API_KEY` for Gemini crisis analysis and `BLOB_READ_WRITE_TOKEN` for media uploads.
4. Run `npm install` and `npm run dev`.
5. Run `npm run seed` only when you want local demo data. It creates accounts with the documented development passwords.

## Vercel deployment

1. Import `tafsirhasan07/ResQ` as a Next.js project in Vercel.
2. Create a MongoDB database and add `MONGODB_URI` to the Vercel project environment variables.
3. Add a random `JWT_SECRET` of at least 32 characters. Do not use the development fallback or commit the secret.
4. Create a Vercel Blob store and connect it to this project. Vercel supplies `BLOB_READ_WRITE_TOKEN` for direct media uploads.
5. Optionally add `GEMINI_API_KEY` for Gemini analysis.
6. Deploy. Vercel uses the `build` script (`npm run build`) automatically.

Do not run `npm run seed` against production: it creates demo accounts with known passwords. To provision a production admin, configure `MONGODB_URI` in `.env.local`, then use hidden prompts in Bash:

```bash
read -r -p "Admin email: " ADMIN_EMAIL
read -r -s -p "Admin password (16+ characters): " ADMIN_PASSWORD
printf '\n'
export ADMIN_EMAIL ADMIN_PASSWORD
npm run admin:create
unset ADMIN_EMAIL ADMIN_PASSWORD
```

The script creates the admin or promotes the matching account and resets its password. Never commit `.env.local` or place the password in a command.
