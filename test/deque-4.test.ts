import { describe, it, expect } from 'vitest';
import { Deque4 } from './src/core/deque-4/index.js';

describe('Deque4', () => {
  describe('constructor and basic properties', () => {
    it('should create an empty deque', () => {
      const deque = new Deque4<number>();
      expect(deque.size).toBe(0);
      expect(deque.isEmpty).toBe(true);
    });

    it('should have size getter', () => {
      const deque = new Deque4<number>();
      expect(typeof deque.size).toBe('number');
    });

    it('should have isEmpty getter', () => {
      const deque = new Deque4<number>();
      expect(typeof deque.isEmpty).toBe('boolean');
    });
  });

  describe('pushBack', () => {
    it('should add element to back', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      expect(deque.size).toBe(1);
      expect(deque.isEmpty).toBe(false);
    });

    it('should add multiple elements to back', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.size).toBe(3);
    });

    it('should maintain order when pushing to back', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should push strings', () => {
      const deque = new Deque4<string>();
      deque.pushBack('a');
      deque.pushBack('b');
      expect(deque.size).toBe(2);
      expect(deque.toArray()).toEqual(['a', 'b']);
    });

    it('should push objects', () => {
      const deque = new Deque4<{ id: number }>();
      deque.pushBack({ id: 1 });
      deque.pushBack({ id: 2 });
      expect(deque.size).toBe(2);
    });
  });

  describe('pushFront', () => {
    it('should add element to front', () => {
      const deque = new Deque4<number>();
      deque.pushFront(1);
      expect(deque.size).toBe(1);
      expect(deque.isEmpty).toBe(false);
    });

    it('should add multiple elements to front', () => {
      const deque = new Deque4<number>();
      deque.pushFront(1);
      deque.pushFront(2);
      deque.pushFront(3);
      expect(deque.size).toBe(3);
    });

    it('should reverse order when pushing to front', () => {
      const deque = new Deque4<number>();
      deque.pushFront(1);
      deque.pushFront(2);
      deque.pushFront(3);
      expect(deque.toArray()).toEqual([3, 2, 1]);
    });

    it('should push strings to front', () => {
      const deque = new Deque4<string>();
      deque.pushFront('a');
      deque.pushFront('b');
      expect(deque.size).toBe(2);
      expect(deque.toArray()).toEqual(['b', 'a']);
    });
  });

  describe('popFront', () => {
    it('should remove and return front element', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.popFront();
      expect(result).toBe(1);
      expect(deque.size).toBe(2);
      expect(deque.toArray()).toEqual([2, 3]);
    });

    it('should return undefined when popping from empty deque', () => {
      const deque = new Deque4<number>();
      const result = deque.popFront();
      expect(result).toBe(undefined);
      expect(deque.size).toBe(0);
    });

    it('should maintain order after popFront', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popFront();
      expect(deque.toArray()).toEqual([2, 3]);
    });

    it('should pop all elements', () => {
      const deque = new Deque4<number>();
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
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.popBack();
      expect(result).toBe(3);
      expect(deque.size).toBe(2);
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('should return undefined when popping from empty deque', () => {
      const deque = new Deque4<number>();
      const result = deque.popBack();
      expect(result).toBe(undefined);
      expect(deque.size).toBe(0);
    });

    it('should maintain order after popBack', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popBack();
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('should pop all elements from back', () => {
      const deque = new Deque4<number>();
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
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      const result = deque.peekFront();
      expect(result).toBe(1);
      expect(deque.size).toBe(2);
    });

    it('should return undefined for empty deque', () => {
      const deque = new Deque4<number>();
      const result = deque.peekFront();
      expect(result).toBe(undefined);
    });

    it('should not modify deque', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.peekFront();
      expect(deque.toArray()).toEqual([1, 2]);
    });
  });

  describe('peekBack', () => {
    it('should return back element without removing', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      const result = deque.peekBack();
      expect(result).toBe(2);
      expect(deque.size).toBe(2);
    });

    it('should return undefined for empty deque', () => {
      const deque = new Deque4<number>();
      const result = deque.peekBack();
      expect(result).toBe(undefined);
    });

    it('should not modify deque', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.peekBack();
      expect(deque.toArray()).toEqual([1, 2]);
    });
  });

  describe('size', () => {
    it('should be 0 for new deque', () => {
      const deque = new Deque4<number>();
      expect(deque.size).toBe(0);
    });

    it('should increment with pushes', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      expect(deque.size).toBe(1);
      deque.pushBack(2);
      expect(deque.size).toBe(2);
    });

    it('should decrement with pops', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.popFront();
      expect(deque.size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should be true for new deque', () => {
      const deque = new Deque4<number>();
      expect(deque.isEmpty).toBe(true);
    });

    it('should be false after push', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      expect(deque.isEmpty).toBe(false);
    });

    it('should be true after clear', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.clear();
      expect(deque.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all elements', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.clear();
      expect(deque.size).toBe(0);
      expect(deque.isEmpty).toBe(true);
    });

    it('should work on empty deque', () => {
      const deque = new Deque4<number>();
      deque.clear();
      expect(deque.size).toBe(0);
    });

    it('should allow operations after clear', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.clear();
      deque.pushBack(2);
      expect(deque.size).toBe(1);
      expect(deque.toArray()).toEqual([2]);
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty deque', () => {
      const deque = new Deque4<number>();
      expect(deque.toArray()).toEqual([]);
    });

    it('should return array with elements in order', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should not modify deque', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      const arr = deque.toArray();
      arr.push(3);
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('should work after interleaved pushFront/pushBack', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      deque.pushBack(2);
      expect(deque.toArray()).toEqual([0, 1, 2]);
    });
  });

  describe('forEach', () => {
    it('should iterate over empty deque', () => {
      const deque = new Deque4<number>();
      const results: number[] = [];
      deque.forEach((value) => results.push(value));
      expect(results).toEqual([]);
    });

    it('should iterate over all elements', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const results: number[] = [];
      deque.forEach((value) => results.push(value));
      expect(results).toEqual([1, 2, 3]);
    });

    it('should provide correct index', () => {
      const deque = new Deque4<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      const indices: number[] = [];
      deque.forEach((value, index) => indices.push(index));
      expect(indices).toEqual([0, 1, 2]);
    });

    it('should not modify deque', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.forEach(() => {});
      expect(deque.toArray()).toEqual([1, 2]);
    });
  });

  describe('filter', () => {
    it('should filter empty deque', () => {
      const deque = new Deque4<number>();
      const result = deque.filter(() => true);
      expect(result.size).toBe(0);
    });

    it('should filter elements by predicate', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      const result = deque.filter((value) => value % 2 === 0);
      expect(result.toArray()).toEqual([2, 4]);
    });

    it('should not modify original deque', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.filter((value) => value > 1);
      expect(deque.toArray()).toEqual([1, 2, 3]);
      expect(result.toArray()).toEqual([2, 3]);
    });

    it('should filter all elements', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.filter(() => false);
      expect(result.size).toBe(0);
    });

    it('should filter with index parameter', () => {
      const deque = new Deque4<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      const result = deque.filter((value, index) => index % 2 === 0);
      expect(result.toArray()).toEqual([10, 30]);
    });
  });

  describe('map', () => {
    it('should map empty deque', () => {
      const deque = new Deque4<number>();
      const result = deque.map((value) => value * 2);
      expect(result.size).toBe(0);
    });

    it('should transform all elements', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.map((value) => value * 2);
      expect(result.toArray()).toEqual([2, 4, 6]);
    });

    it('should not modify original deque', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.map((value) => value * 10);
      expect(deque.toArray()).toEqual([1, 2, 3]);
      expect(result.toArray()).toEqual([10, 20, 30]);
    });

    it('should map to different type', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.map((value) => value.toString());
      expect(result.toArray()).toEqual(['1', '2', '3']);
    });

    it('should map with index parameter', () => {
      const deque = new Deque4<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      const result = deque.map((value, index) => value + index);
      expect(result.toArray()).toEqual([10, 21, 32]);
    });
  });

  describe('reduce', () => {
    it('should reduce empty deque to initial value', () => {
      const deque = new Deque4<number>();
      const result = deque.reduce((sum, value) => sum + value, 0);
      expect(result).toBe(0);
    });

    it('should reduce to sum', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.reduce((sum, value) => sum + value, 0);
      expect(result).toBe(6);
    });

    it('should not modify original deque', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.reduce((sum, value) => sum + value, 0);
      expect(deque.toArray()).toEqual([1, 2, 3]);
      expect(result).toBe(6);
    });

    it('should reduce with different accumulator type', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.reduce((str, value) => str + value.toString(), '');
      expect(result).toBe('123');
    });

    it('should reduce with index parameter', () => {
      const deque = new Deque4<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      const result = deque.reduce((sum, value, index) => sum + value + index, 0);
      expect(result).toBe(63);
    });
  });

  describe('rotate', () => {
    it('should rotate empty deque', () => {
      const deque = new Deque4<number>();
      const result = deque.rotate(1);
      expect(result.size).toBe(0);
    });

    it('should rotate right by 1', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.rotate(1);
      expect(result.toArray()).toEqual([3, 1, 2]);
    });

    it('should rotate left by 1', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.rotate(-1);
      expect(result.toArray()).toEqual([2, 3, 1]);
    });

    it('should rotate right by 2', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      const result = deque.rotate(2);
      expect(result.toArray()).toEqual([3, 4, 1, 2]);
    });

    it('should rotate by more than size', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.rotate(5);
      expect(result.toArray()).toEqual([2, 3, 1]);
    });

    it('should rotate by 0', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.rotate(0);
      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    it('should not modify original deque', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.rotate(1);
      expect(deque.toArray()).toEqual([1, 2, 3]);
      expect(result.toArray()).toEqual([3, 1, 2]);
    });
  });

  describe('slice', () => {
    it('should slice empty deque', () => {
      const deque = new Deque4<number>();
      const result = deque.slice(0, 2);
      expect(result.size).toBe(0);
    });

    it('should slice from start to end', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.pushBack(5);
      const result = deque.slice(1, 4);
      expect(result.toArray()).toEqual([2, 3, 4]);
    });

    it('should slice from start without end', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.slice(1);
      expect(result.toArray()).toEqual([2, 3]);
    });

    it('should slice with negative start', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      const result = deque.slice(-2);
      expect(result.toArray()).toEqual([3, 4]);
    });

    it('should slice with negative end', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      const result = deque.slice(0, -1);
      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    it('should slice with both negative indices', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      const result = deque.slice(-3, -1);
      expect(result.toArray()).toEqual([2, 3]);
    });

    it('should handle start greater than end', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.slice(2, 1);
      expect(result.size).toBe(0);
    });

    it('should handle start beyond bounds', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.slice(10);
      expect(result.size).toBe(0);
    });

    it('should not modify original deque', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = deque.slice(0, 2);
      expect(deque.toArray()).toEqual([1, 2, 3]);
      expect(result.toArray()).toEqual([1, 2]);
    });
  });

  describe('getTimeComplexity', () => {
    it('should return complexity for pushFront', () => {
      const deque = new Deque4<number>();
      expect(deque.getTimeComplexity('pushFront')).toBe('O(1) amortized');
    });

    it('should return complexity for pushBack', () => {
      const deque = new Deque4<number>();
      expect(deque.getTimeComplexity('pushBack')).toBe('O(1) amortized');
    });

    it('should return complexity for popFront', () => {
      const deque = new Deque4<number>();
      expect(deque.getTimeComplexity('popFront')).toBe('O(1)');
    });

    it('should return complexity for popBack', () => {
      const deque = new Deque4<number>();
      expect(deque.getTimeComplexity('popBack')).toBe('O(1)');
    });

    it('should return complexity for forEach', () => {
      const deque = new Deque4<number>();
      expect(deque.getTimeComplexity('forEach')).toBe('O(n)');
    });

    it('should return complexity for filter', () => {
      const deque = new Deque4<number>();
      expect(deque.getTimeComplexity('filter')).toBe('O(n)');
    });

    it('should return complexity for map', () => {
      const deque = new Deque4<number>();
      expect(deque.getTimeComplexity('map')).toBe('O(n)');
    });

    it('should return complexity for reduce', () => {
      const deque = new Deque4<number>();
      expect(deque.getTimeComplexity('reduce')).toBe('O(n)');
    });

    it('should return complexity for rotate', () => {
      const deque = new Deque4<number>();
      expect(deque.getTimeComplexity('rotate')).toBe('O(n)');
    });

    it('should return complexity for slice', () => {
      const deque = new Deque4<number>();
      expect(deque.getTimeComplexity('slice')).toBe('O(n)');
    });

    it('should return unknown for invalid operation', () => {
      const deque = new Deque4<number>();
      expect(deque.getTimeComplexity('unknown')).toBe('Unknown operation');
    });
  });

  describe('interleaved pushFront and pushBack', () => {
    it('should handle pushFront then pushBack', () => {
      const deque = new Deque4<number>();
      deque.pushFront(1);
      deque.pushBack(2);
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('should handle pushBack then pushFront', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      expect(deque.toArray()).toEqual([0, 1]);
    });

    it('should handle complex interleaving', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      deque.pushBack(2);
      deque.pushFront(-1);
      expect(deque.toArray()).toEqual([-1, 0, 1, 2]);
    });
  });

  describe('single element operations', () => {
    it('should handle single pushBack', () => {
      const deque = new Deque4<number>();
      deque.pushBack(42);
      expect(deque.size).toBe(1);
      expect(deque.peekFront()).toBe(42);
      expect(deque.peekBack()).toBe(42);
      expect(deque.toArray()).toEqual([42]);
    });

    it('should handle single pushFront', () => {
      const deque = new Deque4<number>();
      deque.pushFront(42);
      expect(deque.size).toBe(1);
      expect(deque.peekFront()).toBe(42);
      expect(deque.peekBack()).toBe(42);
    });

    it('should handle popFront on single element', () => {
      const deque = new Deque4<number>();
      deque.pushBack(42);
      const result = deque.popFront();
      expect(result).toBe(42);
      expect(deque.isEmpty).toBe(true);
    });

    it('should handle popBack on single element', () => {
      const deque = new Deque4<number>();
      deque.pushBack(42);
      const result = deque.popBack();
      expect(result).toBe(42);
      expect(deque.isEmpty).toBe(true);
    });
  });

  describe('large number of elements', () => {
    it('should handle 1000 elements', () => {
      const deque = new Deque4<number>();
      for (let i = 0; i < 1000; i++) {
        deque.pushBack(i);
      }
      expect(deque.size).toBe(1000);
      expect(deque.toArray()[0]).toBe(0);
      expect(deque.toArray()[999]).toBe(999);
    });

    it('should handle large alternating pushes', () => {
      const deque = new Deque4<number>();
      for (let i = 0; i < 500; i++) {
        deque.pushBack(i);
        deque.pushFront(i);
      }
      expect(deque.size).toBe(1000);
    });
  });

  describe('growth behavior', () => {
    it('should grow when capacity exceeded', () => {
      const deque = new Deque4<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.pushBack(5);
      expect(deque.size).toBe(5);
      expect(deque.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should grow with pushFront', () => {
      const deque = new Deque4<number>();
      deque.pushFront(1);
      deque.pushFront(2);
      deque.pushFront(3);
      deque.pushFront(4);
      deque.pushFront(5);
      expect(deque.size).toBe(5);
      expect(deque.toArray()).toEqual([5, 4, 3, 2, 1]);
    });

    it('should maintain correctness after multiple growths', () => {
      const deque = new Deque4<number>();
      for (let i = 0; i < 20; i++) {
        deque.pushBack(i);
      }
      expect(deque.size).toBe(20);
      const arr = deque.toArray();
      for (let i = 0; i < 20; i++) {
        expect(arr[i]).toBe(i);
      }
    });
  });

  describe('empty deque edge cases', () => {
    it('should handle multiple operations on empty deque', () => {
      const deque = new Deque4<number>();
      expect(deque.popFront()).toBe(undefined);
      expect(deque.popBack()).toBe(undefined);
      expect(deque.peekFront()).toBe(undefined);
      expect(deque.peekBack()).toBe(undefined);
      expect(deque.toArray()).toEqual([]);
    });

    it('should allow push after empty', () => {
      const deque = new Deque4<number>();
      deque.popFront();
      deque.pushBack(1);
      expect(deque.size).toBe(1);
      expect(deque.toArray()).toEqual([1]);
    });
  });
});
