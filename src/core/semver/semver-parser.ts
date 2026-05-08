import type { SemVer, VersionBump } from './types.js'

const SEMVER_REGEX = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([\w.]+))?(?:\+([\w.]+))?$/

export class SemVerParser {
  parse(version: string): SemVer {
    const cleaned = this.clean(version)
    const match = cleaned.match(SEMVER_REGEX)
    if (!match) {
      throw new Error(`Invalid semver: ${version}`)
    }

    const major = parseInt(match[1]!, 10)
    const minor = match[2] !== undefined ? parseInt(match[2], 10) : 0
    const patch = match[3] !== undefined ? parseInt(match[3], 10) : 0
    const prerelease = match[4] !== undefined ? match[4].split('.') : []
    const buildMetadata = match[5] !== undefined ? match[5].split('.') : []

    return {
      major,
      minor,
      patch,
      prerelease,
      buildMetadata,
      raw: version,
    }
  }

  format(semver: SemVer): string {
    let result = `${semver.major}.${semver.minor}.${semver.patch}`
    if (semver.prerelease.length > 0) {
      result += `-${semver.prerelease.join('.')}`
    }
    if (semver.buildMetadata.length > 0) {
      result += `+${semver.buildMetadata.join('.')}`
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

  satisfies(version: SemVer, range: string): boolean {
    const orParts = range.split('||').map((s) => s.trim())
    return orParts.some((part) => this.satisfiesRange(version, part))
  }

  private satisfiesRange(version: SemVer, range: string): boolean {
    const parts = range.split(/\s+/).filter(Boolean)

    if (parts.length === 0) return true

    for (const part of parts) {
      if (!this.satisfiesComparator(version, part)) {
        return false
      }
    }
    return true
  }

  private satisfiesComparator(version: SemVer, comparator: string): boolean {
    const cleaned = comparator.trim()

    if (cleaned === '*' || cleaned === '') return true

    if (cleaned.startsWith('>=')) {
      const v = this.parse(cleaned.slice(2))
      return this.gte(version, v)
    }
    if (cleaned.startsWith('<=')) {
      const v = this.parse(cleaned.slice(2))
      return this.lte(version, v)
    }
    if (cleaned.startsWith('>')) {
      const v = this.parse(cleaned.slice(1))
      return this.gt(version, v)
    }
    if (cleaned.startsWith('<')) {
      const v = this.parse(cleaned.slice(1))
      return this.lt(version, v)
    }
    if (cleaned.startsWith('=')) {
      const v = this.parse(cleaned.slice(1))
      return this.equals(version, v)
    }
    if (cleaned.startsWith('~')) {
      return this.satisfiesTilde(version, cleaned.slice(1))
    }
    if (cleaned.startsWith('^')) {
      return this.satisfiesCaret(version, cleaned.slice(1))
    }

    if (cleaned.includes('x') || cleaned.includes('X') || cleaned.includes('*')) {
      return this.satisfiesXRange(version, cleaned)
    }

    const v = this.parse(cleaned)
    return this.equals(version, v)
  }

  private satisfiesTilde(version: SemVer, range: string): boolean {
    const parts = range.split('.')
    const major = parseInt(parts[0]!, 10)
    const minor = parts.length > 1 ? parseInt(parts[1]!, 10) : undefined

    if (version.major !== major) return false
    if (minor !== undefined && version.minor !== minor) return false
    if (minor !== undefined && version.minor === minor) return true
    return true
  }

  private satisfiesCaret(version: SemVer, range: string): boolean {
    const parts = range.split('.')
    const major = parseInt(parts[0]!, 10)
    const minor = parts.length > 1 ? parseInt(parts[1]!, 10) : undefined
    const patch = parts.length > 2 ? parseInt(parts[2]!, 10) : undefined

    if (version.major !== major) return false

    if (major > 0) {
      if (minor !== undefined && version.minor < minor) return false
      if (minor !== undefined && version.minor === minor && patch !== undefined && version.patch < patch) return false
      return true
    }

    if (minor !== undefined && minor > 0) {
      if (version.minor !== minor) return false
      if (patch !== undefined && version.patch < patch) return false
      return true
    }

    if (patch !== undefined && version.patch < patch) return false
    return true
  }

  private satisfiesXRange(version: SemVer, range: string): boolean {
    const parts = range.split('.')

    const majorPart = parts[0]!
    if (majorPart !== 'x' && majorPart !== 'X' && majorPart !== '*') {
      const major = parseInt(majorPart, 10)
      if (version.major !== major) return false
    }

    const minorPart = parts.length > 1 ? parts[1]! : undefined
    if (minorPart !== undefined && minorPart !== 'x' && minorPart !== 'X' && minorPart !== '*') {
      const minor = parseInt(minorPart, 10)
      if (version.minor !== minor) return false
    }

    return true
  }

  sort(versions: SemVer[]): SemVer[] {
    return [...versions].sort((a, b) => this.compare(a, b))
  }

  isValid(version: string): boolean {
    const cleaned = this.clean(version)
    return SEMVER_REGEX.test(cleaned)
  }

  clean(version: string): string {
    return version.replace(/^[v=]+/, '').trim()
  }

  increment(semver: SemVer, bump: VersionBump, prereleasePrefix?: string): SemVer {
    const prefix = prereleasePrefix ?? 'rc'
    switch (bump) {
      case 'major':
        return this.createSemVer(semver.major + 1, 0, 0)
      case 'minor':
        return this.createSemVer(semver.major, semver.minor + 1, 0)
      case 'patch':
        return this.createSemVer(semver.major, semver.minor, semver.patch + 1)
      case 'prerelease': {
        if (semver.prerelease.length === 0) {
          return this.createSemVer(semver.major, semver.minor, semver.patch + 1, [prefix, '0'])
        }
        const lastPart = semver.prerelease[semver.prerelease.length - 1]!
        const lastNum = parseInt(lastPart, 10)
        if (!isNaN(lastNum) && String(lastNum) === lastPart) {
          const newPre = [...semver.prerelease.slice(0, -1), String(lastNum + 1)]
          return this.createSemVer(semver.major, semver.minor, semver.patch, newPre)
        }
        return this.createSemVer(semver.major, semver.minor, semver.patch, [...semver.prerelease, '0'])
      }
      case 'none':
        return { ...semver }
    }
  }

  private createSemVer(
    major: number,
    minor: number,
    patch: number,
    prerelease: string[] = [],
    buildMetadata: string[] = [],
  ): SemVer {
    const sv: SemVer = { major, minor, patch, prerelease, buildMetadata, raw: '' }
    sv.raw = this.format(sv)
    return sv
  }
}
