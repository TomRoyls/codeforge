import { describe, it, expect } from 'vitest';
import { BinomialQueue } from './src/core/binomial-queue/index.js';

describe('BinomialQueue constructor', () => {
  it('creates empty queue', () => {
    const queue = new BinomialQueue<number>();
    expect(queue.size()).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  });

  it('uses default comparator', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(7);
    expect(queue.peek()).toBe(3);
  });

  it('uses custom comparator', () => {
    const queue = new BinomialQueue<number>({ comparator: (a, b) => b - a });
    queue.push(5);
    queue.push(3);
    queue.push(7);
    expect(queue.peek()).toBe(7);
  });
});

describe('BinomialQueue push', () => {
  it('pushes single element', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    expect(queue.size()).toBe(1);
    expect(queue.isEmpty()).toBe(false);
    expect(queue.peek()).toBe(5);
  });

  it('pushes multiple elements', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    expect(queue.size()).toBe(3);
    expect(queue.peek()).toBe(3);
  });

  it('maintains min-heap property', () => {
    const queue = new BinomialQueue<number>();
    queue.push(10);
    queue.push(5);
    queue.push(15);
    queue.push(2);
    queue.push(7);
    expect(queue.peek()).toBe(2);
  });
});

describe('BinomialQueue pop', () => {
  it('throws on empty queue', () => {
    const queue = new BinomialQueue<number>();
    expect(() => queue.pop()).toThrow('Queue is empty');
  });

  it('pops single element', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    const popped = queue.pop();
    expect(popped).toBe(5);
    expect(queue.size()).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  });

  it('pops in sorted order', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    queue.push(1);
    queue.push(6);
    expect(queue.pop()).toBe(1);
    expect(queue.pop()).toBe(3);
    expect(queue.pop()).toBe(5);
    expect(queue.pop()).toBe(6);
    expect(queue.pop()).toBe(8);
  });

  it('updates size after pop', () => {
    const queue = new BinomialQueue<number>();
    queue.push(1);
    queue.push(2);
    queue.push(3);
    queue.pop();
    expect(queue.size()).toBe(2);
    queue.pop();
    expect(queue.size()).toBe(1);
    queue.pop();
    expect(queue.size()).toBe(0);
  });
});

describe('BinomialQueue peek', () => {
  it('throws on empty queue', () => {
    const queue = new BinomialQueue<number>();
    expect(() => queue.peek()).toThrow('Queue is empty');
  });

  it('returns min without removing', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    expect(queue.peek()).toBe(3);
    expect(queue.size()).toBe(3);
    expect(queue.peek()).toBe(3);
  });

  it('returns correct min after multiple pushes', () => {
    const queue = new BinomialQueue<number>();
    queue.push(10);
    queue.push(5);
    queue.push(15);
    queue.push(2);
    expect(queue.peek()).toBe(2);
    queue.push(1);
    expect(queue.peek()).toBe(1);
  });
});

describe('BinomialQueue size', () => {
  it('returns 0 for empty queue', () => {
    const queue = new BinomialQueue<number>();
    expect(queue.size()).toBe(0);
  });

  it('returns correct size after pushes', () => {
    const queue = new BinomialQueue<number>();
    expect(queue.size()).toBe(0);
    queue.push(1);
    expect(queue.size()).toBe(1);
    queue.push(2);
    expect(queue.size()).toBe(2);
    queue.push(3);
    expect(queue.size()).toBe(3);
  });

  it('returns correct size after pops', () => {
    const queue = new BinomialQueue<number>();
    queue.push(1);
    queue.push(2);
    queue.push(3);
    queue.pop();
    expect(queue.size()).toBe(2);
    queue.pop();
    expect(queue.size()).toBe(1);
  });
});

describe('BinomialQueue isEmpty', () => {
  it('returns true for empty queue', () => {
    const queue = new BinomialQueue<number>();
    expect(queue.isEmpty()).toBe(true);
  });

  it('returns false after push', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    expect(queue.isEmpty()).toBe(false);
  });

  it('returns true after clearing', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.clear();
    expect(queue.isEmpty()).toBe(true);
  });

  it('returns true after all pops', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.pop();
    queue.pop();
    expect(queue.isEmpty()).toBe(true);
  });
});

