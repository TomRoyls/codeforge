export class BitTrie<T> {
  private root: BitTrieNode<T>
  private _size = 0

  constructor() {
    this.root = new BitTrieNode()
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  insert(key: number, bits: number, value: T): void {
    let node = this.root
    for (let i = bits - 1; i >= 0; i--) {
      const bit = (key >>> i) & 1
      if (bit === 0) {
        if (!node.left) node.left = new BitTrieNode<T>()
        node = node.left
      } else {
        if (!node.right) node.right = new BitTrieNode<T>()
        node = node.right
      }
    }
    if (node.value === undefined) this._size++
    node.value = value
  }

  lookup(key: number, bits: number): T | undefined {
    let node: BitTrieNode<T> | undefined = this.root
    for (let i = bits - 1; i >= 0; i--) {
      const bit = (key >>> i) & 1
      const next: BitTrieNode<T> | undefined = bit === 0 ? node.left : node.right
      if (!next) return undefined
      node = next
    }
    return node!.value
  }

  longestPrefix(key: number, bits: number): { value: T; prefixBits: number } | undefined {
    let node: BitTrieNode<T> | undefined = this.root
    let lastMatch: { value: T; prefixBits: number } | undefined
    if (node.value !== undefined) {
      lastMatch = { value: node.value, prefixBits: 0 }
    }
    for (let i = bits - 1; i >= 0; i--) {
      const bit = (key >>> i) & 1
      const next: BitTrieNode<T> | undefined = bit === 0 ? node.left : node.right
      if (!next) break
      node = next
      if (node!.value !== undefined) {
        lastMatch = { value: node!.value, prefixBits: bits - i }
      }
    }
    return lastMatch
  }

  remove(key: number, bits: number): boolean {
    const path: { node: BitTrieNode<T>; bit: number }[] = []
    let node = this.root
    for (let i = bits - 1; i >= 0; i--) {
      const bit = (key >>> i) & 1
      path.push({ node, bit })
      node = bit === 0 ? node.left! : node.right!
      if (!node) return false
    }
    if (node.value === undefined) return false
    node.value = undefined as T
    this._size--
    for (let i = path.length - 1; i >= 0; i--) {
      const { node: parent, bit } = path[i]!
      const child = bit === 0 ? parent.left! : parent.right!
      if (child.value !== undefined || child.left || child.right) break
      if (bit === 0) parent.left = undefined
      else parent.right = undefined
    }
    return true
  }

  has(key: number, bits: number): boolean {
    return this.lookup(key, bits) !== undefined
  }

  clear(): void {
    this.root = new BitTrieNode<T>()
    this._size = 0
  }

  *entries(): Generator<{ key: number; bits: number; value: T }> {
    yield* this.collectEntries(this.root, 0, 0)
  }

  private *collectEntries(
    node: BitTrieNode<T>,
    prefix: number,
    depth: number,
  ): Generator<{ key: number; bits: number; value: T }> {
    if (node.value !== undefined) {
      yield { key: prefix, bits: depth, value: node.value }
    }
    if (node.left) yield* this.collectEntries(node.left, (prefix << 1) | 0, depth + 1)
    if (node.right) yield* this.collectEntries(node.right, (prefix << 1) | 1, depth + 1)
  }

  *values(): Generator<T> {
    for (const entry of this.entries()) {
      yield entry.value
    }
  }

  *keys(): Generator<{ key: number; bits: number }> {
    for (const entry of this.entries()) {
      yield { key: entry.key, bits: entry.bits }
    }
  }

  forEach(callback: (value: T, key: number, bits: number) => void): void {
    for (const entry of this.entries()) {
      callback(entry.value, entry.key, entry.bits)
    }
  }

  toArray(): { key: number; bits: number; value: T }[] {
    return Array.from(this.entries())
  }

  toMap(): Map<string, T> {
    const map = new Map<string, T>()
    for (const entry of this.entries()) {
      map.set(`${entry.key}/${entry.bits}`, entry.value)
    }
    return map
  }

  toString(): string {
    return `BitTrie(size=${this._size})`
  }

  toJSON(): Array<{ key: number; bits: number; value: T }> {
    return this.toArray()
  }

  clone(): this {
    const c = new BitTrie<T>()
    for (const { key, bits, value } of this.entries()) {
      c.insert(key, bits, value)
    }
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BitTrie)) return false
    if (this._size !== other._size) return false
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    const aset = new Map<string, T>()
    for (const { key, bits, value } of a) aset.set(`${key}/${bits}`, value)
    for (const { key, bits, value } of b) {
      const v = aset.get(`${key}/${bits}`)
      if (!Object.is(v, value)) return false
    }
    return true
  }
}

class BitTrieNode<T> {
  left?: BitTrieNode<T>
  right?: BitTrieNode<T>
  value: T | undefined = undefined
}
