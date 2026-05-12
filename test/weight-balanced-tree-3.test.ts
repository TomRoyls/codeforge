import { describe, it, expect } from 'vitest';
import { WeightBalancedTree3 } from './src/core/weight-balanced-tree-3/index.js';

describe('WeightBalancedTree3 - Basic Insert and Search', () => {
  it('should insert and search for single element', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    expect(tree.search(5)).toBe(true);
  });

  it('should insert and search for multiple elements', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.search(5)).toBe(true);
    expect(tree.search(3)).toBe(true);
    expect(tree.search(7)).toBe(true);
  });

  it('should return false for non-existent element', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    expect(tree.search(10)).toBe(false);
  });

  it('should handle sequential inserts', () => {
    const tree = new WeightBalancedTree3<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 10; i++) {
      expect(tree.search(i)).toBe(true);
    }
  });

  it('should handle reverse sequential inserts', () => {
    const tree = new WeightBalancedTree3<number>();
    for (let i = 10; i >= 1; i--) {
      tree.insert(i);
    }
    for (let i = 1; i <= 10; i++) {
      expect(tree.search(i)).toBe(true);
    }
  });

  it('should handle random inserts', () => {
    const tree = new WeightBalancedTree3<number>();
    const values = [5, 3, 7, 2, 4, 6, 8, 1, 9, 10];
    values.forEach(v => tree.insert(v));
    values.forEach(v => expect(tree.search(v)).toBe(true));
  });
});

describe('WeightBalancedTree3 - Delete Operations', () => {
  it('should delete single element', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.delete(5);
    expect(tree.search(5)).toBe(false);
  });

  it('should delete leaf node', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.delete(3);
    expect(tree.search(3)).toBe(false);
    expect(tree.search(5)).toBe(true);
    expect(tree.search(7)).toBe(true);
  });

  it('should delete node with one child', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(4);
    tree.delete(3);
    expect(tree.search(3)).toBe(false);
    expect(tree.search(4)).toBe(true);
    expect(tree.search(5)).toBe(true);
  });

  it('should delete node with two children', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(6);
    tree.insert(8);
    tree.delete(7);
    expect(tree.search(7)).toBe(false);
    expect(tree.search(6)).toBe(true);
    expect(tree.search(8)).toBe(true);
  });

  it('should delete then search correctly', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.delete(5);
    expect(tree.search(5)).toBe(false);
    expect(tree.search(3)).toBe(true);
    expect(tree.search(7)).toBe(true);
  });

  it('should delete non-existent element without error', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.delete(10);
    expect(tree.search(5)).toBe(true);
  });

  it('should handle multiple deletes', () => {
    const tree = new WeightBalancedTree3<number>();
    [5, 3, 7, 2, 4, 6, 8].forEach(v => tree.insert(v));
    tree.delete(5);
    tree.delete(3);
    tree.delete(7);
    expect(tree.search(5)).toBe(false);
    expect(tree.search(3)).toBe(false);
    expect(tree.search(7)).toBe(false);
    expect(tree.search(2)).toBe(true);
    expect(tree.search(4)).toBe(true);
  });
});

describe('WeightBalancedTree3 - Contains Method', () => {
  it('should return true for existing element', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    expect(tree.contains(5)).toBe(true);
  });

  it('should return false for non-existent element', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    expect(tree.contains(10)).toBe(false);
  });

  it('should work with multiple elements', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.contains(5)).toBe(true);
    expect(tree.contains(3)).toBe(true);
    expect(tree.contains(7)).toBe(true);
    expect(tree.contains(10)).toBe(false);
  });
});

describe('WeightBalancedTree3 - Min and Max', () => {
  it('should return null for empty tree min', () => {
    const tree = new WeightBalancedTree3<number>();
    expect(tree.min()).toBe(null);
  });

  it('should return null for empty tree max', () => {
    const tree = new WeightBalancedTree3<number>();
    expect(tree.max()).toBe(null);
  });

  it('should return single element for min and max', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    expect(tree.min()).toBe(5);
    expect(tree.max()).toBe(5);
  });

  it('should find minimum correctly', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(2);
    tree.insert(4);
    expect(tree.min()).toBe(2);
  });

  it('should find maximum correctly', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(6);
    tree.insert(8);
    expect(tree.max()).toBe(8);
  });

  it('should find min and max after multiple operations', () => {
    const tree = new WeightBalancedTree3<number>();
    [5, 3, 7, 2, 4, 6, 8, 1, 9, 10].forEach(v => tree.insert(v));
    expect(tree.min()).toBe(1);
    expect(tree.max()).toBe(10);
  });
});

describe('WeightBalancedTree3 - Size and isEmpty', () => {
  it('should be empty initially', () => {
    const tree = new WeightBalancedTree3<number>();
    expect(tree.isEmpty()).toBe(true);
    expect(tree.size).toBe(0);
  });

  it('should not be empty after insert', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    expect(tree.isEmpty()).toBe(false);
    expect(tree.size).toBe(1);
  });

  it('should track size correctly', () => {
    const tree = new WeightBalancedTree3<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(10);
  });

  it('should update size after delete', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.delete(5);
    expect(tree.size).toBe(2);
  });

  it('should be empty after clear', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.clear();
    expect(tree.isEmpty()).toBe(true);
    expect(tree.size).toBe(0);
  });

  it('should have size zero after clear', () => {
    const tree = new WeightBalancedTree3<number>();
    [1, 2, 3, 4, 5].forEach(v => tree.insert(v));
    tree.clear();
    expect(tree.size).toBe(0);
  });
});

