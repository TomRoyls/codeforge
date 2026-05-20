import { describe, expect, it } from 'vitest'

import {
  buildLighthouseResult,
  computeCategoryScore,
  computeHealthGrade,
  computeOverallScore,
  detectDangerZones,
  findMatchingBrace,
  findSafeHarbors,
  generateRecommendations,
  runCorrectnessAudits,
  runMaintainabilityAudits,
  runPerformanceAudits,
  runSafetyAudits,
  runStyleAudits,
  type Audit,
  type DangerZone,
  type LighthouseCategory,
} from '../src/commands/lighthouse-helpers.js'

import {
  formatAuditDetails,
  formatCategoryScores,
  formatDangerZoneMap,
  formatGrade,
  formatLighthouseJSON,
  formatLighthouseStats,
  formatLighthouseTable,
  formatRecommendations,
  formatSafeHarbors,
  formatScoreGauge,
} from '../src/commands/lighthouse-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const CLEAN_FILE = `import { Command } from '@oclif/core'
import chalk from 'chalk'

/**
 * A well-documented function.
 * @example
 * myFunction(42)
 */
export async function myFunction(x: number): Promise<string> {
  try {
    const result = await fetch('/api')
    if (!result.ok) throw new Error('Failed')
    return result.text()
  } catch (error) {
    console.error(error)
    throw error
  }
}

export interface Config {
  name: string
  value: number
}
`

const DANGEROUS_FILE = `import unused from 'nothing'
import { readFileSync } from 'node:fs'

async function badFunc(param) {
  const data = readFileSync('./data.txt')
  try {
    const result = await fetch('/')
  } catch (e) {}
  const x = data as any
  return x
}

export function longFunc() {
  const a = 1
  const b = 2
  const c = 3
  const d = 4
  const e = 5
  const f = 6
  const g = 7
  const h = 8
  const i = 9
  const j = 10
  const k = 11
  const l = 12
  const m = 13
  const n = 14
  const o = 15
  const p = 16
  const q = 17
  const r = 18
  const s = 19
  const t = 20
  const u = 21
  const v = 22
  const w = 23
  const xx = 24
  const yy = 25
  const zz = 26
  const aaa = 27
  const bbb = 28
  const ccc = 29
  const ddd = 30
  const eee = 31
  const fff = 32
  const ggg = 33
  const hhh = 34
  const iii = 35
  const jjj = 36
  const kkk = 37
  const lll = 38
  const mmm = 39
  const nnn = 40
  const ooo = 41
  const ppp = 42
  const qqq = 43
  const rrr = 44
  const sss = 45
  const ttt = 46
  const uuu = 47
  const vvv = 48
  const www = 49
  const xxx = 50
  const yyy = 51
  return yyy
}
`

const CONSOLE_FILE = `export function debug() {
  console.log('debug message')
  console.warn('warning')
  console.error('error')
  return 42
}
`

const TEST_FILE = `import { describe, expect, it } from 'vitest'

