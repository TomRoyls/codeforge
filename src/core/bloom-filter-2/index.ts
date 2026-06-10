type HashFunction = (input: string) => number;

export class BloomFilter2 {
  private readonly bitArray: Uint8Array;
  private readonly bitCount: number;
  private readonly hashFunctions: HashFunction[];
  private itemCount: number;

  constructor(
    expectedItems: number,
    falsePositiveRate: number
  ) {
    this.bitCount = this.calculateBitCount(expectedItems, falsePositiveRate);
    const byteCount = Math.ceil(this.bitCount / 8);
    this.bitArray = new Uint8Array(byteCount);
    this.itemCount = 0;
    const hashCount = this.calculateHashCount(expectedItems, this.bitCount);
    this.hashFunctions = this.createHashFunctions(hashCount);
  }

  add(item: string): void {
    for (const hashFn of this.hashFunctions) {
      const hash = hashFn(item);
      const position = ((hash % this.bitCount) + this.bitCount) % this.bitCount;
      this.setBit(position);
    }
    this.itemCount++;
  }

  has(item: string): boolean {
    for (const hashFn of this.hashFunctions) {
      const hash = hashFn(item);
      const position = ((hash % this.bitCount) + this.bitCount) % this.bitCount;
      if (!this.getBit(position)) {
        return false;
      }
    }
    return true;
  }

  contains(item: string): boolean {
    return this.has(item);
  }

  get size(): number {
    return this.itemCount;
  }

  isEmpty(): boolean {
    return this.itemCount === 0;
  }

  clear(): void {
    this.bitArray.fill(0);
    this.itemCount = 0;
  }

  get falsePositiveRate(): number {
    const k = this.hashFunctions.length;
    const n = this.itemCount;
    const m = this.bitCount;
    const exponent = (-k * n) / m;
    const probability = Math.pow(1 - Math.exp(exponent), k);
    return probability;
  }

  get expectedBits(): number {
    return this.bitCount;
  }

  private calculateBitCount(expectedItems: number, falsePositiveRate: number): number {
    const n = expectedItems;
    const p = falsePositiveRate;
    const m = -(n * Math.log(p)) / (Math.log(2) * Math.log(2));
    return Math.max(1, Math.ceil(m));
  }

  private calculateHashCount(expectedItems: number, bitCount: number): number {
    const n = expectedItems;
    const m = bitCount;
    const k = (m / n) * Math.log(2);
    return Math.max(1, Math.ceil(k));
  }

  private createHashFunctions(count: number): HashFunction[] {
    const hashFunctions: HashFunction[] = [];

    for (let i = 0; i < count; i++) {
      hashFunctions.push((input: string) => this.murmurHash(input, i));
    }

    return hashFunctions;
  }

  private murmurHash(input: string, seed: number): number {
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;
    const r1 = 15;
    const r2 = 13;
    const m = 5;
    const n = 0xe6546b64;

    let hash = seed ^ input.length;

    for (let i = 0; i < input.length; i++) {
      let k = input.charCodeAt(i);
      k = this.multiply32(k, c1);
      k = this.rotl32(k, r1);
      k = this.multiply32(k, c2);

      hash = hash ^ k;
      hash = this.rotl32(hash, r2);
      hash = hash * m + n;
    }

    hash = hash ^ input.length;
    hash = hash ^ (hash >>> 16);
    hash = hash * 0x85ebca6b;
    hash = hash ^ (hash >>> 13);
    hash = hash * 0xc2b2ae35;
    hash = hash ^ (hash >>> 16);

    return hash >>> 0;
  }

  private multiply32(a: number, b: number): number {
    return ((a & 0xffff) * b + (((a >>> 16) * b) & 0xffff) << 16) >>> 0;
  }

  private rotl32(x: number, n: number): number {
    return ((x << n) | (x >>> (32 - n))) >>> 0;
  }

  private setBit(position: number): void {
    const byteIndex = Math.floor(position / 8);
    const bitIndex = position % 8;
    const mask = 1 << bitIndex;
    this.bitArray[byteIndex] = (this.bitArray[byteIndex] ?? 0) | mask;
  }

  private getBit(position: number): boolean {
    const byteIndex = Math.floor(position / 8);
    const bitIndex = position % 8;
    const mask = 1 << bitIndex;
    return ((this.bitArray[byteIndex] ?? 0) & mask) !== 0;
  }

  toString(): string {
    return `${BloomFilter2}({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'BloomFilter2'
  }

  includes(item: string): boolean {
    return this.contains(item)
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
