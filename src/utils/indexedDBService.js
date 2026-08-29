/**
 * IndexedDB Service for CIOB GMAO Light
 * High performance, high capacity 100% offline data store using browser native IndexedDB.
 */

const DB_NAME = 'CIOB_GMAO_LIGHT_DB';
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
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

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }
  return dbPromise;
}

export const indexedDBService = {
  async getItem(key, fallback = null) {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('app_data', 'readonly');
        const store = tx.objectStore('app_data');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result !== undefined ? req.result : fallback);
        req.onerror = () => resolve(fallback);
      });
    } catch (e) {
      console.warn('[IndexedDB] Fallback getItem error:', e);
      return fallback;
    }
  },

  async setItem(key, value) {
    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('app_data', 'readwrite');
        const store = tx.objectStore('app_data');
        const req = store.put(value, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      console.warn('[IndexedDB] Fallback setItem error:', e);
      return false;
    }
  }
};
