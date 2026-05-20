import { describe, expect, it } from 'vitest'

import {
  buildForgeResult,
  classifyGrade,
  classifyMetal,
  classifyOverallForge,
  computeAnvilIndex,
  computeCraftsmanship,
  computeForgeQuality,
  computePolish,
  detectHammerMarks,
  evaluateHeatTreatment,
  evaluateTemper,
  generateRecommendations,
  inspectWelds,
  type ForgeOptions,
  type ForgeResult,
  type ForgeStats,
  type ForgedPiece,
  type ForgeWeld,
  type HammerMark,
  type HeatTreatment,
  type PieceGrade,
  type MetalType,
  type OverallForge,
} from '../src/commands/forge-helpers.js'

import {
  formatCraftsmanshipGauge,
  formatForgeJson,
  formatForgeStats,
  formatForgeTable,
  formatGradeLabel,
  formatHammerMarks,
  formatHeatGradeLabel,
  formatHeatTreatment,
  formatMetalLabel,
  formatOverallForgeLabel,
  formatPieces,
  formatRecommendations,
  formatWeldQualityLabel,
  formatWelds,
} from '../src/commands/forge-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY = ''

const CLEAN_FN = `export function add(a: number, b: number): number {
  return a + b
}
`

const TYPED_CLASS = `export class Calculator {
  private value: number

  constructor(initial: number) {
    this.value = initial
  }

  add(n: number): number {
    this.value += n
    return this.value
  }
}
`

const RUSHED_CODE = `function process(data) {
  console.log('processing', data)
  // TODO: fix this
  // FIXME: error handling
  const result = eval(data)
  debugger
  return result
}
`

const WELL_STRUCTURED = `import type { Config } from './types.js'

/**
 * Load config from path.
 */
export async function loadConfig(path: string): Promise<Config> {
  try {
    const content = await readFile(path, 'utf8')
    if (!content) throw new Error('Empty config')
    const parsed = JSON.parse(content)
    if (typeof parsed !== 'object') throw new Error('Invalid config')
    return parsed as Config
  } catch (error) {
    return getDefaultConfig()
  }
}

export function getDefaultConfig(): Config {
  return { debug: false, port: 3000 }
}

export type { Config }
`

const ERROR_HANDLED = `export function safeParse(input: string): unknown {
  try {
    const result = JSON.parse(input)
    if (result === null || result === undefined) {
      throw new Error('Null result')
    }
    return result
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
    }
    return null
  } finally {
    cleanup()
  }
}

function cleanup(): void {
  // cleanup
}
`

const MANY_IMPORTS = Array.from({ length: 20 }, (_, i) => `import { mod${i} } from './mod${i}'`).join('\n') + '\nexport const x = 1\n'

const HARD_CODED = `if (status === 'active') { }
if (role === 200) { }
if (mode === 'debug') { }
`

// ─── evaluateTemper ────────────────────────────────────────────────────────────

describe('evaluateTemper', () => {
  it('returns 0 for empty content', () => {
    expect(evaluateTemper(EMPTY)).toBe(0)
  })

  it('returns high temper for clean function', () => {
    const temper = evaluateTemper(CLEAN_FN)
    expect(temper).toBeGreaterThanOrEqual(70)
  })

  it('penalizes many imports', () => {
    const temper = evaluateTemper(MANY_IMPORTS)
    expect(temper).toBeLessThan(70)
  })

  it('penalizes hard-coded comparisons', () => {
    const temper = evaluateTemper(HARD_CODED)
    expect(temper).toBeLessThan(80)
  })

  it('returns 0-100 range', () => {
    const temper = evaluateTemper(CLEAN_FN)
    expect(temper).toBeGreaterThanOrEqual(0)
    expect(temper).toBeLessThanOrEqual(100)
  })

  it('rewards encapsulation with private members', () => {
    const temper = evaluateTemper(TYPED_CLASS)
    expect(temper).toBeGreaterThanOrEqual(75)
  })
})

// ─── inspectWelds ──────────────────────────────────────────────────────────────

