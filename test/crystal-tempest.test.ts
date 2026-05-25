import { describe, it, expect } from 'vitest'
import {
  measureForming,
  measureWeathering,
  measureRefracting,
  measureSculpting,
  measureRemembering,
  classifyCondition,
  classifyFieldType,
  classifyFrostGrade,
  classifyFieldCondition,
  analyzeCrystalShard,
  analyzeCrystalField,
  buildCrystalTempestResult,
  generateRecommendations,
} from '../src/commands/crystal-tempest-helpers.js'
import {
  colorScore,
  colorCondition,
  formatShardTable,
  formatShardsTable,
  formatFieldTable,
  formatFieldsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/crystal-tempest-format-helpers.js'

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

// ─── measureForming ──────────────────────────────────────────────

describe('measureForming', () => {
  it('returns 0 for empty content', () => {
    const m = measureForming('')
    expect(m.precision).toBe(0)
    expect(m.crystal).toBe('no-precision')
    expect(m.hasHighPrecision).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureForming(minimalContent)
    expect(m.precision).toBe(0)
    expect(m.crystal).toBe('no-precision')
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasNoErratic).toBe(true)
    expect(m.unsafeCount).toBe(0)
    expect(m.erraticCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureForming(richContent)
    expect(m.precision).toBe(100)
    expect(m.crystal).toBe('perfect-lattice')
    expect(m.hasHighPrecision).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasOrganized).toBe(true)
    expect(m.hasDeterministic).toBe(true)
    expect(m.hasPrecise).toBe(true)
  })

  it('detects unsafe any usage', () => {
    const m = measureForming('const x: any = 1')
    expect(m.unsafeCount).toBe(1)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects erratic var usage', () => {
    const m = measureForming('var x = 1')
    expect(m.erraticCount).toBe(1)
    expect(m.hasNoErratic).toBe(false)
  })
})

// ─── measureWeathering ────────────────────────────────────────────

describe('measureWeathering', () => {
  it('returns 0 for empty content', () => {
    const m = measureWeathering('')
    expect(m.resilience).toBe(0)
    expect(m.storm).toBe('no-resilience')
    expect(m.hasHighResilience).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureWeathering(minimalContent)
    expect(m.resilience).toBe(0)
    expect(m.storm).toBe('no-resilience')
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasNoFragile).toBe(true)
    expect(m.bareCrashCount).toBe(0)
    expect(m.fragileCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureWeathering(richContent)
    expect(m.resilience).toBe(100)
    expect(m.storm).toBe('unbreakable-ice')
    expect(m.hasHighResilience).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasRecoverable).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasAntifragile).toBe(true)
    expect(m.hasEnduring).toBe(true)
  })

  it('detects bare crash eval usage', () => {
    const m = measureWeathering('eval("1")')
    expect(m.bareCrashCount).toBe(1)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects fragile var usage', () => {
    const m = measureWeathering('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })
})

// ─── measureRefracting ────────────────────────────────────────────

describe('measureRefracting', () => {
  it('returns 0 for empty content', () => {
    const m = measureRefracting('')
    expect(m.clarity).toBe(0)
    expect(m.shard).toBe('no-clarity')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureRefracting(minimalContent)
    expect(m.clarity).toBe(0)
    expect(m.shard).toBe('no-clarity')
    expect(m.hasReadable).toBe(false)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.crypticCount).toBe(0)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureRefracting(richContent)
    expect(m.clarity).toBe(100)
    expect(m.shard).toBe('prism-perfect')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasExplained).toBe(true)
  })

  it('detects cryptic eval usage', () => {
    const m = measureRefracting('eval("1")')
    expect(m.crypticCount).toBe(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated any usage', () => {
    const m = measureRefracting('const x: any = 1')
    expect(m.obfuscatedCount).toBe(1)
    expect(m.hasNoObfuscated).toBe(false)
  })
})

// ─── measureSculpting ────────────────────────────────────────────

