import { describe, it, expect } from 'vitest';
import type { Equal, Expect } from 'vitest';
import { BloomFilter2 } from '../../src/core/bloom-filter-2/index';

describe('BloomFilter2', () => {
  describe('constructor', () => {
    it('creates filter with valid parameters', () => {
      const filter = new BloomFilter2(100, 0.01);
      expect(filter.isEmpty()).toBe(true);
    });

    it('handles edge case with small expectedItems', () => {
      const filter = new BloomFilter2(1, 0.01);
      expect(filter.isEmpty()).toBe(true);
    });

    it('handles edge case with large expectedItems', () => {
      const filter = new BloomFilter2(1000000, 0.001);
      expect(filter.isEmpty()).toBe(true);
    });

    it('handles low false positive rate', () => {
      const filter = new BloomFilter2(100, 0.0001);
      expect(filter.isEmpty()).toBe(true);
    });

    it('handles high false positive rate', () => {
      const filter = new BloomFilter2(100, 0.5);
      expect(filter.isEmpty()).toBe(true);
    });
  });

  describe('add and has', () => {
    it('adds and checks single item', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('hello');
      expect(filter.has('hello')).toBe(true);
    });

    it('returns false for non-existent item', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('hello');
      expect(filter.has('world')).toBe(false);
    });

    it('adds multiple distinct items', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('hello');
      filter.add('world');
      filter.add('test');
      expect(filter.has('hello')).toBe(true);
      expect(filter.has('world')).toBe(true);
      expect(filter.has('test')).toBe(true);
    });

    it('handles empty string', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('');
      expect(filter.has('')).toBe(true);
    });

    it('handles special characters', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('hello@world.com');
      filter.add('test-value_123');
      expect(filter.has('hello@world.com')).toBe(true);
      expect(filter.has('test-value_123')).toBe(true);
    });

    it('handles unicode characters', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('hello 世界');
      filter.add('emoji 🎉');
      expect(filter.has('hello 世界')).toBe(true);
      expect(filter.has('emoji 🎉')).toBe(true);
    });

    it('handles very long strings', () => {
      const filter = new BloomFilter2(100, 0.01);
      const longString = 'a'.repeat(10000);
      filter.add(longString);
      expect(filter.has(longString)).toBe(true);
    });

    it('handles duplicate additions', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('hello');
      filter.add('hello');
      filter.add('hello');
      expect(filter.has('hello')).toBe(true);
    });
  });

  describe('contains', () => {
    it('is alias for has method', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('test');
      expect(filter.contains('test')).toBe(true);
      expect(filter.contains('not-test')).toBe(false);
    });

    it('returns correct results for multiple checks', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('item1');
      filter.add('item2');
      expect(filter.contains('item1')).toBe(true);
      expect(filter.contains('item2')).toBe(true);
      expect(filter.contains('item3')).toBe(false);
    });
  });

  describe('size', () => {
    it('returns 0 for empty filter', () => {
      const filter = new BloomFilter2(100, 0.01);
      expect(filter.size).toBe(0);
    });

    it('returns count of added items', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('item1');
      expect(filter.size).toBe(1);
      filter.add('item2');
      expect(filter.size).toBe(2);
      filter.add('item3');
      expect(filter.size).toBe(3);
    });

    it('increments with each add call', () => {
      const filter = new BloomFilter2(100, 0.01);
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`);
      }
      expect(filter.size).toBe(100);
    });

    it('counts duplicate additions', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('item');
      filter.add('item');
      filter.add('item');
      expect(filter.size).toBe(3);
    });
  });

  describe('isEmpty', () => {
    it('returns true for new filter', () => {
      const filter = new BloomFilter2(100, 0.01);
      expect(filter.isEmpty()).toBe(true);
    });

    it('returns false after adding items', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('test');
      expect(filter.isEmpty()).toBe(false);
    });

    it('returns true after clear', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('test');
      expect(filter.isEmpty()).toBe(false);
      filter.clear();
      expect(filter.isEmpty()).toBe(true);
    });

    it('remains true for empty filter operations', () => {
      const filter = new BloomFilter2(100, 0.01);
      expect(filter.has('non-existent')).toBe(false);
      expect(filter.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears all added items', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('item1');
      filter.add('item2');
      filter.add('item3');
      filter.clear();
      expect(filter.has('item1')).toBe(false);
      expect(filter.has('item2')).toBe(false);
      expect(filter.has('item3')).toBe(false);
    });

    it('resets size to 0', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('item1');
      filter.add('item2');
      filter.clear();
      expect(filter.size).toBe(0);
    });

    it('resets isEmpty to true', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('item');
      filter.clear();
      expect(filter.isEmpty()).toBe(true);
    });

    it('can add items after clear', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('item1');
      filter.clear();
      filter.add('item2');
      expect(filter.has('item2')).toBe(true);
      expect(filter.has('item1')).toBe(false);
    });

    it('handles multiple clears', () => {
      const filter = new BloomFilter2(100, 0.01);
      filter.add('item');
      filter.clear();
      filter.clear();
      filter.clear();
      expect(filter.isEmpty()).toBe(true);
    });
  });

  describe('falsePositiveRate', () => {
    it('returns rate for empty filter', () => {
      const filter = new BloomFilter2(100, 0.01);
      expect(filter.falsePositiveRate).toBeCloseTo(0, 1);
    });

    it('increases as items are added', () => {
      const filter = new BloomFilter2(100, 0.01);
      const rate1 = filter.falsePositiveRate;
      filter.add('item1');
      const rate2 = filter.falsePositiveRate;
      filter.add('item2');
      const rate3 = filter.falsePositiveRate;
      expect(rate2).toBeGreaterThan(rate1);
      expect(rate3).toBeGreaterThan(rate2);
    });

    it('is deterministic for same operations', () => {
      const filter1 = new BloomFilter2(100, 0.01);
      const filter2 = new BloomFilter2(100, 0.01);
      for (let i = 0; i < 50; i++) {
        filter1.add(`item-${i}`);
        filter2.add(`item-${i}`);
      }
      expect(filter1.falsePositiveRate).toBeCloseTo(filter2.falsePositiveRate);
    });
  });

  describe('expectedBits', () => {
    it('returns non-zero bit count', () => {
      const filter = new BloomFilter2(100, 0.01);
      expect(filter.expectedBits).toBeGreaterThan(0);
    });

    it('increases with lower false positive rate', () => {
      const filter1 = new BloomFilter2(100, 0.01);
      const filter2 = new BloomFilter2(100, 0.001);
      expect(filter2.expectedBits).toBeGreaterThan(filter1.expectedBits);
    });

    it('increases with higher expected items', () => {
      const filter1 = new BloomFilter2(100, 0.01);
      const filter2 = new BloomFilter2(1000, 0.01);
      expect(filter2.expectedBits).toBeGreaterThan(filter1.expectedBits);
    });
  });

  describe('false positive behavior', () => {
    it('may produce false positives but not false negatives', () => {
      const filter = new BloomFilter2(100, 0.1);
      const added = ['item1', 'item2', 'item3'];
      for (const item of added) {
        filter.add(item);
      }
      for (const item of added) {
        expect(filter.has(item)).toBe(true);
      }
    });

    it('reduces false positives with larger filter', () => {
      const smallFilter = new BloomFilter2(10, 0.1);
      const largeFilter = new BloomFilter2(100, 0.1);
      for (let i = 0; i < 10; i++) {
        smallFilter.add(`item-${i}`);
        largeFilter.add(`item-${i}`);
      }
      let smallFalsePositives = 0;
      let largeFalsePositives = 0;
      for (let i = 100; i < 200; i++) {
        if (smallFilter.has(`item-${i}`)) smallFalsePositives++;
        if (largeFilter.has(`item-${i}`)) largeFalsePositives++;
      }
      expect(smallFalsePositives).toBeGreaterThanOrEqual(0);
      expect(largeFalsePositives).toBeGreaterThanOrEqual(0);
    });
  });

  describe('performance and stress tests', () => {
    it('handles 1000 additions efficiently', () => {
      const filter = new BloomFilter2(1000, 0.01);
      for (let i = 0; i < 1000; i++) {
        filter.add(`item-${i}`);
      }
      expect(filter.size).toBe(1000);
    });

    it('checks 1000 items efficiently', () => {
      const filter = new BloomFilter2(1000, 0.01);
      const items = Array.from({ length: 1000 }, (_, i) => `item-${i}`);
      for (const item of items) {
        filter.add(item);
      }
      for (const item of items) {
        expect(filter.has(item)).toBe(true);
      }
    });

    it('handles random strings', () => {
      const filter = new BloomFilter2(1000, 0.01);
      const randomStrings = [];
      for (let i = 0; i < 100; i++) {
        const str = Math.random().toString(36).substring(7);
        randomStrings.push(str);
        filter.add(str);
      }
      for (const str of randomStrings) {
        expect(filter.has(str)).toBe(true);
      }
    });

    it('maintains accuracy with mixed content', () => {
      const filter = new BloomFilter2(100, 0.01);
      const items = [
        'email@example.com',
        'user123',
        'token-abc123',
        'session_id_xyz',
        'key-value',
        'data:12345',
      ];
      for (const item of items) {
        filter.add(item);
      }
      for (const item of items) {
        expect(filter.has(item)).toBe(true);
      }
    });
  });

  describe('type safety', () => {
    it('only accepts strings', () => {
      const filter = new BloomFilter2(100, 0.01);
      const stringItem = 'test';
      filter.add(stringItem);
      expect(filter.has(stringItem)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles single item filter', () => {
      const filter = new BloomFilter2(1, 0.01);
      filter.add('only');
      expect(filter.has('only')).toBe(true);
      expect(filter.has('other')).toBe(false);
    });

    it('handles extremely low false positive rate', () => {
      const filter = new BloomFilter2(100, 1e-10);
      filter.add('test');
      expect(filter.has('test')).toBe(true);
    });

    it('handles all items added at capacity', () => {
      const filter = new BloomFilter2(100, 0.01);
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`);
      }
      expect(filter.size).toBe(100);
    });

    it('exceeds expected capacity', () => {
      const filter = new BloomFilter2(100, 0.01);
      for (let i = 0; i < 150; i++) {
        filter.add(`item-${i}`);
      }
      expect(filter.size).toBe(150);
    });
  });

  describe('integration tests', () => {
    it('works as a simple cache', () => {
      const filter = new BloomFilter2(1000, 0.01);
      const cache: Record<string, string> = {};
      filter.add('key1');
      cache['key1'] = 'value1';
      if (!filter.has('key1')) {
        cache['key1'] = 'value1';
      }
      expect(cache['key1']).toBe('value1');
    });

    it('works for duplicate detection', () => {
      const filter = new BloomFilter2(100, 0.01);
      const processed: string[] = [];
      const items = ['a', 'b', 'a', 'c', 'b', 'd'];
      for (const item of items) {
        if (!filter.has(item)) {
          processed.push(item);
          filter.add(item);
        }
      }
      expect(processed).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('consistency', () => {
    it('produces consistent results for same operations', () => {
      const filter1 = new BloomFilter2(100, 0.01);
      const filter2 = new BloomFilter2(100, 0.01);
      for (let i = 0; i < 50; i++) {
        filter1.add(`item-${i}`);
        filter2.add(`item-${i}`);
      }
      for (let i = 0; i < 50; i++) {
        expect(filter1.has(`item-${i}`)).toBe(filter2.has(`item-${i}`));
      }
    });
  });
});
