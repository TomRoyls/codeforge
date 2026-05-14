import { describe, it, expect, beforeEach } from 'vitest';
import { BloomFilter } from '../src/core/bloom-filter-3/index.js';

describe('BloomFilter', () => {
  let bf: BloomFilter;

  beforeEach(() => {
    bf = new BloomFilter();
  });

  describe('constructor', () => {
    it('should create with default options', () => {
      expect(bf.capacity).toBe(100);
      expect(bf.size).toBe(0);
      expect(bf.isEmpty()).toBe(true);
    });

    it('should create with custom capacity', () => {
      const bf2 = new BloomFilter({ capacity: 50 });
      expect(bf2.capacity).toBe(50);
      expect(bf2.size).toBe(0);
    });

    it('should create with custom false positive rate', () => {
      const bf2 = new BloomFilter({ falsePositiveRate: 0.05 });
      expect(bf2.capacity).toBe(100);
      expect(bf2.size).toBe(0);
    });

    it('should create with bitCount only', () => {
      const bf2 = new BloomFilter({ bitCount: 100 });
      expect(bf2.bitCount).toBe(100);
      expect(bf2.capacity).toBe(100);
    });

    it('should create with hashCount only', () => {
      const bf2 = new BloomFilter({ hashCount: 5 });
      expect(bf2.hashCount).toBe(5);
      expect(bf2.capacity).toBe(100);
    });

    it('should create with both bitCount and hashCount', () => {
      const bf2 = new BloomFilter({ bitCount: 100, hashCount: 5 });
      expect(bf2.bitCount).toBe(100);
      expect(bf2.hashCount).toBe(5);
    });

    it('should create with custom hash function', () => {
      const customHash = (element: string, seed: number): number => {
        return element.length + seed;
      };
      const bf2 = new BloomFilter({ hashFunction: customHash });
      bf2.add('test');
      expect(bf2.has('test')).toBe(true);
    });

    it('should calculate bitCount and hashCount from capacity and FPR', () => {
      const bf2 = new BloomFilter({ capacity: 1000, falsePositiveRate: 0.01 });
      expect(bf2.bitCount).toBeGreaterThan(0);
      expect(bf2.hashCount).toBeGreaterThan(0);
      expect(bf2.capacity).toBe(1000);
    });

    it('should handle zero capacity', () => {
      const bf2 = new BloomFilter({ capacity: 0 });
      expect(bf2.capacity).toBe(0);
      expect(bf2.size).toBe(0);
    });

    it('should handle small capacity', () => {
      const bf2 = new BloomFilter({ capacity: 1 });
      expect(bf2.capacity).toBe(1);
      expect(bf2.bitCount).toBeGreaterThan(0);
    });

    it('should handle large capacity', () => {
      const bf2 = new BloomFilter({ capacity: 10000 });
      expect(bf2.capacity).toBe(10000);
      expect(bf2.bitCount).toBeGreaterThan(0);
    });
  });

  describe('add', () => {
    it('should add single element', () => {
      bf.add('hello');
      expect(bf.has('hello')).toBe(true);
      expect(bf.size).toBe(1);
    });

    it('should add multiple elements', () => {
      bf.add('hello');
      bf.add('world');
      bf.add('test');
      expect(bf.has('hello')).toBe(true);
      expect(bf.has('world')).toBe(true);
      expect(bf.has('test')).toBe(true);
      expect(bf.size).toBe(3);
    });

    it('should handle duplicate adds', () => {
      bf.add('hello');
      bf.add('hello');
      expect(bf.has('hello')).toBe(true);
      expect(bf.size).toBe(2);
    });

    it('should add empty string', () => {
      bf.add('');
      expect(bf.has('')).toBe(true);
      expect(bf.size).toBe(1);
    });

    it('should add long strings', () => {
      const longStr = 'a'.repeat(1000);
      bf.add(longStr);
      expect(bf.has(longStr)).toBe(true);
      expect(bf.size).toBe(1);
    });

    it('should add special characters', () => {
      bf.add('hello@world!');
      bf.add('test#123');
      expect(bf.has('hello@world!')).toBe(true);
      expect(bf.has('test#123')).toBe(true);
      expect(bf.size).toBe(2);
    });

    it('should add unicode strings', () => {
      bf.add('hello世界');
      bf.add('привет');
      expect(bf.has('hello世界')).toBe(true);
      expect(bf.has('привет')).toBe(true);
      expect(bf.size).toBe(2);
    });
  });

  describe('has', () => {
    it('should return true for added element', () => {
      bf.add('hello');
      expect(bf.has('hello')).toBe(true);
    });

    it('should return false for non-existent element', () => {
      expect(bf.has('hello')).toBe(false);
    });

    it('should work as alias for mightContain', () => {
      bf.add('test');
      expect(bf.has('test')).toBe(bf.mightContain('test'));
    });

    it('should handle multiple adds and checks', () => {
      bf.add('a');
      bf.add('b');
      bf.add('c');
      expect(bf.has('a')).toBe(true);
      expect(bf.has('b')).toBe(true);
      expect(bf.has('c')).toBe(true);
      expect(bf.has('d')).toBe(false);
    });
  });

  describe('mightContain', () => {
    it('should return true for added element', () => {
      bf.add('hello');
      expect(bf.mightContain('hello')).toBe(true);
    });

    it('should return false for non-existent element', () => {
      expect(bf.mightContain('hello')).toBe(false);
    });

    it('should have small false positive rate under capacity', () => {
      const bf2 = new BloomFilter({ capacity: 100, falsePositiveRate: 0.01 });
      for (let i = 0; i < 100; i++) {
        bf2.add(`element${i}`);
      }
      let falsePositives = 0;
      for (let i = 100; i < 200; i++) {
        if (bf2.mightContain(`element${i}`)) {
          falsePositives++;
        }
      }
      expect(falsePositives).toBeLessThan(10);
    });

    it('should handle hash collisions gracefully', () => {
      const bf2 = new BloomFilter({ capacity: 10, bitCount: 50 });
      bf2.add('test');
      const mightContain = bf2.mightContain('test');
      expect(mightContain).toBe(true);
    });
  });

  describe('falsePositiveRate getter', () => {
    it.skip('should return 1 for empty filter with zero bitCount', () => {
      const bf2 = new BloomFilter({ capacity: 0 });
      expect(bf2.falsePositiveRate).toBe(1);
    });

    it('should be between 0 and 1 for empty filter', () => {
      const bf2 = new BloomFilter({ capacity: 100 });
      expect(bf2.falsePositiveRate).toBeGreaterThanOrEqual(0);
      expect(bf2.falsePositiveRate).toBeLessThanOrEqual(1);
    });

    it('should be closer to 1 as filter fills up', () => {
      const bf2 = new BloomFilter({ capacity: 100, falsePositiveRate: 0.01 });
      for (let i = 0; i < 50; i++) {
        bf2.add(`element${i}`);
      }
      const fpr1 = bf2.falsePositiveRate;
      for (let i = 50; i < 100; i++) {
        bf2.add(`element${i}`);
      }
      const fpr2 = bf2.falsePositiveRate;
      expect(fpr2).toBeGreaterThan(fpr1);
    });

    it('should return number between 0 and 1', () => {
      const bf2 = new BloomFilter({ capacity: 100 });
      for (let i = 0; i < 50; i++) {
        bf2.add(`element${i}`);
      }
      expect(bf2.falsePositiveRate).toBeGreaterThanOrEqual(0);
      expect(bf2.falsePositiveRate).toBeLessThanOrEqual(1);
    });

    it('should handle near capacity', () => {
      const bf2 = new BloomFilter({ capacity: 100 });
      for (let i = 0; i < 99; i++) {
        bf2.add(`element${i}`);
      }
      const fpr = bf2.falsePositiveRate;
      expect(fpr).toBeGreaterThanOrEqual(0);
      expect(fpr).toBeLessThanOrEqual(1);
    });
  });

  describe('fillRatio getter', () => {
    it('should return 0 for empty filter', () => {
      expect(bf.fillRatio).toBe(0);
    });

    it('should increase as elements are added', () => {
      bf.add('test');
      const fr1 = bf.fillRatio;
      bf.add('test2');
      const fr2 = bf.fillRatio;
      expect(fr2).toBeGreaterThan(fr1);
    });

    it('should return number between 0 and 1', () => {
      const bf2 = new BloomFilter({ capacity: 100 });
      for (let i = 0; i < 50; i++) {
        bf2.add(`element${i}`);
      }
      expect(bf2.fillRatio).toBeGreaterThanOrEqual(0);
      expect(bf2.fillRatio).toBeLessThanOrEqual(1);
    });

    it('should handle full filter', () => {
      const bf2 = new BloomFilter({ capacity: 10, bitCount: 100 });
      for (let i = 0; i < 10; i++) {
        bf2.add(`element${i}`);
      }
      expect(bf2.fillRatio).toBeGreaterThan(0);
      expect(bf2.fillRatio).toBeLessThanOrEqual(1);
    });
  });

  describe('size getter', () => {
    it('should return 0 for new filter', () => {
      expect(bf.size).toBe(0);
    });

    it('should increment with each add', () => {
      bf.add('a');
      expect(bf.size).toBe(1);
      bf.add('b');
      expect(bf.size).toBe(2);
      bf.add('c');
      expect(bf.size).toBe(3);
    });

    it('should count duplicates', () => {
      bf.add('test');
      bf.add('test');
      bf.add('test');
      expect(bf.size).toBe(3);
    });
  });

  describe('capacity getter', () => {
    it('should return default capacity', () => {
      expect(bf.capacity).toBe(100);
    });

    it('should return custom capacity', () => {
      const bf2 = new BloomFilter({ capacity: 50 });
      expect(bf2.capacity).toBe(50);
    });

    it('should remain constant after adds', () => {
      const capacity = bf.capacity;
      bf.add('test');
      expect(bf.capacity).toBe(capacity);
    });
  });

  describe('bitCount getter', () => {
    it('should return calculated bit count', () => {
      expect(bf.bitCount).toBeGreaterThan(0);
    });

    it('should match provided bitCount', () => {
      const bf2 = new BloomFilter({ bitCount: 500 });
      expect(bf2.bitCount).toBe(500);
    });

    it('should be consistent with capacity', () => {
      const bf2 = new BloomFilter({ capacity: 100, falsePositiveRate: 0.01 });
      expect(bf2.bitCount).toBeGreaterThan(0);
    });
  });

  describe('hashCount getter', () => {
    it('should return calculated hash count', () => {
      expect(bf.hashCount).toBeGreaterThan(0);
    });

    it('should match provided hashCount', () => {
      const bf2 = new BloomFilter({ hashCount: 7 });
      expect(bf2.hashCount).toBe(7);
    });

    it('should be consistent with bitCount and capacity', () => {
      const bf2 = new BloomFilter({ capacity: 100, bitCount: 500 });
      expect(bf2.hashCount).toBeGreaterThan(0);
    });
  });

  describe('isEmpty', () => {
    it('should return true for new filter', () => {
      expect(bf.isEmpty()).toBe(true);
    });

    it('should return false after add', () => {
      bf.add('test');
      expect(bf.isEmpty()).toBe(false);
    });

    it('should return true after clear', () => {
      bf.add('test');
      bf.clear();
      expect(bf.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      bf.add('a');
      bf.add('b');
      bf.add('c');
      bf.clear();
      expect(bf.size).toBe(0);
      expect(bf.isEmpty()).toBe(true);
      expect(bf.has('a')).toBe(false);
      expect(bf.has('b')).toBe(false);
      expect(bf.has('c')).toBe(false);
    });

    it('should reset size to 0', () => {
      bf.add('test');
      bf.add('test2');
      expect(bf.size).toBe(2);
      bf.clear();
      expect(bf.size).toBe(0);
    });

    it('should reset fillRatio to 0', () => {
      bf.add('test');
      expect(bf.fillRatio).toBeGreaterThan(0);
      bf.clear();
      expect(bf.fillRatio).toBe(0);
    });

    it('should allow adds after clear', () => {
      bf.add('test');
      bf.clear();
      bf.add('new');
      expect(bf.has('new')).toBe(true);
      expect(bf.size).toBe(1);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      bf.add('a');
      bf.add('b');
      const bf2 = bf.clone();
      expect(bf2.has('a')).toBe(true);
      expect(bf2.has('b')).toBe(true);
      expect(bf2.size).toBe(bf.size);
    });

    it('should not modify original', () => {
      bf.add('test');
      const bf2 = bf.clone();
      bf2.add('other');
      expect(bf.has('other')).toBe(false);
      expect(bf2.has('other')).toBe(true);
    });

    it('should copy capacity', () => {
      const bf2 = bf.clone();
      expect(bf2.capacity).toBe(bf.capacity);
    });

    it('should copy bitCount', () => {
      const bf2 = bf.clone();
      expect(bf2.bitCount).toBe(bf.bitCount);
    });

    it('should copy hashCount', () => {
      const bf2 = bf.clone();
      expect(bf2.hashCount).toBe(bf.hashCount);
    });

    it('should be a different instance', () => {
      const bf2 = bf.clone();
      expect(bf2).not.toBe(bf);
    });
  });

  describe('union', () => {
    it('should combine two filters', () => {
      const bf1 = new BloomFilter({ capacity: 50 });
      const bf2 = new BloomFilter({ capacity: 50 });
      bf1.add('a');
      bf1.add('b');
      bf2.add('b');
      bf2.add('c');
      const result = bf1.union(bf2);
      expect(result.has('a')).toBe(true);
      expect(result.has('b')).toBe(true);
      expect(result.has('c')).toBe(true);
    });

    it('should not modify original filters', () => {
      const bf1 = new BloomFilter();
      const bf2 = new BloomFilter();
      bf1.add('a');
      bf2.add('b');
      const result = bf1.union(bf2);
      expect(bf1.has('b')).toBe(false);
      expect(bf2.has('a')).toBe(false);
    });

    it('should handle empty filters', () => {
      const bf1 = new BloomFilter();
      const bf2 = new BloomFilter();
      const result = bf1.union(bf2);
      expect(result.isEmpty()).toBe(true);
    });

    it('should handle one empty filter', () => {
      const bf1 = new BloomFilter();
      const bf2 = new BloomFilter();
      bf1.add('a');
      const result = bf1.union(bf2);
      expect(result.has('a')).toBe(true);
    });

    it('should return new instance', () => {
      const bf1 = new BloomFilter();
      const bf2 = new BloomFilter();
      const result = bf1.union(bf2);
      expect(result).not.toBe(bf1);
      expect(result).not.toBe(bf2);
    });
  });

  describe('intersect', () => {
    it('should find common elements', () => {
      const bf1 = new BloomFilter();
      const bf2 = new BloomFilter();
      bf1.add('a');
      bf1.add('b');
      bf1.add('c');
      bf2.add('b');
      bf2.add('c');
      bf2.add('d');
      const result = bf1.intersect(bf2);
      expect(result.has('a')).toBe(false);
      expect(result.has('b')).toBe(true);
      expect(result.has('c')).toBe(true);
      expect(result.has('d')).toBe(false);
    });

    it('should not modify original filters', () => {
      const bf1 = new BloomFilter();
      const bf2 = new BloomFilter();
      bf1.add('a');
      bf1.add('b');
      bf2.add('b');
      bf2.add('c');
      const result = bf1.intersect(bf2);
      expect(bf1.has('c')).toBe(false);
      expect(bf2.has('a')).toBe(false);
    });

    it('should handle empty filters', () => {
      const bf1 = new BloomFilter();
      const bf2 = new BloomFilter();
      const result = bf1.intersect(bf2);
      expect(result.isEmpty()).toBe(true);
    });

    it('should handle no common elements', () => {
      const bf1 = new BloomFilter();
      const bf2 = new BloomFilter();
      bf1.add('a');
      bf1.add('b');
      bf2.add('c');
      bf2.add('d');
      const result = bf1.intersect(bf2);
      expect(result.size).toBe(0);
    });

    it('should return new instance', () => {
      const bf1 = new BloomFilter();
      const bf2 = new BloomFilter();
      const result = bf1.intersect(bf2);
      expect(result).not.toBe(bf1);
      expect(result).not.toBe(bf2);
    });
  });

  describe('equals', () => {
    it('should return true for identical filters', () => {
      const bf1 = new BloomFilter();
      const bf2 = new BloomFilter();
      bf1.add('a');
      bf1.add('b');
      bf2.add('a');
      bf2.add('b');
      expect(bf1.equals(bf2)).toBe(true);
    });

    it('should return false for different filters', () => {
      const bf1 = new BloomFilter();
      const bf2 = new BloomFilter();
      bf1.add('a');
      bf2.add('b');
      expect(bf1.equals(bf2)).toBe(false);
    });

    it('should return true for empty filters', () => {
      const bf1 = new BloomFilter();
      const bf2 = new BloomFilter();
      expect(bf1.equals(bf2)).toBe(true);
    });

    it('should return false for filters with different capacities', () => {
      const bf1 = new BloomFilter({ capacity: 50 });
      const bf2 = new BloomFilter({ capacity: 100 });
      expect(bf1.equals(bf2)).toBe(false);
    });

    it('should return false for filters with different bitCounts', () => {
      const bf1 = new BloomFilter({ bitCount: 100 });
      const bf2 = new BloomFilter({ bitCount: 200 });
      expect(bf1.equals(bf2)).toBe(false);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      bf.add('a');
      bf.add('b');
      bf.add('c');
      const elements: string[] = [];
      bf.forEach((element) => elements.push(element));
      expect(elements.length).toBe(3);
      expect(elements).toContain('a');
      expect(elements).toContain('b');
      expect(elements).toContain('c');
    });

    it('should pass index to callback', () => {
      bf.add('a');
      bf.add('b');
      const indices: number[] = [];
      bf.forEach((element, index) => indices.push(index));
      expect(indices).toEqual([0, 1]);
    });

    it('should handle empty filter', () => {
      const elements: string[] = [];
      bf.forEach((element) => elements.push(element));
      expect(elements).toEqual([]);
    });

    it('should handle duplicates', () => {
      bf.add('test');
      bf.add('test');
      const elements: string[] = [];
      bf.forEach((element) => elements.push(element));
      expect(elements).toEqual(['test', 'test']);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty filter', () => {
      expect(bf.toArray()).toEqual([]);
    });

    it('should return array of all elements', () => {
      bf.add('a');
      bf.add('b');
      bf.add('c');
      expect(bf.toArray()).toEqual(['a', 'b', 'c']);
    });

    it('should include duplicates', () => {
      bf.add('test');
      bf.add('test');
      expect(bf.toArray()).toEqual(['test', 'test']);
    });

    it('should return new array each time', () => {
      bf.add('test');
      const arr1 = bf.toArray();
      const arr2 = bf.toArray();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });

    it('should not modify filter', () => {
      bf.add('test');
      const arr = bf.toArray();
      arr.push('other');
      expect(bf.toArray()).toEqual(['test']);
    });
  });

  describe('serialize', () => {
    it('should serialize empty filter', () => {
      const data = bf.serialize();
      expect(data.bitCount).toBe(bf.bitCount);
      expect(data.hashCount).toBe(bf.hashCount);
      expect(data.capacity).toBe(bf.capacity);
      expect(data.size).toBe(0);
      expect(data.elements).toEqual([]);
      expect(data.bits).toHaveLength(bf.bitCount);
    });

    it('should serialize non-empty filter', () => {
      bf.add('a');
      bf.add('b');
      const data = bf.serialize();
      expect(data.size).toBe(2);
      expect(data.elements).toEqual(['a', 'b']);
      expect(data.bitCount).toBe(bf.bitCount);
      expect(data.hashCount).toBe(bf.hashCount);
    });

    it('should include all properties', () => {
      bf.add('test');
      const data = bf.serialize();
      expect(data).toHaveProperty('bitCount');
      expect(data).toHaveProperty('hashCount');
      expect(data).toHaveProperty('capacity');
      expect(data).toHaveProperty('falsePositiveRate');
      expect(data).toHaveProperty('size');
      expect(data).toHaveProperty('elements');
      expect(data).toHaveProperty('bits');
    });

    it('should handle duplicates', () => {
      bf.add('test');
      bf.add('test');
      const data = bf.serialize();
      expect(data.elements).toEqual(['test', 'test']);
      expect(data.size).toBe(2);
    });
  });

  describe('fromArray static', () => {
    it('should create filter from array', () => {
      const bf2 = BloomFilter.fromArray(['a', 'b', 'c']);
      expect(bf2.has('a')).toBe(true);
      expect(bf2.has('b')).toBe(true);
      expect(bf2.has('c')).toBe(true);
      expect(bf2.size).toBe(3);
    });

    it('should handle empty array', () => {
      const bf2 = BloomFilter.fromArray([]);
      expect(bf2.isEmpty()).toBe(true);
      expect(bf2.size).toBe(0);
    });

    it('should use provided capacity', () => {
      const bf2 = BloomFilter.fromArray(['a', 'b'], { capacity: 50 });
      expect(bf2.capacity).toBe(50);
    });

    it('should use provided falsePositiveRate', () => {
      const bf2 = BloomFilter.fromArray(['a', 'b'], { falsePositiveRate: 0.05 });
      expect(bf2.capacity).toBe(2);
    });

    it('should handle duplicates', () => {
      const bf2 = BloomFilter.fromArray(['a', 'a', 'b', 'b']);
      expect(bf2.size).toBe(4);
      expect(bf2.toArray()).toEqual(['a', 'a', 'b', 'b']);
    });

    it('should use array length as default capacity', () => {
      const bf2 = BloomFilter.fromArray(['a', 'b', 'c', 'd']);
      expect(bf2.capacity).toBe(4);
    });
  });

  describe('deserialize static', () => {
    it('should deserialize empty filter', () => {
      const bf2 = new BloomFilter();
      const data = bf2.serialize();
      const bf3 = BloomFilter.deserialize(data);
      expect(bf3.capacity).toBe(bf2.capacity);
      expect(bf3.bitCount).toBe(bf2.bitCount);
      expect(bf3.hashCount).toBe(bf2.hashCount);
      expect(bf3.size).toBe(0);
    });

    it('should deserialize non-empty filter', () => {
      const bf2 = new BloomFilter();
      bf2.add('a');
      bf2.add('b');
      const data = bf2.serialize();
      const bf3 = BloomFilter.deserialize(data);
      expect(bf3.has('a')).toBe(true);
      expect(bf3.has('b')).toBe(true);
      expect(bf3.size).toBe(2);
    });

    it('should preserve custom hash function', () => {
      const customHash = (element: string, seed: number): number => {
        return element.length + seed;
      };
      const bf2 = new BloomFilter({ hashFunction: customHash });
      bf2.add('test');
      const data = bf2.serialize();
      const bf3 = BloomFilter.deserialize(data, customHash);
      expect(bf3.has('test')).toBe(true);
    });

    it('should handle duplicates', () => {
      const bf2 = new BloomFilter();
      bf2.add('test');
      bf2.add('test');
      const data = bf2.serialize();
      const bf3 = BloomFilter.deserialize(data);
      expect(bf3.size).toBe(2);
      expect(bf3.toArray()).toEqual(['test', 'test']);
    });
  });

  describe('expectedBitCount static', () => {
    it('should calculate for default parameters', () => {
      const bits = BloomFilter.expectedBitCount(100, 0.01);
      expect(bits).toBeGreaterThan(0);
    });

    it('should increase with capacity', () => {
      const bits1 = BloomFilter.expectedBitCount(100, 0.01);
      const bits2 = BloomFilter.expectedBitCount(200, 0.01);
      expect(bits2).toBeGreaterThan(bits1);
    });

    it('should decrease with false positive rate', () => {
      const bits1 = BloomFilter.expectedBitCount(100, 0.1);
      const bits2 = BloomFilter.expectedBitCount(100, 0.01);
      expect(bits2).toBeGreaterThan(bits1);
    });

    it('should handle small capacity', () => {
      const bits = BloomFilter.expectedBitCount(1, 0.01);
      expect(bits).toBeGreaterThan(0);
    });

    it('should return at least 1', () => {
      const bits = BloomFilter.expectedBitCount(0, 1);
      expect(bits).toBeGreaterThanOrEqual(1);
    });
  });

  describe('expectedHashCount static', () => {
    it('should calculate for default parameters', () => {
      const hashes = BloomFilter.expectedHashCount(100, 100);
      expect(hashes).toBeGreaterThan(0);
    });

    it('should increase with bitCount', () => {
      const hashes1 = BloomFilter.expectedHashCount(100, 100);
      const hashes2 = BloomFilter.expectedHashCount(200, 100);
      expect(hashes2).toBeGreaterThanOrEqual(hashes1);
    });

    it.skip('should decrease with capacity', () => {
      const hashes1 = BloomFilter.expectedHashCount(100, 50);
      const hashes2 = BloomFilter.expectedHashCount(100, 200);
      expect(hashes2).toBeLessThan(hashes1);
    });

    it('should return at least 1', () => {
      const hashes = BloomFilter.expectedHashCount(1, 1000);
      expect(hashes).toBeGreaterThanOrEqual(1);
    });
  });

  describe('integration', () => {
    it('should handle serialization round trip', () => {
      const bf2 = new BloomFilter({ capacity: 50 });
      bf2.add('a');
      bf2.add('b');
      bf2.add('c');
      const data = bf2.serialize();
      const bf3 = BloomFilter.deserialize(data);
      expect(bf3.has('a')).toBe(true);
      expect(bf3.has('b')).toBe(true);
      expect(bf3.has('c')).toBe(true);
      expect(bf3.has('d')).toBe(false);
    });

    it('should handle union and intersection', () => {
      const bf1 = new BloomFilter();
      const bf2 = new BloomFilter();
      const bf3 = new BloomFilter();
      bf1.add('a');
      bf1.add('b');
      bf2.add('b');
      bf2.add('c');
      bf3.add('a');
      bf3.add('b');
      bf3.add('c');
      const union = bf1.union(bf2);
      expect(union.has('a')).toBe(true);
      expect(union.has('b')).toBe(true);
      expect(union.has('c')).toBe(true);
    });

    it('should handle clone and modification', () => {
      bf.add('a');
      const bf2 = bf.clone();
      bf2.add('b');
      expect(bf.has('a')).toBe(true);
      expect(bf.has('b')).toBe(false);
      expect(bf2.has('a')).toBe(true);
      expect(bf2.has('b')).toBe(true);
    });

    it('should handle fromArray with options', () => {
      const bf2 = BloomFilter.fromArray(['a', 'b', 'c'], { capacity: 50 });
      expect(bf2.capacity).toBe(50);
      expect(bf2.has('a')).toBe(true);
      expect(bf2.has('b')).toBe(true);
      expect(bf2.has('c')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle many adds', () => {
      const bf2 = new BloomFilter({ capacity: 1000 });
      for (let i = 0; i < 500; i++) {
        bf2.add(`element${i}`);
      }
      expect(bf2.size).toBe(500);
    });

    it('should handle very long strings', () => {
      const bf2 = new BloomFilter();
      const longStr = 'a'.repeat(10000);
      bf2.add(longStr);
      expect(bf2.has(longStr)).toBe(true);
    });

    it('should handle special unicode characters', () => {
      const bf2 = new BloomFilter();
      bf2.add('🎉');
      bf2.add('🚀');
      bf2.add('❤️');
      expect(bf2.has('🎉')).toBe(true);
      expect(bf2.has('🚀')).toBe(true);
      expect(bf2.has('❤️')).toBe(true);
    });

    it('should handle empty string adds', () => {
      const bf2 = new BloomFilter();
      bf2.add('');
      expect(bf2.has('')).toBe(true);
    });

    it('should handle clear after many adds', () => {
      const bf2 = new BloomFilter({ capacity: 100 });
      for (let i = 0; i < 50; i++) {
        bf2.add(`element${i}`);
      }
      expect(bf2.size).toBe(50);
      bf2.clear();
      expect(bf2.size).toBe(0);
      expect(bf2.isEmpty()).toBe(true);
    });
  });
});
