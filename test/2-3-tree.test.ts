import { describe, it, expect, beforeEach } from 'vitest';
import { TwoThreeTree } from '../src/core/2-3-tree';

describe('TwoThreeTree - Empty Tree', () => {
  let tree: TwoThreeTree<number>;

  beforeEach(() => {
    tree = new TwoThreeTree<number>();
  });

  it('should have size 0', () => {
    expect(tree.size()).toBe(0);
  });

  it('should be empty', () => {
    expect(tree.isEmpty()).toBe(true);
  });

  it('should not contain any values', () => {
    expect(tree.contains(5)).toBe(false);
    expect(tree.search(10)).toBe(false);
  });

  it('should return undefined for min and max', () => {
    expect(tree.min()).toBeUndefined();
    expect(tree.max()).toBeUndefined();
  });

  it('should return empty array for traversal', () => {
    expect(tree.inOrderTraversal()).toEqual([]);
    expect(tree.toArray()).toEqual([]);
  });

  it('should have height 0', () => {
    expect(tree.getHeight()).toBe(0);
  });

  it('should return O(1) for time complexity', () => {
    expect(tree.getTimeComplexity()).toBe('O(1)');
  });

  it('should clear without error', () => {
    expect(tree.clear()).toBeUndefined();
    expect(tree.size()).toBe(0);
  });
});

describe('TwoThreeTree - Insert', () => {
  let tree: TwoThreeTree<number>;

  beforeEach(() => {
    tree = new TwoThreeTree<number>();
  });

  it('should insert single value', () => {
    tree.insert(5);
    expect(tree.size()).toBe(1);
    expect(tree.contains(5)).toBe(true);
  });

  it('should insert multiple values', () => {
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.size()).toBe(3);
    expect(tree.contains(5)).toBe(true);
    expect(tree.contains(3)).toBe(true);
    expect(tree.contains(7)).toBe(true);
  });

  it('should handle duplicate values', () => {
    tree.insert(5);
    tree.insert(5);
    expect(tree.size()).toBe(1);
    expect(tree.contains(5)).toBe(true);
  });

  it('should insert in sorted order', () => {
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    expect(tree.size()).toBe(10);
    expect(tree.inOrderTraversal()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should insert in reverse order', () => {
    for (let i = 10; i >= 1; i--) {
      tree.insert(i);
    }
    expect(tree.size()).toBe(10);
    expect(tree.inOrderTraversal()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should insert in random order', () => {
    const values = [5, 2, 8, 1, 3, 7, 9, 4, 6, 10];
    values.forEach(v => tree.insert(v));
    expect(tree.size()).toBe(10);
    expect(tree.inOrderTraversal()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should insert negative numbers', () => {
    tree.insert(-5);
    tree.insert(0);
    tree.insert(5);
    tree.insert(-10);
    expect(tree.size()).toBe(4);
    expect(tree.contains(-5)).toBe(true);
    expect(tree.contains(0)).toBe(true);
    expect(tree.contains(5)).toBe(true);
    expect(tree.contains(-10)).toBe(true);
  });
});

describe('TwoThreeTree - Delete', () => {
  let tree: TwoThreeTree<number>;

  beforeEach(() => {
    tree = new TwoThreeTree<number>();
  });

  it('should delete from empty tree', () => {
    expect(tree.delete(5)).toBe(false);
    expect(tree.size()).toBe(0);
  });

  it('should delete single value', () => {
    tree.insert(5);
    expect(tree.delete(5)).toBe(true);
    expect(tree.size()).toBe(0);
    expect(tree.contains(5)).toBe(false);
  });

  it('should delete non-existent value', () => {
    tree.insert(5);
    expect(tree.delete(10)).toBe(false);
    expect(tree.size()).toBe(1);
  });

  it('should delete root with two children', () => {
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.delete(5)).toBe(true);
    expect(tree.size()).toBe(2);
    expect(tree.contains(5)).toBe(false);
    expect(tree.contains(3)).toBe(true);
    expect(tree.contains(7)).toBe(true);
  });

  it('should delete leaf node', () => {
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.delete(3)).toBe(true);
    expect(tree.size()).toBe(2);
    expect(tree.contains(3)).toBe(false);
  });

  it.skip('should delete all values', () => {
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 10; i++) {
      expect(tree.delete(i)).toBe(true);
    }
    expect(tree.size()).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should handle delete after many operations', () => {
    for (let i = 1; i <= 20; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 20; i += 2) {
      expect(tree.delete(i)).toBe(true);
    }
    expect(tree.size()).toBe(10);
    for (let i = 2; i <= 20; i += 2) {
      expect(tree.contains(i)).toBe(true);
    }
  });
});

