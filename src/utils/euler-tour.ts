export class EulerTour {
  readonly tour: number[]
  readonly first: number[]
  readonly last: number[]
  readonly depth: number[]
  readonly parent: number[]

  constructor(adj: number[][], root: number = 0) {
    const n = adj.length
    this.tour = []
    this.first = new Array(n).fill(-1)
    this.last = new Array(n).fill(-1)
    this.depth = new Array(n).fill(0)
    this.parent = new Array(n).fill(-1)
    let timer = 0

    const stack: Array<[number, number, boolean]> = [[root, -1, false]]

    while (stack.length > 0) {
      const [u, p, visited] = stack.pop()!
      if (visited) {
        this.last[u] = timer - 1
        continue
      }

      this.first[u] = timer
      this.tour.push(u)
      timer++

      if (p !== -1) {
        this.depth[u] = this.depth[p]! + 1
        this.parent[u] = p
      }

      stack.push([u, p, true])
      for (let i = adj[u]!.length - 1; i >= 0; i--) {
        const v = adj[u]![i]!
        if (v !== p) {
          stack.push([v, u, false])
        }
      }
    }
  }

  isAncestor(u: number, v: number): boolean {
    return this.first[u]! <= this.first[v]! && this.last[u]! >= this.last[v]!
  }

  getSubtreeRange(u: number): [number, number] {
    return [this.first[u]!, this.last[u]!]
  }

  getSubtreeSize(u: number): number {
    return this.last[u]! - this.first[u]! + 1
  }

  getPath(start: number, end: number): number[] {
    const path: number[] = []
    let current = end
    while (current !== -1 && current !== start) {
      path.push(current)
      current = this.parent[current]!
    }
    if (current === -1) return []
    path.push(start)
    path.reverse()
    return path
  }
}
