import { describe, it, expect } from 'vitest';
import { AVLTree3 } from '../../src/core/avl-tree-3/index.js';

// ─── Constructor ───

describe('AVLTree3 constructor', () => {
  it('creates an empty tree with default comparator', () => {
    const tree = new AVLTree3<number>();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('creates a tree with custom comparator', () => {
    const tree = new AVLTree3<string>((a, b) => a.localeCompare(b));
    expect(tree).toBeInstanceOf(AVLTree3);
    expect(tree.size).toBe(0);
  });
});

// ─── insert() ───

describe('AVLTree3 insert', () => {
  it('inserts a single value', () => {
    const tree = new AVLTree3<number>();
    tree.insert(5);
    expect(tree.size).toBe(1);
    expect(tree.contains(5)).toBe(true);
  });

  it('does not increase size on duplicate insert', () => {
    const tree = new AVLTree3<number>();
    tree.insert(5);
    tree.insert(5);
    expect(tree.size).toBe(1);
  });

  it('inserts multiple values', () => {
    const tree = new AVLTree3<number>();
    tree.insert(3);
    tree.insert(1);
    tree.insert(2);
    expect(tree.size).toBe(3);
  });

  it('maintains sorted order after sequential inserts', () => {
    const tree = new AVLTree3<number>();
    for (let i = 10; i >= 0; i--) {
      tree.insert(i);
    }
    expect(tree.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});

// ─── search() / contains() ───

describe('AVLTree3 search and contains', () => {
  it('finds an existing value', () => {
    const tree = new AVLTree3<number>();
    tree.insert(42);
    expect(tree.search(42)).toBe(true);
    expect(tree.contains(42)).toBe(true);
  });

  it('returns false for missing value', () => {
    const tree = new AVLTree3<number>();
    tree.insert(1);
    expect(tree.search(99)).toBe(false);
    expect(tree.contains(99)).toBe(false);
  });

  it('returns false on empty tree', () => {
    const tree = new AVLTree3<number>();
    expect(tree.search(1)).toBe(false);
  });
});

// ─── delete() ───

describe('AVLTree3 delete', () => {
  it('deletes a value from the tree', () => {
    const tree = new AVLTree3<number>();
    tree.insert(5);
    tree.delete(5);
    expect(tree.contains(5)).toBe(false);
    expect(tree.size).toBe(0);
  });

  it('does nothing when deleting missing value', () => {
    const tree = new AVLTree3<number>();
    tree.insert(1);
    tree.delete(99);
    expect(tree.size).toBe(1);
  });

  it('maintains sorted order after deletions', () => {
    const tree = new AVLTree3<number>();
    [5, 3, 7, 1, 4, 6, 8].forEach(v => tree.insert(v));
    tree.delete(3);
    tree.delete(7);
    expect(tree.toArray()).toEqual([1, 4, 5, 6, 8]);
  });

  it('handles deleting all elements', () => {
    const tree = new AVLTree3<number>();
    [1, 2, 3].forEach(v => tree.insert(v));
    tree.delete(2);
    tree.delete(1);
    tree.delete(3);
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });
});

// ─── min() / max() ───

describe('AVLTree3 min and max', () => {
  it('returns null for empty tree', () => {
    const tree = new AVLTree3<number>();
    expect(tree.min()).toBeNull();
    expect(tree.max()).toBeNull();
  });

  it('returns min value', () => {
    const tree = new AVLTree3<number>();
    [5, 2, 8, 1, 3].forEach(v => tree.insert(v));
    expect(tree.min()).toBe(1);
  });

  it('returns max value', () => {
    const tree = new AVLTree3<number>();
    [5, 2, 8, 1, 3].forEach(v => tree.insert(v));
    expect(tree.max()).toBe(8);
  });

  it('updates min after deletion', () => {
    const tree = new AVLTree3<number>();
    [1, 2, 3].forEach(v => tree.insert(v));
    tree.delete(1);
    expect(tree.min()).toBe(2);
  });

  it('updates max after deletion', () => {
    const tree = new AVLTree3<number>();
    [1, 2, 3].forEach(v => tree.insert(v));
    tree.delete(3);
    expect(tree.max()).toBe(2);
  });
});

// ─── size / isEmpty ───

describe('AVLTree3 size and isEmpty', () => {
  it('tracks size correctly', () => {
    const tree = new AVLTree3<number>();
    expect(tree.isEmpty()).toBe(true);
    tree.insert(1);
    expect(tree.isEmpty()).toBe(false);
    expect(tree.size).toBe(1);
  });
});

// ─── clear() ───

describe('AVLTree3 clear', () => {
  it('clears all values', () => {
    const tree = new AVLTree3<number>();
    [1, 2, 3].forEach(v => tree.insert(v));
    tree.clear();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
    expect(tree.toArray()).toEqual([]);
  });
});

// ─── toArray() ───

describe('AVLTree3 toArray', () => {
  it('returns sorted array', () => {
    const tree = new AVLTree3<number>();
    [3, 1, 2].forEach(v => tree.insert(v));
    expect(tree.toArray()).toEqual([1, 2, 3]);
  });

  it('returns empty array for empty tree', () => {
    const tree = new AVLTree3<number>();
    expect(tree.toArray()).toEqual([]);
  });
});

// ─── forEach() ───

describe('AVLTree3 forEach', () => {
  it('iterates in sorted order', () => {
    const tree = new AVLTree3<number>();
    [3, 1, 2].forEach(v => tree.insert(v));
    const result: number[] = [];
    tree.forEach(v => result.push(v));
    expect(result).toEqual([1, 2, 3]);
  });

  it('does not iterate on empty tree', () => {
    const tree = new AVLTree3<number>();
    const result: number[] = [];
    tree.forEach(v => result.push(v));
    expect(result).toEqual([]);
  });
});

// ─── height() ───

describe('AVLTree3 height', () => {
  it('returns 0 for empty tree', () => {
    const tree = new AVLTree3<number>();
    expect(tree.height()).toBe(0);
  });

  it('returns 1 for single node', () => {
    const tree = new AVLTree3<number>();
    tree.insert(1);
    expect(tree.height()).toBe(1);
  });

  it('grows logarithmically', () => {
    const tree = new AVLTree3<number>();
    for (let i = 0; i < 100; i++) {
      tree.insert(i);
    }
    expect(tree.height()).toBeLessThan(10);
  });
});

// ─── Edge cases ───

describe('AVLTree3 edge cases', () => {
  it('works with string values', () => {
    const tree = new AVLTree3<string>((a, b) => a.localeCompare(b));
    tree.insert('cherry');
    tree.insert('apple');
    tree.insert('banana');
    expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry']);
  });

  it('handles negative numbers', () => {
    const tree = new AVLTree3<number>();
    [-5, -1, -3, 0, 2].forEach(v => tree.insert(v));
    expect(tree.toArray()).toEqual([-5, -3, -1, 0, 2]);
  });
});
