import { describe, it, expect } from 'vitest';
import { GodelNumber2 } from '../../src/core/godel-number-2/index.js';

// ─── isPrime() ───

describe('GodelNumber2.isPrime', () => {
  it('returns true for prime numbers', () => {
    expect(GodelNumber2.isPrime(2n)).toBe(true);
    expect(GodelNumber2.isPrime(3n)).toBe(true);
    expect(GodelNumber2.isPrime(5n)).toBe(true);
    expect(GodelNumber2.isPrime(7n)).toBe(true);
    expect(GodelNumber2.isPrime(11n)).toBe(true);
    expect(GodelNumber2.isPrime(13n)).toBe(true);
  });

  it('returns false for non-prime numbers', () => {
    expect(GodelNumber2.isPrime(4n)).toBe(false);
    expect(GodelNumber2.isPrime(6n)).toBe(false);
    expect(GodelNumber2.isPrime(8n)).toBe(false);
    expect(GodelNumber2.isPrime(9n)).toBe(false);
    expect(GodelNumber2.isPrime(10n)).toBe(false);
  });

  it('returns false for 0 and 1', () => {
    expect(GodelNumber2.isPrime(0n)).toBe(false);
    expect(GodelNumber2.isPrime(1n)).toBe(false);
  });

  it('returns false for negative numbers', () => {
    expect(GodelNumber2.isPrime(-1n)).toBe(false);
    expect(GodelNumber2.isPrime(-7n)).toBe(false);
  });

  it('returns false for even numbers > 2', () => {
    expect(GodelNumber2.isPrime(100n)).toBe(false);
    expect(GodelNumber2.isPrime(1000n)).toBe(false);
  });
});

// ─── nthPrime() ───

describe('GodelNumber2.nthPrime', () => {
  it('returns first few primes correctly', () => {
    expect(GodelNumber2.nthPrime(1)).toBe(2n);
    expect(GodelNumber2.nthPrime(2)).toBe(3n);
    expect(GodelNumber2.nthPrime(3)).toBe(5n);
    expect(GodelNumber2.nthPrime(4)).toBe(7n);
    expect(GodelNumber2.nthPrime(5)).toBe(11n);
    expect(GodelNumber2.nthPrime(6)).toBe(13n);
  });

  it('throws for n < 1', () => {
    expect(() => GodelNumber2.nthPrime(0)).toThrow('n must be at least 1');
    expect(() => GodelNumber2.nthPrime(-1)).toThrow('n must be at least 1');
  });

  it('returns larger primes', () => {
    expect(GodelNumber2.nthPrime(10)).toBe(29n);
    expect(GodelNumber2.nthPrime(25)).toBe(97n);
  });
});

// ─── primeFactorization() ───

describe('GodelNumber2.primeFactorization', () => {
  it('factorizes a simple number', () => {
    const factors = GodelNumber2.primeFactorization(12n);
    expect(factors.get(2n)).toBe(2);
    expect(factors.get(3n)).toBe(1);
    expect(factors.size).toBe(2);
  });

  it('factorizes a prime number', () => {
    const factors = GodelNumber2.primeFactorization(7n);
    expect(factors.get(7n)).toBe(1);
    expect(factors.size).toBe(1);
  });

  it('returns empty map for 1', () => {
    const factors = GodelNumber2.primeFactorization(1n);
    expect(factors.size).toBe(0);
  });

  it('throws for 0', () => {
    expect(() => GodelNumber2.primeFactorization(0n)).toThrow('Cannot factorize zero');
  });

  it('factorizes a power of 2', () => {
    const factors = GodelNumber2.primeFactorization(64n);
    expect(factors.get(2n)).toBe(6);
    expect(factors.size).toBe(1);
  });

  it('factorizes a larger composite', () => {
    const factors = GodelNumber2.primeFactorization(360n);
    expect(factors.get(2n)).toBe(3);
    expect(factors.get(3n)).toBe(2);
    expect(factors.get(5n)).toBe(1);
  });
});

// ─── encode() ───

describe('GodelNumber2.encode', () => {
  it('encodes empty sequence as 1', () => {
    expect(GodelNumber2.encode([])).toBe(1n);
  });

  it('encodes a simple sequence', () => {
    // [1,2,3] -> 2^1 * 3^2 * 5^3 = 2 * 9 * 125 = 2250
    expect(GodelNumber2.encode([1, 2, 3])).toBe(2250n);
  });

  it('encodes sequence with zeros', () => {
    // [0,1,0] -> 2^0 * 3^1 * 5^0 = 1 * 3 * 1 = 3
    expect(GodelNumber2.encode([0, 1, 0])).toBe(3n);
  });

  it('encodes single element sequence', () => {
    // [3] -> 2^3 = 8
    expect(GodelNumber2.encode([3])).toBe(8n);
  });

  it('encodes [1,1,1]', () => {
    // 2^1 * 3^1 * 5^1 = 30
    expect(GodelNumber2.encode([1, 1, 1])).toBe(30n);
  });
});

// ─── decode() ───

describe('GodelNumber2.decode', () => {
  it('decodes 1 as empty sequence', () => {
    expect(GodelNumber2.decode(1n)).toEqual([]);
  });

  it('decodes a simple encoded number', () => {
    // 2250 = [1,2,3]
    expect(GodelNumber2.decode(2250n)).toEqual([1, 2, 3]);
  });

  it('throws for 0', () => {
    expect(() => GodelNumber2.decode(0n)).toThrow('Cannot decode zero');
  });

  it('decodes [0,1,0] = 3', () => {
    expect(GodelNumber2.decode(3n)).toEqual([0, 1]);
  });

  it('decodes [3] = 8', () => {
    expect(GodelNumber2.decode(8n)).toEqual([3]);
  });

  it('decodes [1,1,1] = 30', () => {
    expect(GodelNumber2.decode(30n)).toEqual([1, 1, 1]);
  });
});

// ─── encode/decode roundtrip ───

describe('GodelNumber2 encode/decode roundtrip', () => {
  it('round-trips for [1, 2, 3]', () => {
    const original = [1, 2, 3];
    const encoded = GodelNumber2.encode(original);
    expect(GodelNumber2.decode(encoded)).toEqual(original);
  });

  it('round-trips for [5, 0, 2]', () => {
    const original = [5, 0, 2];
    const encoded = GodelNumber2.encode(original);
    expect(GodelNumber2.decode(encoded)).toEqual(original);
  });

  it('round-trips for empty sequence', () => {
    const original: number[] = [];
    const encoded = GodelNumber2.encode(original);
    expect(GodelNumber2.decode(encoded)).toEqual(original);
  });

  it('round-trips for single element', () => {
    const original = [10];
    const encoded = GodelNumber2.encode(original);
    expect(GodelNumber2.decode(encoded)).toEqual(original);
  });
});
