export class SparseMatrix2 {
  private values: number[];
  private colIndices: number[];
  private rowPtr: number[];
  private readonly rowCount: number;
  private readonly colCount: number;

  constructor(rows: number, cols: number) {
    this.rowCount = rows;
    this.colCount = cols;
    this.values = [];
    this.colIndices = [];
    this.rowPtr = new Array(rows + 1).fill(0);
  }

  get(row: number, col: number): number {
    const start = this.rowPtr[row]!;
    const end = this.rowPtr[row + 1]!;

    for (let i = start; i < end; i++) {
      if (this.colIndices[i]! === col) {
        return this.values[i]!;
      }
    }

    return 0;
  }

  set(row: number, col: number, value: number): void {
    if (row < 0 || row >= this.rowCount || col < 0 || col >= this.colCount) {
      throw new Error('Index out of bounds');
    }

    const start = this.rowPtr[row]!;
    const end = this.rowPtr[row + 1]!;

    for (let i = start; i < end; i++) {
      if (this.colIndices[i]! === col) {
        if (value === 0) {
          this.values.splice(i, 1);
          this.colIndices.splice(i, 1);
          for (let j = row + 1; j <= this.rowCount; j++) {
            this.rowPtr[j]!--;
          }
        } else {
          this.values[i] = value;
        }
        return;
      }
    }

    if (value !== 0) {
      let insertPos = start;
      while (insertPos < end && this.colIndices[insertPos]! < col) {
        insertPos++;
      }

      this.values.splice(insertPos, 0, value);
      this.colIndices.splice(insertPos, 0, col);
      for (let j = row + 1; j <= this.rowCount; j++) {
        this.rowPtr[j]!++;
      }
    }
  }

  nonZeroCount(): number {
    return this.values.length;
  }

  density(): number {
    const totalElements = this.rowCount * this.colCount;
    return this.nonZeroCount() / totalElements;
  }

  rows(): number {
    return this.rowCount;
  }

  cols(): number {
    return this.colCount;
  }

  toArray(): number[][] {
    const result: number[][] = [];

    for (let row = 0; row < this.rowCount; row++) {
      result[row] = new Array(this.colCount).fill(0);
      const start = this.rowPtr[row]!;
      const end = this.rowPtr[row + 1]!;

      for (let i = start; i < end; i++) {
        result[row]![this.colIndices[i]!] = this.values[i]!;
      }
    }

    return result;
  }

  multiplyVector(vec: number[]): number[] {
    if (vec.length !== this.colCount) {
      throw new Error('Vector length must match matrix column count');
    }

    const result: number[] = new Array(this.rowCount).fill(0);

    for (let row = 0; row < this.rowCount; row++) {
      const start = this.rowPtr[row]!;
      const end = this.rowPtr[row + 1]!;

      for (let i = start; i < end; i++) {
        result[row]! += this.values[i]! * vec[this.colIndices[i]!]!;
      }
    }

    return result;
  }

  transpose(): SparseMatrix2 {
    const result = new SparseMatrix2(this.colCount, this.rowCount);

    for (let row = 0; row < this.rowCount; row++) {
      const start = this.rowPtr[row]!;
      const end = this.rowPtr[row + 1]!;

      for (let i = start; i < end; i++) {
        const col = this.colIndices[i]!;
        const value = this.values[i]!;
        result.set(col, row, value);
      }
    }

    return result;
  }
}
