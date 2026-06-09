export class ProbabilisticSketch {
  private table: number[][];
  private width: number;
  private depth: number;
  private _itemCount: number;
  private seeds: number[];

  constructor(width: number = 1000, depth: number = 5) {
    this.width = width;
    this.depth = depth;
    this._itemCount = 0;
    
    this.table = Array.from({ length: depth }, () => new Array(width).fill(0));
    this.seeds = Array.from({ length: depth }, (_, i) => 1000 + i * 10000 + width + depth);
  }

  add(item: string | number, count: number = 1): void {
    for (let i = 0; i < this.depth; i++) {
      const hash = this.hash(item, this.seeds[i]!);
      const index = ((hash % this.width) + this.width) % this.width;
      this.table[i]![index]! += count;
    }
    this._itemCount += count;
  }

  private hash(item: string | number, seed: number): number {
    const str = typeof item === 'string' ? `string:${item}` : `number:${item}`;
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return (hash >>> 0);
  }

  estimate(item: string | number): number {
    let minCount = Infinity;
    for (let i = 0; i < this.depth; i++) {
      const hash = this.hash(item, this.seeds[i]!);
      const index = ((hash % this.width) + this.width) % this.width;
      minCount = Math.min(minCount, this.table[i]![index]!);
    }
    return minCount;
  }

  merge(other: ProbabilisticSketch): void {
    if (this.width !== other.width || this.depth !== other.depth) {
      throw new Error('Cannot merge sketches with different dimensions');
    }
    
    const otherTable = other['table'] as number[][];
    const otherItemCount = other['_itemCount'] as number;
    
    for (let i = 0; i < this.depth; i++) {
      for (let j = 0; j < this.width; j++) {
        this.table[i]![j]! += otherTable[i]![j]!;
      }
    }
    this._itemCount += otherItemCount;
  }

  reset(): void {
    for (let i = 0; i < this.depth; i++) {
      this.table[i]!.fill(0);
    }
    this._itemCount = 0;
  }

  get itemCount(): number {
    return this._itemCount;
  }

  getErrorRate(): number {
    return 2 / this.width;
  }

  getConfidence(): number {
    return 1 - Math.exp(-this.depth);
  }
}
