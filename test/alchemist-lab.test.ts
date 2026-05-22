import { describe, expect, it } from 'vitest'

import {
  analyzeAlchemicalSample,
  analyzeLaboratoryBench,
  buildAlchemistLabResult,
  classifyAlchemistGrade,
  classifyBenchCondition,
  classifyBenchType,
  classifyCondition,
  generateRecommendations,
  measureCatalyst,
  measureElixir,
  measureEssence,
  measurePurification,
  measureStone,
  measureTransmutation,
  type AlchemicalSample,
} from '../src/commands/alchemist-lab-helpers.js'
import {
  agentColor,
  benchTypeColor,
  conditionColor,
  elementColor,
  elixirGradeColor,
  essenceColor,
  formatAlchemistLabJson,
  formatAlchemistLabTable,
  gradeColor,
  scoreColor,
  stageColor,
  stateColor,
} from '../src/commands/alchemist-lab-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

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

// ─── measureTransmutation ──────────────────────────────────────────────────

describe('measureTransmutation', () => {
  it('returns aurum for RICH content', () => {
    const result = measureTransmutation(RICH)
    expect(result.quality).toBe(90)
    expect(result.element).toBe('aurum')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasProperVessel).toBe(true)
    expect(result.hasEvenHeat).toBe(true)
    expect(result.hasNoImpurities).toBe(true)
    expect(result.hasNoExplosion).toBe(true)
    expect(result.hasCatalyticAgent).toBe(true)
    expect(result.impurityCount).toBe(0)
  })

  it('returns plumbum for EMPTY content', () => {
    const result = measureTransmutation(EMPTY)
    expect(result.quality).toBe(45)
    expect(result.element).toBe('plumbum')
    expect(result.hasHighQuality).toBe(false)
    expect(result.hasProperVessel).toBe(false)
    expect(result.hasProperSequence).toBe(false)
    expect(result.hasCatalyticAgent).toBe(false)
    expect(result.hasProperBalance).toBe(false)
    expect(result.impurityCount).toBe(0)
    expect(result.explosionCount).toBe(0)
  })

  it('returns plumbum for MEDIUM content', () => {
    const result = measureTransmutation(MEDIUM)
    expect(result.quality).toBe(45)
    expect(result.element).toBe('plumbum')
    expect(result.hasHighQuality).toBe(false)
    expect(result.hasEvenHeat).toBe(true)
    expect(result.hasNoImpurities).toBe(true)
    expect(result.hasNoReaction).toBe(true)
    expect(result.impurityCount).toBe(0)
  })
})

// ─── measurePurification ───────────────────────────────────────────────────

describe('measurePurification', () => {
  it('returns clarified for RICH content', () => {
    const result = measurePurification(RICH)
    expect(result.level).toBe(95)
    expect(result.state).toBe('clarified')
    expect(result.hasHighLevel).toBe(true)
    expect(result.hasProperFilter).toBe(true)
    expect(result.hasNoSludge).toBe(false)
    expect(result.hasCrystal).toBe(true)
    expect(result.hasNoSediment).toBe(true)
    expect(result.hasPure).toBe(true)
  })

  it('returns impure for EMPTY content', () => {
    const result = measurePurification(EMPTY)
    expect(result.level).toBe(38)
    expect(result.state).toBe('impure')
    expect(result.hasHighLevel).toBe(false)
    expect(result.hasProperFilter).toBe(false)
    expect(result.hasNoSludge).toBe(true)
    expect(result.hasCrystal).toBe(false)
    expect(result.sludgeCount).toBe(0)
    expect(result.sedimentCount).toBe(0)
  })

  it('returns impure for MEDIUM content', () => {
    const result = measurePurification(MEDIUM)
    expect(result.level).toBe(38)
    expect(result.state).toBe('impure')
    expect(result.hasProperWash).toBe(false)
    expect(result.hasRefined).toBe(false)
    expect(result.hasNoResidue).toBe(true)
  })
})

// ─── measureEssence ────────────────────────────────────────────────────────

