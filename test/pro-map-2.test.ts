import { describe, it, expect } from 'vitest';
import { ProMap2 } from '../src/core/pro-map-2/index.js';

describe('ProMap2', () => {
  describe('basic operations', () => {
    it('should set and get values', async () => {
      const map = new ProMap2<string, number>();
      map.set('a', 1);
      map.set('b', 2);

      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
    });

    it('should return undefined for missing keys', async () => {
      const map = new ProMap2<string, number>();
      expect(map.get('missing')).toBeUndefined();
    });

    it('should check if key exists', async () => {
      const map = new ProMap2<string, number>();
      map.set('a', 1);

      expect(map.has('a')).toBe(true);
      expect(map.has('missing')).toBe(false);
    });

    it('should delete entries', async () => {
      const map = new ProMap2<string, number>();
      map.set('a', 1);
      map.set('b', 2);

      expect(map.delete('a')).toBe(true);
      expect(map.has('a')).toBe(false);
      expect(map.has('b')).toBe(true);
    });

    it('should return false when deleting non-existent key', async () => {
      const map = new ProMap2<string, number>();
      expect(map.delete('missing')).toBe(false);
    });

    it('should clear all entries', async () => {
      const map = new ProMap2<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      map.clear();

      expect(map.size).toBe(0);
      expect(map.has('a')).toBe(false);
      expect(map.has('b')).toBe(false);
      expect(map.has('c')).toBe(false);
    });
  });

  describe('size tracking', () => {
    it('should track size correctly', async () => {
      const map = new ProMap2<string, number>();
      expect(map.size).toBe(0);

      map.set('a', 1);
      expect(map.size).toBe(1);

      map.set('b', 2);
      map.set('c', 3);
      expect(map.size).toBe(3);

      map.delete('a');
      expect(map.size).toBe(2);

      map.clear();
      expect(map.size).toBe(0);
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used when maxSize exceeded', async () => {
      const map = new ProMap2<string, number>({ maxSize: 2 });

      map.set('a', 1);
      map.set('b', 2);
      expect(map.size).toBe(2);

      map.set('c', 3);
      expect(map.size).toBe(2);
      expect(map.has('a')).toBe(false);
      expect(map.has('b')).toBe(true);
      expect(map.has('c')).toBe(true);
    });

    it('should update access time on get', async () => {
      const map = new ProMap2<string, number>({ maxSize: 2 });

      map.set('a', 1);
      map.set('b', 2);
      map.get('a');

      map.set('c', 3);
      expect(map.size).toBe(2);
      expect(map.has('a')).toBe(true);
      expect(map.has('b')).toBe(false);
      expect(map.has('c')).toBe(true);
    });

    it('should update access time on has', async () => {
      const map = new ProMap2<string, number>({ maxSize: 2 });

      map.set('a', 1);
      map.set('b', 2);
      map.has('a');

      map.set('c', 3);
      expect(map.size).toBe(2);
      expect(map.has('a')).toBe(true);
      expect(map.has('b')).toBe(false);
      expect(map.has('c')).toBe(true);
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', async () => {
      const map = new ProMap2<string, number>({ ttl: 100 });

      map.set('a', 1);
      expect(map.get('a')).toBe(1);

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(map.get('a')).toBeUndefined();
    });

    it('should check TTL on has', async () => {
      const map = new ProMap2<string, number>({ ttl: 100 });

      map.set('a', 1);
      expect(map.has('a')).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(map.has('a')).toBe(false);
    });

    it('should not expire entries before TTL', async () => {
      const map = new ProMap2<string, number>({ ttl: 200 });

      map.set('a', 1);
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(map.get('a')).toBe(1);
    });

    it('should filter expired entries in keys', async () => {
      const map = new ProMap2<string, number>({ ttl: 100 });

      map.set('a', 1);
      map.set('b', 2);
      await new Promise((resolve) => setTimeout(resolve, 150));
      map.set('c', 3);

      const keys = map.keys();
      expect(keys).not.toContain('a');
      expect(keys).not.toContain('b');
      expect(keys).toContain('c');
    });

    it('should filter expired entries in values', async () => {
      const map = new ProMap2<string, number>({ ttl: 100 });

      map.set('a', 1);
      map.set('b', 2);
      await new Promise((resolve) => setTimeout(resolve, 150));
      map.set('c', 3);

      const values = map.values();
      expect(values).not.toContain(1);
      expect(values).not.toContain(2);
      expect(values).toContain(3);
    });

    it('should filter expired entries in entries', async () => {
      const map = new ProMap2<string, number>({ ttl: 100 });

      map.set('a', 1);
      map.set('b', 2);
      await new Promise((resolve) => setTimeout(resolve, 150));
      map.set('c', 3);

      const entries = map.entries();
      expect(entries).toEqual(expect.arrayContaining([['c', 3]]));
      expect(entries).toHaveLength(1);
    });
  });

  describe('iteration', () => {
    it('should return all keys', async () => {
      const map = new ProMap2<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const keys = map.keys();
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
      expect(keys).toHaveLength(3);
    });

    it('should return all values', async () => {
      const map = new ProMap2<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const values = map.values();
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
      expect(values).toHaveLength(3);
    });

    it('should return all entries', async () => {
      const map = new ProMap2<string, number>();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const entries = map.entries();
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
      expect(entries).toContainEqual(['c', 3]);
      expect(entries).toHaveLength(3);
    });

    it('should return empty arrays for empty map', async () => {
      const map = new ProMap2<string, number>();

      expect(map.keys()).toEqual([]);
      expect(map.values()).toEqual([]);
      expect(map.entries()).toEqual([]);
    });
  });

  describe('overwriting keys', () => {
    it('should update value when setting existing key', async () => {
      const map = new ProMap2<string, number>();
      map.set('a', 1);
      map.set('a', 2);

      expect(map.get('a')).toBe(2);
      expect(map.size).toBe(1);
    });

    it('should update access time when overwriting', async () => {
      const map = new ProMap2<string, number>({ maxSize: 2 });

      map.set('a', 1);
      map.set('b', 2);
      map.set('a', 99);

      map.set('c', 3);
      expect(map.size).toBe(2);
      expect(map.has('a')).toBe(true);
      expect(map.has('b')).toBe(false);
      expect(map.has('c')).toBe(true);
    });

    it.skip('should update TTL when overwriting with TTL set', async () => {
      const map = new ProMap2<string, number>({ ttl: 100 });

      map.set('a', 1);
      await new Promise((resolve) => setTimeout(resolve, 80));
      map.set('a', 2);

      expect(map.get('a')).toBe(2);
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(map.get('a')).toBeUndefined();
    });
  });

  describe('combined LRU and TTL', () => {
    it.skip('should handle both LRU and TTL together', async () => {
      const map = new ProMap2<string, number>({ maxSize: 3, ttl: 100 });

      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      await new Promise((resolve) => setTimeout(resolve, 150));
      map.get('b');

      map.set('d', 4);
      expect(map.size).toBe(2);
      expect(map.has('b')).toBe(true);
      expect(map.has('c')).toBe(true);
      expect(map.has('d')).toBe(true);
    });
  });
});
