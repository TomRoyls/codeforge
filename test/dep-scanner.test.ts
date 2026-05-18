import { describe, it, expect } from 'vitest'
import {
  DependencyScanner,
  DEFAULT_SCANNER_CONFIG,
} from '../src/core/dep-scanner/dep-scanner.js'
import type {
  DependencyInfo,
  DependencyStats,
  ScanResult,
  ScannerConfig,
  VulnerabilityInfo,
} from '../src/core/dep-scanner/types.js'

// ─── Constructor ───────────────────────────────────────────────────
describe('DependencyScanner constructor', () => {
  it('creates instance with no arguments', () => {
    const scanner = new DependencyScanner()
    expect(scanner).toBeInstanceOf(DependencyScanner)
  })

  it('creates instance with empty config object', () => {
    const scanner = new DependencyScanner({})
    expect(scanner).toBeInstanceOf(DependencyScanner)
  })

  it('creates instance with partial config overriding defaults', () => {
    const scanner = new DependencyScanner({ includeDev: false })
    const result = scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
    })
    expect(result.devDependencies).toHaveLength(0)
    expect(result.dependencies).toHaveLength(1)
  })

  it('creates instance with all config options overridden', () => {
    const scanner = new DependencyScanner({
      includeDev: false,
      includePeer: false,
      checkUnused: false,
      maxDepth: 5,
    })
    const result = scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
      peerDependencies: { react: '>=18' },
    })
    expect(result.devDependencies).toHaveLength(0)
    expect(result.peerDependencies).toHaveLength(0)
    expect(result.dependencies).toHaveLength(1)
  })
})

// ─── DEFAULT_SCANNER_CONFIG ────────────────────────────────────────
describe('DEFAULT_SCANNER_CONFIG', () => {
  it('has correct default values', () => {
    expect(DEFAULT_SCANNER_CONFIG).toEqual({
      includeDev: true,
      includePeer: true,
      checkUnused: true,
      maxDepth: 10,
    })
  })

  it('includeDev defaults to true', () => {
    expect(DEFAULT_SCANNER_CONFIG.includeDev).toBe(true)
  })

  it('includePeer defaults to true', () => {
    expect(DEFAULT_SCANNER_CONFIG.includePeer).toBe(true)
  })

  it('checkUnused defaults to true', () => {
    expect(DEFAULT_SCANNER_CONFIG.checkUnused).toBe(true)
  })

  it('maxDepth defaults to 10', () => {
    expect(DEFAULT_SCANNER_CONFIG.maxDepth).toBe(10)
  })
})

// ─── scan – production dependencies ────────────────────────────────
describe('scan – production dependencies', () => {
  it('scans production dependencies from pkg.dependencies', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      dependencies: { lodash: '^4.17.21' },
    })
    expect(result.dependencies).toHaveLength(1)
    expect(result.dependencies[0]).toEqual({
      name: 'lodash',
      version: '^4.17.21',
      type: 'production',
      source: 'dependencies',
      licenses: ['MIT'],
    })
  })

  it('scans multiple production dependencies', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      dependencies: {
        lodash: '^4.17.21',
        express: '^4.18.0',
        react: '^18.2.0',
      },
    })
    expect(result.dependencies).toHaveLength(3)
  })

  it('handles empty dependencies object', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: {} })
    expect(result.dependencies).toHaveLength(0)
  })

  it('returns correct total for production deps only', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      dependencies: { lodash: '^4.0.0', express: '^4.0.0' },
    })
    expect(result.total).toBe(2)
  })

  it('sets source field to "dependencies"', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    expect(result.dependencies[0]?.source).toBe('dependencies')
  })
})

// ─── scan – devDependencies ────────────────────────────────────────
describe('scan – devDependencies', () => {
  it('scans devDependencies when includeDev is true', () => {
    const scanner = new DependencyScanner({ includeDev: true })
    const result = scanner.scan({
      devDependencies: { vitest: '^1.0.0', eslint: '^8.0.0' },
    })
    expect(result.devDependencies).toHaveLength(2)
  })

  it('skips devDependencies when includeDev is false', () => {
    const scanner = new DependencyScanner({ includeDev: false })
    const result = scanner.scan({
      devDependencies: { vitest: '^1.0.0' },
    })
    expect(result.devDependencies).toHaveLength(0)
  })

  it('sets type to "dev" for dev dependencies', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      devDependencies: { vitest: '^1.0.0' },
    })
    expect(result.devDependencies[0]?.type).toBe('dev')
  })

  it('sets source to "devDependencies"', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      devDependencies: { vitest: '^1.0.0' },
    })
    expect(result.devDependencies[0]?.source).toBe('devDependencies')
  })

  it('handles empty devDependencies', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ devDependencies: {} })
    expect(result.devDependencies).toHaveLength(0)
  })
})

