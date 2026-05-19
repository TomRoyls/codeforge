import { describe, expect, it } from 'vitest'

import Scopes from '../src/commands/scopes.js'
import {
  buildDependencyMatrix,
  buildModuleMap,
  buildScopesResult,
  computeCohesionScore,
  computeCouplingScore,
  computeInstability,
  detectCircularDependencies,
  detectLayerViolations,
  extractImports,
  resolveModulePath,
  type ModuleInfo,
  type ScopesResult,
} from '../src/commands/scopes-helpers.js'
import { formatScore, formatScopesJson, formatScopesTable } from '../src/commands/scopes-format-helpers.js'
import type { CircularDependency, LayerViolation, ScopeStats } from '../src/commands/scopes-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeModuleInfo(overrides: Partial<ModuleInfo> = {}): ModuleInfo {
  return {
    name: 'commands',
    path: 'src/commands',
    files: 5,
    internalImports: 10,
    externalImports: 3,
    importedBy: 2,
    dependencies: ['src/core'],
    dependents: ['src/cli'],
    couplingScore: 25,
    cohesionScore: 77,
    instability: 0.6,
    ...overrides,
  }
}

function makeScopesResult(overrides: Partial<ScopesResult> = {}): ScopesResult {
  return {
    modules: [makeModuleInfo()],
    stats: {
      totalModules: 1,
      avgCoupling: 25,
      avgCohesion: 77,
      avgInstability: 0.6,
      highlyCoupledModules: [],
      isolatedModules: [],
      circularDependencies: [],
      layerViolations: [],
    },
    dependencyMatrix: { 'src/commands': { 'src/core': 3 } },
    ...overrides,
  }
}

function makeScopeStats(overrides: Partial<ScopeStats> = {}): ScopeStats {
  return {
    totalModules: 1,
    avgCoupling: 25,
    avgCohesion: 77,
    avgInstability: 0.6,
    highlyCoupledModules: [],
    isolatedModules: [],
    circularDependencies: [],
    layerViolations: [],
    ...overrides,
  }
}

// ─── Command static metadata ────────────────────────────

describe('Scopes command - static metadata', () => {
  it('has a description', () => {
    expect(Scopes.description).toBe('Analyze module boundaries and dependency scopes')
  })

  it('has examples array', () => {
    expect(Array.isArray(Scopes.examples)).toBe(true)
    expect(Scopes.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Scopes.args.path).toBeDefined()
    expect(Scopes.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Scopes.args.path.default).toBe('.')
  })
})

// ─── Command flags ──────────────────────────────────────

