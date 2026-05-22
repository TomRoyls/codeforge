import { describe, expect, it } from 'vitest'

import {
  analyzeForgeArmory,
  analyzeHammerBlow,
  buildForgeHammerResult,
  classifyArmoryCondition,
  classifyArmoryType,
  classifyCondition,
  classifySmithGrade,
  generateRecommendations,
  measureBlade,
  measureEdge,
  measurePrecision,
  measureTechnique,
  measureTemper,
  measureWeight,
} from '../src/commands/forge-hammer-helpers.js'
import {
  conditionColor,
  formatForgeHammerJson,
  formatForgeHammerTable,
  gradeColor,
  scoreColor,
  weightClassColor,
} from '../src/commands/forge-hammer-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const RICH = `/**
 * Elegant calligraphy module
 */
export interface Stroke {
  quality: number
  inkDensity: number
}

export class CalligraphyMaster<T extends Stroke> {
  private strokes: T[] = []
  private static readonly MAX_STROKES = 100

  constructor(private readonly brush: string) {}

  async paint(stroke: T): Promise<void> {
    try {
      if (stroke.quality > 0) {
        this.strokes.push(stroke)
      }
    } catch {
      this.handleError()
    }
  }

  private handleError(): void {
    console.error('Paint failed')
  }
}

