import { describe, expect, it } from 'vitest'

import {
  analyzeDeltaRegion,
  analyzeSedimentLayer,
  buildRiverDeltaResult,
  classifyCondition,
  classifyRegionCondition,
  classifyRegionType,
  classifyStewardGrade,
  generateRecommendations,
  measureChannel,
  measureDistributary,
  measureErosion,
  measureFertility,
  measureSediment,
  measureUpstream,
} from '../src/commands/river-delta-helpers.js'

import {
  clarityColor,
  conditionColor,
  currentColor,
  formatRiverDeltaJson,
  formatRiverDeltaTable,
  gradeColor,
  networkColor,
  regionTypeColor,
  richnessColor,
  scoreColor,
  strengthColor,
  zoneColor,
} from '../src/commands/river-delta-format-helpers.js'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const RICH_CONTENT = `
export interface Foo { x: number }
export type Bar = Foo | null
export class Baz implements Foo {
  private x: number = 0
  constructor(x: number) { this.x = x }
  /** Docs */
  async getValue(): Promise<number> {
    try { return this.x } catch { return 0 }
  }
}
export function add<T>(a: T, b: T): T { return a }
export const mul = (a: number, b: number) => a * b
export enum Color { Red, Green, Blue }
export { Foo } from './foo'
// TODO: fix later
`

const EMPTY_CONTENT = ''

const MEDIUM_CONTENT = 'const x = 1\n'

// ─── measureUpstream ──────────────────────────────────────────────────────────

describe('measureUpstream', () => {
  it('returns high force for rich content', () => {
    const result = measureUpstream(RICH_CONTENT)
    expect(result.force).toBe(95)
    expect(result.current).toBe('torrent')
    expect(result.hasHighForce).toBe(true)
    expect(result.hasHeadwater).toBe(true)
    expect(result.hasSteadyFlow).toBe(true)
    expect(result.hasNoFlooding).toBe(true)
    expect(result.hasProperGradient).toBe(true)
    expect(result.hasNoDrought).toBe(true)
    expect(result.hasKinetic).toBe(true)
    expect(result.hasNoWhirlpool).toBe(true)
    expect(result.hasCleanSource).toBe(true)
    expect(result.hasNoContamination).toBe(true)
    expect(result.floodingCount).toBe(0)
    expect(result.whirlpoolCount).toBe(0)
  })

  it('returns low force for empty content', () => {
    const result = measureUpstream(EMPTY_CONTENT)
    expect(result.force).toBe(30)
    expect(result.current).toBe('stagnant')
    expect(result.hasHighForce).toBe(false)
    expect(result.hasNoFlooding).toBe(true)
    expect(result.hasNoWhirlpool).toBe(true)
  })

  it('returns stagnant for medium content', () => {
    const result = measureUpstream(MEDIUM_CONTENT)
    expect(result.force).toBe(30)
    expect(result.current).toBe('stagnant')
  })
})

// ─── measureChannel ───────────────────────────────────────────────────────────

describe('measureChannel', () => {
  it('returns high clarity for rich content', () => {
    const result = measureChannel(RICH_CONTENT)
    expect(result.clarity).toBe(92)
    expect(result.state).toBe('crystal')
    expect(result.hasHighClarity).toBe(true)
    expect(result.hasDirectPath).toBe(true)
    expect(result.hasNoMeandering).toBe(true)
    expect(result.hasProperWidth).toBe(true)
    expect(result.hasNoBlockage).toBe(true)
    expect(result.hasSmoothFlow).toBe(true)
    expect(result.hasNoEddies).toBe(true)
    expect(result.hasProperDepth).toBe(true)
    expect(result.hasNoUndercurrent).toBe(true)
    expect(result.blockageCount).toBe(0)
    expect(result.eddyCount).toBe(0)
  })

  it('returns low clarity for empty content', () => {
    const result = measureChannel(EMPTY_CONTENT)
    expect(result.clarity).toBe(38)
    expect(result.state).toBe('muddy')
    expect(result.hasHighClarity).toBe(false)
  })

  it('returns muddy for medium content', () => {
    const result = measureChannel(MEDIUM_CONTENT)
    expect(result.clarity).toBe(38)
    expect(result.state).toBe('muddy')
  })
})

