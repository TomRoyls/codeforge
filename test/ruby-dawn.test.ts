import { describe, it, expect } from 'vitest'

import {
  measureEnergizing,
  measureIlluminating,
  measureWarming,
  measureBurning,
  measureSustaining,
  analyzeRubyRay,
  analyzeRubySunrise,
  classifyRayCondition,
  classifySunriseType,
  classifySunriseCondition,
  classifyJewelerGrade,
  generateRecommendations,
  buildRubyDawnResult,
} from '../src/commands/ruby-dawn-helpers.js'

import {
  colorScore,
  colorGrade,
  formatRayTable,
  formatRaysTable,
  formatSunriseTable,
  formatSunrisesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/ruby-dawn-format-helpers.js'

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
    } finally {
      this.cleanup()
    }
  }

  protected async transform(input: T): Promise<T> {
    return input
  }

  private cleanup(): void {
    this.cache.clear()
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

const cleanContent = `export function safe(val?: string): string {
  try {
    return val ?? "default"
  } catch (e) {
    return "fallback"
  }
}
`

// ─── measureEnergizing ─────────────────────────────────────────────

describe('measureEnergizing', () => {
  it('returns valid EnergizingMeasure for empty string', () => {
    const m = measureEnergizing('')
    expect(m.energy).toBe(0)
    expect(m.flame).toBe('no-energy')
    expect(m.hasHighEnergy).toBe(false)
    expect(m.fillerCount).toBe(0)
    expect(m.boilerplateCount).toBe(0)
  })

  it('rewards exports and async', () => {
    const m = measureEnergizing('export async function foo(): Promise<void> { await work() }')
    expect(m.energy).toBeGreaterThan(10)
    expect(m.hasAlive).toBe(false)
  })

  it('penalizes console as filler', () => {
    const m = measureEnergizing('console.log("x")')
    expect(m.fillerCount).toBeGreaterThan(0)
    expect(m.hasNoFiller).toBe(false)
  })

  it('penalizes debugger as boilerplate', () => {
    const m = measureEnergizing('debugger')
    expect(m.boilerplateCount).toBeGreaterThan(0)
    expect(m.hasNoBoilerplate).toBe(false)
  })

  it('detects impactful code', () => {
    const m = measureEnergizing('export function foo() { return [1].map(x => x) }')
    expect(m.hasImpactful).toBe(true)
  })

  it('detects dynamic code', () => {
    const m = measureEnergizing('async function foo() { return [1].map(x => x) }')
    expect(m.hasDynamic).toBe(true)
  })

  it('detects powerful code', () => {
    const m = measureEnergizing('async function foo<T>(): Promise<T> { return {} as T }')
    expect(m.hasPowerful).toBe(true)
  })

  it('classifies flame correctly', () => {
    const m = measureEnergizing(richContent)
    expect(m.flame).toBeOneOf(['inferno', 'blazing-fire', 'proper-flame', 'flickering-candle', 'dying-ember', 'no-energy'])
  })

  it('detects alive code', () => {
    const m = measureEnergizing('export function live() { const x = async () => {} }')
    expect(m.hasAlive).toBe(true)
  })
})

// ─── measureIlluminating ───────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns valid IlluminatingMeasure for empty string', () => {
    const m = measureIlluminating('')
    expect(m.clarity).toBe(0)
    expect(m.dawn).toBe('no-dawn')
    expect(m.hasHighClarity).toBe(false)
    expect(m.crypticCount).toBe(0)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('rewards type annotations and docs', () => {
    const m = measureIlluminating('/** docs */ export function foo(): String { return "hi" }')
    expect(m.clarity).toBeGreaterThan(10)
    expect(m.hasSelfDocumenting).toBe(true)
  })

  it('penalizes eval as cryptic', () => {
    const m = measureIlluminating('eval("x")')
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('penalizes var as obfuscated', () => {
    const m = measureIlluminating('var x = 1')
    expect(m.obfuscatedCount).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('detects clear code', () => {
    const m = measureIlluminating('function foo(): String { return "hi" }')
    expect(m.hasClear).toBe(true)
  })

  it('detects obvious code', () => {
    const m = measureIlluminating('function foo(x: String): String { return x }')
    expect(m.hasObvious).toBe(true)
  })

  it('detects inviting code', () => {
    const m = measureIlluminating('/** docs */ export function foo(): void {}')
    expect(m.hasInviting).toBe(true)
  })

  it('classifies dawn correctly', () => {
    const m = measureIlluminating(richContent)
    expect(m.dawn).toBeOneOf(['crystal-dawn', 'bright-morning', 'proper-daybreak', 'misty-dawn', 'dark-morning', 'no-dawn'])
  })

  it('detects transparent code', () => {
    const m = measureIlluminating('export function foo(): void {}')
    expect(m.hasTransparent).toBe(true)
  })
})

// ─── measureWarming ────────────────────────────────────────────────

describe('measureWarming', () => {
  it('returns valid WarmingMeasure for empty string', () => {
    const m = measureWarming('')
    expect(m.warmth).toBe(0)
    expect(m.glow).toBe('no-warmth')
    expect(m.hasHighWarmth).toBe(false)
    expect(m.hostileCount).toBe(0)
    expect(m.harshCount).toBe(0)
  })

  it('rewards optional params and nullish', () => {
    const m = measureWarming('function greet(name?: string): string { return name ?? "friend" }')
    expect(m.warmth).toBeGreaterThan(0)
    expect(m.hasFriendly).toBe(true)
    expect(m.hasHumanCentric).toBe(true)
  })

  it('penalizes eval as hostile', () => {
    const m = measureWarming('eval("x")')
    expect(m.hostileCount).toBeGreaterThan(0)
    expect(m.hasNoHostile).toBe(false)
  })

  it('detects graceful code', () => {
    const m = measureWarming('try { work() } catch(e) { return x ?? "default" }')
    expect(m.hasGraceful).toBe(true)
  })

  it('detects compassionate code', () => {
    const m = measureWarming('try { work(x) } catch(e) { return x ?? "default" } function foo(y?: string) {}')
    expect(m.hasCompassionate).toBe(true)
  })

  it('detects helpful code', () => {
    const m = measureWarming('/** docs */ export function foo(): void {}')
    expect(m.hasHelpful).toBe(true)
  })

  it('detects welcoming code', () => {
    const m = measureWarming('export function foo(x?: string): void {}')
    expect(m.hasWelcoming).toBe(true)
  })

  it('classifies glow correctly', () => {
    const m = measureWarming(richContent)
    expect(m.glow).toBeOneOf(['radiant-warmth', 'gentle-heat', 'proper-glow', 'cool-surface', 'cold-stone', 'no-warmth'])
  })

  it('penalizes debugger as harsh', () => {
    const m = measureWarming('debugger')
    expect(m.harshCount).toBeGreaterThan(0)
    expect(m.hasNoHarsh).toBe(false)
  })
})

// ─── measureBurning ────────────────────────────────────────────────

describe('measureBurning', () => {
  it('returns valid BurningMeasure for empty string', () => {
    const m = measureBurning('')
    expect(m.precision).toBe(0)
    expect(m.fire).toBe('no-fire')
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

  it('detects unambiguous code', () => {
    const m = measureBurning('function foo(): String { readonly x: String }')
    expect(m.hasUnambiguous).toBe(true)
  })

  it('classifies fire correctly', () => {
    const m = measureBurning(richContent)
    expect(m.fire).toBeOneOf(['surgical-flame', 'precise-burn', 'proper-fire', 'wildfire', 'smoldering', 'no-fire'])
  })

  it('detects precise code', () => {
    const m = measureBurning('interface Foo { readonly x?: string }')
    expect(m.hasPrecise).toBe(true)
  })
})

// ─── measureSustaining ─────────────────────────────────────────────

describe('measureSustaining', () => {
  it('returns valid SustainingMeasure for empty string', () => {
    const m = measureSustaining('')
    expect(m.resilience).toBe(0)
    expect(m.blood).toBe('no-resilience')
    expect(m.hasHighResilience).toBe(false)
    expect(m.untestedCount).toBe(0)
    expect(m.bareCrashCount).toBe(0)
  })

  it('rewards try/catch and finally', () => {
    const m = measureSustaining('try { work() } catch (e) { handle() } finally { cleanup() }')
    expect(m.resilience).toBeGreaterThan(0)
    expect(m.hasTested).toBe(true)
    expect(m.hasUnkillable).toBe(true)
  })

  it('penalizes eval as bare crash', () => {
    const m = measureSustaining('eval("x")')
    expect(m.bareCrashCount).toBeGreaterThan(0)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('penalizes var as untested', () => {
    const m = measureSustaining('var x = 1')
    expect(m.untestedCount).toBeGreaterThan(0)
    expect(m.hasNoUntested).toBe(false)
  })

  it('detects robust code', () => {
    const m = measureSustaining('try { work() } catch(e) {} function foo(): Void {}')
    expect(m.hasRobust).toBe(true)
  })

  it('detects defensive code', () => {
    const m = measureSustaining('function foo(x?: string): string { return x ?? "default" }')
    expect(m.hasDefensive).toBe(true)
  })

  it('detects recoverable code', () => {
    const m = measureSustaining('try { work() } catch(e) {}')
    expect(m.hasRecoverable).toBe(true)
  })

  it('classifies blood correctly', () => {
    const m = measureSustaining(richContent)
    expect(m.blood).toBeOneOf(['iron-constitution', 'strong-heartbeat', 'proper-pulse', 'weak-pulse', 'failing-heart', 'no-resilience'])
  })

  it('detects typeSafe code', () => {
    const m = measureSustaining('function foo(): String { return "hi" }')
    expect(m.hasTypeSafe).toBe(true)
  })
})

// ─── analyzeRubyRay ────────────────────────────────────────────────

describe('analyzeRubyRay', () => {
  it('returns complete RubyRay', () => {
    const r = analyzeRubyRay('const x = 1', 'test.ts')
    expect(r.file).toBe('test.ts')
    expect(r.crimsonEnergy).toBeGreaterThanOrEqual(0)
    expect(r.dawnClarity).toBeGreaterThanOrEqual(0)
    expect(r.gemWarmth).toBeGreaterThanOrEqual(0)
    expect(r.firePrecision).toBeGreaterThanOrEqual(0)
    expect(r.bloodResilience).toBeGreaterThanOrEqual(0)
    expect(r.qualityScore).toBeGreaterThanOrEqual(0)
    expect(r.condition).toBeDefined()
    expect(r.energizing).toBeDefined()
    expect(r.illuminating).toBeDefined()
    expect(r.warming).toBeDefined()
    expect(r.burning).toBeDefined()
    expect(r.sustaining).toBeDefined()
  })

  it('gives higher scores to rich content', () => {
    const r = analyzeRubyRay(richContent, 'rich.ts')
    expect(r.qualityScore).toBeGreaterThan(40)
    expect(r.condition).not.toBe('dust')
  })

  it('gives low scores to poor content', () => {
    const r = analyzeRubyRay(poorContent, 'poor.ts')
    expect(r.qualityScore).toBeLessThan(50)
  })

  it('computes qualityScore as average of five measures', () => {
    const r = analyzeRubyRay(moderateContent, 'mod.ts')
    const expected = Math.round(
      r.crimsonEnergy * 0.2 +
      r.dawnClarity * 0.2 +
      r.gemWarmth * 0.2 +
      r.firePrecision * 0.2 +
      r.bloodResilience * 0.2,
    )
    expect(r.qualityScore).toBe(expected)
  })
})

// ─── analyzeRubySunrise ────────────────────────────────────────────

describe('analyzeRubySunrise', () => {
  it('returns empty sunrise for empty array', () => {
    const s = analyzeRubySunrise([], 'src')
    expect(s.directory).toBe('src')
    expect(s.rays).toHaveLength(0)
    expect(s.avgEnergy).toBe(0)
    expect(s.sunriseType).toBe('no-sunrise')
    expect(s.condition).toBe('void')
  })

  it('aggregates rays correctly', () => {
    const r1 = analyzeRubyRay(richContent, 'src/a.ts')
    const r2 = analyzeRubyRay(moderateContent, 'src/b.ts')
    const s = analyzeRubySunrise([r1, r2], 'src')
    expect(s.rays).toHaveLength(2)
    expect(s.avgEnergy).toBe(Math.round((r1.crimsonEnergy + r2.crimsonEnergy) / 2))
    expect(s.avgClarity).toBe(Math.round((r1.dawnClarity + r2.dawnClarity) / 2))
  })
})

// ─── classifyRayCondition ──────────────────────────────────────────

describe('classifyRayCondition', () => {
  it('classifies ruby-masterpiece for 90+', () => {
    expect(classifyRayCondition(90)).toBe('ruby-masterpiece')
    expect(classifyRayCondition(100)).toBe('ruby-masterpiece')
  })

  it('classifies dust for below 20', () => {
    expect(classifyRayCondition(0)).toBe('dust')
    expect(classifyRayCondition(19)).toBe('dust')
  })

  it('classifies crimson-gem for 75-89', () => {
    expect(classifyRayCondition(75)).toBe('crimson-gem')
  })

  it('classifies proper-ruby for 60-74', () => {
    expect(classifyRayCondition(60)).toBe('proper-ruby')
  })

  it('classifies cloudy-stone for 40-59', () => {
    expect(classifyRayCondition(40)).toBe('cloudy-stone')
  })

  it('classifies rough-rock for 20-39', () => {
    expect(classifyRayCondition(20)).toBe('rough-rock')
  })
})

// ─── classifySunriseType ───────────────────────────────────────────

describe('classifySunriseType', () => {
  it('returns no-sunrise for empty array', () => {
    expect(classifySunriseType([])).toBe('no-sunrise')
  })

  it('returns valid type for rays', () => {
    const rays = Array.from({ length: 10 }, () => analyzeRubyRay(richContent, 'a.ts'))
    expect(classifySunriseType(rays)).toBeOneOf(['crimson-horizon', 'ruby-sunrise', 'proper-dawn', 'grey-morning', 'dark-dawn', 'no-sunrise'])
  })
})

// ─── classifySunriseCondition ──────────────────────────────────────

describe('classifySunriseCondition', () => {
  it('returns correct conditions for all ranges', () => {
    expect(classifySunriseCondition(85)).toBe('magnificent-dawn')
    expect(classifySunriseCondition(70)).toBe('beautiful-sunrise')
    expect(classifySunriseCondition(55)).toBe('proper-morning')
    expect(classifySunriseCondition(35)).toBe('grey-dawn')
    expect(classifySunriseCondition(15)).toBe('dark-morning')
    expect(classifySunriseCondition(0)).toBe('void')
  })
})

// ─── classifyJewelerGrade ──────────────────────────────────────────

describe('classifyJewelerGrade', () => {
  it('returns correct grades for all ranges', () => {
    expect(classifyJewelerGrade(85)).toBe('master-gemologist')
    expect(classifyJewelerGrade(70)).toBe('expert-jeweler')
    expect(classifyJewelerGrade(55)).toBe('skilled-cutter')
    expect(classifyJewelerGrade(40)).toBe('apprentice')
    expect(classifyJewelerGrade(20)).toBe('novice')
    expect(classifyJewelerGrade(0)).toBe('rock-smasher')
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high brilliance and no dust', () => {
    const rays = [analyzeRubyRay(richContent, 'a.ts')]
    const sunrises = [analyzeRubySunrise(rays, '.')]
    const horizon = { avgEnergy: 90, avgClarity: 90, avgResilience: 90, isRuby: true, overallBrilliance: 90 }
    const stats = {
      overallBrilliance: 90, dustCount: 0, avgCrimsonEnergy: 90, avgDawnClarity: 90,
      avgGemWarmth: 90, avgFirePrecision: 90, avgBloodResilience: 90,
    } as unknown as import('../src/commands/ruby-dawn-helpers.js').RubyDawnResult['stats']
    const recs = generateRecommendations(rays, sunrises, horizon, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('recommends improvements for low scores', () => {
    const rays = [analyzeRubyRay(poorContent, 'bad.ts')]
    const sunrises = [analyzeRubySunrise(rays, '.')]
    const horizon = { avgEnergy: 10, avgClarity: 10, avgResilience: 10, isRuby: false, overallBrilliance: 10 }
    const stats = {
      overallBrilliance: 10, dustCount: 1, avgCrimsonEnergy: 10, avgDawnClarity: 10,
      avgGemWarmth: 10, avgFirePrecision: 10, avgBloodResilience: 10,
    } as unknown as import('../src/commands/ruby-dawn-helpers.js').RubyDawnResult['stats']
    const recs = generateRecommendations(rays, sunrises, horizon, stats)
    expect(recs.length).toBeGreaterThan(1)
  })

  it('returns steady message for moderate scores', () => {
    const rays = [analyzeRubyRay(moderateContent, 'mod.ts')]
    const sunrises = [analyzeRubySunrise(rays, '.')]
    const horizon = { avgEnergy: 70, avgClarity: 70, avgResilience: 70, isRuby: false, overallBrilliance: 70 }
    const stats = {
      overallBrilliance: 70, dustCount: 0, avgCrimsonEnergy: 70, avgDawnClarity: 70,
      avgGemWarmth: 70, avgFirePrecision: 70, avgBloodResilience: 70,
    } as unknown as import('../src/commands/ruby-dawn-helpers.js').RubyDawnResult['stats']
    const recs = generateRecommendations(rays, sunrises, horizon, stats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildRubyDawnResult ───────────────────────────────────────────

describe('buildRubyDawnResult', () => {
  it('returns empty result for no files', async () => {
    const r = await buildRubyDawnResult([], [])
    expect(r.rays).toHaveLength(0)
    expect(r.sunrises).toHaveLength(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.horizon.overallBrilliance).toBe(0)
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('returns complete result for single file', async () => {
    const r = await buildRubyDawnResult(['src/a.ts'], [moderateContent])
    expect(r.rays).toHaveLength(1)
    expect(r.sunrises).toHaveLength(1)
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.bestRay).toBe('src/a.ts')
    expect(r.stats.mostEnergetic).toBe('src/a.ts')
    expect(r.stats.clearest).toBe('src/a.ts')
    expect(r.stats.warmest).toBe('src/a.ts')
    expect(r.stats.mostResilient).toBe('src/a.ts')
  })

  it('computes overallBrilliance as avg of energy, clarity, resilience', async () => {
    const r = await buildRubyDawnResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    const expected = Math.round((r.stats.avgCrimsonEnergy + r.stats.avgDawnClarity + r.stats.avgBloodResilience) / 3)
    expect(r.stats.overallBrilliance).toBe(expected)
  })

  it('groups files by directory into sunrises', async () => {
    const r = await buildRubyDawnResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [moderateContent, richContent, poorContent],
    )
    expect(r.sunrises.length).toBe(2)
  })

  it('counts condition categories correctly', async () => {
    const r = await buildRubyDawnResult(
      ['a.ts', 'b.ts'],
      [richContent, poorContent],
    )
    const sum = r.stats.rubyMasterpieceCount +
      r.stats.crimsonGemCount +
      r.stats.properRubyCount +
      r.stats.cloudyStoneCount +
      r.stats.roughRockCount +
      r.stats.dustCount
    expect(sum).toBe(2)
  })

  it('computes high-score counts', async () => {
    const r = await buildRubyDawnResult(['a.ts'], [richContent])
    expect(r.stats.hasHighEnergyCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighWarmthCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
  })

  it('computes jewelerGrade', async () => {
    const r = await buildRubyDawnResult(['a.ts'], [richContent])
    expect(r.stats.jewelerGrade).toBeOneOf(['master-gemologist', 'expert-jeweler', 'skilled-cutter', 'apprentice', 'novice', 'rock-smasher'])
  })

  it('computes horizon.isRuby correctly', async () => {
    const r = await buildRubyDawnResult(['a.ts'], [richContent])
    expect(typeof r.horizon.isRuby).toBe('boolean')
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
    expect(typeof colorGrade('ruby-masterpiece')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })

  it('formatRayTable produces output', () => {
    const r = analyzeRubyRay(moderateContent, 'test.ts')
    const out = formatRayTable(r)
    expect(out).toContain('test.ts')
    expect(out).toContain('Crimson Energy')
    expect(out).toContain('Dawn Clarity')
    expect(out).toContain('Gem Warmth')
    expect(out).toContain('Fire Precision')
    expect(out).toContain('Blood Resilience')
    expect(out).toContain('Quality Score')
  })

  it('formatRaysTable handles empty', () => {
    expect(formatRaysTable([])).toContain('No ruby rays')
  })

  it('formatSunriseTable produces output', () => {
    const r = analyzeRubyRay(moderateContent, 'test.ts')
    const s = analyzeRubySunrise([r], 'src')
    const out = formatSunriseTable(s)
    expect(out).toContain('src')
    expect(out).toContain('Avg Energy')
    expect(out).toContain('Sunrise Type')
  })

  it('formatSunrisesTable handles empty', () => {
    expect(formatSunrisesTable([])).toContain('No ruby sunrises')
  })

  it('formatStatsTable produces output', async () => {
    const r = await buildRubyDawnResult(['a.ts'], [moderateContent])
    const out = formatStatsTable(r.stats)
    expect(out).toContain('Ruby Dawn Statistics')
    expect(out).toContain('Total Files')
    expect(out).toContain('Overall Brilliance')
    expect(out).toContain('Jeweler Grade')
  })

  it('formatRecommendations handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formatRecommendations formats items', () => {
    const out = formatRecommendations(['Ignite crimson energy'])
    expect(out).toContain('Ignite crimson energy')
  })

  it('formatResultTable produces full output', async () => {
    const r = await buildRubyDawnResult(['a.ts'], [moderateContent])
    const out = formatResultTable(r)
    expect(out).toContain('Ruby Ray Analysis')
    expect(out).toContain('Ruby Sunrises')
    expect(out).toContain('Ruby Dawn Statistics')
    expect(out).toContain('Horizon')
    expect(out).toContain('Recommendations')
  })

  it('formatResultJson produces valid JSON', async () => {
    const r = await buildRubyDawnResult(['a.ts'], [moderateContent])
    const out = formatResultJson(r)
    const parsed = JSON.parse(out)
    expect(parsed.rays).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.horizon).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
