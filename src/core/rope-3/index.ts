import { DEFAULT_LEAF_SIZE } from './types.js'
import type { Rope3Options, RopeNode } from './types.js'

function isLeaf(node: RopeNode): node is { readonly tag: 'leaf'; readonly text: string } {
  return node.tag === 'leaf'
}

function nodeLen(node: RopeNode): number {
  if (isLeaf(node)) return node.text.length
  return node.len
}

function nodeHeight(node: RopeNode): number {
  if (isLeaf(node)) return 0
  return node.height
}

function makeLeaf(text: string): RopeNode {
  return { tag: 'leaf', text }
}

function makeNode(left: RopeNode, right: RopeNode): RopeNode {
  return {
    tag: 'node',
    left,
    right,
    len: nodeLen(left) + nodeLen(right),
    height: 1 + Math.max(nodeHeight(left), nodeHeight(right)),
  }
}

function concatNodes(left: RopeNode, right: RopeNode): RopeNode {
  if (isLeaf(left) && left.text.length === 0) return right
  if (isLeaf(right) && right.text.length === 0) return left
  return makeNode(left, right)
}

function buildFromString(str: string, leafSize: number, lo: number, hi: number): RopeNode {
  const len = hi - lo
  if (len <= 0) return makeLeaf('')
  if (len <= leafSize) return makeLeaf(str.slice(lo, hi))
  const mid = lo + Math.floor(len / 2)
  const left = buildFromString(str, leafSize, lo, mid)
  const right = buildFromString(str, leafSize, mid, hi)
  return makeNode(left, right)
}

function flatten(node: RopeNode): string {
  if (isLeaf(node)) return node.text
  return flatten(node.left) + flatten(node.right)
}

function collectLeaves(node: RopeNode, result: string[]): void {
  if (isLeaf(node)) {
    if (node.text.length > 0) result.push(node.text)
    return
  }
  collectLeaves(node.left, result)
  collectLeaves(node.right, result)
}

function buildBalanced(leaves: string[], leafSize: number, lo: number, hi: number): RopeNode {
  if (lo >= hi) return makeLeaf('')
  const rangeLen = leaves.slice(lo, hi).join('').length
  if (rangeLen === 0) return makeLeaf('')
  if (hi - lo === 1) return makeLeaf(leaves[lo]!)
  if (hi - lo === 2) return makeNode(makeLeaf(leaves[lo]!), makeLeaf(lo + 1 < hi ? leaves[lo + 1]! : ''))
  const mid = lo + Math.floor((hi - lo) / 2)
  const left = buildBalanced(leaves, leafSize, lo, mid)
  const right = buildBalanced(leaves, leafSize, mid, hi)
  return makeNode(left, right)
}

function rebalance(node: RopeNode, leafSize: number): RopeNode {
  const leaves: string[] = []
  collectLeaves(node, leaves)
  if (leaves.length === 0) return makeLeaf('')
  const merged: string[] = []
  let buf = ''
  for (const leaf of leaves) {
    buf += leaf
    if (buf.length >= leafSize) {
      merged.push(buf)
      buf = ''
    }
  }
  if (buf.length > 0) merged.push(buf)
  return buildBalanced(merged, leafSize, 0, merged.length)
}

function maxHeightForLength(length: number, leafSize: number): number {
  if (length <= 0) return 1
  return 2 * Math.ceil(Math.log2(Math.max(1, length / leafSize))) + 2
}

function needsRebalance(node: RopeNode, leafSize: number): boolean {
  return nodeHeight(node) > maxHeightForLength(nodeLen(node), leafSize)
}

function splitAt(node: RopeNode, index: number): [RopeNode, RopeNode] {
  if (isLeaf(node)) {
    if (index <= 0) return [makeLeaf(''), node]
    if (index >= node.text.length) return [node, makeLeaf('')]
    return [makeLeaf(node.text.slice(0, index)), makeLeaf(node.text.slice(index))]
  }
  if (index <= 0) return [makeLeaf(''), node]
  if (index >= node.len) return [node, makeLeaf('')]
  const leftLen = nodeLen(node.left)
  if (index < leftLen) {
    const [ll, lr] = splitAt(node.left, index)
    return [ll, concatNodes(lr, node.right)]
  }
  if (index > leftLen) {
    const [rl, rr] = splitAt(node.right, index - leftLen)
    return [concatNodes(node.left, rl), rr]
  }
  return [node.left, node.right]
}