describe('measureSculpting', () => {
  it('returns 0 for empty content', () => {
    const m = measureSculpting('')
    expect(m.beauty).toBe(0)
    expect(m.sculpture).toBe('no-beauty')
    expect(m.hasHighBeauty).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureSculpting(minimalContent)
    expect(m.beauty).toBe(0)
    expect(m.sculpture).toBe('no-beauty')
    expect(m.hasElegant).toBe(false)
    expect(m.hasNoTangled).toBe(true)
    expect(m.hasNoMonolithic).toBe(true)
    expect(m.tangledCount).toBe(0)
    expect(m.monolithicCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureSculpting(richContent)
    expect(m.beauty).toBe(100)
    expect(m.sculpture).toBe('ice-masterpiece')
    expect(m.hasHighBeauty).toBe(true)
    expect(m.hasElegant).toBe(true)
    expect(m.hasCleanPipelines).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasOrganized).toBe(true)
    expect(m.hasRefined).toBe(true)
    expect(m.hasBeautiful).toBe(true)
  })

  it('detects tangled any usage', () => {
    const m = measureSculpting('const x: any = 1')
    expect(m.tangledCount).toBe(1)
    expect(m.hasNoTangled).toBe(false)
  })

  it('detects monolithic var usage', () => {
    const m = measureSculpting('var x = 1')
    expect(m.monolithicCount).toBe(1)
    expect(m.hasNoMonolithic).toBe(false)
  })
})

// ─── measureRemembering ────────────────────────────────────────────

describe('measureRemembering', () => {
  it('returns 0 for empty content', () => {
    const m = measureRemembering('')
    expect(m.wisdom).toBe(0)
    expect(m.glacier).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureRemembering(minimalContent)
    expect(m.wisdom).toBe(0)
    expect(m.glacier).toBe('no-wisdom')
    expect(m.hasProven).toBe(false)
    expect(m.hasNoExperimental).toBe(true)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.experimentalCount).toBe(0)
    expect(m.adHocCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureRemembering(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.glacier).toBe('ancient-glacier')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasEstablished).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasStrategic).toBe(true)
  })

  it('detects experimental var usage', () => {
    const m = measureRemembering('var x = 1')
    expect(m.experimentalCount).toBe(1)
    expect(m.hasNoExperimental).toBe(false)
  })

  it('detects ad-hoc any usage', () => {
    const m = measureRemembering('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })
})

// ─── classifyCondition ─────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies crystal-masterpiece for 90+', () => {
    expect(classifyCondition(90)).toBe('crystal-masterpiece')
    expect(classifyCondition(100)).toBe('crystal-masterpiece')
  })

  it('classifies frozen-perfection for 75-89', () => {
    expect(classifyCondition(75)).toBe('frozen-perfection')
    expect(classifyCondition(89)).toBe('frozen-perfection')
  })

  it('classifies proper-ice for 60-74', () => {
    expect(classifyCondition(60)).toBe('proper-ice')
    expect(classifyCondition(74)).toBe('proper-ice')
  })

  it('classifies slush-puddle for 40-59', () => {
    expect(classifyCondition(40)).toBe('slush-puddle')
    expect(classifyCondition(59)).toBe('slush-puddle')
  })

  it('classifies dry-ground for 20-39', () => {
    expect(classifyCondition(20)).toBe('dry-ground')
    expect(classifyCondition(39)).toBe('dry-ground')
  })

  it('classifies void for 0-19', () => {
    expect(classifyCondition(0)).toBe('void')
    expect(classifyCondition(19)).toBe('void')
  })
})

// ─── classifyFieldType ─────────────────────────────────────────

describe('classifyFieldType', () => {
  it('returns no-field for empty shards', () => {
    expect(classifyFieldType([])).toBe('no-field')
  })

  it('classifies glacier-field for high avg', () => {
    const shards = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeCrystalShard(richContent, `f${i}.ts`),
    }))
    expect(classifyFieldType(shards)).toBe('glacier-field')
  })

  it('classifies no-field for low scores', () => {
    const shards = [analyzeCrystalShard('', 'a.ts')]
    expect(classifyFieldType(shards)).toBe('no-field')
  })

  it('classifies ice-lake for mid-high scores', () => {
    const shards = Array.from({ length: 3 }, () => ({
      ...analyzeCrystalShard(richContent, 'f.ts'),
      qualityScore: 75,
      condition: 'frozen-perfection' as const,
    }))
    expect(classifyFieldType(shards)).toBe('ice-lake')
  })

  it('classifies proper-frost for mid scores', () => {
    const shards = Array.from({ length: 3 }, () => ({
      ...analyzeCrystalShard(richContent, 'f.ts'),
      qualityScore: 60,
      condition: 'proper-ice' as const,
    }))
    expect(classifyFieldType(shards)).toBe('proper-frost')
  })

  it('classifies thin-ice for low scores', () => {
    const shards = Array.from({ length: 3 }, () => ({
      ...analyzeCrystalShard(richContent, 'f.ts'),
      qualityScore: 42,
      condition: 'slush-puddle' as const,
    }))
    expect(classifyFieldType(shards)).toBe('thin-ice')
  })

  it('classifies dry-ground for very low scores', () => {
    const shards = Array.from({ length: 3 }, () => ({
      ...analyzeCrystalShard(richContent, 'f.ts'),
      qualityScore: 25,
      condition: 'void' as const,
    }))
    expect(classifyFieldType(shards)).toBe('dry-ground')
  })
})

