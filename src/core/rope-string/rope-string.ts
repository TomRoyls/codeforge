import type { RopeNode, RopeOptions, RopeStats } from './types.js'
import { DEFAULT_ROPE_OPTIONS } from './types.js'

export class RopeString {
  private root: RopeNode
  private leafMaxSize: number
  private _length: number

  constructor(text?: string, options?: Partial<RopeOptions>) {
    const opts: RopeOptions = { ...DEFAULT_ROPE_OPTIONS, ...options }
    this.leafMaxSize = opts.leafMaxSize
    this.root = this.buildNode(text ?? '')
    this._length = this.nodeLength(this.root)
  }

  append(text: string): void {
    if (text.length === 0) return
    const textNode = this.buildNode(text)
    this.root = this.joinNodes(this.root, textNode)
    this._length = this.nodeLength(this.root)
  }

  prepend(text: string): void {
    if (text.length === 0) return
    const textNode = this.buildNode(text)
    this.root = this.joinNodes(textNode, this.root)
    this._length = this.nodeLength(this.root)
  }

  insert(index: number, text: string): void {
    if (text.length === 0) return
    const clampedIndex = Math.max(0, Math.min(index, this._length))
    const textNode = this.buildNode(text)
    const [left, right] = this.splitNode(this.root, clampedIndex)
    this.root = this.joinNodes(this.joinNodes(left, textNode), right)
    this._length = this.nodeLength(this.root)
  }

  delete(start: number, length: number): string {
    if (length <= 0) return ''
    const actualStart = Math.max(0, start)
    if (actualStart >= this._length) return ''
    const actualEnd = Math.min(this._length, actualStart + length)
    const deletedLength = actualEnd - actualStart
    if (deletedLength <= 0) return ''
    const [left, rest] = this.splitNode(this.root, actualStart)
    const [deleted, right] = this.splitNode(rest, deletedLength)
    this.root = this.joinNodes(left, right)
    this._length = this.nodeLength(this.root)
    return this.flattenNode(deleted)
  }

  charAt(index: number): string {
    if (index < 0 || index >= this._length) return ''
    return this.charAtNode(this.root, index)
  }

  substring(start: number, end?: number): string {
    let actualStart = start
    let actualEnd = end ?? this._length
    if (actualStart < 0) actualStart = 0
    if (actualEnd < 0) actualEnd = 0
    if (actualStart > actualEnd) {
      const temp = actualStart
      actualStart = actualEnd
      actualEnd = temp
    }
    if (actualStart >= this._length) return ''
    if (actualEnd > this._length) actualEnd = this._length
    if (actualStart >= actualEnd) return ''
    const [, rest] = this.splitNode(this.root, actualStart)
    const [result] = this.splitNode(rest, actualEnd - actualStart)
    return this.flattenNode(result)
  }

  indexOf(search: string, fromIndex?: number): number {
    return this.toString().indexOf(search, fromIndex)
  }

  toString(): string {
    return this.flattenNode(this.root)
  }

  length(): number {
    return this._length
  }

  isEmpty(): boolean {
    return this._length === 0
  }

  split(index: number): [RopeString, RopeString] {
    const clampedIndex = Math.max(0, Math.min(index, this._length))
    const [leftNode, rightNode] = this.splitNode(this.root, clampedIndex)
    const opts: RopeOptions = { leafMaxSize: this.leafMaxSize }
    const leftRope = new RopeString('', opts)
    leftRope.root = leftNode
    leftRope._length = this.nodeLength(leftNode)
    const rightRope = new RopeString('', opts)
    rightRope.root = rightNode
    rightRope._length = this.nodeLength(rightNode)
    return [leftRope, rightRope]
  }

  clone(): RopeString {
    const cloned = new RopeString('', { leafMaxSize: this.leafMaxSize })
    cloned.root = this.root
    cloned._length = this._length
    return cloned
  }

  concat(other: RopeString): RopeString {
    const result = new RopeString('', { leafMaxSize: this.leafMaxSize })
    result.root = this.joinNodes(this.cloneNode(this.root), this.cloneNode(other.root))
    result._length = this._length + other._length
    return result
  }

