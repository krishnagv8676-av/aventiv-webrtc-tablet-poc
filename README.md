# Aventiv Unity Platform POC

Angular 21 operations console and a Node.js WebRTC signaling service arranged as an npm workspace monorepo.

## Run

```powershell
npm install
npm run start:server
npm start
```

Use `http://localhost:4200` for local development. For physical devices, stop `npm start` and use `npm run start:secure`, then open the HTTPS LAN URL and accept the local certificate warning. Click **Copy invite** to generate a LAN URL automatically. Both devices must be on the same network, and the Windows Firewall must allow ports `4200` and `3000`.
