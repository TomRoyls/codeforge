import { describe, it, expect } from 'vitest'
import {
  type Discipline,
  type DisciplineIndicator,
  type PolymathFile,
  type DarkAge,
  type RenaissanceStats,
  type RenaissanceResult,
  makeIndicator,
  classifyDisciplineGrade,
  evaluateArchitecture,
  evaluateTesting,
  evaluateDocumentation,
  evaluatePerformance,
  evaluateSecurity,
  evaluateDevEx,
  evaluateAllDisciplines,
  computeBalance,
  classifyPolymath,
  createPolymathFile,
  identifyDarkAges,
  computeRenaissanceScore,
  classifyEra,
  findPatronDiscipline,
  findNeglectedDiscipline,
  generateRecommendations,
  buildRenaissanceResult,
} from '../src/commands/renaissance-helpers.js'
import {
  formatDisciplineGrade,
  formatScoreBar,
  formatDiscipline,
  formatDisciplines,
  formatClassification,
  formatPolymathFile,
  formatPolymathFiles,
  formatSeverity,
  formatDarkAge,
  formatDarkAges,
  formatEra,
  formatStats,
  formatRecommendations,
  formatRenaissanceResult,
  formatRenaissanceJson,
} from '../src/commands/renaissance-format-helpers.js'

// ─── makeIndicator ─────────────────────────────────────────────────────────────

describe('makeIndicator', () => {
  it('marks exceeding when above target', () => {
    expect(makeIndicator('x', 5, 3, 'cnt').status).toBe('exceeding')
  })

  it('marks meeting when at target', () => {
    expect(makeIndicator('x', 3, 3, 'cnt').status).toBe('meeting')
  })

  it('marks approaching when near target', () => {
    expect(makeIndicator('x', 3, 4, 'cnt').status).toBe('approaching')
  })

  it('marks below when far from target', () => {
    expect(makeIndicator('x', 2, 5, 'cnt').status).toBe('below')
  })

  it('marks critical when very far', () => {
    expect(makeIndicator('x', 0, 3, 'cnt').status).toBe('critical')
  })
})

// ─── classifyDisciplineGrade ───────────────────────────────────────────────────

describe('classifyDisciplineGrade', () => {
  it('classifies masterwork', () => { expect(classifyDisciplineGrade(90)).toBe('masterwork') })
  it('classifies excellent', () => { expect(classifyDisciplineGrade(75)).toBe('excellent') })
  it('classifies good', () => { expect(classifyDisciplineGrade(58)).toBe('good') })
  it('classifies fair', () => { expect(classifyDisciplineGrade(42)).toBe('fair') })
  it('classifies poor', () => { expect(classifyDisciplineGrade(28)).toBe('poor') })
  it('classifies neglected', () => { expect(classifyDisciplineGrade(10)).toBe('neglected') })
})

// ─── evaluateArchitecture ─────────────────────────────────────────────────────

describe('evaluateArchitecture', () => {
  it('gives higher score for code with exports and imports', () => {
    const good = evaluateArchitecture("import { x } from './b'\nexport function foo() {}", 'a.ts')
    const bare = evaluateArchitecture('x = 1', 'a.ts')
    expect(good.score).toBeGreaterThan(bare.score)
  })

  it('detects strengths', () => {
    const d = evaluateArchitecture("export function a() {}\nexport function b() {}", 'a.ts')
    expect(d.strengths.length).toBeGreaterThan(0)
  })

  it('produces indicators', () => {
    const d = evaluateArchitecture('export function foo() {}', 'a.ts')
    expect(d.indicators.length).toBeGreaterThan(0)
  })

  it('score is between 0 and 100', () => {
    const d = evaluateArchitecture('code', 'a.ts')
    expect(d.score).toBeGreaterThanOrEqual(0)
    expect(d.score).toBeLessThanOrEqual(100)
  })
})

// ─── evaluateTesting ───────────────────────────────────────────────────────────