  isBalanced(): boolean {
    return this.checkBalanced(this.root)
  }

  rebalance(): void {
    const text = this.toString()
    this.root = this.buildNode(text)
    this._length = text.length
  }

  getStats(): RopeStats {
    const stats = this.computeStats(this.root)
    return stats
  }

  *[Symbol.iterator](): Iterator<string> {
    const text = this.toString()
    for (let i = 0; i < text.length; i++) {
      yield text[i]!
    }
  }

  clear(): void {
    this.root = ''
    this._length = 0
  }

  private buildNode(text: string): RopeNode {
    if (text.length <= this.leafMaxSize) return text
    const mid = Math.floor(text.length / 2)
    const left = this.buildNode(text.slice(0, mid))
    const right = this.buildNode(text.slice(mid))
    return { left, right, length: text.length }
  }

  private nodeLength(node: RopeNode): number {
    if (typeof node === 'string') return node.length
    return node.length
  }

  private flattenNode(node: RopeNode): string {
    if (typeof node === 'string') return node
    return this.flattenNode(node.left) + this.flattenNode(node.right)
  }

  private charAtNode(node: RopeNode, index: number): string {
    if (typeof node === 'string') {
      return index >= 0 && index < node.length ? node.charAt(index) : ''
    }
    const leftLen = this.nodeLength(node.left)
    if (index < leftLen) {
      return this.charAtNode(node.left, index)
    }
    return this.charAtNode(node.right, index - leftLen)
  }

  private splitNode(node: RopeNode, index: number): [RopeNode, RopeNode] {
    if (typeof node === 'string') {
      return [node.slice(0, index), node.slice(index)]
    }
    const leftLen = this.nodeLength(node.left)
    if (index <= leftLen) {
      const [leftPart, rightPartOfLeft] = this.splitNode(node.left, index)
      return [leftPart, this.joinNodes(rightPartOfLeft, node.right)]
    }
    const [leftPartOfRight, rightPart] = this.splitNode(node.right, index - leftLen)
    return [this.joinNodes(node.left, leftPartOfRight), rightPart]
  }

  private joinNodes(left: RopeNode, right: RopeNode): RopeNode {
    const leftLen = this.nodeLength(left)
    const rightLen = this.nodeLength(right)
    if (leftLen === 0) return right
    if (rightLen === 0) return left
    return { left, right, length: leftLen + rightLen }
  }

  private cloneNode(node: RopeNode): RopeNode {
    if (typeof node === 'string') return node
    return {
      left: this.cloneNode(node.left),
      right: this.cloneNode(node.right),
      length: node.length,
    }
  }

  private checkBalanced(node: RopeNode): boolean {
    if (typeof node === 'string') return true
    const leftH = this.nodeHeight(node.left)
    const rightH = this.nodeHeight(node.right)
    if (Math.abs(leftH - rightH) > 1) return false
    return this.checkBalanced(node.left) && this.checkBalanced(node.right)
  }

  private nodeHeight(node: RopeNode): number {
    if (typeof node === 'string') return 0
    return 1 + Math.max(this.nodeHeight(node.left), this.nodeHeight(node.right))
  }

  private computeStats(node: RopeNode): RopeStats {
    if (typeof node === 'string') {
      if (node.length === 0) {
        return { nodeCount: 0, height: 0, isBalanced: true, leafCount: 0 }
      }
      return { nodeCount: 0, height: 0, isBalanced: true, leafCount: 1 }
    }
    const leftStats = this.computeStats(node.left)
    const rightStats = this.computeStats(node.right)
    const height = 1 + Math.max(leftStats.height, rightStats.height)
    const balanced = Math.abs(leftStats.height - rightStats.height) <= 1 && leftStats.isBalanced && rightStats.isBalanced
    return {
      nodeCount: 1 + leftStats.nodeCount + rightStats.nodeCount,
      height,
      isBalanced: balanced,
      leafCount: leftStats.leafCount + rightStats.leafCount,
    }
  }
}

export { DEFAULT_ROPE_OPTIONS } from './types.js'
export type { RopeOptions, RopeNode } from './types.js'
