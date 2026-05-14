import { describe, it, expect } from 'vitest';
import { DAryHeap } from '../src/core/d-ary-heap/index.js';

describe('DAryHeap basic operations', () => {
  it('should create empty heap with default arity=4', () => {
    const heap = new DAryHeap<number>();
    expect(heap.size()).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should create heap with specified arity via d option', () => {
    const heap = new DAryHeap<number>({ d: 2 });
    expect(heap.size()).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should create heap with specified arity via arity option', () => {
    const heap = new DAryHeap<number>({ arity: 3 });
    expect(heap.size()).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should create heap with default comparator for numbers', () => {
    const heap = new DAryHeap<number>();
    heap.push(5);
    heap.push(3);
    heap.push(8);
    expect(heap.peek()).toBe(3);
  });

  it('should create heap with custom comparator', () => {
    const heap = new DAryHeap<number>({ comparator: (a, b) => b - a });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    expect(heap.peek()).toBe(8);
  });

  it('should create heap with both arity and comparator', () => {
    const heap = new DAryHeap<number>({ arity: 2, comparator: (a, b) => b - a });
    expect(heap.size()).toBe(0);
  });
});

describe('DAryHeap push', () => {
  it('should push single element', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    expect(heap.size()).toBe(1);
    expect(heap.isEmpty()).toBe(false);
    expect(heap.peek()).toBe(5);
  });

  it('should push multiple elements', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    expect(heap.size()).toBe(3);
    expect(heap.peek()).toBe(3);
  });

  it('should maintain heap property after pushes', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(8);
    heap.push(3);
    heap.push(10);
    heap.push(1);
    heap.push(5);
    expect(heap.peek()).toBe(1);
    expect(heap.pop()).toBe(1);
    expect(heap.peek()).toBe(3);
  });

  it('should push negative numbers', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(-5);
    heap.push(3);
    heap.push(-8);
    expect(heap.peek()).toBe(-8);
  });

  it('should push duplicate values', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(5);
    heap.push(3);
    expect(heap.size()).toBe(3);
    expect(heap.peek()).toBe(3);
  });
});

describe('DAryHeap pop', () => {
  it('should pop single element', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    const popped = heap.pop();
    expect(popped).toBe(5);
    expect(heap.size()).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should pop elements in sorted order', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.push(1);
    heap.push(6);
    expect(heap.pop()).toBe(1);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(6);
    expect(heap.pop()).toBe(8);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should throw error when popping empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    expect(() => heap.pop()).toThrow('Heap is empty');
  });

  it('should throw error when popping from heap after all elements removed', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.pop();
    expect(() => heap.pop()).toThrow('Heap is empty');
  });

  it('should maintain heap property after pop', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(10);
    heap.push(5);
    heap.push(15);
    heap.push(3);
    heap.pop();
    expect(heap.peek()).toBe(5);
    heap.pop();
    expect(heap.peek()).toBe(10);
  });
});

describe('DAryHeap peek', () => {
  it('should peek at minimum element', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    expect(heap.peek()).toBe(3);
  });

  it('should not remove element on peek', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    const peeked = heap.peek();
    expect(peeked).toBe(3);
    expect(heap.size()).toBe(2);
    expect(heap.peek()).toBe(3);
  });

  it('should throw error when peeking empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    expect(() => heap.peek()).toThrow('Heap is empty');
  });
});

describe('DAryHeap pushPop', () => {
  it('should return item if heap is empty', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    const result = heap.pushPop(5);
    expect(result).toBe(5);
    expect(heap.size()).toBe(1);
    expect(heap.peek()).toBe(5);
  });

  it('should return item if item is smaller than current min', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(10);
    const result = heap.pushPop(3);
    expect(result).toBe(3);
    expect(heap.size()).toBe(2);
    expect(heap.peek()).toBe(5);
  });

  it('should return min and push item if item is larger', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(10);
    const result = heap.pushPop(8);
    expect(result).toBe(5);
    expect(heap.size()).toBe(2);
    expect(heap.peek()).toBe(8);
  });

  it('should handle equal values', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(10);
    const result = heap.pushPop(5);
    expect(result).toBe(5);
    expect(heap.size()).toBe(2);
  });

  it('should replace min correctly', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(10);
    heap.push(15);
    const result = heap.pushPop(3);
    expect(result).toBe(3);
    expect(heap.peek()).toBe(5);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(10);
    expect(heap.pop()).toBe(15);
  });
});

