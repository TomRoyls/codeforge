import { describe, it, expect } from 'vitest'
import {
  measureWarm,
  measureBurning,
  measureWise,
  measureTending,
  measureSparking,
  measureForging,
  analyzeGlowingEmber,
  analyzeHearthCircle,
  classifyCondition,
  classifyCircleType,
  classifyCircleCondition,
  classifyBlacksmithGrade,
  buildEmberHearthIiResult,
  generateRecommendations,
} from '../src/commands/ember-hearth-ii-helpers.js'
import {
  formatEmberHearthIiJson,
  formatEmberHearthIiTable,
  scoreColor,
  warmHeatColor,
  burningQualityColor,
  wiseKnowledgeColor,
  tendingCareColor,
  sparkingCreativityColor,
  forgingHeatColor,
  emberConditionColor,
  blacksmithGradeColor,
} from '../src/commands/ember-hearth-ii-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `import { chalk } from 'chalk'
import type { Config } from './types.js'

/** Documentation */
export interface RichInterface {
  readonly name: string
  readonly value: number
}

export class RichClass {
  private data: Map<string, RichInterface> = new Map()

  async process(config: Config): Promise<string> {
    try {
      const result: string = await this.transform(config)
      return result ?? 'default'
    } catch (error) {
      return 'error'
    }
  }

  private async transform(input: Config): Promise<string> {
    const output: string = JSON.stringify(input)
    return output
  }
}