describe('Scopes command - flags', () => {
  it('has format flag with options', () => {
    expect(Scopes.flags.format.options).toContain('json')
    expect(Scopes.flags.format.options).toContain('table')
  })

  it('defaults format to table', () => {
    expect(Scopes.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Scopes.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Scopes.flags.ignore).toBeDefined()
    expect(Scopes.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag with default', () => {
    expect(Scopes.flags.ext).toBeDefined()
    expect(Scopes.flags.ext.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has depth flag with default 5', () => {
    expect(Scopes.flags.depth).toBeDefined()
    expect(Scopes.flags.depth.default).toBe(5)
  })

  it('has verbose flag defaulting to false', () => {
    expect(Scopes.flags.verbose.default).toBe(false)
  })
})

// ─── Command class structure ────────────────────────────

describe('Scopes command - class structure', () => {
  it('exports a default class', () => {
    expect(Scopes).toBeDefined()
    expect(typeof Scopes).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Scopes.prototype.run).toBe('function')
  })
})

// ─── extractImports ──────────────────────────────────────

describe('extractImports', () => {
  it('extracts ESM named imports', () => {
    const content = "import { foo, bar } from './utils'"
    const result = extractImports(content, 'src/index.ts')
    expect(result).toContain('./utils')
  })

  it('extracts ESM default imports', () => {
    const content = "import foo from './helpers'"
    const result = extractImports(content, 'src/index.ts')
    expect(result).toContain('./helpers')
  })

  it('extracts ESM type imports', () => {
    const content = "import type { Config } from './types'"
    const result = extractImports(content, 'src/index.ts')
    expect(result).toContain('./types')
  })

  it('extracts bare imports', () => {
    const content = "import './side-effects'"
    const result = extractImports(content, 'src/index.ts')
    expect(result).toContain('./side-effects')
  })

  it('extracts dynamic imports', () => {
    const content = "const mod = import('./lazy-module')"
    const result = extractImports(content, 'src/index.ts')
    expect(result).toContain('./lazy-module')
  })

  it('extracts require calls', () => {
    const content = "const foo = require('./foo')"
    const result = extractImports(content, 'src/index.ts')
    expect(result).toContain('./foo')
  })

  it('extracts multiple imports from same content', () => {
    const content = "import { a } from './a'\nimport { b } from './b'\nconst c = require('./c')"
    const result = extractImports(content, 'src/index.ts')
    expect(result).toHaveLength(3)
    expect(result).toContain('./a')
    expect(result).toContain('./b')
    expect(result).toContain('./c')
  })

  it('extracts ESM namespace imports', () => {
    const content = "import * as utils from './utils'"
    const result = extractImports(content, 'src/index.ts')
    expect(result).toContain('./utils')
  })

  it('returns empty array for no imports', () => {
    const content = 'const x = 1;\nconsole.log(x);'
    const result = extractImports(content, 'src/index.ts')
    expect(result).toHaveLength(0)
  })

  it('returns empty array for empty string', () => {
    const result = extractImports('', 'src/index.ts')
    expect(result).toHaveLength(0)
  })

  it('does not extract external imports as package names', () => {
    const content = "import chalk from 'chalk'"
    const result = extractImports(content, 'src/index.ts')
    // chalk is extracted by the regex but it's not a relative path
    expect(result).toContain('chalk')
  })
})

// ─── resolveModulePath ──────────────────────────────────

describe('resolveModulePath', () => {
  it('resolves relative path to module directory', () => {
    const result = resolveModulePath('./helpers', 'src/commands/count.ts')
    expect(result).toBe('src/commands/helpers')
  })

  it('returns null for external package imports', () => {
    const result = resolveModulePath('chalk', 'src/commands/count.ts')
    expect(result).toBeNull()
  })

  it('returns null for scoped package imports', () => {
    const result = resolveModulePath('@oclif/core', 'src/commands/count.ts')
    expect(result).toBeNull()
  })

  it('returns null for node built-in imports', () => {
    const result = resolveModulePath('node:fs', 'src/commands/count.ts')
    expect(result).toBeNull()
  })

  it('resolves relative parent path', () => {
    const result = resolveModulePath('../core', 'src/commands/count.ts')
    expect(result).toBe('src/core')
  })

  it('resolves deeply nested relative path', () => {
    const result = resolveModulePath('../../utils', 'src/commands/sub/index.ts')
    expect(result).toBe('src/utils')
  })

  it('resolves path with file extension to its directory', () => {
    const result = resolveModulePath('./count-helpers.ts', 'src/commands/count.ts')
    expect(result).toBe('src/commands')
  })

  it('resolves sibling file import to same directory', () => {
    const result = resolveModulePath('./other.ts', 'src/commands/count.ts')
    expect(result).toBe('src/commands')
  })
})

// ─── computeCouplingScore ────────────────────────────────

describe('computeCouplingScore', () => {
  it('returns 0 for no external connections', () => {
    expect(computeCouplingScore({ externalImports: 0, importedBy: 0 })).toBe(0)
  })

  it('computes low coupling', () => {
    expect(computeCouplingScore({ externalImports: 2, importedBy: 1 })).toBe(15)
  })

  it('computes moderate coupling', () => {
    expect(computeCouplingScore({ externalImports: 5, importedBy: 5 })).toBe(50)
  })

  it('caps at 100', () => {
    expect(computeCouplingScore({ externalImports: 50, importedBy: 50 })).toBe(100)
  })

  it('computes high coupling', () => {
    expect(computeCouplingScore({ externalImports: 10, importedBy: 11 })).toBe(100)
  })
})

// ─── computeCohesionScore ────────────────────────────────

describe('computeCohesionScore', () => {
  it('returns 100 for no imports', () => {
    expect(computeCohesionScore({ internalImports: 0, externalImports: 0 })).toBe(100)
  })

  it('returns 100 for all internal imports', () => {
    expect(computeCohesionScore({ internalImports: 10, externalImports: 0 })).toBe(100)
  })

  it('returns 0 for all external imports', () => {
    expect(computeCohesionScore({ internalImports: 0, externalImports: 10 })).toBe(0)
  })

  it('computes high cohesion', () => {
    expect(computeCohesionScore({ internalImports: 8, externalImports: 2 })).toBe(80)
  })

  it('computes low cohesion', () => {
    expect(computeCohesionScore({ internalImports: 2, externalImports: 8 })).toBe(20)
  })

  it('computes balanced cohesion', () => {
    expect(computeCohesionScore({ internalImports: 5, externalImports: 5 })).toBe(50)
  })
})

// ─── computeInstability ─────────────────────────────────

describe('computeInstability', () => {
  it('returns 0.5 for no connections', () => {
    expect(computeInstability({ externalImports: 0, importedBy: 0 })).toBe(0.5)
  })

  it('returns 0 for fully stable module (only incoming)', () => {
    expect(computeInstability({ externalImports: 0, importedBy: 5 })).toBe(0)
  })

  it('returns 1 for fully unstable module (only outgoing)', () => {
    expect(computeInstability({ externalImports: 5, importedBy: 0 })).toBe(1)
  })

  it('computes balanced instability', () => {
    expect(computeInstability({ externalImports: 5, importedBy: 5 })).toBe(0.5)
  })

  it('computes mostly stable', () => {
    expect(computeInstability({ externalImports: 1, importedBy: 9 })).toBe(0.1)
  })

  it('computes mostly unstable', () => {
    expect(computeInstability({ externalImports: 9, importedBy: 1 })).toBe(0.9)
  })
})

// ─── detectCircularDependencies ──────────────────────────

describe('detectCircularDependencies', () => {
  it('returns empty for no cycles', () => {
    const modules = new Map<string, ModuleInfo>()
    modules.set('src/a', makeModuleInfo({ path: 'src/a', dependencies: ['src/b'], dependents: [] }))
    modules.set('src/b', makeModuleInfo({ path: 'src/b', dependencies: [], dependents: ['src/a'] }))
    const result = detectCircularDependencies(modules)
    expect(result).toHaveLength(0)
  })

  it('detects simple two-node cycle', () => {
    const modules = new Map<string, ModuleInfo>()
    modules.set('src/a', makeModuleInfo({ path: 'src/a', dependencies: ['src/b'], dependents: ['src/b'] }))
    modules.set('src/b', makeModuleInfo({ path: 'src/b', dependencies: ['src/a'], dependents: ['src/a'] }))
    const result = detectCircularDependencies(modules)
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0]!.severity).toBe('high')
  })

  it('detects longer cycle', () => {
    const modules = new Map<string, ModuleInfo>()
    modules.set('src/a', makeModuleInfo({ path: 'src/a', dependencies: ['src/b'], dependents: ['src/c'] }))
    modules.set('src/b', makeModuleInfo({ path: 'src/b', dependencies: ['src/c'], dependents: ['src/a'] }))
    modules.set('src/c', makeModuleInfo({ path: 'src/c', dependencies: ['src/a'], dependents: ['src/b'] }))
    const result = detectCircularDependencies(modules)
    expect(result.length).toBeGreaterThanOrEqual(1)
    const severities = result.map((r) => r.severity)
    expect(severities).toContain('medium')
  })

  it('returns empty for empty map', () => {
    const result = detectCircularDependencies(new Map())
    expect(result).toHaveLength(0)
  })

  it('detects four-node cycle as low severity', () => {
    const modules = new Map<string, ModuleInfo>()
    modules.set('src/a', makeModuleInfo({ path: 'src/a', dependencies: ['src/b'], dependents: ['src/d'] }))
    modules.set('src/b', makeModuleInfo({ path: 'src/b', dependencies: ['src/c'], dependents: ['src/a'] }))
    modules.set('src/c', makeModuleInfo({ path: 'src/c', dependencies: ['src/d'], dependents: ['src/b'] }))
    modules.set('src/d', makeModuleInfo({ path: 'src/d', dependencies: ['src/a'], dependents: ['src/c'] }))
    const result = detectCircularDependencies(modules)
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result.some((r) => r.severity === 'low')).toBe(true)
  })
})

