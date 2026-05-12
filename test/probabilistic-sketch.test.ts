import { describe, it, expect } from 'vitest';
import { ProbabilisticSketch } from './src/core/probabilistic-sketch/index.js';

describe('ProbabilisticSketch', () => {
  describe('constructor', () => {
    it('creates with default parameters', () => {
      const sketch = new ProbabilisticSketch();
      expect(sketch.itemCount).toBe(0);
      expect(sketch.getErrorRate()).toBe(0.002);
      expect(sketch.getConfidence()).toBeGreaterThan(0.9);
    });

    it('creates with custom width', () => {
      const sketch = new ProbabilisticSketch(100);
      expect(sketch.getErrorRate()).toBe(0.02);
    });

    it('creates with custom depth', () => {
      const sketch = new ProbabilisticSketch(100, 3);
      expect(sketch.getConfidence()).toBeGreaterThan(0.9);
    });

    it('creates with both custom width and depth', () => {
      const sketch = new ProbabilisticSketch(200, 4);
      expect(sketch.getErrorRate()).toBe(0.01);
      expect(sketch.getConfidence()).toBeGreaterThan(0.9);
    });

    it('initializes with zero items', () => {
      const sketch = new ProbabilisticSketch();
      expect(sketch.itemCount).toBe(0);
    });
  });

  describe('add and estimate', () => {
    it('adds and estimates a single item', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('apple');
      const estimate = sketch.estimate('apple');
      expect(estimate).toBe(1);
    });

    it('adds and estimates multiple same items', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('apple');
      sketch.add('apple');
      sketch.add('apple');
      const estimate = sketch.estimate('apple');
      expect(estimate).toBe(3);
    });

    it('estimates non-existent item as zero', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('apple');
      const estimate = sketch.estimate('banana');
      expect(estimate).toBe(0);
    });

    it('estimates empty sketch as zero', () => {
      const sketch = new ProbabilisticSketch();
      const estimate = sketch.estimate('anything');
      expect(estimate).toBe(0);
    });

    it('estimates different items independently', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('apple', 5);
      sketch.add('banana', 3);
      sketch.add('cherry', 7);
      expect(sketch.estimate('apple')).toBe(5);
      expect(sketch.estimate('banana')).toBe(3);
      expect(sketch.estimate('cherry')).toBe(7);
    });

    it('handles numeric items', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add(42);
      sketch.add(100);
      expect(sketch.estimate(42)).toBe(1);
      expect(sketch.estimate(100)).toBe(1);
      expect(sketch.estimate(0)).toBe(0);
    });

    it('handles mixed string and number items', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('test', 2);
      sketch.add(123, 3);
      expect(sketch.estimate('test')).toBe(2);
      expect(sketch.estimate(123)).toBe(3);
    });

    it('adds with count parameter', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('item', 10);
      expect(sketch.estimate('item')).toBe(10);
    });

    it('adds with multiple calls with different counts', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('item', 5);
      sketch.add('item', 3);
      sketch.add('item', 2);
      expect(sketch.estimate('item')).toBe(10);
    });

    it('adds with zero count', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('item', 0);
      expect(sketch.estimate('item')).toBe(0);
    });

    it('handles empty string', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('');
      expect(sketch.estimate('')).toBe(1);
    });

    it('handles numeric string vs number', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('42', 5);
      sketch.add(42, 3);
      expect(sketch.estimate('42')).toBe(5);
      expect(sketch.estimate(42)).toBe(3);
    });
  });

  describe('estimate accuracy', () => {
    it('estimates within error bounds for low frequency', () => {
      const sketch = new ProbabilisticSketch(100, 10);
      sketch.add('item', 5);
      const estimate = sketch.estimate('item');
      expect(estimate).toBeGreaterThanOrEqual(5);
      expect(estimate).toBeLessThanOrEqual(5 * (1 + sketch.getErrorRate()) + 10);
    });

    it('estimates within error bounds for high frequency', () => {
      const sketch = new ProbabilisticSketch(100, 10);
      sketch.add('item', 100);
      const estimate = sketch.estimate('item');
      expect(estimate).toBeGreaterThanOrEqual(100);
    });

    it('estimates are never less than true count', () => {
      const sketch = new ProbabilisticSketch(100, 10);
      sketch.add('item', 50);
      const estimate = sketch.estimate('item');
      expect(estimate).toBeGreaterThanOrEqual(50);
    });

    it('maintains accuracy with many distinct items', () => {
      const sketch = new ProbabilisticSketch(1000, 5);
      for (let i = 0; i < 100; i++) {
        sketch.add(`item${i}`, i + 1);
      }
      for (let i = 0; i < 100; i++) {
        const estimate = sketch.estimate(`item${i}`);
        expect(estimate).toBeGreaterThanOrEqual(i + 1);
      }
    });

    it('handles repeated adds of different items', () => {
      const sketch = new ProbabilisticSketch(100, 10);
      for (let i = 0; i < 1000; i++) {
        sketch.add('a');
        sketch.add('b');
        sketch.add('c');
      }
      expect(sketch.estimate('a')).toBeGreaterThanOrEqual(1000);
      expect(sketch.estimate('b')).toBeGreaterThanOrEqual(1000);
      expect(sketch.estimate('c')).toBeGreaterThanOrEqual(1000);
    });

    it('confidence increases with depth', () => {
      const shallowSketch = new ProbabilisticSketch(100, 2);
      const deepSketch = new ProbabilisticSketch(100, 10);
      expect(deepSketch.getConfidence()).toBeGreaterThan(shallowSketch.getConfidence());
    });

    it('error rate decreases with width', () => {
      const narrowSketch = new ProbabilisticSketch(10, 5);
      const wideSketch = new ProbabilisticSketch(1000, 5);
      expect(wideSketch.getErrorRate()).toBeLessThan(narrowSketch.getErrorRate());
    });
  });

  describe('merge', () => {
    it('merges two empty sketches', () => {
      const sketch1 = new ProbabilisticSketch();
      const sketch2 = new ProbabilisticSketch();
      sketch1.merge(sketch2);
      expect(sketch1.itemCount).toBe(0);
      expect(sketch2.itemCount).toBe(0);
    });

    it('merges empty sketch into non-empty', () => {
      const sketch1 = new ProbabilisticSketch();
      const sketch2 = new ProbabilisticSketch();
      sketch1.add('item', 5);
      sketch1.merge(sketch2);
      expect(sketch1.estimate('item')).toBe(5);
      expect(sketch1.itemCount).toBe(5);
    });

    it('merges non-empty sketch into empty', () => {
      const sketch1 = new ProbabilisticSketch();
      const sketch2 = new ProbabilisticSketch();
      sketch2.add('item', 5);
      sketch1.merge(sketch2);
      expect(sketch1.estimate('item')).toBe(5);
      expect(sketch1.itemCount).toBe(5);
    });

    it('merges two sketches with same items', () => {
      const sketch1 = new ProbabilisticSketch();
      const sketch2 = new ProbabilisticSketch();
      sketch1.add('item', 5);
      sketch2.add('item', 3);
      sketch1.merge(sketch2);
      expect(sketch1.estimate('item')).toBe(8);
      expect(sketch1.itemCount).toBe(8);
    });

    it('merges two sketches with different items', () => {
      const sketch1 = new ProbabilisticSketch();
      const sketch2 = new ProbabilisticSketch();
      sketch1.add('apple', 5);
      sketch2.add('banana', 3);
      sketch1.merge(sketch2);
      expect(sketch1.estimate('apple')).toBe(5);
      expect(sketch1.estimate('banana')).toBe(3);
      expect(sketch1.itemCount).toBe(8);
    });

    it('merges multiple sketches sequentially', () => {
      const sketch1 = new ProbabilisticSketch();
      const sketch2 = new ProbabilisticSketch();
      const sketch3 = new ProbabilisticSketch();
      sketch1.add('a', 5);
      sketch2.add('b', 3);
      sketch3.add('c', 2);
      sketch1.merge(sketch2);
      sketch1.merge(sketch3);
      expect(sketch1.itemCount).toBe(10);
      expect(sketch1.estimate('a')).toBe(5);
      expect(sketch1.estimate('b')).toBe(3);
      expect(sketch1.estimate('c')).toBe(2);
    });

    it('throws error when merging different widths', () => {
      const sketch1 = new ProbabilisticSketch(100, 5);
      const sketch2 = new ProbabilisticSketch(200, 5);
      expect(() => sketch1.merge(sketch2)).toThrow('Cannot merge sketches with different dimensions');
    });

    it('throws error when merging different depths', () => {
      const sketch1 = new ProbabilisticSketch(100, 5);
      const sketch2 = new ProbabilisticSketch(100, 10);
      expect(() => sketch1.merge(sketch2)).toThrow('Cannot merge sketches with different dimensions');
    });

    it('original sketch unchanged after merge', () => {
      const sketch1 = new ProbabilisticSketch();
      const sketch2 = new ProbabilisticSketch();
      sketch2.add('item', 5);
      sketch1.merge(sketch2);
      expect(sketch2.estimate('item')).toBe(5);
      expect(sketch2.itemCount).toBe(5);
    });
  });

  describe('reset', () => {
    it('resets empty sketch', () => {
      const sketch = new ProbabilisticSketch();
      sketch.reset();
      expect(sketch.itemCount).toBe(0);
      expect(sketch.estimate('anything')).toBe(0);
    });

    it('resets sketch with items', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('apple', 5);
      sketch.add('banana', 3);
      sketch.reset();
      expect(sketch.itemCount).toBe(0);
      expect(sketch.estimate('apple')).toBe(0);
      expect(sketch.estimate('banana')).toBe(0);
    });

    it('resets sketch after many adds', () => {
      const sketch = new ProbabilisticSketch();
      for (let i = 0; i < 1000; i++) {
        sketch.add(`item${i}`);
      }
      sketch.reset();
      expect(sketch.itemCount).toBe(0);
      for (let i = 0; i < 100; i++) {
        expect(sketch.estimate(`item${i}`)).toBe(0);
      }
    });

    it('allows reuse after reset', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('item', 5);
      sketch.reset();
      sketch.add('item', 10);
      expect(sketch.estimate('item')).toBe(10);
      expect(sketch.itemCount).toBe(10);
    });

    it('reset does not affect sketch parameters', () => {
      const sketch = new ProbabilisticSketch(200, 7);
      sketch.add('item', 5);
      const errorRateBefore = sketch.getErrorRate();
      const confidenceBefore = sketch.getConfidence();
      sketch.reset();
      const errorRateAfter = sketch.getErrorRate();
      const confidenceAfter = sketch.getConfidence();
      expect(errorRateBefore).toBe(errorRateAfter);
      expect(confidenceBefore).toBe(confidenceAfter);
    });
  });

  describe('itemCount', () => {
    it('starts at zero', () => {
      const sketch = new ProbabilisticSketch();
      expect(sketch.itemCount).toBe(0);
    });

    it('increments with single adds', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('item');
      expect(sketch.itemCount).toBe(1);
    });

    it('increments with multiple adds of same item', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('item');
      sketch.add('item');
      sketch.add('item');
      expect(sketch.itemCount).toBe(3);
    });

    it('increments with different items', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('a');
      sketch.add('b');
      sketch.add('c');
      expect(sketch.itemCount).toBe(3);
    });

    it('increments with count parameter', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('item', 10);
      expect(sketch.itemCount).toBe(10);
    });

    it('increments correctly with mixed counts', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('a', 5);
      sketch.add('b', 3);
      sketch.add('c', 2);
      expect(sketch.itemCount).toBe(10);
    });

    it('resets to zero after reset', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('item', 100);
      sketch.reset();
      expect(sketch.itemCount).toBe(0);
    });
  });

  describe('getErrorRate', () => {
    it('calculates correct error rate for width 100', () => {
      const sketch = new ProbabilisticSketch(100, 5);
      expect(sketch.getErrorRate()).toBe(0.02);
    });

    it('calculates correct error rate for width 1000', () => {
      const sketch = new ProbabilisticSketch(1000, 5);
      expect(sketch.getErrorRate()).toBe(0.002);
    });

    it('calculates correct error rate for width 10', () => {
      const sketch = new ProbabilisticSketch(10, 5);
      expect(sketch.getErrorRate()).toBe(0.2);
    });

    it('error rate decreases as width increases', () => {
      const sketch100 = new ProbabilisticSketch(100, 5);
      const sketch200 = new ProbabilisticSketch(200, 5);
      expect(sketch200.getErrorRate()).toBeLessThan(sketch100.getErrorRate());
    });
  });

  describe('getConfidence', () => {
    it('calculates confidence for depth 5', () => {
      const sketch = new ProbabilisticSketch(100, 5);
      const confidence = sketch.getConfidence();
      expect(confidence).toBeGreaterThan(0.9);
      expect(confidence).toBeLessThan(1);
    });

    it('calculates confidence for depth 10', () => {
      const sketch = new ProbabilisticSketch(100, 10);
      const confidence = sketch.getConfidence();
      expect(confidence).toBeGreaterThan(0.99);
      expect(confidence).toBeLessThan(1);
    });

    it('confidence increases with depth', () => {
      const shallow = new ProbabilisticSketch(100, 2);
      const deep = new ProbabilisticSketch(100, 10);
      expect(deep.getConfidence()).toBeGreaterThan(shallow.getConfidence());
    });
  });

  describe('repeated adds', () => {
    it('handles large number of repeated adds', () => {
      const sketch = new ProbabilisticSketch(100, 10);
      for (let i = 0; i < 10000; i++) {
        sketch.add('item');
      }
      const estimate = sketch.estimate('item');
      expect(estimate).toBeGreaterThanOrEqual(10000);
    });

    it('handles alternating repeated adds', () => {
      const sketch = new ProbabilisticSketch(100, 10);
      for (let i = 0; i < 1000; i++) {
        sketch.add('a');
        sketch.add('b');
      }
      expect(sketch.estimate('a')).toBeGreaterThanOrEqual(1000);
      expect(sketch.estimate('b')).toBeGreaterThanOrEqual(1000);
    });

    it('handles different types in repeated adds', () => {
      const sketch = new ProbabilisticSketch(100, 10);
      for (let i = 0; i < 100; i++) {
        sketch.add(i);
      }
      for (let i = 0; i < 100; i++) {
        expect(sketch.estimate(i)).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('different item types', () => {
    it('handles string items', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('hello');
      sketch.add('world');
      expect(sketch.estimate('hello')).toBe(1);
      expect(sketch.estimate('world')).toBe(1);
    });

    it('handles number items', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add(42);
      sketch.add(100);
      expect(sketch.estimate(42)).toBe(1);
      expect(sketch.estimate(100)).toBe(1);
    });

    it('handles negative numbers', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add(-1);
      sketch.add(-100);
      expect(sketch.estimate(-1)).toBe(1);
      expect(sketch.estimate(-100)).toBe(1);
    });

    it('handles zero', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add(0);
      expect(sketch.estimate(0)).toBe(1);
    });

    it('handles large numbers', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add(999999999);
      sketch.add(123456789);
      expect(sketch.estimate(999999999)).toBe(1);
      expect(sketch.estimate(123456789)).toBe(1);
    });

    it('handles numeric strings', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('123');
      expect(sketch.estimate('123')).toBe(1);
    });

    it('handles special characters', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('@#$%');
      sketch.add('!@#');
      expect(sketch.estimate('@#$%')).toBe(1);
      expect(sketch.estimate('!@#')).toBe(1);
    });

    it('handles unicode characters', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('こんにちは');
      sketch.add('你好');
      expect(sketch.estimate('こんにちは')).toBe(1);
      expect(sketch.estimate('你好')).toBe(1);
    });

    it('treats string and number versions differently', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('42', 5);
      sketch.add(42, 3);
      expect(sketch.estimate('42')).toBe(5);
      expect(sketch.estimate(42)).toBe(3);
    });
  });

  describe('empty sketch', () => {
    it('estimates zero for any item in empty sketch', () => {
      const sketch = new ProbabilisticSketch();
      expect(sketch.estimate('anything')).toBe(0);
      expect(sketch.estimate(123)).toBe(0);
      expect(sketch.estimate('')).toBe(0);
    });

    it('empty sketch has zero item count', () => {
      const sketch = new ProbabilisticSketch();
      expect(sketch.itemCount).toBe(0);
    });

    it('empty sketch can still be used after creation', () => {
      const sketch = new ProbabilisticSketch();
      sketch.add('new item');
      expect(sketch.estimate('new item')).toBe(1);
    });
  });
});
