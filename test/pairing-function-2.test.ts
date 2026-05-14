import { describe, it, expect } from 'vitest';
import { PairingFunction2 } from '../src/core/pairing-function-2/index.js';

describe('PairingFunction2', () => {
  describe('cantorPair and cantorUnpair', () => {
    it('should encode and decode (0, 0) correctly', () => {
      const z = PairingFunction2.cantorPair(0, 0);
      expect(z).toBe(0n);
      const [x, y] = PairingFunction2.cantorUnpair(z);
      expect(x).toBe(0);
      expect(y).toBe(0);
    });

    it('should encode and decode (1, 0) correctly', () => {
      const z = PairingFunction2.cantorPair(1, 0);
      const [x, y] = PairingFunction2.cantorUnpair(z);
      expect(x).toBe(1);
      expect(y).toBe(0);
    });

    it('should encode and decode (0, 1) correctly', () => {
      const z = PairingFunction2.cantorPair(0, 1);
      const [x, y] = PairingFunction2.cantorUnpair(z);
      expect(x).toBe(0);
      expect(y).toBe(1);
    });

    it('should encode and decode (5, 7) correctly', () => {
      const z = PairingFunction2.cantorPair(5, 7);
      const [x, y] = PairingFunction2.cantorUnpair(z);
      expect(x).toBe(5);
      expect(y).toBe(7);
    });

    it('should encode and decode (100, 200) correctly', () => {
      const z = PairingFunction2.cantorPair(100, 200);
      const [x, y] = PairingFunction2.cantorUnpair(z);
      expect(x).toBe(100);
      expect(y).toBe(200);
    });

    it('should encode and decode (1000, 1000) correctly', () => {
      const z = PairingFunction2.cantorPair(1000, 1000);
      const [x, y] = PairingFunction2.cantorUnpair(z);
      expect(x).toBe(1000);
      expect(y).toBe(1000);
    });

    it('should handle negative numbers correctly', () => {
      expect(() => PairingFunction2.cantorPair(-5, 3)).toThrow();
      expect(() => PairingFunction2.cantorUnpair(-1n)).toThrow();
    });

    it('should encode and decode large numbers correctly', () => {
      const z = PairingFunction2.cantorPair(50000, 60000);
      const [x, y] = PairingFunction2.cantorUnpair(z);
      expect(x).toBe(50000);
      expect(y).toBe(60000);
    });

    it('should return BigInt from cantorPair', () => {
      const z = PairingFunction2.cantorPair(10, 20);
      expect(typeof z).toBe('bigint');
    });

    it('should return array of numbers from cantorUnpair', () => {
      const result = PairingFunction2.cantorUnpair(100n);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('number');
    });
  });

  describe('szudzikPair and szudzikUnpair', () => {
    it('should encode and decode (0, 0) correctly', () => {
      const z = PairingFunction2.szudzikPair(0, 0);
      expect(z).toBe(0n);
      const [x, y] = PairingFunction2.szudzikUnpair(z);
      expect(x).toBe(0);
      expect(y).toBe(0);
    });

    it('should encode and decode (1, 0) correctly', () => {
      const z = PairingFunction2.szudzikPair(1, 0);
      expect(z).toBe(2n);
      const [x, y] = PairingFunction2.szudzikUnpair(z);
      expect(x).toBe(1);
      expect(y).toBe(0);
    });

    it('should encode and decode (0, 1) correctly', () => {
      const z = PairingFunction2.szudzikPair(0, 1);
      expect(z).toBe(1n);
      const [x, y] = PairingFunction2.szudzikUnpair(z);
      expect(x).toBe(0);
      expect(y).toBe(1);
    });

    it('should encode and decode (5, 7) correctly', () => {
      const z = PairingFunction2.szudzikPair(5, 7);
      const [x, y] = PairingFunction2.szudzikUnpair(z);
      expect(x).toBe(5);
      expect(y).toBe(7);
    });

    it('should encode and decode (7, 5) correctly', () => {
      const z = PairingFunction2.szudzikPair(7, 5);
      const [x, y] = PairingFunction2.szudzikUnpair(z);
      expect(x).toBe(7);
      expect(y).toBe(5);
    });

    it('should encode and decode (100, 200) correctly', () => {
      const z = PairingFunction2.szudzikPair(100, 200);
      const [x, y] = PairingFunction2.szudzikUnpair(z);
      expect(x).toBe(100);
      expect(y).toBe(200);
    });

    it('should encode and decode (1000, 1000) correctly', () => {
      const z = PairingFunction2.szudzikPair(1000, 1000);
      const [x, y] = PairingFunction2.szudzikUnpair(z);
      expect(x).toBe(1000);
      expect(y).toBe(1000);
    });

    it('should handle negative numbers correctly', () => {
      expect(() => PairingFunction2.szudzikPair(-5, 3)).toThrow();
      expect(() => PairingFunction2.szudzikUnpair(-1n)).toThrow();
    });

    it('should encode and decode large numbers correctly', () => {
      const z = PairingFunction2.szudzikPair(50000, 60000);
      const [x, y] = PairingFunction2.szudzikUnpair(z);
      expect(x).toBe(50000);
      expect(y).toBe(60000);
    });

    it('should return BigInt from szudzikPair', () => {
      const z = PairingFunction2.szudzikPair(10, 20);
      expect(typeof z).toBe('bigint');
    });

    it('should return array of numbers from szudzikUnpair', () => {
      const result = PairingFunction2.szudzikUnpair(100n);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('number');
    });
  });

  describe('elegantPair and elegantUnpair', () => {
    it('should encode and decode (0, 0) correctly', () => {
      const z = PairingFunction2.elegantPair(0, 0);
      expect(z).toBe(0n);
      const [x, y] = PairingFunction2.elegantUnpair(z);
      expect(x).toBe(0);
      expect(y).toBe(0);
    });

    it('should encode and decode (1, 0) correctly', () => {
      const z = PairingFunction2.elegantPair(1, 0);
      expect(z).toBe(2n);
      const [x, y] = PairingFunction2.elegantUnpair(z);
      expect(x).toBe(1);
      expect(y).toBe(0);
    });

    it('should encode and decode (0, 1) correctly', () => {
      const z = PairingFunction2.elegantPair(0, 1);
      expect(z).toBe(1n);
      const [x, y] = PairingFunction2.elegantUnpair(z);
      expect(x).toBe(0);
      expect(y).toBe(1);
    });

    it('should encode and decode (5, 7) correctly', () => {
      const z = PairingFunction2.elegantPair(5, 7);
      const [x, y] = PairingFunction2.elegantUnpair(z);
      expect(x).toBe(5);
      expect(y).toBe(7);
    });

    it('should encode and decode (7, 5) correctly', () => {
      const z = PairingFunction2.elegantPair(7, 5);
      const [x, y] = PairingFunction2.elegantUnpair(z);
      expect(x).toBe(7);
      expect(y).toBe(5);
    });

    it('should encode and decode (100, 200) correctly', () => {
      const z = PairingFunction2.elegantPair(100, 200);
      const [x, y] = PairingFunction2.elegantUnpair(z);
      expect(x).toBe(100);
      expect(y).toBe(200);
    });

    it('should encode and decode (1000, 1000) correctly', () => {
      const z = PairingFunction2.elegantPair(1000, 1000);
      const [x, y] = PairingFunction2.elegantUnpair(z);
      expect(x).toBe(1000);
      expect(y).toBe(1000);
    });

    it('should handle negative numbers correctly', () => {
      expect(() => PairingFunction2.elegantPair(-5, 3)).toThrow();
      expect(() => PairingFunction2.elegantUnpair(-1n)).toThrow();
    });

    it('should encode and decode large numbers correctly', () => {
      const z = PairingFunction2.elegantPair(50000, 60000);
      const [x, y] = PairingFunction2.elegantUnpair(z);
      expect(x).toBe(50000);
      expect(y).toBe(60000);
    });

    it('should return BigInt from elegantPair', () => {
      const z = PairingFunction2.elegantPair(10, 20);
      expect(typeof z).toBe('bigint');
    });

    it('should return array of numbers from elegantUnpair', () => {
      const result = PairingFunction2.elegantUnpair(100n);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('number');
    });
  });

  describe('isPairable', () => {
    it('should return true for valid non-negative numbers', () => {
      expect(PairingFunction2.isPairable(0, 0)).toBe(true);
      expect(PairingFunction2.isPairable(1, 1)).toBe(true);
      expect(PairingFunction2.isPairable(100, 200)).toBe(true);
    });



    it('should return false for negative numbers', () => {
      expect(PairingFunction2.isPairable(-1, 0)).toBe(false);
      expect(PairingFunction2.isPairable(0, -1)).toBe(false);
      expect(PairingFunction2.isPairable(-100, -200)).toBe(false);
    });

    it('should return false for numbers exceeding safe integer limits', () => {
      const beyondMax = Number.MAX_SAFE_INTEGER + 1;
      expect(PairingFunction2.isPairable(beyondMax, 0)).toBe(false);
      expect(PairingFunction2.isPairable(0, beyondMax)).toBe(false);
    });

    it('should return false for numbers below safe integer limits', () => {
      const belowMin = Number.MIN_SAFE_INTEGER - 1;
      expect(PairingFunction2.isPairable(belowMin, 0)).toBe(false);
      expect(PairingFunction2.isPairable(0, belowMin)).toBe(false);
    });
  });

  describe('edge cases and consistency', () => {
    it('should handle multiple consecutive roundtrips consistently for Cantor', () => {
      const [x1, y1] = [123, 456];
      const z1 = PairingFunction2.cantorPair(x1, y1);
      const [x2, y2] = PairingFunction2.cantorUnpair(z1);
      const z2 = PairingFunction2.cantorPair(x2, y2);
      const [x3, y3] = PairingFunction2.cantorUnpair(z2);
      expect(x3).toBe(x1);
      expect(y3).toBe(y1);
    });

    it('should handle multiple consecutive roundtrips consistently for Szudzik', () => {
      const [x1, y1] = [123, 456];
      const z1 = PairingFunction2.szudzikPair(x1, y1);
      const [x2, y2] = PairingFunction2.szudzikUnpair(z1);
      const z2 = PairingFunction2.szudzikPair(x2, y2);
      const [x3, y3] = PairingFunction2.szudzikUnpair(z2);
      expect(x3).toBe(x1);
      expect(y3).toBe(y1);
    });

    it('should handle multiple consecutive roundtrips consistently for Elegant', () => {
      const [x1, y1] = [123, 456];
      const z1 = PairingFunction2.elegantPair(x1, y1);
      const [x2, y2] = PairingFunction2.elegantUnpair(z1);
      const z2 = PairingFunction2.elegantPair(x2, y2);
      const [x3, y3] = PairingFunction2.elegantUnpair(z2);
      expect(x3).toBe(x1);
      expect(y3).toBe(y1);
    });

    it('should handle symmetric pairs (x, x) consistently across all functions', () => {
      const pairs = [0, 1, 10, 100, 1000];
      for (const n of pairs) {
        const cantorZ = PairingFunction2.cantorPair(n, n);
        const [cantorX, cantorY] = PairingFunction2.cantorUnpair(cantorZ);
        expect(cantorX).toBe(n);
        expect(cantorY).toBe(n);

        const szudzikZ = PairingFunction2.szudzikPair(n, n);
        const [szudzikX, szudzikY] = PairingFunction2.szudzikUnpair(szudzikZ);
        expect(szudzikX).toBe(n);
        expect(szudzikY).toBe(n);

        const elegantZ = PairingFunction2.elegantPair(n, n);
        const [elegantX, elegantY] = PairingFunction2.elegantUnpair(elegantZ);
        expect(elegantX).toBe(n);
        expect(elegantY).toBe(n);
      }
    });

    it('should handle all zeros edge case', () => {
      const cantorZ = PairingFunction2.cantorPair(0, 0);
      const [cantorX, cantorY] = PairingFunction2.cantorUnpair(cantorZ);
      expect(cantorX).toBe(0);
      expect(cantorY).toBe(0);

      const szudzikZ = PairingFunction2.szudzikPair(0, 0);
      const [szudzikX, szudzikY] = PairingFunction2.szudzikUnpair(szudzikZ);
      expect(szudzikX).toBe(0);
      expect(szudzikY).toBe(0);

      const elegantZ = PairingFunction2.elegantPair(0, 0);
      const [elegantX, elegantY] = PairingFunction2.elegantUnpair(elegantZ);
      expect(elegantX).toBe(0);
      expect(elegantY).toBe(0);
    });

    it('should produce unique encodings for different pairs', () => {
      const pairs = [[0, 0], [0, 1], [1, 0], [1, 1], [2, 3], [3, 2]];
      const cantorCodes = new Set<bigint>();
      const szudzikCodes = new Set<bigint>();
      const elegantCodes = new Set<bigint>();

      for (const [x, y] of pairs) {
        cantorCodes.add(PairingFunction2.cantorPair(x, y));
        szudzikCodes.add(PairingFunction2.szudzikPair(x, y));
        elegantCodes.add(PairingFunction2.elegantPair(x, y));
      }

      expect(cantorCodes.size).toBe(pairs.length);
      expect(szudzikCodes.size).toBe(pairs.length);
      expect(elegantCodes.size).toBe(pairs.length);
    });

    it('should maintain function consistency: all roundtrip functions work correctly', () => {
      const testCases = [
        [0, 0],
        [1, 0],
        [0, 1],
        [5, 7],
        [7, 5],
        [100, 200],
        [200, 100],
        [1000, 1000],
      ];

      for (const [x, y] of testCases) {
        const cantorZ = PairingFunction2.cantorPair(x, y);
        const [cantorX, cantorY] = PairingFunction2.cantorUnpair(cantorZ);
        expect(cantorX).toBe(x);
        expect(cantorY).toBe(y);

        const szudzikZ = PairingFunction2.szudzikPair(x, y);
        const [szudzikX, szudzikY] = PairingFunction2.szudzikUnpair(szudzikZ);
        expect(szudzikX).toBe(x);
        expect(szudzikY).toBe(y);

        const elegantZ = PairingFunction2.elegantPair(x, y);
        const [elegantX, elegantY] = PairingFunction2.elegantUnpair(elegantZ);
        expect(elegantX).toBe(x);
        expect(elegantY).toBe(y);
      }
    });
  });
});
