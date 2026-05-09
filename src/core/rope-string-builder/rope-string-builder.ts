import type { BuilderNode, RopeStringBuilderOptions, RopeStringBuilderStats } from './types.js'
import { DEFAULT_LEAF_SIZE } from './types.js'

const BALANCE_DELTA = 3

export class RopeStringBuilder {
  private root: BuilderNode
  private leafSize: number
  private cachedLength: number

  constructor(str?: string, options?: Partial<RopeStringBuilderOptions>) {
    this.leafSize = options?.leafSize ?? DEFAULT_LEAF_SIZE
    this.root = this.buildNode(str ?? '')
    this.cachedLength = this.nodeLength(this.root)
  }

  static from(str: string, options?: Partial<RopeStringBuilderOptions>): RopeStringBuilder {
    return new RopeStringBuilder(str, options)
  }

  append(str: string): void {
    if (str.length === 0) return
    const node = this.buildNode(str)
    this.root = this.join(this.root, node)
    this.cachedLength = this.nodeLength(this.root)
  }

  prepend(str: string): void {
    if (str.length === 0) return
    const node = this.buildNode(str)
    this.root = this.join(node, this.root)
    this.cachedLength = this.nodeLength(this.root)
  }

  insert(index: number, str: string): void {
    if (str.length === 0) return
    const clamped = Math.max(0, Math.min(index, this.cachedLength))
    const newNode = this.buildNode(str)
    const [left, right] = this.splitNode(this.root, clamped)
    this.root = this.join(this.join(left, newNode), right)
    this.cachedLength = this.nodeLength(this.root)
  }

  delete(start: number, end: number): void {
    const actualStart = Math.max(0, start)
    const actualEnd = Math.max(actualStart, Math.min(end, this.cachedLength))
    if (actualStart >= actualEnd) return
    const [left, rest] = this.splitNode(this.root, actualStart)
    const [, right] = this.splitNode(rest, actualEnd - actualStart)
    this.root = this.join(left, right)
    this.cachedLength = this.nodeLength(this.root)
  }

  substring(start: number, end: number): string {
    let actualStart = start
    let actualEnd = end
    if (actualStart < 0) actualStart = 0
    if (actualEnd < 0) actualEnd = 0
    if (actualStart > actualEnd) {
      const temp = actualStart
      actualStart = actualEnd
      actualEnd = temp
    }
    if (actualStart >= this.cachedLength) return ''
    if (actualEnd > this.cachedLength) actualEnd = this.cachedLength
    if (actualStart >= actualEnd) return ''
    const [, rest] = this.splitNode(this.root, actualStart)
    const [result] = this.splitNode(rest, actualEnd - actualStart)
    return this.flatten(result)
  }

  charAt(index: number): string {
    if (index < 0 || index >= this.cachedLength) return ''
    return this.charAtInNode(this.root, index)
  }

  get length(): number {
    return this.cachedLength
  }

  toString(): string {
    return this.flatten(this.root)
  }

  indexOf(str: string, fromIndex?: number): number {
    return this.toString().indexOf(str, fromIndex)
  }

  split(index: number): [RopeStringBuilder, RopeStringBuilder] {
    const clamped = Math.max(0, Math.min(index, this.cachedLength))
    const [leftNode, rightNode] = this.splitNode(this.root, clamped)
    const leftBuilder = new RopeStringBuilder('', { leafSize: this.leafSize })
    leftBuilder.root = leftNode
    leftBuilder.cachedLength = this.nodeLength(leftNode)
    const rightBuilder = new RopeStringBuilder('', { leafSize: this.leafSize })
    rightBuilder.root = rightNode
    rightBuilder.cachedLength = this.nodeLength(rightNode)
    return [leftBuilder, rightBuilder]
  }

  clone(): RopeStringBuilder {
    const cloned = new RopeStringBuilder('', { leafSize: this.leafSize })
    cloned.root = this.root
    cloned.cachedLength = this.cachedLength
    return cloned
  }

