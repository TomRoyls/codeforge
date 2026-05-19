import { describe, expect, it } from 'vitest'

import {
  auditArchitecture,
  auditComplexity,
  auditDependencies,
  auditDocumentation,
  auditSecurity,
  auditSize,
  auditStyle,
  auditTesting,
  buildAuditResult,
  computeGrade,
  computeOverallScore,
  estimateEffort,
  extractTopConcerns,
  extractTopStrengths,
  generateAuditRecommendations,
  type AuditDimension,
  type AuditFinding,
  type AuditSummary,
} from '../src/commands/audit-helpers.js'
import {
  formatConcernsAndStrengths,
  formatDimensionGrid,
  formatEffortEstimate,
  formatFindingsSummary,
  formatFindingsTable,
  formatGradeBadge,
  formatJson,
  formatOverallGrade,
  formatRecommendations,
  formatResult,
  formatStats,
} from '../src/commands/audit-format-helpers.js'

// ─── computeGrade ─────────────────────────────────────────────────────────

describe('computeGrade', () => {
  it('returns A for 90+', () => { expect(computeGrade(95)).toBe('A') })
  it('returns A for exactly 90', () => { expect(computeGrade(90)).toBe('A') })
  it('returns B for 89', () => { expect(computeGrade(89)).toBe('B') })
  it('returns B for 80', () => { expect(computeGrade(80)).toBe('B') })
  it('returns C for 79', () => { expect(computeGrade(79)).toBe('C') })
  it('returns C for 70', () => { expect(computeGrade(70)).toBe('C') })
  it('returns D for 69', () => { expect(computeGrade(69)).toBe('D') })
  it('returns D for 60', () => { expect(computeGrade(60)).toBe('D') })
  it('returns F for 59', () => { expect(computeGrade(59)).toBe('F') })
  it('returns F for 0', () => { expect(computeGrade(0)).toBe('F') })
})

// ─── computeOverallScore ──────────────────────────────────────────────────

describe('computeOverallScore', () => {
  it('computes weighted sum', () => {
    const dims: AuditDimension[] = [
      { name: 'A', score: 100, grade: 'A', icon: '', findings: [], summary: '', weight: 20 },
      { name: 'B', score: 50, grade: 'F', icon: '', findings: [], summary: '', weight: 80 },
    ]
    const result = computeOverallScore(dims)
    expect(result).toBe(60)
  })

  it('handles single dimension', () => {
    const dims: AuditDimension[] = [
      { name: 'X', score: 75, grade: 'C', icon: '', findings: [], summary: '', weight: 100 },
    ]
    expect(computeOverallScore(dims)).toBe(75)
  })

  it('returns 0 for empty dimensions', () => {
    expect(computeOverallScore([])).toBe(0)
  })

  it('handles equal weights', () => {
    const dims: AuditDimension[] = [
      { name: 'A', score: 80, grade: 'B', icon: '', findings: [], summary: '', weight: 50 },
      { name: 'B', score: 60, grade: 'D', icon: '', findings: [], summary: '', weight: 50 },
    ]
    expect(computeOverallScore(dims)).toBe(70)
  })
})

// ─── auditComplexity ──────────────────────────────────────────────────────

describe('auditComplexity', () => {
  it('returns high score for simple code', () => {
    const result = auditComplexity(['a.ts'], ['const x = 1\nconst y = 2'])
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.name).toBe('Complexity')
    expect(result.weight).toBe(20)
  })

  it('penalizes highly complex code', () => {
    const branches = 'if (a) {} else if (b) {} else if (c) {} else if (d) {} else if (e) {} else if (f) {} else if (g) {} else if (h) {} else if (i) {}'
    const code = `function complex() { ${branches} }`
    const result = auditComplexity(['a.ts'], [code])
    expect(result.findings.length).toBeGreaterThanOrEqual(1)
  })

  it('returns findings with correct dimension', () => {
    const result = auditComplexity(['a.ts'], ['function foo() {}'])
    for (const f of result.findings) {
      expect(f.dimension).toBe('Complexity')
    }
  })

  it('handles empty files', () => {
    const result = auditComplexity([], [])
    expect(result.score).toBe(100)
  })
})

// ─── auditSize ────────────────────────────────────────────────────────────

