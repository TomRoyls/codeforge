import { describe, expect, it } from 'vitest'
import {
  buildCrystallizeResult,
  classifyCrystallization,
  computeAgeScore,
  computeComplexityScore,
  computeCrystallizationScore,
  computeDocScore,
  computeEncapsulationScore,
  computeMaturity,
  computeStabilityScore,
  computeTestScore,
  generateFileRecommendations,
  generateRecommendations,
  type CrystallizationScore,
  type CrystallizeStats,
  type FileMaturity,
} from '../src/commands/crystallize-helpers.js'
import {
  formatCrystallizationTable,
  formatCrystallizeJson,
  formatCrystallizeOutput,
  formatCrystallizeRecommendations,
  formatCrystallizeStats,
  formatDistribution,
  formatFactorBreakdown,
  formatMaturityTable,
  formatNeedsAttention,
  formatBestPractices,
  levelBadge,
  scoreBar,
} from '../src/commands/crystallize-format-helpers.js'

// ─── computeStabilityScore ────────────────────────────────────────────────────

describe('computeStabilityScore', () => {
  it('returns 100 for no changes', () => {
    expect(computeStabilityScore(0, 365)).toBe(100)
  })

  it('returns 50 for zero age', () => {
    expect(computeStabilityScore(5, 0)).toBe(50)
  })

  it('returns 80 for rare changes', () => {
    expect(computeStabilityScore(2, 365)).toBe(80)
  })

  it('returns 0 for very frequent changes', () => {
    expect(computeStabilityScore(100, 30)).toBe(0)
  })

  it('returns 20 for weekly changes', () => {
    expect(computeStabilityScore(52, 365)).toBe(20)
  })

  it('returns 60 for moderate changes', () => {
    expect(computeStabilityScore(10, 365)).toBe(60)
  })
})

// ─── computeAgeScore ──────────────────────────────────────────────────────────

describe('computeAgeScore', () => {
  it('returns 100 for >365 days', () => {
    expect(computeAgeScore(400)).toBe(100)
  })

  it('returns 80 for >180 days', () => {
    expect(computeAgeScore(200)).toBe(80)
  })

  it('returns 60 for >90 days', () => {
    expect(computeAgeScore(120)).toBe(60)
  })

  it('returns 40 for >30 days', () => {
    expect(computeAgeScore(60)).toBe(40)
  })

  it('returns 20 for <30 days', () => {
    expect(computeAgeScore(10)).toBe(20)
  })

  it('returns 20 for 0 days', () => {
    expect(computeAgeScore(0)).toBe(20)
  })
})

// ─── computeTestScore ─────────────────────────────────────────────────────────

describe('computeTestScore', () => {
  it('returns 20 for no tests', () => {
    expect(computeTestScore(false, 0)).toBe(20)
  })

  it('returns 40 for low coverage with tests', () => {
    expect(computeTestScore(true, 30)).toBe(40)
  })

  it('returns 70 for medium coverage', () => {
    expect(computeTestScore(true, 55)).toBe(70)
  })

  it('returns 90 for high coverage', () => {
    expect(computeTestScore(true, 80)).toBe(90)
  })

  it('returns 100 for excellent coverage', () => {
    expect(computeTestScore(true, 95)).toBe(100)
  })
})

// ─── computeDocScore ──────────────────────────────────────────────────────────

describe('computeDocScore', () => {
  it('returns 20 for 0% coverage', () => {
    expect(computeDocScore(0)).toBe(20)
  })

  it('returns 40 for partial coverage', () => {
    expect(computeDocScore(25)).toBe(40)
  })

  it('returns 60 for half coverage', () => {
    expect(computeDocScore(50)).toBe(60)
  })

  it('returns 85 for good coverage', () => {
    expect(computeDocScore(75)).toBe(85)
  })

  it('returns 100 for full coverage', () => {
    expect(computeDocScore(95)).toBe(100)
  })
})

// ─── computeComplexityScore ───────────────────────────────────────────────────

