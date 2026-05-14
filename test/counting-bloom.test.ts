import { describe, it, expect, beforeEach } from 'vitest';
import { CountingBloomFilter } from '../src/core/counting-bloom/index.js';

describe('CountingBloomFilter', () => {
  let cbf: CountingBloomFilter<string>;

  beforeEach(() => {
    cbf = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.01 });
  });

  describe('constructor', () => {
    it('should create filter with default options', () => {
      const bf = new CountingBloomFilter<string>();
      expect(bf.size).toBe(0);
      expect(bf.isEmpty()).toBe(true);
      expect(bf.capacity).toBe(100);
      expect(typeof bf.numCounters).toBe('number');
      expect(typeof bf.numHashes).toBe('number');
    });

    it('should create filter with custom expectedItems', () => {
      const bf = new CountingBloomFilter<string>({ expectedItems: 50 });
      expect(bf.capacity).toBe(50);
      expect(bf.size).toBe(0);
    });

    it('should create filter with custom errorRate', () => {
      const bf = new CountingBloomFilter<string>({ errorRate: 0.05 });
      expect(bf.size).toBe(0);
      expect(bf.isEmpty()).toBe(true);
    });

    it('should create filter with custom hashFunctions', () => {
      const bf = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.01, hashFunctions: 5 });
      expect(bf.numHashes).toBe(5);
    });

    it('should create filter with all options', () => {
      const bf = new CountingBloomFilter<string>({ expectedItems: 200, errorRate: 0.02, hashFunctions: 3 });
      expect(bf.capacity).toBe(200);
      expect(bf.numHashes).toBe(3);
      expect(bf.size).toBe(0);
    });

    it('should handle zero expectedItems', () => {
      const bf = new CountingBloomFilter<string>({ expectedItems: 0 });
      expect(bf.capacity).toBe(0);
      expect(bf.size).toBe(0);
    });

    it('should handle very small errorRate', () => {
      const bf = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.0001 });
      expect(bf.size).toBe(0);
      expect(bf.numCounters).toBeGreaterThan(0);
    });

    it('should work with number type parameter', () => {
      const bf = new CountingBloomFilter<number>();
      bf.add(1);
      expect(bf.has(1)).toBe(true);
    });

    it('should work with object type parameter', () => {
      const bf = new CountingBloomFilter<{ id: number }>();
      bf.add({ id: 1 });
      expect(bf.has({ id: 1 })).toBe(true);
    });
  });

  describe('add', () => {
    it('should add single item', () => {
      cbf.add('hello');
      expect(cbf.size).toBe(1);
      expect(cbf.has('hello')).toBe(true);
    });

    it('should add multiple items', () => {
      cbf.add('a');
      cbf.add('b');
      cbf.add('c');
      expect(cbf.size).toBe(3);
      expect(cbf.has('a')).toBe(true);
      expect(cbf.has('b')).toBe(true);
      expect(cbf.has('c')).toBe(true);
    });

    it('should increment count for duplicate items', () => {
      cbf.add('hello');
      cbf.add('hello');
      cbf.add('hello');
      expect(cbf.size).toBe(3);
      expect(cbf.count('hello')).toBe(3);
    });

    it('should handle empty string', () => {
      cbf.add('');
      expect(cbf.size).toBe(1);
      expect(cbf.has('')).toBe(true);
    });

    it('should handle unicode', () => {
      cbf.add('héllo');
      expect(cbf.size).toBe(1);
      expect(cbf.has('héllo')).toBe(true);
    });

    it('should handle emoji', () => {
      cbf.add('🚀');
      expect(cbf.size).toBe(1);
      expect(cbf.has('🚀')).toBe(true);
    });

    it('should handle special characters', () => {
      cbf.add('test!@#$');
      expect(cbf.size).toBe(1);
      expect(cbf.has('test!@#$')).toBe(true);
    });

    it('should handle whitespace', () => {
      cbf.add('  test  ');
      expect(cbf.size).toBe(1);
      expect(cbf.has('  test  ')).toBe(true);
    });

    it('should be case sensitive', () => {
      cbf.add('hello');
      expect(cbf.has('hello')).toBe(true);
      expect(cbf.has('Hello')).toBe(false);
    });

    it('should handle large number of items', () => {
      for (let i = 0; i < 1000; i++) {
        cbf.add(`item-${i}`);
      }
      expect(cbf.size).toBe(1000);
    });
  });

  describe('remove', () => {
    it('should remove existing item', () => {
      cbf.add('hello');
      cbf.add('hello');
      expect(cbf.remove('hello')).toBe(true);
      expect(cbf.size).toBe(1);
      expect(cbf.count('hello')).toBe(1);
    });

    it('should return false for non-existent item', () => {
      expect(cbf.remove('hello')).toBe(false);
      expect(cbf.size).toBe(0);
    });

    it('should remove all occurrences', () => {
      cbf.add('hello');
      cbf.add('hello');
      cbf.add('hello');
      expect(cbf.count('hello')).toBe(3);

      cbf.remove('hello');
      cbf.remove('hello');
      cbf.remove('hello');

      expect(cbf.count('hello')).toBe(0);
      expect(cbf.has('hello')).toBe(false);
    });

    it('should handle removing once added item', () => {
      cbf.add('single');
      expect(cbf.remove('single')).toBe(true);
      expect(cbf.has('single')).toBe(false);
      expect(cbf.remove('single')).toBe(false);
    });

    it('should handle empty string', () => {
      cbf.add('');
      expect(cbf.remove('')).toBe(true);
      expect(cbf.has('')).toBe(false);
    });

    it('should handle unicode', () => {
      cbf.add('héllo');
      expect(cbf.remove('héllo')).toBe(true);
      expect(cbf.has('héllo')).toBe(false);
    });

    it('should handle emoji', () => {
      cbf.add('🚀');
      expect(cbf.remove('🚀')).toBe(true);
      expect(cbf.has('🚀')).toBe(false);
    });

    it.skip('should decrement size when removing', () => {
      cbf.add('a');
      cbf.add('b');
      expect(cbf.size).toBe(2);
      cbf.remove('a');
      expect(cbf.size).toBe(1);
    });
  });

  describe('has', () => {
    it('should return false for non-existent item', () => {
      expect(cbf.has('hello')).toBe(false);
    });

    it('should return true for added item', () => {
      cbf.add('hello');
      expect(cbf.has('hello')).toBe(true);
    });

    it('should return true after multiple adds', () => {
      cbf.add('hello');
      cbf.add('hello');
      cbf.add('hello');
      expect(cbf.has('hello')).toBe(true);
    });

    it('should return false after removing all occurrences', () => {
      cbf.add('hello');
      cbf.add('hello');
      cbf.remove('hello');
      cbf.remove('hello');
      expect(cbf.has('hello')).toBe(false);
    });

    it('should be false for similar items', () => {
      cbf.add('hello');
      expect(cbf.has('hell')).toBe(false);
      expect(cbf.has('hello!')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(cbf.has('')).toBe(false);
      cbf.add('');
      expect(cbf.has('')).toBe(true);
    });

    it('should handle unicode', () => {
      expect(cbf.has('héllo')).toBe(false);
      cbf.add('héllo');
      expect(cbf.has('héllo')).toBe(true);
    });

    it('should handle emoji', () => {
      expect(cbf.has('🚀')).toBe(false);
      cbf.add('🚀');
      expect(cbf.has('🚀')).toBe(true);
    });

    it('should be case sensitive', () => {
      cbf.add('hello');
      expect(cbf.has('hello')).toBe(true);
      expect(cbf.has('Hello')).toBe(false);
      expect(cbf.has('HELLO')).toBe(false);
    });
  });

  describe('count', () => {
    it('should return 0 for non-existent item', () => {
      expect(cbf.count('hello')).toBe(0);
    });

    it('should return 1 for single add', () => {
      cbf.add('hello');
      expect(cbf.count('hello')).toBe(1);
    });

    it('should return count for multiple adds', () => {
      cbf.add('hello');
      cbf.add('hello');
      cbf.add('hello');
      expect(cbf.count('hello')).toBe(3);
    });

    it('should decrement after remove', () => {
      cbf.add('hello');
      cbf.add('hello');
      cbf.add('hello');
      expect(cbf.count('hello')).toBe(3);
      cbf.remove('hello');
      expect(cbf.count('hello')).toBe(2);
    });

    it('should return 0 after removing all', () => {
      cbf.add('hello');
      cbf.add('hello');
      cbf.remove('hello');
      cbf.remove('hello');
      expect(cbf.count('hello')).toBe(0);
    });

    it('should handle empty string', () => {
      expect(cbf.count('')).toBe(0);
      cbf.add('');
      expect(cbf.count('')).toBe(1);
    });

    it('should handle unicode', () => {
      expect(cbf.count('héllo')).toBe(0);
      cbf.add('héllo');
      cbf.add('héllo');
      expect(cbf.count('héllo')).toBe(2);
    });

    it('should handle emoji', () => {
      expect(cbf.count('🚀')).toBe(0);
      cbf.add('🚀');
      cbf.add('🚀');
      cbf.add('🚀');
      expect(cbf.count('🚀')).toBe(3);
    });

    it.skip('should handle count with update', () => {
      cbf.add('test');
      cbf.update('test', 5);
      expect(cbf.count('test')).toBe(6);
    });
  });

  describe('update', () => {
    it('should increment count with positive delta', () => {
      cbf.add('hello');
      cbf.update('hello', 5);
      expect(cbf.count('hello')).toBe(6);
    });

    it('should decrement count with negative delta', () => {
      cbf.add('hello');
      cbf.add('hello');
      cbf.add('hello');
      expect(cbf.count('hello')).toBe(3);
      cbf.update('hello', -2);
      expect(cbf.count('hello')).toBe(1);
    });

    it('should not go below zero with negative delta', () => {
      cbf.add('hello');
      cbf.update('hello', -10);
      expect(cbf.count('hello')).toBe(0);
    });

    it('should work with zero delta', () => {
      cbf.add('hello');
      cbf.add('hello');
      expect(cbf.count('hello')).toBe(2);
      cbf.update('hello', 0);
      expect(cbf.count('hello')).toBe(2);
    });

    it('should handle non-existent item with positive delta', () => {
      cbf.update('hello', 3);
      expect(cbf.count('hello')).toBe(3);
    });

    it('should handle non-existent item with negative delta', () => {
      cbf.update('hello', -5);
      expect(cbf.count('hello')).toBe(0);
    });

    it('should handle large positive delta', () => {
      cbf.add('test');
      cbf.update('test', 100);
      expect(cbf.count('test')).toBe(101);
    });

    it('should handle empty string', () => {
      cbf.update('', 5);
      expect(cbf.count('')).toBe(5);
    });

    it('should handle unicode', () => {
      cbf.update('héllo', 10);
      expect(cbf.count('héllo')).toBe(10);
    });

    it('should handle emoji', () => {
      cbf.update('🚀', 7);
      expect(cbf.count('🚀')).toBe(7);
    });

    it.skip('should increment size with positive delta', () => {
      cbf.add('a');
      expect(cbf.size).toBe(1);
      cbf.update('a', 5);
      expect(cbf.size).toBe(6);
    });

    it.skip('should not change size with negative delta', () => {
      cbf.add('a');
      cbf.add('a');
      cbf.add('a');
      expect(cbf.size).toBe(3);
      cbf.update('a', -2);
      expect(cbf.size).toBe(3);
    });
  });

  describe('expectedFalsePositiveRate', () => {
    it('should be 0 for empty filter', () => {
      expect(cbf.expectedFalsePositiveRate()).toBe(0);
    });

    it('should increase after adding items', () => {
      expect(cbf.expectedFalsePositiveRate()).toBe(0);
      cbf.add('a');
      const rate1 = cbf.expectedFalsePositiveRate();
      expect(rate1).toBeGreaterThan(0);
      expect(rate1).toBeLessThan(1);

      cbf.add('b');
      cbf.add('c');
      const rate2 = cbf.expectedFalsePositiveRate();
      expect(rate2).toBeGreaterThan(rate1);
      expect(rate2).toBeLessThan(1);
    });

    it('should be number type', () => {
      expect(typeof cbf.expectedFalsePositiveRate()).toBe('number');
    });

    it('should decrease after removing items', () => {
      cbf.add('a');
      cbf.add('b');
      cbf.add('c');
      const rate1 = cbf.expectedFalsePositiveRate();

      cbf.remove('a');
      cbf.remove('b');
      const rate2 = cbf.expectedFalsePositiveRate();

      expect(rate2).toBeLessThan(rate1);
    });

    it('should return 0 after clearing', () => {
      cbf.add('a');
      cbf.add('b');
      expect(cbf.expectedFalsePositiveRate()).toBeGreaterThan(0);

      cbf.clear();
      expect(cbf.expectedFalsePositiveRate()).toBe(0);
    });

    it.skip('should handle duplicate items correctly', () => {
      cbf.add('a');
      cbf.add('a');
      cbf.add('a');
      const rate = cbf.expectedFalsePositiveRate();
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThan(1);
    });
  });

  describe('fillRatio', () => {
    it('should be 0 for empty filter', () => {
      expect(cbf.fillRatio()).toBe(0);
    });

    it('should increase after adding items', () => {
      const ratio1 = cbf.fillRatio();
      expect(ratio1).toBe(0);

      cbf.add('a');
      const ratio2 = cbf.fillRatio();
      expect(ratio2).toBeGreaterThan(ratio1);

      cbf.add('b');
      cbf.add('c');
      const ratio3 = cbf.fillRatio();
      expect(ratio3).toBeGreaterThan(ratio2);
    });

    it('should be number type', () => {
      expect(typeof cbf.fillRatio()).toBe('number');
    });

    it('should be between 0 and 1', () => {
      cbf.add('a');
      cbf.add('b');
      const ratio = cbf.fillRatio();
      expect(ratio).toBeGreaterThanOrEqual(0);
      expect(ratio).toBeLessThanOrEqual(1);
    });

    it('should not change for duplicates', () => {
      cbf.add('a');
      const ratio1 = cbf.fillRatio();

      cbf.add('a');
      cbf.add('a');
      const ratio2 = cbf.fillRatio();

      expect(ratio2).toBe(ratio1);
    });

    it('should return 0 after clearing', () => {
      cbf.add('a');
      cbf.add('b');
      expect(cbf.fillRatio()).toBeGreaterThan(0);

      cbf.clear();
      expect(cbf.fillRatio()).toBe(0);
    });

    it.skip('should decrease after removing all occurrences', () => {
      cbf.add('a');
      cbf.add('b');
      const ratio1 = cbf.fillRatio();

      cbf.remove('a');
      cbf.remove('b');
      const ratio2 = cbf.fillRatio();

      expect(ratio2).toBeLessThan(ratio1);
    });
  });

  describe('capacity', () => {
    it('should return expectedItems from constructor', () => {
      const bf = new CountingBloomFilter<string>({ expectedItems: 50 });
      expect(bf.capacity).toBe(50);
    });

    it('should return default capacity of 100', () => {
      const bf = new CountingBloomFilter<string>();
      expect(bf.capacity).toBe(100);
    });

    it('should be number type', () => {
      expect(typeof cbf.capacity).toBe('number');
    });

    it('should handle zero capacity', () => {
      const bf = new CountingBloomFilter<string>({ expectedItems: 0 });
      expect(bf.capacity).toBe(0);
    });

    it('should handle large capacity', () => {
      const bf = new CountingBloomFilter<string>({ expectedItems: 10000 });
      expect(bf.capacity).toBe(10000);
    });
  });

  describe('size', () => {
    it('should be 0 initially', () => {
      expect(cbf.size).toBe(0);
    });

    it('should increment with each add', () => {
      expect(cbf.size).toBe(0);
      cbf.add('a');
      expect(cbf.size).toBe(1);
      cbf.add('b');
      expect(cbf.size).toBe(2);
      cbf.add('c');
      expect(cbf.size).toBe(3);
    });

    it('should count duplicates', () => {
      cbf.add('same');
      cbf.add('same');
      cbf.add('same');
      expect(cbf.size).toBe(3);
    });

    it('should be number type', () => {
      expect(typeof cbf.size).toBe('number');
    });

    it('should reset to 0 after clear', () => {
      cbf.add('a');
      cbf.add('b');
      cbf.add('c');
      expect(cbf.size).toBe(3);

      cbf.clear();
      expect(cbf.size).toBe(0);
    });

    it('should handle large number of items', () => {
      for (let i = 0; i < 1000; i++) {
        cbf.add(`item-${i}`);
      }
      expect(cbf.size).toBe(1000);
    });
  });

  describe('numHashes', () => {
    it('should return hash functions count', () => {
      const bf = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.01, hashFunctions: 7 });
      expect(bf.numHashes).toBe(7);
    });

    it('should calculate default hash functions', () => {
      const bf = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.01 });
      expect(bf.numHashes).toBeGreaterThan(0);
      expect(typeof bf.numHashes).toBe('number');
    });

    it('should be at least 1', () => {
      const bf = new CountingBloomFilter<string>();
      expect(bf.numHashes).toBeGreaterThanOrEqual(1);
    });

    it('should be number type', () => {
      expect(typeof cbf.numHashes).toBe('number');
    });
  });

  describe('numCounters', () => {
    it('should return number of counters', () => {
      const bf = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.01 });
      expect(bf.numCounters).toBeGreaterThan(0);
    });

    it('should be number type', () => {
      expect(typeof cbf.numCounters).toBe('number');
    });

    it('should increase with larger expectedItems', () => {
      const bf1 = new CountingBloomFilter<string>({ expectedItems: 50 });
      const bf2 = new CountingBloomFilter<string>({ expectedItems: 200 });
      expect(bf2.numCounters).toBeGreaterThan(bf1.numCounters);
    });

    it('should decrease with larger errorRate', () => {
      const bf1 = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.001 });
      const bf2 = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.1 });
      expect(bf2.numCounters).toBeLessThan(bf1.numCounters);
    });
  });

  describe('clear', () => {
    it('should clear empty filter', () => {
      cbf.clear();
      expect(cbf.size).toBe(0);
      expect(cbf.isEmpty()).toBe(true);
    });

    it('should clear single item', () => {
      cbf.add('hello');
      cbf.clear();
      expect(cbf.size).toBe(0);
      expect(cbf.has('hello')).toBe(false);
      expect(cbf.count('hello')).toBe(0);
    });

    it('should clear multiple items', () => {
      cbf.add('a');
      cbf.add('b');
      cbf.add('c');
      cbf.clear();
      expect(cbf.size).toBe(0);
      expect(cbf.has('a')).toBe(false);
      expect(cbf.has('b')).toBe(false);
      expect(cbf.has('c')).toBe(false);
    });

    it('should clear duplicates', () => {
      cbf.add('same');
      cbf.add('same');
      cbf.add('same');
      cbf.clear();
      expect(cbf.size).toBe(0);
      expect(cbf.count('same')).toBe(0);
    });

    it('should reset false positive rate', () => {
      cbf.add('a');
      expect(cbf.expectedFalsePositiveRate()).toBeGreaterThan(0);
      cbf.clear();
      expect(cbf.expectedFalsePositiveRate()).toBe(0);
    });

    it('should reset fill ratio', () => {
      cbf.add('a');
      expect(cbf.fillRatio()).toBeGreaterThan(0);
      cbf.clear();
      expect(cbf.fillRatio()).toBe(0);
    });

    it('should allow operations after clear', () => {
      cbf.add('a');
      cbf.clear();
      cbf.add('b');
      expect(cbf.size).toBe(1);
      expect(cbf.has('b')).toBe(true);
    });

    it('should clear multiple times', () => {
      cbf.add('a');
      cbf.clear();
      cbf.clear();
      cbf.clear();
      expect(cbf.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('should be true initially', () => {
      expect(cbf.isEmpty()).toBe(true);
    });

    it('should be false after add', () => {
      cbf.add('hello');
      expect(cbf.isEmpty()).toBe(false);
    });

    it('should be false after multiple adds', () => {
      cbf.add('a');
      cbf.add('b');
      cbf.add('c');
      expect(cbf.isEmpty()).toBe(false);
    });

    it('should be boolean type', () => {
      expect(typeof cbf.isEmpty()).toBe('boolean');
    });

    it('should be true after clearing', () => {
      cbf.add('a');
      cbf.add('b');
      expect(cbf.isEmpty()).toBe(false);
      cbf.clear();
      expect(cbf.isEmpty()).toBe(true);
    });

    it('should be true after removing all items', () => {
      cbf.add('a');
      cbf.add('b');
      cbf.remove('a');
      cbf.remove('b');
      expect(cbf.isEmpty()).toBe(true);
    });

    it.skip('should be true after removing all duplicates', () => {
      cbf.add('a');
      cbf.add('a');
      cbf.remove('a');
      cbf.remove('a');
      expect(cbf.isEmpty()).toBe(true);
    });
  });

  describe('clone', () => {
    it('should clone empty filter', () => {
      const cloned = cbf.clone();
      expect(cloned.size).toBe(0);
      expect(cloned.isEmpty()).toBe(true);
      expect(cloned).not.toBe(cbf);
    });

    it('should clone filter with items', () => {
      cbf.add('a');
      cbf.add('b');
      cbf.add('c');

      const cloned = cbf.clone();
      expect(cloned.size).toBe(3);
      expect(cloned.has('a')).toBe(true);
      expect(cloned.has('b')).toBe(true);
      expect(cloned.has('c')).toBe(true);
    });

    it('should clone with duplicate counts', () => {
      cbf.add('same');
      cbf.add('same');
      cbf.add('same');

      const cloned = cbf.clone();
      expect(cloned.count('same')).toBe(3);
    });

    it('should create independent clone', () => {
      cbf.add('a');
      cbf.add('b');

      const cloned = cbf.clone();
      cloned.add('c');
      cloned.remove('a');

      expect(cbf.size).toBe(2);
      expect(cbf.has('a')).toBe(true);
      expect(cbf.has('c')).toBe(false);
      expect(cloned.size).toBe(2);
      expect(cloned.has('a')).toBe(false);
      expect(cloned.has('c')).toBe(true);
    });

    it('should preserve capacity', () => {
      const cloned = cbf.clone();
      expect(cloned.capacity).toBe(cbf.capacity);
    });

    it('should preserve errorRate', () => {
      const cloned = cbf.clone();
      expect(cloned.numHashes).toBe(cbf.numHashes);
    });

    it('should clone large filter', () => {
      for (let i = 0; i < 1000; i++) {
        cbf.add(`item-${i}`);
      }

      const cloned = cbf.clone();
      expect(cloned.size).toBe(1000);
      expect(cloned.equals(cbf)).toBe(true);
    });
  });

  describe('merge', () => {
    it('should merge two empty filters', () => {
      const bf1 = new CountingBloomFilter<string>();
      const bf2 = new CountingBloomFilter<string>();

      const result = bf1.merge(bf2);
      expect(result.size).toBe(0);
    });

    it('should merge filter with empty filter', () => {
      cbf.add('a');
      cbf.add('b');
      const bf2 = new CountingBloomFilter<string>();

      const result = cbf.merge(bf2);
      expect(result.size).toBe(2);
      expect(result.has('a')).toBe(true);
      expect(result.has('b')).toBe(true);
    });

    it('should merge two filters with items', () => {
      const bf1 = new CountingBloomFilter<string>();
      bf1.add('a');
      bf1.add('b');

      const bf2 = new CountingBloomFilter<string>();
      bf2.add('c');
      bf2.add('d');

      const result = bf1.merge(bf2);
      expect(result.size).toBe(4);
      expect(result.has('a')).toBe(true);
      expect(result.has('b')).toBe(true);
      expect(result.has('c')).toBe(true);
      expect(result.has('d')).toBe(true);
    });

    it('should sum counts for same items', () => {
      const bf1 = new CountingBloomFilter<string>();
      bf1.add('same');
      bf1.add('same');

      const bf2 = new CountingBloomFilter<string>();
      bf2.add('same');

      const result = bf1.merge(bf2);
      expect(result.count('same')).toBe(3);
    });

    it('should not modify original filters', () => {
      const bf1 = new CountingBloomFilter<string>();
      bf1.add('a');
      bf1.add('b');

      const bf2 = new CountingBloomFilter<string>();
      bf2.add('c');

      bf1.merge(bf2);
      expect(bf1.size).toBe(2);
      expect(bf1.has('c')).toBe(false);
      expect(bf2.size).toBe(1);
    });

    it('should throw error for different numCounters', () => {
      const bf1 = new CountingBloomFilter<string>({ expectedItems: 100 });
      const bf2 = new CountingBloomFilter<string>({ expectedItems: 200 });

      expect(() => bf1.merge(bf2)).toThrow('Cannot merge filters with different number of counters');
    });

    it('should throw error for different numHashes', () => {
      const bf1 = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.01, hashFunctions: 3 });
      const bf2 = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.01, hashFunctions: 5 });

      expect(() => bf1.merge(bf2)).toThrow('Cannot merge filters with different number of hash functions');
    });

    it('should merge filters with same configuration', () => {
      const bf1 = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.01 });
      const bf2 = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.01 });

      bf1.add('a');
      bf2.add('b');

      const result = bf1.merge(bf2);
      expect(result.size).toBe(2);
    });
  });

  describe('equals', () => {
    it('should return true for empty filters', () => {
      const bf1 = new CountingBloomFilter<string>();
      const bf2 = new CountingBloomFilter<string>();
      expect(bf1.equals(bf2)).toBe(true);
    });

    it('should return true for same filter', () => {
      expect(cbf.equals(cbf)).toBe(true);
    });

    it('should return true for identical filters', () => {
      const bf1 = new CountingBloomFilter<string>();
      bf1.add('a');
      bf1.add('b');

      const bf2 = new CountingBloomFilter<string>();
      bf2.add('a');
      bf2.add('b');

      expect(bf1.equals(bf2)).toBe(true);
    });

    it('should return false for different sizes', () => {
      const bf1 = new CountingBloomFilter<string>();
      bf1.add('a');

      const bf2 = new CountingBloomFilter<string>();
      bf2.add('a');
      bf2.add('b');

      expect(bf1.equals(bf2)).toBe(false);
    });

    it('should return false for different items', () => {
      const bf1 = new CountingBloomFilter<string>();
      bf1.add('a');
      bf1.add('b');

      const bf2 = new CountingBloomFilter<string>();
      bf2.add('c');
      bf2.add('d');

      expect(bf1.equals(bf2)).toBe(false);
    });

    it('should return false for different counts', () => {
      const bf1 = new CountingBloomFilter<string>();
      bf1.add('same');
      bf1.add('same');

      const bf2 = new CountingBloomFilter<string>();
      bf2.add('same');

      expect(bf1.equals(bf2)).toBe(false);
    });

    it('should return false for different numCounters', () => {
      const bf1 = new CountingBloomFilter<string>({ expectedItems: 100 });
      const bf2 = new CountingBloomFilter<string>({ expectedItems: 200 });

      expect(bf1.equals(bf2)).toBe(false);
    });

    it('should return false for different numHashes', () => {
      const bf1 = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.01, hashFunctions: 3 });
      const bf2 = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.01, hashFunctions: 5 });

      expect(bf1.equals(bf2)).toBe(false);
    });

    it('should not modify either filter', () => {
      const bf1 = new CountingBloomFilter<string>();
      bf1.add('a');
      bf1.add('b');

      const bf2 = new CountingBloomFilter<string>();
      bf2.add('a');
      bf2.add('b');

      bf1.equals(bf2);
      expect(bf1.size).toBe(2);
      expect(bf2.size).toBe(2);
    });
  });

  describe('integration', () => {
    it('should handle add/remove cycle', () => {
      cbf.add('a');
      expect(cbf.has('a')).toBe(true);
      cbf.remove('a');
      expect(cbf.has('a')).toBe(false);
      cbf.add('b');
      expect(cbf.has('b')).toBe(true);
    });

    it('should handle add/update/remove cycle', () => {
      cbf.add('test');
      expect(cbf.count('test')).toBe(1);
      cbf.update('test', 5);
      expect(cbf.count('test')).toBe(6);
      cbf.remove('test');
      expect(cbf.count('test')).toBe(5);
    });

    it('should handle duplicate removal', () => {
      cbf.add('item');
      cbf.add('item');
      cbf.add('item');
      expect(cbf.count('item')).toBe(3);
      cbf.remove('item');
      cbf.remove('item');
      expect(cbf.count('item')).toBe(1);
    });

    it('should clone and modify independently', () => {
      cbf.add('a');
      cbf.add('b');

      const cloned = cbf.clone();
      cloned.add('c');
      cloned.remove('a');

      expect(cbf.has('a')).toBe(true);
      expect(cbf.has('c')).toBe(false);
      expect(cloned.has('a')).toBe(false);
      expect(cloned.has('c')).toBe(true);
    });

    it('should merge multiple filters', () => {
      const bf1 = new CountingBloomFilter<string>();
      bf1.add('a');
      bf1.add('b');

      const bf2 = new CountingBloomFilter<string>();
      bf2.add('b');
      bf2.add('c');

      const bf3 = new CountingBloomFilter<string>();
      bf3.add('c');
      bf3.add('d');

      const result1 = bf1.merge(bf2);
      const result2 = result1.merge(bf3);
      expect(result2.size).toBe(6);
      expect(result2.has('a')).toBe(true);
      expect(result2.has('b')).toBe(true);
      expect(result2.has('c')).toBe(true);
      expect(result2.has('d')).toBe(true);
    });

    it('should clear and reuse', () => {
      cbf.add('a');
      cbf.add('b');
      expect(cbf.size).toBe(2);

      cbf.clear();
      expect(cbf.size).toBe(0);

      cbf.add('c');
      cbf.add('d');
      expect(cbf.size).toBe(2);
      expect(cbf.has('c')).toBe(true);
      expect(cbf.has('d')).toBe(true);
    });

    it('should maintain no false negatives', () => {
      const items = ['a', 'b', 'c', 'd', 'e'];
      items.forEach(item => cbf.add(item));
      items.forEach(item => {
        expect(cbf.has(item)).toBe(true);
      });
    });

    it('should handle rapid operations', () => {
      for (let i = 0; i < 100; i++) {
        cbf.add(`item-${i}`);
      }
      for (let i = 0; i < 50; i++) {
        cbf.remove(`item-${i}`);
      }
      expect(cbf.size).toBe(50);
      for (let i = 50; i < 100; i++) {
        expect(cbf.has(`item-${i}`)).toBe(true);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      cbf.add(longString);
      expect(cbf.has(longString)).toBe(true);
    });

    it('should handle null-like values in objects', () => {
      const bf = new CountingBloomFilter<{ id: number | null }>();
      bf.add({ id: 1 });
      bf.add({ id: null });
      expect(bf.has({ id: 1 })).toBe(true);
      expect(bf.has({ id: null })).toBe(true);
    });

    it('should handle undefined in objects', () => {
      const bf = new CountingBloomFilter<{ id: number | undefined }>();
      bf.add({ id: 1 });
      bf.add({ id: undefined });
      expect(bf.has({ id: 1 })).toBe(true);
      expect(bf.has({ id: undefined })).toBe(true);
    });

    it('should handle zero capacity', () => {
      const bf = new CountingBloomFilter<string>({ expectedItems: 0 });
      bf.add('test');
      expect(bf.size).toBe(1);
    });

    it('should handle very large capacity', () => {
      const bf = new CountingBloomFilter<string>({ expectedItems: 1000000 });
      bf.add('test');
      expect(bf.has('test')).toBe(true);
    });

    it('should handle very small error rate', () => {
      const bf = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.000001 });
      bf.add('test');
      expect(bf.has('test')).toBe(true);
    });

    it('should handle very large error rate', () => {
      const bf = new CountingBloomFilter<string>({ expectedItems: 100, errorRate: 0.5 });
      bf.add('test');
      expect(bf.has('test')).toBe(true);
    });

    it.skip('should handle negative delta in update', () => {
      cbf.add('test');
      cbf.add('test');
      cbf.update('test', -5);
      expect(cbf.count('test')).toBe(0);
    });
  });
});
