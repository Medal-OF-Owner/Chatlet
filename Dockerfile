# ============================================================
# Dockerfile Optimisé pour AWS App Runner - Chatlet
# ============================================================
# Build multi-stage pour réduire la taille de l'image finale
# ============================================================

# ============================================================
# STAGE 1: Build
# ============================================================
FROM node:20-alpine AS builder

# Installer pnpm
RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer TOUTES les dépendances (dev + prod) pour le build
RUN pnpm install --frozen-lockfile

# Copier tout le code source
COPY . .

# Build du client (Vite) et transpilation TypeScript
RUN pnpm run build || echo "No build script, skipping"

# Transpiler TypeScript vers JavaScript
RUN pnpm exec tsc || npx tsc

# ============================================================
# STAGE 2: Production
# ============================================================
FROM node:20-alpine AS production

# Installer pnpm
RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer UNIQUEMENT les dépendances de production
RUN pnpm install --frozen-lockfile --prod

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client ./client

# Copier les autres fichiers nécessaires
COPY drizzle ./drizzle
COPY server ./server
COPY shared ./shared

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=8080

# Exposer le port (AWS App Runner utilise 8080 par défaut)
EXPOSE 8080

# Healthcheck pour AWS
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Démarrer le serveur
CMD ["node", "dist/server/_core/index.js"]
