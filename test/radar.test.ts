import { describe, expect, it } from 'vitest'
import {
  buildRadarResult,
  classifyShape,
  computeComplexityScore,
  computeConsistencyScore,
  computeCouplingScore,
  computeDocumentationScore,
  computeMaintainabilityScore,
  computeOverallScore,
  computePerformanceScore,
  computeSecurityScore,
  computeTestingScore,
  drawRadarChart,
  generateRecommendations,
  type RadarChart,
  type RadarDimension,
  type RadarStats,
} from '../src/commands/radar-helpers.js'
import {
  formatDimensionTable,
  formatRadarChart,
  formatRadarJson,
  formatRadarOutput,
  formatRecommendations,
  formatShape,
  formatStats,
  formatStrengthsWeaknesses,
  gradeColor,
  scoreBar,
} from '../src/commands/radar-format-helpers.js'

// ─── computeComplexityScore ───────────────────────────────────────────────────

describe('computeComplexityScore', () => {
  it('scores 100 for simple code', () => {
    const dim = computeComplexityScore(['a.ts'], ['const x = 1'])
    expect(dim.score).toBe(100)
    expect(dim.grade).toBe('A')
  })

  it('penalizes high branching density', () => {
    const code = Array(10).fill('if (x) { if (y) { if (z) {} } }').join('\n')
    const dim = computeComplexityScore(['a.ts'], [code])
    expect(dim.score).toBeLessThan(100)
  })

  it('penalizes deep nesting', () => {
    const code = '{'.repeat(8) + '}'.repeat(8)
    const dim = computeComplexityScore(['a.ts'], [code])
    expect(dim.score).toBeLessThan(100)
    expect(dim.findings.some((f) => f.includes('nesting'))).toBe(true)
  })

  it('returns findings array', () => {
    const dim = computeComplexityScore(['a.ts'], ['const x = 1'])
    expect(dim.findings.length).toBeGreaterThan(0)
  })
})

// ─── computeDocumentationScore ────────────────────────────────────────────────

describe('computeDocumentationScore', () => {
  it('scores low with no comments', () => {
    const dim = computeDocumentationScore(['a.ts'], ['function foo() {}'])
    expect(dim.score).toBeLessThan(50)
  })

  it('scores higher with JSDoc', () => {
    const code = '/** docs */\nfunction foo() {}'
    const dim = computeDocumentationScore(['a.ts'], [code])
    expect(dim.score).toBeGreaterThan(30)
  })

  it('scores well with high comment ratio', () => {
    const lines = Array(20).fill('// comment line').join('\n') + '\nfunction foo() {}'
    const dim = computeDocumentationScore(['a.ts'], [lines])
    expect(dim.score).toBeGreaterThan(50)
  })
})

// ─── computeTestingScore ──────────────────────────────────────────────────────

describe('computeTestingScore', () => {
  it('scores low with no tests', () => {
    const dim = computeTestingScore(['a.ts'], ['const x = 1'])
    expect(dim.score).toBeLessThanOrEqual(40)
  })

  it('scores higher with test files', () => {
    const dim = computeTestingScore(
      ['a.test.ts', 'a.ts'],
      ['describe("x", () => { it("works", () => { expect(1).toBe(1) }) })', 'const x = 1'],
    )
    expect(dim.score).toBeGreaterThan(40)
  })

  it('penalizes missing assertions', () => {
    const dim = computeTestingScore(['a.ts'], ['const x = 1'])
    expect(dim.findings.some((f) => f.includes('assertion') || f.includes('ratio'))).toBe(true)
  })
})

// ─── computeSecurityScore ─────────────────────────────────────────────────────

describe('computeSecurityScore', () => {
  it('scores 100 with no dangerous patterns', () => {
    const dim = computeSecurityScore(['a.ts'], ['const x = 1'])
    expect(dim.score).toBe(100)
  })

  it('penalizes eval usage', () => {
    const dim = computeSecurityScore(['a.ts'], ['eval("code")'])
    expect(dim.score).toBeLessThan(100)
    expect(dim.findings.some((f) => f.includes('eval'))).toBe(true)
  })

  it('penalizes hardcoded secrets', () => {
    const dim = computeSecurityScore(['a.ts'], ['password = "secret123"'])
    expect(dim.score).toBeLessThan(100)
    expect(dim.findings.some((f) => f.includes('secret'))).toBe(true)
  })

  it('penalizes innerHTML', () => {
    const dim = computeSecurityScore(['a.ts'], ['el.innerHTML = userInput'])
    expect(dim.score).toBeLessThan(100)
  })
})

