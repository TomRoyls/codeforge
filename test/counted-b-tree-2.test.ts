import { describe, it, expect } from 'vitest';
import { CountedBTree2 } from '../src/core/counted-b-tree-2/index.js';

describe('CountedBTree2 - Empty Tree', () => {
  it('should be empty initially', () => {
    const tree = new CountedBTree2<number>();
    expect(tree.isEmpty()).toBe(true);
    expect(tree.size).toBe(0);
  });

  it('should return false for has on empty tree', () => {
    const tree = new CountedBTree2<number>();
    expect(tree.has(5)).toBe(false);
  });

  it('should return undefined for at on empty tree', () => {
    const tree = new CountedBTree2<number>();
    expect(tree.at(0)).toBeUndefined();
    expect(tree.at(5)).toBeUndefined();
  });

  it('should return -1 for indexOf on empty tree', () => {
    const tree = new CountedBTree2<number>();
    expect(tree.indexOf(5)).toBe(-1);
  });

  it('should return empty array for toArray on empty tree', () => {
    const tree = new CountedBTree2<number>();
    expect(tree.toArray()).toEqual([]);
  });

  it('should clear empty tree', () => {
    const tree = new CountedBTree2<number>();
    tree.clear();
    expect(tree.isEmpty()).toBe(true);
    expect(tree.size).toBe(0);
  });
});

describe('CountedBTree2 - Single Element', () => {
  it('should insert single element', () => {
    const tree = new CountedBTree2<number>();
    tree.insert(5);
    expect(tree.size).toBe(1);
    expect(tree.isEmpty()).toBe(false);
  });

  it('should has single element', () => {
    const tree = new CountedBTree2<number>();
    tree.insert(5);
    expect(tree.has(5)).toBe(true);
    expect(tree.has(3)).toBe(false);
  });

  it('should at on single element', () => {
    const tree = new CountedBTree2<number>();
    tree.insert(5);
    expect(tree.at(0)).toBe(5);
    expect(tree.at(1)).toBeUndefined();
  });

  it('should indexOf on single element', () => {
    const tree = new CountedBTree2<number>();
    tree.insert(5);
    expect(tree.indexOf(5)).toBe(0);
    expect(tree.indexOf(3)).toBe(-1);
  });

  it('should toArray for single element', () => {
    const tree = new CountedBTree2<number>();
    tree.insert(5);
    expect(tree.toArray()).toEqual([5]);
  });
});

describe('CountedBTree2 - Insert Multiple Elements', () => {
  it('should insert multiple elements in order', () => {
    const tree = new CountedBTree2<number>();
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    tree.insert(4);
    tree.insert(5);
    expect(tree.size).toBe(5);
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should insert multiple elements in reverse order', () => {
    const tree = new CountedBTree2<number>();
    tree.insert(5);
    tree.insert(4);
    tree.insert(3);
    tree.insert(2);
    tree.insert(1);
    expect(tree.size).toBe(5);
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should insert random elements', () => {
    const tree = new CountedBTree2<number>();
    tree.insert(3);
    tree.insert(1);
    tree.insert(5);
    tree.insert(2);
    tree.insert(4);
    expect(tree.size).toBe(5);
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should has multiple elements', () => {
    const tree = new CountedBTree2<number>();
    tree.insert(3);
    tree.insert(1);
    tree.insert(5);
    tree.insert(2);
    tree.insert(4);
    expect(tree.has(1)).toBe(true);
    expect(tree.has(2)).toBe(true);
    expect(tree.has(3)).toBe(true);
    expect(tree.has(4)).toBe(true);
    expect(tree.has(5)).toBe(true);
    expect(tree.has(6)).toBe(false);
  });
});