describe('suite', () => {
  it('works', () => {
    expect(1 + 1).toBe(2)
  })
})
`

const EMPTY_FILE = ''

const MINIMAL_FILE = 'const x = 1\n'

// ─── computeHealthGrade ───────────────────────────────────────────────────────

describe('computeHealthGrade', () => {
  it('returns A+ for 95+', () => {
    expect(computeHealthGrade(95)).toBe('A+')
    expect(computeHealthGrade(100)).toBe('A+')
  })

  it('returns A for 90-94', () => {
    expect(computeHealthGrade(90)).toBe('A')
    expect(computeHealthGrade(94)).toBe('A')
  })

  it('returns A- for 85-89', () => {
    expect(computeHealthGrade(85)).toBe('A-')
    expect(computeHealthGrade(89)).toBe('A-')
  })

  it('returns B+ for 80-84', () => {
    expect(computeHealthGrade(80)).toBe('B+')
  })

  it('returns B for 75-79', () => {
    expect(computeHealthGrade(75)).toBe('B')
  })

  it('returns B- for 70-74', () => {
    expect(computeHealthGrade(70)).toBe('B-')
  })

  it('returns C+ for 65-69', () => {
    expect(computeHealthGrade(65)).toBe('C+')
  })

  it('returns C for 60-64', () => {
    expect(computeHealthGrade(60)).toBe('C')
  })

  it('returns C- for 55-59', () => {
    expect(computeHealthGrade(55)).toBe('C-')
  })

  it('returns D for 50-54', () => {
    expect(computeHealthGrade(50)).toBe('D')
  })

  it('returns E for 40-49', () => {
    expect(computeHealthGrade(40)).toBe('E')
    expect(computeHealthGrade(49)).toBe('E')
  })

  it('returns F below 40', () => {
    expect(computeHealthGrade(0)).toBe('F')
    expect(computeHealthGrade(39)).toBe('F')
  })
})

// ─── computeOverallScore ──────────────────────────────────────────────────────

describe('computeOverallScore', () => {
  it('returns 100 for empty categories', () => {
    expect(computeOverallScore([])).toBe(100)
  })

  it('computes weighted average', () => {
    const categories: LighthouseCategory[] = [
      { name: 'A', score: 100, weight: 30, audits: [] },
      { name: 'B', score: 50, weight: 20, audits: [] },
    ]
    // (100*30 + 50*20) / 50 = 4000/50 = 80
    expect(computeOverallScore(categories)).toBe(80)
  })

  it('computes for equal weights', () => {
    const categories: LighthouseCategory[] = [
      { name: 'A', score: 80, weight: 1, audits: [] },
      { name: 'B', score: 60, weight: 1, audits: [] },
    ]
    expect(computeOverallScore(categories)).toBe(70)
  })
})

// ─── computeCategoryScore ─────────────────────────────────────────────────────

describe('computeCategoryScore', () => {
  it('returns 100 for empty audits', () => {
    expect(computeCategoryScore([])).toBe(100)
  })

  it('computes pass ratio', () => {
    const audits: Audit[] = [
      { id: 'a', title: '', description: '', score: 1, severity: 'info', files: [], details: '', suggestion: '' },
      { id: 'b', title: '', description: '', score: 0, severity: 'info', files: [], details: '', suggestion: '' },
    ]
    expect(computeCategoryScore(audits)).toBe(50)
  })

  it('returns 100 when all pass', () => {
    const audits: Audit[] = [
      { id: 'a', title: '', description: '', score: 1, severity: 'info', files: [], details: '', suggestion: '' },
    ]
    expect(computeCategoryScore(audits)).toBe(100)
  })

  it('returns 0 when all fail', () => {
    const audits: Audit[] = [
      { id: 'a', title: '', description: '', score: 0, severity: 'critical', files: [], details: '', suggestion: '' },
    ]
    expect(computeCategoryScore(audits)).toBe(0)
  })
})

// ─── runSafetyAudits ──────────────────────────────────────────────────────────

describe('runSafetyAudits', () => {
  it('returns 4 audits', () => {
    const audits = runSafetyAudits(['a.ts'], [MINIMAL_FILE])
    expect(audits.length).toBe(4)
  })

  it('detects empty catch blocks', () => {
    const content = 'try {} catch (e) {}\n'
    const audits = runSafetyAudits(['a.ts'], [content])
    const emptyCatch = audits.find((a) => a.id === 'safety-empty-catch')!
    expect(emptyCatch.score).toBe(0)
    expect(emptyCatch.files).toContain('a.ts')
  })

  it('passes empty catch when none found', () => {
    const audits = runSafetyAudits(['a.ts'], [MINIMAL_FILE])
    const emptyCatch = audits.find((a) => a.id === 'safety-empty-catch')!
    expect(emptyCatch.score).toBe(1)
  })

  it('detects unhandled promises', () => {
    const content = 'async function run() {\n  const x = await fetch("/")\n}\n'
    const audits = runSafetyAudits(['a.ts'], [content])
    const unhandled = audits.find((a) => a.id === 'safety-unhandled-promises')!
    expect(unhandled.score).toBe(0)
  })

  it('passes when no async/await used', () => {
    const audits = runSafetyAudits(['a.ts'], [MINIMAL_FILE])
    const unhandled = audits.find((a) => a.id === 'safety-unhandled-promises')!
    expect(unhandled.score).toBe(1)
  })

  it('detects type assertions', () => {
    const content = 'const x = data as any\n'
    const audits = runSafetyAudits(['a.ts'], [content])
    const assertions = audits.find((a) => a.id === 'safety-type-assertions')!
    expect(assertions.score).toBe(0)
  })
})

// ─── runMaintainabilityAudits ─────────────────────────────────────────────────

describe('runMaintainabilityAudits', () => {
  it('returns 4 audits', () => {
    const audits = runMaintainabilityAudits(['a.ts'], [MINIMAL_FILE])
    expect(audits.length).toBe(4)
  })

  it('detects large files', () => {
    const largeContent = Array.from({ length: 550 }, (_, i) => `// line ${i}`).join('\n')
    const audits = runMaintainabilityAudits(['a.ts'], [largeContent])
    const large = audits.find((a) => a.id === 'maint-large-files')!
    expect(large.score).toBe(0)
    expect(large.files).toContain('a.ts')
  })

  it('passes for small files', () => {
    const audits = runMaintainabilityAudits(['a.ts'], [MINIMAL_FILE])
    const large = audits.find((a) => a.id === 'maint-large-files')!
    expect(large.score).toBe(1)
  })

  it('detects deep nesting', () => {
    const deepContent = 'function a() {\n    if (x) {\n        if (y) {\n            if (z) {\n                if (w) {\n                    console.log(1)\n                }\n            }\n        }\n    }\n}\n'
    const audits = runMaintainabilityAudits(['a.ts'], [deepContent])
    const deep = audits.find((a) => a.id === 'maint-deep-nesting')!
    expect(deep.score).toBe(0)
  })
})

