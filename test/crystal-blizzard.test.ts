import { describe, it, expect } from 'vitest'

import {
  measureCrystallizing,
  measureWeathering,
  measureRefracting,
  measureSculpting,
  measureFreezing,
  analyzeCrystalShard,
  analyzeCrystalStorm,
  buildCrystalBlizzardResult,
  classifyShardCondition,
  classifyStormType,
  classifyStormCondition,
  classifyFrostMageGrade,
  generateRecommendations,
  type CrystalShard,
} from '../src/commands/crystal-blizzard-helpers.js'

import {
  colorScore,
  colorCondition,
  colorStormCondition,
  formatShardTable,
  formatShardsTable,
  formatStormTable,
  formatStormsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/crystal-blizzard-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const emptyContent = ''

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

// ─── measureCrystallizing ───────────────────────────────

describe('measureCrystallizing', () => {
  it('returns all fields', () => {
    const result = measureCrystallizing(richContent)
    expect(result).toHaveProperty('precision')
    expect(result).toHaveProperty('crystal')
    expect(result).toHaveProperty('hasHighPrecision')
    expect(result).toHaveProperty('hasWellStructured')
    expect(result).toHaveProperty('hasNoChaotic')
    expect(result).toHaveProperty('hasTypeSafe')
    expect(result).toHaveProperty('hasNoUnsafe')
    expect(result).toHaveProperty('hasPrecise')
    expect(result).toHaveProperty('hasNoApproximate')
    expect(result).toHaveProperty('hasClean')
    expect(result).toHaveProperty('hasNoDirty')
    expect(result).toHaveProperty('hasOrganized')
    expect(result).toHaveProperty('hasModular')
    expect(result).toHaveProperty('hasConsistent')
    expect(result).toHaveProperty('hasUniform')
    expect(result).toHaveProperty('hasGeometric')
    expect(result).toHaveProperty('hasPatterned')
    expect(result).toHaveProperty('hasExact')
    expect(result).toHaveProperty('chaoticCount')
    expect(result).toHaveProperty('unsafeCount')
  })

  it('detects chaotic patterns (var, eval)', () => {
    const result = measureCrystallizing('var x = 1; eval("y")')
    expect(result.chaoticCount).toBe(2)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects type-safe code', () => {
    const result = measureCrystallizing(richContent)
    expect(result.hasTypeSafe).toBe(true)
    expect(result.hasNoUnsafe).toBe(true)
  })

  it('detects unsafe patterns (any)', () => {
    const result = measureCrystallizing('const x: any = 1')
    expect(result.unsafeCount).toBe(1)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects precise type annotations', () => {
    const result = measureCrystallizing(richContent)
    expect(result.hasPrecise).toBe(true)
  })

  it('detects organized code (import/export)', () => {
    const result = measureCrystallizing(richContent)
    expect(result.hasOrganized).toBe(true)
    expect(result.hasModular).toBe(true)
  })

  it('detects geometric patterns (class, interface, type)', () => {
    const result = measureCrystallizing(richContent)
    expect(result.hasGeometric).toBe(true)
  })

  it('classifies crystal correctly', () => {
    const result = measureCrystallizing(richContent)
    expect(result.crystal).toBeDefined()
  })

  it('detects dirty patterns', () => {
    const result = measureCrystallizing('dirty hacky code')
    expect(result.hasNoDirty).toBe(false)
  })
})

// ─── measureWeathering ──────────────────────────────────

describe('measureWeathering', () => {
  it('returns all fields', () => {
    const result = measureWeathering(richContent)
    expect(result).toHaveProperty('resilience')
    expect(result).toHaveProperty('storm')
    expect(result).toHaveProperty('hasHighResilience')
    expect(result).toHaveProperty('hasErrorHandled')
    expect(result).toHaveProperty('hasNoUnhandled')
    expect(result).toHaveProperty('hasDefensive')
    expect(result).toHaveProperty('hasRobust')
    expect(result).toHaveProperty('hasTested')
    expect(result).toHaveProperty('hasNoUntested')
    expect(result).toHaveProperty('hasStable')
    expect(result).toHaveProperty('hasNoVolatile')
    expect(result).toHaveProperty('hasHardened')
    expect(result).toHaveProperty('hasEnduring')
    expect(result).toHaveProperty('hasReinforced')
    expect(result).toHaveProperty('hasSolid')
    expect(result).toHaveProperty('hasFortified')
    expect(result).toHaveProperty('hasDurable')
    expect(result).toHaveProperty('hasImpervious')
    expect(result).toHaveProperty('unhandledCount')
    expect(result).toHaveProperty('untestedCount')
  })

  it('detects error handling', () => {
    const result = measureWeathering(richContent)
    expect(result.hasErrorHandled).toBe(true)
  })

  it('detects unhandled (any)', () => {
    const result = measureWeathering('const x: any = 1')
    expect(result.unhandledCount).toBe(1)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects untested (eval)', () => {
    const result = measureWeathering('eval("code")')
    expect(result.untestedCount).toBe(1)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects defensive code', () => {
    const result = measureWeathering(richContent)
    expect(result.hasDefensive).toBe(true)
  })

  it('detects hardened code (class, interface, type)', () => {
    const result = measureWeathering(richContent)
    expect(result.hasHardened).toBe(true)
  })

  it('detects durable code (async, await, Promise)', () => {
    const result = measureWeathering(richContent)
    expect(result.hasDurable).toBe(true)
  })

  it('detects impervious code', () => {
    const result = measureWeathering(richContent)
    expect(result.hasImpervious).toBe(true)
  })

  it('detects vulnerable patterns', () => {
    const result = measureWeathering('vulnerable code with exploit')
    expect(result.hasImpervious).toBe(false)
  })

  it('classifies storm correctly', () => {
    const result = measureWeathering(richContent)
    expect(result.storm).toBeDefined()
  })
})

// ─── measureRefracting ──────────────────────────────────

describe('measureRefracting', () => {
  it('returns all fields', () => {
    const result = measureRefracting(richContent)
    expect(result).toHaveProperty('clarity')
    expect(result).toHaveProperty('refraction')
    expect(result).toHaveProperty('hasHighClarity')
    expect(result).toHaveProperty('hasReadable')
    expect(result).toHaveProperty('hasNoCryptic')
    expect(result).toHaveProperty('hasSelfDocumenting')
    expect(result).toHaveProperty('hasNoMystery')
    expect(result).toHaveProperty('hasClear')
    expect(result).toHaveProperty('hasNoObfuscated')
    expect(result).toHaveProperty('hasTransparent')
    expect(result).toHaveProperty('hasUnderstandable')
    expect(result).toHaveProperty('hasVisible')
    expect(result).toHaveProperty('hasDirect')
    expect(result).toHaveProperty('hasDocumented')
    expect(result).toHaveProperty('hasRevealed')
    expect(result).toHaveProperty('hasIlluminated')
    expect(result).toHaveProperty('hasOpen')
    expect(result).toHaveProperty('hasLucid')
    expect(result).toHaveProperty('crypticCount')
    expect(result).toHaveProperty('obfuscatedCount')
  })

  it('detects readable code', () => {
    const result = measureRefracting(richContent)
    expect(result.hasReadable).toBe(true)
  })

  it('detects cryptic names', () => {
    const result = measureRefracting('const a = 1; const b = 2')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects documented code', () => {
    const result = measureRefracting(richContent)
    expect(result.hasDocumented).toBe(true)
    expect(result.hasRevealed).toBe(true)
  })

  it('detects mystery patterns', () => {
    const result = measureRefracting('const magic = 42')
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects clear type annotations', () => {
    const result = measureRefracting(richContent)
    expect(result.hasClear).toBe(true)
  })

  it('sets obfuscatedCount equal to crypticCount', () => {
    const result = measureRefracting('const a = 1')
    expect(result.obfuscatedCount).toBe(result.crypticCount)
  })

  it('classifies refraction correctly', () => {
    const result = measureRefracting(richContent)
    expect(result.refraction).toBeDefined()
  })
})

// ─── measureSculpting ───────────────────────────────────

describe('measureSculpting', () => {
  it('returns all fields', () => {
    const result = measureSculpting(richContent)
    expect(result).toHaveProperty('beauty')
    expect(result).toHaveProperty('sculpture')
    expect(result).toHaveProperty('hasHighBeauty')
    expect(result).toHaveProperty('hasElegant')
    expect(result).toHaveProperty('hasNoClunky')
    expect(result).toHaveProperty('hasRefined')
    expect(result).toHaveProperty('hasPolished')
    expect(result).toHaveProperty('hasClean')
    expect(result).toHaveProperty('hasFlowing')
    expect(result).toHaveProperty('hasGraceful')
    expect(result).toHaveProperty('hasHarmonious')
    expect(result).toHaveProperty('hasBalanced')
    expect(result).toHaveProperty('hasAesthetic')
    expect(result).toHaveProperty('hasCrafted')
    expect(result).toHaveProperty('hasSculpted')
    expect(result).toHaveProperty('hasIntentional')
    expect(result).toHaveProperty('hasArtistic')
    expect(result).toHaveProperty('hasBeautiful')
    expect(result).toHaveProperty('clunkyCount')
    expect(result).toHaveProperty('roughCount')
  })

  it('detects elegant code', () => {
    const result = measureSculpting(richContent)
    expect(result.hasElegant).toBe(true)
  })

  it('detects clunky patterns (eval)', () => {
    const result = measureSculpting('eval("code")')
    expect(result.clunkyCount).toBe(1)
    expect(result.hasNoClunky).toBe(false)
  })

  it('detects refined code (documentation)', () => {
    const result = measureSculpting(richContent)
    expect(result.hasRefined).toBe(true)
  })

  it('detects flowing code (async)', () => {
    const result = measureSculpting(richContent)
    expect(result.hasFlowing).toBe(true)
  })

  it('detects harmonious code (import/export)', () => {
    const result = measureSculpting(richContent)
    expect(result.hasHarmonious).toBe(true)
  })

  it('detects rough patterns (var, eval)', () => {
    const result = measureSculpting('var x = 1; eval("y")')
    expect(result.roughCount).toBe(2)
  })

  it('detects intentional code (no any)', () => {
    const result = measureSculpting(richContent)
    expect(result.hasIntentional).toBe(true)
  })

  it('classifies sculpture correctly', () => {
    const result = measureSculpting(richContent)
    expect(result.sculpture).toBeDefined()
  })
})

// ─── measureFreezing ────────────────────────────────────

describe('measureFreezing', () => {
  it('returns all fields', () => {
    const result = measureFreezing(richContent)
    expect(result).toHaveProperty('wisdom')
    expect(result).toHaveProperty('temperature')
    expect(result).toHaveProperty('hasHighWisdom')
    expect(result).toHaveProperty('hasWellArchitected')
    expect(result).toHaveProperty('hasNoHacked')
    expect(result).toHaveProperty('hasPrincipled')
    expect(result).toHaveProperty('hasNoAdHoc')
    expect(result).toHaveProperty('hasProven')
    expect(result).toHaveProperty('hasDeep')
    expect(result).toHaveProperty('hasNoShallow')
    expect(result).toHaveProperty('hasMature')
    expect(result).toHaveProperty('hasPatterned')
    expect(result).toHaveProperty('hasStrategic')
    expect(result).toHaveProperty('hasNoiseFree')
    expect(result).toHaveProperty('hasPure')
    expect(result).toHaveProperty('hasDistilled')
    expect(result).toHaveProperty('hasEssential')
    expect(result).toHaveProperty('hasConcentrated')
    expect(result).toHaveProperty('hackedCount')
    expect(result).toHaveProperty('adHocCount')
  })

  it('detects well-architected code', () => {
    const result = measureFreezing(richContent)
    expect(result.hasWellArchitected).toBe(true)
  })

  it('detects hacked patterns', () => {
    const result = measureFreezing('hack: workaround using monkey patch')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects ad-hoc patterns', () => {
    const result = measureFreezing('quick dirty temporary fix')
    expect(result.adHocCount).toBeGreaterThan(0)
    expect(result.hasNoAdHoc).toBe(false)
  })

  it('detects noise-free code', () => {
    const result = measureFreezing(richContent)
    expect(result.hasNoiseFree).toBe(true)
  })

  it('detects distilled code (documentation)', () => {
    const result = measureFreezing(richContent)
    expect(result.hasDistilled).toBe(true)
  })

  it('detects concentrated code (try, catch, if)', () => {
    const result = measureFreezing(richContent)
    expect(result.hasConcentrated).toBe(true)
  })

  it('classifies temperature correctly', () => {
    const result = measureFreezing(richContent)
    expect(result.temperature).toBeDefined()
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyShardCondition', () => {
  it('returns crystal-masterpiece for 90+', () => {
    expect(classifyShardCondition(90)).toBe('crystal-masterpiece')
    expect(classifyShardCondition(100)).toBe('crystal-masterpiece')
  })
  it('returns frozen-perfection for 75-89', () => {
    expect(classifyShardCondition(75)).toBe('frozen-perfection')
  })
  it('returns proper-ice for 60-74', () => {
    expect(classifyShardCondition(60)).toBe('proper-ice')
  })
  it('returns slush-pile for 40-59', () => {
    expect(classifyShardCondition(40)).toBe('slush-pile')
  })
  it('returns puddle for 20-39', () => {
    expect(classifyShardCondition(20)).toBe('puddle')
  })
  it('returns void for 0-19', () => {
    expect(classifyShardCondition(0)).toBe('void')
  })
})

describe('classifyStormType', () => {
  it('returns no-storm for empty', () => {
    expect(classifyStormType([])).toBe('no-storm')
  })
  it('returns arctic-hurricane for high avg', () => {
    const shards = [{ qualityScore: 90 }, { qualityScore: 90 }].map((t) => ({ ...t } as CrystalShard))
    expect(classifyStormType(shards)).toBe('arctic-hurricane')
  })
  it('returns no-storm for low avg', () => {
    const shards = [{ qualityScore: 10 }].map((t) => ({ ...t } as CrystalShard))
    expect(classifyStormType(shards)).toBe('no-storm')
  })
})

describe('classifyStormCondition', () => {
  it('returns ice-palace for 85+', () => {
    expect(classifyStormCondition(85)).toBe('ice-palace')
  })
  it('returns void for 0-14', () => {
    expect(classifyStormCondition(0)).toBe('void')
  })
})

describe('classifyFrostMageGrade', () => {
  it('returns archmage-of-frost for 80+', () => {
    expect(classifyFrostMageGrade(80)).toBe('archmage-of-frost')
  })
  it('returns sun-lover for 0-19', () => {
    expect(classifyFrostMageGrade(0)).toBe('sun-lover')
  })
  it('returns ice-wizard for 65-79', () => {
    expect(classifyFrostMageGrade(65)).toBe('ice-wizard')
  })
  it('returns winter-sage for 50-64', () => {
    expect(classifyFrostMageGrade(50)).toBe('winter-sage')
  })
  it('returns apprentice for 35-49', () => {
    expect(classifyFrostMageGrade(35)).toBe('apprentice')
  })
  it('returns novice for 20-34', () => {
    expect(classifyFrostMageGrade(20)).toBe('novice')
  })
})

// ─── analyzeCrystalShard ────────────────────────────────

describe('analyzeCrystalShard', () => {
  it('returns a complete shard', () => {
    const shard = analyzeCrystalShard(richContent, 'app.ts')
    expect(shard.file).toBe('app.ts')
    expect(shard.crystallinePrecision).toBeGreaterThanOrEqual(0)
    expect(shard.stormResilience).toBeGreaterThanOrEqual(0)
    expect(shard.shardClarity).toBeGreaterThanOrEqual(0)
    expect(shard.frozenBeauty).toBeGreaterThanOrEqual(0)
    expect(shard.iceWisdom).toBeGreaterThanOrEqual(0)
    expect(shard.qualityScore).toBeGreaterThanOrEqual(0)
    expect(shard.condition).toBeDefined()
  })

  it('computes qualityScore as 0.2 weighted average', () => {
    const shard = analyzeCrystalShard(richContent, 'test.ts')
    const expected = Math.round(
      shard.crystallinePrecision * 0.2 +
      shard.stormResilience * 0.2 +
      shard.shardClarity * 0.2 +
      shard.frozenBeauty * 0.2 +
      shard.iceWisdom * 0.2,
    )
    expect(shard.qualityScore).toBe(expected)
  })

  it('handles empty content', () => {
    const shard = analyzeCrystalShard(emptyContent, 'empty.ts')
    expect(shard.qualityScore).toBeLessThan(40)
  })
})

// ─── analyzeCrystalStorm ────────────────────────────────

describe('analyzeCrystalStorm', () => {
  it('returns empty storm for no shards', () => {
    const storm = analyzeCrystalStorm([], 'src')
    expect(storm.directory).toBe('src')
    expect(storm.shards).toHaveLength(0)
    expect(storm.avgPrecision).toBe(0)
    expect(storm.stormType).toBe('no-storm')
    expect(storm.condition).toBe('void')
  })

  it('computes averages from shards', () => {
    const shard = analyzeCrystalShard(richContent, 'app.ts')
    const storm = analyzeCrystalStorm([shard], 'src')
    expect(storm.avgPrecision).toBe(shard.crystallinePrecision)
    expect(storm.avgWisdom).toBe(shard.iceWisdom)
  })
})

// ─── buildCrystalBlizzardResult ─────────────────────────

describe('buildCrystalBlizzardResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildCrystalBlizzardResult([], [])
    expect(result.shards).toHaveLength(0)
    expect(result.storms).toHaveLength(0)
    expect(result.winter.isCrystalline).toBe(false)
    expect(result.stats.frostMageGrade).toBe('sun-lover')
  })

  it('returns complete result for rich content', async () => {
    const result = await buildCrystalBlizzardResult(['app.ts'], [richContent])
    expect(result.shards).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('groups files into storms by directory', async () => {
    const result = await buildCrystalBlizzardResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.storms).toHaveLength(2)
  })

  it('computes all stats fields', async () => {
    const result = await buildCrystalBlizzardResult(['a.ts'], [richContent])
    expect(result.stats.avgCrystallinePrecision).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgStormResilience).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgShardClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgFrozenBeauty).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgIceWisdom).toBeGreaterThanOrEqual(0)
    expect(result.stats.crystalMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.frozenPerfectionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.properIceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.slushPileCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.puddleCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(0)
    expect(typeof result.stats.bestShard).toBe('string')
    expect(typeof result.stats.mostPrecise).toBe('string')
    expect(typeof result.stats.mostResilient).toBe('string')
    expect(typeof result.stats.clearest).toBe('string')
    expect(typeof result.stats.mostBeautiful).toBe('string')
    expect(typeof result.stats.wisest).toBe('string')
  })

  it('sets bestShard to highest qualityScore file', async () => {
    const result = await buildCrystalBlizzardResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.bestShard).toBe('rich.ts')
  })

  it('sets mostPrecise to highest crystallinePrecision file', async () => {
    const result = await buildCrystalBlizzardResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.mostPrecise).toBe('rich.ts')
  })

  it('scores rich content at max (100)', async () => {
    const result = await buildCrystalBlizzardResult(['a.ts'], [richContent])
    const shard = result.shards[0]
    expect(shard.crystallinePrecision).toBe(100)
    expect(shard.stormResilience).toBe(100)
    expect(shard.shardClarity).toBe(100)
    expect(shard.frozenBeauty).toBe(100)
    expect(shard.iceWisdom).toBe(100)
    expect(shard.qualityScore).toBe(100)
  })

  it('sets winter.isCrystalline when frostiness >= 60', async () => {
    const result = await buildCrystalBlizzardResult(['a.ts'], [richContent])
    expect(result.winter.isCrystalline).toBe(true)
  })

  it('files in root map to . storm', async () => {
    const result = await buildCrystalBlizzardResult(['app.ts'], [richContent])
    expect(result.storms[0].directory).toBe('.')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all >= 90', async () => {
    const result = await buildCrystalBlizzardResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('recommends sharpening when precision is low', async () => {
    const result = await buildCrystalBlizzardResult(['a.ts'], ['var x = 1'])
    const hasRec = result.recommendations.some((r) => r.includes('Sharpen'))
    expect(hasRec).toBe(true)
  })

  it('returns default when scores are good', async () => {
    const result = await buildCrystalBlizzardResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorCondition('crystal-masterpiece')).toBe('string')
    expect(typeof colorCondition('frozen-perfection')).toBe('string')
    expect(typeof colorCondition('proper-ice')).toBe('string')
    expect(typeof colorCondition('slush-pile')).toBe('string')
    expect(typeof colorCondition('puddle')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorStormCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorStormCondition('ice-palace')).toBe('string')
    expect(typeof colorStormCondition('frozen-cathedral')).toBe('string')
    expect(typeof colorStormCondition('proper-glacier')).toBe('string')
    expect(typeof colorStormCondition('melting-snowman')).toBe('string')
    expect(typeof colorStormCondition('dry-ground')).toBe('string')
    expect(typeof colorStormCondition('void')).toBe('string')
    expect(typeof colorStormCondition('unknown')).toBe('string')
  })
})

