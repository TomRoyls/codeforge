import { describe, it, expect } from 'vitest'

import {
  measureEmber,
  measureAsh,
  measureRebirth,
  measureFlame,
  measureImmortal,
  measureRising,
  classifyCondition,
  analyzeEmberFragment,
  analyzeAshCircle,
  classifyCircleType,
  classifyGuardianGrade,
  generateRecommendations,
  buildPhoenixAshResult,
} from '../src/commands/phoenix-ash-helpers.js'

import {
  scoreColor,
  conditionColor,
  gradeColor,
  heatColor,
  compositionColor,
  stageColor,
  clarityColor,
  immortalQualityColor,
  trajectoryColor,
  circleTypeColor,
  circleConditionColor,
  formatPhoenixAshJson,
  formatPhoenixAshTable,
} from '../src/commands/phoenix-ash-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────

const RICH = `
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

const EMPTY = ''

const MEDIUM = 'const x = 1\n'

// ─── measureEmber ─────────────────────────────────────────────

describe('measureEmber', () => {
  it('measures rich content', () => {
    const result = measureEmber(RICH)
    expect(result.potential).toBe(77)
    expect(result.heat).toBe('glowing')
    expect(result.hasHighPotential).toBe(true)
    expect(result.hasViableCore).toBe(true)
    expect(result.hasProperKindling).toBe(true)
    expect(result.hasNoBurnout).toBe(false)
    expect(result.hasSmoldering).toBe(true)
    expect(result.hasNoAshes).toBe(true)
    expect(result.hasIgnitionPoint).toBe(true)
    expect(result.hasNoExtinguished).toBe(true)
    expect(result.hasThermalMass).toBe(false)
    expect(result.hasNoEvaporated).toBe(true)
    expect(result.burnoutCount).toBe(1)
    expect(result.extinguishedCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureEmber(EMPTY)
    expect(result.potential).toBe(32)
    expect(result.heat).toBe('cooling')
    expect(result.hasHighPotential).toBe(false)
    expect(result.hasViableCore).toBe(false)
    expect(result.hasSmoldering).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureEmber(MEDIUM)
    expect(result.potential).toBe(37)
    expect(result.heat).toBe('cooling')
  })
})

// ─── measureAsh ───────────────────────────────────────────────

describe('measureAsh', () => {
  it('measures rich content', () => {
    const result = measureAsh(RICH)
    expect(result.richness).toBe(90)
    expect(result.composition).toBe('phoenix-ash')
    expect(result.hasHighRichness).toBe(true)
    expect(result.hasNutrients).toBe(true)
    expect(result.hasProperDeposit).toBe(true)
    expect(result.hasNoContamination).toBe(true)
    expect(result.hasTrace).toBe(true)
    expect(result.hasNoToxicity).toBe(true)
    expect(result.hasConcentrated).toBe(false)
    expect(result.hasNoErosion).toBe(true)
    expect(result.hasHistorical).toBe(true)
    expect(result.hasNoWaste).toBe(true)
    expect(result.contaminationCount).toBe(0)
    expect(result.toxicityCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureAsh(EMPTY)
    expect(result.richness).toBe(40)
    expect(result.composition).toBe('dust')
    expect(result.hasHighRichness).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureAsh(MEDIUM)
    expect(result.richness).toBe(45)
    expect(result.composition).toBe('dust')
  })
})

// ─── measureRebirth ───────────────────────────────────────────

describe('measureRebirth', () => {
  it('measures rich content', () => {
    const result = measureRebirth(RICH)
    expect(result.capability).toBe(79)
    expect(result.stage).toBe('reforming')
    expect(result.hasHighCapability).toBe(true)
    expect(result.hasBlueprint).toBe(true)
    expect(result.hasProperFramework).toBe(true)
    expect(result.hasNoCollapse).toBe(true)
    expect(result.hasRegeneration).toBe(false)
    expect(result.hasNoDisintegration).toBe(true)
    expect(result.hasCatalyst).toBe(true)
    expect(result.hasNoEntropy).toBe(true)
    expect(result.hasReconstruction).toBe(false)
    expect(result.hasNoLoss).toBe(true)
    expect(result.collapseCount).toBe(0)
    expect(result.disintegrationCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureRebirth(EMPTY)
    expect(result.capability).toBe(40)
    expect(result.stage).toBe('scattered')
    expect(result.hasHighCapability).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureRebirth(MEDIUM)
    expect(result.capability).toBe(45)
    expect(result.stage).toBe('scattered')
  })
})

// ─── measureFlame ─────────────────────────────────────────────

describe('measureFlame', () => {
  it('measures rich content', () => {
    const result = measureFlame(RICH)
    expect(result.memory).toBe(78)
    expect(result.clarity).toBe('flickering')
    expect(result.hasHighMemory).toBe(true)
    expect(result.hasDocumentation).toBe(true)
    expect(result.hasProperArchive).toBe(false)
    expect(result.hasNoLostKnowledge).toBe(false)
    expect(result.hasTransferable).toBe(true)
    expect(result.hasNoDegradation).toBe(true)
    expect(result.hasOralTradition).toBe(true)
    expect(result.hasNoCorruption).toBe(true)
    expect(result.hasLivingMemory).toBe(true)
    expect(result.hasNoAmnesia).toBe(true)
    expect(result.lostKnowledgeCount).toBe(1)
    expect(result.amnesiaCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureFlame(EMPTY)
    expect(result.memory).toBe(42)
    expect(result.clarity).toBe('smoke-signal')
    expect(result.hasHighMemory).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureFlame(MEDIUM)
    expect(result.memory).toBe(47)
    expect(result.clarity).toBe('smoke-signal')
  })
})

// ─── measureImmortal ──────────────────────────────────────────

describe('measureImmortal', () => {
  it('measures rich content', () => {
    const result = measureImmortal(RICH)
    expect(result.patterns).toBe(90)
    expect(result.quality).toBe('eternal-flame')
    expect(result.hasHighPatterns).toBe(true)
    expect(result.hasClassicPatterns).toBe(true)
    expect(result.hasProvenPrinciples).toBe(true)
    expect(result.hasNoFad).toBe(true)
    expect(result.hasFoundational).toBe(true)
    expect(result.hasNoObsolescence).toBe(true)
    expect(result.hasUniversal).toBe(false)
    expect(result.hasNoFragility).toBe(true)
    expect(result.hasTimeless).toBe(true)
    expect(result.hasNoDecay).toBe(true)
    expect(result.fadCount).toBe(0)
    expect(result.obsolescenceCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureImmortal(EMPTY)
    expect(result.patterns).toBe(40)
    expect(result.quality).toBe('mortal')
    expect(result.hasHighPatterns).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureImmortal(MEDIUM)
    expect(result.patterns).toBe(45)
    expect(result.quality).toBe('mortal')
  })
})

// ─── measureRising ────────────────────────────────────────────

describe('measureRising', () => {
  it('measures rich content', () => {
    const result = measureRising(RICH)
    expect(result.quality).toBe(68)
    expect(result.trajectory).toBe('grounded')
    expect(result.hasHighQuality).toBe(false)
    expect(result.hasMomentum).toBe(false)
    expect(result.hasProperTrajectory).toBe(true)
    expect(result.hasNoRegression).toBe(false)
    expect(result.hasGrowth).toBe(false)
    expect(result.hasNoStagnation).toBe(true)
    expect(result.hasEvolution).toBe(true)
    expect(result.hasNoDevolution).toBe(true)
    expect(result.hasRenewal).toBe(true)
    expect(result.hasNoDeath).toBe(true)
    expect(result.regressionCount).toBe(1)
    expect(result.devolutionCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureRising(EMPTY)
    expect(result.quality).toBe(30)
    expect(result.trajectory).toBe('crashed')
    expect(result.hasHighQuality).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureRising(MEDIUM)
    expect(result.quality).toBe(35)
    expect(result.trajectory).toBe('falling')
  })
})

// ─── analyzeEmberFragment ─────────────────────────────────────

describe('analyzeEmberFragment', () => {
  it('analyzes rich content', () => {
    const result = analyzeEmberFragment(RICH, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.emberPotential).toBe(77)
    expect(result.ashRichness).toBe(90)
    expect(result.rebirthCapability).toBe(79)
    expect(result.flameMemory).toBe(78)
    expect(result.immortalPatterns).toBe(90)
    expect(result.risingQuality).toBe(68)
    expect(result.qualityScore).toBe(80)
    expect(result.condition).toBe('phoenix-rising')
  })

  it('analyzes empty content', () => {
    const result = analyzeEmberFragment(EMPTY, 'empty.ts')
    expect(result.emberPotential).toBe(32)
    expect(result.ashRichness).toBe(40)
    expect(result.rebirthCapability).toBe(40)
    expect(result.flameMemory).toBe(42)
    expect(result.immortalPatterns).toBe(40)
    expect(result.risingQuality).toBe(30)
    expect(result.qualityScore).toBe(38)
    expect(result.condition).toBe('scattered-embers')
  })

  it('analyzes medium content', () => {
    const result = analyzeEmberFragment(MEDIUM, 'medium.ts')
    expect(result.emberPotential).toBe(37)
    expect(result.ashRichness).toBe(45)
    expect(result.rebirthCapability).toBe(45)
    expect(result.flameMemory).toBe(47)
    expect(result.immortalPatterns).toBe(45)
    expect(result.risingQuality).toBe(35)
    expect(result.qualityScore).toBe(43)
    expect(result.condition).toBe('scattered-embers')
  })

  it('returns consistent results on repeated calls', () => {
    const a = analyzeEmberFragment(RICH, 'a.ts')
    const b = analyzeEmberFragment(RICH, 'a.ts')
    expect(a.qualityScore).toBe(b.qualityScore)
    expect(a.emberPotential).toBe(b.emberPotential)
    expect(a.condition).toBe(b.condition)
  })
})

// ─── classifyCondition ────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies phoenix-rising', () => {
    const f = analyzeEmberFragment(RICH, 'rich.ts')
    expect(classifyCondition(f)).toBe('phoenix-rising')
  })
  it('classifies scattered-embers for empty', () => {
    const f = analyzeEmberFragment(EMPTY, 'empty.ts')
    expect(classifyCondition(f)).toBe('scattered-embers')
  })
  it('classifies scattered-embers for medium', () => {
    const f = analyzeEmberFragment(MEDIUM, 'medium.ts')
    expect(classifyCondition(f)).toBe('scattered-embers')
  })
})

// ─── classifyCircleType ───────────────────────────────────────

describe('classifyCircleType', () => {
  it('classifies rich as phoenix-nest', () => {
    const f = analyzeEmberFragment(RICH, 'rich.ts')
    expect(classifyCircleType([f])).toBe('phoenix-nest')
  })
  it('classifies empty as ash-pile', () => {
    const f = analyzeEmberFragment(EMPTY, 'empty.ts')
    expect(classifyCircleType([f])).toBe('ash-pile')
  })
  it('classifies mixed as hearth-circle', () => {
    const r = analyzeEmberFragment(RICH, 'rich.ts')
    const e = analyzeEmberFragment(EMPTY, 'empty.ts')
    const m = analyzeEmberFragment(MEDIUM, 'medium.ts')
    expect(classifyCircleType([r, e, m])).toBe('hearth-circle')
  })
})

// ─── classifyGuardianGrade ────────────────────────────────────

describe('classifyGuardianGrade', () => {
  it('returns phoenix-lord for 80+', () => {
    expect(classifyGuardianGrade(90)).toBe('phoenix-lord')
  })
  it('returns fire-guardian for 65+', () => {
    expect(classifyGuardianGrade(75)).toBe('fire-guardian')
  })
  it('returns ash-keeper for 50+', () => {
    expect(classifyGuardianGrade(55)).toBe('ash-keeper')
  })
  it('returns ember-tender for 35+', () => {
    expect(classifyGuardianGrade(35)).toBe('ember-tender')
  })
  it('returns smoke-watcher for 20+', () => {
    expect(classifyGuardianGrade(20)).toBe('smoke-watcher')
  })
  it('returns ice-walker for below 20', () => {
    expect(classifyGuardianGrade(10)).toBe('ice-walker')
  })
})

// ─── analyzeAshCircle ─────────────────────────────────────────

describe('analyzeAshCircle', () => {
  it('analyzes a circle with multiple fragments', () => {
    const r = analyzeEmberFragment(RICH, 'rich.ts')
    const m = analyzeEmberFragment(MEDIUM, 'medium.ts')
    const circle = analyzeAshCircle([r, m], 'src')
    expect(circle.directory).toBe('src')
    expect(circle.fragments).toHaveLength(2)
    expect(circle.avgEmber).toBe(57)
    expect(circle.avgRebirth).toBe(62)
    expect(circle.avgRising).toBe(52)
    expect(circle.phoenixCount).toBe(1)
    expect(circle.voidCount).toBe(0)
    expect(circle.hotCount).toBe(1)
    expect(circle.capableCount).toBe(1)
    expect(circle.circleType).toBe('fire-temple')
    expect(circle.condition).toBe('renewing')
  })
})

// ─── generateRecommendations ──────────────────────────────────

describe('generateRecommendations', () => {
  it('returns empty array for rich content', () => {
    const f = analyzeEmberFragment(RICH, 'rich.ts')
    const recs = generateRecommendations(
      [f],
      [{ directory: 'src', fragments: [f], avgEmber: f.emberPotential, avgRebirth: f.rebirthCapability, avgRising: f.risingQuality, phoenixCount: 1, voidCount: 0, hotCount: 1, capableCount: 1, circleType: 'phoenix-nest', condition: 'reborn-glory' }],
      { avgEmber: f.emberPotential, avgRebirth: f.rebirthCapability, avgRising: f.risingQuality, isRising: true, overallRenewal: f.qualityScore },
      { totalFiles: 1, totalCircles: 1, avgEmberPotential: f.emberPotential, avgAshRichness: f.ashRichness, avgRebirthCapability: f.rebirthCapability, avgFlameMemory: f.flameMemory, avgImmortalPatterns: f.immortalPatterns, avgRisingQuality: f.risingQuality, phoenixRisingCount: 1, emberGatheringCount: 0, ashNestingCount: 0, scatteredEmbersCount: 0, coldAshCount: 0, voidCount: 0, hasHighPotentialCount: 1, hasHighRichnessCount: 1, hasHighCapabilityCount: 1, hasHighMemoryCount: 1, hasHighPatternsCount: 1, hasHighQualityCount: 0, overallRenewal: f.qualityScore, guardianGrade: 'phoenix-lord', bestFragment: 'rich.ts', bestPotential: 'rich.ts', richestAsh: 'rich.ts', bestRebirth: 'rich.ts', bestMemory: 'rich.ts', mostImmortal: 'rich.ts' },
    )
    expect(recs).toEqual([])
  })
})

// ─── buildPhoenixAshResult ────────────────────────────────────

describe('buildPhoenixAshResult', () => {
  it('builds result for rich content', () => {
    const result = buildPhoenixAshResult(['rich.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalCircles).toBe(1)
    expect(result.stats.avgEmberPotential).toBe(77)
    expect(result.stats.avgAshRichness).toBe(90)
    expect(result.stats.avgRebirthCapability).toBe(79)
    expect(result.stats.avgFlameMemory).toBe(78)
    expect(result.stats.avgImmortalPatterns).toBe(90)
    expect(result.stats.avgRisingQuality).toBe(68)
    expect(result.stats.overallRenewal).toBe(80)
    expect(result.stats.guardianGrade).toBe('phoenix-lord')
    expect(result.stats.phoenixRisingCount).toBe(1)
    expect(result.stats.hasHighPotentialCount).toBe(1)
    expect(result.stats.bestFragment).toBe('rich.ts')
    expect(result.flame.isRising).toBe(true)
  })

  it('builds result for empty content', () => {
    const result = buildPhoenixAshResult(['empty.ts'], [EMPTY])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgEmberPotential).toBe(32)
    expect(result.stats.avgAshRichness).toBe(40)
    expect(result.stats.avgRebirthCapability).toBe(40)
    expect(result.stats.avgFlameMemory).toBe(42)
    expect(result.stats.avgImmortalPatterns).toBe(40)
    expect(result.stats.avgRisingQuality).toBe(30)
    expect(result.stats.overallRenewal).toBe(38)
    expect(result.stats.guardianGrade).toBe('ember-tender')
    expect(result.stats.scatteredEmbersCount).toBe(1)
    expect(result.stats.hasHighPotentialCount).toBe(0)
    expect(result.flame.isRising).toBe(false)
  })

  it('builds result for mixed content', () => {
    const result = buildPhoenixAshResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalCircles).toBe(1)
    expect(result.stats.avgEmberPotential).toBe(57)
    expect(result.stats.avgAshRichness).toBe(68)
    expect(result.stats.avgRebirthCapability).toBe(62)
    expect(result.stats.avgFlameMemory).toBe(63)
    expect(result.stats.avgImmortalPatterns).toBe(68)
    expect(result.stats.avgRisingQuality).toBe(52)
    expect(result.stats.overallRenewal).toBe(62)
    expect(result.stats.guardianGrade).toBe('ash-keeper')
    expect(result.stats.phoenixRisingCount).toBe(1)
    expect(result.stats.scatteredEmbersCount).toBe(1)
    expect(result.stats.bestFragment).toBe('rich.ts')
    expect(result.flame.overallRenewal).toBe(62)
  })

  it('returns fragments and circles arrays', () => {
    const result = buildPhoenixAshResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.fragments).toHaveLength(2)
    expect(result.circles).toHaveLength(1)
    expect(result.fragments[0].file).toBe('rich.ts')
    expect(result.fragments[1].file).toBe('medium.ts')
  })
})

// ─── Format Helpers ───────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for high scores', () => { expect(typeof scoreColor(90)).toBe('string') })
  it('returns string for medium scores', () => { expect(typeof scoreColor(70)).toBe('string') })
  it('returns string for low scores', () => { expect(typeof scoreColor(30)).toBe('string') })
})

describe('conditionColor', () => {
  it('colors phoenix-rising', () => { expect(typeof conditionColor('phoenix-rising')).toBe('string') })
  it('colors ember-gathering', () => { expect(typeof conditionColor('ember-gathering')).toBe('string') })
  it('colors ash-nesting', () => { expect(typeof conditionColor('ash-nesting')).toBe('string') })
  it('colors scattered-embers', () => { expect(typeof conditionColor('scattered-embers')).toBe('string') })
  it('colors cold-ash', () => { expect(typeof conditionColor('cold-ash')).toBe('string') })
  it('colors void', () => { expect(typeof conditionColor('void')).toBe('string') })
  it('colors unknown', () => { expect(typeof conditionColor('unknown')).toBe('string') })
})

describe('gradeColor', () => {
  it('colors phoenix-lord', () => { expect(typeof gradeColor('phoenix-lord')).toBe('string') })
  it('colors fire-guardian', () => { expect(typeof gradeColor('fire-guardian')).toBe('string') })
  it('colors ice-walker', () => { expect(typeof gradeColor('ice-walker')).toBe('string') })
})

describe('heatColor', () => {
  it('colors white-hot', () => { expect(typeof heatColor('white-hot')).toBe('string') })
  it('colors cold', () => { expect(typeof heatColor('cold')).toBe('string') })
})

describe('compositionColor', () => {
  it('colors phoenix-ash', () => { expect(typeof compositionColor('phoenix-ash')).toBe('string') })
  it('colors void', () => { expect(typeof compositionColor('void')).toBe('string') })
})

describe('stageColor', () => {
  it('colors rising-phoenix', () => { expect(typeof stageColor('rising-phoenix')).toBe('string') })
  it('colors impossible', () => { expect(typeof stageColor('impossible')).toBe('string') })
})

describe('clarityColor', () => {
  it('colors brilliant-flame', () => { expect(typeof clarityColor('brilliant-flame')).toBe('string') })
  it('colors darkness', () => { expect(typeof clarityColor('darkness')).toBe('string') })
})

describe('immortalQualityColor', () => {
  it('colors eternal-flame', () => { expect(typeof immortalQualityColor('eternal-flame')).toBe('string') })
  it('colors ephemeral', () => { expect(typeof immortalQualityColor('ephemeral')).toBe('string') })
})

describe('trajectoryColor', () => {
  it('colors soaring', () => { expect(typeof trajectoryColor('soaring')).toBe('string') })
  it('colors crashed', () => { expect(typeof trajectoryColor('crashed')).toBe('string') })
})

describe('circleTypeColor', () => {
  it('colors phoenix-nest', () => { expect(typeof circleTypeColor('phoenix-nest')).toBe('string') })
  it('colors void', () => { expect(typeof circleTypeColor('void')).toBe('string') })
})

describe('circleConditionColor', () => {
  it('colors reborn-glory', () => { expect(typeof circleConditionColor('reborn-glory')).toBe('string') })
  it('colors extinguished', () => { expect(typeof circleConditionColor('extinguished')).toBe('string') })
})

// ─── JSON Formatter ───────────────────────────────────────────

describe('formatPhoenixAshJson', () => {
  it('returns valid JSON string', () => {
    const result = buildPhoenixAshResult(['rich.ts'], [RICH])
    const json = formatPhoenixAshJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.overallRenewal).toBe(80)
    expect(parsed.fragments).toHaveLength(1)
  })
})

// ─── Table Formatter ─────────────────────────────────────────

describe('formatPhoenixAshTable', () => {
  it('returns a non-empty string', () => {
    const result = buildPhoenixAshResult(['rich.ts'], [RICH])
    const table = formatPhoenixAshTable(result, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('returns verbose table with more content', () => {
    const result = buildPhoenixAshResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    const brief = formatPhoenixAshTable(result, false)
    const verbose = formatPhoenixAshTable(result, true)
    expect(verbose.length).toBeGreaterThan(brief.length)
  })
})

// ─── Additional Coverage ──────────────────────────────────────

describe('edge cases', () => {
  it('handles empty ash circle', () => {
    const circle = analyzeAshCircle([], 'empty-dir')
    expect(circle.directory).toBe('empty-dir')
    expect(circle.fragments).toHaveLength(0)
    expect(circle.avgEmber).toBe(0)
    expect(circle.circleType).toBe('void')
    expect(circle.condition).toBe('extinguished')
  })

  it('empty build has zero stats', () => {
    const result = buildPhoenixAshResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallRenewal).toBe(0)
    expect(result.stats.guardianGrade).toBe('ice-walker')
    expect(result.fragments).toHaveLength(0)
    expect(result.circles).toHaveLength(0)
    expect(result.flame.isRising).toBe(false)
  })

  it('tracks best-per-file stats correctly', () => {
    const result = buildPhoenixAshResult(['rich.ts', 'empty.ts'], [RICH, EMPTY])
    expect(result.stats.bestFragment).toBe('rich.ts')
    expect(result.stats.bestPotential).toBe('rich.ts')
    expect(result.stats.richestAsh).toBe('rich.ts')
    expect(result.stats.bestRebirth).toBe('rich.ts')
    expect(result.stats.bestMemory).toBe('rich.ts')
    expect(result.stats.mostImmortal).toBe('rich.ts')
  })
})
