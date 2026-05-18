import { describe, it, expect } from 'vitest';
import { AVLTree4 } from '../../src/core/avl-tree-4/index.js';

// ─── Constructor ───

describe('AVLTree4 constructor', () => {
  it('creates an empty tree with default comparator', () => {
    const tree = new AVLTree4<number>();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty).toBe(true);
  });

  it('creates a tree with custom comparator', () => {
    const tree = new AVLTree4<string>((a, b) => a.localeCompare(b));
    expect(tree).toBeInstanceOf(AVLTree4);
    expect(tree.size).toBe(0);
  });
});

// ─── insert() ───

describe('AVLTree4 insert', () => {
  it('inserts a single value', () => {
    const tree = new AVLTree4<number>();
    tree.insert(5);
    expect(tree.size).toBe(1);
    expect(tree.search(5)).toBe(true);
  });

  it('does not increase size on duplicate insert', () => {
    const tree = new AVLTree4<number>();
    tree.insert(5);
    tree.insert(5);
    expect(tree.size).toBe(1);
  });

  it('inserts multiple values in sorted order', () => {
    const tree = new AVLTree4<number>();
    [3, 1, 2].forEach(v => tree.insert(v));
    expect(tree.toArray()).toEqual([1, 2, 3]);
    expect(tree.size).toBe(3);
  });

  it('maintains sorted order for sequential inserts', () => {
    const tree = new AVLTree4<number>();
    for (let i = 10; i >= 0; i--) tree.insert(i);
    expect(tree.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});

// ─── search() / contains() ───

describe('AVLTree4 search and contains', () => {
  it('finds existing value', () => {
    const tree = new AVLTree4<number>();
    tree.insert(42);
    expect(tree.search(42)).toBe(true);
    expect(tree.contains(42)).toBe(true);
  });

  it('returns false for missing value', () => {
    const tree = new AVLTree4<number>();
    expect(tree.search(99)).toBe(false);
    expect(tree.contains(99)).toBe(false);
  });

  it('returns false on empty tree', () => {
    const tree = new AVLTree4<number>();
    expect(tree.search(1)).toBe(false);
  });
});

// ─── remove() ───

describe('AVLTree4 remove', () => {
  it('removes an existing value', () => {
    const tree = new AVLTree4<number>();
    tree.insert(5);
    expect(tree.remove(5)).toBe(true);
    expect(tree.search(5)).toBe(false);
    expect(tree.size).toBe(0);
  });

  it('returns false for missing value', () => {
    const tree = new AVLTree4<number>();
    expect(tree.remove(99)).toBe(false);
  });

  it('maintains sorted order after removals', () => {
    const tree = new AVLTree4<number>();
    [5, 3, 7, 1, 4, 6, 8].forEach(v => tree.insert(v));
    tree.remove(3);
    tree.remove(7);
    expect(tree.toArray()).toEqual([1, 4, 5, 6, 8]);
  });

  it('handles removing all elements', () => {
    const tree = new AVLTree4<number>();
    [1, 2, 3].forEach(v => tree.insert(v));
    expect(tree.remove(2)).toBe(true);
    expect(tree.remove(1)).toBe(true);
    expect(tree.remove(3)).toBe(true);
    expect(tree.size).toBe(0);
    expect(tree.isEmpty).toBe(true);
  });
});

// ─── min() / max() ───

describe('AVLTree4 min and max', () => {
  it('returns undefined for empty tree', () => {
    const tree = new AVLTree4<number>();
    expect(tree.min()).toBeUndefined();
    expect(tree.max()).toBeUndefined();
  });

  it('returns min value', () => {
    const tree = new AVLTree4<number>();
    [5, 2, 8, 1, 3].forEach(v => tree.insert(v));
    expect(tree.min()).toBe(1);
  });

  it('returns max value', () => {
    const tree = new AVLTree4<number>();
    [5, 2, 8, 1, 3].forEach(v => tree.insert(v));
    expect(tree.max()).toBe(8);
  });

  it('updates min after removal', () => {
    const tree = new AVLTree4<number>();
    [1, 2, 3].forEach(v => tree.insert(v));
    tree.remove(1);
    expect(tree.min()).toBe(2);
  });

  it('updates max after removal', () => {
    const tree = new AVLTree4<number>();
    [1, 2, 3].forEach(v => tree.insert(v));
    tree.remove(3);
    expect(tree.max()).toBe(2);
  });
});

// ─── size / isEmpty ───

describe('AVLTree4 size and isEmpty', () => {
  it('tracks size correctly', () => {
    const tree = new AVLTree4<number>();
    expect(tree.isEmpty).toBe(true);
    tree.insert(1);
    expect(tree.isEmpty).toBe(false);
    expect(tree.size).toBe(1);
  });
});

// ─── clear() ───

describe('AVLTree4 clear', () => {
  it('clears all values', () => {
    const tree = new AVLTree4<number>();
    [1, 2, 3].forEach(v => tree.insert(v));
    tree.clear();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty).toBe(true);
  });
});

// ─── toArray() ───

describe('AVLTree4 toArray', () => {
  it('returns sorted array', () => {
    const tree = new AVLTree4<number>();
    [3, 1, 2].forEach(v => tree.insert(v));
    expect(tree.toArray()).toEqual([1, 2, 3]);
  });

  it('returns empty array for empty tree', () => {
    const tree = new AVLTree4<number>();
    expect(tree.toArray()).toEqual([]);
  });
});

// ─── forEach() ───

describe('AVLTree4 forEach', () => {
  it('iterates in sorted order', () => {
    const tree = new AVLTree4<number>();
    [3, 1, 2].forEach(v => tree.insert(v));
    const result: number[] = [];
    tree.forEach(v => result.push(v));
    expect(result).toEqual([1, 2, 3]);
  });

  it('does not iterate on empty tree', () => {
    const tree = new AVLTree4<number>();
    const result: number[] = [];
    tree.forEach(v => result.push(v));
    expect(result).toEqual([]);
  });
});

// ─── predecessor() ───

describe('AVLTree4 predecessor', () => {
  it('returns undefined for empty tree', () => {
    const tree = new AVLTree4<number>();
    expect(tree.predecessor(5)).toBeUndefined();
  });

  it('returns the largest value smaller than given', () => {
    const tree = new AVLTree4<number>();
    [1, 3, 5, 7, 9].forEach(v => tree.insert(v));
    expect(tree.predecessor(5)).toBe(3);
    expect(tree.predecessor(7)).toBe(5);
    expect(tree.predecessor(3)).toBe(1);
  });

  it('returns undefined when no smaller value exists', () => {
    const tree = new AVLTree4<number>();
    [1, 2, 3].forEach(v => tree.insert(v));
    expect(tree.predecessor(1)).toBeUndefined();
    expect(tree.predecessor(0)).toBeUndefined();
  });

  it('works for values between nodes', () => {
    const tree = new AVLTree4<number>();
    [1, 5, 10].forEach(v => tree.insert(v));
    expect(tree.predecessor(7)).toBe(5);
    expect(tree.predecessor(3)).toBe(1);
  });
});

// ─── successor() ───

describe('AVLTree4 successor', () => {
  it('returns undefined for empty tree', () => {
    const tree = new AVLTree4<number>();
    expect(tree.successor(5)).toBeUndefined();
  });

  it('returns the smallest value larger than given', () => {
    const tree = new AVLTree4<number>();
    [1, 3, 5, 7, 9].forEach(v => tree.insert(v));
    expect(tree.successor(5)).toBe(7);
    expect(tree.successor(3)).toBe(5);
    expect(tree.successor(7)).toBe(9);
  });

  it('returns undefined when no larger value exists', () => {
    const tree = new AVLTree4<number>();
    [1, 2, 3].forEach(v => tree.insert(v));
    expect(tree.successor(3)).toBeUndefined();
    expect(tree.successor(100)).toBeUndefined();
  });

  it('works for values between nodes', () => {
    const tree = new AVLTree4<number>();
    [1, 5, 10].forEach(v => tree.insert(v));
    expect(tree.successor(3)).toBe(5);
    expect(tree.successor(7)).toBe(10);
  });
});

// ─── rangeSearch() ───

describe('AVLTree4 rangeSearch', () => {
  it('returns values within range', () => {
    const tree = new AVLTree4<number>();
    [1, 3, 5, 7, 9].forEach(v => tree.insert(v));
    expect(tree.rangeSearch(3, 7)).toEqual([3, 5, 7]);
  });

  it('returns empty for range with no values', () => {
    const tree = new AVLTree4<number>();
    [1, 2, 3].forEach(v => tree.insert(v));
    expect(tree.rangeSearch(10, 20)).toEqual([]);
  });

  it('returns single value at boundary', () => {
    const tree = new AVLTree4<number>();
    [1, 5, 10].forEach(v => tree.insert(v));
    expect(tree.rangeSearch(5, 5)).toEqual([5]);
  });

  it('returns all values for full range', () => {
    const tree = new AVLTree4<number>();
    [1, 2, 3].forEach(v => tree.insert(v));
    expect(tree.rangeSearch(1, 3)).toEqual([1, 2, 3]);
  });
});

// ─── height() / getHeight() ───

describe('AVLTree4 height', () => {
  it('returns 0 for empty tree', () => {
    const tree = new AVLTree4<number>();
    expect(tree.height()).toBe(0);
    expect(tree.getHeight()).toBe(0);
  });

  it('returns 1 for single node', () => {
    const tree = new AVLTree4<number>();
    tree.insert(1);
    expect(tree.height()).toBe(1);
  });

  it('grows logarithmically', () => {
    const tree = new AVLTree4<number>();
    for (let i = 0; i < 100; i++) tree.insert(i);
    expect(tree.height()).toBeLessThan(10);
  });
});

// ─── _isBalanced() ───

describe('AVLTree4 _isBalanced', () => {
  it('empty tree is balanced', () => {
    const tree = new AVLTree4<number>();
    expect(tree._isBalanced()).toBe(true);
  });

  it('single node is balanced', () => {
    const tree = new AVLTree4<number>();
    tree.insert(1);
    expect(tree._isBalanced()).toBe(true);
  });

  it('remains balanced after many insertions', () => {
    const tree = new AVLTree4<number>();
    for (let i = 0; i < 50; i++) tree.insert(i);
    expect(tree._isBalanced()).toBe(true);
  });

  it('remains balanced after deletions', () => {
    const tree = new AVLTree4<number>();
    for (let i = 0; i < 20; i++) tree.insert(i);
    for (let i = 0; i < 10; i++) tree.remove(i);
    expect(tree._isBalanced()).toBe(true);
  });
});

// ─── Edge cases ───

describe('AVLTree4 edge cases', () => {
  it('works with string values', () => {
    const tree = new AVLTree4<string>((a, b) => a.localeCompare(b));
    tree.insert('cherry');
    tree.insert('apple');
    tree.insert('banana');
    expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry']);
  });

  it('handles negative numbers', () => {
    const tree = new AVLTree4<number>();
    [-5, -1, -3, 0, 2].forEach(v => tree.insert(v));
    expect(tree.toArray()).toEqual([-5, -3, -1, 0, 2]);
  });
});
