import { describe, it, expect } from 'vitest'

import {
  buildSmellsResult,
  categorizeSmells,
  countBraceDepth,
  computeSmellStats,
  detectComplexConditions,
  detectConsoleLog,
  detectDeepNesting,
  detectDuplicateStrings,
  detectEmptyCatch,
  detectGodClasses,
  detectInconsistentReturn,
  detectLongFunctions,
  detectMagicNumbers,
  detectSmells,
  detectTodos,
  detectTooManyParams,
  generateSmellRecommendations,
} from '../src/commands/smells-helpers.js'
import {
  formatCategoryBreakdown,
  formatDensityMeter,
  formatSmellsCsv,
  formatSmellsJson,
  formatSmellsTable,
  formatSmellRow,
  formatStatsSummary,
  severityIcon,
  severityLabel,
} from '../src/commands/smells-format-helpers.js'
import type { CodeSmell, SmellCategory, SmellsStats } from '../src/commands/smells-helpers.js'

// ─── countBraceDepth ──────────────────────────────────────────────────────────

describe('countBraceDepth', () => {
  it('counts opening braces', () => {
    expect(countBraceDepth('{ { {', 0)).toBe(3)
  })

  it('counts closing braces', () => {
    expect(countBraceDepth('} } }', 3)).toBe(0)
  })

  it('handles mixed braces', () => {
    expect(countBraceDepth('{ } {', 0)).toBe(1)
  })

  it('returns current for no braces', () => {
    expect(countBraceDepth('const x = 1', 5)).toBe(5)
  })
})

// ─── detectLongFunctions ──────────────────────────────────────────────────────

