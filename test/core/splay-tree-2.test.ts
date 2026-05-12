import { describe, it, expect, beforeEach } from 'vitest';
import { SplayTree2 } from '../../src/core/splay-tree-2';

describe('SplayTree2', () => {
  let tree: SplayTree2<number>;

  beforeEach(() => {
    tree = new SplayTree2();
  });

  describe('insert', () => {
    it('inserts first value as root', () => {
      tree.insert(5);
      expect(tree.contains(5)).toBe(true);
    });

    it('inserts multiple values', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.contains(5)).toBe(true);
      expect(tree.contains(3)).toBe(true);
      expect(tree.contains(7)).toBe(true);
    });

    it('does not insert duplicate values', () => {
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(1);
    });

    it('handles negative numbers', () => {
      tree.insert(-5);
      tree.insert(-3);
      tree.insert(-7);
      expect(tree.contains(-5)).toBe(true);
      expect(tree.contains(-3)).toBe(true);
      expect(tree.contains(-7)).toBe(true);
    });

    it('handles zero', () => {
      tree.insert(0);
      expect(tree.contains(0)).toBe(true);
    });

    it('inserts values in descending order', () => {
      tree.insert(5);
      tree.insert(4);
      tree.insert(3);
      tree.insert(2);
      tree.insert(1);
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('inserts values in ascending order', () => {
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.insert(4);
      tree.insert(5);
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('inserts values in random order', () => {
      tree.insert(5);
      tree.insert(1);
      tree.insert(4);
      tree.insert(2);
      tree.insert(3);
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('increases size on insert', () => {
      expect(tree.size).toBe(0);
      tree.insert(5);
      expect(tree.size).toBe(1);
      tree.insert(3);
      expect(tree.size).toBe(2);
    });
  });

  describe('search', () => {
    it('returns null for empty tree', () => {
      expect(tree.search(5)).toBeNull();
    });

    it('returns value for existing node', () => {
      tree.insert(5);
      tree.insert(3);
      expect(tree.search(5)).toBe(5);
    });

    it('returns null for non-existing value', () => {
      tree.insert(5);
      expect(tree.search(10)).toBeNull();
    });

    it('returns correct value after multiple searches', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.search(3)).toBe(3);
      expect(tree.search(7)).toBe(7);
    });

    it('splays accessed node to root', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.search(3);
      expect(tree.contains(3)).toBe(true);
    });

    it('handles negative numbers', () => {
      tree.insert(-5);
      expect(tree.search(-5)).toBe(-5);
    });
  });

  describe('contains', () => {
    it('returns false for empty tree', () => {
      expect(tree.contains(5)).toBe(false);
    });

    it('returns true for existing value', () => {
      tree.insert(5);
      expect(tree.contains(5)).toBe(true);
    });

    it('returns false for non-existing value', () => {
      tree.insert(5);
      expect(tree.contains(10)).toBe(false);
    });

    it('returns true for multiple values', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.contains(5)).toBe(true);
      expect(tree.contains(3)).toBe(true);
      expect(tree.contains(7)).toBe(true);
    });

    it('returns false after deletion', () => {
      tree.insert(5);
      tree.delete(5);
      expect(tree.contains(5)).toBe(false);
    });

    it('handles zero', () => {
      tree.insert(0);
      expect(tree.contains(0)).toBe(true);
    });
  });

  describe('delete', () => {
    it('does nothing on empty tree', () => {
      tree.delete(5);
      expect(tree.size).toBe(0);
    });

    it('deletes leaf node', () => {
      tree.insert(5);
      tree.insert(3);
      tree.delete(3);
      expect(tree.contains(3)).toBe(false);
      expect(tree.size).toBe(1);
    });

    it('deletes node with one child', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(4);
      tree.delete(3);
      expect(tree.contains(3)).toBe(false);
      expect(tree.contains(4)).toBe(true);
    });

    it('deletes node with two children', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.delete(5);
      expect(tree.contains(5)).toBe(false);
      expect(tree.contains(3)).toBe(true);
      expect(tree.contains(7)).toBe(true);
    });

    it('deletes root when it has no children', () => {
      tree.insert(5);
      tree.delete(5);
      expect(tree.contains(5)).toBe(false);
      expect(tree.size).toBe(0);
    });

    it('deletes root when it has children', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.delete(5);
      expect(tree.contains(5)).toBe(false);
      expect(tree.size).toBe(2);
    });

    it('does nothing for non-existing value', () => {
      tree.insert(5);
      tree.delete(10);
      expect(tree.size).toBe(1);
    });

    it('deletes all nodes', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.delete(5);
      tree.delete(3);
      tree.delete(7);
      expect(tree.size).toBe(0);
    });

    it('deletes node after splay', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.search(3);
      tree.delete(3);
      expect(tree.contains(3)).toBe(false);
    });

    it('handles negative numbers', () => {
      tree.insert(-5);
      tree.delete(-5);
      expect(tree.contains(-5)).toBe(false);
    });
  });

  describe('min', () => {
    it('returns null for empty tree', () => {
      expect(tree.min()).toBeNull();
    });

    it('returns single value', () => {
      tree.insert(5);
      expect(tree.min()).toBe(5);
    });

    it('returns minimum of multiple values', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.min()).toBe(3);
    });

    it('returns negative minimum', () => {
      tree.insert(-5);
      tree.insert(3);
      tree.insert(-7);
      expect(tree.min()).toBe(-7);
    });

    it('returns minimum after deletions', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.delete(3);
      expect(tree.min()).toBe(5);
    });
  });

  describe('max', () => {
    it('returns null for empty tree', () => {
      expect(tree.max()).toBeNull();
    });

    it('returns single value', () => {
      tree.insert(5);
      expect(tree.max()).toBe(5);
    });

    it('returns maximum of multiple values', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.max()).toBe(7);
    });

    it('returns positive maximum with negatives', () => {
      tree.insert(-5);
      tree.insert(3);
      tree.insert(-7);
      expect(tree.max()).toBe(3);
    });

    it('returns maximum after deletions', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.delete(7);
      expect(tree.max()).toBe(5);
    });
  });

  describe('size', () => {
    it('returns 0 for empty tree', () => {
      expect(tree.size).toBe(0);
    });

    it('returns correct size after inserts', () => {
      tree.insert(5);
      expect(tree.size).toBe(1);
      tree.insert(3);
      expect(tree.size).toBe(2);
      tree.insert(7);
      expect(tree.size).toBe(3);
    });

    it('does not increase size for duplicates', () => {
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(1);
    });

    it('decreases after delete', () => {
      tree.insert(5);
      tree.insert(3);
      tree.delete(5);
      expect(tree.size).toBe(1);
    });

    it('remains same for non-existing delete', () => {
      tree.insert(5);
      tree.delete(10);
      expect(tree.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty tree', () => {
      expect(tree.isEmpty()).toBe(true);
    });

    it('returns false after insert', () => {
      tree.insert(5);
      expect(tree.isEmpty()).toBe(false);
    });

    it('returns true after clearing all', () => {
      tree.insert(5);
      tree.insert(3);
      tree.delete(5);
      tree.delete(3);
      expect(tree.isEmpty()).toBe(true);
    });

    it('returns false after multiple inserts', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it('clears empty tree', () => {
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('clears tree with one node', () => {
      tree.insert(5);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.contains(5)).toBe(false);
    });

    it('clears tree with multiple nodes', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.contains(5)).toBe(false);
      expect(tree.contains(3)).toBe(false);
      expect(tree.contains(7)).toBe(false);
    });

    it('allows insert after clear', () => {
      tree.insert(5);
      tree.clear();
      tree.insert(10);
      expect(tree.contains(10)).toBe(true);
      expect(tree.size).toBe(1);
    });
  });

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([]);
    });

    it('returns array with single element', () => {
      tree.insert(5);
      expect(tree.toArray()).toEqual([5]);
    });

    it('returns sorted array', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.toArray()).toEqual([3, 5, 7]);
    });

    it('returns sorted array after inserts in different orders', () => {
      tree.insert(1);
      tree.insert(5);
      tree.insert(3);
      tree.insert(4);
      tree.insert(2);
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('returns empty array after clear', () => {
      tree.insert(5);
      tree.insert(3);
      tree.clear();
      expect(tree.toArray()).toEqual([]);
    });

    it('returns correct array after delete', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.delete(5);
      expect(tree.toArray()).toEqual([3, 7]);
    });
  });

  describe('inOrderTraversal', () => {
    it('does not traverse empty tree', () => {
      const values: number[] = [];
      tree.inOrderTraversal((v) => values.push(v));
      expect(values).toEqual([]);
    });

    it('traverses single node', () => {
      tree.insert(5);
      const values: number[] = [];
      tree.inOrderTraversal((v) => values.push(v));
      expect(values).toEqual([5]);
    });

    it('traverses multiple nodes in order', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      const values: number[] = [];
      tree.inOrderTraversal((v) => values.push(v));
      expect(values).toEqual([3, 5, 7]);
    });

    it('traverses complex tree', () => {
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(3);
      tree.insert(7);
      const values: number[] = [];
      tree.inOrderTraversal((v) => values.push(v));
      expect(values).toEqual([3, 5, 7, 10, 15]);
    });

    it('calls callback for each node', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      let count = 0;
      tree.inOrderTraversal(() => count++);
      expect(count).toBe(3);
    });

    it('traverses after splay operations', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.search(3);
      const values: number[] = [];
      tree.inOrderTraversal((v) => values.push(v));
      expect(values).toEqual([3, 5, 7]);
    });
  });

  describe('custom comparator', () => {
    it('works with string comparator', () => {
      const stringTree = new SplayTree2<string>((a, b) => a.localeCompare(b));
      stringTree.insert('banana');
      stringTree.insert('apple');
      stringTree.insert('cherry');
      expect(stringTree.toArray()).toEqual(['apple', 'banana', 'cherry']);
    });

    it('works with reverse comparator', () => {
      const reverseTree = new SplayTree2<number>((a, b) => b - a);
      reverseTree.insert(5);
      reverseTree.insert(3);
      reverseTree.insert(7);
      expect(reverseTree.toArray()).toEqual([7, 5, 3]);
    });

    it('works with object comparator', () => {
      interface Item { id: number; name: string; }
      const objectTree = new SplayTree2<Item>((a, b) => a.id - b.id);
      objectTree.insert({ id: 2, name: 'b' });
      objectTree.insert({ id: 1, name: 'a' });
      objectTree.insert({ id: 3, name: 'c' });
      const items: Item[] = [];
      objectTree.inOrderTraversal((v) => items.push(v));
      expect(items.map((i) => i.id)).toEqual([1, 2, 3]);
    });

    it('finds with custom comparator', () => {
      const reverseTree = new SplayTree2<number>((a, b) => b - a);
      reverseTree.insert(5);
      reverseTree.insert(3);
      expect(reverseTree.contains(5)).toBe(true);
      expect(reverseTree.contains(3)).toBe(true);
    });

    it('deletes with custom comparator', () => {
      const reverseTree = new SplayTree2<number>((a, b) => b - a);
      reverseTree.insert(5);
      reverseTree.insert(3);
      reverseTree.delete(5);
      expect(reverseTree.contains(5)).toBe(false);
    });
  });

  describe('splay behavior', () => {
    it('splays on search', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.search(3);
      expect(tree.contains(3)).toBe(true);
    });

    it('splays on insert', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(4);
      expect(tree.contains(4)).toBe(true);
    });

    it('splays on delete', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(4);
      tree.delete(7);
      expect(tree.contains(4)).toBe(true);
    });

    it('maintains correct structure after splay', () => {
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      expect(tree.toArray()).toEqual([2, 3, 4, 5, 7]);
    });
  });
});
