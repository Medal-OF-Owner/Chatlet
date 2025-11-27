# Chat App - Real-time Chat Application

## Overview
This is a real-time chat application built with React, Socket.IO, and WebRTC. It allows users to create custom chat rooms, send messages with custom fonts, and optionally share camera/microphone via WebRTC.

**Current Status**: Fully functional and running on Replit
**Last Updated**: November 27, 2024

## Project Architecture

### Tech Stack
- **Frontend**: React 19 + Vite + Tailwind CSS 4
- **Backend**: Node.js + Express + tRPC + Socket.IO
- **Database**: PostgreSQL (Replit-hosted)
- **Real-time Communication**: Socket.IO + WebRTC (simple-peer)
- **Package Manager**: pnpm

### Key Features
- Real-time messaging with Socket.IO
- Custom chat rooms with URL-based navigation (e.g., `/manu`, `/gaming`)
- Anonymous access (no account required, just a nickname)
- Camera and microphone sharing via WebRTC
- Custom font selection for messages
- Message persistence in PostgreSQL database
- Responsive design for desktop and mobile

### Directory Structure
```
.
├── client/              # Frontend React application
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

### November 27, 2024 - Replit Environment Setup
- Moved project from GitHub import to root directory
- Updated Vite configuration for Replit proxy support:
  - Changed port from 3000 to 5000
  - Added Replit domain hosts (`.replit.dev`, `.replit.app`, `.replit.co`)
  - Set host to `0.0.0.0` for external access
  - Added HMR clientPort configuration for SSL proxy
  - Added `global: 'globalThis'` polyfill for simple-peer compatibility
  - Added `vite-plugin-node-polyfills` to fix WebRTC/simple-peer Node.js module compatibility
- Updated server configuration:
  - Changed default port to 5000
  - Set server to listen on `0.0.0.0` for Replit environment
- Installed all dependencies with pnpm
- Ran database migrations to PostgreSQL
- Configured deployment for autoscale production environment

## Development

### Running Locally
The development server is configured to run automatically via the workflow:
```bash
pnpm dev
```
This starts the server on port 5000 with hot module replacement.

### Database
The application uses PostgreSQL with Drizzle ORM:
- **Schema**: Defined in `drizzle/schema.ts`
- **Migrations**: Run with `pnpm drizzle-kit push`
- **Connection**: Uses `DATABASE_URL` environment variable (automatically set by Replit)

### Environment Variables
Required variables (automatically configured in Replit):
- `DATABASE_URL`: PostgreSQL connection string (set by Replit)
- `NODE_ENV`: Set to `development` or `production`
- `PORT`: Server port (defaults to 5000)

Optional OAuth variables (for authentication features):
- `OAUTH_SERVER_URL`: OAuth server URL (shows warning if not set, but app works without it)
- `VITE_OAUTH_PORTAL_URL`: OAuth portal URL
- `VITE_APP_ID`: Application ID

### API Structure

#### Socket.IO Events
**Client → Server:**
- `join_room`: Join a chat room
- `send_message`: Send a message to a room

**Server → Client:**
- `message_history`: Initial message history on room join
- `new_message`: New message received
- `user_joined`: User joined the room
- `user_left`: User left the room

#### tRPC Procedures
- `chat.getOrCreateRoom`: Create or retrieve a chat room by slug
- `chat.getMessages`: Get message history for a room
- `chat.sendMessage`: Send a message (also broadcasts via Socket.IO)

## Deployment

### Production Configuration
The app is configured for Replit Autoscale deployment:
- **Build**: `pnpm install --prod=false && pnpm build`
- **Start**: `pnpm start`
- **Environment**: Autoscale (stateless, scales with traffic)

Production deployment will:
1. Install all dependencies
2. Build the frontend with Vite
3. Bundle the backend with esbuild
4. Serve static files from `dist/public`
5. Run the production server on port 5000

### Database in Production
The PostgreSQL database is already set up and will be available in production via the same `DATABASE_URL` environment variable.

## Notes
- The OAuth configuration warnings in the logs are non-critical - the app works without OAuth
- WebRTC features (camera/microphone) require HTTPS in production (Replit provides this)
- The app uses anonymous access by default, no user authentication required
- Node.js polyfills are configured via vite-plugin-node-polyfills to support WebRTC/simple-peer in the browser

## User Preferences
None specified yet.
