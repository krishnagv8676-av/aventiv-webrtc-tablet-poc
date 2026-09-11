# Aventiv Unity Platform POC

## 1. Project Summary

This project is a browser-based Angular tablet console with a Node.js WebRTC signaling service.

It is not a native Android or iOS application. It is a responsive web application designed to run in a browser on a tablet, phone, or desktop computer.

The project contains two main runtime parts:

1. Angular tablet-console frontend
2. Node.js WebRTC signaling server

The browser handles the real camera, microphone, and WebRTC media connection. The Node.js server only coordinates signaling messages between participants.

---

## 2. Project Structure

```text
C:\Aventiv_Poc2_Tablet_Angular
|
|-- package.json
|-- package-lock.json
|-- README.md
|-- PROJECT_GUIDE.md
|
|-- apps
|   `-- tablet-console
|       |-- package.json
|       |-- angular.json
|       |-- proxy.conf.json
|       |-- tsconfig.json
|       |-- public
|       `-- src
|           |-- index.html
|           |-- main.ts
|           |-- styles.scss
|           `-- app
|               |-- app.ts
|               |-- app.config.ts
|               |-- app.routes.ts
|               |-- app.html
|               |-- app.scss
|               `-- components
|                   |-- dashboard-metrics
|                   |-- home-console
|                   |-- secure-call
|                   |-- tablet-network
|                   `-- unity-mail-poc
|
`-- services
    `-- signaling
        |-- package.json
        `-- src
            `-- server.js