// ─── runPerformanceAudits ─────────────────────────────────────────────────────

describe('runPerformanceAudits', () => {
  it('returns 4 audits', () => {
    const audits = runPerformanceAudits(['a.ts'], [MINIMAL_FILE])
    expect(audits.length).toBe(4)
  })

  it('detects sync in async', () => {
    const content = 'async function run() {\n  const data = readFileSync("./file")\n}\n'
    const audits = runPerformanceAudits(['a.ts'], [content])
    const sync = audits.find((a) => a.id === 'perf-sync-in-async')!
    expect(sync.score).toBe(0)
  })

  it('detects re-exports', () => {
    const content = "export * from 'lodash'\n"
    const audits = runPerformanceAudits(['a.ts'], [content])
    const reexport = audits.find((a) => a.id === 'perf-reexports')!
    expect(reexport.score).toBe(0)
  })

  it('detects long import chains', () => {
    const imports = Array.from({ length: 25 }, (_, i) => `import mod${i} from "mod${i}"`).join('\n')
    const audits = runPerformanceAudits(['a.ts'], [imports])
    const chains = audits.find((a) => a.id === 'perf-long-chains')!
    expect(chains.score).toBe(0)
  })
})

// ─── runCorrectnessAudits ─────────────────────────────────────────────────────

describe('runCorrectnessAudits', () => {
  it('returns 4 audits', () => {
    const audits = runCorrectnessAudits(['a.ts'], [MINIMAL_FILE])
    expect(audits.length).toBe(4)
  })

  it('detects missing return types on exports', () => {
    const content = 'export function foo(x: number) {\n  return x * 2\n}\n'
    const audits = runCorrectnessAudits(['a.ts'], [content])
    const retType = audits.find((a) => a.id === 'correctness-missing-return-types')!
    expect(retType.score).toBe(0)
  })

  it('passes when return type present', () => {
    const content = 'export function foo(x: number): number {\n  return x * 2\n}\n'
    const audits = runCorrectnessAudits(['a.ts'], [content])
    const retType = audits.find((a) => a.id === 'correctness-missing-return-types')!
    expect(retType.score).toBe(1)
  })
})

