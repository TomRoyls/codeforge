import { describe, it, expect } from 'vitest'
import {
  measureClarifying,
  measureResisting,
  measureStructuring,
  measureUniqueing,
  measureStabilizing,
  classifyFrostCondition,
  classifyLandscapeType,
  classifyCryomancerGrade,
  classifyLandscapeCondition,
  analyzeFrostCrystal,
  analyzeWinterLandscape,
  buildWinterFrostResult,
  generateRecommendations,
} from '../src/commands/winter-frost-helpers.js'
import {
  colorScore,
  colorGrade,
  formatCrystalTable,
  formatCrystalsTable,
  formatLandscapeTable,
  formatLandscapesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/winter-frost-format-helpers.js'

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

// ─── measureClarifying ─────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns 0 for empty content', () => {
    const m = measureClarifying('')
    expect(m.clarity).toBe(0)
    expect(m.grade).toBe('opaque-frost')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBe(8)
    expect(m.grade).toBe('opaque-frost')
    expect(m.hasClear).toBe(false)
    expect(m.hasNoMuddy).toBe(true)
    expect(m.hasNoOpaque).toBe(true)
    expect(m.muddyCount).toBe(0)
    expect(m.opaqueCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBe(100)
    expect(m.grade).toBe('ice-crystal')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasLucid).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasPristine).toBe(true)
    expect(m.hasPure).toBe(true)
  })

  it('detects muddy var usage', () => {
    const m = measureClarifying('var x = 1')
    expect(m.muddyCount).toBe(1)
    expect(m.hasNoMuddy).toBe(false)
  })

  it('detects opaque any usage', () => {
    const m = measureClarifying('const x: any = 1')
    expect(m.opaqueCount).toBe(1)
    expect(m.hasNoOpaque).toBe(false)
  })

  it('detects hidden eval usage', () => {
    const m = measureClarifying('eval("1")')
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects tainted debugger usage', () => {
    const m = measureClarifying('debugger')
    expect(m.hasNoTainted).toBe(false)
  })
})

// ─── measureResisting ──────────────────────────────────────────────

