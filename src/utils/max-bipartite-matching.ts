export class MaxBipartiteMatching {
  private adj: number[][] = []
  private leftSize: number
  private rightSize: number

  constructor(leftSize: number, rightSize: number) {
    this.leftSize = leftSize
    this.rightSize = rightSize
    for (let i = 0; i < leftSize; i++) this.adj.push([])
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.push(v)
  }

  maxMatching(): [number, number][] {
    const matchRight = new Array(this.rightSize).fill(-1)
    const result: [number, number][] = []

    for (let u = 0; u < this.leftSize; u++) {
      const visited = new Array(this.rightSize).fill(false)
      if (this.bpm(u, matchRight, visited)) {
        continue
      }
    }

    for (let v = 0; v < this.rightSize; v++) {
      if (matchRight[v] !== -1) {
        result.push([matchRight[v]!, v])
      }
    }
    return result
  }

  getMatchingSize(): number {
    return this.maxMatching().length
  }

  private bpm(u: number, matchRight: number[], visited: boolean[]): boolean {
    for (const v of this.adj[u]!) {
      if (!visited[v]) {
        visited[v] = true
        if (matchRight[v] === -1 || this.bpm(matchRight[v]!, matchRight, visited)) {
          matchRight[v] = u
          return true
        }
      }
    }
    return false
  }
}
