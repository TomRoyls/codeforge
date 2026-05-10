import type { K2TreeOptions } from './types.js'
import { DEFAULT_K } from './types.js'

class TreeNode {
  isLeaf: boolean
  children: (TreeNode | null)[]
  bits: Uint8Array

  constructor(k: number, isLeaf: boolean) {
    this.isLeaf = isLeaf
    const slotCount = k * k
    if (isLeaf) {
      this.bits = new Uint8Array(slotCount)
      this.children = []
    } else {
      this.bits = new Uint8Array(0)
      this.children = new Array<TreeNode | null>(slotCount).fill(null)
    }
  }
}

export class K2Tree {
  private k: number
  private matrixSize: number
  private treeHeight: number
  private rootNode: TreeNode | null
  private bitCount: number

  constructor(size: number, options?: K2TreeOptions) {
    this.k = options?.k ?? DEFAULT_K
    this.matrixSize = this.roundUp(size)
    this.treeHeight = this.computeHeight()
    this.rootNode = null
    this.bitCount = 0
  }

  private roundUp(size: number): number {
    if (size <= 0) return this.k
    let result = this.k
    while (result < size) result *= this.k
    return result
  }

  private computeHeight(): number {
    let h = 0
    let s = this.matrixSize
    while (s > 1) {
      s = Math.floor(s / this.k)
      h++
    }
    return h
  }

  private quadrantIndex(row: number, col: number, depth: number): number {
    const blockSize = this.matrixSize / (this.k ** depth)
    const subBlockSize = blockSize / this.k
    const qr = Math.floor((row % blockSize) / subBlockSize)
    const qc = Math.floor((col % blockSize) / subBlockSize)
    return qr * this.k + qc
  }

  set(row: number, col: number, value: number): void {
    if (row < 0 || row >= this.matrixSize || col < 0 || col >= this.matrixSize) {
      throw new RangeError(
        `Index (${row}, ${col}) out of bounds for ${this.matrixSize}x${this.matrixSize} matrix`,
      )
    }
    const current = this.get(row, col)
    if (current === value) return
    if (value === 1) {
      this.bitCount++
      this.insertBit(row, col)
    } else {
      this.bitCount--
      this.removeBit(row, col)
    }
  }

  private insertBit(row: number, col: number): void {
    if (this.rootNode === null) {
      this.rootNode = new TreeNode(this.k, this.treeHeight <= 1)
    }
    let node = this.rootNode
    for (let d = 0; d < this.treeHeight; d++) {
      const idx = this.quadrantIndex(row, col, d)
      if (d === this.treeHeight - 1) {
        node.bits[idx] = 1
      } else {
        if (node.children[idx] === null) {
          node.children[idx] = new TreeNode(this.k, d + 1 === this.treeHeight - 1)
        }
        node = node.children[idx]!
      }
    }
  }

  private removeBit(row: number, col: number): void {
    if (this.rootNode === null) return
    const path: Array<{ node: TreeNode; idx: number }> = []
    let node = this.rootNode
    for (let d = 0; d < this.treeHeight; d++) {
      const idx = this.quadrantIndex(row, col, d)
      if (d === this.treeHeight - 1) {
        node.bits[idx] = 0
      } else {
        if (node.children[idx] === null) return
        path.push({ node, idx })
        node = node.children[idx]!
      }
    }
    for (let i = path.length - 1; i >= 0; i--) {
      const entry = path[i]!
      const child = entry.node.children[entry.idx]!
      if (this.isEmptyNode(child)) {
        entry.node.children[entry.idx] = null
      } else {
        break
      }
    }
    if (this.rootNode !== null && this.isEmptyNode(this.rootNode)) {
      this.rootNode = null
    }
  }

