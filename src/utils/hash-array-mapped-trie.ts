const BITS = 5
const MASK = (1 << BITS) - 1
interface HAMTNode<K, V> {
  bitmap: number
  children: Array<HAMTNode<K, V> | { key: K; value: V }>
}

function hashString(key: string): number {
  let h = 0
  for (let i = 0; i < key.length; i++) {
    h = ((h << 5) - h + key.charCodeAt(i)) | 0
  }
  return h
}

function hashKey(key: unknown): number {
  if (typeof key === 'string') return hashString(key)
  if (typeof key === 'number') return key | 0
  return hashString(String(key))
}

function popcount(n: number): number {
  let count = 0
  while (n) {
    count += n & 1
    n >>>= 1
  }
  return count
}

function getIndex(bitmap: number, bit: number): number {
  return popcount(bitmap & (bit - 1))
}

function isLeaf<K, V>(node: HAMTNode<K, V> | { key: K; value: V }): node is { key: K; value: V } {
  return 'key' in node && !('bitmap' in node)
}

function isEmptyNode<K, V>(node: HAMTNode<K, V>): boolean {
  return node.bitmap === 0 && node.children.length === 0
}

export class HashArrayMappedTrie<K, V> {
  private root: HAMTNode<K, V>
  private _size: number

  private constructor(root: HAMTNode<K, V>, size: number) {
    this.root = root
    this._size = size
  }

  static empty<K, V>(): HashArrayMappedTrie<K, V> {
    return new HashArrayMappedTrie<K, V>({ bitmap: 0, children: [] }, 0)
  }

  static from<K, V>(entries: Iterable<[K, V]>): HashArrayMappedTrie<K, V> {
    let trie = HashArrayMappedTrie.empty<K, V>()
    for (const [key, value] of entries) {
      trie = trie.set(key, value)
    }
    return trie
  }

  static of<K, V>(...entries: [K, V][]): HashArrayMappedTrie<K, V> {
    return HashArrayMappedTrie.from(entries)
  }

  get(key: K): V | undefined {
    const h = hashKey(key)
    return this.getInternal(this.root, h, 0, key)
  }

