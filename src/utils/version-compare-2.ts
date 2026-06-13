export class VersionCompare2 {
  static compare(a: string, b: string): number {
    const partsA = VersionCompare2.parse(a)
    const partsB = VersionCompare2.parse(b)
    const maxLen = Math.max(partsA.length, partsB.length)
    for (let i = 0; i < maxLen; i++) {
      const va = partsA[i] ?? 0
      const vb = partsB[i] ?? 0
      if (va < vb) return -1
      if (va > vb) return 1
    }
    return 0
  }

  static parse(version: string): number[] {
    return version.split('.').map(p => {
      const num = parseInt(p.replace(/[^0-9]/g, ''))
      return isNaN(num) ? 0 : num
    })
  }

  static equals(a: string, b: string): boolean { return VersionCompare2.compare(a, b) === 0 }
  static greaterThan(a: string, b: string): boolean { return VersionCompare2.compare(a, b) > 0 }
  static lessThan(a: string, b: string): boolean { return VersionCompare2.compare(a, b) < 0 }
  static gte(a: string, b: string): boolean { return VersionCompare2.compare(a, b) >= 0 }
  static lte(a: string, b: string): boolean { return VersionCompare2.compare(a, b) <= 0 }

  static sort(versions: string[], ascending = true): string[] {
    const sorted = [...versions].sort((a, b) => VersionCompare2.compare(a, b))
    return ascending ? sorted : sorted.reverse()
  }

  static max(versions: string[]): string {
    return versions.reduce((max, v) => VersionCompare2.greaterThan(v, max) ? v : max)
  }

  static min(versions: string[]): string {
    return versions.reduce((min, v) => VersionCompare2.lessThan(v, min) ? v : min)
  }

  static satisfies(version: string, range: string): boolean {
    const trimmed = range.trim()
    if (trimmed === '*') return true
    if (trimmed.startsWith('>=')) return VersionCompare2.gte(version, trimmed.substring(2))
    if (trimmed.startsWith('<=')) return VersionCompare2.lte(version, trimmed.substring(2))
    if (trimmed.startsWith('>')) return VersionCompare2.greaterThan(version, trimmed.substring(1))
    if (trimmed.startsWith('<')) return VersionCompare2.lessThan(version, trimmed.substring(1))
    if (trimmed.startsWith('=')) return VersionCompare2.equals(version, trimmed.substring(1))
    return VersionCompare2.equals(version, trimmed)
  }

  static bumpMajor(version: string): string {
    const parts = VersionCompare2.parse(version)
    parts[0]++
    return `${parts[0]}.0.0`
  }

  static bumpMinor(version: string): string {
    const parts = VersionCompare2.parse(version)
    parts[1] = (parts[1] ?? 0) + 1
    return `${parts[0]}.${parts[1]}.0`
  }

  static bumpPatch(version: string): string {
    const parts = VersionCompare2.parse(version)
    parts[2] = (parts[2] ?? 0) + 1
    return `${parts[0]}.${parts[1] ?? 0}.${parts[2]}`
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): VersionCompare2 { return new VersionCompare2() }
  equals(other: unknown): boolean { return other instanceof VersionCompare2 }
}
