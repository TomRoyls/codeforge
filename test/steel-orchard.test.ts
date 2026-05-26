import { describe, expect, it } from 'vitest'

import {
  type BlossomCondition as BlossomConditionType,
  type BlacksmithGrade as BlacksmithGradeType,
  type FloweringMeasure,
  type ForgingMeasure,
  type GrowingMeasure,
  type GroveCondition as GroveConditionType,
  type GroveType as GroveTypeType,
  type IronBlossom as IronBlossomType,
  type IronGrove as IronGroveType,
  type IronOrchardResult,
  type ResistingMeasure,
  type RootingMeasure,
  analyzeIronBlossom,
  analyzeIronGrove,
  buildIronOrchardResult,
  classifyBlossomCondition,
  classifyBlacksmithGrade,
  classifyGroveCondition,
  classifyGroveType,
  generateRecommendations,
  measureFlowering,
  measureForging,
  measureGrowing,
  measureResisting,
  measureRooting,
} from '../src/commands/steel-orchard-helpers.js'

import {
  colorGroveCondition,
  colorScore,
  formatBlossomsTable,
  formatBlossomTable,
  formatGrovesTable,
  formatGroveTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/steel-orchard-format-helpers.js'

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

function makeBlossom(
  file: string,
  strength: number,
  resistance: number,
  precision: number,
  depth: number,
  vitality: number,
): IronBlossomType {
  const qualityScore = Math.round(strength * 0.2 + resistance * 0.2 + precision * 0.2 + depth * 0.2 + vitality * 0.2)
  return {
    file,
    strengthThroughNature: strength,
    rustResistance: resistance,
    bloomPrecision: precision,
    rootDepth: depth,
    forgeVitality: vitality,
    growing: { strength, vitality: 'ancient-ironwood', hasHighStrength: strength >= 60, hasWellStructured: true, hasNoChaotic: true, hasModular: true, hasNoMonolithic: true, hasOrganized: true, hasProductive: true, hasIntentional: true, hasCrafted: true, hasShaped: true, hasDisciplined: true, hasFocused: true, hasPurposeful: true, hasStrong: true, hasResilient: true, hasVigorous: true, chaoticCount: 0, monolithicCount: 0 } as GrowingMeasure,
    resisting: { resistance, shield: 'stainless-steel', hasHighResistance: resistance >= 60, hasStable: true, hasNoVolatile: true, hasConsistent: true, hasTested: true, hasNoUntested: true, hasTypeSafe: true, hasNoUnsafe: true, hasMaintained: true, hasEnduring: true, hasPreserved: true, hasProtected: true, hasHardened: true, hasFortified: true, hasDurable: true, hasTimeless: true, volatileCount: 0, untestedCount: 0 } as ResistingMeasure,
    flowering: { precision, blossom: 'cherry-precision', hasHighPrecision: precision >= 60, hasAccurate: true, hasNoApproximate: true, hasTypeSafe: true, hasExact: true, hasClean: true, hasPrecise: true, hasCorrect: true, hasFaithful: true, hasTimely: true, hasMeasured: true, hasCalculated: true, hasDisciplined: true, hasControlled: true, hasDeliberate: true, hasSurgical: true, approximateCount: 0, unsafeCount: 0 } as FloweringMeasure,
    rooting: { depth, root: 'deep-taproot', hasHighDepth: depth >= 60, hasConnected: true, hasNoIsolated: true, hasExported: true, hasNoHidden: true, hasDocumented: true, hasInterfaced: true, hasAbstracted: true, hasGrounded: true, hasNetworked: true, hasIntegrated: true, hasLinked: true, hasInterwoven: true, hasFoundational: true, hasSolid: true, hasDeep: true, isolatedCount: 0, hiddenCount: 0 } as RootingMeasure,
    forging: { vitality, fire: 'white-hot-forge', hasHighVitality: vitality >= 60, hasCreative: true, hasNoStagnant: true, hasEvolving: true, hasNoStatic: true, hasPrincipled: true, hasNoHacked: true, hasInnovative: true, hasAdaptive: true, hasEnergetic: true, hasDynamic: true, hasAlive: true, hasThriving: true, hasGrowing: true, hasVibrant: true, hasPulsing: true, stagnantCount: 0, hackedCount: 0 } as ForgingMeasure,
    condition: classifyBlossomCondition(qualityScore),
    qualityScore,
  }
}

function makeStats(overrides: Partial<IronOrchardResult['stats']> = {}): IronOrchardResult['stats'] {
  return {
    totalFiles: 1,
    totalGroves: 1,
    avgStrengthThroughNature: 80,
    avgRustResistance: 80,
    avgBloomPrecision: 80,
    avgRootDepth: 80,
    avgForgeVitality: 80,
    ironMasterpieceCount: 0,
    steelBlossomCount: 1,
    properAlloyCount: 0,
    rustedBranchCount: 0,
    deadStumpCount: 0,
    voidCount: 0,
    hasHighStrengthCount: 1,
    hasHighResistanceCount: 1,
    hasHighPrecisionCount: 1,
    hasHighDepthCount: 1,
    hasHighVitalityCount: 1,
    overallYield: 80,
    blacksmithGrade: 'iron-forger' as BlacksmithGradeType,
    bestBlossom: 'app.ts',
    strongest: 'app.ts',
    mostResistant: 'app.ts',
    mostPrecise: 'app.ts',
    deepest: 'app.ts',
    mostVital: 'app.ts',
    ...overrides,
  }
}

// ─── measureGrowing ─────────────────────────────────────

describe('measureGrowing', () => {
  it('scores rich content at max', () => {
    const result = measureGrowing(richContent)
    expect(result.strength).toBe(100)
    expect(result.hasHighStrength).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureGrowing(emptyContent).strength).toBeLessThan(50)
  })

  it('detects chaotic patterns', () => {
    const result = measureGrowing('chaotic messy disorganized tangled code')
    expect(result.chaoticCount).toBeGreaterThan(0)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects monolithic patterns', () => {
    const result = measureGrowing('monolithic god.object mega code')
    expect(result.monolithicCount).toBeGreaterThan(0)
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('detects well-structured', () => { expect(measureGrowing('class Foo {}').hasWellStructured).toBe(true) })
  it('detects modular import/export', () => { expect(measureGrowing('import { X } from "y"').hasModular).toBe(true) })
  it('penalizes var/eval', () => { expect(measureGrowing('var x = eval("1")').hasDisciplined).toBe(false) })
  it('penalizes any keyword', () => { expect(measureGrowing('const x: any').hasCrafted).toBe(false) })
  it('detects vigorous docs', () => { expect(measureGrowing('/** doc */').hasVigorous).toBe(true) })
})

// ─── measureResisting ───────────────────────────────────

describe('measureResisting', () => {
  it('scores rich content at max', () => {
    const result = measureResisting(richContent)
    expect(result.resistance).toBe(100)
    expect(result.hasHighResistance).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureResisting(emptyContent).resistance).toBeLessThan(50)
  })

  it('detects volatile patterns', () => {
    const result = measureResisting('volatile unstable flaky erratic code')
    expect(result.volatileCount).toBeGreaterThan(0)
    expect(result.hasNoVolatile).toBe(false)
  })

  it('detects untested eval/Function', () => {
    const result = measureResisting('eval("code")')
    expect(result.untestedCount).toBeGreaterThan(0)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects stable const/readonly', () => { expect(measureResisting('const x = 1').hasStable).toBe(true) })
  it('penalizes any keyword', () => { expect(measureResisting('const x: any').hasTypeSafe).toBe(false) })
  it('detects tested try/catch', () => { expect(measureResisting('try { x } catch { y }').hasTested).toBe(true) })
  it('detects timeless docs', () => { expect(measureResisting('/** doc */').hasTimeless).toBe(true) })
})

// ─── measureFlowering ───────────────────────────────────

describe('measureFlowering', () => {
  it('scores rich content at max', () => {
    const result = measureFlowering(richContent)
    expect(result.precision).toBe(100)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureFlowering(emptyContent).precision).toBeLessThan(50)
  })

  it('detects approximate patterns', () => {
    const result = measureFlowering('approximate rough vague fuzzy code')
    expect(result.approximateCount).toBeGreaterThan(0)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects unsafe patterns', () => {
    const result = measureFlowering('unsafe risky hazardous code')
    expect(result.unsafeCount).toBeGreaterThan(0)
  })

  it('detects accurate types', () => { expect(measureFlowering('const x: string').hasAccurate).toBe(true) })
  it('penalizes any keyword', () => { expect(measureFlowering('const x: any').hasTypeSafe).toBe(false) })
  it('penalizes var/eval', () => { expect(measureFlowering('var x = eval("1")').hasClean).toBe(false) })
  it('detects controlled try/catch', () => { expect(measureFlowering('try { x } catch { y }').hasControlled).toBe(true) })
})

// ─── measureRooting ─────────────────────────────────────

describe('measureRooting', () => {
  it('scores rich content high', () => {
    const result = measureRooting(richContent)
    expect(result.depth).toBeGreaterThan(90)
    expect(result.hasHighDepth).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureRooting(emptyContent).depth).toBeLessThan(50)
  })

  it('detects isolated patterns', () => {
    const result = measureRooting('isolated standalone disconnected orphan code')
    expect(result.isolatedCount).toBeGreaterThan(0)
    expect(result.hasNoIsolated).toBe(false)
  })

  it('detects hidden patterns', () => {
    const result = measureRooting('hidden private-field obscured concealed code')
    expect(result.hiddenCount).toBeGreaterThan(0)
    expect(result.hasNoHidden).toBe(false)
  })

  it('detects connected import/export', () => { expect(measureRooting('import { X } from "y"').hasConnected).toBe(true) })
  it('detects documented', () => { expect(measureRooting('/** doc */').hasDocumented).toBe(true) })
  it('penalizes any keyword', () => { expect(measureRooting('const x: any').hasInterwoven).toBe(false) })
})

// ─── measureForging ─────────────────────────────────────

describe('measureForging', () => {
  it('scores rich content at max', () => {
    const result = measureForging(richContent)
    expect(result.vitality).toBe(100)
    expect(result.hasHighVitality).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureForging(emptyContent).vitality).toBeLessThan(50)
  })

  it('detects stagnant patterns', () => {
    const result = measureForging('stagnant static rigid frozen dead code')
    expect(result.stagnantCount).toBeGreaterThan(0)
    expect(result.hasNoStagnant).toBe(false)
  })

  it('detects hacked patterns', () => {
    const result = measureForging('hack workaround kludge code')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects creative class/interface', () => { expect(measureForging('class Foo {}').hasCreative).toBe(true) })
  it('penalizes any keyword', () => { expect(measureForging('const x: any').hasPrincipled).toBe(false) })
  it('detects innovative docs', () => { expect(measureForging('/** doc */').hasInnovative).toBe(true) })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyBlossomCondition', () => {
  it('returns iron-masterpiece for 90+', () => { expect(classifyBlossomCondition(95)).toBe('iron-masterpiece') })
  it('returns steel-blossom for 75-89', () => { expect(classifyBlossomCondition(80)).toBe('steel-blossom') })
  it('returns proper-alloy for 60-74', () => { expect(classifyBlossomCondition(65)).toBe('proper-alloy') })
  it('returns rusted-branch for 40-59', () => { expect(classifyBlossomCondition(50)).toBe('rusted-branch') })
  it('returns dead-stump for 20-39', () => { expect(classifyBlossomCondition(30)).toBe('dead-stump') })
  it('returns void below 20', () => { expect(classifyBlossomCondition(10)).toBe('void') })
})

describe('classifyGroveType', () => {
  it('returns void for empty', () => { expect(classifyGroveType([])).toBe('void') })
  it('returns ancient-grove for high', () => { expect(classifyGroveType([makeBlossom('a.ts', 90, 90, 90, 90, 90)])).toBe('ancient-grove') })
  it('returns iron-orchard for medium-high', () => { expect(classifyGroveType([makeBlossom('a.ts', 75, 75, 75, 75, 75)])).toBe('iron-orchard') })
  it('returns proper-plantation for medium', () => { expect(classifyGroveType([makeBlossom('a.ts', 60, 60, 60, 60, 60)])).toBe('proper-plantation') })
  it('returns small-garden for low', () => { expect(classifyGroveType([makeBlossom('a.ts', 40, 40, 40, 40, 40)])).toBe('small-garden') })
  it('returns barren-field for very low', () => { expect(classifyGroveType([makeBlossom('a.ts', 20, 20, 20, 20, 20)])).toBe('barren-field') })
})

describe('classifyGroveCondition', () => {
  it('returns steel-forest for 85+', () => { expect(classifyGroveCondition(90)).toBe('steel-forest') })
  it('returns iron-vineyard for 70-84', () => { expect(classifyGroveCondition(75)).toBe('iron-vineyard') })
  it('returns proper-orchard for 55-69', () => { expect(classifyGroveCondition(60)).toBe('proper-orchard') })
  it('returns weed-patch for 35-54', () => { expect(classifyGroveCondition(40)).toBe('weed-patch') })
  it('returns desert for 15-34', () => { expect(classifyGroveCondition(20)).toBe('desert') })
  it('returns void below 15', () => { expect(classifyGroveCondition(5)).toBe('void') })
})

describe('classifyBlacksmithGrade', () => {
  it('returns master-blacksmith for 80+', () => { expect(classifyBlacksmithGrade(85)).toBe('master-blacksmith') })
  it('returns iron-forger for 65-79', () => { expect(classifyBlacksmithGrade(70)).toBe('iron-forger') })
  it('returns proper-smith for 50-64', () => { expect(classifyBlacksmithGrade(55)).toBe('proper-smith') })
  it('returns apprentice for 35-49', () => { expect(classifyBlacksmithGrade(40)).toBe('apprentice') })
  it('returns novice for 20-34', () => { expect(classifyBlacksmithGrade(25)).toBe('novice') })
  it('returns bellows-boy below 20', () => { expect(classifyBlacksmithGrade(10)).toBe('bellows-boy') })
})

// ─── analyzeIronBlossom ─────────────────────────────────

describe('analyzeIronBlossom', () => {
  it('returns full IronBlossom for rich content', () => {
    const result = analyzeIronBlossom(richContent, 'app.ts')
    expect(result.file).toBe('app.ts')
    expect(result.strengthThroughNature).toBeGreaterThan(0)
    expect(result.rustResistance).toBeGreaterThan(0)
    expect(result.bloomPrecision).toBeGreaterThan(0)
    expect(result.rootDepth).toBeGreaterThan(0)
    expect(result.forgeVitality).toBeGreaterThan(0)
    expect(result.qualityScore).toBeGreaterThan(0)
    expect(result.condition).toBeDefined()
  })

  it('scores poor content low', () => {
    expect(analyzeIronBlossom(poorContent, 'bad.ts').qualityScore).toBeLessThan(50)
  })

  it('computes qualityScore as 0.2 weighted', () => {
    const result = analyzeIronBlossom(richContent, 'test.ts')
    const expected = Math.round(
      result.strengthThroughNature * 0.2 + result.rustResistance * 0.2 +
      result.bloomPrecision * 0.2 + result.rootDepth * 0.2 + result.forgeVitality * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })
})

// ─── analyzeIronGrove ───────────────────────────────────

describe('analyzeIronGrove', () => {
  it('returns empty grove for no blossoms', () => {
    const result = analyzeIronGrove([], 'src')
    expect(result.directory).toBe('src')
    expect(result.blossoms).toHaveLength(0)
    expect(result.groveType).toBe('void')
    expect(result.condition).toBe('void')
  })

  it('aggregates blossom scores', () => {
    const blossoms = [makeBlossom('a.ts', 80, 80, 80, 80, 80), makeBlossom('b.ts', 60, 60, 60, 60, 60)]
    const result = analyzeIronGrove(blossoms, 'src')
    expect(result.avgStrength).toBe(70)
    expect(result.avgPrecision).toBe(70)
    expect(result.avgVitality).toBe(70)
  })

  it('counts masterpiece and void', () => {
    const masterpiece = makeBlossom('a.ts', 95, 95, 95, 95, 95)
    const voidB = makeBlossom('b.ts', 5, 5, 5, 5, 5)
    const result = analyzeIronGrove([masterpiece, voidB], 'src')
    expect(result.ironMasterpieceCount).toBe(1)
    expect(result.voidCount).toBe(1)
  })
})

// ─── buildIronOrchardResult ─────────────────────────────

describe('buildIronOrchardResult', () => {
  it('returns valid result for single file', async () => {
    const result = await buildIronOrchardResult(['app.ts'], [richContent])
    expect(result.blossoms).toHaveLength(1)
    expect(result.groves).toHaveLength(1)
    expect(result.harvest.overallYield).toBeGreaterThan(0)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('returns zero averages for empty input', async () => {
    const result = await buildIronOrchardResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallYield).toBe(0)
    expect(result.harvest.isIron).toBe(false)
  })

  it('groups files by directory', async () => {
    const result = await buildIronOrchardResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, moderateContent],
    )
    expect(result.groves.length).toBe(2)
    expect(result.stats.totalGroves).toBe(2)
  })

  it('computes blacksmith grade', async () => {
    const result = await buildIronOrchardResult(['a.ts'], [richContent])
    expect(result.stats.blacksmithGrade).toBeDefined()
    expect(result.harvest.isIron).toBe(result.harvest.overallYield >= 60)
  })

  it('finds extremes', async () => {
    const result = await buildIronOrchardResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.bestBlossom).toBeTruthy()
    expect(result.stats.strongest).toBeTruthy()
    expect(result.stats.mostResistant).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.deepest).toBeTruthy()
    expect(result.stats.mostVital).toBeTruthy()
  })

  it('scores rich content at max', async () => {
    const result = await buildIronOrchardResult(['perfect.ts'], [richContent])
    expect(result.blossoms[0].strengthThroughNature).toBe(100)
    expect(result.blossoms[0].rustResistance).toBe(100)
    expect(result.blossoms[0].bloomPrecision).toBe(100)
    expect(result.blossoms[0].rootDepth).toBeGreaterThan(90)
    expect(result.blossoms[0].forgeVitality).toBe(100)
    expect(result.blossoms[0].qualityScore).toBeGreaterThan(95)
  })

  it('handles mixed content', async () => {
    const result = await buildIronOrchardResult(['good.ts', 'bad.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.blossoms).toHaveLength(2)
  })

  it('counts condition categories', async () => {
    const result = await buildIronOrchardResult(['perfect.ts'], [richContent])
    expect(result.stats.ironMasterpieceCount).toBe(1)
    expect(result.stats.voidCount).toBe(0)
  })

  it('counts high measure counts', async () => {
    const result = await buildIronOrchardResult(['perfect.ts'], [richContent])
    expect(result.stats.hasHighStrengthCount).toBe(1)
    expect(result.stats.hasHighResistanceCount).toBe(1)
    expect(result.stats.hasHighPrecisionCount).toBe(1)
    expect(result.stats.hasHighDepthCount).toBe(1)
    expect(result.stats.hasHighVitalityCount).toBe(1)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece when all >= 90', () => {
    const blossoms = [makeBlossom('a.ts', 95, 95, 95, 95, 95)]
    const stats = makeStats({ avgStrengthThroughNature: 95, avgRustResistance: 95, avgBloomPrecision: 95, avgRootDepth: 95, avgForgeVitality: 95, overallYield: 95 })
    const recs = generateRecommendations(blossoms, [], { avgStrength: 95, avgPrecision: 95, avgVitality: 95, isIron: true, overallYield: 95 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends strength when strength low', () => {
    const blossoms = [makeBlossom('a.ts', 50, 90, 90, 90, 90)]
    const stats = makeStats({ avgStrengthThroughNature: 50, avgRustResistance: 90, avgBloomPrecision: 90, avgRootDepth: 90, avgForgeVitality: 90, overallYield: 82 })
    const recs = generateRecommendations(blossoms, [], { avgStrength: 50, avgPrecision: 90, avgVitality: 90, isIron: true, overallYield: 82 }, stats)
    expect(recs.some((r) => r.includes('ironwood'))).toBe(true)
  })

  it('recommends resistance when low', () => {
    const blossoms = [makeBlossom('a.ts', 90, 50, 90, 90, 90)]
    const stats = makeStats({ avgStrengthThroughNature: 90, avgRustResistance: 50, avgBloomPrecision: 90, avgRootDepth: 90, avgForgeVitality: 90, overallYield: 82 })
    const recs = generateRecommendations(blossoms, [], { avgStrength: 90, avgPrecision: 90, avgVitality: 90, isIron: true, overallYield: 82 }, stats)
    expect(recs.some((r) => r.includes('rust resistance'))).toBe(true)
  })

  it('recommends precision when low', () => {
    const blossoms = [makeBlossom('a.ts', 90, 90, 50, 90, 90)]
    const stats = makeStats({ avgStrengthThroughNature: 90, avgRustResistance: 90, avgBloomPrecision: 50, avgRootDepth: 90, avgForgeVitality: 90, overallYield: 82 })
    const recs = generateRecommendations(blossoms, [], { avgStrength: 90, avgPrecision: 50, avgVitality: 90, isIron: true, overallYield: 82 }, stats)
    expect(recs.some((r) => r.includes('bloom precision'))).toBe(true)
  })

  it('recommends depth when low', () => {
    const blossoms = [makeBlossom('a.ts', 90, 90, 90, 50, 90)]
    const stats = makeStats({ avgStrengthThroughNature: 90, avgRustResistance: 90, avgBloomPrecision: 90, avgRootDepth: 50, avgForgeVitality: 90, overallYield: 82 })
    const recs = generateRecommendations(blossoms, [], { avgStrength: 90, avgPrecision: 90, avgVitality: 90, isIron: true, overallYield: 82 }, stats)
    expect(recs.some((r) => r.includes('root system'))).toBe(true)
  })

  it('recommends vitality when low', () => {
    const blossoms = [makeBlossom('a.ts', 90, 90, 90, 90, 50)]
    const stats = makeStats({ avgStrengthThroughNature: 90, avgRustResistance: 90, avgBloomPrecision: 90, avgRootDepth: 90, avgForgeVitality: 50, overallYield: 82 })
    const recs = generateRecommendations(blossoms, [], { avgStrength: 90, avgPrecision: 90, avgVitality: 50, isIron: true, overallYield: 82 }, stats)
    expect(recs.some((r) => r.includes('forge vitality'))).toBe(true)
  })

  it('warns about withered when overall < 40', () => {
    const blossoms = [makeBlossom('a.ts', 30, 30, 30, 30, 30)]
    const stats = makeStats({ avgStrengthThroughNature: 30, avgRustResistance: 30, avgBloomPrecision: 30, avgRootDepth: 30, avgForgeVitality: 30, overallYield: 30 })
    const recs = generateRecommendations(blossoms, [], { avgStrength: 30, avgPrecision: 30, avgVitality: 30, isIron: false, overallYield: 30 }, stats)
    expect(recs.some((r) => r.includes('withered'))).toBe(true)
  })

  it('lists void blossoms when <= 5', () => {
    const blossoms = [makeBlossom('a.ts', 5, 5, 5, 5, 5), makeBlossom('b.ts', 90, 90, 90, 90, 90)]
    const stats = makeStats({ overallYield: 47 })
    const recs = generateRecommendations(blossoms, [], { avgStrength: 47, avgPrecision: 47, avgVitality: 47, isIron: false, overallYield: 47 }, stats)
    expect(recs.some((r) => r.includes('a.ts'))).toBe(true)
  })

  it('warns about many dead stumps', () => {
    const blossoms = Array.from({ length: 6 }, (_, i) => makeBlossom(`${i}.ts`, 5, 5, 5, 5, 5))
    const stats = makeStats({ overallYield: 5, voidCount: 6 })
    const recs = generateRecommendations(blossoms, [], { avgStrength: 5, avgPrecision: 5, avgVitality: 5, isIron: false, overallYield: 5 }, stats)
    expect(recs.some((r) => r.includes('6 dead stumps'))).toBe(true)
  })

  it('warns about all desert groves', () => {
    const blossoms = [makeBlossom('a.ts', 5, 5, 5, 5, 5)]
    const groves = [{ directory: 'src', blossoms, avgStrength: 5, avgPrecision: 5, avgVitality: 5, ironMasterpieceCount: 0, voidCount: 1, groveType: 'barren-field' as GroveTypeType, condition: 'void' as GroveConditionType }]
    const stats = makeStats({ overallYield: 5 })
    const recs = generateRecommendations(blossoms, groves, { avgStrength: 5, avgPrecision: 5, avgVitality: 5, isIron: false, overallYield: 5 }, stats)
    expect(recs.some((r) => r.includes('All groves have turned to desert'))).toBe(true)
  })

  it('returns positive when scores are good', () => {
    const blossoms = [makeBlossom('a.ts', 80, 80, 80, 80, 80)]
    const stats = makeStats({ overallYield: 80 })
    const recs = generateRecommendations(blossoms, [], { avgStrength: 80, avgPrecision: 80, avgVitality: 80, isIron: true, overallYield: 80 }, stats)
    expect(recs.some((r) => r.includes('thrives beautifully'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for high score', () => { expect(typeof colorScore(95)).toBe('string') })
  it('returns string for low score', () => { expect(typeof colorScore(5)).toBe('string') })
  it('returns string for mid score', () => { expect(typeof colorScore(50)).toBe('string') })
})

describe('colorGroveCondition', () => {
  it('colors steel-forest', () => { expect(typeof colorGroveCondition('steel-forest')).toBe('string') })
  it('colors void', () => { expect(typeof colorGroveCondition('void')).toBe('string') })
  it('colors unknown', () => { expect(typeof colorGroveCondition('unknown')).toBe('string') })
})

describe('formatBlossomTable', () => {
  it('formats single blossom', () => {
    const blossom = makeBlossom('app.ts', 80, 80, 80, 80, 80)
    const result = formatBlossomTable(blossom)
    expect(result).toContain('Iron Blossom: app.ts')
    expect(result).toContain('Strength Through Nature')
    expect(result).toContain('Quality Score')
  })
})

describe('formatBlossomsTable', () => {
  it('returns no-blossoms message for empty', () => { expect(formatBlossomsTable([])).toContain('No iron blossoms') })
  it('formats multiple blossoms', () => {
    const blossoms = [makeBlossom('a.ts', 80, 80, 80, 80, 80), makeBlossom('b.ts', 60, 60, 60, 60, 60)]
    const result = formatBlossomsTable(blossoms)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatGroveTable', () => {
  it('formats single grove', () => {
    const grove: IronGroveType = { directory: 'src', blossoms: [], avgStrength: 80, avgPrecision: 80, avgVitality: 80, ironMasterpieceCount: 1, voidCount: 0, groveType: 'ancient-grove', condition: 'steel-forest' }
    const result = formatGroveTable(grove)
    expect(result).toContain('Iron Grove: src')
    expect(result).toContain('Masterpieces')
  })
})

describe('formatGrovesTable', () => {
  it('returns no-groves for empty', () => { expect(formatGrovesTable([])).toContain('No iron groves') })
  it('formats multiple groves', () => {
    const groves = [
      { directory: 'src', blossoms: [], avgStrength: 80, avgPrecision: 80, avgVitality: 80, ironMasterpieceCount: 0, voidCount: 0, groveType: 'iron-orchard' as GroveTypeType, condition: 'iron-vineyard' as GroveConditionType },
      { directory: 'lib', blossoms: [], avgStrength: 50, avgPrecision: 50, avgVitality: 50, ironMasterpieceCount: 0, voidCount: 0, groveType: 'proper-plantation' as GroveTypeType, condition: 'proper-orchard' as GroveConditionType },
    ]
    const result = formatGrovesTable(groves)
    expect(result).toContain('src')
    expect(result).toContain('lib')
  })
})

describe('formatStatsTable', () => {
  it('formats all stats', () => {
    const stats = makeStats()
    const result = formatStatsTable(stats)
    expect(result).toContain('Iron Orchard Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Blacksmith Grade')
    expect(result).toContain('Best Blossom')
  })
})

describe('formatRecommendations', () => {
  it('returns no-recs for empty', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recommendations', () => {
    expect(formatRecommendations(['Fix X', 'Improve Y'])).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildIronOrchardResult(['app.ts'], [richContent])
    const table = formatResultTable(result)
    expect(table).toContain('Iron Orchard Analysis')
    expect(table).toContain('Harvest Overview')
    expect(table).toContain('Iron Orchard Statistics')
    expect(table).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildIronOrchardResult(['app.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.blossoms).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
