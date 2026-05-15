import { describe, it, expect, beforeEach } from 'vitest';
import { CuckooFilter } from '../src/core/cuckoo-filter/index.js';

describe('CuckooFilter', () => {
  let cf: CuckooFilter<string>;

  beforeEach(() => {
    cf = new CuckooFilter<string>(100);
  });

  describe('constructor', () => {
    it('should create with default options', () => {
      const filter = new CuckooFilter<string>(100);
      expect(filter.size).toBe(0);
      expect(filter.capacity).toBe(100);
      expect(filter.isEmpty).toBe(true);
      expect(filter.loadFactor).toBe(0);
    });

    it('should create with custom fingerprintSize', () => {
      const filter = new CuckooFilter<string>(100, { fingerprintSize: 8 });
      expect(filter.size).toBe(0);
      expect(filter.capacity).toBe(100);
    });

    it('should create with custom maxKicks', () => {
      const filter = new CuckooFilter<string>(100, { maxKicks: 100 });
      expect(filter.size).toBe(0);
      expect(filter.capacity).toBe(100);
    });

    it('should create with custom hashFunction', () => {
      const customHash = (item: string): number => {
        return item.length;
      };
      const filter = new CuckooFilter<string>(100, { hashFunction: customHash });
      expect(filter.size).toBe(0);
      expect(filter.capacity).toBe(100);
      filter.add('test');
      expect(filter.contains('test')).toBe(true);
    });

    it('should create with all options', () => {
      const filter = new CuckooFilter<string>(200, {
        fingerprintSize: 6,
        maxKicks: 200,
        hashFunction: (item: string): number => item.length
      });
      expect(filter.capacity).toBe(200);
      expect(filter.size).toBe(0);
      expect(filter.isEmpty).toBe(true);
    });

    it('should handle capacity of 1', () => {
      const filter = new CuckooFilter<string>(1);
      expect(filter.capacity).toBe(1);
      expect(filter.size).toBe(0);
    });

    it('should work with number type', () => {
      const filter = new CuckooFilter<number>(50);
      filter.add(1);
      expect(filter.contains(1)).toBe(true);
    });

    it('should work with object type', () => {
      const filter = new CuckooFilter<{ id: number }>(50);
      filter.add({ id: 1 });
      expect(filter.contains({ id: 1 })).toBe(true);
    });
  });

  describe('add', () => {
    it('should add single item', () => {
      expect(cf.add('hello')).toBe(true);
      expect(cf.size).toBe(1);
      expect(cf.contains('hello')).toBe(true);
    });

    it('should add multiple items', () => {
      expect(cf.add('a')).toBe(true);
      expect(cf.add('b')).toBe(true);
      expect(cf.add('c')).toBe(true);
      expect(cf.size).toBe(3);
      expect(cf.contains('a')).toBe(true);
      expect(cf.contains('b')).toBe(true);
      expect(cf.contains('c')).toBe(true);
    });

    it('should return true for duplicate adds', () => {
      expect(cf.add('hello')).toBe(true);
      expect(cf.add('hello')).toBe(true);
      expect(cf.size).toBe(2);
    });

    it('should handle empty string', () => {
      expect(cf.add('')).toBe(true);
      expect(cf.size).toBe(1);
      expect(cf.contains('')).toBe(true);
    });

    it('should handle unicode', () => {
      expect(cf.add('héllo')).toBe(true);
      expect(cf.size).toBe(1);
      expect(cf.contains('héllo')).toBe(true);
    });

    it('should handle emoji', () => {
      expect(cf.add('🚀')).toBe(true);
      expect(cf.size).toBe(1);
      expect(cf.contains('🚀')).toBe(true);
    });

    it('should handle special characters', () => {
      expect(cf.add('test!@#$')).toBe(true);
      expect(cf.size).toBe(1);
      expect(cf.contains('test!@#$')).toBe(true);
    });

    it('should be case sensitive', () => {
      expect(cf.add('hello')).toBe(true);
      expect(cf.contains('hello')).toBe(true);
      expect(cf.contains('Hello')).toBe(false);
    });

    it('should handle large number of items', () => {
      for (let i = 0; i < 100; i++) {
        cf.add(`item-${i}`);
      }
      expect(cf.size).toBeGreaterThan(90);
    });
  });

  describe('insert', () => {
    it('should insert single item', () => {
      expect(cf.insert('hello')).toBe(true);
      expect(cf.size).toBe(1);
      expect(cf.contains('hello')).toBe(true);
    });

    it('should insert multiple items', () => {
      expect(cf.insert('a')).toBe(true);
      expect(cf.insert('b')).toBe(true);
      expect(cf.insert('c')).toBe(true);
      expect(cf.size).toBe(3);
    });

    it('should return true for duplicate inserts', () => {
      expect(cf.insert('same')).toBe(true);
      expect(cf.insert('same')).toBe(true);
      expect(cf.size).toBe(2);
    });

    it('should handle empty string', () => {
      expect(cf.insert('')).toBe(true);
      expect(cf.size).toBe(1);
    });

    it('should handle unicode', () => {
      expect(cf.insert('héllo')).toBe(true);
      expect(cf.contains('héllo')).toBe(true);
    });

    it('should handle emoji', () => {
      expect(cf.insert('🚀')).toBe(true);
      expect(cf.contains('🚀')).toBe(true);
    });

    it('should return false when full', () => {
      const filter = new CuckooFilter<string>(10, { maxKicks: 1 });
      for (let i = 0; i < 100; i++) {
        filter.insert(`item-${i}`);
      }
      const result = filter.insert('new-item');
      expect(result).toBe(false);
    });
  });

  describe('contains', () => {
    it('should return false for non-existent item', () => {
      expect(cf.contains('hello')).toBe(false);
    });

    it('should return true for added item', () => {
      cf.add('hello');
      expect(cf.contains('hello')).toBe(true);
    });

    it('should return true after multiple adds', () => {
      cf.add('hello');
      cf.add('hello');
      cf.add('hello');
      expect(cf.contains('hello')).toBe(true);
    });

    it('should be false for similar items', () => {
      cf.add('hello');
      expect(cf.contains('hell')).toBe(false);
      expect(cf.contains('hello!')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(cf.contains('')).toBe(false);
      cf.add('');
      expect(cf.contains('')).toBe(true);
    });

    it('should handle unicode', () => {
      expect(cf.contains('héllo')).toBe(false);
      cf.add('héllo');
      expect(cf.contains('héllo')).toBe(true);
    });

    it('should handle emoji', () => {
      expect(cf.contains('🚀')).toBe(false);
      cf.add('🚀');
      expect(cf.contains('🚀')).toBe(true);
    });

    it('should be case sensitive', () => {
      cf.add('hello');
      expect(cf.contains('hello')).toBe(true);
      expect(cf.contains('Hello')).toBe(false);
      expect(cf.contains('HELLO')).toBe(false);
    });

    it('should return false after removing all occurrences', () => {
      cf.add('hello');
      cf.add('hello');
      cf.remove('hello');
      cf.remove('hello');
      expect(cf.contains('hello')).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove existing item', () => {
      cf.add('hello');
      cf.add('hello');
      expect(cf.remove('hello')).toBe(true);
      expect(cf.size).toBe(1);
      expect(cf.contains('hello')).toBe(true);
    });

    it('should return false for non-existent item', () => {
      expect(cf.remove('hello')).toBe(false);
      expect(cf.size).toBe(0);
    });

    it('should remove all occurrences', () => {
      cf.add('hello');
      cf.add('hello');
      cf.add('hello');
      cf.remove('hello');
      cf.remove('hello');
      cf.remove('hello');
      expect(cf.contains('hello')).toBe(false);
    });

    it('should handle removing once added item', () => {
      cf.add('single');
      expect(cf.remove('single')).toBe(true);
      expect(cf.contains('single')).toBe(false);
      expect(cf.remove('single')).toBe(false);
    });

    it('should handle empty string', () => {
      cf.add('');
      expect(cf.remove('')).toBe(true);
      expect(cf.contains('')).toBe(false);
    });

    it('should handle unicode', () => {
      cf.add('héllo');
      expect(cf.remove('héllo')).toBe(true);
      expect(cf.contains('héllo')).toBe(false);
    });

    it('should handle emoji', () => {
      cf.add('🚀');
      expect(cf.remove('🚀')).toBe(true);
      expect(cf.contains('🚀')).toBe(false);
    });
  });

  describe('size', () => {
    it('should be 0 initially', () => {
      expect(cf.size).toBe(0);
    });

    it('should increment with each add', () => {
      expect(cf.size).toBe(0);
      cf.add('a');
      expect(cf.size).toBe(1);
      cf.add('b');
      expect(cf.size).toBe(2);
      cf.add('c');
      expect(cf.size).toBe(3);
    });

    it('should count duplicates', () => {
      cf.add('same');
      cf.add('same');
      cf.add('same');
      expect(cf.size).toBe(3);
    });

    it('should decrement with remove', () => {
      cf.add('a');
      cf.add('b');
      expect(cf.size).toBe(2);
      cf.remove('a');
      expect(cf.size).toBe(1);
    });

    it('should be number type', () => {
      expect(typeof cf.size).toBe('number');
    });

    it('should reset to 0 after clear', () => {
      cf.add('a');
      cf.add('b');
      cf.add('c');
      expect(cf.size).toBe(3);
      cf.clear();
      expect(cf.size).toBe(0);
    });
  });

  describe('capacity', () => {
    it('should return capacity from constructor', () => {
      const filter = new CuckooFilter<string>(50);
      expect(filter.capacity).toBe(50);
    });

    it('should return default capacity', () => {
      const filter = new CuckooFilter<string>(100);
      expect(filter.capacity).toBe(100);
    });

    it('should be number type', () => {
      expect(typeof cf.capacity).toBe('number');
    });

    it('should handle capacity of 1', () => {
      const filter = new CuckooFilter<string>(1);
      expect(filter.capacity).toBe(1);
    });

    it('should remain constant after operations', () => {
      const capacity = cf.capacity;
      cf.add('a');
      cf.add('b');
      cf.remove('a');
      expect(cf.capacity).toBe(capacity);
    });
  });

  describe('loadFactor', () => {
    it('should be 0 for empty filter', () => {
      expect(cf.loadFactor).toBe(0);
    });

    it('should increase after adding items', () => {
      const lf1 = cf.loadFactor;
      expect(lf1).toBe(0);

      cf.add('a');
      const lf2 = cf.loadFactor;
      expect(lf2).toBeGreaterThan(lf1);

      cf.add('b');
      cf.add('c');
      const lf3 = cf.loadFactor;
      expect(lf3).toBeGreaterThan(lf2);
    });

    it('should be number type', () => {
      expect(typeof cf.loadFactor).toBe('number');
    });

    it('should be between 0 and 1', () => {
      cf.add('a');
      cf.add('b');
      expect(cf.loadFactor).toBeGreaterThanOrEqual(0);
      expect(cf.loadFactor).toBeLessThanOrEqual(1);
    });

    it('should return 0 after clearing', () => {
      cf.add('a');
      cf.add('b');
      expect(cf.loadFactor).toBeGreaterThan(0);
      cf.clear();
      expect(cf.loadFactor).toBe(0);
    });

    it('should decrease after removing items', () => {
      cf.add('a');
      cf.add('b');
      const lf1 = cf.loadFactor;

      cf.remove('a');
      cf.remove('b');
      const lf2 = cf.loadFactor;

      expect(lf2).toBeLessThan(lf1);
    });
  });

  describe('falsePositiveRate', () => {
    it('should be 0 for empty filter', () => {
      expect(cf.falsePositiveRate).toBe(0);
    });

    it('should be number type', () => {
      expect(typeof cf.falsePositiveRate).toBe('number');
    });

    it('should be between 0 and 1', () => {
      expect(cf.falsePositiveRate).toBeGreaterThanOrEqual(0);
      expect(cf.falsePositiveRate).toBeLessThan(1);
    });

    it('should remain constant regardless of size', () => {
      cf.add('a');
      const fpr1 = cf.falsePositiveRate;
      cf.add('b');
      const fpr2 = cf.falsePositiveRate;
      expect(fpr2).toBe(fpr1);
    });

    it('should be based on fingerprint size', () => {
      const cf1 = new CuckooFilter<string>(100, { fingerprintSize: 4 });
      const cf2 = new CuckooFilter<string>(100, { fingerprintSize: 8 });
      cf1.add('test');
      cf2.add('test');
      expect(cf2.falsePositiveRate).toBeLessThan(cf1.falsePositiveRate);
    });
  });

  describe('isEmpty', () => {
    it('should be true initially', () => {
      expect(cf.isEmpty).toBe(true);
    });

    it('should be false after add', () => {
      cf.add('hello');
      expect(cf.isEmpty).toBe(false);
    });

    it('should be false after multiple adds', () => {
      cf.add('a');
      cf.add('b');
      cf.add('c');
      expect(cf.isEmpty).toBe(false);
    });

    it('should be boolean type', () => {
      expect(typeof cf.isEmpty).toBe('boolean');
    });

    it('should be true after clearing', () => {
      cf.add('a');
      cf.add('b');
      expect(cf.isEmpty).toBe(false);
      cf.clear();
      expect(cf.isEmpty).toBe(true);
    });

    it('should be true after removing all items', () => {
      cf.add('a');
      cf.add('b');
      cf.remove('a');
      cf.remove('b');
      expect(cf.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear empty filter', () => {
      cf.clear();
      expect(cf.size).toBe(0);
      expect(cf.isEmpty).toBe(true);
    });

    it('should clear single item', () => {
      cf.add('hello');
      cf.clear();
      expect(cf.size).toBe(0);
      expect(cf.contains('hello')).toBe(false);
    });

    it('should clear multiple items', () => {
      cf.add('a');
      cf.add('b');
      cf.add('c');
      cf.clear();
      expect(cf.size).toBe(0);
      expect(cf.contains('a')).toBe(false);
      expect(cf.contains('b')).toBe(false);
      expect(cf.contains('c')).toBe(false);
    });

    it('should clear duplicates', () => {
      cf.add('same');
      cf.add('same');
      cf.add('same');
      cf.clear();
      expect(cf.size).toBe(0);
    });

    it('should reset load factor', () => {
      cf.add('a');
      expect(cf.loadFactor).toBeGreaterThan(0);
      cf.clear();
      expect(cf.loadFactor).toBe(0);
    });

    it('should allow operations after clear', () => {
      cf.add('a');
      cf.clear();
      cf.add('b');
      expect(cf.size).toBe(1);
      expect(cf.contains('b')).toBe(true);
    });

    it('should clear multiple times', () => {
      cf.add('a');
      cf.clear();
      cf.clear();
      cf.clear();
      expect(cf.size).toBe(0);
    });
  });

  describe('clone', () => {
    it('should clone empty filter', () => {
      const cloned = cf.clone();
      expect(cloned.size).toBe(0);
      expect(cloned.isEmpty).toBe(true);
      expect(cloned).not.toBe(cf);
    });

    it('should clone filter with items', () => {
      cf.add('a');
      cf.add('b');
      cf.add('c');

      const cloned = cf.clone();
      expect(cloned.size).toBe(3);
      expect(cloned.contains('a')).toBe(true);
      expect(cloned.contains('b')).toBe(true);
      expect(cloned.contains('c')).toBe(true);
    });

    it('should create independent clone', () => {
      cf.add('a');
      cf.add('b');

      const cloned = cf.clone();
      cloned.add('c');
      cloned.remove('a');

      expect(cf.size).toBe(2);
      expect(cf.contains('a')).toBe(true);
      expect(cf.contains('c')).toBe(false);
      expect(cloned.size).toBe(2);
      expect(cloned.contains('a')).toBe(false);
      expect(cloned.contains('c')).toBe(true);
    });

    it('should preserve capacity', () => {
      const cloned = cf.clone();
      expect(cloned.capacity).toBe(cf.capacity);
    });

    it('should clone with duplicate items', () => {
      cf.add('same');
      cf.add('same');
      cf.add('same');

      const cloned = cf.clone();
      expect(cloned.size).toBe(3);
    });

    it('should preserve load factor', () => {
      cf.add('a');
      cf.add('b');
      const cloned = cf.clone();
      expect(cloned.loadFactor).toBe(cf.loadFactor);
    });
  });

  describe('fromItems static', () => {
    it('should create filter from empty array', () => {
      const filter = CuckooFilter.fromItems<string>([]);
      expect(filter.size).toBe(0);
      expect(filter.isEmpty).toBe(true);
    });

    it('should create filter from items', () => {
      const filter = CuckooFilter.fromItems(['a', 'b', 'c']);
      expect(filter.size).toBe(3);
      expect(filter.contains('a')).toBe(true);
      expect(filter.contains('b')).toBe(true);
      expect(filter.contains('c')).toBe(true);
    });

    it('should handle duplicate items', () => {
      const filter = CuckooFilter.fromItems(['a', 'a', 'b']);
      expect(filter.size).toBe(3);
    });

    it('should use custom options', () => {
      const filter = CuckooFilter.fromItems(['a', 'b'], { fingerprintSize: 8 });
      expect(filter.contains('a')).toBe(true);
      expect(filter.contains('b')).toBe(true);
    });

    it('should handle large array', () => {
      const items = Array.from({ length: 50 }, (_, i) => `item-${i}`);
      const filter = CuckooFilter.fromItems(items);
      expect(filter.size).toBeGreaterThan(40);
    });

    it('should work with numbers', () => {
      const filter = CuckooFilter.fromItems<number>([1, 2, 3]);
      expect(filter.contains(1)).toBe(true);
      expect(filter.contains(2)).toBe(true);
      expect(filter.contains(3)).toBe(true);
    });
  });

  describe('forEach', () => {
    it('should iterate over empty filter', () => {
      let count = 0;
      cf.forEach(() => count++);
      expect(count).toBe(0);
    });

    it('should iterate over all fingerprints', () => {
      cf.add('a');
      cf.add('b');
      cf.add('c');

      let count = 0;
      cf.forEach(() => count++);
      expect(count).toBe(3);
    });

    it('should pass correct parameters', () => {
      cf.add('a');
      cf.add('b');

      const fingerprints: number[] = [];
      const bucketIndices: number[] = [];
      const slotIndices: number[] = [];

      cf.forEach((fp, b, s) => {
        fingerprints.push(fp);
        bucketIndices.push(b);
        slotIndices.push(s);
      });

      expect(fingerprints.length).toBe(2);
      expect(bucketIndices.length).toBe(2);
      expect(slotIndices.length).toBe(2);
    });

    it('should handle duplicates', () => {
      cf.add('same');
      cf.add('same');

      let count = 0;
      cf.forEach(() => count++);
      expect(count).toBe(2);
    });
  });

  describe('Symbol.iterator', () => {
    it('should iterate over empty filter', () => {
      const items = [...cf];
      expect(items).toEqual([]);
    });

    it('should iterate over all fingerprints', () => {
      cf.add('a');
      cf.add('b');
      cf.add('c');

      const items = [...cf];
      expect(items.length).toBe(3);
    });

    it('should return numbers', () => {
      cf.add('a');
      const items = [...cf];
      items.forEach(item => {
        expect(typeof item).toBe('number');
      });
    });

    it('should work with for...of', () => {
      cf.add('a');
      cf.add('b');

      let count = 0;
      for (const _ of cf) {
        count++;
      }
      expect(count).toBe(2);
    });

    it('should handle duplicates', () => {
      cf.add('same');
      cf.add('same');

      const items = [...cf];
      expect(items.length).toBe(2);
    });
  });

  describe('toStats', () => {
    it('should return stats for empty filter', () => {
      const stats = cf.toStats();
      expect(stats.size).toBe(0);
      expect(stats.capacity).toBe(100);
      expect(stats.loadFactor).toBe(0);
      expect(stats.filledSlots).toBe(0);
      expect(stats.totalSlots).toBeGreaterThan(0);
    });

    it('should return stats with items', () => {
      cf.add('a');
      cf.add('b');
      cf.add('c');

      const stats = cf.toStats();
      expect(stats.size).toBe(3);
      expect(stats.capacity).toBe(100);
      expect(stats.loadFactor).toBeGreaterThan(0);
      expect(stats.filledSlots).toBe(3);
    });

    it('should include fingerprintSize', () => {
      const stats = cf.toStats();
      expect(stats.fingerprintSize).toBeGreaterThan(0);
      expect(typeof stats.fingerprintSize).toBe('number');
    });

    it('should include maxKicks', () => {
      const stats = cf.toStats();
      expect(stats.maxKicks).toBeGreaterThan(0);
      expect(typeof stats.maxKicks).toBe('number');
    });

    it('should include bucketSize', () => {
      const stats = cf.toStats();
      expect(stats.bucketSize).toBe(4);
      expect(typeof stats.bucketSize).toBe('number');
    });

    it('should include falsePositiveRate', () => {
      const stats = cf.toStats();
      expect(typeof stats.falsePositiveRate).toBe('number');
    });

    it('should track filledSlots correctly', () => {
      cf.add('a');
      cf.add('b');
      const stats1 = cf.toStats();
      expect(stats1.filledSlots).toBe(2);

      cf.add('c');
      const stats2 = cf.toStats();
      expect(stats2.filledSlots).toBe(3);
    });
  });

  describe('integration', () => {
    it('should handle add/remove cycle', () => {
      cf.add('a');
      expect(cf.contains('a')).toBe(true);
      cf.remove('a');
      expect(cf.contains('a')).toBe(false);
      cf.add('b');
      expect(cf.contains('b')).toBe(true);
    });

    it('should clone and modify independently', () => {
      cf.add('a');
      cf.add('b');

      const cloned = cf.clone();
      cloned.add('c');
      cloned.remove('a');

      expect(cf.contains('a')).toBe(true);
      expect(cf.contains('c')).toBe(false);
      expect(cloned.contains('a')).toBe(false);
      expect(cloned.contains('c')).toBe(true);
    });

    it('should clear and reuse', () => {
      cf.add('a');
      cf.add('b');
      expect(cf.size).toBe(2);

      cf.clear();
      expect(cf.size).toBe(0);

      cf.add('c');
      cf.add('d');
      expect(cf.size).toBe(2);
      expect(cf.contains('c')).toBe(true);
      expect(cf.contains('d')).toBe(true);
    });

    it('should handle fromItems with duplicates', () => {
      const filter = CuckooFilter.fromItems(['a', 'a', 'b', 'b']);
      expect(filter.size).toBe(4);
      expect(filter.contains('a')).toBe(true);
      expect(filter.contains('b')).toBe(true);
    });

    it('should iterate correctly after operations', () => {
      cf.add('a');
      cf.add('b');
      cf.add('c');

      let count = 0;
      cf.forEach(() => count++);
      expect(count).toBe(3);

      cf.remove('b');
      count = 0;
      cf.forEach(() => count++);
      expect(count).toBe(2);
    });

    it('should maintain no false positives under load', () => {
      const items = ['a', 'b', 'c', 'd', 'e'];
      items.forEach(item => cf.add(item));
      items.forEach(item => {
        expect(cf.contains(item)).toBe(true);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      cf.add(longString);
      expect(cf.contains(longString)).toBe(true);
    });

    it('should handle null-like values in objects', () => {
      const filter = new CuckooFilter<{ id: number | null }>(50);
      filter.add({ id: 1 });
      filter.add({ id: null });
      expect(filter.contains({ id: 1 })).toBe(true);
      expect(filter.contains({ id: null })).toBe(true);
    });

    it('should handle undefined in objects', () => {
      const filter = new CuckooFilter<{ id: number | undefined }>(50);
      filter.add({ id: 1 });
      filter.add({ id: undefined });
      expect(filter.contains({ id: 1 })).toBe(true);
      expect(filter.contains({ id: undefined })).toBe(true);
    });

    it('should handle capacity of 1', () => {
      const filter = new CuckooFilter<string>(1);
      filter.add('test');
      expect(filter.size).toBeGreaterThan(0);
    });

    it('should handle very large capacity', () => {
      const filter = new CuckooFilter<string>(10000);
      filter.add('test');
      expect(filter.contains('test')).toBe(true);
    });

    it('should handle very small maxKicks', () => {
      const filter = new CuckooFilter<string>(10, { maxKicks: 1 });
      filter.add('test');
      expect(filter.contains('test')).toBe(true);
    });

    it('should handle very large maxKicks', () => {
      const filter = new CuckooFilter<string>(10, { maxKicks: 10000 });
      filter.add('test');
      expect(filter.contains('test')).toBe(true);
    });

    it('should handle very small fingerprint size', () => {
      const filter = new CuckooFilter<string>(10, { fingerprintSize: 2 });
      filter.add('test');
      expect(filter.contains('test')).toBe(true);
    });

    it('should handle very large fingerprint size', () => {
      const filter = new CuckooFilter<string>(10, { fingerprintSize: 16 });
      filter.add('test');
      expect(filter.contains('test')).toBe(true);
    });
  });

  describe('type safety', () => {
    it('should work with generic type parameter', () => {
      const filter = new CuckooFilter<number>(50);
      filter.add(42);
      expect(filter.contains(42)).toBe(true);
    });

    it('should preserve type through clone', () => {
      const filter = new CuckooFilter<number>(50);
      filter.add(42);
      const cloned = filter.clone();
      cloned.add(100);
      expect(cloned.contains(42)).toBe(true);
      expect(cloned.contains(100)).toBe(true);
    });

    it('should preserve type in fromItems', () => {
      const filter = CuckooFilter.fromItems<number>([1, 2, 3]);
      expect(filter.contains(1)).toBe(true);
      expect(filter.contains(2)).toBe(true);
      expect(filter.contains(3)).toBe(true);
    });
  });
});
