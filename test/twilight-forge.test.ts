import { describe, it, expect } from 'vitest'
import {
  measureBridging,
  measureEnduring,
  measureEmerging,
  measureAdapting,
  measureKnowing,
  classifyTwilightCondition,
  classifyWorkshopType,
  classifyWorkshopCondition,
  classifySmithGrade,
  analyzeTwilightSpark,
  analyzeTwilightWorkshop,
  generateRecommendations,
  buildTwilightForgeResult,
} from '../src/commands/twilight-forge-helpers.js'
import {
  colorScore,
  colorGrade,
  formatSparkTable,
  formatSparksTable,
  formatWorkshopTable,
  formatWorkshopsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/twilight-forge-format-helpers.js'
import type { TwilightSpark, TwilightWorkshop, TwilightForgeResult } from '../src/commands/twilight-forge-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────

const RichContent = `/**
 * Rich module
 */
export interface Store<T> {
  get(key: string): T
  set(key: string, val: T): Void
}

export class DataStore<T> extends BaseStore implements IStore {
  private items: T[] = []
  abstract process(): Void

  async fetch(): Promise<T> {
    const result = await api.get<T>('/data')
    const mapped = result.items.map(i => i.value).filter(Boolean)
    return result
  }

  try {
    const data = this.parse(raw)
    if (data) {
      return data
    }
  } catch {
    return null
  }
}
`

const MinimalContent = `const x = 1`

const ToxicContent = `var x = eval("1 + 2")
var y = debugger
console.log("debug")
const z: any = null`

const EmptyContent = ``

function makeSpark(overrides: Partial<TwilightSpark> = {}): TwilightSpark {
  const base: TwilightSpark = {
    file: 'test.ts',
    transitionGrace: 80,
    duskResilience: 80,
    starEmergence: 80,
    forgeTwilight: 80,
    emberWisdom: 80,
    bridging: {
      grace: 80, transition: 'smooth-crossing', hasHighGrace: true,
      hasSmooth: true, hasNoJerky: true, hasPredictable: true,
      hasNoErratic: true, hasConsistent: true, hasNoVolatile: true,
      hasGradual: true, hasNoAbrupt: true, hasHandled: true,
      hasNoCrashOnSwitch: true, hasReliable: true, hasNoFlaky: true,
      hasStable: true, hasNoUnstable: true, jerkyCount: 0, erraticCount: 0,
    },
    enduring: {
      resilience: 80, dusk: 'low-light-adapted', hasHighResilience: true,
      hasErrorHandled: true, hasNoBareCrash: true, hasTested: true,
      hasNoUntested: true, hasDefensive: true, hasNoNaive: true,
      hasTypeSafe: true, hasNoUnsafe: true, hasGraceful: true,
      hasNoHarshFail: true, hasRecoverable: true, hasNoFatal: true,
      hasRobust: true, hasNoFragile: true, bareCrashCount: 0, untestedCount: 0,
    },
    emerging: {
      emergence: 80, star: 'bright-planet', hasHighEmergence: true,
      hasVisible: true, hasNoHidden: true, hasReadable: true,
      hasNoCryptic: true, hasClear: true, hasNoObfuscated: true,
      hasSelfDocumenting: true, hasNoMystery: true, hasUnderstandable: true,
      hasNoArcane: true, hasObvious: true, hasNoSubtle: true,
      hasRevealed: true, hasNoConcealed: true, crypticCount: 0, obfuscatedCount: 0,
    },
    adapting: {
      twilight: 80, forge: 'flexible-forge', hasHighTwilight: true,
      hasFlexible: true, hasNoRigid: true, hasExtensible: true,
      hasNoHardcoded: true, hasModular: true, hasNoMonolithic: true,
      hasCleanPipelines: true, hasNoTangled: true, hasEfficient: true,
      hasNoBottlenecked: true, hasStreamlined: true, hasNoCircuits: true,
      hasWellStructured: true, hasNoChaotic: true, hardcodedCount: 0, tangledCount: 0,
    },
    knowing: {
      wisdom: 80, ember: 'twilight-sage', hasHighWisdom: true,
      hasDocumented: true, hasWellStructured: true, hasNoAdHoc: true,
      hasPatterned: true, hasNoReinvented: true, hasPrincipled: true,
      hasNoHacky: true, hasMature: true, hasNoNaive: true,
      hasProven: true, hasNoExperimental: true, hasEstablished: true,
      hasBattleTested: true, adHocCount: 0, hackyCount: 0,
    },
    condition: 'starlit-forge',
    qualityScore: 80,
  }
  return { ...base, ...overrides }
}

function makeStats(overrides: Partial<TwilightForgeResult['stats']> = {}): TwilightForgeResult['stats'] {
  return {
    totalFiles: 1, totalWorkshops: 1,
    avgTransitionGrace: 80, avgDuskResilience: 80, avgStarEmergence: 80,
    avgForgeTwilight: 80, avgEmberWisdom: 80,
    twilightMasterpieceCount: 0, starlitForgeCount: 1, properDuskCount: 0,
    fadingLightCount: 0, darkForgeCount: 0, voidCount: 0,
    hasHighGraceCount: 1, hasHighResilienceCount: 1, hasHighEmergenceCount: 1,
    hasHighTwilightCount: 1, hasHighWisdomCount: 1,
    overallLuminosity: 80, smithGrade: 'star-forger',
    bestSpark: 'test.ts', mostGraceful: 'test.ts', mostResilient: 'test.ts',
    brightest: 'test.ts', wisest: 'test.ts',
    ...overrides,
  }
}

// ─── measureBridging ───────────────────────────────────────────────

describe('measureBridging', () => {
  it('returns a valid BridgingMeasure', () => {
    const m = measureBridging(RichContent)
    expect(m).toHaveProperty('grace')
    expect(m).toHaveProperty('transition')
    expect(m).toHaveProperty('jerkyCount')
    expect(m).toHaveProperty('erraticCount')
  })

  it('scores rich content higher than minimal', () => {
    expect(measureBridging(RichContent).grace).toBeGreaterThan(measureBridging(MinimalContent).grace)
  })

  it('penalizes toxic content', () => {
    expect(measureBridging(ToxicContent).grace).toBeLessThan(20)
  })

  it('scores empty as 0', () => {
    expect(measureBridging(EmptyContent).grace).toBe(0)
  })

  it('detects var and eval as jerky', () => {
    const m = measureBridging('var x = eval("1")')
    expect(m.jerkyCount).toBeGreaterThanOrEqual(2)
  })

  it('detects any and debugger as erratic', () => {
    const m = measureBridging('const x: any = 1\ndebugger')
    expect(m.erraticCount).toBeGreaterThanOrEqual(2)
  })

  it('detects try-catch as handled', () => {
    expect(measureBridging('try { const x = 1 } catch { }').hasHandled).toBe(true)
  })

  it('detects optional + returnType as gradual', () => {
    expect(measureBridging('function go(opts?: Opts): Void {}').hasGradual).toBe(true)
  })
})

// ─── measureEnduring ───────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns a valid EnduringMeasure', () => {
    const m = measureEnduring(RichContent)
    expect(m).toHaveProperty('resilience')
    expect(m).toHaveProperty('dusk')
    expect(m).toHaveProperty('bareCrashCount')
    expect(m).toHaveProperty('untestedCount')
  })

  it('penalizes var as bare crash', () => {
    expect(measureEnduring('var x = 1').bareCrashCount).toBeGreaterThanOrEqual(1)
  })

  it('penalizes eval and debugger as untested', () => {
    expect(measureEnduring('eval("x")\ndebugger').untestedCount).toBeGreaterThanOrEqual(2)
  })

  it('detects try-catch as error handled', () => {
    expect(measureEnduring('try { const x = 1 } catch { }').hasErrorHandled).toBe(true)
  })

  it('detects returnType + no any as type safe', () => {
    expect(measureEnduring('function foo(): Void {}').hasTypeSafe).toBe(true)
  })

  it('detects try + returnType as graceful', () => {
    expect(measureEnduring('try { parse() } catch { }\nfunction parse(): Void {}').hasGraceful).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureEnduring(EmptyContent).resilience).toBe(0)
  })
})

