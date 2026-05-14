import { describe, it, expect } from 'vitest';
import { CoalescingMap } from '../src/core/coalescing-map/index.js';

describe('CoalescingMap', () => {
  describe('constructor', () => {
    it('creates empty map with default options', () => {
      const map = new CoalescingMap<number, number>();
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
      expect(map.ranges()).toEqual([]);
    });

    it.skip('accepts custom compare function', () => {
      const map = new CoalescingMap<number, string>({
        compare: (a, b) => b - a
      });
      map.set(10, 20, 'a');
      expect(map.get(15)).toBe('a');
    });

    it('accepts custom predecessor function', () => {
      const map = new CoalescingMap<number, number>({
        predecessor: (k) => k - 2
      });
      map.set(10, 20, 1);
      map.set(22, 30, 2);
      expect(map.size).toBe(2);
    });

    it('accepts custom successor function', () => {
      const map = new CoalescingMap<number, number>({
        successor: (k) => k + 2
      });
      map.set(10, 20, 1);
      map.set(22, 30, 2);
      expect(map.size).toBe(2);
    });
  });

  describe('set', () => {
    it('sets single range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      expect(map.size).toBe(1);
      expect(map.get(15)).toBe('a');
    });

    it('coalesces overlapping ranges with same value', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(15, 25, 'a');
      expect(map.size).toBe(1);
      const ranges = map.ranges();
      expect(ranges.length).toBe(1);
      expect(ranges[0].start).toBe(10);
      expect(ranges[0].end).toBe(25);
    });

    it('coalesces adjacent ranges with same value', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(21, 30, 'a');
      expect(map.size).toBe(1);
      const ranges = map.ranges();
      expect(ranges.length).toBe(1);
      expect(ranges[0].start).toBe(10);
      expect(ranges[0].end).toBe(30);
    });

    it('does not coalesce non-overlapping ranges with same value', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(30, 40, 'a');
      expect(map.size).toBe(2);
      const ranges = map.ranges();
      expect(ranges.length).toBe(2);
    });

    it('splits existing range with different value', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 30, 'a');
      map.set(20, 25, 'b');
      expect(map.size).toBe(3);
      const ranges = map.ranges();
      expect(ranges.length).toBe(3);
      expect(ranges[0].start).toBe(10);
      expect(ranges[0].end).toBe(19);
      expect(ranges[0].value).toBe('a');
      expect(ranges[1].start).toBe(20);
      expect(ranges[1].end).toBe(25);
      expect(ranges[1].value).toBe('b');
      expect(ranges[2].start).toBe(26);
      expect(ranges[2].end).toBe(30);
      expect(ranges[2].value).toBe('a');
    });

    it('extends existing range with same value', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(15, 30, 'a');
      expect(map.size).toBe(1);
      const ranges = map.ranges();
      expect(ranges[0].start).toBe(10);
      expect(ranges[0].end).toBe(30);
    });

    it('replaces existing range with different value', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 30, 'a');
      map.set(15, 25, 'b');
      expect(map.get(10)).toBe('a');
      expect(map.get(20)).toBe('b');
      expect(map.get(30)).toBe('a');
    });

    it('ignores set when start > end', () => {
      const map = new CoalescingMap<number, string>();
      map.set(30, 20, 'a');
      expect(map.size).toBe(0);
    });

    it('expands to coalesce multiple ranges', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 15, 'a');
      map.set(20, 25, 'a');
      map.set(30, 35, 'a');
      map.set(12, 32, 'a');
      expect(map.size).toBe(1);
      const ranges = map.ranges();
      expect(ranges.length).toBe(1);
      expect(ranges[0].start).toBe(10);
      expect(ranges[0].end).toBe(35);
    });

    it('works with string keys', () => {
      const map = new CoalescingMap<string, number>({
        compare: (a, b) => a.localeCompare(b)
      });
      map.set('a', 'c', 1);
      map.set('d', 'f', 2);
      expect(map.get('b')).toBe(1);
      expect(map.get('e')).toBe(2);
    });
  });

  describe('get', () => {
    it('returns value for key in range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      expect(map.get(15)).toBe('a');
    });

    it('returns value for start of range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      expect(map.get(10)).toBe('a');
    });

    it('returns value for end of range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      expect(map.get(20)).toBe('a');
    });

    it('returns undefined for key not in range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      expect(map.get(25)).toBeUndefined();
    });

    it('returns undefined for empty map', () => {
      const map = new CoalescingMap<number, string>();
      expect(map.get(15)).toBeUndefined();
    });

    it('handles multiple ranges', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(30, 40, 'b');
      expect(map.get(15)).toBe('a');
      expect(map.get(35)).toBe('b');
    });
  });

  describe('getRange', () => {
    it('returns range for key in range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      const range = map.getRange(15);
      expect(range).toBeDefined();
      expect(range.start).toBe(10);
      expect(range.end).toBe(20);
      expect(range.value).toBe('a');
    });

    it('returns undefined for key not in range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      expect(map.getRange(25)).toBeUndefined();
    });

    it('returns undefined for empty map', () => {
      const map = new CoalescingMap<number, string>();
      expect(map.getRange(15)).toBeUndefined();
    });

    it('handles start of range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      const range = map.getRange(10);
      expect(range.start).toBe(10);
      expect(range.end).toBe(20);
    });

    it('handles end of range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      const range = map.getRange(20);
      expect(range.start).toBe(10);
      expect(range.end).toBe(20);
    });
  });

  describe('delete', () => {
    it('deletes range completely', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.delete(10, 20);
      expect(map.size).toBe(0);
      expect(map.get(15)).toBeUndefined();
    });

    it('deletes partial range at start', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 30, 'a');
      map.delete(10, 20);
      expect(map.size).toBe(1);
      expect(map.get(15)).toBeUndefined();
      expect(map.get(25)).toBe('a');
      const ranges = map.ranges();
      expect(ranges[0].start).toBe(21);
      expect(ranges[0].end).toBe(30);
    });

    it('deletes partial range at end', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 30, 'a');
      map.delete(20, 30);
      expect(map.size).toBe(1);
      expect(map.get(25)).toBeUndefined();
      expect(map.get(15)).toBe('a');
      const ranges = map.ranges();
      expect(ranges[0].start).toBe(10);
      expect(ranges[0].end).toBe(19);
    });

    it('deletes middle of range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 30, 'a');
      map.delete(15, 25);
      expect(map.size).toBe(2);
      expect(map.get(15)).toBeUndefined();
      expect(map.get(25)).toBeUndefined();
      expect(map.get(12)).toBe('a');
      expect(map.get(28)).toBe('a');
      const ranges = map.ranges();
      expect(ranges[0].start).toBe(10);
      expect(ranges[0].end).toBe(14);
      expect(ranges[1].start).toBe(26);
      expect(ranges[1].end).toBe(30);
    });

    it('deletes multiple ranges', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(30, 40, 'b');
      map.delete(15, 35);
      expect(map.size).toBe(2);
      expect(map.get(10)).toBe('a');
      expect(map.get(12)).toBe('a');
      expect(map.get(38)).toBe('b');
      expect(map.get(40)).toBe('b');
    });

    it('does nothing when start > end', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.delete(30, 20);
      expect(map.size).toBe(1);
      expect(map.get(15)).toBe('a');
    });

    it('does nothing on empty map', () => {
      const map = new CoalescingMap<number, string>();
      map.delete(10, 20);
      expect(map.size).toBe(0);
    });

    it('handles non-overlapping deletion', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.delete(30, 40);
      expect(map.size).toBe(1);
      expect(map.get(15)).toBe('a');
    });
  });

  describe('contains', () => {
    it('returns true for key in range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      expect(map.contains(15)).toBe(true);
    });

    it('returns true for start of range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      expect(map.contains(10)).toBe(true);
    });

    it('returns true for end of range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      expect(map.contains(20)).toBe(true);
    });

    it('returns false for key not in range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      expect(map.contains(25)).toBe(false);
    });

    it('returns false for empty map', () => {
      const map = new CoalescingMap<number, string>();
      expect(map.contains(15)).toBe(false);
    });

    it('handles multiple ranges', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(30, 40, 'b');
      expect(map.contains(15)).toBe(true);
      expect(map.contains(35)).toBe(true);
      expect(map.contains(25)).toBe(false);
    });
  });

  describe('overlaps', () => {
    it('returns true for overlapping range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      expect(map.overlaps(15, 25)).toBe(true);
    });

    it('returns true for contained range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 30, 'a');
      expect(map.overlaps(15, 25)).toBe(true);
    });

    it('returns true for containing range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(15, 25, 'a');
      expect(map.overlaps(10, 30)).toBe(true);
    });

    it('returns false for non-overlapping range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      expect(map.overlaps(30, 40)).toBe(false);
    });

    it('returns false for empty map', () => {
      const map = new CoalescingMap<number, string>();
      expect(map.overlaps(15, 25)).toBe(false);
    });

    it('returns false when start > end', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      expect(map.overlaps(30, 20)).toBe(false);
    });

    it('handles adjacent ranges', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      expect(map.overlaps(21, 30)).toBe(false);
    });
  });

  describe('ranges', () => {
    it('returns empty array for empty map', () => {
      const map = new CoalescingMap<number, string>();
      expect(map.ranges()).toEqual([]);
    });

    it('returns single range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      const ranges = map.ranges();
      expect(ranges.length).toBe(1);
      expect(ranges[0].start).toBe(10);
      expect(ranges[0].end).toBe(20);
      expect(ranges[0].value).toBe('a');
    });

    it('returns multiple ranges sorted by start', () => {
      const map = new CoalescingMap<number, string>();
      map.set(30, 40, 'c');
      map.set(10, 20, 'a');
      map.set(50, 60, 'e');
      const ranges = map.ranges();
      expect(ranges.length).toBe(3);
      expect(ranges[0].start).toBe(10);
      expect(ranges[1].start).toBe(30);
      expect(ranges[2].start).toBe(50);
    });

    it('returns ranges after coalescing', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 15, 'a');
      map.set(20, 25, 'a');
      map.set(15, 20, 'a');
      const ranges = map.ranges();
      expect(ranges.length).toBe(1);
      expect(ranges[0].start).toBe(10);
      expect(ranges[0].end).toBe(25);
    });
  });

  describe('size', () => {
    it('returns 0 for empty map', () => {
      const map = new CoalescingMap<number, string>();
      expect(map.size).toBe(0);
    });

    it('returns count of ranges', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(30, 40, 'b');
      map.set(50, 60, 'c');
      expect(map.size).toBe(3);
    });

    it('updates after set', () => {
      const map = new CoalescingMap<number, string>();
      expect(map.size).toBe(0);
      map.set(10, 20, 'a');
      expect(map.size).toBe(1);
    });

    it('updates after delete', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(30, 40, 'b');
      map.delete(10, 20);
      expect(map.size).toBe(1);
    });

    it('updates after clear', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(30, 40, 'b');
      map.clear();
      expect(map.size).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty map', () => {
      const map = new CoalescingMap<number, string>();
      expect(map.isEmpty).toBe(true);
    });

    it('returns false after set', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      expect(map.isEmpty).toBe(false);
    });

    it('returns true after clear', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.clear();
      expect(map.isEmpty).toBe(true);
    });

    it('returns true after delete all', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.delete(10, 20);
      expect(map.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears all ranges', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(30, 40, 'b');
      map.set(50, 60, 'c');
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
      expect(map.ranges()).toEqual([]);
    });

    it('clears empty map', () => {
      const map = new CoalescingMap<number, string>();
      map.clear();
      expect(map.size).toBe(0);
      expect(map.isEmpty).toBe(true);
    });

    it('allows operations after clear', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.clear();
      map.set(30, 40, 'b');
      expect(map.size).toBe(1);
      expect(map.get(35)).toBe('b');
    });
  });

  describe('toArray', () => {
    it('returns empty array for empty map', () => {
      const map = new CoalescingMap<number, string>();
      expect(map.toArray()).toEqual([]);
    });

    it('returns array of ranges', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(30, 40, 'b');
      const arr = map.toArray();
      expect(arr.length).toBe(2);
      expect(arr[0].start).toBe(10);
      expect(arr[0].end).toBe(20);
      expect(arr[0].value).toBe('a');
      expect(arr[1].start).toBe(30);
      expect(arr[1].end).toBe(40);
      expect(arr[1].value).toBe('b');
    });

    it('returns sorted ranges', () => {
      const map = new CoalescingMap<number, string>();
      map.set(30, 40, 'c');
      map.set(10, 20, 'a');
      map.set(50, 60, 'e');
      const arr = map.toArray();
      expect(arr.length).toBe(3);
      expect(arr[0].start).toBe(10);
      expect(arr[1].start).toBe(30);
      expect(arr[2].start).toBe(50);
    });

    it('returns independent array from internal state', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      const arr = map.toArray();
      arr[0].value = 'modified';
      expect(map.get(15)).toBe('a');
    });
  });

  describe('forEach', () => {
    it('iterates over all ranges', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(30, 40, 'b');
      map.set(50, 60, 'c');
      const results: { start: number; end: number; value: string }[] = [];
      map.forEach((start, end, value) => {
        results.push({ start, end, value });
      });
      expect(results.length).toBe(3);
      expect(results[0].value).toBe('a');
      expect(results[1].value).toBe('b');
      expect(results[2].value).toBe('c');
    });

    it('does not iterate over empty map', () => {
      const map = new CoalescingMap<number, string>();
      let count = 0;
      map.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('passes correct parameters', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      let capturedStart, capturedEnd, capturedValue;
      map.forEach((start, end, value) => {
        capturedStart = start;
        capturedEnd = end;
        capturedValue = value;
      });
      expect(capturedStart).toBe(10);
      expect(capturedEnd).toBe(20);
      expect(capturedValue).toBe('a');
    });
  });

  describe('Symbol.iterator', () => {
    it('iterates over all ranges', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(30, 40, 'b');
      map.set(50, 60, 'c');
      const results: { start: number; end: number; value: string }[] = [];
      for (const range of map) {
        results.push(range);
      }
      expect(results.length).toBe(3);
      expect(results[0].value).toBe('a');
      expect(results[1].value).toBe('b');
      expect(results[2].value).toBe('c');
    });

    it('works with for...of loop', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(30, 40, 'b');
      const values: string[] = [];
      for (const range of map) {
        values.push(range.value);
      }
      expect(values).toEqual(['a', 'b']);
    });

    it('works with spread operator', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(30, 40, 'b');
      const arr = [...map];
      expect(arr.length).toBe(2);
      expect(arr[0].value).toBe('a');
      expect(arr[1].value).toBe('b');
    });

    it('does not iterate over empty map', () => {
      const map = new CoalescingMap<number, string>();
      const arr = [...map];
      expect(arr.length).toBe(0);
    });
  });

  describe('complex scenarios', () => {
    it('handles overlapping deletions with coalesced ranges', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 15, 'a');
      map.set(16, 20, 'a');
      map.set(25, 30, 'b');
      map.delete(12, 18);
      expect(map.size).toBe(3);
      expect(map.get(10)).toBe('a');
      expect(map.get(11)).toBe('a');
      expect(map.get(12)).toBeUndefined();
      expect(map.get(18)).toBeUndefined();
      expect(map.get(19)).toBe('a');
      expect(map.get(20)).toBe('a');
      expect(map.get(25)).toBe('b');
    });

    it('handles multiple coalescing operations', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(30, 40, 'b');
      map.set(50, 60, 'c');
      map.set(20, 30, 'a');
      expect(map.size).toBe(3);
      const ranges = map.ranges();
      expect(ranges.length).toBe(3);
    });

    it('handles replacement of entire range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 30, 'a');
      map.set(10, 30, 'b');
      expect(map.size).toBe(1);
      expect(map.get(10)).toBe('b');
      expect(map.get(20)).toBe('b');
      expect(map.get(30)).toBe('b');
    });

    it('handles nested ranges', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 50, 'a');
      map.set(20, 30, 'b');
      map.set(25, 28, 'c');
      expect(map.size).toBe(5);
      expect(map.get(10)).toBe('a');
      expect(map.get(20)).toBe('b');
      expect(map.get(25)).toBe('c');
      expect(map.get(28)).toBe('c');
      expect(map.get(30)).toBe('b');
      expect(map.get(50)).toBe('a');
    });

    it('handles many small ranges', () => {
      const map = new CoalescingMap<number, string>();
      for (let i = 0; i < 10; i++) {
        map.set(i * 10, i * 10 + 5, String.fromCharCode(97 + i));
      }
      expect(map.size).toBe(10);
      for (let i = 0; i < 10; i++) {
        expect(map.get(i * 10 + 2)).toBe(String.fromCharCode(97 + i));
      }
    });
  });

  describe('string keys with custom compare', () => {
    it('works with string keys', () => {
      const map = new CoalescingMap<string, number>({
        compare: (a, b) => a.localeCompare(b),
        predecessor: (k) => String.fromCharCode(k.charCodeAt(0) - 1),
        successor: (k) => String.fromCharCode(k.charCodeAt(0) + 1)
      });
      map.set('a', 'c', 1);
      map.set('d', 'f', 2);
      expect(map.get('b')).toBe(1);
      expect(map.get('e')).toBe(2);
    });

    it('coalesces string ranges', () => {
      const map = new CoalescingMap<string, number>({
        compare: (a, b) => a.localeCompare(b),
        predecessor: (k) => String.fromCharCode(k.charCodeAt(0) - 1),
        successor: (k) => String.fromCharCode(k.charCodeAt(0) + 1)
      });
      map.set('a', 'c', 1);
      map.set('d', 'f', 1);
      map.set('b', 'e', 1);
      expect(map.size).toBe(1);
      const ranges = map.ranges();
      expect(ranges.length).toBe(1);
      expect(ranges[0].start).toBe('a');
      expect(ranges[0].end).toBe('f');
    });
  });

  describe('edge cases', () => {
    it('handles single key range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 10, 'a');
      expect(map.size).toBe(1);
      expect(map.get(10)).toBe('a');
    });

    it('handles set with same start and end as existing', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(10, 20, 'b');
      expect(map.size).toBe(1);
      expect(map.get(10)).toBe('b');
    });

    it('handles delete of non-existent range', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.delete(30, 40);
      expect(map.size).toBe(1);
      expect(map.get(15)).toBe('a');
    });

    it('handles get after multiple overlapping sets', () => {
      const map = new CoalescingMap<number, string>();
      map.set(10, 20, 'a');
      map.set(15, 25, 'b');
      map.set(20, 30, 'a');
      expect(map.get(10)).toBe('a');
      expect(map.get(18)).toBe('b');
      expect(map.get(22)).toBe('a');
      expect(map.get(28)).toBe('a');
    });
  });
});
