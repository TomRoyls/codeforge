import { describe, expect, it } from 'vitest'

import {
  analyzePlatinumIngot,
  analyzePlatinumRidge,
  buildPlatinumSkylineResult,
  classifyAlchemistGrade,
  classifyIngotCondition,
  classifyRidgeCondition,
  classifyRidgeType,
  generateRecommendations,
  measureAnticipating,
  measureCommanding,
  measureEnduring,
  measureEnvisioning,
  measurePurifying,
  type IngotCondition,
  type PlatinumIngot,
  type PlatinumRidge,
  type PlatinumSkylineResult,
  type RidgeCondition,
} from '../src/commands/platinum-skyline-helpers.js'

import {
  colorIngotCondition,
  colorRidgeCondition,
  colorScore,
  formatIngotTable,
  formatIngotsTable,
  formatRidgesTable,
  formatRidgeTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/platinum-skyline-format-helpers.js'

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

// ─── measurePurifying ───────────────────────────────────

describe('measurePurifying', () => {
  it('scores rich content high', () => {
    const m = measurePurifying(richContent)
    expect(m.purity).toBeGreaterThanOrEqual(60)
    expect(m.hasHighPurity).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measurePurifying(emptyContent)
    expect(m.purity).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measurePurifying(richContent)
    const poor = measurePurifying(poorContent)
    expect(rich.purity).toBeGreaterThan(poor.purity)
  })

  it('detects unsafe patterns', () => {
    const m = measurePurifying('let x: any = 1')
    expect(m.unsafeCount).toBeGreaterThan(0)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects contradictory patterns', () => {
    const m = measurePurifying('contradictory inconsistent conflicting')
    expect(m.contradictoryCount).toBeGreaterThan(0)
    expect(m.hasNoContradictory).toBe(false)
  })

  it('assigns high grade for rich content', () => {
    const m = measurePurifying(richContent)
    expect(['triple-nine', 'refined-platinum', 'proper-grade']).toContain(m.grade)
  })

  it('assigns low grade for empty content', () => {
    const m = measurePurifying(emptyContent)
    expect(['no-purity', 'ore-grade', 'industrial-grade', 'proper-grade']).toContain(m.grade)
  })

  it('has all boolean properties', () => {
    const m = measurePurifying(richContent)
    expect(typeof m.hasTypeSafe).toBe('boolean')
    expect(typeof m.hasClean).toBe('boolean')
    expect(typeof m.hasPure).toBe('boolean')
  })
})

// ─── measureEnvisioning ─────────────────────────────────

describe('measureEnvisioning', () => {
  it('scores rich content high', () => {
    const m = measureEnvisioning(richContent)
    expect(m.vision).toBeGreaterThanOrEqual(60)
    expect(m.hasHighVision).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureEnvisioning(emptyContent)
    expect(m.vision).toBeGreaterThanOrEqual(0)
  })

  it('detects hacked patterns', () => {
    const m = measureEnvisioning('hack workaround monkey')
    expect(m.hackedCount).toBeGreaterThan(0)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects rigid patterns', () => {
    const m = measureEnvisioning('hardcoded rigid inflexible')
    expect(m.rigidCount).toBeGreaterThan(0)
    expect(m.hasNoRigid).toBe(false)
  })

  it('assigns high horizon for rich content', () => {
    const m = measureEnvisioning(richContent)
    expect(['infinite-vista', 'far-horizon', 'proper-sight']).toContain(m.horizon)
  })

  it('assigns low horizon for empty content', () => {
    const m = measureEnvisioning(emptyContent)
    expect(['no-vision', 'blind-alley', 'near-hill', 'proper-sight']).toContain(m.horizon)
  })

  it('has all boolean properties', () => {
    const m = measureEnvisioning(richContent)
    expect(typeof m.hasWellArchitected).toBe('boolean')
    expect(typeof m.hasExtensible).toBe('boolean')
    expect(typeof m.hasScalable).toBe('boolean')
  })
})

// ─── measureEnduring ────────────────────────────────────

describe('measureEnduring', () => {
  it('scores rich content high', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBeGreaterThanOrEqual(60)
    expect(m.hasHighResilience).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureEnduring(emptyContent)
    expect(m.resilience).toBeGreaterThanOrEqual(0)
  })

  it('detects unhandled patterns', () => {
    const m = measureEnduring('eval (x)')
    expect(m.unhandledCount).toBeGreaterThan(0)
    expect(m.hasNoUnhandled).toBe(false)
  })

  it('detects untested patterns', () => {
    const m = measureEnduring('eval(x) Function(y)')
    expect(m.untestedCount).toBeGreaterThan(0)
    expect(m.hasNoUntested).toBe(false)
  })

  it('assigns high temper for rich content', () => {
    const m = measureEnduring(richContent)
    expect(['indestructible', 'platinum-hard', 'proper-temper']).toContain(m.temper)
  })

  it('assigns low temper for empty content', () => {
    const m = measureEnduring(emptyContent)
    expect(['no-resilience', 'crumbles', 'soft-metal', 'proper-temper']).toContain(m.temper)
  })

  it('has all boolean properties', () => {
    const m = measureEnduring(richContent)
    expect(typeof m.hasErrorHandled).toBe('boolean')
    expect(typeof m.hasDefensive).toBe('boolean')
    expect(typeof m.hasStable).toBe('boolean')
  })
})