// ─── runStyleAudits ───────────────────────────────────────────────────────────

describe('runStyleAudits', () => {
  it('returns 4 audits', () => {
    const audits = runStyleAudits(['a.ts'], [MINIMAL_FILE])
    expect(audits.length).toBe(4)
  })

  it('detects console.log', () => {
    const audits = runStyleAudits(['a.ts'], [CONSOLE_FILE])
    const consoleAudit = audits.find((a) => a.id === 'style-console-log')!
    expect(consoleAudit.score).toBe(0)
    expect(consoleAudit.files).toContain('a.ts')
  })

  it('detects commented-out code', () => {
    const content = '// const x = 42\n// function old() {}\n'
    const audits = runStyleAudits(['a.ts'], [content])
    const commented = audits.find((a) => a.id === 'style-commented-code')!
    expect(commented.score).toBe(0)
  })

  it('detects inconsistent naming', () => {
    const content = 'const myVar = 1\nconst other_var = 2\n'
    const audits = runStyleAudits(['a.ts'], [content])
    const naming = audits.find((a) => a.id === 'style-naming')!
    expect(naming.score).toBe(0)
  })

  it('passes for clean file', () => {
    const audits = runStyleAudits(['a.ts'], [MINIMAL_FILE])
    const consoleAudit = audits.find((a) => a.id === 'style-console-log')!
    expect(consoleAudit.score).toBe(1)
  })
})

// ─── findMatchingBrace ────────────────────────────────────────────────────────

describe('findMatchingBrace', () => {
  it('finds matching brace', () => {
    expect(findMatchingBrace('  }')).toBe(2)
  })

  it('handles nested braces', () => {
    expect(findMatchingBrace('{ inner } }')).toBe(10)
  })

  it('returns length when no match', () => {
    expect(findMatchingBrace('no brace')).toBe(8)
  })

  it('handles empty string', () => {
    expect(findMatchingBrace('')).toBe(0)
  })
})

// ─── detectDangerZones ────────────────────────────────────────────────────────

describe('detectDangerZones', () => {
  it('returns empty for clean file', () => {
    const zones = detectDangerZones(['clean.ts'], [CLEAN_FILE])
    // CLEAN_FILE has no danger patterns
    expect(zones.length).toBeLessThanOrEqual(2)
  })

  it('detects empty catch as storm', () => {
    const content = 'try {} catch (e) {}\n'
    const zones = detectDangerZones(['a.ts'], [content])
    const storm = zones.find((z) => z.type === 'storm')
    expect(storm).toBeDefined()
    expect(storm!.severity).toBe('critical')
  })

  it('detects as any as reef', () => {
    const content = 'const x = data as any\n'
    const zones = detectDangerZones(['a.ts'], [content])
    const reef = zones.find((z) => z.type === 'reef')
    expect(reef).toBeDefined()
  })

  it('detects TODO as shallows', () => {
    const content = '// TODO: fix this later\n'
    const zones = detectDangerZones(['a.ts'], [content])
    const shallows = zones.find((z) => z.type === 'shallows')
    expect(shallows).toBeDefined()
  })

  it('detects async forEach as storm', () => {
    const content = 'items.forEach(async (item) => { await process(item) })\n'
    const zones = detectDangerZones(['a.ts'], [content])
    const storm = zones.find((z) => z.type === 'storm' && z.message.includes('async forEach'))
    expect(storm).toBeDefined()
    expect(storm!.severity).toBe('critical')
  })

  it('detects console as shallows', () => {
    const zones = detectDangerZones(['a.ts'], [CONSOLE_FILE])
    const console = zones.find((z) => z.type === 'shallows' && z.message.includes('Console'))
    expect(console).toBeDefined()
  })

  it('detects high import count as current', () => {
    const imports = Array.from({ length: 20 }, (_, i) => `import mod${i} from "mod${i}"`).join('\n')
    const zones = detectDangerZones(['a.ts'], [imports])
    const current = zones.find((z) => z.type === 'current')
    expect(current).toBeDefined()
  })

  it('returns empty for empty file', () => {
    const zones = detectDangerZones(['a.ts'], [EMPTY_FILE])
    expect(zones).toEqual([])
  })
})

