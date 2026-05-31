export class CycleSpace {
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

  findCycles(): number[][] {
    const visited = new Array(this.n).fill(false)
    const parent = new Array(this.n).fill(-1)
    const cycles: number[][] = []

    const dfs = (u: number): void => {
      visited[u] = true
      for (const v of this.adj[u]!) {
        if (!visited[v]) {
          parent[v] = u
          dfs(v)
        } else if (v !== parent[u]) {
          const cycle = this.extractCycle(parent, u, v)
          if (cycle.length > 0) {
            const key = [...cycle].sort().join(',')
            if (!seen.has(key)) {
              seen.add(key)
              cycles.push(cycle)
            }
          }
        }
      }
    }

    const seen = new Set<string>()
    for (let i = 0; i < this.n; i++) {
      if (!visited[i]) dfs(i)
    }
    return cycles
  }

  cycleSpaceDimension(): number {
    let edgeCount = 0
    for (let i = 0; i < this.n; i++) edgeCount += this.adj[i]!.size
    edgeCount /= 2
    const visited = new Array(this.n).fill(false)
    let componentCount = 0
    for (let i = 0; i < this.n; i++) {
      if (!visited[i]) {
        componentCount++
        const queue = [i]
        visited[i] = true
        while (queue.length > 0) {
          const u = queue.shift()!
          for (const v of this.adj[u]!) {
            if (!visited[v]) {
              visited[v] = true
              queue.push(v)
            }
          }
        }
      }
    }
    return edgeCount - this.n + componentCount
  }

  isTree(): boolean {
    return this.cycleSpaceDimension() === 0
  }

  private extractCycle(parent: number[], u: number, v: number): number[] {
    const pathU: number[] = []
    const pathV: number[] = []
    let a = u
    let b = v
    const depth = new Array(this.n).fill(0)
    for (let i = 0; i < this.n; i++) {
      let p = i
      while (p !== -1) {
        depth[i]++
        p = parent[p]!
      }
    }
    while (depth[a]! > depth[b]!) {
      pathU.push(a)
      a = parent[a]!
    }
    while (depth[b]! > depth[a]!) {
      pathV.push(b)
      b = parent[b]!
    }
    while (a !== b) {
      pathU.push(a)
      pathV.push(b)
      a = parent[a]!
      b = parent[b]!
    }
    pathU.push(a)
    return [...pathU, ...pathV.reverse()]
  }
}
