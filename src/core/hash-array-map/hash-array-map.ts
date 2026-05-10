import type { HashArrayMapStats } from './types.js'

const BITS = 5
const BRANCH_SIZE = 1 << BITS
const MASK = BRANCH_SIZE - 1

type Bitmap = number

interface LeafNode<K, V> {
  readonly type: 'leaf'
  readonly hash: number
  readonly key: K
  readonly value: V
}

interface CollisionNode<K, V> {
  readonly type: 'collision'
  readonly hash: number
  readonly children: ReadonlyArray<LeafNode<K, V>>
}

interface InternalNode<K, V> {
  readonly type: 'internal'
  readonly bitmap: Bitmap
  readonly children: ReadonlyArray<HamtNode<K, V>>
}

type HamtNode<K, V> = InternalNode<K, V> | LeafNode<K, V> | CollisionNode<K, V>

function hashKey(key: unknown): number {
  const str = typeof key === 'string' ? key : String(key)
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return h >>> 0
}

function getIndex(hash: number, shift: number): number {
  return (hash >>> shift) & MASK
}

function popcount(n: number): number {
  let count = 0
  while (n) {
    count += n & 1
    n >>>= 1
  }
  return count
}

function arrayInsert<T>(arr: ReadonlyArray<T>, index: number, value: T): T[] {
  const result = arr.slice()
  result.splice(index, 0, value)
  return result
}

function arrayUpdate<T>(arr: ReadonlyArray<T>, index: number, value: T): T[] {
  const result = arr.slice()
  result[index] = value
  return result
}

function arrayRemove<T>(arr: ReadonlyArray<T>, index: number): T[] {
  const result = arr.slice()
  result.splice(index, 1)
  return result
}

function isEmptyNode<K, V>(node: HamtNode<K, V> | undefined): node is undefined {
  return node === undefined
}

function setNode<K, V>(
  node: HamtNode<K, V> | undefined,
  shift: number,
  hash: number,
  key: K,
  value: V,
  added: { value: boolean },
): HamtNode<K, V> {
  if (shift >= 32) {
    if (node === undefined) {
      added.value = true
      return { type: 'leaf', hash, key, value }
    }
    if (node.type === 'leaf' && node.key === key) {
      return { type: 'leaf', hash, key, value }
    }
    if (node.type === 'collision') {
      for (let i = 0; i < node.children.length; i++) {
        if (node.children[i]!.key === key) {
          return { type: 'collision', hash, children: arrayUpdate(node.children, i, { type: 'leaf', hash, key, value }) }
        }
      }
      added.value = true
      return { type: 'collision', hash, children: [...node.children, { type: 'leaf', hash, key, value }] }
    }
    if ((node as LeafNode<K, V>).key === key) {
      const leaf = node as LeafNode<K, V>
      return { type: 'leaf', hash: leaf.hash, key, value }
    }
    added.value = true
    return { type: 'collision', hash, children: [node as LeafNode<K, V>, { type: 'leaf', hash, key, value }] }
  }

  const idx = getIndex(hash, shift)

  if (isEmptyNode(node)) {
    added.value = true
    const child = setNode(undefined, shift + BITS, hash, key, value, added)
    const bitmap = 1 << idx
    return { type: 'internal', bitmap, children: [child] }
  }

  if (node.type === 'internal') {
    const bit = 1 << idx
    const pos = popcount(node.bitmap & (bit - 1))

    if (node.bitmap & bit) {
      const child = node.children[pos]!
      const newChild = setNode(child, shift + BITS, hash, key, value, added)
      return { type: 'internal', bitmap: node.bitmap, children: arrayUpdate(node.children, pos, newChild) }
    }

    added.value = true
    const newChild = setNode(undefined, shift + BITS, hash, key, value, added)
    return {
      type: 'internal',
      bitmap: node.bitmap | bit,
      children: arrayInsert(node.children, pos, newChild),
    }
  }

  if (node.type === 'collision') {
    if (node.hash === hash) {
      for (let i = 0; i < node.children.length; i++) {
        if (node.children[i]!.key === key) {
          return { type: 'collision', hash, children: arrayUpdate(node.children, i, { type: 'leaf', hash, key, value }) }
        }
      }
      added.value = true
      return { type: 'collision', hash, children: [...node.children, { type: 'leaf', hash, key, value }] }
    }
    const existingIdx = getIndex(node.hash, shift)
    const newIdx = idx
    if (existingIdx === newIdx) {
      const newChild = setNode(node, shift + BITS, hash, key, value, added)
      const bitmap = 1 << existingIdx
      return { type: 'internal', bitmap, children: [newChild] }
    }
    added.value = true
    const leafNode: LeafNode<K, V> = { type: 'leaf', hash, key, value }
    const bitmap = (1 << existingIdx) | (1 << newIdx)
    const posExisting = 0
    const posNew = existingIdx < newIdx ? 1 : 0
    const children: HamtNode<K, V>[] = []
    children[posExisting] = node
    children[posNew] = leafNode
    return { type: 'internal', bitmap, children }
  }

  const leaf = node as LeafNode<K, V>
  if (leaf.key === key) {
    return { type: 'leaf', hash: leaf.hash, key, value }
  }

  if (leaf.hash === hash) {
    added.value = true
    return {
      type: 'collision',
      hash,
      children: [leaf, { type: 'leaf', hash, key, value }],
    }
  }

  return mergeLeaves(shift, leaf, { type: 'leaf', hash, key, value }, added)
}