// ─── scan – peerDependencies ───────────────────────────────────────
describe('scan – peerDependencies', () => {
  it('scans peerDependencies when includePeer is true', () => {
    const scanner = new DependencyScanner({ includePeer: true })
    const result = scanner.scan({
      peerDependencies: { react: '>=18', vue: '>=3' },
    })
    expect(result.peerDependencies).toHaveLength(2)
  })

  it('skips peerDependencies when includePeer is false', () => {
    const scanner = new DependencyScanner({ includePeer: false })
    const result = scanner.scan({
      peerDependencies: { react: '>=18' },
    })
    expect(result.peerDependencies).toHaveLength(0)
  })

  it('sets type to "peer" for peer dependencies', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      peerDependencies: { react: '>=18' },
    })
    expect(result.peerDependencies[0]?.type).toBe('peer')
  })

  it('sets source to "peerDependencies"', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      peerDependencies: { react: '>=18' },
    })
    expect(result.peerDependencies[0]?.source).toBe('peerDependencies')
  })

  it('handles empty peerDependencies', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ peerDependencies: {} })
    expect(result.peerDependencies).toHaveLength(0)
  })
})

// ─── scan – optionalDependencies ───────────────────────────────────
describe('scan – optionalDependencies', () => {
  it('scans optionalDependencies', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      optionalDependencies: { fsevents: '^2.3.0' },
    })
    expect(result.optionalDependencies).toHaveLength(1)
  })

  it('sets type to "optional" for optional dependencies', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      optionalDependencies: { fsevents: '^2.3.0' },
    })
    expect(result.optionalDependencies[0]?.type).toBe('optional')
  })

  it('sets source to "optionalDependencies"', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      optionalDependencies: { fsevents: '^2.3.0' },
    })
    expect(result.optionalDependencies[0]?.source).toBe('optionalDependencies')
  })

  it('handles empty optionalDependencies', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ optionalDependencies: {} })
    expect(result.optionalDependencies).toHaveLength(0)
  })
})

// ─── scan – combined result ────────────────────────────────────────
describe('scan – combined result', () => {
  it('computes correct total across all dep types', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
      peerDependencies: { react: '>=18' },
      optionalDependencies: { fsevents: '^2.3.0' },
    })
    expect(result.total).toBe(4)
  })

  it('total is 0 for empty package', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({})
    expect(result.total).toBe(0)
  })

  it('returns a ScanResult with all expected fields', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    expect(result).toHaveProperty('dependencies')
    expect(result).toHaveProperty('devDependencies')
    expect(result).toHaveProperty('peerDependencies')
    expect(result).toHaveProperty('optionalDependencies')
    expect(result).toHaveProperty('total')
    expect(result).toHaveProperty('stats')
  })

  it('caches last result for getStatistics', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
    })
    const stats = scanner.getStatistics()
    expect(stats.total).toBe(2)
    expect(stats.production).toBe(1)
    expect(stats.dev).toBe(1)
  })

  it('overwrites last result on subsequent scan', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    scanner.scan({
      dependencies: { express: '^4.18.0', react: '^18.0.0' },
    })
    const deps = scanner.getDependencies()
    expect(deps).toHaveLength(2)
    expect(deps.map((d) => d.name)).toContain('express')
    expect(deps.map((d) => d.name)).toContain('react')
  })

  it('scan result with no config override includes all types', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
      peerDependencies: { react: '>=18' },
      optionalDependencies: { fsevents: '^2.3.0' },
    })
    expect(result.dependencies).toHaveLength(1)
    expect(result.devDependencies).toHaveLength(1)
    expect(result.peerDependencies).toHaveLength(1)
    expect(result.optionalDependencies).toHaveLength(1)
  })
})

