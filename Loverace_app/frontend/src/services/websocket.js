/**
 * WebSocket client for the realtime_gateway.
 * Wraps the raw WebSocket with reconnection, event dispatch, and heartbeat.
 */

import { isDummy } from './dummyData';

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8001';

class LoveraceWS {
  constructor() {
    this.ws = null;
    this.listeners = new Map(); // eventType → Set<callback>
    this.token = null;
    this.reconnectTimer = null;
    this.pingTimer = null;
    this.reconnectDelay = 2000;
    this.connected = false;
    this.intentionalClose = false;
  }

  connect(token) {
    if (isDummy()) {
      this.connected = true;
      return;
    }
    this.token = token;
    this.intentionalClose = false;
    this._open();
  }

  _open() {
    clearTimeout(this.reconnectTimer);
    try {
      this.ws = new WebSocket(`${WS_BASE}/ws?token=${this.token}`);
      this.ws.onopen = () => {
        this.connected = true;
        this.reconnectDelay = 2000;
        this._emit('connected', {});
        this._startPing();
      };
      this.ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          this._emit(msg.type, msg.payload ?? msg);
        } catch {
          // ignore malformed
        }
      };
      this.ws.onerror = () => { /* handled in onclose */ };
      this.ws.onclose = () => {
        this.connected = false;
        clearInterval(this.pingTimer);
        this._emit('disconnected', {});
        if (!this.intentionalClose) {
          this.reconnectTimer = setTimeout(() => this._open(), this.reconnectDelay);
          this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000);
        }
      };
    } catch (err) {
      console.warn('WS open failed', err);
    }
  }

  disconnect() {
    this.intentionalClose = true;
    clearTimeout(this.reconnectTimer);
    clearInterval(this.pingTimer);
    this.ws?.close();
    this.connected = false;
  }

  send(type, payload = {}) {
    if (isDummy()) return;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  on(eventType, cb) {
    if (!this.listeners.has(eventType)) this.listeners.set(eventType, new Set());
    this.listeners.get(eventType).add(cb);
    return () => this.listeners.get(eventType)?.delete(cb);
  }

  off(eventType, cb) {
    this.listeners.get(eventType)?.delete(cb);
  }

  _emit(type, payload) {
    this.listeners.get(type)?.forEach((cb) => cb(payload));
    this.listeners.get('*')?.forEach((cb) => cb({ type, payload }));
  }

  _startPing() {
    clearInterval(this.pingTimer);
    this.pingTimer = setInterval(() => {
      this.send('ping', {});
    }, 25000);
  }
}

// Singleton
export const ws = new LoveraceWS();
export default ws;
