export class EulerianPath {
  readonly path: number[]
  readonly isEulerian: boolean
  readonly type: 'circuit' | 'path' | 'none'

  constructor(adj: number[][]) {
    const n = adj.length

    let oddCount = 0
    let startNode = 0
    for (let i = 0; i < n; i++) {
      if (adj[i]!.length % 2 !== 0) {
        oddCount++
        startNode = i
      }
    }

    if (oddCount === 0) {
      this.type = 'circuit'
      this.isEulerian = true
      for (let i = 0; i < n; i++) {
        if (adj[i]!.length > 0) { startNode = i; break }
      }
    } else if (oddCount === 2) {
      this.type = 'path'
      this.isEulerian = true
    } else {
      this.type = 'none'
      this.isEulerian = false
      this.path = []
      return
    }

    const edgeCount = adj.reduce((sum, neighbors) => sum + neighbors.length, 0)
    if (edgeCount === 0) {
      this.path = []
      this.isEulerian = true
      this.type = 'circuit'
      return
    }

    const adjCopy = adj.map(row => [...row])
    this.path = []
    const stack: number[] = [startNode]

    while (stack.length > 0) {
      const u = stack[stack.length - 1]!
      if (adjCopy[u]!.length > 0) {
        const v = adjCopy[u]!.pop()!
        stack.push(v)
      } else {
        this.path.push(stack.pop()!)
      }
    }

    this.path.reverse()

    if (this.path.length !== edgeCount + 1) {
      this.isEulerian = false
      this.type = 'none'
    }
  }

  static hasEulerianCircuit(adj: number[][]): boolean {
    const ep = new EulerianPath(adj)
    return ep.type === 'circuit'
  }

  static hasEulerianPath(adj: number[][]): boolean {
    const ep = new EulerianPath(adj)
    return ep.isEulerian
  }
}