function getNodeChar(node: RopeNode, index: number): string {
  if (isLeaf(node)) return node.text.charAt(index)
  const leftLen = nodeLen(node.left)
  if (index < leftLen) return getNodeChar(node.left, index)
  return getNodeChar(node.right, index - leftLen)
}

function collectSubstring(node: RopeNode, start: number, end: number): string {
  if (start >= end) return ''
  const len = nodeLen(node)
  if (start >= len || end <= 0) return ''
  if (isLeaf(node)) {
    return node.text.slice(Math.max(0, start), Math.min(node.text.length, end))
  }
  const leftLen = nodeLen(node.left)
  let result = ''
  if (start < leftLen) {
    result += collectSubstring(node.left, start, Math.min(end, leftLen))
  }
  if (end > leftLen) {
    result += collectSubstring(node.right, Math.max(0, start - leftLen), end - leftLen)
  }
  return result
}

function reverseNode(node: RopeNode): RopeNode {
  if (isLeaf(node)) {
    let reversed = ''
    for (let i = node.text.length - 1; i >= 0; i--) {
      reversed += node.text.charAt(i)
    }
    return makeLeaf(reversed)
  }
  return makeNode(reverseNode(node.right), reverseNode(node.left))
}

function forEachNode(node: RopeNode, fn: (ch: string, index: number) => void, offset: number): void {
  if (isLeaf(node)) {
    for (let i = 0; i < node.text.length; i++) {
      fn(node.text.charAt(i), offset + i)
    }
    return
  }
  const leftLen = nodeLen(node.left)
  forEachNode(node.left, fn, offset)
  forEachNode(node.right, fn, offset + leftLen)
}

function transformNode(node: RopeNode, fn: (s: string) => string): RopeNode {
  if (isLeaf(node)) return makeLeaf(fn(node.text))
  return makeNode(transformNode(node.left, fn), transformNode(node.right, fn))
}

export class Rope3 {
  private root: RopeNode
  private readonly leafSize: number

  constructor(str?: string, options?: Rope3Options) {
    this.leafSize = options?.leafSize ?? DEFAULT_LEAF_SIZE
    const s = str ?? ''
    this.root = buildFromString(s, this.leafSize, 0, s.length)
  }

  private maybeRebalance(): void {
    if (needsRebalance(this.root, this.leafSize)) {
      this.root = rebalance(this.root, this.leafSize)
    }
  }

  toString(): string {
    return flatten(this.root)
  }

  charAt(index: number): string {
    if (index < 0 || index >= this.length) return ''
    return getNodeChar(this.root, index)
  }

  substring(start: number, end?: number): string {
    const s = Math.max(0, start)
    const e = Math.min(this.length, end ?? this.length)
    if (s >= e) return ''
    return collectSubstring(this.root, s, e)
  }

  insert(index: number, str: string): void {
    if (str.length === 0) return
    const idx = Math.max(0, Math.min(index, this.length))
    const [left, right] = splitAt(this.root, idx)
    const mid = buildFromString(str, this.leafSize, 0, str.length)
    this.root = concatNodes(concatNodes(left, mid), right)
    this.maybeRebalance()
  }

  delete(start: number, length: number): void {
    if (length <= 0 || this.length === 0) return
    const idx = Math.max(0, Math.min(start, this.length))
    const end = Math.min(idx + length, this.length)
    if (idx >= end) return
    const [left, rest] = splitAt(this.root, idx)
    const [, right] = splitAt(rest, end - idx)
    this.root = concatNodes(left, right)
    this.maybeRebalance()
  }

