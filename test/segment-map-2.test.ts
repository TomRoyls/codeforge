import { describe, it, expect } from 'vitest';
import { SegmentMap2 } from '../src/core/segment-map-2/index.js';

describe('SegmentMap2', () => {
  it('basic set/get', () => {
    const map = new SegmentMap2<string>();
    map.set(0, 10, 'A');
    expect(map.get(5)).toBe('A');
    expect(map.get(0)).toBe('A');
    expect(map.get(9)).toBe('A');
    expect(map.get(10)).toBeUndefined();
    expect(map.get(-1)).toBeUndefined();
  });

  it('overlapping ranges', () => {
    const map = new SegmentMap2<string>();
    map.set(0, 10, 'A');
    map.set(5, 15, 'B');
    expect(map.get(4)).toBe('A');
    expect(map.get(5)).toBe('B');
    expect(map.get(14)).toBe('B');
    expect(map.get(15)).toBeUndefined();
  });

  it('range deletion', () => {
    const map = new SegmentMap2<string>();
    map.set(0, 10, 'A');
    map.set(10, 20, 'B');
    map.delete(5, 15);
    expect(map.get(4)).toBe('A');
    expect(map.get(5)).toBeUndefined();
    expect(map.get(14)).toBeUndefined();
    expect(map.get(15)).toBe('B');
  });

  it('point query', () => {
    const map = new SegmentMap2<number>();
    map.set(0, 5, 1);
    map.set(5, 10, 2);
    map.set(10, 15, 3);
    expect(map.get(2)).toBe(1);
    expect(map.get(7)).toBe(2);
    expect(map.get(12)).toBe(3);
    expect(map.get(15)).toBeUndefined();
  });

  it('range query', () => {
    const map = new SegmentMap2<string>();
    map.set(0, 5, 'A');
    map.set(5, 10, 'B');
    map.set(10, 15, 'C');
    const result = map.getRange(2, 12);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ start: 0, end: 5, value: 'A' });
    expect(result[1]).toEqual({ start: 5, end: 10, value: 'B' });
    expect(result[2]).toEqual({ start: 10, end: 15, value: 'C' });
  });

  it('size tracking', () => {
    const map = new SegmentMap2<string>();
    expect(map.size).toBe(0);
    map.set(0, 10, 'A');
    expect(map.size).toBe(1);
    map.set(10, 20, 'B');
    expect(map.size).toBe(2);
    map.set(5, 15, 'C');
    expect(map.size).toBe(3);
    map.delete(0, 20);
    expect(map.size).toBe(0);
  });

  it('clear', () => {
    const map = new SegmentMap2<string>();
    map.set(0, 10, 'A');
    map.set(10, 20, 'B');
    map.set(20, 30, 'C');
    expect(map.size).toBe(3);
    map.clear();
    expect(map.size).toBe(0);
    expect(map.get(5)).toBeUndefined();
    expect(map.get(15)).toBeUndefined();
    expect(map.get(25)).toBeUndefined();
  });

  it('overlapping set replaces value', () => {
    const map = new SegmentMap2<string>();
    map.set(0, 10, 'A');
    map.set(0, 10, 'B');
    expect(map.get(5)).toBe('B');
  });

  it('partial overlap set', () => {
    const map = new SegmentMap2<string>();
    map.set(0, 10, 'A');
    map.set(5, 15, 'B');
    expect(map.get(4)).toBe('A');
    expect(map.get(5)).toBe('B');
    expect(map.get(12)).toBe('B');
  });

  it('delete partial range', () => {
    const map = new SegmentMap2<string>();
    map.set(0, 20, 'A');
    map.delete(5, 10);
    expect(map.get(3)).toBe('A');
    expect(map.get(7)).toBeUndefined();
    expect(map.get(15)).toBe('A');
  });

  it('getRange returns all overlapping segments', () => {
    const map = new SegmentMap2<string>();
    map.set(0, 5, 'A');
    map.set(3, 8, 'B');
    map.set(10, 15, 'C');
    const range = map.getRange(2, 7);
    expect(range.length).toBeGreaterThanOrEqual(2);
  });

  it('handles adjacent segments', () => {
    const map = new SegmentMap2<string>();
    map.set(0, 5, 'A');
    map.set(5, 10, 'B');
    expect(map.get(4)).toBe('A');
    expect(map.get(5)).toBe('B');
  });

  it('handles set with invalid range (start >= end)', () => {
    const map = new SegmentMap2<string>();
    map.set(5, 5, 'A');
    expect(map.size).toBe(0);
    map.set(10, 5, 'B');
    expect(map.size).toBe(0);
  });

  it('handles multiple non-overlapping segments', () => {
    const map = new SegmentMap2<string>();
    map.set(0, 5, 'A');
    map.set(10, 15, 'B');
    map.set(20, 25, 'C');
    expect(map.size).toBe(3);
    expect(map.get(2)).toBe('A');
    expect(map.get(12)).toBe('B');
    expect(map.get(22)).toBe('C');
    expect(map.get(7)).toBeUndefined();
  });

  it('handles delete all segments', () => {
    const map = new SegmentMap2<string>();
    map.set(0, 10, 'A');
    map.set(10, 20, 'B');
    map.delete(0, 20);
    expect(map.size).toBe(0);
    expect(map.get(5)).toBeUndefined();
    expect(map.get(15)).toBeUndefined();
  });

  it('handles getRange on empty map', () => {
    const map = new SegmentMap2<string>();
    const result = map.getRange(0, 100);
    expect(result).toEqual([]);
  });
});
