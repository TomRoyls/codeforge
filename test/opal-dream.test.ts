import { describe, it, expect } from 'vitest'
import {
  measureDreaming,
  measureFlashing,
  measureToning,
  measureStabilizing,
  measureHarmonizing,
  classifyOpalCondition,
  classifyFieldType,
  classifyFieldCondition,
  classifyDreamerGrade,
  analyzeOpalDream,
  analyzeDreamField,
  generateRecommendations,
  buildOpalDreamResult,
  type OpalDream,
  type DreamField,
  type VisionSummary,
  type OpalDreamStats,
} from '../src/commands/opal-dream-helpers.js'
import {
  colorScore,
  colorGrade,
  formatDreamTable,
  formatDreamsTable,
  formatFieldTable,
  formatFieldsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/opal-dream-format-helpers.js'

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

const sampleDream: OpalDream = {
  file: 'src/index.ts',
  dreamVividness: 80,
  flashBrilliance: 75,
  bodyTone: 70,
  hydroStability: 65,
  patternHarmony: 60,
  dreaming: {
    vividness: 80, grade: 'colorful-vision', hasHighVividness: true,
    hasImaginative: true, hasCreative: true, hasNoDerivative: true,
    hasOriginal: true, hasNoStale: true, hasVivid: true,
    hasNoDull: true, hasExpressive: true, hasNoFormulaic: true,
    hasRich: true, derivativeCount: 0, staleCount: 0,
  },
  flashing: {
    brilliance: 75, flash: 'bright-spark', hasHighBrilliance: true,
    hasImpactful: true, hasStriking: true, hasNoWeak: true,
    hasDazzling: true, hasNoFaint: true, hasBrilliant: true,
    hasNoDim: true, hasPowerful: true, hasNoSubtle: true,
    hasVivid2: true, weakCount: 0, faintCount: 0,
  },
  toning: {
    quality: 70, tone: 'dark-body', hasHighQuality: true,
    hasSolid: true, hasSubstantial: true, hasNoWeak: true,
    hasStrong: true, hasNoThin: true, hasFoundational: true,
    hasNoFlimsy: true, hasGrounded: true, hasNoShallow: true,
    hasDeep: true, weakCount: 0, thinCount: 0,
  },
  stabilizing: {
    stability: 65, hydro: 'well-maintained', hasHighStability: false,
    hasStable: true, hasBalanced: true, hasNoVolatile: true,
    hasConsistent: true, hasNoFluctuating: true, hasReliable: true,
    hasNoErratic: true, hasSteady: true, hasNoShifting: true,
    hasEnduring: true, volatileCount: 0, fluctuatingCount: 0,
  },
  harmonizing: {
    harmony: 60, pattern: 'harmonious-design', hasHighHarmony: false,
    hasConsistent: true, hasMatching: true, hasNoClashing: true,
    hasUnified: true, hasNoDiscordant: true, hasCoherent: true,
    hasNoIncoherent: true, hasHarmonious: true, hasNoChaotic: true,
    hasBlended: true, clashingCount: 0, discordantCount: 0,
  },
  condition: 'boulder-opal',
  qualityScore: 70,
}

function makeDream(overrides: Partial<OpalDream> = {}): OpalDream {
  return { ...sampleDream, ...overrides }
}

// ─── measureDreaming ───────────────────────────────────────────────

describe('measureDreaming', () => {
  it('returns 0 vividness for empty content', () => {
    const m = measureDreaming(emptyContent)
    expect(m.vividness).toBe(0)
    expect(m.grade).toBe('no-dream')
    expect(m.hasHighVividness).toBe(false)
  })

  it('detects export in minimal content', () => {
    const m = measureDreaming(minimalContent)
    expect(m.vividness).toBeGreaterThan(0)
    expect(m.hasImaginative).toBe(false)
  })

  it('scores rich content high', () => {
    const m = measureDreaming(richContent)
    expect(m.vividness).toBe(100)
    expect(m.grade).toBe('vivid-dream')
    expect(m.hasHighVividness).toBe(true)
  })

  it('detects imaginative (export + async)', () => {
    expect(measureDreaming(richContent).hasImaginative).toBe(true)
    expect(measureDreaming(minimalContent).hasImaginative).toBe(false)
  })

  it('detects creative (interface + generics)', () => {
    expect(measureDreaming(richContent).hasCreative).toBe(true)
  })

  it('detects original (namedExport + returnType)', () => {
    expect(measureDreaming(richContent).hasOriginal).toBe(true)
  })

  it('detects vivid (docComments + import)', () => {
    expect(measureDreaming(richContent).hasVivid).toBe(true)
  })

  it('detects expressive (class + typeAlias)', () => {
    expect(measureDreaming(richContent).hasExpressive).toBe(true)
  })

  it('detects rich (export + interface)', () => {
    expect(measureDreaming(richContent).hasRich).toBe(true)
  })

  it('counts derivative (var)', () => {
    expect(measureDreaming(badContent).derivativeCount).toBe(3)
    expect(measureDreaming(richContent).derivativeCount).toBe(0)
  })

  it('counts stale (any)', () => {
    expect(measureDreaming(badContent).staleCount).toBe(2)
  })

  it('hasNoDerivative is false when var present', () => {
    expect(measureDreaming(badContent).hasNoDerivative).toBe(false)
    expect(measureDreaming(richContent).hasNoDerivative).toBe(true)
  })

  it('hasNoStale is false when any present', () => {
    expect(measureDreaming(badContent).hasNoStale).toBe(false)
  })

  it('hasNoDull is false when eval present', () => {
    expect(measureDreaming(badContent).hasNoDull).toBe(false)
  })

  it('hasNoFormulaic is false when debugger present', () => {
    expect(measureDreaming(badContent).hasNoFormulaic).toBe(false)
  })
})

// ─── measureFlashing ───────────────────────────────────────────────

describe('measureFlashing', () => {
  it('returns 0 brilliance for empty content', () => {
    const m = measureFlashing(emptyContent)
    expect(m.brilliance).toBe(0)
    expect(m.flash).toBe('no-flash')
    expect(m.hasHighBrilliance).toBe(false)
  })

  it('detects const in minimal content', () => {
    const m = measureFlashing(minimalContent)
    expect(m.brilliance).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureFlashing(richContent)
    expect(m.brilliance).toBe(100)
    expect(m.flash).toBe('lightning-flash')
  })

  it('detects impactful (returnType + strictEq)', () => {
    expect(measureFlashing(richContent).hasImpactful).toBe(true)
    expect(measureFlashing(minimalContent).hasImpactful).toBe(false)
  })

  it('detects striking (readonly + private)', () => {
    expect(measureFlashing(richContent).hasStriking).toBe(true)
  })

  it('detects dazzling (namedExport + generics)', () => {
    expect(measureFlashing(richContent).hasDazzling).toBe(true)
  })

  it('detects brilliant (interface + async)', () => {
    expect(measureFlashing(richContent).hasBrilliant).toBe(true)
  })

  it('detects powerful (docComments + const)', () => {
    expect(measureFlashing(richContent).hasPowerful).toBe(true)
  })

  it('detects vivid2 (returnType + readonly)', () => {
    expect(measureFlashing(richContent).hasVivid2).toBe(true)
  })

  it('counts weak (var)', () => {
    expect(measureFlashing(badContent).weakCount).toBe(3)
  })

  it('counts faint (any)', () => {
    expect(measureFlashing(badContent).faintCount).toBe(2)
  })

  it('hasNoWeak is false when var present', () => {
    expect(measureFlashing(badContent).hasNoWeak).toBe(false)
  })

  it('hasNoFaint is false when any present', () => {
    expect(measureFlashing(badContent).hasNoFaint).toBe(false)
  })

  it('hasNoDim is false when eval present', () => {
    expect(measureFlashing(badContent).hasNoDim).toBe(false)
  })

  it('hasNoSubtle is false when debugger present', () => {
    expect(measureFlashing(badContent).hasNoSubtle).toBe(false)
  })
})

// ─── measureToning ─────────────────────────────────────────────────

describe('measureToning', () => {
  it('returns 0 quality for empty content', () => {
    const m = measureToning(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.tone).toBe('no-body')
  })

  it('detects const in minimal content', () => {
    const m = measureToning(minimalContent)
    expect(m.quality).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureToning(richContent)
    expect(m.quality).toBe(100)
    expect(m.tone).toBe('black-body')
  })

  it('detects solid (const + strictEq)', () => {
    expect(measureToning(richContent).hasSolid).toBe(true)
  })

  it('detects substantial (interface + typeAlias)', () => {
    expect(measureToning(richContent).hasSubstantial).toBe(true)
  })

  it('detects strong (export + import)', () => {
    expect(measureToning(richContent).hasStrong).toBe(true)
  })

  it('detects foundational (returnType + readonly)', () => {
    expect(measureToning(richContent).hasFoundational).toBe(true)
  })

  it('detects grounded (private + strictEq)', () => {
    expect(measureToning(richContent).hasGrounded).toBe(true)
  })

  it('detects deep (class + const)', () => {
    expect(measureToning(richContent).hasDeep).toBe(true)
  })

  it('counts weak (var)', () => {
    expect(measureToning(badContent).weakCount).toBe(3)
  })

  it('counts thin (any)', () => {
    expect(measureToning(badContent).thinCount).toBe(2)
  })

  it('hasNoWeak is false when var present', () => {
    expect(measureToning(badContent).hasNoWeak).toBe(false)
  })

  it('hasNoThin is false when any present', () => {
    expect(measureToning(badContent).hasNoThin).toBe(false)
  })

  it('hasNoFlimsy is false when eval present', () => {
    expect(measureToning(badContent).hasNoFlimsy).toBe(false)
  })

  it('hasNoShallow is false when debugger present', () => {
    expect(measureToning(badContent).hasNoShallow).toBe(false)
  })
})

// ─── measureStabilizing ────────────────────────────────────────────

describe('measureStabilizing', () => {
  it('returns 0 stability for empty content', () => {
    const m = measureStabilizing(emptyContent)
    expect(m.stability).toBe(0)
    expect(m.hydro).toBe('crazed')
  })

  it('detects export in minimal content', () => {
    const m = measureStabilizing(minimalContent)
    expect(m.stability).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureStabilizing(richContent)
    expect(m.stability).toBe(100)
    expect(m.hydro).toBe('perfectly-stable')
  })

  it('detects stable (namedExport + export)', () => {
    expect(measureStabilizing(richContent).hasStable).toBe(true)
    expect(measureStabilizing(minimalContent).hasStable).toBe(true)
  })

  it('detects balanced (returnType + strictEq)', () => {
    expect(measureStabilizing(richContent).hasBalanced).toBe(true)
  })

  it('detects consistent (readonly + private)', () => {
    expect(measureStabilizing(richContent).hasConsistent).toBe(true)
  })

  it('detects reliable (interface + generics)', () => {
    expect(measureStabilizing(richContent).hasReliable).toBe(true)
  })

  it('detects steady (docComments + namedExport)', () => {
    expect(measureStabilizing(richContent).hasSteady).toBe(true)
  })

  it('detects enduring (class + returnType)', () => {
    expect(measureStabilizing(richContent).hasEnduring).toBe(true)
  })

  it('counts volatile (var)', () => {
    expect(measureStabilizing(badContent).volatileCount).toBe(3)
  })

  it('counts fluctuating (any)', () => {
    expect(measureStabilizing(badContent).fluctuatingCount).toBe(2)
  })

  it('hasNoVolatile is false when var present', () => {
    expect(measureStabilizing(badContent).hasNoVolatile).toBe(false)
  })

  it('hasNoFluctuating is false when any present', () => {
    expect(measureStabilizing(badContent).hasNoFluctuating).toBe(false)
  })

  it('hasNoErratic is false when eval present', () => {
    expect(measureStabilizing(badContent).hasNoErratic).toBe(false)
  })

  it('hasNoShifting is false when debugger present', () => {
    expect(measureStabilizing(badContent).hasNoShifting).toBe(false)
  })
})

// ─── measureHarmonizing ────────────────────────────────────────────

describe('measureHarmonizing', () => {
  it('returns 0 harmony for empty content', () => {
    const m = measureHarmonizing(emptyContent)
    expect(m.harmony).toBe(0)
    expect(m.pattern).toBe('no-pattern')
  })

  it('detects const and export in minimal content', () => {
    const m = measureHarmonizing(minimalContent)
    expect(m.harmony).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureHarmonizing(richContent)
    expect(m.harmony).toBe(100)
    expect(m.pattern).toBe('symphony-pattern')
  })

  it('detects consistent (const + export)', () => {
    expect(measureHarmonizing(richContent).hasConsistent).toBe(true)
  })

  it('detects matching (import + returnType)', () => {
    expect(measureHarmonizing(richContent).hasMatching).toBe(true)
  })

  it('detects unified (interface + generics)', () => {
    expect(measureHarmonizing(richContent).hasUnified).toBe(true)
  })

  it('detects coherent (typeAlias + docComments)', () => {
    expect(measureHarmonizing(richContent).hasCoherent).toBe(true)
  })

  it('detects harmonious (readonly + async)', () => {
    expect(measureHarmonizing(richContent).hasHarmonious).toBe(true)
  })

  it('detects blended (const + import)', () => {
    expect(measureHarmonizing(richContent).hasBlended).toBe(true)
  })

  it('counts clashing (var)', () => {
    expect(measureHarmonizing(badContent).clashingCount).toBe(3)
  })

  it('counts discordant (any)', () => {
    expect(measureHarmonizing(badContent).discordantCount).toBe(2)
  })

  it('hasNoClashing is false when var present', () => {
    expect(measureHarmonizing(badContent).hasNoClashing).toBe(false)
  })

  it('hasNoDiscordant is false when any present', () => {
    expect(measureHarmonizing(badContent).hasNoDiscordant).toBe(false)
  })

  it('hasNoIncoherent is false when eval present', () => {
    expect(measureHarmonizing(badContent).hasNoIncoherent).toBe(false)
  })

  it('hasNoChaotic is false when debugger present', () => {
    expect(measureHarmonizing(badContent).hasNoChaotic).toBe(false)
  })
})

// ─── classifyOpalCondition ─────────────────────────────────────────

describe('classifyOpalCondition', () => {
  it('returns precious-opal for 85+', () => {
    expect(classifyOpalCondition(90)).toBe('precious-opal')
    expect(classifyOpalCondition(85)).toBe('precious-opal')
  })

  it('returns boulder-opal for 70-84', () => {
    expect(classifyOpalCondition(70)).toBe('boulder-opal')
    expect(classifyOpalCondition(84)).toBe('boulder-opal')
  })

  it('returns proper-opal for 55-69', () => {
    expect(classifyOpalCondition(55)).toBe('proper-opal')
    expect(classifyOpalCondition(69)).toBe('proper-opal')
  })

  it('returns common-opal for 40-54', () => {
    expect(classifyOpalCondition(40)).toBe('common-opal')
    expect(classifyOpalCondition(54)).toBe('common-opal')
  })

  it('returns potch for 25-39', () => {
    expect(classifyOpalCondition(25)).toBe('potch')
    expect(classifyOpalCondition(39)).toBe('potch')
  })

  it('returns dust for < 25', () => {
    expect(classifyOpalCondition(0)).toBe('dust')
    expect(classifyOpalCondition(24)).toBe('dust')
  })
})

// ─── classifyFieldType ─────────────────────────────────────────────

describe('classifyFieldType', () => {
  it('returns no-field for empty array', () => {
    expect(classifyFieldType([])).toBe('no-field')
  })

  it('returns lightning-ridge for high avg with precious ratio', () => {
    const dreams = [
      makeDream({ qualityScore: 90, condition: 'precious-opal' }),
      makeDream({ qualityScore: 88, condition: 'precious-opal' }),
    ]
    expect(classifyFieldType(dreams)).toBe('lightning-ridge')
  })

  it('returns coober-pedy for avg 60+', () => {
    const dreams = [makeDream({ qualityScore: 60, condition: 'boulder-opal' })]
    expect(classifyFieldType(dreams)).toBe('coober-pedy')
  })

  it('returns wello for avg 45-59', () => {
    const dreams = [makeDream({ qualityScore: 45, condition: 'proper-opal' })]
    expect(classifyFieldType(dreams)).toBe('wello')
  })

  it('returns proper-field for avg 30-44', () => {
    const dreams = [makeDream({ qualityScore: 30, condition: 'common-opal' })]
    expect(classifyFieldType(dreams)).toBe('proper-field')
  })

  it('returns dry-bed for avg 15-29', () => {
    const dreams = [makeDream({ qualityScore: 15, condition: 'potch' })]
    expect(classifyFieldType(dreams)).toBe('dry-bed')
  })

  it('returns no-field for low quality', () => {
    const dreams = [makeDream({ qualityScore: 10, condition: 'dust' })]
    expect(classifyFieldType(dreams)).toBe('no-field')
  })
})

// ─── classifyFieldCondition ────────────────────────────────────────

describe('classifyFieldCondition', () => {
  it('returns brilliant-field for 75+', () => {
    expect(classifyFieldCondition(80)).toBe('brilliant-field')
  })

  it('returns colorful-display for 60-74', () => {
    expect(classifyFieldCondition(60)).toBe('colorful-display')
  })

  it('returns decent-patch for 45-59', () => {
    expect(classifyFieldCondition(45)).toBe('decent-patch')
  })

  it('returns faint-glow for 30-44', () => {
    expect(classifyFieldCondition(30)).toBe('faint-glow')
  })

  it('returns barely-visible for 15-29', () => {
    expect(classifyFieldCondition(15)).toBe('barely-visible')
  })

  it('returns invisible for < 15', () => {
    expect(classifyFieldCondition(10)).toBe('invisible')
  })
})

// ─── classifyDreamerGrade ──────────────────────────────────────────

describe('classifyDreamerGrade', () => {
  it('returns master-dreamer for 80+', () => {
    expect(classifyDreamerGrade(85)).toBe('master-dreamer')
  })

  it('returns opal-hunter for 65-79', () => {
    expect(classifyDreamerGrade(65)).toBe('opal-hunter')
  })

  it('returns gem-dreamer for 50-64', () => {
    expect(classifyDreamerGrade(50)).toBe('gem-dreamer')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyDreamerGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyDreamerGrade(20)).toBe('novice')
  })

  it('returns sleepwalker for < 20', () => {
    expect(classifyDreamerGrade(10)).toBe('sleepwalker')
  })
})

