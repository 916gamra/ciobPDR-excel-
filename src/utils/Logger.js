/**
 * نظام Logging محسّن
 */
export class Logger {
  constructor(namespace = 'GMAO') {
    this.namespace = namespace;
    this.logs = [];
    this.maxLogs = 1000;
  }

  log(level, message, data = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      namespace: this.namespace,
      message,
      data,
      stack: new Error().stack,
    };

    this.logs.push(entry);

    // الاحتفاظ بآخر 1000 سجل فقط
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // الطباعة حسب المستوى
    const style =
      {
        ERROR: 'color: red; font-weight: bold;',
        WARN: 'color: orange; font-weight: bold;',
        INFO: 'color: blue;',
        DEBUG: 'color: gray;',
      }[level] || '';

    console[level.toLowerCase()](`%c[${this.namespace}] ${message}`, style, data);

    // حفظ في IndexedDB
    if (level === 'ERROR' || level === 'WARN') {
      this.saveToIndexedDB(entry);
    }
  }

  info(message, data) {
    this.log('INFO', message, data);
  }
  warn(message, data) {
    this.log('WARN', message, data);
  }
  error(message, data) {
    this.log('ERROR', message, data);
  }
  debug(message, data) {
    this.log('DEBUG', message, data);
  }

  async saveToIndexedDB(entry) {
    try {
      const db = await this.getDB();
      const tx = db.transaction(['logs'], 'readwrite');
      const store = tx.objectStore('logs');
      store.add(entry);
    } catch (error) {
      console.error('خطأ في حفظ السجل:', error);
    }
  }

  async getDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GMAO_Logs', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('logs')) {
          db.createObjectStore('logs', { keyPath: 'timestamp' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger('GMAO');
