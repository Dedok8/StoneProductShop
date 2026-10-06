# ---------- Base ----------
FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# ---------- Development ----------
FROM base AS development
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm install --frozen-lockfile --ignore-scripts --filter "backend..." --filter "./shared..."
COPY shared ./shared
COPY backend ./backend
RUN pnpm --filter ./shared build
WORKDIR /app/backend
RUN pnpm exec prisma generate
EXPOSE 3000
CMD ["sh", "-c", "pnpm exec prisma generate && (pnpm --filter ./shared dev & pnpm --filter backend start:dev; wait)"]

# ---------- Build ----------
FROM base AS build
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm install --frozen-lockfile --ignore-scripts --filter "backend..." --filter "./shared..."
COPY shared ./shared
COPY backend ./backend
RUN pnpm --filter ./shared build
WORKDIR /app/backend
RUN pnpm exec prisma generate && pnpm run build

# ---------- Production ----------
FROM base AS production
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --prod --ignore-scripts --filter "backend..."

COPY --from=build /app/shared/dist ./shared/dist

WORKDIR /app/backend
COPY --from=build /app/backend/prisma.config.ts ./
COPY --from=build /app/backend/prisma ./prisma
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/src/generated ./dist/backend/src/generated

RUN mkdir -p /app/backend/uploads && chown -R node:node /app/backend/uploads
USER node

EXPOSE 3000
CMD ["node", "dist/backend/src/main"]