// ─── analyzeOpalDream ──────────────────────────────────────────────

describe('analyzeOpalDream', () => {
  it('analyzes minimal content', () => {
    const dream = analyzeOpalDream(minimalContent, 'test.ts')
    expect(dream.file).toBe('test.ts')
    expect(dream.dreamVividness).toBeGreaterThan(0)
    expect(dream.qualityScore).toBeGreaterThan(0)
    expect(dream.condition).toBeDefined()
  })

  it('analyzes rich content with high scores', () => {
    const dream = analyzeOpalDream(richContent, 'rich.ts')
    expect(dream.dreamVividness).toBe(100)
    expect(dream.flashBrilliance).toBe(100)
    expect(dream.bodyTone).toBe(100)
    expect(dream.hydroStability).toBe(100)
    expect(dream.patternHarmony).toBe(100)
    expect(dream.qualityScore).toBe(100)
    expect(dream.condition).toBe('precious-opal')
  })

  it('computes qualityScore as weighted average', () => {
    const dream = analyzeOpalDream(minimalContent, 'minimal.ts')
    const expected = Math.round(
      dream.dreaming.vividness * 0.2 +
      dream.flashing.brilliance * 0.2 +
      dream.toning.quality * 0.2 +
      dream.stabilizing.stability * 0.2 +
      dream.harmonizing.harmony * 0.2,
    )
    expect(dream.qualityScore).toBe(expected)
  })

  it('classifies condition based on qualityScore', () => {
    const dream = analyzeOpalDream(richContent, 'rich.ts')
    expect(dream.condition).toBe(classifyOpalCondition(dream.qualityScore))
  })

  it('maps top-level scores from measures', () => {
    const dream = analyzeOpalDream(richContent, 'rich.ts')
    expect(dream.dreamVividness).toBe(dream.dreaming.vividness)
    expect(dream.flashBrilliance).toBe(dream.flashing.brilliance)
    expect(dream.bodyTone).toBe(dream.toning.quality)
    expect(dream.hydroStability).toBe(dream.stabilizing.stability)
    expect(dream.patternHarmony).toBe(dream.harmonizing.harmony)
  })
})

