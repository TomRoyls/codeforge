import { describe, expect, it } from 'vitest'

import {
  buildKaleidoscopeScopeResult,
  classifyDeclarationVisibility,
  classifyScopeHealth,
  computeKaleidoscopeSymmetry,
  computePatternScore,
  computeScopeHygiene,
  detectScopeIssues,
  extractDeclarations,
  generateScopeRecommendations,
  identifyScopePattern,
  parseScopeLayers,
  type KaleidoscopeScopeOptions,
  type KaleidoscopeScopeResult,
  type KaleidoscopeScopeStats,
  type ScopeDeclaration,
  type ScopeFile,
  type ScopeIssue,
  type ScopeLayer,
  type ScopePatternName,
} from '../src/commands/kaleidoscope-scope-helpers.js'

import {
  formatHealthLabel,
  formatIssuesTable,
  formatKaleidoscopeScopeJson,
  formatKaleidoscopeScopeStats,
  formatKaleidoscopeScopeTable,
  formatPatterns,
  formatPatternLabel,
  formatRecommendations,
  formatScopeGauge,
  formatScopeTree,
  formatSeverity,
} from '../src/commands/kaleidoscope-scope-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const CLEAN_CONST = `const x = 1
const y = 2
export const z = x + y
`

const VAR_HEAVY = `var a = 1
var b = 2
var c = a + b
function sum() {
  var d = a + b
  return d
}
`

const SHADOW_CONTENT = `const x = 10
function foo() {
  const x = 20
  return x
}
`

const NESTED_FUNCTION = `function outer() {
  const a = 1
  function inner() {
    const b = 2
    return a + b
  }
  return inner()
}
`

const CLASS_CONTENT = `export class Calculator {
  private add(a: number, b: number): number {
    return a + b
  }
  public subtract(a: number, b: number): number {
    return a - b
  }
}
`

const MODERN_TS = `import { readFile } from 'fs'
import type { Config } from './types'

export const VERSION = '1.0.0'

export function loadConfig(path: string): Config {
  const content = readFile(path, 'utf8')
  const parsed = JSON.parse(content)
  return parsed
}

export class ConfigManager {
  private config: Config | null = null

