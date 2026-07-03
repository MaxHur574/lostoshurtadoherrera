# ── Frontend: Vue 3 + Vite (lostos_game) ───────────────────────────────────

# ── Etapa 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Habilitar pnpm via corepack (viene incluido con Node 20)
# Se fija la versión 9 porque pnpm@latest (11.x) requiere Node >=22.13
RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Variables de build de Vite (si las usas via import.meta.env, pásalas con --build-arg)
# ARG VITE_API_URL
# ENV VITE_API_URL=$VITE_API_URL

RUN pnpm run build

# ── Etapa 2: servir con nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]