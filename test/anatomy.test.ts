import { describe, expect, it } from 'vitest'

import {
  buildAnatomyResult,
  classifyOrganRole,
  computeBMI,
  computeComplexity,
  computeOrganHealth,
  computeOverallHealth,
  computeVitality,
  countAnyTypes,
  countAssertions,
  countCatchBlocks,
  countExports,
  countJSDoc,
  countLines,
  countTryBlocks,
  diagnoseOrganIssues,
  diagnoseSystem,
  estimateLifeExpectancy,
  examineCirculatorySystem,
  examineImmuneSystem,
  examineIntegumentarySystem,
  examineMuscularSystem,
  examineNervousSystem,
  examineSkeletalSystem,
  extractImports,
  generateAnatomyRecommendations,
  healthToStatus,
  measureVitalSigns,
  type AnatomyStats,
  type BodySystem,
  type Organ,
  type VitalSigns,
} from '../src/commands/anatomy-helpers.js'

import {
  formatAnatomyJson,
  formatAnatomyStats,
  formatAnatomyTable,
  formatOrganTable,
  formatSystemMeters,
  formatVitalSignsMonitor,
} from '../src/commands/anatomy-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const SIMPLE_FILES = ['src/core/engine.ts', 'src/commands/run.ts', 'src/utils/helpers.ts', 'src/types/api.ts', 'test/run.test.ts']
const SIMPLE_CONTENTS = [
  'export class Engine {\n  start() {}\n  stop() {}\n}\n',
  "import { Engine } from '../core/engine'\n\nexport default class Run {\n  async execute() {\n    try {\n      const e = new Engine()\n      e.start()\n    } catch (err) {\n      throw new Error('Failed')\n    }\n  }\n}\n",
  '/**\n * Helper utilities.\n * @param x - input\n * @returns result\n */\nexport function help(x: number): boolean { return x > 0 }\n',
  'export interface Api { data: string }\nexport type Result<T> = { ok: T }\n',
  "import { Run } from '../src/commands/run'\n\ndescribe('run', () => {\n  it('works', () => {\n    expect(1).toBe(1)\n    expect(true).toBe(true)\n  })\n})\n",
]

const EMPTY_FILES: string[] = []
const EMPTY_CONTENTS: string[] = []

// ─── extractImports ─────────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts imports', () => {
    expect(extractImports("import { foo } from './bar'")).toEqual(['./bar'])
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toEqual([])
  })
})

// ─── countExports ───────────────────────────────────────────────────────────────

describe('countExports', () => {
  it('counts exports', () => {
    expect(countExports('export const x = 1; export function y() {}')).toBe(2)
  })

  it('returns 0 for no exports', () => {
    expect(countExports('const x = 1')).toBe(0)
  })
})

// ─── computeComplexity ──────────────────────────────────────────────────────────

describe('computeComplexity', () => {
  it('returns 1 for simple code', () => {
    expect(computeComplexity('const x = 1')).toBe(1)
  })

  it('increases with branches', () => {
    expect(computeComplexity('if (x) {}')).toBe(2)
    expect(computeComplexity('if (x) {} else {}')).toBe(3)
  })
})

// ─── countLines ─────────────────────────────────────────────────────────────────

describe('countLines', () => {
  it('counts lines', () => {
    expect(countLines('a\nb\nc')).toBe(3)
  })

  it('returns 0 for empty', () => {
    expect(countLines('')).toBe(0)
  })
})

// ─── countJSDoc ─────────────────────────────────────────────────────────────────

describe('countJSDoc', () => {
  it('counts JSDoc blocks', () => {
    expect(countJSDoc('/** doc */\nfunction f() {}')).toBe(1)
  })

  it('returns 0 for no JSDoc', () => {
    expect(countJSDoc('function f() {}')).toBe(0)
  })
})

// ─── countCatchBlocks / countTryBlocks ──────────────────────────────────────────

describe('countCatchBlocks', () => {
  it('counts catch blocks', () => {
    expect(countCatchBlocks('try {} catch(e) {}')).toBe(1)
  })

  it('returns 0 for no catch', () => {
    expect(countCatchBlocks('const x = 1')).toBe(0)
  })
})

describe('countTryBlocks', () => {
  it('counts try blocks', () => {
    expect(countTryBlocks('try {} catch(e) {}')).toBe(1)
  })
})

// ─── countAnyTypes ──────────────────────────────────────────────────────────────

