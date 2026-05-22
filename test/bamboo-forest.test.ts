import { describe, it, expect } from 'vitest'

import {
  measureCulm,
  measureJoint,
  measureGrowth,
  measureRoot,
  measureHollow,
  measureWind,
  classifyCondition,
  analyzeBambooCulm,
  analyzeForestGrove,
  classifyGroveType,
  classifyGroveCondition,
  classifyGardenerGrade,
  generateRecommendations,
  buildBambooForestResult,
} from '../src/commands/bamboo-forest-helpers.js'

import {
  scoreColor,
  conditionColor,
  gradeColor,
  culmGradeColor,
  sealColor,
  speedColor,
  systemColor,
  designColor,
  flexColor,
  groveTypeColor,
  formatBambooForestJson,
  formatBambooForestTable,
} from '../src/commands/bamboo-forest-format-helpers.js'

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

// ─── measureCulm ───────────────────────────────────────────────

describe('measureCulm', () => {
  it('measures rich content', () => {
    const result = measureCulm(RICH)
    expect(result.strength).toBe(78)
    expect(result.grade).toBe('golden')
    expect(result.hasHighStrength).toBe(true)
    expect(result.hasProperWall).toBe(true)
    expect(result.hasNoCracks).toBe(false)
    expect(result.hasFiberStrength).toBe(false)
    expect(result.hasNoSplitting).toBe(true)
    expect(result.hasDense).toBe(true)
    expect(result.hasNoRot).toBe(true)
    expect(result.hasProperNodes).toBe(true)
    expect(result.hasLignin).toBe(true)
    expect(result.hasNoInfestation).toBe(true)
    expect(result.crackCount).toBe(1)
    expect(result.rotCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureCulm(EMPTY)
    expect(result.strength).toBe(40)
    expect(result.grade).toBe('tender')
    expect(result.hasHighStrength).toBe(false)
    expect(result.crackCount).toBe(0)
  })

  it('measures medium content', () => {
    const result = measureCulm(MEDIUM)
    expect(result.strength).toBe(45)
    expect(result.grade).toBe('tender')
  })
})

// ─── measureJoint ──────────────────────────────────────────────

describe('measureJoint', () => {
  it('measures rich content', () => {
    const result = measureJoint(RICH)
    expect(result.quality).toBe(57)
    expect(result.seal).toBe('loose')
    expect(result.hasHighQuality).toBe(false)
    expect(result.hasCleanConnection).toBe(false)
    expect(result.hasProperMembrane).toBe(true)
    expect(result.hasNoLeakage).toBe(true)
    expect(result.hasStrongBond).toBe(false)
    expect(result.hasNoWeakPoint).toBe(true)
    expect(result.hasFlexible).toBe(false)
    expect(result.hasNoRigidity).toBe(true)
    expect(result.hasProperAlignment).toBe(false)
    expect(result.hasNoMisalignment).toBe(true)
    expect(result.leakageCount).toBe(0)
    expect(result.weakPointCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureJoint(EMPTY)
    expect(result.quality).toBe(40)
    expect(result.seal).toBe('gaping')
    expect(result.hasHighQuality).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureJoint(MEDIUM)
    expect(result.quality).toBe(45)
    expect(result.seal).toBe('gaping')
  })
})

// ─── measureGrowth ─────────────────────────────────────────────

describe('measureGrowth', () => {
  it('measures rich content', () => {
    const result = measureGrowth(RICH)
    expect(result.rate).toBe(90)
    expect(result.speed).toBe('rapid')
    expect(result.hasHighRate).toBe(true)
    expect(result.hasNewShoots).toBe(true)
    expect(result.hasProperSpacing).toBe(true)
    expect(result.hasNoStunting).toBe(true)
    expect(result.hasRhizome).toBe(true)
    expect(result.hasNoCongestion).toBe(true)
    expect(result.hasSeasonalGrowth).toBe(false)
    expect(result.hasNoPremature).toBe(true)
    expect(result.hasBranching).toBe(true)
    expect(result.hasNoOvergrowth).toBe(true)
    expect(result.stuntingCount).toBe(0)
    expect(result.congestionCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureGrowth(EMPTY)
    expect(result.rate).toBe(50)
    expect(result.speed).toBe('dormant')
    expect(result.hasHighRate).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureGrowth(MEDIUM)
    expect(result.rate).toBe(55)
    expect(result.speed).toBe('dormant')
  })
})

// ─── measureRoot ───────────────────────────────────────────────

describe('measureRoot', () => {
  it('measures rich content', () => {
    const result = measureRoot(RICH)
    expect(result.depth).toBe(78)
    expect(result.system).toBe('extensive')
    expect(result.hasHighDepth).toBe(true)
    expect(result.hasStrongAnchor).toBe(true)
    expect(result.hasProperSpread).toBe(false)
    expect(result.hasNoRootRot).toBe(true)
    expect(result.hasMycorrhiza).toBe(false)
    expect(result.hasNoCompetition).toBe(true)
    expect(result.hasWaterAccess).toBe(true)
    expect(result.hasNoGirdling).toBe(true)
    expect(result.hasNutrientCycling).toBe(true)
    expect(result.hasNoDepletion).toBe(true)
    expect(result.rootRotCount).toBe(0)
    expect(result.girdlingCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureRoot(EMPTY)
    expect(result.depth).toBe(40)
    expect(result.system).toBe('surface')
    expect(result.hasHighDepth).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureRoot(MEDIUM)
    expect(result.depth).toBe(45)
    expect(result.system).toBe('surface')
  })
})

// ─── measureHollow ─────────────────────────────────────────────

describe('measureHollow', () => {
  it('measures rich content', () => {
    const result = measureHollow(RICH)
    expect(result.efficiency).toBe(79)
    expect(result.design).toBe('efficient')
    expect(result.hasHighEfficiency).toBe(true)
    expect(result.hasProperDiameter).toBe(true)
    expect(result.hasNoExcess).toBe(true)
    expect(result.hasLightweight).toBe(true)
    expect(result.hasNoOverfill).toBe(true)
    expect(result.hasStructural).toBe(true)
    expect(result.hasNoRedundancy).toBe(false)
    expect(result.hasAirFlow).toBe(false)
    expect(result.hasNoBlockage).toBe(true)
    expect(result.hasDiaphragm).toBe(true)
    expect(result.excessCount).toBe(0)
    expect(result.redundancyCount).toBe(1)
  })

  it('measures empty content', () => {
    const result = measureHollow(EMPTY)
    expect(result.efficiency).toBe(75)
    expect(result.design).toBe('optimal')
    expect(result.hasHighEfficiency).toBe(true)
  })

  it('measures medium content', () => {
    const result = measureHollow(MEDIUM)
    expect(result.efficiency).toBe(69)
    expect(result.design).toBe('bloated')
    expect(result.hasHighEfficiency).toBe(false)
  })
})

// ─── measureWind ───────────────────────────────────────────────

describe('measureWind', () => {
  it('measures rich content', () => {
    const result = measureWind(RICH)
    expect(result.resistance).toBe(88)
    expect(result.flex).toBe('storm-resistant')
    expect(result.hasHighResistance).toBe(true)
    expect(result.hasElasticity).toBe(false)
    expect(result.hasProperSway).toBe(true)
    expect(result.hasNoRigidity).toBe(true)
    expect(result.hasRecovery).toBe(true)
    expect(result.hasNoSnapping).toBe(true)
    expect(result.hasDamping).toBe(true)
    expect(result.hasNoResonance).toBe(true)
    expect(result.hasAdaptive).toBe(true)
    expect(result.hasNoFatigue).toBe(true)
    expect(result.snappingCount).toBe(0)
    expect(result.fatigueCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureWind(EMPTY)
    expect(result.resistance).toBe(40)
    expect(result.flex).toBe('brittle')
    expect(result.hasHighResistance).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureWind(MEDIUM)
    expect(result.resistance).toBe(45)
    expect(result.flex).toBe('brittle')
  })
})

// ─── analyzeBambooCulm ─────────────────────────────────────────

describe('analyzeBambooCulm', () => {
  it('analyzes rich content', () => {
    const result = analyzeBambooCulm(RICH, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.culmStrength).toBe(78)
    expect(result.jointQuality).toBe(57)
    expect(result.growthRate).toBe(90)
    expect(result.rootDepth).toBe(78)
    expect(result.hollowEfficiency).toBe(79)
    expect(result.windResistance).toBe(88)
    expect(result.qualityScore).toBe(79)
    expect(result.condition).toBe('mature-culm')
  })

  it('analyzes empty content', () => {
    const result = analyzeBambooCulm(EMPTY, 'empty.ts')
    expect(result.culmStrength).toBe(40)
    expect(result.jointQuality).toBe(40)
    expect(result.growthRate).toBe(50)
    expect(result.rootDepth).toBe(40)
    expect(result.hollowEfficiency).toBe(75)
    expect(result.windResistance).toBe(40)
    expect(result.qualityScore).toBe(47)
    expect(result.condition).toBe('tender-sprout')
  })

  it('analyzes medium content', () => {
    const result = analyzeBambooCulm(MEDIUM, 'medium.ts')
    expect(result.culmStrength).toBe(45)
    expect(result.jointQuality).toBe(45)
    expect(result.growthRate).toBe(55)
    expect(result.rootDepth).toBe(45)
    expect(result.hollowEfficiency).toBe(69)
    expect(result.windResistance).toBe(45)
    expect(result.qualityScore).toBe(50)
    expect(result.condition).toBe('growing-shoot')
  })

  it('returns consistent results on repeated calls', () => {
    const a = analyzeBambooCulm(RICH, 'a.ts')
    const b = analyzeBambooCulm(RICH, 'a.ts')
    expect(a.qualityScore).toBe(b.qualityScore)
    expect(a.culmStrength).toBe(b.culmStrength)
    expect(a.condition).toBe(b.condition)
  })
})

// ─── classifyCondition ─────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies mature-culm', () => {
    const p = analyzeBambooCulm(RICH, 'rich.ts')
    expect(classifyCondition(p)).toBe('mature-culm')
  })

  it('classifies tender-sprout', () => {
    const e = analyzeBambooCulm(EMPTY, 'empty.ts')
    expect(classifyCondition(e)).toBe('tender-sprout')
  })

  it('classifies growing-shoot', () => {
    const m = analyzeBambooCulm(MEDIUM, 'medium.ts')
    expect(classifyCondition(m)).toBe('growing-shoot')
  })
})

// ─── classifyGroveType ─────────────────────────────────────────

describe('classifyGroveType', () => {
  it('classifies rich culms as mature-grove', () => {
    const p = analyzeBambooCulm(RICH, 'rich.ts')
    expect(classifyGroveType([p])).toBe('mature-grove')
  })

  it('classifies empty culms as growing-stand', () => {
    const e = analyzeBambooCulm(EMPTY, 'empty.ts')
    expect(classifyGroveType([e])).toBe('growing-stand')
  })

  it('classifies mixed culms as growing-stand', () => {
    const p = analyzeBambooCulm(RICH, 'rich.ts')
    const e = analyzeBambooCulm(EMPTY, 'empty.ts')
    const m = analyzeBambooCulm(MEDIUM, 'medium.ts')
    expect(classifyGroveType([p, e, m])).toBe('growing-stand')
  })
})

// ─── classifyGroveCondition ────────────────────────────────────

describe('classifyGroveCondition', () => {
  it('returns sacred-grove for 90+', () => {
    expect(classifyGroveCondition(90)).toBe('sacred-grove')
  })
  it('returns thriving-forest for 70+', () => {
    expect(classifyGroveCondition(70)).toBe('thriving-forest')
  })
  it('returns healthy-stand for 50+', () => {
    expect(classifyGroveCondition(50)).toBe('healthy-stand')
  })
  it('returns withered for below 50', () => {
    expect(classifyGroveCondition(30)).toBe('withered')
  })
})

// ─── classifyGardenerGrade ─────────────────────────────────────

describe('classifyGardenerGrade', () => {
  it('returns master-gardener for 90+', () => {
    expect(classifyGardenerGrade(90)).toBe('master-gardener')
  })
  it('returns forester for 70+', () => {
    expect(classifyGardenerGrade(75)).toBe('forester')
  })
  it('returns gardener for 50+', () => {
    expect(classifyGardenerGrade(55)).toBe('gardener')
  })
  it('returns tender for 30+', () => {
    expect(classifyGardenerGrade(35)).toBe('tender')
  })
  it('returns lumberjack for below 30', () => {
    expect(classifyGardenerGrade(15)).toBe('lumberjack')
  })
})

// ─── analyzeForestGrove ────────────────────────────────────────

describe('analyzeForestGrove', () => {
  it('analyzes a grove with multiple culms', () => {
    const p = analyzeBambooCulm(RICH, 'rich.ts')
    const m = analyzeBambooCulm(MEDIUM, 'medium.ts')
    const grove = analyzeForestGrove([p, m], 'src')
    expect(grove.directory).toBe('src')
    expect(grove.culms).toHaveLength(2)
    expect(grove.avgStrength).toBe(62)
    expect(grove.avgGrowth).toBe(73)
    expect(grove.avgWind).toBe(67)
    expect(grove.groveType).toBe('mature-grove')
    expect(grove.condition).toBe('healthy-stand')
    expect(grove.ancientCount).toBe(0)
    expect(grove.deadCount).toBe(0)
    expect(grove.strongCount).toBe(1)
    expect(grove.efficientCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────

describe('generateRecommendations', () => {
  it('returns recommendations for low-scoring code', () => {
    const lowContent = '// FIXME: hack hack\ntry { eval("bad") } catch(e) { var x }\n'
    const p = analyzeBambooCulm(lowContent, 'bad.ts')
    const recs = generateRecommendations(
      [p],
      [{ directory: 'src', culmCount: 1, avgScore: p.qualityScore, condition: 'damaged' }],
      { avgStrength: p.culmStrength, avgGrowth: p.growthRate, avgWind: p.windResistance, isResilient: false, overallResilience: p.qualityScore },
      { totalFiles: 1, hasHighStrengthCount: 0, hasHighQualityCount: 0, hasHighRateCount: 0 },
    )
    expect(recs.length).toBeGreaterThan(0)
    expect(typeof recs[0]).toBe('string')
  })

  it('returns empty array for rich content', () => {
    const p = analyzeBambooCulm(RICH, 'rich.ts')
    const recs = generateRecommendations(
      [p],
      [{ directory: 'src', culmCount: 1, avgScore: 79 }],
      { avgStrength: 78, avgGrowth: 90, avgWind: 88, isResilient: true, overallResilience: 79 },
      { totalFiles: 1, hasHighStrengthCount: 1, hasHighQualityCount: 0, hasHighRateCount: 1 },
    )
    expect(recs).toEqual([])
  })
})

// ─── buildBambooForestResult ───────────────────────────────────

describe('buildBambooForestResult', () => {
  it('builds result for rich content', () => {
    const result = buildBambooForestResult(['rich.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalGroves).toBe(1)
    expect(result.stats.avgCulmStrength).toBe(78)
    expect(result.stats.avgJointQuality).toBe(57)
    expect(result.stats.avgGrowthRate).toBe(90)
    expect(result.stats.avgRootDepth).toBe(78)
    expect(result.stats.avgHollowEfficiency).toBe(79)
    expect(result.stats.avgWindResistance).toBe(88)
    expect(result.stats.overallResilience).toBe(79)
    expect(result.stats.gardenerGrade).toBe('forester')
    expect(result.stats.matureCulmCount).toBe(1)
    expect(result.stats.tenderSproutCount).toBe(0)
    expect(result.stats.hasHighStrengthCount).toBe(1)
    expect(result.stats.hasHighRateCount).toBe(1)
    expect(result.stats.bestCulm).toBe('rich.ts')
    expect(result.forest.isResilient).toBe(true)
  })

  it('builds result for empty content', () => {
    const result = buildBambooForestResult(['empty.ts'], [EMPTY])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgCulmStrength).toBe(40)
    expect(result.stats.avgJointQuality).toBe(40)
    expect(result.stats.avgGrowthRate).toBe(50)
    expect(result.stats.avgRootDepth).toBe(40)
    expect(result.stats.avgHollowEfficiency).toBe(75)
    expect(result.stats.avgWindResistance).toBe(40)
    expect(result.stats.overallResilience).toBe(47)
    expect(result.stats.gardenerGrade).toBe('tender')
    expect(result.stats.tenderSproutCount).toBe(1)
    expect(result.stats.hasHighEfficiencyCount).toBe(1)
    expect(result.forest.isResilient).toBe(false)
  })

  it('builds result for mixed content', () => {
    const result = buildBambooForestResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalGroves).toBe(1)
    expect(result.stats.avgCulmStrength).toBe(62)
    expect(result.stats.avgJointQuality).toBe(51)
    expect(result.stats.avgGrowthRate).toBe(73)
    expect(result.stats.avgRootDepth).toBe(62)
    expect(result.stats.avgHollowEfficiency).toBe(74)
    expect(result.stats.avgWindResistance).toBe(67)
    expect(result.stats.overallResilience).toBe(65)
    expect(result.stats.gardenerGrade).toBe('forester')
    expect(result.stats.matureCulmCount).toBe(1)
    expect(result.stats.growingShootCount).toBe(1)
    expect(result.stats.bestCulm).toBe('rich.ts')
    expect(result.forest.overallResilience).toBe(65)
  })

  it('returns groves and culms arrays', () => {
    const result = buildBambooForestResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.groves).toHaveLength(1)
    expect(result.culms).toHaveLength(2)
    expect(result.culms[0].file).toBe('rich.ts')
    expect(result.culms[1].file).toBe('medium.ts')
  })
})

// ─── scoreColor ────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns a string for high scores', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })
  it('returns a string for medium scores', () => {
    expect(typeof scoreColor(70)).toBe('string')
  })
  it('returns a string for low scores', () => {
    expect(typeof scoreColor(50)).toBe('string')
  })
  it('returns a string for very low scores', () => {
    expect(typeof scoreColor(30)).toBe('string')
  })
})

// ─── conditionColor ────────────────────────────────────────────

describe('conditionColor', () => {
  it('returns colored string for ancient-giant', () => {
    expect(typeof conditionColor('ancient-giant')).toBe('string')
  })
  it('returns colored string for mature-culm', () => {
    expect(typeof conditionColor('mature-culm')).toBe('string')
  })
  it('returns colored string for growing-shoot', () => {
    expect(typeof conditionColor('growing-shoot')).toBe('string')
  })
  it('returns colored string for tender-sprout', () => {
    expect(typeof conditionColor('tender-sprout')).toBe('string')
  })
  it('returns colored string for damaged-cane', () => {
    expect(typeof conditionColor('damaged-cane')).toBe('string')
  })
  it('returns colored string for dead-cane', () => {
    expect(typeof conditionColor('dead-cane')).toBe('string')
  })
  it('returns string for unknown condition', () => {
    expect(typeof conditionColor('unknown')).toBe('string')
  })
})

// ─── gradeColor ────────────────────────────────────────────────

describe('gradeColor', () => {
  it('returns colored string for master-gardener', () => {
    expect(typeof gradeColor('master-gardener')).toBe('string')
  })
  it('returns colored string for forester', () => {
    expect(typeof gradeColor('forester')).toBe('string')
  })
  it('returns colored string for gardener', () => {
    expect(typeof gradeColor('gardener')).toBe('string')
  })
  it('returns colored string for novice', () => {
    expect(typeof gradeColor('novice')).toBe('string')
  })
  it('returns colored string for seedling', () => {
    expect(typeof gradeColor('seedling')).toBe('string')
  })
  it('returns string for unknown grade', () => {
    expect(typeof gradeColor('unknown')).toBe('string')
  })
})

// ─── culmGradeColor ────────────────────────────────────────────

describe('culmGradeColor', () => {
  it('returns colored string for golden', () => {
    expect(typeof culmGradeColor('golden')).toBe('string')
  })
  it('returns colored string for tender', () => {
    expect(typeof culmGradeColor('tender')).toBe('string')
  })
})

// ─── sealColor ─────────────────────────────────────────────────

describe('sealColor', () => {
  it('returns colored string for snug', () => {
    expect(typeof sealColor('snug')).toBe('string')
  })
  it('returns colored string for loose', () => {
    expect(typeof sealColor('loose')).toBe('string')
  })
})

// ─── speedColor ────────────────────────────────────────────────

describe('speedColor', () => {
  it('returns colored string for rapid', () => {
    expect(typeof speedColor('rapid')).toBe('string')
  })
  it('returns colored string for dormant', () => {
    expect(typeof speedColor('dormant')).toBe('string')
  })
})

// ─── systemColor ───────────────────────────────────────────────

describe('systemColor', () => {
  it('returns colored string for extensive', () => {
    expect(typeof systemColor('extensive')).toBe('string')
  })
  it('returns colored string for surface', () => {
    expect(typeof systemColor('surface')).toBe('string')
  })
})

// ─── designColor ───────────────────────────────────────────────

describe('designColor', () => {
  it('returns colored string for efficient', () => {
    expect(typeof designColor('efficient')).toBe('string')
  })
  it('returns colored string for optimal', () => {
    expect(typeof designColor('optimal')).toBe('string')
  })
})

// ─── flexColor ─────────────────────────────────────────────────

describe('flexColor', () => {
  it('returns colored string for storm-resistant', () => {
    expect(typeof flexColor('storm-resistant')).toBe('string')
  })
  it('returns colored string for brittle', () => {
    expect(typeof flexColor('brittle')).toBe('string')
  })
})

// ─── groveTypeColor ────────────────────────────────────────────

describe('groveTypeColor', () => {
  it('returns colored string for ancient-grove', () => {
    expect(typeof groveTypeColor('ancient-grove')).toBe('string')
  })
  it('returns string for unknown type', () => {
    expect(typeof groveTypeColor('unknown')).toBe('string')
  })
})

// ─── formatBambooForestJson ────────────────────────────────────

describe('formatBambooForestJson', () => {
  it('returns valid JSON string', () => {
    const result = buildBambooForestResult(['rich.ts'], [RICH])
    const json = formatBambooForestJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.overallResilience).toBe(79)
    expect(parsed.culms).toHaveLength(1)
  })
})

// ─── formatBambooForestTable ───────────────────────────────────

describe('formatBambooForestTable', () => {
  it('returns a non-empty string', () => {
    const result = buildBambooForestResult(['rich.ts'], [RICH])
    const table = formatBambooForestTable(result, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('returns verbose table with more content', () => {
    const result = buildBambooForestResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    const brief = formatBambooForestTable(result, false)
    const verbose = formatBambooForestTable(result, true)
    expect(verbose.length).toBeGreaterThan(brief.length)
  })
})
