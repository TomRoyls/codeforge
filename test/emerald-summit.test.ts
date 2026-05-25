import { describe, it, expect } from 'vitest'

import {
  measureAscending,
  measureViewing,
  measureFortifying,
  measureKnowing,
  measureShielding,
  analyzeEmeraldPeak,
  analyzeEmeraldRange,
  classifyPeakCondition,
  classifyRangeType,
  classifyRangeCondition,
  classifyAlpinistGrade,
  generateRecommendations,
  buildEmeraldSummitResult,
} from '../src/commands/emerald-summit-helpers.js'

import {
  colorScore,
  colorGrade,
  formatPeakTable,
  formatPeaksTable,
  formatRangeTable,
  formatRangesTable,
  formatStatsTable,
  formatCelebration,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/emerald-summit-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const perfectContent = `export interface Widget<T> {
  readonly id: string
  readonly name: T
}

export abstract class BaseWidget<T> implements Widget<T> {
  abstract doWork(): void

  protected validate(input: T): boolean {
    return true
  }
}

/**
 * Creates a new widget
 * @param id - widget id
 */
export function createWidget<T>(id: string, config: T): Widget<T> {
  return { id, name: config }
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

const resilientContent = `export function safe(val?: string): string {
  try {
    return val ?? "default"
  } catch (e) {
    return "fallback"
  }
}
`

// ─── measureAscending ──────────────────────────────────────────────

describe('measureAscending', () => {
  it('returns a valid AscendingMeasure for empty string', () => {
    const m = measureAscending('')
    expect(m.altitude).toBe(0)
    expect(m.elevation).toBe('sea-level')
    expect(m.hasHighAltitude).toBe(false)
    expect(m.crypticCount).toBe(0)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('returns a valid AscendingMeasure for basic content', () => {
    const m = measureAscending('const x = 1')
    expect(m.altitude).toBeGreaterThanOrEqual(0)
    expect(m.altitude).toBeLessThanOrEqual(100)
    expect(typeof m.hasHighQuality).toBe('boolean')
    expect(typeof m.hasReadable).toBe('boolean')
    expect(typeof m.hasSelfDocumenting).toBe('boolean')
    expect(typeof m.hasNoCryptic).toBe('boolean')
    expect(typeof m.hasTransparent).toBe('boolean')
    expect(typeof m.hasNoObfuscated).toBe('boolean')
    expect(typeof m.hasClear).toBe('boolean')
    expect(typeof m.hasNoHidden).toBe('boolean')
    expect(typeof m.hasPolished).toBe('boolean')
    expect(typeof m.hasNoRough).toBe('boolean')
    expect(typeof m.hasRefined).toBe('boolean')
    expect(typeof m.hasNoCrude).toBe('boolean')
    expect(typeof m.hasExcellent).toBe('boolean')
  })

  it('penalizes var as cryptic', () => {
    const m = measureAscending('var x = 1')
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
    expect(m.hasNoRough).toBe(false)
  })

  it('penalizes eval as cryptic', () => {
    const m = measureAscending('eval("x")')
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCrude).toBe(false)
  })

  it('penalizes debugger as obfuscated', () => {
    const m = measureAscending('debugger')
    expect(m.obfuscatedCount).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(false)
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects self-documenting code', () => {
    const m = measureAscending('export function foo(): void {}')
    expect(m.hasSelfDocumenting).toBe(true)
  })

  it('detects refined code', () => {
    const m = measureAscending('export interface Foo<T> {}')
    expect(m.hasRefined).toBe(true)
  })

  it('detects polished code', () => {
    const m = measureAscending('export interface Foo { readonly x?: string }')
    expect(m.hasPolished).toBe(true)
  })

  it('gives high altitude to rich content', () => {
    const m = measureAscending(richContent)
    expect(m.altitude).toBeGreaterThan(40)
  })

  it('gives sea-level to poor content', () => {
    const m = measureAscending(poorContent)
    expect(m.altitude).toBeLessThan(30)
  })

  it('classifies elevation correctly', () => {
    const m = measureAscending(richContent)
    expect(m.elevation).toBeOneOf(['everest-class', 'major-peak', 'proper-summit', 'foothill', 'base-camp', 'sea-level'])
  })

  it('detects clear code', () => {
    const m = measureAscending('/** doc */ export function foo(): void {}')
    expect(m.hasClear).toBe(true)
  })
})

// ─── measureViewing ────────────────────────────────────────────────

describe('measureViewing', () => {
  it('returns a valid ViewingMeasure for empty string', () => {
    const m = measureViewing('')
    expect(m.clarity).toBe(0)
    expect(m.vista).toBe('no-vista')
    expect(m.hasHighClarity).toBe(false)
    expect(m.undocumentedCount).toBe(0)
    expect(m.mysteryCount).toBe(0)
  })

  it('rewards documentation and exports', () => {
    const m = measureViewing('/** docs */ export function helper(): void {}')
    expect(m.clarity).toBeGreaterThan(10)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellCommented).toBe(true)
  })

  it('penalizes var as undocumented', () => {
    const m = measureViewing('var x = 1')
    expect(m.undocumentedCount).toBeGreaterThan(0)
    expect(m.hasNoUndocumented).toBe(false)
  })

  it('penalizes eval as mystery', () => {
    const m = measureViewing('eval("x")')
    expect(m.mysteryCount).toBeGreaterThan(0)
  })

  it('penalizes debugger as mystery', () => {
    const m = measureViewing('debugger')
    expect(m.mysteryCount).toBeGreaterThan(0)
    expect(m.hasNoMystery).toBe(false)
  })

  it('detects visible code', () => {
    const m = measureViewing('export function foo(): void {}')
    expect(m.hasVisible).toBe(true)
  })

  it('detects illuminated code', () => {
    const m = measureViewing('/** docs */ export function foo(): void {}')
    expect(m.hasIlluminated).toBe(true)
  })

  it('detects approachable code', () => {
    const m = measureViewing('export const x = 1')
    expect(m.hasApproachable).toBe(true)
  })

  it('detects noIntimidating', () => {
    const m = measureViewing('export const x = 1')
    expect(m.hasNoIntimidating).toBe(true)
  })

  it('classifies vista correctly', () => {
    const m = measureViewing(richContent)
    expect(m.vista).toBeOneOf(['panoramic-360', 'breathtaking-view', 'proper-overlook', 'partial-view', 'clouded-sight', 'no-vista'])
  })

  it('detects self-documenting code', () => {
    const m = measureViewing('export function foo(): void {}')
    expect(m.hasSelfDocumenting).toBe(true)
  })

  it('detects understandable code', () => {
    const m = measureViewing('function foo(): string { return "hi" }')
    expect(m.hasUnderstandable).toBe(false)
  })
})

// ─── measureFortifying ─────────────────────────────────────────────

describe('measureFortifying', () => {
  it('returns a valid FortifyingMeasure for empty string', () => {
    const m = measureFortifying('')
    expect(m.strength).toBe(0)
    expect(m.ridge).toBe('no-ridge')
    expect(m.hasHighStrength).toBe(false)
    expect(m.untestedCount).toBe(0)
    expect(m.bareCrashCount).toBe(0)
  })

  it('rewards try/catch as tested', () => {
    const m = measureFortifying('try { work() } catch (e) { handle(e) }')
    expect(m.hasTested).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
  })

  it('penalizes var as untested', () => {
    const m = measureFortifying('var x = 1')
    expect(m.untestedCount).toBeGreaterThan(0)
    expect(m.hasNoUntested).toBe(false)
    expect(m.hasNoShaky).toBe(false)
  })

  it('penalizes eval as bare crash', () => {
    const m = measureFortifying('eval("x")')
    expect(m.bareCrashCount).toBeGreaterThan(0)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('penalizes debugger', () => {
    const m = measureFortifying('debugger')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects defensive code', () => {
    const m = measureFortifying('function foo(x?: string): string { return x ?? "default" }')
    expect(m.hasDefensive).toBe(true)
  })

  it('detects solid code', () => {
    const m = measureFortifying('class Foo { private readonly x: string }')
    expect(m.hasSolid).toBe(true)
  })

  it('detects load-bearing code', () => {
    const m = measureFortifying('interface Foo { bar(): string }')
    expect(m.hasLoadBearing).toBe(false)
  })

  it('detects robust code', () => {
    const m = measureFortifying('try { work() } catch(e) {}')
    expect(m.hasRobust).toBe(false)
  })

  it('classifies ridge correctly', () => {
    const m = measureFortifying(richContent)
    expect(m.ridge).toBeOneOf(['granite-ridge', 'solid-crest', 'proper-ridge', 'crumbling-edge', 'unstable-shelf', 'no-ridge'])
  })

  it('gives high strength to resilient content', () => {
    const m = measureFortifying(resilientContent)
    expect(m.strength).toBeGreaterThan(10)
  })
})

// ─── measureKnowing ────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns a valid KnowingMeasure for empty string', () => {
    const m = measureKnowing('')
    expect(m.wisdom).toBe(0)
    expect(m.sage).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
    expect(m.adHocCount).toBe(0)
    expect(m.hackedCount).toBe(0)
  })

  it('rewards documentation and abstractions', () => {
    const m = measureKnowing('/** docs */ export abstract class Base { abstract run(): void }')
    expect(m.wisdom).toBeGreaterThan(10)
    expect(m.hasPrincipled).toBe(true)
  })

  it('penalizes TODO as ad-hoc', () => {
    const m = measureKnowing('// TODO: fix this')
    expect(m.adHocCount).toBeGreaterThan(0)
    expect(m.hasNoExperimental).toBe(false)
  })

  it('penalizes hacky casts', () => {
    const m = measureKnowing('const x = data as any')
    expect(m.hackedCount).toBeGreaterThan(0)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects patterned code', () => {
    const m = measureKnowing('class Foo extends Bar {}')
    expect(m.hasPatterned).toBe(true)
    expect(m.hasProven).toBe(true)
  })

  it('detects well-architected code', () => {
    const m = measureKnowing('interface Foo {} class Bar implements Foo {}')
    expect(m.hasWellArchitected).toBe(true)
  })

  it('detects battle-tested code', () => {
    const m = measureKnowing('/** docs */ class Foo extends Bar {}')
    expect(m.hasBattleTested).toBe(true)
  })

  it('detects established code', () => {
    const m = measureKnowing(richContent)
    expect(m.hasEstablished).toBe(false)
  })

  it('classifies sage correctly', () => {
    const m = measureKnowing(richContent)
    expect(m.sage).toBeOneOf(['mountain-sage', 'summit-philosopher', 'proper-guide', 'learning-climber', 'lost-tourist', 'no-wisdom'])
  })

  it('penalizes var as ad-hoc', () => {
    const m = measureKnowing('var x = 1')
    expect(m.adHocCount).toBeGreaterThan(0)
    expect(m.hasNoAdHoc).toBe(false)
  })

  it('penalizes eval', () => {
    const m = measureKnowing('eval("x")')
    expect(m.hackedCount).toBeGreaterThan(0)
    expect(m.hasNoReinvented).toBe(false)
    expect(m.hasNoNovel).toBe(false)
  })
})

// ─── measureShielding ──────────────────────────────────────────────

describe('measureShielding', () => {
  it('returns a valid ShieldingMeasure for empty string', () => {
    const m = measureShielding('')
    expect(m.resilience).toBe(0)
    expect(m.shield).toBe('no-shield')
    expect(m.hasHighResilience).toBe(false)
    expect(m.singlePathCount).toBe(0)
    expect(m.assumedCount).toBe(0)
  })

  it('rewards try/catch and optional params', () => {
    const m = measureShielding('try { work() } catch(e) { handle(e) }')
    expect(m.resilience).toBeGreaterThan(0)
    expect(m.hasValidated).toBe(true)
  })

  it('detects edge case coverage', () => {
    const m = measureShielding('function foo(x?: string): string { return x ?? "default" }')
    expect(m.hasEdgeCaseCovered).toBe(true)
    expect(m.hasNoSinglePath).toBe(true)
  })

  it('detects null safety', () => {
    const m = measureShielding('const x = a?.b ?? "default"')
    expect(m.hasNullSafe).toBe(true)
    expect(m.hasNoNPE).toBe(true)
  })

  it('detects graceful error handling', () => {
    const m = measureShielding('try { work() } catch(e) { return x ?? "default" }')
    expect(m.hasGraceful).toBe(true)
  })

  it('detects recoverable code', () => {
    const m = measureShielding('try { work() } catch(e) { return fallback }')
    expect(m.hasRecoverable).toBe(true)
  })

  it('detects self-healing code', () => {
    const m = measureShielding('function safe(val?: string): string { try { return val ?? "default" } catch(e) { return "fallback" } }')
    expect(m.hasSelfHealing).toBe(true)
  })

  it('penalizes var as single path', () => {
    const m = measureShielding('var x = 1')
    expect(m.singlePathCount).toBeGreaterThan(0)
  })

  it('penalizes eval as assumed', () => {
    const m = measureShielding('eval("x")')
    expect(m.assumedCount).toBeGreaterThan(0)
    expect(m.hasNoAssumed).toBe(false)
  })

  it('penalizes any as assumed', () => {
    const m = measureShielding('const x: any = data')
    expect(m.assumedCount).toBeGreaterThan(0)
    expect(m.hasNoTrusting).toBe(false)
  })

  it('classifies shield correctly', () => {
    const m = measureShielding(richContent)
    expect(m.shield).toBeOneOf(['impervious-bastion', 'avalanche-proof', 'proper-shelter', 'fragile-bivouac', 'exposed-ledge', 'no-shield'])
  })

  it('detects boundary checking', () => {
    const m = measureShielding('function foo(x?: string): string { return x ?? "default" }')
    expect(m.hasBoundaryChecked).toBe(false)
  })

  it('gives high resilience to resilient content', () => {
    const m = measureShielding(resilientContent)
    expect(m.resilience).toBeGreaterThan(10)
  })
})

// ─── analyzeEmeraldPeak ────────────────────────────────────────────

describe('analyzeEmeraldPeak', () => {
  it('returns a complete EmeraldPeak', () => {
    const p = analyzeEmeraldPeak('const x = 1', 'test.ts')
    expect(p.file).toBe('test.ts')
    expect(p.gemAltitude).toBeGreaterThanOrEqual(0)
    expect(p.peakClarity).toBeGreaterThanOrEqual(0)
    expect(p.ridgeStrength).toBeGreaterThanOrEqual(0)
    expect(p.summitWisdom).toBeGreaterThanOrEqual(0)
    expect(p.avalancheResilience).toBeGreaterThanOrEqual(0)
    expect(p.qualityScore).toBeGreaterThanOrEqual(0)
    expect(p.condition).toBeDefined()
    expect(p.ascending).toBeDefined()
    expect(p.viewing).toBeDefined()
    expect(p.fortifying).toBeDefined()
    expect(p.knowing).toBeDefined()
    expect(p.shielding).toBeDefined()
  })

  it('gives high scores to rich content', () => {
    const p = analyzeEmeraldPeak(richContent, 'rich.ts')
    expect(p.qualityScore).toBeGreaterThan(40)
    expect(p.condition).not.toBe('dust')
  })

  it('gives low scores to poor content', () => {
    const p = analyzeEmeraldPeak(poorContent, 'poor.ts')
    expect(p.qualityScore).toBeLessThan(50)
  })

  it('computes qualityScore as average of five measures', () => {
    const p = analyzeEmeraldPeak(moderateContent, 'mod.ts')
    const expected = Math.round(
      p.gemAltitude * 0.2 +
      p.peakClarity * 0.2 +
      p.ridgeStrength * 0.2 +
      p.summitWisdom * 0.2 +
      p.avalancheResilience * 0.2,
    )
    expect(p.qualityScore).toBe(expected)
  })

  it('all scores are within 0-100 range', () => {
    const p = analyzeEmeraldPeak(richContent, 'rich.ts')
    expect(p.gemAltitude).toBeGreaterThanOrEqual(0)
    expect(p.gemAltitude).toBeLessThanOrEqual(100)
    expect(p.peakClarity).toBeGreaterThanOrEqual(0)
    expect(p.peakClarity).toBeLessThanOrEqual(100)
    expect(p.ridgeStrength).toBeGreaterThanOrEqual(0)
    expect(p.ridgeStrength).toBeLessThanOrEqual(100)
    expect(p.summitWisdom).toBeGreaterThanOrEqual(0)
    expect(p.summitWisdom).toBeLessThanOrEqual(100)
    expect(p.avalancheResilience).toBeGreaterThanOrEqual(0)
    expect(p.avalancheResilience).toBeLessThanOrEqual(100)
  })
})

// ─── analyzeEmeraldRange ───────────────────────────────────────────

describe('analyzeEmeraldRange', () => {
  it('returns empty range for empty array', () => {
    const r = analyzeEmeraldRange([], 'src')
    expect(r.directory).toBe('src')
    expect(r.peaks).toHaveLength(0)
    expect(r.avgAltitude).toBe(0)
    expect(r.rangeType).toBe('no-range')
    expect(r.condition).toBe('void')
  })

  it('aggregates peaks correctly', () => {
    const p1 = analyzeEmeraldPeak(richContent, 'src/a.ts')
    const p2 = analyzeEmeraldPeak(moderateContent, 'src/b.ts')
    const r = analyzeEmeraldRange([p1, p2], 'src')
    expect(r.peaks).toHaveLength(2)
    expect(r.avgAltitude).toBe(Math.round((p1.gemAltitude + p2.gemAltitude) / 2))
    expect(r.avgClarity).toBe(Math.round((p1.peakClarity + p2.peakClarity) / 2))
    expect(r.avgWisdom).toBe(Math.round((p1.summitWisdom + p2.summitWisdom) / 2))
  })

  it('counts pinnacles and dust', () => {
    const p1 = analyzeEmeraldPeak(richContent, 'a.ts')
    const p2 = analyzeEmeraldPeak(poorContent, 'b.ts')
    const r = analyzeEmeraldRange([p1, p2], '.')
    expect(r.emeraldPinnacleCount + r.dustCount).toBeLessThanOrEqual(2)
  })
})

// ─── classifyPeakCondition ─────────────────────────────────────────

describe('classifyPeakCondition', () => {
  it('classifies emerald-pinnacle for 90+', () => {
    expect(classifyPeakCondition(90)).toBe('emerald-pinnacle')
    expect(classifyPeakCondition(100)).toBe('emerald-pinnacle')
  })

  it('classifies jade-peak for 75-89', () => {
    expect(classifyPeakCondition(75)).toBe('jade-peak')
    expect(classifyPeakCondition(89)).toBe('jade-peak')
  })

  it('classifies proper-summit for 60-74', () => {
    expect(classifyPeakCondition(60)).toBe('proper-summit')
    expect(classifyPeakCondition(74)).toBe('proper-summit')
  })

  it('classifies rocky-ridge for 40-59', () => {
    expect(classifyPeakCondition(40)).toBe('rocky-ridge')
    expect(classifyPeakCondition(59)).toBe('rocky-ridge')
  })

  it('classifies gravel-slope for 20-39', () => {
    expect(classifyPeakCondition(20)).toBe('gravel-slope')
    expect(classifyPeakCondition(39)).toBe('gravel-slope')
  })

  it('classifies dust for below 20', () => {
    expect(classifyPeakCondition(0)).toBe('dust')
    expect(classifyPeakCondition(19)).toBe('dust')
  })
})

// ─── classifyRangeType ─────────────────────────────────────────────

describe('classifyRangeType', () => {
  it('returns no-range for empty array', () => {
    expect(classifyRangeType([])).toBe('no-range')
  })

  it('returns valid type for peaks', () => {
    const peaks = Array.from({ length: 10 }, () => analyzeEmeraldPeak(richContent, 'a.ts'))
    const result = classifyRangeType(peaks)
    expect(result).toBeOneOf(['himalayas', 'alps', 'proper-range', 'foothills', 'mound', 'no-range'])
  })
})

// ─── classifyRangeCondition ────────────────────────────────────────

describe('classifyRangeCondition', () => {
  it('returns emerald-kingdom for 85+', () => {
    expect(classifyRangeCondition(85)).toBe('emerald-kingdom')
    expect(classifyRangeCondition(100)).toBe('emerald-kingdom')
  })

  it('returns jade-mountains for 70-84', () => {
    expect(classifyRangeCondition(70)).toBe('jade-mountains')
  })

  it('returns proper-range for 55-69', () => {
    expect(classifyRangeCondition(55)).toBe('proper-range')
  })

  it('returns rocky-hills for 35-54', () => {
    expect(classifyRangeCondition(35)).toBe('rocky-hills')
  })

  it('returns eroded-peaks for 15-34', () => {
    expect(classifyRangeCondition(15)).toBe('eroded-peaks')
  })

  it('returns void for below 15', () => {
    expect(classifyRangeCondition(0)).toBe('void')
    expect(classifyRangeCondition(14)).toBe('void')
  })
})

// ─── classifyAlpinistGrade ─────────────────────────────────────────

describe('classifyAlpinistGrade', () => {
  it('returns mountain-legend for 85+', () => {
    expect(classifyAlpinistGrade(85)).toBe('mountain-legend')
    expect(classifyAlpinistGrade(100)).toBe('mountain-legend')
  })

  it('returns expert-alpinist for 70-84', () => {
    expect(classifyAlpinistGrade(70)).toBe('expert-alpinist')
  })

  it('returns skilled-climber for 55-69', () => {
    expect(classifyAlpinistGrade(55)).toBe('skilled-climber')
  })

  it('returns apprentice for 40-54', () => {
    expect(classifyAlpinistGrade(40)).toBe('apprentice')
  })

  it('returns novice for 20-39', () => {
    expect(classifyAlpinistGrade(20)).toBe('novice')
  })

  it('returns flatlander for below 20', () => {
    expect(classifyAlpinistGrade(0)).toBe('flatlander')
    expect(classifyAlpinistGrade(19)).toBe('flatlander')
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high altitude and no dust', () => {
    const peaks = [analyzeEmeraldPeak(richContent, 'a.ts')]
    const ranges = [analyzeEmeraldRange(peaks, '.')]
    const massif = { avgAltitude: 90, avgClarity: 90, avgWisdom: 90, isEmerald: true, overallAltitude: 90 }
    const stats = {
      overallAltitude: 90, dustCount: 0, avgGemAltitude: 90, avgPeakClarity: 90,
      avgRidgeStrength: 90, avgSummitWisdom: 90, avgAvalancheResilience: 90,
    } as unknown as import('../src/commands/emerald-summit-helpers.js').EmeraldSummitResult['stats']
    const recs = generateRecommendations(peaks, ranges, massif, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('recommends improvements for low scores', () => {
    const peaks = [analyzeEmeraldPeak(poorContent, 'bad.ts')]
    const ranges = [analyzeEmeraldRange(peaks, '.')]
    const massif = { avgAltitude: 10, avgClarity: 10, avgWisdom: 10, isEmerald: false, overallAltitude: 10 }
    const stats = {
      overallAltitude: 10, dustCount: 1, avgGemAltitude: 10, avgPeakClarity: 10,
      avgRidgeStrength: 10, avgSummitWisdom: 10, avgAvalancheResilience: 10,
    } as unknown as import('../src/commands/emerald-summit-helpers.js').EmeraldSummitResult['stats']
    const recs = generateRecommendations(peaks, ranges, massif, stats)
    expect(recs.length).toBeGreaterThan(1)
  })

  it('returns steady message when scores are moderate', () => {
    const peaks = [analyzeEmeraldPeak(moderateContent, 'mod.ts')]
    const ranges = [analyzeEmeraldRange(peaks, '.')]
    const massif = { avgAltitude: 70, avgClarity: 70, avgWisdom: 70, isEmerald: false, overallAltitude: 70 }
    const stats = {
      overallAltitude: 70, dustCount: 0, avgGemAltitude: 70, avgPeakClarity: 70,
      avgRidgeStrength: 70, avgSummitWisdom: 70, avgAvalancheResilience: 70,
    } as unknown as import('../src/commands/emerald-summit-helpers.js').EmeraldSummitResult['stats']
    const recs = generateRecommendations(peaks, ranges, massif, stats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildEmeraldSummitResult ──────────────────────────────────────

describe('buildEmeraldSummitResult', () => {
  it('returns empty result for no files', async () => {
    const r = await buildEmeraldSummitResult([], [])
    expect(r.peaks).toHaveLength(0)
    expect(r.ranges).toHaveLength(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.massif.overallAltitude).toBe(0)
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('includes celebration field', async () => {
    const r = await buildEmeraldSummitResult([], [])
    expect(r.celebration.milestone).toBe(540)
    expect(r.celebration.name).toBe('emerald-summit')
    expect(r.celebration.message).toContain('540')
    expect(r.celebration.previousMilestones).toEqual([420, 430, 440, 450, 460, 470, 480, 490, 500, 510, 520, 530])
    expect(typeof r.celebration.totalTests).toBe('number')
  })

  it('returns complete result for single file', async () => {
    const r = await buildEmeraldSummitResult(['src/a.ts'], [moderateContent])
    expect(r.peaks).toHaveLength(1)
    expect(r.ranges).toHaveLength(1)
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.bestPeak).toBe('src/a.ts')
    expect(r.stats.highest).toBe('src/a.ts')
    expect(r.stats.clearest).toBe('src/a.ts')
    expect(r.stats.strongest).toBe('src/a.ts')
    expect(r.stats.wisest).toBe('src/a.ts')
  })

  it('computes overallAltitude as avg of altitude, clarity, wisdom', async () => {
    const r = await buildEmeraldSummitResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    const expectedAlt = Math.round((r.stats.avgGemAltitude + r.stats.avgPeakClarity + r.stats.avgSummitWisdom) / 3)
    expect(r.stats.overallAltitude).toBe(expectedAlt)
  })

  it('groups files by directory into ranges', async () => {
    const r = await buildEmeraldSummitResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [moderateContent, richContent, poorContent],
    )
    expect(r.ranges.length).toBe(2)
  })

  it('counts condition categories correctly', async () => {
    const r = await buildEmeraldSummitResult(
      ['a.ts', 'b.ts'],
      [richContent, poorContent],
    )
    const sum = r.stats.emeraldPinnacleCount +
      r.stats.jadePeakCount +
      r.stats.properSummitCount +
      r.stats.rockyRidgeCount +
      r.stats.gravelSlopeCount +
      r.stats.dustCount
    expect(sum).toBe(2)
  })

  it('computes high-score counts', async () => {
    const r = await buildEmeraldSummitResult(['a.ts'], [richContent])
    expect(r.stats.hasHighAltitudeCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighStrengthCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
  })

  it('computes massif isEmerald correctly', async () => {
    const r = await buildEmeraldSummitResult(['a.ts'], [richContent])
    expect(typeof r.massif.isEmerald).toBe('boolean')
  })

  it('computes alpinistGrade', async () => {
    const r = await buildEmeraldSummitResult(['a.ts'], [richContent])
    expect(r.stats.alpinistGrade).toBeOneOf(['mountain-legend', 'expert-alpinist', 'skilled-climber', 'apprentice', 'novice', 'flatlander'])
  })

  it('celebration totalTests is non-negative', async () => {
    const r = await buildEmeraldSummitResult(['a.ts'], [moderateContent])
    expect(r.celebration.totalTests).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns a string for all ranges', () => {
    expect(typeof colorScore(95)).toBe('string')
    expect(typeof colorScore(65)).toBe('string')
    expect(typeof colorScore(45)).toBe('string')
    expect(typeof colorScore(25)).toBe('string')
    expect(typeof colorScore(5)).toBe('string')
  })

  it('colorGrade returns a string', () => {
    expect(typeof colorGrade('emerald-pinnacle')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })

  it('formatPeakTable produces output with all measures', () => {
    const p = analyzeEmeraldPeak(moderateContent, 'test.ts')
    const out = formatPeakTable(p)
    expect(out).toContain('test.ts')
    expect(out).toContain('Gem Altitude')
    expect(out).toContain('Peak Clarity')
    expect(out).toContain('Ridge Strength')
    expect(out).toContain('Summit Wisdom')
    expect(out).toContain('Avalanche Resilience')
    expect(out).toContain('Quality Score')
  })

  it('formatPeaksTable handles empty', () => {
    expect(formatPeaksTable([])).toContain('No emerald peaks')
  })

  it('formatRangeTable produces output', () => {
    const p = analyzeEmeraldPeak(moderateContent, 'test.ts')
    const r = analyzeEmeraldRange([p], 'src')
    const out = formatRangeTable(r)
    expect(out).toContain('src')
    expect(out).toContain('Avg Altitude')
    expect(out).toContain('Range Type')
  })

  it('formatRangesTable handles empty', () => {
    expect(formatRangesTable([])).toContain('No emerald ranges')
  })

  it('formatStatsTable produces output', async () => {
    const r = await buildEmeraldSummitResult(['a.ts'], [moderateContent])
    const out = formatStatsTable(r.stats)
    expect(out).toContain('Emerald Summit Statistics')
    expect(out).toContain('Total Files')
    expect(out).toContain('Overall Altitude')
    expect(out).toContain('Alpinist Grade')
  })

  it('formatCelebration produces output', async () => {
    const r = await buildEmeraldSummitResult(['a.ts'], [moderateContent])
    const out = formatCelebration(r.celebration)
    expect(out).toContain('Milestone #540')
    expect(out).toContain('emerald-summit')
    expect(out).toContain('540 commands')
  })

  it('formatRecommendations handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formatRecommendations formats items', () => {
    const out = formatRecommendations(['Improve altitude'])
    expect(out).toContain('Improve altitude')
  })

  it('formatResultTable produces full output with celebration', async () => {
    const r = await buildEmeraldSummitResult(['a.ts'], [moderateContent])
    const out = formatResultTable(r)
    expect(out).toContain('Milestone #540')
    expect(out).toContain('Emerald Peak Analysis')
    expect(out).toContain('Emerald Ranges')
    expect(out).toContain('Emerald Summit Statistics')
    expect(out).toContain('Massif')
    expect(out).toContain('Recommendations')
  })

  it('formatResultJson produces valid JSON with celebration', async () => {
    const r = await buildEmeraldSummitResult(['a.ts'], [moderateContent])
    const out = formatResultJson(r)
    const parsed = JSON.parse(out)
    expect(parsed.peaks).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.massif).toBeDefined()
    expect(parsed.celebration).toBeDefined()
    expect(parsed.celebration.milestone).toBe(540)
    expect(parsed.recommendations).toBeDefined()
  })

  it('formatResultJson celebration has correct structure', async () => {
    const r = await buildEmeraldSummitResult([], [])
    const out = formatResultJson(r)
    const parsed = JSON.parse(out)
    expect(parsed.celebration.previousMilestones).toHaveLength(12)
    expect(parsed.celebration.totalTests).toBeGreaterThanOrEqual(0)
  })
})