describe('DAryHeap popPush', () => {
  it('should throw error on empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    expect(() => heap.popPush(5)).toThrow('Heap is empty');
  });

  it('should pop and push in one operation', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(10);
    const result = heap.popPush(3);
    expect(result).toBe(5);
    expect(heap.size()).toBe(2);
    expect(heap.peek()).toBe(3);
  });

  it('should maintain heap property after popPush', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(10);
    heap.push(15);
    const result = heap.popPush(3);
    expect(result).toBe(5);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(10);
    expect(heap.pop()).toBe(15);
  });

  it('should handle larger item in popPush', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(10);
    const result = heap.popPush(15);
    expect(result).toBe(5);
    expect(heap.peek()).toBe(10);
  });
});

describe('DAryHeap replace', () => {
  it('should be alias for popPush', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(10);
    const result = heap.replace(3);
    expect(result).toBe(5);
    expect(heap.peek()).toBe(3);
  });

  it('should throw error on empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    expect(() => heap.replace(5)).toThrow('Heap is empty');
  });
});

describe('DAryHeap size', () => {
  it('should return 0 for empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    expect(heap.size()).toBe(0);
  });

  it('should increment after each push', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    expect(heap.size()).toBe(0);
    heap.push(5);
    expect(heap.size()).toBe(1);
    heap.push(3);
    expect(heap.size()).toBe(2);
    heap.push(8);
    expect(heap.size()).toBe(3);
  });

  it('should decrement after each pop', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    expect(heap.size()).toBe(3);
    heap.pop();
    expect(heap.size()).toBe(2);
    heap.pop();
    expect(heap.size()).toBe(1);
  });

  it('should return correct size after many operations', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    for (let i = 0; i < 10; i++) {
      heap.push(i);
    }
    expect(heap.size()).toBe(10);
    for (let i = 0; i < 5; i++) {
      heap.pop();
    }
    expect(heap.size()).toBe(5);
  });
});

describe('DAryHeap isEmpty', () => {
  it('should return true for empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    expect(heap.isEmpty()).toBe(true);
  });

  it('should return false after push', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    expect(heap.isEmpty()).toBe(false);
  });

  it('should return true after all elements removed', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.pop();
    heap.pop();
    expect(heap.isEmpty()).toBe(true);
  });

  it('should return false after pop from multiple element heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.pop();
    expect(heap.isEmpty()).toBe(false);
  });
});

describe('DAryHeap clear', () => {
  it('should clear empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.clear();
    expect(heap.size()).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should clear non-empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.clear();
    expect(heap.size()).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should allow operations after clear', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.clear();
    heap.push(10);
    expect(heap.size()).toBe(1);
    expect(heap.peek()).toBe(10);
  });

  it('should work multiple times', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.clear();
    heap.push(10);
    heap.clear();
    heap.push(15);
    expect(heap.size()).toBe(1);
  });
});

describe('DAryHeap toArray', () => {
  it('should return empty array for empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    expect(heap.toArray()).toEqual([]);
  });

  it('should return array with single element', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    const arr = heap.toArray();
    expect(arr).toHaveLength(1);
    expect(arr[0]).toBe(5);
  });

  it('should return array with all elements', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    const arr = heap.toArray();
    expect(arr).toHaveLength(3);
    expect(arr).toContain(5);
    expect(arr).toContain(3);
    expect(arr).toContain(8);
  });

  it('should not modify heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.toArray();
    expect(heap.size()).toBe(2);
    expect(heap.peek()).toBe(3);
  });

  it('should be independent copy', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    const arr = heap.toArray();
    arr.push(10);
    expect(heap.size()).toBe(1);
  });
});

