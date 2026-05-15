import { describe, it, expect } from 'vitest';
import { AVLTree } from '../src/core/avl-tree-5';

describe('AVLTree', () => {
  describe('empty tree', () => {
    it('should create empty tree', () => {
      const tree = new AVLTree<number>();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.getSize()).toBe(0);
      expect(tree.getHeight()).toBe(0);
      expect(tree.min()).toBe(undefined);
      expect(tree.max()).toBe(undefined);
      expect(tree.search(1)).toBe(false);
      expect(tree.contains(1)).toBe(false);
      expect(tree.inOrderTraversal()).toEqual([]);
      expect(tree.preOrderTraversal()).toEqual([]);
      expect(tree.postOrderTraversal()).toEqual([]);
      expect(tree.toArray()).toEqual([]);
    });

    it('should clear tree', () => {
      const tree = new AVLTree<number>();
      tree.insert(1);
      tree.insert(2);
      tree.insert(3);
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.getSize()).toBe(0);
      expect(tree.getHeight()).toBe(0);
    });
  });

  describe('insert', () => {
    it('should insert single element', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      expect(tree.getSize()).toBe(1);
      expect(tree.search(5)).toBe(true);
      expect(tree.getHeight()).toBe(1);
    });

    it('should insert multiple elements', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      tree.insert(6);
      expect(tree.getSize()).toBe(6);
      expect(tree.search(5)).toBe(true);
      expect(tree.search(3)).toBe(true);
      expect(tree.search(7)).toBe(true);
      expect(tree.search(2)).toBe(true);
      expect(tree.search(4)).toBe(true);
      expect(tree.search(6)).toBe(true);
    });

    it('should handle duplicates', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      tree.insert(5);
      tree.insert(5);
      expect(tree.getSize()).toBe(1);
      expect(tree.inOrderTraversal()).toEqual([5]);
    });

    it('should handle large dataset', () => {
      const tree = new AVLTree<number>();
      for (let i = 0; i < 1000; i++) {
        tree.insert(i);
      }
      expect(tree.getSize()).toBe(1000);
      expect(tree.getHeight()).toBeLessThan(20);
    });
  });

  describe('delete', () => {
    it('should delete single element', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      expect(tree.delete(5)).toBe(true);
      expect(tree.getSize()).toBe(0);
      expect(tree.search(5)).toBe(false);
    });

    it('should delete non-existent element', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      expect(tree.delete(10)).toBe(false);
      expect(tree.getSize()).toBe(1);
    });

    it('should delete leaf node', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.delete(3)).toBe(true);
      expect(tree.getSize()).toBe(2);
      expect(tree.search(3)).toBe(false);
    });

    it('should delete node with one child', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(6);
      expect(tree.delete(7)).toBe(true);
      expect(tree.getSize()).toBe(3);
      expect(tree.search(7)).toBe(false);
      expect(tree.search(6)).toBe(true);
    });

    it('should delete node with two children', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      tree.insert(6);
      tree.insert(8);
      expect(tree.delete(5)).toBe(true);
      expect(tree.getSize()).toBe(6);
      expect(tree.search(5)).toBe(false);
      expect(tree.inOrderTraversal()).toEqual([2, 3, 4, 6, 7, 8]);
    });

    it('should delete all elements', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.delete(3);
      tree.delete(5);
      tree.delete(7);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.getSize()).toBe(0);
    });
  });

  describe('search and contains', () => {
    it('should find existing element', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.search(3)).toBe(true);
      expect(tree.contains(7)).toBe(true);
    });

    it('should not find non-existent element', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.search(10)).toBe(false);
      expect(tree.contains(0)).toBe(false);
    });

    it('should search in empty tree', () => {
      const tree = new AVLTree<number>();
      expect(tree.search(5)).toBe(false);
      expect(tree.contains(5)).toBe(false);
    });
  });

  describe('traversals', () => {
    it('should perform in-order traversal', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      expect(tree.inOrderTraversal()).toEqual([2, 3, 4, 5, 7]);
    });

    it('should perform pre-order traversal', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      const result = tree.preOrderTraversal();
      expect(result[0]).toBe(5);
      expect(result.includes(3)).toBe(true);
      expect(result.includes(7)).toBe(true);
      expect(result.includes(2)).toBe(true);
      expect(result.includes(4)).toBe(true);
    });

    it('should perform post-order traversal', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      const result = tree.postOrderTraversal();
      expect(result[4]).toBe(5);
      expect(result.includes(2)).toBe(true);
      expect(result.includes(3)).toBe(true);
      expect(result.includes(4)).toBe(true);
      expect(result.includes(7)).toBe(true);
    });

    it('should traverse empty tree', () => {
      const tree = new AVLTree<number>();
      expect(tree.inOrderTraversal()).toEqual([]);
      expect(tree.preOrderTraversal()).toEqual([]);
      expect(tree.postOrderTraversal()).toEqual([]);
    });

    it('should return correct order for sorted insertion', () => {
      const tree = new AVLTree<number>();
      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
      }
      expect(tree.inOrderTraversal()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  describe('min and max', () => {
    it('should return min value', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      expect(tree.min()).toBe(2);
    });

    it('should return max value', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      tree.insert(2);
      tree.insert(4);
      expect(tree.max()).toBe(7);
    });

    it('should return undefined for empty tree', () => {
      const tree = new AVLTree<number>();
      expect(tree.min()).toBe(undefined);
      expect(tree.max()).toBe(undefined);
    });

    it('should handle single element', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      expect(tree.min()).toBe(5);
      expect(tree.max()).toBe(5);
    });
  });

  describe('balance', () => {
    it('should maintain balance on left-left rotation', () => {
      const tree = new AVLTree<number>();
      tree.insert(30);
      tree.insert(20);
      tree.insert(10);
      expect(tree.getHeight()).toBe(2);
      expect(tree.inOrderTraversal()).toEqual([10, 20, 30]);
    });

    it('should maintain balance on right-right rotation', () => {
      const tree = new AVLTree<number>();
      tree.insert(10);
      tree.insert(20);
      tree.insert(30);
      expect(tree.getHeight()).toBe(2);
      expect(tree.inOrderTraversal()).toEqual([10, 20, 30]);
    });

    it('should maintain balance on left-right rotation', () => {
      const tree = new AVLTree<number>();
      tree.insert(30);
      tree.insert(10);
      tree.insert(20);
      expect(tree.getHeight()).toBe(2);
      expect(tree.inOrderTraversal()).toEqual([10, 20, 30]);
    });

    it('should maintain balance on right-left rotation', () => {
      const tree = new AVLTree<number>();
      tree.insert(10);
      tree.insert(30);
      tree.insert(20);
      expect(tree.getHeight()).toBe(2);
      expect(tree.inOrderTraversal()).toEqual([10, 20, 30]);
    });

    it('should stay balanced after multiple operations', () => {
      const tree = new AVLTree<number>();
      const values = [50, 25, 75, 10, 30, 60, 80, 5, 15, 27, 35];
      for (const v of values) {
        tree.insert(v);
      }
      expect(tree.getHeight()).toBeLessThan(5);
      expect(tree.inOrderTraversal()).toEqual([...values].sort((a, b) => a - b));
    });

    it('should stay balanced after deletes', () => {
      const tree = new AVLTree<number>();
      for (let i = 1; i <= 20; i++) {
        tree.insert(i);
      }
      tree.delete(10);
      tree.delete(5);
      tree.delete(15);
      expect(tree.getHeight()).toBeLessThan(6);
    });
  });

  describe('custom comparator', () => {
    it('should work with custom comparator for strings', () => {
      const tree = new AVLTree<string>((a, b) => a.localeCompare(b));
      tree.insert('banana');
      tree.insert('apple');
      tree.insert('cherry');
      expect(tree.inOrderTraversal()).toEqual(['apple', 'banana', 'cherry']);
      expect(tree.min()).toBe('apple');
      expect(tree.max()).toBe('cherry');
    });

    it('should work with custom comparator for objects', () => {
      interface Person {
        name: string;
        age: number;
      }
      const tree = new AVLTree<Person>((a, b) => {
        if (a.age !== b.age) return a.age - b.age;
        return a.name.localeCompare(b.name);
      });
      tree.insert({ name: 'Alice', age: 30 });
      tree.insert({ name: 'Bob', age: 25 });
      tree.insert({ name: 'Charlie', age: 35 });
      const result = tree.inOrderTraversal();
      expect(result[0].name).toBe('Bob');
      expect(result[1].name).toBe('Alice');
      expect(result[2].name).toBe('Charlie');
    });

    it('should work with reverse comparator', () => {
      const tree = new AVLTree<number>((a, b) => b - a);
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.min()).toBe(7);
      expect(tree.max()).toBe(3);
    });
  });

  describe('toArray', () => {
    it('should return in-order array', () => {
      const tree = new AVLTree<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.toArray()).toEqual([3, 5, 7]);
    });

    it('should return empty array for empty tree', () => {
      const tree = new AVLTree<number>();
      expect(tree.toArray()).toEqual([]);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return correct time complexity string', () => {
      const tree = new AVLTree<number>();
      expect(tree.getTimeComplexity()).toBe('O(log n) for insert, delete, search, min, max; O(n) for traversals');
    });
  });

  describe('stress tests', () => {
    it('should handle 10000 random operations', () => {
      const tree = new AVLTree<number>();
      const values: number[] = [];
      for (let i = 0; i < 10000; i++) {
        const value = Math.floor(Math.random() * 10000);
        values.push(value);
        tree.insert(value);
      }
      expect(tree.getSize()).toBe(new Set(values).size);
      expect(tree.getHeight()).toBeLessThan(30);
    });

    it('should handle large sorted insertion', () => {
      const tree = new AVLTree<number>();
      for (let i = 0; i < 1000; i++) {
        tree.insert(i);
      }
      expect(tree.getSize()).toBe(1000);
      expect(tree.getHeight()).toBeLessThan(20);
      for (let i = 0; i < 1000; i++) {
        expect(tree.search(i)).toBe(true);
      }
    });

    it('should handle isEmpty', () => {
      const tree = new AVLTree();
      expect(tree.isEmpty()).toBe(true);
      tree.insert(1);
      expect(tree.isEmpty()).toBe(false);
    });
  });
});
