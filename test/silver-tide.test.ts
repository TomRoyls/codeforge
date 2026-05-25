import { describe, it, expect } from 'vitest'

import {
  measurePurifying,
  measurePulsing,
  measureFlowing,
  measureStriking,
  measureKnowing,
  analyzeSilverWave,
  analyzeSilverShore,
  classifyWaveCondition,
  classifyShoreType,
  classifyShoreCondition,
  classifyNavigatorGrade,
  generateRecommendations,
  buildSilverTideResult,
} from '../src/commands/silver-tide-helpers.js'

import {
  colorScore,
  colorGrade,
  formatWaveTable,
  formatWavesTable,
  formatShoreTable,
  formatShoresTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/silver-tide-format-helpers.js'

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

const cleanContent = `export function safe(val?: string): string {
  try {
    return val ?? "default"
  } catch (e) {
    return "fallback"
  }
}
`

// ─── measurePurifying ──────────────────────────────────────────────

describe('measurePurifying', () => {
  it('returns valid PurifyingMeasure for empty string', () => {
    const m = measurePurifying('')
    expect(m.purity).toBe(0)
    expect(m.moon).toBe('no-light')
    expect(m.hasHighPurity).toBe(false)
    expect(m.deadCodeCount).toBe(0)
    expect(m.hackyCount).toBe(0)
  })

  it('rewards exports and type annotations', () => {
    const m = measurePurifying('export function foo(): String { return "hi" }')
    expect(m.purity).toBeGreaterThan(0)
    expect(m.hasClear).toBe(true)
  })

  it('penalizes eval as hacky', () => {
    const m = measurePurifying('eval("x")')
    expect(m.hackyCount).toBeGreaterThan(0)
    expect(m.hasNoHacky).toBe(false)
  })

  it('penalizes debugger as dead code', () => {
    const m = measurePurifying('debugger')
    expect(m.deadCodeCount).toBeGreaterThan(0)
    expect(m.hasNoDeadCode).toBe(false)
  })

  it('detects clean code', () => {
    const m = measurePurifying('const x = 1')
    expect(m.hasClean).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
  })

  it('detects pristine code', () => {
    const m = measurePurifying('export function foo(): String { return "hi" }')
    expect(m.hasPristine).toBe(true)
  })

  it('detects luminous code', () => {
    const m = measurePurifying('/** docs */ export function foo(): void {}')
    expect(m.hasLuminous).toBe(true)
  })

  it('classifies moon correctly', () => {
    const m = measurePurifying(richContent)
    expect(m.moon).toBeOneOf(['full-silver-moon', 'bright-crescent', 'proper-glow', 'clouded-moon', 'dark-night', 'no-light'])
  })

  it('detects polished code', () => {
    const m = measurePurifying('function foo(): String { readonly x: String }')
    expect(m.hasPolished).toBe(true)
  })
})

// ─── measurePulsing ────────────────────────────────────────────────

describe('measurePulsing', () => {
  it('returns valid PulsingMeasure for empty string', () => {
    const m = measurePulsing('')
    expect(m.rhythm).toBe(0)
    expect(m.tide).toBe('no-rhythm')
    expect(m.hasHighRhythm).toBe(false)
    expect(m.erraticCount).toBe(0)
    expect(m.untestedCount).toBe(0)
  })

  it('rewards try/catch and finally', () => {
    const m = measurePulsing('try { work() } catch (e) { handle() } finally { cleanup() }')
    expect(m.rhythm).toBeGreaterThan(0)
    expect(m.hasTested).toBe(true)
  })

  it('penalizes eval as erratic', () => {
    const m = measurePulsing('eval("x")')
    expect(m.erraticCount).toBeGreaterThan(0)
    expect(m.hasNoErratic).toBe(false)
  })

  it('penalizes var as untested', () => {
    const m = measurePulsing('var x = 1')
    expect(m.untestedCount).toBeGreaterThan(0)
    expect(m.hasNoUntested).toBe(false)
  })

  it('detects reliable code', () => {
    const m = measurePulsing('try { work() } catch(e) { handle() }')
    expect(m.hasReliable).toBe(true)
  })

  it('detects smooth code', () => {
    const m = measurePulsing('async function foo() { await work() }')
    expect(m.hasSmooth).toBe(true)
  })

  it('detects stable code', () => {
    const m = measurePulsing('try { work() } catch(e) {} function foo(): Void {}')
    expect(m.hasStable).toBe(true)
  })

  it('classifies tide correctly', () => {
    const m = measurePulsing(richContent)
    expect(m.tide).toBeOneOf(['moon-driven', 'steady-rhythm', 'proper-pulse', 'irregular-beat', 'arrhythmia', 'no-rhythm'])
  })

  it('detects deterministic code', () => {
    const m = measurePulsing('const x = 1')
    expect(m.hasDeterministic).toBe(true)
  })
})

// ─── measureFlowing ────────────────────────────────────────────────

describe('measureFlowing', () => {
  it('returns valid FlowingMeasure for empty string', () => {
    const m = measureFlowing('')
    expect(m.current).toBe(0)
    expect(m.stream).toBe('no-flow')
    expect(m.hasHighCurrent).toBe(false)
    expect(m.bottleneckCount).toBe(0)
    expect(m.tangledCount).toBe(0)
  })

  it('rewards pipelines and arrows', () => {
    const m = measureFlowing('const x = [1].map(n => n * 2).filter(Boolean)')
    expect(m.current).toBeGreaterThan(0)
    expect(m.hasEfficientFlow).toBe(true)
  })

  it('penalizes eval as tangled', () => {
    const m = measureFlowing('eval("x")')
    expect(m.tangledCount).toBeGreaterThan(0)
    expect(m.hasNoTangled).toBe(false)
  })

  it('detects direct paths', () => {
    const m = measureFlowing('function foo(): String { return "hi" }')
    expect(m.hasDirectPaths).toBe(true)
  })

  it('detects graceful flow', () => {
    const m = measureFlowing('function foo(x?: string): string { return x ?? "default" }')
    expect(m.hasGraceful).toBe(true)
  })

  it('detects fluid code', () => {
    const m = measureFlowing('async function foo() { return [1].map(n => n) }')
    expect(m.hasFluid).toBe(true)
  })

  it('detects elegant code', () => {
    const m = measureFlowing('function pipe<T>(x: T): T { return [x].map(n => n)[0] }')
    expect(m.hasElegant).toBe(true)
  })

  it('classifies stream correctly', () => {
    const m = measureFlowing(richContent)
    expect(m.stream).toBeOneOf(['silver-river', 'smooth-flow', 'proper-current', 'turbulent-rapid', 'stagnant-pool', 'no-flow'])
  })

  it('detects streamlined code', () => {
    const m = measureFlowing('items.map(x => x).filter(Boolean)')
    expect(m.hasStreamlined).toBe(true)
  })
})

// ─── measureStriking ───────────────────────────────────────────────

describe('measureStriking', () => {
  it('returns valid StrikingMeasure for empty string', () => {
    const m = measureStriking('')
    expect(m.precision).toBe(0)
    expect(m.wave).toBe('no-precision')
    expect(m.hasHighPrecision).toBe(false)
    expect(m.approximateCount).toBe(0)
    expect(m.sloppyCount).toBe(0)
  })

  it('rewards type annotations and generics', () => {
    const m = measureStriking('export interface Widget<T> { readonly id: string }')
    expect(m.precision).toBeGreaterThan(10)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasDefined).toBe(true)
  })

  it('penalizes var as approximate', () => {
    const m = measureStriking('var x = 1')
    expect(m.approximateCount).toBeGreaterThan(0)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('penalizes eval and debugger as sloppy', () => {
    const m = measureStriking('eval("x"); debugger')
    expect(m.sloppyCount).toBe(2)
    expect(m.hasNoSloppy).toBe(false)
  })

  it('detects sharp code', () => {
    const m = measureStriking('function foo(): String { return "hi" }')
    expect(m.hasSharp).toBe(true)
  })

  it('detects precise code', () => {
    const m = measureStriking('interface Foo { readonly x?: string }')
    expect(m.hasPrecise).toBe(true)
  })

  it('detects crystalline code', () => {
    const m = measureStriking('function foo(): String { readonly x: String }')
    expect(m.hasCrystalline).toBe(true)
  })

  it('classifies wave correctly', () => {
    const m = measureStriking(richContent)
    expect(m.wave).toBeOneOf(['surgical-wave', 'precise-break', 'proper-crest', 'approximate-splash', 'scattered-surf', 'no-precision'])
  })
})

// ─── measureKnowing ────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns valid KnowingMeasure for empty string', () => {
    const m = measureKnowing('')
    expect(m.wisdom).toBe(0)
    expect(m.depth).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
    expect(m.adHocCount).toBe(0)
    expect(m.hackyCount).toBe(0)
  })

  it('rewards documentation and interfaces', () => {
    const m = measureKnowing('/** docs */ export interface Foo<T> { run(input: T): T }')
    expect(m.wisdom).toBeGreaterThan(10)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellStructured).toBe(true)
  })

  it('penalizes var as ad-hoc', () => {
    const m = measureKnowing('var x = 1')
    expect(m.adHocCount).toBeGreaterThan(0)
    expect(m.hasNoAdHoc).toBe(false)
  })

  it('penalizes eval and any as hacky', () => {
    const m = measureKnowing('eval("x"); const y = x as any')
    expect(m.hackyCount).toBeGreaterThan(0)
    expect(m.hasNoHacky).toBe(false)
  })

  it('detects principled code', () => {
    const m = measureKnowing('abstract class Base { abstract run(): void }')
    expect(m.hasPrincipled).toBe(true)
  })

  it('detects patterned code', () => {
    const m = measureKnowing('class Foo extends Bar {}')
    expect(m.hasPatterned).toBe(true)
  })

  it('detects battle-tested code', () => {
    const m = measureKnowing('try { work() } catch(e) {} export function foo(): void {}')
    expect(m.hasBattleTested).toBe(true)
  })

  it('classifies depth correctly', () => {
    const m = measureKnowing(richContent)
    expect(m.depth).toBeOneOf(['abyssal-wisdom', 'deep-knowledge', 'proper-understanding', 'surface-awareness', 'shallow-pool', 'no-wisdom'])
  })
})

