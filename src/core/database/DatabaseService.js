import { Logger } from '../logger/LoggerService.js';

const DB_NAME = 'CIOB_GMAO_ENTERPRISE_DB';
const DB_VERSION = 1;

export class DatabaseService {
  static instance = null;

  constructor() {
    if (DatabaseService.instance) {
      return DatabaseService.instance;
    }
    this.dbPromise = this.initDB();
    DatabaseService.instance = this;
  }

  initDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB non supporté.'));
        return;
      }
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Collections
        if (!db.objectStoreNames.contains('spare_parts')) {
          db.createObjectStore('spare_parts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('movements')) {
          db.createObjectStore('movements', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('machines')) {
          db.createObjectStore('machines', { keyPath: 'id' });
        }
        // Legacy Key-Value store for compatibility
        if (!db.objectStoreNames.contains('app_data')) {
          db.createObjectStore('app_data');
        }
      };

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async getStore(storeName, mode = 'readonly') {
    const db = await this.dbPromise;
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  async getAll(storeName) {
    try {
      const store = await this.getStore(storeName, 'readonly');
      return new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      Logger.error(`DB Get All Error [${storeName}]:`, error);
      throw error;
    }
  }

  async getById(storeName, id) {
    try {
      const store = await this.getStore(storeName, 'readonly');
      return new Promise((resolve, reject) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      Logger.error(`DB Get By Id Error [${storeName}]:`, error);
      throw error;
    }
  }

  async save(storeName, item) {
    try {
      if (!item || typeof item !== 'object') {
        throw new Error(`Cannot save invalid item to ${storeName}`);
      }
      const record = { ...item };
      // Ensure record has a valid, non-null, non-undefined ID for stores indexed by 'id'
      if (record.id === undefined || record.id === null || record.id === '') {
        record.id = record.id_machine_registered || record.ref || record.code_bon || (
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${storeName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        );
      }
      const store = await this.getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const req = store.put(record);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      Logger.error(`DB Save Error [${storeName}]:`, error);
      throw error;
    }
  }

  async delete(storeName, id) {
    try {
      const store = await this.getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      Logger.error(`DB Delete Error [${storeName}]:`, error);
      throw error;
    }
  }

  /**
   * Execute atomic transaction across multiple stores
   */
  async transaction(storeNames, mode = 'readwrite', callback) {
    try {
      const db = await this.dbPromise;
      const names = Array.isArray(storeNames) ? storeNames : [storeNames];
      const tx = db.transaction(names, mode);

      return new Promise((resolve, reject) => {
        let callbackResult;
        tx.oncomplete = () => resolve(callbackResult);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(new Error('Transaction aborted'));

        try {
          const stores = {};
          names.forEach((name) => {
            stores[name] = tx.objectStore(name);
          });
          callbackResult = callback(stores, tx);
        } catch (err) {
          tx.abort();
          reject(err);
        }
      });
    } catch (error) {
      Logger.error('Database transaction error:', error);
      throw error;
    }
  }
}
