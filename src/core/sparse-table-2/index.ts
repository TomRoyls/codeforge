export class SparseTable {
  private minTable: number[][];
  private maxTable: number[][];
  private array: number[];
  private logs: number[];

  constructor(array: number[]) {
    if (array.length === 0) {
      throw new Error("Array cannot be empty");
    }
    this.array = array;
    const n = array.length;
    const maxLog = Math.floor(Math.log2(n)) + 1;
    this.minTable = new Array(maxLog);
    this.maxTable = new Array(maxLog);
    this.logs = new Array(n + 1);
    this.logs[1] = 0;
    for (let i = 2; i <= n; i++) {
      this.logs[i] = this.logs[Math.floor(i / 2)]! + 1;
    }
    this.minTable[0] = new Array(n);
    this.maxTable[0] = new Array(n);
    for (let i = 0; i < n; i++) {
      this.minTable[0]![i] = array[i]!;
      this.maxTable[0]![i] = array[i]!;
    }
    for (let k = 1; k < maxLog; k++) {
      this.minTable[k] = new Array(n - (1 << k) + 1);
      this.maxTable[k] = new Array(n - (1 << k) + 1);
      for (let i = 0; i <= n - (1 << k); i++) {
        this.minTable[k]![i] = Math.min(
          this.minTable[k - 1]![i]!,
          this.minTable[k - 1]![i + (1 << (k - 1))]!
        );
        this.maxTable[k]![i] = Math.max(
          this.maxTable[k - 1]![i]!,
          this.maxTable[k - 1]![i + (1 << (k - 1))]!
        );
      }
    }
  }

  query(start: number, end: number): number {
    return this.rangeMinQuery(start, end);
  }

  rangeMinQuery(start: number, end: number): number {
    if (start < 0 || end >= this.array.length || start > end) {
      throw new Error(`Invalid range: start=${start}, end=${end}, length=${this.array.length}`);
    }
    const length = end - start + 1;
    const k = this.logs[length]!;
    return Math.min(
      this.minTable[k]![start]!,
      this.minTable[k]![end - (1 << k) + 1]!
    );
  }

  rangeMaxQuery(start: number, end: number): number {
    if (start < 0 || end >= this.array.length || start > end) {
      throw new Error(`Invalid range: start=${start}, end=${end}, length=${this.array.length}`);
    }
    const length = end - start + 1;
    const k = this.logs[length]!;
    return Math.max(
      this.maxTable[k]![start]!,
      this.maxTable[k]![end - (1 << k) + 1]!
    );
  }

  getSize(): number {
    return this.array.length;
  }

  getTable(): number[][] {
    return this.minTable;
  }

  toArray(): number[] {
    return this.array;
  }

  getTimeComplexity(): string {
    return "Preprocess: O(n log n), Query: O(1)";
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

  static from(items: any[]): SparseTable {
    return new SparseTable(items)
  }

  clone(): SparseTable {
    return SparseTable.from(this.toArray())
  }

  toString(): string {
    return `SparseTable({ size: ${this.array.length} })`
  }

  toJSON() {
    return { type: 'SparseTable', items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'SparseTable'
  }
}
