-- Script de configuration complet pour PostgreSQL sur Hostinger
-- Copiez et exécutez ce script dans votre console SQL Hostinger

-- Suppression des tables si elles existent déjà
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS "activeNicknames" CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;

-- Table des utilisateurs (OAuth)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  "loginMethod" VARCHAR(64),
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "lastSignedIn" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table des comptes (Email/Password)
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  nickname VARCHAR(100) NOT NULL UNIQUE,
  "normalizedNickname" VARCHAR(100) NOT NULL UNIQUE,
  "passwordHash" VARCHAR(255) NOT NULL,
  "emailVerified" TIMESTAMP,
  "verificationToken" VARCHAR(255),
  "resetToken" VARCHAR(255),
  "resetTokenExpiry" TIMESTAMP,
  "profileImage" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "lastLogin" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table des salons
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table des messages
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  "roomId" INTEGER NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  "fontFamily" VARCHAR(100) DEFAULT 'sans-serif',
  "profileImage" TEXT,
  "textColor" VARCHAR(7) DEFAULT '#ffffff',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table des pseudos actifs (temps réel)
CREATE TABLE "activeNicknames" (
  nickname VARCHAR(100) PRIMARY KEY,
  "connectedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index pour la performance
CREATE INDEX idx_messages_room_id ON messages("roomId");
CREATE INDEX idx_messages_created_at ON messages("createdAt");
CREATE INDEX idx_users_open_id ON users("openId");
CREATE INDEX idx_rooms_slug ON rooms(slug);
CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_nickname ON accounts(nickname);

-- Trigger pour mettre à jour updatedAt automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
