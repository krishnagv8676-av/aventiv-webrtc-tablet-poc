import { createServer } from 'node:http';
import os from 'node:os';
import { WebSocketServer } from 'ws';

const port = Number(process.env.PORT || 3000);
const networkAddress = Object.values(os.networkInterfaces()).flat().find((entry) => entry?.family === 'IPv4' && !entry.internal)?.address;
const server = createServer((request, response) => {
  if (request.url === '/') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ service: 'Aventiv WebRTC signaling', status: 'running', health: '/health', websocket: 'same URL' }));
    return;
  }
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ service: 'signaling', status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }
  if (request.url === '/network') {
    response.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
    response.end(JSON.stringify({ host: networkAddress || 'localhost', appPort: 4200, signalingPort: port }));
    return;
  }
  response.writeHead(404);
  response.end('Not found');
});

const rooms = new Map();
const wss = new WebSocketServer({ server });
wss.on('connection', (socket) => {
  let room;
  let clientId;
  socket.on('message', (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      socket.send(JSON.stringify({ type: 'error', message: 'Invalid signaling message' }));
      return;
    }
    if (message.type === 'join') {
      room = message.room || 'default';
      clientId = message.clientId;
      socket.clientId = clientId;
      const peers = rooms.get(room) || new Set();
      for (const peer of peers) if (peer.readyState === 1) peer.send(JSON.stringify({ type: 'participant-joined', clientId }));
      peers.add(socket); rooms.set(room, peers);
      if (peers.size === 1) socket.send(JSON.stringify({ type: 'waiting' }));
      return;
    }
    const peers = rooms.get(room) || [];
    for (const peer of peers) if (peer !== socket && peer.readyState === 1) {
      const target = JSON.parse(raw.toString());
      if (!target.to || peer.clientId === target.to) peer.send(JSON.stringify({ ...target, from: clientId }));
    }
  });
  socket.clientId = undefined;
  socket.on('close', () => {
    if (room) {
      const peers = rooms.get(room);
      for (const peer of peers || []) if (peer !== socket && peer.readyState === 1) peer.send(JSON.stringify({ type: 'participant-left', clientId }));
      peers?.delete(socket);
      if (!peers?.size) rooms.delete(room);
    }
  });
});

server.listen(port, () => console.log(`Signaling service listening on http://localhost:${port}`));