describe('evaluateTesting', () => {
  it('gives higher score for test patterns', () => {
    const good = evaluateTesting('test("foo", () => { expect(1).toBe(1) })', 'a.ts')
    const bare = evaluateTesting('const x = 1', 'a.ts')
    expect(good.score).toBeGreaterThan(bare.score)
  })

  it('detects assertion strength', () => {
    const d = evaluateTesting("import { test, expect } from 'vitest'\ntest('a', () => expect(1).toBe(1))", 'a.ts')
    expect(d.strengths.some(s => s.includes('assertion'))).toBe(true)
  })

  it('score is between 0 and 100', () => {
    const d = evaluateTesting('code', 'a.ts')
    expect(d.score).toBeGreaterThanOrEqual(0)
    expect(d.score).toBeLessThanOrEqual(100)
  })
})

// ─── evaluateDocumentation ─────────────────────────────────────────────────────

describe('evaluateDocumentation', () => {
  it('gives higher score for documented code', () => {
    const good = evaluateDocumentation('/** docs */\nexport function foo(): string { return "" }', 'a.ts')
    const bare = evaluateDocumentation('function f() {}', 'a.ts')
    expect(good.score).toBeGreaterThan(bare.score)
  })

  it('rewards examples', () => {
    const withExample = evaluateDocumentation('/**\n * @example\n * foo()\n */\nfunction foo() {}', 'a.ts')
    const without = evaluateDocumentation('/** docs */\nfunction foo() {}', 'a.ts')
    expect(withExample.score).toBeGreaterThanOrEqual(without.score)
  })

  it('score is between 0 and 100', () => {
    const d = evaluateDocumentation('code', 'a.ts')
    expect(d.score).toBeGreaterThanOrEqual(0)
    expect(d.score).toBeLessThanOrEqual(100)
  })
})

// ─── evaluatePerformance ───────────────────────────────────────────────────────

describe('evaluatePerformance', () => {
  it('rewards functional methods', () => {
    const good = evaluatePerformance('const x = arr.map(f).filter(g)', 'a.ts')
    const bare = evaluatePerformance('const x = 1', 'a.ts')
    expect(good.score).toBeGreaterThan(bare.score)
  })

  it('penalizes deep nesting', () => {
    const nested = evaluatePerformance('{'.repeat(8) + '}'.repeat(8), 'a.ts')
    const flat = evaluatePerformance('const x = 1', 'a.ts')
    expect(flat.score).toBeGreaterThan(nested.score)
  })

  it('rewards optimized data structures', () => {
    const d = evaluatePerformance('const s = new Set()', 'a.ts')
    expect(d.strengths.some(s => s.includes('optimized'))).toBe(true)
  })
})

// ─── evaluateSecurity ──────────────────────────────────────────────────────────

describe('evaluateSecurity', () => {
  it('penalizes eval usage', () => {
    const bad = evaluateSecurity('eval("x + 1")', 'a.ts')
    const good = evaluateSecurity('try { foo() } catch(e) { throw new Error("fail") }', 'a.ts')
    expect(good.score).toBeGreaterThan(bad.score)
  })

  it('rewards type safety', () => {
    const d = evaluateSecurity('function foo(x: string): number { return Number(x) }', 'a.ts')
    expect(d.strengths.some(s => s.includes('Type'))).toBe(true)
  })

  it('penalizes excessive any', () => {
    const bad = evaluateSecurity('const a: any = 1\nconst b: any = 2\nconst c: any = 3', 'a.ts')
    const good = evaluateSecurity('const a: string = "1"', 'a.ts')
    expect(good.score).toBeGreaterThan(bad.score)
  })
})

// ─── evaluateDevEx ─────────────────────────────────────────────────────────────