describe('BinomialQueue clear', () => {
  it('clears empty queue', () => {
    const queue = new BinomialQueue<number>();
    queue.clear();
    expect(queue.size()).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  });

  it('clears non-empty queue', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    queue.clear();
    expect(queue.size()).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  });

  it('clears large queue', () => {
    const queue = new BinomialQueue<number>();
    for (let i = 0; i < 100; i++) {
      queue.push(i);
    }
    queue.clear();
    expect(queue.size()).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  });
});

describe('BinomialQueue toArray', () => {
  it('returns empty array for empty queue', () => {
    const queue = new BinomialQueue<number>();
    expect(queue.toArray()).toEqual([]);
  });

  it('returns array with all elements', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    const arr = queue.toArray();
    expect(arr).toHaveLength(3);
    expect(arr).toContain(3);
    expect(arr).toContain(5);
    expect(arr).toContain(8);
  });

  it('does not modify queue', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    queue.toArray();
    expect(queue.size()).toBe(3);
    expect(queue.peek()).toBe(3);
  });
});

describe('BinomialQueue toSortedArray', () => {
  it('returns empty array for empty queue', () => {
    const queue = new BinomialQueue<number>();
    expect(queue.toSortedArray()).toEqual([]);
  });

  it('returns sorted array', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    queue.push(1);
    queue.push(6);
    expect(queue.toSortedArray()).toEqual([1, 3, 5, 6, 8]);
  });

  it('does not modify original queue', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    queue.toSortedArray();
    expect(queue.size()).toBe(3);
    expect(queue.peek()).toBe(3);
  });

  it('handles duplicates', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(5);
    queue.push(3);
    queue.push(3);
    expect(queue.toSortedArray()).toEqual([3, 3, 5, 5]);
  });
});

describe('BinomialQueue contains', () => {
  it('returns false for empty queue', () => {
    const queue = new BinomialQueue<number>();
    expect(queue.contains(5)).toBe(false);
  });

  it('returns true for existing element', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    expect(queue.contains(5)).toBe(true);
    expect(queue.contains(3)).toBe(true);
    expect(queue.contains(8)).toBe(true);
  });

  it('returns false for non-existent element', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    expect(queue.contains(8)).toBe(false);
    expect(queue.contains(1)).toBe(false);
  });
});

describe('BinomialQueue remove', () => {
  it('returns false for non-existent item', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    expect(queue.remove(8)).toBe(false);
    expect(queue.size()).toBe(2);
  });

  it('removes existing item', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    expect(queue.remove(5)).toBe(true);
    expect(queue.size()).toBe(2);
    expect(queue.contains(5)).toBe(false);
    expect(queue.contains(3)).toBe(true);
    expect(queue.contains(8)).toBe(true);
  });

  it('removes minimum', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    expect(queue.remove(3)).toBe(true);
    expect(queue.peek()).toBe(5);
  });

  it('removes maximum', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    expect(queue.remove(8)).toBe(true);
    expect(queue.size()).toBe(2);
    expect(queue.contains(8)).toBe(false);
  });

  it('removes middle element', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    queue.remove(5);
    expect(queue.contains(5)).toBe(false);
    expect(queue.contains(3)).toBe(true);
    expect(queue.contains(8)).toBe(true);
  });
});

describe('BinomialQueue decreaseKey', () => {
  it('returns false for non-existent item', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    expect(queue.decreaseKey(8, 1)).toBe(false);
  });

  it('returns false for increase operation', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    expect(queue.decreaseKey(3, 10)).toBe(false);
  });

  it('decreases key to smaller value', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(10);
    queue.push(15);
    expect(queue.decreaseKey(10, 3)).toBe(true);
    expect(queue.peek()).toBe(3);
  });

  it('maintains heap property after decrease', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(10);
    queue.push(15);
    queue.push(20);
    queue.decreaseKey(20, 2);
    expect(queue.peek()).toBe(2);
    expect(queue.pop()).toBe(2);
    expect(queue.pop()).toBe(5);
  });

  it('handles decrease to same value', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(10);
    expect(queue.decreaseKey(10, 10)).toBe(true);
    expect(queue.peek()).toBe(5);
  });
});

