import { describe, it, expect } from 'vitest';
import { AtomicSet2 } from '../src/core/atomic-set-2/index.js';

describe('AtomicSet2', () => {
  it('should add items and return true', () => {
    const set = new AtomicSet2<number>();
    expect(set.add(1)).toBe(true);
    expect(set.add(2)).toBe(true);
    expect(set.add(3)).toBe(true);
  });

  it('should return false when adding duplicate items', () => {
    const set = new AtomicSet2<number>();
    expect(set.add(1)).toBe(true);
    expect(set.add(1)).toBe(false);
    expect(set.size).toBe(1);
  });

  it('should delete items and return true', () => {
    const set = new AtomicSet2<number>();
    set.add(1);
    set.add(2);
    set.add(3);

    expect(set.delete(2)).toBe(true);
    expect(set.has(2)).toBe(false);
    expect(set.size).toBe(2);
  });

  it('should return false when deleting non-existent items', () => {
    const set = new AtomicSet2<number>();
    set.add(1);

    expect(set.delete(5)).toBe(false);
    expect(set.size).toBe(1);
  });

  it('should check if items exist', () => {
    const set = new AtomicSet2<number>();
    set.add(1);
    set.add(2);
    set.add(3);

    expect(set.has(1)).toBe(true);
    expect(set.has(2)).toBe(true);
    expect(set.has(3)).toBe(true);
    expect(set.has(4)).toBe(false);
  });

  it('should perform compare and swap successfully', () => {
    const set = new AtomicSet2<number>();
    set.add(1);
    set.add(2);
    set.add(3);

    expect(set.compareAndSwap(2, 20)).toBe(true);
    expect(set.has(2)).toBe(false);
    expect(set.has(20)).toBe(true);
    expect(set.size).toBe(3);
  });

  it('should return false when comparing non-existent item', () => {
    const set = new AtomicSet2<number>();
    set.add(1);
    set.add(2);

    expect(set.compareAndSwap(5, 50)).toBe(false);
    expect(set.has(5)).toBe(false);
    expect(set.has(50)).toBe(false);
    expect(set.size).toBe(2);
  });

  it('should return false when swapping with same value', () => {
    const set = new AtomicSet2<number>();
    set.add(1);
    set.add(2);
    set.add(3);

    expect(set.compareAndSwap(2, 2)).toBe(false);
    expect(set.has(2)).toBe(true);
    expect(set.size).toBe(3);
  });

  it('should return correct size', () => {
    const set = new AtomicSet2<number>();
    expect(set.size).toBe(0);

    set.add(1);
    expect(set.size).toBe(1);

    set.add(2);
    expect(set.size).toBe(2);

    set.add(3);
    expect(set.size).toBe(3);

    set.delete(2);
    expect(set.size).toBe(2);
  });

  it('should check if empty', () => {
    const set = new AtomicSet2<number>();
    expect(set.isEmpty()).toBe(true);

    set.add(1);
    expect(set.isEmpty()).toBe(false);

    set.delete(1);
    expect(set.isEmpty()).toBe(true);
  });

  it('should convert to array', () => {
    const set = new AtomicSet2<number>();
    set.add(1);
    set.add(2);
    set.add(3);

    const array = set.toArray();
    expect(array).toContain(1);
    expect(array).toContain(2);
    expect(array).toContain(3);
    expect(array.length).toBe(3);
  });

  it('should return empty array for empty set', () => {
    const set = new AtomicSet2<number>();
    expect(set.toArray()).toEqual([]);
  });

  it('should clear all items', () => {
    const set = new AtomicSet2<number>();
    set.add(1);
    set.add(2);
    set.add(3);

    expect(set.size).toBe(3);

    set.clear();

    expect(set.size).toBe(0);
    expect(set.isEmpty()).toBe(true);
    expect(set.has(1)).toBe(false);
    expect(set.has(2)).toBe(false);
    expect(set.has(3)).toBe(false);
  });

  it('should iterate over items with forEach', () => {
    const set = new AtomicSet2<number>();
    set.add(1);
    set.add(2);
    set.add(3);

    const items: number[] = [];
    set.forEach((item) => {
      items.push(item);
    });

    expect(items).toContain(1);
    expect(items).toContain(2);
    expect(items).toContain(3);
    expect(items.length).toBe(3);
  });

  it('should not call forEach on empty set', () => {
    const set = new AtomicSet2<number>();
    let called = false;

    set.forEach(() => {
      called = true;
    });

    expect(called).toBe(false);
  });

  it('should compute union of two sets', () => {
    const set1 = new AtomicSet2<number>();
    set1.add(1);
    set1.add(2);
    set1.add(3);

    const set2 = new AtomicSet2<number>();
    set2.add(3);
    set2.add(4);
    set2.add(5);

    const result = set1.union(set2);
    expect(result.size).toBe(5);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(true);
    expect(result.has(4)).toBe(true);
    expect(result.has(5)).toBe(true);
  });

  it('should compute intersection of two sets', () => {
    const set1 = new AtomicSet2<number>();
    set1.add(1);
    set1.add(2);
    set1.add(3);
    set1.add(4);

    const set2 = new AtomicSet2<number>();
    set2.add(3);
    set2.add(4);
    set2.add(5);
    set2.add(6);

    const result = set1.intersection(set2);
    expect(result.size).toBe(2);
    expect(result.has(3)).toBe(true);
    expect(result.has(4)).toBe(true);
    expect(result.has(1)).toBe(false);
    expect(result.has(5)).toBe(false);
  });

  it('should compute difference of two sets', () => {
    const set1 = new AtomicSet2<number>();
    set1.add(1);
    set1.add(2);
    set1.add(3);
    set1.add(4);

    const set2 = new AtomicSet2<number>();
    set2.add(3);
    set2.add(4);
    set2.add(5);
    set2.add(6);

    const result = set1.difference(set2);
    expect(result.size).toBe(2);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(false);
    expect(result.has(4)).toBe(false);
    expect(result.has(5)).toBe(false);
  });

  it('should handle union with empty set', () => {
    const set1 = new AtomicSet2<number>();
    set1.add(1);
    set1.add(2);

    const set2 = new AtomicSet2<number>();

    const result = set1.union(set2);
    expect(result.size).toBe(2);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
  });

  it('should handle intersection with empty set', () => {
    const set1 = new AtomicSet2<number>();
    set1.add(1);
    set1.add(2);

    const set2 = new AtomicSet2<number>();

    const result = set1.intersection(set2);
    expect(result.size).toBe(0);
  });

  it('should handle difference with empty set', () => {
    const set1 = new AtomicSet2<number>();
    set1.add(1);
    set1.add(2);

    const set2 = new AtomicSet2<number>();

    const result = set1.difference(set2);
    expect(result.size).toBe(2);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
  });

  it('should handle operations on empty set', () => {
    const set = new AtomicSet2<number>();
    expect(set.isEmpty()).toBe(true);
    expect(set.has(1)).toBe(false);
    expect(set.delete(1)).toBe(false);
    expect(set.size).toBe(0);
  });

  it('should work with string values', () => {
    const set = new AtomicSet2<string>();
    expect(set.add('apple')).toBe(true);
    expect(set.add('banana')).toBe(true);
    expect(set.add('cherry')).toBe(true);

    expect(set.has('apple')).toBe(true);
    expect(set.has('banana')).toBe(true);
    expect(set.has('cherry')).toBe(true);
    expect(set.has('date')).toBe(false);
    expect(set.size).toBe(3);
  });

  it('should handle multiple compareAndSwap operations', () => {
    const set = new AtomicSet2<number>();
    set.add(1);
    set.add(2);
    set.add(3);

    expect(set.compareAndSwap(1, 10)).toBe(true);
    expect(set.has(1)).toBe(false);
    expect(set.has(10)).toBe(true);

    expect(set.compareAndSwap(10, 20)).toBe(true);
    expect(set.has(10)).toBe(false);
    expect(set.has(20)).toBe(true);

    expect(set.compareAndSwap(20, 30)).toBe(true);
    expect(set.has(20)).toBe(false);
    expect(set.has(30)).toBe(true);

    expect(set.size).toBe(3);
  });

  it('should maintain size after compareAndSwap', () => {
    const set = new AtomicSet2<number>();
    set.add(1);
    set.add(2);
    set.add(3);

    const initialSize = set.size;
    expect(set.compareAndSwap(2, 20)).toBe(true);
    expect(set.size).toBe(initialSize);
  });

  it('should return all items from toArray regardless of order', () => {
    const set = new AtomicSet2<number>();
    set.add(5);
    set.add(2);
    set.add(8);
    set.add(1);

    const array = set.toArray();
    expect(array).toContain(1);
    expect(array).toContain(2);
    expect(array).toContain(5);
    expect(array).toContain(8);
    expect(array.length).toBe(4);
  });

  it('should handle clear then re-add', () => {
    const set = new AtomicSet2<number>();
    set.add(1);
    set.add(2);
    set.clear();
    expect(set.isEmpty()).toBe(true);
    set.add(3);
    expect(set.size).toBe(1);
    expect(set.has(3)).toBe(true);
    expect(set.has(1)).toBe(false);
  });

  it('should handle union of identical sets', () => {
    const set1 = new AtomicSet2<number>();
    set1.add(1);
    set1.add(2);
    const set2 = new AtomicSet2<number>();
    set2.add(1);
    set2.add(2);
    const result = set1.union(set2);
    expect(result.size).toBe(2);
  });

  it('should handle compareAndSwap after delete', () => {
    const set = new AtomicSet2<number>();
    set.add(1);
    set.add(2);
    set.delete(2);
    expect(set.compareAndSwap(2, 20)).toBe(false);
    expect(set.compareAndSwap(1, 10)).toBe(true);
  });

  it('should handle difference of identical sets', () => {
    const set1 = new AtomicSet2<number>();
    set1.add(1);
    set1.add(2);
    const set2 = new AtomicSet2<number>();
    set2.add(1);
    set2.add(2);
    const result = set1.difference(set2);
    expect(result.size).toBe(0);
  });

  it('should handle forEach', () => {
    const set = new AtomicSet2<number>();
    set.add(10);
    set.add(20);
    const items: number[] = [];
    set.forEach(v => items.push(v));
    expect(items).toHaveLength(2);
    expect(items).toContain(10);
    expect(items).toContain(20);
  });

  it('should handle toArray', () => {
    const set = new AtomicSet2<number>();
    set.add(5);
    set.add(15);
    const arr = set.toArray();
    expect(arr).toContain(5);
    expect(arr).toContain(15);
    expect(arr).toHaveLength(2);
  });

  it('should handle forEach', () => {
    const set = new AtomicSet2<number>();
    set.add(1);
    set.add(2);
    set.add(3);
    const collected: number[] = [];
    set.forEach(item => collected.push(item));
    expect(collected.length).toBe(3);
    expect(collected).toContain(1);
    expect(collected).toContain(2);
    expect(collected).toContain(3);
  });

  it('should handle clear', () => {
    const set = new AtomicSet2<number>();
    set.add(1);
    set.add(2);
    set.clear();
    expect(set.size).toBe(0);
    expect(set.isEmpty()).toBe(true);
  });
});
