import { describe, expect, it } from 'vitest'

import {
  analyzeFossilBed,
  analyzePetrifiedLog,
  buildPetrifiedForestResult,
  classifyBedCondition,
  classifyBedType,
  classifyCondition,
  classifyPaleontologistGrade,
  generateRecommendations,
  measureAge,
  measureColoration,
  measureFossil,
  measureMineral,
  measurePreservation,
  measureRings,
} from '../src/commands/petrified-forest-helpers.js'

import {
  bedTypeColor,
  conditionColor,
  formatPetrifiedForestJson,
  formatPetrifiedForestTable,
  gradeColor,
  scoreColor,
} from '../src/commands/petrified-forest-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface AuroraConfig {
  readonly id: string
  name: string
  intensity: number
  colors: string[]
  isActive: boolean
}

export class AuroraCalculator<T extends AuroraConfig> {
  private configs: T[] = []
  protected maxIntensity: number = 100

  constructor(initialConfigs?: T[]) {
    if (initialConfigs) {
      this.configs = initialConfigs
    }
  }

  async calculateIntensity(config: T): Promise<number> {
    try {
      const base = config.intensity
      const multiplier = config.isActive ? 2.0 : 0.5
      const result = Math.min(this.maxIntensity, base * multiplier)
      return Math.round(result)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      }
      return 0
    }
  }

  static createDefault(): AuroraCalculator<AuroraConfig> {
    return new AuroraCalculator<AuroraConfig>()
  }
}

/** Calculates aurora brightness */
export function calculateBrightness(colors: string[]): number {
  const green = colors.filter(c => c.includes('green'))
  return green.length * 10
}

export type AuroraPhase = 'dawn' | 'dusk' | 'night' | 'peak'
export enum AuroraType { BAND = 'band', CURTAIN = 'curtain', CORONA = 'corona' }
`

const EMPTY = ''

const MEDIUM = `export class Calculator {
  private value: number = 0

  constructor(initial: number) {
    this.value = initial
  }

  add(x: number): number {
    return this.value + x
  }

  subtract(x: number): number {
    return this.value - x
  }
}

export interface Config {
  name: string
  max: number
}

