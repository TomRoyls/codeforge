export class MoAlgorithmTree {
  private adj: [number, number][] = []
  private n: number

  constructor(n: number) {
    this.n = n
  }

  addEdge(u: number, v: number): void {
    this.adj.push([u, v])
  }

  processQueries(
    queries: [number, number][],
    add: (node: number) => void,
    remove: (node: number) => void
  ): void {
    const adjList: number[][] = Array.from({ length: this.n }, () => [])
    for (const [u, v] of this.adj) {
      adjList[u]!.push(v)
      adjList[v]!.push(u)
    }

    const euler: number[] = []
    const first = new Array(this.n).fill(-1)
    const last = new Array(this.n).fill(-1)
    const visited = new Array(this.n).fill(false)

    const dfs = (u: number): void => {
      visited[u] = true
      first[u] = euler.length
      euler.push(u)
      for (const v of adjList[u]!) {
        if (!visited[v]) {
          dfs(v)
          euler.push(u)
        }
      }
      last[u] = euler.length - 1
    }

    for (let i = 0; i < this.n; i++) {
      if (!visited[i]) dfs(i)
    }

    const blockSize = Math.max(1, Math.floor(Math.sqrt(euler.length)))

    const indexed = queries.map((q, i) => ({
      l: first[q[0]]!,
      r: first[q[1]]!,
      idx: i
    }))

    indexed.sort((a, b) => {
      const ba = Math.floor(a.l / blockSize)
      const bb = Math.floor(b.l / blockSize)
      if (ba !== bb) return ba - bb
      return ba % 2 === 0 ? a.r - b.r : b.r - a.r
    })

    const inRange = new Array(this.n).fill(false)
    const toggle = (node: number): void => {
      if (inRange[node]) {
        remove(node)
        inRange[node] = false
      } else {
        add(node)
        inRange[node] = true
      }
    }

    let curL = 0
    let curR = -1

    for (const q of indexed) {
      while (curL > q.l) { curL--; toggle(euler[curL]!) }
      while (curR < q.r) { curR++; toggle(euler[curR]!) }
      while (curL < q.l) { toggle(euler[curL]!); curL++ }
      while (curR > q.r) { toggle(euler[curR]!); curR-- }
    }
  }
}
