import { describe, it, expect } from 'vitest';
import { BTree2 } from './src/core/b-tree-2/index.js';

describe('BTree2 - Empty Tree', () => {
  it('should be empty initially', () => {
    const tree = new BTree2<number>();
    expect(tree.isEmpty).toBe(true);
    expect(tree.size).toBe(0);
  });

  it('should return null for min on empty tree', () => {
    const tree = new BTree2<number>();
    expect(tree.min()).toBe(null);
  });

  it('should return null for max on empty tree', () => {
    const tree = new BTree2<number>();
    expect(tree.max()).toBe(null);
  });

  it('should return false for search on empty tree', () => {
    const tree = new BTree2<number>();
    expect(tree.search(5)).toBe(false);
  });

  it('should return false for contains on empty tree', () => {
    const tree = new BTree2<number>();
    expect(tree.contains(5)).toBe(false);
  });

  it('should return empty array for toArray on empty tree', () => {
    const tree = new BTree2<number>();
    expect(tree.toArray()).toEqual([]);
  });

  it('should forEach on empty tree', () => {
    const tree = new BTree2<number>();
    let count = 0;
    tree.forEach(() => { count++; });
    expect(count).toBe(0);
  });
});

describe('BTree2 - Single Element', () => {
  it('should insert single element', () => {
    const tree = new BTree2<number>();
    tree.insert(5);
    expect(tree.size).toBe(1);
    expect(tree.isEmpty).toBe(false);
  });

  it('should search single element', () => {
    const tree = new BTree2<number>();
    tree.insert(5);
    expect(tree.search(5)).toBe(true);
    expect(tree.search(3)).toBe(false);
  });

  it('should contain single element', () => {
    const tree = new BTree2<number>();
    tree.insert(5);
    expect(tree.contains(5)).toBe(true);
    expect(tree.contains(3)).toBe(false);
  });

  it('should return min for single element', () => {
    const tree = new BTree2<number>();
    tree.insert(5);
    expect(tree.min()).toBe(5);
  });

  it('should return max for single element', () => {
    const tree = new BTree2<number>();
    tree.insert(5);
    expect(tree.max()).toBe(5);
  });

  it('should toArray for single element', () => {
    const tree = new BTree2<number>();
    tree.insert(5);
    expect(tree.toArray()).toEqual([5]);
  });
});

describe('BTree2 - Insert Multiple Elements', () => {
  it('should insert multiple elements in order', () => {
    const tree = new BTree2<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    tree.insert(4);
    tree.insert(5);
    expect(tree.size).toBe(5);
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should insert multiple elements in reverse order', () => {
    const tree = new BTree2<number>();
    tree.insert(5);
    tree.insert(4);
    tree.insert(3);
    tree.insert(2);
    tree.insert(1);
    expect(tree.size).toBe(5);
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should insert random elements', () => {
    const tree = new BTree2<number>();
    tree.insert(3);
    tree.insert(1);
    tree.insert(5);
    tree.insert(2);
    tree.insert(4);
    expect(tree.size).toBe(5);
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should insert duplicate elements', () => {
    const tree = new BTree2<number>();
    tree.insert(5);
    tree.insert(5);
    tree.insert(5);
    expect(tree.size).toBe(3);
  });

  it('should search multiple elements', () => {
    const tree = new BTree2<number>();
    tree.insert(3);
    tree.insert(1);
    tree.insert(5);
    tree.insert(2);
    tree.insert(4);
    expect(tree.search(1)).toBe(true);
    expect(tree.search(2)).toBe(true);
    expect(tree.search(3)).toBe(true);
    expect(tree.search(4)).toBe(true);
    expect(tree.search(5)).toBe(true);
    expect(tree.search(6)).toBe(false);
  });

  it('should contain multiple elements', () => {
    const tree = new BTree2<number>();
    tree.insert(3);
    tree.insert(1);
    tree.insert(5);
    tree.insert(2);
    tree.insert(4);
    expect(tree.contains(1)).toBe(true);
    expect(tree.contains(2)).toBe(true);
    expect(tree.contains(3)).toBe(true);
    expect(tree.contains(4)).toBe(true);
    expect(tree.contains(5)).toBe(true);
    expect(tree.contains(6)).toBe(false);
  });
});

describe('BTree2 - Min and Max', () => {
  it('should return correct min', () => {
    const tree = new BTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(1);
    tree.insert(9);
    expect(tree.min()).toBe(1);
  });

  it('should return correct max', () => {
    const tree = new BTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(1);
    tree.insert(9);
    expect(tree.max()).toBe(9);
  });

  it('should update min after delete', () => {
    const tree = new BTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(1);
    tree.insert(9);
    tree.delete(1);
    expect(tree.min()).toBe(3);
  });

  it('should update max after delete', () => {
    const tree = new BTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(1);
    tree.insert(9);
    tree.delete(9);
    expect(tree.max()).toBe(7);
  });
});

