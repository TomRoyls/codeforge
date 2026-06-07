import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'

import Dependencies from '../src/commands/dependencies.js'
import {
  buildDependenciesResult,
  buildDependencyTree,
  calculateHealthScore,
  calculateMaxDepth,
  categorizeVersionType,
  extractDependencies,
  parsePackageJson,
  parseVersionRange,
  type DependencyInfo,
  type DependencyTree,
  type DependenciesResult,
  type SemverRange,
} from '../src/commands/dependencies-helpers.js'
import {
  formatDependenciesCsv,
  formatDependenciesJson,
  formatDependenciesTable,
  formatDependencyTree,
  formatHealthBar,
} from '../src/commands/dependencies-format-helpers.js'

// ─── Test helpers ────────────────────────────────────────

function makeSemverRange(overrides: Partial<SemverRange> = {}): SemverRange {
  return {
    major: 1,
    minor: 2,
    operator: '^',
    patch: 3,
    raw: '^1.2.3',
    ...overrides,
  }
}

function makeDependencyInfo(overrides: Partial<DependencyInfo> = {}): DependencyInfo {
  return {
    depth: 0,
    isDirect: true,
    name: 'lodash',
    parsedRange: makeSemverRange(),
    type: 'dependency',
    version: '^4.17.0',
    ...overrides,
  }
}

function makeDependencyTree(overrides: Partial<DependencyTree> = {}): DependencyTree {
  return {
    dependencies: [],
    depth: 0,
    name: 'test-project',
    version: '1.0.0',
    ...overrides,
  }
}

function makeDependenciesResult(overrides: Partial<DependenciesResult> = {}): DependenciesResult {
  const deps: DependencyInfo[] = [
    makeDependencyInfo({
      name: 'chalk',
      version: '^5.0.0',
      parsedRange: makeSemverRange({ operator: '^', raw: '^5.0.0', major: 5, minor: 0, patch: 0 }),
    }),
  ]
  return {
    dependencies: deps,
    tree: makeDependencyTree(),
    summary: {
      totalDeps: 1,
      totalDevDeps: 0,
      totalPeerDeps: 0,
      totalOptionalDeps: 0,
      maxDepth: 0,
      versionTypes: [{ type: 'caret', count: 1 }],
      healthScore: 100,
    },
    byType: {
      dependencies: deps,
      devDependencies: [],
      peerDependencies: [],
      optionalDependencies: [],
    },
    ...overrides,
  }
}

function createTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'dep-test-'))
}

