export class ProbabilisticSet2<T> {
  private bits: Uint8Array;
  private count: number;
  private numHashes: number;
  private readonly falsePositiveRateValue: number;

  constructor(expectedSize: number = 1000, falsePositiveRate: number = 0.01) {
    const m = Math.ceil(-expectedSize * Math.log(falsePositiveRate) / Math.pow(Math.log(2), 2));
    this.bits = new Uint8Array(Math.ceil(m / 8));
    this.numHashes = Math.ceil(m / expectedSize * Math.log(2));
    this.count = 0;
    this.falsePositiveRateValue = falsePositiveRate;
  }

  private hash(value: T, seed: number): number {
    const str = String(value);
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return (hash >>> 0);
  }

  add(value: T): void {
    for (let i = 0; i < this.numHashes; i++) {
      const hashVal = ((this.hash(value, i) % (this.bits.length * 8)) + (this.bits.length * 8)) % (this.bits.length * 8);
      const byteIndex = Math.floor(hashVal / 8);
      const bitIndex = hashVal % 8;
      this.bits[byteIndex] = this.bits[byteIndex]! | (1 << bitIndex);
    }
    this.count++;
  }

  has(value: T): boolean {
    for (let i = 0; i < this.numHashes; i++) {
      const hashVal = ((this.hash(value, i) % (this.bits.length * 8)) + (this.bits.length * 8)) % (this.bits.length * 8);
      const byteIndex = Math.floor(hashVal / 8);
      const bitIndex = hashVal % 8;
      if ((this.bits[byteIndex]! & (1 << bitIndex)) === 0) {
        return false;
      }
    }
    return true;
  }

  get size(): number {
    return this.count;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  clear(): void {
    this.bits.fill(0);
    this.count = 0;
  }

  falsePositiveRate(): number {
    return this.falsePositiveRateValue;
  }

  bitCount(): number {
    return this.bits.length * 8;
  }

  toString(): string {
    return `ProbabilisticSet2({ size: ${this.size} })`
  }
}
