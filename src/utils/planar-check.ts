export class PlanarCheck {
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

  isPlanar(): boolean {
    if (this.n <= 4) return true
    let edgeCount = 0
    for (let i = 0; i < this.n; i++) edgeCount += this.adj[i]!.length
    edgeCount /= 2
    if (edgeCount > 3 * this.n - 6) return false
    return this.tryCheck()
  }

  private tryCheck(): boolean {
    if (this.n <= 2) return true

    const hasK33 = (): boolean => {
      for (let a = 0; a < this.n; a++) {
        if (this.adj[a]!.length < 2) continue
        for (let b = a + 1; b < this.n; b++) {
          if (this.adj[b]!.length < 2) continue
          for (let c = b + 1; c < this.n; c++) {
            if (this.adj[c]!.length < 2) continue
            for (let x = 0; x < this.n; x++) {
              if (x === a || x === b || x === c) continue
              if (this.adj[x]!.length < 3) continue
              if (!this.hasEdge(x, a) || !this.hasEdge(x, b) || !this.hasEdge(x, c)) continue
              for (let y = x + 1; y < this.n; y++) {
                if (y === a || y === b || y === c) continue
                if (this.adj[y]!.length < 3) continue
                if (!this.hasEdge(y, a) || !this.hasEdge(y, b) || !this.hasEdge(y, c)) continue
                for (let z = y + 1; z < this.n; z++) {
                  if (z === a || z === b || z === c) continue
                  if (this.adj[z]!.length < 3) continue
                  if (!this.hasEdge(z, a) || !this.hasEdge(z, b) || !this.hasEdge(z, c)) continue
                  return true
                }
              }
            }
          }
        }
      }
      return false
    }

    const hasK5 = (): boolean => {
      for (let a = 0; a < this.n; a++) {
        for (let b = a + 1; b < this.n; b++) {
          for (let c = b + 1; c < this.n; c++) {
            for (let d = c + 1; d < this.n; d++) {
              for (let e = d + 1; e < this.n; e++) {
                const nodes = [a, b, c, d, e]
                let complete = true
                for (let i = 0; i < 5 && complete; i++) {
                  for (let j = i + 1; j < 5 && complete; j++) {
                    if (!this.hasEdge(nodes[i]!, nodes[j]!)) complete = false
                  }
                }
                if (complete) return true
              }
            }
          }
        }
      }
      return false
    }

    if (hasK5()) return false
    if (hasK33()) return false
    return true
  }

  private hasEdge(u: number, v: number): boolean {
    return this.adj[u]!.includes(v)
  }
}
