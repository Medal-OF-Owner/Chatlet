# Render Deployment Guide

## Déploiement sur Render

### Prérequis
- Compte Render (https://render.com)
- Code sur GitHub
- Variables d'environnement prêtes

### Étapes de déploiement

#### 1. Créer une base PostgreSQL sur Render

1. Va sur https://dashboard.render.com
2. Clique sur **"+ New"** → **"PostgreSQL"**
3. Configure :
   - **Name** : `chatapp-db`
   - **Database** : `chatapp`
   - **User** : `chatapp` (ou autre)
   - Laisse les autres par défaut
4. Crée la base
5. **Copie la connection string** (tu en auras besoin)

#### 2. Déployer le service web

**Option A : Via render.yaml (Git)**
1. Pousse `render.yaml` sur GitHub
2. Va sur Render Dashboard → **"+ New"** → **"Web Service"**
3. Connecte ton repo GitHub
4. Render détecte automatiquement `render.yaml`
5. Clique **"Deploy"**

**Option B : Manual (Docker)**
1. Va sur Render Dashboard → **"+ New"** → **"Web Service"**
2. Connecte ton repo ou pousse via Docker
3. Configure :
   - **Build Command** : `pnpm install --frozen-lockfile && pnpm build`
   - **Start Command** : `pnpm start`
4. Clique **"Deploy"**

#### 3. Configurer les variables d'environnement

Dans le dashboard Render (Web Service settings → **Environment**), ajoute :

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...  (copié de PostgreSQL)
VITE_APP_ID=ton-app-id
VITE_APP_TITLE=ChatApp
VITE_OAUTH_PORTAL_URL=https://...
VITE_OAUTH_SERVER_URL=https://...
JWT_SECRET=une-clé-très-secrète
OWNER_OPEN_ID=owner-id
```

#### 4. Lancer les migrations DB

SSH dans le service Render ou exécute via Node :

```bash
pnpm db:push
```

Ou utilise Drizzle Studio pour configurer la DB en ligne.

---

### Fichiers créés
- **`render.yaml`** : Config Render avec auto-deploy
- **`Dockerfile`** : Pour builds Docker
- **`.dockerignore`** : Fichiers à ignorer dans l'image Docker
- **`.env.example`** : Template des env vars

### Coûts estimés (Plan Gratuit Render)
- Web Service : Gratuit (avec limitations)
- PostgreSQL : Gratuit (0.25 GB RAM, auto-pause inactif)

### Prochaines étapes
1. Push tous les fichiers sur GitHub
2. Connecte Render à ton repo
3. Configure les env vars
4. Déploie !

### Dépannage
- **Build échoue** : Vérifie `pnpm-lock.yaml` est à jour
- **DB connection fails** : Assure-toi que `DATABASE_URL` est correct
- **Logs** : Va dans Render Dashboard → Logs pour déboguer

**Besoin d'aide ?** Demande moi pour configurer les webhooks ou auto-deploy.
