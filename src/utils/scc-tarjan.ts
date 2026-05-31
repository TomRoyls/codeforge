export class SCCTarjan {
  private adj: number[][] = []
  private index = 0
  private stack: number[] = []
  private onStack: boolean[] = []
  private indices: number[] = []
  private lowlink: number[] = []
  private components: number[][] = []

  constructor(n: number) {
    for (let i = 0; i < n; i++) {
      this.adj.push([])
      this.onStack.push(false)
      this.indices.push(-1)
      this.lowlink.push(-1)
    }
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.push(v)
  }

  solve(): number[][] {
    this.index = 0
    this.stack = []
    this.components = []
    this.onStack = new Array(this.adj.length).fill(false)
    this.indices = new Array(this.adj.length).fill(-1)
    this.lowlink = new Array(this.adj.length).fill(-1)
    for (let v = 0; v < this.adj.length; v++) {
      if (this.indices[v] === -1) this.strongconnect(v)
    }
    return this.components
  }

  private strongconnect(v: number): void {
    this.indices[v] = this.index
    this.lowlink[v] = this.index
    this.index++
    this.stack.push(v)
    this.onStack[v] = true
    for (const w of this.adj[v]!) {
      if (this.indices[w] === -1) {
        this.strongconnect(w)
        this.lowlink[v] = Math.min(this.lowlink[v]!, this.lowlink[w]!)
      } else if (this.onStack[w]) {
        this.lowlink[v] = Math.min(this.lowlink[v]!, this.indices[w]!)
      }
    }
    if (this.lowlink[v] === this.indices[v]) {
      const component: number[] = []
      let w: number
      do {
        w = this.stack.pop()!
        this.onStack[w] = false
        component.push(w)
      } while (w !== v)
      this.components.push(component)
    }
  }
}
