import { describe, it, expect } from 'vitest'
import {
  measurePreserving,
  measureEncapsulating,
  measureClarifying,
  measureMaturing,
  measureResisting,
  classifyResinCondition,
  classifyCollectionType,
  classifyCuratorGrade,
  classifyCollectionCondition,
  analyzeAmberResin,
  analyzeAmberCollection,
  buildAmberAmberResult,
  generateRecommendations,
} from '../src/commands/amber-amber-helpers.js'
import {
  colorScore,
  colorGrade,
  formatResinTable,
  formatResinsTable,
  formatCollectionTable,
  formatCollectionsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/amber-amber-format-helpers.js'

// ─── Test Fixtures ──────────────────────────────────────────────────

const minimalContent = 'const x = 1'

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
    const result = readFileSync(input, 'utf8')
    if (result === 'test') {
      return JSON.parse(result) as Result
    }
    return {} as Result
  }
}

export const defaultConfig: Options = { name: 'test' }
`

// ─── measurePreserving ─────────────────────────────────────────────

describe('measurePreserving', () => {
  it('returns 0 for empty content', () => {
    const m = measurePreserving('')
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('fossilized')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measurePreserving(minimalContent)
    expect(m.quality).toBe(8)
    expect(m.grade).toBe('fossilized')
    expect(m.hasLasting).toBe(false)
    expect(m.hasNoFleeting).toBe(true)
    expect(m.hasNoVolatile).toBe(true)
    expect(m.fleetingCount).toBe(0)
    expect(m.volatileCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measurePreserving(richContent)
    expect(m.quality).toBe(100)
    expect(m.grade).toBe('perfect-preservation')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasLasting).toBe(true)
    expect(m.hasEnduring).toBe(true)
    expect(m.hasStable).toBe(true)
    expect(m.hasPermanent).toBe(true)
    expect(m.hasConserved).toBe(true)
    expect(m.hasMaintained).toBe(true)
  })

  it('detects fleeting var usage', () => {
    const m = measurePreserving('var x = 1')
    expect(m.fleetingCount).toBe(1)
    expect(m.hasNoFleeting).toBe(false)
  })

  it('detects volatile any usage', () => {
    const m = measurePreserving('const x: any = 1')
    expect(m.volatileCount).toBe(1)
    expect(m.hasNoVolatile).toBe(false)
  })

  it('detects eval as temporary', () => {
    const m = measurePreserving('eval("1")')
    expect(m.hasNoTemporary).toBe(false)
  })

  it('detects debugger as eroding', () => {
    const m = measurePreserving('debugger')
    expect(m.hasNoEroding).toBe(false)
  })
})

// ─── measureEncapsulating ──────────────────────────────────────────

describe('measureEncapsulating', () => {
  it('returns 0 for empty content', () => {
    const m = measureEncapsulating('')
    expect(m.quality).toBe(0)
    expect(m.inclusion).toBe('no-trap')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureEncapsulating(minimalContent)
    expect(m.quality).toBe(8)
    expect(m.inclusion).toBe('no-trap')
    expect(m.hasEncapsulated).toBe(false)
    expect(m.hasNoLeaking).toBe(true)
    expect(m.hasNoExposed).toBe(true)
    expect(m.leakingCount).toBe(0)
    expect(m.exposedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureEncapsulating(richContent)
    expect(m.quality).toBe(100)
    expect(m.inclusion).toBe('perfect-trap')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasEncapsulated).toBe(true)
    expect(m.hasContained).toBe(true)
    expect(m.hasEnclosed).toBe(true)
    expect(m.hasWrapped).toBe(true)
    expect(m.hasSealed).toBe(true)
    expect(m.hasIsolated).toBe(true)
  })

  it('detects leaking var usage', () => {
    const m = measureEncapsulating('var x = 1')
    expect(m.leakingCount).toBe(1)
    expect(m.hasNoLeaking).toBe(false)
  })

  it('detects exposed any usage', () => {
    const m = measureEncapsulating('const x: any = 1')
    expect(m.exposedCount).toBe(1)
    expect(m.hasNoExposed).toBe(false)
  })
})

// ─── measureClarifying ─────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns 0 for empty content', () => {
    const m = measureClarifying('')
    expect(m.transparency).toBe(0)
    expect(m.clarity).toBe('dark-amber')
    expect(m.hasHighTransparency).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureClarifying(minimalContent)
    expect(m.transparency).toBe(0)
    expect(m.clarity).toBe('dark-amber')
    expect(m.hasTransparent).toBe(false)
    expect(m.hasNoOpaque).toBe(true)
    expect(m.hasNoHidden).toBe(true)
    expect(m.opaqueCount).toBe(0)
    expect(m.hiddenCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureClarifying(richContent)
    expect(m.transparency).toBe(100)
    expect(m.clarity).toBe('crystal-clear')
    expect(m.hasHighTransparency).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasRevealing).toBe(true)
    expect(m.hasOpen).toBe(true)
    expect(m.hasLucid).toBe(true)
  })

  it('detects opaque var usage', () => {
    const m = measureClarifying('var x = 1')
    expect(m.opaqueCount).toBe(1)
    expect(m.hasNoOpaque).toBe(false)
  })

  it('detects hidden any usage', () => {
    const m = measureClarifying('const x: any = 1')
    expect(m.hiddenCount).toBe(1)
    expect(m.hasNoHidden).toBe(false)
  })
})

// ─── measureMaturing ───────────────────────────────────────────────

describe('measureMaturing', () => {
  it('returns 0 for empty content', () => {
    const m = measureMaturing('')
    expect(m.wisdom).toBe(0)
    expect(m.age).toBe('fresh-sap')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureMaturing(minimalContent)
    expect(m.wisdom).toBe(8)
    expect(m.age).toBe('fresh-sap')
    expect(m.hasMature).toBe(false)
    expect(m.hasNoNaive).toBe(true)
    expect(m.hasNoUntried).toBe(true)
    expect(m.naiveCount).toBe(0)
    expect(m.untriedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureMaturing(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.age).toBe('ancient-wisdom')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasExperienced).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasReliable).toBe(true)
    expect(m.hasBattleHardened).toBe(true)
  })

  it('detects naive var usage', () => {
    const m = measureMaturing('var x = 1')
    expect(m.naiveCount).toBe(1)
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects untried any usage', () => {
    const m = measureMaturing('const x: any = 1')
    expect(m.untriedCount).toBe(1)
    expect(m.hasNoUntried).toBe(false)
  })
})

// ─── measureResisting ──────────────────────────────────────────────

describe('measureResisting', () => {
  it('returns 0 for empty content', () => {
    const m = measureResisting('')
    expect(m.resistance).toBe(0)
    expect(m.fracture).toBe('shattered')
    expect(m.hasHighResistance).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureResisting(minimalContent)
    expect(m.resistance).toBe(0)
    expect(m.fracture).toBe('shattered')
    expect(m.hasRobust).toBe(false)
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasNoBrittle).toBe(true)
    expect(m.fragileCount).toBe(0)
    expect(m.brittleCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureResisting(richContent)
    expect(m.resistance).toBe(100)
    expect(m.fracture).toBe('unbreakable-amber')
    expect(m.hasHighResistance).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasDurable).toBe(true)
    expect(m.hasTough).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasHard).toBe(true)
    expect(m.hasSolid).toBe(true)
  })

  it('detects fragile var usage', () => {
    const m = measureResisting('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects brittle any usage', () => {
    const m = measureResisting('const x: any = 1')
    expect(m.brittleCount).toBe(1)
    expect(m.hasNoBrittle).toBe(false)
  })
})

// ─── classifyResinCondition ────────────────────────────────────────

describe('classifyResinCondition', () => {
  it('classifies museum-piece for 85+', () => {
    expect(classifyResinCondition(85)).toBe('museum-piece')
    expect(classifyResinCondition(100)).toBe('museum-piece')
  })

  it('classifies fine-amber for 70-84', () => {
    expect(classifyResinCondition(70)).toBe('fine-amber')
    expect(classifyResinCondition(84)).toBe('fine-amber')
  })

  it('classifies proper-resin for 55-69', () => {
    expect(classifyResinCondition(55)).toBe('proper-resin')
    expect(classifyResinCondition(69)).toBe('proper-resin')
  })

  it('classifies cloudy-amber for 40-54', () => {
    expect(classifyResinCondition(40)).toBe('cloudy-amber')
    expect(classifyResinCondition(54)).toBe('cloudy-amber')
  })

  it('classifies cracked-resin for 25-39', () => {
    expect(classifyResinCondition(25)).toBe('cracked-resin')
    expect(classifyResinCondition(39)).toBe('cracked-resin')
  })

  it('classifies dust for 0-24', () => {
    expect(classifyResinCondition(0)).toBe('dust')
    expect(classifyResinCondition(24)).toBe('dust')
  })
})

// ─── classifyCollectionType ────────────────────────────────────────

describe('classifyCollectionType', () => {
  it('returns no-amber for empty resins', () => {
    expect(classifyCollectionType([])).toBe('no-amber')
  })

  it('classifies museum-collection for high avg + high museum ratio', () => {
    const resins = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeAmberResin(richContent, `f${i}.ts`),
    }))
    expect(classifyCollectionType(resins)).toBe('museum-collection')
  })

  it('classifies no-amber for low scores', () => {
    const resins = [analyzeAmberResin('', 'a.ts')]
    expect(classifyCollectionType(resins)).toBe('no-amber')
  })

  it('classifies jewelry-box for mid-high scores', () => {
    const resins = Array.from({ length: 3 }, () => ({
      ...analyzeAmberResin(richContent, 'f.ts'),
      qualityScore: 65,
      condition: 'fine-amber' as const,
    }))
    expect(classifyCollectionType(resins)).toBe('jewelry-box')
  })

  it('classifies proper-display for mid scores', () => {
    const resins = Array.from({ length: 3 }, () => ({
      ...analyzeAmberResin(richContent, 'f.ts'),
      qualityScore: 50,
      condition: 'proper-resin' as const,
    }))
    expect(classifyCollectionType(resins)).toBe('proper-display')
  })

  it('classifies beach-pebble for very low scores', () => {
    const resins = Array.from({ length: 3 }, () => ({
      ...analyzeAmberResin(richContent, 'f.ts'),
      qualityScore: 18,
      condition: 'dust' as const,
    }))
    expect(classifyCollectionType(resins)).toBe('beach-pebble')
  })
})

// ─── classifyCuratorGrade ──────────────────────────────────────────

describe('classifyCuratorGrade', () => {
  it('classifies master-curator for 80+', () => {
    expect(classifyCuratorGrade(80)).toBe('master-curator')
    expect(classifyCuratorGrade(100)).toBe('master-curator')
  })

  it('classifies amber-expert for 65-79', () => {
    expect(classifyCuratorGrade(65)).toBe('amber-expert')
    expect(classifyCuratorGrade(79)).toBe('amber-expert')
  })

  it('classifies skilled-collector for 50-64', () => {
    expect(classifyCuratorGrade(50)).toBe('skilled-collector')
    expect(classifyCuratorGrade(64)).toBe('skilled-collector')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyCuratorGrade(35)).toBe('apprentice')
    expect(classifyCuratorGrade(49)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyCuratorGrade(20)).toBe('novice')
    expect(classifyCuratorGrade(34)).toBe('novice')
  })

  it('classifies fossil-fuel for 0-19', () => {
    expect(classifyCuratorGrade(0)).toBe('fossil-fuel')
    expect(classifyCuratorGrade(19)).toBe('fossil-fuel')
  })
})

// ─── classifyCollectionCondition ───────────────────────────────────

describe('classifyCollectionCondition', () => {
  it('classifies pristine-collection for 75+', () => {
    expect(classifyCollectionCondition(75)).toBe('pristine-collection')
  })

  it('classifies well-curated for 60-74', () => {
    expect(classifyCollectionCondition(60)).toBe('well-curated')
  })

  it('classifies decent-display for 45-59', () => {
    expect(classifyCollectionCondition(45)).toBe('decent-display')
  })

  it('classifies dusty-shelf for 30-44', () => {
    expect(classifyCollectionCondition(30)).toBe('dusty-shelf')
  })

  it('classifies forgotten-box for 15-29', () => {
    expect(classifyCollectionCondition(15)).toBe('forgotten-box')
  })

  it('classifies empty for 0-14', () => {
    expect(classifyCollectionCondition(0)).toBe('empty')
  })
})

// ─── analyzeAmberResin ─────────────────────────────────────────────

describe('analyzeAmberResin', () => {
  it('analyzes minimal content', () => {
    const resin = analyzeAmberResin(minimalContent, 'minimal.ts')
    expect(resin.file).toBe('minimal.ts')
    expect(resin.preservationQuality).toBe(8)
    expect(resin.inclusionQuality).toBe(8)
    expect(resin.transparency).toBe(0)
    expect(resin.ageWisdom).toBe(8)
    expect(resin.fractureResistance).toBe(0)
    expect(resin.qualityScore).toBe(5)
    expect(resin.condition).toBe('dust')
    expect(resin.preserving.grade).toBe('fossilized')
    expect(resin.encapsulating.inclusion).toBe('no-trap')
    expect(resin.clarifying.clarity).toBe('dark-amber')
    expect(resin.maturing.age).toBe('fresh-sap')
    expect(resin.resisting.fracture).toBe('shattered')
  })

  it('analyzes rich content', () => {
    const resin = analyzeAmberResin(richContent, 'rich.ts')
    expect(resin.file).toBe('rich.ts')
    expect(resin.preservationQuality).toBe(100)
    expect(resin.inclusionQuality).toBe(100)
    expect(resin.transparency).toBe(100)
    expect(resin.ageWisdom).toBe(100)
    expect(resin.fractureResistance).toBe(100)
    expect(resin.qualityScore).toBe(100)
    expect(resin.condition).toBe('museum-piece')
    expect(resin.preserving.grade).toBe('perfect-preservation')
    expect(resin.encapsulating.inclusion).toBe('perfect-trap')
    expect(resin.clarifying.clarity).toBe('crystal-clear')
    expect(resin.maturing.age).toBe('ancient-wisdom')
    expect(resin.resisting.fracture).toBe('unbreakable-amber')
  })

  it('computes qualityScore as weighted average', () => {
    const resin = analyzeAmberResin('export const x = 1', 'mid.ts')
    const expected = Math.round(
      resin.preservationQuality * 0.2 +
      resin.inclusionQuality * 0.2 +
      resin.transparency * 0.2 +
      resin.ageWisdom * 0.2 +
      resin.fractureResistance * 0.2,
    )
    expect(resin.qualityScore).toBe(expected)
  })
})

// ─── analyzeAmberCollection ────────────────────────────────────────

describe('analyzeAmberCollection', () => {
  it('returns empty collection for empty resins', () => {
    const collection = analyzeAmberCollection([], 'empty-dir')
    expect(collection.directory).toBe('empty-dir')
    expect(collection.resins).toHaveLength(0)
    expect(collection.avgPreservation).toBe(0)
    expect(collection.collectionType).toBe('no-amber')
    expect(collection.condition).toBe('empty')
  })

  it('analyzes collection with rich resins', () => {
    const resins = [
      analyzeAmberResin(richContent, 'dir/a.ts'),
      analyzeAmberResin(richContent, 'dir/b.ts'),
    ]
    const collection = analyzeAmberCollection(resins, 'dir')
    expect(collection.avgPreservation).toBe(100)
    expect(collection.museumPieceCount).toBe(2)
    expect(collection.dustCount).toBe(0)
    expect(collection.collectionType).toBe('museum-collection')
  })

  it('analyzes collection with mixed resins', () => {
    const resins = [
      analyzeAmberResin(richContent, 'dir/a.ts'),
      analyzeAmberResin(minimalContent, 'dir/b.ts'),
    ]
    const collection = analyzeAmberCollection(resins, 'dir')
    expect(collection.museumPieceCount).toBe(1)
    expect(collection.dustCount).toBe(1)
  })
})

// ─── buildAmberAmberResult ─────────────────────────────────────────

describe('buildAmberAmberResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildAmberAmberResult([], [])
    expect(result.resins).toHaveLength(0)
    expect(result.collections).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallPreservation).toBe(0)
    expect(result.stats.curatorGrade).toBe('fossil-fuel')
    expect(result.museum.isPreserved).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildAmberAmberResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.resins).toHaveLength(2)
    expect(result.collections).toHaveLength(1)
    expect(result.stats.avgPreservationQuality).toBe(100)
    expect(result.stats.avgInclusionQuality).toBe(100)
    expect(result.stats.avgTransparency).toBe(100)
    expect(result.stats.avgAgeWisdom).toBe(100)
    expect(result.stats.avgFractureResistance).toBe(100)
    expect(result.stats.museumPieceCount).toBe(2)
    expect(result.stats.dustCount).toBe(0)
    expect(result.stats.hasHighQualityCount).toBe(2)
    expect(result.stats.hasHighEncapsulationCount).toBe(2)
    expect(result.stats.hasHighTransparencyCount).toBe(2)
    expect(result.stats.hasHighWisdomCount).toBe(2)
    expect(result.stats.hasHighResistanceCount).toBe(2)
    expect(result.stats.overallPreservation).toBe(100)
    expect(result.stats.curatorGrade).toBe('master-curator')
    expect(result.museum.isPreserved).toBe(true)
    expect(result.stats.bestResin).toBeTruthy()
    expect(result.stats.bestPreserved).toBeTruthy()
    expect(result.stats.bestEncapsulated).toBeTruthy()
    expect(result.stats.mostTransparent).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildAmberAmberResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.collections).toHaveLength(2)
    const dirs = result.collections.map(c => c.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall preservation correctly', async () => {
    const result = await buildAmberAmberResult(['a.ts'], [minimalContent])
    expect(result.museum.overallPreservation).toBe(Math.round((8 + 0 + 0) / 3))
  })

  it('sets isPreserved when avgPreservation >= 60', async () => {
    const result = await buildAmberAmberResult(['a.ts'], [richContent])
    expect(result.museum.isPreserved).toBe(true)
  })

  it('sets isPreserved false when avgPreservation < 60', async () => {
    const result = await buildAmberAmberResult(['a.ts'], [minimalContent])
    expect(result.museum.isPreserved).toBe(false)
  })

  it('picks best resin by qualityScore', async () => {
    const result = await buildAmberAmberResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestResin).toBe('high.ts')
    expect(result.stats.bestPreserved).toBe('high.ts')
    expect(result.stats.bestEncapsulated).toBe('high.ts')
    expect(result.stats.mostTransparent).toBe('high.ts')
    expect(result.stats.wisest).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildAmberAmberResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.museumPieceCount).toBe(1)
    expect(result.stats.dustCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildAmberAmberResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your amber collection is museum-quality! Every resin perfectly preserves its golden clarity',
    ])
  })

  it('recommends improving preservation when low', async () => {
    const result = await buildAmberAmberResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('preservation'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving inclusion when low', async () => {
    const result = await buildAmberAmberResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('inclusion'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving transparency when low', async () => {
    const result = await buildAmberAmberResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('transparency'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving age wisdom when low', async () => {
    const result = await buildAmberAmberResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('wisdom'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving fracture resistance when low', async () => {
    const result = await buildAmberAmberResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('fracture'))
    expect(rec).toBeTruthy()
  })

  it('warns about dust files', async () => {
    const result = await buildAmberAmberResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('dust'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall preservation', async () => {
    const result = await buildAmberAmberResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Overall amber preservation'))
    expect(rec).toBeTruthy()
  })

  it('lists specific dust files to restore', async () => {
    const result = await buildAmberAmberResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Restore these'))
    expect(rec).toBeTruthy()
  })

  it('warns when all collections are beach-pebbles/no-amber', async () => {
    const result = await buildAmberAmberResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('beach pebbles or empty'))
    expect(rec).toBeTruthy()
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for score 90', () => {
    expect(typeof colorScore(90)).toBe('string')
  })

  it('returns a string for score 50', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns a string for score 10', () => {
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for museum-piece', () => {
    expect(typeof colorGrade('museum-piece')).toBe('string')
  })

  it('returns a string for dust', () => {
    expect(typeof colorGrade('dust')).toBe('string')
  })

  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatResinTable', () => {
  it('formats a resin', () => {
    const resin = analyzeAmberResin(richContent, 'test.ts')
    const output = formatResinTable(resin)
    expect(output).toContain('test.ts')
    expect(output).toContain('Preservation')
    expect(output).toContain('Inclusion')
    expect(output).toContain('Transparency')
    expect(output).toContain('Age Wisdom')
    expect(output).toContain('Fracture Resistance')
  })
})

describe('formatResinsTable', () => {
  it('handles empty resins', () => {
    const output = formatResinsTable([])
    expect(output).toContain('No amber resins')
  })

  it('formats multiple resins', () => {
    const resins = [
      analyzeAmberResin(richContent, 'a.ts'),
      analyzeAmberResin(minimalContent, 'b.ts'),
    ]
    const output = formatResinsTable(resins)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatCollectionTable', () => {
  it('formats a collection', () => {
    const resins = [analyzeAmberResin(richContent, 'dir/a.ts')]
    const collection = analyzeAmberCollection(resins, 'dir')
    const output = formatCollectionTable(collection)
    expect(output).toContain('dir')
    expect(output).toContain('Collection')
  })
})

describe('formatCollectionsTable', () => {
  it('handles empty collections', () => {
    const output = formatCollectionsTable([])
    expect(output).toContain('No amber collections')
  })

  it('formats multiple collections', () => {
    const resins = [analyzeAmberResin(richContent, 'src/a.ts')]
    const collections = [analyzeAmberCollection(resins, 'src')]
    const output = formatCollectionsTable(collections)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildAmberAmberResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Amber Amber Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Curator Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildAmberAmberResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Amber Resin Analysis')
    expect(output).toContain('Amber Collection Analysis')
    expect(output).toContain('Amber Amber Statistics')
    expect(output).toContain('Museum')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildAmberAmberResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.resins).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.museum.isPreserved).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const resin = analyzeAmberResin('   \n\t  ', 'blank.ts')
    expect(resin.preservationQuality).toBe(0)
    expect(resin.qualityScore).toBe(0)
    expect(resin.condition).toBe('dust')
  })

  it('handles content with only comments', () => {
    const resin = analyzeAmberResin('// just a comment\n/* block */', 'comment.ts')
    expect(resin.preservationQuality).toBe(0)
    expect(resin.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildAmberAmberResult(['big.ts'], [longContent])
    expect(result.resins).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildAmberAmberResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.museumPieceCount).toBe(50)
  })

  it('handles single file collection', async () => {
    const result = await buildAmberAmberResult(['single.ts'], [richContent])
    expect(result.collections).toHaveLength(1)
    expect(result.collections[0]!.resins).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const resin = analyzeAmberResin(richContent, 'cap.ts')
    expect(resin.qualityScore).toBeLessThanOrEqual(100)
    expect(resin.preservationQuality).toBeLessThanOrEqual(100)
    expect(resin.inclusionQuality).toBeLessThanOrEqual(100)
    expect(resin.transparency).toBeLessThanOrEqual(100)
    expect(resin.ageWisdom).toBeLessThanOrEqual(100)
    expect(resin.fractureResistance).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildAmberAmberResult([], [])
    const r2 = await buildAmberAmberResult(['a.ts'], [richContent])
    const r3 = await buildAmberAmberResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