describe('auditSize', () => {
  it('returns high score for small files', () => {
    const result = auditSize(['a.ts'], ['const x = 1'])
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.name).toBe('Size')
    expect(result.weight).toBe(10)
  })

  it('flags oversized files', () => {
    const bigFile = Array(600).fill('const x = 1;').join('\n')
    const result = auditSize(['big.ts'], [bigFile])
    expect(result.findings.length).toBeGreaterThanOrEqual(1)
  })

  it('flags very large files as errors', () => {
    const huge = Array(1100).fill('const x = 1;').join('\n')
    const result = auditSize(['huge.ts'], [huge])
    expect(result.findings.some((f) => f.severity === 'error')).toBe(true)
  })

  it('handles empty input', () => {
    const result = auditSize([], [])
    expect(result.score).toBe(100)
  })
})

// ─── auditDependencies ────────────────────────────────────────────────────

describe('auditDependencies', () => {
  it('returns high score for few imports', () => {
    const result = auditDependencies(['a.ts'], ["import x from 'y'\nconst z = 1"])
    expect(result.score).toBeGreaterThanOrEqual(70)
    expect(result.name).toBe('Dependencies')
    expect(result.weight).toBe(15)
  })

  it('flags high import count', () => {
    const imports = Array(16).fill(0).map((_, i) => `import mod${i} from 'mod${i}'`).join('\n')
    const result = auditDependencies(['a.ts'], [imports])
    expect(result.findings.some((f) => f.severity === 'error')).toBe(true)
  })

  it('warns on moderate imports', () => {
    const imports = Array(11).fill(0).map((_, i) => `import mod${i} from 'mod${i}'`).join('\n')
    const result = auditDependencies(['a.ts'], [imports])
    expect(result.findings.some((f) => f.severity === 'warning')).toBe(true)
  })

  it('handles empty input', () => {
    const result = auditDependencies([], [])
    expect(result.score).toBe(100)
  })
})

// ─── auditDocumentation ───────────────────────────────────────────────────

describe('auditDocumentation', () => {
  it('returns high score for well-documented code', () => {
    const code = [
      '/** Add two numbers */',
      'function add(a: number, b: number): number {',
      '  // sum the values',
      '  return a + b',
      '}',
    ].join('\n')
    const result = auditDocumentation(['a.ts'], [code])
    expect(result.name).toBe('Documentation')
    expect(result.weight).toBe(15)
  })

  it('penalizes low comment ratio', () => {
    const code = Array(60).fill('const x = computeValue()').join('\n')
    const result = auditDocumentation(['a.ts'], [code])
    expect(result.findings.some((f) => f.severity === 'warning')).toBe(true)
  })

  it('handles empty input', () => {
    const result = auditDocumentation([], [])
    expect(result.score).toBe(100)
  })
})

// ─── auditSecurity ────────────────────────────────────────────────────────

describe('auditSecurity', () => {
  it('detects eval usage', () => {
    const result = auditSecurity(['a.ts'], ['eval("code")'])
    expect(result.findings.some((f) => f.message.includes('eval'))).toBe(true)
  })

  it('detects innerHTML assignment', () => {
    const result = auditSecurity(['a.ts'], ['el.innerHTML = userInput'])
    expect(result.findings.some((f) => f.message.includes('innerHTML'))).toBe(true)
  })

  it('detects hardcoded password', () => {
    const result = auditSecurity(['a.ts'], ["const password = 'secret123'"])
    expect(result.findings.some((f) => f.message.includes('password'))).toBe(true)
  })

  it('detects hardcoded API key', () => {
    const result = auditSecurity(['a.ts'], ["const api_key = 'abc123'"])
    expect(result.findings.some((f) => f.message.includes('API key'))).toBe(true)
  })

  it('detects document.write', () => {
    const result = auditSecurity(['a.ts'], ['document.write("html")'])
    expect(result.findings.some((f) => f.message.includes('document.write'))).toBe(true)
  })

  it('skips comments', () => {
    const result = auditSecurity(['a.ts'], ['// eval("not real")'])
    expect(result.findings.some((f) => f.message.includes('eval'))).toBe(false)
  })

  it('returns high score for secure code', () => {
    const result = auditSecurity(['a.ts'], ['const x = 1'])
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.name).toBe('Security')
    expect(result.weight).toBe(10)
  })

  it('handles empty input', () => {
    const result = auditSecurity([], [])
    expect(result.score).toBe(100)
  })
})