describe('inspectWelds', () => {
  it('returns empty for empty content', () => {
    expect(inspectWelds(EMPTY, 'a.ts')).toEqual([])
  })

  it('detects function boundary welds', () => {
    const welds = inspectWelds(CLEAN_FN, 'math.ts')
    const fnWelds = welds.filter(w => w.type === 'function-boundary')
    expect(fnWelds.length).toBeGreaterThanOrEqual(1)
  })

  it('detects class boundary welds', () => {
    const welds = inspectWelds(TYPED_CLASS, 'calc.ts')
    const classWelds = welds.filter(w => w.type === 'class-boundary')
    expect(classWelds.length).toBeGreaterThanOrEqual(1)
  })

  it('detects module boundary for exports', () => {
    const welds = inspectWelds(CLEAN_FN, 'math.ts')
    const moduleWelds = welds.filter(w => w.type === 'module-boundary')
    expect(moduleWelds.length).toBeGreaterThanOrEqual(1)
  })

  it('detects API boundary for try/catch', () => {
    const welds = inspectWelds(ERROR_HANDLED, 'safe.ts')
    const apiWelds = welds.filter(w => w.type === 'api-boundary')
    expect(apiWelds.length).toBeGreaterThanOrEqual(1)
  })

  it('assigns higher strength to typed parameters', () => {
    const welds = inspectWelds(CLEAN_FN, 'math.ts')
    const fnWeld = welds.find(w => w.type === 'function-boundary')
    expect(fnWeld!.strength).toBeGreaterThanOrEqual(75)
  })

  it('sets issue for weak welds', () => {
    const welds = inspectWelds('function f(a, b, c, d, e, f, g) { return 1 }', 'bad.ts')
    const weakWeld = welds.find(w => w.strength < 50)
    if (weakWeld) {
      expect(weakWeld.issue).toBeTruthy()
    }
  })

  it('includes location with file path', () => {
    const welds = inspectWelds(CLEAN_FN, 'math.ts')
    expect(welds.every(w => w.location.includes('math.ts'))).toBe(true)
  })
})

// ─── detectHammerMarks ─────────────────────────────────────────────────────────

describe('detectHammerMarks', () => {
  it('returns empty for empty content', () => {
    expect(detectHammerMarks(EMPTY)).toEqual([])
  })

  it('detects console.log as rushed', () => {
    const marks = detectHammerMarks('console.log("debug")')
    const rushed = marks.filter(m => m.type === 'rushed')
    expect(rushed.length).toBeGreaterThanOrEqual(1)
  })

  it('detects TODO as rushed', () => {
    const marks = detectHammerMarks('// TODO: fix this')
    const rushed = marks.filter(m => m.type === 'rushed')
    expect(rushed.length).toBeGreaterThanOrEqual(1)
  })

  it('detects debugger as rushed', () => {
    const marks = detectHammerMarks('  debugger;\n')
    expect(marks.some(m => m.type === 'rushed' && m.evidence.includes('Debugger'))).toBe(true)
  })

  it('detects JSDoc as careful', () => {
    const marks = detectHammerMarks('/**\n * Docs\n */\nfunction x() {}')
    expect(marks.some(m => m.type === 'careful')).toBe(true)
  })

  it('detects typed export function as skilled', () => {
    const marks = detectHammerMarks('export function add(a: number): number { return a }')
    expect(marks.some(m => m.type === 'skilled')).toBe(true)
  })

  it('detects any type as novice', () => {
    const marks = detectHammerMarks('const x: any = 1')
    expect(marks.some(m => m.type === 'novice' && m.evidence.includes('any'))).toBe(true)
  })

  it('detects import type as careful', () => {
    const marks = detectHammerMarks("import type { Config } from './types'")
    expect(marks.some(m => m.type === 'careful' && m.evidence.includes('Type-only'))).toBe(true)
  })

  it('assigns correct impact types', () => {
    const marks = detectHammerMarks(RUSHED_CODE)
    expect(marks.some(m => m.impact === 'negative')).toBe(true)
  })

  it('detects multiple marks in complex code', () => {
    const marks = detectHammerMarks(RUSHED_CODE)
    expect(marks.length).toBeGreaterThanOrEqual(3)
  })
})

// ─── evaluateHeatTreatment ─────────────────────────────────────────────────────

