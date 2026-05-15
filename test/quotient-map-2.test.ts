import { describe, it, expect } from 'vitest';
import { QuotientMap2 } from '../src/core/quotient-map-2/index.js';

describe('QuotientMap2', () => {
  it('constructor creates instance with equivalence function', () => {
    const equivalenceFn = (a: string, b: string) => a === b;
    const map = new QuotientMap2(equivalenceFn);
    expect(map).toBeInstanceOf(QuotientMap2);
  });

  describe('set and get', () => {
    it('stores and retrieves values', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);
      map.set('b', 2);

      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
    });

    it('updates existing key', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);
      map.set('a', 2);

      expect(map.get('a')).toBe(2);
    });

    it('returns undefined for non-existent key', () => {
      const map = new QuotientMap2(() => false);
      expect(map.get('nonexistent')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('returns true for existing keys', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);

      expect(map.has('a')).toBe(true);
    });

    it('returns false for non-existent keys', () => {
      const map = new QuotientMap2(() => false);

      expect(map.has('nonexistent')).toBe(false);
    });
  });

  describe('delete', () => {
    it('deletes existing key and returns true', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);

      const result = map.delete('a');

      expect(result).toBe(true);
      expect(map.has('a')).toBe(false);
    });

    it('returns false for non-existent key', () => {
      const map = new QuotientMap2(() => false);

      const result = map.delete('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getEquivalenceClass', () => {
    it('returns empty array for non-existent key', () => {
      const map = new QuotientMap2(() => false);
      const result = map.getEquivalenceClass('nonexistent');
      expect(result).toEqual([]);
    });

    it('returns single key when no classes merged', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);
      map.set('b', 2);

      expect(map.getEquivalenceClass('a')).toEqual(['a']);
      expect(map.getEquivalenceClass('b')).toEqual(['b']);
    });

    it('returns all keys in equivalence class', () => {
      const map = new QuotientMap2((a: string, b: string) => a[0] === b[0]);
      map.set('a1', 1);
      map.set('a2', 2);
      map.set('b1', 3);

      const classA = map.getEquivalenceClass('a1');
      expect(classA).toContain('a1');
      expect(classA).toContain('a2');
      expect(classA).not.toContain('b1');
    });
  });

  describe('getClassRepresentative', () => {
    it('returns undefined for non-existent key', () => {
      const map = new QuotientMap2(() => false);
      expect(map.getClassRepresentative('nonexistent')).toBeUndefined();
    });

    it('returns canonical key for class', () => {
      const map = new QuotientMap2((a: string, b: string) => a[0] === b[0]);
      map.set('a1', 1);
      map.set('a2', 2);

      const rep1 = map.getClassRepresentative('a1');
      const rep2 = map.getClassRepresentative('a2');

      expect(rep1).toBe(rep2);
      expect(['a1', 'a2']).toContain(rep1 as string);
    });
  });

  describe('mergeClasses', () => {
    it('merges two equivalence classes', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);
      map.set('b', 2);

      map.mergeClasses('a', 'b');

      expect(map.getClassRepresentative('a')).toBe(map.getClassRepresentative('b'));
    });

    it('does nothing for non-existent keys', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);

      expect(() => map.mergeClasses('a', 'nonexistent')).not.toThrow();
    });

    it('handles self-merge', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);

      expect(() => map.mergeClasses('a', 'a')).not.toThrow();
      expect(map.getClassRepresentative('a')).toBe('a');
    });
  });

  describe('classCount', () => {
    it('returns 0 for empty map', () => {
      const map = new QuotientMap2(() => false);
      expect(map.classCount()).toBe(0);
    });

    it('returns 1 for single key', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);

      expect(map.classCount()).toBe(1);
    });

    it('returns number of classes when no classes merged', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      expect(map.classCount()).toBe(3);
    });

    it('returns 1 when all keys in same class', () => {
      const map = new QuotientMap2((a: string, b: string) => a[0] === b[0]);
      map.set('a1', 1);
      map.set('a2', 2);
      map.set('a3', 3);

      expect(map.classCount()).toBe(1);
    });
  });

  describe('size', () => {
    it('returns 0 for empty map', () => {
      const map = new QuotientMap2(() => false);
      expect(map.size).toBe(0);
    });

    it('returns number of entries', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);
      map.set('b', 2);

      expect(map.size).toBe(2);
    });

    it('updates after delete', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);
      map.set('b', 2);
      map.delete('a');

      expect(map.size).toBe(1);
    });
  });

  describe('clear', () => {
    it('clears all data', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);
      map.set('b', 2);

      map.clear();

      expect(map.size).toBe(0);
      expect(map.classCount()).toBe(0);
      expect(map.has('a')).toBe(false);
      expect(map.has('b')).toBe(false);
    });
  });

  describe('keys', () => {
    it('returns all keys', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const keys = map.keys();

      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
      expect(keys.length).toBe(3);
    });

    it('returns empty array for empty map', () => {
      const map = new QuotientMap2(() => false);
      expect(map.keys()).toEqual([]);
    });
  });

  describe('values', () => {
    it('returns all values', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const values = map.values();

      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
      expect(values.length).toBe(3);
    });

    it('returns empty array for empty map', () => {
      const map = new QuotientMap2(() => false);
      expect(map.values()).toEqual([]);
    });
  });

  describe('entries', () => {
    it('returns all entries', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);
      map.set('b', 2);

      const entries = map.entries();

      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
      expect(entries.length).toBe(2);
    });

    it('returns empty array for empty map', () => {
      const map = new QuotientMap2(() => false);
      expect(map.entries()).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('handles empty string keys', () => {
      const map = new QuotientMap2(() => false);
      map.set('', 1);

      expect(map.get('')).toBe(1);
      expect(map.has('')).toBe(true);
    });

    it('handles special characters in keys', () => {
      const map = new QuotientMap2(() => false);
      map.set('key-with-dash', 1);
      map.set('key.with.dot', 2);
      map.set('key@with@at', 3);

      expect(map.get('key-with-dash')).toBe(1);
      expect(map.get('key.with.dot')).toBe(2);
      expect(map.get('key@with@at')).toBe(3);
    });

    it('stores undefined values', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', undefined);

      expect(map.get('a')).toBeUndefined();
      expect(map.has('a')).toBe(true);
    });

    it('stores null values', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', null);

      expect(map.get('a')).toBeNull();
      expect(map.has('a')).toBe(true);
    });

    it('handles consecutive merges', () => {
      const map = new QuotientMap2(() => false);
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      map.mergeClasses('a', 'b');
      map.mergeClasses('b', 'c');

      expect(map.getClassRepresentative('a')).toBe(map.getClassRepresentative('c'));
      expect(map.classCount()).toBe(1);
    });

    it('handles complex equivalence function', () => {
      const map = new QuotientMap2((a: string, b: string) => {
        const sumA = a.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const sumB = b.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return sumA % 3 === sumB % 3;
      });

      map.set('ab', 1);
      map.set('c', 2);

      const classAb = map.getEquivalenceClass('ab');
      const classC = map.getEquivalenceClass('c');

      expect(classAb).toContain('ab');
      expect(classC).toContain('c');
    });
  });

  it('should handle delete', () => {
    const qm = new QuotientMap2((a, b) => a === b);
    qm.set('key1', 'value1');
    qm.set('key2', 'value2');
    expect(qm.delete('key1')).toBe(true);
    expect(qm.get('key1')).toBeUndefined();
  });

  it('should handle has', () => {
    const qm = new QuotientMap2((a, b) => a === b);
    qm.set('key1', 'value1');
    expect(qm.has('key1')).toBe(true);
    expect(qm.has('nonexistent')).toBe(false);
  });
});
