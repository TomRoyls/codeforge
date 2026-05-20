import { describe, expect, it } from 'vitest'

import {
  buildForemanResult,
  computeAreaScore,
  computeGrade,
  estimateFixTime,
  findLine,
  generateForemanRecommendations,
  inspectElectrical,
  inspectFinishing,
  inspectFoundation,
  inspectFraming,
  inspectPlumbing,
  inspectRoofing,
  type ForemanStats,
  type InspectionArea,
  type Violation,
} from '../src/commands/foreman-helpers.js'

import {
  formatFixQueue,
  formatForemanJSON,
  formatForemanRecommendations,
  formatForemanStats,
  formatForemanTable,
  formatPassRateMeter,
  formatReportCard,
  formatViolationTable,
  getGradeColor,
  getSeverityColor,
} from '../src/commands/foreman-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const CLEAN_CONTENT = `import { Command } from '@oclif/core'
import chalk from 'chalk'

export async function run(config: Config): Promise<string> {
  try {
    const result = await fetch('/api')
    return await result.text()
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error')
    }
    throw error
  }
}

export function validate(input: string): boolean {
  return input.length > 0
}
`

const MESSY_CONTENT = `const x = process.env.SECRET
const y = process.env.KEY
const z = process.env.TOKEN

async function fetchData() {
  const res = readFileSync('./data.json')
  console.log(res)
  console.debug('debug')
  console.info('info')
  console.log('more')
  console.log('logs')
  console.log('here')
}

