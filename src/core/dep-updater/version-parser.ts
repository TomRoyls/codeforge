import type { PackageVersion, VersionRange } from './types.js'

const SEMVER_REGEX = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([\w.]+))?(?:\+([\w.]+))?$/

export class VersionParser {
  parse(version: string): PackageVersion {
    const cleaned = version.replace(/^v/, '').replace(/^=/, '')
    const match = cleaned.match(SEMVER_REGEX)
    if (!match) {
      throw new Error(`Invalid version: ${version}`)
    }
    const major = parseInt(match[1] ?? '0', 10)
    const minor = parseInt(match[2] ?? '0', 10)
    const patch = parseInt(match[3] ?? '0', 10)
    const prerelease = match[4] ? match[4].split('.') : []
    const build = match[5] ? match[5].split('.') : []
    return {
      major,
      minor,
      patch,
      prerelease,
      build,
      raw: `${major}.${minor}.${patch}${prerelease.length > 0 ? `-${prerelease.join('.')}` : ''}${build.length > 0 ? `+${build.join('.')}` : ''}`,
    }
  }

  format(version: PackageVersion): string {
    let result = `${version.major}.${version.minor}.${version.patch}`
    if (version.prerelease.length > 0) {
      result += `-${version.prerelease.join('.')}`
    }
    if (version.build.length > 0) {
      result += `+${version.build.join('.')}`
    }
    return result
  }

  compare(a: PackageVersion, b: PackageVersion): number {
    if (a.major !== b.major) return a.major > b.major ? 1 : -1
    if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1
    if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1
    return this.comparePrerelease(a.prerelease, b.prerelease)
  }

  private comparePrerelease(a: string[], b: string[]): number {
    if (a.length === 0 && b.length === 0) return 0
    if (a.length === 0) return 1
    if (b.length === 0) return -1
    const maxLen = Math.max(a.length, b.length)
    for (let i = 0; i < maxLen; i++) {
      const aVal = a[i]
      const bVal = b[i]
      if (aVal === undefined && bVal !== undefined) return -1
      if (aVal !== undefined && bVal === undefined) return 1
      if (aVal === undefined && bVal === undefined) return 0
      const aNum = parseInt(aVal!, 10)
      const bNum = parseInt(bVal!, 10)
      const aIsNum = !isNaN(aNum)
      const bIsNum = !isNaN(bNum)
      if (aIsNum && bIsNum) {
        if (aNum !== bNum) return aNum > bNum ? 1 : -1
      } else if (aIsNum) {
        return -1
      } else if (bIsNum) {
        return 1
      } else {
        const cmp = aVal!.localeCompare(bVal!)
        if (cmp !== 0) return cmp > 0 ? 1 : -1
      }
    }
    return 0
  }

  satisfies(version: PackageVersion, range: string): boolean {
    const trimmed = range.trim()
    if (trimmed === '*' || trimmed === '') return true
    const orParts = trimmed.split('||').map((s) => s.trim())
    for (const part of orParts) {
      if (this.satisfiesRange(version, part)) return true
    }
    return false
  }

  private satisfiesRange(version: PackageVersion, range: string): boolean {
    const trimmed = range.trim()
    if (trimmed === '*') return true
    if (trimmed.startsWith('^')) {
      return this.satisfiesCaret(version, trimmed.slice(1))
    }
    if (trimmed.startsWith('~')) {
      return this.satisfiesTilde(version, trimmed.slice(1))
    }
    if (trimmed.startsWith('>=')) {
      const target = this.parse(trimmed.slice(2))
      return this.compare(version, target) >= 0
    }
    if (trimmed.startsWith('>')) {
      const target = this.parse(trimmed.slice(1))
      return this.compare(version, target) > 0
    }
    if (trimmed.startsWith('<=')) {
      const target = this.parse(trimmed.slice(2))
      return this.compare(version, target) <= 0
    }
    if (trimmed.startsWith('<')) {
      const target = this.parse(trimmed.slice(1))
      return this.compare(version, target) < 0
    }
    if (trimmed.endsWith('.x')) {
      const base = trimmed.slice(0, -2)
      const parts = base.split('.')
      if (parts.length === 1) {
        return version.major === parseInt(parts[0]!, 10)
      }
      if (parts.length === 2) {
        return version.major === parseInt(parts[0]!, 10) && version.minor === parseInt(parts[1]!, 10)
      }
    }
    try {
      const target = this.parse(trimmed)
      return this.compare(version, target) === 0
    } catch {
      return false
    }
  }

