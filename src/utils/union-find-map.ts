export class UnionFindMap<K> {
  private parent = new Map<K, K>()
  private rank = new Map<K, number>()

  add(key: K): void {
    if (!this.parent.has(key)) {
      this.parent.set(key, key)
      this.rank.set(key, 0)
    }
  }

  find(key: K): K | undefined {
    if (!this.parent.has(key)) return undefined
    let root = key
    while (this.parent.get(root) !== root) {
      this.parent.set(root, this.parent.get(this.parent.get(root)!)!)
      root = this.parent.get(root)!
    }
    return root
  }

  union(a: K, b: K): boolean {
    const rootA = this.find(a)
    const rootB = this.find(b)
    if (rootA === undefined || rootB === undefined) return false
    if (rootA === rootB) return false
    const rankA = this.rank.get(rootA)!
    const rankB = this.rank.get(rootB)!
    if (rankA < rankB) {
      this.parent.set(rootA, rootB)
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA)
    } else {
      this.parent.set(rootB, rootA)
      this.rank.set(rootA, rankA + 1)
    }
    return true
  }

  connected(a: K, b: K): boolean {
    const ra = this.find(a)
    const rb = this.find(b)
    return ra !== undefined && rb !== undefined && ra === rb
  }

  get size(): number {
    return this.parent.size
  }

  get isEmpty(): boolean {
    return this.parent.size === 0
  }

  components(): Map<K, K[]> {
    const map = new Map<K, K[]>()
    for (const key of this.parent.keys()) {
      const root = this.find(key)!
      if (!map.has(root)) map.set(root, [])
      map.get(root)!.push(key)
    }
    return map
  }

  get componentCount(): number {
    return this.components().size
  }

  clear(): void {
    this.parent.clear()
    this.rank.clear()
  }

  toArray(): Array<[K, K]> {
    return Array.from(this.parent.entries()).map(([k]) => [k, this.find(k)!])
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): Array<[K, K]> {
    return this.toArray()
  }

  clone(): UnionFindMap<K> {
    const copy = new UnionFindMap<K>()
    copy.parent = new Map(this.parent)
    copy.rank = new Map(this.rank)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof UnionFindMap)) return false
    return this.size === other.size
  }
}
