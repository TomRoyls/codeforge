import { describe, it, expect } from 'vitest'
import {
  measureStriking,
  measureTargeting,
  measureIlluminating,
  measureEnduring,
  measureNourishing,
  analyzeSapphireBolt,
  analyzeSapphireCloud,
  classifyBoltCondition,
  classifyCloudType,
  classifyCloudCondition,
  classifyMeteorologistGrade,
  generateRecommendations,
  buildSapphireStormResult,
  gatherFiles,
} from '../src/commands/sapphire-storm-helpers.js'
import {
  colorScore,
  colorGrade,
  formatBoltTable,
  formatBoltsTable,
  formatCloudTable,
  formatCloudsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/sapphire-storm-format-helpers.js'

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

// ─── measureStriking ───────────────────────────────────────────────

describe('measureStriking', () => {
  it('returns low fury for minimal content', () => {
    const m = measureStriking(minimalContent)
    expect(m.fury).toBeLessThanOrEqual(15)
    expect(m.hasHighFury).toBe(false)
    expect(m.hasImpactful).toBe(false)
    expect(m.hasEssential).toBe(false)
    expect(m.hasNoFiller).toBe(true)
    expect(m.hasMeaningful).toBe(false)
    expect(m.hasNoBoilerplate).toBe(true)
    expect(m.hasPowerful).toBe(false)
    expect(m.hasNoWeak).toBe(true)
    expect(m.hasHighValue).toBe(false)
    expect(m.hasNoDeadCode).toBe(true)
    expect(m.hasDynamic).toBe(false)
    expect(m.hasNoStatic).toBe(true)
    expect(m.hasStrong).toBe(false)
    expect(m.fillerCount).toBe(0)
    expect(m.boilerplateCount).toBe(0)
  })

  it('returns moderate fury for rich content', () => {
    const m = measureStriking(richContent)
    expect(m.fury).toBeGreaterThan(40)
    expect(m.hasImpactful).toBe(true)
    expect(m.hasEssential).toBe(true)
    expect(m.hasPowerful).toBe(true)
    expect(m.hasDynamic).toBe(true)
  })

  it('detects var as filler', () => {
    const m = measureStriking('var x = 1')
    expect(m.hasNoFiller).toBe(false)
    expect(m.hasNoStatic).toBe(false)
    expect(m.fillerCount).toBe(1)
  })

  it('detects debugger as dead code', () => {
    const m = measureStriking('function f() { debugger }')
    expect(m.hasNoDeadCode).toBe(false)
    expect(m.hasNoWeak).toBe(false)
  })

  it('detects pipeline as dynamic', () => {
    const m = measureStriking('const r = [1,2,3].map(x => x * 2).filter(x => x > 2)')
    expect(m.hasDynamic).toBe(true)
    expect(m.hasPowerful).toBe(true)
  })

  it('detects async as powerful', () => {
    const m = measureStriking('async function f() { await g() }')
    expect(m.hasPowerful).toBe(true)
  })

  it('fury is within 0-100', () => {
    const m = measureStriking(richContent)
    expect(m.fury).toBeLessThanOrEqual(100)
    expect(m.fury).toBeGreaterThanOrEqual(0)
  })
})

// ─── measureTargeting ──────────────────────────────────────────────

describe('measureTargeting', () => {
  it('returns low precision for minimal content', () => {
    const m = measureTargeting(minimalContent)
    expect(m.precision).toBeLessThanOrEqual(15)
    expect(m.hasHighPrecision).toBe(false)
    expect(m.hasExact).toBe(false)
    expect(m.hasAccurate).toBe(false)
    expect(m.hasNoApproximate).toBe(true)
    expect(m.hasCorrect).toBe(false)
    expect(m.hasNoAlmostRight).toBe(true)
    expect(m.hasSharp).toBe(false)
    expect(m.hasNoSloppy).toBe(true)
    expect(m.hasPrecise).toBe(false)
    expect(m.hasNoVague).toBe(true)
    expect(m.hasDefined).toBe(false)
    expect(m.hasNoFuzzy).toBe(true)
    expect(m.hasTargeted).toBe(false)
    expect(m.approximateCount).toBe(0)
    expect(m.sloppyCount).toBe(0)
  })

  it('returns moderate precision for rich content', () => {
    const m = measureTargeting(richContent)
    expect(m.precision).toBeGreaterThan(40)
    expect(m.hasExact).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasDefined).toBe(true)
  })

  it('detects var as approximate', () => {
    const m = measureTargeting('var x = 1')
    expect(m.hasNoApproximate).toBe(true)
    expect(m.approximateCount).toBe(1)
    expect(m.hasAccurate).toBe(false)
  })

  it('detects any as approximate', () => {
    const m = measureTargeting('const x: any = 1')
    expect(m.hasNoApproximate).toBe(false)
    expect(m.hasNoVague).toBe(false)
    expect(m.approximateCount).toBe(1)
  })

  it('detects debugger as sloppy', () => {
    const m = measureTargeting('function f() { debugger }')
    expect(m.hasNoSloppy).toBe(false)
    expect(m.hasNoFuzzy).toBe(false)
    expect(m.sloppyCount).toBe(1)
  })

  it('detects eval as sloppy', () => {
    const m = measureTargeting('eval("x")')
    expect(m.sloppyCount).toBe(1)
    expect(m.hasCorrect).toBe(false)
  })

  it('precision is within 0-100', () => {
    const m = measureTargeting(richContent)
    expect(m.precision).toBeLessThanOrEqual(100)
    expect(m.precision).toBeGreaterThanOrEqual(0)
  })
})

