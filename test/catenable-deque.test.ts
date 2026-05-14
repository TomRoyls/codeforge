import { describe, it, expect, beforeEach } from 'vitest';
import { CatenableDeque } from '../src/core/catenable-deque/index.js';

describe('CatenableDeque', () => {
  let deque: CatenableDeque<number>;

  beforeEach(() => {
    deque = CatenableDeque.empty<number>();
  });

  describe('static empty', () => {
    it('creates empty deque', () => {
      const empty = CatenableDeque.empty<number>();
      expect(empty.size).toBe(0);
      expect(empty.isEmpty).toBe(true);
    });
  });

  describe('static fromArray', () => {
    it('creates deque from array', () => {
      const arr = [1, 2, 3, 4, 5];
      const newDeque = CatenableDeque.fromArray(arr);
      expect(newDeque.toArray()).toEqual(arr);
      expect(newDeque.size).toBe(5);
    });

    it('handles empty array', () => {
      const newDeque = CatenableDeque.fromArray<number>([]);
      expect(newDeque.size).toBe(0);
      expect(newDeque.isEmpty).toBe(true);
      expect(newDeque.toArray()).toEqual([]);
    });

    it('handles single element array', () => {
      const newDeque = CatenableDeque.fromArray([42]);
      expect(newDeque.size).toBe(1);
      expect(newDeque.front()).toBe(42);
      expect(newDeque.back()).toBe(42);
    });
  });

  describe('static of', () => {
    it('creates deque from arguments', () => {
      const newDeque = CatenableDeque.of(1, 2, 3);
      expect(newDeque.toArray()).toEqual([1, 2, 3]);
      expect(newDeque.size).toBe(3);
    });

    it('handles no arguments', () => {
      const newDeque = CatenableDeque.of<number>();
      expect(newDeque.size).toBe(0);
      expect(newDeque.isEmpty).toBe(true);
    });

    it('handles single argument', () => {
      const newDeque = CatenableDeque.of(42);
      expect(newDeque.size).toBe(1);
      expect(newDeque.front()).toBe(42);
    });
  });

  describe('pushFront', () => {
    it('adds element to front', () => {
      const result = deque.pushFront(1);
      expect(result.front()).toBe(1);
      expect(result.size).toBe(1);
    });

    it('maintains order with multiple pushFront', () => {
      const result = deque.pushFront(3).pushFront(2).pushFront(1);
      expect(result.toArray()).toEqual([1, 2, 3]);
      expect(result.front()).toBe(1);
      expect(result.back()).toBe(3);
    });

    it('returns new deque without modifying original', () => {
      const original = deque.pushFront(1);
      const modified = original.pushFront(2);
      expect(original.toArray()).toEqual([1]);
      expect(modified.toArray()).toEqual([2, 1]);
    });
  });

  describe('pushBack', () => {
    it('adds element to back', () => {
      const result = deque.pushBack(1);
      expect(result.back()).toBe(1);
      expect(result.size).toBe(1);
    });

    it('maintains order with multiple pushBack', () => {
      const result = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(result.toArray()).toEqual([1, 2, 3]);
      expect(result.front()).toBe(1);
      expect(result.back()).toBe(3);
    });

    it('returns new deque without modifying original', () => {
      const original = deque.pushBack(1);
      const modified = original.pushBack(2);
      expect(original.toArray()).toEqual([1]);
      expect(modified.toArray()).toEqual([1, 2]);
    });
  });

  describe('popFront', () => {
    it('removes element from front', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.popFront();
      expect(result.toArray()).toEqual([2, 3]);
      expect(result.front()).toBe(2);
    });

    it('returns empty when popping single element', () => {
      const single = deque.pushFront(1);
      const result = single.popFront();
      expect(result.size).toBe(0);
      expect(result.isEmpty).toBe(true);
    });

    it('handles popping empty deque', () => {
      const result = deque.popFront();
      expect(result.size).toBe(0);
      expect(result.isEmpty).toBe(true);
    });

    it('returns new deque without modifying original', () => {
      const original = deque.pushBack(1).pushBack(2);
      const modified = original.popFront();
      expect(original.toArray()).toEqual([1, 2]);
      expect(modified.toArray()).toEqual([2]);
    });
  });

  describe('popBack', () => {
    it('removes element from back', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.popBack();
      expect(result.toArray()).toEqual([1, 2]);
      expect(result.back()).toBe(2);
    });

    it('returns empty when popping single element', () => {
      const single = deque.pushBack(1);
      const result = single.popBack();
      expect(result.size).toBe(0);
      expect(result.isEmpty).toBe(true);
    });

    it('handles popping empty deque', () => {
      const result = deque.popBack();
      expect(result.size).toBe(0);
      expect(result.isEmpty).toBe(true);
    });

    it('returns new deque without modifying original', () => {
      const original = deque.pushBack(1).pushBack(2);
      const modified = original.popBack();
      expect(original.toArray()).toEqual([1, 2]);
      expect(modified.toArray()).toEqual([1]);
    });
  });

  describe('front', () => {
    it('returns front element', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.front()).toBe(1);
    });

    it('returns undefined for empty deque', () => {
      expect(deque.front()).toBe(undefined);
    });

    it('returns correct front after pushFront', () => {
      const result = deque.pushFront(3).pushFront(2).pushFront(1);
      expect(result.front()).toBe(1);
    });
  });

  describe('back', () => {
    it('returns back element', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.back()).toBe(3);
    });

    it('returns undefined for empty deque', () => {
      expect(deque.back()).toBe(undefined);
    });

    it('returns correct back after pushBack', () => {
      const result = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(result.back()).toBe(3);
    });
  });

  describe('size', () => {
    it('returns 0 for empty deque', () => {
      expect(deque.size).toBe(0);
    });

    it('tracks size after pushBack', () => {
      const result = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(result.size).toBe(3);
    });

    it('tracks size after pushFront', () => {
      const result = deque.pushFront(1).pushFront(2).pushFront(3);
      expect(result.size).toBe(3);
    });

    it('tracks size after popFront', () => {
      const result = deque.pushBack(1).pushBack(2).pushBack(3).popFront();
      expect(result.size).toBe(2);
    });

    it('tracks size after popBack', () => {
      const result = deque.pushBack(1).pushBack(2).pushBack(3).popBack();
      expect(result.size).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty deque', () => {
      expect(deque.isEmpty).toBe(true);
    });

    it('returns false for non-empty deque', () => {
      const result = deque.pushBack(1);
      expect(result.isEmpty).toBe(false);
    });

    it('returns true after clearing', () => {
      const filled = deque.pushBack(1).pushBack(2);
      const cleared = filled.clear();
      expect(cleared.isEmpty).toBe(true);
    });
  });

  describe('clear', () => {
    it('returns empty deque', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.clear();
      expect(result.size).toBe(0);
      expect(result.isEmpty).toBe(true);
      expect(result.toArray()).toEqual([]);
    });

    it('does not modify original deque', () => {
      const original = deque.pushBack(1).pushBack(2);
      const cleared = original.clear();
      expect(original.toArray()).toEqual([1, 2]);
      expect(cleared.toArray()).toEqual([]);
    });
  });

  describe('concat', () => {
    it('concatenates two deques', () => {
      const d1 = CatenableDeque.of(1, 2);
      const d2 = CatenableDeque.of(3, 4);
      const result = d1.concat(d2);
      expect(result.toArray()).toEqual([1, 2, 3, 4]);
      expect(result.size).toBe(4);
    });

    it('handles empty left deque', () => {
      const d2 = CatenableDeque.of(1, 2);
      const result = deque.concat(d2);
      expect(result.toArray()).toEqual([1, 2]);
    });

    it('handles empty right deque', () => {
      const d1 = CatenableDeque.of(1, 2);
      const result = d1.concat(deque);
      expect(result.toArray()).toEqual([1, 2]);
    });

    it('handles both empty deques', () => {
      const result = deque.concat(deque);
      expect(result.size).toBe(0);
      expect(result.isEmpty).toBe(true);
    });

    it('does not modify original deques', () => {
      const d1 = CatenableDeque.of(1, 2);
      const d2 = CatenableDeque.of(3, 4);
      const result = d1.concat(d2);
      expect(d1.toArray()).toEqual([1, 2]);
      expect(d2.toArray()).toEqual([3, 4]);
      expect(result.toArray()).toEqual([1, 2, 3, 4]);
    });
  });

  describe('toArray', () => {
    it('converts to array', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.toArray()).toEqual([1, 2, 3]);
    });

    it('returns empty array for empty deque', () => {
      expect(deque.toArray()).toEqual([]);
    });

    it('handles pushFront order', () => {
      const result = deque.pushFront(3).pushFront(2).pushFront(1);
      expect(result.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result: number[] = [];
      filled.forEach((value, index) => {
        result.push(value);
        expect(index).toBe(value - 1);
      });
      expect(result).toEqual([1, 2, 3]);
    });

    it('does not iterate over empty deque', () => {
      let count = 0;
      deque.forEach(() => {
        count++;
      });
      expect(count).toBe(0);
    });

    it('maintains iteration order', () => {
      const result = deque.pushFront(3).pushFront(2).pushFront(1);
      const values: number[] = [];
      result.forEach(v => values.push(v));
      expect(values).toEqual([1, 2, 3]);
    });
  });

  describe('map', () => {
    it('maps values to new deque', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.map(x => x * 2);
      expect(result.toArray()).toEqual([2, 4, 6]);
      expect(result.size).toBe(3);
    });

    it('provides index to map function', () => {
      const filled = deque.pushBack(10).pushBack(20).pushBack(30);
      const result = filled.map((v, i) => v + i);
      expect(result.toArray()).toEqual([10, 21, 32]);
    });

    it('handles empty deque', () => {
      const result = deque.map(x => x * 2);
      expect(result.size).toBe(0);
      expect(result.toArray()).toEqual([]);
    });

    it('maps to different type', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.map(x => `value: ${x}`);
      expect(result.toArray()).toEqual(['value: 1', 'value: 2', 'value: 3']);
    });

    it('does not modify original deque', () => {
      const original = deque.pushBack(1).pushBack(2);
      const mapped = original.map(x => x * 2);
      expect(original.toArray()).toEqual([1, 2]);
      expect(mapped.toArray()).toEqual([2, 4]);
    });
  });

  describe('filter', () => {
    it('filters values by predicate', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3).pushBack(4).pushBack(5);
      const result = filled.filter(x => x % 2 === 1);
      expect(result.toArray()).toEqual([1, 3, 5]);
      expect(result.size).toBe(3);
    });

    it('provides index to filter function', () => {
      const filled = deque.pushBack(10).pushBack(20).pushBack(30);
      const result = filled.filter((v, i) => i >= 1);
      expect(result.toArray()).toEqual([20, 30]);
    });

    it('handles empty deque', () => {
      const result = deque.filter(x => x > 0);
      expect(result.size).toBe(0);
      expect(result.toArray()).toEqual([]);
    });

    it('filters all elements', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.filter(x => x > 10);
      expect(result.size).toBe(0);
      expect(result.toArray()).toEqual([]);
    });

    it('filters no elements', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.filter(x => x > 0);
      expect(result.size).toBe(3);
      expect(result.toArray()).toEqual([1, 2, 3]);
    });

    it('does not modify original deque', () => {
      const original = deque.pushBack(1).pushBack(2).pushBack(3);
      const filtered = original.filter(x => x % 2 === 1);
      expect(original.toArray()).toEqual([1, 2, 3]);
      expect(filtered.toArray()).toEqual([1, 3]);
    });
  });

  describe('reduce', () => {
    it('reduces to single value', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.reduce((acc, v) => acc + v, 0);
      expect(result).toBe(6);
    });

    it('provides index to reduce function', () => {
      const filled = deque.pushBack(10).pushBack(20).pushBack(30);
      const result = filled.reduce((acc, v, i) => acc + v + i, 0);
      expect(result).toBe(63);
    });

    it('handles empty deque', () => {
      const result = deque.reduce((acc, v) => acc + v, 100);
      expect(result).toBe(100);
    });

    it('reduces with different accumulator type', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.reduce((acc, v) => acc + v.toString(), '');
      expect(result).toBe('123');
    });
  });

  describe('reverse', () => {
    it('reverses deque', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.reverse();
      expect(result.toArray()).toEqual([3, 2, 1]);
    });

    it('handles empty deque', () => {
      const result = deque.reverse();
      expect(result.size).toBe(0);
      expect(result.toArray()).toEqual([]);
    });

    it('handles single element', () => {
      const single = deque.pushBack(1);
      const result = single.reverse();
      expect(result.toArray()).toEqual([1]);
    });

    it('does not modify original deque', () => {
      const original = deque.pushBack(1).pushBack(2).pushBack(3);
      const reversed = original.reverse();
      expect(original.toArray()).toEqual([1, 2, 3]);
      expect(reversed.toArray()).toEqual([3, 2, 1]);
    });
  });

  describe('clone', () => {
    it('clones empty deque', () => {
      const cloned = deque.clone();
      expect(cloned.size).toBe(0);
      expect(cloned.isEmpty).toBe(true);
    });

    it('clones non-empty deque', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const cloned = filled.clone();
      expect(cloned.toArray()).toEqual([1, 2, 3]);
      expect(cloned.size).toBe(3);
    });

    it('clone is independent', () => {
      const original = deque.pushBack(1).pushBack(2);
      const cloned = original.clone();
      const modified = cloned.pushBack(3);
      expect(original.toArray()).toEqual([1, 2]);
      expect(cloned.toArray()).toEqual([1, 2]);
      expect(modified.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('find', () => {
    it('finds matching element', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.find(x => x === 2)).toBe(2);
    });

    it('returns undefined if not found', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.find(x => x === 5)).toBe(undefined);
    });

    it('provides index to predicate', () => {
      const filled = deque.pushBack(10).pushBack(20).pushBack(30);
      expect(filled.find((v, i) => i === 1)).toBe(20);
    });

    it('handles empty deque', () => {
      expect(deque.find(x => x === 1)).toBe(undefined);
    });

    it('finds first match', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(1);
      expect(filled.find(x => x === 1)).toBe(1);
    });
  });

  describe('findIndex', () => {
    it('finds index of matching element', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.findIndex(x => x === 2)).toBe(1);
    });

    it('returns -1 if not found', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.findIndex(x => x === 5)).toBe(-1);
    });

    it('provides index to predicate', () => {
      const filled = deque.pushBack(10).pushBack(20).pushBack(30);
      expect(filled.findIndex((v, i) => i === 2)).toBe(2);
    });

    it('handles empty deque', () => {
      expect(deque.findIndex(x => x === 1)).toBe(-1);
    });

    it('finds first match index', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(1);
      expect(filled.findIndex(x => x === 1)).toBe(0);
    });
  });

  describe('some', () => {
    it('returns true if any element matches', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.some(x => x === 2)).toBe(true);
    });

    it('returns false if no element matches', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.some(x => x === 5)).toBe(false);
    });

    it('provides index to predicate', () => {
      const filled = deque.pushBack(10).pushBack(20).pushBack(30);
      expect(filled.some((v, i) => i === 1)).toBe(true);
    });

    it('handles empty deque', () => {
      expect(deque.some(x => x === 1)).toBe(false);
    });
  });

  describe('every', () => {
    it('returns true if all elements match', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.every(x => x > 0)).toBe(true);
    });

    it('returns false if any element does not match', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.every(x => x > 1)).toBe(false);
    });

    it('provides index to predicate', () => {
      const filled = deque.pushBack(10).pushBack(20).pushBack(30);
      expect(filled.every((v, i) => i >= 0)).toBe(true);
    });

    it('handles empty deque', () => {
      expect(deque.every(x => x > 0)).toBe(true);
    });
  });

  describe('contains', () => {
    it('returns true for existing value', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.contains(2)).toBe(true);
    });

    it('returns false for non-existent value', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.contains(5)).toBe(false);
    });

    it('handles empty deque', () => {
      expect(deque.contains(1)).toBe(false);
    });

    it('uses strict equality', () => {
      const filled = deque.pushBack(1).pushBack('1').pushBack(1);
      expect(filled.contains(1)).toBe(true);
      expect(filled.contains('1')).toBe(true);
    });
  });

  describe('indexOf', () => {
    it('finds first index of value', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.indexOf(2)).toBe(1);
    });

    it('returns -1 for non-existent value', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.indexOf(5)).toBe(-1);
    });

    it('handles empty deque', () => {
      expect(deque.indexOf(1)).toBe(-1);
    });

    it('finds first occurrence', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(1);
      expect(filled.indexOf(1)).toBe(0);
    });
  });

  describe('lastIndexOf', () => {
    it('finds last index of value', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(1);
      expect(filled.lastIndexOf(1)).toBe(2);
    });

    it('returns -1 for non-existent value', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.lastIndexOf(5)).toBe(-1);
    });

    it('handles empty deque', () => {
      expect(deque.lastIndexOf(1)).toBe(-1);
    });

    it('finds last occurrence', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3).pushBack(2);
      expect(filled.lastIndexOf(2)).toBe(3);
    });
  });

  describe('get', () => {
    it('gets element at index', () => {
      const filled = deque.pushBack(10).pushBack(20).pushBack(30);
      expect(filled.get(0)).toBe(10);
      expect(filled.get(1)).toBe(20);
      expect(filled.get(2)).toBe(30);
    });

    it('returns undefined for out of bounds index', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.get(-1)).toBe(undefined);
      expect(filled.get(3)).toBe(undefined);
      expect(filled.get(100)).toBe(undefined);
    });

    it('handles empty deque', () => {
      expect(deque.get(0)).toBe(undefined);
    });

    it('handles negative index', () => {
      const filled = deque.pushBack(1).pushBack(2);
      expect(filled.get(-1)).toBe(undefined);
    });
  });

  describe('slice', () => {
    it('slices with start and end', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3).pushBack(4).pushBack(5);
      const result = filled.slice(1, 4);
      expect(result.toArray()).toEqual([2, 3, 4]);
      expect(result.size).toBe(3);
    });

    it('slices with only start', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3).pushBack(4).pushBack(5);
      const result = filled.slice(2);
      expect(result.toArray()).toEqual([3, 4, 5]);
      expect(result.size).toBe(3);
    });

    it('slices with no arguments', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.slice();
      expect(result.toArray()).toEqual([1, 2, 3]);
      expect(result.size).toBe(3);
    });

    it('handles empty slice', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.slice(1, 1);
      expect(result.toArray()).toEqual([]);
      expect(result.size).toBe(0);
    });

    it('does not modify original deque', () => {
      const original = deque.pushBack(1).pushBack(2).pushBack(3);
      const sliced = original.slice(1, 2);
      expect(original.toArray()).toEqual([1, 2, 3]);
      expect(sliced.toArray()).toEqual([2]);
    });
  });

  describe('take', () => {
    it('takes first n elements', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3).pushBack(4).pushBack(5);
      const result = filled.take(3);
      expect(result.toArray()).toEqual([1, 2, 3]);
      expect(result.size).toBe(3);
    });

    it('handles n = 0', () => {
      const filled = deque.pushBack(1).pushBack(2);
      const result = filled.take(0);
      expect(result.size).toBe(0);
      expect(result.toArray()).toEqual([]);
    });

    it('handles n greater than size', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.take(10);
      expect(result.toArray()).toEqual([1, 2, 3]);
      expect(result.size).toBe(3);
    });

    it('handles negative n', () => {
      const filled = deque.pushBack(1).pushBack(2);
      const result = filled.take(-1);
      expect(result.size).toBe(0);
      expect(result.toArray()).toEqual([]);
    });

    it('does not modify original deque', () => {
      const original = deque.pushBack(1).pushBack(2).pushBack(3);
      const taken = original.take(2);
      expect(original.toArray()).toEqual([1, 2, 3]);
      expect(taken.toArray()).toEqual([1, 2]);
    });
  });

  describe('drop', () => {
    it('drops first n elements', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3).pushBack(4).pushBack(5);
      const result = filled.drop(2);
      expect(result.toArray()).toEqual([3, 4, 5]);
      expect(result.size).toBe(3);
    });

    it('handles n = 0', () => {
      const filled = deque.pushBack(1).pushBack(2);
      const result = filled.drop(0);
      expect(result.toArray()).toEqual([1, 2]);
      expect(result.size).toBe(2);
    });

    it('handles n greater than size', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.drop(10);
      expect(result.size).toBe(0);
      expect(result.toArray()).toEqual([]);
    });

    it('handles negative n', () => {
      const filled = deque.pushBack(1).pushBack(2);
      const result = filled.drop(-1);
      expect(result.toArray()).toEqual([1, 2]);
      expect(result.size).toBe(2);
    });

    it('does not modify original deque', () => {
      const original = deque.pushBack(1).pushBack(2).pushBack(3);
      const dropped = original.drop(1);
      expect(original.toArray()).toEqual([1, 2, 3]);
      expect(dropped.toArray()).toEqual([2, 3]);
    });
  });

  describe('join', () => {
    it('joins elements with default separator', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.join()).toBe('1,2,3');
    });

    it('joins elements with custom separator', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      expect(filled.join('|')).toBe('1|2|3');
    });

    it('handles empty deque', () => {
      expect(deque.join()).toBe('');
    });

    it('handles single element', () => {
      const single = deque.pushBack(42);
      expect(single.join()).toBe('42');
    });
  });

  describe('equals', () => {
    it('returns true for equal deques', () => {
      const d1 = CatenableDeque.of(1, 2, 3);
      const d2 = CatenableDeque.of(1, 2, 3);
      expect(d1.equals(d2)).toBe(true);
    });

    it('returns false for different sizes', () => {
      const d1 = CatenableDeque.of(1, 2);
      const d2 = CatenableDeque.of(1, 2, 3);
      expect(d1.equals(d2)).toBe(false);
    });

    it('returns false for different values', () => {
      const d1 = CatenableDeque.of(1, 2, 3);
      const d2 = CatenableDeque.of(1, 2, 4);
      expect(d1.equals(d2)).toBe(false);
    });

    it('uses default comparator', () => {
      const d1 = CatenableDeque.of(1, 2, 3);
      const d2 = CatenableDeque.of(1, 2, 3);
      expect(d1.equals(d2)).toBe(true);
    });

    it('uses custom comparator', () => {
      const d1 = CatenableDeque.of(1, 2, 3);
      const d2 = CatenableDeque.of(1, 2, 3);
      expect(d1.equals(d2, (a, b) => Math.abs(a - b) <= 1)).toBe(true);
    });

    it('handles empty deques', () => {
      const d1 = CatenableDeque.empty<number>();
      const d2 = CatenableDeque.empty<number>();
      expect(d1.equals(d2)).toBe(true);
    });
  });

  describe('flatMap', () => {
    it('maps and flattens', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.flatMap(x => CatenableDeque.of(x, x * 10));
      expect(result.toArray()).toEqual([1, 10, 2, 20, 3, 30]);
      expect(result.size).toBe(6);
    });

    it('provides index to function', () => {
      const filled = deque.pushBack(10).pushBack(20).pushBack(30);
      const result = filled.flatMap((v, i) => CatenableDeque.of(v + i));
      expect(result.toArray()).toEqual([10, 21, 32]);
    });

    it('handles empty results', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = filled.flatMap(x => CatenableDeque.empty<number>());
      expect(result.size).toBe(0);
      expect(result.toArray()).toEqual([]);
    });

    it('handles empty deque', () => {
      const result = deque.flatMap(x => CatenableDeque.of(x, x * 2));
      expect(result.size).toBe(0);
      expect(result.toArray()).toEqual([]);
    });

    it('does not modify original deque', () => {
      const original = deque.pushBack(1).pushBack(2);
      const flatMapped = original.flatMap(x => CatenableDeque.of(x, x * 2));
      expect(original.toArray()).toEqual([1, 2]);
      expect(flatMapped.toArray()).toEqual([1, 2, 2, 4]);
    });
  });

  describe('stats', () => {
    it('returns stats for empty deque', () => {
      const stats = deque.stats();
      expect(stats.size).toBe(0);
      expect(stats.depth).toBe(0);
      expect(stats.leafCount).toBe(0);
      expect(stats.nodeCount).toBe(0);
    });

    it('returns stats for single element', () => {
      const single = deque.pushBack(1);
      const stats = single.stats();
      expect(stats.size).toBe(1);
      expect(stats.depth).toBe(1);
      expect(stats.leafCount).toBe(1);
      expect(stats.nodeCount).toBe(0);
    });

    it('returns stats for multiple elements', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3).pushBack(4);
      const stats = filled.stats();
      expect(stats.size).toBe(4);
      expect(stats.depth).toBeGreaterThanOrEqual(1);
      expect(stats.leafCount).toBeGreaterThan(0);
      expect(stats.nodeCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('iterator', () => {
    it('supports for...of iteration', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result: number[] = [];
      for (const value of filled) {
        result.push(value);
      }
      expect(result).toEqual([1, 2, 3]);
    });

    it('supports spread operator', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3);
      const result = [...filled];
      expect(result).toEqual([1, 2, 3]);
    });

    it('iterates over empty deque', () => {
      const result = [...deque];
      expect(result).toEqual([]);
    });

    it('maintains order', () => {
      const result = deque.pushFront(3).pushFront(2).pushFront(1);
      const values: number[] = [];
      for (const value of result) {
        values.push(value);
      }
      expect(values).toEqual([1, 2, 3]);
    });
  });

  describe('mixed operations', () => {
    it('handles alternating pushFront and pushBack', () => {
      const result = deque.pushBack(1).pushFront(0).pushBack(2).pushFront(-1);
      expect(result.toArray()).toEqual([-1, 0, 1, 2]);
      expect(result.front()).toBe(-1);
      expect(result.back()).toBe(2);
    });

    it('handles alternating popFront and popBack', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3).pushBack(4);
      const result = filled.popFront().popBack();
      expect(result.toArray()).toEqual([2, 3]);
      expect(result.front()).toBe(2);
      expect(result.back()).toBe(3);
    });

    it('handles concat after modifications', () => {
      const d1 = deque.pushBack(1).pushBack(2);
      const d2 = deque.pushBack(3).pushBack(4);
      const result = d1.concat(d2);
      expect(result.toArray()).toEqual([1, 2, 3, 4]);
      expect(result.size).toBe(4);
    });
  });

  describe('edge cases', () => {
    it('handles single element', () => {
      const single = deque.pushBack(42);
      expect(single.size).toBe(1);
      expect(single.front()).toBe(42);
      expect(single.back()).toBe(42);
      expect(single.get(0)).toBe(42);
    });

    it('handles large number of elements', () => {
      let result = deque;
      for (let i = 0; i < 100; i++) {
        result = result.pushBack(i);
      }
      expect(result.size).toBe(100);
      expect(result.toArray().length).toBe(100);
      expect(result.get(0)).toBe(0);
      expect(result.get(99)).toBe(99);
    });

    it('handles strings', () => {
      const strDeque = CatenableDeque.empty<string>();
      const result = strDeque.pushBack('a').pushBack('b').pushBack('c');
      expect(result.toArray()).toEqual(['a', 'b', 'c']);
      expect(result.front()).toBe('a');
      expect(result.back()).toBe('c');
    });

    it('handles objects', () => {
      const objDeque = CatenableDeque.empty<{ id: number }>();
      const result = objDeque.pushBack({ id: 1 }).pushBack({ id: 2 });
      expect(result.get(0)).toEqual({ id: 1 });
      expect(result.get(1)).toEqual({ id: 2 });
    });
  });

  describe('complex scenarios', () => {
    it('handles map and filter chain', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3).pushBack(4).pushBack(5);
      const result = filled.map(x => x * 2).filter(x => x > 4);
      expect(result.toArray()).toEqual([6, 8, 10]);
      expect(result.size).toBe(3);
    });

    it('handles concat with map', () => {
      const d1 = deque.pushBack(1).pushBack(2);
      const d2 = deque.pushBack(3).pushBack(4);
      const result = d1.concat(d2).map(x => x * 2);
      expect(result.toArray()).toEqual([2, 4, 6, 8]);
      expect(result.size).toBe(4);
    });

    it('handles take and drop combination', () => {
      const filled = deque.pushBack(1).pushBack(2).pushBack(3).pushBack(4).pushBack(5);
      const result = filled.take(4).drop(1);
      expect(result.toArray()).toEqual([2, 3, 4]);
      expect(result.size).toBe(3);
    });

    it('handles reverse and concat', () => {
      const d1 = deque.pushBack(1).pushBack(2);
      const d2 = deque.pushBack(3).pushBack(4);
      const result = d1.reverse().concat(d2);
      expect(result.toArray()).toEqual([2, 1, 3, 4]);
      expect(result.size).toBe(4);
    });
  });
});
