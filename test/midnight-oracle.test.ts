import { describe, it, expect } from 'vitest'
import {
  measureReflecting,
  measureSharpening,
  measureSourcing,
  measureRevealing,
  measureProphesying,
  classifyOracleCondition,
  classifyTempleType,
  classifyTempleCondition,
  classifySeerGrade,
  analyzeOracleVision,
  analyzeOracleTemple,
  generateRecommendations,
  buildMidnightOracleResult,
  type OracleVision,
  type OracleTemple,
  type ProphecySummary,
  type MidnightOracleStats,
} from '../src/commands/midnight-oracle-helpers.js'
import {
  colorScore,
  colorGrade,
  formatVisionTable,
  formatVisionsTable,
  formatTempleTable,
  formatTemplesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/midnight-oracle-format-helpers.js'

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

const sampleVision: OracleVision = {
  file: 'src/index.ts',
  reflectionDepth: 80,
  edgeSharpness: 75,
  volcanicOrigin: 70,
  shadowClarity: 65,
  prophecyAccuracy: 60,
  reflecting: {
    depth: 80, grade: 'deep-reflection', hasHighDepth: true,
    hasSelfAware: true, hasIntrospective: true, hasNoBlind: true,
    hasReflective: true, hasNoOpaque: true, hasRevealing: true,
    hasNoHidden: true, hasTransparent: true, hasNoConcealing: true,
    hasInsightful: true, blindCount: 0, opaqueCount: 0,
  },
  sharpening: {
    sharpness: 75, edge: 'scalpel-sharp', hasHighSharpness: true,
    hasPrecise: true, hasExact: true, hasNoImprecise: true,
    hasSharp: true, hasNoBlunt: true, hasFine: true,
    hasNoCoarse: true, hasDefined: true, hasNoVague: true,
    hasCrisp: true, impreciseCount: 0, bluntCount: 0,
  },
  sourcing: {
    quality: 70, origin: 'quality-magma', hasHighQuality: true,
    hasPureSource: true, hasCleanOrigin: true, hasNoContaminated: true,
    hasQualityOrigin: true, hasNoImpure: true, hasAuthentic: true,
    hasNoFake: true, hasGenuine: true, hasNoSynthetic: true,
    hasNatural: true, contaminatedCount: 0, impureCount: 0,
  },
  revealing: {
    clarity: 65, shadow: 'clear-shadows', hasHighClarity: false,
    hasVisible: true, hasExposed: true, hasNoHidden: true,
    hasDetectable: true, hasNoInvisible: true, hasClear: true,
    hasNoMurky: true, hasRevealed: true, hasNoConcealed: true,
    hasApparent: true, hiddenCount: 0, invisibleCount: 0,
  },
  prophesying: {
    accuracy: 60, prophecy: 'accurate-prediction', hasHighAccuracy: false,
    hasPredictable: true, hasReliable: true, hasNoUnpredictable: true,
    hasConsistent: true, hasNoErratic: true, hasForeseeable: true,
    hasNoSurprising: true, hasDependable: true, hasNoRandom: true,
    hasDeterministic: true, unpredictableCount: 0, erraticCount: 0,
  },
  condition: 'polished-oracle',
  qualityScore: 70,
}

function makeVision(overrides: Partial<OracleVision> = {}): OracleVision {
  return { ...sampleVision, ...overrides }
}

// ─── measureReflecting ─────────────────────────────────────────────

describe('measureReflecting', () => {
  it('returns 0 depth for empty content', () => {
    const m = measureReflecting(emptyContent)
    expect(m.depth).toBe(0)
    expect(m.grade).toBe('blank')
    expect(m.hasHighDepth).toBe(false)
  })

  it('detects export and const in minimal content', () => {
    const m = measureReflecting(minimalContent)
    expect(m.depth).toBeGreaterThan(0)
    expect(m.hasSelfAware).toBe(false)
  })

  it('scores rich content high', () => {
    const m = measureReflecting(richContent)
    expect(m.depth).toBe(100)
    expect(m.grade).toBe('scrying-depth')
    expect(m.hasHighDepth).toBe(true)
  })

  it('detects selfAware (export + async)', () => {
    expect(measureReflecting(richContent).hasSelfAware).toBe(true)
    expect(measureReflecting(minimalContent).hasSelfAware).toBe(false)
  })

  it('detects introspective (namedExport + returnType)', () => {
    expect(measureReflecting(richContent).hasIntrospective).toBe(true)
  })

  it('detects reflective (const + import)', () => {
    expect(measureReflecting(richContent).hasReflective).toBe(true)
  })

  it('detects revealing (generics + interface)', () => {
    expect(measureReflecting(richContent).hasRevealing).toBe(true)
  })

  it('detects transparent (docComments + export)', () => {
    expect(measureReflecting(richContent).hasTransparent).toBe(true)
  })

  it('detects insightful (typeAlias + const)', () => {
    expect(measureReflecting(richContent).hasInsightful).toBe(true)
  })

  it('counts blind (var)', () => {
    expect(measureReflecting(badContent).blindCount).toBe(3)
    expect(measureReflecting(richContent).blindCount).toBe(0)
  })

  it('counts opaque (any)', () => {
    expect(measureReflecting(badContent).opaqueCount).toBe(2)
  })

  it('hasNoBlind is false when var present', () => {
    expect(measureReflecting(badContent).hasNoBlind).toBe(false)
    expect(measureReflecting(richContent).hasNoBlind).toBe(true)
  })

  it('hasNoOpaque is false when any present', () => {
    expect(measureReflecting(badContent).hasNoOpaque).toBe(false)
  })

  it('hasNoHidden is false when eval present', () => {
    expect(measureReflecting(badContent).hasNoHidden).toBe(false)
  })

  it('hasNoConcealing is false when debugger present', () => {
    expect(measureReflecting(badContent).hasNoConcealing).toBe(false)
  })
})

// ─── measureSharpening ─────────────────────────────────────────────

describe('measureSharpening', () => {
  it('returns 0 sharpness for empty content', () => {
    const m = measureSharpening(emptyContent)
    expect(m.sharpness).toBe(0)
    expect(m.edge).toBe('no-edge')
    expect(m.hasHighSharpness).toBe(false)
  })

  it('detects const and strictEq in minimal content', () => {
    const m = measureSharpening(minimalContent)
    expect(m.sharpness).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureSharpening(richContent)
    expect(m.sharpness).toBe(100)
    expect(m.edge).toBe('monomolecular-edge')
  })

  it('detects precise (const + strictEq)', () => {
    expect(measureSharpening(richContent).hasPrecise).toBe(true)
  })

  it('detects exact (returnType + readonly)', () => {
    expect(measureSharpening(richContent).hasExact).toBe(true)
  })

  it('detects sharp (interface + class)', () => {
    expect(measureSharpening(richContent).hasSharp).toBe(true)
  })

  it('detects fine (export + import)', () => {
    expect(measureSharpening(richContent).hasFine).toBe(true)
  })

  it('detects defined (private + strictEq)', () => {
    expect(measureSharpening(richContent).hasDefined).toBe(true)
  })

  it('detects crisp (typeAlias + const)', () => {
    expect(measureSharpening(richContent).hasCrisp).toBe(true)
  })

  it('counts imprecise (var)', () => {
    expect(measureSharpening(badContent).impreciseCount).toBe(3)
  })

  it('counts blunt (any)', () => {
    expect(measureSharpening(badContent).bluntCount).toBe(2)
  })

  it('hasNoImprecise is false when var present', () => {
    expect(measureSharpening(badContent).hasNoImprecise).toBe(false)
  })

  it('hasNoBlunt is false when any present', () => {
    expect(measureSharpening(badContent).hasNoBlunt).toBe(false)
  })

  it('hasNoCoarse is false when eval present', () => {
    expect(measureSharpening(badContent).hasNoCoarse).toBe(false)
  })

  it('hasNoVague is false when debugger present', () => {
    expect(measureSharpening(badContent).hasNoVague).toBe(false)
  })
})

// ─── measureSourcing ───────────────────────────────────────────────

describe('measureSourcing', () => {
  it('returns 0 quality for empty content', () => {
    const m = measureSourcing(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.origin).toBe('sediment')
  })

  it('detects returnType and import in rich content', () => {
    const m = measureSourcing(richContent)
    expect(m.quality).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureSourcing(richContent)
    expect(m.quality).toBe(100)
    expect(m.origin).toBe('fresh-lava')
  })

  it('detects pureSource (returnType + import)', () => {
    expect(measureSourcing(richContent).hasPureSource).toBe(true)
  })

  it('detects cleanOrigin (export + async)', () => {
    expect(measureSourcing(richContent).hasCleanOrigin).toBe(true)
  })

  it('detects qualityOrigin (interface + generics)', () => {
    expect(measureSourcing(richContent).hasQualityOrigin).toBe(true)
  })

  it('detects authentic (namedExport + const)', () => {
    expect(measureSourcing(richContent).hasAuthentic).toBe(true)
  })

  it('detects genuine (docComments + export)', () => {
    expect(measureSourcing(richContent).hasGenuine).toBe(true)
  })

  it('detects natural (class + returnType)', () => {
    expect(measureSourcing(richContent).hasNatural).toBe(true)
  })

  it('counts contaminated (var)', () => {
    expect(measureSourcing(badContent).contaminatedCount).toBe(3)
  })

  it('counts impure (any)', () => {
    expect(measureSourcing(badContent).impureCount).toBe(2)
  })

  it('hasNoContaminated is false when var present', () => {
    expect(measureSourcing(badContent).hasNoContaminated).toBe(false)
  })

  it('hasNoImpure is false when any present', () => {
    expect(measureSourcing(badContent).hasNoImpure).toBe(false)
  })

  it('hasNoFake is false when eval present', () => {
    expect(measureSourcing(badContent).hasNoFake).toBe(false)
  })

  it('hasNoSynthetic is false when debugger present', () => {
    expect(measureSourcing(badContent).hasNoSynthetic).toBe(false)
  })
})

// ─── measureRevealing ──────────────────────────────────────────────

describe('measureRevealing', () => {
  it('returns 0 clarity for empty content', () => {
    const m = measureRevealing(emptyContent)
    expect(m.clarity).toBe(0)
    expect(m.shadow).toBe('pitch-black')
  })

  it('scores rich content high', () => {
    const m = measureRevealing(richContent)
    expect(m.clarity).toBe(100)
    expect(m.shadow).toBe('shadow-master')
  })

  it('detects visible (docComments + typeAlias)', () => {
    expect(measureRevealing(richContent).hasVisible).toBe(true)
  })

  it('detects exposed (readonly + private)', () => {
    expect(measureRevealing(richContent).hasExposed).toBe(true)
  })

  it('detects detectable (interface + generics)', () => {
    expect(measureRevealing(richContent).hasDetectable).toBe(true)
  })

  it('detects clear (returnType + export)', () => {
    expect(measureRevealing(richContent).hasClear).toBe(true)
  })

  it('detects revealed (import + class)', () => {
    expect(measureRevealing(richContent).hasRevealed).toBe(true)
  })

  it('detects apparent (readonly + docComments)', () => {
    expect(measureRevealing(richContent).hasApparent).toBe(true)
  })

  it('counts hidden (var)', () => {
    expect(measureRevealing(badContent).hiddenCount).toBe(3)
  })

  it('counts invisible (any)', () => {
    expect(measureRevealing(badContent).invisibleCount).toBe(2)
  })

  it('hasNoHidden is false when var present', () => {
    expect(measureRevealing(badContent).hasNoHidden).toBe(false)
  })

  it('hasNoInvisible is false when any present', () => {
    expect(measureRevealing(badContent).hasNoInvisible).toBe(false)
  })

  it('hasNoMurky is false when eval present', () => {
    expect(measureRevealing(badContent).hasNoMurky).toBe(false)
  })

  it('hasNoConcealed is false when debugger present', () => {
    expect(measureRevealing(badContent).hasNoConcealed).toBe(false)
  })
})

// ─── measureProphesying ────────────────────────────────────────────

describe('measureProphesying', () => {
  it('returns 0 accuracy for empty content', () => {
    const m = measureProphesying(emptyContent)
    expect(m.accuracy).toBe(0)
    expect(m.prophecy).toBe('no-prophecy')
  })

  it('scores rich content high', () => {
    const m = measureProphesying(richContent)
    expect(m.accuracy).toBe(100)
    expect(m.prophecy).toBe('true-oracle')
  })

  it('detects predictable (export + import)', () => {
    expect(measureProphesying(richContent).hasPredictable).toBe(true)
  })

  it('detects reliable (const + strictEq)', () => {
    expect(measureProphesying(richContent).hasReliable).toBe(true)
  })

  it('detects consistent (interface + class)', () => {
    expect(measureProphesying(richContent).hasConsistent).toBe(true)
  })

  it('detects foreseeable (returnType + readonly)', () => {
    expect(measureProphesying(richContent).hasForeseeable).toBe(true)
  })

  it('detects dependable (async + export)', () => {
    expect(measureProphesying(richContent).hasDependable).toBe(true)
  })

  it('detects deterministic (generics + import)', () => {
    expect(measureProphesying(richContent).hasDeterministic).toBe(true)
  })

  it('counts unpredictable (var)', () => {
    expect(measureProphesying(badContent).unpredictableCount).toBe(3)
  })

  it('counts erratic (any)', () => {
    expect(measureProphesying(badContent).erraticCount).toBe(2)
  })

  it('hasNoUnpredictable is false when var present', () => {
    expect(measureProphesying(badContent).hasNoUnpredictable).toBe(false)
  })

  it('hasNoErratic is false when any present', () => {
    expect(measureProphesying(badContent).hasNoErratic).toBe(false)
  })

  it('hasNoSurprising is false when eval present', () => {
    expect(measureProphesying(badContent).hasNoSurprising).toBe(false)
  })

  it('hasNoRandom is false when debugger present', () => {
    expect(measureProphesying(badContent).hasNoRandom).toBe(false)
  })
})

// ─── classifyOracleCondition ───────────────────────────────────────

describe('classifyOracleCondition', () => {
  it('returns scrying-masterpiece for 85+', () => {
    expect(classifyOracleCondition(90)).toBe('scrying-masterpiece')
    expect(classifyOracleCondition(85)).toBe('scrying-masterpiece')
  })

  it('returns polished-oracle for 70-84', () => {
    expect(classifyOracleCondition(70)).toBe('polished-oracle')
    expect(classifyOracleCondition(84)).toBe('polished-oracle')
  })

  it('returns proper-scryer for 55-69', () => {
    expect(classifyOracleCondition(55)).toBe('proper-scryer')
    expect(classifyOracleCondition(69)).toBe('proper-scryer')
  })

  it('returns rough-crystal for 40-54', () => {
    expect(classifyOracleCondition(40)).toBe('rough-crystal')
    expect(classifyOracleCondition(54)).toBe('rough-crystal')
  })

  it('returns shattered-ball for 25-39', () => {
    expect(classifyOracleCondition(25)).toBe('shattered-ball')
    expect(classifyOracleCondition(39)).toBe('shattered-ball')
  })

  it('returns dust for < 25', () => {
    expect(classifyOracleCondition(0)).toBe('dust')
    expect(classifyOracleCondition(24)).toBe('dust')
  })
})

// ─── classifyTempleType ────────────────────────────────────────────

describe('classifyTempleType', () => {
  it('returns no-temple for empty array', () => {
    expect(classifyTempleType([])).toBe('no-temple')
  })

  it('returns delphic-oracle for high avg with masterpiece ratio', () => {
    const visions = [
      makeVision({ qualityScore: 90, condition: 'scrying-masterpiece' }),
      makeVision({ qualityScore: 88, condition: 'scrying-masterpiece' }),
    ]
    expect(classifyTempleType(visions)).toBe('delphic-oracle')
  })

  it('returns scrying-sanctum for avg 60+', () => {
    const visions = [makeVision({ qualityScore: 60, condition: 'polished-oracle' })]
    expect(classifyTempleType(visions)).toBe('scrying-sanctum')
  })

  it('returns proper-temple for avg 45-59', () => {
    const visions = [makeVision({ qualityScore: 45, condition: 'proper-scryer' })]
    expect(classifyTempleType(visions)).toBe('proper-temple')
  })

  it('returns dark-corner for avg 30-44', () => {
    const visions = [makeVision({ qualityScore: 30, condition: 'rough-crystal' })]
    expect(classifyTempleType(visions)).toBe('dark-corner')
  })

  it('returns broken-shrine for avg 15-29', () => {
    const visions = [makeVision({ qualityScore: 15, condition: 'shattered-ball' })]
    expect(classifyTempleType(visions)).toBe('broken-shrine')
  })

  it('returns no-temple for low quality', () => {
    const visions = [makeVision({ qualityScore: 10, condition: 'dust' })]
    expect(classifyTempleType(visions)).toBe('no-temple')
  })
})

// ─── classifyTempleCondition ───────────────────────────────────────

describe('classifyTempleCondition', () => {
  it('returns oracle-chamber for 75+', () => {
    expect(classifyTempleCondition(80)).toBe('oracle-chamber')
  })

  it('returns divination-room for 60-74', () => {
    expect(classifyTempleCondition(60)).toBe('divination-room')
  })

  it('returns decent-space for 45-59', () => {
    expect(classifyTempleCondition(45)).toBe('decent-space')
  })

  it('returns dim-corner for 30-44', () => {
    expect(classifyTempleCondition(30)).toBe('dim-corner')
  })

  it('returns ruined for 15-29', () => {
    expect(classifyTempleCondition(15)).toBe('ruined')
  })

  it('returns void for < 15', () => {
    expect(classifyTempleCondition(10)).toBe('void')
  })
})

// ─── classifySeerGrade ─────────────────────────────────────────────

describe('classifySeerGrade', () => {
  it('returns oracle-supreme for 80+', () => {
    expect(classifySeerGrade(85)).toBe('oracle-supreme')
  })

  it('returns master-seer for 65-79', () => {
    expect(classifySeerGrade(65)).toBe('master-seer')
  })

  it('returns skilled-diviner for 50-64', () => {
    expect(classifySeerGrade(50)).toBe('skilled-diviner')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifySeerGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifySeerGrade(20)).toBe('novice')
  })

  it('returns blind-prophet for < 20', () => {
    expect(classifySeerGrade(10)).toBe('blind-prophet')
  })
})

