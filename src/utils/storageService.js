/**
 * Safe LocalStorage Service for CIOB GMAO Light
 * Handles JSON parsing errors, quota limits, and persistence checks.
 */

export const storageService = {
  /**
   * Safe getItem from localStorage with fallback
   */
  getItem(key, fallback = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return fallback;
      return JSON.parse(item);
    } catch (err) {
      console.warn(`[storageService] Error reading key "${key}":`, err);
      return fallback;
    }
  },

  /**
   * Safe setItem to localStorage with QuotaExceededError handling
   */
  setItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
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
  }
};
