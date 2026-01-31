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

# Build du client (Vite) et transpilation TypeScript (postbuild s'exécute automatiquement)
RUN pnpm run build

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

# Healthcheck simple pour AWS (évite les échecs si /health n'est pas prêt)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD curl -f http://localhost:8080/ || exit 1

# Démarrer le serveur
CMD ["node", "dist/server/_core/index.js"]
