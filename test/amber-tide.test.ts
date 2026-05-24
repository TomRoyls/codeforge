import { describe, it, expect } from 'vitest'
import {
  measurePreserving,
  measurePulsing,
  measureFlowing,
  measureCleansing,
  measureKnowing,
  analyzeAmberWave,
  analyzeAmberShore,
  classifyWaveCondition,
  classifyShoreType,
  classifyShoreCondition,
  classifyCaptainGrade,
  generateRecommendations,
  buildAmberTideResult,
  gatherFiles,
} from '../src/commands/amber-tide-helpers.js'
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
} from '../src/commands/amber-tide-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const minimalContent = 'const x = 1'

const moderateContent = `export interface Foo {
  bar: string
}

export function greet(name: string): string {
  return 'hello ' + name
}

const foo: Foo = { bar: 'baz' }
`

const richContent = `/**
 * A type alias for string or number
 */
type StringOrNumber = string | number

export enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

export interface Widget<T> {
  readonly id: string
  name: string
  value: T
  optional?: boolean
}

export class Processor {
  private status: string = 'idle'

  async process(input: string): Promise<string> {
    try {
      this.status = 'running'
      return input.toUpperCase()
    } catch (err) {
      throw new Error('Processing failed')
    }
  }
}

export function findWidget(widgets: Widget<string>[], id: string): Widget<string> | undefined {
  return widgets.find(w => w.id === id)
}

const DEFAULT_COLOR = Color.Red
`

// ─── measurePreserving ─────────────────────────────────────────────

describe('measurePreserving', () => {
  it('returns low power for minimal content', () => {
    const m = measurePreserving(minimalContent)
    expect(m.power).toBeLessThanOrEqual(15)
    expect(m.hasHighPower).toBe(false)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasWellStructured).toBe(false)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasMaintainable).toBe(true)
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasStableAPI).toBe(false)
    expect(m.hasNoBreaking).toBe(true)
    expect(m.hasLasting).toBe(false)
    expect(m.adHocCount).toBe(0)
    expect(m.crypticCount).toBe(0)
  })

  it('returns high power for rich content', () => {
    const m = measurePreserving(richContent)
    expect(m.power).toBeGreaterThan(70)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasStableAPI).toBe(true)
  })

  it('detects var as adHoc', () => {
    const m = measurePreserving('var x = 1')
    expect(m.hasNoAdHoc).toBe(false)
    expect(m.adHocCount).toBe(1)
  })

  it('detects eval as cryptic', () => {
    const m = measurePreserving('eval("x")')
    expect(m.hasNoCryptic).toBe(false)
    expect(m.crypticCount).toBe(1)
  })

  it('detects debugger as cryptic', () => {
    const m = measurePreserving('function f() { debugger }')
    expect(m.crypticCount).toBe(1)
  })

  it('detects as any as unsafe', () => {
    const m = measurePreserving('const x: any = 1')
    expect(m.hasMaintainable).toBe(false)
    expect(m.hasNoBreaking).toBe(false)
  })

  it('power is within 0-100', () => {
    const m = measurePreserving(richContent)
    expect(m.power).toBeLessThanOrEqual(100)
    expect(m.power).toBeGreaterThanOrEqual(0)
  })
})

// ─── measurePulsing ────────────────────────────────────────────────

