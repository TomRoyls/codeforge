import { describe, it, expect } from 'vitest'
import {
  measureWarming,
  measureIlluminating,
  measureEnduring,
  measureLearning,
  measureHardening,
  classifyAmberCondition,
  classifyHearthType,
  classifyHearthCondition,
  classifyKeeperGrade,
  analyzeAmberGlow,
  analyzeAmberHearth,
  generateRecommendations,
  buildAmberEmberResult,
} from '../src/commands/amber-ember-helpers.js'
import {
  colorScore,
  colorGrade,
  formatGlowTable,
  formatGlowsTable,
  formatHearthTable,
  formatHearthsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/amber-ember-format-helpers.js'
import type { AmberGlow, AmberHearth, AmberEmberResult } from '../src/commands/amber-ember-helpers.js'

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

function makeGlow(overrides: Partial<AmberGlow> = {}): AmberGlow {
  const base: AmberGlow = {
    file: 'test.ts',
    preservationWarmth: 80,
    glowClarity: 80,
    firePersistence: 80,
    ashWisdom: 80,
    resinStrength: 80,
    warming: {
      warmth: 80,
      amber: 'warm-glow',
      hasHighWarmth: true,
      hasApproachable: true,
      hasNoIntimidating: true,
      hasReadable: true,
      hasNoCryptic: true,
      hasGraceful: true,
      hasNoHarsh: true,
      hasInviting: true,
      hasNoHostile: true,
      hasDocumented: true,
      hasNoUndocumented: true,
      hasWellCommented: true,
      hasHelpful: true,
      hasNoCrypticError: true,
      intimidatingCount: 0,
      crypticCount: 0,
    },
    illuminating: {
      clarity: 80,
      glow: 'bright-glow',
      hasHighClarity: true,
      hasTransparent: true,
      hasNoObfuscated: true,
      hasClear: true,
      hasNoHidden: true,
      hasVisible: true,
      hasNoInvisible: true,
      hasSelfDocumenting: true,
      hasNoMystery: true,
      hasUnderstandable: true,
      hasNoArcane: true,
      hasLuminous: true,
      hasNoDark: true,
      hasObvious: true,
      obfuscatedCount: 0,
      hiddenCount: 0,
    },
    enduring: {
      persistence: 80,
      ember: 'long-burning',
      hasHighPersistence: true,
      hasTested: true,
      hasNoUntested: true,
      hasTypeSafe: true,
      hasNoUnsafe: true,
      hasErrorHandled: true,
      hasNoBareCrash: true,
      hasRobust: true,
      hasNoFragile: true,
      hasRecoverable: true,
      hasNoFatal: true,
      hasReliable: true,
      hasNoFlaky: true,
      hasSolid: true,
      untestedCount: 0,
      bareCrashCount: 0,
    },
    learning: {
      wisdom: 80,
      ash: 'preserved-wisdom',
      hasHighWisdom: true,
      hasDocumented: true,
      hasWellStructured: true,
      hasNoAdHoc: true,
      hasPatterned: true,
      hasNoReinvented: true,
      hasPrincipled: true,
      hasNoHacky: true,
      hasMature: true,
      hasNoNaive: true,
      hasProven: true,
      hasNoExperimental: true,
      hasEstablished: true,
      hasBattleTested: true,
      adHocCount: 0,
      hackyCount: 0,
    },
    hardening: {
      strength: 80,
      resin: 'strong-resin',
      hasHighStrength: true,
      hasDefensive: true,
      hasNoNaive: true,
      hasValidated: true,
      hasNoTrusting: true,
      hasEdgeCaseCovered: true,
      hasNoSinglePath: true,
      hasBoundaryChecked: true,
      hasNoAssumed: true,
      hasNullSafe: true,
      hasNoNPE: true,
      hasSecure: true,
      hasNoVulnerable: true,
      hasFortified: true,
      singlePathCount: 0,
      assumedCount: 0,
    },
    condition: 'golden-fossil',
    qualityScore: 80,
  }
  return { ...base, ...overrides }
}

function makeStats(overrides: Partial<AmberEmberResult['stats']> = {}): AmberEmberResult['stats'] {
  return {
    totalFiles: 1,
    totalHearths: 1,
    avgPreservationWarmth: 80,
    avgGlowClarity: 80,
    avgFirePersistence: 80,
    avgAshWisdom: 80,
    avgResinStrength: 80,
    amberMasterpieceCount: 0,
    goldenFossilCount: 1,
    properResinCount: 0,
    cloudyCopalCount: 0,
    crackedAmberCount: 0,
    dustCount: 0,
    hasHighWarmthCount: 1,
    hasHighClarityCount: 1,
    hasHighPersistenceCount: 1,
    hasHighWisdomCount: 1,
    hasHighStrengthCount: 1,
    overallWarmth: 80,
    keeperGrade: 'ember-guardian',
    bestGlow: 'test.ts',
    warmest: 'test.ts',
    clearest: 'test.ts',
    mostPersistent: 'test.ts',
    wisest: 'test.ts',
    ...overrides,
  }
}

// ─── measureWarming ────────────────────────────────────────────────

describe('measureWarming', () => {
  it('returns a valid WarmingMeasure', () => {
    const m = measureWarming(RichContent)
    expect(m).toHaveProperty('warmth')
    expect(m).toHaveProperty('amber')
    expect(m).toHaveProperty('hasHighWarmth')
    expect(m).toHaveProperty('intimidatingCount')
    expect(m).toHaveProperty('crypticCount')
  })

  it('scores rich content higher than minimal', () => {
    const rich = measureWarming(RichContent)
    const minimal = measureWarming(MinimalContent)
    expect(rich.warmth).toBeGreaterThan(minimal.warmth)
  })

  it('penalizes toxic content', () => {
    const m = measureWarming(ToxicContent)
    expect(m.warmth).toBeLessThan(20)
  })

  it('scores empty content as 0', () => {
    const m = measureWarming(EmptyContent)
    expect(m.warmth).toBe(0)
  })

  it('detects eval as intimidating', () => {
    const m = measureWarming('eval("x")')
    expect(m.hasNoIntimidating).toBe(false)
    expect(m.intimidatingCount).toBeGreaterThanOrEqual(1)
  })

  it('detects debugger as intimidating', () => {
    const m = measureWarming('debugger')
    expect(m.hasNoIntimidating).toBe(false)
  })

  it('detects eval and any as cryptic', () => {
    const m = measureWarming('var x: any = eval("1")')
    expect(m.crypticCount).toBeGreaterThanOrEqual(2)
  })

  it('detects doc + export as inviting', () => {
    const m = measureWarming('/** docs */\nexport function foo(): Void {}')
    expect(m.hasInviting).toBe(true)
  })

  it('detects optional + returnType as graceful', () => {
    const m = measureWarming('function foo(x?: String): Void {}')
    expect(m.hasGraceful).toBe(true)
  })
})

// ─── measureIlluminating ───────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns a valid IlluminatingMeasure', () => {
    const m = measureIlluminating(RichContent)
    expect(m).toHaveProperty('clarity')
    expect(m).toHaveProperty('glow')
    expect(m).toHaveProperty('obfuscatedCount')
    expect(m).toHaveProperty('hiddenCount')
  })

  it('penalizes eval and any as obfuscated', () => {
    const m = measureIlluminating('const x: any = eval("1")')
    expect(m.obfuscatedCount).toBeGreaterThanOrEqual(2)
  })

  it('penalizes var and debugger as hidden', () => {
    const m = measureIlluminating('var x = 1\ndebugger')
    expect(m.hiddenCount).toBeGreaterThanOrEqual(2)
  })

  it('detects export + no any as transparent', () => {
    const m = measureIlluminating('export function Foo(): Void {}')
    expect(m.hasTransparent).toBe(true)
  })

  it('detects returnType + named as self documenting', () => {
    const m = measureIlluminating('export function Foo(): Void {}')
    expect(m.hasSelfDocumenting).toBe(true)
  })

  it('scores empty as 0', () => {
    const m = measureIlluminating(EmptyContent)
    expect(m.clarity).toBe(0)
  })

  it('detects returnType + readonly as obvious', () => {
    const m = measureIlluminating('readonly x: Number = 1\nfunction f(): Void {}')
    expect(m.hasObvious).toBe(true)
  })
})

