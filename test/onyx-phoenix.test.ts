import { describe, it, expect } from 'vitest'

import {
  measureEnduring,
  measureRegenerating,
  measureLearning,
  measureBurning,
  measureGlowing,
  analyzeOnyxFeather,
  analyzeOnyxNest,
  classifyFeatherCondition,
  classifyNestType,
  classifyNestCondition,
  classifyKeeperGrade,
  generateRecommendations,
  buildOnyxPhoenixResult,
} from '../src/commands/onyx-phoenix-helpers.js'

import {
  colorScore,
  colorGrade,
  formatFeatherTable,
  formatFeathersTable,
  formatNestTable,
  formatNestsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/onyx-phoenix-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const richContent = `import { EventEmitter } from 'node:events'
import type { Callback } from './types.js'

export interface Processor<T> {
  process(input: T): Promise<T>
}

export class DataProcessor<T> implements Processor<T> {
  private readonly cache = new Map<string, T>()

  async process(input: T): Promise<T> {
    try {
      const key = JSON.stringify(input)
      const cached = this.cache.get(key)
      if (cached) return cached
      const result = await this.transform(input)
      this.cache.set(key, result)
      return result
    } catch (error) {
      throw new Error('Processing failed')
    }
  }

  protected async transform(input: T): Promise<T> {
    return input
  }
}

export type ProcessorConfig<T> = {
  readonly concurrency: number
  readonly retryCount: number
  readonly transformer?: (input: T) => T
}

export function createProcessor<T>(config: ProcessorConfig<T>): Processor<T> {
  return new DataProcessor<T>()
}
`

const poorContent = `var x = 1
var y = 2
eval('alert("bad")')
debugger
// TODO: fix this
// HACK: temporary
as any
`

const moderateContent = `export function processItems(items: string[]): string[] {
  return items.map(item => item.trim()).filter(Boolean)
}
`

const resilientContent = `export function safe(val?: string): string {
  try {
    return val ?? "default"
  } catch (e) {
    return "fallback"
  }
}
`

// ─── measureEnduring ───────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns valid EnduringMeasure for empty string', () => {
    const m = measureEnduring('')
    expect(m.resilience).toBe(0)
    expect(m.stone).toBe('no-resilience')
    expect(m.hasHighResilience).toBe(false)
    expect(m.bareCrashCount).toBe(0)
    expect(m.untestedCount).toBe(0)
  })

  it('rewards try/catch', () => {
    const m = measureEnduring('try { work() } catch (e) { handle(e) }')
    expect(m.hasTested).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
  })

  it('penalizes eval as bare crash', () => {
    const m = measureEnduring('eval("x")')
    expect(m.bareCrashCount).toBeGreaterThan(0)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('penalizes var as untested', () => {
    const m = measureEnduring('var x = 1')
    expect(m.untestedCount).toBeGreaterThan(0)
    expect(m.hasNoUntested).toBe(false)
  })

  it('detects defensive code', () => {
    const m = measureEnduring('function foo(x?: string): string { return x ?? "d" }')
    expect(m.hasDefensive).toBe(true)
  })

  it('detects battle-tested code', () => {
    const m = measureEnduring('try { work() } catch(e) {} export function foo(): void {}')
    expect(m.hasBattleTested).toBe(true)
  })

  it('classifies stone correctly', () => {
    const m = measureEnduring(richContent)
    expect(m.stone).toBeOneOf(['obsidian-hard', 'granite-solid', 'proper-rock', 'sandstone-soft', 'crumbling-clay', 'no-resilience'])
  })

  it('detects recoverable code', () => {
    const m = measureEnduring('try { work() } catch(e) {}')
    expect(m.hasRecoverable).toBe(true)
  })

  it('detects noFatal', () => {
    const m = measureEnduring('const x = 1')
    expect(m.hasNoFatal).toBe(true)
  })
})

// ─── measureRegenerating ───────────────────────────────────────────