// ─── measureEmerging ───────────────────────────────────────────────

describe('measureEmerging', () => {
  it('returns a valid EmergingMeasure', () => {
    const m = measureEmerging(RichContent)
    expect(m).toHaveProperty('emergence')
    expect(m).toHaveProperty('star')
    expect(m).toHaveProperty('crypticCount')
    expect(m).toHaveProperty('obfuscatedCount')
  })

  it('penalizes eval and any as cryptic', () => {
    const m = measureEmerging('var x: any = eval("1")')
    expect(m.crypticCount).toBeGreaterThanOrEqual(2)
  })

  it('penalizes var and debugger as obfuscated', () => {
    const m = measureEmerging('var x = 1\ndebugger')
    expect(m.obfuscatedCount).toBeGreaterThanOrEqual(2)
  })

  it('detects export as visible', () => {
    expect(measureEmerging('export function Foo(): Void {}').hasVisible).toBe(true)
  })

  it('detects doc + returnType + export as obvious', () => {
    expect(measureEmerging('/** docs */\nexport function Foo(): Void {}').hasObvious).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureEmerging(EmptyContent).emergence).toBe(0)
  })
})

// ─── measureAdapting ───────────────────────────────────────────────

describe('measureAdapting', () => {
  it('returns a valid AdaptingMeasure', () => {
    const m = measureAdapting(RichContent)
    expect(m).toHaveProperty('twilight')
    expect(m).toHaveProperty('forge')
    expect(m).toHaveProperty('hardcodedCount')
    expect(m).toHaveProperty('tangledCount')
  })

  it('penalizes eval and any as hardcoded', () => {
    expect(measureAdapting('eval("x")\nconst x: any = 1').hardcodedCount).toBeGreaterThanOrEqual(2)
  })

  it('penalizes var as tangled', () => {
    expect(measureAdapting('var x = 1').tangledCount).toBeGreaterThanOrEqual(1)
  })

  it('detects generics + optional as flexible', () => {
    expect(measureAdapting('function foo<T>(x?: T): T { return x }').hasFlexible).toBe(true)
  })

  it('detects extends or implements as extensible', () => {
    expect(measureAdapting('class Foo extends Bar {}').hasExtensible).toBe(true)
  })

  it('detects interface + export as well structured', () => {
    expect(measureAdapting('export interface Foo { x: Number }').hasWellStructured).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureAdapting(EmptyContent).twilight).toBe(0)
  })
})