  private getInternal(node: HAMTNode<K, V>, hash: number, shift: number, key: K): V | undefined {
    if (isEmptyNode(node)) return undefined
    const bit = 1 << ((hash >>> shift) & MASK)
    if ((node.bitmap & bit) === 0) return undefined
    const idx = getIndex(node.bitmap, bit)
    const child = node.children[idx]!
    if (isLeaf(child)) {
      return child.key === key ? child.value : undefined
    }
    return this.getInternal(child, hash, shift + BITS, key)
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  set(key: K, value: V): HashArrayMappedTrie<K, V> {
    const h = hashKey(key)
    const existed = this.has(key)
    const result = this.setInternal(this.root, h, 0, key, value)
    if (result === this.root) return this
    return new HashArrayMappedTrie(result, existed ? this._size : this._size + 1)
  }

  private setInternal(
    node: HAMTNode<K, V>,
    hash: number,
    shift: number,
    key: K,
    value: V,
  ): HAMTNode<K, V> {
    const bit = 1 << ((hash >>> shift) & MASK)
    const idx = getIndex(node.bitmap, bit)

    if ((node.bitmap & bit) === 0) {
      const newChildren = [...node.children]
      newChildren.splice(idx, 0, { key, value })
      return { bitmap: node.bitmap | bit, children: newChildren }
    }

    const child = node.children[idx]!
    if (isLeaf(child)) {
      if (child.key === key) {
        if (child.value === value) return node
        const newChildren = [...node.children]
        newChildren[idx] = { key, value }
        return { bitmap: node.bitmap, children: newChildren }
      }
      const childHash = hashKey(child.key)
      const newChild = this.createNode(childHash, hash, shift + BITS, child.key, child.value, key, value)
      const newChildren = [...node.children]
      newChildren[idx] = newChild
      return { bitmap: node.bitmap, children: newChildren }
    }

    const newChild = this.setInternal(child, hash, shift + BITS, key, value)
    if (newChild === child) return node
    const newChildren = [...node.children]
    newChildren[idx] = newChild
    return { bitmap: node.bitmap, children: newChildren }
  }

  private createNode(
    hash1: number,
    hash2: number,
    shift: number,
    key1: K,
    val1: V,
    key2: K,
    val2: V,
  ): HAMTNode<K, V> {
    const idx1 = (hash1 >>> shift) & MASK
    const idx2 = (hash2 >>> shift) & MASK
    if (idx1 === idx2) {
      if (shift + BITS >= 30) {
        return { bitmap: 1 << idx1, children: [{ key: key1, value: val1 }, { key: key2, value: val2 }] }
      }
      const child = this.createNode(hash1, hash2, shift + BITS, key1, val1, key2, val2)
      return { bitmap: 1 << idx1, children: [child] }
    }
    const bit1 = 1 << idx1
    const bit2 = 1 << idx2
    const bitmap = bit1 | bit2
    if (idx1 < idx2) {
      return { bitmap, children: [{ key: key1, value: val1 }, { key: key2, value: val2 }] }
    }
    return { bitmap, children: [{ key: key2, value: val2 }, { key: key1, value: val1 }] }
  }

  delete(key: K): HashArrayMappedTrie<K, V> {
    const h = hashKey(key)
    const result = this.deleteInternal(this.root, h, 0, key)
    if (result === this.root) return this
    return new HashArrayMappedTrie(result, this._size - 1)
  }

  private deleteInternal(
    node: HAMTNode<K, V>,
    hash: number,
    shift: number,
    key: K,
  ): HAMTNode<K, V> {
    const bit = 1 << ((hash >>> shift) & MASK)
    if ((node.bitmap & bit) === 0) return node
    const idx = getIndex(node.bitmap, bit)
    const child = node.children[idx]!

    if (isLeaf(child)) {
      if (child.key !== key) return node
      const newBitmap = node.bitmap ^ bit
      if (newBitmap === 0) return { bitmap: 0, children: [] }
      const newChildren = [...node.children]
      newChildren.splice(idx, 1)
      return { bitmap: newBitmap, children: newChildren }
    }

    const newChild = this.deleteInternal(child, hash, shift + BITS, key)
    if (newChild === child) return node

    if (isEmptyNode(newChild)) {
      const newBitmap = node.bitmap ^ bit
      if (newBitmap === 0) return { bitmap: 0, children: [] }
      const newChildren = [...node.children]
      newChildren.splice(idx, 1)
      return { bitmap: newBitmap, children: newChildren }
    }

    if (newChild.children.length === 1 && isLeaf(newChild.children[0]!)) {
      const newChildren = [...node.children]
      newChildren[idx] = newChild.children[0]!
      return { bitmap: node.bitmap, children: newChildren }
    }

    const newChildren = [...node.children]
    newChildren[idx] = newChild
    return { bitmap: node.bitmap, children: newChildren }
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  forEach(callback: (value: V, key: K) => void): void {
    this.forEachNode(this.root, callback)
  }

  private forEachNode(node: HAMTNode<K, V>, callback: (value: V, key: K) => void): void {
    for (const child of node.children) {
      if (isLeaf(child)) {
        callback(child.value, child.key)
      } else {
        this.forEachNode(child, callback)
      }
    }
  }

  keys(): K[] {
    const result: K[] = []
    this.forEachNode(this.root, (_, key) => result.push(key))
    return result
  }

  values(): V[] {
    const result: V[] = []
    this.forEachNode(this.root, (value) => result.push(value))
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    this.forEachNode(this.root, (value, key) => result.push([key, value]))
    return result
  }

  toMap(): Map<K, V> {
    const map = new Map<K, V>()
    this.forEachNode(this.root, (value, key) => map.set(key, value))
    return map
  }

  merge(other: HashArrayMappedTrie<K, V>): HashArrayMappedTrie<K, V> {
    let result: HashArrayMappedTrie<K, V> = this
    other.forEachNode(other.root, (value, key) => {
      result = result.set(key, value)
    })
    return result
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const entries = this.entries()
    let i = 0
    return {
      next(): IteratorResult<[K, V]> {
        if (i < entries.length) {
          return { value: entries[i++]!, done: false }
        }
        return { value: undefined as unknown as [K, V], done: true }
      },
    }
  }
}
