import { describe, it, expect } from 'vitest'
import {
  measureForging, measureHammering, measureTempering, measureSparking, measureCooling,
  classifyBladeCondition, classifyWorkshopType, classifySmithGrade, classifyForgeCondition,
  generateRecommendations, analyzeForgedBlade, analyzeForgeWorkshop,
  buildThunderAnvilResult,
} from '../src/commands/thunder-anvil-helpers.js'
import {
  colorScore, colorGrade, formatBladeTable, formatBladesTable,
  formatWorkshopTable, formatWorkshopsTable, formatStatsTable,
  formatRecommendations, formatResultTable, formatResultJson,
} from '../src/commands/thunder-anvil-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const EMPTY = ''

const RICH = [
  '/**',
  ' * Doc comment',
  ' */',
  'export interface Foo<T> { readonly bar: string }',
  'export type Result = string | number',
  'export class MyClass {',
  '  private x: number = 0',
  '}',
  'export const fn = async (): Promise<string> => {',
  '  const a: string = \'hello\'',
  '  if (a === \'test\') { return a }',
  '  return \'world\'',
  '}',
  'import path from \'node:path\'',
].join('\n')

const MINIMAL = 'const x = 1'

const BAD = 'export var x: any = 1; var y: any = 2; debugger;'

// ─── measureForging ─────────────────────────────────────────────────

describe('measureForging', () => {
  it('returns strength=0 and raw-ore for empty content', () => {
    const m = measureForging(EMPTY)
    expect(m.strength).toBe(0)
    expect(m.grade).toBe('raw-ore')
  })

  it('returns strength=100 and master-forged for rich content', () => {
    const m = measureForging(RICH)
    expect(m.strength).toBe(100)
    expect(m.grade).toBe('master-forged')
  })

  it('returns strength=8 for minimal content (only const)', () => {
    expect(measureForging(MINIMAL).strength).toBe(8)
  })

  it('detects weak and flimsy in bad content', () => {
    const m = measureForging(BAD)
    expect(m.weakCount).toBe(2)
    expect(m.flimsyCount).toBe(2)
    expect(m.hasNoWeak).toBe(false)
    expect(m.hasNoFlimsy).toBe(false)
  })

  it('sets hasHighStrength=true for rich content', () => {
    expect(measureForging(RICH).hasHighStrength).toBe(true)
  })

  it('sets hasHighStrength=false for empty content', () => {
    expect(measureForging(EMPTY).hasHighStrength).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureForging(RICH)
    expect(m.hasSolid).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasWellConstructed).toBe(true)
    expect(m.hasDurable).toBe(true)
    expect(m.hasStrong).toBe(true)
    expect(m.hasResilient).toBe(true)
  })

  it('detects eval as fragile', () => {
    expect(measureForging('eval("x")').hasNoFragile).toBe(false)
  })

  it('detects debugger as brittle', () => {
    expect(measureForging('debugger').hasNoBrittle).toBe(false)
  })
})

// ─── measureHammering ───────────────────────────────────────────────

describe('measureHammering', () => {
  it('returns precision=0 and missed-anvil for empty content', () => {
    const m = measureHammering(EMPTY)
    expect(m.precision).toBe(0)
    expect(m.hammer).toBe('missed-anvil')
  })

  it('returns precision=100 and surgical-strike for rich content', () => {
    const m = measureHammering(RICH)
    expect(m.precision).toBe(100)
    expect(m.hammer).toBe('surgical-strike')
  })

  it('returns precision=8 for minimal content (only const)', () => {
    const m = measureHammering(MINIMAL)
    expect(m.precision).toBe(8)
  })

  it('detects imprecise and careless in bad content', () => {
    const m = measureHammering(BAD)
    expect(m.impreciseCount).toBe(2)
    expect(m.carelessCount).toBe(2)
    expect(m.hasNoImprecise).toBe(false)
    expect(m.hasNoCareless).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureHammering(RICH)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasTargeted).toBe(true)
    expect(m.hasFocused).toBe(true)
    expect(m.hasDeliberate).toBe(true)
    expect(m.hasCalibrated).toBe(true)
  })

  it('detects eval as scattered', () => {
    expect(measureHammering('eval("x")').hasNoScattered).toBe(false)
  })

  it('detects debugger as haphazard', () => {
    expect(measureHammering('debugger').hasNoHaphazard).toBe(false)
  })

  it('sets hasHighPrecision=true for rich content', () => {
    expect(measureHammering(RICH).hasHighPrecision).toBe(true)
  })
})