describe('TwoThreeTree - Search', () => {
  let tree: TwoThreeTree<number>;

  beforeEach(() => {
    tree = new TwoThreeTree<number>();
  });

  it('should find existing values with search', () => {
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.search(5)).toBe(true);
    expect(tree.search(3)).toBe(true);
    expect(tree.search(7)).toBe(true);
  });

  it('should not find non-existing values with search', () => {
    tree.insert(5);
    expect(tree.search(10)).toBe(false);
  });

  it('should find existing values with contains', () => {
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.contains(5)).toBe(true);
    expect(tree.contains(3)).toBe(true);
    expect(tree.contains(7)).toBe(true);
  });

  it('should not find non-existing values with contains', () => {
    tree.insert(5);
    expect(tree.contains(10)).toBe(false);
  });

  it('should search in large tree', () => {
    for (let i = 1; i <= 1000; i++) {
      tree.insert(i);
    }
    expect(tree.search(500)).toBe(true);
    expect(tree.search(1)).toBe(true);
    expect(tree.search(1000)).toBe(true);
    expect(tree.search(1001)).toBe(false);
  });
});

describe('TwoThreeTree - Traversal', () => {
  let tree: TwoThreeTree<number>;

  beforeEach(() => {
    tree = new TwoThreeTree<number>();
  });

  it('should return empty array for empty tree', () => {
    expect(tree.inOrderTraversal()).toEqual([]);
  });

  it('should traverse single element', () => {
    tree.insert(5);
    expect(tree.inOrderTraversal()).toEqual([5]);
  });

  it('should traverse in sorted order', () => {
    [5, 2, 8, 1, 3, 7, 9, 4, 6, 10].forEach(v => tree.insert(v));
    expect(tree.inOrderTraversal()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should maintain order after insertions and deletions', () => {
    [5, 2, 8, 1, 3, 7, 9, 4, 6, 10].forEach(v => tree.insert(v));
    tree.delete(5);
    tree.delete(2);
    expect(tree.inOrderTraversal()).toEqual([1, 3, 4, 6, 7, 8, 9, 10]);
  });

  it('toArray should match inOrderTraversal', () => {
    [5, 2, 8, 1, 3, 7, 9, 4, 6, 10].forEach(v => tree.insert(v));
    expect(tree.toArray()).toEqual(tree.inOrderTraversal());
  });
});

describe('TwoThreeTree - Min/Max', () => {
  let tree: TwoThreeTree<number>;

  beforeEach(() => {
    tree = new TwoThreeTree<number>();
  });

  it('should return undefined for empty tree', () => {
    expect(tree.min()).toBeUndefined();
    expect(tree.max()).toBeUndefined();
  });

  it('should return same value for single element', () => {
    tree.insert(5);
    expect(tree.min()).toBe(5);
    expect(tree.max()).toBe(5);
  });

  it('should find minimum and maximum', () => {
    [5, 2, 8, 1, 3, 7, 9, 4, 6, 10].forEach(v => tree.insert(v));
    expect(tree.min()).toBe(1);
    expect(tree.max()).toBe(10);
  });

  it('should update min after deletion', () => {
    [5, 2, 8, 1, 3, 7, 9, 4, 6, 10].forEach(v => tree.insert(v));
    tree.delete(1);
    expect(tree.min()).toBe(2);
  });

  it('should update max after deletion', () => {
    [5, 2, 8, 1, 3, 7, 9, 4, 6, 10].forEach(v => tree.insert(v));
    tree.delete(10);
    expect(tree.max()).toBe(9);
  });
});

describe('TwoThreeTree - Size', () => {
  let tree: TwoThreeTree<number>;

  beforeEach(() => {
    tree = new TwoThreeTree<number>();
  });

  it('should start at 0', () => {
    expect(tree.size()).toBe(0);
  });

  it('should increment on insert', () => {
    tree.insert(5);
    expect(tree.size()).toBe(1);
    tree.insert(3);
    expect(tree.size()).toBe(2);
  });

  it('should not increment on duplicate', () => {
    tree.insert(5);
    tree.insert(5);
    expect(tree.size()).toBe(1);
  });

  it('should decrement on delete', () => {
    tree.insert(5);
    tree.insert(3);
    tree.delete(5);
    expect(tree.size()).toBe(1);
  });

  it('should not decrement on failed delete', () => {
    tree.insert(5);
    tree.delete(10);
    expect(tree.size()).toBe(1);
  });

  it('should reset to 0 on clear', () => {
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.clear();
    expect(tree.size()).toBe(0);
  });
});

describe('TwoThreeTree - IsEmpty', () => {
  let tree: TwoThreeTree<number>;

  beforeEach(() => {
    tree = new TwoThreeTree<number>();
  });

  it('should be empty initially', () => {
    expect(tree.isEmpty()).toBe(true);
  });

  it('should not be empty after insert', () => {
    tree.insert(5);
    expect(tree.isEmpty()).toBe(false);
  });

  it('should be empty after deleting all', () => {
    tree.insert(5);
    tree.delete(5);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should be empty after clear', () => {
    tree.insert(5);
    tree.clear();
    expect(tree.isEmpty()).toBe(true);
  });
});

describe('TwoThreeTree - Clear', () => {
  let tree: TwoThreeTree<number>;

  beforeEach(() => {
    tree = new TwoThreeTree<number>();
  });

  it('should clear empty tree', () => {
    tree.clear();
    expect(tree.isEmpty()).toBe(true);
    expect(tree.size()).toBe(0);
  });

  it('should clear non-empty tree', () => {
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.clear();
    expect(tree.isEmpty()).toBe(true);
    expect(tree.size()).toBe(0);
    expect(tree.contains(5)).toBe(false);
  });

  it('should allow insert after clear', () => {
    tree.insert(5);
    tree.clear();
    tree.insert(10);
    expect(tree.size()).toBe(1);
    expect(tree.contains(10)).toBe(true);
  });
});

describe('TwoThreeTree - Height', () => {
  let tree: TwoThreeTree<number>;

  beforeEach(() => {
    tree = new TwoThreeTree<number>();
  });

  it('should have height 0 for empty tree', () => {
    expect(tree.getHeight()).toBe(0);
  });

  it('should have height 1 for single element', () => {
    tree.insert(5);
    expect(tree.getHeight()).toBe(1);
  });

  it('should compute height correctly', () => {
    [5, 2, 8, 1, 3, 7, 9, 4, 6, 10].forEach(v => tree.insert(v));
    expect(tree.getHeight()).toBeGreaterThan(0);
    expect(tree.getHeight()).toBeLessThanOrEqual(4);
  });

  it('should decrease height after deletions', () => {
    for (let i = 1; i <= 100; i++) {
      tree.insert(i);
    }
    const initialHeight = tree.getHeight();
    for (let i = 1; i <= 100; i++) {
      tree.delete(i);
    }
    expect(tree.getHeight()).toBe(0);
  });
});

describe('TwoThreeTree - Time Complexity', () => {
  let tree: TwoThreeTree<number>;

  beforeEach(() => {
    tree = new TwoThreeTree<number>();
  });

  it('should return O(1) for empty tree', () => {
    expect(tree.getTimeComplexity()).toBe('O(1)');
  });

  it('should return O(log n) for balanced tree', () => {
    for (let i = 1; i <= 100; i++) {
      tree.insert(i);
    }
    const complexity = tree.getTimeComplexity();
    expect(complexity).toContain('O(log n)');
  });

  it('should include height and size in output', () => {
    for (let i = 1; i <= 50; i++) {
      tree.insert(i);
    }
    const complexity = tree.getTimeComplexity();
    expect(complexity).toContain('height:');
    expect(complexity).toContain('size:');
  });
});

describe('TwoThreeTree - Custom Comparator', () => {
  it('should work with string comparator', () => {
    const tree = new TwoThreeTree<string>((a, b) => a.localeCompare(b));
    tree.insert('banana');
    tree.insert('apple');
    tree.insert('cherry');
    expect(tree.contains('apple')).toBe(true);
    expect(tree.contains('banana')).toBe(true);
    expect(tree.contains('cherry')).toBe(true);
    expect(tree.min()).toBe('apple');
    expect(tree.max()).toBe('cherry');
  });

  it('should work with reverse comparator', () => {
    const tree = new TwoThreeTree<number>((a, b) => b - a);
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.contains(5)).toBe(true);
    expect(tree.contains(3)).toBe(true);
    expect(tree.contains(7)).toBe(true);
  });

  it('should work with object comparator', () => {
    interface Item {
      id: number;
      value: string;
    }
    
    const tree = new TwoThreeTree<Item>((a, b) => a.id - b.id);
    
    const item1 = { id: 1, value: 'first' };
    const item2 = { id: 2, value: 'second' };
    const item3 = { id: 3, value: 'third' };
    
    tree.insert(item2);
    tree.insert(item1);
    tree.insert(item3);
    
    expect(tree.contains(item1)).toBe(true);
    expect(tree.contains(item2)).toBe(true);
    expect(tree.contains(item3)).toBe(true);
  });
});

