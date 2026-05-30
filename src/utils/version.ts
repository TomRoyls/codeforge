export interface VersionParts {
  major: number
  minor: number
  patch: number
  prerelease: string[]
  build: string[]
}

const VERSION_REGEX = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([a-zA-Z0-9.]+))?(?:\+([a-zA-Z0-9.]+))?$/

export function parseVersion(version: string): VersionParts | null {
  const match = version.trim().match(VERSION_REGEX)
  if (!match) return null

  const major = parseInt(match[1]!, 10)
  const minor = match[2] !== undefined ? parseInt(match[2], 10) : 0
  const patch = match[3] !== undefined ? parseInt(match[3], 10) : 0
  const prerelease = match[4] !== undefined ? match[4].split('.') : []
  const build = match[5] !== undefined ? match[5].split('.') : []

  return { major, minor, patch, prerelease, build }
}

export function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a)
  const pb = parseVersion(b)
  if (!pa && !pb) return 0
  if (!pa) return -1
  if (!pb) return 1

  if (pa.major !== pb.major) return pa.major - pb.major
  if (pa.minor !== pb.minor) return pa.minor - pb.minor
  if (pa.patch !== pb.patch) return pa.patch - pb.patch

  return comparePrerelease(pa.prerelease, pb.prerelease)
}

function comparePrerelease(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0
  if (a.length === 0) return 1
  if (b.length === 0) return -1

  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const partA = a[i]!
    const partB = b[i]!
    const numA = parseInt(partA, 10)
    const numB = parseInt(partB, 10)
    const aIsNum = !isNaN(numA)
    const bIsNum = !isNaN(numB)

    if (aIsNum && bIsNum) {
      if (numA !== numB) return numA - numB
    } else if (aIsNum) {
      return -1
    } else if (bIsNum) {
      return 1
    } else {
      const cmp = partA.localeCompare(partB)
      if (cmp !== 0) return cmp
    }
  }

  return a.length - b.length
}

export function satisfiesRange(version: string, range: string): boolean {
  const trimmed = range.trim()

  if (trimmed.startsWith('>=')) {
    return compareVersions(version, trimmed.slice(2).trim()) >= 0
  }
  if (trimmed.startsWith('<=')) {
    return compareVersions(version, trimmed.slice(2).trim()) <= 0
  }
  if (trimmed.startsWith('>')) {
    return compareVersions(version, trimmed.slice(1).trim()) > 0
  }
  if (trimmed.startsWith('<')) {
    return compareVersions(version, trimmed.slice(1).trim()) < 0
  }
  if (trimmed.startsWith('~')) {
    const base = trimmed.slice(1).trim()
    const pb = parseVersion(base)
    if (!pb) return false
    return (
      compareVersions(version, base) >= 0 &&
      parseVersion(version)!.major === pb.major &&
      parseVersion(version)!.minor === pb.minor
    )
  }
  if (trimmed.startsWith('^')) {
    const base = trimmed.slice(1).trim()
    const pb = parseVersion(base)
    if (!pb) return false
    return (
      compareVersions(version, base) >= 0 &&
      parseVersion(version)!.major === pb.major
    )
  }

  return compareVersions(version, trimmed) === 0
}

export function formatVersion(parts: VersionParts): string {
  let result = `${parts.major}.${parts.minor}.${parts.patch}`
  if (parts.prerelease.length > 0) {
    result += `-${parts.prerelease.join('.')}`
  }
  if (parts.build.length > 0) {
    result += `+${parts.build.join('.')}`
  }
  return result
}