// ─── measureEnduring ───────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns a valid EnduringMeasure', () => {
    const m = measureEnduring(RichContent)
    expect(m).toHaveProperty('persistence')
    expect(m).toHaveProperty('ember')
    expect(m).toHaveProperty('untestedCount')
    expect(m).toHaveProperty('bareCrashCount')
  })

  it('penalizes var as untested', () => {
    const m = measureEnduring('var x = 1')
    expect(m.untestedCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoUntested).toBe(false)
  })

  it('penalizes eval and debugger as bare crash', () => {
    const m = measureEnduring('eval("x")\ndebugger')
    expect(m.bareCrashCount).toBeGreaterThanOrEqual(2)
  })

  it('detects try-catch as tested', () => {
    const m = measureEnduring('try { const x = 1 } catch { }')
    expect(m.hasTested).toBe(true)
  })

  it('detects returnType + no any as type safe', () => {
    const m = measureEnduring('function foo(): Void {}')
    expect(m.hasTypeSafe).toBe(true)
  })

  it('detects try-catch as error handled', () => {
    const m = measureEnduring('try { parse(x) } catch { return null }')
    expect(m.hasErrorHandled).toBe(true)
  })

  it('scores empty as 0', () => {
    const m = measureEnduring(EmptyContent)
    expect(m.persistence).toBe(0)
  })
})

