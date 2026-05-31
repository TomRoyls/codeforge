export class CartesianProductGraph {
  private adj1: Set<number>[] = []
  private adj2: Set<number>[] = []
  private n1: number
  private n2: number

  constructor(n1: number, n2: number) {
    this.n1 = n1
    this.n2 = n2
    for (let i = 0; i < n1; i++) this.adj1.push(new Set())
    for (let i = 0; i < n2; i++) this.adj2.push(new Set())
  }

  addEdgeG1(u: number, v: number): void {
    this.adj1[u]!.add(v)
    this.adj1[v]!.add(u)
  }

  addEdgeG2(u: number, v: number): void {
    this.adj2[u]!.add(v)
    this.adj2[v]!.add(u)
  }

  productNodeCount(): number {
    return this.n1 * this.n2
  }

  productEdgeCount(): number {
    let edges = 0
    for (let u1 = 0; u1 < this.n1; u1++) {
      for (const v1 of this.adj1[u1]!) {
        for (let u2 = 0; u2 < this.n2; u2++) {
          edges++
        }
      }
    }
    for (let u2 = 0; u2 < this.n2; u2++) {
      for (const v2 of this.adj2[u2]!) {
        for (let u1 = 0; u1 < this.n1; u1++) {
          edges++
        }
      }
    }
    return edges / 2
  }

  areAdjacent(a: [number, number], b: [number, number]): boolean {
    const [a1, a2] = a
    const [b1, b2] = b
    if (a1 === b1 && this.adj2[a2]!.has(b2)) return true
    if (a2 === b2 && this.adj1[a1]!.has(b1)) return true
    return false
  }

  productDegree(u1: number, u2: number): number {
    return this.adj1[u1]!.size + this.adj2[u2]!.size
  }
}
