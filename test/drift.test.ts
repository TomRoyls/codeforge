import { describe, it, expect } from 'vitest'

import {
  getLayerNumber,
  inferModuleBoundaries,
  inferAllowedDependencies,
  computeActualDependencies,
  detectBoundaryViolations,
  computeDriftIndicators,
  computeDriftScore,
  generateRecommendations,
  buildDriftResult,
  type ModuleBoundary,
  type BoundaryViolation,
  type DriftIndicator,
  type DriftStats,
} from '../src/commands/drift-helpers.js'

import {
  formatBoundaryMap,
  formatViolations,
  formatDriftIndicators,
  formatDriftGauge,
  formatDriftStatsLine,
  formatDriftRecommendations,
  formatDriftResultTable,
  formatDriftJson,
  formatDriftCsv,
} from '../src/commands/drift-format-helpers.js'

// ─── getLayerNumber ───────────────────────────────────────────────────────────

describe('getLayerNumber', () => {
  it('returns 0 for commands', () => {
    expect(getLayerNumber('commands')).toBe(0)
  })

  it('returns 1 for core', () => {
    expect(getLayerNumber('core')).toBe(1)
  })

  it('returns 2 for utils', () => {
    expect(getLayerNumber('utils')).toBe(2)
  })

  it('returns 3 for types', () => {
    expect(getLayerNumber('types')).toBe(3)
  })

  it('returns default 1 for unknown', () => {
    expect(getLayerNumber('foobar')).toBe(1)
  })
})

// ─── inferModuleBoundaries ────────────────────────────────────────────────────

describe('inferModuleBoundaries', () => {
  it('infers boundaries from file paths', () => {
    const files = ['src/commands/count.ts', 'src/core/file.ts', 'src/utils/helpers.ts']
    const boundaries = inferModuleBoundaries(files)
    expect(boundaries.length).toBe(3)
    const names = boundaries.map((b) => b.name)
    expect(names).toContain('commands')
    expect(names).toContain('core')
    expect(names).toContain('utils')
  })

  it('infers purpose from directory name', () => {
    const boundaries = inferModuleBoundaries(['src/commands/a.ts'])
    expect(boundaries[0]!.intendedPurpose).toContain('CLI command')
  })

  it('infers default purpose for unknown modules', () => {
    const boundaries = inferModuleBoundaries(['src/custom/a.ts'])
    expect(boundaries[0]!.intendedPurpose).toContain('custom module')
  })

  it('handles empty file list', () => {
    expect(inferModuleBoundaries([])).toEqual([])
  })

  it('skips files without src directory', () => {
    const boundaries = inferModuleBoundaries(['package.json'])
    expect(boundaries).toEqual([])
  })

  it('groups files by module', () => {
    const files = ['src/commands/a.ts', 'src/commands/b.ts', 'src/core/c.ts']
    const boundaries = inferModuleBoundaries(files)
    expect(boundaries.length).toBe(2)
  })
})

// ─── inferAllowedDependencies ─────────────────────────────────────────────────

describe('inferAllowedDependencies', () => {
  it('commands can depend on core and utils', () => {
    const allowed = inferAllowedDependencies('commands', ['commands', 'core', 'utils'])
    expect(allowed).toContain('core')
    expect(allowed).toContain('utils')
    expect(allowed).not.toContain('commands')
  })

  it('utils should not depend on commands or core', () => {
    const allowed = inferAllowedDependencies('utils', ['commands', 'core', 'utils'])
    expect(allowed).not.toContain('commands')
    expect(allowed).not.toContain('core')
  })

  it('core can depend on utils but not commands', () => {
    const allowed = inferAllowedDependencies('core', ['commands', 'core', 'utils'])
    expect(allowed).toContain('utils')
    expect(allowed).not.toContain('commands')
  })

  it('handles single module', () => {
    expect(inferAllowedDependencies('utils', ['utils'])).toEqual([])
  })
})

// ─── computeActualDependencies ────────────────────────────────────────────────

describe('computeActualDependencies', () => {
  it('extracts dependencies from imports', () => {
    const boundary: ModuleBoundary = { name: 'commands', intendedPurpose: '', allowedDependencies: ['core', 'utils'], actualDependencies: [], violations: [] }
    const files = ['src/commands/app.ts']
    const contents = ["import { foo } from '../core/file.js'"]
    const deps = computeActualDependencies(boundary, files, contents)
    expect(deps).toContain('core')
  })

  it('returns empty for no matching files', () => {
    const boundary: ModuleBoundary = { name: 'commands', intendedPurpose: '', allowedDependencies: [], actualDependencies: [], violations: [] }
    const deps = computeActualDependencies(boundary, ['src/core/a.ts'], ['import x'])
    expect(deps).toEqual([])
  })

  it('ignores same-module imports', () => {
    const boundary: ModuleBoundary = { name: 'commands', intendedPurpose: '', allowedDependencies: [], actualDependencies: [], violations: [] }
    const files = ['src/commands/a.ts']
    const contents = ["import { x } from './b.js'"]
    const deps = computeActualDependencies(boundary, files, contents)
    expect(deps).toEqual([])
  })

  it('extracts multiple dependencies', () => {
    const boundary: ModuleBoundary = { name: 'commands', intendedPurpose: '', allowedDependencies: [], actualDependencies: [], violations: [] }
    const files = ['src/commands/a.ts']
    const contents = ["import { x } from '../core/a.js'\nimport { y } from '../utils/b.js'"]
    const deps = computeActualDependencies(boundary, files, contents)
    expect(deps).toContain('core')
    expect(deps).toContain('utils')
  })
})

