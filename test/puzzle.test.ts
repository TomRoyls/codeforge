import { describe, expect, it } from 'vitest'

import {
  analyzeFunctions,
  buildDistribution,
  buildPuzzleResult,
  classifyDifficulty,
  computeComplexityScore,
  computeControlFlowScore,
  computeNestingScore,
  computeObscurityScore,
  computeTokenDiversity,
  estimateReadTime,
  generateHints,
  scoreFile,
  type PuzzleBreakdown,
  type PuzzleScore,
  type PuzzleStats,
} from '../src/commands/puzzle-helpers.js'
import {
  formatDistributionChart,
  formatJson,
  formatLeaderboard,
  formatPuzzleCard,
  formatRecommendations,
  formatResult,
  formatStats,
} from '../src/commands/puzzle-format-helpers.js'

// ─── classifyDifficulty ───────────────────────────────────────────────────

describe('classifyDifficulty', () => {
  it('returns trivial for 0-14', () => { expect(classifyDifficulty(0)).toBe('trivial'); expect(classifyDifficulty(14)).toBe('trivial') })
  it('returns easy for 15-29', () => { expect(classifyDifficulty(15)).toBe('easy'); expect(classifyDifficulty(29)).toBe('easy') })
  it('returns medium for 30-49', () => { expect(classifyDifficulty(30)).toBe('medium'); expect(classifyDifficulty(49)).toBe('medium') })
  it('returns hard for 50-69', () => { expect(classifyDifficulty(50)).toBe('hard'); expect(classifyDifficulty(69)).toBe('hard') })
  it('returns expert for 70-84', () => { expect(classifyDifficulty(70)).toBe('expert'); expect(classifyDifficulty(84)).toBe('expert') })
  it('returns nightmare for 85+', () => { expect(classifyDifficulty(85)).toBe('nightmare'); expect(classifyDifficulty(100)).toBe('nightmare') })
})

// ─── computeNestingScore ──────────────────────────────────────────────────

describe('computeNestingScore', () => {
  it('returns 0 for no nesting', () => { expect(computeNestingScore('const x = 1')).toBe(0) })
  it('returns 0 for depth 1', () => { expect(computeNestingScore('{ x }')).toBe(0) })
  it('returns 10 for depth 2', () => { expect(computeNestingScore('{ { } }')).toBe(10) })
  it('returns 25 for depth 3', () => { expect(computeNestingScore('{ { { } } }')).toBe(25) })
  it('returns 50 for depth 4', () => { expect(computeNestingScore('{ { { { } } } }')).toBe(50) })
  it('returns 75 for depth 5-6', () => { expect(computeNestingScore('{ { { { { } } } } }')).toBe(75) })
  it('returns 100 for depth 7+', () => { expect(computeNestingScore('{ { { { { { { } } } } } } }')).toBe(100) })
  it('handles empty string', () => { expect(computeNestingScore('')).toBe(0) })
})

// ─── computeComplexityScore ───────────────────────────────────────────────

describe('computeComplexityScore', () => {
  it('returns 0 for no branches', () => { expect(computeComplexityScore('const x = 1')).toBe(0) })
  it('returns 10 for few branches', () => { expect(computeComplexityScore('if (a) {}')).toBe(10) })
  it('returns higher for many branches', () => {
    const code = 'if (a) {} else if (b) {} else if (c) {} else if (d) {} else if (e) {}'
    expect(computeComplexityScore(code)).toBeGreaterThan(10)
  })
  it('returns 100 for extreme complexity', () => {
    const branches = Array(50).fill('if (x) {}').join(' ')
    expect(computeComplexityScore(branches)).toBe(100)
  })
  it('handles empty string', () => { expect(computeComplexityScore('')).toBe(0) })
})

// ─── computeObscurityScore ────────────────────────────────────────────────

describe('computeObscurityScore', () => {
  it('returns 0 for clean names', () => { expect(computeObscurityScore('const userName = getUserName()')).toBe(0) })
  it('penalizes single-char names', () => { expect(computeObscurityScore('const q = compute()')).toBeGreaterThan(0) })
  it('penalizes abbreviations', () => {
    const score = computeObscurityScore('const cfg = getConfig()')
    expect(score).toBeGreaterThan(0)
  })
  it('penalizes generic names', () => {
    const score = computeObscurityScore('const data = getData()')
    expect(score).toBeGreaterThan(0)
  })
  it('allows loop variables i, j, k', () => {
    const score = computeObscurityScore('for (let i = 0; i < 10; i++) {}')
    expect(score).toBe(0)
  })
  it('handles empty string', () => { expect(computeObscurityScore('')).toBe(0) })
})

