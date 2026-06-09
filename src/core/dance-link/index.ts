import type { DanceLinkOptions } from "./types.js";
export type { DanceLinkOptions } from "./types.js";

interface Node {
  col: Node;
  down: Node;
  left: Node;
  right: Node;
  row: number;
  size: number;
  up: Node;
}

export class DanceLink {
  private maxSolutions: number;
  private rowCount = 0;
  private root: Node;
  private solution: number[] = [];
  private solutionCount = 0;
  private solutions: number[][] = [];

  constructor(matrix: boolean[][], options: DanceLinkOptions = {}) {
    this.maxSolutions = options.maxSolutions ?? Infinity;
    this.root = this.buildMatrix(matrix);
  }

  static fromMatrix(matrix: boolean[][], options: DanceLinkOptions = {}): DanceLink {
    return new DanceLink(matrix, options);
  }

  private createNode(): Node {
    const node: Partial<Node> = {
      left: null!,
      right: null!,
      up: null!,
      down: null!,
      col: null!,
      row: -1,
      size: 0
    };
    return node as Node;
  }

  private buildMatrix(matrix: boolean[][]): Node {
    const root = this.createNode();
    root.left = root;
    root.right = root;
    root.up = root;
    root.down = root;
    root.col = root;

    if (matrix.length === 0 || (matrix[0] !== undefined && matrix[0]!.length === 0)) {
      return root;
    }

    const colCount = matrix[0]!.length;
    const columns: Node[] = [];

    for (let c = 0; c < colCount; c++) {
      const col = this.createNode();
      col.left = root.left;
      col.right = root;
      root.left!.right = col;
      root.left = col;
      col.up = col;
      col.down = col;
      col.col = col;
      col.size = 0;
      columns[c] = col;
    }

    this.rowCount = 0;
    for (let r = 0; r < matrix.length; r++) {
      const rowData = matrix[r]!;
      let first: Node | null = null;
      let prev: Node | null = null;

      for (let c = 0; c < rowData.length; c++) {
        if (rowData[c]!) {
          const node = this.createNode();
          node.row = this.rowCount;
          node.col = columns[c]!;

          columns[c]!.size++;
          node.up = columns[c]!.up;
          node.down = columns[c]!;
          columns[c]!.up!.down = node;
          columns[c]!.up = node;

          if (first === null) {
            first = node;
          }

          if (prev !== null) {
            node.left = prev;
            node.right = first!;
            prev.right = node;
            first!.left = node;
          } else {
            node.left = node;
            node.right = node;
          }

          prev = node;
        }
      }

      this.rowCount++;
    }

    return root;
  }

  private cover(col: Node): void {
    col.right.left = col.left;
    col.left.right = col.right;

    let i = col.down;
    while (i !== col) {
      let j = i.right;
      while (j !== i) {
        j.down.up = j.up;
        j.up.down = j.down;
        j.col.size--;
        j = j.right;
      }
      i = i.down;
    }
  }

  private uncover(col: Node): void {
    let i = col.up;
    while (i !== col) {
      let j = i.left;
      while (j !== i) {
        j.col.size++;
        j.down.up = j;
        j.up.down = j;
        j = j.left;
      }
      i = i.up;
    }

    col.right.left = col;
    col.left.right = col;
  }

  private chooseColumn(): Node {
    let col = this.root.right;
    let minSize = col.size;

    let c = col.right;
    while (c !== this.root) {
      if (c.size < minSize) {
        minSize = c.size;
        col = c;
      }
      c = c.right;
    }

    return col;
  }

  private search(k: number, _mode: 'all' | 'one' | 'count' = 'all'): boolean {
    if (this.root.right === this.root) {
      if (_mode === 'count') {
        this.solutionCount++;
      } else {
        this.solutions.push(this.solution.slice(0, k));
      }
      return _mode === 'one' || this.solutions.length >= this.maxSolutions;
    }

    const col = this.chooseColumn();
    this.cover(col);

    let r = col.down;
    while (r !== col) {
      this.solution[k] = r.row;

      let j = r.right;
      while (j !== r) {
        this.cover(j.col);
        j = j.right;
      }

      if (this.search(k + 1, _mode)) {
        this.uncover(col);
        return true;
      }

      j = r.left;
      while (j !== r) {
        this.uncover(j.col);
        j = j.left;
      }

      r = r.down;
    }

    this.uncover(col);
    return false;
  }

  solve(): number[][] {
    this.solution = [];
    this.solutions = [];
    this.search(0, 'all');
    return this.solutions;
  }

  solveOne(): number[] | null {
    this.solution = [];
    this.solutions = [];
    if (this.search(0, 'one')) {
      return this.solutions[0]!;
    }
    return null;
  }

  countSolutions(): number {
    this.solution = [];
    this.solutionCount = 0;
    this.search(0, 'count');
    return this.solutionCount;
  }

  get size(): number {
    let count = 0;
    let col = this.root.right;
    while (col !== this.root) {
      count++;
      col = col.right;
    }
    return count;
  }

  get isEmpty(): boolean {
    return this.root.right === this.root;
  }

  clear(): void {
    this.solution = [];
    this.solutions = [];
    this.solutionCount = 0;
  }

  toArray(): number[][] {
    return this.solve();
  }

  forEach(callback: (solution: number[]) => void): void {
    this.solution = [];
    this.solutions = [];
    const originalSolutions = this.solutions;

    this.search(0, 'all');

    for (const solution of this.solutions) {
      callback(solution);
    }

    this.solutions = originalSolutions;
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

  toString(): string {
    return `${DanceLink}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }


  toJSON() {
    return { type: 'DanceLink', size: this.size, items: this.toArray() }
  }
}
