import { describe, it, expect } from 'vitest';
import { HopscotchSet2 } from '../src/core/hopscotch-set-2/index.js';

describe('HopscotchSet2', () => {
  describe('constructor', () => {
    it('should use default capacity of 32', () => {
      const set = new HopscotchSet2();
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    it('should accept custom capacity', () => {
      const set = new HopscotchSet2(64);
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });
  });

  describe('add', () => {
    it('should add single item', () => {
      const set = new HopscotchSet2();
      expect(set.add('apple')).toBe(true);
      expect(set.has('apple')).toBe(true);
      expect(set.size).toBe(1);
    });

    it('should add multiple items', () => {
      const set = new HopscotchSet2();
      expect(set.add('apple')).toBe(true);
      expect(set.add('banana')).toBe(true);
      expect(set.add('cherry')).toBe(true);
      expect(set.size).toBe(3);
    });

    it('should return false for duplicate adds', () => {
      const set = new HopscotchSet2();
      expect(set.add('apple')).toBe(true);
      expect(set.add('apple')).toBe(false);
      expect(set.size).toBe(1);
    });

    it('should add many items', () => {
      const set = new HopscotchSet2(32);
      for (let i = 0; i < 100; i++) {
        expect(set.add(`item${i}`)).toBe(true);
      }
      expect(set.size).toBe(100);
    });
  });

  describe('has', () => {
    it('should return true for existing item', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      expect(set.has('apple')).toBe(true);
    });

    it('should return false for non-existing item', () => {
      const set = new HopscotchSet2();
      expect(set.has('apple')).toBe(false);
    });

    it('should return false after delete', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      set.delete('apple');
      expect(set.has('apple')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing item', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      expect(set.delete('apple')).toBe(true);
      expect(set.has('apple')).toBe(false);
      expect(set.size).toBe(0);
    });

    it('should return false for non-existing item', () => {
      const set = new HopscotchSet2();
      expect(set.delete('apple')).toBe(false);
    });

    it('should delete multiple items', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      set.add('banana');
      set.add('cherry');
      expect(set.delete('banana')).toBe(true);
      expect(set.delete('cherry')).toBe(true);
      expect(set.size).toBe(1);
      expect(set.has('apple')).toBe(true);
    });
  });

  describe('size', () => {
    it('should be 0 for empty set', () => {
      const set = new HopscotchSet2();
      expect(set.size).toBe(0);
    });

    it('should increment on add', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      expect(set.size).toBe(1);
      set.add('banana');
      expect(set.size).toBe(2);
    });

    it('should decrement on delete', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      set.add('banana');
      set.delete('apple');
      expect(set.size).toBe(1);
    });

    it('should stay same on duplicate add', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      const initialSize = set.size;
      set.add('apple');
      expect(set.size).toBe(initialSize);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty set', () => {
      const set = new HopscotchSet2();
      expect(set.isEmpty()).toBe(true);
    });

    it('should return false after add', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      expect(set.isEmpty()).toBe(false);
    });

    it('should return true after delete of only item', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      set.delete('apple');
      expect(set.isEmpty()).toBe(true);
    });

    it('should return false after clear and add', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      set.clear();
      set.add('banana');
      expect(set.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear empty set', () => {
      const set = new HopscotchSet2();
      set.clear();
      expect(set.isEmpty()).toBe(true);
      expect(set.size).toBe(0);
    });

    it('should clear single item', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      set.clear();
      expect(set.isEmpty()).toBe(true);
      expect(set.size).toBe(0);
    });

    it('should clear multiple items', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      set.add('banana');
      set.add('cherry');
      set.clear();
      expect(set.isEmpty()).toBe(true);
      expect(set.size).toBe(0);
      expect(set.has('apple')).toBe(false);
      expect(set.has('banana')).toBe(false);
      expect(set.has('cherry')).toBe(false);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty set', () => {
      const set = new HopscotchSet2();
      const array = set.toArray();
      expect(array).toEqual([]);
      expect(array.length).toBe(0);
    });

    it('should return array with single item', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      const array = set.toArray();
      expect(array).toContain('apple');
      expect(array.length).toBe(1);
    });

    it('should return array with multiple items', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      set.add('banana');
      set.add('cherry');
      const array = set.toArray();
      expect(array).toContain('apple');
      expect(array).toContain('banana');
      expect(array).toContain('cherry');
      expect(array.length).toBe(3);
    });

    it('should not include deleted items', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      set.add('banana');
      set.delete('apple');
      const array = set.toArray();
      expect(array).toContain('banana');
      expect(array).not.toContain('apple');
      expect(array.length).toBe(1);
    });
  });

  describe('forEach', () => {
    it('should iterate over empty set', () => {
      const set = new HopscotchSet2();
      const items: string[] = [];
      set.forEach((item) => items.push(item));
      expect(items).toEqual([]);
    });

    it('should iterate over single item', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      const items: string[] = [];
      set.forEach((item) => items.push(item));
      expect(items).toContain('apple');
      expect(items.length).toBe(1);
    });

    it('should iterate over multiple items', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      set.add('banana');
      set.add('cherry');
      const items: string[] = [];
      set.forEach((item) => items.push(item));
      expect(items).toContain('apple');
      expect(items).toContain('banana');
      expect(items).toContain('cherry');
      expect(items.length).toBe(3);
    });

    it('should not iterate over deleted items', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      set.add('banana');
      set.delete('apple');
      const items: string[] = [];
      set.forEach((item) => items.push(item));
      expect(items).toContain('banana');
      expect(items).not.toContain('apple');
      expect(items.length).toBe(1);
    });
  });

  describe('resize', () => {
    it('should preserve items after resize', () => {
      const set = new HopscotchSet2(32);
      set.add('apple');
      set.add('banana');
      set.add('cherry');
      set.resize(64);
      expect(set.size).toBe(3);
      expect(set.has('apple')).toBe(true);
      expect(set.has('banana')).toBe(true);
      expect(set.has('cherry')).toBe(true);
    });

    it('should handle empty set resize', () => {
      const set = new HopscotchSet2(32);
      set.resize(64);
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    it('should handle many items and resize', () => {
      const set = new HopscotchSet2(32);
      const items: string[] = [];
      for (let i = 0; i < 50; i++) {
        items.push(`item${i}`);
        set.add(`item${i}`);
      }
      set.resize(128);
      expect(set.size).toBe(50);
      for (const item of items) {
        expect(set.has(item)).toBe(true);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty set operations', () => {
      const set = new HopscotchSet2();
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
      expect(set.toArray()).toEqual([]);
      expect(set.has('nonexistent')).toBe(false);
      expect(set.delete('nonexistent')).toBe(false);
    });

    it('should handle duplicate adds correctly', () => {
      const set = new HopscotchSet2();
      expect(set.add('apple')).toBe(true);
      expect(set.add('apple')).toBe(false);
      expect(set.add('apple')).toBe(false);
      expect(set.size).toBe(1);
    });

    it('should handle full neighborhood (many items)', () => {
      const set = new HopscotchSet2(32);
      for (let i = 0; i < 100; i++) {
        set.add(`item${i}`);
      }
      expect(set.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(set.has(`item${i}`)).toBe(true);
      }
    });

    it('should handle many items beyond capacity', () => {
      const set = new HopscotchSet2(8);
      for (let i = 0; i < 50; i++) {
        set.add(`item${i}`);
      }
      expect(set.size).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(set.has(`item${i}`)).toBe(true);
      }
    });

    it('should handle add after delete', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      set.delete('apple');
      expect(set.add('apple')).toBe(true);
      expect(set.has('apple')).toBe(true);
      expect(set.size).toBe(1);
    });

    it('should handle add and delete cycle', () => {
      const set = new HopscotchSet2();
      set.add('apple');
      set.add('banana');
      set.delete('apple');
      set.add('cherry');
      expect(set.size).toBe(2);
      expect(set.has('banana')).toBe(true);
      expect(set.has('cherry')).toBe(true);
      expect(set.has('apple')).toBe(false);
    });

    it('should handle contains after multiple ops', () => {
      const set = new HopscotchSet2<string>();
      set.add('x');
      set.add('y');
      set.delete('x');
      set.add('z');
      expect(set.has('x')).toBe(false);
      expect(set.has('y')).toBe(true);
      expect(set.has('z')).toBe(true);
    });
  });
});
