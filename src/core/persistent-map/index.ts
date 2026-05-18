import type { PersistentMapOptions, HashFunction } from './types.js'

const BITS_PER_LEVEL = 5
const BRANCH_SIZE = 1 << BITS_PER_LEVEL
const MASK = BRANCH_SIZE - 1
const MAX_SHIFT = 30

type HAMTNode<K, V> = EmptyNode | LeafNode<K, V> | CollisionNode<K, V> | BitmapNode<K, V>

class EmptyNode {
  readonly _tag = 'empty' as const
}

class LeafNode<K, V> {
  readonly _tag = 'leaf' as const
  constructor(
    readonly hash: number,
    readonly key: K,
    readonly value: V,
  ) {}
}

class CollisionNode<K, V> {
  readonly _tag = 'collision' as const
  constructor(
    readonly hash: number,
    readonly children: ReadonlyArray<{ key: K; value: V }>,
  ) {}
}

class BitmapNode<K, V> {
  readonly _tag = 'bitmap' as const
  constructor(
    readonly bitmap: number,
    readonly children: ReadonlyArray<HAMTNode<K, V>>,
  ) {}
}

function popcount(n: number): number {
  let count = 0
  while (n) {
    count += n & 1
    n = n >>> 1
  }
  return count
}

function maskIndex(bitmap: number, bit: number): number {
  return popcount(bitmap & (bit - 1))
}

function defaultHash<K>(key: K): number {
  const str = String(key)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    hash = ((hash << 5) - hash + ch) | 0
  }
  return hash
}

function keyEquals<K>(a: K, b: K): boolean {
  return a === b
}

function mergeTwoLeaves<K, V>(
  leaf1: LeafNode<K, V>,
  leaf2: LeafNode<K, V>,
  shift: number,
): HAMTNode<K, V> {
  if (leaf1.hash === leaf2.hash) {
    return new CollisionNode(leaf1.hash, [
      { key: leaf1.key, value: leaf1.value },
      { key: leaf2.key, value: leaf2.value },
    ])
  }

  const idx1 = (leaf1.hash >>> shift) & MASK
  const idx2 = (leaf2.hash >>> shift) & MASK

  if (idx1 === idx2) {
    if (shift >= MAX_SHIFT) {
      return new CollisionNode(leaf1.hash, [
        { key: leaf1.key, value: leaf1.value },
        { key: leaf2.key, value: leaf2.value },
      ])
    }
    const child = mergeTwoLeaves(leaf1, leaf2, shift + BITS_PER_LEVEL)
    const bit = 1 << idx1
    return new BitmapNode(bit, [child])
  }

  const bit1 = 1 << idx1
  const bit2 = 1 << idx2
  const bitmap = bit1 | bit2
  if (idx1 < idx2) {
    return new BitmapNode(bitmap, [leaf1, leaf2])
  }
  return new BitmapNode(bitmap, [leaf2, leaf1])
}

function insertNode<K, V>(
  node: HAMTNode<K, V>,
  hash: number,
  key: K,
  value: V,
  shift: number,
  eq: (a: K, b: K) => boolean,
  added: { value: boolean },
): HAMTNode<K, V> {
  if (node._tag === 'empty') {
    added.value = true
    return new LeafNode(hash, key, value)
  }

  if (node._tag === 'leaf') {
    if (node.hash === hash) {
      if (eq(node.key, key)) {
        return new LeafNode(hash, key, value)
      }
      added.value = true
      return new CollisionNode(hash, [
        { key: node.key, value: node.value },
        { key, value },
      ])
    }
    added.value = true
    return mergeTwoLeaves(node, new LeafNode(hash, key, value), shift)
  }

  if (node._tag === 'collision') {
    if (node.hash === hash) {
      for (let i = 0; i < node.children.length; i++) {
        if (eq(node.children[i]!.key, key)) {
          const newChildren = node.children.map((c, idx) =>
            idx === i ? { key, value } : c,
          )
          return new CollisionNode(hash, newChildren)
        }
      }
      added.value = true
      return new CollisionNode(hash, [...node.children, { key, value }])
    }
    added.value = true
    return splitCollisionAndInsert(node, hash, key, value, shift)
  }

  const bit = 1 << ((hash >>> shift) & MASK)
  const idx = maskIndex(node.bitmap, bit)

  if (node.bitmap & bit) {
    const child = node.children[idx]!
    const newChild = insertNode(child, hash, key, value, shift + BITS_PER_LEVEL, eq, added)
    if (newChild === child) return node
    const newChildren = [...node.children]
    newChildren[idx] = newChild
    return new BitmapNode(node.bitmap, newChildren)
  }

  added.value = true
  const newChild = new LeafNode(hash, key, value)
  const newChildren = [...node.children.slice(0, idx), newChild, ...node.children.slice(idx)]
  return new BitmapNode(node.bitmap | bit, newChildren)
}

