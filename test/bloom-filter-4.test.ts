import { describe, it, expect } from 'vitest';
import { BloomFilter } from '../src/core/bloom-filter-4/index.js';

describe('BloomFilter4', () => {
  describe('constructor', () => {
    it('should create a filter with default parameters', () => {
      const bf = new BloomFilter();
      expect(bf.getSize()).toBeGreaterThan(0);
      expect(bf.getHashCount()).toBeGreaterThan(0);
    });

    it('should create a filter with custom parameters', () => {
      const bf = new BloomFilter(5000, 0.001);
      expect(bf.getSize()).toBeGreaterThan(0);
      expect(bf.getHashCount()).toBeGreaterThan(0);
    });
  });

  describe('add and mightContain', () => {
    it('should contain added items', () => {
      const bf = new BloomFilter(1000, 0.01);
      bf.add('hello');
      bf.add('world');
      expect(bf.mightContain('hello')).toBe(true);
      expect(bf.mightContain('world')).toBe(true);
    });

    it('should not guarantee non-added items are absent', () => {
      const bf = new BloomFilter(1000, 0.01);
      bf.add('hello');
      expect(bf.mightContain('hello')).toBe(true);
    });

    it('should handle empty filter', () => {
      const bf = new BloomFilter(1000, 0.01);
      expect(bf.mightContain('anything')).toBe(false);
    });

    it('should handle many items', () => {
      const bf = new BloomFilter(10000, 0.01);
      for (let i = 0; i < 1000; i++) {
        bf.add(`item-${i}`);
      }
      for (let i = 0; i < 1000; i++) {
        expect(bf.mightContain(`item-${i}`)).toBe(true);
      }
    });

    it('should have low false positive rate', () => {
      const bf = new BloomFilter(10000, 0.01);
      for (let i = 0; i < 1000; i++) {
        bf.add(`item-${i}`);
      }
      let falsePositives = 0;
      const trials = 10000;
      for (let i = 0; i < trials; i++) {
        if (bf.mightContain(`nonexistent-${i}`)) {
          falsePositives++;
        }
      }
      expect(falsePositives / trials).toBeLessThan(0.05);
    });
  });

  describe('getSize', () => {
    it('should return the bit array size', () => {
      const bf = new BloomFilter(1000, 0.01);
      expect(bf.getSize()).toBeGreaterThan(0);
    });

    it('should increase size for lower false positive rate', () => {
      const bf1 = new BloomFilter(1000, 0.01);
      const bf2 = new BloomFilter(1000, 0.001);
      expect(bf2.getSize()).toBeGreaterThan(bf1.getSize());
    });
  });

  describe('getBitCount', () => {
    it('should return total bits', () => {
      const bf = new BloomFilter(1000, 0.01);
      expect(bf.getBitCount()).toBeGreaterThan(0);
      expect(bf.getBitCount()).toBeGreaterThanOrEqual(bf.getSize());
    });
  });

  describe('getHashCount', () => {
    it('should return hash function count', () => {
      const bf = new BloomFilter(1000, 0.01);
      expect(bf.getHashCount()).toBeGreaterThan(0);
    });
  });

  describe('getEstimatedFalsePositiveRate', () => {
    it('should return 0 for empty filter', () => {
      const bf = new BloomFilter(1000, 0.01);
      expect(bf.getEstimatedFalsePositiveRate()).toBe(0);
    });

    it('should increase with more items', () => {
      const bf = new BloomFilter(1000, 0.01);
      bf.add('item1');
      const rate1 = bf.getEstimatedFalsePositiveRate();
      for (let i = 0; i < 500; i++) {
        bf.add(`item-${i}`);
      }
      const rate2 = bf.getEstimatedFalsePositiveRate();
      expect(rate2).toBeGreaterThan(rate1);
    });
  });

  describe('clear', () => {
    it('should reset the filter', () => {
      const bf = new BloomFilter(1000, 0.01);
      bf.add('hello');
      bf.add('world');
      bf.clear();
      expect(bf.mightContain('hello')).toBe(false);
      expect(bf.mightContain('world')).toBe(false);
    });

    it('should allow reuse after clear', () => {
      const bf = new BloomFilter(1000, 0.01);
      bf.add('old-item');
      bf.clear();
      bf.add('new-item');
      expect(bf.mightContain('new-item')).toBe(true);
      expect(bf.mightContain('old-item')).toBe(false);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return complexity string', () => {
      const bf = new BloomFilter(1000, 0.01);
      expect(bf.getTimeComplexity()).toContain('O(k)');
    });
  });

  describe('edge cases', () => {
    it('should handle single item', () => {
      const bf = new BloomFilter(100, 0.01);
      bf.add('only-item');
      expect(bf.mightContain('only-item')).toBe(true);
      expect(bf.mightContain('not-present')).toBe(false);
    });

    it('should handle empty string', () => {
      const bf = new BloomFilter(100, 0.01);
      bf.add('');
      expect(bf.mightContain('')).toBe(true);
    });

    it('should handle unicode strings', () => {
      const bf = new BloomFilter(1000, 0.01);
      bf.add('こんにちは');
      bf.add('Привет');
      bf.add('🎉🎊');
      expect(bf.mightContain('こんにちは')).toBe(true);
      expect(bf.mightContain('Привет')).toBe(true);
      expect(bf.mightContain('🎉🎊')).toBe(true);
    });

    it('should handle duplicate adds', () => {
      const bf = new BloomFilter(100, 0.01);
      bf.add('item');
      bf.add('item');
      bf.add('item');
      expect(bf.mightContain('item')).toBe(true);
    });

    it('should handle very small false positive rate', () => {
      const bf = new BloomFilter(1000, 0.0001);
      expect(bf.getSize()).toBeGreaterThan(10000);
      for (let i = 0; i < 100; i++) {
        bf.add(`item-${i}`);
      }
      for (let i = 0; i < 100; i++) {
        expect(bf.mightContain(`item-${i}`)).toBe(true);
      }
    });

    it('should handle large expected items', () => {
      const bf = new BloomFilter(1000000, 0.01);
      expect(bf.getSize()).toBeGreaterThan(0);
      bf.add('test-item');
      expect(bf.mightContain('test-item')).toBe(true);
    });
  });

  describe('estimated false positive rate accuracy', () => {
    it('should be 0 for empty filter after clear', () => {
      const bf = new BloomFilter(1000, 0.01);
      bf.add('item');
      bf.clear();
      expect(bf.getEstimatedFalsePositiveRate()).toBe(0);
    });

    it('should approach theoretical rate', () => {
      const bf = new BloomFilter(1000, 0.01);
      for (let i = 0; i < 500; i++) {
        bf.add(`item-${i}`);
      }
      const estimated = bf.getEstimatedFalsePositivePositiveRate?.() ?? bf.getEstimatedFalsePositiveRate();
      expect(estimated).toBeGreaterThan(0);
      expect(estimated).toBeLessThan(1);
    });
  });

  describe('bit count consistency', () => {
    it('should have bit count >= size', () => {
      const bf = new BloomFilter(1000, 0.01);
      expect(bf.getBitCount()).toBeGreaterThanOrEqual(bf.getSize());
    });

    it('should be byte-aligned', () => {
      const bf = new BloomFilter(1000, 0.01);
      expect(bf.getBitCount() % 8).toBe(0);
    });

    it('should handle add and mightContain with single item', () => {
      const bf = new BloomFilter(100, 0.01);
      bf.add('test');
      expect(bf.mightContain('test')).toBe(true);
      expect(bf.mightContain('nothere')).toBe(false);
    });

    it('should have no false negatives after many adds', () => {
      const bf = new BloomFilter(1000, 0.01);
      for (let i = 0; i < 100; i++) {
        bf.add(`item-${i}`);
      }
      for (let i = 0; i < 100; i++) {
        expect(bf.mightContain(`item-${i}`)).toBe(true);
      }
    });

    it('should report correct size after clear', () => {
      const bf = new BloomFilter(100, 0.01);
      bf.add('a');
      bf.add('b');
      bf.clear();
      expect(bf.getEstimatedFalsePositiveRate()).toBe(0);
    });

    it('should handle add then mightContain with number', () => {
      const bf = new BloomFilter(100, 0.01);
      bf.add('42');
      expect(bf.mightContain('42')).toBe(true);
    });

    it('should handle getSize returning bit count', () => {
      const bf = new BloomFilter(100, 0.01);
      expect(bf.getSize()).toBeGreaterThan(0);
    });

    it('should handle getHashCount', () => {
      const bf = new BloomFilter(100, 0.01);
      expect(bf.getHashCount()).toBeGreaterThan(0);
    });

    it('should handle clear', () => {
      const bf = new BloomFilter(100, 0.01);
      bf.add('test');
      bf.clear();
      expect(bf.mightContain('test')).toBe(false);
    });

    it('should handle getEstimatedFalsePositiveRate', () => {
      const bf = new BloomFilter(100, 0.01);
      bf.add('a');
      bf.add('b');
      const rate = bf.getEstimatedFalsePositiveRate();
      expect(rate).toBeGreaterThanOrEqual(0);
    });

    it('should handle getTimeComplexity', () => {
      const bf = new BloomFilter(100, 0.01);
      expect(typeof bf.getTimeComplexity()).toBe('string');
    });

    it('should handle getHashCount', () => {
      const bf = new BloomFilter(100, 0.01);
      expect(bf.getHashCount()).toBeGreaterThan(0);
    });

    it('should handle getBitCount', () => {
      const bf = new BloomFilter(100, 0.01);
      expect(bf.getBitCount()).toBeGreaterThan(0);
    });

    it('should handle add and mightContain', () => {
      const bf = new BloomFilter(100, 0.01);
      bf.add('hello');
      bf.add('world');
      expect(bf.mightContain('hello')).toBe(true);
      expect(bf.mightContain('world')).toBe(true);
    });

    it('should handle clear', () => {
      const bf = new BloomFilter(100, 0.01);
      bf.add('hello');
      bf.clear();
      expect(bf.getSize()).toBeGreaterThan(0);
    });

    it('should handle estimated false positive rate', () => {
      const bf = new BloomFilter(100, 0.01);
      expect(bf.getEstimatedFalsePositiveRate()).toBeLessThanOrEqual(0.1);
    });

    it('should handle getHashCount', () => {
      const bf = new BloomFilter(100, 0.01);
      expect(bf.getHashCount()).toBeGreaterThan(0);
    });
  });

  it('should handle adding many items', () => {
    const bf = new BloomFilter(1000, 0.01);
    for (let i = 0; i < 500; i++) {
      bf.add(`item-${i}`);
    }
    expect(bf.mightContain('item-0')).toBe(true);
    expect(bf.mightContain('item-499')).toBe(true);
  });

  it('should handle getBitCount', () => {
    const bf = new BloomFilter(100, 0.01);
    expect(bf.getBitCount()).toBeGreaterThan(0);
  });
  it('should handle getHashCount', () => {
    const bf = new BloomFilter(100, 0.01);
    expect(bf.getHashCount()).toBeGreaterThan(0);
  });
  it('should handle getSize returns bit count', () => {
    const bf = new BloomFilter(100, 0.01);
    expect(bf.getSize()).toBeGreaterThan(0);
    expect(bf.getBitCount()).toBeGreaterThan(0);
  });
  it('should handle mightContain after clear', () => {
    const bf = new BloomFilter(100, 0.01);
    bf.add('test');
    bf.clear();
    expect(bf.mightContain('test')).toBe(false);
  });
});