// ─── scan – empty package.json ─────────────────────────────────────
describe('scan – empty package', () => {
  it('handles completely empty package', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({})
    expect(result.dependencies).toHaveLength(0)
    expect(result.devDependencies).toHaveLength(0)
    expect(result.peerDependencies).toHaveLength(0)
    expect(result.optionalDependencies).toHaveLength(0)
    expect(result.total).toBe(0)
  })

  it('handles package with only undefined fields', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      dependencies: undefined,
      devDependencies: undefined,
    })
    expect(result.total).toBe(0)
  })
})

// ─── getDependencies ───────────────────────────────────────────────
describe('getDependencies', () => {
  it('returns only production dependencies', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
    })
    const deps = scanner.getDependencies()
    expect(deps).toHaveLength(1)
    expect(deps[0]?.name).toBe('lodash')
  })

  it('returns empty array when no production deps', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      devDependencies: { vitest: '^1.0.0' },
    })
    expect(scanner.getDependencies()).toEqual([])
  })

  it('returns empty array before scan', () => {
    const scanner = new DependencyScanner()
    expect(scanner.getDependencies()).toEqual([])
  })

  it('all returned items have type "production"', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0', express: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
    })
    const deps = scanner.getDependencies()
    for (const dep of deps) {
      expect(dep.type).toBe('production')
    }
  })
})

// ─── getDevDependencies ────────────────────────────────────────────
describe('getDevDependencies', () => {
  it('returns only dev dependencies', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0', eslint: '^8.0.0' },
    })
    const devDeps = scanner.getDevDependencies()
    expect(devDeps).toHaveLength(2)
    expect(devDeps[0]?.name).toBe('vitest')
  })

  it('returns empty array when no dev deps', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    expect(scanner.getDevDependencies()).toEqual([])
  })

  it('returns empty array before scan', () => {
    const scanner = new DependencyScanner()
    expect(scanner.getDevDependencies()).toEqual([])
  })

  it('all returned items have type "dev"', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      devDependencies: { vitest: '^1.0.0' },
    })
    const deps = scanner.getDevDependencies()
    for (const dep of deps) {
      expect(dep.type).toBe('dev')
    }
  })

  it('includes dev deps when includeDev is true (default)', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      devDependencies: { vitest: '^1.0.0' },
    })
    expect(scanner.getDevDependencies()).toHaveLength(1)
  })
})

// ─── getByName ─────────────────────────────────────────────────────
describe('getByName', () => {
  it('finds dependency by exact name', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    const found = scanner.getByName('lodash')
    expect(found).toHaveLength(1)
    expect(found[0]?.name).toBe('lodash')
  })

  it('returns empty array for non-existent name', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    expect(scanner.getByName('nonexistent')).toEqual([])
  })

  it('finds same dep across multiple dep types', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { lodash: '^3.0.0' },
    })
    const found = scanner.getByName('lodash')
    expect(found).toHaveLength(2)
  })

  it('returns empty array before scan', () => {
    const scanner = new DependencyScanner()
    expect(scanner.getByName('lodash')).toEqual([])
  })

  it('is case-sensitive', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    expect(scanner.getByName('Lodash')).toEqual([])
    expect(scanner.getByName('LODASH')).toEqual([])
  })
})

// ─── getByType ─────────────────────────────────────────────────────
describe('getByType', () => {
  it('returns production dependencies when type is "production"', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
    })
    const deps = scanner.getByType('production')
    expect(deps).toHaveLength(1)
    expect(deps[0]?.name).toBe('lodash')
  })

  it('returns dev dependencies when type is "dev"', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
    })
    const deps = scanner.getByType('dev')
    expect(deps).toHaveLength(1)
    expect(deps[0]?.name).toBe('vitest')
  })

  it('returns peer dependencies when type is "peer"', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      peerDependencies: { react: '>=18' },
    })
    const deps = scanner.getByType('peer')
    expect(deps).toHaveLength(1)
    expect(deps[0]?.name).toBe('react')
  })

  it('returns optional dependencies when type is "optional"', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      optionalDependencies: { fsevents: '^2.3.0' },
    })
    const deps = scanner.getByType('optional')
    expect(deps).toHaveLength(1)
    expect(deps[0]?.name).toBe('fsevents')
  })

  it('returns empty array before scan', () => {
    const scanner = new DependencyScanner()
    expect(scanner.getByType('production')).toEqual([])
  })

  it('returns empty array for type with no deps', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    expect(scanner.getByType('peer')).toEqual([])
  })
})

