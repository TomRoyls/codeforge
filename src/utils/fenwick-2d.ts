export class FenwickTree2D {
  readonly rows: number;
  readonly cols: number;
  private readonly tree: number[][];

  constructor(rows: number, cols: number) {
    if (rows < 0 || cols < 0) {
      throw new Error('Dimensions must be non-negative');
    }
    this.rows = rows;
    this.cols = cols;
    this.tree = Array.from({ length: rows + 1 }, () => Array(cols + 1).fill(0));
  }

  update(row: number, col: number, delta: number): void {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      throw new Error('Index out of bounds');
    }
    let i = row + 1;
    while (i <= this.rows) {
      let j = col + 1;
      while (j <= this.cols) {
        this.tree[i]![j]! += delta;
        j += j & (-j);
      }
      i += i & (-i);
    }
  }

  query(row: number, col: number): number {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      throw new Error('Index out of bounds')
    }
    return this.prefixSum(row, col)
  }

  private prefixSum(row: number, col: number): number {
    if (row < 0 || col < 0) return 0
    let sum = 0;
    let i = row + 1;
    while (i > 0) {
      let j = col + 1;
      while (j > 0) {
        sum += this.tree[i]![j]!;
        j -= j & (-j);
      }
      i -= i & (-i);
    }
    return sum;
  }

  rangeQuery(r1: number, c1: number, r2: number, c2: number): number {
    if (r1 < 0 || r1 >= this.rows || r2 < 0 || r2 >= this.rows ||
        c1 < 0 || c1 >= this.cols || c2 < 0 || c2 >= this.cols) {
      throw new Error('Index out of bounds');
    }
    if (r1 > r2 || c1 > c2) {
      throw new Error('Invalid range: r1 must be <= r2 and c1 must be <= c2');
    }

    return (
      this.prefixSum(r2, c2) -
      this.prefixSum(r1 - 1, c2) -
      this.prefixSum(r2, c1 - 1) +
      this.prefixSum(r1 - 1, c1 - 1)
    );
  }

  get(row: number, col: number): number {
    return this.rangeQuery(row, col, row, col);
  }

  set(row: number, col: number, value: number): void {
    const current = this.get(row, col);
    this.update(row, col, value - current);
  }
}
