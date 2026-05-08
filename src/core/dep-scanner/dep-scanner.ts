import type {
  DependencyInfo,
  DependencyStats,
  ScanResult,
  ScannerConfig,
  VulnerabilityInfo,
} from './types.js'

import { DEFAULT_SCANNER_CONFIG } from './types.js'

export type {
  DependencyInfo,
  DependencyStats,
  ScanResult,
  ScannerConfig,
  VulnerabilityInfo,
}

export { DEFAULT_SCANNER_CONFIG }

type PackageJsonLike = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
}

interface VersionConflict {
  name: string
  versions: string[]
  sources: string[]
}

export class DependencyScanner {
  private allDeps: DependencyInfo[] = []
  private config: ScannerConfig
  private lastResult: ScanResult | null = null

  constructor(config?: Partial<ScannerConfig>) {
    this.config = { ...DEFAULT_SCANNER_CONFIG, ...config }
  }

  scan(pkg: PackageJsonLike): ScanResult {
    const deps: DependencyInfo[] = []
    const devDeps: DependencyInfo[] = []
    const peerDeps: DependencyInfo[] = []
    const optDeps: DependencyInfo[] = []

    if (pkg.dependencies) {
      for (const [name, version] of Object.entries(pkg.dependencies)) {
        deps.push({
          name,
          version,
          type: 'production',
          source: 'dependencies',
          licenses: this.extractLicenses(name),
        })
      }
    }

    if (this.config.includeDev && pkg.devDependencies) {
      for (const [name, version] of Object.entries(pkg.devDependencies)) {
        devDeps.push({
          name,
          version,
          type: 'dev',
          source: 'devDependencies',
          licenses: this.extractLicenses(name),
        })
      }
    }

    if (this.config.includePeer && pkg.peerDependencies) {
      for (const [name, version] of Object.entries(pkg.peerDependencies)) {
        peerDeps.push({
          name,
          version,
          type: 'peer',
          source: 'peerDependencies',
          licenses: this.extractLicenses(name),
        })
      }
    }

    if (pkg.optionalDependencies) {
      for (const [name, version] of Object.entries(pkg.optionalDependencies)) {
        optDeps.push({
          name,
          version,
          type: 'optional',
          source: 'optionalDependencies',
          licenses: this.extractLicenses(name),
        })
      }
    }

    this.allDeps = [...deps, ...devDeps, ...peerDeps, ...optDeps]

    const stats = this.computeStats(deps, devDeps, peerDeps, optDeps)
    const total = deps.length + devDeps.length + peerDeps.length + optDeps.length

    const result: ScanResult = {
      dependencies: deps,
      devDependencies: devDeps,
      peerDependencies: peerDeps,
      optionalDependencies: optDeps,
      total,
      stats,
    }

    this.lastResult = result
    return result
  }

  getDependencies(): DependencyInfo[] {
    return this.allDeps.filter((d) => d.type === 'production')
  }

  getDevDependencies(): DependencyInfo[] {
    return this.allDeps.filter((d) => d.type === 'dev')
  }

  getByName(name: string): DependencyInfo[] {
    return this.allDeps.filter((d) => d.name === name)
  }

  getByType(type: DependencyInfo['type']): DependencyInfo[] {
    return this.allDeps.filter((d) => d.type === type)
  }

  findConflicts(): VersionConflict[] {
    const versionMap = new Map<string, { versions: Set<string>; sources: Set<string> }>()

    for (const dep of this.allDeps) {
      const existing = versionMap.get(dep.name)
      if (existing) {
        existing.versions.add(dep.version)
        existing.sources.add(dep.source)
      } else {
        versionMap.set(dep.name, {
          versions: new Set([dep.version]),
          sources: new Set([dep.source]),
        })
      }
    }

    const conflicts: VersionConflict[] = []
    for (const [name, info] of versionMap) {
      if (info.versions.size > 1) {
        conflicts.push({
          name,
          versions: [...info.versions],
          sources: [...info.sources],
        })
      }
    }

    return conflicts
  }

  findUnused(sourceFiles: string[]): DependencyInfo[] {
    if (!this.config.checkUnused) {
      return []
    }

    const usedNames = new Set<string>()
    for (const file of sourceFiles) {
      for (const dep of this.allDeps) {
        if (file.includes(dep.name)) {
          usedNames.add(dep.name)
        }
      }
    }

    return this.allDeps.filter((d) => !usedNames.has(d.name))
  }

  getLicenseSummary(): Record<string, number> {
    const summary: Record<string, number> = {}
    for (const dep of this.allDeps) {
      for (const license of dep.licenses) {
        summary[license] = (summary[license] ?? 0) + 1
      }
    }
    return summary
  }

  getStatistics(): DependencyStats {
    if (this.lastResult) {
      return this.lastResult.stats
    }
    return this.computeStats([], [], [], [])
  }

  clear(): void {
    this.allDeps = []
    this.lastResult = null
  }

  private extractLicenses(name: string): string[] {
    const knownLicenses: Record<string, string[]> = {
      lodash: ['MIT'],
      express: ['MIT'],
      react: ['MIT'],
      typescript: ['Apache-2.0'],
      vitest: ['MIT'],
      eslint: ['MIT'],
      webpack: ['MIT'],
      jest: ['MIT'],
      mocha: ['MIT'],
      chai: ['MIT'],
      sinon: ['BSD-3-Clause'],
      next: ['MIT'],
      vue: ['MIT'],
      angular: ['MIT'],
      svelte: ['MIT'],
    }

    const licenses = knownLicenses[name]
    if (licenses) {
      return [...licenses]
    }

    if (name.startsWith('@types/')) {
      return ['MIT']
    }

    return ['Unknown']
  }

  private computeStats(
    deps: DependencyInfo[],
    devDeps: DependencyInfo[],
    peerDeps: DependencyInfo[],
    optDeps: DependencyInfo[],
  ): DependencyStats {
    const all = [...deps, ...devDeps, ...peerDeps, ...optDeps]
    const licenseCounts: Record<string, number> = {}

    for (const dep of all) {
      for (const license of dep.licenses) {
        licenseCounts[license] = (licenseCounts[license] ?? 0) + 1
      }
    }

    return {
      total: all.length,
      production: deps.length,
      dev: devDeps.length,
      peer: peerDeps.length,
      optional: optDeps.length,
      uniqueLicenses: Object.keys(licenseCounts).length,
      licenseCounts,
    }
  }
}
