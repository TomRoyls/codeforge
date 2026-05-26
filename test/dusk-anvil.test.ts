import { describe, expect, it } from 'vitest'

import {
  type CraftingMeasure,
  type EnduringMeasure,
  type GlowingMeasure,
  type HearthCondition,
  type HearthType,
  type RevealingMeasure,
  type SmithGrade,
  type TransitioningMeasure,
  type TwilightCondition,
  type TwilightForgeResult,
  type TwilightHearth,
  type TwilightSpark,
  analyzeTwilightHearth,
  analyzeTwilightSpark,
  buildTwilightForgeResult,
  classifyHearthCondition,
  classifyHearthType,
  classifySmithGrade,
  classifyTwilightCondition,
  generateRecommendations,
  measureCrafting,
  measureEnduring,
  measureGlowing,
  measureRevealing,
  measureTransitioning,
} from '../src/commands/dusk-anvil-helpers.js'

import {
  colorHearthCondition,
  colorScore,
  formatHearthTable,
  formatHearthsTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatSparkTable,
  formatSparksTable,
  formatStatsTable,
} from '../src/commands/dusk-anvil-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const richContent = `import { readFileSync } from 'node:fs'
import type { Result } from './types.js'

/** Documentation */
export interface Config {
  readonly name: string
  private?: boolean
}

export type Options = Record<string, unknown>

export class Analyzer<T> {
  async analyze(input: string): Promise<Result> {
    try {
      const result = readFileSync(input, 'utf8')
      if (result === 'test') {
        return JSON.parse(result) as Result
      }
      return {} as Result
    } catch (err) {
      throw new Error('fail')
    }
  }
}