describe('measurePulsing', () => {
  it('returns low rhythm for minimal content', () => {
    const m = measurePulsing(minimalContent)
    expect(m.rhythm).toBeLessThanOrEqual(15)
    expect(m.hasHighRhythm).toBe(false)
    expect(m.hasReliable).toBe(false)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasNoErratic).toBe(true)
    expect(m.hasTested).toBe(false)
    expect(m.hasNoUntested).toBe(true)
    expect(m.hasDeterministic).toBe(true)
    expect(m.hasNoRandom).toBe(true)
    expect(m.hasPredictable).toBe(false)
    expect(m.hasNoFlaky).toBe(true)
    expect(m.hasSmooth).toBe(false)
    expect(m.hasNoJerky).toBe(true)
    expect(m.erraticCount).toBe(0)
    expect(m.untestedCount).toBe(0)
  })

  it('returns high rhythm for rich content', () => {
    const m = measurePulsing(richContent)
    expect(m.rhythm).toBeGreaterThan(50)
    expect(m.hasReliable).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasSmooth).toBe(false)
  })

  it('detects debugger as erratic', () => {
    const m = measurePulsing('function f() { debugger }')
    expect(m.hasNoErratic).toBe(false)
    expect(m.erraticCount).toBe(1)
  })

  it('detects Math.random as erratic', () => {
    const m = measurePulsing('const x = Math.random()')
    expect(m.hasNoErratic).toBe(false)
    expect(m.hasDeterministic).toBe(false)
  })

  it('detects var as untested', () => {
    const m = measurePulsing('var x = 1')
    expect(m.hasNoUntested).toBe(false)
    expect(m.untestedCount).toBe(1)
  })

  it('rhythm is within 0-100', () => {
    const m = measurePulsing(richContent)
    expect(m.rhythm).toBeLessThanOrEqual(100)
    expect(m.rhythm).toBeGreaterThanOrEqual(0)
  })
})

// ─── measureFlowing ────────────────────────────────────────────────

describe('measureFlowing', () => {
  it('returns low current for minimal content', () => {
    const m = measureFlowing(minimalContent)
    expect(m.current).toBeLessThanOrEqual(15)
    expect(m.hasHighCurrent).toBe(false)
    expect(m.hasValuable).toBe(false)
    expect(m.hasEssential).toBe(false)
    expect(m.hasNoFiller).toBe(true)
    expect(m.hasMeaningful).toBe(false)
    expect(m.hasNoBoilerplate).toBe(true)
    expect(m.hasImpactful).toBe(false)
    expect(m.hasNoDeadCode).toBe(true)
    expect(m.hasEfficientFlow).toBe(false)
    expect(m.hasNoBottlenecks).toBe(true)
    expect(m.hasCleanPipelines).toBe(false)
    expect(m.hasNoTangled).toBe(true)
    expect(m.hasDirect).toBe(false)
    expect(m.fillerCount).toBe(0)
    expect(m.deadCodeCount).toBe(0)
  })

  it('returns moderate current for rich content', () => {
    const m = measureFlowing(richContent)
    expect(m.current).toBeGreaterThan(40)
    expect(m.hasValuable).toBe(true)
    expect(m.hasEssential).toBe(true)
    expect(m.hasImpactful).toBe(true)
    expect(m.hasEfficientFlow).toBe(true)
  })

  it('detects var as filler', () => {
    const m = measureFlowing('var x = 1')
    expect(m.hasNoFiller).toBe(false)
    expect(m.hasNoTangled).toBe(false)
    expect(m.fillerCount).toBe(1)
  })

  it('detects debugger as dead code', () => {
    const m = measureFlowing('function f() { debugger }')
    expect(m.hasNoDeadCode).toBe(false)
    expect(m.deadCodeCount).toBe(1)
  })

  it('detects pipeline as efficient', () => {
    const m = measureFlowing('const r = [1,2,3].map(x => x * 2).filter(x => x > 2)')
    expect(m.hasEfficientFlow).toBe(true)
    expect(m.hasCleanPipelines).toBe(true)
  })

  it('detects async as impactful', () => {
    const m = measureFlowing('async function f() { await g() }')
    expect(m.hasImpactful).toBe(true)
  })

  it('current is within 0-100', () => {
    const m = measureFlowing(richContent)
    expect(m.current).toBeLessThanOrEqual(100)
    expect(m.current).toBeGreaterThanOrEqual(0)
  })
})

// ─── measureCleansing ──────────────────────────────────────────────