export type RichType = RichInterface & { extra: boolean }
export const RICH_VALUE = 42
`

const POOR = `var x = 1
var y: any = 2
var z: any = 3`

const EMPTY = ''

// ─── measureWarm ───────────────────────────────────────────────────────────

describe('measureWarm', () => {
  it('returns white-hot-core for rich content', () => {
    const m = measureWarm(RICH)
    expect(m.deepAccessibility).toBe(98)
    expect(m.heat).toBe('white-hot-core')
    expect(m.hasHighDeepAccessibility).toBe(true)
  })

  it('returns frozen for poor content', () => {
    const m = measureWarm(POOR)
    expect(m.deepAccessibility).toBe(8)
    expect(m.heat).toBe('frozen')
    expect(m.hasHighDeepAccessibility).toBe(false)
    expect(m.intimidationCount).toBe(3)
    expect(m.hostilityCount).toBe(2)
  })

  it('returns frozen for empty with no intimidation', () => {
    const m = measureWarm(EMPTY)
    expect(m.deepAccessibility).toBe(0)
    expect(m.heat).toBe('frozen')
    expect(m.hasNoIntimidation).toBe(true)
    expect(m.hasNoHostility).toBe(true)
  })

  it('detects rich boolean combos', () => {
    const m = measureWarm(RICH)
    expect(m.hasApproachable).toBe(true)
    expect(m.hasDeeplyUsable).toBe(true)
    expect(m.hasWelcoming).toBe(true)
    expect(m.hasGentle).toBe(true)
    expect(m.hasInviting).toBe(false)
  })
})

// ─── measureBurning ────────────────────────────────────────────────────────

describe('measureBurning', () => {
  it('returns complete-combustion for rich content', () => {
    const m = measureBurning(RICH)
    expect(m.efficiency).toBe(88)
    expect(m.quality).toBe('complete-combustion')
    expect(m.hasHighEfficiency).toBe(true)
  })

  it('returns no-fire for poor content', () => {
    const m = measureBurning(POOR)
    expect(m.efficiency).toBe(0)
    expect(m.quality).toBe('no-fire')
    expect(m.wasteCount).toBe(3)
    expect(m.pollutionCount).toBe(2)
  })

  it('returns no-fire for empty with no waste', () => {
    const m = measureBurning(EMPTY)
    expect(m.efficiency).toBe(0)
    expect(m.quality).toBe('no-fire')
    expect(m.hasNoWaste).toBe(true)
    expect(m.hasNoPollution).toBe(true)
  })
})

// ─── measureWise ───────────────────────────────────────────────────────────

describe('measureWise', () => {
  it('returns sage-wisdom for rich content', () => {
    const m = measureWise(RICH)
    expect(m.failureWisdom).toBe(96)
    expect(m.knowledge).toBe('sage-wisdom')
    expect(m.hasHighFailureWisdom).toBe(true)
    expect(m.hasLearnedFromErrors).toBe(true)
  })

  it('returns ignorant for poor content', () => {
    const m = measureWise(POOR)
    expect(m.failureWisdom).toBe(8)
    expect(m.knowledge).toBe('ignorant')
    expect(m.repeatingCount).toBe(3)
    expect(m.sameMistakesCount).toBe(2)
    expect(m.hasNoRepeating).toBe(false)
    expect(m.hasNoNaivety).toBe(false)
  })

  it('returns ignorant for empty with no repeating', () => {
    const m = measureWise(EMPTY)
    expect(m.failureWisdom).toBe(0)
    expect(m.knowledge).toBe('ignorant')
    expect(m.hasNoRepeating).toBe(true)
    expect(m.hasNoSameMistakes).toBe(true)
    expect(m.hasNoFolly).toBe(true)
  })
})

// ─── measureTending ────────────────────────────────────────────────────────

describe('measureTending', () => {
  it('returns master-firekeeper for rich content', () => {
    const m = measureTending(RICH)
    expect(m.maintenance).toBe(100)
    expect(m.care).toBe('master-firekeeper')
    expect(m.hasHighMaintenance).toBe(true)
  })

  it('returns abandoned for poor content', () => {
    const m = measureTending(POOR)
    expect(m.maintenance).toBe(0)
    expect(m.care).toBe('abandoned')
    expect(m.neglectCount).toBe(3)
    expect(m.stalenessCount).toBe(2)
    expect(m.hasNoNeglect).toBe(false)
    expect(m.hasNoRot).toBe(false)
  })

  it('returns abandoned for empty with no neglect', () => {
    const m = measureTending(EMPTY)
    expect(m.maintenance).toBe(0)
    expect(m.care).toBe('abandoned')
    expect(m.hasNoNeglect).toBe(true)
    expect(m.hasNoAbandonment).toBe(true)
    expect(m.hasNoDecay).toBe(true)
  })
})

// ─── measureSparking ───────────────────────────────────────────────────────

describe('measureSparking', () => {
  it('returns fireworks-display for rich content', () => {
    const m = measureSparking(RICH)
    expect(m.innovation).toBe(85)
    expect(m.creativity).toBe('fireworks-display')
    expect(m.hasHighInnovation).toBe(true)
    expect(m.hasInnovative).toBe(true)
  })

  it('returns no-spark for poor content', () => {
    const m = measureSparking(POOR)
    expect(m.innovation).toBe(0)
    expect(m.creativity).toBe('no-spark')
    expect(m.dullnessCount).toBe(3)
    expect(m.copyCount).toBe(2)
    expect(m.hasNoDullness).toBe(false)
    expect(m.hasNoDerivative).toBe(false)
  })

  it('returns no-spark for empty with no dullness', () => {
    const m = measureSparking(EMPTY)
    expect(m.innovation).toBe(0)
    expect(m.creativity).toBe('no-spark')
    expect(m.hasNoDullness).toBe(true)
    expect(m.hasNoCopy).toBe(true)
    expect(m.hasNoGeneric).toBe(true)
  })
})

// ─── measureForging ────────────────────────────────────────────────────────

describe('measureForging', () => {
  it('returns forge-ready for rich content', () => {
    const m = measureForging(RICH)
    expect(m.temperature).toBe(98)
    expect(m.heat).toBe('forge-ready')
    expect(m.hasHighTemperature).toBe(true)
    expect(m.hasTransformative).toBe(true)
  })

  it('returns frozen-solid for poor content', () => {
    const m = measureForging(POOR)
    expect(m.temperature).toBe(0)
    expect(m.heat).toBe('frozen-solid')
    expect(m.rigidityCount).toBe(3)
    expect(m.brittlenessCount).toBe(2)
    expect(m.hasNoRigidity).toBe(false)
    expect(m.hasNoBrittleness).toBe(false)
  })

  it('returns frozen-solid for empty with no rigidity', () => {
    const m = measureForging(EMPTY)
    expect(m.temperature).toBe(0)
    expect(m.heat).toBe('frozen-solid')
    expect(m.hasNoRigidity).toBe(true)
    expect(m.hasNoFixedForm).toBe(true)
    expect(m.hasNoCrystalized).toBe(true)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies forge-furnace for 90+', () => expect(classifyCondition(90)).toBe('forge-furnace'))
  it('classifies glowing-hearth for 70-84', () => expect(classifyCondition(75)).toBe('glowing-hearth'))
  it('classifies steady-fire for 55-69', () => expect(classifyCondition(60)).toBe('steady-fire'))
  it('classifies dying-embers for 40-54', () => expect(classifyCondition(45)).toBe('dying-embers'))
  it('classifies cold-ash-pit for 25-39', () => expect(classifyCondition(30)).toBe('cold-ash-pit'))
  it('classifies extinguished for <25', () => expect(classifyCondition(15)).toBe('extinguished'))
  it('classifies extinguished for 0', () => expect(classifyCondition(0)).toBe('extinguished'))
})

// ─── classifyBlacksmithGrade ───────────────────────────────────────────────

describe('classifyBlacksmithGrade', () => {
  it('classifies master-blacksmith for 80+', () => expect(classifyBlacksmithGrade(90)).toBe('master-blacksmith'))
  it('classifies expert-forger for 65-79', () => expect(classifyBlacksmithGrade(70)).toBe('expert-forger'))
  it('classifies skilled-smith for 50-64', () => expect(classifyBlacksmithGrade(55)).toBe('skilled-smith'))
  it('classifies apprentice for 35-49', () => expect(classifyBlacksmithGrade(40)).toBe('apprentice'))
  it('classifies bellows-boy for 20-34', () => expect(classifyBlacksmithGrade(25)).toBe('bellows-boy'))
  it('classifies cold-hands for <20', () => expect(classifyBlacksmithGrade(10)).toBe('cold-hands'))
})

// ─── classifyCircleCondition ───────────────────────────────────────────────

describe('classifyCircleCondition', () => {
  it('classifies blazing-forge for 75+', () => expect(classifyCircleCondition(80)).toBe('blazing-forge'))
  it('classifies warm-gathering for 60-74', () => expect(classifyCircleCondition(65)).toBe('warm-gathering'))
  it('classifies steady-warmth for 45-59', () => expect(classifyCircleCondition(50)).toBe('steady-warmth'))
  it('classifies cooling-hearth for 30-44', () => expect(classifyCircleCondition(35)).toBe('cooling-hearth'))
  it('classifies dying-fire for 15-29', () => expect(classifyCircleCondition(20)).toBe('dying-fire'))
  it('classifies cold-night for <15', () => expect(classifyCircleCondition(5)).toBe('cold-night'))
})

// ─── classifyCircleType ────────────────────────────────────────────────────

describe('classifyCircleType', () => {
  it('returns cold-ashes for empty', () => expect(classifyCircleType([])).toBe('cold-ashes'))
  it('returns grand-forge for rich', () => {
    const e = analyzeGlowingEmber(RICH, 'a.ts')
    expect(classifyCircleType([e])).toBe('grand-forge')
  })
  it('returns cold-ashes for poor', () => {
    const e = analyzeGlowingEmber(POOR, 'b.ts')
    expect(classifyCircleType([e])).toBe('cold-ashes')
  })
})

// ─── analyzeGlowingEmber ───────────────────────────────────────────────────

describe('analyzeGlowingEmber', () => {
  it('computes correct qualityScore for rich', () => {
    const e = analyzeGlowingEmber(RICH, 'rich.ts')
    expect(e.qualityScore).toBe(95)
    expect(e.condition).toBe('forge-furnace')
    expect(e.warmthDeep).toBe(98)
    expect(e.burnQuality).toBe(88)
    expect(e.ashWisdom).toBe(96)
    expect(e.fireTending).toBe(100)
    expect(e.sparkGeneration).toBe(85)
    expect(e.forgeTemperature).toBe(98)
  })

  it('computes correct qualityScore for poor', () => {
    const e = analyzeGlowingEmber(POOR, 'poor.ts')
    expect(e.qualityScore).toBe(3)
    expect(e.condition).toBe('extinguished')
    expect(e.warmthDeep).toBe(8)
  })

  it('computes correct qualityScore for empty', () => {
    const e = analyzeGlowingEmber(EMPTY, 'empty.ts')
    expect(e.qualityScore).toBe(0)
    expect(e.condition).toBe('extinguished')
  })
})

// ─── analyzeHearthCircle ───────────────────────────────────────────────────

describe('analyzeHearthCircle', () => {
  it('returns cold-ashes for empty embers', () => {
    const c = analyzeHearthCircle([], 'empty-dir')
    expect(c.directory).toBe('empty-dir')
    expect(c.circleType).toBe('cold-ashes')
    expect(c.condition).toBe('cold-night')
    expect(c.avgWarmth).toBe(0)
    expect(c.avgWisdom).toBe(0)
    expect(c.avgInnovation).toBe(0)
  })

  it('computes correct averages for mixed embers', () => {
    const rich = analyzeGlowingEmber(RICH, 'dir/rich.ts')
    const poor = analyzeGlowingEmber(POOR, 'dir/poor.ts')
    const c = analyzeHearthCircle([rich, poor], 'dir')
    expect(c.avgWarmth).toBe(53)
    expect(c.avgWisdom).toBe(52)
    expect(c.avgInnovation).toBe(43)
    expect(c.forgeFurnaceCount).toBe(1)
    expect(c.extinguishedCount).toBe(1)
  })
})

// ─── buildEmberHearthIiResult ──────────────────────────────────────────────

describe('buildEmberHearthIiResult', () => {
  it('returns correct single rich result', () => {
    const r = buildEmberHearthIiResult(['rich.ts'], [RICH])
    expect(r.embers).toHaveLength(1)
    expect(r.embers[0].qualityScore).toBe(95)
    expect(r.circles).toHaveLength(1)
    expect(r.circles[0].circleType).toBe('grand-forge')
    expect(r.circles[0].condition).toBe('blazing-forge')
    expect(r.forge.avgWarmth).toBe(98)
    expect(r.forge.avgWisdom).toBe(96)
    expect(r.forge.avgInnovation).toBe(85)
    expect(r.forge.isHot).toBe(true)
    expect(r.forge.overallHeat).toBe(93)
    expect(r.stats.blacksmithGrade).toBe('master-blacksmith')
    expect(r.stats.bestEmber).toBe('rich.ts')
    expect(r.stats.warmest).toBe('rich.ts')
    expect(r.stats.mostEfficient).toBe('rich.ts')
    expect(r.stats.wisest).toBe('rich.ts')
    expect(r.stats.bestMaintained).toBe('rich.ts')
    expect(r.stats.mostInnovative).toBe('rich.ts')
  })

  it('returns correct mixed result', () => {
    const r = buildEmberHearthIiResult(['dir/rich.ts', 'dir/poor.ts'], [RICH, POOR])
    expect(r.embers).toHaveLength(2)
    expect(r.circles).toHaveLength(1)
    expect(r.forge.avgWarmth).toBe(53)
    expect(r.forge.avgWisdom).toBe(52)
    expect(r.forge.avgInnovation).toBe(43)
    expect(r.forge.isHot).toBe(false)
    expect(r.forge.overallHeat).toBe(49)
    expect(r.stats.blacksmithGrade).toBe('apprentice')
    expect(r.stats.avgBurnQuality).toBe(44)
    expect(r.stats.avgFireTending).toBe(50)
    expect(r.stats.extinguishedCount).toBe(1)
    expect(r.stats.hasHighDeepAccessibilityCount).toBe(1)
    expect(r.stats.hasHighEfficiencyCount).toBe(1)
    expect(r.stats.hasHighFailureWisdomCount).toBe(1)
    expect(r.stats.hasHighMaintenanceCount).toBe(1)
    expect(r.stats.hasHighInnovationCount).toBe(1)
    expect(r.stats.hasHighTemperatureCount).toBe(1)
  })

  it('returns empty result for no files', () => {
    const r = buildEmberHearthIiResult([], [])
    expect(r.embers).toHaveLength(0)
    expect(r.circles).toHaveLength(0)
    expect(r.forge.isHot).toBe(false)
    expect(r.forge.overallHeat).toBe(0)
    expect(r.stats.blacksmithGrade).toBe('cold-hands')
    expect(r.stats.bestEmber).toBe('')
    expect(r.stats.warmest).toBe('')
  })

  it('groups files by directory', () => {
    const r = buildEmberHearthIiResult(['a/rich.ts', 'b/rich.ts'], [RICH, RICH])
    expect(r.circles).toHaveLength(2)
    expect(r.circles[0].directory).toBe('a')
    expect(r.circles[1].directory).toBe('b')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for rich result', () => {
    const r = buildEmberHearthIiResult(['rich.ts'], [RICH])
    expect(r.recommendations).toHaveLength(1)
    expect(r.recommendations[0]).toContain('thousand fires')
  })

  it('returns recommendations for empty result', () => {
    const r = buildEmberHearthIiResult([], [])
    expect(r.recommendations.length).toBeGreaterThan(1)
    expect(r.recommendations).toContain('Deepen accessibility with doc comments, optional chaining, and default parameters')
  })

  it('includes extinguished files in recommendations', () => {
    const r = buildEmberHearthIiResult(['dir/poor.ts'], [POOR])
    const extRec = r.recommendations.find((rec) => rec.includes('extinguished'))
    expect(extRec).toBeDefined()
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('formatEmberHearthIiJson', () => {
  it('returns valid JSON', () => {
    const r = buildEmberHearthIiResult(['rich.ts'], [RICH])
    const json = formatEmberHearthIiJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.embers).toHaveLength(1)
    expect(parsed.forge.overallHeat).toBe(93)
  })
})

describe('formatEmberHearthIiTable', () => {
  it('returns formatted string', () => {
    const r = buildEmberHearthIiResult(['rich.ts'], [RICH])
    const t = formatEmberHearthIiTable(r, false)
    expect(t).toContain('Ember Hearth II Analysis')
    expect(t).toContain('Forge:')
    expect(t).toContain('Statistics:')
    expect(t).toContain('Condition Counts:')
    expect(t).toContain('Highlights:')
  })

  it('includes per-file embers when verbose', () => {
    const r = buildEmberHearthIiResult(['rich.ts'], [RICH])
    const t = formatEmberHearthIiTable(r, true)
    expect(t).toContain('Per-File Embers:')
    expect(t).toContain('rich.ts')
  })

  it('excludes per-file embers when not verbose', () => {
    const r = buildEmberHearthIiResult(['rich.ts'], [RICH])
    const t = formatEmberHearthIiTable(r, false)
    expect(t).not.toContain('Per-File Embers:')
  })

  it('includes recommendations', () => {
    const r = buildEmberHearthIiResult(['rich.ts'], [RICH])
    const t = formatEmberHearthIiTable(r, false)
    expect(t).toContain('Recommendations:')
  })
})

describe('color helpers', () => {
  it('scoreColor returns string for various scores', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(70)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(30)).toBe('string')
  })

  it('warmHeatColor returns string for all heats', () => {
    expect(typeof warmHeatColor('white-hot-core')).toBe('string')
    expect(typeof warmHeatColor('frozen')).toBe('string')
    expect(typeof warmHeatColor('unknown')).toBe('string')
  })

  it('burningQualityColor returns string for all qualities', () => {
    expect(typeof burningQualityColor('complete-combustion')).toBe('string')
    expect(typeof burningQualityColor('no-fire')).toBe('string')
    expect(typeof burningQualityColor('unknown')).toBe('string')
  })

  it('wiseKnowledgeColor returns string for all knowledge levels', () => {
    expect(typeof wiseKnowledgeColor('sage-wisdom')).toBe('string')
    expect(typeof wiseKnowledgeColor('ignorant')).toBe('string')
    expect(typeof wiseKnowledgeColor('unknown')).toBe('string')
  })

  it('tendingCareColor returns string for all care levels', () => {
    expect(typeof tendingCareColor('master-firekeeper')).toBe('string')
    expect(typeof tendingCareColor('abandoned')).toBe('string')
    expect(typeof tendingCareColor('unknown')).toBe('string')
  })

  it('sparkingCreativityColor returns string for all creativity levels', () => {
    expect(typeof sparkingCreativityColor('fireworks-display')).toBe('string')
    expect(typeof sparkingCreativityColor('no-spark')).toBe('string')
    expect(typeof sparkingCreativityColor('unknown')).toBe('string')
  })

  it('forgingHeatColor returns string for all heat levels', () => {
    expect(typeof forgingHeatColor('forge-ready')).toBe('string')
    expect(typeof forgingHeatColor('frozen-solid')).toBe('string')
    expect(typeof forgingHeatColor('unknown')).toBe('string')
  })

  it('emberConditionColor returns string for all conditions', () => {
    expect(typeof emberConditionColor('forge-furnace')).toBe('string')
    expect(typeof emberConditionColor('extinguished')).toBe('string')
    expect(typeof emberConditionColor('unknown')).toBe('string')
  })

  it('blacksmithGradeColor returns string for all grades', () => {
    expect(typeof blacksmithGradeColor('master-blacksmith')).toBe('string')
    expect(typeof blacksmithGradeColor('cold-hands')).toBe('string')
    expect(typeof blacksmithGradeColor('unknown')).toBe('string')
  })
})
