import { BITS_PER_LEVEL, MASK, MAX_SHIFT } from './types.js'

type Node<K, V> = LeafNode<K, V> | InternalNode<K, V> | CollisionNode<K, V>

interface LeafNode<K, V> {
  type: 'leaf'
  hash: number
  key: K
  value: V
}

interface InternalNode<K, V> {
  type: 'internal'
  bitmap: number
  children: ReadonlyArray<Node<K, V>>
}

interface CollisionNode<K, V> {
  type: 'collision'
  hash: number
  entries: ReadonlyArray<[K, V]>
}

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

function makeLeaf<K, V>(hash: number, key: K, value: V): LeafNode<K, V> {
  return { type: 'leaf', hash, key, value }
}

function makeInternal<K, V>(bitmap: number, children: ReadonlyArray<Node<K, V>>): InternalNode<K, V> {
  return { type: 'internal', bitmap, children }
}

function makeCollision<K, V>(hash: number, entries: ReadonlyArray<[K, V]>): CollisionNode<K, V> {
  return { type: 'collision', hash, entries }
}

function getIndex(hash: number, shift: number): number {
  return (hash >>> shift) & MASK
}

function getBit(hash: number, shift: number): number {
  return 1 << getIndex(hash, shift)
}

function lookup<K, V>(node: Node<K, V>, key: K, hash: number, shift: number): V | undefined {
  if (node.type === 'leaf') {
    return node.key === key ? node.value : undefined
  }

  if (node.type === 'collision') {
    for (const [k, v] of node.entries) {
      if (k === key) return v
    }
    return undefined
  }

  const bit = getBit(hash, shift)
  if (!(node.bitmap & bit)) return undefined

  const index = popcount(node.bitmap & (bit - 1))
  return lookup(node.children[index]!, key, hash, shift + BITS_PER_LEVEL)
}

function hasKey<K, V>(node: Node<K, V>, key: K, hash: number, shift: number): boolean {
  if (node.type === 'leaf') {
    return node.key === key
  }

  if (node.type === 'collision') {
    for (const [k] of node.entries) {
      if (k === key) return true
    }
    return false
  }

  const bit = getBit(hash, shift)
  if (!(node.bitmap & bit)) return false

  const index = popcount(node.bitmap & (bit - 1))
  return hasKey(node.children[index]!, key, hash, shift + BITS_PER_LEVEL)
}

interface InsertResult<K, V> {
  node: Node<K, V>
  added: boolean
}

function insert<K, V>(node: Node<K, V>, key: K, value: V, hash: number, shift: number): InsertResult<K, V> {
  if (node.type === 'leaf') {
    if (node.key === key) {
      if (node.value === value) return { node, added: false }
      return { node: makeLeaf(hash, key, value), added: false }
    }

    if (node.hash === hash) {
      return {
        node: makeCollision(hash, [[node.key, node.value], [key, value]]),
        added: true,
      }
    }

    return {
      node: mergeTwo(shift, node.hash, node.key, node.value, hash, key, value),
      added: true,
    }
  }

  if (node.type === 'collision') {
    if (node.hash !== hash) {
      let tempNode: Node<K, V> = makeInternal(0, [])
      for (const entry of node.entries) {
        const leaf = makeLeaf(node.hash, entry[0], entry[1])
        tempNode = insert(tempNode, leaf.key, leaf.value, leaf.hash, shift).node
      }
      return insert(tempNode, key, value, hash, shift)
    }

    for (let i = 0; i < node.entries.length; i++) {
      if (node.entries[i]![0] === key) {
        const newEntries = node.entries.map((e, j) => (j === i ? [key, value] as [K, V] : e))
        return { node: makeCollision(hash, newEntries), added: false }
      }
    }

    const newEntries = [...node.entries, [key, value] as [K, V]]
    return { node: makeCollision(hash, newEntries), added: true }
  }

  const bit = getBit(hash, shift)
  const index = popcount(node.bitmap & (bit - 1))

  if (!(node.bitmap & bit)) {
    const newChildren = [...node.children]
    newChildren.splice(index, 0, makeLeaf(hash, key, value))
    return { node: makeInternal(node.bitmap | bit, newChildren), added: true }
  }

  const child = node.children[index]!
  const result = insert(child, key, value, hash, shift + BITS_PER_LEVEL)
  if (result.node === child) return { node, added: result.added }

  const newChildren = [...node.children]
  newChildren[index] = result.node
  return { node: makeInternal(node.bitmap, newChildren), added: result.added }
}