describe('countAnyTypes', () => {
  it('counts any types', () => {
    expect(countAnyTypes('function fn(x: any): any {}')).toBe(2)
  })

  it('returns 0 for no any', () => {
    expect(countAnyTypes('function fn(x: number) {}')).toBe(0)
  })
})

// ─── countAssertions ────────────────────────────────────────────────────────────

describe('countAssertions', () => {
  it('counts expect calls', () => {
    expect(countAssertions('expect(x).toBe(1)')).toBe(1)
  })

  it('counts assert calls', () => {
    expect(countAssertions('assert(true)')).toBe(1)
  })

  it('returns 0 for no assertions', () => {
    expect(countAssertions('const x = 1')).toBe(0)
  })
})

// ─── classifyOrganRole ──────────────────────────────────────────────────────────

describe('classifyOrganRole', () => {
  it('classifies index files as joints', () => {
    expect(classifyOrganRole('src/index.ts', 'skeletal')).toContain('joint')
  })

  it('classifies core files as spine', () => {
    expect(classifyOrganRole('src/core/engine.ts', 'skeletal')).toContain('spine')
  })

  it('classifies command files as prime movers', () => {
    expect(classifyOrganRole('src/commands/run.ts', 'muscular')).toContain('prime mover')
  })

  it('classifies error files as sensory neurons', () => {
    expect(classifyOrganRole('src/error.ts', 'nervous')).toContain('sensory')
  })

  it('classifies core files as heart', () => {
    expect(classifyOrganRole('src/core/engine.ts', 'circulatory')).toContain('heart')
  })

  it('classifies test files as white blood cells', () => {
    expect(classifyOrganRole('src/run.test.ts', 'immune')).toContain('white blood cell')
  })

  it('classifies unknown as tissue', () => {
    expect(classifyOrganRole('x.ts', 'unknown')).toBe('tissue')
  })
})

// ─── computeOrganHealth ─────────────────────────────────────────────────────────

describe('computeOrganHealth', () => {
  it('returns value between 0-100', () => {
    const health = computeOrganHealth('a.ts', 'export const x = 1', 'skeletal')
    expect(health).toBeGreaterThanOrEqual(0)
    expect(health).toBeLessThanOrEqual(100)
  })

  it('gives higher health for documented code in integumentary', () => {
    const documented = computeOrganHealth('a.ts', '/** docs */\nexport function foo() {}\n/** more */\nexport function bar() {}', 'integumentary')
    const undocumented = computeOrganHealth('b.ts', 'export function foo() {}', 'integumentary')
    expect(documented).toBeGreaterThan(undocumented)
  })

  it('penalizes any types in muscular', () => {
    const clean = computeOrganHealth('a.ts', 'function fn(x: number) { return x }', 'muscular')
    const withAny = computeOrganHealth('b.ts', 'function fn(x: any) { return x }', 'muscular')
    expect(clean).toBeGreaterThan(withAny)
  })

  it('rewards error handling in nervous', () => {
    const withCatch = computeOrganHealth('a.ts', 'try {} catch(e) {}', 'nervous')
    const noCatch = computeOrganHealth('b.ts', 'const x = 1', 'nervous')
    expect(withCatch).toBeGreaterThan(noCatch)
  })

  it('rewards exports in circulatory', () => {
    const withExports = computeOrganHealth('a.ts', 'export const x = 1', 'circulatory')
    const noExports = computeOrganHealth('b.ts', 'const x = 1', 'circulatory')
    expect(withExports).toBeGreaterThan(noExports)
  })

  it('rewards assertions in immune', () => {
    const withAssertions = computeOrganHealth('a.test.ts', "import { x } from './a'\nexpect(1).toBe(1)\nexpect(2).toBe(2)\nexpect(3).toBe(3)", 'immune')
    const noAssertions = computeOrganHealth('b.ts', 'const x = 1', 'immune')
    expect(withAssertions).toBeGreaterThan(noAssertions)
  })
})

// ─── computeVitality ────────────────────────────────────────────────────────────

describe('computeVitality', () => {
  it('returns 0 for zero size', () => {
    expect(computeVitality(0, 50)).toBe(0)
  })

  it('combines health and size', () => {
    const v = computeVitality(100, 80)
    expect(v).toBeGreaterThan(0)
  })

  it('caps at reasonable values', () => {
    expect(computeVitality(1000, 100)).toBeLessThanOrEqual(100)
  })
})

// ─── diagnoseSystem ─────────────────────────────────────────────────────────────