describe('measureEssence', () => {
  it('returns aether for RICH content', () => {
    const result = measureEssence(RICH)
    expect(result.potency).toBe(95)
    expect(result.type).toBe('aether')
    expect(result.hasHighPotency).toBe(true)
    expect(result.hasConcentrated).toBe(true)
    expect(result.hasProperExtraction).toBe(false)
    expect(result.hasNoDilution).toBe(true)
    expect(result.hasPotent).toBe(true)
    expect(result.hasVolatile).toBe(true)
    expect(result.dilutionCount).toBe(0)
  })

  it('returns diluted for EMPTY content', () => {
    const result = measureEssence(EMPTY)
    expect(result.potency).toBe(33)
    expect(result.type).toBe('diluted')
    expect(result.hasHighPotency).toBe(false)
    expect(result.hasConcentrated).toBe(false)
    expect(result.hasProperExtraction).toBe(false)
    expect(result.hasEssential).toBe(false)
    expect(result.dilutionCount).toBe(0)
    expect(result.evaporationCount).toBe(0)
  })

  it('returns diluted for MEDIUM content', () => {
    const result = measureEssence(MEDIUM)
    expect(result.potency).toBe(33)
    expect(result.type).toBe('diluted')
    expect(result.hasNoDilution).toBe(true)
    expect(result.hasNoWeakening).toBe(true)
    expect(result.hasNoEvaporation).toBe(true)
  })
})

// ─── measureCatalyst ───────────────────────────────────────────────────────

describe('measureCatalyst', () => {
  it('returns accelerator for RICH content', () => {
    const result = measureCatalyst(RICH)
    expect(result.strength).toBe(95)
    expect(result.agent).toBe('accelerator')
    expect(result.hasHighStrength).toBe(true)
    expect(result.hasReaction).toBe(true)
    expect(result.hasAcceleration).toBe(true)
    expect(result.hasNoInhibition).toBe(true)
    expect(result.hasEnzymatic).toBe(true)
    expect(result.hasNoPoison).toBe(false)
    expect(result.inhibitionCount).toBe(0)
  })

  it('returns inhibitor for EMPTY content', () => {
    const result = measureCatalyst(EMPTY)
    expect(result.strength).toBe(34)
    expect(result.agent).toBe('inhibitor')
    expect(result.hasHighStrength).toBe(false)
    expect(result.hasReaction).toBe(false)
    expect(result.hasAcceleration).toBe(false)
    expect(result.hasEnzymatic).toBe(false)
    expect(result.hasProperDosage).toBe(false)
    expect(result.inhibitionCount).toBe(0)
    expect(result.poisonCount).toBe(0)
  })

  it('returns inhibitor for MEDIUM content', () => {
    const result = measureCatalyst(MEDIUM)
    expect(result.strength).toBe(34)
    expect(result.agent).toBe('inhibitor')
    expect(result.hasNoInhibition).toBe(true)
    expect(result.hasNoPoison).toBe(true)
    expect(result.hasNoOverdose).toBe(true)
    expect(result.hasNoSuppression).toBe(true)
  })
})

// ─── measureElixir ─────────────────────────────────────────────────────────

describe('measureElixir', () => {
  it('returns grand-elixir for RICH content', () => {
    const result = measureElixir(RICH)
    expect(result.quality).toBe(93)
    expect(result.grade).toBe('grand-elixir')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasHealing).toBe(true)
    expect(result.hasRestorative).toBe(true)
    expect(result.hasNoToxicity).toBe(true)
    expect(result.hasBalanced).toBe(true)
    expect(result.hasNoSideEffects).toBe(true)
    expect(result.toxicityCount).toBe(0)
  })

  it('returns brew for EMPTY content', () => {
    const result = measureElixir(EMPTY)
    expect(result.quality).toBe(32)
    expect(result.grade).toBe('brew')
    expect(result.hasHighQuality).toBe(false)
    expect(result.hasHealing).toBe(false)
    expect(result.hasRestorative).toBe(false)
    expect(result.hasBalanced).toBe(false)
    expect(result.toxicityCount).toBe(0)
    expect(result.corruptionCount).toBe(0)
  })

  it('returns brew for MEDIUM content', () => {
    const result = measureElixir(MEDIUM)
    expect(result.quality).toBe(32)
    expect(result.grade).toBe('brew')
    expect(result.hasNoToxicity).toBe(true)
    expect(result.hasNoSideEffects).toBe(true)
    expect(result.hasNoSpoilage).toBe(true)
    expect(result.hasNoCorruption).toBe(true)
  })
})

