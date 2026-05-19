import { describe, it, expect } from 'vitest'

import {
  getLayer,
  discoverModules,
  inferBoundaryRules,
  extractImports,
  resolvePath,
  getModuleForFile,
  checkBoundaries,
  detectBoundaryViolation,
  generateSuggestion,
  computeModuleHealth,
  computeComplianceScore,
  generateRecommendations,
  buildBoundariesResult,
  type BoundaryCheck,
  type BoundaryViolation,
  type BoundariesStats,
  type ModuleDefinition,
} from '../src/commands/boundaries-helpers.js'

import {
  formatBoundaryMatrix,
  formatViolationsTable,
  formatModuleHealth,
  formatComplianceGauge,
  formatBoundariesStatsLine,
  formatBoundariesRecommendations,
  formatBoundariesResultTable,
  formatBoundariesJson,
  formatBoundariesCsv,
} from '../src/commands/boundaries-format-helpers.js'

// ─── getLayer ─────────────────────────────────────────────────────────────────

describe('getLayer', () => {
  it('returns presentation for commands', () => {
    expect(getLayer('commands')).toBe('presentation')
  })

  it('returns business for core', () => {
    expect(getLayer('core')).toBe('business')
  })

  it('returns infrastructure for utils', () => {
    expect(getLayer('utils')).toBe('infrastructure')
  })

  it('returns foundation for types', () => {
    expect(getLayer('types')).toBe('foundation')
  })

  it('returns default business for unknown', () => {
    expect(getLayer('custom')).toBe('business')
  })
})

// ─── discoverModules ──────────────────────────────────────────────────────────

describe('discoverModules', () => {
  it('groups files by directory', () => {
    const files = ['src/commands/a.ts', 'src/commands/b.ts', 'src/core/c.ts']
    const contents = ['export function a() {}', 'const x = 1', 'export function c() {}']
    const modules = discoverModules(files, contents)
    expect(modules.length).toBe(2)
    const names = modules.map((m) => m.name)
    expect(names).toContain('commands')
    expect(names).toContain('core')
  })

  it('counts total lines', () => {
    const files = ['src/commands/a.ts']
    const contents = ['line1\nline2\nline3']
    const modules = discoverModules(files, contents)
    expect(modules[0]!.totalLines).toBe(3)
  })

  it('extracts exported symbols', () => {
    const files = ['src/core/a.ts']
    const contents = ['export function foo() {}\nexport const bar = 1\nexport interface Baz {}']
    const modules = discoverModules(files, contents)
    expect(modules[0]!.exportedSymbols).toContain('foo')
    expect(modules[0]!.exportedSymbols).toContain('bar')
    expect(modules[0]!.exportedSymbols).toContain('Baz')
  })

  it('infers layer', () => {
    const modules = discoverModules(['src/commands/a.ts'], ['x'])
    expect(modules[0]!.layer).toBe('presentation')
  })

  it('handles empty files', () => {
    expect(discoverModules([], [])).toEqual([])
  })

  it('skips files without src', () => {
    const modules = discoverModules(['package.json'], ['{}'])
    expect(modules).toEqual([])
  })
})

// ─── inferBoundaryRules ───────────────────────────────────────────────────────

describe('inferBoundaryRules', () => {
  const makeModule = (name: string, layer: string): ModuleDefinition => ({
    name, path: `src/${name}`, files: [], totalLines: 0, exportedSymbols: [], layer,
  })

  it('allows commands to import from core', () => {
    const rules = inferBoundaryRules([makeModule('commands', 'presentation'), makeModule('core', 'business')])
    const rule = rules.find((r) => r.from === 'commands' && r.to === 'core')
    expect(rule!.allowed).toBe(true)
  })

  it('disallows core from importing commands', () => {
    const rules = inferBoundaryRules([makeModule('commands', 'presentation'), makeModule('core', 'business')])
    const rule = rules.find((r) => r.from === 'core' && r.to === 'commands')
    expect(rule!.allowed).toBe(false)
  })

  it('disallows utils from importing core', () => {
    const rules = inferBoundaryRules([makeModule('core', 'business'), makeModule('utils', 'infrastructure')])
    const rule = rules.find((r) => r.from === 'utils' && r.to === 'core')
    expect(rule!.allowed).toBe(false)
  })

  it('discourages same-layer presentation imports', () => {
    const rules = inferBoundaryRules([makeModule('commands', 'presentation'), makeModule('handlers', 'presentation')])
    const rule = rules.find((r) => r.from === 'commands' && r.to === 'handlers')
    expect(rule!.allowed).toBe(false)
    expect(rule!.reason).toContain('discouraged')
  })

  it('generates rules for all pairs', () => {
    const modules = [makeModule('a', 'presentation'), makeModule('b', 'business'), makeModule('c', 'infrastructure')]
    const rules = inferBoundaryRules(modules)
    expect(rules.length).toBe(6)
  })
})

