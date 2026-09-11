import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Recording = { id: string; room: string; createdAt: string; url: string };
type Peer = { connection: RTCPeerConnection; candidates: RTCIceCandidateInit[] };

@Component({
  selector: 'app-secure-call',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './secure-call.html',
  styleUrl: './secure-call.scss'
})
export class SecureCallComponent {
  @ViewChild('localVideo') private localVideo?: ElementRef<HTMLVideoElement>;
  protected readonly callState = signal<'idle' | 'connecting' | 'live' | 'error'>('idle');
  protected readonly callMode = signal<'video' | 'audio'>('video');
  protected readonly micOn = signal(true);
  protected readonly cameraOn = signal(true);
  // protected readonly roomCode = signal('unity-4821');
  protected readonly roomCode = signal(this.generateRoomCode());
  protected readonly notice = signal('Choose video or audio, then share the room code');
  protected readonly participantCount = signal(0);
  protected readonly recording = signal(false);
  protected readonly savedRecordings = signal<Recording[]>(this.loadRecordings());
  protected readonly localStream = signal<MediaStream | undefined>(undefined);
  protected readonly remoteStreams = signal<{ id: string; stream: MediaStream }[]>([]);
  private socket?: WebSocket;
  private clientId = globalThis.crypto?.randomUUID?.() || `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  private peers = new Map<string, Peer>();
  private queuedMessages: object[] = [];
  private recorder?: MediaRecorder;
  private chunks: Blob[] = [];

  constructor() {
    const room = new URLSearchParams(window.location.search).get('room');
    if (room) this.roomCode.set(room);
  }

  protected selectMode(mode: 'video' | 'audio') { this.callMode.set(mode); }
  protected get inviteLink() { return `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(this.roomCode())}`; }
  protected async copyInvite() {
    if (!window.isSecureContext) {
      this.notice.set('Open the HTTPS URL before copying an invite: https://<LAN-IP>:4200');
      return;
    }

    let link = this.inviteLink;
    if (['localhost', '127.0.0.1'].includes(location.hostname)) {
      const network = await fetch('/network').then((response) => response.json());
      link = `${location.protocol}//${network.host}:${network.appPort}${location.pathname}?room=${encodeURIComponent(this.roomCode())}`;
    }
    await navigator.clipboard.writeText(link);
    this.notice.set('Invite copied. Open it on another device.');
  }

  protected async startCall() {
    if (this.callState() !== 'idle' && this.callState() !== 'error') return;
    this.callState.set('connecting');
    try {
      if (!window.isSecureContext || !navigator.mediaDevices) throw new Error('secure-context');
      const constraints = this.callMode() === 'video' ? { video: true, audio: true } : { video: false, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream.set(stream);
      if (this.localVideo) this.localVideo.nativeElement.srcObject = stream;
      const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
      this.socket = new WebSocket(`${protocol}://${location.host}/ws`);
      this.socket.onopen = () => {
        this.send({ type: 'join', room: this.roomCode(), clientId: this.clientId });
        this.flushMessages();
      };
      this.socket.onmessage = async ({ data }) => this.handleSignal(JSON.parse(data));
      this.socket.onerror = () => {
        this.callState.set('error');
        this.notice.set('Unable to connect to the call server. Check the shared HTTPS link and network.');
      };
      this.socket.onclose = () => {
        if (this.callState() === 'connecting') {
          this.callState.set('error');
          this.notice.set('The call server connection closed before joining.');
        }
      };
      this.notice.set('Waiting for other participants to join...');
    } catch (error) {
      this.callState.set('error');
      if (error instanceof Error && error.message === 'secure-context') this.notice.set('Use HTTPS and accept the certificate before joining.');
      else if (error instanceof DOMException && error.name === 'NotAllowedError') this.notice.set('Camera or microphone permission was denied. Allow both in browser settings.');
      else if (error instanceof DOMException && error.name === 'NotFoundError') this.notice.set('No camera or microphone was found on this device.');
      else if (error instanceof DOMException && error.name === 'NotReadableError') this.notice.set('Camera or microphone is already being used by another app.');
      else this.notice.set('Unable to access camera and microphone. Check HTTPS and device permissions.');
    }
  }

  private async handleSignal(message: any) {
    if (message.type === 'waiting') { this.notice.set(`Room ${this.roomCode()} is ready to join`); return; }
    if (message.type === 'participant-joined') { await this.createPeer(message.clientId, true); return; }
    if (message.type === 'offer') {
      await this.createPeer(message.from, false);
      const peer = this.peers.get(message.from)?.connection;
      await peer?.setRemoteDescription(message.offer);
      await this.flushCandidates(message.from);
      const answer = await peer?.createAnswer();
      await peer?.setLocalDescription(answer);
      this.send({ type: 'answer', to: message.from, answer });
      this.connected();
      return;
    }
    if (message.type === 'answer') { const peer = this.peers.get(message.from)?.connection; await peer?.setRemoteDescription(message.answer); await this.flushCandidates(message.from); this.connected(); return; }
    if (message.type === 'candidate') { const peer = this.peers.get(message.from); if (peer?.connection.remoteDescription) await peer.connection.addIceCandidate(message.candidate); else peer?.candidates.push(message.candidate); return; }
    if (message.type === 'participant-left' || message.type === 'peer-left') { this.removePeer(message.clientId); return; }
    if (message.type === 'hangup') this.endCall(false);
  }

  private async createPeer(remoteId: string, offerer: boolean) {
    if (this.peers.has(remoteId)) return;
    const connection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    const peer: Peer = { connection, candidates: [] }; this.peers.set(remoteId, peer);
    this.localStream()?.getTracks().forEach((track) => connection.addTrack(track, this.localStream()!));
    connection.ontrack = ({ streams }) => { if (streams[0]) { this.remoteStreams.update((items) => items.some((item) => item.id === remoteId) ? items : [...items, { id: remoteId, stream: streams[0] }]); } };
    connection.onicecandidate = ({ candidate }) => candidate && this.send({ type: 'candidate', to: remoteId, candidate });
    connection.onconnectionstatechange = () => {
      if (connection.connectionState === 'failed') {
        this.notice.set('Peer connection failed. Check that both devices are on the same network.');
      }
    };
    this.participantCount.set(this.peers.size);
    if (offerer) { const offer = await connection.createOffer(); await connection.setLocalDescription(offer); this.send({ type: 'offer', to: remoteId, offer }); }
  }

  private send(message: object) { if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(message)); else this.queuedMessages.push(message); }
  private flushMessages() { while (this.queuedMessages.length && this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(this.queuedMessages.shift())); }
  private async flushCandidates(remoteId: string) { const peer = this.peers.get(remoteId); for (const candidate of peer?.candidates.splice(0) || []) await peer?.connection.addIceCandidate(candidate); }
  private connected() { this.callState.set('live'); this.notice.set(`${this.peers.size} participant${this.peers.size === 1 ? '' : 's'} connected`); }
  private removePeer(id: string) { this.peers.get(id)?.connection.close(); this.peers.delete(id); this.remoteStreams.update((items) => items.filter((item) => item.id !== id)); this.participantCount.set(this.peers.size); this.notice.set('A participant left the call'); }
  // protected endCall(notify = true) { if (notify) this.send({ type: 'hangup' }); if (this.recording()) this.stopRecording(); this.peers.forEach((peer) => peer.connection.close()); this.peers.clear(); this.localStream()?.getTracks().forEach((track) => track.stop()); this.socket?.close(); this.socket = undefined; this.localStream.set(undefined); this.remoteStreams.set([]); this.participantCount.set(0); this.callState.set('idle'); this.notice.set('Choose video or audio, then share the room code'); }
  protected endCall(notify = true) { if (notify) this.send({ type: 'hangup' }); if (this.recording()) this.stopRecording(); this.peers.forEach((peer) => peer.connection.close()); this.peers.clear(); this.localStream()?.getTracks().forEach((track) => track.stop()); this.socket?.close(); this.socket = undefined; this.localStream.set(undefined); this.remoteStreams.set([]); this.participantCount.set(0); this.callState.set('idle'); this.roomCode.set(this.generateRoomCode()); this.notice.set('Choose video or audio, then share the room code'); }
  protected toggleMic() { this.micOn.update((value) => !value); this.localStream()?.getAudioTracks().forEach((track) => track.enabled = this.micOn()); }
  protected toggleCamera() { this.cameraOn.update((value) => !value); this.localStream()?.getVideoTracks().forEach((track) => track.enabled = this.cameraOn()); }
  protected startRecording() { const streams = [this.localStream(), ...this.remoteStreams().map((item) => item.stream)].filter(Boolean) as MediaStream[]; const tracks = streams.flatMap((stream) => stream.getTracks()); if (!tracks.length) return; const type = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm'; this.chunks = []; this.recorder = new MediaRecorder(new MediaStream(tracks), { mimeType: type }); this.recorder.ondataavailable = ({ data }) => data.size && this.chunks.push(data); this.recorder.onstop = () => { const reader = new FileReader(); reader.onload = () => { const items = [{ id: `${Date.now()}`, room: this.roomCode(), createdAt: new Date().toLocaleString(), url: String(reader.result) }, ...this.savedRecordings()]; this.savedRecordings.set(items); localStorage.setItem('aventiv-recordings', JSON.stringify(items)); }; reader.readAsDataURL(new Blob(this.chunks, { type })); }; this.recorder.start(); this.recording.set(true); }
  protected stopRecording() { if (this.recorder?.state === 'recording') this.recorder.stop(); this.recording.set(false); }
  protected clearRecordings() { this.savedRecordings.set([]); localStorage.removeItem('aventiv-recordings'); }
  protected generateRoomCode(): string {
    const adjectives = ['swift', 'calm', 'bold', 'bright', 'clear', 'smart', 'quick', 'safe', 'cool', 'sharp'];
    const nouns = ['hawk', 'river', 'storm', 'peak', 'field', 'bridge', 'stone', 'flame', 'sky', 'wave'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${adj}-${noun}-${num}`;
  }
  private loadRecordings(): Recording[] { try { return JSON.parse(localStorage.getItem('aventiv-recordings') || '[]'); } catch { return []; } }
}
