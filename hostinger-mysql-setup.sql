-- ============================================================
-- Script de configuration MySQL pour Hostinger - Chatlet
-- ============================================================
-- Ce script crée toutes les tables nécessaires pour l'application
-- Copiez et exécutez ce script dans phpMyAdmin sur Hostinger
-- ============================================================

-- Suppression des tables si elles existent déjà (ordre important pour les contraintes)
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `activeNicknames`;
DROP TABLE IF EXISTS `accounts`;
DROP TABLE IF EXISTS `rooms`;
DROP TABLE IF EXISTS `users`;

-- ============================================================
-- Table: users (Utilisateurs OAuth)
-- ============================================================
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `openId` VARCHAR(64) NOT NULL UNIQUE,
  `name` TEXT,
  `email` VARCHAR(320),
  `loginMethod` VARCHAR(64),
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_users_openId` (`openId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: accounts (Comptes Email/Password)
-- ============================================================
CREATE TABLE `accounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(320) NOT NULL UNIQUE,
  `nickname` VARCHAR(100) NOT NULL UNIQUE,
  `normalizedNickname` VARCHAR(100) NOT NULL UNIQUE,
  `passwordHash` VARCHAR(255) NOT NULL,
  `emailVerified` TIMESTAMP NULL,
  `verificationToken` VARCHAR(255),
  `resetToken` VARCHAR(255),
  `resetTokenExpiry` TIMESTAMP NULL,
  `profileImage` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastLogin` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_accounts_email` (`email`),
  INDEX `idx_accounts_nickname` (`nickname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: rooms (Salons de chat)
-- ============================================================
CREATE TABLE `rooms` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_rooms_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: messages (Messages de chat)
-- ============================================================
CREATE TABLE `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `roomId` INT NOT NULL,
  `nickname` VARCHAR(100) NOT NULL,
  `content` TEXT NOT NULL,
  `fontFamily` VARCHAR(100) DEFAULT 'sans-serif',
  `profileImage` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_messages_roomId` (`roomId`),
  INDEX `idx_messages_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: activeNicknames (Pseudos actifs en temps réel)
-- ============================================================
CREATE TABLE `activeNicknames` (
  `nickname` VARCHAR(50) PRIMARY KEY,
  `connectedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Vérification de la création des tables
-- ============================================================
-- Vous pouvez exécuter cette requête pour vérifier que tout est créé :
-- SHOW TABLES;

-- Pour voir la structure d'une table :
-- DESCRIBE users;
-- DESCRIBE accounts;
-- DESCRIBE rooms;
-- DESCRIBE messages;
-- DESCRIBE activeNicknames;
