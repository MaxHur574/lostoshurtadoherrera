# LOSTOS OS

![CI](https://github.com/maxihp345/lostoshurtadoherrera/actions/workflows/ci.yml/badge.svg)
![CD](https://github.com/maxihp345/lostoshurtadoherrera/actions/workflows/cd.yml/badge.svg)

Juego de terror narrativo en formato de sistema operativo falso. El jugador despierta en el escritorio de Valeria Herrera, una periodista desaparecida, y debe explorar su computadora para descubrir qué le ocurrió.

## Tecnologías

- Vue 3 + Vite
- Pinia
- Howler.js
- GSAP + Interact.js
- Vitest + Vue Test Utils
- Docker + nginx
- GitHub Actions (CI/CD)

## Ejecución con pnpm

### Requisitos previos
- Node.js 24
- pnpm 9 (`npm install -g pnpm@9`)

### Instalación

```bash
cd lostos_game
pnpm install
```

### Modo desarrollo

```bash
pnpm run dev
```

El juego queda disponible en `http://localhost:5173`.

### Build de producción

```bash
pnpm run build
```

Los archivos compilados quedan en `lostos_game/dist/`.

### Preview del build

```bash
pnpm run preview
```

### Tests

```bash
pnpm run test
```

### Lint y formato

```bash
pnpm run lint
pnpm prettier --check "src/**/*.{js,ts,vue,css,json}"
```

## Ejecución con Docker

### Requisitos previos
- Docker instalado y corriendo

### Opción 1 — Construir la imagen localmente

```bash
# Desde la raíz del proyecto (donde está el Dockerfile)
docker build -t lostos-game .
```

```bash
# Correr el contenedor
docker run -p 8080:80 lostos-game
```

El juego queda disponible en `http://localhost:8080`.

### Opción 2 — Usar la imagen publicada en Docker Hub

```bash
docker pull maxihp345/lostos-game:latest
```

```bash
docker run -p 8080:80 maxihp345/lostos-game:latest
```

El juego queda disponible en `http://localhost:8080`.

### Detener el contenedor

```bash
# Ver los contenedores corriendo
docker ps

# Detener por ID
docker stop <container_id>
```

## Deploy

- **GitHub Pages** → automático al hacer push a `main`
- **Docker Hub** → imagen publicada en `maxihp345/lostos-game`

## Flujo CI/CD

- `ci.yml` → corre en push a `main` y `develop`: lint, formato y build
- `cd.yml` → corre en push a `main`: tests, deploy a GitHub Pages y push de imagen Docker a Docker Hub

## Cómo jugar

1. Explorá el sistema de archivos, el correo, las notas y la galería
2. Las contraseñas están escondidas en el propio sistema
3. Completá los minijuegos para desbloquear archivos
4. Conectá las pistas para llegar al final
