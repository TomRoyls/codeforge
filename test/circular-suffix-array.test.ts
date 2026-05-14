import { describe, it, expect } from 'vitest';
import { CircularSuffixArray } from '../src/core/circular-suffix-array/index.js';

describe('CircularSuffixArray', () => {
  describe('constructor with string', () => {
    it('creates array from string', () => {
      const csa = new CircularSuffixArray('banana');
      expect(csa.length()).toBe(6);
    });

    it('creates array from empty string', () => {
      const csa = new CircularSuffixArray('');
      expect(csa.length()).toBe(0);
    });

    it('creates array from single character', () => {
      const csa = new CircularSuffixArray('a');
      expect(csa.length()).toBe(1);
    });

    it('creates array from single character repeated', () => {
      const csa = new CircularSuffixArray('aaaa');
      expect(csa.length()).toBe(4);
    });

    it('creates array from mixed characters', () => {
      const csa = new CircularSuffixArray('abcabc');
      expect(csa.length()).toBe(6);
    });
  });

  describe('constructor with number array', () => {
    it('creates array from numbers', () => {
      const csa = new CircularSuffixArray([1, 2, 3, 4, 5]);
      expect(csa.length()).toBe(5);
    });

    it('creates array from empty array', () => {
      const csa = new CircularSuffixArray([]);
      expect(csa.length()).toBe(0);
    });

    it('creates array from single number', () => {
      const csa = new CircularSuffixArray([42]);
      expect(csa.length()).toBe(1);
    });

    it('creates array from repeated numbers', () => {
      const csa = new CircularSuffixArray([1, 1, 1, 1]);
      expect(csa.length()).toBe(4);
    });

    it('creates array from mixed numbers', () => {
      const csa = new CircularSuffixArray([1, 2, 3, 1, 2, 3]);
      expect(csa.length()).toBe(6);
    });
  });

  describe('length', () => {
    it('returns 0 for empty data', () => {
      const csa = new CircularSuffixArray('');
      expect(csa.length()).toBe(0);
    });

    it('returns correct length for string', () => {
      const csa = new CircularSuffixArray('hello');
      expect(csa.length()).toBe(5);
    });

    it('returns correct length for array', () => {
      const csa = new CircularSuffixArray([1, 2, 3, 4, 5, 6]);
      expect(csa.length()).toBe(6);
    });
  });

  describe('index', () => {
    it('returns suffix array index at position', () => {
      const csa = new CircularSuffixArray('banana');
      expect(csa.index(0)).toBeGreaterThanOrEqual(0);
      expect(csa.index(0)).toBeLessThan(6);
    });

    it('throws for negative index', () => {
      const csa = new CircularSuffixArray('banana');
      expect(() => csa.index(-1)).toThrow(RangeError);
    });

    it('throws for out of bounds index', () => {
      const csa = new CircularSuffixArray('banana');
      expect(() => csa.index(6)).toThrow(RangeError);
    });

    it('handles empty array', () => {
      const csa = new CircularSuffixArray('');
      expect(() => csa.index(0)).toThrow(RangeError);
    });

    it('returns valid indices for all positions', () => {
      const csa = new CircularSuffixArray('abc');
      for (let i = 0; i < 3; i++) {
        expect(csa.index(i)).toBeGreaterThanOrEqual(0);
        expect(csa.index(i)).toBeLessThan(3);
      }
    });
  });

  describe('rank', () => {
    it('returns rank for position', () => {
      const csa = new CircularSuffixArray('banana');
      expect(csa.rank(0)).toBeGreaterThanOrEqual(0);
      expect(csa.rank(0)).toBeLessThan(6);
    });

    it('throws for negative position', () => {
      const csa = new CircularSuffixArray('banana');
      expect(() => csa.rank(-1)).toThrow(RangeError);
    });

    it('throws for out of bounds position', () => {
      const csa = new CircularSuffixArray('banana');
      expect(() => csa.rank(6)).toThrow(RangeError);
    });

    it('handles empty array', () => {
      const csa = new CircularSuffixArray('');
      expect(() => csa.rank(0)).toThrow(RangeError);
    });

    it('returns unique ranks for different positions', () => {
      const csa = new CircularSuffixArray('abc');
      const ranks = [csa.rank(0), csa.rank(1), csa.rank(2)];
      const uniqueRanks = new Set(ranks);
      expect(uniqueRanks.size).toBe(3);
    });
  });

  describe('getData', () => {
    it('returns copy of data from string', () => {
      const csa = new CircularSuffixArray('abc');
      const data = csa.getData();
      expect(data).toEqual([97, 98, 99]);
    });

    it('returns copy of data from array', () => {
      const csa = new CircularSuffixArray([1, 2, 3]);
      const data = csa.getData();
      expect(data).toEqual([1, 2, 3]);
    });

    it('returns empty array for empty input', () => {
      const csa = new CircularSuffixArray('');
      const data = csa.getData();
      expect(data).toEqual([]);
    });

    it('returns independent copy', () => {
      const original = [1, 2, 3];
      const csa = new CircularSuffixArray(original);
      const data = csa.getData();
      data[0] = 99;
      expect(csa.getData()).toEqual([1, 2, 3]);
    });
  });

  describe('lcp', () => {
    it('returns LCP at position', () => {
      const csa = new CircularSuffixArray('banana');
      expect(csa.lcp(0)).toBe(0);
    });

    it('throws for negative index', () => {
      const csa = new CircularSuffixArray('banana');
      expect(() => csa.lcp(-1)).toThrow(RangeError);
    });

    it('throws for out of bounds index', () => {
      const csa = new CircularSuffixArray('banana');
      expect(() => csa.lcp(6)).toThrow(RangeError);
    });

    it('handles empty array', () => {
      const csa = new CircularSuffixArray('');
      expect(() => csa.lcp(0)).toThrow(RangeError);
    });

    it('returns non-negative values', () => {
      const csa = new CircularSuffixArray('abracadabra');
      for (let i = 0; i < csa.length(); i++) {
        expect(csa.lcp(i)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('bwt', () => {
    it('returns BWT for string', () => {
      const csa = new CircularSuffixArray('banana');
      const bwt = csa.bwt();
      expect(bwt.length).toBe(6);
    });

    it('returns empty array for empty input', () => {
      const csa = new CircularSuffixArray('');
      const bwt = csa.bwt();
      expect(bwt).toEqual([]);
    });

    it('returns array of same length as input', () => {
      const csa = new CircularSuffixArray('hello');
      const bwt = csa.bwt();
      expect(bwt.length).toBe(csa.length());
    });

    it('handles repeated characters', () => {
      const csa = new CircularSuffixArray('aaaa');
      const bwt = csa.bwt();
      expect(bwt.length).toBe(4);
    });

    it('returns valid character codes', () => {
      const csa = new CircularSuffixArray('abc');
      const bwt = csa.bwt();
      bwt.forEach(code => {
        expect(code).toBeGreaterThanOrEqual(97);
        expect(code).toBeLessThan(123);
      });
    });
  });

  describe('originalIndex', () => {
    it('returns index of original string', () => {
      const csa = new CircularSuffixArray('banana');
      expect(csa.originalIndex()).toBeGreaterThanOrEqual(0);
      expect(csa.originalIndex()).toBeLessThan(6);
    });

    it('throws for empty array', () => {
      const csa = new CircularSuffixArray('');
      expect(() => csa.originalIndex()).toThrow(Error);
    });

    it('returns valid index for single character', () => {
      const csa = new CircularSuffixArray('a');
      expect(csa.originalIndex()).toBe(0);
    });

    it('returns valid index for repeated characters', () => {
      const csa = new CircularSuffixArray('aaaa');
      expect(csa.originalIndex()).toBeGreaterThanOrEqual(0);
      expect(csa.originalIndex()).toBeLessThan(4);
    });
  });

  describe('inverse', () => {
    it('returns inverse suffix array', () => {
      const csa = new CircularSuffixArray('banana');
      const inverse = csa.inverse();
      expect(inverse.length).toBe(6);
    });

    it('returns empty array for empty input', () => {
      const csa = new CircularSuffixArray('');
      const inverse = csa.inverse();
      expect(inverse).toEqual([]);
    });

    it('returns array of same length as input', () => {
      const csa = new CircularSuffixArray('hello');
      const inverse = csa.inverse();
      expect(inverse.length).toBe(csa.length());
    });

    it('contains all indices 0 to n-1', () => {
      const csa = new CircularSuffixArray('abcdef');
      const inverse = csa.inverse();
      const sorted = [...inverse].sort((a, b) => a - b);
      expect(sorted).toEqual([0, 1, 2, 3, 4, 5]);
    });
  });

  describe('select', () => {
    it('finds k-th occurrence of character in BWT', () => {
      const csa = new CircularSuffixArray('banana');
      const index = csa.select(97, 0);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(6);
    });

    it('finds first occurrence', () => {
      const csa = new CircularSuffixArray('abracadabra');
      const index = csa.select(97, 0);
      expect(index).toBeGreaterThanOrEqual(0);
    });

    it('throws for non-existent occurrence', () => {
      const csa = new CircularSuffixArray('banana');
      expect(() => csa.select(97, 100)).toThrow(RangeError);
    });

    it('throws for character not in BWT', () => {
      const csa = new CircularSuffixArray('banana');
      expect(() => csa.select(122, 0)).toThrow(RangeError);
    });

    it('handles empty array', () => {
      const csa = new CircularSuffixArray('');
      expect(() => csa.select(97, 0)).toThrow(RangeError);
    });

    it('returns different indices for different occurrences', () => {
      const csa = new CircularSuffixArray('banana');
      const index1 = csa.select(97, 0);
      const index2 = csa.select(97, 1);
      const index3 = csa.select(97, 2);
      const unique = new Set([index1, index2, index3]);
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe('special cases', () => {
    it('handles single character string', () => {
      const csa = new CircularSuffixArray('a');
      expect(csa.length()).toBe(1);
      expect(csa.getData()).toEqual([97]);
      expect(csa.index(0)).toBe(0);
      expect(csa.rank(0)).toBe(0);
      expect(csa.lcp(0)).toBe(0);
    });

    it('handles two character string', () => {
      const csa = new CircularSuffixArray('ab');
      expect(csa.length()).toBe(2);
      expect(csa.getData()).toEqual([97, 98]);
      expect(csa.index(0)).toBeLessThan(2);
      expect(csa.index(1)).toBeLessThan(2);
    });

    it('handles string with all same characters', () => {
      const csa = new CircularSuffixArray('aaaaa');
      expect(csa.length()).toBe(5);
      expect(csa.getData().every(v => v === 97)).toBe(true);
    });

    it('handles string with spaces', () => {
      const csa = new CircularSuffixArray('a b c');
      expect(csa.length()).toBe(5);
    });

    it('handles numeric array with zeros', () => {
      const csa = new CircularSuffixArray([0, 0, 0]);
      expect(csa.length()).toBe(3);
      expect(csa.getData()).toEqual([0, 0, 0]);
    });
  });

  describe('consistency', () => {
    it('index and rank are inverse of each other', () => {
      const csa = new CircularSuffixArray('abcdefgh');
      for (let i = 0; i < csa.length(); i++) {
        expect(csa.rank(csa.index(i))).toBe(i);
      }
    });

    it('all suffix array indices are unique', () => {
      const csa = new CircularSuffixArray('abracadabra');
      const indices: number[] = [];
      for (let i = 0; i < csa.length(); i++) {
        indices.push(csa.index(i));
      }
      const unique = new Set(indices);
      expect(unique.size).toBe(indices.length);
    });

    it('all ranks are unique', () => {
      const csa = new CircularSuffixArray('mississippi');
      const ranks: number[] = [];
      for (let i = 0; i < csa.length(); i++) {
        ranks.push(csa.rank(i));
      }
      const unique = new Set(ranks);
      expect(unique.size).toBe(ranks.length);
    });
  });

  describe('larger inputs', () => {
    it('handles longer string', () => {
      const csa = new CircularSuffixArray('thequickbrownfoxjumpsoverthelazydog');
      expect(csa.length()).toBe(35);
      expect(csa.getData().length).toBe(35);
    });

    it('handles larger array', () => {
      const values = Array.from({ length: 100 }, (_, i) => i % 10);
      const csa = new CircularSuffixArray(values);
      expect(csa.length()).toBe(100);
    });
  });

  describe('unicode characters', () => {
    it('handles unicode string', () => {
      const csa = new CircularSuffixArray('héllo');
      expect(csa.length()).toBe(5);
      expect(csa.getData().length).toBe(5);
    });
  });
});
