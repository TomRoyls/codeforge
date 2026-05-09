import type { PersistentRopeNode } from './types.js'
import { DEFAULT_LEAF_SIZE } from './types.js'

export class RopePersistent {
  private readonly root: PersistentRopeNode
  private readonly leafSize: number

  constructor(text?: string, leafSize?: number) {
    this.leafSize = leafSize ?? DEFAULT_LEAF_SIZE
    this.root = this.buildNode(text ?? '')
  }

  static fromString(text: string, leafSize?: number): RopePersistent {
    return new RopePersistent(text, leafSize)
  }

  concat(other: RopePersistent): RopePersistent {
    if (this.nodeLength(this.root) === 0) return other.clone()
    if (this.nodeLength(other.root) === 0) return this.clone()
    return this.createFromNode(this.joinNodes(this.root, other.root))
  }

  split(index: number): [RopePersistent, RopePersistent] {
    const len = this.nodeLength(this.root)
    const clamped = Math.max(0, Math.min(index, len))
    const [leftNode, rightNode] = this.splitNode(this.root, clamped)
    return [this.createFromNode(leftNode), this.createFromNode(rightNode)]
  }

  insert(index: number, text: string): RopePersistent {
    if (text.length === 0) return this.clone()
    const len = this.nodeLength(this.root)
    const clamped = Math.max(0, Math.min(index, len))
    const textNode = this.buildNode(text)
    const [left, right] = this.splitNode(this.root, clamped)
    return this.createFromNode(this.joinNodes(this.joinNodes(left, textNode), right))
  }

  delete(start: number, end: number): RopePersistent {
    const len = this.nodeLength(this.root)
    const actualStart = Math.max(0, start)
    const actualEnd = Math.max(actualStart, Math.min(end, len))
    if (actualStart >= actualEnd) return this.clone()
    const [left, rest] = this.splitNode(this.root, actualStart)
    const [, right] = this.splitNode(rest, actualEnd - actualStart)
    return this.createFromNode(this.joinNodes(left, right))
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
    const len = this.nodeLength(this.root)
    if (actualStart >= len) return ''
    if (actualEnd > len) actualEnd = len
    if (actualStart >= actualEnd) return ''
    const [, rest] = this.splitNode(this.root, actualStart)
    const [result] = this.splitNode(rest, actualEnd - actualStart)
    return this.flattenNode(result)
  }

  charAt(index: number): string {
    const len = this.nodeLength(this.root)
    if (index < 0 || index >= len) return ''
    return this.charAtNode(this.root, index)
  }

  indexOf(search: string, fromIndex?: number): number {
    return this.toString().indexOf(search, fromIndex)
  }

  lastIndexOf(search: string, fromIndex?: number): number {
    const text = this.toString()
    if (fromIndex !== undefined) return text.lastIndexOf(search, fromIndex)
    return text.lastIndexOf(search)
  }

  length(): number {
    return this.nodeLength(this.root)
  }

  isEmpty(): boolean {
    return this.nodeLength(this.root) === 0
  }

  toString(): string {
    return this.flattenNode(this.root)
  }

  equals(other: RopePersistent): boolean {
    return this.toString() === other.toString()
  }

  clone(): RopePersistent {
    return this.createFromNode(this.root)
  }

  depth(): number {
    return this.nodeDepth(this.root)
  }

  balance(): RopePersistent {
    const text = this.flattenNode(this.root)
    return new RopePersistent(text, this.leafSize)
  }

  forEach(callback: (char: string, index: number) => void): void {
    const text = this.toString()
    for (let i = 0; i < text.length; i++) {
      callback(text[i]!, i)
    }
  }

  map(callback: (char: string, index: number) => string): RopePersistent {
    const text = this.toString()
    let result = ''
    for (let i = 0; i < text.length; i++) {
      result += callback(text[i]!, i)
    }
    return new RopePersistent(result, this.leafSize)
  }

  reverse(): RopePersistent {
    const text = this.toString()
    let reversed = ''
    for (let i = text.length - 1; i >= 0; i--) {
      reversed += text[i]!
    }
    return new RopePersistent(reversed, this.leafSize)
  }

  [Symbol.iterator](): Iterator<string> {
    const text = this.toString()
    let index = 0
    return {
      next(): IteratorResult<string> {
        if (index >= text.length) {
          return { value: undefined, done: true }
        }
        const ch = text[index]!
        index++
        return { value: ch, done: false }
      },
    }
  }

  private createFromNode(node: PersistentRopeNode): RopePersistent {
    return new RopePersistent(this.flattenNode(node), this.leafSize)
  }

  private buildNode(text: string): PersistentRopeNode {
    if (text.length <= this.leafSize) {
      return { kind: 'leaf', text }
    }
    const mid = Math.floor(text.length / 2)
    const left = this.buildNode(text.slice(0, mid))
    const right = this.buildNode(text.slice(mid))
    return { kind: 'internal', left, right, length: text.length }
  }

  private nodeLength(node: PersistentRopeNode): number {
    if (node.kind === 'leaf') return node.text.length
    return node.length
  }

  private flattenNode(node: PersistentRopeNode): string {
    if (node.kind === 'leaf') return node.text
    return this.flattenNode(node.left) + this.flattenNode(node.right)
  }

  private charAtNode(node: PersistentRopeNode, index: number): string {
    if (node.kind === 'leaf') {
      return node.text[index] ?? ''
    }
    const leftLen = this.nodeLength(node.left)
    if (index < leftLen) {
      return this.charAtNode(node.left, index)
    }
    return this.charAtNode(node.right, index - leftLen)
  }

  private splitNode(node: PersistentRopeNode, index: number): [PersistentRopeNode, PersistentRopeNode] {
    if (node.kind === 'leaf') {
      return [
        { kind: 'leaf', text: node.text.slice(0, index) },
        { kind: 'leaf', text: node.text.slice(index) },
      ]
    }
    const leftLen = this.nodeLength(node.left)
    if (index <= leftLen) {
      const [leftPart, rightPartOfLeft] = this.splitNode(node.left, index)
      return [leftPart, this.joinNodes(rightPartOfLeft, node.right)]
    }
    const [leftPartOfRight, rightPart] = this.splitNode(node.right, index - leftLen)
    return [this.joinNodes(node.left, leftPartOfRight), rightPart]
  }

  private joinNodes(
    left: PersistentRopeNode,
    right: PersistentRopeNode,
  ): PersistentRopeNode {
    const leftLen = this.nodeLength(left)
    const rightLen = this.nodeLength(right)
    if (leftLen === 0) return right
    if (rightLen === 0) return left
    return { kind: 'internal', left, right, length: leftLen + rightLen }
  }

  private nodeDepth(node: PersistentRopeNode): number {
    if (node.kind === 'leaf') return 0
    return 1 + Math.max(this.nodeDepth(node.left), this.nodeDepth(node.right))
  }
}

export { DEFAULT_LEAF_SIZE } from './types.js'
export type { PersistentRopeNode } from './types.js'