function mergeTwo<K, V>(
  shift: number,
  hash1: number, key1: K, value1: V,
  hash2: number, key2: K, value2: V,
): Node<K, V> {
  if (shift >= MAX_SHIFT) {
    return makeCollision(hash1, [[key1, value1], [key2, value2]])
  }

  const idx1 = getIndex(hash1, shift)
  const idx2 = getIndex(hash2, shift)

  if (idx1 === idx2) {
    const child = mergeTwo(shift + BITS_PER_LEVEL, hash1, key1, value1, hash2, key2, value2)
    return makeInternal(1 << idx1, [child])
  }

  const leaf1 = makeLeaf(hash1, key1, value1)
  const leaf2 = makeLeaf(hash2, key2, value2)

  if (idx1 < idx2) {
    return makeInternal((1 << idx1) | (1 << idx2), [leaf1, leaf2])
  }
  return makeInternal((1 << idx1) | (1 << idx2), [leaf2, leaf1])
}

interface DeleteResult<K, V> {
  node: Node<K, V> | null
  removed: boolean
}

function deleteKey<K, V>(node: Node<K, V>, key: K, hash: number, shift: number): DeleteResult<K, V> {
  if (node.type === 'leaf') {
    if (node.key === key) return { node: null, removed: true }
    return { node, removed: false }
  }

  if (node.type === 'collision') {
    const entryIndex = node.entries.findIndex(([k]) => k === key)
    if (entryIndex === -1) return { node, removed: false }

    if (node.entries.length === 2) {
      const remaining = node.entries[entryIndex === 0 ? 1 : 0]!
      return { node: makeLeaf(node.hash, remaining[0], remaining[1]), removed: true }
    }

    const newEntries = node.entries.filter((_, i) => i !== entryIndex)
    return { node: makeCollision(node.hash, newEntries), removed: true }
  }

  const bit = getBit(hash, shift)
  if (!(node.bitmap & bit)) return { node, removed: false }

  const index = popcount(node.bitmap & (bit - 1))
  const child = node.children[index]!
  const result = deleteKey(child, key, hash, shift + BITS_PER_LEVEL)

  if (!result.removed) return { node, removed: false }

  if (result.node === null) {
    const newBitmap = node.bitmap ^ bit
    if (newBitmap === 0) return { node: null, removed: true }

    if (node.children.length === 2) {
      const remaining = node.children[index === 0 ? 1 : 0]!
      if (remaining.type === 'leaf' || remaining.type === 'collision') {
        return { node: remaining, removed: true }
      }
    }

    const newChildren = [...node.children]
    newChildren.splice(index, 1)
    return { node: makeInternal(newBitmap, newChildren), removed: true }
  }

  if (node.children.length === 1) {
    if (result.node.type === 'leaf' || result.node.type === 'collision') {
      return { node: result.node, removed: true }
    }
  }

  const newChildren = [...node.children]
  newChildren[index] = result.node
  return { node: makeInternal(node.bitmap, newChildren), removed: true }
}

function iterateNode<K, V>(node: Node<K, V>, callback: (value: V, key: K) => void): void {
  if (node.type === 'leaf') {
    callback(node.value, node.key)
    return
  }
  if (node.type === 'collision') {
    for (const [k, v] of node.entries) {
      callback(v, k)
    }
    return
  }
  for (const child of node.children) {
    iterateNode(child, callback)
  }
}

function* iterEntries<K, V>(node: Node<K, V>): Generator<[K, V]> {
  if (node.type === 'leaf') {
    yield [node.key, node.value]
    return
  }
  if (node.type === 'collision') {
    for (const entry of node.entries) {
      yield entry
    }
    return
  }
  for (const child of node.children) {
    yield* iterEntries(child)
  }
}

