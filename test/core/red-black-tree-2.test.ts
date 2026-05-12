import type { Equal } from 'vitest';
import { describe, expect, it } from 'vitest';
import { RedBlackTree2 } from '../../src/core/red-black-tree-2';

describe('RedBlackTree2 - Basic Operations', () => {
  it('should insert single element', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    expect(tree.size).toBe(1);
    expect(tree.contains(5)).toBe(true);
  });

  it('should insert multiple elements', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.size).toBe(3);
    expect(tree.contains(5)).toBe(true);
    expect(tree.contains(3)).toBe(true);
    expect(tree.contains(7)).toBe(true);
  });

  it('should handle duplicate insertions', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(5);
    tree.insert(5);
    expect(tree.size).toBe(1);
  });

  it('should search existing element', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.search(5)).toBe(5);
    expect(tree.search(3)).toBe(3);
    expect(tree.search(7)).toBe(7);
  });

  it('should return null for non-existing element', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    expect(tree.search(10)).toBeNull();
  });

  it('should check if element exists', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(3);
    expect(tree.contains(5)).toBe(true);
    expect(tree.contains(10)).toBe(false);
  });

  it('should return minimum element', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(1);
    expect(tree.min()).toBe(1);
  });

  it('should return maximum element', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(10);
    expect(tree.max()).toBe(10);
  });

  it('should return null for min on empty tree', () => {
    const tree = new RedBlackTree2<number>();
    expect(tree.min()).toBeNull();
  });

  it('should return null for max on empty tree', () => {
    const tree = new RedBlackTree2<number>();
    expect(tree.max()).toBeNull();
  });

  it('should return correct size', () => {
    const tree = new RedBlackTree2<number>();
    expect(tree.size).toBe(0);
    tree.insert(5);
    expect(tree.size).toBe(1);
    tree.insert(3);
    expect(tree.size).toBe(2);
    tree.insert(7);
    expect(tree.size).toBe(3);
  });

  it('should check if tree is empty', () => {
    const tree = new RedBlackTree2<number>();
    expect(tree.isEmpty()).toBe(true);
    tree.insert(5);
    expect(tree.isEmpty()).toBe(false);
  });

  it('should delete existing element', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    const deleted = tree.delete(5);
    expect(deleted).toBe(true);
    expect(tree.size).toBe(2);
    expect(tree.contains(5)).toBe(false);
  });

  it('should return false when deleting non-existing element', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    const deleted = tree.delete(10);
    expect(deleted).toBe(false);
    expect(tree.size).toBe(1);
  });

  it('should clear the tree', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.clear();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should convert to array in sorted order', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(1);
    tree.insert(9);
    expect(tree.toArray()).toEqual([1, 3, 5, 7, 9]);
  });

  it('should return empty array for empty tree toArray', () => {
    const tree = new RedBlackTree2<number>();
    expect(tree.toArray()).toEqual([]);
  });

  it('should perform in-order traversal', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(1);
    const result: number[] = [];
    tree.inOrderTraversal((data) => result.push(data));
    expect(result).toEqual([1, 3, 5, 7]);
  });

  it('should query elements in range', () => {
    const tree = new RedBlackTree2<number>();
    for (let i = 1; i <= 10; i++) {
      tree.insert(i);
    }
    expect(tree.rangeQuery(3, 7)).toEqual([3, 4, 5, 6, 7]);
  });

  it('should query range with non-existing bounds', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(10);
    tree.insert(15);
    expect(tree.rangeQuery(7, 12)).toEqual([10]);
  });

  it('should return empty array for range with no matches', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(10);
    expect(tree.rangeQuery(20, 30)).toEqual([]);
  });
});

describe('RedBlackTree2 - Delete Operations', () => {
  it('should delete leaf node', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.delete(3);
    expect(tree.toArray()).toEqual([5, 7]);
    expect(tree.size).toBe(2);
  });

  it('should delete node with one child', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(4);
    tree.delete(3);
    expect(tree.toArray()).toEqual([4, 5]);
    expect(tree.size).toBe(2);
  });

  it('should delete node with two children', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(2);
    tree.insert(4);
    tree.delete(5);
    expect(tree.contains(5)).toBe(false);
    expect(tree.size).toBe(4);
  });

  it('should delete all elements one by one', () => {
    const tree = new RedBlackTree2<number>();
    for (let i = 1; i <= 5; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 5; i++) {
      expect(tree.delete(i)).toBe(true);
    }
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should handle delete and re-insert', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.delete(5);
    tree.insert(5);
    expect(tree.contains(5)).toBe(true);
    expect(tree.size).toBe(2);
  });
});

