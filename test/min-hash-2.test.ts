import { describe, it, expect } from 'vitest';
import { MinHash2 } from '../src/core/min-hash-2/index.js';

describe('MinHash2', () => {
  it('creates instance with default parameters', () => {
    const mh = new MinHash2();
    expect(mh.size()).toBe(0);
    expect(mh.getSignature().length).toBe(128);
  });

  it('creates instance with custom numHashes', () => {
    const mh = new MinHash2(256);
    expect(mh.getSignature().length).toBe(256);
  });

  it('creates instance with custom seed', () => {
    const mh1 = new MinHash2(10, 42);
    const mh2 = new MinHash2(10, 42);
    mh1.add('test');
    mh2.add('test');
    expect(mh1.getSignature()).toEqual(mh2.getSignature());
  });

  it('handles empty set', () => {
    const mh = new MinHash2();
    expect(mh.size()).toBe(0);
  });

  it('adds single item', () => {
    const mh = new MinHash2();
    mh.add('apple');
    expect(mh.size()).toBe(1);
  });

  it('adds multiple distinct items', () => {
    const mh = new MinHash2();
    mh.add('apple');
    mh.add('banana');
    mh.add('cherry');
    expect(mh.size()).toBe(3);
  });

  it('does not add duplicate items', () => {
    const mh = new MinHash2();
    mh.add('apple');
    mh.add('apple');
    mh.add('apple');
    expect(mh.size()).toBe(1);
  });

  it('clears all items', () => {
    const mh = new MinHash2();
    mh.add('apple');
    mh.add('banana');
    mh.clear();
    expect(mh.size()).toBe(0);
  });

  it('resets signature to infinity after clear', () => {
    const mh = new MinHash2(10);
    mh.add('apple');
    mh.clear();
    const sig = mh.getSignature();
    for (let i = 0; i < sig.length; i++) {
      expect(sig[i]).toBe(Infinity);
    }
  });

  it('getSignature returns array of correct length', () => {
    const mh = new MinHash2(64);
    expect(mh.getSignature().length).toBe(64);
  });

  it('addAll adds multiple items', () => {
    const mh = new MinHash2();
    mh.addAll(['apple', 'banana', 'cherry']);
    expect(mh.size()).toBe(3);
  });

  it('addAll handles empty array', () => {
    const mh = new MinHash2();
    mh.addAll([]);
    expect(mh.size()).toBe(0);
  });

  it('addAll handles duplicates', () => {
    const mh = new MinHash2();
    mh.addAll(['apple', 'apple', 'banana', 'banana']);
    expect(mh.size()).toBe(2);
  });

  it('computes self-similarity', () => {
    const mh = new MinHash2();
    mh.add('apple');
    mh.add('banana');
    expect(mh.similarity(mh)).toBe(1.0);
  });

  it('computes similarity for identical sets', () => {
    const mh1 = new MinHash2(100);
    const mh2 = new MinHash2(100);
    mh1.add('apple');
    mh1.add('banana');
    mh1.add('cherry');
    mh2.add('apple');
    mh2.add('banana');
    mh2.add('cherry');
    expect(mh1.similarity(mh2)).toBeCloseTo(1.0, 1);
  });

  it('computes similarity for disjoint sets', () => {
    const mh1 = new MinHash2(100);
    const mh2 = new MinHash2(100);
    mh1.add('apple');
    mh1.add('banana');
    mh2.add('orange');
    mh2.add('grape');
    expect(mh1.similarity(mh2)).toBeCloseTo(0.0, 1);
  });

  it('computes similarity for partially overlapping sets', () => {
    const mh1 = new MinHash2(100);
    const mh2 = new MinHash2(100);
    mh1.add('apple');
    mh1.add('banana');
    mh1.add('cherry');
    mh2.add('banana');
    mh2.add('cherry');
    mh2.add('date');
    const sim = mh1.similarity(mh2);
    expect(sim).toBeGreaterThan(0.0);
    expect(sim).toBeLessThan(1.0);
  });

  it('computes similarity for different sized sets with overlap', () => {
    const mh1 = new MinHash2(128);
    const mh2 = new MinHash2(128);
    mh1.add('apple');
    mh1.add('banana');
    mh1.add('cherry');
    mh2.add('banana');
    mh2.add('cherry');
    mh2.add('date');
    mh2.add('elderberry');
    const sim = mh1.similarity(mh2);
    expect(sim).toBeGreaterThan(0.0);
    expect(sim).toBeLessThan(1.0);
  });

  it('throws error for different numHashes', () => {
    const mh1 = new MinHash2(100);
    const mh2 = new MinHash2(200);
    expect(() => mh1.similarity(mh2)).toThrow('MinHash instances must have same number of hashes');
  });

  it('computes similarity for empty sets', () => {
    const mh1 = new MinHash2(100);
    const mh2 = new MinHash2(100);
    expect(mh1.similarity(mh2)).toBe(1.0);
  });

  it('computes similarity for one empty set', () => {
    const mh1 = new MinHash2(100);
    const mh2 = new MinHash2(100);
    mh1.add('apple');
    expect(mh1.similarity(mh2)).toBeCloseTo(0.0, 1);
  });

  it('handles large number of items', () => {
    const mh = new MinHash2();
    for (let i = 0; i < 1000; i++) {
      mh.add(`item${i}`);
    }
    expect(mh.size()).toBe(1000);
  });

  it('signature values are finite after adding items', () => {
    const mh = new MinHash2(10);
    mh.add('test');
    const sig = mh.getSignature();
    for (let i = 0; i < sig.length; i++) {
      expect(isFinite(sig[i])).toBe(true);
    }
  });

  it('clear resets size to 0', () => {
    const mh = new MinHash2();
    mh.add('a');
    mh.add('b');
    expect(mh.size()).toBe(2);
    mh.clear();
    expect(mh.size()).toBe(0);
  });

  it('clear resets signature to Infinity', () => {
    const mh = new MinHash2(10);
    mh.add('test');
    mh.clear();
    const sig = mh.getSignature();
    for (let i = 0; i < sig.length; i++) {
      expect(sig[i]).toBe(Infinity);
    }
  });

  it('addAll adds multiple items', () => {
    const mh = new MinHash2();
    mh.addAll(['a', 'b', 'c']);
    expect(mh.size()).toBe(3);
  });

  it('addAll deduplicates', () => {
    const mh = new MinHash2();
    mh.addAll(['a', 'b', 'a', 'c', 'b']);
    expect(mh.size()).toBe(3);
  });

  it('similarity is 1 for identical sets', () => {
    const mh1 = new MinHash2(100);
    const mh2 = new MinHash2(100);
    mh1.addAll(['a', 'b', 'c']);
    mh2.addAll(['a', 'b', 'c']);
    expect(mh1.similarity(mh2)).toBe(1.0);
  });

  it('accepts custom seed', () => {
    const mh1 = new MinHash2(50, 42);
    const mh2 = new MinHash2(50, 99);
    mh1.add('same');
    mh2.add('same');
    expect(mh1.getSignature()).not.toEqual(mh2.getSignature());
  });

  it('should handle empty signature', () => {
    const mh = new MinHash2(10);
    expect(mh.size()).toBe(0);
    const sig = mh.getSignature();
    expect(sig.length).toBe(10);
  });

  it('should handle jaccard with completely different sets', () => {
    const mh1 = new MinHash2(200);
    const mh2 = new MinHash2(200);
    mh1.addAll(['x', 'y', 'z']);
    mh2.addAll(['a', 'b', 'c']);
    expect(mh1.similarity(mh2)).toBeLessThan(0.5);
  });

  it('should handle getSignature length', () => {
    const mh = new MinHash2(50);
    expect(mh.getSignature().length).toBe(50);
  });

  it('should handle size', () => {
    const mh = new MinHash2();
    expect(mh.size()).toBe(0);
    mh.add('a');
    mh.add('b');
    expect(mh.size()).toBe(2);
  });

  it('should handle clear', () => {
    const mh = new MinHash2();
    mh.add('a');
    mh.add('b');
    mh.clear();
    expect(mh.size()).toBe(0);
  });

  it('should handle similarity with itself', () => {
    const mh = new MinHash2();
    mh.addAll(['a', 'b', 'c']);
    expect(mh.similarity(mh)).toBeCloseTo(1, 5);
  });
});
