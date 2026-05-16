import { describe, it, expect } from 'vitest';
import { LRUCache5 } from '../src/core/lru-cache-5/index.js';

describe('LRUCache5', () => {
  describe('get/set', () => {
    it('should return undefined for non-existent key', () => {
      const cache = new LRUCache5<number, number>(3);
      expect(cache.get(1)).toBeUndefined();
    });

    it('should set and get value', () => {
      const cache = new LRUCache5<number, number>(3);
      cache.set(1, 10);
      expect(cache.get(1)).toBe(10);
    });

    it('should update existing key', () => {
      const cache = new LRUCache5<number, number>(3);
      cache.set(1, 10);
      cache.set(1, 20);
      expect(cache.get(1)).toBe(20);
    });
  });

  describe('capacity enforcement', () => {
    it('should evict least recently used when capacity exceeded', () => {
      const cache = new LRUCache5<number, number>(2);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      expect(cache.get(1)).toBeUndefined();
      expect(cache.get(2)).toBe(20);
      expect(cache.get(3)).toBe(30);
    });

    it('should maintain correct size after evictions', () => {
      const cache = new LRUCache5<number, number>(2);
      cache.set(1, 10);
      cache.set(2, 20);
      expect(cache.size).toBe(2);
      cache.set(3, 30);
      expect(cache.size).toBe(2);
    });
  });

  describe('LRU eviction order', () => {
    it('should move accessed key to front', () => {
      const cache = new LRUCache5<number, number>(2);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.get(1);
      cache.set(3, 30);
      expect(cache.get(1)).toBe(10);
      expect(cache.get(2)).toBeUndefined();
      expect(cache.get(3)).toBe(30);
    });

    it('should move updated key to front', () => {
      const cache = new LRUCache5<number, number>(2);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(1, 100);
      cache.set(3, 30);
      expect(cache.get(1)).toBe(100);
      expect(cache.get(2)).toBeUndefined();
      expect(cache.get(3)).toBe(30);
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      const cache = new LRUCache5<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      expect(cache.delete(1)).toBe(true);
      expect(cache.get(1)).toBeUndefined();
      expect(cache.size).toBe(1);
    });

    it('should return false for non-existent key', () => {
      const cache = new LRUCache5<number, number>(3);
      expect(cache.delete(1)).toBe(false);
    });

    it('should handle delete of head', () => {
      const cache = new LRUCache5<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.delete(1);
      expect(cache.get(1)).toBeUndefined();
      expect(cache.get(2)).toBe(20);
      expect(cache.get(3)).toBe(30);
    });

    it('should handle delete of tail', () => {
      const cache = new LRUCache5<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.delete(3);
      expect(cache.get(1)).toBe(10);
      expect(cache.get(2)).toBe(20);
      expect(cache.get(3)).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      const cache = new LRUCache5<number, number>(3);
      cache.set(1, 10);
      expect(cache.has(1)).toBe(true);
    });

    it('should return false for non-existent key', () => {
      const cache = new LRUCache5<number, number>(3);
      expect(cache.has(1)).toBe(false);
    });
  });

  describe('keys/values/entries order', () => {
    it('should return keys in most recent order', () => {
      const cache = new LRUCache5<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.get(1);
      expect(cache.keys()).toEqual([1, 3, 2]);
    });

    it('should return values in most recent order', () => {
      const cache = new LRUCache5<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.get(1);
      expect(cache.values()).toEqual([10, 30, 20]);
    });

    it('should return entries in most recent order', () => {
      const cache = new LRUCache5<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.get(1);
      expect(cache.entries()).toEqual([[1, 10], [3, 30], [2, 20]]);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      const cache = new LRUCache5<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.get(1)).toBeUndefined();
      expect(cache.get(2)).toBeUndefined();
      expect(cache.get(3)).toBeUndefined();
    });
  });

  describe('capacity getter', () => {
    it('should return capacity', () => {
      const cache = new LRUCache5<number, number>(5);
      expect(cache.capacityValue).toBe(5);
    });
  });

  describe('update existing key moves to front', () => {
    it('should move updated key to most recent position', () => {
      const cache = new LRUCache5<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.set(1, 100);
      cache.set(4, 40);
      expect(cache.get(1)).toBe(100);
      expect(cache.get(2)).toBeUndefined();
      expect(cache.get(3)).toBe(30);
      expect(cache.get(4)).toBe(40);
    });
  });

  describe('error handling', () => {
    it('should throw error for non-positive capacity', () => {
      expect(() => new LRUCache5<number, number>(0)).toThrow('Capacity must be positive');
      expect(() => new LRUCache5<number, number>(-1)).toThrow('Capacity must be positive');
    });
  });

  describe('string keys', () => {
    it('should work with string keys', () => {
      const cache = new LRUCache5<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });

    it('should evict string keys correctly', () => {
      const cache = new LRUCache5<string, number>(2);
      cache.set('x', 10);
      cache.set('y', 20);
      cache.set('z', 30);
      expect(cache.get('x')).toBeUndefined();
      expect(cache.get('y')).toBe(20);
    });
  });

  describe('forEach', () => {
    it('should iterate over entries', () => {
      const cache = new LRUCache5<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      const entries: Array<[number, number]> = cache.entries();
      expect(entries).toEqual([[3, 30], [2, 20], [1, 10]]);
    });
  });

  describe('clear and reuse', () => {
    it('should allow set after clear', () => {
      const cache = new LRUCache5<number, number>(2);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.clear();
      expect(cache.size).toBe(0);
      cache.set(3, 30);
      expect(cache.get(3)).toBe(30);
      expect(cache.size).toBe(1);
    });
  });

  describe('delete middle element', () => {
    it('should delete middle element and maintain order', () => {
      const cache = new LRUCache5<number, number>(5);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.set(4, 40);
      cache.delete(2);
      expect(cache.get(2)).toBeUndefined();
      expect(cache.size).toBe(3);
      expect(cache.keys()).toEqual([4, 3, 1]);
    });
  });

  describe('repeated set on same key', () => {
    it('should not grow size on repeated set', () => {
      const cache = new LRUCache5<number, number>(3);
      cache.set(1, 10);
      cache.set(1, 20);
      cache.set(1, 30);
      expect(cache.size).toBe(1);
      expect(cache.get(1)).toBe(30);
    });
  });

  describe('edge case: capacity 1', () => {
    it('should only hold one element', () => {
      const cache = new LRUCache5<number, number>(1);
      cache.set(1, 10);
      expect(cache.get(1)).toBe(10);
      cache.set(2, 20);
      expect(cache.get(1)).toBeUndefined();
      expect(cache.get(2)).toBe(20);
      expect(cache.size).toBe(1);
    });
  });

  describe('has after eviction', () => {
    it('should return false for evicted key', () => {
      const cache = new LRUCache5<number, number>(2);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      expect(cache.has(1)).toBe(false);
      expect(cache.has(2)).toBe(true);
      expect(cache.has(3)).toBe(true);
    });
  });

  describe('values after mixed ops', () => {
    it('should return correct values after get/update/delete', () => {
      const cache = new LRUCache5<number, number>(4);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.get(1);
      cache.set(4, 40);
      cache.delete(2);
      expect(cache.values()).toEqual([40, 10, 30]);
    });
  });

  describe('additional coverage', () => {
    it('should handle clear', () => {
      const cache = new LRUCache5<number, number>(5);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.has(1)).toBe(false);
    });

    it('should handle keys after set and get', () => {
      const cache = new LRUCache5<number, number>(3);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.set(3, 30);
      cache.get(1);
      const keys = cache.keys();
      expect(keys).toContain(1);
      expect(keys).toContain(2);
      expect(keys).toContain(3);
    });

    it('should handle update on existing key', () => {
      const cache = new LRUCache5<number, number>(5);
      cache.set(1, 10);
      cache.set(1, 99);
      expect(cache.get(1)).toBe(99);
      expect(cache.size).toBe(1);
    });
  });

  describe('additional', () => {
    it('should handle keys and values', () => {
      const cache = new LRUCache5<number, string>(5);
      cache.set(1, 'a');
      cache.set(2, 'b');
      expect(cache.keys()).toContain(1);
      expect(cache.keys()).toContain(2);
      expect(cache.values()).toContain('a');
      expect(cache.values()).toContain('b');
    });

    it('should handle entries', () => {
      const cache = new LRUCache5<number, string>(5);
      cache.set(1, 'a');
      cache.set(2, 'b');
      const entries = cache.entries();
      expect(entries.length).toBe(2);
    });

    it('should handle delete', () => {
      const cache = new LRUCache5<number, string>(5);
      cache.set(1, 'a');
      cache.set(2, 'b');
      expect(cache.delete(1)).toBe(true);
      expect(cache.has(1)).toBe(false);
      expect(cache.size).toBe(1);
    });

    it('should handle clear', () => {
      const cache = new LRUCache5<number, string>(5);
      cache.set(1, 'a');
      cache.set(2, 'b');
      cache.clear();
      expect(cache.size).toBe(0);
    });

    it('should handle overwrite', () => {
      const cache = new LRUCache5<number, string>(5);
      cache.set(1, 'a');
      cache.set(1, 'b');
      expect(cache.get(1)).toBe('b');
      expect(cache.size).toBe(1);
    });

    it('should handle delete', () => {
      const c = new LRUCache5<string, number>(10);
      c.set('x', 1);
      c.set('y', 2);
      expect(c.delete('x')).toBe(true);
      expect(c.get('x')).toBeUndefined();
      expect(c.size).toBe(1);
    });

    it('should handle clear', () => {
      const cache = new LRUCache5<number, number>(10);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.clear();
      expect(cache.size).toBe(0);
    });

    it('should handle overwrite', () => {
      const cache = new LRUCache5<number, number>(3);
      cache.set(1, 10);
      cache.set(1, 20);
      expect(cache.get(1)).toBe(20);
      expect(cache.size).toBe(1);
    });

  it('should handle delete', () => {
    const cache = new LRUCache5<number, number>(3);
    cache.set(1, 10);
    cache.set(2, 20);
    cache.delete(1);
    expect(cache.get(1)).toBeUndefined();
    expect(cache.size).toBe(1);
  });

  it('should handle entries', () => {
     const cache = new LRUCache5<number, number>(5);
     cache.set(1, 10);
     cache.set(2, 20);
     cache.set(3, 30);
     const entries = cache.entries();
     expect(entries.length).toBe(3);
   });

   it('should handle delete', () => {
     const cache = new LRUCache5<number, number>(3);
     cache.set(1, 10);
     cache.set(2, 20);
     cache.delete(1);
     expect(cache.has(1)).toBe(false);
     expect(cache.has(2)).toBe(true);
   });

   it('should handle size', () => {
     const cache = new LRUCache5<number, number>(5);
     cache.set(1, 10);
     cache.set(2, 20);
     cache.set(3, 30);
     expect(cache.size).toBe(3);
   });

   it('should handle entries', () => {
     const cache = new LRUCache5<number, number>(5);
     cache.set(1, 10);
     cache.set(2, 20);
     const entries = cache.entries();
     expect(entries.length).toBe(2);
   });
   it('should handle delete', () => {
     const cache = new LRUCache5<number, number>(5);
     cache.set(1, 10);
     cache.set(2, 20);
     expect(cache.delete(1)).toBe(true);
     expect(cache.has(1)).toBe(false);
     expect(cache.size).toBe(1);
   });
    it('should handle capacity property', () => {
      const cache = new LRUCache5<number, number>(3);
      expect(cache.capacity).toBe(3);
    });
    it('should handle keys after clear and set', () => {
      const cache = new LRUCache5<number, number>(5);
      cache.set(1, 10);
      cache.set(2, 20);
      cache.clear();
      cache.set(3, 30);
      expect(cache.keys()).toEqual([3]);
      expect(cache.size).toBe(1);
    });
  });
});