function splitCollisionAndInsert<K, V>(
  collision: CollisionNode<K, V>,
  newHash: number,
  key: K,
  value: V,
  shift: number,
): HAMTNode<K, V> {
  const idx1 = (collision.hash >>> shift) & MASK
  const idx2 = (newHash >>> shift) & MASK

  if (idx1 !== idx2) {
    const newLeaf = new LeafNode(newHash, key, value)
    const bit1 = 1 << idx1
    const bit2 = 1 << idx2
    const bitmap = bit1 | bit2
    if (idx1 < idx2) {
      return new BitmapNode(bitmap, [collision, newLeaf])
    }
    return new BitmapNode(bitmap, [newLeaf, collision])
  }

  if (shift >= MAX_SHIFT) {
    const allChildren = [...collision.children, { key, value }]
    return new CollisionNode(collision.hash, allChildren)
  }

  const child = splitCollisionAndInsert(collision, newHash, key, value, shift + BITS_PER_LEVEL)
  const bit = 1 << idx1
  return new BitmapNode(bit, [child])
}

function deleteNode<K, V>(
  node: HAMTNode<K, V>,
  hash: number,
  key: K,
  shift: number,
  eq: (a: K, b: K) => boolean,
  removed: { value: boolean },
): HAMTNode<K, V> {
  if (node._tag === 'empty') {
    return node
  }

  if (node._tag === 'leaf') {
    if (node.hash === hash && eq(node.key, key)) {
      removed.value = true
      return new EmptyNode()
    }
    return node
  }

  if (node._tag === 'collision') {
    if (node.hash !== hash) return node
    const idx = node.children.findIndex((c) => eq(c.key, key))
    if (idx === -1) return node
    removed.value = true
    if (node.children.length === 2) {
      const remaining = node.children[1 - idx]!
      return new LeafNode(hash, remaining.key, remaining.value)
    }
    return new CollisionNode(hash, node.children.filter((_, i) => i !== idx))
  }

  const bit = 1 << ((hash >>> shift) & MASK)
  if (!(node.bitmap & bit)) return node

  const idx = maskIndex(node.bitmap, bit)
  const child = node.children[idx]!
  const newChild = deleteNode(child, hash, key, shift + BITS_PER_LEVEL, eq, removed)

  if (newChild === child) return node

  if (newChild._tag === 'empty') {
    if (node.children.length === 1) {
      return new EmptyNode()
    }
    const newBitmap = node.bitmap ^ bit
    if (node.children.length === 2) {
      const remainingChild = node.children[1 - idx]!
      if (remainingChild._tag === 'leaf' || remainingChild._tag === 'collision') {
        return remainingChild
      }
    }
    const newChildren = [...node.children.slice(0, idx), ...node.children.slice(idx + 1)]
    return new BitmapNode(newBitmap, newChildren)
  }

  const newChildren = [...node.children]
  newChildren[idx] = newChild
  return new BitmapNode(node.bitmap, newChildren)
}