```

---

## 3. Technologies Used

### Frontend

- Angular 21
- TypeScript
- Angular standalone components
- Angular Router
- Angular Signals
- Angular FormsModule
- Browser WebRTC APIs
- Browser MediaRecorder API
- WebSocket client
- SCSS/CSS

### Backend

- Node.js
- Native Node HTTP server
- `ws` WebSocket package
- In-memory room management

### Not currently included

- AWS services
- Database
- Real authentication
- Real authorization
- Real AI or machine-learning service
- Persistent mail storage
- Production TLS certificate
- Native Android/iOS packaging

---

## 4. Important Files

### Root files

- `package.json`: workspace commands and project scripts
- `README.md`: short setup instructions
- `PROJECT_GUIDE.md`: complete project explanation

### Angular files

- `apps/tablet-console/src/main.ts`: bootstraps Angular
- `apps/tablet-console/src/app/app.ts`: root router outlet
- `apps/tablet-console/src/app/app.config.ts`: Angular providers
- `apps/tablet-console/src/app/app.routes.ts`: application routes
- `apps/tablet-console/src/app/components/home-console/home-console.ts`: home dashboard
- `apps/tablet-console/src/app/components/dashboard-metrics/dashboard-metrics.ts`: dashboard metrics
- `apps/tablet-console/src/app/components/secure-call/secure-call.ts`: WebRTC call logic
- `apps/tablet-console/src/app/components/secure-call/secure-call.html`: call UI
- `apps/tablet-console/src/app/components/secure-call/secure-call.scss`: call styling
- `apps/tablet-console/src/app/components/unity-mail-poc/unity-mail-poc.ts`: Unity Mail simulation
- `apps/tablet-console/proxy.conf.json`: frontend-to-server proxy

### Server files

- `services/signaling/src/server.js`: HTTP health endpoints and WebSocket signaling
- `services/signaling/package.json`: signaling service dependencies and scripts

---

## 5. Angular Routes

Routes are defined in `apps/tablet-console/src/app/app.routes.ts`.

```text
/             Home dashboard and secure call UI
/unity-mail   Unity Mail / AI Trust Layer POC
```

The home page contains a button labelled:

```text
UNITY MAIL / AI TRUST LAYER
```

Clicking this button navigates to `/unity-mail` using Angular Router.

---

## 6. Home Dashboard UI

The home page is implemented by `HomeConsoleComponent`.

The screen contains:

1. Aventiv brand header
2. System status indicator
3. Greeting and network description
4. Unity Mail launch button
5. Dashboard metric cards
6. Secure Call panel

The dashboard metric values are demo values and are currently hardcoded:

- Tablets online: 1,284
- Active sessions: 846
- Open orders: 32
- Content delivery: 98.7%

These values are not loaded from a backend database.

---

## 7. Unity Mail / AI Trust Layer POC

The Unity Mail page is implemented in:

```text
apps/tablet-console/src/app/components/unity-mail-poc/unity-mail-poc.ts
```

It is a frontend-only simulation for demonstrating the product flow.

### Facility Portal tabs

The Facility Portal has three tabs:

1. Contact Requests
2. Quarantine Queue
3. Policy Configuration

### Contact Requests

The user can approve pending family and friend contacts.

When a contact is approved:

1. The contact is removed from pending requests.
2. The contact is added to approved contacts.
3. The mailbox can use that contact.
4. An audit entry is added.

### II Mailbox

The mailbox allows the user to compose a message.

Only approved contacts can be selected.

If an unapproved contact is selected, sending is blocked with a notice.

The POC includes:

- Recipient selection
- Subject input
- Message body
- Send to review button
- Safe draft button
- Flagged draft button
- Recent mail list

### AI triage simulation

The POC checks message text using keyword patterns.

Example trigger words include:

```text
drugs
contraband
weapon
escape
attack
blackmail
threat
urgent
passcode
```

It also checks:

- Sentiment and urgency
- Media-related words such as video, image, and attachment
- Enabled policy toggles

Clean messages are marked as delivered.

Flagged messages are placed in the quarantine queue.

### Quarantine Queue

Facility staff can:

- Release a message
- Block a message

Released messages appear in recent mail.

Blocked and released actions are recorded in the audit trail held in frontend memory.

### Policy Configuration

The available policy toggles are:

- Keyword detection
- Sentiment analysis
- Image/video moderation
- Auto-release

These settings demonstrate the phased-trust model. They are simulated in the browser and are not saved to a backend database.

---

## 8. Secure Call UI

The Secure Call feature is implemented in:

```text
apps/tablet-console/src/app/components/secure-call/secure-call.ts
apps/tablet-console/src/app/components/secure-call/secure-call.html
apps/tablet-console/src/app/components/secure-call/secure-call.scss
```

The call UI supports:

- Video calls
- Audio calls
- Room code entry
- Copy invite
- Camera preview
- Remote video streams
- Microphone toggle
- Camera toggle
- End call
- Local browser recording
- Recording download

The default room code is:

```text
unity-4821
```

A URL parameter can override the room code:

```text
?room=unity-4821
```

---

## 9. Call Flow Step by Step

### Step 1: Open the application

The user opens the Angular app in a browser.

### Step 2: Enter or receive a room code

The default code is `unity-4821`.

A copied invite URL contains the room code:

```text
https://<LAN-IP>:4200/?room=unity-4821
```

### Step 3: Select video or audio

The user selects video call or audio call.

### Step 4: Click Join room

The browser requests media access through:

```typescript
navigator.mediaDevices.getUserMedia(...)
```

For video mode:

```text
video: true
audio: true
```

For audio mode:

```text
video: false
audio: true
```

### Step 5: Create WebSocket connection

The frontend opens a WebSocket through the Angular proxy.

For HTTPS:

```text
wss://<host>/ws
```

For HTTP:

```text
ws://<host>/ws
```

### Step 6: Join the room

The browser sends:

```json
{
  "type": "join",
  "room": "unity-4821",
  "clientId": "unique-client-id"
}
```

### Step 7: Signaling server finds room participants

The Node.js server stores sockets by room code.

If another participant is already in the room, it sends a `participant-joined` event to the existing participants.

### Step 8: WebRTC negotiation

The participant creating the connection creates an offer.

The other participant creates an answer.

The clients exchange:

- Offer
- Answer
- ICE candidates

### Step 9: Media connection

After negotiation, WebRTC sends the audio/video directly between browsers when possible.

The signaling server does not carry the media stream.

### Step 10: Remote video display

The remote stream is received through the WebRTC `ontrack` event and rendered in a remote video element.

---

## 10. WebRTC Details

The frontend creates peer connections using:

```typescript
new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
})
```

The local media tracks are added to every peer connection.

Each peer connection handles:

- Offer generation
- Answer generation
- ICE candidate collection
- Remote track reception
- Connection state changes

For multiple participants, the browser creates a separate peer connection for each remote participant.

The current implementation uses a mesh-style WebRTC model:

```text
Participant A <-> Participant B
Participant A <-> Participant C
Participant B <-> Participant C
```

This is suitable for a small POC. A production system with many users would usually use an SFU media server.

---

## 11. Node.js Signaling Server

The signaling server is:

```text
services/signaling/src/server.js
```

It runs on port `3000` by default.

The server provides these HTTP endpoints:

```text
GET http://localhost:3000/
GET http://localhost:3000/health
GET http://localhost:3000/network
```

### Health endpoint

```text
http://localhost:3000/health
```

Expected response:

```json
{
  "service": "signaling",
  "status": "ok"
}
```

### Network endpoint

```text
http://localhost:3000/network
```

It returns the detected LAN address and ports used by the frontend invite generator.

### WebSocket signaling

The same Node HTTP server also hosts the WebSocket server.

Rooms are stored in memory:

```javascript
const rooms = new Map();
```

When a client disconnects, the server notifies the remaining participants and removes the empty room.

Room data is lost when the server restarts.

---

## 12. Angular Proxy

The proxy file is:

```text
apps/tablet-console/proxy.conf.json
```

It forwards:

```text
/network -> http://localhost:3000
/ws      -> ws://localhost:3000
```

This allows the browser to use the Angular app host while the development server forwards signaling traffic to Node.js.

---

## 13. Why HTTPS Is Required

Camera and microphone access requires a secure browser context.

Valid secure contexts are:

- `https://...`
- `http://localhost...`
- `http://127.0.0.1...`

