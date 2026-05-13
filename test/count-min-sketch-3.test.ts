import { describe, it, expect } from 'vitest';
import { CountMinSketch3 } from '../src/core/count-min-sketch-3/index.js';

describe('CountMinSketch3', () => {
  it('should estimate zero for empty sketch', () => {
    const cms = new CountMinSketch3();
    expect(cms.estimate('nonexistent')).toBe(0);
  });

  it('should track single update', () => {
    const cms = new CountMinSketch3();
    cms.update('item1', 5);
    expect(cms.estimate('item1')).toBe(5);
  });

  it('should handle multiple updates to same item', () => {
    const cms = new CountMinSketch3();
    cms.update('item1', 3);
    cms.update('item1', 7);
    expect(cms.estimate('item1')).toBe(10);
  });

  it('should estimate frequency accurately for distinct items', () => {
    const cms = new CountMinSketch3(1000, 5);
    cms.update('apple', 10);
    cms.update('banana', 5);
    cms.update('cherry', 15);

    expect(cms.estimate('apple')).toBe(10);
    expect(cms.estimate('banana')).toBe(5);
    expect(cms.estimate('cherry')).toBe(15);
  });

  it('should merge two sketches', () => {
    const cms1 = new CountMinSketch3(100, 5);
    const cms2 = new CountMinSketch3(100, 5);

    cms1.update('item1', 5);
    cms1.update('item2', 3);

    cms2.update('item1', 10);
    cms2.update('item3', 7);

    cms1.merge(cms2);

    expect(cms1.estimate('item1')).toBe(15);
    expect(cms1.estimate('item2')).toBe(3);
    expect(cms1.estimate('item3')).toBe(7);
  });

  it('should throw error when merging sketches with different dimensions', () => {
    const cms1 = new CountMinSketch3(100, 5);
    const cms2 = new CountMinSketch3(200, 5);

    cms1.update('item1', 5);

    expect(() => cms1.merge(cms2)).toThrow('Sketch dimensions must match for merge');
  });

  it('should reset sketch to zero', () => {
    const cms = new CountMinSketch3();
    cms.update('item1', 10);
    cms.update('item2', 5);

    expect(cms.estimate('item1')).toBe(10);
    expect(cms.estimate('item2')).toBe(5);

    cms.reset();

    expect(cms.estimate('item1')).toBe(0);
    expect(cms.estimate('item2')).toBe(0);
  });

  it('should use default width and depth', () => {
    const cms = new CountMinSketch3();
    cms.update('test', 1);
    expect(cms.estimate('test')).toBe(1);
  });

  it('should handle custom dimensions', () => {
    const cms = new CountMinSketch3(500, 3);
    cms.update('custom', 7);
    expect(cms.estimate('custom')).toBe(7);
  });

  it('should handle default count of 1 in update', () => {
    const cms = new CountMinSketch3();
    cms.update('item');
    cms.update('item');
    cms.update('item');
    expect(cms.estimate('item')).toBe(3);
  });
});
