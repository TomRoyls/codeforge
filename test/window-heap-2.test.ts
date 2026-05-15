import { describe, it, expect } from 'vitest';
import { WindowHeap2 } from '../src/core/window-heap-2/index.js';

describe('WindowHeap2', () => {
  it('should create a window with specified size', () => {
    const heap = new WindowHeap2(5);
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should push values into the window', () => {
    const heap = new WindowHeap2(3);
    heap.push(1);
    heap.push(2);
    heap.push(3);
    expect(heap.size).toBe(3);
    expect(heap.getWindow()).toEqual([1, 2, 3]);
  });

  it('should evict oldest element when window exceeds size', () => {
    const heap = new WindowHeap2(3);
    heap.push(1);
    heap.push(2);
    heap.push(3);
    heap.push(4);
    expect(heap.size).toBe(3);
    expect(heap.getWindow()).toEqual([2, 3, 4]);
  });

  it('should return correct median for odd number of elements', () => {
    const heap = new WindowHeap2(5);
    heap.push(5);
    heap.push(2);
    heap.push(8);
    heap.push(1);
    heap.push(9);
    expect(heap.getMedian()).toBe(5);
  });

  it('should return correct median for even number of elements', () => {
    const heap = new WindowHeap2(4);
    heap.push(5);
    heap.push(2);
    heap.push(8);
    heap.push(1);
    expect(heap.getMedian()).toBe(3.5);
  });

  it('should push and return median', () => {
    const heap = new WindowHeap2(3);
    const median1 = heap.pushAndGetMedian(5);
    expect(median1).toBe(5);
    const median2 = heap.pushAndGetMedian(2);
    expect(median2).toBe(3.5);
    const median3 = heap.pushAndGetMedian(8);
    expect(median3).toBe(5);
  });

  it('should return minimum value', () => {
    const heap = new WindowHeap2(5);
    heap.push(5);
    heap.push(2);
    heap.push(8);
    heap.push(1);
    heap.push(9);
    expect(heap.getMin()).toBe(1);
  });

  it('should return maximum value', () => {
    const heap = new WindowHeap2(5);
    heap.push(5);
    heap.push(2);
    heap.push(8);
    heap.push(1);
    heap.push(9);
    expect(heap.getMax()).toBe(9);
  });

  it('should return sum of values', () => {
    const heap = new WindowHeap2(5);
    heap.push(5);
    heap.push(2);
    heap.push(8);
    heap.push(1);
    heap.push(9);
    expect(heap.getSum()).toBe(25);
  });

  it('should return average of values', () => {
    const heap = new WindowHeap2(5);
    heap.push(5);
    heap.push(2);
    heap.push(8);
    heap.push(1);
    heap.push(9);
    expect(heap.getAverage()).toBe(5);
  });

  it('should return correct size', () => {
    const heap = new WindowHeap2(5);
    expect(heap.size).toBe(0);
    heap.push(1);
    expect(heap.size).toBe(1);
    heap.push(2);
    expect(heap.size).toBe(2);
  });

  it('should check if window is empty', () => {
    const heap = new WindowHeap2(5);
    expect(heap.isEmpty()).toBe(true);
    heap.push(1);
    expect(heap.isEmpty()).toBe(false);
  });

  it('should return copy of window', () => {
    const heap = new WindowHeap2(5);
    heap.push(1);
    heap.push(2);
    heap.push(3);
    const window = heap.getWindow();
    window.push(4);
    expect(heap.size).toBe(3);
    expect(heap.getWindow()).toEqual([1, 2, 3]);
  });

  it('should clear the window', () => {
    const heap = new WindowHeap2(5);
    heap.push(1);
    heap.push(2);
    heap.push(3);
    heap.clear();
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
    expect(heap.getWindow()).toEqual([]);
  });

  it('should throw error when getting median from empty window', () => {
    const heap = new WindowHeap2(5);
    expect(() => heap.getMedian()).toThrow('Window is empty');
  });

  it('should throw error when getting minimum from empty window', () => {
    const heap = new WindowHeap2(5);
    expect(() => heap.getMin()).toThrow('Window is empty');
  });

  it('should throw error when getting maximum from empty window', () => {
    const heap = new WindowHeap2(5);
    expect(() => heap.getMax()).toThrow('Window is empty');
  });

  it('should throw error when getting average from empty window', () => {
    const heap = new WindowHeap2(5);
    expect(() => heap.getAverage()).toThrow('Window is empty');
  });

  it('should handle single element', () => {
    const heap = new WindowHeap2(5);
    heap.push(42);
    expect(heap.size).toBe(1);
    expect(heap.getMedian()).toBe(42);
    expect(heap.getMin()).toBe(42);
    expect(heap.getMax()).toBe(42);
    expect(heap.getAverage()).toBe(42);
  });

  it('should handle negative numbers', () => {
    const heap = new WindowHeap2(5);
    heap.push(-5);
    heap.push(-2);
    heap.push(-8);
    heap.push(-1);
    heap.push(-9);
    expect(heap.getMedian()).toBe(-5);
    expect(heap.getMin()).toBe(-9);
    expect(heap.getMax()).toBe(-1);
  });

  it('should handle decimal numbers', () => {
    const heap = new WindowHeap2(5);
    heap.push(1.5);
    heap.push(2.5);
    heap.push(3.5);
    heap.push(4.5);
    heap.push(5.5);
    expect(heap.getMedian()).toBe(3.5);
    expect(heap.getAverage()).toBe(3.5);
  });

  it('should handle sliding window eviction correctly', () => {
    const heap = new WindowHeap2(3);
    heap.push(1);
    heap.push(2);
    heap.push(3);
    expect(heap.getWindow()).toEqual([1, 2, 3]);

    heap.push(4);
    expect(heap.getWindow()).toEqual([2, 3, 4]);

    heap.push(5);
    expect(heap.getWindow()).toEqual([3, 4, 5]);

    heap.push(6);
    expect(heap.getWindow()).toEqual([4, 5, 6]);
  });

  it('should calculate sum correctly after eviction', () => {
    const heap = new WindowHeap2(3);
    heap.push(10);
    heap.push(20);
    heap.push(30);
    expect(heap.getSum()).toBe(60);

    heap.push(40);
    expect(heap.getSum()).toBe(90);
  });

  it('should calculate average correctly after eviction', () => {
    const heap = new WindowHeap2(3);
    heap.push(10);
    heap.push(20);
    heap.push(30);
    expect(heap.getAverage()).toBe(20);

    heap.push(40);
    expect(heap.getAverage()).toBe(30);
  });

  it('should handle window size of 1', () => {
    const heap = new WindowHeap2(1);
    heap.push(1);
    expect(heap.getWindow()).toEqual([1]);

    heap.push(2);
    expect(heap.getWindow()).toEqual([2]);

    heap.push(3);
    expect(heap.getWindow()).toEqual([3]);
  });

  it('should handle clear then push', () => {
    const heap = new WindowHeap2(3);
    heap.push(1);
    heap.push(2);
    heap.clear();
    expect(heap.isEmpty()).toBe(true);
    heap.push(3);
    expect(heap.size).toBe(1);
    expect(heap.getMedian()).toBe(3);
  });

  it('should handle getSum on empty window returning 0', () => {
    const heap = new WindowHeap2(5);
    expect(heap.getSum()).toBe(0);
  });

  it('should handle median with two elements', () => {
    const heap = new WindowHeap2(5);
    heap.push(3);
    heap.push(7);
    expect(heap.getMedian()).toBe(5);
  });

  it('should handle mixed positive and negative', () => {
    const heap = new WindowHeap2(5);
    heap.push(-10);
    heap.push(0);
    heap.push(10);
    expect(heap.getMin()).toBe(-10);
    expect(heap.getMax()).toBe(10);
    expect(heap.getAverage()).toBe(0);
  });

  it('should handle window size of 1', () => {
    const heap = new WindowHeap2(1);
    heap.push(5);
    expect(heap.getMin()).toBe(5);
    expect(heap.getMax()).toBe(5);
    expect(heap.getMedian()).toBe(5);
    heap.push(10);
    expect(heap.getMin()).toBe(10);
    expect(heap.size).toBe(1);
  });

  it('should handle getAverage with single element', () => {
    const heap = new WindowHeap2(3);
    heap.push(7);
    expect(heap.getAverage()).toBe(7);
  });

  it('should handle clear', () => {
    const heap = new WindowHeap2(5);
    heap.push(1);
    heap.push(2);
    heap.clear();
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });

  it('should handle getWindow', () => {
    const heap = new WindowHeap2(3);
    heap.push(10);
    heap.push(20);
    const win = heap.getWindow();
    expect(win).toHaveLength(2);
    expect(win).toContain(10);
    expect(win).toContain(20);
  });

  it('should handle getSum', () => {
    const heap = new WindowHeap2(3);
    heap.push(10);
    heap.push(20);
    expect(heap.getSum()).toBe(30);
  });

  it('should handle getAverage', () => {
    const heap = new WindowHeap2(5);
    heap.push(10);
    heap.push(20);
    heap.push(30);
    expect(heap.getAverage()).toBe(20);
  });

  it('should handle clear', () => {
    const heap = new WindowHeap2(5);
    heap.push(10);
    heap.push(20);
    heap.clear();
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
  });
});
