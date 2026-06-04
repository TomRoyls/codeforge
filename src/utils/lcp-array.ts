export class LCPArray {
  static build(sa: number[], s: string): number[] {
    const n = s.length
    const rank = new Array(n).fill(0)
    for (let i = 0; i < n; i++) rank[sa[i]!] = i
    const lcp = new Array(n - 1).fill(0)
    let k = 0
    for (let i = 0; i < n; i++) {
      if (rank[i]! === 0) { k = 0; continue }
      const j = sa[rank[i]! - 1]!
      while (i + k < n && j + k < n && s[i + k] === s[j + k]) k++
      lcp[rank[i]! - 1] = k
      if (k > 0) k--
    }
    return lcp
  }

  static longestCommonPrefix(_sa: number[], lcp: number[]): number {
    if (lcp.length === 0) return 0
    return Math.max(...lcp)
  }
}