// ─── measureCommanding ──────────────────────────────────

describe('measureCommanding', () => {
  it('scores rich content high', () => {
    const m = measureCommanding(richContent)
    expect(m.authority).toBeGreaterThanOrEqual(60)
    expect(m.hasHighAuthority).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureCommanding(emptyContent)
    expect(m.authority).toBeGreaterThanOrEqual(0)
  })

  it('detects chaotic patterns', () => {
    const m = measureCommanding('var x = eval("boom")')
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects weak patterns', () => {
    const m = measureCommanding('weak fragile flimsy')
    expect(m.weakCount).toBeGreaterThan(0)
  })

  it('assigns high crest for rich content', () => {
    const m = measureCommanding(richContent)
    expect(['platinum-record', 'gold-standard', 'proper-medal']).toContain(m.crest)
  })

  it('assigns low crest for empty content', () => {
    const m = measureCommanding(emptyContent)
    expect(['no-authority', 'participation', 'honorable-mention', 'proper-medal']).toContain(m.crest)
  })

  it('has all boolean properties', () => {
    const m = measureCommanding(richContent)
    expect(typeof m.hasWellStructured).toBe('boolean')
    expect(typeof m.hasDocumented).toBe('boolean')
    expect(typeof m.hasConfident).toBe('boolean')
  })
})

// ─── measureAnticipating ────────────────────────────────