describe('CountedBTree2 - Delete', () => {
  it('should delete from empty tree', () => {
    const tree = new CountedBTree2<number>();
    const result = tree.delete(5);
    expect(result).toBe(false);
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should delete single element', () => {
    const tree = new CountedBTree2<number>();
    tree.insert(5);
    const result = tree.delete(5);
    expect(result).toBe(true);
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should delete leaf element', () => {
    const tree = new CountedBTree2<number>();
    tree.insert(3);
    tree.insert(1);
    tree.insert(5);
    const result = tree.delete(1);
    expect(result).toBe(true);
    expect(tree.size).toBe(2);
    expect(tree.has(1)).toBe(false);
    expect(tree.has(3)).toBe(true);
    expect(tree.has(5)).toBe(true);
  });

  it('should delete internal node element', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    const result = tree.delete(5);
    expect(result).toBe(true);
    expect(tree.size).toBe(9);
    expect(tree.has(5)).toBe(false);
    expect(tree.has(4)).toBe(true);
    expect(tree.has(6)).toBe(true);
  });

  it('should delete min element', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    const result = tree.delete(1);
    expect(result).toBe(true);
    expect(tree.size).toBe(9);
    expect(tree.has(1)).toBe(false);
    expect(tree.at(0)).toBe(2);
  });

  it('should delete max element', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    const result = tree.delete(10);
    expect(result).toBe(true);
    expect(tree.size).toBe(9);
    expect(tree.has(10)).toBe(false);
    expect(tree.at(9)).toBeUndefined();
  });

  it('should delete non-existent element', () => {
    const tree = new CountedBTree2<number>();
    tree.insert(3);
    tree.insert(1);
    tree.insert(5);
    const result = tree.delete(100);
    expect(result).toBe(false);
    expect(tree.size).toBe(3);
    expect(tree.has(3)).toBe(true);
  });

  it('should delete all elements one by one', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 10; i++) {
      tree.delete(i);
    }
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });
});

describe('CountedBTree2 - Order Statistics with at', () => {
  it('should return element at correct index', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    expect(tree.at(0)).toBe(1);
    expect(tree.at(4)).toBe(5);
    expect(tree.at(9)).toBe(10);
  });

  it('should return undefined for out of bounds', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 5; i++) {
      tree.insert(i);
    }
    expect(tree.at(-1)).toBeUndefined();
    expect(tree.at(5)).toBeUndefined();
    expect(tree.at(100)).toBeUndefined();
  });

  it('should at on random insertion order', () => {
    const tree = new CountedBTree2<number>();
    [5, 3, 7, 1, 9, 2, 8, 4, 6].forEach(v => tree.insert(v));
    expect(tree.at(0)).toBe(1);
    expect(tree.at(4)).toBe(5);
    expect(tree.at(8)).toBe(9);
  });

  it('should at after deletes', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    tree.delete(2);
    tree.delete(5);
    tree.delete(8);
    expect(tree.at(0)).toBe(1);
    expect(tree.at(2)).toBe(4);
    expect(tree.at(6)).toBe(10);
  });
});

describe('CountedBTree2 - Order Statistics with indexOf', () => {
  it('should return correct index for existing value', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    expect(tree.indexOf(1)).toBe(0);
    expect(tree.indexOf(5)).toBe(4);
    expect(tree.indexOf(10)).toBe(9);
  });

  it('should return -1 for non-existent value', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    expect(tree.indexOf(0)).toBe(-1);
    expect(tree.indexOf(11)).toBe(-1);
    expect(tree.indexOf(100)).toBe(-1);
  });

  it('should indexOf on random insertion order', () => {
    const tree = new CountedBTree2<number>();
    [5, 3, 7, 1, 9, 2, 8, 4, 6].forEach(v => tree.insert(v));
    expect(tree.indexOf(1)).toBe(0);
    expect(tree.indexOf(5)).toBe(4);
    expect(tree.indexOf(9)).toBe(8);
  });

  it('should indexOf after deletes', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    tree.delete(2);
    tree.delete(5);
    tree.delete(8);
    expect(tree.indexOf(1)).toBe(0);
    expect(tree.indexOf(4)).toBe(2);
    expect(tree.indexOf(10)).toBe(6);
    expect(tree.indexOf(5)).toBe(-1);
  });
});

describe('CountedBTree2 - Size', () => {
  it('should track size correctly', () => {
    const tree = new CountedBTree2<number>();
    expect(tree.size).toBe(0);
    tree.insert(5);
    expect(tree.size).toBe(1);
    tree.insert(3);
    expect(tree.size).toBe(2);
    tree.insert(7);
    expect(tree.size).toBe(3);
  });

  it('should update size on delete', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(10);
    tree.delete(5);
    expect(tree.size).toBe(9);
    tree.delete(10);
    expect(tree.size).toBe(8);
  });

  it('should update size on clear', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 20; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(20);
    tree.clear();
    expect(tree.size).toBe(0);
  });
});