function cleanupTempDir(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

function createTempPackageJson(dir: string, data: Record<string, unknown>): void {
  writeFileSync(join(dir, 'package.json'), JSON.stringify(data))
}

// ─── parseVersionRange ───────────────────────────────────

describe('parseVersionRange', () => {
  it('parses caret version ^1.2.3', () => {
    const result = parseVersionRange('^1.2.3')
    expect(result.operator).toBe('^')
    expect(result.major).toBe(1)
    expect(result.minor).toBe(2)
    expect(result.patch).toBe(3)
    expect(result.raw).toBe('^1.2.3')
  })

  it('parses tilde version ~1.2.3', () => {
    const result = parseVersionRange('~1.2.3')
    expect(result.operator).toBe('~')
    expect(result.major).toBe(1)
    expect(result.minor).toBe(2)
    expect(result.patch).toBe(3)
  })

  it('parses exact version 1.2.3', () => {
    const result = parseVersionRange('1.2.3')
    expect(result.operator).toBe('')
    expect(result.major).toBe(1)
    expect(result.minor).toBe(2)
    expect(result.patch).toBe(3)
  })

  it('parses greater-equal version >=1.2.3', () => {
    const result = parseVersionRange('>=1.2.3')
    expect(result.operator).toBe('>=')
    expect(result.major).toBe(1)
    expect(result.minor).toBe(2)
    expect(result.patch).toBe(3)
  })

  it('parses greater-than version >1.0.0', () => {
    const result = parseVersionRange('>1.0.0')
    expect(result.operator).toBe('>')
    expect(result.major).toBe(1)
    expect(result.minor).toBe(0)
    expect(result.patch).toBe(0)
  })

  it('parses less-than version <1.2.3', () => {
    const result = parseVersionRange('<1.2.3')
    expect(result.operator).toBe('<')
    expect(result.major).toBe(1)
    expect(result.minor).toBe(2)
    expect(result.patch).toBe(3)
  })

  it('parses star wildcard *', () => {
    const result = parseVersionRange('*')
    expect(result.operator).toBe('*')
    expect(result.major).toBe(0)
    expect(result.minor).toBe(0)
    expect(result.patch).toBe(0)
  })

  it('parses workspace protocol workspace:*', () => {
    const result = parseVersionRange('workspace:*')
    expect(result.operator).toBe('workspace')
    expect(result.major).toBe(0)
    expect(result.minor).toBe(0)
    expect(result.patch).toBe(0)
  })

  it('parses complex range >=1.0.0 <2.0.0', () => {
    const result = parseVersionRange('>=1.0.0 <2.0.0')
    expect(result.operator).toBe('complex')
    expect(result.major).toBe(1)
    expect(result.minor).toBe(0)
    expect(result.patch).toBe(0)
  })

  it('parses complex range with OR ||', () => {
    const result = parseVersionRange('1.0.0 || 2.0.0')
    expect(result.operator).toBe('complex')
  })

  it('falls back for unparseable strings', () => {
    const result = parseVersionRange('latest')
    expect(result.operator).toBe('')
    expect(result.major).toBe(0)
    expect(result.minor).toBe(0)
    expect(result.patch).toBe(0)
  })

  it('preserves raw version string', () => {
    const result = parseVersionRange('^4.18.2')
    expect(result.raw).toBe('^4.18.2')
  })
})

// ─── categorizeVersionType ───────────────────────────────

describe('categorizeVersionType', () => {
  it('classifies empty operator as exact', () => {
    expect(categorizeVersionType(makeSemverRange({ operator: '' }))).toBe('exact')
  })

  it('classifies ^ as caret', () => {
    expect(categorizeVersionType(makeSemverRange({ operator: '^' }))).toBe('caret')
  })

  it('classifies ~ as tilde', () => {
    expect(categorizeVersionType(makeSemverRange({ operator: '~' }))).toBe('tilde')
  })

  it('classifies >= as range', () => {
    expect(categorizeVersionType(makeSemverRange({ operator: '>=' }))).toBe('range')
  })

  it('classifies > as range', () => {
    expect(categorizeVersionType(makeSemverRange({ operator: '>' }))).toBe('range')
  })

  it('classifies < as range', () => {
    expect(categorizeVersionType(makeSemverRange({ operator: '<' }))).toBe('range')
  })

  it('classifies <= as range', () => {
    expect(categorizeVersionType(makeSemverRange({ operator: '<=' }))).toBe('range')
  })

  it('classifies * as any', () => {
    expect(categorizeVersionType(makeSemverRange({ operator: '*' }))).toBe('any')
  })

  it('classifies workspace as workspace', () => {
    expect(categorizeVersionType(makeSemverRange({ operator: 'workspace' }))).toBe('workspace')
  })

  it('classifies unknown operator as complex', () => {
    expect(categorizeVersionType(makeSemverRange({ operator: 'something' }))).toBe('complex')
  })
})

// ─── extractDependencies ─────────────────────────────────

describe('extractDependencies', () => {
  const pkgData = {
    name: 'test-project',
    version: '1.0.0',
    dependencies: { lodash: '^4.17.0', express: '~4.18.2' },
    devDependencies: { vitest: '^1.0.0', typescript: '5.3.3' },
    peerDependencies: { react: '>=18.0.0' },
    optionalDependencies: { fsevents: '^2.3.0' },
  }

  it('extracts all dependency types with filter "all"', () => {
    const result = extractDependencies(pkgData, 'all')
    expect(result).toHaveLength(6)
    expect(result.some((d) => d.type === 'dependency')).toBe(true)
    expect(result.some((d) => d.type === 'devDependency')).toBe(true)
    expect(result.some((d) => d.type === 'peerDependency')).toBe(true)
    expect(result.some((d) => d.type === 'optionalDependency')).toBe(true)
  })

  it('extracts only dependencies with filter "deps"', () => {
    const result = extractDependencies(pkgData, 'deps')
    expect(result).toHaveLength(2)
    expect(result.every((d) => d.type === 'dependency')).toBe(true)
    expect(result.map((d) => d.name)).toContain('lodash')
    expect(result.map((d) => d.name)).toContain('express')
  })

  it('extracts only devDependencies with filter "devDeps"', () => {
    const result = extractDependencies(pkgData, 'devDeps')
    expect(result).toHaveLength(2)
    expect(result.every((d) => d.type === 'devDependency')).toBe(true)
  })

  it('handles empty dependencies', () => {
    const emptyPkg = {
      name: 'empty',
      version: '1.0.0',
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
      optionalDependencies: {},
    }
    const result = extractDependencies(emptyPkg, 'all')
    expect(result).toHaveLength(0)
  })

  it('sets isDirect to true and depth to 0', () => {
    const result = extractDependencies(pkgData, 'deps')
    expect(result.every((d) => d.isDirect)).toBe(true)
    expect(result.every((d) => d.depth === 0)).toBe(true)
  })

  it('parses version ranges for each dependency', () => {
    const result = extractDependencies(pkgData, 'deps')
    const lodash = result.find((d) => d.name === 'lodash')
    expect(lodash).toBeDefined()
    expect(lodash!.parsedRange.operator).toBe('^')
  })
})

// ─── parsePackageJson ────────────────────────────────────

describe('parsePackageJson', () => {
  it('returns parsed data for valid package.json', () => {
    const dir = createTempDir()
    try {
      createTempPackageJson(dir, {
        name: 'my-project',
        version: '2.0.0',
        dependencies: { lodash: '^4.17.0' },
        devDependencies: { vitest: '^1.0.0' },
      })
      const result = parsePackageJson(dir)
      expect(result).not.toBeNull()
      expect(result!.name).toBe('my-project')
      expect(result!.version).toBe('2.0.0')
      expect(result!.dependencies['lodash']).toBe('^4.17.0')
      expect(result!.devDependencies['vitest']).toBe('^1.0.0')
    } finally {
      cleanupTempDir(dir)
    }
  })

  it('returns null for missing package.json', () => {
    const dir = createTempDir()
    try {
      const result = parsePackageJson(dir)
      expect(result).toBeNull()
    } finally {
      cleanupTempDir(dir)
    }
  })

  it('returns null for invalid JSON', () => {
    const dir = createTempDir()
    try {
      writeFileSync(join(dir, 'package.json'), '{ invalid json')
      const result = parsePackageJson(dir)
      expect(result).toBeNull()
    } finally {
      cleanupTempDir(dir)
    }
  })

  it('handles missing dependency fields gracefully', () => {
    const dir = createTempDir()
    try {
      createTempPackageJson(dir, { name: 'minimal' })
      const result = parsePackageJson(dir)
      expect(result).not.toBeNull()
      expect(result!.dependencies).toEqual({})
      expect(result!.devDependencies).toEqual({})
      expect(result!.peerDependencies).toEqual({})
      expect(result!.optionalDependencies).toEqual({})
    } finally {
      cleanupTempDir(dir)
    }
  })
})

// ─── buildDependencyTree ─────────────────────────────────

describe('buildDependencyTree', () => {
  it('builds root node with direct dependencies', () => {
    const pkgData = {
      name: 'test-project',
      version: '1.0.0',
      dependencies: { lodash: '^4.17.0' },
      devDependencies: {},
      peerDependencies: {},
      optionalDependencies: {},
    }
    const dir = createTempDir()
    try {
      const tree = buildDependencyTree(pkgData, 3, dir)
      expect(tree.name).toBe('test-project')
      expect(tree.version).toBe('1.0.0')
      expect(tree.depth).toBe(0)
      expect(tree.dependencies).toHaveLength(1)
      expect(tree.dependencies[0]!.name).toBe('lodash')
    } finally {
      cleanupTempDir(dir)
    }
  })

  it('respects maxDepth limit', () => {
    const pkgData = {
      name: 'test-project',
      version: '1.0.0',
      dependencies: { lodash: '^4.17.0' },
      devDependencies: {},
      peerDependencies: {},
      optionalDependencies: {},
    }
    const dir = createTempDir()
    try {
      mkdirSync(join(dir, 'node_modules', 'lodash'), { recursive: true })
      writeFileSync(
        join(dir, 'node_modules', 'lodash', 'package.json'),
        JSON.stringify({ name: 'lodash', version: '4.17.21', dependencies: { something: '^1.0.0' } }),
      )

      const tree = buildDependencyTree(pkgData, 1, dir)
      expect(tree.dependencies[0]!.dependencies).toHaveLength(0)
    } finally {
      cleanupTempDir(dir)
    }
  })

  it('handles missing node_modules gracefully', () => {
    const pkgData = {
      name: 'test-project',
      version: '1.0.0',
      dependencies: { lodash: '^4.17.0' },
      devDependencies: {},
      peerDependencies: {},
      optionalDependencies: {},
    }
    const dir = createTempDir()
    try {
      const tree = buildDependencyTree(pkgData, 3, dir)
      expect(tree.dependencies).toHaveLength(1)
      expect(tree.dependencies[0]!.name).toBe('lodash')
      expect(tree.dependencies[0]!.dependencies).toHaveLength(0)
    } finally {
      cleanupTempDir(dir)
    }
  })

  it('returns root-only tree when maxDepth is 0', () => {
    const pkgData = {
      name: 'test-project',
      version: '1.0.0',
      dependencies: { lodash: '^4.17.0' },
      devDependencies: {},
      peerDependencies: {},
      optionalDependencies: {},
    }
    const dir = createTempDir()
    try {
      const tree = buildDependencyTree(pkgData, 0, dir)
      expect(tree.dependencies).toHaveLength(0)
      expect(tree.name).toBe('test-project')
    } finally {
      cleanupTempDir(dir)
    }
  })
})

// ─── calculateMaxDepth ───────────────────────────────────

describe('calculateMaxDepth', () => {
  it('returns 0 for flat tree', () => {
    const tree = makeDependencyTree()
    expect(calculateMaxDepth(tree)).toBe(0)
  })

  it('calculates max depth for nested tree', () => {
    const tree = makeDependencyTree({
      dependencies: [
        makeDependencyTree({
          name: 'dep-a',
          depth: 1,
          dependencies: [
            makeDependencyTree({ name: 'dep-b', depth: 2, dependencies: [] }),
          ],
        }),
      ],
    })
    expect(calculateMaxDepth(tree)).toBe(2)
  })

  it('returns tree depth when tree has no children', () => {
    const tree = makeDependencyTree({ depth: 5 })
    expect(calculateMaxDepth(tree)).toBe(5)
  })

  it('handles multiple branches with different depths', () => {
    const tree = makeDependencyTree({
      dependencies: [
        makeDependencyTree({ name: 'shallow', depth: 1, dependencies: [] }),
        makeDependencyTree({
          name: 'deep',
          depth: 1,
          dependencies: [
            makeDependencyTree({ name: 'deeper', depth: 2, dependencies: [] }),
          ],
        }),
      ],
    })
    expect(calculateMaxDepth(tree)).toBe(2)
  })
})

// ─── calculateHealthScore ────────────────────────────────

describe('calculateHealthScore', () => {
  it('returns 100 for perfect configuration', () => {
    const result = makeDependenciesResult({
      dependencies: [
        makeDependencyInfo({ name: 'chalk', parsedRange: makeSemverRange({ operator: '^' }) }),
      ],
      summary: {
        totalDeps: 1,
        totalDevDeps: 0,
        totalPeerDeps: 0,
        totalOptionalDeps: 0,
        maxDepth: 0,
        versionTypes: [{ type: 'caret', count: 1 }],
        healthScore: 0,
      },
    })
    expect(calculateHealthScore(result)).toBe(100)
  })

  it('deducts for peer dependencies', () => {
    const result = makeDependenciesResult({
      dependencies: [
        makeDependencyInfo({
          type: 'peerDependency',
          parsedRange: makeSemverRange({ operator: '^' }),
        }),
      ],
      summary: {
        totalDeps: 0,
        totalDevDeps: 0,
        totalPeerDeps: 1,
        totalOptionalDeps: 0,
        maxDepth: 0,
        versionTypes: [{ type: 'caret', count: 1 }],
        healthScore: 0,
      },
    })
    expect(calculateHealthScore(result)).toBe(95)
  })

  it('deducts for exact versions', () => {
    const result = makeDependenciesResult({
      dependencies: [
        makeDependencyInfo({ parsedRange: makeSemverRange({ operator: '' }) }),
      ],
      summary: {
        totalDeps: 1,
        totalDevDeps: 0,
        totalPeerDeps: 0,
        totalOptionalDeps: 0,
        maxDepth: 0,
        versionTypes: [{ type: 'exact', count: 1 }],
        healthScore: 0,
      },
    })
    expect(calculateHealthScore(result)).toBe(90)
  })

  it('deducts for wildcard versions', () => {
    const result = makeDependenciesResult({
      dependencies: [
        makeDependencyInfo({ parsedRange: makeSemverRange({ operator: '*' }) }),
      ],
      summary: {
        totalDeps: 1,
        totalDevDeps: 0,
        totalPeerDeps: 0,
        totalOptionalDeps: 0,
        maxDepth: 0,
        versionTypes: [{ type: 'any', count: 1 }],
        healthScore: 0,
      },
    })
    expect(calculateHealthScore(result)).toBe(95)
  })

  it('deducts for excess dev dependencies beyond 20', () => {
    const result = makeDependenciesResult({
      dependencies: [],
      summary: {
        totalDeps: 0,
        totalDevDeps: 25,
        totalPeerDeps: 0,
        totalOptionalDeps: 0,
        maxDepth: 0,
        versionTypes: [],
        healthScore: 0,
      },
    })
    expect(calculateHealthScore(result)).toBe(90)
  })

  it('clamps minimum score to 0', () => {
    const manyExactDeps: DependencyInfo[] = Array.from({ length: 15 }, (_, i) =>
      makeDependencyInfo({
        name: `dep-${i}`,
        parsedRange: makeSemverRange({ operator: '' }),
        type: 'peerDependency',
      }),
    )
    const result = makeDependenciesResult({
      dependencies: manyExactDeps,
      summary: {
        totalDeps: 0,
        totalDevDeps: 0,
        totalPeerDeps: 15,
        totalOptionalDeps: 0,
        maxDepth: 0,
        versionTypes: [],
        healthScore: 0,
      },
    })
    expect(calculateHealthScore(result)).toBe(0)
  })

  it('clamps maximum score to 100', () => {
    const result = makeDependenciesResult({
      dependencies: [],
      summary: {
        totalDeps: 0,
        totalDevDeps: 0,
        totalPeerDeps: 0,
        totalOptionalDeps: 0,
        maxDepth: 0,
        versionTypes: [],
        healthScore: 0,
      },
    })
    expect(calculateHealthScore(result)).toBe(100)
  })
})

// ─── buildDependenciesResult ─────────────────────────────

describe('buildDependenciesResult', () => {
  it('returns valid result for project with package.json', () => {
    const dir = createTempDir()
    try {
      createTempPackageJson(dir, {
        name: 'test-project',
        version: '1.0.0',
        dependencies: { chalk: '^5.0.0' },
        devDependencies: { vitest: '^1.0.0' },
      })
      const result = buildDependenciesResult(dir, { typeFilter: 'all', maxDepth: 3 })
      expect(result.dependencies).toHaveLength(2)
      expect(result.summary.totalDeps).toBe(1)
      expect(result.summary.totalDevDeps).toBe(1)
      expect(result.tree.name).toBe('test-project')
      expect(result.summary.healthScore).toBeGreaterThan(0)
    } finally {
      cleanupTempDir(dir)
    }
  })

  it('returns empty result for missing package.json', () => {
    const dir = createTempDir()
    try {
      const result = buildDependenciesResult(dir, { typeFilter: 'all', maxDepth: 3 })
      expect(result.dependencies).toHaveLength(0)
      expect(result.summary.totalDeps).toBe(0)
      expect(result.tree.name).toBe('unknown')
    } finally {
      cleanupTempDir(dir)
    }
  })

  it('respects typeFilter option', () => {
    const dir = createTempDir()
    try {
      createTempPackageJson(dir, {
        name: 'test',
        version: '1.0.0',
        dependencies: { chalk: '^5.0.0' },
        devDependencies: { vitest: '^1.0.0' },
      })
      const result = buildDependenciesResult(dir, { typeFilter: 'deps', maxDepth: 3 })
      expect(result.dependencies).toHaveLength(1)
      expect(result.dependencies[0]!.name).toBe('chalk')
    } finally {
      cleanupTempDir(dir)
    }
  })

  it('computes version type breakdown', () => {
    const dir = createTempDir()
    try {
      createTempPackageJson(dir, {
        name: 'test',
        version: '1.0.0',
        dependencies: { chalk: '^5.0.0', lodash: '~4.17.0', express: '4.18.2' },
      })
      const result = buildDependenciesResult(dir, { typeFilter: 'all', maxDepth: 3 })
      const vtNames = result.summary.versionTypes.map((vt) => vt.type)
      expect(vtNames).toContain('caret')
      expect(vtNames).toContain('tilde')
      expect(vtNames).toContain('exact')
    } finally {
      cleanupTempDir(dir)
    }
  })
})

// ─── formatDependenciesTable ─────────────────────────────

describe('formatDependenciesTable', () => {
  it('contains summary section', () => {
    const result = makeDependenciesResult()
    const output = formatDependenciesTable(result, false, 3)
    expect(output).toContain('Summary')
    expect(output).toContain('Dependencies')
    expect(output).toContain('Health Score')
  })

  it('contains dependency table with column headers', () => {
    const result = makeDependenciesResult()
    const output = formatDependenciesTable(result, false, 3)
    expect(output).toContain('Name')
    expect(output).toContain('Version')
    expect(output).toContain('Type')
    expect(output).toContain('Constraint')
  })

  it('shows dependency tree in verbose mode', () => {
    const result = makeDependenciesResult({
      tree: makeDependencyTree({
        dependencies: [
          makeDependencyTree({ name: 'lodash', version: '^4.17.0', depth: 1 }),
        ],
      }),
    })
    const output = formatDependenciesTable(result, true, 3)
    expect(output).toContain('Dependency Tree')
  })

  it('hides dependency tree in non-verbose mode', () => {
    const result = makeDependenciesResult()
    const output = formatDependenciesTable(result, false, 3)
    expect(output).not.toContain('Dependency Tree')
  })

  it('handles empty dependencies', () => {
    const result = makeDependenciesResult({
      dependencies: [],
      byType: {
        dependencies: [],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: [],
      },
    })
    const output = formatDependenciesTable(result, false, 3)
    expect(output).toContain('Summary')
  })
})

// ─── formatDependenciesCsv ───────────────────────────────

describe('formatDependenciesCsv', () => {
  it('produces CSV with headers', () => {
    const result = makeDependenciesResult({ dependencies: [] })
    const output = formatDependenciesCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Name,Version,Type,Constraint')
  })

  it('includes data rows', () => {
    const result = makeDependenciesResult()
    const output = formatDependenciesCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBeGreaterThanOrEqual(2)
    expect(lines[1]).toContain('chalk')
  })

  it('escapes special characters', () => {
    const result = makeDependenciesResult({
      dependencies: [
        makeDependencyInfo({ name: 'pkg,with,commas', version: '^1.0.0' }),
      ],
    })
    const output = formatDependenciesCsv(result)
    expect(output).toContain('"pkg,with,commas"')
  })

  it('handles empty dependencies', () => {
    const result = makeDependenciesResult({ dependencies: [] })
    const output = formatDependenciesCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBe(1)
    expect(lines[0]).toBe('Name,Version,Type,Constraint')
  })
})

// ─── formatDependenciesJson ──────────────────────────────

describe('formatDependenciesJson', () => {
  it('produces valid JSON', () => {
    const result = makeDependenciesResult()
    const output = formatDependenciesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains dependencies array', () => {
    const result = makeDependenciesResult()
    const output = formatDependenciesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.dependencies).toBeDefined()
    expect(Array.isArray(parsed.dependencies)).toBe(true)
  })

  it('contains summary with health score', () => {
    const result = makeDependenciesResult()
    const output = formatDependenciesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.summary).toBeDefined()
    expect(parsed.summary.healthScore).toBe(100)
  })

  it('preserves dependency data accurately', () => {
    const result = makeDependenciesResult({
      dependencies: [
        makeDependencyInfo({ name: 'lodash', version: '^4.17.0' }),
      ],
    })
    const output = formatDependenciesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.dependencies[0].name).toBe('lodash')
    expect(parsed.dependencies[0].version).toBe('^4.17.0')
  })
})