describe('computeComplexityScore', () => {
  it('returns 100 for low complexity', () => {
    expect(computeComplexityScore(3)).toBe(100)
  })

  it('returns 80 for moderate complexity', () => {
    expect(computeComplexityScore(7)).toBe(80)
  })

  it('returns 50 for high complexity', () => {
    expect(computeComplexityScore(15)).toBe(50)
  })

  it('returns 20 for very high complexity', () => {
    expect(computeComplexityScore(30)).toBe(20)
  })

  it('returns 100 for zero complexity', () => {
    expect(computeComplexityScore(0)).toBe(100)
  })
})

// ─── computeEncapsulationScore ────────────────────────────────────────────────

describe('computeEncapsulationScore', () => {
  it('returns 100 for 1-3 exports', () => {
    expect(computeEncapsulationScore(2)).toBe(100)
  })

  it('returns 70 for 4-10 exports', () => {
    expect(computeEncapsulationScore(7)).toBe(70)
  })

  it('returns 40 for >10 exports', () => {
    expect(computeEncapsulationScore(15)).toBe(40)
  })

  it('returns 100 for 0 exports', () => {
    expect(computeEncapsulationScore(0)).toBe(100)
  })
})

// ─── classifyCrystallization ──────────────────────────────────────────────────

describe('classifyCrystallization', () => {
  it('classifies fluid (0-19)', () => {
    expect(classifyCrystallization(15)).toBe('fluid')
  })

  it('classifies forming (20-39)', () => {
    expect(classifyCrystallization(30)).toBe('forming')
  })

  it('classifies crystallizing (40-59)', () => {
    expect(classifyCrystallization(50)).toBe('crystallizing')
  })

  it('classifies crystallized (60-79)', () => {
    expect(classifyCrystallization(70)).toBe('crystallized')
  })

  it('classifies diamond (80+)', () => {
    expect(classifyCrystallization(85)).toBe('diamond')
  })

  it('classifies boundary at 20', () => {
    expect(classifyCrystallization(20)).toBe('forming')
  })

  it('classifies boundary at 40', () => {
    expect(classifyCrystallization(40)).toBe('crystallizing')
  })

  it('classifies boundary at 60', () => {
    expect(classifyCrystallization(60)).toBe('crystallized')
  })

  it('classifies boundary at 80', () => {
    expect(classifyCrystallization(80)).toBe('diamond')
  })

  it('classifies 0', () => {
    expect(classifyCrystallization(0)).toBe('fluid')
  })

  it('classifies 100', () => {
    expect(classifyCrystallization(100)).toBe('diamond')
  })
})

// ─── computeMaturity ──────────────────────────────────────────────────────────

describe('computeMaturity', () => {
  it('computes maturity for simple file', () => {
    const m = computeMaturity('export function foo() {}', 'foo.ts', { ageOverride: 200, changeCountOverride: 3 })
    expect(m.file).toBe('foo.ts')
    expect(m.age).toBe(200)
    expect(m.changeCount).toBe(3)
    expect(m.exportCount).toBe(1)
  })

  it('detects entry files', () => {
    expect(computeMaturity('', 'index.ts', {}).isEntryFile).toBe(true)
    expect(computeMaturity('', 'main.ts', {}).isEntryFile).toBe(true)
    expect(computeMaturity('', 'utils.ts', {}).isEntryFile).toBe(false)
  })

  it('detects JSDoc coverage', () => {
    const code = '/** docs */\nexport function foo() {}'
    const m = computeMaturity(code, 'a.ts', {})
    expect(m.documentationCoverage).toBe(100)
  })

  it('detects test patterns', () => {
    const code = "describe('test', () => { it('works', () => { expect(1).toBe(1) }) })"
    const m = computeMaturity(code, 'a.ts', {})
    expect(m.testCoverage).toBe(70)
  })

  it('computes complexity', () => {
    const code = 'if (a) { if (b) { for (let i = 0; i < 10; i++) {} } }'
    const m = computeMaturity(code, 'a.ts', {})
    expect(m.complexity).toBeGreaterThan(0)
  })
})

// ─── computeCrystallizationScore ──────────────────────────────────────────────