// ─── resolvePath ──────────────────────────────────────────────────────────────

describe('resolvePath', () => {
  const fileSet = new Set(['src/core/file.ts', 'src/utils/helpers.ts'])

  it('resolves sibling', () => {
    expect(resolvePath('./file', ['src', 'core'], fileSet)).toBe('src/core/file.ts')
  })

  it('resolves parent', () => {
    expect(resolvePath('../core/file', ['src', 'commands'], fileSet)).toBe('src/core/file.ts')
  })

  it('strips .js extension', () => {
    expect(resolvePath('./file.js', ['src', 'core'], fileSet)).toBe('src/core/file.ts')
  })

  it('returns null for missing', () => {
    expect(resolvePath('./missing', ['src'], fileSet)).toBeNull()
  })
})

// ─── extractImports ───────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts relative imports', () => {
    const fileSet = new Set(['src/commands/a.ts', 'src/core/b.ts'])
    const imports = extractImports('src/commands/a.ts', "import { x } from '../core/b.js'", fileSet)
    expect(imports).toEqual(['src/core/b.ts'])
  })

  it('ignores external imports', () => {
    const fileSet = new Set(['src/commands/a.ts'])
    const imports = extractImports('src/commands/a.ts', "import chalk from 'chalk'", fileSet)
    expect(imports).toEqual([])
  })

  it('handles no imports', () => {
    const fileSet = new Set(['src/commands/a.ts'])
    const imports = extractImports('src/commands/a.ts', 'const x = 1', fileSet)
    expect(imports).toEqual([])
  })
})

// ─── getModuleForFile ─────────────────────────────────────────────────────────

describe('getModuleForFile', () => {
  it('returns module name', () => {
    expect(getModuleForFile('src/commands/a.ts')).toBe('commands')
  })

  it('returns empty for no src', () => {
    expect(getModuleForFile('package.json')).toBe('')
  })
})

// ─── detectBoundaryViolation ──────────────────────────────────────────────────

describe('detectBoundaryViolation', () => {
  it('returns null for allowed check', () => {
    const check: BoundaryCheck = { source: 'commands', target: 'core', sourceFile: 'a.ts', targetFile: 'b.ts', importedSymbols: ['x'], allowed: true, rule: 'ok' }
    expect(detectBoundaryViolation(check)).toBeNull()
  })

  it('returns error for disallowed check', () => {
    const check: BoundaryCheck = { source: 'core', target: 'commands', sourceFile: 'a.ts', targetFile: 'b.ts', importedSymbols: ['x'], allowed: false, rule: 'should not depend' }
    const v = detectBoundaryViolation(check)
    expect(v).not.toBeNull()
    expect(v!.severity).toBe('error')
  })

  it('returns warning for discouraged check', () => {
    const check: BoundaryCheck = { source: 'commands', target: 'handlers', sourceFile: 'a.ts', targetFile: 'b.ts', importedSymbols: ['x'], allowed: false, rule: 'discouraged' }
    const v = detectBoundaryViolation(check)
    expect(v!.severity).toBe('warning')
  })
})

// ─── generateSuggestion ───────────────────────────────────────────────────────

describe('generateSuggestion', () => {
  it('suggests moving logic for upward import', () => {
    const suggestion = generateSuggestion('core', 'commands')
    expect(suggestion).toContain('Move shared logic')
  })

  it('suggests interface for other violations', () => {
    const suggestion = generateSuggestion('commands', 'handlers')
    expect(suggestion.length).toBeGreaterThan(0)
  })
})

// ─── computeModuleHealth ──────────────────────────────────────────────────────

