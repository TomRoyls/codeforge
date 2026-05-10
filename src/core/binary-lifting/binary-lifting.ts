import type { BinaryLiftingOptions, BinaryLiftingStats } from './types.js'

export class BinaryLifting {
  private readonly _n: number
  private readonly _log: number
  private readonly _up: number[][]
  private readonly _depth: number[]
  private readonly _root: number

  constructor(n: number, options: BinaryLiftingOptions = {}) {
    this._n = n
    this._root = options.root ?? 0

    if (n === 0) {
      this._log = 0
      this._up = []
      this._depth = []
      return
    }

    if (options.parents !== undefined) {
      this._log = Math.max(1, Math.ceil(Math.log2(n)))
      this._up = new Array<number[]>(this._log + 1)
      this._depth = new Array<number>(n).fill(0)

      for (let k = 0; k <= this._log; k++) {
        this._up[k] = new Array<number>(n).fill(-1)
      }

      const rootCandidates = new Set<number>()
      for (let i = 0; i < n; i++) {
        rootCandidates.add(i)
      }
      for (let i = 0; i < n; i++) {
        const p = options.parents[i]
        if (p !== undefined && p >= 0) {
          rootCandidates.delete(i)
        }
      }

      if (options.root === undefined) {
        const parentMap = new Map<number, number>()
        for (let i = 0; i < n; i++) {
          const p = options.parents[i]
          if (p !== undefined && p >= 0) {
            parentMap.set(i, p)
          }
        }
        const visited = new Set<number>()
        for (let i = 0; i < n; i++) {
          const path = new Set<number>()
          let cur: number = i
          while (cur >= 0 && !visited.has(cur)) {
            if (path.has(cur)) break
            path.add(cur)
            const p = parentMap.get(cur)
            cur = p !== undefined ? p : -1
          }
          if (!visited.has(cur) && cur >= 0) {
            rootCandidates.add(cur)
          }
          for (const node of path) {
            visited.add(node)
          }
        }
      }

      let actualRoot = this._root
      if (options.root === undefined) {
        for (const r of rootCandidates) {
          actualRoot = r
          break
        }
      }
      this._root = actualRoot

      for (let i = 0; i < n; i++) {
        const p = options.parents[i]
        this._up[0]![i] = (p !== undefined && p >= 0) ? p : -1
      }
      this._up[0]![this._root] = -1

      this._depth = new Array<number>(n).fill(0)
      const queue: number[] = [this._root]
      const seen = new Set<number>([this._root])

      while (queue.length > 0) {
        const node = queue.shift()!
        const p = this._up[0]![node]!
        this._depth[node] = p === -1 ? 0 : (this._depth[p]! + 1)
        for (let i = 0; i < n; i++) {
          if (this._up[0]![i] === node && !seen.has(i)) {
            seen.add(i)
            queue.push(i)
          }
        }
      }

      for (let k = 1; k <= this._log; k++) {
        for (let i = 0; i < n; i++) {
          const mid = this._up[k - 1]![i]!
          this._up[k]![i] = mid === -1 ? -1 : this._up[k - 1]![mid]!
        }
      }
    } else if (options.edges !== undefined) {
      const adj: number[][] = Array.from({ length: n }, () => [])
      for (const [u, v] of options.edges) {
        adj[u]!.push(v)
        adj[v]!.push(u)
      }

      this._log = Math.max(1, Math.ceil(Math.log2(n)))
      this._up = new Array<number[]>(this._log + 1)
      this._depth = new Array<number>(n).fill(0)

      for (let k = 0; k <= this._log; k++) {
        this._up[k] = new Array<number>(n).fill(-1)
      }

      const stack: number[] = [this._root]
      const visited = new Uint8Array(n)
      visited[this._root] = 1
      this._up[0]![this._root] = -1
      this._depth[this._root] = 0

      while (stack.length > 0) {
        const node = stack.pop()!
        const neighbors = adj[node]
        if (neighbors === undefined) continue
        for (const child of neighbors) {
          if (!visited[child]) {
            visited[child] = 1
            this._up[0]![child] = node
            this._depth[child] = this._depth[node]! + 1
            stack.push(child)
          }
        }
      }

      for (let k = 1; k <= this._log; k++) {
        for (let i = 0; i < n; i++) {
          const mid = this._up[k - 1]![i]!
          this._up[k]![i] = mid === -1 ? -1 : this._up[k - 1]![mid]!
        }
      }
    } else {
      this._log = Math.max(1, Math.ceil(Math.log2(n)))
      this._up = new Array<number[]>(this._log + 1)
      this._depth = new Array<number>(n).fill(0)

      for (let k = 0; k <= this._log; k++) {
        this._up[k] = new Array<number>(n).fill(-1)
      }
      this._up[0]![this._root] = -1
    }
  }

  kthAncestor(node: number, k: number): number {
    if (node < 0 || node >= this._n) return -1
    if (k < 0) return -1
    if (k === 0) return node
    if (k > this._depth[node]!) return -1

    let cur = node
    let remaining = k
    for (let i = this._log; i >= 0; i--) {
      if (remaining >= (1 << i)) {
        const next = this._up[i]![cur]!
        if (next === -1) return -1
        cur = next
        remaining -= 1 << i
      }
    }
    return cur
  }

  lca(u: number, v: number): number {
    if (u < 0 || u >= this._n || v < 0 || v >= this._n) return -1

    if (this._depth[u]! < this._depth[v]!) {
      const tmp = u
      u = v
      v = tmp
    }

    const diff = this._depth[u]! - this._depth[v]!
    u = this.kthAncestor(u, diff)!

    if (u === v) return u

    for (let i = this._log; i >= 0; i--) {
      const upU = this._up[i]![u]!
      const upV = this._up[i]![v]!
      if (upU !== upV) {
        u = upU
        v = upV
      }
    }

    return this._up[0]![u]!
  }

  distance(u: number, v: number): number {
    const a = this.lca(u, v)
    if (a === -1) return -1
    return this._depth[u]! + this._depth[v]! - 2 * this._depth[a]!
  }

  isAncestor(ancestor: number, descendant: number): boolean {
    if (ancestor < 0 || ancestor >= this._n || descendant < 0 || descendant >= this._n) return false
    if (ancestor === descendant) return true
    const k = this._depth[descendant]! - this._depth[ancestor]!
    if (k <= 0) return false
    return this.kthAncestor(descendant, k) === ancestor
  }

  depth(node: number): number {
    if (node < 0 || node >= this._n) return -1
    return this._depth[node]!
  }

  pathToRoot(node: number): number[] {
    if (node < 0 || node >= this._n) return []
    const path: number[] = []
    let cur = node
    while (cur !== -1) {
      path.push(cur)
      cur = this._up[0]![cur]!
    }
    return path
  }

  stats(): BinaryLiftingStats {
    let maxDepth = 0
    for (let i = 0; i < this._n; i++) {
      const d = this._depth[i]!
      if (d > maxDepth) maxDepth = d
    }
    return {
      nodeCount: this._n,
      maxDepth,
      logHeight: this._log,
      root: this._root,
    }
  }
}

export type { BinaryLiftingOptions, BinaryLiftingStats } from './types.js'