// ─── measureTempering ───────────────────────────────────────────────

describe('measureTempering', () => {
  it('returns quality=0 and untempered for empty content', () => {
    const m = measureTempering(EMPTY)
    expect(m.quality).toBe(0)
    expect(m.temper).toBe('untempered')
  })

  it('returns quality=100 and perfect-temper for rich content', () => {
    const m = measureTempering(RICH)
    expect(m.quality).toBe(100)
    expect(m.temper).toBe('perfect-temper')
  })

  it('returns quality=10 for minimal content (only const)', () => {
    expect(measureTempering(MINIMAL).quality).toBe(10)
  })

  it('detects brittle and rigid in bad content', () => {
    const m = measureTempering(BAD)
    expect(m.brittleCount).toBe(2)
    expect(m.rigidCount).toBe(2)
    expect(m.hasNoBrittle).toBe(false)
    expect(m.hasNoRigid).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureTempering(RICH)
    expect(m.hasBalanced).toBe(true)
    expect(m.hasFlexible).toBe(true)
    expect(m.hasRightHardness).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasProperFlex).toBe(true)
    expect(m.hasSpringy).toBe(true)
  })

  it('detects eval as over-hard', () => {
    expect(measureTempering('eval("x")').hasNoOverHard).toBe(false)
  })

  it('detects debugger as inflexible', () => {
    expect(measureTempering('debugger').hasNoInflexible).toBe(false)
  })

  it('sets hasHighQuality=true for rich content', () => {
    expect(measureTempering(RICH).hasHighQuality).toBe(true)
  })
})

// ─── measureSparking ────────────────────────────────────────────────

describe('measureSparking', () => {
  it('returns generation=0 and cold-metal for empty content', () => {
    const m = measureSparking(EMPTY)
    expect(m.generation).toBe(0)
    expect(m.spark).toBe('cold-metal')
  })

  it('returns generation=100 and fireworks for rich content', () => {
    const m = measureSparking(RICH)
    expect(m.generation).toBe(100)
    expect(m.spark).toBe('fireworks')
  })

  it('returns generation=8 for minimal content (only const)', () => {
    expect(measureSparking(MINIMAL).generation).toBe(8)
  })

  it('detects lifeless and static in bad content', () => {
    const m = measureSparking(BAD)
    expect(m.lifelessCount).toBe(2)
    expect(m.staticCount).toBe(2)
    expect(m.hasNoLifeless).toBe(false)
    expect(m.hasNoStatic).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureSparking(RICH)
    expect(m.hasCreative).toBe(true)
    expect(m.hasEnergetic).toBe(true)
    expect(m.hasDynamic).toBe(true)
    expect(m.hasInnovative).toBe(true)
    expect(m.hasLively).toBe(true)
    expect(m.hasVibrant).toBe(true)
  })

  it('detects eval as derivative', () => {
    expect(measureSparking('eval("x")').hasNoDerivative).toBe(false)
  })

  it('detects debugger as dull', () => {
    expect(measureSparking('debugger').hasNoDull).toBe(false)
  })

  it('sets hasHighGeneration=true for rich content', () => {
    expect(measureSparking(RICH).hasHighGeneration).toBe(true)
  })
})

// ─── measureCooling ─────────────────────────────────────────────────

describe('measureCooling', () => {
  it('returns rate=0 and never-cools for empty content', () => {
    const m = measureCooling(EMPTY)
    expect(m.rate).toBe(0)
    expect(m.cooling).toBe('never-cools')
  })

  it('returns rate=100 and controlled-quench for rich content', () => {
    const m = measureCooling(RICH)
    expect(m.rate).toBe(100)
    expect(m.cooling).toBe('controlled-quench')
  })

  it('returns rate=10 for minimal content (const + returnType none)', () => {
    const m = measureCooling(MINIMAL)
    expect(m.rate).toBe(10)
  })

  it('detects rushed and abrupt in bad content', () => {
    const m = measureCooling(BAD)
    expect(m.rushedCount).toBe(2)
    expect(m.abruptCount).toBe(2)
    expect(m.hasNoRushed).toBe(false)
    expect(m.hasNoAbrupt).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureCooling(RICH)
    expect(m.hasMeasured).toBe(true)
    expect(m.hasControlled).toBe(true)
    expect(m.hasGradual).toBe(true)
    expect(m.hasSteady).toBe(true)
    expect(m.hasPatient).toBe(true)
    expect(m.hasMature).toBe(true)
  })

  it('detects eval as erratic', () => {
    expect(measureCooling('eval("x")').hasNoErratic).toBe(false)
  })

  it('detects debugger as hasty', () => {
    expect(measureCooling('debugger').hasNoHasty).toBe(false)
  })

  it('sets hasHighRate=true for rich content', () => {
    expect(measureCooling(RICH).hasHighRate).toBe(true)
  })
})