function cloneNode<K, V>(node: Node<K, V>): Node<K, V> {
  if (node.type === 'leaf') {
    return { type: 'leaf', hash: node.hash, key: node.key, value: node.value }
  }
  if (node.type === 'collision') {
    return { type: 'collision', hash: node.hash, entries: [...node.entries] }
  }
  return { type: 'internal', bitmap: node.bitmap, children: node.children.map(c => cloneNode(c)) }
}

const EMPTY_INTERNAL: InternalNode<never, never> = makeInternal(0, [])

export class HashArrayMappedTrie2<K, V> {
  private _root: Node<K, V>
  private _size: number

  private static _create<K, V>(root: Node<K, V>, size: number): HashArrayMappedTrie2<K, V> {
    const t = Object.create(HashArrayMappedTrie2.prototype) as HashArrayMappedTrie2<K, V>
    t._root = root
    t._size = size
    return t
  }

  constructor(entries?: Array<[K, V]>) {
    this._root = EMPTY_INTERNAL as Node<K, V>
    this._size = 0
    if (entries) {
      for (const [key, value] of entries) {
        const hash = hashKey(key)
        const result = insert(this._root, key, value, hash, 0)
        this._root = result.node
        if (result.added) this._size++
      }
    }
  }

  static empty<K, V>(): HashArrayMappedTrie2<K, V> {
    return HashArrayMappedTrie2._create<K, V>(EMPTY_INTERNAL as Node<K, V>, 0)
  }

  static from<K, V>(entries: Array<[K, V]>): HashArrayMappedTrie2<K, V> {
    return new HashArrayMappedTrie2<K, V>(entries)
  }

  private _build(root: Node<K, V>, size: number): HashArrayMappedTrie2<K, V> {
    return HashArrayMappedTrie2._create<K, V>(root, size)
  }

  set(key: K, value: V): HashArrayMappedTrie2<K, V> {
    const hash = hashKey(key)
    const result = insert(this._root, key, value, hash, 0)
    return this._build(result.node, result.added ? this._size + 1 : this._size)
  }

  get(key: K): V | undefined {
    return lookup(this._root, key, hashKey(key), 0)
  }

  has(key: K): boolean {
    return hasKey(this._root, key, hashKey(key), 0)
  }

  delete(key: K): HashArrayMappedTrie2<K, V> {
    const hash = hashKey(key)
    const result = deleteKey(this._root, key, hash, 0)
    if (!result.removed) return this
    return this._build(result.node ?? (EMPTY_INTERNAL as Node<K, V>), this._size - 1)
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._root = makeInternal(0, []) as unknown as Node<K, V>
    this._size = 0
  }

  keys(): K[] {
    const result: K[] = []
    iterateNode(this._root, (_v, k) => result.push(k))
    return result
  }

  values(): V[] {
    const result: V[] = []
    iterateNode(this._root, (v) => result.push(v))
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    iterateNode(this._root, (v, k) => result.push([k, v]))
    return result
  }

  forEach(callback: (value: V, key: K) => void): void {
    iterateNode(this._root, callback)
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    yield* iterEntries(this._root)
  }

  map<U>(fn: (value: V, key: K) => U): HashArrayMappedTrie2<K, U> {
    let result = HashArrayMappedTrie2.empty<K, U>()
    for (const [k, v] of iterEntries(this._root)) {
      result = result.set(k, fn(v, k))
    }
    return result
  }

  filter(fn: (value: V, key: K) => boolean): HashArrayMappedTrie2<K, V> {
    let result = HashArrayMappedTrie2.empty<K, V>()
    for (const [k, v] of iterEntries(this._root)) {
      if (fn(v, k)) {
        result = result.set(k, v)
      }
    }
    return result
  }

  reduce<U>(fn: (acc: U, value: V, key: K) => U, initial: U): U {
    let acc = initial
    for (const [k, v] of iterEntries(this._root)) {
      acc = fn(acc, v, k)
    }
    return acc
  }

  merge(other: HashArrayMappedTrie2<K, V>): HashArrayMappedTrie2<K, V> {
    let result: HashArrayMappedTrie2<K, V> = this
    for (const [k, v] of iterEntries(other._root)) {
      result = result.set(k, v)
    }
    return result
  }

  clone(): HashArrayMappedTrie2<K, V> {
    return this._build(cloneNode(this._root), this._size)
  }

  toArray() {
    return this.entries()
  }
}