function getNode<K, V>(
  node: HAMTNode<K, V>,
  hash: number,
  key: K,
  shift: number,
  eq: (a: K, b: K) => boolean,
): V | undefined {
  if (node._tag === 'empty') return undefined

  if (node._tag === 'leaf') {
    return node.hash === hash && eq(node.key, key) ? node.value : undefined
  }

  if (node._tag === 'collision') {
    if (node.hash !== hash) return undefined
    for (const c of node.children) {
      if (eq(c.key, key)) return c.value
    }
    return undefined
  }

  const bit = 1 << ((hash >>> shift) & MASK)
  if (!(node.bitmap & bit)) return undefined
  const idx = maskIndex(node.bitmap, bit)
  return getNode(node.children[idx]!, hash, key, shift + BITS_PER_LEVEL, eq)
}

function hasNode<K, V>(
  node: HAMTNode<K, V>,
  hash: number,
  key: K,
  shift: number,
  eq: (a: K, b: K) => boolean,
): boolean {
  if (node._tag === 'empty') return false

  if (node._tag === 'leaf') {
    return node.hash === hash && eq(node.key, key)
  }

  if (node._tag === 'collision') {
    if (node.hash !== hash) return false
    return node.children.some((c) => eq(c.key, key))
  }

  const bit = 1 << ((hash >>> shift) & MASK)
  if (!(node.bitmap & bit)) return false
  const idx = maskIndex(node.bitmap, bit)
  return hasNode(node.children[idx]!, hash, key, shift + BITS_PER_LEVEL, eq)
}

function collectEntries<K, V>(node: HAMTNode<K, V>, result: [K, V][]): void {
  if (node._tag === 'empty') return
  if (node._tag === 'leaf') {
    result.push([node.key, node.value])
    return
  }
  if (node._tag === 'collision') {
    for (const c of node.children) {
      result.push([c.key, c.value])
    }
    return
  }
  for (const child of node.children) {
    collectEntries(child, result)
  }
}