describe('measureResisting', () => {
  it('returns 0 for empty content', () => {
    const m = measureResisting('')
    expect(m.resistance).toBe(0)
    expect(m.freeze).toBe('frozen-solid')
    expect(m.hasHighResistance).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureResisting(minimalContent)
    expect(m.resistance).toBe(0)
    expect(m.freeze).toBe('frozen-solid')
    expect(m.hasResilient).toBe(false)
    expect(m.brittleCount).toBe(0)
    expect(m.fragileCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureResisting(richContent)
    expect(m.resistance).toBe(100)
    expect(m.freeze).toBe('antifreeze-grade')
    expect(m.hasHighResistance).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasHardened).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasTough).toBe(true)
    expect(m.hasAdaptive).toBe(true)
    expect(m.hasFlexible).toBe(true)
  })

  it('detects brittle var usage', () => {
    const m = measureResisting('var x = 1')
    expect(m.brittleCount).toBe(1)
    expect(m.hasNoBrittle).toBe(false)
  })

  it('detects fragile any usage', () => {
    const m = measureResisting('const x: any = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects cracking eval usage', () => {
    const m = measureResisting('eval("1")')
    expect(m.hasNoCracking).toBe(false)
  })

  it('detects rigid debugger usage', () => {
    const m = measureResisting('debugger')
    expect(m.hasNoRigid).toBe(false)
  })
})

// ─── measureStructuring ────────────────────────────────────────────

describe('measureStructuring', () => {
  it('returns 0 for empty content', () => {
    const m = measureStructuring('')
    expect(m.quality).toBe(0)
    expect(m.structure).toBe('no-structure')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureStructuring(minimalContent)
    expect(m.quality).toBe(0)
    expect(m.structure).toBe('no-structure')
    expect(m.hasSolid).toBe(false)
    expect(m.chaoticCount).toBe(0)
    expect(m.amorphousCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureStructuring(richContent)
    expect(m.quality).toBe(100)
    expect(m.structure).toBe('diamond-ice')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasSolid).toBe(true)
    expect(m.hasOrganized).toBe(true)
    expect(m.hasStructured).toBe(true)
    expect(m.hasCrystalline).toBe(true)
    expect(m.hasOrdered).toBe(true)
    expect(m.hasRegular).toBe(true)
  })

  it('detects chaotic var usage', () => {
    const m = measureStructuring('var x = 1')
    expect(m.chaoticCount).toBe(1)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects amorphous any usage', () => {
    const m = measureStructuring('const x: any = 1')
    expect(m.amorphousCount).toBe(1)
    expect(m.hasNoRandom).toBe(false)
  })
})

// ─── measureUniqueing ──────────────────────────────────────────────

describe('measureUniqueing', () => {
  it('returns 0 for empty content', () => {
    const m = measureUniqueing('')
    expect(m.uniqueness).toBe(0)
    expect(m.flake).toBe('identical-copy')
    expect(m.hasHighUniqueness).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureUniqueing(minimalContent)
    expect(m.uniqueness).toBe(0)
    expect(m.flake).toBe('identical-copy')
    expect(m.hasOriginal).toBe(false)
    expect(m.derivativeCount).toBe(0)
    expect(m.clonedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureUniqueing(richContent)
    expect(m.uniqueness).toBe(100)
    expect(m.flake).toBe('unique-crystal')
    expect(m.hasHighUniqueness).toBe(true)
    expect(m.hasOriginal).toBe(true)
    expect(m.hasDistinct).toBe(true)
    expect(m.hasCreative).toBe(true)
    expect(m.hasInnovative).toBe(true)
    expect(m.hasFresh).toBe(true)
    expect(m.hasInventive).toBe(true)
  })

  it('detects derivative var usage', () => {
    const m = measureUniqueing('var x = 1')
    expect(m.derivativeCount).toBe(1)
    expect(m.hasNoDerivative).toBe(false)
  })

  it('detects cloned any usage', () => {
    const m = measureUniqueing('const x: any = 1')
    expect(m.clonedCount).toBe(1)
    expect(m.hasNoCloned).toBe(false)
  })

  it('detects formulaic eval usage', () => {
    const m = measureUniqueing('eval("1")')
    expect(m.hasNoFormulaic).toBe(false)
  })

  it('detects stale debugger usage', () => {
    const m = measureUniqueing('debugger')
    expect(m.hasNoStale).toBe(false)
  })
})

// ─── measureStabilizing ────────────────────────────────────────────

describe('measureStabilizing', () => {
  it('returns 0 for empty content', () => {
    const m = measureStabilizing('')
    expect(m.stability).toBe(0)
    expect(m.permafrost).toBe('melted')
    expect(m.hasHighStability).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureStabilizing(minimalContent)
    expect(m.stability).toBe(8)
    expect(m.permafrost).toBe('melted')
    expect(m.hasStable).toBe(false)
    expect(m.shiftingCount).toBe(0)
    expect(m.volatileCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureStabilizing(richContent)
    expect(m.stability).toBe(100)
    expect(m.permafrost).toBe('deep-permafrost')
    expect(m.hasHighStability).toBe(true)
    expect(m.hasStable).toBe(true)
    expect(m.hasEnduring).toBe(true)
    expect(m.hasPermanent).toBe(true)
    expect(m.hasReliable).toBe(true)
    expect(m.hasSolid).toBe(true)
    expect(m.hasLasting).toBe(true)
  })

  it('detects shifting var usage', () => {
    const m = measureStabilizing('var x = 1')
    expect(m.shiftingCount).toBe(1)
    expect(m.hasNoShifting).toBe(false)
  })

  it('detects volatile any usage', () => {
    const m = measureStabilizing('const x: any = 1')
    expect(m.volatileCount).toBe(1)
    expect(m.hasNoVolatile).toBe(false)
  })
})

// ─── classifyFrostCondition ────────────────────────────────────────

describe('classifyFrostCondition', () => {
  it('classifies ice-palace for 85+', () => {
    expect(classifyFrostCondition(85)).toBe('ice-palace')
    expect(classifyFrostCondition(100)).toBe('ice-palace')
  })

  it('classifies frost-garden for 70-84', () => {
    expect(classifyFrostCondition(70)).toBe('frost-garden')
    expect(classifyFrostCondition(84)).toBe('frost-garden')
  })

  it('classifies proper-frost for 55-69', () => {
    expect(classifyFrostCondition(55)).toBe('proper-frost')
    expect(classifyFrostCondition(69)).toBe('proper-frost')
  })

  it('classifies slush-puddle for 40-54', () => {
    expect(classifyFrostCondition(40)).toBe('slush-puddle')
    expect(classifyFrostCondition(54)).toBe('slush-puddle')
  })

  it('classifies ice-shard for 25-39', () => {
    expect(classifyFrostCondition(25)).toBe('ice-shard')
    expect(classifyFrostCondition(39)).toBe('ice-shard')
  })

  it('classifies dry-ground for 0-24', () => {
    expect(classifyFrostCondition(0)).toBe('dry-ground')
    expect(classifyFrostCondition(24)).toBe('dry-ground')
  })
})

// ─── classifyLandscapeType ────────────────────────────────────────

describe('classifyLandscapeType', () => {
  it('returns no-snow for empty crystals', () => {
    expect(classifyLandscapeType([])).toBe('no-snow')
  })

  it('classifies arctic-tundra for high avg + high palace ratio', () => {
    const crystals = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeFrostCrystal(richContent, `f${i}.ts`),
    }))
    expect(classifyLandscapeType(crystals)).toBe('arctic-tundra')
  })

  it('classifies no-snow for low scores', () => {
    const crystals = [analyzeFrostCrystal('', 'a.ts')]
    expect(classifyLandscapeType(crystals)).toBe('no-snow')
  })

  it('classifies winter-wonderland for mid-high scores', () => {
    const crystals = Array.from({ length: 3 }, () => ({
      ...analyzeFrostCrystal(richContent, 'f.ts'),
      qualityScore: 65,
      condition: 'frost-garden' as const,
    }))
    expect(classifyLandscapeType(crystals)).toBe('winter-wonderland')
  })

  it('classifies light-dusting for very low scores', () => {
    const crystals = Array.from({ length: 3 }, () => ({
      ...analyzeFrostCrystal(richContent, 'f.ts'),
      qualityScore: 18,
      condition: 'dry-ground' as const,
    }))
    expect(classifyLandscapeType(crystals)).toBe('light-dusting')
  })
})

