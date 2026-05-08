import type { SemVer, BumpType, VersionRange } from './types.js'

const SEMVER_REGEX = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.]+))?(?:\+([a-zA-Z0-9.]+))?$/

export class VersionManager {
  parse(version: string): SemVer {
    const match = version.match(SEMVER_REGEX)
    if (!match) {
      throw new Error(`Invalid semver: ${version}`)
    }
    return {
      major: parseInt(match[1]!, 10),
      minor: parseInt(match[2]!, 10),
      patch: parseInt(match[3]!, 10),
      prerelease: match[4] !== undefined ? match[4].split('.') : [],
      build: match[5] !== undefined ? match[5].split('.') : [],
    }
  }

  format(ver: SemVer): string {
    let result = `${ver.major}.${ver.minor}.${ver.patch}`
    if (ver.prerelease.length > 0) {
      result += `-${ver.prerelease.join('.')}`
    }
    if (ver.build.length > 0) {
      result += `+${ver.build.join('.')}`
    }
    return result
  }

  compare(a: SemVer, b: SemVer): -1 | 0 | 1 {
    if (a.major !== b.major) return a.major > b.major ? 1 : -1
    if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1
    if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1
    return this.comparePrerelease(a.prerelease, b.prerelease)
  }

  private comparePrerelease(a: string[], b: string[]): -1 | 0 | 1 {
    if (a.length === 0 && b.length === 0) return 0
    if (a.length === 0) return 1
    if (b.length === 0) return -1

    const maxLen = Math.max(a.length, b.length)
    for (let i = 0; i < maxLen; i++) {
      const aVal = a[i]
      const bVal = b[i]
      if (aVal === undefined && bVal !== undefined) return -1
      if (aVal !== undefined && bVal === undefined) return 1
      if (aVal === undefined && bVal === undefined) continue

      const aNum = parseInt(aVal!, 10)
      const bNum = parseInt(bVal!, 10)
      const aIsNum = !isNaN(aNum) && String(aNum) === aVal
      const bIsNum = !isNaN(bNum) && String(bNum) === bVal

      if (aIsNum && bIsNum) {
        if (aNum !== bNum) return aNum > bNum ? 1 : -1
      } else if (aIsNum) {
        return -1
      } else if (bIsNum) {
        return 1
      } else {
        if (aVal !== bVal) return aVal! > bVal! ? 1 : -1
      }
    }
    return 0
  }

  equals(a: SemVer, b: SemVer): boolean {
    return this.compare(a, b) === 0
  }

  gt(a: SemVer, b: SemVer): boolean {
    return this.compare(a, b) === 1
  }

  gte(a: SemVer, b: SemVer): boolean {
    return this.compare(a, b) >= 0
  }

  lt(a: SemVer, b: SemVer): boolean {
    return this.compare(a, b) === -1
  }

  lte(a: SemVer, b: SemVer): boolean {
    return this.compare(a, b) <= 0
  }

  bump(version: SemVer, type: BumpType): SemVer {
    switch (type) {
      case 'major':
        return { major: version.major + 1, minor: 0, patch: 0, prerelease: [], build: [] }
      case 'minor':
        return { major: version.major, minor: version.minor + 1, patch: 0, prerelease: [], build: [] }
      case 'patch':
        return { major: version.major, minor: version.minor, patch: version.patch + 1, prerelease: [], build: [] }
      case 'premajor':
        return { major: version.major + 1, minor: 0, patch: 0, prerelease: ['rc', '0'], build: [] }
      case 'preminor':
        return { major: version.major, minor: version.minor + 1, patch: 0, prerelease: ['rc', '0'], build: [] }
      case 'prepatch':
        return { major: version.major, minor: version.minor, patch: version.patch + 1, prerelease: ['rc', '0'], build: [] }
      case 'prerelease': {
        if (version.prerelease.length === 0) {
          return { major: version.major, minor: version.minor, patch: version.patch + 1, prerelease: ['rc', '0'], build: [] }
        }
        const lastPart = version.prerelease[version.prerelease.length - 1]!
        const lastNum = parseInt(lastPart, 10)
        if (!isNaN(lastNum) && String(lastNum) === lastPart) {
          const newPre = [...version.prerelease.slice(0, -1), String(lastNum + 1)]
          return { major: version.major, minor: version.minor, patch: version.patch, prerelease: newPre, build: [] }
        }
        return { major: version.major, minor: version.minor, patch: version.patch, prerelease: [...version.prerelease, '0'], build: [] }
      }
    }
  }

  satisfies(version: SemVer, range: VersionRange): boolean {
    if (range.min !== null) {
      const cmp = this.compare(version, range.min)
      if (range.minInclusive) {
        if (cmp < 0) return false
      } else {
        if (cmp <= 0) return false
      }
    }
    if (range.max !== null) {
      const cmp = this.compare(version, range.max)
      if (range.maxInclusive) {
        if (cmp > 0) return false
      } else {
        if (cmp >= 0) return false
      }
    }
    return true
  }

