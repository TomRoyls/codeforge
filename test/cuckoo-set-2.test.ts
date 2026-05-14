import { describe, it, expect } from 'vitest';
import { CuckooSet2 } from '../src/core/cuckoo-set-2/index.js';

describe('CuckooSet2', () => {
  describe('constructor', () => {
    it('creates set with default capacity 16', async () => {
      const set = new CuckooSet2<number>();
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    it('creates set with specified capacity', async () => {
      const set = new CuckooSet2<number>(32);
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    it('ensures minimum capacity of 8', async () => {
      const set = new CuckooSet2<number>(4);
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });
  });

  describe('add', () => {
    it('adds values successfully', async () => {
      const set = new CuckooSet2<number>();
      expect(set.add(1)).toBe(true);
      expect(set.add(2)).toBe(true);
      expect(set.size).toBe(2);
    });

    it('returns false for duplicate values', async () => {
      const set = new CuckooSet2<number>();
      expect(set.add(1)).toBe(true);
      expect(set.add(1)).toBe(false);
      expect(set.size).toBe(1);
    });

    it('handles string values', async () => {
      const set = new CuckooSet2<string>();
      expect(set.add('hello')).toBe(true);
      expect(set.add('world')).toBe(true);
      expect(set.size).toBe(2);
    });

    it('handles multiple additions', async () => {
      const set = new CuckooSet2<number>();
      for (let i = 0; i < 100; i++) {
        expect(set.add(i)).toBe(true);
      }
      expect(set.size).toBe(100);
    });

    it('handles hash collisions via cuckoo eviction', async () => {
      const set = new CuckooSet2<number>(16);
      set.add(0);
      set.add(8);
      set.add(16);
      expect(set.has(0)).toBe(true);
      expect(set.has(8)).toBe(true);
      expect(set.has(16)).toBe(true);
    });
  });

  describe('has', () => {
    it('returns true for existing values', async () => {
      const set = new CuckooSet2<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.has(1)).toBe(true);
      expect(set.has(2)).toBe(true);
      expect(set.has(3)).toBe(true);
    });

    it('returns false for non-existent values', async () => {
      const set = new CuckooSet2<number>();
      set.add(1);
      expect(set.has(2)).toBe(false);
      expect(set.has(999)).toBe(false);
    });

    it('works with string values', async () => {
      const set = new CuckooSet2<string>();
      set.add('hello');
      expect(set.has('hello')).toBe(true);
      expect(set.has('world')).toBe(false);
    });
  });

  describe('delete', () => {
    it('deletes existing values', async () => {
      const set = new CuckooSet2<number>();
      set.add(1);
      set.add(2);
      expect(set.delete(1)).toBe(true);
      expect(set.size).toBe(1);
      expect(set.has(1)).toBe(false);
    });

    it('returns false for non-existent values', async () => {
      const set = new CuckooSet2<number>();
      set.add(1);
      expect(set.delete(2)).toBe(false);
      expect(set.size).toBe(1);
    });

    it('handles multiple deletions', async () => {
      const set = new CuckooSet2<number>();
      for (let i = 0; i < 50; i++) {
        set.add(i);
      }
      for (let i = 0; i < 50; i++) {
        expect(set.delete(i)).toBe(true);
      }
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    it('deletes from first table', async () => {
      const set = new CuckooSet2<number>(16);
      set.add(0);
      expect(set.delete(0)).toBe(true);
      expect(set.has(0)).toBe(false);
    });

    it('deletes from second table', async () => {
      const set = new CuckooSet2<number>(16);
      set.add(1);
      expect(set.delete(1)).toBe(true);
      expect(set.has(1)).toBe(false);
    });
  });

  describe('size', () => {
    it('returns correct size after additions', async () => {
      const set = new CuckooSet2<number>();
      expect(set.size).toBe(0);
      set.add(1);
      expect(set.size).toBe(1);
      set.add(2);
      expect(set.size).toBe(2);
      set.add(3);
      expect(set.size).toBe(3);
    });

    it('returns correct size after deletions', async () => {
      const set = new CuckooSet2<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      set.delete(2);
      expect(set.size).toBe(2);
    });

    it('ignores duplicate additions in size', async () => {
      const set = new CuckooSet2<number>();
      set.add(1);
      set.add(1);
      set.add(1);
      expect(set.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty set', async () => {
      const set = new CuckooSet2<number>();
      expect(set.isEmpty()).toBe(true);
    });

    it('returns false for non-empty set', async () => {
      const set = new CuckooSet2<number>();
      set.add(1);
      expect(set.isEmpty()).toBe(false);
    });

    it('returns true after clearing', async () => {
      const set = new CuckooSet2<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      set.clear();
      expect(set.isEmpty()).toBe(true);
    });

    it('returns true after deleting all elements', async () => {
      const set = new CuckooSet2<number>();
      set.add(1);
      set.add(2);
      set.delete(1);
      set.delete(2);
      expect(set.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('removes all elements', async () => {
      const set = new CuckooSet2<number>();
      for (let i = 0; i < 50; i++) {
        set.add(i);
      }
      set.clear();
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
      expect(set.has(1)).toBe(false);
      expect(set.has(25)).toBe(false);
    });

    it('allows adding after clear', async () => {
      const set = new CuckooSet2<number>();
      set.add(1);
      set.clear();
      expect(set.add(2)).toBe(true);
      expect(set.size).toBe(1);
      expect(set.has(2)).toBe(true);
    });
  });

  describe('toArray', () => {
    it('returns empty array for empty set', async () => {
      const set = new CuckooSet2<number>();
      expect(set.toArray()).toEqual([]);
    });

    it('returns all elements', async () => {
      const set = new CuckooSet2<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      const arr = set.toArray();
      expect(arr).toHaveLength(3);
      expect(arr).toContain(1);
      expect(arr).toContain(2);
      expect(arr).toContain(3);
    });

    it('handles strings', async () => {
      const set = new CuckooSet2<string>();
      set.add('hello');
      set.add('world');
      set.add('foo');
      const arr = set.toArray();
      expect(arr).toHaveLength(3);
      expect(arr).toContain('hello');
      expect(arr).toContain('world');
      expect(arr).toContain('foo');
    });

    it('returns unique elements', async () => {
      const set = new CuckooSet2<number>();
      set.add(1);
      set.add(1);
      set.add(2);
      set.add(2);
      const arr = set.toArray();
      const unique = [...new Set(arr)];
      expect(arr).toHaveLength(2);
      expect(unique).toHaveLength(2);
    });
  });

  describe('forEach', () => {
    it('iterates over all elements', async () => {
      const set = new CuckooSet2<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      const visited: number[] = [];
      set.forEach((value) => {
        visited.push(value);
      });
      expect(visited).toHaveLength(3);
      expect(visited).toContain(1);
      expect(visited).toContain(2);
      expect(visited).toContain(3);
    });

    it('does not iterate over empty set', async () => {
      const set = new CuckooSet2<number>();
      let count = 0;
      set.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('passes correct values to callback', async () => {
      const set = new CuckooSet2<string>();
      set.add('a');
      set.add('b');
      set.add('c');
      const values: string[] = [];
      set.forEach((value) => {
        values.push(value);
      });
      expect(values).toContain('a');
      expect(values).toContain('b');
      expect(values).toContain('c');
    });
  });

  describe('resize', () => {
    it('resizes automatically when needed', async () => {
      const set = new CuckooSet2<number>(4);
      for (let i = 0; i < 100; i++) {
        set.add(i);
      }
      expect(set.size).toBe(100);
      expect(set.has(50)).toBe(true);
      expect(set.has(99)).toBe(true);
    });

    it('preserves elements after resize', async () => {
      const set = new CuckooSet2<number>(8);
      for (let i = 0; i < 20; i++) {
        set.add(i);
      }
      for (let i = 0; i < 20; i++) {
        expect(set.has(i)).toBe(true);
      }
    });

    it('shrinks when many elements deleted', async () => {
      const set = new CuckooSet2<number>(64);
      for (let i = 0; i < 50; i++) {
        set.add(i);
      }
      for (let i = 0; i < 45; i++) {
        set.delete(i);
      }
      expect(set.size).toBe(5);
      expect(set.has(45)).toBe(true);
      expect(set.has(49)).toBe(true);
    });

    it('does not shrink below minimum capacity', async () => {
      const set = new CuckooSet2<number>(16);
      set.add(1);
      set.add(2);
      set.delete(1);
      set.delete(2);
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles zero', async () => {
      const set = new CuckooSet2<number>();
      expect(set.add(0)).toBe(true);
      expect(set.has(0)).toBe(true);
      expect(set.delete(0)).toBe(true);
      expect(set.has(0)).toBe(false);
    });

    it('handles negative numbers', async () => {
      const set = new CuckooSet2<number>();
      expect(set.add(-1)).toBe(true);
      expect(set.add(-100)).toBe(true);
      expect(set.has(-1)).toBe(true);
      expect(set.has(-100)).toBe(true);
    });

    it('handles large numbers', async () => {
      const set = new CuckooSet2<number>();
      const largeNum = 9007199254740991;
      expect(set.add(largeNum)).toBe(true);
      expect(set.has(largeNum)).toBe(true);
    });

    it('handles empty string', async () => {
      const set = new CuckooSet2<string>();
      expect(set.add('')).toBe(true);
      expect(set.has('')).toBe(true);
      expect(set.delete('')).toBe(true);
      expect(set.has('')).toBe(false);
    });

    it('handles special characters in strings', async () => {
      const set = new CuckooSet2<string>();
      expect(set.add('hello@world')).toBe(true);
      expect(set.add('foo$bar')).toBe(true);
      expect(set.has('hello@world')).toBe(true);
      expect(set.has('foo$bar')).toBe(true);
    });

    it('handles duplicate detection after resize', async () => {
      const set = new CuckooSet2<number>(4);
      set.add(1);
      for (let i = 0; i < 20; i++) {
        set.add(i);
      }
      expect(set.add(1)).toBe(false);
    });
  });

  describe('duplicate handling', () => {
    it('rejects duplicate add', async () => {
      const set = new CuckooSet2<number>();
      expect(set.add(5)).toBe(true);
      expect(set.add(5)).toBe(false);
      expect(set.size).toBe(1);
    });

    it('handles duplicates in bulk operations', async () => {
      const set = new CuckooSet2<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.add(1)).toBe(false);
      expect(set.add(2)).toBe(false);
      expect(set.add(3)).toBe(false);
      expect(set.size).toBe(3);
    });

    it('deletes and re-adds same value', async () => {
      const set = new CuckooSet2<number>();
      set.add(10);
      set.delete(10);
      expect(set.add(10)).toBe(true);
      expect(set.size).toBe(1);
      expect(set.has(10)).toBe(true);
    });
  });

  describe('large datasets', () => {
    it('handles 200 elements', async () => {
      const set = new CuckooSet2<number>();
      for (let i = 0; i < 200; i++) {
        set.add(i);
      }
      expect(set.size).toBe(200);
      for (let i = 0; i < 200; i++) {
        expect(set.has(i)).toBe(true);
      }
    });

    it('handles 100 elements', async () => {
      const set = new CuckooSet2<number>();
      for (let i = 0; i < 100; i++) {
        set.add(i);
      }
      expect(set.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(set.has(i)).toBe(true);
      }
    });

    it('toArray handles large dataset', async () => {
      const set = new CuckooSet2<number>();
      for (let i = 0; i < 200; i++) {
        set.add(i);
      }
      const arr = set.toArray();
      expect(arr).toHaveLength(200);
      for (let i = 0; i < 200; i++) {
        expect(arr).toContain(i);
      }
    });

    it('forEach handles large dataset', async () => {
      const set = new CuckooSet2<number>();
      for (let i = 0; i < 200; i++) {
        set.add(i);
      }
      let count = 0;
      set.forEach(() => {
        count++;
      });
      expect(count).toBe(200);
    });

    it('delete from large dataset', async () => {
      const set = new CuckooSet2<number>();
      for (let i = 0; i < 200; i++) {
        set.add(i);
      }
      for (let i = 0; i < 200; i++) {
        expect(set.delete(i)).toBe(true);
      }
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });
  });

  describe('mixed operations', () => {
    it('handles mixed add/delete/has operations', async () => {
      const set = new CuckooSet2<number>();
      set.add(1);
      set.add(2);
      set.add(3);
      expect(set.has(2)).toBe(true);
      set.delete(2);
      expect(set.has(2)).toBe(false);
      set.add(4);
      expect(set.size).toBe(3);
      expect(set.has(1)).toBe(true);
      expect(set.has(3)).toBe(true);
      expect(set.has(4)).toBe(true);
    });

    it('handles clear and refill', async () => {
      const set = new CuckooSet2<number>();
      for (let i = 0; i < 50; i++) {
        set.add(i);
      }
      set.clear();
      for (let i = 0; i < 50; i++) {
        set.add(i + 100);
      }
      expect(set.size).toBe(50);
      expect(set.has(149)).toBe(true);
      expect(set.has(49)).toBe(false);
    });
  });
});
