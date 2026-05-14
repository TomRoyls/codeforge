export class GodelNumber2 {
  static isPrime(n: bigint): boolean {
    if (n < 2n) return false;
    if (n === 2n) return true;
    if (n % 2n === 0n) return false;

    const sqrt = this.sqrt(n);
    for (let i = 3n; i <= sqrt; i += 2n) {
      if (n % i === 0n) return false;
    }
    return true;
  }

  private static sqrt(n: bigint): bigint {
    if (n < 0n) throw new Error('Square root of negative number');
    if (n < 2n) return n;

    let x = n;
    let y = (x + 1n) / 2n;

    while (y < x) {
      x = y;
      y = (x + n / x) / 2n;
    }

    return x;
  }

  static nthPrime(n: number): bigint {
    if (n < 1) throw new Error('n must be at least 1');

    let count = 0;
    let candidate = 2n;

    while (count < n) {
      if (this.isPrime(candidate)) {
        count++;
        if (count === n) return candidate;
      }
      candidate++;
    }

    return candidate;
  }

  static primeFactorization(n: bigint): Map<bigint, number> {
    if (n === 0n) throw new Error('Cannot factorize zero');
    if (n === 1n) return new Map<bigint, number>();

    const factors = new Map<bigint, number>();
    let remaining = n;

    let primeIndex = 1;
    while (remaining > 1n) {
      const prime = this.nthPrime(primeIndex);
      let exponent = 0;

      while (remaining % prime === 0n) {
        exponent++;
        remaining /= prime;
      }

      if (exponent > 0) {
        factors.set(prime, exponent);
      }

      primeIndex++;
    }

    return factors;
  }

  static encode(sequence: number[]): bigint {
    if (sequence.length === 0) return 1n;

    let result = 1n;

    for (let i = 0; i < sequence.length; i++) {
      const prime = this.nthPrime(i + 1);
      const exponent = BigInt(sequence[i]!);
      result *= prime ** exponent;
    }

    return result;
  }

  static decode(n: bigint): number[] {
    if (n === 1n) return [];
    if (n === 0n) throw new Error('Cannot decode zero');

    const factors = this.primeFactorization(n);
    const result: number[] = [];

    let primeIndex = 1;
    let maxPrime = 2n;

    for (const [prime] of factors) {
      if (prime > maxPrime) {
        maxPrime = prime;
      }
    }

    while (true) {
      const prime = this.nthPrime(primeIndex);
      const exponent = factors.get(prime);

      if (exponent !== undefined) {
        result.push(exponent);
      } else if (prime > maxPrime) {
        break;
      } else {
        result.push(0);
      }

      primeIndex++;
    }

    return result;
  }
}