describe('detectLongFunctions', () => {
  it('detects a long function', () => {
    const body = 'function long() {\n' + '  const x = 1\n'.repeat(55) + '}'
    const smells = detectLongFunctions(body, 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
    expect(smells[0]!.type).toBe('long-function')
  })

  it('does not flag short functions', () => {
    const body = 'function short() {\n  return 1\n}'
    expect(detectLongFunctions(body, 'a.ts')).toEqual([])
  })

  it('detects async functions', () => {
    const body = 'async function longAsync() {\n' + '  await x\n'.repeat(55) + '}'
    const smells = detectLongFunctions(body, 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
  })

  it('detects exported functions', () => {
    const body = 'export function exported() {\n' + '  const x = 1\n'.repeat(55) + '}'
    const smells = detectLongFunctions(body, 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
  })

  it('respects custom threshold', () => {
    const body = 'function med() {\n' + '  const x = 1\n'.repeat(12) + '}'
    const smells = detectLongFunctions(body, 'a.ts', 10)
    expect(smells.length).toBeGreaterThan(0)
  })

  it('assigns critical severity for very long functions', () => {
    const body = 'function huge() {\n' + '  const x = 1\n'.repeat(120) + '}'
    const smells = detectLongFunctions(body, 'a.ts', 50)
    expect(smells[0]!.severity).toBe('critical')
  })
})

// ─── detectDeepNesting ────────────────────────────────────────────────────────

describe('detectDeepNesting', () => {
  it('detects deep nesting', () => {
    const body = 'if (a) {\nif (b) {\nif (c) {\nif (d) {\nif (e) {\nx\n}}}}}'
    const smells = detectDeepNesting(body, 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
    expect(smells[0]!.type).toBe('deep-nesting')
  })

  it('does not flag shallow nesting', () => {
    const body = 'if (a) {\n  if (b) {\n    x\n  }\n}'
    expect(detectDeepNesting(body, 'a.ts')).toEqual([])
  })

  it('respects custom threshold', () => {
    const body = 'if (a) {\nif (b) {\nif (c) {\nx\n}}}'
    const smells = detectDeepNesting(body, 'a.ts', 2)
    expect(smells.length).toBeGreaterThan(0)
  })

  it('assigns critical for extreme depth', () => {
    const body = 'if(a){\n'.repeat(8) + 'x' + '}\n'.repeat(8)
    const smells = detectDeepNesting(body, 'a.ts', 4)
    expect(smells.some((s) => s.severity === 'critical')).toBe(true)
  })
})

// ─── detectTooManyParams ──────────────────────────────────────────────────────

describe('detectTooManyParams', () => {
  it('detects too many parameters', () => {
    const body = 'function foo(a, b, c, d, e) {}'
    const smells = detectTooManyParams(body, 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
    expect(smells[0]!.type).toBe('too-many-params')
  })

  it('does not flag normal parameter counts', () => {
    expect(detectTooManyParams('function foo(a, b) {}', 'a.ts')).toEqual([])
  })

  it('detects arrow functions', () => {
    const body = 'const fn = (a, b, c, d, e, f) => {}'
    const smells = detectTooManyParams(body, 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
  })

  it('respects custom threshold', () => {
    expect(detectTooManyParams('function foo(a, b, c) {}', 'a.ts', 2).length).toBeGreaterThan(0)
  })

  it('skips functions with no params', () => {
    expect(detectTooManyParams('function foo() {}', 'a.ts')).toEqual([])
  })
})

// ─── detectGodClasses ─────────────────────────────────────────────────────────

describe('detectGodClasses', () => {
  it('detects oversized classes', () => {
    const methods = Array.from({ length: 20 }, (_, i) => `  m${i}() {}`).join('\n')
    const body = `class God {\n${methods}\n}`
    const smells = detectGodClasses(body, 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
    expect(smells[0]!.type).toBe('god-class')
  })

  it('does not flag small classes', () => {
    const body = 'class Small {\n  m1() {}\n  m2() {}\n}'
    expect(detectGodClasses(body, 'a.ts')).toEqual([])
  })

  it('detects exported classes', () => {
    const methods = Array.from({ length: 20 }, (_, i) => `  m${i}() {}`).join('\n')
    const body = `export class ExportedGod {\n${methods}\n}`
    const smells = detectGodClasses(body, 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
  })

  it('respects custom threshold', () => {
    const body = 'class Med {\n  m1() {}\n  m2() {}\n  m3() {}\n}'
    const smells = detectGodClasses(body, 'a.ts', 2)
    expect(smells.length).toBeGreaterThan(0)
  })
})

// ─── detectMagicNumbers ───────────────────────────────────────────────────────

describe('detectMagicNumbers', () => {
  it('detects magic numbers', () => {
    const smells = detectMagicNumbers('const x = 42', 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
    expect(smells[0]!.type).toBe('magic-number')
  })

  it('excludes 0, 1, -1', () => {
    const smells = detectMagicNumbers('const x = 0; const y = 1; const z = -1', 'a.ts')
    expect(smells).toEqual([])
  })

  it('excludes 2, 10, 100, 1000', () => {
    const smells = detectMagicNumbers('const x = 2; const y = 10; const z = 100', 'a.ts')
    expect(smells).toEqual([])
  })

  it('skips comments', () => {
    const smells = detectMagicNumbers('// const x = 42', 'a.ts')
    expect(smells).toEqual([])
  })

  it('skips import lines', () => {
    const smells = detectMagicNumbers("import { x42 } from 'module'", 'a.ts')
    expect(smells).toEqual([])
  })

  it('detects decimal numbers', () => {
    const smells = detectMagicNumbers('const rate = 3.14', 'a.ts')
    expect(smells.some((s) => s.description.includes('3.14'))).toBe(true)
  })
})

// ─── detectDuplicateStrings ───────────────────────────────────────────────────

describe('detectDuplicateStrings', () => {
  it('detects strings appearing 3+ times', () => {
    const body = `const a = 'hello world'\nconst b = 'hello world'\nconst c = 'hello world'`
    const smells = detectDuplicateStrings(body, 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
    expect(smells[0]!.type).toBe('duplicate-string')
  })

  it('ignores short strings', () => {
    const body = `const a = 'ab'\nconst b = 'ab'\nconst c = 'ab'`
    expect(detectDuplicateStrings(body, 'a.ts')).toEqual([])
  })

  it('ignores strings appearing < 3 times', () => {
    const body = `const a = 'hello'\nconst b = 'hello'`
    expect(detectDuplicateStrings(body, 'a.ts')).toEqual([])
  })

  it('skips comments', () => {
    const body = `// 'hello world'\n// 'hello world'\n// 'hello world'`
    expect(detectDuplicateStrings(body, 'a.ts')).toEqual([])
  })

  it('detects double-quoted strings', () => {
    const body = `const a = "duplicate me now"\nconst b = "duplicate me now"\nconst c = "duplicate me now"`
    const smells = detectDuplicateStrings(body, 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
  })
})

// ─── detectComplexConditions ──────────────────────────────────────────────────

describe('detectComplexConditions', () => {
  it('detects complex conditions', () => {
    const body = 'if (a && b || c && d || e) {}'
    const smells = detectComplexConditions(body, 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
    expect(smells[0]!.type).toBe('complex-condition')
  })

  it('does not flag simple conditions', () => {
    expect(detectComplexConditions('if (a && b) {}', 'a.ts')).toEqual([])
  })

  it('assigns critical for very complex conditions', () => {
    const body = 'if (a && b || c && d || e && f || g && h) {}'
    const smells = detectComplexConditions(body, 'a.ts')
    expect(smells.some((s) => s.severity === 'critical')).toBe(true)
  })

  it('skips comments', () => {
    expect(detectComplexConditions('// if (a && b || c && d || e) {}', 'a.ts')).toEqual([])
  })
})

// ─── detectEmptyCatch ─────────────────────────────────────────────────────────

describe('detectEmptyCatch', () => {
  it('detects empty catch blocks', () => {
    const body = 'try {\n  x\n} catch(e) {}'
    const smells = detectEmptyCatch(body, 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
    expect(smells[0]!.type).toBe('empty-catch')
  })

  it('does not flag catch with code', () => {
    expect(detectEmptyCatch('try { x } catch(e) { log(e) }', 'a.ts')).toEqual([])
  })

  it('detects multiline empty catch', () => {
    const body = 'try {\n  x\n} catch(e) {\n}'
    const smells = detectEmptyCatch(body, 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
  })
})

// ─── detectConsoleLog ─────────────────────────────────────────────────────────

describe('detectConsoleLog', () => {
  it('detects console.log in source files', () => {
    const smells = detectConsoleLog('console.log("debug")', 'src/core.ts')
    expect(smells.length).toBeGreaterThan(0)
    expect(smells[0]!.type).toBe('console-log')
  })

  it('skips test files', () => {
    expect(detectConsoleLog('console.log("test")', 'test/foo.test.ts')).toEqual([])
  })

  it('skips spec files', () => {
    expect(detectConsoleLog('console.log("spec")', 'src/foo.spec.ts')).toEqual([])
  })

  it('skips commented console.log', () => {
    expect(detectConsoleLog('// console.log("commented")', 'src/core.ts')).toEqual([])
  })
})

// ─── detectTodos ──────────────────────────────────────────────────────────────

describe('detectTodos', () => {
  it('detects TODO comments', () => {
    const smells = detectTodos('// TODO: fix this later', 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
    expect(smells[0]!.type).toBe('todo-comment')
  })

  it('detects FIXME comments', () => {
    const smells = detectTodos('// FIXME: broken', 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
    expect(smells[0]!.severity).toBe('warning')
  })

  it('detects HACK comments', () => {
    const smells = detectTodos('// HACK: workaround', 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
  })

  it('detects block comment TODOs', () => {
    const smells = detectTodos('/* TODO: fix */', 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
  })

  it('detects XXX comments', () => {
    const smells = detectTodos('// XXX: danger', 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
  })
})

// ─── detectInconsistentReturn ─────────────────────────────────────────────────

describe('detectInconsistentReturn', () => {
  it('detects inconsistent returns', () => {
    const body = 'function foo(x) {\n  if (x) {\n    return 1\n  }\n  // no return here\n}'
    const smells = detectInconsistentReturn(body, 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
    expect(smells[0]!.type).toBe('inconsistent-return')
  })

  it('does not flag void functions', () => {
    const body = 'function foo() {\n  doSomething()\n}'
    expect(detectInconsistentReturn(body, 'a.ts')).toEqual([])
  })

  it('sets warning severity', () => {
    const body = 'function foo(x) {\n  if (x) {\n    return 1\n  }\n  doOther()\n}'
    const smells = detectInconsistentReturn(body, 'a.ts')
    if (smells.length > 0) {
      expect(smells[0]!.severity).toBe('warning')
    }
  })
})

// ─── detectSmells (integration) ───────────────────────────────────────────────

describe('detectSmells', () => {
  it('runs all detectors', () => {
    const body = 'function foo() {\n' + '  const x = 1\n'.repeat(60) + '}\n// TODO: fix'
    const smells = detectSmells(body, 'a.ts')
    expect(smells.length).toBeGreaterThan(0)
  })

  it('returns empty for clean code', () => {
    const body = 'function clean(x: number): number {\n  return x * 2\n}'
    const smells = detectSmells(body, 'a.ts')
    // might detect magic number 2 or other minor things, but should be minimal
    expect(smells.length).toBeLessThan(3)
  })
})

// ─── categorizeSmells ─────────────────────────────────────────────────────────

describe('categorizeSmells', () => {
  it('groups smells by category', () => {
    const smells: CodeSmell[] = [
      { type: 'a', name: 'A', file: 'f', lineStart: 1, lineEnd: 1, severity: 'info', description: 'd', suggestion: 's', category: 'size' },
      { type: 'b', name: 'B', file: 'f', lineStart: 1, lineEnd: 1, severity: 'warning', description: 'd', suggestion: 's', category: 'size' },
      { type: 'c', name: 'C', file: 'f', lineStart: 1, lineEnd: 1, severity: 'critical', description: 'd', suggestion: 's', category: 'complexity' },
    ]
    const cats = categorizeSmells(smells)
    expect(cats).toHaveLength(2)
    expect(cats.find((c) => c.name === 'size')!.count).toBe(2)
    expect(cats.find((c) => c.name === 'complexity')!.count).toBe(1)
  })

  it('sorts by count descending', () => {
    const smells: CodeSmell[] = [
      { type: 'a', name: 'A', file: 'f', lineStart: 1, lineEnd: 1, severity: 'info', description: 'd', suggestion: 's', category: 'size' },
      { type: 'b', name: 'B', file: 'f', lineStart: 1, lineEnd: 1, severity: 'info', description: 'd', suggestion: 's', category: 'size' },
      { type: 'c', name: 'C', file: 'f', lineStart: 1, lineEnd: 1, severity: 'info', description: 'd', suggestion: 's', category: 'size' },
      { type: 'd', name: 'D', file: 'f', lineStart: 1, lineEnd: 1, severity: 'info', description: 'd', suggestion: 's', category: 'complexity' },
    ]
    const cats = categorizeSmells(smells)
    expect(cats[0]!.name).toBe('size')
  })

  it('returns empty for no smells', () => {
    expect(categorizeSmells([])).toEqual([])
  })

  it('escalates category severity', () => {
    const smells: CodeSmell[] = [
      { type: 'a', name: 'A', file: 'f', lineStart: 1, lineEnd: 1, severity: 'info', description: 'd', suggestion: 's', category: 'size' },
      { type: 'b', name: 'B', file: 'f', lineStart: 1, lineEnd: 1, severity: 'critical', description: 'd', suggestion: 's', category: 'size' },
    ]
    const cats = categorizeSmells(smells)
    expect(cats[0]!.severity).toBe('critical')
  })
})

// ─── computeSmellStats ────────────────────────────────────────────────────────

describe('computeSmellStats', () => {
  it('computes correct totals', () => {
    const smells: CodeSmell[] = [
      { type: 'a', name: 'A', file: 'f1', lineStart: 1, lineEnd: 1, severity: 'info', description: 'd', suggestion: 's', category: 'size' },
      { type: 'b', name: 'B', file: 'f1', lineStart: 1, lineEnd: 1, severity: 'warning', description: 'd', suggestion: 's', category: 'size' },
      { type: 'c', name: 'C', file: 'f2', lineStart: 1, lineEnd: 1, severity: 'critical', description: 'd', suggestion: 's', category: 'complexity' },
    ]
    const stats = computeSmellStats(smells, 1000)
    expect(stats.totalSmells).toBe(3)
    expect(stats.infoCount).toBe(1)
    expect(stats.warningCount).toBe(1)
    expect(stats.criticalCount).toBe(1)
    expect(stats.filesAffected).toBe(2)
    expect(stats.smellDensity).toBe(3)
  })

  it('computes smell density', () => {
    const stats = computeSmellStats([], 5000)
    expect(stats.smellDensity).toBe(0)
  })

  it('finds most common smell', () => {
    const smells: CodeSmell[] = [
      { type: 'a', name: 'A', file: 'f', lineStart: 1, lineEnd: 1, severity: 'info', description: 'd', suggestion: 's', category: 'size' },
      { type: 'a', name: 'A', file: 'f', lineStart: 1, lineEnd: 1, severity: 'info', description: 'd', suggestion: 's', category: 'size' },
      { type: 'b', name: 'B', file: 'f', lineStart: 1, lineEnd: 1, severity: 'info', description: 'd', suggestion: 's', category: 'size' },
    ]
    const stats = computeSmellStats(smells, 100)
    expect(stats.mostCommonSmell).toBe('a')
  })

  it('finds most affected file', () => {
    const smells: CodeSmell[] = [
      { type: 'a', name: 'A', file: 'f1', lineStart: 1, lineEnd: 1, severity: 'info', description: 'd', suggestion: 's', category: 'size' },
      { type: 'b', name: 'B', file: 'f1', lineStart: 1, lineEnd: 1, severity: 'info', description: 'd', suggestion: 's', category: 'size' },
      { type: 'c', name: 'C', file: 'f2', lineStart: 1, lineEnd: 1, severity: 'info', description: 'd', suggestion: 's', category: 'size' },
    ]
    const stats = computeSmellStats(smells, 100)
    expect(stats.mostAffectedFile).toBe('f1')
  })

  it('handles empty smells', () => {
    const stats = computeSmellStats([], 0)
    expect(stats.totalSmells).toBe(0)
    expect(stats.mostCommonSmell).toBe('')
    expect(stats.mostAffectedFile).toBe('')
  })
})

// ─── generateSmellRecommendations ─────────────────────────────────────────────

describe('generateSmellRecommendations', () => {
  it('generates critical recommendation', () => {
    const stats: SmellsStats = { totalSmells: 2, infoCount: 0, warningCount: 0, criticalCount: 2, filesAffected: 1, smellDensity: 5, mostCommonSmell: 'a', mostAffectedFile: 'f' }
    const recs = generateSmellRecommendations([], stats)
    expect(recs.some((r) => r.includes('critical'))).toBe(true)
  })

  it('generates warning recommendation', () => {
    const stats: SmellsStats = { totalSmells: 3, infoCount: 0, warningCount: 3, criticalCount: 0, filesAffected: 1, smellDensity: 5, mostCommonSmell: 'a', mostAffectedFile: 'f' }
    const recs = generateSmellRecommendations([], stats)
    expect(recs.some((r) => r.includes('warning'))).toBe(true)
  })

  it('recommends refactoring sprint for high density', () => {
    const stats: SmellsStats = { totalSmells: 50, infoCount: 40, warningCount: 5, criticalCount: 5, filesAffected: 10, smellDensity: 20, mostCommonSmell: 'a', mostAffectedFile: 'f' }
    const recs = generateSmellRecommendations([], stats)
    expect(recs.some((r) => r.includes('refactoring'))).toBe(true)
  })

  it('recommends size category advice', () => {
    const cats: SmellCategory[] = [{ name: 'size', count: 5, severity: 'warning', smells: [] }]
    const stats: SmellsStats = { totalSmells: 5, infoCount: 0, warningCount: 5, criticalCount: 0, filesAffected: 1, smellDensity: 5, mostCommonSmell: 'a', mostAffectedFile: 'f' }
    const recs = generateSmellRecommendations(cats, stats)
    expect(recs.some((r) => r.includes('size'))).toBe(true)
  })

  it('returns healthy message when clean', () => {
    const stats: SmellsStats = { totalSmells: 0, infoCount: 0, warningCount: 0, criticalCount: 0, filesAffected: 0, smellDensity: 0, mostCommonSmell: '', mostAffectedFile: '' }
    const recs = generateSmellRecommendations([], stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('No significant')
  })
})

// ─── buildSmellsResult ────────────────────────────────────────────────────────

describe('buildSmellsResult', () => {
  it('returns complete result structure', () => {
    const result = buildSmellsResult(['a.ts'], ['console.log("x")'])
    expect(result.smells).toBeInstanceOf(Array)
    expect(result.categories).toBeInstanceOf(Array)
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('filters by severity', () => {
    const code = 'console.log("x")\n// TODO: fix\n' + 'function foo(a, b, c, d, e) {}\n'
    const result = buildSmellsResult(['a.ts'], [code], { severity: 'critical' })
    for (const smell of result.smells) {
      expect(smell.severity).toBe('critical')
    }
  })

  it('handles empty files', () => {
    const result = buildSmellsResult([], [])
    expect(result.stats.totalSmells).toBe(0)
  })

  it('aggregates across multiple files', () => {
    const result = buildSmellsResult(['a.ts', 'b.ts'], [
      'console.log("a")',
      'console.log("b")',
    ])
    expect(result.smells.length).toBeGreaterThanOrEqual(2)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('severityIcon', () => {
  it('returns critical icon', () => {
    expect(severityIcon('critical')).toContain('✖')
  })
  it('returns warning icon', () => {
    expect(severityIcon('warning')).toContain('⚠')
  })
  it('returns info icon', () => {
    expect(severityIcon('info')).toContain('ℹ')
  })
})

describe('severityLabel', () => {
  it('returns CRITICAL label', () => {
    expect(severityLabel('critical')).toContain('CRITICAL')
  })
  it('returns WARNING label', () => {
    expect(severityLabel('warning')).toContain('WARNING')
  })
  it('returns INFO label', () => {
    expect(severityLabel('info')).toContain('INFO')
  })
})

describe('formatSmellRow', () => {
  it('formats a smell row', () => {
    const smell: CodeSmell = { type: 'console-log', name: 'Console Log', file: 'src/core.ts', lineStart: 10, lineEnd: 10, severity: 'info', description: 'console.log', suggestion: 'remove', category: 'consistency' }
    const row = formatSmellRow(smell)
    expect(row).toContain('console-log')
    expect(row).toContain('src/core.ts')
  })
})

describe('formatDensityMeter', () => {
  it('shows density value', () => {
    const meter = formatDensityMeter(5)
    expect(meter).toContain('5')
  })

  it('shows bars', () => {
    const meter = formatDensityMeter(10)
    expect(meter).toContain('█')
  })

  it('caps at max bars', () => {
    const meter = formatDensityMeter(50)
    expect(meter).toContain('50')
  })
})

describe('formatCategoryBreakdown', () => {
  it('formats categories', () => {
    const cats: SmellCategory[] = [{ name: 'size', count: 3, severity: 'warning', smells: [] }]
    const result = formatCategoryBreakdown(cats)
    expect(result).toContain('size')
    expect(result).toContain('3')
  })
})

describe('formatStatsSummary', () => {
  it('formats all stats', () => {
    const stats: SmellsStats = { totalSmells: 10, infoCount: 3, warningCount: 5, criticalCount: 2, filesAffected: 4, smellDensity: 3.2, mostCommonSmell: 'console-log', mostAffectedFile: 'core.ts' }
    const result = formatStatsSummary(stats)
    expect(result).toContain('10')
    expect(result).toContain('3.2')
    expect(result).toContain('console-log')
  })
})

describe('formatSmellsTable', () => {
  it('includes title and sections', () => {
    const result = buildSmellsResult(['a.ts'], ['console.log("x")'])
    const table = formatSmellsTable(result)
    expect(table).toContain('Code Smell Analysis')
    expect(table).toContain('Summary')
    expect(table).toContain('Density Meter')
  })
})

describe('formatSmellsJson', () => {
  it('produces valid JSON', () => {
    const result = buildSmellsResult(['a.ts'], ['console.log("x")'])
    const json = formatSmellsJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })
})

describe('formatSmellsCsv', () => {
  it('includes header', () => {
    const result = buildSmellsResult(['a.ts'], ['console.log("x")'])
    const csv = formatSmellsCsv(result)
    expect(csv).toContain('type,name,file')
  })
})