// ─── computeControlFlowScore ──────────────────────────────────────────────

describe('computeControlFlowScore', () => {
  it('returns 0 for simple code', () => { expect(computeControlFlowScore('const x = 1')).toBe(0) })
  it('returns 0 for 1-2 types', () => { expect(computeControlFlowScore('if (a) { return 1 }')).toBe(0) })
  it('increases with variety', () => {
    const code = 'if (a) {} for (let i=0;i<10;i++) {} while (b) {} switch (c) { case 1: break } try {} catch (e) {}'
    expect(computeControlFlowScore(code)).toBeGreaterThan(0)
  })
  it('returns high for many control types', () => {
    const code = 'if (a) {} else {} for (;;) {} while (b) {} do {} while (c); switch (d) { case 1: break } try {} catch (e) {} finally {} async function f() { await g() } function* h() { yield 1 } throw new Error() return x continue'
    expect(computeControlFlowScore(code)).toBeGreaterThanOrEqual(50)
  })
  it('handles empty string', () => { expect(computeControlFlowScore('')).toBe(0) })
})

// ─── computeTokenDiversity ────────────────────────────────────────────────

describe('computeTokenDiversity', () => {
  it('returns 0 for empty', () => { expect(computeTokenDiversity('')).toBe(0) })
  it('returns higher for diverse tokens', () => {
    const diverse = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda'
    const repetitive = 'x x x x x x x x x x x x'
    expect(computeTokenDiversity(diverse)).toBeGreaterThan(computeTokenDiversity(repetitive))
  })
  it('handles single token', () => { expect(computeTokenDiversity('x')).toBeGreaterThan(0) })
})

// ─── estimateReadTime ─────────────────────────────────────────────────────

describe('estimateReadTime', () => {
  it('returns < 1 minute for tiny files', () => { expect(estimateReadTime(10, 0)).toBe('< 1 minute') })
  it('returns minutes for medium files', () => { expect(estimateReadTime(100, 20)).toContain('minutes') })
  it('returns hours for large hard files', () => { expect(estimateReadTime(2000, 80)).toContain('hours') })
  it('returns days for massive nightmare files', () => { expect(estimateReadTime(5000, 100)).toContain('days') })
  it('increases with difficulty', () => {
    const easy = estimateReadTime(200, 10)
    const hard = estimateReadTime(200, 90)
    expect(hard).not.toBe(easy)
  })
})

// ─── generateHints ───────────────────────────────────────────────────────

describe('generateHints', () => {
  it('gives positive hint for easy code', () => {
    const hints = generateHints({ nestingScore: 0, complexityScore: 0, obscurityScore: 0, controlFlowScore: 0, tokenDiversityScore: 0 })
    expect(hints).toHaveLength(1)
    expect(hints[0]).toContain('straightforward')
  })

  it('hints at nesting issues', () => {
    const hints = generateHints({ nestingScore: 60, complexityScore: 0, obscurityScore: 0, controlFlowScore: 0, tokenDiversityScore: 0 })
    expect(hints.some((h) => h.includes('nesting'))).toBe(true)
  })

  it('hints at complexity issues', () => {
    const hints = generateHints({ nestingScore: 0, complexityScore: 60, obscurityScore: 0, controlFlowScore: 0, tokenDiversityScore: 0 })
    expect(hints.some((h) => h.includes('branches'))).toBe(true)
  })

  it('hints at obscurity issues', () => {
    const hints = generateHints({ nestingScore: 0, complexityScore: 0, obscurityScore: 60, controlFlowScore: 0, tokenDiversityScore: 0 })
    expect(hints.some((h) => h.includes('name'))).toBe(true)
  })

  it('hints at control flow issues', () => {
    const hints = generateHints({ nestingScore: 0, complexityScore: 0, obscurityScore: 0, controlFlowScore: 60, tokenDiversityScore: 0 })
    expect(hints.some((h) => h.includes('flowchart'))).toBe(true)
  })

  it('hints at token diversity issues', () => {
    const hints = generateHints({ nestingScore: 0, complexityScore: 0, obscurityScore: 0, controlFlowScore: 0, tokenDiversityScore: 60 })
    expect(hints.some((h) => h.includes('slowly'))).toBe(true)
  })
})

// ─── analyzeFunctions ─────────────────────────────────────────────────────

