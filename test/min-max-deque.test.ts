import { describe, it, expect } from 'vitest';
import { MinMaxDeque } from '../src/core/min-max-deque/index.js';

describe('MinMaxDeque', () => {
  describe('constructor', () => {
    it('creates empty deque', () => {
      const deque = new MinMaxDeque<number>();
      expect(deque.size()).toBe(0);
      expect(deque.isEmpty()).toBe(true);
    });

    it('creates deque with custom comparator', () => {
      const deque = new MinMaxDeque<{ value: number }>({
        comparator: (a, b) => a.value - b.value
      });
      deque.pushBack({ value: 5 });
      deque.pushBack({ value: 3 });
      expect(deque.min()).toEqual({ value: 3 });
      expect(deque.max()).toEqual({ value: 5 });
    });

    it('creates deque with reverse comparator', () => {
      const deque = new MinMaxDeque<number>({
        comparator: (a, b) => b - a
      });
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(1);
    });
  });

  describe('pushFront', () => {
    it('pushes single item to front', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushFront(5);
      expect(deque.size()).toBe(1);
      expect(deque.peekFront()).toBe(5);
    });

    it('pushes multiple items to front', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushFront(1);
      deque.pushFront(2);
      deque.pushFront(3);
      expect(deque.toArray()).toEqual([3, 2, 1]);
    });

    it('updates min and max after pushFront', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushFront(5);
      expect(deque.min()).toBe(5);
      expect(deque.max()).toBe(5);
      deque.pushFront(3);
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(5);
      deque.pushFront(7);
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(7);
    });

    it('handles duplicate values', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushFront(5);
      deque.pushFront(5);
      deque.pushFront(5);
      expect(deque.size()).toBe(3);
      expect(deque.min()).toBe(5);
      expect(deque.max()).toBe(5);
    });

    it('handles negative values', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushFront(-5);
      deque.pushFront(-3);
      deque.pushFront(-7);
      expect(deque.min()).toBe(-7);
      expect(deque.max()).toBe(-3);
    });
  });

  describe('pushBack', () => {
    it('pushes single item to back', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      expect(deque.size()).toBe(1);
      expect(deque.peekBack()).toBe(5);
    });

    it('pushes multiple items to back', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('updates min and max after pushBack', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      expect(deque.min()).toBe(5);
      expect(deque.max()).toBe(5);
      deque.pushBack(3);
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(5);
      deque.pushBack(7);
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(7);
    });

    it('handles duplicate values', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      deque.pushBack(5);
      deque.pushBack(5);
      expect(deque.size()).toBe(3);
      expect(deque.min()).toBe(5);
      expect(deque.max()).toBe(5);
    });

    it('handles negative values', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(-5);
      deque.pushBack(-3);
      deque.pushBack(-7);
      expect(deque.min()).toBe(-7);
      expect(deque.max()).toBe(-3);
    });
  });

  describe('pushFront and pushBack combination', () => {
    it('maintains order with mixed pushes', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      deque.pushBack(2);
      deque.pushFront(-1);
      expect(deque.toArray()).toEqual([-1, 0, 1, 2]);
    });

    it('tracks min and max correctly with mixed pushes', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      deque.pushFront(10);
      deque.pushBack(3);
      deque.pushFront(7);
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(10);
    });

    it('handles transfers between stacks', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.popFront();
      deque.pushBack(3);
      deque.popFront();
      deque.pushBack(4);
      expect(deque.toArray()).toEqual([3, 4]);
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(4);
    });
  });

  describe('popFront', () => {
    it('pops single item from front', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      const result = deque.popFront();
      expect(result).toBe(5);
      expect(deque.size()).toBe(0);
    });

    it('pops multiple items from front', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.popFront()).toBe(1);
      expect(deque.popFront()).toBe(2);
      expect(deque.popFront()).toBe(3);
      expect(deque.size()).toBe(0);
    });

    it('throws error when popping from empty deque', () => {
      const deque = new MinMaxDeque<number>();
      expect(() => deque.popFront()).toThrow('MinMaxDeque is empty');
    });

    it('updates min and max after popFront', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(5);
      deque.pushBack(3);
      deque.popFront();
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(5);
    });

    it('transfers items when front stack is empty', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popFront();
      deque.popFront();
      expect(deque.popFront()).toBe(3);
      expect(deque.size()).toBe(0);
    });

    it('handles removal of min element', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(5);
      deque.pushBack(3);
      deque.popFront();
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(5);
    });

    it('handles removal of max element', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      deque.pushBack(1);
      deque.pushBack(3);
      deque.popFront();
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(3);
    });
  });

  describe('popBack', () => {
    it('pops single item from back', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      const result = deque.popBack();
      expect(result).toBe(5);
      expect(deque.size()).toBe(0);
    });

    it('pops multiple items from back', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.popBack()).toBe(3);
      expect(deque.popBack()).toBe(2);
      expect(deque.popBack()).toBe(1);
      expect(deque.size()).toBe(0);
    });

    it('throws error when popping from empty deque', () => {
      const deque = new MinMaxDeque<number>();
      expect(() => deque.popBack()).toThrow('MinMaxDeque is empty');
    });

    it('updates min and max after popBack', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(5);
      deque.pushBack(3);
      deque.popBack();
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(5);
    });

    it('transfers items when back stack is empty', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushFront(1);
      deque.pushFront(2);
      deque.pushFront(3);
      deque.popBack();
      deque.popBack();
      expect(deque.popBack()).toBe(3);
      expect(deque.size()).toBe(0);
    });

    it('handles removal of min element', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      deque.pushBack(1);
      deque.pushBack(3);
      deque.popBack();
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(5);
    });

    it('handles removal of max element', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(3);
      deque.pushBack(5);
      deque.pushBack(1);
      deque.popBack();
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(5);
    });
  });

  describe('peekFront', () => {
    it('returns front item without removing', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.peekFront()).toBe(1);
      expect(deque.size()).toBe(3);
    });

    it('throws error when peeking empty deque', () => {
      const deque = new MinMaxDeque<number>();
      expect(() => deque.peekFront()).toThrow('MinMaxDeque is empty');
    });

    it('returns first item after pushFront', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      expect(deque.peekFront()).toBe(0);
    });

    it('returns correct item after pops', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popFront();
      expect(deque.peekFront()).toBe(2);
    });

    it('works after transfers', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.popFront();
      expect(deque.peekFront()).toBe(2);
    });
  });

  describe('peekBack', () => {
    it('returns back item without removing', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.peekBack()).toBe(3);
      expect(deque.size()).toBe(3);
    });

    it('throws error when peeking empty deque', () => {
      const deque = new MinMaxDeque<number>();
      expect(() => deque.peekBack()).toThrow('MinMaxDeque is empty');
    });

    it('returns last item after pushBack', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      expect(deque.peekBack()).toBe(2);
    });

    it('returns correct item after pops', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popBack();
      expect(deque.peekBack()).toBe(2);
    });

    it('works after transfers', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushFront(1);
      deque.pushFront(2);
      deque.popBack();
      expect(deque.peekBack()).toBe(2);
    });
  });

  describe('min', () => {
    it('returns min value', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      deque.pushBack(3);
      deque.pushBack(7);
      expect(deque.min()).toBe(3);
    });

    it('throws error when deque is empty', () => {
      const deque = new MinMaxDeque<number>();
      expect(() => deque.min()).toThrow('MinMaxDeque is empty');
    });

    it('returns single value for one element', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      expect(deque.min()).toBe(5);
    });

    it('tracks min correctly with duplicates', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      deque.pushBack(3);
      deque.pushBack(3);
      deque.pushBack(7);
      expect(deque.min()).toBe(3);
    });

    it('updates min after popFront', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(5);
      deque.pushBack(3);
      deque.popFront();
      expect(deque.min()).toBe(3);
    });

    it('updates min after popBack', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      deque.pushBack(3);
      deque.pushBack(1);
      deque.popBack();
      expect(deque.min()).toBe(3);
    });

    it('works with mixed pushFront and pushBack', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      deque.pushFront(1);
      deque.pushBack(7);
      deque.pushFront(0);
      expect(deque.min()).toBe(0);
    });

    it('handles negative values', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(-5);
      deque.pushBack(-3);
      deque.pushBack(-7);
      expect(deque.min()).toBe(-7);
    });

    it('works after clear', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      deque.pushBack(3);
      deque.clear();
      deque.pushBack(7);
      expect(deque.min()).toBe(7);
    });
  });

  describe('max', () => {
    it('returns max value', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      deque.pushBack(3);
      deque.pushBack(7);
      expect(deque.max()).toBe(7);
    });

    it('throws error when deque is empty', () => {
      const deque = new MinMaxDeque<number>();
      expect(() => deque.max()).toThrow('MinMaxDeque is empty');
    });

    it('returns single value for one element', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      expect(deque.max()).toBe(5);
    });

    it('tracks max correctly with duplicates', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      deque.pushBack(7);
      deque.pushBack(7);
      deque.pushBack(3);
      expect(deque.max()).toBe(7);
    });

    it('updates max after popFront', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(7);
      deque.pushBack(5);
      deque.pushBack(3);
      deque.popFront();
      expect(deque.max()).toBe(5);
    });

    it('updates max after popBack', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(7);
      deque.pushBack(5);
      deque.pushBack(3);
      deque.popBack();
      expect(deque.max()).toBe(7);
    });

    it('works with mixed pushFront and pushBack', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      deque.pushFront(10);
      deque.pushBack(7);
      deque.pushFront(3);
      expect(deque.max()).toBe(10);
    });

    it('handles negative values', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(-5);
      deque.pushBack(-3);
      deque.pushBack(-7);
      expect(deque.max()).toBe(-3);
    });

    it('works after clear', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      deque.pushBack(7);
      deque.clear();
      deque.pushBack(3);
      expect(deque.max()).toBe(3);
    });
  });

  describe('size', () => {
    it('returns 0 for empty deque', () => {
      const deque = new MinMaxDeque<number>();
      expect(deque.size()).toBe(0);
    });

    it('tracks size after pushBack', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      expect(deque.size()).toBe(1);
      deque.pushBack(2);
      expect(deque.size()).toBe(2);
      deque.pushBack(3);
      expect(deque.size()).toBe(3);
    });

    it('tracks size after pushFront', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushFront(1);
      expect(deque.size()).toBe(1);
      deque.pushFront(2);
      expect(deque.size()).toBe(2);
      deque.pushFront(3);
      expect(deque.size()).toBe(3);
    });

    it('tracks size after popFront', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popFront();
      expect(deque.size()).toBe(2);
      deque.popFront();
      expect(deque.size()).toBe(1);
    });

    it('tracks size after popBack', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popBack();
      expect(deque.size()).toBe(2);
      deque.popBack();
      expect(deque.size()).toBe(1);
    });

    it('tracks size after clear', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.size()).toBe(3);
      deque.clear();
      expect(deque.size()).toBe(0);
    });

    it('tracks size with mixed operations', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      deque.popBack();
      deque.pushBack(2);
      expect(deque.size()).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty deque', () => {
      const deque = new MinMaxDeque<number>();
      expect(deque.isEmpty()).toBe(true);
    });

    it('returns false after pushBack', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      expect(deque.isEmpty()).toBe(false);
    });

    it('returns false after pushFront', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushFront(1);
      expect(deque.isEmpty()).toBe(false);
    });

    it('returns true after all pops', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.popFront();
      deque.popFront();
      expect(deque.isEmpty()).toBe(true);
    });

    it('returns true after clear', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.clear();
      expect(deque.isEmpty()).toBe(true);
    });
  });

  describe('clear', () => {
    it('empties deque with items', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.clear();
      expect(deque.size()).toBe(0);
      expect(deque.isEmpty()).toBe(true);
    });

    it('works on empty deque', () => {
      const deque = new MinMaxDeque<number>();
      deque.clear();
      expect(deque.size()).toBe(0);
      expect(deque.isEmpty()).toBe(true);
    });

    it('allows operations after clear', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.clear();
      deque.pushBack(3);
      expect(deque.size()).toBe(1);
      expect(deque.peekFront()).toBe(3);
    });

    it('resets min and max tracking', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(5);
      deque.clear();
      deque.pushBack(3);
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(3);
    });

    it('is idempotent', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.clear();
      deque.clear();
      deque.clear();
      expect(deque.size()).toBe(0);
    });
  });

  describe('toArray', () => {
    it('returns empty array for empty deque', () => {
      const deque = new MinMaxDeque<number>();
      expect(deque.toArray()).toEqual([]);
    });

    it('returns all items in order', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('handles pushFront and pushBack', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      deque.pushBack(2);
      deque.pushFront(-1);
      expect(deque.toArray()).toEqual([-1, 0, 1, 2]);
    });

    it('handles single element', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      expect(deque.toArray()).toEqual([5]);
    });

    it('creates independent array', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      const arr = deque.toArray();
      arr.push(3);
      expect(deque.toArray()).toEqual([1, 2]);
    });

    it('handles duplicates', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      deque.pushBack(5);
      deque.pushBack(3);
      expect(deque.toArray()).toEqual([5, 5, 3]);
    });
  });

  describe('clone', () => {
    it('creates independent copy', () => {
      const deque1 = new MinMaxDeque<number>();
      deque1.pushBack(1);
      deque1.pushBack(2);
      deque1.pushBack(3);
      const deque2 = deque1.clone();
      expect(deque2.toArray()).toEqual([1, 2, 3]);
      expect(deque2.size()).toBe(3);
      expect(deque2.min()).toBe(1);
      expect(deque2.max()).toBe(3);
    });

    it('does not affect original when clone is modified', () => {
      const deque1 = new MinMaxDeque<number>();
      deque1.pushBack(1);
      deque1.pushBack(2);
      const deque2 = deque1.clone();
      deque2.pushBack(3);
      deque2.popFront();
      expect(deque1.toArray()).toEqual([1, 2]);
      expect(deque1.size()).toBe(2);
      expect(deque2.toArray()).toEqual([2, 3]);
      expect(deque2.size()).toBe(2);
    });

    it('clones empty deque', () => {
      const deque1 = new MinMaxDeque<number>();
      const deque2 = deque1.clone();
      expect(deque2.isEmpty()).toBe(true);
      expect(deque2.size()).toBe(0);
    });

    it('preserves comparator', () => {
      const deque1 = new MinMaxDeque<number>({ comparator: (a, b) => b - a });
      deque1.pushBack(1);
      deque1.pushBack(2);
      const deque2 = deque1.clone();
      deque2.pushBack(3);
      expect(deque2.min()).toBe(3);
      expect(deque2.max()).toBe(1);
    });

    it('clones with mixed pushFront and pushBack', () => {
      const deque1 = new MinMaxDeque<number>();
      deque1.pushBack(1);
      deque1.pushFront(0);
      deque1.pushBack(2);
      const deque2 = deque1.clone();
      expect(deque2.toArray()).toEqual([0, 1, 2]);
    });
  });

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result: number[] = [];
      deque.forEach(item => result.push(item));
      expect(result).toEqual([1, 2, 3]);
    });

    it('provides correct index', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const indices: number[] = [];
      deque.forEach((_, index) => indices.push(index));
      expect(indices).toEqual([0, 1, 2]);
    });

    it('does not iterate over empty deque', () => {
      const deque = new MinMaxDeque<number>();
      let count = 0;
      deque.forEach(() => count++);
      expect(count).toBe(0);
    });

    it('handles pushFront and pushBack order', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      deque.pushBack(2);
      const result: number[] = [];
      deque.forEach(item => result.push(item));
      expect(result).toEqual([0, 1, 2]);
    });

    it('iterates in correct order after pops', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      deque.popFront();
      const result: number[] = [];
      deque.forEach(item => result.push(item));
      expect(result).toEqual([2, 3]);
    });

    it('handles single element', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      const result: number[] = [];
      deque.forEach(item => result.push(item));
      expect(result).toEqual([5]);
    });
  });

  describe('Symbol.iterator', () => {
    it('supports for...of loop', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result: number[] = [];
      for (const item of deque) {
        result.push(item);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    it('supports spread operator', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = [...deque];
      expect(result).toEqual([1, 2, 3]);
    });

    it('supports Array.from', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushBack(3);
      const result = Array.from(deque);
      expect(result).toEqual([1, 2, 3]);
    });

    it('does not iterate over empty deque', () => {
      const deque = new MinMaxDeque<number>();
      const result = [...deque];
      expect(result).toEqual([]);
    });

    it('handles pushFront and pushBack order', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushFront(0);
      deque.pushBack(2);
      const result = [...deque];
      expect(result).toEqual([0, 1, 2]);
    });

    it('handles single element', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      const result = [...deque];
      expect(result).toEqual([5]);
    });
  });

  describe('fromArray', () => {
    it('creates deque from array', () => {
      const deque = MinMaxDeque.fromArray([1, 2, 3]);
      expect(deque.size()).toBe(3);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('creates empty deque from empty array', () => {
      const deque = MinMaxDeque.fromArray([]);
      expect(deque.isEmpty()).toBe(true);
      expect(deque.size()).toBe(0);
    });

    it('creates deque from single element array', () => {
      const deque = MinMaxDeque.fromArray([5]);
      expect(deque.size()).toBe(1);
      expect(deque.peekFront()).toBe(5);
    });

    it('handles duplicate values', () => {
      const deque = MinMaxDeque.fromArray([5, 5, 3, 5]);
      expect(deque.size()).toBe(4);
      expect(deque.toArray()).toEqual([5, 5, 3, 5]);
    });

    it('handles negative values', () => {
      const deque = MinMaxDeque.fromArray([-5, -3, -7]);
      expect(deque.min()).toBe(-7);
      expect(deque.max()).toBe(-3);
    });

    it('creates independent array', () => {
      const arr = [1, 2, 3];
      const deque = MinMaxDeque.fromArray(arr);
      arr.push(4);
      expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it('works with custom comparator', () => {
      const deque = MinMaxDeque.fromArray(
        [{ value: 5 }, { value: 3 }, { value: 7 }],
        { comparator: (a, b) => a.value - b.value }
      );
      expect(deque.size()).toBe(3);
      expect(deque.min()).toEqual({ value: 3 });
      expect(deque.max()).toEqual({ value: 7 });
    });

    it('works with reverse comparator', () => {
      const deque = MinMaxDeque.fromArray([1, 2, 3], { comparator: (a, b) => b - a });
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(1);
    });
  });

  describe('stress tests', () => {
    it('handles large dataset', () => {
      const deque = new MinMaxDeque<number>();
      for (let i = 0; i < 1000; i++) {
        deque.pushBack(i);
      }
      expect(deque.size()).toBe(1000);
      expect(deque.min()).toBe(0);
      expect(deque.max()).toBe(999);
    });

    it('handles many pushFront and popBack operations', () => {
      const deque = new MinMaxDeque<number>();
      for (let i = 0; i < 100; i++) {
        deque.pushFront(i);
      }
      for (let i = 0; i < 50; i++) {
        deque.popBack();
      }
      expect(deque.size()).toBe(50);
    });

    it('handles many pushBack and popFront operations', () => {
      const deque = new MinMaxDeque<number>();
      for (let i = 0; i < 100; i++) {
        deque.pushBack(i);
      }
      for (let i = 0; i < 50; i++) {
        deque.popFront();
      }
      expect(deque.size()).toBe(50);
      });

    it('handles mixed operations', () => {
      const deque = new MinMaxDeque<number>();
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          deque.pushBack(i);
        } else {
          deque.pushFront(i);
        }
      }
      expect(deque.size()).toBe(100);
      expect(deque.min()).toBe(0);
      expect(deque.max()).toBe(99);
    });

    it('handles multiple clears', () => {
      const deque = new MinMaxDeque<number>();
      for (let i = 0; i < 10; i++) {
        deque.pushBack(i);
      }
      deque.clear();
      for (let i = 0; i < 20; i++) {
        deque.pushBack(i);
      }
      deque.clear();
      expect(deque.size()).toBe(0);
    });

    it('handles min and max after many operations', () => {
      const deque = new MinMaxDeque<number>();
      for (let i = 0; i < 1000; i++) {
        deque.pushBack(Math.floor(Math.random() * 1000));
      }
      const min = deque.min();
      const max = deque.max();
      const arr = deque.toArray();
      expect(min).toBe(Math.min(...arr));
      expect(max).toBe(Math.max(...arr));
    });
  });

  describe('edge cases', () => {
    it('handles very large numbers', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(Number.MAX_VALUE);
      deque.pushBack(0);
      deque.pushBack(Number.MIN_SAFE_INTEGER);
      expect(deque.min()).toBe(Number.MIN_SAFE_INTEGER);
      expect(deque.max()).toBe(Number.MAX_VALUE);
    });

    it('handles floating point numbers', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1.5);
      deque.pushBack(2.7);
      deque.pushBack(0.3);
      expect(deque.toArray()).toEqual([1.5, 2.7, 0.3]);
      expect(deque.min()).toBe(0.3);
      expect(deque.max()).toBe(2.7);
    });

    it('handles mixed positive and negative', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(-5);
      deque.pushBack(0);
      deque.pushBack(5);
      expect(deque.toArray()).toEqual([-5, 0, 5]);
      expect(deque.min()).toBe(-5);
      expect(deque.max()).toBe(5);
    });

    it('handles zero values', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(0);
      deque.pushBack(0);
      deque.pushBack(0);
      expect(deque.min()).toBe(0);
      expect(deque.max()).toBe(0);
    });

    it('handles single element with all operations', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(5);
      expect(deque.peekFront()).toBe(5);
      expect(deque.peekBack()).toBe(5);
      expect(deque.min()).toBe(5);
      expect(deque.max()).toBe(5);
      expect(deque.popFront()).toBe(5);
      expect(deque.isEmpty()).toBe(true);
    });

    it('handles transfers between stacks', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.popFront();
      deque.pushBack(3);
      deque.popFront();
      deque.pushBack(4);
      expect(deque.toArray()).toEqual([3, 4]);
      expect(deque.min()).toBe(3);
      expect(deque.max()).toBe(4);
    });

    it('handles consecutive transfers', () => {
      const deque = new MinMaxDeque<number>();
      for (let i = 0; i < 10; i++) {
        deque.pushBack(i);
      }
      for (let i = 0; i < 5; i++) {
        deque.popFront();
      }
      for (let i = 10; i < 15; i++) {
        deque.pushBack(i);
      }
      for (let i = 5; i < 10; i++) {
        deque.popFront();
      }
      expect(deque.size()).toBe(5);
      expect(deque.toArray()).toEqual([10, 11, 12, 13, 14]);
    });
  });

  describe('integration tests', () => {
    it('maintains consistency with multiple operations', () => {
      const deque = new MinMaxDeque<number>();
      deque.pushBack(1);
      deque.pushBack(2);
      deque.pushFront(0);
      deque.pushBack(3);
      expect(deque.size()).toBe(4);
      expect(deque.toArray()).toEqual([0, 1, 2, 3]);
      expect(deque.min()).toBe(0);
      expect(deque.max()).toBe(3);
      expect(deque.popFront()).toBe(0);
      expect(deque.popBack()).toBe(3);
      expect(deque.size()).toBe(2);
      expect(deque.min()).toBe(1);
      expect(deque.max()).toBe(2);
    });

    it('maintains min and max with sliding window pattern', () => {
      const deque = new MinMaxDeque<number>();
      const arr = [5, 3, 7, 2, 8, 1, 6, 4];
      for (let i = 0; i < arr.length; i++) {
        if (deque.size() === 3) {
          deque.popFront();
        }
        deque.pushBack(arr[i]);
        expect(deque.min()).toBe(Math.min(...arr.slice(Math.max(0, i - 2), i + 1)));
        expect(deque.max()).toBe(Math.max(...arr.slice(Math.max(0, i - 2), i + 1)));
      }
    });

    it('handles complex sequence of operations', () => {
      const deque = new MinMaxDeque<number>();
      const operations = [1, 2, 3, 4, 5];
      for (const op of operations) {
        deque.pushBack(op);
      }
      for (let i = 0; i < 3; i++) {
        expect(deque.popFront()).toBe(i + 1);
      }
      for (let i = 6; i < 9; i++) {
        deque.pushFront(i);
      }
      expect(deque.toArray()).toEqual([8, 7, 6, 4, 5]);
      expect(deque.min()).toBe(4);
      expect(deque.max()).toBe(8);
    });
  });
});
