import { describe, it, expect, beforeEach } from 'vitest';
import { ConcTree } from '../src/core/conc-tree/index.js';

describe('ConcTree', () => {
  let tree: ConcTree<number>;

  beforeEach(() => {
    tree = new ConcTree<number>();
  });

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size).toBe(0);
    });

    it('should track size after append', () => {
      tree.append(1);
      expect(tree.size).toBe(1);
      tree.append(2);
      expect(tree.size).toBe(2);
      tree.append(3);
      expect(tree.size).toBe(3);
    });

    it('should track size after prepend', () => {
      tree.prepend(1);
      expect(tree.size).toBe(1);
      tree.prepend(2);
      expect(tree.size).toBe(2);
      tree.prepend(3);
      expect(tree.size).toBe(3);
    });

    it('should track size after concat', () => {
      tree.append(1);
      tree.append(2);

      const other = new ConcTree<number>();
      other.append(3);
      other.append(4);

      tree.concat(other);
      expect(tree.size).toBe(4);
    });

    it('should update size after split', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      tree.append(4);

      const [left, right] = tree.split(2);
      expect(left.size).toBe(2);
      expect(right.size).toBe(2);
    });

    it('should reset to 0 after clear', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      expect(tree.size).toBe(3);
      tree.clear();
      expect(tree.size).toBe(0);
    });

    it('should track size after update', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      tree.update(1, 20);
      expect(tree.size).toBe(3);
    });

    it('should handle many elements', () => {
      for (let i = 0; i < 1000; i++) {
        tree.append(i);
      }
      expect(tree.size).toBe(1000);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      expect(tree.isEmpty()).toBe(true);
    });

    it('should return false after append', () => {
      tree.append(1);
      expect(tree.isEmpty()).toBe(false);
    });

    it('should return false after prepend', () => {
      tree.prepend(1);
      expect(tree.isEmpty()).toBe(false);
    });

    it('should return true after clear', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      expect(tree.isEmpty()).toBe(false);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
    });

    it('should return false after concat with non-empty', () => {
      const other = new ConcTree<number>();
      other.append(1);
      tree.concat(other);
      expect(tree.isEmpty()).toBe(false);
    });
  });

  describe('append', () => {
    it('should add single element', () => {
      tree.append(1);
      expect(tree.toArray()).toEqual([1]);
    });

    it('should add multiple elements', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should maintain order', () => {
      tree.append(10);
      tree.append(20);
      tree.append(30);
      expect(tree.toArray()).toEqual([10, 20, 30]);
    });

    it('should handle negative numbers', () => {
      tree.append(-1);
      tree.append(-2);
      tree.append(-3);
      expect(tree.toArray()).toEqual([-1, -2, -3]);
    });

    it('should handle zero', () => {
      tree.append(0);
      expect(tree.toArray()).toEqual([0]);
    });

    it('should handle duplicates', () => {
      tree.append(1);
      tree.append(1);
      tree.append(1);
      expect(tree.toArray()).toEqual([1, 1, 1]);
      expect(tree.size).toBe(3);
    });

    it('should handle large number of appends', () => {
      for (let i = 0; i < 100; i++) {
        tree.append(i);
      }
      expect(tree.size).toBe(100);
      expect(tree.get(50)).toBe(50);
    });

    it('should work with strings', () => {
      const strTree = new ConcTree<string>();
      strTree.append('a');
      strTree.append('b');
      strTree.append('c');
      expect(strTree.toArray()).toEqual(['a', 'b', 'c']);
    });

    it('should work with objects', () => {
      const objTree = new ConcTree<{ id: number }>();
      objTree.append({ id: 1 });
      objTree.append({ id: 2 });
      expect(objTree.toArray()).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('prepend', () => {
    it('should add single element', () => {
      tree.prepend(1);
      expect(tree.toArray()).toEqual([1]);
    });

    it('should add multiple elements in reverse order', () => {
      tree.prepend(1);
      tree.prepend(2);
      tree.prepend(3);
      expect(tree.toArray()).toEqual([3, 2, 1]);
    });

    it('should maintain order with prepend and append', () => {
      tree.append(2);
      tree.prepend(1);
      tree.append(3);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should handle negative numbers', () => {
      tree.prepend(-1);
      tree.prepend(-2);
      tree.prepend(-3);
      expect(tree.toArray()).toEqual([-3, -2, -1]);
    });

    it('should handle zero', () => {
      tree.prepend(0);
      expect(tree.toArray()).toEqual([0]);
    });

    it('should handle duplicates', () => {
      tree.prepend(1);
      tree.prepend(1);
      tree.prepend(1);
      expect(tree.toArray()).toEqual([1, 1, 1]);
      expect(tree.size).toBe(3);
    });

    it('should work with strings', () => {
      const strTree = new ConcTree<string>();
      strTree.prepend('a');
      strTree.prepend('b');
      strTree.prepend('c');
      expect(strTree.toArray()).toEqual(['c', 'b', 'a']);
    });

    it('should work after many appends', () => {
      for (let i = 0; i < 10; i++) {
        tree.append(i);
      }
      tree.prepend(999);
      expect(tree.get(0)).toBe(999);
      expect(tree.get(10)).toBe(9);
    });
  });

  describe('concat', () => {
    it('should concat two empty trees', () => {
      const other = new ConcTree<number>();
      tree.concat(other);
      expect(tree.toArray()).toEqual([]);
      expect(tree.size).toBe(0);
    });

    it('should concat empty with non-empty', () => {
      const other = new ConcTree<number>();
      other.append(1);
      other.append(2);
      tree.concat(other);
      expect(tree.toArray()).toEqual([1, 2]);
      expect(tree.size).toBe(2);
    });

    it('should concat non-empty with empty', () => {
      tree.append(1);
      tree.append(2);
      const other = new ConcTree<number>();
      tree.concat(other);
      expect(tree.toArray()).toEqual([1, 2]);
      expect(tree.size).toBe(2);
    });

    it('should concat two non-empty trees', () => {
      tree.append(1);
      tree.append(2);
      const other = new ConcTree<number>();
      other.append(3);
      other.append(4);
      tree.concat(other);
      expect(tree.toArray()).toEqual([1, 2, 3, 4]);
      expect(tree.size).toBe(4);
    });

    it('should preserve original trees', () => {
      tree.append(1);
      tree.append(2);
      const other = new ConcTree<number>();
      other.append(3);
      other.append(4);
      tree.concat(other);
      expect(other.toArray()).toEqual([3, 4]);
      expect(other.size).toBe(2);
    });

    it('should handle multiple concats', () => {
      tree.append(1);
      const t2 = new ConcTree<number>();
      t2.append(2);
      const t3 = new ConcTree<number>();
      t3.append(3);
      tree.concat(t2);
      tree.concat(t3);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should concat with itself', () => {
      tree.append(1);
      tree.append(2);
      tree.concat(tree);
      expect(tree.toArray()).toEqual([1, 2, 1, 2]);
    });
  });

  describe('get', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.get(0)).toBe(undefined);
    });

    it('should return undefined for negative index', () => {
      tree.append(1);
      expect(tree.get(-1)).toBe(undefined);
    });

    it('should return undefined for out of bounds', () => {
      tree.append(1);
      expect(tree.get(1)).toBe(undefined);
      expect(tree.get(100)).toBe(undefined);
    });

    it('should get first element', () => {
      tree.append(10);
      tree.append(20);
      tree.append(30);
      expect(tree.get(0)).toBe(10);
    });

    it('should get middle element', () => {
      tree.append(10);
      tree.append(20);
      tree.append(30);
      expect(tree.get(1)).toBe(20);
    });

    it('should get last element', () => {
      tree.append(10);
      tree.append(20);
      tree.append(30);
      expect(tree.get(2)).toBe(30);
    });

    it('should get all elements sequentially', () => {
      for (let i = 0; i < 100; i++) {
        tree.append(i);
      }
      for (let i = 0; i < 100; i++) {
        expect(tree.get(i)).toBe(i);
      }
    });

    it('should work with prepended elements', () => {
      tree.append(2);
      tree.prepend(1);
      tree.append(3);
      expect(tree.get(0)).toBe(1);
      expect(tree.get(1)).toBe(2);
      expect(tree.get(2)).toBe(3);
    });

    it('should work after update', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      tree.update(1, 20);
      expect(tree.get(0)).toBe(1);
      expect(tree.get(1)).toBe(20);
      expect(tree.get(2)).toBe(3);
    });

    it('should work after split', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      tree.append(4);
      const [left] = tree.split(2);
      expect(left.get(0)).toBe(1);
      expect(left.get(1)).toBe(2);
    });
  });

  describe('update', () => {
    it('should do nothing on empty tree', () => {
      tree.update(0, 10);
      expect(tree.toArray()).toEqual([]);
      expect(tree.size).toBe(0);
    });

    it('should do nothing for negative index', () => {
      tree.append(1);
      tree.update(-1, 10);
      expect(tree.toArray()).toEqual([1]);
    });

    it('should do nothing for out of bounds', () => {
      tree.append(1);
      tree.update(1, 10);
      expect(tree.toArray()).toEqual([1]);
    });

    it('should update first element', () => {
      tree.append(10);
      tree.append(20);
      tree.append(30);
      tree.update(0, 100);
      expect(tree.toArray()).toEqual([100, 20, 30]);
    });

    it('should update middle element', () => {
      tree.append(10);
      tree.append(20);
      tree.append(30);
      tree.update(1, 200);
      expect(tree.toArray()).toEqual([10, 200, 30]);
    });

    it('should update last element', () => {
      tree.append(10);
      tree.append(20);
      tree.append(30);
      tree.update(2, 300);
      expect(tree.toArray()).toEqual([10, 20, 300]);
    });

    it('should update multiple elements', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      tree.update(0, 10);
      tree.update(1, 20);
      tree.update(2, 30);
      expect(tree.toArray()).toEqual([10, 20, 30]);
    });

    it('should preserve other elements', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      tree.append(4);
      tree.update(1, 20);
      expect(tree.toArray()).toEqual([1, 20, 3, 4]);
    });

    it('should allow updating to same value', () => {
      tree.append(1);
      tree.append(2);
      tree.update(0, 1);
      expect(tree.toArray()).toEqual([1, 2]);
    });

    it('should work with strings', () => {
      const strTree = new ConcTree<string>();
      strTree.append('a');
      strTree.append('b');
      strTree.append('c');
      strTree.update(1, 'B');
      expect(strTree.toArray()).toEqual(['a', 'B', 'c']);
    });
  });

  describe('split', () => {
    it('should return empty and full tree for index 0', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const [left, right] = tree.split(0);
      expect(left.toArray()).toEqual([]);
      expect(left.size).toBe(0);
      expect(right.toArray()).toEqual([1, 2, 3]);
      expect(right.size).toBe(3);
    });

    it('should return full and empty tree for index equal to size', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const [left, right] = tree.split(3);
      expect(left.toArray()).toEqual([1, 2, 3]);
      expect(left.size).toBe(3);
      expect(right.toArray()).toEqual([]);
      expect(right.size).toBe(0);
    });

    it('should return two empty trees for empty tree at 0', () => {
      const [left, right] = tree.split(0);
      expect(left.toArray()).toEqual([]);
      expect(right.toArray()).toEqual([]);
    });

    it('should return two empty trees for empty tree at negative', () => {
      const [left, right] = tree.split(-1);
      expect(left.toArray()).toEqual([]);
      expect(right.toArray()).toEqual([]);
    });

    it('should split in middle', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      tree.append(4);
      const [left, right] = tree.split(2);
      expect(left.toArray()).toEqual([1, 2]);
      expect(right.toArray()).toEqual([3, 4]);
    });

    it('should split at first element', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const [left, right] = tree.split(1);
      expect(left.toArray()).toEqual([1]);
      expect(right.toArray()).toEqual([2, 3]);
    });

    it('should split at last element', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const [left, right] = tree.split(2);
      expect(left.toArray()).toEqual([1, 2]);
      expect(right.toArray()).toEqual([3]);
    });

    it('should preserve order after split', () => {
      for (let i = 0; i < 100; i++) {
        tree.append(i);
      }
      const [left, right] = tree.split(50);
      expect(left.toArray().length).toBe(50);
      expect(right.toArray().length).toBe(50);
      expect(left.get(49)).toBe(49);
      expect(right.get(0)).toBe(50);
    });

    it('should not modify original tree', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const originalArray = tree.toArray();
      tree.split(1);
      expect(tree.toArray()).toEqual(originalArray);
    });

    it('should work on prepended elements', () => {
      tree.append(2);
      tree.prepend(1);
      tree.append(3);
      const [left, right] = tree.split(2);
      expect(left.toArray()).toEqual([1, 2]);
      expect(right.toArray()).toEqual([3]);
    });

    it('should handle multiple splits', () => {
      for (let i = 0; i < 10; i++) {
        tree.append(i);
      }
      const [a, b] = tree.split(5);
      const [a1, a2] = a.split(2);
      expect(a1.toArray()).toEqual([0, 1]);
      expect(a2.toArray()).toEqual([2, 3, 4]);
      expect(b.toArray()).toEqual([5, 6, 7, 8, 9]);
    });
  });

  describe('clear', () => {
    it('should clear empty tree', () => {
      tree.clear();
      expect(tree.toArray()).toEqual([]);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should clear single element', () => {
      tree.append(1);
      tree.clear();
      expect(tree.toArray()).toEqual([]);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should clear multiple elements', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      tree.clear();
      expect(tree.toArray()).toEqual([]);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should allow operations after clear', () => {
      tree.append(1);
      tree.append(2);
      tree.clear();
      tree.append(10);
      tree.append(20);
      expect(tree.toArray()).toEqual([10, 20]);
    });

    it('should clear large tree', () => {
      for (let i = 0; i < 1000; i++) {
        tree.append(i);
      }
      expect(tree.size).toBe(1000);
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should clear multiple times', () => {
      tree.append(1);
      tree.clear();
      tree.clear();
      tree.clear();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([]);
      expect(tree.toArray()).toBeInstanceOf(Array);
    });

    it('should return single element', () => {
      tree.append(1);
      expect(tree.toArray()).toEqual([1]);
    });

    it('should return multiple elements', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should maintain order after append', () => {
      tree.append(10);
      tree.append(20);
      tree.append(30);
      expect(tree.toArray()).toEqual([10, 20, 30]);
    });

    it('should maintain order after prepend', () => {
      tree.prepend(1);
      tree.prepend(2);
      tree.prepend(3);
      expect(tree.toArray()).toEqual([3, 2, 1]);
    });

    it('should maintain order after mixed operations', () => {
      tree.append(2);
      tree.prepend(1);
      tree.append(3);
      tree.prepend(0);
      expect(tree.toArray()).toEqual([0, 1, 2, 3]);
    });

    it('should work after update', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      tree.update(1, 20);
      expect(tree.toArray()).toEqual([1, 20, 3]);
    });

    it('should handle large tree', () => {
      for (let i = 0; i < 100; i++) {
        tree.append(i);
      }
      const arr = tree.toArray();
      expect(arr.length).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(arr[i]).toBe(i);
      }
    });

    it('should work with strings', () => {
      const strTree = new ConcTree<string>();
      strTree.append('a');
      strTree.append('b');
      strTree.append('c');
      expect(strTree.toArray()).toEqual(['a', 'b', 'c']);
    });
  });

  describe('forEach', () => {
    it('should not iterate on empty tree', () => {
      let count = 0;
      tree.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('should iterate over single element', () => {
      tree.append(1);
      let count = 0;
      const results: number[] = [];
      tree.forEach((value, index) => {
        results.push(value);
        expect(index).toBe(count);
        count++;
      });
      expect(results).toEqual([1]);
      expect(count).toBe(1);
    });

    it('should iterate over multiple elements', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const results: number[] = [];
      tree.forEach((value, index) => {
        results.push(value);
        expect(index).toBe(value - 1);
      });
      expect(results).toEqual([1, 2, 3]);
    });

    it('should iterate in correct order', () => {
      tree.append(10);
      tree.append(20);
      tree.append(30);
      const results: number[] = [];
      tree.forEach((value) => {
        results.push(value);
      });
      expect(results).toEqual([10, 20, 30]);
    });

    it('should iterate after prepend', () => {
      tree.prepend(3);
      tree.prepend(2);
      tree.prepend(1);
      const results: number[] = [];
      tree.forEach((value) => {
        results.push(value);
      });
      expect(results).toEqual([1, 2, 3]);
    });

    it('should iterate with index', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      let lastIndex = -1;
      tree.forEach((value, index) => {
        expect(index).toBe(lastIndex + 1);
        lastIndex = index;
      });
      expect(lastIndex).toBe(2);
    });

    it('should iterate over large tree', () => {
      for (let i = 0; i < 100; i++) {
        tree.append(i);
      }
      let count = 0;
      tree.forEach((value, index) => {
        expect(value).toBe(index);
        count++;
      });
      expect(count).toBe(100);
    });
  });

  describe('map', () => {
    it('should return empty tree for empty input', () => {
      const result = tree.map((x) => x * 2);
      expect(result.toArray()).toEqual([]);
      expect(result.size).toBe(0);
    });

    it('should map single element', () => {
      tree.append(1);
      const result = tree.map((x) => x * 2);
      expect(result.toArray()).toEqual([2]);
      expect(result.size).toBe(1);
    });

    it('should map multiple elements', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const result = tree.map((x) => x * 2);
      expect(result.toArray()).toEqual([2, 4, 6]);
      expect(result.size).toBe(3);
    });

    it('should provide index to callback', () => {
      tree.append(10);
      tree.append(20);
      tree.append(30);
      const indices: number[] = [];
      tree.map((value, index) => {
        indices.push(index);
        return value;
      });
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should preserve order', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const result = tree.map((x) => x * 10);
      expect(result.toArray()).toEqual([10, 20, 30]);
    });

    it('should map to different type', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const result = tree.map((x) => x.toString());
      expect(result.toArray()).toEqual(['1', '2', '3']);
    });

    it('should not modify original tree', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      tree.map((x) => x * 2);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should work after prepend', () => {
      tree.prepend(3);
      tree.prepend(2);
      tree.prepend(1);
      const result = tree.map((x) => x * 2);
      expect(result.toArray()).toEqual([2, 4, 6]);
    });

    it('should handle complex mapping', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const result = tree.map((x, i) => x + i * 10);
      expect(result.toArray()).toEqual([1, 12, 23]);
    });
  });

  describe('filter', () => {
    it('should return empty tree for empty input', () => {
      const result = tree.filter((x) => x > 5);
      expect(result.toArray()).toEqual([]);
      expect(result.size).toBe(0);
    });

    it('should filter single element matching', () => {
      tree.append(10);
      const result = tree.filter((x) => x > 5);
      expect(result.toArray()).toEqual([10]);
      expect(result.size).toBe(1);
    });

    it('should filter single element not matching', () => {
      tree.append(1);
      const result = tree.filter((x) => x > 5);
      expect(result.toArray()).toEqual([]);
      expect(result.size).toBe(0);
    });

    it('should filter multiple elements', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      tree.append(4);
      tree.append(5);
      const result = tree.filter((x) => x % 2 === 0);
      expect(result.toArray()).toEqual([2, 4]);
      expect(result.size).toBe(2);
    });

    it('should preserve order', () => {
      tree.append(10);
      tree.append(5);
      tree.append(15);
      tree.append(20);
      tree.append(25);
      const result = tree.filter((x) => x > 10);
      expect(result.toArray()).toEqual([15, 20, 25]);
    });

    it('should provide index to callback', () => {
      tree.append(10);
      tree.append(20);
      tree.append(30);
      const indices: number[] = [];
      tree.filter((value, index) => {
        indices.push(index);
        return true;
      });
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should not modify original tree', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      tree.filter((x) => x > 5);
      expect(tree.toArray()).toEqual([1, 2, 3]);
    });

    it('should filter all out', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const result = tree.filter(() => false);
      expect(result.toArray()).toEqual([]);
      expect(result.size).toBe(0);
    });

    it('should filter all in', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const result = tree.filter(() => true);
      expect(result.toArray()).toEqual([1, 2, 3]);
      expect(result.size).toBe(3);
    });

    it('should work with strings', () => {
      const strTree = new ConcTree<string>();
      strTree.append('a');
      strTree.append('bb');
      strTree.append('ccc');
      const result = strTree.filter((s) => s.length > 1);
      expect(result.toArray()).toEqual(['bb', 'ccc']);
    });
  });

  describe('clone', () => {
    it('should clone empty tree', () => {
      const cloned = tree.clone();
      expect(cloned.toArray()).toEqual([]);
      expect(cloned.size).toBe(0);
      expect(cloned.isEmpty()).toBe(true);
    });

    it('should clone single element', () => {
      tree.append(1);
      const cloned = tree.clone();
      expect(cloned.toArray()).toEqual([1]);
      expect(cloned.size).toBe(1);
    });

    it('should clone multiple elements', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const cloned = tree.clone();
      expect(cloned.toArray()).toEqual([1, 2, 3]);
      expect(cloned.size).toBe(3);
    });

    it('should clone after prepend', () => {
      tree.prepend(1);
      tree.prepend(2);
      tree.prepend(3);
      const cloned = tree.clone();
      expect(cloned.toArray()).toEqual([3, 2, 1]);
    });

    it('should clone after update', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      tree.update(1, 20);
      const cloned = tree.clone();
      expect(cloned.toArray()).toEqual([1, 20, 3]);
    });

    it('should have same size as original', () => {
      for (let i = 0; i < 100; i++) {
        tree.append(i);
      }
      const cloned = tree.clone();
      expect(cloned.size).toBe(tree.size);
    });

    it('should have same isEmpty as original', () => {
      tree.append(1);
      const cloned = tree.clone();
      expect(cloned.isEmpty()).toBe(tree.isEmpty());
    });

    it('should clone large tree', () => {
      for (let i = 0; i < 1000; i++) {
        tree.append(i);
      }
      const cloned = tree.clone();
      expect(cloned.toArray()).toEqual(tree.toArray());
      expect(cloned.size).toBe(tree.size);
    });
  });

  describe('iterator', () => {
    it('should not iterate over empty tree', () => {
      const result: number[] = [];
      for (const value of tree) {
        result.push(value);
      }
      expect(result).toEqual([]);
    });

    it('should iterate over single element', () => {
      tree.append(1);
      const result: number[] = [];
      for (const value of tree) {
        result.push(value);
      }
      expect(result).toEqual([1]);
    });

    it('should iterate over multiple elements', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const result: number[] = [];
      for (const value of tree) {
        result.push(value);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    it('should support spread operator', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const result = [...tree];
      expect(result).toEqual([1, 2, 3]);
    });

    it('should iterate in correct order', () => {
      tree.append(10);
      tree.append(20);
      tree.append(30);
      const result: number[] = [];
      for (const value of tree) {
        result.push(value);
      }
      expect(result).toEqual([10, 20, 30]);
    });

    it('should work after prepend', () => {
      tree.prepend(3);
      tree.prepend(2);
      tree.prepend(1);
      const result: number[] = [];
      for (const value of tree) {
        result.push(value);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    it('should work with Array.from', () => {
      tree.append(1);
      tree.append(2);
      tree.append(3);
      const result = Array.from(tree);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should iterate over large tree', () => {
      for (let i = 0; i < 100; i++) {
        tree.append(i);
      }
      let count = 0;
      for (const value of tree) {
        expect(value).toBe(count);
        count++;
      }
      expect(count).toBe(100);
    });

    it('should work with strings', () => {
      const strTree = new ConcTree<string>();
      strTree.append('a');
      strTree.append('b');
      strTree.append('c');
      const result: string[] = [];
      for (const value of strTree) {
        result.push(value);
      }
      expect(result).toEqual(['a', 'b', 'c']);
    });
  });

  describe('from', () => {
    it('should create empty tree from empty array', () => {
      const result = ConcTree.from([]);
      expect(result.toArray()).toEqual([]);
      expect(result.size).toBe(0);
      expect(result.isEmpty()).toBe(true);
    });

    it('should create tree from single element array', () => {
      const result = ConcTree.from([1]);
      expect(result.toArray()).toEqual([1]);
      expect(result.size).toBe(1);
    });

    it('should create tree from multiple element array', () => {
      const result = ConcTree.from([1, 2, 3]);
      expect(result.toArray()).toEqual([1, 2, 3]);
      expect(result.size).toBe(3);
    });

    it('should preserve order', () => {
      const result = ConcTree.from([10, 20, 30, 40]);
      expect(result.toArray()).toEqual([10, 20, 30, 40]);
    });

    it('should handle large array', () => {
      const arr: number[] = [];
      for (let i = 0; i < 100; i++) {
        arr.push(i);
      }
      const result = ConcTree.from(arr);
      expect(result.toArray()).toEqual(arr);
      expect(result.size).toBe(100);
    });

    it('should work with strings', () => {
      const result = ConcTree.from(['a', 'b', 'c']);
      expect(result.toArray()).toEqual(['a', 'b', 'c']);
    });

    it('should work with objects', () => {
      const result = ConcTree.from([{ id: 1 }, { id: 2 }]);
      expect(result.toArray()).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should handle duplicates', () => {
      const result = ConcTree.from([1, 1, 1]);
      expect(result.toArray()).toEqual([1, 1, 1]);
      expect(result.size).toBe(3);
    });
  });

  describe('integration', () => {
    it('should handle complex workflow', () => {
      const t1 = ConcTree.from([1, 2, 3]);
      const t2 = ConcTree.from([4, 5, 6]);
      t1.concat(t2);
      expect(t1.toArray()).toEqual([1, 2, 3, 4, 5, 6]);

      const [left, right] = t1.split(4);
      expect(left.toArray()).toEqual([1, 2, 3, 4]);
      expect(right.toArray()).toEqual([5, 6]);

      const doubled = left.map((x) => x * 2);
      expect(doubled.toArray()).toEqual([2, 4, 6, 8]);

      const evens = right.filter((x) => x % 2 === 0);
      expect(evens.toArray()).toEqual([6]);
    });

    it('should maintain consistency across operations', () => {
      for (let i = 0; i < 50; i++) {
        tree.append(i);
      }

      expect(tree.size).toBe(50);
      expect(tree.get(25)).toBe(25);

      const cloned = tree.clone();
      expect(cloned.toArray()).toEqual(tree.toArray());

      const filtered = tree.filter((x) => x % 2 === 0);
      expect(filtered.size).toBe(25);

      const mapped = tree.map((x) => x * 2);
      expect(mapped.size).toBe(50);
      expect(mapped.get(0)).toBe(0);
      expect(mapped.get(25)).toBe(50);
    });

    it('should handle prepend and concat together', () => {
      tree.append(3);
      tree.append(4);
      tree.prepend(2);
      tree.prepend(1);

      const other = new ConcTree<number>();
      other.append(5);
      other.append(6);

      tree.concat(other);
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should work with many appends and prepends', () => {
      for (let i = 0; i < 50; i++) {
        tree.append(i);
      }
      for (let i = 0; i < 50; i++) {
        tree.prepend(i + 100);
      }

      expect(tree.size).toBe(100);
      expect(tree.get(0)).toBe(149);
      expect(tree.get(99)).toBe(49);
    });

    it('should handle split then concat', () => {
      for (let i = 0; i < 10; i++) {
        tree.append(i);
      }

      const [left, right] = tree.split(5);
      left.concat(right);

      expect(left.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(left.size).toBe(10);
    });
  });

  describe('edge cases', () => {
    it('should handle mixed types with null', () => {
      const nullTree = new ConcTree<number | null>();
      nullTree.append(1);
      nullTree.append(null);
      nullTree.append(2);
      expect(nullTree.toArray()).toEqual([1, null, 2]);
    });

    it('should handle mixed types with undefined', () => {
      const undefTree = new ConcTree<number | undefined>();
      undefTree.append(1);
      undefTree.append(undefined);
      undefTree.append(2);
      expect(undefTree.toArray()).toEqual([1, undefined, 2]);
    });

    it('should handle very large values', () => {
      tree.append(Number.MAX_SAFE_INTEGER);
      tree.append(Number.MIN_SAFE_INTEGER);
      expect(tree.get(0)).toBe(Number.MAX_SAFE_INTEGER);
      expect(tree.get(1)).toBe(Number.MIN_SAFE_INTEGER);
    });

    it('should handle infinity', () => {
      tree.append(Infinity);
      tree.append(-Infinity);
      expect(tree.get(0)).toBe(Infinity);
      expect(tree.get(1)).toBe(-Infinity);
    });

    it('should handle NaN', () => {
      tree.append(NaN);
      expect(tree.get(0)).toBeNaN();
    });

    it('should handle negative zero', () => {
      tree.append(-0);
      tree.append(0);
      expect(tree.toArray()).toEqual([-0, 0]);
    });

    it('should handle rapid append and prepend', () => {
      for (let i = 0; i < 100; i++) {
        tree.append(i);
        tree.prepend(i + 1000);
      }
      expect(tree.size).toBe(200);
    });

    it('should handle update of all elements', () => {
      for (let i = 0; i < 10; i++) {
        tree.append(i);
      }
      for (let i = 0; i < 10; i++) {
        tree.update(i, i * 10);
      }
      expect(tree.toArray()).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90]);
    });

    it('should handle get of all elements', () => {
      for (let i = 0; i < 100; i++) {
        tree.append(i);
      }
      for (let i = 0; i < 100; i++) {
        expect(tree.get(i)).toBe(i);
      }
    });
  });
});