// ─── measureSediment ──────────────────────────────────────────────────────────

describe('measureSediment', () => {
  it('returns high richness for rich content', () => {
    const result = measureSediment(RICH_CONTENT)
    expect(result.richness).toBe(90)
    expect(result.quality).toBe('sand')
    expect(result.hasRichSediment).toBe(true)
    expect(result.hasAlluvial).toBe(true)
    expect(result.hasProperStrata).toBe(true)
    expect(result.hasNoContamination).toBe(false)
    expect(result.hasNutrientRich).toBe(true)
    expect(result.hasNoToxins).toBe(false)
    expect(result.hasNoErosion).toBe(true)
    expect(result.hasFertileGround).toBe(true)
    expect(result.hasNoSalinization).toBe(true)
    expect(result.toxinCount).toBe(1)
    expect(result.erosionCount).toBe(0)
  })

  it('returns low richness for empty content', () => {
    const result = measureSediment(EMPTY_CONTENT)
    expect(result.richness).toBe(40)
    expect(result.quality).toBe('clay')
    expect(result.hasRichSediment).toBe(false)
    expect(result.hasNoContamination).toBe(true)
    expect(result.hasNoToxins).toBe(true)
  })

  it('returns clay for medium content', () => {
    const result = measureSediment(MEDIUM_CONTENT)
    expect(result.richness).toBe(40)
    expect(result.quality).toBe('clay')
  })
})

// ─── measureDistributary ──────────────────────────────────────────────────────

describe('measureDistributary', () => {
  it('returns high reach for rich content', () => {
    const result = measureDistributary(RICH_CONTENT)
    expect(result.reach).toBe(90)
    expect(result.network).toBe('large-delta')
    expect(result.hasHighReach).toBe(true)
    expect(result.hasProperChannels).toBe(true)
    expect(result.hasNoBottleneck).toBe(true)
    expect(result.hasEvenFlow).toBe(true)
    expect(result.hasProperBranching).toBe(true)
    expect(result.hasNoConfluence).toBe(true)
    expect(result.hasWideReach).toBe(true)
    expect(result.bottleneckCount).toBe(0)
    expect(result.deadChannelCount).toBe(1)
  })

  it('returns low reach for empty content', () => {
    const result = measureDistributary(EMPTY_CONTENT)
    expect(result.reach).toBe(40)
    expect(result.network).toBe('creek')
    expect(result.hasHighReach).toBe(false)
  })

  it('returns creek for medium content', () => {
    const result = measureDistributary(MEDIUM_CONTENT)
    expect(result.reach).toBe(40)
    expect(result.network).toBe('creek')
  })
})

// ─── measureFertility ─────────────────────────────────────────────────────────

describe('measureFertility', () => {
  it('returns high fertility for rich content', () => {
    const result = measureFertility(RICH_CONTENT)
    expect(result.level).toBe(90)
    expect(result.zone).toBe('meadow')
    expect(result.hasHighFertility).toBe(true)
    expect(result.hasYield).toBe(true)
    expect(result.hasProperCropping).toBe(true)
    expect(result.hasNoDepletion).toBe(false)
    expect(result.hasAbundant).toBe(true)
    expect(result.hasNoOveruse).toBe(true)
    expect(result.hasRegenerative).toBe(true)
    expect(result.hasNoMonoculture).toBe(true)
    expect(result.hasSustainable).toBe(true)
    expect(result.hasNoExhaustion).toBe(true)
    expect(result.depletionCount).toBe(1)
    expect(result.monocultureCount).toBe(0)
  })

  it('returns low fertility for empty content', () => {
    const result = measureFertility(EMPTY_CONTENT)
    expect(result.level).toBe(40)
    expect(result.zone).toBe('desert')
    expect(result.hasHighFertility).toBe(false)
  })

  it('returns desert for medium content', () => {
    const result = measureFertility(MEDIUM_CONTENT)
    expect(result.level).toBe(40)
    expect(result.zone).toBe('desert')
  })
})

