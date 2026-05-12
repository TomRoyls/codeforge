import { describe, it, expect } from 'vitest';
import { KthLargest } from '../../src/core/k-th-largest';

describe('KthLargest', () => {
  describe('constructor', () => {
    it('should initialize with empty array', () => {
      const kth = new KthLargest(3, []);
      expect(kth.size).toBe(0);
    });

    it('should initialize with array of size less than k', () => {
      const kth = new KthLargest(5, [1, 2]);
      expect(kth.size).toBe(2);
      expect(kth.getKthLargest()).toBe(1);
    });

    it('should initialize with array of size equal to k', () => {
      const kth = new KthLargest(3, [1, 2, 3]);
      expect(kth.size).toBe(3);
      expect(kth.getKthLargest()).toBe(1);
    });

    it('should initialize with array of size greater than k', () => {
      const kth = new KthLargest(3, [5, 4, 3, 2, 1]);
      expect(kth.size).toBe(3);
      expect(kth.getKthLargest()).toBe(3);
    });

    it('should initialize with duplicate values', () => {
      const kth = new KthLargest(3, [5, 5, 5, 5]);
      expect(kth.size).toBe(3);
      expect(kth.getKthLargest()).toBe(5);
    });

    it('should initialize with negative numbers', () => {
      const kth = new KthLargest(3, [-1, -2, -3]);
      expect(kth.size).toBe(3);
      expect(kth.getKthLargest()).toBe(-3);
    });
  });

  describe('add', () => {
    it('should return 2nd largest when k=2', () => {
      const kth = new KthLargest(2, []);
      expect(kth.add(1)).toBe(-Infinity);
      expect(kth.add(2)).toBe(1);
      expect(kth.add(3)).toBe(2);
      expect(kth.add(4)).toBe(3);
    });

    it('should return 3rd largest when k=3', () => {
      const kth = new KthLargest(3, []);
      kth.add(3);
      kth.add(2);
      expect(kth.add(1)).toBe(1);
      expect(kth.add(4)).toBe(2);
      expect(kth.add(5)).toBe(3);
    });

    it('should handle adding values smaller than current heap min', () => {
      const kth = new KthLargest(3, [5, 4, 3]);
      expect(kth.add(1)).toBe(3);
      expect(kth.add(2)).toBe(3);
      expect(kth.getKthLargest()).toBe(3);
    });

    it('should handle adding values larger than current heap min', () => {
      const kth = new KthLargest(3, [5, 4, 3]);
      expect(kth.add(6)).toBe(4);
      expect(kth.add(7)).toBe(5);
      expect(kth.getKthLargest()).toBe(5);
    });

    it('should maintain heap size at k', () => {
      const kth = new KthLargest(3, []);
      for (let i = 1; i <= 10; i++) {
        kth.add(i);
        expect(kth.size).toBeLessThanOrEqual(3);
      }
    });

    it('should handle duplicate adds', () => {
      const kth = new KthLargest(3, []);
      kth.add(5);
      kth.add(5);
      kth.add(5);
      expect(kth.add(5)).toBe(5);
    });

    it('should handle sequential ascending values', () => {
      const kth = new KthLargest(4, []);
      for (let i = 1; i <= 10; i++) {
        kth.add(i);
      }
      expect(kth.getKthLargest()).toBe(7);
    });

    it('should handle sequential descending values', () => {
      const kth = new KthLargest(4, []);
      for (let i = 10; i >= 1; i--) {
        kth.add(i);
      }
      expect(kth.getKthLargest()).toBe(7);
    });

    it('should handle alternating high and low values', () => {
      const kth = new KthLargest(3, []);
      kth.add(10);
      kth.add(1);
      kth.add(9);
      expect(kth.add(2)).toBe(2);
    });
  });

  describe('getKthLargest', () => {
    it('should return the smallest element in heap (kth largest)', () => {
      const kth = new KthLargest(3, [10, 9, 8]);
      expect(kth.getKthLargest()).toBe(8);
    });

    it('should return correct value after multiple adds', () => {
      const kth = new KthLargest(3, [1, 2, 3]);
      kth.add(4);
      kth.add(5);
      expect(kth.getKthLargest()).toBe(3);
    });

    it('should work with k=1 (maximum)', () => {
      const kth = new KthLargest(1, [5, 3, 8, 1]);
      expect(kth.getKthLargest()).toBe(8);
      kth.add(10);
      expect(kth.getKthLargest()).toBe(10);
    });
  });

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      const kth = new KthLargest(3, []);
      expect(kth.size).toBe(0);
    });

    it('should return number of elements less than k during initialization', () => {
      const kth = new KthLargest(5, [1, 2]);
      expect(kth.size).toBe(2);
    });

    it('should return k after filling heap', () => {
      const kth = new KthLargest(3, []);
      kth.add(1);
      kth.add(2);
      kth.add(3);
      expect(kth.size).toBe(3);
    });

    it('should not exceed k after many adds', () => {
      const kth = new KthLargest(3, []);
      for (let i = 0; i < 10; i++) {
        kth.add(i);
      }
      expect(kth.size).toBe(3);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty heap', () => {
      const kth = new KthLargest(3, []);
      expect(kth.isEmpty).toBe(true);
    });

    it('should return false after first add', () => {
      const kth = new KthLargest(3, []);
      kth.add(1);
      expect(kth.isEmpty).toBe(false);
    });

    it('should return false after initialization with values', () => {
      const kth = new KthLargest(3, [1, 2, 3]);
      expect(kth.isEmpty).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle k=1 correctly', () => {
      const kth = new KthLargest(1, []);
      expect(kth.add(5)).toBe(5);
      expect(kth.add(3)).toBe(5);
      expect(kth.add(8)).toBe(8);
      expect(kth.add(1)).toBe(8);
    });

    it('should handle large k value', () => {
      const nums = Array.from({ length: 100 }, (_, i) => i + 1);
      const kth = new KthLargest(100, nums);
      expect(kth.getKthLargest()).toBe(1);
    });

    it('should handle single element', () => {
      const kth = new KthLargest(1, [42]);
      expect(kth.getKthLargest()).toBe(42);
    });

    it('should handle zero', () => {
      const kth = new KthLargest(3, []);
      kth.add(0);
      expect(kth.getKthLargest()).toBe(0);
    });

    it('should handle negative and positive mix', () => {
      const kth = new KthLargest(3, [-5, 10, -3, 7, 0]);
      expect(kth.getKthLargest()).toBe(0);
    });

    it('should maintain kth largest after many operations', () => {
      const kth = new KthLargest(4, [4, 5, 8, 2]);
      expect(kth.getKthLargest()).toBe(2);
      kth.add(3);
      expect(kth.getKthLargest()).toBe(3);
      kth.add(5);
      expect(kth.getKthLargest()).toBe(4);
      kth.add(10);
      expect(kth.getKthLargest()).toBe(5);
      kth.add(9);
      expect(kth.getKthLargest()).toBe(5);
      kth.add(4);
      expect(kth.getKthLargest()).toBe(5);
    });
  });

  describe('LeetCode example', () => {
    it('should match example 1: k=3, nums=[4,5,8,2], adds=[3],[5],[10],[9],[4]', () => {
      const kth = new KthLargest(3, [4, 5, 8, 2]);
      expect(kth.add(3)).toBe(4);
      expect(kth.add(5)).toBe(5);
      expect(kth.add(10)).toBe(5);
      expect(kth.add(9)).toBe(8);
      expect(kth.add(4)).toBe(8);
    });
  });

  describe('performance and stress', () => {
    it('should handle 1000 additions', () => {
      const kth = new KthLargest(10, []);
      for (let i = 0; i < 1000; i++) {
        kth.add(i);
      }
      expect(kth.size).toBe(10);
      expect(kth.getKthLargest()).toBe(990);
    });

    it('should handle same value repeated many times', () => {
      const kth = new KthLargest(5, []);
      for (let i = 0; i < 100; i++) {
        kth.add(42);
      }
      expect(kth.getKthLargest()).toBe(42);
    });
  });
});