// ─── classifyBladeCondition ─────────────────────────────────────────

describe('classifyBladeCondition', () => {
  it('returns legendary-blade for score >= 85', () => {
    expect(classifyBladeCondition(90)).toBe('legendary-blade')
    expect(classifyBladeCondition(85)).toBe('legendary-blade')
  })

  it('returns master-sword for score 70-84', () => {
    expect(classifyBladeCondition(70)).toBe('master-sword')
    expect(classifyBladeCondition(84)).toBe('master-sword')
  })

  it('returns proper-weapon for score 55-69', () => {
    expect(classifyBladeCondition(55)).toBe('proper-weapon')
    expect(classifyBladeCondition(69)).toBe('proper-weapon')
  })

  it('returns dull-blade for score 40-54', () => {
    expect(classifyBladeCondition(40)).toBe('dull-blade')
    expect(classifyBladeCondition(54)).toBe('dull-blade')
  })

  it('returns bent-nail for score 25-39', () => {
    expect(classifyBladeCondition(25)).toBe('bent-nail')
    expect(classifyBladeCondition(39)).toBe('bent-nail')
  })

  it('returns scrap-metal for score < 25', () => {
    expect(classifyBladeCondition(0)).toBe('scrap-metal')
    expect(classifyBladeCondition(24)).toBe('scrap-metal')
  })
})

// ─── classifyWorkshopType ───────────────────────────────────────────

describe('classifyWorkshopType', () => {
  it('returns no-forge for empty blades', () => {
    expect(classifyWorkshopType([])).toBe('no-forge')
  })

  it('returns master-forge for high avg and 50%+ legendary', () => {
    const blades = [
      { qualityScore: 90, condition: 'legendary-blade' } as ForgedBlade,
      { qualityScore: 80, condition: 'legendary-blade' } as ForgedBlade,
    ]
    expect(classifyWorkshopType(blades)).toBe('master-forge')
  })

  it('returns proper-foundry for avg >= 60 but not master-forge', () => {
    const blades = [
      { qualityScore: 65, condition: 'master-sword' } as ForgedBlade,
      { qualityScore: 60, condition: 'master-sword' } as ForgedBlade,
    ]
    expect(classifyWorkshopType(blades)).toBe('proper-foundry')
  })

  it('returns village-smithy for avg >= 45', () => {
    const blades = [
      { qualityScore: 50, condition: 'proper-weapon' } as ForgedBlade,
    ]
    expect(classifyWorkshopType(blades)).toBe('village-smithy')
  })

  it('returns backyard-anvil for avg >= 30', () => {
    const blades = [
      { qualityScore: 35, condition: 'dull-blade' } as ForgedBlade,
    ]
    expect(classifyWorkshopType(blades)).toBe('backyard-anvil')
  })

  it('returns campfire for avg >= 15', () => {
    const blades = [
      { qualityScore: 20, condition: 'bent-nail' } as ForgedBlade,
    ]
    expect(classifyWorkshopType(blades)).toBe('campfire')
  })

  it('returns no-forge for avg < 15', () => {
    const blades = [
      { qualityScore: 10, condition: 'scrap-metal' } as ForgedBlade,
    ]
    expect(classifyWorkshopType(blades)).toBe('no-forge')
  })
})

// ─── classifySmithGrade ─────────────────────────────────────────────

