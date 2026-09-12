import { AutoBackupService } from '../core/backup/AutoBackupService.js';
import { Logger } from '../core/logger/LoggerService.js';

/**
 * Backup Service for GMAO Application & AutoBackup integration
 */
export class BackupService {
  static autoBackupTimer = null;

  static startAutoBackup(_getDataFn, _user) {
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer);
    }
    this.autoBackupTimer = setInterval(() => {
      try {
        AutoBackupService.createSnapshot('Sauvegarde automatique périodique', false);
      } catch (e) {
        Logger.warn('Auto backup interval failed', e);
      }
    }, 10 * 60 * 1000);
  }

  static stopAutoBackup() {
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer);
      this.autoBackupTimer = null;
    }
  }

  static getBackupsList() {
    return AutoBackupService.listSnapshots();
  }

  static restoreBackup(id) {
    return AutoBackupService.restoreSnapshot(id);
  }

  static exportBackup(_id) {
    return AutoBackupService.exportFullBackupJSON();
  }

  static createBackup(reason = 'Sauvegarde manuelle') {
    return AutoBackupService.createSnapshot(reason, true);
  }
}

export const backupService = BackupService;
export default BackupService;