describe('diagnoseSystem', () => {
  it('diagnoses healthy system', () => {
    expect(diagnoseSystem(85)).toContain('functioning well')
  })

  it('diagnoses minor issues', () => {
    expect(diagnoseSystem(65)).toContain('Minor issues')
  })

  it('diagnoses moderate issues', () => {
    expect(diagnoseSystem(45)).toContain('Moderate')
  })

  it('diagnoses critical condition', () => {
    expect(diagnoseSystem(20)).toContain('Critical')
  })
})

// ─── healthToStatus ─────────────────────────────────────────────────────────────

describe('healthToStatus', () => {
  it('returns healthy for >= 80', () => {
    expect(healthToStatus(80)).toBe('healthy')
    expect(healthToStatus(90)).toBe('healthy')
  })

  it('returns minor-issues for >= 60', () => {
    expect(healthToStatus(60)).toBe('minor-issues')
  })

  it('returns moderate-issues for >= 40', () => {
    expect(healthToStatus(40)).toBe('moderate-issues')
  })

  it('returns critical-issues for < 40', () => {
    expect(healthToStatus(30)).toBe('critical-issues')
  })
})

// ─── diagnoseOrganIssues ────────────────────────────────────────────────────────

describe('diagnoseOrganIssues', () => {
  it('detects high complexity in muscular', () => {
    const complex = Array.from({ length: 25 }, (_, i) => `if (x${i}) {`).join('\n') + '\n}'
    const issues = diagnoseOrganIssues('a.ts', complex, 'muscular')
    expect(issues.some((i) => i.includes('complexity') || i.includes('overexerted'))).toBe(true)
  })

  it('detects large files in muscular', () => {
    const large = Array.from({ length: 350 }, (_, i) => `const line${i} = ${i}`).join('\n')
    const issues = diagnoseOrganIssues('a.ts', large, 'muscular')
    expect(issues.some((i) => i.includes('hypertrophied') || i.includes('Large'))).toBe(true)
  })

  it('detects missing error handling in nervous', () => {
    const issues = diagnoseOrganIssues('a.ts', 'const x = 1', 'nervous')
    expect(issues.some((i) => i.includes('nerve damage') || i.includes('error handling'))).toBe(true)
  })

  it('detects high coupling in circulatory', () => {
    const manyImports = Array.from({ length: 12 }, (_, i) => `import { a${i} } from './mod${i}'`).join('\n')
    const issues = diagnoseOrganIssues('a.ts', manyImports, 'circulatory')
    expect(issues.some((i) => i.includes('coupling') || i.includes('congestion'))).toBe(true)
  })

  it('detects missing docs in integumentary', () => {
    const issues = diagnoseOrganIssues('a.ts', 'function foo() {}\n'.repeat(10), 'integumentary')
    expect(issues.some((i) => i.includes('JSDoc') || i.includes('exposed'))).toBe(true)
  })

  it('detects type weaknesses in immune', () => {
    const issues = diagnoseOrganIssues('a.ts', 'const x: any = 1', 'immune')
    expect(issues.some((i) => i.includes('weakness'))).toBe(true)
  })

  it('returns empty for healthy organ', () => {
    const issues = diagnoseOrganIssues('index.ts', '/** docs */\nexport const x = 1', 'skeletal')
    expect(issues).toEqual([])
  })
})

// ─── System Examinations ───────────────────────────────────────────────────────

describe('examineSkeletalSystem', () => {
  it('examines skeletal system', () => {
    const system = examineSkeletalSystem(SIMPLE_FILES, SIMPLE_CONTENTS)
    expect(system.name).toBe('Skeletal')
    expect(system.health).toBeGreaterThanOrEqual(0)
    expect(system.organs.length).toBeGreaterThanOrEqual(0)
  })

  it('creates placeholder when no structural files', () => {
    const system = examineSkeletalSystem(['a.ts'], ['const x = 1'])
    expect(system.organs.length).toBeGreaterThan(0)
  })
})

describe('examineMuscularSystem', () => {
  it('examines muscular system', () => {
    const system = examineMuscularSystem(SIMPLE_FILES, SIMPLE_CONTENTS)
    expect(system.name).toBe('Muscular')
    expect(system.health).toBeGreaterThanOrEqual(0)
  })
})