describe('classifySmithGrade', () => {
  it('returns master-smith for >= 80', () => {
    expect(classifySmithGrade(80)).toBe('master-smith')
    expect(classifySmithGrade(100)).toBe('master-smith')
  })

  it('returns expert-forger for 65-79', () => {
    expect(classifySmithGrade(65)).toBe('expert-forger')
    expect(classifySmithGrade(79)).toBe('expert-forger')
  })

  it('returns skilled-blacksmith for 50-64', () => {
    expect(classifySmithGrade(50)).toBe('skilled-blacksmith')
    expect(classifySmithGrade(64)).toBe('skilled-blacksmith')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifySmithGrade(35)).toBe('apprentice')
    expect(classifySmithGrade(49)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifySmithGrade(20)).toBe('novice')
    expect(classifySmithGrade(34)).toBe('novice')
  })

  it('returns burn-fingers for < 20', () => {
    expect(classifySmithGrade(0)).toBe('burn-fingers')
    expect(classifySmithGrade(19)).toBe('burn-fingers')
  })
})

// ─── classifyForgeCondition ─────────────────────────────────────────

describe('classifyForgeCondition', () => {
  it('returns legendary-forge for >= 75', () => {
    expect(classifyForgeCondition(75)).toBe('legendary-forge')
    expect(classifyForgeCondition(100)).toBe('legendary-forge')
  })

  it('returns hot-fire for 60-74', () => {
    expect(classifyForgeCondition(60)).toBe('hot-fire')
    expect(classifyForgeCondition(74)).toBe('hot-fire')
  })

  it('returns warm-coals for 45-59', () => {
    expect(classifyForgeCondition(45)).toBe('warm-coals')
  })

  it('returns cooling-embers for 30-44', () => {
    expect(classifyForgeCondition(30)).toBe('cooling-embers')
  })

  it('returns cold-hearth for 15-29', () => {
    expect(classifyForgeCondition(15)).toBe('cold-hearth')
  })

  it('returns extinguished for < 15', () => {
    expect(classifyForgeCondition(0)).toBe('extinguished')
  })
})

// ─── analyzeForgedBlade ─────────────────────────────────────────────

describe('analyzeForgedBlade', () => {
  it('returns scrap-metal for empty content', () => {
    const b = analyzeForgedBlade(EMPTY, 'empty.ts')
    expect(b.condition).toBe('scrap-metal')
    expect(b.qualityScore).toBe(0)
    expect(b.file).toBe('empty.ts')
  })

  it('returns legendary-blade for rich content', () => {
    const b = analyzeForgedBlade(RICH, 'rich.ts')
    expect(b.condition).toBe('legendary-blade')
    expect(b.qualityScore).toBe(100)
    expect(b.forgingStrength).toBe(100)
    expect(b.hammerPrecision).toBe(100)
    expect(b.temperQuality).toBe(100)
    expect(b.sparkGeneration).toBe(100)
    expect(b.coolingRate).toBe(100)
  })

  it('computes qualityScore as average of 5 measures', () => {
    const b = analyzeForgedBlade(MINIMAL, 'min.ts')
    const expected = Math.round(
      b.forging.strength * 0.2 +
      b.hammering.precision * 0.2 +
      b.tempering.quality * 0.2 +
      b.sparking.generation * 0.2 +
      b.cooling.rate * 0.2,
    )
    expect(b.qualityScore).toBe(expected)
  })

  it('includes all sub-measurements', () => {
    const b = analyzeForgedBlade(RICH, 'full.ts')
    expect(b.forging).toBeDefined()
    expect(b.hammering).toBeDefined()
    expect(b.tempering).toBeDefined()
    expect(b.sparking).toBeDefined()
    expect(b.cooling).toBeDefined()
  })
})

// ─── analyzeForgeWorkshop ───────────────────────────────────────────