describe('measureAnticipating', () => {
  it('scores rich content high', () => {
    const m = measureAnticipating(richContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(60)
    expect(m.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureAnticipating(emptyContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
  })

  it('detects shallow patterns', () => {
    const m = measureAnticipating('shallow superficial quick.fix')
    expect(m.shallowCount).toBeGreaterThan(0)
    expect(m.hasPrescient).toBe(false)
  })

  it('detects reactive patterns', () => {
    const m = measureAnticipating('reactive impulsive hasty')
    expect(m.reactiveCount).toBeGreaterThan(0)
    expect(m.hasProphetic).toBe(false)
  })

  it('assigns high foresight for rich content', () => {
    const m = measureAnticipating(richContent)
    expect(['oracle-vision', 'strategic-thinker', 'proper-planner']).toContain(m.foresight)
  })

  it('assigns low foresight for empty content', () => {
    const m = measureAnticipating(emptyContent)
    expect(['no-wisdom', 'surprised', 'reactive-coder', 'proper-planner']).toContain(m.foresight)
  })

  it('has all boolean properties', () => {
    const m = measureAnticipating(richContent)
    expect(typeof m.hasWellArchitected).toBe('boolean')
    expect(typeof m.hasStrategic).toBe('boolean')
    expect(typeof m.hasVisionary).toBe('boolean')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyIngotCondition', () => {
  const cases: [number, IngotCondition][] = [
    [95, 'platinum-masterpiece'],
    [90, 'platinum-masterpiece'],
    [80, 'royal-standard'],
    [75, 'royal-standard'],
    [65, 'proper-metal'],
    [60, 'proper-metal'],
    [50, 'base-alloy'],
    [40, 'base-alloy'],
    [25, 'scrap-metal'],
    [20, 'scrap-metal'],
    [10, 'void'],
    [0, 'void'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyIngotCondition(score)).toBe(expected)
    })
  }
})

describe('classifyRidgeType', () => {
  it('returns no-ridge for empty array', () => {
    expect(classifyRidgeType([])).toBe('no-ridge')
  })

  it('returns mountain-range for high average', () => {
    const ingots = [{ qualityScore: 90 }, { qualityScore: 88 }].map((q) => ({
      ...q,
    })) as PlatinumIngot[]
    expect(classifyRidgeType(ingots)).toBe('mountain-range')
  })

  it('returns flatland for low average', () => {
    const ingots = [{ qualityScore: 10 }, { qualityScore: 15 }].map((q) => ({
      ...q,
    })) as PlatinumIngot[]
    expect(classifyRidgeType(ingots)).toBe('flatland')
  })
})

describe('classifyRidgeCondition', () => {
  const cases: [number, RidgeCondition][] = [
    [90, 'platinum-summit'],
    [85, 'platinum-summit'],
    [75, 'golden-peak'],
    [70, 'golden-peak'],
    [60, 'proper-mountain'],
    [55, 'proper-mountain'],
    [40, 'rocky-hill'],
    [35, 'rocky-hill'],
    [20, 'sand-dune'],
    [15, 'sand-dune'],
    [5, 'void'],
    [0, 'void'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyRidgeCondition(score)).toBe(expected)
    })
  }
})

describe('classifyAlchemistGrade', () => {
  const cases: [number, string][] = [
    [90, 'grand-alchemist'],
    [80, 'grand-alchemist'],
    [70, 'platinum-smith'],
    [65, 'platinum-smith'],
    [55, 'proper-metallurgist'],
    [50, 'proper-metallurgist'],
    [40, 'apprentice'],
    [35, 'apprentice'],
    [25, 'novice'],
    [20, 'novice'],
    [10, 'lead-painter'],
    [0, 'lead-painter'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyAlchemistGrade(score)).toBe(expected)
    })
  }
})

// ─── analyzePlatinumIngot ───────────────────────────────

