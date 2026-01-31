#!/bin/bash

# Script de déploiement Hostinger pour Chatlet
# Usage: bash deploy.sh

echo "🚀 Démarrage du déploiement Chatlet sur Hostinger..."

# 1. Vérifier les fichiers essentiels
echo "📋 Vérification des fichiers..."
if [ ! -f "dist/server/_core/index.js" ]; then
    echo "❌ Erreur: dist/server/_core/index.js non trouvé!"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    echo "❌ Erreur: .env.production non trouvé!"
    exit 1
fi

# 2. Installer les dépendances en production
echo "📦 Installation des dépendances..."
npm install --production --omit=dev

# 3. Fixer les permissions
echo "🔒 Correction des permissions..."
chmod -R 755 dist/
chmod -R 755 node_modules/

# 4. Vérifier la base de données
echo "🗄️ Vérification de la base de données..."
# Cette étape serait exécutée via phpMyAdmin
# Vous devez avoir exécuté hostinger-mysql-setup.sql avant

# 5. Afficher le résumé
echo ""
echo "✅ Déploiement préparé!"
echo "📊 Résumé:"
echo "  - Framework: Express"
echo "  - Node.js: 22.x"
echo "  - Entry point: dist/server/_core/index.js"
echo "  - Start command: npm start"
echo "  - Domain: azure-flamingo-947866.hostingersite.com"
echo ""
echo "⚠️  RAPPEL DE SÉCURITÉ:"
echo "  - Changez TOUS les mots de passe après le déploiement"
echo "  - Vérifiez que DATABASE_URL est correct"
echo "  - Testez la connexion SMTP"
echo ""