  private isEmptyNode(node: TreeNode): boolean {
    if (node.isLeaf) {
      for (let i = 0; i < node.bits.length; i++) {
        if (node.bits[i]! === 1) return false
      }
      return true
    }
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i] !== null) return false
    }
    return true
  }

  get(row: number, col: number): number {
    if (row < 0 || row >= this.matrixSize || col < 0 || col >= this.matrixSize) return 0
    if (this.rootNode === null) return 0
    let node = this.rootNode
    for (let d = 0; d < this.treeHeight; d++) {
      const idx = this.quadrantIndex(row, col, d)
      if (d === this.treeHeight - 1) {
        return node.bits[idx]!
      }
      if (node.children[idx] === null) return 0
      node = node.children[idx]!
    }
    return 0
  }

  has(row: number, col: number): boolean {
    return this.get(row, col) === 1
  }

  get rows(): number {
    return this.matrixSize
  }

  get cols(): number {
    return this.matrixSize
  }

  get count(): number {
    return this.bitCount
  }

  get density(): number {
    const total = this.matrixSize * this.matrixSize
    return total === 0 ? 0 : this.bitCount / total
  }

  neighbors(row: number): number[] {
    if (row < 0 || row >= this.matrixSize) return []
    const result: number[] = []
    this.findNeighbors(this.rootNode, row, 0, 0, 0, result)
    return result
  }

  private findNeighbors(
    node: TreeNode | null,
    targetRow: number,
    depth: number,
    rowOffset: number,
    colOffset: number,
    result: number[],
  ): void {
    if (node === null) return
    const blockSize = this.matrixSize / (this.k ** depth)
    const subBlockSize = blockSize / this.k
    const localRow = targetRow - rowOffset
    const quadRow = Math.floor(localRow / subBlockSize)

    if (node.isLeaf) {
      for (let qc = 0; qc < this.k; qc++) {
        const idx = quadRow * this.k + qc
        if (node.bits[idx]! === 1) {
          const col = colOffset + qc
          if (col < this.matrixSize) {
            result.push(col)
          }
        }
      }
    } else {
      for (let qc = 0; qc < this.k; qc++) {
        const childIdx = quadRow * this.k + qc
        if (node.children[childIdx] !== null) {
          this.findNeighbors(
            node.children[childIdx]!,
            targetRow,
            depth + 1,
            rowOffset + quadRow * subBlockSize,
            colOffset + qc * subBlockSize,
            result,
          )
        }
      }
    }
  }

  reverseNeighbors(col: number): number[] {
    if (col < 0 || col >= this.matrixSize) return []
    const result: number[] = []
    this.findReverseNeighbors(this.rootNode, col, 0, 0, 0, result)
    return result
  }

  private findReverseNeighbors(
    node: TreeNode | null,
    targetCol: number,
    depth: number,
    rowOffset: number,
    colOffset: number,
    result: number[],
  ): void {
    if (node === null) return
    const blockSize = this.matrixSize / (this.k ** depth)
    const subBlockSize = blockSize / this.k
    const localCol = targetCol - colOffset
    const quadCol = Math.floor(localCol / subBlockSize)

    if (node.isLeaf) {
      for (let qr = 0; qr < this.k; qr++) {
        const idx = qr * this.k + quadCol
        if (node.bits[idx]! === 1) {
          const row = rowOffset + qr
          if (row < this.matrixSize) {
            result.push(row)
          }
        }
      }
    } else {
      for (let qr = 0; qr < this.k; qr++) {
        const childIdx = qr * this.k + quadCol
        if (node.children[childIdx] !== null) {
          this.findReverseNeighbors(
            node.children[childIdx]!,
            targetCol,
            depth + 1,
            rowOffset + qr * subBlockSize,
            colOffset + quadCol * subBlockSize,
            result,
          )
        }
      }
    }
  }

  clear(): void {
    this.rootNode = null
    this.bitCount = 0
  }

  toArray(): number[][] {
    const result: number[][] = []
    for (let r = 0; r < this.matrixSize; r++) {
      const row: number[] = []
      for (let c = 0; c < this.matrixSize; c++) {
        row.push(this.get(r, c))
      }
      result.push(row)
    }
    return result
  }

  static fromMatrix(matrix: number[][], options?: K2TreeOptions): K2Tree {
    const rows = matrix.length
    const cols = rows > 0 ? Math.max(...matrix.map(r => r.length)) : 0
    const size = Math.max(rows, cols)
    const tree = new K2Tree(size, options)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < matrix[r]!.length; c++) {
        if (matrix[r]![c]! === 1) {
          tree.set(r, c, 1)
        }
      }
    }
    return tree
  }
}

export { DEFAULT_K } from './types.js'
export type { K2TreeOptions } from './types.js'
