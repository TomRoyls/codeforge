export class BloomFilter {
  private bits: Uint8Array;
  private size: number;
  private hashCount: number;
  private itemCount: number;

  constructor(expectedItems: number = 1000, falsePositiveRate: number = 0.01) {
    this.itemCount = 0;
    this.size = Math.ceil(
      -(expectedItems * Math.log(falsePositiveRate)) / (Math.log(2) * Math.log(2))
    );
    this.hashCount = Math.ceil((this.size / expectedItems) * Math.log(2));
    this.bits = new Uint8Array(Math.ceil(this.size / 8));
  }

  add(item: string): void {
    const hashes = this.hash(item);
    for (let i = 0; i < hashes.length; i++) {
      const bitIndex = hashes[i]!;
      const byteIndex = Math.floor(bitIndex / 8);
      const bitOffset = bitIndex % 8;
      this.bits[byteIndex] |= 1 << bitOffset;
    }
    this.itemCount++;
  }

  mightContain(item: string): boolean {
    const hashes = this.hash(item);
    for (let i = 0; i < hashes.length; i++) {
      const bitIndex = hashes[i]!;
      const byteIndex = Math.floor(bitIndex / 8);
      const bitOffset = bitIndex % 8;
      if ((this.bits[byteIndex] & (1 << bitOffset)) === 0) {
        return false;
      }
    }
    return true;
  }

  getSize(): number {
    return this.size;
  }

  getBitCount(): number {
    return this.bits.length * 8;
  }

  getHashCount(): number {
    return this.hashCount;
  }

  getEstimatedFalsePositiveRate(): number {
    if (this.itemCount === 0) return 0;
    const m = this.size;
    const k = this.hashCount;
    const n = this.itemCount;
    return Math.pow(1 - Math.exp(-k * n / m), k);
  }

  clear(): void {
    this.bits.fill(0);
    this.itemCount = 0;
  }

  getTimeComplexity(): string {
    return `add: O(k), mightContain: O(k), where k=${this.hashCount} hash functions`;
  }

  private hash(item: string): number[] {
    const hashes: number[] = [];
    const str = item;
    let hash1 = 0;
    let hash2 = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash1 = (hash1 << 5) - hash1 + char;
      hash1 |= 0;
      hash2 = (hash2 << 5) - hash2 + char;
      hash2 |= 0;
    }

    hash1 = hash1 >>> 0;
    hash2 = hash2 >>> 0;

    for (let i = 0; i < this.hashCount; i++) {
      const combinedHash = hash1 + i * hash2;
      hashes.push(Math.abs(combinedHash % this.size));
    }

    return hashes;
  }
}