// ─── analyzeDreamField ─────────────────────────────────────────────

describe('analyzeDreamField', () => {
  it('returns empty field for no dreams', () => {
    const field = analyzeDreamField([], 'empty')
    expect(field.dreams).toEqual([])
    expect(field.avgVividness).toBe(0)
    expect(field.avgBrilliance).toBe(0)
    expect(field.avgHarmony).toBe(0)
    expect(field.preciousOpalCount).toBe(0)
    expect(field.dustCount).toBe(0)
    expect(field.fieldType).toBe('no-field')
    expect(field.condition).toBe('invisible')
  })

  it('computes averages correctly', () => {
    const dreams = [
      makeDream({ dreamVividness: 80, flashBrilliance: 60, patternHarmony: 70, qualityScore: 70, condition: 'boulder-opal' }),
      makeDream({ dreamVividness: 60, flashBrilliance: 80, patternHarmony: 50, qualityScore: 60, condition: 'boulder-opal' }),
    ]
    const field = analyzeDreamField(dreams, 'src')
    expect(field.avgVividness).toBe(70)
    expect(field.avgBrilliance).toBe(70)
    expect(field.avgHarmony).toBe(60)
  })

  it('counts conditions correctly', () => {
    const dreams = [
      makeDream({ condition: 'precious-opal', qualityScore: 90 }),
      makeDream({ condition: 'dust', qualityScore: 10 }),
    ]
    const field = analyzeDreamField(dreams, 'src')
    expect(field.preciousOpalCount).toBe(1)
    expect(field.dustCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const goodVision: VisionSummary = { avgVividness: 80, avgBrilliance: 80, avgHarmony: 80, isVivid: true, overallBrilliance: 80 }
  const goodStats: OpalDreamStats = {
    totalFiles: 1, totalFields: 1,
    avgDreamVividness: 80, avgFlashBrilliance: 80, avgBodyTone: 80,
    avgHydroStability: 80, avgPatternHarmony: 80,
    preciousOpalCount: 1, boulderOpalCount: 0, properOpalCount: 0,
    commonOpalCount: 0, potchCount: 0, dustCount: 0,
    hasHighVividnessCount: 1, hasHighBrillianceCount: 1, hasHighQualityCount: 1,
    hasHighStabilityCount: 1, hasHighHarmonyCount: 1,
    overallBrilliance: 80, dreamerGrade: 'master-dreamer',
    bestDream: 'a.ts', mostVivid: 'a.ts', mostBrilliant: 'a.ts',
    strongestBody: 'a.ts', mostStable: 'a.ts',
  }

  it('returns celebration when all is good', () => {
    const recs = generateRecommendations(
      [makeDream({ condition: 'precious-opal', qualityScore: 90 })],
      [{ directory: 'src', dreams: [makeDream()], avgVividness: 80, avgBrilliance: 80, avgHarmony: 80, preciousOpalCount: 1, dustCount: 0, fieldType: 'lightning-ridge', condition: 'brilliant-field' }],
      goodVision, goodStats,
    )
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('master-dreamer')
  })

  it('recommends enhancing vividness when low', () => {
    const stats = { ...goodStats, avgDreamVividness: 40 }
    const recs = generateRecommendations([], [], goodVision, stats)
    expect(recs.some(r => r.includes('Enhance'))).toBe(true)
  })

  it('recommends boosting brilliance when low', () => {
    const stats = { ...goodStats, avgFlashBrilliance: 40 }
    const recs = generateRecommendations([], [], goodVision, stats)
    expect(recs.some(r => r.includes('Boost'))).toBe(true)
  })

  it('recommends strengthening body when low', () => {
    const stats = { ...goodStats, avgBodyTone: 40 }
    const recs = generateRecommendations([], [], goodVision, stats)
    expect(recs.some(r => r.includes('Strengthen'))).toBe(true)
  })

  it('recommends improving stability when low', () => {
    const stats = { ...goodStats, avgHydroStability: 40 }
    const recs = generateRecommendations([], [], goodVision, stats)
    expect(recs.some(r => r.includes('Improve'))).toBe(true)
  })

  it('recommends harmonizing when low', () => {
    const stats = { ...goodStats, avgPatternHarmony: 40 }
    const recs = generateRecommendations([], [], goodVision, stats)
    expect(recs.some(r => r.includes('Harmonize'))).toBe(true)
  })

  it('flags dust files', () => {
    const stats = { ...goodStats, dustCount: 3 }
    const recs = generateRecommendations([], [], goodVision, stats)
    expect(recs.some(r => r.includes('dust'))).toBe(true)
  })

  it('warns about dim overall brilliance', () => {
    const vision: VisionSummary = { avgVividness: 30, avgBrilliance: 30, avgHarmony: 30, isVivid: false, overallBrilliance: 30 }
    const recs = generateRecommendations([], [], vision, goodStats)
    expect(recs.some(r => r.includes('dim'))).toBe(true)
  })

  it('warns when all fields are dry', () => {
    const fields: DreamField[] = [
      { directory: 'a', dreams: [], avgVividness: 0, avgBrilliance: 0, avgHarmony: 0, preciousOpalCount: 0, dustCount: 0, fieldType: 'no-field', condition: 'invisible' },
      { directory: 'b', dreams: [], avgVividness: 0, avgBrilliance: 0, avgHarmony: 0, preciousOpalCount: 0, dustCount: 0, fieldType: 'dry-bed', condition: 'barely-visible' },
    ]
    const recs = generateRecommendations([], fields, goodVision, goodStats)
    expect(recs.some(r => r.includes('dry'))).toBe(true)
  })

  it('names specific dust files when 1-3', () => {
    const dreams = [
      makeDream({ file: 'a.ts', condition: 'dust', qualityScore: 10 }),
      makeDream({ file: 'b.ts', condition: 'dust', qualityScore: 10 }),
    ]
    const recs = generateRecommendations(dreams, [], goodVision, goodStats)
    expect(recs.some(r => r.includes('a.ts'))).toBe(true)
    expect(recs.some(r => r.includes('b.ts'))).toBe(true)
  })
})

// ─── buildOpalDreamResult ──────────────────────────────────────────

describe('buildOpalDreamResult', () => {
  it('handles empty input', async () => {
    const result = await buildOpalDreamResult([], [])
    expect(result.dreams).toEqual([])
    expect(result.fields).toEqual([])
    expect(result.vision.avgVividness).toBe(0)
    expect(result.vision.overallBrilliance).toBe(0)
    expect(result.vision.isVivid).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.dreamerGrade).toBe('sleepwalker')
  })

  it('processes minimal content', async () => {
    const result = await buildOpalDreamResult(['test.ts'], [minimalContent])
    expect(result.dreams).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgDreamVividness).toBeGreaterThan(0)
  })

  it('processes rich content', async () => {
    const result = await buildOpalDreamResult(['rich.ts'], [richContent])
    expect(result.dreams[0].qualityScore).toBe(100)
    expect(result.vision.avgVividness).toBe(100)
    expect(result.vision.isVivid).toBe(true)
    expect(result.vision.overallBrilliance).toBe(100)
    expect(result.stats.dreamerGrade).toBe('master-dreamer')
  })

  it('groups files by directory into fields', async () => {
    const result = await buildOpalDreamResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    expect(result.fields).toHaveLength(2)
    expect(result.stats.totalFields).toBe(2)
  })

  it('computes vision correctly', async () => {
    const result = await buildOpalDreamResult(['f.ts'], [richContent])
    expect(result.vision.avgVividness).toBe(result.stats.avgDreamVividness)
    expect(result.vision.avgBrilliance).toBe(result.stats.avgFlashBrilliance)
    expect(result.vision.avgHarmony).toBe(result.stats.avgPatternHarmony)
    expect(result.vision.overallBrilliance).toBe(result.stats.overallBrilliance)
  })

  it('computes bestDream and other extremes', async () => {
    const result = await buildOpalDreamResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestDream).toBe('b.ts')
    expect(result.stats.mostVivid).toBe('b.ts')
    expect(result.stats.mostBrilliant).toBe('b.ts')
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildOpalDreamResult(['r.ts'], [richContent])
    expect(result.stats.preciousOpalCount).toBe(1)
    expect(result.stats.dustCount).toBe(0)
  })

  it('tracks high measure counts', async () => {
    const result = await buildOpalDreamResult(['r.ts'], [richContent])
    expect(result.stats.hasHighVividnessCount).toBe(1)
    expect(result.stats.hasHighBrillianceCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighStabilityCount).toBe(1)
    expect(result.stats.hasHighHarmonyCount).toBe(1)
  })

  it('includes recommendations', async () => {
    const result = await buildOpalDreamResult(['r.ts'], [richContent])
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
    expect(typeof colorGrade('precious-opal')).toBe('string')
    expect(typeof colorGrade('dust')).toBe('string')
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatDreamTable', () => {
  it('formats a dream with file name', () => {
    const dream = analyzeOpalDream(richContent, 'test.ts')
    const formatted = formatDreamTable(dream)
    expect(formatted).toContain('test.ts')
    expect(formatted).toContain('Vividness')
    expect(formatted).toContain('Score')
  })
})

describe('formatDreamsTable', () => {
  it('returns message for empty array', () => {
    expect(formatDreamsTable([])).toContain('No opal dreams')
  })

  it('formats multiple dreams', () => {
    const dreams = [
      analyzeOpalDream(richContent, 'a.ts'),
      analyzeOpalDream(minimalContent, 'b.ts'),
    ]
    const formatted = formatDreamsTable(dreams)
    expect(formatted).toContain('a.ts')
    expect(formatted).toContain('b.ts')
  })
})

describe('formatFieldTable', () => {
  it('formats a field', () => {
    const field = analyzeDreamField([makeDream()], 'src')
    const formatted = formatFieldTable(field)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Type')
  })
})

describe('formatFieldsTable', () => {
  it('returns message for empty array', () => {
    expect(formatFieldsTable([])).toContain('No opal fields')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', async () => {
    const result = await buildOpalDreamResult(['f.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Dreamer Grade')
    expect(formatted).toContain('Best Dream')
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
    const result = await buildOpalDreamResult(['f.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Opal Dream Analysis')
    expect(formatted).toContain('Vision')
    expect(formatted).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildOpalDreamResult(['f.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.dreams).toHaveLength(1)
    expect(parsed.vision.overallBrilliance).toBe(100)
  })
})