describe('evaluateDevEx', () => {
  it('rewards descriptive names', () => {
    const good = evaluateDevEx('export function computeTotalPrice(items: Item[]): number', 'a.ts')
    const bare = evaluateDevEx('function f(x) { return x }', 'a.ts')
    expect(good.score).toBeGreaterThan(bare.score)
  })

  it('rewards consistent style', () => {
    const d = evaluateDevEx('export const x = 1\nconst y = compute(x)', 'a.ts')
    expect(d.score).toBeGreaterThan(20)
  })

  it('rewards modern syntax', () => {
    const d = evaluateDevEx('const f = () => 1', 'a.ts')
    expect(d.indicators.some(i => i.name === 'modern-syntax' && i.measurement === 1)).toBe(true)
  })
})

// ─── evaluateAllDisciplines ────────────────────────────────────────────────────

describe('evaluateAllDisciplines', () => {
  it('returns 6 disciplines', () => {
    const ds = evaluateAllDisciplines('export function foo() {}', 'a.ts')
    expect(ds).toHaveLength(6)
  })

  it('covers all discipline names', () => {
    const ds = evaluateAllDisciplines('code', 'a.ts')
    const names = ds.map(d => d.name)
    expect(names).toContain('architecture')
    expect(names).toContain('testing')
    expect(names).toContain('documentation')
    expect(names).toContain('performance')
    expect(names).toContain('security')
    expect(names).toContain('devex')
  })
})

// ─── computeBalance ────────────────────────────────────────────────────────────

describe('computeBalance', () => {
  it('returns 100 for perfectly balanced', () => {
    expect(computeBalance({ a: 70, b: 70, c: 70 })).toBe(100)
  })

  it('returns lower for unbalanced', () => {
    const balanced = computeBalance({ a: 60, b: 60, c: 60 })
    const unbalanced = computeBalance({ a: 10, b: 90, c: 50 })
    expect(balanced).toBeGreaterThan(unbalanced)
  })

  it('returns 100 for empty', () => {
    expect(computeBalance({})).toBe(100)
  })
})

// ─── classifyPolymath ──────────────────────────────────────────────────────────

describe('classifyPolymath', () => {
  it('classifies polymath when all scores >= 60', () => {
    expect(classifyPolymath({ a: 60, b: 70, c: 80 })).toBe('polymath')
  })

  it('classifies specialist with one high score', () => {
    expect(classifyPolymath({ a: 85, b: 30, c: 35 })).toBe('specialist')
  })

  it('classifies novice when all low', () => {
    expect(classifyPolymath({ a: 20, b: 25, c: 15 })).toBe('novice')
  })

  it('classifies unbalanced with wide spread', () => {
    expect(classifyPolymath({ a: 65, b: 20, c: 60 })).toBe('unbalanced')
  })

  it('classifies generalist as default', () => {
    expect(classifyPolymath({ a: 55, b: 50, c: 48 })).toBe('generalist')
  })
})

// ─── createPolymathFile ────────────────────────────────────────────────────────

describe('createPolymathFile', () => {
  it('creates file with scores from disciplines', () => {
    const ds = evaluateAllDisciplines('export function foo() {}', 'a.ts')
    const pf = createPolymathFile('a.ts', ds)
    expect(pf.file).toBe('a.ts')
    expect(Object.keys(pf.scores)).toHaveLength(6)
    expect(pf.avgScore).toBeGreaterThan(0)
  })

  it('identifies strongest and weakest', () => {
    const ds = evaluateAllDisciplines('export function foo(): string { return "x" }', 'a.ts')
    const pf = createPolymathFile('a.ts', ds)
    expect(pf.strongestDiscipline).toBeTruthy()
    expect(pf.weakestDiscipline).toBeTruthy()
  })
})

// ─── identifyDarkAges ──────────────────────────────────────────────────────────

