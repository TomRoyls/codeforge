import { describe, it, expect } from 'vitest';
import { ProbabilisticSet2 } from '../src/core/probabilistic-set-2';

describe('ProbabilisticSet2', () => {
  it('should add and check elements correctly', async () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    set.add('hello');
    set.add('world');
    expect(set.has('hello')).toBe(true);
    expect(set.has('world')).toBe(true);
  });

  it('should return false for elements not in set', async () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    set.add('hello');
    expect(set.has('goodbye')).toBe(false);
  });

  it('should track size correctly', async () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    expect(set.size).toBe(0);
    set.add('a');
    expect(set.size).toBe(1);
    set.add('b');
    expect(set.size).toBe(2);
    set.add('a');
    expect(set.size).toBe(3);
  });

  it('should check if set is empty', async () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    expect(set.isEmpty()).toBe(true);
    set.add('a');
    expect(set.isEmpty()).toBe(false);
  });

  it('should clear all elements', async () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    set.add('a');
    set.add('b');
    set.add('c');
    expect(set.size).toBe(3);
    expect(set.isEmpty()).toBe(false);
    set.clear();
    expect(set.size).toBe(0);
    expect(set.isEmpty()).toBe(true);
    expect(set.has('a')).toBe(false);
    expect(set.has('b')).toBe(false);
    expect(set.has('c')).toBe(false);
  });

  it('should return correct false positive rate', async () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    expect(set.falsePositiveRate()).toBe(0.01);
  });

  it('should return bit count', async () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    const bitCount = set.bitCount();
    expect(bitCount).toBeGreaterThan(0);
    expect(typeof bitCount).toBe('number');
  });

  it('should handle numbers', async () => {
    const set = new ProbabilisticSet2<number>(100, 0.01);
    set.add(1);
    set.add(2);
    set.add(3);
    expect(set.has(1)).toBe(true);
    expect(set.has(2)).toBe(true);
    expect(set.has(3)).toBe(true);
    expect(set.has(4)).toBe(false);
  });

  it('should have no false negatives', async () => {
    const set = new ProbabilisticSet2<string>(1000, 0.01);
    const elements = ['a', 'b', 'c', 'd', 'e'];
    for (const el of elements) {
      set.add(el);
    }
    for (const el of elements) {
      expect(set.has(el)).toBe(true);
    }
  });

  it('should handle empty string', async () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    set.add('');
    expect(set.has('')).toBe(true);
    expect(set.size).toBe(1);
  });

  it('should handle special characters', async () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    set.add('!@#$%^&*()');
    set.add('😀');
    set.add('\n\t');
    expect(set.has('!@#$%^&*()')).toBe(true);
    expect(set.has('😀')).toBe(true);
    expect(set.has('\n\t')).toBe(true);
  });

  it('should use default parameters', async () => {
    const set = new ProbabilisticSet2();
    expect(set.falsePositiveRate()).toBe(0.01);
    expect(set.isEmpty()).toBe(true);
    expect(set.size).toBe(0);
  });

  it('should have acceptable false positive rate', async () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    const trainingSize = 50;
    const testSize = 1000;

    for (let i = 0; i < trainingSize; i++) {
      set.add(`train-${i}`);
    }

    let falsePositives = 0;
    for (let i = 0; i < testSize; i++) {
      const testValue = `test-${i}`;
      if (set.has(testValue)) {
        falsePositives++;
      }
    }

    const observedRate = falsePositives / testSize;
    expect(observedRate).toBeLessThan(0.05);
  });

  it('should handle large expected size', async () => {
    const set = new ProbabilisticSet2<string>(10000, 0.01);
    set.add('large');
    expect(set.has('large')).toBe(true);
    expect(set.bitCount()).toBeGreaterThan(0);
  });

  it('should handle very low false positive rate', async () => {
    const set = new ProbabilisticSet2<string>(100, 0.001);
    expect(set.falsePositiveRate()).toBe(0.001);
    set.add('test');
    expect(set.has('test')).toBe(true);
  });

  it('should handle mixed types', async () => {
    const set = new ProbabilisticSet2<string | number>(100, 0.01);
    set.add('string');
    set.add(42);
    set.add('123');
    expect(set.has('string')).toBe(true);
    expect(set.has(42)).toBe(true);
    expect(set.has('123')).toBe(true);
  });

  it('should handle duplicate adds incrementing size', () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    set.add('a');
    set.add('a');
    set.add('a');
    expect(set.size).toBe(3);
    expect(set.has('a')).toBe(true);
  });

  it('should handle clear and re-add', () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    set.add('x');
    set.add('y');
    set.clear();
    expect(set.has('x')).toBe(false);
    set.add('z');
    expect(set.has('z')).toBe(true);
    expect(set.size).toBe(1);
  });

  it('should work with many unique elements', () => {
    const set = new ProbabilisticSet2<number>(1000, 0.01);
    for (let i = 0; i < 100; i++) {
      set.add(i);
    }
    expect(set.size).toBe(100);
    for (let i = 0; i < 100; i++) {
      expect(set.has(i)).toBe(true);
    }
  });

  it('should handle boolean-like values', () => {
    const set = new ProbabilisticSet2<number>(100, 0.01);
    set.add(0);
    set.add(1);
    expect(set.has(0)).toBe(true);
    expect(set.has(1)).toBe(true);
    expect(set.has(2)).toBe(false);
  });

  it('should report isEmpty correctly', () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    expect(set.isEmpty()).toBe(true);
    set.add('test');
    expect(set.isEmpty()).toBe(false);
  });

  it('should clear all elements', () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    set.add('a');
    set.add('b');
    set.clear();
    expect(set.isEmpty()).toBe(true);
    expect(set.size).toBe(0);
    expect(set.has('a')).toBe(false);
  });

  it('should report falsePositiveRate', () => {
    const set = new ProbabilisticSet2<string>(1000, 0.05);
    expect(set.falsePositiveRate()).toBe(0.05);
  });

  it('should report bitCount greater than 0', () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    expect(set.bitCount()).toBeGreaterThan(0);
  });

  it('should handle unicode strings', () => {
    const set = new ProbabilisticSet2<string>(100, 0.01);
    set.add('日本語');
    set.add('🎉');
    expect(set.has('日本語')).toBe(true);
    expect(set.has('🎉')).toBe(true);
  });
});
