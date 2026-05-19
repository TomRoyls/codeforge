import { describe, expect, it } from 'vitest'
import {
  buildMutationResult,
  computeMutationCoverage,
  estimateDetectionLikelihood,
  findArithmeticOperators,
  findBooleanLiterals,
  findComparisonOperators,
  findConditionals,
  findLogicalOperators,
  findNumberLiterals,
  findReturnStatements,
  findStringLiterals,
  generateRecommendations,
  type MutablePoint,
  type MutationStats,
} from '../src/commands/mutation-helpers.js'
import {
  coverageMeter,
  detectionBadge,
  formatCoverageTable,
  formatMutationsTable,
  formatMutationJson,
  formatMutationOutput,
  formatRecommendations,
  formatStats,
  formatTypeDistribution,
  mutationTypeBadge,
} from '../src/commands/mutation-format-helpers.js'

// ─── findArithmeticOperators ──────────────────────────────────────────────────

describe('findArithmeticOperators', () => {
  it('finds + operators', () => {
    const mutations = findArithmeticOperators('const sum = a + b', 'a.ts')
    expect(mutations.some((m) => m.code.includes('+') && m.mutatedCode.includes('-'))).toBe(true)
  })

  it('finds * operators', () => {
    const mutations = findArithmeticOperators('const prod = x * y', 'a.ts')
    expect(mutations.some((m) => m.mutatedCode.includes('/'))).toBe(true)
  })

  it('skips comment lines', () => {
    const mutations = findArithmeticOperators('// const x = a + b', 'a.ts')
    expect(mutations.length).toBe(0)
  })

  it('skips JSDoc lines', () => {
    const mutations = findArithmeticOperators(' * const x = a + b', 'a.ts')
    expect(mutations.length).toBe(0)
  })

  it('returns empty for no operators', () => {
    expect(findArithmeticOperators('const x = 1', 'a.ts').length).toBe(0)
  })

  it('sets mutationType to arithmetic-operator', () => {
    const mutations = findArithmeticOperators('x + y', 'a.ts')
    expect(mutations.every((m) => m.mutationType === 'arithmetic-operator')).toBe(true)
  })
})

// ─── findComparisonOperators ──────────────────────────────────────────────────

describe('findComparisonOperators', () => {
  it('finds === operators', () => {
    const mutations = findComparisonOperators('if (x === 5) {}', 'a.ts')
    expect(mutations.some((m) => m.code === '===' && m.mutatedCode === '!==')).toBe(true)
  })

  it('finds !== operators', () => {
    const mutations = findComparisonOperators('if (x !== 5) {}', 'a.ts')
    expect(mutations.some((m) => m.mutatedCode === '===')).toBe(true)
  })

  it('finds <= boundary operators', () => {
    const mutations = findComparisonOperators('if (x <= 5) {}', 'a.ts')
    expect(mutations.some((m) => m.mutatedCode === '<')).toBe(true)
  })

  it('returns empty for no comparisons', () => {
    expect(findComparisonOperators('const x = 1', 'a.ts').length).toBe(0)
  })
})

// ─── findLogicalOperators ─────────────────────────────────────────────────────

describe('findLogicalOperators', () => {
  it('finds && operators', () => {
    const mutations = findLogicalOperators('if (a && b) {}', 'a.ts')
    expect(mutations.some((m) => m.mutatedCode === '||')).toBe(true)
  })

  it('finds || operators', () => {
    const mutations = findLogicalOperators('if (a || b) {}', 'a.ts')
    expect(mutations.some((m) => m.mutatedCode === '&&')).toBe(true)
  })

  it('skips comment lines', () => {
    expect(findLogicalOperators('// a && b', 'a.ts').length).toBe(0)
  })

  it('returns empty for no logical operators', () => {
    expect(findLogicalOperators('const x = 1', 'a.ts').length).toBe(0)
  })
})

// ─── findBooleanLiterals ──────────────────────────────────────────────────────

describe('findBooleanLiterals', () => {
  it('finds true literals', () => {
    const mutations = findBooleanLiterals('const flag = true', 'a.ts')
    expect(mutations.some((m) => m.code === 'true' && m.mutatedCode === 'false')).toBe(true)
  })

  it('finds false literals', () => {
    const mutations = findBooleanLiterals('const flag = false', 'a.ts')
    expect(mutations.some((m) => m.mutatedCode === 'true')).toBe(true)
  })

  it('skips import lines', () => {
    const mutations = findBooleanLiterals('import { true as yes } from "x"', 'a.ts')
    expect(mutations.length).toBe(0)
  })

  it('skips comment lines', () => {
    expect(findBooleanLiterals('// const x = true', 'a.ts').length).toBe(0)
  })
})

