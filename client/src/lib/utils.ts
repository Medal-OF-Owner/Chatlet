import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate random nickname
export const adjectives = [
  "Happy", "Clever", "Swift", "Bright", "Calm", "Bold", "Witty", "Keen",
  "Lively", "Eager", "Gentle", "Mighty", "Noble", "Quick", "Rare", "Sleek",
  "Sunny", "Tidy", "Vivid", "Wise", "Zesty", "Alert", "Bouncy", "Crafty",
  "Daring", "Eager", "Fierce", "Graceful", "Honest", "Jolly", "Kind", "Loyal",
];

export const animals = [
  "Panda", "Tiger", "Eagle", "Dolphin", "Fox", "Wolf", "Bear", "Lion",
  "Penguin", "Rabbit", "Squirrel", "Deer", "Otter", "Hawk", "Owl", "Raven",
  "Shark", "Whale", "Phoenix", "Dragon", "Unicorn", "Cheetah", "Lynx", "Badger",
  "Emu", "Koala", "Lemur", "Meerkat", "Narwhal", "Ocelot", "Puma", "Quail",
];

export function generateRandomNickname(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${adjective}${animal}${number}`;
}

/**
 * Normalize nickname by replacing both 'I' (capital i) and 'l' (lowercase L) with lowercase 'l'.
 * Ensures visually similar nicknames like "lucie" and "Iucie" are considered equivalent.
 */
export function normalizeNickname(nickname: string): string {
  return nickname.replace(/[Il]/g, "l").toLowerCase();
}