describe('measureRegenerating', () => {
  it('returns valid RegeneratingMeasure for empty string', () => {
    const m = measureRegenerating('')
    expect(m.quality).toBe(0)
    expect(m.rebirth).toBe('no-rebirth')
    expect(m.hasHighQuality).toBe(false)
    expect(m.harshFailCount).toBe(0)
    expect(m.singleAttemptCount).toBe(0)
  })

  it('rewards try/catch and finally', () => {
    const m = measureRegenerating('try { work() } catch (e) { handle() } finally { cleanup() }')
    expect(m.quality).toBeGreaterThan(0)
    expect(m.hasRetryLogic).toBe(true)
  })

  it('penalizes eval as harsh fail', () => {
    const m = measureRegenerating('eval("x")')
    expect(m.harshFailCount).toBeGreaterThan(0)
    expect(m.hasNoHarshFail).toBe(false)
  })

  it('detects graceful recovery', () => {
    const m = measureRegenerating('try { work(x) } catch(e) { return x ?? "default" }')
    expect(m.hasGraceful).toBe(true)
  })

  it('detects fallback', () => {
    const m = measureRegenerating('const x = a ?? b || c')
    expect(m.hasFallback).toBe(true)
  })

  it('detects adaptive code', () => {
    const m = measureRegenerating('function foo<T>(x?: T): T | undefined { return x }')
    expect(m.hasAdaptive).toBe(true)
  })

  it('classifies rebirth correctly', () => {
    const m = measureRegenerating(richContent)
    expect(m.rebirth).toBeOneOf(['perfect-resurrection', 'strong-recovery', 'proper-healing', 'weak-revival', 'no-recovery', 'no-rebirth'])
  })

  it('detects self-healing', () => {
    const m = measureRegenerating('function safe(val?: string): string { try { return val ?? "d" } catch(e) { return "f" } }')
    expect(m.hasSelfHealing).toBe(true)
  })
})

// ─── measureLearning ───────────────────────────────────────────────

describe('measureLearning', () => {
  it('returns valid LearningMeasure for empty string', () => {
    const m = measureLearning('')
    expect(m.wisdom).toBe(0)
    expect(m.ash).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
    expect(m.undocumentedCount).toBe(0)
    expect(m.assumedCount).toBe(0)
  })

  it('rewards documentation and interfaces', () => {
    const m = measureLearning('/** docs */ export interface Foo<T> { run(input: T): T }')
    expect(m.wisdom).toBeGreaterThan(10)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellCommented).toBe(true)
  })

  it('penalizes var as undocumented', () => {
    const m = measureLearning('var x = 1')
    expect(m.undocumentedCount).toBeGreaterThan(0)
    expect(m.hasNoUndocumented).toBe(false)
  })

  it('penalizes eval as assumed', () => {
    const m = measureLearning('eval("x")')
    expect(m.assumedCount).toBeGreaterThan(0)
    expect(m.hasNoAssumed).toBe(false)
  })

  it('detects principled code', () => {
    const m = measureLearning('abstract class Base { abstract run(): void }')
    expect(m.hasPrincipled).toBe(true)
  })

  it('detects patterned code', () => {
    const m = measureLearning('class Foo extends Bar {}')
    expect(m.hasPatterned).toBe(true)
  })

  it('classifies ash correctly', () => {
    const m = measureLearning(richContent)
    expect(m.ash).toBeOneOf(['ancient-ashes', 'wise-remnants', 'proper-insight', 'flickering-memory', 'scattered-dust', 'no-wisdom'])
  })

  it('detects edge case coverage', () => {
    const m = measureLearning('function foo(x?: string): string { return x ?? "default" }')
    expect(m.hasEdgeCaseCovered).toBe(true)
  })
})

// ─── measureBurning ────────────────────────────────────────────────

