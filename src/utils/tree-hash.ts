export class TreeHash {
  private adj: number[][] = []
  private n: number

  constructor(n: number) {
    this.n = n
    for (let i = 0; i < n; i++) this.adj.push([])
  }

  addEdge(u: number, v: number): void {
    this.adj[u]!.push(v)
    this.adj[v]!.push(u)
  }

  hash(root: number): bigint {
    return this.hashDFS(root, -1)
  }

  private hashDFS(u: number, parent: number): bigint {
    const childHashes: bigint[] = []
    for (const v of this.adj[u]!) {
      if (v !== parent) {
        childHashes.push(this.hashDFS(v, u))
      }
    }
    childHashes.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    let h = 1n
    for (const ch of childHashes) {
      h = h * 1000003n + ch
    }
    return h
  }

  isIsomorphic(other: TreeHash, rootA: number, rootB: number): boolean {
    return this.hash(rootA) === other.hash(rootB)
  }

  findCenter(): number[] {
    if (this.n <= 2) return Array.from({ length: this.n }, (_, i) => i)
    const degree = new Array(this.n).fill(0)
    for (let i = 0; i < this.n; i++) degree[i] = this.adj[i]!.length
    const leaves: number[] = []
    for (let i = 0; i < this.n; i++) {
      if (degree[i]! <= 1) leaves.push(i)
    }
    let count = leaves.length
    while (count < this.n) {
      const newLeaves: number[] = []
      for (const leaf of leaves) {
        for (const neighbor of this.adj[leaf]!) {
          degree[neighbor]!--
          if (degree[neighbor] === 1) newLeaves.push(neighbor)
        }
      }
      count += newLeaves.length
      leaves.length = 0
      leaves.push(...newLeaves)
    }
    return leaves
  }

  rootedHash(): bigint {
    const centers = this.findCenter()
    if (centers.length === 1) return this.hash(centers[0]!)
    const h1 = this.hash(centers[0]!)
    const h2 = this.hash(centers[1]!)
    return h1 < h2 ? h1 * 1000003n + h2 : h2 * 1000003n + h1
  }
}