describe('WeightBalancedTree3 - ToArray', () => {
  it('should return empty array for empty tree', () => {
    const tree = new WeightBalancedTree3<number>();
    expect(tree.toArray()).toEqual([]);
  });

  it('should return single element array', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    expect(tree.toArray()).toEqual([5]);
  });

  it('should return sorted array', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(2);
    tree.insert(4);
    expect(tree.toArray()).toEqual([2, 3, 4, 5, 7]);
  });

  it('should maintain order after multiple operations', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.delete(5);
    tree.insert(6);
    expect(tree.toArray()).toEqual([3, 6, 7]);
  });
});

describe('WeightBalancedTree3 - ForEach', () => {
  it('should iterate over empty tree', () => {
    const tree = new WeightBalancedTree3<number>();
    const values: number[] = [];
    tree.forEach(v => values.push(v));
    expect(values).toEqual([]);
  });

  it('should iterate over single element', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    const values: number[] = [];
    tree.forEach(v => values.push(v));
    expect(values).toEqual([5]);
  });

  it('should iterate over multiple elements', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(2);
    tree.insert(4);
    const values: number[] = [];
    tree.forEach(v => values.push(v));
    expect(values).toEqual([2, 3, 4, 5, 7]);
  });

  it('should apply callback to each element', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    const values: number[] = [];
    tree.forEach(v => values.push(v * 2));
    expect(values).toEqual([6, 10, 14]);
  });
});

describe('WeightBalancedTree3 - Height', () => {
  it('should have height 0 for empty tree', () => {
    const tree = new WeightBalancedTree3<number>();
    expect(tree.height()).toBe(0);
  });

  it('should have height 1 for single element', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    expect(tree.height()).toBe(1);
  });

  it('should have height 2 for three elements', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.height()).toBe(2);
  });

  it('should maintain O(log n) height for many elements', () => {
    const tree = new WeightBalancedTree3<number>();
    for (let i = 1; i <= 1000; i++) {
      tree.insert(i);
    }
    const expectedMaxHeight = Math.ceil(Math.log2(1000)) + 2;
    expect(tree.height()).toBeLessThanOrEqual(expectedMaxHeight);
  });

  it('should have reasonable height after random inserts', () => {
    const tree = new WeightBalancedTree3<number>();
    const values = [5, 3, 7, 2, 4, 6, 8, 1, 9, 10];
    values.forEach(v => tree.insert(v));
    expect(tree.height()).toBeLessThanOrEqual(4);
  });
});

describe('WeightBalancedTree3 - Custom Comparator', () => {
  it('should work with custom comparator for strings', () => {
    const tree = new WeightBalancedTree3<string>((a, b) => a.localeCompare(b));
    tree.insert('banana');
    tree.insert('apple');
    tree.insert('cherry');
    expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry']);
  });

  it('should work with reverse comparator', () => {
    const tree = new WeightBalancedTree3<number>((a, b) => b - a);
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.toArray()).toEqual([7, 5, 3]);
  });

  it('should work with object comparator', () => {
    interface Item {
      id: number;
      value: string;
    }
    const tree = new WeightBalancedTree3<Item>((a, b) => a.id - b.id);
    tree.insert({ id: 2, value: 'b' });
    tree.insert({ id: 1, value: 'a' });
    tree.insert({ id: 3, value: 'c' });
    const result = tree.toArray();
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
    expect(result[2].id).toBe(3);
  });
});

describe('WeightBalancedTree3 - Edge Cases', () => {
  it('should handle duplicate inserts gracefully', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.insert(5);
    expect(tree.size).toBe(2);
  });

  it('should handle large number of elements', () => {
    const tree = new WeightBalancedTree3<number>();
    for (let i = 1; i <= 10000; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(10000);
    expect(tree.height()).toBeLessThanOrEqual(20);
  });

  it('should maintain structure after insert-delete-insert', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(5);
    tree.delete(5);
    tree.insert(5);
    expect(tree.search(5)).toBe(true);
  });

  it('should handle negative numbers', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(-5);
    tree.insert(-3);
    tree.insert(-7);
    expect(tree.min()).toBe(-7);
    expect(tree.max()).toBe(-3);
  });

  it('should handle zero', () => {
    const tree = new WeightBalancedTree3<number>();
    tree.insert(0);
    tree.insert(-1);
    tree.insert(1);
    expect(tree.min()).toBe(-1);
    expect(tree.max()).toBe(1);
  });

  it('should work with custom alpha parameter', () => {
    const tree = new WeightBalancedTree3<number>(undefined, 0.5);
    for (let i = 1; i <= 100; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(100);
    expect(tree.height()).toBeLessThanOrEqual(20);
  });
});
