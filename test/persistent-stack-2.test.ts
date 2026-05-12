import { describe, it, expect } from 'vitest';
import { PersistentStack2 } from '../src/core/persistent-stack-2/index.js';

describe('PersistentStack2', () => {
  describe('constructor and empty stack', () => {
    it('creates empty stack', () => {
      const stack = new PersistentStack2<any>(null, 0);
      expect(stack.size).toBe(0);
      expect(stack.isEmpty).toBe(true);
      expect(stack.peek()).toBeUndefined();
    });

    it('empty stack toArray returns empty array', () => {
      const stack = new PersistentStack2<any>(null, 0);
      expect(stack.toArray()).toEqual([]);
    });
  });

  describe('push', () => {
    it('pushes value and returns new stack', () => {
      const stack1 = new PersistentStack2<number>(null, 0);
      const stack2 = stack1.push(1);
      expect(stack1.size).toBe(0);
      expect(stack2.size).toBe(1);
      expect(stack2.peek()).toBe(1);
    });

    it('pushes multiple values', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      expect(stack.size).toBe(3);
      expect(stack.peek()).toBe(3);
      expect(stack.toArray()).toEqual([3, 2, 1]);
    });

    it('original stack unchanged after push', () => {
      const stack1 = new PersistentStack2<number>(null, 0);
      const stack2 = stack1.push(1);
      const stack3 = stack2.push(2);
      expect(stack1.size).toBe(0);
      expect(stack2.size).toBe(1);
      expect(stack3.size).toBe(2);
    });

    it('pushes different types', () => {
      const stack1 = new PersistentStack2<any>(null, 0);
      const stack2 = stack1.push('hello');
      const stack3 = stack2.push(42);
      expect(stack3.toArray()).toEqual([42, 'hello']);
    });
  });

  describe('pop', () => {
    it('pops value and returns new stack', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      const popped = stack.pop();
      expect(stack.size).toBe(2);
      expect(popped.size).toBe(1);
      expect(popped.peek()).toBe(1);
    });

    it('pops all values returns empty', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.pop();
      stack = stack.pop();
      expect(stack.isEmpty).toBe(true);
      expect(stack.peek()).toBeUndefined();
    });

    it('original stack unchanged after pop', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      const popped = stack.pop();
      expect(stack.toArray()).toEqual([2, 1]);
      expect(popped.toArray()).toEqual([1]);
    });

    it('pop on empty stack returns empty', () => {
      const stack = new PersistentStack2<number>(null, 0);
      const popped = stack.pop();
      expect(popped.isEmpty).toBe(true);
    });
  });

  describe('peek', () => {
    it('returns top element', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      expect(stack.peek()).toBe(3);
    });

    it('returns undefined for empty stack', () => {
      const stack = new PersistentStack2<number>(null, 0);
      expect(stack.peek()).toBeUndefined();
    });

    it('does not modify stack', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack.peek();
      expect(stack.size).toBe(1);
      expect(stack.peek()).toBe(1);
    });
  });

  describe('size', () => {
    it('returns 0 for empty stack', () => {
      const stack = new PersistentStack2<number>(null, 0);
      expect(stack.size).toBe(0);
    });

    it('returns correct size after pushes', () => {
      let stack = new PersistentStack2<number>(null, 0);
      expect(stack.size).toBe(0);
      stack = stack.push(1);
      expect(stack.size).toBe(1);
      stack = stack.push(2);
      expect(stack.size).toBe(2);
    });

    it('returns correct size after pops', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      expect(stack.size).toBe(3);
      stack = stack.pop();
      expect(stack.size).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty stack', () => {
      const stack = new PersistentStack2<number>(null, 0);
      expect(stack.isEmpty).toBe(true);
    });

    it('returns false for non-empty stack', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      expect(stack.isEmpty).toBe(false);
    });

    it('returns true after all elements popped', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.pop();
      expect(stack.isEmpty).toBe(true);
    });
  });

  describe('toArray', () => {
    it('converts empty stack to empty array', () => {
      const stack = new PersistentStack2<number>(null, 0);
      expect(stack.toArray()).toEqual([]);
    });

    it('converts stack to array (top to bottom)', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      expect(stack.toArray()).toEqual([3, 2, 1]);
    });

    it('array is independent of stack', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      const arr = stack.toArray();
      arr[0] = 99;
      expect(stack.peek()).toBe(2);
    });
  });

  describe('forEach', () => {
    it('iterates over all elements', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      const results: number[] = [];
      stack.forEach(value => results.push(value));
      expect(results).toEqual([3, 2, 1]);
    });

    it('provides correct index', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      const indices: number[] = [];
      stack.forEach((_, index) => indices.push(index));
      expect(indices).toEqual([0, 1, 2]);
    });

    it('does not iterate on empty stack', () => {
      const stack = new PersistentStack2<number>(null, 0);
      let called = false;
      stack.forEach(() => { called = true; });
      expect(called).toBe(false);
    });
  });

  describe('map', () => {
    it('transforms all elements', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      const mapped = stack.map(x => x * 2);
      expect(mapped.toArray()).toEqual([6, 4, 2]);
    });

    it('returns new stack without modifying original', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      const mapped = stack.map(x => x * 2);
      expect(stack.toArray()).toEqual([2, 1]);
      expect(mapped.toArray()).toEqual([4, 2]);
    });

    it('changes element type', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      const mapped = stack.map(x => x.toString());
      expect(mapped.toArray()).toEqual(['2', '1']);
    });
  });

  describe('filter', () => {
    it('filters elements by predicate', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      stack = stack.push(4);
      const filtered = stack.filter(x => x % 2 === 0);
      expect(filtered.toArray()).toEqual([4, 2]);
    });

    it('returns empty stack when no elements match', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(3);
      stack = stack.push(5);
      const filtered = stack.filter(x => x % 2 === 0);
      expect(filtered.isEmpty).toBe(true);
    });

    it('returns copy when all elements match', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(2);
      stack = stack.push(4);
      const filtered = stack.filter(x => x % 2 === 0);
      expect(filtered.toArray()).toEqual([4, 2]);
    });
  });

  describe('reverse', () => {
    it('reverses stack order', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      const reversed = stack.reverse();
      expect(reversed.toArray()).toEqual([1, 2, 3]);
    });

    it('returns empty stack for empty stack', () => {
      const stack = new PersistentStack2<number>(null, 0);
      const reversed = stack.reverse();
      expect(reversed.isEmpty).toBe(true);
    });

    it('double reverse returns original', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      const doubleReversed = stack.reverse().reverse();
      expect(doubleReversed.toArray()).toEqual([3, 2, 1]);
    });
  });

  describe('concat', () => {
    it('concatenates two stacks', () => {
      let stack1 = new PersistentStack2<number>(null, 0);
      stack1 = stack1.push(1);
      stack1 = stack1.push(2);
      let stack2 = new PersistentStack2<number>(null, 0);
      stack2 = stack2.push(3);
      stack2 = stack2.push(4);
      const concatenated = stack1.concat(stack2);
      expect(concatenated.toArray()).toEqual([2, 1, 4, 3]);
    });

    it('concat with empty stack returns original', () => {
      let stack1 = new PersistentStack2<number>(null, 0);
      stack1 = stack1.push(1);
      const stack2 = new PersistentStack2<number>(null, 0);
      const concatenated = stack1.concat(stack2);
      expect(concatenated.toArray()).toEqual([1]);
    });

    it('empty stack concat with non-empty returns non-empty', () => {
      const stack1 = new PersistentStack2<number>(null, 0);
      let stack2 = new PersistentStack2<number>(null, 0);
      stack2 = stack2.push(1);
      const concatenated = stack1.concat(stack2);
      expect(concatenated.toArray()).toEqual([1]);
    });

    it('does not modify original stacks', () => {
      let stack1 = new PersistentStack2<number>(null, 0);
      stack1 = stack1.push(1);
      let stack2 = new PersistentStack2<number>(null, 0);
      stack2 = stack2.push(2);
      stack1.concat(stack2);
      expect(stack1.toArray()).toEqual([1]);
      expect(stack2.toArray()).toEqual([2]);
    });
  });

  describe('every', () => {
    it('returns true when all elements satisfy predicate', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(2);
      stack = stack.push(4);
      stack = stack.push(6);
      expect(stack.every(x => x % 2 === 0)).toBe(true);
    });

    it('returns false when any element fails predicate', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(2);
      stack = stack.push(3);
      stack = stack.push(4);
      expect(stack.every(x => x % 2 === 0)).toBe(false);
    });

    it('returns true for empty stack', () => {
      const stack = new PersistentStack2<number>(null, 0);
      expect(stack.every(() => false)).toBe(true);
    });
  });

  describe('some', () => {
    it('returns true when any element satisfies predicate', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      expect(stack.some(x => x % 2 === 0)).toBe(true);
    });

    it('returns false when no element satisfies predicate', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(3);
      stack = stack.push(5);
      expect(stack.some(x => x % 2 === 0)).toBe(false);
    });

    it('returns false for empty stack', () => {
      const stack = new PersistentStack2<number>(null, 0);
      expect(stack.some(() => true)).toBe(false);
    });
  });

  describe('find', () => {
    it('returns first matching element', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      stack = stack.push(4);
      expect(stack.find(x => x % 2 === 0)).toBe(4);
    });

    it('returns undefined when no element matches', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(3);
      stack = stack.push(5);
      expect(stack.find(x => x % 2 === 0)).toBeUndefined();
    });

    it('returns undefined for empty stack', () => {
      const stack = new PersistentStack2<number>(null, 0);
      expect(stack.find(() => true)).toBeUndefined();
    });
  });

  describe('includes', () => {
    it('returns true when value exists', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      expect(stack.includes(2)).toBe(true);
    });

    it('returns false when value does not exist', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      expect(stack.includes(4)).toBe(false);
    });

    it('returns false for empty stack', () => {
      const stack = new PersistentStack2<number>(null, 0);
      expect(stack.includes(1)).toBe(false);
    });

    it('uses strict equality', () => {
      let stack = new PersistentStack2<number | null>(null, 0);
      stack = stack.push(0);
      expect(stack.includes(null)).toBe(false);
    });
  });

  describe('structural sharing', () => {
    it('shared nodes are referenced after push', () => {
      let stack1 = new PersistentStack2<number>(null, 0);
      stack1 = stack1.push(1);
      stack1 = stack1.push(2);
      const stack2 = stack1.push(3);
      expect(stack2.toArray()).toEqual([3, 2, 1]);
      expect(stack1.toArray()).toEqual([2, 1]);
    });

    it('multiple pushes share structure', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      const arr = stack.toArray();
      expect(arr).toEqual([3, 2, 1]);
    });
  });

  describe('static from', () => {
    it('creates stack from array', () => {
      const stack = PersistentStack2.from([1, 2, 3]);
      expect(stack.toArray()).toEqual([3, 2, 1]);
    });

    it('creates empty stack from empty array', () => {
      const stack = PersistentStack2.from([]);
      expect(stack.isEmpty).toBe(true);
    });

    it('creates stack from single element array', () => {
      const stack = PersistentStack2.from([42]);
      expect(stack.toArray()).toEqual([42]);
    });

    it('creates stack from large array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i);
      const stack = PersistentStack2.from(arr);
      expect(stack.size).toBe(1000);
      expect(stack.peek()).toBe(999);
    });
  });

  describe('single element stack', () => {
    it('behaves correctly with single element', () => {
      const stack = PersistentStack2.from([1]);
      expect(stack.size).toBe(1);
      expect(stack.isEmpty).toBe(false);
      expect(stack.peek()).toBe(1);
      expect(stack.pop().isEmpty).toBe(true);
    });
  });

  describe('large stack', () => {
    it('handles 10000 elements', () => {
      let stack = new PersistentStack2<number>(null, 0);
      for (let i = 0; i < 10000; i++) {
        stack = stack.push(i);
      }
      expect(stack.size).toBe(10000);
      expect(stack.peek()).toBe(9999);
    });

    it('filter works on large stack', () => {
      let stack = new PersistentStack2<number>(null, 0);
      for (let i = 0; i < 1000; i++) {
        stack = stack.push(i);
      }
      const filtered = stack.filter(x => x % 2 === 0);
      expect(filtered.size).toBe(500);
    });

    it('map works on large stack', () => {
      let stack = new PersistentStack2<number>(null, 0);
      for (let i = 0; i < 1000; i++) {
        stack = stack.push(i);
      }
      const mapped = stack.map(x => x * 2);
      expect(mapped.size).toBe(1000);
      expect(mapped.peek()).toBe(1998);
    });
  });

  describe('chaining operations', () => {
    it('chains push operations', () => {
      const stack = new PersistentStack2<number>(null, 0)
        .push(1)
        .push(2)
        .push(3);
      expect(stack.toArray()).toEqual([3, 2, 1]);
    });

    it('chains pop operations', () => {
      let stack = new PersistentStack2<number>(null, 0);
      stack = stack.push(1);
      stack = stack.push(2);
      stack = stack.push(3);
      const popped = stack.pop().pop();
      expect(popped.toArray()).toEqual([1]);
    });

    it('chains map and filter', () => {
      const stack = PersistentStack2.from([1, 2, 3, 4, 5]);
      const result = stack
        .map(x => x * 2)
        .filter(x => x > 5);
      expect(result.toArray()).toEqual([10, 8, 6]);
    });

    it('chains reverse operations', () => {
      const stack = PersistentStack2.from([1, 2, 3]);
      const result = stack.reverse().reverse();
      expect(result.toArray()).toEqual([3, 2, 1]);
    });
  });

  describe('immutability verification', () => {
    it('push does not modify original', () => {
      const original = PersistentStack2.from([1, 2, 3]);
      const modified = original.push(4);
      expect(original.toArray()).toEqual([3, 2, 1]);
      expect(modified.toArray()).toEqual([4, 3, 2, 1]);
    });

    it('pop does not modify original', () => {
      const original = PersistentStack2.from([1, 2, 3]);
      const modified = original.pop();
      expect(original.toArray()).toEqual([3, 2, 1]);
      expect(modified.toArray()).toEqual([2, 1]);
    });

    it('map does not modify original', () => {
      const original = PersistentStack2.from([1, 2, 3]);
      const modified = original.map(x => x * 2);
      expect(original.toArray()).toEqual([3, 2, 1]);
      expect(modified.toArray()).toEqual([6, 4, 2]);
    });

    it('filter does not modify original', () => {
      const original = PersistentStack2.from([1, 2, 3, 4, 5]);
      const modified = original.filter(x => x % 2 === 0);
      expect(original.toArray()).toEqual([5, 4, 3, 2, 1]);
      expect(modified.toArray()).toEqual([4, 2]);
    });

    it('reverse does not modify original', () => {
      const original = PersistentStack2.from([1, 2, 3]);
      const modified = original.reverse();
      expect(original.toArray()).toEqual([3, 2, 1]);
      expect(modified.toArray()).toEqual([1, 2, 3]);
    });

    it('concat does not modify original', () => {
      const original1 = PersistentStack2.from([1, 2]);
      const original2 = PersistentStack2.from([3, 4]);
      const concatenated = original1.concat(original2);
      expect(original1.toArray()).toEqual([2, 1]);
      expect(original2.toArray()).toEqual([4, 3]);
      expect(concatenated.toArray()).toEqual([2, 1, 4, 3]);
    });
  });
});