describe('examineNervousSystem', () => {
  it('examines nervous system', () => {
    const system = examineNervousSystem(SIMPLE_FILES, SIMPLE_CONTENTS)
    expect(system.name).toBe('Nervous')
  })

  it('finds error handling files', () => {
    const system = examineNervousSystem(['a.ts'], ['try {} catch(e) { throw new Error("x") }'])
    expect(system.organs.some((o) => o.name === 'a.ts')).toBe(true)
  })

  it('creates placeholder when no error handling', () => {
    const system = examineNervousSystem(['a.ts'], ['const x = 1'])
    expect(system.organs[0].name).toContain('no error handling')
  })
})

describe('examineCirculatorySystem', () => {
  it('examines circulatory system', () => {
    const system = examineCirculatorySystem(SIMPLE_FILES, SIMPLE_CONTENTS)
    expect(system.name).toBe('Circulatory')
  })

  it('creates placeholder when no imports/exports', () => {
    const system = examineCirculatorySystem(['a.ts'], ['const x = 1'])
    expect(system.organs[0].name).toContain('no data flow')
  })
})

describe('examineImmuneSystem', () => {
  it('examines immune system', () => {
    const system = examineImmuneSystem(SIMPLE_FILES, SIMPLE_CONTENTS)
    expect(system.name).toBe('Immune')
  })

  it('creates placeholder when no tests', () => {
    const system = examineImmuneSystem(['a.ts'], ['const x = 1'])
    expect(system.organs[0].name).toContain('no immune')
  })
})

describe('examineIntegumentarySystem', () => {
  it('examines all files', () => {
    const system = examineIntegumentarySystem(SIMPLE_FILES, SIMPLE_CONTENTS)
    expect(system.organs.length).toBe(SIMPLE_FILES.length)
  })

  it('handles empty input', () => {
    const system = examineIntegumentarySystem([], [])
    expect(system.organs.length).toBeGreaterThan(0)
  })
})

// ─── measureVitalSigns ──────────────────────────────────────────────────────────

describe('measureVitalSigns', () => {
  it('measures all vital signs', () => {
    const vs = measureVitalSigns(SIMPLE_FILES, SIMPLE_CONTENTS)
    expect(typeof vs.heartRate).toBe('number')
    expect(['normal', 'high', 'critical']).toContain(vs.bloodPressure)
    expect(typeof vs.bodyTemp).toBe('number')
    expect(typeof vs.respiratory).toBe('number')
    expect(typeof vs.reflexes).toBe('number')
    expect(typeof vs.immunity).toBe('number')
  })

  it('returns 0 immunity for no test files', () => {
    const vs = measureVitalSigns(['a.ts'], ['const x = 1'])
    expect(vs.immunity).toBe(0)
  })

  it('returns higher immunity with test files', () => {
    const vs = measureVitalSigns(['a.ts', 'a.test.ts'], ['const x = 1', 'expect(1).toBe(1)'])
    expect(vs.immunity).toBeGreaterThan(0)
  })

  it('increases reflexes with error handling', () => {
    const low = measureVitalSigns(['a.ts'], ['const x = 1'])
    const high = measureVitalSigns(['a.ts'], ['try {} catch(e) {} throw new Error("x")'])
    expect(high.reflexes).toBeGreaterThan(low.reflexes)
  })
})

// ─── computeOverallHealth ──────────────────────────────────────────────────────

describe('computeOverallHealth', () => {
  it('returns 0 for empty systems', () => {
    expect(computeOverallHealth([])).toBe(0)
  })

  it('computes weighted average', () => {
    const systems: BodySystem[] = [
      { name: 'Skeletal', health: 80, organs: [], diagnosis: '', status: 'healthy' },
      { name: 'Muscular', health: 60, organs: [], diagnosis: '', status: 'minor-issues' },
      { name: 'Nervous', health: 70, organs: [], diagnosis: '', status: 'healthy' },
      { name: 'Circulatory', health: 90, organs: [], diagnosis: '', status: 'healthy' },
      { name: 'Immune', health: 50, organs: [], diagnosis: '', status: 'moderate-issues' },
      { name: 'Integumentary', health: 40, organs: [], diagnosis: '', status: 'moderate-issues' },
    ]
    const health = computeOverallHealth(systems)
    expect(health).toBeGreaterThan(0)
    expect(health).toBeLessThanOrEqual(100)
  })
})

// ─── computeBMI ─────────────────────────────────────────────────────────────────

describe('computeBMI', () => {
  it('returns 0 for empty files', () => {
    expect(computeBMI([], [])).toBe(0)
  })

  it('computes average lines per file', () => {
    expect(computeBMI(['a.ts'], ['line1\nline2\nline3'])).toBe(3)
  })
})

