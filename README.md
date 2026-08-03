# Sledje — Coming Soon

A futuristic, space/Milky-Way themed "coming soon" landing page for **sledje**, built on the MERN stack.

- **Client** (`/client`): React + Vite. Animated starfield, drifting nebula, floating planet, gradient headline, countdown timer, and a launch-list signup form. Purple/black theme, fully responsive.
- **Server** (`/server`): Express + Mongoose API that stores launch-list emails in MongoDB.

## Getting started

```bash
npm run install:all   # installs deps for both client and server
cp server/.env.example server/.env   # then fill in MONGODB_URI
cp client/.env.example client/.env   # optional, defaults to /api via the dev proxy
npm run dev            # runs client (http://localhost:5173) and server (http://localhost:5000) together
```

## Project structure

```
client/   React + Vite front end
server/   Express + Mongoose API
```

## Configuration

- `client/src/config.js` — set `LAUNCH_DATE` to change the countdown target.
- `server/.env` — `MONGODB_URI`, `PORT`, `CLIENT_ORIGIN`.

## Build

```bash
npm run build   # builds the client for production (client/dist)
```

Deploy `server` as a Node process (with `MONGODB_URI` set) and serve `client/dist` as a static site, pointing API calls at the server.