// ─── measureKnowing ────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns a valid KnowingMeasure', () => {
    const m = measureKnowing(RichContent)
    expect(m).toHaveProperty('wisdom')
    expect(m).toHaveProperty('ember')
    expect(m).toHaveProperty('adHocCount')
    expect(m).toHaveProperty('hackyCount')
  })

  it('penalizes eval and any as ad-hoc', () => {
    expect(measureKnowing('const x: any = eval("1")').adHocCount).toBeGreaterThanOrEqual(2)
  })

  it('penalizes as any casts as hacky', () => {
    expect(measureKnowing('const x = value as any').hackyCount).toBeGreaterThanOrEqual(1)
  })

  it('detects docs as documented', () => {
    expect(measureKnowing('/** docs */').hasDocumented).toBe(true)
  })

  it('detects extends + implements as established', () => {
    expect(measureKnowing('class Foo extends Bar implements Baz {}').hasEstablished).toBe(true)
  })

  it('detects try + doc + no any as battle tested', () => {
    expect(measureKnowing('/** docs */\ntry { parse() } catch {}').hasBattleTested).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureKnowing(EmptyContent).wisdom).toBe(0)
  })
})

// ─── Classification Functions ─────────────────────────────────────

describe('classifyTwilightCondition', () => {
  it('classifies 90+ as twilight-masterpiece', () => {
    expect(classifyTwilightCondition(90)).toBe('twilight-masterpiece')
    expect(classifyTwilightCondition(100)).toBe('twilight-masterpiece')
  })
  it('classifies 75-89 as starlit-forge', () => {
    expect(classifyTwilightCondition(75)).toBe('starlit-forge')
  })
  it('classifies 60-74 as proper-dusk', () => {
    expect(classifyTwilightCondition(60)).toBe('proper-dusk')
  })
  it('classifies 40-59 as fading-light', () => {
    expect(classifyTwilightCondition(40)).toBe('fading-light')
  })
  it('classifies 20-39 as dark-forge', () => {
    expect(classifyTwilightCondition(20)).toBe('dark-forge')
  })
  it('classifies 0-19 as void', () => {
    expect(classifyTwilightCondition(0)).toBe('void')
  })
})

