import type { LCPArrayOptions } from "./types.js";

class SparseTable {
  private table: number[][];
  private log2: number[];

  constructor(data: number[]) {
    const n = data.length;
    const k = Math.floor(Math.log2(n)) + 1;
    this.table = Array.from({ length: k }, (_unused, _i) => new Array(n).fill(0));
    this.log2 = new Array(n + 1).fill(0);

    for (let i = 2; i <= n; i++) {
      this.log2[i] = this.log2[Math.floor(i / 2)]! + 1;
    }

    for (let i = 0; i < n; i++) {
      this.table[0]![i] = data[i]!;
    }

    for (let j = 1; j < k; j++) {
      for (let i = 0; i + (1 << j) <= n; i++) {
        this.table[j]![i] = Math.min(
          this.table[j - 1]![i]!,
          this.table[j - 1]![i + (1 << (j - 1))]!
        );
      }
    }
  }

  query(l: number, r: number): number {
    if (l > r) {
      [l, r] = [r, l];
    }
    const j = this.log2[r - l + 1]!;
    return Math.min(this.table[j]![l]!, this.table[j]![r - (1 << j) + 1]!);
  }
}

export function buildLCPArray(s: string, sa: number[]): number[] {
  const n = s.length;
  if (n === 0) return [];
  const lcp = new Array(n).fill(0);
  const rank = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    rank[sa[i]!] = i;
  }

  let h = 0;

  for (let i = 0; i < n; i++) {
    const r = rank[i]!;
    if (r > 0) {
      const j = sa[r - 1]!;

      while (i + h < n && j + h < n && s[i + h]! === s[j + h]!) {
        h++;
      }

      lcp[r] = h;

      if (h > 0) {
        h--;
      }
    }
  }

  return lcp.slice(1);
}

export class LCPArray {
  private lcp: number[];
  private sa: number[];
  private s: string;
  private sparseTable: SparseTable | null;
  private _length: number;

  get length(): number {
    return this._length;
  }

  get size(): number {
    return this._length;
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  constructor(s: string, sa: number[], options: LCPArrayOptions = {}) {
    this.s = s;
    this.sa = sa;
    this.lcp = buildLCPArray(s, sa);
    this._length = s.length;
    this.sparseTable = options.enableRMQ ? new SparseTable(this.lcp) : null;
  }

  getLCP(i: number): number {
    if (i === 0) return 0;
    if (i < 1 || i > this.lcp.length) {
      return 0;
    }
    return this.lcp[i - 1]!;
  }

  getLCPBetween(i: number, j: number): number {
    if (i < 0 || i >= this.sa.length || j < 0 || j >= this.sa.length) {
      return 0;
    }

    const ri = i;
    const rj = j;

    if (ri === rj) {
      return this.s.length - this.sa[ri]!;
    }

    const l = Math.min(ri, rj);
    const r = Math.max(ri, rj) - 1;

    if (l > r) {
      return 0;
    }

    if (this.sparseTable) {
      return this.sparseTable.query(l, r);
    }

    let minLCP = Infinity;
    for (let k = l; k <= r; k++) {
      if (this.lcp[k]! < minLCP) {
        minLCP = this.lcp[k]!;
      }
    }

    return minLCP === Infinity ? 0 : minLCP;
  }

  longestRepeatedSubstring(): string {
    if (this.lcp.length <= 1) {
      return "";
    }

    let maxLCP = 0;
    let maxIndex = 0;

    for (let i = 0; i < this.lcp.length; i++) {
      if (this.lcp[i]! > maxLCP) {
        maxLCP = this.lcp[i]!;
        maxIndex = i;
      }
    }

    if (maxLCP === 0) {
      return "";
    }

    const startPos = this.sa[maxIndex]!;
    return this.s.substring(startPos, startPos + maxLCP);
  }

  toArray(): number[] {
    return [...this.lcp];
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  forEach(callback: (item: number, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toString(): string {
    return `LCPArray({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'LCPArray', size: this.size, items: this.toArray() }
  }
}