// ─── analyzeOracleVision ───────────────────────────────────────────

describe('analyzeOracleVision', () => {
  it('analyzes minimal content', () => {
    const vision = analyzeOracleVision(minimalContent, 'test.ts')
    expect(vision.file).toBe('test.ts')
    expect(vision.reflectionDepth).toBeGreaterThan(0)
    expect(vision.qualityScore).toBeGreaterThan(0)
    expect(vision.condition).toBeDefined()
  })

  it('analyzes rich content with high scores', () => {
    const vision = analyzeOracleVision(richContent, 'rich.ts')
    expect(vision.reflectionDepth).toBe(100)
    expect(vision.edgeSharpness).toBe(100)
    expect(vision.volcanicOrigin).toBe(100)
    expect(vision.shadowClarity).toBe(100)
    expect(vision.prophecyAccuracy).toBe(100)
    expect(vision.qualityScore).toBe(100)
    expect(vision.condition).toBe('scrying-masterpiece')
  })

  it('computes qualityScore as weighted average', () => {
    const vision = analyzeOracleVision(minimalContent, 'minimal.ts')
    const expected = Math.round(
      vision.reflecting.depth * 0.2 +
      vision.sharpening.sharpness * 0.2 +
      vision.sourcing.quality * 0.2 +
      vision.revealing.clarity * 0.2 +
      vision.prophesying.accuracy * 0.2,
    )
    expect(vision.qualityScore).toBe(expected)
  })

  it('classifies condition based on qualityScore', () => {
    const vision = analyzeOracleVision(richContent, 'rich.ts')
    expect(vision.condition).toBe(classifyOracleCondition(vision.qualityScore))
  })

  it('maps top-level scores from measures', () => {
    const vision = analyzeOracleVision(richContent, 'rich.ts')
    expect(vision.reflectionDepth).toBe(vision.reflecting.depth)
    expect(vision.edgeSharpness).toBe(vision.sharpening.sharpness)
    expect(vision.volcanicOrigin).toBe(vision.sourcing.quality)
    expect(vision.shadowClarity).toBe(vision.revealing.clarity)
    expect(vision.prophecyAccuracy).toBe(vision.prophesying.accuracy)
  })
})

