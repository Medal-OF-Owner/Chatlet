-- Fix Database Schema Issues
-- Run this if you get "column does not exist" errors

-- Add missing columns to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS "profileImage" TEXT;

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS "textColor" VARCHAR(7) DEFAULT '#ffffff';

-- Add missing columns to accounts table  
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS "profileImage" TEXT;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS "verificationToken" VARCHAR(255);

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS "resetToken" VARCHAR(255);

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS "normalizedNickname" VARCHAR(100);

-- Verify tables exist
SELECT COUNT(*) as messages_count FROM messages;
SELECT COUNT(*) as accounts_count FROM accounts;
SELECT COUNT(*) as rooms_count FROM rooms;
SELECT COUNT(*) as users_count FROM users;