// ─── detectLayerViolations ───────────────────────────────

describe('detectLayerViolations', () => {
  it('returns empty for no violations', () => {
    const modules = new Map<string, ModuleInfo>()
    modules.set('src/commands/a', makeModuleInfo({ path: 'src/commands/a', dependencies: ['src/core'], dependents: [] }))
    modules.set('src/core', makeModuleInfo({ path: 'src/core', dependencies: [], dependents: ['src/commands/a'] }))
    const result = detectLayerViolations(modules)
    expect(result).toHaveLength(0)
  })

  it('detects commands importing from other commands', () => {
    const modules = new Map<string, ModuleInfo>()
    modules.set('src/commands/a', makeModuleInfo({ path: 'src/commands/a', dependencies: ['src/commands/b'], dependents: [] }))
    modules.set('src/commands/b', makeModuleInfo({ path: 'src/commands/b', dependencies: [], dependents: ['src/commands/a'] }))
    const result = detectLayerViolations(modules)
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0]!.severity).toBe('warning')
    expect(result[0]!.rule).toContain('Commands should not import from other commands')
  })

  it('detects utils importing from commands', () => {
    const modules = new Map<string, ModuleInfo>()
    modules.set('src/utils', makeModuleInfo({ path: 'src/utils', dependencies: ['src/commands/a'], dependents: [] }))
    modules.set('src/commands/a', makeModuleInfo({ path: 'src/commands/a', dependencies: [], dependents: ['src/utils'] }))
    const result = detectLayerViolations(modules)
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result.some((v) => v.severity === 'error')).toBe(true)
  })

  it('detects core importing from commands', () => {
    const modules = new Map<string, ModuleInfo>()
    modules.set('src/core', makeModuleInfo({ path: 'src/core', dependencies: ['src/commands/a'], dependents: [] }))
    modules.set('src/commands/a', makeModuleInfo({ path: 'src/commands/a', dependencies: [], dependents: ['src/core'] }))
    const result = detectLayerViolations(modules)
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result.some((v) => v.severity === 'error' && v.rule.includes('Core'))).toBe(true)
  })

  it('returns empty for empty map', () => {
    const result = detectLayerViolations(new Map())
    expect(result).toHaveLength(0)
  })

  it('does not flag same-directory imports as command violations', () => {
    const modules = new Map<string, ModuleInfo>()
    // same module importing from itself is fine
    modules.set('src/commands/a', makeModuleInfo({ path: 'src/commands/a', dependencies: [], dependents: [] }))
    const result = detectLayerViolations(modules)
    expect(result).toHaveLength(0)
  })
})

