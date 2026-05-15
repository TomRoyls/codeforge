import { describe, it, expect } from 'vitest';
import { FibonacciSearch4 } from '../src/core/fibonacci-search-4';

describe('FibonacciSearch4', () => {
  it('should handle empty array', async () => {
    const searcher = new FibonacciSearch4([]);
    expect(searcher.length).toBe(0);
    expect(searcher.isEmpty()).toBe(true);
    expect(searcher.search(5)).toBe(-1);
    expect(searcher.searchFirst(5)).toBe(-1);
    expect(searcher.searchLast(5)).toBe(-1);
    expect(searcher.searchRange(5)).toEqual([-1, -1]);
    expect(searcher.contains(5)).toBe(false);
    expect(searcher.count(5)).toBe(0);
  });

  it('should handle single element array', async () => {
    const searcher = new FibonacciSearch4([10]);
    expect(searcher.length).toBe(1);
    expect(searcher.isEmpty()).toBe(false);
    expect(searcher.search(10)).toBe(0);
    expect(searcher.search(5)).toBe(-1);
    expect(searcher.searchFirst(10)).toBe(0);
    expect(searcher.searchLast(10)).toBe(0);
    expect(searcher.searchRange(10)).toEqual([0, 0]);
    expect(searcher.contains(10)).toBe(true);
    expect(searcher.contains(5)).toBe(false);
    expect(searcher.count(10)).toBe(1);
  });

  it('should perform basic search on sorted array', async () => {
    const searcher = new FibonacciSearch4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(searcher.search(5)).toBe(4);
    expect(searcher.search(1)).toBe(0);
    expect(searcher.search(10)).toBe(9);
    expect(searcher.search(6)).toBe(5);
    expect(searcher.search(11)).toBe(-1);
    expect(searcher.search(0)).toBe(-1);
  });

  it('should find first occurrence with duplicates', async () => {
    const searcher = new FibonacciSearch4([1, 2, 2, 2, 3, 4]);
    expect(searcher.searchFirst(2)).toBe(1);
    expect(searcher.searchFirst(1)).toBe(0);
    expect(searcher.searchFirst(4)).toBe(5);
    expect(searcher.searchFirst(5)).toBe(-1);
  });

  it('should find last occurrence with duplicates', async () => {
    const searcher = new FibonacciSearch4([1, 2, 2, 2, 3, 4]);
    expect(searcher.searchLast(2)).toBe(3);
    expect(searcher.searchLast(1)).toBe(0);
    expect(searcher.searchLast(4)).toBe(5);
    expect(searcher.searchLast(5)).toBe(-1);
  });

  it('should find range with duplicates', async () => {
    const searcher = new FibonacciSearch4([1, 2, 2, 2, 3, 4]);
    expect(searcher.searchRange(2)).toEqual([1, 3]);
    expect(searcher.searchRange(1)).toEqual([0, 0]);
    expect(searcher.searchRange(4)).toEqual([5, 5]);
    expect(searcher.searchRange(5)).toEqual([-1, -1]);
  });

  it('should count occurrences with duplicates', async () => {
    const searcher = new FibonacciSearch4([1, 2, 2, 2, 3, 3, 4]);
    expect(searcher.count(2)).toBe(3);
    expect(searcher.count(3)).toBe(2);
    expect(searcher.count(1)).toBe(1);
    expect(searcher.count(4)).toBe(1);
    expect(searcher.count(5)).toBe(0);
  });

  it('should check if target exists', async () => {
    const searcher = new FibonacciSearch4([1, 2, 3, 4, 5]);
    expect(searcher.contains(3)).toBe(true);
    expect(searcher.contains(1)).toBe(true);
    expect(searcher.contains(5)).toBe(true);
    expect(searcher.contains(0)).toBe(false);
    expect(searcher.contains(6)).toBe(false);
  });

  it('should return array copy', async () => {
    const original = [1, 2, 3, 4, 5];
    const searcher = new FibonacciSearch4(original);
    const copy = searcher.toArray();
    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
  });

  it('should handle array with all duplicates', async () => {
    const searcher = new FibonacciSearch4([5, 5, 5, 5, 5]);
    expect(searcher.search(5)).not.toBe(-1);
    expect(searcher.searchFirst(5)).toBe(0);
    expect(searcher.searchLast(5)).toBe(4);
    expect(searcher.searchRange(5)).toEqual([0, 4]);
    expect(searcher.count(5)).toBe(5);
    expect(searcher.contains(5)).toBe(true);
  });

  it('should handle large dataset', async () => {
    const largeArray = Array.from({ length: 1000 }, (_, i) => i);
    const searcher = new FibonacciSearch4(largeArray);
    expect(searcher.search(500)).toBe(500);
    expect(searcher.search(0)).toBe(0);
    expect(searcher.search(999)).toBe(999);
    expect(searcher.search(1000)).toBe(-1);
    expect(searcher.length).toBe(1000);
    expect(searcher.isEmpty()).toBe(false);
  });

  it('should handle large dataset with duplicates', async () => {
    const largeArray = Array.from({ length: 100 }, (_, i) => Math.floor(i / 10));
    const searcher = new FibonacciSearch4(largeArray);
    expect(searcher.search(5)).not.toBe(-1);
    expect(searcher.searchFirst(5)).toBe(50);
    expect(searcher.searchLast(5)).toBe(59);
    expect(searcher.searchRange(5)).toEqual([50, 59]);
    expect(searcher.count(5)).toBe(10);
  });

  it('should handle negative numbers', async () => {
    const searcher = new FibonacciSearch4([-10, -5, 0, 5, 10]);
    expect(searcher.search(-10)).toBe(0);
    expect(searcher.search(-5)).toBe(1);
    expect(searcher.search(0)).toBe(2);
    expect(searcher.search(5)).toBe(3);
    expect(searcher.search(10)).toBe(4);
    expect(searcher.search(-15)).toBe(-1);
    expect(searcher.search(15)).toBe(-1);
  });

  it('should handle target not at edges', async () => {
    const searcher = new FibonacciSearch4([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    expect(searcher.search(30)).toBe(2);
    expect(searcher.search(70)).toBe(6);
    expect(searcher.search(50)).toBe(4);
  });

  it('should handle sparse duplicates', async () => {
    const searcher = new FibonacciSearch4([1, 1, 3, 3, 3, 5, 7, 7, 9]);
    expect(searcher.count(1)).toBe(2);
    expect(searcher.count(3)).toBe(3);
    expect(searcher.count(5)).toBe(1);
    expect(searcher.count(7)).toBe(2);
    expect(searcher.count(9)).toBe(1);
  });

  it('should handle two-element array', () => {
    const searcher = new FibonacciSearch4([1, 3]);
    expect(searcher.search(1)).toBe(0);
    expect(searcher.search(3)).toBe(1);
    expect(searcher.search(2)).toBe(-1);
    expect(searcher.contains(1)).toBe(true);
    expect(searcher.contains(2)).toBe(false);
  });

  it('should handle three-element array', () => {
    const searcher = new FibonacciSearch4([10, 20, 30]);
    expect(searcher.search(10)).toBe(0);
    expect(searcher.search(20)).toBe(1);
    expect(searcher.search(30)).toBe(2);
    expect(searcher.searchRange(20)).toEqual([1, 1]);
  });

  it('should search edge values', () => {
    const searcher = new FibonacciSearch4([2, 4, 6, 8, 10]);
    expect(searcher.search(6)).toBe(2);
    expect(searcher.search(2)).toBe(0);
    expect(searcher.search(10)).toBe(4);
  });

  it('should handle all same negative numbers', () => {
    const searcher = new FibonacciSearch4([-3, -3, -3]);
    expect(searcher.searchFirst(-3)).toBe(0);
    expect(searcher.searchLast(-3)).toBe(2);
    expect(searcher.count(-3)).toBe(3);
  });
});
