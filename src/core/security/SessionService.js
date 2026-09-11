import { Logger } from '../logger/LoggerService.js';

const SESSIONS_STORE_KEY = 'gmao_security_sessions_v1';
const SESSION_TOKEN_KEY = 'gmao_session_token_v1';
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout

export class SessionService {
  static _generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  static getDeviceId() {
    let deviceId = localStorage.getItem('gmao_device_id');
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('gmao_device_id', deviceId);
    }
    return deviceId;
  }

  static getStoredSessions() {
    try {
      const raw = localStorage.getItem(SESSIONS_STORE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveSessions(sessions) {
    try {
      localStorage.setItem(SESSIONS_STORE_KEY, JSON.stringify(sessions));
    } catch (e) {
      Logger.error('[SessionService] Failed to save sessions:', e);
    }
  }

  static async createSession(userId, userRole, extra = {}) {
    const sessionId = this._generateId();
    const token = 'tok_' + this._generateId().replace(/-/g, '') + '_' + Date.now();
    const now = new Date();

    const session = {
      id: sessionId,
      sessionId,
      userId,
      userRole,
      token,
      deviceId: this.getDeviceId(),
      createdAt: now.toISOString(),
      lastActivity: now.toISOString(),
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: 'offline',
      ...extra
    };

    const sessions = this.getStoredSessions().filter((s) => s.userId !== userId || s.deviceId !== session.deviceId);
    sessions.push(session);
    this.saveSessions(sessions);

    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    Logger.info(`[SessionService] Session created for user ${userId} [role: ${userRole}]`);
    return session;
  }

  static async validateSession(token = null) {
    const activeToken = token || sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (!activeToken) {
      return { isValid: false, error: 'No active session token found' };
    }

    const sessions = this.getStoredSessions();
    const session = sessions.find((s) => s.token === activeToken);

    if (!session) {
      return { isValid: false, error: 'Session not found or revoked' };
    }

    const now = Date.now();
    const lastActivityTime = new Date(session.lastActivity).getTime();

    // Inactivity timeout check (30 mins)
    if (now - lastActivityTime > INACTIVITY_TIMEOUT_MS) {
      await this.destroySession(session.id);
      return { isValid: false, error: 'Session expired due to inactivity' };
    }

    // Absolute expiration check
    if (now > new Date(session.expiresAt).getTime()) {
      await this.destroySession(session.id);
      return { isValid: false, error: 'Session reached maximum lifetime' };
    }

    // Update last activity timestamp
    session.lastActivity = new Date(now).toISOString();
    this.saveSessions(sessions);

    return { isValid: true, session };
  }

  static async destroySession(sessionIdOrToken) {
    if (!sessionIdOrToken) return;
    let sessions = this.getStoredSessions();
    sessions = sessions.filter((s) => s.id !== sessionIdOrToken && s.sessionId !== sessionIdOrToken && s.token !== sessionIdOrToken);
    this.saveSessions(sessions);

    const currentToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (currentToken === sessionIdOrToken) {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
    }
    Logger.info(`[SessionService] Session ${sessionIdOrToken} destroyed`);
  }

  static async destroyAllUserSessions(userId) {
    let sessions = this.getStoredSessions();
    sessions = sessions.filter((s) => s.userId !== userId);
    this.saveSessions(sessions);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    Logger.info(`[SessionService] All sessions destroyed for user ${userId}`);
  }

  static getActiveSession() {
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) return null;
    const sessions = this.getStoredSessions();
    return sessions.find((s) => s.token === token) || null;
  }
}