// ─── classifyFrostGrade ─────────────────────────────────────────

describe('classifyFrostGrade', () => {
  it('classifies ice-emperor for 80+', () => {
    expect(classifyFrostGrade(80)).toBe('ice-emperor')
    expect(classifyFrostGrade(100)).toBe('ice-emperor')
  })

  it('classifies frost-architect for 65-79', () => {
    expect(classifyFrostGrade(65)).toBe('frost-architect')
    expect(classifyFrostGrade(79)).toBe('frost-architect')
  })

  it('classifies crystal-worker for 50-64', () => {
    expect(classifyFrostGrade(50)).toBe('crystal-worker')
    expect(classifyFrostGrade(64)).toBe('crystal-worker')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyFrostGrade(35)).toBe('apprentice')
    expect(classifyFrostGrade(49)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyFrostGrade(20)).toBe('novice')
    expect(classifyFrostGrade(34)).toBe('novice')
  })

  it('classifies melting-snowman for 0-19', () => {
    expect(classifyFrostGrade(0)).toBe('melting-snowman')
    expect(classifyFrostGrade(19)).toBe('melting-snowman')
  })
})

// ─── classifyFieldCondition ─────────────────────────────────────

describe('classifyFieldCondition', () => {
  it('classifies crystal-palace for 85+', () => {
    expect(classifyFieldCondition(85)).toBe('crystal-palace')
  })

  it('classifies frozen-lake for 70-84', () => {
    expect(classifyFieldCondition(70)).toBe('frozen-lake')
  })

  it('classifies proper-field for 55-69', () => {
    expect(classifyFieldCondition(55)).toBe('proper-field')
  })

  it('classifies slush-pond for 35-54', () => {
    expect(classifyFieldCondition(35)).toBe('slush-pond')
  })

  it('classifies dry-ground for 15-34', () => {
    expect(classifyFieldCondition(15)).toBe('dry-ground')
  })

  it('classifies void for 0-14', () => {
    expect(classifyFieldCondition(0)).toBe('void')
  })
})

// ─── analyzeCrystalShard ───────────────────────────────────────

describe('analyzeCrystalShard', () => {
  it('analyzes minimal content', () => {
    const shard = analyzeCrystalShard(minimalContent, 'minimal.ts')
    expect(shard.file).toBe('minimal.ts')
    expect(shard.crystallinePrecision).toBe(0)
    expect(shard.stormResilience).toBe(0)
    expect(shard.shardClarity).toBe(0)
    expect(shard.frozenBeauty).toBe(0)
    expect(shard.iceWisdom).toBe(0)
    expect(shard.qualityScore).toBe(0)
    expect(shard.condition).toBe('void')
    expect(shard.forming.crystal).toBe('no-precision')
    expect(shard.weathering.storm).toBe('no-resilience')
    expect(shard.refracting.shard).toBe('no-clarity')
    expect(shard.sculpting.sculpture).toBe('no-beauty')
    expect(shard.remembering.glacier).toBe('no-wisdom')
  })

  it('analyzes rich content', () => {
    const shard = analyzeCrystalShard(richContent, 'rich.ts')
    expect(shard.file).toBe('rich.ts')
    expect(shard.crystallinePrecision).toBe(100)
    expect(shard.stormResilience).toBe(100)
    expect(shard.shardClarity).toBe(100)
    expect(shard.frozenBeauty).toBe(100)
    expect(shard.iceWisdom).toBe(100)
    expect(shard.qualityScore).toBe(100)
    expect(shard.condition).toBe('crystal-masterpiece')
    expect(shard.forming.crystal).toBe('perfect-lattice')
    expect(shard.weathering.storm).toBe('unbreakable-ice')
    expect(shard.refracting.shard).toBe('prism-perfect')
    expect(shard.sculpting.sculpture).toBe('ice-masterpiece')
    expect(shard.remembering.glacier).toBe('ancient-glacier')
  })

  it('computes qualityScore as weighted average', () => {
    const shard = analyzeCrystalShard('export const x = 1', 'mid.ts')
    const expected = Math.round(
      shard.crystallinePrecision * 0.2 +
      shard.stormResilience * 0.2 +
      shard.shardClarity * 0.2 +
      shard.frozenBeauty * 0.2 +
      shard.iceWisdom * 0.2,
    )
    expect(shard.qualityScore).toBe(expected)
  })
})

// ─── analyzeCrystalField ───────────────────────────────────────

