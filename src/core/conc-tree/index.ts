import { BLOCK_SIZE, MAX_HEIGHT_DIFF } from './types.js'
import type { ConcTreeNode, ConcTreeStats } from './types.js'

function isLeaf<T>(n: ConcTreeNode<T>): n is { readonly tag: 'leaf'; readonly values: readonly T[] } {
  return n.tag === 'leaf'
}

function nodeSize<T>(n: ConcTreeNode<T>): number {
  if (isLeaf(n)) return n.values.length
  return n.size
}

function nodeHeight<T>(n: ConcTreeNode<T>): number {
  if (isLeaf(n)) return 0
  return n.height
}

function makeLeaf<T>(values: readonly T[]): ConcTreeNode<T> {
  return { tag: 'leaf', values }
}

function makeNode<T>(left: ConcTreeNode<T>, right: ConcTreeNode<T>): ConcTreeNode<T> {
  return {
    tag: 'node',
    left,
    right,
    size: nodeSize(left) + nodeSize(right),
    height: Math.max(nodeHeight(left), nodeHeight(right)) + 1,
  }
}

function concatNodes<T>(left: ConcTreeNode<T>, right: ConcTreeNode<T>): ConcTreeNode<T> {
  if (isLeaf(left) && left.values.length === 0) return right
  if (isLeaf(right) && right.values.length === 0) return left

  const lh = nodeHeight(left)
  const rh = nodeHeight(right)

  if (Math.abs(lh - rh) <= MAX_HEIGHT_DIFF) {
    return makeNode(left, right)
  }

  if (lh > rh) {
    if (left.tag === 'node') {
      const joined = concatNodes(left.right, right)
      return makeNode(left.left, joined)
    }
    return makeNode(left, right)
  }

  if (right.tag === 'node') {
    const joined = concatNodes(left, right.left)
    return makeNode(joined, right.right)
  }
  return makeNode(left, right)
}

function splitNode<T>(node: ConcTreeNode<T>, index: number): [ConcTreeNode<T>, ConcTreeNode<T>] {
  const sz = nodeSize(node)
  if (index <= 0) return [makeLeaf([]), node]
  if (index >= sz) return [node, makeLeaf([])]

  if (isLeaf(node)) {
    return [makeLeaf(node.values.slice(0, index)), makeLeaf(node.values.slice(index))]
  }

  const leftSize = nodeSize(node.left)
  if (index < leftSize) {
    const [ll, lr] = splitNode(node.left, index)
    return [ll, concatNodes(lr, node.right)]
  }
  if (index > leftSize) {
    const [rl, rr] = splitNode(node.right, index - leftSize)
    return [concatNodes(node.left, rl), rr]
  }
  return [node.left, node.right]
}

function unsafeGet<T>(arr: readonly T[], index: number): T {
  for (const [i, v] of arr.entries()) {
    if (i === index) return v
  }
  throw new Error('Index out of bounds')
}

function getNode<T>(node: ConcTreeNode<T>, index: number): T {
  if (isLeaf(node)) return unsafeGet(node.values, index)
  const leftSize = nodeSize(node.left)
  if (index < leftSize) return getNode(node.left, index)
  return getNode(node.right, index - leftSize)
}

function setNode<T>(node: ConcTreeNode<T>, index: number, value: T): ConcTreeNode<T> {
  if (isLeaf(node)) {
    const newValues = node.values.slice()
    newValues[index] = value
    return makeLeaf(newValues)
  }
  const leftSize = nodeSize(node.left)
  if (index < leftSize) {
    return makeNode(setNode(node.left, index, value), node.right)
  }
  return makeNode(node.left, setNode(node.right, index - leftSize, value))
}

function flattenNode<T>(node: ConcTreeNode<T>): T[] {
  if (isLeaf(node)) return [...node.values]
  return [...flattenNode(node.left), ...flattenNode(node.right)]
}