// ─── measureLearning ───────────────────────────────────────────────

describe('measureLearning', () => {
  it('returns a valid LearningMeasure', () => {
    const m = measureLearning(RichContent)
    expect(m).toHaveProperty('wisdom')
    expect(m).toHaveProperty('ash')
    expect(m).toHaveProperty('adHocCount')
    expect(m).toHaveProperty('hackyCount')
  })

  it('penalizes eval and any as ad-hoc', () => {
    const m = measureLearning('const x: any = eval("1")')
    expect(m.adHocCount).toBeGreaterThanOrEqual(2)
  })

  it('detects as any casts as hacky', () => {
    const m = measureLearning('const x = val as any')
    expect(m.hackyCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoHacky).toBe(false)
  })

  it('detects docs as documented', () => {
    const m = measureLearning('/** docs */')
    expect(m.hasDocumented).toBe(true)
  })

  it('detects extends or implements as patterned', () => {
    const m = measureLearning('class Foo extends Bar {}')
    expect(m.hasPatterned).toBe(true)
  })

  it('detects abstract or extends as principled', () => {
    const m = measureLearning('abstract class Foo extends Bar {}')
    expect(m.hasPrincipled).toBe(true)
  })

  it('scores empty as 0', () => {
    const m = measureLearning(EmptyContent)
    expect(m.wisdom).toBe(0)
  })

  it('detects extends + implements as established', () => {
    const m = measureLearning('class Foo extends Bar implements Baz {}')
    expect(m.hasEstablished).toBe(true)
  })
})

// ─── measureHardening ──────────────────────────────────────────────

describe('measureHardening', () => {
  it('returns a valid HardeningMeasure', () => {
    const m = measureHardening(RichContent)
    expect(m).toHaveProperty('strength')
    expect(m).toHaveProperty('resin')
    expect(m).toHaveProperty('singlePathCount')
    expect(m).toHaveProperty('assumedCount')
  })

  it('penalizes var as single path', () => {
    const m = measureHardening('var x = 1')
    expect(m.singlePathCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoSinglePath).toBe(false)
  })

  it('penalizes eval and any as assumed', () => {
    const m = measureHardening('const x: any = eval("1")')
    expect(m.assumedCount).toBeGreaterThanOrEqual(2)
  })

  it('detects tryCatch + returnType as defensive', () => {
    const m = measureHardening('try { const x = parse(d) } catch {} function f(): Void {}')
    expect(m.hasDefensive).toBe(true)
  })

  it('detects typeAnnotation + optional as boundary checked', () => {
    const m = measureHardening('function f(x?: String): Void {}')
    expect(m.hasBoundaryChecked).toBe(true)
  })

  it('detects optional + returnType as null safe', () => {
    const m = measureHardening('function f(x?: String): Void {}')
    expect(m.hasNullSafe).toBe(true)
  })

  it('scores empty as 0', () => {
    const m = measureHardening(EmptyContent)
    expect(m.strength).toBe(0)
  })

  it('detects private + tryCatch + returnType as fortified', () => {
    const m = measureHardening('private x: Number\ntry {} catch {}\nfunction f(): Void {}')
    expect(m.hasFortified).toBe(true)
  })
})