/** Helper function */
export function process(input: string): string {
  return input.toUpperCase()
}
`

// ─── measurePreservation ───────────────────────────────────────────────────

describe('measurePreservation', () => {
  it('returns quality 90 for RICH', () => {
    expect(measurePreservation(RICH).quality).toBe(90)
  })

  it('returns state permineralized for RICH', () => {
    expect(measurePreservation(RICH).state).toBe('permineralized')
  })

  it('returns quality 37 for EMPTY', () => {
    expect(measurePreservation(EMPTY).quality).toBe(37)
  })

  it('returns state impression for EMPTY', () => {
    expect(measurePreservation(EMPTY).state).toBe('impression')
  })

  it('returns quality 90 for MEDIUM', () => {
    expect(measurePreservation(MEDIUM).quality).toBe(90)
  })

  it('returns state perfect-cast for MEDIUM', () => {
    expect(measurePreservation(MEDIUM).state).toBe('perfect-cast')
  })

  it('isWellPreserved true for RICH', () => {
    expect(measurePreservation(RICH).isWellPreserved).toBe(true)
  })

  it('hasNoDecay true for RICH', () => {
    expect(measurePreservation(RICH).hasNoDecay).toBe(true)
  })

  it('hasNoCracking false for RICH (deepNested)', () => {
    expect(measurePreservation(RICH).hasNoCracking).toBe(false)
  })

  it('hasVascularTissue true for RICH', () => {
    expect(measurePreservation(RICH).hasVascularTissue).toBe(true)
  })

  it('hasNoErosion false for RICH (console)', () => {
    expect(measurePreservation(RICH).hasNoErosion).toBe(false)
  })

  it('hasNoWeathering true for RICH', () => {
    expect(measurePreservation(RICH).hasNoWeathering).toBe(true)
  })

  it('decayCount 0 for RICH', () => {
    expect(measurePreservation(RICH).decayCount).toBe(0)
  })

  it('erosionCount 1 for RICH', () => {
    expect(measurePreservation(RICH).erosionCount).toBe(1)
  })
})

// ─── measureMineral ────────────────────────────────────────────────────────

describe('measureMineral', () => {
  it('returns replacement 91 for RICH', () => {
    expect(measureMineral(RICH).replacement).toBe(91)
  })

  it('returns type agate for RICH', () => {
    expect(measureMineral(RICH).type).toBe('agate')
  })

  it('returns replacement 30 for EMPTY', () => {
    expect(measureMineral(EMPTY).replacement).toBe(30)
  })

  it('returns type unmineralized for EMPTY', () => {
    expect(measureMineral(EMPTY).type).toBe('unmineralized')
  })

  it('returns replacement 77 for MEDIUM', () => {
    expect(measureMineral(MEDIUM).replacement).toBe(77)
  })

  it('returns type opal for MEDIUM', () => {
    expect(measureMineral(MEDIUM).type).toBe('opal')
  })

  it('hasProperMineralization true for RICH', () => {
    expect(measureMineral(RICH).hasProperMineralization).toBe(true)
  })

  it('hasSilicaReplacement true for RICH', () => {
    expect(measureMineral(RICH).hasSilicaReplacement).toBe(true)
  })

  it('hasNoOverMineralization false for RICH', () => {
    expect(measureMineral(RICH).hasNoOverMineralization).toBe(false)
  })

  it('hasGradualTransition false for RICH (no imports)', () => {
    expect(measureMineral(RICH).hasGradualTransition).toBe(false)
  })
})

// ─── measureRings ──────────────────────────────────────────────────────────

describe('measureRings', () => {
  it('returns structure 98 for RICH', () => {
    expect(measureRings(RICH).structure).toBe(98)
  })

  it('returns pattern visible for RICH', () => {
    expect(measureRings(RICH).pattern).toBe('visible')
  })

  it('returns count 5 for RICH', () => {
    expect(measureRings(RICH).count).toBe(5)
  })

  it('returns structure 26 for EMPTY', () => {
    expect(measureRings(EMPTY).structure).toBe(26)
  })

  it('returns pattern obliterated for EMPTY', () => {
    expect(measureRings(EMPTY).pattern).toBe('obliterated')
  })

  it('returns structure 76 for MEDIUM', () => {
    expect(measureRings(MEDIUM).structure).toBe(76)
  })

  it('returns pattern distinct for MEDIUM', () => {
    expect(measureRings(MEDIUM).pattern).toBe('distinct')
  })

  it('returns count 3 for MEDIUM', () => {
    expect(measureRings(MEDIUM).count).toBe(3)
  })

  it('hasClearHistory true for RICH', () => {
    expect(measureRings(RICH).hasClearHistory).toBe(true)
  })

  it('hasNoRot false for RICH (deepNested)', () => {
    expect(measureRings(RICH).hasNoRot).toBe(false)
  })

  it('hasBurl true for RICH', () => {
    expect(measureRings(RICH).hasBurl).toBe(true)
  })
})

// ─── measureColoration ─────────────────────────────────────────────────────

describe('measureColoration', () => {
  it('returns quality 86 for RICH', () => {
    expect(measureColoration(RICH).quality).toBe(86)
  })

  it('returns palette vivid for RICH', () => {
    expect(measureColoration(RICH).palette).toBe('vivid')
  })

  it('returns quality 23 for EMPTY', () => {
    expect(measureColoration(EMPTY).quality).toBe(23)
  })

  it('returns palette bleached for EMPTY', () => {
    expect(measureColoration(EMPTY).palette).toBe('bleached')
  })

  it('returns quality 73 for MEDIUM', () => {
    expect(measureColoration(MEDIUM).quality).toBe(73)
  })

  it('returns palette warm for MEDIUM', () => {
    expect(measureColoration(MEDIUM).palette).toBe('warm')
  })

  it('isColorful true for RICH', () => {
    expect(measureColoration(RICH).isColorful).toBe(true)
  })

  it('hasNoBleaching false for RICH (console)', () => {
    expect(measureColoration(RICH).hasNoBleaching).toBe(false)
  })

  it('hasIronOxides true for RICH', () => {
    expect(measureColoration(RICH).hasIronOxides).toBe(true)
  })
})

// ─── measureFossil ─────────────────────────────────────────────────────────

describe('measureFossil', () => {
  it('returns record 98 for RICH', () => {
    expect(measureFossil(RICH).record).toBe(98)
  })

  it('returns completeness partial-skeleton for RICH', () => {
    expect(measureFossil(RICH).completeness).toBe('partial-skeleton')
  })

  it('returns record 26 for EMPTY', () => {
    expect(measureFossil(EMPTY).record).toBe(26)
  })

  it('returns completeness none for EMPTY', () => {
    expect(measureFossil(EMPTY).completeness).toBe('none')
  })

  it('returns record 83 for MEDIUM', () => {
    expect(measureFossil(MEDIUM).record).toBe(83)
  })

  it('returns completeness complete for MEDIUM', () => {
    expect(measureFossil(MEDIUM).completeness).toBe('complete')
  })

  it('hasCompleteDocumentation true for RICH', () => {
    expect(measureFossil(RICH).hasCompleteDocumentation).toBe(true)
  })

  it('hasNoContamination false for RICH (console)', () => {
    expect(measureFossil(RICH).hasNoContamination).toBe(false)
  })

  it('hasTypeSpecimen true for RICH', () => {
    expect(measureFossil(RICH).hasTypeSpecimen).toBe(true)
  })
})

// ─── measureAge ────────────────────────────────────────────────────────────

describe('measureAge', () => {
  it('returns depth 98 for RICH', () => {
    expect(measureAge(RICH).depth).toBe(98)
  })

  it('returns era paleozoic for RICH', () => {
    expect(measureAge(RICH).era).toBe('paleozoic')
  })

  it('returns depth 26 for EMPTY', () => {
    expect(measureAge(EMPTY).depth).toBe(26)
  })

  it('returns era holocene for EMPTY', () => {
    expect(measureAge(EMPTY).era).toBe('holocene')
  })

  it('returns depth 76 for MEDIUM', () => {
    expect(measureAge(MEDIUM).depth).toBe(76)
  })

  it('returns era mesozoic for MEDIUM', () => {
    expect(measureAge(MEDIUM).era).toBe('mesozoic')
  })

  it('isMature true for RICH', () => {
    expect(measureAge(RICH).isMature).toBe(true)
  })

  it('hasExtinctionEvent true for RICH (tryCatch)', () => {
    expect(measureAge(RICH).hasExtinctionEvent).toBe(true)
  })

  it('hasNoAnachronism false for RICH (console)', () => {
    expect(measureAge(RICH).hasNoAnachronism).toBe(false)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns national-monument for qualityScore >= 80', () => {
    expect(classifyCondition({ qualityScore: 94 } as any)).toBe('national-monument')
  })

  it('returns museum-piece for qualityScore >= 65', () => {
    expect(classifyCondition({ qualityScore: 70 } as any)).toBe('museum-piece')
  })

  it('returns specimen for qualityScore >= 50', () => {
    expect(classifyCondition({ qualityScore: 55 } as any)).toBe('specimen')
  })

  it('returns fragment for qualityScore >= 35', () => {
    expect(classifyCondition({ qualityScore: 40 } as any)).toBe('fragment')
  })

  it('returns shard for qualityScore >= 20', () => {
    expect(classifyCondition({ qualityScore: 25 } as any)).toBe('shard')
  })

  it('returns dust for qualityScore < 20', () => {
    expect(classifyCondition({ qualityScore: 10 } as any)).toBe('dust')
  })
})

// ─── analyzePetrifiedLog ───────────────────────────────────────────────────

describe('analyzePetrifiedLog', () => {
  it('returns qualityScore 94 for RICH', () => {
    expect(analyzePetrifiedLog(RICH, 'rich.ts').qualityScore).toBe(94)
  })

  it('returns national-monument condition for RICH', () => {
    expect(analyzePetrifiedLog(RICH, 'rich.ts').condition).toBe('national-monument')
  })

  it('returns shard condition for EMPTY', () => {
    expect(analyzePetrifiedLog(EMPTY, 'empty.ts').condition).toBe('shard')
  })

  it('returns museum-piece condition for MEDIUM', () => {
    expect(analyzePetrifiedLog(MEDIUM, 'medium.ts').condition).toBe('museum-piece')
  })

  it('stores correct file path', () => {
    expect(analyzePetrifiedLog(RICH, 'my-file.ts').file).toBe('my-file.ts')
  })
})

// ─── classifyBedType ───────────────────────────────────────────────────────

describe('classifyBedType', () => {
  it('returns beach for empty array', () => {
    expect(classifyBedType([])).toBe('beach')
  })

  it('returns national-park for high quality with monuments', () => {
    const logs = Array.from({ length: 5 }, () => ({ qualityScore: 90, condition: 'national-monument' } as any))
    expect(classifyBedType(logs)).toBe('national-park')
  })

  it('returns geological-reserve for avgQuality >= 60', () => {
    expect(classifyBedType([{ qualityScore: 64, condition: 'museum-piece' } as any])).toBe('geological-reserve')
  })

  it('returns quarry for avgQuality >= 45', () => {
    expect(classifyBedType([{ qualityScore: 50, condition: 'specimen' } as any])).toBe('quarry')
  })
})

// ─── classifyBedCondition ──────────────────────────────────────────────────

describe('classifyBedCondition', () => {
  it('returns unesco-site for >= 80', () => {
    expect(classifyBedCondition(85)).toBe('unesco-site')
  })

  it('returns protected-monument for >= 65', () => {
    expect(classifyBedCondition(70)).toBe('protected-monument')
  })

  it('returns open-collection for >= 50', () => {
    expect(classifyBedCondition(55)).toBe('open-collection')
  })

  it('returns eroded-plain for < 20', () => {
    expect(classifyBedCondition(10)).toBe('eroded-plain')
  })
})

// ─── classifyPaleontologistGrade ────────────────────────────────────────────

describe('classifyPaleontologistGrade', () => {
  it('returns curator for >= 80', () => {
    expect(classifyPaleontologistGrade(85)).toBe('curator')
  })

  it('returns paleontologist for >= 65', () => {
    expect(classifyPaleontologistGrade(70)).toBe('paleontologist')
  })

  it('returns tourist for < 20', () => {
    expect(classifyPaleontologistGrade(10)).toBe('tourist')
  })
})

// ─── analyzeFossilBed ──────────────────────────────────────────────────────

describe('analyzeFossilBed', () => {
  it('returns beach for empty logs', () => {
    const result = analyzeFossilBed([], 'empty-dir')
    expect(result.bedType).toBe('beach')
    expect(result.condition).toBe('eroded-plain')
    expect(result.logs).toHaveLength(0)
  })

  it('computes correct averages for single log', () => {
    const log = analyzePetrifiedLog(RICH, 'rich.ts')
    const result = analyzeFossilBed([log], 'src')
    expect(result.avgPreservation).toBe(90)
    expect(result.monumentCount).toBe(1)
    expect(result.preservedCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns praise when all averages are high', () => {
    const stats = {
      avgWoodPreservation: 90, avgMineralReplacement: 91, avgRingStructure: 98,
      avgColorationQuality: 86, avgFossilRecord: 98, avgGeologicalAge: 98,
      dustCount: 0, isWellPreservedCount: 1,
    } as any
    const recs = generateRecommendations([], [], { overallPreservation: 90 } as any, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('Outstanding')
  })

  it('suggests improving preservation when low', () => {
    const stats = {
      avgWoodPreservation: 30, avgMineralReplacement: 80, avgRingStructure: 80,
      avgColorationQuality: 80, avgFossilRecord: 80, avgGeologicalAge: 80,
      dustCount: 0, isWellPreservedCount: 1,
    } as any
    const recs = generateRecommendations([], [], { overallPreservation: 80 } as any, stats)
    expect(recs.some((r) => r.includes('preservation'))).toBe(true)
  })
})

// ─── buildPetrifiedForestResult ─────────────────────────────────────────────

describe('buildPetrifiedForestResult', () => {
  it('returns empty result for no files', () => {
    const result = buildPetrifiedForestResult([], [])
    expect(result.logs).toHaveLength(0)
    expect(result.beds).toHaveLength(0)
    expect(result.formation.overallPreservation).toBe(0)
    expect(result.formation.isPreserved).toBe(false)
  })

  it('analyzes single RICH file correctly', () => {
    const result = buildPetrifiedForestResult(['rich.ts'], [RICH])
    expect(result.logs).toHaveLength(1)
    expect(result.logs[0].qualityScore).toBe(94)
    expect(result.logs[0].condition).toBe('national-monument')
    expect(result.stats.nationalMonumentCount).toBe(1)
    expect(result.stats.isMatureCount).toBe(1)
  })

  it('computes correct 3-file mix overall values', () => {
    const result = buildPetrifiedForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )

    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalBeds).toBe(1)
    expect(result.formation.overallPreservation).toBe(67)
    expect(result.formation.isPreserved).toBe(true)
    expect(result.formation.avgPreservation).toBe(72)
    expect(result.formation.avgMineral).toBe(66)
    expect(result.formation.avgAge).toBe(67)

    expect(result.stats.avgWoodPreservation).toBe(72)
    expect(result.stats.avgMineralReplacement).toBe(66)
    expect(result.stats.avgRingStructure).toBe(67)
    expect(result.stats.avgColorationQuality).toBe(61)
    expect(result.stats.avgFossilRecord).toBe(69)
    expect(result.stats.avgGeologicalAge).toBe(67)

    expect(result.stats.nationalMonumentCount).toBe(1)
    expect(result.stats.museumPieceCount).toBe(1)
    expect(result.stats.shardCount).toBe(1)

    expect(result.stats.isWellPreservedCount).toBe(2)
    expect(result.stats.hasProperMineralizationCount).toBe(2)
    expect(result.stats.hasClearHistoryCount).toBe(2)
    expect(result.stats.isColorfulCount).toBe(1)
    expect(result.stats.hasCompleteDocumentationCount).toBe(2)
    expect(result.stats.isMatureCount).toBe(1)

    expect(result.stats.paleontologistGrade).toBe('paleontologist')
    expect(result.stats.bestLog).toBe('src/rich.ts')
    expect(result.stats.bestPreserved).toBe('src/rich.ts')
    expect(result.stats.bestMineralized).toBe('src/rich.ts')
    expect(result.stats.oldestHistory).toBe('src/rich.ts')
    expect(result.stats.mostColorful).toBe('src/rich.ts')
    expect(result.stats.bestDocumented).toBe('src/rich.ts')

    expect(result.beds).toHaveLength(1)
    expect(result.beds[0].bedType).toBe('geological-reserve')
    expect(result.beds[0].condition).toBe('protected-monument')
  })

  it('creates separate beds for different directories', () => {
    const result = buildPetrifiedForestResult(
      ['src/a.ts', 'lib/b.ts'],
      [RICH, EMPTY],
    )
    expect(result.beds).toHaveLength(2)
  })
})

// ─── format-helpers ────────────────────────────────────────────────────────

describe('format-helpers', () => {
  it('scoreColor returns string for any score', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
  })

  it('conditionColor handles all conditions', () => {
    expect(typeof conditionColor('national-monument')).toBe('string')
    expect(typeof conditionColor('museum-piece')).toBe('string')
    expect(typeof conditionColor('specimen')).toBe('string')
    expect(typeof conditionColor('fragment')).toBe('string')
    expect(typeof conditionColor('shard')).toBe('string')
    expect(typeof conditionColor('dust')).toBe('string')
    expect(typeof conditionColor('unknown')).toBe('string')
  })

  it('gradeColor handles all grades', () => {
    expect(typeof gradeColor('curator')).toBe('string')
    expect(typeof gradeColor('paleontologist')).toBe('string')
    expect(typeof gradeColor('geologist')).toBe('string')
    expect(typeof gradeColor('collector')).toBe('string')
    expect(typeof gradeColor('rockhound')).toBe('string')
    expect(typeof gradeColor('tourist')).toBe('string')
  })

  it('bedTypeColor handles all types', () => {
    expect(typeof bedTypeColor('national-park')).toBe('string')
    expect(typeof bedTypeColor('geological-reserve')).toBe('string')
    expect(typeof bedTypeColor('quarry')).toBe('string')
    expect(typeof bedTypeColor('roadside')).toBe('string')
    expect(typeof bedTypeColor('wasteland')).toBe('string')
    expect(typeof bedTypeColor('beach')).toBe('string')
  })

  it('formatPetrifiedForestJson returns valid JSON', () => {
    const result = buildPetrifiedForestResult(['test.ts'], [RICH])
    const json = formatPetrifiedForestJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.logs).toHaveLength(1)
  })

  it('formatPetrifiedForestTable returns string with sections', () => {
    const result = buildPetrifiedForestResult(['test.ts'], [RICH])
    const table = formatPetrifiedForestTable(result, false)
    expect(table).toContain('Petrified Forest Analysis')
    expect(table).toContain('Formation Overview')
    expect(table).toContain('Statistics')
  })

  it('formatPetrifiedForestTable includes per-log breakdown when verbose', () => {
    const result = buildPetrifiedForestResult(['test.ts'], [RICH])
    const table = formatPetrifiedForestTable(result, true)
    expect(table).toContain('Per-Log Breakdown')
  })

  it('formatPetrifiedForestTable omits per-log when not verbose', () => {
    const result = buildPetrifiedForestResult(['test.ts'], [RICH])
    const table = formatPetrifiedForestTable(result, false)
    expect(table).not.toContain('Per-Log Breakdown')
  })

  it('formatPetrifiedForestTable shows recommendations', () => {
    const result = buildPetrifiedForestResult(['test.ts'], [RICH])
    const table = formatPetrifiedForestTable(result, false)
    expect(table).toContain('Recommendations')
  })

  it('formatPetrifiedForestTable shows beds', () => {
    const result = buildPetrifiedForestResult(['src/test.ts'], [RICH])
    const table = formatPetrifiedForestTable(result, false)
    expect(table).toContain('Fossil Beds')
  })
})