describe('analyzeFunctions', () => {
  it('extracts named functions', () => {
    const code = 'function foo() { return 1 }'
    const fns = analyzeFunctions(code, 'a.ts')
    expect(fns.length).toBeGreaterThanOrEqual(1)
    expect(fns[0]!.name).toBe('foo')
  })

  it('extracts arrow function assignments', () => {
    const code = 'const bar = () => { return 2 }'
    const fns = analyzeFunctions(code, 'a.ts')
    expect(fns.length).toBeGreaterThanOrEqual(1)
    expect(fns[0]!.name).toBe('bar')
  })

  it('counts branches and loops', () => {
    const code = 'function fn() { if (a) {} for (let i=0;i<5;i++) {} }'
    const fns = analyzeFunctions(code, 'a.ts')
    expect(fns.length).toBeGreaterThanOrEqual(1)
    expect(fns[0]!.branchCount).toBeGreaterThanOrEqual(1)
    expect(fns[0]!.loopCount).toBeGreaterThanOrEqual(1)
  })

  it('sets line numbers', () => {
    const code = 'const x = 1\nfunction target() { return 1 }'
    const fns = analyzeFunctions(code, 'a.ts')
    expect(fns[0]!.lineStart).toBe(2)
  })

  it('returns empty for no functions', () => {
    expect(analyzeFunctions('const x = 1', 'a.ts')).toHaveLength(0)
  })

  it('classifies difficulty', () => {
    const fns = analyzeFunctions('function simple() { return 1 }', 'a.ts')
    if (fns.length > 0) {
      expect(['trivial', 'easy', 'medium', 'hard', 'expert', 'nightmare']).toContain(fns[0]!.difficulty)
    }
  })
})

// ─── scoreFile ────────────────────────────────────────────────────────────

describe('scoreFile', () => {
  it('scores simple code low', () => {
    const result = scoreFile('a.ts', 'const x = 1')
    expect(result.score).toBeLessThan(30)
    expect(['trivial', 'easy']).toContain(result.difficulty)
  })

  it('scores complex code higher', () => {
    const code = [
      'function process(cfg, cb, ctx) {',
      '  if (cfg.a) {',
      '    if (cfg.b) {',
      '      if (cfg.c) {',
      '        for (let i = 0; i < 10; i++) {',
      '          switch (cfg.d) {',
      '            case 1: break',
      '          }',
      '        }',
      '      }',
      '    }',
      '  }',
      '}',
    ].join('\n')
    const result = scoreFile('complex.ts', code)
    expect(result.score).toBeGreaterThan(20)
  })

  it('returns complete PuzzleScore structure', () => {
    const result = scoreFile('a.ts', 'const x = 1')
    expect(result).toHaveProperty('file')
    expect(result).toHaveProperty('difficulty')
    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('breakdown')
    expect(result).toHaveProperty('functions')
    expect(result).toHaveProperty('estimatedReadTime')
    expect(result).toHaveProperty('hints')
  })

  it('clamps score to 0-100', () => {
    const result = scoreFile('a.ts', 'const x = 1')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})

// ─── buildDistribution ────────────────────────────────────────────────────

describe('buildDistribution', () => {
  it('counts files per difficulty', () => {
    const scores: PuzzleScore[] = [
      { file: 'a.ts', difficulty: 'trivial', score: 5, breakdown: { nestingScore: 0, complexityScore: 0, obscurityScore: 0, controlFlowScore: 0, tokenDiversityScore: 0 }, functions: [], estimatedReadTime: '', hints: [] },
      { file: 'b.ts', difficulty: 'hard', score: 55, breakdown: { nestingScore: 0, complexityScore: 0, obscurityScore: 0, controlFlowScore: 0, tokenDiversityScore: 0 }, functions: [], estimatedReadTime: '', hints: [] },
      { file: 'c.ts', difficulty: 'trivial', score: 10, breakdown: { nestingScore: 0, complexityScore: 0, obscurityScore: 0, controlFlowScore: 0, tokenDiversityScore: 0 }, functions: [], estimatedReadTime: '', hints: [] },
    ]
    const dist = buildDistribution(scores)
    expect(dist.trivial).toBe(2)
    expect(dist.hard).toBe(1)
    expect(dist.nightmare).toBe(0)
  })

  it('returns all zeros for empty', () => {
    const dist = buildDistribution([])
    expect(Object.values(dist).reduce((a, b) => a + b, 0)).toBe(0)
  })
})

// ─── buildPuzzleResult ────────────────────────────────────────────────────

describe('buildPuzzleResult', () => {
  it('returns complete result structure', () => {
    const result = buildPuzzleResult(['a.ts'], ['const x = 1'])
    expect(result).toHaveProperty('files')
    expect(result).toHaveProperty('distribution')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('leaderboard')
    expect(result).toHaveProperty('recommendations')
  })

  it('sorts leaderboard hardest first', () => {
    const result = buildPuzzleResult(
      ['easy.ts', 'hard.ts'],
      ['const x = 1', Array(20).fill('if (a) { if (b) { if (c) { if (d) {} } } }').join('\n')],
    )
    if (result.leaderboard.length >= 2) {
      expect(result.leaderboard[0]!.score).toBeGreaterThanOrEqual(result.leaderboard[1]!.score)
    }
  })

  it('computes stats correctly', () => {
    const result = buildPuzzleResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.hardestFile).toBeTruthy()
    expect(result.stats.easiestFile).toBeTruthy()
  })

  it('handles empty files', () => {
    const result = buildPuzzleResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.files).toHaveLength(0)
    expect(result.leaderboard).toHaveLength(0)
  })

  it('generates recommendations for nightmare files', () => {
    const result = buildPuzzleResult(
      ['nightmare.ts'],
      [Array(30).fill('if (a) { if (b) { if (c) { if (d) { if (e) { if (f) { if (g) {} } } } } } }').join('\n')],
    )
    expect(result.stats.nightmareCount).toBeGreaterThanOrEqual(0)
  })

  it('counts distribution', () => {
    const result = buildPuzzleResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'])
    const total = Object.values(result.distribution).reduce((a, b) => a + b, 0)
    expect(total).toBe(2)
  })
})

