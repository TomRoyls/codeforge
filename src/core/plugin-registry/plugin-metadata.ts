import type { PluginMetadata } from './types.js'

function parseSemver(version: string): [number, number, number] | null {
  const parts = version.split('.')
  if (parts.length !== 3) return null
  const major = parseInt(parts[0] ?? '', 10)
  const minor = parseInt(parts[1] ?? '', 10)
  const patch = parseInt(parts[2] ?? '', 10)
  if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)) return null
  return [major, minor, patch]
}

export class PluginMetadataHelper {
  validate(metadata: Partial<PluginMetadata>): string[] {
    const errors: string[] = []

    if (!metadata.name || metadata.name.trim().length === 0) {
      errors.push('Plugin name is required and must be non-empty.')
    }

    if (metadata.version !== undefined) {
      const semverPattern = /^\d+\.\d+\.\d+$/
      if (!semverPattern.test(metadata.version)) {
        errors.push(`Version "${metadata.version}" is not a valid semver (major.minor.patch).`)
      }
    } else {
      errors.push('Version is required.')
    }

    if (metadata.dependencies !== undefined) {
      for (const dep of metadata.dependencies) {
        if (!dep || dep.trim().length === 0) {
          errors.push('Dependency name must be non-empty.')
        }
      }
    }

    return errors
  }

  compareVersions(a: string, b: string): -1 | 0 | 1 {
    const pa = parseSemver(a)
    const pb = parseSemver(b)
    if (!pa && !pb) return 0
    if (!pa) return -1
    if (!pb) return 1

    for (let i = 0; i < 3; i++) {
      const va = pa[i] ?? 0
      const vb = pb[i] ?? 0
      if (va < vb) return -1
      if (va > vb) return 1
    }
    return 0
  }

  satisfiesVersion(required: string, actual: string): boolean {
    const reqParts = parseSemver(required)
    const actParts = parseSemver(actual)
    if (!reqParts || !actParts) return false
    return (
      (reqParts[0] ?? 0) === (actParts[0] ?? 0) &&
      (reqParts[1] ?? 0) === (actParts[1] ?? 0) &&
      (reqParts[2] ?? 0) === (actParts[2] ?? 0)
    )
  }

  extractDeps(metadata: PluginMetadata): string[] {
    return [...metadata.dependencies]
  }

  createFromObject(obj: Partial<PluginMetadata>): PluginMetadata {
    return {
      name: obj.name ?? '',
      version: obj.version ?? '1.0.0',
      description: obj.description ?? '',
      author: obj.author ?? '',
      dependencies: obj.dependencies ?? [],
      tags: obj.tags ?? [],
      homepage: obj.homepage,
      license: obj.license ?? 'MIT',
    }
  }
}