describe('evaluateHeatTreatment', () => {
  it('returns raw grade for empty content', () => {
    const ht = evaluateHeatTreatment(EMPTY)
    expect(ht.grade).toBe('raw')
    expect(ht.errorHandling).toBe(0)
  })

  it('returns properly-hardened for well-handled code', () => {
    const ht = evaluateHeatTreatment(ERROR_HANDLED)
    expect(ht.errorHandling).toBeGreaterThan(50)
  })

  it('detects try-catch for error handling', () => {
    const ht = evaluateHeatTreatment(ERROR_HANDLED)
    expect(ht.errorHandling).toBeGreaterThanOrEqual(60)
  })

  it('detects null/undefined checks for edge cases', () => {
    const ht = evaluateHeatTreatment(WELL_STRUCTURED)
    expect(ht.edgeCaseCoverage).toBeGreaterThan(20)
  })

  it('detects typeof for input validation', () => {
    const ht = evaluateHeatTreatment("if (typeof x === 'string') {}")
    expect(ht.inputValidation).toBeGreaterThan(20)
  })

  it('detects finally for failure recovery', () => {
    const ht = evaluateHeatTreatment(ERROR_HANDLED)
    expect(ht.failureRecovery).toBeGreaterThan(20)
  })

  it('all scores in 0-100 range', () => {
    const ht = evaluateHeatTreatment(ERROR_HANDLED)
    expect(ht.errorHandling).toBeGreaterThanOrEqual(0)
    expect(ht.errorHandling).toBeLessThanOrEqual(100)
    expect(ht.edgeCaseCoverage).toBeGreaterThanOrEqual(0)
    expect(ht.edgeCaseCoverage).toBeLessThanOrEqual(100)
    expect(ht.inputValidation).toBeGreaterThanOrEqual(0)
    expect(ht.inputValidation).toBeLessThanOrEqual(100)
    expect(ht.failureRecovery).toBeGreaterThanOrEqual(0)
    expect(ht.failureRecovery).toBeLessThanOrEqual(100)
  })

  it('assigns grade based on average scores', () => {
    const ht = evaluateHeatTreatment(EMPTY)
    expect(['properly-hardened', 'case-hardened', 'annealed', 'raw', 'brittle']).toContain(ht.grade)
  })
})

// ─── computePolish ─────────────────────────────────────────────────────────────

describe('computePolish', () => {
  it('returns 0 for empty content', () => {
    expect(computePolish(EMPTY)).toBe(0)
  })

  it('returns high polish for clean code', () => {
    const polish = computePolish(CLEAN_FN)
    expect(polish).toBeGreaterThanOrEqual(60)
  })

  it('penalizes debug console calls', () => {
    const polish = computePolish('console.log("hi")\n')
    expect(polish).toBeLessThan(85)
  })

  it('penalizes TODO markers', () => {
    const polish = computePolish('// TODO: fix\n')
    expect(polish).toBeLessThan(85)
  })

  it('penalizes debugger statements', () => {
    const polish = computePolish('debugger\n')
    expect(polish).toBeLessThan(85)
  })

  it('rewards documentation', () => {
    const polish = computePolish('/**\n * Docs\n */\nfunction x() {}\n')
    expect(polish).toBeGreaterThanOrEqual(70)
  })

  it('returns 0-100 range', () => {
    const polish = computePolish(CLEAN_FN)
    expect(polish).toBeGreaterThanOrEqual(0)
    expect(polish).toBeLessThanOrEqual(100)
  })
})

// ─── computeCraftsmanship ──────────────────────────────────────────────────────

describe('computeCraftsmanship', () => {
  it('computes 0-100 range', () => {
    const ht: HeatTreatment = { errorHandling: 50, edgeCaseCoverage: 50, inputValidation: 50, failureRecovery: 50, grade: 'annealed' }
    const c = computeCraftsmanship(50, [], [], ht, 50)
    expect(c).toBeGreaterThanOrEqual(0)
    expect(c).toBeLessThanOrEqual(100)
  })

  it('higher inputs produce higher craftsmanship', () => {
    const htLow: HeatTreatment = { errorHandling: 20, edgeCaseCoverage: 20, inputValidation: 20, failureRecovery: 20, grade: 'raw' }
    const htHigh: HeatTreatment = { errorHandling: 80, edgeCaseCoverage: 80, inputValidation: 80, failureRecovery: 80, grade: 'properly-hardened' }
    const low = computeCraftsmanship(30, [], [], htLow, 30)
    const high = computeCraftsmanship(80, [], [], htHigh, 80)
    expect(high).toBeGreaterThan(low)
  })

  it('factors in weld strength', () => {
    const ht: HeatTreatment = { errorHandling: 50, edgeCaseCoverage: 50, inputValidation: 50, failureRecovery: 50, grade: 'annealed' }
    const weakWelds: ForgeWeld[] = [{ location: 'a', type: 'function-boundary', quality: 'broken', strength: 20, description: 'd', issue: null }]
    const strongWelds: ForgeWeld[] = [{ location: 'a', type: 'function-boundary', quality: 'seamless', strength: 95, description: 'd', issue: null }]
    const weakCraft = computeCraftsmanship(50, weakWelds, [], ht, 50)
    const strongCraft = computeCraftsmanship(50, strongWelds, [], ht, 50)
    expect(strongCraft).toBeGreaterThan(weakCraft)
  })
})