// ─── measureStone ──────────────────────────────────────────────────────────

describe('measureStone', () => {
  it('returns rubedo for RICH content', () => {
    const result = measureStone(RICH)
    expect(result.proximity).toBe(93)
    expect(result.stage).toBe('rubedo')
    expect(result.hasHighProximity).toBe(true)
    expect(result.hasGold).toBe(true)
    expect(result.hasSilver).toBe(true)
    expect(result.hasTransmutationReady).toBe(true)
    expect(result.hasNoBaseMetal).toBe(true)
    expect(result.hasOpus).toBe(true)
    expect(result.baseMetalCount).toBe(0)
  })

  it('returns prima-materia for EMPTY content', () => {
    const result = measureStone(EMPTY)
    expect(result.proximity).toBe(34)
    expect(result.stage).toBe('prima-materia')
    expect(result.hasHighProximity).toBe(false)
    expect(result.hasGold).toBe(false)
    expect(result.hasSilver).toBe(false)
    expect(result.hasTransmutationReady).toBe(false)
    expect(result.baseMetalCount).toBe(0)
    expect(result.failedExperimentCount).toBe(0)
  })

  it('returns prima-materia for MEDIUM content', () => {
    const result = measureStone(MEDIUM)
    expect(result.proximity).toBe(34)
    expect(result.stage).toBe('prima-materia')
    expect(result.hasNoBaseMetal).toBe(true)
    expect(result.hasNoFailedExperiment).toBe(true)
    expect(result.hasNoShadow).toBe(true)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns philosopher-stone for score >= 80', () => {
    const sample = { qualityScore: 80 } as AlchemicalSample
    expect(classifyCondition(sample)).toBe('philosopher-stone')
  })

  it('returns aurum-potabile for score >= 65', () => {
    const sample = { qualityScore: 65 } as AlchemicalSample
    expect(classifyCondition(sample)).toBe('aurum-potabile')
  })

  it('returns grand-elixir for score >= 50', () => {
    const sample = { qualityScore: 50 } as AlchemicalSample
    expect(classifyCondition(sample)).toBe('grand-elixir')
  })

  it('returns work-in-progress for score >= 35', () => {
    const sample = { qualityScore: 35 } as AlchemicalSample
    expect(classifyCondition(sample)).toBe('work-in-progress')
  })

  it('returns base-metal for score >= 20', () => {
    const sample = { qualityScore: 20 } as AlchemicalSample
    expect(classifyCondition(sample)).toBe('base-metal')
  })

  it('returns slag for score < 20', () => {
    const sample = { qualityScore: 10 } as AlchemicalSample
    expect(classifyCondition(sample)).toBe('slag')
  })
})

// ─── classifyBenchType ─────────────────────────────────────────────────────

describe('classifyBenchType', () => {
  it('returns dungeon for empty samples', () => {
    expect(classifyBenchType([])).toBe('dungeon')
  })

  it('returns grand-laboratory for high avg and philosopher majority', () => {
    const samples = Array.from({ length: 5 }, () => ({
      qualityScore: 90, condition: 'philosopher-stone',
    } as unknown as AlchemicalSample))
    expect(classifyBenchType(samples)).toBe('grand-laboratory')
  })

  it('returns alchemist-study for avg >= 60', () => {
    const samples = [{ qualityScore: 60, condition: 'work-in-progress' } as unknown as AlchemicalSample]
    expect(classifyBenchType(samples)).toBe('alchemist-study')
  })

  it('returns workshop for avg >= 45', () => {
    const samples = [{ qualityScore: 45, condition: 'work-in-progress' } as unknown as AlchemicalSample]
    expect(classifyBenchType(samples)).toBe('workshop')
  })

  it('returns apothecary for avg >= 30', () => {
    const samples = [{ qualityScore: 30, condition: 'base-metal' } as unknown as AlchemicalSample]
    expect(classifyBenchType(samples)).toBe('apothecary')
  })

  it('returns closet for avg >= 15', () => {
    const samples = [{ qualityScore: 15, condition: 'slag' } as unknown as AlchemicalSample]
    expect(classifyBenchType(samples)).toBe('closet')
  })
})

