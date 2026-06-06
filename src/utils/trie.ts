class TrieNode<V> {
  children: Map<string, TrieNode<V>>
  value: V | undefined
  isTerminal: boolean

  constructor() {
    this.children = new Map()
    this.value = undefined
    this.isTerminal = false
  }
}

export class Trie<V> {
  private root: TrieNode<V>
  private _size = 0

  constructor() {
    this.root = new TrieNode<V>()
  }

  insert(key: string, value: V): void {
    let node = this.root
    for (const char of key) {
      let child = node.children.get(char)
      if (!child) {
        child = new TrieNode<V>()
        node.children.set(char, child)
      }
      node = child
    }
    if (!node.isTerminal) {
      this._size++
    }
    node.isTerminal = true
    node.value = value
  }

  get(key: string): V | undefined {
    const node = this._findNode(key)
    return node?.isTerminal ? node.value : undefined
  }

  has(key: string): boolean {
    const node = this._findNode(key)
    return node !== null && node.isTerminal
  }

  delete(key: string): boolean {
    return this._delete(this.root, key, 0)
  }

  startsWith(prefix: string): [string, V][] {
    const results: [string, V][] = []
    const node = this._findNode(prefix)
    if (node === null) return results
    this._collectAll(node, prefix, results)
    return results
  }

  containsPrefix(prefix: string): boolean {
    return this._findNode(prefix) !== null
  }

  longestCommonPrefix(): string {
    let prefix = ''
    let node = this.root
    while (node.children.size === 1 && !node.isTerminal) {
      const [char, child] = node.children.entries().next().value as [
        string,
        TrieNode<V>,
      ]
      prefix += char
      node = child
    }
    return prefix
  }

  keys(): string[] {
    const results: string[] = []
    this._collectKeys(this.root, '', results)
    return results
  }

  values(): V[] {
    const results: V[] = []
    this._collectValues(this.root, results)
    return results
  }

  entries(): [string, V][] {
    const results: [string, V][] = []
    this._collectAll(this.root, '', results)
    return results
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = new TrieNode<V>()
    this._size = 0
  }

  autocomplete(prefix: string, maxResults?: number): [string, V][] {
    const results: [string, V][] = []
    const node = this._findNode(prefix)
    if (node === null) return results
    this._collectLimited(node, prefix, results, maxResults ?? Infinity)
    return results
  }

  private _findNode(key: string): TrieNode<V> | null {
    let node = this.root
    for (const char of key) {
      const child = node.children.get(char)
      if (!child) return null
      node = child
    }
    return node
  }

  private _delete(
    node: TrieNode<V>,
    key: string,
    depth: number,
  ): boolean {
    if (depth === key.length) {
      if (!node.isTerminal) return false
      node.isTerminal = false
      node.value = undefined
      this._size--
      return true
    }

    const char = key[depth]!
    const child = node.children.get(char)
    if (!child) return false

    const deleted = this._delete(child, key, depth + 1)
    if (!deleted) return false

    if (!child.isTerminal && child.children.size === 0) {
      node.children.delete(char)
    }

    return true
  }

  private _collectAll(
    node: TrieNode<V>,
    prefix: string,
    results: [string, V][],
  ): void {
    if (node.isTerminal && node.value !== undefined) {
      results.push([prefix, node.value])
    }
    for (const [char, child] of node.children) {
      this._collectAll(child, prefix + char, results)
    }
  }

  private _collectLimited(
    node: TrieNode<V>,
    prefix: string,
    results: [string, V][],
    maxResults: number,
  ): void {
    if (results.length >= maxResults) return
    if (node.isTerminal && node.value !== undefined) {
      results.push([prefix, node.value])
    }
    for (const [char, child] of node.children) {
      if (results.length >= maxResults) return
      this._collectLimited(child, prefix + char, results, maxResults)
    }
  }

  private _collectKeys(
    node: TrieNode<V>,
    prefix: string,
    results: string[],
  ): void {
    if (node.isTerminal) results.push(prefix)
    for (const [char, child] of node.children) {
      this._collectKeys(child, prefix + char, results)
    }
  }

  private _collectValues(node: TrieNode<V>, results: V[]): void {
    if (node.isTerminal && node.value !== undefined) results.push(node.value)
    for (const [, child] of node.children) {
      this._collectValues(child, results)
    }
  }

  toString(): string {
    return `[${this.keys().join(', ')}]`
  }

  toJSON(): string[] {
    return this.keys()
  }

  clone(): this {
    const c = new Trie<V>()
    for (const [key, value] of this.entries()) {
      c.insert(key, value)
    }
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Trie)) return false
    const theseEntries = this.entries()
    const thoseEntries = other.entries()
    if (theseEntries.length !== thoseEntries.length) return false
    const otherMap = new Map<string, V>()
    for (const [k, v] of thoseEntries) otherMap.set(k, v)
    for (const [k, v] of theseEntries) {
      const ov = otherMap.get(k)
      if (ov !== v) return false
    }
    return true
  }
}
