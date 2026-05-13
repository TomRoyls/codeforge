import { describe, it, expect } from 'vitest';
import { XorTrie2 } from '../src/core/xor-trie-2/index.js';

describe('XorTrie2 - Basic Operations', () => {
  it('should create empty trie', () => {
    const trie = new XorTrie2();
    expect(trie.size).toBe(0);
    expect(trie.isEmpty).toBe(true);
  });

  it('should insert single value', () => {
    const trie = new XorTrie2();
    trie.insert(5);
    expect(trie.size).toBe(1);
    expect(trie.isEmpty).toBe(false);
  });

  it('should insert multiple values', () => {
    const trie = new XorTrie2();
    trie.insert(1);
    trie.insert(2);
    trie.insert(3);
    expect(trie.size).toBe(3);
  });

  it('should contain inserted value', () => {
    const trie = new XorTrie2();
    trie.insert(42);
    expect(trie.contains(42)).toBe(true);
  });

  it('should not contain non-existent value', () => {
    const trie = new XorTrie2();
    trie.insert(42);
    expect(trie.contains(43)).toBe(false);
  });

  it('should delete existing value', () => {
    const trie = new XorTrie2();
    trie.insert(10);
    const result = trie.delete(10);
    expect(result).toBe(true);
    expect(trie.size).toBe(0);
    expect(trie.contains(10)).toBe(false);
  });

  it('should not delete non-existent value', () => {
    const trie = new XorTrie2();
    trie.insert(10);
    const result = trie.delete(20);
    expect(result).toBe(false);
    expect(trie.size).toBe(1);
  });

  it('should delete value from multiple', () => {
    const trie = new XorTrie2();
    trie.insert(1);
    trie.insert(2);
    trie.insert(3);
    trie.delete(2);
    expect(trie.size).toBe(2);
    expect(trie.contains(2)).toBe(false);
  });

  it('should handle insert 0', () => {
    const trie = new XorTrie2();
    trie.insert(0);
    expect(trie.contains(0)).toBe(true);
    expect(trie.size).toBe(1);
  });

  it('should handle insert max 32-bit', () => {
    const trie = new XorTrie2();
    trie.insert(0xFFFFFFFF);
    expect(trie.contains(0xFFFFFFFF)).toBe(true);
  });

  it('should handle duplicate inserts', () => {
    const trie = new XorTrie2();
    trie.insert(5);
    trie.insert(5);
    expect(trie.size).toBe(2);
  });

  it('should handle duplicate deletes', () => {
    const trie = new XorTrie2();
    trie.insert(5);
    trie.insert(5);
    expect(trie.delete(5)).toBe(true);
    expect(trie.size).toBe(1);
    expect(trie.delete(5)).toBe(true);
    expect(trie.size).toBe(0);
  });

  it('should clear all values', () => {
    const trie = new XorTrie2();
    trie.insert(1);
    trie.insert(2);
    trie.insert(3);
    trie.clear();
    expect(trie.size).toBe(0);
    expect(trie.isEmpty).toBe(true);
  });

  it('should clear empty trie', () => {
    const trie = new XorTrie2();
    trie.clear();
    expect(trie.size).toBe(0);
  });

  it('search should work like contains', () => {
    const trie = new XorTrie2();
    trie.insert(15);
    expect(trie.search(15)).toBe(true);
    expect(trie.search(16)).toBe(false);
  });
});

describe('XorTrie2 - toArray and forEach', () => {
  it('should return empty array for empty trie', () => {
    const trie = new XorTrie2();
    expect(trie.toArray()).toEqual([]);
  });

  it('should return array with single element', () => {
    const trie = new XorTrie2();
    trie.insert(5);
    expect(trie.toArray()).toEqual([5]);
  });

  it('should return array with multiple elements', () => {
    const trie = new XorTrie2();
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
    const trie = new XorTrie2();
    const values: number[] = [];
    trie.forEach((v) => values.push(v));
    expect(values).toEqual([]);
  });

  it('should iterate over single element', () => {
    const trie = new XorTrie2();
    trie.insert(10);
    const values: number[] = [];
    trie.forEach((v) => values.push(v));
    expect(values).toEqual([10]);
  });

  it('should iterate over multiple elements', () => {
    const trie = new XorTrie2();
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
    const trie = new XorTrie2();
    for (let i = 0; i < 10; i++) {
      trie.insert(i * 3);
    }
    const arr = trie.toArray();
    const forEachArr: number[] = [];
    trie.forEach((v) => forEachArr.push(v));
    expect(arr.sort()).toEqual(forEachArr.sort());
  });

  it('toArray should handle duplicates', () => {
    const trie = new XorTrie2();
    trie.insert(5);
    trie.insert(5);
    trie.insert(5);
    const arr = trie.toArray();
    expect(arr).toEqual([5, 5, 5]);
  });
});