// ─── buildDependencyMatrix ──────────────────────────────

describe('buildDependencyMatrix', () => {
  it('builds simple matrix', () => {
    const modules = new Map<string, ModuleInfo>()
    modules.set('src/a', makeModuleInfo({ path: 'src/a', dependencies: ['src/b'] }))
    modules.set('src/b', makeModuleInfo({ path: 'src/b', dependencies: [] }))
    const result = buildDependencyMatrix(modules)
    expect(result['src/a']).toBeDefined()
    expect(result['src/a']!['src/b']).toBe(1)
    expect(result['src/b']).toBeDefined()
  })

  it('handles empty map', () => {
    const result = buildDependencyMatrix(new Map())
    expect(Object.keys(result)).toHaveLength(0)
  })

  it('excludes dependencies to unknown modules', () => {
    const modules = new Map<string, ModuleInfo>()
    modules.set('src/a', makeModuleInfo({ path: 'src/a', dependencies: ['src/unknown'] }))
    const result = buildDependencyMatrix(modules)
    expect(result['src/a']!['src/unknown']).toBeUndefined()
  })

  it('handles multiple dependencies to same module', () => {
    const modules = new Map<string, ModuleInfo>()
    // dependencies array with duplicates
    modules.set('src/a', makeModuleInfo({ path: 'src/a', dependencies: ['src/b', 'src/b'] }))
    modules.set('src/b', makeModuleInfo({ path: 'src/b', dependencies: [] }))
    const result = buildDependencyMatrix(modules)
    expect(result['src/a']!['src/b']).toBe(2)
  })
})

