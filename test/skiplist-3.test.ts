import { describe, it, expect } from 'vitest';
import { SkipList3 } from '../src/core/skiplist-3/index.js';

describe('SkipList3', () => {
  describe('insert and search', () => {
    it('should insert a single value', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      expect(list.size).toBe(1);
      expect(list.contains(5)).toBe(true);
    });

    it('should insert multiple values', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.size).toBe(4);
      expect(list.contains(1)).toBe(true);
      expect(list.contains(3)).toBe(true);
      expect(list.contains(5)).toBe(true);
      expect(list.contains(7)).toBe(true);
    });

    it('should maintain ordering after multiple inserts', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.insert(9);
      list.insert(2);
      expect(list.toArray()).toEqual([1, 2, 3, 5, 7, 9]);
    });

    it('should use custom comparator', () => {
      const list = new SkipList3<{ id: number }>((a, b) => a.id - b.id);
      list.insert({ id: 5 });
      list.insert({ id: 3 });
      list.insert({ id: 7 });
      expect(list.contains({ id: 3 })).toBe(true);
      expect(list.contains({ id: 5 })).toBe(true);
      expect(list.contains({ id: 7 })).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete an existing value', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.delete(5)).toBe(true);
      expect(list.size).toBe(2);
      expect(list.contains(5)).toBe(false);
    });

    it('should return false when deleting non-existent value', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(3);
      expect(list.delete(7)).toBe(false);
      expect(list.size).toBe(2);
    });

    it('should handle deleting from empty list', () => {
      const list = new SkipList3<number>();
      expect(list.delete(5)).toBe(false);
      expect(list.size).toBe(0);
    });

    it('should delete all elements one by one', () => {
      const list = new SkipList3<number>();
      list.insert(1);
      list.insert(2);
      list.insert(3);
      expect(list.delete(1)).toBe(true);
      expect(list.delete(2)).toBe(true);
      expect(list.delete(3)).toBe(true);
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
    });

    it('should delete middle element correctly', () => {
      const list = new SkipList3<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      list.insert(7);
      list.insert(9);
      expect(list.delete(5)).toBe(true);
      expect(list.toArray()).toEqual([1, 3, 7, 9]);
    });
  });

  describe('search', () => {
    it('should find existing value', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.search(5)).toBe(true);
      expect(list.search(3)).toBe(true);
      expect(list.search(7)).toBe(true);
    });

    it('should return false for non-existent value', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.search(10)).toBe(false);
      expect(list.search(0)).toBe(false);
    });

    it('should return false in empty list', () => {
      const list = new SkipList3<number>();
      expect(list.search(5)).toBe(false);
    });
  });

  describe('findMin', () => {
    it('should return minimum value', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.findMin()).toBe(1);
    });

    it('should return undefined for empty list', () => {
      const list = new SkipList3<number>();
      expect(list.findMin()).toBe(undefined);
    });

    it('should update after deletion of min', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.delete(1);
      expect(list.findMin()).toBe(3);
    });
  });

  describe('findMax', () => {
    it('should return maximum value', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      expect(list.findMax()).toBe(7);
    });

    it('should return undefined for empty list', () => {
      const list = new SkipList3<number>();
      expect(list.findMax()).toBe(undefined);
    });

    it('should update after deletion of max', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.delete(7);
      expect(list.findMax()).toBe(5);
    });
  });

  describe('rangeQuery', () => {
    it('should find values in range', () => {
      const list = new SkipList3<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      list.insert(7);
      list.insert(9);
      const result = list.rangeQuery(3, 7);
      expect(result).toEqual([3, 5, 7]);
    });

    it('should return empty array for no matching range', () => {
      const list = new SkipList3<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      const result = list.rangeQuery(6, 8);
      expect(result).toEqual([]);
    });

    it('should handle inclusive bounds', () => {
      const list = new SkipList3<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      list.insert(7);
      list.insert(9);
      const result = list.rangeQuery(5, 5);
      expect(result).toEqual([5]);
    });

    it('should handle range at start', () => {
      const list = new SkipList3<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      list.insert(7);
      const result = list.rangeQuery(1, 3);
      expect(result).toEqual([1, 3]);
    });

    it('should handle range at end', () => {
      const list = new SkipList3<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      list.insert(7);
      const result = list.rangeQuery(5, 7);
      expect(result).toEqual([5, 7]);
    });

    it('should return empty array for empty list', () => {
      const list = new SkipList3<number>();
      const result = list.rangeQuery(1, 10);
      expect(result).toEqual([]);
    });
  });

  describe('forEach', () => {
    it('should iterate over all elements', () => {
      const list = new SkipList3<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      list.insert(7);
      const result: number[] = [];
      list.forEach((value) => {
        result.push(value);
      });
      expect(result).toEqual([1, 3, 5, 7]);
    });

    it('should pass correct index to callback', () => {
      const list = new SkipList3<number>();
      list.insert(10);
      list.insert(20);
      list.insert(30);
      const indices: number[] = [];
      list.forEach((value, index) => {
        indices.push(index);
      });
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should handle empty list', () => {
      const list = new SkipList3<number>();
      let callCount = 0;
      list.forEach(() => {
        callCount++;
      });
      expect(callCount).toBe(0);
    });
  });

  describe('getRank', () => {
    it('should return rank of existing element', () => {
      const list = new SkipList3<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      list.insert(7);
      expect(list.getRank(1)).toBe(0);
      expect(list.getRank(3)).toBe(1);
      expect(list.getRank(5)).toBe(2);
      expect(list.getRank(7)).toBe(3);
    });

    it('should return -1 for non-existent element', () => {
      const list = new SkipList3<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      expect(list.getRank(7)).toBe(-1);
      expect(list.getRank(0)).toBe(-1);
    });

    it('should return correct rank after deletions', () => {
      const list = new SkipList3<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      list.insert(7);
      list.delete(3);
      expect(list.getRank(1)).toBe(0);
      expect(list.getRank(5)).toBe(1);
      expect(list.getRank(7)).toBe(2);
    });

    it('should handle empty list', () => {
      const list = new SkipList3<number>();
      expect(list.getRank(5)).toBe(-1);
    });
  });

  describe('getByRank', () => {
    it('should return element at valid rank', () => {
      const list = new SkipList3<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      list.insert(7);
      expect(list.getByRank(0)).toBe(1);
      expect(list.getByRank(1)).toBe(3);
      expect(list.getByRank(2)).toBe(5);
      expect(list.getByRank(3)).toBe(7);
    });

    it('should return undefined for negative rank', () => {
      const list = new SkipList3<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      expect(list.getByRank(-1)).toBe(undefined);
    });

    it('should return undefined for out of bounds rank', () => {
      const list = new SkipList3<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      expect(list.getByRank(3)).toBe(undefined);
      expect(list.getByRank(100)).toBe(undefined);
    });

    it('should handle empty list', () => {
      const list = new SkipList3<number>();
      expect(list.getByRank(0)).toBe(undefined);
    });

    it('should update after deletions', () => {
      const list = new SkipList3<number>();
      list.insert(1);
      list.insert(3);
      list.insert(5);
      list.insert(7);
      list.delete(3);
      expect(list.getByRank(0)).toBe(1);
      expect(list.getByRank(1)).toBe(5);
      expect(list.getByRank(2)).toBe(7);
    });
  });

  describe('size and isEmpty', () => {
    it('should return 0 for empty list', () => {
      const list = new SkipList3<number>();
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
    });

    it('should track size correctly', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      expect(list.size).toBe(3);
      expect(list.isEmpty).toBe(false);
    });

    it('should update size on insert and delete', () => {
      const list = new SkipList3<number>();
      expect(list.size).toBe(0);
      list.insert(1);
      expect(list.size).toBe(1);
      list.insert(2);
      expect(list.size).toBe(2);
      list.delete(1);
      expect(list.size).toBe(1);
    });
  });

  describe('clear', () => {
    it('should empty list', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.clear();
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
    });

    it('should allow reuse after clear', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(3);
      list.clear();
      list.insert(10);
      list.insert(20);
      expect(list.size).toBe(2);
      expect(list.contains(10)).toBe(true);
      expect(list.contains(20)).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty list', () => {
      const list = new SkipList3<number>();
      expect(list.toArray()).toEqual([]);
    });

    it('should return sorted array', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.insert(9);
      expect(list.toArray()).toEqual([1, 3, 5, 7, 9]);
    });

    it('should return correct array after deletes', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(3);
      list.insert(7);
      list.insert(1);
      list.delete(5);
      list.delete(1);
      expect(list.toArray()).toEqual([3, 7]);
    });
  });

  describe('ordering invariant', () => {
    it('should maintain sorted order with random inserts', () => {
      const list = new SkipList3<number>();
      for (let i = 0; i < 100; i++) {
        list.insert(Math.floor(Math.random() * 1000));
      }
      const arr = list.toArray();
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1]);
      }
    });
  });

  describe('large insert', () => {
    it('should handle large number of inserts', () => {
      const list = new SkipList3<number>();
      const size = 10000;
      for (let i = 0; i < size; i++) {
        list.insert(i);
      }
      expect(list.size).toBe(size);
      expect(list.findMin()).toBe(0);
      expect(list.findMax()).toBe(size - 1);
    });

    it('should find all elements after large insert', () => {
      const list = new SkipList3<number>();
      const size = 5000;
      for (let i = 0; i < size; i++) {
        list.insert(i);
      }
      for (let i = 0; i < size; i++) {
        expect(list.contains(i)).toBe(true);
      }
    });
  });

  describe('single element', () => {
    it('should handle single element operations', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      expect(list.size).toBe(1);
      expect(list.findMin()).toBe(5);
      expect(list.findMax()).toBe(5);
      expect(list.contains(5)).toBe(true);
      list.delete(5);
      expect(list.size).toBe(0);
      expect(list.isEmpty).toBe(true);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return complexity string', () => {
      const list = new SkipList3<number>();
      expect(list.getTimeComplexity()).toContain('O(log n)');
    });
  });

  describe('integration tests', () => {
    it('should handle complex mixed operations', () => {
      const list = new SkipList3<number>();
      list.insert(10);
      list.insert(5);
      list.insert(15);
      list.insert(3);
      list.insert(7);
      list.insert(13);
      list.insert(17);

      expect(list.size).toBe(7);
      expect(list.toArray()).toEqual([3, 5, 7, 10, 13, 15, 17]);
      expect(list.rangeQuery(5, 13)).toEqual([5, 7, 10, 13]);
      expect(list.getRank(7)).toBe(2);
      expect(list.getByRank(3)).toBe(10);

      list.delete(7);
      list.delete(13);
      expect(list.size).toBe(5);
      expect(list.toArray()).toEqual([3, 5, 10, 15, 17]);
      expect(list.rangeQuery(5, 15)).toEqual([5, 10, 15]);
    });

    it('should handle string values', () => {
      const list = new SkipList3<string>();
      list.insert('apple');
      list.insert('banana');
      list.insert('cherry');
      list.insert('date');
      expect(list.size).toBe(4);
      expect(list.contains('cherry')).toBe(true);
      expect(list.toArray()).toEqual(['apple', 'banana', 'cherry', 'date']);
    });

    it('should handle duplicate insert attempts', () => {
      const list = new SkipList3<number>();
      list.insert(5);
      list.insert(5);
      list.insert(5);
      expect(list.size).toBe(3);
    });
  });
});
