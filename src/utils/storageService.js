import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';

/**
 * Secure persistent encryption key for client-side local storage.
 * In a real-world multi-user system, this could be derived from credentials, 
 * but for this offline twin system, we use a robust hardcoded salt key 
 * to protect LocalStorage inspection by users on shared stations.
 */
const SECURE_STORAGE_KEY = 'CIOB_GMAO_CLIENT_PERSISTENCE_SALT_KEY_987654321!';

export const storageService = {
  /**
   * Safe getItem from localStorage with AES decryption and automatic fallback
   */
  getItem(key, fallback = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return fallback;

      // 1. Try to decrypt assuming it was encrypted with CryptoJS AES
      // Decrypted string should look like a valid JSON
      if (item.startsWith('U2FsdGVkX1')) { // standard CryptoJS salt prefix
        try {
          const bytes = CryptoJS.AES.decrypt(item, SECURE_STORAGE_KEY);
          const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
          if (decryptedText) {
            return JSON.parse(decryptedText);
          }
        } catch (decryptErr) {
          console.warn(`[storageService] Decryption failed for key "${key}", attempting fallback parsing:`, decryptErr);
        }
      }

      // 2. Fallback: Parse as regular JSON if decryption failed or wasn't encrypted
      return JSON.parse(item);
    } catch (err) {
      console.warn(`[storageService] Error parsing key "${key}":`, err);
      return fallback;
    }
  },

  /**
   * Safe setItem to localStorage with AES encryption and QuotaExceededError handling
   */
  setItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      // Encrypt the string
      const encrypted = CryptoJS.AES.encrypt(serialized, SECURE_STORAGE_KEY).toString();
      localStorage.setItem(key, encrypted);
      return true;
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        console.error(`[storageService] LocalStorage quota exceeded when writing key "${key}"`);
      } else {
        console.error(`[storageService] Error writing key "${key}":`, err);
      }
      return false;
    }
  },

  /**
   * Safe removeItem
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.warn(`[storageService] Error removing key "${key}":`, err);
      return false;
    }
  },

  /**
   * Secure bcrypt-based PIN hashing
   */
  hashPin(pin) {
    try {
      return bcrypt.hashSync(pin.trim(), 10);
    } catch (e) {
      console.error("[storageService] Hashing failed:", e);
      // Fallback to SHA256 if bcrypt fails
      return CryptoJS.SHA256(pin.trim()).toString();
    }
  },

  /**
   * Secure verification of entered PIN against stored hash (or old Base64)
   */
  verifyPin(inputPin, storedValue) {
    if (!storedValue) return false;
    const cleanInput = inputPin.trim();

    // Check if stored value is a bcrypt hash
    const isBcrypt = storedValue.startsWith('$2a$') || storedValue.startsWith('$2b$');

    if (isBcrypt) {
      try {
        return bcrypt.compareSync(cleanInput, storedValue);
      } catch (e) {
        console.error("[storageService] Bcrypt verification failed:", e);
        return false;
      }
    }

    // Check if stored value is old SHA-256 fallback hash
    if (storedValue.length === 64 && /^[0-9a-f]+$/i.test(storedValue)) {
      return CryptoJS.SHA256(cleanInput).toString() === storedValue;
    }

    // Check if stored value is old Base64 format and migrate if matched
    try {
      const decoded = atob(storedValue);
      if (decoded.startsWith('CIOB_GMAO_SECURE_SALT:')) {
        const pinText = decoded.replace('CIOB_GMAO_SECURE_SALT:', '');
        const matched = (cleanInput === pinText);
        if (matched) {
          // Automatically migrate to secure bcrypt hash
          const newHash = this.hashPin(cleanInput);
          localStorage.setItem('gmao_admin_pin', newHash);
        }
        return matched;
      }
    } catch (e) {}

    // Ultimate fallback if plain text was stored
    const matchedPlain = (cleanInput === storedValue.trim());
    if (matchedPlain) {
      // Migrate
      const newHash = this.hashPin(cleanInput);
      localStorage.setItem('gmao_admin_pin', newHash);
    }
    return matchedPlain;
  }
};
