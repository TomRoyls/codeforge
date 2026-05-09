import type { SegmentTree2DOptions } from './types.js'
import { DEFAULT_SEGMENT_TREE_2D_OPTIONS } from './types.js'

export class SegmentTree2D {
  private tree: number[]
  private _data: number[][]
  private _rows: number
  private _cols: number
  private identity: number
  private combine: (a: number, b: number) => number

  constructor(data: number[][], options?: Partial<SegmentTree2DOptions>) {
    const opts: SegmentTree2DOptions = { ...DEFAULT_SEGMENT_TREE_2D_OPTIONS, ...options }
    this.identity = opts.identity
    this.combine = opts.combine
    this._rows = 0
    this._cols = 0
    this._data = []
    this.tree = []
    this.build(data)
  }

  static createSum(data: number[][]): SegmentTree2D {
    return new SegmentTree2D(data, {
      identity: 0,
      combine: (a, b) => a + b,
    })
  }

  static createMin(data: number[][]): SegmentTree2D {
    return new SegmentTree2D(data, {
      identity: Infinity,
      combine: (a, b) => Math.min(a, b),
    })
  }

  static createMax(data: number[][]): SegmentTree2D {
    return new SegmentTree2D(data, {
      identity: -Infinity,
      combine: (a, b) => Math.max(a, b),
    })
  }

  private build(data: number[][]): void {
    this._rows = data.length
    if (this._rows === 0) {
      this._cols = 0
      this._data = []
      this.tree = []
      return
    }
    this._cols = data[0]!.length
    this._data = data.map(row => [...row])
    const treeRows = 4 * this._rows
    const treeCols = 4 * this._cols
    this.tree = new Array<number>(treeRows * treeCols).fill(this.identity)
    this.buildTree(1, 0, this._rows - 1, 1, 0, this._cols - 1)
  }

  private buildTree(
    nodeRow: number, rowStart: number, rowEnd: number,
    nodeCol: number, colStart: number, colEnd: number,
  ): void {
    if (rowStart === rowEnd && colStart === colEnd) {
      this.tree[this.idx(nodeRow, nodeCol)] = this._data[rowStart]![colStart]!
      return
    }
    if (rowStart === rowEnd) {
      const midC = Math.floor((colStart + colEnd) / 2)
      this.buildTree(nodeRow, rowStart, rowEnd, nodeCol * 2, colStart, midC)
      this.buildTree(nodeRow, rowStart, rowEnd, nodeCol * 2 + 1, midC + 1, colEnd)
      this.tree[this.idx(nodeRow, nodeCol)] = this.combine(
        this.tree[this.idx(nodeRow, nodeCol * 2)]!,
        this.tree[this.idx(nodeRow, nodeCol * 2 + 1)]!,
      )
      return
    }
    if (colStart === colEnd) {
      const midR = Math.floor((rowStart + rowEnd) / 2)
      this.buildTree(nodeRow * 2, rowStart, midR, nodeCol, colStart, colEnd)
      this.buildTree(nodeRow * 2 + 1, midR + 1, rowEnd, nodeCol, colStart, colEnd)
      this.tree[this.idx(nodeRow, nodeCol)] = this.combine(
        this.tree[this.idx(nodeRow * 2, nodeCol)]!,
        this.tree[this.idx(nodeRow * 2 + 1, nodeCol)]!,
      )
      return
    }
    const midR = Math.floor((rowStart + rowEnd) / 2)
    const midC = Math.floor((colStart + colEnd) / 2)
    this.buildTree(nodeRow * 2, rowStart, midR, nodeCol * 2, colStart, midC)
    this.buildTree(nodeRow * 2, rowStart, midR, nodeCol * 2 + 1, midC + 1, colEnd)
    this.buildTree(nodeRow * 2 + 1, midR + 1, rowEnd, nodeCol * 2, colStart, midC)
    this.buildTree(nodeRow * 2 + 1, midR + 1, rowEnd, nodeCol * 2 + 1, midC + 1, colEnd)
    this.tree[this.idx(nodeRow, nodeCol)] = this.combine(
      this.combine(
        this.tree[this.idx(nodeRow * 2, nodeCol * 2)]!,
        this.tree[this.idx(nodeRow * 2, nodeCol * 2 + 1)]!,
      ),
      this.combine(
        this.tree[this.idx(nodeRow * 2 + 1, nodeCol * 2)]!,
        this.tree[this.idx(nodeRow * 2 + 1, nodeCol * 2 + 1)]!,
      ),
    )
  }