// ─── classifyCryomancerGrade ──────────────────────────────────────

describe('classifyCryomancerGrade', () => {
  it('classifies ice-archmage for 80+', () => {
    expect(classifyCryomancerGrade(80)).toBe('ice-archmage')
    expect(classifyCryomancerGrade(100)).toBe('ice-archmage')
  })

  it('classifies frost-wizard for 65-79', () => {
    expect(classifyCryomancerGrade(65)).toBe('frost-wizard')
    expect(classifyCryomancerGrade(79)).toBe('frost-wizard')
  })

  it('classifies winter-sage for 50-64', () => {
    expect(classifyCryomancerGrade(50)).toBe('winter-sage')
    expect(classifyCryomancerGrade(64)).toBe('winter-sage')
  })

  it('classifies cold-acolyte for 35-49', () => {
    expect(classifyCryomancerGrade(35)).toBe('cold-acolyte')
    expect(classifyCryomancerGrade(49)).toBe('cold-acolyte')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyCryomancerGrade(20)).toBe('novice')
    expect(classifyCryomancerGrade(34)).toBe('novice')
  })

  it('classifies snowman for 0-19', () => {
    expect(classifyCryomancerGrade(0)).toBe('snowman')
    expect(classifyCryomancerGrade(19)).toBe('snowman')
  })
})

// ─── classifyLandscapeCondition ───────────────────────────────────