// ─── detectBoundaryViolations ─────────────────────────────────────────────────

describe('detectBoundaryViolations', () => {
  it('detects cross-layer violations', () => {
    const boundaries: ModuleBoundary[] = [
      { name: 'utils', intendedPurpose: '', allowedDependencies: [], actualDependencies: ['commands'], violations: [] },
      { name: 'commands', intendedPurpose: '', allowedDependencies: ['utils'], actualDependencies: [], violations: [] },
    ]
    const violations = detectBoundaryViolations(boundaries)
    expect(violations.some((v) => v.type === 'cross-layer')).toBe(true)
  })

  it('detects circular dependencies', () => {
    const boundaries: ModuleBoundary[] = [
      { name: 'commands', intendedPurpose: '', allowedDependencies: ['core'], actualDependencies: ['core'], violations: [] },
      { name: 'core', intendedPurpose: '', allowedDependencies: [], actualDependencies: ['commands'], violations: [] },
    ]
    const violations = detectBoundaryViolations(boundaries)
    expect(violations.some((v) => v.type === 'circular')).toBe(true)
  })

  it('returns empty for clean boundaries', () => {
    const boundaries: ModuleBoundary[] = [
      { name: 'commands', intendedPurpose: '', allowedDependencies: ['utils'], actualDependencies: ['utils'], violations: [] },
      { name: 'utils', intendedPurpose: '', allowedDependencies: [], actualDependencies: [], violations: [] },
    ]
    const violations = detectBoundaryViolations(boundaries)
    expect(violations).toEqual([])
  })

  it('adds violations to boundary objects', () => {
    const boundaries: ModuleBoundary[] = [
      { name: 'utils', intendedPurpose: '', allowedDependencies: [], actualDependencies: ['commands'], violations: [] },
      { name: 'commands', intendedPurpose: '', allowedDependencies: [], actualDependencies: [], violations: [] },
    ]
    detectBoundaryViolations(boundaries)
    expect(boundaries[0]!.violations.length).toBeGreaterThan(0)
  })

  it('circular violations are critical', () => {
    const boundaries: ModuleBoundary[] = [
      { name: 'commands', intendedPurpose: '', allowedDependencies: ['core'], actualDependencies: ['core'], violations: [] },
      { name: 'core', intendedPurpose: '', allowedDependencies: [], actualDependencies: ['commands'], violations: [] },
    ]
    const violations = detectBoundaryViolations(boundaries)
    const circular = violations.find((v) => v.type === 'circular')
    expect(circular!.severity).toBe('critical')
  })
})

// ─── computeDriftIndicators ───────────────────────────────────────────────────

describe('computeDriftIndicators', () => {
  it('returns empty for no violations', () => {
    const indicators = computeDriftIndicators([], [])
    expect(indicators).toEqual([])
  })

  it('creates boundary-violation indicator for cross-layer', () => {
    const violations: BoundaryViolation[] = [
      { from: 'utils', to: 'commands', type: 'cross-layer', severity: 'warning', description: 'test', files: [] },
    ]
    const indicators = computeDriftIndicators(violations, [])
    expect(indicators.some((i) => i.type === 'boundary-violation')).toBe(true)
  })

  it('creates boundary-violation indicator for circular', () => {
    const violations: BoundaryViolation[] = [
      { from: 'a', to: 'b', type: 'circular', severity: 'critical', description: 'test', files: [] },
    ]
    const indicators = computeDriftIndicators(violations, [])
    expect(indicators.some((i) => i.description.includes('circular'))).toBe(true)
  })

  it('creates coupling-drift for over-connected modules', () => {
    const boundaries: ModuleBoundary[] = [
      { name: 'commands', intendedPurpose: '', allowedDependencies: ['utils'], actualDependencies: ['core', 'utils', 'services', 'types', 'middleware', 'handlers'], violations: [] },
    ]
    const indicators = computeDriftIndicators([], boundaries)
    expect(indicators.some((i) => i.type === 'coupling-drift')).toBe(true)
  })

  it('sets severity based on count', () => {
    const violations: BoundaryViolation[] = Array(6).fill({ from: 'a', to: 'b', type: 'cross-layer', severity: 'warning', description: 't', files: [] }) as BoundaryViolation[]
    const indicators = computeDriftIndicators(violations, [])
    const boundary = indicators.find((i) => i.type === 'boundary-violation' && i.description.includes('cross-layer'))
    expect(boundary!.severity).toBe('high')
  })
})

