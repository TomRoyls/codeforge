export class TrieMap<V> {
  private children = new Map<string, TrieMap<V>>()
  private value: V | undefined
  private hasVal = false

  set(key: string, value: V): void {
    let node: TrieMap<V> = this
    for (const ch of key) {
      let child = node.children.get(ch)
      if (!child) {
        child = new TrieMap<V>()
        node.children.set(ch, child)
      }
      node = child
    }
    node.value = value
    node.hasVal = true
  }

  get(key: string): V | undefined {
    let node: TrieMap<V> | undefined = this
    for (const ch of key) {
      node = node.children.get(ch)
      if (!node) return undefined
    }
    return node.hasVal ? node.value : undefined
  }

  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  delete(key: string): boolean {
    return this.deleteRecursive(key, 0)
  }

  private deleteRecursive(key: string, depth: number): boolean {
    if (depth === key.length) {
      if (!this.hasVal) return false
      this.value = undefined
      this.hasVal = false
      return true
    }
    const child = this.children.get(key[depth]!)
    if (!child) return false
    const result = child.deleteRecursive(key, depth + 1)
    if (result && child.children.size === 0 && !child.hasVal) {
      this.children.delete(key[depth]!)
    }
    return result
  }

  keysWithPrefix(prefix: string): string[] {
    let node: TrieMap<V> | undefined = this
    for (const ch of prefix) {
      node = node.children.get(ch)
      if (!node) return []
    }
    const results: string[] = []
    node.collectKeys(prefix, results)
    return results
  }

  private collectKeys(path: string, results: string[]): void {
    if (this.hasVal) results.push(path)
    for (const [ch, child] of this.children) {
      child.collectKeys(path + ch, results)
    }
  }

  get size(): number {
    let count = this.hasVal ? 1 : 0
    for (const child of this.children.values()) count += child.size
    return count
  }

  get isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    this.children.clear()
    this.value = undefined
    this.hasVal = false
  }

  toArray(): Array<[string, V]> {
    const results: Array<[string, V]> = []
    this.collectEntries('', results)
    return results
  }

  private collectEntries(path: string, results: Array<[string, V]>): void {
    if (this.hasVal) results.push([path, this.value!])
    for (const [ch, child] of this.children) {
      child.collectEntries(path + ch, results)
    }
  }

  toString(): string {
    return JSON.stringify(this.toArray().map(([k]) => k))
  }

  toJSON(): Array<[string, V]> {
    return this.toArray()
  }

  clone(): TrieMap<V> {
    const copy = new TrieMap<V>()
    for (const [k, v] of this.toArray()) copy.set(k, v)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof TrieMap)) return false
    return this.size === other.size
  }
}
