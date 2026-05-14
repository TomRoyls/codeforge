import { describe, it, expect } from 'vitest';
import { Beap2 } from '../src/core/beap-2/index.js';

describe('Beap2', () => {
  describe('constructor', () => {
    it('should create empty beap with default comparator', async () => {
      const beap = new Beap2<number>();
      expect(beap.size).toBe(0);
      expect(beap.isEmpty()).toBe(true);
    });

    it('should create empty beap with custom comparator', async () => {
      const beap = new Beap2<number>((a, b) => b - a);
      expect(beap.size).toBe(0);
      expect(beap.isEmpty()).toBe(true);
    });
  });

  describe('insert', () => {
    it('should insert single element', async () => {
      const beap = new Beap2<number>();
      beap.insert(5);
      expect(beap.size).toBe(1);
      expect(beap.isEmpty()).toBe(false);
      expect(beap.peek()).toBe(5);
    });

    it('should maintain min after multiple inserts', async () => {
      const beap = new Beap2<number>();
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      beap.insert(1);
      beap.insert(6);
      expect(beap.peek()).toBe(1);
    });

    it('should handle duplicate values', async () => {
      const beap = new Beap2<number>();
      beap.insert(5);
      beap.insert(5);
      beap.insert(5);
      expect(beap.size).toBe(3);
      expect(beap.peek()).toBe(5);
    });

    it('should insert in descending order', async () => {
      const beap = new Beap2<number>();
      beap.insert(5);
      beap.insert(4);
      beap.insert(3);
      beap.insert(2);
      beap.insert(1);
      expect(beap.peek()).toBe(1);
    });

    it('should insert in ascending order', async () => {
      const beap = new Beap2<number>();
      beap.insert(1);
      beap.insert(2);
      beap.insert(3);
      beap.insert(4);
      beap.insert(5);
      expect(beap.peek()).toBe(1);
    });

    it('should insert with custom comparator (max-heap)', async () => {
      const beap = new Beap2<number>((a, b) => b - a);
      beap.insert(1);
      beap.insert(5);
      beap.insert(3);
      expect(beap.peek()).toBe(5);
    });
  });

  describe('extractMin', () => {
    it('should return undefined from empty beap', async () => {
      const beap = new Beap2<number>();
      expect(beap.extractMin()).toBe(undefined);
    });

    it('should extract single element', async () => {
      const beap = new Beap2<number>();
      beap.insert(5);
      const extracted = beap.extractMin();
      expect(extracted).toBe(5);
      expect(beap.size).toBe(0);
      expect(beap.isEmpty()).toBe(true);
    });

    it('should extract in correct order', async () => {
      const beap = new Beap2<number>();
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
      const beap = new Beap2<number>();
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      beap.insert(1);
      beap.extractMin();
      expect(beap.peek()).toBe(3);
      beap.extractMin();
      expect(beap.peek()).toBe(5);
    });

    it('should handle sequential extract after sequential insert', async () => {
      const beap = new Beap2<number>();
      beap.insert(1);
      beap.insert(2);
      beap.insert(3);
      expect(beap.extractMin()).toBe(1);
      expect(beap.extractMin()).toBe(2);
      expect(beap.extractMin()).toBe(3);
      expect(beap.extractMin()).toBe(undefined);
    });

    it('should handle mixed insert and extract', async () => {
      const beap = new Beap2<number>();
      beap.insert(5);
      beap.insert(3);
      beap.extractMin();
      beap.insert(2);
      beap.insert(4);
      expect(beap.extractMin()).toBe(2);
      expect(beap.extractMin()).toBe(4);
      expect(beap.extractMin()).toBe(5);
    });
  });

  describe('peek', () => {
    it('should return undefined from empty beap', async () => {
      const beap = new Beap2<number>();
      expect(beap.peek()).toBe(undefined);
    });

    it('should return minimum without removing', async () => {
      const beap = new Beap2<number>();
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      expect(beap.peek()).toBe(3);
      expect(beap.size).toBe(3);
    });

    it('should return correct minimum after multiple operations', async () => {
      const beap = new Beap2<number>();
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      beap.insert(1);
      expect(beap.peek()).toBe(1);
      beap.extractMin();
      expect(beap.peek()).toBe(3);
    });
  });

  describe('has', () => {
    it('should return false for empty beap', async () => {
      const beap = new Beap2<number>();
      expect(beap.has(5)).toBe(false);
    });

    it('should return true for existing element', async () => {
      const beap = new Beap2<number>();
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      expect(beap.has(5)).toBe(true);
    });

    it('should return false for non-existing element', async () => {
      const beap = new Beap2<number>();
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      expect(beap.has(7)).toBe(false);
    });

    it('should handle duplicate values', async () => {
      const beap = new Beap2<number>();
      beap.insert(5);
      beap.insert(5);
      expect(beap.has(5)).toBe(true);
    });

    it('should return true after extraction for other elements', async () => {
      const beap = new Beap2<number>();
      beap.insert(5);
      beap.insert(3);
      beap.insert(8);
      beap.extractMin();
      expect(beap.has(5)).toBe(true);
      expect(beap.has(3)).toBe(false);
    });
  });

  describe('size', () => {
    it('should return 0 for empty beap', async () => {
      const beap = new Beap2<number>();
      expect(beap.size).toBe(0);
    });

    it('should increment after insert', async () => {
      const beap = new Beap2<number>();
      beap.insert(1);
      expect(beap.size).toBe(1);
      beap.insert(2);
      expect(beap.size).toBe(2);
      beap.insert(3);
      expect(beap.size).toBe(3);
    });

    it('should decrement after extract', async () => {
      const beap = new Beap2<number>();
      beap.insert(1);
      beap.insert(2);
      beap.insert(3);
      beap.extractMin();
      expect(beap.size).toBe(2);
      beap.extractMin();
      expect(beap.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty beap', async () => {
      const beap = new Beap2<number>();
      expect(beap.isEmpty()).toBe(true);
    });

    it('should return false after insert', async () => {
      const beap = new Beap2<number>();
      beap.insert(1);
      expect(beap.isEmpty()).toBe(false);
    });

    it('should return true after extracting all elements', async () => {
      const beap = new Beap2<number>();
      beap.insert(1);
      beap.insert(2);
      beap.extractMin();
      beap.extractMin();
      expect(beap.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all elements', async () => {
      const beap = new Beap2<number>();
      beap.insert(1);
      beap.insert(2);
      beap.insert(3);
      beap.clear();
      expect(beap.size).toBe(0);
      expect(beap.isEmpty()).toBe(true);
    });

    it('should handle clear on empty beap', async () => {
      const beap = new Beap2<number>();
      beap.clear();
      expect(beap.size).toBe(0);
      expect(beap.isEmpty()).toBe(true);
    });

    it('should allow operations after clear', async () => {
      const beap = new Beap2<number>();
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
      const beap = new Beap2<number>();
      expect(beap.toArray()).toEqual([]);
    });

    it('should return all elements', async () => {
      const beap = new Beap2<number>();
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
      const beap = new Beap2<number>();
      beap.insert(1);
      beap.insert(2);
      const arr = beap.toArray();
      arr.push(999);
      expect(beap.size).toBe(2);
      expect(beap.toArray().length).toBe(2);
    });

    it('should not modify beap when array is modified', async () => {
      const beap = new Beap2<number>();
      beap.insert(1);
      beap.insert(2);
      const arr = beap.toArray();
      arr[0] = 999;
      expect(beap.peek()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle single element operations', async () => {
      const beap = new Beap2<number>();
      beap.insert(42);
      expect(beap.peek()).toBe(42);
      expect(beap.has(42)).toBe(true);
      expect(beap.extractMin()).toBe(42);
      expect(beap.isEmpty()).toBe(true);
    });

    it('should handle negative numbers', async () => {
      const beap = new Beap2<number>();
      beap.insert(-5);
      beap.insert(-3);
      beap.insert(-8);
      expect(beap.peek()).toBe(-8);
      expect(beap.extractMin()).toBe(-8);
    });

    it('should handle zero', async () => {
      const beap = new Beap2<number>();
      beap.insert(0);
      beap.insert(-1);
      beap.insert(1);
      expect(beap.peek()).toBe(-1);
    });

    it('should handle large numbers', async () => {
      const beap = new Beap2<number>();
      beap.insert(Number.MAX_SAFE_INTEGER);
      beap.insert(Number.MIN_SAFE_INTEGER);
      beap.insert(0);
      expect(beap.peek()).toBe(Number.MIN_SAFE_INTEGER);
    });
  });

  describe('large datasets', () => {
    it.skip('should handle 1000 elements', async () => {
      const beap = new Beap2<number>();
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        values.push(Math.floor(Math.random() * 10000));
      }
      values.forEach(v => beap.insert(v));
      expect(beap.size).toBe(1000);

      const sorted = [...values].sort((a, b) => a - b);
      for (let i = 0; i < 1000; i++) {
        expect(beap.extractMin()).toBe(sorted[i]);
      }
      expect(beap.isEmpty()).toBe(true);
    });

    it('should handle sorted insert and extract', async () => {
      const beap = new Beap2<number>();
      for (let i = 0; i < 500; i++) {
        beap.insert(i);
      }
      for (let i = 0; i < 500; i++) {
        expect(beap.extractMin()).toBe(i);
      }
    });

    it('should handle reverse sorted insert', async () => {
      const beap = new Beap2<number>();
      for (let i = 500; i >= 0; i--) {
        beap.insert(i);
      }
      for (let i = 0; i <= 500; i++) {
        expect(beap.extractMin()).toBe(i);
      }
    });
  });

  describe('sequential extract', () => {
    it('should maintain order throughout sequential extracts', async () => {
      const beap = new Beap2<number>();
      const values = [5, 3, 8, 1, 6, 4, 7, 2];
      values.forEach(v => beap.insert(v));

      const extracted: number[] = [];
      while (!beap.isEmpty()) {
        extracted.push(beap.extractMin()!);
      }

      expect(extracted).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('should handle interleave insert and extract', async () => {
      const beap = new Beap2<number>();
      beap.insert(5);
      beap.insert(3);
      expect(beap.extractMin()).toBe(3);
      beap.insert(2);
      expect(beap.extractMin()).toBe(2);
      beap.insert(4);
      expect(beap.extractMin()).toBe(4);
      expect(beap.extractMin()).toBe(5);
    });
  });

  describe('string type', () => {
    it('should work with strings and default comparator', async () => {
      const beap = new Beap2<string>();
      beap.insert('zebra');
      beap.insert('apple');
      beap.insert('banana');
      expect(beap.peek()).toBe('apple');
    });

    it('should extract strings in alphabetical order', async () => {
      const beap = new Beap2<string>();
      beap.insert('zebra');
      beap.insert('apple');
      beap.insert('banana');
      beap.insert('cherry');
      expect(beap.extractMin()).toBe('apple');
      expect(beap.extractMin()).toBe('banana');
      expect(beap.extractMin()).toBe('cherry');
      expect(beap.extractMin()).toBe('zebra');
    });
  });

  describe('object type with custom comparator', () => {
    it('should work with objects', async () => {
      interface Item {
        value: string;
        priority: number;
      }
      const comparator = (a: Item, b: Item) => a.priority - b.priority;
      const beap = new Beap2<Item>(comparator);

      beap.insert({ value: 'first', priority: 5 });
      beap.insert({ value: 'second', priority: 3 });
      beap.insert({ value: 'third', priority: 8 });

      expect(beap.peek()!.value).toBe('second');
      expect(beap.extractMin()!.value).toBe('second');
      expect(beap.peek()!.value).toBe('first');
    });
  });
});
