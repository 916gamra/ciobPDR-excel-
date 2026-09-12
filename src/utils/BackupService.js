import LZString from 'lz-string';
import { Logger } from '../core/logger/LoggerService';

/**
 * خدمة النسخ الاحتياطية
 */
export class BackupService {
  constructor() {
    this.backupInterval = 60 * 60 * 1000; // كل ساعة
    this.maxBackups = 10; // الاحتفاظ بآخر 10 نسخ
    this._dbPromise = null; // cache للـ DB connection
    this._dbInstance = null;
  }

  /**
   * الحصول على connection إلى IndexedDB
   */
  async getDB() {
    if (this._dbInstance) {
      return this._dbInstance;
    }

    if (!this._dbPromise) {
      this._dbPromise = new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          reject(new Error('IndexedDB غير مدعوم في هذا المتصفح'));
          return;
        }

        const request = window.indexedDB.open('GMAO_Backups', 1);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('backups')) {
            db.createObjectStore('backups', { keyPath: 'id' });
          }
        };

        request.onsuccess = (event) => {
          this._dbInstance = event.target.result;
          resolve(this._dbInstance);
        };

        request.onerror = (event) => {
          this._dbInstance = null;
          reject(event.target.error);
        };
      });
    }

    try {
      this._dbInstance = await this._dbPromise;
      return this._dbInstance;
    } catch (error) {
      this._dbInstance = null;
      this._dbPromise = null;
      throw error;
    }
  }

  /**
   * إنشاء نسخة احتياطية
   */
  async createBackup(data, userId = 'system') {
    try {
      const dataSize = JSON.stringify(data).length;
      const isLargeData = dataSize > 500000; // 500KB

      const backup = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        userId,
        data: isLargeData ? data : LZString.compressToBase64(JSON.stringify(data)),
        size: dataSize,
        version: '1.0',
        isCompressed: !isLargeData,
      };

      // حفظ في IndexedDB (دائماً)
      await this.saveBackupToIndexedDB(backup);

      // حفظ في LocalStorage فقط إذا كانت البيانات صغيرة
      if (!isLargeData) {
        await this.saveBackupToLocalStorage(backup);
      } else {
        Logger.info('[BackupService] Skipping LocalStorage backup for large data (size:', dataSize, 'bytes)');
      }

      Logger.info('[BackupService] Sauvegarde créée avec succès');
      return backup;
    } catch (error) {
      Logger.error('[BackupService] Erreur lors de la sauvegarde:', error);
      throw error;
    }
  }

  /**
   * حفظ في IndexedDB
   */
  async saveBackupToIndexedDB(backup) {
    const db = await this.getDB();
    const tx = db.transaction(['backups'], 'readwrite');
    const store = tx.objectStore('backups');

    return new Promise((resolve, reject) => {
      const request = store.add(backup);
      request.onsuccess = () => {
        // حذف النسخ القديمة
        this.cleanOldBackups(store);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * حفظ في LocalStorage (نسخة مضغوطة)
   */
  async saveBackupToLocalStorage(backup) {
    try {
      // ضغط البيانات باستخدام LZ-string إذا لم تكن مضغوطة بالفعل
      const compressed = backup.isCompressed
        ? JSON.stringify(backup)
        : LZString.compressToBase64(JSON.stringify(backup));
      localStorage.setItem(`backup_${backup.id}`, compressed);
    } catch (error) {
      Logger.warn('لا يمكن حفظ النسخة في LocalStorage:', error, 'BackupService');
    }
  }

  /**
   * حذف النسخ القديمة
   */
  async cleanOldBackups(store) {
    return new Promise((resolve) => {
      try {
        const request = store.getAll();

        request.onsuccess = () => {
          try {
            const backups = request.result || [];
            const sortedBackups = backups
              .sort((a, b) => {
                try {
                  return new Date(b.timestamp) - new Date(a.timestamp);
                } catch {
                  return 0;
                }
              })
              .slice(this.maxBackups);

            // حذف النسخ القديمة
            const deletePromises = sortedBackups.map((backup) => {
              return new Promise((delResolve) => {
                try {
                  const delRequest = store.delete(backup.id);
                  delRequest.onsuccess = () => delResolve();
                  delRequest.onerror = () => delResolve();
                } catch {
                  delResolve();
                }
              });
            });

            Promise.all(deletePromises).then(() => resolve());
          } catch (e) {
            Logger.error('Error cleaning backups:', e, 'BackupService');
            resolve();
          }
        };

        request.onerror = () => resolve();
      } catch (e) {
        Logger.error('Error in cleanOldBackups:', e, 'BackupService');
        resolve();
      }
    });
  }

  /**
   * استرجاع نسخة احتياطية
   */
  async restoreBackup(backupId) {
    try {
      const db = await this.getDB();
      const tx = db.transaction(['backups'], 'readonly');
      const store = tx.objectStore('backups');

      return new Promise((resolve, reject) => {
        const request = store.get(backupId);
        request.onsuccess = () => {
          if (request.result) {
            let resData = request.result.data;
            if (request.result.isCompressed && typeof resData === 'string') {
              try {
                resData = JSON.parse(LZString.decompressFromBase64(resData));
              } catch (e) {
                Logger.warn('Decompress error', e, 'BackupService');
              }
            }
            resolve(resData);
          } else {
            reject(new Error('النسخة الاحتياطية غير موجودة'));
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      Logger.error('خطأ في استرجاع النسخة الاحتياطية:', error, 'BackupService');
      throw error;
    }
  }

  /**
   * الحصول على قائمة النسخ الاحتياطية
   */
  async getBackupsList() {
    try {
      const db = await this.getDB();
      const tx = db.transaction(['backups'], 'readonly');
      const store = tx.objectStore('backups');

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const backups = request.result
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map((b) => ({
              id: b.id,
              timestamp: b.timestamp,
              userId: b.userId,
              size: b.size,
              version: b.version,
            }));
          resolve(backups);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      Logger.error('خطأ في جلب قائمة النسخ:', error, 'BackupService');
      return [];
    }
  }

  /**
   * تصدير نسخة احتياطية
   */
  async exportBackup(backupId) {
    try {
      const backup = await this.restoreBackup(backupId);
      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${backupId}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      Logger.error('خطأ في تصدير النسخة:', error, 'BackupService');
      throw error;
    }
  }

  /**
   * بدء النسخ الاحتياطية التلقائية
   */
  startAutoBackup(dataFn, userId = 'system') {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      const data = dataFn();
      this.createBackup(data, userId).catch((error) => {
        Logger.error('فشل النسخ الاحتياطية التلقائية:', error, 'BackupService');
      });
    }, this.backupInterval);
  }

  stopAutoBackup() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}

export const backupService = new BackupService();