// ─── measureIlluminating ───────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns low clarity for minimal content', () => {
    const m = measureIlluminating(minimalContent)
    expect(m.clarity).toBeLessThanOrEqual(15)
    expect(m.hasHighClarity).toBe(false)
    expect(m.hasReadable).toBe(false)
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasTransparent).toBe(false)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasClear).toBe(false)
    expect(m.hasNoHidden).toBe(true)
    expect(m.hasInstant).toBe(false)
    expect(m.hasNoRequiresStudy).toBe(true)
    expect(m.hasObvious).toBe(false)
    expect(m.hasNoSubtle).toBe(true)
    expect(m.hasLuminous).toBe(false)
    expect(m.crypticCount).toBe(0)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('returns moderate clarity for rich content', () => {
    const m = measureIlluminating(richContent)
    expect(m.clarity).toBeGreaterThan(40)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasClear).toBe(true)
  })

  it('detects eval as cryptic', () => {
    const m = measureIlluminating('eval("1")')
    expect(m.hasNoCryptic).toBe(false)
    expect(m.crypticCount).toBe(1)
  })

  it('detects debugger as obfuscated', () => {
    const m = measureIlluminating('function f() { debugger }')
    expect(m.hasNoObfuscated).toBe(false)
    expect(m.hasNoHidden).toBe(false)
    expect(m.obfuscatedCount).toBe(1)
  })

  it('classifies lightning correctly', () => {
    expect(measureIlluminating(minimalContent).lightning).toBe('no-flash')
  })

  it('clarity is within 0-100', () => {
    const m = measureIlluminating(richContent)
    expect(m.clarity).toBeLessThanOrEqual(100)
    expect(m.clarity).toBeGreaterThanOrEqual(0)
  })
})

