export class EditDistance {
  compute(s1: string, s2: string): number {
    const m = s1.length, n = s2.length
    if (m === 0) return n
    if (n === 0) return m
    const prev = new Array(n + 1).fill(0).map((_, i) => i)
    const curr = new Array(n + 1).fill(0)
    for (let i = 1; i <= m; i++) {
      curr[0] = i
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
        curr[j] = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost)
      }
      for (let j = 0; j <= n; j++) prev[j] = curr[j]
    }
    return prev[n]!
  }

  operations(s1: string, s2: string): number {
    return this.compute(s1, s2)
  }

  isWithinDistance(s1: string, s2: string, maxDist: number): boolean {
    return this.compute(s1, s2) <= maxDist
  }

  similarity(s1: string, s2: string): number {
    const maxLen = Math.max(s1.length, s2.length)
    if (maxLen === 0) return 1
    return 1 - this.compute(s1, s2) / maxLen
  }

  get name(): string { return 'EditDistance' }
  toString(): string { return JSON.stringify({ name: this.name }) }
  toJSON(): Record<string, string> { return { name: this.name } }
  clone(): EditDistance { return new EditDistance() }
  equals(other: unknown): boolean { return other instanceof EditDistance }
  toArray(): string[] { return ['edit-distance'] }
}