// ─── computePerformanceScore ──────────────────────────────────────────────────

describe('computePerformanceScore', () => {
  it('scores 100 with no anti-patterns', () => {
    const dim = computePerformanceScore(['a.ts'], ['const x = 1'])
    expect(dim.score).toBe(100)
  })

  it('penalizes sync file reads', () => {
    const dim = computePerformanceScore(['a.ts'], ['readFileSync("x")'])
    expect(dim.score).toBeLessThan(100)
    expect(dim.findings.some((f) => f.includes('Sync'))).toBe(true)
  })

  it('penalizes JSON parse/stringify copies', () => {
    const dim = computePerformanceScore(['a.ts'], ['JSON.parse(JSON.stringify(obj))'])
    expect(dim.score).toBeLessThan(100)
  })
})

// ─── computeMaintainabilityScore ──────────────────────────────────────────────

describe('computeMaintainabilityScore', () => {
  it('scores 100 for small clean files', () => {
    const dim = computeMaintainabilityScore(['a.ts'], ['function f() {}'])
    expect(dim.score).toBe(100)
  })

  it('penalizes large files', () => {
    const bigFile = Array(350).fill('const x = 1').join('\n')
    const dim = computeMaintainabilityScore(['a.ts'], [bigFile])
    expect(dim.score).toBeLessThan(100)
    expect(dim.findings.some((f) => f.includes('300 lines'))).toBe(true)
  })

  it('penalizes long functions', () => {
    const longFn = 'function big() {\n' + Array(55).fill('  x = x + 1').join('\n') + '\n}'
    const dim = computeMaintainabilityScore(['a.ts'], [longFn])
    expect(dim.score).toBeLessThan(100)
  })
})

// ─── computeCouplingScore ─────────────────────────────────────────────────────

describe('computeCouplingScore', () => {
  it('scores 100 with no imports', () => {
    const dim = computeCouplingScore(['a.ts'], ['const x = 1'])
    expect(dim.score).toBe(100)
  })

  it('penalizes many imports', () => {
    const imports = Array(12).fill(0).map((_, i) => `import mod${i} from "mod${i}"`).join('\n')
    const dim = computeCouplingScore(['a.ts'], [imports])
    expect(dim.score).toBeLessThan(100)
  })

  it('penalizes high import files', () => {
    const imports = Array(12).fill(0).map((_, i) => `import mod${i} from "mod${i}"`).join('\n')
    const dim = computeCouplingScore(['a.ts'], [imports])
    expect(dim.findings.some((f) => f.includes('10+ imports'))).toBe(true)
  })
})

// ─── computeConsistencyScore ──────────────────────────────────────────────────

describe('computeConsistencyScore', () => {
  it('scores 100 for consistent style', () => {
    const dim = computeConsistencyScore(['a.ts'], ['import x from "x"'])
    expect(dim.score).toBe(100)
  })

  it('penalizes mixed import styles', () => {
    const code = 'import x from "x"\nconst y = require("y")'
    const dim = computeConsistencyScore(['a.ts'], [code])
    expect(dim.score).toBeLessThan(100)
    expect(dim.findings.some((f) => f.includes('Mixed import'))).toBe(true)
  })

  it('penalizes mixed quote styles', () => {
    const code = "const a = 'x'\nconst b = \"y\"\nconst c = 'z'\nconst d = \"w\""
    const dim = computeConsistencyScore(['a.ts'], [code])
    expect(dim.score).toBeLessThan(100)
  })
})

// ─── computeOverallScore ──────────────────────────────────────────────────────

describe('computeOverallScore', () => {
  it('computes weighted average', () => {
    const dims: RadarDimension[] = [
      { name: 'A', score: 80, grade: 'B', weight: 1, description: '', findings: [] },
      { name: 'B', score: 60, grade: 'D', weight: 1, description: '', findings: [] },
    ]
    expect(computeOverallScore(dims)).toBe(70)
  })

  it('respects weights', () => {
    const dims: RadarDimension[] = [
      { name: 'A', score: 100, grade: 'A', weight: 2, description: '', findings: [] },
      { name: 'B', score: 0, grade: 'F', weight: 1, description: '', findings: [] },
    ]
    expect(computeOverallScore(dims)).toBe(66.7)
  })

  it('returns 0 for empty dimensions', () => {
    expect(computeOverallScore([])).toBe(0)
  })
})

// ─── classifyShape ────────────────────────────────────────────────────────────