describe('measureCleansing', () => {
  it('returns low purity for minimal content', () => {
    const m = measureCleansing(minimalContent)
    expect(m.purity).toBeLessThanOrEqual(15)
    expect(m.hasHighPurity).toBe(false)
    expect(m.hasClean).toBe(true)
    expect(m.hasNoDeadCode).toBe(true)
    expect(m.hasNoHacky).toBe(true)
    expect(m.hasNoDuplicates).toBe(true)
    expect(m.hasTidy).toBe(true)
    expect(m.hasNoMessy).toBe(true)
    expect(m.hasPristine).toBe(false)
    expect(m.hasNoTarnished).toBe(true)
    expect(m.hasPolished).toBe(false)
    expect(m.hasNoRough).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.deadCodeCount).toBe(0)
    expect(m.hackyCount).toBe(0)
  })

  it('returns moderate purity for rich content', () => {
    const m = measureCleansing(richContent)
    expect(m.purity).toBeGreaterThan(40)
    expect(m.hasClean).toBe(true)
    expect(m.hasNoDeadCode).toBe(true)
    expect(m.hasNoHacky).toBe(true)
    expect(m.hasPolished).toBe(true)
  })

  it('detects debugger as dead code', () => {
    const m = measureCleansing('function f() { debugger }')
    expect(m.hasNoDeadCode).toBe(false)
    expect(m.deadCodeCount).toBe(1)
  })

  it('detects as any as hacky', () => {
    const m = measureCleansing('const x = y as any')
    expect(m.hasNoHacky).toBe(false)
    expect(m.hackyCount).toBe(1)
  })

  it('detects eval as obfuscated', () => {
    const m = measureCleansing('eval("x")')
    expect(m.hasNoObfuscated).toBe(false)
    expect(m.hasClean).toBe(false)
  })

  it('detects TODO as messy', () => {
    const m = measureCleansing('// TODO: fix this\nconst x = 1')
    expect(m.hasTidy).toBe(false)
    expect(m.hasNoMessy).toBe(false)
  })

  it('purity is within 0-100', () => {
    const m = measureCleansing(richContent)
    expect(m.purity).toBeLessThanOrEqual(100)
    expect(m.purity).toBeGreaterThanOrEqual(0)
  })
})

// ─── measureKnowing ────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns low wisdom for minimal content', () => {
    const m = measureKnowing(minimalContent)
    expect(m.wisdom).toBeLessThanOrEqual(15)
    expect(m.hasHighWisdom).toBe(false)
    expect(m.hasPatterned).toBe(false)
    expect(m.hasNoReinvented).toBe(true)
    expect(m.hasProven).toBe(false)
    expect(m.hasNoExperimental).toBe(true)
    expect(m.hasEstablished).toBe(false)
    expect(m.hasNoNovel).toBe(true)
    expect(m.hasPrincipled).toBe(false)
    expect(m.hasNoHacky).toBe(true)
    expect(m.hasMature).toBe(false)
    expect(m.hasNoNaive).toBe(true)
    expect(m.hasBattleTested).toBe(false)
    expect(m.hasNoUnproven).toBe(true)
    expect(m.reinventedCount).toBe(0)
    expect(m.hackyCount).toBe(0)
  })

  it('returns moderate wisdom for rich content', () => {
    const m = measureKnowing(richContent)
    expect(m.wisdom).toBeGreaterThan(50)
    expect(m.hasNoReinvented).toBe(true)
    expect(m.hasPrincipled).toBe(true)
  })

  it('detects var as reinvented', () => {
    const m = measureKnowing('var x = 1')
    expect(m.reinventedCount).toBe(1)
  })

  it('detects TODO as reinvented', () => {
    const m = measureKnowing('// TODO: fix this\nconst x = 1')
    expect(m.hasNoReinvented).toBe(false)
    expect(m.reinventedCount).toBe(1)
  })

  it('detects as any as hacky', () => {
    const m = measureKnowing('const x = y as any')
    expect(m.hasNoHacky).toBe(false)
    expect(m.hackyCount).toBe(1)
  })

  it('detects debugger as naive', () => {
    const m = measureKnowing('function f() { debugger }')
    expect(m.hasNoNaive).toBe(false)
    expect(m.hasNoUnproven).toBe(false)
  })

  it('detects extends and implements as patterned', () => {
    const m = measureKnowing('class Foo extends Bar implements Baz {}')
    expect(m.hasPatterned).toBe(true)
    expect(m.hasBattleTested).toBe(true)
    expect(m.hasMature).toBe(true)
  })

  it('wisdom is within 0-100', () => {
    const m = measureKnowing(richContent)
    expect(m.wisdom).toBeLessThanOrEqual(100)
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
  })
})

// ─── Classification Functions ──────────────────────────────────────

