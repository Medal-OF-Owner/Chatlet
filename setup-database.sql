-- PostgreSQL Migration Script for Chatlet
-- Execute this script on your PostgreSQL database before deploying

-- Drop existing tables if they exist
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS "activeNicknames" CASCADE;

-- Create users table
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

-- Create rooms table
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  "roomId" INTEGER NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  "fontFamily" VARCHAR(100) DEFAULT 'sans-serif',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create activeNicknames table (for tracking connected users)
CREATE TABLE "activeNicknames" (
  nickname VARCHAR(100) PRIMARY KEY,
  "connectedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_messages_room_id ON messages("roomId");
CREATE INDEX idx_messages_created_at ON messages("createdAt");
CREATE INDEX idx_users_open_id ON users("openId");
CREATE INDEX idx_rooms_slug ON rooms(slug);

-- Create trigger for updating updatedAt on users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
