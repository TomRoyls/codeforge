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
});