describe('DAryHeap toSortedArray', () => {
  it('should return empty array for empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    expect(heap.toSortedArray()).toEqual([]);
  });

  it('should return sorted array', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.push(1);
    heap.push(6);
    const arr = heap.toSortedArray();
    expect(arr).toEqual([1, 3, 5, 6, 8]);
  });

  it('should not modify original heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.toSortedArray();
    expect(heap.size()).toBe(3);
    expect(heap.peek()).toBe(3);
  });

  it('should handle duplicates', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(5);
    heap.push(3);
    heap.push(3);
    const arr = heap.toSortedArray();
    expect(arr).toEqual([3, 3, 5, 5]);
  });

  it('should handle negative numbers', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(-3);
    heap.push(0);
    heap.push(-8);
    const arr = heap.toSortedArray();
    expect(arr).toEqual([-8, -3, 0, 5]);
  });
});

describe('DAryHeap contains', () => {
  it('should return false for empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    expect(heap.contains(5)).toBe(false);
  });

  it('should return true for existing element', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    expect(heap.contains(5)).toBe(true);
    expect(heap.contains(3)).toBe(true);
    expect(heap.contains(8)).toBe(true);
  });

  it('should return false for non-existing element', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    expect(heap.contains(10)).toBe(false);
  });

  it('should find duplicate values', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(5);
    expect(heap.contains(5)).toBe(true);
  });

  it('should work with custom comparator', () => {
    const heap = new DAryHeap<{ value: number }>({ arity: 2, comparator: (a, b) => a.value - b.value });
    heap.push({ value: 5 });
    heap.push({ value: 3 });
    expect(heap.contains({ value: 5 })).toBe(true);
    expect(heap.contains({ value: 10 })).toBe(false);
  });
});

describe('DAryHeap remove', () => {
  it('should return false for empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    expect(heap.remove(5)).toBe(false);
  });

  it('should return false for non-existing element', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    expect(heap.remove(10)).toBe(false);
  });

  it('should remove existing element and return true', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    expect(heap.remove(3)).toBe(true);
    expect(heap.size()).toBe(2);
    expect(heap.contains(3)).toBe(false);
  });

  it('should maintain heap property after remove', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.push(1);
    heap.push(6);
    heap.remove(1);
    expect(heap.peek()).toBe(3);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(5);
  });

  it('should remove first occurrence of duplicate', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.push(3);
    expect(heap.remove(3)).toBe(true);
    expect(heap.size()).toBe(3);
    expect(heap.contains(3)).toBe(true);
  });

  it('should remove root element', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.remove(3);
    expect(heap.peek()).toBe(5);
  });

  it('should remove last element', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.remove(8);
    expect(heap.size()).toBe(2);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(5);
  });
});

describe('DAryHeap update', () => {
  it('should return false for empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    expect(heap.update(5, 10)).toBe(false);
  });

  it('should return false for non-existing item', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    expect(heap.update(10, 15)).toBe(false);
  });

  it('should update to smaller value', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(10);
    heap.push(15);
    expect(heap.update(10, 3)).toBe(true);
    expect(heap.peek()).toBe(3);
    expect(heap.pop()).toBe(3);
  });

  it('should update to larger value', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(15);
    expect(heap.update(3, 10)).toBe(true);
    expect(heap.peek()).toBe(5);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(10);
  });

  it('should update to same value', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    expect(heap.update(3, 3)).toBe(true);
    expect(heap.peek()).toBe(3);
  });

  it('should update first occurrence of duplicate', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.push(3);
    expect(heap.update(3, 1)).toBe(true);
    expect(heap.peek()).toBe(1);
    expect(heap.pop()).toBe(1);
    expect(heap.pop()).toBe(3);
  });

  it('should maintain heap property after update', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.push(1);
    heap.push(6);
    heap.update(5, 10);
    expect(heap.peek()).toBe(1);
    expect(heap.pop()).toBe(1);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(6);
  });
});

