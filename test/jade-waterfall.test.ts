import { describe, it, expect } from 'vitest'
import {
  measureFlowing,
  measureCascading,
  measureGathering,
  measureThriving,
  measureClarifying,
  classifyDropCondition,
  classifyTerraceType,
  classifyTerraceCondition,
  classifyKeeperGrade,
  analyzeWaterDrop,
  analyzeWaterfallTerrace,
  buildJadeWaterfallResult,
  generateRecommendations,
} from '../src/commands/jade-waterfall-helpers.js'
import {
  colorScore,
  colorGrade,
  formatDropTable,
  formatDropsTable,
  formatTerraceTable,
  formatTerracesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/jade-waterfall-format-helpers.js'
import type { WaterDrop } from '../src/commands/jade-waterfall-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const emptyContent = ''

const minimalContent = `const x = 1`

const moderateContent = `
import { foo } from 'bar'
export interface User {
  name: string
  age: number
}
export type UserRole = 'admin' | 'user'
export function getUser(id: string): User | null {
  if (id === '1') return { name: 'test', age: 20 }
  return null
}
const users: User[] = []
`

const richContent = `
import { z } from 'zod'
import type { Config } from './config.js'

/**
 * User configuration interface
 */
export interface UserConfig {
  readonly name: string
  readonly age: number
  readonly role: UserRole
  nickname?: string
}

export type UserRole = 'admin' | 'user' | 'moderator'
export type Maybe<T> = T | null

/**
 * Create a new user with validation
 */
export async function createUser(input: string): Promise<UserConfig> {
  const config: Config = JSON.parse(input)
  if (config.name === undefined || config.name === null) {
    throw new Error('Name required')
  }
  try {
    const result = await validateConfig(config)
    return result ?? defaultValue()
  } catch (error) {
    return handleDefault(config)
  }
}

export function handleDefault(config: Config): UserConfig {
  return config ?? { name: 'default', age: 0, role: 'user' }
}

export function defaultValue(): UserConfig {
  return { name: 'default', age: 0, role: 'user' }
}

enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}

switch (status) {
  case Status.Active:
    users.map(u => u.name)
    users.filter(u => u.age > 18).forEach(u => console.log(u))
    break
  default:
    break
}
`

// ─── measureFlowing ────────────────────────────────────────────────

describe('measureFlowing', () => {
  it('returns no-flow for empty content', () => {
    const m = measureFlowing(emptyContent)
    expect(m.grace).toBe(0)
    expect(m.grade).toBe('no-flow')
    expect(m.hasHighGrace).toBe(false)
    expect(m.tangledCount).toBe(0)
    expect(m.circuitCount).toBe(0)
  })

  it('returns silk-waterfall for rich content', () => {
    const m = measureFlowing(richContent)
    expect(m.grace).toBeGreaterThanOrEqual(85)
    expect(m.grade).toBe('silk-waterfall')
    expect(m.hasHighGrace).toBe(true)
    expect(m.hasElegantDataFlow).toBe(true)
    expect(m.hasCleanTransformations).toBe(true)
    expect(m.hasNoTangled).toBe(true)
    expect(m.hasStreamlined).toBe(true)
    expect(m.hasNoCircuits).toBe(true)
    expect(m.hasPipelined).toBe(true)
    expect(m.hasNoAdhoc).toBe(true)
    expect(m.hasSequential).toBe(true)
    expect(m.hasSmooth).toBe(true)
  })

  it('counts tangled patterns (var)', () => {
    const m = measureFlowing('var x = 1; var y = 2;')
    expect(m.tangledCount).toBe(2)
    expect(m.hasNoTangled).toBe(false)
  })

  it('counts circuit patterns (any)', () => {
    const m = measureFlowing('const x: any = 1;')
    expect(m.circuitCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoCircuits).toBe(false)
  })

  it('detects eval as adhoc', () => {
    const m = measureFlowing("eval('x')")
    expect(m.hasNoAdhoc).toBe(false)
  })

  it('detects debugger as random', () => {
    const m = measureFlowing('debugger')
    expect(m.hasNoRandom).toBe(false)
  })

  it('returns higher grace for moderate content', () => {
    const m = measureFlowing(moderateContent)
    expect(m.grace).toBeGreaterThan(0)
  })
})

// ─── measureCascading ──────────────────────────────────────────────

describe('measureCascading', () => {
  it('returns no-cascade for empty content', () => {
    const m = measureCascading(emptyContent)
    expect(m.clarity).toBe(0)
    expect(m.cascade).toBe('no-cascade')
    expect(m.hasHighClarity).toBe(false)
    expect(m.hiddenStepCount).toBe(0)
    expect(m.blackBoxCount).toBe(0)
  })

  it('returns crystal-steps for rich content', () => {
    const m = measureCascading(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(85)
    expect(m.cascade).toBe('crystal-steps')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasClearSteps).toBe(true)
    expect(m.hasDocumentedTransformations).toBe(true)
    expect(m.hasNoHiddenSteps).toBe(true)
    expect(m.hasVisiblePipeline).toBe(true)
    expect(m.hasTraceable).toBe(true)
    expect(m.hasExplicit).toBe(true)
  })

  it('counts hidden steps (var)', () => {
    const m = measureCascading('var x = 1; var y = 2;')
    expect(m.hiddenStepCount).toBe(2)
    expect(m.hasNoHiddenSteps).toBe(false)
  })

  it('counts black boxes (any)', () => {
    const m = measureCascading('const x: any = 1;')
    expect(m.blackBoxCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoBlackBoxes).toBe(false)
  })

  it('detects eval as untraceable', () => {
    const m = measureCascading("eval('x')")
    expect(m.hasNoUntraceable).toBe(false)
  })
})

// ─── measureGathering ──────────────────────────────────────────────

describe('measureGathering', () => {
  it('returns no-pool for empty content', () => {
    const m = measureGathering(emptyContent)
    expect(m.depth).toBe(0)
    expect(m.pool).toBe('no-pool')
    expect(m.hasHighDepth).toBe(false)
    expect(m.mutableCount).toBe(0)
    expect(m.leakedCount).toBe(0)
  })

  it('returns deep-jade-pool for rich content', () => {
    const m = measureGathering(richContent)
    expect(m.depth).toBeGreaterThanOrEqual(85)
    expect(m.pool).toBe('deep-jade-pool')
    expect(m.hasHighDepth).toBe(true)
    expect(m.hasManagedState).toBe(true)
    expect(m.hasImmutable).toBe(true)
    expect(m.hasNoMutable).toBe(true)
    expect(m.hasEncapsulated).toBe(true)
    expect(m.hasPersistent).toBe(true)
    expect(m.hasStructured).toBe(true)
    expect(m.hasDeep).toBe(true)
  })

  it('counts mutable patterns (var)', () => {
    const m = measureGathering('var x = 1; var y = 2;')
    expect(m.mutableCount).toBe(2)
    expect(m.hasNoMutable).toBe(false)
  })

  it('counts leaked patterns (any)', () => {
    const m = measureGathering('const x: any = 1;')
    expect(m.leakedCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoLeaked).toBe(false)
  })

  it('detects eval as lost', () => {
    const m = measureGathering("eval('x')")
    expect(m.hasNoLost).toBe(false)
  })
})

// ─── measureThriving ──────────────────────────────────────────────

describe('measureThriving', () => {
  it('returns no-growth for empty content', () => {
    const m = measureThriving(emptyContent)
    expect(m.resilience).toBe(0)
    expect(m.moss).toBe('no-growth')
    expect(m.hasHighResilience).toBe(false)
    expect(m.bareCrashCount).toBe(0)
    expect(m.trustingCount).toBe(0)
  })

  it('returns ancient-moss for rich content', () => {
    const m = measureThriving(richContent)
    expect(m.resilience).toBeGreaterThanOrEqual(85)
    expect(m.moss).toBe('ancient-moss')
    expect(m.hasHighResilience).toBe(true)
    expect(m.hasErrorHandling).toBe(true)
    expect(m.hasEdgeCaseCoverage).toBe(true)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasDefensiveCode).toBe(true)
    expect(m.hasRetryLogic).toBe(true)
    expect(m.hasFallbackPaths).toBe(true)
    expect(m.hasHardy).toBe(true)
  })

  it('counts bare crash patterns (var)', () => {
    const m = measureThriving('var x = 1; var y = 2;')
    expect(m.bareCrashCount).toBe(2)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('counts trusting patterns (any)', () => {
    const m = measureThriving('const x: any = 1;')
    expect(m.trustingCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoTrusting).toBe(false)
  })

  it('detects eval as single fail', () => {
    const m = measureThriving("eval('x')")
    expect(m.hasNoSingleFail).toBe(false)
  })

  it('detects debugger as dead end', () => {
    const m = measureThriving('debugger')
    expect(m.hasNoDeadEnd).toBe(false)
  })
})

// ─── measureClarifying ─────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns opaque for empty content', () => {
    const m = measureClarifying(emptyContent)
    expect(m.clarity).toBe(0)
    expect(m.mist).toBe('opaque')
    expect(m.hasHighClarity).toBe(false)
    expect(m.obfuscatedCount).toBe(0)
    expect(m.crypticCount).toBe(0)
  })

  it('returns crystal-mist for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(85)
    expect(m.mist).toBe('crystal-mist')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasTransparentLogic).toBe(true)
    expect(m.hasReadableComplexity).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasClear).toBe(true)
  })

  it('counts obfuscated patterns (var)', () => {
    const m = measureClarifying('var x = 1; var y = 2;')
    expect(m.obfuscatedCount).toBe(2)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('counts cryptic patterns (any)', () => {
    const m = measureClarifying('const x: any = 1;')
    expect(m.crypticCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects eval as impenetrable', () => {
    const m = measureClarifying("eval('x')")
    expect(m.hasNoImpenetrable).toBe(false)
  })
})

// ─── classifyDropCondition ─────────────────────────────────────────

describe('classifyDropCondition', () => {
  it('classifies correctly at all boundaries', () => {
    expect(classifyDropCondition(90)).toBe('jade-masterpiece')
    expect(classifyDropCondition(85)).toBe('jade-masterpiece')
    expect(classifyDropCondition(70)).toBe('emerald-falls')
    expect(classifyDropCondition(55)).toBe('proper-waterfall')
    expect(classifyDropCondition(40)).toBe('trickling-stream')
    expect(classifyDropCondition(25)).toBe('dry-bed')
    expect(classifyDropCondition(0)).toBe('drought')
    expect(classifyDropCondition(24)).toBe('drought')
  })
})

// ─── classifyTerraceType ───────────────────────────────────────────

describe('classifyTerraceType', () => {
  it('returns no-terrace for empty array', () => {
    expect(classifyTerraceType([])).toBe('no-terrace')
  })

  it('returns grand-waterfall for high-quality drops', () => {
    const drops = Array.from({ length: 4 }, () => ({
      ...analyzeWaterDrop(richContent, 'test.ts'),
      qualityScore: 90,
      condition: 'jade-masterpiece' as const,
    }))
    expect(classifyTerraceType(drops)).toBe('grand-waterfall')
  })

  it('returns terraced-falls for decent drops', () => {
    const drops = Array.from({ length: 2 }, () => ({
      ...analyzeWaterDrop(richContent, 'test.ts'),
      qualityScore: 65,
      condition: 'emerald-falls' as const,
    }))
    expect(classifyTerraceType(drops)).toBe('terraced-falls')
  })

  it('returns no-terrace for low-quality drops', () => {
    const drops = Array.from({ length: 2 }, () => ({
      ...analyzeWaterDrop(emptyContent, 'test.ts'),
      qualityScore: 10,
      condition: 'drought' as const,
    }))
    expect(classifyTerraceType(drops)).toBe('no-terrace')
  })
})

// ─── classifyTerraceCondition ──────────────────────────────────────

describe('classifyTerraceCondition', () => {
  it('classifies all conditions', () => {
    expect(classifyTerraceCondition(80)).toBe('magnificent-falls')
    expect(classifyTerraceCondition(60)).toBe('beautiful-cascade')
    expect(classifyTerraceCondition(45)).toBe('decent-waterfall')
    expect(classifyTerraceCondition(30)).toBe('modest-stream')
    expect(classifyTerraceCondition(15)).toBe('dry-cliff')
    expect(classifyTerraceCondition(0)).toBe('void')
  })
})

// ─── classifyKeeperGrade ───────────────────────────────────────────

describe('classifyKeeperGrade', () => {
  it('classifies all grades', () => {
    expect(classifyKeeperGrade(85)).toBe('water-master')
    expect(classifyKeeperGrade(65)).toBe('river-guardian')
    expect(classifyKeeperGrade(50)).toBe('skilled-steward')
    expect(classifyKeeperGrade(35)).toBe('apprentice')
    expect(classifyKeeperGrade(20)).toBe('novice')
    expect(classifyKeeperGrade(0)).toBe('drought-bringer')
  })
})

// ─── analyzeWaterDrop ──────────────────────────────────────────────

describe('analyzeWaterDrop', () => {
  it('analyzes empty content as drought', () => {
    const drop = analyzeWaterDrop(emptyContent, 'empty.ts')
    expect(drop.file).toBe('empty.ts')
    expect(drop.flowGrace).toBe(0)
    expect(drop.cascadeClarity).toBe(0)
    expect(drop.poolDepth).toBe(0)
    expect(drop.mossResilience).toBe(0)
    expect(drop.mistClarity).toBe(0)
    expect(drop.qualityScore).toBe(0)
    expect(drop.condition).toBe('drought')
  })

  it('analyzes rich content as jade-masterpiece', () => {
    const drop = analyzeWaterDrop(richContent, 'rich.ts')
    expect(drop.file).toBe('rich.ts')
    expect(drop.condition).toBe('jade-masterpiece')
    expect(drop.flowGrace).toBeGreaterThan(0)
    expect(drop.cascadeClarity).toBeGreaterThan(0)
    expect(drop.poolDepth).toBeGreaterThan(0)
    expect(drop.mossResilience).toBeGreaterThan(0)
    expect(drop.mistClarity).toBeGreaterThan(0)
  })

  it('computes qualityScore as weighted average', () => {
    const drop = analyzeWaterDrop(moderateContent, 'mod.ts')
    const expected = Math.round(
      drop.flowGrace * 0.2 + drop.cascadeClarity * 0.2 + drop.poolDepth * 0.2 +
      drop.mossResilience * 0.2 + drop.mistClarity * 0.2,
    )
    expect(drop.qualityScore).toBe(expected)
  })

  it('preserves all measure data', () => {
    const drop = analyzeWaterDrop(richContent, 'rich.ts')
    expect(drop.flowing.grace).toBe(drop.flowGrace)
    expect(drop.cascading.clarity).toBe(drop.cascadeClarity)
    expect(drop.gathering.depth).toBe(drop.poolDepth)
    expect(drop.thriving.resilience).toBe(drop.mossResilience)
    expect(drop.clarifying.clarity).toBe(drop.mistClarity)
  })
})

// ─── analyzeWaterfallTerrace ───────────────────────────────────────

describe('analyzeWaterfallTerrace', () => {
  it('returns empty terrace for no drops', () => {
    const terrace = analyzeWaterfallTerrace([], 'empty-dir')
    expect(terrace.directory).toBe('empty-dir')
    expect(terrace.drops).toHaveLength(0)
    expect(terrace.avgGrace).toBe(0)
    expect(terrace.avgDepth).toBe(0)
    expect(terrace.avgClarity).toBe(0)
    expect(terrace.terraceType).toBe('no-terrace')
    expect(terrace.condition).toBe('void')
  })

  it('aggregates drop metrics', () => {
    const drops = [
      analyzeWaterDrop(richContent, 'a.ts'),
      analyzeWaterDrop(richContent, 'b.ts'),
    ]
    const terrace = analyzeWaterfallTerrace(drops, 'src')
    expect(terrace.drops).toHaveLength(2)
    expect(terrace.avgGrace).toBeGreaterThan(0)
    expect(terrace.avgDepth).toBeGreaterThan(0)
    expect(terrace.avgClarity).toBeGreaterThan(0)
  })

  it('counts drought drops', () => {
    const drops = [
      analyzeWaterDrop(emptyContent, 'bad.ts'),
      analyzeWaterDrop(emptyContent, 'worse.ts'),
    ]
    const terrace = analyzeWaterfallTerrace(drops, 'bad-dir')
    expect(terrace.droughtCount).toBe(2)
  })
})

// ─── buildJadeWaterfallResult ──────────────────────────────────────

describe('buildJadeWaterfallResult', () => {
  it('returns valid result for empty input', async () => {
    const result = await buildJadeWaterfallResult([], [])
    expect(result.drops).toHaveLength(0)
    expect(result.terraces).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallSerenity).toBe(0)
    expect(result.river.isFlowing).toBe(false)
  })

  it('returns valid result for single file', async () => {
    const result = await buildJadeWaterfallResult(['test.ts'], [richContent])
    expect(result.drops).toHaveLength(1)
    expect(result.terraces).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgFlowGrace).toBeGreaterThan(0)
    expect(result.stats.overallSerenity).toBeGreaterThan(0)
    expect(result.stats.bestDrop).toBe('test.ts')
    expect(result.stats.mostGraceful).toBe('test.ts')
    expect(result.stats.clearestCascade).toBe('test.ts')
    expect(result.stats.deepest).toBe('test.ts')
    expect(result.stats.mostResilient).toBe('test.ts')
  })

  it('returns valid result for multiple files', async () => {
    const result = await buildJadeWaterfallResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.drops).toHaveLength(3)
    expect(result.terraces).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalTerraces).toBe(2)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes river correctly', async () => {
    const result = await buildJadeWaterfallResult(['test.ts'], [richContent])
    expect(result.river.avgGrace).toBeGreaterThan(0)
    expect(result.river.avgDepth).toBeGreaterThan(0)
    expect(result.river.avgClarity).toBeGreaterThan(0)
    expect(result.river.overallSerenity).toBeGreaterThan(0)
  })

  it('tracks all condition counts', async () => {
    const result = await buildJadeWaterfallResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    expect(result.stats.droughtCount).toBe(2)
    expect(result.stats.jadeMasterpieceCount).toBe(0)
  })

  it('tracks high-quality counts', async () => {
    const result = await buildJadeWaterfallResult(['test.ts'], [richContent])
    expect(result.stats.hasHighGraceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighDepthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighMistClarityCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns congratulatory message for good code', async () => {
    const result = await buildJadeWaterfallResult(['test.ts'], [richContent])
    const recs = generateRecommendations(result.drops, result.terraces, result.river, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('returns recommendations for poor code', async () => {
    const result = await buildJadeWaterfallResult(['bad.ts'], [emptyContent])
    const recs = generateRecommendations(result.drops, result.terraces, result.river, result.stats)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.some(r => r.includes('flow grace'))).toBe(true)
  })

  it('recommends for drought drops', async () => {
    const result = await buildJadeWaterfallResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    const recs = generateRecommendations(result.drops, result.terraces, result.river, result.stats)
    expect(recs.some(r => r.includes('drought'))).toBe(true)
  })

  it('restores specific drought files', async () => {
    const result = await buildJadeWaterfallResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    const recs = generateRecommendations(result.drops, result.terraces, result.river, result.stats)
    expect(recs.some(r => r.includes('a.ts') || r.includes('b.ts'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for known grades', () => {
    expect(typeof colorGrade('water-master')).toBe('string')
    expect(typeof colorGrade('silk-waterfall')).toBe('string')
    expect(typeof colorGrade('jade-masterpiece')).toBe('string')
  })

  it('returns a string for unknown grades', () => {
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatDropTable', () => {
  it('formats a single drop', () => {
    const drop = analyzeWaterDrop(richContent, 'test.ts')
    const output = formatDropTable(drop)
    expect(output).toContain('test.ts')
    expect(output).toContain('Flow Grace')
    expect(output).toContain('Cascade Clarity')
    expect(output).toContain('Pool Depth')
    expect(output).toContain('Moss Resilience')
    expect(output).toContain('Mist Clarity')
  })
})

describe('formatDropsTable', () => {
  it('returns message for empty array', () => {
    expect(formatDropsTable([])).toContain('No water drops')
  })

  it('formats multiple drops', () => {
    const drops = [
      analyzeWaterDrop(richContent, 'a.ts'),
      analyzeWaterDrop(moderateContent, 'b.ts'),
    ]
    const output = formatDropsTable(drops)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatTerraceTable', () => {
  it('formats a single terrace', () => {
    const drops = [analyzeWaterDrop(richContent, 'test.ts')]
    const terrace = analyzeWaterfallTerrace(drops, 'src')
    const output = formatTerraceTable(terrace)
    expect(output).toContain('src')
  })
})

describe('formatTerracesTable', () => {
  it('returns message for empty array', () => {
    expect(formatTerracesTable([])).toContain('No waterfall terraces')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildJadeWaterfallResult(['test.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Total Files')
    expect(output).toContain('Keeper Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns message for empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix this', 'Improve that'])
    expect(output).toContain('Fix this')
    expect(output).toContain('Improve that')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildJadeWaterfallResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Jade Waterfall Analysis')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats full result as JSON', async () => {
    const result = await buildJadeWaterfallResult(['test.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.drops).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.river).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Integration ───────────────────────────────────────────────────

describe('integration', () => {
  it('handles mixed quality files', async () => {
    const result = await buildJadeWaterfallResult(
      ['good.ts', 'ok.ts', 'bad.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.drops).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.droughtCount).toBeGreaterThanOrEqual(1)
    expect(result.river.overallSerenity).toBeGreaterThanOrEqual(0)
  })

  it('groups files into terraces by directory', async () => {
    const result = await buildJadeWaterfallResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, richContent],
    )
    expect(result.terraces).toHaveLength(2)
    const src = result.terraces.find(t => t.directory === 'src')
    const lib = result.terraces.find(t => t.directory === 'lib')
    expect(src).toBeDefined()
    expect(lib).toBeDefined()
    if (src) expect(src.drops).toHaveLength(2)
    if (lib) expect(lib.drops).toHaveLength(1)
  })

  it('condition counts match drop conditions', async () => {
    const result = await buildJadeWaterfallResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    const drought = result.drops.filter(d => d.condition === 'drought').length
    expect(result.stats.droughtCount).toBe(drought)
  })

  it('river overallSerenity is avg of 3 measures', async () => {
    const result = await buildJadeWaterfallResult(['test.ts'], [richContent])
    const expected = Math.round(
      (result.river.avgGrace + result.river.avgDepth + result.river.avgClarity) / 3,
    )
    expect(result.river.overallSerenity).toBe(expected)
  })

  it('stats avgMossResilience is computed', async () => {
    const result = await buildJadeWaterfallResult(['test.ts'], [richContent])
    expect(result.stats.avgMossResilience).toBeGreaterThan(0)
    expect(result.stats.avgMistClarity).toBeGreaterThan(0)
  })
})
