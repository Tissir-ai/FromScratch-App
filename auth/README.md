# FromScratch-auth

A Node.js + Express + TypeScript backend for user authentication, subscriptions, and payments using PostgreSQL and Prisma.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` and other variables
   - visit those links to generate the Google and Github Keys
        - Google : https://console.cloud.google.com/auth/clients?hl=fr
        - Github : https://github.com/settings/developers

3. **Run with Docker (recommended):**
   ```bash
   docker compose up --build
   ```
   - API: http://localhost:4000/api
   - Adminer: http://localhost:8080

4. **Or run locally:**
   - Start Postgres
   - Run `npx prisma migrate dev`
   - Run `npm run dev`

## API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/subscriptions/plans` - Get plans
- `POST /api/subscriptions/subscribe` - Subscribe to plan
- `GET /api/subscriptions/subscription/current` - Get current subscription

See `STRUCTURE.md` for project details.
