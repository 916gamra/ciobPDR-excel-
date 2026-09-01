import LZString from 'lz-string';

/**
 * خدمة النسخ الاحتياطية
 */
export class BackupService {
  constructor() {
    this.backupInterval = 60 * 60 * 1000; // كل ساعة
    this.maxBackups = 10; // الاحتفاظ بآخر 10 نسخ
  }

  /**
   * إنشاء نسخة احتياطية
   */
  async createBackup(data, userId = 'system') {
    try {
      const backup = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        userId,
        data,
        size: JSON.stringify(data).length,
        version: '1.0',
      };

      // حفظ في IndexedDB
      await this.saveBackupToIndexedDB(backup);

      // حفظ في LocalStorage (نسخة مضغوطة)
      await this.saveBackupToLocalStorage(backup);

      console.log('تم إنشاء نسخة احتياطية بنجاح');
      return backup;
    } catch (error) {
      console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
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
      // ضغط البيانات باستخدام LZ-string
      const compressed = LZString.compressToBase64(JSON.stringify(backup));
      localStorage.setItem(`backup_${backup.id}`, compressed);
    } catch (error) {
      console.warn('لا يمكن حفظ النسخة في LocalStorage:', error);
    }
  }

  /**
   * حذف النسخ القديمة
   */
  async cleanOldBackups(store) {
    const request = store.getAll();
    request.onsuccess = () => {
      const backups = request.result
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(this.maxBackups);

      backups.forEach((backup) => {
        store.delete(backup.id);
      });
    };
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
            resolve(request.result.data);
          } else {
            reject(new Error('النسخة الاحتياطية غير موجودة'));
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('خطأ في استرجاع النسخة الاحتياطية:', error);
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
      console.error('خطأ في جلب قائمة النسخ:', error);
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
      console.error('خطأ في تصدير النسخة:', error);
      throw error;
    }
  }

  /**
   * الحصول على قاعدة البيانات
   */
  async getDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GMAO_Backups', 1);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('backups')) {
          db.createObjectStore('backups', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * بدء النسخ الاحتياطية التلقائية
   */
  startAutoBackup(dataFn, userId = 'system') {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      const data = dataFn();
      this.createBackup(data, userId).catch((error) => {
        console.error('فشل النسخ الاحتياطية التلقائية:', error);
      });
    }, this.backupInterval);
  }

  stopAutoBackup() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}

export const backupService = new BackupService();