  concat(other: Rope3 | string): Rope3 {
    const otherRoot = typeof other === 'string'
      ? buildFromString(other, this.leafSize, 0, other.length)
      : other.root
    const result = new Rope3('', { leafSize: this.leafSize })
    result.root = concatNodes(this.root, otherRoot)
    if (needsRebalance(result.root, this.leafSize)) {
      result.root = rebalance(result.root, this.leafSize)
    }
    return result
  }

  split(index: number): [Rope3, Rope3] {
    const idx = Math.max(0, Math.min(index, this.length))
    const [left, right] = splitAt(this.root, idx)
    const leftRope = new Rope3('', { leafSize: this.leafSize })
    leftRope.root = left
    const rightRope = new Rope3('', { leafSize: this.leafSize })
    rightRope.root = right
    return [leftRope, rightRope]
  }

  get length(): number {
    return nodeLen(this.root)
  }

  isEmpty(): boolean {
    return this.length === 0
  }

  indexOf(str: string, fromIndex?: number): number {
    return this.toString().indexOf(str, fromIndex)
  }

  includes(str: string): boolean {
    return this.toString().includes(str)
  }

  startsWith(str: string): boolean {
    return this.toString().startsWith(str)
  }

  endsWith(str: string): boolean {
    return this.toString().endsWith(str)
  }

  replace(start: number, end: number, str: string): void {
    const s = Math.max(0, Math.min(start, this.length))
    const e = Math.max(s, Math.min(end, this.length))
    const [left, rest] = splitAt(this.root, s)
    const [, right] = splitAt(rest, e - s)
    const mid = str.length > 0 ? buildFromString(str, this.leafSize, 0, str.length) : makeLeaf('')
    this.root = concatNodes(concatNodes(left, mid), right)
    this.maybeRebalance()
  }

  clone(): Rope3 {
    const cloned = new Rope3('', { leafSize: this.leafSize })
    cloned.root = this.root
    return cloned
  }

  forEach(callback: (ch: string, index: number) => void): void {
    forEachNode(this.root, callback, 0)
  }

  toArray(): string[] {
    const result: string[] = []
    this.forEach((ch) => { result.push(ch) })
    return result
  }

  reverse(): void {
    this.root = reverseNode(this.root)
  }

  toUpperCase(): Rope3 {
    const result = new Rope3('', { leafSize: this.leafSize })
    result.root = transformNode(this.root, (s) => s.toUpperCase())
    return result
  }

  toLowerCase(): Rope3 {
    const result = new Rope3('', { leafSize: this.leafSize })
    result.root = transformNode(this.root, (s) => s.toLowerCase())
    return result
  }

  trim(): Rope3 {
    const s = this.toString().trim()
    return new Rope3(s, { leafSize: this.leafSize })
  }

  padStart(targetLength: number, padStr?: string): Rope3 {
    const s = this.toString().padStart(targetLength, padStr)
    return new Rope3(s, { leafSize: this.leafSize })
  }

  padEnd(targetLength: number, padStr?: string): Rope3 {
    const s = this.toString().padEnd(targetLength, padStr)
    return new Rope3(s, { leafSize: this.leafSize })
  }

  repeat(count: number): Rope3 {
    if (count <= 0) return new Rope3('', { leafSize: this.leafSize })
    const s = this.toString().repeat(count)
    return new Rope3(s, { leafSize: this.leafSize })
  }

  rebalance(): void {
    this.root = rebalance(this.root, this.leafSize)
  }

  [Symbol.iterator](): Iterator<string> {
    const arr = this.toArray()
    let idx = 0
    return {
      next: () => {
        if (idx < arr.length) {
          const value = arr[idx]!
          idx++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<string>
      },
    }
  }

  static fromString(str: string, options?: Rope3Options): Rope3 {
    return new Rope3(str, options)
  }

  static concat(a: Rope3 | string, b: Rope3 | string): Rope3 {
    const ropeA = typeof a === 'string' ? new Rope3(a) : a
    return ropeA.concat(b)
  }

  clear(): void {
    this.root = { tag: 'leaf', text: '' } as RopeNode
  }

  toJSON() {
    return { type: 'Rope3', items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'Rope3'
  }

  contains(str: string): boolean {
    return this.includes(str)
  }
}
