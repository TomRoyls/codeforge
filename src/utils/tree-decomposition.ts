export class TreeDecomposition {
  private adj: Set<number>[] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push(new Set())
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.add(v)
    this.adj[v]!.add(u)
  }

  treewidth(): number {
    const order = this.minDegreeOrder()
    let maxBag = 0
    const eliminated = new Array(this.n).fill(false)
    const neighbors: Set<number>[] = this.adj.map(s => new Set(s))

    for (const u of order) {
      const bag = neighbors[u]!.size
      maxBag = Math.max(maxBag, bag)
      const nbrs = [...neighbors[u]!]
      for (let i = 0; i < nbrs.length; i++) {
        for (let j = i + 1; j < nbrs.length; j++) {
          neighbors[nbrs[i]!]!.add(nbrs[j]!)
          neighbors[nbrs[j]!]!.add(nbrs[i]!)
        }
      }
      eliminated[u] = true
      for (const v of nbrs) {
        neighbors[v]!.delete(u)
      }
    }
    return maxBag
  }

  bags(): number[][] {
    const order = this.minDegreeOrder()
    const result: number[][] = []
    const eliminated = new Array(this.n).fill(false)
    const neighbors: Set<number>[] = this.adj.map(s => new Set(s))

    for (const u of order) {
      const bag = [u, ...neighbors[u]!]
      result.push(bag)
      const nbrs = [...neighbors[u]!]
      for (let i = 0; i < nbrs.length; i++) {
        for (let j = i + 1; j < nbrs.length; j++) {
          neighbors[nbrs[i]!]!.add(nbrs[j]!)
          neighbors[nbrs[j]!]!.add(nbrs[i]!)
        }
      }
      eliminated[u] = true
      for (const v of nbrs) {
        neighbors[v]!.delete(u)
      }
    }
    return result
  }

  private minDegreeOrder(): number[] {
    const order: number[] = []
    const used = new Array(this.n).fill(false)
    const deg: number[] = this.adj.map(s => s.size)

    for (let step = 0; step < this.n; step++) {
      let best = -1
      let bestDeg = Infinity
      for (let i = 0; i < this.n; i++) {
        if (!used[i] && deg[i]! < bestDeg) {
          bestDeg = deg[i]!
          best = i
        }
      }
      order.push(best!)
      used[best!] = true
      deg[best!] = 0
      for (const v of this.adj[best!]!) {
        if (!used[v]) deg[v]!--
      }
    }
    return order
  }
}
