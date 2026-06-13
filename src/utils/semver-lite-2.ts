export interface SemverVersion {
  major: number
  minor: number
  patch: number
  prerelease: string[]
  build: string[]
}

export class SemverLite2 {
  static parse(version: string): SemverVersion | null {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-.]+))?(?:\+([0-9A-Za-z-.]+))?$/)
    if (!match) return null
    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3]),
      prerelease: match[4] ? match[4].split('.') : [],
      build: match[5] ? match[5].split('.') : [],
    }
  }

  static stringify(v: SemverVersion): string {
    let result = `${v.major}.${v.minor}.${v.patch}`
    if (v.prerelease.length > 0) result += `-${v.prerelease.join('.')}`
    if (v.build.length > 0) result += `+${v.build.join('.')}`
    return result
  }

  static compare(a: SemverVersion, b: SemverVersion): number {
    if (a.major !== b.major) return a.major < b.major ? -1 : 1
    if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1
    if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1
    if (a.prerelease.length === 0 && b.prerelease.length > 0) return 1
    if (a.prerelease.length > 0 && b.prerelease.length === 0) return -1
    for (let i = 0; i < Math.max(a.prerelease.length, b.prerelease.length); i++) {
      const ap = a.prerelease[i]
      const bp = b.prerelease[i]
      if (ap === undefined) return -1
      if (bp === undefined) return 1
      const an = /^\d+$/.test(ap) ? parseInt(ap) : ap
      const bn = /^\d+$/.test(bp) ? parseInt(bp) : bp
      if (an < bn) return -1
      if (an > bn) return 1
    }
    return 0
  }

  static valid(version: string): boolean {
    return SemverLite2.parse(version) !== null
  }

  static inc(version: string, type: 'major' | 'minor' | 'patch'): string | null {
    const v = SemverLite2.parse(version)
    if (!v) return null
    if (type === 'major') { v.major++; v.minor = 0; v.patch = 0 }
    else if (type === 'minor') { v.minor++; v.patch = 0 }
    else v.patch++
    return SemverLite2.stringify(v)
  }

  static satisfiesRange(version: string, range: string): boolean {
    const v = SemverLite2.parse(version)
    if (!v) return false
    const rangeParts = range.split('||').map(r => r.trim())
    for (const part of rangeParts) {
      if (SemverLite2.satisfiesSingle(v, part)) return true
    }
    return false
  }

  private static satisfiesSingle(v: SemverVersion, range: string): boolean {
    range = range.trim()
    if (range === '*' || range === 'x') return true
    const caretMatch = range.match(/^\^(\d+)\.(\d+)\.(\d+)/)
    if (caretMatch) {
      const target = { major: parseInt(caretMatch[1]), minor: parseInt(caretMatch[2]), patch: parseInt(caretMatch[3]), prerelease: [], build: [] }
      if (v.major !== target.major) return false
      if (v.major === 0 && v.minor !== target.minor) return false
      return SemverLite2.compare(v, target) >= 0
    }
    const tildeMatch = range.match(/^~(\d+)\.(\d+)\.(\d+)/)
    if (tildeMatch) {
      const target = { major: parseInt(tildeMatch[1]), minor: parseInt(tildeMatch[2]), patch: parseInt(tildeMatch[3]), prerelease: [], build: [] }
      if (v.major !== target.major || v.minor !== target.minor) return false
      return SemverLite2.compare(v, target) >= 0
    }
    const opMatch = range.match(/^(>=|<=|>|<|=)?\s*(\d+)\.(\d+)\.(\d+)/)
    if (opMatch) {
      const op = opMatch[1] || '='
      const target = { major: parseInt(opMatch[2]), minor: parseInt(opMatch[3]), patch: parseInt(opMatch[4]), prerelease: [], build: [] }
      const cmp = SemverLite2.compare(v, target)
      if (op === '>=') return cmp >= 0
      if (op === '<=') return cmp <= 0
      if (op === '>') return cmp > 0
      if (op === '<') return cmp < 0
      return cmp === 0
    }
    return false
  }

  static major(version: string): number { return SemverLite2.parse(version)?.major ?? 0 }
  static minor(version: string): number { return SemverLite2.parse(version)?.minor ?? 0 }
  static patch(version: string): number { return SemverLite2.parse(version)?.patch ?? 0 }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): SemverLite2 { return new SemverLite2() }
  equals(other: unknown): boolean { return other instanceof SemverLite2 }
}