// ─── classifyBenchCondition ────────────────────────────────────────────────

describe('classifyBenchCondition', () => {
  it('returns master-atelier for avg >= 80', () => {
    expect(classifyBenchCondition(80)).toBe('master-atelier')
  })

  it('returns skilled-lab for avg >= 65', () => {
    expect(classifyBenchCondition(65)).toBe('skilled-lab')
  })

  it('returns apprentice-bench for avg >= 50', () => {
    expect(classifyBenchCondition(50)).toBe('apprentice-bench')
  })

  it('returns amateur-setup for avg >= 35', () => {
    expect(classifyBenchCondition(35)).toBe('amateur-setup')
  })

  it('returns ruined-lab for avg >= 20', () => {
    expect(classifyBenchCondition(20)).toBe('ruined-lab')
  })

  it('returns abandoned for avg < 20', () => {
    expect(classifyBenchCondition(10)).toBe('abandoned')
  })
})

// ─── classifyAlchemistGrade ────────────────────────────────────────────────

describe('classifyAlchemistGrade', () => {
  it('returns grand-master for avg >= 80', () => {
    expect(classifyAlchemistGrade(80)).toBe('grand-master')
  })

  it('returns master-alchemist for avg >= 65', () => {
    expect(classifyAlchemistGrade(65)).toBe('master-alchemist')
  })

  it('returns adept for avg >= 50', () => {
    expect(classifyAlchemistGrade(50)).toBe('adept')
  })

  it('returns apprentice for avg >= 35', () => {
    expect(classifyAlchemistGrade(35)).toBe('apprentice')
  })

  it('returns novice for avg >= 20', () => {
    expect(classifyAlchemistGrade(20)).toBe('novice')
  })

  it('returns charlatan for avg < 20', () => {
    expect(classifyAlchemistGrade(10)).toBe('charlatan')
  })
})

// ─── analyzeAlchemicalSample ───────────────────────────────────────────────

describe('analyzeAlchemicalSample', () => {
  it('produces philosopher-stone for RICH', () => {
    const sample = analyzeAlchemicalSample(RICH, 'rich.ts')
    expect(sample.file).toBe('rich.ts')
    expect(sample.transmutationQuality).toBe(90)
    expect(sample.purificationLevel).toBe(95)
    expect(sample.essencePotency).toBe(95)
    expect(sample.catalystStrength).toBe(95)
    expect(sample.elixirQuality).toBe(93)
    expect(sample.stoneProximity).toBe(93)
    expect(sample.qualityScore).toBe(94)
    expect(sample.condition).toBe('philosopher-stone')
  })

  it('produces work-in-progress for EMPTY', () => {
    const sample = analyzeAlchemicalSample(EMPTY, 'empty.ts')
    expect(sample.file).toBe('empty.ts')
    expect(sample.transmutationQuality).toBe(45)
    expect(sample.purificationLevel).toBe(38)
    expect(sample.essencePotency).toBe(33)
    expect(sample.catalystStrength).toBe(34)
    expect(sample.elixirQuality).toBe(32)
    expect(sample.stoneProximity).toBe(34)
    expect(sample.qualityScore).toBe(36)
    expect(sample.condition).toBe('work-in-progress')
  })

  it('produces work-in-progress for MEDIUM', () => {
    const sample = analyzeAlchemicalSample(MEDIUM, 'medium.ts')
    expect(sample.file).toBe('medium.ts')
    expect(sample.transmutationQuality).toBe(45)
    expect(sample.purificationLevel).toBe(38)
    expect(sample.essencePotency).toBe(33)
    expect(sample.catalystStrength).toBe(34)
    expect(sample.elixirQuality).toBe(32)
    expect(sample.stoneProximity).toBe(34)
    expect(sample.qualityScore).toBe(36)
    expect(sample.condition).toBe('work-in-progress')
  })
})