// ─── findConflicts ─────────────────────────────────────────────────
describe('findConflicts', () => {
  it('returns empty array when no conflicts', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
    })
    expect(scanner.findConflicts()).toEqual([])
  })

  it('detects conflict when same dep appears with different versions', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { lodash: '^3.0.0' },
    })
    const conflicts = scanner.findConflicts()
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]?.name).toBe('lodash')
    expect(conflicts[0]?.versions).toContain('^4.0.0')
    expect(conflicts[0]?.versions).toContain('^3.0.0')
  })

  it('includes sources in conflict info', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { lodash: '^3.0.0' },
    })
    const conflicts = scanner.findConflicts()
    expect(conflicts[0]?.sources).toContain('dependencies')
    expect(conflicts[0]?.sources).toContain('devDependencies')
  })

  it('does not report conflict when same version', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { lodash: '^4.0.0' },
    })
    expect(scanner.findConflicts()).toEqual([])
  })

  it('detects multiple conflicts', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0', react: '^18.0.0' },
      devDependencies: { lodash: '^3.0.0', react: '^17.0.0' },
    })
    expect(scanner.findConflicts()).toHaveLength(2)
  })

  it('returns empty array before scan', () => {
    const scanner = new DependencyScanner()
    expect(scanner.findConflicts()).toEqual([])
  })

  it('detects conflict across three sources', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { lodash: '^3.0.0' },
      peerDependencies: { lodash: '^2.0.0' },
    })
    const conflicts = scanner.findConflicts()
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]?.versions).toHaveLength(3)
  })

  it('detects conflict between production and optional', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      optionalDependencies: { lodash: '^3.0.0' },
    })
    const conflicts = scanner.findConflicts()
    expect(conflicts).toHaveLength(1)
  })
})

// ─── findUnused ────────────────────────────────────────────────────
describe('findUnused', () => {
  it('returns all deps when no source files provided', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    const unused = scanner.findUnused([])
    expect(unused).toHaveLength(1)
    expect(unused[0]?.name).toBe('lodash')
  })

  it('marks dep as used when source file contains dep name', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    const unused = scanner.findUnused(["import lodash from 'lodash'"])
    expect(unused).toHaveLength(0)
  })

  it('detects unused dep not in any source file', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0', express: '^4.0.0' },
    })
    const unused = scanner.findUnused(["import lodash from 'lodash'"])
    expect(unused).toHaveLength(1)
    expect(unused[0]?.name).toBe('express')
  })

  it('returns empty array when checkUnused is false', () => {
    const scanner = new DependencyScanner({ checkUnused: false })
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    expect(scanner.findUnused(['some file'])).toEqual([])
  })

  it('checks all dep types for usage', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
    })
    const unused = scanner.findUnused(["import lodash from 'lodash'"])
    expect(unused).toHaveLength(1)
    expect(unused[0]?.name).toBe('vitest')
  })

  it('handles substring matching in source files', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    const unused = scanner.findUnused(['lodash is great'])
    expect(unused).toHaveLength(0)
  })

  it('returns all deps as unused when no source files match', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0', express: '^4.0.0' },
    })
    const unused = scanner.findUnused(['no matches here'])
    expect(unused).toHaveLength(2)
  })
})

// ─── getLicenseSummary ─────────────────────────────────────────────
describe('getLicenseSummary', () => {
  it('returns empty object before scan', () => {
    const scanner = new DependencyScanner()
    expect(scanner.getLicenseSummary()).toEqual({})
  })

  it('counts licenses correctly for known packages', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0', express: '^4.0.0' },
    })
    const summary = scanner.getLicenseSummary()
    expect(summary['MIT']).toBe(2)
  })

  it('counts Unknown for unknown packages', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { 'my-custom-pkg': '^1.0.0' },
    })
    const summary = scanner.getLicenseSummary()
    expect(summary['Unknown']).toBe(1)
  })

  it('handles mixed known and unknown packages', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0', 'my-pkg': '^1.0.0' },
    })
    const summary = scanner.getLicenseSummary()
    expect(summary['MIT']).toBe(1)
    expect(summary['Unknown']).toBe(1)
  })

  it('counts licenses across all dep types', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
    })
    const summary = scanner.getLicenseSummary()
    expect(summary['MIT']).toBe(2)
  })

  it('counts different licenses separately', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0', sinon: '^14.0.0' },
    })
    const summary = scanner.getLicenseSummary()
    expect(summary['MIT']).toBe(1)
    expect(summary['BSD-3-Clause']).toBe(1)
  })
})

