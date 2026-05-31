export class ModularDecomposition {
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

  findModules(): number[][] {
    if (this.n === 0) return []
    const modules: number[][] = []
    const assigned = new Array(this.n).fill(false)

    for (let i = 0; i < this.n; i++) {
      if (assigned[i]!) continue
      const module: number[] = [i]
      assigned[i] = true
      for (let j = i + 1; j < this.n; j++) {
        if (assigned[j]!) continue
        if (this.isModule(i, j)) {
          module.push(j)
          assigned[j] = true
        }
      }
      modules.push(module)
    }
    return modules
  }

  isModule(a: number, b: number): boolean {
    for (let v = 0; v < this.n; v++) {
      if (v === a || v === b) continue
      const adjA = this.adj[a]!.has(v)
      const adjB = this.adj[b]!.has(v)
      if (adjA !== adjB) return false
    }
    return true
  }

  isStrongModule(vertices: number[]): boolean {
    if (vertices.length < 2) return true
    for (let i = 0; i < this.n; i++) {
      if (vertices.includes(i)) continue
      let adjCount = 0
      for (const v of vertices) {
        if (this.adj[i]!.has(v)) adjCount++
      }
      if (adjCount !== 0 && adjCount !== vertices.length) return false
    }
    return true
  }

  moduleCount(): number {
    return this.findModules().length
  }
}