describe('BTree2 - Delete', () => {
  it('should delete from empty tree', () => {
    const tree = new BTree2<number>();
    tree.delete(5);
    expect(tree.size).toBe(0);
    expect(tree.isEmpty).toBe(true);
  });

  it('should delete single element', () => {
    const tree = new BTree2<number>();
    tree.insert(5);
    tree.delete(5);
    expect(tree.size).toBe(0);
    expect(tree.isEmpty).toBe(true);
  });

  it('should delete leaf element', () => {
    const tree = new BTree2<number>();
    tree.insert(3);
    tree.insert(1);
    tree.insert(5);
    tree.delete(1);
    expect(tree.size).toBe(2);
    expect(tree.search(1)).toBe(false);
    expect(tree.search(3)).toBe(true);
    expect(tree.search(5)).toBe(true);
  });

  it('should delete internal node element', () => {
    const tree = new BTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    tree.delete(5);
    expect(tree.size).toBe(9);
    expect(tree.search(5)).toBe(false);
    expect(tree.search(4)).toBe(true);
    expect(tree.search(6)).toBe(true);
  });

  it('should delete min element', () => {
    const tree = new BTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    tree.delete(1);
    expect(tree.size).toBe(9);
    expect(tree.search(1)).toBe(false);
    expect(tree.min()).toBe(2);
  });

  it('should delete max element', () => {
    const tree = new BTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    tree.delete(10);
    expect(tree.size).toBe(9);
    expect(tree.search(10)).toBe(false);
    expect(tree.max()).toBe(9);
  });

  it('should delete non-existent element', () => {
    const tree = new BTree2<number>();
    tree.insert(3);
    tree.insert(1);
    tree.insert(5);
    tree.delete(100);
    expect(tree.size).toBe(3);
    expect(tree.search(3)).toBe(true);
  });

  it('should delete then search', () => {
    const tree = new BTree2<number>();
    for (let i = 1; i <= 20; i++) {
      tree.insert(i);
    }
    tree.delete(5);
    tree.delete(10);
    tree.delete(15);
    expect(tree.search(5)).toBe(false);
    expect(tree.search(10)).toBe(false);
    expect(tree.search(15)).toBe(false);
    expect(tree.search(1)).toBe(true);
    expect(tree.search(20)).toBe(true);
  });

  it('should delete all elements one by one', () => {
    const tree = new BTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 10; i++) {
      tree.delete(i);
    }
    expect(tree.size).toBe(0);
    expect(tree.isEmpty).toBe(true);
  });

  it('should handle multiple deletes of same value', () => {
    const tree = new BTree2<number>();
    tree.insert(5);
    tree.insert(5);
    tree.insert(5);
    tree.delete(5);
    expect(tree.size).toBe(2);
    tree.delete(5);
    expect(tree.size).toBe(1);
    tree.delete(5);
    expect(tree.size).toBe(0);
  });
});

