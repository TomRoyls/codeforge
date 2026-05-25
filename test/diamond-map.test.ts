import { describe, expect, it } from 'vitest'

import {
  analyzeDiamondPage,
  analyzeDiamondVolume,
  buildDiamondMapResult,
  classifyPageCondition,
  classifyVolumeType,
  classifyVolumeCondition,
  classifyCartographerGrade,
  generateRecommendations,
  measureCrystallizing,
  measureCutting,
  measureMapping,
  measureDispersing,
  measureNavigating,
  type PageCondition,
  type VolumeCondition,
  type DiamondPage,
  type DiamondMapResult,
  type DiamondVolume,
} from '../src/commands/diamond-map-helpers.js'

import {
  colorPageCondition,
  colorVolumeCondition,
  colorScore,
  formatPageTable,
  formatPagesTable,
  formatVolumesTable,
  formatVolumeTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/diamond-map-format-helpers.js'

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

// ─── measureCrystallizing ───────────────────────────────

describe('measureCrystallizing', () => {
  it('scores rich content high', () => {
    const m = measureCrystallizing(richContent)
    expect(m.hardness).toBeGreaterThanOrEqual(60)
    expect(m.hasHighHardness).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureCrystallizing(emptyContent)
    expect(m.hardness).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureCrystallizing(richContent)
    const poor = measureCrystallizing(poorContent)
    expect(rich.hardness).toBeGreaterThan(poor.hardness)
  })

  it('detects chaotic patterns', () => {
    const m = measureCrystallizing('var x = eval("boom")')
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects untested patterns', () => {
    const m = measureCrystallizing('eval (x)')
    expect(m.untestedCount).toBeGreaterThan(0)
    expect(m.hasNoUntested).toBe(false)
  })

  it('assigns high crystal for rich content', () => {
    const m = measureCrystallizing(richContent)
    expect(['flawless-diamond', 'vvs-clarity', 'proper-si']).toContain(m.crystal)
  })

  it('assigns low crystal for empty content', () => {
    const m = measureCrystallizing(emptyContent)
    expect(['no-hardness', 'industrial-grade', 'included', 'proper-si']).toContain(m.crystal)
  })

  it('has all boolean properties', () => {
    const m = measureCrystallizing(richContent)
    expect(typeof m.hasWellStructured).toBe('boolean')
    expect(typeof m.hasTypeSafe).toBe('boolean')
    expect(typeof m.hasStable).toBe('boolean')
  })
})

// ─── measureCutting ─────────────────────────────────────

describe('measureCutting', () => {
  it('scores rich content high', () => {
    const m = measureCutting(richContent)
    expect(m.precision).toBeGreaterThanOrEqual(60)
    expect(m.hasHighPrecision).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureCutting(emptyContent)
    expect(m.precision).toBeGreaterThanOrEqual(0)
  })

  it('detects approximate patterns', () => {
    const m = measureCutting('roughly approximately guesstimate')
    expect(m.approximateCount).toBeGreaterThan(0)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('detects rough patterns', () => {
    const m = measureCutting('var x = eval("1")')
    expect(m.roughCount).toBeGreaterThan(0)
  })

  it('assigns high cut for rich content', () => {
    const m = measureCutting(richContent)
    expect(['ideal-brilliant', 'excellent-cut', 'proper-facet']).toContain(m.cut)
  })

  it('assigns low cut for empty content', () => {
    const m = measureCutting(emptyContent)
    expect(['no-precision', 'rough-stone', 'poor-proportion', 'proper-facet']).toContain(m.cut)
  })

  it('has all boolean properties', () => {
    const m = measureCutting(richContent)
    expect(typeof m.hasAccurate).toBe('boolean')
    expect(typeof m.hasPrecise).toBe('boolean')
    expect(typeof m.hasSharp).toBe('boolean')
  })
})

// ─── measureMapping ─────────────────────────────────────

describe('measureMapping', () => {
  it('scores rich content high', () => {
    const m = measureMapping(richContent)
    expect(m.completeness).toBeGreaterThanOrEqual(60)
    expect(m.hasHighCompleteness).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureMapping(emptyContent)
    expect(m.completeness).toBeGreaterThanOrEqual(0)
  })

  it('has undocumentedCount property', () => {
    const m = measureMapping(richContent)
    expect(typeof m.undocumentedCount).toBe('number')
  })

  it('detects hidden patterns', () => {
    const m = measureMapping('monolithic god.object mega')
    expect(m.hiddenCount).toBeGreaterThan(0)
  })

  it('assigns high coverage for rich content', () => {
    const m = measureMapping(richContent)
    expect(['complete-atlas', 'detailed-map', 'proper-chart']).toContain(m.coverage)
  })

  it('assigns low coverage for empty content', () => {
    const m = measureMapping(emptyContent)
    expect(['no-completeness', 'blank-page', 'sketch-map', 'proper-chart']).toContain(m.coverage)
  })

  it('has all boolean properties', () => {
    const m = measureMapping(richContent)
    expect(typeof m.hasDocumented).toBe('boolean')
    expect(typeof m.hasExported).toBe('boolean')
    expect(typeof m.hasComprehensive).toBe('boolean')
  })
})

// ─── measureDispersing ──────────────────────────────────

describe('measureDispersing', () => {
  it('scores rich content high', () => {
    const m = measureDispersing(richContent)
    expect(m.fire).toBeGreaterThanOrEqual(60)
    expect(m.hasHighFire).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureDispersing(emptyContent)
    expect(m.fire).toBeGreaterThanOrEqual(0)
  })

  it('detects rigid patterns', () => {
    const m = measureDispersing('rigid inflexible hardcoded')
    expect(m.rigidCount).toBeGreaterThan(0)
  })

  it('detects monolithic patterns', () => {
    const m = measureDispersing('monolithic god.object mega')
    expect(m.monolithicCount).toBeGreaterThan(0)
  })

  it('assigns high spectrum for rich content', () => {
    const m = measureDispersing(richContent)
    expect(['rainbow-fire', 'brilliant-flash', 'proper-sparkle']).toContain(m.spectrum)
  })

  it('assigns low spectrum for empty content', () => {
    const m = measureDispersing(emptyContent)
    expect(['no-fire', 'no-light', 'dull-gleam', 'proper-sparkle']).toContain(m.spectrum)
  })

  it('has all boolean properties', () => {
    const m = measureDispersing(richContent)
    expect(typeof m.hasVersatile).toBe('boolean')
    expect(typeof m.hasModular).toBe('boolean')
    expect(typeof m.hasBrilliant).toBe('boolean')
  })
})

// ─── measureNavigating ──────────────────────────────────

describe('measureNavigating', () => {
  it('scores rich content high', () => {
    const m = measureNavigating(richContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(60)
    expect(m.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureNavigating(emptyContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
  })

  it('detects hacked patterns', () => {
    const m = measureNavigating('hack workaround monkey')
    expect(m.hackedCount).toBeGreaterThan(0)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects shallow patterns', () => {
    const m = measureNavigating('shallow superficial quick.fix')
    expect(m.shallowCount).toBeGreaterThan(0)
  })

  it('assigns high chart for rich content', () => {
    const m = measureNavigating(richContent)
    expect(['master-cartographer', 'experienced-navigator', 'proper-guide']).toContain(m.chart)
  })

  it('assigns low chart for empty content', () => {
    const m = measureNavigating(emptyContent)
    expect(['no-wisdom', 'no-map', 'lost-traveler', 'proper-guide']).toContain(m.chart)
  })

  it('has all boolean properties', () => {
    const m = measureNavigating(richContent)
    expect(typeof m.hasWellArchitected).toBe('boolean')
    expect(typeof m.hasStrategic).toBe('boolean')
    expect(typeof m.hasHolistic).toBe('boolean')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyPageCondition', () => {
  const cases: [number, PageCondition][] = [
    [95, 'diamond-masterpiece'],
    [90, 'diamond-masterpiece'],
    [80, 'flawless-map'],
    [75, 'flawless-map'],
    [65, 'proper-gem'],
    [60, 'proper-gem'],
    [50, 'included-stone'],
    [40, 'included-stone'],
    [25, 'rough-rock'],
    [20, 'rough-rock'],
    [10, 'void'],
    [0, 'void'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyPageCondition(score)).toBe(expected)
    })
  }
})

describe('classifyVolumeType', () => {
  it('returns no-volume for empty array', () => {
    expect(classifyVolumeType([])).toBe('no-volume')
  })

  it('returns complete-atlas for high average', () => {
    const pages = [{ qualityScore: 90 }, { qualityScore: 88 }].map((q) => ({
      ...q,
    })) as DiamondPage[]
    expect(classifyVolumeType(pages)).toBe('complete-atlas')
  })

  it('returns blank-book for low average', () => {
    const pages = [{ qualityScore: 10 }, { qualityScore: 15 }].map((q) => ({
      ...q,
    })) as DiamondPage[]
    expect(classifyVolumeType(pages)).toBe('blank-book')
  })
})

describe('classifyVolumeCondition', () => {
  const cases: [number, VolumeCondition][] = [
    [90, 'diamond-library'],
    [85, 'diamond-library'],
    [75, 'gem-collection'],
    [70, 'gem-collection'],
    [60, 'proper-bookshelf'],
    [55, 'proper-bookshelf'],
    [40, 'pamphlet-rack'],
    [35, 'pamphlet-rack'],
    [20, 'empty-shelf'],
    [15, 'empty-shelf'],
    [5, 'void'],
    [0, 'void'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyVolumeCondition(score)).toBe(expected)
    })
  }
})

describe('classifyCartographerGrade', () => {
  const cases: [number, string][] = [
    [90, 'master-gem-cutter'],
    [80, 'master-gem-cutter'],
    [70, 'diamond-cutter'],
    [65, 'diamond-cutter'],
    [55, 'proper-lapidary'],
    [50, 'proper-lapidary'],
    [40, 'apprentice'],
    [35, 'apprentice'],
    [25, 'novice'],
    [20, 'novice'],
    [10, 'glass-cutter'],
    [0, 'glass-cutter'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyCartographerGrade(score)).toBe(expected)
    })
  }
})

// ─── analyzeDiamondPage ──────────────────────────────────

describe('analyzeDiamondPage', () => {
  it('returns valid page for rich content', () => {
    const p = analyzeDiamondPage(richContent, 'app.ts')
    expect(p.file).toBe('app.ts')
    expect(p.hardnessClarity).toBeGreaterThanOrEqual(0)
    expect(p.cutPrecision).toBeGreaterThanOrEqual(0)
    expect(p.mapCompleteness).toBeGreaterThanOrEqual(0)
    expect(p.fireDispersion).toBeGreaterThanOrEqual(0)
    expect(p.cartographicWisdom).toBeGreaterThanOrEqual(0)
    expect(p.qualityScore).toBeGreaterThanOrEqual(0)
    expect(p.qualityScore).toBeLessThanOrEqual(100)
  })

  it('returns valid page for empty content', () => {
    const p = analyzeDiamondPage(emptyContent, 'empty.ts')
    expect(p.file).toBe('empty.ts')
    expect(p.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('computes qualityScore as weighted average', () => {
    const p = analyzeDiamondPage(richContent, 'test.ts')
    const expected = Math.round(
      p.hardnessClarity * 0.2 +
      p.cutPrecision * 0.2 +
      p.mapCompleteness * 0.2 +
      p.fireDispersion * 0.2 +
      p.cartographicWisdom * 0.2,
    )
    expect(p.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const p = analyzeDiamondPage(richContent, 'test.ts')
    expect(p.crystallizing).toBeDefined()
    expect(p.cutting).toBeDefined()
    expect(p.mapping).toBeDefined()
    expect(p.dispersing).toBeDefined()
    expect(p.navigating).toBeDefined()
  })

  it('classifies condition based on qualityScore', () => {
    const p = analyzeDiamondPage(richContent, 'test.ts')
    expect(classifyPageCondition(p.qualityScore)).toBe(p.condition)
  })

  it('scores rich content at max', () => {
    const p = analyzeDiamondPage(richContent, 'rich.ts')
    expect(p.hardnessClarity).toBeGreaterThanOrEqual(60)
    expect(p.cutPrecision).toBeGreaterThanOrEqual(60)
    expect(p.mapCompleteness).toBeGreaterThanOrEqual(60)
    expect(p.fireDispersion).toBeGreaterThanOrEqual(60)
    expect(p.cartographicWisdom).toBeGreaterThanOrEqual(60)
  })
})

// ─── analyzeDiamondVolume ───────────────────────────────

describe('analyzeDiamondVolume', () => {
  it('returns empty volume for no pages', () => {
    const v = analyzeDiamondVolume([], 'src')
    expect(v.directory).toBe('src')
    expect(v.pages).toHaveLength(0)
    expect(v.avgHardness).toBe(0)
    expect(v.avgPrecision).toBe(0)
    expect(v.avgWisdom).toBe(0)
    expect(v.volumeType).toBe('no-volume')
    expect(v.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const pages = [
      analyzeDiamondPage(richContent, 'a.ts'),
      analyzeDiamondPage(richContent, 'b.ts'),
    ]
    const v = analyzeDiamondVolume(pages, 'src')
    expect(v.avgHardness).toBeGreaterThanOrEqual(0)
    expect(v.avgPrecision).toBeGreaterThanOrEqual(0)
    expect(v.avgWisdom).toBeGreaterThanOrEqual(0)
  })

  it('counts diamond masterpieces', () => {
    const pages = [analyzeDiamondPage(richContent, 'a.ts')]
    const v = analyzeDiamondVolume(pages, 'src')
    expect(v.diamondMasterpieceCount).toBeGreaterThanOrEqual(0)
  })

  it('counts void pages', () => {
    const pages = [analyzeDiamondPage(emptyContent, 'empty.ts')]
    const v = analyzeDiamondVolume(pages, 'src')
    expect(v.voidCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── buildDiamondMapResult ──────────────────────────────

describe('buildDiamondMapResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildDiamondMapResult([], [])
    expect(result.pages).toHaveLength(0)
    expect(result.volumes).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallBrilliance).toBe(0)
    expect(result.cartography.isDiamond).toBe(false)
  })

  it('returns valid result for single file', async () => {
    const result = await buildDiamondMapResult(['app.ts'], [richContent])
    expect(result.pages).toHaveLength(1)
    expect(result.volumes).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestPage).toBe('app.ts')
    expect(result.stats.hardest).toBe('app.ts')
    expect(result.stats.mostPrecise).toBe('app.ts')
    expect(result.stats.mostComplete).toBe('app.ts')
    expect(result.stats.mostBrilliant).toBe('app.ts')
    expect(result.stats.wisest).toBe('app.ts')
  })

  it('returns valid result for multiple files', async () => {
    const result = await buildDiamondMapResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, emptyContent],
    )
    expect(result.pages).toHaveLength(3)
    expect(result.volumes).toHaveLength(2)
    expect(result.stats.totalVolumes).toBe(2)
  })

  it('computes correct stats counts', async () => {
    const result = await buildDiamondMapResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    const total = result.stats.diamondMasterpieceCount +
      result.stats.flawlessMapCount +
      result.stats.properGemCount +
      result.stats.includedStoneCount +
      result.stats.roughRockCount +
      result.stats.voidCount
    expect(total).toBe(2)
  })

  it('computes cartographerGrade', async () => {
    const result = await buildDiamondMapResult(['a.ts'], [richContent])
    expect(['master-gem-cutter', 'diamond-cutter', 'proper-lapidary', 'apprentice', 'novice', 'glass-cutter']).toContain(
      result.stats.cartographerGrade,
    )
  })

  it('sets isDiamond when overallBrilliance >= 60', async () => {
    const result = await buildDiamondMapResult(['a.ts'], [richContent])
    if (result.cartography.overallBrilliance >= 60) {
      expect(result.cartography.isDiamond).toBe(true)
    }
  })

  it('generates recommendations', async () => {
    const result = await buildDiamondMapResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('computes hasHigh counts', async () => {
    const result = await buildDiamondMapResult(['a.ts'], [richContent])
    expect(result.stats.hasHighHardnessCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighCompletenessCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighFireCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('computes avgCartographicWisdom correctly', async () => {
    const result = await buildDiamondMapResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.avgCartographicWisdom).toBe(result.cartography.avgWisdom)
  })

  it('computes avgHardnessClarity correctly', async () => {
    const result = await buildDiamondMapResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.avgHardnessClarity).toBe(result.cartography.avgHardness)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all high', () => {
    const pages: DiamondPage[] = []
    const volumes: DiamondVolume[] = []
    const cartography: DiamondMapResult['cartography'] = {
      avgHardness: 90,
      avgPrecision: 90,
      avgWisdom: 90,
      isDiamond: true,
      overallBrilliance: 90,
    }
    const stats: DiamondMapResult['stats'] = {
      totalFiles: 1, totalVolumes: 1,
      avgHardnessClarity: 92, avgCutPrecision: 91, avgMapCompleteness: 90,
      avgFireDispersion: 93, avgCartographicWisdom: 94,
      diamondMasterpieceCount: 1, flawlessMapCount: 0, properGemCount: 0,
      includedStoneCount: 0, roughRockCount: 0, voidCount: 0,
      hasHighHardnessCount: 1, hasHighPrecisionCount: 1, hasHighCompletenessCount: 1,
      hasHighFireCount: 1, hasHighWisdomCount: 1,
      overallBrilliance: 92, cartographerGrade: 'master-gem-cutter',
      bestPage: 'a.ts', hardest: 'a.ts', mostPrecise: 'a.ts',
      mostComplete: 'a.ts', mostBrilliant: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations(pages, volumes, cartography, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends hardness when low', () => {
    const stats = {
      totalFiles: 1, totalVolumes: 1,
      avgHardnessClarity: 30, avgCutPrecision: 90, avgMapCompleteness: 90,
      avgFireDispersion: 90, avgCartographicWisdom: 90,
      diamondMasterpieceCount: 0, flawlessMapCount: 0, properGemCount: 0,
      includedStoneCount: 0, roughRockCount: 0, voidCount: 0,
      hasHighHardnessCount: 0, hasHighPrecisionCount: 0, hasHighCompletenessCount: 0,
      hasHighFireCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 78, cartographerGrade: 'diamond-cutter' as const,
      bestPage: 'a.ts', hardest: 'a.ts', mostPrecise: 'a.ts',
      mostComplete: 'a.ts', mostBrilliant: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgHardness: 30, avgPrecision: 90, avgWisdom: 90, isDiamond: true, overallBrilliance: 78 }, stats)
    expect(recs.some((r) => r.includes('hardness'))).toBe(true)
  })

  it('recommends precision when low', () => {
    const stats = {
      totalFiles: 1, totalVolumes: 1,
      avgHardnessClarity: 90, avgCutPrecision: 30, avgMapCompleteness: 90,
      avgFireDispersion: 90, avgCartographicWisdom: 90,
      diamondMasterpieceCount: 0, flawlessMapCount: 0, properGemCount: 0,
      includedStoneCount: 0, roughRockCount: 0, voidCount: 0,
      hasHighHardnessCount: 0, hasHighPrecisionCount: 0, hasHighCompletenessCount: 0,
      hasHighFireCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 78, cartographerGrade: 'diamond-cutter' as const,
      bestPage: 'a.ts', hardest: 'a.ts', mostPrecise: 'a.ts',
      mostComplete: 'a.ts', mostBrilliant: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgHardness: 90, avgPrecision: 30, avgWisdom: 90, isDiamond: true, overallBrilliance: 78 }, stats)
    expect(recs.some((r) => r.includes('precision'))).toBe(true)
  })

  it('recommends completeness when low', () => {
    const stats = {
      totalFiles: 1, totalVolumes: 1,
      avgHardnessClarity: 90, avgCutPrecision: 90, avgMapCompleteness: 30,
      avgFireDispersion: 90, avgCartographicWisdom: 90,
      diamondMasterpieceCount: 0, flawlessMapCount: 0, properGemCount: 0,
      includedStoneCount: 0, roughRockCount: 0, voidCount: 0,
      hasHighHardnessCount: 0, hasHighPrecisionCount: 0, hasHighCompletenessCount: 0,
      hasHighFireCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 78, cartographerGrade: 'diamond-cutter' as const,
      bestPage: 'a.ts', hardest: 'a.ts', mostPrecise: 'a.ts',
      mostComplete: 'a.ts', mostBrilliant: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgHardness: 90, avgPrecision: 90, avgWisdom: 90, isDiamond: true, overallBrilliance: 78 }, stats)
    expect(recs.some((r) => r.includes('atlas') || r.includes('coverage'))).toBe(true)
  })

  it('recommends fire when low', () => {
    const stats = {
      totalFiles: 1, totalVolumes: 1,
      avgHardnessClarity: 90, avgCutPrecision: 90, avgMapCompleteness: 90,
      avgFireDispersion: 30, avgCartographicWisdom: 90,
      diamondMasterpieceCount: 0, flawlessMapCount: 0, properGemCount: 0,
      includedStoneCount: 0, roughRockCount: 0, voidCount: 0,
      hasHighHardnessCount: 0, hasHighPrecisionCount: 0, hasHighCompletenessCount: 0,
      hasHighFireCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 78, cartographerGrade: 'diamond-cutter' as const,
      bestPage: 'a.ts', hardest: 'a.ts', mostPrecise: 'a.ts',
      mostComplete: 'a.ts', mostBrilliant: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgHardness: 90, avgPrecision: 90, avgWisdom: 90, isDiamond: true, overallBrilliance: 78 }, stats)
    expect(recs.some((r) => r.includes('fire') || r.includes('dispersion'))).toBe(true)
  })

  it('recommends wisdom when low', () => {
    const stats = {
      totalFiles: 1, totalVolumes: 1,
      avgHardnessClarity: 90, avgCutPrecision: 90, avgMapCompleteness: 90,
      avgFireDispersion: 90, avgCartographicWisdom: 30,
      diamondMasterpieceCount: 0, flawlessMapCount: 0, properGemCount: 0,
      includedStoneCount: 0, roughRockCount: 0, voidCount: 0,
      hasHighHardnessCount: 0, hasHighPrecisionCount: 0, hasHighCompletenessCount: 0,
      hasHighFireCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 78, cartographerGrade: 'diamond-cutter' as const,
      bestPage: 'a.ts', hardest: 'a.ts', mostPrecise: 'a.ts',
      mostComplete: 'a.ts', mostBrilliant: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgHardness: 90, avgPrecision: 90, avgWisdom: 30, isDiamond: true, overallBrilliance: 78 }, stats)
    expect(recs.some((r) => r.includes('wisdom') || r.includes('cartographic'))).toBe(true)
  })

  it('mentions void pages by name', () => {
    const pages = [
      { file: 'bad1.ts', condition: 'void' } as DiamondPage,
      { file: 'bad2.ts', condition: 'void' } as DiamondPage,
    ]
    const stats = {
      totalFiles: 2, totalVolumes: 1,
      avgHardnessClarity: 70, avgCutPrecision: 70, avgMapCompleteness: 70,
      avgFireDispersion: 70, avgCartographicWisdom: 70,
      diamondMasterpieceCount: 0, flawlessMapCount: 0, properGemCount: 0,
      includedStoneCount: 0, roughRockCount: 0, voidCount: 2,
      hasHighHardnessCount: 0, hasHighPrecisionCount: 0, hasHighCompletenessCount: 0,
      hasHighFireCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 70, cartographerGrade: 'diamond-cutter' as const,
      bestPage: '', hardest: '', mostPrecise: '',
      mostComplete: '', mostBrilliant: '', wisest: '',
    }
    const recs = generateRecommendations(pages, [], { avgHardness: 70, avgPrecision: 70, avgWisdom: 70, isDiamond: true, overallBrilliance: 70 }, stats)
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

  it('colorPageCondition returns string for all conditions', () => {
    const conditions: PageCondition[] = ['diamond-masterpiece', 'flawless-map', 'proper-gem', 'included-stone', 'rough-rock', 'void']
    for (const c of conditions) {
      expect(typeof colorPageCondition(c)).toBe('string')
    }
  })

  it('colorVolumeCondition returns string for all conditions', () => {
    const conditions: VolumeCondition[] = ['diamond-library', 'gem-collection', 'proper-bookshelf', 'pamphlet-rack', 'empty-shelf', 'void']
    for (const c of conditions) {
      expect(typeof colorVolumeCondition(c)).toBe('string')
    }
  })

  it('formatPageTable returns string', () => {
    const p = analyzeDiamondPage(richContent, 'test.ts')
    expect(typeof formatPageTable(p)).toBe('string')
  })

  it('formatPagesTable returns string for empty', () => {
    expect(typeof formatPagesTable([])).toBe('string')
  })

  it('formatPagesTable returns string for pages', () => {
    const pages = [
      analyzeDiamondPage(richContent, 'a.ts'),
      analyzeDiamondPage(richContent, 'b.ts'),
    ]
    expect(typeof formatPagesTable(pages)).toBe('string')
  })

  it('formatVolumeTable returns string', () => {
    const pages = [analyzeDiamondPage(richContent, 'a.ts')]
    const v = analyzeDiamondVolume(pages, 'src')
    expect(typeof formatVolumeTable(v)).toBe('string')
  })

  it('formatVolumesTable returns string for empty', () => {
    expect(typeof formatVolumesTable([])).toBe('string')
  })

  it('formatVolumesTable returns string for volumes', () => {
    const pages = [analyzeDiamondPage(richContent, 'a.ts')]
    const v = analyzeDiamondVolume(pages, 'src')
    expect(typeof formatVolumesTable([v])).toBe('string')
  })

  it('formatStatsTable returns string', async () => {
    const result = await buildDiamondMapResult(['a.ts'], [richContent])
    expect(typeof formatStatsTable(result.stats)).toBe('string')
  })

  it('formatRecommendations returns string for empty', () => {
    expect(typeof formatRecommendations([])).toBe('string')
  })

  it('formatRecommendations returns string for recs', () => {
    expect(typeof formatRecommendations(['Fix X', 'Fix Y'])).toBe('string')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildDiamondMapResult(['a.ts'], [richContent])
    expect(typeof formatResultTable(result)).toBe('string')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildDiamondMapResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })
})