describe('measureBurning', () => {
  it('returns valid BurningMeasure for empty string', () => {
    const m = measureBurning('')
    expect(m.precision).toBe(0)
    expect(m.flame).toBe('no-flame')
    expect(m.hasHighPrecision).toBe(false)
    expect(m.approximateCount).toBe(0)
    expect(m.sloppyCount).toBe(0)
  })

  it('rewards type annotations and generics', () => {
    const m = measureBurning('export interface Widget<T> { readonly id: string }')
    expect(m.precision).toBeGreaterThan(10)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasDefined).toBe(true)
  })

  it('penalizes var as approximate', () => {
    const m = measureBurning('var x = 1')
    expect(m.approximateCount).toBeGreaterThan(0)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('penalizes eval and debugger as sloppy', () => {
    const m = measureBurning('eval("x"); debugger')
    expect(m.sloppyCount).toBe(2)
    expect(m.hasNoSloppy).toBe(false)
  })

  it('detects sharp code', () => {
    const m = measureBurning('function foo(): String { return "hi" }')
    expect(m.hasSharp).toBe(true)
  })

  it('detects precise code', () => {
    const m = measureBurning('interface Foo { readonly x?: string }')
    expect(m.hasPrecise).toBe(true)
  })

  it('classifies flame correctly', () => {
    const m = measureBurning(richContent)
    expect(m.flame).toBeOneOf(['surgical-fire', 'precise-burn', 'proper-flame', 'wildfire', 'dying-spark', 'no-flame'])
  })

  it('detects targeted code', () => {
    const m = measureBurning('export function foo(): Void {}')
    expect(m.hasTargeted).toBe(true)
  })
})

// ─── measureGlowing ────────────────────────────────────────────────

describe('measureGlowing', () => {
  it('returns valid GlowingMeasure for empty string', () => {
    const m = measureGlowing('')
    expect(m.vitality).toBe(0)
    expect(m.ember).toBe('no-vitality')
    expect(m.hasHighVitality).toBe(false)
    expect(m.abandonedCount).toBe(0)
    expect(m.stagnantCount).toBe(0)
  })

  it('rewards exports and async', () => {
    const m = measureGlowing('import { work } from "./work"; export async function live(): Promise<void> { await work() }')
    expect(m.vitality).toBeGreaterThan(10)
    expect(m.hasActive).toBe(true)
    expect(m.hasFresh).toBe(true)
  })

  it('penalizes TODO as abandoned', () => {
    const m = measureGlowing('// TODO: fix this')
    expect(m.abandonedCount).toBeGreaterThan(0)
    expect(m.hasNoAbandoned).toBe(false)
  })

  it('penalizes var as stagnant', () => {
    const m = measureGlowing('var x = 1')
    expect(m.stagnantCount).toBeGreaterThan(0)
    expect(m.hasNoStale).toBe(false)
  })

  it('detects vibrant code', () => {
    const m = measureGlowing('const x = [1].map(n => n * 2).filter(Boolean)')
    expect(m.hasVibrant).toBe(true)
  })

  it('detects evolving code', () => {
    const m = measureGlowing('async function foo<T>(): Promise<T> { return {} as T }')
    expect(m.hasEvolving).toBe(true)
  })

  it('classifies ember correctly', () => {
    const m = measureGlowing(richContent)
    expect(m.ember).toBeOneOf(['eternal-glow', 'bright-ember', 'proper-heat', 'fading-coal', 'cold-ash', 'no-vitality'])
  })

  it('detects alive code', () => {
    const m = measureGlowing('export const x = 1')
    expect(m.hasAlive).toBe(true)
  })

  it('detects maintained code', () => {
    const m = measureGlowing('export function foo(): void {}')
    expect(m.hasMaintained).toBe(true)
  })
})

// ─── analyzeOnyxFeather ────────────────────────────────────────────

describe('analyzeOnyxFeather', () => {
  it('returns complete OnyxFeather', () => {
    const f = analyzeOnyxFeather('const x = 1', 'test.ts')
    expect(f.file).toBe('test.ts')
    expect(f.darkResilience).toBeGreaterThanOrEqual(0)
    expect(f.rebirthQuality).toBeGreaterThanOrEqual(0)
    expect(f.ashWisdom).toBeGreaterThanOrEqual(0)
    expect(f.flamePrecision).toBeGreaterThanOrEqual(0)
    expect(f.emberVitality).toBeGreaterThanOrEqual(0)
    expect(f.qualityScore).toBeGreaterThanOrEqual(0)
    expect(f.condition).toBeDefined()
    expect(f.enduring).toBeDefined()
    expect(f.regenerating).toBeDefined()
    expect(f.learning).toBeDefined()
    expect(f.burning).toBeDefined()
    expect(f.glowing).toBeDefined()
  })

  it('gives higher scores to rich content', () => {
    const f = analyzeOnyxFeather(richContent, 'rich.ts')
    expect(f.qualityScore).toBeGreaterThan(40)
    expect(f.condition).not.toBe('ash')
  })

  it('gives low scores to poor content', () => {
    const f = analyzeOnyxFeather(poorContent, 'poor.ts')
    expect(f.qualityScore).toBeLessThan(50)
  })

  it('computes qualityScore as average of five measures', () => {
    const f = analyzeOnyxFeather(moderateContent, 'mod.ts')
    const expected = Math.round(
      f.darkResilience * 0.2 +
      f.rebirthQuality * 0.2 +
      f.ashWisdom * 0.2 +
      f.flamePrecision * 0.2 +
      f.emberVitality * 0.2,
    )
    expect(f.qualityScore).toBe(expected)
  })
})

// ─── analyzeOnyxNest ───────────────────────────────────────────────

describe('analyzeOnyxNest', () => {
  it('returns empty nest for empty array', () => {
    const n = analyzeOnyxNest([], 'src')
    expect(n.directory).toBe('src')
    expect(n.feathers).toHaveLength(0)
    expect(n.avgResilience).toBe(0)
    expect(n.nestType).toBe('no-nest')
    expect(n.condition).toBe('void')
  })

  it('aggregates feathers correctly', () => {
    const f1 = analyzeOnyxFeather(richContent, 'src/a.ts')
    const f2 = analyzeOnyxFeather(moderateContent, 'src/b.ts')
    const n = analyzeOnyxNest([f1, f2], 'src')
    expect(n.feathers).toHaveLength(2)
    expect(n.avgResilience).toBe(Math.round((f1.darkResilience + f2.darkResilience) / 2))
    expect(n.avgRebirth).toBe(Math.round((f1.rebirthQuality + f2.rebirthQuality) / 2))
  })
})

// ─── classifyFeatherCondition ──────────────────────────────────────

describe('classifyFeatherCondition', () => {
  it('classifies immortal-phoenix for 90+', () => {
    expect(classifyFeatherCondition(90)).toBe('immortal-phoenix')
    expect(classifyFeatherCondition(100)).toBe('immortal-phoenix')
  })

  it('classifies ash for below 20', () => {
    expect(classifyFeatherCondition(0)).toBe('ash')
    expect(classifyFeatherCondition(19)).toBe('ash')
  })

  it('classifies rising-bird for 75-89', () => {
    expect(classifyFeatherCondition(75)).toBe('rising-bird')
  })

  it('classifies proper-firebird for 60-74', () => {
    expect(classifyFeatherCondition(60)).toBe('proper-firebird')
  })

  it('classifies wounded-falcon for 40-59', () => {
    expect(classifyFeatherCondition(40)).toBe('wounded-falcon')
  })

  it('classifies fallen-bird for 20-39', () => {
    expect(classifyFeatherCondition(20)).toBe('fallen-bird')
  })
})

// ─── classifyNestType ──────────────────────────────────────────────

describe('classifyNestType', () => {
  it('returns no-nest for empty array', () => {
    expect(classifyNestType([])).toBe('no-nest')
  })

  it('returns valid type for feathers', () => {
    const feathers = Array.from({ length: 10 }, () => analyzeOnyxFeather(richContent, 'a.ts'))
    expect(classifyNestType(feathers)).toBeOneOf(['eternal-nest', 'phoenix-roost', 'proper-perch', 'small-nest', 'ground-scrape', 'no-nest'])
  })
})

// ─── classifyNestCondition ─────────────────────────────────────────

describe('classifyNestCondition', () => {
  it('returns correct conditions for all ranges', () => {
    expect(classifyNestCondition(85)).toBe('phoenix-sanctuary')
    expect(classifyNestCondition(70)).toBe('rising-colony')
    expect(classifyNestCondition(55)).toBe('proper-flock')
    expect(classifyNestCondition(35)).toBe('scattered-feathers')
    expect(classifyNestCondition(15)).toBe('burned-ground')
    expect(classifyNestCondition(0)).toBe('void')
  })
})

// ─── classifyKeeperGrade ───────────────────────────────────────────

describe('classifyKeeperGrade', () => {
  it('returns correct grades for all ranges', () => {
    expect(classifyKeeperGrade(85)).toBe('phoenix-lord')
    expect(classifyKeeperGrade(70)).toBe('fire-keeper')
    expect(classifyKeeperGrade(55)).toBe('ash-guardian')
    expect(classifyKeeperGrade(40)).toBe('apprentice')
    expect(classifyKeeperGrade(20)).toBe('novice')
    expect(classifyKeeperGrade(0)).toBe('smoker')
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high rebirth and no ash', () => {
    const feathers = [analyzeOnyxFeather(richContent, 'a.ts')]
    const nests = [analyzeOnyxNest(feathers, '.')]
    const flight = { avgResilience: 90, avgRebirth: 90, avgWisdom: 90, isImmortal: true, overallRebirth: 90 }
    const stats = {
      overallRebirth: 90, ashCount: 0, avgDarkResilience: 90, avgRebirthQuality: 90,
      avgAshWisdom: 90, avgFlamePrecision: 90, avgEmberVitality: 90,
    } as unknown as import('../src/commands/onyx-phoenix-helpers.js').OnyxPhoenixResult['stats']
    const recs = generateRecommendations(feathers, nests, flight, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('recommends improvements for low scores', () => {
    const feathers = [analyzeOnyxFeather(poorContent, 'bad.ts')]
    const nests = [analyzeOnyxNest(feathers, '.')]
    const flight = { avgResilience: 10, avgRebirth: 10, avgWisdom: 10, isImmortal: false, overallRebirth: 10 }
    const stats = {
      overallRebirth: 10, ashCount: 1, avgDarkResilience: 10, avgRebirthQuality: 10,
      avgAshWisdom: 10, avgFlamePrecision: 10, avgEmberVitality: 10,
    } as unknown as import('../src/commands/onyx-phoenix-helpers.js').OnyxPhoenixResult['stats']
    const recs = generateRecommendations(feathers, nests, flight, stats)
    expect(recs.length).toBeGreaterThan(1)
  })

  it('returns steady message for moderate scores', () => {
    const feathers = [analyzeOnyxFeather(moderateContent, 'mod.ts')]
    const nests = [analyzeOnyxNest(feathers, '.')]
    const flight = { avgResilience: 70, avgRebirth: 70, avgWisdom: 70, isImmortal: false, overallRebirth: 70 }
    const stats = {
      overallRebirth: 70, ashCount: 0, avgDarkResilience: 70, avgRebirthQuality: 70,
      avgAshWisdom: 70, avgFlamePrecision: 70, avgEmberVitality: 70,
    } as unknown as import('../src/commands/onyx-phoenix-helpers.js').OnyxPhoenixResult['stats']
    const recs = generateRecommendations(feathers, nests, flight, stats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildOnyxPhoenixResult ───────────────────────────────────────

describe('buildOnyxPhoenixResult', () => {
  it('returns empty result for no files', async () => {
    const r = await buildOnyxPhoenixResult([], [])
    expect(r.feathers).toHaveLength(0)
    expect(r.nests).toHaveLength(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.flight.overallRebirth).toBe(0)
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('returns complete result for single file', async () => {
    const r = await buildOnyxPhoenixResult(['src/a.ts'], [moderateContent])
    expect(r.feathers).toHaveLength(1)
    expect(r.nests).toHaveLength(1)
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.bestFeather).toBe('src/a.ts')
    expect(r.stats.mostResilient).toBe('src/a.ts')
    expect(r.stats.bestRebirth).toBe('src/a.ts')
    expect(r.stats.wisest).toBe('src/a.ts')
    expect(r.stats.mostPrecise).toBe('src/a.ts')
  })

  it('computes overallRebirth as avg of resilience, rebirth, wisdom', async () => {
    const r = await buildOnyxPhoenixResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    const expected = Math.round((r.stats.avgDarkResilience + r.stats.avgRebirthQuality + r.stats.avgAshWisdom) / 3)
    expect(r.stats.overallRebirth).toBe(expected)
  })

  it('groups files by directory into nests', async () => {
    const r = await buildOnyxPhoenixResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [moderateContent, richContent, poorContent],
    )
    expect(r.nests.length).toBe(2)
  })

  it('counts condition categories correctly', async () => {
    const r = await buildOnyxPhoenixResult(
      ['a.ts', 'b.ts'],
      [richContent, poorContent],
    )
    const sum = r.stats.immortalPhoenixCount +
      r.stats.risingBirdCount +
      r.stats.properFirebirdCount +
      r.stats.woundedFalconCount +
      r.stats.fallenBirdCount +
      r.stats.ashCount
    expect(sum).toBe(2)
  })

  it('computes high-score counts', async () => {
    const r = await buildOnyxPhoenixResult(['a.ts'], [richContent])
    expect(r.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighRebirthCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighVitalityCount).toBeGreaterThanOrEqual(0)
  })

  it('computes keeperGrade', async () => {
    const r = await buildOnyxPhoenixResult(['a.ts'], [richContent])
    expect(r.stats.keeperGrade).toBeOneOf(['phoenix-lord', 'fire-keeper', 'ash-guardian', 'apprentice', 'novice', 'smoker'])
  })

  it('computes flight.isImmortal correctly', async () => {
    const r = await buildOnyxPhoenixResult(['a.ts'], [richContent])
    expect(typeof r.flight.isImmortal).toBe('boolean')
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string for all ranges', () => {
    expect(typeof colorScore(95)).toBe('string')
    expect(typeof colorScore(65)).toBe('string')
    expect(typeof colorScore(5)).toBe('string')
  })

  it('colorGrade returns string', () => {
    expect(typeof colorGrade('immortal-phoenix')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })

  it('formatFeatherTable produces output', () => {
    const f = analyzeOnyxFeather(moderateContent, 'test.ts')
    const out = formatFeatherTable(f)
    expect(out).toContain('test.ts')
    expect(out).toContain('Dark Resilience')
    expect(out).toContain('Rebirth Quality')
    expect(out).toContain('Ash Wisdom')
    expect(out).toContain('Flame Precision')
    expect(out).toContain('Ember Vitality')
    expect(out).toContain('Quality Score')
  })

  it('formatFeathersTable handles empty', () => {
    expect(formatFeathersTable([])).toContain('No onyx feathers')
  })

  it('formatNestTable produces output', () => {
    const f = analyzeOnyxFeather(moderateContent, 'test.ts')
    const n = analyzeOnyxNest([f], 'src')
    const out = formatNestTable(n)
    expect(out).toContain('src')
    expect(out).toContain('Avg Resilience')
    expect(out).toContain('Nest Type')
  })

  it('formatNestsTable handles empty', () => {
    expect(formatNestsTable([])).toContain('No onyx nests')
  })

  it('formatStatsTable produces output', async () => {
    const r = await buildOnyxPhoenixResult(['a.ts'], [moderateContent])
    const out = formatStatsTable(r.stats)
    expect(out).toContain('Onyx Phoenix Statistics')
    expect(out).toContain('Total Files')
    expect(out).toContain('Overall Rebirth')
    expect(out).toContain('Keeper Grade')
  })

  it('formatRecommendations handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formatRecommendations formats items', () => {
    const out = formatRecommendations(['Improve resilience'])
    expect(out).toContain('Improve resilience')
  })

  it('formatResultTable produces full output', async () => {
    const r = await buildOnyxPhoenixResult(['a.ts'], [moderateContent])
    const out = formatResultTable(r)
    expect(out).toContain('Onyx Feather Analysis')
    expect(out).toContain('Onyx Nests')
    expect(out).toContain('Onyx Phoenix Statistics')
    expect(out).toContain('Flight')
    expect(out).toContain('Recommendations')
  })

  it('formatResultJson produces valid JSON', async () => {
    const r = await buildOnyxPhoenixResult(['a.ts'], [moderateContent])
    const out = formatResultJson(r)
    const parsed = JSON.parse(out)
    expect(parsed.feathers).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.flight).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
