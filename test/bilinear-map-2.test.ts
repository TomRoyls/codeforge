import { describe, it, expect } from 'vitest';
import { BilinearMap2 } from '../src/core/bilinear-map-2/index.js';

describe('BilinearMap2', () => {
  describe('basic 2x2 grid', () => {
    it('interpolates center of 2x2 grid', () => {
      const grid = [
        [0, 10],
        [20, 30]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(0.5, 0.5)).toBe(15);
    });

    it('returns exact value at top-left corner', () => {
      const grid = [
        [5, 10],
        [15, 20]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(0, 0)).toBe(5);
    });

    it('returns exact value at top-right corner', () => {
      const grid = [
        [5, 10],
        [15, 20]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(1, 0)).toBe(10);
    });

    it('returns exact value at bottom-left corner', () => {
      const grid = [
        [5, 10],
        [15, 20]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(0, 1)).toBe(15);
    });

    it('returns exact value at bottom-right corner', () => {
      const grid = [
        [5, 10],
        [15, 20]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(1, 1)).toBe(20);
    });

    it('interpolates along top edge', () => {
      const grid = [
        [0, 10],
        [20, 30]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(0.25, 0)).toBe(2.5);
    });

    it('interpolates along bottom edge', () => {
      const grid = [
        [0, 10],
        [20, 30]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(0.75, 1)).toBe(27.5);
    });

    it('interpolates along left edge', () => {
      const grid = [
        [0, 10],
        [20, 30]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(0, 0.5)).toBe(10);
    });

    it('interpolates along right edge', () => {
      const grid = [
        [0, 10],
        [20, 30]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(1, 0.25)).toBe(15);
    });
  });

  describe('larger grid', () => {
    it('interpolates correctly in 3x3 grid', () => {
      const grid = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(1.5, 1.5)).toBe(6);
    });

    it('interpolates in first cell of 3x3 grid', () => {
      const grid = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(0.5, 0.5)).toBe(2);
    });

    it('interpolates across cells in larger grid', () => {
      const grid = [
        [0, 5, 10],
        [10, 15, 20],
        [20, 25, 30]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(2.5, 1.5)).toBe(25);
    });
  });

  describe('exact grid points', () => {
    it('returns exact values at all grid points', () => {
      const grid = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(0, 0)).toBe(1);
      expect(map.get(1, 0)).toBe(2);
      expect(map.get(2, 0)).toBe(3);
      expect(map.get(0, 1)).toBe(4);
      expect(map.get(1, 1)).toBe(5);
      expect(map.get(2, 1)).toBe(6);
      expect(map.get(0, 2)).toBe(7);
      expect(map.get(1, 2)).toBe(8);
      expect(map.get(2, 2)).toBe(9);
    });
  });

  describe('interpolated midpoints', () => {
    it('interpolates midpoint between two values', () => {
      const grid = [[0, 10]];
      const map = new BilinearMap2(grid);
      expect(map.get(0.5, 0)).toBe(5);
    });

    it('interpolates midpoint in both dimensions', () => {
      const grid = [
        [0, 4],
        [2, 6]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(0.5, 0.5)).toBe(3);
    });

    it('handles different interpolation weights', () => {
      const grid = [
        [0, 10],
        [0, 10]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(0.25, 0.5)).toBe(2.5);
    });
  });

  describe('boundary clamping', () => {
    it('clamps negative x coordinate', () => {
      const grid = [[5]];
      const map = new BilinearMap2(grid);
      expect(map.get(-1, 0)).toBe(5);
    });

    it('clamps negative y coordinate', () => {
      const grid = [[5]];
      const map = new BilinearMap2(grid);
      expect(map.get(0, -1)).toBe(5);
    });

    it('clamps x beyond right edge', () => {
      const grid = [[0, 10]];
      const map = new BilinearMap2(grid);
      expect(map.get(5, 0)).toBe(10);
    });

    it('clamps y beyond bottom edge', () => {
      const grid = [[0], [10]];
      const map = new BilinearMap2(grid);
      expect(map.get(0, 5)).toBe(10);
    });

    it('clamps both coordinates beyond bounds', () => {
      const grid = [[5]];
      const map = new BilinearMap2(grid);
      expect(map.get(-10, 10)).toBe(5);
    });
  });

  describe('setGridValue', () => {
    it('updates value at grid point', () => {
      const grid = [[0, 10]];
      const map = new BilinearMap2(grid);
      map.setGridValue(0, 1, 20);
      expect(map.get(1, 0)).toBe(20);
    });

    it('updates value and affects interpolation', () => {
      const grid = [
        [0, 10],
        [0, 10]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(0.5, 0.5)).toBe(5);
      map.setGridValue(0, 0, 10);
      expect(map.get(0.5, 0.5)).toBe(7.5);
    });
  });

  describe('getRaw', () => {
    it('returns value at valid position', () => {
      const grid = [
        [1, 2],
        [3, 4]
      ];
      const map = new BilinearMap2(grid);
      expect(map.getRaw(1, 1)).toBe(4);
    });

    it('returns undefined for out of bounds row', () => {
      const grid = [[1, 2]];
      const map = new BilinearMap2(grid);
      expect(map.getRaw(5, 0)).toBeUndefined();
    });

    it('returns undefined for out of bounds column', () => {
      const grid = [[1, 2]];
      const map = new BilinearMap2(grid);
      expect(map.getRaw(0, 5)).toBeUndefined();
    });
  });

  describe('getGrid', () => {
    it('returns deep copy of grid', () => {
      const grid = [[1, 2], [3, 4]];
      const map = new BilinearMap2(grid);
      const copy = map.getGrid();
      copy[0]![0] = 99;
      expect(map.getRaw(0, 0)).toBe(1);
    });

    it('returns correct grid structure', () => {
      const grid = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      const map = new BilinearMap2(grid);
      const copy = map.getGrid();
      expect(copy).toEqual(grid);
    });

    it('returns different reference from original', () => {
      const grid = [[1, 2]];
      const map = new BilinearMap2(grid);
      const copy = map.getGrid();
      expect(copy).not.toBe(grid);
    });
  });

  describe('getWidth and getHeight', () => {
    it('returns correct width for 2x3 grid', () => {
      const grid = [[1, 2, 3], [4, 5, 6]];
      const map = new BilinearMap2(grid);
      expect(map.getWidth()).toBe(3);
    });

    it('returns correct height for 2x3 grid', () => {
      const grid = [[1, 2, 3], [4, 5, 6]];
      const map = new BilinearMap2(grid);
      expect(map.getHeight()).toBe(2);
    });

    it('handles single cell grid', () => {
      const grid = [[42]];
      const map = new BilinearMap2(grid);
      expect(map.getWidth()).toBe(1);
      expect(map.getHeight()).toBe(1);
    });

    it('handles large grid', () => {
      const grid = Array(100).fill(null).map(() => Array(50).fill(0));
      const map = new BilinearMap2(grid);
      expect(map.getWidth()).toBe(50);
      expect(map.getHeight()).toBe(100);
    });
  });

  describe('uniform grid', () => {
    it('returns same value everywhere on uniform grid', () => {
      const grid = [
        [5, 5, 5],
        [5, 5, 5]
      ];
      const map = new BilinearMap2(grid);
      expect(map.get(0, 0)).toBe(5);
      expect(map.get(1, 0.5)).toBe(5);
      expect(map.get(2, 1)).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('handles zero values', () => {
      const grid = [[0, 0], [0, 0]];
      const map = new BilinearMap2(grid);
      expect(map.get(0.5, 0.5)).toBe(0);
    });

    it('handles negative values', () => {
      const grid = [[-10, -5], [-5, 0]];
      const map = new BilinearMap2(grid);
      expect(map.get(0.5, 0.5)).toBe(-5);
    });

    it('handles very large values', () => {
      const grid = [[1000000, 2000000], [2000000, 3000000]];
      const map = new BilinearMap2(grid);
      expect(map.get(0.5, 0.5)).toBe(2000000);
    });

    it('handles fractional grid values', () => {
      const grid = [[0.1, 0.2], [0.3, 0.4]];
      const map = new BilinearMap2(grid);
      expect(map.get(0.5, 0.5)).toBeCloseTo(0.25);
    });
  });

  describe('custom cell size', () => {
    it('uses custom cell size for interpolation', () => {
      const grid = [
        [0, 10],
        [20, 30]
      ];
      const map = new BilinearMap2(grid, 2.0);
      expect(map.get(1, 1)).toBe(15);
      expect(map.get(2, 0)).toBe(10);
      expect(map.get(0, 2)).toBe(20);
    });

    it('clamps coordinates based on custom cell size', () => {
      const grid = [[0, 10], [20, 30]];
      const map = new BilinearMap2(grid, 2.0);
      expect(map.get(10, 10)).toBe(30);
    });

    it('should handle getWidth and getHeight', () => {
      const grid = [[0, 10, 20], [30, 40, 50]];
      const map = new BilinearMap2(grid, 1.0);
      expect(map.getWidth()).toBe(3);
      expect(map.getHeight()).toBe(2);
    });
  });

  it('should handle 1x1 grid', () => {
    const grid = [[7]];
    const map = new BilinearMap2(grid);
    expect(map.get(0, 0)).toBe(7);
  });

  it('should handle 3x1 grid', () => {
    const grid = [[10, 20, 30]];
    const map = new BilinearMap2(grid);
    expect(map.get(0, 0)).toBe(10);
    expect(map.get(1, 0)).toBe(20);
  });
  it('should handle getWidth and getHeight', () => {
    const grid = [[10, 20], [30, 40]];
    const map = new BilinearMap2(grid);
    expect(map.getWidth()).toBe(2);
    expect(map.getHeight()).toBe(2);
  });
  it('should handle single cell grid', () => {
    const grid = [[42]];
    const map = new BilinearMap2(grid);
    expect(map.get(0, 0)).toBe(42);
    expect(map.getWidth()).toBe(1);
    expect(map.getHeight()).toBe(1);
  });
  it('should handle get at grid positions', () => {
    const grid = [[0, 10], [20, 30]];
    const map = new BilinearMap2(grid);
    expect(map.get(0, 0)).toBe(0);
    expect(map.get(1, 0)).toBe(10);
    expect(map.get(0, 1)).toBe(20);
    expect(map.get(1, 1)).toBe(30);
  });
});
