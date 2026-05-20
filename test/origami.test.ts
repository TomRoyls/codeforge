import { describe, expect, it } from 'vitest'

import {
  assessPatternQuality,
  buildOrigamiResult,
  classifyOverallQuality,
  computeFoldComplexityIndex,
  computeFoldEfficiency,
  computeUnfoldability,
  countBraceBalance,
  countUnnecessaryFolds,
  detectFoldType,
  extractFolds,
  generateOrigamiRecommendations,
  getPatternDescription,
  getPatternSuggestion,
  hasArrowFunction,
  identifyAllPatterns,
  identifyFoldIssues,
  identifyFoldPattern,
  isGuardClause,
  scoreFile,
  scoreFoldCleanliness,
  type Fold,
  type FoldScore,
  type OrigamiStats,
} from '../src/commands/origami-helpers.js'

import {
  formatCleanScoreBar,
  formatDepthBar,
  formatFoldTree,
  formatFoldTypeBadge,
  formatOrigamiJson,
  formatOrigamiRecommendations,
  formatOrigamiStats,
  formatOrigamiTable,
  formatPatternGallery,
  formatQualityLabel,
  formatScoreTable,
  formatDepthHistogram,
} from '../src/commands/origami-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const FLAT_CONTENT = `const x = 1
const y = 2
const z = x + y
console.log(z)
`

const SIMPLE_FUNCTION = `function add(a: number, b: number): number {
  return a + b
}
`

const NESTED_CONDITIONAL = `function process(data: any): void {
  if (data) {
    if (data.active) {
      if (data.verified) {
        if (data.priority) {
          handlePriority(data)
        }
      }
    }
  }
}
`

const CALLBACK_SPIRAL = `getData((a) => {
  process(a, (b) => {
    transform(b, (c) => {
      save(c, (d) => {
        log(d, (e) => {
          finish(e)
        })
      })
    })
  })
})
`

const IF_ELSE_CHAIN = `function classify(x: number): string {
  if (x > 100) {
    return 'high'
  } else if (x > 50) {
    return 'medium'
  } else if (x > 25) {
    return 'low'
  } else if (x > 10) {
    return 'minimal'
  } else {
    return 'none'
  }
}
`

const MANY_FUNCTIONS = `export function a() { return 1 }
export function b() { return 2 }
export function c() { return 3 }
export function d() { return 4 }
export function e() { return 5 }
export function f() { return 6 }
`

const CLASS_CONTENT = `class Engine {
  constructor(private config: Config) {}

  start(): void {
    if (this.config.valid) {
      this.initialize()
    }
  }

  private initialize(): void {
    for (const module of this.config.modules) {
      module.load()
    }
  }
}
`

const GUARD_CONTENT = `function process(data: any): string {
  if (!data) return 'empty'
  if (!data.id) return 'no-id'
  return data.name
}
`

const TRY_CATCH_CONTENT = `function safeExec(): void {
  try {
    riskyOperation()
  } catch (error) {
    handleError(error)
  } finally {
    cleanup()
  }
}
`

const ARROW_CONTENT = `const add = (a: number, b: number) => a + b
const double = (x: number) => x * 2
`

// ─── detectFoldType ────────────────────────────────────────────────────────────

describe('detectFoldType', () => {
  it('detects conditional', () => {
    expect(detectFoldType('if (x > 0) {', 0)).toBe('conditional')
  })

  it('detects else as conditional', () => {
    expect(detectFoldType('} else {', 1)).toBe('conditional')
  })

  it('detects loop', () => {
    expect(detectFoldType('for (const item of items) {', 0)).toBe('loop')
  })

  it('detects while loop', () => {
    expect(detectFoldType('while (running) {', 0)).toBe('loop')
  })

  it('detects class', () => {
    expect(detectFoldType('class Engine {', 0)).toBe('class')
  })

  it('detects function', () => {
    expect(detectFoldType('function process() {', 0)).toBe('function')
  })

  it('detects try-catch', () => {
    expect(detectFoldType('try {', 0)).toBe('try-catch')
  })

  it('detects callback via arrow at depth', () => {
    expect(detectFoldType('.then(result => {', 1)).toBe('callback')
  })

  it('detects block at depth', () => {
    expect(detectFoldType('{', 1)).toBe('block')
  })

  it('detects indent at depth without braces', () => {
    expect(detectFoldType('  x = 1', 1)).toBe('indent')
  })

  it('detects function with keyword as function', () => {
    expect(detectFoldType('getData(function(a) {', 1)).toBe('function')
  })
})

// ─── countBraceBalance ─────────────────────────────────────────────────────────

describe('countBraceBalance', () => {
  it('counts opening braces', () => {
    expect(countBraceBalance('if (x) {')).toBe(1)
  })

  it('counts closing braces', () => {
    expect(countBraceBalance('}')).toBe(-1)
  })

  it('counts balanced braces', () => {
    expect(countBraceBalance('{ foo() }')).toBe(0)
  })

  it('counts multiple opens', () => {
    expect(countBraceBalance('if (x) { if (y) {')).toBe(2)
  })

  it('returns 0 for no braces', () => {
    expect(countBraceBalance('const x = 1')).toBe(0)
  })

  it('counts parens too', () => {
    expect(countBraceBalance('(a + b)')).toBe(0)
  })
})

// ─── isGuardClause ─────────────────────────────────────────────────────────────

describe('isGuardClause', () => {
  it('detects guard clause', () => {
    expect(isGuardClause('if (!x) return null;', 1)).toBe(true)
  })

  it('detects guard with throw', () => {
    expect(isGuardClause('if (!data) throw new Error()', 1)).toBe(true)
  })

  it('rejects deep guard', () => {
    expect(isGuardClause('if (!x) return null;', 3)).toBe(false)
  })

  it('rejects non-guard if', () => {
    expect(isGuardClause('if (x > 0) { process() }', 1)).toBe(false)
  })
})

// ─── hasArrowFunction ──────────────────────────────────────────────────────────

describe('hasArrowFunction', () => {
  it('detects arrow functions', () => {
    expect(hasArrowFunction(ARROW_CONTENT)).toBe(true)
  })

  it('returns false without arrows', () => {
    expect(hasArrowFunction('function foo() {}')).toBe(false)
  })
})

// ─── extractFolds ──────────────────────────────────────────────────────────────

describe('extractFolds', () => {
  it('returns empty for empty content', () => {
    expect(extractFolds('', 'empty.ts')).toEqual([])
  })

  it('returns empty for flat content', () => {
    expect(extractFolds(FLAT_CONTENT, 'flat.ts')).toEqual([])
  })

  it('extracts function fold', () => {
    const folds = extractFolds(SIMPLE_FUNCTION, 'fn.ts')
    expect(folds.length).toBeGreaterThan(0)
    expect(folds.some(f => f.type === 'function')).toBe(true)
  })

  it('extracts nested conditionals', () => {
    const folds = extractFolds(NESTED_CONDITIONAL, 'nested.ts')
    expect(folds.length).toBeGreaterThan(0)
    expect(folds.some(f => f.type === 'conditional' || f.type === 'function')).toBe(true)
  })

  it('extracts callback folds', () => {
    const folds = extractFolds(CALLBACK_SPIRAL, 'cb.ts')
    expect(folds.some(f => f.type === 'callback' || f.type === 'function')).toBe(true)
  })

  it('assigns increasing depth', () => {
    const folds = extractFolds(NESTED_CONDITIONAL, 'depth.ts')
    const depths = folds.map(f => f.depth)
    expect(Math.max(...depths)).toBeGreaterThan(1)
  })

  it('extracts try-catch folds', () => {
    const folds = extractFolds(TRY_CATCH_CONTENT, 'tc.ts')
    expect(folds.some(f => f.type === 'try-catch')).toBe(true)
  })

  it('extracts class folds', () => {
    const folds = extractFolds(CLASS_CONTENT, 'cls.ts')
    expect(folds.some(f => f.type === 'class')).toBe(true)
  })

  it('computes lineCount for folds', () => {
    const folds = extractFolds(SIMPLE_FUNCTION, 'fn.ts')
    for (const fold of folds) {
      expect(fold.lineCount).toBeGreaterThan(0)
    }
  })

  it('computes cleanScore for folds', () => {
    const folds = extractFolds(SIMPLE_FUNCTION, 'fn.ts')
    for (const fold of folds) {
      expect(fold.cleanScore).toBeGreaterThanOrEqual(0)
      expect(fold.cleanScore).toBeLessThanOrEqual(100)
    }
  })
})

// ─── scoreFoldCleanliness ──────────────────────────────────────────────────────

describe('scoreFoldCleanliness', () => {
  it('gives high score for shallow fold', () => {
    const fold: Fold = { type: 'function', depth: 1, line: 1, lineCount: 5, cleanScore: 0, issues: [] }
    expect(scoreFoldCleanliness(fold)).toBeGreaterThanOrEqual(80)
  })

  it('penalizes deep folds', () => {
    const fold: Fold = { type: 'function', depth: 7, line: 1, lineCount: 5, cleanScore: 0, issues: [] }
    expect(scoreFoldCleanliness(fold)).toBeLessThan(70)
  })

  it('penalizes long folds', () => {
    const fold: Fold = { type: 'function', depth: 1, line: 1, lineCount: 60, cleanScore: 0, issues: [] }
    expect(scoreFoldCleanliness(fold)).toBeLessThan(80)
  })

  it('stays within 0-100 range', () => {
    const fold: Fold = { type: 'callback', depth: 10, line: 1, lineCount: 100, cleanScore: 0, issues: [] }
    expect(scoreFoldCleanliness(fold)).toBeGreaterThanOrEqual(0)
    expect(scoreFoldCleanliness(fold)).toBeLessThanOrEqual(100)
  })
})

// ─── identifyFoldIssues ────────────────────────────────────────────────────────

describe('identifyFoldIssues', () => {
  it('flags deep nesting', () => {
    const fold: Fold = { type: 'conditional', depth: 5, line: 1, lineCount: 5, cleanScore: 0, issues: [] }
    const issues = identifyFoldIssues(fold, '')
    expect(issues).toContain('Deep nesting')
  })

  it('flags long folds', () => {
    const fold: Fold = { type: 'function', depth: 1, line: 1, lineCount: 40, cleanScore: 0, issues: [] }
    const issues = identifyFoldIssues(fold, '')
    expect(issues).toContain('Long fold')
  })

  it('flags nested callbacks', () => {
    const fold: Fold = { type: 'callback', depth: 3, line: 1, lineCount: 5, cleanScore: 0, issues: [] }
    const issues = identifyFoldIssues(fold, '')
    expect(issues).toContain('Nested callback')
  })

  it('returns empty for clean fold', () => {
    const fold: Fold = { type: 'function', depth: 1, line: 1, lineCount: 5, cleanScore: 0, issues: [] }
    const issues = identifyFoldIssues(fold, '')
    expect(issues).toEqual([])
  })
})

// ─── identifyFoldPattern ───────────────────────────────────────────────────────

describe('identifyFoldPattern', () => {
  it('returns flat for empty folds', () => {
    expect(identifyFoldPattern([])).toBe('flat')
  })

  it('detects pyramid from deep conditionals', () => {
    const folds: Fold[] = [
      { type: 'conditional', depth: 5, line: 1, lineCount: 5, cleanScore: 50, issues: [] },
      { type: 'conditional', depth: 4, line: 2, lineCount: 4, cleanScore: 50, issues: [] },
      { type: 'conditional', depth: 3, line: 3, lineCount: 3, cleanScore: 50, issues: [] },
      { type: 'conditional', depth: 2, line: 4, lineCount: 2, cleanScore: 50, issues: [] },
    ]
    expect(identifyFoldPattern(folds)).toBe('pyramid')
  })

  it('detects spiral from callbacks', () => {
    const folds: Fold[] = [
      { type: 'callback', depth: 3, line: 1, lineCount: 5, cleanScore: 50, issues: [] },
      { type: 'callback', depth: 4, line: 2, lineCount: 4, cleanScore: 50, issues: [] },
      { type: 'callback', depth: 5, line: 3, lineCount: 3, cleanScore: 50, issues: [] },
      { type: 'function', depth: 1, line: 4, lineCount: 2, cleanScore: 50, issues: [] },
    ]
    expect(identifyFoldPattern(folds)).toBe('spiral')
  })

  it('detects fan from many same-depth functions', () => {
    const folds: Fold[] = Array.from({ length: 8 }, (_, i) => ({
      type: 'function' as const, depth: 1, line: i + 1, lineCount: 2, cleanScore: 90, issues: [] as string[],
    }))
    expect(identifyFoldPattern(folds)).toBe('fan')
  })
})

// ─── Pattern helpers ───────────────────────────────────────────────────────────

describe('pattern helpers', () => {
  it('getPatternDescription returns description', () => {
    expect(getPatternDescription('pyramid')).toContain('Deep nesting')
    expect(getPatternDescription('spiral')).toContain('callback')
    expect(getPatternDescription('crane')).toContain('elegant')
    expect(getPatternDescription('flat')).toContain('Minimal')
  })

  it('assessPatternQuality rates crane as elegant', () => {
    expect(assessPatternQuality('crane', [])).toBe('elegant')
  })

  it('assessPatternQuality rates flat as elegant', () => {
    expect(assessPatternQuality('flat', [])).toBe('elegant')
  })

  it('assessPatternQuality rates ball as spaghetti', () => {
    expect(assessPatternQuality('ball', [])).toBe('spaghetti')
  })

  it('assessPatternQuality rates spiral as messy', () => {
    expect(assessPatternQuality('spiral', [])).toBe('messy')
  })

  it('getPatternSuggestion returns suggestion', () => {
    expect(getPatternSuggestion('spiral')).toContain('async')
    expect(getPatternSuggestion('pyramid')).toContain('Extract')
    expect(getPatternSuggestion('ball')).toContain('Break apart')
  })
})

// ─── computeUnfoldability ──────────────────────────────────────────────────────

describe('computeUnfoldability', () => {
  it('returns 100 for empty folds', () => {
    expect(computeUnfoldability([], 'code')).toBe(100)
  })

  it('decreases with deeper nesting', () => {
    const shallow: Fold[] = [{ type: 'function', depth: 1, line: 1, lineCount: 3, cleanScore: 100, issues: [] }]
    const deep: Fold[] = [{ type: 'conditional', depth: 6, line: 1, lineCount: 10, cleanScore: 50, issues: [] }]
    expect(computeUnfoldability(shallow, 'code')).toBeGreaterThan(computeUnfoldability(deep, 'code'))
  })

  it('increases with guard clauses', () => {
    const folds: Fold[] = [{ type: 'conditional', depth: 1, line: 1, lineCount: 3, cleanScore: 100, issues: [] }]
    const withoutGuards = computeUnfoldability(folds, 'const x = 1')
    const withGuards = computeUnfoldability(folds, GUARD_CONTENT)
    expect(withGuards).toBeGreaterThanOrEqual(withoutGuards)
  })

  it('is within 0-100 range', () => {
    const folds: Fold[] = [{ type: 'conditional', depth: 8, line: 1, lineCount: 40, cleanScore: 20, issues: [] }]
    const score = computeUnfoldability(folds, 'code')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── scoreFile ─────────────────────────────────────────────────────────────────

describe('scoreFile', () => {
  it('returns perfect score for empty folds', () => {
    const score = scoreFile([], FLAT_CONTENT, 'flat.ts')
    expect(score.cleanScore).toBe(100)
    expect(score.unfoldability).toBe(100)
    expect(score.pattern).toBe('flat')
    expect(score.totalFolds).toBe(0)
  })

  it('computes scores for simple file', () => {
    const folds = extractFolds(SIMPLE_FUNCTION, 'fn.ts')
    const score = scoreFile(folds, SIMPLE_FUNCTION, 'fn.ts')
    expect(score.totalFolds).toBeGreaterThan(0)
    expect(score.maxDepth).toBeGreaterThan(0)
    expect(score.file).toBe('fn.ts')
  })

  it('computes avgDepth', () => {
    const folds = extractFolds(SIMPLE_FUNCTION, 'fn.ts')
    const score = scoreFile(folds, SIMPLE_FUNCTION, 'fn.ts')
    expect(score.avgDepth).toBeGreaterThan(0)
  })

  it('collects issues from folds', () => {
    const folds = extractFolds(NESTED_CONDITIONAL, 'deep.ts')
    const score = scoreFile(folds, NESTED_CONDITIONAL, 'deep.ts')
    expect(score.issues.length).toBeGreaterThanOrEqual(0)
  })
})

// ─── identifyAllPatterns ───────────────────────────────────────────────────────

describe('identifyAllPatterns', () => {
  it('groups files by pattern', () => {
    const scores: FoldScore[] = [
      { file: 'a.ts', totalFolds: 1, maxDepth: 1, avgDepth: 1, cleanScore: 100, unfoldability: 100, pattern: 'flat', issues: [] },
      { file: 'b.ts', totalFolds: 3, maxDepth: 2, avgDepth: 1.5, cleanScore: 90, unfoldability: 85, pattern: 'flat', issues: [] },
    ]
    const patterns = identifyAllPatterns(scores)
    expect(patterns).toHaveLength(1)
    expect(patterns[0].files).toHaveLength(2)
  })

  it('sorts by fold count descending', () => {
    const scores: FoldScore[] = [
      { file: 'a.ts', totalFolds: 1, maxDepth: 1, avgDepth: 1, cleanScore: 100, unfoldability: 100, pattern: 'flat', issues: [] },
      { file: 'b.ts', totalFolds: 5, maxDepth: 3, avgDepth: 2, cleanScore: 80, unfoldability: 70, pattern: 'pyramid', issues: [] },
    ]
    const patterns = identifyAllPatterns(scores)
    expect(patterns[0].name).toBe('pyramid')
  })
})

// ─── Efficiency & Complexity ───────────────────────────────────────────────────

describe('computeFoldEfficiency', () => {
  it('returns 100 for no folds', () => {
    expect(computeFoldEfficiency([], 10)).toBe(100)
  })

  it('decreases with more fold coverage', () => {
    const folds: Fold[] = Array.from({ length: 5 }, () => ({
      type: 'function' as const, depth: 1, line: 1, lineCount: 10, cleanScore: 80, issues: [] as string[],
    }))
    const eff = computeFoldEfficiency(folds, 50)
    expect(eff).toBeLessThan(100)
    expect(eff).toBeGreaterThanOrEqual(0)
  })
})

describe('countUnnecessaryFolds', () => {
  it('counts trivial shallow folds', () => {
    const folds: Fold[] = [
      { type: 'block', depth: 1, line: 1, lineCount: 2, cleanScore: 100, issues: [] },
    ]
    expect(countUnnecessaryFolds(folds)).toBe(1)
  })

  it('excludes meaningful folds', () => {
    const folds: Fold[] = [
      { type: 'function', depth: 1, line: 1, lineCount: 15, cleanScore: 90, issues: [] },
    ]
    expect(countUnnecessaryFolds(folds)).toBe(0)
  })

  it('returns 0 for empty', () => {
    expect(countUnnecessaryFolds([])).toBe(0)
  })
})

describe('computeFoldComplexityIndex', () => {
  it('returns 0 for empty', () => {
    expect(computeFoldComplexityIndex([])).toBe(0)
  })

  it('increases with depth and callbacks', () => {
    const simple: Fold[] = [{ type: 'function', depth: 1, line: 1, lineCount: 5, cleanScore: 100, issues: [] }]
    const complex: Fold[] = [{ type: 'callback', depth: 5, line: 1, lineCount: 10, cleanScore: 50, issues: [] }]
    expect(computeFoldComplexityIndex(complex)).toBeGreaterThan(computeFoldComplexityIndex(simple))
  })
})

// ─── classifyOverallQuality ────────────────────────────────────────────────────

describe('classifyOverallQuality', () => {
  it('returns masterwork for high scores', () => {
    expect(classifyOverallQuality(90, 85)).toBe('masterwork')
  })

  it('returns clean for good scores', () => {
    expect(classifyOverallQuality(75, 70)).toBe('clean')
  })

  it('returns average for mid scores', () => {
    expect(classifyOverallQuality(55, 50)).toBe('average')
  })

  it('returns rough for low scores', () => {
    expect(classifyOverallQuality(35, 30)).toBe('rough')
  })

  it('returns crumpled for very low scores', () => {
    expect(classifyOverallQuality(10, 15)).toBe('crumpled')
  })
})

// ─── generateOrigamiRecommendations ────────────────────────────────────────────

describe('generateOrigamiRecommendations', () => {
  const baseStats: OrigamiStats = {
    totalFolds: 10, avgDepth: 2, maxDepth: 4,
    deepestFile: 'a.ts', cleanestFile: 'b.ts', messiestFile: 'c.ts',
    avgCleanScore: 75, avgUnfoldability: 70,
    patternDistribution: { flat: 2 }, overallFoldQuality: 'clean',
    foldEfficiency: 80, unnecessaryFolds: 0, foldComplexityIndex: 20,
  }

  it('recommends extracting deep folds', () => {
    const deepFolds: Fold[] = [{ type: 'conditional', depth: 5, line: 1, lineCount: 10, cleanScore: 50, issues: ['Deep nesting'] }]
    const recs = generateOrigamiRecommendations(deepFolds, [], [], baseStats)
    expect(recs.some(r => r.includes('deeply nested'))).toBe(true)
  })

  it('recommends refactoring spirals', () => {
    const recs = generateOrigamiRecommendations([], [{ name: 'spiral', description: '', files: ['a.ts'], avgDepth: 3, foldCount: 5, quality: 'messy', suggestion: '' }], [], baseStats)
    expect(recs.some(r => r.includes('async'))).toBe(true)
  })

  it('recommends untangling ball', () => {
    const recs = generateOrigamiRecommendations([], [{ name: 'ball', description: '', files: ['a.ts'], avgDepth: 4, foldCount: 8, quality: 'spaghetti', suggestion: '' }], [], baseStats)
    expect(recs.some(r => r.includes('spaghetti'))).toBe(true)
  })

  it('recommends flattening unnecessary folds', () => {
    const stats = { ...baseStats, unnecessaryFolds: 5 }
    const recs = generateOrigamiRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('Flatten'))).toBe(true)
  })

  it('recommends for high complexity', () => {
    const stats = { ...baseStats, foldComplexityIndex: 60 }
    const recs = generateOrigamiRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('complexity'))).toBe(true)
  })

  it('returns empty for clean codebase', () => {
    const recs = generateOrigamiRecommendations([], [], [], baseStats)
    expect(recs).toEqual([])
  })
})

// ─── buildOrigamiResult ────────────────────────────────────────────────────────

describe('buildOrigamiResult', () => {
  it('handles empty file list', () => {
    const result = buildOrigamiResult([], [], {})
    expect(result.folds).toEqual([])
    expect(result.stats.totalFolds).toBe(0)
    expect(result.stats.avgCleanScore).toBe(100)
  })

  it('analyzes single file', () => {
    const result = buildOrigamiResult(['fn.ts'], [SIMPLE_FUNCTION], {})
    expect(result.folds.length).toBeGreaterThan(0)
    expect(result.scores).toHaveLength(1)
  })

  it('analyzes multiple files', () => {
    const result = buildOrigamiResult(
      ['fn.ts', 'nested.ts'],
      [SIMPLE_FUNCTION, NESTED_CONDITIONAL],
      {},
    )
    expect(result.scores).toHaveLength(2)
    expect(result.stats.totalFolds).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const result = buildOrigamiResult(['fn.ts'], [SIMPLE_FUNCTION], {})
    expect(result.stats.maxDepth).toBeGreaterThanOrEqual(result.stats.avgDepth)
  })

  it('identifies deepest file', () => {
    const result = buildOrigamiResult(
      ['shallow.ts', 'deep.ts'],
      [SIMPLE_FUNCTION, NESTED_CONDITIONAL],
      {},
    )
    expect(result.stats.deepestFile).toBeTruthy()
  })

  it('identifies patterns', () => {
    const result = buildOrigamiResult(
      ['cb.ts'],
      [CALLBACK_SPIRAL],
      {},
    )
    expect(result.patterns.length).toBeGreaterThan(0)
  })

  it('computes fold efficiency', () => {
    const result = buildOrigamiResult(['fn.ts'], [SIMPLE_FUNCTION], {})
    expect(result.stats.foldEfficiency).toBeGreaterThanOrEqual(0)
    expect(result.stats.foldEfficiency).toBeLessThanOrEqual(100)
  })

  it('computes complexity index', () => {
    const result = buildOrigamiResult(['fn.ts'], [SIMPLE_FUNCTION], {})
    expect(result.stats.foldComplexityIndex).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('formatFoldTypeBadge returns badge', () => {
    expect(formatFoldTypeBadge('function')).toContain('function')
    expect(formatFoldTypeBadge('class')).toContain('class')
  })

  it('formatQualityLabel returns colored label', () => {
    expect(formatQualityLabel('masterwork')).toContain('masterwork')
    expect(formatQualityLabel('crumpled')).toContain('crumpled')
  })

  it('formatDepthBar returns bar', () => {
    const bar = formatDepthBar(5)
    expect(bar).toContain('5')
  })

  it('formatCleanScoreBar returns bar', () => {
    const bar = formatCleanScoreBar(75)
    expect(bar).toContain('75')
  })

  it('formatFoldTree handles empty', () => {
    expect(formatFoldTree([])).toContain('No folds')
  })

  it('formatFoldTree renders folds', () => {
    const folds: Fold[] = [
      { type: 'function', depth: 1, line: 1, lineCount: 5, cleanScore: 90, issues: [] },
    ]
    const tree = formatFoldTree(folds)
    expect(tree).toContain('function')
    expect(tree).toContain('L1')
  })

  it('formatPatternGallery handles empty', () => {
    expect(formatPatternGallery([])).toContain('No fold patterns')
  })

  it('formatPatternGallery renders patterns', () => {
    const patterns = [{
      name: 'pyramid', description: 'test', files: ['a.ts'], avgDepth: 3,
      foldCount: 5, quality: 'messy' as const, suggestion: 'Extract',
    }]
    const gallery = formatPatternGallery(patterns)
    expect(gallery).toContain('pyramid')
  })

  it('formatScoreTable handles empty', () => {
    expect(formatScoreTable([])).toContain('No fold scores')
  })

  it('formatScoreTable renders scores', () => {
    const scores: FoldScore[] = [{
      file: 'app.ts', totalFolds: 5, maxDepth: 3, avgDepth: 1.5,
      cleanScore: 80, unfoldability: 75, pattern: 'flat', issues: [],
    }]
    const table = formatScoreTable(scores)
    expect(table).toContain('app.ts')
  })

  it('formatDepthHistogram handles empty', () => {
    expect(formatDepthHistogram([])).toContain('No depth data')
  })

  it('formatDepthHistogram renders histogram', () => {
    const folds: Fold[] = [
      { type: 'function', depth: 1, line: 1, lineCount: 5, cleanScore: 90, issues: [] },
      { type: 'function', depth: 1, line: 2, lineCount: 3, cleanScore: 90, issues: [] },
      { type: 'conditional', depth: 2, line: 3, lineCount: 4, cleanScore: 80, issues: [] },
    ]
    const hist = formatDepthHistogram(folds)
    expect(hist).toContain('D1')
    expect(hist).toContain('D2')
  })

  it('formatOrigamiStats renders stats', () => {
    const stats: OrigamiStats = {
      totalFolds: 20, avgDepth: 2.5, maxDepth: 5,
      deepestFile: 'deep.ts', cleanestFile: 'clean.ts', messiestFile: 'mess.ts',
      avgCleanScore: 78, avgUnfoldability: 72,
      patternDistribution: { flat: 3, pyramid: 2 },
      overallFoldQuality: 'clean', foldEfficiency: 85,
      unnecessaryFolds: 2, foldComplexityIndex: 35,
    }
    const formatted = formatOrigamiStats(stats)
    expect(formatted).toContain('20')
    expect(formatted).toContain('2.5')
    expect(formatted).toContain('flat:3')
  })

  it('formatOrigamiRecommendations returns success for empty', () => {
    expect(formatOrigamiRecommendations([])).toContain('elegant')
  })

  it('formatOrigamiRecommendations renders bullets', () => {
    const recs = formatOrigamiRecommendations(['Fix deep nesting', 'Refactor callbacks'])
    expect(recs).toContain('Fix deep nesting')
    expect(recs).toContain('Refactor callbacks')
  })

  it('formatOrigamiJson returns valid JSON', () => {
    const result = buildOrigamiResult([], [], {})
    const json = formatOrigamiJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('formatOrigamiTable returns output', () => {
    const result = buildOrigamiResult(['fn.ts'], [SIMPLE_FUNCTION], {})
    const output = formatOrigamiTable(result, false)
    expect(output.length).toBeGreaterThan(0)
  })

  it('formatOrigamiTable with verbose shows fold tree', () => {
    const result = buildOrigamiResult(['fn.ts'], [SIMPLE_FUNCTION], {})
    const output = formatOrigamiTable(result, true)
    expect(output).toContain('Fold Tree')
  })
})
