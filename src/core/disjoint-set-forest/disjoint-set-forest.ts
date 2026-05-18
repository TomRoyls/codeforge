export class DisjointSetForest<T> {
  private parent: Map<T, T> = new Map()
  private rank: Map<T, number> = new Map()
  private sizes: Map<T, number> = new Map()
  private setCount: number = 0

  makeSet(item: T): void {
    if (this.parent.has(item)) return
    this.parent.set(item, item)
    this.rank.set(item, 0)
    this.sizes.set(item, 1)
    this.setCount++
  }

  find(item: T): T {
    if (!this.parent.has(item)) {
      throw new Error(`Item not found in DisjointSetForest`)
    }
    let current = item
    while (this.parent.get(current) !== current) {
      const grandparent = this.parent.get(this.parent.get(current)!)
      if (grandparent !== undefined) {
        this.parent.set(current, grandparent)
      }
      current = this.parent.get(current)!
    }
    return current
  }

  union(a: T, b: T): boolean {
    if (!this.parent.has(a) || !this.parent.has(b)) {
      throw new Error(`Item not found in DisjointSetForest`)
    }
    const rootA = this.find(a)
    const rootB = this.find(b)
    if (rootA === rootB) return false
    const rankA = this.rank.get(rootA)!
    const rankB = this.rank.get(rootB)!
    if (rankA < rankB) {
      this.parent.set(rootA, rootB)
      this.sizes.set(rootB, this.sizes.get(rootB)! + this.sizes.get(rootA)!)
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA)
      this.sizes.set(rootA, this.sizes.get(rootA)! + this.sizes.get(rootB)!)
    } else {
      this.parent.set(rootB, rootA)
      this.rank.set(rootA, rankA + 1)
      this.sizes.set(rootA, this.sizes.get(rootA)! + this.sizes.get(rootB)!)
    }
    this.setCount--
    return true
  }

  connected(a: T, b: T): boolean {
    if (!this.parent.has(a) || !this.parent.has(b)) return false
    return this.find(a) === this.find(b)
  }

  size(item: T): number {
    if (!this.parent.has(item)) return 0
    const root = this.find(item)
    return this.sizes.get(root)!
  }

  get count(): number {
    return this.setCount
  }

  get itemCount(): number {
    return this.parent.size
  }

  sets(): T[][] {
    const groups = new Map<T, T[]>()
    for (const item of this.parent.keys()) {
      const root = this.find(item)
      let group = groups.get(root)
      if (!group) {
        group = []
        groups.set(root, group)
      }
      group.push(item)
    }
    return [...groups.values()]
  }

  components(): Map<T, T[]> {
    const groups = new Map<T, T[]>()
    for (const item of this.parent.keys()) {
      const root = this.find(item)
      let group = groups.get(root)
      if (!group) {
        group = []
        groups.set(root, group)
      }
      group.push(item)
    }
    return groups
  }

  has(item: T): boolean {
    return this.parent.has(item)
  }

  clear(): void {
    this.parent.clear()
    this.rank.clear()
    this.sizes.clear()
    this.setCount = 0
  }

  clone(): DisjointSetForest<T> {
    const cloned = new DisjointSetForest<T>()
    cloned.parent = new Map(this.parent)
    cloned.rank = new Map(this.rank)
    cloned.sizes = new Map(this.sizes)
    cloned.setCount = this.setCount
    return cloned
  }

  toArray(): T[] {
    return Array.from(this.parent.keys())
  }
}

export type { DisjointSetForestNode } from './types.js'