// ─── findSafeHarbors ──────────────────────────────────────────────────────────

describe('findSafeHarbors', () => {
  it('finds error handling harbor', () => {
    const harbors = findSafeHarbors(['a.ts'], [CLEAN_FILE])
    const errorHandling = harbors.find((h) => h.pattern === 'Proper error handling')
    expect(errorHandling).toBeDefined()
    expect(errorHandling!.files).toContain('a.ts')
  })

  it('finds type-safe code harbor', () => {
    const harbors = findSafeHarbors(['a.ts'], [CLEAN_FILE])
    const typeSafe = harbors.find((h) => h.pattern === 'Type-safe code')
    expect(typeSafe).toBeDefined()
  })

  it('finds documented code harbor', () => {
    const harbors = findSafeHarbors(['a.ts'], [CLEAN_FILE])
    const documented = harbors.find((h) => h.pattern === 'Well-documented code')
    expect(documented).toBeDefined()
  })

  it('finds test coverage harbor', () => {
    const harbors = findSafeHarbors(['test.ts'], [TEST_FILE])
    const tested = harbors.find((h) => h.pattern === 'Test coverage')
    expect(tested).toBeDefined()
  })

  it('returns empty for empty file', () => {
    const harbors = findSafeHarbors(['a.ts'], [EMPTY_FILE])
    expect(harbors.length).toBe(0)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('warns about critical issues', () => {
    const categories: LighthouseCategory[] = [
      { name: 'Safety', score: 50, weight: 30, audits: [] },
    ]
    const dangerZones: DangerZone[] = [
      { file: 'a.ts', line: 1, type: 'storm', severity: 'critical', message: 'bad', fix: 'fix it' },
    ]
    const recs = generateRecommendations(categories, dangerZones)
    expect(recs.some((r) => r.includes('critical'))).toBe(true)
  })

  it('warns about storm patterns', () => {
    const categories: LighthouseCategory[] = [{ name: 'Safety', score: 100, weight: 30, audits: [] }]
    const dangerZones: DangerZone[] = [
      { file: 'a.ts', line: 1, type: 'storm', severity: 'warning', message: 'stormy', fix: 'fix' },
    ]
    const recs = generateRecommendations(categories, dangerZones)
    expect(recs.some((r) => r.includes('storm'))).toBe(true)
  })

  it('warns about reef patterns', () => {
    const categories: LighthouseCategory[] = [{ name: 'Safety', score: 100, weight: 30, audits: [] }]
    const dangerZones: DangerZone[] = [
      { file: 'a.ts', line: 1, type: 'reef', severity: 'warning', message: 'hidden', fix: 'fix' },
    ]
    const recs = generateRecommendations(categories, dangerZones)
    expect(recs.some((r) => r.includes('reef'))).toBe(true)
  })

  it('praises perfect score', () => {
    const categories: LighthouseCategory[] = [
      { name: 'Safety', score: 100, weight: 30, audits: [{ id: 'a', title: '', description: '', score: 1, severity: 'info', files: [], details: '', suggestion: '' }] },
    ]
    const recs = generateRecommendations(categories, [])
    expect(recs.some((r) => r.includes('excellent shape'))).toBe(true)
  })

  it('recommends focus on weakest category', () => {
    const categories: LighthouseCategory[] = [
      { name: 'Safety', score: 40, weight: 30, audits: [] },
      { name: 'Style', score: 100, weight: 10, audits: [] },
    ]
    const recs = generateRecommendations(categories, [])
    expect(recs.some((r) => r.includes('Safety') && r.includes('40'))).toBe(true)
  })

  it('praises perfect category', () => {
    const categories: LighthouseCategory[] = [
      { name: 'Style', score: 100, weight: 10, audits: [{ id: 'a', title: '', description: '', score: 1, severity: 'info', files: [], details: '', suggestion: '' }] },
    ]
    const recs = generateRecommendations(categories, [])
    expect(recs.some((r) => r.includes('excellent shape') || r.includes('sailing smoothly'))).toBe(true)
  })
})

// ─── buildLighthouseResult ────────────────────────────────────────────────────

describe('buildLighthouseResult', () => {
  it('builds complete result', () => {
    const result = buildLighthouseResult(['a.ts'], [MINIMAL_FILE])
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(100)
    expect(result.categories.length).toBe(5)
    expect(result.stats.totalAudits).toBe(20)
    expect(result.stats.healthGrade).toBeTruthy()
  })

  it('computes category scores', () => {
    const result = buildLighthouseResult(['a.ts'], [MINIMAL_FILE])
    for (const cat of result.categories) {
      expect(cat.score).toBeGreaterThanOrEqual(0)
      expect(cat.score).toBeLessThanOrEqual(100)
    }
  })

  it('computes stats correctly', () => {
    const result = buildLighthouseResult(['a.ts'], [MINIMAL_FILE])
    expect(result.stats.totalAudits).toBe(20)
    expect(result.stats.passedAudits + result.stats.failedAudits).toBe(20)
  })

  it('handles empty input', () => {
    const result = buildLighthouseResult([], [])
    expect(result.overallScore).toBe(100)
    expect(result.categories.length).toBe(5)
    expect(result.dangerZones).toEqual([])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles dangerous file', () => {
    const result = buildLighthouseResult(['danger.ts'], [DANGEROUS_FILE])
    expect(result.overallScore).toBeLessThan(100)
    expect(result.dangerZones.length).toBeGreaterThan(0)
    expect(result.stats.failedAudits).toBeGreaterThan(0)
  })

  it('detects safe harbors for clean code', () => {
    const result = buildLighthouseResult(['clean.ts'], [CLEAN_FILE])
    expect(result.safeHarbors.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatScoreGauge', () => {
  it('formats score gauge', () => {
    const output = formatScoreGauge(85)
    expect(output).toContain('85/100')
    expect(output).toContain('█')
    expect(output).toContain('░')
  })

  it('formats zero score', () => {
    const output = formatScoreGauge(0)
    expect(output).toContain('0/100')
  })

  it('formats perfect score', () => {
    const output = formatScoreGauge(100)
    expect(output).toContain('100/100')
  })
})

describe('formatCategoryScores', () => {
  it('formats categories', () => {
    const categories: LighthouseCategory[] = [
      { name: 'Safety', score: 80, weight: 30, audits: [] },
    ]
    const output = formatCategoryScores(categories)
    expect(output).toContain('Safety')
    expect(output).toContain('80/100')
  })
})

describe('formatAuditDetails', () => {
  it('formats passing audit', () => {
    const audits: Audit[] = [
      { id: 'a', title: 'Test Audit', description: '', score: 1, severity: 'info', files: [], details: '', suggestion: 'fix it' },
    ]
    const output = formatAuditDetails(audits)
    expect(output).toContain('Test Audit')
    expect(output).toContain('PASS')
  })

  it('formats failing audit with files', () => {
    const audits: Audit[] = [
      { id: 'a', title: 'Bad Audit', description: '', score: 0, severity: 'critical', files: ['a.ts', 'b.ts'], details: '', suggestion: 'fix it now' },
    ]
    const output = formatAuditDetails(audits)
    expect(output).toContain('FAIL')
    expect(output).toContain('a.ts')
    expect(output).toContain('fix it now')
  })
})

describe('formatDangerZoneMap', () => {
  it('formats danger zones', () => {
    const zones: DangerZone[] = [
      { file: 'a.ts', line: 5, type: 'storm', severity: 'critical', message: 'bad', fix: 'fix' },
    ]
    const output = formatDangerZoneMap(zones)
    expect(output).toContain('Storm')
    expect(output).toContain('a.ts:5')
  })

  it('shows clear sailing when no zones', () => {
    const output = formatDangerZoneMap([])
    expect(output).toContain('clear sailing')
  })

  it('truncates long zone lists', () => {
    const zones: DangerZone[] = Array.from({ length: 8 }, (_, i) => ({
      file: `${i}.ts`, line: i + 1, type: 'reef' as const, severity: 'info' as const, message: `issue ${i}`, fix: 'fix',
    }))
    const output = formatDangerZoneMap(zones)
    expect(output).toContain('... and')
  })
})

describe('formatSafeHarbors', () => {
  it('formats safe harbors', () => {
    const harbors = [{ pattern: 'Error handling', description: 'desc', files: ['a.ts'] }]
    const output = formatSafeHarbors(harbors)
    expect(output).toContain('Error handling')
    expect(output).toContain('1 file(s)')
  })

  it('shows message when no harbors', () => {
    const output = formatSafeHarbors([])
    expect(output).toContain('No safe harbor')
  })
})

describe('formatLighthouseStats', () => {
  it('formats stats', () => {
    const stats = {
      overallScore: 85,
      categoryScores: { Safety: 90 },
      totalAudits: 20,
      passedAudits: 15,
      failedAudits: 5,
      criticalIssues: 1,
      warnings: 3,
      dangerZoneCount: 4,
      safeHarborCount: 2,
      healthGrade: 'A-',
    }
    const output = formatLighthouseStats(stats)
    expect(output).toContain('A-')
    expect(output).toContain('15/20')
    expect(output).toContain('1')
    expect(output).toContain('4')
  })
})

describe('formatGrade', () => {
  it('colors A grades green', () => {
    const output = formatGrade('A+')
    expect(output).toContain('A+')
  })

  it('colors F grades red', () => {
    const output = formatGrade('F')
    expect(output).toContain('F')
  })
})

describe('formatRecommendations', () => {
  it('formats recommendations', () => {
    const recs = ['Fix this', 'Do that']
    const output = formatRecommendations(recs)
    expect(output).toContain('1.')
    expect(output).toContain('2.')
  })

  it('handles empty', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })
})

describe('formatLighthouseTable', () => {
  it('formats full table', () => {
    const result = buildLighthouseResult(['a.ts'], [MINIMAL_FILE])
    const output = formatLighthouseTable(result)
    expect(output).toContain('Lighthouse')
    expect(output).toContain('Category Scores')
    expect(output).toContain('Danger Zone')
    expect(output).toContain('Safe Harbor')
  })
})

describe('formatLighthouseJSON', () => {
  it('formats valid JSON', () => {
    const result = buildLighthouseResult(['a.ts'], [MINIMAL_FILE])
    const json = formatLighthouseJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.overallScore).toBeDefined()
    expect(parsed.categories.length).toBe(5)
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('analyzes a realistic codebase', () => {
    const files = ['clean.ts', 'danger.ts', 'test.ts', 'console.ts']
    const contents = [CLEAN_FILE, DANGEROUS_FILE, TEST_FILE, CONSOLE_FILE]
    const result = buildLighthouseResult(files, contents)

    expect(result.categories.length).toBe(5)
    expect(result.dangerZones.length).toBeGreaterThan(0)
    expect(result.safeHarbors.length).toBeGreaterThan(0)
    expect(result.overallScore).toBeLessThan(100)
    expect(result.stats.healthGrade).toBeTruthy()
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('gives perfect score for empty codebase', () => {
    const result = buildLighthouseResult([], [])
    expect(result.overallScore).toBe(100)
    expect(result.stats.healthGrade).toBe('A+')
    expect(result.stats.criticalIssues).toBe(0)
    expect(result.stats.warnings).toBe(0)
  })

  it('weights Safety highest', () => {
    const result = buildLighthouseResult(['a.ts'], [MINIMAL_FILE])
    const safety = result.categories.find((c) => c.name === 'Safety')!
    expect(safety.weight).toBe(30)
  })
})
