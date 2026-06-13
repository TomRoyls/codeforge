export class KendallTau {
  compute(a: number[], b: number[]): number {
    const n = Math.min(a.length, b.length)
    if (n < 2) return 0
    let concordant = 0, discordant = 0
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = a[i]! - a[j]!
        const dy = b[i]! - b[j]!
        const prod = dx * dy
        if (prod > 0) concordant++
        else if (prod < 0) discordant++
      }
    }
    const denom = concordant + discordant
    return denom === 0 ? 0 : (concordant - discordant) / denom
  }

  distance(a: number[], b: number[]): number {
    const n = Math.min(a.length, b.length)
    let swaps = 0
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = a[i]! - a[j]!
        const dy = b[i]! - b[j]!
        if (dx * dy < 0) swaps++
      }
    }
    return swaps
  }

  get name(): string { return 'KendallTau' }

  toString(): string { return JSON.stringify({ name: this.name }) }
  toJSON(): Record<string, string> { return { name: this.name } }

  clone(): KendallTau { return new KendallTau() }

  equals(other: unknown): boolean { return other instanceof KendallTau }

  toArray(): string[] { return ['kendall-tau'] }
}
