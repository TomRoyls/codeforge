import { describe, it, expect } from 'vitest'
import {
  measureBending,
  measureConducting,
  measureAging,
  measureReaching,
  measureAlloying,
  classifyCopperCondition,
  classifyGardenType,
  classifyGardenCondition,
  classifyGardenerGrade,
  analyzeCopperTendril,
  analyzeCopperGarden,
  generateRecommendations,
  buildCopperVineResult,
  type CopperTendril,
  type CopperGarden,
  type ForestSummary,
  type CopperVineStats,
} from '../src/commands/copper-vine-helpers.js'
import {
  colorScore,
  colorGrade,
  formatTendrilTable,
  formatTendrilsTable,
  formatGardenTable,
  formatGardensTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/copper-vine-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const minimalContent = 'export const x = 8'

const richContent = `import { x } from 'y'
export interface Foo<T> { bar: string }
export type Result = string | number
export class Handler {
  private data: readonly string[]
  /** Doc */
  async process(input: string): Promise<void> {
    if (input === 'test') return
    const result = await this.handle(input)
  }
}
export const handler = new Handler()`

const emptyContent = ''

const badContent = `var x = eval("bad")
debugger
var y = 1
var z = 2
let a: any = {}
let b: any = {}`

const sampleTendril: CopperTendril = {
  file: 'src/index.ts',
  malleability: 80,
  conductivity: 75,
  patinaWisdom: 70,
  tendrilReach: 65,
  alloyStrength: 60,
  bending: {
    malleability: 80, grade: 'highly-malleable', hasHighMalleability: true,
    hasAdaptable: true, hasFlexible: true, hasNoRigid: true,
    hasPliable: true, hasNoStiff: true, hasBendable: true,
    hasNoInflexible: true, hasYielding: true, hasNoStubborn: true,
    hasShapable: true, rigidCount: 0, stiffCount: 0,
  },
  conducting: {
    conductivity: 75, conductor: 'high-conductivity', hasHighConductivity: true,
    hasFlowing: true, hasEfficient: true, hasNoBlocked: true,
    hasConductive: true, hasNoResistant: true, hasRapid: true,
    hasNoSluggish: true, hasSmooth: true, hasNoBottleneck: true,
    hasFast: true, blockedCount: 0, resistantCount: 0,
  },
  aging: {
    wisdom: 70, patina: 'graceful-patina', hasHighWisdom: true,
    hasMature: true, hasGraceful: true, hasNoDegenerating: true,
    hasSeasoned: true, hasNoDeteriorating: true, hasAged: true,
    hasNoFading: true, hasEnduring: true, hasNoCrumbling: true,
    hasAntique: true, degeneratingCount: 0, deterioratingCount: 0,
  },
  reaching: {
    reach: 65, tendril: 'far-reaching', hasHighReach: false,
    hasExtensible: true, hasScalable: true, hasNoLimited: true,
    hasExpandable: true, hasNoConstrained: true, hasReaching: true,
    hasNoBounded: true, hasGrowing: true, hasNoShrinking: true,
    hasSpreading: true, limitedCount: 0, constrainedCount: 0,
  },
  alloying: {
    strength: 60, alloy: 'proper-alloy', hasHighStrength: false,
    hasIntegrated: true, hasConnected: true, hasNoSeparated: true,
    hasCoupled: true, hasNoDetached: true, hasBound: true,
    hasNoLoose: true, hasFused: true, hasNoFragmented: true,
    hasUnited: true, separatedCount: 0, detachedCount: 0,
  },
  condition: 'growing-vine',
  qualityScore: 70,
}

function makeTendril(overrides: Partial<CopperTendril> = {}): CopperTendril {
  return { ...sampleTendril, ...overrides }
}

// ─── measureBending ────────────────────────────────────────────────

describe('measureBending', () => {
  it('returns 0 malleability for empty content', () => {
    const m = measureBending(emptyContent)
    expect(m.malleability).toBe(0)
    expect(m.grade).toBe('cast-iron')
    expect(m.hasHighMalleability).toBe(false)
  })

  it('detects export and const in minimal content', () => {
    const m = measureBending(minimalContent)
    expect(m.malleability).toBeGreaterThan(0)
    expect(m.hasAdaptable).toBe(false)
  })

  it('scores rich content high', () => {
    const m = measureBending(richContent)
    expect(m.malleability).toBe(100)
    expect(m.grade).toBe('pure-copper')
    expect(m.hasHighMalleability).toBe(true)
  })

  it('detects adaptable (export + async)', () => {
    expect(measureBending(richContent).hasAdaptable).toBe(true)
    expect(measureBending(minimalContent).hasAdaptable).toBe(false)
  })

  it('detects flexible (namedExport + returnType)', () => {
    expect(measureBending(richContent).hasFlexible).toBe(true)
  })

  it('detects pliable (const + import)', () => {
    expect(measureBending(richContent).hasPliable).toBe(true)
  })

  it('detects bendable (generics + interface)', () => {
    expect(measureBending(richContent).hasBendable).toBe(true)
  })

  it('detects yielding (docComments + export)', () => {
    expect(measureBending(richContent).hasYielding).toBe(true)
  })

  it('detects shapable (typeAlias + const)', () => {
    expect(measureBending(richContent).hasShapable).toBe(true)
  })

  it('counts rigid (var)', () => {
    expect(measureBending(badContent).rigidCount).toBe(3)
    expect(measureBending(richContent).rigidCount).toBe(0)
  })

  it('counts stiff (any)', () => {
    expect(measureBending(badContent).stiffCount).toBe(2)
  })

  it('hasNoRigid is false when var present', () => {
    expect(measureBending(badContent).hasNoRigid).toBe(false)
    expect(measureBending(richContent).hasNoRigid).toBe(true)
  })

  it('hasNoStiff is false when any present', () => {
    expect(measureBending(badContent).hasNoStiff).toBe(false)
  })

  it('hasNoInflexible is false when eval present', () => {
    expect(measureBending(badContent).hasNoInflexible).toBe(false)
  })

  it('hasNoStubborn is false when debugger present', () => {
    expect(measureBending(badContent).hasNoStubborn).toBe(false)
  })
})

// ─── measureConducting ─────────────────────────────────────────────

describe('measureConducting', () => {
  it('returns 0 conductivity for empty content', () => {
    const m = measureConducting(emptyContent)
    expect(m.conductivity).toBe(0)
    expect(m.conductor).toBe('insulator')
    expect(m.hasHighConductivity).toBe(false)
  })

  it('detects export and const in minimal content', () => {
    const m = measureConducting(minimalContent)
    expect(m.conductivity).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureConducting(richContent)
    expect(m.conductivity).toBe(100)
    expect(m.conductor).toBe('superconductor')
  })

  it('detects flowing (returnType + import)', () => {
    expect(measureConducting(richContent).hasFlowing).toBe(true)
    expect(measureConducting(minimalContent).hasFlowing).toBe(false)
  })

  it('detects efficient (export + async)', () => {
    expect(measureConducting(richContent).hasEfficient).toBe(true)
  })

  it('detects conductive (interface + generics)', () => {
    expect(measureConducting(richContent).hasConductive).toBe(true)
  })

  it('detects rapid (namedExport + const)', () => {
    expect(measureConducting(richContent).hasRapid).toBe(true)
  })

  it('detects smooth (docComments + export)', () => {
    expect(measureConducting(richContent).hasSmooth).toBe(true)
  })

  it('detects fast (class + returnType)', () => {
    expect(measureConducting(richContent).hasFast).toBe(true)
  })

  it('counts blocked (var)', () => {
    expect(measureConducting(badContent).blockedCount).toBe(3)
  })

  it('counts resistant (any)', () => {
    expect(measureConducting(badContent).resistantCount).toBe(2)
  })

  it('hasNoBlocked is false when var present', () => {
    expect(measureConducting(badContent).hasNoBlocked).toBe(false)
  })

  it('hasNoResistant is false when any present', () => {
    expect(measureConducting(badContent).hasNoResistant).toBe(false)
  })

  it('hasNoSluggish is false when eval present', () => {
    expect(measureConducting(badContent).hasNoSluggish).toBe(false)
  })

  it('hasNoBottleneck is false when debugger present', () => {
    expect(measureConducting(badContent).hasNoBottleneck).toBe(false)
  })
})

// ─── measureAging ──────────────────────────────────────────────────

describe('measureAging', () => {
  it('returns 0 wisdom for empty content', () => {
    const m = measureAging(emptyContent)
    expect(m.wisdom).toBe(0)
    expect(m.patina).toBe('decaying')
  })

  it('detects export in minimal content', () => {
    const m = measureAging(minimalContent)
    expect(m.wisdom).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureAging(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.patina).toBe('verdigris-beauty')
  })

  it('detects mature (docComments + typeAlias)', () => {
    expect(measureAging(richContent).hasMature).toBe(true)
  })

  it('detects graceful (readonly + private)', () => {
    expect(measureAging(richContent).hasGraceful).toBe(true)
  })

  it('detects seasoned (interface + generics)', () => {
    expect(measureAging(richContent).hasSeasoned).toBe(true)
  })

  it('detects aged (returnType + export)', () => {
    expect(measureAging(richContent).hasAged).toBe(true)
  })

  it('detects enduring (import + class)', () => {
    expect(measureAging(richContent).hasEnduring).toBe(true)
  })

  it('detects antique (readonly + docComments)', () => {
    expect(measureAging(richContent).hasAntique).toBe(true)
  })

  it('counts degenerating (var)', () => {
    expect(measureAging(badContent).degeneratingCount).toBe(3)
  })

  it('counts deteriorating (any)', () => {
    expect(measureAging(badContent).deterioratingCount).toBe(2)
  })

  it('hasNoDegenerating is false when var present', () => {
    expect(measureAging(badContent).hasNoDegenerating).toBe(false)
  })

  it('hasNoDeteriorating is false when any present', () => {
    expect(measureAging(badContent).hasNoDeteriorating).toBe(false)
  })

  it('hasNoFading is false when eval present', () => {
    expect(measureAging(badContent).hasNoFading).toBe(false)
  })

  it('hasNoCrumbling is false when debugger present', () => {
    expect(measureAging(badContent).hasNoCrumbling).toBe(false)
  })
})

// ─── measureReaching ───────────────────────────────────────────────

describe('measureReaching', () => {
  it('returns 0 reach for empty content', () => {
    const m = measureReaching(emptyContent)
    expect(m.reach).toBe(0)
    expect(m.tendril).toBe('no-growth')
  })

  it('detects export and const in minimal content', () => {
    const m = measureReaching(minimalContent)
    expect(m.reach).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureReaching(richContent)
    expect(m.reach).toBe(100)
    expect(m.tendril).toBe('spreading-vine')
  })

  it('detects extensible (export + interface)', () => {
    expect(measureReaching(richContent).hasExtensible).toBe(true)
  })

  it('detects scalable (generics + async)', () => {
    expect(measureReaching(richContent).hasScalable).toBe(true)
  })

  it('detects expandable (namedExport + returnType)', () => {
    expect(measureReaching(richContent).hasExpandable).toBe(true)
  })

  it('detects reaching (const + import)', () => {
    expect(measureReaching(richContent).hasReaching).toBe(true)
  })

  it('detects growing (typeAlias + class)', () => {
    expect(measureReaching(richContent).hasGrowing).toBe(true)
  })

  it('detects spreading (export + generics)', () => {
    expect(measureReaching(richContent).hasSpreading).toBe(true)
  })

  it('counts limited (var)', () => {
    expect(measureReaching(badContent).limitedCount).toBe(3)
  })

  it('counts constrained (any)', () => {
    expect(measureReaching(badContent).constrainedCount).toBe(2)
  })

  it('hasNoLimited is false when var present', () => {
    expect(measureReaching(badContent).hasNoLimited).toBe(false)
  })

  it('hasNoConstrained is false when any present', () => {
    expect(measureReaching(badContent).hasNoConstrained).toBe(false)
  })

  it('hasNoBounded is false when eval present', () => {
    expect(measureReaching(badContent).hasNoBounded).toBe(false)
  })

  it('hasNoShrinking is false when debugger present', () => {
    expect(measureReaching(badContent).hasNoShrinking).toBe(false)
  })
})

// ─── measureAlloying ───────────────────────────────────────────────

describe('measureAlloying', () => {
  it('returns 0 strength for empty content', () => {
    const m = measureAlloying(emptyContent)
    expect(m.strength).toBe(0)
    expect(m.alloy).toBe('no-bond')
  })

  it('detects export and const in minimal content', () => {
    const m = measureAlloying(minimalContent)
    expect(m.strength).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureAlloying(richContent)
    expect(m.strength).toBe(100)
    expect(m.alloy).toBe('bronze-strength')
  })

  it('detects integrated (export + import)', () => {
    expect(measureAlloying(richContent).hasIntegrated).toBe(true)
  })

  it('detects connected (const + strictEq)', () => {
    expect(measureAlloying(richContent).hasConnected).toBe(true)
  })

  it('detects coupled (interface + class)', () => {
    expect(measureAlloying(richContent).hasCoupled).toBe(true)
  })

  it('detects bound (returnType + readonly)', () => {
    expect(measureAlloying(richContent).hasBound).toBe(true)
  })

  it('detects fused (async + export)', () => {
    expect(measureAlloying(richContent).hasFused).toBe(true)
  })

  it('detects united (generics + import)', () => {
    expect(measureAlloying(richContent).hasUnited).toBe(true)
  })

  it('counts separated (var)', () => {
    expect(measureAlloying(badContent).separatedCount).toBe(3)
  })

  it('counts detached (any)', () => {
    expect(measureAlloying(badContent).detachedCount).toBe(2)
  })

  it('hasNoSeparated is false when var present', () => {
    expect(measureAlloying(badContent).hasNoSeparated).toBe(false)
  })

  it('hasNoDetached is false when any present', () => {
    expect(measureAlloying(badContent).hasNoDetached).toBe(false)
  })

  it('hasNoLoose is false when eval present', () => {
    expect(measureAlloying(badContent).hasNoLoose).toBe(false)
  })

  it('hasNoFragmented is false when debugger present', () => {
    expect(measureAlloying(badContent).hasNoFragmented).toBe(false)
  })
})

// ─── classifyCopperCondition ───────────────────────────────────────

describe('classifyCopperCondition', () => {
  it('returns living-copper for 85+', () => {
    expect(classifyCopperCondition(90)).toBe('living-copper')
    expect(classifyCopperCondition(85)).toBe('living-copper')
  })

  it('returns growing-vine for 70-84', () => {
    expect(classifyCopperCondition(70)).toBe('growing-vine')
    expect(classifyCopperCondition(84)).toBe('growing-vine')
  })

  it('returns proper-tendril for 55-69', () => {
    expect(classifyCopperCondition(55)).toBe('proper-tendril')
    expect(classifyCopperCondition(69)).toBe('proper-tendril')
  })

  it('returns rigid-wire for 40-54', () => {
    expect(classifyCopperCondition(40)).toBe('rigid-wire')
    expect(classifyCopperCondition(54)).toBe('rigid-wire')
  })

  it('returns corroded-pipe for 25-39', () => {
    expect(classifyCopperCondition(25)).toBe('corroded-pipe')
    expect(classifyCopperCondition(39)).toBe('corroded-pipe')
  })

  it('returns scrap-metal for < 25', () => {
    expect(classifyCopperCondition(0)).toBe('scrap-metal')
    expect(classifyCopperCondition(24)).toBe('scrap-metal')
  })
})

// ─── classifyGardenType ────────────────────────────────────────────

describe('classifyGardenType', () => {
  it('returns no-garden for empty array', () => {
    expect(classifyGardenType([])).toBe('no-garden')
  })

  it('returns verdigris-garden for high avg with living ratio', () => {
    const tendrils = [
      makeTendril({ qualityScore: 90, condition: 'living-copper' }),
      makeTendril({ qualityScore: 88, condition: 'living-copper' }),
    ]
    expect(classifyGardenType(tendrils)).toBe('verdigris-garden')
  })

  it('returns copper-arbor for avg 60+', () => {
    const tendrils = [makeTendril({ qualityScore: 60, condition: 'growing-vine' })]
    expect(classifyGardenType(tendrils)).toBe('copper-arbor')
  })

  it('returns proper-trellis for avg 45-59', () => {
    const tendrils = [makeTendril({ qualityScore: 45, condition: 'proper-tendril' })]
    expect(classifyGardenType(tendrils)).toBe('proper-trellis')
  })

  it('returns wire-fence for avg 30-44', () => {
    const tendrils = [makeTendril({ qualityScore: 30, condition: 'rigid-wire' })]
    expect(classifyGardenType(tendrils)).toBe('wire-fence')
  })

  it('returns rusty-pipe for avg 15-29', () => {
    const tendrils = [makeTendril({ qualityScore: 15, condition: 'corroded-pipe' })]
    expect(classifyGardenType(tendrils)).toBe('rusty-pipe')
  })

  it('returns no-garden for low quality', () => {
    const tendrils = [makeTendril({ qualityScore: 10, condition: 'scrap-metal' })]
    expect(classifyGardenType(tendrils)).toBe('no-garden')
  })
})

// ─── classifyGardenCondition ───────────────────────────────────────

describe('classifyGardenCondition', () => {
  it('returns lush-growth for 75+', () => {
    expect(classifyGardenCondition(80)).toBe('lush-growth')
  })

  it('returns healthy-vine for 60-74', () => {
    expect(classifyGardenCondition(60)).toBe('healthy-vine')
  })

  it('returns decent-garden for 45-59', () => {
    expect(classifyGardenCondition(45)).toBe('decent-garden')
  })

  it('returns struggling-plant for 30-44', () => {
    expect(classifyGardenCondition(30)).toBe('struggling-plant')
  })

  it('returns dead-vine for 15-29', () => {
    expect(classifyGardenCondition(15)).toBe('dead-vine')
  })

  it('returns barren for < 15', () => {
    expect(classifyGardenCondition(10)).toBe('barren')
  })
})

// ─── classifyGardenerGrade ─────────────────────────────────────────

describe('classifyGardenerGrade', () => {
  it('returns master-metallurgist for 80+', () => {
    expect(classifyGardenerGrade(85)).toBe('master-metallurgist')
  })

  it('returns copper-artisan for 65-79', () => {
    expect(classifyGardenerGrade(65)).toBe('copper-artisan')
  })

  it('returns skilled-craftsman for 50-64', () => {
    expect(classifyGardenerGrade(50)).toBe('skilled-craftsman')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyGardenerGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyGardenerGrade(20)).toBe('novice')
  })

  it('returns scrap-dealer for < 20', () => {
    expect(classifyGardenerGrade(10)).toBe('scrap-dealer')
  })
})

