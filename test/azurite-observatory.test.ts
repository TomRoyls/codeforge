import { describe, expect, it } from 'vitest'

import {
  analyzeAzuriteDome,
  analyzeAzuriteReading,
  buildAzuriteObservatoryResult,
  classifyAstronomerGrade,
  classifyAzuriteCondition,
  classifyDomeCondition,
  classifyDomeType,
  generateRecommendations,
  measureCalculating,
  measureIlluminating,
  measurePreserving,
  measureUnderstanding,
  measureWeathering,
} from '../src/commands/azurite-observatory-helpers.js'
import type { AzuriteObservatoryResult } from '../src/commands/azurite-observatory-helpers.js'
import {
  colorAstronomerGrade,
  colorAzuriteCondition,
  colorDomeCondition,
  colorDomeType,
  colorScore,
  formatDomesTable,
  formatDomeTable,
  formatReadingsTable,
  formatReadingTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/azurite-observatory-format-helpers.js'

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

const richClr = measureIlluminating(richContent).clarity
const richPrec = measureCalculating(richContent).precision
const richEnd = measurePreserving(richContent).endurance
const richRes = measureWeathering(richContent).resilience
const richWis = measureUnderstanding(richContent).wisdom

function makeStats(overrides: Partial<AzuriteObservatoryResult['stats']> = {}): AzuriteObservatoryResult['stats'] {
  return {
    totalFiles: 1,
    totalDomes: 1,
    avgDeepBlueClarity: 50,
    avgAstronomicalPrecision: 50,
    avgMineralEndurance: 50,
    avgSkyResilience: 50,
    avgCosmicWisdom: 50,
    azuriteMasterpieceCount: 0,
    celestialBlueCount: 0,
    properAzuriteCount: 0,
    fadedBlueCount: 0,
    whiteStoneCount: 0,
    voidCount: 0,
    hasHighClarityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighEnduranceCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallDepth: 50,
    astronomerGrade: 'proper-observer',
    bestReading: 'a.ts',
    clearest: 'a.ts',
    mostPrecise: 'a.ts',
    mostEnduring: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureIlluminating ────────────────────────────────

describe('measureIlluminating', () => {
  it('scores rich content highly', () => {
    const result = measureIlluminating(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureIlluminating(emptyContent).clarity).toBeLessThan(richClr)
  })

  it('detects hasReadable (class/interface/type)', () => {
    expect(measureIlluminating(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureIlluminating(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureIlluminating(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects hasSelfDocumenting (type annotations)', () => {
    expect(measureIlluminating(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects hasTransparent (no any)', () => {
    expect(measureIlluminating(richContent).hasTransparent).toBe(true)
  })

  it('detects hasOpen (JSDoc)', () => {
    expect(measureIlluminating(richContent).hasOpen).toBe(true)
  })

  it('classifies night correctly for high scores', () => {
    const result = measureIlluminating(richContent)
    expect(['midnight-blue', 'deep-sky', 'proper-blue']).toContain(result.night)
  })

  it('classifies night correctly for low scores', () => {
    expect(measureIlluminating(emptyContent).night).not.toBe('midnight-blue')
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

  it('detects hasExact (class/interface/type)', () => {
    expect(measureCalculating(richContent).hasExact).toBe(true)
  })

  it('detects hasCrisp (JSDoc)', () => {
    expect(measureCalculating(richContent).hasCrisp).toBe(true)
  })

  it('detects hasComputed (try/catch/if)', () => {
    expect(measureCalculating(richContent).hasComputed).toBe(true)
  })

  it('detects hasAstronomical (function/arrow/return)', () => {
    expect(measureCalculating(richContent).hasAstronomical).toBe(true)
  })

  it('classifies orbit correctly for high scores', () => {
    const result = measureCalculating(richContent)
    expect(['perfect-ephemeris', 'precise-calculation', 'proper-measurement']).toContain(result.orbit)
  })

  it('classifies orbit correctly for low scores', () => {
    expect(measureCalculating(emptyContent).orbit).not.toBe('perfect-ephemeris')
  })
})

// ─── measurePreserving ──────────────────────────────────

describe('measurePreserving', () => {
  it('scores rich content highly', () => {
    const result = measurePreserving(richContent)
    expect(result.endurance).toBeGreaterThan(60)
    expect(result.hasHighEndurance).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measurePreserving(emptyContent).endurance).toBeLessThan(richEnd)
  })

  it('detects hasClean (class/interface/type)', () => {
    expect(measurePreserving(richContent).hasClean).toBe(true)
  })

  it('counts hack keywords', () => {
    const content = 'const hack = 1; const bypass = 2; const duct.tape = 3'
    const result = measurePreserving(content)
    expect(result.hackCount).toBe(3)
    expect(result.hasNoHack).toBe(false)
  })

  it('counts workaround keywords', () => {
    const content = 'const workaround = 1; const tempfix = 2; const quickfix = 3'
    const result = measurePreserving(content)
    expect(result.workaroundCount).toBe(3)
    expect(result.hasNoWorkaround).toBe(false)
  })

  it('detects hasNoTodo (no TODO/FIXME)', () => {
    expect(measurePreserving(richContent).hasNoTodo).toBe(true)
  })

  it('detects hasNoDebugCode (no console.log/debugger)', () => {
    expect(measurePreserving(richContent).hasNoDebugCode).toBe(true)
  })

  it('detects hasPristine (type annotations)', () => {
    expect(measurePreserving(richContent).hasPristine).toBe(true)
  })

  it('detects hasTimeless (JSDoc)', () => {
    expect(measurePreserving(richContent).hasTimeless).toBe(true)
  })

  it('classifies pigment correctly for high scores', () => {
    const result = measurePreserving(richContent)
    expect(['eternal-blue', 'lasting-azure', 'proper-color']).toContain(result.pigment)
  })

  it('classifies pigment correctly for low scores', () => {
    expect(measurePreserving(emptyContent).pigment).not.toBe('eternal-blue')
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

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureWeathering(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects hasRobust (class/interface/type)', () => {
    expect(measureWeathering(richContent).hasRobust).toBe(true)
  })

  it('detects hasDurable (no any)', () => {
    expect(measureWeathering(richContent).hasDurable).toBe(true)
  })

  it('detects hasImpervious (async/await/Promise)', () => {
    expect(measureWeathering(richContent).hasImpervious).toBe(true)
  })

  it('classifies storm correctly for high scores', () => {
    const result = measureWeathering(richContent)
    expect(['clear-sky', 'weatherproof', 'proper-shelter']).toContain(result.storm)
  })

  it('classifies storm correctly for low scores', () => {
    expect(measureWeathering(emptyContent).storm).not.toBe('clear-sky')
  })
})

// ─── measureUnderstanding ───────────────────────────────

describe('measureUnderstanding', () => {
  it('scores rich content highly', () => {
    const result = measureUnderstanding(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureUnderstanding(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects hasWellArchitected (class/interface/type)', () => {
    expect(measureUnderstanding(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureUnderstanding(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureUnderstanding(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects hasPrincipled (no any)', () => {
    expect(measureUnderstanding(richContent).hasPrincipled).toBe(true)
  })

  it('detects hasInsightful (JSDoc)', () => {
    expect(measureUnderstanding(richContent).hasInsightful).toBe(true)
  })

  it('detects hasComprehensive (try/catch/if)', () => {
    expect(measureUnderstanding(richContent).hasComprehensive).toBe(true)
  })

  it('detects hasTranscendent (function/arrow/return)', () => {
    expect(measureUnderstanding(richContent).hasTranscendent).toBe(true)
  })

  it('classifies cosmos correctly for high scores', () => {
    const result = measureUnderstanding(richContent)
    expect(['celestial-sage', 'star-scholar', 'proper-astronomer']).toContain(result.cosmos)
  })

  it('classifies cosmos correctly for low scores', () => {
    expect(measureUnderstanding(emptyContent).cosmos).not.toBe('celestial-sage')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyAzuriteCondition', () => {
  it('returns azurite-masterpiece for 90+', () => {
    expect(classifyAzuriteCondition(90)).toBe('azurite-masterpiece')
    expect(classifyAzuriteCondition(95)).toBe('azurite-masterpiece')
  })

  it('returns celestial-blue for 75-89', () => {
    expect(classifyAzuriteCondition(75)).toBe('celestial-blue')
  })

  it('returns proper-azurite for 60-74', () => {
    expect(classifyAzuriteCondition(60)).toBe('proper-azurite')
  })

  it('returns faded-blue for 40-59', () => {
    expect(classifyAzuriteCondition(40)).toBe('faded-blue')
  })

  it('returns white-stone for 20-39', () => {
    expect(classifyAzuriteCondition(20)).toBe('white-stone')
  })

  it('returns void below 20', () => {
    expect(classifyAzuriteCondition(0)).toBe('void')
    expect(classifyAzuriteCondition(10)).toBe('void')
  })
})

describe('classifyDomeType', () => {
  it('returns no-dome for empty readings', () => {
    expect(classifyDomeType([])).toBe('no-dome')
  })

  it('returns grand-observatory for avg >= 85', () => {
    const readings = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyDomeType(readings)).toBe('grand-observatory')
  })

  it('returns empty-pedestal for low avg', () => {
    const readings = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyDomeType(readings)).toBe('empty-pedestal')
  })
})

describe('classifyDomeCondition', () => {
  it('returns azurite-palace for 85+', () => {
    expect(classifyDomeCondition(85)).toBe('azurite-palace')
  })

  it('returns void below 15', () => {
    expect(classifyDomeCondition(5)).toBe('void')
  })
})

describe('classifyAstronomerGrade', () => {
  it('returns master-astronomer for 80+', () => {
    expect(classifyAstronomerGrade(80)).toBe('master-astronomer')
  })

  it('returns blind-folded below 20', () => {
    expect(classifyAstronomerGrade(5)).toBe('blind-folded')
  })

  it('returns observatory-director for 65-79', () => {
    expect(classifyAstronomerGrade(65)).toBe('observatory-director')
  })

  it('returns proper-observer for 50-64', () => {
    expect(classifyAstronomerGrade(50)).toBe('proper-observer')
  })

  it('returns amateur for 35-49', () => {
    expect(classifyAstronomerGrade(35)).toBe('amateur')
  })

  it('returns novice for 20-34', () => {
    expect(classifyAstronomerGrade(20)).toBe('novice')
  })
})

// ─── analyzeAzuriteReading ──────────────────────────────

describe('analyzeAzuriteReading', () => {
  it('creates a reading with all 5 measures', () => {
    const reading = analyzeAzuriteReading(richContent, 'app.ts')
    expect(reading.file).toBe('app.ts')
    expect(typeof reading.deepBlueClarity).toBe('number')
    expect(typeof reading.astronomicalPrecision).toBe('number')
    expect(typeof reading.mineralEndurance).toBe('number')
    expect(typeof reading.skyResilience).toBe('number')
    expect(typeof reading.cosmicWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const reading = analyzeAzuriteReading(richContent, 'app.ts')
    const expected = Math.round(
      reading.deepBlueClarity * 0.2 +
      reading.astronomicalPrecision * 0.2 +
      reading.mineralEndurance * 0.2 +
      reading.skyResilience * 0.2 +
      reading.cosmicWisdom * 0.2,
    )
    expect(reading.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const reading = analyzeAzuriteReading(richContent, 'app.ts')
    expect(reading.condition).toBe(classifyAzuriteCondition(reading.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richReading = analyzeAzuriteReading(richContent, 'rich.ts')
    const emptyReading = analyzeAzuriteReading(emptyContent, 'empty.ts')
    expect(richReading.qualityScore).toBeGreaterThan(emptyReading.qualityScore)
  })

  it('scores rich content higher than minimal', () => {
    const richReading = analyzeAzuriteReading(richContent, 'rich.ts')
    const minReading = analyzeAzuriteReading(minimalContent, 'min.ts')
    expect(richReading.qualityScore).toBeGreaterThan(minReading.qualityScore)
  })
})

// ─── analyzeAzuriteDome ─────────────────────────────────

describe('analyzeAzuriteDome', () => {
  it('returns empty dome for no readings', () => {
    const dome = analyzeAzuriteDome([], 'src')
    expect(dome.directory).toBe('src')
    expect(dome.readings).toEqual([])
    expect(dome.domeType).toBe('no-dome')
    expect(dome.condition).toBe('void')
  })

  it('computes averages from readings', () => {
    const readings = [analyzeAzuriteReading(richContent, 'a.ts'), analyzeAzuriteReading(richContent, 'b.ts')]
    const dome = analyzeAzuriteDome(readings, 'src')
    expect(dome.avgClarity).toBeGreaterThan(0)
    expect(dome.avgPrecision).toBeGreaterThan(0)
    expect(dome.avgWisdom).toBeGreaterThan(0)
  })

  it('counts azurite masterpieces', () => {
    const reading = analyzeAzuriteReading(richContent, 'a.ts')
    const dome = analyzeAzuriteDome([reading], 'src')
    expect(typeof dome.azuriteMasterpieceCount).toBe('number')
  })
})

// ─── buildAzuriteObservatoryResult ──────────────────────

describe('buildAzuriteObservatoryResult', () => {
  it('returns full result structure', async () => {
    const result = await buildAzuriteObservatoryResult(['a.ts'], [richContent])
    expect(result.readings).toHaveLength(1)
    expect(result.domes).toHaveLength(1)
    expect(result.sky).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into domes', async () => {
    const result = await buildAzuriteObservatoryResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.domes.length).toBe(2)
  })

  it('computes sky overview', async () => {
    const result = await buildAzuriteObservatoryResult(['a.ts'], [richContent])
    expect(result.sky.avgClarity).toBeGreaterThan(0)
    expect(result.sky.isAzurite).toBe(true)
    expect(result.sky.overallDepth).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildAzuriteObservatoryResult([], [])
    expect(result.readings).toHaveLength(0)
    expect(result.domes).toHaveLength(0)
    expect(result.sky.overallDepth).toBe(0)
    expect(result.sky.isAzurite).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildAzuriteObservatoryResult(['a.ts'], [richContent])
    const total = result.stats.azuriteMasterpieceCount +
      result.stats.celestialBlueCount +
      result.stats.properAzuriteCount +
      result.stats.fadedBlueCount +
      result.stats.whiteStoneCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildAzuriteObservatoryResult(['a.ts'], [richContent])
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighEnduranceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best reading and top performers', async () => {
    const result = await buildAzuriteObservatoryResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestReading).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostEnduring).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes astronomer grade from overall depth', async () => {
    const result = await buildAzuriteObservatoryResult(['a.ts'], [richContent])
    expect(result.stats.astronomerGrade).toBe(classifyAstronomerGrade(result.stats.overallDepth))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgDeepBlueClarity: 90,
      avgAstronomicalPrecision: 90,
      avgMineralEndurance: 90,
      avgSkyResilience: 90,
      avgCosmicWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 90, avgWisdom: 90, isAzurite: true, overallDepth: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('azurite masterpiece')
  })

  it('recommends deep-blue clarity when < 60', () => {
    const stats = makeStats({ avgDeepBlueClarity: 50 })
    const result = generateRecommendations([], [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isAzurite: false, overallDepth: 50 }, stats)
    expect(result.some((r) => r.includes('blue clarity') || r.includes('midnight-blue'))).toBe(true)
  })

  it('recommends astronomical precision when < 60', () => {
    const stats = makeStats({ avgAstronomicalPrecision: 50 })
    const result = generateRecommendations([], [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isAzurite: false, overallDepth: 50 }, stats)
    expect(result.some((r) => r.includes('astronomical precision') || r.includes('perfect-ephemeris'))).toBe(true)
  })

  it('recommends mineral endurance when < 60', () => {
    const stats = makeStats({ avgMineralEndurance: 50 })
    const result = generateRecommendations([], [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isAzurite: false, overallDepth: 50 }, stats)
    expect(result.some((r) => r.includes('mineral endurance') || r.includes('eternal-blue'))).toBe(true)
  })

  it('recommends sky resilience when < 60', () => {
    const stats = makeStats({ avgSkyResilience: 50 })
    const result = generateRecommendations([], [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isAzurite: false, overallDepth: 50 }, stats)
    expect(result.some((r) => r.includes('sky resilience') || r.includes('clear-sky'))).toBe(true)
  })

  it('recommends cosmic wisdom when < 60', () => {
    const stats = makeStats({ avgCosmicWisdom: 50 })
    const result = generateRecommendations([], [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isAzurite: false, overallDepth: 50 }, stats)
    expect(result.some((r) => r.includes('cosmic wisdom') || r.includes('celestial-sage'))).toBe(true)
  })

  it('warns about crumbled observatory when overallDepth < 40', () => {
    const stats = makeStats({ overallDepth: 30 })
    const result = generateRecommendations([], [], { avgClarity: 30, avgPrecision: 30, avgWisdom: 30, isAzurite: false, overallDepth: 30 }, stats)
    expect(result.some((r) => r.includes('crumbled'))).toBe(true)
  })

  it('lists void readings by name when <= 5', () => {
    const readings = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(readings, [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isAzurite: false, overallDepth: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void readings when > 5', () => {
    const readings = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(readings, [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isAzurite: false, overallDepth: 50 }, stats)
    expect(result.some((r) => r.includes('6 white stones'))).toBe(true)
  })

  it('warns when all domes are poor', () => {
    const domes = [{ condition: 'empty-roof' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], domes as Array<{ condition: string }>, { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isAzurite: false, overallDepth: 50 }, stats)
    expect(result.some((r) => r.includes('empty roofs'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgDeepBlueClarity: 70,
      avgAstronomicalPrecision: 70,
      avgMineralEndurance: 70,
      avgSkyResilience: 70,
      avgCosmicWisdom: 70,
      overallDepth: 70,
    })
    const result = generateRecommendations([], [], { avgClarity: 70, avgPrecision: 70, avgWisdom: 70, isAzurite: true, overallDepth: 70 }, stats)
    expect(result.some((r) => r.includes('deep-blue clarity'))).toBe(true)
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

describe('colorAzuriteCondition', () => {
  it('colors azurite-masterpiece', () => {
    expect(typeof colorAzuriteCondition('azurite-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorAzuriteCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorAzuriteCondition('unknown')).toBe('string')
  })
})

describe('colorDomeType', () => {
  it('colors grand-observatory', () => {
    expect(typeof colorDomeType('grand-observatory')).toBe('string')
  })

  it('colors no-dome', () => {
    expect(typeof colorDomeType('no-dome')).toBe('string')
  })
})

describe('colorDomeCondition', () => {
  it('colors azurite-palace', () => {
    expect(typeof colorDomeCondition('azurite-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorDomeCondition('void')).toBe('string')
  })
})

describe('colorAstronomerGrade', () => {
  it('colors master-astronomer', () => {
    expect(typeof colorAstronomerGrade('master-astronomer')).toBe('string')
  })

  it('colors blind-folded', () => {
    expect(typeof colorAstronomerGrade('blind-folded')).toBe('string')
  })
})

describe('formatReadingTable', () => {
  it('formats a reading with all measures', () => {
    const reading = analyzeAzuriteReading(richContent, 'app.ts')
    const output = formatReadingTable(reading)
    expect(output).toContain('Azurite Reading: app.ts')
    expect(output).toContain('Deep-Blue Clarity')
    expect(output).toContain('Astronomical Precision')
    expect(output).toContain('Mineral Endurance')
    expect(output).toContain('Sky Resilience')
    expect(output).toContain('Cosmic Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatReadingsTable', () => {
  it('shows no readings message for empty array', () => {
    expect(formatReadingsTable([])).toContain('No azurite readings')
  })

  it('lists readings in output', () => {
    const readings = [analyzeAzuriteReading(richContent, 'a.ts')]
    expect(formatReadingsTable(readings)).toContain('a.ts')
  })
})

describe('formatDomeTable', () => {
  it('formats a dome with all fields', () => {
    const readings = [analyzeAzuriteReading(richContent, 'a.ts')]
    const dome = analyzeAzuriteDome(readings, 'src')
    const output = formatDomeTable(dome)
    expect(output).toContain('Azurite Dome: src')
    expect(output).toContain('Readings')
    expect(output).toContain('Avg Clarity')
  })
})

describe('formatDomesTable', () => {
  it('shows no domes message for empty array', () => {
    expect(formatDomesTable([])).toContain('No azurite domes')
  })

  it('lists domes in output', () => {
    const readings = [analyzeAzuriteReading(richContent, 'a.ts')]
    const dome = analyzeAzuriteDome(readings, 'src')
    expect(formatDomesTable([dome])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildAzuriteObservatoryResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Azurite Observatory Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Astronomer Grade')
    expect(output).toContain('Best Reading')
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
    const result = await buildAzuriteObservatoryResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Azurite Observatory Analysis')
    expect(output).toContain('Sky Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildAzuriteObservatoryResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.readings).toHaveLength(1)
    expect(parsed.sky).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
