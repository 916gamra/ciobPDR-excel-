import { Logger } from '../logger/LoggerService.js';
import { PermissionError } from '../errors/ApplicationError.js';

export const PERMISSIONS = {
  // Stock Management
  'stock.view': ['ADMIN', 'RESPONSABLE', 'RESPONSABLE_MAGASIN', 'TECHNICIEN', 'MAGASINIER', 'VIEWER', 'OPERATEUR'],
  'stock.create': ['ADMIN', 'RESPONSABLE', 'RESPONSABLE_MAGASIN', 'MAGASINIER'],
  'stock.edit': ['ADMIN', 'RESPONSABLE', 'RESPONSABLE_MAGASIN', 'MAGASINIER'],
  'stock.delete': ['ADMIN'],
  'stock.export': ['ADMIN', 'RESPONSABLE', 'RESPONSABLE_MAGASIN', 'TECHNICIEN'],

  // Movement Management
  'movement.view': ['ADMIN', 'RESPONSABLE', 'RESPONSABLE_MAGASIN', 'TECHNICIEN', 'MAGASINIER', 'OPERATEUR', 'VIEWER'],
  'movement.create': ['ADMIN', 'RESPONSABLE', 'RESPONSABLE_MAGASIN', 'TECHNICIEN', 'MAGASINIER'],
  'movement.edit': ['ADMIN', 'RESPONSABLE', 'RESPONSABLE_MAGASIN'],
  'movement.delete': ['ADMIN'],

  // Machine Management
  'machine.view': ['ADMIN', 'RESPONSABLE', 'RESPONSABLE_MAGASIN', 'TECHNICIEN', 'VIEWER'],
  'machine.create': ['ADMIN', 'RESPONSABLE'],
  'machine.edit': ['ADMIN', 'RESPONSABLE'],
  'machine.delete': ['ADMIN'],

  // User Management
  'user.view': ['ADMIN'],
  'user.create': ['ADMIN'],
  'user.edit': ['ADMIN'],
  'user.delete': ['ADMIN'],

  // Reports & Analytics
  'report.view': ['ADMIN', 'RESPONSABLE', 'RESPONSABLE_MAGASIN', 'TECHNICIEN'],
  'report.export': ['ADMIN', 'RESPONSABLE', 'RESPONSABLE_MAGASIN'],

  // Settings & System
  'settings.view': ['ADMIN'],
  'settings.edit': ['ADMIN'],
  'settings.backup': ['ADMIN'],
  'settings.restore': ['ADMIN']
};

export class AuthorizationService {
  static hasPermission(user, permission) {
    if (!user) return false;
    const role = typeof user === 'string' ? user : (user.role || 'VIEWER');
    const allowedRoles = PERMISSIONS[permission];

    if (!allowedRoles) {
      Logger.warn(`[AuthorizationService] Unknown permission requested: ${permission}`);
      return false;
    }

    const authorized = allowedRoles.includes(role);
    if (!authorized) {
      Logger.debug(`[AuthorizationService] Permission denied for role ${role} on ${permission}`);
    }
    return authorized;
  }

  static requirePermission(permission) {
    return (user) => {
      if (!this.hasPermission(user, permission)) {
        throw new PermissionError(`Accès refusé pour la permission: ${permission}`, permission);
      }
    };
  }

  static canAccess(user, resource) {
    if (!resource) return false;
    const [domain, action] = resource.split('.');
    const matchingPerms = Object.keys(PERMISSIONS)
      .filter((p) => p.startsWith(domain))
      .filter((p) => !action || p.endsWith(action));
    return matchingPerms.some((p) => this.hasPermission(user, p));
  }

  static getAllPermissions(role) {
    if (!role) return [];
    return Object.entries(PERMISSIONS)
      .filter(([_, roles]) => roles.includes(role))
      .map(([permission]) => permission);
  }
}