export type InkType = 'sumi' | 'bokushu'
export enum BrushGrade { Master, Adept, Novice }
export function createStroke(quality: number): Stroke {
  return { quality, inkDensity: quality * 0.8 }
}
export { CalligraphyMaster }
export type { Stroke as BrushStroke }
`

const EMPTY = ''
const MEDIUM = `function hello(name) {
  var x = 1
  if (name) {
    console.log(x)
  }
}
`

// ─── measureWeight ──────────────────────────────────────────────────────────

describe('measureWeight', () => {
  it('RICH: impact=91, class=engineer, hasProperWeight=true', () => {
    const result = measureWeight(RICH)
    expect(result.impact).toBe(91)
    expect(result.class).toBe('engineer')
    expect(result.hasProperWeight).toBe(true)
    expect(result.hasHeavyImpact).toBe(true)
  })

  it('RICH: overstrike=0, mishit=1', () => {
    const result = measureWeight(RICH)
    expect(result.overstrikeCount).toBe(0)
    expect(result.mishitCount).toBe(1)
  })

  it('RICH: hasNoOverstriking=true, hasNoMishit=false', () => {
    const result = measureWeight(RICH)
    expect(result.hasNoOverstriking).toBe(true)
    expect(result.hasNoMishit).toBe(false)
  })

  it('EMPTY: impact=38, class=tack', () => {
    const result = measureWeight(EMPTY)
    expect(result.impact).toBe(38)
    expect(result.class).toBe('tack')
    expect(result.hasProperWeight).toBe(false)
  })

  it('MEDIUM: impact=44, class=tack', () => {
    const result = measureWeight(MEDIUM)
    expect(result.impact).toBe(44)
    expect(result.class).toBe('tack')
  })
})

// ─── measurePrecision ───────────────────────────────────────────────────────

describe('measurePrecision', () => {
  it('RICH: accuracy=88, aim=on-target', () => {
    const result = measurePrecision(RICH)
    expect(result.accuracy).toBe(88)
    expect(result.aim).toBe('on-target')
    expect(result.hasHighPrecision).toBe(true)
  })

  it('RICH: miss=0, hasNoMisses=true', () => {
    const result = measurePrecision(RICH)
    expect(result.missCount).toBe(0)
    expect(result.hasNoMisses).toBe(true)
  })

  it('EMPTY: accuracy=35, aim=wild', () => {
    const result = measurePrecision(EMPTY)
    expect(result.accuracy).toBe(35)
    expect(result.aim).toBe('wild')
  })

  it('MEDIUM: accuracy=41, aim=wild', () => {
    const result = measurePrecision(MEDIUM)
    expect(result.accuracy).toBe(41)
    expect(result.aim).toBe('wild')
  })
})

// ─── measureTemper ──────────────────────────────────────────────────────────

describe('measureTemper', () => {
  it('RICH: resilience=90, grade=carbon-steel', () => {
    const result = measureTemper(RICH)
    expect(result.resilience).toBe(90)
    expect(result.grade).toBe('carbon-steel')
    expect(result.hasProperTemper).toBe(true)
  })

  it('RICH: hasElasticRecovery=true (tryCatch)', () => {
    const result = measureTemper(RICH)
    expect(result.hasElasticRecovery).toBe(true)
  })

  it('EMPTY: resilience=30, grade=clay', () => {
    const result = measureTemper(EMPTY)
    expect(result.resilience).toBe(30)
    expect(result.grade).toBe('clay')
  })

  it('MEDIUM: resilience=35, grade=wrought-iron', () => {
    const result = measureTemper(MEDIUM)
    expect(result.resilience).toBe(35)
    expect(result.grade).toBe('wrought-iron')
  })
})

// ─── measureEdge ────────────────────────────────────────────────────────────

describe('measureEdge', () => {
  it('RICH: quality=88, retention=steel', () => {
    const result = measureEdge(RICH)
    expect(result.quality).toBe(88)
    expect(result.retention).toBe('steel')
    expect(result.hasLongEdge).toBe(true)
  })

  it('RICH: hasNoDulling=false (private=4)', () => {
    const result = measureEdge(RICH)
    expect(result.dullingCount).toBe(4)
    expect(result.hasNoDulling).toBe(false)
  })

  it('EMPTY: quality=37, retention=tin', () => {
    const result = measureEdge(EMPTY)
    expect(result.quality).toBe(37)
    expect(result.retention).toBe('tin')
  })

  it('MEDIUM: quality=43, retention=tin', () => {
    const result = measureEdge(MEDIUM)
    expect(result.quality).toBe(43)
    expect(result.retention).toBe('tin')
  })
})

// ─── measureTechnique ───────────────────────────────────────────────────────

describe('measureTechnique', () => {
  it('RICH: craftsmanship=87, method=folding', () => {
    const result = measureTechnique(RICH)
    expect(result.craftsmanship).toBe(87)
    expect(result.method).toBe('folding')
    expect(result.hasHighCraftsmanship).toBe(true)
  })

  it('RICH: hasMasterwork=false (deepNested=1)', () => {
    const result = measureTechnique(RICH)
    expect(result.hasMasterwork).toBe(false)
    expect(result.sloppyCount).toBe(2)
  })

  it('EMPTY: craftsmanship=46, method=stamping', () => {
    const result = measureTechnique(EMPTY)
    expect(result.craftsmanship).toBe(46)
    expect(result.method).toBe('stamping')
  })

  it('MEDIUM: craftsmanship=51, method=stamping', () => {
    const result = measureTechnique(MEDIUM)
    expect(result.craftsmanship).toBe(51)
    expect(result.method).toBe('stamping')
  })
})

// ─── measureBlade ───────────────────────────────────────────────────────────

describe('measureBlade', () => {
  it('RICH: quality=88, grade=masterwork', () => {
    const result = measureBlade(RICH)
    expect(result.quality).toBe(88)
    expect(result.grade).toBe('masterwork')
    expect(result.hasHighQuality).toBe(true)
  })

  it('RICH: hasNoFlaws=true, hasNoWeakness=false', () => {
    const result = measureBlade(RICH)
    expect(result.hasNoFlaws).toBe(true)
    expect(result.hasNoWeakness).toBe(false)
    expect(result.weaknessCount).toBe(2)
  })

  it('EMPTY: quality=30, grade=scrap', () => {
    const result = measureBlade(EMPTY)
    expect(result.quality).toBe(30)
    expect(result.grade).toBe('scrap')
  })

  it('MEDIUM: quality=38, grade=crude', () => {
    const result = measureBlade(MEDIUM)
    expect(result.quality).toBe(38)
    expect(result.grade).toBe('crude')
  })
})

// ─── analyzeHammerBlow ──────────────────────────────────────────────────────

describe('analyzeHammerBlow', () => {
  it('RICH: qualityScore=89, condition=excalibur', () => {
    const result = analyzeHammerBlow(RICH, 'test.ts')
    expect(result.qualityScore).toBe(89)
    expect(result.condition).toBe('excalibur')
  })

  it('RICH: all six measures present', () => {
    const result = analyzeHammerBlow(RICH, 'test.ts')
    expect(result.hammerWeight).toBe(91)
    expect(result.strikePrecision).toBe(88)
    expect(result.metalTemper).toBe(90)
    expect(result.edgeQuality).toBe(88)
    expect(result.forgingTechnique).toBe(87)
    expect(result.bladeQuality).toBe(88)
  })

  it('EMPTY: qualityScore=36, condition=serviceable-tool', () => {
    const result = analyzeHammerBlow(EMPTY, 'empty.ts')
    expect(result.qualityScore).toBe(36)
    expect(result.condition).toBe('serviceable-tool')
  })

  it('MEDIUM: qualityScore=42, condition=serviceable-tool', () => {
    const result = analyzeHammerBlow(MEDIUM, 'med.ts')
    expect(result.qualityScore).toBe(42)
    expect(result.condition).toBe('serviceable-tool')
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('>=80: excalibur', () => {
    const blow = analyzeHammerBlow(RICH, 'test.ts')
    expect(classifyCondition(blow)).toBe('excalibur')
  })

  it('>=65: masterwork-blade', () => {
    expect(classifyCondition({ qualityScore: 70 } as any)).toBe('masterwork-blade')
  })

  it('>=50: fine-weapon', () => {
    expect(classifyCondition({ qualityScore: 55 } as any)).toBe('fine-weapon')
  })

  it('>=35: serviceable-tool', () => {
    expect(classifyCondition({ qualityScore: 40 } as any)).toBe('serviceable-tool')
  })

  it('>=20: rusty-nail', () => {
    expect(classifyCondition({ qualityScore: 25 } as any)).toBe('rusty-nail')
  })

  it('<20: scrap-metal', () => {
    expect(classifyCondition({ qualityScore: 10 } as any)).toBe('scrap-metal')
  })
})

// ─── classifySmithGrade ─────────────────────────────────────────────────────

describe('classifySmithGrade', () => {
  it('>=80: legendary-smith', () => expect(classifySmithGrade(85)).toBe('legendary-smith'))
  it('>=65: master-smith', () => expect(classifySmithGrade(70)).toBe('master-smith'))
  it('>=50: journeyman', () => expect(classifySmithGrade(55)).toBe('journeyman'))
  it('>=35: apprentice', () => expect(classifySmithGrade(40)).toBe('apprentice'))
  it('>=20: novice', () => expect(classifySmithGrade(25)).toBe('novice'))
  it('<20: vandal', () => expect(classifySmithGrade(10)).toBe('vandal'))
})

// ─── classifyArmoryType ─────────────────────────────────────────────────────

describe('classifyArmoryType', () => {
  it('empty: ruins', () => expect(classifyArmoryType([])).toBe('ruins'))

  it('high quality: royal-armory', () => {
    const blows = [
      analyzeHammerBlow(RICH, 'a.ts'),
      analyzeHammerBlow(RICH, 'b.ts'),
      analyzeHammerBlow(RICH, 'c.ts'),
    ]
    expect(classifyArmoryType(blows)).toBe('royal-armory')
  })

  it('medium quality: field-forge', () => {
    const blows = [analyzeHammerBlow(MEDIUM, 'm.ts')]
    expect(classifyArmoryType(blows)).toBe('field-forge')
  })
})

// ─── classifyArmoryCondition ────────────────────────────────────────────────

describe('classifyArmoryCondition', () => {
  it('>=80: legendary-armory', () => expect(classifyArmoryCondition(85)).toBe('legendary-armory'))
  it('>=65: well-stocked', () => expect(classifyArmoryCondition(70)).toBe('well-stocked'))
  it('>=50: functional', () => expect(classifyArmoryCondition(55)).toBe('functional'))
  it('>=35: basic', () => expect(classifyArmoryCondition(40)).toBe('basic'))
  it('>=20: depleted', () => expect(classifyArmoryCondition(25)).toBe('depleted'))
  it('<20: empty', () => expect(classifyArmoryCondition(10)).toBe('empty'))
})

// ─── analyzeForgeArmory ─────────────────────────────────────────────────────

describe('analyzeForgeArmory', () => {
  it('empty: returns zeroed armory', () => {
    const armory = analyzeForgeArmory([], 'src')
    expect(armory.blows).toHaveLength(0)
    expect(armory.avgImpact).toBe(0)
    expect(armory.armoryType).toBe('ruins')
    expect(armory.condition).toBe('empty')
  })

  it('RICH: returns armory with high values', () => {
    const blows = [analyzeHammerBlow(RICH, 'src/a.ts')]
    const armory = analyzeForgeArmory(blows, 'src')
    expect(armory.avgImpact).toBe(91)
    expect(armory.avgPrecision).toBe(88)
    expect(armory.avgQuality).toBe(88)
    expect(armory.excaliburCount).toBe(1)
    expect(armory.scrapCount).toBe(0)
    expect(armory.heavyImpactCount).toBe(1)
    expect(armory.highPrecisionCount).toBe(1)
  })
})

// ─── buildForgeHammerResult ─────────────────────────────────────────────────

describe('buildForgeHammerResult', () => {
  it('RICH: returns full result with correct values', () => {
    const result = buildForgeHammerResult(['test.ts'], [RICH])
    expect(result.blows).toHaveLength(1)
    expect(result.armories).toHaveLength(1)
    expect(result.forge.overallQuality).toBe(89)
    expect(result.forge.isLegendary).toBe(true)
    expect(result.forge.avgImpact).toBe(91)
    expect(result.forge.avgPrecision).toBe(88)
    expect(result.forge.avgQuality).toBe(88)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.smithGrade).toBe('legendary-smith')
  })

  it('EMPTY: returns low-score result', () => {
    const result = buildForgeHammerResult(['empty.ts'], [EMPTY])
    expect(result.blows).toHaveLength(1)
    expect(result.forge.overallQuality).toBe(36)
    expect(result.forge.isLegendary).toBe(false)
    expect(result.stats.smithGrade).toBe('apprentice')
  })

  it('MEDIUM: returns mid-range result', () => {
    const result = buildForgeHammerResult(['med.ts'], [MEDIUM])
    expect(result.blows).toHaveLength(1)
    expect(result.forge.overallQuality).toBe(42)
    expect(result.stats.smithGrade).toBe('apprentice')
  })

  it('empty input: returns zeroed result', () => {
    const result = buildForgeHammerResult([], [])
    expect(result.blows).toHaveLength(0)
    expect(result.armories).toHaveLength(0)
    expect(result.forge.overallQuality).toBe(0)
    expect(result.forge.isLegendary).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.smithGrade).toBe('vandal')
    expect(result.stats.bestBlow).toBe('')
  })

  it('multi-file: groups by directory correctly', () => {
    const result = buildForgeHammerResult(
      ['src/app.ts', 'src/utils.ts', 'src/med.ts'],
      [RICH, RICH, MEDIUM],
    )
    expect(result.blows).toHaveLength(3)
    expect(result.armories).toHaveLength(1)
    expect(result.armories[0].armoryType).toBe('guild-armory')
    expect(result.forge.overallQuality).toBe(73)
    expect(result.forge.isLegendary).toBe(true)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.excaliburCount).toBe(2)
    expect(result.stats.serviceableToolCount).toBe(1)
    expect(result.stats.hasProperWeightCount).toBe(2)
    expect(result.stats.hasHighPrecisionCount).toBe(2)
    expect(result.stats.hasProperTemperCount).toBe(2)
    expect(result.stats.hasLongEdgeCount).toBe(2)
    expect(result.stats.hasHighCraftsmanshipCount).toBe(2)
    expect(result.stats.hasHighQualityCount).toBe(2)
    expect(result.stats.smithGrade).toBe('master-smith')
    expect(result.stats.avgHammerWeight).toBe(75)
    expect(result.stats.avgStrikePrecision).toBe(72)
    expect(result.stats.avgMetalTemper).toBe(Math.round((90 + 90 + 35) / 3))
    expect(result.stats.avgEdgeQuality).toBe(Math.round((88 + 88 + 43) / 3))
    expect(result.stats.avgForgingTechnique).toBe(Math.round((87 + 87 + 51) / 3))
    expect(result.stats.avgBladeQuality).toBe(Math.round((88 + 88 + 38) / 3))
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns improvement recs for empty code', () => {
    const result = buildForgeHammerResult(['test.ts'], [EMPTY])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(5)
    const hasWeight = result.recommendations.some((r) => r.includes('weight'))
    expect(hasWeight).toBe(true)
  })

  it('returns multiple recs for medium code', () => {
    const result = buildForgeHammerResult(['test.ts'], [MEDIUM])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(2)
    const hasPrecision = result.recommendations.some((r) => r.includes('precision'))
    expect(hasPrecision).toBe(true)
  })

  it('returns legendary for RICH code', () => {
    const result = buildForgeHammerResult(['test.ts'], [RICH])
    const hasLegendary = result.recommendations.some((r) => r.includes('Legendary'))
    expect(hasLegendary).toBe(true)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns string for all ranges', () => {
    expect(scoreColor(90)).toBeTruthy()
    expect(scoreColor(70)).toBeTruthy()
    expect(scoreColor(50)).toBeTruthy()
    expect(scoreColor(30)).toBeTruthy()
  })

  it('conditionColor handles all conditions', () => {
    expect(conditionColor('excalibur')).toBeTruthy()
    expect(conditionColor('masterwork-blade')).toBeTruthy()
    expect(conditionColor('fine-weapon')).toBeTruthy()
    expect(conditionColor('serviceable-tool')).toBeTruthy()
    expect(conditionColor('rusty-nail')).toBeTruthy()
    expect(conditionColor('scrap-metal')).toBeTruthy()
  })

  it('gradeColor handles all grades', () => {
    expect(gradeColor('legendary-smith')).toBeTruthy()
    expect(gradeColor('master-smith')).toBeTruthy()
    expect(gradeColor('journeyman')).toBeTruthy()
    expect(gradeColor('apprentice')).toBeTruthy()
    expect(gradeColor('novice')).toBeTruthy()
    expect(gradeColor('vandal')).toBeTruthy()
  })

  it('weightClassColor handles all classes', () => {
    expect(weightClassColor('sledge')).toBeTruthy()
    expect(weightClassColor('engineer')).toBeTruthy()
    expect(weightClassColor('cross-peen')).toBeTruthy()
    expect(weightClassColor('ball-peen')).toBeTruthy()
    expect(weightClassColor('tack')).toBeTruthy()
    expect(weightClassColor('feather')).toBeTruthy()
  })

  it('formatForgeHammerJson returns valid JSON', () => {
    const result = buildForgeHammerResult(['test.ts'], [RICH])
    const json = formatForgeHammerJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.blows).toHaveLength(1)
  })

  it('formatForgeHammerTable returns formatted string', () => {
    const result = buildForgeHammerResult(['test.ts'], [RICH])
    const table = formatForgeHammerTable(result, false)
    expect(table).toContain('Forge Hammer Analysis')
    expect(table).toContain('Forge Overview')
    expect(table).toContain('Overall Quality')
    expect(table).toContain('Is Legendary')
  })

  it('shows verbose blow details', () => {
    const result = buildForgeHammerResult(['test.ts'], [MEDIUM])
    const table = formatForgeHammerTable(result, true)
    expect(table).toContain('tack')
    expect(table).toContain('wild')
    expect(table).toContain('wrought-iron')
    expect(table).toContain('tin')
    expect(table).toContain('stamping')
    expect(table).toContain('crude')
  })

  it('handles empty result table', () => {
    const result = buildForgeHammerResult([], [])
    const table = formatForgeHammerTable(result, false)
    expect(table).toContain('Forge Hammer Analysis')
    expect(table).toContain('Statistics')
  })

  it('shows smith grade in table', () => {
    const result = buildForgeHammerResult(['test.ts'], [RICH])
    const table = formatForgeHammerTable(result, false)
    expect(table).toContain('legendary-smith')
  })

  it('includes condition counts in table', () => {
    const result = buildForgeHammerResult(['test.ts'], [EMPTY])
    const table = formatForgeHammerTable(result, false)
    expect(table).toContain('Serviceable Tool')
    expect(table).toContain('1')
  })
})
