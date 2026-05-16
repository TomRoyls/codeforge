import { describe, it, expect } from 'vitest';
import { IndexedPQ2 } from '../src/core/indexed-pq-2/index.js';

describe('IndexedPQ2', () => {
  it('should create empty queue with default capacity', () => {
    const pq = new IndexedPQ2();
    expect(pq.isEmpty()).toBe(true);
    expect(pq.size).toBe(0);
  });

  it('should create empty queue with custom capacity', () => {
    const pq = new IndexedPQ2(10);
    expect(pq.isEmpty()).toBe(true);
    expect(pq.size).toBe(0);
  });

  it('should insert single element', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 5);
    expect(pq.isEmpty()).toBe(false);
    expect(pq.size).toBe(1);
    expect(pq.contains(1)).toBe(true);
  });

  it('should insert multiple elements', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 5);
    pq.insert(2, 3);
    pq.insert(3, 7);
    expect(pq.size).toBe(3);
    expect(pq.contains(1)).toBe(true);
    expect(pq.contains(2)).toBe(true);
    expect(pq.contains(3)).toBe(true);
  });

  it('should throw on duplicate id insertion', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 5);
    expect(() => pq.insert(1, 10)).toThrow();
  });

  it('should peek at minimum element', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 5);
    pq.insert(2, 3);
    pq.insert(3, 7);
    const min = pq.peek();
    expect(min).toEqual({ id: 2, priority: 3 });
    expect(pq.size).toBe(3);
  });

  it('should return undefined on peek of empty queue', () => {
    const pq = new IndexedPQ2();
    expect(pq.peek()).toBe(undefined);
  });

  it('should extract minimum element', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 5);
    pq.insert(2, 3);
    pq.insert(3, 7);
    const min = pq.extractMin();
    expect(min).toEqual({ id: 2, priority: 3 });
    expect(pq.size).toBe(2);
    expect(pq.contains(2)).toBe(false);
  });

  it('should extract elements in sorted order', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 5);
    pq.insert(2, 1);
    pq.insert(3, 3);
    pq.insert(4, 2);
    pq.insert(5, 4);

    const results: Array<{ id: number; priority: number }> = [];
    while (!pq.isEmpty()) {
      const min = pq.extractMin();
      if (min) results.push(min);
    }

    expect(results).toEqual([
      { id: 2, priority: 1 },
      { id: 4, priority: 2 },
      { id: 3, priority: 3 },
      { id: 5, priority: 4 },
      { id: 1, priority: 5 },
    ]);
  });

  it('should return undefined on extractMin of empty queue', () => {
    const pq = new IndexedPQ2();
    expect(pq.extractMin()).toBe(undefined);
  });

  it('should delete element by id', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 5);
    pq.insert(2, 3);
    pq.insert(3, 7);
    const deleted = pq.delete(2);
    expect(deleted).toBe(true);
    expect(pq.size).toBe(2);
    expect(pq.contains(2)).toBe(false);
  });

  it('should return false when deleting non-existent id', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 5);
    const deleted = pq.delete(999);
    expect(deleted).toBe(false);
    expect(pq.size).toBe(1);
  });

  it('should update priority of existing element', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 5);
    pq.insert(2, 3);
    pq.insert(3, 7);

    const updated = pq.update(2, 1);
    expect(updated).toBe(true);
    expect(pq.getPriority(2)).toBe(1);
    const min = pq.peek();
    expect(min).toEqual({ id: 2, priority: 1 });
  });

  it('should return false when updating non-existent id', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 5);
    const updated = pq.update(999, 10);
    expect(updated).toBe(false);
  });

  it('should increase priority correctly', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 1);
    pq.insert(2, 3);
    pq.insert(3, 5);

    pq.update(1, 10);
    const min = pq.peek();
    expect(min).toEqual({ id: 2, priority: 3 });
  });

  it('should check if element exists', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 5);
    expect(pq.contains(1)).toBe(true);
    expect(pq.contains(999)).toBe(false);
  });

  it('should get priority of element', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 5);
    pq.insert(2, 3);
    expect(pq.getPriority(1)).toBe(5);
    expect(pq.getPriority(2)).toBe(3);
  });

  it('should return undefined for getPriority of non-existent id', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 5);
    expect(pq.getPriority(999)).toBe(undefined);
  });

  it('should return correct size', () => {
    const pq = new IndexedPQ2();
    expect(pq.size).toBe(0);
    pq.insert(1, 5);
    expect(pq.size).toBe(1);
    pq.insert(2, 3);
    expect(pq.size).toBe(2);
    pq.delete(1);
    expect(pq.size).toBe(1);
  });

  it('should return isEmpty correctly', () => {
    const pq = new IndexedPQ2();
    expect(pq.isEmpty()).toBe(true);
    pq.insert(1, 5);
    expect(pq.isEmpty()).toBe(false);
    pq.delete(1);
    expect(pq.isEmpty()).toBe(true);
  });

  it('should clear all elements', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 5);
    pq.insert(2, 3);
    pq.insert(3, 7);

    pq.clear();
    expect(pq.isEmpty()).toBe(true);
    expect(pq.size).toBe(0);
    expect(pq.contains(1)).toBe(false);
    expect(pq.contains(2)).toBe(false);
    expect(pq.contains(3)).toBe(false);
  });

  it('should handle duplicate priorities with tiebreaker by id', () => {
    const pq = new IndexedPQ2();
    pq.insert(3, 5);
    pq.insert(1, 5);
    pq.insert(2, 5);

    const results: Array<{ id: number; priority: number }> = [];
    while (!pq.isEmpty()) {
      const min = pq.extractMin();
      if (min) results.push(min);
    }

    expect(results).toEqual([
      { id: 1, priority: 5 },
      { id: 2, priority: 5 },
      { id: 3, priority: 5 },
    ]);
  });

  it('should handle many operations efficiently', () => {
    const pq = new IndexedPQ2();

    for (let i = 0; i < 1000; i++) {
      pq.insert(i, Math.floor(Math.random() * 1000));
    }

    expect(pq.size).toBe(1000);

    for (let i = 0; i < 1000; i++) {
      const min = pq.extractMin();
      expect(min).toBeDefined();
    }

    expect(pq.isEmpty()).toBe(true);
  });

  it('should handle updates after many insertions and deletions', () => {
    const pq = new IndexedPQ2();

    for (let i = 0; i < 100; i++) {
      pq.insert(i, i * 10);
    }

    pq.delete(50);
    pq.delete(25);

    pq.update(10, 1000);
    pq.update(75, 5);

    const results: Array<{ id: number; priority: number }> = [];
    while (!pq.isEmpty()) {
      const min = pq.extractMin();
      if (min) results.push(min);
    }

    expect(results[0]).toEqual({ id: 0, priority: 0 });
    expect(results[1]).toEqual({ id: 75, priority: 5 });
    expect(results[results.length - 1]).toEqual({ id: 10, priority: 1000 });
  });

  it('should handle edge case of deleting root', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 1);
    pq.insert(2, 2);
    pq.insert(3, 3);

    const deleted = pq.delete(1);
    expect(deleted).toBe(true);
    expect(pq.peek()).toEqual({ id: 2, priority: 2 });
  });

  it('should handle edge case of updating root', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 1);
    pq.insert(2, 2);
    pq.insert(3, 3);

    pq.update(1, 5);
    expect(pq.peek()).toEqual({ id: 2, priority: 2 });
  });

  it('should handle edge case of single element', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 5);

    expect(pq.size).toBe(1);
    expect(pq.contains(1)).toBe(true);
    expect(pq.getPriority(1)).toBe(5);
    expect(pq.peek()).toEqual({ id: 1, priority: 5 });

    pq.update(1, 10);
    expect(pq.getPriority(1)).toBe(10);

    const extracted = pq.extractMin();
    expect(extracted).toEqual({ id: 1, priority: 10 });
    expect(pq.isEmpty()).toBe(true);
  });

  it('should handle dynamic capacity expansion', () => {
    const pq = new IndexedPQ2(2);

    for (let i = 0; i < 100; i++) {
      pq.insert(i, i);
    }

    expect(pq.size).toBe(100);
    expect(pq.contains(50)).toBe(true);
    expect(pq.getPriority(50)).toBe(50);
  });

  it('should handle negative priorities', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, -5);
    pq.insert(2, -10);
    pq.insert(3, 5);

    expect(pq.peek()).toEqual({ id: 2, priority: -10 });
  });

  it('should handle very large priorities', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, Number.MAX_SAFE_INTEGER);
    pq.insert(2, Number.MIN_SAFE_INTEGER);
    pq.insert(3, 0);

    expect(pq.peek()).toEqual({ id: 2, priority: Number.MIN_SAFE_INTEGER });
  });

  it('should handle clear', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 10);
    pq.insert(2, 20);
    pq.clear();
    expect(pq.isEmpty()).toBe(true);
    expect(pq.size).toBe(0);
  });

  it('should handle update on missing element', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 10);
    expect(pq.update(99, 5)).toBe(false);
  });

  it('should handle getPriority on missing element', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 10);
    expect(pq.getPriority(1)).toBe(10);
    expect(pq.getPriority(99)).toBeUndefined();
  });

  it('should handle peek', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 10);
    pq.insert(2, 5);
    pq.insert(3, 20);
    const top = pq.peek();
    expect(top).toBeDefined();
    expect(top!.priority).toBe(5);
  });

  it('should handle contains', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 10);
    pq.insert(2, 20);
    expect(pq.contains(1)).toBe(true);
    expect(pq.contains(99)).toBe(false);
  });

  it('should handle delete', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 10);
    pq.insert(2, 20);
    pq.insert(3, 30);
    expect(pq.delete(2)).toBe(true);
    expect(pq.contains(2)).toBe(false);
  });

  it('should handle updatePriority', () => {
    const pq = new IndexedPQ2();
    pq.insert(1, 10);
    pq.insert(2, 20);
    pq.update(1, 25);
    expect(pq.getPriority(1)).toBe(25);
  });

  it('should handle delete', () => {
    const pq = new IndexedPQ2<number>();
    pq.insert(1, 10);
    pq.insert(2, 20);
    expect(pq.delete(1)).toBe(true);
    expect(pq.getPriority(1)).toBeUndefined();
    expect(pq.getPriority(2)).toBe(20);
  });

  it('should handle contains', () => {
    const pq = new IndexedPQ2<number>();
    pq.insert(1, 10);
    pq.insert(2, 20);
    expect(pq.contains(1)).toBe(true);
    expect(pq.contains(99)).toBe(false);
  });

  it('should handle update', () => {
    const pq = new IndexedPQ2<number>();
    pq.insert(1, 10);
    pq.insert(2, 20);
    pq.update(1, 50);
    expect(pq.getPriority(1)).toBe(50);
  });

  it('should handle contains', () => {
    const pq = new IndexedPQ2<number>();
    pq.insert(1, 10);
    pq.insert(2, 20);
    expect(pq.contains(1)).toBe(true);
    expect(pq.contains(99)).toBe(false);
  });

  it('should handle clear', () => {
    const pq = new IndexedPQ2<number>();
    pq.insert(1, 10);
    pq.insert(2, 20);
    pq.clear();
    expect(pq.isEmpty()).toBe(true);
  });
  it('should handle contains', () => {
    const pq = new IndexedPQ2<number>();
    pq.insert('a', 10);
    expect(pq.contains('a')).toBe(true);
    expect(pq.contains('z')).toBe(false);
  });
  it('should handle update', () => {
    const pq = new IndexedPQ2<number>();
    pq.insert('a', 10);
    pq.insert('b', 20);
    expect(pq.update('a', 5)).toBe(true);
    expect(pq.peek()!.id).toBe('a');
  });
  it('should handle clear', () => {
    const pq = new IndexedPQ2<number>();
    pq.insert('a', 10);
    pq.insert('b', 20);
    pq.clear();
    expect(pq.size).toBe(0);
    expect(pq.isEmpty()).toBe(true);
  });
});