describe('analyzeCrystalField', () => {
  it('returns empty field for empty shards', () => {
    const field = analyzeCrystalField([], 'empty-dir')
    expect(field.directory).toBe('empty-dir')
    expect(field.shards).toHaveLength(0)
    expect(field.avgPrecision).toBe(0)
    expect(field.fieldType).toBe('no-field')
    expect(field.condition).toBe('void')
  })

  it('analyzes field with rich shards', () => {
    const shards = [
      analyzeCrystalShard(richContent, 'dir/a.ts'),
      analyzeCrystalShard(richContent, 'dir/b.ts'),
    ]
    const field = analyzeCrystalField(shards, 'dir')
    expect(field.avgPrecision).toBe(100)
    expect(field.crystalMasterpieceCount).toBe(2)
    expect(field.voidCount).toBe(0)
    expect(field.fieldType).toBe('glacier-field')
  })

  it('analyzes field with mixed shards', () => {
    const shards = [
      analyzeCrystalShard(richContent, 'dir/a.ts'),
      analyzeCrystalShard(minimalContent, 'dir/b.ts'),
    ]
    const field = analyzeCrystalField(shards, 'dir')
    expect(field.crystalMasterpieceCount).toBe(1)
    expect(field.voidCount).toBe(1)
  })
})

// ─── buildCrystalTempestResult ──────────────────────────────────

describe('buildCrystalTempestResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildCrystalTempestResult([], [])
    expect(result.shards).toHaveLength(0)
    expect(result.fields).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallFrost).toBe(0)
    expect(result.stats.frostGrade).toBe('melting-snowman')
    expect(result.blizzard.isCrystal).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildCrystalTempestResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.shards).toHaveLength(2)
    expect(result.fields).toHaveLength(1)
    expect(result.stats.avgCrystallinePrecision).toBe(100)
    expect(result.stats.avgStormResilience).toBe(100)
    expect(result.stats.avgShardClarity).toBe(100)
    expect(result.stats.avgFrozenBeauty).toBe(100)
    expect(result.stats.avgIceWisdom).toBe(100)
    expect(result.stats.crystalMasterpieceCount).toBe(2)
    expect(result.stats.voidCount).toBe(0)
    expect(result.stats.hasHighPrecisionCount).toBe(2)
    expect(result.stats.hasHighResilienceCount).toBe(2)
    expect(result.stats.hasHighClarityCount).toBe(2)
    expect(result.stats.hasHighBeautyCount).toBe(2)
    expect(result.stats.hasHighWisdomCount).toBe(2)
    expect(result.stats.overallFrost).toBe(100)
    expect(result.stats.frostGrade).toBe('ice-emperor')
    expect(result.blizzard.isCrystal).toBe(true)
    expect(result.stats.bestShard).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostBeautiful).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildCrystalTempestResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.fields).toHaveLength(2)
    const dirs = result.fields.map(f => f.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall frost correctly', async () => {
    const result = await buildCrystalTempestResult(['a.ts'], [minimalContent])
    expect(result.blizzard.overallFrost).toBe(0)
  })

  it('sets isCrystal when overallFrost >= 60', async () => {
    const result = await buildCrystalTempestResult(['a.ts'], [richContent])
    expect(result.blizzard.isCrystal).toBe(true)
  })

  it('sets isCrystal false when overallFrost < 60', async () => {
    const result = await buildCrystalTempestResult(['a.ts'], [minimalContent])
    expect(result.blizzard.isCrystal).toBe(false)
  })

  it('picks best shard by qualityScore', async () => {
    const result = await buildCrystalTempestResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestShard).toBe('high.ts')
    expect(result.stats.mostPrecise).toBe('high.ts')
    expect(result.stats.mostResilient).toBe('high.ts')
    expect(result.stats.clearest).toBe('high.ts')
    expect(result.stats.mostBeautiful).toBe('high.ts')
    expect(result.stats.wisest).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildCrystalTempestResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.crystalMasterpieceCount).toBe(1)
    expect(result.stats.voidCount).toBe(1)
  })
})