  update(row: number, col: number, value: number): void {
    if (this._rows === 0) {
      throw new RangeError('Cannot update empty tree')
    }
    if (row < 0 || row >= this._rows) {
      throw new RangeError(`Row ${row} out of bounds [0, ${this._rows - 1}]`)
    }
    if (col < 0 || col >= this._cols) {
      throw new RangeError(`Column ${col} out of bounds [0, ${this._cols - 1}]`)
    }
    this._data[row]![col] = value
    this.updateTree(1, 0, this._rows - 1, 1, 0, this._cols - 1, row, col, value)
  }

  private updateTree(
    nodeRow: number, rowStart: number, rowEnd: number,
    nodeCol: number, colStart: number, colEnd: number,
    targetRow: number, targetCol: number, value: number,
  ): void {
    if (rowStart === rowEnd && colStart === colEnd) {
      this.tree[this.idx(nodeRow, nodeCol)] = value
      return
    }
    if (rowStart === rowEnd) {
      const midC = Math.floor((colStart + colEnd) / 2)
      if (targetCol <= midC) {
        this.updateTree(nodeRow, rowStart, rowEnd, nodeCol * 2, colStart, midC, targetRow, targetCol, value)
      } else {
        this.updateTree(nodeRow, rowStart, rowEnd, nodeCol * 2 + 1, midC + 1, colEnd, targetRow, targetCol, value)
      }
      this.tree[this.idx(nodeRow, nodeCol)] = this.combine(
        this.tree[this.idx(nodeRow, nodeCol * 2)]!,
        this.tree[this.idx(nodeRow, nodeCol * 2 + 1)]!,
      )
      return
    }
    if (colStart === colEnd) {
      const midR = Math.floor((rowStart + rowEnd) / 2)
      if (targetRow <= midR) {
        this.updateTree(nodeRow * 2, rowStart, midR, nodeCol, colStart, colEnd, targetRow, targetCol, value)
      } else {
        this.updateTree(nodeRow * 2 + 1, midR + 1, rowEnd, nodeCol, colStart, colEnd, targetRow, targetCol, value)
      }
      this.tree[this.idx(nodeRow, nodeCol)] = this.combine(
        this.tree[this.idx(nodeRow * 2, nodeCol)]!,
        this.tree[this.idx(nodeRow * 2 + 1, nodeCol)]!,
      )
      return
    }
    const midR = Math.floor((rowStart + rowEnd) / 2)
    const midC = Math.floor((colStart + colEnd) / 2)
    if (targetRow <= midR && targetCol <= midC) {
      this.updateTree(nodeRow * 2, rowStart, midR, nodeCol * 2, colStart, midC, targetRow, targetCol, value)
    } else if (targetRow <= midR && targetCol > midC) {
      this.updateTree(nodeRow * 2, rowStart, midR, nodeCol * 2 + 1, midC + 1, colEnd, targetRow, targetCol, value)
    } else if (targetRow > midR && targetCol <= midC) {
      this.updateTree(nodeRow * 2 + 1, midR + 1, rowEnd, nodeCol * 2, colStart, midC, targetRow, targetCol, value)
    } else {
      this.updateTree(nodeRow * 2 + 1, midR + 1, rowEnd, nodeCol * 2 + 1, midC + 1, colEnd, targetRow, targetCol, value)
    }
    this.tree[this.idx(nodeRow, nodeCol)] = this.combine(
      this.combine(
        this.tree[this.idx(nodeRow * 2, nodeCol * 2)]!,
        this.tree[this.idx(nodeRow * 2, nodeCol * 2 + 1)]!,
      ),
      this.combine(
        this.tree[this.idx(nodeRow * 2 + 1, nodeCol * 2)]!,
        this.tree[this.idx(nodeRow * 2 + 1, nodeCol * 2 + 1)]!,
      ),
    )
  }

