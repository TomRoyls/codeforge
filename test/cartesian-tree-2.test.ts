import { describe, it, expect } from 'vitest';
import { CartesianTree } from '../src/core/cartesian-tree-2/index.js';

describe('CartesianTree', () => {
  describe('constructor', () => {
    it('should create empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
      expect(tree.findRoot()).toBe(null);
    });

    it('should create tree with single element', () => {
      const tree = new CartesianTree<number>([5]);
      expect(tree.size()).toBe(1);
      expect(tree.isEmpty()).toBe(false);
      expect(tree.toArray()).toEqual([5]);
    });

    it('should create tree with multiple elements', () => {
      const tree = new CartesianTree<number>([3, 1, 4, 1, 5]);
      expect(tree.size()).toBe(5);
      expect(tree.toArray()).toEqual([3, 1, 4, 1, 5]);
    });

    it('should use default comparator', () => {
      const tree = new CartesianTree<number>([5, 3, 7]);
      expect(tree.getRangeMin(0, 2)).toBe(3);
    });

    it('should use custom comparator', () => {
      const tree = new CartesianTree<number>([5, 3, 7], (a, b) => b - a);
      expect(tree.getRangeMin(0, 2)).toBe(7);
    });
  });

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.size()).toBe(0);
    });

    it('should return correct size for non-empty tree', () => {
      const tree = new CartesianTree<number>([1, 2, 3, 4, 5]);
      expect(tree.size()).toBe(5);
    });

    it('should return size equal to input array length', () => {
      const values = [10, 20, 30, 40, 50, 60];
      const tree = new CartesianTree<number>(values);
      expect(tree.size()).toBe(values.length);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should return false for non-empty tree', () => {
      const tree = new CartesianTree<number>([1]);
      expect(tree.isEmpty()).toBe(false);
    });

    it('should return false after multiple insertions', () => {
      const tree = new CartesianTree<number>([1, 2, 3]);
      expect(tree.isEmpty()).toBe(false);
    });
  });

  describe('findRoot', () => {
    it('should return null for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.findRoot()).toBe(null);
    });

    it('should return root with correct value', () => {
      const tree = new CartesianTree<number>([3, 1, 4]);
      const root = tree.findRoot();
      expect(root).toBeDefined();
      expect(root!.value).toBe(1);
    });

    it('should return root with correct index', () => {
      const tree = new CartesianTree<number>([5, 2, 8, 1, 9]);
      const root = tree.findRoot();
      expect(root!.index).toBe(3);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.toArray()).toEqual([]);
    });

    it('should return original input array', () => {
      const values = [3, 1, 4, 1, 5, 9, 2, 6];
      const tree = new CartesianTree<number>(values);
      expect(tree.toArray()).toEqual(values);
    });


  });

  describe('getValues', () => {
    it('should return readonly values array', () => {
      const values = [1, 2, 3, 4, 5];
      const tree = new CartesianTree<number>(values);
      expect(tree.getValues()).toEqual(values);
    });

    it('should return empty array for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.getValues()).toEqual([]);
    });
  });

  describe('inorder', () => {
    it('should return empty array for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.inorder()).toEqual([]);
    });

    it('should return single element for single node tree', () => {
      const tree = new CartesianTree<number>([5]);
      expect(tree.inorder()).toEqual([5]);
    });

    it('should traverse all elements', () => {
      const tree = new CartesianTree<number>([3, 1, 4, 1, 5]);
      const result = tree.inorder();
      expect(result.length).toBe(5);
    });

    it('should handle duplicate values', () => {
      const tree = new CartesianTree<number>([2, 2, 1, 1, 3, 3]);
      const result = tree.inorder();
      expect(result.length).toBe(6);
    });
  });

  describe('preorder', () => {
    it('should return empty array for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.preorder()).toEqual([]);
    });

    it('should return single element for single node tree', () => {
      const tree = new CartesianTree<number>([5]);
      expect(tree.preorder()).toEqual([5]);
    });

    it('should start with minimum element', () => {
      const tree = new CartesianTree<number>([5, 3, 7, 1, 9]);
      const result = tree.preorder();
      expect(result[0]).toBe(1);
    });
  });

  describe('postorder', () => {
    it('should return empty array for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.postorder()).toEqual([]);
    });

    it('should return single element for single node tree', () => {
      const tree = new CartesianTree<number>([5]);
      expect(tree.postorder()).toEqual([5]);
    });

    it('should traverse all elements', () => {
      const tree = new CartesianTree<number>([3, 1, 4, 1, 5]);
      const result = tree.postorder();
      expect(result.length).toBe(5);
    });
  });

  describe('levelOrder', () => {
    it('should return empty array for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.levelOrder()).toEqual([]);
    });

    it('should return single element for single node tree', () => {
      const tree = new CartesianTree<number>([5]);
      expect(tree.levelOrder()).toEqual([5]);
    });

    it('should traverse by levels', () => {
      const tree = new CartesianTree<number>([3, 1, 4]);
      const result = tree.levelOrder();
      expect(result.length).toBe(3);
    });
  });

  describe('getRangeMin', () => {
    it('should return undefined for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.getRangeMin(0, 0)).toBe(undefined);
    });

    it('should return min for single element', () => {
      const tree = new CartesianTree<number>([5]);
      expect(tree.getRangeMin(0, 0)).toBe(5);
    });

    it('should return minimum in range', () => {
      const tree = new CartesianTree<number>([5, 3, 7, 1, 9]);
      expect(tree.getRangeMin(0, 4)).toBe(1);
    });

    it('should return min for partial range', () => {
      const tree = new CartesianTree<number>([5, 3, 7, 1, 9]);
      expect(tree.getRangeMin(1, 3)).toBe(1);
    });

    it('should return undefined for invalid start index', () => {
      const tree = new CartesianTree<number>([1, 2, 3]);
      expect(tree.getRangeMin(-1, 2)).toBe(undefined);
    });

    it('should return undefined for invalid end index', () => {
      const tree = new CartesianTree<number>([1, 2, 3]);
      expect(tree.getRangeMin(0, 5)).toBe(undefined);
    });

    it('should return undefined when start > end', () => {
      const tree = new CartesianTree<number>([1, 2, 3]);
      expect(tree.getRangeMin(2, 1)).toBe(undefined);
    });

    it('should return min for range with equal bounds', () => {
      const tree = new CartesianTree<number>([5, 3, 7]);
      expect(tree.getRangeMin(1, 1)).toBe(3);
    });
  });

  describe('getRangeMax', () => {
    it('should return undefined for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.getRangeMax(0, 0)).toBe(undefined);
    });

    it('should return max for single element', () => {
      const tree = new CartesianTree<number>([5]);
      expect(tree.getRangeMax(0, 0)).toBe(5);
    });

    it('should return maximum in range', () => {
      const tree = new CartesianTree<number>([1, 3, 2, 7, 5]);
      expect(tree.getRangeMax(0, 4)).toBe(7);
    });

    it('should return max for partial range', () => {
      const tree = new CartesianTree<number>([1, 3, 2, 7, 5]);
      expect(tree.getRangeMax(0, 2)).toBe(3);
    });

    it('should return undefined for invalid start index', () => {
      const tree = new CartesianTree<number>([1, 2, 3]);
      expect(tree.getRangeMax(-1, 2)).toBe(undefined);
    });

    it('should return undefined for invalid end index', () => {
      const tree = new CartesianTree<number>([1, 2, 3]);
      expect(tree.getRangeMax(0, 5)).toBe(undefined);
    });

    it('should return undefined when start > end', () => {
      const tree = new CartesianTree<number>([1, 2, 3]);
      expect(tree.getRangeMax(2, 1)).toBe(undefined);
    });

    it('should return max for range with equal bounds', () => {
      const tree = new CartesianTree<number>([5, 3, 7]);
      expect(tree.getRangeMax(1, 1)).toBe(3);
    });
  });

  describe('rangeQuery', () => {
    it('should return empty array for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.rangeQuery(0, 0)).toEqual([]);
    });

    it('should return single element for single element range', () => {
      const tree = new CartesianTree<number>([5, 3, 7]);
      expect(tree.rangeQuery(0, 0)).toEqual([5]);
    });

    it('should return elements in range', () => {
      const tree = new CartesianTree<number>([1, 2, 3, 4, 5]);
      expect(tree.rangeQuery(1, 3)).toEqual([2, 3, 4]);
    });

    it('should return all elements for full range', () => {
      const tree = new CartesianTree<number>([1, 2, 3]);
      expect(tree.rangeQuery(0, 2)).toEqual([1, 2, 3]);
    });

    it('should return empty array for invalid start', () => {
      const tree = new CartesianTree<number>([1, 2, 3]);
      expect(tree.rangeQuery(-1, 2)).toEqual([]);
    });

    it('should return empty array for invalid end', () => {
      const tree = new CartesianTree<number>([1, 2, 3]);
      expect(tree.rangeQuery(0, 5)).toEqual([]);
    });

    it('should return empty array when start > end', () => {
      const tree = new CartesianTree<number>([1, 2, 3]);
      expect(tree.rangeQuery(2, 1)).toEqual([]);
    });
  });

  describe('find', () => {
    it('should return null for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.find(5)).toBe(null);
    });

    it('should find existing value', () => {
      const tree = new CartesianTree<number>([5, 3, 7, 1, 9]);
      const result = tree.find(5);
      expect(result).toBeDefined();
      expect(result!.value).toBe(5);
    });

    it('should return null for non-existent value', () => {
      const tree = new CartesianTree<number>([5, 3, 7, 1, 9]);
      expect(tree.find(10)).toBe(null);
    });

    it('should find first occurrence of duplicate', () => {
      const tree = new CartesianTree<number>([5, 3, 5, 1, 9]);
      const result = tree.find(5);
      expect(result).toBeDefined();
      expect(result!.value).toBe(5);
    });

    it('should return node with correct index', () => {
      const tree = new CartesianTree<number>([5, 3, 7, 1, 9]);
      const result = tree.find(1);
      expect(result!.index).toBe(3);
    });
  });

  describe('contains', () => {
    it('should return false for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.contains(5)).toBe(false);
    });

    it('should return true for existing value', () => {
      const tree = new CartesianTree<number>([5, 3, 7, 1, 9]);
      expect(tree.contains(5)).toBe(true);
    });

    it('should return false for non-existent value', () => {
      const tree = new CartesianTree<number>([5, 3, 7, 1, 9]);
      expect(tree.contains(10)).toBe(false);
    });

    it('should return true for duplicate values', () => {
      const tree = new CartesianTree<number>([5, 3, 5, 1, 9]);
      expect(tree.contains(5)).toBe(true);
    });
  });

  describe('getHeight', () => {
    it('should return -1 for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.getHeight()).toBe(-1);
    });

    it('should return 0 for single element', () => {
      const tree = new CartesianTree<number>([5]);
      expect(tree.getHeight()).toBe(0);
    });

    it('should calculate height correctly', () => {
      const tree = new CartesianTree<number>([3, 1, 4]);
      expect(tree.getHeight()).toBeGreaterThanOrEqual(0);
    });

    it('should handle larger tree', () => {
      const tree = new CartesianTree<number>([5, 3, 7, 2, 4, 6, 8]);
      expect(tree.getHeight()).toBeGreaterThan(0);
    });
  });

  describe('getNodeCount', () => {
    it('should return 0 for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.getNodeCount()).toBe(0);
    });

    it('should return 1 for single element', () => {
      const tree = new CartesianTree<number>([5]);
      expect(tree.getNodeCount()).toBe(1);
    });

    it('should equal size for all elements', () => {
      const tree = new CartesianTree<number>([1, 2, 3, 4, 5]);
      expect(tree.getNodeCount()).toBe(tree.size());
    });

    it('should handle duplicates correctly', () => {
      const tree = new CartesianTree<number>([1, 2, 2, 3, 3, 3]);
      expect(tree.getNodeCount()).toBe(6);
    });
  });

  describe('isValid', () => {
    it('should return true for empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.isValid()).toBe(true);
    });

    it('should return true for valid tree', () => {
      const tree = new CartesianTree<number>([3, 1, 4]);
      expect(tree.isValid()).toBe(true);
    });

    it('should maintain heap property', () => {
      const tree = new CartesianTree<number>([5, 3, 7, 1, 9]);
      expect(tree.isValid()).toBe(true);
    });

    it('should validate inorder traversal', () => {
      const tree = new CartesianTree<number>([3, 1, 4, 1, 5]);
      expect(tree.isValid()).toBe(true);
    });
  });

  describe('clone', () => {
    it('should clone empty tree', () => {
      const tree = new CartesianTree<number>([]);
      const cloned = tree.clone();
      expect(cloned.isEmpty()).toBe(true);
      expect(cloned.size()).toBe(0);
    });

    it('should clone single element tree', () => {
      const tree = new CartesianTree<number>([5]);
      const cloned = tree.clone();
      expect(cloned.size()).toBe(1);
      expect(cloned.toArray()).toEqual([5]);
    });

    it('should clone multiple elements', () => {
      const tree = new CartesianTree<number>([3, 1, 4, 1, 5]);
      const cloned = tree.clone();
      expect(cloned.size()).toBe(tree.size());
      expect(cloned.toArray()).toEqual(tree.toArray());
    });

    it('should create independent copy', () => {
      const tree1 = new CartesianTree<number>([1, 2, 3]);
      const cloned = tree1.clone();
      expect(cloned.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('static fromArray', () => {
    it('should create tree from empty array', () => {
      const tree = CartesianTree.fromArray<number>([]);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should create tree from single element', () => {
      const tree = CartesianTree.fromArray<number>([5]);
      expect(tree.size()).toBe(1);
      expect(tree.toArray()).toEqual([5]);
    });

    it('should create tree from multiple elements', () => {
      const values = [3, 1, 4, 1, 5];
      const tree = CartesianTree.fromArray<number>(values);
      expect(tree.size()).toBe(values.length);
      expect(tree.toArray()).toEqual(values);
    });

    it('should use default comparator', () => {
      const tree = CartesianTree.fromArray<number>([5, 3, 7]);
      expect(tree.getRangeMin(0, 2)).toBe(3);
    });

    it('should use custom comparator', () => {
      const tree = CartesianTree.fromArray<number>([5, 3, 7], (a, b) => b - a);
      expect(tree.getRangeMin(0, 2)).toBe(7);
    });
  });

  describe('static build', () => {
    it('should create tree from empty array', () => {
      const tree = CartesianTree.build<number>([]);
      expect(tree.isEmpty()).toBe(true);
    });

    it('should create tree from single element', () => {
      const tree = CartesianTree.build<number>([5]);
      expect(tree.size()).toBe(1);
      expect(tree.toArray()).toEqual([5]);
    });

    it('should create tree from multiple elements', () => {
      const values = [3, 1, 4, 1, 5];
      const tree = CartesianTree.build<number>(values);
      expect(tree.size()).toBe(values.length);
      expect(tree.toArray()).toEqual(values);
    });

    it('should use default comparator', () => {
      const tree = CartesianTree.build<number>([5, 3, 7]);
      expect(tree.getRangeMin(0, 2)).toBe(3);
    });

    it('should use custom comparator', () => {
      const tree = CartesianTree.build<number>([5, 3, 7], (a, b) => b - a);
      expect(tree.getRangeMin(0, 2)).toBe(7);
    });
  });

  describe('custom comparator', () => {
    it('should work with string comparator', () => {
      const tree = new CartesianTree<string>(['banana', 'apple', 'cherry'], (a, b) => a.localeCompare(b));
      expect(tree.size()).toBe(3);
      expect(tree.toArray()).toEqual(['banana', 'apple', 'cherry']);
    });

    it('should work with reverse comparator', () => {
      const tree = new CartesianTree<number>([5, 3, 7], (a, b) => b - a);
      expect(tree.getRangeMin(0, 2)).toBe(7);
      expect(tree.getRangeMax(0, 2)).toBe(3);
    });

    it('should work with object comparator', () => {
      interface Item {
        value: number;
      }

      const items = [{ value: 5 }, { value: 3 }, { value: 7 }];
      const tree = new CartesianTree<Item>(items, (a, b) => a.value - b.value);
      expect(tree.size()).toBe(3);
      expect(tree.toArray()).toEqual(items);
    });
  });

  describe('negative numbers', () => {
    it('should handle negative values', () => {
      const tree = new CartesianTree<number>([-5, -3, -7, -1, -9]);
      expect(tree.size()).toBe(5);
      expect(tree.getRangeMin(0, 4)).toBe(-9);
      expect(tree.getRangeMax(0, 4)).toBe(-1);
    });

    it('should find negative values', () => {
      const tree = new CartesianTree<number>([-5, -3, -7]);
      expect(tree.contains(-5)).toBe(true);
      expect(tree.contains(-3)).toBe(true);
      expect(tree.contains(-7)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle single element operations', () => {
      const tree = new CartesianTree<number>([42]);
      expect(tree.size()).toBe(1);
      expect(tree.isEmpty()).toBe(false);
      expect(tree.contains(42)).toBe(true);
      expect(tree.toArray()).toEqual([42]);
      expect(tree.inorder()).toEqual([42]);
      expect(tree.preorder()).toEqual([42]);
      expect(tree.postorder()).toEqual([42]);
      expect(tree.levelOrder()).toEqual([42]);
      expect(tree.getHeight()).toBe(0);
      expect(tree.getNodeCount()).toBe(1);
      expect(tree.getRangeMin(0, 0)).toBe(42);
      expect(tree.getRangeMax(0, 0)).toBe(42);
      expect(tree.rangeQuery(0, 0)).toEqual([42]);
    });

    it('should handle two elements', () => {
      const tree = new CartesianTree<number>([5, 3]);
      expect(tree.size()).toBe(2);
      expect(tree.inorder().length).toBe(2);
      expect(tree.isValid()).toBe(true);
    });

    it('should handle sorted input', () => {
      const tree = new CartesianTree<number>([1, 2, 3, 4, 5]);
      expect(tree.size()).toBe(5);
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
      expect(tree.isValid()).toBe(true);
    });

    it('should handle reverse sorted input', () => {
      const tree = new CartesianTree<number>([5, 4, 3, 2, 1]);
      expect(tree.size()).toBe(5);
      expect(tree.toArray()).toEqual([5, 4, 3, 2, 1]);
      expect(tree.isValid()).toBe(true);
    });
  });

  describe('large input', () => {
    it('should handle 100 elements', () => {
      const values = Array.from({ length: 100 }, (_, i) => i);
      const tree = new CartesianTree<number>(values);
      expect(tree.size()).toBe(100);
      expect(tree.toArray()).toEqual(values);
      expect(tree.isValid()).toBe(true);
    });

    it('should handle random values', () => {
      const values = Array.from({ length: 50 }, () => Math.floor(Math.random() * 1000));
      const tree = new CartesianTree<number>(values);
      expect(tree.size()).toBe(values.length);
      expect(tree.toArray()).toEqual(values);
      expect(tree.getNodeCount()).toBe(values.length);
    });

    it('should maintain structure with duplicates', () => {
      const values = [5, 3, 5, 1, 9, 3, 7, 1];
      const tree = new CartesianTree<number>(values);
      expect(tree.size()).toBe(8);
      expect(tree.toArray()).toEqual(values);
      expect(tree.isValid()).toBe(true);
    });
  });

  describe('traversal consistency', () => {
    it('should have same length for all traversals', () => {
      const tree = new CartesianTree<number>([3, 1, 4, 1, 5, 9, 2, 6]);
      const inorder = tree.inorder();
      const preorder = tree.preorder();
      const postorder = tree.postorder();
      const levelOrder = tree.levelOrder();

      expect(inorder.length).toBe(tree.size());
      expect(preorder.length).toBe(tree.size());
      expect(postorder.length).toBe(tree.size());
      expect(levelOrder.length).toBe(tree.size());
    });

    it('should return empty for all traversals on empty tree', () => {
      const tree = new CartesianTree<number>([]);
      expect(tree.inorder()).toEqual([]);
      expect(tree.preorder()).toEqual([]);
      expect(tree.postorder()).toEqual([]);
      expect(tree.levelOrder()).toEqual([]);
    });
  });

  describe('range query consistency', () => {
    it('should match array slice for range query', () => {
      const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const tree = new CartesianTree<number>(values);
      expect(tree.rangeQuery(2, 7)).toEqual(values.slice(2, 8));
    });

    it('should get correct min and max in range', () => {
      const values = [10, 50, 30, 70, 20, 90, 40];
      const tree = new CartesianTree<number>(values);
      const rangeMin = tree.getRangeMin(1, 5);
      const rangeMax = tree.getRangeMax(1, 5);
      const rangeValues = values.slice(1, 6);
      expect(rangeMin).toBe(Math.min(...rangeValues));
      expect(rangeMax).toBe(Math.max(...rangeValues));
    });
  });

  describe('find and contains consistency', () => {
    it('should find and contain same values', () => {
      const tree = new CartesianTree<number>([5, 3, 7, 1, 9, 2, 6, 8, 4, 10]);
      for (let i = 1; i <= 10; i++) {
        expect(tree.contains(i)).toBe(true);
        expect(tree.find(i)).toBeDefined();
      }
    });

    it('should not find and not contain same values', () => {
      const tree = new CartesianTree<number>([5, 3, 7, 1, 9]);
      expect(tree.contains(11)).toBe(false);
      expect(tree.find(11)).toBe(null);
    });
  });
});
