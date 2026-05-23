import { describe, it, expect } from 'vitest'
import {
  measureFluid,
  measureAdaptable,
  measureSpeed,
  measureStateful,
  measureCohesive,
  measureMerging,
  analyzeMercuryDrop,
  classifyCondition,
  classifyPoolType,
  classifyPoolCondition,
  classifyAlchemistGrade,
  buildQuicksilverFlowResult,
} from '../src/commands/quicksilver-flow-helpers.js'
import {
  scoreColor,
  fluidStateColor,
  adaptShapeColor,
  velocityColor,
  transitionColor,
  strengthColor,
  fusionColor,
  conditionColor,
  alchemistColor,
  formatQuicksilverFlowJson,
  formatQuicksilverFlowTable,
} from '../src/commands/quicksilver-flow-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const RICH = `import { readFileSync } from 'node:fs'

/**
 * Documentation
 */
export interface Data {
  value: number
  name: string
}

export class Processor {
  private data: Data[] = []

  async process(input?: string): Promise<Data[]> {
    try {
      const result = input ?? 'default'
      return this.data
    } catch (e) {
      throw e
    }
  }
}

export type Result = Data | null
`

const EMPTY = ''
const POOR = 'var x = 1\nany\nvar y = 2'

// ─── measureFluid ──────────────────────────────────────────────────────────

describe('measureFluid', () => {
  it('returns flow 76 for RICH', () => {
    expect(measureFluid(RICH).flow).toBe(76)
  })
  it('returns smooth-flow for RICH', () => {
    expect(measureFluid(RICH).state).toBe('smooth-flow')
  })
  it('has hasHighFlow true for RICH', () => {
    expect(measureFluid(RICH).hasHighFlow).toBe(true)
  })
  it('has hasFlowing true for RICH', () => {
    expect(measureFluid(RICH).hasFlowing).toBe(true)
  })
  it('has hasRapid true for RICH', () => {
    expect(measureFluid(RICH).hasRapid).toBe(true)
  })
  it('returns 0 for EMPTY', () => {
    expect(measureFluid(EMPTY).flow).toBe(0)
  })
  it('returns frozen for EMPTY', () => {
    expect(measureFluid(EMPTY).state).toBe('frozen')
  })
  it('detects blockageCount 2 for POOR', () => {
    expect(measureFluid(POOR).blockageCount).toBe(2)
  })
  it('detects stagnationCount 1 for POOR', () => {
    expect(measureFluid(POOR).stagnationCount).toBe(1)
  })
  it('hasNoBlockage false for POOR', () => {
    expect(measureFluid(POOR).hasNoBlockage).toBe(false)
  })
})

// ─── measureAdaptable ──────────────────────────────────────────────────────

describe('measureAdaptable', () => {
  it('returns flexibility 70 for RICH', () => {
    expect(measureAdaptable(RICH).flexibility).toBe(70)
  })
  it('returns highly-flexible for RICH', () => {
    expect(measureAdaptable(RICH).shape).toBe('highly-flexible')
  })
  it('has hasHighFlexibility true for RICH', () => {
    expect(measureAdaptable(RICH).hasHighFlexibility).toBe(true)
  })
  it('has hasMorphing true for RICH', () => {
    expect(measureAdaptable(RICH).hasMorphing).toBe(true)
  })
  it('returns 0 for EMPTY', () => {
    expect(measureAdaptable(EMPTY).flexibility).toBe(0)
  })
  it('returns crystalline for EMPTY', () => {
    expect(measureAdaptable(EMPTY).shape).toBe('crystalline')
  })
  it('detects rigidityCount 2 for POOR', () => {
    expect(measureAdaptable(POOR).rigidityCount).toBe(2)
  })
  it('detects fixedFormCount 1 for POOR', () => {
    expect(measureAdaptable(POOR).fixedFormCount).toBe(1)
  })
})

// ─── measureSpeed ───────────────────────────────────────────────────────────

describe('measureSpeed', () => {
  it('returns performance 62 for RICH', () => {
    expect(measureSpeed(RICH).performance).toBe(62)
  })
  it('returns proper-pace for RICH', () => {
    expect(measureSpeed(RICH).velocity).toBe('proper-pace')
  })
  it('has hasHighPerformance false for RICH', () => {
    expect(measureSpeed(RICH).hasHighPerformance).toBe(false)
  })
  it('has hasRapid true for RICH', () => {
    expect(measureSpeed(RICH).hasRapid).toBe(true)
  })
  it('has hasQuick true for RICH', () => {
    expect(measureSpeed(RICH).hasQuick).toBe(true)
  })
  it('returns 0 for EMPTY', () => {
    expect(measureSpeed(EMPTY).performance).toBe(0)
  })
  it('returns glacial for EMPTY', () => {
    expect(measureSpeed(EMPTY).velocity).toBe('glacial')
  })
  it('detects slownessCount 2 for POOR', () => {
    expect(measureSpeed(POOR).slownessCount).toBe(2)
  })
  it('detects bloatCount 1 for POOR', () => {
    expect(measureSpeed(POOR).bloatCount).toBe(1)
  })
})

// ─── measureStateful ────────────────────────────────────────────────────────

describe('measureStateful', () => {
  it('returns transitions 100 for RICH', () => {
    expect(measureStateful(RICH).transitions).toBe(100)
  })
  it('returns seamless-transitions for RICH', () => {
    expect(measureStateful(RICH).quality).toBe('seamless-transitions')
  })
  it('has hasHighTransitions true for RICH', () => {
    expect(measureStateful(RICH).hasHighTransitions).toBe(true)
  })
  it('has hasClean true for RICH', () => {
    expect(measureStateful(RICH).hasClean).toBe(true)
  })
  it('has hasProper true for RICH', () => {
    expect(measureStateful(RICH).hasProper).toBe(true)
  })
  it('has hasGraceful true for RICH', () => {
    expect(measureStateful(RICH).hasGraceful).toBe(true)
  })
  it('returns 0 for EMPTY', () => {
    expect(measureStateful(EMPTY).transitions).toBe(0)
  })
  it('returns broken-transitions for EMPTY', () => {
    expect(measureStateful(EMPTY).quality).toBe('broken-transitions')
  })
  it('detects glitchCount 2 for POOR', () => {
    expect(measureStateful(POOR).glitchCount).toBe(2)
  })
  it('detects leakCount 1 for POOR', () => {
    expect(measureStateful(POOR).leakCount).toBe(1)
  })
})

// ─── measureCohesive ────────────────────────────────────────────────────────

describe('measureCohesive', () => {
  it('returns tension 98 for RICH', () => {
    expect(measureCohesive(RICH).tension).toBe(98)
  })
  it('returns high-tension for RICH', () => {
    expect(measureCohesive(RICH).strength).toBe('high-tension')
  })
  it('has hasHighTension true for RICH', () => {
    expect(measureCohesive(RICH).hasHighTension).toBe(true)
  })
  it('has hasCohesive true for RICH', () => {
    expect(measureCohesive(RICH).hasCohesive).toBe(true)
  })
  it('has hasUnified true for RICH', () => {
    expect(measureCohesive(RICH).hasUnified).toBe(true)
  })
  it('returns 0 for EMPTY', () => {
    expect(measureCohesive(EMPTY).tension).toBe(0)
  })
  it('returns disintegrating for EMPTY', () => {
    expect(measureCohesive(EMPTY).strength).toBe('disintegrating')
  })
  it('detects fragmentationCount 2 for POOR', () => {
    expect(measureCohesive(POOR).fragmentationCount).toBe(2)
  })
  it('detects isolationCount 1 for POOR', () => {
    expect(measureCohesive(POOR).isolationCount).toBe(1)
  })
})

// ─── measureMerging ─────────────────────────────────────────────────────────

describe('measureMerging', () => {
  it('returns quality 98 for RICH', () => {
    expect(measureMerging(RICH).quality).toBe(98)
  })
  it('returns perfect-fusion for RICH', () => {
    expect(measureMerging(RICH).fusion).toBe('perfect-fusion')
  })
  it('has hasHighQuality true for RICH', () => {
    expect(measureMerging(RICH).hasHighQuality).toBe(true)
  })
  it('has hasCompatible true for RICH', () => {
    expect(measureMerging(RICH).hasCompatible).toBe(true)
  })
  it('has hasCleanInterface true for RICH', () => {
    expect(measureMerging(RICH).hasCleanInterface).toBe(true)
  })
  it('returns 0 for EMPTY', () => {
    expect(measureMerging(EMPTY).quality).toBe(0)
  })
  it('returns immiscible for EMPTY', () => {
    expect(measureMerging(EMPTY).fusion).toBe('immiscible')
  })
  it('detects conflictCount 2 for POOR', () => {
    expect(measureMerging(POOR).conflictCount).toBe(2)
  })
  it('detects rejectionCount 1 for POOR', () => {
    expect(measureMerging(POOR).rejectionCount).toBe(1)
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns perfect-quicksilver for 90', () => expect(classifyCondition(90)).toBe('perfect-quicksilver'))
  it('returns flowing-mercury for 75', () => expect(classifyCondition(75)).toBe('flowing-mercury'))
  it('returns liquid-metal for 60', () => expect(classifyCondition(60)).toBe('liquid-metal'))
  it('returns sluggish-alloy for 45', () => expect(classifyCondition(45)).toBe('sluggish-alloy'))
  it('returns cooling-metal for 30', () => expect(classifyCondition(30)).toBe('cooling-metal'))
  it('returns frozen-solid for 10', () => expect(classifyCondition(10)).toBe('frozen-solid'))
})

// ─── classifyAlchemistGrade ─────────────────────────────────────────────────

describe('classifyAlchemistGrade', () => {
  it('returns grand-alchemist for 85', () => expect(classifyAlchemistGrade(85)).toBe('grand-alchemist'))
  it('returns master-mercurial for 70', () => expect(classifyAlchemistGrade(70)).toBe('master-mercurial'))
  it('returns skilled-transmuter for 55', () => expect(classifyAlchemistGrade(55)).toBe('skilled-transmuter'))
  it('returns apprentice for 40', () => expect(classifyAlchemistGrade(40)).toBe('apprentice'))
  it('returns novice for 25', () => expect(classifyAlchemistGrade(25)).toBe('novice'))
  it('returns lead-footed for 10', () => expect(classifyAlchemistGrade(10)).toBe('lead-footed'))
})

// ─── classifyPoolCondition ──────────────────────────────────────────────────

describe('classifyPoolCondition', () => {
  it('returns pristine-pool for 80', () => expect(classifyPoolCondition(80)).toBe('pristine-pool'))
  it('returns flowing-river for 65', () => expect(classifyPoolCondition(65)).toBe('flowing-river'))
  it('returns proper-liquid for 50', () => expect(classifyPoolCondition(50)).toBe('proper-liquid'))
  it('returns stagnant-pool for 35', () => expect(classifyPoolCondition(35)).toBe('stagnant-pool'))
  it('returns congealing for 20', () => expect(classifyPoolCondition(20)).toBe('congealing'))
  it('returns frozen-solid for 10', () => expect(classifyPoolCondition(10)).toBe('frozen-solid'))
})

// ─── analyzeMercuryDrop ─────────────────────────────────────────────────────

describe('analyzeMercuryDrop', () => {
  it('returns qualityScore 84 for RICH', () => {
    expect(analyzeMercuryDrop(RICH, 'rich.ts').qualityScore).toBe(84)
  })
  it('returns flowing-mercury condition for RICH', () => {
    expect(analyzeMercuryDrop(RICH, 'rich.ts').condition).toBe('flowing-mercury')
  })
  it('stores file path', () => {
    expect(analyzeMercuryDrop(RICH, 'a.ts').file).toBe('a.ts')
  })
  it('returns fluidity 76 for RICH', () => {
    expect(analyzeMercuryDrop(RICH, 'r.ts').fluidity).toBe(76)
  })
  it('returns adaptability 70 for RICH', () => {
    expect(analyzeMercuryDrop(RICH, 'r.ts').adaptability).toBe(70)
  })
  it('returns mercurySpeed 62 for RICH', () => {
    expect(analyzeMercuryDrop(RICH, 'r.ts').mercurySpeed).toBe(62)
  })
  it('returns stateTransitions 100 for RICH', () => {
    expect(analyzeMercuryDrop(RICH, 'r.ts').stateTransitions).toBe(100)
  })
  it('returns surfaceTension 98 for RICH', () => {
    expect(analyzeMercuryDrop(RICH, 'r.ts').surfaceTension).toBe(98)
  })
  it('returns mergingQuality 98 for RICH', () => {
    expect(analyzeMercuryDrop(RICH, 'r.ts').mergingQuality).toBe(98)
  })
  it('returns frozen-solid for POOR', () => {
    expect(analyzeMercuryDrop(POOR, 'p.ts').condition).toBe('frozen-solid')
  })
})

// ─── classifyPoolType ───────────────────────────────────────────────────────

describe('classifyPoolType', () => {
  it('returns solid-metal for empty drops', () => {
    expect(classifyPoolType([])).toBe('solid-metal')
  })
  it('returns liquid-mercury for RICH drop', () => {
    const drop = analyzeMercuryDrop(RICH, 'a.ts')
    expect(classifyPoolType([drop])).toBe('liquid-mercury')
  })
})

// ─── buildQuicksilverFlowResult ─────────────────────────────────────────────

describe('buildQuicksilverFlowResult', () => {
  it('returns totalFiles 2 for two files', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.totalFiles).toBe(2)
  })
  it('computes avgFluidity 38', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgFluidity).toBe(38)
  })
  it('computes avgAdaptability 39', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgAdaptability).toBe(39)
  })
  it('computes avgMercurySpeed 31', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgMercurySpeed).toBe(31)
  })
  it('computes avgStateTransitions 50', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgStateTransitions).toBe(50)
  })
  it('computes avgSurfaceTension 49', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgSurfaceTension).toBe(49)
  })
  it('computes avgMergingQuality 49', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.avgMergingQuality).toBe(49)
  })
  it('computes overallFluidity 39', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.overallFluidity).toBe(39)
  })
  it('returns apprentice grade for overallFluidity 39', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.alchemistGrade).toBe('apprentice')
  })
  it('returns bestDrop as rich.ts', () => {
    expect(buildQuicksilverFlowResult(['rich.ts', 'poor.ts'], [RICH, POOR]).stats.bestDrop).toBe('rich.ts')
  })
  it('counts flowingMercuryCount correctly', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.flowingMercuryCount).toBe(1)
  })
  it('counts frozenSolidCount correctly', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.frozenSolidCount).toBe(1)
  })
  it('counts hasHighFlowCount correctly', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.hasHighFlowCount).toBe(1)
  })
  it('counts hasHighFlexibilityCount correctly', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.hasHighFlexibilityCount).toBe(1)
  })
  it('counts hasHighTransitionsCount correctly', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.hasHighTransitionsCount).toBe(1)
  })
  it('counts hasHighTensionCount correctly', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.hasHighTensionCount).toBe(1)
  })
  it('counts hasHighQualityCount correctly', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).stats.hasHighQualityCount).toBe(1)
  })
  it('sets system.isFluid false', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).system.isFluid).toBe(false)
  })
  it('generates recommendations', () => {
    const recs = buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).recommendations
    expect(recs.length).toBeGreaterThan(0)
  })
  it('handles empty input', () => {
    const r = buildQuicksilverFlowResult([], [])
    expect(r.stats.totalFiles).toBe(0)
    expect(r.system.overallFluidity).toBe(0)
    expect(r.stats.alchemistGrade).toBe('lead-footed')
  })
  it('creates pools by directory', () => {
    const r = buildQuicksilverFlowResult(['a/rich.ts', 'b/poor.ts'], [RICH, POOR])
    expect(r.pools.length).toBe(2)
  })
  it('sets system.avgFluidity correctly', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).system.avgFluidity).toBe(38)
  })
  it('sets system.overallFluidity correctly', () => {
    expect(buildQuicksilverFlowResult(['a.ts', 'b.ts'], [RICH, POOR]).system.overallFluidity).toBe(39)
  })
  it('returns mostFluid correctly', () => {
    expect(buildQuicksilverFlowResult(['rich.ts', 'poor.ts'], [RICH, POOR]).stats.mostFluid).toBe('rich.ts')
  })
  it('returns mostAdaptable correctly', () => {
    expect(buildQuicksilverFlowResult(['rich.ts', 'poor.ts'], [RICH, POOR]).stats.mostAdaptable).toBe('rich.ts')
  })
  it('returns fastest correctly', () => {
    expect(buildQuicksilverFlowResult(['rich.ts', 'poor.ts'], [RICH, POOR]).stats.fastest).toBe('rich.ts')
  })
  it('returns bestTransitions correctly', () => {
    expect(buildQuicksilverFlowResult(['rich.ts', 'poor.ts'], [RICH, POOR]).stats.bestTransitions).toBe('rich.ts')
  })
  it('returns mostCohesive correctly', () => {
    expect(buildQuicksilverFlowResult(['rich.ts', 'poor.ts'], [RICH, POOR]).stats.mostCohesive).toBe('rich.ts')
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns string for high score', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })
  it('scoreColor returns string for low score', () => {
    expect(typeof scoreColor(20)).toBe('string')
  })
  it('fluidStateColor returns string for liquid-perfection', () => {
    expect(typeof fluidStateColor('liquid-perfection')).toBe('string')
  })
  it('adaptShapeColor returns string for perfectly-adaptable', () => {
    expect(typeof adaptShapeColor('perfectly-adaptable')).toBe('string')
  })
  it('velocityColor returns string for mercury-speed', () => {
    expect(typeof velocityColor('mercury-speed')).toBe('string')
  })
  it('transitionColor returns string for seamless-transitions', () => {
    expect(typeof transitionColor('seamless-transitions')).toBe('string')
  })
  it('strengthColor returns string for high-tension', () => {
    expect(typeof strengthColor('high-tension')).toBe('string')
  })
  it('fusionColor returns string for perfect-fusion', () => {
    expect(typeof fusionColor('perfect-fusion')).toBe('string')
  })
  it('conditionColor returns string for perfect-quicksilver', () => {
    expect(typeof conditionColor('perfect-quicksilver')).toBe('string')
  })
  it('alchemistColor returns string for grand-alchemist', () => {
    expect(typeof alchemistColor('grand-alchemist')).toBe('string')
  })
  it('formatQuicksilverFlowJson returns valid JSON', () => {
    const r = buildQuicksilverFlowResult(['a.ts'], [RICH])
    const json = formatQuicksilverFlowJson(r)
    expect(() => JSON.parse(json)).not.toThrow()
  })
  it('formatQuicksilverFlowTable returns string with header', () => {
    const r = buildQuicksilverFlowResult(['a.ts'], [RICH])
    const table = formatQuicksilverFlowTable(r, false)
    expect(table).toContain('Quicksilver Flow Analysis')
  })
  it('formatQuicksilverFlowTable verbose shows per-file drops', () => {
    const r = buildQuicksilverFlowResult(['a.ts'], [RICH])
    const table = formatQuicksilverFlowTable(r, true)
    expect(table).toContain('Per-File Drops')
  })
  it('color helpers pass through unknown values', () => {
    expect(fluidStateColor('unknown')).toBe('unknown')
    expect(adaptShapeColor('unknown')).toBe('unknown')
    expect(velocityColor('unknown')).toBe('unknown')
    expect(transitionColor('unknown')).toBe('unknown')
    expect(strengthColor('unknown')).toBe('unknown')
    expect(fusionColor('unknown')).toBe('unknown')
    expect(conditionColor('unknown')).toBe('unknown')
    expect(alchemistColor('unknown')).toBe('unknown')
  })
})