describe('classifyLandscapeCondition', () => {
  it('classifies pristine-winter for 75+', () => {
    expect(classifyLandscapeCondition(75)).toBe('pristine-winter')
  })

  it('classifies beautiful-frost for 60-74', () => {
    expect(classifyLandscapeCondition(60)).toBe('beautiful-frost')
  })

  it('classifies proper-cold for 45-59', () => {
    expect(classifyLandscapeCondition(45)).toBe('proper-cold')
  })

  it('classifies thawing for 30-44', () => {
    expect(classifyLandscapeCondition(30)).toBe('thawing')
  })

  it('classifies slushy for 15-29', () => {
    expect(classifyLandscapeCondition(15)).toBe('slushy')
  })

  it('classifies spring for 0-14', () => {
    expect(classifyLandscapeCondition(0)).toBe('spring')
  })
})

// ─── analyzeFrostCrystal ───────────────────────────────────────────

describe('analyzeFrostCrystal', () => {
  it('analyzes minimal content', () => {
    const crystal = analyzeFrostCrystal(minimalContent, 'minimal.ts')
    expect(crystal.file).toBe('minimal.ts')
    expect(crystal.crystalClarity).toBe(8)
    expect(crystal.freezeResistance).toBe(0)
    expect(crystal.iceStructure).toBe(0)
    expect(crystal.snowflakeUniqueness).toBe(0)
    expect(crystal.permafrostStability).toBe(8)
    expect(crystal.qualityScore).toBe(3)
    expect(crystal.condition).toBe('dry-ground')
    expect(crystal.clarifying.grade).toBe('opaque-frost')
    expect(crystal.resisting.freeze).toBe('frozen-solid')
    expect(crystal.structuring.structure).toBe('no-structure')
    expect(crystal.uniqueing.flake).toBe('identical-copy')
    expect(crystal.stabilizing.permafrost).toBe('melted')
  })

  it('analyzes rich content', () => {
    const crystal = analyzeFrostCrystal(richContent, 'rich.ts')
    expect(crystal.file).toBe('rich.ts')
    expect(crystal.crystalClarity).toBe(100)
    expect(crystal.freezeResistance).toBe(100)
    expect(crystal.iceStructure).toBe(100)
    expect(crystal.snowflakeUniqueness).toBe(100)
    expect(crystal.permafrostStability).toBe(100)
    expect(crystal.qualityScore).toBe(100)
    expect(crystal.condition).toBe('ice-palace')
    expect(crystal.clarifying.grade).toBe('ice-crystal')
    expect(crystal.resisting.freeze).toBe('antifreeze-grade')
    expect(crystal.structuring.structure).toBe('diamond-ice')
    expect(crystal.uniqueing.flake).toBe('unique-crystal')
    expect(crystal.stabilizing.permafrost).toBe('deep-permafrost')
  })

  it('computes qualityScore as weighted average', () => {
    const crystal = analyzeFrostCrystal('export const x = 1', 'mid.ts')
    const expected = Math.round(
      crystal.crystalClarity * 0.2 +
      crystal.freezeResistance * 0.2 +
      crystal.iceStructure * 0.2 +
      crystal.snowflakeUniqueness * 0.2 +
      crystal.permafrostStability * 0.2,
    )
    expect(crystal.qualityScore).toBe(expected)
  })
})

// ─── analyzeWinterLandscape ────────────────────────────────────────

describe('analyzeWinterLandscape', () => {
  it('returns empty landscape for empty crystals', () => {
    const landscape = analyzeWinterLandscape([], 'empty-dir')
    expect(landscape.directory).toBe('empty-dir')
    expect(landscape.crystals).toHaveLength(0)
    expect(landscape.avgClarity).toBe(0)
    expect(landscape.landscapeType).toBe('no-snow')
    expect(landscape.condition).toBe('spring')
  })

  it('analyzes landscape with rich crystals', () => {
    const crystals = [
      analyzeFrostCrystal(richContent, 'dir/a.ts'),
      analyzeFrostCrystal(richContent, 'dir/b.ts'),
    ]
    const landscape = analyzeWinterLandscape(crystals, 'dir')
    expect(landscape.avgClarity).toBe(100)
    expect(landscape.icePalaceCount).toBe(2)
    expect(landscape.dryGroundCount).toBe(0)
    expect(landscape.landscapeType).toBe('arctic-tundra')
  })

  it('analyzes landscape with mixed crystals', () => {
    const crystals = [
      analyzeFrostCrystal(richContent, 'dir/a.ts'),
      analyzeFrostCrystal(minimalContent, 'dir/b.ts'),
    ]
    const landscape = analyzeWinterLandscape(crystals, 'dir')
    expect(landscape.icePalaceCount).toBe(1)
    expect(landscape.dryGroundCount).toBe(1)
  })
})

