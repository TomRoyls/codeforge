import { describe, it, expect } from 'vitest';
import { LeftistTree } from './src/core/leftist-tree/index.js';

function createNumberTree(): LeftistTree<number> {
  return new LeftistTree<number>((a, b) => a - b);
}

describe('LeftistTree', () => {
  describe('constructor', () => {
    it('creates empty tree', () => {
      const tree = createNumberTree();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('creates tree with default comparator for numbers', () => {
      const tree = new LeftistTree<number>();
      tree.insert(3);
      tree.insert(1);
      expect(tree.extractMin()).toBe(1);
    });
  });

  describe('insert', () => {
    it('inserts single element', () => {
      const tree = createNumberTree();
      tree.insert(5);
      expect(tree.size).toBe(1);
      expect(tree.isEmpty()).toBe(false);
      expect(tree.peek()).toBe(5);
    });

    it('inserts multiple elements in any order', () => {
      const tree = createNumberTree();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      expect(tree.size).toBe(5);
      expect(tree.peek()).toBe(1);
    });

    it('inserts duplicate values', () => {
      const tree = createNumberTree();
      tree.insert(5);
      tree.insert(5);
      tree.insert(3);
      expect(tree.size).toBe(3);
      expect(tree.extractMin()).toBe(3);
      expect(tree.extractMin()).toBe(5);
      expect(tree.extractMin()).toBe(5);
    });

    it('inserts in ascending order', () => {
      const tree = createNumberTree();
      for (let i = 0; i < 100; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(tree.extractMin()).toBe(i);
      }
    });

    it('inserts in descending order', () => {
      const tree = createNumberTree();
      for (let i = 99; i >= 0; i--) {
        tree.insert(i);
      }
      expect(tree.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(tree.extractMin()).toBe(i);
      }
    });
  });

  describe('extractMin', () => {
    it('returns undefined for empty tree', () => {
      const tree = createNumberTree();
      expect(tree.extractMin()).toBeUndefined();
    });

    it('extracts minimum element', () => {
      const tree = createNumberTree();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.extractMin()).toBe(3);
      expect(tree.size).toBe(2);
    });

    it('extracts all elements in sorted order', () => {
      const tree = createNumberTree();
      const values = [5, 3, 7, 1, 9, 2, 8, 4, 6];
      for (const v of values) tree.insert(v);
      const sorted = values.slice().sort((a, b) => a - b);
      for (const expected of sorted) {
        expect(tree.extractMin()).toBe(expected);
      }
      expect(tree.isEmpty()).toBe(true);
    });

    it('handles single element', () => {
      const tree = createNumberTree();
      tree.insert(42);
      expect(tree.extractMin()).toBe(42);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.extractMin()).toBeUndefined();
    });
  });

  describe('peek', () => {
    it('returns undefined for empty tree', () => {
      const tree = createNumberTree();
      expect(tree.peek()).toBeUndefined();
    });

    it('returns minimum without removing', () => {
      const tree = createNumberTree();
      tree.insert(5);
      tree.insert(3);
      expect(tree.peek()).toBe(3);
      expect(tree.size).toBe(2);
      expect(tree.peek()).toBe(3);
    });
  });

  describe('merge', () => {
    it('merges two empty trees', () => {
      const t1 = createNumberTree();
      const t2 = createNumberTree();
      t1.merge(t2);
      expect(t1.isEmpty()).toBe(true);
    });

    it('merges empty with non-empty', () => {
      const t1 = createNumberTree();
      const t2 = createNumberTree();
      t2.insert(1);
      t2.insert(3);
      t1.merge(t2);
      expect(t1.size).toBe(2);
      expect(t1.extractMin()).toBe(1);
    });

    it('merges non-empty with empty', () => {
      const t1 = createNumberTree();
      const t2 = createNumberTree();
      t1.insert(2);
      t1.insert(4);
      t1.merge(t2);
      expect(t1.size).toBe(2);
      expect(t1.extractMin()).toBe(2);
    });

    it('merges two non-empty trees', () => {
      const t1 = createNumberTree();
      const t2 = createNumberTree();
      t1.insert(1);
      t1.insert(5);
      t2.insert(2);
      t2.insert(3);
      t1.merge(t2);
      expect(t1.size).toBe(4);
      expect(t1.extractMin()).toBe(1);
      expect(t1.extractMin()).toBe(2);
      expect(t1.extractMin()).toBe(3);
      expect(t1.extractMin()).toBe(5);
    });
  });

  describe('clear', () => {
    it('clears all elements', () => {
      const tree = createNumberTree();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size).toBe(0);
    });
  });

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = createNumberTree();
      expect(tree.toArray()).toEqual([]);
    });

    it('returns sorted array', () => {
      const tree = createNumberTree();
      tree.insert(3);
      tree.insert(1);
      tree.insert(2);
      const arr = tree.toArray();
      expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3]);
    });
  });

  describe('size', () => {
    it('tracks size correctly after operations', () => {
      const tree = createNumberTree();
      expect(tree.size).toBe(0);
      tree.insert(1);
      expect(tree.size).toBe(1);
      tree.insert(2);
      expect(tree.size).toBe(2);
      tree.extractMin();
      expect(tree.size).toBe(1);
      tree.extractMin();
      expect(tree.size).toBe(0);
    });
  });

  describe('stress tests', () => {
    it('handles 1000 random insertions and extractions', () => {
      const tree = createNumberTree();
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        const v = Math.floor(Math.random() * 10000);
        values.push(v);
        tree.insert(v);
      }
      values.sort((a, b) => a - b);
      for (const expected of values) {
        expect(tree.extractMin()).toBe(expected);
      }
    });

    it('handles interleaved insert and extract', () => {
      const tree = createNumberTree();
      tree.insert(5);
      tree.insert(3);
      expect(tree.extractMin()).toBe(3);
      tree.insert(1);
      tree.insert(7);
      expect(tree.extractMin()).toBe(1);
      tree.insert(2);
      expect(tree.extractMin()).toBe(2);
      expect(tree.extractMin()).toBe(5);
      expect(tree.extractMin()).toBe(7);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('string elements', () => {
    it('works with string comparator', () => {
      const tree = new LeftistTree<string>((a, b) => a.localeCompare(b));
      tree.insert('cherry');
      tree.insert('apple');
      tree.insert('banana');
      expect(tree.extractMin()).toBe('apple');
      expect(tree.extractMin()).toBe('banana');
      expect(tree.extractMin()).toBe('cherry');
    });
  });
});
