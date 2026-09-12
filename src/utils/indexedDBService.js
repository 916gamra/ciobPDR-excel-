/**
 * IndexedDB Service for CIOB GMAO Light
 * High performance, high capacity 100% offline data store using browser native IndexedDB.
 */
import { Logger } from '../core/logger/LoggerService.js';

const DB_NAME = 'CIOB_GMAO_LIGHT_DB';
const DB_VERSION = 1;

let dbPromise = null;
let dbInstance = null;

function getDB() {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB non supporté par ce navigateur'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('app_data')) {
          db.createObjectStore('app_data');
        }
      };

      request.onsuccess = (event) => {
        dbInstance = event.target.result;
        resolve(dbInstance);
      };

      request.onerror = (event) => {
        dbInstance = null;
        reject(event.target.error);
      };
    });
  }

  return dbPromise;
}

export const indexedDBService = {
  async getItem(key, fallback = null) {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('app_data', 'readonly');
          const store = tx.objectStore('app_data');
          const req = store.get(key);
          req.onsuccess = () => resolve(req.result !== undefined ? req.result : fallback);
          req.onerror = () => resolve(fallback);
        } catch (e) {
          Logger.warn('getItem error:', e, 'IndexedDB');
          resolve(fallback);
        }
      });
    } catch (e) {
      Logger.warn('Fallback getItem error:', e, 'IndexedDB');
      return fallback;
    }
  },

  async setItem(key, value) {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('app_data', 'readwrite');
          const store = tx.objectStore('app_data');
          const req = store.put(value, key);
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        } catch (e) {
          Logger.warn('setItem error:', e, 'IndexedDB');
          resolve(false);
        }
      });
    } catch (e) {
      Logger.warn('Fallback setItem error:', e, 'IndexedDB');
      return false;
    }
  },

  async removeItem(key) {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('app_data', 'readwrite');
          const store = tx.objectStore('app_data');
          const req = store.delete(key);
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        } catch (e) {
          Logger.warn('removeItem error:', e, 'IndexedDB');
          resolve(false);
        }
      });
    } catch (e) {
      Logger.warn('Fallback removeItem error:', e, 'IndexedDB');
      return false;
    }
  },

  async clear() {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('app_data', 'readwrite');
          const store = tx.objectStore('app_data');
          const req = store.clear();
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        } catch (e) {
          Logger.warn('clear error:', e, 'IndexedDB');
          resolve(false);
        }
      });
    } catch (e) {
      Logger.warn('Fallback clear error:', e, 'IndexedDB');
      return false;
    }
  },

  /**
   * Batch save multiple items in a single readwrite transaction
   * @param {Object|Array<[string, any]>} entries - Key-value map or array of [key, val] tuples
   */
  async setItemsBatch(entries) {
    try {
      const db = await getDB();
      const entriesList = Array.isArray(entries)
        ? entries
        : Object.entries(entries);

      return new Promise((resolve) => {
        try {
          const tx = db.transaction('app_data', 'readwrite');
          const store = tx.objectStore('app_data');

          for (const [key, value] of entriesList) {
            store.put(value, key);
          }

          tx.oncomplete = () => resolve(true);
          tx.onerror = (e) => {
            Logger.warn('setItemsBatch transaction error:', e, 'IndexedDB');
            resolve(false);
          };
        } catch (e) {
          Logger.warn('setItemsBatch error:', e, 'IndexedDB');
          resolve(false);
        }
      });
    } catch (e) {
      Logger.warn('Fallback setItemsBatch error:', e, 'IndexedDB');
      return false;
    }
  },

  /**
   * Batch read multiple keys in a single readonly transaction
   * @param {string[]} keys - Array of keys to retrieve
   * @returns {Promise<Object>} Map of key -> value
   */
  async getItemsBatch(keys) {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('app_data', 'readonly');
          const store = tx.objectStore('app_data');
          const results = {};
          let completed = 0;

          if (!keys || keys.length === 0) {
            return resolve(results);
          }

          for (const key of keys) {
            const req = store.get(key);
            req.onsuccess = () => {
              if (req.result !== undefined) {
                results[key] = req.result;
              }
              completed++;
              if (completed === keys.length) {
                resolve(results);
              }
            };
            req.onerror = () => {
              completed++;
              if (completed === keys.length) {
                resolve(results);
              }
            };
          }
        } catch (e) {
          Logger.warn('getItemsBatch error:', e, 'IndexedDB');
          resolve({});
        }
      });
    } catch (e) {
      Logger.warn('Fallback getItemsBatch error:', e, 'IndexedDB');
      return {};
    }
  },

  /**
   * Close connection
   */
  async close() {
    if (dbInstance) {
      try {
        dbInstance.close();
        dbInstance = null;
        dbPromise = null;
      } catch (e) {
        Logger.warn('Error closing database:', e, 'IndexedDB');
      }
    }
  },
};