describe('TwoThreeTree - Balance Verification', () => {
  let tree: TwoThreeTree<number>;

  beforeEach(() => {
    tree = new TwoThreeTree<number>();
  });

  it('should maintain balanced structure for insertions', () => {
    for (let i = 1; i <= 100; i++) {
      tree.insert(i);
    }
    const height = tree.getHeight();
    const size = tree.size();
    const maxHeight = Math.ceil(Math.log2(size + 1)) + 1;
    expect(height).toBeLessThanOrEqual(maxHeight);
  });

  it('should maintain balanced structure after deletions', () => {
    for (let i = 1; i <= 100; i++) {
      tree.insert(i);
    }
    
    for (let i = 1; i <= 50; i++) {
      tree.delete(i * 2);
    }
    
    const height = tree.getHeight();
    const size = tree.size();
    const maxHeight = Math.ceil(Math.log2(size + 1)) + 1;
    expect(height).toBeLessThanOrEqual(maxHeight);
  });

  it('should stay balanced after random operations', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    values.forEach(v => tree.insert(v));
    
    tree.delete(5);
    tree.insert(11);
    tree.delete(2);
    tree.insert(12);
    tree.delete(8);
    
    const height = tree.getHeight();
    const size = tree.size();
    const maxHeight = Math.ceil(Math.log2(size + 1)) + 1;
    expect(height).toBeLessThanOrEqual(maxHeight);
  });
});

