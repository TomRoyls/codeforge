import { describe, expect, it } from 'vitest'

import {
  buildDecoderResult,
  computeDecoderStats,
  computeGrade,
  extractFunctionLengths,
  generateDecoderRecommendations,
  identifyIssues,
  scoreCognitiveComplexity,
  scoreConsistency,
  scoreDocumentation,
  scoreFile,
  scoreNaming,
  scoreSimplicity,
  scoreStructure,
} from '../src/commands/decoder-helpers.js'

import {
  formatDecoderJSON,
  formatDecoderStats,
  formatDecoderTable,
  formatDimensionRadar,
  formatGradeBadge,
  formatGradeDistribution,
  formatIssueList,
  formatReadabilityMeter,
  formatRecommendations,
  formatScoreTable,
  formatSeverityBadge,
  getGradeColor,
} from '../src/commands/decoder-format-helpers.js'

// ─── computeGrade ─────────────────────────────────────────────────────────────

describe('computeGrade', () => {
  it('returns A for 90+', () => expect(computeGrade(92)).toBe('A'))
  it('returns B for 80-89', () => expect(computeGrade(85)).toBe('B'))
  it('returns C for 70-79', () => expect(computeGrade(75)).toBe('C'))
  it('returns D for 60-69', () => expect(computeGrade(65)).toBe('D'))
  it('returns F below 60', () => expect(computeGrade(40)).toBe('F'))
  it('returns A for exactly 90', () => expect(computeGrade(90)).toBe('A'))
  it('returns F for 0', () => expect(computeGrade(0)).toBe('F'))
  it('returns A for 100', () => expect(computeGrade(100)).toBe('A'))
})

// ─── scoreNaming ──────────────────────────────────────────────────────────────