describe('BTree2 - Different Orders', () => {
  it('should work with order 3 (2-3 tree)', () => {
    const tree = new BTree2<number>(3);
    for (let i = 1; i <= 20; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(20);
    for (let i = 1; i <= 20; i++) {
      expect(tree.search(i)).toBe(true);
    }
  });

  it('should work with order 4 (2-3-4 tree)', () => {
    const tree = new BTree2<number>(4);
    for (let i = 1; i <= 20; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(20);
    for (let i = 1; i <= 20; i++) {
      expect(tree.search(i)).toBe(true);
    }
  });

  it('should work with order 5', () => {
    const tree = new BTree2<number>(5);
    for (let i = 1; i <= 20; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(20);
    for (let i = 1; i <= 20; i++) {
      expect(tree.search(i)).toBe(true);
    }
  });

  it('should delete with order 3', () => {
    const tree = new BTree2<number>(3);
    for (let i = 1; i <= 20; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 20; i++) {
      tree.delete(i);
    }
    expect(tree.size).toBe(0);
  });

  it('should delete with order 4', () => {
    const tree = new BTree2<number>(4);
    for (let i = 1; i <= 20; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 20; i++) {
      tree.delete(i);
    }
    expect(tree.size).toBe(0);
  });

  it('should delete with order 5', () => {
    const tree = new BTree2<number>(5);
    for (let i = 1; i <= 20; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 20; i++) {
      tree.delete(i);
    }
    expect(tree.size).toBe(0);
  });
});

describe('BTree2 - Sequential Inserts', () => {
  it('should handle sequential inserts 1-50', () => {
    const tree = new BTree2<number>();
    for (let i = 1; i <= 50; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(50);
    for (let i = 1; i <= 50; i++) {
      expect(tree.search(i)).toBe(true);
    }
  });

  it('should handle sequential inserts 50-1', () => {
    const tree = new BTree2<number>();
    for (let i = 50; i >= 1; i--) {
      tree.insert(i);
    }
    expect(tree.size).toBe(50);
    for (let i = 1; i <= 50; i++) {
      expect(tree.search(i)).toBe(true);
    }
  });

  it('should maintain order with sequential inserts', () => {
    const tree = new BTree2<number>();
    for (let i = 1; i <= 30; i++) {
      tree.insert(i);
    }
    const arr = tree.toArray();
    for (let i = 0; i < arr.length; i++) {
      expect(arr[i]).toBe(i + 1);
    }
  });
});

describe('BTree2 - Random Inserts', () => {
  it('should handle random inserts', () => {
    const tree = new BTree2<number>();
    const values = [42, 17, 91, 3, 56, 29, 78, 12, 67, 34, 89, 5, 51, 23, 76];
    values.forEach(v => tree.insert(v));
    expect(tree.size).toBe(values.length);
    values.forEach(v => expect(tree.search(v)).toBe(true));
  });

  it('should handle many random inserts', () => {
    const tree = new BTree2<number>();
    const values: number[] = [];
    for (let i = 0; i < 100; i++) {
      const val = Math.floor(Math.random() * 1000);
      values.push(val);
      tree.insert(val);
    }
    expect(tree.size).toBe(100);
    values.forEach(v => expect(tree.search(v)).toBe(true));
  });
});

describe('BTree2 - Clear', () => {
  it('should clear empty tree', () => {
    const tree = new BTree2<number>();
    tree.clear();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty).toBe(true);
  });

  it('should clear tree with elements', () => {
    const tree = new BTree2<number>();
    for (let i = 1; i <= 20; i++) {
      tree.insert(i);
    }
    tree.clear();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty).toBe(true);
    expect(tree.search(5)).toBe(false);
  });
});

describe('BTree2 - ForEach', () => {
  it('should forEach over empty tree', () => {
    const tree = new BTree2<number>();
    let count = 0;
    tree.forEach(() => { count++; });
    expect(count).toBe(0);
  });

  it('should forEach over elements in order', () => {
    const tree = new BTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    const values: number[] = [];
    tree.forEach(v => values.push(v));
    expect(values).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should forEach over random inserted elements', () => {
    const tree = new BTree2<number>();
    [5, 3, 7, 1, 9, 2, 8, 4, 6].forEach(v => tree.insert(v));
    const values: number[] = [];
    tree.forEach(v => values.push(v));
    expect(values).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe('BTree2 - ToArray', () => {
  it('should return sorted array', () => {
    const tree = new BTree2<number>();
    [5, 3, 7, 1, 9, 2, 8, 4, 6].forEach(v => tree.insert(v));
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should return empty array for empty tree', () => {
    const tree = new BTree2<number>();
    expect(tree.toArray()).toEqual([]);
  });
});

describe('BTree2 - Custom Comparator', () => {
  it('should work with string comparator', () => {
    const tree = new BTree2<string>(3, (a, b) => a.localeCompare(b));
    ['zebra', 'apple', 'banana', 'cherry', 'date'].forEach(v => tree.insert(v));
    expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry', 'date', 'zebra']);
  });

  it('should work with reverse comparator', () => {
    const tree = new BTree2<number>(3, (a, b) => b - a);
    [3, 1, 5, 2, 4].forEach(v => tree.insert(v));
    expect(tree.min()).toBe(5);
    expect(tree.max()).toBe(1);
  });
});

describe('BTree2 - Complex Operations', () => {
  it('should handle insert-delete-insert cycle', () => {
    const tree = new BTree2<number>();
    tree.insert(5);
    tree.delete(5);
    tree.insert(5);
    expect(tree.size).toBe(1);
    expect(tree.search(5)).toBe(true);
  });

  it('should handle many operations', () => {
    const tree = new BTree2<number>();
    for (let i = 1; i <= 100; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 100; i += 2) {
      tree.delete(i);
    }
    expect(tree.size).toBe(50);
    for (let i = 2; i <= 100; i += 2) {
      expect(tree.search(i)).toBe(true);
    }
    for (let i = 1; i <= 100; i += 2) {
      expect(tree.search(i)).toBe(false);
    }
  });
});