// ─── auditStyle ───────────────────────────────────────────────────────────

describe('auditStyle', () => {
  it('detects mixed naming conventions', () => {
    const code = [
      'const myVariable = getSomeValue()',
      'const my_other_var = get_other_val()',
      'const yetAnotherVar = getAnotherValue()',
      'const snake_case_var = get_snake_val()',
      'const moreCamelCase = getMoreCamel()',
      'const even_more_snake = get_even_more()',
      'const andMoreCamelCase = getAndMore()',
      'const last_snake_one = get_last_one()',
      'const finalCamelCase = getFinal()',
      'const really_snake_case = get_snake()',
    ].join('\n')
    const result = auditStyle(['a.ts'], [code])
    expect(result.findings.some((f) => f.message.includes('Mixed naming'))).toBe(true)
  })

  it('returns score for consistent naming', () => {
    const result = auditStyle(['a.ts'], ['const myVar = getValue()'])
    expect(result.score).toBeGreaterThanOrEqual(50)
    expect(result.name).toBe('Style')
    expect(result.weight).toBe(10)
  })

  it('handles empty input', () => {
    const result = auditStyle([], [])
    expect(result.score).toBe(100)
  })
})

// ─── auditTesting ─────────────────────────────────────────────────────────

describe('auditTesting', () => {
  it('flags no test files', () => {
    const result = auditTesting(['a.ts', 'b.ts'], ['code1', 'code2'])
    expect(result.findings.some((f) => f.message.includes('No test files'))).toBe(true)
    expect(result.score).toBeLessThan(50)
  })

  it('rewards test files', () => {
    const result = auditTesting(
      ['a.ts', 'a.test.ts'],
      ['function foo() {}', 'test("foo", () => { expect(foo()).toBeDefined() })'],
    )
    expect(result.score).toBeGreaterThanOrEqual(60)
  })

  it('handles all test files', () => {
    const result = auditTesting(['a.test.ts'], ['test("x", () => {})'])
    expect(result.score).toBeGreaterThanOrEqual(80)
  })

  it('handles empty input', () => {
    const result = auditTesting([], [])
    expect(result.score).toBe(100)
    expect(result.name).toBe('Testing')
    expect(result.weight).toBe(10)
  })

  it('counts spec files as test files', () => {
    const result = auditTesting(
      ['a.ts', 'a.spec.ts'],
      ['code', 'it("works", () => {})'],
    )
    expect(result.findings.some((f) => f.message.includes('No test files'))).toBe(false)
  })
})

// ─── auditArchitecture ────────────────────────────────────────────────────

describe('auditArchitecture', () => {
  it('penalizes deep nesting', () => {
    const code = 'if (a) {\n' + '  if (b) {\n'.repeat(7) + '    const x = 1\n' + '  }\n'.repeat(7) + '}'
    const result = auditArchitecture(['a.ts'], [code])
    expect(result.findings.some((f) => f.message.includes('Deep nesting'))).toBe(true)
  })

  it('penalizes oversized modules', () => {
    const exports = Array(25).fill(0).map((_, i) => `export const val${i} = ${i}`).join('\n')
    const result = auditArchitecture(['a.ts'], [exports])
    expect(result.findings.some((f) => f.message.includes('exports'))).toBe(true)
  })

  it('returns high score for clean architecture', () => {
    const result = auditArchitecture(['a.ts'], ['export function handler() {}'])
    expect(result.score).toBeGreaterThanOrEqual(70)
    expect(result.name).toBe('Architecture')
    expect(result.weight).toBe(10)
  })

  it('handles empty input', () => {
    const result = auditArchitecture([], [])
    expect(result.score).toBe(100)
  })
})

// ─── extractTopConcerns ───────────────────────────────────────────────────