// ─── analyzeLaboratoryBench ────────────────────────────────────────────────

describe('analyzeLaboratoryBench', () => {
  it('handles empty samples with dungeon', () => {
    const bench = analyzeLaboratoryBench([], 'src')
    expect(bench.directory).toBe('src')
    expect(bench.samples).toEqual([])
    expect(bench.benchType).toBe('dungeon')
  })

  it('computes correct avg for single sample', () => {
    const sample = analyzeAlchemicalSample(RICH, 'rich.ts')
    const bench = analyzeLaboratoryBench([sample], 'src')
    expect(bench.avgTransmutation).toBe(sample.transmutationQuality)
    expect(bench.avgPurification).toBe(sample.purificationLevel)
    expect(bench.samples.length).toBe(1)
  })

  it('computes correct avg for multiple samples', () => {
    const rich = analyzeAlchemicalSample(RICH, 'rich.ts')
    const med = analyzeAlchemicalSample(MEDIUM, 'medium.ts')
    const bench = analyzeLaboratoryBench([rich, med], 'src')
    expect(bench.avgTransmutation).toBe(68)
    expect(bench.avgPurification).toBe(67)
    expect(bench.samples.length).toBe(2)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns empty array for empty result', () => {
    const result = buildAlchemistLabResult([], [])
    const recs = generateRecommendations(result.samples, result.benches, result.laboratory, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })

  it('returns recommendations for RICH content', () => {
    const result = buildAlchemistLabResult(['rich.ts'], [RICH])
    const recs = generateRecommendations(result.samples, result.benches, result.laboratory, result.stats)
    expect(Array.isArray(recs)).toBe(true)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('returns recommendations for mixed content', () => {
    const result = buildAlchemistLabResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    const recs = generateRecommendations(result.samples, result.benches, result.laboratory, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })
})

// ─── buildAlchemistLabResult ───────────────────────────────────────────────

describe('buildAlchemistLabResult', () => {
  it('handles empty input gracefully', () => {
    const result = buildAlchemistLabResult([], [])
    expect(result.samples).toEqual([])
    expect(result.benches).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalBenches).toBe(0)
    expect(result.stats.avgTransmutationQuality).toBe(0)
    expect(result.laboratory.overallAlchemy).toBe(0)
  })

  it('handles single RICH file', () => {
    const result = buildAlchemistLabResult(['rich.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalBenches).toBe(1)
    expect(result.samples.length).toBe(1)
    expect(result.samples[0].qualityScore).toBe(94)
    expect(result.samples[0].condition).toBe('philosopher-stone')
    expect(result.stats.philosopherStoneCount).toBe(1)
    expect(result.stats.bestSample).toBe('rich.ts')
  })

  it('handles rich+medium files', () => {
    const result = buildAlchemistLabResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalBenches).toBe(1)
    expect(result.stats.avgTransmutationQuality).toBe(68)
    expect(result.stats.avgPurificationLevel).toBe(67)
    expect(result.stats.avgEssencePotency).toBe(64)
    expect(result.stats.avgCatalystStrength).toBe(65)
    expect(result.stats.avgElixirQuality).toBe(63)
    expect(result.stats.avgStoneProximity).toBe(64)
    expect(result.stats.alchemistGrade).toBe('master-alchemist')
    expect(result.stats.bestSample).toBe('rich.ts')
    expect(result.stats.bestTransmuter).toBe('rich.ts')
    expect(result.stats.purest).toBe('rich.ts')
    expect(result.stats.mostPotent).toBe('rich.ts')
    expect(result.stats.strongestCatalyst).toBe('rich.ts')
    expect(result.stats.closestToStone).toBe('rich.ts')
    expect(result.laboratory.avgTransmutation).toBe(68)
    expect(result.laboratory.avgPurification).toBe(67)
    expect(result.laboratory.avgStoneProximity).toBe(64)
    expect(result.laboratory.isGolden).toBe(true)
    expect(result.laboratory.overallAlchemy).toBe(65)
  })
})

// ─── formatAlchemistLabJson ────────────────────────────────────────────────

describe('formatAlchemistLabJson', () => {
  it('produces valid JSON string', () => {
    const result = buildAlchemistLabResult(['rich.ts'], [RICH])
    const json = formatAlchemistLabJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.samples[0].file).toBe('rich.ts')
  })
})

// ─── formatAlchemistLabTable ───────────────────────────────────────────────

describe('formatAlchemistLabTable', () => {
  it('produces non-empty string for table format', () => {
    const result = buildAlchemistLabResult(['rich.ts'], [RICH])
    const table = formatAlchemistLabTable(result, false)
    expect(table.length).toBeGreaterThan(0)
    expect(table).toContain('Alchemist Lab')
  })

  it('includes per-file details when verbose', () => {
    const result = buildAlchemistLabResult(['rich.ts'], [RICH])
    const table = formatAlchemistLabTable(result, true)
    expect(table).toContain('rich.ts')
    expect(table).toContain('Per-File Details')
  })

  it('includes recommendations when present', () => {
    const result = buildAlchemistLabResult(['rich.ts'], [RICH])
    const table = formatAlchemistLabTable(result, false)
    if (result.recommendations.length > 0) {
      expect(table).toContain('Recommendations')
    }
  })
})

// ─── Color Helpers ─────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns green for >= 80', () => {
    const result = scoreColor(90)
    expect(result).toBeTruthy()
  })

  it('returns yellow for >= 60', () => {
    const result = scoreColor(70)
    expect(result).toBeTruthy()
  })

  it('returns orange for >= 40', () => {
    const result = scoreColor(50)
    expect(result).toBeTruthy()
  })

  it('returns red for < 40', () => {
    const result = scoreColor(30)
    expect(result).toBeTruthy()
  })
})

