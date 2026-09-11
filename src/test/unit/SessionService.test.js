import { describe, it, expect, beforeEach } from 'vitest';
import { SessionService } from '../../core/security/SessionService.js';

describe('SessionService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should create a valid session with token and device ID', async () => {
    const session = await SessionService.createSession('usr-100', 'ADMIN');
    expect(session.userId).toBe('usr-100');
    expect(session.userRole).toBe('ADMIN');
    expect(session.token).toBeDefined();
    expect(session.deviceId).toBeDefined();

    const activeSession = SessionService.getActiveSession();
    expect(activeSession).toBeDefined();
    expect(activeSession.userId).toBe('usr-100');
  });

  it('should validate an active session successfully', async () => {
    const session = await SessionService.createSession('usr-200', 'TECHNICIEN');
    const validation = await SessionService.validateSession(session.token);

    expect(validation.isValid).toBe(true);
    expect(validation.session.userId).toBe('usr-200');
  });

  it('should invalidate session upon destruction', async () => {
    const session = await SessionService.createSession('usr-300', 'RESPONSABLE');
    await SessionService.destroySession(session.id);

    const validation = await SessionService.validateSession(session.token);
    expect(validation.isValid).toBe(false);
  });
});