// ─── Classification Functions ─────────────────────────────────────

describe('classifyAmberCondition', () => {
  it('classifies 90+ as amber-masterpiece', () => {
    expect(classifyAmberCondition(90)).toBe('amber-masterpiece')
    expect(classifyAmberCondition(100)).toBe('amber-masterpiece')
  })

  it('classifies 75-89 as golden-fossil', () => {
    expect(classifyAmberCondition(75)).toBe('golden-fossil')
    expect(classifyAmberCondition(89)).toBe('golden-fossil')
  })

  it('classifies 60-74 as proper-resin', () => {
    expect(classifyAmberCondition(60)).toBe('proper-resin')
  })

  it('classifies 40-59 as cloudy-copal', () => {
    expect(classifyAmberCondition(40)).toBe('cloudy-copal')
  })

  it('classifies 20-39 as cracked-amber', () => {
    expect(classifyAmberCondition(20)).toBe('cracked-amber')
  })

  it('classifies 0-19 as dust', () => {
    expect(classifyAmberCondition(0)).toBe('dust')
    expect(classifyAmberCondition(19)).toBe('dust')
  })
})

describe('classifyHearthType', () => {
  it('returns no-hearth for empty array', () => {
    expect(classifyHearthType([])).toBe('no-hearth')
  })

  it('returns ancient-fireplace for high avg and ratio', () => {
    const glows = [makeGlow({ condition: 'amber-masterpiece', qualityScore: 90 }), makeGlow({ condition: 'amber-masterpiece', qualityScore: 90 })]
    expect(classifyHearthType(glows)).toBe('ancient-fireplace')
  })

  it('returns warm-hearth for medium-high avg and ratio', () => {
    const glows = [makeGlow({ condition: 'amber-masterpiece', qualityScore: 75 }), makeGlow({ condition: 'golden-fossil', qualityScore: 75 }), makeGlow({ condition: 'golden-fossil', qualityScore: 75 })]
    const result = classifyHearthType(glows)
    expect(['warm-hearth', 'proper-fire']).toContain(result)
  })

  it('returns no-hearth for very low scores', () => {
    const glows = [makeGlow({ condition: 'dust', qualityScore: 5 }), makeGlow({ condition: 'dust', qualityScore: 5 })]
    expect(classifyHearthType(glows)).toBe('no-hearth')
  })
})

describe('classifyHearthCondition', () => {
  it('classifies 85+ as eternal-flame', () => {
    expect(classifyHearthCondition(85)).toBe('eternal-flame')
    expect(classifyHearthCondition(100)).toBe('eternal-flame')
  })

  it('classifies 70-84 as warm-glow', () => {
    expect(classifyHearthCondition(70)).toBe('warm-glow')
  })

  it('classifies 55-69 as proper-fire', () => {
    expect(classifyHearthCondition(55)).toBe('proper-fire')
  })

  it('classifies 35-54 as dying-ember', () => {
    expect(classifyHearthCondition(35)).toBe('dying-ember')
  })

  it('classifies 15-34 as cold-ash', () => {
    expect(classifyHearthCondition(15)).toBe('cold-ash')
  })

  it('classifies 0-14 as void', () => {
    expect(classifyHearthCondition(0)).toBe('void')
  })
})

describe('classifyKeeperGrade', () => {
  it('classifies 85+ as fire-keeper', () => {
    expect(classifyKeeperGrade(85)).toBe('fire-keeper')
    expect(classifyKeeperGrade(100)).toBe('fire-keeper')
  })

  it('classifies 70-84 as ember-guardian', () => {
    expect(classifyKeeperGrade(70)).toBe('ember-guardian')
  })

  it('classifies 55-69 as hearth-tender', () => {
    expect(classifyKeeperGrade(55)).toBe('hearth-tender')
  })

  it('classifies 40-54 as apprentice', () => {
    expect(classifyKeeperGrade(40)).toBe('apprentice')
  })

  it('classifies 20-39 as novice', () => {
    expect(classifyKeeperGrade(20)).toBe('novice')
  })

  it('classifies 0-19 as smoker', () => {
    expect(classifyKeeperGrade(0)).toBe('smoker')
  })
})