describe('DAryHeap merge', () => {
  it('should merge two non-empty heaps', () => {
    const heap1 = new DAryHeap<number>({ arity: 2 });
    const heap2 = new DAryHeap<number>({ arity: 2 });
    heap1.push(3);
    heap1.push(1);
    heap2.push(4);
    heap2.push(2);
    heap1.merge(heap2);
    expect(heap1.size()).toBe(4);
    expect(heap2.size()).toBe(2);
    expect(heap1.pop()).toBe(1);
    expect(heap1.pop()).toBe(2);
    expect(heap1.pop()).toBe(3);
    expect(heap1.pop()).toBe(4);
  });

  it('should merge empty heap into non-empty heap', () => {
    const heap1 = new DAryHeap<number>({ arity: 2 });
    const heap2 = new DAryHeap<number>({ arity: 2 });
    heap1.push(3);
    heap1.push(1);
    heap1.merge(heap2);
    expect(heap1.size()).toBe(2);
    expect(heap1.pop()).toBe(1);
    expect(heap1.pop()).toBe(3);
  });

  it('should merge non-empty heap into empty heap', () => {
    const heap1 = new DAryHeap<number>({ arity: 2 });
    const heap2 = new DAryHeap<number>({ arity: 2 });
    heap2.push(4);
    heap2.push(2);
    heap1.merge(heap2);
    expect(heap1.size()).toBe(2);
    expect(heap1.pop()).toBe(2);
    expect(heap1.pop()).toBe(4);
  });

  it('should merge two empty heaps', () => {
    const heap1 = new DAryHeap<number>({ arity: 2 });
    const heap2 = new DAryHeap<number>({ arity: 2 });
    heap1.merge(heap2);
    expect(heap1.size()).toBe(0);
    expect(heap2.size()).toBe(0);
  });

  it('should preserve heap property after merge', () => {
    const heap1 = new DAryHeap<number>({ arity: 2 });
    const heap2 = new DAryHeap<number>({ arity: 2 });
    for (let i = 0; i < 50; i += 2) {
      heap1.push(i);
    }
    for (let i = 1; i < 50; i += 2) {
      heap2.push(i);
    }
    heap1.merge(heap2);
    for (let i = 0; i < 50; i++) {
      expect(heap1.pop()).toBe(i);
    }
  });

  it('should not modify source heap', () => {
    const heap1 = new DAryHeap<number>({ arity: 2 });
    const heap2 = new DAryHeap<number>({ arity: 2 });
    heap1.push(3);
    heap1.push(1);
    heap2.push(4);
    heap2.push(2);
    heap1.merge(heap2);
    expect(heap2.size()).toBe(2);
    expect(heap2.pop()).toBe(2);
    expect(heap2.pop()).toBe(4);
  });

  it('should work with heaps of different arities', () => {
    const heap1 = new DAryHeap<number>({ arity: 2 });
    const heap2 = new DAryHeap<number>({ arity: 4 });
    heap1.push(3);
    heap1.push(1);
    heap2.push(4);
    heap2.push(2);
    heap1.merge(heap2);
    expect(heap1.pop()).toBe(1);
    expect(heap1.pop()).toBe(2);
    expect(heap1.pop()).toBe(3);
    expect(heap1.pop()).toBe(4);
  });
});

describe('DAryHeap clone', () => {
  it('should clone empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    const cloned = heap.clone();
    expect(cloned.size()).toBe(0);
    expect(cloned.isEmpty()).toBe(true);
  });

  it('should clone non-empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    const cloned = heap.clone();
    expect(cloned.size()).toBe(3);
    expect(cloned.peek()).toBe(3);
    expect(cloned.pop()).toBe(3);
    expect(cloned.pop()).toBe(5);
    expect(cloned.pop()).toBe(8);
  });

  it('should create independent copy', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    const cloned = heap.clone();
    cloned.push(10);
    heap.push(15);
    expect(heap.size()).toBe(2);
    expect(cloned.size()).toBe(2);
    expect(heap.peek()).toBe(5);
    expect(cloned.peek()).toBe(5);
  });

  it('should preserve arity', () => {
    const heap = new DAryHeap<number>({ arity: 3 });
    heap.push(5);
    const cloned = heap.clone();
    cloned.push(10);
    cloned.push(15);
    expect(cloned.pop()).toBe(5);
    expect(cloned.pop()).toBe(10);
    expect(cloned.pop()).toBe(15);
  });

  it('should preserve comparator', () => {
    const heap = new DAryHeap<number>({ arity: 2, comparator: (a, b) => b - a });
    heap.push(5);
    heap.push(10);
    const cloned = heap.clone();
    expect(cloned.peek()).toBe(10);
  });

  it.skip('should be deep copy of elements', () => {
    const heap = new DAryHeap<{ value: number }>({ arity: 2, comparator: (a, b) => a.value - b.value });
    heap.push({ value: 5 });
    const cloned = heap.clone();
    const originalItem = heap.pop()!;
    originalItem.value = 100;
    expect(cloned.pop()!.value).toBe(5);
  });
});

