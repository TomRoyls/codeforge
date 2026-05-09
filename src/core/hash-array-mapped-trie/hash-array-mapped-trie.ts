import type { HAMTNode, HAMTStats } from './types.js'
import { DEFAULT_HAMT_OPTIONS } from './types.js'

const BITS_PER_LEVEL = DEFAULT_HAMT_OPTIONS.bitsPerLevel
const MASK = (1 << BITS_PER_LEVEL) - 1

function hashKey(key: unknown): number {
  const str = String(key)
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return h >>> 0
}

function popcount(n: number): number {
  let count = 0
  while (n) {
    count += n & 1
    n >>>= 1
  }
  return count
}

function makeLeaf<K, V>(key: K, value: V): HAMTNode<K, V> {
  return { bitmap: 0, children: [], isLeaf: true, entries: [[key, value]] }
}

function makeInternal<K, V>(bitmap: number, children: Array<HAMTNode<K, V>>): HAMTNode<K, V> {
  return { bitmap, children, isLeaf: false, entries: [] }
}

function makeCollision<K, V>(entries: Array<[K, V]>): HAMTNode<K, V> {
  return { bitmap: 0, children: [], isLeaf: true, entries }
}

function lookup<K, V>(node: HAMTNode<K, V>, key: K, hash: number, shift: number): V | undefined {
  if (node.isLeaf) {
    for (const [k, v] of node.entries) {
      if (k === key) return v
    }
    return undefined
  }

  const bit = 1 << ((hash >>> shift) & MASK)
  if (!(node.bitmap & bit)) return undefined

  const index = popcount(node.bitmap & (bit - 1))
  return lookup(node.children[index]!, key, hash, shift + BITS_PER_LEVEL)
}

function hasKey<K, V>(node: HAMTNode<K, V>, key: K, hash: number, shift: number): boolean {
  if (node.isLeaf) {
    for (const [k] of node.entries) {
      if (k === key) return true
    }
    return false
  }

  const bit = 1 << ((hash >>> shift) & MASK)
  if (!(node.bitmap & bit)) return false

  const index = popcount(node.bitmap & (bit - 1))
  return hasKey(node.children[index]!, key, hash, shift + BITS_PER_LEVEL)
}

interface InsertResult<K, V> {
  node: HAMTNode<K, V>
  added: boolean
}

function mergeTwoLeaves<K, V>(
  key1: K, value1: V, hash1: number,
  key2: K, value2: V, hash2: number,
  shift: number,
): HAMTNode<K, V> {
  const idx1 = (hash1 >>> shift) & MASK
  const idx2 = (hash2 >>> shift) & MASK

  if (idx1 === idx2) {
    if (shift + BITS_PER_LEVEL >= 32) {
      return makeCollision([[key1, value1], [key2, value2]])
    }
    const child = mergeTwoLeaves(key1, value1, hash1, key2, value2, hash2, shift + BITS_PER_LEVEL)
    return makeInternal(1 << idx1, [child])
  }

  const leaf1 = makeLeaf(key1, value1)
  const leaf2 = makeLeaf(key2, value2)

  if (idx1 < idx2) {
    return makeInternal((1 << idx1) | (1 << idx2), [leaf1, leaf2])
  }
  return makeInternal((1 << idx1) | (1 << idx2), [leaf2, leaf1])
}

function insert<K, V>(node: HAMTNode<K, V>, key: K, value: V, hash: number, shift: number): InsertResult<K, V> {
  if (node.isLeaf) {
    for (let i = 0; i < node.entries.length; i++) {
      if (node.entries[i]![0] === key) {
        const newEntries = node.entries.map((e, j) => j === i ? [key, value] as [K, V] : e)
        return { node: makeCollision(newEntries), added: false }
      }
    }

    if (node.entries.length === 1) {
      const [existingKey, existingValue] = node.entries[0]!
      const existingHash = hashKey(existingKey)

      if (existingHash === hash) {
        return { node: makeCollision([[existingKey, existingValue], [key, value]]), added: true }
      }

      return { node: mergeTwoLeaves(existingKey, existingValue, existingHash, key, value, hash, shift), added: true }
    }

    const existingHash = hashKey(node.entries[0]![0])

    if (existingHash === hash) {
      const newEntries = [...node.entries, [key, value] as [K, V]]
      return { node: makeCollision(newEntries), added: true }
    }

    let newNode: HAMTNode<K, V> = makeInternal(0, [])
    for (const [k, v] of node.entries) {
      newNode = insert(newNode, k, v, hashKey(k), shift).node
    }
    const finalResult = insert(newNode, key, value, hash, shift)
    return { node: finalResult.node, added: true }
  }

  const bit = 1 << ((hash >>> shift) & MASK)
  const index = popcount(node.bitmap & (bit - 1))

  if (!(node.bitmap & bit)) {
    const newChildren = [...node.children]
    newChildren.splice(index, 0, makeLeaf(key, value))
    return { node: makeInternal(node.bitmap | bit, newChildren), added: true }
  }

  const child = node.children[index]!
  const result = insert(child, key, value, hash, shift + BITS_PER_LEVEL)
  const newChildren = [...node.children]
  newChildren[index] = result.node
  return { node: makeInternal(node.bitmap, newChildren), added: result.added }
}

interface DeleteResult<K, V> {
  node: HAMTNode<K, V> | null
  removed: boolean
}