// ─── analyzeAmberGlow ──────────────────────────────────────────────

describe('analyzeAmberGlow', () => {
  it('returns a full AmberGlow', () => {
    const g = analyzeAmberGlow(RichContent, 'rich.ts')
    expect(g.file).toBe('rich.ts')
    expect(g.preservationWarmth).toBeGreaterThan(0)
    expect(g.glowClarity).toBeGreaterThanOrEqual(0)
    expect(g.firePersistence).toBeGreaterThan(0)
    expect(g.ashWisdom).toBeGreaterThan(0)
    expect(g.resinStrength).toBeGreaterThan(0)
    expect(g.qualityScore).toBeGreaterThan(0)
    expect(g.condition).toBeTruthy()
  })

  it('computes qualityScore as weighted average of 5 measures', () => {
    const g = analyzeAmberGlow(RichContent, 'test.ts')
    const expected = Math.round(
      g.preservationWarmth * 0.2 +
      g.glowClarity * 0.2 +
      g.firePersistence * 0.2 +
      g.ashWisdom * 0.2 +
      g.resinStrength * 0.2,
    )
    expect(g.qualityScore).toBe(expected)
  })

  it('assigns condition based on qualityScore', () => {
    const g = analyzeAmberGlow(EmptyContent, 'empty.ts')
    expect(g.condition).toBe('dust')
  })

  it('handles toxic content gracefully', () => {
    const g = analyzeAmberGlow(ToxicContent, 'bad.ts')
    expect(g.qualityScore).toBeLessThan(30)
  })
})

// ─── analyzeAmberHearth ────────────────────────────────────────────