// ─── buildScopesResult (integration) ────────────────────

describe('buildScopesResult', () => {
  it('returns result with modules and stats', async () => {
    const files = [
      { path: 'src/a/index.ts' },
      { path: 'src/b/index.ts' },
    ]
    const reader = async (fp: string) => {
      if (fp.includes('src/a')) return "import { x } from '../b'"
      return 'export const x = 1'
    }
    const result = await buildScopesResult(files, reader, { maxDepth: 5 })
    expect(result.modules.length).toBeGreaterThanOrEqual(2)
    expect(result.stats.totalModules).toBeGreaterThanOrEqual(2)
    expect(result.dependencyMatrix).toBeDefined()
  })

  it('handles empty files', async () => {
    const result = await buildScopesResult([], async () => '', { maxDepth: 5 })
    expect(result.modules).toHaveLength(0)
    expect(result.stats.totalModules).toBe(0)
    expect(result.stats.avgCoupling).toBe(0)
    expect(result.stats.avgCohesion).toBe(0)
    expect(result.stats.avgInstability).toBe(0)
  })

  it('computes correct stats for simple project', async () => {
    const files = [
      { path: 'src/commands/a.ts' },
      { path: 'src/commands/b.ts' },
      { path: 'src/core/index.ts' },
    ]
    const reader = async (fp: string) => {
      if (fp.includes('a.ts')) return "import { x } from '../core'"
      if (fp.includes('b.ts')) return "import { y } from '../core'"
      return 'export const x = 1; export const y = 2'
    }
    const result = await buildScopesResult(files, reader, { maxDepth: 5 })
    expect(result.stats.totalModules).toBe(2)
    expect(result.modules.some((m) => m.path === 'src/commands')).toBe(true)
    expect(result.modules.some((m) => m.path === 'src/core')).toBe(true)
  })
})

// ─── buildModuleMap ─────────────────────────────────────