// ─── analyzeCopperTendril ──────────────────────────────────────────

describe('analyzeCopperTendril', () => {
  it('analyzes minimal content', () => {
    const tendril = analyzeCopperTendril(minimalContent, 'test.ts')
    expect(tendril.file).toBe('test.ts')
    expect(tendril.malleability).toBeGreaterThan(0)
    expect(tendril.qualityScore).toBeGreaterThan(0)
    expect(tendril.condition).toBeDefined()
  })

  it('analyzes rich content with high scores', () => {
    const tendril = analyzeCopperTendril(richContent, 'rich.ts')
    expect(tendril.malleability).toBe(100)
    expect(tendril.conductivity).toBe(100)
    expect(tendril.patinaWisdom).toBe(100)
    expect(tendril.tendrilReach).toBe(100)
    expect(tendril.alloyStrength).toBe(100)
    expect(tendril.qualityScore).toBe(100)
    expect(tendril.condition).toBe('living-copper')
  })

  it('computes qualityScore as weighted average', () => {
    const tendril = analyzeCopperTendril(minimalContent, 'minimal.ts')
    const expected = Math.round(
      tendril.bending.malleability * 0.2 +
      tendril.conducting.conductivity * 0.2 +
      tendril.aging.wisdom * 0.2 +
      tendril.reaching.reach * 0.2 +
      tendril.alloying.strength * 0.2,
    )
    expect(tendril.qualityScore).toBe(expected)
  })

  it('classifies condition based on qualityScore', () => {
    const tendril = analyzeCopperTendril(richContent, 'rich.ts')
    expect(tendril.condition).toBe(classifyCopperCondition(tendril.qualityScore))
  })

  it('maps top-level scores from measures', () => {
    const tendril = analyzeCopperTendril(richContent, 'rich.ts')
    expect(tendril.malleability).toBe(tendril.bending.malleability)
    expect(tendril.conductivity).toBe(tendril.conducting.conductivity)
    expect(tendril.patinaWisdom).toBe(tendril.aging.wisdom)
    expect(tendril.tendrilReach).toBe(tendril.reaching.reach)
    expect(tendril.alloyStrength).toBe(tendril.alloying.strength)
  })
})

