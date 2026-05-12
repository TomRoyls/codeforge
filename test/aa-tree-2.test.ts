import { describe, it, expect } from 'vitest';
import { AATree2 } from './src/core/aa-tree-2/index.js';

describe('AATree2 - Empty Tree', () => {
  it('should create an empty tree', () => {
    const tree = new AATree2<number>();
    expect(tree.size).toBe(0);
  });

  it('should return true for isEmpty on empty tree', () => {
    const tree = new AATree2<number>();
    expect(tree.isEmpty()).toBe(true);
  });

  it('should return false for contains on empty tree', () => {
    const tree = new AATree2<number>();
    expect(tree.contains(5)).toBe(false);
  });

  it('should return false for search on empty tree', () => {
    const tree = new AATree2<number>();
    expect(tree.search(5)).toBe(false);
  });

  it('should return null for min on empty tree', () => {
    const tree = new AATree2<number>();
    expect(tree.min()).toBe(null);
  });

  it('should return null for max on empty tree', () => {
    const tree = new AATree2<number>();
    expect(tree.max()).toBe(null);
  });

  it('should return empty array for toArray on empty tree', () => {
    const tree = new AATree2<number>();
    expect(tree.toArray()).toEqual([]);
  });

  it('should return 0 for height on empty tree', () => {
    const tree = new AATree2<number>();
    expect(tree.height()).toBe(0);
  });

  it('should not fail when clearing an empty tree', () => {
    const tree = new AATree2<number>();
    tree.clear();
    expect(tree.size).toBe(0);
  });

  it('should not fail when deleting from empty tree', () => {
    const tree = new AATree2<number>();
    tree.delete(5);
    expect(tree.size).toBe(0);
  });
});

describe('AATree2 - Single Element', () => {
  it('should insert single element', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    expect(tree.size).toBe(1);
  });

  it('should return false for isEmpty after insert', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    expect(tree.isEmpty()).toBe(false);
  });

  it('should find inserted element with contains', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    expect(tree.contains(5)).toBe(true);
  });

  it('should find inserted element with search', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    expect(tree.search(5)).toBe(true);
  });

  it('should return min for single element', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    expect(tree.min()).toBe(5);
  });

  it('should return max for single element', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    expect(tree.max()).toBe(5);
  });

  it('should return array with single element', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    expect(tree.toArray()).toEqual([5]);
  });

  it('should return 1 for height with single element', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    expect(tree.height()).toBe(1);
  });

  it('should not insert duplicate element', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(5);
    expect(tree.size).toBe(1);
  });

  it('should delete single element', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.delete(5);
    expect(tree.size).toBe(0);
  });
});

describe('AATree2 - Multiple Elements', () => {
  it('should insert multiple elements', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.size).toBe(3);
  });

  it('should find all inserted elements', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.contains(5)).toBe(true);
    expect(tree.contains(3)).toBe(true);
    expect(tree.contains(7)).toBe(true);
  });

  it('should return correct min', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.min()).toBe(3);
  });

  it('should return correct max', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.max()).toBe(7);
  });

  it('should return sorted array', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(1);
    tree.insert(9);
    expect(tree.toArray()).toEqual([1, 3, 5, 7, 9]);
  });

  it('should not find non-existent elements', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.contains(10)).toBe(false);
    expect(tree.contains(0)).toBe(false);
  });

  it('should delete middle element', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.delete(5);
    expect(tree.size).toBe(2);
    expect(tree.contains(5)).toBe(false);
    expect(tree.contains(3)).toBe(true);
    expect(tree.contains(7)).toBe(true);
  });

  it('should delete min element', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.delete(3);
    expect(tree.size).toBe(2);
    expect(tree.contains(3)).toBe(false);
    expect(tree.min()).toBe(5);
  });

  it('should delete max element', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.delete(7);
    expect(tree.size).toBe(2);
    expect(tree.contains(7)).toBe(false);
    expect(tree.max()).toBe(5);
  });

  it('should clear all elements', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.clear();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });
});