  parseRange(range: string): VersionRange {
    const trimmed = range.trim()

    if (trimmed === '*' || trimmed === '') {
      return { min: null, max: null, minInclusive: false, maxInclusive: false }
    }

    if (trimmed.startsWith('^')) {
      const ver = this.parse(trimmed.slice(1))
      if (ver.major > 0) {
        return {
          min: ver,
          max: { major: ver.major + 1, minor: 0, patch: 0, prerelease: [], build: [] },
          minInclusive: true,
          maxInclusive: false,
        }
      }
      if (ver.minor > 0) {
        return {
          min: ver,
          max: { major: ver.major, minor: ver.minor + 1, patch: 0, prerelease: [], build: [] },
          minInclusive: true,
          maxInclusive: false,
        }
      }
      return {
        min: ver,
        max: { major: ver.major, minor: ver.minor, patch: ver.patch + 1, prerelease: [], build: [] },
        minInclusive: true,
        maxInclusive: false,
      }
    }

    if (trimmed.startsWith('~')) {
      const ver = this.parse(trimmed.slice(1))
      return {
        min: ver,
        max: { major: ver.major, minor: ver.minor + 1, patch: 0, prerelease: [], build: [] },
        minInclusive: true,
        maxInclusive: false,
      }
    }

    if (trimmed.includes('x') || trimmed.includes('X')) {
      const parts = trimmed.split('.')
      const major = parseInt(parts[0]!, 10)
      if (parts.length === 1 || parts[1] === 'x' || parts[1] === 'X') {
        return {
          min: { major, minor: 0, patch: 0, prerelease: [], build: [] },
          max: { major: major + 1, minor: 0, patch: 0, prerelease: [], build: [] },
          minInclusive: true,
          maxInclusive: false,
        }
      }
      const minor = parseInt(parts[1]!, 10)
      return {
        min: { major, minor, patch: 0, prerelease: [], build: [] },
        max: { major, minor: minor + 1, patch: 0, prerelease: [], build: [] },
        minInclusive: true,
        maxInclusive: false,
      }
    }

    const tokens = trimmed.split(/\s+/).filter(Boolean)
    if (tokens.length === 1) {
      const token = tokens[0]!
      if (token.startsWith('>=')) {
        const ver = this.parse(token.slice(2))
        return { min: ver, max: null, minInclusive: true, maxInclusive: false }
      }
      if (token.startsWith('<=')) {
        const ver = this.parse(token.slice(2))
        return { min: null, max: ver, minInclusive: false, maxInclusive: true }
      }
      if (token.startsWith('>')) {
        const ver = this.parse(token.slice(1))
        return { min: ver, max: null, minInclusive: false, maxInclusive: false }
      }
      if (token.startsWith('<')) {
        const ver = this.parse(token.slice(1))
        return { min: null, max: ver, minInclusive: false, maxInclusive: false }
      }
      if (token.startsWith('=')) {
        const ver = this.parse(token.slice(1))
        return { min: ver, max: ver, minInclusive: true, maxInclusive: true }
      }
      const ver = this.parse(token)
      return { min: ver, max: ver, minInclusive: true, maxInclusive: true }
    }

    let resultMin: SemVer | null = null
    let resultMax: SemVer | null = null
    let minInclusive = false
    let maxInclusive = false

    for (const token of tokens) {
      if (token.startsWith('>=')) {
        resultMin = this.parse(token.slice(2))
        minInclusive = true
      } else if (token.startsWith('<=')) {
        resultMax = this.parse(token.slice(2))
        maxInclusive = true
      } else if (token.startsWith('>')) {
        resultMin = this.parse(token.slice(1))
        minInclusive = false
      } else if (token.startsWith('<')) {
        resultMax = this.parse(token.slice(1))
        maxInclusive = false
      }
    }

    return { min: resultMin, max: resultMax, minInclusive, maxInclusive }
  }

  minVersion(range: VersionRange): SemVer | undefined {
    return range.min ?? undefined
  }

  maxSatisfying(versions: SemVer[], range: VersionRange): SemVer | undefined {
    const satisfying = versions.filter((v) => this.satisfies(v, range))
    if (satisfying.length === 0) return undefined
    return satisfying.reduce((a, b) => (this.gt(a, b) ? a : b))
  }

  minSatisfying(versions: SemVer[], range: VersionRange): SemVer | undefined {
    const satisfying = versions.filter((v) => this.satisfies(v, range))
    if (satisfying.length === 0) return undefined
    return satisfying.reduce((a, b) => (this.lt(a, b) ? a : b))
  }

  sort(versions: SemVer[]): SemVer[] {
    return [...versions].sort((a, b) => this.compare(a, b))
  }

  rsort(versions: SemVer[]): SemVer[] {
    return [...versions].sort((a, b) => this.compare(b, a))
  }

  isPrerelease(ver: SemVer): boolean {
    return ver.prerelease.length > 0
  }

  isStable(ver: SemVer): boolean {
    return ver.prerelease.length === 0 && ver.major > 0
  }

  diff(a: SemVer, b: SemVer): 'major' | 'minor' | 'patch' | 'prerelease' | 'build' | null {
    if (a.major !== b.major) return 'major'
    if (a.minor !== b.minor) return 'minor'
    if (a.patch !== b.patch) return 'patch'
    if (a.prerelease.length !== b.prerelease.length) return 'prerelease'
    for (let i = 0; i < a.prerelease.length; i++) {
      if (a.prerelease[i] !== b.prerelease[i]) return 'prerelease'
    }
    if (a.build.length !== b.build.length) return 'build'
    for (let i = 0; i < a.build.length; i++) {
      if (a.build[i] !== b.build[i]) return 'build'
    }
    return null
  }

  coerce(version: string): SemVer | undefined {
    const cleaned = version.replace(/^[v=]+/, '').trim()
    const match = cleaned.match(/(\d+)\.(\d+)\.(\d+)/)
    if (match) {
      return {
        major: parseInt(match[1]!, 10),
        minor: parseInt(match[2]!, 10),
        patch: parseInt(match[3]!, 10),
        prerelease: [],
        build: [],
      }
    }
    const partialMatch = cleaned.match(/(\d+)(?:\.(\d+))?/)
    if (partialMatch) {
      const minor = partialMatch[2] !== undefined ? parseInt(partialMatch[2], 10) : 0
      return {
        major: parseInt(partialMatch[1]!, 10),
        minor,
        patch: 0,
        prerelease: [],
        build: [],
      }
    }
    return undefined
  }
}
