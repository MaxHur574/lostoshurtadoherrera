# ── Backend: Express + MongoDB (lostos_game) ──────────────────────────────
FROM node:20-alpine AS base

WORKDIR /app

# Habilitar pnpm via corepack (viene incluido con Node 20)
# Se fija la versión 9 porque pnpm@latest (11.x) requiere Node >=22.13
RUN corepack enable && corepack prepare pnpm@9 --activate

# Instalar dependencias primero (aprovecha la cache de Docker)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Puerto expuesto por Express (server.js usa process.env.PORT || 3000)
EXPOSE 3000

# Variables de entorno esperadas en runtime (pásalas con --env-file o -e):
#   MONGODB_URI
#   AUTH0_DOMAIN
#   AUTH0_AUDIENCE
#   FRONTEND_URL
#   PORT (opcional, default 3000)
ENV NODE_ENV=production

# Usuario no-root por seguridad
USER node

CMD ["node", "src/server.js"]