  private satisfiesCaret(version: PackageVersion, rangeStr: string): boolean {
    const target = this.parse(rangeStr)
    if (target.major === 0) {
      if (target.minor === 0) {
        return version.major === 0 && version.minor === 0 && version.patch === target.patch && version.prerelease.length === 0
      }
      return version.major === 0 && version.minor === target.minor && version.patch >= target.patch && this.compare(version, target) >= 0 && version.prerelease.length === 0
    }
    return version.major === target.major && this.compare(version, target) >= 0 && version.prerelease.length === 0
  }

  private satisfiesTilde(version: PackageVersion, rangeStr: string): boolean {
    const target = this.parse(rangeStr)
    return version.major === target.major && version.minor === target.minor && version.patch >= target.patch && this.compare(version, target) >= 0 && version.prerelease.length === 0
  }

  parseRange(range: string): VersionRange {
    const trimmed = range.trim()
    if (trimmed === '*' || trimmed === '') {
      return { raw: trimmed, minVersion: null, maxVersion: null, includesMin: false, includesMax: false }
    }
    if (trimmed.startsWith('>=')) {
      const min = this.parse(trimmed.slice(2).trim())
      return { raw: trimmed, minVersion: min, maxVersion: null, includesMin: true, includesMax: false }
    }
    if (trimmed.startsWith('>')) {
      const min = this.parse(trimmed.slice(1).trim())
      return { raw: trimmed, minVersion: min, maxVersion: null, includesMin: false, includesMax: false }
    }
    if (trimmed.startsWith('<=')) {
      const max = this.parse(trimmed.slice(2).trim())
      return { raw: trimmed, minVersion: null, maxVersion: max, includesMin: false, includesMax: true }
    }
    if (trimmed.startsWith('<')) {
      const max = this.parse(trimmed.slice(1).trim())
      return { raw: trimmed, minVersion: null, maxVersion: max, includesMin: false, includesMax: false }
    }
    if (trimmed.startsWith('^') || trimmed.startsWith('~')) {
      const base = this.parse(trimmed.slice(1))
      return { raw: trimmed, minVersion: base, maxVersion: null, includesMin: true, includesMax: false }
    }
    const exact = this.parse(trimmed)
    return { raw: trimmed, minVersion: exact, maxVersion: exact, includesMin: true, includesMax: true }
  }

  getMajor(version: string): number {
    return this.parse(version).major
  }

  getMinor(version: string): number {
    return this.parse(version).minor
  }

  getPatch(version: string): number {
    return this.parse(version).patch
  }

  isPrerelease(version: string): boolean {
    return this.parse(version).prerelease.length > 0
  }

  increment(version: PackageVersion, type: 'major' | 'minor' | 'patch'): PackageVersion {
    switch (type) {
      case 'major':
        return { major: version.major + 1, minor: 0, patch: 0, prerelease: [], build: [], raw: `${version.major + 1}.0.0` }
      case 'minor':
        return { major: version.major, minor: version.minor + 1, patch: 0, prerelease: [], build: [], raw: `${version.major}.${version.minor + 1}.0` }
      case 'patch':
        return { major: version.major, minor: version.minor, patch: version.patch + 1, prerelease: [], build: [], raw: `${version.major}.${version.minor}.${version.patch + 1}` }
    }
  }
}
