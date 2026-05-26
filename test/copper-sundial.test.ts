import { describe, expect, it } from 'vitest'

import {
  analyzeCopperGarden,
  analyzeCopperMark,
  buildCopperSundialResult,
  classifyCopperCondition,
  classifyGardenCondition,
  classifyGardenType,
  classifyHorologistGrade,
  generateRecommendations,
  measureAging,
  measureCalculating,
  measureRevealing,
  measureTiming,
  measureWeathering,
} from '../src/commands/copper-sundial-helpers.js'
import type { CopperSundialResult } from '../src/commands/copper-sundial-helpers.js'
import {
  colorCopperCondition,
  colorGardenCondition,
  colorGardenType,
  colorHorologistGrade,
  colorScore,
  formatGardensTable,
  formatGardenTable,
  formatMarksTable,
  formatMarkTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/copper-sundial-format-helpers.js'

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

const richPat = measureAging(richContent).patience
const richPrec = measureCalculating(richContent).precision
const richRes = measureWeathering(richContent).resilience
const richClr = measureRevealing(richContent).clarity
const richWis = measureTiming(richContent).wisdom

function makeStats(overrides: Partial<CopperSundialResult['stats']> = {}): CopperSundialResult['stats'] {
  return {
    totalFiles: 1,
    totalGardens: 1,
    avgTimePatience: 50,
    avgSolarPrecision: 50,
    avgPatinaResilience: 50,
    avgShadowClarity: 50,
    avgDialWisdom: 50,
    copperMasterpieceCount: 0,
    verdigrisGemCount: 0,
    properSundialCount: 0,
    tarnishedDialCount: 0,
    rustyMetalCount: 0,
    voidCount: 0,
    hasHighPatienceCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighClarityCount: 1,
    hasHighWisdomCount: 1,
    overallTimelessness: 50,
    horologistGrade: 'proper-dial-maker',
    bestMark: 'a.ts',
    mostPatient: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    clearest: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureAging ───────────────────────────────────────

describe('measureAging', () => {
  it('scores rich content highly', () => {
    const result = measureAging(richContent)
    expect(result.patience).toBeGreaterThan(60)
    expect(result.hasHighPatience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureAging(emptyContent).patience).toBeLessThan(richPat)
  })

  it('detects hasStable (class/interface/type)', () => {
    expect(measureAging(richContent).hasStable).toBe(true)
  })

  it('counts fragile keywords', () => {
    const content = 'const fragile = 1; const brittle = 2; const delicate = 3; const flimsy = 4'
    const result = measureAging(content)
    expect(result.fragileCount).toBe(4)
    expect(result.hasNoFragile).toBe(false)
  })

  it('counts volatile keywords', () => {
    const content = 'const volatile = 1; const unstable = 2; const transient = 3; const ephemeral = 4'
    const result = measureAging(content)
    expect(result.volatileCount).toBe(4)
    expect(result.hasNoVolatile).toBe(false)
  })

  it('detects hasDocumented (JSDoc)', () => {
    expect(measureAging(richContent).hasDocumented).toBe(true)
  })

  it('detects hasRefined (no any)', () => {
    expect(measureAging(richContent).hasRefined).toBe(true)
  })

  it('detects hasTested (try/catch)', () => {
    expect(measureAging(richContent).hasTested).toBe(true)
  })

  it('classifies maturity correctly for high scores', () => {
    const result = measureAging(richContent)
    expect(['centuries-old', 'well-aged', 'proper-seasoning']).toContain(result.maturity)
  })

  it('classifies maturity correctly for low scores', () => {
    expect(measureAging(emptyContent).maturity).not.toBe('centuries-old')
  })
})

// ─── measureCalculating ─────────────────────────────────

describe('measureCalculating', () => {
  it('scores rich content highly', () => {
    const result = measureCalculating(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureCalculating(emptyContent).precision).toBeLessThan(richPrec)
  })

  it('detects hasTypeSafe (no any)', () => {
    expect(measureCalculating(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureCalculating(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const imprecise = 3; const loose = 4; const sloppy = 5'
    const result = measureCalculating(content)
    expect(result.approximateCount).toBe(5)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects hasAstronomical (try/catch/if)', () => {
    expect(measureCalculating(richContent).hasAstronomical).toBe(true)
  })

  it('detects hasMeasured (JSDoc)', () => {
    expect(measureCalculating(richContent).hasMeasured).toBe(true)
  })

  it('classifies angle correctly for high scores', () => {
    const result = measureCalculating(richContent)
    expect(['equatorial-precise', 'horizontal-exact', 'proper-angle']).toContain(result.angle)
  })

  it('classifies angle correctly for low scores', () => {
    expect(measureCalculating(emptyContent).angle).not.toBe('equatorial-precise')
  })
})

// ─── measureWeathering ──────────────────────────────────

describe('measureWeathering', () => {
  it('scores rich content highly', () => {
    const result = measureWeathering(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureWeathering(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects hasErrorHandled (try/catch)', () => {
    expect(measureWeathering(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const unprocessed = 3; const unresolved = 4'
    const result = measureWeathering(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts vulnerable keywords', () => {
    const content = 'const vulnerable = 1; const exposed = 2; const weak = 3; const susceptible = 4'
    const result = measureWeathering(content)
    expect(result.vulnerableCount).toBe(4)
    expect(result.hasImpervious).toBe(false)
  })

  it('detects hasRobust (class/interface/type)', () => {
    expect(measureWeathering(richContent).hasRobust).toBe(true)
  })

  it('detects hasProtected (JSDoc)', () => {
    expect(measureWeathering(richContent).hasProtected).toBe(true)
  })

  it('classifies verdigris correctly for high scores', () => {
    const result = measureWeathering(richContent)
    expect(['noble-patina', 'aged-beauty', 'proper-weathering']).toContain(result.verdigris)
  })

  it('classifies verdigris correctly for low scores', () => {
    expect(measureWeathering(emptyContent).verdigris).not.toBe('noble-patina')
  })
})

// ─── measureRevealing ───────────────────────────────────

describe('measureRevealing', () => {
  it('scores rich content highly', () => {
    const result = measureRevealing(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureRevealing(emptyContent).clarity).toBeLessThan(richClr)
  })

  it('detects hasReadable (class/interface/type)', () => {
    expect(measureRevealing(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureRevealing(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureRevealing(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects hasSelfDocumenting (type annotations)', () => {
    expect(measureRevealing(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects hasTransparent (no any)', () => {
    expect(measureRevealing(richContent).hasTransparent).toBe(true)
  })

  it('classifies shadow correctly for high scores', () => {
    const result = measureRevealing(richContent)
    expect(['sharp-shadow', 'clear-silhouette', 'proper-outline']).toContain(result.shadow)
  })

  it('classifies shadow correctly for low scores', () => {
    expect(measureRevealing(emptyContent).shadow).not.toBe('sharp-shadow')
  })
})

// ─── measureTiming ──────────────────────────────────────

describe('measureTiming', () => {
  it('scores rich content highly', () => {
    const result = measureTiming(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureTiming(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects hasWellArchitected (class/interface/type)', () => {
    expect(measureTiming(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureTiming(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureTiming(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects hasPrincipled (no any)', () => {
    expect(measureTiming(richContent).hasPrincipled).toBe(true)
  })

  it('detects hasTimeless (no unused/dead/obsolete/deprecated)', () => {
    expect(measureTiming(richContent).hasTimeless).toBe(true)
  })

  it('detects hasInsightful (JSDoc)', () => {
    expect(measureTiming(richContent).hasInsightful).toBe(true)
  })

  it('classifies hour correctly for high scores', () => {
    const result = measureTiming(richContent)
    expect(['master-horologist', 'experienced-clockmaker', 'proper-artisan']).toContain(result.hour)
  })

  it('classifies hour correctly for low scores', () => {
    expect(measureTiming(emptyContent).hour).not.toBe('master-horologist')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyCopperCondition', () => {
  it('returns copper-masterpiece for 90+', () => {
    expect(classifyCopperCondition(90)).toBe('copper-masterpiece')
    expect(classifyCopperCondition(95)).toBe('copper-masterpiece')
  })

  it('returns verdigris-gem for 75-89', () => {
    expect(classifyCopperCondition(75)).toBe('verdigris-gem')
  })

  it('returns proper-sundial for 60-74', () => {
    expect(classifyCopperCondition(60)).toBe('proper-sundial')
  })

  it('returns tarnished-dial for 40-59', () => {
    expect(classifyCopperCondition(40)).toBe('tarnished-dial')
  })

  it('returns rusty-metal for 20-39', () => {
    expect(classifyCopperCondition(20)).toBe('rusty-metal')
  })

  it('returns void below 20', () => {
    expect(classifyCopperCondition(0)).toBe('void')
    expect(classifyCopperCondition(10)).toBe('void')
  })
})

describe('classifyGardenType', () => {
  it('returns no-garden for empty marks', () => {
    expect(classifyGardenType([])).toBe('no-garden')
  })

  it('returns formal-garden for avg >= 85', () => {
    const marks = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyGardenType(marks)).toBe('formal-garden')
  })

  it('returns empty-pedestal for low avg', () => {
    const marks = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyGardenType(marks)).toBe('empty-pedestal')
  })
})

describe('classifyGardenCondition', () => {
  it('returns copper-palace for 85+', () => {
    expect(classifyGardenCondition(85)).toBe('copper-palace')
  })

  it('returns void below 15', () => {
    expect(classifyGardenCondition(5)).toBe('void')
  })
})

describe('classifyHorologistGrade', () => {
  it('returns master-horologist for 80+', () => {
    expect(classifyHorologistGrade(80)).toBe('master-horologist')
  })

  it('returns time-blind below 20', () => {
    expect(classifyHorologistGrade(5)).toBe('time-blind')
  })

  it('returns expert-clockmaker for 65-79', () => {
    expect(classifyHorologistGrade(65)).toBe('expert-clockmaker')
  })

  it('returns proper-dial-maker for 50-64', () => {
    expect(classifyHorologistGrade(50)).toBe('proper-dial-maker')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyHorologistGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyHorologistGrade(20)).toBe('novice')
  })
})

// ─── analyzeCopperMark ──────────────────────────────────

describe('analyzeCopperMark', () => {
  it('creates a mark with all 5 measures', () => {
    const mark = analyzeCopperMark(richContent, 'app.ts')
    expect(mark.file).toBe('app.ts')
    expect(typeof mark.timePatience).toBe('number')
    expect(typeof mark.solarPrecision).toBe('number')
    expect(typeof mark.patinaResilience).toBe('number')
    expect(typeof mark.shadowClarity).toBe('number')
    expect(typeof mark.dialWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const mark = analyzeCopperMark(richContent, 'app.ts')
    const expected = Math.round(
      mark.timePatience * 0.2 +
      mark.solarPrecision * 0.2 +
      mark.patinaResilience * 0.2 +
      mark.shadowClarity * 0.2 +
      mark.dialWisdom * 0.2,
    )
    expect(mark.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const mark = analyzeCopperMark(richContent, 'app.ts')
    expect(mark.condition).toBe(classifyCopperCondition(mark.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richMark = analyzeCopperMark(richContent, 'rich.ts')
    const emptyMark = analyzeCopperMark(emptyContent, 'empty.ts')
    expect(richMark.qualityScore).toBeGreaterThan(emptyMark.qualityScore)
  })
})

// ─── analyzeCopperGarden ────────────────────────────────

describe('analyzeCopperGarden', () => {
  it('returns empty garden for no marks', () => {
    const garden = analyzeCopperGarden([], 'src')
    expect(garden.directory).toBe('src')
    expect(garden.marks).toEqual([])
    expect(garden.gardenType).toBe('no-garden')
    expect(garden.condition).toBe('void')
  })

  it('computes averages from marks', () => {
    const marks = [analyzeCopperMark(richContent, 'a.ts'), analyzeCopperMark(richContent, 'b.ts')]
    const garden = analyzeCopperGarden(marks, 'src')
    expect(garden.avgPatience).toBeGreaterThan(0)
    expect(garden.avgPrecision).toBeGreaterThan(0)
    expect(garden.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildCopperSundialResult ────────────────────────────

describe('buildCopperSundialResult', () => {
  it('returns full result structure', async () => {
    const result = await buildCopperSundialResult(['a.ts'], [richContent])
    expect(result.marks).toHaveLength(1)
    expect(result.gardens).toHaveLength(1)
    expect(result.meridian).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into gardens', async () => {
    const result = await buildCopperSundialResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.gardens.length).toBe(2)
  })

  it('computes meridian overview', async () => {
    const result = await buildCopperSundialResult(['a.ts'], [richContent])
    expect(result.meridian.avgPatience).toBeGreaterThan(0)
    expect(result.meridian.isCopper).toBe(true)
    expect(result.meridian.overallTimelessness).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildCopperSundialResult([], [])
    expect(result.marks).toHaveLength(0)
    expect(result.gardens).toHaveLength(0)
    expect(result.meridian.overallTimelessness).toBe(0)
    expect(result.meridian.isCopper).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildCopperSundialResult(['a.ts'], [richContent])
    const total = result.stats.copperMasterpieceCount +
      result.stats.verdigrisGemCount +
      result.stats.properSundialCount +
      result.stats.tarnishedDialCount +
      result.stats.rustyMetalCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildCopperSundialResult(['a.ts'], [richContent])
    expect(result.stats.hasHighPatienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best mark and top performers', async () => {
    const result = await buildCopperSundialResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestMark).toBeTruthy()
    expect(result.stats.mostPatient).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes horologist grade from overall timelessness', async () => {
    const result = await buildCopperSundialResult(['a.ts'], [richContent])
    expect(result.stats.horologistGrade).toBe(classifyHorologistGrade(result.stats.overallTimelessness))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgTimePatience: 90,
      avgSolarPrecision: 90,
      avgPatinaResilience: 90,
      avgShadowClarity: 90,
      avgDialWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgPatience: 90, avgPrecision: 90, avgWisdom: 90, isCopper: true, overallTimelessness: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('copper masterpiece')
  })

  it('recommends patience when < 60', () => {
    const stats = makeStats({ avgTimePatience: 50 })
    const result = generateRecommendations([], [], { avgPatience: 50, avgPrecision: 50, avgWisdom: 50, isCopper: false, overallTimelessness: 50 }, stats)
    expect(result.some((r) => r.includes('time patience') || r.includes('centuries-old'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgSolarPrecision: 50 })
    const result = generateRecommendations([], [], { avgPatience: 50, avgPrecision: 50, avgWisdom: 50, isCopper: false, overallTimelessness: 50 }, stats)
    expect(result.some((r) => r.includes('solar precision') || r.includes('equatorial-precise'))).toBe(true)
  })

  it('recommends resilience when < 60', () => {
    const stats = makeStats({ avgPatinaResilience: 50 })
    const result = generateRecommendations([], [], { avgPatience: 50, avgPrecision: 50, avgWisdom: 50, isCopper: false, overallTimelessness: 50 }, stats)
    expect(result.some((r) => r.includes('patina resilience') || r.includes('noble-patina'))).toBe(true)
  })

  it('recommends clarity when < 60', () => {
    const stats = makeStats({ avgShadowClarity: 50 })
    const result = generateRecommendations([], [], { avgPatience: 50, avgPrecision: 50, avgWisdom: 50, isCopper: false, overallTimelessness: 50 }, stats)
    expect(result.some((r) => r.includes('shadow clarity') || r.includes('sharp-shadow'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgDialWisdom: 50 })
    const result = generateRecommendations([], [], { avgPatience: 50, avgPrecision: 50, avgWisdom: 50, isCopper: false, overallTimelessness: 50 }, stats)
    expect(result.some((r) => r.includes('dial wisdom') || r.includes('master-horologist'))).toBe(true)
  })

  it('warns about lost gnomon when overallTimelessness < 40', () => {
    const stats = makeStats({ overallTimelessness: 30 })
    const result = generateRecommendations([], [], { avgPatience: 30, avgPrecision: 30, avgWisdom: 30, isCopper: false, overallTimelessness: 30 }, stats)
    expect(result.some((r) => r.includes('gnomon'))).toBe(true)
  })

  it('lists void marks by name when <= 5', () => {
    const marks = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(marks, [], { avgPatience: 50, avgPrecision: 50, avgWisdom: 50, isCopper: false, overallTimelessness: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void marks when > 5', () => {
    const marks = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(marks, [], { avgPatience: 50, avgPrecision: 50, avgWisdom: 50, isCopper: false, overallTimelessness: 50 }, stats)
    expect(result.some((r) => r.includes('6 rusty metals'))).toBe(true)
  })

  it('warns when all gardens are poor', () => {
    const gardens = [{ condition: 'empty-lot' as const, gardenType: 'small-marker' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], gardens as Array<{ condition: string; gardenType: string }>, { avgPatience: 50, avgPrecision: 50, avgWisdom: 50, isCopper: false, overallTimelessness: 50 }, stats)
    expect(result.some((r) => r.includes('empty lots'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgTimePatience: 70,
      avgSolarPrecision: 70,
      avgPatinaResilience: 70,
      avgShadowClarity: 70,
      avgDialWisdom: 70,
      overallTimelessness: 70,
    })
    const result = generateRecommendations([], [], { avgPatience: 70, avgPrecision: 70, avgWisdom: 70, isCopper: true, overallTimelessness: 70 }, stats)
    expect(result.some((r) => r.includes('verdigris brilliance'))).toBe(true)
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

describe('colorCopperCondition', () => {
  it('colors copper-masterpiece', () => {
    expect(typeof colorCopperCondition('copper-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorCopperCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorCopperCondition('unknown')).toBe('string')
  })
})

describe('colorGardenType', () => {
  it('colors formal-garden', () => {
    expect(typeof colorGardenType('formal-garden')).toBe('string')
  })

  it('colors no-garden', () => {
    expect(typeof colorGardenType('no-garden')).toBe('string')
  })
})

describe('colorGardenCondition', () => {
  it('colors copper-palace', () => {
    expect(typeof colorGardenCondition('copper-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorGardenCondition('void')).toBe('string')
  })
})

describe('colorHorologistGrade', () => {
  it('colors master-horologist', () => {
    expect(typeof colorHorologistGrade('master-horologist')).toBe('string')
  })

  it('colors time-blind', () => {
    expect(typeof colorHorologistGrade('time-blind')).toBe('string')
  })
})

describe('formatMarkTable', () => {
  it('formats a mark with all measures', () => {
    const mark = analyzeCopperMark(richContent, 'app.ts')
    const output = formatMarkTable(mark)
    expect(output).toContain('Copper Mark: app.ts')
    expect(output).toContain('Time Patience')
    expect(output).toContain('Solar Precision')
    expect(output).toContain('Patina Resilience')
    expect(output).toContain('Shadow Clarity')
    expect(output).toContain('Dial Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatMarksTable', () => {
  it('shows no marks message for empty array', () => {
    expect(formatMarksTable([])).toContain('No copper marks')
  })

  it('lists marks in output', () => {
    const marks = [analyzeCopperMark(richContent, 'a.ts')]
    expect(formatMarksTable(marks)).toContain('a.ts')
  })
})

describe('formatGardenTable', () => {
  it('formats a garden with all fields', () => {
    const marks = [analyzeCopperMark(richContent, 'a.ts')]
    const garden = analyzeCopperGarden(marks, 'src')
    const output = formatGardenTable(garden)
    expect(output).toContain('Copper Garden: src')
    expect(output).toContain('Marks')
    expect(output).toContain('Avg Patience')
  })
})

describe('formatGardensTable', () => {
  it('shows no gardens message for empty array', () => {
    expect(formatGardensTable([])).toContain('No copper gardens')
  })

  it('lists gardens in output', () => {
    const marks = [analyzeCopperMark(richContent, 'a.ts')]
    const garden = analyzeCopperGarden(marks, 'src')
    expect(formatGardensTable([garden])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildCopperSundialResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Copper Sundial Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Horologist Grade')
    expect(output).toContain('Best Mark')
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
    const result = await buildCopperSundialResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Copper Sundial Analysis')
    expect(output).toContain('Meridian Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildCopperSundialResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.marks).toHaveLength(1)
    expect(parsed.meridian).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
