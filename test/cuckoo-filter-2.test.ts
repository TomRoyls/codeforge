import { describe, it, expect, beforeEach } from 'vitest';
import { CuckooFilter2 } from '../src/core/cuckoo-filter-2/index.js';

describe('CuckooFilter2', () => {
  let filter: CuckooFilter2;

  beforeEach(() => {
    filter = new CuckooFilter2();
  });

  describe('insert and contains', () => {
    it('should insert and contain an item', () => {
      const result = filter.insert('apple');
      expect(result).toBe(true);
      expect(filter.contains('apple')).toBe(true);
    });

    it('should not contain an item that was not inserted', () => {
      filter.insert('apple');
      expect(filter.contains('banana')).toBe(false);
    });

    it('should insert multiple items', () => {
      expect(filter.insert('apple')).toBe(true);
      expect(filter.insert('banana')).toBe(true);
      expect(filter.insert('cherry')).toBe(true);
      expect(filter.contains('apple')).toBe(true);
      expect(filter.contains('banana')).toBe(true);
      expect(filter.contains('cherry')).toBe(true);
    });

    it('should handle duplicate inserts', () => {
      filter.insert('apple');
      const result = filter.insert('apple');
      expect(result).toBe(true);
      expect(filter.contains('apple')).toBe(true);
    });
  });

  describe('size', () => {
    it('should start with size 0', () => {
      expect(filter.size).toBe(0);
    });

    it('should track size correctly', () => {
      filter.insert('apple');
      expect(filter.size).toBe(1);
      filter.insert('banana');
      expect(filter.size).toBe(2);
      filter.insert('cherry');
      expect(filter.size).toBe(3);
    });

    it('should not increment size on duplicate inserts', () => {
      filter.insert('apple');
      filter.insert('apple');
      expect(filter.size).toBe(1);
    });

    it('should decrement size on delete', () => {
      filter.insert('apple');
      filter.insert('banana');
      expect(filter.size).toBe(2);
      filter.delete('apple');
      expect(filter.size).toBe(1);
    });

    it('should handle multiple deletes correctly', () => {
      filter.insert('apple');
      filter.insert('banana');
      filter.insert('cherry');
      expect(filter.size).toBe(3);
      filter.delete('apple');
      filter.delete('banana');
      expect(filter.size).toBe(1);
    });
  });

  describe('delete', () => {
    it('should delete an existing item', () => {
      filter.insert('apple');
      const result = filter.delete('apple');
      expect(result).toBe(true);
      expect(filter.contains('apple')).toBe(false);
    });

    it('should return false when deleting non-existent item', () => {
      filter.insert('apple');
      const result = filter.delete('banana');
      expect(result).toBe(false);
      expect(filter.contains('apple')).toBe(true);
    });

    it('should delete multiple items', () => {
      filter.insert('apple');
      filter.insert('banana');
      filter.insert('cherry');
      expect(filter.delete('apple')).toBe(true);
      expect(filter.delete('banana')).toBe(true);
      expect(filter.contains('apple')).toBe(false);
      expect(filter.contains('banana')).toBe(false);
      expect(filter.contains('cherry')).toBe(true);
    });

    it('should handle delete of duplicate inserts', () => {
      filter.insert('apple');
      filter.insert('apple');
      const result = filter.delete('apple');
      expect(result).toBe(true);
      expect(filter.contains('apple')).toBe(false);
    });
  });

  describe('loadFactor', () => {
    it('should start with load factor 0', () => {
      expect(filter.loadFactor()).toBe(0);
    });

    it('should calculate load factor correctly', () => {
      filter.insert('apple');
      expect(filter.loadFactor()).toBe(1 / (1024 * 4));
    });

    it('should increase load factor with more items', () => {
      filter.insert('apple');
      filter.insert('banana');
      filter.insert('cherry');
      expect(filter.loadFactor()).toBe(3 / (1024 * 4));
    });

    it('should decrease load factor after delete', () => {
      filter.insert('apple');
      filter.insert('banana');
      filter.insert('cherry');
      const before = filter.loadFactor();
      filter.delete('apple');
      const after = filter.loadFactor();
      expect(after).toBeLessThan(before);
    });

    it('should return 1 when filter is at capacity', () => {
      const smallFilter = new CuckooFilter2(2, 2);
      smallFilter.insert('apple');
      smallFilter.insert('banana');
      smallFilter.insert('cherry');
      smallFilter.insert('cherry2');
      expect(smallFilter.loadFactor()).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      filter.insert('apple');
      filter.insert('banana');
      filter.insert('cherry');
      filter.clear();
      expect(filter.size).toBe(0);
      expect(filter.contains('apple')).toBe(false);
      expect(filter.contains('banana')).toBe(false);
      expect(filter.contains('cherry')).toBe(false);
    });

    it('should reset load factor to 0', () => {
      filter.insert('apple');
      filter.insert('banana');
      expect(filter.loadFactor()).toBeGreaterThan(0);
      filter.clear();
      expect(filter.loadFactor()).toBe(0);
    });

    it('should allow inserts after clear', () => {
      filter.insert('apple');
      filter.insert('banana');
      filter.clear();
      expect(filter.insert('apple')).toBe(true);
      expect(filter.contains('apple')).toBe(true);
    });
  });

  describe('full filter behavior', () => {
    it('should return false when filter is full', () => {
      const smallFilter = new CuckooFilter2(2, 2);
      expect(smallFilter.insert('apple')).toBe(true);
      expect(smallFilter.insert('banana')).toBe(true);
      expect(smallFilter.insert('cherry')).toBe(true);
      expect(smallFilter.insert('date')).toBe(true);
      expect(smallFilter.insert('elderberry')).toBe(false);
    });

    it('should still contain items after filter is full', () => {
      const smallFilter = new CuckooFilter2(2, 2);
      smallFilter.insert('apple');
      smallFilter.insert('banana');
      smallFilter.insert('cherry');
      smallFilter.insert('date');
      expect(smallFilter.contains('apple')).toBe(true);
      expect(smallFilter.contains('banana')).toBe(true);
      expect(smallFilter.contains('cherry')).toBe(true);
      expect(smallFilter.contains('date')).toBe(true);
    });

    it('should still allow deletion when filter is full', () => {
      const smallFilter = new CuckooFilter2(2, 2);
      smallFilter.insert('apple');
      smallFilter.insert('banana');
      smallFilter.insert('cherry');
      smallFilter.insert('date');
      expect(smallFilter.delete('apple')).toBe(true);
      expect(smallFilter.delete('banana')).toBe(true);
    });
  });

  describe('custom configuration', () => {
    it('should use custom capacity', () => {
      const customFilter = new CuckooFilter2(10);
      expect(customFilter.size).toBe(0);
    });

    it('should use custom bucket size', () => {
      const customFilter = new CuckooFilter2(10, 8);
      expect(customFilter.loadFactor()).toBe(0);
    });

    it('should use custom fingerprint size', () => {
      const customFilter = new CuckooFilter2(10, 4, 2);
      expect(customFilter.insert('apple')).toBe(true);
      expect(customFilter.contains('apple')).toBe(true);
    });

    it('should work with small capacity', () => {
      const smallFilter = new CuckooFilter2(4, 2);
      expect(smallFilter.insert('apple')).toBe(true);
      expect(smallFilter.insert('banana')).toBe(true);
      expect(smallFilter.contains('apple')).toBe(true);
      expect(smallFilter.contains('banana')).toBe(true);
    });
  });

  describe('false positive rate', () => {
    it('should have reasonable false positive rate', () => {
      const items: string[] = [];
      for (let i = 0; i < 100; i++) {
        items.push(`item-${i}`);
      }

      items.forEach(item => filter.insert(item));

      let falsePositives = 0;
      const testCount = 100;
      for (let i = 0; i < testCount; i++) {
        const testItem = `not-in-filter-${i}`;
        if (filter.contains(testItem)) {
          falsePositives++;
        }
      }

      const falsePositiveRate = falsePositives / testCount;
      expect(falsePositiveRate).toBeLessThan(0.5);
    });

    it('should not have false negatives', () => {
      const items = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
      items.forEach(item => filter.insert(item));

      items.forEach(item => {
        expect(filter.contains(item)).toBe(true);
      });
    });

    it('should handle empty strings', () => {
      expect(filter.insert('')).toBe(true);
      expect(filter.contains('')).toBe(true);
    });

    it('should handle long strings', () => {
      const longString = 'a'.repeat(1000);
      expect(filter.insert(longString)).toBe(true);
      expect(filter.contains(longString)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty filter operations', () => {
      expect(filter.contains('apple')).toBe(false);
      expect(filter.delete('apple')).toBe(false);
      expect(filter.loadFactor()).toBe(0);
      expect(filter.size).toBe(0);
    });

    it('should handle insert after delete', () => {
      filter.insert('apple');
      filter.delete('apple');
      expect(filter.insert('apple')).toBe(true);
      expect(filter.contains('apple')).toBe(true);
    });

    it('should handle multiple deletes of same item', () => {
      filter.insert('apple');
      expect(filter.delete('apple')).toBe(true);
      expect(filter.delete('apple')).toBe(false);
      expect(filter.delete('apple')).toBe(false);
    });

    it('should handle special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:\'",.<>/?`~';
      expect(filter.insert(specialChars)).toBe(true);
      expect(filter.contains(specialChars)).toBe(true);
      expect(filter.delete(specialChars)).toBe(true);
    });

    it('should handle unicode characters', () => {
      const unicode = 'Hello 世界 🌍';
      expect(filter.insert(unicode)).toBe(true);
      expect(filter.contains(unicode)).toBe(true);
    });

    it('should handle numbers as strings', () => {
      expect(filter.insert('123')).toBe(true);
      expect(filter.insert('456')).toBe(true);
      expect(filter.contains('123')).toBe(true);
      expect(filter.contains('456')).toBe(true);
    });

    it('should handle case sensitivity', () => {
      filter.insert('apple');
      expect(filter.contains('apple')).toBe(true);
      expect(filter.contains('APPLE')).toBe(false);
      expect(filter.contains('Apple')).toBe(false);
    });

    it('should handle capacity property', () => {
      const filter = new CuckooFilter2(100);
      expect(filter.capacity).toBeGreaterThan(0);
    });

    it('should handle delete', () => {
      const filter = new CuckooFilter2(100);
      filter.insert('hello');
      expect(filter.contains('hello')).toBe(true);
      expect(filter.delete('hello')).toBe(true);
      expect(filter.contains('hello')).toBe(false);
    });
  });

  it('should handle clear', () => {
    const filter = new CuckooFilter2(100);
    filter.insert('a');
    filter.insert('b');
    filter.clear();
    expect(filter.contains('a')).toBe(false);
    expect(filter.contains('b')).toBe(false);
  });
  it('should handle loadFactor', () => {
    const filter = new CuckooFilter2(100);
    expect(filter.loadFactor()).toBeGreaterThanOrEqual(0);
    filter.insert('test');
    expect(filter.loadFactor()).toBeGreaterThan(0);
  });
  it('should handle delete', () => {
    const filter = new CuckooFilter2(100);
    filter.insert('test');
    expect(filter.delete('test')).toBe(true);
    expect(filter.contains('test')).toBe(false);
  });
  it('should handle clear', () => {
    const filter = new CuckooFilter2(100);
    filter.insert('a');
    filter.insert('b');
    filter.clear();
    expect(filter.contains('a')).toBe(false);
    expect(filter.size).toBe(0);
  });
  it('should handle delete', () => {
    const filter = new CuckooFilter2(100);
    filter.insert('x');
    filter.insert('y');
    expect(filter.delete('x')).toBe(true);
    expect(filter.contains('x')).toBe(false);
    expect(filter.contains('y')).toBe(true);
  });
  it('should handle size property', () => {
    const filter = new CuckooFilter2(100);
    expect(filter.size).toBe(0);
    filter.insert('a');
    filter.insert('b');
    expect(filter.size).toBe(2);
  });
  it('should handle clear', () => {
    const filter = new CuckooFilter2(100);
    filter.insert('a');
    filter.insert('b');
    filter.clear();
    expect(filter.size).toBe(0);
  });
});