describe('classifyWorkshopType', () => {
  it('returns no-workshop for empty', () => {
    expect(classifyWorkshopType([])).toBe('no-workshop')
  })
  it('returns grand-atelier for high avg', () => {
    const sparks = [makeSpark({ condition: 'twilight-masterpiece', qualityScore: 90 }), makeSpark({ condition: 'twilight-masterpiece', qualityScore: 90 })]
    expect(classifyWorkshopType(sparks)).toBe('grand-atelier')
  })
  it('returns no-workshop for very low', () => {
    const sparks = [makeSpark({ condition: 'void', qualityScore: 5 }), makeSpark({ condition: 'void', qualityScore: 5 })]
    expect(classifyWorkshopType(sparks)).toBe('no-workshop')
  })
})

describe('classifyWorkshopCondition', () => {
  it('classifies 85+ as twilight-empire', () => { expect(classifyWorkshopCondition(85)).toBe('twilight-empire') })
  it('classifies 70-84 as starlit-workshop', () => { expect(classifyWorkshopCondition(70)).toBe('starlit-workshop') })
  it('classifies 55-69 as proper-forge', () => { expect(classifyWorkshopCondition(55)).toBe('proper-forge') })
  it('classifies 35-54 as dim-foundry', () => { expect(classifyWorkshopCondition(35)).toBe('dim-foundry') })
  it('classifies 15-34 as dark-cellar', () => { expect(classifyWorkshopCondition(15)).toBe('dark-cellar') })
  it('classifies 0-14 as void', () => { expect(classifyWorkshopCondition(0)).toBe('void') })
})

describe('classifySmithGrade', () => {
  it('classifies 85+ as twilight-master', () => { expect(classifySmithGrade(85)).toBe('twilight-master') })
  it('classifies 70-84 as star-forger', () => { expect(classifySmithGrade(70)).toBe('star-forger') })
  it('classifies 55-69 as dusk-smith', () => { expect(classifySmithGrade(55)).toBe('dusk-smith') })
  it('classifies 40-54 as apprentice', () => { expect(classifySmithGrade(40)).toBe('apprentice') })
  it('classifies 20-39 as novice', () => { expect(classifySmithGrade(20)).toBe('novice') })
  it('classifies 0-19 as blind-forger', () => { expect(classifySmithGrade(0)).toBe('blind-forger') })
})

// ─── analyzeTwilightSpark ──────────────────────────────────────────

describe('analyzeTwilightSpark', () => {
  it('returns a full TwilightSpark', () => {
    const s = analyzeTwilightSpark(RichContent, 'rich.ts')
    expect(s.file).toBe('rich.ts')
    expect(s.transitionGrace).toBeGreaterThan(0)
    expect(s.duskResilience).toBeGreaterThanOrEqual(0)
    expect(s.qualityScore).toBeGreaterThan(0)
    expect(s.condition).toBeTruthy()
  })

  it('computes qualityScore as weighted average', () => {
    const s = analyzeTwilightSpark(RichContent, 'test.ts')
    const expected = Math.round(
      s.transitionGrace * 0.2 + s.duskResilience * 0.2 +
      s.starEmergence * 0.2 + s.forgeTwilight * 0.2 + s.emberWisdom * 0.2,
    )
    expect(s.qualityScore).toBe(expected)
  })

  it('assigns condition based on qualityScore', () => {
    expect(analyzeTwilightSpark(EmptyContent, 'empty.ts').condition).toBe('void')
  })

  it('handles toxic content gracefully', () => {
    expect(analyzeTwilightSpark(ToxicContent, 'bad.ts').qualityScore).toBeLessThan(30)
  })
})

// ─── analyzeTwilightWorkshop ───────────────────────────────────────

