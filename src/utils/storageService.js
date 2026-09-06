import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';

// Legacy keys for migration only
const OLD_SECURE_STORAGE_KEY = 'CIOB_GMAO_CLIENT_PERSISTENCE_SALT_KEY_987654321!';
const KEY_STORE_NAME = 'gmao_crypto_keys';
const KEY_ID = 'main_aes_gcm_key';

let memoryCache = {};
let webCryptoKey = null;

// Immediately pre-populate memoryCache from localStorage for instant synchronous access
try {
  if (typeof localStorage !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('gmao_')) {
        const item = localStorage.getItem(k);
        if (item && !item.startsWith('WC:') && !item.startsWith('U2FsdGVkX1')) {
          try {
            memoryCache[k] = JSON.parse(item);
          } catch {
            memoryCache[k] = item;
          }
        }
      }
    }
  }
} catch (e) {
  console.warn('[storageService] Initial localStorage read error:', e);
}

// Resilient IDB helper with strict timeout to prevent hangs in iframes
const idbKeyStore = {
  get(key) {
    return new Promise((resolve) => {
      try {
        if (typeof indexedDB === 'undefined') return resolve(null);
        const timer = setTimeout(() => resolve(null), 300);
        const request = indexedDB.open('GMAO_Crypto_Store', 1);
        request.onupgradeneeded = (e) => {
          try {
            e.target.result.createObjectStore(KEY_STORE_NAME);
          } catch {}
        };
        request.onsuccess = (e) => {
          clearTimeout(timer);
          try {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(KEY_STORE_NAME)) return resolve(null);
            const tx = db.transaction(KEY_STORE_NAME, 'readonly');
            const store = tx.objectStore(KEY_STORE_NAME);
            const getReq = store.get(key);
            getReq.onsuccess = () => resolve(getReq.result || null);
            getReq.onerror = () => resolve(null);
          } catch {
            resolve(null);
          }
        };
        request.onerror = () => {
          clearTimeout(timer);
          resolve(null);
        };
        request.onblocked = () => {
          clearTimeout(timer);
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });
  },
  set(key, val) {
    return new Promise((resolve) => {
      try {
        if (typeof indexedDB === 'undefined') return resolve();
        const timer = setTimeout(() => resolve(), 300);
        const request = indexedDB.open('GMAO_Crypto_Store', 1);
        request.onupgradeneeded = (e) => {
          try {
            e.target.result.createObjectStore(KEY_STORE_NAME);
          } catch {}
        };
        request.onsuccess = (e) => {
          clearTimeout(timer);
          try {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(KEY_STORE_NAME)) return resolve();
            const tx = db.transaction(KEY_STORE_NAME, 'readwrite');
            const store = tx.objectStore(KEY_STORE_NAME);
            store.put(val, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
          } catch {
            resolve();
          }
        };
        request.onerror = () => {
          clearTimeout(timer);
          resolve();
        };
        request.onblocked = () => {
          clearTimeout(timer);
          resolve();
        };
      } catch {
        resolve();
      }
    });
  },
};

const base64ToArrayBuffer = (base64) => {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary_string.charCodeAt(i);
  return bytes.buffer;
};

export const storageService = {
  /**
   * Safe asynchronous initialization for legacy migration without blocking UI
   */
  async init() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

      // 1. Safe WebCrypto key check if legacy WC: items exist
      let hasWcItems = false;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('gmao_')) {
          const val = localStorage.getItem(k);
          if (val && val.startsWith('WC:')) {
            hasWcItems = true;
            break;
          }
        }
      }

      if (hasWcItems && typeof crypto !== 'undefined' && crypto.subtle) {
        let key = await idbKeyStore.get(KEY_ID);
        if (key) {
          webCryptoKey = key;
        }
      }

      // 2. Migrate legacy encrypted items to clean JSON
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('gmao_')) {
          const item = localStorage.getItem(k);
          if (!item) continue;

          let decryptedObj = null;

          if (item.startsWith('WC:') && webCryptoKey) {
            try {
              const parts = item.split(':');
              const iv = base64ToArrayBuffer(parts[1]);
              const cipher = base64ToArrayBuffer(parts[2]);
              const decryptedBuffer = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(iv) },
                webCryptoKey,
                cipher
              );
              const dec = new TextDecoder();
              decryptedObj = JSON.parse(dec.decode(decryptedBuffer));
            } catch (e) {
              console.warn(`[storageService] WC migration skipped for ${k}:`, e);
            }
          } else if (item.startsWith('U2FsdGVkX1')) {
            try {
              const bytes = CryptoJS.AES.decrypt(item, OLD_SECURE_STORAGE_KEY);
              const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
              if (decryptedText) decryptedObj = JSON.parse(decryptedText);
            } catch (e) {
              console.warn(`[storageService] Legacy AES migration skipped for ${k}:`, e);
            }
          }

          // If decrypted successfully, update memory cache and save clean JSON in localStorage
          if (decryptedObj !== null) {
            memoryCache[k] = decryptedObj;
            try {
              localStorage.setItem(k, JSON.stringify(decryptedObj));
            } catch {}
          }
        }
      }
    } catch (e) {
      console.warn('[storageService] Safe background init completed:', e);
    }
  },

  /**
   * Synchronous retrieval with memory cache and localStorage fallback
   */
  getItem(key, fallback = null) {
    if (memoryCache[key] !== undefined) return memoryCache[key];
    try {
      if (typeof localStorage === 'undefined') return fallback;
      const item = localStorage.getItem(key);
      if (item === null || item === undefined) return fallback;

      // If it's a legacy encrypted token waiting for migration, return fallback safely
      if (typeof item === 'string' && (item.startsWith('WC:') || item.startsWith('U2FsdGVkX1'))) {
        return fallback;
      }

      try {
        const parsed = JSON.parse(item);
        memoryCache[key] = parsed;
        return parsed;
      } catch {
        memoryCache[key] = item;
        return item;
      }
    } catch {
      return fallback;
    }
  },

  /**
   * Synchronous storage with immediate persistence to localStorage and memoryCache
   */
  setItem(key, value) {
    memoryCache[key] = value;
    try {
      if (typeof localStorage !== 'undefined') {
        if (value === null || value === undefined) {
          localStorage.removeItem(key);
        } else if (typeof value === 'object') {
          localStorage.setItem(key, JSON.stringify(value));
        } else {
          localStorage.setItem(key, String(value));
        }
      }
    } catch (e) {
      console.warn(`[storageService] localStorage write error for ${key}:`, e);
    }
    return true;
  },

  /**
   * Remove item from memory cache and localStorage
   */
  removeItem(key) {
    delete memoryCache[key];
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {}
    return true;
  },

  /**
   * Convenience method to save updated stock articles
   */
  saveArticles(articles) {
    return this.setItem('gmao_raw_stock_v6', articles);
  },

  /**
   * Hash PIN code
   */
  hashPin(pin) {
    try {
      return bcrypt.hashSync(pin.trim(), 10);
    } catch {
      return CryptoJS.SHA256(pin.trim()).toString();
    }
  },

  /**
   * Verify input PIN against stored bcrypt or sha256 hash
   */
  verifyPin(inputPin, storedValue) {
    if (!storedValue) return false;
    const cleanInput = inputPin.trim();
    if (storedValue.startsWith('$2a$') || storedValue.startsWith('$2b$')) {
      try {
        return bcrypt.compareSync(cleanInput, storedValue);
      } catch {
        return false;
      }
    }
    if (storedValue.length === 64 && /^[0-9a-f]+$/i.test(storedValue)) {
      return CryptoJS.SHA256(cleanInput).toString() === storedValue;
    }
    const matchedPlain = cleanInput === storedValue.trim();
    if (matchedPlain) {
      const newHash = this.hashPin(cleanInput);
      this.setItem('gmao_admin_pin', newHash);
    }
    return matchedPlain;
  },
};
