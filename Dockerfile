# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

RUN npm install -g pnpm@9

WORKDIR /app

COPY lostos_game/package.json lostos_game/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --shamefully-hoist

COPY lostos_game/ .

RUN pnpm install --shamefully-hoist

RUN pnpm run build

# ── Stage 2: serve ────────────────────────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]