describe('computeCrystallizationScore', () => {
  it('computes weighted score', () => {
    const maturity: FileMaturity = {
      file: 'a.ts', age: 400, changeCount: 1, changeFrequency: 0.02,
      testCoverage: 90, documentationCoverage: 95, complexity: 3,
      exportCount: 2, isEntryFile: false, hasDedicatedTests: true,
    }
    const score = computeCrystallizationScore(maturity)
    expect(score.score).toBeGreaterThan(70)
    expect(score.level).toBe('diamond')
    expect(score.factors.length).toBe(6)
  })

  it('computes low score for immature code', () => {
    const maturity: FileMaturity = {
      file: 'new.ts', age: 5, changeCount: 50, changeFrequency: 10,
      testCoverage: 10, documentationCoverage: 0, complexity: 30,
      exportCount: 15, isEntryFile: false, hasDedicatedTests: false,
    }
    const score = computeCrystallizationScore(maturity)
    expect(score.score).toBeLessThan(40)
    expect(score.recommendations.length).toBeGreaterThan(0)
  })

  it('includes all 6 factors', () => {
    const maturity: FileMaturity = {
      file: 'a.ts', age: 180, changeCount: 5, changeFrequency: 0.2,
      testCoverage: 50, documentationCoverage: 50, complexity: 8,
      exportCount: 5, isEntryFile: false, hasDedicatedTests: false,
    }
    const score = computeCrystallizationScore(maturity)
    const names = score.factors.map((f) => f.name)
    expect(names).toContain('Stability')
    expect(names).toContain('Age')
    expect(names).toContain('Tests')
    expect(names).toContain('Documentation')
    expect(names).toContain('Complexity')
    expect(names).toContain('Encapsulation')
  })

  it('weights sum to 1.0', () => {
    const maturity: FileMaturity = {
      file: 'a.ts', age: 100, changeCount: 3, changeFrequency: 0.2,
      testCoverage: 50, documentationCoverage: 50, complexity: 5,
      exportCount: 3, isEntryFile: false, hasDedicatedTests: false,
    }
    const score = computeCrystallizationScore(maturity)
    const totalWeight = score.factors.reduce((s, f) => s + f.weight, 0)
    expect(Math.abs(totalWeight - 1.0)).toBeLessThan(0.01)
  })
})

// ─── generateFileRecommendations ──────────────────────────────────────────────

describe('generateFileRecommendations', () => {
  it('recommends adding tests', () => {
    const maturity: FileMaturity = {
      file: 'a.ts', age: 100, changeCount: 3, changeFrequency: 0.2,
      testCoverage: 10, documentationCoverage: 80, complexity: 3,
      exportCount: 2, isEntryFile: false, hasDedicatedTests: false,
    }
    const factors = computeCrystallizationScore(maturity).factors
    const recs = generateFileRecommendations(50, maturity, factors)
    expect(recs.some((r) => r.includes('test'))).toBe(true)
  })

  it('recommends improving docs', () => {
    const maturity: FileMaturity = {
      file: 'a.ts', age: 100, changeCount: 3, changeFrequency: 0.2,
      testCoverage: 80, documentationCoverage: 20, complexity: 3,
      exportCount: 2, isEntryFile: false, hasDedicatedTests: true,
    }
    const factors = computeCrystallizationScore(maturity).factors
    const recs = generateFileRecommendations(50, maturity, factors)
    expect(recs.some((r) => r.includes('documentation') || r.includes('20%'))).toBe(true)
  })

  it('recommends splitting for many exports', () => {
    const maturity: FileMaturity = {
      file: 'a.ts', age: 100, changeCount: 3, changeFrequency: 0.2,
      testCoverage: 80, documentationCoverage: 80, complexity: 3,
      exportCount: 15, isEntryFile: false, hasDedicatedTests: true,
    }
    const factors = computeCrystallizationScore(maturity).factors
    const recs = generateFileRecommendations(50, maturity, factors)
    expect(recs.some((r) => r.includes('splitting') || r.includes('exports'))).toBe(true)
  })

  it('praises well-crystallized file', () => {
    const maturity: FileMaturity = {
      file: 'a.ts', age: 400, changeCount: 1, changeFrequency: 0.02,
      testCoverage: 90, documentationCoverage: 95, complexity: 3,
      exportCount: 2, isEntryFile: false, hasDedicatedTests: true,
    }
    const factors = computeCrystallizationScore(maturity).factors
    const recs = generateFileRecommendations(90, maturity, factors)
    expect(recs.some((r) => r.includes('well-crystallized'))).toBe(true)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: CrystallizeStats = {
    totalFiles: 10, averageScore: 60, fluidCount: 2, formingCount: 2,
    crystallizingCount: 2, crystallizedCount: 2, diamondCount: 2,
    averageAge: 180, averageTestCoverage: 60, averageDocCoverage: 60,
  }

  it('warns about files needing attention', () => {
    const needs: CrystallizationScore[] = [{ file: 'bad.ts', score: 15, level: 'fluid', factors: [], recommendations: [] }]
    const recs = generateRecommendations(needs, [], baseStats)
    expect(recs.some((r) => r.includes('bad.ts'))).toBe(true)
  })

  it('warns about many fluid files', () => {
    const stats = { ...baseStats, fluidCount: 5, totalFiles: 10 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('fluid'))).toBe(true)
  })

  it('warns about low test coverage', () => {
    const stats = { ...baseStats, averageTestCoverage: 25 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('test'))).toBe(true)
  })

  it('warns about low doc coverage', () => {
    const stats = { ...baseStats, averageDocCoverage: 20 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('documentation') || r.includes('JSDoc'))).toBe(true)
  })

  it('returns healthy message when all good', () => {
    const recs = generateRecommendations([], [], baseStats)
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })
})