describe('classifyShape', () => {
  it('classifies uniform scores as balanced', () => {
    expect(classifyShape([80, 80, 80, 80])).toBe('balanced')
  })

  it('classifies one dominant score as peaked', () => {
    expect(classifyShape([100, 50, 55, 52])).toBe('peaked')
  })

  it('classifies one weak score as valleyed', () => {
    expect(classifyShape([70, 70, 70, 20])).toBe('valleyed')
  })

  it('classifies varied scores as irregular', () => {
    expect(classifyShape([100, 30, 90, 20, 80])).toBe('irregular')
  })

  it('returns irregular for empty array', () => {
    expect(classifyShape([])).toBe('irregular')
  })
})

// ─── drawRadarChart ───────────────────────────────────────────────────────────

describe('drawRadarChart', () => {
  it('returns array of strings', () => {
    const dims: RadarDimension[] = Array.from({ length: 8 }, (_, i) => ({
      name: `Dim${i}`, score: 50 + i * 5, grade: 'B', weight: 1, description: '', findings: [],
    }))
    const art = drawRadarChart(dims)
    expect(art.length).toBeGreaterThan(0)
    expect(typeof art[0]).toBe('string')
  })

  it('includes dimension labels', () => {
    const dims: RadarDimension[] = Array.from({ length: 8 }, (_, i) => ({
      name: `Dim${i}`, score: 50, grade: 'C', weight: 1, description: '', findings: [],
    }))
    const art = drawRadarChart(dims)
    const joined = art.join('\n')
    expect(joined).toContain('Dim0:50')
  })

  it('plots points for high scores', () => {
    const dims: RadarDimension[] = Array.from({ length: 8 }, (_, i) => ({
      name: `Dim${i}`, score: 100, grade: 'A', weight: 1, description: '', findings: [],
    }))
    const art = drawRadarChart(dims)
    const joined = art.join('')
    expect(joined).toContain('◆')
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends for low scores', () => {
    const chart: RadarChart = {
      dimensions: [
        { name: 'Testing', score: 20, grade: 'F', weight: 1, description: '', findings: ['Low coverage'] },
        { name: 'Security', score: 30, grade: 'F', weight: 1, description: '', findings: ['eval found'] },
        { name: 'Docs', score: 85, grade: 'B', weight: 1, description: '', findings: [] },
      ],
      overall: 45, overallGrade: 'D', shape: 'irregular',
      strengths: ['Docs'], weaknesses: ['Testing', 'Security'],
    }
    const recs = generateRecommendations(chart)
    expect(recs.some((r) => r.includes('Testing'))).toBe(true)
    expect(recs.some((r) => r.includes('Security'))).toBe(true)
  })

  it('notes irregular shape', () => {
    const chart: RadarChart = {
      dimensions: [], overall: 70, overallGrade: 'C', shape: 'irregular',
      strengths: [], weaknesses: [],
    }
    const recs = generateRecommendations(chart)
    expect(recs.some((r) => r.includes('irregular'))).toBe(true)
  })

  it('returns healthy message for good scores', () => {
    const chart: RadarChart = {
      dimensions: [
        { name: 'A', score: 90, grade: 'A', weight: 1, description: '', findings: [] },
      ],
      overall: 90, overallGrade: 'A', shape: 'balanced',
      strengths: ['A'], weaknesses: [],
    }
    const recs = generateRecommendations(chart)
    expect(recs.some((r) => r.includes('good'))).toBe(true)
  })

  it('warns about low overall score', () => {
    const chart: RadarChart = {
      dimensions: [], overall: 40, overallGrade: 'D', shape: 'balanced',
      strengths: [], weaknesses: [],
    }
    const recs = generateRecommendations(chart)
    expect(recs.some((r) => r.includes('40/100'))).toBe(true)
  })
})

// ─── buildRadarResult ─────────────────────────────────────────────────────────

describe('buildRadarResult', () => {
  it('returns complete result with 8 dimensions', () => {
    const result = buildRadarResult(['a.ts'], ['const x = 1'])
    expect(result.chart.dimensions.length).toBe(8)
    expect(result.chart.overall).toBeGreaterThan(0)
    expect(result.chart.shape).toBeDefined()
    expect(result.asciiArt.length).toBeGreaterThan(0)
    expect(result.stats.totalDimensions).toBe(8)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty files', () => {
    const result = buildRadarResult([], [])
    expect(result.chart.overall).toBeGreaterThan(0)
    expect(result.stats.totalDimensions).toBe(8)
  })

  it('computes balance score', () => {
    const result = buildRadarResult(['a.ts'], ['const x = 1'])
    expect(result.stats.balanceScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.balanceScore).toBeLessThanOrEqual(100)
  })

  it('computes standard deviation', () => {
    const result = buildRadarResult(['a.ts'], ['const x = 1'])
    expect(result.stats.standardDeviation).toBeGreaterThanOrEqual(0)
  })

  it('identifies strengths and weaknesses', () => {
    const result = buildRadarResult(['a.ts'], ['const x = 1'])
    expect(result.chart.strengths.length).toBe(3)
    expect(result.chart.weaknesses.length).toBe(3)
  })
})