// ─── getStatistics ─────────────────────────────────────────────────
describe('getStatistics', () => {
  it('returns empty stats before scan', () => {
    const scanner = new DependencyScanner()
    const stats = scanner.getStatistics()
    expect(stats.total).toBe(0)
    expect(stats.production).toBe(0)
    expect(stats.dev).toBe(0)
    expect(stats.peer).toBe(0)
    expect(stats.optional).toBe(0)
    expect(stats.uniqueLicenses).toBe(0)
    expect(stats.licenseCounts).toEqual({})
  })

  it('returns correct stats after scan', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
      peerDependencies: { react: '>=18' },
      optionalDependencies: { fsevents: '^2.3.0' },
    })
    const stats = scanner.getStatistics()
    expect(stats.total).toBe(4)
    expect(stats.production).toBe(1)
    expect(stats.dev).toBe(1)
    expect(stats.peer).toBe(1)
    expect(stats.optional).toBe(1)
  })

  it('counts unique licenses correctly', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0', sinon: '^14.0.0' },
    })
    const stats = scanner.getStatistics()
    expect(stats.uniqueLicenses).toBe(2)
  })

  it('provides licenseCounts record', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0', express: '^4.0.0' },
    })
    const stats = scanner.getStatistics()
    expect(stats.licenseCounts['MIT']).toBe(2)
  })

  it('updates stats after re-scan', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    expect(scanner.getStatistics().total).toBe(1)
    scanner.scan({
      dependencies: { lodash: '^4.0.0', express: '^4.0.0' },
    })
    expect(scanner.getStatistics().total).toBe(2)
  })

  it('stats are embedded in scan result', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    expect(result.stats).toEqual(scanner.getStatistics())
  })
})

// ─── clear ─────────────────────────────────────────────────────────
describe('clear', () => {
  it('clears all internal state', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
    })
    scanner.clear()
    expect(scanner.getDependencies()).toEqual([])
    expect(scanner.getDevDependencies()).toEqual([])
    expect(scanner.getByName('lodash')).toEqual([])
    expect(scanner.findConflicts()).toEqual([])
    expect(scanner.getLicenseSummary()).toEqual({})
  })

  it('resets statistics to empty', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    scanner.clear()
    const stats = scanner.getStatistics()
    expect(stats.total).toBe(0)
    expect(stats.production).toBe(0)
    expect(stats.uniqueLicenses).toBe(0)
  })

  it('allows scanning again after clear', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    scanner.clear()
    const result = scanner.scan({
      dependencies: { express: '^4.0.0' },
    })
    expect(result.dependencies).toHaveLength(1)
    expect(result.dependencies[0]?.name).toBe('express')
  })

  it('clear does not affect config', () => {
    const scanner = new DependencyScanner({ includeDev: false })
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
    })
    scanner.clear()
    const result = scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^1.0.0' },
    })
    expect(result.devDependencies).toHaveLength(0)
  })
})

