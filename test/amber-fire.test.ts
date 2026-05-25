import { describe, expect, it } from 'vitest'

import {
  type AmberBlazeResult,
  type AmberCondition,
  type AmberEmber,
  type AmberHearth,
  type BindingMeasure,
  type FirekeeperGrade,
  type HearthCondition,
  type HearthType,
  type IlluminatingMeasure,
  type LearningMeasure,
  type PersistingMeasure,
  type PreservingMeasure,
  analyzeAmberEmber,
  analyzeAmberHearth,
  buildAmberBlazeResult,
  classifyAmberCondition,
  classifyFirekeeperGrade,
  classifyHearthCondition,
  classifyHearthType,
  generateRecommendations,
  measureBinding,
  measureIlluminating,
  measureLearning,
  measurePersisting,
  measurePreserving,
} from '../src/commands/amber-fire-helpers.js'

import {
  colorAmberCondition,
  colorHearthCondition,
  colorScore,
  formatEmberTable,
  formatEmbersTable,
  formatHearthTable,
  formatHearthsTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/amber-fire-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const richContent = [
  'import { X } from "y"',
  'export class App {',
  '  readonly name: string',
  '  private id: string',
  '  async run(): Promise<void> {',
  '    try {',
  '      const result = await this.fetch()',
  '      if (result) { return JSON.parse(result) as Result }',
  '    } catch (err) { throw err }',
  '  }',
  '}',
  '/** Documentation */',
  'type Result = { data: string }',
  'interface Config { value: string }',
].join('\n')

const emptyContent = ''

const poorContent = 'var x = eval("1")'

const moderateContent = [
  'import { X } from "y"',
  'export class App {',
  '  name: string',
  '  run() { return 1 }',
  '}',
].join('\n')

function makeEmber(
  file: string,
  warmth: number,
  clarity: number,
  persistence: number,
  wisdom: number,
  strength: number,
): AmberEmber {
  const qualityScore = Math.round(warmth * 0.2 + clarity * 0.2 + persistence * 0.2 + wisdom * 0.2 + strength * 0.2)
  return {
    file,
    preservationWarmth: warmth,
    glowClarity: clarity,
    firePersistence: persistence,
    ashWisdom: wisdom,
    resinStrength: strength,
    preserving: { warmth, amber: 'golden-preserve', hasHighWarmth: warmth >= 60, hasApproachable: true, hasNoHostile: true, hasReadable: true, hasNoCryptic: true, hasErrorHandled: true, hasNoUnhandled: true, hasInviting: true, hasWelcoming: true, hasDocumented: true, hasNoUndocumented: true, hasWarm: true, hasGentle: true, hasForgiving: true, hasPatient: true, hasKind: true, hostileCount: 0, undocumentedCount: 0 } as PreservingMeasure,
    illuminating: { clarity, glow: 'golden-radiance', hasHighClarity: clarity >= 60, hasReadable: true, hasNoCryptic: true, hasSelfDocumenting: true, hasNoMystery: true, hasClear: true, hasNoObfuscated: true, hasTransparent: true, hasUnderstandable: true, hasVisible: true, hasDirect: true, hasIlluminated: true, hasRevealed: true, hasLuminous: true, hasRadiant: true, hasWarm: true, crypticCount: 0, obfuscatedCount: 0 } as IlluminatingMeasure,
    persisting: { persistence, fire: 'eternal-flame', hasHighPersistence: persistence >= 60, hasStable: true, hasNoVolatile: true, hasTested: true, hasNoUntested: true, hasConsistent: true, hasEnduring: true, hasReliable: true, hasMaintained: true, hasProven: true, hasDurable: true, hasLasting: true, hasPersistent: true, hasSteadfast: true, hasResolute: true, hasPerpetual: true, volatileCount: 0, untestedCount: 0 } as PersistingMeasure,
    learning: { wisdom, ash: 'ancient-cinders', hasHighWisdom: wisdom >= 60, hasWellArchitected: true, hasNoHacked: true, hasPrincipled: true, hasDeep: true, hasProven: true, hasMature: true, hasStrategic: true, hasInsightful: true, hasEvolved: true, hasReflective: true, hasExperienced: true, hasLearned: true, hasWise: true, hasAccumulated: true, hasHistorical: true, hackedCount: 0, shallowCount: 0 } as LearningMeasure,
    binding: { strength, resin: 'fossil-resin', hasHighStrength: strength >= 60, hasWellStructured: true, hasNoChaotic: true, hasModular: true, hasNoMonolithic: true, hasConnected: true, hasIntegrated: true, hasCohesive: true, hasUnified: true, hasOrganized: true, hasLinked: true, hasBound: true, hasCoupled: true, hasAttached: true, hasJoined: true, hasFused: true, chaoticCount: 0, monolithicCount: 0 } as BindingMeasure,
    condition: classifyAmberCondition(qualityScore),
    qualityScore,
  }
}

function makeStats(overrides: Partial<AmberBlazeResult['stats']> = {}): AmberBlazeResult['stats'] {
  return {
    totalFiles: 1,
    totalHearths: 1,
    avgPreservationWarmth: 80,
    avgGlowClarity: 80,
    avgFirePersistence: 80,
    avgAshWisdom: 80,
    avgResinStrength: 80,
    amberMasterpieceCount: 0,
    goldenBlazeCount: 1,
    properFossilCount: 0,
    coolStoneCount: 0,
    dustCount: 0,
    voidCount: 0,
    hasHighWarmthCount: 1,
    hasHighClarityCount: 1,
    hasHighPersistenceCount: 1,
    hasHighWisdomCount: 1,
    hasHighStrengthCount: 1,
    overallRadiance: 80,
    firekeeperGrade: 'amber-guardian' as FirekeeperGrade,
    bestEmber: 'app.ts',
    warmest: 'app.ts',
    clearest: 'app.ts',
    mostPersistent: 'app.ts',
    wisest: 'app.ts',
    strongest: 'app.ts',
    ...overrides,
  }
}

// ─── measurePreserving ──────────────────────────────────

describe('measurePreserving', () => {
  it('scores rich content highly', () => {
    const result = measurePreserving(richContent)
    expect(result.warmth).toBeGreaterThan(60)
    expect(result.hasHighWarmth).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measurePreserving(emptyContent)
    expect(result.warmth).toBeLessThan(50)
  })

  it('detects hostile code', () => {
    const result = measurePreserving('some hostile code here')
    expect(result.hostileCount).toBeGreaterThan(0)
    expect(result.hasNoHostile).toBe(false)
  })

  it('detects approachable patterns', () => {
    const result = measurePreserving('class Foo {}')
    expect(result.hasApproachable).toBe(true)
  })

  it('detects readable types', () => {
    const result = measurePreserving('const x: string = "hello"')
    expect(result.hasReadable).toBe(true)
  })

  it('detects error handling', () => {
    const result = measurePreserving('try { x } catch { y }')
    expect(result.hasErrorHandled).toBe(true)
  })

  it('detects inviting imports', () => {
    const result = measurePreserving('import { X } from "y"')
    expect(result.hasInviting).toBe(true)
  })

  it('detects welcoming docs', () => {
    const result = measurePreserving('/** doc */')
    expect(result.hasWelcoming).toBe(true)
  })

  it('detects forgiving code (no any)', () => {
    const result = measurePreserving('const x: string = "ok"')
    expect(result.hasForgiving).toBe(true)
  })

  it('penalizes any usage', () => {
    const result = measurePreserving('const x: any = 1')
    expect(result.hasForgiving).toBe(false)
  })

  it('returns amber classification', () => {
    const result = measurePreserving(richContent)
    expect(result.amber).toBeDefined()
  })

  it('counts hostile patterns', () => {
    const result = measurePreserving('hostile aggressive violent')
    expect(result.hostileCount).toBe(3)
  })

  it('detects patient async code', () => {
    const result = measurePreserving('async function foo() { await bar() }')
    expect(result.hasPatient).toBe(true)
  })

  it('detects warm visibility modifiers', () => {
    const result = measurePreserving('private x: string')
    expect(result.hasWarm).toBe(true)
  })

  it('detects gentle const', () => {
    const result = measurePreserving('const x = 1')
    expect(result.hasGentle).toBe(true)
  })
})

// ─── measureIlluminating ────────────────────────────────

describe('measureIlluminating', () => {
  it('scores rich content highly', () => {
    const result = measureIlluminating(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureIlluminating(emptyContent)
    expect(result.clarity).toBeLessThan(50)
  })

  it('detects cryptic patterns', () => {
    const result = measureIlluminating('cryptic obfuscated minified code')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated var/eval', () => {
    const result = measureIlluminating('var x = eval("1")')
    expect(result.obfuscatedCount).toBeGreaterThan(0)
    expect(result.hasNoObfuscated).toBe(false)
  })

  it('detects self-documenting types', () => {
    const result = measureIlluminating('const x: string = "ok"')
    expect(result.hasSelfDocumenting).toBe(true)
  })

  it('detects clear documentation', () => {
    const result = measureIlluminating('/** doc */')
    expect(result.hasClear).toBe(true)
  })

  it('detects transparent code (no any)', () => {
    const result = measureIlluminating('const x: string = "ok"')
    expect(result.hasTransparent).toBe(true)
  })

  it('detects direct patterns', () => {
    const result = measureIlluminating('function foo() { return 1 }')
    expect(result.hasDirect).toBe(true)
  })

  it('detects illuminated async', () => {
    const result = measureIlluminating('async function foo() { await bar() }')
    expect(result.hasIlluminated).toBe(true)
  })

  it('detects revealed control flow', () => {
    const result = measureIlluminating('try { x } catch { y }')
    expect(result.hasRevealed).toBe(true)
  })

  it('detects luminous const/readonly', () => {
    const result = measureIlluminating('const x = 1')
    expect(result.hasLuminous).toBe(true)
  })

  it('detects warm readonly/as-const', () => {
    const result = measureIlluminating('readonly x: string')
    expect(result.hasWarm).toBe(true)
  })

  it('returns glow classification', () => {
    const result = measureIlluminating(richContent)
    expect(result.glow).toBeDefined()
  })

  it('detects radiant (no monolithic)', () => {
    const result = measureIlluminating('clean code')
    expect(result.hasRadiant).toBe(true)
  })

  it('penalizes monolithic patterns', () => {
    const result = measureIlluminating('monolithic god.object mega')
    expect(result.hasRadiant).toBe(false)
  })
})

// ─── measurePersisting ──────────────────────────────────

describe('measurePersisting', () => {
  it('scores rich content highly', () => {
    const result = measurePersisting(richContent)
    expect(result.persistence).toBeGreaterThan(60)
    expect(result.hasHighPersistence).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measurePersisting(emptyContent)
    expect(result.persistence).toBeLessThan(50)
  })

  it('detects volatile patterns', () => {
    const result = measurePersisting('volatile unstable fragile code')
    expect(result.volatileCount).toBeGreaterThan(0)
    expect(result.hasNoVolatile).toBe(false)
  })

  it('detects untested eval/Function', () => {
    const result = measurePersisting('eval("1") new Function("x")')
    expect(result.untestedCount).toBeGreaterThan(0)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects stable const/readonly', () => {
    const result = measurePersisting('const x = 1')
    expect(result.hasStable).toBe(true)
  })

  it('detects tested try/catch/if', () => {
    const result = measurePersisting('try { x } catch { y }')
    expect(result.hasTested).toBe(true)
  })

  it('detects consistent types', () => {
    const result = measurePersisting('const x: string = "ok"')
    expect(result.hasConsistent).toBe(true)
  })

  it('detects enduring code (no any)', () => {
    const result = measurePersisting('const x: string = "ok"')
    expect(result.hasEnduring).toBe(true)
  })

  it('detects reliable visibility', () => {
    const result = measurePersisting('private x: string')
    expect(result.hasReliable).toBe(true)
  })

  it('detects maintained imports', () => {
    const result = measurePersisting('import { X } from "y"')
    expect(result.hasMaintained).toBe(true)
  })

  it('detects proven class/interface', () => {
    const result = measurePersisting('class Foo {}')
    expect(result.hasProven).toBe(true)
  })

  it('detects durable async', () => {
    const result = measurePersisting('async function foo() { await bar() }')
    expect(result.hasDurable).toBe(true)
  })

  it('detects perpetual function/return', () => {
    const result = measurePersisting('function foo() { return 1 }')
    expect(result.hasPerpetual).toBe(true)
  })

  it('returns fire classification', () => {
    const result = measurePersisting(richContent)
    expect(result.fire).toBeDefined()
  })

  it('detects lasting documentation', () => {
    const result = measurePersisting('/** doc */')
    expect(result.hasLasting).toBe(true)
  })
})

// ─── measureLearning ────────────────────────────────────

describe('measureLearning', () => {
  it('scores rich content highly', () => {
    const result = measureLearning(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureLearning(emptyContent)
    expect(result.wisdom).toBeLessThan(50)
  })

  it('detects hacked patterns', () => {
    const result = measureLearning('hack workaround kludge')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects shallow patterns', () => {
    const result = measureLearning('shallow superficial trivial')
    expect(result.shallowCount).toBeGreaterThan(0)
  })

  it('detects well-architected code', () => {
    const result = measureLearning('class Foo {}')
    expect(result.hasWellArchitected).toBe(true)
  })

  it('detects principled code (no any)', () => {
    const result = measureLearning('const x: string = "ok"')
    expect(result.hasPrincipled).toBe(true)
  })

  it('detects deep types', () => {
    const result = measureLearning('const x: string = "ok"')
    expect(result.hasDeep).toBe(true)
  })

  it('detects proven try/catch', () => {
    const result = measureLearning('try { x } catch { y }')
    expect(result.hasProven).toBe(true)
  })

  it('detects mature documentation', () => {
    const result = measureLearning('/** doc */')
    expect(result.hasMature).toBe(true)
  })

  it('detects strategic imports', () => {
    const result = measureLearning('import { X } from "y"')
    expect(result.hasStrategic).toBe(true)
  })

  it('detects insightful visibility', () => {
    const result = measureLearning('private x: string')
    expect(result.hasInsightful).toBe(true)
  })

  it('detects evolved async', () => {
    const result = measureLearning('async function foo() { await bar() }')
    expect(result.hasEvolved).toBe(true)
  })

  it('detects experienced const/readonly', () => {
    const result = measureLearning('const x = 1')
    expect(result.hasExperienced).toBe(true)
  })

  it('detects historical throw/return', () => {
    const result = measureLearning('throw new Error("x")')
    expect(result.hasHistorical).toBe(true)
  })

  it('returns ash classification', () => {
    const result = measureLearning(richContent)
    expect(result.ash).toBeDefined()
  })
})

// ─── measureBinding ─────────────────────────────────────

describe('measureBinding', () => {
  it('scores rich content highly', () => {
    const result = measureBinding(richContent)
    expect(result.strength).toBeGreaterThan(60)
    expect(result.hasHighStrength).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureBinding(emptyContent)
    expect(result.strength).toBeLessThan(50)
  })

  it('detects chaotic var/eval', () => {
    const result = measureBinding('var x = eval("1")')
    expect(result.chaoticCount).toBeGreaterThan(0)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects monolithic patterns', () => {
    const result = measureBinding('monolithic god.object mega code')
    expect(result.monolithicCount).toBeGreaterThan(0)
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('detects modular imports', () => {
    const result = measureBinding('import { X } from "y"')
    expect(result.hasModular).toBe(true)
  })

  it('detects connected visibility', () => {
    const result = measureBinding('private x: string')
    expect(result.hasConnected).toBe(true)
  })

  it('detects integrated types', () => {
    const result = measureBinding('const x: string = "ok"')
    expect(result.hasIntegrated).toBe(true)
  })

  it('detects cohesive async', () => {
    const result = measureBinding('async function foo() { await bar() }')
    expect(result.hasCohesive).toBe(true)
  })

  it('detects unified code (no any)', () => {
    const result = measureBinding('const x: string = "ok"')
    expect(result.hasUnified).toBe(true)
  })

  it('detects organized function/return', () => {
    const result = measureBinding('function foo() { return 1 }')
    expect(result.hasOrganized).toBe(true)
  })

  it('detects linked try/catch', () => {
    const result = measureBinding('try { x } catch { y }')
    expect(result.hasLinked).toBe(true)
  })

  it('detects bound documentation', () => {
    const result = measureBinding('/** doc */')
    expect(result.hasBound).toBe(true)
  })

  it('detects coupled const/readonly', () => {
    const result = measureBinding('const x = 1')
    expect(result.hasCoupled).toBe(true)
  })

  it('detects fused readonly/as-const', () => {
    const result = measureBinding('readonly x: string')
    expect(result.hasFused).toBe(true)
  })

  it('returns resin classification', () => {
    const result = measureBinding(richContent)
    expect(result.resin).toBeDefined()
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyAmberCondition', () => {
  it('classifies amber-masterpiece at 90+', () => {
    expect(classifyAmberCondition(90)).toBe('amber-masterpiece')
    expect(classifyAmberCondition(100)).toBe('amber-masterpiece')
  })

  it('classifies golden-blaze at 75-89', () => {
    expect(classifyAmberCondition(75)).toBe('golden-blaze')
    expect(classifyAmberCondition(89)).toBe('golden-blaze')
  })

  it('classifies proper-fossil at 60-74', () => {
    expect(classifyAmberCondition(60)).toBe('proper-fossil')
    expect(classifyAmberCondition(74)).toBe('proper-fossil')
  })

  it('classifies cool-stone at 40-59', () => {
    expect(classifyAmberCondition(40)).toBe('cool-stone')
    expect(classifyAmberCondition(59)).toBe('cool-stone')
  })

  it('classifies dust at 20-39', () => {
    expect(classifyAmberCondition(20)).toBe('dust')
    expect(classifyAmberCondition(39)).toBe('dust')
  })

  it('classifies void below 20', () => {
    expect(classifyAmberCondition(0)).toBe('void')
    expect(classifyAmberCondition(19)).toBe('void')
  })
})

describe('classifyHearthType', () => {
  it('returns no-hearth for empty array', () => {
    expect(classifyHearthType([])).toBe('no-hearth')
  })

  it('returns grand-fireplace for avg >= 85', () => {
    const embers = [makeEmber('a.ts', 90, 90, 90, 90, 90)]
    expect(classifyHearthType(embers)).toBe('grand-fireplace')
  })

  it('returns amber-hearth for avg 70-84', () => {
    const embers = [makeEmber('a.ts', 75, 75, 75, 75, 75)]
    expect(classifyHearthType(embers)).toBe('amber-hearth')
  })

  it('returns proper-firepit for avg 55-69', () => {
    const embers = [makeEmber('a.ts', 60, 60, 60, 60, 60)]
    expect(classifyHearthType(embers)).toBe('proper-firepit')
  })

  it('returns candle for avg 35-54', () => {
    const embers = [makeEmber('a.ts', 40, 40, 40, 40, 40)]
    expect(classifyHearthType(embers)).toBe('candle')
  })

  it('returns no-heat for avg < 35', () => {
    const embers = [makeEmber('a.ts', 10, 10, 10, 10, 10)]
    expect(classifyHearthType(embers)).toBe('no-heat')
  })
})

describe('classifyHearthCondition', () => {
  it('classifies amber-sanctuary at 85+', () => {
    expect(classifyHearthCondition(85)).toBe('amber-sanctuary')
    expect(classifyHearthCondition(100)).toBe('amber-sanctuary')
  })

  it('classifies warm-cabin at 70-84', () => {
    expect(classifyHearthCondition(70)).toBe('warm-cabin')
    expect(classifyHearthCondition(84)).toBe('warm-cabin')
  })

  it('classifies proper-room at 55-69', () => {
    expect(classifyHearthCondition(55)).toBe('proper-room')
    expect(classifyHearthCondition(69)).toBe('proper-room')
  })

  it('classifies cold-cave at 35-54', () => {
    expect(classifyHearthCondition(35)).toBe('cold-cave')
    expect(classifyHearthCondition(54)).toBe('cold-cave')
  })

  it('classifies empty-space at 15-34', () => {
    expect(classifyHearthCondition(15)).toBe('empty-space')
    expect(classifyHearthCondition(34)).toBe('empty-space')
  })

  it('classifies void below 15', () => {
    expect(classifyHearthCondition(0)).toBe('void')
    expect(classifyHearthCondition(14)).toBe('void')
  })
})

describe('classifyFirekeeperGrade', () => {
  it('classifies master-firekeeper at 80+', () => {
    expect(classifyFirekeeperGrade(80)).toBe('master-firekeeper')
    expect(classifyFirekeeperGrade(100)).toBe('master-firekeeper')
  })

  it('classifies amber-guardian at 65-79', () => {
    expect(classifyFirekeeperGrade(65)).toBe('amber-guardian')
    expect(classifyFirekeeperGrade(79)).toBe('amber-guardian')
  })

  it('classifies proper-tender at 50-64', () => {
    expect(classifyFirekeeperGrade(50)).toBe('proper-tender')
    expect(classifyFirekeeperGrade(64)).toBe('proper-tender')
  })

  it('classifies apprentice at 35-49', () => {
    expect(classifyFirekeeperGrade(35)).toBe('apprentice')
    expect(classifyFirekeeperGrade(49)).toBe('apprentice')
  })

  it('classifies novice at 20-34', () => {
    expect(classifyFirekeeperGrade(20)).toBe('novice')
    expect(classifyFirekeeperGrade(34)).toBe('novice')
  })

  it('classifies ice-walker below 20', () => {
    expect(classifyFirekeeperGrade(0)).toBe('ice-walker')
    expect(classifyFirekeeperGrade(19)).toBe('ice-walker')
  })
})

// ─── analyzeAmberEmber ──────────────────────────────────

describe('analyzeAmberEmber', () => {
  it('returns a complete ember', () => {
    const ember = analyzeAmberEmber(richContent, 'app.ts')
    expect(ember.file).toBe('app.ts')
    expect(ember.qualityScore).toBeGreaterThan(0)
    expect(ember.preserving).toBeDefined()
    expect(ember.illuminating).toBeDefined()
    expect(ember.persisting).toBeDefined()
    expect(ember.learning).toBeDefined()
    expect(ember.binding).toBeDefined()
  })

  it('computes qualityScore as weighted average', () => {
    const ember = analyzeAmberEmber(richContent, 'app.ts')
    const expected = Math.round(
      ember.preservationWarmth * 0.2 +
      ember.glowClarity * 0.2 +
      ember.firePersistence * 0.2 +
      ember.ashWisdom * 0.2 +
      ember.resinStrength * 0.2,
    )
    expect(ember.qualityScore).toBe(expected)
  })

  it('classifies condition from qualityScore', () => {
    const ember = analyzeAmberEmber(richContent, 'app.ts')
    expect(ember.condition).toBe(classifyAmberCondition(ember.qualityScore))
  })

  it('handles empty content', () => {
    const ember = analyzeAmberEmber('', 'empty.ts')
    expect(ember.qualityScore).toBeLessThan(50)
    expect(ember.condition).toBe('dust')
  })

  it('scores rich content at max', () => {
    const ember = analyzeAmberEmber(richContent, 'rich.ts')
    expect(ember.preservationWarmth).toBe(100)
    expect(ember.glowClarity).toBe(100)
    expect(ember.firePersistence).toBe(100)
    expect(ember.ashWisdom).toBe(100)
    expect(ember.resinStrength).toBe(100)
    expect(ember.qualityScore).toBe(100)
  })

  it('scores poor content low', () => {
    const ember = analyzeAmberEmber(poorContent, 'poor.ts')
    expect(ember.qualityScore).toBeLessThan(60)
  })
})

// ─── analyzeAmberHearth ─────────────────────────────────

describe('analyzeAmberHearth', () => {
  it('returns empty hearth for no embers', () => {
    const hearth = analyzeAmberHearth([], 'src')
    expect(hearth.embers).toHaveLength(0)
    expect(hearth.hearthType).toBe('no-hearth')
    expect(hearth.condition).toBe('void')
    expect(hearth.avgWarmth).toBe(0)
  })

  it('computes averages from embers', () => {
    const embers = [makeEmber('a.ts', 80, 70, 60, 50, 40)]
    const hearth = analyzeAmberHearth(embers, 'src')
    expect(hearth.avgWarmth).toBe(80)
    expect(hearth.avgPersistence).toBe(60)
    expect(hearth.avgWisdom).toBe(50)
  })

  it('counts amber masterpieces', () => {
    const embers = [makeEmber('a.ts', 95, 95, 95, 95, 95), makeEmber('b.ts', 50, 50, 50, 50, 50)]
    const hearth = analyzeAmberHearth(embers, 'src')
    expect(hearth.amberMasterpieceCount).toBe(1)
  })

  it('counts void embers', () => {
    const embers = [makeEmber('a.ts', 10, 10, 10, 10, 10)]
    const hearth = analyzeAmberHearth(embers, 'src')
    expect(hearth.voidCount).toBe(1)
  })

  it('classifies hearth type from embers', () => {
    const embers = [makeEmber('a.ts', 90, 90, 90, 90, 90)]
    const hearth = analyzeAmberHearth(embers, 'src')
    expect(hearth.hearthType).toBe('grand-fireplace')
  })
})

// ─── buildAmberBlazeResult ──────────────────────────────

describe('buildAmberBlazeResult', () => {
  it('returns result with empty files', async () => {
    const result = await buildAmberBlazeResult([], [])
    expect(result.embers).toHaveLength(0)
    expect(result.hearths).toHaveLength(0)
    expect(result.fire.overallRadiance).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns result with single file', async () => {
    const result = await buildAmberBlazeResult(['app.ts'], [richContent])
    expect(result.embers).toHaveLength(1)
    expect(result.embers[0].file).toBe('app.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files into hearths by directory', async () => {
    const result = await buildAmberBlazeResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, moderateContent],
    )
    expect(result.hearths).toHaveLength(2)
    expect(result.stats.totalHearths).toBe(2)
  })

  it('computes overall radiance as average', async () => {
    const result = await buildAmberBlazeResult(['a.ts'], [richContent])
    expect(result.fire.overallRadiance).toBe(100)
  })

  it('computes fire.isAmber when radiance >= 60', async () => {
    const result = await buildAmberBlazeResult(['a.ts'], [richContent])
    expect(result.fire.isAmber).toBe(true)
  })

  it('computes fire.isAmber false when radiance < 60', async () => {
    const result = await buildAmberBlazeResult(['a.ts'], [emptyContent])
    expect(result.fire.isAmber).toBe(false)
  })

  it('computes stats correctly', async () => {
    const result = await buildAmberBlazeResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.firekeeperGrade).toBeDefined()
  })

  it('finds best ember', async () => {
    const result = await buildAmberBlazeResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.bestEmber).toBe('a.ts')
  })

  it('finds warmest file', async () => {
    const result = await buildAmberBlazeResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.warmest).toBe('a.ts')
  })

  it('finds clearest file', async () => {
    const result = await buildAmberBlazeResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.clearest).toBe('a.ts')
  })

  it('finds most persistent file', async () => {
    const result = await buildAmberBlazeResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.mostPersistent).toBe('a.ts')
  })

  it('finds wisest file', async () => {
    const result = await buildAmberBlazeResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.wisest).toBe('a.ts')
  })

  it('finds strongest file', async () => {
    const result = await buildAmberBlazeResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.strongest).toBe('a.ts')
  })

  it('handles options parameter', async () => {
    const result = await buildAmberBlazeResult(['a.ts'], [richContent], {})
    expect(result.embers).toHaveLength(1)
  })

  it('returns default strings for empty input', async () => {
    const result = await buildAmberBlazeResult([], [])
    expect(result.stats.bestEmber).toBe('')
    expect(result.stats.warmest).toBe('')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all scores >= 90', () => {
    const stats = makeStats({
      avgPreservationWarmth: 90, avgGlowClarity: 90, avgFirePersistence: 90, avgAshWisdom: 90, avgResinStrength: 90,
    })
    const recs = generateRecommendations([], [], { avgWarmth: 90, avgPersistence: 90, avgWisdom: 90, isAmber: true, overallRadiance: 90 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends warming preservation when low', () => {
    const stats = makeStats({ avgPreservationWarmth: 50 })
    const recs = generateRecommendations([], [], { avgWarmth: 50, avgPersistence: 80, avgWisdom: 80, isAmber: true, overallRadiance: 80 }, stats)
    expect(recs.some((r) => r.includes('preservation'))).toBe(true)
  })

  it('recommends brightening glow when low', () => {
    const stats = makeStats({ avgGlowClarity: 50 })
    const recs = generateRecommendations([], [], { avgWarmth: 80, avgPersistence: 80, avgWisdom: 80, isAmber: true, overallRadiance: 80 }, stats)
    expect(recs.some((r) => r.includes('glow'))).toBe(true)
  })

  it('recommends strengthening fire persistence when low', () => {
    const stats = makeStats({ avgFirePersistence: 50 })
    const recs = generateRecommendations([], [], { avgWarmth: 80, avgPersistence: 50, avgWisdom: 80, isAmber: true, overallRadiance: 80 }, stats)
    expect(recs.some((r) => r.includes('fire persistence'))).toBe(true)
  })

  it('recommends growing ash wisdom when low', () => {
    const stats = makeStats({ avgAshWisdom: 50 })
    const recs = generateRecommendations([], [], { avgWarmth: 80, avgPersistence: 80, avgWisdom: 50, isAmber: true, overallRadiance: 80 }, stats)
    expect(recs.some((r) => r.includes('ash wisdom'))).toBe(true)
  })

  it('recommends fortifying resin when low', () => {
    const stats = makeStats({ avgResinStrength: 50 })
    const recs = generateRecommendations([], [], { avgWarmth: 80, avgPersistence: 80, avgWisdom: 80, isAmber: true, overallRadiance: 80 }, stats)
    expect(recs.some((r) => r.includes('resin'))).toBe(true)
  })

  it('recommends cold dust when radiance < 40', () => {
    const stats = makeStats({ overallRadiance: 30 })
    const recs = generateRecommendations([], [], { avgWarmth: 80, avgPersistence: 80, avgWisdom: 80, isAmber: false, overallRadiance: 30 }, stats)
    expect(recs.some((r) => r.includes('cold dust'))).toBe(true)
  })

  it('lists void embers by name when <= 5', () => {
    const embers = [makeEmber('a.ts', 10, 10, 10, 10, 10)]
    const stats = makeStats({ overallRadiance: 30, voidCount: 1 })
    const recs = generateRecommendations(embers, [], { avgWarmth: 30, avgPersistence: 30, avgWisdom: 30, isAmber: false, overallRadiance: 30 }, stats)
    expect(recs.some((r) => r.includes('a.ts'))).toBe(true)
  })

  it('summarizes void embers when > 5', () => {
    const embers = Array.from({ length: 6 }, (_, i) => makeEmber(`${i}.ts`, 10, 10, 10, 10, 10))
    const stats = makeStats({ overallRadiance: 10, voidCount: 6 })
    const recs = generateRecommendations(embers, [], { avgWarmth: 10, avgPersistence: 10, avgWisdom: 10, isAmber: false, overallRadiance: 10 }, stats)
    expect(recs.some((r) => r.includes('6 cold stones'))).toBe(true)
  })

  it('recommends complete restoration when all hearths are poor', () => {
    const hearths: AmberHearth[] = [{ directory: 'src', embers: [], avgWarmth: 0, avgPersistence: 0, avgWisdom: 0, amberMasterpieceCount: 0, voidCount: 0, hearthType: 'no-hearth' as HearthType, condition: 'void' as HearthCondition }]
    const stats = makeStats({ overallRadiance: 10 })
    const recs = generateRecommendations([], hearths, { avgWarmth: 10, avgPersistence: 10, avgWisdom: 10, isAmber: false, overallRadiance: 10 }, stats)
    expect(recs.some((r) => r.includes('complete restoration'))).toBe(true)
  })

  it('returns positive recommendation when all is well', () => {
    const stats = makeStats({ avgPreservationWarmth: 80, avgGlowClarity: 80, avgFirePersistence: 80, avgAshWisdom: 80, avgResinStrength: 80, overallRadiance: 80 })
    const recs = generateRecommendations([], [], { avgWarmth: 80, avgPersistence: 80, avgWisdom: 80, isAmber: true, overallRadiance: 80 }, stats)
    expect(recs.some((r) => r.includes('radiates warmth'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('colorAmberCondition returns string', () => {
    expect(typeof colorAmberCondition('amber-masterpiece')).toBe('string')
    expect(typeof colorAmberCondition('void')).toBe('string')
    expect(typeof colorAmberCondition('unknown')).toBe('string')
  })

  it('colorHearthCondition returns string', () => {
    expect(typeof colorHearthCondition('amber-sanctuary')).toBe('string')
    expect(typeof colorHearthCondition('void')).toBe('string')
    expect(typeof colorHearthCondition('unknown')).toBe('string')
  })

  it('formatEmberTable returns string', () => {
    const ember = analyzeAmberEmber(richContent, 'app.ts')
    expect(typeof formatEmberTable(ember)).toBe('string')
  })

  it('formatEmbersTable handles empty', () => {
    expect(formatEmbersTable([])).toContain('No amber embers')
  })

  it('formatEmbersTable formats embers', () => {
    const embers = [analyzeAmberEmber(richContent, 'app.ts')]
    expect(formatEmbersTable(embers)).toContain('app.ts')
  })

  it('formatHearthTable returns string', () => {
    const hearth = analyzeAmberHearth([makeEmber('a.ts', 80, 80, 80, 80, 80)], 'src')
    expect(typeof formatHearthTable(hearth)).toBe('string')
  })

  it('formatHearthsTable handles empty', () => {
    expect(formatHearthsTable([])).toContain('No amber hearths')
  })

  it('formatHearthsTable formats hearths', () => {
    const hearths = [analyzeAmberHearth([makeEmber('a.ts', 80, 80, 80, 80, 80)], 'src')]
    expect(formatHearthsTable(hearths)).toContain('src')
  })

  it('formatStatsTable returns string', () => {
    const stats = makeStats()
    expect(typeof formatStatsTable(stats)).toBe('string')
  })

  it('formatRecommendations handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formatRecommendations formats items', () => {
    expect(formatRecommendations(['Fix X'])).toContain('Fix X')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildAmberBlazeResult(['a.ts'], [richContent])
    expect(typeof formatResultTable(result)).toBe('string')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildAmberBlazeResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })
})

// ─── Type exports ───────────────────────────────────────

describe('type exports', () => {
  it('AmberCondition has expected values', () => {
    const conditions: AmberCondition[] = ['amber-masterpiece', 'golden-blaze', 'proper-fossil', 'cool-stone', 'dust', 'void']
    expect(conditions).toHaveLength(6)
  })

  it('HearthType has expected values', () => {
    const types: HearthType[] = ['grand-fireplace', 'amber-hearth', 'proper-firepit', 'candle', 'no-heat', 'no-hearth']
    expect(types).toHaveLength(6)
  })

  it('HearthCondition has expected values', () => {
    const conditions: HearthCondition[] = ['amber-sanctuary', 'warm-cabin', 'proper-room', 'cold-cave', 'empty-space', 'void']
    expect(conditions).toHaveLength(6)
  })

  it('FirekeeperGrade has expected values', () => {
    const grades: FirekeeperGrade[] = ['master-firekeeper', 'amber-guardian', 'proper-tender', 'apprentice', 'novice', 'ice-walker']
    expect(grades).toHaveLength(6)
  })
})