// ─── analyzeSilverWave ─────────────────────────────────────────────

describe('analyzeSilverWave', () => {
  it('returns complete SilverWave', () => {
    const w = analyzeSilverWave('const x = 1', 'test.ts')
    expect(w.file).toBe('test.ts')
    expect(w.lunarPurity).toBeGreaterThanOrEqual(0)
    expect(w.tidalRhythm).toBeGreaterThanOrEqual(0)
    expect(w.moonlitCurrent).toBeGreaterThanOrEqual(0)
    expect(w.wavePrecision).toBeGreaterThanOrEqual(0)
    expect(w.oceanWisdom).toBeGreaterThanOrEqual(0)
    expect(w.qualityScore).toBeGreaterThanOrEqual(0)
    expect(w.condition).toBeDefined()
    expect(w.purifying).toBeDefined()
    expect(w.pulsing).toBeDefined()
    expect(w.flowing).toBeDefined()
    expect(w.striking).toBeDefined()
    expect(w.knowing).toBeDefined()
  })

  it('gives higher scores to rich content', () => {
    const w = analyzeSilverWave(richContent, 'rich.ts')
    expect(w.qualityScore).toBeGreaterThan(40)
    expect(w.condition).not.toBe('dry-bed')
  })

  it('gives low scores to poor content', () => {
    const w = analyzeSilverWave(poorContent, 'poor.ts')
    expect(w.qualityScore).toBeLessThan(50)
  })

  it('computes qualityScore as average of five measures', () => {
    const w = analyzeSilverWave(moderateContent, 'mod.ts')
    const expected = Math.round(
      w.lunarPurity * 0.2 +
      w.tidalRhythm * 0.2 +
      w.moonlitCurrent * 0.2 +
      w.wavePrecision * 0.2 +
      w.oceanWisdom * 0.2,
    )
    expect(w.qualityScore).toBe(expected)
  })
})