describe('RedBlackTree2 - String Operations', () => {
  it('should insert and search strings', () => {
    const tree = new RedBlackTree2<string>();
    tree.insert('apple');
    tree.insert('banana');
    tree.insert('cherry');
    expect(tree.search('banana')).toBe('banana');
    expect(tree.contains('cherry')).toBe(true);
  });

  it('should return strings in sorted order', () => {
    const tree = new RedBlackTree2<string>();
    tree.insert('cherry');
    tree.insert('apple');
    tree.insert('banana');
    expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry']);
  });

  it('should find min and max strings', () => {
    const tree = new RedBlackTree2<string>();
    tree.insert('banana');
    tree.insert('apple');
    tree.insert('cherry');
    expect(tree.min()).toBe('apple');
    expect(tree.max()).toBe('cherry');
  });
});

describe('RedBlackTree2 - Custom Comparator', () => {
  it('should use custom comparator for reverse order', () => {
    const tree = new RedBlackTree2<number>((a, b) => b - a);
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    expect(tree.min()).toBe(7);
    expect(tree.max()).toBe(3);
  });

  it('should use custom comparator for objects', () => {
    interface Person {
      name: string;
      age: number;
    }

    const tree = new RedBlackTree2<Person>((a, b) => a.age - b.age);
    tree.insert({ name: 'Alice', age: 30 });
    tree.insert({ name: 'Bob', age: 25 });
    tree.insert({ name: 'Charlie', age: 35 });

    expect(tree.min()).toEqual({ name: 'Bob', age: 25 });
    expect(tree.max()).toEqual({ name: 'Charlie', age: 35 });
  });

  it('should find element with custom comparator', () => {
    interface Item {
      id: number;
      value: string;
    }

    const tree = new RedBlackTree2<Item>((a, b) => a.id - b.id);
    const item1 = { id: 1, value: 'a' };
    const item2 = { id: 2, value: 'b' };
    tree.insert(item1);
    tree.insert(item2);

    expect(tree.search(item1)).toEqual(item1);
    expect(tree.contains(item2)).toBe(true);
  });
});

describe('RedBlackTree2 - Balance Validation', () => {
  it('should maintain RB properties after insertion', () => {
    const tree = new RedBlackTree2<number>();
    for (let i = 1; i <= 50; i++) {
      tree.insert(i);
    }
    expect(validateRBTreeProperties(tree)).toBe(true);
  });

  it('should maintain RB properties after deletion', () => {
    const tree = new RedBlackTree2<number>();
    for (let i = 1; i <= 50; i++) {
      tree.insert(i);
    }
    for (let i = 1; i <= 25; i++) {
      tree.delete(i);
    }
    expect(validateRBTreeProperties(tree)).toBe(true);
  });

  it('should maintain RB properties after random operations', () => {
    const tree = new RedBlackTree2<number>();
    const operations = 100;
    for (let i = 0; i < operations; i++) {
      if (Math.random() < 0.7 || tree.isEmpty()) {
        tree.insert(Math.floor(Math.random() * 100));
      } else {
        const arr = tree.toArray();
        if (arr.length > 0) {
          tree.delete(arr[Math.floor(Math.random() * arr.length)]);
        }
      }
    }
    expect(validateRBTreeProperties(tree)).toBe(true);
  });
});