// ─── findNumberLiterals ───────────────────────────────────────────────────────

describe('findNumberLiterals', () => {
  it('finds non-trivial number literals', () => {
    const mutations = findNumberLiterals('const port = 8080', 'a.ts')
    expect(mutations.some((m) => m.mutationType === 'number-literal')).toBe(true)
  })

  it('excludes 0 and 1', () => {
    const mutations = findNumberLiterals('const x = 0\nconst y = 1', 'a.ts')
    expect(mutations.length).toBe(0)
  })

  it('skips import lines', () => {
    const mutations = findNumberLiterals('import x from "lib99"', 'a.ts')
    expect(mutations.every((m) => m.mutationType !== 'number-literal')).toBe(true)
  })

  it('offsets positive numbers', () => {
    const mutations = findNumberLiterals('const x = 42', 'a.ts')
    expect(mutations.some((m) => m.mutatedCode === '43')).toBe(true)
  })
})

// ─── findStringLiterals ───────────────────────────────────────────────────────

describe('findStringLiterals', () => {
  it('finds string literals', () => {
    const mutations = findStringLiterals("const name = 'hello world'", 'a.ts')
    expect(mutations.some((m) => m.mutationType === 'string-literal')).toBe(true)
  })

  it('skips import strings', () => {
    const mutations = findStringLiterals("import fs from 'fs'", 'a.ts')
    expect(mutations.length).toBe(0)
  })

  it('skips short strings', () => {
    const mutations = findStringLiterals("const x = 'ab'", 'a.ts')
    expect(mutations.length).toBe(0)
  })

  it('skips comment lines', () => {
    expect(findStringLiterals("// const x = 'hello'", 'a.ts').length).toBe(0)
  })
})

// ─── findReturnStatements ─────────────────────────────────────────────────────

describe('findReturnStatements', () => {
  it('finds return statements', () => {
    const mutations = findReturnStatements('return result', 'a.ts')
    expect(mutations.some((m) => m.mutatedCode === 'return null')).toBe(true)
  })

  it('skips return null', () => {
    const mutations = findReturnStatements('return null', 'a.ts')
    expect(mutations.length).toBe(0)
  })

  it('skips return undefined', () => {
    const mutations = findReturnStatements('return undefined', 'a.ts')
    expect(mutations.length).toBe(0)
  })

  it('finds return with expressions', () => {
    const mutations = findReturnStatements('return x + y', 'a.ts')
    expect(mutations.some((m) => m.mutationType === 'return-value')).toBe(true)
  })
})

// ─── findConditionals ─────────────────────────────────────────────────────────

describe('findConditionals', () => {
  it('finds if conditions', () => {
    const mutations = findConditionals('if (x > 0) {}', 'a.ts')
    expect(mutations.some((m) => m.mutationType === 'negate-condition')).toBe(true)
  })

  it('skips already negated conditions', () => {
    const mutations = findConditionals('if (!flag) {}', 'a.ts')
    expect(mutations.filter((m) => m.mutationType === 'negate-condition' && m.code === 'flag').length).toBe(0)
  })

  it('finds ternary operators', () => {
    const mutations = findConditionals('const x = cond ? a : b', 'a.ts')
    expect(mutations.some((m) => m.mutatedCode === 'swapped branches')).toBe(true)
  })

  it('returns empty for no conditionals', () => {
    expect(findConditionals('const x = 1', 'a.ts').length).toBe(0)
  })
})

// ─── estimateDetectionLikelihood ──────────────────────────────────────────────