describe('BinomialQueue merge', () => {
  it('merges empty with empty', () => {
    const queue1 = new BinomialQueue<number>();
    const queue2 = new BinomialQueue<number>();
    queue1.merge(queue2);
    expect(queue1.size()).toBe(0);
    expect(queue2.size()).toBe(0);
  });

  it('merges non-empty with empty', () => {
    const queue1 = new BinomialQueue<number>();
    const queue2 = new BinomialQueue<number>();
    queue1.push(5);
    queue1.push(3);
    queue1.merge(queue2);
    expect(queue1.size()).toBe(2);
    expect(queue2.size()).toBe(0);
  });

  it('merges empty with non-empty', () => {
    const queue1 = new BinomialQueue<number>();
    const queue2 = new BinomialQueue<number>();
    queue2.push(5);
    queue2.push(3);
    queue1.merge(queue2);
    expect(queue1.size()).toBe(2);
    expect(queue2.size()).toBe(0);
  });

  it('merges two non-empty queues', () => {
    const queue1 = new BinomialQueue<number>();
    const queue2 = new BinomialQueue<number>();
    queue1.push(5);
    queue1.push(10);
    queue2.push(3);
    queue2.push(8);
    queue1.merge(queue2);
    expect(queue1.size()).toBe(4);
    expect(queue2.size()).toBe(0);
    expect(queue1.pop()).toBe(3);
    expect(queue1.pop()).toBe(5);
    expect(queue1.pop()).toBe(8);
    expect(queue1.pop()).toBe(10);
  });

  it('merges queue with itself', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    const sizeBefore = queue.size();
    queue.merge(queue);
    expect(queue.size()).toBe(sizeBefore);
  });
});

describe('BinomialQueue clone', () => {
  it('clones empty queue', () => {
    const queue = new BinomialQueue<number>();
    const cloned = queue.clone();
    expect(cloned.size()).toBe(0);
    expect(cloned.isEmpty()).toBe(true);
  });

  it('clones non-empty queue', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    const cloned = queue.clone();
    expect(cloned.size()).toBe(queue.size());
    expect(cloned.peek()).toBe(queue.peek());
  });

  it('clone is independent', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    const cloned = queue.clone();
    cloned.push(10);
    expect(cloned.size()).toBe(3);
    expect(queue.size()).toBe(2);
    cloned.pop();
    expect(cloned.size()).toBe(2);
    expect(queue.size()).toBe(2);
  });
});

describe('BinomialQueue fromArray', () => {
  it('creates empty queue from empty array', () => {
    const queue = BinomialQueue.fromArray<number>([]);
    expect(queue.size()).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  });

  it('creates queue from single element', () => {
    const queue = BinomialQueue.fromArray<number>([5]);
    expect(queue.size()).toBe(1);
    expect(queue.peek()).toBe(5);
  });

  it('creates queue from multiple elements', () => {
    const queue = BinomialQueue.fromArray<number>([5, 3, 8, 1, 6]);
    expect(queue.size()).toBe(5);
    expect(queue.pop()).toBe(1);
    expect(queue.pop()).toBe(3);
    expect(queue.pop()).toBe(5);
    expect(queue.pop()).toBe(6);
    expect(queue.pop()).toBe(8);
  });

  it('uses custom comparator', () => {
    const queue = BinomialQueue.fromArray<number>([5, 3, 8], { comparator: (a, b) => b - a });
    expect(queue.peek()).toBe(8);
  });
});

describe('BinomialQueue forEach', () => {
  it('does nothing on empty queue', () => {
    const queue = new BinomialQueue<number>();
    const results: number[] = [];
    queue.forEach(v => results.push(v));
    expect(results).toEqual([]);
  });

  it('visits all elements', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    const results: number[] = [];
    queue.forEach(v => results.push(v));
    expect(results).toHaveLength(3);
    expect(results).toContain(3);
    expect(results).toContain(5);
    expect(results).toContain(8);
  });
});

describe('BinomialQueue iterator', () => {
  it('iterates over empty queue', () => {
    const queue = new BinomialQueue<number>();
    const results: number[] = [];
    for (const item of queue) {
      results.push(item);
    }
    expect(results).toEqual([]);
  });

  it('iterates over all elements', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(3);
    queue.push(8);
    const results: number[] = [];
    for (const item of queue) {
      results.push(item);
    }
    expect(results).toHaveLength(3);
    expect(results).toContain(3);
    expect(results).toContain(5);
    expect(results).toContain(8);
  });
});

