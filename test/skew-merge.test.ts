import { describe, it, expect } from 'vitest';
import { SkewMerge } from './src/core/skew-merge/index.js';

describe('SkewMerge - Empty heap', () => {
  it('isEmpty returns true for new heap', () => {
    const heap = new SkewMerge<number>();
    expect(heap.isEmpty()).toBe(true);
  });

  it('size returns 0 for new heap', () => {
    const heap = new SkewMerge<number>();
    expect(heap.size).toBe(0);
  });

  it('peek returns undefined for empty heap', () => {
    const heap = new SkewMerge<number>();
    expect(heap.peek()).toBeUndefined();
  });

  it('extractMin returns undefined for empty heap', () => {
    const heap = new SkewMerge<number>();
    expect(heap.extractMin()).toBeUndefined();
  });

  it('toArray returns empty array for empty heap', () => {
    const heap = new SkewMerge<number>();
    expect(heap.toArray()).toEqual([]);
  });
});

describe('SkewMerge - Single element', () => {
  it('isEmpty returns false after insert', () => {
    const heap = new SkewMerge<number>();
    heap.insert(5);
    expect(heap.isEmpty()).toBe(false);
  });

  it('size returns 1 after insert', () => {
    const heap = new SkewMerge<number>();
    heap.insert(5);
    expect(heap.size).toBe(1);
  });

  it('peek returns inserted value', () => {
    const heap = new SkewMerge<number>();
    heap.insert(5);
    expect(heap.peek()).toBe(5);
  });

  it('extractMin returns value and makes heap empty', () => {
    const heap = new SkewMerge<number>();
    heap.insert(5);
    const value = heap.extractMin();
    expect(value).toBe(5);
    expect(heap.isEmpty()).toBe(true);
  });

  it('toArray returns array with one element', () => {
    const heap = new SkewMerge<number>();
    heap.insert(5);
    expect(heap.toArray()).toEqual([5]);
  });
});

describe('SkewMerge - Insert and extract - ascending order', () => {
  it('inserts elements in ascending order and extracts correctly', () => {
    const heap = new SkewMerge<number>();
    heap.insert(1);
    heap.insert(2);
    heap.insert(3);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(3);
  });
});

describe('SkewMerge - Insert and extract - descending order', () => {
  it('inserts elements in descending order and extracts correctly', () => {
    const heap = new SkewMerge<number>();
    heap.insert(3);
    heap.insert(2);
    heap.insert(1);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(3);
  });
});

describe('SkewMerge - Insert and extract - random order', () => {
  it('inserts elements in random order and extracts correctly', () => {
    const heap = new SkewMerge<number>();
    heap.insert(5);
    heap.insert(1);
    heap.insert(3);
    heap.insert(4);
    heap.insert(2);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(4);
    expect(heap.extractMin()).toBe(5);
  });
});

describe('SkewMerge - Insert and extract - all elements', () => {
  it('extracts all elements in sorted order', () => {
    const heap = new SkewMerge<number>();
    for (let i = 0; i < 10; i++) {
      heap.insert(Math.floor(Math.random() * 100));
    }
    let prev = -1;
    while (!heap.isEmpty()) {
      const value = heap.extractMin();
      expect(value).toBeDefined();
      if (value !== undefined) {
        expect(value).toBeGreaterThanOrEqual(prev);
        prev = value;
      }
    }
  });
});

describe('SkewMerge - Insert and extract - duplicates', () => {
  it('handles duplicate values correctly', () => {
    const heap = new SkewMerge<number>();
    heap.insert(3);
    heap.insert(1);
    heap.insert(3);
    heap.insert(2);
    heap.insert(1);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(3);
  });
});

describe('SkewMerge - Size after multiple inserts', () => {
  it('tracks size correctly after multiple inserts', () => {
    const heap = new SkewMerge<number>();
    expect(heap.size).toBe(0);
    heap.insert(1);
    expect(heap.size).toBe(1);
    heap.insert(2);
    expect(heap.size).toBe(2);
    heap.insert(3);
    expect(heap.size).toBe(3);
  });
});

describe('SkewMerge - Peek without removing', () => {
  it('peek returns minimum without removing', () => {
    const heap = new SkewMerge<number>();
    heap.insert(5);
    heap.insert(1);
    heap.insert(3);
    expect(heap.peek()).toBe(1);
    expect(heap.size).toBe(3);
    expect(heap.peek()).toBe(1);
    expect(heap.size).toBe(3);
  });
});

