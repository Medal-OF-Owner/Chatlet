# Chat App - Real-time Chat Application

## Overview
This is a real-time chat application built with React, Socket.IO, and WebRTC. It allows users to create custom chat rooms, send messages with custom fonts, and optionally share camera/microphone via WebRTC.

**Current Status**: Fully functional with neon cyberpunk design
**Last Updated**: November 28, 2024

## Project Architecture

### Tech Stack
- **Frontend**: React 19 + Vite + Tailwind CSS 4
- **Backend**: Node.js + Express + tRPC + Socket.IO
- **Database**: PostgreSQL (Replit-hosted)
- **Real-time Communication**: Socket.IO + WebRTC (simple-peer)
- **Package Manager**: pnpm
- **Design**: Neon cyan/magenta theme with space background

### Key Features
- Real-time messaging with Socket.IO
- Custom chat rooms with URL-based navigation (e.g., `/manu`, `/gaming`)
- Anonymous access (no account required, just a nickname)
- Camera and microphone sharing via WebRTC
- Custom font selection for messages
- Message persistence in PostgreSQL database
- Profile images (circular avatars next to messages)
- **NEW**: Neon cyberpunk design with space background on all pages
- Responsive design for desktop and mobile

### Directory Structure
```
.
├── client/              # Frontend React application
│   ├── public/          # Static files (space-bg.jpg background image)
│   ├── src/
│   │   ├── components/  # React components (UI library)
│   │   ├── pages/       # Page components (Home, Chat, etc.)
│   │   ├── lib/         # Utilities (socket, trpc, webrtc)
│   │   └── contexts/    # React contexts (Theme)
│   └── index.html
├── server/              # Backend Node.js application
│   ├── _core/           # Core server modules
│   │   ├── index.ts     # Main server entry point
│   │   ├── socketio.ts  # Socket.IO configuration
│   │   ├── trpc.ts      # tRPC setup
│   │   └── vite.ts      # Vite dev server integration
│   ├── db.ts            # Database queries
│   └── routers.ts       # tRPC routers
├── drizzle/             # Database schema
│   └── schema.ts        # PostgreSQL schema definitions
└── shared/              # Shared types and utilities
```

## Recent Changes

### November 28, 2024 - Neon Cyberpunk Design Implementation
**Complete UI Redesign with Cyan/Magenta Neon Theme**

#### Changes Made:
1. **Home Page (Home.tsx)** - Full redesign
   - Neon cyan/magenta gradient text
   - Space background (space-bg.jpg) with 40% black overlay
   - Animated starfield effect
   - Glowing border cards with cyan/magenta gradients
   - Floating logo animation
   - "Enter Room" button with hover scale effect

2. **Auth Pages (Auth.tsx)**
   - Login/Signup pages styled with neon design
   - Cyan border buttons and inputs
   - Gradient text for titles
   - Glowing shadow effects

3. **Password Reset Pages**
   - ForgotPassword.tsx - neon design
   - ResetPassword.tsx - neon design
   - VerifyEmail.tsx - neon design with cyan spinner

4. **Error Page (NotFound.tsx)**
   - 404 page with neon cyan design
   - Space background matching other pages
   - Gradient heading and cyan button

5. **Chat Page (Chat.tsx)**
   - Space background with 40% overlay
   - Header with cyan gradient text and borders
   - Messages card with neon glow effect
   - Input area with neon styling
   - Media controls sidebar with matching design
   - All cards have cyan borders + glow shadow

6. **New Asset**
   - Added `client/public/space-bg.jpg` - space/nebula background image
   - Atténuated with 40% black overlay for readability

#### Design System:
- **Colors**: Cyan (#00d9ff) + Magenta (#ff00ff) + Purple gradients
- **Borders**: 2px cyan with glow effects
- **Text**: Gradient cyan to lighter cyan
- **Buttons**: Cyan gradient with hover glow and scale effect
- **Backgrounds**: Translucent purple/slate with backdrop blur
- **Effects**: Animated stars, floating elements, neon glow shadows

#### CSS/Tailwind Classes Used:
- `bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent` - Gradient text
- `border-2 border-cyan-400/50` - Neon borders
- `box-shadow: 0 0 30px rgba(0, 217, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.2)` - Glow effect
- `backdrop-blur-xl` - Glass morphism
- `hover:shadow-xl hover:shadow-cyan-400/50` - Hover glow
- `transform hover:scale-105` - Hover scale

### November 27, 2024 - Replit Environment Setup
- Moved project from GitHub import to root directory
- Updated Vite configuration for Replit proxy support
- Updated server configuration for Replit environment
- Installed all dependencies with pnpm
- Ran database migrations to PostgreSQL
- Configured deployment for autoscale production environment

## Development

### Running Locally
```bash
pnpm dev
```
Starts the server on port 5000 with hot module replacement.

### Database
PostgreSQL with Drizzle ORM:
- **Schema**: `drizzle/schema.ts`
- **Migrations**: `pnpm drizzle-kit push`
- **Connection**: `DATABASE_URL` environment variable

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (set by Replit)
- `NODE_ENV`: development or production
- `PORT`: Server port (defaults to 5000)
- Optional: `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`

## API Structure

### Socket.IO Events
**Client → Server:**
- `join_room`: Join a chat room
- `send_message`: Send a message with colors/fonts
- `change_nickname`: Change user nickname
- `user_left`: User left the room

**Server → Client:**
- `message_history`: Initial message history
- `new_message`: New message received
- `user_joined`: User joined notification
- `user_left`: User left notification

### tRPC Procedures
- `chat.getOrCreateRoom`: Create or retrieve room
- `chat.getMessages`: Get message history
- `chat.sendMessage`: Send message
- `auth.signup/login`: Authentication endpoints

## Deployment

### Production Configuration
- **Build**: `pnpm install --prod=false && pnpm build`
- **Start**: `pnpm start`
- **Environment**: Autoscale
- **Database**: PostgreSQL via `DATABASE_URL`

## Current Limitations & Notes
- OAuth warnings non-critical - app works without OAuth
- WebRTC requires HTTPS in production (Replit provides)
- Anonymous access by default
- Profile images persist in DB for registered users, session-only for anonymous
- Space background image at `client/public/space-bg.jpg`

## User Preferences
- **Language**: French (parle français avec réponses courtes)
- **Design**: Neon cyberpunk cyan/magenta + space theme
- **Communication**: Brief, direct responses