// ─── License extraction ────────────────────────────────────────────
describe('license extraction', () => {
  it('extracts MIT for lodash', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: { lodash: '^4.0.0' } })
    expect(result.dependencies[0]?.licenses).toEqual(['MIT'])
  })

  it('extracts MIT for express', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: { express: '^4.0.0' } })
    expect(result.dependencies[0]?.licenses).toEqual(['MIT'])
  })

  it('extracts MIT for react', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: { react: '^18.0.0' } })
    expect(result.dependencies[0]?.licenses).toEqual(['MIT'])
  })

  it('extracts Apache-2.0 for typescript', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: { typescript: '^5.0.0' } })
    expect(result.dependencies[0]?.licenses).toEqual(['Apache-2.0'])
  })

  it('extracts MIT for vitest', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ devDependencies: { vitest: '^1.0.0' } })
    expect(result.devDependencies[0]?.licenses).toEqual(['MIT'])
  })

  it('extracts MIT for eslint', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ devDependencies: { eslint: '^8.0.0' } })
    expect(result.devDependencies[0]?.licenses).toEqual(['MIT'])
  })

  it('extracts MIT for webpack', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: { webpack: '^5.0.0' } })
    expect(result.dependencies[0]?.licenses).toEqual(['MIT'])
  })

  it('extracts MIT for jest', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ devDependencies: { jest: '^29.0.0' } })
    expect(result.devDependencies[0]?.licenses).toEqual(['MIT'])
  })

  it('extracts MIT for mocha', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ devDependencies: { mocha: '^10.0.0' } })
    expect(result.devDependencies[0]?.licenses).toEqual(['MIT'])
  })

  it('extracts MIT for chai', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ devDependencies: { chai: '^4.0.0' } })
    expect(result.devDependencies[0]?.licenses).toEqual(['MIT'])
  })

  it('extracts BSD-3-Clause for sinon', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ devDependencies: { sinon: '^14.0.0' } })
    expect(result.devDependencies[0]?.licenses).toEqual(['BSD-3-Clause'])
  })

  it('extracts MIT for next', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: { next: '^13.0.0' } })
    expect(result.dependencies[0]?.licenses).toEqual(['MIT'])
  })

  it('extracts MIT for vue', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: { vue: '^3.0.0' } })
    expect(result.dependencies[0]?.licenses).toEqual(['MIT'])
  })

  it('extracts MIT for angular', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: { angular: '^15.0.0' } })
    expect(result.dependencies[0]?.licenses).toEqual(['MIT'])
  })

  it('extracts MIT for svelte', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: { svelte: '^4.0.0' } })
    expect(result.dependencies[0]?.licenses).toEqual(['MIT'])
  })

  it('extracts MIT for @types/ scoped packages', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      devDependencies: { '@types/node': '^18.0.0' },
    })
    expect(result.devDependencies[0]?.licenses).toEqual(['MIT'])
  })

  it('returns Unknown for unrecognized packages', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: { 'my-pkg': '^1.0.0' } })
    expect(result.dependencies[0]?.licenses).toEqual(['Unknown'])
  })

  it('does not share license array references between different deps', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      dependencies: { lodash: '^4.0.0', express: '^4.0.0' },
    })
    const licenses1 = result.dependencies[0]?.licenses
    const licenses2 = result.dependencies[1]?.licenses
    expect(licenses1).not.toBe(licenses2)
    expect(licenses1).toEqual(licenses2)
  })
})

// ─── Version strings ───────────────────────────────────────────────
describe('version strings', () => {
  it('preserves caret version strings', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: { lodash: '^4.17.21' } })
    expect(result.dependencies[0]?.version).toBe('^4.17.21')
  })

  it('preserves tilde version strings', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: { lodash: '~4.17.0' } })
    expect(result.dependencies[0]?.version).toBe('~4.17.0')
  })

  it('preserves exact version strings', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: { lodash: '4.17.21' } })
    expect(result.dependencies[0]?.version).toBe('4.17.21')
  })

  it('preserves star version strings', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: { lodash: '*' } })
    expect(result.dependencies[0]?.version).toBe('*')
  })

  it('preserves workspace protocol versions', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({ dependencies: { 'my-lib': 'workspace:*' } })
    expect(result.dependencies[0]?.version).toBe('workspace:*')
  })

  it('preserves range version strings', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      dependencies: { lodash: '>=4.0.0 <5.0.0' },
    })
    expect(result.dependencies[0]?.version).toBe('>=4.0.0 <5.0.0')
  })

  it('preserves git url versions', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      dependencies: { 'my-pkg': 'github:user/repo' },
    })
    expect(result.dependencies[0]?.version).toBe('github:user/repo')
  })
})

