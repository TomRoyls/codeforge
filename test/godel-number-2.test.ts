import { describe, it, expect } from 'vitest';
import { GodelNumber2 } from '../src/core/godel-number-2/index.js';

describe('GodelNumber2', () => {
  describe('encode', () => {
    it('should encode empty array as 1', () => {
      expect(GodelNumber2.encode([])).toBe(1n);
    });

    it('should encode single element', () => {
      expect(GodelNumber2.encode([0])).toBe(1n);
      expect(GodelNumber2.encode([1])).toBe(2n);
      expect(GodelNumber2.encode([2])).toBe(4n);
      expect(GodelNumber2.encode([3])).toBe(8n);
    });

    it('should encode multiple elements', () => {
      expect(GodelNumber2.encode([1, 1])).toBe(6n);
      expect(GodelNumber2.encode([1, 2])).toBe(18n);
      expect(GodelNumber2.encode([2, 1])).toBe(12n);
      expect(GodelNumber2.encode([0, 1, 1])).toBe(15n);
      expect(GodelNumber2.encode([1, 0, 1])).toBe(10n);
      expect(GodelNumber2.encode([2, 2, 2])).toBe(900n);
    });

    it('should handle zeros in sequence', () => {
      expect(GodelNumber2.encode([0, 0, 0])).toBe(1n);
      expect(GodelNumber2.encode([1, 0, 1])).toBe(10n);
      expect(GodelNumber2.encode([0, 1, 0, 1])).toBe(21n);
    });

    it('should handle large sequences', () => {
      expect(GodelNumber2.encode([1, 2, 3, 4, 5])).toBe(870037764750n);
    });

    it('should handle larger exponents', () => {
      expect(GodelNumber2.encode([10])).toBe(1024n);
      expect(GodelNumber2.encode([5, 3])).toBe(32n * 27n);
    });
  });

  describe('decode', () => {
    it('should decode 1 as empty array', () => {
      expect(GodelNumber2.decode(1n)).toEqual([]);
    });

    it('should throw error when decoding zero', () => {
      expect(() => GodelNumber2.decode(0n)).toThrow('Cannot decode zero');
    });

    it('should decode single element', () => {
      expect(GodelNumber2.decode(2n)).toEqual([1]);
      expect(GodelNumber2.decode(4n)).toEqual([2]);
      expect(GodelNumber2.decode(8n)).toEqual([3]);
    });

    it('should decode multiple elements', () => {
      expect(GodelNumber2.decode(6n)).toEqual([1, 1]);
      expect(GodelNumber2.decode(18n)).toEqual([1, 2]);
      expect(GodelNumber2.decode(12n)).toEqual([2, 1]);
      expect(GodelNumber2.decode(15n)).toEqual([0, 1, 1]);
      expect(GodelNumber2.decode(10n)).toEqual([1, 0, 1]);
    });

    it('should decode roundtrip', () => {
      const sequences = [
        [1],
        [2],
        [1, 1],
        [1, 2],
        [2, 1],
        [0, 1, 1],
        [1, 0, 1],
        [2, 2, 2],
        [1, 2, 3, 4, 5],
      ];

      for (const seq of sequences) {
        const encoded = GodelNumber2.encode(seq);
        const decoded = GodelNumber2.decode(encoded);
        expect(decoded).toEqual(seq);
      }
    });
  });

  describe('isPrime', () => {
    it('should return false for numbers less than 2', () => {
      expect(GodelNumber2.isPrime(0n)).toBe(false);
      expect(GodelNumber2.isPrime(1n)).toBe(false);
    });

    it('should return true for prime numbers', () => {
      expect(GodelNumber2.isPrime(2n)).toBe(true);
      expect(GodelNumber2.isPrime(3n)).toBe(true);
      expect(GodelNumber2.isPrime(5n)).toBe(true);
      expect(GodelNumber2.isPrime(7n)).toBe(true);
      expect(GodelNumber2.isPrime(11n)).toBe(true);
      expect(GodelNumber2.isPrime(13n)).toBe(true);
      expect(GodelNumber2.isPrime(17n)).toBe(true);
      expect(GodelNumber2.isPrime(19n)).toBe(true);
    });

    it('should return false for composite numbers', () => {
      expect(GodelNumber2.isPrime(4n)).toBe(false);
      expect(GodelNumber2.isPrime(6n)).toBe(false);
      expect(GodelNumber2.isPrime(8n)).toBe(false);
      expect(GodelNumber2.isPrime(9n)).toBe(false);
      expect(GodelNumber2.isPrime(10n)).toBe(false);
      expect(GodelNumber2.isPrime(12n)).toBe(false);
      expect(GodelNumber2.isPrime(15n)).toBe(false);
      expect(GodelNumber2.isPrime(21n)).toBe(false);
    });

    it('should handle larger numbers', () => {
      expect(GodelNumber2.isPrime(97n)).toBe(true);
      expect(GodelNumber2.isPrime(100n)).toBe(false);
      expect(GodelNumber2.isPrime(101n)).toBe(true);
    });
  });

  describe('nthPrime', () => {
    it('should return first prime', () => {
      expect(GodelNumber2.nthPrime(1)).toBe(2n);
    });

    it('should return subsequent primes', () => {
      expect(GodelNumber2.nthPrime(2)).toBe(3n);
      expect(GodelNumber2.nthPrime(3)).toBe(5n);
      expect(GodelNumber2.nthPrime(4)).toBe(7n);
      expect(GodelNumber2.nthPrime(5)).toBe(11n);
      expect(GodelNumber2.nthPrime(6)).toBe(13n);
      expect(GodelNumber2.nthPrime(7)).toBe(17n);
      expect(GodelNumber2.nthPrime(8)).toBe(19n);
      expect(GodelNumber2.nthPrime(9)).toBe(23n);
      expect(GodelNumber2.nthPrime(10)).toBe(29n);
    });

    it('should throw error for n less than 1', () => {
      expect(() => GodelNumber2.nthPrime(0)).toThrow('n must be at least 1');
      expect(() => GodelNumber2.nthPrime(-1)).toThrow('n must be at least 1');
    });

    it('should handle larger n values', () => {
      expect(GodelNumber2.nthPrime(20)).toBe(71n);
      expect(GodelNumber2.nthPrime(25)).toBe(97n);
    });
  });

  describe('primeFactorization', () => {
    it('should return empty map for 1', () => {
      const factors = GodelNumber2.primeFactorization(1n);
      expect(factors.size).toBe(0);
    });

    it('should throw error for 0', () => {
      expect(() => GodelNumber2.primeFactorization(0n)).toThrow('Cannot factorize zero');
    });

    it('should factorize prime numbers', () => {
      expect(GodelNumber2.primeFactorization(2n)).toEqual(new Map([[2n, 1]]));
      expect(GodelNumber2.primeFactorization(3n)).toEqual(new Map([[3n, 1]]));
      expect(GodelNumber2.primeFactorization(5n)).toEqual(new Map([[5n, 1]]));
      expect(GodelNumber2.primeFactorization(7n)).toEqual(new Map([[7n, 1]]));
    });

    it('should factorize composite numbers', () => {
      expect(GodelNumber2.primeFactorization(4n)).toEqual(new Map([[2n, 2]]));
      expect(GodelNumber2.primeFactorization(6n)).toEqual(new Map([[2n, 1], [3n, 1]]));
      expect(GodelNumber2.primeFactorization(8n)).toEqual(new Map([[2n, 3]]));
      expect(GodelNumber2.primeFactorization(12n)).toEqual(new Map([[2n, 2], [3n, 1]]));
      expect(GodelNumber2.primeFactorization(18n)).toEqual(new Map([[2n, 1], [3n, 2]]));
      expect(GodelNumber2.primeFactorization(60n)).toEqual(new Map([[2n, 2], [3n, 1], [5n, 1]]));
      expect(GodelNumber2.primeFactorization(900n)).toEqual(new Map([[2n, 2], [3n, 2], [5n, 2]]));
    });

    it('should factorize larger numbers', () => {
      expect(GodelNumber2.primeFactorization(100n)).toEqual(new Map([[2n, 2], [5n, 2]]));
      expect(GodelNumber2.primeFactorization(210n)).toEqual(new Map([[2n, 1], [3n, 1], [5n, 1], [7n, 1]]));
    });
  });

  describe('encode/decode edge cases', () => {
    it('should encode and decode sequence of zeros', () => {
      const encoded = GodelNumber2.encode([0, 0, 0]);
      expect(encoded).toBe(1n);
    });

    it('should encode single large exponent', () => {
      const encoded = GodelNumber2.encode([20]);
      const decoded = GodelNumber2.decode(encoded);
      expect(decoded).toEqual([20]);
    });

    it('should handle roundtrip with zeros in middle', () => {
      const seq = [3, 0, 2, 0, 1];
      const encoded = GodelNumber2.encode(seq);
      const decoded = GodelNumber2.decode(encoded);
      expect(decoded).toEqual(seq);
    });

    it('should handle roundtrip with trailing zeros lost', () => {
      const encoded = GodelNumber2.encode([1, 1, 0, 0]);
      const decoded = GodelNumber2.decode(encoded);
      expect(decoded).toEqual([1, 1]);
    });

    it('should handle prime factorization of power of 2', () => {
      expect(GodelNumber2.primeFactorization(1024n)).toEqual(new Map([[2n, 10]]));
    });

    it('should handle prime factorization of prime number', () => {
      expect(GodelNumber2.primeFactorization(13n)).toEqual(new Map([[13n, 1]]));
    });

    it('should handle encode empty array returns 1', () => {
      expect(GodelNumber2.encode([])).toBe(1n);
    });

    it('should handle decode of 1n returns empty', () => {
    expect(GodelNumber2.decode(1n)).toEqual([]);
  });

    it('should handle nthPrime', () => {
      expect(GodelNumber2.nthPrime(1)).toBe(2n);
      expect(GodelNumber2.nthPrime(2)).toBe(3n);
      expect(GodelNumber2.nthPrime(3)).toBe(5n);
    });

    it('should handle isPrime', () => {
      expect(GodelNumber2.isPrime(2n)).toBe(true);
      expect(GodelNumber2.isPrime(4n)).toBe(false);
      expect(GodelNumber2.isPrime(13n)).toBe(true);
    });
  });
});