  stats(): RopeStringBuilderStats {
    let nodeCount = 0
    let leafCount = 0
    let depth = 0
    const countNodes = (node: BuilderNode, d: number): void => {
      nodeCount++
      if (d > depth) depth = d
      if (node.kind === 'leaf') {
        leafCount++
      } else {
        countNodes(node.left, d + 1)
        countNodes(node.right, d + 1)
      }
    }
    countNodes(this.root, 0)
    return {
      length: this.cachedLength,
      nodeCount,
      leafCount,
      depth,
    }
  }

  private buildNode(text: string): BuilderNode {
    if (text.length === 0) return { kind: 'leaf', text: '' }
    if (text.length <= this.leafSize) return { kind: 'leaf', text }
    const mid = Math.floor(text.length / 2)
    const left = this.buildNode(text.slice(0, mid))
    const right = this.buildNode(text.slice(mid))
    return { kind: 'internal', left, right, length: text.length }
  }

  private nodeLength(node: BuilderNode): number {
    if (node.kind === 'leaf') return node.text.length
    return node.length
  }

  private flatten(node: BuilderNode): string {
    if (node.kind === 'leaf') return node.text
    return this.flatten(node.left) + this.flatten(node.right)
  }

  private charAtInNode(node: BuilderNode, index: number): string {
    if (node.kind === 'leaf') {
      return node.text[index] ?? ''
    }
    const leftLen = this.nodeLength(node.left)
    if (index < leftLen) return this.charAtInNode(node.left, index)
    return this.charAtInNode(node.right, index - leftLen)
  }

  private splitNode(node: BuilderNode, index: number): [BuilderNode, BuilderNode] {
    if (node.kind === 'leaf') {
      return [
        { kind: 'leaf', text: node.text.slice(0, index) },
        { kind: 'leaf', text: node.text.slice(index) },
      ]
    }
    const leftLen = this.nodeLength(node.left)
    if (index <= leftLen) {
      const [leftPart, rightPartOfLeft] = this.splitNode(node.left, index)
      return [leftPart, this.joinRaw(rightPartOfLeft, node.right)]
    }
    const [leftPartOfRight, rightPart] = this.splitNode(node.right, index - leftLen)
    return [this.joinRaw(node.left, leftPartOfRight), rightPart]
  }

  private joinRaw(left: BuilderNode, right: BuilderNode): BuilderNode {
    const leftLen = this.nodeLength(left)
    const rightLen = this.nodeLength(right)
    if (leftLen === 0) return right
    if (rightLen === 0) return left
    if (left.kind === 'leaf' && right.kind === 'leaf' && leftLen + rightLen <= this.leafSize) {
      return { kind: 'leaf', text: left.text + right.text }
    }
    return { kind: 'internal', left, right, length: leftLen + rightLen }
  }

  private join(left: BuilderNode, right: BuilderNode): BuilderNode {
    const joined = this.joinRaw(left, right)
    return this.rebalance(joined)
  }

  private rebalance(node: BuilderNode): BuilderNode {
    if (node.kind === 'leaf') return node
    const left = this.rebalance(node.left)
    const right = this.rebalance(node.right)
    const leftLen = this.nodeLength(left)
    const rightLen = this.nodeLength(right)
    if (leftLen === 0) return right
    if (rightLen === 0) return left
    const leftDepth = this.nodeDepth(left)
    const rightDepth = this.nodeDepth(right)
    if (Math.abs(leftDepth - rightDepth) <= BALANCE_DELTA) {
      if (left === node.left && right === node.right) return node
      return { kind: 'internal', left, right, length: leftLen + rightLen }
    }
    const text = this.flatten(left) + this.flatten(right)
    return this.buildNode(text)
  }

  private nodeDepth(node: BuilderNode): number {
    if (node.kind === 'leaf') return 0
    return 1 + Math.max(this.nodeDepth(node.left), this.nodeDepth(node.right))
  }

}

export { DEFAULT_LEAF_SIZE } from './types.js'
export type { RopeStringBuilderOptions, RopeStringBuilderStats, BuilderNode } from './types.js'
