import { describe, it, expect } from 'vitest';
import { XorFilter2 } from '../../src/core/xor-filter-2/index.js';

// ─── buildSync / build ───

describe('XorFilter2 – Construction', () => {
  it('builds from an empty array', () => {
    const filter = XorFilter2.buildSync([]);
    expect(filter.size()).toBe(0);
  });

  it('builds from a single-item array', () => {
    const filter = XorFilter2.buildSync(['alpha']);
    expect(filter.size()).toBeGreaterThan(0);
  });

  it('builds from multiple items', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const filter = XorFilter2.buildSync(items);
    expect(filter.size()).toBeGreaterThan(0);
  });

  it('builds asynchronously via build()', async () => {
    const filter = await XorFilter2.build(['x', 'y']);
    expect(filter.size()).toBeGreaterThan(0);
  });

  it('handles duplicate items without throwing', () => {
    expect(() => XorFilter2.buildSync(['dup', 'dup', 'dup'])).not.toThrow();
  });

  it('handles a large set of items', () => {
    const items = Array.from({ length: 500 }, (_, i) => `item-${i}`);
    const filter = XorFilter2.buildSync(items);
    expect(filter.size()).toBeGreaterThan(0);
  });

  it('allocates space proportional to item count', () => {
    const small = XorFilter2.buildSync(['a']);
    const large = XorFilter2.buildSync(Array.from({ length: 100 }, (_, i) => `item-${i}`));
    expect(large.size()).toBeGreaterThan(small.size());
  });
});

// ─── has (membership) ───

describe('XorFilter2 – has', () => {
  it('returns a boolean for items in non-empty filter', () => {
    const items = ['apple', 'banana', 'cherry'];
    const filter = XorFilter2.buildSync(items);
    for (const item of items) {
      expect(typeof filter.has(item)).toBe('boolean');
    }
  });

  it('returns false for clearly absent items', () => {
    const items = ['one', 'two', 'three'];
    const filter = XorFilter2.buildSync(items);
    expect(filter.has('zero')).toBe(false);
    expect(filter.has('four')).toBe(false);
  });

  it('returns false for empty filter', () => {
    const filter = XorFilter2.buildSync([]);
    expect(filter.has('anything')).toBe(false);
  });

  it('handles empty string item without throwing', () => {
    const filter = XorFilter2.buildSync(['']);
    expect(typeof filter.has('')).toBe('boolean');
  });

  it('handles numeric string items without throwing', () => {
    const filter = XorFilter2.buildSync(['1', '2', '3']);
    expect(typeof filter.has('1')).toBe('boolean');
    expect(typeof filter.has('2')).toBe('boolean');
  });

  it('handles unicode items without throwing', () => {
    const filter = XorFilter2.buildSync(['日本語', '中文', '한국어']);
    expect(typeof filter.has('日本語')).toBe('boolean');
  });
});

// ─── False positive rate ───

describe('XorFilter2 – False positive rate', () => {
  it('maintains low false positive rate for moderate input', () => {
    const items = Array.from({ length: 100 }, (_, i) => `member-${i}`);
    const filter = XorFilter2.buildSync(items);
    let falsePositives = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      if (filter.has(`nonmember-${i}`)) {
        falsePositives++;
      }
    }
    expect(falsePositives / trials).toBeLessThan(0.05);
  });
});

// ─── size ───

describe('XorFilter2 – size', () => {
  it('returns 0 for empty filter', () => {
    const filter = XorFilter2.buildSync([]);
    expect(filter.size()).toBe(0);
  });

  it('returns a positive number for non-empty filter', () => {
    const filter = XorFilter2.buildSync(['a', 'b']);
    expect(filter.size()).toBeGreaterThan(0);
  });

  it('returns a size that is a multiple of 3 (3 blocks)', () => {
    const filter = XorFilter2.buildSync(['x', 'y', 'z']);
    expect(filter.size() % 3).toBe(0);
  });

  it('size scales with input count', () => {
    const f10 = XorFilter2.buildSync(Array.from({ length: 10 }, (_, i) => `v${i}`));
    const f50 = XorFilter2.buildSync(Array.from({ length: 50 }, (_, i) => `v${i}`));
    expect(f50.size()).toBeGreaterThan(f10.size());
  });
});