function mergeLeaves<K, V>(
  shift: number,
  leaf1: LeafNode<K, V>,
  leaf2: LeafNode<K, V>,
  added: { value: boolean },
): InternalNode<K, V> {
  added.value = true
  const idx1 = getIndex(leaf1.hash, shift)
  const idx2 = getIndex(leaf2.hash, shift)

  if (idx1 === idx2) {
    const child = mergeLeaves(shift + BITS, leaf1, leaf2, added)
    return { type: 'internal', bitmap: 1 << idx1, children: [child] }
  }

  const bitmap = (1 << idx1) | (1 << idx2)
  const children: HamtNode<K, V>[] = idx1 < idx2 ? [leaf1, leaf2] : [leaf2, leaf1]
  return { type: 'internal', bitmap, children }
}

function getNode<K, V>(
  node: HamtNode<K, V> | undefined,
  shift: number,
  hash: number,
  key: K,
): V | undefined {
  if (isEmptyNode(node)) return undefined

  if (node.type === 'leaf') {
    return node.key === key ? node.value : undefined
  }

  if (node.type === 'collision') {
    if (node.hash !== hash) return undefined
    for (const child of node.children) {
      if (child.key === key) return child.value
    }
    return undefined
  }

  const idx = getIndex(hash, shift)
  const bit = 1 << idx
  if (!(node.bitmap & bit)) return undefined
  const pos = popcount(node.bitmap & (bit - 1))
  return getNode(node.children[pos], shift + BITS, hash, key)
}

function hasNode<K, V>(
  node: HamtNode<K, V> | undefined,
  shift: number,
  hash: number,
  key: K,
): boolean {
  if (isEmptyNode(node)) return false

  if (node.type === 'leaf') {
    return node.key === key
  }

  if (node.type === 'collision') {
    if (node.hash !== hash) return false
    for (const child of node.children) {
      if (child.key === key) return true
    }
    return false
  }

  const idx = getIndex(hash, shift)
  const bit = 1 << idx
  if (!(node.bitmap & bit)) return false
  const pos = popcount(node.bitmap & (bit - 1))
  return hasNode(node.children[pos], shift + BITS, hash, key)
}

function deleteNode<K, V>(
  node: HamtNode<K, V> | undefined,
  shift: number,
  hash: number,
  key: K,
): HamtNode<K, V> | undefined {
  if (isEmptyNode(node)) return undefined

  if (node.type === 'leaf') {
    return node.key === key ? undefined : node
  }

  if (node.type === 'collision') {
    if (node.hash !== hash) return node
    const filtered = node.children.filter(c => c.key !== key)
    if (filtered.length === node.children.length) return node
    if (filtered.length === 1) return filtered[0]
    if (filtered.length === 0) return undefined
    return { type: 'collision', hash, children: filtered }
  }

  const idx = getIndex(hash, shift)
  const bit = 1 << idx
  if (!(node.bitmap & bit)) return node

  const pos = popcount(node.bitmap & (bit - 1))
  const child = node.children[pos]!
  const newChild = deleteNode(child, shift + BITS, hash, key)
  if (newChild === child) return node

  if (newChild === undefined) {
    if (node.children.length === 1) return undefined
    if (node.children.length === 2) {
      const otherChild = node.children[1 - pos]!
      if (shift + BITS < 32 && (otherChild.type === 'leaf' || otherChild.type === 'collision')) {
        return otherChild
      }
    }
    return {
      type: 'internal',
      bitmap: node.bitmap ^ bit,
      children: arrayRemove(node.children, pos),
    }
  }

  return {
    type: 'internal',
    bitmap: node.bitmap,
    children: arrayUpdate(node.children, pos, newChild),
  }
}