// ─── formatHealthBar ─────────────────────────────────────

describe('formatHealthBar', () => {
  it('contains block characters', () => {
    const bar = formatHealthBar(80)
    expect(bar).toContain('\u2588')
    expect(bar).toContain('\u2591')
  })

  it('high score produces output', () => {
    const bar = formatHealthBar(90)
    expect(bar).toBeTruthy()
    expect(bar.length).toBeGreaterThan(0)
  })

  it('medium score produces output', () => {
    const bar = formatHealthBar(60)
    expect(bar).toBeTruthy()
  })

  it('low score produces output', () => {
    const bar = formatHealthBar(20)
    expect(bar).toBeTruthy()
  })
})

// ─── formatDependencyTree ────────────────────────────────

describe('formatDependencyTree', () => {
  it('renders root node', () => {
    const tree = makeDependencyTree()
    const output = formatDependencyTree(tree, 3)
    expect(output).toContain('test-project@1.0.0')
  })

  it('renders child nodes', () => {
    const tree = makeDependencyTree({
      dependencies: [
        makeDependencyTree({ name: 'lodash', version: '^4.17.0', depth: 1 }),
      ],
    })
    const output = formatDependencyTree(tree, 3)
    expect(output).toContain('lodash@^4.17.0')
  })

  it('respects max depth', () => {
    const tree = makeDependencyTree({
      dependencies: [
        makeDependencyTree({
          name: 'dep-a',
          depth: 1,
          dependencies: [
            makeDependencyTree({ name: 'dep-b', depth: 2, dependencies: [] }),
          ],
        }),
      ],
    })
    const output = formatDependencyTree(tree, 1)
    expect(output).toContain('dep-a')
    expect(output).not.toContain('dep-b')
  })

  it('handles empty tree', () => {
    const tree = makeDependencyTree()
    const output = formatDependencyTree(tree, 3)
    expect(output).toContain('test-project')
  })
})

