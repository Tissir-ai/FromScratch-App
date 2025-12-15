# FromScratch-auth Project Structure

This document gives a simple overview of how the `FromScratch-auth` backend is organized.

## High-level layout

```text
FromScratch-auth/
├─ prisma/
│  └─ schema.prisma        # Database schema (PostgreSQL, Prisma)
├─ src/
│  ├─ app.ts               # Express app configuration
│  ├─ server.ts            # HTTP server entrypoint
│  ├─ db/
│  │  └─ client.ts         # Prisma client instance
│  ├─ models/              # TypeScript model types mapped from Prisma
│  ├─ services/            # Business logic (auth, subscriptions, payments)
│  ├─ controllers/         # HTTP controllers (request/response handling)
│  ├─ middleware/          # Express middleware (auth, error handling)
│  ├─ routes/              # Express routers (auth, subscriptions)
│  └─ utils/               # Helpers (errors, hashing, JWT)
├─ Dockerfile              # Docker image for the API
├─ docker-compose.yml      # API + Postgres + Adminer stack
├─ package.json            # Dependencies and npm scripts
├─ tsconfig.json           # TypeScript configuration
└─ .env.example            # Example environment variables
```

## Folders in detail

### `prisma/`
- **`schema.prisma`**: Defines the database models and relations:
  - `User`: users table with email, fullname, password hash, Stripe customer id, timestamps.
  - `SubscriptionPlan`: available plans with price and billing period.
  - `Subscription`: which user is subscribed to which plan and its status.
  - `Payment`: payments linked to users and subscriptions.

Prisma uses this file to generate the TypeScript client and to run migrations.

### `src/db/`
- **`client.ts`**: Creates a single `PrismaClient` instance and exports it.
  - All services import this client to talk to the database.

### `src/models/`
- Simple type aliases over the Prisma models so the rest of the code can use
  clear types:
  - `User`
  - `SubscriptionPlan`
  - `Subscription`
  - `Payment`

These mirror the structures in `schema.prisma`.

### `src/services/`
Holds the **business logic**. Services never deal with HTTP directly.

- **`authService.ts`**
  - Register a new user (hash password, save to DB, return tokens).
  - Log in a user (check credentials, return tokens).
  - Refresh tokens (take a refresh token, return new tokens).

- **`subscriptionService.ts`**
  - List available plans.
  - Subscribe a user to a plan.
  - Cancel the current subscription.
  - Get the current active subscription.

- **`paymentService.ts`**
  - Record a payment.
  - List all payments for a user.

Services are the main place where we combine database access and rules.

### `src/controllers/`
Controllers translate HTTP requests into service calls and send HTTP responses.

- **`authController.ts`**
  - `register`, `login`, `refresh` endpoints.
- **`subscriptionController.ts`**
  - `getPlans`, `subscribeHandler`, `cancelSubscriptionHandler`,
    `getCurrentSubscriptionHandler`.

They do not contain business rules. They:
1. Read request data.
2. Call the right service.
3. Send back a JSON response.

### `src/middleware/`
Reusable Express middleware.

- **`authMiddleware.ts`**
  - Validates the `Authorization: Bearer <token>` header.
  - Verifies the JWT and attaches `userId` to the request.

- **`errorHandler.ts`**
  - Central error handler.
  - Returns clean JSON error responses without logging.

### `src/routes/`
Defines the HTTP routes and which controller they use.

- **`authRoutes.ts`** (`/api/auth/...`)
  - `POST /register`
  - `POST /login`
  - `POST /refresh`

- **`subscriptionRoutes.ts`** (`/api/subscriptions/...`)
  - `GET /plans`
  - `POST /subscribe`
  - `POST /cancel`
  - `GET /subscription/current`

- **`index.ts`**
  - Mounts `authRoutes` under `/auth` and `subscriptionRoutes` under `/subscriptions`.

### `src/utils/`
Helper functions used across services.

- **`AppError.ts`**: Small error class with HTTP status code.
- **`password.ts`**: Hash and verify passwords using bcrypt.
- **`jwt.ts`**: Create and verify access/refresh JWTs.

### `src/app.ts` and `src/server.ts`
- `app.ts`:
  - Loads environment variables.
  - Creates the Express app.
  - Sets JSON body parsing.
  - Mounts `/api` routes and error handler.
- `server.ts`:
  - Reads `PORT` from env (default 4000).
  - Starts the HTTP server.

This separation makes it easy to test the app without starting the server.
