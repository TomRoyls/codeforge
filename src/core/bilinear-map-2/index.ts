export class BilinearMap2 {
  private grid: number[][];
  private cellSize: number;

  constructor(gridValues: number[][], cellSize: number = 1.0) {
    this.grid = gridValues;
    this.cellSize = cellSize;
  }

  get(x: number, y: number): number {
    const width = this.getWidth();
    const height = this.getHeight();

    const maxX = (width - 1) * this.cellSize;
    const maxY = (height - 1) * this.cellSize;

    const clampedX = Math.max(0, Math.min(x, maxX));
    const clampedY = Math.max(0, Math.min(y, maxY));

    const gridX = clampedX / this.cellSize;
    const gridY = clampedY / this.cellSize;

    const col = Math.floor(gridX);
    const row = Math.floor(gridY);

    const nextCol = Math.min(col + 1, width - 1);
    const nextRow = Math.min(row + 1, height - 1);

    const tX = gridX - col;
    const tY = gridY - row;

    const v00 = this.grid[row]![col]!;
    const v01 = this.grid[row]![nextCol]!;
    const v10 = this.grid[nextRow]![col]!;
    const v11 = this.grid[nextRow]![nextCol]!;

    const top = v00 + tX * (v01 - v00);
    const bottom = v10 + tX * (v11 - v10);

    return top + tY * (bottom - top);
  }

  setGridValue(row: number, col: number, value: number): void {
    this.grid[row]![col] = value;
  }

  getWidth(): number {
    return this.grid[0]!.length;
  }

  getHeight(): number {
    return this.grid.length;
  }

  getRaw(row: number, col: number): number | undefined {
    const rowArray = this.grid[row];
    if (rowArray === undefined) {
      return undefined;
    }
    return rowArray[col];
  }

  getGrid(): number[][] {
    return this.grid.map(row => [...row]);
  }

  static from(items: any[]): BilinearMap2 {
    return new BilinearMap2(items)
  }

  toString(): string {
    return `BilinearMap2()`
  }

  get [Symbol.toStringTag](): string {
    return 'BilinearMap2'
  }
}
