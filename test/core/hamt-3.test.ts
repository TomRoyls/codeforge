import { describe, it, expect } from 'vitest';
import { Hamt3 } from '../../src/core/hamt-3/index.js';

describe('Hamt3', () => {
  // ─── Constructor / Factory ───

  describe('createEmpty', () => {
    it('creates an empty HAMT', () => {
      const hamt = Hamt3.createEmpty<string>();
      expect(hamt.size).toBe(0);
      expect(hamt.isEmpty()).toBe(true);
    });
  });

  // ─── set and get ───

  describe('set / get', () => {
    it('sets and gets a single value', () => {
      const hamt = Hamt3.createEmpty<string>().set('a', 'hello');
      expect(hamt.get('a')).toBe('hello');
    });

    it('returns undefined for missing key', () => {
      const hamt = Hamt3.createEmpty<string>();
      expect(hamt.get('missing')).toBeUndefined();
    });

    it('overwrites existing key', () => {
      const hamt = Hamt3.createEmpty<string>().set('k', 'v1').set('k', 'v2');
      expect(hamt.get('k')).toBe('v2');
      expect(hamt.size).toBe(1);
    });

    it('sets multiple keys', () => {
      let hamt = Hamt3.createEmpty<number>();
      hamt = hamt.set('a', 1).set('b', 2).set('c', 3);
      expect(hamt.get('a')).toBe(1);
      expect(hamt.get('b')).toBe(2);
      expect(hamt.get('c')).toBe(3);
      expect(hamt.size).toBe(3);
    });

    it('handles numeric string keys', () => {
      let hamt = Hamt3.createEmpty<number>();
      for (let i = 0; i < 50; i++) {
        hamt = hamt.set(String(i), i);
      }
      for (let i = 0; i < 50; i++) {
        expect(hamt.get(String(i))).toBe(i);
      }
      expect(hamt.size).toBe(50);
    });

    it('preserves immutability', () => {
      const h1 = Hamt3.createEmpty<string>().set('a', '1');
      const h2 = h1.set('b', '2');
      expect(h1.get('b')).toBeUndefined();
      expect(h2.get('a')).toBe('1');
      expect(h2.get('b')).toBe('2');
      expect(h1.size).toBe(1);
      expect(h2.size).toBe(2);
    });

    it('handles empty string key', () => {
      const hamt = Hamt3.createEmpty<string>().set('', 'empty');
      expect(hamt.get('')).toBe('empty');
    });

    it('handles single character keys', () => {
      let hamt = Hamt3.createEmpty<number>();
      for (let i = 0; i < 26; i++) {
        hamt = hamt.set(String.fromCharCode(97 + i), i);
      }
      expect(hamt.size).toBe(26);
      expect(hamt.get('z')).toBe(25);
    });
  });

  // ─── has ───

  describe('has', () => {
    it('returns true for existing key', () => {
      const hamt = Hamt3.createEmpty<string>().set('x', 'val');
      expect(hamt.has('x')).toBe(true);
    });

    it('returns false for missing key', () => {
      const hamt = Hamt3.createEmpty<string>();
      expect(hamt.has('missing')).toBe(false);
    });

    it('returns false after key was never added', () => {
      const hamt = Hamt3.createEmpty<string>().set('a', '1');
      expect(hamt.has('b')).toBe(false);
    });
  });

  // ─── delete ───

  describe('delete', () => {
    it('deletes an existing key', () => {
      const hamt = Hamt3.createEmpty<string>().set('a', '1').set('b', '2');
      const after = hamt.delete('a');
      expect(after.get('a')).toBeUndefined();
      expect(after.get('b')).toBe('2');
      expect(after.size).toBe(1);
    });

    it('returns same instance when deleting missing key', () => {
      const hamt = Hamt3.createEmpty<string>().set('a', '1');
      const after = hamt.delete('missing');
      expect(after).toBe(hamt);
    });

    it('deletes the only key leaving empty', () => {
      const hamt = Hamt3.createEmpty<string>().set('only', 'val');
      const after = hamt.delete('only');
      expect(after.size).toBe(0);
      expect(after.isEmpty()).toBe(true);
    });

    it('handles delete on empty', () => {
      const hamt = Hamt3.createEmpty<string>();
      const after = hamt.delete('noop');
      expect(after.size).toBe(0);
    });

    it('set after delete restores key', () => {
      const h1 = Hamt3.createEmpty<string>().set('a', '1');
      const h2 = h1.delete('a');
      const h3 = h2.set('a', '2');
      expect(h3.get('a')).toBe('2');
      expect(h3.size).toBe(1);
    });
  });

  // ─── size / isEmpty ───

  describe('size / isEmpty', () => {
    it('tracks size through operations', () => {
      let hamt = Hamt3.createEmpty<number>();
      expect(hamt.isEmpty()).toBe(true);
      hamt = hamt.set('a', 1);
      expect(hamt.size).toBe(1);
      expect(hamt.isEmpty()).toBe(false);
      hamt = hamt.set('b', 2);
      expect(hamt.size).toBe(2);
      hamt = hamt.delete('a');
      expect(hamt.size).toBe(1);
    });
  });

  // ─── keys / values / entries ───

  describe('keys / values / entries', () => {
    it('keys returns all keys', () => {
      const hamt = Hamt3.createEmpty<number>().set('a', 1).set('b', 2).set('c', 3);
      const keys = hamt.keys();
      expect(keys.sort()).toEqual(['a', 'b', 'c']);
    });

    it('values returns all values', () => {
      const hamt = Hamt3.createEmpty<number>().set('x', 10).set('y', 20);
      const vals = hamt.values();
      expect(vals.sort()).toEqual([10, 20]);
    });

    it('entries returns all key-value pairs', () => {
      const hamt = Hamt3.createEmpty<string>().set('a', '1').set('b', '2');
      const entries = hamt.entries().sort((a, b) => a[0].localeCompare(b[0]));
      expect(entries).toEqual([
        ['a', '1'],
        ['b', '2'],
      ]);
    });

    it('returns empty arrays for empty hamt', () => {
      const hamt = Hamt3.createEmpty<string>();
      expect(hamt.keys()).toEqual([]);
      expect(hamt.values()).toEqual([]);
      expect(hamt.entries()).toEqual([]);
    });
  });

  // ─── forEach ───

  describe('forEach', () => {
    it('iterates all entries', () => {
      const hamt = Hamt3.createEmpty<number>().set('a', 1).set('b', 2);
      const collected: [string, number][] = [];
      hamt.forEach((v, k) => collected.push([k, v]));
      expect(collected.sort((a, b) => a[0].localeCompare(b[0]))).toEqual([
        ['a', 1],
        ['b', 2],
      ]);
    });

    it('does not call callback on empty', () => {
      const hamt = Hamt3.createEmpty<number>();
      let called = false;
      hamt.forEach(() => { called = true; });
      expect(called).toBe(false);
    });
  });

  // ─── clear ───

  describe('clear', () => {
    it('returns an empty HAMT', () => {
      const hamt = Hamt3.createEmpty<number>().set('a', 1).set('b', 2);
      const cleared = hamt.clear();
      expect(cleared.size).toBe(0);
      expect(cleared.isEmpty()).toBe(true);
    });
  });

  // ─── Collision Handling ───

  describe('collision handling', () => {
    it('handles many keys correctly', () => {
      let hamt = Hamt3.createEmpty<number>();
      const count = 100;
      for (let i = 0; i < count; i++) {
        hamt = hamt.set(`key_${i}`, i);
      }
      expect(hamt.size).toBe(count);
      for (let i = 0; i < count; i++) {
        expect(hamt.get(`key_${i}`)).toBe(i);
      }
    });
  });

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('works with different value types', () => {
      const hNum = Hamt3.createEmpty<number>().set('a', 42);
      expect(hNum.get('a')).toBe(42);

      const hObj = Hamt3.createEmpty<object>().set('a', { x: 1 });
      expect(hObj.get('a')).toEqual({ x: 1 });

      const hNull = Hamt3.createEmpty<null>().set('a', null);
      expect(hNull.get('a')).toBeNull();
    });

    it('handles long keys', () => {
      const longKey = 'a'.repeat(1000);
      const hamt = Hamt3.createEmpty<string>().set(longKey, 'val');
      expect(hamt.get(longKey)).toBe('val');
    });

    it('handles special characters in keys', () => {
      const hamt = Hamt3.createEmpty<string>()
        .set('key with spaces', '1')
        .set('key\nwith\nnewlines', '2')
        .set('🔑', 'emoji');
      expect(hamt.get('key with spaces')).toBe('1');
      expect(hamt.get('key\nwith\nnewlines')).toBe('2');
      expect(hamt.get('🔑')).toBe('emoji');
    });
  });
});