describe('XorTrie2 - maxXor', () => {
  it('should find max xor with complementary bits', () => {
    const trie = new XorTrie2();
    trie.insert(0b0000);
    trie.insert(0b1111);
    const result = trie.maxXor(0b0000);
    expect(result).toBe(0b1111);
  });

  it('should find max xor from multiple values', () => {
    const trie = new XorTrie2();
    trie.insert(1);
    trie.insert(2);
    trie.insert(3);
    const result = trie.maxXor(0);
    expect(result).toBe(3);
  });

  it('should handle single element', () => {
    const trie = new XorTrie2();
    trie.insert(7);
    const result = trie.maxXor(5);
    expect(result).toBe(2);
  });

  it('should throw error on empty trie', () => {
    const trie = new XorTrie2();
    expect(() => trie.maxXor(5)).toThrow('Cannot find max xor from empty trie');
  });

  it('should find max xor with 0', () => {
    const trie = new XorTrie2();
    trie.insert(10);
    trie.insert(15);
    trie.insert(20);
    const result = trie.maxXor(0);
    expect(result).toBe(20);
  });

  it('should find max xor with max value', () => {
    const trie = new XorTrie2();
    trie.insert(0xFFFFFFFF);
    trie.insert(0x00000000);
    const result = trie.maxXor(0xFFFFFFFF);
    expect(result).toBe(0xFFFFFFFF);
  });

  it('should return max xor pair correctly', () => {
    const trie = new XorTrie2();
    trie.insert(3);
    trie.insert(10);
    const result = trie.maxXor(5);
    expect(result).toBe(15);
  });
});

describe('XorTrie2 - minXor', () => {
  it('should find min xor with same value', () => {
    const trie = new XorTrie2();
    trie.insert(10);
    const result = trie.minXor(10);
    expect(result).toBe(0);
  });

  it('should find min xor with similar bits', () => {
    const trie = new XorTrie2();
    trie.insert(5);
    trie.insert(7);
    const result = trie.minXor(6);
    expect(result).toBe(1);
  });

  it('should handle single element', () => {
    const trie = new XorTrie2();
    trie.insert(15);
    const result = trie.minXor(8);
    expect(result).toBe(7);
  });

  it('should throw error on empty trie', () => {
    const trie = new XorTrie2();
    expect(() => trie.minXor(5)).toThrow('Cannot find min xor from empty trie');
  });

  it('should find min xor with 0', () => {
    const trie = new XorTrie2();
    trie.insert(5);
    trie.insert(10);
    trie.insert(15);
    const result = trie.minXor(0);
    expect(result).toBe(5);
  });

  it('should find min xor from multiple values', () => {
    const trie = new XorTrie2();
    trie.insert(8);
    trie.insert(12);
    trie.insert(16);
    const result = trie.minXor(10);
    expect(result).toBe(2);
  });

  it('should return min xor pair correctly', () => {
    const trie = new XorTrie2();
    trie.insert(100);
    trie.insert(101);
    const result = trie.minXor(99);
    expect(result).toBe(6);
  });
});

describe('XorTrie2 - bulkInsert', () => {
  it('should insert empty array', () => {
    const trie = new XorTrie2();
    trie.bulkInsert([]);
    expect(trie.size).toBe(0);
  });

  it('should insert single element array', () => {
    const trie = new XorTrie2();
    trie.bulkInsert([42]);
    expect(trie.size).toBe(1);
    expect(trie.contains(42)).toBe(true);
  });

  it('should insert multiple values', () => {
    const trie = new XorTrie2();
    trie.bulkInsert([1, 2, 3, 4, 5]);
    expect(trie.size).toBe(5);
    for (let i = 1; i <= 5; i++) {
      expect(trie.contains(i)).toBe(true);
    }
  });

  it('should insert duplicates', () => {
    const trie = new XorTrie2();
    trie.bulkInsert([5, 5, 5]);
    expect(trie.size).toBe(3);
    expect(trie.count(5)).toBe(3);
  });

  it('should handle large array', () => {
    const trie = new XorTrie2();
    const values = Array.from({ length: 1000 }, (_, i) => i);
    trie.bulkInsert(values);
    expect(trie.size).toBe(1000);
  });
});

describe('XorTrie2 - count', () => {
  it('should count 0 for non-existent value', () => {
    const trie = new XorTrie2();
    trie.insert(5);
    expect(trie.count(10)).toBe(0);
  });

  it('should count single occurrence', () => {
    const trie = new XorTrie2();
    trie.insert(7);
    expect(trie.count(7)).toBe(1);
  });

  it('should count multiple occurrences', () => {
    const trie = new XorTrie2();
    trie.insert(3);
    trie.insert(3);
    trie.insert(3);
    expect(trie.count(3)).toBe(3);
  });

  it('should count in empty trie', () => {
    const trie = new XorTrie2();
    expect(trie.count(0)).toBe(0);
  });

  it('should count value 0', () => {
    const trie = new XorTrie2();
    trie.insert(0);
    trie.insert(0);
    expect(trie.count(0)).toBe(2);
  });

  it('should count max value', () => {
    const trie = new XorTrie2();
    trie.insert(0xFFFFFFFF);
    trie.insert(0xFFFFFFFF);
    expect(trie.count(0xFFFFFFFF)).toBe(2);
  });
});

