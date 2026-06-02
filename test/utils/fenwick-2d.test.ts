import { describe, it, expect } from 'vitest';
import { FenwickTree2D } from '../../src/utils/fenwick-2d.js';

describe('FenwickTree2D', () => {
  it('should handle empty tree with zero dimensions', () => {
    const tree = new FenwickTree2D(0, 0);
    expect(tree.rows).toBe(0);
    expect(tree.cols).toBe(0);
  });

  it('should handle single update and query', () => {
    const tree = new FenwickTree2D(5, 5);
    tree.update(2, 3, 10);
    expect(tree.query(2, 3)).toBe(10);
  });

  it('should return 0 for query before any update', () => {
    const tree = new FenwickTree2D(5, 5);
    expect(tree.query(2, 3)).toBe(0);
  });

  it('should accumulate multiple updates at same position', () => {
    const tree = new FenwickTree2D(5, 5);
    tree.update(1, 1, 5);
    tree.update(1, 1, 3);
    tree.update(1, 1, 2);
    expect(tree.query(1, 1)).toBe(10);
  });

  it('should query prefix sum correctly', () => {
    const tree = new FenwickTree2D(5, 5);
    tree.update(0, 0, 1);
    tree.update(0, 1, 2);
    tree.update(1, 0, 3);
    tree.update(1, 1, 4);
    expect(tree.query(1, 1)).toBe(10);
  });

  it('should handle range query for single cell', () => {
    const tree = new FenwickTree2D(5, 5);
    tree.update(2, 2, 7);
    expect(tree.rangeQuery(2, 2, 2, 2)).toBe(7);
  });

  it('should handle range query for rectangle', () => {
    const tree = new FenwickTree2D(5, 5);
    tree.update(1, 1, 1);
    tree.update(1, 2, 2);
    tree.update(2, 1, 3);
    tree.update(2, 2, 4);
    expect(tree.rangeQuery(1, 1, 2, 2)).toBe(10);
  });

  it('should handle edge cells (0, 0)', () => {
    const tree = new FenwickTree2D(5, 5);
    tree.update(0, 0, 100);
    expect(tree.query(0, 0)).toBe(100);
  });

  it('should handle edge cells (last, last)', () => {
    const tree = new FenwickTree2D(5, 5);
    tree.update(4, 4, 100);
    expect(tree.query(4, 4)).toBe(100);
  });

  it('should handle negative deltas', () => {
    const tree = new FenwickTree2D(5, 5);
    tree.update(1, 1, 10);
    tree.update(1, 1, -3);
    expect(tree.get(1, 1)).toBe(7);
  });

  it('should handle point queries with get method', () => {
    const tree = new FenwickTree2D(5, 5);
    tree.update(2, 3, 15);
    tree.update(3, 3, 5);
    expect(tree.get(2, 3)).toBe(15);
    expect(tree.get(3, 3)).toBe(5);
  });

  it('should handle large grid performance', () => {
    const tree = new FenwickTree2D(1000, 1000);
    tree.update(500, 500, 42);
    expect(tree.get(500, 500)).toBe(42);
    tree.update(999, 999, 100);
    expect(tree.get(999, 999)).toBe(100);
  });

  it('should handle range query excluding prefix area', () => {
    const tree = new FenwickTree2D(5, 5);
    tree.update(0, 0, 1);
    tree.update(1, 1, 2);
    tree.update(2, 2, 4);
    tree.update(3, 3, 8);
    expect(tree.rangeQuery(2, 2, 3, 3)).toBe(12);
  });

  it('should throw error for negative dimensions', () => {
    expect(() => new FenwickTree2D(-1, 5)).toThrow('Dimensions must be non-negative');
    expect(() => new FenwickTree2D(5, -1)).toThrow('Dimensions must be non-negative');
  });

  it('should throw error for out of bounds update', () => {
    const tree = new FenwickTree2D(5, 5);
    expect(() => tree.update(5, 2, 1)).toThrow('Index out of bounds');
    expect(() => tree.update(2, 5, 1)).toThrow('Index out of bounds');
    expect(() => tree.update(-1, 2, 1)).toThrow('Index out of bounds');
    expect(() => tree.update(2, -1, 1)).toThrow('Index out of bounds');
  });

  it('should throw error for out of bounds query', () => {
    const tree = new FenwickTree2D(5, 5);
    expect(() => tree.query(5, 2)).toThrow('Index out of bounds');
    expect(() => tree.query(2, 5)).toThrow('Index out of bounds');
    expect(() => tree.query(-1, 2)).toThrow('Index out of bounds');
    expect(() => tree.query(2, -1)).toThrow('Index out of bounds');
  });

  it('should throw error for invalid range query', () => {
    const tree = new FenwickTree2D(5, 5);
    expect(() => tree.rangeQuery(3, 1, 2, 4)).toThrow('Invalid range');
    expect(() => tree.rangeQuery(1, 3, 4, 2)).toThrow('Invalid range');
  });

  it('should throw error for out of bounds range query', () => {
    const tree = new FenwickTree2D(5, 5);
    expect(() => tree.rangeQuery(0, 0, 5, 5)).toThrow('Index out of bounds');
  });

  it('should handle readonly dimensions', () => {
    const tree = new FenwickTree2D(5, 5);
    expect(tree.rows).toBe(5);
    expect(tree.cols).toBe(5);
  });

  it('query on empty tree returns 0', () => {
    const tree = new FenwickTree2D(3, 3);
    expect(tree.query(2, 2)).toBe(0);
  });
});