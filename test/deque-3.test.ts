import { describe, it, expect } from 'vitest';
import { Deque3 } from './src/core/deque-3/index.js';

describe('Deque3', () => {
  describe('constructor and basic properties', () => {
    it('should create an empty deque', () => {
      const deque = new Deque3<number>();
      expect(deque.size).toBe(0);
      expect(deque.isEmpty).toBe(true);
    });

    it('should have size getter', () => {
      const deque = new Deque3<number>();
      expect(typeof deque.size).toBe('number');
    });

    it('should have isEmpty getter', () => {
      const deque = new Deque3<number>();
      expect(typeof deque.isEmpty).toBe('boolean');
    });
  });

  describe('pushBack', () => {
    it('should add element to back', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      expect(deque.size).toBe(1);
      expect(deque.isEmpty).toBe(false);
    });

    it('should add multiple elements to back', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.size).toBe(3);
    });

    it('should maintain order when pushing to back', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should push strings', () => {
      const deque = new Deque3<string>();
      deque.pushBack('a');
      deque.pushBack('b');
      expect(deque.size).toBe(2);
      expect(deque.toArray()).toEqual(['a', 'b']);
    });

    it('should push objects', () => {
      const deque = new Deque3<{ id: number }>();
      deque.pushBack({ id: 1 });
      deque.pushBack({ id: 2 });
      expect(deque.size).toBe(2);
    });
  });

  describe('pushFront', () => {
    it('should add element to front', () => {
      const deque = new Deque3<number>();
      deque.pushFront(1);
      expect(deque.size).toBe(1);
      expect(deque.isEmpty).toBe(false);
    });

    it('should add multiple elements to front', () => {
      const deque = new Deque3<number>();
      deque.pushFront(1);
      deque.pushFront(2);
      deque.pushFront(3);
      expect(deque.size).toBe(3);
    });

    it('should reverse order when pushing to front', () => {
      const deque = new Deque3<number>();
      deque.pushFront(1);
      deque.pushFront(2);
      deque.pushFront(3);
      expect(deque.toArray()).toEqual([3, 2, 1]);
    });

    it('should push strings to front', () => {
      const deque = new Deque3<string>();
      deque.pushFront('a');
      deque.pushFront('b');
      expect(deque.size).toBe(2);
      expect(deque.toArray()).toEqual(['b', 'a']);
    });
  });

  describe('popFront', () => {
    it('should remove and return front element', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.popFront();
      expect(result).toBe(1);
      expect(deque.size).toBe(2);
      expect(deque.toArray()).toEqual([2, 3]);
    });

    it('should return undefined when popping from empty deque', () => {
      const deque = new Deque3<number>();
      const result = deque.popFront();
      expect(result).toBe(undefined);
      expect(deque.size).toBe(0);
    });

    it('should maintain order after popFront', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popFront();
      expect(deque.toArray()).toEqual([2, 3]);
    });

    it('should pop all elements', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.popFront()).toBe(1);
      expect(deque.popFront()).toBe(2);
      expect(deque.popFront()).toBe(3);
      expect(deque.popFront()).toBe(undefined);
      expect(deque.isEmpty).toBe(true);
    });
  });

  describe('popBack', () => {
    it('should remove and return back element', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.popBack();
      expect(result).toBe(3);
      expect(deque.size).toBe(2);
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('should return undefined when popping from empty deque', () => {
      const deque = new Deque3<number>();
      const result = deque.popBack();
      expect(result).toBe(undefined);
      expect(deque.size).toBe(0);
    });

    it('should maintain order after popBack', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popBack();
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('should pop all elements from back', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.popBack()).toBe(3);
      expect(deque.popBack()).toBe(2);
      expect(deque.popBack()).toBe(1);
      expect(deque.popBack()).toBe(undefined);
      expect(deque.isEmpty).toBe(true);
    });
  });

  describe('peekFront', () => {
    it('should return front element without removing', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      const result = deque.peekFront();
      expect(result).toBe(1);
      expect(deque.size).toBe(2);
    });

    it('should return undefined for empty deque', () => {
      const deque = new Deque3<number>();
      const result = deque.peekFront();
      expect(result).toBe(undefined);
    });

    it('should not modify deque', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.peekFront();
      expect(deque.toArray()).toEqual([1, 2]);
    });
  });

  describe('peekBack', () => {
    it('should return back element without removing', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      const result = deque.peekBack();
      expect(result).toBe(2);
      expect(deque.size).toBe(2);
    });

    it('should return undefined for empty deque', () => {
      const deque = new Deque3<number>();
      const result = deque.peekBack();
      expect(result).toBe(undefined);
    });

    it('should not modify deque', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.peekBack();
      expect(deque.toArray()).toEqual([1, 2]);
    });
  });

  describe('size', () => {
    it('should be 0 for new deque', () => {
      const deque = new Deque3<number>();
      expect(deque.size).toBe(0);
    });

    it('should increment with pushes', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      expect(deque.size).toBe(1);
      deque.pushBack(2);
      expect(deque.size).toBe(2);
    });

    it('should decrement with pops', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.popFront();
      expect(deque.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should be true for new deque', () => {
      const deque = new Deque3<number>();
      expect(deque.isEmpty).toBe(true);
    });

    it('should be false after push', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      expect(deque.isEmpty).toBe(false);
    });

    it('should be true after clear', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.clear();
      expect(deque.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all elements', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.clear();
      expect(deque.size).toBe(0);
      expect(deque.isEmpty).toBe(true);
    });

    it('should work on empty deque', () => {
      const deque = new Deque3<number>();
      deque.clear();
      expect(deque.size).toBe(0);
    });

    it('should allow operations after clear', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.clear();
      deque.pushBack(2);
      expect(deque.size).toBe(1);
      expect(deque.toArray()).toEqual([2]);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty deque', () => {
      const deque = new Deque3<number>();
      expect(deque.toArray()).toEqual([]);
    });

    it('should return array with elements in order', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should not modify deque', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      const arr = deque.toArray();
      arr.push(3);
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('should work after interleaved pushFront/pushBack', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      deque.pushBack(2);
      expect(deque.toArray()).toEqual([0, 1, 2]);
    });
  });

  describe('forEach', () => {
    it('should iterate over empty deque', () => {
      const deque = new Deque3<number>();
      const results: number[] = [];
      deque.forEach((value) => results.push(value));
      expect(results).toEqual([]);
    });

    it('should iterate over all elements', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const results: number[] = [];
      deque.forEach((value) => results.push(value));
      expect(results).toEqual([1, 2, 3]);
    });

    it('should provide correct index', () => {
      const deque = new Deque3<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      const indices: number[] = [];
      deque.forEach((value, index) => indices.push(index));
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should not modify deque', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.forEach(() => {});
      expect(deque.toArray()).toEqual([1, 2]);
    });
  });

  describe('get', () => {
    it('should return undefined for negative index', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.get(-1)).toBe(undefined);
    });

    it('should return undefined for out of bounds index', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.get(2)).toBe(undefined);
      expect(deque.get(10)).toBe(undefined);
    });

    it('should return element at valid index', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.get(0)).toBe(1);
      expect(deque.get(1)).toBe(2);
      expect(deque.get(2)).toBe(3);
    });

    it('should return undefined for empty deque', () => {
      const deque = new Deque3<number>();
      expect(deque.get(0)).toBe(undefined);
    });

    it('should work with pushFront', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      expect(deque.get(0)).toBe(0);
      expect(deque.get(1)).toBe(1);
    });
  });

  describe('contains', () => {
    it('should return false for empty deque', () => {
      const deque = new Deque3<number>();
      expect(deque.contains(1)).toBe(false);
    });

    it('should return true for existing element', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.contains(2)).toBe(true);
    });

    it('should return false for non-existing element', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.contains(4)).toBe(false);
    });

    it('should work with strings', () => {
      const deque = new Deque3<string>();
      deque.pushBack('a');
      deque.pushBack('b');
      expect(deque.contains('a')).toBe(true);
      expect(deque.contains('c')).toBe(false);
    });

    it('should check all elements', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.contains(1)).toBe(true);
      expect(deque.contains(2)).toBe(true);
      expect(deque.contains(3)).toBe(true);
    });
  });

  describe('interleaved pushFront and pushBack', () => {
    it('should handle pushFront then pushBack', () => {
      const deque = new Deque3<number>();
      deque.pushFront(1);
      deque.pushBack(2);
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('should handle pushBack then pushFront', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      expect(deque.toArray()).toEqual([0, 1]);
    });

    it('should handle complex interleaving', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      deque.pushBack(2);
      deque.pushFront(-1);
      expect(deque.toArray()).toEqual([-1, 0, 1, 2]);
    });

    it('should pop correctly after interleaved pushes', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      deque.pushBack(2);
      expect(deque.popFront()).toBe(0);
      expect(deque.popBack()).toBe(2);
      expect(deque.toArray()).toEqual([1]);
    });
  });

  describe('single element operations', () => {
    it('should handle single pushBack', () => {
      const deque = new Deque3<number>();
      deque.pushBack(42);
      expect(deque.size).toBe(1);
      expect(deque.peekFront()).toBe(42);
      expect(deque.peekBack()).toBe(42);
      expect(deque.toArray()).toEqual([42]);
    });

    it('should handle single pushFront', () => {
      const deque = new Deque3<number>();
      deque.pushFront(42);
      expect(deque.size).toBe(1);
      expect(deque.peekFront()).toBe(42);
      expect(deque.peekBack()).toBe(42);
    });

    it('should handle popFront on single element', () => {
      const deque = new Deque3<number>();
      deque.pushBack(42);
      const result = deque.popFront();
      expect(result).toBe(42);
      expect(deque.isEmpty).toBe(true);
    });

    it('should handle popBack on single element', () => {
      const deque = new Deque3<number>();
      deque.pushBack(42);
      const result = deque.popBack();
      expect(result).toBe(42);
      expect(deque.isEmpty).toBe(true);
    });
  });

  describe('large number of elements', () => {
    it('should handle 1000 elements', () => {
      const deque = new Deque3<number>();
      for (let i = 0; i < 1000; i++) {
        deque.pushBack(i);
      }
      expect(deque.size).toBe(1000);
      expect(deque.get(0)).toBe(0);
      expect(deque.get(999)).toBe(999);
    });

    it('should handle large alternating pushes', () => {
      const deque = new Deque3<number>();
      for (let i = 0; i < 500; i++) {
        deque.pushBack(i);
        deque.pushFront(i);
      }
      expect(deque.size).toBe(1000);
    });

    it('should maintain order with many elements', () => {
      const deque = new Deque3<number>();
      for (let i = 0; i < 100; i++) {
        deque.pushBack(i);
      }
      const arr = deque.toArray();
      expect(arr.length).toBe(100);
      expect(arr[0]).toBe(0);
      expect(arr[99]).toBe(99);
    });
  });

  describe('growth behavior', () => {
    it('should grow when capacity exceeded', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.pushBack(5);
      expect(deque.size).toBe(5);
      expect(deque.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should grow with pushFront', () => {
      const deque = new Deque3<number>();
      deque.pushFront(1);
      deque.pushFront(2);
      deque.pushFront(3);
      deque.pushFront(4);
      deque.pushFront(5);
      expect(deque.size).toBe(5);
      expect(deque.toArray()).toEqual([5, 4, 3, 2, 1]);
    });

    it('should grow with mixed operations', () => {
      const deque = new Deque3<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushFront(0);
      deque.pushBack(3);
      deque.pushFront(-1);
      expect(deque.size).toBe(5);
    });

    it('should maintain correctness after multiple growths', () => {
      const deque = new Deque3<number>();
      for (let i = 0; i < 20; i++) {
        deque.pushBack(i);
      }
      expect(deque.size).toBe(20);
      for (let i = 0; i < 20; i++) {
        expect(deque.get(i)).toBe(i);
      }
    });
  });

  describe('empty deque edge cases', () => {
    it('should handle multiple operations on empty deque', () => {
      const deque = new Deque3<number>();
      expect(deque.popFront()).toBe(undefined);
      expect(deque.popBack()).toBe(undefined);
      expect(deque.peekFront()).toBe(undefined);
      expect(deque.peekBack()).toBe(undefined);
      expect(deque.get(0)).toBe(undefined);
      expect(deque.contains(1)).toBe(false);
      expect(deque.toArray()).toEqual([]);
    });

    it('should allow push after empty', () => {
      const deque = new Deque3<number>();
      deque.popFront();
      deque.pushBack(1);
      expect(deque.size).toBe(1);
      expect(deque.toArray()).toEqual([1]);
    });
  });
});