describe('analyzeTwilightWorkshop', () => {
  it('returns empty workshop for no sparks', () => {
    const w = analyzeTwilightWorkshop([], 'empty-dir')
    expect(w.sparks).toHaveLength(0)
    expect(w.workshopType).toBe('no-workshop')
    expect(w.condition).toBe('void')
  })

  it('aggregates spark data correctly', () => {
    const sparks = [
      makeSpark({ transitionGrace: 80, duskResilience: 70, emberWisdom: 60 }),
      makeSpark({ transitionGrace: 60, duskResilience: 50, emberWisdom: 40 }),
    ]
    const w = analyzeTwilightWorkshop(sparks, 'src')
    expect(w.avgGrace).toBe(70)
    expect(w.avgResilience).toBe(60)
    expect(w.avgWisdom).toBe(50)
  })

  it('counts masterpieces and void', () => {
    const sparks = [
      makeSpark({ condition: 'twilight-masterpiece' }),
      makeSpark({ condition: 'void' }),
      makeSpark({ condition: 'starlit-forge' }),
    ]
    const w = analyzeTwilightWorkshop(sparks, 'src')
    expect(w.twilightMasterpieceCount).toBe(1)
    expect(w.voidCount).toBe(1)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high luminosity with no void', () => {
    const stats = makeStats({ overallLuminosity: 90, voidCount: 0 })
    const dusk = { avgGrace: 90, avgResilience: 90, avgWisdom: 90, isTwilight: true, overallLuminosity: 90 }
    const recs = generateRecommendations([makeSpark()], [], dusk, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('recommends smoothing when grace low', () => {
    const stats = makeStats({ avgTransitionGrace: 40, overallLuminosity: 40 })
    const dusk = { avgGrace: 40, avgResilience: 80, avgWisdom: 80, isTwilight: false, overallLuminosity: 40 }
    const recs = generateRecommendations([], [], dusk, stats)
    expect(recs.some(r => r.includes('Smooth'))).toBe(true)
  })

  it('recommends strengthening when resilience low', () => {
    const stats = makeStats({ avgDuskResilience: 30, overallLuminosity: 30 })
    const dusk = { avgGrace: 80, avgResilience: 30, avgWisdom: 80, isTwilight: false, overallLuminosity: 30 }
    const recs = generateRecommendations([], [], dusk, stats)
    expect(recs.some(r => r.includes('Strengthen') || r.includes('resilience'))).toBe(true)
  })

  it('recommends revealing when emergence low', () => {
    const stats = makeStats({ avgStarEmergence: 30, overallLuminosity: 30 })
    const dusk = { avgGrace: 80, avgResilience: 80, avgWisdom: 80, isTwilight: false, overallLuminosity: 30 }
    const recs = generateRecommendations([], [], dusk, stats)
    expect(recs.some(r => r.includes('Reveal'))).toBe(true)
  })

  it('recommends adapting when twilight low', () => {
    const stats = makeStats({ avgForgeTwilight: 30, overallLuminosity: 30 })
    const dusk = { avgGrace: 80, avgResilience: 80, avgWisdom: 80, isTwilight: false, overallLuminosity: 30 }
    const recs = generateRecommendations([], [], dusk, stats)
    expect(recs.some(r => r.includes('Adapt'))).toBe(true)
  })

  it('recommends gathering wisdom when wisdom low', () => {
    const stats = makeStats({ avgEmberWisdom: 30, overallLuminosity: 30 })
    const dusk = { avgGrace: 80, avgResilience: 80, avgWisdom: 30, isTwilight: false, overallLuminosity: 30 }
    const recs = generateRecommendations([], [], dusk, stats)
    expect(recs.some(r => r.includes('wisdom') || r.includes('ember'))).toBe(true)
  })

  it('mentions void files when present', () => {
    const sparks = [makeSpark({ condition: 'void', file: 'bad.ts' })]
    const stats = makeStats({ voidCount: 1, overallLuminosity: 30 })
    const dusk = { avgGrace: 40, avgResilience: 40, avgWisdom: 40, isTwilight: false, overallLuminosity: 30 }
    const recs = generateRecommendations(sparks, [], dusk, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })

  it('reports many void files as count', () => {
    const sparks = Array.from({ length: 5 }, (_, i) => makeSpark({ condition: 'void', file: `bad${i}.ts` }))
    const stats = makeStats({ voidCount: 5, overallLuminosity: 10 })
    const dusk = { avgGrace: 10, avgResilience: 10, avgWisdom: 10, isTwilight: false, overallLuminosity: 10 }
    const recs = generateRecommendations(sparks, [], dusk, stats)
    expect(recs.some(r => r.includes('5 void'))).toBe(true)
  })

  it('mentions dim/dark workshops', () => {
    const ws: TwilightWorkshop = {
      directory: 'src', sparks: [], avgGrace: 30, avgResilience: 30, avgWisdom: 30,
      twilightMasterpieceCount: 0, voidCount: 0, workshopType: 'humble-shed', condition: 'dim-foundry',
    }
    const stats = makeStats({ overallLuminosity: 50 })
    const dusk = { avgGrace: 50, avgResilience: 50, avgWisdom: 50, isTwilight: false, overallLuminosity: 50 }
    const recs = generateRecommendations([], [ws, ws], dusk, stats)
    expect(recs.some(r => r.includes('workshop'))).toBe(true)
  })

  it('returns steady message when all is good', () => {
    const stats = makeStats({ overallLuminosity: 80, voidCount: 0, avgTransitionGrace: 80, avgDuskResilience: 80, avgStarEmergence: 80, avgForgeTwilight: 80, avgEmberWisdom: 80 })
    const dusk = { avgGrace: 80, avgResilience: 80, avgWisdom: 80, isTwilight: true, overallLuminosity: 80 }
    const recs = generateRecommendations([], [], dusk, stats)
    expect(recs.some(r => r.includes('steady') || r.includes('maintain'))).toBe(true)
  })
})

// ─── buildTwilightForgeResult ──────────────────────────────────────

describe('buildTwilightForgeResult', () => {
  it('returns a complete result', async () => {
    const result = await buildTwilightForgeResult(['a.ts', 'b.ts'], [RichContent, MinimalContent])
    expect(result.sparks).toHaveLength(2)
    expect(result.workshops.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.dusk.overallLuminosity).toBeGreaterThanOrEqual(0)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty input', async () => {
    const result = await buildTwilightForgeResult([], [])
    expect(result.sparks).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallLuminosity).toBe(0)
  })

  it('computes overallLuminosity as avg of grace, resilience, wisdom', async () => {
    const result = await buildTwilightForgeResult(['a.ts'], [RichContent])
    const expected = Math.round(
      (result.stats.avgTransitionGrace + result.stats.avgDuskResilience + result.stats.avgEmberWisdom) / 3,
    )
    expect(result.stats.overallLuminosity).toBe(expected)
  })

  it('finds best spark correctly', async () => {
    const result = await buildTwilightForgeResult(['good.ts', 'bad.ts'], [RichContent, EmptyContent])
    expect(result.stats.bestSpark).toBe('good.ts')
  })

  it('groups files into workshops by directory', async () => {
    const result = await buildTwilightForgeResult(['src/a.ts', 'src/b.ts', 'lib/c.ts'], [RichContent, RichContent, MinimalContent])
    expect(result.workshops.length).toBe(2)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(85)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns string for masterpiece', () => { expect(typeof colorGrade('twilight-masterpiece')).toBe('string') })
  it('returns string for lower grades', () => { expect(typeof colorGrade('void')).toBe('string') })
})

describe('formatSparkTable', () => {
  it('formats a spark', () => {
    const out = formatSparkTable(makeSpark())
    expect(out).toContain('test.ts')
    expect(out).toContain('80')
  })
})

describe('formatSparksTable', () => {
  it('returns message for empty', () => { expect(formatSparksTable([])).toContain('No twilight sparks') })
  it('formats multiple sparks', () => {
    const out = formatSparksTable([makeSpark(), makeSpark({ file: 'other.ts' })])
    expect(out).toContain('test.ts')
    expect(out).toContain('other.ts')
  })
})

describe('formatWorkshopTable', () => {
  it('formats a workshop', () => {
    const ws: TwilightWorkshop = {
      directory: 'src', sparks: [makeSpark()], avgGrace: 80, avgResilience: 70, avgWisdom: 60,
      twilightMasterpieceCount: 1, voidCount: 0, workshopType: 'proper-forge', condition: 'starlit-workshop',
    }
    const out = formatWorkshopTable(ws)
    expect(out).toContain('src')
    expect(out).toContain('80')
  })
})

describe('formatWorkshopsTable', () => {
  it('returns message for empty', () => { expect(formatWorkshopsTable([])).toContain('No twilight workshops') })
})

describe('formatStatsTable', () => {
  it('formats stats', () => {
    const out = formatStatsTable(makeStats())
    expect(out).toContain('Twilight Forge Statistics')
    expect(out).toContain('Total Files')
  })
})

describe('formatRecommendations', () => {
  it('returns no recs for empty', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recs as bullets', () => {
    const out = formatRecommendations(['Smooth code', 'Add docs'])
    expect(out).toContain('Smooth code')
    expect(out).toContain('Add docs')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildTwilightForgeResult(['a.ts'], [RichContent])
    const out = formatResultTable(result)
    expect(out).toContain('Twilight Spark Analysis')
    expect(out).toContain('Twilight Workshops')
    expect(out).toContain('Twilight Forge Statistics')
    expect(out).toContain('Dusk')
    expect(out).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildTwilightForgeResult(['a.ts'], [RichContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.sparks).toHaveLength(1)
    expect(parsed.stats).toBeTruthy()
    expect(parsed.dusk).toBeTruthy()
    expect(parsed.recommendations).toBeTruthy()
  })
})
