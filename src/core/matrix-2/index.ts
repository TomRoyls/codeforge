export class Matrix2 {
  private data: number[][];
  private _rows: number;
  private _cols: number;

  constructor(rows: number, cols: number, fill = 0) {
    this._rows = rows;
    this._cols = cols;
    this.data = new Array(rows);
    for (let i = 0; i < rows; i++) {
      this.data[i] = new Array(cols).fill(fill);
    }
  }

  get(row: number, col: number): number {
    return this.data[row]![col]!;
  }

  set(row: number, col: number, value: number): void {
    this.data[row]![col]! = value;
  }

  rows(): number {
    return this._rows;
  }

  cols(): number {
    return this._cols;
  }

  add(other: Matrix2): Matrix2 {
    if (this._rows !== other._rows || this._cols !== other._cols) {
      throw new Error('Matrix dimensions must match for addition');
    }
    const result = new Matrix2(this._rows, this._cols);
    for (let i = 0; i < this._rows; i++) {
      for (let j = 0; j < this._cols; j++) {
        result.data[i]![j]! = this.data[i]![j]! + other.data[i]![j]!;
      }
    }
    return result;
  }

  multiply(other: Matrix2): Matrix2 {
    if (this._cols !== other._rows) {
      throw new Error('Matrix dimensions must match for multiplication');
    }
    const result = new Matrix2(this._rows, other._cols);
    for (let i = 0; i < this._rows; i++) {
      for (let j = 0; j < other._cols; j++) {
        let sum = 0;
        for (let k = 0; k < this._cols; k++) {
          sum += this.data[i]![k]! * other.data[k]![j]!;
        }
        result.data[i]![j]! = sum;
      }
    }
    return result;
  }

  scale(scalar: number): Matrix2 {
    const result = new Matrix2(this._rows, this._cols);
    for (let i = 0; i < this._rows; i++) {
      for (let j = 0; j < this._cols; j++) {
        result.data[i]![j]! = this.data[i]![j]! * scalar;
      }
    }
    return result;
  }

  transpose(): Matrix2 {
    const result = new Matrix2(this._cols, this._rows);
    for (let i = 0; i < this._rows; i++) {
      for (let j = 0; j < this._cols; j++) {
        result.data[j]![i]! = this.data[i]![j]!;
      }
    }
    return result;
  }

  toArray(): number[][] {
    const arr: number[][] = new Array(this._rows);
    for (let i = 0; i < this._rows; i++) {
      arr[i] = [...this.data[i]!];
    }
    return arr;
  }

  clone(): Matrix2 {
    const result = new Matrix2(this._rows, this._cols);
    for (let i = 0; i < this._rows; i++) {
      for (let j = 0; j < this._cols; j++) {
        result.data[i]![j]! = this.data[i]![j]!;
      }
    }
    return result;
  }

  fill(value: number): void {
    for (let i = 0; i < this._rows; i++) {
      for (let j = 0; j < this._cols; j++) {
        this.data[i]![j]! = value;
      }
    }
  }

  static fromArray(data: number[][]): Matrix2 {
    const rows = data.length;
    const cols = data[0]!.length;
    const matrix = new Matrix2(rows, cols);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        matrix.data[i]![j]! = data[i]![j]!;
      }
    }
    return matrix;
  }

  static identity(size: number): Matrix2 {
    const matrix = new Matrix2(size, size);
    for (let i = 0; i < size; i++) {
      matrix.data[i]![i]! = 1;
    }
    return matrix;
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

  clear(): void {
    this.data = [];
  }

  toString(): string {
    return `Matrix2()`
  }

  forEach(callback: (item: unknown, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'Matrix2', items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'Matrix2'
  }
}