// ─── estimateLifeExpectancy ─────────────────────────────────────────────────────

describe('estimateLifeExpectancy', () => {
  it('estimates long-term for healthy code', () => {
    const vs: VitalSigns = { heartRate: 50, bloodPressure: 'normal', bodyTemp: 20, respiratory: 30, reflexes: 50, immunity: 60 }
    expect(estimateLifeExpectancy(85, vs)).toContain('Long-term')
  })

  it('estimates moderate for average health', () => {
    const vs: VitalSigns = { heartRate: 50, bloodPressure: 'normal', bodyTemp: 30, respiratory: 30, reflexes: 30, immunity: 40 }
    expect(estimateLifeExpectancy(65, vs)).toContain('Moderate')
  })

  it('estimates short for poor health', () => {
    const vs: VitalSigns = { heartRate: 50, bloodPressure: 'high', bodyTemp: 50, respiratory: 30, reflexes: 10, immunity: 10 }
    expect(estimateLifeExpectancy(45, vs)).toContain('attention')
  })

  it('estimates critical for very poor health', () => {
    const vs: VitalSigns = { heartRate: 50, bloodPressure: 'critical', bodyTemp: 80, respiratory: 30, reflexes: 5, immunity: 5 }
    expect(estimateLifeExpectancy(20, vs)).toContain('Critical')
  })
})

// ─── generateAnatomyRecommendations ─────────────────────────────────────────────

describe('generateAnatomyRecommendations', () => {
  const baseStats: AnatomyStats = {
    totalOrgans: 10, healthySystems: 4, criticalSystems: 0,
    avgSystemHealth: 70, overallHealth: 75, bodyMassIndex: 50,
    largestOrgan: 'a.ts', smallestOrgan: 'b.ts',
    mostVital: 'a.ts', weakestOrgan: 'c.ts',
    lifeExpectancy: 'Long-term maintainable (5+ years)',
  }

  it('recommends for critical systems', () => {
    const systems: BodySystem[] = [
      { name: 'Nervous', health: 20, organs: [], diagnosis: '', status: 'critical-issues' },
    ]
    const vs: VitalSigns = { heartRate: 50, bloodPressure: 'normal', bodyTemp: 20, respiratory: 30, reflexes: 50, immunity: 60 }
    const recs = generateAnatomyRecommendations(systems, vs, baseStats)
    expect(recs.some((r) => r.includes('EMERGENCY') || r.includes('critical'))).toBe(true)
  })

  it('recommends for low immunity', () => {
    const vs: VitalSigns = { heartRate: 50, bloodPressure: 'normal', bodyTemp: 20, respiratory: 30, reflexes: 50, immunity: 10 }
    const recs = generateAnatomyRecommendations([], vs, baseStats)
    expect(recs.some((r) => r.includes('immunity') || r.includes('test'))).toBe(true)
  })

  it('recommends for high body temp', () => {
    const vs: VitalSigns = { heartRate: 50, bloodPressure: 'normal', bodyTemp: 80, respiratory: 30, reflexes: 50, immunity: 60 }
    const recs = generateAnatomyRecommendations([], vs, baseStats)
    expect(recs.some((r) => r.includes('temperature') || r.includes('body temp'))).toBe(true)
  })

  it('recommends for critical blood pressure', () => {
    const vs: VitalSigns = { heartRate: 50, bloodPressure: 'critical', bodyTemp: 20, respiratory: 30, reflexes: 50, immunity: 60 }
    const recs = generateAnatomyRecommendations([], vs, baseStats)
    expect(recs.some((r) => r.includes('blood pressure'))).toBe(true)
  })

  it('recommends for poor reflexes', () => {
    const vs: VitalSigns = { heartRate: 50, bloodPressure: 'normal', bodyTemp: 20, respiratory: 30, reflexes: 10, immunity: 60 }
    const recs = generateAnatomyRecommendations([], vs, baseStats)
    expect(recs.some((r) => r.includes('reflex') || r.includes('error handling'))).toBe(true)
  })

  it('gives positive feedback for healthy codebase', () => {
    const vs: VitalSigns = { heartRate: 50, bloodPressure: 'normal', bodyTemp: 20, respiratory: 30, reflexes: 60, immunity: 70 }
    const recs = generateAnatomyRecommendations([], vs, baseStats)
    expect(recs.some((r) => r.includes('healthy') || r.includes('normal'))).toBe(true)
  })
})

