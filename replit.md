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
- Neon cyberpunk design with space background on all pages
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

### November 28, 2024 - Database Fix & Neon Design Complete
**Fixed profileImage column issue and finalized UI redesign**

#### Database Fix:
- Added missing `profileImage` column to `messages` table (text type, nullable)
- This column stores profile image URLs for user avatars in chat
- Fixed DrizzleQueryError that was preventing messages from being sent

#### UI Redesign Complete:
1. **Home Page (Home.tsx)**
   - Neon cyan/magenta gradient text
   - Space background (space-bg.jpg) with 40% black overlay
   - Animated starfield effect
   - Glowing border cards

2. **Auth Pages (Auth.tsx)**
   - Login/Signup with neon design
   - Cyan borders and gradient text

3. **Password Reset Pages**
   - ForgotPassword.tsx - neon design
   - ResetPassword.tsx - neon design
   - VerifyEmail.tsx - neon cyan design

4. **Error Page (NotFound.tsx)**
   - 404 page with neon cyan design
   - Space background

5. **Chat Page (Chat.tsx)**
   - Space background with 40% overlay
   - Header with cyan gradient text
   - Messages card with neon glow
   - Input area with neon styling
   - Fixed JSX closing tags

#### Design System:
- **Colors**: Cyan (#00d9ff) + Magenta (#ff00ff) + Purple gradients
- **Borders**: 2px cyan with glow effects
- **Text**: Gradient cyan to lighter cyan
- **Buttons**: Cyan gradient with hover glow and scale
- **Backgrounds**: Translucent purple/slate with backdrop blur

### Previous Session - November 27, 2024
- Replit environment setup
- Moved project to root directory
- Updated Vite/server configuration
- Installed dependencies with pnpm
- Configured autoscale deployment

## Development

### Running Locally
```bash
pnpm dev
```
Starts on port 5000 with hot reload.

### Database
PostgreSQL with Drizzle ORM:
- **Schema**: `drizzle/schema.ts`
- **Sync**: `pnpm drizzle-kit push`
- **Connection**: `DATABASE_URL` (set by Replit)

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection (Replit)
- `NODE_ENV`: development or production
- `PORT`: Server port (5000)
- Optional: `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`

## API Structure

### Socket.IO Events
**Client → Server:**
- `join_room`: Join chat room
- `send_message`: Send message with fonts
- `change_nickname`: Change nickname
- `user_left`: User left

**Server → Client:**
- `message_history`: Initial history
- `new_message`: New message
- `user_joined`: User joined
- `user_left`: User left

### tRPC Procedures
- `chat.getOrCreateRoom`: Create/retrieve room
- `chat.getMessages`: Get history
- `chat.sendMessage`: Send message
- `auth.signup/login`: Authentication

## Deployment

### Production Configuration
- **Build**: `pnpm install --prod=false && pnpm build`
- **Start**: `pnpm start`
- **Environment**: Autoscale
- **Database**: PostgreSQL via `DATABASE_URL`

## Current Status & Notes
- ✅ All UI pages redesigned with neon cyberpunk aesthetic
- ✅ Database profileImage column added and working
- ✅ OAuth warnings non-critical
- ✅ WebRTC works (requires HTTPS in production)
- ⚠️ Workflow needs restart after git push to see changes live

## User Preferences
- **Language**: French (short responses)
- **Design**: Neon cyberpunk cyan/magenta + space theme
- **Communication**: Brief, direct