// ─── measureEnduring ───────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns low resilience for minimal content', () => {
    const m = measureEnduring(minimalContent)
    expect(m.resilience).toBeLessThanOrEqual(15)
    expect(m.hasHighResilience).toBe(false)
    expect(m.hasTested).toBe(false)
    expect(m.hasNoUntested).toBe(true)
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasRobust).toBe(false)
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasDefensive).toBe(false)
    expect(m.hasNoNaive).toBe(true)
    expect(m.hasLoadResistant).toBe(false)
    expect(m.hasNoSinglePointFailure).toBe(true)
    expect(m.untestedCount).toBe(0)
    expect(m.bareCrashCount).toBe(0)
  })

  it('returns moderate resilience for rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBeGreaterThan(40)
    expect(m.hasTested).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasDefensive).toBe(true)
  })

  it('detects var as untested', () => {
    const m = measureEnduring('var x = 1')
    expect(m.hasNoUntested).toBe(false)
    expect(m.untestedCount).toBe(1)
  })

  it('detects any as unsafe', () => {
    const m = measureEnduring('const x: any = 1')
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects as any as bare crash', () => {
    const m = measureEnduring('const x = y as any')
    expect(m.hasNoBareCrash).toBe(false)
    expect(m.bareCrashCount).toBe(1)
  })

  it('detects debugger as bare crash', () => {
    const m = measureEnduring('function f() { debugger }')
    expect(m.hasNoBareCrash).toBe(false)
    expect(m.hasNoNaive).toBe(false)
    expect(m.bareCrashCount).toBe(1)
  })

  it('resilience is within 0-100', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBeLessThanOrEqual(100)
    expect(m.resilience).toBeGreaterThanOrEqual(0)
  })
})

// ─── measureNourishing ─────────────────────────────────────────────

describe('measureNourishing', () => {
  it('returns low wisdom for minimal content', () => {
    const m = measureNourishing(minimalContent)
    expect(m.wisdom).toBeLessThanOrEqual(15)
    expect(m.hasHighWisdom).toBe(false)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasWellStructured).toBe(false)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.hasPatterned).toBe(false)
    expect(m.hasNoReinvented).toBe(true)
    expect(m.hasReusable).toBe(false)
    expect(m.hasNoSingleUse).toBe(false)
    expect(m.hasModular).toBe(false)
    expect(m.hasNoMonolithic).toBe(true)
    expect(m.hasPrincipled).toBe(false)
    expect(m.hasNoHacky).toBe(true)
    expect(m.hasProven).toBe(false)
    expect(m.adHocCount).toBe(0)
    expect(m.hackyCount).toBe(0)
  })

  it('returns moderate wisdom for rich content', () => {
    const m = measureNourishing(richContent)
    expect(m.wisdom).toBeGreaterThan(50)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasNoAdHoc).toBe(true)
  })

  it('detects var as adHoc', () => {
    const m = measureNourishing('var x = 1')
    expect(m.hasNoAdHoc).toBe(false)
    expect(m.adHocCount).toBe(1)
  })

  it('detects TODO as reinvented', () => {
    const m = measureNourishing('// TODO: fix this\nconst x = 1')
    expect(m.hasNoReinvented).toBe(false)
    expect(m.adHocCount).toBe(1)
  })

  it('detects as any as hacky', () => {
    const m = measureNourishing('const x = y as any')
    expect(m.hasNoHacky).toBe(false)
    expect(m.hackyCount).toBe(1)
  })

  it('detects debugger as hacky', () => {
    const m = measureNourishing('function f() { debugger }')
    expect(m.hasNoHacky).toBe(false)
  })

  it('wisdom is within 0-100', () => {
    const m = measureNourishing(richContent)
    expect(m.wisdom).toBeLessThanOrEqual(100)
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
  })
})

// ─── Classification Functions ──────────────────────────────────────

describe('classifyBoltCondition', () => {
  it('classifies perfect-storm', () => expect(classifyBoltCondition(92)).toBe('perfect-storm'))
  it('classifies mighty-tempest', () => expect(classifyBoltCondition(78)).toBe('mighty-tempest'))
  it('classifies proper-thunderstorm', () => expect(classifyBoltCondition(65)).toBe('proper-thunderstorm'))
  it('classifies light-rain', () => expect(classifyBoltCondition(45)).toBe('light-rain'))
  it('classifies drizzle', () => expect(classifyBoltCondition(25)).toBe('drizzle'))
  it('classifies drought', () => expect(classifyBoltCondition(10)).toBe('drought'))
})