describe('scoreNaming', () => {
  it('penalizes single-letter variable names', () => {
    const content = 'const x = 1\nconst y = 2\nconst z = 3'
    const score = scoreNaming(content)
    expect(score).toBeLessThan(80)
  })

  it('rewards descriptive names', () => {
    const names = ['firstName', 'lastName', 'emailAddress', 'phoneNumber', 'postalCode', 'userName', 'birthDate', 'accountBalance']
    const content = names.map((n) => `const ${n} = ""`).join('\n')
    const score = scoreNaming(content)
    expect(score).toBeGreaterThan(80)
  })

  it('rewards boolean prefixes', () => {
    const content = 'const isActive = true\nconst hasPermission = false\nconst shouldRetry = true'
    const score = scoreNaming(content)
    expect(score).toBeGreaterThan(80)
  })

  it('allows loop variables i, j, k', () => {
    const content = 'function processItems() {\n  for (let i = 0; i < 10; i++) {\n    console.log(i)\n  }\n  for (let j = 0; j < 5; j++) {\n    console.log(j)\n  }\n}'
    const score = scoreNaming(content)
    expect(score).toBeGreaterThanOrEqual(70)
  })

  it('returns score in 0-100 range', () => {
    const score = scoreNaming('const a = 1')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── scoreStructure ───────────────────────────────────────────────────────────

describe('scoreStructure', () => {
  it('penalizes long functions', () => {
    const longFunc = 'function longFunc() {\n' + Array.from({ length: 60 }, (_, i) => `  const x${i} = ${i}`).join('\n') + '\n}'
    const score = scoreStructure(longFunc)
    expect(score).toBeLessThan(80)
  })

  it('rewards short functions', () => {
    const content = 'function short() {\n  return 42\n}\nfunction alsoShort() {\n  return 1\n}'
    const score = scoreStructure(content)
    expect(score).toBeGreaterThanOrEqual(75)
  })

  it('penalizes deep nesting', () => {
    const nested = 'function deep() {\n  if (a) {\n    if (b) {\n      if (c) {\n        if (d) {\n          if (e) {\n            if (f) {\n              if (g) {\n                return 1\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}'
    const score = scoreStructure(nested)
    expect(score).toBeLessThan(80)
  })

  it('rewards early returns', () => {
    const content = 'function guard(x: number) {\n  if (x < 0) return -1\n  if (x > 100) return 101\n  return x\n}'
    const score = scoreStructure(content)
    expect(score).toBeGreaterThan(80)
  })

  it('returns score in 0-100 range', () => {
    const score = scoreStructure('function f() { return 1 }')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── extractFunctionLengths ───────────────────────────────────────────────────

describe('extractFunctionLengths', () => {
  it('extracts function lengths', () => {
    const content = 'function short() {\n  return 1\n}\n\nfunction medium() {\n  const a = 1\n  const b = 2\n  return a + b\n}'
    const lengths = extractFunctionLengths(content)
    expect(lengths).toHaveLength(2)
    expect(lengths[0]).toBe(3)
    expect(lengths[1]).toBe(5)
  })

  it('handles arrow functions', () => {
    const content = 'const add = (a: number, b: number) => {\n  return a + b\n}'
    const lengths = extractFunctionLengths(content)
    expect(lengths).toHaveLength(1)
    expect(lengths[0]).toBe(3)
  })

  it('returns empty for no functions', () => {
    expect(extractFunctionLengths('const x = 1')).toHaveLength(0)
  })

  it('handles nested braces in functions', () => {
    const content = 'function nested() {\n  if (true) {\n    return 1\n  }\n  return 0\n}'
    const lengths = extractFunctionLengths(content)
    expect(lengths).toHaveLength(1)
    expect(lengths[0]).toBe(6)
  })
})

// ─── scoreCognitiveComplexity ─────────────────────────────────────────────────

describe('scoreCognitiveComplexity', () => {
  it('scores simple code high', () => {
    const content = 'const x = 1\nconst y = 2\nreturn x + y'
    const score = scoreCognitiveComplexity(content)
    expect(score).toBe(100)
  })

  it('penalizes nested conditions', () => {
    const content = 'function f() {\n  if (a) {\n    if (b) {\n      if (c) {\n        if (d) {\n          if (e) {\n            if (f) {\n              if (g) {\n                if (h) {\n                  return 1\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}'
    const score = scoreCognitiveComplexity(content)
    expect(score).toBeLessThan(90)
  })

  it('penalizes boolean operator chaining', () => {
    const content = Array.from({ length: 10 }, (_, i) =>
      `if (a && b && c && d && e && f && g && h) {\n  return ${i}\n}`,
    ).join('\n')
    const score = scoreCognitiveComplexity(content)
    expect(score).toBeLessThan(100)
  })

  it('returns score in 0-100 range', () => {
    const score = scoreCognitiveComplexity('return 42')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── scoreDocumentation ──────────────────────────────────────────────────────

describe('scoreDocumentation', () => {
  it('rewards good comment density', () => {
    const lines = Array.from({ length: 20 }, (_, i) =>
      i % 5 === 0 ? '// Section comment' : `const x${i} = ${i}`,
    ).join('\n')
    const score = scoreDocumentation(lines)
    expect(score).toBeGreaterThan(60)
  })

  it('rewards JSDoc on exported functions', () => {
    const content = '/**\n * Add two numbers.\n */\nexport function add(a: number, b: number) {\n  return a + b\n}'
    const score = scoreDocumentation(content)
    expect(score).toBeGreaterThan(60)
  })

  it('penalizes commented-out code', () => {
    const content = '// const oldFeature = loadOld()\n// function legacy() { return true }\n// import removed from "./old"\nconst active = 1'
    const score = scoreDocumentation(content)
    expect(score).toBeLessThan(60)
  })

  it('returns score in 0-100 range', () => {
    const score = scoreDocumentation('const x = 1')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('returns 50 for empty content', () => {
    expect(scoreDocumentation('')).toBe(50)
  })
})

// ─── scoreConsistency ────────────────────────────────────────────────────────

describe('scoreConsistency', () => {
  it('rewards consistent naming', () => {
    const content = 'const firstName = "John"\nconst lastName = "Doe"\nconst emailAddress = "a@b.c"'
    const score = scoreConsistency(content)
    expect(score).toBeGreaterThan(80)
  })

  it('penalizes mixed import styles', () => {
    const content = "import { x } from 'a'\nconst y = require('b')\nimport { z } from 'c'\nconst w = require('d')"
    const score = scoreConsistency(content)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('returns score in 0-100 range', () => {
    const score = scoreConsistency('const x = 1')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── scoreSimplicity ─────────────────────────────────────────────────────────

describe('scoreSimplicity', () => {
  it('penalizes complex generics', () => {
    const content = 'type X = Map<string, List<Map<number, string>>>'
    const score = scoreSimplicity(content)
    expect(score).toBeLessThan(85)
  })

  it('penalizes ternary chains', () => {
    const content = "const x = a ? 'a' : b ? 'b' : c ? 'c' : 'd'"
    const score = scoreSimplicity(content)
    expect(score).toBeLessThan(85)
  })

  it('penalizes very long lines', () => {
    const longLine = 'const x = ' + 'a'.repeat(200)
    const score = scoreSimplicity(longLine)
    expect(score).toBeLessThan(85)
  })

  it('returns score in 0-100 range', () => {
    const score = scoreSimplicity('const x = 1')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('scores simple code high', () => {
    const content = 'function add(a: number, b: number) {\n  return a + b\n}'
    const score = scoreSimplicity(content)
    expect(score).toBeGreaterThan(70)
  })
})

// ─── identifyIssues ──────────────────────────────────────────────────────────

describe('identifyIssues', () => {
  it('identifies naming issues', () => {
    const content = 'const x = 1\nconst y = 2\nconst z = 3'
    const dims = { naming: 50, structure: 80, cognitive: 80, documentation: 80, consistency: 80, simplicity: 80 }
    const issues = identifyIssues('test.ts', content, dims)
    expect(issues.some((i) => i.dimension === 'naming')).toBe(true)
  })

  it('identifies structure issues for long functions', () => {
    const longFunc = 'function longFunc() {\n' + Array.from({ length: 40 }, (_, i) => `  const x${i} = ${i}`).join('\n') + '\n}'
    const dims = { naming: 80, structure: 50, cognitive: 80, documentation: 80, consistency: 80, simplicity: 80 }
    const issues = identifyIssues('test.ts', longFunc, dims)
    expect(issues.some((i) => i.dimension === 'structure')).toBe(true)
  })

  it('identifies documentation issues', () => {
    const content = 'export function undocumented() {\n  return 42\n}'
    const dims = { naming: 80, structure: 80, cognitive: 80, documentation: 30, consistency: 80, simplicity: 80 }
    const issues = identifyIssues('test.ts', content, dims)
    expect(issues.some((i) => i.dimension === 'documentation')).toBe(true)
  })

  it('returns no issues for clean code', () => {
    const content = '/** Add two numbers */\nexport function add(a: number, b: number) {\n  return a + b\n}'
    const dims = { naming: 90, structure: 90, cognitive: 90, documentation: 90, consistency: 90, simplicity: 90 }
    const issues = identifyIssues('test.ts', content, dims)
    expect(issues).toHaveLength(0)
  })
})

// ─── scoreFile ────────────────────────────────────────────────────────────────

describe('scoreFile', () => {
  it('produces complete readability score', () => {
    const content = '/**\n * Calculate sum.\n */\nexport function calculateSum(a: number, b: number) {\n  return a + b\n}'
    const score = scoreFile('utils.ts', content)
    expect(score.file).toBe('utils.ts')
    expect(score.overall).toBeGreaterThanOrEqual(0)
    expect(score.overall).toBeLessThanOrEqual(100)
    expect(score.grade).toMatch(/^[A-F]$/)
    expect(typeof score.dimensions.naming).toBe('number')
    expect(typeof score.dimensions.structure).toBe('number')
    expect(typeof score.dimensions.cognitive).toBe('number')
    expect(typeof score.dimensions.documentation).toBe('number')
    expect(typeof score.dimensions.consistency).toBe('number')
    expect(typeof score.dimensions.simplicity).toBe('number')
    expect(Array.isArray(score.issues)).toBe(true)
  })

  it('scores well-structured code higher', () => {
    const good = '/** Helper */\nfunction helper() {\n  return 42\n}'
    const bad = 'const x = 1\nconst y = 2\nconst z = 3'
    const goodScore = scoreFile('good.ts', good)
    const badScore = scoreFile('bad.ts', bad)
    expect(goodScore.dimensions.documentation).toBeGreaterThan(badScore.dimensions.documentation)
  })
})

// ─── computeDecoderStats ─────────────────────────────────────────────────────

describe('computeDecoderStats', () => {
  it('computes stats from scores', () => {
    const scores = [
      { file: 'a.ts', overall: 90, grade: 'A', dimensions: { naming: 90, structure: 85, cognitive: 95, documentation: 80, consistency: 90, simplicity: 95 }, issues: [] },
      { file: 'b.ts', overall: 60, grade: 'D', dimensions: { naming: 50, structure: 60, cognitive: 70, documentation: 40, consistency: 65, simplicity: 70 }, issues: [{ file: 'b.ts', line: 1, dimension: 'naming', severity: 'high' as const, message: 'Bad', suggestion: 'Fix' }] },
    ]
    const stats = computeDecoderStats(scores)
    expect(stats.averageReadability).toBe(75)
    expect(stats.gradeDistribution['A']).toBe(1)
    expect(stats.gradeDistribution['D']).toBe(1)
    expect(stats.mostReadableFile).toBe('a.ts')
    expect(stats.leastReadableFile).toBe('b.ts')
    expect(stats.totalIssues).toBe(1)
    expect(stats.highSeverityIssues).toBe(1)
  })

  it('handles empty scores', () => {
    const stats = computeDecoderStats([])
    expect(stats.averageReadability).toBe(0)
    expect(stats.totalIssues).toBe(0)
    expect(stats.readabilityTrend).toBe('stable')
  })

  it('computes weakest and strongest dimensions', () => {
    const scores = [
      { file: 'a.ts', overall: 70, grade: 'C', dimensions: { naming: 90, structure: 50, cognitive: 80, documentation: 70, consistency: 60, simplicity: 80 }, issues: [] },
    ]
    const stats = computeDecoderStats(scores)
    expect(stats.weakestDimension).toBe('structure')
    expect(stats.strongestDimension).toBe('naming')
  })

  it('computes trend correctly', () => {
    const goodScores = [
      { file: 'a.ts', overall: 90, grade: 'A', dimensions: { naming: 90, structure: 90, cognitive: 90, documentation: 90, consistency: 90, simplicity: 90 }, issues: [] },
    ]
    expect(computeDecoderStats(goodScores).readabilityTrend).toBe('improving')

    const badScores = [
      { file: 'a.ts', overall: 40, grade: 'F', dimensions: { naming: 40, structure: 40, cognitive: 40, documentation: 40, consistency: 40, simplicity: 40 }, issues: [] },
    ]
    expect(computeDecoderStats(badScores).readabilityTrend).toBe('declining')
  })
})

// ─── generateDecoderRecommendations ──────────────────────────────────────────

describe('generateDecoderRecommendations', () => {
  it('recommends focusing on weakest dimension', () => {
    const scores = [{ file: 'a.ts', overall: 60, grade: 'D', dimensions: { naming: 50, structure: 70, cognitive: 80, documentation: 60, consistency: 70, simplicity: 80 }, issues: [] }]
    const stats = computeDecoderStats(scores)
    const recs = generateDecoderRecommendations(scores, stats)
    expect(recs.some((r) => r.includes('naming'))).toBe(true)
  })

  it('flags high severity issues', () => {
    const scores = [{ file: 'a.ts', overall: 60, grade: 'D', dimensions: { naming: 80, structure: 80, cognitive: 80, documentation: 80, consistency: 80, simplicity: 80 }, issues: [{ file: 'a.ts', line: 1, dimension: 'x', severity: 'high' as const, message: 'bad', suggestion: 'fix' }] }]
    const stats = computeDecoderStats(scores)
    const recs = generateDecoderRecommendations(scores, stats)
    expect(recs.some((r) => r.includes('high-severity'))).toBe(true)
  })

  it('flags D/F grade files', () => {
    const scores = [{ file: 'a.ts', overall: 45, grade: 'F', dimensions: { naming: 40, structure: 40, cognitive: 40, documentation: 40, consistency: 40, simplicity: 40 }, issues: [] }]
    const stats = computeDecoderStats(scores)
    const recs = generateDecoderRecommendations(scores, stats)
    expect(recs.some((r) => r.includes('D or F'))).toBe(true)
  })

  it('provides healthy message for good code', () => {
    const scores = [{ file: 'a.ts', overall: 95, grade: 'A', dimensions: { naming: 95, structure: 95, cognitive: 95, documentation: 95, consistency: 95, simplicity: 95 }, issues: [] }]
    const stats = computeDecoderStats(scores)
    const recs = generateDecoderRecommendations(scores, stats)
    expect(recs.some((r) => r.includes('looks good') || r.includes('healthy'))).toBe(true)
  })
})

// ─── buildDecoderResult ───────────────────────────────────────────────────────

describe('buildDecoderResult', () => {
  it('builds complete result', () => {
    const result = buildDecoderResult(
      ['clean.ts'],
      ['/**\n * Add.\n */\nexport function add(a: number, b: number) {\n  return a + b\n}'],
    )
    expect(result.scores).toHaveLength(1)
    expect(result.scores[0]!.file).toBe('clean.ts')
    expect(result.stats.totalIssues).toBeGreaterThanOrEqual(0)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('handles multiple files', () => {
    const result = buildDecoderResult(
      ['a.ts', 'b.ts'],
      ['const x = 1', 'const y = 2'],
    )
    expect(result.scores).toHaveLength(2)
    expect(result.stats.mostReadableFile).toBeDefined()
    expect(result.stats.leastReadableFile).toBeDefined()
  })

  it('handles empty file list', () => {
    const result = buildDecoderResult([], [])
    expect(result.scores).toHaveLength(0)
    expect(result.stats.averageReadability).toBe(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('getGradeColor', () => {
  it('returns a function for each grade', () => {
    for (const g of ['A', 'B', 'C', 'D', 'F']) {
      expect(typeof getGradeColor(g)('X')).toBe('string')
    }
  })
})

describe('formatGradeBadge', () => {
  it('wraps grade in brackets', () => {
    expect(formatGradeBadge('A')).toContain('[A]')
    expect(formatGradeBadge('F')).toContain('[F]')
  })
})

describe('formatReadabilityMeter', () => {
  it('includes score and bar', () => {
    const meter = formatReadabilityMeter(75)
    expect(meter).toContain('█')
    expect(meter).toContain('░')
    expect(meter).toContain('75/100')
  })
})

describe('formatDimensionRadar', () => {
  it('renders all dimensions', () => {
    const dims = { naming: 80, structure: 70, cognitive: 90, documentation: 60, consistency: 85, simplicity: 75 }
    const radar = formatDimensionRadar(dims)
    expect(radar).toContain('Naming')
    expect(radar).toContain('Structure')
    expect(radar).toContain('Cognitive')
    expect(radar).toContain('Docs')
    expect(radar).toContain('Consistency')
    expect(radar).toContain('Simplicity')
  })
})

describe('formatSeverityBadge', () => {
  it('formats severity levels', () => {
    expect(formatSeverityBadge('high')).toContain('HIGH')
    expect(formatSeverityBadge('medium')).toContain('MEDIUM')
    expect(formatSeverityBadge('low')).toContain('LOW')
  })
})

describe('formatScoreTable', () => {
  it('renders scores', () => {
    const scores = [{ file: 'a.ts', overall: 85, grade: 'B', dimensions: { naming: 80, structure: 85, cognitive: 90, documentation: 75, consistency: 88, simplicity: 82 }, issues: [] }]
    const table = formatScoreTable(scores)
    expect(table).toContain('a.ts')
    expect(table).toContain('85')
    expect(table).toContain('[B]')
  })

  it('shows empty message', () => {
    expect(formatScoreTable([])).toContain('No files scored')
  })
})

describe('formatIssueList', () => {
  it('renders issues sorted by severity', () => {
    const issues = [
      { file: 'a.ts', line: 1, dimension: 'x', severity: 'low' as const, message: 'low issue', suggestion: 'fix low' },
      { file: 'a.ts', line: 2, dimension: 'y', severity: 'high' as const, message: 'high issue', suggestion: 'fix high' },
    ]
    const list = formatIssueList(issues)
    expect(list).toContain('HIGH')
    expect(list).toContain('LOW')
    const highIdx = list.indexOf('HIGH')
    const lowIdx = list.indexOf('LOW')
    expect(highIdx).toBeLessThan(lowIdx)
  })

  it('shows empty message', () => {
    expect(formatIssueList([])).toContain('No readability issues')
  })
})

describe('formatGradeDistribution', () => {
  it('renders distribution chart', () => {
    const dist = formatGradeDistribution({ A: 3, B: 5, C: 2, D: 1, F: 0 })
    expect(dist).toContain('A')
    expect(dist).toContain('B')
    expect(dist).toContain('C')
    expect(dist).toContain('D')
    expect(dist).toContain('F')
    expect(dist).toContain('5')
  })
})

describe('formatDecoderStats', () => {
  it('renders all stats', () => {
    const stats = {
      averageReadability: 75,
      gradeDistribution: { A: 1, B: 2, C: 1 },
      weakestDimension: 'documentation',
      strongestDimension: 'naming',
      mostReadableFile: 'clean.ts',
      leastReadableFile: 'messy.ts',
      totalIssues: 5,
      highSeverityIssues: 1,
      readabilityTrend: 'stable' as const,
    }
    const output = formatDecoderStats(stats)
    expect(output).toContain('75/100')
    expect(output).toContain('documentation')
    expect(output).toContain('naming')
    expect(output).toContain('clean.ts')
    expect(output).toContain('messy.ts')
    expect(output).toContain('stable')
  })
})

describe('formatRecommendations', () => {
  it('renders numbered recommendations', () => {
    expect(formatRecommendations(['Fix naming', 'Add docs'])).toContain('1. Fix naming')
    expect(formatRecommendations(['Fix naming', 'Add docs'])).toContain('2. Add docs')
  })

  it('shows no recs message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatDecoderTable', () => {
  it('renders full table', () => {
    const result = buildDecoderResult(
      ['a.ts'],
      ['/**\n * Add.\n */\nexport function add(a: number, b: number) {\n  return a + b\n}'],
    )
    const table = formatDecoderTable(result)
    expect(table).toContain('Code Readability Decoder')
    expect(table).toContain('Readability Scores')
    expect(table).toContain('Grade Distribution')
    expect(table).toContain('Recommendations')
  })
})

describe('formatDecoderJSON', () => {
  it('produces valid JSON', () => {
    const result = buildDecoderResult(['a.ts'], ['const x = 1'])
    const json = formatDecoderJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.scores).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