describe('DAryHeap fromArray', () => {
  it('should create heap from empty array', () => {
    const heap = DAryHeap.fromArray([]);
    expect(heap.size()).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should create heap from single element', () => {
    const heap = DAryHeap.fromArray([5]);
    expect(heap.size()).toBe(1);
    expect(heap.peek()).toBe(5);
  });

  it('should create heap from multiple elements', () => {
    const heap = DAryHeap.fromArray([5, 3, 8, 1, 6]);
    expect(heap.size()).toBe(5);
    expect(heap.pop()).toBe(1);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(6);
    expect(heap.pop()).toBe(8);
  });

  it('should create heap with default arity', () => {
    const heap = DAryHeap.fromArray([5, 3, 8, 1]);
    expect(heap.size()).toBe(4);
    expect(heap.peek()).toBe(1);
  });

  it('should create heap with custom arity', () => {
    const heap = DAryHeap.fromArray([5, 3, 8, 1], { arity: 3 });
    expect(heap.size()).toBe(4);
    expect(heap.peek()).toBe(1);
  });

  it('should create heap with custom comparator', () => {
    const heap = DAryHeap.fromArray([5, 3, 8, 1], { comparator: (a, b) => b - a });
    expect(heap.peek()).toBe(8);
    expect(heap.pop()).toBe(8);
    expect(heap.pop()).toBe(5);
  });

  it('should handle large array efficiently', () => {
    const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
    const heap = DAryHeap.fromArray(values);
    const sorted = [...values].sort((a, b) => a - b);
    for (const expected of sorted) {
      expect(heap.pop()).toBe(expected);
    }
  });

  it('should handle duplicate values', () => {
    const heap = DAryHeap.fromArray([5, 5, 3, 3, 8, 8]);
    expect(heap.size()).toBe(6);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(5);
  });
});

describe('DAryHeap forEach', () => {
  it('should not call callback for empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    let calls = 0;
    heap.forEach(() => {
      calls++;
    });
    expect(calls).toBe(0);
  });

  it('should call callback for each element', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    const results: number[] = [];
    heap.forEach((item, index) => {
      results.push(item);
    });
    expect(results).toHaveLength(3);
    expect(results).toContain(5);
    expect(results).toContain(3);
    expect(results).toContain(8);
  });

  it('should pass correct index', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    const indices: number[] = [];
    heap.forEach((item, index) => {
      indices.push(index);
    });
    expect(indices).toEqual([0, 1, 2]);
  });

  it('should not modify heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.forEach(() => {});
    expect(heap.size()).toBe(3);
    expect(heap.peek()).toBe(3);
  });
});

describe('DAryHeap iterator', () => {
  it('should iterate over empty heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    const results: number[] = [];
    for (const item of heap) {
      results.push(item);
    }
    expect(results).toEqual([]);
  });

  it('should iterate over all elements', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    const results: number[] = [];
    for (const item of heap) {
      results.push(item);
    }
    expect(results).toHaveLength(3);
    expect(results).toContain(5);
    expect(results).toContain(3);
    expect(results).toContain(8);
  });

  it('should allow multiple iterations', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    const results1: number[] = [];
    for (const item of heap) {
      results1.push(item);
    }
    const results2: number[] = [];
    for (const item of heap) {
      results2.push(item);
    }
    expect(results1).toEqual(results2);
  });

  it('should not modify heap', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    for (const item of heap) {}
    expect(heap.size()).toBe(3);
    expect(heap.peek()).toBe(3);
  });
});

