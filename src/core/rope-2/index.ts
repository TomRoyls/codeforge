import { DEFAULT_LEAF_SIZE } from './types.js'
import type { Rope2Options, Rope2Node } from './types.js'

function isLeaf(node: Rope2Node): node is { readonly tag: 'leaf'; readonly text: string } {
  return node.tag === 'leaf'
}

function nodeLen(node: Rope2Node): number {
  if (isLeaf(node)) return node.text.length
  return node.len
}

function makeLeaf(text: string): Rope2Node {
  return { tag: 'leaf', text }
}

function makeNode(left: Rope2Node, right: Rope2Node): Rope2Node {
  return { tag: 'node', left, right, len: nodeLen(left) + nodeLen(right) }
}

function concatNodes(left: Rope2Node, right: Rope2Node): Rope2Node {
  if (isLeaf(left) && left.text.length === 0) return right
  if (isLeaf(right) && right.text.length === 0) return left
  return makeNode(left, right)
}

function buildFromString(str: string, leafSize: number): Rope2Node {
  if (str.length === 0) return makeLeaf('')
  if (str.length <= leafSize) return makeLeaf(str)
  const mid = Math.floor(str.length / 2)
  return makeNode(
    buildFromString(str.slice(0, mid), leafSize),
    buildFromString(str.slice(mid), leafSize),
  )
}

function flatten(node: Rope2Node): string {
  if (isLeaf(node)) return node.text
  return flatten(node.left) + flatten(node.right)
}

function splitAt(node: Rope2Node, index: number): [Rope2Node, Rope2Node] {
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

function getNodeChar(node: Rope2Node, index: number): string {
  if (isLeaf(node)) return node.text.charAt(index)
  const leftLen = nodeLen(node.left)
  if (index < leftLen) return getNodeChar(node.left, index)
  return getNodeChar(node.right, index - leftLen)
}

function collectSubstring(node: Rope2Node, start: number, end: number): string {
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

function reverseNode(node: Rope2Node): Rope2Node {
  if (isLeaf(node)) {
    return makeLeaf([...node.text].reverse().join(''))
  }
  return makeNode(reverseNode(node.right), reverseNode(node.left))
}

function forEachNode(node: Rope2Node, fn: (ch: string, index: number) => void, offset: number): void {
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

export class Rope2 {
  private root: Rope2Node
  private readonly leafSize: number

  constructor(str?: string, options?: Rope2Options) {
    this.leafSize = options?.leafSize ?? DEFAULT_LEAF_SIZE
    this.root = buildFromString(str ?? '', this.leafSize)
  }

  insert(index: number, str: string): void {
    if (str.length === 0) return
    const idx = Math.max(0, Math.min(index, this.length))
    const [left, right] = splitAt(this.root, idx)
    const mid = buildFromString(str, this.leafSize)
    this.root = concatNodes(concatNodes(left, mid), right)
  }

  delete(index: number, length: number): void {
    if (length <= 0 || this.length === 0) return
    const idx = Math.max(0, Math.min(index, this.length))
    const end = Math.min(idx + length, this.length)
    if (idx >= end) return
    const [left, rest] = splitAt(this.root, idx)
    const [, right] = splitAt(rest, end - idx)
    this.root = concatNodes(left, right)
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

  concat(other: Rope2 | string): Rope2 {
    const otherRoot = typeof other === 'string'
      ? buildFromString(other, this.leafSize)
      : other.root
    const result = new Rope2('', { leafSize: this.leafSize })
    result.root = concatNodes(this.root, otherRoot)
    return result
  }

  split(index: number): [Rope2, Rope2] {
    const idx = Math.max(0, Math.min(index, this.length))
    const [left, right] = splitAt(this.root, idx)
    const leftRope = new Rope2('', { leafSize: this.leafSize })
    leftRope.root = left
    const rightRope = new Rope2('', { leafSize: this.leafSize })
    rightRope.root = right
    return [leftRope, rightRope]
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

  get length(): number {
    return nodeLen(this.root)
  }

  get isEmpty(): boolean {
    return this.length === 0
  }

  toString(): string {
    return flatten(this.root)
  }

  toArray(): string[] {
    const result: string[] = []
    this.forEach((ch) => { result.push(ch) })
    return result
  }

  clone(): Rope2 {
    const cloned = new Rope2('', { leafSize: this.leafSize })
    cloned.root = this.root
    return cloned
  }

  clear(): void {
    this.root = makeLeaf('')
  }

  equals(other: Rope2): boolean {
    return this.toString() === other.toString()
  }

  reverse(): void {
    this.root = reverseNode(this.root)
  }

  repeat(count: number): Rope2 {
    if (count <= 0) return new Rope2('', { leafSize: this.leafSize })
    const str = this.toString()
    return new Rope2(str.repeat(count), { leafSize: this.leafSize })
  }

  replace(index: number, length: number, str: string): void {
    const idx = Math.max(0, Math.min(index, this.length))
    const end = Math.min(idx + length, this.length)
    const [left, rest] = splitAt(this.root, idx)
    const [, right] = splitAt(rest, end - idx)
    const mid = str.length > 0 ? buildFromString(str, this.leafSize) : makeLeaf('')
    this.root = concatNodes(concatNodes(left, mid), right)
  }

  forEach(callback: (ch: string, index: number) => void): void {
    forEachNode(this.root, callback, 0)
  }

  *[Symbol.iterator](): Iterator<string> {
    function* iter(node: Rope2Node): Generator<string> {
      if (isLeaf(node)) {
        for (const ch of node.text) yield ch
      } else {
        yield* iter(node.left)
        yield* iter(node.right)
      }
    }
    yield* iter(this.root)
  }

  static fromString(str: string, options?: Rope2Options): Rope2 {
    return new Rope2(str, options)
  }

  static concat(a: Rope2 | string, b: Rope2 | string): Rope2 {
    const ropeA = typeof a === 'string' ? new Rope2(a) : a
    return ropeA.concat(b)
  }

  rebalance(): void {
    const str = this.toString()
    this.root = buildFromString(str, this.leafSize)
  }

  toJSON() {
    return { type: 'Rope2', items: this.toArray() }
  }
}