// ─── classifyGrade ─────────────────────────────────────────────────────────────

describe('classifyGrade', () => {
  it('classifies masterwork at 90+', () => {
    expect(classifyGrade(92)).toBe('masterwork')
    expect(classifyGrade(100)).toBe('masterwork')
  })

  it('classifies fine at 75-89', () => {
    expect(classifyGrade(80)).toBe('fine')
    expect(classifyGrade(75)).toBe('fine')
  })

  it('classifies standard at 55-74', () => {
    expect(classifyGrade(60)).toBe('standard')
    expect(classifyGrade(55)).toBe('standard')
  })

  it('classifies rough at 30-54', () => {
    expect(classifyGrade(40)).toBe('rough')
    expect(classifyGrade(30)).toBe('rough')
  })

  it('classifies pig-iron below 30', () => {
    expect(classifyGrade(20)).toBe('pig-iron')
    expect(classifyGrade(0)).toBe('pig-iron')
  })
})

// ─── classifyMetal ─────────────────────────────────────────────────────────────

describe('classifyMetal', () => {
  it('classifies steel for high combined', () => {
    expect(classifyMetal(85, 80)).toBe('steel')
  })

  it('classifies iron for moderate-high', () => {
    expect(classifyMetal(65, 60)).toBe('iron')
  })

  it('classifies bronze for moderate', () => {
    expect(classifyMetal(45, 40)).toBe('bronze')
  })

  it('classifies copper for low-moderate', () => {
    expect(classifyMetal(25, 20)).toBe('copper')
  })

  it('classifies tin for very low', () => {
    expect(classifyMetal(5, 5)).toBe('tin')
  })
})

// ─── classifyOverallForge ──────────────────────────────────────────────────────

describe('classifyOverallForge', () => {
  it('returns legendary at 85+', () => {
    expect(classifyOverallForge(90, 85)).toBe('legendary')
  })

  it('returns master at 70+', () => {
    expect(classifyOverallForge(70, 75)).toBe('master')
  })

  it('returns journeyman at 50+', () => {
    expect(classifyOverallForge(55, 50)).toBe('journeyman')
  })

  it('returns apprentice at 30+', () => {
    expect(classifyOverallForge(35, 30)).toBe('apprentice')
  })

  it('returns novice below 30', () => {
    expect(classifyOverallForge(10, 10)).toBe('novice')
  })
})

// ─── computeForgeQuality ───────────────────────────────────────────────────────

describe('computeForgeQuality', () => {
  const baseStats: ForgeStats = {
    totalPieces: 1, avgTemper: 70, avgCraftsmanship: 70, avgPolish: 70,
    masterworkCount: 0, pigIronCount: 0, totalWelds: 2, seamlessWelds: 1,
    brokenWelds: 0, totalHammerMarks: 3, skilledMarks: 2, rushedMarks: 1,
    avgHeatTreatment: 60, properlyHardened: 1, brittle: 0,
    overallForge: 'journeyman', forgeQuality: 0, anvilIndex: 0,
  }

  it('returns 0-100 range', () => {
    const q = computeForgeQuality(baseStats)
    expect(q).toBeGreaterThanOrEqual(0)
    expect(q).toBeLessThanOrEqual(100)
  })

  it('higher craftsmanship increases quality', () => {
    const low = { ...baseStats, avgCraftsmanship: 30 }
    const high = { ...baseStats, avgCraftsmanship: 90 }
    expect(computeForgeQuality(high)).toBeGreaterThan(computeForgeQuality(low))
  })
})

// ─── computeAnvilIndex ─────────────────────────────────────────────────────────

