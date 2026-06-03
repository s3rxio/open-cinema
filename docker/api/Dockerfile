# syntax=docker/dockerfile:1

FROM node:22-bookworm AS builder

RUN corepack enable

ENV CI=true

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages ./packages

RUN pnpm install --frozen-lockfile

# Prisma config reads API_DB_URL at load time; generate does not use the database.
ENV API_DB_URL=postgresql://build:build@127.0.0.1:5432/build

RUN pnpm exec prisma generate --config apps/api/src/common/configs/prisma.config.ts

RUN pnpm nx build api

FROM node:22-bookworm-slim AS runner

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

ENV CI=true
ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /workspace/pnpm-workspace.yaml ./
COPY --from=builder /workspace/dist/apps/api/package.json /workspace/dist/apps/api/pnpm-lock.yaml ./
COPY --from=builder /workspace/dist/apps/api/main.js ./
COPY --from=builder /workspace/apps/api/prisma ./prisma
COPY --from=builder /workspace/apps/api/src/app/rbac ./src/app/rbac
COPY docker/api/prisma.config.mjs ./prisma.config.mjs
COPY docker/api/docker-entrypoint.sh /entrypoint.sh

RUN pnpm install --frozen-lockfile --prod \
  && pnpm add prisma@7.8.0 tslib@2.8.1 @as-integrations/express5@1.1.2 tsx@4.21.0 \
  && chmod +x /entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/entrypoint.sh"]