describe('extractTopConcerns', () => {
  it('extracts up to 5 concerns', () => {
    const findings: AuditFinding[] = Array(10).fill(0).map((_, i) => ({
      dimension: 'Test', severity: 'error' as const,
      message: `Error ${i}`, file: 'a.ts', line: i, suggestion: 'Fix it',
    }))
    const concerns = extractTopConcerns(findings)
    expect(concerns.length).toBeLessThanOrEqual(5)
  })

  it('sorts errors before warnings', () => {
    const findings: AuditFinding[] = [
      { dimension: 'A', severity: 'warning', message: 'Warn', file: 'a.ts', line: 1, suggestion: '' },
      { dimension: 'A', severity: 'error', message: 'Error', file: 'a.ts', line: 1, suggestion: '' },
    ]
    const concerns = extractTopConcerns(findings)
    expect(concerns[0]).toContain('Error')
  })

  it('includes file location', () => {
    const findings: AuditFinding[] = [
      { dimension: 'A', severity: 'error', message: 'Bad', file: 'src/a.ts', line: 42, suggestion: '' },
    ]
    expect(extractTopConcerns(findings)[0]).toContain('src/a.ts:42')
  })

  it('handles findings without file', () => {
    const findings: AuditFinding[] = [
      { dimension: 'A', severity: 'warning', message: 'General', file: '', line: 0, suggestion: '' },
    ]
    expect(extractTopConcerns(findings)[0]).toBe('General')
  })

  it('returns empty for info-only findings', () => {
    const findings: AuditFinding[] = [
      { dimension: 'A', severity: 'info', message: 'Info', file: '', line: 0, suggestion: '' },
    ]
    expect(extractTopConcerns(findings)).toEqual([])
  })
})

// ─── extractTopStrengths ──────────────────────────────────────────────────

describe('extractTopStrengths', () => {
  it('extracts up to 5 strengths sorted by score', () => {
    const dims: AuditDimension[] = Array(8).fill(0).map((_, i) => ({
      name: `Dim${i}`, score: i * 12 + 10, grade: 'A', icon: '', findings: [], summary: '', weight: 10,
    }))
    const strengths = extractTopStrengths(dims)
    expect(strengths.length).toBeLessThanOrEqual(5)
    expect(strengths[0]).toContain('94')
  })

  it('returns empty for no dimensions', () => {
    expect(extractTopStrengths([])).toEqual([])
  })
})

// ─── estimateEffort ───────────────────────────────────────────────────────

describe('estimateEffort', () => {
  it('returns no effort for empty findings', () => {
    expect(estimateEffort([])).toBe('No effort needed')
  })

  it('returns minutes for small effort', () => {
    const findings: AuditFinding[] = [
      { dimension: 'A', severity: 'info', message: 'M', file: '', line: 0, suggestion: '' },
    ]
    expect(estimateEffort(findings)).toContain('minutes')
  })

  it('returns hours for moderate effort', () => {
    const findings: AuditFinding[] = Array(5).fill(0).map(() => ({
      dimension: 'A', severity: 'error' as const, message: 'E', file: '', line: 0, suggestion: '',
    }))
    expect(estimateEffort(findings)).toContain('hours')
  })

  it('returns days for large effort', () => {
    const findings: AuditFinding[] = Array(30).fill(0).map(() => ({
      dimension: 'A', severity: 'error' as const, message: 'E', file: '', line: 0, suggestion: '',
    }))
    expect(estimateEffort(findings)).toContain('days')
  })
})

// ─── generateAuditRecommendations ─────────────────────────────────────────

describe('generateAuditRecommendations', () => {
  it('recommends improving weak dimensions', () => {
    const summary: AuditSummary = {
      overall: 50, overallGrade: 'F',
      dimensions: [
        { name: 'Security', score: 30, grade: 'F', icon: '', findings: [{ dimension: 'Security', severity: 'error', message: 'eval', file: 'a.ts', line: 1, suggestion: '' }], summary: '', weight: 10 },
      ],
      criticalFindings: [{ dimension: 'Security', severity: 'error', message: 'eval', file: 'a.ts', line: 1, suggestion: '' }],
      topConcerns: [], topStrengths: [], estimatedEffort: '1 hour',
    }
    const recs = generateAuditRecommendations(summary)
    expect(recs.some((r) => r.includes('Security'))).toBe(true)
  })

  it('praises strong scores', () => {
    const summary: AuditSummary = {
      overall: 90, overallGrade: 'A',
      dimensions: [
        { name: 'Complexity', score: 95, grade: 'A', icon: '', findings: [], summary: '', weight: 20 },
        { name: 'Size', score: 90, grade: 'A', icon: '', findings: [], summary: '', weight: 10 },
      ],
      criticalFindings: [], topConcerns: [], topStrengths: [], estimatedEffort: '',
    }
    const recs = generateAuditRecommendations(summary)
    expect(recs.some((r) => r.includes('good'))).toBe(true)
  })

  it('handles low overall score', () => {
    const summary: AuditSummary = {
      overall: 40, overallGrade: 'F',
      dimensions: [],
      criticalFindings: [], topConcerns: [], topStrengths: [], estimatedEffort: '',
    }
    const recs = generateAuditRecommendations(summary)
    expect(recs.some((r) => r.includes('significant'))).toBe(true)
  })

  it('handles medium overall score', () => {
    const summary: AuditSummary = {
      overall: 65, overallGrade: 'D',
      dimensions: [],
      criticalFindings: [], topConcerns: [], topStrengths: [], estimatedEffort: '',
    }
    const recs = generateAuditRecommendations(summary)
    expect(recs.some((r) => r.includes('moderate'))).toBe(true)
  })
})