describe('SkewMerge - Repeated peek', () => {
  it('repeated peek returns same value', () => {
    const heap = new SkewMerge<number>();
    heap.insert(3);
    heap.insert(1);
    heap.insert(2);
    expect(heap.peek()).toBe(1);
    expect(heap.peek()).toBe(1);
    expect(heap.peek()).toBe(1);
  });
});

describe('SkewMerge - Extract reduces size', () => {
  it('extractMin reduces size correctly', () => {
    const heap = new SkewMerge<number>();
    heap.insert(3);
    heap.insert(1);
    heap.insert(2);
    expect(heap.size).toBe(3);
    heap.extractMin();
    expect(heap.size).toBe(2);
    heap.extractMin();
    expect(heap.size).toBe(1);
    heap.extractMin();
    expect(heap.size).toBe(0);
  });
});

describe('SkewMerge - Merge empty with non-empty', () => {
  it('merges empty heap into non-empty heap', () => {
    const heap1 = new SkewMerge<number>();
    const heap2 = new SkewMerge<number>();
    heap1.insert(1);
    heap1.insert(2);
    heap2.merge(heap1);
    expect(heap2.toArray()).toEqual([1, 2]);
    expect(heap1.isEmpty()).toBe(true);
  });
});

describe('SkewMerge - Merge non-empty with empty', () => {
  it('merges non-empty heap into empty heap', () => {
    const heap1 = new SkewMerge<number>();
    const heap2 = new SkewMerge<number>();
    heap2.insert(1);
    heap2.insert(2);
    heap1.merge(heap2);
    expect(heap1.toArray()).toEqual([1, 2]);
    expect(heap2.isEmpty()).toBe(true);
  });
});

describe('SkewMerge - Merge two non-empty heaps', () => {
  it('merges two non-empty heaps correctly', () => {
    const heap1 = new SkewMerge<number>();
    const heap2 = new SkewMerge<number>();
    heap1.insert(1);
    heap1.insert(3);
    heap2.insert(2);
    heap2.insert(4);
    heap1.merge(heap2);
    expect(heap1.toArray()).toEqual([1, 2, 3, 4]);
    expect(heap2.isEmpty()).toBe(true);
  });
});

