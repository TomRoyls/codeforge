export class PairingFunction2 {
  static cantorPair(x: number, y: number): bigint {
    if (x < 0 || y < 0) {
      throw new Error("Cantor pairing requires non-negative integers");
    }
    const xBig = BigInt(x);
    const yBig = BigInt(y);
    const sum = xBig + yBig;
    return (sum * (sum + 1n)) / 2n + yBig;
  }

  static cantorUnpair(z: bigint): [number, number] {
    if (z < 0n) {
      throw new Error("Cantor unpairing requires non-negative integer");
    }
    const w = PairingFunction2.integerSqrt(8n * z + 1n);
    const t = (w - 1n) / 2n;
    const y = z - (t * (t + 1n)) / 2n;
    const x = t - y;
    return [Number(x), Number(y)];
  }

  static szudzikPair(x: number, y: number): bigint {
    if (x < 0 || y < 0) {
      throw new Error("Szudzik pairing requires non-negative integers");
    }
    const xBig = BigInt(x);
    const yBig = BigInt(y);
    if (xBig < yBig) {
      return yBig * yBig + xBig;
    } else {
      return xBig * xBig + xBig + yBig;
    }
  }

  static szudzikUnpair(z: bigint): [number, number] {
    if (z < 0n) {
      throw new Error("Szudzik unpairing requires non-negative integer");
    }
    const s = PairingFunction2.integerSqrt(z);
    const sSquared = s * s;
    const diff = z - sSquared;
    let x: bigint;
    let y: bigint;
    if (diff < s) {
      x = diff;
      y = s;
    } else {
      x = s;
      y = diff - s;
    }
    return [Number(x), Number(y)];
  }

  static elegantPair(x: number, y: number): bigint {
    if (x < 0 || y < 0) {
      throw new Error("Elegant pairing requires non-negative integers");
    }
    const xBig = BigInt(x);
    const yBig = BigInt(y);
    if (xBig >= yBig) {
      return xBig * xBig + xBig + yBig;
    } else {
      return yBig * yBig + xBig;
    }
  }

  static elegantUnpair(z: bigint): [number, number] {
    if (z < 0n) {
      throw new Error("Elegant unpairing requires non-negative integer");
    }
    const e = PairingFunction2.integerSqrt(z);
    const eSquared = e * e;
    const diff = z - eSquared;
    let x: bigint;
    let y: bigint;
    if (diff < e) {
      x = diff;
      y = e;
    } else {
      x = e;
      y = diff - e;
    }
    return [Number(x), Number(y)];
  }

  static isPairable(x: number, y: number): boolean {
    const safeIntMax = Number.MAX_SAFE_INTEGER;
    return x >= 0 && x <= safeIntMax && y >= 0 && y <= safeIntMax;
  }

  private static integerSqrt(n: bigint): bigint {
    if (n < 0n) {
      throw new Error("Square root of negative number");
    }
    if (n < 2n) {
      return n;
    }
    let x = n;
    let y = (x + 1n) / 2n;
    while (y < x) {
      x = y;
      y = (x + n / x) / 2n;
    }
    return x;
  }

  toString(): string {
    return `PairingFunction2()`
  }
}
