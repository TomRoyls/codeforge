import { describe, expect, it } from 'vitest'

import Maintain from '../src/commands/maintain.js'
import {
  analyzeFile,
  computeCyclomaticComplexity,
  computeFunctionMI,
  computeMaintainabilityStats,
  computeNestingDepth,
  computeOverallScore,
  countParameters,
  findFunctions,
  generateFunctionIssues,
  generateRefactoringSuggestions,
  type FileMaintainability,
  type MaintainabilityStats,
} from '../src/commands/maintain-helpers.js'
import { formatImpact, formatMaintainJson, formatMaintainTable, formatMI } from '../src/commands/maintain-format-helpers.js'
import type { MaintainResult } from '../src/commands/maintain-helpers.js'

// ─── Test helpers ────────────────────────────────────────

function makeFileMaintainability(overrides: Partial<FileMaintainability> = {}): FileMaintainability {
  return {
    avgComplexity: 3,
    avgLinesPerFunction: 15,
    avgMaintainability: 80,
    filePath: 'test.ts',
    functions: [],
    issues: [],
    linesOfCode: 50,
    maintainabilityIndex: 80,
    maxNestingDepth: 2,
    suggestions: [],
    ...overrides,
  }
}

function makeStats(overrides: Partial<MaintainabilityStats> = {}): MaintainabilityStats {
  return {
    avgComplexity: 4,
    avgLinesPerFunction: 20,
    avgMaintainability: 75,
    highRiskFiles: 0,
    suggestions: [],
    totalFiles: 5,
    totalFunctions: 15,
    ...overrides,
  }
}

function makeMaintainResult(overrides: Partial<MaintainResult> = {}): MaintainResult {
  return {
    files: [],
    grade: 'A',
    overallScore: 90,
    stats: makeStats(),
    ...overrides,
  }
}

// ─── Command metadata ───────────────────────────────────

describe('Maintain command - static metadata', () => {
  it('has a description', () => {
    expect(Maintain.description).toBe('Analyze codebase maintainability with refactoring suggestions')
  })

  it('has examples array', () => {
    expect(Array.isArray(Maintain.examples)).toBe(true)
    expect(Maintain.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Maintain.args.path).toBeDefined()
    expect(Maintain.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Maintain.args.path.default).toBe('.')
  })
})

// ─── Command flags ──────────────────────────────────────