describe('formatShardTable', () => {
  it('formats a shard', async () => {
    const result = await buildCrystalBlizzardResult(['a.ts'], [richContent])
    const output = formatShardTable(result.shards[0])
    expect(output).toContain('Crystal Shard')
    expect(output).toContain('a.ts')
    expect(output).toContain('Crystalline Precision')
  })
})

describe('formatShardsTable', () => {
  it('returns no shards message for empty', () => {
    expect(formatShardsTable([])).toContain('No crystal shards')
  })
  it('formats shards', async () => {
    const result = await buildCrystalBlizzardResult(['a.ts'], [richContent])
    expect(formatShardsTable(result.shards)).toContain('Crystal Shards')
  })
})

describe('formatStormTable', () => {
  it('formats a storm', async () => {
    const result = await buildCrystalBlizzardResult(['a.ts'], [richContent])
    const output = formatStormTable(result.storms[0])
    expect(output).toContain('Crystal Storm')
    expect(output).toContain('Shards')
  })
})

describe('formatStormsTable', () => {
  it('returns no storms message for empty', () => {
    expect(formatStormsTable([])).toContain('No crystal storms')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildCrystalBlizzardResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Crystal Blizzard Statistics')
    expect(output).toContain('Frost Mage Grade')
    expect(output).toContain('Best Shard')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    expect(formatRecommendations(['A', 'B'])).toContain('Recommendations')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildCrystalBlizzardResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Crystal Blizzard Analysis')
    expect(output).toContain('Winter Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildCrystalBlizzardResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.shards).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
