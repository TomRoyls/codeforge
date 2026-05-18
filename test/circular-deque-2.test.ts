import { describe, expect, it } from 'vitest';
import { CircularDeque2 } from '../src/core/circular-deque-2/index.js';

describe('CircularDeque2', () => {
  describe('constructor and initialization', () => {
    it('should create a deque with default capacity', () => {
      const deque = new CircularDeque2<number>();
      expect(deque.size()).toBe(0);
      expect(deque.isEmpty()).toBe(true);
    });

    it('should create a deque with custom initial capacity', () => {
      const deque = new CircularDeque2<number>(16);
      expect(deque.size()).toBe(0);
      expect(deque.isEmpty()).toBe(true);
    });

    it('should use minimum capacity of 1 for zero', () => {
      const deque = new CircularDeque2<number>(0);
      deque.pushBack(1);
      expect(deque.size()).toBe(1);
    });

    it('should use minimum capacity of 1 for negative', () => {
      const deque = new CircularDeque2<number>(-5);
      deque.pushBack(1);
      expect(deque.size()).toBe(1);
    });
  });

  describe('pushFront', () => {
    it('should add a single element to the front', () => {
      const deque = new CircularDeque2<number>();
      deque.pushFront(1);
      expect(deque.size()).toBe(1);
      expect(deque.peekFront()).toBe(1);
      expect(deque.peekBack()).toBe(1);
    });

    it('should add multiple elements in reverse order', () => {
      const deque = new CircularDeque2<number>();
      deque.pushFront(1);
      deque.pushFront(2);
      deque.pushFront(3);
      expect(deque.toArray()).toEqual([3, 2, 1]);
      expect(deque.size()).toBe(3);
    });

    it('should handle strings', () => {
      const deque = new CircularDeque2<string>();
      deque.pushFront('a');
      deque.pushFront('b');
      expect(deque.toArray()).toEqual(['b', 'a']);
    });

    it('should handle objects', () => {
      const deque = new CircularDeque2<{ id: number }>();
      deque.pushFront({ id: 1 });
      deque.pushFront({ id: 2 });
      expect(deque.peekFront()?.id).toBe(2);
      expect(deque.peekBack()?.id).toBe(1);
    });
  });

  describe('pushBack', () => {
    it('should add a single element to the back', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      expect(deque.size()).toBe(1);
      expect(deque.peekFront()).toBe(1);
      expect(deque.peekBack()).toBe(1);
    });

    it('should add multiple elements in order', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
      expect(deque.size()).toBe(3);
    });
  });

  describe('popFront', () => {
    it('should return undefined when empty', () => {
      const deque = new CircularDeque2<number>();
      expect(deque.popFront()).toBeUndefined();
    });

    it('should remove and return the front element', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.popFront()).toBe(1);
      expect(deque.toArray()).toEqual([2, 3]);
      expect(deque.size()).toBe(2);
    });

    it('should drain the deque completely', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.popFront()).toBe(1);
      expect(deque.popFront()).toBe(2);
      expect(deque.popFront()).toBeUndefined();
      expect(deque.isEmpty()).toBe(true);
    });
  });

  describe('popBack', () => {
    it('should return undefined when empty', () => {
      const deque = new CircularDeque2<number>();
      expect(deque.popBack()).toBeUndefined();
    });

    it('should remove and return the back element', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.popBack()).toBe(3);
      expect(deque.toArray()).toEqual([1, 2]);
      expect(deque.size()).toBe(2);
    });

    it('should drain the deque completely', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.popBack()).toBe(2);
      expect(deque.popBack()).toBe(1);
      expect(deque.popBack()).toBeUndefined();
      expect(deque.isEmpty()).toBe(true);
    });
  });

  describe('peekFront', () => {
    it('should return undefined when empty', () => {
      const deque = new CircularDeque2<number>();
      expect(deque.peekFront()).toBeUndefined();
    });

    it('should return the front element without removing it', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.peekFront()).toBe(1);
      expect(deque.size()).toBe(2);
    });

    it('should track front after pushFront', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      expect(deque.peekFront()).toBe(0);
    });
  });

  describe('peekBack', () => {
    it('should return undefined when empty', () => {
      const deque = new CircularDeque2<number>();
      expect(deque.peekBack()).toBeUndefined();
    });

    it('should return the back element without removing it', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.peekBack()).toBe(2);
      expect(deque.size()).toBe(2);
    });

    it('should track back after pushBack', () => {
      const deque = new CircularDeque2<number>();
      deque.pushFront(2);
      deque.pushBack(3);
      expect(deque.peekBack()).toBe(3);
    });
  });

  describe('size and isEmpty', () => {
    it('should report size 0 when empty', () => {
      const deque = new CircularDeque2<number>();
      expect(deque.size()).toBe(0);
      expect(deque.isEmpty()).toBe(true);
    });

    it('should track size correctly', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      expect(deque.size()).toBe(1);
      deque.pushBack(2);
      expect(deque.size()).toBe(2);
      deque.popFront();
      expect(deque.size()).toBe(1);
    });

    it('should report isEmpty correctly after operations', () => {
      const deque = new CircularDeque2<number>();
      expect(deque.isEmpty()).toBe(true);
      deque.pushBack(1);
      expect(deque.isEmpty()).toBe(false);
      deque.popFront();
      expect(deque.isEmpty()).toBe(true);
    });
  });

  describe('dynamic resizing', () => {
    it('should grow when exceeding default capacity', () => {
      const deque = new CircularDeque2<number>();
      for (let i = 0; i < 20; i++) {
        deque.pushBack(i);
      }
      expect(deque.size()).toBe(20);
      expect(deque.toArray()).toEqual(Array.from({ length: 20 }, (_, i) => i));
    });

    it('should grow when pushing to front beyond capacity', () => {
      const deque = new CircularDeque2<number>(4);
      for (let i = 0; i < 10; i++) {
        deque.pushFront(i);
      }
      expect(deque.size()).toBe(10);
      expect(deque.toArray()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
    });

    it('should preserve element order after growth', () => {
      const deque = new CircularDeque2<number>(4);
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.pushBack(4);
      deque.pushBack(5);
      expect(deque.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle mixed pushFront/pushBack with growth', () => {
      const deque = new CircularDeque2<number>(4);
      deque.pushFront(0);
      deque.pushBack(1);
      deque.pushFront(-1);
      deque.pushBack(2);
      deque.pushFront(-2);
      expect(deque.toArray()).toEqual([-2, -1, 0, 1, 2]);
    });

    it('should grow with capacity 1', () => {
      const deque = new CircularDeque2<number>(1);
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('at() index access', () => {
    it('should return undefined for out of bounds indices', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      expect(deque.at(-1)).toBeUndefined();
      expect(deque.at(1)).toBeUndefined();
      expect(deque.at(100)).toBeUndefined();
    });

    it('should return elements by index', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      expect(deque.at(0)).toBe(10);
      expect(deque.at(1)).toBe(20);
      expect(deque.at(2)).toBe(30);
    });

    it('should return undefined for empty deque', () => {
      const deque = new CircularDeque2<number>();
      expect(deque.at(0)).toBeUndefined();
    });

    it('should work after wrap-around', () => {
      const deque = new CircularDeque2<number>(4);
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popFront();
      deque.pushBack(4);
      expect(deque.at(0)).toBe(2);
      expect(deque.at(1)).toBe(3);
      expect(deque.at(2)).toBe(4);
    });
  });

  describe('contains()', () => {
    it('should return false for empty deque', () => {
      const deque = new CircularDeque2<number>();
      expect(deque.contains(1)).toBe(false);
    });

    it('should find existing elements', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.contains(1)).toBe(true);
      expect(deque.contains(2)).toBe(true);
      expect(deque.contains(3)).toBe(true);
    });

    it('should not find missing elements', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.contains(99)).toBe(false);
    });

    it('should use strict equality', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(NaN);
      expect(deque.contains(NaN)).toBe(false);
    });

    it('should find null and undefined values', () => {
      const deque = new CircularDeque2<null | undefined>();
      deque.pushBack(null);
      expect(deque.contains(null)).toBe(true);
      expect(deque.contains(undefined)).toBe(false);
    });
  });

  describe('toArray()', () => {
    it('should return empty array for empty deque', () => {
      const deque = new CircularDeque2<number>();
      expect(deque.toArray()).toEqual([]);
    });

    it('should return elements in front-to-back order', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should return a new array (not a reference)', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      const arr = deque.toArray();
      arr.push(99);
      expect(deque.size()).toBe(1);
    });
  });

  describe('clear()', () => {
    it('should clear an empty deque without error', () => {
      const deque = new CircularDeque2<number>();
      deque.clear();
      expect(deque.isEmpty()).toBe(true);
      expect(deque.size()).toBe(0);
    });

    it('should remove all elements', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.clear();
      expect(deque.isEmpty()).toBe(true);
      expect(deque.size()).toBe(0);
      expect(deque.toArray()).toEqual([]);
    });

    it('should allow reuse after clearing', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.clear();
      deque.pushBack(2);
      expect(deque.size()).toBe(1);
      expect(deque.peekFront()).toBe(2);
    });
  });

  describe('fromArray() static factory', () => {
    it('should create a deque from an empty array', () => {
      const deque = CircularDeque2.fromArray<number>([]);
      expect(deque.isEmpty()).toBe(true);
      expect(deque.size()).toBe(0);
    });

    it('should create a deque from an array', () => {
      const deque = CircularDeque2.fromArray([1, 2, 3]);
      expect(deque.size()).toBe(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('should preserve order', () => {
      const deque = CircularDeque2.fromArray(['a', 'b', 'c']);
      expect(deque.peekFront()).toBe('a');
      expect(deque.peekBack()).toBe('c');
    });
  });

  describe('iterator protocol', () => {
    it('should work with for...of', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result: number[] = [];
      for (const item of deque) {
        result.push(item);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    it('should work with spread operator', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect([...deque]).toEqual([1, 2]);
    });

    it('should work with destructuring', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      const [first, second, third] = deque;
      expect(first).toBe(10);
      expect(second).toBe(20);
      expect(third).toBe(30);
    });

    it('should work with Array.from', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect(Array.from(deque)).toEqual([1, 2]);
    });

    it('should iterate empty deque', () => {
      const deque = new CircularDeque2<number>();
      const result: number[] = [];
      for (const item of deque) {
        result.push(item);
      }
      expect(result).toEqual([]);
    });
  });

  describe('forEach()', () => {
    it('should call callback for each element with correct index', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(10);
      deque.pushBack(20);
      deque.pushBack(30);
      const result: { value: number; index: number }[] = [];
      deque.forEach((value, index) => {
        result.push({ value, index });
      });
      expect(result).toEqual([
        { value: 10, index: 0 },
        { value: 20, index: 1 },
        { value: 30, index: 2 },
      ]);
    });

    it('should not call callback for empty deque', () => {
      const deque = new CircularDeque2<number>();
      let called = false;
      deque.forEach(() => {
        called = true;
      });
      expect(called).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle pushFront then popBack for single element', () => {
      const deque = new CircularDeque2<number>();
      deque.pushFront(42);
      expect(deque.popBack()).toBe(42);
      expect(deque.isEmpty()).toBe(true);
    });

    it('should handle pushBack then popFront for single element', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(42);
      expect(deque.popFront()).toBe(42);
      expect(deque.isEmpty()).toBe(true);
    });

    it('should handle alternating pushFront/popBack', () => {
      const deque = new CircularDeque2<number>();
      deque.pushFront(1);
      expect(deque.popBack()).toBe(1);
      deque.pushFront(2);
      deque.pushFront(3);
      expect(deque.popBack()).toBe(2);
      expect(deque.toArray()).toEqual([3]);
    });

    it('should handle wrap-around buffer behavior', () => {
      const deque = new CircularDeque2<number>(4);
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popFront();
      deque.popFront();
      deque.pushBack(4);
      deque.pushBack(5);
      deque.pushBack(6);
      expect(deque.toArray()).toEqual([3, 4, 5, 6]);
    });

    it('should handle wrap-around with pushFront', () => {
      const deque = new CircularDeque2<number>(4);
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popBack();
      deque.popBack();
      deque.pushFront(0);
      deque.pushFront(-1);
      expect(deque.toArray()).toEqual([-1, 0, 1]);
    });

    it('should handle boolean values', () => {
      const deque = new CircularDeque2<boolean>();
      deque.pushBack(true);
      deque.pushBack(false);
      expect(deque.toArray()).toEqual([true, false]);
      expect(deque.contains(true)).toBe(true);
      expect(deque.contains(false)).toBe(true);
    });

    it('should handle null values', () => {
      const deque = new CircularDeque2<number | null>();
      deque.pushBack(null);
      deque.pushBack(1);
      expect(deque.toArray()).toEqual([null, 1]);
    });
  });

  describe('integration tests', () => {
    it('should handle mixed pushFront/pushBack/popFront/popBack', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(2);
      deque.pushFront(1);
      deque.pushBack(3);
      deque.pushFront(0);
      expect(deque.toArray()).toEqual([0, 1, 2, 3]);
      expect(deque.popFront()).toBe(0);
      expect(deque.popBack()).toBe(3);
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('should handle large mixed workload', () => {
      const deque = new CircularDeque2<number>();
      for (let i = 0; i < 100; i++) {
        deque.pushBack(i);
      }
      expect(deque.size()).toBe(100);
      expect(deque.peekFront()).toBe(0);
      expect(deque.peekBack()).toBe(99);
      for (let i = 0; i < 50; i++) {
        expect(deque.popFront()).toBe(i);
      }
      expect(deque.size()).toBe(50);
      for (let i = 99; i >= 50; i--) {
        expect(deque.popBack()).toBe(i);
      }
      expect(deque.isEmpty()).toBe(true);
    });

    it('should handle FIFO queue pattern', () => {
      const deque = new CircularDeque2<string>();
      deque.pushBack('a');
      deque.pushBack('b');
      deque.pushBack('c');
      expect(deque.popFront()).toBe('a');
      deque.pushBack('d');
      expect(deque.popFront()).toBe('b');
      expect(deque.popFront()).toBe('c');
      expect(deque.popFront()).toBe('d');
    });

    it('should handle stack pattern with pushBack/popBack', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.popBack()).toBe(3);
      expect(deque.popBack()).toBe(2);
      expect(deque.popBack()).toBe(1);
    });

    it('should handle stack pattern with pushFront/popFront', () => {
      const deque = new CircularDeque2<number>();
      deque.pushFront(1);
      deque.pushFront(2);
      deque.pushFront(3);
      expect(deque.popFront()).toBe(3);
      expect(deque.popFront()).toBe(2);
      expect(deque.popFront()).toBe(1);
    });

    it('should handle clear and reuse cycle', () => {
      const deque = new CircularDeque2<number>();
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 20; i++) {
          deque.pushBack(i);
        }
        expect(deque.size()).toBe(20);
        deque.clear();
        expect(deque.isEmpty()).toBe(true);
      }
    });
  });

  describe('type safety', () => {
    it('should work with number type', () => {
      const deque = new CircularDeque2<number>();
      deque.pushBack(1);
      const val: number | undefined = deque.popFront();
      expect(val).toBe(1);
    });

    it('should work with string type', () => {
      const deque = new CircularDeque2<string>();
      deque.pushBack('hello');
      const val: string | undefined = deque.popFront();
      expect(val).toBe('hello');
    });

    it('should work with object type', () => {
      interface Point {
        x: number;
        y: number;
      }
      const deque = new CircularDeque2<Point>();
      deque.pushBack({ x: 1, y: 2 });
      const val: Point | undefined = deque.popFront();
      expect(val?.x).toBe(1);
      expect(val?.y).toBe(2);
    });

    it('should work with union type', () => {
      const deque = new CircularDeque2<string | number>();
      deque.pushBack('a');
      deque.pushBack(1);
      expect(deque.toArray()).toEqual(['a', 1]);
    });
  });
});
