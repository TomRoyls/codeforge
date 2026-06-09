type QueryType = 'min' | 'max' | 'gcd' | 'sum';

export class SparseTable3 {
  private table: number[][];
  private array: number[];
  private logs: number[];
  private queryType: QueryType;
  private aggFunc: (a: number, b: number) => number;

  constructor(array: number[], queryType: QueryType = 'min') {
    if (array.length === 0) {
      throw new Error("Array cannot be empty");
    }
    this.array = array;
    this.queryType = queryType;
    const n = array.length;
    const maxLog = Math.floor(Math.log2(n)) + 1;
    this.table = new Array(maxLog);
    this.logs = new Array(n + 1);
    this.logs[1] = 0;
    for (let i = 2; i <= n; i++) {
      this.logs[i] = this.logs[Math.floor(i / 2)]! + 1;
    }

    switch (queryType) {
      case 'min':
        this.aggFunc = (a, b) => Math.min(a, b);
        break;
      case 'max':
        this.aggFunc = (a, b) => Math.max(a, b);
        break;
      case 'gcd':
        this.aggFunc = (a, b) => this.gcd(a, b);
        break;
      case 'sum':
        this.aggFunc = (a, b) => a + b;
        break;
    }

    this.table[0] = new Array(n);
    for (let i = 0; i < n; i++) {
      this.table[0]![i] = array[i]!;
    }

    for (let k = 1; k < maxLog; k++) {
      this.table[k] = new Array(n - (1 << k) + 1);
      for (let i = 0; i <= n - (1 << k); i++) {
        this.table[k]![i] = this.aggFunc(
          this.table[k - 1]![i]!,
          this.table[k - 1]![i + (1 << (k - 1))]!
        );
      }
    }
  }

  query(left: number, right: number): number {
    if (left < 0 || right >= this.array.length || left > right) {
      throw new Error(`Invalid range: left=${left}, right=${right}, length=${this.array.length}`);
    }
    const length = right - left + 1;
    const k = this.logs[length]!;

    if (this.queryType === 'sum') {
      let result = 0;
      let pos = left;
      while (pos <= right) {
        const currentK = this.logs[right - pos + 1]!;
        result += this.table[currentK]![pos]!;
        pos += 1 << currentK;
      }
      return result;
    }

    if (this.queryType === 'gcd') {
      let result = 0;
      let pos = left;
      let first = true;
      while (pos <= right) {
        const currentK = this.logs[right - pos + 1]!;
        const val = this.table[currentK]![pos]!;
        if (first) {
          result = val;
          first = false;
        } else {
          result = this.gcd(result, val);
        }
        pos += 1 << currentK;
      }
      return result;
    }

    return this.aggFunc(
      this.table[k]![left]!,
      this.table[k]![right - (1 << k) + 1]!
    );
  }

  toArray(): number[] {
    return this.array;
  }

  size(): number {
    return this.array.length;
  }

  getTimeComplexity(): string {
    if (this.queryType === 'sum') {
      return "Preprocess: O(n log n), Query: O(log n)";
    }
    if (this.queryType === 'gcd') {
      return "Preprocess: O(n log n), Query: O(log n * log(max))";
    }
    return "Preprocess: O(n log n), Query: O(1)";
  }

  private gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
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

  isEmpty(): boolean {
    return this.size() === 0
  }

  static from(items: any[]): SparseTable3 {
    return new SparseTable3(items)
  }

  clone(): SparseTable3 {
    return SparseTable3.from(this.toArray())
  }
}