function deleteKey<K, V>(node: HAMTNode<K, V>, key: K, hash: number, shift: number): DeleteResult<K, V> {
  if (node.isLeaf) {
    if (node.entries.length === 1) {
      if (node.entries[0]![0] === key) {
        return { node: null, removed: true }
      }
      return { node, removed: false }
    }

    const entryIndex = node.entries.findIndex(([k]) => k === key)
    if (entryIndex === -1) return { node, removed: false }

    if (node.entries.length === 2) {
      const remaining = node.entries[entryIndex === 0 ? 1 : 0]!
      return { node: makeLeaf(remaining[0], remaining[1]), removed: true }
    }

    const newEntries = node.entries.filter((_, i) => i !== entryIndex)
    return { node: makeCollision(newEntries), removed: true }
  }

  const bit = 1 << ((hash >>> shift) & MASK)
  if (!(node.bitmap & bit)) return { node, removed: false }

  const index = popcount(node.bitmap & (bit - 1))
  const child = node.children[index]!
  const result = deleteKey(child, key, hash, shift + BITS_PER_LEVEL)

  if (!result.removed) return { node, removed: false }

  if (result.node === null) {
    const newBitmap = node.bitmap ^ bit
    if (newBitmap === 0) {
      return { node: null, removed: true }
    }

    const newChildren = [...node.children]
    newChildren.splice(index, 1)
    return { node: makeInternal(newBitmap, newChildren), removed: true }
  }

  const newChildren = [...node.children]
  newChildren[index] = result.node
  return { node: makeInternal(node.bitmap, newChildren), removed: true }
}

function iterateNode<K, V>(node: HAMTNode<K, V>, callback: (key: K, value: V) => void): void {
  if (node.isLeaf) {
    for (const [key, value] of node.entries) {
      callback(key, value)
    }
    return
  }
  for (const child of node.children) {
    iterateNode(child, callback)
  }
}

function* iterEntries<K, V>(node: HAMTNode<K, V>): Generator<[K, V]> {
  if (node.isLeaf) {
    for (const entry of node.entries) {
      yield entry
    }
    return
  }
  for (const child of node.children) {
    yield* iterEntries(child)
  }
}

function cloneNode<K, V>(node: HAMTNode<K, V>): HAMTNode<K, V> {
  if (node.isLeaf) {
    return { bitmap: 0, children: [], isLeaf: true, entries: [...node.entries] }
  }
  return { bitmap: node.bitmap, children: node.children.map(c => cloneNode(c)), isLeaf: false, entries: [] }
}

function computeStats(node: HAMTNode<unknown, unknown>): { nodeCount: number; leafCount: number; collisionCount: number; maxDepth: number } {
  if (node.isLeaf) {
    return {
      nodeCount: 1,
      leafCount: 1,
      collisionCount: node.entries.length > 1 ? 1 : 0,
      maxDepth: 0,
    }
  }

  if (node.children.length === 0) {
    return { nodeCount: 1, leafCount: 0, collisionCount: 0, maxDepth: 0 }
  }

  let nodeCount = 1
  let leafCount = 0
  let collisionCount = 0
  let maxDepth = 0

  for (const child of node.children) {
    const s = computeStats(child)
    nodeCount += s.nodeCount
    leafCount += s.leafCount
    collisionCount += s.collisionCount
    maxDepth = Math.max(maxDepth, s.maxDepth + 1)
  }

  return { nodeCount, leafCount, collisionCount, maxDepth }
}

export class HashArrayMappedTrie<K, V> {
  private _root: HAMTNode<K, V>
  private _size: number

  constructor(entries?: Iterable<[K, V]>) {
    this._root = makeInternal(0, [])
    this._size = 0
    if (entries) {
      for (const [key, value] of entries) {
        const result = insert(this._root, key, value, hashKey(key), 0)
        if (result.added) this._size++
        this._root = result.node
      }
    }
  }

  private static _build<K, V>(root: HAMTNode<K, V>, size: number): HashArrayMappedTrie<K, V> {
    const t = new HashArrayMappedTrie<K, V>()
    t._root = root
    t._size = size
    return t
  }

  get(key: K): V | undefined {
    return lookup(this._root, key, hashKey(key), 0)
  }

  set(key: K, value: V): HashArrayMappedTrie<K, V> {
    const hash = hashKey(key)
    const result = insert(this._root, key, value, hash, 0)
    return HashArrayMappedTrie._build(result.node, result.added ? this._size + 1 : this._size)
  }

  delete(key: K): HashArrayMappedTrie<K, V> {
    const hash = hashKey(key)
    const result = deleteKey(this._root, key, hash, 0)
    if (!result.removed) return this
    if (result.node === null) {
      return new HashArrayMappedTrie<K, V>()
    }
    return HashArrayMappedTrie._build(result.node, this._size - 1)
  }

  has(key: K): boolean {
    return hasKey(this._root, key, hashKey(key), 0)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  forEach(callback: (key: K, value: V) => void): void {
    iterateNode(this._root, callback)
  }

  keys(): K[] {
    const result: K[] = []
    iterateNode(this._root, (key) => result.push(key))
    return result
  }

  values(): V[] {
    const result: V[] = []
    iterateNode(this._root, (_key, value) => result.push(value))
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    iterateNode(this._root, (key, value) => result.push([key, value]))
    return result
  }

  *[Symbol.iterator](): Generator<[K, V]> {
    yield* iterEntries(this._root)
  }

  static from<K, V>(entries: Iterable<[K, V]>): HashArrayMappedTrie<K, V> {
    return new HashArrayMappedTrie<K, V>(entries)
  }

  clone(): HashArrayMappedTrie<K, V> {
    return HashArrayMappedTrie._build(cloneNode(this._root), this._size)
  }

  stats(): HAMTStats {
    const s = computeStats(this._root)
    return {
      size: this._size,
      depth: s.maxDepth,
      nodeCount: s.nodeCount,
      leafCount: s.leafCount,
      collisionCount: s.collisionCount,
    }
  }
}

export { DEFAULT_HAMT_OPTIONS } from './types.js'
export type { HAMTNode, HAMTOptions, HAMTStats } from './types.js'
