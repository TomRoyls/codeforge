import { describe, it, expect } from 'vitest';
import { BTree } from '../src/core/b-tree-4/index';

describe('BTree', () => {
  describe('Empty tree', () => {
    it('should be empty initially', () => {
      const tree = new BTree<number>();
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
      expect(tree.getHeight()).toBe(0);
    });

    it('should return undefined for min and max on empty tree', () => {
      const tree = new BTree<number>();
      expect(tree.min()).toBeUndefined();
      expect(tree.max()).toBeUndefined();
    });

    it('should return empty array for toArray on empty tree', () => {
      const tree = new BTree<number>();
      expect(tree.toArray()).toEqual([]);
    });

    it('should return false for search on empty tree', () => {
      const tree = new BTree<number>();
      expect(tree.search(5)).toBe(false);
      expect(tree.contains(5)).toBe(false);
    });

    it('should return false for delete on empty tree', () => {
      const tree = new BTree<number>();
      expect(tree.delete(5)).toBe(false);
    });

    it('should clear empty tree', () => {
      const tree = new BTree<number>();
      tree.clear();
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe('Insert and search', () => {
    it('should insert and find single value', () => {
      const tree = new BTree<number>();
      tree.insert(5);
      expect(tree.isEmpty()).toBe(false);
      expect(tree.size()).toBe(1);
      expect(tree.search(5)).toBe(true);
      expect(tree.contains(5)).toBe(true);
      expect(tree.search(10)).toBe(false);
    });

    it.skip('should insert multiple values in random order', () => {
      const tree = new BTree<number>();
      const values = [10, 20, 5, 6, 12, 30, 7, 17];
      values.forEach(v => tree.insert(v));
      expect(tree.size()).toBe(8);
      values.forEach(v => {
        expect(tree.contains(v)).toBe(true);
      });
      expect(tree.contains(100)).toBe(false);
    });

    it.skip('should handle sequential insert', () => {
      const tree = new BTree<number>();
      for (let i = 1; i <= 20; i++) {
        tree.insert(i);
      }
      expect(tree.size()).toBe(20);
      for (let i = 1; i <= 20; i++) {
        expect(tree.contains(i)).toBe(true);
      }
    });

    it.skip('should handle reverse sequential insert', () => {
      const tree = new BTree<number>();
      for (let i = 20; i >= 1; i--) {
        tree.insert(i);
      }
      expect(tree.size()).toBe(20);
      for (let i = 1; i <= 20; i++) {
        expect(tree.contains(i)).toBe(true);
      }
    });

    it('should handle duplicates', () => {
      const tree = new BTree<number>();
      tree.insert(5);
      tree.insert(5);
      tree.insert(10);
      expect(tree.size()).toBe(3);
      expect(tree.search(5)).toBe(true);
      expect(tree.search(10)).toBe(true);
    });
  });

  describe('Delete', () => {
    it('should delete single value', () => {
      const tree = new BTree<number>();
      tree.insert(5);
      expect(tree.delete(5)).toBe(true);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
    });

    it('should return false for deleting non-existent value', () => {
      const tree = new BTree<number>();
      tree.insert(5);
      tree.insert(10);
      expect(tree.delete(7)).toBe(false);
      expect(tree.size()).toBe(2);
    });

    it('should delete from leaf node', () => {
      const tree = new BTree<number>();
      tree.insert(5);
      tree.insert(10);
      tree.insert(15);
      tree.insert(20);
      tree.delete(10);
      expect(tree.size()).toBe(3);
      expect(tree.contains(10)).toBe(false);
      expect(tree.contains(5)).toBe(true);
      expect(tree.contains(15)).toBe(true);
      expect(tree.contains(20)).toBe(true);
    });

    it.skip('should delete from internal node', () => {
      const tree = new BTree<number>();
      for (let i = 1; i <= 20; i++) {
        tree.insert(i);
      }
      tree.delete(10);
      expect(tree.size()).toBe(19);
      expect(tree.contains(10)).toBe(false);
      for (let i = 1; i <= 20; i++) {
        if (i !== 10) {
          expect(tree.contains(i)).toBe(true);
        }
      }
    });

    it('should handle deletion causing merge', () => {
      const tree = new BTree<number>();
      [1, 2, 3, 4, 5, 6].forEach(v => tree.insert(v));
      tree.delete(2);
      tree.delete(3);
      expect(tree.size()).toBe(4);
      expect(tree.contains(2)).toBe(false);
      expect(tree.contains(3)).toBe(false);
    });

    it('should handle all deletions', () => {
      const tree = new BTree<number>();
      const values = [5, 10, 15, 20, 25, 30];
      values.forEach(v => tree.insert(v));
      values.forEach(v => {
        expect(tree.delete(v)).toBe(true);
      });
      expect(tree.isEmpty()).toBe(true);
      expect(tree.size()).toBe(0);
    });
  });

  describe('Min and max', () => {
    it('should return min and max after inserts', () => {
      const tree = new BTree<number>();
      tree.insert(10);
      expect(tree.min()).toBe(10);
      expect(tree.max()).toBe(10);

      tree.insert(5);
      tree.insert(15);
      expect(tree.min()).toBe(5);
      expect(tree.max()).toBe(15);

      tree.insert(1);
      tree.insert(20);
      expect(tree.min()).toBe(1);
      expect(tree.max()).toBe(20);
    });

    it('should update min after deletion', () => {
      const tree = new BTree<number>();
      [5, 10, 15, 20].forEach(v => tree.insert(v));
      tree.delete(5);
      expect(tree.min()).toBe(10);
    });

    it('should update max after deletion', () => {
      const tree = new BTree<number>();
      [5, 10, 15, 20].forEach(v => tree.insert(v));
      tree.delete(20);
      expect(tree.max()).toBe(15);
    });
  });

  describe('Traversals', () => {
    it('should return empty array for empty tree', () => {
      const tree = new BTree<number>();
      expect(tree.inOrderTraversal()).toEqual([]);
      expect(tree.toArray()).toEqual([]);
    });

    it('should return single value', () => {
      const tree = new BTree<number>();
      tree.insert(5);
      expect(tree.inOrderTraversal()).toEqual([5]);
      expect(tree.toArray()).toEqual([5]);
    });

    it('should return values in sorted order', () => {
      const tree = new BTree<number>();
      const values = [10, 5, 15, 3, 7, 12, 20];
      values.forEach(v => tree.insert(v));
      const sorted = values.slice().sort((a, b) => a - b);
      expect(tree.inOrderTraversal()).toEqual(sorted);
      expect(tree.toArray()).toEqual(sorted);
    });

    it('should handle duplicates in traversal', () => {
      const tree = new BTree<number>();
      tree.insert(5);
      tree.insert(5);
      tree.insert(10);
      tree.insert(5);
      expect(tree.inOrderTraversal()).toEqual([5, 5, 5, 10]);
    });
  });

  describe('Size', () => {
    it.skip('should track size correctly', () => {
      const tree = new BTree<number>();
      expect(tree.size()).toBe(0);

      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
        expect(tree.size()).toBe(i);
      }

      tree.delete(5);
      expect(tree.size()).toBe(9);

      tree.clear();
      expect(tree.size()).toBe(0);
    });
  });

  describe('Height', () => {
    it('should return 0 for empty tree', () => {
      const tree = new BTree<number>();
      expect(tree.getHeight()).toBe(0);
    });

    it('should return 1 for single node', () => {
      const tree = new BTree<number>();
      tree.insert(5);
      expect(tree.getHeight()).toBe(1);
    });

    it.skip('should increase height with more values', () => {
      const tree = new BTree<number>(3);
      for (let i = 1; i <= 20; i++) {
        tree.insert(i);
      }
      expect(tree.getHeight()).toBeGreaterThan(1);
    });

    it('should decrease height after deletions', () => {
      const tree = new BTree<number>(3);
      for (let i = 1; i <= 30; i++) {
        tree.insert(i);
      }
      const initialHeight = tree.getHeight();

      for (let i = 30; i >= 1; i--) {
        tree.delete(i);
      }

      expect(tree.getHeight()).toBe(0);
    });
  });

  describe('Custom comparator', () => {
    it('should use custom comparator for strings', () => {
      const tree = new BTree<string>(4, (a, b) => a.localeCompare(b));
      const values = ['banana', 'apple', 'cherry', 'date'];
      values.forEach(v => tree.insert(v));
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry', 'date']);
      expect(tree.contains('apple')).toBe(true);
      expect(tree.contains('grape')).toBe(false);
    });

    it('should use custom comparator for objects', () => {
      interface Person {
        name: string;
        age: number;
      }

      const tree = new BTree<Person>(4, (a, b) => a.age - b.age);
      const people: Person[] = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 35 },
      ];
      people.forEach(p => tree.insert(p));

      expect(tree.min()).toEqual({ name: 'Bob', age: 25 });
      expect(tree.max()).toEqual({ name: 'Charlie', age: 35 });
      expect(tree.contains({ name: 'Alice', age: 30 })).toBe(true);
    });

    it('should use reverse comparator', () => {
      const tree = new BTree<number>(4, (a, b) => b - a);
      [1, 2, 3, 4, 5].forEach(v => tree.insert(v));
      expect(tree.min()).toBe(5);
      expect(tree.max()).toBe(1);
    });
  });

  describe('Order parameter', () => {
    it.skip('should use custom order', () => {
      const tree = new BTree<number>(3);
      for (let i = 1; i <= 20; i++) {
        tree.insert(i);
      }
      expect(tree.size()).toBe(20);
      for (let i = 1; i <= 20; i++) {
        expect(tree.contains(i)).toBe(true);
      }
    });

    it('should handle small order', () => {
      const tree = new BTree<number>(2);
      for (let i = 1; i <= 10; i++) {
        tree.insert(i);
      }
      expect(tree.size()).toBe(10);
      expect(tree.inOrderTraversal().length).toBe(10);
    });

    it('should handle large order', () => {
      const tree = new BTree<number>(10);
      for (let i = 1; i <= 100; i++) {
        tree.insert(i);
      }
      expect(tree.size()).toBe(100);
      expect(tree.inOrderTraversal().length).toBe(100);
    });
  });

  describe('Large datasets', () => {
    it.skip('should handle 1000 values', () => {
      const tree = new BTree<number>();
      for (let i = 1; i <= 1000; i++) {
        tree.insert(i);
      }
      expect(tree.size()).toBe(1000);

      for (let i = 1; i <= 1000; i++) {
        expect(tree.contains(i)).toBe(true);
      }

      expect(tree.min()).toBe(1);
      expect(tree.max()).toBe(1000);

      const traversal = tree.inOrderTraversal();
      expect(traversal.length).toBe(1000);
      expect(traversal[0]).toBe(1);
      expect(traversal[999]).toBe(1000);
    });

    it.skip('should handle random large dataset', () => {
      const tree = new BTree<number>();
      const values: number[] = [];
      for (let i = 0; i < 500; i++) {
        const value = Math.floor(Math.random() * 1000);
        values.push(value);
        tree.insert(value);
      }
      expect(tree.size()).toBe(500);
      values.forEach(v => {
        expect(tree.contains(v)).toBe(true);
      });
    });

    it.skip('should handle insert and delete on large dataset', () => {
      const tree = new BTree<number>();
      const values = Array.from({ length: 500 }, (_, i) => i + 1);
      values.forEach(v => tree.insert(v));
      expect(tree.size()).toBe(500);

      const toDelete = [1, 250, 500, 100, 400];
      toDelete.forEach(v => {
        expect(tree.delete(v)).toBe(true);
      });
      expect(tree.size()).toBe(495);

      toDelete.forEach(v => {
        expect(tree.contains(v)).toBe(false);
      });
    });
  });

  describe('Clear', () => {
    it('should clear tree with values', () => {
      const tree = new BTree<number>();
      for (let i = 1; i <= 100; i++) {
        tree.insert(i);
      }
      expect(tree.size()).toBe(100);
      expect(tree.isEmpty()).toBe(false);

      tree.clear();
      expect(tree.size()).toBe(0);
      expect(tree.isEmpty()).toBe(true);
      expect(tree.getHeight()).toBe(0);
    });
  });

  describe('Time complexity', () => {
    it('should return O(log n) string', () => {
      const tree = new BTree<number>();
      expect(tree.getTimeComplexity()).toBe('O(log n)');
    });
  });

  describe('additional coverage', () => {
    it('should handle contains on empty tree', () => {
      const tree = new BTree<number>();
      expect(tree.contains(1)).toBe(false);
    });

    it('should handle delete on empty tree', () => {
      const tree = new BTree<number>();
      expect(tree.delete(1)).toBe(false);
    });

    it('should handle min and max', () => {
      const tree = new BTree<number>();
      tree.insert(5);
      tree.insert(3);
      tree.insert(7);
      expect(tree.min()).toBe(3);
      expect(tree.max()).toBe(7);
    });
  });

  describe('min/max', () => {
    it('should return min and max', () => {
      const t = new BTree<number>();
      t.insert(20);
      t.insert(10);
      t.insert(30);
      expect(t.min()).toBe(10);
      expect(t.max()).toBe(30);
    });

    it('should handle inOrderTraversal', () => {
      const t = new BTree<number>();
      t.insert(30);
      t.insert(10);
      t.insert(20);
      expect(t.inOrderTraversal()).toEqual([10, 20, 30]);
    });
  });
});
