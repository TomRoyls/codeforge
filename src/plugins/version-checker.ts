import type {
  PluginManifest,
  SemVer,
  VersionCheckResult,
  VersionConstraint,
} from './version-types.js'

const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9._-]+))?$/

export function parseSemVer(version: string): SemVer | null {
  const m = version.trim().match(SEMVER_RE)
  if (!m) return null
  const major = Number(m[1])
  const minor = Number(m[2])
  const patch = Number(m[3])
  if (!Number.isFinite(major) || !Number.isFinite(minor) || !Number.isFinite(patch)) return null
  const result: SemVer = { major, minor, patch }
  if (m[4] !== undefined) result.prerelease = m[4]
  return result
}

export function formatSemVer(ver: SemVer): string {
  let s = `${ver.major}.${ver.minor}.${ver.patch}`
  if (ver.prerelease !== undefined) s += `-${ver.prerelease}`
  return s
}

export function compareSemVer(a: SemVer, b: SemVer): -1 | 0 | 1 {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1
  const aPre = a.prerelease ?? ''
  const bPre = b.prerelease ?? ''
  if (aPre === '' && bPre === '') return 0
  if (aPre === '') return 1
  if (bPre === '') return -1
  if (aPre < bPre) return -1
  if (aPre > bPre) return 1
  return 0
}

export function parseConstraint(range: string): VersionConstraint {
  const r = range.trim()
  if (r === '*' || r === '' || r === 'latest') {
    return { range: '*' }
  }

  const caretMatch = r.match(/^(\^)(\d+\.\d+\.\d+(?:-[a-zA-Z0-9._-]+)?)$/)
  if (caretMatch) {
    const ver = parseSemVer(caretMatch[2]!)
    return { min: ver ?? undefined, range: r }
  }

  const tildeMatch = r.match(/^(~)(\d+\.\d+\.\d+(?:-[a-zA-Z0-9._-]+)?)$/)
  if (tildeMatch) {
    const ver = parseSemVer(tildeMatch[2]!)
    return { min: ver ?? undefined, range: r }
  }

  const rangeMatch = r.match(/^>=\s*(\d+\.\d+\.\d+(?:-[a-zA-Z0-9._-]+)?)\s+<\s*(\d+\.\d+\.\d+(?:-[a-zA-Z0-9._-]+)?)$/)
  if (rangeMatch) {
    return {
      min: parseSemVer(rangeMatch[1]!) ?? undefined,
      max: parseSemVer(rangeMatch[2]!) ?? undefined,
      range: r,
    }
  }

  const gteMatch = r.match(/^>=\s*(\d+\.\d+\.\d+(?:-[a-zA-Z0-9._-]+)?)$/)
  if (gteMatch) {
    const ver = parseSemVer(gteMatch[1]!)
    return { min: ver ?? undefined, range: r }
  }

  const exactVer = parseSemVer(r)
  if (exactVer) {
    return { min: exactVer, max: exactVer, range: r }
  }

  return { range: r }
}

export function satisfiesConstraint(version: SemVer, constraint: VersionConstraint): boolean {
  const { range, min, max } = constraint

  if (range === '*' || range === '' || range === 'latest') return true

  if (range.startsWith('^')) {
    if (!min) return false
    if (compareSemVer(version, min) < 0) return false
    return version.major === min.major
  }

  if (range.startsWith('~')) {
    if (!min) return false
    if (compareSemVer(version, min) < 0) return false
    return version.major === min.major && version.minor === min.minor
  }

  if (range.startsWith('>=') && range.includes('<')) {
    if (!min || !max) return false
    return compareSemVer(version, min) >= 0 && compareSemVer(version, max) < 0
  }

  if (range.startsWith('>=')) {
    if (!min) return false
    return compareSemVer(version, min) >= 0
  }

  if (min && max && compareSemVer(min, max) === 0) {
    return compareSemVer(version, min) === 0
  }

  if (min && max) {
    return compareSemVer(version, min) >= 0 && compareSemVer(version, max) < 0
  }

  if (min) {
    return compareSemVer(version, min) >= 0
  }

  return false
}

export function checkPluginCompatibility(
  manifest: PluginManifest,
  codeforgeVersion: SemVer,
): VersionCheckResult {
  const constraint = parseConstraint(manifest.codeforgeVersion)
  const pluginVersion = parseSemVer(manifest.version)
  const compatible = satisfiesConstraint(codeforgeVersion, constraint)

  const ver = pluginVersion ?? { major: 0, minor: 0, patch: 0 }
  const message = compatible
    ? `Plugin "${manifest.name}" v${manifest.version} is compatible with CodeForge ${formatSemVer(codeforgeVersion)}`
    : `Plugin "${manifest.name}" v${manifest.version} requires CodeForge ${manifest.codeforgeVersion}, but current is ${formatSemVer(codeforgeVersion)}`

  return { compatible, pluginVersion: ver, constraint, message }
}

export function validateManifest(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Manifest must be an object'] }
  }

  const d = data as Record<string, unknown>

  if (typeof d.name !== 'string' || d.name.trim() === '') {
    errors.push('name must be a non-empty string')
  }

  if (typeof d.version !== 'string' || parseSemVer(d.version) === null) {
    errors.push('version must be a valid semver string')
  }

  if (typeof d.codeforgeVersion !== 'string' || d.codeforgeVersion.trim() === '') {
    errors.push('codeforgeVersion must be a non-empty string')
  }

  if (typeof d.description !== 'string' || d.description.trim() === '') {
    errors.push('description must be a non-empty string')
  }

  if (typeof d.main !== 'string' || d.main.trim() === '') {
    errors.push('main must be a non-empty string')
  }

  if (typeof d.dependencies !== 'object' || d.dependencies === null) {
    errors.push('dependencies must be an object')
  } else {
    const deps = d.dependencies as Record<string, unknown>
    for (const [key, val] of Object.entries(deps)) {
      if (typeof val !== 'string') {
        errors.push(`dependency "${key}" must have a string version constraint`)
        break
      }
    }
  }

  return { valid: errors.length === 0, errors }
}