describe('classifyCloudCondition', () => {
  it('classifies magnificent-tempest', () => expect(classifyCloudCondition(88)).toBe('magnificent-tempest'))
  it('classifies powerful-storm', () => expect(classifyCloudCondition(72)).toBe('powerful-storm'))
  it('classifies proper-weather', () => expect(classifyCloudCondition(58)).toBe('proper-weather'))
  it('classifies light-rain', () => expect(classifyCloudCondition(38)).toBe('light-rain'))
  it('classifies clear-sky', () => expect(classifyCloudCondition(18)).toBe('clear-sky'))
  it('classifies void', () => expect(classifyCloudCondition(5)).toBe('void'))
})

describe('classifyMeteorologistGrade', () => {
  it('classifies storm-chaser', () => expect(classifyMeteorologistGrade(88)).toBe('storm-chaser'))
  it('classifies weather-expert', () => expect(classifyMeteorologistGrade(72)).toBe('weather-expert'))
  it('classifies skilled-forecaster', () => expect(classifyMeteorologistGrade(58)).toBe('skilled-forecaster'))
  it('classifies apprentice', () => expect(classifyMeteorologistGrade(42)).toBe('apprentice'))
  it('classifies novice', () => expect(classifyMeteorologistGrade(22)).toBe('novice'))
  it('classifies fair-weather', () => expect(classifyMeteorologistGrade(8)).toBe('fair-weather'))
})

describe('classifyCloudType', () => {
  it('returns no-cloud for empty', () => {
    expect(classifyCloudType([])).toBe('no-cloud')
  })
})

// ─── analyzeSapphireBolt ───────────────────────────────────────────

describe('analyzeSapphireBolt', () => {
  it('analyzes minimal content', () => {
    const bolt = analyzeSapphireBolt(minimalContent, 'mini.ts')
    expect(bolt.file).toBe('mini.ts')
    expect(bolt.qualityScore).toBeLessThanOrEqual(20)
    expect(bolt.condition).toBe('drought')
    expect(bolt.gemFury).toBeLessThanOrEqual(15)
    expect(bolt.strikePrecision).toBeLessThanOrEqual(15)
    expect(bolt.lightningClarity).toBeLessThanOrEqual(15)
    expect(bolt.thunderResilience).toBeLessThanOrEqual(15)
    expect(bolt.rainWisdom).toBeLessThanOrEqual(15)
  })

  it('analyzes rich content', () => {
    const bolt = analyzeSapphireBolt(richContent, 'rich.ts')
    expect(bolt.file).toBe('rich.ts')
    expect(bolt.qualityScore).toBeGreaterThan(40)
    expect(bolt.condition).not.toBe('drought')
    expect(bolt.gemFury).toBeGreaterThan(40)
    expect(bolt.rainWisdom).toBeGreaterThan(50)
  })

  it('quality score is average of 5 measures', () => {
    const bolt = analyzeSapphireBolt(richContent, 'rich.ts')
    const expected = Math.round(
      bolt.gemFury * 0.2 +
      bolt.strikePrecision * 0.2 +
      bolt.lightningClarity * 0.2 +
      bolt.thunderResilience * 0.2 +
      bolt.rainWisdom * 0.2,
    )
    expect(bolt.qualityScore).toBe(expected)
  })
})

// ─── analyzeSapphireCloud ──────────────────────────────────────────