// ─── measureErosion ───────────────────────────────────────────────────────────

describe('measureErosion', () => {
  it('returns high resistance for rich content', () => {
    const result = measureErosion(RICH_CONTENT)
    expect(result.resistance).toBe(90)
    expect(result.strength).toBe('sandstone')
    expect(result.hasHighResistance).toBe(true)
    expect(result.hasSolidBank).toBe(true)
    expect(result.hasNoUndercutting).toBe(true)
    expect(result.hasProperReinforcement).toBe(true)
    expect(result.hasVegetation).toBe(true)
    expect(result.hasNoLandslide).toBe(false)
    expect(result.hasStable).toBe(true)
    expect(result.hasNoScouring).toBe(false)
    expect(result.hasArmored).toBe(true)
    expect(result.hasNoBreaching).toBe(true)
    expect(result.landslideCount).toBe(1)
    expect(result.scouringCount).toBe(1)
  })

  it('returns low resistance for empty content', () => {
    const result = measureErosion(EMPTY_CONTENT)
    expect(result.resistance).toBe(40)
    expect(result.strength).toBe('loose-soil')
    expect(result.hasHighResistance).toBe(false)
  })

  it('returns loose-soil for medium content', () => {
    const result = measureErosion(MEDIUM_CONTENT)
    expect(result.resistance).toBe(40)
    expect(result.strength).toBe('loose-soil')
  })
})

// ─── analyzeSedimentLayer ─────────────────────────────────────────────────────

describe('analyzeSedimentLayer', () => {
  it('returns fertile-estuary for rich content', () => {
    const result = analyzeSedimentLayer(RICH_CONTENT, 'rich.ts')
    expect(result.upstreamForce).toBe(95)
    expect(result.channelClarity).toBe(92)
    expect(result.sedimentRichness).toBe(90)
    expect(result.distributaryReach).toBe(90)
    expect(result.deltaFertility).toBe(90)
    expect(result.erosionResistance).toBe(90)
    expect(result.qualityScore).toBe(91)
    expect(result.condition).toBe('fertile-estuary')
    expect(result.file).toBe('rich.ts')
  })

  it('returns eroding for empty content', () => {
    const result = analyzeSedimentLayer(EMPTY_CONTENT, 'empty.ts')
    expect(result.upstreamForce).toBe(30)
    expect(result.channelClarity).toBe(38)
    expect(result.sedimentRichness).toBe(40)
    expect(result.distributaryReach).toBe(40)
    expect(result.deltaFertility).toBe(40)
    expect(result.erosionResistance).toBe(40)
    expect(result.qualityScore).toBe(38)
    expect(result.condition).toBe('eroding')
  })

  it('returns eroding for medium content', () => {
    const result = analyzeSedimentLayer(MEDIUM_CONTENT, 'medium.ts')
    expect(result.qualityScore).toBe(38)
    expect(result.condition).toBe('eroding')
  })
})

// ─── classifyCondition ────────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies fertile-estuary for 80+', () => {
    expect(classifyCondition({ qualityScore: 80 } as any)).toBe('fertile-estuary')
  })
  it('classifies healthy-delta for 65-79', () => {
    expect(classifyCondition({ qualityScore: 65 } as any)).toBe('healthy-delta')
  })
  it('classifies developing for 50-64', () => {
    expect(classifyCondition({ qualityScore: 50 } as any)).toBe('developing')
  })
  it('classifies eroding for 35-49', () => {
    expect(classifyCondition({ qualityScore: 35 } as any)).toBe('eroding')
  })
  it('classifies barren for 20-34', () => {
    expect(classifyCondition({ qualityScore: 20 } as any)).toBe('barren')
  })
  it('classifies dead-river for <20', () => {
    expect(classifyCondition({ qualityScore: 10 } as any)).toBe('dead-river')
  })
})

