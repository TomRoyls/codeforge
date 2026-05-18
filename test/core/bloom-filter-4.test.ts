import { describe, it, expect } from 'vitest';
import { BloomFilter } from '../../src/core/bloom-filter-4/index.js';

// ─── Constructor ───

describe('BloomFilter – Constructor', () => {
  it('creates filter with default parameters', () => {
    const bf = new BloomFilter();
    expect(bf.getHashCount()).toBeGreaterThan(0);
    expect(bf.getSize()).toBeGreaterThan(0);
    expect(bf.getBitCount()).toBeGreaterThan(0);
  });

  it('creates filter with custom expected items', () => {
    const bf = new BloomFilter(5000, 0.01);
    expect(bf.getSize()).toBeGreaterThan(0);
  });

  it('creates filter with custom false positive rate', () => {
    const bf1 = new BloomFilter(1000, 0.01);
    const bf2 = new BloomFilter(1000, 0.001);
    expect(bf2.getSize()).toBeGreaterThan(bf1.getSize());
  });

  it('uses more bits for stricter false positive rates', () => {
    const bfLoose = new BloomFilter(100, 0.1);
    const bfStrict = new BloomFilter(100, 0.001);
    expect(bfStrict.getSize()).toBeGreaterThan(bfLoose.getSize());
  });
});

// ─── add / mightContain ───

describe('BloomFilter – add & mightContain', () => {
  it('reports item as possibly present after adding', () => {
    const bf = new BloomFilter(100, 0.01);
    bf.add('hello');
    expect(bf.mightContain('hello')).toBe(true);
  });

  it('reports false for items never added (mostly)', () => {
    const bf = new BloomFilter(1000, 0.01);
    bf.add('a');
    bf.add('b');
    bf.add('c');
    expect(bf.mightContain('z')).toBe(false);
  });

  it('handles multiple additions of the same item', () => {
    const bf = new BloomFilter(100, 0.01);
    bf.add('x');
    bf.add('x');
    bf.add('x');
    expect(bf.mightContain('x')).toBe(true);
  });

  it('works with empty string', () => {
    const bf = new BloomFilter(100, 0.01);
    bf.add('');
    expect(bf.mightContain('')).toBe(true);
  });

  it('works with numeric strings', () => {
    const bf = new BloomFilter(100, 0.01);
    bf.add('42');
    expect(bf.mightContain('42')).toBe(true);
  });

  it('works with unicode strings', () => {
    const bf = new BloomFilter(100, 0.01);
    bf.add('日本語');
    expect(bf.mightContain('日本語')).toBe(true);
  });

  it('distinguishes different strings', () => {
    const bf = new BloomFilter(1000, 0.01);
    bf.add('alpha');
    bf.add('beta');
    bf.add('gamma');
    expect(bf.mightContain('alpha')).toBe(true);
    expect(bf.mightContain('beta')).toBe(true);
    expect(bf.mightContain('gamma')).toBe(true);
  });
});

// ─── False positive rate ───

describe('BloomFilter – False positive rate', () => {
  it('keeps false positive rate within expected range', () => {
    const bf = new BloomFilter(500, 0.01);
    const added = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const s = `item-${i}`;
      bf.add(s);
      added.add(s);
    }
    let falsePositives = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      const s = `not-added-${i}`;
      if (!added.has(s) && bf.mightContain(s)) {
        falsePositives++;
      }
    }
    expect(falsePositives / trials).toBeLessThan(0.1);
  });
});

// ─── getEstimatedFalsePositiveRate ───

describe('BloomFilter – getEstimatedFalsePositiveRate', () => {
  it('returns 0 when empty', () => {
    const bf = new BloomFilter(100, 0.01);
    expect(bf.getEstimatedFalsePositiveRate()).toBe(0);
  });

  it('increases as more items are added', () => {
    const bf = new BloomFilter(100, 0.05);
    bf.add('a');
    const rate1 = bf.getEstimatedFalsePositiveRate();
    for (let i = 0; i < 50; i++) {
      bf.add(`item-${i}`);
    }
    const rate2 = bf.getEstimatedFalsePositiveRate();
    expect(rate2).toBeGreaterThan(rate1);
  });

  it('returns a value between 0 and 1', () => {
    const bf = new BloomFilter(100, 0.01);
    for (let i = 0; i < 50; i++) {
      bf.add(`item-${i}`);
    }
    const rate = bf.getEstimatedFalsePositiveRate();
    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(1);
  });
});

// ─── clear ───

describe('BloomFilter – clear', () => {
  it('resets the filter so items no longer match', () => {
    const bf = new BloomFilter(100, 0.01);
    bf.add('hello');
    bf.add('world');
    bf.clear();
    expect(bf.mightContain('hello')).toBe(false);
    expect(bf.mightContain('world')).toBe(false);
  });

  it('resets estimated false positive rate to 0', () => {
    const bf = new BloomFilter(100, 0.01);
    bf.add('test');
    bf.clear();
    expect(bf.getEstimatedFalsePositiveRate()).toBe(0);
  });
});

// ─── Accessors ───

describe('BloomFilter – Accessors', () => {
  it('getBitCount returns multiple of 8', () => {
    const bf = new BloomFilter(100, 0.01);
    expect(bf.getBitCount() % 8).toBe(0);
  });

  it('getBitCount >= getSize', () => {
    const bf = new BloomFilter(100, 0.01);
    expect(bf.getBitCount()).toBeGreaterThanOrEqual(bf.getSize());
  });

  it('getTimeComplexity returns a string mentioning hash functions', () => {
    const bf = new BloomFilter(100, 0.01);
    const tc = bf.getTimeComplexity();
    expect(tc).toContain('add:');
    expect(tc).toContain('mightContain:');
    expect(tc).toContain('hash functions');
  });
});