describe('AATree2 - Sequential Inserts', () => {
  it('should handle sequential increasing inserts', () => {
    const tree = new AATree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(10);
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should handle sequential decreasing inserts', () => {
    const tree = new AATree2<number>();
    for (let i = 10; i >= 1; i--) {
      tree.insert(i);
    }
    expect(tree.size).toBe(10);
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should maintain balance on sequential inserts', () => {
    const tree = new AATree2<number>();
    for (let i = 1; i <= 20; i++) {
      tree.insert(i);
    }
    const height = tree.height();
    expect(height).toBeLessThanOrEqual(8);
  });
});

describe('AATree2 - Random Inserts', () => {
  it('should handle random inserts', () => {
    const tree = new AATree2<number>();
    const values = [15, 3, 8, 10, 20, 25, 1, 12, 6, 18];
    for (const v of values) {
      tree.insert(v);
    }
    expect(tree.size).toBe(10);
    expect(tree.toArray().length).toBe(10);
  });

  it('should find all randomly inserted values', () => {
    const tree = new AATree2<number>();
    const values = [15, 3, 8, 10, 20, 25, 1, 12, 6, 18];
    for (const v of values) {
      tree.insert(v);
    }
    for (const v of values) {
      expect(tree.contains(v)).toBe(true);
    }
  });

  it('should maintain sorted order after random inserts', () => {
    const tree = new AATree2<number>();
    const values = [15, 3, 8, 10, 20, 25, 1, 12, 6, 18];
    for (const v of values) {
      tree.insert(v);
    }
    const sorted = [...values].sort((a, b) => a - b);
    expect(tree.toArray()).toEqual(sorted);
  });

  it('should maintain balance after random inserts', () => {
    const tree = new AATree2<number>();
    const values = [15, 3, 8, 10, 20, 25, 1, 12, 6, 18, 30, 5, 22, 2, 14];
    for (const v of values) {
      tree.insert(v);
    }
    const height = tree.height();
    expect(height).toBeLessThanOrEqual(6);
  });
});

describe('AATree2 - Delete Then Search', () => {
  it('should not find element after deletion', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.delete(5);
    expect(tree.contains(5)).toBe(false);
  });

  it('should still find other elements after deletion', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.delete(5);
    expect(tree.contains(3)).toBe(true);
    expect(tree.contains(7)).toBe(true);
  });

  it('should delete and insert again', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.delete(5);
    tree.insert(5);
    expect(tree.contains(5)).toBe(true);
  });

  it('should delete non-existent element without error', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.delete(10);
    expect(tree.size).toBe(2);
  });

  it('should delete all elements', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.delete(5);
    tree.delete(3);
    tree.delete(7);
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });
});

describe('AATree2 - Height Balance', () => {
  it('should maintain O(log n) height', () => {
    const tree = new AATree2<number>();
    for (let i = 1; i <= 100; i++) {
      tree.insert(i);
    }
    const n = tree.size;
    const maxHeight = Math.floor(2 * Math.log2(n + 1));
    expect(tree.height()).toBeLessThanOrEqual(maxHeight);
  });

  it('should maintain balance after many operations', () => {
    const tree = new AATree2<number>();
    for (let i = 1; i <= 50; i++) {
      tree.insert(i);
    }
    for (let i = 2; i <= 50; i += 2) {
      tree.delete(i);
    }
    const n = tree.size;
    const maxHeight = Math.floor(2 * Math.log2(n + 1));
    expect(tree.height()).toBeLessThanOrEqual(maxHeight);
  });

  it('should maintain balance on alternating inserts/deletes', () => {
    const tree = new AATree2<number>();
    for (let i = 1; i <= 30; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 10; i++) {
      tree.delete(i);
    }
    for (let i = 31; i <= 40; i++) {
      tree.insert(i);
    }
    const n = tree.size;
    const maxHeight = Math.floor(2 * Math.log2(n + 1));
    expect(tree.height()).toBeLessThanOrEqual(maxHeight);
  });
});