// ─── Command metadata ───────────────────────────────────

describe('Dependencies command - static metadata', () => {
  it('has a description', () => {
    expect(Dependencies.description).toBe('Analyze and visualize module dependencies')
  })

  it('has examples array', () => {
    expect(Array.isArray(Dependencies.examples)).toBe(true)
    expect(Dependencies.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has format flag with options', () => {
    expect(Dependencies.flags.format.options).toContain('json')
    expect(Dependencies.flags.format.options).toContain('table')
    expect(Dependencies.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Dependencies.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Dependencies.flags.output).toBeDefined()
  })

  it('has depth flag defaulting to 3', () => {
    expect(Dependencies.flags.depth.default).toBe(3)
  })

  it('has type flag with options', () => {
    expect(Dependencies.flags.type.options).toContain('all')
    expect(Dependencies.flags.type.options).toContain('deps')
    expect(Dependencies.flags.type.options).toContain('devDeps')
  })

  it('has verbose flag defaulting to false', () => {
    expect(Dependencies.flags.verbose.default).toBe(false)
  })

  it('has check-updates flag defaulting to false', () => {
    expect(Dependencies.flags['check-updates'].default).toBe(false)
  })
})

// ─── Command class structure ─────────────────────────────

describe('Dependencies command - class structure', () => {
  it('exports a default class', () => {
    expect(Dependencies).toBeDefined()
    expect(typeof Dependencies).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Dependencies.prototype.run).toBe('function')
  })
})
