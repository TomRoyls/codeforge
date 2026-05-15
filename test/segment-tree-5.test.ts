import { describe, it, expect } from 'vitest';
import { SegmentTree5 } from '../src/core/segment-tree-5/index.js';

describe('SegmentTree5', () => {
  it('constructor with data', () => {
    const data = [1, 2, 3, 4, 5];
    const st = new SegmentTree5(data);
    expect(st.size()).toBe(5);
  });

  it('range query sum', () => {
    const data = [1, 2, 3, 4, 5];
    const st = new SegmentTree5(data);
    expect(st.query(0, 4)).toBe(15);
    expect(st.query(1, 3)).toBe(9);
    expect(st.query(2, 2)).toBe(3);
  });

  it('point update', () => {
    const data = [1, 2, 3, 4, 5];
    const st = new SegmentTree5(data);
    st.update(2, 10);
    expect(st.query(0, 4)).toBe(22);
    expect(st.query(2, 2)).toBe(10);
    expect(st.query(1, 3)).toBe(16);
  });

  it('get', () => {
    const data = [10, 20, 30, 40, 50];
    const st = new SegmentTree5(data);
    expect(st.get(0)).toBe(10);
    expect(st.get(2)).toBe(30);
    expect(st.get(4)).toBe(50);
  });

  it('range min with custom operation', () => {
    const data = [5, 3, 8, 1, 9];
    const st = new SegmentTree5(data, (a, b) => Math.min(a, b));
    expect(st.query(0, 4)).toBe(1);
    expect(st.query(1, 3)).toBe(1);
    expect(st.query(2, 4)).toBe(1);
  });

  it('range max with custom operation', () => {
    const data = [5, 3, 8, 1, 9];
    const st = new SegmentTree5(data, (a, b) => Math.max(a, b));
    expect(st.query(0, 4)).toBe(9);
    expect(st.query(1, 3)).toBe(8);
    expect(st.query(2, 4)).toBe(9);
  });

  it('single element', () => {
    const data = [42];
    const st = new SegmentTree5(data);
    expect(st.size()).toBe(1);
    expect(st.query(0, 0)).toBe(42);
    st.update(0, 100);
    expect(st.query(0, 0)).toBe(100);
  });

  it('large data', () => {
    const data: number[] = [];
    for (let i = 0; i < 1000; i++) {
      data.push(i + 1);
    }

    const st = new SegmentTree5(data);
    expect(st.size()).toBe(1000);
    expect(st.query(0, 999)).toBe(500500);
    expect(st.query(100, 199)).toBe(15050);
    expect(st.get(500)).toBe(501);

    st.update(500, 1000);
    expect(st.query(499, 501)).toBe(500 + 1000 + 502);
  });

  it('handles two elements', () => {
    const data = [3, 7];
    const st = new SegmentTree5(data);
    expect(st.size()).toBe(2);
    expect(st.query(0, 1)).toBe(10);
    expect(st.query(0, 0)).toBe(3);
    expect(st.query(1, 1)).toBe(7);
    st.update(0, 10);
    expect(st.query(0, 1)).toBe(17);
  });

  it('handles all same values', () => {
    const data = [5, 5, 5, 5, 5];
    const st = new SegmentTree5(data);
    expect(st.query(0, 4)).toBe(25);
    expect(st.query(2, 3)).toBe(10);
    st.update(2, 10);
    expect(st.query(0, 4)).toBe(30);
  });

  it('handles negative numbers', () => {
    const data = [-1, -2, -3, -4, -5];
    const st = new SegmentTree5(data);
    expect(st.query(0, 4)).toBe(-15);
    expect(st.get(2)).toBe(-3);
    st.update(2, 10);
    expect(st.query(0, 4)).toBe(-2);
  });

  it('handles mixed positive and negative', () => {
    const data = [-5, 10, -3, 8, -1];
    const st = new SegmentTree5(data);
    expect(st.query(0, 4)).toBe(9);
    expect(st.query(0, 1)).toBe(5);
    expect(st.query(3, 4)).toBe(7);
  });

  it('supports multiple updates', () => {
    const data = [1, 2, 3, 4, 5];
    const st = new SegmentTree5(data);
    st.update(0, 10);
    st.update(4, 20);
    st.update(2, 30);
    expect(st.query(0, 4)).toBe(10 + 2 + 30 + 4 + 20);
    expect(st.get(0)).toBe(10);
    expect(st.get(2)).toBe(30);
    expect(st.get(4)).toBe(20);
  });

  it('query with custom max operation and updates', () => {
    const data = [3, 1, 4, 1, 5];
    const st = new SegmentTree5(data, (a, b) => Math.max(a, b));
    expect(st.query(0, 4)).toBe(5);
    st.update(1, 10);
    expect(st.query(0, 4)).toBe(10);
    expect(st.query(0, 1)).toBe(10);
  });

  it('query with custom min operation and updates', () => {
    const data = [10, 20, 30, 40, 50];
    const st = new SegmentTree5(data, (a, b) => Math.min(a, b));
    expect(st.query(0, 4)).toBe(10);
    st.update(0, 100);
    expect(st.query(0, 4)).toBe(20);
    st.update(4, 5);
    expect(st.query(0, 4)).toBe(5);
  });

  it('handles power-of-two sized data', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8];
    const st = new SegmentTree5(data);
    expect(st.size()).toBe(8);
    expect(st.query(0, 7)).toBe(36);
    expect(st.query(0, 3)).toBe(10);
    expect(st.query(4, 7)).toBe(26);
  });

  it('handles non-power-of-two sized data', () => {
    const data = [1, 2, 3, 4, 5, 6, 7];
    const st = new SegmentTree5(data);
    expect(st.size()).toBe(7);
    expect(st.query(0, 6)).toBe(28);
    expect(st.query(3, 5)).toBe(15);
  });

  it('should handle max operation', () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6];
    const st = new SegmentTree5(data, (a, b) => Math.max(a, b));
    expect(st.query(0, 7)).toBe(9);
    expect(st.query(2, 4)).toBe(5);
    expect(st.query(6, 7)).toBe(6);
  });

  it('should handle min operation', () => {
    const data = [5, 3, 7, 1, 9, 2];
    const st = new SegmentTree5(data, (a, b) => Math.min(a, b));
    expect(st.query(0, 5)).toBe(1);
    expect(st.query(0, 2)).toBe(3);
    expect(st.query(4, 5)).toBe(2);
  });

  it('should update and re-query with max', () => {
    const data = [1, 5, 3, 8, 2];
    const st = new SegmentTree5(data, (a, b) => Math.max(a, b));
    expect(st.query(0, 4)).toBe(8);
    st.update(3, 0);
    expect(st.query(0, 4)).toBe(5);
  });

  it('should handle get after update', () => {
    const data = [10, 20, 30];
    const st = new SegmentTree5(data);
    st.update(1, 99);
    expect(st.get(1)).toBe(99);
    expect(st.get(0)).toBe(10);
  });

  it('should query single element range', () => {
    const data = [5, 10, 15];
    const st = new SegmentTree5(data);
    expect(st.query(1, 1)).toBe(10);
  });

  it('should handle multiplication operation', () => {
    const data = [2, 3, 4];
    const st = new SegmentTree5(data, (a, b) => a * b);
    expect(st.query(0, 2)).toBe(24);
    expect(st.query(0, 1)).toBe(6);
    expect(st.query(1, 2)).toBe(12);
  });
});