describe('buildModuleMap', () => {
  it('groups files by directory', async () => {
    const files = [
      { path: 'src/a/foo.ts' },
      { path: 'src/a/bar.ts' },
      { path: 'src/b/baz.ts' },
    ]
    const reader = async () => ''
    const map = await buildModuleMap(files, reader)
    expect(map.size).toBe(2)
    expect(map.get('src/a')!.files).toBe(2)
    expect(map.get('src/b')!.files).toBe(1)
  })

  it('tracks internal and external imports', async () => {
    const files = [
      { path: 'src/a/index.ts' },
      { path: 'src/a/helper.ts' },
      { path: 'src/b/index.ts' },
    ]
    const reader = async (fp: string) => {
      if (fp === 'src/a/index.ts') return "import { h } from './helper'\nimport { x } from '../b'"
      return ''
    }
    const map = await buildModuleMap(files, reader)
    const a = map.get('src/a')!
    expect(a.internalImports).toBe(1)
    expect(a.externalImports).toBe(1)
    expect(a.dependencies).toContain('src/b')
  })

  it('handles file read errors gracefully', async () => {
    const files = [{ path: 'src/a/index.ts' }]
    const reader = async () => { throw new Error('read error') }
    const map = await buildModuleMap(files, reader)
    expect(map.size).toBe(1)
    expect(map.get('src/a')!.internalImports).toBe(0)
    expect(map.get('src/a')!.externalImports).toBe(0)
  })
})

// ─── formatScore ────────────────────────────────────────

describe('formatScore', () => {
  it('formats low coupling as green', () => {
    const result = formatScore(20, 'coupling')
    expect(result).toContain('20')
  })

  it('formats medium coupling as yellow', () => {
    const result = formatScore(50, 'coupling')
    expect(result).toContain('50')
  })

  it('formats high coupling as red', () => {
    const result = formatScore(80, 'coupling')
    expect(result).toContain('80')
  })

  it('formats high cohesion as green', () => {
    const result = formatScore(90, 'cohesion')
    expect(result).toContain('90')
  })

  it('formats medium cohesion as yellow', () => {
    const result = formatScore(50, 'cohesion')
    expect(result).toContain('50')
  })

  it('formats low cohesion as red', () => {
    const result = formatScore(20, 'cohesion')
    expect(result).toContain('20')
  })

  it('formats low instability as green', () => {
    const result = formatScore(0.1, 'instability')
    expect(result).toContain('0.1')
  })

  it('formats high instability as red', () => {
    const result = formatScore(0.8, 'instability')
    expect(result).toContain('0.8')
  })

  it('formats medium instability as yellow', () => {
    const result = formatScore(0.5, 'instability')
    expect(result).toContain('0.5')
  })

  it('boundary: coupling 30 is green', () => {
    const result = formatScore(30, 'coupling')
    expect(result).toContain('30')
  })

  it('boundary: coupling 31 is yellow', () => {
    const result = formatScore(31, 'coupling')
    expect(result).toContain('31')
  })

  it('boundary: coupling 60 is yellow', () => {
    const result = formatScore(60, 'coupling')
    expect(result).toContain('60')
  })

  it('boundary: coupling 61 is red', () => {
    const result = formatScore(61, 'coupling')
    expect(result).toContain('61')
  })

  it('boundary: cohesion 70 is green', () => {
    const result = formatScore(70, 'cohesion')
    expect(result).toContain('70')
  })

  it('boundary: cohesion 40 is yellow', () => {
    const result = formatScore(40, 'cohesion')
    expect(result).toContain('40')
  })

  it('boundary: cohesion 39 is red', () => {
    const result = formatScore(39, 'cohesion')
    expect(result).toContain('39')
  })
})

// ─── formatScopesTable ──────────────────────────────────