// ─── buildWinterFrostResult ────────────────────────────────────────

describe('buildWinterFrostResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildWinterFrostResult([], [])
    expect(result.crystals).toHaveLength(0)
    expect(result.landscapes).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallFrost).toBe(0)
    expect(result.stats.cryomancerGrade).toBe('snowman')
    expect(result.tundra.isCrystalline).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildWinterFrostResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.crystals).toHaveLength(2)
    expect(result.landscapes).toHaveLength(1)
    expect(result.stats.avgCrystalClarity).toBe(100)
    expect(result.stats.avgFreezeResistance).toBe(100)
    expect(result.stats.avgIceStructure).toBe(100)
    expect(result.stats.avgSnowflakeUniqueness).toBe(100)
    expect(result.stats.avgPermafrostStability).toBe(100)
    expect(result.stats.icePalaceCount).toBe(2)
    expect(result.stats.dryGroundCount).toBe(0)
    expect(result.stats.hasHighClarityCount).toBe(2)
    expect(result.stats.hasHighResistanceCount).toBe(2)
    expect(result.stats.hasHighQualityCount).toBe(2)
    expect(result.stats.hasHighUniquenessCount).toBe(2)
    expect(result.stats.hasHighStabilityCount).toBe(2)
    expect(result.stats.overallFrost).toBe(100)
    expect(result.stats.cryomancerGrade).toBe('ice-archmage')
    expect(result.tundra.isCrystalline).toBe(true)
    expect(result.stats.bestCrystal).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostResistant).toBeTruthy()
    expect(result.stats.bestStructured).toBeTruthy()
    expect(result.stats.mostUnique).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildWinterFrostResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.landscapes).toHaveLength(2)
    const dirs = result.landscapes.map(l => l.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall frost correctly', async () => {
    const result = await buildWinterFrostResult(['a.ts'], [minimalContent])
    expect(result.tundra.overallFrost).toBe(Math.round((8 + 0 + 8) / 3))
  })

  it('sets isCrystalline when avgClarity >= 60', async () => {
    const result = await buildWinterFrostResult(['a.ts'], [richContent])
    expect(result.tundra.isCrystalline).toBe(true)
  })

  it('sets isCrystalline false when avgClarity < 60', async () => {
    const result = await buildWinterFrostResult(['a.ts'], [minimalContent])
    expect(result.tundra.isCrystalline).toBe(false)
  })

  it('picks best crystal by qualityScore', async () => {
    const result = await buildWinterFrostResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestCrystal).toBe('high.ts')
    expect(result.stats.clearest).toBe('high.ts')
    expect(result.stats.mostResistant).toBe('high.ts')
    expect(result.stats.bestStructured).toBe('high.ts')
    expect(result.stats.mostUnique).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildWinterFrostResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.icePalaceCount).toBe(1)
    expect(result.stats.dryGroundCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildWinterFrostResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your winter landscape is pristine! Every crystal displays perfect frost patterns',
    ])
  })

  it('recommends improving crystal clarity when low', async () => {
    const result = await buildWinterFrostResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('crystal clarity'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving freeze resistance when low', async () => {
    const result = await buildWinterFrostResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('freeze resistance'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving ice structure when low', async () => {
    const result = await buildWinterFrostResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('ice structure'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving snowflake uniqueness when low', async () => {
    const result = await buildWinterFrostResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('snowflake uniqueness'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving permafrost stability when low', async () => {
    const result = await buildWinterFrostResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('permafrost stability'))
    expect(rec).toBeTruthy()
  })

  it('warns about dry ground files', async () => {
    const result = await buildWinterFrostResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('dry ground'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall frost', async () => {
    const result = await buildWinterFrostResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Overall winter frost'))
    expect(rec).toBeTruthy()
  })

  it('lists specific dry ground files', async () => {
    const result = await buildWinterFrostResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Transform these'))
    expect(rec).toBeTruthy()
  })

  it('warns when all landscapes are light dustings/no-snow', async () => {
    const result = await buildWinterFrostResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('light dustings or bare'))
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
  it('returns a string for ice-palace', () => {
    expect(typeof colorGrade('ice-palace')).toBe('string')
  })

  it('returns a string for dry-ground', () => {
    expect(typeof colorGrade('dry-ground')).toBe('string')
  })

  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatCrystalTable', () => {
  it('formats a crystal', () => {
    const crystal = analyzeFrostCrystal(richContent, 'test.ts')
    const output = formatCrystalTable(crystal)
    expect(output).toContain('test.ts')
    expect(output).toContain('Crystal Clarity')
    expect(output).toContain('Freeze Resistance')
    expect(output).toContain('Ice Structure')
    expect(output).toContain('Snowflake Uniqueness')
    expect(output).toContain('Permafrost Stability')
  })
})

describe('formatCrystalsTable', () => {
  it('handles empty crystals', () => {
    const output = formatCrystalsTable([])
    expect(output).toContain('No frost crystals')
  })

  it('formats multiple crystals', () => {
    const crystals = [
      analyzeFrostCrystal(richContent, 'a.ts'),
      analyzeFrostCrystal(minimalContent, 'b.ts'),
    ]
    const output = formatCrystalsTable(crystals)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatLandscapeTable', () => {
  it('formats a landscape', () => {
    const crystals = [analyzeFrostCrystal(richContent, 'dir/a.ts')]
    const landscape = analyzeWinterLandscape(crystals, 'dir')
    const output = formatLandscapeTable(landscape)
    expect(output).toContain('dir')
    expect(output).toContain('Landscape')
  })
})

describe('formatLandscapesTable', () => {
  it('handles empty landscapes', () => {
    const output = formatLandscapesTable([])
    expect(output).toContain('No winter landscapes')
  })

  it('formats multiple landscapes', () => {
    const crystals = [analyzeFrostCrystal(richContent, 'src/a.ts')]
    const landscapes = [analyzeWinterLandscape(crystals, 'src')]
    const output = formatLandscapesTable(landscapes)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildWinterFrostResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Winter Frost Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Cryomancer Grade')
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
    const result = await buildWinterFrostResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Winter Frost Analysis')
    expect(output).toContain('Winter Landscape Analysis')
    expect(output).toContain('Winter Frost Statistics')
    expect(output).toContain('Tundra')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildWinterFrostResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.crystals).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.tundra.isCrystalline).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const crystal = analyzeFrostCrystal('   \n\t  ', 'blank.ts')
    expect(crystal.crystalClarity).toBe(0)
    expect(crystal.qualityScore).toBe(0)
    expect(crystal.condition).toBe('dry-ground')
  })

  it('handles content with only comments', () => {
    const crystal = analyzeFrostCrystal('// just a comment\n/* block */', 'comment.ts')
    expect(crystal.crystalClarity).toBe(0)
    expect(crystal.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildWinterFrostResult(['big.ts'], [longContent])
    expect(result.crystals).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildWinterFrostResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.icePalaceCount).toBe(50)
  })

  it('handles single file landscape', async () => {
    const result = await buildWinterFrostResult(['single.ts'], [richContent])
    expect(result.landscapes).toHaveLength(1)
    expect(result.landscapes[0]!.crystals).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const crystal = analyzeFrostCrystal(richContent, 'cap.ts')
    expect(crystal.qualityScore).toBeLessThanOrEqual(100)
    expect(crystal.crystalClarity).toBeLessThanOrEqual(100)
    expect(crystal.freezeResistance).toBeLessThanOrEqual(100)
    expect(crystal.iceStructure).toBeLessThanOrEqual(100)
    expect(crystal.snowflakeUniqueness).toBeLessThanOrEqual(100)
    expect(crystal.permafrostStability).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildWinterFrostResult([], [])
    const r2 = await buildWinterFrostResult(['a.ts'], [richContent])
    const r3 = await buildWinterFrostResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