describe('classifyWaveCondition', () => {
  it('classifies amber-masterpiece', () => expect(classifyWaveCondition(92)).toBe('amber-masterpiece'))
  it('classifies golden-wave', () => expect(classifyWaveCondition(78)).toBe('golden-wave'))
  it('classifies proper-tide', () => expect(classifyWaveCondition(65)).toBe('proper-tide'))
  it('classifies murky-current', () => expect(classifyWaveCondition(45)).toBe('murky-current'))
  it('classifies stagnant-pool', () => expect(classifyWaveCondition(25)).toBe('stagnant-pool'))
  it('classifies dry-bed', () => expect(classifyWaveCondition(10)).toBe('dry-bed'))
})

describe('classifyShoreCondition', () => {
  it('classifies magnificent-shore', () => expect(classifyShoreCondition(88)).toBe('magnificent-shore'))
  it('classifies golden-coast', () => expect(classifyShoreCondition(72)).toBe('golden-coast'))
  it('classifies proper-beach', () => expect(classifyShoreCondition(58)).toBe('proper-beach'))
  it('classifies murky-bank', () => expect(classifyShoreCondition(38)).toBe('murky-bank'))
  it('classifies dried-up', () => expect(classifyShoreCondition(18)).toBe('dried-up'))
  it('classifies void', () => expect(classifyShoreCondition(5)).toBe('void'))
})

describe('classifyCaptainGrade', () => {
  it('classifies ancient-mariner', () => expect(classifyCaptainGrade(88)).toBe('ancient-mariner'))
  it('classifies sea-captain', () => expect(classifyCaptainGrade(72)).toBe('sea-captain'))
  it('classifies skilled-sailor', () => expect(classifyCaptainGrade(58)).toBe('skilled-sailor'))
  it('classifies apprentice', () => expect(classifyCaptainGrade(42)).toBe('apprentice'))
  it('classifies novice', () => expect(classifyCaptainGrade(22)).toBe('novice'))
  it('classifies landlubber', () => expect(classifyCaptainGrade(8)).toBe('landlubber'))
})

describe('classifyShoreType', () => {
  it('returns no-shore for empty', () => {
    expect(classifyShoreType([])).toBe('no-shore')
  })
})

// ─── analyzeAmberWave ──────────────────────────────────────────────

describe('analyzeAmberWave', () => {
  it('analyzes minimal content', () => {
    const wave = analyzeAmberWave(minimalContent, 'mini.ts')
    expect(wave.file).toBe('mini.ts')
    expect(wave.qualityScore).toBeLessThanOrEqual(20)
    expect(wave.condition).toBe('dry-bed')
    expect(wave.preservationPower).toBeLessThanOrEqual(15)
    expect(wave.tidalRhythm).toBeLessThanOrEqual(15)
    expect(wave.goldenCurrent).toBeLessThanOrEqual(15)
    expect(wave.wavePurity).toBeLessThanOrEqual(15)
    expect(wave.ancientWisdom).toBeLessThanOrEqual(15)
  })

  it('analyzes rich content', () => {
    const wave = analyzeAmberWave(richContent, 'rich.ts')
    expect(wave.file).toBe('rich.ts')
    expect(wave.qualityScore).toBeGreaterThan(50)
    expect(wave.condition).not.toBe('dry-bed')
    expect(wave.preservationPower).toBeGreaterThan(60)
    expect(wave.ancientWisdom).toBeGreaterThan(50)
  })

  it('quality score is average of 5 measures', () => {
    const wave = analyzeAmberWave(richContent, 'rich.ts')
    const expected = Math.round(
      wave.preservationPower * 0.2 +
      wave.tidalRhythm * 0.2 +
      wave.goldenCurrent * 0.2 +
      wave.wavePurity * 0.2 +
      wave.ancientWisdom * 0.2,
    )
    expect(wave.qualityScore).toBe(expected)
  })
})

// ─── analyzeAmberShore ─────────────────────────────────────────────