  load(path: string): void {
    this.config = loadConfig(path)
  }
}
`

const UNUSED_CONTENT = `const used = 1
const unused1 = 2
const unused2 = 3
export const exported = used
`

const GLOBAL_LEAK = `function foo() {
  var x = 1
  if (true) {
    var y = 2
  }
  return x + y
}
`

const IMPLICIT_GLOBAL = `function setup() {
  config = { port: 3000 }
  return config
}
`

const DEEP_NESTED = `function level0() {
  if (true) {
    for (let i = 0; i < 10; i++) {
      if (i > 5) {
        try {
          const x = i
        } catch (e) {
          const y = 0
        }
      }
    }
  }
}
`

const MODULE_EXPORTS = `export const A = 'a'
export const B = 'b'
export function hello() { return 'world' }
export class Foo {}
export type Bar = { x: number }
export enum Baz { X, Y }
`

// ─── Parse Scope Layers ────────────────────────────────────────────────────────

describe('parseScopeLayers', () => {
  it('returns empty for empty content', () => {
    expect(parseScopeLayers(EMPTY_CONTENT)).toEqual([])
  })

  it('returns module layer for simple content', () => {
    const layers = parseScopeLayers('const x = 1')
    expect(layers.length).toBeGreaterThanOrEqual(1)
    expect(layers[0].type).toBe('module')
    expect(layers[0].depth).toBe(0)
  })

  it('detects function layers', () => {
    const layers = parseScopeLayers('function foo() {}')
    const fnLayers = layers.filter(l => l.type === 'function')
    expect(fnLayers.length).toBeGreaterThanOrEqual(1)
  })

  it('detects class layers', () => {
    const layers = parseScopeLayers('class Foo {}')
    const classLayers = layers.filter(l => l.type === 'class')
    expect(classLayers.length).toBeGreaterThanOrEqual(1)
  })

  it('detects nested function layers', () => {
    const layers = parseScopeLayers(NESTED_FUNCTION)
    const fnLayers = layers.filter(l => l.type === 'function')
    expect(fnLayers.length).toBeGreaterThanOrEqual(2)
  })

  it('tracks increasing depth', () => {
    const layers = parseScopeLayers(DEEP_NESTED)
    const depths = layers.map(l => l.depth)
    const maxDepth = Math.max(...depths)
    expect(maxDepth).toBeGreaterThan(0)
  })

  it('detects loop layers', () => {
    const content = 'for (let i = 0; i < 10; i++) {}'
    const layers = parseScopeLayers(content)
    expect(layers.some(l => l.type === 'loop')).toBe(true)
  })
})

// ─── Extract Declarations ──────────────────────────────────────────────────────

describe('extractDeclarations', () => {
  it('returns empty for empty content', () => {
    const layers = parseScopeLayers(EMPTY_CONTENT)
    expect(extractDeclarations(EMPTY_CONTENT, layers)).toEqual([])
  })

  it('extracts const declarations', () => {
    const layers = parseScopeLayers(CLEAN_CONST)
    const decls = extractDeclarations(CLEAN_CONST, layers)
    expect(decls.some(d => d.kind === 'const' && d.name === 'x')).toBe(true)
    expect(decls.some(d => d.kind === 'const' && d.name === 'y')).toBe(true)
  })

  it('extracts var declarations', () => {
    const layers = parseScopeLayers(VAR_HEAVY)
    const decls = extractDeclarations(VAR_HEAVY, layers)
    const varDecls = decls.filter(d => d.kind === 'var')
    expect(varDecls.length).toBeGreaterThanOrEqual(3)
  })

  it('extracts function declarations', () => {
    const layers = parseScopeLayers(VAR_HEAVY)
    const decls = extractDeclarations(VAR_HEAVY, layers)
    expect(decls.some(d => d.kind === 'function' && d.name === 'sum')).toBe(true)
  })

  it('extracts class declarations', () => {
    const layers = parseScopeLayers(CLASS_CONTENT)
    const decls = extractDeclarations(CLASS_CONTENT, layers)
    expect(decls.some(d => d.kind === 'class' && d.name === 'Calculator')).toBe(true)
  })

  it('extracts import declarations', () => {
    const layers = parseScopeLayers(MODERN_TS)
    const decls = extractDeclarations(MODERN_TS, layers)
    const imports = decls.filter(d => d.kind === 'import')
    expect(imports.length).toBeGreaterThanOrEqual(1)
  })

  it('extracts type declarations', () => {
    const layers = parseScopeLayers(MODERN_TS)
    const decls = extractDeclarations(MODERN_TS, layers)
    expect(decls.some(d => d.kind === 'type')).toBe(true)
  })

  it('extracts enum declarations', () => {
    const content = 'export enum Color { Red, Green, Blue }'
    const layers = parseScopeLayers(content)
    const decls = extractDeclarations(content, layers)
    expect(decls.some(d => d.kind === 'enum' && d.name === 'Color')).toBe(true)
  })

  it('marks exported declarations', () => {
    const layers = parseScopeLayers(CLEAN_CONST)
    const decls = extractDeclarations(CLEAN_CONST, layers)
    const exported = decls.find(d => d.name === 'z')
    expect(exported?.isExported).toBe(true)
  })

  it('counts references', () => {
    const layers = parseScopeLayers(CLEAN_CONST)
    const decls = extractDeclarations(CLEAN_CONST, layers)
    const xDecl = decls.find(d => d.name === 'x')
    expect(xDecl?.references).toBeGreaterThanOrEqual(0)
  })
})

// ─── Detect Scope Issues ───────────────────────────────────────────────────────

describe('detectScopeIssues', () => {
  it('returns empty for empty content', () => {
    const layers = parseScopeLayers(EMPTY_CONTENT)
    const decls = extractDeclarations(EMPTY_CONTENT, layers)
    expect(detectScopeIssues(EMPTY_CONTENT, decls, layers)).toEqual([])
  })

  it('detects shadow issues', () => {
    const layers = parseScopeLayers(SHADOW_CONTENT)
    const decls = extractDeclarations(SHADOW_CONTENT, layers)
    const issues = detectScopeIssues(SHADOW_CONTENT, decls, layers)
    const shadows = issues.filter(i => i.type === 'shadow')
    expect(shadows.length).toBeGreaterThanOrEqual(1)
    expect(shadows.some(s => s.name === 'x')).toBe(true)
  })

  it('detects var hoisting', () => {
    const layers = parseScopeLayers(VAR_HEAVY)
    const decls = extractDeclarations(VAR_HEAVY, layers)
    const issues = detectScopeIssues(VAR_HEAVY, decls, layers)
    const hoists = issues.filter(i => i.type === 'hoist')
    expect(hoists.length).toBeGreaterThanOrEqual(1)
  })

  it('detects var leaks', () => {
    const layers = parseScopeLayers(GLOBAL_LEAK)
    const decls = extractDeclarations(GLOBAL_LEAK, layers)
    const issues = detectScopeIssues(GLOBAL_LEAK, decls, layers)
    const leaks = issues.filter(i => i.type === 'leak')
    expect(leaks.length).toBeGreaterThanOrEqual(1)
  })

  it('detects unused declarations', () => {
    const layers = parseScopeLayers(UNUSED_CONTENT)
    const decls = extractDeclarations(UNUSED_CONTENT, layers)
    const issues = detectScopeIssues(UNUSED_CONTENT, decls, layers)
    const unused = issues.filter(i => i.type === 'unused')
    expect(unused.length).toBeGreaterThanOrEqual(1)
  })

  it('detects implicit globals', () => {
    const layers = parseScopeLayers(IMPLICIT_GLOBAL)
    const decls = extractDeclarations(IMPLICIT_GLOBAL, layers)
    const issues = detectScopeIssues(IMPLICIT_GLOBAL, decls, layers)
    const implicits = issues.filter(i => i.type === 'implicit-global')
    expect(implicits.length).toBeGreaterThanOrEqual(1)
    expect(implicits.some(ig => ig.name === 'config')).toBe(true)
  })

  it('issues have proper severity', () => {
    const layers = parseScopeLayers(VAR_HEAVY)
    const decls = extractDeclarations(VAR_HEAVY, layers)
    const issues = detectScopeIssues(VAR_HEAVY, decls, layers)
    for (const issue of issues) {
      expect(['info', 'warning', 'error']).toContain(issue.severity)
      expect(issue.description.length).toBeGreaterThan(0)
      expect(issue.suggestion.length).toBeGreaterThan(0)
    }
  })

  it('no issues for clean code', () => {
    const content = 'export const x = 1'
    const layers = parseScopeLayers(content)
    const decls = extractDeclarations(content, layers)
    const issues = detectScopeIssues(content, decls, layers)
    const serious = issues.filter(i => i.severity === 'error' || i.severity === 'warning')
    expect(serious.length).toBe(0)
  })
})

// ─── Classify Visibility ───────────────────────────────────────────────────────

describe('classifyDeclarationVisibility', () => {
  it('returns public for exported', () => {
    expect(classifyDeclarationVisibility({ isExported: true, depth: 0 })).toBe('public')
  })

  it('returns internal for module-level non-exported', () => {
    expect(classifyDeclarationVisibility({ isExported: false, depth: 0 })).toBe('internal')
  })

  it('returns private for nested declarations', () => {
    expect(classifyDeclarationVisibility({ isExported: false, depth: 2 })).toBe('private')
  })

  it('returns global for var at module level', () => {
    expect(classifyDeclarationVisibility({ kind: 'var', isExported: false, depth: 0 })).toBe('global')
  })
})

// ─── Scope Hygiene ─────────────────────────────────────────────────────────────

describe('computeScopeHygiene', () => {
  it('returns 100 for no declarations', () => {
    expect(computeScopeHygiene([], [])).toBe(100)
  })

  it('returns 100 for clean declarations with no issues', () => {
    const decls: ScopeDeclaration[] = [
      { name: 'x', kind: 'const', scopeType: 'module', depth: 0, isExported: true, isUsed: true, lineCount: 0, references: 2, visibility: 'public' },
    ]
    expect(computeScopeHygiene([], decls)).toBe(100)
  })

  it('decreases with issues', () => {
    const decls: ScopeDeclaration[] = [
      { name: 'x', kind: 'const', scopeType: 'module', depth: 0, isExported: false, isUsed: true, lineCount: 0, references: 1, visibility: 'internal' },
    ]
    const clean = computeScopeHygiene([], decls)
    const issues: ScopeIssue[] = [
      { type: 'shadow', name: 'x', line: 1, severity: 'warning', description: 'test', suggestion: 'test' },
    ]
    const dirty = computeScopeHygiene(issues, decls)
    expect(dirty).toBeLessThan(clean)
  })

  it('decreases more for error severity', () => {
    const decls: ScopeDeclaration[] = [
      { name: 'x', kind: 'const', scopeType: 'module', depth: 0, isExported: false, isUsed: true, lineCount: 0, references: 1, visibility: 'internal' },
    ]
    const warningIssues: ScopeIssue[] = [
      { type: 'shadow', name: 'x', line: 1, severity: 'warning', description: 'test', suggestion: 'test' },
    ]
    const errorIssues: ScopeIssue[] = [
      { type: 'implicit-global', name: 'x', line: 1, severity: 'error', description: 'test', suggestion: 'test' },
    ]
    expect(computeScopeHygiene(errorIssues, decls)).toBeLessThan(computeScopeHygiene(warningIssues, decls))
  })

  it('decreases for var usage', () => {
    const constDecls: ScopeDeclaration[] = [
      { name: 'x', kind: 'const', scopeType: 'module', depth: 0, isExported: false, isUsed: true, lineCount: 0, references: 1, visibility: 'internal' },
    ]
    const varDecls: ScopeDeclaration[] = [
      { name: 'x', kind: 'var', scopeType: 'function', depth: 0, isExported: false, isUsed: true, lineCount: 0, references: 1, visibility: 'global' },
    ]
    expect(computeScopeHygiene([], varDecls)).toBeLessThan(computeScopeHygiene([], constDecls))
  })

  it('clamps to 0-100', () => {
    const manyIssues: ScopeIssue[] = Array(30).fill({ type: 'error', name: 'x', line: 1, severity: 'error', description: 'test', suggestion: 'test' })
    const result = computeScopeHygiene(manyIssues, [{ name: 'x', kind: 'var', scopeType: 'function', depth: 0, isExported: false, isUsed: false, lineCount: 0, references: 0, visibility: 'global' }])
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── Identify Scope Pattern ────────────────────────────────────────────────────

describe('identifyScopePattern', () => {
  function makeFile(overrides: Partial<ScopeFile> = {}): ScopeFile {
    return {
      file: 'test.ts',
      layers: [],
      declarations: [],
      issues: [],
      maxScopeDepth: 0,
      avgScopeDepth: 0,
      scopeHygiene: 100,
      pattern: 'module-scoped',
      ...overrides,
    }
  }

  it('returns module-scoped for empty declarations', () => {
    expect(identifyScopePattern(makeFile())).toBe('module-scoped')
  })

  it('returns global-heavy when many globals', () => {
    const decls: ScopeDeclaration[] = Array(5).fill({ name: 'g', kind: 'var', scopeType: 'global', depth: 0, isExported: false, isUsed: true, lineCount: 0, references: 1, visibility: 'global' })
    expect(identifyScopePattern(makeFile({ declarations: decls }))).toBe('global-heavy')
  })

  it('returns function-scoped for var-heavy code', () => {
    const decls: ScopeDeclaration[] = Array(5).fill({ name: 'v', kind: 'var', scopeType: 'function', depth: 1, isExported: false, isUsed: true, lineCount: 0, references: 1, visibility: 'private' })
    decls.push({ name: 'c', kind: 'const', scopeType: 'module', depth: 0, isExported: false, isUsed: true, lineCount: 0, references: 1, visibility: 'internal' })
    expect(identifyScopePattern(makeFile({ declarations: decls }))).toBe('function-scoped')
  })

  it('returns tight-scope for clean const code', () => {
    const decls: ScopeDeclaration[] = Array(5).fill({ name: 'c', kind: 'const', scopeType: 'block', depth: 1, isExported: false, isUsed: true, lineCount: 0, references: 2, visibility: 'private' })
    expect(identifyScopePattern(makeFile({ declarations: decls, issues: [] }))).toBe('tight-scope')
  })
})

// ─── Pattern Score ─────────────────────────────────────────────────────────────

describe('computePatternScore', () => {
  it('gives tight-scope highest base score', () => {
    const tight = computePatternScore('tight-scope', 100)
    const global = computePatternScore('global-heavy', 100)
    expect(tight).toBeGreaterThan(global)
  })

  it('factors in hygiene score', () => {
    const highHygiene = computePatternScore('module-scoped', 90)
    const lowHygiene = computePatternScore('module-scoped', 30)
    expect(highHygiene).toBeGreaterThan(lowHygiene)
  })

  it('clamps to 0-100', () => {
    const result = computePatternScore('tight-scope', 100)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── Kaleidoscope Symmetry ─────────────────────────────────────────────────────

describe('computeKaleidoscopeSymmetry', () => {
  it('returns 100 for single file', () => {
    expect(computeKaleidoscopeSymmetry([{
      file: 'a.ts', layers: [], declarations: [], issues: [], maxScopeDepth: 0, avgScopeDepth: 0, scopeHygiene: 80, pattern: 'tight-scope',
    }])).toBe(100)
  })

  it('returns 100 for no files', () => {
    expect(computeKaleidoscopeSymmetry([])).toBe(100)
  })

  it('decreases for inconsistent patterns', () => {
    const consistent: ScopeFile[] = Array(5).fill({ file: 'a.ts', layers: [], declarations: [], issues: [], maxScopeDepth: 0, avgScopeDepth: 0, scopeHygiene: 80, pattern: 'tight-scope' })
    const mixed: ScopeFile[] = [
      { file: 'a.ts', layers: [], declarations: [], issues: [], maxScopeDepth: 0, avgScopeDepth: 0, scopeHygiene: 80, pattern: 'tight-scope' },
      { file: 'b.ts', layers: [], declarations: [], issues: [], maxScopeDepth: 0, avgScopeDepth: 0, scopeHygiene: 80, pattern: 'global-heavy' },
      { file: 'c.ts', layers: [], declarations: [], issues: [], maxScopeDepth: 0, avgScopeDepth: 0, scopeHygiene: 80, pattern: 'function-scoped' },
    ]
    const consistentSym = computeKaleidoscopeSymmetry(consistent)
    const mixedSym = computeKaleidoscopeSymmetry(mixed)
    expect(consistentSym).toBeGreaterThan(mixedSym)
  })

  it('clamps to 0-100', () => {
    const files: ScopeFile[] = [
      { file: 'a.ts', layers: [], declarations: [], issues: [], maxScopeDepth: 0, avgScopeDepth: 0, scopeHygiene: 10, pattern: 'global-heavy' },
      { file: 'b.ts', layers: [], declarations: [], issues: [], maxScopeDepth: 0, avgScopeDepth: 0, scopeHygiene: 90, pattern: 'tight-scope' },
    ]
    const result = computeKaleidoscopeSymmetry(files)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── Scope Health ──────────────────────────────────────────────────────────────

describe('classifyScopeHealth', () => {
  it('returns pristine for high hygiene and no issues', () => {
    expect(classifyScopeHealth(95, 0)).toBe('pristine')
  })

  it('returns clean for high hygiene', () => {
    expect(classifyScopeHealth(85, 1)).toBe('clean')
  })

  it('returns acceptable for moderate hygiene', () => {
    expect(classifyScopeHealth(65, 5)).toBe('acceptable')
  })

  it('returns messy for low hygiene', () => {
    expect(classifyScopeHealth(40, 10)).toBe('messy')
  })

  it('returns hazardous for very low hygiene', () => {
    expect(classifyScopeHealth(20, 20)).toBe('hazardous')
  })
})

// ─── Recommendations ───────────────────────────────────────────────────────────

describe('generateScopeRecommendations', () => {
  const baseStats: KaleidoscopeScopeStats = {
    totalDeclarations: 10, totalScopeLayers: 5, totalIssues: 0,
    shadows: 0, leaks: 0, hoists: 0, unused: 0, globalPollution: 0, scopeCreep: 0,
    avgScopeDepth: 1, maxScopeDepth: 3, avgHygiene: 80,
    varCount: 0, letCount: 5, constCount: 5, functionCount: 2, classCount: 1,
    exportedCount: 3, unusedCount: 0, dominantPattern: 'tight-scope',
    scopeHealth: 'clean', kaleidoscopeSymmetry: 80,
  }

  it('returns empty for clean codebase', () => {
    expect(generateScopeRecommendations([], [], [], baseStats)).toEqual([])
  })

  it('recommends renaming shadowed variables', () => {
    const issues: ScopeIssue[] = [
      { type: 'shadow', name: 'x', line: 1, severity: 'warning', description: 'test', suggestion: 'test' },
    ]
    const result = generateScopeRecommendations([], [], issues, baseStats)
    expect(result.some(r => r.includes('shadow'))).toBe(true)
  })

  it('recommends converting var to let/const', () => {
    const stats = { ...baseStats, varCount: 3 }
    const result = generateScopeRecommendations([], [], [], stats)
    expect(result.some(r => r.includes('var'))).toBe(true)
  })

  it('recommends removing unused declarations', () => {
    const stats = { ...baseStats, unusedCount: 2 }
    const result = generateScopeRecommendations([], [], [], stats)
    expect(result.some(r => r.includes('unused') || r.includes('underscore'))).toBe(true)
  })

  it('recommends fixing implicit globals', () => {
    const issues: ScopeIssue[] = [
      { type: 'implicit-global', name: 'x', line: 1, severity: 'error', description: 'test', suggestion: 'test' },
    ]
    const result = generateScopeRecommendations([], [], issues, baseStats)
    expect(result.some(r => r.includes('implicit global') || r.includes('declarations'))).toBe(true)
  })

  it('recommends narrowing scope creep', () => {
    const issues: ScopeIssue[] = [
      { type: 'scope-creep', name: 'x', line: 1, severity: 'warning', description: 'test', suggestion: 'test' },
    ]
    const result = generateScopeRecommendations([], [], issues, baseStats)
    expect(result.some(r => r.includes('scope') && r.includes('reference'))).toBe(true)
  })

  it('recommends fixing var leaks', () => {
    const issues: ScopeIssue[] = [
      { type: 'leak', name: 'y', line: 1, severity: 'warning', description: 'test', suggestion: 'test' },
    ]
    const result = generateScopeRecommendations([], [], issues, baseStats)
    expect(result.some(r => r.includes('leak'))).toBe(true)
  })

  it('recommends refactor for low hygiene', () => {
    const stats = { ...baseStats, avgHygiene: 40 }
    const result = generateScopeRecommendations([], [], [], stats)
    expect(result.some(r => r.includes('hygiene'))).toBe(true)
  })
})

// ─── Build Result ──────────────────────────────────────────────────────────────

describe('buildKaleidoscopeScopeResult', () => {
  it('returns valid result for empty input', () => {
    const result = buildKaleidoscopeScopeResult([], [], {})
    expect(result.files).toEqual([])
    expect(result.patterns).toEqual([])
    expect(result.recommendations).toEqual([])
    expect(result.stats.scopeHealth).toBeDefined()
    expect(result.stats.avgHygiene).toBe(100)
    expect(result.stats.totalDeclarations).toBe(0)
  })

  it('returns valid result for single file', () => {
    const result = buildKaleidoscopeScopeResult(['clean.ts'], [CLEAN_CONST], {})
    expect(result.files.length).toBe(1)
    expect(result.files[0].file).toBe('clean.ts')
    expect(result.files[0].declarations.length).toBeGreaterThan(0)
    expect(result.files[0].scopeHygiene).toBeGreaterThanOrEqual(0)
    expect(result.files[0].scopeHygiene).toBeLessThanOrEqual(100)
  })

  it('computes correct stats for multiple files', () => {
    const result = buildKaleidoscopeScopeResult(
      ['clean.ts', 'var.ts'],
      [CLEAN_CONST, VAR_HEAVY],
      {},
    )
    expect(result.stats.totalDeclarations).toBeGreaterThan(0)
    expect(result.stats.varCount).toBeGreaterThan(0)
    expect(result.stats.functionCount).toBeGreaterThan(0)
    expect(result.stats.dominantPattern).toBeDefined()
  })

  it('detects patterns across files', () => {
    const result = buildKaleidoscopeScopeResult(
      ['a.ts', 'b.ts'],
      [CLEAN_CONST, CLEAN_CONST],
      {},
    )
    expect(result.patterns.length).toBeGreaterThanOrEqual(1)
    expect(result.patterns[0].files.length).toBeGreaterThanOrEqual(1)
  })

  it('computes symmetry', () => {
    const result = buildKaleidoscopeScopeResult(
      ['a.ts', 'b.ts'],
      [CLEAN_CONST, CLEAN_CONST],
      {},
    )
    expect(result.stats.kaleidoscopeSymmetry).toBeGreaterThanOrEqual(0)
    expect(result.stats.kaleidoscopeSymmetry).toBeLessThanOrEqual(100)
  })

  it('classifies scope health', () => {
    const result = buildKaleidoscopeScopeResult(['clean.ts'], [CLEAN_CONST], {})
    expect(['pristine', 'clean', 'acceptable', 'messy', 'hazardous']).toContain(result.stats.scopeHealth)
  })

  it('respects verbose option', () => {
    const result = buildKaleidoscopeScopeResult(['a.ts'], [CLEAN_CONST], { verbose: true })
    expect(result).toBeDefined()
  })

  it('counts declaration kinds correctly', () => {
    const result = buildKaleidoscopeScopeResult(
      ['mixed.ts'],
      [MODERN_TS],
      {},
    )
    expect(result.stats.constCount).toBeGreaterThan(0)
    expect(result.stats.functionCount).toBeGreaterThan(0)
    expect(result.stats.classCount).toBeGreaterThan(0)
  })

  it('tracks exported and unused counts', () => {
    const result = buildKaleidoscopeScopeResult(['exports.ts'], [MODULE_EXPORTS], {})
    expect(result.stats.exportedCount).toBeGreaterThan(0)
  })

  it('counts issues by type', () => {
    const result = buildKaleidoscopeScopeResult(['shadow.ts'], [SHADOW_CONTENT], {})
    expect(result.stats.shadows).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalIssues).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatHealthLabel', () => {
  it('formats pristine', () => {
    expect(formatHealthLabel('pristine')).toContain('pristine')
  })

  it('formats hazardous', () => {
    expect(formatHealthLabel('hazardous')).toContain('hazardous')
  })
})

describe('formatPatternLabel', () => {
  it('formats tight-scope', () => {
    expect(formatPatternLabel('tight-scope')).toContain('tight-scope')
  })

  it('formats global-heavy', () => {
    expect(formatPatternLabel('global-heavy')).toContain('global-heavy')
  })
})

describe('formatSeverity', () => {
  it('formats error', () => {
    expect(formatSeverity('error')).toContain('error')
  })

  it('formats info', () => {
    expect(formatSeverity('info')).toContain('info')
  })
})

describe('formatScopeGauge', () => {
  it('returns gauge with value', () => {
    expect(formatScopeGauge(75)).toContain('75')
  })

  it('handles 0', () => {
    expect(formatScopeGauge(0)).toContain('0')
  })

  it('handles 100', () => {
    expect(formatScopeGauge(100)).toContain('100')
  })
})

describe('formatScopeTree', () => {
  it('returns no files message for empty', () => {
    expect(formatScopeTree([])).toContain('No files')
  })

  it('formats file analysis', () => {
    const result = buildKaleidoscopeScopeResult(['a.ts'], [CLEAN_CONST], {})
    const output = formatScopeTree(result.files)
    expect(output).toContain('a.ts')
    expect(output).toContain('hygiene')
  })
})

describe('formatIssuesTable', () => {
  it('returns clean message for no issues', () => {
    expect(formatIssuesTable([])).toContain('Clean scopes')
  })

  it('formats issues', () => {
    const issues: ScopeIssue[] = [
      { type: 'shadow', name: 'x', line: 5, severity: 'warning', description: 'x shadows', suggestion: 'rename' },
    ]
    const output = formatIssuesTable(issues)
    expect(output).toContain('shadow')
    expect(output).toContain('x shadows')
  })
})

describe('formatPatterns', () => {
  it('returns no patterns message for empty', () => {
    expect(formatPatterns([])).toContain('No patterns')
  })

  it('formats pattern info', () => {
    const result = buildKaleidoscopeScopeResult(['a.ts'], [CLEAN_CONST], {})
    const output = formatPatterns(result.patterns)
    if (result.patterns.length > 0) {
      expect(output).toContain('score')
    }
  })
})

describe('formatKaleidoscopeScopeStats', () => {
  it('formats stats summary', () => {
    const result = buildKaleidoscopeScopeResult(['a.ts'], [CLEAN_CONST], {})
    const output = formatKaleidoscopeScopeStats(result.stats)
    expect(output).toContain('Kaleidoscope Scope Analysis')
    expect(output).toContain('Declarations')
  })
})

describe('formatRecommendations', () => {
  it('returns pristine message for empty', () => {
    expect(formatRecommendations([])).toContain('pristine')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Clean Y'])
    expect(output).toContain('1. Fix X')
    expect(output).toContain('2. Clean Y')
  })
})

describe('formatKaleidoscopeScopeTable', () => {
  it('formats full table', () => {
    const result = buildKaleidoscopeScopeResult(['a.ts'], [CLEAN_CONST], {})
    const output = formatKaleidoscopeScopeTable(result)
    expect(output).toContain('Kaleidoscope Scope Analysis')
    expect(output).toContain('Scope File Analysis')
    expect(output).toContain('Scope Patterns')
  })
})

describe('formatKaleidoscopeScopeJson', () => {
  it('formats as valid JSON', () => {
    const result = buildKaleidoscopeScopeResult(['a.ts'], [CLEAN_CONST], {})
    const json = formatKaleidoscopeScopeJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.files).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.patterns).toBeDefined()
  })
})
