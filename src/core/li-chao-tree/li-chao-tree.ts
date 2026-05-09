import type { Line, LiChaoTreeNode } from './types.js'

export class LiChaoTree {
  private root: LiChaoTreeNode
  private readonly xMin: number
  private readonly xMax: number
  private readonly isMin: boolean
  private _size: number = 0

  constructor(options: { xMin: number; xMax: number; type?: 'min' | 'max' }) {
    if (options.xMin > options.xMax) {
      throw new RangeError('xMin must be <= xMax')
    }
    this.xMin = options.xMin
    this.xMax = options.xMax
    this.isMin = options.type !== 'max'
    this.root = { line: null, left: null, right: null }
  }

  addLine(m: number, b: number): void {
    const newLine: Line = { m, b }
    this.insertLine(this.root, this.xMin, this.xMax, newLine)
    this._size++
  }

  query(x: number): number {
    if (x < this.xMin || x > this.xMax) {
      throw new RangeError(`x=${x} is out of range [${this.xMin}, ${this.xMax}]`)
    }
    if (this._size === 0) {
      throw new Error('Cannot query an empty Li Chao tree')
    }
    return this.queryNode(this.root, this.xMin, this.xMax, x)
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = { line: null, left: null, right: null }
    this._size = 0
  }

  getXRange(): { xMin: number; xMax: number } {
    return { xMin: this.xMin, xMax: this.xMax }
  }

  private evalY(line: Line, x: number): number {
    return line.m * x + line.b
  }

  private isBetter(a: number, b: number): boolean {
    return this.isMin ? a < b : a > b
  }

  private insertLine(
    node: LiChaoTreeNode,
    lo: number,
    hi: number,
    newLine: Line,
  ): void {
    if (node.line === null) {
      node.line = newLine
      return
    }

    const mid = lo + (hi - lo) / 2
    const nodeAtMid = this.evalY(node.line, mid)
    const newAtMid = this.evalY(newLine, mid)

    if (this.isBetter(newAtMid, nodeAtMid)) {
      const temp = node.line
      node.line = newLine
      this.insertLine(node, lo, hi, temp)
      return
    }

    if (lo === hi) {
      return
    }

    const newAtLo = this.evalY(newLine, lo)
    const nodeAtLo = this.evalY(node.line, lo)

    if (this.isBetter(newAtLo, nodeAtLo)) {
      if (node.left === null) {
        node.left = { line: null, left: null, right: null }
      }
      this.insertLine(node.left, lo, mid, newLine)
    } else {
      const newAtHi = this.evalY(newLine, hi)
      const nodeAtHi = this.evalY(node.line, hi)
      if (this.isBetter(newAtHi, nodeAtHi)) {
        if (node.right === null) {
          node.right = { line: null, left: null, right: null }
        }
        this.insertLine(node.right, mid, hi, newLine)
      }
    }
  }

  private queryNode(
    node: LiChaoTreeNode | null,
    lo: number,
    hi: number,
    x: number,
  ): number {
    let result = Infinity

    let current: LiChaoTreeNode | null = node
    let currentLo = lo
    let currentHi = hi

    while (current !== null) {
      if (current.line !== null) {
        const val = this.evalY(current.line, x)
        if (result === Infinity || this.isBetter(val, result)) {
          result = val
        }
      }

      if (currentLo === currentHi) {
        break
      }

      const mid = currentLo + (currentHi - currentLo) / 2

      if (x <= mid) {
        current = current.left
        currentHi = mid
      } else {
        current = current.right
        currentLo = mid
      }
    }

    return result
  }
}