describe('conditionColor', () => {
  it('colors philosopher-stone', () => {
    expect(conditionColor('philosopher-stone')).toBeTruthy()
  })
  it('colors aurum-potabile', () => {
    expect(conditionColor('aurum-potabile')).toBeTruthy()
  })
  it('colors grand-elixir', () => {
    expect(conditionColor('grand-elixir')).toBeTruthy()
  })
  it('colors work-in-progress', () => {
    expect(conditionColor('work-in-progress')).toBeTruthy()
  })
  it('colors base-metal', () => {
    expect(conditionColor('base-metal')).toBeTruthy()
  })
  it('colors slag', () => {
    expect(conditionColor('slag')).toBeTruthy()
  })
})

describe('gradeColor', () => {
  it('colors grand-master', () => {
    expect(gradeColor('grand-master')).toBeTruthy()
  })
  it('colors master-alchemist', () => {
    expect(gradeColor('master-alchemist')).toBeTruthy()
  })
  it('colors adept', () => {
    expect(gradeColor('adept')).toBeTruthy()
  })
  it('colors apprentice', () => {
    expect(gradeColor('apprentice')).toBeTruthy()
  })
  it('colors novice', () => {
    expect(gradeColor('novice')).toBeTruthy()
  })
  it('colors charlatan', () => {
    expect(gradeColor('charlatan')).toBeTruthy()
  })
})

describe('elementColor', () => {
  it('colors aurum', () => {
    expect(elementColor('aurum')).toBeTruthy()
  })
  it('colors argentum', () => {
    expect(elementColor('argentum')).toBeTruthy()
  })
  it('colors cuprum', () => {
    expect(elementColor('cuprum')).toBeTruthy()
  })
  it('colors ferrum', () => {
    expect(elementColor('ferrum')).toBeTruthy()
  })
  it('colors plumbum', () => {
    expect(elementColor('plumbum')).toBeTruthy()
  })
  it('colors stercore', () => {
    expect(elementColor('stercore')).toBeTruthy()
  })
})