describe('BinomialQueue with custom comparator', () => {
  it('works with max heap comparator', () => {
    const queue = new BinomialQueue<number>({ comparator: (a, b) => b - a });
    queue.push(5);
    queue.push(3);
    queue.push(8);
    queue.push(1);
    queue.push(6);
    expect(queue.pop()).toBe(8);
    expect(queue.pop()).toBe(6);
    expect(queue.pop()).toBe(5);
    expect(queue.pop()).toBe(3);
    expect(queue.pop()).toBe(1);
  });

  it('works with string comparator', () => {
    const queue = new BinomialQueue<string>((a, b) => a.localeCompare(b));
    queue.push('zebra');
    queue.push('apple');
    queue.push('banana');
    queue.push('cherry');
    expect(queue.pop()).toBe('apple');
    expect(queue.pop()).toBe('banana');
    expect(queue.pop()).toBe('cherry');
    expect(queue.pop()).toBe('zebra');
  });
});

describe('BinomialQueue stress tests', () => {
  it('handles many elements', () => {
    const queue = new BinomialQueue<number>();
    const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
    values.forEach(v => queue.push(v));
    expect(queue.size()).toBe(100);
  });

  it('pops in sorted order after many pushes', () => {
    const queue = new BinomialQueue<number>();
    const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
    values.forEach(v => queue.push(v));
    const sorted = [...values].sort((a, b) => a - b);
    for (const expected of sorted) {
      expect(queue.pop()).toBe(expected);
    }
  });

  it('handles sequential pushes', () => {
    const queue = new BinomialQueue<number>();
    for (let i = 0; i < 100; i++) {
      queue.push(i);
    }
    for (let i = 0; i < 100; i++) {
      expect(queue.pop()).toBe(i);
    }
  });

  it('handles reverse sequential pushes', () => {
    const queue = new BinomialQueue<number>();
    for (let i = 99; i >= 0; i--) {
      queue.push(i);
    }
    for (let i = 0; i < 100; i++) {
      expect(queue.pop()).toBe(i);
    }
  });

  it('handles alternating push and pop', () => {
    const queue = new BinomialQueue<number>();
    queue.push(10);
    queue.push(5);
    expect(queue.pop()).toBe(5);
    queue.push(3);
    expect(queue.pop()).toBe(3);
    queue.push(8);
    expect(queue.pop()).toBe(8);
    expect(queue.pop()).toBe(10);
  });

  it('handles duplicates', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(5);
    queue.push(3);
    queue.push(3);
    queue.push(8);
    expect(queue.size()).toBe(5);
    expect(queue.pop()).toBe(3);
    expect(queue.pop()).toBe(3);
    expect(queue.pop()).toBe(5);
    expect(queue.pop()).toBe(5);
    expect(queue.pop()).toBe(8);
  });

  it('handles negative numbers', () => {
    const queue = new BinomialQueue<number>();
    queue.push(-5);
    queue.push(3);
    queue.push(-8);
    queue.push(1);
    queue.push(-6);
    expect(queue.pop()).toBe(-8);
    expect(queue.pop()).toBe(-6);
    expect(queue.pop()).toBe(-5);
    expect(queue.pop()).toBe(1);
    expect(queue.pop()).toBe(3);
  });

  it('handles zeros', () => {
    const queue = new BinomialQueue<number>();
    queue.push(5);
    queue.push(0);
    queue.push(-3);
    queue.push(0);
    queue.push(8);
    expect(queue.pop()).toBe(-3);
    expect(queue.pop()).toBe(0);
    expect(queue.pop()).toBe(0);
    expect(queue.pop()).toBe(5);
    expect(queue.pop()).toBe(8);
  });
});

describe('BinomialQueue integration tests', () => {
  it('handles mixed operations', () => {
    const queue = new BinomialQueue<number>();
    queue.push(10);
    queue.push(5);
    queue.push(15);
    queue.push(3);
    queue.push(7);
    expect(queue.size()).toBe(5);
    expect(queue.peek()).toBe(3);
    queue.remove(10);
    expect(queue.size()).toBe(4);
    expect(queue.contains(10)).toBe(false);
    expect(queue.toSortedArray()).toEqual([3, 5, 7, 15]);
  });

  it('handles clone and merge together', () => {
    const queue1 = new BinomialQueue<number>();
    queue1.push(5);
    queue1.push(10);
    const queue2 = queue1.clone();
    queue2.push(3);
    queue1.merge(queue2);
    expect(queue1.size()).toBe(5);
    expect(queue1.toSortedArray()).toEqual([3, 5, 5, 10, 10]);
  });
});