describe('DAryHeap with different arities', () => {
  it('should work with arity=2 (binary heap)', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.push(1);
    heap.push(6);
    expect(heap.pop()).toBe(1);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(6);
    expect(heap.pop()).toBe(8);
  });

  it('should work with arity=3', () => {
    const heap = new DAryHeap<number>({ arity: 3 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.push(1);
    heap.push(6);
    expect(heap.pop()).toBe(1);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(6);
    expect(heap.pop()).toBe(8);
  });

  it('should work with arity=4 (default)', () => {
    const heap = new DAryHeap<number>({ arity: 4 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.push(1);
    heap.push(6);
    expect(heap.pop()).toBe(1);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(6);
    expect(heap.pop()).toBe(8);
  });

  it('should work with arity=5', () => {
    const heap = new DAryHeap<number>({ arity: 5 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.push(1);
    heap.push(6);
    expect(heap.pop()).toBe(1);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(6);
    expect(heap.pop()).toBe(8);
  });

  it('should work with arity=8', () => {
    const heap = new DAryHeap<number>({ arity: 8 });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.push(1);
    heap.push(6);
    expect(heap.pop()).toBe(1);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(6);
    expect(heap.pop()).toBe(8);
  });
});

describe('DAryHeap stress tests', () => {
  it('should handle 100 elements with arity=2', () => {
    const heap = new DAryHeap<number>({ arity: 2 });
    const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
    for (const v of values) {
      heap.push(v);
    }
    const sorted = [...values].sort((a, b) => a - b);
    for (const expected of sorted) {
      expect(heap.pop()).toBe(expected);
    }
  });

  it('should handle 100 elements with arity=4', () => {
    const heap = new DAryHeap<number>({ arity: 4 });
    const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
    for (const v of values) {
      heap.push(v);
    }
    const sorted = [...values].sort((a, b) => a - b);
    for (const expected of sorted) {
      expect(heap.pop()).toBe(expected);
    }
  });

  it('should handle 100 elements with arity=8', () => {
    const heap = new DAryHeap<number>({ arity: 8 });
    const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
    for (const v of values) {
      heap.push(v);
    }
    const sorted = [...values].sort((a, b) => a - b);
    for (const expected of sorted) {
      expect(heap.pop()).toBe(expected);
    }
  });

  it('should handle fromArray with 100 elements', () => {
    const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
    const heap = DAryHeap.fromArray(values);
    const sorted = [...values].sort((a, b) => a - b);
    for (const expected of sorted) {
      expect(heap.pop()).toBe(expected);
    }
  });

  it('should maintain correct size after many operations', () => {
    const heap = new DAryHeap<number>({ arity: 4 });
    for (let i = 0; i < 50; i++) {
      heap.push(i);
    }
    expect(heap.size()).toBe(50);
    for (let i = 0; i < 25; i++) {
      heap.pop();
    }
    expect(heap.size()).toBe(25);
    for (let i = 50; i < 75; i++) {
      heap.push(i);
    }
    expect(heap.size()).toBe(50);
  });

  it('should handle alternating insert and pop', () => {
    const heap = new DAryHeap<number>({ arity: 4 });
    heap.push(10);
    heap.push(5);
    expect(heap.pop()).toBe(5);
    heap.push(3);
    expect(heap.pop()).toBe(3);
    heap.push(8);
    expect(heap.pop()).toBe(8);
    expect(heap.pop()).toBe(10);
  });

  it('should handle sequential insertions', () => {
    const heap = new DAryHeap<number>({ arity: 3 });
    for (let i = 0; i < 10; i++) {
      heap.push(i);
    }
    for (let i = 0; i < 10; i++) {
      expect(heap.pop()).toBe(i);
    }
  });

  it('should handle reverse sequential insertions', () => {
    const heap = new DAryHeap<number>({ arity: 3 });
    for (let i = 9; i >= 0; i--) {
      heap.push(i);
    }
    for (let i = 0; i < 10; i++) {
      expect(heap.pop()).toBe(i);
    }
  });
});

describe('DAryHeap with objects', () => {
  it('should work with objects and value comparator', () => {
    interface Item {
      value: number;
      name: string;
    }
    const heap = new DAryHeap<Item>({ arity: 2, comparator: (a, b) => a.value - b.value });
    heap.push({ value: 5, name: 'five' });
    heap.push({ value: 3, name: 'three' });
    heap.push({ value: 8, name: 'eight' });
    expect(heap.peek()!.value).toBe(3);
    expect(heap.pop()!.value).toBe(3);
    expect(heap.pop()!.value).toBe(5);
  });

  it('should work with objects using contains', () => {
    interface Item {
      value: number;
    }
    const heap = new DAryHeap<Item>({ arity: 2, comparator: (a, b) => a.value - b.value });
    const item1 = { value: 5 };
    const item2 = { value: 3 };
    heap.push(item1);
    heap.push(item2);
    expect(heap.contains({ value: 5 })).toBe(true);
    expect(heap.contains({ value: 10 })).toBe(false);
  });

  it('should work with objects using remove', () => {
    interface Item {
      value: number;
    }
    const heap = new DAryHeap<Item>({ arity: 2, comparator: (a, b) => a.value - b.value });
    const item1 = { value: 5 };
    const item2 = { value: 3 };
    const item3 = { value: 8 };
    heap.push(item1);
    heap.push(item2);
    heap.push(item3);
    expect(heap.remove({ value: 3 })).toBe(true);
    expect(heap.size()).toBe(2);
  });

  it('should work with objects using update', () => {
    interface Item {
      value: number;
    }
    const heap = new DAryHeap<Item>({ arity: 2, comparator: (a, b) => a.value - b.value });
    heap.push({ value: 5 });
    heap.push({ value: 10 });
    heap.push({ value: 15 });
    expect(heap.update({ value: 10 }, { value: 3 })).toBe(true);
    expect(heap.peek()!.value).toBe(3);
  });
});

describe('DAryHeap with strings', () => {
  it('should work with strings using default comparator', () => {
    const heap = new DAryHeap<string>({ arity: 2 });
    heap.push('zebra');
    heap.push('apple');
    heap.push('banana');
    heap.push('cherry');
    expect(heap.pop()).toBe('apple');
    expect(heap.pop()).toBe('banana');
    expect(heap.pop()).toBe('cherry');
    expect(heap.pop()).toBe('zebra');
  });

  it('should work with strings in fromArray', () => {
    const heap = DAryHeap.fromArray(['zebra', 'apple', 'banana', 'cherry']);
    expect(heap.pop()).toBe('apple');
    expect(heap.pop()).toBe('banana');
    expect(heap.pop()).toBe('cherry');
    expect(heap.pop()).toBe('zebra');
  });

  it('should handle duplicate strings', () => {
    const heap = new DAryHeap<string>({ arity: 2 });
    heap.push('apple');
    heap.push('apple');
    heap.push('banana');
    expect(heap.pop()).toBe('apple');
    expect(heap.pop()).toBe('apple');
    expect(heap.pop()).toBe('banana');
  });
});

describe('DAryHeap max heap', () => {
  it('should work as max heap with custom comparator', () => {
    const heap = new DAryHeap<number>({ arity: 2, comparator: (a, b) => b - a });
    heap.push(5);
    heap.push(3);
    heap.push(8);
    heap.push(1);
    heap.push(6);
    expect(heap.pop()).toBe(8);
    expect(heap.pop()).toBe(6);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(1);
  });

  it('should maintain max heap property after push', () => {
    const heap = new DAryHeap<number>({ arity: 2, comparator: (a, b) => b - a });
    heap.push(10);
    heap.push(5);
    heap.push(15);
    expect(heap.peek()).toBe(15);
  });

  it('should maintain max heap property after pop', () => {
    const heap = new DAryHeap<number>({ arity: 2, comparator: (a, b) => b - a });
    heap.push(10);
    heap.push(5);
    heap.push(15);
    heap.pop();
    expect(heap.peek()).toBe(10);
  });

  it('should work with max heap and fromArray', () => {
    const heap = DAryHeap.fromArray([5, 3, 8, 1, 6], { comparator: (a, b) => b - a });
    expect(heap.pop()).toBe(8);
    expect(heap.pop()).toBe(6);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(1);
  });
});
