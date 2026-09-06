import { Logger } from '../logger/LoggerService.js';

export class CacheService {
  static instance = null;

  constructor(options = {}) {
    if (CacheService.instance) {
      return CacheService.instance;
    }

    this.cache = new Map();
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes
    this.tags = new Map();

    CacheService.instance = this;
  }

  /**
   * Set cache value
   */
  set(key, value, ttl = this.ttl, tags = []) {
    const expiresAt = Date.now() + ttl;
    
    this.cache.set(key, {
      value,
      expiresAt,
      tags
    });

    // Register tags
    tags.forEach(tag => {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new Set());
      }
      this.tags.get(tag).add(key);
    });

    Logger.debug(`Cache SET: ${key}`);
  }

  /**
   * Get cache value
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      Logger.debug(`Cache MISS: ${key}`);
      return null;
    }

    // Check expiry
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      Logger.debug(`Cache EXPIRED: ${key}`);
      return null;
    }

    Logger.debug(`Cache HIT: ${key}`);
    return item.value;
  }

  /**
   * Delete cache value
   */
  delete(key) {
    const item = this.cache.get(key);
    if (item) {
      item.tags.forEach(tag => {
        this.tags.get(tag).delete(key);
      });
    }
    this.cache.delete(key);
    Logger.debug(`Cache DELETE: ${key}`);
  }

  /**
   * Invalidate by tag
   */
  invalidateByTag(tag) {
    const keys = this.tags.get(tag) || new Set();
    keys.forEach(key => this.delete(key));
    Logger.debug(`Cache INVALIDATE TAG: ${tag}`);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.tags.clear();
    Logger.debug('Cache CLEARED');
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      tags: this.tags.size,
      memory: JSON.stringify(Array.from(this.cache)).length
    };
  }
}