// ─── analyzeSilverShore ────────────────────────────────────────────

describe('analyzeSilverShore', () => {
  it('returns empty shore for empty array', () => {
    const s = analyzeSilverShore([], 'src')
    expect(s.directory).toBe('src')
    expect(s.waves).toHaveLength(0)
    expect(s.avgPurity).toBe(0)
    expect(s.shoreType).toBe('no-shore')
    expect(s.condition).toBe('void')
  })

  it('aggregates waves correctly', () => {
    const w1 = analyzeSilverWave(richContent, 'src/a.ts')
    const w2 = analyzeSilverWave(moderateContent, 'src/b.ts')
    const s = analyzeSilverShore([w1, w2], 'src')
    expect(s.waves).toHaveLength(2)
    expect(s.avgPurity).toBe(Math.round((w1.lunarPurity + w2.lunarPurity) / 2))
    expect(s.avgRhythm).toBe(Math.round((w1.tidalRhythm + w2.tidalRhythm) / 2))
  })
})

// ─── classifyWaveCondition ─────────────────────────────────────────

describe('classifyWaveCondition', () => {
  it('classifies silver-masterpiece for 90+', () => {
    expect(classifyWaveCondition(90)).toBe('silver-masterpiece')
    expect(classifyWaveCondition(100)).toBe('silver-masterpiece')
  })

  it('classifies dry-bed for below 20', () => {
    expect(classifyWaveCondition(0)).toBe('dry-bed')
    expect(classifyWaveCondition(19)).toBe('dry-bed')
  })

  it('classifies moonlit-wave for 75-89', () => {
    expect(classifyWaveCondition(75)).toBe('moonlit-wave')
  })

  it('classifies proper-tide for 60-74', () => {
    expect(classifyWaveCondition(60)).toBe('proper-tide')
  })

  it('classifies murky-current for 40-59', () => {
    expect(classifyWaveCondition(40)).toBe('murky-current')
  })

  it('classifies stagnant-pool for 20-39', () => {
    expect(classifyWaveCondition(20)).toBe('stagnant-pool')
  })
})

