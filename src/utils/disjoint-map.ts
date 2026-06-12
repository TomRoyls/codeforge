export class DisjointMap<K, V> {
  private parent = new Map<K, K>()
  private rank = new Map<K, number>()
  private groupData = new Map<K, V>()

  set(key: K, value: V): void {
    if (!this.parent.has(key)) {
      this.parent.set(key, key)
      this.rank.set(key, 0)
    }
    this.groupData.set(this.find(key)!, value)
  }

  get(key: K): V | undefined {
    if (!this.parent.has(key)) return undefined
    return this.groupData.get(this.find(key)!)
  }

  has(key: K): boolean {
    return this.parent.has(key)
  }

  union(a: K, b: K): void {
    this.ensure(a)
    this.ensure(b)
    const rootA = this.find(a)!
    const rootB = this.find(b)!
    if (rootA === rootB) return
    const rankA = this.rank.get(rootA)!
    const rankB = this.rank.get(rootB)!
    if (rankA < rankB) {
      this.parent.set(rootA, rootB)
      this.groupData.delete(rootA)
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA)
      this.groupData.delete(rootB)
    } else {
      this.parent.set(rootB, rootA)
      this.rank.set(rootA, rankA + 1)
      this.groupData.delete(rootB)
    }
  }

  connected(a: K, b: K): boolean {
    if (!this.parent.has(a) || !this.parent.has(b)) return false
    return this.find(a) === this.find(b)
  }

  find(key: K): K | undefined {
    if (!this.parent.has(key)) return undefined
    let root = key
    while (this.parent.get(root) !== root) {
      root = this.parent.get(root)!
    }
    while (this.parent.get(key) !== key) {
      const next = this.parent.get(key)!
      this.parent.set(key, root)
      key = next
    }
    return root
  }

  get size(): number {
    return this.parent.size
  }

  get componentCount(): number {
    let count = 0
    for (const [key, parent] of this.parent) {
      if (key === parent) count++
    }
    return count
  }

  delete(key: K): boolean {
    if (!this.parent.has(key)) return false
    this.parent.delete(key)
    this.rank.delete(key)
    this.groupData.delete(key)
    return true
  }

  clear(): void {
    this.parent.clear()
    this.rank.clear()
    this.groupData.clear()
  }

  toArray(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    const seen = new Set<K>()
    for (const key of this.parent.keys()) {
      const root = this.find(key)
      if (root !== undefined && !seen.has(root)) {
        seen.add(root)
        const val = this.groupData.get(root)
        if (val !== undefined) result.push([root, val])
      }
    }
    return result
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): Array<[K, V]> {
    return this.toArray()
  }

  clone(): DisjointMap<K, V> {
    const copy = new DisjointMap<K, V>()
    copy.parent = new Map(this.parent)
    copy.rank = new Map(this.rank)
    copy.groupData = new Map(this.groupData)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DisjointMap)) return false
    if (this.size !== other.size) return false
    for (const key of this.parent.keys()) {
      if (!other.parent.has(key)) return false
    }
    return true
  }

  private ensure(key: K): void {
    if (!this.parent.has(key)) {
      this.parent.set(key, key)
      this.rank.set(key, 0)
    }
  }
}