describe('computeAnvilIndex', () => {
  const baseStats: ForgeStats = {
    totalPieces: 2, avgTemper: 70, avgCraftsmanship: 70, avgPolish: 70,
    masterworkCount: 1, pigIronCount: 0, totalWelds: 2, seamlessWelds: 1,
    brokenWelds: 0, totalHammerMarks: 3, skilledMarks: 2, rushedMarks: 0,
    avgHeatTreatment: 60, properlyHardened: 1, brittle: 0,
    overallForge: 'journeyman', forgeQuality: 50, anvilIndex: 0,
  }

  it('returns 0-100 range', () => {
    const idx = computeAnvilIndex(baseStats)
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThanOrEqual(100)
  })

  it('penalizes pig iron files', () => {
    const clean = { ...baseStats, pigIronCount: 0 }
    const dirty = { ...baseStats, pigIronCount: 2 }
    expect(computeAnvilIndex(clean)).toBeGreaterThan(computeAnvilIndex(dirty))
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends rework for pig-iron files', () => {
    const pieces: ForgedPiece[] = [{
      file: 'bad.ts', temper: 10, welds: [], hammerMarks: [],
      heatTreatment: { errorHandling: 5, edgeCaseCoverage: 5, inputValidation: 5, failureRecovery: 5, grade: 'brittle' },
      polish: 10, craftsmanship: 15, grade: 'pig-iron', metal: 'tin',
    }]
    const stats: ForgeStats = {
      totalPieces: 1, avgTemper: 10, avgCraftsmanship: 15, avgPolish: 10,
      masterworkCount: 0, pigIronCount: 1, totalWelds: 0, seamlessWelds: 0,
      brokenWelds: 0, totalHammerMarks: 0, skilledMarks: 0, rushedMarks: 0,
      avgHeatTreatment: 5, properlyHardened: 0, brittle: 1,
      overallForge: 'novice', forgeQuality: 10, anvilIndex: 20,
    }
    const recs = generateRecommendations(pieces, stats)
    expect(recs.some(r => r.includes('pig-iron'))).toBe(true)
  })

  it('recommends error handling for brittle files', () => {
    const pieces: ForgedPiece[] = [{
      file: 'raw.ts', temper: 50, welds: [], hammerMarks: [],
      heatTreatment: { errorHandling: 10, edgeCaseCoverage: 10, inputValidation: 10, failureRecovery: 10, grade: 'raw' },
      polish: 50, craftsmanship: 50, grade: 'standard', metal: 'bronze',
    }]
    const stats: ForgeStats = {
      totalPieces: 1, avgTemper: 50, avgCraftsmanship: 50, avgPolish: 50,
      masterworkCount: 0, pigIronCount: 0, totalWelds: 0, seamlessWelds: 0,
      brokenWelds: 0, totalHammerMarks: 0, skilledMarks: 0, rushedMarks: 0,
      avgHeatTreatment: 10, properlyHardened: 0, brittle: 1,
      overallForge: 'apprentice', forgeQuality: 30, anvilIndex: 40,
    }
    const recs = generateRecommendations(pieces, stats)
    expect(recs.some(r => r.includes('error handling') || r.includes('heat treatment'))).toBe(true)
  })

  it('returns empty for excellent code', () => {
    const pieces: ForgedPiece[] = [{
      file: 'perfect.ts', temper: 95, welds: [{ location: 'x', type: 'function-boundary', quality: 'seamless', strength: 95, description: 'd', issue: null }],
      hammerMarks: [{ type: 'skilled', location: 1, evidence: 'good', impact: 'positive' }],
      heatTreatment: { errorHandling: 90, edgeCaseCoverage: 90, inputValidation: 90, failureRecovery: 90, grade: 'properly-hardened' },
      polish: 95, craftsmanship: 95, grade: 'masterwork', metal: 'steel',
    }]
    const stats: ForgeStats = {
      totalPieces: 1, avgTemper: 95, avgCraftsmanship: 95, avgPolish: 95,
      masterworkCount: 1, pigIronCount: 0, totalWelds: 1, seamlessWelds: 1,
      brokenWelds: 0, totalHammerMarks: 1, skilledMarks: 1, rushedMarks: 0,
      avgHeatTreatment: 90, properlyHardened: 1, brittle: 0,
      overallForge: 'legendary', forgeQuality: 95, anvilIndex: 95,
    }
    const recs = generateRecommendations(pieces, stats)
    expect(recs).toEqual([])
  })
})

// ─── buildForgeResult (integration) ────────────────────────────────────────────