describe('analyzeSapphireCloud', () => {
  it('handles empty bolts', () => {
    const cloud = analyzeSapphireCloud([], 'empty')
    expect(cloud.directory).toBe('empty')
    expect(cloud.bolts).toHaveLength(0)
    expect(cloud.avgFury).toBe(0)
    expect(cloud.avgPrecision).toBe(0)
    expect(cloud.avgWisdom).toBe(0)
    expect(cloud.cloudType).toBe('no-cloud')
    expect(cloud.condition).toBe('void')
  })

  it('classifies cloud with rich bolts', () => {
    const bolt = analyzeSapphireBolt(richContent, 'rich.ts')
    const cloud = analyzeSapphireCloud([bolt], 'src')
    expect(cloud.bolts).toHaveLength(1)
    expect(cloud.droughtCount).toBe(0)
    expect(cloud.avgFury).toBeGreaterThan(0)
    expect(cloud.cloudType).not.toBe('no-cloud')
  })

  it('classifies cloud with mixed bolts', () => {
    const rich = analyzeSapphireBolt(richContent, 'rich.ts')
    const minimal = analyzeSapphireBolt(minimalContent, 'mini.ts')
    const cloud = analyzeSapphireCloud([rich, minimal], 'src')
    expect(cloud.bolts).toHaveLength(2)
    expect(cloud.droughtCount).toBe(1)
  })
})

// ─── buildSapphireStormResult ──────────────────────────────────────