describe('AATree2 - forEach', () => {
  it('should iterate over all elements', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    const values: number[] = [];
    tree.forEach((value) => values.push(value));
    expect(values).toEqual([3, 5, 7]);
  });

  it('should call with correct indices', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    const indices: number[] = [];
    tree.forEach((_, index) => indices.push(index));
    expect(indices).toEqual([0, 1, 2]);
  });

  it('should not iterate on empty tree', () => {
    const tree = new AATree2<number>();
    let count = 0;
    tree.forEach(() => count++);
    expect(count).toBe(0);
  });
});

describe('AATree2 - Custom Comparator', () => {
  it('should work with custom comparator for strings', () => {
    const tree = new AATree2<string>((a, b) => a.localeCompare(b));
    tree.insert('banana');
    tree.insert('apple');
    tree.insert('cherry');
    expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry']);
  });

  it('should work with custom comparator for objects', () => {
    interface Item {
      id: number;
      name: string;
    }
    const tree = new AATree2<Item>((a, b) => a.id - b.id);
    tree.insert({ id: 3, name: 'c' });
    tree.insert({ id: 1, name: 'a' });
    tree.insert({ id: 2, name: 'b' });
    expect(tree.toArray().map((i) => i.id)).toEqual([1, 2, 3]);
  });

  it('should handle reverse order with custom comparator', () => {
    const tree = new AATree2<number>((a, b) => b - a);
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    expect(tree.toArray()).toEqual([3, 2, 1]);
  });
});

describe('AATree2 - Large Dataset', () => {
  it('should handle 1000 sequential inserts', () => {
    const tree = new AATree2<number>();
    for (let i = 1; i <= 1000; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(1000);
    expect(tree.toArray().length).toBe(1000);
  });

  it('should maintain O(log n) height with 1000 elements', () => {
    const tree = new AATree2<number>();
    for (let i = 1; i <= 1000; i++) {
      tree.insert(i);
    }
    const n = tree.size;
    const maxHeight = Math.floor(2 * Math.log2(n + 1));
    expect(tree.height()).toBeLessThanOrEqual(maxHeight);
  });

  it('should delete all 1000 elements', () => {
    const tree = new AATree2<number>();
    for (let i = 1; i <= 1000; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 1000; i++) {
      tree.delete(i);
    }
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });
});

describe('AATree2 - Edge Cases', () => {
  it('should handle negative numbers', () => {
    const tree = new AATree2<number>();
    tree.insert(-5);
    tree.insert(-3);
    tree.insert(-7);
    expect(tree.toArray()).toEqual([-7, -5, -3]);
  });

  it('should handle zero', () => {
    const tree = new AATree2<number>();
    tree.insert(0);
    expect(tree.contains(0)).toBe(true);
  });

  it('should handle mix of negative and positive', () => {
    const tree = new AATree2<number>();
    tree.insert(-5);
    tree.insert(5);
    tree.insert(0);
    expect(tree.toArray()).toEqual([-5, 0, 5]);
  });

  it('should return null for min after all deletes', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.delete(5);
    expect(tree.min()).toBe(null);
  });

  it('should return null for max after all deletes', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.delete(5);
    expect(tree.max()).toBe(null);
  });

  it('should return empty array for toArray after all deletes', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.delete(5);
    expect(tree.toArray()).toEqual([]);
  });

  it('should return 0 for height after all deletes', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.delete(5);
    expect(tree.height()).toBe(0);
  });
});

describe('AATree2 - Duplicate Handling', () => {
  it('should not increase size on duplicate insert', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(5);
    tree.insert(5);
    expect(tree.size).toBe(1);
  });

  it('should only delete one instance of duplicate', () => {
    const tree = new AATree2<number>();
    tree.insert(5);
    tree.insert(5);
    tree.delete(5);
    expect(tree.contains(5)).toBe(true);
  });

  it('should maintain tree after duplicate operations', () => {
    const tree = new AATree2<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    tree.insert(2);
    tree.delete(2);
    tree.delete(2);
    expect(tree.contains(2)).toBe(false);
    expect(tree.contains(1)).toBe(true);
    expect(tree.contains(3)).toBe(true);
  });
});