A LAN IP using HTTP is not secure for camera and microphone access:

```text
http://10.x.x.x:4200
```

For LAN devices, use:

```text
https://10.x.x.x:4200
```

The development certificate is self-signed, so the browser displays a certificate warning. Accept the warning for local POC testing.

---

## 14. Correct Startup Procedure

Open PowerShell in:

```text
C:\Aventiv_Poc2_Tablet_Angular
```

### Terminal 1: start signaling server

```powershell
npm run start:server
```

Expected output:

```text
Signaling service listening on http://localhost:3000
```

### Terminal 2: start Angular securely

```powershell
npm start
```

The root `npm start` command now starts the secure Angular app.

Expected output:

```text
Local:   https://localhost:4200/
Network: https://<LAN-IP>:4200/
```

### Local browser URL

```text
https://localhost:4200/?room=unity-4821
```

### Other-device URL

```text
https://<LAN-IP>:4200/?room=unity-4821
```

Both devices must be on the same network.

---

## 15. Copy Invite Procedure

1. Open the app using HTTPS.
2. Enter the room code.
3. Click `Copy invite`.
4. Send the copied URL to the second device.
5. Open the link on the second device.
6. Accept the certificate warning.
7. Allow camera and microphone.
8. Click `Open call studio`.
9. Click `Join room`.

The app refuses to copy an invite when the current page is insecure. This prevents sharing a broken HTTP LAN link.

---

## 16. Common Errors

### `EADDRINUSE: address already in use :::3000`

Another Node process is already using port 3000.

Check the owner:

```powershell
Get-NetTCPConnection -LocalPort 3000
```

Stop the process if necessary:

```powershell
Stop-Process -Id <PID> -Force
```

Then restart:

```powershell
npm run start:server
```

### `ERR_EMPTY_RESPONSE` on localhost

Check the protocol.

If the app is running securely, use:

```text
https://localhost:4200
```

Do not use:

```text
http://localhost:4200
```

### Browser shows `Not secure`

The page was opened using HTTP.

Use the HTTPS URL and accept the certificate warning.

### Other device cannot join

Check all of the following:

- Both devices are on the same LAN/Wi-Fi.
- The invite starts with `https://`.
- The second device uses the PC LAN IP, not `localhost`.
- The signaling server is running on port 3000.
- The Angular app is running on port 4200.
- Windows Firewall allows ports 4200 and 3000.
- Camera and microphone permissions are allowed.
- Both users use the same room code.

### `chrome-extension://... ERR_FILE_NOT_FOUND`

This is a browser extension error, not an Angular or Node application error. Disable the extension or test in an Incognito window with extensions disabled.

### `EADDRINUSE` on port 4200

Another Angular dev server is already running.

Check the owner:

```powershell
Get-NetTCPConnection -LocalPort 4200
```

Stop the old Angular process and restart the correct command.

---

## 17. Verification Commands

### Check signaling health

```powershell
Invoke-WebRequest http://localhost:3000/health
```

### Check HTTPS Angular app

```powershell
curl.exe -k -I https://localhost:4200/
```

### Check active ports

```powershell
Get-NetTCPConnection -LocalPort 3000,4200 |
  Where-Object State -eq 'Listen' |
  Select-Object LocalAddress,LocalPort,OwningProcess
```

### Build the Angular app

```powershell
npm run build
```

A successful build means the Angular code compiles. It does not replace testing the camera, microphone, WebSocket, and WebRTC behavior in two real browsers.

---

## 18. Current POC Limitations

This is a demonstration implementation, not production infrastructure.

Current limitations include:

- Room state is stored only in memory.
- No user authentication.
- No resident/facility authorization model.
- No persistent contact database.
- No persistent quarantine database.
- No real AI moderation service.
- No media storage service.
- No TURN server for difficult networks.
- Only Google STUN is configured.
- Self-signed development HTTPS certificate.
- Mesh WebRTC does not scale well to many participants.
- Dashboard metrics are static demo values.
- Unity Mail data disappears when the page is refreshed.

For production, the next architecture steps would normally include:

1. Authentication and role-based authorization.
2. Persistent database for contacts and messages.
3. Real moderation service or AI pipeline.
4. Durable audit logging.
5. TURN server for reliable WebRTC connectivity.
6. SFU media server for larger group calls.
7. Trusted TLS certificates.
8. Production deployment and monitoring.

---

## 19. Short Explanation for Colleagues

> This is an Angular browser-based tablet console backed by a small Node.js WebSocket signaling service. The Angular app provides the dashboard, secure call UI, and Unity Mail trust-layer POC. The browser captures camera and microphone media and establishes WebRTC connections between participants. The Node server does not process the video; it only places clients into room codes and forwards WebRTC negotiation messages. Unity Mail is currently a frontend simulation showing contact approval, approved-recipient restrictions, AI-style triage, quarantine review, policy toggles, and audit events. HTTPS is required for LAN camera and microphone access.