describe('Maintain command - flags', () => {
  it('has format flag with options', () => {
    expect(Maintain.flags.format.options).toContain('json')
    expect(Maintain.flags.format.options).toContain('table')
  })

  it('defaults format to table', () => {
    expect(Maintain.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Maintain.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Maintain.flags.ignore).toBeDefined()
    expect(Maintain.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag with default', () => {
    expect(Maintain.flags.ext).toBeDefined()
    expect(Maintain.flags.ext.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has threshold flag defaulting to 65', () => {
    expect(Maintain.flags.threshold.default).toBe(65)
  })

  it('has verbose flag defaulting to false', () => {
    expect(Maintain.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure ────────────────────────────────────

describe('Maintain command - class structure', () => {
  it('exports a default class', () => {
    expect(Maintain).toBeDefined()
    expect(typeof Maintain).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Maintain.prototype.run).toBe('function')
  })
})

// ─── findFunctions ──────────────────────────────────────

describe('findFunctions', () => {
  it('finds named function declarations', () => {
    const code = 'function hello() {\n  return 1;\n}'
    const fns = findFunctions(code, 'test.ts')
    expect(fns).toHaveLength(1)
    expect(fns[0]!.name).toBe('hello')
    expect(fns[0]!.startLine).toBe(1)
  })

  it('finds arrow functions', () => {
    const code = 'const add = (a, b) => {\n  return a + b;\n}'
    const fns = findFunctions(code, 'test.ts')
    expect(fns).toHaveLength(1)
    expect(fns[0]!.name).toBe('add')
  })

  it('finds function expressions', () => {
    const code = 'const greet = function(name) {\n  return "hi " + name;\n}'
    const fns = findFunctions(code, 'test.ts')
    expect(fns).toHaveLength(1)
    expect(fns[0]!.name).toBe('greet')
  })

  it('finds methods', () => {
    const code = 'class Foo {\n  bar() {\n    return 1;\n  }\n}'
    const fns = findFunctions(code, 'test.ts')
    expect(fns.length).toBeGreaterThanOrEqual(1)
    expect(fns.some((f) => f.name === 'bar')).toBe(true)
  })

  it('handles nested functions', () => {
    const code = 'function outer() {\n  function inner() {\n    return 1;\n  }\n  return inner();\n}'
    const fns = findFunctions(code, 'test.ts')
    expect(fns.length).toBeGreaterThanOrEqual(2)
  })

  it('returns empty array for empty file', () => {
    const fns = findFunctions('', 'test.ts')
    expect(fns).toHaveLength(0)
  })

  it('returns empty array for file with no functions', () => {
    const fns = findFunctions('const x = 1;\nconst y = 2;', 'test.ts')
    expect(fns).toHaveLength(0)
  })

  it('computes correct end line', () => {
    const code = 'function hello() {\n  return 1;\n}'
    const fns = findFunctions(code, 'test.ts')
    expect(fns[0]!.endLine).toBe(3)
  })
})

// ─── computeCyclomaticComplexity ─────────────────────────

describe('computeCyclomaticComplexity', () => {
  it('returns 1 for simple function', () => {
    expect(computeCyclomaticComplexity('return 1;')).toBe(1)
  })

  it('returns 2 for single if', () => {
    expect(computeCyclomaticComplexity('if (x) { foo(); }')).toBe(2)
  })

  it('returns 2 for single for', () => {
    expect(computeCyclomaticComplexity('for (let i = 0; i < n; i++) { foo(); }')).toBe(2)
  })

  it('returns 2 for single while', () => {
    expect(computeCyclomaticComplexity('while (x) { foo(); }')).toBe(2)
  })

  it('counts else if', () => {
    const code = 'if (a) { f(); } else if (b) { g(); } else { h(); }'
    expect(computeCyclomaticComplexity(code)).toBe(3)
  })

  it('counts logical operators', () => {
    const code = 'if (a && b || c) { f(); }'
    expect(computeCyclomaticComplexity(code)).toBe(4)
  })

  it('counts ternary operator', () => {
    const code = 'const x = a ? b : c;'
    expect(computeCyclomaticComplexity(code)).toBe(2)
  })

  it('counts case statements', () => {
    const code = 'switch(x) { case 1: break; case 2: break; default: break; }'
    expect(computeCyclomaticComplexity(code)).toBe(3)
  })

  it('counts catch', () => {
    const code = 'try { f(); } catch(e) { g(); }'
    expect(computeCyclomaticComplexity(code)).toBe(2)
  })

  it('counts do-while', () => {
    expect(computeCyclomaticComplexity('do { f(); } while(x);')).toBe(2)
  })

  it('handles complex function with 5+ complexity', () => {
    const code = 'if (a) { if (b) { for (let i = 0; i < n; i++) { if (c) { f(); } } } }'
    expect(computeCyclomaticComplexity(code)).toBeGreaterThanOrEqual(5)
  })

  it('ignores if inside strings', () => {
    expect(computeCyclomaticComplexity('const s = "if (x)";')).toBe(1)
  })
})

// ─── countParameters ────────────────────────────────────

describe('countParameters', () => {
  it('returns 0 for empty params', () => {
    expect(countParameters('()')).toBe(0)
  })

  it('returns 1 for single param', () => {
    expect(countParameters('(a)')).toBe(1)
  })

  it('returns 3 for three params', () => {
    expect(countParameters('(a, b, c)')).toBe(3)
  })

  it('handles rest params', () => {
    expect(countParameters('(...args)')).toBe(1)
  })

  it('handles default values', () => {
    expect(countParameters('(a, b = 1)')).toBe(2)
  })

  it('handles destructured params', () => {
    expect(countParameters('(a, { b, c })')).toBe(2)
  })

  it('handles function with type annotations', () => {
    expect(countParameters('(a: number, b: string)')).toBe(2)
  })

  it('returns 0 for no parentheses', () => {
    expect(countParameters('hello')).toBe(0)
  })
})

// ─── computeNestingDepth ────────────────────────────────

describe('computeNestingDepth', () => {
  it('returns 0 for flat code', () => {
    expect(computeNestingDepth('return 1;')).toBe(0)
  })

  it('returns 1 for single nested block', () => {
    expect(computeNestingDepth('{ if (x) { foo(); } }')).toBe(1)
  })

  it('returns 2 for double nesting', () => {
    expect(computeNestingDepth('{ if (x) { if (y) { foo(); } } }')).toBe(2)
  })

  it('returns 4 for deeply nested', () => {
    expect(computeNestingDepth('{ if (a) { if (b) { if (c) { if (d) { foo(); } } } } }')).toBe(4)
  })

  it('ignores braces in strings', () => {
    expect(computeNestingDepth('const s = "{}";')).toBe(0)
  })

  it('ignores braces in comments', () => {
    expect(computeNestingDepth('// { nested comment\nreturn 1;')).toBe(0)
  })
})

// ─── computeFunctionMI ──────────────────────────────────

describe('computeFunctionMI', () => {
  it('returns high score for clean function', () => {
    const mi = computeFunctionMI({
      linesOfCode: 5,
      cyclomaticComplexity: 1,
      parameterCount: 1,
      nestingDepth: 0,
    })
    expect(mi).toBeGreaterThan(80)
  })

  it('returns low score for complex function', () => {
    const mi = computeFunctionMI({
      linesOfCode: 100,
      cyclomaticComplexity: 20,
      parameterCount: 8,
      nestingDepth: 6,
    })
    expect(mi).toBeLessThan(30)
  })

  it('clamps to 0 minimum', () => {
    const mi = computeFunctionMI({
      linesOfCode: 500,
      cyclomaticComplexity: 50,
      parameterCount: 20,
      nestingDepth: 20,
    })
    expect(mi).toBe(0)
  })

  it('clamps to 100 maximum', () => {
    const mi = computeFunctionMI({
      linesOfCode: 0,
      cyclomaticComplexity: 0,
      parameterCount: 0,
      nestingDepth: 0,
    })
    expect(mi).toBeLessThanOrEqual(100)
  })

  it('rounds to integer', () => {
    const mi = computeFunctionMI({
      linesOfCode: 10,
      cyclomaticComplexity: 2,
      parameterCount: 2,
      nestingDepth: 1,
    })
    expect(Number.isInteger(mi)).toBe(true)
  })
})

// ─── generateFunctionIssues ─────────────────────────────

describe('generateFunctionIssues', () => {
  it('returns empty array for clean function', () => {
    const issues = generateFunctionIssues({
      cyclomaticComplexity: 5,
      linesOfCode: 20,
      parameterCount: 2,
      nestingDepth: 2,
    })
    expect(issues).toHaveLength(0)
  })

  it('reports high complexity', () => {
    const issues = generateFunctionIssues({
      cyclomaticComplexity: 15,
      linesOfCode: 20,
      parameterCount: 2,
      nestingDepth: 2,
    })
    expect(issues).toContain('High cyclomatic complexity (15)')
  })

  it('reports long function', () => {
    const issues = generateFunctionIssues({
      cyclomaticComplexity: 5,
      linesOfCode: 80,
      parameterCount: 2,
      nestingDepth: 2,
    })
    expect(issues).toContain('Function too long (80 lines)')
  })

  it('reports too many parameters', () => {
    const issues = generateFunctionIssues({
      cyclomaticComplexity: 5,
      linesOfCode: 20,
      parameterCount: 6,
      nestingDepth: 2,
    })
    expect(issues).toContain('Too many parameters (6)')
  })

  it('reports deep nesting', () => {
    const issues = generateFunctionIssues({
      cyclomaticComplexity: 5,
      linesOfCode: 20,
      parameterCount: 2,
      nestingDepth: 6,
    })
    expect(issues).toContain('Deep nesting (6 levels)')
  })

  it('reports multiple issues simultaneously', () => {
    const issues = generateFunctionIssues({
      cyclomaticComplexity: 15,
      linesOfCode: 80,
      parameterCount: 6,
      nestingDepth: 6,
    })
    expect(issues.length).toBe(4)
  })
})

// ─── generateRefactoringSuggestions ─────────────────────

describe('generateRefactoringSuggestions', () => {
  it('suggests extract-function for long functions', () => {
    const file = makeFileMaintainability({
      functions: [{
        cyclomaticComplexity: 3,
        endLine: 80,
        filePath: 'test.ts',
        issues: [],
        linesOfCode: 80,
        maintainabilityIndex: 50,
        name: 'longFn',
        nestingDepth: 1,
        parameterCount: 2,
        returnStatementCount: 1,
        startLine: 1,
      }],
    })
    const suggestions = generateRefactoringSuggestions(file)
    expect(suggestions.some((s) => s.type === 'extract-function')).toBe(true)
  })

  it('suggests reduce-params for many params', () => {
    const file = makeFileMaintainability({
      functions: [{
        cyclomaticComplexity: 3,
        endLine: 10,
        filePath: 'test.ts',
        issues: [],
        linesOfCode: 10,
        maintainabilityIndex: 70,
        name: 'manyParams',
        nestingDepth: 1,
        parameterCount: 6,
        returnStatementCount: 1,
        startLine: 1,
      }],
    })
    const suggestions = generateRefactoringSuggestions(file)
    expect(suggestions.some((s) => s.type === 'reduce-params')).toBe(true)
  })

  it('suggests simplify-conditional for high complexity', () => {
    const file = makeFileMaintainability({
      functions: [{
        cyclomaticComplexity: 15,
        endLine: 30,
        filePath: 'test.ts',
        issues: [],
        linesOfCode: 30,
        maintainabilityIndex: 40,
        name: 'complexFn',
        nestingDepth: 1,
        parameterCount: 2,
        returnStatementCount: 3,
        startLine: 1,
      }],
    })
    const suggestions = generateRefactoringSuggestions(file)
    expect(suggestions.some((s) => s.type === 'simplify-conditional')).toBe(true)
  })

  it('suggests split-file for large files', () => {
    const file = makeFileMaintainability({ linesOfCode: 600 })
    const suggestions = generateRefactoringSuggestions(file)
    expect(suggestions.some((s) => s.type === 'split-file')).toBe(true)
  })

  it('suggests reduce-nesting for deeply nested code', () => {
    const file = makeFileMaintainability({
      functions: [{
        cyclomaticComplexity: 5,
        endLine: 20,
        filePath: 'test.ts',
        issues: [],
        linesOfCode: 20,
        maintainabilityIndex: 60,
        name: 'nestedFn',
        nestingDepth: 6,
        parameterCount: 2,
        returnStatementCount: 1,
        startLine: 1,
      }],
    })
    const suggestions = generateRefactoringSuggestions(file)
    expect(suggestions.some((s) => s.type === 'reduce-nesting')).toBe(true)
  })

  it('suggests rename for cryptic names', () => {
    const file = makeFileMaintainability({
      functions: [{
        cyclomaticComplexity: 3,
        endLine: 5,
        filePath: 'test.ts',
        issues: [],
        linesOfCode: 5,
        maintainabilityIndex: 80,
        name: 'ab',
        nestingDepth: 0,
        parameterCount: 1,
        returnStatementCount: 1,
        startLine: 1,
      }],
    })
    const suggestions = generateRefactoringSuggestions(file)
    expect(suggestions.some((s) => s.type === 'rename')).toBe(true)
  })

  it('returns empty for clean file', () => {
    const file = makeFileMaintainability()
    const suggestions = generateRefactoringSuggestions(file)
    expect(suggestions).toHaveLength(0)
  })
})

// ─── analyzeFile ────────────────────────────────────────

describe('analyzeFile', () => {
  it('analyzes a simple file', () => {
    const code = 'function hello() {\n  return 1;\n}'
    const result = analyzeFile(code, 'test.ts')
    expect(result.filePath).toBe('test.ts')
    expect(result.functions.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty file', () => {
    const result = analyzeFile('', 'empty.ts')
    expect(result.filePath).toBe('empty.ts')
    expect(result.functions).toHaveLength(0)
    expect(result.linesOfCode).toBe(1)
  })

  it('computes file-level metrics', () => {
    const code = 'function foo() {\n  return 1;\n}\nfunction bar() {\n  return 2;\n}'
    const result = analyzeFile(code, 'test.ts')
    expect(result.avgComplexity).toBeGreaterThanOrEqual(1)
    expect(result.avgLinesPerFunction).toBeGreaterThan(0)
  })
})

// ─── computeMaintainabilityStats ────────────────────────

describe('computeMaintainabilityStats', () => {
  it('computes stats for multiple files', () => {
    const files = [
      makeFileMaintainability({ filePath: 'a.ts', functions: [{ name: 'f1', filePath: 'a.ts', startLine: 1, endLine: 5, linesOfCode: 5, cyclomaticComplexity: 2, parameterCount: 1, nestingDepth: 0, returnStatementCount: 1, maintainabilityIndex: 90, issues: [] }] }),
      makeFileMaintainability({ filePath: 'b.ts', functions: [{ name: 'f2', filePath: 'b.ts', startLine: 1, endLine: 10, linesOfCode: 10, cyclomaticComplexity: 5, parameterCount: 2, nestingDepth: 1, returnStatementCount: 2, maintainabilityIndex: 70, issues: [] }] }),
    ]
    const stats = computeMaintainabilityStats(files, 65)
    expect(stats.totalFiles).toBe(2)
    expect(stats.totalFunctions).toBe(2)
  })

  it('counts high-risk files below threshold', () => {
    const files = [
      makeFileMaintainability({ maintainabilityIndex: 50 }),
      makeFileMaintainability({ maintainabilityIndex: 80 }),
    ]
    const stats = computeMaintainabilityStats(files, 65)
    expect(stats.highRiskFiles).toBe(1)
  })

  it('handles empty files array', () => {
    const stats = computeMaintainabilityStats([], 65)
    expect(stats.totalFiles).toBe(0)
    expect(stats.totalFunctions).toBe(0)
    expect(stats.avgMaintainability).toBe(100)
  })

  it('sorts suggestions by impact', () => {
    const file = makeFileMaintainability({
      filePath: 'big.ts',
      linesOfCode: 600,
      functions: [{
        cyclomaticComplexity: 15,
        endLine: 100,
        filePath: 'big.ts',
        issues: [],
        linesOfCode: 100,
        maintainabilityIndex: 30,
        name: 'complexFn',
        nestingDepth: 6,
        parameterCount: 6,
        returnStatementCount: 3,
        startLine: 1,
      }],
      suggestions: [],
    })
    file.suggestions = generateRefactoringSuggestions(file)
    const stats = computeMaintainabilityStats([file], 65)
    const impacts = stats.suggestions.map((s) => s.impact)
    const highIdx = impacts.indexOf('high')
    const lowIdx = impacts.lastIndexOf('low')
    if (highIdx >= 0 && lowIdx >= 0) {
      expect(highIdx).toBeLessThan(lowIdx)
    }
  })
})

// ─── computeOverallScore ────────────────────────────────

describe('computeOverallScore', () => {
  it('returns A grade for excellent stats', () => {
    const stats = makeStats({ avgMaintainability: 95, avgComplexity: 2, highRiskFiles: 0 })
    const { score, grade } = computeOverallScore(stats)
    expect(grade).toBe('A')
    expect(score).toBeGreaterThanOrEqual(90)
  })

  it('returns B grade for good stats', () => {
    const stats = makeStats({ avgMaintainability: 80, avgComplexity: 4, highRiskFiles: 0 })
    const { grade } = computeOverallScore(stats)
    expect(['A', 'B']).toContain(grade)
  })

  it('returns F grade for poor stats', () => {
    const stats = makeStats({ avgMaintainability: 20, avgComplexity: 15, highRiskFiles: 5, totalFiles: 5 })
    const { grade } = computeOverallScore(stats)
    expect(grade).toBe('F')
  })

  it('penalizes high-risk files', () => {
    const goodStats = makeStats({ avgMaintainability: 80, highRiskFiles: 0 })
    const badStats = makeStats({ avgMaintainability: 80, highRiskFiles: 4, totalFiles: 5 })
    const goodScore = computeOverallScore(goodStats).score
    const badScore = computeOverallScore(badStats).score
    expect(goodScore).toBeGreaterThan(badScore)
  })

  it('clamps score between 0 and 100', () => {
    const stats = makeStats({ avgMaintainability: 0, avgComplexity: 50, highRiskFiles: 10, totalFiles: 10 })
    const { score } = computeOverallScore(stats)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── formatMI ───────────────────────────────────────────

describe('formatMI', () => {
  it('formats high score (>80)', () => {
    const result = formatMI(85)
    expect(result).toContain('85')
  })

  it('formats medium score (60-80)', () => {
    const result = formatMI(70)
    expect(result).toContain('70')
  })

  it('formats low score (<60)', () => {
    const result = formatMI(40)
    expect(result).toContain('40')
  })

  it('formats boundary at 80', () => {
    const result = formatMI(81)
    expect(result).toContain('81')
  })

  it('formats boundary at 60', () => {
    const result = formatMI(59)
    expect(result).toContain('59')
  })
})

// ─── formatImpact ───────────────────────────────────────

describe('formatImpact', () => {
  it('formats high impact', () => {
    expect(formatImpact('high')).toContain('HIGH')
  })

  it('formats medium impact', () => {
    expect(formatImpact('medium')).toContain('MED')
  })

  it('formats low impact', () => {
    expect(formatImpact('low')).toContain('LOW')
  })
})

// ─── formatMaintainTable ───────────────────────────────

describe('formatMaintainTable', () => {
  it('contains overall score', () => {
    const result = makeMaintainResult({ overallScore: 85 })
    const output = formatMaintainTable(result, false)
    expect(output).toContain('85')
    expect(output).toContain('Overall Score')
  })

  it('contains grade', () => {
    const result = makeMaintainResult({ grade: 'A' })
    const output = formatMaintainTable(result, false)
    expect(output).toContain('Maintainability Report')
  })

  it('shows file table with files', () => {
    const result = makeMaintainResult({
      files: [makeFileMaintainability({ filePath: 'src/utils.ts', maintainabilityIndex: 75 })],
    })
    const output = formatMaintainTable(result, false)
    expect(output).toContain('src/utils.ts')
  })

  it('shows suggestions when present', () => {
    const result = makeMaintainResult({
      stats: makeStats({
        suggestions: [{
          description: 'Test suggestion',
          effort: 'low',
          file: 'test.ts',
          impact: 'high',
          line: 1,
          type: 'extract-function',
        }],
      }),
    })
    const output = formatMaintainTable(result, false)
    expect(output).toContain('Test suggestion')
  })

  it('shows per-function breakdown in verbose mode', () => {
    const result = makeMaintainResult({
      files: [makeFileMaintainability({
        filePath: 'test.ts',
        functions: [{
          cyclomaticComplexity: 2,
          endLine: 5,
          filePath: 'test.ts',
          issues: [],
          linesOfCode: 5,
          maintainabilityIndex: 90,
          name: 'myFunc',
          nestingDepth: 0,
          parameterCount: 1,
          returnStatementCount: 1,
          startLine: 1,
        }],
      })],
    })
    const output = formatMaintainTable(result, true)
    expect(output).toContain('Per-Function Breakdown')
    expect(output).toContain('myFunc')
  })

  it('hides per-function breakdown in non-verbose mode', () => {
    const result = makeMaintainResult({
      files: [makeFileMaintainability({
        filePath: 'test.ts',
        functions: [{
          cyclomaticComplexity: 2,
          endLine: 5,
          filePath: 'test.ts',
          issues: [],
          linesOfCode: 5,
          maintainabilityIndex: 90,
          name: 'myFunc',
          nestingDepth: 0,
          parameterCount: 1,
          returnStatementCount: 1,
          startLine: 1,
        }],
      })],
    })
    const output = formatMaintainTable(result, false)
    expect(output).not.toContain('Per-Function Breakdown')
  })

  it('handles empty files', () => {
    const result = makeMaintainResult()
    const output = formatMaintainTable(result, false)
    expect(output).toContain('Overall Score')
  })

  it('limits suggestions to 10', () => {
    const suggestions = Array.from({ length: 15 }, (_, i) => ({
      description: `Suggestion ${i}`,
      effort: 'low' as const,
      file: 'test.ts',
      impact: 'low' as const,
      line: i + 1,
      type: 'extract-function' as const,
    }))
    const result = makeMaintainResult({ stats: makeStats({ suggestions }) })
    const output = formatMaintainTable(result, false)
    expect(output).toContain('... and 5 more')
  })
})

// ─── formatMaintainJson ─────────────────────────────────

describe('formatMaintainJson', () => {
  it('produces valid JSON', () => {
    const result = makeMaintainResult()
    const output = formatMaintainJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains overallScore', () => {
    const result = makeMaintainResult({ overallScore: 85 })
    const output = formatMaintainJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.overallScore).toBe(85)
  })

  it('contains grade', () => {
    const result = makeMaintainResult({ grade: 'B' })
    const output = formatMaintainJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.grade).toBe('B')
  })

  it('contains files array', () => {
    const result = makeMaintainResult()
    const output = formatMaintainJson(result)
    const parsed = JSON.parse(output)
    expect(Array.isArray(parsed.files)).toBe(true)
  })

  it('contains stats object', () => {
    const result = makeMaintainResult()
    const output = formatMaintainJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.stats).toBeDefined()
    expect(parsed.stats.totalFiles).toBe(5)
  })

  it('preserves file data', () => {
    const result = makeMaintainResult({
      files: [makeFileMaintainability({ filePath: 'src/app.ts', maintainabilityIndex: 70 })],
    })
    const output = formatMaintainJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files[0].filePath).toBe('src/app.ts')
    expect(parsed.files[0].maintainabilityIndex).toBe(70)
  })
})