function deepEquals<V>(a: V, b: V): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  if (typeof a !== 'object' || typeof b !== 'object') return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((v, i) => deepEquals(v, b[i]))
  }
  const keysA = Object.keys(a as object)
  const keysB = Object.keys(b as object)
  if (keysA.length !== keysB.length) return false
  return keysA.every((k) => deepEquals((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
}

export class PersistentMap<K, V> {
  private readonly _root: HAMTNode<K, V>
  private readonly _size: number
  private readonly _hash: HashFunction<K>
  private readonly _eq: (a: K, b: K) => boolean

  constructor(options?: PersistentMapOptions<K>)
  constructor(
    rootOrOptions: HAMTNode<K, V> | PersistentMapOptions<K> | undefined,
    size: number,
    hash: HashFunction<K>,
    eq: (a: K, b: K) => boolean,
  )
  constructor(
    rootOrOptions?: HAMTNode<K, V> | PersistentMapOptions<K>,
    size?: number,
    hash?: HashFunction<K>,
    eq?: (a: K, b: K) => boolean,
  ) {
    if (typeof size === 'number' && hash && eq) {
      this._root = rootOrOptions as HAMTNode<K, V>
      this._size = size
      this._hash = hash
      this._eq = eq
    } else {
      const opts = rootOrOptions as PersistentMapOptions<K> | undefined
      this._root = new EmptyNode()
      this._size = 0
      this._hash = opts?.hash ?? defaultHash
      this._eq = keyEquals
    }
  }

  private wrap(root: HAMTNode<K, V>, size: number): PersistentMap<K, V> {
    return new PersistentMap(root, size, this._hash, this._eq)
  }

  private hashKey(key: K): number {
    return this._hash(key)
  }

  set(key: K, value: V): PersistentMap<K, V> {
    const h = this.hashKey(key)
    const added = { value: false }
    const newRoot = insertNode(this._root, h, key, value, 0, this._eq, added)
    if (newRoot === this._root) return this
    return this.wrap(newRoot, added.value ? this._size + 1 : this._size)
  }

  delete(key: K): PersistentMap<K, V> {
    const h = this.hashKey(key)
    const removed = { value: false }
    const newRoot = deleteNode(this._root, h, key, 0, this._eq, removed)
    if (newRoot === this._root) return this
    return this.wrap(newRoot, removed.value ? this._size - 1 : this._size)
  }

  get(key: K): V | undefined {
    return getNode(this._root, this.hashKey(key), key, 0, this._eq)
  }

  has(key: K): boolean {
    return hasNode(this._root, this.hashKey(key), key, 0, this._eq)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): PersistentMap<K, V> {
    return new PersistentMap<K, V>({ hash: this._hash })
  }

  toArray(): [K, V][] {
    return this.entries()
  }

  forEach(callback: (value: V, key: K, map: PersistentMap<K, V>) => void): void {
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      callback(value, key, this)
    }
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const allEntries = this.entries()
    let index = 0
    return {
      next: () => {
        if (index < allEntries.length) {
          const value = allEntries[index]!
          index++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<[K, V]>
      },
    }
  }

  keys(): K[] {
    return this.entries().map(([k]) => k)
  }

  values(): V[] {
    return this.entries().map(([, v]) => v)
  }

  entries(): [K, V][] {
    const result: [K, V][] = []
    collectEntries(this._root, result)
    return result
  }

  clone(): PersistentMap<K, V> {
    return this
  }

  static fromArray<K, V>(
    entries: Array<[K, V]>,
    options?: PersistentMapOptions<K>,
  ): PersistentMap<K, V> {
    let map = new PersistentMap<K, V>(options)
    for (const [key, value] of entries) {
      map = map.set(key, value)
    }
    return map
  }

  merge(other: PersistentMap<K, V>): PersistentMap<K, V> {
    let result: PersistentMap<K, V> = this
    const otherEntries = other.entries()
    for (const [key, value] of otherEntries) {
      result = result.set(key, value)
    }
    return result
  }

  equals(other: PersistentMap<K, V>): boolean {
    if (this._size !== other._size) return false
    const thisEntries = this.entries()
    for (const [key, value] of thisEntries) {
      const otherValue = other.get(key)
      if (otherValue === undefined && !other.has(key)) return false
      if (!deepEquals(value, otherValue)) return false
    }
    return true
  }

  filter(predicate: (value: V, key: K) => boolean): PersistentMap<K, V> {
    let result: PersistentMap<K, V> = new PersistentMap<K, V>({ hash: this._hash })
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      if (predicate(value, key)) {
        result = result.set(key, value)
      }
    }
    return result
  }

  map<U>(fn: (value: V, key: K) => U): PersistentMap<K, U> {
    let result: PersistentMap<K, U> = new PersistentMap<K, U>({ hash: this._hash as (key: K) => number })
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      result = result.set(key, fn(value, key))
    }
    return result
  }

  every(predicate: (value: V, key: K) => boolean): boolean {
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      if (!predicate(value, key)) return false
    }
    return true
  }

  some(predicate: (value: V, key: K) => boolean): boolean {
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      if (predicate(value, key)) return true
    }
    return false
  }

  find(predicate: (value: V, key: K) => boolean): V | undefined {
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      if (predicate(value, key)) return value
    }
    return undefined
  }

  reduce<R>(fn: (acc: R, value: V, key: K) => R, initial: R): R {
    let acc = initial
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      acc = fn(acc, value, key)
    }
    return acc
  }

  update(key: K, fn: (value: V | undefined) => V): PersistentMap<K, V> {
    return this.set(key, fn(this.get(key)))
  }

  withDefault(_defaultValue: V): PersistentMap<K, V> {
    return this
  }

  count(): number {
    return this._size
  }
}

export type { PersistentMapOptions, HashFunction } from './types.js'