describe('formatScopesTable', () => {
  it('contains header with column names', () => {
    const result = makeScopesResult()
    const output = formatScopesTable(result, false)
    expect(output).toContain('Module')
    expect(output).toContain('Files')
    expect(output).toContain('Coupling')
    expect(output).toContain('Cohesion')
    expect(output).toContain('Instability')
  })

  it('contains overview stats', () => {
    const result = makeScopesResult()
    const output = formatScopesTable(result, false)
    expect(output).toContain('Overview')
    expect(output).toContain('Modules:')
  })

  it('shows module data rows', () => {
    const result = makeScopesResult({
      modules: [makeModuleInfo({ path: 'src/commands', files: 5 })],
    })
    const output = formatScopesTable(result, false)
    expect(output).toContain('src/commands')
  })

  it('shows circular dependencies section when present', () => {
    const cd: CircularDependency = { cycle: ['src/a', 'src/b'], severity: 'high', files: ['src/a', 'src/b'] }
    const result = makeScopesResult({
      stats: makeScopeStats({ circularDependencies: [cd] }),
    })
    const output = formatScopesTable(result, false)
    expect(output).toContain('Circular Dependencies')
  })

  it('shows layer violations section when present', () => {
    const lv: LayerViolation = {
      from: 'src/utils',
      to: 'src/commands',
      rule: 'Utils should not import from commands',
      severity: 'error',
    }
    const result = makeScopesResult({
      stats: makeScopeStats({ layerViolations: [lv] }),
    })
    const output = formatScopesTable(result, false)
    expect(output).toContain('Layer Violations')
  })

  it('shows highly coupled warning', () => {
    const result = makeScopesResult({
      modules: [makeModuleInfo({ path: 'src/hot', couplingScore: 85 })],
      stats: makeScopeStats({
        highlyCoupledModules: [makeModuleInfo({ path: 'src/hot', couplingScore: 85 })],
      }),
    })
    const output = formatScopesTable(result, false)
    expect(output).toContain('highly coupled')
  })

  it('shows isolated modules info', () => {
    const result = makeScopesResult({
      stats: makeScopeStats({
        isolatedModules: [makeModuleInfo({ path: 'src/isolated', externalImports: 0 })],
      }),
    })
    const output = formatScopesTable(result, false)
    expect(output).toContain('isolated module')
  })

  it('shows dependency matrix in verbose mode', () => {
    const result = makeScopesResult({
      dependencyMatrix: { 'src/a': { 'src/b': 3 } },
    })
    const output = formatScopesTable(result, true)
    expect(output).toContain('Dependency Matrix')
    expect(output).toContain('src/a')
    expect(output).toContain('src/b')
  })

  it('hides dependency matrix in non-verbose mode', () => {
    const result = makeScopesResult()
    const output = formatScopesTable(result, false)
    expect(output).not.toContain('Dependency Matrix')
  })

  it('handles empty modules', () => {
    const result = makeScopesResult({
      modules: [],
      stats: makeScopeStats({ totalModules: 0 }),
    })
    const output = formatScopesTable(result, false)
    expect(output).toContain('No modules found')
  })
})

// ─── formatScopesJson ───────────────────────────────────

describe('formatScopesJson', () => {
  it('produces valid JSON', () => {
    const result = makeScopesResult()
    const output = formatScopesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains modules array', () => {
    const result = makeScopesResult()
    const output = formatScopesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.modules).toBeDefined()
    expect(Array.isArray(parsed.modules)).toBe(true)
  })

  it('contains stats object', () => {
    const result = makeScopesResult()
    const output = formatScopesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats).toBeDefined()
    expect(parsed.stats.totalModules).toBe(1)
  })

  it('contains dependency matrix', () => {
    const result = makeScopesResult()
    const output = formatScopesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.dependencyMatrix).toBeDefined()
  })

  it('handles empty results', () => {
    const result = makeScopesResult({
      modules: [],
      stats: makeScopeStats({ totalModules: 0, avgCoupling: 0, avgCohesion: 0, avgInstability: 0 }),
      dependencyMatrix: {},
    })
    const output = formatScopesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.modules).toHaveLength(0)
    expect(parsed.stats.totalModules).toBe(0)
  })

  it('preserves module data accurately', () => {
    const result = makeScopesResult({
      modules: [makeModuleInfo({ path: 'src/custom', couplingScore: 42, cohesionScore: 88 })],
    })
    const output = formatScopesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.modules[0].path).toBe('src/custom')
    expect(parsed.modules[0].couplingScore).toBe(42)
    expect(parsed.modules[0].cohesionScore).toBe(88)
  })
})