describe('TwoThreeTree - Large Datasets', () => {
  let tree: TwoThreeTree<number>;

  beforeEach(() => {
    tree = new TwoThreeTree<number>();
  });

  it('should handle 1000 insertions', () => {
    for (let i = 1; i <= 1000; i++) {
      tree.insert(i);
    }
    expect(tree.size()).toBe(1000);
    expect(tree.contains(500)).toBe(true);
  });

  it('should handle 1000 random insertions', () => {
    const values = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000));
    values.forEach(v => tree.insert(v));
    expect(tree.size()).toBeGreaterThan(0);
  });

  it('should handle 1000 insertions and 500 deletions', () => {
    for (let i = 1; i <= 1000; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 500; i++) {
      tree.delete(i * 2);
    }
    expect(tree.size()).toBe(500);
  });

  it('should maintain performance with large dataset', () => {
    for (let i = 1; i <= 10000; i++) {
      tree.insert(i);
    }
    expect(tree.contains(5000)).toBe(true);
    expect(tree.contains(10001)).toBe(false);
    expect(tree.getHeight()).toBeLessThanOrEqual(15);
  });
});

describe('TwoThreeTree - Edge Cases', () => {
  let tree: TwoThreeTree<number>;

  beforeEach(() => {
    tree = new TwoThreeTree<number>();
  });

  it('should handle zero', () => {
    tree.insert(0);
    expect(tree.contains(0)).toBe(true);
    expect(tree.min()).toBe(0);
    expect(tree.max()).toBe(0);
  });

  it('should handle very large numbers', () => {
    tree.insert(Number.MAX_SAFE_INTEGER);
    tree.insert(Number.MIN_SAFE_INTEGER);
    expect(tree.contains(Number.MAX_SAFE_INTEGER)).toBe(true);
    expect(tree.contains(Number.MIN_SAFE_INTEGER)).toBe(true);
  });

  it('should handle consecutive insertions', () => {
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    expect(tree.inOrderTraversal()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should handle alternating insertions', () => {
    for (let i = 1; i <= 20; i++) {
      tree.insert(i % 2 === 0 ? i : -i);
    }
    expect(tree.inOrderTraversal().length).toBe(20);
  });
});