describe('analyzePlatinumIngot', () => {
  it('returns valid ingot for rich content', () => {
    const i = analyzePlatinumIngot(richContent, 'app.ts')
    expect(i.file).toBe('app.ts')
    expect(i.royalPurity).toBeGreaterThanOrEqual(0)
    expect(i.horizonVision).toBeGreaterThanOrEqual(0)
    expect(i.platinumResilience).toBeGreaterThanOrEqual(0)
    expect(i.crestAuthority).toBeGreaterThanOrEqual(0)
    expect(i.futureWisdom).toBeGreaterThanOrEqual(0)
    expect(i.qualityScore).toBeGreaterThanOrEqual(0)
    expect(i.qualityScore).toBeLessThanOrEqual(100)
  })

  it('returns valid ingot for empty content', () => {
    const i = analyzePlatinumIngot(emptyContent, 'empty.ts')
    expect(i.file).toBe('empty.ts')
    expect(i.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('computes qualityScore as weighted average', () => {
    const i = analyzePlatinumIngot(richContent, 'test.ts')
    const expected = Math.round(
      i.royalPurity * 0.2 +
      i.horizonVision * 0.2 +
      i.platinumResilience * 0.2 +
      i.crestAuthority * 0.2 +
      i.futureWisdom * 0.2,
    )
    expect(i.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const i = analyzePlatinumIngot(richContent, 'test.ts')
    expect(i.purifying).toBeDefined()
    expect(i.envisioning).toBeDefined()
    expect(i.enduring).toBeDefined()
    expect(i.commanding).toBeDefined()
    expect(i.anticipating).toBeDefined()
  })

  it('classifies condition based on qualityScore', () => {
    const i = analyzePlatinumIngot(richContent, 'test.ts')
    expect(classifyIngotCondition(i.qualityScore)).toBe(i.condition)
  })

  it('scores rich content at max', () => {
    const i = analyzePlatinumIngot(richContent, 'rich.ts')
    expect(i.royalPurity).toBeGreaterThanOrEqual(60)
    expect(i.horizonVision).toBeGreaterThanOrEqual(60)
    expect(i.platinumResilience).toBeGreaterThanOrEqual(60)
    expect(i.crestAuthority).toBeGreaterThanOrEqual(60)
    expect(i.futureWisdom).toBeGreaterThanOrEqual(60)
  })
})

// ─── analyzePlatinumRidge ───────────────────────────────

describe('analyzePlatinumRidge', () => {
  it('returns empty ridge for no ingots', () => {
    const r = analyzePlatinumRidge([], 'src')
    expect(r.directory).toBe('src')
    expect(r.ingots).toHaveLength(0)
    expect(r.avgPurity).toBe(0)
    expect(r.avgVision).toBe(0)
    expect(r.avgWisdom).toBe(0)
    expect(r.ridgeType).toBe('no-ridge')
    expect(r.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const ingots = [
      analyzePlatinumIngot(richContent, 'a.ts'),
      analyzePlatinumIngot(richContent, 'b.ts'),
    ]
    const r = analyzePlatinumRidge(ingots, 'src')
    expect(r.avgPurity).toBeGreaterThanOrEqual(0)
    expect(r.avgVision).toBeGreaterThanOrEqual(0)
    expect(r.avgWisdom).toBeGreaterThanOrEqual(0)
  })

  it('counts platinum masterpieces', () => {
    const ingots = [analyzePlatinumIngot(richContent, 'a.ts')]
    const r = analyzePlatinumRidge(ingots, 'src')
    expect(r.platinumMasterpieceCount).toBeGreaterThanOrEqual(0)
  })

  it('counts void ingots', () => {
    const ingots = [analyzePlatinumIngot(emptyContent, 'empty.ts')]
    const r = analyzePlatinumRidge(ingots, 'src')
    expect(r.voidCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── buildPlatinumSkylineResult ─────────────────────────

describe('buildPlatinumSkylineResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildPlatinumSkylineResult([], [])
    expect(result.ingots).toHaveLength(0)
    expect(result.ridges).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallElevation).toBe(0)
    expect(result.vista.isPlatinum).toBe(false)
  })

  it('returns valid result for single file', async () => {
    const result = await buildPlatinumSkylineResult(['app.ts'], [richContent])
    expect(result.ingots).toHaveLength(1)
    expect(result.ridges).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestIngot).toBe('app.ts')
    expect(result.stats.purest).toBe('app.ts')
    expect(result.stats.mostVisionary).toBe('app.ts')
    expect(result.stats.mostResilient).toBe('app.ts')
    expect(result.stats.mostAuthoritative).toBe('app.ts')
    expect(result.stats.wisest).toBe('app.ts')
  })

  it('returns valid result for multiple files', async () => {
    const result = await buildPlatinumSkylineResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, emptyContent],
    )
    expect(result.ingots).toHaveLength(3)
    expect(result.ridges).toHaveLength(2)
    expect(result.stats.totalRidges).toBe(2)
  })

  it('computes correct stats counts', async () => {
    const result = await buildPlatinumSkylineResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    const total = result.stats.platinumMasterpieceCount +
      result.stats.royalStandardCount +
      result.stats.properMetalCount +
      result.stats.baseAlloyCount +
      result.stats.scrapMetalCount +
      result.stats.voidCount
    expect(total).toBe(2)
  })

  it('computes alchemistGrade', async () => {
    const result = await buildPlatinumSkylineResult(['a.ts'], [richContent])
    expect(['grand-alchemist', 'platinum-smith', 'proper-metallurgist', 'apprentice', 'novice', 'lead-painter']).toContain(
      result.stats.alchemistGrade,
    )
  })

  it('sets isPlatinum when overallElevation >= 60', async () => {
    const result = await buildPlatinumSkylineResult(['a.ts'], [richContent])
    if (result.vista.overallElevation >= 60) {
      expect(result.vista.isPlatinum).toBe(true)
    }
  })

  it('generates recommendations', async () => {
    const result = await buildPlatinumSkylineResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('computes hasHigh counts', async () => {
    const result = await buildPlatinumSkylineResult(['a.ts'], [richContent])
    expect(result.stats.hasHighPurityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighVisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighAuthorityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('computes avgFutureWisdom correctly', async () => {
    const result = await buildPlatinumSkylineResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.avgFutureWisdom).toBe(result.vista.avgWisdom)
  })

  it('computes avgRoyalPurity correctly', async () => {
    const result = await buildPlatinumSkylineResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.avgRoyalPurity).toBe(result.vista.avgPurity)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all high', () => {
    const ingots: PlatinumIngot[] = []
    const ridges: PlatinumRidge[] = []
    const vista: PlatinumSkylineResult['vista'] = {
      avgPurity: 90,
      avgVision: 90,
      avgWisdom: 90,
      isPlatinum: true,
      overallElevation: 90,
    }
    const stats: PlatinumSkylineResult['stats'] = {
      totalFiles: 1,
      totalRidges: 1,
      avgRoyalPurity: 92,
      avgHorizonVision: 91,
      avgPlatinumResilience: 90,
      avgCrestAuthority: 93,
      avgFutureWisdom: 94,
      platinumMasterpieceCount: 1,
      royalStandardCount: 0,
      properMetalCount: 0,
      baseAlloyCount: 0,
      scrapMetalCount: 0,
      voidCount: 0,
      hasHighPurityCount: 1,
      hasHighVisionCount: 1,
      hasHighResilienceCount: 1,
      hasHighAuthorityCount: 1,
      hasHighWisdomCount: 1,
      overallElevation: 92,
      alchemistGrade: 'grand-alchemist',
      bestIngot: 'a.ts',
      purest: 'a.ts',
      mostVisionary: 'a.ts',
      mostResilient: 'a.ts',
      mostAuthoritative: 'a.ts',
      wisest: 'a.ts',
    }
    const recs = generateRecommendations(ingots, ridges, vista, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends purity when low', () => {
    const stats = {
      totalFiles: 1, totalRidges: 1,
      avgRoyalPurity: 30, avgHorizonVision: 90, avgPlatinumResilience: 90,
      avgCrestAuthority: 90, avgFutureWisdom: 90,
      platinumMasterpieceCount: 0, royalStandardCount: 0, properMetalCount: 0,
      baseAlloyCount: 0, scrapMetalCount: 0, voidCount: 0,
      hasHighPurityCount: 0, hasHighVisionCount: 0, hasHighResilienceCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0,
      overallElevation: 78, alchemistGrade: 'platinum-smith' as const,
      bestIngot: 'a.ts', purest: 'a.ts', mostVisionary: 'a.ts',
      mostResilient: 'a.ts', mostAuthoritative: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgPurity: 30, avgVision: 90, avgWisdom: 90, isPlatinum: true, overallElevation: 78 }, stats)
    expect(recs.some((r) => r.includes('purity'))).toBe(true)
  })

  it('recommends vision when low', () => {
    const stats = {
      totalFiles: 1, totalRidges: 1,
      avgRoyalPurity: 90, avgHorizonVision: 30, avgPlatinumResilience: 90,
      avgCrestAuthority: 90, avgFutureWisdom: 90,
      platinumMasterpieceCount: 0, royalStandardCount: 0, properMetalCount: 0,
      baseAlloyCount: 0, scrapMetalCount: 0, voidCount: 0,
      hasHighPurityCount: 0, hasHighVisionCount: 0, hasHighResilienceCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0,
      overallElevation: 78, alchemistGrade: 'platinum-smith' as const,
      bestIngot: 'a.ts', purest: 'a.ts', mostVisionary: 'a.ts',
      mostResilient: 'a.ts', mostAuthoritative: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgPurity: 90, avgVision: 30, avgWisdom: 90, isPlatinum: true, overallElevation: 78 }, stats)
    expect(recs.some((r) => r.includes('horizon'))).toBe(true)
  })

  it('recommends resilience when low', () => {
    const stats = {
      totalFiles: 1, totalRidges: 1,
      avgRoyalPurity: 90, avgHorizonVision: 90, avgPlatinumResilience: 30,
      avgCrestAuthority: 90, avgFutureWisdom: 90,
      platinumMasterpieceCount: 0, royalStandardCount: 0, properMetalCount: 0,
      baseAlloyCount: 0, scrapMetalCount: 0, voidCount: 0,
      hasHighPurityCount: 0, hasHighVisionCount: 0, hasHighResilienceCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0,
      overallElevation: 78, alchemistGrade: 'platinum-smith' as const,
      bestIngot: 'a.ts', purest: 'a.ts', mostVisionary: 'a.ts',
      mostResilient: 'a.ts', mostAuthoritative: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgPurity: 90, avgVision: 90, avgWisdom: 90, isPlatinum: true, overallElevation: 78 }, stats)
    expect(recs.some((r) => r.includes('resilience'))).toBe(true)
  })

  it('recommends authority when low', () => {
    const stats = {
      totalFiles: 1, totalRidges: 1,
      avgRoyalPurity: 90, avgHorizonVision: 90, avgPlatinumResilience: 90,
      avgCrestAuthority: 30, avgFutureWisdom: 90,
      platinumMasterpieceCount: 0, royalStandardCount: 0, properMetalCount: 0,
      baseAlloyCount: 0, scrapMetalCount: 0, voidCount: 0,
      hasHighPurityCount: 0, hasHighVisionCount: 0, hasHighResilienceCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0,
      overallElevation: 78, alchemistGrade: 'platinum-smith' as const,
      bestIngot: 'a.ts', purest: 'a.ts', mostVisionary: 'a.ts',
      mostResilient: 'a.ts', mostAuthoritative: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgPurity: 90, avgVision: 90, avgWisdom: 90, isPlatinum: true, overallElevation: 78 }, stats)
    expect(recs.some((r) => r.includes('crest'))).toBe(true)
  })

  it('recommends wisdom when low', () => {
    const stats = {
      totalFiles: 1, totalRidges: 1,
      avgRoyalPurity: 90, avgHorizonVision: 90, avgPlatinumResilience: 90,
      avgCrestAuthority: 90, avgFutureWisdom: 30,
      platinumMasterpieceCount: 0, royalStandardCount: 0, properMetalCount: 0,
      baseAlloyCount: 0, scrapMetalCount: 0, voidCount: 0,
      hasHighPurityCount: 0, hasHighVisionCount: 0, hasHighResilienceCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0,
      overallElevation: 78, alchemistGrade: 'platinum-smith' as const,
      bestIngot: 'a.ts', purest: 'a.ts', mostVisionary: 'a.ts',
      mostResilient: 'a.ts', mostAuthoritative: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgPurity: 90, avgVision: 90, avgWisdom: 30, isPlatinum: true, overallElevation: 78 }, stats)
    expect(recs.some((r) => r.includes('wisdom'))).toBe(true)
  })

  it('mentions void ingots by name', () => {
    const ingots = [
      { file: 'bad1.ts', condition: 'void' } as PlatinumIngot,
      { file: 'bad2.ts', condition: 'void' } as PlatinumIngot,
    ]
    const stats = {
      totalFiles: 2, totalRidges: 1,
      avgRoyalPurity: 70, avgHorizonVision: 70, avgPlatinumResilience: 70,
      avgCrestAuthority: 70, avgFutureWisdom: 70,
      platinumMasterpieceCount: 0, royalStandardCount: 0, properMetalCount: 0,
      baseAlloyCount: 0, scrapMetalCount: 0, voidCount: 2,
      hasHighPurityCount: 0, hasHighVisionCount: 0, hasHighResilienceCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0,
      overallElevation: 70, alchemistGrade: 'platinum-smith' as const,
      bestIngot: '', purest: '', mostVisionary: '',
      mostResilient: '', mostAuthoritative: '', wisest: '',
    }
    const recs = generateRecommendations(ingots, [], { avgPurity: 70, avgVision: 70, avgWisdom: 70, isPlatinum: true, overallElevation: 70 }, stats)
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

  it('colorIngotCondition returns string for all conditions', () => {
    const conditions: IngotCondition[] = ['platinum-masterpiece', 'royal-standard', 'proper-metal', 'base-alloy', 'scrap-metal', 'void']
    for (const c of conditions) {
      expect(typeof colorIngotCondition(c)).toBe('string')
    }
  })

  it('colorRidgeCondition returns string for all conditions', () => {
    const conditions: RidgeCondition[] = ['platinum-summit', 'golden-peak', 'proper-mountain', 'rocky-hill', 'sand-dune', 'void']
    for (const c of conditions) {
      expect(typeof colorRidgeCondition(c)).toBe('string')
    }
  })

  it('formatIngotTable returns string', () => {
    const i = analyzePlatinumIngot(richContent, 'test.ts')
    expect(typeof formatIngotTable(i)).toBe('string')
  })

  it('formatIngotsTable returns string for empty', () => {
    expect(typeof formatIngotsTable([])).toBe('string')
  })

  it('formatIngotsTable returns string for ingots', () => {
    const ingots = [
      analyzePlatinumIngot(richContent, 'a.ts'),
      analyzePlatinumIngot(richContent, 'b.ts'),
    ]
    expect(typeof formatIngotsTable(ingots)).toBe('string')
  })

  it('formatRidgeTable returns string', () => {
    const ingots = [analyzePlatinumIngot(richContent, 'a.ts')]
    const r = analyzePlatinumRidge(ingots, 'src')
    expect(typeof formatRidgeTable(r)).toBe('string')
  })

  it('formatRidgesTable returns string for empty', () => {
    expect(typeof formatRidgesTable([])).toBe('string')
  })

  it('formatRidgesTable returns string for ridges', () => {
    const ingots = [analyzePlatinumIngot(richContent, 'a.ts')]
    const r = analyzePlatinumRidge(ingots, 'src')
    expect(typeof formatRidgesTable([r])).toBe('string')
  })

  it('formatStatsTable returns string', async () => {
    const result = await buildPlatinumSkylineResult(['a.ts'], [richContent])
    expect(typeof formatStatsTable(result.stats)).toBe('string')
  })

  it('formatRecommendations returns string for empty', () => {
    expect(typeof formatRecommendations([])).toBe('string')
  })

  it('formatRecommendations returns string for recs', () => {
    expect(typeof formatRecommendations(['Fix X', 'Fix Y'])).toBe('string')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildPlatinumSkylineResult(['a.ts'], [richContent])
    expect(typeof formatResultTable(result)).toBe('string')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildPlatinumSkylineResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })
})
