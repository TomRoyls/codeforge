import { describe, it, expect } from 'vitest';
import { PolyHash } from '../src/core/poly-hash/index.js';

describe('PolyHash', () => {
  describe('constructor', () => {
    it('should create with default options', () => {
      const ph = new PolyHash('abc');
      expect(ph.size).toBe(3);
      expect(ph.isEmpty).toBe(false);
      expect(ph.base).toBe(31);
      expect(ph.mod).toBe(1_000_000_007);
    });

    it('should create with custom base', () => {
      const ph = new PolyHash('abc', { base: 37 });
      expect(ph.base).toBe(37);
      expect(ph.size).toBe(3);
    });

    it('should create with custom mod', () => {
      const ph = new PolyHash('abc', { mod: 1_000_000_009 });
      expect(ph.mod).toBe(1_000_000_009);
      expect(ph.size).toBe(3);
    });

    it('should create with empty string', () => {
      const ph = new PolyHash('');
      expect(ph.size).toBe(0);
      expect(ph.isEmpty).toBe(true);
    });

    it('should create with single character', () => {
      const ph = new PolyHash('a');
      expect(ph.size).toBe(1);
      expect(ph.isEmpty).toBe(false);
    });

    it('should handle unicode characters', () => {
      const ph = new PolyHash('héllo');
      expect(ph.size).toBe(5);
    });

    it('should handle special characters', () => {
      const ph = new PolyHash('!@#$%');
      expect(ph.size).toBe(5);
    });
  });

  describe('size getter', () => {
    it('should return 0 for empty string', () => {
      const ph = new PolyHash('');
      expect(ph.size).toBe(0);
    });

    it('should return length of string', () => {
      const ph = new PolyHash('hello');
      expect(ph.size).toBe(5);
    });

    it('should return correct size after append', () => {
      const ph = new PolyHash('ab');
      ph.append('c');
      expect(ph.size).toBe(3);
    });

    it('should return correct size after popBack', () => {
      const ph = new PolyHash('abc');
      ph.popBack();
      expect(ph.size).toBe(2);
    });

    it('should return correct size after clear', () => {
      const ph = new PolyHash('abc');
      ph.clear();
      expect(ph.size).toBe(0);
    });
  });

  describe('isEmpty getter', () => {
    it('should return true for empty string', () => {
      const ph = new PolyHash('');
      expect(ph.isEmpty).toBe(true);
    });

    it('should return false for non-empty string', () => {
      const ph = new PolyHash('a');
      expect(ph.isEmpty).toBe(false);
    });

    it('should return true after clear', () => {
      const ph = new PolyHash('abc');
      ph.clear();
      expect(ph.isEmpty).toBe(true);
    });
  });

  describe('base getter', () => {
    it('should return default base', () => {
      const ph = new PolyHash('abc');
      expect(ph.base).toBe(31);
    });

    it('should return custom base', () => {
      const ph = new PolyHash('abc', { base: 37 });
      expect(ph.base).toBe(37);
    });
  });

  describe('mod getter', () => {
    it('should return default mod', () => {
      const ph = new PolyHash('abc');
      expect(ph.mod).toBe(1_000_000_007);
    });

    it('should return custom mod', () => {
      const ph = new PolyHash('abc', { mod: 1_000_000_009 });
      expect(ph.mod).toBe(1_000_000_009);
    });
  });

  describe('hash', () => {
    it('should return hash for empty string', () => {
      const ph = new PolyHash('');
      expect(ph.hash()).toBe(0);
    });

    it('should return hash for single character', () => {
      const ph = new PolyHash('a');
      const hash = ph.hash();
      expect(hash).toBeGreaterThan(0);
      expect(hash).toBeLessThan(ph.mod);
    });

    it('should return hash for multiple characters', () => {
      const ph = new PolyHash('abc');
      const hash = ph.hash();
      expect(hash).toBeGreaterThan(0);
      expect(hash).toBeLessThan(ph.mod);
    });

    it('should return consistent hash for same string', () => {
      const ph1 = new PolyHash('abc');
      const ph2 = new PolyHash('abc');
      expect(ph1.hash()).toBe(ph2.hash());
    });

    it('should return different hash for different strings', () => {
      const ph1 = new PolyHash('abc');
      const ph2 = new PolyHash('def');
      expect(ph1.hash()).not.toBe(ph2.hash());
    });
  });

  describe('hashRange', () => {
    it('should return hash for full range', () => {
      const ph = new PolyHash('abc');
      const hash = ph.hashRange(0, 3);
      expect(hash).toBe(ph.hash());
    });

    it('should return hash for prefix', () => {
      const ph = new PolyHash('abcdef');
      const hash = ph.hashRange(0, 3);
      expect(hash).toBeGreaterThan(0);
    });

    it('should return hash for suffix', () => {
      const ph = new PolyHash('abcdef');
      const hash = ph.hashRange(3, 6);
      expect(hash).toBeGreaterThan(0);
    });

    it('should return hash for middle range', () => {
      const ph = new PolyHash('abcdef');
      const hash = ph.hashRange(2, 4);
      expect(hash).toBeGreaterThan(0);
    });

    it('should return 0 for empty range', () => {
      const ph = new PolyHash('abc');
      expect(ph.hashRange(0, 0)).toBe(0);
    });

    it('should throw for negative l', () => {
      const ph = new PolyHash('abc');
      expect(() => ph.hashRange(-1, 2)).toThrow(RangeError);
    });

    it('should throw for negative r', () => {
      const ph = new PolyHash('abc');
      expect(() => ph.hashRange(0, -1)).toThrow(RangeError);
    });

    it('should throw for l > r', () => {
      const ph = new PolyHash('abc');
      expect(() => ph.hashRange(2, 1)).toThrow(RangeError);
    });

    it('should throw for r > size', () => {
      const ph = new PolyHash('abc');
      expect(() => ph.hashRange(0, 10)).toThrow(RangeError);
    });

    it('should throw for l > size', () => {
      const ph = new PolyHash('abc');
      expect(() => ph.hashRange(5, 6)).toThrow(RangeError);
    });
  });

  describe('hashPrefix', () => {
    it('should return hash for full prefix', () => {
      const ph = new PolyHash('abc');
      expect(ph.hashPrefix(3)).toBe(ph.hash());
    });

    it('should return hash for partial prefix', () => {
      const ph = new PolyHash('abcdef');
      const hash = ph.hashPrefix(3);
      expect(hash).toBeGreaterThan(0);
    });

    it('should return 0 for empty prefix', () => {
      const ph = new PolyHash('abc');
      expect(ph.hashPrefix(0)).toBe(0);
    });

    it('should throw for negative n', () => {
      const ph = new PolyHash('abc');
      expect(() => ph.hashPrefix(-1)).toThrow(RangeError);
    });

    it('should throw for n > size', () => {
      const ph = new PolyHash('abc');
      expect(() => ph.hashPrefix(10)).toThrow(RangeError);
    });

    it('should handle n equal to size', () => {
      const ph = new PolyHash('abc');
      expect(ph.hashPrefix(3)).toBe(ph.hash());
    });
  });

  describe('append', () => {
    it('should append character to empty string', () => {
      const ph = new PolyHash('');
      ph.append('a');
      expect(ph.size).toBe(1);
      expect(ph.toString()).toBe('a');
    });

    it('should append character to non-empty string', () => {
      const ph = new PolyHash('ab');
      ph.append('c');
      expect(ph.size).toBe(3);
      expect(ph.toString()).toBe('abc');
    });

    it('should append multiple characters', () => {
      const ph = new PolyHash('');
      ph.append('a');
      ph.append('b');
      ph.append('c');
      expect(ph.size).toBe(3);
      expect(ph.toString()).toBe('abc');
    });

    it('should throw for empty string', () => {
      const ph = new PolyHash('a');
      expect(() => ph.append('')).toThrow(RangeError);
    });

    it('should throw for multi-character string', () => {
      const ph = new PolyHash('a');
      expect(() => ph.append('ab')).toThrow(RangeError);
    });

    it('should update hash after append', () => {
      const ph = new PolyHash('ab');
      const hash1 = ph.hash();
      ph.append('c');
      const hash2 = ph.hash();
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('pushFront', () => {
    it('should push character to empty string', () => {
      const ph = new PolyHash('');
      ph.pushFront('a');
      expect(ph.size).toBe(1);
      expect(ph.toString()).toBe('a');
    });

    it('should push character to front of non-empty string', () => {
      const ph = new PolyHash('bc');
      ph.pushFront('a');
      expect(ph.size).toBe(3);
      expect(ph.toString()).toBe('abc');
    });

    it('should push multiple characters to front', () => {
      const ph = new PolyHash('');
      ph.pushFront('c');
      ph.pushFront('b');
      ph.pushFront('a');
      expect(ph.size).toBe(3);
      expect(ph.toString()).toBe('abc');
    });

    it('should throw for empty string', () => {
      const ph = new PolyHash('a');
      expect(() => ph.pushFront('')).toThrow(RangeError);
    });

    it('should throw for multi-character string', () => {
      const ph = new PolyHash('a');
      expect(() => ph.pushFront('ab')).toThrow(RangeError);
    });

    it('should update hash after pushFront', () => {
      const ph = new PolyHash('bc');
      const hash1 = ph.hash();
      ph.pushFront('a');
      const hash2 = ph.hash();
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('popBack', () => {
    it('should return undefined for empty string', () => {
      const ph = new PolyHash('');
      expect(ph.popBack()).toBe(undefined);
      expect(ph.size).toBe(0);
    });

    it('should remove last character', () => {
      const ph = new PolyHash('abc');
      const result = ph.popBack();
      expect(result).toBe('c');
      expect(ph.size).toBe(2);
      expect(ph.toString()).toBe('ab');
    });

    it('should remove last character of single char string', () => {
      const ph = new PolyHash('a');
      const result = ph.popBack();
      expect(result).toBe('a');
      expect(ph.size).toBe(0);
      expect(ph.isEmpty).toBe(true);
    });

    it('should update hash after popBack', () => {
      const ph = new PolyHash('abc');
      const hash1 = ph.hash();
      ph.popBack();
      const hash2 = ph.hash();
      expect(hash1).not.toBe(hash2);
    });

    it('should allow multiple pops', () => {
      const ph = new PolyHash('abc');
      expect(ph.popBack()).toBe('c');
      expect(ph.popBack()).toBe('b');
      expect(ph.popBack()).toBe('a');
      expect(ph.popBack()).toBe(undefined);
      expect(ph.size).toBe(0);
    });
  });

  describe('toString', () => {
    it('should return empty string for empty', () => {
      const ph = new PolyHash('');
      expect(ph.toString()).toBe('');
    });

    it('should return original string', () => {
      const ph = new PolyHash('hello');
      expect(ph.toString()).toBe('hello');
    });

    it('should return string after append', () => {
      const ph = new PolyHash('ab');
      ph.append('c');
      expect(ph.toString()).toBe('abc');
    });

    it('should return string after popBack', () => {
      const ph = new PolyHash('abc');
      ph.popBack();
      expect(ph.toString()).toBe('ab');
    });

    it('should return string after pushFront', () => {
      const ph = new PolyHash('bc');
      ph.pushFront('a');
      expect(ph.toString()).toBe('abc');
    });

    it('should return string after clear', () => {
      const ph = new PolyHash('abc');
      ph.clear();
      expect(ph.toString()).toBe('');
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty string', () => {
      const ph = new PolyHash('');
      expect(ph.toArray()).toEqual([]);
    });

    it('should return array of hash values', () => {
      const ph = new PolyHash('abc');
      const arr = ph.toArray();
      expect(arr).toHaveLength(3);
      expect(arr[0]).toBeGreaterThan(0);
    });

    it('should return new array each call', () => {
      const ph = new PolyHash('abc');
      const arr1 = ph.toArray();
      const arr2 = ph.toArray();
      expect(arr1).not.toBe(arr2);
      expect(arr1).toEqual(arr2);
    });

    it('should not be affected by array modification', () => {
      const ph = new PolyHash('abc');
      const arr1 = ph.toArray();
      arr1.push(123);
      const arr2 = ph.toArray();
      expect(arr2.length).toBe(3);
    });
  });

  describe('clone', () => {
    it('should clone empty instance', () => {
      const ph1 = new PolyHash('');
      const ph2 = ph1.clone();
      expect(ph2.size).toBe(0);
      expect(ph2.isEmpty).toBe(true);
    });

    it('should clone non-empty instance', () => {
      const ph1 = new PolyHash('abc');
      const ph2 = ph1.clone();
      expect(ph2.size).toBe(3);
      expect(ph2.toString()).toBe('abc');
      expect(ph2.hash()).toBe(ph1.hash());
    });

    it('should create independent copy', () => {
      const ph1 = new PolyHash('ab');
      const ph2 = ph1.clone();
      ph2.append('c');
      expect(ph1.size).toBe(2);
      expect(ph2.size).toBe(3);
      expect(ph1.toString()).toBe('ab');
      expect(ph2.toString()).toBe('abc');
    });

    it('should clone with same options', () => {
      const ph1 = new PolyHash('abc', { base: 37, mod: 1_000_000_009 });
      const ph2 = ph1.clone();
      expect(ph2.base).toBe(37);
      expect(ph2.mod).toBe(1_000_000_009);
    });
  });

  describe('fromString static', () => {
    it('should create instance from string', () => {
      const ph = PolyHash.fromString('abc');
      expect(ph.size).toBe(3);
      expect(ph.toString()).toBe('abc');
    });

    it('should create instance with options', () => {
      const ph = PolyHash.fromString('abc', { base: 37, mod: 1_000_000_009 });
      expect(ph.base).toBe(37);
      expect(ph.mod).toBe(1_000_000_009);
    });

    it('should create same as constructor', () => {
      const ph1 = new PolyHash('abc');
      const ph2 = PolyHash.fromString('abc');
      expect(ph1.hash()).toBe(ph2.hash());
    });
  });

  describe('clear', () => {
    it('should clear empty instance', () => {
      const ph = new PolyHash('');
      ph.clear();
      expect(ph.size).toBe(0);
      expect(ph.isEmpty).toBe(true);
      expect(ph.hash()).toBe(0);
    });

    it('should clear non-empty instance', () => {
      const ph = new PolyHash('abc');
      ph.clear();
      expect(ph.size).toBe(0);
      expect(ph.isEmpty).toBe(true);
      expect(ph.hash()).toBe(0);
      expect(ph.toString()).toBe('');
    });

    it('should reset hash after clear', () => {
      const ph = new PolyHash('abc');
      const hash1 = ph.hash();
      ph.clear();
      const hash2 = ph.hash();
      expect(hash1).not.toBe(0);
      expect(hash2).toBe(0);
    });

    it('should allow operations after clear', () => {
      const ph = new PolyHash('ab');
      ph.clear();
      ph.append('c');
      expect(ph.size).toBe(1);
      expect(ph.toString()).toBe('c');
    });
  });

  describe('forEach', () => {
    it('should not call callback for empty string', () => {
      const ph = new PolyHash('');
      let count = 0;
      ph.forEach(() => count++);
      expect(count).toBe(0);
    });

    it('should call callback for each character', () => {
      const ph = new PolyHash('abc');
      const chars: string[] = [];
      ph.forEach((char) => chars.push(char));
      expect(chars).toEqual(['a', 'b', 'c']);
    });

    it('should pass character and index', () => {
      const ph = new PolyHash('abc');
      const results: [string, number][] = [];
      ph.forEach((char, index) => results.push([char, index]));
      expect(results).toEqual([
        ['a', 0],
        ['b', 1],
        ['c', 2]
      ]);
    });

    it('should handle unicode characters', () => {
      const ph = new PolyHash('héllo');
      const chars: string[] = [];
      ph.forEach((char) => chars.push(char));
      expect(chars).toHaveLength(5);
    });
  });

  describe('iterator', () => {
    it('should not iterate over empty string', () => {
      const ph = new PolyHash('');
      const result = [...ph];
      expect(result).toEqual([]);
    });

    it('should iterate over all characters', () => {
      const ph = new PolyHash('abc');
      const result = [...ph];
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should support for-of loop', () => {
      const ph = new PolyHash('abc');
      const chars: string[] = [];
      for (const char of ph) {
        chars.push(char);
      }
      expect(chars).toEqual(['a', 'b', 'c']);
    });

    it('should handle unicode characters', () => {
      const ph = new PolyHash('héllo');
      const chars = [...ph];
      expect(chars).toHaveLength(5);
    });
  });

  describe('charAt', () => {
    it('should return character at index', () => {
      const ph = new PolyHash('abc');
      expect(ph.charAt(0)).toBe('a');
      expect(ph.charAt(1)).toBe('b');
      expect(ph.charAt(2)).toBe('c');
    });

    it('should throw for negative index', () => {
      const ph = new PolyHash('abc');
      expect(() => ph.charAt(-1)).toThrow(RangeError);
    });

    it('should throw for index >= size', () => {
      const ph = new PolyHash('abc');
      expect(() => ph.charAt(3)).toThrow(RangeError);
      expect(() => ph.charAt(10)).toThrow(RangeError);
    });

    it('should handle unicode characters', () => {
      const ph = new PolyHash('héllo');
      expect(ph.charAt(1)).toBe('é');
    });
  });

  describe('substring', () => {
    it('should return substring with start and end', () => {
      const ph = new PolyHash('abcdef');
      expect(ph.substring(1, 4)).toBe('bcd');
    });

    it('should return substring with only start', () => {
      const ph = new PolyHash('abcdef');
      expect(ph.substring(2)).toBe('cdef');
    });

    it('should return full string with 0 start', () => {
      const ph = new PolyHash('abcdef');
      expect(ph.substring(0)).toBe('abcdef');
    });

    it('should return empty string for start == end', () => {
      const ph = new PolyHash('abcdef');
      expect(ph.substring(2, 2)).toBe('');
    });

    it('should throw for negative start', () => {
      const ph = new PolyHash('abc');
      expect(() => ph.substring(-1)).toThrow(RangeError);
    });

    it('should throw for end > size', () => {
      const ph = new PolyHash('abc');
      expect(() => ph.substring(0, 10)).toThrow(RangeError);
    });

    it('should throw for start > end', () => {
      const ph = new PolyHash('abc');
      expect(() => ph.substring(3, 1)).toThrow(RangeError);
    });

    it('should throw for start > size', () => {
      const ph = new PolyHash('abc');
      expect(() => ph.substring(5)).toThrow(RangeError);
    });
  });

  describe('equals', () => {
    it('should return true for identical strings', () => {
      const ph1 = new PolyHash('abc');
      const ph2 = new PolyHash('abc');
      expect(ph1.equals(ph2)).toBe(true);
    });

    it('should return false for different strings', () => {
      const ph1 = new PolyHash('abc');
      const ph2 = new PolyHash('def');
      expect(ph1.equals(ph2)).toBe(false);
    });

    it('should return true for empty strings', () => {
      const ph1 = new PolyHash('');
      const ph2 = new PolyHash('');
      expect(ph1.equals(ph2)).toBe(true);
    });

    it('should return false for different sizes', () => {
      const ph1 = new PolyHash('ab');
      const ph2 = new PolyHash('abc');
      expect(ph1.equals(ph2)).toBe(false);
    });

    it('should return false for same size different content', () => {
      const ph1 = new PolyHash('abc');
      const ph2 = new PolyHash('def');
      expect(ph1.equals(ph2)).toBe(false);
    });
  });

  describe('power', () => {
    it('should return power for exponent 0', () => {
      const ph = new PolyHash('abc');
      expect(ph.power(0)).toBe(1);
    });

    it('should return power for exponent 1', () => {
      const ph = new PolyHash('abc');
      expect(ph.power(1)).toBe(ph.base);
    });

    it('should return power for small exponent', () => {
      const ph = new PolyHash('abc');
      const power = ph.power(3);
      expect(power).toBeGreaterThan(0);
    });

    it('should throw for negative exponent', () => {
      const ph = new PolyHash('abc');
      expect(() => ph.power(-1)).toThrow(RangeError);
      expect(() => ph.power(-10)).toThrow(RangeError);
    });

    it('should return consistent values', () => {
      const ph = new PolyHash('abc');
      expect(ph.power(5)).toBe(ph.power(5));
    });
  });

  describe('inversePower', () => {
    it('should return inverse power for exponent 0', () => {
      const ph = new PolyHash('abc');
      expect(ph.inversePower(0)).toBe(1);
    });

    it('should return inverse power for small exponent', () => {
      const ph = new PolyHash('abc');
      const power = ph.inversePower(1);
      expect(power).toBeGreaterThan(0);
    });

    it('should throw for negative exponent', () => {
      const ph = new PolyHash('abc');
      expect(() => ph.inversePower(-1)).toThrow(RangeError);
      expect(() => ph.inversePower(-10)).toThrow(RangeError);
    });

    it('should return consistent values', () => {
      const ph = new PolyHash('abc');
      expect(ph.inversePower(5)).toBe(ph.inversePower(5));
    });
  });

  describe('doubleHash static', () => {
    it('should return two different hashes', () => {
      const result = PolyHash.doubleHash('abc');
      expect(result.hash1).not.toBe(result.hash2);
    });

    it('should use base 31 by default', () => {
      const ph = new PolyHash('abc', { base: 31 });
      const result = PolyHash.doubleHash('abc');
      expect(result.hash1).toBe(ph.hash());
    });

    it('should use base 37 as second hash when base is 31', () => {
      const ph = new PolyHash('abc', { base: 37 });
      const result = PolyHash.doubleHash('abc');
      expect(result.hash2).toBe(ph.hash());
    });

    it('should use same mod for both hashes', () => {
      const result = PolyHash.doubleHash('abc', { mod: 1_000_000_009 });
      expect(result.hash1).toBeLessThan(1_000_000_009);
      expect(result.hash2).toBeLessThan(1_000_000_009);
    });

    it('should handle empty string', () => {
      const result = PolyHash.doubleHash('');
      expect(result.hash1).toBe(0);
      expect(result.hash2).toBe(0);
    });
  });

  describe('complex operations', () => {
    it('should handle append after clear', () => {
      const ph = new PolyHash('abc');
      ph.clear();
      ph.append('x');
      expect(ph.toString()).toBe('x');
      expect(ph.size).toBe(1);
    });

    it('should handle multiple pushFront and popBack', () => {
      const ph = new PolyHash('');
      ph.pushFront('c');
      ph.pushFront('b');
      ph.pushFront('a');
      expect(ph.popBack()).toBe('c');
      expect(ph.popBack()).toBe('b');
      expect(ph.popBack()).toBe('a');
      expect(ph.isEmpty).toBe(true);
    });

    it('should handle mix of operations', () => {
      const ph = new PolyHash('ab');
      ph.append('c');
      ph.pushFront('x');
      expect(ph.toString()).toBe('xabc');
      ph.popBack();
      expect(ph.toString()).toBe('xab');
      ph.clear();
      expect(ph.toString()).toBe('');
    });

    it('should maintain hash consistency across operations', () => {
      const ph1 = new PolyHash('abc');
      const ph2 = new PolyHash('a');
      ph2.append('b');
      ph2.append('c');
      expect(ph1.hash()).toBe(ph2.hash());
    });
  });

  describe('hash consistency', () => {
    it('should maintain hashRange consistency', () => {
      const ph = new PolyHash('abcdef');
      const hash1 = ph.hashRange(0, 3);
      const hash2 = ph.hashRange(0, 3);
      expect(hash1).toBe(hash2);
    });

    it('should maintain hashPrefix consistency', () => {
      const ph = new PolyHash('abcdef');
      const hash1 = ph.hashPrefix(3);
      const hash2 = ph.hashPrefix(3);
      expect(hash1).toBe(hash2);
    });

    it('should maintain hashRange and hashPrefix relationship', () => {
      const ph = new PolyHash('abcdef');
      expect(ph.hashRange(0, 3)).toBe(ph.hashPrefix(3));
      expect(ph.hashRange(0, 6)).toBe(ph.hash());
      expect(ph.hashPrefix(6)).toBe(ph.hash());
    });
  });

  describe('large strings', () => {
    it('should handle string of length 100', () => {
      const str = 'a'.repeat(100);
      const ph = new PolyHash(str);
      expect(ph.size).toBe(100);
    });

    it('should handle string of length 1000', () => {
      const str = 'a'.repeat(1000);
      const ph = new PolyHash(str);
      expect(ph.size).toBe(1000);
    });

    it('should handle append to large string', () => {
      const ph = new PolyHash('a'.repeat(100));
      ph.append('b');
      expect(ph.size).toBe(101);
    });
  });

  describe('edge cases', () => {
    it('should handle single character operations', () => {
      const ph = new PolyHash('a');
      expect(ph.popBack()).toBe('a');
      expect(ph.isEmpty).toBe(true);
    });

    it('should handle two character string', () => {
      const ph = new PolyHash('ab');
      ph.popBack();
      expect(ph.size).toBe(1);
      expect(ph.toString()).toBe('a');
    });

    it('should handle hashRange at boundaries', () => {
      const ph = new PolyHash('abc');
      expect(ph.hashRange(0, 1)).toBeGreaterThan(0);
      expect(ph.hashRange(1, 3)).toBeGreaterThan(0);
      expect(ph.hashRange(0, 3)).toBe(ph.hash());
    });

    it('should handle hashPrefix at boundaries', () => {
      const ph = new PolyHash('abc');
      expect(ph.hashPrefix(0)).toBe(0);
      expect(ph.hashPrefix(1)).toBeGreaterThan(0);
      expect(ph.hashPrefix(3)).toBe(ph.hash());
    });
  });

  describe('mod operations', () => {
    it('should respect custom mod in hash', () => {
      const ph1 = new PolyHash('abc', { mod: 1_000_000_009 });
      const ph2 = new PolyHash('abc');
      expect(ph1.hash()).toBe(ph2.hash());
      expect(ph1.mod).toBe(1_000_000_009);
    });

    it('should respect custom mod in hashRange', () => {
      const ph = new PolyHash('abcdef', { mod: 1_000_000_009 });
      const hash = ph.hashRange(0, 3);
      expect(hash).toBeLessThan(1_000_000_009);
    });

    it('should respect custom mod in hashPrefix', () => {
      const ph = new PolyHash('abcdef', { mod: 1_000_000_009 });
      const hash = ph.hashPrefix(3);
      expect(hash).toBeLessThan(1_000_000_009);
    });
  });

  describe('base operations', () => {
    it('should respect custom base in hash', () => {
      const ph1 = new PolyHash('abc', { base: 37 });
      const ph2 = new PolyHash('abc', { base: 31 });
      expect(ph1.hash()).not.toBe(ph2.hash());
    });

    it('should respect custom base in power', () => {
      const ph1 = new PolyHash('abc', { base: 37 });
      const ph2 = new PolyHash('abc', { base: 31 });
      expect(ph1.power(2)).not.toBe(ph2.power(2));
    });
  });
});
