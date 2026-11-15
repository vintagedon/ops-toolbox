# syntax=docker/dockerfile:1

# ops-toolbox — self-hostable build of the client-side SPA.
# Multi-stage: a node stage compiles the app (vite build + per-route prerender),
# an nginx stage serves the static dist/. The runtime makes zero external network
# calls — the privacy/air-gap claim is literally true inside the container.

# ---- Build stage: compile the SPA and prerender every route ----
FROM node:22-alpine AS build
WORKDIR /app

# Match CI's npm version; older npm mis-resolves optional Vite peers in this lockfile.
RUN npm install --global npm@12.0.2

# Reproducible install from the lockfile (cached unless deps change).
COPY package.json package-lock.json ./
RUN npm ci

# Source tree, then build. `npm run build` runs `vite build && node scripts/prerender.mjs`,
# emitting dist/ with one prerendered index.html per route plus the SPA shell.
COPY . .
RUN npm run build

# ---- Runtime stage: nginx serves the prerendered static site ----
FROM nginx:1.27-alpine AS runtime

# SPA-aware nginx config: serves per-route prerendered HTML when present and
# falls back to the SPA shell for unknown routes (which resolve to the 404 view).
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# The prerendered static site (replaces the default nginx welcome page).
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
