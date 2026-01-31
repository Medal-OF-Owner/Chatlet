# 🚀 Guide de Déploiement Hostinger - Chatlet

## ⚠️ SÉCURITÉ PRIORITAIRE

### 🔴 Action Immédiate Requise
**Un token GitHub a été exposé publiquement et doit être révoqué immédiatement !**

1. Allez sur [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Trouvez et **révoquez** le token exposé
3. Créez un nouveau token si nécessaire (avec les permissions minimales requises)
4. **Ne partagez JAMAIS de tokens dans des conversations ou fichiers publics**

---

## 📋 Prérequis

- Un compte Hostinger avec hébergement Node.js
- Accès à une base de données MySQL sur Hostinger
- Accès au panneau de contrôle Hostinger
- Le dépôt GitHub : https://github.com/Medal-OF-Owner/Chatlet

---

## 🗄️ Étape 1 : Configuration de la Base de Données MySQL

### 1.1 Créer la Base de Données

1. Connectez-vous au panneau Hostinger
2. Allez dans **Bases de données** → **Gestion MySQL**
3. Créez une nouvelle base de données :
   - **Nom** : `chatlet_db` (ou votre choix)
   - **Utilisateur** : Créez un utilisateur dédié
   - **Mot de passe** : Générez un mot de passe fort

### 1.2 Exécuter le Script SQL

1. Ouvrez **phpMyAdmin** depuis le panneau Hostinger
2. Sélectionnez votre base de données `chatlet_db`
3. Cliquez sur l'onglet **SQL**
4. Copiez **tout le contenu** du fichier `hostinger-mysql-setup.sql`
5. Collez-le dans l'éditeur SQL
6. Cliquez sur **Exécuter**

### 1.3 Vérifier la Création des Tables

Exécutez cette requête dans phpMyAdmin :
```sql
SHOW TABLES;
```

Vous devriez voir 5 tables :
- `users`
- `accounts`
- `rooms`
- `messages`
- `activeNicknames`

### 1.4 Noter les Informations de Connexion

Notez ces informations (vous en aurez besoin pour les variables d'environnement) :
- **Hôte** : `localhost` (généralement)
- **Nom de la base** : `chatlet_db`
- **Utilisateur** : `votre_utilisateur`
- **Mot de passe** : `votre_mot_de_passe`

---

## 🔧 Étape 2 : Configuration de l'Application Node.js

### 2.1 Créer l'Application Node.js

1. Dans le panneau Hostinger, allez dans **Node.js**
2. Cliquez sur **Créer une application**
3. Configurez :
   - **Mode d'application** : Production
   - **Version Node.js** : 18.x ou supérieur
   - **Répertoire de l'application** : `/public_html/chatlet` (ou votre choix)
   - **URL de l'application** : Votre domaine ou sous-domaine

### 2.2 Connecter le Dépôt GitHub

**Option A : Via Git (Recommandé)**
```bash
cd /public_html/chatlet
git clone https://github.com/Medal-OF-Owner/Chatlet.git .
```

**Option B : Via le gestionnaire de fichiers**
1. Téléchargez le dépôt en ZIP depuis GitHub
2. Uploadez et extrayez dans `/public_html/chatlet`

### 2.3 Configurer les Paramètres de l'Application

Dans le panneau Node.js de Hostinger :

| Paramètre | Valeur |
|-----------|--------|
| **Gestionnaire de paquets** | `npm` |
| **Fichier d'entrée** | `dist/server/_core/index.js` |
| **Commande de build** | *(laisser vide)* |
| **Commande de démarrage** | `npm start` |

---

## 🔐 Étape 3 : Variables d'Environnement

### 3.1 Configurer les Variables

Dans le panneau Node.js → **Variables d'environnement**, ajoutez :

| Clé | Valeur | Description |
|-----|--------|-------------|
| `NODE_ENV` | `production` | Mode de production |
| `PORT` | `3000` | Port d'écoute |
| `DATABASE_URL` | `mysql://utilisateur:motdepasse@localhost/chatlet_db` | URL de connexion MySQL |
| `JWT_SECRET` | `votre_cle_secrete_tres_longue_et_aleatoire_123456789` | Clé secrète pour JWT (minimum 32 caractères) |
| `VITE_APP_TITLE` | `Chatlet` | Titre de l'application |

### 3.2 Format de DATABASE_URL

**Important** : Remplacez par vos vraies informations :
```
mysql://UTILISATEUR:MOT_DE_PASSE@localhost/NOM_BASE_DONNEES
```

**Exemple** :
```
mysql://chatlet_user:MonMotDePasse123!@localhost/chatlet_db
```

### 3.3 Générer un JWT_SECRET Sécurisé

Utilisez cette commande pour générer une clé aléatoire :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📦 Étape 4 : Installation des Dépendances

### 4.1 Via le Terminal SSH Hostinger

```bash
cd /public_html/chatlet
npm install --production
```

### 4.2 Vérifier les Permissions

```bash
chmod -R 755 dist/
chmod -R 755 node_modules/
```

---

## 🚀 Étape 5 : Démarrage de l'Application

### 5.1 Démarrer l'Application

Dans le panneau Node.js, cliquez sur **Démarrer l'application**

### 5.2 Vérifier les Logs

Consultez les logs pour vérifier qu'il n'y a pas d'erreurs :
- Allez dans **Node.js** → **Logs**
- Vérifiez qu'il n'y a pas d'erreurs de connexion à la base de données

### 5.3 Tester l'Application

1. Ouvrez votre navigateur
2. Accédez à votre domaine (ex: `https://votre-domaine.com`)
3. Vous devriez voir la page d'accueil de Chatlet

---

## ✅ Étape 6 : Tests de Fonctionnalité

### 6.1 Test de Base

1. **Page d'accueil** : Vérifiez qu'elle se charge correctement
2. **Créer un salon** : Testez `/test` ou `/manu`
3. **Envoyer un message** : Entrez un pseudo et envoyez un message
4. **Vérifier la persistance** : Rechargez la page, les messages doivent rester

### 6.2 Test de Socket.IO

1. Ouvrez deux onglets sur le même salon
2. Envoyez un message dans un onglet
3. Vérifiez qu'il apparaît instantanément dans l'autre onglet

### 6.3 Test de la Base de Données

Dans phpMyAdmin, exécutez :
```sql
SELECT * FROM messages ORDER BY createdAt DESC LIMIT 10;
```
Vous devriez voir vos messages de test.

---

## 🔧 Dépannage

### Erreur : "Cannot connect to database"

**Solution** :
1. Vérifiez `DATABASE_URL` dans les variables d'environnement
2. Vérifiez que l'utilisateur MySQL a les permissions sur la base
3. Testez la connexion dans phpMyAdmin

### Erreur : "EACCES: permission denied"

**Solution** :
```bash
cd /public_html/chatlet
chmod -R 755 dist/
chmod -R 755 node_modules/
```

### Erreur : "Module not found"

**Solution** :
```bash
cd /public_html/chatlet
rm -rf node_modules package-lock.json
npm install --production
```

### Socket.IO ne se connecte pas

**Solution** :
1. Vérifiez que le port 3000 est ouvert
2. Vérifiez les logs pour les erreurs Socket.IO
3. Assurez-vous que WebSocket est activé sur Hostinger

### L'application ne démarre pas

**Solution** :
1. Consultez les logs : **Node.js** → **Logs**
2. Vérifiez que `dist/server/_core/index.js` existe
3. Vérifiez que toutes les variables d'environnement sont définies

---

## 📝 Maintenance

### Mettre à Jour l'Application

```bash
cd /public_html/chatlet
git pull origin main
npm install --production
```

Puis redémarrez l'application dans le panneau Node.js.

### Sauvegarder la Base de Données

Dans phpMyAdmin :
1. Sélectionnez votre base de données
2. Cliquez sur **Exporter**
3. Choisissez **SQL** et téléchargez

### Nettoyer les Anciens Messages

```sql
DELETE FROM messages WHERE createdAt < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

## 📚 Ressources

- **Documentation Hostinger** : https://www.hostinger.com/tutorials/
- **Dépôt GitHub** : https://github.com/Medal-OF-Owner/Chatlet
- **Support Hostinger** : https://www.hostinger.com/contact

---

## 🎉 Félicitations !

Votre application Chatlet est maintenant déployée sur Hostinger ! 🚀

Si vous rencontrez des problèmes, consultez les logs et la section Dépannage ci-dessus.