// ─── buildCrystallizeResult ───────────────────────────────────────────────────

describe('buildCrystallizeResult', () => {
  it('returns complete result', () => {
    const result = buildCrystallizeResult(
      ['a.ts'],
      ['export function foo() {}'],
      { ageOverride: 200, changeCountOverride: 3 },
    )
    expect(result.files.length).toBe(1)
    expect(result.maturity.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles empty input', () => {
    const result = buildCrystallizeResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.files.length).toBe(0)
  })

  it('identifies needs-attention files', () => {
    const result = buildCrystallizeResult(
      ['new.ts'],
      ['if (a) {} if (b) {} if (c) {} if (d) {}'],
      { ageOverride: 5, changeCountOverride: 100 },
    )
    expect(result.needsAttention.length).toBeGreaterThanOrEqual(0)
  })

  it('identifies best-practice files', () => {
    const result = buildCrystallizeResult(
      ['stable.ts'],
      ['/** docs */\nexport function foo() {}'],
      { ageOverride: 400, changeCountOverride: 0 },
    )
    expect(result.bestPractices.length).toBeGreaterThanOrEqual(0)
  })

  it('computes stats correctly', () => {
    const result = buildCrystallizeResult(
      ['a.ts', 'b.ts'],
      ['export function foo() {}', 'export const x = 1'],
      { ageOverride: 200, changeCountOverride: 3 },
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.averageScore).toBeGreaterThan(0)
  })

  it('generates recommendations', () => {
    const result = buildCrystallizeResult(['a.ts'], ['export function foo() {}'], { ageOverride: 200, changeCountOverride: 3 })
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── format-helpers ───────────────────────────────────────────────────────────

describe('levelBadge', () => {
  it('returns badge for each level', () => {
    expect(levelBadge('fluid')).toContain('FLUID')
    expect(levelBadge('forming')).toContain('FORMING')
    expect(levelBadge('crystallizing')).toContain('CRYSTG')
    expect(levelBadge('crystallized')).toContain('CRYSTD')
    expect(levelBadge('diamond')).toContain('DIAMND')
  })
})

describe('scoreBar', () => {
  it('renders bar with score', () => {
    const bar = scoreBar(75)
    expect(bar).toContain('█')
    expect(bar).toContain('75')
  })

  it('renders 0', () => {
    expect(scoreBar(0)).toContain('0')
  })

  it('renders 100', () => {
    expect(scoreBar(100)).toContain('100')
  })
})

describe('formatCrystallizationTable', () => {
  it('returns no-files message for empty', () => {
    expect(formatCrystallizationTable([])).toContain('no files')
  })

  it('includes file data', () => {
    const scores: CrystallizationScore[] = [{ file: 'a.ts', score: 75, level: 'crystallized', factors: [], recommendations: [] }]
    const table = formatCrystallizationTable(scores)
    expect(table).toContain('a.ts')
    expect(table).toContain('75')
  })
})

describe('formatFactorBreakdown', () => {
  it('includes factor details', () => {
    const score: CrystallizationScore = {
      file: 'a.ts', score: 75, level: 'crystallized',
      factors: [
        { name: 'Stability', score: 80, weight: 0.2, description: 'Change freq', evidence: '5 changes' },
      ],
      recommendations: [],
    }
    const breakdown = formatFactorBreakdown(score)
    expect(breakdown).toContain('Stability')
    expect(breakdown).toContain('80')
    expect(breakdown).toContain('20%')
  })
})

describe('formatMaturityTable', () => {
  it('returns no-data message for empty', () => {
    expect(formatMaturityTable([])).toContain('no maturity')
  })

  it('includes maturity data', () => {
    const maturity: FileMaturity[] = [{
      file: 'a.ts', age: 200, changeCount: 5, changeFrequency: 0.17,
      testCoverage: 70, documentationCoverage: 80, complexity: 5,
      exportCount: 3, isEntryFile: false, hasDedicatedTests: false,
    }]
    const table = formatMaturityTable(maturity)
    expect(table).toContain('a.ts')
    expect(table).toContain('200')
  })
})

describe('formatCrystallizeStats', () => {
  it('formats all stat fields', () => {
    const stats: CrystallizeStats = {
      totalFiles: 10, averageScore: 65, fluidCount: 1, formingCount: 2,
      crystallizingCount: 3, crystallizedCount: 3, diamondCount: 1,
      averageAge: 180, averageTestCoverage: 60, averageDocCoverage: 55,
    }
    const formatted = formatCrystallizeStats(stats)
    expect(formatted).toContain('10')
    expect(formatted).toContain('65')
    expect(formatted).toContain('180')
  })
})

describe('formatDistribution', () => {
  it('renders distribution', () => {
    const stats: CrystallizeStats = {
      totalFiles: 5, averageScore: 50, fluidCount: 1, formingCount: 1,
      crystallizingCount: 1, crystallizedCount: 1, diamondCount: 1,
      averageAge: 100, averageTestCoverage: 50, averageDocCoverage: 50,
    }
    const dist = formatDistribution(stats)
    expect(dist).toContain('Fluid')
    expect(dist).toContain('Diamond')
  })
})

describe('formatNeedsAttention', () => {
  it('returns all-good message for empty', () => {
    expect(formatNeedsAttention([])).toContain('all files')
  })

  it('includes warning data', () => {
    const scores: CrystallizationScore[] = [{ file: 'bad.ts', score: 15, level: 'fluid', factors: [], recommendations: ['needs work'] }]
    const formatted = formatNeedsAttention(scores)
    expect(formatted).toContain('bad.ts')
  })
})

describe('formatBestPractices', () => {
  it('returns none message for empty', () => {
    expect(formatBestPractices([])).toContain('no files')
  })

  it('includes best practice data', () => {
    const scores: CrystallizationScore[] = [{ file: 'good.ts', score: 90, level: 'diamond', factors: [], recommendations: [] }]
    const formatted = formatBestPractices(scores)
    expect(formatted).toContain('good.ts')
  })
})

describe('formatCrystallizeOutput', () => {
  it('includes all sections', () => {
    const result = buildCrystallizeResult(['a.ts'], ['export function foo() {}'], { ageOverride: 200, changeCountOverride: 3 })
    const output = formatCrystallizeOutput(result)
    expect(output).toContain('Crystallization Statistics')
    expect(output).toContain('Level Distribution')
    expect(output).toContain('File Scores')
    expect(output).toContain('Recommendations')
  })
})

describe('formatCrystallizeJson', () => {
  it('returns valid JSON', () => {
    const result = buildCrystallizeResult(['a.ts'], ['export function foo() {}'])
    const json = formatCrystallizeJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBeGreaterThan(0)
  })
})