// ─── buildAnatomyResult ────────────────────────────────────────────────────────

describe('buildAnatomyResult', () => {
  it('builds result with all fields', () => {
    const result = buildAnatomyResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.systems).toBeDefined()
    expect(result.vitalSigns).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('creates 6 body systems', () => {
    const result = buildAnatomyResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.systems.length).toBe(6)
    const names = result.systems.map((s) => s.name)
    expect(names).toContain('Skeletal')
    expect(names).toContain('Muscular')
    expect(names).toContain('Nervous')
    expect(names).toContain('Circulatory')
    expect(names).toContain('Immune')
    expect(names).toContain('Integumentary')
  })

  it('computes vital signs', () => {
    const result = buildAnatomyResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.vitalSigns.heartRate).toBeGreaterThan(0)
  })

  it('computes stats', () => {
    const result = buildAnatomyResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.stats.totalOrgans).toBeGreaterThan(0)
    expect(result.stats.overallHealth).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallHealth).toBeLessThanOrEqual(100)
    expect(result.stats.bodyMassIndex).toBeGreaterThanOrEqual(0)
  })

  it('handles empty input', () => {
    const result = buildAnatomyResult(EMPTY_FILES, EMPTY_CONTENTS, {})
    expect(result.systems.length).toBe(6)
    expect(result.stats.totalOrgans).toBeGreaterThan(0)
    expect(result.stats.overallHealth).toBeGreaterThanOrEqual(0)
  })

  it('generates recommendations', () => {
    const result = buildAnatomyResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes life expectancy', () => {
    const result = buildAnatomyResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.stats.lifeExpectancy.length).toBeGreaterThan(0)
  })

  it('all systems have valid status', () => {
    const result = buildAnatomyResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    const validStatuses = ['healthy', 'minor-issues', 'moderate-issues', 'critical-issues']
    for (const system of result.systems) {
      expect(validStatuses).toContain(system.status)
    }
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatSystemMeters', () => {
  it('shows systems', () => {
    const systems: BodySystem[] = [
      { name: 'Skeletal', health: 80, organs: [], diagnosis: 'OK', status: 'healthy' },
    ]
    const output = formatSystemMeters(systems)
    expect(output).toContain('Skeletal')
    expect(output).toContain('80%')
  })
})

describe('formatOrganTable', () => {
  it('shows organs', () => {
    const organs: Organ[] = [{
      name: 'engine.ts', system: 'skeletal', function: 'spine',
      health: 90, size: 50, vitality: 80, issues: [],
    }]
    const output = formatOrganTable(organs)
    expect(output).toContain('engine.ts')
  })

  it('shows empty message', () => {
    expect(formatOrganTable([])).toContain('No organs')
  })
})

describe('formatVitalSignsMonitor', () => {
  it('shows all vital signs', () => {
    const vs: VitalSigns = { heartRate: 75, bloodPressure: 'normal', bodyTemp: 30, respiratory: 25, reflexes: 60, immunity: 50 }
    const output = formatVitalSignsMonitor(vs)
    expect(output).toContain('Heart Rate')
    expect(output).toContain('Blood Pressure')
    expect(output).toContain('Body Temp')
    expect(output).toContain('Immunity')
  })
})

describe('formatAnatomyStats', () => {
  it('shows stats', () => {
    const stats: AnatomyStats = {
      totalOrgans: 10, healthySystems: 4, criticalSystems: 1,
      avgSystemHealth: 65, overallHealth: 70, bodyMassIndex: 45,
      largestOrgan: 'a.ts', smallestOrgan: 'b.ts',
      mostVital: 'c.ts', weakestOrgan: 'd.ts',
      lifeExpectancy: 'Moderate lifespan (2-5 years)',
    }
    const output = formatAnatomyStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('70%')
  })
})

describe('formatAnatomyJson', () => {
  it('produces valid JSON', () => {
    const result = buildAnatomyResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    const json = formatAnatomyJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.systems).toBeDefined()
    expect(parsed.vitalSigns).toBeDefined()
  })
})

describe('formatAnatomyTable', () => {
  it('produces table output', () => {
    const result = buildAnatomyResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    const output = formatAnatomyTable(result)
    expect(output).toContain('Body Systems')
    expect(output).toContain('Organ Health')
    expect(output).toContain('Vital Signs')
    expect(output).toContain('Anatomy Summary')
  })
})