// ─── computeDriftScore ────────────────────────────────────────────────────────

describe('computeDriftScore', () => {
  it('returns 0 for no violations or indicators', () => {
    expect(computeDriftScore([], [])).toBe(0)
  })

  it('scores circular violations highest', () => {
    const violations: BoundaryViolation[] = [
      { from: 'a', to: 'b', type: 'circular', severity: 'critical', description: 'test', files: [] },
    ]
    const score = computeDriftScore(violations, [])
    expect(score).toBeGreaterThanOrEqual(15)
  })

  it('scores cross-layer violations', () => {
    const violations: BoundaryViolation[] = [
      { from: 'a', to: 'b', type: 'cross-layer', severity: 'warning', description: 'test', files: [] },
    ]
    const score = computeDriftScore(violations, [])
    expect(score).toBeGreaterThanOrEqual(8)
  })

  it('factors in indicator severity', () => {
    const indicators: DriftIndicator[] = [
      { type: 'boundary-violation', description: '', before: 0, after: 1, drift: 1, severity: 'high' },
    ]
    const score = computeDriftScore([], indicators)
    expect(score).toBeGreaterThanOrEqual(10)
  })

  it('caps at 100', () => {
    const violations = Array(20).fill({ from: 'a', to: 'b', type: 'circular', severity: 'critical', description: 't', files: [] }) as BoundaryViolation[]
    expect(computeDriftScore(violations, [])).toBe(100)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns clean message for no issues', () => {
    const recs = generateRecommendations([], [])
    expect(recs).toEqual(['Architecture is well-structured. No significant drift detected.'])
  })

  it('recommends breaking circular dependencies', () => {
    const violations: BoundaryViolation[] = [
      { from: 'a', to: 'b', type: 'circular', severity: 'critical', description: 'test', files: [] },
    ]
    const recs = generateRecommendations(violations, [])
    expect(recs.some((r) => r.includes('circular') && r.includes('a') && r.includes('b'))).toBe(true)
  })

  it('recommends fixing cross-layer violations', () => {
    const violations: BoundaryViolation[] = [
      { from: 'a', to: 'b', type: 'cross-layer', severity: 'warning', description: 'test', files: [] },
    ]
    const recs = generateRecommendations(violations, [])
    expect(recs.some((r) => r.includes('cross-layer'))).toBe(true)
  })

  it('recommends reducing coupling', () => {
    const indicators: DriftIndicator[] = [
      { type: 'coupling-drift', description: 'commands depends on too many', before: 1, after: 6, drift: 5, severity: 'high' },
    ]
    const recs = generateRecommendations([], indicators)
    expect(recs.some((r) => r.includes('coupling'))).toBe(true)
  })
})

// ─── buildDriftResult ─────────────────────────────────────────────────────────