function mapNode<T, U>(node: ConcTreeNode<T>, fn: (value: T, index: number) => U, offset: number): ConcTreeNode<U> {
  if (isLeaf(node)) {
    return makeLeaf(node.values.map((v, i) => fn(v, offset + i)))
  }
  const leftSize = nodeSize(node.left)
  return makeNode(mapNode(node.left, fn, offset), mapNode(node.right, fn, offset + leftSize))
}

function filterNode<T>(node: ConcTreeNode<T>, predicate: (value: T, index: number) => boolean, offset: number): T[] {
  if (isLeaf(node)) {
    const result: T[] = []
    for (let i = 0; i < node.values.length; i++) {
      if (predicate(unsafeGet(node.values, i), offset + i)) result.push(unsafeGet(node.values, i))
    }
    return result
  }
  const leftSize = nodeSize(node.left)
  return [...filterNode(node.left, predicate, offset), ...filterNode(node.right, predicate, offset + leftSize)]
}

function reduceNode<T, U>(node: ConcTreeNode<T>, fn: (acc: U, value: T, index: number) => U, acc: U, offset: number): U {
  if (isLeaf(node)) {
    let cur = acc
    for (let i = 0; i < node.values.length; i++) {
      cur = fn(cur, unsafeGet(node.values, i), offset + i)
    }
    return cur
  }
  const leftSize = nodeSize(node.left)
  const leftResult = reduceNode(node.left, fn, acc, offset)
  return reduceNode(node.right, fn, leftResult, offset + leftSize)
}

function forEachNode<T>(node: ConcTreeNode<T>, fn: (value: T, index: number) => void, offset: number): void {
  if (isLeaf(node)) {
    for (let i = 0; i < node.values.length; i++) {
      fn(unsafeGet(node.values, i), offset + i)
    }
    return
  }
  const leftSize = nodeSize(node.left)
  forEachNode(node.left, fn, offset)
  forEachNode(node.right, fn, offset + leftSize)
}

function reverseNode<T>(node: ConcTreeNode<T>): ConcTreeNode<T> {
  if (isLeaf(node)) return makeLeaf([...node.values].reverse())
  return makeNode(reverseNode(node.right), reverseNode(node.left))
}

function fromArrayChunks<T>(items: readonly T[], start: number, end: number): ConcTreeNode<T> {
  const len = end - start
  if (len <= 0) return makeLeaf([])
  if (len <= BLOCK_SIZE) return makeLeaf(items.slice(start, end))
  const mid = start + Math.floor(len / 2)
  const left = fromArrayChunks(items, start, mid)
  const right = fromArrayChunks(items, mid, end)
  return makeNode(left, right)
}

export class ConcTree<T> {
  private readonly _root: ConcTreeNode<T>

  private constructor(root: ConcTreeNode<T>) {
    this._root = root
  }

  static fromArray<T>(items: readonly T[]): ConcTree<T> {
    if (items.length === 0) return new ConcTree<T>(makeLeaf([]))
    return new ConcTree(fromArrayChunks(items, 0, items.length))
  }

  static empty<T>(): ConcTree<T> {
    return new ConcTree<T>(makeLeaf([]))
  }

  concat(other: ConcTree<T>): ConcTree<T> {
    if (this.isEmpty) return other.clone()
    if (other.isEmpty) return this.clone()
    return new ConcTree(concatNodes(this._root, other._root))
  }

  split(index: number): [ConcTree<T>, ConcTree<T>] {
    const idx = Math.max(0, Math.min(index, this.size))
    const [left, right] = splitNode(this._root, idx)
    return [new ConcTree(left), new ConcTree(right)]
  }

  insert(index: number, value: T): ConcTree<T> {
    const idx = Math.max(0, Math.min(index, this.size))
    const singleLeaf = makeLeaf([value])
    if (idx === 0) return new ConcTree(concatNodes(singleLeaf, this._root))
    if (idx === this.size) return new ConcTree(concatNodes(this._root, singleLeaf))
    const [left, right] = splitNode(this._root, idx)
    return new ConcTree(concatNodes(concatNodes(left, singleLeaf), right))
  }

