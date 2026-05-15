import { describe, it, expect, beforeEach } from 'vitest';
import { BinaryTrie2 } from '../src/core/binary-trie-2/index.js';

describe('BinaryTrie2', () => {
  let trie: BinaryTrie2;

  beforeEach(() => {
    trie = new BinaryTrie2(8);
  });

  describe('insert and has', () => {
    it('should insert and find values', () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(255);

      expect(trie.has(5)).toBe(true);
      expect(trie.has(10)).toBe(true);
      expect(trie.has(255)).toBe(true);
      expect(trie.has(0)).toBe(false);
      expect(trie.has(7)).toBe(false);
    });

    it('should handle duplicate inserts', () => {
      trie.insert(5);
      trie.insert(5);
      trie.insert(5);

      expect(trie.has(5)).toBe(true);
      expect(trie.size).toBe(3);
    });

    it('should insert zero', () => {
      trie.insert(0);
      expect(trie.has(0)).toBe(true);
      expect(trie.size).toBe(1);
    });

    it('should handle large values', () => {
      trie.insert(128);
      expect(trie.has(128)).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete existing values', () => {
      trie.insert(5);
      trie.insert(10);

      expect(trie.delete(5)).toBe(true);
      expect(trie.has(5)).toBe(false);
      expect(trie.has(10)).toBe(true);
      expect(trie.size).toBe(1);
    });

    it('should return false for non-existent values', () => {
      expect(trie.delete(5)).toBe(false);
      expect(trie.size).toBe(0);
    });

    it('should handle duplicate deletes', () => {
      trie.insert(5);
      trie.insert(5);

      expect(trie.delete(5)).toBe(true);
      expect(trie.has(5)).toBe(true);
      expect(trie.size).toBe(1);

      expect(trie.delete(5)).toBe(true);
      expect(trie.has(5)).toBe(false);
      expect(trie.size).toBe(0);
    });

    it('should return false after all copies deleted', () => {
      trie.insert(5);
      trie.delete(5);

      expect(trie.delete(5)).toBe(false);
    });
  });

  describe('xorMin', () => {
    it('should find value with minimum XOR', () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);

      expect(trie.xorMin(0)).toBe(5);
      expect(trie.xorMin(5)).toBe(5);
      expect(trie.xorMin(10)).toBe(10);
      expect(trie.xorMin(8)).toBe(10);
    });

    it('should work with single value', () => {
      trie.insert(7);
      expect(trie.xorMin(100)).toBe(7);
    });

    it('should handle edge cases', () => {
      trie.insert(0);
      trie.insert(255);

      expect(trie.xorMin(127)).toBe(0);
    });
  });

  describe('xorMax', () => {
    it('should find value with maximum XOR', () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);

      expect(trie.xorMax(0)).toBe(15);
      expect(trie.xorMax(5)).toBe(10);
      expect(trie.xorMax(10)).toBe(5);
    });

    it('should work with single value', () => {
      trie.insert(7);
      expect(trie.xorMax(0)).toBe(7);
    });

    it('should maximize XOR with all bits', () => {
      trie.insert(0);
      trie.insert(255);

      expect(trie.xorMax(0)).toBe(255);
    });
  });

  describe('min', () => {
    it('should return minimum value', () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(3);

      expect(trie.min()).toBe(3);
    });

    it('should return zero if zero exists', () => {
      trie.insert(5);
      trie.insert(0);
      trie.insert(10);

      expect(trie.min()).toBe(0);
    });

    it('should return undefined for empty trie', () => {
      expect(trie.min()).toBe(undefined);
    });

    it('should handle duplicates', () => {
      trie.insert(5);
      trie.insert(5);
      trie.insert(3);

      expect(trie.min()).toBe(3);
    });
  });

  describe('max', () => {
    it('should return maximum value', () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(3);

      expect(trie.max()).toBe(10);
    });

    it('should return highest bit value', () => {
      trie.insert(5);
      trie.insert(255);
      trie.insert(10);

      expect(trie.max()).toBe(255);
    });

    it('should return undefined for empty trie', () => {
      expect(trie.max()).toBe(undefined);
    });

    it('should handle duplicates', () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(10);

      expect(trie.max()).toBe(10);
    });
  });

  describe('size', () => {
    it('should track size correctly', () => {
      expect(trie.size).toBe(0);

      trie.insert(5);
      expect(trie.size).toBe(1);

      trie.insert(10);
      expect(trie.size).toBe(2);

      trie.insert(5);
      expect(trie.size).toBe(3);

      trie.delete(5);
      expect(trie.size).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty trie', () => {
      expect(trie.isEmpty()).toBe(true);
    });

    it('should return false after insert', () => {
      trie.insert(5);
      expect(trie.isEmpty()).toBe(false);
    });

    it('should return true after deleting all', () => {
      trie.insert(5);
      trie.insert(10);
      trie.delete(5);
      trie.delete(10);

      expect(trie.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should reset trie to empty state', () => {
      trie.insert(5);
      trie.insert(10);
      trie.insert(15);

      trie.clear();

      expect(trie.size).toBe(0);
      expect(trie.isEmpty()).toBe(true);
      expect(trie.has(5)).toBe(false);
      expect(trie.has(10)).toBe(false);
      expect(trie.has(15)).toBe(false);
    });

    it('should work with duplicates', () => {
      trie.insert(5);
      trie.insert(5);

      trie.clear();

      expect(trie.size).toBe(0);
      expect(trie.isEmpty()).toBe(true);
    });
  });

  describe('duplicate handling', () => {
    it('should track multiple occurrences', () => {
      trie.insert(5);
      trie.insert(5);
      trie.insert(5);

      trie.delete(5);
      expect(trie.has(5)).toBe(true);
      expect(trie.size).toBe(2);

      trie.delete(5);
      expect(trie.has(5)).toBe(true);
      expect(trie.size).toBe(1);

      trie.delete(5);
      expect(trie.has(5)).toBe(false);
      expect(trie.size).toBe(0);
    });

    it('should handle duplicates in xorMin/xorMax', () => {
      trie.insert(5);
      trie.insert(5);
      trie.insert(10);

      expect(trie.xorMin(5)).toBe(5);
      expect(trie.xorMax(5)).toBe(10);
    });
  });

  describe('custom bitLength', () => {
    it('should work with different bit lengths', () => {
      const trie16 = new BinaryTrie2(16);
      trie16.insert(65535);
      expect(trie16.has(65535)).toBe(true);
      expect(trie16.max()).toBe(65535);
    });

    it('should use default 32 bits', () => {
      const trie32 = new BinaryTrie2();
      trie32.insert(4294967295);
      expect(trie32.has(4294967295)).toBe(true);
    });

    it('should handle clear', () => {
      const trie = new BinaryTrie2();
      trie.insert(5);
      trie.insert(10);
      trie.clear();
      expect(trie.size).toBe(0);
      expect(trie.isEmpty()).toBe(true);
    });

    it('should handle xorMin', () => {
      const trie = new BinaryTrie2();
      trie.insert(10);
      trie.insert(20);
      trie.insert(30);
      const result = trie.xorMin(25);
      expect(typeof result).toBe('number');
      expect([10, 20, 30]).toContain(result);
    });

    it('should handle xorMax', () => {
      const trie = new BinaryTrie2();
      trie.insert(10);
      trie.insert(20);
      trie.insert(30);
      const result = trie.xorMax(5);
      expect(typeof result).toBe('number');
      expect([10, 20, 30]).toContain(result);
    });

    it('should handle clear', () => {
      const trie = new BinaryTrie2();
      trie.insert(10);
      trie.insert(20);
      trie.clear();
      expect(trie.size).toBe(0);
      expect(trie.isEmpty()).toBe(true);
    });
  });
});