// ─── classifyRegionType ──────────────────────────────────────────────────────

describe('classifyRegionType', () => {
  it('returns dry-bed for empty layers', () => {
    expect(classifyRegionType([])).toBe('dry-bed')
  })
  it('returns mega-delta for high avg with fertile count', () => {
    const layers = Array.from({ length: 5 }, () => ({
      qualityScore: 90, condition: 'fertile-estuary',
    }) as any)
    expect(classifyRegionType(layers)).toBe('mega-delta')
  })
  it('returns river-mouth for avg >= 60', () => {
    expect(classifyRegionType([{ qualityScore: 60, condition: 'eroding' } as any])).toBe('river-mouth')
  })
  it('returns estuary for avg >= 45', () => {
    expect(classifyRegionType([{ qualityScore: 45, condition: 'barren' } as any])).toBe('estuary')
  })
  it('returns creek for avg >= 30', () => {
    expect(classifyRegionType([{ qualityScore: 30, condition: 'dead-river' } as any])).toBe('creek')
  })
  it('returns ditch for avg >= 15', () => {
    expect(classifyRegionType([{ qualityScore: 15, condition: 'dead-river' } as any])).toBe('ditch')
  })
  it('returns dry-bed for avg < 15', () => {
    expect(classifyRegionType([{ qualityScore: 5, condition: 'dead-river' } as any])).toBe('dry-bed')
  })
})

// ─── classifyRegionCondition ──────────────────────────────────────────────────

describe('classifyRegionCondition', () => {
  it('classifies lush-wetland for 80+', () => { expect(classifyRegionCondition(80)).toBe('lush-wetland') })
  it('classifies fertile-plain for 65-79', () => { expect(classifyRegionCondition(65)).toBe('fertile-plain') })
  it('classifies developing-marsh for 50-64', () => { expect(classifyRegionCondition(50)).toBe('developing-marsh') })
  it('classifies barren-shore for 35-49', () => { expect(classifyRegionCondition(35)).toBe('barren-shore') })
  it('classifies salt-flat for 20-34', () => { expect(classifyRegionCondition(20)).toBe('salt-flat') })
  it('classifies desert for <20', () => { expect(classifyRegionCondition(10)).toBe('desert') })
})

// ─── classifyStewardGrade ─────────────────────────────────────────────────────

describe('classifyStewardGrade', () => {
  it('returns master-steward for 80+', () => { expect(classifyStewardGrade(80)).toBe('master-steward') })
  it('returns riverkeeper for 65-79', () => { expect(classifyStewardGrade(65)).toBe('riverkeeper') })
  it('returns warden for 50-64', () => { expect(classifyStewardGrade(50)).toBe('warden') })
  it('returns guard for 35-49', () => { expect(classifyStewardGrade(35)).toBe('guard') })
  it('returns watchman for 20-34', () => { expect(classifyStewardGrade(20)).toBe('watchman') })
  it('returns absentee for <20', () => { expect(classifyStewardGrade(10)).toBe('absentee') })
})

// ─── analyzeDeltaRegion ───────────────────────────────────────────────────────

describe('analyzeDeltaRegion', () => {
  it('returns dry-bed for empty layers', () => {
    const result = analyzeDeltaRegion([], 'empty-dir')
    expect(result.directory).toBe('empty-dir')
    expect(result.layers).toEqual([])
    expect(result.avgForce).toBe(0)
    expect(result.avgClarity).toBe(0)
    expect(result.avgFertility).toBe(0)
    expect(result.fertileCount).toBe(0)
    expect(result.barrenCount).toBe(0)
    expect(result.highForceCount).toBe(0)
    expect(result.clearCount).toBe(0)
    expect(result.regionType).toBe('dry-bed')
    expect(result.condition).toBe('desert')
  })

  it('analyzes region with layers', () => {
    const l1 = analyzeSedimentLayer(RICH_CONTENT, 'rich.ts')
    const result = analyzeDeltaRegion([l1], 'src')
    expect(result.avgForce).toBe(95)
    expect(result.avgClarity).toBe(92)
    expect(result.avgFertility).toBe(90)
    expect(result.fertileCount).toBe(1)
    expect(result.barrenCount).toBe(0)
    expect(result.highForceCount).toBe(1)
    expect(result.clearCount).toBe(1)
  })
})

