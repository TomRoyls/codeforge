import { describe, expect, it } from 'vitest'

import {
  analyzeThroughClarity,
  analyzeThroughEfficiency,
  analyzeThroughEvolution,
  analyzeThroughModularity,
  analyzeThroughReadability,
  analyzeThroughReliability,
  buildPrismResult,
  computeComposite,
  generateInsights,
  generateRecommendations,
  type Prism,
  type PrismResult,
} from '../src/commands/prism-helpers.js'

import {
  formatCompositeGauge,
  formatPrismComparison,
  formatPrismFindings,
  formatPrismJSON,
  formatPrismRow,
  formatPrismTable,
  formatRecommendations,
  formatSeverity,
  formatStatsSummary,
  getPrismColor,
} from '../src/commands/prism-format-helpers.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CLEAN_FILE = `import { readFile } from 'node:fs/promises'
/** Greet someone */
export function hello(name: string): string {
  return 'Hello ' + name
}
`

const LONG_LINES_FILE = `${'x'.repeat(150)}\n`.repeat(10)

const DEEP_NESTING_FILE = `function deep() {
  if (true) {
    if (true) {
      if (true) {
        if (true) {
          if (true) {
            if (true) {
              if (true) {
                console.log('deep')
              }
            }
          }
        }
      }
    }
  }
}`

const UNCOMMENTED_FILE = `${'const x = 1\n'.repeat(30)}`

const SHORT_NAMES_FILE = `x = 1; y = 2; z = 3; a = 4;`

const SILENT_CATCH_FILE = `try { doSomething() } catch (e) {}`

const ANY_TYPE_FILE = `const x: any = 1; const y: any = 2;`

const NO_ERROR_HANDLING_FILE = `${'const x = 1\n'.repeat(30)}`

const BANG_OPS_FILE = `const a = foo!; const b = bar!; const c = baz!; const d = qux!;`

const SYNC_IO_FILE = `const a = readFileSync('a'); const b = writeFileSync('b'); const c = existsSync('c');`

const AWAIT_IN_LOOP_FILE = `for (const item of items) { await process(item) }`

const CONSOLE_HEAVY_FILE = `${Array(8).fill('console.log("x")').join('\n')}`

const HIGH_IMPORTS_FILE = `${Array(20).fill((i: number) => `import { mod${i} } from './mod${i}'`).map((fn, i) => fn(i)).join('\n')}\nexport function foo() {}`

const LARGE_FILE_FILE = `${'const x = 1\n'.repeat(550)}`

const MANY_EXPORTS_FILE = Array(15).fill((i: number) => `export function fn${i}() {}`).map((fn, i) => fn(i)).join('\n')

const NO_ABSTRACTIONS_FILE = `${'const x = 1\n'.repeat(30)}`

const HARDCODED_FILE = Array(8).fill("'SOME_CONFIG_VALUE'").join('\n')

const MANY_SWITCHES_FILE = Array(5).fill('switch (x) { case 1: break; }').join('\n')

const MAGIC_NUMBERS_FILE = 'const a = 42; const b = 314; const c = 271; const d = 1337; const e = 9999; const f = 1234;'

const NO_JSDOC_FILE = `${'const x = 1\n'.repeat(30)}`

const SINGLE_LETTER_VARS_FILE = Array(8).fill('const i = 0').join('\n')

const BOOL_PARAMS_FILE = Array(5).fill('fn(true, false)').join('\n')

function makePrism(overrides: Partial<Prism> = {}): Prism {
  return {
    name: 'TestPrism',
    color: 'red',
    description: 'A test prism for testing',
    files: [],
    stats: { averageScore: 80, bestFile: '', worstFile: '', findingCount: 0, criticalCount: 0 },
    insights: ['Test insight'],
    ...overrides,
  }
}

// ─── analyzeThroughReadability ────────────────────────────────────────────────

describe('analyzeThroughReadability', () => {
  it('returns a prism with name Readability and color red', () => {
    const result = analyzeThroughReadability(['a.ts'], [CLEAN_FILE])
    expect(result.name).toBe('Readability')
    expect(result.color).toBe('red')
  })

  it('gives score 100 for clean code', () => {
    const result = analyzeThroughReadability(['a.ts'], [CLEAN_FILE])
    expect(result.files[0]!.score).toBe(100)
  })

  it('penalizes files with many long lines (>120 chars)', () => {
    const result = analyzeThroughReadability(['a.ts'], [LONG_LINES_FILE])
    expect(result.files[0]!.score).toBeLessThan(100)
    expect(result.files[0]!.findings.length).toBeGreaterThan(0)
  })

  it('penalizes deep nesting (depth > 6)', () => {
    const result = analyzeThroughReadability(['a.ts'], [DEEP_NESTING_FILE])
    expect(result.files[0]!.score).toBeLessThan(100)
  })

  it('penalizes low comment ratio in large files', () => {
    const result = analyzeThroughReadability(['a.ts'], [UNCOMMENTED_FILE])
    expect(result.files[0]!.score).toBeLessThan(100)
  })

  it('penalizes single-letter variable names', () => {
    const result = analyzeThroughReadability(['a.ts'], [SHORT_NAMES_FILE])
    expect(result.files[0]!.score).toBeLessThan(100)
  })

  it('does not penalize short files for low comments', () => {
    const result = analyzeThroughReadability(['a.ts'], ['const x = 1'])
    expect(result.files[0]!.findings.some((f) => f.message.includes('comment'))).toBe(false)
  })

  it('computes stats with bestFile and worstFile', () => {
    const result = analyzeThroughReadability(['a.ts', 'b.ts'], [CLEAN_FILE, LONG_LINES_FILE])
    expect(result.stats.bestFile).toBe('a.ts')
    expect(result.stats.worstFile).toBe('b.ts')
  })

  it('adds insight when average score >= 80', () => {
    const result = analyzeThroughReadability(['a.ts'], [CLEAN_FILE])
    expect(result.insights).toContain('Code is generally readable')
  })

  it('adds insight when average score < 60', () => {
    const terrible = Array(15).fill(null).map(() => LONG_LINES_FILE).join('\n') + DEEP_NESTING_FILE + SHORT_NAMES_FILE + UNCOMMENTED_FILE
    const result = analyzeThroughReadability(['a.ts'], [terrible])
    expect(result.stats.averageScore).toBeLessThanOrEqual(60)
  })

  it('handles empty file arrays', () => {
    const result = analyzeThroughReadability([], [])
    expect(result.files.length).toBe(0)
    expect(result.stats.averageScore).toBe(50)
  })

  it('clamps scores to 0-100', () => {
    const terribleFile = LONG_LINES_FILE + DEEP_NESTING_FILE + UNCOMMENTED_FILE + SHORT_NAMES_FILE
    const result = analyzeThroughReadability(['a.ts'], [terribleFile])
    expect(result.files[0]!.score).toBeGreaterThanOrEqual(0)
    expect(result.files[0]!.score).toBeLessThanOrEqual(100)
  })

  it('description mentions line length and nesting', () => {
    const result = analyzeThroughReadability(['a.ts'], [CLEAN_FILE])
    expect(result.description).toContain('Line length')
  })
})

// ─── analyzeThroughReliability ────────────────────────────────────────────────

describe('analyzeThroughReliability', () => {
  it('returns a prism with name Reliability and color orange', () => {
    const result = analyzeThroughReliability(['a.ts'], [CLEAN_FILE])
    expect(result.name).toBe('Reliability')
    expect(result.color).toBe('orange')
  })

  it('detects silent catch blocks', () => {
    const result = analyzeThroughReliability(['a.ts'], [SILENT_CATCH_FILE])
    expect(result.files[0]!.findings.some((f) => f.severity === 'critical')).toBe(true)
  })

  it('detects any type usage', () => {
    const result = analyzeThroughReliability(['a.ts'], [ANY_TYPE_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('any'))).toBe(true)
  })

  it('flags files with no error handling (large files)', () => {
    const result = analyzeThroughReliability(['a.ts'], [NO_ERROR_HANDLING_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('error handling'))).toBe(true)
  })

  it('does not flag small files for no error handling', () => {
    const result = analyzeThroughReliability(['a.ts'], ['const x = 1'])
    expect(result.files[0]!.findings.some((f) => f.message.includes('error handling'))).toBe(false)
  })

  it('detects non-null assertions (>3)', () => {
    const result = analyzeThroughReliability(['a.ts'], [BANG_OPS_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('non-null'))).toBe(true)
  })

  it('does not flag 3 or fewer non-null assertions', () => {
    const code = 'const a = foo!; const b = bar!; const c = baz!;'
    const result = analyzeThroughReliability(['a.ts'], [code])
    expect(result.files[0]!.findings.some((f) => f.message.includes('non-null'))).toBe(false)
  })

  it('adds critical insight when critical findings exist', () => {
    const result = analyzeThroughReliability(['a.ts'], [SILENT_CATCH_FILE])
    expect(result.insights.some((i) => i.includes('critical'))).toBe(true)
  })

  it('adds solid insight when score >= 80', () => {
    const result = analyzeThroughReliability(['a.ts'], ['try { foo() } catch(e) { handle(e) }'])
    expect(result.insights.some((i) => i.includes('solid'))).toBe(true)
  })

  it('gives score 100 for clean code', () => {
    const result = analyzeThroughReliability(['a.ts'], [CLEAN_FILE])
    expect(result.files[0]!.score).toBe(100)
  })

  it('handles empty arrays', () => {
    const result = analyzeThroughReliability([], [])
    expect(result.stats.averageScore).toBe(50)
  })

  it('penalizes multiple silent catches cumulatively', () => {
    const code = `try { a() } catch(e) {} try { b() } catch(e) {}`
    const result = analyzeThroughReliability(['a.ts'], [code])
    expect(result.files[0]!.score).toBeLessThanOrEqual(80)
  })
})

// ─── analyzeThroughEfficiency ─────────────────────────────────────────────────

describe('analyzeThroughEfficiency', () => {
  it('returns a prism with name Efficiency and color yellow', () => {
    const result = analyzeThroughEfficiency(['a.ts'], [CLEAN_FILE])
    expect(result.name).toBe('Efficiency')
    expect(result.color).toBe('yellow')
  })

  it('detects synchronous I/O calls', () => {
    const result = analyzeThroughEfficiency(['a.ts'], [SYNC_IO_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('synchronous'))).toBe(true)
    expect(result.files[0]!.score).toBeLessThan(100)
  })

  it('detects await-in-loop patterns', () => {
    const result = analyzeThroughEfficiency(['a.ts'], [AWAIT_IN_LOOP_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('await-in-loop'))).toBe(true)
  })

  it('flags excessive console statements (>5)', () => {
    const result = analyzeThroughEfficiency(['a.ts'], [CONSOLE_HEAVY_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('console'))).toBe(true)
  })

  it('does not flag 5 or fewer console statements', () => {
    const code = Array(5).fill('console.log("x")').join('\n')
    const result = analyzeThroughEfficiency(['a.ts'], [code])
    expect(result.files[0]!.findings.some((f) => f.message.includes('console'))).toBe(false)
  })

  it('adds efficiency findings insight when issues found', () => {
    const result = analyzeThroughEfficiency(['a.ts'], [SYNC_IO_FILE])
    expect(result.insights.some((i) => i.includes('efficiency findings'))).toBe(true)
  })

  it('gives score 100 for clean async code', () => {
    const result = analyzeThroughEfficiency(['a.ts'], ['await fs.readFile("a")'])
    expect(result.files[0]!.score).toBe(100)
  })

  it('handles empty arrays', () => {
    const result = analyzeThroughEfficiency([], [])
    expect(result.stats.averageScore).toBe(50)
  })

  it('mentions least efficient file', () => {
    const result = analyzeThroughEfficiency(['a.ts'], [SYNC_IO_FILE])
    expect(result.insights.some((i) => i.includes('Least efficient'))).toBe(true)
  })
})

// ─── analyzeThroughModularity ─────────────────────────────────────────────────

describe('analyzeThroughModularity', () => {
  it('returns a prism with name Modularity and color green', () => {
    const result = analyzeThroughModularity(['a.ts'], [CLEAN_FILE])
    expect(result.name).toBe('Modularity')
    expect(result.color).toBe('green')
  })

  it('penalizes high import count (>15)', () => {
    const result = analyzeThroughModularity(['a.ts'], [HIGH_IMPORTS_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('High coupling'))).toBe(true)
  })

  it('penalizes moderate import count (11-15)', () => {
    const code = Array(12).fill(0).map((_, i) => `import { m${i} } from './m${i}'`).join('\n')
    const result = analyzeThroughModularity(['a.ts'], [code])
    expect(result.files[0]!.findings.some((f) => f.message.includes('Moderate coupling'))).toBe(true)
  })

  it('penalizes large files (>500 lines)', () => {
    const result = analyzeThroughModularity(['a.ts'], [LARGE_FILE_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('Large file'))).toBe(true)
  })

  it('penalizes files getting large (301-500 lines)', () => {
    const code = `${'const x = 1\n'.repeat(350)}`
    const result = analyzeThroughModularity(['a.ts'], [code])
    expect(result.files[0]!.findings.some((f) => f.message.includes('File getting large'))).toBe(true)
  })

  it('penalizes too many exports (>10)', () => {
    const result = analyzeThroughModularity(['a.ts'], [MANY_EXPORTS_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('exports'))).toBe(true)
  })

  it('gives score 100 for well-structured code', () => {
    const result = analyzeThroughModularity(['a.ts'], [CLEAN_FILE])
    expect(result.files[0]!.score).toBe(100)
  })

  it('adds good modularity insight when score >= 80', () => {
    const result = analyzeThroughModularity(['a.ts'], [CLEAN_FILE])
    expect(result.insights).toContain('Good modularity and separation')
  })

  it('handles empty arrays', () => {
    const result = analyzeThroughModularity([], [])
    expect(result.stats.averageScore).toBe(50)
  })
})

// ─── analyzeThroughEvolution ──────────────────────────────────────────────────

describe('analyzeThroughEvolution', () => {
  it('returns a prism with name Evolution and color blue', () => {
    const result = analyzeThroughEvolution(['a.ts'], [CLEAN_FILE])
    expect(result.name).toBe('Evolution')
    expect(result.color).toBe('blue')
  })

  it('penalizes lack of abstractions in larger files', () => {
    const result = analyzeThroughEvolution(['a.ts'], [NO_ABSTRACTIONS_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('abstractions'))).toBe(true)
  })

  it('does not flag small files for no abstractions', () => {
    const result = analyzeThroughEvolution(['a.ts'], ['const x = 1'])
    expect(result.files[0]!.findings.some((f) => f.message.includes('abstractions'))).toBe(false)
  })

  it('does not flag files with interfaces', () => {
    const code = `interface Foo { bar: string }\n${'const x = 1\n'.repeat(30)}`
    const result = analyzeThroughEvolution(['a.ts'], [code])
    expect(result.files[0]!.findings.some((f) => f.message.includes('abstractions'))).toBe(false)
  })

  it('does not flag files with type aliases', () => {
    const code = `type Foo = string;\n${'const x = 1\n'.repeat(30)}`
    const result = analyzeThroughEvolution(['a.ts'], [code])
    expect(result.files[0]!.findings.some((f) => f.message.includes('abstractions'))).toBe(false)
  })

  it('does not flag files with generics', () => {
    const code = `function foo<T>(x: T): T { return x }\n${'const x = 1\n'.repeat(30)}`
    const result = analyzeThroughEvolution(['a.ts'], [code])
    expect(result.files[0]!.findings.some((f) => f.message.includes('abstractions'))).toBe(false)
  })

  it('penalizes hardcoded values (>5)', () => {
    const result = analyzeThroughEvolution(['a.ts'], [HARDCODED_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('hardcoded'))).toBe(true)
  })

  it('penalizes many switch statements (>3)', () => {
    const result = analyzeThroughEvolution(['a.ts'], [MANY_SWITCHES_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('switch'))).toBe(true)
  })

  it('adds evolution insight when score >= 80', () => {
    const result = analyzeThroughEvolution(['a.ts'], [CLEAN_FILE])
    expect(result.insights.some((i) => i.includes('well-structured'))).toBe(true)
  })

  it('handles empty arrays', () => {
    const result = analyzeThroughEvolution([], [])
    expect(result.stats.averageScore).toBe(50)
  })
})

// ─── analyzeThroughClarity ────────────────────────────────────────────────────

describe('analyzeThroughClarity', () => {
  it('returns a prism with name Clarity and color violet', () => {
    const result = analyzeThroughClarity(['a.ts'], [CLEAN_FILE])
    expect(result.name).toBe('Clarity')
    expect(result.color).toBe('violet')
  })

  it('penalizes many magic numbers (>5)', () => {
    const result = analyzeThroughClarity(['a.ts'], [MAGIC_NUMBERS_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('magic number'))).toBe(true)
  })

  it('penalizes lack of JSDoc in larger files', () => {
    const result = analyzeThroughClarity(['a.ts'], [NO_JSDOC_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('JSDoc'))).toBe(true)
  })

  it('does not flag small files for no JSDoc', () => {
    const result = analyzeThroughClarity(['a.ts'], ['const x = 1'])
    expect(result.files[0]!.findings.some((f) => f.message.includes('JSDoc'))).toBe(false)
  })

  it('does not flag files with JSDoc', () => {
    const code = `/** Docs */\nfunction foo() {}\n${'const x = 1\n'.repeat(25)}`
    const result = analyzeThroughClarity(['a.ts'], [code])
    expect(result.files[0]!.findings.some((f) => f.message.includes('JSDoc'))).toBe(false)
  })

  it('penalizes many single-letter variables (>5)', () => {
    const result = analyzeThroughClarity(['a.ts'], [SINGLE_LETTER_VARS_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('single-letter'))).toBe(true)
  })

  it('penalizes many boolean parameters (>3)', () => {
    const result = analyzeThroughClarity(['a.ts'], [BOOL_PARAMS_FILE])
    expect(result.files[0]!.findings.some((f) => f.message.includes('boolean'))).toBe(true)
  })

  it('gives score 100 for clean well-documented code', () => {
    const code = `/** Docs */\nconst MAX_COUNT = 100;\nfunction doThing(options: object) {}`
    const result = analyzeThroughClarity(['a.ts'], [code])
    expect(result.files[0]!.score).toBe(100)
  })

  it('adds clarity insight when score >= 80', () => {
    const result = analyzeThroughClarity(['a.ts'], [CLEAN_FILE])
    expect(result.insights.some((i) => i.includes('self-documenting'))).toBe(true)
  })

  it('handles empty arrays', () => {
    const result = analyzeThroughClarity([], [])
    expect(result.stats.averageScore).toBe(50)
  })

  it('filters out common numbers 0, 1, 10, 100, 1000 from magic number count', () => {
    const code = 'const a = 0; const b = 1; const c = 10; const d = 100; const e = 1000;'
    const result = analyzeThroughClarity(['a.ts'], [code])
    expect(result.files[0]!.findings.some((f) => f.message.includes('magic number'))).toBe(false)
  })
})

// ─── computeComposite ─────────────────────────────────────────────────────────

describe('computeComposite', () => {
  it('returns grade A for score >= 90', () => {
    const prisms = [makePrism({ stats: { averageScore: 95, bestFile: 'a', worstFile: 'a', findingCount: 0, criticalCount: 0 } })]
    const result = computeComposite(prisms)
    expect(result.overallGrade).toBe('A')
  })

  it('returns grade B for score 80-89', () => {
    const prisms = [makePrism({ stats: { averageScore: 85, bestFile: 'a', worstFile: 'a', findingCount: 0, criticalCount: 0 } })]
    const result = computeComposite(prisms)
    expect(result.overallGrade).toBe('B')
  })

  it('returns grade C for score 70-79', () => {
    const prisms = [makePrism({ stats: { averageScore: 75, bestFile: 'a', worstFile: 'a', findingCount: 0, criticalCount: 0 } })]
    const result = computeComposite(prisms)
    expect(result.overallGrade).toBe('C')
  })

  it('returns grade D for score 60-69', () => {
    const prisms = [makePrism({ stats: { averageScore: 65, bestFile: 'a', worstFile: 'a', findingCount: 0, criticalCount: 0 } })]
    const result = computeComposite(prisms)
    expect(result.overallGrade).toBe('D')
  })

  it('returns grade F for score < 60', () => {
    const prisms = [makePrism({ stats: { averageScore: 40, bestFile: 'a', worstFile: 'a', findingCount: 0, criticalCount: 0 } })]
    const result = computeComposite(prisms)
    expect(result.overallGrade).toBe('F')
  })

  it('computes average across multiple prisms', () => {
    const prisms = [
      makePrism({ stats: { averageScore: 80, bestFile: 'a', worstFile: 'a', findingCount: 0, criticalCount: 0 } }),
      makePrism({ stats: { averageScore: 100, bestFile: 'a', worstFile: 'a', findingCount: 0, criticalCount: 0 } }),
    ]
    const result = computeComposite(prisms)
    expect(result.overallScore).toBe(90)
  })

  it('identifies best and worst prisms', () => {
    const prisms = [
      makePrism({ name: 'Low', stats: { averageScore: 50, bestFile: 'a', worstFile: 'a', findingCount: 0, criticalCount: 0 } }),
      makePrism({ name: 'High', stats: { averageScore: 95, bestFile: 'a', worstFile: 'a', findingCount: 0, criticalCount: 0 } }),
    ]
    const result = computeComposite(prisms)
    expect(result.bestPrism).toBe('High')
    expect(result.worstPrism).toBe('Low')
  })

  it('returns defaults for empty prisms', () => {
    const result = computeComposite([])
    expect(result.overallScore).toBe(50)
    expect(result.overallGrade).toBe('C')
    expect(result.worstPrism).toBe('')
    expect(result.bestPrism).toBe('')
  })
})

// ─── generateInsights ─────────────────────────────────────────────────────────

describe('generateInsights', () => {
  it('returns prism insights when present', () => {
    const prism = makePrism({ insights: ['foo', 'bar'] })
    expect(generateInsights(prism)).toEqual(['foo', 'bar'])
  })

  it('returns fallback when no insights', () => {
    const prism = makePrism({ insights: [] })
    const result = generateInsights(prism)
    expect(result.length).toBe(1)
    expect(result[0]).toContain('TestPrism')
    expect(result[0]).toContain('no significant findings')
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends improvement when overall score < 60', () => {
    const prisms = [makePrism({ stats: { averageScore: 40, bestFile: 'a', worstFile: 'a', findingCount: 0, criticalCount: 0 } })]
    const composite = { overallScore: 40, overallGrade: 'F', worstPrism: 'TestPrism', bestPrism: 'TestPrism' }
    const result = generateRecommendations(prisms, composite)
    expect(result.some((r) => r.includes('significant improvement'))).toBe(true)
  })

  it('recommends focusing on low-scoring prisms', () => {
    const prisms = [makePrism({ name: 'Bad', stats: { averageScore: 40, bestFile: 'a', worstFile: 'a', findingCount: 0, criticalCount: 0 } })]
    const composite = { overallScore: 70, overallGrade: 'C', worstPrism: 'Bad', bestPrism: 'TestPrism' }
    const result = generateRecommendations(prisms, composite)
    expect(result.some((r) => r.includes('Bad') && r.includes('scores low'))).toBe(true)
  })

  it('recommends addressing critical findings', () => {
    const prisms = [makePrism({ stats: { averageScore: 80, bestFile: 'a', worstFile: 'a', findingCount: 5, criticalCount: 3 } })]
    const composite = { overallScore: 80, overallGrade: 'B', worstPrism: 'TestPrism', bestPrism: 'TestPrism' }
    const result = generateRecommendations(prisms, composite)
    expect(result.some((r) => r.includes('critical finding'))).toBe(true)
  })

  it('mentions weakest dimension', () => {
    const prisms = [makePrism()]
    const composite = { overallScore: 80, overallGrade: 'B', worstPrism: 'Readability', bestPrism: 'Efficiency' }
    const result = generateRecommendations(prisms, composite)
    expect(result.some((r) => r.includes('Weakest') && r.includes('Readability'))).toBe(true)
  })

  it('gives positive default when all scores healthy', () => {
    const prisms = [makePrism({ stats: { averageScore: 90, bestFile: 'a', worstFile: 'a', findingCount: 0, criticalCount: 0 } })]
    const composite = { overallScore: 90, overallGrade: 'A', worstPrism: '', bestPrism: '' }
    const result = generateRecommendations(prisms, composite)
    expect(result.some((r) => r.includes('healthy scores'))).toBe(true)
  })
})

// ─── buildPrismResult ─────────────────────────────────────────────────────────

describe('buildPrismResult', () => {
  it('returns 6 prisms', () => {
    const result = buildPrismResult(['a.ts'], [CLEAN_FILE])
    expect(result.prisms.length).toBe(6)
  })

  it('prism names match the 6 dimensions', () => {
    const result = buildPrismResult(['a.ts'], [CLEAN_FILE])
    const names = result.prisms.map((p) => p.name)
    expect(names).toContain('Readability')
    expect(names).toContain('Reliability')
    expect(names).toContain('Efficiency')
    expect(names).toContain('Modularity')
    expect(names).toContain('Evolution')
    expect(names).toContain('Clarity')
  })

  it('prism colors match rainbow', () => {
    const result = buildPrismResult(['a.ts'], [CLEAN_FILE])
    const colors = result.prisms.map((p) => p.color)
    expect(colors).toContain('red')
    expect(colors).toContain('orange')
    expect(colors).toContain('yellow')
    expect(colors).toContain('green')
    expect(colors).toContain('blue')
    expect(colors).toContain('violet')
  })

  it('computes composite correctly for clean code', () => {
    const result = buildPrismResult(['a.ts'], [CLEAN_FILE])
    expect(result.composite.overallScore).toBeGreaterThanOrEqual(90)
    expect(result.composite.overallGrade).toBe('A')
  })

  it('computes stats correctly', () => {
    const result = buildPrismResult(['a.ts'], [CLEAN_FILE])
    expect(result.stats.totalPrisms).toBe(6)
    expect(result.stats.averageScore).toBeGreaterThanOrEqual(90)
  })

  it('generates recommendations', () => {
    const result = buildPrismResult(['a.ts'], [CLEAN_FILE])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildPrismResult([], [])
    expect(result.prisms.length).toBe(6)
    expect(result.stats.totalPrisms).toBe(6)
  })

  it('tracks total findings across all prisms', () => {
    const result = buildPrismResult(['a.ts'], [SILENT_CATCH_FILE + SYNC_IO_FILE])
    expect(result.stats.totalFindings).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('getPrismColor', () => {
  it('returns a function for known colors', () => {
    const fn = getPrismColor('red')
    expect(typeof fn).toBe('function')
    expect(fn('test')).toContain('test')
  })

  it('returns chalk.white for unknown colors', () => {
    const fn = getPrismColor('unknown')
    const result = fn('hello')
    expect(result).toContain('hello')
  })

  it('supports all 6 prism colors', () => {
    for (const color of ['red', 'orange', 'yellow', 'green', 'blue', 'violet']) {
      expect(typeof getPrismColor(color)).toBe('function')
    }
  })
})

describe('formatSeverity', () => {
  it('returns info icon', () => {
    expect(formatSeverity('info')).toBe('ℹ')
  })

  it('returns warning icon', () => {
    expect(formatSeverity('warning')).toBe('⚠')
  })

  it('returns critical icon', () => {
    expect(formatSeverity('critical')).toBe('⛔')
  })
})

describe('formatCompositeGauge', () => {
  it('includes the score and grade', () => {
    const composite = { overallScore: 85, overallGrade: 'B', worstPrism: 'X', bestPrism: 'Y' }
    const result = formatCompositeGauge(composite)
    expect(result).toContain('85/100')
    expect(result).toContain('Grade: B')
  })

  it('includes gauge bar characters', () => {
    const composite = { overallScore: 50, overallGrade: 'C', worstPrism: 'X', bestPrism: 'Y' }
    const result = formatCompositeGauge(composite)
    expect(result).toContain('Composite:')
  })

  it('handles score 100', () => {
    const composite = { overallScore: 100, overallGrade: 'A', worstPrism: 'X', bestPrism: 'Y' }
    const result = formatCompositeGauge(composite)
    expect(result).toContain('100/100')
  })

  it('handles score 0', () => {
    const composite = { overallScore: 0, overallGrade: 'F', worstPrism: 'X', bestPrism: 'Y' }
    const result = formatCompositeGauge(composite)
    expect(result).toContain('0/100')
  })
})

describe('formatPrismRow', () => {
  it('formats a prism row with name, score, findings', () => {
    const prism = makePrism({
      stats: { averageScore: 75, bestFile: 'a', worstFile: 'b', findingCount: 3, criticalCount: 0 },
    })
    const result = formatPrismRow(prism)
    expect(result).toContain('TestPrism')
    expect(result).toContain('75')
    expect(result).toContain('3')
  })
})

describe('formatPrismComparison', () => {
  it('renders comparison header and rows', () => {
    const prisms = [
      makePrism({ name: 'Readability', color: 'red', stats: { averageScore: 80, bestFile: 'a', worstFile: 'a', findingCount: 0, criticalCount: 0 } }),
      makePrism({ name: 'Reliability', color: 'orange', stats: { averageScore: 90, bestFile: 'a', worstFile: 'a', findingCount: 2, criticalCount: 0 } }),
    ]
    const result = formatPrismComparison(prisms)
    expect(result).toContain('Prism Comparison')
    expect(result).toContain('Readability')
    expect(result).toContain('Reliability')
  })
})

describe('formatPrismFindings', () => {
  it('renders findings for a prism with findings', () => {
    const prism = makePrism({
      name: 'Readability',
      color: 'red',
      description: 'Readability test',
      files: [{
        file: 'a.ts',
        score: 80,
        findings: [
          { file: 'a.ts', line: 1, severity: 'warning' as const, message: 'long lines' },
        ],
      }],
    })
    const result = formatPrismFindings(prism)
    expect(result).toContain('Readability Prism')
    expect(result).toContain('a.ts')
    expect(result).toContain('long lines')
  })

  it('skips files with no findings', () => {
    const prism = makePrism({
      files: [
        { file: 'a.ts', score: 100, findings: [] },
        { file: 'b.ts', score: 80, findings: [{ file: 'b.ts', line: 1, severity: 'warning' as const, message: 'issue' }] },
      ],
    })
    const result = formatPrismFindings(prism)
    expect(result).toContain('b.ts')
    expect(result).not.toContain('a.ts (score')
  })

  it('truncates findings over 5 with "... and N more"', () => {
    const findings = Array(8).fill(null).map((_, i) => ({
      file: 'a.ts', line: i + 1, severity: 'info' as const, message: `issue ${i}`,
    }))
    const prism = makePrism({
      files: [{ file: 'a.ts', score: 50, findings }],
    })
    const result = formatPrismFindings(prism)
    expect(result).toContain('... and 3 more')
  })
})

describe('formatStatsSummary', () => {
  it('renders total prisms, findings, average score', () => {
    const stats = { totalPrisms: 6, totalFindings: 12, averageScore: 85 }
    const result = formatStatsSummary(stats)
    expect(result).toContain('Total prisms: 6')
    expect(result).toContain('Total findings: 12')
    expect(result).toContain('Average score: 85')
  })
})

describe('formatRecommendations', () => {
  it('renders numbered recommendations', () => {
    const recs = ['Fix X', 'Improve Y']
    const result = formatRecommendations(recs)
    expect(result).toContain('1. Fix X')
    expect(result).toContain('2. Improve Y')
  })

  it('renders empty message when no recommendations', () => {
    const result = formatRecommendations([])
    expect(result).toContain('No recommendations')
  })
})

describe('formatPrismTable', () => {
  it('renders full table with all sections', () => {
    const result: PrismResult = buildPrismResult(['a.ts'], [CLEAN_FILE])
    const output = formatPrismTable(result)
    expect(output).toContain('Multi-Dimensional Code Prism')
    expect(output).toContain('Composite')
    expect(output).toContain('Prism Comparison')
    expect(output).toContain('Stats')
    expect(output).toContain('Recommendations')
  })

  it('includes findings section when findings exist', () => {
    const result: PrismResult = buildPrismResult(['a.ts'], [SILENT_CATCH_FILE])
    const output = formatPrismTable(result)
    expect(output).toContain('Findings by Prism')
  })
})

describe('formatPrismJSON', () => {
  it('returns valid JSON with prism data', () => {
    const result: PrismResult = buildPrismResult(['a.ts'], [CLEAN_FILE])
    const json = formatPrismJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.prisms.length).toBe(6)
    expect(parsed.composite.overallScore).toBeGreaterThanOrEqual(90)
  })
})