  remove(index: number): ConcTree<T> {
    if (index < 0 || index >= this.size) return this.clone()
    const [left, rest] = splitNode(this._root, index)
    const [, right] = splitNode(rest, 1)
    return new ConcTree(concatNodes(left, right))
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.size) return undefined
    return getNode(this._root, index)
  }

  set(index: number, value: T): ConcTree<T> {
    if (index < 0 || index >= this.size) return this.clone()
    return new ConcTree(setNode(this._root, index, value))
  }

  push(item: T): ConcTree<T> {
    return this.insert(this.size, item)
  }

  pop(): [ConcTree<T>, T | undefined] {
    if (this.isEmpty) return [this.clone(), undefined]
    const val = this.get(this.size - 1)
    return [this.remove(this.size - 1), val]
  }

  unshift(item: T): ConcTree<T> {
    return this.insert(0, item)
  }

  shift(): [ConcTree<T>, T | undefined] {
    if (this.isEmpty) return [this.clone(), undefined]
    const val = this.get(0)
    return [this.remove(0), val]
  }

  get size(): number {
    return nodeSize(this._root)
  }

  get isEmpty(): boolean {
    return this.size === 0
  }

  clear(): ConcTree<T> {
    return ConcTree.empty()
  }

  toArray(): T[] {
    return flattenNode(this._root)
  }

  slice(start?: number, end?: number): ConcTree<T> {
    const s = start ?? 0
    const e = end ?? this.size
    const clampedStart = Math.max(0, s < 0 ? this.size + s : s)
    const clampedEnd = Math.max(0, e < 0 ? this.size + e : e)
    if (clampedStart >= clampedEnd || clampedStart >= this.size) return ConcTree.empty()
    const actualEnd = Math.min(clampedEnd, this.size)
    const [, sliced] = this.split(clampedStart)
    const [result] = sliced.split(actualEnd - clampedStart)
    return result
  }

  map<U>(fn: (value: T, index: number) => U): ConcTree<U> {
    return new ConcTree(mapNode(this._root, fn, 0))
  }

  filter(predicate: (value: T, index: number) => boolean): ConcTree<T> {
    return ConcTree.fromArray(filterNode(this._root, predicate, 0))
  }

  reduce<U>(fn: (acc: U, value: T, index: number) => U, initial: U): U {
    return reduceNode(this._root, fn, initial, 0)
  }

  forEach(fn: (value: T, index: number) => void): void {
    forEachNode(this._root, fn, 0)
  }

  *[Symbol.iterator](): Iterator<T> {
    function* iter(node: ConcTreeNode<T>): Generator<T> {
      if (isLeaf(node)) {
        yield* node.values
      } else {
        yield* iter(node.left)
        yield* iter(node.right)
      }
    }
    yield* iter(this._root)
  }

  clone(): ConcTree<T> {
    return new ConcTree(this._root)
  }

  head(): T | undefined {
    if (this.isEmpty) return undefined
    return this.get(0)
  }

  last(): T | undefined {
    if (this.isEmpty) return undefined
    return this.get(this.size - 1)
  }

  take(n: number): ConcTree<T> {
    return this.split(Math.max(0, n))[0]
  }

  drop(n: number): ConcTree<T> {
    return this.split(Math.max(0, n))[1]
  }

  reverse(): ConcTree<T> {
    return new ConcTree(reverseNode(this._root))
  }

  stats(): ConcTreeStats {
    let leaves = 0
    let nodes = 0
    function count(n: ConcTreeNode<T>): void {
      if (isLeaf(n)) { leaves++; return }
      nodes++
      count(n.left)
      count(n.right)
    }
    count(this._root)
    return {
      size: this.size,
      height: nodeHeight(this._root),
      leafCount: leaves,
      nodeCount: nodes,
    }
  }
}
