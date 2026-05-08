import { describe, it, expect, beforeEach } from 'vitest'
import { DependencyScanner, DEFAULT_SCANNER_CONFIG } from '../../src/core/dep-scanner/dep-scanner.js'
import type {
  DependencyInfo,
  ScanResult,
  ScannerConfig,
  VulnerabilityInfo,
} from '../../src/core/dep-scanner/dep-scanner.js'

describe('DependencyScanner', () => {
  let scanner: DependencyScanner

  beforeEach(() => {
    scanner = new DependencyScanner()
  })

  describe('constructor', () => {
    it('should create scanner with default config', () => {
      const s = new DependencyScanner()
      expect(s).toBeInstanceOf(DependencyScanner)
    })

    it('should create scanner with custom config', () => {
      const s = new DependencyScanner({ includeDev: false, maxDepth: 5 })
      expect(s).toBeInstanceOf(DependencyScanner)
    })

    it('should merge partial config with defaults', () => {
      const s = new DependencyScanner({ maxDepth: 20 })
      expect(s).toBeInstanceOf(DependencyScanner)
    })
  })

  describe('scan', () => {
    it('should scan an empty package.json', () => {
      const result = scanner.scan({})
      expect(result.total).toBe(0)
      expect(result.dependencies).toEqual([])
      expect(result.devDependencies).toEqual([])
      expect(result.peerDependencies).toEqual([])
      expect(result.optionalDependencies).toEqual([])
    })

    it('should scan production dependencies', () => {
      const result = scanner.scan({
        dependencies: { lodash: '^4.17.21', express: '^4.18.0' },
      })
      expect(result.dependencies).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('should scan dev dependencies when includeDev is true', () => {
      const result = scanner.scan({
        devDependencies: { vitest: '^0.34.0', typescript: '^5.2.0' },
      })
      expect(result.devDependencies).toHaveLength(2)
    })

    it('should skip dev dependencies when includeDev is false', () => {
      const s = new DependencyScanner({ includeDev: false })
      const result = s.scan({
        devDependencies: { vitest: '^0.34.0' },
      })
      expect(result.devDependencies).toHaveLength(0)
    })

    it('should scan peer dependencies when includePeer is true', () => {
      const result = scanner.scan({
        peerDependencies: { react: '>=17.0.0' },
      })
      expect(result.peerDependencies).toHaveLength(1)
    })

    it('should skip peer dependencies when includePeer is false', () => {
      const s = new DependencyScanner({ includePeer: false })
      const result = s.scan({
        peerDependencies: { react: '>=17.0.0' },
      })
      expect(result.peerDependencies).toHaveLength(0)
    })

    it('should scan optional dependencies', () => {
      const result = scanner.scan({
        optionalDependencies: { fsevents: '^2.3.0' },
      })
      expect(result.optionalDependencies).toHaveLength(1)
    })

    it('should scan all dependency types together', () => {
      const result = scanner.scan({
        dependencies: { lodash: '^4.17.21' },
        devDependencies: { vitest: '^0.34.0' },
        peerDependencies: { react: '>=17.0.0' },
        optionalDependencies: { fsevents: '^2.3.0' },
      })
      expect(result.dependencies).toHaveLength(1)
      expect(result.devDependencies).toHaveLength(1)
      expect(result.peerDependencies).toHaveLength(1)
      expect(result.optionalDependencies).toHaveLength(1)
      expect(result.total).toBe(4)
    })

    it('should handle package.json with empty dependency objects', () => {
      const result = scanner.scan({
        dependencies: {},
        devDependencies: {},
        peerDependencies: {},
        optionalDependencies: {},
      })
      expect(result.total).toBe(0)
    })

    it('should produce correct DependencyInfo shape', () => {
      const result = scanner.scan({
        dependencies: { lodash: '^4.17.21' },
      })
      const dep = result.dependencies[0]
      expect(dep).toBeDefined()
      expect(dep?.name).toBe('lodash')
      expect(dep?.version).toBe('^4.17.21')
      expect(dep?.type).toBe('production')
      expect(dep?.source).toBe('dependencies')
      expect(Array.isArray(dep?.licenses)).toBe(true)
    })

    it('should return stats in result', () => {
      const result = scanner.scan({
        dependencies: { lodash: '^4.17.21' },
        devDependencies: { vitest: '^0.34.0' },
      })
      expect(result.stats).toBeDefined()
      expect(result.stats.total).toBe(2)
    })
  })

  describe('getDependencies', () => {
    it('should return only production dependencies', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
        devDependencies: { vitest: '^0.34.0' },
      })
      const deps = scanner.getDependencies()
      expect(deps).toHaveLength(1)
      expect(deps[0]?.name).toBe('lodash')
    })

    it('should return empty array when no production deps', () => {
      scanner.scan({
        devDependencies: { vitest: '^0.34.0' },
      })
      expect(scanner.getDependencies()).toEqual([])
    })
  })

  describe('getDevDependencies', () => {
    it('should return only dev dependencies', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
        devDependencies: { vitest: '^0.34.0' },
      })
      const deps = scanner.getDevDependencies()
      expect(deps).toHaveLength(1)
      expect(deps[0]?.name).toBe('vitest')
    })

    it('should return empty array when no dev deps', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
      })
      expect(scanner.getDevDependencies()).toEqual([])
    })
  })

  describe('getByName', () => {
    it('should find dependency by name', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
      })
      const found = scanner.getByName('lodash')
      expect(found).toHaveLength(1)
      expect(found[0]?.version).toBe('^4.17.21')
    })

    it('should return empty array for non-existent name', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
      })
      expect(scanner.getByName('nonexistent')).toEqual([])
    })

    it('should find same dep in multiple dependency types', () => {
      scanner.scan({
        dependencies: { react: '^18.0.0' },
        peerDependencies: { react: '>=17.0.0' },
      })
      const found = scanner.getByName('react')
      expect(found).toHaveLength(2)
    })
  })

  describe('getByType', () => {
    it('should filter by production type', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
        devDependencies: { vitest: '^0.34.0' },
      })
      const prod = scanner.getByType('production')
      expect(prod).toHaveLength(1)
      expect(prod[0]?.name).toBe('lodash')
    })

    it('should filter by dev type', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
        devDependencies: { vitest: '^0.34.0' },
      })
      const dev = scanner.getByType('dev')
      expect(dev).toHaveLength(1)
      expect(dev[0]?.name).toBe('vitest')
    })

    it('should filter by peer type', () => {
      scanner.scan({
        peerDependencies: { react: '>=17.0.0' },
      })
      const peer = scanner.getByType('peer')
      expect(peer).toHaveLength(1)
    })

    it('should filter by optional type', () => {
      scanner.scan({
        optionalDependencies: { fsevents: '^2.3.0' },
      })
      const opt = scanner.getByType('optional')
      expect(opt).toHaveLength(1)
    })

    it('should return empty for type with no deps', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
      })
      expect(scanner.getByType('peer')).toEqual([])
    })
  })

  describe('findConflicts', () => {
    it('should detect version conflicts for same package', () => {
      scanner.scan({
        dependencies: { react: '^18.0.0' },
        peerDependencies: { react: '^17.0.0' },
      })
      const conflicts = scanner.findConflicts()
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0]?.name).toBe('react')
      expect(conflicts[0]?.versions).toContain('^18.0.0')
      expect(conflicts[0]?.versions).toContain('^17.0.0')
    })

    it('should return empty when no conflicts', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
        devDependencies: { vitest: '^0.34.0' },
      })
      expect(scanner.findConflicts()).toEqual([])
    })

    it('should detect conflicts across three sources', () => {
      scanner.scan({
        dependencies: { react: '^18.0.0' },
        devDependencies: { react: '^17.0.0' },
        peerDependencies: { react: '^16.0.0' },
      })
      const conflicts = scanner.findConflicts()
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0]?.versions).toHaveLength(3)
    })

    it('should not report conflict when same version in multiple sources', () => {
      scanner.scan({
        dependencies: { react: '^18.0.0' },
        peerDependencies: { react: '^18.0.0' },
      })
      expect(scanner.findConflicts()).toEqual([])
    })
  })

  describe('findUnused', () => {
    it('should find unused dependencies', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21', express: '^4.18.0' },
      })
      const unused = scanner.findUnused(['import lodash from'])
      expect(unused).toHaveLength(1)
      expect(unused[0]?.name).toBe('express')
    })

    it('should return empty when all deps are used', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
      })
      const unused = scanner.findUnused(['import lodash from'])
      expect(unused).toHaveLength(0)
    })

    it('should return empty when no source files provided', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
      })
      const unused = scanner.findUnused([])
      expect(unused).toHaveLength(1)
    })

    it('should return empty when checkUnused is false', () => {
      const s = new DependencyScanner({ checkUnused: false })
      s.scan({
        dependencies: { lodash: '^4.17.21' },
      })
      const unused = s.findUnused([])
      expect(unused).toHaveLength(0)
    })

    it('should find all deps as unused with empty source files', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21', express: '^4.18.0' },
      })
      const unused = scanner.findUnused([])
      expect(unused).toHaveLength(2)
    })
  })

  describe('getLicenseSummary', () => {
    it('should summarize licenses', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21', express: '^4.18.0' },
      })
      const summary = scanner.getLicenseSummary()
      expect(summary['MIT']).toBe(2)
    })

    it('should handle mixed licenses', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21', typescript: '^5.2.0' },
      })
      const summary = scanner.getLicenseSummary()
      expect(summary['MIT']).toBe(1)
      expect(summary['Apache-2.0']).toBe(1)
    })

    it('should return empty summary for no deps', () => {
      scanner.scan({})
      const summary = scanner.getLicenseSummary()
      expect(Object.keys(summary)).toHaveLength(0)
    })

    it('should handle @types scoped packages', () => {
      scanner.scan({
        devDependencies: { '@types/node': '^20.0.0' },
      })
      const summary = scanner.getLicenseSummary()
      expect(summary['MIT']).toBeDefined()
    })

    it('should count Unknown licenses for unrecognized packages', () => {
      scanner.scan({
        dependencies: { 'my-custom-pkg': '^1.0.0' },
      })
      const summary = scanner.getLicenseSummary()
      expect(summary['Unknown']).toBe(1)
    })
  })

  describe('getStatistics', () => {
    it('should return stats after scan', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
        devDependencies: { vitest: '^0.34.0' },
        peerDependencies: { react: '>=17.0.0' },
        optionalDependencies: { fsevents: '^2.3.0' },
      })
      const stats = scanner.getStatistics()
      expect(stats.total).toBe(4)
      expect(stats.production).toBe(1)
      expect(stats.dev).toBe(1)
      expect(stats.peer).toBe(1)
      expect(stats.optional).toBe(1)
    })

    it('should return zero stats before scan', () => {
      const stats = scanner.getStatistics()
      expect(stats.total).toBe(0)
      expect(stats.production).toBe(0)
      expect(stats.dev).toBe(0)
      expect(stats.peer).toBe(0)
      expect(stats.optional).toBe(0)
    })

    it('should count unique licenses', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21', typescript: '^5.2.0' },
      })
      const stats = scanner.getStatistics()
      expect(stats.uniqueLicenses).toBeGreaterThanOrEqual(2)
    })

    it('should include licenseCounts', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21', express: '^4.18.0' },
      })
      const stats = scanner.getStatistics()
      expect(stats.licenseCounts['MIT']).toBe(2)
    })
  })

  describe('clear', () => {
    it('should clear all scanned data', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
      })
      scanner.clear()
      expect(scanner.getDependencies()).toEqual([])
      expect(scanner.getStatistics().total).toBe(0)
    })

    it('should allow re-scanning after clear', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
      })
      scanner.clear()
      const result = scanner.scan({
        dependencies: { express: '^4.18.0' },
      })
      expect(result.dependencies).toHaveLength(1)
      expect(result.dependencies[0]?.name).toBe('express')
    })

    it('should reset lastResult', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
      })
      scanner.clear()
      const stats = scanner.getStatistics()
      expect(stats.total).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle package.json with no dependency keys', () => {
      const result = scanner.scan({ name: 'test', version: '1.0.0' })
      expect(result.total).toBe(0)
    })

    it('should handle malformed version strings', () => {
      const result = scanner.scan({
        dependencies: { pkg: 'not-a-version' },
      })
      expect(result.dependencies).toHaveLength(1)
      expect(result.dependencies[0]?.version).toBe('not-a-version')
    })

    it('should handle self-referencing package names', () => {
      const result = scanner.scan({
        dependencies: { 'self-pkg': 'workspace:*' },
      })
      expect(result.dependencies).toHaveLength(1)
      expect(result.dependencies[0]?.version).toBe('workspace:*')
    })

    it('should handle duplicate entries across dep types', () => {
      scanner.scan({
        dependencies: { react: '^18.0.0' },
        devDependencies: { react: '^18.0.0' },
      })
      const byName = scanner.getByName('react')
      expect(byName).toHaveLength(2)
    })

    it('should handle scoped packages', () => {
      const result = scanner.scan({
        dependencies: { '@babel/core': '^7.22.0' },
      })
      expect(result.dependencies).toHaveLength(1)
      expect(result.dependencies[0]?.name).toBe('@babel/core')
    })

    it('should handle very long version strings', () => {
      const longVersion = '^1.0.0-beta.0+build.1234567890.abcdef'
      const result = scanner.scan({
        dependencies: { pkg: longVersion },
      })
      expect(result.dependencies[0]?.version).toBe(longVersion)
    })

    it('should handle package.json with only optionalDependencies', () => {
      const result = scanner.scan({
        optionalDependencies: { fsevents: '^2.3.0' },
      })
      expect(result.total).toBe(1)
      expect(result.optionalDependencies).toHaveLength(1)
    })

    it('should handle git URLs as versions', () => {
      const result = scanner.scan({
        dependencies: { 'my-lib': 'github:user/repo#main' },
      })
      expect(result.dependencies).toHaveLength(1)
      expect(result.dependencies[0]?.version).toBe('github:user/repo#main')
    })

    it('should handle file protocol versions', () => {
      const result = scanner.scan({
        dependencies: { 'local-pkg': 'file:../local-pkg' },
      })
      expect(result.dependencies).toHaveLength(1)
      expect(result.dependencies[0]?.version).toBe('file:../local-pkg')
    })
  })

  describe('DEFAULT_SCANNER_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_SCANNER_CONFIG.includeDev).toBe(true)
      expect(DEFAULT_SCANNER_CONFIG.includePeer).toBe(true)
      expect(DEFAULT_SCANNER_CONFIG.checkUnused).toBe(true)
      expect(DEFAULT_SCANNER_CONFIG.maxDepth).toBe(10)
    })
  })

  describe('re-exports', () => {
    it('should export DependencyInfo type', () => {
      const dep: DependencyInfo = {
        name: 'test',
        version: '1.0.0',
        type: 'production',
        source: 'dependencies',
        licenses: ['MIT'],
      }
      expect(dep.name).toBe('test')
    })

    it('should export ScanResult type', () => {
      const result: ScanResult = {
        dependencies: [],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: [],
        total: 0,
        stats: {
          total: 0,
          production: 0,
          dev: 0,
          peer: 0,
          optional: 0,
          uniqueLicenses: 0,
          licenseCounts: {},
        },
      }
      expect(result.total).toBe(0)
    })

    it('should export ScannerConfig type', () => {
      const config: ScannerConfig = {
        includeDev: true,
        includePeer: true,
        checkUnused: true,
        maxDepth: 10,
      }
      expect(config.maxDepth).toBe(10)
    })

    it('should export VulnerabilityInfo type', () => {
      const vuln: VulnerabilityInfo = {
        name: 'lodash',
        severity: 'high',
        advisory: 'Prototype pollution',
        patchedIn: '4.17.21',
      }
      expect(vuln.severity).toBe('high')
    })
  })

  describe('multiple scans', () => {
    it('should replace data on re-scan', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
      })
      scanner.scan({
        dependencies: { express: '^4.18.0', react: '^18.0.0' },
      })
      const deps = scanner.getDependencies()
      expect(deps).toHaveLength(2)
      expect(deps.find((d) => d.name === 'lodash')).toBeUndefined()
    })

    it('should accumulate conflicts across scan types', () => {
      scanner.scan({
        dependencies: { react: '^18.0.0' },
        devDependencies: { react: '^17.0.0' },
      })
      const conflicts = scanner.findConflicts()
      expect(conflicts).toHaveLength(1)
    })
  })

  describe('config options behavior', () => {
    it('should respect includeDev=false excluding dev deps from total', () => {
      const s = new DependencyScanner({ includeDev: false })
      const result = s.scan({
        dependencies: { lodash: '^4.17.21' },
        devDependencies: { vitest: '^0.34.0' },
      })
      expect(result.total).toBe(1)
      expect(result.devDependencies).toHaveLength(0)
    })

    it('should respect includePeer=false excluding peer deps from total', () => {
      const s = new DependencyScanner({ includePeer: false })
      const result = s.scan({
        dependencies: { lodash: '^4.17.21' },
        peerDependencies: { react: '>=17.0.0' },
      })
      expect(result.total).toBe(1)
      expect(result.peerDependencies).toHaveLength(0)
    })

    it('should always include optional dependencies regardless of config', () => {
      const s = new DependencyScanner({ includeDev: false, includePeer: false })
      const result = s.scan({
        optionalDependencies: { fsevents: '^2.3.0' },
      })
      expect(result.optionalDependencies).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })

  describe('scan result immutability', () => {
    it('should not mutate input package.json', () => {
      const pkg = { dependencies: { lodash: '^4.17.21' } }
      const copy = { ...pkg.dependencies }
      scanner.scan(pkg)
      expect(pkg.dependencies).toEqual(copy)
    })

    it('should return independent arrays on multiple calls', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
      })
      const deps1 = scanner.getDependencies()
      const deps2 = scanner.getDependencies()
      expect(deps1).not.toBe(deps2)
      expect(deps1).toEqual(deps2)
    })
  })

  describe('findUnused edge cases', () => {
    it('should handle dep name appearing as substring', () => {
      scanner.scan({
        dependencies: { express: '^4.18.0' },
      })
      const unused = scanner.findUnused(['import expressHandler from'])
      expect(unused).toHaveLength(0)
    })

    it('should be case sensitive when matching', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
      })
      const unused = scanner.findUnused(['import Lodash from'])
      expect(unused).toHaveLength(1)
    })
  })

  describe('findConflicts edge cases', () => {
    it('should handle multiple packages with conflicts', () => {
      scanner.scan({
        dependencies: { react: '^18.0.0', vue: '^3.0.0' },
        devDependencies: { react: '^17.0.0', vue: '^2.0.0' },
      })
      const conflicts = scanner.findConflicts()
      expect(conflicts).toHaveLength(2)
      const names = conflicts.map((c) => c.name)
      expect(names).toContain('react')
      expect(names).toContain('vue')
    })

    it('should include sources in conflict info', () => {
      scanner.scan({
        dependencies: { react: '^18.0.0' },
        peerDependencies: { react: '^17.0.0' },
      })
      const conflicts = scanner.findConflicts()
      expect(conflicts[0]?.sources).toContain('dependencies')
      expect(conflicts[0]?.sources).toContain('peerDependencies')
    })
  })

  describe('license summary aggregation', () => {
    it('should count multiple licenses per package', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21', express: '^4.18.0' },
        devDependencies: { vitest: '^0.34.0' },
      })
      const summary = scanner.getLicenseSummary()
      expect(summary['MIT']).toBe(3)
    })

    it('should handle all Unknown licenses', () => {
      scanner.scan({
        dependencies: { 'pkg-a': '^1.0.0', 'pkg-b': '^2.0.0' },
      })
      const summary = scanner.getLicenseSummary()
      expect(summary['Unknown']).toBe(2)
    })
  })

  describe('statistics after clear and rescan', () => {
    it('should reflect new scan data after clear', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21', express: '^4.18.0' },
      })
      expect(scanner.getStatistics().total).toBe(2)
      scanner.clear()
      scanner.scan({
        dependencies: { react: '^18.0.0' },
      })
      expect(scanner.getStatistics().total).toBe(1)
      expect(scanner.getStatistics().production).toBe(1)
    })

    it('should reset all stat counts to zero on clear', () => {
      scanner.scan({
        dependencies: { lodash: '^4.17.21' },
        devDependencies: { vitest: '^0.34.0' },
      })
      scanner.clear()
      const stats = scanner.getStatistics()
      expect(stats.total).toBe(0)
      expect(stats.production).toBe(0)
      expect(stats.dev).toBe(0)
      expect(stats.peer).toBe(0)
      expect(stats.optional).toBe(0)
      expect(stats.uniqueLicenses).toBe(0)
    })
  })

  describe('scan with no previous state', () => {
    it('should return fresh result on first scan', () => {
      const result = scanner.scan({
        dependencies: { lodash: '^4.17.21' },
      })
      expect(result.dependencies[0]?.licenses).toContain('MIT')
    })

    it('should handle scan after instantiating with all config options', () => {
      const s = new DependencyScanner({
        includeDev: false,
        includePeer: false,
        checkUnused: false,
        maxDepth: 1,
      })
      const result = s.scan({
        dependencies: { lodash: '^4.17.21' },
        devDependencies: { vitest: '^0.34.0' },
        peerDependencies: { react: '>=17.0.0' },
      })
      expect(result.total).toBe(1)
    })

    it('should correctly set source field for each dep type', () => {
      const result = scanner.scan({
        dependencies: { lodash: '^4.17.21' },
        devDependencies: { vitest: '^0.34.0' },
        peerDependencies: { react: '>=17.0.0' },
        optionalDependencies: { fsevents: '^2.3.0' },
      })
      expect(result.dependencies[0]?.source).toBe('dependencies')
      expect(result.devDependencies[0]?.source).toBe('devDependencies')
      expect(result.peerDependencies[0]?.source).toBe('peerDependencies')
      expect(result.optionalDependencies[0]?.source).toBe('optionalDependencies')
    })
  })

  describe('large dependency sets', () => {
    it('should handle many production dependencies', () => {
      const deps: Record<string, string> = {}
      for (let i = 0; i < 50; i++) {
        deps[`pkg-${i}`] = `^${i}.0.0`
      }
      const result = scanner.scan({ dependencies: deps })
      expect(result.total).toBe(50)
      expect(result.dependencies).toHaveLength(50)
    })

    it('should handle mixed large sets', () => {
      const deps: Record<string, string> = {}
      const devDeps: Record<string, string> = {}
      for (let i = 0; i < 20; i++) {
        deps[`pkg-${i}`] = `^${i}.0.0`
        devDeps[`dev-pkg-${i}`] = `^${i}.0.0`
      }
      const result = scanner.scan({ dependencies: deps, devDependencies: devDeps })
      expect(result.total).toBe(40)
      expect(result.stats.production).toBe(20)
      expect(result.stats.dev).toBe(20)
    })
  })
})
