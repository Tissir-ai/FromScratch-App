# Multi-stage build for FromScratch-auth (Node + Express + TypeScript)

FROM node:20-slim AS build

WORKDIR /app

# Install system deps needed by Prisma (OpenSSL/libssl)
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates openssl libssl-dev \
	&& rm -rf /var/lib/apt/lists/*

# Install dependencies and generate Prisma client
COPY package.json tsconfig.json ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate

# Copy source and build
COPY src ./src
RUN npm run build

# Runtime image (Debian-based to ensure OpenSSL compatibility for Prisma)
FROM node:20-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Only copy needed artifacts
COPY package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY .env .env

# Install runtime dependencies required by Prisma's query engine
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates openssl libssl-dev \
	&& rm -rf /var/lib/apt/lists/*

EXPOSE 4000

# Default command; docker-compose can override to run migrations first
CMD ["node", "dist/server.js"]