describe('analyzeAmberHearth', () => {
  it('returns empty hearth for no glows', () => {
    const h = analyzeAmberHearth([], 'empty-dir')
    expect(h.directory).toBe('empty-dir')
    expect(h.glows).toHaveLength(0)
    expect(h.avgWarmth).toBe(0)
    expect(h.hearthType).toBe('no-hearth')
    expect(h.condition).toBe('void')
  })

  it('aggregates glow data correctly', () => {
    const glows = [
      makeGlow({ preservationWarmth: 80, glowClarity: 70, firePersistence: 60, condition: 'golden-fossil' }),
      makeGlow({ preservationWarmth: 60, glowClarity: 50, firePersistence: 40, condition: 'proper-resin' }),
    ]
    const h = analyzeAmberHearth(glows, 'src')
    expect(h.avgWarmth).toBe(70)
    expect(h.avgClarity).toBe(60)
    expect(h.avgPersistence).toBe(50)
  })

  it('counts masterpieces and dust', () => {
    const glows = [
      makeGlow({ condition: 'amber-masterpiece' }),
      makeGlow({ condition: 'dust' }),
      makeGlow({ condition: 'golden-fossil' }),
    ]
    const h = analyzeAmberHearth(glows, 'src')
    expect(h.amberMasterpieceCount).toBe(1)
    expect(h.dustCount).toBe(1)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high warmth with no dust', () => {
    const glows = [makeGlow()]
    const hearths: AmberHearth[] = []
    const fire = { avgWarmth: 90, avgClarity: 90, avgPersistence: 90, isAmber: true, overallWarmth: 90 }
    const stats = makeStats({ overallWarmth: 90, dustCount: 0 })
    const recs = generateRecommendations(glows, hearths, fire, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('recommends warming when low', () => {
    const stats = makeStats({ avgPreservationWarmth: 40, overallWarmth: 40 })
    const fire = { avgWarmth: 40, avgClarity: 80, avgPersistence: 80, isAmber: false, overallWarmth: 40 }
    const recs = generateRecommendations([], [], fire, stats)
    expect(recs.some(r => r.includes('Warm'))).toBe(true)
  })

  it('recommends brightening when clarity low', () => {
    const stats = makeStats({ avgGlowClarity: 30, overallWarmth: 30 })
    const fire = { avgWarmth: 80, avgClarity: 30, avgPersistence: 80, isAmber: false, overallWarmth: 30 }
    const recs = generateRecommendations([], [], fire, stats)
    expect(recs.some(r => r.includes('Brighten'))).toBe(true)
  })

  it('recommends feeding when persistence low', () => {
    const stats = makeStats({ avgFirePersistence: 30, overallWarmth: 30 })
    const fire = { avgWarmth: 80, avgClarity: 80, avgPersistence: 30, isAmber: false, overallWarmth: 30 }
    const recs = generateRecommendations([], [], fire, stats)
    expect(recs.some(r => r.includes('Feed'))).toBe(true)
  })

  it('recommends preserving when wisdom low', () => {
    const stats = makeStats({ avgAshWisdom: 30, overallWarmth: 30 })
    const fire = { avgWarmth: 80, avgClarity: 80, avgPersistence: 80, isAmber: false, overallWarmth: 30 }
    const recs = generateRecommendations([], [], fire, stats)
    expect(recs.some(r => r.includes('Preserve'))).toBe(true)
  })

  it('recommends hardening when strength low', () => {
    const stats = makeStats({ avgResinStrength: 30, overallWarmth: 30 })
    const fire = { avgWarmth: 80, avgClarity: 80, avgPersistence: 80, isAmber: false, overallWarmth: 30 }
    const recs = generateRecommendations([], [], fire, stats)
    expect(recs.some(r => r.includes('Harden'))).toBe(true)
  })

  it('mentions dust files when present', () => {
    const glows = [makeGlow({ condition: 'dust', file: 'bad.ts' })]
    const stats = makeStats({ dustCount: 1, overallWarmth: 30 })
    const fire = { avgWarmth: 40, avgClarity: 40, avgPersistence: 40, isAmber: false, overallWarmth: 30 }
    const recs = generateRecommendations(glows, [], fire, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })

  it('reports many dust files as count', () => {
    const glows = Array.from({ length: 5 }, (_, i) => makeGlow({ condition: 'dust', file: `bad${i}.ts` }))
    const stats = makeStats({ dustCount: 5, overallWarmth: 10 })
    const fire = { avgWarmth: 10, avgClarity: 10, avgPersistence: 10, isAmber: false, overallWarmth: 10 }
    const recs = generateRecommendations(glows, [], fire, stats)
    expect(recs.some(r => r.includes('5 dust'))).toBe(true)
  })

  it('mentions dying/cold hearths', () => {
    const hearth: AmberHearth = {
      directory: 'src',
      glows: [],
      avgWarmth: 30,
      avgClarity: 30,
      avgPersistence: 30,
      amberMasterpieceCount: 0,
      dustCount: 0,
      hearthType: 'small-candle',
      condition: 'dying-ember',
    }
    const stats = makeStats({ overallWarmth: 50 })
    const fire = { avgWarmth: 50, avgClarity: 50, avgPersistence: 50, isAmber: false, overallWarmth: 50 }
    const recs = generateRecommendations([], [hearth, hearth], fire, stats)
    expect(recs.some(r => r.includes('hearth'))).toBe(true)
  })

  it('returns steady message when all is good', () => {
    const stats = makeStats({ overallWarmth: 80, dustCount: 0, avgPreservationWarmth: 80, avgGlowClarity: 80, avgFirePersistence: 80, avgAshWisdom: 80, avgResinStrength: 80 })
    const fire = { avgWarmth: 80, avgClarity: 80, avgPersistence: 80, isAmber: true, overallWarmth: 80 }
    const recs = generateRecommendations([], [], fire, stats)
    expect(recs.some(r => r.includes('steady') || r.includes('maintain'))).toBe(true)
  })
})

// ─── buildAmberEmberResult ─────────────────────────────────────────

describe('buildAmberEmberResult', () => {
  it('returns a complete result', async () => {
    const result = await buildAmberEmberResult(['a.ts', 'b.ts'], [RichContent, MinimalContent])
    expect(result.glows).toHaveLength(2)
    expect(result.hearths.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.fire.overallWarmth).toBeGreaterThanOrEqual(0)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty input', async () => {
    const result = await buildAmberEmberResult([], [])
    expect(result.glows).toHaveLength(0)
    expect(result.hearths).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallWarmth).toBe(0)
  })

  it('computes overallWarmth as avg of warmth, clarity, persistence', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [RichContent])
    const expected = Math.round(
      (result.stats.avgPreservationWarmth + result.stats.avgGlowClarity + result.stats.avgFirePersistence) / 3,
    )
    expect(result.stats.overallWarmth).toBe(expected)
  })

  it('sets isAmber when overallWarmth >= 80', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [RichContent])
    expect(typeof result.fire.isAmber).toBe('boolean')
    if (result.fire.overallWarmth >= 80) {
      expect(result.fire.isAmber).toBe(true)
    }
  })

  it('finds best glow correctly', async () => {
    const result = await buildAmberEmberResult(['good.ts', 'bad.ts'], [RichContent, EmptyContent])
    expect(result.stats.bestGlow).toBe('good.ts')
  })

  it('groups files into hearths by directory', async () => {
    const result = await buildAmberEmberResult(['src/a.ts', 'src/b.ts', 'lib/c.ts'], [RichContent, RichContent, MinimalContent])
    expect(result.hearths.length).toBe(2)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(85)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for masterpiece grades', () => {
    expect(typeof colorGrade('amber-masterpiece')).toBe('string')
    expect(typeof colorGrade('diamond-hard')).toBe('string')
    expect(typeof colorGrade('eternal-ember')).toBe('string')
  })

  it('returns a string for lower grades', () => {
    expect(typeof colorGrade('dust')).toBe('string')
    expect(typeof colorGrade('no-warmth')).toBe('string')
  })
})