// ─── buildAuditResult ─────────────────────────────────────────────────────

describe('buildAuditResult', () => {
  it('returns complete result structure', () => {
    const result = buildAuditResult(['a.ts'], ['const x = 1'])
    expect(result).toHaveProperty('summary')
    expect(result).toHaveProperty('findings')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('assesses all 8 dimensions', () => {
    const result = buildAuditResult(['a.ts'], ['const x = 1'])
    expect(result.summary.dimensions).toHaveLength(8)
    expect(result.stats.dimensionsAssessed).toBe(8)
  })

  it('computes overall score and grade', () => {
    const result = buildAuditResult(['a.ts'], ['const x = 1'])
    expect(result.summary.overall).toBeGreaterThanOrEqual(0)
    expect(result.summary.overall).toBeLessThanOrEqual(100)
    expect(['A', 'B', 'C', 'D', 'F']).toContain(result.summary.overallGrade)
  })

  it('counts files and lines', () => {
    const result = buildAuditResult(['a.ts', 'b.ts'], ['line1\nline2', 'line3'])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalLines).toBe(3)
  })

  it('counts findings by severity', () => {
    const result = buildAuditResult(['a.ts'], ["eval('code')"])
    expect(result.stats.errorCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFindings).toBeGreaterThanOrEqual(1)
  })

  it('sets audit timestamp', () => {
    const result = buildAuditResult(['a.ts'], ['x'])
    expect(result.stats.auditTimestamp).toBeTruthy()
    expect(new Date(result.stats.auditTimestamp).getTime()).not.toBeNaN()
  })

  it('handles empty input', () => {
    const result = buildAuditResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalLines).toBe(0)
    expect(result.summary.overall).toBeGreaterThanOrEqual(0)
  })

  it('processes multiple files', () => {
    const result = buildAuditResult(
      ['a.ts', 'b.ts', 'a.test.ts'],
      ['const x = 1', "import y from 'z'", 'test("x", () => {})'],
    )
    expect(result.stats.totalFiles).toBe(3)
  })
})

// ─── formatGradeBadge ─────────────────────────────────────────────────────

describe('formatGradeBadge', () => {
  it('formats A grade', () => {
    const output = formatGradeBadge('A', 95)
    expect(output).toContain('A')
    expect(output).toContain('95')
  })

  it('formats F grade', () => {
    const output = formatGradeBadge('F', 30)
    expect(output).toContain('F')
    expect(output).toContain('30')
  })
})

// ─── formatDimensionGrid ──────────────────────────────────────────────────

describe('formatDimensionGrid', () => {
  it('formats grid with all dimensions', () => {
    const dims: AuditDimension[] = [
      { name: 'Complexity', score: 90, grade: 'A', icon: '🧠', findings: [], summary: '', weight: 20 },
      { name: 'Security', score: 70, grade: 'C', icon: '🔒', findings: [], summary: '', weight: 10 },
    ]
    const output = formatDimensionGrid(dims)
    expect(output).toContain('Complexity')
    expect(output).toContain('Security')
    expect(output).toContain('SCORECARD')
  })
})

// ─── formatOverallGrade ───────────────────────────────────────────────────

describe('formatOverallGrade', () => {
  it('formats overall grade display', () => {
    const output = formatOverallGrade(85, 'B')
    expect(output).toContain('OVERALL GRADE')
    expect(output).toContain('B')
    expect(output).toContain('85')
  })
})