describe('computeModuleHealth', () => {
  const makeModule = (name: string): ModuleDefinition => ({ name, path: `src/${name}`, files: [], totalLines: 0, exportedSymbols: [], layer: 'business' })

  it('marks healthy module', () => {
    const health = computeModuleHealth([makeModule('a')], [])
    expect(health[0]!.status).toBe('healthy')
    expect(health[0]!.compliance).toBe(100)
  })

  it('marks warning with some violations', () => {
    const v: BoundaryViolation = { source: 'a', target: 'b', sourceFile: '', targetFile: '', importedSymbols: [], severity: 'error', reason: '', suggestion: '' }
    const v2: BoundaryViolation = { source: 'a', target: 'c', sourceFile: '', targetFile: '', importedSymbols: [], severity: 'error', reason: '', suggestion: '' }
    const health = computeModuleHealth([makeModule('a')], [v, v2])
    expect(health[0]!.status).toBe('warning')
    expect(health[0]!.violations).toBe(2)
  })

  it('marks critical with many violations', () => {
    const vs = Array(5).fill({ source: 'a', target: 'b', sourceFile: '', targetFile: '', importedSymbols: [], severity: 'error', reason: '', suggestion: '' }) as BoundaryViolation[]
    const health = computeModuleHealth([makeModule('a')], vs)
    expect(health[0]!.status).toBe('critical')
  })
})

// ─── computeComplianceScore ───────────────────────────────────────────────────

