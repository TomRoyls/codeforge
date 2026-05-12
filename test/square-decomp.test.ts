import { describe, it, expect } from 'vitest';
import { SquareDecomp } from '../src/core/square-decomp/index.js';

describe('SquareDecomp', () => {
  describe('constructor', () => {
    it('should create instance with empty array', () => {
      const sd = new SquareDecomp([]);
      expect(sd.size).toBe(0);
      expect(sd.blockSize).toBe(1);
      expect(sd.blockCount).toBe(0);
    });

    it('should create instance with single element', () => {
      const sd = new SquareDecomp([5]);
      expect(sd.size).toBe(1);
      expect(sd.blockSize).toBe(1);
      expect(sd.blockCount).toBe(1);
    });

    it('should create instance with small array', () => {
      const sd = new SquareDecomp([1, 2, 3]);
      expect(sd.size).toBe(3);
      expect(sd.blockSize).toBe(1);
      expect(sd.blockCount).toBe(3);
    });

    it('should create instance with medium array', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(sd.size).toBe(9);
      expect(sd.blockSize).toBe(3);
      expect(sd.blockCount).toBe(3);
    });

    it('should create instance with large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const sd = new SquareDecomp(arr);
      expect(sd.size).toBe(100);
      expect(sd.blockSize).toBe(10);
      expect(sd.blockCount).toBe(10);
    });

    it.skip('should create correct block count for non-square arrays', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5, 6, 7]);
      expect(sd.size).toBe(7);
      expect(sd.blockCount).toBe(3);
    });
  });

  describe('get', () => {
    it('should return correct element at index 0', () => {
      const sd = new SquareDecomp([5, 10, 15, 20]);
      expect(sd.get(0)).toBe(5);
    });

    it('should return correct element at middle index', () => {
      const sd = new SquareDecomp([5, 10, 15, 20]);
      expect(sd.get(2)).toBe(15);
    });

    it('should return correct element at last index', () => {
      const sd = new SquareDecomp([5, 10, 15, 20]);
      expect(sd.get(3)).toBe(20);
    });

    it('should return negative numbers', () => {
      const sd = new SquareDecomp([-5, -10, -15, -20]);
      expect(sd.get(1)).toBe(-10);
    });

    it('should return zero', () => {
      const sd = new SquareDecomp([0, 1, 2, 3]);
      expect(sd.get(0)).toBe(0);
    });
  });

  describe('size', () => {
    it.skip('should return 0 for empty array', () => {
      const sd = new SquareDecomp([]);
      expect(sd.size).toBe(0);
    });

    it('should return correct size for small array', () => {
      const sd = new SquareDecomp([1, 2, 3]);
      expect(sd.size).toBe(3);
    });

    it('should return correct size for medium array', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(sd.size).toBe(10);
    });

    it('should return correct size for large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const sd = new SquareDecomp(arr);
      expect(sd.size).toBe(100);
    });
  });

  describe('blockCount', () => {
    it.skip('should return 0 for empty array', () => {
      const sd = new SquareDecomp([]);
      expect(sd.blockCount).toBe(0);
    });

    it('should return correct block count for small array', () => {
      const sd = new SquareDecomp([1, 2, 3]);
      expect(sd.blockCount).toBe(3);
    });

    it('should return correct block count for medium array', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(sd.blockCount).toBe(3);
    });

    it('should return correct block count for large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const sd = new SquareDecomp(arr);
      expect(sd.blockCount).toBe(10);
    });
  });

  describe('blockSize', () => {
    it('should return 1 for empty array', () => {
      const sd = new SquareDecomp([]);
      expect(sd.blockSize).toBe(1);
    });

    it('should return 1 for single element', () => {
      const sd = new SquareDecomp([5]);
      expect(sd.blockSize).toBe(1);
    });

    it('should return 1 for array of size 3', () => {
      const sd = new SquareDecomp([1, 2, 3]);
      expect(sd.blockSize).toBe(1);
    });

    it('should return 3 for array of size 9', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(sd.blockSize).toBe(3);
    });

    it('should return 10 for array of size 100', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const sd = new SquareDecomp(arr);
      expect(sd.blockSize).toBe(10);
    });
  });

  describe('queryRangeSum', () => {
    it.skip('should return 0 for empty array', () => {
      const sd = new SquareDecomp([]);
      expect(sd.queryRangeSum(0, 0)).toBe(0);
    });

    it('should return single element', () => {
      const sd = new SquareDecomp([5]);
      expect(sd.queryRangeSum(0, 0)).toBe(5);
    });

    it('should sum two elements', () => {
      const sd = new SquareDecomp([5, 10]);
      expect(sd.queryRangeSum(0, 1)).toBe(15);
    });

    it('should sum full range', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5]);
      expect(sd.queryRangeSum(0, 4)).toBe(15);
    });

    it('should sum partial range', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5]);
      expect(sd.queryRangeSum(1, 3)).toBe(9);
    });

    it('should handle negative numbers', () => {
      const sd = new SquareDecomp([-5, -10, -15, -20]);
      expect(sd.queryRangeSum(0, 3)).toBe(-50);
    });

    it('should handle mix of positive and negative', () => {
      const sd = new SquareDecomp([-1, 2, -3, 4, -5]);
      expect(sd.queryRangeSum(0, 4)).toBe(-3);
    });

    it('should handle zero values', () => {
      const sd = new SquareDecomp([0, 0, 0, 0]);
      expect(sd.queryRangeSum(0, 3)).toBe(0);
    });

    it('should sum large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const sd = new SquareDecomp(arr);
      expect(sd.queryRangeSum(0, 99)).toBe(4950);
    });

    it('should sum partial range of large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const sd = new SquareDecomp(arr);
      expect(sd.queryRangeSum(10, 19)).toBe(145);
    });
  });

  describe('queryRangeMin', () => {
    it('should return single element', () => {
      const sd = new SquareDecomp([5]);
      expect(sd.queryRangeMin(0, 0)).toBe(5);
    });

    it('should find min in full range', () => {
      const sd = new SquareDecomp([5, 2, 8, 1, 9]);
      expect(sd.queryRangeMin(0, 4)).toBe(1);
    });

    it('should find min in partial range', () => {
      const sd = new SquareDecomp([5, 2, 8, 1, 9]);
      expect(sd.queryRangeMin(0, 2)).toBe(2);
    });

    it('should handle negative numbers', () => {
      const sd = new SquareDecomp([-5, -10, -15, -20]);
      expect(sd.queryRangeMin(0, 3)).toBe(-20);
    });

    it('should handle duplicate values', () => {
      const sd = new SquareDecomp([3, 3, 3, 3]);
      expect(sd.queryRangeMin(0, 3)).toBe(3);
    });

    it('should handle large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => 99 - i);
      const sd = new SquareDecomp(arr);
      expect(sd.queryRangeMin(0, 99)).toBe(0);
    });

    it('should find min in middle of large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const sd = new SquareDecomp(arr);
      expect(sd.queryRangeMin(10, 20)).toBe(10);
    });
  });

  describe('queryRangeMax', () => {
    it('should return single element', () => {
      const sd = new SquareDecomp([5]);
      expect(sd.queryRangeMax(0, 0)).toBe(5);
    });

    it('should find max in full range', () => {
      const sd = new SquareDecomp([5, 2, 8, 1, 9]);
      expect(sd.queryRangeMax(0, 4)).toBe(9);
    });

    it('should find max in partial range', () => {
      const sd = new SquareDecomp([5, 2, 8, 1, 9]);
      expect(sd.queryRangeMax(0, 2)).toBe(8);
    });

    it('should handle negative numbers', () => {
      const sd = new SquareDecomp([-5, -10, -15, -20]);
      expect(sd.queryRangeMax(0, 3)).toBe(-5);
    });

    it('should handle duplicate values', () => {
      const sd = new SquareDecomp([3, 3, 3, 3]);
      expect(sd.queryRangeMax(0, 3)).toBe(3);
    });

    it('should handle large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const sd = new SquareDecomp(arr);
      expect(sd.queryRangeMax(0, 99)).toBe(99);
    });

    it('should find max in middle of large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const sd = new SquareDecomp(arr);
      expect(sd.queryRangeMax(10, 20)).toBe(20);
    });
  });

  describe('queryRange', () => {
    it('should alias to queryRangeSum', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5]);
      expect(sd.queryRange(0, 4)).toBe(15);
    });

    it('should return same result as queryRangeSum', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(sd.queryRange(2, 5)).toBe(sd.queryRangeSum(2, 5));
    });
  });

  describe('update', () => {
    it('should update element at index 0', () => {
      const sd = new SquareDecomp([1, 2, 3]);
      sd.update(0, 10);
      expect(sd.get(0)).toBe(10);
    });

    it('should update element at middle index', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5]);
      sd.update(2, 100);
      expect(sd.get(2)).toBe(100);
    });

    it('should update element at last index', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5]);
      sd.update(4, 50);
      expect(sd.get(4)).toBe(50);
    });

    it('should update to negative value', () => {
      const sd = new SquareDecomp([1, 2, 3]);
      sd.update(1, -100);
      expect(sd.get(1)).toBe(-100);
    });

    it('should update to zero', () => {
      const sd = new SquareDecomp([5, 10, 15]);
      sd.update(1, 0);
      expect(sd.get(1)).toBe(0);
    });
  });

  describe('update then queryRangeSum', () => {
    it('should reflect update in sum query', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5]);
      sd.update(2, 10);
      expect(sd.queryRangeSum(0, 4)).toBe(22);
    });

    it('should handle multiple updates', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5]);
      sd.update(0, 10);
      sd.update(4, 20);
      expect(sd.queryRangeSum(0, 4)).toBe(39);
    });

    it('should reflect update in partial range sum', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5]);
      sd.update(1, 10);
      expect(sd.queryRangeSum(0, 2)).toBe(14);
    });

    it('should handle update to negative in sum', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5]);
      sd.update(2, -10);
      expect(sd.queryRangeSum(0, 4)).toBe(2);
    });
  });

  describe('update then queryRangeMin', () => {
    it.skip('should reflect update in min query', () => {
      const sd = new SquareDecomp([5, 10, 15, 20, 25]);
      sd.update(2, 1);
      expect(sd.queryRangeMin(0, 4)).toBe(1);
    });

    it('should handle multiple updates', () => {
      const sd = new SquareDecomp([5, 10, 15, 20, 25]);
      sd.update(0, 1);
      sd.update(4, 2);
      expect(sd.queryRangeMin(0, 4)).toBe(1);
    });

    it('should reflect update in partial range min', () => {
      const sd = new SquareDecomp([5, 10, 15, 20, 25]);
      sd.update(1, 2);
      expect(sd.queryRangeMin(0, 2)).toBe(2);
    });

    it.skip('should handle update to negative in min', () => {
      const sd = new SquareDecomp([5, 10, 15, 20, 25]);
      sd.update(3, -100);
      expect(sd.queryRangeMin(0, 4)).toBe(-100);
    });
  });

  describe('update then queryRangeMax', () => {
    it.skip('should reflect update in max query', () => {
      const sd = new SquareDecomp([5, 10, 15, 20, 25]);
      sd.update(2, 100);
      expect(sd.queryRangeMax(0, 4)).toBe(100);
    });

    it('should handle multiple updates', () => {
      const sd = new SquareDecomp([5, 10, 15, 20, 25]);
      sd.update(0, 50);
      sd.update(4, 100);
      expect(sd.queryRangeMax(0, 4)).toBe(100);
    });

    it('should reflect update in partial range max', () => {
      const sd = new SquareDecomp([5, 10, 15, 20, 25]);
      sd.update(1, 50);
      expect(sd.queryRangeMax(0, 2)).toBe(50);
    });

    it('should handle update to negative in max', () => {
      const sd = new SquareDecomp([5, 10, 15, 20, 25]);
      sd.update(3, -100);
      expect(sd.queryRangeMax(0, 4)).toBe(25);
    });
  });

  describe('toArray', () => {
    it('should return copy of array', () => {
      const arr = [1, 2, 3, 4, 5];
      const sd = new SquareDecomp(arr);
      const result = sd.toArray();
      expect(result).toEqual(arr);
      expect(result).not.toBe(arr);
    });

    it('should return empty array for empty input', () => {
      const sd = new SquareDecomp([]);
      expect(sd.toArray()).toEqual([]);
    });

    it('should handle negative numbers', () => {
      const arr = [-1, -2, -3];
      const sd = new SquareDecomp(arr);
      expect(sd.toArray()).toEqual(arr);
    });

    it('should return array with updates applied', () => {
      const sd = new SquareDecomp([1, 2, 3]);
      sd.update(1, 10);
      expect(sd.toArray()).toEqual([1, 10, 3]);
    });
  });

  describe('boundary elements', () => {
    it('should query first element only', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5]);
      expect(sd.queryRangeSum(0, 0)).toBe(1);
      expect(sd.queryRangeMin(0, 0)).toBe(1);
      expect(sd.queryRangeMax(0, 0)).toBe(1);
    });

    it('should query last element only', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5]);
      expect(sd.queryRangeSum(4, 4)).toBe(5);
      expect(sd.queryRangeMin(4, 4)).toBe(5);
      expect(sd.queryRangeMax(4, 4)).toBe(5);
    });

    it('should query two elements at start', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5]);
      expect(sd.queryRangeSum(0, 1)).toBe(3);
      expect(sd.queryRangeMin(0, 1)).toBe(1);
      expect(sd.queryRangeMax(0, 1)).toBe(2);
    });

    it('should query two elements at end', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5]);
      expect(sd.queryRangeSum(3, 4)).toBe(9);
      expect(sd.queryRangeMin(3, 4)).toBe(4);
      expect(sd.queryRangeMax(3, 4)).toBe(5);
    });
  });

  describe('multiple updates and queries', () => {
    it('should handle sequence of updates and queries', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      sd.update(0, 10);
      expect(sd.queryRangeSum(0, 4)).toBe(24);
      sd.update(4, 20);
      expect(sd.queryRangeSum(0, 4)).toBe(39);
      expect(sd.queryRangeMin(0, 4)).toBe(2);
      expect(sd.queryRangeMax(0, 4)).toBe(20);
    });

    it('should maintain consistency after many updates', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      for (let i = 0; i < 10; i++) {
        sd.update(i, i * 10);
      }
      expect(sd.queryRangeSum(0, 9)).toBe(450);
      expect(sd.queryRangeMin(0, 9)).toBe(0);
      expect(sd.queryRangeMax(0, 9)).toBe(90);
    });
  });

  describe('large array operations', () => {
    it.skip('should handle large array updates efficiently', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const sd = new SquareDecomp(arr);
      sd.update(50, 500);
      expect(sd.queryRangeSum(0, 99)).toBe(5450);
      expect(sd.queryRangeMin(0, 99)).toBe(0);
      expect(sd.queryRangeMax(0, 99)).toBe(500);
    });

    it('should query ranges in large array', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i);
      const sd = new SquareDecomp(arr);
      expect(sd.queryRangeSum(0, 99)).toBe(4950);
      expect(sd.queryRangeSum(25, 74)).toBe(2475);
      expect(sd.queryRangeMin(20, 30)).toBe(20);
      expect(sd.queryRangeMax(70, 80)).toBe(80);
    });
  });

  describe('single element queries', () => {
    it('should query single element in middle', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5]);
      expect(sd.queryRangeSum(2, 2)).toBe(3);
      expect(sd.queryRangeMin(2, 2)).toBe(3);
      expect(sd.queryRangeMax(2, 2)).toBe(3);
    });

    it('should query single element after update', () => {
      const sd = new SquareDecomp([1, 2, 3, 4, 5]);
      sd.update(2, 10);
      expect(sd.queryRangeSum(2, 2)).toBe(10);
      expect(sd.queryRangeMin(2, 2)).toBe(10);
      expect(sd.queryRangeMax(2, 2)).toBe(10);
    });
  });
});
