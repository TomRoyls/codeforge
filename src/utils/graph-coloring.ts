export class GraphColoring {
  static greedyColor(adj: number[][]): number[] {
    const n = adj.length
    if (n === 0) return []
    const result = new Array(n).fill(-1)
    result[0] = 0
    const available = new Array(n).fill(false)
    for (let u = 1; u < n; u++) {
      for (const v of adj[u]!) {
        if (result[v] !== -1) {
          available[result[v]!] = true
        }
      }
      let color: number
      for (color = 0; color < n; color++) {
        if (!available[color]) break
      }
      result[u] = color
      for (const v of adj[u]!) {
        if (result[v] !== -1) {
          available[result[v]!] = false
        }
      }
    }
    return result
  }

  static chromaticNumber(adj: number[][]): number {
    if (adj.length === 0) return 0
    const colors = GraphColoring.greedyColor(adj)
    return Math.max(...colors) + 1
  }

  static isBipartite(adj: number[][]): boolean {
    const n = adj.length
    const color = new Array(n).fill(-1)
    for (let start = 0; start < n; start++) {
      if (color[start] !== -1) continue
      color[start] = 0
      const queue = [start]
      while (queue.length > 0) {
        const u = queue.shift()!
        for (const v of adj[u]!) {
          if (color[v] === -1) {
            color[v] = 1 - color[u]!
            queue.push(v)
          } else if (color[v] === color[u]) {
            return false
          }
        }
      }
    }
    return true
  }

  static isValidColoring(adj: number[][], colors: number[]): boolean {
    for (let u = 0; u < adj.length; u++) {
      for (const v of adj[u]!) {
        if (colors[u] === colors[v]) return false
      }
    }
    return true
  }
}
