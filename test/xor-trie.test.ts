import { describe, it, expect } from 'vitest';
import { XorTrie } from '../src/core/xor-trie/index.js';

describe('XorTrie - Basic Operations', () => {
  it('should create empty trie', () => {
    const trie = new XorTrie();
    expect(trie.size).toBe(0);
    expect(trie.isEmpty).toBe(true);
  });

  it('should insert single value', () => {
    const trie = new XorTrie();
    trie.insert(5);
    expect(trie.size).toBe(1);
    expect(trie.isEmpty).toBe(false);
  });

  it('should insert multiple values', () => {
    const trie = new XorTrie();
    trie.insert(1);
    trie.insert(2);
    trie.insert(3);
    expect(trie.size).toBe(3);
  });

  it('should contain inserted value', () => {
    const trie = new XorTrie();
    trie.insert(42);
    expect(trie.contains(42)).toBe(true);
  });

  it('should not contain non-existent value', () => {
    const trie = new XorTrie();
    trie.insert(42);
    expect(trie.contains(43)).toBe(false);
  });

  it('should remove existing value', () => {
    const trie = new XorTrie();
    trie.insert(10);
    const result = trie.remove(10);
    expect(result).toBe(true);
    expect(trie.size).toBe(0);
    expect(trie.contains(10)).toBe(false);
  });

  it('should not remove non-existent value', () => {
    const trie = new XorTrie();
    trie.insert(10);
    const result = trie.remove(20);
    expect(result).toBe(false);
    expect(trie.size).toBe(1);
  });

  it('should remove value from multiple', () => {
    const trie = new XorTrie();
    trie.insert(1);
    trie.insert(2);
    trie.insert(3);
    trie.remove(2);
    expect(trie.size).toBe(2);
    expect(trie.contains(2)).toBe(false);
  });

  it('should handle insert 0', () => {
    const trie = new XorTrie();
    trie.insert(0);
    expect(trie.contains(0)).toBe(true);
    expect(trie.size).toBe(1);
  });

  it('should handle insert max 32-bit', () => {
    const trie = new XorTrie();
    trie.insert(0xFFFFFFFF);
    expect(trie.contains(0xFFFFFFFF)).toBe(true);
  });

  it('should handle duplicate inserts', () => {
    const trie = new XorTrie();
    trie.insert(5);
    trie.insert(5);
    expect(trie.size).toBe(2);
  });

  it('should handle duplicate removes', () => {
    const trie = new XorTrie();
    trie.insert(5);
    trie.insert(5);
    expect(trie.remove(5)).toBe(true);
    expect(trie.size).toBe(1);
    expect(trie.remove(5)).toBe(true);
    expect(trie.size).toBe(0);
  });

  it('should clear all values', () => {
    const trie = new XorTrie();
    trie.insert(1);
    trie.insert(2);
    trie.insert(3);
    trie.clear();
    expect(trie.size).toBe(0);
    expect(trie.isEmpty).toBe(true);
  });

  it('should clear empty trie', () => {
    const trie = new XorTrie();
    trie.clear();
    expect(trie.size).toBe(0);
  });
});

describe('XorTrie - toArray and forEach', () => {
  it('should return empty array for empty trie', () => {
    const trie = new XorTrie();
    expect(trie.toArray()).toEqual([]);
  });

  it('should return array with single element', () => {
    const trie = new XorTrie();
    trie.insert(5);
    expect(trie.toArray()).toEqual([5]);
  });

  it('should return array with multiple elements', () => {
    const trie = new XorTrie();
    trie.insert(1);
    trie.insert(3);
    trie.insert(7);
    const arr = trie.toArray();
    expect(arr.length).toBe(3);
    expect(arr).toContain(1);
    expect(arr).toContain(3);
    expect(arr).toContain(7);
  });

  it('should iterate over empty trie', () => {
    const trie = new XorTrie();
    const values: number[] = [];
    trie.forEach((v) => values.push(v));
    expect(values).toEqual([]);
  });

  it('should iterate over single element', () => {
    const trie = new XorTrie();
    trie.insert(10);
    const values: number[] = [];
    trie.forEach((v) => values.push(v));
    expect(values).toEqual([10]);
  });

  it('should iterate over multiple elements', () => {
    const trie = new XorTrie();
    trie.insert(2);
    trie.insert(5);
    trie.insert(8);
    const values: number[] = [];
    trie.forEach((v) => values.push(v));
    expect(values.length).toBe(3);
    expect(values).toContain(2);
    expect(values).toContain(5);
    expect(values).toContain(8);
  });

  it('toArray should match forEach results', () => {
    const trie = new XorTrie();
    for (let i = 0; i < 10; i++) {
      trie.insert(i * 3);
    }
    const arr = trie.toArray();
    const forEachArr: number[] = [];
    trie.forEach((v) => forEachArr.push(v));
    expect(arr.sort()).toEqual(forEachArr.sort());
  });
});