describe('computeComplianceScore', () => {
  it('returns 100 for no checks', () => {
    expect(computeComplianceScore(0, 0)).toBe(100)
  })

  it('returns 100 for no violations', () => {
    expect(computeComplianceScore(10, 0)).toBe(100)
  })

  it('computes score correctly', () => {
    expect(computeComplianceScore(10, 2)).toBe(80)
  })

  it('never goes below 0', () => {
    expect(computeComplianceScore(5, 10)).toBe(0)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: BoundariesStats = { totalModules: 3, totalChecks: 10, violationsCount: 0, complianceScore: 100, compliantModules: 3, nonCompliantModules: 0, mostViolations: 'none' }

  it('returns clean message for no violations', () => {
    const recs = generateRecommendations([], emptyStats)
    expect(recs[0]).toContain('No violations')
  })

  it('recommends fixing errors', () => {
    const v: BoundaryViolation = { source: 'core', target: 'commands', sourceFile: '', targetFile: '', importedSymbols: [], severity: 'error', reason: '', suggestion: '' }
    const stats = { ...emptyStats, violationsCount: 1 }
    const recs = generateRecommendations([v], stats)
    expect(recs.some((r) => r.includes('error'))).toBe(true)
  })

  it('recommends reviewing warnings', () => {
    const v: BoundaryViolation = { source: 'commands', target: 'handlers', sourceFile: '', targetFile: '', importedSymbols: [], severity: 'warning', reason: '', suggestion: '' }
    const stats = { ...emptyStats, violationsCount: 1 }
    const recs = generateRecommendations([v], stats)
    expect(recs.some((r) => r.includes('warning'))).toBe(true)
  })

  it('identifies worst module', () => {
    const vs: BoundaryViolation[] = [
      { source: 'a', target: 'b', sourceFile: '', targetFile: '', importedSymbols: [], severity: 'error', reason: '', suggestion: '' },
      { source: 'a', target: 'c', sourceFile: '', targetFile: '', importedSymbols: [], severity: 'error', reason: '', suggestion: '' },
    ]
    const stats = { ...emptyStats, violationsCount: 2 }
    const recs = generateRecommendations(vs, stats)
    expect(recs.some((r) => r.includes('a —'))).toBe(true)
  })
})

// ─── buildBoundariesResult ────────────────────────────────────────────────────

describe('buildBoundariesResult', () => {
  it('returns empty for no files', () => {
    const result = buildBoundariesResult([], [])
    expect(result.modules).toEqual([])
    expect(result.stats.totalModules).toBe(0)
  })

  it('discovers modules', () => {
    const result = buildBoundariesResult(['src/commands/a.ts', 'src/core/b.ts'], ['const x = 1', 'const y = 2'])
    expect(result.modules.length).toBe(2)
  })

  it('generates rules', () => {
    const result = buildBoundariesResult(['src/commands/a.ts', 'src/core/b.ts'], ['x', 'y'])
    expect(result.rules.length).toBeGreaterThan(0)
  })

  it('detects violations from imports', () => {
    const result = buildBoundariesResult(
      ['src/core/a.ts', 'src/commands/b.ts'],
      ["import { x } from '../commands/b.js'", 'const x = 1'],
    )
    expect(result.violations.length).toBeGreaterThan(0)
    expect(result.violations[0]!.severity).toBe('error')
  })

  it('allows valid imports', () => {
    const result = buildBoundariesResult(
      ['src/commands/a.ts', 'src/core/b.ts'],
      ["import { x } from '../core/b.js'", 'const x = 1'],
    )
    expect(result.violations.length).toBe(0)
  })

  it('skips test files', () => {
    const result = buildBoundariesResult(
      ['src/core/a.test.ts', 'src/commands/b.ts'],
      ["import { x } from '../commands/b.js'", 'const x = 1'],
    )
    expect(result.violations.length).toBe(0)
  })

  it('computes compliance score', () => {
    const result = buildBoundariesResult(['src/commands/a.ts', 'src/core/b.ts'], ['x', 'y'])
    expect(result.stats.complianceScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.complianceScore).toBeLessThanOrEqual(100)
  })

  it('computes module health', () => {
    const result = buildBoundariesResult(['src/commands/a.ts'], ['x'])
    expect(result.moduleHealth.length).toBe(1)
  })

  it('generates recommendations', () => {
    const result = buildBoundariesResult(['src/commands/a.ts'], ['x'])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const result = buildBoundariesResult(
      ['src/commands/a.ts', 'src/core/b.ts'],
      ["import { x } from '../core/b.js'", 'const x = 1'],
    )
    expect(result.stats.totalModules).toBe(2)
    expect(result.stats.totalChecks).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatBoundaryMatrix', () => {
  it('shows message for no modules', () => {
    expect(formatBoundaryMatrix([], [])).toContain('No modules')
  })

  it('renders matrix', () => {
    const result = buildBoundariesResult(['src/commands/a.ts', 'src/core/b.ts'], ['x', 'y'])
    const output = formatBoundaryMatrix(result.modules, result.checks)
    expect(output).toContain('Boundary Matrix')
    expect(output).toContain('commands')
  })
})

describe('formatViolationsTable', () => {
  it('shows clean message for no violations', () => {
    expect(formatViolationsTable([])).toContain('No boundary violations')
  })

  it('renders violations', () => {
    const result = buildBoundariesResult(
      ['src/core/a.ts', 'src/commands/b.ts'],
      ["import { x } from '../commands/b.js'", 'x'],
    )
    const output = formatViolationsTable(result.violations)
    expect(output).toContain('core')
    expect(output).toContain('commands')
  })
})

describe('formatModuleHealth', () => {
  it('returns empty for no health', () => {
    expect(formatModuleHealth([])).toBe('')
  })

  it('renders health bars', () => {
    const result = buildBoundariesResult(['src/commands/a.ts'], ['x'])
    const output = formatModuleHealth(result.moduleHealth)
    expect(output).toContain('commands')
    expect(output).toContain('█')
  })
})

describe('formatComplianceGauge', () => {
  it('renders gauge', () => {
    const output = formatComplianceGauge(85)
    expect(output).toContain('85/100')
    expect(output).toContain('█')
    expect(output).toContain('░')
  })
})

describe('formatBoundariesStatsLine', () => {
  it('renders stats', () => {
    const stats: BoundariesStats = { totalModules: 5, totalChecks: 20, violationsCount: 3, complianceScore: 85, compliantModules: 4, nonCompliantModules: 1, mostViolations: 'core' }
    const output = formatBoundariesStatsLine(stats)
    expect(output).toContain('Modules: 5')
    expect(output).toContain('Compliance: 85/100')
  })
})

describe('formatBoundariesRecommendations', () => {
  it('returns empty for no recs', () => {
    expect(formatBoundariesRecommendations([])).toBe('')
  })

  it('renders recommendations', () => {
    const output = formatBoundariesRecommendations(['Fix violations'])
    expect(output).toContain('Fix violations')
  })
})

describe('formatBoundariesResultTable', () => {
  it('renders full result', () => {
    const result = buildBoundariesResult(['src/commands/a.ts'], ['x'])
    const output = formatBoundariesResultTable(result, false)
    expect(output).toContain('Compliance')
    expect(output).toContain('Module Health')
  })
})

describe('formatBoundariesJson', () => {
  it('returns valid JSON', () => {
    const result = buildBoundariesResult(['src/commands/a.ts'], ['x'])
    const output = formatBoundariesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toHaveProperty('modules')
    expect(parsed).toHaveProperty('stats')
  })
})

describe('formatBoundariesCsv', () => {
  it('includes header', () => {
    const result = buildBoundariesResult([], [])
    const output = formatBoundariesCsv(result)
    expect(output).toContain('source,target,sourceFile')
  })

  it('includes violation rows', () => {
    const result = buildBoundariesResult(
      ['src/core/a.ts', 'src/commands/b.ts'],
      ["import { x } from '../commands/b.js'", 'x'],
    )
    if (result.violations.length > 0) {
      const output = formatBoundariesCsv(result)
      const lines = output.split('\n')
      expect(lines.length).toBeGreaterThan(1)
    }
  })
})
