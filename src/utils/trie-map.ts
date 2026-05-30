export class TrieMap<T> {
  private root: TrieNode<T>
  private _size: number

  constructor() {
    this.root = { children: new Map(), value: undefined, hasValue: false }
    this._size = 0
  }

  set(key: string, value: T): void {
    let node = this.root
    for (let i = 0; i < key.length; i++) {
      const ch = key[i]!
      let child = node.children.get(ch)
      if (!child) {
        child = { children: new Map(), value: undefined, hasValue: false }
        node.children.set(ch, child)
      }
      node = child
    }
    if (!node.hasValue) this._size++
    node.value = value
    node.hasValue = true
  }

  get(key: string): T | undefined {
    const node = this.findNode(key)
    return node?.hasValue ? node.value : undefined
  }

  has(key: string): boolean {
    const node = this.findNode(key)
    return node !== undefined && node.hasValue
  }

  delete(key: string): boolean {
    return this.deleteRecursive(this.root, key, 0)
  }

  hasPrefix(prefix: string): boolean {
    return this.findNode(prefix) !== undefined
  }

  keysWithPrefix(prefix: string): string[] {
    const node = this.findNode(prefix)
    if (!node) return []
    const results: string[] = []
    this.collectKeys(node, prefix, results)
    return results
  }

  valuesWithPrefix(prefix: string): T[] {
    const node = this.findNode(prefix)
    if (!node) return []
    const results: T[] = []
    this.collectValues(node, results)
    return results
  }

  entriesWithPrefix(prefix: string): Array<[string, T]> {
    const node = this.findNode(prefix)
    if (!node) return []
    const results: Array<[string, T]> = []
    this.collectEntries(node, prefix, results)
    return results
  }

  longestPrefixOf(query: string): string {
    let node = this.root
    let longest = ''
    let current = ''
    for (let i = 0; i < query.length; i++) {
      const child = node.children.get(query[i]!)
      if (!child) break
      current += query[i]
      if (child.hasValue) longest = current
      node = child
    }
    return longest
  }

  clear(): void {
    this.root = { children: new Map(), value: undefined, hasValue: false }
    this._size = 0
  }

  get size(): number {
    return this._size
  }

  private findNode(key: string): TrieNode<T> | undefined {
    let node = this.root
    for (let i = 0; i < key.length; i++) {
      const child = node.children.get(key[i]!)
      if (!child) return undefined
      node = child
    }
    return node
  }

  private deleteRecursive(node: TrieNode<T>, key: string, depth: number): boolean {
    if (depth === key.length) {
      if (!node.hasValue) return false
      node.hasValue = false
      node.value = undefined
      this._size--
      return true
    }
    const ch = key[depth]!
    const child = node.children.get(ch)
    if (!child) return false
    const deleted = this.deleteRecursive(child, key, depth + 1)
    if (deleted && child.children.size === 0 && !child.hasValue) {
      node.children.delete(ch)
    }
    return deleted
  }

  private collectKeys(node: TrieNode<T>, prefix: string, results: string[]): void {
    if (node.hasValue) results.push(prefix)
    for (const [ch, child] of node.children) {
      this.collectKeys(child, prefix + ch, results)
    }
  }

  private collectValues(node: TrieNode<T>, results: T[]): void {
    if (node.hasValue) results.push(node.value!)
    for (const child of node.children.values()) {
      this.collectValues(child, results)
    }
  }

  private collectEntries(node: TrieNode<T>, prefix: string, results: Array<[string, T]>): void {
    if (node.hasValue) results.push([prefix, node.value!])
    for (const [ch, child] of node.children) {
      this.collectEntries(child, prefix + ch, results)
    }
  }
}

interface TrieNode<T> {
  children: Map<string, TrieNode<T>>
  value: T | undefined
  hasValue: boolean
}