// ─── format-helpers ───────────────────────────────────────────────────────────

describe('gradeColor', () => {
  it('returns colored grade for each letter', () => {
    expect(gradeColor('A')).toContain('A')
    expect(gradeColor('B')).toContain('B')
    expect(gradeColor('C')).toContain('C')
    expect(gradeColor('D')).toContain('D')
    expect(gradeColor('F')).toContain('F')
  })
})

describe('scoreBar', () => {
  it('renders 20-char bar', () => {
    const bar = scoreBar(50)
    const stripped = bar.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped.length).toBe(20)
    expect(stripped).toContain('█')
    expect(stripped).toContain('░')
  })

  it('renders full bar for 100', () => {
    const bar = scoreBar(100)
    const stripped = bar.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('████████████████████')
  })

  it('renders empty bar for 0', () => {
    const bar = scoreBar(0)
    const stripped = bar.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('░░░░░░░░░░░░░░░░░░░░')
  })
})

describe('formatDimensionTable', () => {
  it('returns (no dimensions) for empty', () => {
    expect(formatDimensionTable([])).toContain('(no dimensions)')
  })

  it('includes all dimensions', () => {
    const dims: RadarDimension[] = [
      { name: 'Complexity', score: 85, grade: 'B', weight: 1.2, description: '', findings: [] },
    ]
    const table = formatDimensionTable(dims)
    expect(table).toContain('Complexity')
    expect(table).toContain('85')
  })
})

describe('formatRadarChart', () => {
  it('joins lines', () => {
    const result = formatRadarChart(['line1', 'line2'])
    expect(result).toBe('line1\nline2')
  })
})

describe('formatShape', () => {
  it('describes balanced', () => {
    expect(formatShape('balanced')).toContain('evenly distributed')
  })
  it('describes peaked', () => {
    expect(formatShape('peaked')).toContain('dominates')
  })
  it('describes valleyed', () => {
    expect(formatShape('valleyed')).toContain('weak')
  })
  it('describes irregular', () => {
    expect(formatShape('irregular')).toContain('vary')
  })
})

describe('formatStrengthsWeaknesses', () => {
  it('lists strengths and weaknesses', () => {
    const chart: RadarChart = {
      dimensions: [], overall: 70, overallGrade: 'C', shape: 'balanced',
      strengths: ['Security'], weaknesses: ['Testing'],
    }
    const result = formatStrengthsWeaknesses(chart)
    expect(result).toContain('Security')
    expect(result).toContain('Testing')
  })
})

describe('formatStats', () => {
  it('formats all stat fields', () => {
    const stats: RadarStats = {
      totalDimensions: 8, dimensionsAbove80: 3, dimensionsBelow50: 1,
      standardDeviation: 12.5, balanceScore: 75,
    }
    const formatted = formatStats(stats)
    expect(formatted).toContain('8')
    expect(formatted).toContain('3')
    expect(formatted).toContain('1')
    expect(formatted).toContain('12.5')
    expect(formatted).toContain('75')
  })
})

describe('formatRecommendations', () => {
  it('formats as bullet list', () => {
    expect(formatRecommendations(['test rec'])).toContain('test rec')
  })
})

describe('formatRadarOutput', () => {
  it('includes all sections', () => {
    const result = buildRadarResult(['a.ts'], ['const x = 1'])
    const output = formatRadarOutput(result)
    expect(output).toContain('Overall Score')
    expect(output).toContain('Radar Chart')
    expect(output).toContain('Dimension Scores')
    expect(output).toContain('Shape Analysis')
    expect(output).toContain('Recommendations')
  })
})

describe('formatRadarJson', () => {
  it('returns valid JSON', () => {
    const result = buildRadarResult(['a.ts'], ['const x = 1'])
    const json = formatRadarJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.overall).toBeGreaterThan(0)
    expect(parsed.dimensions.length).toBe(8)
    expect(parsed.shape).toBeDefined()
  })
})