describe('XorTrie - maxXor', () => {
  it('should find max xor with complementary bits', () => {
    const trie = new XorTrie();
    trie.insert(0b0000);
    trie.insert(0b1111);
    const result = trie.maxXor(0b0000);
    expect(result).toBe(0b1111);
  });

  it('should find max xor from multiple values', () => {
    const trie = new XorTrie();
    trie.insert(1);
    trie.insert(2);
    trie.insert(3);
    const result = trie.maxXor(0);
    expect(result).toBe(3);
  });

  it('should handle single element', () => {
    const trie = new XorTrie();
    trie.insert(7);
    const result = trie.maxXor(5);
    expect(result).toBe(2);
  });

  it('should throw error on empty trie', () => {
    const trie = new XorTrie();
    expect(() => trie.maxXor(5)).toThrow('Cannot find max xor from empty trie');
  });

  it('should find max xor with 0', () => {
    const trie = new XorTrie();
    trie.insert(10);
    trie.insert(15);
    trie.insert(20);
    const result = trie.maxXor(0);
    expect(result).toBe(20);
  });

  it('should find max xor with max value', () => {
    const trie = new XorTrie();
    trie.insert(0xFFFFFFFF);
    trie.insert(0x00000000);
    const result = trie.maxXor(0xFFFFFFFF);
    expect(result).toBe(0xFFFFFFFF);
  });

  it('should return max xor pair correctly', () => {
    const trie = new XorTrie();
    trie.insert(3);
    trie.insert(10);
    const result = trie.maxXor(5);
    expect(result).toBe(15);
  });

  it('should find max xor with alternating bits', () => {
    const trie = new XorTrie();
    trie.insert(0b01010101);
    trie.insert(0b10101010);
    const result = trie.maxXor(0b01010101);
    expect(result).toBe(0b11111111);
  });
});

describe('XorTrie - minXor', () => {
  it('should find min xor with same value', () => {
    const trie = new XorTrie();
    trie.insert(10);
    const result = trie.minXor(10);
    expect(result).toBe(0);
  });

  it('should find min xor with similar bits', () => {
    const trie = new XorTrie();
    trie.insert(5);
    trie.insert(7);
    const result = trie.minXor(6);
    expect(result).toBe(1);
  });

  it('should handle single element', () => {
    const trie = new XorTrie();
    trie.insert(15);
    const result = trie.minXor(8);
    expect(result).toBe(7);
  });

  it('should throw error on empty trie', () => {
    const trie = new XorTrie();
    expect(() => trie.minXor(5)).toThrow('Cannot find min xor from empty trie');
  });

  it('should find min xor with 0', () => {
    const trie = new XorTrie();
    trie.insert(5);
    trie.insert(10);
    trie.insert(15);
    const result = trie.minXor(0);
    expect(result).toBe(5);
  });

  it('should find min xor from multiple values', () => {
    const trie = new XorTrie();
    trie.insert(8);
    trie.insert(12);
    trie.insert(16);
    const result = trie.minXor(10);
    expect(result).toBe(2);
  });

  it('should return min xor pair correctly', () => {
    const trie = new XorTrie();
    trie.insert(100);
    trie.insert(101);
    const result = trie.minXor(99);
    expect(result).toBe(6);
  });

  it('should find min xor with all same bits', () => {
    const trie = new XorTrie();
    trie.insert(0xFFFFFFFF);
    trie.insert(0xFFFFFFFE);
    const result = trie.minXor(0xFFFFFFFF);
    expect(result).toBe(0);
  });
});

describe('XorTrie - Edge Cases', () => {
  it('should handle all zeros', () => {
    const trie = new XorTrie();
    trie.insert(0);
    trie.insert(0);
    trie.insert(0);
    expect(trie.size).toBe(3);
    expect(trie.contains(0)).toBe(true);
  });

  it('should handle all same bits', () => {
    const trie = new XorTrie();
    trie.insert(0xAAAAAAAA);
    trie.insert(0xAAAAAAAA);
    expect(trie.maxXor(0xAAAAAAAA)).toBe(0);
    expect(trie.minXor(0xAAAAAAAA)).toBe(0);
  });

  it('should handle alternating pattern', () => {
    const trie = new XorTrie();
    trie.insert(0x55555555);
    trie.insert(0xAAAAAAAA);
    expect(trie.maxXor(0x55555555)).toBe(0xFFFFFFFF);
  });

  it('should handle sequential values', () => {
    const trie = new XorTrie();
    for (let i = 0; i < 100; i++) {
      trie.insert(i);
    }
    expect(trie.size).toBe(100);
    expect(trie.contains(50)).toBe(true);
    expect(trie.contains(150)).toBe(false);
  });

  it('should handle power of 2 values', () => {
    const trie = new XorTrie();
    for (let i = 0; i < 31; i++) {
      trie.insert(1 << i);
    }
    expect(trie.size).toBe(31);
  });

  it('should handle random insert and remove', () => {
    const trie = new XorTrie();
    const values = [100, 200, 300, 400, 500];
    values.forEach(v => trie.insert(v));
    trie.remove(300);
    expect(trie.size).toBe(4);
    expect(trie.contains(300)).toBe(false);
  });

  it('should handle insert after clear', () => {
    const trie = new XorTrie();
    trie.insert(1);
    trie.insert(2);
    trie.clear();
    trie.insert(3);
    expect(trie.size).toBe(1);
    expect(trie.contains(1)).toBe(false);
    expect(trie.contains(3)).toBe(true);
  });
});