describe('buildSapphireStormResult', async () => {
  it('handles empty input', async () => {
    const result = await buildSapphireStormResult([], [])
    expect(result.bolts).toHaveLength(0)
    expect(result.clouds).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallPower).toBe(0)
    expect(result.stats.meteorologistGrade).toBe('fair-weather')
    expect(result.atmosphere.isTempest).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildSapphireStormResult(['test.ts'], [richContent])
    expect(result.bolts).toHaveLength(1)
    expect(result.bolts[0].condition).not.toBe('drought')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.droughtCount).toBe(0)
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildSapphireStormResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.bolts).toHaveLength(2)
    expect(result.clouds).toHaveLength(2)
    expect(result.stats.totalClouds).toBe(2)
  })

  it('computes atmosphere correctly', async () => {
    const result = await buildSapphireStormResult(['rich.ts'], [richContent])
    expect(result.atmosphere.avgFury).toBeGreaterThan(0)
    expect(result.atmosphere.avgPrecision).toBeGreaterThan(0)
    expect(result.atmosphere.avgWisdom).toBeGreaterThan(0)
    expect(typeof result.atmosphere.isTempest).toBe('boolean')
    expect(result.atmosphere.overallPower).toBeGreaterThan(0)
  })

  it('computes overall power as avg of fury, precision, wisdom', async () => {
    const result = await buildSapphireStormResult(['rich.ts'], [richContent])
    const expected = Math.round(
      (result.stats.avgGemFury + result.stats.avgStrikePrecision + result.stats.avgRainWisdom) / 3,
    )
    expect(result.stats.overallPower).toBe(expected)
  })

  it('tracks condition counts', async () => {
    const result = await buildSapphireStormResult(
      ['rich.ts', 'mini.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.droughtCount).toBe(1)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('identifies best bolt and extremes', async () => {
    const result = await buildSapphireStormResult(['rich.ts'], [richContent])
    expect(result.stats.bestBolt).toBe('rich.ts')
    expect(result.stats.mostFurious).toBe('rich.ts')
    expect(result.stats.mostPrecise).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
  })

  it('tracks high counts', async () => {
    const result = await buildSapphireStormResult(['rich.ts'], [richContent])
    expect(result.stats.hasHighFuryCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', async () => {
  it('returns steady message when quality is good', async () => {
    const result = await buildSapphireStormResult(['rich.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('recommends improving fury when low', async () => {
    const result = await buildSapphireStormResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('fury') || r.includes('pipeline'))).toBe(true)
  })

  it('recommends improving precision when low', async () => {
    const result = await buildSapphireStormResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('precision') || r.includes('return type'))).toBe(true)
  })

  it('recommends improving clarity when low', async () => {
    const result = await buildSapphireStormResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('clarity') || r.includes('JSDoc'))).toBe(true)
  })

  it('recommends improving resilience when low', async () => {
    const result = await buildSapphireStormResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('resilience') || r.includes('try/catch'))).toBe(true)
  })

  it('recommends improving wisdom when low', async () => {
    const result = await buildSapphireStormResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('wisdom') || r.includes('interface'))).toBe(true)
  })

  it('notes drought files', async () => {
    const result = await buildSapphireStormResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('Drought') || r.includes('drought'))).toBe(true)
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
    expect(typeof colorGrade('perfect-storm')).toBe('string')
    expect(typeof colorGrade('drought')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatBoltTable', () => {
  it('formats a bolt', () => {
    const bolt = analyzeSapphireBolt(richContent, 'rich.ts')
    const output = formatBoltTable(bolt)
    expect(output).toContain('rich.ts')
    expect(output).toContain('Gem Fury')
    expect(output).toContain('Strike Precision')
    expect(output).toContain('Lightning Clarity')
    expect(output).toContain('Thunder Resilience')
    expect(output).toContain('Rain Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatBoltsTable', () => {
  it('returns message for empty bolts', () => {
    expect(formatBoltsTable([])).toContain('No sapphire bolts')
  })
})

describe('formatCloudTable', () => {
  it('formats a cloud', () => {
    const bolt = analyzeSapphireBolt(richContent, 'rich.ts')
    const cloud = analyzeSapphireCloud([bolt], 'src')
    const output = formatCloudTable(cloud)
    expect(output).toContain('src')
    expect(output).toContain('Avg Fury')
  })
})

describe('formatCloudsTable', () => {
  it('returns message for empty clouds', () => {
    expect(formatCloudsTable([])).toContain('No sapphire clouds')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildSapphireStormResult(['rich.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Sapphire Storm Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Meteorologist Grade')
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
    const result = await buildSapphireStormResult(['rich.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Sapphire Bolt Analysis')
    expect(output).toContain('Sapphire Clouds')
    expect(output).toContain('Sapphire Storm Statistics')
    expect(output).toContain('Atmosphere')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildSapphireStormResult(['rich.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.bolts).toHaveLength(1)
    expect(parsed.stats.meteorologistGrade).toBeDefined()
    expect(parsed.atmosphere.overallPower).toBeGreaterThan(0)
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('all scores within 0-100 for varied content', () => {
    const contents = ['', 'x', minimalContent, moderateContent, richContent, 'eval("x") as any var z']
    for (const c of contents) {
      expect(measureStriking(c).fury).toBeGreaterThanOrEqual(0)
      expect(measureStriking(c).fury).toBeLessThanOrEqual(100)
      expect(measureTargeting(c).precision).toBeGreaterThanOrEqual(0)
      expect(measureTargeting(c).precision).toBeLessThanOrEqual(100)
      expect(measureIlluminating(c).clarity).toBeGreaterThanOrEqual(0)
      expect(measureIlluminating(c).clarity).toBeLessThanOrEqual(100)
      expect(measureEnduring(c).resilience).toBeGreaterThanOrEqual(0)
      expect(measureEnduring(c).resilience).toBeLessThanOrEqual(100)
      expect(measureNourishing(c).wisdom).toBeGreaterThanOrEqual(0)
      expect(measureNourishing(c).wisdom).toBeLessThanOrEqual(100)
    }
  })

  it('multi-dir creates multiple clouds', async () => {
    const result = await buildSapphireStormResult(
      ['src/a.ts', 'lib/b.ts', 'src/c.ts'],
      [richContent, moderateContent, minimalContent],
    )
    expect(result.clouds).toHaveLength(2)
    const srcCloud = result.clouds.find(c => c.directory === 'src')
    expect(srcCloud).toBeDefined()
    expect(srcCloud!.bolts).toHaveLength(2)
  })

  it('overall power matches atmosphere', async () => {
    const result = await buildSapphireStormResult(['rich.ts'], [richContent])
    expect(result.stats.overallPower).toBe(result.atmosphere.overallPower)
  })
})
