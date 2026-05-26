import { describe, expect, it } from 'vitest'

import {
  analyzeEmeraldBay,
  analyzeEmeraldSwell,
  buildEmeraldTideResult,
  classifyBayCondition,
  classifyBayType,
  classifyNavigatorGrade,
  classifySwellCondition,
  generateRecommendations,
  measureCleansing,
  measureFlowing,
  measureMeeting,
  measurePulsing,
  measureUnderstanding,
} from '../src/commands/emerald-wave-helpers.js'
import type { EmeraldTideResult } from '../src/commands/emerald-wave-helpers.js'
import {
  colorBayCondition,
  colorBayType,
  colorNavigatorGrade,
  colorScore,
  colorSwellCondition,
  formatBaysTable,
  formatBayTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
  formatSwellsTable,
  formatSwellTable,
} from '../src/commands/emerald-wave-format-helpers.js'

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

const richWave = measureFlowing(richContent).wave
const richRhythm = measurePulsing(richContent).rhythm
const richPurity = measureCleansing(richContent).purity
const richPrecision = measureMeeting(richContent).precision
const richWisdom = measureUnderstanding(richContent).wisdom

function makeStats(overrides: Partial<EmeraldTideResult['stats']> = {}): EmeraldTideResult['stats'] {
  return {
    totalFiles: 1,
    totalBays: 1,
    avgGreenWave: 50,
    avgTidalRhythm: 50,
    avgOceanPurity: 50,
    avgCoastalPrecision: 50,
    avgTideWisdom: 50,
    emeraldMasterpieceCount: 0,
    tidalGemCount: 0,
    properWaveCount: 0,
    murkyWaterCount: 0,
    drySandCount: 0,
    voidCount: 0,
    hasHighWaveCount: 1,
    hasHighRhythmCount: 1,
    hasHighPurityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighWisdomCount: 1,
    overallFlow: 50,
    navigatorGrade: 'proper-sailor',
    bestSwell: 'a.ts',
    mostFlowing: 'a.ts',
    mostRhythmic: 'a.ts',
    purest: 'a.ts',
    mostPrecise: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureFlowing ─────────────────────────────────────

describe('measureFlowing', () => {
  it('scores rich content highly', () => {
    const result = measureFlowing(richContent)
    expect(result.wave).toBeGreaterThan(60)
    expect(result.hasHighWave).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureFlowing(emptyContent).wave).toBeLessThan(richWave)
  })

  it('detects dynamic (async/await/Promise)', () => {
    expect(measureFlowing(richContent).hasDynamic).toBe(true)
  })

  it('counts static keywords', () => {
    const content = 'const hardcoded = 1; const magic-number = 2; const literal = 3; const rigid = 4'
    const result = measureFlowing(content)
    expect(result.staticCount).toBe(4)
    expect(result.hasNoStatic).toBe(false)
  })

  it('counts dead keywords', () => {
    const content = 'const dead = 1; const unused = 2; const obsolete = 3; const deprecated = 4'
    const result = measureFlowing(content)
    expect(result.deadCount).toBe(4)
    expect(result.hasNoDead).toBe(false)
  })

  it('detects flowing (function/arrow/return)', () => {
    expect(measureFlowing(richContent).hasFlowing).toBe(true)
  })

  it('detects alive (class/interface/type)', () => {
    expect(measureFlowing(richContent).hasAlive).toBe(true)
  })

  it('detects organic (import/export)', () => {
    expect(measureFlowing(richContent).hasOrganic).toBe(true)
  })

  it('classifies surf correctly for high scores', () => {
    const result = measureFlowing(richContent)
    expect(['tidal-bore', 'strong-swell', 'proper-wave']).toContain(result.surf)
  })

  it('classifies surf correctly for low scores', () => {
    expect(measureFlowing(emptyContent).surf).not.toBe('tidal-bore')
  })
})

// ─── measurePulsing ─────────────────────────────────────

describe('measurePulsing', () => {
  it('scores rich content highly', () => {
    const result = measurePulsing(richContent)
    expect(result.rhythm).toBeGreaterThan(60)
    expect(result.hasHighRhythm).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measurePulsing(emptyContent).rhythm).toBeLessThan(richRhythm)
  })

  it('detects consistent (import/export)', () => {
    expect(measurePulsing(richContent).hasConsistent).toBe(true)
  })

  it('counts erratic keywords', () => {
    const content = 'const erratic = 1; const random = 2; const arbitrary = 3; const inconsistent = 4; const flaky = 5'
    const result = measurePulsing(content)
    expect(result.erraticCount).toBe(5)
    expect(result.hasNoErratic).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measurePulsing(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects tested (if/return)', () => {
    expect(measurePulsing(richContent).hasTested).toBe(true)
  })

  it('detects stable (no hack/workaround)', () => {
    expect(measurePulsing(richContent).hasStable).toBe(true)
  })

  it('classifies beat correctly for high scores', () => {
    const result = measurePulsing(richContent)
    expect(['perfect-tide', 'steady-pulse', 'proper-rhythm']).toContain(result.beat)
  })

  it('classifies beat correctly for low scores', () => {
    expect(measurePulsing(emptyContent).beat).not.toBe('perfect-tide')
  })
})

// ─── measureCleansing ───────────────────────────────────

describe('measureCleansing', () => {
  it('scores rich content highly', () => {
    const result = measureCleansing(richContent)
    expect(result.purity).toBeGreaterThan(60)
    expect(result.hasHighPurity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureCleansing(emptyContent).purity).toBeLessThan(richPurity)
  })

  it('counts hack keywords', () => {
    const content = 'const hack = 1; const hacky = 2; const hacked = 3'
    const result = measureCleansing(content)
    expect(result.hackCount).toBe(3)
    expect(result.hasNoHack).toBe(false)
  })

  it('counts workaround keywords', () => {
    const content = 'const workaround = 1; const quickfix = 2; const band-aid = 3; const bandaid = 4'
    const result = measureCleansing(content)
    expect(result.workaroundCount).toBe(4)
    expect(result.hasNoWorkaround).toBe(false)
  })

  it('detects clean (no any)', () => {
    expect(measureCleansing(richContent).hasClean).toBe(true)
  })

  it('detects pristine (class/interface/type)', () => {
    expect(measureCleansing(richContent).hasPristine).toBe(true)
  })

  it('detects no-todo', () => {
    expect(measureCleansing(richContent).hasNoTodo).toBe(true)
  })

  it('detects no-debug-code', () => {
    expect(measureCleansing(richContent).hasNoDebugCode).toBe(true)
  })

  it('classifies water correctly for high scores', () => {
    const result = measureCleansing(richContent)
    expect(['crystal-clear', 'tropical-blue', 'proper-clarity']).toContain(result.water)
  })

  it('classifies water correctly for low scores', () => {
    expect(measureCleansing(emptyContent).water).not.toBe('crystal-clear')
  })
})

// ─── measureMeeting ─────────────────────────────────────

describe('measureMeeting', () => {
  it('scores rich content highly', () => {
    const result = measureMeeting(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureMeeting(emptyContent).precision).toBeLessThan(richPrecision)
  })

  it('detects type-safe (no any)', () => {
    expect(measureMeeting(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureMeeting(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3; const imprecise = 4'
    const result = measureMeeting(content)
    expect(result.approximateCount).toBe(4)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects exact (class/interface/type)', () => {
    expect(measureMeeting(richContent).hasExact).toBe(true)
  })

  it('detects sharp (import/export)', () => {
    expect(measureMeeting(richContent).hasSharp).toBe(true)
  })

  it('classifies shoreline correctly for high scores', () => {
    const result = measureMeeting(richContent)
    expect(['geometric-coast', 'smooth-beach', 'proper-shore']).toContain(result.shoreline)
  })

  it('classifies shoreline correctly for low scores', () => {
    expect(measureMeeting(emptyContent).shoreline).not.toBe('geometric-coast')
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
    expect(measureUnderstanding(emptyContent).wisdom).toBeLessThan(richWisdom)
  })

  it('detects well-architected (class/interface/type)', () => {
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

  it('detects principled (no any)', () => {
    expect(measureUnderstanding(richContent).hasPrincipled).toBe(true)
  })

  it('detects seasoned (const/readonly)', () => {
    expect(measureUnderstanding(richContent).hasSeasoned).toBe(true)
  })

  it('classifies moon correctly for high scores', () => {
    const result = measureUnderstanding(richContent)
    expect(['tidal-master', 'experienced-mariner', 'proper-sailor']).toContain(result.moon)
  })

  it('classifies moon correctly for low scores', () => {
    expect(measureUnderstanding(emptyContent).moon).not.toBe('tidal-master')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifySwellCondition', () => {
  it('returns emerald-masterpiece for 90+', () => {
    expect(classifySwellCondition(90)).toBe('emerald-masterpiece')
    expect(classifySwellCondition(95)).toBe('emerald-masterpiece')
  })

  it('returns tidal-gem for 75-89', () => {
    expect(classifySwellCondition(75)).toBe('tidal-gem')
  })

  it('returns proper-wave for 60-74', () => {
    expect(classifySwellCondition(60)).toBe('proper-wave')
  })

  it('returns murky-water for 40-59', () => {
    expect(classifySwellCondition(40)).toBe('murky-water')
  })

  it('returns dry-sand for 20-39', () => {
    expect(classifySwellCondition(20)).toBe('dry-sand')
  })

  it('returns void below 20', () => {
    expect(classifySwellCondition(0)).toBe('void')
    expect(classifySwellCondition(10)).toBe('void')
  })
})

describe('classifyBayType', () => {
  it('returns no-bay for empty swells', () => {
    expect(classifyBayType([])).toBe('no-bay')
  })

  it('returns emerald-bay for avg >= 85', () => {
    const swells = [{ qualityScore: 90 } as any]
    expect(classifyBayType(swells)).toBe('emerald-bay')
  })

  it('returns dry-beach for low avg', () => {
    const swells = [{ qualityScore: 10 } as any]
    expect(classifyBayType(swells)).toBe('dry-beach')
  })
})

describe('classifyBayCondition', () => {
  it('returns ocean-palace for 85+', () => {
    expect(classifyBayCondition(85)).toBe('ocean-palace')
  })

  it('returns void below 15', () => {
    expect(classifyBayCondition(5)).toBe('void')
  })
})

describe('classifyNavigatorGrade', () => {
  it('returns tidal-master for 80+', () => {
    expect(classifyNavigatorGrade(80)).toBe('tidal-master')
  })

  it('returns beachcomber below 20', () => {
    expect(classifyNavigatorGrade(5)).toBe('beachcomber')
  })

  it('returns experienced-captain for 65-79', () => {
    expect(classifyNavigatorGrade(65)).toBe('experienced-captain')
  })

  it('returns proper-sailor for 50-64', () => {
    expect(classifyNavigatorGrade(50)).toBe('proper-sailor')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyNavigatorGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyNavigatorGrade(20)).toBe('novice')
  })
})

// ─── analyzeEmeraldSwell ────────────────────────────────

describe('analyzeEmeraldSwell', () => {
  it('creates a swell with all 5 measures', () => {
    const swell = analyzeEmeraldSwell(richContent, 'app.ts')
    expect(swell.file).toBe('app.ts')
    expect(typeof swell.greenWave).toBe('number')
    expect(typeof swell.tidalRhythm).toBe('number')
    expect(typeof swell.oceanPurity).toBe('number')
    expect(typeof swell.coastalPrecision).toBe('number')
    expect(typeof swell.tideWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const swell = analyzeEmeraldSwell(richContent, 'app.ts')
    const expected = Math.round(
      swell.greenWave * 0.2 +
      swell.tidalRhythm * 0.2 +
      swell.oceanPurity * 0.2 +
      swell.coastalPrecision * 0.2 +
      swell.tideWisdom * 0.2,
    )
    expect(swell.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const swell = analyzeEmeraldSwell(richContent, 'app.ts')
    expect(swell.condition).toBe(classifySwellCondition(swell.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richSwell = analyzeEmeraldSwell(richContent, 'rich.ts')
    const emptySwell = analyzeEmeraldSwell(emptyContent, 'empty.ts')
    expect(richSwell.qualityScore).toBeGreaterThan(emptySwell.qualityScore)
  })
})

// ─── analyzeEmeraldBay ──────────────────────────────────

describe('analyzeEmeraldBay', () => {
  it('returns empty bay for no swells', () => {
    const bay = analyzeEmeraldBay([], 'src')
    expect(bay.directory).toBe('src')
    expect(bay.swells).toEqual([])
    expect(bay.bayType).toBe('no-bay')
    expect(bay.condition).toBe('void')
  })

  it('computes averages from swells', () => {
    const swells = [analyzeEmeraldSwell(richContent, 'a.ts'), analyzeEmeraldSwell(richContent, 'b.ts')]
    const bay = analyzeEmeraldBay(swells, 'src')
    expect(bay.avgWave).toBeGreaterThan(0)
    expect(bay.avgPrecision).toBeGreaterThan(0)
    expect(bay.avgWisdom).toBeGreaterThan(0)
  })

  it('counts emerald masterpieces', () => {
    const swells = [analyzeEmeraldSwell(richContent, 'a.ts')]
    const bay = analyzeEmeraldBay(swells, 'src')
    expect(typeof bay.emeraldMasterpieceCount).toBe('number')
    expect(typeof bay.voidCount).toBe('number')
  })
})

// ─── buildEmeraldTideResult ─────────────────────────────

describe('buildEmeraldTideResult', () => {
  it('returns full result structure', async () => {
    const result = await buildEmeraldTideResult(['a.ts'], [richContent])
    expect(result.swells).toHaveLength(1)
    expect(result.bays).toHaveLength(1)
    expect(result.ocean).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into bays', async () => {
    const result = await buildEmeraldTideResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.bays.length).toBe(2)
  })

  it('computes ocean overview', async () => {
    const result = await buildEmeraldTideResult(['a.ts'], [richContent])
    expect(result.ocean.avgWave).toBeGreaterThan(0)
    expect(result.ocean.isEmerald).toBe(true)
    expect(result.ocean.overallFlow).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildEmeraldTideResult([], [])
    expect(result.swells).toHaveLength(0)
    expect(result.bays).toHaveLength(0)
    expect(result.ocean.overallFlow).toBe(0)
    expect(result.ocean.isEmerald).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildEmeraldTideResult(['a.ts'], [richContent])
    const total = result.stats.emeraldMasterpieceCount +
      result.stats.tidalGemCount +
      result.stats.properWaveCount +
      result.stats.murkyWaterCount +
      result.stats.drySandCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildEmeraldTideResult(['a.ts'], [richContent])
    expect(result.stats.hasHighWaveCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighRhythmCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPurityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best swell and top performers', async () => {
    const result = await buildEmeraldTideResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestSwell).toBeTruthy()
    expect(result.stats.mostFlowing).toBeTruthy()
    expect(result.stats.mostRhythmic).toBeTruthy()
    expect(result.stats.purest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes navigator grade from overall flow', async () => {
    const result = await buildEmeraldTideResult(['a.ts'], [richContent])
    expect(result.stats.navigatorGrade).toBe(classifyNavigatorGrade(result.stats.overallFlow))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgGreenWave: 90,
      avgTidalRhythm: 90,
      avgOceanPurity: 90,
      avgCoastalPrecision: 90,
      avgTideWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgWave: 90, avgPrecision: 90, avgWisdom: 90, isEmerald: true, overallFlow: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('perfect rhythm')
  })

  it('recommends green wave when < 60', () => {
    const stats = makeStats({ avgGreenWave: 50 })
    const result = generateRecommendations([], [], { avgWave: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallFlow: 50 }, stats)
    expect(result.some((r) => r.includes('green wave') || r.includes('flow'))).toBe(true)
  })

  it('recommends tidal rhythm when < 60', () => {
    const stats = makeStats({ avgTidalRhythm: 50 })
    const result = generateRecommendations([], [], { avgWave: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallFlow: 50 }, stats)
    expect(result.some((r) => r.includes('rhythm') || r.includes('pulse'))).toBe(true)
  })

  it('recommends ocean purity when < 60', () => {
    const stats = makeStats({ avgOceanPurity: 50 })
    const result = generateRecommendations([], [], { avgWave: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallFlow: 50 }, stats)
    expect(result.some((r) => r.includes('purity') || r.includes('clean'))).toBe(true)
  })

  it('recommends coastal precision when < 60', () => {
    const stats = makeStats({ avgCoastalPrecision: 50 })
    const result = generateRecommendations([], [], { avgWave: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallFlow: 50 }, stats)
    expect(result.some((r) => r.includes('precision') || r.includes('coastal'))).toBe(true)
  })

  it('recommends tide wisdom when < 60', () => {
    const stats = makeStats({ avgTideWisdom: 50 })
    const result = generateRecommendations([], [], { avgWave: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallFlow: 50 }, stats)
    expect(result.some((r) => r.includes('wisdom'))).toBe(true)
  })

  it('warns about retreating tide when flow < 40', () => {
    const stats = makeStats({ overallFlow: 30 })
    const result = generateRecommendations([], [], { avgWave: 30, avgPrecision: 30, avgWisdom: 30, isEmerald: false, overallFlow: 30 }, stats)
    expect(result.some((r) => r.includes('retreating'))).toBe(true)
  })

  it('lists void swells by name when <= 5', () => {
    const swells = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as any))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(swells, [], { avgWave: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallFlow: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void swells when > 5', () => {
    const swells = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as any))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(swells, [], { avgWave: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallFlow: 50 }, stats)
    expect(result.some((r) => r.includes('6 dry tide pools'))).toBe(true)
  })

  it('warns when all bays are poor', () => {
    const bays = [{ condition: 'empty-shore' as const, bayType: 'dry-beach' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], bays as any, { avgWave: 50, avgPrecision: 50, avgWisdom: 50, isEmerald: false, overallFlow: 50 }, stats)
    expect(result.some((r) => r.includes('empty shores'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgGreenWave: 70,
      avgTidalRhythm: 70,
      avgOceanPurity: 70,
      avgCoastalPrecision: 70,
      avgTideWisdom: 70,
      overallFlow: 70,
    })
    const result = generateRecommendations([], [], { avgWave: 70, avgPrecision: 70, avgWisdom: 70, isEmerald: true, overallFlow: 70 }, stats)
    expect(result.some((r) => r.includes('flows strong'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns different colors for different ranges', () => {
    expect(colorScore(95)).not.toBe(colorScore(10))
  })
})

describe('colorSwellCondition', () => {
  it('colors emerald-masterpiece', () => {
    expect(typeof colorSwellCondition('emerald-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorSwellCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorSwellCondition('unknown')).toBe('string')
  })
})

describe('colorBayType', () => {
  it('colors emerald-bay', () => {
    expect(typeof colorBayType('emerald-bay')).toBe('string')
  })

  it('colors no-bay', () => {
    expect(typeof colorBayType('no-bay')).toBe('string')
  })
})

describe('colorBayCondition', () => {
  it('colors ocean-palace', () => {
    expect(typeof colorBayCondition('ocean-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorBayCondition('void')).toBe('string')
  })
})

describe('colorNavigatorGrade', () => {
  it('colors tidal-master', () => {
    expect(typeof colorNavigatorGrade('tidal-master')).toBe('string')
  })

  it('colors beachcomber', () => {
    expect(typeof colorNavigatorGrade('beachcomber')).toBe('string')
  })
})

describe('formatSwellTable', () => {
  it('formats a swell with all measures', () => {
    const swell = analyzeEmeraldSwell(richContent, 'app.ts')
    const output = formatSwellTable(swell)
    expect(output).toContain('Emerald Swell: app.ts')
    expect(output).toContain('Green Wave')
    expect(output).toContain('Tidal Rhythm')
    expect(output).toContain('Ocean Purity')
    expect(output).toContain('Coastal Precision')
    expect(output).toContain('Tide Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatSwellsTable', () => {
  it('shows no swells message for empty array', () => {
    expect(formatSwellsTable([])).toContain('No emerald swells')
  })

  it('lists swells in output', () => {
    const swells = [analyzeEmeraldSwell(richContent, 'a.ts')]
    expect(formatSwellsTable(swells)).toContain('a.ts')
  })
})

describe('formatBayTable', () => {
  it('formats a bay with all fields', () => {
    const swells = [analyzeEmeraldSwell(richContent, 'a.ts')]
    const bay = analyzeEmeraldBay(swells, 'src')
    const output = formatBayTable(bay)
    expect(output).toContain('Emerald Bay: src')
    expect(output).toContain('Swells')
    expect(output).toContain('Avg Wave')
  })
})

describe('formatBaysTable', () => {
  it('shows no bays message for empty array', () => {
    expect(formatBaysTable([])).toContain('No emerald bays')
  })

  it('lists bays in output', () => {
    const swells = [analyzeEmeraldSwell(richContent, 'a.ts')]
    const bay = analyzeEmeraldBay(swells, 'src')
    expect(formatBaysTable([bay])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildEmeraldTideResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Emerald Tide Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Navigator Grade')
    expect(output).toContain('Best Swell')
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
    const result = await buildEmeraldTideResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Emerald Tide Analysis')
    expect(output).toContain('Ocean Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildEmeraldTideResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.swells).toHaveLength(1)
    expect(parsed.ocean).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
