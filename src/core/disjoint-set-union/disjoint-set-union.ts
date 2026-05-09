import { DEFAULT_DSU_OPTIONS } from './types.js'

interface Snapshot {
  parent: Int32Array
  rank: Int32Array
  sizes: Int32Array
  count: number
}

export class DisjointSetUnion {
  private parent: Int32Array
  private rank: Int32Array
  private sizes: Int32Array
  private capacity: number
  private count: number
  private readonly n: number
  private snapshots: Map<number, Snapshot>
  private nextSnapshotId: number

  constructor(n: number) {
    if (n < 0) {
      throw new Error(`Size must be non-negative, got ${n}`)
    }
    this.n = n
    this.capacity = Math.max(n, DEFAULT_DSU_OPTIONS.initialCapacity)
    this.parent = new Int32Array(this.capacity)
    this.rank = new Int32Array(this.capacity)
    this.sizes = new Int32Array(this.capacity)
    this.count = n
    this.snapshots = new Map()
    this.nextSnapshotId = 0
    for (let i = 0; i < n; i++) {
      this.parent[i] = i
      this.sizes[i] = 1
      this.rank[i] = 0
    }
  }

  find(x: number): number {
    if (x < 0 || x >= this.n) {
      throw new Error(`Element ${x} out of bounds [0, ${this.n})`)
    }
    if (this.parent[x]! !== x) {
      this.parent[x] = this.find(this.parent[x]!)
    }
    return this.parent[x]!
  }

  union(x: number, y: number): boolean {
    if (x < 0 || x >= this.n || y < 0 || y >= this.n) {
      return false
    }
    const rootX = this.find(x)
    const rootY = this.find(y)
    if (rootX === rootY) return false
    const rankX = this.rank[rootX]!
    const rankY = this.rank[rootY]!
    if (rankX < rankY) {
      this.parent[rootX] = rootY
      this.sizes[rootY] = this.sizes[rootY]! + this.sizes[rootX]!
    } else if (rankX > rankY) {
      this.parent[rootY] = rootX
      this.sizes[rootX] = this.sizes[rootX]! + this.sizes[rootY]!
    } else {
      this.parent[rootY] = rootX
      this.rank[rootX] = rankX + 1
      this.sizes[rootX] = this.sizes[rootX]! + this.sizes[rootY]!
    }
    this.count--
    return true
  }

  connected(x: number, y: number): boolean {
    if (x < 0 || x >= this.n || y < 0 || y >= this.n) return false
    return this.find(x) === this.find(y)
  }

  getSize(x?: number): number {
    if (x === undefined) return this.n
    if (x < 0 || x >= this.n) return 0
    const root = this.find(x)
    return this.sizes[root]!
  }

  getSets(): number[][] {
    const map = new Map<number, number[]>()
    for (let i = 0; i < this.n; i++) {
      const root = this.find(i)
      let arr = map.get(root)
      if (arr === undefined) {
        arr = []
        map.set(root, arr)
      }
      arr.push(i)
    }
    return Array.from(map.values())
  }

  getComponentCount(): number {
    return this.count
  }

  snapshot(): number {
    const id = this.nextSnapshotId++
    const snap: Snapshot = {
      parent: new Int32Array(this.parent),
      rank: new Int32Array(this.rank),
      sizes: new Int32Array(this.sizes),
      count: this.count,
    }
    this.snapshots.set(id, snap)
    return id
  }

  rollback(snapshotId: number): void {
    const snap = this.snapshots.get(snapshotId)
    if (snap === undefined) {
      throw new Error(`Snapshot ${snapshotId} not found`)
    }
    this.parent = new Int32Array(snap.parent)
    this.rank = new Int32Array(snap.rank)
    this.sizes = new Int32Array(snap.sizes)
    this.count = snap.count
  }

  isSame(x: number, y: number): boolean {
    return this.connected(x, y)
  }

  getRepresentative(x: number): number {
    return this.find(x)
  }

  getElements(x: number): number[] {
    if (x < 0 || x >= this.n) return []
    const root = this.find(x)
    const result: number[] = []
    for (let i = 0; i < this.n; i++) {
      if (this.find(i) === root) {
        result.push(i)
      }
    }
    return result
  }

  clone(): DisjointSetUnion {
    const copy = new DisjointSetUnion(this.n)
    copy.parent = new Int32Array(this.parent)
    copy.rank = new Int32Array(this.rank)
    copy.sizes = new Int32Array(this.sizes)
    copy.capacity = this.capacity
    copy.count = this.count
    copy.nextSnapshotId = this.nextSnapshotId
    this.snapshots.forEach((snap, id) => {
      copy.snapshots.set(id, {
        parent: new Int32Array(snap.parent),
        rank: new Int32Array(snap.rank),
        sizes: new Int32Array(snap.sizes),
        count: snap.count,
      })
    })
    return copy
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this.n; i++) {
      result.push(this.find(i))
    }
    return result
  }
}

export { DEFAULT_DSU_OPTIONS } from './types.js'
export type { DisjointSetUnionOptions } from './types.js'