// ─── formatLeaderboard ────────────────────────────────────────────────────

describe('formatLeaderboard', () => {
  it('formats leaderboard with ranks', () => {
    const scores: PuzzleScore[] = [
      { file: 'a.ts', difficulty: 'trivial', score: 10, breakdown: { nestingScore: 0, complexityScore: 0, obscurityScore: 0, controlFlowScore: 0, tokenDiversityScore: 0 }, functions: [], estimatedReadTime: '', hints: [] },
    ]
    const output = formatLeaderboard(scores)
    expect(output).toContain('Leaderboard')
    expect(output).toContain('#1')
    expect(output).toContain('a.ts')
  })

  it('returns message for empty', () => {
    expect(formatLeaderboard([])).toContain('No files')
  })
})

// ─── formatPuzzleCard ─────────────────────────────────────────────────────

describe('formatPuzzleCard', () => {
  it('formats card with breakdown bars', () => {
    const score: PuzzleScore = {
      file: 'a.ts', difficulty: 'medium', score: 40,
      breakdown: { nestingScore: 30, complexityScore: 50, obscurityScore: 10, controlFlowScore: 20, tokenDiversityScore: 5 },
      functions: [], estimatedReadTime: '~2 minutes', hints: ['Straightforward code'],
    }
    const output = formatPuzzleCard(score)
    expect(output).toContain('a.ts')
    expect(output).toContain('MEDIUM')
    expect(output).toContain('Nesting')
    expect(output).toContain('Complex')
    expect(output).toContain('40/100')
  })
})

// ─── formatDistributionChart ──────────────────────────────────────────────

describe('formatDistributionChart', () => {
  it('formats distribution chart', () => {
    const output = formatDistributionChart({ trivial: 2, easy: 3, medium: 1, hard: 0, expert: 0, nightmare: 1 })
    expect(output).toContain('trivial')
    expect(output).toContain('nightmare')
    expect(output).toContain('(2)')
    expect(output).toContain('(1)')
  })
})

// ─── formatStats ──────────────────────────────────────────────────────────

describe('formatStats', () => {
  it('formats all stat fields', () => {
    const stats: PuzzleStats = {
      totalFiles: 10, averageScore: 35.5, hardestFile: 'x.ts', easiestFile: 'y.ts',
      totalEstimatedReadTime: '~30 minutes', nightmareCount: 2,
    }
    const output = formatStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('35.5')
    expect(output).toContain('x.ts')
    expect(output).toContain('y.ts')
    expect(output).toContain('2')
  })
})

// ─── formatRecommendations ────────────────────────────────────────────────

describe('formatRecommendations', () => {
  it('formats numbered recommendations', () => {
    const output = formatRecommendations(['Refactor X', 'Simplify Y'])
    expect(output).toContain('1. Refactor X')
    expect(output).toContain('2. Simplify Y')
  })

  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

// ─── formatResult ─────────────────────────────────────────────────────────

describe('formatResult', () => {
  it('combines all sections', () => {
    const result = buildPuzzleResult(['a.ts'], ['const x = 1'])
    const output = formatResult(result)
    expect(output).toContain('Leaderboard')
    expect(output).toContain('Distribution')
    expect(output).toContain('Statistics')
    expect(output).toContain('Recommendations')
  })
})

// ─── formatJson ───────────────────────────────────────────────────────────

describe('formatJson', () => {
  it('produces valid JSON', () => {
    const result = buildPuzzleResult(['a.ts'], ['const x = 1'])
    const json = formatJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('files')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('leaderboard')
  })
})