describe('SkewMerge - Merge three heaps sequentially', () => {
  it('merges three heaps sequentially', () => {
    const heap1 = new SkewMerge<number>();
    const heap2 = new SkewMerge<number>();
    const heap3 = new SkewMerge<number>();
    heap1.insert(1);
    heap1.insert(4);
    heap2.insert(2);
    heap2.insert(5);
    heap3.insert(3);
    heap3.insert(6);
    heap1.merge(heap2);
    heap1.merge(heap3);
    expect(heap1.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('SkewMerge - Merge clears other heap', () => {
  it('merge clears the other heap', () => {
    const heap1 = new SkewMerge<number>();
    const heap2 = new SkewMerge<number>();
    heap1.insert(1);
    heap1.insert(2);
    heap2.insert(3);
    heap2.insert(4);
    heap1.merge(heap2);
    expect(heap1.size).toBe(4);
    expect(heap2.size).toBe(0);
    expect(heap2.isEmpty()).toBe(true);
  });
});

describe('SkewMerge - Merge with duplicates', () => {
  it('merges heaps with duplicate values', () => {
    const heap1 = new SkewMerge<number>();
    const heap2 = new SkewMerge<number>();
    heap1.insert(1);
    heap1.insert(3);
    heap2.insert(1);
    heap2.insert(2);
    heap1.merge(heap2);
    expect(heap1.toArray()).toEqual([1, 1, 2, 3]);
  });
});

describe('SkewMerge - Merge large heaps', () => {
  it('merges two large heaps correctly', () => {
    const heap1 = new SkewMerge<number>();
    const heap2 = new SkewMerge<number>();
    for (let i = 0; i < 50; i++) {
      heap1.insert(i * 2);
    }
    for (let i = 0; i < 50; i++) {
      heap2.insert(i * 2 + 1);
    }
    heap1.merge(heap2);
    const arr = heap1.toArray();
    expect(arr.length).toBe(100);
    for (let i = 0; i < arr.length; i++) {
      expect(arr[i]).toBe(i);
    }
  });
});

describe('SkewMerge - Merge with custom comparator', () => {
  it('merges heaps with custom max-heap comparator', () => {
    const heap1 = new SkewMerge<number>((a, b) => b - a);
    const heap2 = new SkewMerge<number>((a, b) => b - a);
    heap1.insert(1);
    heap1.insert(3);
    heap2.insert(2);
    heap2.insert(4);
    heap1.merge(heap2);
    expect(heap1.toArray()).toEqual([4, 3, 2, 1]);
  });
});

describe('SkewMerge - Merge preserves total size', () => {
  it('merge preserves total element count', () => {
    const heap1 = new SkewMerge<number>();
    const heap2 = new SkewMerge<number>();
    for (let i = 0; i < 20; i++) {
      heap1.insert(i);
    }
    for (let i = 0; i < 30; i++) {
      heap2.insert(i + 20);
    }
    heap1.merge(heap2);
    expect(heap1.size).toBe(50);
  });
});

describe('SkewMerge - Clear empty heap', () => {
  it('clears an empty heap', () => {
    const heap = new SkewMerge<number>();
    heap.clear();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });
});

describe('SkewMerge - Clear single element', () => {
  it('clears a single element heap', () => {
    const heap = new SkewMerge<number>();
    heap.insert(5);
    heap.clear();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });
});

describe('SkewMerge - Clear multi-element', () => {
  it('clears a multi-element heap', () => {
    const heap = new SkewMerge<number>();
    for (let i = 0; i < 10; i++) {
      heap.insert(i);
    }
    heap.clear();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });
});

describe('SkewMerge - Clear and reuse', () => {
  it('clears and reuses heap', () => {
    const heap = new SkewMerge<number>();
    heap.insert(1);
    heap.insert(2);
    heap.clear();
    heap.insert(3);
    heap.insert(4);
    expect(heap.toArray()).toEqual([3, 4]);
  });
});

describe('SkewMerge - Clear resets size', () => {
  it('clear resets size to 0', () => {
    const heap = new SkewMerge<number>();
    for (let i = 0; i < 100; i++) {
      heap.insert(i);
    }
    expect(heap.size).toBe(100);
    heap.clear();
    expect(heap.size).toBe(0);
  });
});

describe('SkewMerge - Custom comparator - max heap', () => {
  it('works as max-heap with custom comparator', () => {
    const heap = new SkewMerge<number>((a, b) => b - a);
    heap.insert(3);
    heap.insert(1);
    heap.insert(4);
    heap.insert(2);
    expect(heap.peek()).toBe(4);
    expect(heap.extractMin()).toBe(4);
    expect(heap.extractMin()).toBe(3);
    expect(heap.extractMin()).toBe(2);
    expect(heap.extractMin()).toBe(1);
  });
});

describe('SkewMerge - Custom comparator - string length', () => {
  it('sorts strings by length', () => {
    const heap = new SkewMerge<string>((a, b) => a.length - b.length);
    heap.insert('hello');
    heap.insert('hi');
    heap.insert('hey');
    heap.insert('a');
    heap.insert('test');
    expect(heap.toArray()).toEqual(['a', 'hi', 'hey', 'test', 'hello']);
  });
});

describe('SkewMerge - Custom comparator - objects', () => {
  it('sorts objects by property', () => {
    const heap = new SkewMerge<{value: number}>((a, b) => a.value - b.value);
    heap.insert({value: 3});
    heap.insert({value: 1});
    heap.insert({value: 2});
    expect(heap.extractMin()!.value).toBe(1);
    expect(heap.extractMin()!.value).toBe(2);
    expect(heap.extractMin()!.value).toBe(3);
  });
});

describe('SkewMerge - Stress test', () => {
  it('handles 1000 insertions and extractions', () => {
    const heap = new SkewMerge<number>();
    const values = Array.from({length: 1000}, () => Math.floor(Math.random() * 10000));
    values.forEach(v => heap.insert(v));
    expect(heap.size).toBe(1000);
    let prev = -1;
    while (!heap.isEmpty()) {
      const value = heap.extractMin();
      expect(value).toBeDefined();
      if (value !== undefined) {
        expect(value).toBeGreaterThanOrEqual(prev);
        prev = value;
      }
    }
  });
});

describe('SkewMerge - toArray preserves heap', () => {
  it('toArray does not modify heap', () => {
    const heap = new SkewMerge<number>();
    heap.insert(3);
    heap.insert(1);
    heap.insert(2);
    const arr1 = heap.toArray();
    expect(arr1).toEqual([1, 2, 3]);
    expect(heap.size).toBe(3);
    expect(heap.peek()).toBe(1);
    const arr2 = heap.toArray();
    expect(arr2).toEqual([1, 2, 3]);
  });
});

describe('SkewMerge - Mixed operations', () => {
  it('handles mix of insert, extract, and merge', () => {
    const heap1 = new SkewMerge<number>();
    const heap2 = new SkewMerge<number>();
    heap1.insert(5);
    heap1.insert(2);
    heap1.insert(8);
    expect(heap1.extractMin()).toBe(2);
    heap2.insert(1);
    heap2.insert(7);
    heap1.merge(heap2);
    expect(heap1.toArray()).toEqual([1, 5, 7, 8]);
  });
});

describe('SkewMerge - Negative numbers', () => {
  it('handles negative numbers correctly', () => {
    const heap = new SkewMerge<number>();
    heap.insert(-5);
    heap.insert(3);
    heap.insert(-2);
    heap.insert(0);
    heap.insert(-1);
    expect(heap.toArray()).toEqual([-5, -2, -1, 0, 3]);
  });
});

describe('SkewMerge - Zero values', () => {
  it('handles multiple zeros', () => {
    const heap = new SkewMerge<number>();
    heap.insert(0);
    heap.insert(5);
    heap.insert(0);
    heap.insert(-3);
    heap.insert(0);
    expect(heap.toArray()).toEqual([-3, 0, 0, 0, 5]);
  });
});

describe('SkewMerge - Large values', () => {
  it('handles large values correctly', () => {
    const heap = new SkewMerge<number>();
    heap.insert(Number.MAX_SAFE_INTEGER);
    heap.insert(0);
    heap.insert(Number.MIN_SAFE_INTEGER);
    expect(heap.extractMin()).toBe(Number.MIN_SAFE_INTEGER);
    expect(heap.extractMin()).toBe(0);
    expect(heap.extractMin()).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe('SkewMerge - Floating point', () => {
  it('handles floating point numbers', () => {
    const heap = new SkewMerge<number>();
    heap.insert(3.5);
    heap.insert(1.2);
    heap.insert(2.8);
    heap.insert(0.9);
    heap.insert(4.1);
    expect(heap.toArray()).toEqual([0.9, 1.2, 2.8, 3.5, 4.1]);
  });
});

describe('SkewMerge - String values', () => {
  it('handles string values with default comparator', () => {
    const heap = new SkewMerge<string>();
    heap.insert('banana');
    heap.insert('apple');
    heap.insert('cherry');
    heap.insert('date');
    expect(heap.toArray()).toEqual(['apple', 'banana', 'cherry', 'date']);
  });
});

describe('SkewMerge - Extract after merge', () => {
  it('extracts correctly after merging heaps', () => {
    const heap1 = new SkewMerge<number>();
    const heap2 = new SkewMerge<number>();
    heap1.insert(5);
    heap1.insert(1);
    heap2.insert(3);
    heap2.insert(2);
    heap1.merge(heap2);
    expect(heap1.extractMin()).toBe(1);
    expect(heap1.extractMin()).toBe(2);
    expect(heap1.extractMin()).toBe(3);
    expect(heap1.extractMin()).toBe(5);
  });
});

describe('SkewMerge - Peek after extract', () => {
  it('peek returns new minimum after extract', () => {
    const heap = new SkewMerge<number>();
    heap.insert(3);
    heap.insert(1);
    heap.insert(4);
    heap.insert(2);
    expect(heap.peek()).toBe(1);
    heap.extractMin();
    expect(heap.peek()).toBe(2);
    heap.extractMin();
    expect(heap.peek()).toBe(3);
  });
});

describe('SkewMerge - Size invariant after toArray', () => {
  it('size remains same after toArray call', () => {
    const heap = new SkewMerge<number>();
    for (let i = 0; i < 10; i++) {
      heap.insert(i);
    }
    expect(heap.size).toBe(10);
    heap.toArray();
    expect(heap.size).toBe(10);
  });
});

describe('SkewMerge - Empty after all extracts', () => {
  it('heap is empty after extracting all elements', () => {
    const heap = new SkewMerge<number>();
    for (let i = 0; i < 5; i++) {
      heap.insert(i);
    }
    for (let i = 0; i < 5; i++) {
      heap.extractMin();
    }
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
  });
});
