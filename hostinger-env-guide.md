# Guide de Configuration Hostinger - Chatlet

Voici les informations nécessaires pour configurer votre application sur Hostinger.

## 1. Variables d'Environnement (.env)
Dans le panneau Hostinger, allez dans la section **Node.js** -> **Variables d'environnement** et ajoutez les suivantes :

| Clé | Valeur suggérée | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Mode de l'application |
| `PORT` | `3000` | Port d'écoute (Hostinger gère le proxy) |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | **À REMPLACER** par vos accès SQL Hostinger |
| `JWT_SECRET` | `votre_cle_secrete_aleatoire` | Une phrase longue et complexe |
| `VITE_APP_TITLE` | `Chatlet` | Nom de votre site |

## 2. Configuration de la Base de Données
1. Créez une base de données **PostgreSQL** dans votre panneau Hostinger.
2. Notez l'hôte, le nom de la base, l'utilisateur et le mot de passe.
3. Formatez l'URL comme ceci : `postgresql://utilisateur:motdepasse@hote:5432/nom_de_la_base`
4. **IMPORTANT** : Copiez le contenu du fichier `hostinger-setup.sql` et exécutez-le dans l'onglet "SQL" de votre gestionnaire de base de données Hostinger pour créer les tables.

## 3. Commandes de Déploiement
Si Hostinger vous demande les commandes :

- **Build Command** : `pnpm install && pnpm build`
- **Start Command** : `pnpm start`

## 4. Structure des fichiers
L'application sera compilée dans le dossier `dist/`. Le fichier principal de démarrage sera `dist/index.js`.
