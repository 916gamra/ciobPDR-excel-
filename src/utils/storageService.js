import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';

// Old key for migration only
const OLD_SECURE_STORAGE_KEY = 'CIOB_GMAO_CLIENT_PERSISTENCE_SALT_KEY_987654321!';
const KEY_STORE_NAME = 'gmao_crypto_keys';
const KEY_ID = 'main_aes_gcm_key';

let memoryCache = {};
let webCryptoKey = null;

// Simple IDB helper for the CryptoKey
const idbKeyStore = {
  get(key) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GMAO_Crypto_Store', 1);
      request.onupgradeneeded = (e) => e.target.result.createObjectStore(KEY_STORE_NAME);
      request.onsuccess = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(KEY_STORE_NAME)) return resolve(null);
        const tx = db.transaction(KEY_STORE_NAME, 'readonly');
        const store = tx.objectStore(KEY_STORE_NAME);
        const getReq = store.get(key);
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror = () => reject(getReq.error);
      };
      request.onerror = () => reject(request.error);
    });
  },
  set(key, val) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GMAO_Crypto_Store', 1);
      request.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction(KEY_STORE_NAME, 'readwrite');
        const store = tx.objectStore(KEY_STORE_NAME);
        store.put(val, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
    });
  },
};

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

const base64ToArrayBuffer = (base64) => {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary_string.charCodeAt(i);
  return bytes.buffer;
};

// Queue for batch saving
let saveQueue = new Map();
let saveTimeout = null;

const processSaveQueue = async () => {
  if (!webCryptoKey || saveQueue.size === 0) return;
  const entries = Array.from(saveQueue.entries());
  saveQueue.clear();

  for (const [key, value] of entries) {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        const serialized = JSON.stringify(value);
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const cipherBuffer = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          webCryptoKey,
          enc.encode(serialized)
        );
        const payload = `WC:${arrayBufferToBase64(iv.buffer)}:${arrayBufferToBase64(cipherBuffer)}`;
        localStorage.setItem(key, payload);
      }
    } catch (e) {
      console.error(`[storageService] Failed to encrypt/save ${key}`, e);
    }
  }
};

export const storageService = {
  async init() {
    try {
      // 1. Get or generate WebCrypto non-extractable key
      let key = await idbKeyStore.get(KEY_ID);
      if (!key) {
        key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
          'encrypt',
          'decrypt',
        ]);
        await idbKeyStore.set(KEY_ID, key);
      }
      webCryptoKey = key;

      // 2. Read and decrypt everything into memory cache
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith('gmao_')) {
          const item = localStorage.getItem(k);
          if (!item) continue;

          let decryptedObj = null;

          if (item.startsWith('WC:')) {
            // New WebCrypto format
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
              console.warn(`[storageService] Failed WC decrypt for ${k}`, e);
            }
          } else if (item.startsWith('U2FsdGVkX1')) {
            // Old CryptoJS format (migration)
            try {
              const bytes = CryptoJS.AES.decrypt(item, OLD_SECURE_STORAGE_KEY);
              const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
              if (decryptedText) decryptedObj = JSON.parse(decryptedText);
              // Queue for re-encryption with WebCrypto
              saveQueue.set(k, decryptedObj);
            } catch (e) {
              console.warn(`[storageService] Failed legacy decrypt for ${k}`, e);
            }
          } else {
            // Plain text or old JSON fallback
            try {
              decryptedObj = JSON.parse(item);
              // Only migrate objects, simple strings (like PIN hash) can stay plain if intended
              if (
                typeof decryptedObj === 'object' &&
                decryptedObj !== null &&
                k !== 'gmao_admin_pin' &&
                k !== 'gmao_admin_role' &&
                k !== 'gmao_admin_open_mode'
              ) {
                saveQueue.set(k, decryptedObj);
              }
            } catch (e) {
              // Not JSON, just a string (like PIN hash)
              decryptedObj = item;
            }
          }

          if (decryptedObj !== null) {
            memoryCache[k] = decryptedObj;
          }
        }
      }

      // 3. Process any migrations
      if (saveQueue.size > 0) {
        processSaveQueue();
      }
    } catch (e) {
      console.error('[storageService] Initialization failed', e);
    }
  },

  getItem(key, fallback = null) {
    if (memoryCache[key] !== undefined) return memoryCache[key];
    // Sync fallback for keys that aren't cached (shouldn't happen for gmao_ keys if init ran)
    try {
      const item = localStorage.getItem(key);
      if (item) return JSON.parse(item);
    } catch (e) {}
    return fallback;
  },

  setItem(key, value) {
    memoryCache[key] = value;
    saveQueue.set(key, value);

    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      // Use requestIdleCallback if available for better performance
      if (window.requestIdleCallback) {
        window.requestIdleCallback(processSaveQueue);
      } else {
        processSaveQueue();
      }
    }, 100);
    return true;
  },

  removeItem(key) {
    delete memoryCache[key];
    saveQueue.set(key, null);
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(processSaveQueue, 100);
    return true;
  },

  hashPin(pin) {
    try {
      return bcrypt.hashSync(pin.trim(), 10);
    } catch (e) {
      return CryptoJS.SHA256(pin.trim()).toString();
    }
  },

  verifyPin(inputPin, storedValue) {
    if (!storedValue) return false;
    const cleanInput = inputPin.trim();
    if (storedValue.startsWith('$2a$') || storedValue.startsWith('$2b$')) {
      try {
        return bcrypt.compareSync(cleanInput, storedValue);
      } catch (e) {
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
