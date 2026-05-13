export class MinHash2 {
  private numHashes: number;
  private seed: number;
  private signature: number[];
  private items: Set<string>;

  constructor(numHashes: number = 128, seed: number = 42) {
    this.numHashes = numHashes;
    this.seed = seed;
    this.signature = new Array(numHashes).fill(Infinity);
    this.items = new Set();
  }

  private hash(item: string, i: number): number {
    let hash = this.seed + i;
    for (let j = 0; j < item.length; j++) {
      hash = ((hash * 31) + item.charCodeAt(j)) % 2147483647;
    }
    return Math.abs(hash);
  }

  add(item: string): void {
    if (this.items.has(item)) {
      return;
    }
    this.items.add(item);
    for (let i = 0; i < this.numHashes; i++) {
      const h = this.hash(item, i);
      if (this.signature[i] !== undefined && h < this.signature[i]!) {
        this.signature[i] = h!;
      }
    }
  }

  addAll(items: string[]): void {
    for (let i = 0; i < items.length; i++) {
      this.add(items[i]!);
    }
  }

  similarity(other: MinHash2): number {
    if (this.numHashes !== other.numHashes) {
      throw new Error('MinHash instances must have same number of hashes');
    }
    let matchCount = 0;
    for (let i = 0; i < this.numHashes; i++) {
      if (this.signature[i] === other.signature[i]) {
        matchCount++;
      }
    }
    return matchCount / this.numHashes;
  }

  size(): number {
    return this.items.size;
  }

  clear(): void {
    this.signature = new Array(this.numHashes).fill(Infinity);
    this.items.clear();
  }

  getSignature(): number[] {
    return this.signature;
  }
}
