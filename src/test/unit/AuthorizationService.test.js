import { describe, it, expect } from 'vitest';
import { AuthorizationService, PERMISSIONS } from '../../core/security/AuthorizationService.js';

describe('AuthorizationService', () => {
  const adminUser = { id: 'usr-1', role: 'ADMIN' };
  const respUser = { id: 'usr-2', role: 'RESPONSABLE' };
  const techUser = { id: 'usr-3', role: 'TECHNICIEN' };
  const viewerUser = { id: 'usr-4', role: 'VIEWER' };

  describe('hasPermission', () => {
    it('should grant ADMIN access to all critical operations', () => {
      expect(AuthorizationService.hasPermission(adminUser, 'stock.delete')).toBe(true);
      expect(AuthorizationService.hasPermission(adminUser, 'user.create')).toBe(true);
      expect(AuthorizationService.hasPermission(adminUser, 'settings.restore')).toBe(true);
    });

    it('should deny non-admin users from destructive operations like stock.delete', () => {
      expect(AuthorizationService.hasPermission(respUser, 'stock.delete')).toBe(false);
      expect(AuthorizationService.hasPermission(techUser, 'stock.delete')).toBe(false);
      expect(AuthorizationService.hasPermission(viewerUser, 'stock.delete')).toBe(false);
    });

    it('should allow RESPONSABLE and TECHNICIEN to create movements', () => {
      expect(AuthorizationService.hasPermission(respUser, 'movement.create')).toBe(true);
      expect(AuthorizationService.hasPermission(techUser, 'movement.create')).toBe(true);
    });

    it('should return false for invalid or null user', () => {
      expect(AuthorizationService.hasPermission(null, 'stock.view')).toBe(false);
      expect(AuthorizationService.hasPermission(undefined, 'stock.view')).toBe(false);
    });

    it('should return false for unknown permission names', () => {
      expect(AuthorizationService.hasPermission(adminUser, 'non_existent_perm')).toBe(false);
    });
  });

  describe('canAccess & getAllPermissions', () => {
    it('should evaluate resource domain access correctly', () => {
      expect(AuthorizationService.canAccess(techUser, 'movement.view')).toBe(true);
      expect(AuthorizationService.canAccess(viewerUser, 'stock.view')).toBe(true);
      expect(AuthorizationService.canAccess(viewerUser, 'settings.backup')).toBe(false);
    });

    it('should return complete list of permissions for role', () => {
      const adminPerms = AuthorizationService.getAllPermissions('ADMIN');
      expect(adminPerms.length).toBe(Object.keys(PERMISSIONS).length);
      expect(adminPerms).toContain('stock.delete');
      expect(adminPerms).toContain('user.delete');

      const viewerPerms = AuthorizationService.getAllPermissions('VIEWER');
      expect(viewerPerms).toContain('stock.view');
      expect(viewerPerms).not.toContain('stock.delete');
    });
  });
});
