import type { RopeArrayOptions, RopeNode, LeafNode, InternalNode } from './types.js'

const DEFAULT_LEAF_SIZE = 512

function leaf(text: string): LeafNode {
  return { kind: 'leaf', text }
}

function internal(leftLength: number, left: RopeNode, right: RopeNode): InternalNode {
  return { kind: 'internal', leftLength, left, right }
}

function nodeLength(node: RopeNode): number {
  if (node.kind === 'leaf') return node.text.length
  return node.leftLength + nodeLength(node.right)
}

function flatten(node: RopeNode): string {
  if (node.kind === 'leaf') return node.text
  return flatten(node.left) + flatten(node.right)
}

function buildLeaf(text: string, leafSize: number): RopeNode {
  if (text.length <= leafSize) return leaf(text)
  const mid = Math.floor(text.length / 2)
  return internal(
    mid,
    buildLeaf(text.slice(0, mid), leafSize),
    buildLeaf(text.slice(mid), leafSize)
  )
}

function nodeDepth(node: RopeNode): number {
  if (node.kind === 'leaf') return 0
  return 1 + Math.max(nodeDepth(node.left), nodeDepth(node.right))
}

function nodeCharAt(node: RopeNode, index: number): string {
  if (node.kind === 'leaf') return node.text[index]!
  if (index < node.leftLength) return nodeCharAt(node.left, index)
  return nodeCharAt(node.right, index - node.leftLength)
}

function nodeSubstring(node: RopeNode, start: number, end: number): string {
  if (start >= end) return ''
  if (node.kind === 'leaf') return node.text.slice(start, end)
  if (end <= node.leftLength) return nodeSubstring(node.left, start, end)
  if (start >= node.leftLength) return nodeSubstring(node.right, start - node.leftLength, end - node.leftLength)
  return (
    nodeSubstring(node.left, start, node.leftLength) +
    nodeSubstring(node.right, 0, end - node.leftLength)
  )
}

function nodeInsert(node: RopeNode, position: number, text: string, leafSize: number): RopeNode {
  if (text.length === 0) return node
  if (node.kind === 'leaf') {
    const newStr = node.text.slice(0, position) + text + node.text.slice(position)
    return buildLeaf(newStr, leafSize)
  }
  if (position <= node.leftLength) {
    return internal(
      node.leftLength + text.length,
      nodeInsert(node.left, position, text, leafSize),
      node.right
    )
  }
  return internal(
    node.leftLength,
    node.left,
    nodeInsert(node.right, position - node.leftLength, text, leafSize)
  )
}

function nodeDelete(node: RopeNode, start: number, end: number, leafSize: number): RopeNode {
  if (start >= end) return node
  if (node.kind === 'leaf') {
    const newStr = node.text.slice(0, start) + node.text.slice(end)
    if (newStr.length === 0) return leaf('')
    return buildLeaf(newStr, leafSize)
  }
  const leftEnd = Math.min(end, node.leftLength)
  const rightStart = Math.max(start, node.leftLength)
  const deleteLeft = start < node.leftLength
  const deleteRight = end > node.leftLength
  if (deleteLeft && deleteRight) {
    const newLeft = nodeDelete(node.left, start, leftEnd, leafSize)
    const newRight = nodeDelete(node.right, rightStart - node.leftLength, end - node.leftLength, leafSize)
    const leftLen = nodeLength(newLeft)
    if (leftLen === 0) return newRight
    if (nodeLength(newRight) === 0) return newLeft
    return internal(leftLen, newLeft, newRight)
  }
  if (deleteLeft) {
    const newLeft = nodeDelete(node.left, start, leftEnd, leafSize)
    const leftLen = nodeLength(newLeft)
    if (leftLen === 0) return node.right
    return internal(leftLen, newLeft, node.right)
  }
  const newRight = nodeDelete(node.right, rightStart - node.leftLength, end - node.leftLength, leafSize)
  if (nodeLength(newRight) === 0) return node.left
  return internal(node.leftLength, node.left, newRight)
}

function nodeSplit(node: RopeNode, position: number): [RopeNode, RopeNode] {
  if (node.kind === 'leaf') {
    return [leaf(node.text.slice(0, position)), leaf(node.text.slice(position))]
  }
  if (position <= node.leftLength) {
    const [leftLeft, leftRight] = nodeSplit(node.left, position)
    return [leftLeft, internal(nodeLength(leftRight), leftRight, node.right)]
  }
  if (position === node.leftLength) {
    return [node.left, node.right]
  }
  const [rightLeft, rightRight] = nodeSplit(node.right, position - node.leftLength)
  return [internal(node.leftLength, node.left, rightLeft), rightRight]
}

