/**
 * IndexedDB Service for CIOB GMAO Light
 * High performance, high capacity 100% offline data store using browser native IndexedDB.
 */

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
          console.warn('[IndexedDB] getItem error:', e);
          resolve(fallback);
        }
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
        try {
          const tx = db.transaction('app_data', 'readwrite');
          const store = tx.objectStore('app_data');
          const req = store.put(value, key);
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        } catch (e) {
          console.warn('[IndexedDB] setItem error:', e);
          resolve(false);
        }
      });
    } catch (e) {
      console.warn('[IndexedDB] Fallback setItem error:', e);
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
          console.warn('[IndexedDB] removeItem error:', e);
          resolve(false);
        }
      });
    } catch (e) {
      console.warn('[IndexedDB] Fallback removeItem error:', e);
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
          console.warn('[IndexedDB] clear error:', e);
          resolve(false);
        }
      });
    } catch (e) {
      console.warn('[IndexedDB] Fallback clear error:', e);
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
            console.warn('[IndexedDB] setItemsBatch transaction error:', e);
            resolve(false);
          };
        } catch (e) {
          console.warn('[IndexedDB] setItemsBatch error:', e);
          resolve(false);
        }
      });
    } catch (e) {
      console.warn('[IndexedDB] Fallback setItemsBatch error:', e);
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
          console.warn('[IndexedDB] getItemsBatch error:', e);
          resolve({});
        }
      });
    } catch (e) {
      console.warn('[IndexedDB] Fallback getItemsBatch error:', e);
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
        console.warn('[IndexedDB] Error closing database:', e);
      }
    }
  },
};

