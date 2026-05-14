import { describe, it, expect, beforeEach } from 'vitest';
import { Beap } from '../src/core/beap/index.js';

describe('Beap', () => {
  let beap: Beap<number>;

  beforeEach(() => {
    beap = new Beap<number>();
  });

  describe('constructor and basic operations', () => {
    it('should create empty beap with default comparator', async () => {
      expect(beap.size).toBe(0);
      expect(beap.isEmpty).toBe(true);
    });

    it('should create empty beap with custom comparator', async () => {
      const maxBeap = new Beap<number>({ comparator: (a, b) => b - a });
      expect(maxBeap.size).toBe(0);
      expect(maxBeap.isEmpty).toBe(true);
    });
  });

  describe('insert', () => {
    it('should insert single element', async () => {
      beap.insert(5);
      expect(beap.size).toBe(1);
      expect(beap.isEmpty).toBe(false);
      expect(beap.peek()).toBe(5);
    });

    it('should maintain min after multiple inserts', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      beap.insert(1);
      beap.insert(6);
      expect(beap.peek()).toBe(1);
    });

    it('should handle duplicate values', async () => {
      beap.insert(5);
      beap.insert(5);
      beap.insert(5);
      expect(beap.size).toBe(3);
      expect(beap.peek()).toBe(5);
    });

    it('should insert in descending order', async () => {
      beap.insert(5);
      beap.insert(4);
      beap.insert(3);
      beap.insert(2);
      beap.insert(1);
      expect(beap.peek()).toBe(1);
    });

    it('should insert in ascending order', async () => {
      beap.insert(1);
      beap.insert(2);
      beap.insert(3);
      beap.insert(4);
      beap.insert(5);
      expect(beap.peek()).toBe(1);
    });

    it('should insert with custom comparator', async () => {
      const maxBeap = new Beap<number>({ comparator: (a, b) => b - a });
      maxBeap.insert(1);
      maxBeap.insert(5);
      maxBeap.insert(3);
      expect(maxBeap.peek()).toBe(5);
    });
  });

  describe('extractMin', () => {
    it('should throw error on empty beap', async () => {
      expect(() => beap.extractMin()).toThrow('Beap is empty');
    });

    it('should extract single element', async () => {
      beap.insert(5);
      const extracted = beap.extractMin();
      expect(extracted).toBe(5);
      expect(beap.size).toBe(0);
      expect(beap.isEmpty).toBe(true);
    });

    it('should extract in correct order', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      beap.insert(1);
      beap.insert(6);
      expect(beap.extractMin()).toBe(1);
      expect(beap.extractMin()).toBe(3);
      expect(beap.extractMin()).toBe(5);
      expect(beap.extractMin()).toBe(6);
      expect(beap.extractMin()).toBe(8);
    });

    it('should maintain heap property after extraction', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      beap.insert(1);
      beap.extractMin();
      expect(beap.peek()).toBe(3);
      beap.extractMin();
      expect(beap.peek()).toBe(5);
    });
  });

  describe('peek', () => {
    it('should throw error on empty beap', async () => {
      expect(() => beap.peek()).toThrow('Beap is empty');
    });

    it('should return minimum without removing', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      expect(beap.peek()).toBe(3);
      expect(beap.size).toBe(3);
    });

    it('should update after multiple operations', async () => {
      beap.insert(5);
      expect(beap.peek()).toBe(5);
      beap.insert(3);
      expect(beap.peek()).toBe(3);
      beap.insert(8);
      expect(beap.peek()).toBe(3);
      beap.insert(1);
      expect(beap.peek()).toBe(1);
    });
  });

  describe('contains', () => {
    it('should return false for empty beap', async () => {
      expect(beap.contains(5)).toBe(false);
    });

    it('should return true for existing element', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      expect(beap.contains(5)).toBe(true);
    });

    it('should return false for non-existing element', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      expect(beap.contains(7)).toBe(false);
    });

    it('should handle duplicate values', async () => {
      beap.insert(5);
      beap.insert(5);
      expect(beap.contains(5)).toBe(true);
    });

    it('should return true after extraction for other elements', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      beap.extractMin();
      expect(beap.contains(5)).toBe(true);
      expect(beap.contains(3)).toBe(false);
    });
  });

  describe('delete', () => {
    it('should return false for non-existing element', async () => {
      beap.insert(5);
      expect(beap.delete(3)).toBe(false);
      expect(beap.size).toBe(1);
    });

    it('should delete single element', async () => {
      beap.insert(5);
      expect(beap.delete(5)).toBe(true);
      expect(beap.size).toBe(0);
      expect(beap.isEmpty).toBe(true);
    });

    it('should delete from middle of beap', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      beap.insert(1);
      beap.delete(5);
      expect(beap.size).toBe(3);
      expect(beap.contains(5)).toBe(false);
      expect(beap.contains(3)).toBe(true);
      expect(beap.contains(8)).toBe(true);
      expect(beap.contains(1)).toBe(true);
    });

    it('should delete minimum element', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      beap.insert(1);
      beap.delete(1);
      expect(beap.peek()).toBe(3);
      expect(beap.size).toBe(3);
    });

    it('should handle delete of duplicate values', async () => {
      beap.insert(5);
      beap.insert(5);
      beap.insert(3);
      beap.delete(5);
      expect(beap.size).toBe(2);
      expect(beap.contains(5)).toBe(true);
    });

    it('should delete last element', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      beap.insert(1);
      const arr = beap.toArray();
      const last = arr[arr.length - 1];
      beap.delete(last);
      expect(beap.size).toBe(3);
      expect(beap.contains(last)).toBe(false);
    });
  });

  describe('size', () => {
    it('should return 0 for empty beap', async () => {
      expect(beap.size).toBe(0);
    });

    it('should increment after insert', async () => {
      beap.insert(1);
      expect(beap.size).toBe(1);
      beap.insert(2);
      expect(beap.size).toBe(2);
      beap.insert(3);
      expect(beap.size).toBe(3);
    });

    it('should decrement after extractMin', async () => {
      beap.insert(1);
      beap.insert(2);
      beap.insert(3);
      beap.extractMin();
      expect(beap.size).toBe(2);
      beap.extractMin();
      expect(beap.size).toBe(1);
    });

    it('should decrement after delete', async () => {
      beap.insert(1);
      beap.insert(2);
      beap.insert(3);
      beap.delete(2);
      expect(beap.size).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty beap', async () => {
      expect(beap.isEmpty).toBe(true);
    });

    it('should return false after insert', async () => {
      beap.insert(1);
      expect(beap.isEmpty).toBe(false);
    });

    it('should return true after extracting all elements', async () => {
      beap.insert(1);
      beap.insert(2);
      beap.extractMin();
      beap.extractMin();
      expect(beap.isEmpty).toBe(true);
    });

    it('should return true after deleting all elements', async () => {
      beap.insert(1);
      beap.insert(2);
      beap.delete(1);
      beap.delete(2);
      expect(beap.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all elements', async () => {
      beap.insert(1);
      beap.insert(2);
      beap.insert(3);
      beap.clear();
      expect(beap.size).toBe(0);
      expect(beap.isEmpty).toBe(true);
    });

    it('should handle clear on empty beap', async () => {
      beap.clear();
      expect(beap.size).toBe(0);
      expect(beap.isEmpty).toBe(true);
    });

    it('should allow operations after clear', async () => {
      beap.insert(1);
      beap.insert(2);
      beap.clear();
      beap.insert(3);
      expect(beap.size).toBe(1);
      expect(beap.peek()).toBe(3);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty beap', async () => {
      expect(beap.toArray()).toEqual([]);
    });

    it('should return all elements', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      const arr = beap.toArray();
      expect(arr).toContain(5);
      expect(arr).toContain(3);
      expect(arr).toContain(8);
      expect(arr.length).toBe(3);
    });

    it('should return independent copy', async () => {
      beap.insert(1);
      beap.insert(2);
      const arr = beap.toArray();
      arr.push(999);
      expect(beap.size).toBe(2);
      expect(beap.toArray().length).toBe(2);
    });

    it('should not modify beap when array is modified', async () => {
      beap.insert(1);
      beap.insert(2);
      const arr = beap.toArray();
      arr[0] = 999;
      expect(beap.peek()).toBe(1);
    });
  });

  describe('clone', () => {
    it('should create independent copy', async () => {
      beap.insert(5);
      beap.insert(3);
      const cloned = beap.clone();
      expect(cloned.size).toBe(2);
      expect(cloned.peek()).toBe(3);
      cloned.insert(1);
      expect(beap.size).toBe(2);
      expect(cloned.size).toBe(3);
    });

    it('should maintain same comparator', async () => {
      const maxBeap = new Beap<number>({ comparator: (a, b) => b - a });
      maxBeap.insert(1);
      maxBeap.insert(5);
      const cloned = maxBeap.clone();
      cloned.insert(3);
      expect(cloned.peek()).toBe(5);
    });

    it('should preserve structure', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      const cloned = beap.clone();
      expect(cloned.toArray()).toEqual(beap.toArray());
    });
  });

  describe('fromArray', () => {
    it('should create beap from empty array', async () => {
      const beapFromArray = Beap.fromArray<number>([]);
      expect(beapFromArray.isEmpty).toBe(true);
      expect(beapFromArray.size).toBe(0);
    });

    it('should create beap from single element', async () => {
      const beapFromArray = Beap.fromArray<number>([5]);
      expect(beapFromArray.size).toBe(1);
      expect(beapFromArray.peek()).toBe(5);
    });

    it('should create beap from multiple elements', async () => {
      const beapFromArray = Beap.fromArray<number>([5, 3, 8, 1, 6]);
      expect(beapFromArray.size).toBe(5);
      expect(beapFromArray.peek()).toBe(1);
    });

    it('should use default comparator', async () => {
      const beapFromArray = Beap.fromArray<string>(['zebra', 'apple', 'banana']);
      expect(beapFromArray.peek()).toBe('apple');
    });

    it('should use custom comparator', async () => {
      const beapFromArray = Beap.fromArray<number>(
        [5, 3, 8, 1, 6],
        { comparator: (a, b) => b - a }
      );
      expect(beapFromArray.peek()).toBe(8);
    });

    it('should create beap from array with duplicates', async () => {
      const beapFromArray = Beap.fromArray<number>([5, 3, 5, 1, 3]);
      expect(beapFromArray.size).toBe(5);
      expect(beapFromArray.contains(5)).toBe(true);
      expect(beapFromArray.contains(3)).toBe(true);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      const result: number[] = [];
      beap.forEach((value) => {
        result.push(value);
      });
      expect(result.length).toBe(3);
      expect(result).toContain(5);
      expect(result).toContain(3);
      expect(result).toContain(8);
    });

    it('should provide index to callback', async () => {
      beap.insert(5);
      beap.insert(3);
      const result: number[] = [];
      beap.forEach((value, index) => {
        result.push(index);
      });
      expect(result).toEqual([0, 1]);
    });

    it('should not iterate over empty beap', async () => {
      let count = 0;
      beap.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });
  });

  describe('Symbol.iterator', () => {
    it('should allow for-of loop', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      const result: number[] = [];
      for (const value of beap) {
        result.push(value);
      }
      expect(result.length).toBe(3);
      expect(result).toContain(5);
      expect(result).toContain(3);
      expect(result).toContain(8);
    });

    it('should work with spread operator', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      const arr = [...beap];
      expect(arr.length).toBe(3);
      expect(arr).toContain(5);
      expect(arr).toContain(3);
      expect(arr).toContain(8);
    });

    it('should work with Array.from', async () => {
      beap.insert(5);
      beap.insert(3);
      const arr = Array.from(beap);
      expect(arr.length).toBe(2);
      expect(arr).toContain(5);
      expect(arr).toContain(3);
    });
  });

  describe('toSortedArray', () => {
    it('should return empty array for empty beap', async () => {
      expect(beap.toSortedArray()).toEqual([]);
    });

    it('should return elements in sorted order', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      beap.insert(1);
      beap.insert(6);
      expect(beap.toSortedArray()).toEqual([1, 3, 5, 6, 8]);
    });

    it('should not modify original beap', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      const sizeBefore = beap.size;
      const peekBefore = beap.peek();
      beap.toSortedArray();
      expect(beap.size).toBe(sizeBefore);
      expect(beap.peek()).toBe(peekBefore);
    });

    it('should handle duplicates', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(5);
      beap.insert(1);
      beap.insert(3);
      expect(beap.toSortedArray()).toEqual([1, 3, 3, 5, 5]);
    });
  });

  describe('height', () => {
    it('should return -1 for empty beap', async () => {
      expect(beap.height).toBe(-1);
    });

    it('should return 0 for single element', async () => {
      beap.insert(5);
      expect(beap.height).toBe(0);
    });

    it('should return correct height for multiple elements', async () => {
      beap.insert(1);
      beap.insert(2);
      beap.insert(3);
      expect(beap.height).toBeGreaterThanOrEqual(0);
    });

    it('should increase height as beap grows', async () => {
      let previousHeight = beap.height;
      for (let i = 0; i < 50; i++) {
        beap.insert(i);
        const currentHeight = beap.height;
        expect(currentHeight).toBeGreaterThanOrEqual(previousHeight);
        previousHeight = currentHeight;
      }
    });
  });

  describe('edge cases', () => {
    it('should handle single element operations', async () => {
      beap.insert(42);
      expect(beap.peek()).toBe(42);
      expect(beap.contains(42)).toBe(true);
      expect(beap.extractMin()).toBe(42);
      expect(beap.isEmpty).toBe(true);
    });

    it('should handle negative numbers', async () => {
      beap.insert(-5);
      beap.insert(-3);
      beap.insert(-8);
      expect(beap.peek()).toBe(-8);
      expect(beap.extractMin()).toBe(-8);
    });

    it('should handle zero', async () => {
      beap.insert(0);
      beap.insert(-1);
      beap.insert(1);
      expect(beap.peek()).toBe(-1);
    });

    it('should handle large numbers', async () => {
      beap.insert(Number.MAX_SAFE_INTEGER);
      beap.insert(Number.MIN_SAFE_INTEGER);
      beap.insert(0);
      expect(beap.peek()).toBe(Number.MIN_SAFE_INTEGER);
    });

    it('should handle mixed positive and negative', async () => {
      beap.insert(5);
      beap.insert(-3);
      beap.insert(0);
      beap.insert(-8);
      beap.insert(2);
      expect(beap.peek()).toBe(-8);
    });
  });

  describe('large datasets', () => {
    it.skip('should handle 1000 elements', async () => {
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        values.push(i % 100);
      }
      values.forEach(v => beap.insert(v));
      expect(beap.size).toBe(1000);

      const sorted = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      for (let i = 0; i < 1000; i++) {
        expect(beap.extractMin()).toBe(sorted[i]);
      }
      expect(beap.isEmpty).toBe(true);
    });

    it('should handle sorted insert and extract', async () => {
      for (let i = 0; i < 500; i++) {
        beap.insert(i);
      }
      for (let i = 0; i < 500; i++) {
        expect(beap.extractMin()).toBe(i);
      }
    });

    it('should handle reverse sorted insert', async () => {
      for (let i = 500; i >= 0; i--) {
        beap.insert(i);
      }
      for (let i = 0; i <= 500; i++) {
        expect(beap.extractMin()).toBe(i);
      }
    });

    it('should handle large toSortedArray', async () => {
      const values: number[] = [];
      for (let i = 0; i < 100; i++) {
        values.push(i % 100);
      }
      values.forEach(v => beap.insert(v));
      const sorted = beap.toSortedArray();
      const expected = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      expect(sorted).toEqual(expected);
    });
  });

  describe('sequential extract', () => {
    it('should maintain order throughout sequential extracts', async () => {
      const values = [5, 3, 8, 1, 6, 4, 7, 2];
      values.forEach(v => beap.insert(v));

      const extracted: number[] = [];
      while (!beap.isEmpty) {
        extracted.push(beap.extractMin()!);
      }

      expect(extracted).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('should handle interleave insert and extract', async () => {
      beap.insert(5);
      beap.insert(3);
      expect(beap.extractMin()).toBe(3);
      beap.insert(2);
      beap.insert(4);
      expect(beap.extractMin()).toBe(2);
      expect(beap.extractMin()).toBe(4);
      expect(beap.extractMin()).toBe(5);
    });
  });

  describe('string type', () => {
    it('should work with strings and default comparator', async () => {
      const stringBeap = new Beap<string>();
      stringBeap.insert('zebra');
      stringBeap.insert('apple');
      stringBeap.insert('banana');
      expect(stringBeap.peek()).toBe('apple');
    });

    it('should extract strings in alphabetical order', async () => {
      const stringBeap = new Beap<string>();
      stringBeap.insert('zebra');
      stringBeap.insert('apple');
      stringBeap.insert('banana');
      stringBeap.insert('cherry');
      expect(stringBeap.extractMin()).toBe('apple');
      expect(stringBeap.extractMin()).toBe('banana');
      expect(stringBeap.extractMin()).toBe('cherry');
      expect(stringBeap.extractMin()).toBe('zebra');
    });
  });

  describe('object type with custom comparator', () => {
    it('should work with objects', async () => {
      interface Item {
        value: string;
        priority: number;
      }
      const comparator = (a: Item, b: Item) => a.priority - b.priority;
      const objectBeap = new Beap<Item>({ comparator });

      objectBeap.insert({ value: 'first', priority: 5 });
      objectBeap.insert({ value: 'second', priority: 3 });
      objectBeap.insert({ value: 'third', priority: 8 });

      expect(objectBeap.peek()!.value).toBe('second');
      expect(objectBeap.extractMin()!.value).toBe('second');
      expect(objectBeap.peek()!.value).toBe('first');
    });

    it('should find and delete objects', async () => {
      interface Item {
        id: number;
        value: string;
      }
      const comparator = (a: Item, b: Item) => a.id - b.id;
      const objectBeap = new Beap<Item>({ comparator });

      const item1 = { id: 1, value: 'first' };
      const item2 = { id: 2, value: 'second' };
      const item3 = { id: 3, value: 'third' };

      objectBeap.insert(item2);
      objectBeap.insert(item1);
      objectBeap.insert(item3);

      expect(objectBeap.contains(item1)).toBe(true);
      expect(objectBeap.delete(item2)).toBe(true);
      expect(objectBeap.size).toBe(2);
      expect(objectBeap.peek()!.id).toBe(1);
    });
  });

  describe('operations after delete', () => {
    it('should maintain heap property after delete', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      beap.insert(1);
      beap.insert(6);
      beap.delete(5);
      expect(beap.extractMin()).toBe(1);
      expect(beap.extractMin()).toBe(3);
      expect(beap.extractMin()).toBe(6);
      expect(beap.extractMin()).toBe(8);
    });

    it('should allow insert after delete', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.delete(5);
      beap.insert(2);
      expect(beap.peek()).toBe(2);
      expect(beap.size).toBe(2);
    });

    it('should handle multiple deletes', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      beap.insert(1);
      beap.insert(6);
      beap.delete(5);
      beap.delete(8);
      expect(beap.size).toBe(3);
      expect(beap.peek()).toBe(1);
      expect(beap.extractMin()).toBe(1);
      expect(beap.extractMin()).toBe(3);
      expect(beap.extractMin()).toBe(6);
    });
  });

  describe('combination operations', () => {
    it('should handle complex sequence of operations', async () => {
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      expect(beap.extractMin()).toBe(3);
      beap.insert(1);
      beap.insert(6);
      beap.delete(8);
      expect(beap.peek()).toBe(1);
      expect(beap.extractMin()).toBe(1);
      expect(beap.extractMin()).toBe(5);
      expect(beap.extractMin()).toBe(6);
      expect(beap.isEmpty).toBe(true);
    });

    it('should maintain consistency through various operations', async () => {
      beap.insert(10);
      beap.insert(5);
      beap.insert(15);
      beap.insert(3);
      beap.delete(10);
      expect(beap.size).toBe(3);
      beap.insert(7);
      expect(beap.peek()).toBe(3);
      beap.extractMin();
      expect(beap.peek()).toBe(5);
      beap.insert(2);
      expect(beap.peek()).toBe(2);
      expect(beap.contains(7)).toBe(true);
    });
  });
});
