import { describe, it, expect } from 'vitest';
import { RankSelectBitvector2 } from '../src/core/rank-select-bitvector-2/index';

describe('RankSelectBitvector2', () => {
  it('creates empty bitvector from size', async () => {
    const bv = new RankSelectBitvector2(100);
    expect(bv.length).toBe(100);
    expect(bv.countOnes()).toBe(0);
    expect(bv.countZeros()).toBe(100);
    expect(bv.isEmpty()).toBe(true);
  });

  it('creates bitvector from boolean array', async () => {
    const bv = new RankSelectBitvector2([true, false, true, false, true]);
    expect(bv.length).toBe(5);
    expect(bv.countOnes()).toBe(3);
    expect(bv.countZeros()).toBe(2);
  });

  it('sets bits correctly', async () => {
    const bv = new RankSelectBitvector2(10);
    bv.set(0);
    bv.set(5);
    bv.set(9);
    expect(bv.get(0)).toBe(true);
    expect(bv.get(1)).toBe(false);
    expect(bv.get(5)).toBe(true);
    expect(bv.get(9)).toBe(true);
    expect(bv.countOnes()).toBe(3);
  });

  it('unsets bits correctly', async () => {
    const bv = new RankSelectBitvector2([true, true, true, true, true]);
    bv.unset(0);
    bv.unset(2);
    bv.unset(4);
    expect(bv.get(0)).toBe(false);
    expect(bv.get(1)).toBe(true);
    expect(bv.get(2)).toBe(false);
    expect(bv.get(3)).toBe(true);
    expect(bv.get(4)).toBe(false);
    expect(bv.countOnes()).toBe(2);
  });

  it('flips bits correctly', async () => {
    const bv = new RankSelectBitvector2([true, false, true, false, true]);
    bv.flip(0);
    bv.flip(1);
    bv.flip(2);
    expect(bv.get(0)).toBe(false);
    expect(bv.get(1)).toBe(true);
    expect(bv.get(2)).toBe(false);
    expect(bv.get(3)).toBe(false);
    expect(bv.get(4)).toBe(true);
  });

  it('returns correct bit values', async () => {
    const bv = new RankSelectBitvector2([true, false, true, false, true]);
    expect(bv.get(0)).toBe(true);
    expect(bv.get(1)).toBe(false);
    expect(bv.get(2)).toBe(true);
    expect(bv.get(3)).toBe(false);
    expect(bv.get(4)).toBe(true);
  });

  it('computes rank1 correctly', async () => {
    const bv = new RankSelectBitvector2([true, false, true, false, true, true, false]);
    expect(bv.rank1(0)).toBe(0);
    expect(bv.rank1(1)).toBe(1);
    expect(bv.rank1(2)).toBe(1);
    expect(bv.rank1(3)).toBe(2);
    expect(bv.rank1(4)).toBe(2);
    expect(bv.rank1(5)).toBe(3);
    expect(bv.rank1(6)).toBe(4);
    expect(bv.rank1(7)).toBe(4);
  });

  it('computes rank0 correctly', async () => {
    const bv = new RankSelectBitvector2([true, false, true, false, true, true, false]);
    expect(bv.rank0(0)).toBe(0);
    expect(bv.rank0(1)).toBe(0);
    expect(bv.rank0(2)).toBe(1);
    expect(bv.rank0(3)).toBe(1);
    expect(bv.rank0(4)).toBe(2);
    expect(bv.rank0(5)).toBe(2);
    expect(bv.rank0(6)).toBe(2);
    expect(bv.rank0(7)).toBe(3);
  });

  it('computes select1 correctly', async () => {
    const bv = new RankSelectBitvector2([true, false, true, false, true, true, false]);
    expect(bv.select1(0)).toBe(0);
    expect(bv.select1(1)).toBe(2);
    expect(bv.select1(2)).toBe(4);
    expect(bv.select1(3)).toBe(5);
    expect(bv.select1(4)).toBe(-1);
  });

  it('computes select0 correctly', async () => {
    const bv = new RankSelectBitvector2([true, false, true, false, true, true, false]);
    expect(bv.select0(0)).toBe(1);
    expect(bv.select0(1)).toBe(3);
    expect(bv.select0(2)).toBe(6);
    expect(bv.select0(3)).toBe(-1);
  });

  it('handles select1 for empty bitvector', async () => {
    const bv = new RankSelectBitvector2(10);
    expect(bv.select1(0)).toBe(-1);
    expect(bv.select1(5)).toBe(-1);
  });

  it('handles select0 for bitvector with all ones', async () => {
    const bv = new RankSelectBitvector2([true, true, true, true, true]);
    expect(bv.select0(0)).toBe(-1);
    expect(bv.select0(5)).toBe(-1);
  });

  it('handles large bitvector', async () => {
    const size = 1000;
    const bv = new RankSelectBitvector2(size);
    for (let i = 0; i < size; i += 3) {
      bv.set(i);
    }
    expect(bv.countOnes()).toBe(Math.ceil(size / 3));
    expect(bv.select1(10)).toBe(30);
    expect(bv.rank1(100)).toBe(34);
  });

  it('handles bits at block boundaries', async () => {
    const bv = new RankSelectBitvector2(100);
    bv.set(31);
    bv.set(32);
    bv.set(33);
    bv.set(63);
    bv.set(64);
    bv.set(65);
    expect(bv.get(31)).toBe(true);
    expect(bv.get(32)).toBe(true);
    expect(bv.get(33)).toBe(true);
    expect(bv.get(63)).toBe(true);
    expect(bv.get(64)).toBe(true);
    expect(bv.get(65)).toBe(true);
  });

  it('handles rank at block boundaries', async () => {
    const bv = new RankSelectBitvector2(100);
    for (let i = 0; i < 64; i++) {
      bv.set(i);
    }
    expect(bv.rank1(32)).toBe(32);
    expect(bv.rank1(64)).toBe(64);
    expect(bv.rank1(65)).toBe(64);
  });

  it('handles select at block boundaries', async () => {
    const bv = new RankSelectBitvector2(100);
    for (let i = 0; i < 64; i++) {
      bv.set(i);
    }
    expect(bv.select1(31)).toBe(31);
    expect(bv.select1(32)).toBe(32);
    expect(bv.select1(63)).toBe(63);
  });

  it('converts to array correctly', async () => {
    const input = [true, false, true, false, true];
    const bv = new RankSelectBitvector2(input);
    const array = bv.toArray();
    expect(array).toEqual(input);
  });

  it('handles setting same bit twice', async () => {
    const bv = new RankSelectBitvector2(10);
    bv.set(5);
    bv.set(5);
    expect(bv.countOnes()).toBe(1);
  });

  it('handles unsetting same bit twice', async () => {
    const bv = new RankSelectBitvector2([true, false, true]);
    bv.unset(0);
    bv.unset(0);
    expect(bv.countOnes()).toBe(1);
  });

  it('handles flipping same bit twice', async () => {
    const bv = new RankSelectBitvector2([true, false, true]);
    bv.flip(0);
    bv.flip(0);
    expect(bv.get(0)).toBe(true);
    expect(bv.countOnes()).toBe(2);
  });

  it('returns -1 for select1 with invalid k', async () => {
    const bv = new RankSelectBitvector2([true, false, true]);
    expect(bv.select1(-1)).toBe(-1);
    expect(bv.select1(5)).toBe(-1);
  });

  it('returns -1 for select0 with invalid k', async () => {
    const bv = new RankSelectBitvector2([true, false, true]);
    expect(bv.select0(-1)).toBe(-1);
    expect(bv.select0(5)).toBe(-1);
  });

  it('handles edge case of single bit', async () => {
    const bv = new RankSelectBitvector2(1);
    expect(bv.get(0)).toBe(false);
    bv.set(0);
    expect(bv.get(0)).toBe(true);
    expect(bv.countOnes()).toBe(1);
  });

  it('handles edge case of empty bitvector', async () => {
    const bv = new RankSelectBitvector2(0);
    expect(bv.length).toBe(0);
    expect(bv.countOnes()).toBe(0);
    expect(bv.isEmpty()).toBe(true);
  });

  it('handles rank1 at end of bitvector', async () => {
    const bv = new RankSelectBitvector2([true, false, true, false, true]);
    expect(bv.rank1(5)).toBe(3);
  });

  it('handles rank0 at end of bitvector', async () => {
    const bv = new RankSelectBitvector2([true, false, true, false, true]);
    expect(bv.rank0(5)).toBe(2);
  });

  it('handles toArray round-trip', async () => {
    const bits = [true, false, true, true, false];
    const bv = new RankSelectBitvector2(bits);
    expect(bv.toArray()).toEqual(bits);
  });

  it('handles countZeros', async () => {
    const bv = new RankSelectBitvector2([true, false, true, false]);
    expect(bv.countZeros()).toBe(2);
    expect(bv.countOnes()).toBe(2);
  });

  it('handles isEmpty after construction from array', async () => {
    const bv = new RankSelectBitvector2([false, false, false]);
    expect(bv.isEmpty()).toBe(true);
  });

  it('handles select1 for first and last positions', async () => {
    const bv = new RankSelectBitvector2([true, false, false, true, true]);
    expect(bv.select1(0)).toBe(0);
    expect(bv.select1(1)).toBe(3);
    expect(bv.select1(2)).toBe(4);
  });

  it('handles select0 for first zero position', async () => {
    const bv = new RankSelectBitvector2([true, false, true]);
    expect(bv.select0(0)).toBe(1);
  });

  it('handles flip operation', async () => {
    const bv = new RankSelectBitvector2([true, false, true]);
    bv.flip(1);
    expect(bv.get(1)).toBe(true);
    expect(bv.countOnes()).toBe(3);
  });

  it('handles unset operation', async () => {
    const bv = new RankSelectBitvector2([true, true, true]);
    bv.unset(1);
    expect(bv.get(1)).toBe(false);
    expect(bv.countOnes()).toBe(2);
  });

  it('handles set operation', async () => {
    const bv = new RankSelectBitvector2([false, false, false]);
    bv.set(1);
    expect(bv.get(1)).toBe(true);
    expect(bv.countOnes()).toBe(1);
  });

  it('handles toArray', async () => {
    const bv = new RankSelectBitvector2([true, false, true]);
    expect(bv.toArray()).toEqual([true, false, true]);
  });

  it('handles countOnes', async () => {
    const bv = new RankSelectBitvector2([true, false, true, true]);
    expect(bv.countOnes()).toBe(3);
  });

  it('handles rank', async () => {
    const bv = new RankSelectBitvector2([true, false, true, true]);
    expect(bv.rank1(3)).toBe(2);
  });

  it('handles select1', async () => {
    const bv = new RankSelectBitvector2([true, false, true, true, false]);
    const pos = bv.select1(0);
    expect(pos).toBeGreaterThanOrEqual(0);
  });

  it('handles countOnes', async () => {
    const bv = new RankSelectBitvector2([true, false, true, true, false]);
    expect(bv.countOnes()).toBe(3);
    expect(bv.countZeros()).toBe(2);
  });

  it('handles isEmpty', async () => {
    const bv = new RankSelectBitvector2(0);
    expect(bv.isEmpty()).toBe(true);
    const bv2 = new RankSelectBitvector2([true, false]);
    expect(bv2.isEmpty()).toBe(false);
  });

  it('handles set and get', async () => {
    const bv = new RankSelectBitvector2([false, false, false]);
    bv.set(1);
    expect(bv.get(1)).toBe(true);
    bv.unset(1);
    expect(bv.get(1)).toBe(false);
  });

  it('handles toArray', async () => {
    const bv = new RankSelectBitvector2([true, false, true]);
    expect(bv.toArray()).toEqual([true, false, true]);
  });
  it('should handle set and unset', () => {
    const bv = new RankSelectBitvector2(8);
    bv.set(0);
    bv.set(3);
    expect(bv.get(0)).toBe(true);
    bv.unset(0);
    expect(bv.get(0)).toBe(false);
  });
  it('should handle rank', () => {
    const bv = new RankSelectBitvector2([true, false, true, true]);
    expect(bv.rank1(2)).toBe(1);
    expect(bv.rank0(2)).toBe(1);
  });
  it('should handle toArray', () => {
    const bv = new RankSelectBitvector2([true, false, true]);
    const arr = bv.toArray();
    expect(arr).toEqual([true, false, true]);
  });
  it('should handle set and unset', () => {
    const bv = new RankSelectBitvector2([false, false, false]);
    bv.set(1);
    expect(bv.get(1)).toBe(true);
    bv.unset(1);
    expect(bv.get(1)).toBe(false);
  });
});