  query(r1: number, c1: number, r2: number, c2: number): number {
    if (this._rows === 0) return this.identity
    if (r1 < 0 || r2 >= this._rows || r1 > r2) {
      throw new RangeError(`Invalid row range [${r1}, ${r2}] for rows ${this._rows}`)
    }
    if (c1 < 0 || c2 >= this._cols || c1 > c2) {
      throw new RangeError(`Invalid column range [${c1}, ${c2}] for cols ${this._cols}`)
    }
    return this.queryTree(1, 0, this._rows - 1, 1, 0, this._cols - 1, r1, c1, r2, c2)
  }

  private queryTree(
    nodeRow: number, rowStart: number, rowEnd: number,
    nodeCol: number, colStart: number, colEnd: number,
    qr1: number, qc1: number, qr2: number, qc2: number,
  ): number {
    if (qr1 <= rowStart && rowEnd <= qr2 && qc1 <= colStart && colEnd <= qc2) {
      return this.tree[this.idx(nodeRow, nodeCol)]!
    }
    if (rowStart > qr2 || rowEnd < qr1 || colStart > qc2 || colEnd < qc1) {
      return this.identity
    }
    if (rowStart === rowEnd) {
      const midC = Math.floor((colStart + colEnd) / 2)
      return this.combine(
        this.queryTree(nodeRow, rowStart, rowEnd, nodeCol * 2, colStart, midC, qr1, qc1, qr2, qc2),
        this.queryTree(nodeRow, rowStart, rowEnd, nodeCol * 2 + 1, midC + 1, colEnd, qr1, qc1, qr2, qc2),
      )
    }
    if (colStart === colEnd) {
      const midR = Math.floor((rowStart + rowEnd) / 2)
      return this.combine(
        this.queryTree(nodeRow * 2, rowStart, midR, nodeCol, colStart, colEnd, qr1, qc1, qr2, qc2),
        this.queryTree(nodeRow * 2 + 1, midR + 1, rowEnd, nodeCol, colStart, colEnd, qr1, qc1, qr2, qc2),
      )
    }
    const midR = Math.floor((rowStart + rowEnd) / 2)
    const midC = Math.floor((colStart + colEnd) / 2)
    return this.combine(
      this.combine(
        this.queryTree(nodeRow * 2, rowStart, midR, nodeCol * 2, colStart, midC, qr1, qc1, qr2, qc2),
        this.queryTree(nodeRow * 2, rowStart, midR, nodeCol * 2 + 1, midC + 1, colEnd, qr1, qc1, qr2, qc2),
      ),
      this.combine(
        this.queryTree(nodeRow * 2 + 1, midR + 1, rowEnd, nodeCol * 2, colStart, midC, qr1, qc1, qr2, qc2),
        this.queryTree(nodeRow * 2 + 1, midR + 1, rowEnd, nodeCol * 2 + 1, midC + 1, colEnd, qr1, qc1, qr2, qc2),
      ),
    )
  }

  get(row: number, col: number): number {
    if (this._rows === 0) {
      throw new RangeError('Cannot get from empty tree')
    }
    if (row < 0 || row >= this._rows) {
      throw new RangeError(`Row ${row} out of bounds [0, ${this._rows - 1}]`)
    }
    if (col < 0 || col >= this._cols) {
      throw new RangeError(`Column ${col} out of bounds [0, ${this._cols - 1}]`)
    }
    return this._data[row]![col]!
  }

  getRows(): number {
    return this._rows
  }

  getCols(): number {
    return this._cols
  }

  toArray(): number[][] {
    return this._data.map(row => [...row])
  }

  clone(): SegmentTree2D {
    return new SegmentTree2D(this.toArray(), {
      identity: this.identity,
      combine: this.combine,
    })
  }

  private idx(nodeRow: number, nodeCol: number): number {
    const treeCols = 4 * this._cols
    return nodeRow * treeCols + nodeCol
  }
}

export { DEFAULT_SEGMENT_TREE_2D_OPTIONS } from './types.js'
export type { SegmentTree2DOptions } from './types.js'
export { SUM_2D, MIN_2D, MAX_2D } from './types.js'