describe('buildForgeResult', () => {
  it('handles empty input', () => {
    const result = buildForgeResult([], [], {})
    expect(result.pieces).toEqual([])
    expect(result.stats.totalPieces).toBe(0)
  })

  it('analyzes single file', () => {
    const result = buildForgeResult(['a.ts'], [CLEAN_FN], {})
    expect(result.pieces).toHaveLength(1)
    expect(result.pieces[0].file).toBe('a.ts')
    expect(result.pieces[0].craftsmanship).toBeGreaterThanOrEqual(0)
  })

  it('populates all stats fields', () => {
    const result = buildForgeResult(['a.ts'], [CLEAN_FN], {})
    const s = result.stats
    expect(typeof s.totalPieces).toBe('number')
    expect(typeof s.avgTemper).toBe('number')
    expect(typeof s.avgCraftsmanship).toBe('number')
    expect(typeof s.avgPolish).toBe('number')
    expect(typeof s.masterworkCount).toBe('number')
    expect(typeof s.pigIronCount).toBe('number')
    expect(typeof s.totalWelds).toBe('number')
    expect(typeof s.seamlessWelds).toBe('number')
    expect(typeof s.brokenWelds).toBe('number')
    expect(typeof s.totalHammerMarks).toBe('number')
    expect(typeof s.skilledMarks).toBe('number')
    expect(typeof s.rushedMarks).toBe('number')
    expect(typeof s.avgHeatTreatment).toBe('number')
    expect(typeof s.properlyHardened).toBe('number')
    expect(typeof s.brittle).toBe('number')
    expect(typeof s.forgeQuality).toBe('number')
    expect(typeof s.anvilIndex).toBe('number')
    expect(['legendary', 'master', 'journeyman', 'apprentice', 'novice']).toContain(s.overallForge)
  })

  it('produces JSON-serializable result', () => {
    const result = buildForgeResult(['a.ts'], [CLEAN_FN], {})
    expect(() => JSON.stringify(result)).not.toThrow()
  })

  it('analyzes multiple files', () => {
    const result = buildForgeResult(['a.ts', 'b.ts'], [CLEAN_FN, RUSHED_CODE], {})
    expect(result.pieces).toHaveLength(2)
    expect(result.stats.totalPieces).toBe(2)
  })

  it('detects lower craftsmanship for rushed code', () => {
    const result = buildForgeResult(['clean.ts', 'rushed.ts'], [CLEAN_FN, RUSHED_CODE], {})
    const clean = result.pieces.find(p => p.file === 'clean.ts')
    const rushed = result.pieces.find(p => p.file === 'rushed.ts')
    expect(clean!.craftsmanship).toBeGreaterThan(rushed!.craftsmanship)
  })

  it('assigns grade to each piece', () => {
    const result = buildForgeResult(['a.ts'], [CLEAN_FN], {})
    const grades: string[] = ['masterwork', 'fine', 'standard', 'rough', 'pig-iron']
    expect(grades).toContain(result.pieces[0].grade)
  })

  it('assigns metal to each piece', () => {
    const result = buildForgeResult(['a.ts'], [CLEAN_FN], {})
    const metals: string[] = ['steel', 'iron', 'bronze', 'copper', 'tin']
    expect(metals).toContain(result.pieces[0].metal)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatGradeLabel', () => {
  it('formats masterwork', () => {
    expect(formatGradeLabel('masterwork')).toContain('masterwork')
  })
  it('formats pig-iron', () => {
    expect(formatGradeLabel('pig-iron')).toContain('pig-iron')
  })
})

describe('formatMetalLabel', () => {
  it('formats steel', () => {
    expect(formatMetalLabel('steel')).toContain('steel')
  })
  it('formats tin', () => {
    expect(formatMetalLabel('tin')).toContain('tin')
  })
})

describe('formatWeldQualityLabel', () => {
  it('formats seamless', () => {
    expect(formatWeldQualityLabel('seamless')).toContain('seamless')
  })
  it('formats broken', () => {
    expect(formatWeldQualityLabel('broken')).toContain('broken')
  })
})

describe('formatHeatGradeLabel', () => {
  it('formats properly-hardened', () => {
    expect(formatHeatGradeLabel('properly-hardened')).toContain('properly-hardened')
  })
  it('formats brittle', () => {
    expect(formatHeatGradeLabel('brittle')).toContain('brittle')
  })
})

describe('formatOverallForgeLabel', () => {
  it('formats legendary', () => {
    expect(formatOverallForgeLabel('legendary')).toContain('legendary')
  })
})

describe('formatCraftsmanshipGauge', () => {
  it('formats gauge', () => {
    const g = formatCraftsmanshipGauge(75)
    expect(g).toContain('75')
    expect(g).toContain('\u2588')
  })

  it('formats zero gauge', () => {
    const g = formatCraftsmanshipGauge(0)
    expect(g).toContain('0')
  })

  it('formats full gauge', () => {
    const g = formatCraftsmanshipGauge(100)
    expect(g).toContain('100')
  })
})

describe('formatPieces', () => {
  it('formats empty pieces', () => {
    expect(formatPieces([])).toContain('No files')
  })

  it('formats piece list', () => {
    const pieces: ForgedPiece[] = [{
      file: 'a.ts', temper: 80, welds: [], hammerMarks: [],
      heatTreatment: { errorHandling: 50, edgeCaseCoverage: 50, inputValidation: 50, failureRecovery: 50, grade: 'annealed' },
      polish: 70, craftsmanship: 80, grade: 'fine', metal: 'steel',
    }]
    const result = formatPieces(pieces)
    expect(result).toContain('a.ts')
    expect(result).toContain('fine')
  })
})

describe('formatWelds', () => {
  it('formats empty welds', () => {
    expect(formatWelds([])).toContain('No welds')
  })

  it('formats weld list', () => {
    const welds: ForgeWeld[] = [{
      location: 'a.ts::add', type: 'function-boundary', quality: 'clean', strength: 80,
      description: 'Function add()', issue: null,
    }]
    const result = formatWelds(welds)
    expect(result).toContain('clean')
    expect(result).toContain('a.ts::add')
  })

  it('shows issue when present', () => {
    const welds: ForgeWeld[] = [{
      location: 'a.ts::bad', type: 'function-boundary', quality: 'broken', strength: 15,
      description: 'Function bad()', issue: 'Weak boundary',
    }]
    const result = formatWelds(welds)
    expect(result).toContain('Weak boundary')
  })
})

describe('formatHammerMarks', () => {
  it('formats empty marks', () => {
    expect(formatHammerMarks([])).toContain('No hammer marks')
  })

  it('formats mark list', () => {
    const marks: HammerMark[] = [
      { type: 'skilled', location: 5, evidence: 'Typed signature', impact: 'positive' },
    ]
    const result = formatHammerMarks(marks)
    expect(result).toContain('skilled')
    expect(result).toContain('Typed signature')
  })
})

describe('formatHeatTreatment', () => {
  it('formats all fields', () => {
    const ht: HeatTreatment = {
      errorHandling: 60, edgeCaseCoverage: 40, inputValidation: 30, failureRecovery: 50, grade: 'annealed',
    }
    const result = formatHeatTreatment(ht)
    expect(result).toContain('60')
    expect(result).toContain('40')
    expect(result).toContain('annealed')
  })
})

describe('formatForgeStats', () => {
  it('formats stats with all fields', () => {
    const stats: ForgeStats = {
      totalPieces: 5, avgTemper: 70, avgCraftsmanship: 75, avgPolish: 68,
      masterworkCount: 1, pigIronCount: 1, totalWelds: 10, seamlessWelds: 6,
      brokenWelds: 1, totalHammerMarks: 15, skilledMarks: 8, rushedMarks: 3,
      avgHeatTreatment: 55, properlyHardened: 2, brittle: 1,
      overallForge: 'journeyman', forgeQuality: 68, anvilIndex: 72,
    }
    const result = formatForgeStats(stats)
    expect(result).toContain('Forge Analysis')
    expect(result).toContain('5')
    expect(result).toContain('journeyman')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recs', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendation list', () => {
    const result = formatRecommendations(['Fix X', 'Remove Y'])
    expect(result).toContain('1.')
    expect(result).toContain('Fix X')
  })
})

describe('formatForgeTable', () => {
  it('formats full table', () => {
    const result = buildForgeResult(['a.ts'], [CLEAN_FN], {})
    const table = formatForgeTable(result)
    expect(table).toContain('Forge Analysis')
    expect(table).toContain('Forged Pieces')
  })
})

describe('formatForgeJson', () => {
  it('formats valid JSON', () => {
    const result = buildForgeResult(['a.ts'], [CLEAN_FN], {})
    const json = formatForgeJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed.pieces).toHaveLength(1)
  })
})
