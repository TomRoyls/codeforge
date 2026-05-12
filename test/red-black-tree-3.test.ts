import { describe, it, expect } from 'vitest';
import { RedBlackTree3 } from './src/core/red-black-tree-3/index.js';

describe('RedBlackTree3', () => {
  describe('insert and search', () => {
    it('should insert and search a single element', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      expect(tree.search(5)).toBe(true);
      expect(tree.search(10)).toBe(false);
    });

    it('should insert multiple elements and search them', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.search(5)).toBe(true);
      expect(tree.search(3)).toBe(true);
      expect(tree.search(7)).toBe(true);
      expect(tree.search(1)).toBe(false);
    });

    it('should handle duplicate values by ignoring them', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(1);
      expect(tree.search(5)).toBe(true);
    });

    it('should handle negative numbers', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(-5);
      tree.insert(-3);
      tree.insert(-7);
      expect(tree.search(-5)).toBe(true);
      expect(tree.search(-3)).toBe(true);
      expect(tree.search(-7)).toBe(true);
    });

    it('should handle zero', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(0);
      expect(tree.search(0)).toBe(true);
    });

    it('should work with strings', () => {
      const tree = new RedBlackTree3<string>();
      tree.insert('apple');
      tree.insert('banana');
      tree.insert('cherry');
      expect(tree.search('apple')).toBe(true);
      expect(tree.search('banana')).toBe(true);
      expect(tree.search('cherry')).toBe(true);
      expect(tree.search('date')).toBe(false);
    });
  });

  describe('contains', () => {
    it('should return true for existing elements', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(10);
      expect(tree.contains(10)).toBe(true);
    });

    it('should return false for non-existing elements', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(10);
      expect(tree.contains(20)).toBe(false);
    });

    it('should return false for empty tree', () => {
      const tree = new RedBlackTree3<number>();
      expect(tree.contains(5)).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove a single element', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      expect(tree.remove(5)).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.search(5)).toBe(false);
    });

    it('should return false when removing non-existent element', () => {
      const tree = new RedBlackTree3<number>();
      expect(tree.remove(5)).toBe(false);
    });

    it('should remove from the middle of the tree', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.remove(5)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.search(5)).toBe(false);
      expect(tree.search(3)).toBe(true);
      expect(tree.search(7)).toBe(true);
    });

    it('should remove a leaf node', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.remove(3)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.search(3)).toBe(false);
    });

    it('should remove a node with one child', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(4);
      expect(tree.remove(3)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.search(3)).toBe(false);
      expect(tree.search(4)).toBe(true);
    });

    it('should remove all elements', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.remove(1);
      tree.remove(2);
      tree.remove(3);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should handle removing from empty tree', () => {
      const tree = new RedBlackTree3<number>();
      expect(tree.remove(5)).toBe(false);
    });

    it('should maintain red-black properties after removal', () => {
      const tree = new RedBlackTree3<number>();
      for (let i = 0; i < 20; i++) {
        tree.insert(i);
      }
      for (let i = 0; i < 10; i++) {
        tree.remove(i);
      }
      expect(tree.size).toBe(10);
      const arr = tree.toArray();
      expect(arr).toEqual([...arr].sort((a, b) => a - b));
    });
  });

  describe('min and max', () => {
    it('should return min value', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.min()).toBe(3);
    });

    it('should return max value', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.max()).toBe(7);
    });

    it('should return undefined for min of empty tree', () => {
      const tree = new RedBlackTree3<number>();
      expect(tree.min()).toBeUndefined();
    });

    it('should return undefined for max of empty tree', () => {
      const tree = new RedBlackTree3<number>();
      expect(tree.max()).toBeUndefined();
    });

    it('should handle single element tree', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      expect(tree.min()).toBe(5);
      expect(tree.max()).toBe(5);
    });

    it('should work with negative numbers', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(-5);
      tree.insert(-3);
      tree.insert(-7);
      expect(tree.min()).toBe(-7);
      expect(tree.max()).toBe(-3);
    });
  });

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tree = new RedBlackTree3<number>();
      expect(tree.size).toBe(0);
    });

    it('should return correct size after insertions', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      expect(tree.size).toBe(1);
      tree.insert(3);
      expect(tree.size).toBe(2);
      tree.insert(7);
      expect(tree.size).toBe(3);
    });

    it('should not increase size for duplicates', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(5);
      expect(tree.size).toBe(1);
    });

    it('should decrease size after removal', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.remove(5);
      expect(tree.size).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      const tree = new RedBlackTree3<number>();
      expect(tree.isEmpty()).toBe(true);
    });

    it('should return false after insertion', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      expect(tree.isEmpty()).toBe(false);
    });

    it('should return true after removing all elements', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.remove(5);
      tree.remove(3);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear the tree', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.search(5)).toBe(false);
      expect(tree.search(3)).toBe(false);
      expect(tree.search(7)).toBe(false);
    });

    it('should handle clearing empty tree', () => {
      const tree = new RedBlackTree3<number>();
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const tree = new RedBlackTree3<number>();
      expect(tree.toArray()).toEqual([]);
    });

    it('should return elements in sorted order', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      const arr = tree.toArray();
      expect(arr).toEqual([1, 3, 5, 7, 9]);
    });

    it('should handle single element', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      expect(tree.toArray()).toEqual([5]);
    });

    it('should work with strings', () => {
      const tree = new RedBlackTree3<string>();
      tree.insert('banana');
      tree.insert('apple');
      tree.insert('cherry');
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry']);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      const values: number[] = [];
      tree.forEach((value) => values.push(value));
      expect(values).toEqual([3, 5, 7]);
    });

    it('should handle empty tree', () => {
      const tree = new RedBlackTree3<number>();
      const values: number[] = [];
      tree.forEach((value) => values.push(value));
      expect(values).toEqual([]);
    });

    it('should call callback for each element exactly once', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      let count = 0;
      tree.forEach(() => count++);
      expect(count).toBe(3);
    });
  });

  describe('predecessor', () => {
    it('should return predecessor of middle element', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.predecessor(5)).toBe(3);
    });

    it('should return predecessor of max element', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.predecessor(7)).toBe(5);
    });

    it('should return undefined for min element', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.predecessor(3)).toBeUndefined();
    });

    it('should return undefined for non-existent element', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      expect(tree.predecessor(10)).toBeUndefined();
    });

    it('should work with complex tree', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(3);
      tree.insert(7);
      expect(tree.predecessor(10)).toBe(7);
    });
  });

  describe('successor', () => {
    it('should return successor of middle element', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.successor(5)).toBe(7);
    });

    it('should return successor of min element', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.successor(3)).toBe(5);
    });

    it('should return undefined for max element', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.successor(7)).toBeUndefined();
    });

    it('should return undefined for non-existent element', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      expect(tree.successor(10)).toBeUndefined();
    });

    it('should work with complex tree', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(13);
      tree.insert(17);
      expect(tree.successor(10)).toBe(13);
    });
  });

  describe('rangeSearch', () => {
    it('should find all elements in range', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(1);
      tree.insert(9);
      const result = tree.rangeSearch(3, 7);
      expect(result).toEqual([3, 5, 7]);
    });

    it('should return empty array for no elements in range', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(10);
      tree.insert(15);
      const result = tree.rangeSearch(20, 25);
      expect(result).toEqual([]);
    });

    it('should handle range with same low and high', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      const result = tree.rangeSearch(5, 5);
      expect(result).toEqual([5]);
    });

    it('should handle range outside tree values', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(10);
      tree.insert(15);
      const result = tree.rangeSearch(0, 20);
      expect(result).toEqual([5, 10, 15]);
    });

    it('should handle empty tree', () => {
      const tree = new RedBlackTree3<number>();
      const result = tree.rangeSearch(5, 10);
      expect(result).toEqual([]);
    });
  });

  describe('height', () => {
    it('should return 0 for empty tree', () => {
      const tree = new RedBlackTree3<number>();
      expect(tree.height()).toBe(0);
    });

    it('should return 1 for single element', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      expect(tree.height()).toBe(1);
    });

    it('should calculate height correctly for balanced tree', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.height()).toBe(2);
    });

    it('should maintain logarithmic height', () => {
      const tree = new RedBlackTree3<number>();
      for (let i = 0; i < 100; i++) {
        tree.insert(i);
      }
      expect(tree.height()).toBeLessThan(20);
    });
  });

  describe('ordering invariant', () => {
    it('should maintain sorted order after insertions', () => {
      const tree = new RedBlackTree3<number>();
      const values = [5, 3, 7, 1, 9, 4, 6, 8, 2, 0];
      for (const v of values) {
        tree.insert(v);
      }
      const arr = tree.toArray();
      expect(arr).toEqual([...values].sort((a, b) => a - b));
    });

    it('should maintain sorted order after deletions', () => {
      const tree = new RedBlackTree3<number>();
      for (let i = 0; i < 20; i++) {
        tree.insert(i);
      }
      for (let i = 0; i < 10; i++) {
        tree.remove(i);
      }
      const arr = tree.toArray();
      expect(arr).toEqual([...arr].sort((a, b) => a - b));
    });
  });

  describe('red-black property maintenance', () => {
    it('should maintain red-black properties after insertions', () => {
      const tree = new RedBlackTree3<number>();
      for (let i = 0; i < 50; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(50);
      const arr = tree.toArray();
      expect(arr).toEqual([...arr].sort((a, b) => a - b));
    });

    it('should maintain red-black properties after deletions', () => {
      const tree = new RedBlackTree3<number>();
      for (let i = 0; i < 50; i++) {
        tree.insert(i);
      }
      for (let i = 0; i < 25; i++) {
        tree.remove(i * 2);
      }
      expect(tree.size).toBe(25);
      const arr = tree.toArray();
      expect(arr).toEqual([...arr].sort((a, b) => a - b));
    });
  });

  describe('large sequential insert', () => {
    it('should handle 1000 sequential insertions', () => {
      const tree = new RedBlackTree3<number>();
      for (let i = 0; i < 1000; i++) {
        tree.insert(i);
      }
      expect(tree.size).toBe(1000);
      expect(tree.height()).toBeLessThan(30);
      const arr = tree.toArray();
      expect(arr).toEqual([...Array(1000)].map((_, i) => i));
    });
  });

  describe('large random insert', () => {
    it('should handle 1000 random insertions', () => {
      const tree = new RedBlackTree3<number>();
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        const value = Math.floor(Math.random() * 10000);
        if (!values.includes(value)) {
          values.push(value);
          tree.insert(value);
        }
      }
      expect(tree.size).toBe(values.length);
      expect(tree.height()).toBeLessThan(30);
      const arr = tree.toArray();
      expect(arr).toEqual([...values].sort((a, b) => a - b));
    });
  });

  describe('custom comparator', () => {
    it('should work with custom comparator for objects', () => {
      interface Person {
        name: string;
        age: number;
      }

      const tree = new RedBlackTree3<Person>((a, b) => {
        if (a.age < b.age) return -1;
        if (a.age > b.age) return 1;
        return 0;
      });

      const alice: Person = { name: 'Alice', age: 30 };
      const bob: Person = { name: 'Bob', age: 25 };
      const charlie: Person = { name: 'Charlie', age: 35 };

      tree.insert(alice);
      tree.insert(bob);
      tree.insert(charlie);

      expect(tree.search(bob)).toBe(true);
      expect(tree.search(alice)).toBe(true);
      expect(tree.search(charlie)).toBe(true);
      expect(tree.toArray()).toEqual([bob, alice, charlie]);
    });

    it('should work with reverse order comparator', () => {
      const tree = new RedBlackTree3<number>((a, b) => b - a);
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.toArray()).toEqual([7, 5, 3]);
    });
  });

  describe('single element operations', () => {
    it('should handle all operations on single element tree', () => {
      const tree = new RedBlackTree3<number>();
      tree.insert(5);

      expect(tree.size).toBe(1);
      expect(tree.isEmpty()).toBe(false);
      expect(tree.search(5)).toBe(true);
      expect(tree.contains(5)).toBe(true);
      expect(tree.min()).toBe(5);
      expect(tree.max()).toBe(5);
      expect(tree.toArray()).toEqual([5]);
      expect(tree.predecessor(5)).toBeUndefined();
      expect(tree.successor(5)).toBeUndefined();
      expect(tree.rangeSearch(5, 5)).toEqual([5]);
      expect(tree.height()).toBe(1);

      tree.remove(5);

      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.search(5)).toBe(false);
      expect(tree.contains(5)).toBe(false);
      expect(tree.min()).toBeUndefined();
      expect(tree.max()).toBeUndefined();
      expect(tree.toArray()).toEqual([]);
      expect(tree.height()).toBe(0);
    });
  });
});