describe('estimateDetectionLikelihood', () => {
  const baseMutation: MutablePoint = {
    file: 'a.ts', line: 1, code: 'x + y',
    mutationType: 'arithmetic-operator', mutatedCode: 'x - y',
    detectionLikelihood: 'medium', reason: 'test',
  }

  it('returns unlikely for no test content', () => {
    expect(estimateDetectionLikelihood(baseMutation, 'code', '')).toBe('unlikely')
  })

  it('returns high for specific assertions', () => {
    const testContent = "describe('test', () => { it('works', () => { expect(x).toBe(1) }) })"
    expect(estimateDetectionLikelihood(baseMutation, 'code', testContent)).toBe('high')
  })

  it('returns medium for loose assertions', () => {
    const testContent = "describe('test', () => { it('works', () => { expect(x).toBeTruthy() }) })"
    expect(estimateDetectionLikelihood(baseMutation, 'code', testContent)).toBe('medium')
  })

  it('returns low for minimal tests', () => {
    expect(estimateDetectionLikelihood(baseMutation, 'code', 'it("x")')).toBe('low')
  })
})

// ─── computeMutationCoverage ──────────────────────────────────────────────────

describe('computeMutationCoverage', () => {
  it('computes coverage for a file', () => {
    const mutations: MutablePoint[] = [
      { file: 'a.ts', line: 1, code: '+', mutationType: 'arithmetic-operator', mutatedCode: '-', detectionLikelihood: 'high', reason: '' },
      { file: 'a.ts', line: 2, code: '===', mutationType: 'comparison-operator', mutatedCode: '!==', detectionLikelihood: 'low', reason: '' },
    ]
    const coverage = computeMutationCoverage(mutations, 'a.ts')
    expect(coverage.totalMutations).toBe(2)
    expect(coverage.detectedMutations).toBe(1)
    expect(coverage.coverageScore).toBe(50)
    expect(coverage.riskyMutations.length).toBe(1)
  })

  it('returns 100% for no mutations', () => {
    const coverage = computeMutationCoverage([], 'a.ts')
    expect(coverage.coverageScore).toBe(100)
    expect(coverage.totalMutations).toBe(0)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('warns about risky file', () => {
    const stats: MutationStats = {
      totalMutationPoints: 10, estimatedDetected: 5, estimatedSurvival: 5,
      averageCoverageScore: 50, filesBelowThreshold: 1, mostRiskyFile: 'a.ts',
      mutationTypes: { 'arithmetic-operator': 5 },
    }
    const recs = generateRecommendations([], stats)
    expect(recs.some((r) => r.includes('a.ts'))).toBe(true)
  })

  it('warns about files below threshold', () => {
    const stats: MutationStats = {
      totalMutationPoints: 10, estimatedDetected: 5, estimatedSurvival: 5,
      averageCoverageScore: 50, filesBelowThreshold: 3, mostRiskyFile: '',
      mutationTypes: {},
    }
    const recs = generateRecommendations([], stats)
    expect(recs.some((r) => r.includes('3 file'))).toBe(true)
  })

  it('warns about low average coverage', () => {
    const stats: MutationStats = {
      totalMutationPoints: 10, estimatedDetected: 3, estimatedSurvival: 7,
      averageCoverageScore: 30, filesBelowThreshold: 0, mostRiskyFile: '',
      mutationTypes: {},
    }
    const recs = generateRecommendations([], stats)
    expect(recs.some((r) => r.includes('30%'))).toBe(true)
  })

  it('warns about weakest mutation type', () => {
    const stats: MutationStats = {
      totalMutationPoints: 10, estimatedDetected: 8, estimatedSurvival: 2,
      averageCoverageScore: 80, filesBelowThreshold: 0, mostRiskyFile: '',
      mutationTypes: { 'arithmetic-operator': 2, 'comparison-operator': 8 },
    }
    const recs = generateRecommendations([], stats)
    expect(recs.some((r) => r.includes('Weakest'))).toBe(true)
  })

  it('returns healthy message when all good', () => {
    const stats: MutationStats = {
      totalMutationPoints: 5, estimatedDetected: 5, estimatedSurvival: 0,
      averageCoverageScore: 95, filesBelowThreshold: 0, mostRiskyFile: '',
      mutationTypes: {},
    }
    const recs = generateRecommendations([], stats)
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })
})

// ─── buildMutationResult ──────────────────────────────────────────────────────

describe('buildMutationResult', () => {
  it('returns complete result', () => {
    const result = buildMutationResult(
      ['a.ts'],
      ['if (x === 5) { return true }'],
    )
    expect(result.stats.totalMutationPoints).toBeGreaterThan(0)
    expect(result.mutations.length).toBeGreaterThan(0)
    expect(result.files.length).toBe(1)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty files', () => {
    const result = buildMutationResult([], [])
    expect(result.stats.totalMutationPoints).toBe(0)
    expect(result.mutations.length).toBe(0)
  })

  it('computes mutation type counts', () => {
    const result = buildMutationResult(
      ['a.ts'],
      ['const x = a + b\nif (x === 5) { return true }'],
    )
    expect(Object.keys(result.stats.mutationTypes).length).toBeGreaterThan(0)
  })

  it('identifies risky mutations', () => {
    const result = buildMutationResult(
      ['a.ts'],
      ["const msg = 'hello world'"],
    )
    expect(result.riskyMutations.length).toBeGreaterThan(0)
  })
})

// ─── format-helpers ───────────────────────────────────────────────────────────

describe('coverageMeter', () => {
  it('renders meter with percentage', () => {
    const meter = coverageMeter(75)
    expect(meter).toContain('75%')
    expect(meter).toContain('█')
  })

  it('renders 0%', () => {
    expect(coverageMeter(0)).toContain('0%')
  })
})

describe('detectionBadge', () => {
  it('returns badge for each level', () => {
    expect(detectionBadge('high')).toContain('HIGH')
    expect(detectionBadge('medium')).toContain('MED')
    expect(detectionBadge('low')).toContain('LOW')
    expect(detectionBadge('unlikely')).toContain('UNLK')
  })
})

describe('mutationTypeBadge', () => {
  it('returns badge for known types', () => {
    expect(mutationTypeBadge('arithmetic-operator')).toContain('arith')
    expect(mutationTypeBadge('boolean-literal')).toContain('bool')
    expect(mutationTypeBadge('return-value')).toContain('ret')
  })
})

describe('formatMutationsTable', () => {
  it('returns (no mutation points) for empty', () => {
    expect(formatMutationsTable([])).toContain('(no mutation points)')
  })

  it('includes mutation data', () => {
    const mutations: MutablePoint[] = [
      { file: 'a.ts', line: 1, code: '+', mutationType: 'arithmetic-operator', mutatedCode: '-', detectionLikelihood: 'high', reason: 'test' },
    ]
    const table = formatMutationsTable(mutations)
    expect(table).toContain('arith')
    expect(table).toContain('HIGH')
  })
})

describe('formatCoverageTable', () => {
  it('returns (no files) for empty', () => {
    expect(formatCoverageTable([])).toContain('(no files)')
  })

  it('includes file coverage', () => {
    const files = [{
      file: 'a.ts', totalMutations: 5, detectedMutations: 3,
      survivalEstimate: 40, coverageScore: 60, riskyMutations: [],
    }]
    const table = formatCoverageTable(files)
    expect(table).toContain('a.ts')
    expect(table).toContain('60')
  })
})

describe('formatTypeDistribution', () => {
  it('returns (no mutations) for empty', () => {
    expect(formatTypeDistribution({})).toContain('(no mutations)')
  })

  it('renders distribution', () => {
    const types = { 'arithmetic-operator': 5, 'boolean-literal': 3 }
    const dist = formatTypeDistribution(types)
    expect(dist).toContain('arith')
    expect(dist).toContain('bool')
  })
})

describe('formatStats', () => {
  it('formats all stat fields', () => {
    const stats: MutationStats = {
      totalMutationPoints: 25, estimatedDetected: 18, estimatedSurvival: 7,
      averageCoverageScore: 72, filesBelowThreshold: 2, mostRiskyFile: 'b.ts',
      mutationTypes: {},
    }
    const formatted = formatStats(stats)
    expect(formatted).toContain('25')
    expect(formatted).toContain('18')
    expect(formatted).toContain('72%')
    expect(formatted).toContain('b.ts')
  })
})

describe('formatRecommendations', () => {
  it('formats as bullet list', () => {
    expect(formatRecommendations(['test rec'])).toContain('test rec')
  })
})

describe('formatMutationOutput', () => {
  it('includes all sections', () => {
    const result = buildMutationResult(['a.ts'], ['if (x === 5) {}'])
    const output = formatMutationOutput(result)
    expect(output).toContain('Mutation Statistics')
    expect(output).toContain('Type Distribution')
    expect(output).toContain('Recommendations')
  })
})

describe('formatMutationJson', () => {
  it('returns valid JSON', () => {
    const result = buildMutationResult(['a.ts'], ['if (x === 5) {}'])
    const json = formatMutationJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalMutationPoints).toBeGreaterThan(0)
  })
})