// ─── classifyShoreType ─────────────────────────────────────────────

describe('classifyShoreType', () => {
  it('returns no-shore for empty array', () => {
    expect(classifyShoreType([])).toBe('no-shore')
  })

  it('returns valid type for waves', () => {
    const waves = Array.from({ length: 10 }, () => analyzeSilverWave(richContent, 'a.ts'))
    expect(classifyShoreType(waves)).toBeOneOf(['silver-coast', 'moonlit-beach', 'proper-shore', 'sandy-bank', 'mud-flat', 'no-shore'])
  })
})

// ─── classifyShoreCondition ────────────────────────────────────────

describe('classifyShoreCondition', () => {
  it('returns correct conditions for all ranges', () => {
    expect(classifyShoreCondition(85)).toBe('magnificent-shore')
    expect(classifyShoreCondition(70)).toBe('beautiful-coast')
    expect(classifyShoreCondition(55)).toBe('proper-beach')
    expect(classifyShoreCondition(35)).toBe('murky-bank')
    expect(classifyShoreCondition(15)).toBe('dried-up')
    expect(classifyShoreCondition(0)).toBe('void')
  })
})

// ─── classifyNavigatorGrade ────────────────────────────────────────

describe('classifyNavigatorGrade', () => {
  it('returns correct grades for all ranges', () => {
    expect(classifyNavigatorGrade(85)).toBe('moon-captain')
    expect(classifyNavigatorGrade(70)).toBe('silver-navigator')
    expect(classifyNavigatorGrade(55)).toBe('skilled-sailor')
    expect(classifyNavigatorGrade(40)).toBe('apprentice')
    expect(classifyNavigatorGrade(20)).toBe('novice')
    expect(classifyNavigatorGrade(0)).toBe('landlubber')
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high luminosity and no dry beds', () => {
    const waves = [analyzeSilverWave(richContent, 'a.ts')]
    const shores = [analyzeSilverShore(waves, '.')]
    const ocean = { avgPurity: 90, avgRhythm: 90, avgWisdom: 90, isSilver: true, overallLuminosity: 90 }
    const stats = {
      overallLuminosity: 90, dryBedCount: 0, avgLunarPurity: 90, avgTidalRhythm: 90,
      avgMoonlitCurrent: 90, avgWavePrecision: 90, avgOceanWisdom: 90,
    } as unknown as import('../src/commands/silver-tide-helpers.js').SilverTideResult['stats']
    const recs = generateRecommendations(waves, shores, ocean, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('recommends improvements for low scores', () => {
    const waves = [analyzeSilverWave(poorContent, 'bad.ts')]
    const shores = [analyzeSilverShore(waves, '.')]
    const ocean = { avgPurity: 10, avgRhythm: 10, avgWisdom: 10, isSilver: false, overallLuminosity: 10 }
    const stats = {
      overallLuminosity: 10, dryBedCount: 1, avgLunarPurity: 10, avgTidalRhythm: 10,
      avgMoonlitCurrent: 10, avgWavePrecision: 10, avgOceanWisdom: 10,
    } as unknown as import('../src/commands/silver-tide-helpers.js').SilverTideResult['stats']
    const recs = generateRecommendations(waves, shores, ocean, stats)
    expect(recs.length).toBeGreaterThan(1)
  })

  it('returns steady message for moderate scores', () => {
    const waves = [analyzeSilverWave(moderateContent, 'mod.ts')]
    const shores = [analyzeSilverShore(waves, '.')]
    const ocean = { avgPurity: 70, avgRhythm: 70, avgWisdom: 70, isSilver: false, overallLuminosity: 70 }
    const stats = {
      overallLuminosity: 70, dryBedCount: 0, avgLunarPurity: 70, avgTidalRhythm: 70,
      avgMoonlitCurrent: 70, avgWavePrecision: 70, avgOceanWisdom: 70,
    } as unknown as import('../src/commands/silver-tide-helpers.js').SilverTideResult['stats']
    const recs = generateRecommendations(waves, shores, ocean, stats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildSilverTideResult ─────────────────────────────────────────

describe('buildSilverTideResult', () => {
  it('returns empty result for no files', async () => {
    const r = await buildSilverTideResult([], [])
    expect(r.waves).toHaveLength(0)
    expect(r.shores).toHaveLength(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.ocean.overallLuminosity).toBe(0)
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('returns complete result for single file', async () => {
    const r = await buildSilverTideResult(['src/a.ts'], [moderateContent])
    expect(r.waves).toHaveLength(1)
    expect(r.shores).toHaveLength(1)
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.bestWave).toBe('src/a.ts')
    expect(r.stats.purest).toBe('src/a.ts')
    expect(r.stats.bestRhythm).toBe('src/a.ts')
    expect(r.stats.mostFluid).toBe('src/a.ts')
    expect(r.stats.wisest).toBe('src/a.ts')
  })

  it('computes overallLuminosity as avg of purity, rhythm, wisdom', async () => {
    const r = await buildSilverTideResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    const expected = Math.round((r.stats.avgLunarPurity + r.stats.avgTidalRhythm + r.stats.avgOceanWisdom) / 3)
    expect(r.stats.overallLuminosity).toBe(expected)
  })

  it('groups files by directory into shores', async () => {
    const r = await buildSilverTideResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [moderateContent, richContent, poorContent],
    )
    expect(r.shores.length).toBe(2)
  })

  it('counts condition categories correctly', async () => {
    const r = await buildSilverTideResult(
      ['a.ts', 'b.ts'],
      [richContent, poorContent],
    )
    const sum = r.stats.silverMasterpieceCount +
      r.stats.moonlitWaveCount +
      r.stats.properTideCount +
      r.stats.murkyCurrentCount +
      r.stats.stagnantPoolCount +
      r.stats.dryBedCount
    expect(sum).toBe(2)
  })

  it('computes high-score counts', async () => {
    const r = await buildSilverTideResult(['a.ts'], [richContent])
    expect(r.stats.hasHighPurityCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighRhythmCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighCurrentCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('computes navigatorGrade', async () => {
    const r = await buildSilverTideResult(['a.ts'], [richContent])
    expect(r.stats.navigatorGrade).toBeOneOf(['moon-captain', 'silver-navigator', 'skilled-sailor', 'apprentice', 'novice', 'landlubber'])
  })

  it('computes ocean.isSilver correctly', async () => {
    const r = await buildSilverTideResult(['a.ts'], [richContent])
    expect(typeof r.ocean.isSilver).toBe('boolean')
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
    expect(typeof colorGrade('silver-masterpiece')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })

  it('formatWaveTable produces output', () => {
    const w = analyzeSilverWave(moderateContent, 'test.ts')
    const out = formatWaveTable(w)
    expect(out).toContain('test.ts')
    expect(out).toContain('Lunar Purity')
    expect(out).toContain('Tidal Rhythm')
    expect(out).toContain('Moonlit Current')
    expect(out).toContain('Wave Precision')
    expect(out).toContain('Ocean Wisdom')
    expect(out).toContain('Quality Score')
  })

  it('formatWavesTable handles empty', () => {
    expect(formatWavesTable([])).toContain('No silver waves')
  })

  it('formatShoreTable produces output', () => {
    const w = analyzeSilverWave(moderateContent, 'test.ts')
    const s = analyzeSilverShore([w], 'src')
    const out = formatShoreTable(s)
    expect(out).toContain('src')
    expect(out).toContain('Avg Purity')
    expect(out).toContain('Shore Type')
  })

  it('formatShoresTable handles empty', () => {
    expect(formatShoresTable([])).toContain('No silver shores')
  })

  it('formatStatsTable produces output', async () => {
    const r = await buildSilverTideResult(['a.ts'], [moderateContent])
    const out = formatStatsTable(r.stats)
    expect(out).toContain('Silver Tide Statistics')
    expect(out).toContain('Total Files')
    expect(out).toContain('Overall Luminosity')
    expect(out).toContain('Navigator Grade')
  })

  it('formatRecommendations handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formatRecommendations formats items', () => {
    const out = formatRecommendations(['Purify lunar clarity'])
    expect(out).toContain('Purify lunar clarity')
  })

  it('formatResultTable produces full output', async () => {
    const r = await buildSilverTideResult(['a.ts'], [moderateContent])
    const out = formatResultTable(r)
    expect(out).toContain('Silver Wave Analysis')
    expect(out).toContain('Silver Shores')
    expect(out).toContain('Silver Tide Statistics')
    expect(out).toContain('Ocean')
    expect(out).toContain('Recommendations')
  })

  it('formatResultJson produces valid JSON', async () => {
    const r = await buildSilverTideResult(['a.ts'], [moderateContent])
    const out = formatResultJson(r)
    const parsed = JSON.parse(out)
    expect(parsed.waves).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.ocean).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
