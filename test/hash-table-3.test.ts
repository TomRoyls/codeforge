import { describe, it, expect } from 'vitest';
import { HashTable3 } from './src/core/hash-table-3/index.js';

describe('HashTable3', () => {
  describe('constructor', () => {
    it('creates table with default capacity 16', () => {
      const table = new HashTable3<number, number>();
      expect(table.capacity).toBe(16);
      expect(table.size).toBe(0);
      expect(table.isEmpty).toBe(true);
    });

    it('creates table with specified capacity', () => {
      const table = new HashTable3<number, number>(32);
      expect(table.capacity).toBe(32);
    });

    it('uses next power of two for capacity', () => {
      const table = new HashTable3<number, number>(10);
      expect(table.capacity).toBe(16);
    });

    it('handles capacity of 1', () => {
      const table = new HashTable3<number, number>(1);
      expect(table.capacity).toBe(2);
    });
  });

  describe('set and get', () => {
    it('sets and gets values', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      expect(table.get('a')).toBe(1);
    });

    it('returns undefined for non-existent key', () => {
      const table = new HashTable3<string, number>();
      expect(table.get('nonexistent')).toBeUndefined();
    });

    it('overwrites existing key', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('a', 2);
      expect(table.get('a')).toBe(2);
      expect(table.size).toBe(1);
    });

    it('handles number keys', () => {
      const table = new HashTable3<number, string>();
      table.set(1, 'one');
      table.set(2, 'two');
      expect(table.get(1)).toBe('one');
      expect(table.get(2)).toBe('two');
    });

    it('handles multiple entries', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      table.set('c', 3);
      expect(table.get('a')).toBe(1);
      expect(table.get('b')).toBe(2);
      expect(table.get('c')).toBe(3);
      expect(table.size).toBe(3);
    });

    it('handles collision with linear probing', () => {
      const table = new HashTable3<number, number>(2);
      table.set(1, 100);
      table.set(3, 300);
      expect(table.get(1)).toBe(100);
      expect(table.get(3)).toBe(300);
    });

    it('handles string keys', () => {
      const table = new HashTable3<string, string>();
      table.set('hello', 'world');
      table.set('foo', 'bar');
      expect(table.get('hello')).toBe('world');
      expect(table.get('foo')).toBe('bar');
    });

    it('handles collision after delete', () => {
      const table = new HashTable3<number, number>(4);
      table.set(1, 100);
      table.set(5, 500);
      table.delete(1);
      table.set(9, 900);
      expect(table.get(5)).toBe(500);
      expect(table.get(9)).toBe(900);
    });
  });

  describe('delete', () => {
    it('deletes existing key', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      expect(table.delete('a')).toBe(true);
      expect(table.get('a')).toBeUndefined();
      expect(table.size).toBe(0);
    });

    it('returns false for non-existent key', () => {
      const table = new HashTable3<string, number>();
      expect(table.delete('nonexistent')).toBe(false);
    });

    it('deletes non-existent key from empty table', () => {
      const table = new HashTable3<string, number>();
      expect(table.delete('any')).toBe(false);
      expect(table.size).toBe(0);
    });

    it('handles deleting key after collision', () => {
      const table = new HashTable3<number, number>(2);
      table.set(1, 100);
      table.set(3, 300);
      expect(table.delete(1)).toBe(true);
      expect(table.get(1)).toBeUndefined();
      expect(table.get(3)).toBe(300);
    });

    it('handles multiple deletions', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      table.set('c', 3);
      table.delete('a');
      table.delete('b');
      expect(table.size).toBe(1);
      expect(table.get('c')).toBe(3);
    });
  });

  describe('has', () => {
    it('returns true for existing key', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      expect(table.has('a')).toBe(true);
    });

    it('returns false for non-existent key', () => {
      const table = new HashTable3<string, number>();
      expect(table.has('nonexistent')).toBe(false);
    });

    it('returns false after delete', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.delete('a');
      expect(table.has('a')).toBe(false);
    });

    it('handles collision scenarios', () => {
      const table = new HashTable3<number, number>(2);
      table.set(1, 100);
      table.set(3, 300);
      expect(table.has(1)).toBe(true);
      expect(table.has(3)).toBe(true);
    });
  });

  describe('size', () => {
    it('returns 0 for empty table', () => {
      const table = new HashTable3<string, number>();
      expect(table.size).toBe(0);
    });

    it('returns correct size after adds', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      table.set('c', 3);
      expect(table.size).toBe(3);
    });

    it('updates size after delete', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      table.delete('a');
      expect(table.size).toBe(1);
    });

    it('does not change size on overwrite', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('a', 2);
      expect(table.size).toBe(1);
    });

    it('updates size after clear', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      table.clear();
      expect(table.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty table', () => {
      const table = new HashTable3<string, number>();
      expect(table.isEmpty).toBe(true);
    });

    it('returns false after adding entries', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      expect(table.isEmpty).toBe(false);
    });

    it('returns true after clearing', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      table.clear();
      expect(table.isEmpty).toBe(true);
    });

    it('returns true after deleting all entries', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.delete('a');
      expect(table.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears all entries', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      table.set('c', 3);
      table.clear();
      expect(table.size).toBe(0);
      expect(table.isEmpty).toBe(true);
      expect(table.get('a')).toBeUndefined();
    });

    it('clears empty table without error', () => {
      const table = new HashTable3<string, number>();
      table.clear();
      expect(table.size).toBe(0);
    });

    it('preserves capacity after clear', () => {
      const table = new HashTable3<string, number>(32);
      table.set('a', 1);
      table.clear();
      expect(table.capacity).toBe(32);
    });
  });

  describe('keys', () => {
    it('returns empty array for empty table', () => {
      const table = new HashTable3<string, number>();
      expect(table.keys()).toEqual([]);
    });

    it('returns all keys', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      table.set('c', 3);
      const keys = table.keys();
      expect(keys.length).toBe(3);
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
    });

    it('excludes deleted keys', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      table.delete('a');
      const keys = table.keys();
      expect(keys.length).toBe(1);
      expect(keys).toContain('b');
      expect(keys).not.toContain('a');
    });

    it('handles number keys', () => {
      const table = new HashTable3<number, string>();
      table.set(1, 'one');
      table.set(2, 'two');
      const keys = table.keys();
      expect(keys.length).toBe(2);
      expect(keys).toContain(1);
      expect(keys).toContain(2);
    });
  });

  describe('values', () => {
    it('returns empty array for empty table', () => {
      const table = new HashTable3<string, number>();
      expect(table.values()).toEqual([]);
    });

    it('returns all values', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      table.set('c', 3);
      const values = table.values();
      expect(values.length).toBe(3);
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
    });

    it('returns updated value after overwrite', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('a', 2);
      const values = table.values();
      expect(values.length).toBe(1);
      expect(values).toContain(2);
    });
  });

  describe('entries', () => {
    it('returns empty array for empty table', () => {
      const table = new HashTable3<string, number>();
      expect(table.entries()).toEqual([]);
    });

    it('returns all entries', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      const entries = table.entries();
      expect(entries.length).toBe(2);
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
    });

    it('excludes deleted entries', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      table.delete('a');
      const entries = table.entries();
      expect(entries.length).toBe(1);
      expect(entries).toContainEqual(['b', 2]);
    });
  });

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      table.set('c', 3);
      const visited: [number, string][] = [];
      table.forEach((value, key) => {
        visited.push([value, key]);
      });
      expect(visited.length).toBe(3);
      expect(visited).toContainEqual([1, 'a']);
      expect(visited).toContainEqual([2, 'b']);
      expect(visited).toContainEqual([3, 'c']);
    });

    it('does not iterate over empty table', () => {
      const table = new HashTable3<string, number>();
      let count = 0;
      table.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('handles collision scenarios in iteration', () => {
      const table = new HashTable3<number, number>(2);
      table.set(1, 100);
      table.set(3, 300);
      const visited: number[] = [];
      table.forEach((value) => {
        visited.push(value);
      });
      expect(visited.length).toBe(2);
      expect(visited).toContain(100);
      expect(visited).toContain(300);
    });
  });

  describe('resize', () => {
    it('resizes to larger capacity', () => {
      const table = new HashTable3<string, number>(4);
      table.set('a', 1);
      table.set('b', 2);
      table.resize(16);
      expect(table.capacity).toBe(16);
      expect(table.get('a')).toBe(1);
      expect(table.get('b')).toBe(2);
    });

    it('resizes to smaller capacity', () => {
      const table = new HashTable3<string, number>(16);
      table.set('a', 1);
      table.set('b', 2);
      table.resize(4);
      expect(table.capacity).toBe(4);
      expect(table.get('a')).toBe(1);
      expect(table.get('b')).toBe(2);
    });

    it('preserves entries after resize', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      table.set('c', 3);
      table.resize(32);
      expect(table.size).toBe(3);
      expect(table.get('a')).toBe(1);
      expect(table.get('b')).toBe(2);
      expect(table.get('c')).toBe(3);
    });

    it('handles collisions after resize', () => {
      const table = new HashTable3<number, number>(2);
      table.set(1, 100);
      table.set(3, 300);
      table.resize(8);
      expect(table.get(1)).toBe(100);
      expect(table.get(3)).toBe(300);
    });
  });

  describe('loadFactor', () => {
    it('returns 0 for empty table', () => {
      const table = new HashTable3<string, number>();
      expect(table.loadFactor).toBe(0);
    });

    it('calculates correct load factor', () => {
      const table = new HashTable3<string, number>(4);
      table.set('a', 1);
      table.set('b', 2);
      expect(table.loadFactor).toBe(0.5);
    });

    it('updates load factor after adds', () => {
      const table = new HashTable3<string, number>(4);
      table.set('a', 1);
      expect(table.loadFactor).toBe(0.25);
      table.set('b', 2);
      expect(table.loadFactor).toBe(0.5);
    });

    it('updates load factor after delete', () => {
      const table = new HashTable3<string, number>(4);
      table.set('a', 1);
      table.set('b', 2);
      table.delete('a');
      expect(table.loadFactor).toBe(0.25);
    });

    it('updates load factor after clear', () => {
      const table = new HashTable3<string, number>(4);
      table.set('a', 1);
      table.set('b', 2);
      table.clear();
      expect(table.loadFactor).toBe(0);
    });
  });

  describe('capacity', () => {
    it('returns initial capacity', () => {
      const table = new HashTable3<string, number>(16);
      expect(table.capacity).toBe(16);
    });

    it('returns capacity after resize', () => {
      const table = new HashTable3<string, number>(16);
      table.resize(32);
      expect(table.capacity).toBe(32);
    });

    it('returns capacity after auto-resize', () => {
      const table = new HashTable3<number, number>(4);
      for (let i = 0; i < 3; i++) {
        table.set(i, i * 100);
      }
      expect(table.capacity).toBe(8);
    });
  });

  describe('auto-resize', () => {
    it('auto-resizes when load factor exceeds 0.7', () => {
      const table = new HashTable3<number, number>(8);
      for (let i = 0; i < 6; i++) {
        table.set(i, i);
      }
      expect(table.capacity).toBe(16);
    });

    it('preserves all entries after auto-resize', () => {
      const table = new HashTable3<number, number>(4);
      for (let i = 0; i < 3; i++) {
        table.set(i, i * 100);
      }
      expect(table.capacity).toBe(8);
      for (let i = 0; i < 3; i++) {
        expect(table.get(i)).toBe(i * 100);
      }
    });

    it('does not auto-resize below threshold', () => {
      const table = new HashTable3<number, number>(16);
      for (let i = 0; i < 5; i++) {
        table.set(i, i);
      }
      expect(table.capacity).toBe(16);
    });
  });

  describe('large number of entries', () => {
    it('handles 1000 entries', () => {
      const table = new HashTable3<number, number>();
      for (let i = 0; i < 1000; i++) {
        table.set(i, i * 2);
      }
      expect(table.size).toBe(1000);
      for (let i = 0; i < 1000; i++) {
        expect(table.get(i)).toBe(i * 2);
      }
    });

    it('handles many collisions', () => {
      const table = new HashTable3<number, number>(4);
      for (let i = 0; i < 100; i++) {
        table.set(i * 4, i);
      }
      expect(table.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(table.get(i * 4)).toBe(i);
      }
    });
  });

  describe('empty table operations', () => {
    it('handles get on empty table', () => {
      const table = new HashTable3<string, number>();
      expect(table.get('any')).toBeUndefined();
    });

    it('handles has on empty table', () => {
      const table = new HashTable3<string, number>();
      expect(table.has('any')).toBe(false);
    });

    it('handles delete on empty table', () => {
      const table = new HashTable3<string, number>();
      expect(table.delete('any')).toBe(false);
    });

    it('handles keys on empty table', () => {
      const table = new HashTable3<string, number>();
      expect(table.keys()).toEqual([]);
    });

    it('handles values on empty table', () => {
      const table = new HashTable3<string, number>();
      expect(table.values()).toEqual([]);
    });

    it('handles entries on empty table', () => {
      const table = new HashTable3<string, number>();
      expect(table.entries()).toEqual([]);
    });

    it('handles forEach on empty table', () => {
      const table = new HashTable3<string, number>();
      let count = 0;
      table.forEach(() => count++);
      expect(count).toBe(0);
    });
  });

  describe('overwrite existing key', () => {
    it('overwrites value but not size', () => {
      const table = new HashTable3<string, number>();
      table.set('a', 1);
      table.set('b', 2);
      table.set('a', 10);
      expect(table.get('a')).toBe(10);
      expect(table.size).toBe(2);
    });

    it('handles overwrite after collisions', () => {
      const table = new HashTable3<number, number>(2);
      table.set(1, 100);
      table.set(3, 300);
      table.set(1, 999);
      expect(table.get(1)).toBe(999);
      expect(table.get(3)).toBe(300);
      expect(table.size).toBe(2);
    });
  });
});