// ─── analyzeOracleTemple ───────────────────────────────────────────

describe('analyzeOracleTemple', () => {
  it('returns empty temple for no visions', () => {
    const temple = analyzeOracleTemple([], 'empty')
    expect(temple.visions).toEqual([])
    expect(temple.avgDepth).toBe(0)
    expect(temple.avgSharpness).toBe(0)
    expect(temple.avgAccuracy).toBe(0)
    expect(temple.scryingMasterpieceCount).toBe(0)
    expect(temple.dustCount).toBe(0)
    expect(temple.templeType).toBe('no-temple')
    expect(temple.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const visions = [
      makeVision({ reflectionDepth: 80, edgeSharpness: 60, prophecyAccuracy: 70, qualityScore: 70, condition: 'polished-oracle' }),
      makeVision({ reflectionDepth: 60, edgeSharpness: 80, prophecyAccuracy: 50, qualityScore: 60, condition: 'polished-oracle' }),
    ]
    const temple = analyzeOracleTemple(visions, 'src')
    expect(temple.avgDepth).toBe(70)
    expect(temple.avgSharpness).toBe(70)
    expect(temple.avgAccuracy).toBe(60)
  })

  it('counts conditions correctly', () => {
    const visions = [
      makeVision({ condition: 'scrying-masterpiece', qualityScore: 90 }),
      makeVision({ condition: 'dust', qualityScore: 10 }),
    ]
    const temple = analyzeOracleTemple(visions, 'src')
    expect(temple.scryingMasterpieceCount).toBe(1)
    expect(temple.dustCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const goodProphecy: ProphecySummary = { avgDepth: 80, avgSharpness: 80, avgAccuracy: 80, isProphetic: true, overallVision: 80 }
  const goodStats: MidnightOracleStats = {
    totalFiles: 1, totalTemples: 1,
    avgReflectionDepth: 80, avgEdgeSharpness: 80, avgVolcanicOrigin: 80,
    avgShadowClarity: 80, avgProphecyAccuracy: 80,
    scryingMasterpieceCount: 1, polishedOracleCount: 0, properScryerCount: 0,
    roughCrystalCount: 0, shatteredBallCount: 0, dustCount: 0,
    hasHighDepthCount: 1, hasHighSharpnessCount: 1, hasHighQualityCount: 1,
    hasHighClarityCount: 1, hasHighAccuracyCount: 1,
    overallVision: 80, seerGrade: 'oracle-supreme',
    bestVision: 'a.ts', deepest: 'a.ts', sharpest: 'a.ts',
    purest: 'a.ts', mostAccurate: 'a.ts',
  }

  it('returns celebration when all is good', () => {
    const recs = generateRecommendations(
      [makeVision({ condition: 'scrying-masterpiece', qualityScore: 90 })],
      [{ directory: 'src', visions: [makeVision()], avgDepth: 80, avgSharpness: 80, avgAccuracy: 80, scryingMasterpieceCount: 1, dustCount: 0, templeType: 'delphic-oracle', condition: 'oracle-chamber' }],
      goodProphecy, goodStats,
    )
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('oracle-supreme')
  })

  it('recommends increasing reflection depth when low', () => {
    const stats = { ...goodStats, avgReflectionDepth: 40 }
    const recs = generateRecommendations([], [], goodProphecy, stats)
    expect(recs.some(r => r.includes('reflection'))).toBe(true)
  })

  it('recommends boosting edge sharpness when low', () => {
    const stats = { ...goodStats, avgEdgeSharpness: 40 }
    const recs = generateRecommendations([], [], goodProphecy, stats)
    expect(recs.some(r => r.includes('sharpness'))).toBe(true)
  })

  it('recommends purifying volcanic origin when low', () => {
    const stats = { ...goodStats, avgVolcanicOrigin: 40 }
    const recs = generateRecommendations([], [], goodProphecy, stats)
    expect(recs.some(r => r.includes('volcanic'))).toBe(true)
  })

  it('recommends clarifying shadows when low', () => {
    const stats = { ...goodStats, avgShadowClarity: 40 }
    const recs = generateRecommendations([], [], goodProphecy, stats)
    expect(recs.some(r => r.includes('shadow'))).toBe(true)
  })

  it('recommends improving prophecy accuracy when low', () => {
    const stats = { ...goodStats, avgProphecyAccuracy: 40 }
    const recs = generateRecommendations([], [], goodProphecy, stats)
    expect(recs.some(r => r.includes('prophecy'))).toBe(true)
  })

  it('flags dust files', () => {
    const stats = { ...goodStats, dustCount: 3 }
    const recs = generateRecommendations([], [], goodProphecy, stats)
    expect(recs.some(r => r.includes('dust'))).toBe(true)
  })

  it('warns about low vision', () => {
    const prophecy: ProphecySummary = { avgDepth: 30, avgSharpness: 30, avgAccuracy: 30, isProphetic: false, overallVision: 30 }
    const recs = generateRecommendations([], [], prophecy, goodStats)
    expect(recs.some(r => r.includes('vision'))).toBe(true)
  })

  it('warns when all temples are broken', () => {
    const temples: OracleTemple[] = [
      { directory: 'a', visions: [], avgDepth: 0, avgSharpness: 0, avgAccuracy: 0, scryingMasterpieceCount: 0, dustCount: 0, templeType: 'no-temple', condition: 'void' },
      { directory: 'b', visions: [], avgDepth: 0, avgSharpness: 0, avgAccuracy: 0, scryingMasterpieceCount: 0, dustCount: 0, templeType: 'broken-shrine', condition: 'ruined' },
    ]
    const recs = generateRecommendations([], temples, goodProphecy, goodStats)
    expect(recs.some(r => r.includes('broken'))).toBe(true)
  })

  it('names specific dust files when 1-3', () => {
    const visions = [
      makeVision({ file: 'a.ts', condition: 'dust', qualityScore: 10 }),
      makeVision({ file: 'b.ts', condition: 'dust', qualityScore: 10 }),
    ]
    const recs = generateRecommendations(visions, [], goodProphecy, goodStats)
    expect(recs.some(r => r.includes('a.ts'))).toBe(true)
    expect(recs.some(r => r.includes('b.ts'))).toBe(true)
  })
})

// ─── buildMidnightOracleResult ──────────────────────────────────────

describe('buildMidnightOracleResult', () => {
  it('handles empty input', async () => {
    const result = await buildMidnightOracleResult([], [])
    expect(result.visions).toEqual([])
    expect(result.temples).toEqual([])
    expect(result.prophecy.avgDepth).toBe(0)
    expect(result.prophecy.overallVision).toBe(0)
    expect(result.prophecy.isProphetic).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.seerGrade).toBe('blind-prophet')
  })

  it('processes minimal content', async () => {
    const result = await buildMidnightOracleResult(['test.ts'], [minimalContent])
    expect(result.visions).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgReflectionDepth).toBeGreaterThan(0)
  })

  it('processes rich content', async () => {
    const result = await buildMidnightOracleResult(['rich.ts'], [richContent])
    expect(result.visions[0].qualityScore).toBe(100)
    expect(result.prophecy.avgDepth).toBe(100)
    expect(result.prophecy.isProphetic).toBe(true)
    expect(result.prophecy.overallVision).toBe(100)
    expect(result.stats.seerGrade).toBe('oracle-supreme')
  })

  it('groups files by directory into temples', async () => {
    const result = await buildMidnightOracleResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    expect(result.temples).toHaveLength(2)
    expect(result.stats.totalTemples).toBe(2)
  })

  it('computes prophecy correctly', async () => {
    const result = await buildMidnightOracleResult(['f.ts'], [richContent])
    expect(result.prophecy.avgDepth).toBe(result.stats.avgReflectionDepth)
    expect(result.prophecy.avgSharpness).toBe(result.stats.avgEdgeSharpness)
    expect(result.prophecy.avgAccuracy).toBe(result.stats.avgProphecyAccuracy)
    expect(result.prophecy.overallVision).toBe(result.stats.overallVision)
  })

  it('computes bestVision and other extremes', async () => {
    const result = await buildMidnightOracleResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestVision).toBe('b.ts')
    expect(result.stats.deepest).toBe('b.ts')
    expect(result.stats.sharpest).toBe('b.ts')
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildMidnightOracleResult(['r.ts'], [richContent])
    expect(result.stats.scryingMasterpieceCount).toBe(1)
    expect(result.stats.dustCount).toBe(0)
  })

  it('tracks high measure counts', async () => {
    const result = await buildMidnightOracleResult(['r.ts'], [richContent])
    expect(result.stats.hasHighDepthCount).toBe(1)
    expect(result.stats.hasHighSharpnessCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighAccuracyCount).toBe(1)
  })

  it('includes recommendations', async () => {
    const result = await buildMidnightOracleResult(['r.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('isProphetic is true when avgDepth >= 60', async () => {
    const result = await buildMidnightOracleResult(['r.ts'], [richContent])
    expect(result.prophecy.isProphetic).toBe(true)
  })

  it('isProphetic is false when avgDepth < 60', async () => {
    const result = await buildMidnightOracleResult(['e.ts'], [emptyContent])
    expect(result.prophecy.isProphetic).toBe(false)
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
    expect(typeof colorGrade('scrying-masterpiece')).toBe('string')
    expect(typeof colorGrade('dust')).toBe('string')
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatVisionTable', () => {
  it('formats a vision with file name', () => {
    const vision = analyzeOracleVision(richContent, 'test.ts')
    const formatted = formatVisionTable(vision)
    expect(formatted).toContain('test.ts')
    expect(formatted).toContain('Reflection Depth')
    expect(formatted).toContain('Score')
  })
})

describe('formatVisionsTable', () => {
  it('returns message for empty array', () => {
    expect(formatVisionsTable([])).toContain('No oracle visions')
  })

  it('formats multiple visions', () => {
    const visions = [
      analyzeOracleVision(richContent, 'a.ts'),
      analyzeOracleVision(minimalContent, 'b.ts'),
    ]
    const formatted = formatVisionsTable(visions)
    expect(formatted).toContain('a.ts')
    expect(formatted).toContain('b.ts')
  })
})

describe('formatTempleTable', () => {
  it('formats a temple', () => {
    const temple = analyzeOracleTemple([makeVision()], 'src')
    const formatted = formatTempleTable(temple)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Type')
  })
})

describe('formatTemplesTable', () => {
  it('returns message for empty array', () => {
    expect(formatTemplesTable([])).toContain('No oracle temples')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', async () => {
    const result = await buildMidnightOracleResult(['f.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Seer Grade')
    expect(formatted).toContain('Best Vision')
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
    const result = await buildMidnightOracleResult(['f.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Midnight Oracle Analysis')
    expect(formatted).toContain('Prophecy')
    expect(formatted).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildMidnightOracleResult(['f.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.visions).toHaveLength(1)
    expect(parsed.prophecy.overallVision).toBe(100)
  })
})
