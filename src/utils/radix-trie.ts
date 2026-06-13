export class RadixTrie<V> {
  private children = new Map<string, RadixTrie<V>>()
  private value: V | undefined
  private hasValue = false

  insert(key: string, value: V): void {
    this.insertRecursive(key, value)
  }

  private insertRecursive(key: string, value: V): void {
    if (key.length === 0) {
      this.value = value
      this.hasValue = true
      return
    }
    const firstChar = key[0]!
    let child = this.children.get(firstChar)
    if (!child) {
      child = new RadixTrie<V>()
      this.children.set(firstChar, child)
    }
    child.insertRecursive(key.slice(1), value)
  }

  get(key: string): V | undefined {
    if (key.length === 0) return this.hasValue ? this.value : undefined
    const child = this.children.get(key[0]!)
    if (!child) return undefined
    return child.get(key.slice(1))
  }

  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  delete(key: string): boolean {
    return this.deleteRecursive(key)
  }

  private deleteRecursive(key: string): boolean {
    if (key.length === 0) {
      if (this.hasValue) {
        this.value = undefined
        this.hasValue = false
        return true
      }
      return false
    }
    const child = this.children.get(key[0]!)
    if (!child) return false
    const result = child.deleteRecursive(key.slice(1))
    if (child.children.size === 0 && !child.hasValue) {
      this.children.delete(key[0]!)
    }
    return result
  }

  keysWithPrefix(prefix: string): string[] {
    const results: string[] = []
    this.collectPrefix(prefix, '', results)
    return results
  }

  private collectPrefix(prefix: string, path: string, results: string[]): void {
    if (prefix.length === 0) {
      this.collectAll(path, results)
      return
    }
    const child = this.children.get(prefix[0]!)
    if (!child) return
    child.collectPrefix(prefix.slice(1), path + prefix[0], results)
  }

  private collectAll(path: string, results: string[]): void {
    if (this.hasValue) results.push(path)
    for (const [char, child] of this.children) {
      child.collectAll(path + char, results)
    }
  }

  get size(): number {
    let count = this.hasValue ? 1 : 0
    for (const child of this.children.values()) {
      count += child.size
    }
    return count
  }

  get isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    this.children.clear()
    this.value = undefined
    this.hasValue = false
  }

  toArray(): Array<[string, V]> {
    const results: Array<[string, V]> = []
    this.collectAllEntries('', results)
    return results
  }

  private collectAllEntries(path: string, results: Array<[string, V]>): void {
    if (this.hasValue) results.push([path, this.value!])
    for (const [char, child] of this.children) {
      child.collectAllEntries(path + char, results)
    }
  }

  toString(): string {
    return JSON.stringify(this.toArray().map(([k]) => k))
  }

  toJSON(): Array<[string, V]> {
    return this.toArray()
  }

  clone(): RadixTrie<V> {
    const copy = new RadixTrie<V>()
    for (const [k, v] of this.toArray()) {
      copy.insert(k, v)
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RadixTrie)) return false
    return this.size === other.size
  }
}
