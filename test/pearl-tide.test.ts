import { describe, expect, it } from 'vitest'

import {
  analyzePearlBed,
  analyzePearlLuster,
  buildPearlTideResult,
  classifyBedCondition,
  classifyBedType,
  classifyDiverGrade,
  classifyPearlCondition,
  generateRecommendations,
  measureFathoming,
  measureFlowing,
  measureGleaming,
  measureLayering,
  measureShimmering,
} from '../src/commands/pearl-tide-helpers.js'
import type { PearlTideResult } from '../src/commands/pearl-tide-helpers.js'
import {
  colorBedCondition,
  colorBedType,
  colorDiverGrade,
  colorPearlCondition,
  colorScore,
  formatBedsTable,
  formatBedTable,
  formatLustersTable,
  formatLusterTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/pearl-tide-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const richContent = `import { readFileSync } from 'node:fs'
import type { Result } from './types.js'

/** Documentation */
export interface Config {
  readonly name: string
  private?: boolean
}

export type Options = Record<string, unknown>

export class Analyzer<T> {
  async analyze(input: string): Promise<Result> {
    try {
      const result = readFileSync(input, 'utf8')
      if (result === 'test') {
        return JSON.parse(result) as Result
      }
      return {} as Result
    } catch (err) {
      throw new Error('fail')
    }
  }
}

export const defaultConfig: Options = { name: 'test' }
`

const emptyContent = ''
const minimalContent = 'const x = 1'

const richPur = measureGleaming(richContent).purity
const richWis = measureFathoming(richContent).wisdom
const richPrec = measureLayering(richContent).precision
const richRes = measureFlowing(richContent).resilience
const richClr = measureShimmering(richContent).clarity

function makeStats(overrides: Partial<PearlTideResult['stats']> = {}): PearlTideResult['stats'] {
  return {
    totalFiles: 1,
    totalBeds: 1,
    avgLustrousPurity: 50,
    avgOceanWisdom: 50,
    avgNacrePrecision: 50,
    avgTidalResilience: 50,
    avgIridescentClarity: 50,
    pearlMasterpieceCount: 0,
    gemQualityCount: 0,
    properPearlCount: 0,
    baroqueShapeCount: 0,
    seedPearlCount: 0,
    voidCount: 0,
    hasHighPurityCount: 1,
    hasHighWisdomCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighClarityCount: 1,
    overallLuster: 50,
    diverGrade: 'proper-diver',
    bestLuster: 'a.ts',
    purest: 'a.ts',
    wisest: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    clearest: 'a.ts',
    ...overrides,
  }
}

// ─── measureGleaming ────────────────────────────────────

describe('measureGleaming', () => {
  it('scores rich content highly', () => {
    const result = measureGleaming(richContent)
    expect(result.purity).toBeGreaterThan(60)
    expect(result.hasHighPurity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureGleaming(emptyContent).purity).toBeLessThan(richPur)
  })

  it('detects hasClean (class/interface/type)', () => {
    expect(measureGleaming(richContent).hasClean).toBe(true)
  })

  it('counts hack keywords', () => {
    const content = 'const hack = 1; const todo = 2; const fixme = 3; const xxx = 4'
    const result = measureGleaming(content)
    expect(result.hackCount).toBe(4)
    expect(result.hasNoHack).toBe(false)
  })

  it('counts workaround keywords', () => {
    const content = 'const workaround = 1; const kludge = 2; const temp = 3; const temporary = 4'
    const result = measureGleaming(content)
    expect(result.workaroundCount).toBe(4)
    expect(result.hasNoWorkaround).toBe(false)
  })

  it('detects hasPristine (import/export)', () => {
    expect(measureGleaming(richContent).hasPristine).toBe(true)
  })

  it('detects hasUnpolluted (JSDoc)', () => {
    expect(measureGleaming(richContent).hasUnpolluted).toBe(true)
  })

  it('classifies luster correctly for high scores', () => {
    const result = measureGleaming(richContent)
    expect(['south-sea-pearl', 'akoya-grade', 'proper-luster']).toContain(result.luster)
  })

  it('classifies luster correctly for low scores', () => {
    expect(measureGleaming(emptyContent).luster).not.toBe('south-sea-pearl')
  })
})

// ─── measureFathoming ───────────────────────────────────

describe('measureFathoming', () => {
  it('scores rich content highly', () => {
    const result = measureFathoming(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureFathoming(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects hasWellArchitected (class/interface/type)', () => {
    expect(measureFathoming(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureFathoming(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureFathoming(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects hasPrincipled (no any)', () => {
    expect(measureFathoming(richContent).hasPrincipled).toBe(true)
  })

  it('detects hasInsightful (JSDoc)', () => {
    expect(measureFathoming(richContent).hasInsightful).toBe(true)
  })

  it('classifies depth correctly for high scores', () => {
    const result = measureFathoming(richContent)
    expect(['mariana-depth', 'deep-current', 'proper-depth']).toContain(result.depth)
  })

  it('classifies depth correctly for low scores', () => {
    expect(measureFathoming(emptyContent).depth).not.toBe('mariana-depth')
  })
})

// ─── measureLayering ────────────────────────────────────

describe('measureLayering', () => {
  it('scores rich content highly', () => {
    const result = measureLayering(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureLayering(emptyContent).precision).toBeLessThan(richPrec)
  })

  it('detects hasTypeSafe (no any)', () => {
    expect(measureLayering(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureLayering(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const imprecise = 3; const loose = 4; const sloppy = 5'
    const result = measureLayering(content)
    expect(result.approximateCount).toBe(5)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects hasCrisp (JSDoc)', () => {
    expect(measureLayering(richContent).hasCrisp).toBe(true)
  })

  it('classifies coat correctly for high scores', () => {
    const result = measureLayering(richContent)
    expect(['thousand-layers', 'fine-nacre', 'proper-coating']).toContain(result.coat)
  })

  it('classifies coat correctly for low scores', () => {
    expect(measureLayering(emptyContent).coat).not.toBe('thousand-layers')
  })
})

// ─── measureFlowing ─────────────────────────────────────

describe('measureFlowing', () => {
  it('scores rich content highly', () => {
    const result = measureFlowing(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureFlowing(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects hasErrorHandled (try/catch)', () => {
    expect(measureFlowing(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const unprocessed = 3; const unresolved = 4'
    const result = measureFlowing(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureFlowing(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects hasRobust (class/interface/type)', () => {
    expect(measureFlowing(richContent).hasRobust).toBe(true)
  })

  it('classifies tide correctly for high scores', () => {
    const result = measureFlowing(richContent)
    expect(['eternal-tide', 'steady-current', 'proper-flow']).toContain(result.tide)
  })

  it('classifies tide correctly for low scores', () => {
    expect(measureFlowing(emptyContent).tide).not.toBe('eternal-tide')
  })
})

// ─── measureShimmering ──────────────────────────────────

describe('measureShimmering', () => {
  it('scores rich content highly', () => {
    const result = measureShimmering(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureShimmering(emptyContent).clarity).toBeLessThan(richClr)
  })

  it('detects hasReadable (class/interface/type)', () => {
    expect(measureShimmering(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureShimmering(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureShimmering(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects hasSelfDocumenting (type annotations)', () => {
    expect(measureShimmering(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects hasObvious (JSDoc)', () => {
    expect(measureShimmering(richContent).hasObvious).toBe(true)
  })

  it('classifies rainbow correctly for high scores', () => {
    const result = measureShimmering(richContent)
    expect(['full-spectrum', 'rich-overtone', 'proper-orient']).toContain(result.rainbow)
  })

  it('classifies rainbow correctly for low scores', () => {
    expect(measureShimmering(emptyContent).rainbow).not.toBe('full-spectrum')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyPearlCondition', () => {
  it('returns pearl-masterpiece for 90+', () => {
    expect(classifyPearlCondition(90)).toBe('pearl-masterpiece')
    expect(classifyPearlCondition(95)).toBe('pearl-masterpiece')
  })

  it('returns gem-quality for 75-89', () => {
    expect(classifyPearlCondition(75)).toBe('gem-quality')
  })

  it('returns proper-pearl for 60-74', () => {
    expect(classifyPearlCondition(60)).toBe('proper-pearl')
  })

  it('returns baroque-shape for 40-59', () => {
    expect(classifyPearlCondition(40)).toBe('baroque-shape')
  })

  it('returns seed-pearl for 20-39', () => {
    expect(classifyPearlCondition(20)).toBe('seed-pearl')
  })

  it('returns void below 20', () => {
    expect(classifyPearlCondition(0)).toBe('void')
    expect(classifyPearlCondition(10)).toBe('void')
  })
})

describe('classifyBedType', () => {
  it('returns no-bed for empty lusters', () => {
    expect(classifyBedType([])).toBe('no-bed')
  })

  it('returns pearl-fishery for avg >= 85', () => {
    const lusters = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyBedType(lusters)).toBe('pearl-fishery')
  })

  it('returns empty-shore for low avg', () => {
    const lusters = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyBedType(lusters)).toBe('empty-shore')
  })
})

describe('classifyBedCondition', () => {
  it('returns pearl-palace for 85+', () => {
    expect(classifyBedCondition(85)).toBe('pearl-palace')
  })

  it('returns void below 15', () => {
    expect(classifyBedCondition(5)).toBe('void')
  })
})

describe('classifyDiverGrade', () => {
  it('returns master-pearl-diver for 80+', () => {
    expect(classifyDiverGrade(80)).toBe('master-pearl-diver')
  })

  it('returns shore-collector below 20', () => {
    expect(classifyDiverGrade(5)).toBe('shore-collector')
  })

  it('returns experienced-fisher for 65-79', () => {
    expect(classifyDiverGrade(65)).toBe('experienced-fisher')
  })

  it('returns proper-diver for 50-64', () => {
    expect(classifyDiverGrade(50)).toBe('proper-diver')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyDiverGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyDiverGrade(20)).toBe('novice')
  })
})

// ─── analyzePearlLuster ─────────────────────────────────

describe('analyzePearlLuster', () => {
  it('creates a luster with all 5 measures', () => {
    const luster = analyzePearlLuster(richContent, 'app.ts')
    expect(luster.file).toBe('app.ts')
    expect(typeof luster.lustrousPurity).toBe('number')
    expect(typeof luster.oceanWisdom).toBe('number')
    expect(typeof luster.nacrePrecision).toBe('number')
    expect(typeof luster.tidalResilience).toBe('number')
    expect(typeof luster.iridescentClarity).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const luster = analyzePearlLuster(richContent, 'app.ts')
    const expected = Math.round(
      luster.lustrousPurity * 0.2 +
      luster.oceanWisdom * 0.2 +
      luster.nacrePrecision * 0.2 +
      luster.tidalResilience * 0.2 +
      luster.iridescentClarity * 0.2,
    )
    expect(luster.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const luster = analyzePearlLuster(richContent, 'app.ts')
    expect(luster.condition).toBe(classifyPearlCondition(luster.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richLuster = analyzePearlLuster(richContent, 'rich.ts')
    const emptyLuster = analyzePearlLuster(emptyContent, 'empty.ts')
    expect(richLuster.qualityScore).toBeGreaterThan(emptyLuster.qualityScore)
  })
})

// ─── analyzePearlBed ────────────────────────────────────

describe('analyzePearlBed', () => {
  it('returns empty bed for no lusters', () => {
    const bed = analyzePearlBed([], 'src')
    expect(bed.directory).toBe('src')
    expect(bed.lusters).toEqual([])
    expect(bed.bedType).toBe('no-bed')
    expect(bed.condition).toBe('void')
  })

  it('computes averages from lusters', () => {
    const lusters = [analyzePearlLuster(richContent, 'a.ts'), analyzePearlLuster(richContent, 'b.ts')]
    const bed = analyzePearlBed(lusters, 'src')
    expect(bed.avgPurity).toBeGreaterThan(0)
    expect(bed.avgPrecision).toBeGreaterThan(0)
    expect(bed.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildPearlTideResult ───────────────────────────────

describe('buildPearlTideResult', () => {
  it('returns full result structure', async () => {
    const result = await buildPearlTideResult(['a.ts'], [richContent])
    expect(result.lusters).toHaveLength(1)
    expect(result.beds).toHaveLength(1)
    expect(result.ocean).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into beds', async () => {
    const result = await buildPearlTideResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.beds.length).toBe(2)
  })

  it('computes ocean overview', async () => {
    const result = await buildPearlTideResult(['a.ts'], [richContent])
    expect(result.ocean.avgPurity).toBeGreaterThan(0)
    expect(result.ocean.isPearl).toBe(true)
    expect(result.ocean.overallLuster).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildPearlTideResult([], [])
    expect(result.lusters).toHaveLength(0)
    expect(result.beds).toHaveLength(0)
    expect(result.ocean.overallLuster).toBe(0)
    expect(result.ocean.isPearl).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildPearlTideResult(['a.ts'], [richContent])
    const total = result.stats.pearlMasterpieceCount +
      result.stats.gemQualityCount +
      result.stats.properPearlCount +
      result.stats.baroqueShapeCount +
      result.stats.seedPearlCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildPearlTideResult(['a.ts'], [richContent])
    expect(result.stats.hasHighPurityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best luster and top performers', async () => {
    const result = await buildPearlTideResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestLuster).toBeTruthy()
    expect(result.stats.purest).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
  })

  it('computes diver grade from overall luster', async () => {
    const result = await buildPearlTideResult(['a.ts'], [richContent])
    expect(result.stats.diverGrade).toBe(classifyDiverGrade(result.stats.overallLuster))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgLustrousPurity: 90,
      avgOceanWisdom: 90,
      avgNacrePrecision: 90,
      avgTidalResilience: 90,
      avgIridescentClarity: 90,
    })
    const result = generateRecommendations([], [], { avgPurity: 90, avgPrecision: 90, avgWisdom: 90, isPearl: true, overallLuster: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('south-sea pearl')
  })

  it('recommends purity when < 60', () => {
    const stats = makeStats({ avgLustrousPurity: 50 })
    const result = generateRecommendations([], [], { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isPearl: false, overallLuster: 50 }, stats)
    expect(result.some((r) => r.includes('lustrous purity') || r.includes('south-sea-pearl'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgOceanWisdom: 50 })
    const result = generateRecommendations([], [], { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isPearl: false, overallLuster: 50 }, stats)
    expect(result.some((r) => r.includes('ocean wisdom') || r.includes('mariana-depth'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgNacrePrecision: 50 })
    const result = generateRecommendations([], [], { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isPearl: false, overallLuster: 50 }, stats)
    expect(result.some((r) => r.includes('nacre precision') || r.includes('thousand-layers'))).toBe(true)
  })

  it('recommends resilience when < 60', () => {
    const stats = makeStats({ avgTidalResilience: 50 })
    const result = generateRecommendations([], [], { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isPearl: false, overallLuster: 50 }, stats)
    expect(result.some((r) => r.includes('tidal resilience') || r.includes('eternal-tide'))).toBe(true)
  })

  it('recommends clarity when < 60', () => {
    const stats = makeStats({ avgIridescentClarity: 50 })
    const result = generateRecommendations([], [], { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isPearl: false, overallLuster: 50 }, stats)
    expect(result.some((r) => r.includes('iridescent clarity') || r.includes('full-spectrum'))).toBe(true)
  })

  it('warns about receded tide when overallLuster < 40', () => {
    const stats = makeStats({ overallLuster: 30 })
    const result = generateRecommendations([], [], { avgPurity: 30, avgPrecision: 30, avgWisdom: 30, isPearl: false, overallLuster: 30 }, stats)
    expect(result.some((r) => r.includes('receded'))).toBe(true)
  })

  it('lists void lusters by name when <= 5', () => {
    const lusters = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(lusters, [], { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isPearl: false, overallLuster: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void lusters when > 5', () => {
    const lusters = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(lusters, [], { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isPearl: false, overallLuster: 50 }, stats)
    expect(result.some((r) => r.includes('6 seed pearls'))).toBe(true)
  })

  it('warns when all beds are poor', () => {
    const beds = [{ condition: 'empty-beach' as const, bedType: 'small-colony' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], beds as Array<{ condition: string; bedType: string }>, { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isPearl: false, overallLuster: 50 }, stats)
    expect(result.some((r) => r.includes('empty beaches'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgLustrousPurity: 70,
      avgOceanWisdom: 70,
      avgNacrePrecision: 70,
      avgTidalResilience: 70,
      avgIridescentClarity: 70,
      overallLuster: 70,
    })
    const result = generateRecommendations([], [], { avgPurity: 70, avgPrecision: 70, avgWisdom: 70, isPearl: true, overallLuster: 70 }, stats)
    expect(result.some((r) => r.includes('oceanic brilliance'))).toBe(true)
  })
})

// ─── Format helpers ──────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns different colors for different ranges', () => {
    expect(colorScore(95)).not.toBe(colorScore(10))
  })
})

describe('colorPearlCondition', () => {
  it('colors pearl-masterpiece', () => {
    expect(typeof colorPearlCondition('pearl-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorPearlCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorPearlCondition('unknown')).toBe('string')
  })
})

describe('colorBedType', () => {
  it('colors pearl-fishery', () => {
    expect(typeof colorBedType('pearl-fishery')).toBe('string')
  })

  it('colors no-bed', () => {
    expect(typeof colorBedType('no-bed')).toBe('string')
  })
})

describe('colorBedCondition', () => {
  it('colors pearl-palace', () => {
    expect(typeof colorBedCondition('pearl-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorBedCondition('void')).toBe('string')
  })
})

describe('colorDiverGrade', () => {
  it('colors master-pearl-diver', () => {
    expect(typeof colorDiverGrade('master-pearl-diver')).toBe('string')
  })

  it('colors shore-collector', () => {
    expect(typeof colorDiverGrade('shore-collector')).toBe('string')
  })
})

describe('formatLusterTable', () => {
  it('formats a luster with all measures', () => {
    const luster = analyzePearlLuster(richContent, 'app.ts')
    const output = formatLusterTable(luster)
    expect(output).toContain('Pearl Luster: app.ts')
    expect(output).toContain('Lustrous Purity')
    expect(output).toContain('Ocean Wisdom')
    expect(output).toContain('Nacre Precision')
    expect(output).toContain('Tidal Resilience')
    expect(output).toContain('Iridescent Clarity')
    expect(output).toContain('Quality Score')
  })
})

describe('formatLustersTable', () => {
  it('shows no lusters message for empty array', () => {
    expect(formatLustersTable([])).toContain('No pearl lusters')
  })

  it('lists lusters in output', () => {
    const lusters = [analyzePearlLuster(richContent, 'a.ts')]
    expect(formatLustersTable(lusters)).toContain('a.ts')
  })
})

describe('formatBedTable', () => {
  it('formats a bed with all fields', () => {
    const lusters = [analyzePearlLuster(richContent, 'a.ts')]
    const bed = analyzePearlBed(lusters, 'src')
    const output = formatBedTable(bed)
    expect(output).toContain('Pearl Bed: src')
    expect(output).toContain('Lusters')
    expect(output).toContain('Avg Purity')
  })
})

describe('formatBedsTable', () => {
  it('shows no beds message for empty array', () => {
    expect(formatBedsTable([])).toContain('No pearl beds')
  })

  it('lists beds in output', () => {
    const lusters = [analyzePearlLuster(richContent, 'a.ts')]
    const bed = analyzePearlBed(lusters, 'src')
    expect(formatBedsTable([bed])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildPearlTideResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Pearl Tide Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Diver Grade')
    expect(output).toContain('Best Luster')
  })
})

describe('formatRecommendations', () => {
  it('shows no recommendations message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('lists recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Fix Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildPearlTideResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Pearl Tide Analysis')
    expect(output).toContain('Ocean Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildPearlTideResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.lusters).toHaveLength(1)
    expect(parsed.ocean).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
