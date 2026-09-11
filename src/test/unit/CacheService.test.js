import { describe, it, expect, beforeEach } from 'vitest';
import { CacheService } from '../../core/cache/CacheService.js';

describe('CacheService', () => {
  let cache;

  beforeEach(() => {
    cache = new CacheService({ ttl: 1000 });
    cache.clear();
  });

  it('should store and retrieve values correctly', () => {
    cache.set('key1', { data: 'test-value' });
    expect(cache.get('key1')).toEqual({ data: 'test-value' });
    expect(cache.has('key1')).toBe(true);
  });

  it('should return null for non-existent keys', () => {
    expect(cache.get('non_existent')).toBeNull();
    expect(cache.has('non_existent')).toBe(false);
  });

  it('should expire values after TTL', async () => {
    cache.set('expiringKey', 'val', 50); // 50ms
    expect(cache.get('expiringKey')).toBe('val');

    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(cache.get('expiringKey')).toBeNull();
  });

  it('should invalidate entries by tag', () => {
    cache.set('article_1', 'val1', 5000, ['articles', 'pdr']);
    cache.set('article_2', 'val2', 5000, ['articles']);
    cache.set('machine_1', 'val3', 5000, ['machines']);

    expect(cache.has('article_1')).toBe(true);
    expect(cache.has('machine_1')).toBe(true);

    cache.invalidateByTag('articles');
    expect(cache.has('article_1')).toBe(false);
    expect(cache.has('article_2')).toBe(false);
    expect(cache.has('machine_1')).toBe(true);
  });

  it('should track stats and hit rate', () => {
    cache.set('test_stats', 'val');
    cache.get('test_stats'); // hit
    cache.get('test_stats'); // hit
    cache.get('miss_key'); // miss

    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.entryCount).toBe(1);
    expect(stats.hitRate).toBe('66.7%');
  });
});
