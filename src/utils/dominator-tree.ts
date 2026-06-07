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
    const postOrder: number[] = []
    const postOrderNum = new Array(this.n).fill(-1)

    const dfs = (u: number): void => {
      visited[u] = true
      for (const v of this.adj[u]!) {
        if (!visited[v]) dfs(v)
      }
      postOrderNum[u] = postOrder.length
      postOrder.push(u)
    }

    dfs(root)
    const reachable = new Set(postOrder)

    const preds: number[][] = Array.from({ length: this.n }, () => [])
    for (let u = 0; u < this.n; u++) {
      if (!reachable.has(u)) continue
      for (const v of this.adj[u]!) {
        if (reachable.has(v)) preds[v]!.push(u)
      }
    }

    dom[root] = root
    let changed = true
    while (changed) {
      changed = false
      for (let i = postOrder.length - 2; i >= 0; i--) {
        const u = postOrder[i]!
        const reachablePreds = preds[u]!.filter(p => dom[p] !== -1)
        if (reachablePreds.length === 0) continue
        let newIdom = reachablePreds[0]!
        for (let j = 1; j < reachablePreds.length; j++) {
          newIdom = this.intersect(newIdom, reachablePreds[j]!, dom, postOrderNum)
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

  private intersect(b1: number, b2: number, dom: number[], postOrderNum: number[]): number {
    let finger1 = b1
    let finger2 = b2
    while (finger1 !== finger2) {
      while (postOrderNum[finger1]! < postOrderNum[finger2]!) finger1 = dom[finger1]!
      while (postOrderNum[finger2]! < postOrderNum[finger1]!) finger2 = dom[finger2]!
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
