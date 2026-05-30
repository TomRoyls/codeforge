interface DSUNode {
  parent: number
  rank: number
  size: number
}

interface Snapshot {
  a: number
  b: number
  changedA: boolean
  oldParentA: number
  changedRank: boolean
  oldRankA: number
  changedSize: boolean
  oldSizeRoot: number
  root: number
}

export class RollbackDSU {
  private nodes: DSUNode[]
  private components_: number
  private stack: Snapshot[]

  constructor(n: number) {
    if (n < 0) {
      throw new RangeError(`n must be >= 0, got ${n}`)
    }
    this.nodes = []
    for (let i = 0; i < n; i++) {
      this.nodes.push({ parent: i, rank: 0, size: 1 })
    }
    this.components_ = n
    this.stack = []
  }

  private findRoot(x: number): number {
    while (this.nodes[x]!.parent !== x) {
      x = this.nodes[x]!.parent
    }
    return x
  }

  find(x: number): number {
    if (x < 0 || x >= this.nodes.length) return -1
    return this.findRoot(x)
  }

  union(a: number, b: number): boolean {
    if (a < 0 || a >= this.nodes.length || b < 0 || b >= this.nodes.length) return false

    let rootA = this.findRoot(a)
    let rootB = this.findRoot(b)
    if (rootA === rootB) return false

    if (this.nodes[rootA]!.rank < this.nodes[rootB]!.rank) {
      const tmp = rootA
      rootA = rootB
      rootB = tmp
    }

    const snap: Snapshot = {
      a,
      b,
      changedA: this.nodes[rootA]!.rank === this.nodes[rootB]!.rank,
      oldParentA: this.nodes[rootA]!.rank,
      changedRank: this.nodes[rootA]!.rank === this.nodes[rootB]!.rank,
      oldRankA: this.nodes[rootA]!.rank,
      changedSize: true,
      oldSizeRoot: this.nodes[rootA]!.size,
      root: rootA,
    }

    this.nodes[rootB]!.parent = rootA
    if (this.nodes[rootA]!.rank === this.nodes[rootB]!.rank) {
      this.nodes[rootA]!.rank++
    }
    this.nodes[rootA]!.size += this.nodes[rootB]!.size
    this.components_--

    this.stack.push(snap)
    return true
  }

  connected(a: number, b: number): boolean {
    if (a < 0 || a >= this.nodes.length || b < 0 || b >= this.nodes.length) return false
    return this.findRoot(a) === this.findRoot(b)
  }

  componentSize(x: number): number {
    if (x < 0 || x >= this.nodes.length) return 0
    return this.nodes[this.findRoot(x)]!.size
  }

  get components(): number {
    return this.components_
  }

  get size(): number {
    return this.nodes.length
  }

  snapshot(): number {
    return this.stack.length
  }

  rollback(target: number): void {
    while (this.stack.length > target) {
      const snap = this.stack.pop()!
      const rootA = snap.root
      let rootB = this.findRoot(snap.b)
      if (rootB === rootA) {
        rootB = snap.a === rootA ? this.findRoot(snap.b) : snap.a
        let candidate = snap.b
        while (this.nodes[candidate]!.parent !== candidate) {
          candidate = this.nodes[candidate]!.parent
        }
        rootB = candidate
      }

      this.nodes[rootB]!.parent = rootB
      if (snap.changedRank) {
        this.nodes[rootA]!.rank = snap.oldRankA
      }
      this.nodes[rootA]!.size = snap.oldSizeRoot
      this.components_++
    }
  }

  reset(): void {
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i]!.parent = i
      this.nodes[i]!.rank = 0
      this.nodes[i]!.size = 1
    }
    this.components_ = this.nodes.length
    this.stack = []
  }

  getComponentMembers(x: number): number[] {
    if (x < 0 || x >= this.nodes.length) return []
    const root = this.findRoot(x)
    const members: number[] = []
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.findRoot(i) === root) {
        members.push(i)
      }
    }
    return members
  }

  static fromPairs(n: number, pairs: [number, number][]): RollbackDSU {
    const dsu = new RollbackDSU(n)
    for (const [a, b] of pairs) {
      dsu.union(a, b)
    }
    return dsu
  }
}
