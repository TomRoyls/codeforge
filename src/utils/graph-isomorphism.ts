export class GraphIsomorphism {
  private adj1: Set<number>[] = []
  private adj2: Set<number>[] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) {
      this.adj1.push(new Set())
      this.adj2.push(new Set())
    }
  }

  addEdgeG1(u: number, v: number): void {
    this.adj1[u]!.add(v)
    this.adj1[v]!.add(u)
  }

  addEdgeG2(u: number, v: number): void {
    this.adj2[u]!.add(v)
    this.adj2[v]!.add(u)
  }

  degreeSequence(adj: Set<number>[]): number[] {
    return adj.map(s => s.size).sort((a, b) => b - a)
  }

  isomorphic(): boolean {
    if (this.n === 0) return true
    const deg1 = this.degreeSequence(this.adj1)
    const deg2 = this.degreeSequence(this.adj2)
    if (deg1.length !== deg2.length) return false
    for (let i = 0; i < deg1.length; i++) {
      if (deg1[i] !== deg2[i]) return false
    }
    let edgeCount1 = 0, edgeCount2 = 0
    for (let i = 0; i < this.n; i++) {
      edgeCount1 += this.adj1[i]!.size
      edgeCount2 += this.adj2[i]!.size
    }
    if (edgeCount1 !== edgeCount2) return false
    return this.checkPermutation()
  }

  private checkPermutation(): boolean {
    const perm = Array.from({ length: this.n }, (_, i) => i)
    return this.permute(perm, 0)
  }

  private permute(perm: number[], start: number): boolean {
    if (start === this.n) {
      return this.checkMapping(perm)
    }
    for (let i = start; i < this.n; i++) {
      ;[perm[start], perm[i]] = [perm[i]!, perm[start]!]
      if (this.prune(perm, start + 1) && this.permute(perm, start + 1)) {
        return true
      }
      ;[perm[start], perm[i]] = [perm[i]!, perm[start]!]
    }
    return false
  }

  private prune(perm: number[], len: number): boolean {
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const g1Edge = this.adj1[i]!.has(j)
        const g2Edge = this.adj2[perm[i]!]!.has(perm[j]!)
        if (g1Edge !== g2Edge) return false
      }
    }
    return true
  }

  private checkMapping(perm: number[]): boolean {
    for (let i = 0; i < this.n; i++) {
      for (const j of this.adj1[i]!) {
        if (!this.adj2[perm[i]!]!.has(perm[j]!)) return false
      }
    }
    return true
  }

  toString(): string {
    return `GraphIsomorphism(${this.n})`
  }

  toJSON(): unknown {
    return { n: this.n, adj1: this.adj1.map(s => [...s]), adj2: this.adj2.map(s => [...s]) }
  }

  clone(): GraphIsomorphism {
    const copy = new GraphIsomorphism(this.n)
    for (let i = 0; i < this.n; i++) {
      for (const v of this.adj1[i]!) copy.addEdgeG1(i, v)
      for (const v of this.adj2[i]!) copy.addEdgeG2(i, v)
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof GraphIsomorphism)) return false
    if (this.n !== other.n) return false
    for (let i = 0; i < this.n; i++) {
      if (this.adj1[i]!.size !== other.adj1[i]!.size) return false
      if (this.adj2[i]!.size !== other.adj2[i]!.size) return false
      for (const v of this.adj1[i]!) if (!other.adj1[i]!.has(v)) return false
      for (const v of this.adj2[i]!) if (!other.adj2[i]!.has(v)) return false
    }
    return true
  }
}
