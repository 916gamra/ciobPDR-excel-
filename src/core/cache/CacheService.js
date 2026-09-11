import { Logger } from '../logger/LoggerService.js';

export class CacheService {
  static instance = null;

  constructor(options = {}) {
    if (CacheService.instance) {
      return CacheService.instance;
    }

    this.cache = new Map();
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.tags = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      invalidations: 0
    };

    CacheService.instance = this;
  }

  /**
   * Set cache value with TTL and optional tags
   */
  set(key, value, ttl = this.ttl, tags = []) {
    const expiresAt = Date.now() + ttl;
    let size;
    try {
      size = JSON.stringify(value)?.length || 0;
    } catch {
      size = 64;
    }

    this.cache.set(key, {
      value,
      expiresAt,
      tags,
      createdAt: Date.now(),
      size
    });

    // Register tags
    tags.forEach((tag) => {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new Set());
      }
      this.tags.get(tag).add(key);
    });

    this.stats.sets++;
    Logger.debug(`[CacheService] SET: ${key}`, { ttl, tags });
  }

  /**
   * Get cache value
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      Logger.debug(`[CacheService] MISS: ${key}`);
      return null;
    }

    // Check expiry
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      this.stats.misses++;
      Logger.debug(`[CacheService] EXPIRED: ${key}`);
      return null;
    }

    this.stats.hits++;
    Logger.debug(`[CacheService] HIT: ${key}`);
    return item.value;
  }

  /**
   * Check if cache has non-expired key
   */
  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Delete cache value
   */
  delete(key) {
    const item = this.cache.get(key);
    if (item) {
      item.tags.forEach((tag) => {
        this.tags.get(tag)?.delete(key);
      });
    }
    this.cache.delete(key);
    this.stats.deletes++;
    Logger.debug(`[CacheService] DELETE: ${key}`);
  }

  /**
   * Invalidate by tag
   */
  invalidateByTag(tag) {
    const keys = this.tags.get(tag) || new Set();
    const count = keys.size;
    keys.forEach((key) => this.delete(key));
    this.tags.delete(tag);
    this.stats.invalidations++;
    Logger.debug(`[CacheService] INVALIDATE TAG: ${tag} (${count} keys)`);
  }

  /**
   * Invalidate by regex pattern
   */
  invalidatePattern(pattern) {
    let count = 0;
    for (const [key] of this.cache) {
      if (pattern.test(key)) {
        this.delete(key);
        count++;
      }
    }
    this.stats.invalidations++;
    Logger.debug(`[CacheService] INVALIDATE PATTERN: ${pattern} (${count} keys)`);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.tags.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      invalidations: 0
    };
    Logger.debug('[CacheService] CLEARED');
  }

  /**
   * Get cache stats
   */
  getStats() {
    const totalLookups = this.stats.hits + this.stats.misses;
    const hitRate = totalLookups > 0 ? ((this.stats.hits / totalLookups) * 100).toFixed(1) + '%' : '0%';

    let totalSizeBytes = 0;
    for (const item of this.cache.values()) {
      totalSizeBytes += item.size || 0;
    }

    return {
      ...this.stats,
      hitRate,
      entryCount: this.cache.size,
      tagCount: this.tags.size,
      sizeKB: (totalSizeBytes / 1024).toFixed(2)
    };
  }
}