export const defaultConfig: Options = { name: 'test' }
`

const emptyContent = ''

const poorContent = 'var x = eval("1")'

const moderateContent = [
  'import { X } from "y"',
  'export class App {',
  '  name: string',
  '  run() { return 1 }',
  '}',
].join('\n')

function makeSpark(
  file: string,
  grace: number,
  resilience: number,
  emergence: number,
  twilight: number,
  wisdom: number,
): TwilightSpark {
  const qualityScore = Math.round(grace * 0.2 + resilience * 0.2 + emergence * 0.2 + twilight * 0.2 + wisdom * 0.2)
  return {
    file,
    transitionGrace: grace,
    duskResilience: resilience,
    starEmergence: emergence,
    forgeTwilight: twilight,
    emberWisdom: wisdom,
    transitioning: { grace, transition: 'seamless-fade', hasHighGrace: grace >= 60, hasModular: true, hasNoTangled: true, hasExtensible: true, hasNoRigid: true, hasAdaptable: true, hasFlexible: true, hasCleanPipelines: true, hasDecoupled: true, hasEvolving: true, hasRefactorable: true, hasMaintainable: true, hasSmooth: true, hasElegant: true, hasGraceful: true, hasFluid: true, tangledCount: 0, rigidCount: 0 } as TransitioningMeasure,
    enduring: { resilience, dusk: 'golden-hour', hasHighResilience: resilience >= 60, hasErrorHandled: true, hasNoUnhandled: true, hasDefensive: true, hasRobust: true, hasTested: true, hasNoUntested: true, hasStable: true, hasForgiving: true, hasPatient: true, hasTolerant: true, hasResilient: true, hasAdaptable: true, hasVersatile: true, hasResourceful: true, hasHardened: true, unhandledCount: 0, untestedCount: 0 } as EnduringMeasure,
    revealing: { emergence, stars: 'constellation-reveal', hasHighEmergence: emergence >= 60, hasReadable: true, hasNoCryptic: true, hasSelfDocumenting: true, hasNoMystery: true, hasClear: true, hasNoObfuscated: true, hasVisible: true, hasRevealed: true, hasDocumented: true, hasTransparent: true, hasIlluminated: true, hasExpressive: true, hasOpen: true, hasDirect: true, hasHonest: true, crypticCount: 0, obfuscatedCount: 0 } as RevealingMeasure,
    crafting: { twilight, forge: 'master-smithy', hasHighForge: twilight >= 60, hasWellStructured: true, hasNoChaotic: true, hasOrganized: true, hasIntentional: true, hasDisciplined: true, hasCrafted: true, hasDeliberate: true, hasShaped: true, hasRefined: true, hasPrecise: true, hasSkilled: true, hasTempered: true, hasHardenedForge: true, hasMasterful: true, hasArtisan: true, chaoticCount: 0, sloppyCount: 0 } as CraftingMeasure,
    glowing: { wisdom, ember: 'ancient-coals', hasHighWisdom: wisdom >= 60, hasWellArchitected: true, hasNoHacked: true, hasPrincipled: true, hasDeep: true, hasProven: true, hasMature: true, hasStrategic: true, hasInsightful: true, hasReflective: true, hasExperienced: true, hasEvolved: true, hasLearned: true, hasWise: true, hasAccumulated: true, hasTimeless: true, hackedCount: 0, shallowCount: 0 } as GlowingMeasure,
    condition: classifyTwilightCondition(qualityScore),
    qualityScore,
  }
}

function makeStats(overrides: Partial<TwilightForgeResult['stats']> = {}): TwilightForgeResult['stats'] {
  return {
    totalFiles: 1,
    totalHearths: 1,
    avgTransitionGrace: 80,
    avgDuskResilience: 80,
    avgStarEmergence: 80,
    avgForgeTwilight: 80,
    avgEmberWisdom: 80,
    twilightMasterpieceCount: 0,
    goldenHourPerfectionCount: 1,
    properDuskCount: 0,
    fadingLightCount: 0,
    pitchDarkCount: 0,
    voidCount: 0,
    hasHighGraceCount: 1,
    hasHighResilienceCount: 1,
    hasHighEmergenceCount: 1,
    hasHighForgeCount: 1,
    hasHighWisdomCount: 1,
    overallLuminosity: 80,
    smithGrade: 'dusk-forger' as SmithGrade,
    bestSpark: 'app.ts',
    mostGraceful: 'app.ts',
    mostResilient: 'app.ts',
    mostRevealing: 'app.ts',
    bestForged: 'app.ts',
    wisest: 'app.ts',
    ...overrides,
  }
}

// ─── measureTransitioning ───────────────────────────────

describe('measureTransitioning', () => {
  it('scores rich content highly', () => {
    const result = measureTransitioning(richContent)
    expect(result.grace).toBeGreaterThan(60)
    expect(result.hasHighGrace).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureTransitioning(emptyContent)
    expect(result.grace).toBeLessThan(50)
  })

  it('detects tangled patterns', () => {
    const result = measureTransitioning('tangled spaghetti coupled code')
    expect(result.tangledCount).toBeGreaterThan(0)
    expect(result.hasNoTangled).toBe(false)
  })

  it('detects rigid patterns', () => {
    const result = measureTransitioning('rigid inflexible hardcoded code')
    expect(result.rigidCount).toBeGreaterThan(0)
  })

  it('detects modular imports', () => {
    const result = measureTransitioning('import { X } from "y"')
    expect(result.hasModular).toBe(true)
  })

  it('detects extensible class/interface', () => {
    const result = measureTransitioning('class Foo {}')
    expect(result.hasExtensible).toBe(true)
  })

  it('detects adaptable types', () => {
    const result = measureTransitioning('const x: string = "ok"')
    expect(result.hasAdaptable).toBe(true)
  })

  it('detects flexible code (no any)', () => {
    const result = measureTransitioning('const x: string = "ok"')
    expect(result.hasFlexible).toBe(true)
  })

  it('detects clean pipelines function/return', () => {
    const result = measureTransitioning('function foo() { return 1 }')
    expect(result.hasCleanPipelines).toBe(true)
  })

  it('detects evolving async', () => {
    const result = measureTransitioning('async function foo() { await bar() }')
    expect(result.hasEvolving).toBe(true)
  })

  it('detects maintainable documentation', () => {
    const result = measureTransitioning('/** doc */')
    expect(result.hasMaintainable).toBe(true)
  })

  it('detects smooth const/readonly', () => {
    const result = measureTransitioning('const x = 1')
    expect(result.hasSmooth).toBe(true)
  })

  it('detects elegant try/catch', () => {
    const result = measureTransitioning('try { x } catch { y }')
    expect(result.hasElegant).toBe(true)
  })

  it('returns transition classification', () => {
    const result = measureTransitioning(richContent)
    expect(result.transition).toBeDefined()
  })

  it('detects fluid (no var/eval)', () => {
    const result = measureTransitioning('clean code')
    expect(result.hasFluid).toBe(true)
  })
})

// ─── measureEnduring ────────────────────────────────────

describe('measureEnduring', () => {
  it('scores rich content highly', () => {
    const result = measureEnduring(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureEnduring(emptyContent)
    expect(result.resilience).toBeLessThan(50)
  })

  it('detects error handling', () => {
    const result = measureEnduring('try { x } catch { y }')
    expect(result.hasErrorHandled).toBe(true)
  })

  it('detects unhandled eval/Function', () => {
    const result = measureEnduring('eval("1") new Function("x")')
    expect(result.unhandledCount).toBeGreaterThan(0)
  })

  it('detects defensive types', () => {
    const result = measureEnduring('const x: string = "ok"')
    expect(result.hasDefensive).toBe(true)
  })

  it('detects stable const/readonly', () => {
    const result = measureEnduring('const x = 1')
    expect(result.hasStable).toBe(true)
  })

  it('detects patient async', () => {
    const result = measureEnduring('async function foo() { await bar() }')
    expect(result.hasPatient).toBe(true)
  })

  it('detects robust code (no any)', () => {
    const result = measureEnduring('const x: string = "ok"')
    expect(result.hasRobust).toBe(true)
  })

  it('detects tolerant documentation', () => {
    const result = measureEnduring('/** doc */')
    expect(result.hasTolerant).toBe(true)
  })

  it('detects resilient (no var/eval)', () => {
    const result = measureEnduring('clean code')
    expect(result.hasResilient).toBe(true)
  })

  it('detects adaptable visibility', () => {
    const result = measureEnduring('private x: string')
    expect(result.hasAdaptable).toBe(true)
  })

  it('detects versatile imports', () => {
    const result = measureEnduring('import { X } from "y"')
    expect(result.hasVersatile).toBe(true)
  })

  it('returns dusk classification', () => {
    const result = measureEnduring(richContent)
    expect(result.dusk).toBeDefined()
  })

  it('detects hardened (no monolithic)', () => {
    const result = measureEnduring('clean code')
    expect(result.hasHardened).toBe(true)
  })

  it('detects resourceful class/interface', () => {
    const result = measureEnduring('class Foo {}')
    expect(result.hasResourceful).toBe(true)
  })
})

// ─── measureRevealing ───────────────────────────────────

describe('measureRevealing', () => {
  it('scores rich content highly', () => {
    const result = measureRevealing(richContent)
    expect(result.emergence).toBeGreaterThan(60)
    expect(result.hasHighEmergence).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureRevealing(emptyContent)
    expect(result.emergence).toBeLessThan(50)
  })

  it('detects cryptic patterns', () => {
    const result = measureRevealing('cryptic obfuscated minified code')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated var/eval', () => {
    const result = measureRevealing('var x = eval("1")')
    expect(result.obfuscatedCount).toBeGreaterThan(0)
    expect(result.hasNoObfuscated).toBe(false)
  })

  it('detects readable class/interface', () => {
    const result = measureRevealing('class Foo {}')
    expect(result.hasReadable).toBe(true)
  })

  it('detects self-documenting types', () => {
    const result = measureRevealing('const x: string = "ok"')
    expect(result.hasSelfDocumenting).toBe(true)
  })

  it('detects clear code (no any)', () => {
    const result = measureRevealing('const x: string = "ok"')
    expect(result.hasClear).toBe(true)
  })

  it('detects documented code', () => {
    const result = measureRevealing('/** doc */')
    expect(result.hasDocumented).toBe(true)
  })

  it('detects illuminated async', () => {
    const result = measureRevealing('async function foo() { await bar() }')
    expect(result.hasIlluminated).toBe(true)
  })

  it('detects honest readonly/as-const', () => {
    const result = measureRevealing('readonly x: string')
    expect(result.hasHonest).toBe(true)
  })

  it('detects transparent imports', () => {
    const result = measureRevealing('import { X } from "y"')
    expect(result.hasTransparent).toBe(true)
  })

  it('detects revealed try/catch', () => {
    const result = measureRevealing('try { x } catch { y }')
    expect(result.hasRevealed).toBe(true)
  })

  it('returns stars classification', () => {
    const result = measureRevealing(richContent)
    expect(result.stars).toBeDefined()
  })

  it('detects direct (no monolithic)', () => {
    const result = measureRevealing('clean code')
    expect(result.hasDirect).toBe(true)
  })

  it('detects open const/readonly', () => {
    const result = measureRevealing('const x = 1')
    expect(result.hasOpen).toBe(true)
  })
})

// ─── measureCrafting ────────────────────────────────────

describe('measureCrafting', () => {
  it('scores rich content highly', () => {
    const result = measureCrafting(richContent)
    expect(result.twilight).toBeGreaterThan(60)
    expect(result.hasHighForge).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureCrafting(emptyContent)
    expect(result.twilight).toBeLessThan(50)
  })

  it('detects chaotic var/eval', () => {
    const result = measureCrafting('var x = eval("1")')
    expect(result.chaoticCount).toBeGreaterThan(0)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects sloppy patterns', () => {
    const result = measureCrafting('sloppy messy hacky code')
    expect(result.sloppyCount).toBeGreaterThan(0)
  })

  it('detects well-structured code', () => {
    const result = measureCrafting('class Foo {}')
    expect(result.hasWellStructured).toBe(true)
  })

  it('detects organized imports', () => {
    const result = measureCrafting('import { X } from "y"')
    expect(result.hasOrganized).toBe(true)
  })

  it('detects disciplined code (no any)', () => {
    const result = measureCrafting('const x: string = "ok"')
    expect(result.hasDisciplined).toBe(true)
  })

  it('detects crafted function/return', () => {
    const result = measureCrafting('function foo() { return 1 }')
    expect(result.hasCrafted).toBe(true)
  })

  it('detects deliberate visibility', () => {
    const result = measureCrafting('private x: string')
    expect(result.hasDeliberate).toBe(true)
  })

  it('detects refined documentation', () => {
    const result = measureCrafting('/** doc */')
    expect(result.hasRefined).toBe(true)
  })

  it('detects tempered async', () => {
    const result = measureCrafting('async function foo() { await bar() }')
    expect(result.hasTempered).toBe(true)
  })

  it('detects masterful const/readonly', () => {
    const result = measureCrafting('const x = 1')
    expect(result.hasMasterful).toBe(true)
  })

  it('returns forge classification', () => {
    const result = measureCrafting(richContent)
    expect(result.forge).toBeDefined()
  })

  it('detects shaped try/catch', () => {
    const result = measureCrafting('try { x } catch { y }')
    expect(result.hasShaped).toBe(true)
  })

  it('detects precise (no monolithic)', () => {
    const result = measureCrafting('clean code')
    expect(result.hasPrecise).toBe(true)
  })
})

// ─── measureGlowing ─────────────────────────────────────

describe('measureGlowing', () => {
  it('scores rich content highly', () => {
    const result = measureGlowing(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureGlowing(emptyContent)
    expect(result.wisdom).toBeLessThan(50)
  })

  it('detects hacked patterns', () => {
    const result = measureGlowing('hack workaround kludge code')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects shallow patterns', () => {
    const result = measureGlowing('shallow superficial trivial code')
    expect(result.shallowCount).toBeGreaterThan(0)
  })

  it('detects well-architected code', () => {
    const result = measureGlowing('class Foo {}')
    expect(result.hasWellArchitected).toBe(true)
  })

  it('detects principled code (no any)', () => {
    const result = measureGlowing('const x: string = "ok"')
    expect(result.hasPrincipled).toBe(true)
  })

  it('detects deep types', () => {
    const result = measureGlowing('const x: string = "ok"')
    expect(result.hasDeep).toBe(true)
  })

  it('detects proven try/catch', () => {
    const result = measureGlowing('try { x } catch { y }')
    expect(result.hasProven).toBe(true)
  })

  it('detects mature documentation', () => {
    const result = measureGlowing('/** doc */')
    expect(result.hasMature).toBe(true)
  })

  it('detects strategic imports', () => {
    const result = measureGlowing('import { X } from "y"')
    expect(result.hasStrategic).toBe(true)
  })

  it('detects reflective async', () => {
    const result = measureGlowing('async function foo() { await bar() }')
    expect(result.hasReflective).toBe(true)
  })

  it('detects evolved const/readonly', () => {
    const result = measureGlowing('const x = 1')
    expect(result.hasEvolved).toBe(true)
  })

  it('detects wise (no var/eval)', () => {
    const result = measureGlowing('clean code')
    expect(result.hasWise).toBe(true)
  })

  it('returns ember classification', () => {
    const result = measureGlowing(richContent)
    expect(result.ember).toBeDefined()
  })

  it('detects timeless throw/return', () => {
    const result = measureGlowing('throw new Error("x")')
    expect(result.hasTimeless).toBe(true)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyTwilightCondition', () => {
  it('classifies twilight-masterpiece at 90+', () => {
    expect(classifyTwilightCondition(90)).toBe('twilight-masterpiece')
    expect(classifyTwilightCondition(100)).toBe('twilight-masterpiece')
  })

  it('classifies golden-hour-perfection at 75-89', () => {
    expect(classifyTwilightCondition(75)).toBe('golden-hour-perfection')
    expect(classifyTwilightCondition(89)).toBe('golden-hour-perfection')
  })

  it('classifies proper-dusk at 60-74', () => {
    expect(classifyTwilightCondition(60)).toBe('proper-dusk')
    expect(classifyTwilightCondition(74)).toBe('proper-dusk')
  })

  it('classifies fading-light at 40-59', () => {
    expect(classifyTwilightCondition(40)).toBe('fading-light')
    expect(classifyTwilightCondition(59)).toBe('fading-light')
  })

  it('classifies pitch-dark at 20-39', () => {
    expect(classifyTwilightCondition(20)).toBe('pitch-dark')
    expect(classifyTwilightCondition(39)).toBe('pitch-dark')
  })

  it('classifies void below 20', () => {
    expect(classifyTwilightCondition(0)).toBe('void')
    expect(classifyTwilightCondition(19)).toBe('void')
  })
})

describe('classifyHearthType', () => {
  it('returns no-hearth for empty array', () => {
    expect(classifyHearthType([])).toBe('no-hearth')
  })

  it('returns grand-forge for avg >= 85', () => {
    const sparks = [makeSpark('a.ts', 90, 90, 90, 90, 90)]
    expect(classifyHearthType(sparks)).toBe('grand-forge')
  })

  it('returns twilight-hearth for avg 70-84', () => {
    const sparks = [makeSpark('a.ts', 75, 75, 75, 75, 75)]
    expect(classifyHearthType(sparks)).toBe('twilight-hearth')
  })

  it('returns proper-firepit for avg 55-69', () => {
    const sparks = [makeSpark('a.ts', 60, 60, 60, 60, 60)]
    expect(classifyHearthType(sparks)).toBe('proper-firepit')
  })

  it('returns single-candle for avg 35-54', () => {
    const sparks = [makeSpark('a.ts', 40, 40, 40, 40, 40)]
    expect(classifyHearthType(sparks)).toBe('single-candle')
  })

  it('returns no-flame for avg < 35', () => {
    const sparks = [makeSpark('a.ts', 10, 10, 10, 10, 10)]
    expect(classifyHearthType(sparks)).toBe('no-flame')
  })
})

describe('classifyHearthCondition', () => {
  it('classifies twilight-sanctuary at 85+', () => {
    expect(classifyHearthCondition(85)).toBe('twilight-sanctuary')
    expect(classifyHearthCondition(100)).toBe('twilight-sanctuary')
  })

  it('classifies ember-hall at 70-84', () => {
    expect(classifyHearthCondition(70)).toBe('ember-hall')
    expect(classifyHearthCondition(84)).toBe('ember-hall')
  })

  it('classifies proper-workshop at 55-69', () => {
    expect(classifyHearthCondition(55)).toBe('proper-workshop')
    expect(classifyHearthCondition(69)).toBe('proper-workshop')
  })

  it('classifies dark-corner at 35-54', () => {
    expect(classifyHearthCondition(35)).toBe('dark-corner')
    expect(classifyHearthCondition(54)).toBe('dark-corner')
  })

  it('classifies void-space at 15-34', () => {
    expect(classifyHearthCondition(15)).toBe('void-space')
    expect(classifyHearthCondition(34)).toBe('void-space')
  })

  it('classifies void below 15', () => {
    expect(classifyHearthCondition(0)).toBe('void')
    expect(classifyHearthCondition(14)).toBe('void')
  })
})

describe('classifySmithGrade', () => {
  it('classifies twilight-master at 80+', () => {
    expect(classifySmithGrade(80)).toBe('twilight-master')
    expect(classifySmithGrade(100)).toBe('twilight-master')
  })

  it('classifies dusk-forger at 65-79', () => {
    expect(classifySmithGrade(65)).toBe('dusk-forger')
    expect(classifySmithGrade(79)).toBe('dusk-forger')
  })

  it('classifies proper-smith at 50-64', () => {
    expect(classifySmithGrade(50)).toBe('proper-smith')
    expect(classifySmithGrade(64)).toBe('proper-smith')
  })

  it('classifies apprentice at 35-49', () => {
    expect(classifySmithGrade(35)).toBe('apprentice')
    expect(classifySmithGrade(49)).toBe('apprentice')
  })

  it('classifies novice at 20-34', () => {
    expect(classifySmithGrade(20)).toBe('novice')
    expect(classifySmithGrade(34)).toBe('novice')
  })

  it('classifies night-blind below 20', () => {
    expect(classifySmithGrade(0)).toBe('night-blind')
    expect(classifySmithGrade(19)).toBe('night-blind')
  })
})

// ─── analyzeTwilightSpark ───────────────────────────────

describe('analyzeTwilightSpark', () => {
  it('returns a complete spark', () => {
    const spark = analyzeTwilightSpark(richContent, 'app.ts')
    expect(spark.file).toBe('app.ts')
    expect(spark.qualityScore).toBeGreaterThan(0)
    expect(spark.transitioning).toBeDefined()
    expect(spark.enduring).toBeDefined()
    expect(spark.revealing).toBeDefined()
    expect(spark.crafting).toBeDefined()
    expect(spark.glowing).toBeDefined()
  })

  it('computes qualityScore as weighted average', () => {
    const spark = analyzeTwilightSpark(richContent, 'app.ts')
    const expected = Math.round(
      spark.transitionGrace * 0.2 +
      spark.duskResilience * 0.2 +
      spark.starEmergence * 0.2 +
      spark.forgeTwilight * 0.2 +
      spark.emberWisdom * 0.2,
    )
    expect(spark.qualityScore).toBe(expected)
  })

  it('scores rich content at max', () => {
    const spark = analyzeTwilightSpark(richContent, 'rich.ts')
    expect(spark.transitionGrace).toBe(100)
    expect(spark.duskResilience).toBe(100)
    expect(spark.starEmergence).toBe(100)
    expect(spark.forgeTwilight).toBe(100)
    expect(spark.emberWisdom).toBe(100)
    expect(spark.qualityScore).toBe(100)
  })

  it('classifies condition from qualityScore', () => {
    const spark = analyzeTwilightSpark(richContent, 'app.ts')
    expect(spark.condition).toBe(classifyTwilightCondition(spark.qualityScore))
  })

  it('handles empty content', () => {
    const spark = analyzeTwilightSpark('', 'empty.ts')
    expect(spark.qualityScore).toBeLessThan(50)
  })

  it('scores poor content low', () => {
    const spark = analyzeTwilightSpark(poorContent, 'poor.ts')
    expect(spark.qualityScore).toBeLessThan(60)
  })
})

// ─── analyzeTwilightHearth ──────────────────────────────

describe('analyzeTwilightHearth', () => {
  it('returns empty hearth for no sparks', () => {
    const hearth = analyzeTwilightHearth([], 'src')
    expect(hearth.sparks).toHaveLength(0)
    expect(hearth.hearthType).toBe('no-hearth')
    expect(hearth.condition).toBe('void')
    expect(hearth.avgGrace).toBe(0)
  })

  it('computes averages from sparks', () => {
    const sparks = [makeSpark('a.ts', 80, 70, 60, 50, 40)]
    const hearth = analyzeTwilightHearth(sparks, 'src')
    expect(hearth.avgGrace).toBe(80)
    expect(hearth.avgResilience).toBe(70)
    expect(hearth.avgWisdom).toBe(40)
  })

  it('counts twilight masterpieces', () => {
    const sparks = [makeSpark('a.ts', 95, 95, 95, 95, 95), makeSpark('b.ts', 50, 50, 50, 50, 50)]
    const hearth = analyzeTwilightHearth(sparks, 'src')
    expect(hearth.twilightMasterpieceCount).toBe(1)
  })

  it('counts void sparks', () => {
    const sparks = [makeSpark('a.ts', 10, 10, 10, 10, 10)]
    const hearth = analyzeTwilightHearth(sparks, 'src')
    expect(hearth.voidCount).toBe(1)
  })

  it('classifies hearth type from sparks', () => {
    const sparks = [makeSpark('a.ts', 90, 90, 90, 90, 90)]
    const hearth = analyzeTwilightHearth(sparks, 'src')
    expect(hearth.hearthType).toBe('grand-forge')
  })
})

// ─── buildTwilightForgeResult ───────────────────────────

describe('buildTwilightForgeResult', () => {
  it('returns result with empty files', async () => {
    const result = await buildTwilightForgeResult([], [])
    expect(result.sparks).toHaveLength(0)
    expect(result.hearths).toHaveLength(0)
    expect(result.evening.overallLuminosity).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns result with single file', async () => {
    const result = await buildTwilightForgeResult(['app.ts'], [richContent])
    expect(result.sparks).toHaveLength(1)
    expect(result.sparks[0].file).toBe('app.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files into hearths by directory', async () => {
    const result = await buildTwilightForgeResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, moderateContent],
    )
    expect(result.hearths).toHaveLength(2)
    expect(result.stats.totalHearths).toBe(2)
  })

  it('computes overall luminosity as average', async () => {
    const result = await buildTwilightForgeResult(['a.ts'], [richContent])
    expect(result.evening.overallLuminosity).toBe(100)
  })

  it('computes evening.isTwilight when luminosity >= 60', async () => {
    const result = await buildTwilightForgeResult(['a.ts'], [richContent])
    expect(result.evening.isTwilight).toBe(true)
  })

  it('computes evening.isTwilight false when luminosity < 60', async () => {
    const result = await buildTwilightForgeResult(['a.ts'], [emptyContent])
    expect(result.evening.isTwilight).toBe(false)
  })

  it('finds best spark', async () => {
    const result = await buildTwilightForgeResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.bestSpark).toBe('a.ts')
  })

  it('finds most graceful file', async () => {
    const result = await buildTwilightForgeResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.mostGraceful).toBe('a.ts')
  })

  it('finds most resilient file', async () => {
    const result = await buildTwilightForgeResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.mostResilient).toBe('a.ts')
  })

  it('finds most revealing file', async () => {
    const result = await buildTwilightForgeResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.mostRevealing).toBe('a.ts')
  })

  it('finds best forged file', async () => {
    const result = await buildTwilightForgeResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.bestForged).toBe('a.ts')
  })

  it('finds wisest file', async () => {
    const result = await buildTwilightForgeResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.wisest).toBe('a.ts')
  })

  it('handles options parameter', async () => {
    const result = await buildTwilightForgeResult(['a.ts'], [richContent], {})
    expect(result.sparks).toHaveLength(1)
  })

  it('returns default strings for empty input', async () => {
    const result = await buildTwilightForgeResult([], [])
    expect(result.stats.bestSpark).toBe('')
    expect(result.stats.mostGraceful).toBe('')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all scores >= 90', () => {
    const stats = makeStats({
      avgTransitionGrace: 90, avgDuskResilience: 90, avgStarEmergence: 90, avgForgeTwilight: 90, avgEmberWisdom: 90,
    })
    const recs = generateRecommendations([], [], { avgGrace: 90, avgResilience: 90, avgWisdom: 90, isTwilight: true, overallLuminosity: 90 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends smoothing transitions when low', () => {
    const stats = makeStats({ avgTransitionGrace: 50 })
    const recs = generateRecommendations([], [], { avgGrace: 50, avgResilience: 80, avgWisdom: 80, isTwilight: true, overallLuminosity: 80 }, stats)
    expect(recs.some((r) => r.includes('transitions'))).toBe(true)
  })

  it('recommends strengthening resilience when low', () => {
    const stats = makeStats({ avgDuskResilience: 50 })
    const recs = generateRecommendations([], [], { avgGrace: 80, avgResilience: 50, avgWisdom: 80, isTwilight: true, overallLuminosity: 80 }, stats)
    expect(recs.some((r) => r.includes('resilience'))).toBe(true)
  })

  it('recommends revealing quality when low', () => {
    const stats = makeStats({ avgStarEmergence: 50 })
    const recs = generateRecommendations([], [], { avgGrace: 80, avgResilience: 80, avgWisdom: 80, isTwilight: true, overallLuminosity: 80 }, stats)
    expect(recs.some((r) => r.includes('quality'))).toBe(true)
  })

  it('recommends forging discipline when low', () => {
    const stats = makeStats({ avgForgeTwilight: 50 })
    const recs = generateRecommendations([], [], { avgGrace: 80, avgResilience: 80, avgWisdom: 80, isTwilight: true, overallLuminosity: 80 }, stats)
    expect(recs.some((r) => r.includes('discipline'))).toBe(true)
  })

  it('recommends gathering wisdom when low', () => {
    const stats = makeStats({ avgEmberWisdom: 50 })
    const recs = generateRecommendations([], [], { avgGrace: 80, avgResilience: 80, avgWisdom: 50, isTwilight: true, overallLuminosity: 80 }, stats)
    expect(recs.some((r) => r.includes('ember wisdom'))).toBe(true)
  })

  it('recommends darkness when luminosity < 40', () => {
    const stats = makeStats({ overallLuminosity: 30 })
    const recs = generateRecommendations([], [], { avgGrace: 80, avgResilience: 80, avgWisdom: 80, isTwilight: false, overallLuminosity: 30 }, stats)
    expect(recs.some((r) => r.includes('gone dark'))).toBe(true)
  })

  it('lists void sparks by name when <= 5', () => {
    const sparks = [makeSpark('a.ts', 10, 10, 10, 10, 10)]
    const stats = makeStats({ overallLuminosity: 30, voidCount: 1 })
    const recs = generateRecommendations(sparks, [], { avgGrace: 30, avgResilience: 30, avgWisdom: 30, isTwilight: false, overallLuminosity: 30 }, stats)
    expect(recs.some((r) => r.includes('a.ts'))).toBe(true)
  })

  it('summarizes void sparks when > 5', () => {
    const sparks = Array.from({ length: 6 }, (_, i) => makeSpark(`${i}.ts`, 10, 10, 10, 10, 10))
    const stats = makeStats({ overallLuminosity: 10, voidCount: 6 })
    const recs = generateRecommendations(sparks, [], { avgGrace: 10, avgResilience: 10, avgWisdom: 10, isTwilight: false, overallLuminosity: 10 }, stats)
    expect(recs.some((r) => r.includes('6 dead sparks'))).toBe(true)
  })

  it('recommends complete restoration when all hearths poor', () => {
    const hearths: TwilightHearth[] = [{ directory: 'src', sparks: [], avgGrace: 0, avgResilience: 0, avgWisdom: 0, twilightMasterpieceCount: 0, voidCount: 0, hearthType: 'no-hearth' as HearthType, condition: 'void' as HearthCondition }]
    const stats = makeStats({ overallLuminosity: 10 })
    const recs = generateRecommendations([], hearths, { avgGrace: 10, avgResilience: 10, avgWisdom: 10, isTwilight: false, overallLuminosity: 10 }, stats)
    expect(recs.some((r) => r.includes('complete restoration'))).toBe(true)
  })

  it('returns positive recommendation when all is well', () => {
    const stats = makeStats({ avgTransitionGrace: 80, avgDuskResilience: 80, avgStarEmergence: 80, avgForgeTwilight: 80, avgEmberWisdom: 80, overallLuminosity: 80 })
    const recs = generateRecommendations([], [], { avgGrace: 80, avgResilience: 80, avgWisdom: 80, isTwilight: true, overallLuminosity: 80 }, stats)
    expect(recs.some((r) => r.includes('burns steady'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('colorHearthCondition returns string', () => {
    expect(typeof colorHearthCondition('twilight-sanctuary')).toBe('string')
    expect(typeof colorHearthCondition('void')).toBe('string')
    expect(typeof colorHearthCondition('unknown')).toBe('string')
  })

  it('formatSparkTable returns string', () => {
    const spark = analyzeTwilightSpark(richContent, 'app.ts')
    expect(typeof formatSparkTable(spark)).toBe('string')
  })

  it('formatSparksTable handles empty', () => {
    expect(formatSparksTable([])).toContain('No twilight sparks')
  })

  it('formatSparksTable formats sparks', () => {
    const sparks = [analyzeTwilightSpark(richContent, 'app.ts')]
    expect(formatSparksTable(sparks)).toContain('app.ts')
  })

  it('formatHearthTable returns string', () => {
    const hearth = analyzeTwilightHearth([makeSpark('a.ts', 80, 80, 80, 80, 80)], 'src')
    expect(typeof formatHearthTable(hearth)).toBe('string')
  })

  it('formatHearthsTable handles empty', () => {
    expect(formatHearthsTable([])).toContain('No twilight hearths')
  })

  it('formatHearthsTable formats hearths', () => {
    const hearths = [analyzeTwilightHearth([makeSpark('a.ts', 80, 80, 80, 80, 80)], 'src')]
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
    const result = await buildTwilightForgeResult(['a.ts'], [richContent])
    expect(typeof formatResultTable(result)).toBe('string')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildTwilightForgeResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })
})

// ─── Type exports ───────────────────────────────────────

describe('type exports', () => {
  it('TwilightCondition has expected values', () => {
    const conditions: TwilightCondition[] = ['twilight-masterpiece', 'golden-hour-perfection', 'proper-dusk', 'fading-light', 'pitch-dark', 'void']
    expect(conditions).toHaveLength(6)
  })

  it('HearthType has expected values', () => {
    const types: HearthType[] = ['grand-forge', 'twilight-hearth', 'proper-firepit', 'single-candle', 'no-flame', 'no-hearth']
    expect(types).toHaveLength(6)
  })

  it('HearthCondition has expected values', () => {
    const conditions: HearthCondition[] = ['twilight-sanctuary', 'ember-hall', 'proper-workshop', 'dark-corner', 'void-space', 'void']
    expect(conditions).toHaveLength(6)
  })

  it('SmithGrade has expected values', () => {
    const grades: SmithGrade[] = ['twilight-master', 'dusk-forger', 'proper-smith', 'apprentice', 'novice', 'night-blind']
    expect(grades).toHaveLength(6)
  })
})
