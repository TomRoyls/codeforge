export class DominatorTree {
  private adj: number[][] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push([])
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.push(v)
  }

  build(root: number): number[] {
    const dom = new Array(this.n).fill(-1)
    const visited = new Array(this.n).fill(false)
    const order: number[] = []

    const dfs = (u: number): void => {
      visited[u] = true
      order.push(u)
      for (const v of this.adj[u]!) {
        if (!visited[v]) dfs(v)
      }
    }

    dfs(root)
    const reachable = new Set(order)

    const preds: number[][] = Array.from({ length: this.n }, () => [])
    for (let u = 0; u < this.n; u++) {
      for (const v of this.adj[u]!) {
        if (reachable.has(v)) preds[v]!.push(u)
      }
    }

    dom[root] = root
    let changed = true
    while (changed) {
      changed = false
      for (const u of order) {
        if (u === root) continue
        const reachablePreds = preds[u]!.filter(p => dom[p] !== -1)
        if (reachablePreds.length === 0) continue
        let newIdom = reachablePreds[0]!
        for (let i = 1; i < reachablePreds.length; i++) {
          newIdom = this.intersect(newIdom, reachablePreds[i]!, dom)
        }
        if (dom[u] !== newIdom) {
          dom[u] = newIdom
          changed = true
        }
      }
    }

    return dom
  }

  dominates(root: number, dominator: number, node: number): boolean {
    if (dominator === node) return true
    const dom = this.build(root)
    let curr = node
    while (curr !== root && curr !== -1) {
      curr = dom[curr]!
      if (curr === dominator) return true
    }
    return false
  }

  private intersect(b1: number, b2: number, dom: number[]): number {
    let finger1 = b1
    let finger2 = b2
    while (finger1 !== finger2) {
      while (finger1 > finger2) finger1 = dom[finger1]!
      while (finger2 > finger1) finger2 = dom[finger2]!
    }
    return finger1
  }

  toString(): string {
    return `DominatorTree(n=${this.n})`
  }

  toJSON(): { n: number; edges: number[][] } {
    return { n: this.n, edges: this.adj.map(row => [...row]) }
  }

  clone(): DominatorTree {
    const copy = new DominatorTree(this.n)
    copy.adj = this.adj.map(row => [...row])
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DominatorTree)) return false
    if (this.n !== other.n) return false
    return true
  }
}