function collectEntries<K, V>(node: HamtNode<K, V> | undefined, result: [K, V][]): void {
  if (isEmptyNode(node)) return
  if (node.type === 'leaf') {
    result.push([node.key, node.value])
    return
  }
  if (node.type === 'collision') {
    for (const child of node.children) {
      result.push([child.key, child.value])
    }
    return
  }
  for (const child of node.children) {
    collectEntries(child, result)
  }
}

function collectKeys<K, V>(node: HamtNode<K, V> | undefined, result: K[]): void {
  if (isEmptyNode(node)) return
  if (node.type === 'leaf') {
    result.push(node.key)
    return
  }
  if (node.type === 'collision') {
    for (const child of node.children) {
      result.push(child.key)
    }
    return
  }
  for (const child of node.children) {
    collectKeys(child, result)
  }
}

function collectValues<K, V>(node: HamtNode<K, V> | undefined, result: V[]): void {
  if (isEmptyNode(node)) return
  if (node.type === 'leaf') {
    result.push(node.value)
    return
  }
  if (node.type === 'collision') {
    for (const child of node.children) {
      result.push(child.value)
    }
    return
  }
  for (const child of node.children) {
    collectValues(child, result)
  }
}

function computeDepth<K, V>(node: HamtNode<K, V> | undefined): number {
  if (isEmptyNode(node)) return 0
  if (node.type === 'leaf' || node.type === 'collision') return 1
  let max = 0
  for (const child of node.children) {
    const d = computeDepth(child)
    if (d > max) max = d
  }
  return 1 + max
}

function countNodes<K, V>(node: HamtNode<K, V> | undefined): number {
  if (isEmptyNode(node)) return 0
  if (node.type === 'leaf') return 1
  if (node.type === 'collision') return 1 + node.children.length
  let count = 1
  for (const child of node.children) {
    count += countNodes(child)
  }
  return count
}

function countCollisions<K, V>(node: HamtNode<K, V> | undefined): number {
  if (isEmptyNode(node)) return 0
  if (node.type === 'leaf') return 0
  if (node.type === 'collision') return 1
  let count = 0
  for (const child of node.children) {
    count += countCollisions(child)
  }
  return count
}

export class HashArrayMap<K, V> {
  private readonly _root: HamtNode<K, V> | undefined
  private readonly _size: number

  constructor()
  constructor(root: HamtNode<K, V> | undefined, size: number)
  constructor(root?: HamtNode<K, V> | undefined, size?: number) {
    this._root = root ?? undefined
    this._size = size ?? 0
  }

  static empty<K, V>(): HashArrayMap<K, V> {
    return new HashArrayMap<K, V>(undefined, 0)
  }

  static from<K, V>(entries: Iterable<[K, V]> | ArrayLike<[K, V]>): HashArrayMap<K, V> {
    const arr = Array.isArray(entries) ? entries : Array.from(entries)
    let map = HashArrayMap.empty<K, V>()
    for (const entry of arr) {
      map = map.set(entry[0], entry[1])
    }
    return map
  }

  set(key: K, value: V): HashArrayMap<K, V> {
    const h = hashKey(key)
    const added = { value: false }
    const newRoot = setNode(this._root, 0, h, key, value, added)
    return new HashArrayMap(newRoot, added.value ? this._size + 1 : this._size)
  }

  get(key: K): V | undefined {
    return getNode(this._root, 0, hashKey(key), key)
  }

  has(key: K): boolean {
    return hasNode(this._root, 0, hashKey(key), key)
  }

  delete(key: K): HashArrayMap<K, V> {
    if (!this.has(key)) return this
    const newRoot = deleteNode(this._root, 0, hashKey(key), key)
    return new HashArrayMap(newRoot, this._size - 1)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  forEach(callback: (value: V, key: K, index: number, map: HashArrayMap<K, V>) => void): void {
    const allEntries = this.toArray()
    let idx = 0
    for (const [key, value] of allEntries) {
      callback(value, key, idx++, this)
    }
  }

  toArray(): [K, V][] {
    const result: [K, V][] = []
    collectEntries(this._root, result)
    return result
  }

  keys(): K[] {
    const result: K[] = []
    collectKeys(this._root, result)
    return result
  }

  values(): V[] {
    const result: V[] = []
    collectValues(this._root, result)
    return result
  }

  entries(): [K, V][] {
    return this.toArray()
  }

  clear(): HashArrayMap<K, V> {
    return HashArrayMap.empty<K, V>()
  }

  stats(): HashArrayMapStats {
    return {
      size: this._size,
      depth: computeDepth(this._root),
      nodes: countNodes(this._root),
      collisions: countCollisions(this._root),
    }
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    const arr = this.toArray()
    for (const entry of arr) {
      yield entry
    }
  }
}

export type { HashArrayMapStats } from './types.js'
