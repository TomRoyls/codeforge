import { describe, it, expect } from 'vitest';
import { SuccinctBitvector2 } from '../src/core/succinct-bitvector-2';

describe('SuccinctBitvector2', () => {
  it('should create from boolean array', async () => {
    const bits = [true, false, true, false, true];
    const bv = new SuccinctBitvector2(bits);
    expect(bv.length).toBe(5);
  });

  it('should get individual bits', async () => {
    const bits = [true, false, true, false, true];
    const bv = new SuccinctBitvector2(bits);
    expect(bv.get(0)).toBe(true);
    expect(bv.get(1)).toBe(false);
    expect(bv.get(2)).toBe(true);
    expect(bv.get(3)).toBe(false);
    expect(bv.get(4)).toBe(true);
  });

  it('should compute rank1 correctly', async () => {
    const bits = [true, false, true, false, true, true, false];
    const bv = new SuccinctBitvector2(bits);
    expect(bv.rank1(0)).toBe(0);
    expect(bv.rank1(1)).toBe(1);
    expect(bv.rank1(2)).toBe(1);
    expect(bv.rank1(3)).toBe(2);
    expect(bv.rank1(4)).toBe(2);
    expect(bv.rank1(5)).toBe(3);
    expect(bv.rank1(6)).toBe(4);
    expect(bv.rank1(7)).toBe(4);
  });

  it('should compute rank0 correctly', async () => {
    const bits = [true, false, true, false, true, true, false];
    const bv = new SuccinctBitvector2(bits);
    expect(bv.rank0(0)).toBe(0);
    expect(bv.rank0(1)).toBe(0);
    expect(bv.rank0(2)).toBe(1);
    expect(bv.rank0(3)).toBe(1);
    expect(bv.rank0(4)).toBe(2);
    expect(bv.rank0(5)).toBe(2);
    expect(bv.rank0(6)).toBe(2);
    expect(bv.rank0(7)).toBe(3);
  });

  it('should compute select1 correctly', async () => {
    const bits = [true, false, true, false, true, true, false];
    const bv = new SuccinctBitvector2(bits);
    expect(bv.select1(0)).toBe(0);
    expect(bv.select1(1)).toBe(2);
    expect(bv.select1(2)).toBe(4);
    expect(bv.select1(3)).toBe(5);
    expect(bv.select1(4)).toBe(-1);
  });

  it('should compute select0 correctly', async () => {
    const bits = [true, false, true, false, true, true, false];
    const bv = new SuccinctBitvector2(bits);
    expect(bv.select0(0)).toBe(1);
    expect(bv.select0(1)).toBe(3);
    expect(bv.select0(2)).toBe(6);
    expect(bv.select0(3)).toBe(-1);
  });

  it('should handle empty bitvector', async () => {
    const bv = new SuccinctBitvector2([]);
    expect(bv.length).toBe(0);
    expect(bv.isEmpty()).toBe(true);
    expect(bv.countOnes()).toBe(0);
    expect(bv.countZeros()).toBe(0);
  });

  it('should handle all ones', async () => {
    const bits = [true, true, true, true, true];
    const bv = new SuccinctBitvector2(bits);
    expect(bv.length).toBe(5);
    expect(bv.countOnes()).toBe(5);
    expect(bv.countZeros()).toBe(0);
    expect(bv.rank1(5)).toBe(5);
    expect(bv.rank0(5)).toBe(0);
  });

  it('should handle all zeros', async () => {
    const bits = [false, false, false, false, false];
    const bv = new SuccinctBitvector2(bits);
    expect(bv.length).toBe(5);
    expect(bv.countOnes()).toBe(0);
    expect(bv.countZeros()).toBe(5);
    expect(bv.rank1(5)).toBe(0);
    expect(bv.rank0(5)).toBe(5);
  });

  it('should convert to array', async () => {
    const bits = [true, false, true, false, true];
    const bv = new SuccinctBitvector2(bits);
    const result = bv.toArray();
    expect(result).toEqual(bits);
  });

  it('should handle single bit', async () => {
    const bvTrue = new SuccinctBitvector2([true]);
    expect(bvTrue.length).toBe(1);
    expect(bvTrue.get(0)).toBe(true);
    expect(bvTrue.rank1(1)).toBe(1);
    expect(bvTrue.select1(0)).toBe(0);

    const bvFalse = new SuccinctBitvector2([false]);
    expect(bvFalse.length).toBe(1);
    expect(bvFalse.get(0)).toBe(false);
    expect(bvFalse.rank1(1)).toBe(0);
    expect(bvFalse.select0(0)).toBe(0);
  });

  it('should handle edge cases for select1', async () => {
    const bits = [true, false, true, false, true];
    const bv = new SuccinctBitvector2(bits);
    expect(bv.select1(-1)).toBe(-1);
    expect(bv.select1(3)).toBe(-1);
    expect(bv.select1(100)).toBe(-1);
  });

  it('should handle edge cases for select0', async () => {
    const bits = [true, false, true, false, true];
    const bv = new SuccinctBitvector2(bits);
    expect(bv.select0(-1)).toBe(-1);
    expect(bv.select0(2)).toBe(-1);
    expect(bv.select0(100)).toBe(-1);
  });

  it('should handle rank with index out of bounds', async () => {
    const bits = [true, false, true];
    const bv = new SuccinctBitvector2(bits);
    expect(bv.rank1(-1)).toBe(0);
    expect(bv.rank1(10)).toBe(2);
  });

  it('should handle mixed pattern across block boundaries', async () => {
    const bits: boolean[] = [];
    for (let i = 0; i < 100; i++) {
      bits.push(i % 3 === 0);
    }
    const bv = new SuccinctBitvector2(bits);

    let expectedOnes = 0;
    for (let i = 0; i <= 100; i++) {
      expect(bv.rank1(i)).toBe(expectedOnes);
      if (i < 100 && bits[i]) {
        expectedOnes++;
      }
    }

    expect(bv.countOnes()).toBe(expectedOnes);
  });

  it('should handle long bitvector with many blocks', async () => {
    const bits: boolean[] = [];
    for (let i = 0; i < 500; i++) {
      bits.push(i % 7 === 0);
    }
    const bv = new SuccinctBitvector2(bits);

    expect(bv.length).toBe(500);

    let count = 0;
    for (let i = 0; i < 500; i++) {
      if (bits[i]) {
        expect(bv.select1(count)).toBe(i);
        count++;
      }
    }

    expect(bv.countOnes()).toBe(count);
  });

  it('should throw error for get with invalid index', async () => {
    const bv = new SuccinctBitvector2([true, false]);
    expect(() => bv.get(-1)).toThrow();
    expect(() => bv.get(5)).toThrow();
  });

  it('should handle consecutive ones and zeros', async () => {
    const bits = [true, true, true, false, false, false, true, true, false, false];
    const bv = new SuccinctBitvector2(bits);

    expect(bv.rank1(3)).toBe(3);
    expect(bv.rank1(6)).toBe(3);
    expect(bv.rank1(7)).toBe(4);
    expect(bv.rank1(9)).toBe(5);

    expect(bv.select1(0)).toBe(0);
    expect(bv.select1(1)).toBe(1);
    expect(bv.select1(2)).toBe(2);
    expect(bv.select1(3)).toBe(6);
    expect(bv.select1(4)).toBe(7);
  });

  it('should handle all ones bitvector', () => {
    const bv = new SuccinctBitvector2([true, true, true, true]);
    expect(bv.countOnes()).toBe(4);
    expect(bv.rank1(4)).toBe(4);
    expect(bv.select1(0)).toBe(0);
    expect(bv.select1(3)).toBe(3);
  });

  it('should handle all zeros bitvector', () => {
    const bv = new SuccinctBitvector2([false, false, false]);
    expect(bv.countOnes()).toBe(0);
    expect(bv.rank1(2)).toBe(0);
  });

  it('should handle single bit', () => {
    const bv1 = new SuccinctBitvector2([true]);
    expect(bv1.get(0)).toBe(true);
    expect(bv1.countOnes()).toBe(1);

    const bv0 = new SuccinctBitvector2([false]);
    expect(bv0.get(0)).toBe(false);
    expect(bv0.countOnes()).toBe(0);
  });

  it('should handle alternating bits', () => {
    const bv = new SuccinctBitvector2([true, false, true, false, true]);
    expect(bv.countOnes()).toBe(3);
    expect(bv.rank1(5)).toBe(3);
    expect(bv.select1(0)).toBe(0);
    expect(bv.select1(1)).toBe(2);
    expect(bv.select1(2)).toBe(4);
  });
});