describe('XorTrie2 - xorRange', () => {
  it('should return empty array for empty trie', () => {
    const trie = new XorTrie2();
    const result = trie.xorRange(0, 10);
    expect(result).toEqual([]);
  });

  it('should find values with XOR in range', () => {
    const trie = new XorTrie2();
    trie.insert(5);
    const result = trie.xorRange(0, 10);
    expect(result).toContain(5);
  });

  it('should handle range containing all values', () => {
    const trie = new XorTrie2();
    trie.insert(1);
    trie.insert(2);
    trie.insert(3);
    const result = trie.xorRange(0, 0xFFFFFFFF);
    const arr = trie.toArray();
    expect(result.sort()).toEqual(arr.sort());
  });

  it('should handle narrow range', () => {
    const trie = new XorTrie2();
    trie.insert(0);
    trie.insert(1);
    trie.insert(2);
    const result = trie.xorRange(0, 0);
    expect(result).toContain(0);
  });

  it('should return multiple occurrences', () => {
    const trie = new XorTrie2();
    trie.insert(5);
    trie.insert(5);
    trie.insert(5);
    const result = trie.xorRange(0, 10);
    expect(result.filter(v => v === 5).length).toBe(3);
  });
});

describe('XorTrie2 - getTimeComplexity', () => {
  it('should return complexity information', () => {
    const trie = new XorTrie2();
    const complexity = trie.getTimeComplexity();
    expect(Array.isArray(complexity)).toBe(true);
    expect(complexity.length).toBeGreaterThan(0);
  });

  it('should include all operations', () => {
    const trie = new XorTrie2();
    const complexity = trie.getTimeComplexity();
    const operations = complexity.map(c => c.operation);
    expect(operations).toContain('insert');
    expect(operations).toContain('bulkInsert');
    expect(operations).toContain('delete');
    expect(operations).toContain('search');
    expect(operations).toContain('contains');
    expect(operations).toContain('maxXor');
    expect(operations).toContain('minXor');
    expect(operations).toContain('count');
    expect(operations).toContain('xorRange');
    expect(operations).toContain('size');
    expect(operations).toContain('isEmpty');
    expect(operations).toContain('clear');
    expect(operations).toContain('toArray');
    expect(operations).toContain('forEach');
  });

  it('should include complexity strings', () => {
    const trie = new XorTrie2();
    const complexity = trie.getTimeComplexity();
    complexity.forEach(c => {
      expect(c.complexity).toBeTruthy();
      expect(typeof c.complexity).toBe('string');
    });
  });
});

describe('XorTrie2 - Edge Cases', () => {
  it('should handle all zeros', () => {
    const trie = new XorTrie2();
    trie.insert(0);
    trie.insert(0);
    trie.insert(0);
    expect(trie.size).toBe(3);
    expect(trie.contains(0)).toBe(true);
  });

  it('should handle all same bits', () => {
    const trie = new XorTrie2();
    trie.insert(0xAAAAAAAA);
    trie.insert(0xAAAAAAAA);
    expect(trie.maxXor(0xAAAAAAAA)).toBe(0);
    expect(trie.minXor(0xAAAAAAAA)).toBe(0);
  });

  it('should handle alternating pattern', () => {
    const trie = new XorTrie2();
    trie.insert(0x55555555);
    trie.insert(0xAAAAAAAA);
    expect(trie.maxXor(0x55555555)).toBe(0xFFFFFFFF);
  });

  it('should handle sequential values', () => {
    const trie = new XorTrie2();
    for (let i = 0; i < 100; i++) {
      trie.insert(i);
    }
    expect(trie.size).toBe(100);
    expect(trie.contains(50)).toBe(true);
    expect(trie.contains(150)).toBe(false);
  });

  it('should handle power of 2 values', () => {
    const trie = new XorTrie2();
    for (let i = 0; i < 31; i++) {
      trie.insert(1 << i);
    }
    expect(trie.size).toBe(31);
  });

  it('should handle random insert and delete', () => {
    const trie = new XorTrie2();
    const values = [100, 200, 300, 400, 500];
    values.forEach(v => trie.insert(v));
    trie.delete(300);
    expect(trie.size).toBe(4);
    expect(trie.contains(300)).toBe(false);
  });

  it('should handle insert after clear', () => {
    const trie = new XorTrie2();
    trie.insert(1);
    trie.insert(2);
    trie.clear();
    trie.insert(3);
    expect(trie.size).toBe(1);
    expect(trie.contains(1)).toBe(false);
    expect(trie.contains(3)).toBe(true);
  });

  it('should handle custom bit width', () => {
    const trie = new XorTrie2(16);
    trie.insert(65535);
    trie.insert(0);
    expect(trie.size).toBe(2);
    expect(trie.contains(65535)).toBe(true);
  });

  it('should handle stress test with bulkInsert', () => {
    const trie = new XorTrie2();
    const values = Array.from({ length: 1000 }, (_, i) => i);
    trie.bulkInsert(values);
    expect(trie.size).toBe(1000);
    expect(trie.toArray().length).toBe(1000);
  });
});
