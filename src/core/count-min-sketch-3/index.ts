export class CountMinSketch3 {
  private readonly depth: number;
  private readonly seeds: number[];
  private table: number[][];
  private readonly width: number;

  constructor(width: number = 1000, depth: number = 5) {
    this.width = width;
    this.depth = depth;
    this.table = Array.from({ length: depth }, () => Array.from({ length: width }, () => 0));
    this.seeds = Array.from({ length: depth }, (_, i) => i + 1);
  }

  estimate(item: string): number {
    let min = Infinity;
    for (let i = 0; i < this.depth; i++) {
      const pos = this.getPosition(item, this.seeds[i]!);
      const count = this.table[i]![pos]!;
      if (count < min) {
        min = count;
      }
    }
    return min === Infinity ? 0 : min;
  }

  merge(other: CountMinSketch3): void {
    if (this.width !== other.width || this.depth !== other.depth) {
      throw new Error('Sketch dimensions must match for merge');
    }

    for (let i = 0; i < this.depth; i++) {
      for (let j = 0; j < this.width; j++) {
        this.table[i]![j]! += other.table[i]![j]!;
      }
    }
  }

  reset(): void {
    for (let i = 0; i < this.depth; i++) {
      for (let j = 0; j < this.width; j++) {
        this.table[i]![j]! = 0;
      }
    }
  }

  update(item: string, count: number = 1): void {
    for (let i = 0; i < this.depth; i++) {
      const pos = this.getPosition(item, this.seeds[i]!);
      this.table[i]![pos]! += count;
    }
  }

  private getPosition(item: string, seed: number): number {
    return this.hash(item, seed) % this.width;
  }

  private hash(item: string, seed: number): number {
    let h = seed;
    for (let i = 0; i < item.length; i++) {
      h = Math.imul(h, 31) + item.codePointAt(i)!;
      h = Math.trunc(h);
    }

    return (h >>> 0);
  }
}