// ─── buildRiverDeltaResult ────────────────────────────────────────────────────

describe('buildRiverDeltaResult', () => {
  it('returns empty result for no files', () => {
    const result = buildRiverDeltaResult([], [])
    expect(result.layers).toEqual([])
    expect(result.regions).toEqual([])
    expect(result.basin.overallFertility).toBe(0)
    expect(result.basin.isFertile).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalRegions).toBe(0)
    expect(result.stats.stewardGrade).toBe('absentee')
  })

  it('returns correct stats for rich + medium files', () => {
    const result = buildRiverDeltaResult(
      ['rich.ts', 'medium.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalRegions).toBe(1)
    expect(result.stats.avgUpstreamForce).toBe(63)
    expect(result.stats.avgChannelClarity).toBe(65)
    expect(result.stats.avgSedimentRichness).toBe(65)
    expect(result.stats.avgDistributaryReach).toBe(65)
    expect(result.stats.avgDeltaFertility).toBe(65)
    expect(result.stats.avgErosionResistance).toBe(65)
    expect(result.stats.overallFertility).toBe(65)
    expect(result.stats.stewardGrade).toBe('riverkeeper')
    expect(result.stats.fertileEstuaryCount).toBe(1)
    expect(result.stats.erodingCount).toBe(1)
    expect(result.stats.bestLayer).toBe('rich.ts')
    expect(result.stats.mostForceful).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.richest).toBe('rich.ts')
    expect(result.stats.widestReach).toBe('rich.ts')
    expect(result.stats.mostFertile).toBe('rich.ts')
    expect(result.basin.overallFertility).toBe(65)
    expect(result.basin.isFertile).toBe(true)
  })

  it('returns fertile recommendation for high scores', () => {
    const result = buildRiverDeltaResult(['rich.ts'], [RICH_CONTENT])
    expect(result.recommendations).toContain('Fertile estuary achieved — your code delta teems with life')
  })

  it('computes regions by directory', () => {
    const result = buildRiverDeltaResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.regions.length).toBe(2)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends improving force when low', () => {
    const layers = [analyzeSedimentLayer(EMPTY_CONTENT, 'empty.ts')]
    const regions: any[] = []
    const basin = { avgForce: 30, avgClarity: 50, avgFertility: 50, isFertile: false, overallFertility: 40 }
    const stats = {
      totalFiles: 1, totalRegions: 0, avgUpstreamForce: 30, avgChannelClarity: 50,
      avgSedimentRichness: 50, avgDistributaryReach: 50, avgDeltaFertility: 50, avgErosionResistance: 50,
      fertileEstuaryCount: 0, healthyDeltaCount: 0, developingCount: 0,
      erodingCount: 1, barrenCount: 0, deadRiverCount: 0,
      hasHighForceCount: 0, hasHighClarityCount: 0, hasRichSedimentCount: 0,
      hasHighReachCount: 0, hasHighFertilityCount: 0, hasHighResistanceCount: 0,
      overallFertility: 40, stewardGrade: 'guard' as const,
      bestLayer: 'empty.ts', mostForceful: 'empty.ts', clearest: 'empty.ts',
      richest: 'empty.ts', widestReach: 'empty.ts', mostFertile: 'empty.ts',
    }
    const recs = generateRecommendations(layers, regions, basin, stats)
    expect(recs).toContain('Increase upstream force — build more code momentum')
  })

  it('recommends fertile estuary when all scores are high', () => {
    const result = buildRiverDeltaResult(['rich.ts'], [RICH_CONTENT])
    const recs = generateRecommendations(result.layers, result.regions, result.basin, result.stats)
    expect(recs).toContain('Fertile estuary achieved — your code delta teems with life')
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns green for high score', () => { expect(scoreColor(90)).toContain('90') })
  it('returns yellow for medium score', () => { expect(scoreColor(70)).toContain('70') })
  it('returns orange for low score', () => { expect(scoreColor(45)).toContain('45') })
  it('returns red for very low score', () => { expect(scoreColor(20)).toContain('20') })
})

describe('conditionColor', () => {
  it('colors fertile-estuary', () => { expect(conditionColor('fertile-estuary')).toContain('fertile-estuary') })
  it('colors dead-river', () => { expect(conditionColor('dead-river')).toContain('dead-river') })
  it('passes through unknown', () => { expect(conditionColor('unknown')).toBe('unknown') })
})

describe('gradeColor', () => {
  it('colors master-steward', () => { expect(gradeColor('master-steward')).toContain('master-steward') })
  it('colors absentee', () => { expect(gradeColor('absentee')).toContain('absentee') })
  it('passes through unknown', () => { expect(gradeColor('unknown')).toBe('unknown') })
})

describe('currentColor', () => {
  it('colors torrent', () => { expect(currentColor('torrent')).toContain('torrent') })
  it('colors stagnant', () => { expect(currentColor('stagnant')).toContain('stagnant') })
})

describe('clarityColor', () => {
  it('colors crystal', () => { expect(clarityColor('crystal')).toContain('crystal') })
  it('colors polluted', () => { expect(clarityColor('polluted')).toContain('polluted') })
})

describe('richnessColor', () => {
  it('colors alluvial-gold', () => { expect(richnessColor('alluvial-gold')).toContain('alluvial-gold') })
  it('colors bedrock', () => { expect(richnessColor('bedrock')).toContain('bedrock') })
})

describe('networkColor', () => {
  it('colors mega-delta', () => { expect(networkColor('mega-delta')).toContain('mega-delta') })
  it('colors trickle', () => { expect(networkColor('trickle')).toContain('trickle') })
})

describe('zoneColor', () => {
  it('colors fertile-crescent', () => { expect(zoneColor('fertile-crescent')).toContain('fertile-crescent') })
  it('colors wasteland', () => { expect(zoneColor('wasteland')).toContain('wasteland') })
})

describe('strengthColor', () => {
  it('colors granite', () => { expect(strengthColor('granite')).toContain('granite') })
  it('colors quicksand', () => { expect(strengthColor('quicksand')).toContain('quicksand') })
})

describe('regionTypeColor', () => {
  it('colors mega-delta', () => { expect(regionTypeColor('mega-delta')).toContain('mega-delta') })
  it('colors dry-bed', () => { expect(regionTypeColor('dry-bed')).toContain('dry-bed') })
})

// ─── JSON Formatter ──────────────────────────────────────────────────────────

describe('formatRiverDeltaJson', () => {
  it('returns valid JSON', () => {
    const result = buildRiverDeltaResult([], [])
    const json = formatRiverDeltaJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.layers).toEqual([])
    expect(parsed.basin.overallFertility).toBe(0)
  })
})

// ─── Table Formatter ─────────────────────────────────────────────────────────

describe('formatRiverDeltaTable', () => {
  it('includes River Delta Analysis header', () => {
    const result = buildRiverDeltaResult([], [])
    const table = formatRiverDeltaTable(result, false)
    expect(table).toContain('River Delta Analysis')
  })

  it('includes statistics in table output', () => {
    const result = buildRiverDeltaResult(['rich.ts'], [RICH_CONTENT])
    const table = formatRiverDeltaTable(result, false)
    expect(table).toContain('Total Files')
    expect(table).toContain('Steward Grade')
  })

  it('shows per-file details in verbose mode', () => {
    const result = buildRiverDeltaResult(['rich.ts'], [RICH_CONTENT])
    const table = formatRiverDeltaTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('rich.ts')
  })

  it('includes recommendations', () => {
    const result = buildRiverDeltaResult(['rich.ts'], [RICH_CONTENT])
    const table = formatRiverDeltaTable(result, false)
    expect(table).toContain('Recommendations')
  })
})