function collectLeaves(node: RopeNode): string[] {
  if (node.kind === 'leaf') return [node.text]
  return [...collectLeaves(node.left), ...collectLeaves(node.right)]
}

function buildBalanced(leaves: string[], leafSize: number): RopeNode {
  const nonEmpty = leaves.filter((l) => l.length > 0)
  if (nonEmpty.length === 0) return leaf('')
  if (nonEmpty.length === 1) return leaf(nonEmpty[0]!)
  const mid = Math.floor(nonEmpty.length / 2)
  const left = buildBalanced(nonEmpty.slice(0, mid), leafSize)
  const right = buildBalanced(nonEmpty.slice(mid), leafSize)
  return internal(nodeLength(left), left, right)
}

function isBalancedNode(node: RopeNode): boolean {
  if (node.kind === 'leaf') return true
  const leftDepth = nodeDepth(node.left)
  const rightDepth = nodeDepth(node.right)
  if (Math.abs(leftDepth - rightDepth) > 1) return false
  return isBalancedNode(node.left) && isBalancedNode(node.right)
}

export class RopeArray {
  private root: RopeNode
  private _leafSize: number

  constructor(text?: string, options?: RopeArrayOptions) {
    this._leafSize = options?.leafSize ?? DEFAULT_LEAF_SIZE
    if (text === undefined || text === '') {
      this.root = leaf('')
    } else {
      this.root = buildLeaf(text, this._leafSize)
    }
  }

  get length(): number {
    return nodeLength(this.root)
  }

  toString(): string {
    return flatten(this.root)
  }

  charAt(index: number): string {
    if (index < 0 || index >= this.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.length})`)
    }
    return nodeCharAt(this.root, index)
  }

  substring(start: number, end?: number): string {
    const len = this.length
    const s = Math.max(0, start)
    const e = end !== undefined ? Math.min(end, len) : len
    if (s >= e) return ''
    return nodeSubstring(this.root, s, e)
  }

  insert(position: number, text: string): void {
    if (text.length === 0) return
    const len = this.length
    if (position < 0 || position > len) {
      throw new RangeError(`Position ${position} out of bounds [0, ${len}]`)
    }
    if (len === 0) {
      this.root = buildLeaf(text, this._leafSize)
      return
    }
    this.root = nodeInsert(this.root, position, text, this._leafSize)
  }

  delete(start: number, end: number): void {
    if (start >= end) return
    const len = this.length
    const s = Math.max(0, start)
    const e = Math.min(end, len)
    if (s >= e) return
    this.root = nodeDelete(this.root, s, e, this._leafSize)
    if (this.length === 0) {
      this.root = leaf('')
    }
  }

  concat(other: RopeArray): RopeArray {
    if (this.length === 0) {
      const result = new RopeArray(undefined, { leafSize: this._leafSize })
      result.root = deepClone(other.root)
      return result
    }
    if (other.length === 0) {
      const result = new RopeArray(undefined, { leafSize: this._leafSize })
      result.root = deepClone(this.root)
      return result
    }
    const result = new RopeArray(undefined, { leafSize: this._leafSize })
    result.root = internal(this.length, deepClone(this.root), deepClone(other.root))
    return result
  }

  split(position: number): [RopeArray, RopeArray] {
    const len = this.length
    if (position < 0 || position > len) {
      throw new RangeError(`Position ${position} out of bounds [0, ${len}]`)
    }
    const [leftNode, rightNode] = nodeSplit(this.root, position)
    const left = new RopeArray(undefined, { leafSize: this._leafSize })
    left.root = leftNode
    const right = new RopeArray(undefined, { leafSize: this._leafSize })
    right.root = rightNode
    return [left, right]
  }

  rebalance(): void {
    const leaves = collectLeaves(this.root)
    const merged: string[] = []
    let current = ''
    for (const leaf of leaves) {
      current += leaf
      if (current.length >= this._leafSize) {
        merged.push(current)
        current = ''
      }
    }
    if (current.length > 0) merged.push(current)
    this.root = buildBalanced(merged, this._leafSize)
  }

  depth(): number {
    return nodeDepth(this.root)
  }

  isBalanced(): boolean {
    return isBalancedNode(this.root)
  }
}

function deepClone(node: RopeNode): RopeNode {
  if (node.kind === 'leaf') return leaf(node.text)
  return internal(node.leftLength, deepClone(node.left), deepClone(node.right))
}
