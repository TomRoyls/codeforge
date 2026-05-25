import { describe, expect, it } from 'vitest'

import {
  type BedCondition,
  type BedType,
  type BotanistGrade,
  type DiversifyingMeasure,
  type GroundingMeasure,
  type NeonBed,
  type NeonBloom,
  type NeonCondition,
  type NeonGardenResult,
  type RadiatingMeasure,
  type SteadyMeasure,
  type ThrivingMeasure,
  analyzeNeonBed,
  analyzeNeonBloom,
  buildNeonGardenResult,
  classifyBedCondition,
  classifyBedType,
  classifyBotanistGrade,
  classifyNeonCondition,
  generateRecommendations,
  measureDiversifying,
  measureGrounding,
  measureRadiating,
  measureSteady,
  measureThriving,
} from '../src/commands/neon-grove-helpers.js'

import {
  colorBedCondition,
  colorScore,
  formatBedTable,
  formatBedsTable,
  formatBloomTable,
  formatBloomsTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/neon-grove-format-helpers.js'

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

function makeBloom(
  file: string,
  luminosity: number,
  vibrancy: number,
  consistency: number,
  diversity: number,
  brightness: number,
): NeonBloom {
  const qualityScore = Math.round(luminosity * 0.2 + vibrancy * 0.2 + consistency * 0.2 + diversity * 0.2 + brightness * 0.2)
  return {
    file,
    luminosityQuality: luminosity,
    structureVibrancy: vibrancy,
    glowConsistency: consistency,
    bloomDiversity: diversity,
    rootBrightness: brightness,
    radiating: { luminosity, glow: 'solar-flare', hasHighLuminosity: luminosity >= 60, hasReadable: true, hasNoCryptic: true, hasVisible: true, hasNoHidden: true, hasDocumented: true, hasExpressive: true, hasClear: true, hasIlluminated: true, hasSelfDocumenting: true, hasRevealed: true, hasOpen: true, hasDirect: true, hasBright: true, hasRadiant: true, hasLuminous: true, crypticCount: 0, hiddenCount: 0 } as RadiatingMeasure,
    thriving: { vibrancy, vitality: 'bursting-life', hasHighVibrancy: vibrancy >= 60, hasWellStructured: true, hasNoChaotic: true, hasModular: true, hasNoMonolithic: true, hasAlive: true, hasDynamic: true, hasEvolving: true, hasGrowing: true, hasThriving: true, hasActive: true, hasEnergetic: true, hasVibrant: true, hasRobust: true, hasVigorous: true, hasFlourishing: true, chaoticCount: 0, monolithicCount: 0 } as ThrivingMeasure,
    steady: { consistency, pulse: 'steady-beam', hasHighConsistency: consistency >= 60, hasStable: true, hasNoVolatile: true, hasConsistent: true, hasNoErratic: true, hasTested: true, hasNoUntested: true, hasReliable: true, hasPredictable: true, hasDependable: true, hasUniform: true, hasSteady: true, hasConstant: true, hasRhythmic: true, hasHarmonious: true, hasTrustworthy: true, volatileCount: 0, untestedCount: 0 } as SteadyMeasure,
    diversifying: { diversity, variety: 'kaleidoscope', hasHighDiversity: diversity >= 60, hasVersatile: true, hasMultiPurpose: true, hasAdaptable: true, hasFlexible: true, hasRich: true, hasVaried: true, hasDiverse: true, hasMultiFaceted: true, hasComprehensive: true, hasBroad: true, hasWide: true, hasColorful: true, hasLayered: true, hasComplex: true, hasEclectic: true, rigidCount: 0, narrowCount: 0 } as DiversifyingMeasure,
    grounding: { brightness, root: 'glowing-taproot', hasHighBrightness: brightness >= 60, hasWellArchitected: true, hasNoHacked: true, hasPrincipled: true, hasDeep: true, hasProven: true, hasConnected: true, hasIntegrated: true, hasNetworked: true, hasFoundational: true, hasGrounded: true, hasSolid: true, hasStableBase: true, hasEnduring: true, hasInterlinked: true, hasDeeplyRooted: true, hackedCount: 0, isolatedCount: 0 } as GroundingMeasure,
    condition: classifyNeonCondition(qualityScore),
    qualityScore,
  }
}

function makeStats(overrides: Partial<NeonGardenResult['stats']> = {}): NeonGardenResult['stats'] {
  return {
    totalFiles: 1,
    totalBeds: 1,
    avgLuminosityQuality: 80,
    avgStructureVibrancy: 80,
    avgGlowConsistency: 80,
    avgBloomDiversity: 80,
    avgRootBrightness: 80,
    neonMasterpieceCount: 0,
    bioluminescentPerfectionCount: 1,
    properGlowCount: 0,
    dimLightCount: 0,
    darkCornerCount: 0,
    voidCount: 0,
    hasHighLuminosityCount: 1,
    hasHighVibrancyCount: 1,
    hasHighConsistencyCount: 1,
    hasHighDiversityCount: 1,
    hasHighBrightnessCount: 1,
    overallRadiance: 80,
    botanistGrade: 'neon-gardener' as BotanistGrade,
    bestBloom: 'app.ts',
    mostLuminous: 'app.ts',
    mostVibrant: 'app.ts',
    mostConsistent: 'app.ts',
    mostDiverse: 'app.ts',
    brightest: 'app.ts',
    ...overrides,
  }
}

// ─── measureRadiating ───────────────────────────────────

describe('measureRadiating', () => {
  it('scores rich content highly', () => {
    const result = measureRadiating(richContent)
    expect(result.luminosity).toBeGreaterThan(60)
    expect(result.hasHighLuminosity).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureRadiating(emptyContent)
    expect(result.luminosity).toBeLessThan(50)
  })

  it('detects cryptic patterns', () => {
    const result = measureRadiating('cryptic obfuscated minified code')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects hidden patterns', () => {
    const result = measureRadiating('hidden obscure concealed')
    expect(result.hiddenCount).toBeGreaterThan(0)
    expect(result.hasNoHidden).toBe(false)
  })

  it('detects readable patterns', () => {
    const result = measureRadiating('class Foo {}')
    expect(result.hasReadable).toBe(true)
  })

  it('detects visible types', () => {
    const result = measureRadiating('const x: string = "ok"')
    expect(result.hasVisible).toBe(true)
  })

  it('detects documented code', () => {
    const result = measureRadiating('/** doc */')
    expect(result.hasDocumented).toBe(true)
  })

  it('detects clear code (no any)', () => {
    const result = measureRadiating('const x: string = "ok"')
    expect(result.hasClear).toBe(true)
  })

  it('penalizes any usage', () => {
    const result = measureRadiating('const x: any = 1')
    expect(result.hasClear).toBe(false)
  })

  it('detects illuminated async', () => {
    const result = measureRadiating('async function foo() { await bar() }')
    expect(result.hasIlluminated).toBe(true)
  })

  it('detects open imports', () => {
    const result = measureRadiating('import { X } from "y"')
    expect(result.hasOpen).toBe(true)
  })

  it('detects direct function/return', () => {
    const result = measureRadiating('function foo() { return 1 }')
    expect(result.hasDirect).toBe(true)
  })

  it('detects bright visibility', () => {
    const result = measureRadiating('private x: string')
    expect(result.hasBright).toBe(true)
  })

  it('returns glow classification', () => {
    const result = measureRadiating(richContent)
    expect(result.glow).toBeDefined()
  })

  it('detects luminous readonly/as-const', () => {
    const result = measureRadiating('readonly x: string')
    expect(result.hasLuminous).toBe(true)
  })
})

// ─── measureThriving ────────────────────────────────────

describe('measureThriving', () => {
  it('scores rich content highly', () => {
    const result = measureThriving(richContent)
    expect(result.vibrancy).toBeGreaterThan(60)
    expect(result.hasHighVibrancy).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureThriving(emptyContent)
    expect(result.vibrancy).toBeLessThan(50)
  })

  it('detects chaotic var/eval', () => {
    const result = measureThriving('var x = eval("1")')
    expect(result.chaoticCount).toBeGreaterThan(0)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects monolithic patterns', () => {
    const result = measureThriving('monolithic god.object mega code')
    expect(result.monolithicCount).toBeGreaterThan(0)
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('detects well-structured code', () => {
    const result = measureThriving('class Foo {}')
    expect(result.hasWellStructured).toBe(true)
  })

  it('detects modular imports', () => {
    const result = measureThriving('import { X } from "y"')
    expect(result.hasModular).toBe(true)
  })

  it('detects alive async', () => {
    const result = measureThriving('async function foo() { await bar() }')
    expect(result.hasAlive).toBe(true)
  })

  it('detects dynamic function/return', () => {
    const result = measureThriving('function foo() { return 1 }')
    expect(result.hasDynamic).toBe(true)
  })

  it('detects growing types', () => {
    const result = measureThriving('const x: string = "ok"')
    expect(result.hasGrowing).toBe(true)
  })

  it('detects thriving code (no any)', () => {
    const result = measureThriving('const x: string = "ok"')
    expect(result.hasThriving).toBe(true)
  })

  it('detects active documentation', () => {
    const result = measureThriving('/** doc */')
    expect(result.hasActive).toBe(true)
  })

  it('detects energetic try/catch', () => {
    const result = measureThriving('try { x } catch { y }')
    expect(result.hasEnergetic).toBe(true)
  })

  it('detects vibrant const/readonly', () => {
    const result = measureThriving('const x = 1')
    expect(result.hasVibrant).toBe(true)
  })

  it('returns vitality classification', () => {
    const result = measureThriving(richContent)
    expect(result.vitality).toBeDefined()
  })

  it('detects vigorous throw/return', () => {
    const result = measureThriving('throw new Error("x")')
    expect(result.hasVigorous).toBe(true)
  })
})

// ─── measureSteady ──────────────────────────────────────

describe('measureSteady', () => {
  it('scores rich content highly', () => {
    const result = measureSteady(richContent)
    expect(result.consistency).toBeGreaterThan(60)
    expect(result.hasHighConsistency).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureSteady(emptyContent)
    expect(result.consistency).toBeLessThan(50)
  })

  it('detects volatile patterns', () => {
    const result = measureSteady('volatile unstable fragile code')
    expect(result.volatileCount).toBeGreaterThan(0)
    expect(result.hasNoVolatile).toBe(false)
  })

  it('detects untested eval/Function', () => {
    const result = measureSteady('eval("1") new Function("x")')
    expect(result.untestedCount).toBeGreaterThan(0)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects stable const/readonly', () => {
    const result = measureSteady('const x = 1')
    expect(result.hasStable).toBe(true)
  })

  it('detects tested try/catch/if', () => {
    const result = measureSteady('try { x } catch { y }')
    expect(result.hasTested).toBe(true)
  })

  it('detects consistent types', () => {
    const result = measureSteady('const x: string = "ok"')
    expect(result.hasConsistent).toBe(true)
  })

  it('detects reliable code (no any)', () => {
    const result = measureSteady('const x: string = "ok"')
    expect(result.hasReliable).toBe(true)
  })

  it('detects predictable visibility', () => {
    const result = measureSteady('private x: string')
    expect(result.hasPredictable).toBe(true)
  })

  it('detects dependable imports', () => {
    const result = measureSteady('import { X } from "y"')
    expect(result.hasDependable).toBe(true)
  })

  it('detects uniform class/interface', () => {
    const result = measureSteady('class Foo {}')
    expect(result.hasUniform).toBe(true)
  })

  it('detects steady async', () => {
    const result = measureSteady('async function foo() { await bar() }')
    expect(result.hasSteady).toBe(true)
  })

  it('returns pulse classification', () => {
    const result = measureSteady(richContent)
    expect(result.pulse).toBeDefined()
  })

  it('detects rhythmic (no monolithic)', () => {
    const result = measureSteady('clean code')
    expect(result.hasRhythmic).toBe(true)
  })

  it('detects constant documentation', () => {
    const result = measureSteady('/** doc */')
    expect(result.hasConstant).toBe(true)
  })
})

// ─── measureDiversifying ────────────────────────────────

describe('measureDiversifying', () => {
  it('scores rich content highly', () => {
    const result = measureDiversifying(richContent)
    expect(result.diversity).toBeGreaterThan(60)
    expect(result.hasHighDiversity).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureDiversifying(emptyContent)
    expect(result.diversity).toBeLessThan(50)
  })

  it('detects rigid patterns', () => {
    const result = measureDiversifying('rigid inflexible hardcoded code')
    expect(result.rigidCount).toBeGreaterThan(0)
  })

  it('detects narrow patterns', () => {
    const result = measureDiversifying('narrow limited restricted code')
    expect(result.narrowCount).toBeGreaterThan(0)
  })

  it('detects versatile class/interface', () => {
    const result = measureDiversifying('class Foo {}')
    expect(result.hasVersatile).toBe(true)
  })

  it('detects multi-purpose imports', () => {
    const result = measureDiversifying('import { X } from "y"')
    expect(result.hasMultiPurpose).toBe(true)
  })

  it('detects adaptable types', () => {
    const result = measureDiversifying('const x: string = "ok"')
    expect(result.hasAdaptable).toBe(true)
  })

  it('detects flexible code (no any)', () => {
    const result = measureDiversifying('const x: string = "ok"')
    expect(result.hasFlexible).toBe(true)
  })

  it('detects rich documentation', () => {
    const result = measureDiversifying('/** doc */')
    expect(result.hasRich).toBe(true)
  })

  it('detects varied visibility', () => {
    const result = measureDiversifying('private x: string')
    expect(result.hasVaried).toBe(true)
  })

  it('detects diverse async', () => {
    const result = measureDiversifying('async function foo() { await bar() }')
    expect(result.hasDiverse).toBe(true)
  })

  it('detects multi-faceted function/return', () => {
    const result = measureDiversifying('function foo() { return 1 }')
    expect(result.hasMultiFaceted).toBe(true)
  })

  it('returns variety classification', () => {
    const result = measureDiversifying(richContent)
    expect(result.variety).toBeDefined()
  })

  it('detects eclectic readonly/as-const', () => {
    const result = measureDiversifying('readonly x: string')
    expect(result.hasEclectic).toBe(true)
  })

  it('detects colorful (no var/eval)', () => {
    const result = measureDiversifying('clean code')
    expect(result.hasColorful).toBe(true)
  })
})

// ─── measureGrounding ───────────────────────────────────

describe('measureGrounding', () => {
  it('scores rich content highly', () => {
    const result = measureGrounding(richContent)
    expect(result.brightness).toBeGreaterThan(60)
    expect(result.hasHighBrightness).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureGrounding(emptyContent)
    expect(result.brightness).toBeLessThan(50)
  })

  it('detects hacked patterns', () => {
    const result = measureGrounding('hack workaround kludge code')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects isolated patterns', () => {
    const result = measureGrounding('isolated disconnected orphan code')
    expect(result.isolatedCount).toBeGreaterThan(0)
  })

  it('detects well-architected code', () => {
    const result = measureGrounding('class Foo {}')
    expect(result.hasWellArchitected).toBe(true)
  })

  it('detects principled code (no any)', () => {
    const result = measureGrounding('const x: string = "ok"')
    expect(result.hasPrincipled).toBe(true)
  })

  it('detects deep types', () => {
    const result = measureGrounding('const x: string = "ok"')
    expect(result.hasDeep).toBe(true)
  })

  it('detects proven try/catch', () => {
    const result = measureGrounding('try { x } catch { y }')
    expect(result.hasProven).toBe(true)
  })

  it('detects connected imports', () => {
    const result = measureGrounding('import { X } from "y"')
    expect(result.hasConnected).toBe(true)
  })

  it('detects integrated visibility', () => {
    const result = measureGrounding('private x: string')
    expect(result.hasIntegrated).toBe(true)
  })

  it('detects networked async', () => {
    const result = measureGrounding('async function foo() { await bar() }')
    expect(result.hasNetworked).toBe(true)
  })

  it('detects foundational documentation', () => {
    const result = measureGrounding('/** doc */')
    expect(result.hasFoundational).toBe(true)
  })

  it('detects grounded const/readonly', () => {
    const result = measureGrounding('const x = 1')
    expect(result.hasGrounded).toBe(true)
  })

  it('returns root classification', () => {
    const result = measureGrounding(richContent)
    expect(result.root).toBeDefined()
  })

  it('detects deeply rooted (no isolated)', () => {
    const result = measureGrounding('clean code')
    expect(result.hasDeeplyRooted).toBe(true)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyNeonCondition', () => {
  it('classifies neon-masterpiece at 90+', () => {
    expect(classifyNeonCondition(90)).toBe('neon-masterpiece')
    expect(classifyNeonCondition(100)).toBe('neon-masterpiece')
  })

  it('classifies bioluminescent-perfection at 75-89', () => {
    expect(classifyNeonCondition(75)).toBe('bioluminescent-perfection')
    expect(classifyNeonCondition(89)).toBe('bioluminescent-perfection')
  })

  it('classifies proper-glow at 60-74', () => {
    expect(classifyNeonCondition(60)).toBe('proper-glow')
    expect(classifyNeonCondition(74)).toBe('proper-glow')
  })

  it('classifies dim-light at 40-59', () => {
    expect(classifyNeonCondition(40)).toBe('dim-light')
    expect(classifyNeonCondition(59)).toBe('dim-light')
  })

  it('classifies dark-corner at 20-39', () => {
    expect(classifyNeonCondition(20)).toBe('dark-corner')
    expect(classifyNeonCondition(39)).toBe('dark-corner')
  })

  it('classifies void below 20', () => {
    expect(classifyNeonCondition(0)).toBe('void')
    expect(classifyNeonCondition(19)).toBe('void')
  })
})

describe('classifyBedType', () => {
  it('returns no-bed for empty array', () => {
    expect(classifyBedType([])).toBe('no-bed')
  })

  it('returns grand-conservatory for avg >= 85', () => {
    const blooms = [makeBloom('a.ts', 90, 90, 90, 90, 90)]
    expect(classifyBedType(blooms)).toBe('grand-conservatory')
  })

  it('returns neon-parterre for avg 70-84', () => {
    const blooms = [makeBloom('a.ts', 75, 75, 75, 75, 75)]
    expect(classifyBedType(blooms)).toBe('neon-parterre')
  })

  it('returns proper-bed for avg 55-69', () => {
    const blooms = [makeBloom('a.ts', 60, 60, 60, 60, 60)]
    expect(classifyBedType(blooms)).toBe('proper-bed')
  })

  it('returns window-box for avg 35-54', () => {
    const blooms = [makeBloom('a.ts', 40, 40, 40, 40, 40)]
    expect(classifyBedType(blooms)).toBe('window-box')
  })

  it('returns barren-soil for avg < 35', () => {
    const blooms = [makeBloom('a.ts', 10, 10, 10, 10, 10)]
    expect(classifyBedType(blooms)).toBe('barren-soil')
  })
})

describe('classifyBedCondition', () => {
  it('classifies luminous-garden at 85+', () => {
    expect(classifyBedCondition(85)).toBe('luminous-garden')
    expect(classifyBedCondition(100)).toBe('luminous-garden')
  })

  it('classifies glowing-oasis at 70-84', () => {
    expect(classifyBedCondition(70)).toBe('glowing-oasis')
    expect(classifyBedCondition(84)).toBe('glowing-oasis')
  })

  it('classifies proper-plot at 55-69', () => {
    expect(classifyBedCondition(55)).toBe('proper-plot')
    expect(classifyBedCondition(69)).toBe('proper-plot')
  })

  it('classifies dim-corner at 35-54', () => {
    expect(classifyBedCondition(35)).toBe('dim-corner')
    expect(classifyBedCondition(54)).toBe('dim-corner')
  })

  it('classifies dark-void at 15-34', () => {
    expect(classifyBedCondition(15)).toBe('dark-void')
    expect(classifyBedCondition(34)).toBe('dark-void')
  })

  it('classifies void below 15', () => {
    expect(classifyBedCondition(0)).toBe('void')
    expect(classifyBedCondition(14)).toBe('void')
  })
})

describe('classifyBotanistGrade', () => {
  it('classifies master-botanist at 80+', () => {
    expect(classifyBotanistGrade(80)).toBe('master-botanist')
    expect(classifyBotanistGrade(100)).toBe('master-botanist')
  })

  it('classifies neon-gardener at 65-79', () => {
    expect(classifyBotanistGrade(65)).toBe('neon-gardener')
    expect(classifyBotanistGrade(79)).toBe('neon-gardener')
  })

  it('classifies proper-cultivator at 50-64', () => {
    expect(classifyBotanistGrade(50)).toBe('proper-cultivator')
    expect(classifyBotanistGrade(64)).toBe('proper-cultivator')
  })

  it('classifies apprentice at 35-49', () => {
    expect(classifyBotanistGrade(35)).toBe('apprentice')
    expect(classifyBotanistGrade(49)).toBe('apprentice')
  })

  it('classifies novice at 20-34', () => {
    expect(classifyBotanistGrade(20)).toBe('novice')
    expect(classifyBotanistGrade(34)).toBe('novice')
  })

  it('classifies weed-puller below 20', () => {
    expect(classifyBotanistGrade(0)).toBe('weed-puller')
    expect(classifyBotanistGrade(19)).toBe('weed-puller')
  })
})

// ─── analyzeNeonBloom ───────────────────────────────────

describe('analyzeNeonBloom', () => {
  it('returns a complete bloom', () => {
    const bloom = analyzeNeonBloom(richContent, 'app.ts')
    expect(bloom.file).toBe('app.ts')
    expect(bloom.qualityScore).toBeGreaterThan(0)
    expect(bloom.radiating).toBeDefined()
    expect(bloom.thriving).toBeDefined()
    expect(bloom.steady).toBeDefined()
    expect(bloom.diversifying).toBeDefined()
    expect(bloom.grounding).toBeDefined()
  })

  it('computes qualityScore as weighted average', () => {
    const bloom = analyzeNeonBloom(richContent, 'app.ts')
    const expected = Math.round(
      bloom.luminosityQuality * 0.2 +
      bloom.structureVibrancy * 0.2 +
      bloom.glowConsistency * 0.2 +
      bloom.bloomDiversity * 0.2 +
      bloom.rootBrightness * 0.2,
    )
    expect(bloom.qualityScore).toBe(expected)
  })

  it('scores rich content at max', () => {
    const bloom = analyzeNeonBloom(richContent, 'rich.ts')
    expect(bloom.luminosityQuality).toBe(100)
    expect(bloom.structureVibrancy).toBe(100)
    expect(bloom.glowConsistency).toBe(100)
    expect(bloom.bloomDiversity).toBe(100)
    expect(bloom.rootBrightness).toBe(100)
    expect(bloom.qualityScore).toBe(100)
  })

  it('classifies condition from qualityScore', () => {
    const bloom = analyzeNeonBloom(richContent, 'app.ts')
    expect(bloom.condition).toBe(classifyNeonCondition(bloom.qualityScore))
  })

  it('handles empty content', () => {
    const bloom = analyzeNeonBloom('', 'empty.ts')
    expect(bloom.qualityScore).toBeLessThan(50)
  })

  it('scores poor content low', () => {
    const bloom = analyzeNeonBloom(poorContent, 'poor.ts')
    expect(bloom.qualityScore).toBeLessThan(60)
  })
})

// ─── analyzeNeonBed ─────────────────────────────────────

describe('analyzeNeonBed', () => {
  it('returns empty bed for no blooms', () => {
    const bed = analyzeNeonBed([], 'src')
    expect(bed.blooms).toHaveLength(0)
    expect(bed.bedType).toBe('no-bed')
    expect(bed.condition).toBe('void')
    expect(bed.avgLuminosity).toBe(0)
  })

  it('computes averages from blooms', () => {
    const blooms = [makeBloom('a.ts', 80, 70, 60, 50, 40)]
    const bed = analyzeNeonBed(blooms, 'src')
    expect(bed.avgLuminosity).toBe(80)
    expect(bed.avgDiversity).toBe(50)
    expect(bed.avgBrightness).toBe(40)
  })

  it('counts neon masterpieces', () => {
    const blooms = [makeBloom('a.ts', 95, 95, 95, 95, 95), makeBloom('b.ts', 50, 50, 50, 50, 50)]
    const bed = analyzeNeonBed(blooms, 'src')
    expect(bed.neonMasterpieceCount).toBe(1)
  })

  it('counts void blooms', () => {
    const blooms = [makeBloom('a.ts', 10, 10, 10, 10, 10)]
    const bed = analyzeNeonBed(blooms, 'src')
    expect(bed.voidCount).toBe(1)
  })

  it('classifies bed type from blooms', () => {
    const blooms = [makeBloom('a.ts', 90, 90, 90, 90, 90)]
    const bed = analyzeNeonBed(blooms, 'src')
    expect(bed.bedType).toBe('grand-conservatory')
  })
})

// ─── buildNeonGardenResult ──────────────────────────────

describe('buildNeonGardenResult', () => {
  it('returns result with empty files', async () => {
    const result = await buildNeonGardenResult([], [])
    expect(result.blooms).toHaveLength(0)
    expect(result.beds).toHaveLength(0)
    expect(result.ecosystem.overallRadiance).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns result with single file', async () => {
    const result = await buildNeonGardenResult(['app.ts'], [richContent])
    expect(result.blooms).toHaveLength(1)
    expect(result.blooms[0].file).toBe('app.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files into beds by directory', async () => {
    const result = await buildNeonGardenResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, moderateContent],
    )
    expect(result.beds).toHaveLength(2)
    expect(result.stats.totalBeds).toBe(2)
  })

  it('computes overall radiance as average', async () => {
    const result = await buildNeonGardenResult(['a.ts'], [richContent])
    expect(result.ecosystem.overallRadiance).toBe(100)
  })

  it('computes ecosystem.isNeon when radiance >= 60', async () => {
    const result = await buildNeonGardenResult(['a.ts'], [richContent])
    expect(result.ecosystem.isNeon).toBe(true)
  })

  it('computes ecosystem.isNeon false when radiance < 60', async () => {
    const result = await buildNeonGardenResult(['a.ts'], [emptyContent])
    expect(result.ecosystem.isNeon).toBe(false)
  })

  it('computes stats correctly', async () => {
    const result = await buildNeonGardenResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.botanistGrade).toBeDefined()
  })

  it('finds best bloom', async () => {
    const result = await buildNeonGardenResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.bestBloom).toBe('a.ts')
  })

  it('finds most luminous file', async () => {
    const result = await buildNeonGardenResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.mostLuminous).toBe('a.ts')
  })

  it('finds most vibrant file', async () => {
    const result = await buildNeonGardenResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.mostVibrant).toBe('a.ts')
  })

  it('finds most consistent file', async () => {
    const result = await buildNeonGardenResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.mostConsistent).toBe('a.ts')
  })

  it('finds most diverse file', async () => {
    const result = await buildNeonGardenResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.mostDiverse).toBe('a.ts')
  })

  it('finds brightest file', async () => {
    const result = await buildNeonGardenResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.brightest).toBe('a.ts')
  })

  it('handles options parameter', async () => {
    const result = await buildNeonGardenResult(['a.ts'], [richContent], {})
    expect(result.blooms).toHaveLength(1)
  })

  it('returns default strings for empty input', async () => {
    const result = await buildNeonGardenResult([], [])
    expect(result.stats.bestBloom).toBe('')
    expect(result.stats.mostLuminous).toBe('')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all scores >= 90', () => {
    const stats = makeStats({
      avgLuminosityQuality: 90, avgStructureVibrancy: 90, avgGlowConsistency: 90, avgBloomDiversity: 90, avgRootBrightness: 90,
    })
    const recs = generateRecommendations([], [], { avgLuminosity: 90, avgDiversity: 90, avgBrightness: 90, isNeon: true, overallRadiance: 90 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends amplifying luminosity when low', () => {
    const stats = makeStats({ avgLuminosityQuality: 50 })
    const recs = generateRecommendations([], [], { avgLuminosity: 50, avgDiversity: 80, avgBrightness: 80, isNeon: true, overallRadiance: 80 }, stats)
    expect(recs.some((r) => r.includes('luminosity'))).toBe(true)
  })

  it('recommends revitalizing vibrancy when low', () => {
    const stats = makeStats({ avgStructureVibrancy: 50 })
    const recs = generateRecommendations([], [], { avgLuminosity: 80, avgDiversity: 80, avgBrightness: 80, isNeon: true, overallRadiance: 80 }, stats)
    expect(recs.some((r) => r.includes('vibrancy'))).toBe(true)
  })

  it('recommends steady consistency when low', () => {
    const stats = makeStats({ avgGlowConsistency: 50 })
    const recs = generateRecommendations([], [], { avgLuminosity: 80, avgDiversity: 80, avgBrightness: 80, isNeon: true, overallRadiance: 80 }, stats)
    expect(recs.some((r) => r.includes('consistency'))).toBe(true)
  })

  it('recommends enriching diversity when low', () => {
    const stats = makeStats({ avgBloomDiversity: 50 })
    const recs = generateRecommendations([], [], { avgLuminosity: 80, avgDiversity: 50, avgBrightness: 80, isNeon: true, overallRadiance: 80 }, stats)
    expect(recs.some((r) => r.includes('diversity'))).toBe(true)
  })

  it('recommends illuminating root brightness when low', () => {
    const stats = makeStats({ avgRootBrightness: 50 })
    const recs = generateRecommendations([], [], { avgLuminosity: 80, avgDiversity: 80, avgBrightness: 50, isNeon: true, overallRadiance: 80 }, stats)
    expect(recs.some((r) => r.includes('root brightness'))).toBe(true)
  })

  it('recommends darkness when radiance < 40', () => {
    const stats = makeStats({ overallRadiance: 30 })
    const recs = generateRecommendations([], [], { avgLuminosity: 80, avgDiversity: 80, avgBrightness: 80, isNeon: false, overallRadiance: 30 }, stats)
    expect(recs.some((r) => r.includes('gone dark'))).toBe(true)
  })

  it('lists void blooms by name when <= 5', () => {
    const blooms = [makeBloom('a.ts', 10, 10, 10, 10, 10)]
    const stats = makeStats({ overallRadiance: 30, voidCount: 1 })
    const recs = generateRecommendations(blooms, [], { avgLuminosity: 30, avgDiversity: 30, avgBrightness: 30, isNeon: false, overallRadiance: 30 }, stats)
    expect(recs.some((r) => r.includes('a.ts'))).toBe(true)
  })

  it('summarizes void blooms when > 5', () => {
    const blooms = Array.from({ length: 6 }, (_, i) => makeBloom(`${i}.ts`, 10, 10, 10, 10, 10))
    const stats = makeStats({ overallRadiance: 10, voidCount: 6 })
    const recs = generateRecommendations(blooms, [], { avgLuminosity: 10, avgDiversity: 10, avgBrightness: 10, isNeon: false, overallRadiance: 10 }, stats)
    expect(recs.some((r) => r.includes('6 dark patches'))).toBe(true)
  })

  it('recommends complete replanting when all beds are poor', () => {
    const beds: NeonBed[] = [{ directory: 'src', blooms: [], avgLuminosity: 0, avgDiversity: 0, avgBrightness: 0, neonMasterpieceCount: 0, voidCount: 0, bedType: 'no-bed' as BedType, condition: 'void' as BedCondition }]
    const stats = makeStats({ overallRadiance: 10 })
    const recs = generateRecommendations([], beds, { avgLuminosity: 10, avgDiversity: 10, avgBrightness: 10, isNeon: false, overallRadiance: 10 }, stats)
    expect(recs.some((r) => r.includes('complete replanting'))).toBe(true)
  })

  it('returns positive recommendation when all is well', () => {
    const stats = makeStats({ avgLuminosityQuality: 80, avgStructureVibrancy: 80, avgGlowConsistency: 80, avgBloomDiversity: 80, avgRootBrightness: 80, overallRadiance: 80 })
    const recs = generateRecommendations([], [], { avgLuminosity: 80, avgDiversity: 80, avgBrightness: 80, isNeon: true, overallRadiance: 80 }, stats)
    expect(recs.some((r) => r.includes('radiates beautifully'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('colorBedCondition returns string', () => {
    expect(typeof colorBedCondition('luminous-garden')).toBe('string')
    expect(typeof colorBedCondition('void')).toBe('string')
    expect(typeof colorBedCondition('unknown')).toBe('string')
  })

  it('formatBloomTable returns string', () => {
    const bloom = analyzeNeonBloom(richContent, 'app.ts')
    expect(typeof formatBloomTable(bloom)).toBe('string')
  })

  it('formatBloomsTable handles empty', () => {
    expect(formatBloomsTable([])).toContain('No neon blooms')
  })

  it('formatBloomsTable formats blooms', () => {
    const blooms = [analyzeNeonBloom(richContent, 'app.ts')]
    expect(formatBloomsTable(blooms)).toContain('app.ts')
  })

  it('formatBedTable returns string', () => {
    const bed = analyzeNeonBed([makeBloom('a.ts', 80, 80, 80, 80, 80)], 'src')
    expect(typeof formatBedTable(bed)).toBe('string')
  })

  it('formatBedsTable handles empty', () => {
    expect(formatBedsTable([])).toContain('No neon beds')
  })

  it('formatBedsTable formats beds', () => {
    const beds = [analyzeNeonBed([makeBloom('a.ts', 80, 80, 80, 80, 80)], 'src')]
    expect(formatBedsTable(beds)).toContain('src')
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
    const result = await buildNeonGardenResult(['a.ts'], [richContent])
    expect(typeof formatResultTable(result)).toBe('string')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildNeonGardenResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })
})

// ─── Type exports ───────────────────────────────────────

describe('type exports', () => {
  it('NeonCondition has expected values', () => {
    const conditions: NeonCondition[] = ['neon-masterpiece', 'bioluminescent-perfection', 'proper-glow', 'dim-light', 'dark-corner', 'void']
    expect(conditions).toHaveLength(6)
  })

  it('BedType has expected values', () => {
    const types: BedType[] = ['grand-conservatory', 'neon-parterre', 'proper-bed', 'window-box', 'barren-soil', 'no-bed']
    expect(types).toHaveLength(6)
  })

  it('BedCondition has expected values', () => {
    const conditions: BedCondition[] = ['luminous-garden', 'glowing-oasis', 'proper-plot', 'dim-corner', 'dark-void', 'void']
    expect(conditions).toHaveLength(6)
  })

  it('BotanistGrade has expected values', () => {
    const grades: BotanistGrade[] = ['master-botanist', 'neon-gardener', 'proper-cultivator', 'apprentice', 'novice', 'weed-puller']
    expect(grades).toHaveLength(6)
  })
})