// ─── formatFindingsSummary ────────────────────────────────────────────────

describe('formatFindingsSummary', () => {
  it('formats counts by severity', () => {
    const output = formatFindingsSummary({
      totalFiles: 5, totalLines: 100, totalFindings: 7,
      errorCount: 2, warningCount: 3, infoCount: 2,
      dimensionsAssessed: 8, auditTimestamp: '',
    })
    expect(output).toContain('Errors:')
    expect(output).toContain('Warnings:')
    expect(output).toContain('Total:')
  })
})

// ─── formatFindingsTable ──────────────────────────────────────────────────

describe('formatFindingsTable', () => {
  it('formats findings with severity icons', () => {
    const findings: AuditFinding[] = [
      { dimension: 'Security', severity: 'error', message: 'eval found', file: 'a.ts', line: 1, suggestion: 'Remove eval' },
    ]
    const output = formatFindingsTable(findings)
    expect(output).toContain('eval found')
    expect(output).toContain('Remove eval')
  })

  it('returns clean message for no findings', () => {
    expect(formatFindingsTable([])).toContain('clean')
  })

  it('limits to 30 findings', () => {
    const findings: AuditFinding[] = Array(40).fill(0).map((_, i) => ({
      dimension: 'Test', severity: 'info' as const, message: `Finding ${i}`, file: 'a.ts', line: i, suggestion: '',
    }))
    const output = formatFindingsTable(findings)
    expect(output).toContain('more findings')
  })
})

// ─── formatConcernsAndStrengths ────────────────────────────────────────────

describe('formatConcernsAndStrengths', () => {
  it('formats concerns and strengths', () => {
    const summary: AuditSummary = {
      overall: 80, overallGrade: 'B', dimensions: [],
      criticalFindings: [],
      topConcerns: ['eval in a.ts:1'],
      topStrengths: ['Complexity: A (95)'],
      estimatedEffort: '1 hour',
    }
    const output = formatConcernsAndStrengths(summary)
    expect(output).toContain('Top Concerns')
    expect(output).toContain('Top Strengths')
    expect(output).toContain('eval in a.ts:1')
  })

  it('handles empty concerns', () => {
    const summary: AuditSummary = {
      overall: 95, overallGrade: 'A', dimensions: [],
      criticalFindings: [], topConcerns: [], topStrengths: [], estimatedEffort: '',
    }
    const output = formatConcernsAndStrengths(summary)
    expect(output).not.toContain('Top Concerns')
  })
})

// ─── formatEffortEstimate ─────────────────────────────────────────────────

describe('formatEffortEstimate', () => {
  it('formats effort string', () => {
    const output = formatEffortEstimate('~2 hours')
    expect(output).toContain('~2 hours')
  })
})

// ─── formatRecommendations ────────────────────────────────────────────────

describe('formatRecommendations', () => {
  it('formats numbered recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('1. Fix X')
    expect(output).toContain('2. Improve Y')
  })

  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

// ─── formatStats ──────────────────────────────────────────────────────────

describe('formatStats', () => {
  it('formats all stat fields', () => {
    const output = formatStats({
      totalFiles: 10, totalLines: 500, totalFindings: 3,
      errorCount: 1, warningCount: 1, infoCount: 1,
      dimensionsAssessed: 8, auditTimestamp: '2026-01-01T00:00:00.000Z',
    })
    expect(output).toContain('10')
    expect(output).toContain('500')
    expect(output).toContain('8')
  })
})

// ─── formatResult ─────────────────────────────────────────────────────────

describe('formatResult', () => {
  it('combines all sections into full report', () => {
    const result = buildAuditResult(['a.ts'], ['const x = 1'])
    const output = formatResult(result)
    expect(output).toContain('SCORECARD')
    expect(output).toContain('OVERALL GRADE')
    expect(output).toContain('Findings Summary')
    expect(output).toContain('Recommendations')
    expect(output).toContain('Audit Statistics')
  })
})

// ─── formatJson ───────────────────────────────────────────────────────────

describe('formatJson', () => {
  it('produces valid JSON', () => {
    const result = buildAuditResult(['a.ts'], ['const x = 1'])
    const json = formatJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('summary')
    expect(parsed).toHaveProperty('findings')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })
})
