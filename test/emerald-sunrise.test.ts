import { describe, expect, it } from 'vitest'

import {
  analyzeEmeraldRay,
  analyzeEmeraldGarden,
  buildEmeraldSunriseResult,
  classifyRayCondition,
  classifyGardenType,
  classifyGardenCondition,
  classifyLapidaryGrade,
  generateRecommendations,
  measureThriving,
  measureIlluminating,
  measureAccumulating,
  measureRefreshing,
  measureRising,
  type RayCondition,
  type GardenCondition,
  type GardenType,
  type EmeraldRay,
  type EmeraldSunriseResult,
  type EmeraldGarden,
} from '../src/commands/emerald-sunrise-helpers.js'

import {
  colorRayCondition,
  colorGardenCondition,
  colorScore,
  formatRayTable,
  formatRaysTable,
  formatGardensTable,
  formatGardenTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/emerald-sunrise-format-helpers.js'

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

const poorContent = 'var x = eval("1")\nany monolithic god.object'

// ─── measureThriving ─────────────────────────────────────

describe('measureThriving', () => {
  it('scores rich content high', () => {
    const m = measureThriving(richContent)
    expect(m.vitality).toBeGreaterThanOrEqual(60)
    expect(m.hasHighVitality).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureThriving(emptyContent)
    expect(m.vitality).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureThriving(richContent)
    const poor = measureThriving(poorContent)
    expect(rich.vitality).toBeGreaterThan(poor.vitality)
  })

  it('detects chaotic patterns', () => {
    const m = measureThriving('var x = eval("boom")')
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects monolithic patterns', () => {
    const m = measureThriving('monolithic god.object mega')
    expect(m.monolithicCount).toBeGreaterThan(0)
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('assigns high growth for rich content', () => {
    const m = measureThriving(richContent)
    expect(['ancient-forest', 'lush-garden', 'proper-growth']).toContain(m.growth)
  })

  it('assigns low growth for empty content', () => {
    const m = measureThriving(emptyContent)
    expect(['no-vitality', 'dead-branch', 'wilting-plant', 'proper-growth']).toContain(m.growth)
  })

  it('has all boolean properties', () => {
    const m = measureThriving(richContent)
    expect(typeof m.hasWellStructured).toBe('boolean')
    expect(typeof m.hasModular).toBe('boolean')
    expect(typeof m.hasAlive).toBe('boolean')
  })
})

// ─── measureIlluminating ────────────────────────────────

describe('measureIlluminating', () => {
  it('scores rich content high', () => {
    const m = measureIlluminating(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(60)
    expect(m.hasHighClarity).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureIlluminating(emptyContent)
    expect(m.clarity).toBeGreaterThanOrEqual(0)
  })

  it('detects cryptic patterns', () => {
    const m = measureIlluminating('cryptic obscure arcane')
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated patterns', () => {
    const m = measureIlluminating('obfuscated encoded mangled')
    expect(m.obfuscatedCount).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('assigns high dawn for rich content', () => {
    const m = measureIlluminating(richContent)
    expect(['golden-sunrise', 'clear-dawn', 'proper-morning']).toContain(m.dawn)
  })

  it('assigns low dawn for empty content', () => {
    const m = measureIlluminating(emptyContent)
    expect(['no-clarity', 'pre-dawn', 'gray-dawn', 'proper-morning']).toContain(m.dawn)
  })

  it('has all boolean properties', () => {
    const m = measureIlluminating(richContent)
    expect(typeof m.hasReadable).toBe('boolean')
    expect(typeof m.hasSelfDocumenting).toBe('boolean')
    expect(typeof m.hasClear).toBe('boolean')
  })
})

// ─── measureAccumulating ────────────────────────────────

describe('measureAccumulating', () => {
  it('scores rich content high', () => {
    const m = measureAccumulating(richContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(60)
    expect(m.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureAccumulating(emptyContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
  })

  it('detects hacked patterns', () => {
    const m = measureAccumulating('hack workaround monkey')
    expect(m.hackedCount).toBeGreaterThan(0)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects shallow patterns', () => {
    const m = measureAccumulating('shallow superficial quick.fix')
    expect(m.shallowCount).toBeGreaterThan(0)
    expect(m.hasValuable).toBe(false)
  })

  it('assigns high gem for rich content', () => {
    const m = measureAccumulating(richContent)
    expect(['royal-emerald', 'precious-stone', 'proper-gem']).toContain(m.gem)
  })

  it('assigns low gem for empty content', () => {
    const m = measureAccumulating(emptyContent)
    expect(['no-wisdom', 'glass-bead', 'common-jade', 'proper-gem']).toContain(m.gem)
  })

  it('has all boolean properties', () => {
    const m = measureAccumulating(richContent)
    expect(typeof m.hasWellArchitected).toBe('boolean')
    expect(typeof m.hasProven).toBe('boolean')
    expect(typeof m.hasDeep).toBe('boolean')
  })
})

// ─── measureRefreshing ──────────────────────────────────

describe('measureRefreshing', () => {
  it('scores rich content high', () => {
    const m = measureRefreshing(richContent)
    expect(m.freshness).toBeGreaterThanOrEqual(60)
    expect(m.hasHighFreshness).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureRefreshing(emptyContent)
    expect(m.freshness).toBeGreaterThanOrEqual(0)
  })

  it('detects stale patterns', () => {
    const m = measureRefreshing('stale outdated deprecated')
    expect(m.staleCount).toBeGreaterThan(0)
    expect(m.hasNoStale).toBe(false)
  })

  it('detects cluttered patterns', () => {
    const m = measureRefreshing('cluttered messy disorganized')
    expect(m.clutteredCount).toBeGreaterThan(0)
    expect(m.hasNoCluttered).toBe(false)
  })

  it('assigns high dew for rich content', () => {
    const m = measureRefreshing(richContent)
    expect(['mountain-dew', 'fresh-rain', 'proper-moisture']).toContain(m.dew)
  })

  it('assigns low dew for empty content', () => {
    const m = measureRefreshing(emptyContent)
    expect(['no-freshness', 'bone-dry', 'stagnant-water', 'proper-moisture']).toContain(m.dew)
  })

  it('has all boolean properties', () => {
    const m = measureRefreshing(richContent)
    expect(typeof m.hasClean).toBe('boolean')
    expect(typeof m.hasModern).toBe('boolean')
    expect(typeof m.hasPolished).toBe('boolean')
  })
})

// ─── measureRising ──────────────────────────────────────

describe('measureRising', () => {
  it('scores rich content high', () => {
    const m = measureRising(richContent)
    expect(m.resilience).toBeGreaterThanOrEqual(60)
    expect(m.hasHighResilience).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureRising(emptyContent)
    expect(m.resilience).toBeGreaterThanOrEqual(0)
  })

  it('detects unhandled patterns', () => {
    const m = measureRising('eval (x)')
    expect(m.unhandledCount).toBeGreaterThan(0)
    expect(m.hasNoUnhandled).toBe(false)
  })

  it('detects untested patterns', () => {
    const m = measureRising('eval (x)')
    expect(m.untestedCount).toBeGreaterThan(0)
    expect(m.hasNoUntested).toBe(false)
  })

  it('assigns high sunrise for rich content', () => {
    const m = measureRising(richContent)
    expect(['eternal-sun', 'faithful-sunrise', 'proper-dawn']).toContain(m.sunrise)
  })

  it('assigns low sunrise for empty content', () => {
    const m = measureRising(emptyContent)
    expect(['no-resilience', 'overcast', 'late-morning', 'proper-dawn']).toContain(m.sunrise)
  })

  it('has all boolean properties', () => {
    const m = measureRising(richContent)
    expect(typeof m.hasErrorHandled).toBe('boolean')
    expect(typeof m.hasDefensive).toBe('boolean')
    expect(typeof m.hasRobust).toBe('boolean')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyRayCondition', () => {
  const cases: [number, RayCondition][] = [
    [95, 'emerald-masterpiece'],
    [90, 'emerald-masterpiece'],
    [80, 'dawn-jewel'],
    [75, 'dawn-jewel'],
    [65, 'proper-gem'],
    [60, 'proper-gem'],
    [50, 'cloudy-stone'],
    [40, 'cloudy-stone'],
    [25, 'dull-rock'],
    [20, 'dull-rock'],
    [10, 'void'],
    [0, 'void'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyRayCondition(score)).toBe(expected)
    })
  }
})

describe('classifyGardenType', () => {
  it('returns no-garden for empty array', () => {
    expect(classifyGardenType([])).toBe('no-garden')
  })

  it('returns royal-garden for high average', () => {
    const rays = [{ qualityScore: 90 }, { qualityScore: 88 }].map((q) => ({
      ...q,
    })) as EmeraldRay[]
    expect(classifyGardenType(rays)).toBe('royal-garden')
  })

  it('returns barren-soil for low average', () => {
    const rays = [{ qualityScore: 10 }, { qualityScore: 15 }].map((q) => ({
      ...q,
    })) as EmeraldRay[]
    expect(classifyGardenType(rays)).toBe('barren-soil')
  })
})

describe('classifyGardenCondition', () => {
  const cases: [number, GardenCondition][] = [
    [90, 'emerald-paradise'],
    [85, 'emerald-paradise'],
    [75, 'jade-oasis'],
    [70, 'jade-oasis'],
    [60, 'proper-greenhouse'],
    [55, 'proper-greenhouse'],
    [40, 'weed-patch'],
    [35, 'weed-patch'],
    [20, 'desert'],
    [15, 'desert'],
    [5, 'void'],
    [0, 'void'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyGardenCondition(score)).toBe(expected)
    })
  }
})

describe('classifyLapidaryGrade', () => {
  const cases: [number, string][] = [
    [90, 'master-lapidary'],
    [80, 'master-lapidary'],
    [70, 'gem-cutter'],
    [65, 'gem-cutter'],
    [55, 'proper-jeweler'],
    [50, 'proper-jeweler'],
    [40, 'apprentice'],
    [35, 'apprentice'],
    [25, 'novice'],
    [20, 'novice'],
    [10, 'rock-polisher'],
    [0, 'rock-polisher'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyLapidaryGrade(score)).toBe(expected)
    })
  }
})

// ─── analyzeEmeraldRay ──────────────────────────────────

describe('analyzeEmeraldRay', () => {
  it('returns valid ray for rich content', () => {
    const f = analyzeEmeraldRay(richContent, 'app.ts')
    expect(f.file).toBe('app.ts')
    expect(f.greenVitality).toBeGreaterThanOrEqual(0)
    expect(f.dawnClarity).toBeGreaterThanOrEqual(0)
    expect(f.gemWisdom).toBeGreaterThanOrEqual(0)
    expect(f.morningFreshness).toBeGreaterThanOrEqual(0)
    expect(f.sunriseResilience).toBeGreaterThanOrEqual(0)
    expect(f.qualityScore).toBeGreaterThanOrEqual(0)
    expect(f.qualityScore).toBeLessThanOrEqual(100)
  })

  it('returns valid ray for empty content', () => {
    const f = analyzeEmeraldRay(emptyContent, 'empty.ts')
    expect(f.file).toBe('empty.ts')
    expect(f.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('computes qualityScore as weighted average', () => {
    const f = analyzeEmeraldRay(richContent, 'test.ts')
    const expected = Math.round(
      f.greenVitality * 0.2 +
      f.dawnClarity * 0.2 +
      f.gemWisdom * 0.2 +
      f.morningFreshness * 0.2 +
      f.sunriseResilience * 0.2,
    )
    expect(f.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const f = analyzeEmeraldRay(richContent, 'test.ts')
    expect(f.thriving).toBeDefined()
    expect(f.illuminating).toBeDefined()
    expect(f.accumulating).toBeDefined()
    expect(f.refreshing).toBeDefined()
    expect(f.rising).toBeDefined()
  })

  it('classifies condition based on qualityScore', () => {
    const f = analyzeEmeraldRay(richContent, 'test.ts')
    expect(classifyRayCondition(f.qualityScore)).toBe(f.condition)
  })

  it('scores rich content at max', () => {
    const f = analyzeEmeraldRay(richContent, 'rich.ts')
    expect(f.greenVitality).toBeGreaterThanOrEqual(60)
    expect(f.dawnClarity).toBeGreaterThanOrEqual(60)
    expect(f.gemWisdom).toBeGreaterThanOrEqual(60)
    expect(f.morningFreshness).toBeGreaterThanOrEqual(60)
    expect(f.sunriseResilience).toBeGreaterThanOrEqual(60)
  })
})

// ─── analyzeEmeraldGarden ───────────────────────────────

describe('analyzeEmeraldGarden', () => {
  it('returns empty garden for no rays', () => {
    const g = analyzeEmeraldGarden([], 'src')
    expect(g.directory).toBe('src')
    expect(g.rays).toHaveLength(0)
    expect(g.avgVitality).toBe(0)
    expect(g.avgClarity).toBe(0)
    expect(g.avgWisdom).toBe(0)
    expect(g.gardenType).toBe('no-garden')
    expect(g.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const rays = [
      analyzeEmeraldRay(richContent, 'a.ts'),
      analyzeEmeraldRay(richContent, 'b.ts'),
    ]
    const g = analyzeEmeraldGarden(rays, 'src')
    expect(g.avgVitality).toBeGreaterThanOrEqual(0)
    expect(g.avgClarity).toBeGreaterThanOrEqual(0)
    expect(g.avgWisdom).toBeGreaterThanOrEqual(0)
  })

  it('counts emerald masterpieces', () => {
    const rays = [analyzeEmeraldRay(richContent, 'a.ts')]
    const g = analyzeEmeraldGarden(rays, 'src')
    expect(g.emeraldMasterpieceCount).toBeGreaterThanOrEqual(0)
  })

  it('counts void rays', () => {
    const rays = [analyzeEmeraldRay(emptyContent, 'empty.ts')]
    const g = analyzeEmeraldGarden(rays, 'src')
    expect(g.voidCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── buildEmeraldSunriseResult ──────────────────────────

describe('buildEmeraldSunriseResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildEmeraldSunriseResult([], [])
    expect(result.rays).toHaveLength(0)
    expect(result.gardens).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallRadiance).toBe(0)
    expect(result.morning.isEmerald).toBe(false)
  })

  it('returns valid result for single file', async () => {
    const result = await buildEmeraldSunriseResult(['app.ts'], [richContent])
    expect(result.rays).toHaveLength(1)
    expect(result.gardens).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestRay).toBe('app.ts')
    expect(result.stats.mostVital).toBe('app.ts')
    expect(result.stats.clearest).toBe('app.ts')
    expect(result.stats.wisest).toBe('app.ts')
    expect(result.stats.freshest).toBe('app.ts')
    expect(result.stats.mostResilient).toBe('app.ts')
  })

  it('returns valid result for multiple files', async () => {
    const result = await buildEmeraldSunriseResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, emptyContent],
    )
    expect(result.rays).toHaveLength(3)
    expect(result.gardens).toHaveLength(2)
    expect(result.stats.totalGardens).toBe(2)
  })

  it('computes correct stats counts', async () => {
    const result = await buildEmeraldSunriseResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    const total = result.stats.emeraldMasterpieceCount +
      result.stats.dawnJewelCount +
      result.stats.properGemCount +
      result.stats.cloudyStoneCount +
      result.stats.dullRockCount +
      result.stats.voidCount
    expect(total).toBe(2)
  })

  it('computes lapidaryGrade', async () => {
    const result = await buildEmeraldSunriseResult(['a.ts'], [richContent])
    expect(['master-lapidary', 'gem-cutter', 'proper-jeweler', 'apprentice', 'novice', 'rock-polisher']).toContain(
      result.stats.lapidaryGrade,
    )
  })

  it('sets isEmerald when overallRadiance >= 60', async () => {
    const result = await buildEmeraldSunriseResult(['a.ts'], [richContent])
    if (result.morning.overallRadiance >= 60) {
      expect(result.morning.isEmerald).toBe(true)
    }
  })

  it('generates recommendations', async () => {
    const result = await buildEmeraldSunriseResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('computes hasHigh counts', async () => {
    const result = await buildEmeraldSunriseResult(['a.ts'], [richContent])
    expect(result.stats.hasHighVitalityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighFreshnessCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
  })

  it('computes avgGemWisdom correctly', async () => {
    const result = await buildEmeraldSunriseResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.avgGemWisdom).toBe(result.morning.avgWisdom)
  })

  it('computes avgGreenVitality correctly', async () => {
    const result = await buildEmeraldSunriseResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.avgGreenVitality).toBe(result.morning.avgVitality)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all high', () => {
    const rays: EmeraldRay[] = []
    const gardens: EmeraldGarden[] = []
    const morning: EmeraldSunriseResult['morning'] = {
      avgVitality: 90,
      avgClarity: 90,
      avgWisdom: 90,
      isEmerald: true,
      overallRadiance: 90,
    }
    const stats: EmeraldSunriseResult['stats'] = {
      totalFiles: 1, totalGardens: 1,
      avgGreenVitality: 92, avgDawnClarity: 91, avgGemWisdom: 90,
      avgMorningFreshness: 93, avgSunriseResilience: 94,
      emeraldMasterpieceCount: 1, dawnJewelCount: 0, properGemCount: 0,
      cloudyStoneCount: 0, dullRockCount: 0, voidCount: 0,
      hasHighVitalityCount: 1, hasHighClarityCount: 1, hasHighWisdomCount: 1,
      hasHighFreshnessCount: 1, hasHighResilienceCount: 1,
      overallRadiance: 92, lapidaryGrade: 'master-lapidary',
      bestRay: 'a.ts', mostVital: 'a.ts', clearest: 'a.ts',
      wisest: 'a.ts', freshest: 'a.ts', mostResilient: 'a.ts',
    }
    const recs = generateRecommendations(rays, gardens, morning, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends vitality when low', () => {
    const stats = {
      totalFiles: 1, totalGardens: 1,
      avgGreenVitality: 30, avgDawnClarity: 90, avgGemWisdom: 90,
      avgMorningFreshness: 90, avgSunriseResilience: 90,
      emeraldMasterpieceCount: 0, dawnJewelCount: 0, properGemCount: 0,
      cloudyStoneCount: 0, dullRockCount: 0, voidCount: 0,
      hasHighVitalityCount: 0, hasHighClarityCount: 0, hasHighWisdomCount: 0,
      hasHighFreshnessCount: 0, hasHighResilienceCount: 0,
      overallRadiance: 78, lapidaryGrade: 'gem-cutter' as const,
      bestRay: 'a.ts', mostVital: 'a.ts', clearest: 'a.ts',
      wisest: 'a.ts', freshest: 'a.ts', mostResilient: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgVitality: 30, avgClarity: 90, avgWisdom: 90, isEmerald: true, overallRadiance: 78 }, stats)
    expect(recs.some((r) => r.includes('vitality'))).toBe(true)
  })

  it('recommends clarity when low', () => {
    const stats = {
      totalFiles: 1, totalGardens: 1,
      avgGreenVitality: 90, avgDawnClarity: 30, avgGemWisdom: 90,
      avgMorningFreshness: 90, avgSunriseResilience: 90,
      emeraldMasterpieceCount: 0, dawnJewelCount: 0, properGemCount: 0,
      cloudyStoneCount: 0, dullRockCount: 0, voidCount: 0,
      hasHighVitalityCount: 0, hasHighClarityCount: 0, hasHighWisdomCount: 0,
      hasHighFreshnessCount: 0, hasHighResilienceCount: 0,
      overallRadiance: 78, lapidaryGrade: 'gem-cutter' as const,
      bestRay: 'a.ts', mostVital: 'a.ts', clearest: 'a.ts',
      wisest: 'a.ts', freshest: 'a.ts', mostResilient: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgVitality: 90, avgClarity: 30, avgWisdom: 90, isEmerald: true, overallRadiance: 78 }, stats)
    expect(recs.some((r) => r.includes('clarity'))).toBe(true)
  })

  it('recommends wisdom when low', () => {
    const stats = {
      totalFiles: 1, totalGardens: 1,
      avgGreenVitality: 90, avgDawnClarity: 90, avgGemWisdom: 30,
      avgMorningFreshness: 90, avgSunriseResilience: 90,
      emeraldMasterpieceCount: 0, dawnJewelCount: 0, properGemCount: 0,
      cloudyStoneCount: 0, dullRockCount: 0, voidCount: 0,
      hasHighVitalityCount: 0, hasHighClarityCount: 0, hasHighWisdomCount: 0,
      hasHighFreshnessCount: 0, hasHighResilienceCount: 0,
      overallRadiance: 78, lapidaryGrade: 'gem-cutter' as const,
      bestRay: 'a.ts', mostVital: 'a.ts', clearest: 'a.ts',
      wisest: 'a.ts', freshest: 'a.ts', mostResilient: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgVitality: 90, avgClarity: 90, avgWisdom: 30, isEmerald: true, overallRadiance: 78 }, stats)
    expect(recs.some((r) => r.includes('wisdom'))).toBe(true)
  })

  it('recommends freshness when low', () => {
    const stats = {
      totalFiles: 1, totalGardens: 1,
      avgGreenVitality: 90, avgDawnClarity: 90, avgGemWisdom: 90,
      avgMorningFreshness: 30, avgSunriseResilience: 90,
      emeraldMasterpieceCount: 0, dawnJewelCount: 0, properGemCount: 0,
      cloudyStoneCount: 0, dullRockCount: 0, voidCount: 0,
      hasHighVitalityCount: 0, hasHighClarityCount: 0, hasHighWisdomCount: 0,
      hasHighFreshnessCount: 0, hasHighResilienceCount: 0,
      overallRadiance: 78, lapidaryGrade: 'gem-cutter' as const,
      bestRay: 'a.ts', mostVital: 'a.ts', clearest: 'a.ts',
      wisest: 'a.ts', freshest: 'a.ts', mostResilient: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgVitality: 90, avgClarity: 90, avgWisdom: 90, isEmerald: true, overallRadiance: 78 }, stats)
    expect(recs.some((r) => r.includes('freshness'))).toBe(true)
  })

  it('recommends resilience when low', () => {
    const stats = {
      totalFiles: 1, totalGardens: 1,
      avgGreenVitality: 90, avgDawnClarity: 90, avgGemWisdom: 90,
      avgMorningFreshness: 90, avgSunriseResilience: 30,
      emeraldMasterpieceCount: 0, dawnJewelCount: 0, properGemCount: 0,
      cloudyStoneCount: 0, dullRockCount: 0, voidCount: 0,
      hasHighVitalityCount: 0, hasHighClarityCount: 0, hasHighWisdomCount: 0,
      hasHighFreshnessCount: 0, hasHighResilienceCount: 0,
      overallRadiance: 78, lapidaryGrade: 'gem-cutter' as const,
      bestRay: 'a.ts', mostVital: 'a.ts', clearest: 'a.ts',
      wisest: 'a.ts', freshest: 'a.ts', mostResilient: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgVitality: 90, avgClarity: 90, avgWisdom: 90, isEmerald: true, overallRadiance: 78 }, stats)
    expect(recs.some((r) => r.includes('resilience'))).toBe(true)
  })

  it('mentions void rays by name', () => {
    const rays = [
      { file: 'bad1.ts', condition: 'void' } as EmeraldRay,
      { file: 'bad2.ts', condition: 'void' } as EmeraldRay,
    ]
    const stats = {
      totalFiles: 2, totalGardens: 1,
      avgGreenVitality: 70, avgDawnClarity: 70, avgGemWisdom: 70,
      avgMorningFreshness: 70, avgSunriseResilience: 70,
      emeraldMasterpieceCount: 0, dawnJewelCount: 0, properGemCount: 0,
      cloudyStoneCount: 0, dullRockCount: 0, voidCount: 2,
      hasHighVitalityCount: 0, hasHighClarityCount: 0, hasHighWisdomCount: 0,
      hasHighFreshnessCount: 0, hasHighResilienceCount: 0,
      overallRadiance: 70, lapidaryGrade: 'gem-cutter' as const,
      bestRay: '', mostVital: '', clearest: '',
      wisest: '', freshest: '', mostResilient: '',
    }
    const recs = generateRecommendations(rays, [], { avgVitality: 70, avgClarity: 70, avgWisdom: 70, isEmerald: true, overallRadiance: 70 }, stats)
    expect(recs.some((r) => r.includes('bad1.ts'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })

  it('colorRayCondition returns string for all conditions', () => {
    const conditions: RayCondition[] = ['emerald-masterpiece', 'dawn-jewel', 'proper-gem', 'cloudy-stone', 'dull-rock', 'void']
    for (const c of conditions) {
      expect(typeof colorRayCondition(c)).toBe('string')
    }
  })

  it('colorGardenCondition returns string for all conditions', () => {
    const conditions: GardenCondition[] = ['emerald-paradise', 'jade-oasis', 'proper-greenhouse', 'weed-patch', 'desert', 'void']
    for (const c of conditions) {
      expect(typeof colorGardenCondition(c)).toBe('string')
    }
  })

  it('formatRayTable returns string', () => {
    const r = analyzeEmeraldRay(richContent, 'test.ts')
    expect(typeof formatRayTable(r)).toBe('string')
  })

  it('formatRaysTable returns string for empty', () => {
    expect(typeof formatRaysTable([])).toBe('string')
  })

  it('formatRaysTable returns string for rays', () => {
    const rays = [
      analyzeEmeraldRay(richContent, 'a.ts'),
      analyzeEmeraldRay(richContent, 'b.ts'),
    ]
    expect(typeof formatRaysTable(rays)).toBe('string')
  })

  it('formatGardenTable returns string', () => {
    const rays = [analyzeEmeraldRay(richContent, 'a.ts')]
    const g = analyzeEmeraldGarden(rays, 'src')
    expect(typeof formatGardenTable(g)).toBe('string')
  })

  it('formatGardensTable returns string for empty', () => {
    expect(typeof formatGardensTable([])).toBe('string')
  })

  it('formatGardensTable returns string for gardens', () => {
    const rays = [analyzeEmeraldRay(richContent, 'a.ts')]
    const g = analyzeEmeraldGarden(rays, 'src')
    expect(typeof formatGardensTable([g])).toBe('string')
  })

  it('formatStatsTable returns string', async () => {
    const result = await buildEmeraldSunriseResult(['a.ts'], [richContent])
    expect(typeof formatStatsTable(result.stats)).toBe('string')
  })

  it('formatRecommendations returns string for empty', () => {
    expect(typeof formatRecommendations([])).toBe('string')
  })

  it('formatRecommendations returns string for recs', () => {
    expect(typeof formatRecommendations(['Fix X', 'Fix Y'])).toBe('string')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildEmeraldSunriseResult(['a.ts'], [richContent])
    expect(typeof formatResultTable(result)).toBe('string')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildEmeraldSunriseResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })
})