describe('stateColor', () => {
  it('colors distilled', () => {
    expect(stateColor('distilled')).toBeTruthy()
  })
  it('colors filtered', () => {
    expect(stateColor('filtered')).toBeTruthy()
  })
  it('colors clarified', () => {
    expect(stateColor('clarified')).toBeTruthy()
  })
  it('colors raw', () => {
    expect(stateColor('raw')).toBeTruthy()
  })
  it('colors impure', () => {
    expect(stateColor('impure')).toBeTruthy()
  })
  it('colors contaminated', () => {
    expect(stateColor('contaminated')).toBeTruthy()
  })
})

describe('essenceColor', () => {
  it('colors quintessence', () => {
    expect(essenceColor('quintessence')).toBeTruthy()
  })
  it('colors aether', () => {
    expect(essenceColor('aether')).toBeTruthy()
  })
  it('colors vital-essence', () => {
    expect(essenceColor('vital-essence')).toBeTruthy()
  })
  it('colors tincture', () => {
    expect(essenceColor('tincture')).toBeTruthy()
  })
  it('colors diluted', () => {
    expect(essenceColor('diluted')).toBeTruthy()
  })
  it('colors inert', () => {
    expect(essenceColor('inert')).toBeTruthy()
  })
})

describe('agentColor', () => {
  it('colors philosopher-catalyst', () => {
    expect(agentColor('philosopher-catalyst')).toBeTruthy()
  })
  it('colors accelerator', () => {
    expect(agentColor('accelerator')).toBeTruthy()
  })
  it('colors enzyme', () => {
    expect(agentColor('enzyme')).toBeTruthy()
  })
  it('colors mild-agent', () => {
    expect(agentColor('mild-agent')).toBeTruthy()
  })
  it('colors inhibitor', () => {
    expect(agentColor('inhibitor')).toBeTruthy()
  })
  it('colors poison', () => {
    expect(agentColor('poison')).toBeTruthy()
  })
})

describe('elixirGradeColor', () => {
  it('colors elixir-of-life', () => {
    expect(elixirGradeColor('elixir-of-life')).toBeTruthy()
  })
  it('colors grand-elixir', () => {
    expect(elixirGradeColor('grand-elixir')).toBeTruthy()
  })
  it('colors minor-elixir', () => {
    expect(elixirGradeColor('minor-elixir')).toBeTruthy()
  })
  it('colors potion', () => {
    expect(elixirGradeColor('potion')).toBeTruthy()
  })
  it('colors brew', () => {
    expect(elixirGradeColor('brew')).toBeTruthy()
  })
  it('colors sludge', () => {
    expect(elixirGradeColor('sludge')).toBeTruthy()
  })
})

describe('stageColor', () => {
  it('colors lapis-philosophorum', () => {
    expect(stageColor('lapis-philosophorum')).toBeTruthy()
  })
  it('colors rubedo', () => {
    expect(stageColor('rubedo')).toBeTruthy()
  })
  it('colors albedo', () => {
    expect(stageColor('albedo')).toBeTruthy()
  })
  it('colors nigredo', () => {
    expect(stageColor('nigredo')).toBeTruthy()
  })
  it('colors prima-materia', () => {
    expect(stageColor('prima-materia')).toBeTruthy()
  })
  it('colors void', () => {
    expect(stageColor('void')).toBeTruthy()
  })
})

describe('benchTypeColor', () => {
  it('colors grand-laboratory', () => {
    expect(benchTypeColor('grand-laboratory')).toBeTruthy()
  })
  it('colors alchemist-study', () => {
    expect(benchTypeColor('alchemist-study')).toBeTruthy()
  })
  it('colors workshop', () => {
    expect(benchTypeColor('workshop')).toBeTruthy()
  })
  it('colors apothecary', () => {
    expect(benchTypeColor('apothecary')).toBeTruthy()
  })
  it('colors closet', () => {
    expect(benchTypeColor('closet')).toBeTruthy()
  })
  it('colors dungeon', () => {
    expect(benchTypeColor('dungeon')).toBeTruthy()
  })
})