// ─── analyzeCopperGarden ───────────────────────────────────────────

describe('analyzeCopperGarden', () => {
  it('returns empty garden for no tendrils', () => {
    const garden = analyzeCopperGarden([], 'empty')
    expect(garden.tendrils).toEqual([])
    expect(garden.avgMalleability).toBe(0)
    expect(garden.avgConductivity).toBe(0)
    expect(garden.avgStrength).toBe(0)
    expect(garden.livingCopperCount).toBe(0)
    expect(garden.scrapMetalCount).toBe(0)
    expect(garden.gardenType).toBe('no-garden')
    expect(garden.condition).toBe('barren')
  })

  it('computes averages correctly', () => {
    const tendrils = [
      makeTendril({ malleability: 80, conductivity: 60, alloyStrength: 70, qualityScore: 70, condition: 'growing-vine' }),
      makeTendril({ malleability: 60, conductivity: 80, alloyStrength: 50, qualityScore: 60, condition: 'growing-vine' }),
    ]
    const garden = analyzeCopperGarden(tendrils, 'src')
    expect(garden.avgMalleability).toBe(70)
    expect(garden.avgConductivity).toBe(70)
    expect(garden.avgStrength).toBe(60)
  })

  it('counts conditions correctly', () => {
    const tendrils = [
      makeTendril({ condition: 'living-copper', qualityScore: 90 }),
      makeTendril({ condition: 'scrap-metal', qualityScore: 10 }),
    ]
    const garden = analyzeCopperGarden(tendrils, 'src')
    expect(garden.livingCopperCount).toBe(1)
    expect(garden.scrapMetalCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const goodForest: ForestSummary = { avgMalleability: 80, avgConductivity: 80, avgStrength: 80, isGrowing: true, overallVitality: 80 }
  const goodStats: CopperVineStats = {
    totalFiles: 1, totalGardens: 1,
    avgMalleability: 80, avgConductivity: 80, avgPatinaWisdom: 80,
    avgTendrilReach: 80, avgAlloyStrength: 80,
    livingCopperCount: 1, growingVineCount: 0, properTendrilCount: 0,
    rigidWireCount: 0, corrodedPipeCount: 0, scrapMetalCount: 0,
    hasHighMalleabilityCount: 1, hasHighConductivityCount: 1, hasHighWisdomCount: 1,
    hasHighReachCount: 1, hasHighStrengthCount: 1,
    overallVitality: 80, gardenerGrade: 'master-metallurgist',
    bestTendril: 'a.ts', mostMalleable: 'a.ts', mostConductive: 'a.ts',
    wisest: 'a.ts', mostExpansive: 'a.ts',
  }

  it('returns celebration when all is good', () => {
    const recs = generateRecommendations(
      [makeTendril({ condition: 'living-copper', qualityScore: 90 })],
      [{ directory: 'src', tendrils: [makeTendril()], avgMalleability: 80, avgConductivity: 80, avgStrength: 80, livingCopperCount: 1, scrapMetalCount: 0, gardenType: 'verdigris-garden', condition: 'lush-growth' }],
      goodForest, goodStats,
    )
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('master-metallurgist')
  })

  it('recommends increasing malleability when low', () => {
    const stats = { ...goodStats, avgMalleability: 40 }
    const recs = generateRecommendations([], [], goodForest, stats)
    expect(recs.some(r => r.includes('malleability'))).toBe(true)
  })

  it('recommends boosting conductivity when low', () => {
    const stats = { ...goodStats, avgConductivity: 40 }
    const recs = generateRecommendations([], [], goodForest, stats)
    expect(recs.some(r => r.includes('conductivity'))).toBe(true)
  })

  it('recommends growing patina wisdom when low', () => {
    const stats = { ...goodStats, avgPatinaWisdom: 40 }
    const recs = generateRecommendations([], [], goodForest, stats)
    expect(recs.some(r => r.includes('wisdom'))).toBe(true)
  })

  it('recommends extending tendril reach when low', () => {
    const stats = { ...goodStats, avgTendrilReach: 40 }
    const recs = generateRecommendations([], [], goodForest, stats)
    expect(recs.some(r => r.includes('reach'))).toBe(true)
  })

  it('recommends strengthening alloy when low', () => {
    const stats = { ...goodStats, avgAlloyStrength: 40 }
    const recs = generateRecommendations([], [], goodForest, stats)
    expect(recs.some(r => r.includes('alloy'))).toBe(true)
  })

  it('flags scrap metal files', () => {
    const stats = { ...goodStats, scrapMetalCount: 3 }
    const recs = generateRecommendations([], [], goodForest, stats)
    expect(recs.some(r => r.includes('scrap metal'))).toBe(true)
  })

  it('warns about low vitality', () => {
    const forest: ForestSummary = { avgMalleability: 30, avgConductivity: 30, avgStrength: 30, isGrowing: false, overallVitality: 30 }
    const recs = generateRecommendations([], [], forest, goodStats)
    expect(recs.some(r => r.includes('vitality'))).toBe(true)
  })

  it('warns when all gardens are barren', () => {
    const gardens: CopperGarden[] = [
      { directory: 'a', tendrils: [], avgMalleability: 0, avgConductivity: 0, avgStrength: 0, livingCopperCount: 0, scrapMetalCount: 0, gardenType: 'no-garden', condition: 'barren' },
      { directory: 'b', tendrils: [], avgMalleability: 0, avgConductivity: 0, avgStrength: 0, livingCopperCount: 0, scrapMetalCount: 0, gardenType: 'rusty-pipe', condition: 'dead-vine' },
    ]
    const recs = generateRecommendations([], gardens, goodForest, goodStats)
    expect(recs.some(r => r.includes('barren'))).toBe(true)
  })

  it('names specific scrap files when 1-3', () => {
    const tendrils = [
      makeTendril({ file: 'a.ts', condition: 'scrap-metal', qualityScore: 10 }),
      makeTendril({ file: 'b.ts', condition: 'scrap-metal', qualityScore: 10 }),
    ]
    const recs = generateRecommendations(tendrils, [], goodForest, goodStats)
    expect(recs.some(r => r.includes('a.ts'))).toBe(true)
    expect(recs.some(r => r.includes('b.ts'))).toBe(true)
  })
})

// ─── buildCopperVineResult ─────────────────────────────────────────

describe('buildCopperVineResult', () => {
  it('handles empty input', async () => {
    const result = await buildCopperVineResult([], [])
    expect(result.tendrils).toEqual([])
    expect(result.gardens).toEqual([])
    expect(result.forest.avgMalleability).toBe(0)
    expect(result.forest.overallVitality).toBe(0)
    expect(result.forest.isGrowing).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.gardenerGrade).toBe('scrap-dealer')
  })

  it('processes minimal content', async () => {
    const result = await buildCopperVineResult(['test.ts'], [minimalContent])
    expect(result.tendrils).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgMalleability).toBeGreaterThan(0)
  })

  it('processes rich content', async () => {
    const result = await buildCopperVineResult(['rich.ts'], [richContent])
    expect(result.tendrils[0].qualityScore).toBe(100)
    expect(result.forest.avgMalleability).toBe(100)
    expect(result.forest.isGrowing).toBe(true)
    expect(result.forest.overallVitality).toBe(100)
    expect(result.stats.gardenerGrade).toBe('master-metallurgist')
  })

  it('groups files by directory into gardens', async () => {
    const result = await buildCopperVineResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    expect(result.gardens).toHaveLength(2)
    expect(result.stats.totalGardens).toBe(2)
  })

  it('computes forest correctly', async () => {
    const result = await buildCopperVineResult(['f.ts'], [richContent])
    expect(result.forest.avgMalleability).toBe(result.stats.avgMalleability)
    expect(result.forest.avgConductivity).toBe(result.stats.avgConductivity)
    expect(result.forest.avgStrength).toBe(result.stats.avgAlloyStrength)
    expect(result.forest.overallVitality).toBe(result.stats.overallVitality)
  })

  it('computes bestTendril and other extremes', async () => {
    const result = await buildCopperVineResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestTendril).toBe('b.ts')
    expect(result.stats.mostMalleable).toBe('b.ts')
    expect(result.stats.mostConductive).toBe('b.ts')
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildCopperVineResult(['r.ts'], [richContent])
    expect(result.stats.livingCopperCount).toBe(1)
    expect(result.stats.scrapMetalCount).toBe(0)
  })

  it('tracks high measure counts', async () => {
    const result = await buildCopperVineResult(['r.ts'], [richContent])
    expect(result.stats.hasHighMalleabilityCount).toBe(1)
    expect(result.stats.hasHighConductivityCount).toBe(1)
    expect(result.stats.hasHighWisdomCount).toBe(1)
    expect(result.stats.hasHighReachCount).toBe(1)
    expect(result.stats.hasHighStrengthCount).toBe(1)
  })

  it('includes recommendations', async () => {
    const result = await buildCopperVineResult(['r.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for all tiers', () => {
    expect(typeof colorScore(90)).toBe('string')
    expect(typeof colorScore(70)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(30)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns string for known grades', () => {
    expect(typeof colorGrade('living-copper')).toBe('string')
    expect(typeof colorGrade('scrap-metal')).toBe('string')
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatTendrilTable', () => {
  it('formats a tendril with file name', () => {
    const tendril = analyzeCopperTendril(richContent, 'test.ts')
    const formatted = formatTendrilTable(tendril)
    expect(formatted).toContain('test.ts')
    expect(formatted).toContain('Malleability')
    expect(formatted).toContain('Score')
  })
})

describe('formatTendrilsTable', () => {
  it('returns message for empty array', () => {
    expect(formatTendrilsTable([])).toContain('No copper tendrils')
  })

  it('formats multiple tendrils', () => {
    const tendrils = [
      analyzeCopperTendril(richContent, 'a.ts'),
      analyzeCopperTendril(minimalContent, 'b.ts'),
    ]
    const formatted = formatTendrilsTable(tendrils)
    expect(formatted).toContain('a.ts')
    expect(formatted).toContain('b.ts')
  })
})

describe('formatGardenTable', () => {
  it('formats a garden', () => {
    const garden = analyzeCopperGarden([makeTendril()], 'src')
    const formatted = formatGardenTable(garden)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Type')
  })
})

describe('formatGardensTable', () => {
  it('returns message for empty array', () => {
    expect(formatGardensTable([])).toContain('No copper gardens')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', async () => {
    const result = await buildCopperVineResult(['f.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Gardener Grade')
    expect(formatted).toContain('Best Tendril')
  })
})

describe('formatRecommendations', () => {
  it('returns message for empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations as bullet list', () => {
    const formatted = formatRecommendations(['Do X', 'Do Y'])
    expect(formatted).toContain('Do X')
    expect(formatted).toContain('Do Y')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildCopperVineResult(['f.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Copper Vine Analysis')
    expect(formatted).toContain('Forest')
    expect(formatted).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildCopperVineResult(['f.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.tendrils).toHaveLength(1)
    expect(parsed.forest.overallVitality).toBe(100)
  })
})