describe('RedBlackTree2 - Stress Tests', () => {
  it('should handle 1000 insertions', () => {
    const tree = new RedBlackTree2<number>();
    for (let i = 0; i < 1000; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(1000);
    expect(validateRBTreeProperties(tree)).toBe(true);
  });

  it('should handle 1000 insertions and 500 deletions', () => {
    const tree = new RedBlackTree2<number>();
    for (let i = 0; i < 1000; i++) {
      tree.insert(i);
    }
    for (let i = 0; i < 500; i++) {
      tree.delete(i);
    }
    expect(tree.size).toBe(500);
    expect(validateRBTreeProperties(tree)).toBe(true);
  });

  it('should handle 500 random operations', () => {
    const tree = new RedBlackTree2<number>();
    const inserted = new Set<number>();

    for (let i = 0; i < 500; i++) {
      if (Math.random() < 0.5 || inserted.size === 0) {
        const value = Math.floor(Math.random() * 1000);
        tree.insert(value);
        inserted.add(value);
      } else {
        const arr = Array.from(inserted);
        const toDelete = arr[Math.floor(Math.random() * arr.length)];
        tree.delete(toDelete);
        inserted.delete(toDelete);
      }
    }

    expect(tree.size).toBe(inserted.size);
    expect(validateRBTreeProperties(tree)).toBe(true);
  });

  it('should handle bulk insert and toArray', () => {
    const tree = new RedBlackTree2<number>();
    const data = Array.from({ length: 1000 }, (_, i) => i);
    
    data.forEach(x => tree.insert(x));
    
    const arr = tree.toArray();
    expect(arr.length).toBe(1000);
    expect(arr).toEqual(data);
  });

  it('should maintain consistent size after operations', () => {
    const tree = new RedBlackTree2<number>();
    let expectedSize = 0;

    for (let i = 0; i < 100; i++) {
      tree.insert(i);
      expectedSize++;
      expect(tree.size).toBe(expectedSize);
    }

    for (let i = 0; i < 50; i++) {
      tree.delete(i);
      expectedSize--;
      expect(tree.size).toBe(expectedSize);
    }
  });

  it('should handle range query on large dataset', () => {
    const tree = new RedBlackTree2<number>();
    for (let i = 0; i < 1000; i++) {
      tree.insert(i);
    }
    
    const result = tree.rangeQuery(200, 299);
    expect(result.length).toBe(100);
    expect(result[0]).toBe(200);
    expect(result[result.length - 1]).toBe(299);
  });

  it('should handle clearing large tree', () => {
    const tree = new RedBlackTree2<number>();
    for (let i = 0; i < 1000; i++) {
      tree.insert(i);
    }
    
    tree.clear();
    expect(tree.size).toBe(0);
    expect(tree.isEmpty()).toBe(true);
    expect(tree.toArray()).toEqual([]);
  });
});

describe('RedBlackTree2 - Edge Cases', () => {
  it('should handle insertions in ascending order', () => {
    const tree = new RedBlackTree2<number>();
    for (let i = 1; i <= 100; i++) {
      tree.insert(i);
    }
    expect(tree.size).toBe(100);
    expect(validateRBTreeProperties(tree)).toBe(true);
  });

  it('should handle insertions in descending order', () => {
    const tree = new RedBlackTree2<number>();
    for (let i = 100; i >= 1; i--) {
      tree.insert(i);
    }
    expect(tree.size).toBe(100);
    expect(validateRBTreeProperties(tree)).toBe(true);
  });

  it('should handle same element insertions', () => {
    const tree = new RedBlackTree2<number>();
    for (let i = 0; i < 10; i++) {
      tree.insert(5);
    }
    expect(tree.size).toBe(1);
    expect(tree.toArray()).toEqual([5]);
  });

  it('should handle alternating insert and delete', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.delete(5);
    tree.insert(5);
    tree.delete(5);
    expect(tree.isEmpty()).toBe(true);
  });

  it('should handle range query with min > max', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(10);
    tree.insert(15);
    expect(tree.rangeQuery(10, 5)).toEqual([]);
  });

  it('should handle in-order traversal on empty tree', () => {
    const tree = new RedBlackTree2<number>();
    const result: number[] = [];
    tree.inOrderTraversal((data) => result.push(data));
    expect(result).toEqual([]);
  });

  it('should delete root and maintain balance', () => {
    const tree = new RedBlackTree2<number>();
    tree.insert(5);
    tree.insert(3);
    tree.insert(7);
    tree.delete(5);
    expect(validateRBTreeProperties(tree)).toBe(true);
    expect(tree.size).toBe(2);
  });

  it('should handle alternating min/max operations', () => {
    const tree = new RedBlackTree2<number>();
    const data = [5, 3, 7, 1, 9, 2, 8, 4, 6, 10];
    data.forEach(x => tree.insert(x));

    for (let i = 0; i < 5; i++) {
      const min = tree.min();
      const max = tree.max();
      if (min !== null) tree.delete(min);
      if (max !== null && max !== min) tree.delete(max);
    }

    expect(validateRBTreeProperties(tree)).toBe(true);
  });

  it('should handle search after multiple inserts and deletes', () => {
    const tree = new RedBlackTree2<number>();
    for (let i = 0; i < 100; i++) {
      tree.insert(i);
    }
    for (let i = 0; i < 50; i++) {
      tree.delete(i * 2);
    }
    expect(tree.search(75)).toBe(75);
    expect(tree.search(50)).toBeNull();
  });
});

function validateRBTreeProperties<T>(tree: RedBlackTree2<T>): boolean {
  const arr = tree.toArray();
  return arr.every((val, i) => i === 0 || arr[i - 1] <= val);
}