describe('formatGlowTable', () => {
  it('formats a glow with all fields', () => {
    const g = makeGlow()
    const out = formatGlowTable(g)
    expect(out).toContain('test.ts')
    expect(out).toContain('80')
    expect(out).toContain('warm-glow')
  })
})

describe('formatGlowsTable', () => {
  it('returns message for empty array', () => {
    expect(formatGlowsTable([])).toContain('No amber glows')
  })

  it('formats multiple glows', () => {
    const glows = [makeGlow(), makeGlow({ file: 'other.ts' })]
    const out = formatGlowsTable(glows)
    expect(out).toContain('test.ts')
    expect(out).toContain('other.ts')
  })
})

describe('formatHearthTable', () => {
  it('formats a hearth', () => {
    const h: AmberHearth = {
      directory: 'src',
      glows: [makeGlow()],
      avgWarmth: 80,
      avgClarity: 70,
      avgPersistence: 60,
      amberMasterpieceCount: 1,
      dustCount: 0,
      hearthType: 'warm-hearth',
      condition: 'warm-glow',
    }
    const out = formatHearthTable(h)
    expect(out).toContain('src')
    expect(out).toContain('80')
  })
})

describe('formatHearthsTable', () => {
  it('returns message for empty array', () => {
    expect(formatHearthsTable([])).toContain('No amber hearths')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', () => {
    const stats = makeStats()
    const out = formatStatsTable(stats)
    expect(out).toContain('Amber Ember Statistics')
    expect(out).toContain('Total Files')
    expect(out).toContain('test.ts')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations message for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations as bullet list', () => {
    const out = formatRecommendations(['Warm the amber', 'Add docs'])
    expect(out).toContain('Warm the amber')
    expect(out).toContain('Add docs')
  })
})

describe('formatResultTable', () => {
  it('formats full result with all sections', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [RichContent])
    const out = formatResultTable(result)
    expect(out).toContain('Amber Glow Analysis')
    expect(out).toContain('Amber Hearths')
    expect(out).toContain('Amber Ember Statistics')
    expect(out).toContain('Fire')
    expect(out).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON string', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [RichContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.glows).toHaveLength(1)
    expect(parsed.stats).toBeTruthy()
    expect(parsed.fire).toBeTruthy()
    expect(parsed.recommendations).toBeTruthy()
  })
})