describe('CountedBTree2 - ToArray', () => {
  it('should return sorted array', () => {
    const tree = new CountedBTree2<number>();
    [5, 3, 7, 1, 9, 2, 8, 4, 6].forEach(v => tree.insert(v));
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should return empty array for empty tree', () => {
    const tree = new CountedBTree2<number>();
    expect(tree.toArray()).toEqual([]);
  });

  it('should maintain sort after operations', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 20; i++) {
      tree.insert(i);
    }
    tree.delete(5);
    tree.delete(10);
    tree.delete(15);
    const arr = tree.toArray();
    for (let i = 0; i < arr.length - 1; i++) {
      expect(arr[i]! < arr[i + 1]!).toBe(true);
    }
  });
});

describe('CountedBTree2 - Different Orders', () => {
  it('should work with order 3', () => {
    const tree = new CountedBTree2<number>(3);
    for (let i = 1; i <= 20; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(20);
    for (let i = 1; i <= 20; i++) {
      expect(tree.has(i)).toBe(true);
    }
  });

  it('should work with default order 4', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 20; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(20);
    expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it('should work with order 5', () => {
    const tree = new CountedBTree2<number>(5);
    for (let i = 1; i <= 20; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(20);
    expect(tree.at(0)).toBe(1);
    expect(tree.at(19)).toBe(20);
  });
});

describe('CountedBTree2 - Custom Comparator', () => {
  it('should work with string comparator', () => {
    const tree = new CountedBTree2<string>(3, (a, b) => a.localeCompare(b));
    ['zebra', 'apple', 'banana', 'cherry', 'date'].forEach(v => tree.insert(v));
    expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry', 'date', 'zebra']);
    expect(tree.indexOf('banana')).toBe(1);
    expect(tree.at(2)).toBe('cherry');
  });

  it('should work with reverse comparator', () => {
    const tree = new CountedBTree2<number>(3, (a, b) => b - a);
    [3, 1, 5, 2, 4].forEach(v => tree.insert(v));
    expect(tree.toArray()).toEqual([5, 4, 3, 2, 1]);
    expect(tree.at(0)).toBe(5);
    expect(tree.at(4)).toBe(1);
    expect(tree.indexOf(5)).toBe(0);
    expect(tree.indexOf(1)).toBe(4);
  });
});

describe('CountedBTree2 - Large Data', () => {
  it('should handle 1000 sequential elements', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 1000; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(1000);
    expect(tree.at(0)).toBe(1);
    expect(tree.at(999)).toBe(1000);
    expect(tree.indexOf(500)).toBe(499);
  });

  it('should handle 1000 random elements', () => {
    const tree = new CountedBTree2<number>();
    const values: number[] = [];
    for (let i = 0; i < 1000; i++) {
      const val = Math.floor(Math.random() * 10000);
      values.push(val);
      tree.insert(val);
    }
    expect(tree.size).toBe(1000);
    const arr = tree.toArray();
    expect(arr.length).toBe(1000);
    for (let i = 0; i < arr.length - 1; i++) {
      expect(arr[i]! <= arr[i + 1]!).toBe(true);
    }
  });

  it('should handle alternating insert/delete', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 500; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 500; i += 2) {
      tree.delete(i);
    }
    expect(tree.size).toBe(250);
    expect(tree.at(0)).toBe(2);
    expect(tree.at(249)).toBe(500);
  });

  it('should maintain order statistics with large data', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 500; i++) {
      tree.insert(i);
    }
    for (let i = 0; i < 500; i++) {
      expect(tree.at(i)).toBe(i + 1);
    }
    for (let i = 1; i <= 500; i++) {
      expect(tree.indexOf(i)).toBe(i - 1);
    }
  });
});

describe('CountedBTree2 - Complex Operations', () => {
  it('should handle insert-delete-insert cycle', () => {
    const tree = new CountedBTree2<number>();
    tree.insert(5);
    tree.delete(5);
    tree.insert(5);
    expect(tree.size).toBe(1);
    expect(tree.has(5)).toBe(true);
    expect(tree.at(0)).toBe(5);
  });

  it('should handle many operations', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 100; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 100; i += 2) {
      tree.delete(i);
    }
    expect(tree.size).toBe(50);
    for (let i = 2; i <= 100; i += 2) {
      expect(tree.has(i)).toBe(true);
    }
    for (let i = 1; i <= 100; i += 2) {
      expect(tree.has(i)).toBe(false);
    }
  });

  it('should handle clear after operations', () => {
    const tree = new CountedBTree2<number>();
    for (let i = 1; i <= 50; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 50; i += 5) {
      tree.delete(i);
    }
    tree.clear();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
    expect(tree.at(0)).toBeUndefined();
  });
});