describe('analyzeForgeWorkshop', () => {
  it('returns empty workshop for no blades', () => {
    const w = analyzeForgeWorkshop([], 'empty-dir')
    expect(w.workshopType).toBe('no-forge')
    expect(w.condition).toBe('extinguished')
    expect(w.avgStrength).toBe(0)
    expect(w.avgPrecision).toBe(0)
    expect(w.avgTemper).toBe(0)
    expect(w.legendaryBladeCount).toBe(0)
    expect(w.scrapMetalCount).toBe(0)
  })

  it('computes averages from blades', () => {
    const blades = [
      analyzeForgedBlade(RICH, 'a.ts'),
      analyzeForgedBlade(RICH, 'b.ts'),
    ]
    const w = analyzeForgeWorkshop(blades, 'src')
    expect(w.avgStrength).toBe(100)
    expect(w.avgPrecision).toBe(100)
    expect(w.avgTemper).toBe(100)
    expect(w.legendaryBladeCount).toBe(2)
    expect(w.scrapMetalCount).toBe(0)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns success message for perfect results', () => {
    const b = analyzeForgedBlade(RICH, 'perfect.ts')
    const blades = [b]
    const workshop = analyzeForgeWorkshop(blades, 'src')
    const forge = { avgStrength: 100, avgPrecision: 100, avgTemper: 100, isForging: true, overallCraftsmanship: 100 }
    const stats = {
      avgForgingStrength: 100, avgHammerPrecision: 100, avgTemperQuality: 100,
      avgSparkGeneration: 100, avgCoolingRate: 100, scrapMetalCount: 0,
    } as any
    const recs = generateRecommendations(blades, [workshop], forge, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('mastery')
  })

  it('recommends improving forging strength when low', () => {
    const b = analyzeForgedBlade(EMPTY, 'bad.ts')
    const blades = [b]
    const workshop = analyzeForgeWorkshop(blades, 'src')
    const forge = { avgStrength: 0, avgPrecision: 0, avgTemper: 0, isForging: false, overallCraftsmanship: 0 }
    const stats = {
      avgForgingStrength: 0, avgHammerPrecision: 0, avgTemperQuality: 0,
      avgSparkGeneration: 0, avgCoolingRate: 0, scrapMetalCount: 1,
    } as any
    const recs = generateRecommendations(blades, [workshop], forge, stats)
    expect(recs.length).toBeGreaterThan(1)
    expect(recs.some(r => r.includes('forging'))).toBe(true)
  })

  it('warns about scrap metal', () => {
    const b = analyzeForgedBlade(EMPTY, 'bad.ts')
    const blades = [b]
    const workshop = analyzeForgeWorkshop(blades, 'src')
    const forge = { avgStrength: 0, avgPrecision: 0, avgTemper: 0, isForging: false, overallCraftsmanship: 0 }
    const stats = {
      avgForgingStrength: 0, avgHammerPrecision: 0, avgTemperQuality: 0,
      avgSparkGeneration: 0, avgCoolingRate: 0, scrapMetalCount: 1,
    } as any
    const recs = generateRecommendations(blades, [workshop], forge, stats)
    expect(recs.some(r => r.includes('scrap metal'))).toBe(true)
  })

  it('lists specific scrap-metal files when 3 or fewer', () => {
    const b1 = analyzeForgedBlade(EMPTY, 'a.ts')
    const b2 = analyzeForgedBlade(EMPTY, 'b.ts')
    const blades = [b1, b2]
    const workshop = analyzeForgeWorkshop(blades, 'src')
    const forge = { avgStrength: 0, avgPrecision: 0, avgTemper: 0, isForging: false, overallCraftsmanship: 0 }
    const stats = {
      avgForgingStrength: 0, avgHammerPrecision: 0, avgTemperQuality: 0,
      avgSparkGeneration: 0, avgCoolingRate: 0, scrapMetalCount: 2,
    } as any
    const recs = generateRecommendations(blades, [workshop], forge, stats)
    expect(recs.some(r => r.includes('a.ts') && r.includes('b.ts'))).toBe(true)
  })
})

// ─── buildThunderAnvilResult ────────────────────────────────────────

describe('buildThunderAnvilResult', () => {
  it('handles empty input', async () => {
    const result = await buildThunderAnvilResult([], [])
    expect(result.blades).toHaveLength(0)
    expect(result.workshops).toHaveLength(0)
    expect(result.forge.overallCraftsmanship).toBe(0)
    expect(result.forge.isForging).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.smithGrade).toBe('burn-fingers')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles single file', async () => {
    const result = await buildThunderAnvilResult(['test.ts'], [RICH])
    expect(result.blades).toHaveLength(1)
    expect(result.workshops).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgForgingStrength).toBe(100)
    expect(result.stats.bestBlade).toBe('test.ts')
    expect(result.stats.strongest).toBe('test.ts')
    expect(result.stats.mostPrecise).toBe('test.ts')
    expect(result.stats.bestTempered).toBe('test.ts')
    expect(result.stats.mostCreative).toBe('test.ts')
  })

  it('handles multiple files in same directory', async () => {
    const result = await buildThunderAnvilResult(
      ['src/a.ts', 'src/b.ts'],
      [RICH, RICH],
    )
    expect(result.blades).toHaveLength(2)
    expect(result.workshops).toHaveLength(1)
    expect(result.workshops[0].directory).toBe('src')
    expect(result.workshops[0].blades).toHaveLength(2)
  })

  it('handles multiple directories', async () => {
    const result = await buildThunderAnvilResult(
      ['src/a.ts', 'lib/b.ts'],
      [RICH, EMPTY],
    )
    expect(result.workshops).toHaveLength(2)
  })

  it('computes forge summary correctly', async () => {
    const result = await buildThunderAnvilResult(['test.ts'], [RICH])
    expect(result.forge.avgStrength).toBe(100)
    expect(result.forge.avgPrecision).toBe(100)
    expect(result.forge.avgTemper).toBe(100)
    expect(result.forge.isForging).toBe(true)
    expect(result.forge.overallCraftsmanship).toBe(100)
  })

  it('computes stats correctly', async () => {
    const result = await buildThunderAnvilResult(
      ['rich.ts', 'empty.ts'],
      [RICH, EMPTY],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.legendaryBladeCount).toBe(1)
    expect(result.stats.scrapMetalCount).toBe(1)
    expect(result.stats.hasHighStrengthCount).toBe(1)
    expect(result.stats.hasHighPrecisionCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighGenerationCount).toBe(1)
    expect(result.stats.hasHighRateCount).toBe(1)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for all score tiers', () => {
    expect(typeof colorScore(90)).toBe('string')
    expect(typeof colorScore(65)).toBe('string')
    expect(typeof colorScore(45)).toBe('string')
    expect(typeof colorScore(25)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for known grades', () => {
    expect(typeof colorGrade('legendary-blade')).toBe('string')
    expect(typeof colorGrade('scrap-metal')).toBe('string')
    expect(typeof colorGrade('master-forge')).toBe('string')
    expect(typeof colorGrade('master-smith')).toBe('string')
    expect(typeof colorGrade('burn-fingers')).toBe('string')
  })

  it('returns a string for unknown grades', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatBladeTable', () => {
  it('formats a blade with all fields', () => {
    const b = analyzeForgedBlade(RICH, 'test.ts')
    const output = formatBladeTable(b)
    expect(output).toContain('test.ts')
    expect(output).toContain('Forging Strength')
    expect(output).toContain('Hammer Precision')
    expect(output).toContain('Temper Quality')
    expect(output).toContain('Spark Generation')
    expect(output).toContain('Cooling Rate')
    expect(output).toContain('Score')
  })
})

describe('formatBladesTable', () => {
  it('returns no-blades message for empty array', () => {
    const output = formatBladesTable([])
    expect(output).toContain('No forged blades found')
  })

  it('formats multiple blades', () => {
    const blades = [
      analyzeForgedBlade(RICH, 'a.ts'),
      analyzeForgedBlade(EMPTY, 'b.ts'),
    ]
    const output = formatBladesTable(blades)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
    expect(output).toContain('Thunder Anvil Blade Analysis')
  })
})

describe('formatWorkshopTable', () => {
  it('formats a workshop', () => {
    const blades = [analyzeForgedBlade(RICH, 'a.ts')]
    const workshop = analyzeForgeWorkshop(blades, 'src')
    const output = formatWorkshopTable(workshop)
    expect(output).toContain('src')
    expect(output).toContain('Type')
    expect(output).toContain('Condition')
  })
})

describe('formatWorkshopsTable', () => {
  it('returns no-workshops message for empty array', () => {
    expect(formatWorkshopsTable([])).toContain('No forge workshops found')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', async () => {
    const result = await buildThunderAnvilResult(['test.ts'], [RICH])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Thunder Anvil Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Smith Grade')
    expect(output).toContain('Best Blade')
  })
})

describe('formatRecommendations', () => {
  it('returns no-recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations as bullet list', () => {
    const output = formatRecommendations(['Strengthen forging', 'Fix precision'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Strengthen forging')
    expect(output).toContain('Fix precision')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildThunderAnvilResult(['test.ts'], [RICH])
    const output = formatResultTable(result)
    expect(output).toContain('Thunder Anvil Blade Analysis')
    expect(output).toContain('Forge Workshop Analysis')
    expect(output).toContain('Thunder Anvil Statistics')
    expect(output).toContain('Forge')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildThunderAnvilResult(['test.ts'], [RICH])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.blades).toHaveLength(1)
    expect(parsed.forge.overallCraftsmanship).toBe(100)
  })
})
