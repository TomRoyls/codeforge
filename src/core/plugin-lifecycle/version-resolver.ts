import type { PluginDependency, PluginInfo, VersionConflict } from './types.js'
import { append } from '../../utils/map-helpers.js'

export class VersionResolver {
  private parseVersion(version: string): [number, number, number] {
    const cleaned = version.replace(/^v/, '')
    const parts = cleaned.split('.')
    const major = parseInt(parts[0] ?? '0', 10)
    const minor = parseInt(parts[1] ?? '0', 10)
    const patch = parseInt(parts[2] ?? '0', 10)
    return [major, minor, patch]
  }

  private compareVersions(a: string, b: string): number {
    const [aMaj, aMin, aPat] = this.parseVersion(a)
    const [bMaj, bMin, bPat] = this.parseVersion(b)
    if (aMaj !== bMaj) return aMaj - bMaj
    if (aMin !== bMin) return aMin - bMin
    return aPat - bPat
  }

  resolve(dependencies: PluginDependency[]): Map<string, string> {
    const resolved = new Map<string, string>()
    const grouped = new Map<string, PluginDependency[]>()

    for (const dep of dependencies) {
      append(grouped, dep.name, dep)
    }

    for (const [name, deps] of grouped) {
      const required = deps.filter(d => d.required)
      const optional = deps.filter(d => !d.required)

      if (required.length > 0) {
        const versions = required.map(d => d.versionRange)
        const best = this.findBestMatch(versions)
        if (best) {
          resolved.set(name, best)
        }
      } else if (optional.length > 0) {
        const versions = optional.map(d => d.versionRange)
        const best = this.findBestMatch(versions)
        if (best) {
          resolved.set(name, best)
        }
      }
    }

    return resolved
  }

  private findBestMatch(versions: string[]): string | null {
    if (versions.length === 0) return null
    const sorted = this.sortVersions([...versions])
    return sorted[sorted.length - 1] ?? null
  }

  checkConflicts(plugins: PluginInfo[]): VersionConflict[] {
    const conflicts: VersionConflict[] = []
    const depMap = new Map<string, { plugin: string; version: string }[]>()

    for (const plugin of plugins) {
      for (const [depName, depVersion] of plugin.dependencies) {
        append(depMap, depName, { plugin: plugin.name, version: depVersion })
      }
    }

    for (const [depName, entries] of depMap) {
      if (entries.length > 1) {
        const uniqueVersions = new Set(entries.map(e => e.version))
        if (uniqueVersions.size > 1) {
          for (let i = 0; i < entries.length; i++) {
            for (let j = i + 1; j < entries.length; j++) {
              const a = entries[i]!
              const b = entries[j]!
              if (a.version !== b.version) {
                conflicts.push({
                  pluginA: a.plugin,
                  pluginB: b.plugin,
                  dependency: depName,
                  versionA: a.version,
                  versionB: b.version,
                })
              }
            }
          }
        }
      }
    }

    return conflicts
  }

  isCompatible(version: string, range: string): boolean {
    const rangeOperators = ['>=', '<=', '>', '<', '~', '^']
    for (const op of rangeOperators) {
      if (range.startsWith(op)) {
        const rangeVersion = range.slice(op.length)
        const cmp = this.compareVersions(version, rangeVersion)
        switch (op) {
          case '>=': return cmp >= 0
          case '<=': return cmp <= 0
          case '>': return cmp > 0
          case '<': return cmp < 0
          case '~': {
            const [vMaj, vMin] = this.parseVersion(version)
            const [rMaj, rMin] = this.parseVersion(rangeVersion)
            return vMaj === rMaj && vMin === rMin && cmp >= 0
          }
          case '^': {
            const [vMaj] = this.parseVersion(version)
            const [rMaj] = this.parseVersion(rangeVersion)
            return vMaj === rMaj && cmp >= 0
          }
        }
      }
    }

    if (range.includes(' - ')) {
      const [low, high] = range.split(' - ')
      return this.compareVersions(version, low!) >= 0 && this.compareVersions(version, high!) <= 0
    }

    if (range.includes(' || ')) {
      return range.split(' || ').some(r => this.isCompatible(version, r.trim()))
    }

    if (range.includes(' ')) {
      const parts = range.split(' ').filter(p => p.length > 0)
      if (parts.length === 2) {
        const first = parts[0]!
        const second = parts[1]!
        if (first.startsWith('>=')) {
          const low = first.slice(2)
          if (second.startsWith('<')) {
            const high = second.slice(1)
            return this.compareVersions(version, low) >= 0 && this.compareVersions(version, high) < 0
          }
        }
      }
      return parts.every(p => this.isCompatible(version, p))
    }

    return this.compareVersions(version, range) === 0
  }

  getLatestCompatible(range: string, available: string[]): string | null {
    const sorted = this.sortVersions([...available])
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (this.isCompatible(sorted[i]!, range)) {
        return sorted[i]!
      }
    }
    return null
  }

  sortVersions(versions: string[]): string[] {
    return versions.sort((a, b) => this.compareVersions(a, b))
  }
}