describe('XorTrie - countXorPairs', () => {
  it('should count pairs with XOR equal to target', () => {
    const trie = new XorTrie();
    trie.insert(1);
    trie.insert(2);
    trie.insert(3);
    const count = trie.countXorPairs(0, 3);
    expect(count).toBe(1);
  });

  it('should count zero matches', () => {
    const trie = new XorTrie();
    trie.insert(1);
    trie.insert(2);
    trie.insert(4);
    const count = trie.countXorPairs(0, 7);
    expect(count).toBe(0);
  });

  it('should count all matches', () => {
    const trie = new XorTrie();
    trie.insert(0);
    trie.insert(7);
    trie.insert(14);
    const count = trie.countXorPairs(7, 7);
    expect(count).toBe(1);
  });

  it('should count from empty trie', () => {
    const trie = new XorTrie();
    const count = trie.countXorPairs(5, 3);
    expect(count).toBe(0);
  });

  it('should count with duplicate values', () => {
    const trie = new XorTrie();
    trie.insert(5);
    trie.insert(5);
    trie.insert(5);
    const count = trie.countXorPairs(0, 5);
    expect(count).toBe(3);
  });

  it('should count with large target', () => {
    const trie = new XorTrie();
    trie.insert(0xFFFFFFFF);
    trie.insert(0x00000000);
    const count = trie.countXorPairs(0x00000000, 0xFFFFFFFF);
    expect(count).toBe(1);
  });
});

describe('XorTrie - Custom Bit Width', () => {
  it('should work with 8-bit width', () => {
    const trie = new XorTrie(8);
    trie.insert(255);
    trie.insert(0);
    expect(trie.size).toBe(2);
    expect(trie.contains(255)).toBe(true);
  });

  it('should work with 16-bit width', () => {
    const trie = new XorTrie(16);
    trie.insert(65535);
    trie.insert(0);
    expect(trie.size).toBe(2);
  });

  it('should work with 64-bit width', () => {
    const trie = new XorTrie(64);
    trie.insert(0xFFFFFFFF);
    trie.insert(0);
    expect(trie.size).toBe(2);
  });
});

describe('XorTrie - Stress Test', () => {
  it('should handle 1000 insertions', () => {
    const trie = new XorTrie();
    for (let i = 0; i < 1000; i++) {
      trie.insert(i);
    }
    expect(trie.size).toBe(1000);
  });

  it('should handle 1000 insertions and removals', () => {
    const trie = new XorTrie();
    for (let i = 0; i < 1000; i++) {
      trie.insert(i);
    }
    for (let i = 0; i < 500; i++) {
      trie.remove(i);
    }
    expect(trie.size).toBe(500);
  });

  it('should find max xor in large dataset', () => {
    const trie = new XorTrie();
    trie.insert(0xFFFFFFFF);
    trie.insert(0x00000000);
    trie.insert(0x55555555);
    trie.insert(0xAAAAAAAA);
    const result = trie.maxXor(0x00000000);
    expect(result).toBe(0xFFFFFFFF);
  });
});

describe('XorTrie - XOR Properties', () => {
  it('should satisfy a xor b = b xor a', () => {
    const trie = new XorTrie();
    trie.insert(10);
    const result1 = trie.maxXor(20);
    trie.clear();
    trie.insert(20);
    const result2 = trie.maxXor(10);
    expect(result1).toBe(result2);
  });

  it('should satisfy a xor 0 = a', () => {
    const trie = new XorTrie();
    trie.insert(15);
    const result = trie.maxXor(0);
    expect(result).toBe(15);
  });

  it('should satisfy a xor a = 0', () => {
    const trie = new XorTrie();
    trie.insert(25);
    const result = trie.minXor(25);
    expect(result).toBe(0);
  });
});
