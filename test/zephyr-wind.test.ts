import { describe, it, expect } from 'vitest'
import {
  measureLightening,
  measureDirecting,
  measureResisting,
  measureCarrying,
  measureSurrounding,
  classifyWindCondition,
  classifyFieldType,
  classifyFieldCondition,
  classifyPilotGrade,
  analyzeWindCurrent,
  analyzeWindField,
  generateRecommendations,
  buildZephyrWindResult,
  type WindCurrent,
  type WindField,
  type SkySummary,
  type ZephyrWindStats,
} from '../src/commands/zephyr-wind-helpers.js'
import {
  colorScore,
  colorGrade,
  formatCurrentTable,
  formatCurrentsTable,
  formatFieldTable,
  formatFieldsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/zephyr-wind-format-helpers.js'

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

const sampleCurrent: WindCurrent = {
  file: 'src/index.ts',
  breezeLightness: 80,
  currentDirection: 75,
  gustResilience: 70,
  breezeCarriage: 65,
  atmosphereQuality: 60,
  lightening: {
    lightness: 80, grade: 'gentle-breeze', hasHighLightness: true,
    hasLightweight: true, hasElegant: true, hasNoBloated: true,
    hasLean: true, hasNoHeavy: true, hasMinimal: true,
    hasNoExcessive: true, hasEfficient: true, hasNoWasteful: true,
    hasGraceful: true, bloatedCount: 0, heavyCount: 0,
  },
  directing: {
    direction: 75, current: 'clear-heading', hasHighDirection: true,
    hasClear: true, hasFocused: true, hasNoScattered: true,
    hasDirected: true, hasNoWandering: true, hasPurposeful: true,
    hasNoAimless: true, hasFlowing: true, hasNoChaotic: true,
    hasIntentional: true, scatteredCount: 0, wanderingCount: 0,
  },
  resisting: {
    resilience: 70, gust: 'wind-resistant', hasHighResilience: true,
    hasStable: true, hasAnchored: true, hasNoTumbling: true,
    hasSteady: true, hasNoReeling: true, hasResilient: true,
    hasNoFragile: true, hasGrounded: true, hasNoOverturned: true,
    hasFirm: true, tumblingCount: 0, fragileCount: 0,
  },
  carrying: {
    quality: 65, carriage: 'proper-carrier', hasHighQuality: false,
    hasEfficient: true, hasDeliver: true, hasNoStalling: true,
    hasTransporting: true, hasNoDropping: true, hasCarrying: true,
    hasNoLosing: true, hasConveying: true, hasNoFailing: true,
    hasTransmitting: true, stallingCount: 0, droppingCount: 0,
  },
  surrounding: {
    quality: 60, atmosphere: 'fresh-air', hasHighQuality: false,
    hasPleasant: true, hasComfortable: true, hasNoHostile: true,
    hasWelcoming: true, hasNoHarsh: true, hasHealthy: true,
    hasNoToxic: true, hasInviting: true, hasNoRepellent: true,
    hasNurturing: true, hostileCount: 0, harshCount: 0,
  },
  condition: 'proper-breeze',
  qualityScore: 70,
}

function makeCurrent(overrides: Partial<WindCurrent> = {}): WindCurrent {
  return { ...sampleCurrent, ...overrides }
}

// ─── measureLightening ─────────────────────────────────────────────

describe('measureLightening', () => {
  it('returns 0 lightness for empty content', () => {
    const m = measureLightening(emptyContent)
    expect(m.lightness).toBe(0)
    expect(m.grade).toBe('lead-weight')
    expect(m.hasHighLightness).toBe(false)
  })

  it('detects export and const in minimal content', () => {
    const m = measureLightening(minimalContent)
    expect(m.lightness).toBeGreaterThan(0)
    expect(m.hasLightweight).toBe(false)
  })

  it('scores rich content high', () => {
    const m = measureLightening(richContent)
    expect(m.lightness).toBe(100)
    expect(m.grade).toBe('feather-light')
    expect(m.hasHighLightness).toBe(true)
  })

  it('detects lightweight (export + async)', () => {
    expect(measureLightening(richContent).hasLightweight).toBe(true)
    expect(measureLightening(minimalContent).hasLightweight).toBe(false)
  })

  it('detects elegant (namedExport + returnType)', () => {
    expect(measureLightening(richContent).hasElegant).toBe(true)
  })

  it('detects lean (const + import)', () => {
    expect(measureLightening(richContent).hasLean).toBe(true)
  })

  it('detects minimal (generics + interface)', () => {
    expect(measureLightening(richContent).hasMinimal).toBe(true)
  })

  it('detects efficient (docComments + export)', () => {
    expect(measureLightening(richContent).hasEfficient).toBe(true)
  })

  it('detects graceful (typeAlias + const)', () => {
    expect(measureLightening(richContent).hasGraceful).toBe(true)
  })

  it('counts bloated (var)', () => {
    expect(measureLightening(badContent).bloatedCount).toBe(3)
    expect(measureLightening(richContent).bloatedCount).toBe(0)
  })

  it('counts heavy (any)', () => {
    expect(measureLightening(badContent).heavyCount).toBe(2)
  })

  it('hasNoBloated is false when var present', () => {
    expect(measureLightening(badContent).hasNoBloated).toBe(false)
    expect(measureLightening(richContent).hasNoBloated).toBe(true)
  })

  it('hasNoHeavy is false when any present', () => {
    expect(measureLightening(badContent).hasNoHeavy).toBe(false)
  })

  it('hasNoExcessive is false when eval present', () => {
    expect(measureLightening(badContent).hasNoExcessive).toBe(false)
  })

  it('hasNoWasteful is false when debugger present', () => {
    expect(measureLightening(badContent).hasNoWasteful).toBe(false)
  })
})

// ─── measureDirecting ──────────────────────────────────────────────

describe('measureDirecting', () => {
  it('returns 0 direction for empty content', () => {
    const m = measureDirecting(emptyContent)
    expect(m.direction).toBe(0)
    expect(m.current).toBe('spinning')
    expect(m.hasHighDirection).toBe(false)
  })

  it('detects namedExport and const in minimal content', () => {
    const m = measureDirecting(minimalContent)
    expect(m.direction).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureDirecting(richContent)
    expect(m.direction).toBe(100)
    expect(m.current).toBe('true-north')
  })

  it('detects clear (returnType + strictEq)', () => {
    expect(measureDirecting(richContent).hasClear).toBe(true)
    expect(measureDirecting(minimalContent).hasClear).toBe(false)
  })

  it('detects focused (namedExport + interface)', () => {
    expect(measureDirecting(richContent).hasFocused).toBe(true)
  })

  it('detects directed (generics + readonly)', () => {
    expect(measureDirecting(richContent).hasDirected).toBe(true)
  })

  it('detects purposeful (private + strictEq)', () => {
    expect(measureDirecting(richContent).hasPurposeful).toBe(true)
  })

  it('detects flowing (docComments + namedExport)', () => {
    expect(measureDirecting(richContent).hasFlowing).toBe(true)
  })

  it('detects intentional (class + returnType)', () => {
    expect(measureDirecting(richContent).hasIntentional).toBe(true)
  })

  it('counts scattered (var)', () => {
    expect(measureDirecting(badContent).scatteredCount).toBe(3)
  })

  it('counts wandering (any)', () => {
    expect(measureDirecting(badContent).wanderingCount).toBe(2)
  })

  it('hasNoScattered is false when var present', () => {
    expect(measureDirecting(badContent).hasNoScattered).toBe(false)
  })

  it('hasNoWandering is false when any present', () => {
    expect(measureDirecting(badContent).hasNoWandering).toBe(false)
  })

  it('hasNoAimless is false when eval present', () => {
    expect(measureDirecting(badContent).hasNoAimless).toBe(false)
  })

  it('hasNoChaotic is false when debugger present', () => {
    expect(measureDirecting(badContent).hasNoChaotic).toBe(false)
  })
})

// ─── measureResisting ──────────────────────────────────────────────

describe('measureResisting', () => {
  it('returns 0 resilience for empty content', () => {
    const m = measureResisting(emptyContent)
    expect(m.resilience).toBe(0)
    expect(m.gust).toBe('swept-away')
  })

  it('detects const and export in minimal content', () => {
    const m = measureResisting(minimalContent)
    expect(m.resilience).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureResisting(richContent)
    expect(m.resilience).toBe(100)
    expect(m.gust).toBe('storm-proof')
  })

  it('detects stable (const + strictEq)', () => {
    expect(measureResisting(richContent).hasStable).toBe(true)
  })

  it('detects anchored (readonly + private)', () => {
    expect(measureResisting(richContent).hasAnchored).toBe(true)
  })

  it('detects steady (interface + typeAlias)', () => {
    expect(measureResisting(richContent).hasSteady).toBe(true)
  })

  it('detects resilient (returnType + strictEq)', () => {
    expect(measureResisting(richContent).hasResilient).toBe(true)
  })

  it('detects grounded (export + import)', () => {
    expect(measureResisting(richContent).hasGrounded).toBe(true)
  })

  it('detects firm (class + const)', () => {
    expect(measureResisting(richContent).hasFirm).toBe(true)
  })

  it('counts tumbling (var)', () => {
    expect(measureResisting(badContent).tumblingCount).toBe(3)
  })

  it('counts fragile (any)', () => {
    expect(measureResisting(badContent).fragileCount).toBe(2)
  })

  it('hasNoTumbling is false when var present', () => {
    expect(measureResisting(badContent).hasNoTumbling).toBe(false)
  })

  it('hasNoReeling is false when any present', () => {
    expect(measureResisting(badContent).hasNoReeling).toBe(false)
  })

  it('hasNoFragile is false when eval present', () => {
    expect(measureResisting(badContent).hasNoFragile).toBe(false)
  })

  it('hasNoOverturned is false when debugger present', () => {
    expect(measureResisting(badContent).hasNoOverturned).toBe(false)
  })
})

// ─── measureCarrying ───────────────────────────────────────────────

describe('measureCarrying', () => {
  it('returns 0 quality for empty content', () => {
    const m = measureCarrying(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.carriage).toBe('no-carriage')
  })

  it('detects export and const in minimal content', () => {
    const m = measureCarrying(minimalContent)
    expect(m.quality).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureCarrying(richContent)
    expect(m.quality).toBe(100)
    expect(m.carriage).toBe('swift-courier')
  })

  it('detects efficient (export + import)', () => {
    expect(measureCarrying(richContent).hasEfficient).toBe(true)
  })

  it('detects deliver (returnType + const)', () => {
    expect(measureCarrying(richContent).hasDeliver).toBe(true)
  })

  it('detects transporting (interface + generics)', () => {
    expect(measureCarrying(richContent).hasTransporting).toBe(true)
  })

  it('detects carrying (async + namedExport)', () => {
    expect(measureCarrying(richContent).hasCarrying).toBe(true)
  })

  it('detects conveying (docComments + export)', () => {
    expect(measureCarrying(richContent).hasConveying).toBe(true)
  })

  it('detects transmitting (class + returnType)', () => {
    expect(measureCarrying(richContent).hasTransmitting).toBe(true)
  })

  it('counts stalling (var)', () => {
    expect(measureCarrying(badContent).stallingCount).toBe(3)
  })

  it('counts dropping (any)', () => {
    expect(measureCarrying(badContent).droppingCount).toBe(2)
  })

  it('hasNoStalling is false when var present', () => {
    expect(measureCarrying(badContent).hasNoStalling).toBe(false)
  })

  it('hasNoDropping is false when any present', () => {
    expect(measureCarrying(badContent).hasNoDropping).toBe(false)
  })

  it('hasNoLosing is false when eval present', () => {
    expect(measureCarrying(badContent).hasNoLosing).toBe(false)
  })

  it('hasNoFailing is false when debugger present', () => {
    expect(measureCarrying(badContent).hasNoFailing).toBe(false)
  })
})

// ─── measureSurrounding ────────────────────────────────────────────

describe('measureSurrounding', () => {
  it('returns 0 quality for empty content', () => {
    const m = measureSurrounding(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.atmosphere).toBe('vacuum')
  })

  it('detects export and const in minimal content', () => {
    const m = measureSurrounding(minimalContent)
    expect(m.quality).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureSurrounding(richContent)
    expect(m.quality).toBe(100)
    expect(m.atmosphere).toBe('spring-breeze')
  })

  it('detects pleasant (docComments + interface)', () => {
    expect(measureSurrounding(richContent).hasPleasant).toBe(true)
  })

  it('detects comfortable (export + import)', () => {
    expect(measureSurrounding(richContent).hasComfortable).toBe(true)
  })

  it('detects welcoming (typeAlias + generics)', () => {
    expect(measureSurrounding(richContent).hasWelcoming).toBe(true)
  })

  it('detects healthy (returnType + readonly)', () => {
    expect(measureSurrounding(richContent).hasHealthy).toBe(true)
  })

  it('detects inviting (const + docComments)', () => {
    expect(measureSurrounding(richContent).hasInviting).toBe(true)
  })

  it('detects nurturing (async + export)', () => {
    expect(measureSurrounding(richContent).hasNurturing).toBe(true)
  })

  it('counts hostile (var)', () => {
    expect(measureSurrounding(badContent).hostileCount).toBe(3)
  })

  it('counts harsh (any)', () => {
    expect(measureSurrounding(badContent).harshCount).toBe(2)
  })

  it('hasNoHostile is false when var present', () => {
    expect(measureSurrounding(badContent).hasNoHostile).toBe(false)
  })

  it('hasNoHarsh is false when any present', () => {
    expect(measureSurrounding(badContent).hasNoHarsh).toBe(false)
  })

  it('hasNoToxic is false when eval present', () => {
    expect(measureSurrounding(badContent).hasNoToxic).toBe(false)
  })

  it('hasNoRepellent is false when debugger present', () => {
    expect(measureSurrounding(badContent).hasNoRepellent).toBe(false)
  })
})

// ─── classifyWindCondition ─────────────────────────────────────────

describe('classifyWindCondition', () => {
  it('returns gentle-zephyr for 85+', () => {
    expect(classifyWindCondition(90)).toBe('gentle-zephyr')
    expect(classifyWindCondition(85)).toBe('gentle-zephyr')
  })

  it('returns proper-breeze for 70-84', () => {
    expect(classifyWindCondition(70)).toBe('proper-breeze')
    expect(classifyWindCondition(84)).toBe('proper-breeze')
  })

  it('returns fair-wind for 55-69', () => {
    expect(classifyWindCondition(55)).toBe('fair-wind')
    expect(classifyWindCondition(69)).toBe('fair-wind')
  })

  it('returns stiff-breeze for 40-54', () => {
    expect(classifyWindCondition(40)).toBe('stiff-breeze')
    expect(classifyWindCondition(54)).toBe('stiff-breeze')
  })

  it('returns gale-force for 25-39', () => {
    expect(classifyWindCondition(25)).toBe('gale-force')
    expect(classifyWindCondition(39)).toBe('gale-force')
  })

  it('returns dead-calm for < 25', () => {
    expect(classifyWindCondition(0)).toBe('dead-calm')
    expect(classifyWindCondition(24)).toBe('dead-calm')
  })
})

// ─── classifyFieldType ─────────────────────────────────────────────

describe('classifyFieldType', () => {
  it('returns no-wind for empty array', () => {
    expect(classifyFieldType([])).toBe('no-wind')
  })

  it('returns trade-winds for high avg with zephyr ratio', () => {
    const currents = [
      makeCurrent({ qualityScore: 90, condition: 'gentle-zephyr' }),
      makeCurrent({ qualityScore: 88, condition: 'gentle-zephyr' }),
    ]
    expect(classifyFieldType(currents)).toBe('trade-winds')
  })

  it('returns prevailing-westerly for avg 60+', () => {
    const currents = [makeCurrent({ qualityScore: 60, condition: 'proper-breeze' })]
    expect(classifyFieldType(currents)).toBe('prevailing-westerly')
  })

  it('returns proper-belt for avg 45-59', () => {
    const currents = [makeCurrent({ qualityScore: 45, condition: 'fair-wind' })]
    expect(classifyFieldType(currents)).toBe('proper-belt')
  })

  it('returns local-breeze for avg 30-44', () => {
    const currents = [makeCurrent({ qualityScore: 30, condition: 'stiff-breeze' })]
    expect(classifyFieldType(currents)).toBe('local-breeze')
  })

  it('returns still-air for avg 15-29', () => {
    const currents = [makeCurrent({ qualityScore: 15, condition: 'gale-force' })]
    expect(classifyFieldType(currents)).toBe('still-air')
  })

  it('returns no-wind for low quality', () => {
    const currents = [makeCurrent({ qualityScore: 10, condition: 'dead-calm' })]
    expect(classifyFieldType(currents)).toBe('no-wind')
  })
})

// ─── classifyFieldCondition ────────────────────────────────────────

describe('classifyFieldCondition', () => {
  it('returns perfect-sailing for 75+', () => {
    expect(classifyFieldCondition(80)).toBe('perfect-sailing')
  })

  it('returns fair-winds for 60-74', () => {
    expect(classifyFieldCondition(60)).toBe('fair-winds')
  })

  it('returns decent-breeze for 45-59', () => {
    expect(classifyFieldCondition(45)).toBe('decent-breeze')
  })

  it('returns headwind for 30-44', () => {
    expect(classifyFieldCondition(30)).toBe('headwind')
  })

  it('returns doldrums for 15-29', () => {
    expect(classifyFieldCondition(15)).toBe('doldrums')
  })

  it('returns beached for < 15', () => {
    expect(classifyFieldCondition(10)).toBe('beached')
  })
})

// ─── classifyPilotGrade ────────────────────────────────────────────

describe('classifyPilotGrade', () => {
  it('returns master-sailor for 80+', () => {
    expect(classifyPilotGrade(85)).toBe('master-sailor')
  })

  it('returns wind-reader for 65-79', () => {
    expect(classifyPilotGrade(65)).toBe('wind-reader')
  })

  it('returns skilled-helmsman for 50-64', () => {
    expect(classifyPilotGrade(50)).toBe('skilled-helmsman')
  })

  it('returns deck-hand for 35-49', () => {
    expect(classifyPilotGrade(35)).toBe('deck-hand')
  })

  it('returns novice for 20-34', () => {
    expect(classifyPilotGrade(20)).toBe('novice')
  })

  it('returns landlubber for < 20', () => {
    expect(classifyPilotGrade(10)).toBe('landlubber')
  })
})

// ─── analyzeWindCurrent ────────────────────────────────────────────

describe('analyzeWindCurrent', () => {
  it('analyzes minimal content', () => {
    const current = analyzeWindCurrent(minimalContent, 'test.ts')
    expect(current.file).toBe('test.ts')
    expect(current.breezeLightness).toBeGreaterThan(0)
    expect(current.qualityScore).toBeGreaterThan(0)
    expect(current.condition).toBeDefined()
  })

  it('analyzes rich content with high scores', () => {
    const current = analyzeWindCurrent(richContent, 'rich.ts')
    expect(current.breezeLightness).toBe(100)
    expect(current.currentDirection).toBe(100)
    expect(current.gustResilience).toBe(100)
    expect(current.breezeCarriage).toBe(100)
    expect(current.atmosphereQuality).toBe(100)
    expect(current.qualityScore).toBe(100)
    expect(current.condition).toBe('gentle-zephyr')
  })

  it('computes qualityScore as weighted average', () => {
    const current = analyzeWindCurrent(minimalContent, 'minimal.ts')
    const expected = Math.round(
      current.lightening.lightness * 0.2 +
      current.directing.direction * 0.2 +
      current.resisting.resilience * 0.2 +
      current.carrying.quality * 0.2 +
      current.surrounding.quality * 0.2,
    )
    expect(current.qualityScore).toBe(expected)
  })

  it('classifies condition based on qualityScore', () => {
    const current = analyzeWindCurrent(richContent, 'rich.ts')
    expect(current.condition).toBe(classifyWindCondition(current.qualityScore))
  })

  it('maps top-level scores from measures', () => {
    const current = analyzeWindCurrent(richContent, 'rich.ts')
    expect(current.breezeLightness).toBe(current.lightening.lightness)
    expect(current.currentDirection).toBe(current.directing.direction)
    expect(current.gustResilience).toBe(current.resisting.resilience)
    expect(current.breezeCarriage).toBe(current.carrying.quality)
    expect(current.atmosphereQuality).toBe(current.surrounding.quality)
  })
})

// ─── analyzeWindField ──────────────────────────────────────────────

describe('analyzeWindField', () => {
  it('returns empty field for no currents', () => {
    const field = analyzeWindField([], 'empty')
    expect(field.currents).toEqual([])
    expect(field.avgLightness).toBe(0)
    expect(field.avgDirection).toBe(0)
    expect(field.avgResilience).toBe(0)
    expect(field.gentleZephyrCount).toBe(0)
    expect(field.deadCalmCount).toBe(0)
    expect(field.fieldType).toBe('no-wind')
    expect(field.condition).toBe('beached')
  })

  it('computes averages correctly', () => {
    const currents = [
      makeCurrent({ breezeLightness: 80, currentDirection: 60, gustResilience: 70, qualityScore: 70, condition: 'proper-breeze' }),
      makeCurrent({ breezeLightness: 60, currentDirection: 80, gustResilience: 50, qualityScore: 60, condition: 'proper-breeze' }),
    ]
    const field = analyzeWindField(currents, 'src')
    expect(field.avgLightness).toBe(70)
    expect(field.avgDirection).toBe(70)
    expect(field.avgResilience).toBe(60)
  })

  it('counts conditions correctly', () => {
    const currents = [
      makeCurrent({ condition: 'gentle-zephyr', qualityScore: 90 }),
      makeCurrent({ condition: 'dead-calm', qualityScore: 10 }),
    ]
    const field = analyzeWindField(currents, 'src')
    expect(field.gentleZephyrCount).toBe(1)
    expect(field.deadCalmCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const goodSky: SkySummary = { avgLightness: 80, avgDirection: 80, avgResilience: 80, isBlowing: true, overallFreshness: 80 }
  const goodStats: ZephyrWindStats = {
    totalFiles: 1, totalFields: 1,
    avgBreezeLightness: 80, avgCurrentDirection: 80, avgGustResilience: 80,
    avgBreezeCarriage: 80, avgAtmosphereQuality: 80,
    gentleZephyrCount: 1, properBreezeCount: 0, fairWindCount: 0,
    stiffBreezeCount: 0, galeForceCount: 0, deadCalmCount: 0,
    hasHighLightnessCount: 1, hasHighDirectionCount: 1, hasHighResilienceCount: 1,
    hasHighQualityCount: 1, hasHighAtmosphereCount: 1,
    overallFreshness: 80, pilotGrade: 'master-sailor',
    bestCurrent: 'a.ts', lightest: 'a.ts', clearestDirection: 'a.ts',
    mostResilient: 'a.ts', bestCarrier: 'a.ts',
  }

  it('returns celebration when all is good', () => {
    const recs = generateRecommendations(
      [makeCurrent({ condition: 'gentle-zephyr', qualityScore: 90 })],
      [{ directory: 'src', currents: [makeCurrent()], avgLightness: 80, avgDirection: 80, avgResilience: 80, gentleZephyrCount: 1, deadCalmCount: 0, fieldType: 'trade-winds', condition: 'perfect-sailing' }],
      goodSky, goodStats,
    )
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('master-sailor')
  })

  it('recommends lightening when low breeze lightness', () => {
    const stats = { ...goodStats, avgBreezeLightness: 40 }
    const recs = generateRecommendations([], [], goodSky, stats)
    expect(recs.some(r => r.includes('Lighten'))).toBe(true)
  })

  it('recommends clarifying when low direction', () => {
    const stats = { ...goodStats, avgCurrentDirection: 40 }
    const recs = generateRecommendations([], [], goodSky, stats)
    expect(recs.some(r => r.includes('Clarify'))).toBe(true)
  })

  it('recommends strengthening when low resilience', () => {
    const stats = { ...goodStats, avgGustResilience: 40 }
    const recs = generateRecommendations([], [], goodSky, stats)
    expect(recs.some(r => r.includes('Strengthen'))).toBe(true)
  })

  it('recommends improving carriage when low', () => {
    const stats = { ...goodStats, avgBreezeCarriage: 40 }
    const recs = generateRecommendations([], [], goodSky, stats)
    expect(recs.some(r => r.includes('carriage'))).toBe(true)
  })

  it('recommends freshening atmosphere when low', () => {
    const stats = { ...goodStats, avgAtmosphereQuality: 40 }
    const recs = generateRecommendations([], [], goodSky, stats)
    expect(recs.some(r => r.includes('atmosphere'))).toBe(true)
  })

  it('flags dead calm files', () => {
    const stats = { ...goodStats, deadCalmCount: 3 }
    const recs = generateRecommendations([], [], goodSky, stats)
    expect(recs.some(r => r.includes('dead calm'))).toBe(true)
  })

  it('warns about stagnant freshness', () => {
    const sky: SkySummary = { avgLightness: 30, avgDirection: 30, avgResilience: 30, isBlowing: false, overallFreshness: 30 }
    const recs = generateRecommendations([], [], sky, goodStats)
    expect(recs.some(r => r.includes('stagnant'))).toBe(true)
  })

  it('warns when all fields are still', () => {
    const fields: WindField[] = [
      { directory: 'a', currents: [], avgLightness: 0, avgDirection: 0, avgResilience: 0, gentleZephyrCount: 0, deadCalmCount: 0, fieldType: 'no-wind', condition: 'beached' },
      { directory: 'b', currents: [], avgLightness: 0, avgDirection: 0, avgResilience: 0, gentleZephyrCount: 0, deadCalmCount: 0, fieldType: 'still-air', condition: 'doldrums' },
    ]
    const recs = generateRecommendations([], fields, goodSky, goodStats)
    expect(recs.some(r => r.includes('windless'))).toBe(true)
  })

  it('names specific dead calm files when 1-3', () => {
    const currents = [
      makeCurrent({ file: 'a.ts', condition: 'dead-calm', qualityScore: 10 }),
      makeCurrent({ file: 'b.ts', condition: 'dead-calm', qualityScore: 10 }),
    ]
    const recs = generateRecommendations(currents, [], goodSky, goodStats)
    expect(recs.some(r => r.includes('a.ts'))).toBe(true)
    expect(recs.some(r => r.includes('b.ts'))).toBe(true)
  })
})

// ─── buildZephyrWindResult ─────────────────────────────────────────

describe('buildZephyrWindResult', () => {
  it('handles empty input', async () => {
    const result = await buildZephyrWindResult([], [])
    expect(result.currents).toEqual([])
    expect(result.fields).toEqual([])
    expect(result.sky.avgLightness).toBe(0)
    expect(result.sky.overallFreshness).toBe(0)
    expect(result.sky.isBlowing).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.pilotGrade).toBe('landlubber')
  })

  it('processes minimal content', async () => {
    const result = await buildZephyrWindResult(['test.ts'], [minimalContent])
    expect(result.currents).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgBreezeLightness).toBeGreaterThan(0)
  })

  it('processes rich content', async () => {
    const result = await buildZephyrWindResult(['rich.ts'], [richContent])
    expect(result.currents[0].qualityScore).toBe(100)
    expect(result.sky.avgLightness).toBe(100)
    expect(result.sky.isBlowing).toBe(true)
    expect(result.sky.overallFreshness).toBe(100)
    expect(result.stats.pilotGrade).toBe('master-sailor')
  })

  it('groups files by directory into fields', async () => {
    const result = await buildZephyrWindResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    expect(result.fields).toHaveLength(2)
    expect(result.stats.totalFields).toBe(2)
  })

  it('computes sky correctly', async () => {
    const result = await buildZephyrWindResult(['f.ts'], [richContent])
    expect(result.sky.avgLightness).toBe(result.stats.avgBreezeLightness)
    expect(result.sky.avgDirection).toBe(result.stats.avgCurrentDirection)
    expect(result.sky.avgResilience).toBe(result.stats.avgGustResilience)
    expect(result.sky.overallFreshness).toBe(result.stats.overallFreshness)
  })

  it('computes bestCurrent and other extremes', async () => {
    const result = await buildZephyrWindResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestCurrent).toBe('b.ts')
    expect(result.stats.lightest).toBe('b.ts')
    expect(result.stats.clearestDirection).toBe('b.ts')
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildZephyrWindResult(['r.ts'], [richContent])
    expect(result.stats.gentleZephyrCount).toBe(1)
    expect(result.stats.deadCalmCount).toBe(0)
  })

  it('tracks high measure counts', async () => {
    const result = await buildZephyrWindResult(['r.ts'], [richContent])
    expect(result.stats.hasHighLightnessCount).toBe(1)
    expect(result.stats.hasHighDirectionCount).toBe(1)
    expect(result.stats.hasHighResilienceCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighAtmosphereCount).toBe(1)
  })

  it('includes recommendations', async () => {
    const result = await buildZephyrWindResult(['r.ts'], [richContent])
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
    expect(typeof colorGrade('gentle-zephyr')).toBe('string')
    expect(typeof colorGrade('dead-calm')).toBe('string')
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatCurrentTable', () => {
  it('formats a current with file name', () => {
    const current = analyzeWindCurrent(richContent, 'test.ts')
    const formatted = formatCurrentTable(current)
    expect(formatted).toContain('test.ts')
    expect(formatted).toContain('Breeze Lightness')
    expect(formatted).toContain('Score')
  })
})

describe('formatCurrentsTable', () => {
  it('returns message for empty array', () => {
    expect(formatCurrentsTable([])).toContain('No wind currents')
  })

  it('formats multiple currents', () => {
    const currents = [
      analyzeWindCurrent(richContent, 'a.ts'),
      analyzeWindCurrent(minimalContent, 'b.ts'),
    ]
    const formatted = formatCurrentsTable(currents)
    expect(formatted).toContain('a.ts')
    expect(formatted).toContain('b.ts')
  })
})

describe('formatFieldTable', () => {
  it('formats a field', () => {
    const field = analyzeWindField([makeCurrent()], 'src')
    const formatted = formatFieldTable(field)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Type')
  })
})

describe('formatFieldsTable', () => {
  it('returns message for empty array', () => {
    expect(formatFieldsTable([])).toContain('No wind fields')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', async () => {
    const result = await buildZephyrWindResult(['f.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Pilot Grade')
    expect(formatted).toContain('Best Current')
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
    const result = await buildZephyrWindResult(['f.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Zephyr Wind Analysis')
    expect(formatted).toContain('Sky')
    expect(formatted).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildZephyrWindResult(['f.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.currents).toHaveLength(1)
    expect(parsed.sky.overallFreshness).toBe(100)
  })
})