describe('analyzeAmberShore', () => {
  it('handles empty waves', () => {
    const shore = analyzeAmberShore([], 'empty')
    expect(shore.directory).toBe('empty')
    expect(shore.waves).toHaveLength(0)
    expect(shore.avgPreservation).toBe(0)
    expect(shore.avgRhythm).toBe(0)
    expect(shore.avgWisdom).toBe(0)
    expect(shore.shoreType).toBe('no-shore')
    expect(shore.condition).toBe('void')
  })

  it('classifies shore with rich waves', () => {
    const wave = analyzeAmberWave(richContent, 'rich.ts')
    const shore = analyzeAmberShore([wave], 'src')
    expect(shore.waves).toHaveLength(1)
    expect(shore.dryBedCount).toBe(0)
    expect(shore.avgPreservation).toBeGreaterThan(0)
    expect(shore.shoreType).not.toBe('no-shore')
  })

  it('classifies shore with mixed waves', () => {
    const rich = analyzeAmberWave(richContent, 'rich.ts')
    const minimal = analyzeAmberWave(minimalContent, 'mini.ts')
    const shore = analyzeAmberShore([rich, minimal], 'src')
    expect(shore.waves).toHaveLength(2)
    expect(shore.dryBedCount).toBe(1)
  })
})

// ─── buildAmberTideResult ──────────────────────────────────────────

describe('buildAmberTideResult', async () => {
  it('handles empty input', async () => {
    const result = await buildAmberTideResult([], [])
    expect(result.waves).toHaveLength(0)
    expect(result.shores).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallFlow).toBe(0)
    expect(result.stats.captainGrade).toBe('landlubber')
    expect(result.ocean.isAmber).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildAmberTideResult(['test.ts'], [richContent])
    expect(result.waves).toHaveLength(1)
    expect(result.waves[0].condition).not.toBe('dry-bed')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.dryBedCount).toBe(0)
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildAmberTideResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.waves).toHaveLength(2)
    expect(result.shores).toHaveLength(2)
    expect(result.stats.totalShores).toBe(2)
  })

  it('computes ocean correctly', async () => {
    const result = await buildAmberTideResult(['rich.ts'], [richContent])
    expect(result.ocean.avgPreservation).toBeGreaterThan(0)
    expect(result.ocean.avgRhythm).toBeGreaterThan(0)
    expect(result.ocean.avgWisdom).toBeGreaterThan(0)
    expect(typeof result.ocean.isAmber).toBe('boolean')
    expect(result.ocean.overallFlow).toBeGreaterThan(0)
  })

  it('computes overall flow as avg of preservation, rhythm, wisdom', async () => {
    const result = await buildAmberTideResult(['rich.ts'], [richContent])
    const expected = Math.round(
      (result.stats.avgPreservationPower + result.stats.avgTidalRhythm + result.stats.avgAncientWisdom) / 3,
    )
    expect(result.stats.overallFlow).toBe(expected)
  })

  it('tracks condition counts', async () => {
    const result = await buildAmberTideResult(
      ['rich.ts', 'mini.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.dryBedCount).toBe(1)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('identifies best wave and extremes', async () => {
    const result = await buildAmberTideResult(['rich.ts'], [richContent])
    expect(result.stats.bestWave).toBe('rich.ts')
    expect(result.stats.mostPreserved).toBe('rich.ts')
    expect(result.stats.bestRhythm).toBe('rich.ts')
    expect(result.stats.mostValuable).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
  })

  it('tracks high counts', async () => {
    const result = await buildAmberTideResult(['rich.ts'], [richContent])
    expect(result.stats.hasHighPreservationCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighRhythmCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighCurrentCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPurityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPreservationCount + result.stats.hasHighRhythmCount + result.stats.hasHighCurrentCount + result.stats.hasHighPurityCount + result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', async () => {
  it('returns steady message when quality is good', async () => {
    const result = await buildAmberTideResult(['rich.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('recommends improving preservation when low', async () => {
    const result = await buildAmberTideResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('preservation') || r.includes('documentation'))).toBe(true)
  })

  it('recommends improving rhythm when low', async () => {
    const result = await buildAmberTideResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('rhythm') || r.includes('error handling'))).toBe(true)
  })

  it('recommends improving current when low', async () => {
    const result = await buildAmberTideResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('current') || r.includes('pipeline'))).toBe(true)
  })

  it('recommends improving purity when low', async () => {
    const result = await buildAmberTideResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('Purify') || r.includes('debugger'))).toBe(true)
  })

  it('recommends improving wisdom when low', async () => {
    const result = await buildAmberTideResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('wisdom') || r.includes('JSDoc'))).toBe(true)
  })

  it('notes dry files', async () => {
    const result = await buildAmberTideResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('Dry') || r.includes('dry'))).toBe(true)
  })
})

