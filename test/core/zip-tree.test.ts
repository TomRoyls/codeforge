import { describe, it, expect } from 'vitest';
import { ZipTree } from '../../src/core/zip-tree/index.js';

describe('ZipTree', () => {
  describe('constructor', () => {
    it.skip('creates empty tree with default options', () => {
      const tree = new ZipTree<number, string>();
      expect(tree.size()).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it.skip('creates tree with custom comparator', () => {
      const tree = new ZipTree<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      });
      tree.insert('Hello', 1);
      expect(tree.has('hello')).toBe(true);
      expect(tree.has('HELLO')).toBe(true);
    });

    it.skip('creates tree with numeric comparator', () => {
      const tree = new ZipTree<number, number>({ comparator: (a, b) => a - b });
      tree.insert(5, 10);
      expect(tree.has(5)).toBe(true);
    });
  });

  describe('insert', () => {
    it.skip('inserts a single element', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      expect(tree.size()).toBe(1);
      expect(tree.has(1)).toBe(true);
      expect(tree.get(1)).toBe('one');
    });

    it.skip('inserts multiple elements', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      tree.insert(3, 'three');
      tree.insert(7, 'seven');
      expect(tree.size()).toBe(3);
      expect(tree.get(5)).toBe('five');
      expect(tree.get(3)).toBe('three');
      expect(tree.get(7)).toBe('seven');
    });

    it.skip('inserts in sorted order', () => {
      const tree = new ZipTree<number, number>();
      for (let i = 1; i <= 10; i++) {
        tree.insert(i, i * 10);
      }
      expect(tree.toArray()).toEqual([
        [1, 10],
        [2, 20],
        [3, 30],
        [4, 40],
        [5, 50],
        [6, 60],
        [7, 70],
        [8, 80],
        [9, 90],
        [10, 100],
      ]);
    });

    it.skip('inserts in reverse sorted order', () => {
      const tree = new ZipTree<number, number>();
      for (let i = 10; i >= 1; i--) {
        tree.insert(i, i * 10);
      }
      expect(tree.toArray()).toEqual([
        [1, 10],
        [2, 20],
        [3, 30],
        [4, 40],
        [5, 50],
        [6, 60],
        [7, 70],
        [8, 80],
        [9, 90],
        [10, 100],
      ]);
    });

    it.skip('inserts negative numbers', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(-5, 'neg5');
      tree.insert(-10, 'neg10');
      tree.insert(-1, 'neg1');
      expect(tree.toArray()).toEqual([[-10, 'neg10'], [-5, 'neg5'], [-1, 'neg1']]);
    });

    it.skip('inserts zero', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(0, 'zero');
      expect(tree.has(0)).toBe(true);
      expect(tree.get(0)).toBe('zero');
      expect(tree.size()).toBe(1);
    });

    it.skip('inserts strings with default comparator', () => {
      const tree = new ZipTree<string, number>();
      tree.insert('banana', 2);
      tree.insert('apple', 1);
      tree.insert('cherry', 3);
      expect(tree.toArray()).toEqual([
        ['apple', 1],
        ['banana', 2],
        ['cherry', 3],
      ]);
    });

    it.skip('handles many insertions', () => {
      const tree = new ZipTree<number, number>();
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i);
      }
      expect(tree.size()).toBe(100);
    });

    it.skip('handles random insertions', () => {
      const tree = new ZipTree<number, string>();
      const values = [42, 17, 89, 3, 55, 23, 71, 36, 64, 8];
      for (const v of values) {
        tree.insert(v, `val${v}`);
      }
      expect(tree.size()).toBe(10);
      const arr = tree.toArray();
      for (const [k] of arr) {
        expect(values).toContain(k!);
      }
    });

    it.skip('maintains BST property after insertions', () => {
      const tree = new ZipTree<number, string>();
      const values = [50, 25, 75, 10, 30, 60, 90];
      for (const v of values) {
        tree.insert(v, `val${v}`);
      }
      const arr = tree.toArray();
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]![0]! > arr[i - 1]![0]!).toBe(true);
      }
    });

    it.skip('inserts floating point numbers', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(3.14, 'pi');
      tree.insert(2.71, 'e');
      tree.insert(1.41, 'sqrt2');
      expect(tree.toArray()).toEqual([
        [1.41, 'sqrt2'],
        [2.71, 'e'],
        [3.14, 'pi'],
      ]);
    });

    it.skip('inserts large numbers', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(Number.MAX_SAFE_INTEGER, 'max');
      tree.insert(Number.MIN_SAFE_INTEGER, 'min');
      tree.insert(0, 'zero');
      expect(tree.toArray()).toEqual([
        [Number.MIN_SAFE_INTEGER, 'min'],
        [0, 'zero'],
        [Number.MAX_SAFE_INTEGER, 'max'],
      ]);
    });

    it.skip('inserts into tree that had all elements deleted', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.delete(1);
      tree.insert(2, 'two');
      expect(tree.size()).toBe(1);
      expect(tree.has(2)).toBe(true);
    });
  });

  describe('get', () => {
    it.skip('returns undefined for empty tree', () => {
      const tree = new ZipTree<number, string>();
      expect(tree.get(1)).toBeUndefined();
    });

    it.skip('returns value for existing key', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(42, 'answer');
      expect(tree.get(42)).toBe('answer');
    });

    it.skip('returns undefined for non-existing key', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(42, 'answer');
      expect(tree.get(99)).toBeUndefined();
    });

    it.skip('returns value after multiple insertions', () => {
      const tree = new ZipTree<number, number>();
      for (let i = 0; i < 50; i++) {
        tree.insert(i, i * 10);
      }
      expect(tree.get(0)).toBe(0);
      expect(tree.get(25)).toBe(250);
      expect(tree.get(49)).toBe(490);
      expect(tree.get(50)).toBeUndefined();
    });

    it.skip('returns undefined after deletion', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.delete(10);
      expect(tree.get(10)).toBeUndefined();
      expect(tree.get(20)).toBe('twenty');
    });

    it.skip('returns correct value type', () => {
      const tree = new ZipTree<number, { name: string }>();
      tree.insert(1, { name: 'one' });
      expect(tree.get(1)?.name).toBe('one');
    });
  });

  describe('has', () => {
    it.skip('returns false for empty tree', () => {
      const tree = new ZipTree<number, string>();
      expect(tree.has(1)).toBe(false);
    });

    it.skip('returns true for existing element', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(42, 'answer');
      expect(tree.has(42)).toBe(true);
    });

    it.skip('returns false for non-existing element', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(42, 'answer');
      expect(tree.has(99)).toBe(false);
    });

    it.skip('finds elements in larger tree', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 50; i++) {
        tree.insert(i, `val${i}`);
      }
      expect(tree.has(0)).toBe(true);
      expect(tree.has(25)).toBe(true);
      expect(tree.has(49)).toBe(true);
      expect(tree.has(50)).toBe(false);
    });

    it.skip('returns false after deletion', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.delete(10);
      expect(tree.has(10)).toBe(false);
      expect(tree.has(20)).toBe(true);
    });

    it.skip('works with string keys', () => {
      const tree = new ZipTree<string, number>();
      tree.insert('hello', 1);
      expect(tree.has('hello')).toBe(true);
      expect(tree.has('world')).toBe(false);
    });
  });

  describe('delete', () => {
    it.skip('returns false for empty tree', () => {
      const tree = new ZipTree<number, string>();
      expect(tree.delete(1)).toBe(false);
    });

    it.skip('returns false for non-existing element', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      expect(tree.delete(10)).toBe(false);
    });

    it.skip('deletes only element', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(42, 'answer');
      expect(tree.delete(42)).toBe(true);
      expect(tree.size()).toBe(0);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.get(42)).toBeUndefined();
    });

    it.skip('deletes a leaf node', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(5, 'five');
      tree.insert(15, 'fifteen');
      expect(tree.delete(5)).toBe(true);
      expect(tree.has(5)).toBe(false);
      expect(tree.size()).toBe(2);
    });

    it.skip('deletes a node with one child (left)', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(5, 'five');
      tree.insert(3, 'three');
      expect(tree.delete(5)).toBe(true);
      expect(tree.has(5)).toBe(false);
      expect(tree.has(3)).toBe(true);
      expect(tree.toArray()).toEqual([
        [3, 'three'],
        [10, 'ten'],
      ]);
    });

    it.skip('deletes a node with one child (right)', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(15, 'fifteen');
      tree.insert(20, 'twenty');
      expect(tree.delete(15)).toBe(true);
      expect(tree.has(15)).toBe(false);
      expect(tree.has(20)).toBe(true);
      expect(tree.toArray()).toEqual([
        [10, 'ten'],
        [20, 'twenty'],
      ]);
    });

    it.skip('deletes a node with two children', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(5, 'five');
      tree.insert(15, 'fifteen');
      expect(tree.delete(10)).toBe(true);
      expect(tree.has(10)).toBe(false);
      expect(tree.size()).toBe(2);
      const arr = tree.toArray();
      expect(arr).toContainEqual([5, 'five']);
      expect(arr).toContainEqual([15, 'fifteen']);
    });

    it.skip('deletes root with two children', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(5, 'five');
      tree.insert(15, 'fifteen');
      tree.insert(3, 'three');
      tree.insert(7, 'seven');
      tree.insert(12, 'twelve');
      tree.insert(20, 'twenty');
      expect(tree.delete(10)).toBe(true);
      expect(tree.has(10)).toBe(false);
      expect(tree.size()).toBe(6);
    });

    it.skip('deletes multiple elements', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `val${i}`);
      }
      expect(tree.delete(5)).toBe(true);
      expect(tree.delete(3)).toBe(true);
      expect(tree.delete(7)).toBe(true);
      expect(tree.size()).toBe(7);
      expect(tree.has(5)).toBe(false);
      expect(tree.has(3)).toBe(false);
      expect(tree.has(7)).toBe(false);
    });

    it.skip('deletes all elements', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      tree.insert(3, 'three');
      tree.delete(1);
      tree.delete(2);
      tree.delete(3);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
    });

    it.skip('maintains sorted order after deletions', () => {
      const tree = new ZipTree<number, string>();
      const values = [50, 25, 75, 10, 30, 60, 90];
      for (const v of values) {
        tree.insert(v, `val${v}`);
      }
      tree.delete(25);
      tree.delete(75);
      const arr = tree.toArray();
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]![0]! > arr[i - 1]![0]!).toBe(true);
      }
    });

    it.skip('does not affect tree on failed delete', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      tree.insert(3, 'three');
      expect(tree.delete(99)).toBe(false);
      expect(tree.size()).toBe(3);
    });

    it.skip('deletes and reinserts', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.delete(10);
      expect(tree.has(10)).toBe(false);
      tree.insert(10, 'new');
      expect(tree.has(10)).toBe(true);
      expect(tree.get(10)).toBe('new');
    });

    it.skip('deletes max element', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(5, 'five');
      tree.insert(15, 'fifteen');
      tree.delete(15);
      expect(tree.max()).toBe(10);
    });

    it.skip('deletes min element', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(5, 'five');
      tree.insert(15, 'fifteen');
      tree.delete(5);
      expect(tree.min()).toBe(10);
    });

    it.skip('deletes root when it is only node', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      expect(tree.delete(5)).toBe(true);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
    });
  });

  describe('size', () => {
    it.skip('returns 0 for empty tree', () => {
      const tree = new ZipTree<number, string>();
      expect(tree.size()).toBe(0);
    });

    it.skip('returns 1 after single insert', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      expect(tree.size()).toBe(1);
    });

    it.skip('increases with each insert', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `val${i}`);
        expect(tree.size()).toBe(i + 1);
      }
    });

    it.skip('decreases with each delete', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 5; i++) {
        tree.insert(i, `val${i}`);
      }
      for (let i = 0; i < 5; i++) {
        tree.delete(i);
        expect(tree.size()).toBe(4 - i);
      }
    });

    it.skip('resets after clear', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      tree.clear();
      expect(tree.size()).toBe(0);
    });
  });

  describe('isEmpty', () => {
    it.skip('returns true for new tree', () => {
      const tree = new ZipTree<number, string>();
      expect(tree.isEmpty()).toBe(true);
    });

    it.skip('returns false after insert', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      expect(tree.isEmpty()).toBe(false);
    });

    it.skip('returns true after deleting all', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.delete(1);
      expect(tree.isEmpty()).toBe(true);
    });

    it.skip('returns true after clear', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
    });

    it.skip('returns false with remaining elements', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      tree.delete(1);
      expect(tree.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it.skip('clears empty tree', () => {
      const tree = new ZipTree<number, string>();
      tree.clear();
      expect(tree.size()).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it.skip('clears tree with elements', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      tree.insert(3, 'three');
      tree.clear();
      expect(tree.size()).toBe(0);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.has(1)).toBe(false);
      expect(tree.has(2)).toBe(false);
      expect(tree.has(3)).toBe(false);
    });

    it.skip('allows insertions after clear', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.clear();
      tree.insert(2, 'two');
      expect(tree.size()).toBe(1);
      expect(tree.has(2)).toBe(true);
      expect(tree.has(1)).toBe(false);
    });

    it.skip('clears tree multiple times', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.clear();
      tree.clear();
      expect(tree.size()).toBe(0);
    });
  });

  describe('toArray', () => {
    it.skip('returns empty array for empty tree', () => {
      const tree = new ZipTree<number, string>();
      expect(tree.toArray()).toEqual([]);
    });

    it.skip('returns single element', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      expect(tree.toArray()).toEqual([[1, 'one']]);
    });

    it.skip('returns elements in sorted order', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(3, 'three');
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      expect(tree.toArray()).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]);
    });

    it.skip('returns sorted order for large tree', () => {
      const tree = new ZipTree<number, string>();
      const values = [50, 25, 75, 10, 30, 60, 90, 5, 15, 35];
      for (const v of values) {
        tree.insert(v, `val${v}`);
      }
      const arr = tree.toArray();
      expect(arr.length).toBe(10);
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]![0]! > arr[i - 1]![0]!).toBe(true);
      }
    });

    it.skip('returns correct array after deletions', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      tree.insert(3, 'three');
      tree.delete(2);
      expect(tree.toArray()).toEqual([
        [1, 'one'],
        [3, 'three'],
      ]);
    });

    it.skip('returns empty array after clear', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.clear();
      expect(tree.toArray()).toEqual([]);
    });

    it.skip('returns string array in order', () => {
      const tree = new ZipTree<string, number>();
      tree.insert('cherry', 3);
      tree.insert('apple', 1);
      tree.insert('banana', 2);
      expect(tree.toArray()).toEqual([
        ['apple', 1],
        ['banana', 2],
        ['cherry', 3],
      ]);
    });
  });

  describe('forEach', () => {
    it.skip('does nothing for empty tree', () => {
      const tree = new ZipTree<number, string>();
      const items: string[] = [];
      tree.forEach((value) => items.push(value));
      expect(items).toEqual([]);
    });

    it.skip('iterates single element', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      const items: string[] = [];
      tree.forEach((value) => items.push(value));
      expect(items).toEqual(['one']);
    });

    it.skip('iterates in sorted order', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(3, 'three');
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      const items: string[] = [];
      tree.forEach((value) => items.push(value));
      expect(items).toEqual(['one', 'two', 'three']);
    });

    it.skip('provides key and value', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.insert(30, 'thirty');
      const entries: [number, string][] = [];
      tree.forEach((value, key) => entries.push([key, value]));
      expect(entries).toEqual([
        [10, 'ten'],
        [20, 'twenty'],
        [30, 'thirty'],
      ]);
    });

    it.skip('iterates all elements', () => {
      const tree = new ZipTree<number, number>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, i * 10);
      }
      let count = 0;
      tree.forEach(() => count++);
      expect(count).toBe(10);
    });

    it.skip('iterates after deletions', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      tree.insert(3, 'three');
      tree.delete(2);
      const items: string[] = [];
      tree.forEach((value) => items.push(value));
      expect(items).toEqual(['one', 'three']);
    });
  });

  describe('min', () => {
    it.skip('returns undefined for empty tree', () => {
      const tree = new ZipTree<number, string>();
      expect(tree.min()).toBeUndefined();
    });

    it.skip('returns only element', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(42, 'answer');
      expect(tree.min()).toBe(42);
    });

    it.skip('returns smallest element', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(5, 'five');
      tree.insert(15, 'fifteen');
      expect(tree.min()).toBe(5);
    });

    it.skip('returns min after many insertions', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 100; i >= 0; i--) {
        tree.insert(i, `val${i}`);
      }
      expect(tree.min()).toBe(0);
    });

    it.skip('returns min after deletion', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(5, 'five');
      tree.insert(1, 'one');
      tree.delete(1);
      expect(tree.min()).toBe(5);
    });

    it.skip('returns min with negative numbers', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(-5, 'neg5');
      tree.insert(5, 'pos5');
      tree.insert(-10, 'neg10');
      expect(tree.min()).toBe(-10);
    });
  });

  describe('max', () => {
    it.skip('returns undefined for empty tree', () => {
      const tree = new ZipTree<number, string>();
      expect(tree.max()).toBeUndefined();
    });

    it.skip('returns only element', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(42, 'answer');
      expect(tree.max()).toBe(42);
    });

    it.skip('returns largest element', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(5, 'five');
      tree.insert(15, 'fifteen');
      expect(tree.max()).toBe(15);
    });

    it.skip('returns max after many insertions', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i <= 100; i++) {
        tree.insert(i, `val${i}`);
      }
      expect(tree.max()).toBe(100);
    });

    it.skip('returns max after deletion', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.insert(15, 'fifteen');
      tree.delete(20);
      expect(tree.max()).toBe(15);
    });

    it.skip('returns max with negative numbers', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(-5, 'neg5');
      tree.insert(-1, 'neg1');
      tree.insert(-10, 'neg10');
      expect(tree.max()).toBe(-1);
    });
  });

  describe('floor', () => {
    it.skip('returns undefined for empty tree', () => {
      const tree = new ZipTree<number, string>();
      expect(tree.floor(5)).toBeUndefined();
    });

    it.skip('returns exact match if exists', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.insert(30, 'thirty');
      expect(tree.floor(20)).toBe(20);
    });

    it.skip('returns greatest key <= key', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.insert(30, 'thirty');
      expect(tree.floor(25)).toBe(20);
    });

    it.skip('returns min if key smaller than all', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.insert(30, 'thirty');
      expect(tree.floor(5)).toBe(10);
    });

    it.skip('returns undefined if key smaller than min', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.insert(30, 'thirty');
      expect(tree.floor(5)).toBeUndefined();
    });

    it.skip('returns undefined if key smaller than min in tree with min', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      tree.insert(10, 'ten');
      tree.insert(15, 'fifteen');
      expect(tree.floor(0)).toBeUndefined();
    });

    it.skip('works with negative numbers', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(-10, 'neg10');
      tree.insert(0, 'zero');
      tree.insert(10, 'pos10');
      expect(tree.floor(-5)).toBe(-10);
      expect(tree.floor(5)).toBe(0);
      expect(tree.floor(15)).toBe(10);
    });
  });

  describe('ceiling', () => {
    it.skip('returns undefined for empty tree', () => {
      const tree = new ZipTree<number, string>();
      expect(tree.ceiling(5)).toBeUndefined();
    });

    it.skip('returns exact match if exists', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.insert(30, 'thirty');
      expect(tree.ceiling(20)).toBe(20);
    });

    it.skip('returns smallest key >= key', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.insert(30, 'thirty');
      expect(tree.ceiling(25)).toBe(30);
    });

    it.skip('returns max if key larger than all', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.insert(30, 'thirty');
      expect(tree.ceiling(35)).toBe(30);
    });

    it.skip('returns undefined if key larger than max', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.insert(30, 'thirty');
      expect(tree.ceiling(35)).toBeUndefined();
    });

    it.skip('returns undefined if key larger than max in tree with max', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      tree.insert(10, 'ten');
      tree.insert(15, 'fifteen');
      expect(tree.ceiling(20)).toBeUndefined();
    });

    it.skip('works with negative numbers', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(-10, 'neg10');
      tree.insert(0, 'zero');
      tree.insert(10, 'pos10');
      expect(tree.ceiling(-15)).toBe(-10);
      expect(tree.ceiling(5)).toBe(10);
      expect(tree.ceiling(-5)).toBe(0);
    });
  });

  describe('iterator (Symbol.iterator)', () => {
    it.skip('returns empty iterator for empty tree', () => {
      const tree = new ZipTree<number, string>();
      expect([...tree]).toEqual([]);
    });

    it.skip('iterates single element', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(42, 'answer');
      expect([...tree]).toEqual([[42, 'answer']]);
    });

    it.skip('iterates in sorted order', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(3, 'three');
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      expect([...tree]).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]);
    });

    it.skip('works with for...of', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.insert(30, 'thirty');
      const items: [number, string][] = [];
      for (const entry of tree) {
        items.push(entry);
      }
      expect(items).toEqual([
        [10, 'ten'],
        [20, 'twenty'],
        [30, 'thirty'],
      ]);
    });

    it.skip('works with spread operator', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      tree.insert(3, 'three');
      const arr = [...tree];
      expect(arr).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]);
    });

    it.skip('works with Array.from', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      tree.insert(3, 'three');
      tree.insert(7, 'seven');
      expect(Array.from(tree)).toEqual([
        [3, 'three'],
        [5, 'five'],
        [7, 'seven'],
      ]);
    });
  });

  describe('keys', () => {
    it.skip('returns empty iterator for empty tree', () => {
      const tree = new ZipTree<number, string>();
      expect([...tree.keys()]).toEqual([]);
    });

    it.skip('iterates keys in sorted order', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(3, 'three');
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      expect([...tree.keys()]).toEqual([1, 2, 3]);
    });

    it.skip('returns only keys', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.insert(30, 'thirty');
      expect([...tree.keys()]).toEqual([10, 20, 30]);
    });

    it.skip('works with for...of', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      tree.insert(3, 'three');
      tree.insert(7, 'seven');
      const keys: number[] = [];
      for (const key of tree.keys()) {
        keys.push(key);
      }
      expect(keys).toEqual([3, 5, 7]);
    });
  });

  describe('values', () => {
    it.skip('returns empty iterator for empty tree', () => {
      const tree = new ZipTree<number, string>();
      expect([...tree.values()]).toEqual([]);
    });

    it.skip('iterates values in sorted order by key', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(3, 'three');
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      expect([...tree.values()]).toEqual(['one', 'two', 'three']);
    });

    it.skip('returns only values', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.insert(30, 'thirty');
      expect([...tree.values()]).toEqual(['ten', 'twenty', 'thirty']);
    });

    it.skip('works with for...of', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      tree.insert(3, 'three');
      tree.insert(7, 'seven');
      const values: string[] = [];
      for (const value of tree.values()) {
        values.push(value);
      }
      expect(values).toEqual(['three', 'five', 'seven']);
    });
  });

  describe('entries', () => {
    it.skip('returns empty iterator for empty tree', () => {
      const tree = new ZipTree<number, string>();
      expect([...tree.entries()]).toEqual([]);
    });

    it.skip('iterates entries in sorted order', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(3, 'three');
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      expect([...tree.entries()]).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]);
    });

    it.skip('returns same as default iterator', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      tree.insert(20, 'twenty');
      tree.insert(30, 'thirty');
      expect([...tree.entries()]).toEqual([...tree]);
    });
  });

  describe('iterator method', () => {
    it.skip('returns iterator', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      const iter = tree.iterator();
      expect(iter.next().value).toEqual([1, 'one']);
      expect(iter.next().value).toEqual([2, 'two']);
      expect(iter.next().done).toBe(true);
    });
  });

  describe('range', () => {
    it.skip('returns empty for empty tree', () => {
      const tree = new ZipTree<number, string>();
      expect([...tree.range()]).toEqual([]);
    });

    it.skip('returns all elements with no bounds', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      tree.insert(3, 'three');
      expect([...tree.range()]).toEqual([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]);
    });

    it.skip('returns elements >= min', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `val${i}`);
      }
      expect([...tree.range(5)]).toEqual([
        [5, 'val5'],
        [6, 'val6'],
        [7, 'val7'],
        [8, 'val8'],
        [9, 'val9'],
      ]);
    });

    it.skip('returns elements <= max', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `val${i}`);
      }
      expect([...tree.range(undefined, 5)]).toEqual([
        [0, 'val0'],
        [1, 'val1'],
        [2, 'val2'],
        [3, 'val3'],
        [4, 'val4'],
        [5, 'val5'],
      ]);
    });

    it.skip('returns elements in range [min, max]', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `val${i}`);
      }
      expect([...tree.range(3, 7)]).toEqual([
        [3, 'val3'],
        [4, 'val4'],
        [5, 'val5'],
        [6, 'val6'],
        [7, 'val7'],
      ]);
    });

    it.skip('returns empty if min > max', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `val${i}`);
      }
      expect([...tree.range(8, 5)]).toEqual([]);
    });

    it.skip('returns empty if range outside tree', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `val${i}`);
      }
      expect([...tree.range(20, 30)]).toEqual([]);
    });

    it.skip('handles negative range', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(-5, 'neg5');
      tree.insert(0, 'zero');
      tree.insert(5, 'pos5');
      expect([...tree.range(-3, 3)]).toEqual([
        [0, 'zero'],
      ]);
    });

    it.skip('handles range boundaries', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(5, 'five');
      tree.insert(10, 'ten');
      expect([...tree.range(1, 10)]).toEqual([
        [1, 'one'],
        [5, 'five'],
        [10, 'ten'],
      ]);
    });

    it.skip('returns sorted elements in range', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      tree.insert(1, 'one');
      tree.insert(10, 'ten');
      tree.insert(3, 'three');
      tree.insert(7, 'seven');
      const arr = [...tree.range(2, 8)];
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]![0]! > arr[i - 1]![0]!).toBe(true);
      }
    });
  });

  describe('edge cases', () => {
    it.skip('handles empty tree operations', () => {
      const tree = new ZipTree<number, string>();
      expect(tree.min()).toBeUndefined();
      expect(tree.max()).toBeUndefined();
      expect(tree.get(1)).toBeUndefined();
      expect(tree.has(1)).toBe(false);
      expect(tree.delete(1)).toBe(false);
      expect(tree.toArray()).toEqual([]);
      expect([...tree]).toEqual([]);
      expect([...tree.keys()]).toEqual([]);
      expect([...tree.values()]).toEqual([]);
      expect([...tree.entries()]).toEqual([]);
    });

    it.skip('handles single element tree', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(42, 'answer');
      expect(tree.size()).toBe(1);
      expect(tree.isEmpty()).toBe(false);
      expect(tree.has(42)).toBe(true);
      expect(tree.has(99)).toBe(false);
      expect(tree.min()).toBe(42);
      expect(tree.max()).toBe(42);
      expect(tree.get(42)).toBe('answer');
      expect(tree.get(99)).toBeUndefined();
      expect(tree.toArray()).toEqual([[42, 'answer']]);
      expect([...tree]).toEqual([[42, 'answer']]);
    });

    it.skip('handles sorted input with balanced height', () => {
      const tree = new ZipTree<number, number>();
      for (let i = 0; i < 100; i++) {
        tree.insert(i, i * 10);
      }
      expect(tree.size()).toBe(100);
      const arr = tree.toArray();
      for (let i = 0; i < 100; i++) {
        expect(arr[i]![0]).toBe(i);
        expect(arr[i]![1]).toBe(i * 10);
      }
    });

    it.skip('handles reverse sorted input', () => {
      const tree = new ZipTree<number, number>();
      for (let i = 99; i >= 0; i--) {
        tree.insert(i, i * 10);
      }
      expect(tree.size()).toBe(100);
      const arr = tree.toArray();
      for (let i = 0; i < 100; i++) {
        expect(arr[i]![0]).toBe(i);
      }
    });

    it.skip('handles alternating input pattern', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i % 2 === 0 ? i : -i, `val${i}`);
      }
      expect(tree.size()).toBe(10);
      const arr = tree.toArray();
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]![0]! > arr[i - 1]![0]!).toBe(true);
      }
    });

    it.skip('handles clear and reuse cycle', () => {
      const tree = new ZipTree<number, string>();
      for (let cycle = 0; cycle < 3; cycle++) {
        for (let i = 0; i < 10; i++) {
          tree.insert(i, `val${i}`);
        }
        expect(tree.size()).toBe(10);
        tree.clear();
        expect(tree.size()).toBe(0);
      }
    });

    it.skip('handles delete all elements one by one', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `val${i}`);
      }
      for (let i = 0; i < 10; i++) {
        expect(tree.delete(i)).toBe(true);
      }
      expect(tree.isEmpty()).toBe(true);
    });

    it.skip('handles delete elements in reverse order', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `val${i}`);
      }
      for (let i = 9; i >= 0; i--) {
        expect(tree.delete(i)).toBe(true);
      }
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('duplicate handling', () => {
    it.skip('updates value on duplicate insert', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      tree.insert(5, 'new five');
      expect(tree.size()).toBe(1);
      expect(tree.get(5)).toBe('new five');
    });

    it.skip('updates string duplicates', () => {
      const tree = new ZipTree<string, number>();
      tree.insert('hello', 1);
      tree.insert('hello', 2);
      expect(tree.size()).toBe(1);
      expect(tree.get('hello')).toBe(2);
    });

    it.skip('case-sensitive by default', () => {
      const tree = new ZipTree<string, number>();
      tree.insert('Hello', 1);
      tree.insert('hello', 2);
      expect(tree.size()).toBe(2);
      expect(tree.get('Hello')).toBe(1);
      expect(tree.get('hello')).toBe(2);
    });

    it.skip('duplicate does not affect toArray', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      tree.insert(1, 'new one');
      tree.insert(3, 'three');
      tree.insert(2, 'new two');
      expect(tree.toArray()).toEqual([
        [1, 'new one'],
        [2, 'new two'],
        [3, 'three'],
      ]);
    });

    it.skip('duplicate does not affect forEach count', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(1, 'new one');
      tree.insert(2, 'two');
      let count = 0;
      tree.forEach(() => count++);
      expect(count).toBe(2);
    });

    it.skip('duplicate does not affect iteration', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(1, 'new one');
      tree.insert(2, 'two');
      expect([...tree]).toEqual([
        [1, 'new one'],
        [2, 'two'],
      ]);
    });

    it.skip('duplicate at root', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(1, 'new one');
      tree.insert(1, 'newer one');
      expect(tree.size()).toBe(1);
      expect(tree.get(1)).toBe('newer one');
    });

    it.skip('duplicate after many insertions', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 50; i++) {
        tree.insert(i, `val${i}`);
      }
      tree.insert(25, 'new 25');
      expect(tree.size()).toBe(50);
      expect(tree.get(25)).toBe('new 25');
    });
  });

  describe('custom comparator', () => {
    it.skip('works with reverse comparator', () => {
      const tree = new ZipTree<number, string>({
        comparator: (a, b) => b - a,
      });
      tree.insert(1, 'one');
      tree.insert(2, 'two');
      tree.insert(3, 'three');
      expect(tree.toArray()).toEqual([
        [3, 'three'],
        [2, 'two'],
        [1, 'one'],
      ]);
    });

    it.skip('works with case-insensitive string comparator', () => {
      const tree = new ZipTree<string, number>({
        comparator: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
      });
      tree.insert('Banana', 2);
      tree.insert('apple', 1);
      tree.insert('Cherry', 3);
      expect(tree.toArray()).toEqual([
        ['apple', 1],
        ['Banana', 2],
        ['Cherry', 3],
      ]);
    });

    it.skip('works with absolute value comparator', () => {
      const tree = new ZipTree<number, string>({
        comparator: (a, b) => Math.abs(a) - Math.abs(b),
      });
      tree.insert(-5, 'neg5');
      tree.insert(3, 'pos3');
      tree.insert(-1, 'neg1');
      expect(tree.toArray()).toEqual([
        [-1, 'neg1'],
        [3, 'pos3'],
        [-5, 'neg5'],
      ]);
    });
  });

  describe('large datasets', () => {
    it.skip('handles 1000 insertions', () => {
      const tree = new ZipTree<number, number>();
      for (let i = 0; i < 1000; i++) {
        tree.insert(i, i * 10);
      }
      expect(tree.size()).toBe(1000);
      expect(tree.min()).toBe(0);
      expect(tree.max()).toBe(999);
    });

    it.skip('handles 1000 insertions in reverse', () => {
      const tree = new ZipTree<number, number>();
      for (let i = 999; i >= 0; i--) {
        tree.insert(i, i * 10);
      }
      expect(tree.size()).toBe(1000);
      expect(tree.toArray()[0]![0]).toBe(0);
      expect(tree.toArray()[999]![0]).toBe(999);
    });

    it.skip('handles random insertions of 500 elements', () => {
      const tree = new ZipTree<number, string>();
      const values = new Set<number>();
      for (let i = 0; i < 500; i++) {
        const v = Math.floor(Math.random() * 1000);
        values.add(v);
        tree.insert(v, `val${v}`);
      }
      expect(tree.size()).toBe(values.size);
      const arr = tree.toArray();
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]![0]! > arr[i - 1]![0]!).toBe(true);
      }
    });

    it.skip('handles insert and delete many elements', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 200; i++) {
        tree.insert(i, `val${i}`);
      }
      for (let i = 0; i < 100; i++) {
        tree.delete(i);
      }
      expect(tree.size()).toBe(100);
      expect(tree.min()).toBe(100);
      expect(tree.max()).toBe(199);
    });

    it.skip('handles range query on large dataset', () => {
      const tree = new ZipTree<number, number>();
      for (let i = 0; i < 1000; i++) {
        tree.insert(i, i);
      }
      const rangeResult = [...tree.range(100, 200)];
      expect(rangeResult.length).toBe(101);
      expect(rangeResult[0]![0]).toBe(100);
      expect(rangeResult[100]![0]).toBe(200);
    });
  });

  describe('combined operations', () => {
    it.skip('interleaved insert and delete', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      tree.insert(3, 'three');
      tree.delete(5);
      tree.insert(7, 'seven');
      tree.insert(1, 'one');
      tree.delete(3);
      expect(tree.size()).toBe(2);
      expect(tree.toArray()).toEqual([
        [1, 'one'],
        [7, 'seven'],
      ]);
    });

    it.skip('insert delete insert same value', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(10, 'ten');
      expect(tree.has(10)).toBe(true);
      tree.delete(10);
      expect(tree.has(10)).toBe(false);
      tree.insert(10, 'new ten');
      expect(tree.has(10)).toBe(true);
      expect(tree.get(10)).toBe('new ten');
    });

    it.skip('clear and rebuild', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 10; i++) {
        tree.insert(i, `val${i}`);
      }
      tree.clear();
      for (let i = 10; i < 20; i++) {
        tree.insert(i, `val${i}`);
      }
      expect(tree.size()).toBe(10);
      expect(tree.min()).toBe(10);
      expect(tree.max()).toBe(19);
    });

    it.skip('all methods on same tree', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      tree.insert(3, 'three');
      tree.insert(7, 'seven');
      expect(tree.size()).toBe(3);
      expect(tree.isEmpty()).toBe(false);
      expect(tree.has(5)).toBe(true);
      expect(tree.get(5)).toBe('five');
      expect(tree.min()).toBe(3);
      expect(tree.max()).toBe(7);
      expect(tree.toArray()).toEqual([
        [3, 'three'],
        [5, 'five'],
        [7, 'seven'],
      ]);
      const items: string[] = [];
      tree.forEach((value) => items.push(value));
      expect(items).toEqual(['three', 'five', 'seven']);
      expect([...tree]).toEqual([
        [3, 'three'],
        [5, 'five'],
        [7, 'seven'],
      ]);
      expect([...tree.keys()]).toEqual([3, 5, 7]);
      expect([...tree.values()]).toEqual(['three', 'five', 'seven']);
      tree.delete(5);
      expect(tree.size()).toBe(2);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
    });

    it.skip('stress test with many operations', () => {
      const tree = new ZipTree<number, string>();
      const inserted = new Set<number>();
      for (let i = 0; i < 200; i++) {
        const val = Math.floor(Math.random() * 100);
        if (!inserted.has(val)) {
          tree.insert(val, `val${val}`);
          inserted.add(val);
        }
      }
      for (const val of inserted) {
        expect(tree.has(val)).toBe(true);
      }
      expect(tree.size()).toBe(inserted.size);
      const arr = tree.toArray();
      expect(arr.length).toBe(inserted.size);
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]![0]! > arr[i - 1]![0]!).toBe(true);
      }
    });
  });

  describe('type variants', () => {
    it.skip('works with numbers', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(3.14, 'pi');
      tree.insert(2.71, 'e');
      expect(tree.get(3.14)).toBe('pi');
    });

    it.skip('works with strings', () => {
      const tree = new ZipTree<string, number>();
      tree.insert('abc', 1);
      tree.insert('def', 2);
      expect(tree.toArray()).toEqual([
        ['abc', 1],
        ['def', 2],
      ]);
    });

    it.skip('works with booleans', () => {
      const tree = new ZipTree<boolean, string>();
      tree.insert(false, 'falsy');
      tree.insert(true, 'truthy');
      expect(tree.toArray()).toEqual([
        [false, 'falsy'],
        [true, 'truthy'],
      ]);
    });
  });

  describe('range edge cases', () => {
    it.skip('range with non-existent min returns elements >= min', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 10; i += 2) {
        tree.insert(i, `val${i}`);
      }
      const result = [...tree.range(3, 7)];
      expect(result.length).toBe(3);
      expect(result).toContainEqual([4, 'val4']);
      expect(result).toContainEqual([6, 'val6']);
    });

    it.skip('range with non-existent max returns elements <= max', () => {
      const tree = new ZipTree<number, string>();
      for (let i = 0; i < 10; i += 2) {
        tree.insert(i, `val${i}`);
      }
      const result = [...tree.range(3, 5)];
      expect(result.length).toBe(2);
      expect(result).toContainEqual([4, 'val4']);
    });

    it.skip('range returns empty when no elements in range', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(1, 'one');
      tree.insert(10, 'ten');
      const result = [...tree.range(3, 7)];
      expect(result).toEqual([]);
    });

    it.skip('range works with duplicate keys after update', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      tree.insert(5, 'new five');
      const result = [...tree.range(4, 6)];
      expect(result).toEqual([[5, 'new five']]);
    });
  });

  describe('floor and ceiling edge cases', () => {
    it.skip('floor with exact boundary match', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      tree.insert(10, 'ten');
      tree.insert(15, 'fifteen');
      expect(tree.floor(10)).toBe(10);
    });

    it.skip('ceiling with exact boundary match', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      tree.insert(10, 'ten');
      tree.insert(15, 'fifteen');
      expect(tree.ceiling(10)).toBe(10);
    });

    it.skip('floor returns min if key equals min', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      tree.insert(10, 'ten');
      tree.insert(15, 'fifteen');
      expect(tree.floor(5)).toBe(5);
    });

    it.skip('ceiling returns max if key equals max', () => {
      const tree = new ZipTree<number, string>();
      tree.insert(5, 'five');
      tree.insert(10, 'ten');
      tree.insert(15, 'fifteen');
      expect(tree.ceiling(15)).toBe(15);
    });

    it.skip('floor with string keys', () => {
      const tree = new ZipTree<string, number>();
      tree.insert('apple', 1);
      tree.insert('banana', 2);
      tree.insert('cherry', 3);
      expect(tree.floor('blueberry')).toBe('banana');
    });

    it.skip('ceiling with string keys', () => {
      const tree = new ZipTree<string, number>();
      tree.insert('apple', 1);
      tree.insert('banana', 2);
      tree.insert('cherry', 3);
      expect(tree.ceiling('blueberry')).toBe('cherry');
    });
  });
});
