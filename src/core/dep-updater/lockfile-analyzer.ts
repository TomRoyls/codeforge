import type { LockfileEntry, LockfileAnalysis } from './types.js'

export class LockfileAnalyzer {
  parseLockfile(content: string): LockfileEntry[] {
    const entries: LockfileEntry[] = []
    const lines = content.split('\n')
    let currentEntry: Partial<LockfileEntry> | null = null
    let inDependencies = false

    for (const line of lines) {
      const trimmed = line.trim()

      if (trimmed === '' || trimmed.startsWith('#')) continue

      if (!line.startsWith(' ') && !line.startsWith('\t')) {
        if (currentEntry && currentEntry.name && currentEntry.version) {
          entries.push({
            name: currentEntry.name,
            version: currentEntry.version,
            resolved: currentEntry.resolved ?? '',
            integrity: currentEntry.integrity ?? '',
            dependencies: currentEntry.dependencies ?? new Map(),
          })
        }

        inDependencies = false
        const nameMatch = trimmed.match(/^"?(@?[^@"']+)(?:@"?([^"]*)"?)?\s*:/)
        if (nameMatch) {
          currentEntry = {
            name: nameMatch[1],
            dependencies: new Map(),
          }
          if (nameMatch[2]) {
            currentEntry.version = nameMatch[2]
          }
        } else {
          currentEntry = null
        }
        continue
      }

      if (!currentEntry) continue

      if (trimmed === 'dependencies:' || trimmed === 'dependencies :') {
        inDependencies = true
        continue
      }

      if (inDependencies) {
        const depMatch = trimmed.match(/^(@?[\w./-]+)\s+"?([^"]*)"?\s*,?$/)
        if (depMatch && currentEntry.dependencies) {
          const depName = depMatch[1]
          const depVersion = depMatch[2]
          if (depName !== undefined && depVersion !== undefined) {
            currentEntry.dependencies.set(depName, depVersion)
          }
        }
        continue
      }

      const propMatch = trimmed.match(/^(\w+)\s+"?([^"]*)"?\s*,?$/)
      if (propMatch) {
        const key = propMatch[1]
        const value = propMatch[2]
        if (key === 'version') {
          currentEntry.version = value ?? ''
        } else if (key === 'resolved') {
          currentEntry.resolved = value ?? ''
        } else if (key === 'integrity') {
          currentEntry.integrity = value ?? ''
        }
        continue
      }
    }

    if (currentEntry && currentEntry.name && currentEntry.version) {
      entries.push({
        name: currentEntry.name,
        version: currentEntry.version,
        resolved: currentEntry.resolved ?? '',
        integrity: currentEntry.integrity ?? '',
        dependencies: currentEntry.dependencies ?? new Map(),
      })
    }

    return entries
  }

  analyze(entries: LockfileEntry[]): LockfileAnalysis {
    const duplicates = this.findDuplicates(entries)
    const directDeps = this.getDirectDependencies(entries)
    const transitive = this.getTransitiveCount(entries)

    return {
      totalPackages: entries.length,
      directDependencies: directDeps.length,
      transitiveDependencies: transitive,
      duplicates,
      outdated: [],
      size: entries.length,
    }
  }

  findDuplicates(entries: LockfileEntry[]): Map<string, string[]> {
    const versionMap = new Map<string, Set<string>>()
    for (const entry of entries) {
      const versions = versionMap.get(entry.name)
      if (versions) {
        versions.add(entry.version)
      } else {
        versionMap.set(entry.name, new Set([entry.version]))
      }
    }

    const duplicates = new Map<string, string[]>()
    for (const [name, versions] of versionMap) {
      if (versions.size > 1) {
        duplicates.set(name, Array.from(versions))
      }
    }
    return duplicates
  }

  getTransitiveCount(entries: LockfileEntry[]): number {
    const directNames = new Set<string>()
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i]!
      if (e.dependencies.size === 0 || this.hasShallowDeps(e, entries)) {
        directNames.add(e.name)
      }
    }
    return entries.length - Math.min(directNames.size, entries.length)
  }

  private hasShallowDeps(_entry: LockfileEntry, _allEntries: LockfileEntry[]): boolean {
    return false
  }

  getDirectDependencies(entries: LockfileEntry[]): LockfileEntry[] {
    const allDepNames = new Set<string>()
    for (const entry of entries) {
      for (const depName of entry.dependencies.keys()) {
        allDepNames.add(depName)
      }
    }
    return entries.filter((entry) => !allDepNames.has(entry.name))
  }
}