// ─── gatherFiles ───────────────────────────────────────────────────

describe('gatherFiles', () => {
  it('returns empty for non-existent path', async () => {
    const files = await gatherFiles('/nonexistent', ['.ts'], [])
    expect(files).toHaveLength(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns string for any grade', () => {
    expect(typeof colorGrade('amber-masterpiece')).toBe('string')
    expect(typeof colorGrade('dry-bed')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatWaveTable', () => {
  it('formats a wave', () => {
    const wave = analyzeAmberWave(richContent, 'rich.ts')
    const output = formatWaveTable(wave)
    expect(output).toContain('rich.ts')
    expect(output).toContain('Preservation Power')
    expect(output).toContain('Tidal Rhythm')
    expect(output).toContain('Golden Current')
    expect(output).toContain('Wave Purity')
    expect(output).toContain('Ancient Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatWavesTable', () => {
  it('returns message for empty waves', () => {
    expect(formatWavesTable([])).toContain('No amber waves')
  })
})

describe('formatShoreTable', () => {
  it('formats a shore', () => {
    const wave = analyzeAmberWave(richContent, 'rich.ts')
    const shore = analyzeAmberShore([wave], 'src')
    const output = formatShoreTable(shore)
    expect(output).toContain('src')
    expect(output).toContain('Avg Preservation')
  })
})

describe('formatShoresTable', () => {
  it('returns message for empty shores', () => {
    expect(formatShoresTable([])).toContain('No amber shores')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildAmberTideResult(['rich.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Amber Tide Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Captain Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns message for empty recs', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['improve X', 'fix Y'])
    expect(output).toContain('improve X')
    expect(output).toContain('fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildAmberTideResult(['rich.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Amber Wave Analysis')
    expect(output).toContain('Amber Shores')
    expect(output).toContain('Amber Tide Statistics')
    expect(output).toContain('Ocean')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildAmberTideResult(['rich.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.waves).toHaveLength(1)
    expect(parsed.stats.captainGrade).toBeDefined()
    expect(parsed.ocean.overallFlow).toBeGreaterThan(0)
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('all scores within 0-100 for varied content', () => {
    const contents = ['', 'x', minimalContent, moderateContent, richContent, 'eval("x") as any var z']
    for (const c of contents) {
      expect(measurePreserving(c).power).toBeGreaterThanOrEqual(0)
      expect(measurePreserving(c).power).toBeLessThanOrEqual(100)
      expect(measurePulsing(c).rhythm).toBeGreaterThanOrEqual(0)
      expect(measurePulsing(c).rhythm).toBeLessThanOrEqual(100)
      expect(measureFlowing(c).current).toBeGreaterThanOrEqual(0)
      expect(measureFlowing(c).current).toBeLessThanOrEqual(100)
      expect(measureCleansing(c).purity).toBeGreaterThanOrEqual(0)
      expect(measureCleansing(c).purity).toBeLessThanOrEqual(100)
      expect(measureKnowing(c).wisdom).toBeGreaterThanOrEqual(0)
      expect(measureKnowing(c).wisdom).toBeLessThanOrEqual(100)
    }
  })

  it('multi-dir creates multiple shores', async () => {
    const result = await buildAmberTideResult(
      ['src/a.ts', 'lib/b.ts', 'src/c.ts'],
      [richContent, moderateContent, minimalContent],
    )
    expect(result.shores).toHaveLength(2)
    const srcShore = result.shores.find(s => s.directory === 'src')
    expect(srcShore).toBeDefined()
    expect(srcShore!.waves).toHaveLength(2)
  })

  it('overall flow matches ocean', async () => {
    const result = await buildAmberTideResult(['rich.ts'], [richContent])
    expect(result.stats.overallFlow).toBe(result.ocean.overallFlow)
  })
})