// ─── Type exports ──────────────────────────────────────────────────
describe('type exports', () => {
  it('DependencyInfo type is usable', () => {
    const dep: DependencyInfo = {
      name: 'lodash',
      version: '^4.0.0',
      type: 'production',
      source: 'dependencies',
      licenses: ['MIT'],
    }
    expect(dep.name).toBe('lodash')
  })

  it('DependencyStats type is usable', () => {
    const stats: DependencyStats = {
      total: 1,
      production: 1,
      dev: 0,
      peer: 0,
      optional: 0,
      uniqueLicenses: 1,
      licenseCounts: { MIT: 1 },
    }
    expect(stats.total).toBe(1)
  })

  it('ScannerConfig type is usable', () => {
    const config: ScannerConfig = {
      includeDev: true,
      includePeer: true,
      checkUnused: true,
      maxDepth: 10,
    }
    expect(config.maxDepth).toBe(10)
  })

  it('VulnerabilityInfo type is usable', () => {
    const vuln: VulnerabilityInfo = {
      name: 'lodash',
      severity: 'high',
      advisory: 'Prototype pollution',
      patchedIn: '^4.17.21',
    }
    expect(vuln.severity).toBe('high')
  })
})

// ─── Edge cases ────────────────────────────────────────────────────
describe('edge cases', () => {
  it('handles scoped package names', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      dependencies: { '@babel/core': '^7.0.0', '@types/node': '^18.0.0' },
    })
    expect(result.dependencies).toHaveLength(2)
    expect(result.dependencies[0]?.name).toBe('@babel/core')
  })

  it('handles package name with numbers', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      dependencies: { 'babel-preset-es2015': '^6.0.0' },
    })
    expect(result.dependencies).toHaveLength(1)
  })

  it('handles very long version strings', () => {
    const scanner = new DependencyScanner()
    const longVersion = '>=1.0.0-alpha.1 <2.0.0-beta.2 || >=3.0.0-rc.1'
    const result = scanner.scan({
      dependencies: { lodash: longVersion },
    })
    expect(result.dependencies[0]?.version).toBe(longVersion)
  })

  it('scan with only devDependencies and includeDev=false', () => {
    const scanner = new DependencyScanner({ includeDev: false })
    const result = scanner.scan({
      devDependencies: { vitest: '^1.0.0' },
    })
    expect(result.total).toBe(0)
    expect(result.devDependencies).toHaveLength(0)
  })

  it('scan with only peerDependencies and includePeer=false', () => {
    const scanner = new DependencyScanner({ includePeer: false })
    const result = scanner.scan({
      peerDependencies: { react: '>=18' },
    })
    expect(result.total).toBe(0)
    expect(result.peerDependencies).toHaveLength(0)
  })

  it('multiple scans accumulate correctly via internal state', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    scanner.scan({
      dependencies: { express: '^4.0.0' },
    })
    const deps = scanner.getDependencies()
    expect(deps).toHaveLength(1)
    expect(deps[0]?.name).toBe('express')
  })

  it('findUnused after clear returns empty', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
    })
    scanner.clear()
    expect(scanner.findUnused([])).toEqual([])
  })

  it('findConflicts after clear returns empty', () => {
    const scanner = new DependencyScanner()
    scanner.scan({
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { lodash: '^3.0.0' },
    })
    scanner.clear()
    expect(scanner.findConflicts()).toEqual([])
  })

  it('handles package with many dependencies', () => {
    const scanner = new DependencyScanner()
    const deps: Record<string, string> = {}
    for (let i = 0; i < 100; i++) {
      deps[`pkg-${i}`] = `^${i}.0.0`
    }
    const result = scanner.scan({ dependencies: deps })
    expect(result.total).toBe(100)
    expect(result.dependencies).toHaveLength(100)
  })

  it('preserves original package object (no mutation)', () => {
    const scanner = new DependencyScanner()
    const pkg = { dependencies: { lodash: '^4.0.0' } }
    const originalDeps = { ...pkg.dependencies }
    scanner.scan(pkg)
    expect(pkg.dependencies).toEqual(originalDeps)
  })

  it('returns correct DependencyInfo shape', () => {
    const scanner = new DependencyScanner()
    const result = scanner.scan({
      dependencies: { lodash: '^4.17.21' },
    })
    const dep = result.dependencies[0]
    expect(dep).toHaveProperty('name')
    expect(dep).toHaveProperty('version')
    expect(dep).toHaveProperty('type')
    expect(dep).toHaveProperty('source')
    expect(dep).toHaveProperty('licenses')
    expect(typeof dep?.name).toBe('string')
    expect(typeof dep?.version).toBe('string')
    expect(typeof dep?.type).toBe('string')
    expect(typeof dep?.source).toBe('string')
    expect(Array.isArray(dep?.licenses)).toBe(true)
  })
})