function processItem(item: any) {
  // const old = 'code'
  // function old2() {}
  // class OldClass {}
  // if (false) {}
  // return null
  catch (e) {}
  throw "error string"
  return 42 + 100 + 200 + 300 + 400 + 500 + 600 + 700 + 800 + 900 + 1000
}
`

const BIG_CONTENT = Array.from({ length: 600 }, (_, i) => `const line${i} = ${i}`).join('\n')

const GOOD_ENTRY = `import { app } from './app'
try {
  app.start()
} catch (error) {
  console.error(error)
  process.exit(1)
}
`

const TEST_FILE = `import { describe, expect, it } from 'vitest'
describe('foo', () => {
  it('works', () => { expect(1).toBe(1) })
  it.skip('skipped', () => {})
})
`

// ─── computeGrade ─────────────────────────────────────────────────────────────

describe('computeGrade', () => {
  it('returns A+ for 95+', () => { expect(computeGrade(95)).toBe('A+') })
  it('returns A for 90-94', () => { expect(computeGrade(92)).toBe('A') })
  it('returns A- for 85-89', () => { expect(computeGrade(87)).toBe('A-') })
  it('returns B+ for 80-84', () => { expect(computeGrade(82)).toBe('B+') })
  it('returns B for 75-79', () => { expect(computeGrade(77)).toBe('B') })
  it('returns B- for 70-74', () => { expect(computeGrade(72)).toBe('B-') })
  it('returns C for 60-64', () => { expect(computeGrade(62)).toBe('C') })
  it('returns D for 50-54', () => { expect(computeGrade(52)).toBe('D') })
  it('returns F for below 50', () => { expect(computeGrade(30)).toBe('F') })
  it('returns A+ for 100', () => { expect(computeGrade(100)).toBe('A+') })
})

// ─── computeAreaScore ─────────────────────────────────────────────────────────

describe('computeAreaScore', () => {
  it('returns 100 for no violations', () => {
    expect(computeAreaScore([], 5)).toBe(100)
  })

  it('deducts for critical violations', () => {
    const v: Violation[] = [{ file: 'a.ts', line: 1, area: 'Foundation', severity: 'critical', code: 'FD-001', message: '', fix: '' }]
    expect(computeAreaScore(v, 1)).toBe(85)
  })

  it('deducts for major violations', () => {
    const v: Violation[] = [{ file: 'a.ts', line: 1, area: 'Framing', severity: 'major', code: 'FR-002', message: '', fix: '' }]
    expect(computeAreaScore(v, 1)).toBe(92)
  })

  it('deducts for minor violations', () => {
    const v: Violation[] = [{ file: 'a.ts', line: 1, area: 'Plumbing', severity: 'minor', code: 'PL-001', message: '', fix: '' }]
    expect(computeAreaScore(v, 1)).toBe(97)
  })

  it('deducts for cosmetic violations', () => {
    const v: Violation[] = [{ file: 'a.ts', line: 1, area: 'Finishing', severity: 'cosmetic', code: 'FN-002', message: '', fix: '' }]
    expect(computeAreaScore(v, 1)).toBe(99)
  })

  it('never goes below 0', () => {
    const vs = Array.from({ length: 20 }, (): Violation => ({ file: 'a.ts', line: 1, area: 'X', severity: 'critical', code: 'X-001', message: '', fix: '' }))
    expect(computeAreaScore(vs, 1)).toBe(0)
  })
})

// ─── inspectFoundation ────────────────────────────────────────────────────────

describe('inspectFoundation', () => {
  it('flags missing error handling in entry', () => {
    const area = inspectFoundation(['index.ts'], ['const x = 1'])
    const fd001 = area.violations.find((v) => v.code === 'FD-001')
    expect(fd001).toBeDefined()
    expect(fd001!.severity).toBe('major')
  })

  it('flags unvalidated config', () => {
    const area = inspectFoundation(['config.ts'], ['const x = process.env.KEY'])
    const fd002 = area.violations.find((v) => v.code === 'FD-002')
    expect(fd002).toBeDefined()
  })

  it('flags as any', () => {
    const area = inspectFoundation(['a.ts'], ['const x = {} as any'])
    const fd004 = area.violations.find((v) => v.code === 'FD-004')
    expect(fd004).toBeDefined()
    expect(fd004!.severity).toBe('critical')
  })

  it('passes clean code', () => {
    const area = inspectFoundation(['utils.ts'], [CLEAN_CONTENT])
    const critical = area.violations.filter((v) => v.severity === 'critical')
    expect(critical.length).toBe(0)
  })
})

// ─── inspectFraming ───────────────────────────────────────────────────────────

describe('inspectFraming', () => {
  it('flags oversized files', () => {
    const area = inspectFraming(['big.ts'], [BIG_CONTENT])
    const fr002 = area.violations.find((v) => v.code === 'FR-002')
    expect(fr002).toBeDefined()
    expect(fr002!.severity).toBe('major')
  })

  it('passes normal files', () => {
    const area = inspectFraming(['small.ts'], ['const x = 1'])
    const major = area.violations.filter((v) => v.severity === 'major')
    expect(major.length).toBe(0)
  })

  it('flags god objects', () => {
    const content = Array.from({ length: 7 }, (_, i) => `class Class${i} {}`).join('\n')
    const area = inspectFraming(['god.ts'], [content])
    const fr004 = area.violations.find((v) => v.code === 'FR-004' && v.message.includes('classes'))
    expect(fr004).toBeDefined()
  })
})

// ─── inspectPlumbing ──────────────────────────────────────────────────────────

describe('inspectPlumbing', () => {
  it('flags sync I/O in async context', () => {
    const area = inspectPlumbing(['a.ts'], ['async function foo() { readFileSync("x") }'])
    const pl003 = area.violations.find((v) => v.code === 'PL-003')
    expect(pl003).toBeDefined()
    expect(pl003!.severity).toBe('major')
  })

  it('passes clean async code', () => {
    const area = inspectPlumbing(['a.ts'], [CLEAN_CONTENT])
    const major = area.violations.filter((v) => v.severity === 'major')
    expect(major.length).toBe(0)
  })
})

// ─── inspectElectrical ────────────────────────────────────────────────────────

describe('inspectElectrical', () => {
  it('flags bare catch blocks', () => {
    const area = inspectElectrical(['a.ts'], ['try {} catch (e) {}'])
    const el001 = area.violations.find((v) => v.code === 'EL-001')
    expect(el001).toBeDefined()
  })

  it('flags async without error handling', () => {
    const area = inspectElectrical(['a.ts'], ['async function foo() { await bar() }'])
    const el003 = area.violations.find((v) => v.code === 'EL-003')
    expect(el003).toBeDefined()
    expect(el003!.severity).toBe('critical')
  })

  it('flags generic catch without instanceof', () => {
    const area = inspectElectrical(['a.ts'], ['try {} catch (e) { throw e }'])
    const el002 = area.violations.find((v) => v.code === 'EL-002')
    expect(el002).toBeDefined()
  })

  it('flags string throw', () => {
    const area = inspectElectrical(['a.ts'], ['throw "error"'])
    const el004 = area.violations.find((v) => v.code === 'EL-004')
    expect(el004).toBeDefined()
  })

  it('passes clean error handling', () => {
    const area = inspectElectrical(['a.ts'], [CLEAN_CONTENT])
    const critical = area.violations.filter((v) => v.severity === 'critical')
    expect(critical.length).toBe(0)
  })
})

// ─── inspectFinishing ─────────────────────────────────────────────────────────

describe('inspectFinishing', () => {
  it('flags commented-out code', () => {
    const content = '// const x = 1\n// function foo() {}\n// class Bar {}\n// if (true) {}\n// return null\n'
    const area = inspectFinishing(['a.ts'], [content])
    const fn001 = area.violations.find((v) => v.code === 'FN-001')
    expect(fn001).toBeDefined()
  })

  it('flags excessive console.log', () => {
    const area = inspectFinishing(['a.ts'], [MESSY_CONTENT])
    const fn002 = area.violations.find((v) => v.code === 'FN-002')
    expect(fn002).toBeDefined()
  })

  it('passes clean code', () => {
    const area = inspectFinishing(['a.ts'], [CLEAN_CONTENT])
    const cosmetic = area.violations.filter((v) => v.severity === 'cosmetic')
    expect(cosmetic.length).toBe(0)
  })
})

// ─── inspectRoofing ───────────────────────────────────────────────────────────

describe('inspectRoofing', () => {
  it('flags missing test files', () => {
    const area = inspectRoofing(['src/foo.ts'], ['const x = 1'])
    const rf001 = area.violations.find((v) => v.code === 'RF-001')
    expect(rf001).toBeDefined()
  })

  it('passes when test file exists', () => {
    const area = inspectRoofing(['src/foo.ts', 'src/foo.test.ts'], ['const x = 1', 'test("works", () => {})'])
    const rf001 = area.violations.find((v) => v.code === 'RF-001' && v.file === 'src/foo.ts')
    expect(rf001).toBeUndefined()
  })

  it('flags skipped tests', () => {
    const area = inspectRoofing(['a.test.ts'], [TEST_FILE])
    const rf004 = area.violations.find((v) => v.code === 'RF-004')
    expect(rf004).toBeDefined()
  })
})

// ─── estimateFixTime ──────────────────────────────────────────────────────────

describe('estimateFixTime', () => {
  it('returns 0 minutes for no violations', () => {
    expect(estimateFixTime([])).toBe('0 minutes')
  })

  it('estimates minutes', () => {
    const v: Violation[] = [{ file: 'a.ts', line: 1, area: 'X', severity: 'minor', code: 'X', message: '', fix: '' }]
    expect(estimateFixTime(v)).toBe('5 minutes')
  })

  it('estimates hours and minutes', () => {
    const vs: Violation[] = [
      { file: 'a.ts', line: 1, area: 'X', severity: 'critical', code: 'X', message: '', fix: '' },
      { file: 'a.ts', line: 1, area: 'X', severity: 'major', code: 'X', message: '', fix: '' },
      { file: 'a.ts', line: 1, area: 'X', severity: 'critical', code: 'X', message: '', fix: '' },
    ]
    expect(estimateFixTime(vs)).toBe('1h 15m')
  })

  it('estimates full hours', () => {
    const vs = Array.from({ length: 4 }, (): Violation => ({ file: 'a.ts', line: 1, area: 'X', severity: 'critical', code: 'X', message: '', fix: '' }))
    expect(estimateFixTime(vs)).toBe('2h')
  })
})

// ─── findLine ─────────────────────────────────────────────────────────────────

describe('findLine', () => {
  it('finds line number', () => {
    expect(findLine('a\nb\nc', 'b')).toBe(2)
  })

  it('returns 1 for not found', () => {
    expect(findLine('abc', 'xyz')).toBe(1)
  })

  it('finds first line', () => {
    expect(findLine('hello\nworld', 'hello')).toBe(1)
  })
})

// ─── generateForemanRecommendations ───────────────────────────────────────────

describe('generateForemanRecommendations', () => {
  it('warns about critical violations', () => {
    const stats = { criticalCount: 3, majorCount: 1, passRate: 70 } as ForemanStats
    const recs = generateForemanRecommendations([], stats)
    expect(recs.some((r) => r.includes('critical'))).toBe(true)
  })

  it('warns about many major violations', () => {
    const stats = { criticalCount: 0, majorCount: 5, passRate: 70 } as ForemanStats
    const recs = generateForemanRecommendations([], stats)
    expect(recs.some((r) => r.includes('major'))).toBe(true)
  })

  it('warns about weak area', () => {
    const areas: InspectionArea[] = [{ name: 'Electrical', score: 50, grade: 'F', violations: [] }]
    const stats = { criticalCount: 0, majorCount: 0, passRate: 70 } as ForemanStats
    const recs = generateForemanRecommendations(areas, stats)
    expect(recs.some((r) => r.includes('Electrical'))).toBe(true)
  })

  it('praises clean build', () => {
    const stats = { criticalCount: 0, majorCount: 0, passRate: 90 } as ForemanStats
    const recs = generateForemanRecommendations([{ name: 'Foundation', score: 95, grade: 'A', violations: [] }], stats)
    expect(recs.some((r) => r.includes('excellent'))).toBe(true)
  })
})

// ─── buildForemanResult ───────────────────────────────────────────────────────

describe('buildForemanResult', () => {
  it('builds result with 6 areas', () => {
    const result = buildForemanResult(['a.ts'], [CLEAN_CONTENT])
    expect(result.areas.length).toBe(6)
    const names = result.areas.map((a) => a.name)
    expect(names).toContain('Foundation')
    expect(names).toContain('Framing')
    expect(names).toContain('Plumbing')
    expect(names).toContain('Electrical')
    expect(names).toContain('Finishing')
    expect(names).toContain('Roofing')
  })

  it('computes overall score and grade', () => {
    const result = buildForemanResult(['a.ts'], [CLEAN_CONTENT])
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(100)
    expect(result.overallGrade).toBeTruthy()
  })

  it('handles empty input', () => {
    const result = buildForemanResult([], [])
    expect(result.overallScore).toBe(100)
    expect(result.stats.totalViolations).toBe(0)
  })

  it('detects violations in messy code', () => {
    const result = buildForemanResult(['messy.ts'], [MESSY_CONTENT])
    expect(result.stats.totalViolations).toBeGreaterThan(0)
    expect(result.stats.criticalCount).toBeGreaterThanOrEqual(0)
  })

  it('computes fix time', () => {
    const result = buildForemanResult(['messy.ts'], [MESSY_CONTENT])
    expect(result.stats.estimatedFixTime).toBeTruthy()
  })

  it('identifies safest and riskiest areas', () => {
    const result = buildForemanResult(['a.ts'], [CLEAN_CONTENT])
    expect(result.stats.safestArea).toBeTruthy()
    expect(result.stats.riskiestArea).toBeTruthy()
  })

  it('generates recommendations', () => {
    const result = buildForemanResult(['a.ts'], [CLEAN_CONTENT])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes pass rate', () => {
    const result = buildForemanResult(['a.ts'], [CLEAN_CONTENT])
    expect(result.stats.passRate).toBeGreaterThanOrEqual(0)
    expect(result.stats.passRate).toBeLessThanOrEqual(100)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('getGradeColor', () => {
  it('returns function for all grades', () => {
    expect(typeof getGradeColor('A')).toBe('function')
    expect(typeof getGradeColor('F')).toBe('function')
  })
})

describe('getSeverityColor', () => {
  it('returns function for all severities', () => {
    expect(typeof getSeverityColor('critical')).toBe('function')
    expect(typeof getSeverityColor('cosmetic')).toBe('function')
  })
})

describe('formatReportCard', () => {
  it('formats card', () => {
    const areas: InspectionArea[] = [{ name: 'Foundation', score: 85, grade: 'A-', violations: [] }]
    const output = formatReportCard(areas)
    expect(output).toContain('Inspection Report Card')
    expect(output).toContain('Foundation')
  })

  it('handles empty', () => {
    expect(formatReportCard([])).toContain('No inspection data')
  })
})

describe('formatViolationTable', () => {
  it('formats violations', () => {
    const v: Violation[] = [{ file: 'a.ts', line: 1, area: 'X', severity: 'critical', code: 'FD-001', message: 'test', fix: '' }]
    const output = formatViolationTable(v)
    expect(output).toContain('Violations')
    expect(output).toContain('FD-001')
  })

  it('shows clean for no violations', () => {
    expect(formatViolationTable([])).toContain('clean build')
  })
})

describe('formatPassRateMeter', () => {
  it('formats meter', () => {
    const output = formatPassRateMeter(75)
    expect(output).toContain('Pass Rate')
    expect(output).toContain('75%')
  })
})

describe('formatFixQueue', () => {
  it('formats critical fixes', () => {
    const v: Violation[] = [{ file: 'a.ts', line: 1, area: 'X', severity: 'critical', code: 'FD-001', message: '', fix: 'Fix it' }]
    const output = formatFixQueue(v)
    expect(output).toContain('Fix Priority Queue')
    expect(output).toContain('Critical')
  })

  it('handles empty', () => {
    expect(formatFixQueue([])).toContain('No fixes needed')
  })
})

describe('formatForemanStats', () => {
  it('formats stats', () => {
    const stats: ForemanStats = {
      totalViolations: 10, criticalCount: 2, majorCount: 3, minorCount: 4, cosmeticCount: 1,
      passRate: 75, buildingIntegrity: 80, estimatedFixTime: '2h 30m', safestArea: 'Foundation', riskiestArea: 'Electrical',
    }
    const output = formatForemanStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('75%')
  })
})

describe('formatForemanRecommendations', () => {
  it('formats recommendations', () => {
    const output = formatForemanRecommendations(['Fix this'])
    expect(output).toContain('1.')
  })

  it('handles empty', () => {
    expect(formatForemanRecommendations([])).toContain('No recommendations')
  })
})

describe('formatForemanTable', () => {
  it('formats full table', () => {
    const result = buildForemanResult(['a.ts'], [CLEAN_CONTENT])
    const output = formatForemanTable(result)
    expect(output).toContain('Code Foreman')
    expect(output).toContain('Inspection Report Card')
    expect(output).toContain('Pass Rate')
  })
})

describe('formatForemanJSON', () => {
  it('formats valid JSON', () => {
    const result = buildForemanResult(['a.ts'], [CLEAN_CONTENT])
    const json = formatForemanJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.areas.length).toBe(6)
    expect(parsed.stats).toBeDefined()
    expect(parsed.overallGrade).toBeTruthy()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('inspects a realistic codebase', () => {
    const result = buildForemanResult(
      ['src/index.ts', 'src/utils.ts', 'src/utils.test.ts'],
      [GOOD_ENTRY, CLEAN_CONTENT, TEST_FILE],
    )
    expect(result.areas.length).toBe(6)
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.overallScore).toBeGreaterThan(0)
  })

  it('round-trips through JSON', () => {
    const result = buildForemanResult(['a.ts'], [CLEAN_CONTENT])
    const json = formatForemanJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.overallGrade).toBe(result.overallGrade)
    expect(parsed.overallScore).toBe(result.overallScore)
  })
})
