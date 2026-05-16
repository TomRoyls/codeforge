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

  it('should never underestimate counts', () => {
    const cms = new CountMinSketch3(100, 5);
    cms.update('x', 42);
    expect(cms.estimate('x')).toBeGreaterThanOrEqual(42);
  });

  it('should handle large count values', () => {
    const cms = new CountMinSketch3(1000, 5);
    cms.update('big', 1000000);
    expect(cms.estimate('big')).toBeGreaterThanOrEqual(1000000);
  });

  it('should handle many distinct items', () => {
    const cms = new CountMinSketch3(2000, 7);
    for (let i = 0; i < 100; i++) {
      cms.update(`item_${i}`, i + 1);
    }
    for (let i = 0; i < 100; i++) {
      expect(cms.estimate(`item_${i}`)).toBeGreaterThanOrEqual(i + 1);
    }
  });

  it('should handle reset and re-use', () => {
    const cms = new CountMinSketch3(100, 5);
    cms.update('a', 10);
    cms.reset();
    expect(cms.estimate('a')).toBe(0);

    cms.update('b', 20);
    expect(cms.estimate('b')).toBe(20);
  });

  it('should estimate zero for never-updated items', () => {
    const cms = new CountMinSketch3(100, 5);
    cms.update('exists', 5);
    expect(cms.estimate('nothere')).toBe(0);
  });

  it('should handle empty string keys', () => {
    const cms = new CountMinSketch3();
    cms.update('', 5);
    expect(cms.estimate('')).toBe(5);
  });

  it('should handle merge of empty sketches', () => {
    const cms1 = new CountMinSketch3(100, 5);
    const cms2 = new CountMinSketch3(100, 5);
    cms1.merge(cms2);
    expect(cms1.estimate('anything')).toBe(0);
  });

  it('should handle update with zero count', () => {
    const cms = new CountMinSketch3();
    cms.update('item', 0);
    expect(cms.estimate('item')).toBe(0);
  });

  it('should reset to zero counts', () => {
    const cms = new CountMinSketch3();
    cms.update('a', 10);
    cms.update('b', 20);
    cms.reset();
    expect(cms.estimate('a')).toBe(0);
    expect(cms.estimate('b')).toBe(0);
  });

  it('should handle negative updates as decrements', () => {
    const cms = new CountMinSketch3();
    cms.update('item', 10);
    cms.update('item', -3);
    expect(cms.estimate('item')).toBeGreaterThanOrEqual(7);
  });

  it('should merge sketches with overlapping keys', () => {
    const cms1 = new CountMinSketch3(1000, 5);
    const cms2 = new CountMinSketch3(1000, 5);
    cms1.update('key', 10);
    cms2.update('key', 20);
    cms1.merge(cms2);
    expect(cms1.estimate('key')).toBeGreaterThanOrEqual(30);
  });

  it('should handle many distinct items', () => {
    const cms = new CountMinSketch3(1000, 5);
    for (let i = 0; i < 1000; i++) {
      cms.update(`item-${i}`, 1);
    }
    for (let i = 0; i < 1000; i++) {
      expect(cms.estimate(`item-${i}`)).toBeGreaterThanOrEqual(1);
    }
  });

  it('should never underestimate', () => {
    const cms = new CountMinSketch3();
    cms.update('test', 42);
    expect(cms.estimate('test')).toBeGreaterThanOrEqual(42);
  });

  it('should handle merge then reset', () => {
    const cms1 = new CountMinSketch3(100, 5);
    const cms2 = new CountMinSketch3(100, 5);
    cms1.update('a', 10);
    cms2.update('a', 5);
    cms1.merge(cms2);
    expect(cms1.estimate('a')).toBeGreaterThanOrEqual(15);
    cms1.reset();
    expect(cms1.estimate('a')).toBe(0);
  });

  it('should handle unicode keys', () => {
    const cms = new CountMinSketch3();
    cms.update('日本語', 5);
    cms.update('emoji🎉', 3);
    expect(cms.estimate('日本語')).toBe(5);
    expect(cms.estimate('emoji🎉')).toBe(3);
  });

  it('should handle multiple merges', () => {
    const cms1 = new CountMinSketch3(100, 5);
    const cms2 = new CountMinSketch3(100, 5);
    const cms3 = new CountMinSketch3(100, 5);
    cms1.update('x', 1);
    cms2.update('x', 2);
    cms3.update('x', 3);
    cms1.merge(cms2);
    cms1.merge(cms3);
    expect(cms1.estimate('x')).toBeGreaterThanOrEqual(6);
  });

  it('should estimate 0 for all items after reset', () => {
    const cms = new CountMinSketch3();
    for (let i = 0; i < 10; i++) {
      cms.update(`item-${i}`, i + 1);
    }
    cms.reset();
    for (let i = 0; i < 10; i++) {
      expect(cms.estimate(`item-${i}`)).toBe(0);
    }
  });

  it('should handle very long string keys', () => {
    const longKey = 'a'.repeat(10000);
    const cms = new CountMinSketch3();
    cms.update(longKey, 7);
    expect(cms.estimate(longKey)).toBe(7);
  });

  it('should handle estimate for never-seen key', () => {
    const cms = new CountMinSketch3();
    cms.update('seen', 10);
    expect(cms.estimate('unseen')).toBeGreaterThanOrEqual(0);
    expect(cms.estimate('seen')).toBeGreaterThanOrEqual(10);
  });

  it('should handle multiple updates to same key', () => {
    const cms = new CountMinSketch3();
    cms.update('x', 5);
    cms.update('x', 3);
    expect(cms.estimate('x')).toBeGreaterThanOrEqual(8);
  });

  it('should handle reset to zero', () => {
    const cms = new CountMinSketch3();
    cms.update('a', 10);
    cms.reset();
    expect(cms.estimate('a')).toBe(0);
  });

  it('should merge non-overlapping sketches', () => {
    const a = new CountMinSketch3();
    const b = new CountMinSketch3();
    a.update('x', 5);
    b.update('y', 3);
    a.merge(b);
    expect(a.estimate('x')).toBeGreaterThanOrEqual(5);
    expect(a.estimate('y')).toBeGreaterThanOrEqual(3);
  });

  it('should handle update with default count', () => {
    const cms = new CountMinSketch3();
    cms.update('item');
    expect(cms.estimate('item')).toBeGreaterThanOrEqual(1);
  });

  it('should handle custom dimensions', () => {
    const cms = new CountMinSketch3(500, 3);
    cms.update('test', 5);
    expect(cms.estimate('test')).toBeGreaterThanOrEqual(5);
  });

  it('should handle negative updates', () => {
    const cms = new CountMinSketch3();
    cms.update('item', 10);
    cms.update('item', -3);
    expect(cms.estimate('item')).toBeGreaterThanOrEqual(7);
  });

  it('should handle multiple different keys', () => {
    const cms = new CountMinSketch3();
    cms.update('a', 1);
    cms.update('b', 2);
    cms.update('c', 3);
    expect(cms.estimate('a')).toBeGreaterThanOrEqual(1);
    expect(cms.estimate('b')).toBeGreaterThanOrEqual(2);
    expect(cms.estimate('c')).toBeGreaterThanOrEqual(3);
  });

  it('should handle reset', () => {
    const cms = new CountMinSketch3();
    cms.update('item', 10);
    cms.reset();
    expect(cms.estimate('item')).toBe(0);
  });

  it('should handle multiple items', () => {
    const cms = new CountMinSketch3();
    cms.update('a', 5);
    cms.update('b', 10);
    expect(cms.estimate('a')).toBeGreaterThanOrEqual(5);
    expect(cms.estimate('b')).toBeGreaterThanOrEqual(10);
  });

  it('should handle multiple updates to same key', () => {
    const cms = new CountMinSketch3();
    cms.update('x', 5);
    cms.update('x', 3);
    expect(cms.estimate('x')).toBeGreaterThanOrEqual(8);
  });

  it('should handle different keys independently', () => {
    const cms = new CountMinSketch3();
    cms.update('a', 100);
    cms.update('b', 1);
    expect(cms.estimate('a')).toBeGreaterThanOrEqual(100);
  });

  it('should handle reset', () => {
    const cms = new CountMinSketch3();
    cms.update('x', 50);
    cms.reset();
    expect(cms.estimate('x')).toBe(0);
  });

  it('should handle merge', () => {
    const cms1 = new CountMinSketch3(100, 5);
    cms1.update('a', 10);
    const cms2 = new CountMinSketch3(100, 5);
    cms2.update('a', 5);
    cms1.merge(cms2);
    expect(cms1.estimate('a')).toBeGreaterThanOrEqual(15);
  });
  it('should handle reset clearing estimates', () => {
    const cms = new CountMinSketch3(100, 5);
    cms.update('a', 100);
    cms.reset();
    expect(cms.estimate('a')).toBe(0);
  });
  it('should handle estimate multiple items', () => {
    const cms = new CountMinSketch3(100, 5);
    cms.update('a', 10);
    cms.update('b', 20);
    expect(cms.estimate('a')).toBeGreaterThanOrEqual(10);
    expect(cms.estimate('b')).toBeGreaterThanOrEqual(20);
  });
  it('should handle merge', () => {
    const cms1 = new CountMinSketch3(100, 5);
    cms1.update('a', 10);
    const cms2 = new CountMinSketch3(100, 5);
    cms2.update('a', 5);
    cms1.merge(cms2);
    expect(cms1.estimate('a')).toBeGreaterThanOrEqual(15);
  });
  it('should handle reset', () => {
    const cms = new CountMinSketch3(100, 5);
    cms.update('x', 100);
    cms.reset();
    expect(cms.estimate('x')).toBe(0);
  });
  it('should handle update default count', () => {
    const cms = new CountMinSketch3(100, 5);
    cms.update('a');
    expect(cms.estimate('a')).toBeGreaterThanOrEqual(1);
  });
});