describe('buildDriftResult', () => {
  it('returns empty result for no files', () => {
    const result = buildDriftResult([], [])
    expect(result.boundaries).toEqual([])
    expect(result.stats.totalModules).toBe(0)
  })

  it('analyzes single module', () => {
    const result = buildDriftResult(['src/commands/a.ts'], ['const x = 1'])
    expect(result.stats.totalModules).toBe(1)
    expect(result.boundaries[0]!.name).toBe('commands')
  })

  it('analyzes multiple modules', () => {
    const result = buildDriftResult(
      ['src/commands/a.ts', 'src/core/b.ts', 'src/utils/c.ts'],
      ['const x = 1', 'const y = 2', 'const z = 3'],
    )
    expect(result.stats.totalModules).toBe(3)
  })

  it('computes drift score', () => {
    const result = buildDriftResult(
      ['src/commands/a.ts', 'src/utils/b.ts'],
      ["import { x } from '../utils/b.js'", 'const x = 1'],
    )
    expect(result.stats.driftScore).toBeGreaterThanOrEqual(0)
  })

  it('computes drift trend', () => {
    const result = buildDriftResult(['src/commands/a.ts'], ['const x = 1'])
    expect(['improving', 'stable', 'worsening']).toContain(result.stats.driftTrend)
  })

  it('finds most drifted module', () => {
    const result = buildDriftResult(
      ['src/utils/a.ts', 'src/commands/b.ts'],
      ["import { x } from '../commands/b.js'", 'const x = 1'],
    )
    expect(result.stats.mostDriftedModule).toBeTruthy()
  })

  it('finds healthiest module', () => {
    const result = buildDriftResult(['src/commands/a.ts'], ['const x = 1'])
    expect(result.stats.healthiestModule).toBe('commands')
  })

  it('generates recommendations', () => {
    const result = buildDriftResult(['src/commands/a.ts'], ['const x = 1'])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('detects violations from actual imports', () => {
    const result = buildDriftResult(
      ['src/utils/a.ts', 'src/commands/b.ts'],
      ["import { x } from '../commands/b.js'", 'const x = 1'],
    )
    expect(result.violations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatBoundaryMap', () => {
  it('shows message for no modules', () => {
    const output = formatBoundaryMap([])
    expect(output).toContain('No modules')
  })

  it('renders boundaries with check icon', () => {
    const boundaries: ModuleBoundary[] = [
      { name: 'commands', intendedPurpose: 'CLI commands', allowedDependencies: [], actualDependencies: [], violations: [] },
    ]
    const output = formatBoundaryMap(boundaries)
    expect(output).toContain('commands')
    expect(output).toContain('✓')
  })

  it('renders violations with cross icon', () => {
    const boundaries: ModuleBoundary[] = [
      { name: 'utils', intendedPurpose: 'Utils', allowedDependencies: [], actualDependencies: ['commands'], violations: [
        { from: 'utils', to: 'commands', type: 'cross-layer', severity: 'warning', description: 'violation', files: [] },
      ] },
    ]
    const output = formatBoundaryMap(boundaries)
    expect(output).toContain('✕')
  })
})

describe('formatViolations', () => {
  it('shows clean message for no violations', () => {
    expect(formatViolations([])).toContain('No boundary violations')
  })

  it('renders violations', () => {
    const violations: BoundaryViolation[] = [
      { from: 'a', to: 'b', type: 'cross-layer', severity: 'warning', description: 'test desc', files: [] },
    ]
    const output = formatViolations(violations)
    expect(output).toContain('cross-layer')
    expect(output).toContain('a → b')
  })
})

describe('formatDriftIndicators', () => {
  it('returns empty for no indicators', () => {
    expect(formatDriftIndicators([])).toBe('')
  })

  it('renders indicators', () => {
    const indicators: DriftIndicator[] = [
      { type: 'boundary-violation', description: 'test', before: 0, after: 1, drift: 1, severity: 'medium' },
    ]
    const output = formatDriftIndicators(indicators)
    expect(output).toContain('test')
    expect(output).toContain('MEDIUM')
  })
})

describe('formatDriftGauge', () => {
  it('renders gauge with score', () => {
    const output = formatDriftGauge(35)
    expect(output).toContain('35/100')
    expect(output).toContain('█')
    expect(output).toContain('░')
  })

  it('renders zero score', () => {
    const output = formatDriftGauge(0)
    expect(output).toContain('0/100')
  })
})

describe('formatDriftStatsLine', () => {
  it('renders stats', () => {
    const stats: DriftStats = { totalModules: 5, totalBoundaries: 5, violationCount: 3, driftScore: 35, driftTrend: 'stable', mostDriftedModule: 'utils', healthiestModule: 'types' }
    const output = formatDriftStatsLine(stats)
    expect(output).toContain('Modules: 5')
    expect(output).toContain('Drift: 35/100')
    expect(output).toContain('stable')
  })
})

describe('formatDriftRecommendations', () => {
  it('returns empty for no recs', () => {
    expect(formatDriftRecommendations([])).toBe('')
  })

  it('renders recommendations', () => {
    const output = formatDriftRecommendations(['Break circular deps'])
    expect(output).toContain('Break circular deps')
  })
})

describe('formatDriftResultTable', () => {
  it('renders full result', () => {
    const result = buildDriftResult(['src/commands/a.ts'], ['const x = 1'])
    const output = formatDriftResultTable(result, false)
    expect(output).toContain('Drift Score')
    expect(output).toContain('commands')
  })
})

describe('formatDriftJson', () => {
  it('returns valid JSON', () => {
    const result = buildDriftResult(['src/commands/a.ts'], ['const x = 1'])
    const output = formatDriftJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toHaveProperty('boundaries')
    expect(parsed).toHaveProperty('stats')
  })
})

describe('formatDriftCsv', () => {
  it('includes header', () => {
    const result = buildDriftResult([], [])
    const output = formatDriftCsv(result)
    expect(output).toContain('from,to,type,severity')
  })

  it('includes violation rows', () => {
    const result = buildDriftResult(
      ['src/utils/a.ts', 'src/commands/b.ts'],
      ["import { x } from '../commands/b.js'", 'const x = 1'],
    )
    if (result.violations.length > 0) {
      const output = formatDriftCsv(result)
      const lines = output.split('\n')
      expect(lines.length).toBeGreaterThan(1)
    }
  })
})