// ─── generateRecommendations ────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildCrystalTempestResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your crystal tempest shines with perfect precision! Every shard is a masterpiece of frozen elegance',
    ])
  })

  it('recommends improving crystalline precision when low', async () => {
    const result = await buildCrystalTempestResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('precision'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving storm resilience when low', async () => {
    const result = await buildCrystalTempestResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('resilience'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving shard clarity when low', async () => {
    const result = await buildCrystalTempestResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('clarity'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving frozen beauty when low', async () => {
    const result = await buildCrystalTempestResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('beauty'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving ice wisdom when low', async () => {
    const result = await buildCrystalTempestResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('wisdom'))
    expect(rec).toBeTruthy()
  })

  it('warns about void shards', async () => {
    const result = await buildCrystalTempestResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Refreeze') || r.includes('barren'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall frost', async () => {
    const result = await buildCrystalTempestResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('frost') || r.includes('tempest'))
    expect(rec).toBeTruthy()
  })

  it('lists specific void shards to refreeze', async () => {
    const result = await buildCrystalTempestResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Refreeze these'))
    expect(rec).toBeTruthy()
  })

  it('warns when all fields are poor', async () => {
    const result = await buildCrystalTempestResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('thawing') || r.includes('strategy') || r.includes('refreeze'))
    expect(rec).toBeTruthy()
  })
})

// ─── Format Helpers ──────────────────────────────────────────────

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

describe('colorCondition', () => {
  it('returns a string for crystal-masterpiece', () => {
    expect(typeof colorCondition('crystal-masterpiece')).toBe('string')
  })

  it('returns a string for void', () => {
    expect(typeof colorCondition('void')).toBe('string')
  })

  it('returns a string for unknown condition', () => {
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('formatShardTable', () => {
  it('formats a shard', () => {
    const shard = analyzeCrystalShard(richContent, 'test.ts')
    const output = formatShardTable(shard)
    expect(output).toContain('test.ts')
    expect(output).toContain('Crystalline Precision')
    expect(output).toContain('Storm Resilience')
    expect(output).toContain('Shard Clarity')
    expect(output).toContain('Frozen Beauty')
    expect(output).toContain('Ice Wisdom')
  })
})

describe('formatShardsTable', () => {
  it('handles empty shards', () => {
    const output = formatShardsTable([])
    expect(output).toContain('No crystal shards')
  })

  it('formats multiple shards', () => {
    const shards = [
      analyzeCrystalShard(richContent, 'a.ts'),
      analyzeCrystalShard(minimalContent, 'b.ts'),
    ]
    const output = formatShardsTable(shards)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatFieldTable', () => {
  it('formats a field', () => {
    const shards = [analyzeCrystalShard(richContent, 'dir/a.ts')]
    const field = analyzeCrystalField(shards, 'dir')
    const output = formatFieldTable(field)
    expect(output).toContain('dir')
    expect(output).toContain('Field')
  })
})

describe('formatFieldsTable', () => {
  it('handles empty fields', () => {
    const output = formatFieldsTable([])
    expect(output).toContain('No crystal fields')
  })

  it('formats multiple fields', () => {
    const shards = [analyzeCrystalShard(richContent, 'src/a.ts')]
    const fields = [analyzeCrystalField(shards, 'src')]
    const output = formatFieldsTable(fields)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildCrystalTempestResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Crystal Tempest Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Frost Grade')
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
    const result = await buildCrystalTempestResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Crystal Tempest Analysis')
    expect(output).toContain('Crystal Shards')
    expect(output).toContain('Crystal Fields')
    expect(output).toContain('Blizzard Overview')
    expect(output).toContain('Crystal Tempest Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildCrystalTempestResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.shards).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.blizzard.isCrystal).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const shard = analyzeCrystalShard('   \n\t  ', 'blank.ts')
    expect(shard.crystallinePrecision).toBe(0)
    expect(shard.qualityScore).toBe(0)
    expect(shard.condition).toBe('void')
  })

  it('handles content with only comments', () => {
    const shard = analyzeCrystalShard('// just a comment\n/* block */', 'comment.ts')
    expect(shard.crystallinePrecision).toBe(0)
    expect(shard.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildCrystalTempestResult(['big.ts'], [longContent])
    expect(result.shards).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildCrystalTempestResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.crystalMasterpieceCount).toBe(50)
  })

  it('handles single file field', async () => {
    const result = await buildCrystalTempestResult(['single.ts'], [richContent])
    expect(result.fields).toHaveLength(1)
    expect(result.fields[0]!.shards).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const shard = analyzeCrystalShard(richContent, 'cap.ts')
    expect(shard.qualityScore).toBeLessThanOrEqual(100)
    expect(shard.crystallinePrecision).toBeLessThanOrEqual(100)
    expect(shard.stormResilience).toBeLessThanOrEqual(100)
    expect(shard.shardClarity).toBeLessThanOrEqual(100)
    expect(shard.frozenBeauty).toBeLessThanOrEqual(100)
    expect(shard.iceWisdom).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildCrystalTempestResult([], [])
    const r2 = await buildCrystalTempestResult(['a.ts'], [richContent])
    const r3 = await buildCrystalTempestResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