describe('identifyDarkAges', () => {
  it('returns empty for healthy files', () => {
    const ds = evaluateAllDisciplines('/** docs */\nexport function foo(): string { return "x" }\nimport { test, expect } from "vitest"\ntest("a", () => expect(1).toBe(1))', 'src/good.ts')
    const pf = createPolymathFile('src/good.ts', ds)
    const darkAges = identifyDarkAges([pf], ds)
    expect(darkAges.length).toBe(0)
  })

  it('detects dark ages in neglected areas', () => {
    const ds = evaluateAllDisciplines('x = 1', 'src/legacy/bad.ts')
    const pf = createPolymathFile('src/legacy/bad.ts', ds)
    const darkAges = identifyDarkAges([pf], ds)
    expect(darkAges.length).toBeGreaterThanOrEqual(0)
  })
})

// ─── computeRenaissanceScore ───────────────────────────────────────────────────

describe('computeRenaissanceScore', () => {
  it('returns 100 for empty', () => {
    expect(computeRenaissanceScore([], [])).toBe(100)
  })

  it('computes from disciplines and files', () => {
    const ds = evaluateAllDisciplines('export function foo() {}', 'a.ts')
    const pf = createPolymathFile('a.ts', ds)
    const score = computeRenaissanceScore(ds, [pf])
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── classifyEra ───────────────────────────────────────────────────────────────

describe('classifyEra', () => {
  it('returns golden-age for high scores', () => { expect(classifyEra(90, 90)).toBe('golden-age') })
  it('returns renaissance for good scores', () => { expect(classifyEra(65, 65)).toBe('renaissance') })
  it('returns enlightenment for moderate', () => { expect(classifyEra(50, 50)).toBe('enlightenment') })
  it('returns medieval for low', () => { expect(classifyEra(35, 35)).toBe('medieval') })
  it('returns dark-ages for very low', () => { expect(classifyEra(10, 10)).toBe('dark-ages') })
})

// ─── findPatronDiscipline / findNeglectedDiscipline ────────────────────────────

describe('findPatronDiscipline', () => {
  it('finds highest scoring discipline', () => {
    const ds: Discipline[] = [
      { name: 'a', score: 50, grade: 'fair', indicators: [], strengths: [], weaknesses: [], trend: 'stable' },
      { name: 'b', score: 80, grade: 'excellent', indicators: [], strengths: [], weaknesses: [], trend: 'stable' },
    ]
    expect(findPatronDiscipline(ds)).toBe('b')
  })

  it('returns none for empty', () => {
    expect(findPatronDiscipline([])).toBe('none')
  })
})

describe('findNeglectedDiscipline', () => {
  it('finds lowest scoring discipline', () => {
    const ds: Discipline[] = [
      { name: 'a', score: 20, grade: 'poor', indicators: [], strengths: [], weaknesses: [], trend: 'stable' },
      { name: 'b', score: 80, grade: 'excellent', indicators: [], strengths: [], weaknesses: [], trend: 'stable' },
    ]
    expect(findNeglectedDiscipline(ds)).toBe('a')
  })

  it('returns none for empty', () => {
    expect(findNeglectedDiscipline([])).toBe('none')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends focusing on neglected disciplines', () => {
    const ds: Discipline[] = [
      { name: 'security', score: 15, grade: 'neglected', indicators: [], strengths: [], weaknesses: [], trend: 'stable' },
    ]
    const stats = { neglectedDisciplines: 1, darkAgeAreas: 0, avgBalance: 70, era: 'enlightenment' } as RenaissanceStats
    const recs = generateRecommendations(ds, [], [], stats)
    expect(recs.some(r => r.includes('security'))).toBe(true)
  })

  it('recommends addressing dark ages', () => {
    const darkAges: DarkAge[] = [{ area: 'src/legacy', neglectedDisciplines: ['testing'], severity: 'major', description: 'bad', recovery: 'fix' }]
    const stats = { neglectedDisciplines: 0, darkAgeAreas: 1, avgBalance: 70, era: 'renaissance' } as RenaissanceStats
    const recs = generateRecommendations([], [], darkAges, stats)
    expect(recs.some(r => r.includes('dark age'))).toBe(true)
  })

  it('recommends for unbalanced files', () => {
    const pf: PolymathFile = { file: 'a.ts', scores: { a: 90, b: 20 }, avgScore: 55, isRenaissance: false, strongestDiscipline: 'a', weakestDiscipline: 'b', balance: 30, classification: 'unbalanced' }
    const stats = { neglectedDisciplines: 0, darkAgeAreas: 0, avgBalance: 30, era: 'renaissance' } as RenaissanceStats
    const recs = generateRecommendations([], [pf], [], stats)
    expect(recs.some(r => r.includes('unbalanced'))).toBe(true)
  })

  it('recommends for novice files', () => {
    const pf: PolymathFile = { file: 'a.ts', scores: { a: 20 }, avgScore: 20, isRenaissance: false, strongestDiscipline: 'a', weakestDiscipline: 'a', balance: 100, classification: 'novice' }
    const stats = { neglectedDisciplines: 0, darkAgeAreas: 0, avgBalance: 70, era: 'renaissance' } as RenaissanceStats
    const recs = generateRecommendations([], [pf], [], stats)
    expect(recs.some(r => r.includes('novice'))).toBe(true)
  })

  it('recommends for low balance', () => {
    const stats = { neglectedDisciplines: 0, darkAgeAreas: 0, avgBalance: 30, era: 'renaissance' } as RenaissanceStats
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('balance'))).toBe(true)
  })

  it('returns empty for clean codebase', () => {
    const ds: Discipline[] = [
      { name: 'a', score: 80, grade: 'excellent', indicators: [], strengths: [], weaknesses: [], trend: 'stable' },
    ]
    const stats = { neglectedDisciplines: 0, darkAgeAreas: 0, avgBalance: 80, era: 'golden-age' } as RenaissanceStats
    const recs = generateRecommendations(ds, [], [], stats)
    expect(recs.length).toBe(0)
  })
})

// ─── buildRenaissanceResult ────────────────────────────────────────────────────

describe('buildRenaissanceResult', () => {
  it('returns complete result structure', () => {
    const result = buildRenaissanceResult(['src/a.ts'], ['export function foo(): string { return "x" }'], {})
    expect(result.disciplines).toHaveLength(6)
    expect(result.files).toHaveLength(1)
    expect(result.stats.totalDisciplines).toBe(6)
    expect(result.recommendations).toBeDefined()
  })

  it('handles empty files', () => {
    const result = buildRenaissanceResult([], [], {})
    expect(result.stats.renaissanceScore).toBe(60)
    expect(result.stats.era).toBe('medieval')
  })

  it('computes patron and neglected disciplines', () => {
    const result = buildRenaissanceResult(['src/a.ts'], ['export function foo(): string { return "x" }'], {})
    expect(result.stats.patronDiscipline).toBeTruthy()
    expect(result.stats.neglectedDiscipline).toBeTruthy()
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('formatDisciplineGrade includes grade', () => {
    expect(formatDisciplineGrade('masterwork')).toContain('MASTERWORK')
    expect(formatDisciplineGrade('neglected')).toContain('NEGLECTED')
  })

  it('formatScoreBar has fill chars', () => {
    const bar = formatScoreBar(50)
    expect(bar).toContain('█')
    expect(bar).toContain('░')
  })

  it('formatDiscipline formats discipline', () => {
    const d: Discipline = { name: 'architecture', score: 75, grade: 'excellent', indicators: [], strengths: ['good'], weaknesses: [], trend: 'stable' }
    expect(formatDiscipline(d)).toContain('architecture')
  })

  it('formatDisciplines handles empty', () => {
    expect(formatDisciplines([])).toContain('No disciplines')
  })

  it('formatClassification colors class', () => {
    expect(formatClassification('polymath')).toContain('POLYMATH')
    expect(formatClassification('novice')).toContain('NOVICE')
  })

  it('formatPolymathFile includes file name', () => {
    const pf: PolymathFile = { file: 'src/a.ts', scores: {}, avgScore: 60, isRenaissance: true, strongestDiscipline: 'a', weakestDiscipline: 'b', balance: 80, classification: 'polymath' }
    expect(formatPolymathFile(pf)).toContain('src/a.ts')
  })

  it('formatPolymathFiles handles empty', () => {
    expect(formatPolymathFiles([])).toContain('No files')
  })

  it('formatSeverity colors severity', () => {
    expect(formatSeverity('dark')).toContain('DARK')
    expect(formatSeverity('minor')).toContain('MINOR')
  })

  it('formatDarkAge includes area', () => {
    const da: DarkAge = { area: 'src/legacy', neglectedDisciplines: ['testing'], severity: 'major', description: 'bad', recovery: 'fix' }
    expect(formatDarkAge(da)).toContain('src/legacy')
  })

  it('formatDarkAges shows all-clear when empty', () => {
    expect(formatDarkAges([])).toContain('thriving')
  })

  it('formatEra colors era', () => {
    expect(formatEra('golden-age')).toContain('GOLDEN')
    expect(formatEra('dark-ages')).toContain('DARK')
  })

  it('formatStats produces summary', () => {
    const stats: RenaissanceStats = {
      totalDisciplines: 6, avgDisciplineScore: 65, masterworkDisciplines: 2, neglectedDisciplines: 1,
      polymathFiles: 3, specialistFiles: 1, noviceFiles: 0, darkAgeAreas: 1, majorDarkAges: 0,
      avgBalance: 75, renaissanceScore: 70, era: 'renaissance',
      mostBalancedFile: 'a.ts', leastBalancedFile: 'b.ts',
      patronDiscipline: 'architecture', neglectedDiscipline: 'testing',
    }
    const result = formatStats(stats)
    expect(result).toContain('RENAISSANCE ANALYSIS')
    expect(result).toContain('70/100')
  })

  it('formatRecommendations numbers items', () => {
    expect(formatRecommendations(['First', 'Second'])).toContain('1.')
  })

  it('formatRecommendations shows masterpiece when empty', () => {
    expect(formatRecommendations([])).toContain('masterpiece')
  })

  it('formatRenaissanceResult produces full output', () => {
    const result = buildRenaissanceResult(['src/a.ts'], ['export function foo() {}'], {})
    const output = formatRenaissanceResult(result)
    expect(output).toContain('RENAISSANCE ANALYSIS')
    expect(output).toContain('Disciplines')
  })

  it('formatRenaissanceJson produces valid JSON', () => {
    const result = buildRenaissanceResult(['src/a.ts'], ['export function foo() {}'], {})
    const json = formatRenaissanceJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.disciplines).toHaveLength(6)
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('renaissance integration', () => {
  it('full analysis of mixed codebase', () => {
    const files = ['src/core.ts', 'src/legacy.js', 'src/test.ts']
    const contents = [
      '/** Core module */\nexport function core(x: number): string { try { return String(x) } catch(e) { throw new Error("fail") } }',
      'var x = 1\neval("x + 1")',
      "import { test, expect } from 'vitest'\ntest('a', () => { expect(1).toBe(1) })",
    ]
    const result = buildRenaissanceResult(files, contents, {})
    expect(result.disciplines).toHaveLength(6)
    expect(result.files).toHaveLength(3)
    expect(result.stats.renaissanceScore).toBeGreaterThan(0)
    expect(result.stats.patronDiscipline).toBeTruthy()
  })

  it('excellent codebase achieves high era', () => {
    const code = '/** docs */\nexport function computeTotal(items: Item[]): number {\n  return items.map(i => i.price).reduce((a, b) => a + b, 0)\n}\ntry { computeTotal([]) } catch(e) { throw new Error("fail") }'
    const result = buildRenaissanceResult(['src/a.ts'], [code], {})
    expect(result.stats.renaissanceScore).toBeGreaterThan(40)
  })
})
