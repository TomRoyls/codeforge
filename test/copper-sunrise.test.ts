import { describe, expect, it } from 'vitest'

import {
  type AccumulatingMeasure,
  type ConductingMeasure,
  type CopperFoundry as CopperFoundryType,
  type CopperMorningResult,
  type CopperRay,
  type FoundryCondition,
  type FoundryType,
  type IlluminatingMeasure,
  type RadiatingMeasure,
  type SmithGrade,
  type UnfoldingMeasure,
  analyzeCopperFoundry,
  analyzeCopperRay,
  buildCopperMorningResult,
  classifyFoundryCondition,
  classifyFoundryType,
  classifyRayCondition,
  classifySmithGrade,
  generateRecommendations,
  measureAccumulating,
  measureConducting,
  measureIlluminating,
  measureRadiating,
  measureUnfolding,
} from '../src/commands/copper-sunrise-helpers.js'

import {
  colorFoundryCondition,
  colorScore,
  formatFoundriesTable,
  formatFoundryTable,
  formatRaysTable,
  formatRayTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/copper-sunrise-format-helpers.js'

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

function makeRay(
  file: string,
  warmth: number,
  patience: number,
  flow: number,
  clarity: number,
  wisdom: number,
): CopperRay {
  const qualityScore = Math.round(warmth * 0.2 + patience * 0.2 + flow * 0.2 + clarity * 0.2 + wisdom * 0.2)
  return {
    file,
    warmthRadiance: warmth,
    dawnPatience: patience,
    conductiveFlow: flow,
    forgeClarity: clarity,
    agedWisdom: wisdom,
    radiating: { warmth, radiance: 'golden-dawn', hasHighWarmth: warmth >= 60, hasApproachable: true, hasNoHostile: true, hasReadable: true, hasNoCryptic: true, hasInviting: true, hasWelcoming: true, hasErrorHandled: true, hasNoUnhandled: true, hasGentle: true, hasPatient: true, hasForgiving: true, hasKind: true, hasComfortable: true, hasWarm: true, hasGracious: true, hostileCount: 0, crypticCount: 0 } as RadiatingMeasure,
    unfolding: { patience, dawn: 'patient-sunrise', hasHighPatience: patience >= 60, hasWellStructured: true, hasNoChaotic: true, hasDocumented: true, hasNoUndocumented: true, hasTested: true, hasNoUntested: true, hasProven: true, hasMature: true, hasRefined: true, hasDeliberate: true, hasCareful: true, hasThorough: true, hasStable: true, hasConsistent: true, hasPatient: true, undocumentedCount: 0, untestedCount: 0 } as UnfoldingMeasure,
    conducting: { flow, conductor: 'superconductor', hasHighFlow: flow >= 60, hasEfficient: true, hasNoWasteful: true, hasDirect: true, hasClean: true, hasOptimized: true, hasTypeSafe: true, hasNoUnsafe: true, hasPrecise: true, hasFast: true, hasReliable: true, hasAccurate: true, hasLean: true, hasFocused: true, hasStreamlined: true, hasNoRedundant: true, wastefulCount: 0, unsafeCount: 0 } as ConductingMeasure,
    illuminating: { clarity, forge: 'golden-anvil', hasHighClarity: clarity >= 60, hasClear: true, hasNoObfuscated: true, hasSelfDocumenting: true, hasNoMystery: true, hasTransparent: true, hasVisible: true, hasDirect: true, hasOrganized: true, hasStructured: true, hasReadable: true, hasUnderstandable: true, hasOpen: true, hasRevealed: true, hasIlluminated: true, hasPurposeful: true, obfuscatedCount: 0, mysteryCount: 0 } as IlluminatingMeasure,
    accumulating: { wisdom, patina: 'ancient-green', hasHighWisdom: wisdom >= 60, hasWellArchitected: true, hasNoHacked: true, hasPrincipled: true, hasDeep: true, hasProven: true, hasMature: true, hasEvolved: true, hasExperienced: true, hasReflective: true, hasPatterned: true, hasStrategic: true, hasInsightful: true, hasWise: true, hasAccumulated: true, hasHistorical: true, hackedCount: 0, naiveCount: 0 } as AccumulatingMeasure,
    condition: classifyRayCondition(qualityScore),
    qualityScore,
  }
}

function makeStats(overrides: Partial<CopperMorningResult['stats']> = {}): CopperMorningResult['stats'] {
  return {
    totalFiles: 1,
    totalFoundries: 1,
    avgWarmthRadiance: 80,
    avgDawnPatience: 80,
    avgConductiveFlow: 80,
    avgForgeClarity: 80,
    avgAgedWisdom: 80,
    copperMasterpieceCount: 0,
    goldenMorningCount: 1,
    properAlloyCount: 0,
    tarnishedMetalCount: 0,
    rawOreCount: 0,
    voidCount: 0,
    hasHighWarmthCount: 1,
    hasHighPatienceCount: 1,
    hasHighFlowCount: 1,
    hasHighClarityCount: 1,
    hasHighWisdomCount: 1,
    overallRadiance: 80,
    smithGrade: 'copper-forger' as SmithGrade,
    bestRay: 'app.ts',
    warmest: 'app.ts',
    mostPatient: 'app.ts',
    mostConductive: 'app.ts',
    clearest: 'app.ts',
    wisest: 'app.ts',
    ...overrides,
  }
}

// ─── measureRadiating ───────────────────────────────────

describe('measureRadiating', () => {
  it('scores rich content at max', () => {
    const result = measureRadiating(richContent)
    expect(result.warmth).toBe(100)
    expect(result.hasHighWarmth).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureRadiating(emptyContent).warmth).toBeLessThan(50)
  })

  it('detects hostile patterns', () => {
    const result = measureRadiating('hostile aggressive dangerous violent code')
    expect(result.hostileCount).toBeGreaterThan(0)
    expect(result.hasNoHostile).toBe(false)
  })

  it('detects cryptic patterns', () => {
    const result = measureRadiating('cryptic obfuscated minified code')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects approachable class/interface', () => { expect(measureRadiating('class Foo {}').hasApproachable).toBe(true) })
  it('detects error handling', () => { expect(measureRadiating('try { x } catch { y }').hasErrorHandled).toBe(true) })
  it('penalizes var/eval', () => { expect(measureRadiating('var x = eval("1")').hasGentle).toBe(false) })
  it('penalizes any keyword', () => { expect(measureRadiating('const x: any').hasForgiving).toBe(false) })
})

// ─── measureUnfolding ───────────────────────────────────

describe('measureUnfolding', () => {
  it('scores rich content at max', () => {
    const result = measureUnfolding(richContent)
    expect(result.patience).toBe(100)
    expect(result.hasHighPatience).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureUnfolding(emptyContent).patience).toBeLessThan(50)
  })

  it('detects untested eval/Function', () => {
    const result = measureUnfolding('eval("code")')
    expect(result.untestedCount).toBeGreaterThan(0)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects documented code', () => { expect(measureUnfolding('/** doc */').hasDocumented).toBe(true) })
  it('detects well-structured', () => { expect(measureUnfolding('class Foo {}').hasWellStructured).toBe(true) })
  it('detects proven types', () => { expect(measureUnfolding('const x: string').hasProven).toBe(true) })
  it('penalizes any keyword', () => { expect(measureUnfolding('const x: any').hasRefined).toBe(false) })
})

// ─── measureConducting ──────────────────────────────────

describe('measureConducting', () => {
  it('scores rich content at max', () => {
    const result = measureConducting(richContent)
    expect(result.flow).toBe(100)
    expect(result.hasHighFlow).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureConducting(emptyContent).flow).toBeLessThan(50)
  })

  it('detects wasteful patterns', () => {
    const result = measureConducting('wasteful bloated redundant code')
    expect(result.wastefulCount).toBeGreaterThan(0)
    expect(result.hasNoWasteful).toBe(false)
  })

  it('detects unsafe patterns', () => {
    const result = measureConducting('const x: any = 1')
    expect(result.unsafeCount).toBeGreaterThan(0)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects type-safe annotations', () => { expect(measureConducting('const x: string').hasTypeSafe).toBe(true) })
  it('detects efficient const/readonly', () => { expect(measureConducting('const x = 1').hasEfficient).toBe(true) })
  it('penalizes any keyword', () => { expect(measureConducting('const x: any').hasPrecise).toBe(false) })
})

// ─── measureIlluminating ────────────────────────────────

describe('measureIlluminating', () => {
  it('scores rich content at max', () => {
    const result = measureIlluminating(richContent)
    expect(result.clarity).toBe(100)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureIlluminating(emptyContent).clarity).toBeLessThan(50)
  })

  it('detects obfuscated patterns', () => {
    const result = measureIlluminating('obfuscated minified cryptic code')
    expect(result.obfuscatedCount).toBeGreaterThan(0)
    expect(result.hasNoObfuscated).toBe(false)
  })

  it('detects mystery patterns (global/window/document)', () => {
    const result = measureIlluminating('window.document')
    expect(result.mysteryCount).toBeGreaterThan(0)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects self-documenting types', () => { expect(measureIlluminating('const x: string').hasSelfDocumenting).toBe(true) })
  it('detects transparent import/export', () => { expect(measureIlluminating('export {}').hasTransparent).toBe(true) })
})

// ─── measureAccumulating ────────────────────────────────

describe('measureAccumulating', () => {
  it('scores rich content at max', () => {
    const result = measureAccumulating(richContent)
    expect(result.wisdom).toBe(100)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureAccumulating(emptyContent).wisdom).toBeLessThan(50)
  })

  it('detects hacked patterns', () => {
    const result = measureAccumulating('hack workaround kludge code')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects naive patterns', () => {
    const result = measureAccumulating('naive simple basic trivial code')
    expect(result.naiveCount).toBeGreaterThan(0)
    expect(result.hasHistorical).toBe(false)
  })

  it('detects well-architected', () => { expect(measureAccumulating('class Foo {}').hasWellArchitected).toBe(true) })
  it('penalizes any keyword', () => { expect(measureAccumulating('const x: any').hasPrincipled).toBe(false) })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyRayCondition', () => {
  it('returns copper-masterpiece for 90+', () => { expect(classifyRayCondition(95)).toBe('copper-masterpiece') })
  it('returns golden-morning for 75-89', () => { expect(classifyRayCondition(80)).toBe('golden-morning') })
  it('returns proper-alloy for 60-74', () => { expect(classifyRayCondition(65)).toBe('proper-alloy') })
  it('returns tarnished-metal for 40-59', () => { expect(classifyRayCondition(50)).toBe('tarnished-metal') })
  it('returns raw-ore for 20-39', () => { expect(classifyRayCondition(30)).toBe('raw-ore') })
  it('returns void below 20', () => { expect(classifyRayCondition(10)).toBe('void') })
})

describe('classifyFoundryType', () => {
  it('returns no-foundry for empty', () => { expect(classifyFoundryType([])).toBe('no-foundry') })
  it('returns grand-foundry for high', () => { expect(classifyFoundryType([makeRay('a.ts', 90, 90, 90, 90, 90)])).toBe('grand-foundry') })
  it('returns copper-workshop for medium-high', () => { expect(classifyFoundryType([makeRay('a.ts', 75, 75, 75, 75, 75)])).toBe('copper-workshop') })
  it('returns proper-forge for medium', () => { expect(classifyFoundryType([makeRay('a.ts', 60, 60, 60, 60, 60)])).toBe('proper-forge') })
  it('returns backyard-anvil for low', () => { expect(classifyFoundryType([makeRay('a.ts', 40, 40, 40, 40, 40)])).toBe('backyard-anvil') })
  it('returns no-forge for very low', () => { expect(classifyFoundryType([makeRay('a.ts', 20, 20, 20, 20, 20)])).toBe('no-forge') })
})

describe('classifyFoundryCondition', () => {
  it('returns copper-hall for 85+', () => { expect(classifyFoundryCondition(90)).toBe('copper-hall') })
  it('returns warm-workshop for 70-84', () => { expect(classifyFoundryCondition(75)).toBe('warm-workshop') })
  it('returns proper-forge for 55-69', () => { expect(classifyFoundryCondition(60)).toBe('proper-forge') })
  it('returns cold-shed for 35-54', () => { expect(classifyFoundryCondition(40)).toBe('cold-shed') })
  it('returns ruins for 15-34', () => { expect(classifyFoundryCondition(20)).toBe('ruins') })
  it('returns void below 15', () => { expect(classifyFoundryCondition(5)).toBe('void') })
})

describe('classifySmithGrade', () => {
  it('returns master-smith for 80+', () => { expect(classifySmithGrade(85)).toBe('master-smith') })
  it('returns copper-forger for 65-79', () => { expect(classifySmithGrade(70)).toBe('copper-forger') })
  it('returns proper-craftsman for 50-64', () => { expect(classifySmithGrade(55)).toBe('proper-craftsman') })
  it('returns apprentice for 35-49', () => { expect(classifySmithGrade(40)).toBe('apprentice') })
  it('returns novice for 20-34', () => { expect(classifySmithGrade(25)).toBe('novice') })
  it('returns bellows-boy below 20', () => { expect(classifySmithGrade(10)).toBe('bellows-boy') })
})

// ─── analyzeCopperRay ───────────────────────────────────

describe('analyzeCopperRay', () => {
  it('returns full CopperRay for rich content', () => {
    const result = analyzeCopperRay(richContent, 'app.ts')
    expect(result.file).toBe('app.ts')
    expect(result.warmthRadiance).toBeGreaterThan(0)
    expect(result.dawnPatience).toBeGreaterThan(0)
    expect(result.conductiveFlow).toBeGreaterThan(0)
    expect(result.forgeClarity).toBeGreaterThan(0)
    expect(result.agedWisdom).toBeGreaterThan(0)
    expect(result.qualityScore).toBeGreaterThan(0)
    expect(result.condition).toBeDefined()
  })

  it('scores poor content low', () => {
    expect(analyzeCopperRay(poorContent, 'bad.ts').qualityScore).toBeLessThan(50)
  })

  it('computes qualityScore as 0.2 weighted', () => {
    const result = analyzeCopperRay(richContent, 'test.ts')
    const expected = Math.round(
      result.warmthRadiance * 0.2 + result.dawnPatience * 0.2 +
      result.conductiveFlow * 0.2 + result.forgeClarity * 0.2 + result.agedWisdom * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })
})

// ─── analyzeCopperFoundry ───────────────────────────────

describe('analyzeCopperFoundry', () => {
  it('returns empty foundry for no rays', () => {
    const result = analyzeCopperFoundry([], 'src')
    expect(result.directory).toBe('src')
    expect(result.rays).toHaveLength(0)
    expect(result.foundryType).toBe('no-foundry')
    expect(result.condition).toBe('void')
  })

  it('aggregates ray scores', () => {
    const rays = [makeRay('a.ts', 80, 80, 80, 80, 80), makeRay('b.ts', 60, 60, 60, 60, 60)]
    const result = analyzeCopperFoundry(rays, 'src')
    expect(result.avgWarmth).toBe(70)
    expect(result.avgFlow).toBe(70)
    expect(result.avgWisdom).toBe(70)
  })

  it('counts masterpiece and void', () => {
    const masterpiece = makeRay('a.ts', 95, 95, 95, 95, 95)
    const voidR = makeRay('b.ts', 5, 5, 5, 5, 5)
    const result = analyzeCopperFoundry([masterpiece, voidR], 'src')
    expect(result.copperMasterpieceCount).toBe(1)
    expect(result.voidCount).toBe(1)
  })
})

// ─── buildCopperMorningResult ───────────────────────────

describe('buildCopperMorningResult', () => {
  it('returns valid result for single file', async () => {
    const result = await buildCopperMorningResult(['app.ts'], [richContent])
    expect(result.rays).toHaveLength(1)
    expect(result.foundries).toHaveLength(1)
    expect(result.dawn.overallRadiance).toBeGreaterThan(0)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('returns zero averages for empty input', async () => {
    const result = await buildCopperMorningResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallRadiance).toBe(0)
    expect(result.dawn.isCopper).toBe(false)
  })

  it('groups files by directory', async () => {
    const result = await buildCopperMorningResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, moderateContent],
    )
    expect(result.foundries.length).toBe(2)
    expect(result.stats.totalFoundries).toBe(2)
  })

  it('computes smith grade', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [richContent])
    expect(result.stats.smithGrade).toBeDefined()
    expect(result.dawn.isCopper).toBe(result.dawn.overallRadiance >= 60)
  })

  it('finds extremes', async () => {
    const result = await buildCopperMorningResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.bestRay).toBeTruthy()
    expect(result.stats.warmest).toBeTruthy()
    expect(result.stats.mostPatient).toBeTruthy()
    expect(result.stats.mostConductive).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('scores rich content at max', async () => {
    const result = await buildCopperMorningResult(['perfect.ts'], [richContent])
    expect(result.rays[0].warmthRadiance).toBe(100)
    expect(result.rays[0].dawnPatience).toBe(100)
    expect(result.rays[0].conductiveFlow).toBe(100)
    expect(result.rays[0].forgeClarity).toBe(100)
    expect(result.rays[0].agedWisdom).toBe(100)
    expect(result.rays[0].qualityScore).toBe(100)
  })

  it('handles mixed content', async () => {
    const result = await buildCopperMorningResult(['good.ts', 'bad.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.rays).toHaveLength(2)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece when all >= 90', () => {
    const rays = [makeRay('a.ts', 95, 95, 95, 95, 95)]
    const stats = makeStats({ avgWarmthRadiance: 95, avgDawnPatience: 95, avgConductiveFlow: 95, avgForgeClarity: 95, avgAgedWisdom: 95, overallRadiance: 95 })
    const recs = generateRecommendations(rays, [], { avgWarmth: 95, avgFlow: 95, avgWisdom: 95, isCopper: true, overallRadiance: 95 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends warming when warmth low', () => {
    const rays = [makeRay('a.ts', 50, 90, 90, 90, 90)]
    const stats = makeStats({ avgWarmthRadiance: 50, avgDawnPatience: 90, avgConductiveFlow: 90, avgForgeClarity: 90, avgAgedWisdom: 90, overallRadiance: 82 })
    const recs = generateRecommendations(rays, [], { avgWarmth: 50, avgFlow: 90, avgWisdom: 90, isCopper: true, overallRadiance: 82 }, stats)
    expect(recs.some((r) => r.includes('copper surface'))).toBe(true)
  })

  it('recommends patience when low', () => {
    const rays = [makeRay('a.ts', 90, 50, 90, 90, 90)]
    const stats = makeStats({ avgWarmthRadiance: 90, avgDawnPatience: 50, avgConductiveFlow: 90, avgForgeClarity: 90, avgAgedWisdom: 90, overallRadiance: 82 })
    const recs = generateRecommendations(rays, [], { avgWarmth: 90, avgFlow: 90, avgWisdom: 90, isCopper: true, overallRadiance: 82 }, stats)
    expect(recs.some((r) => r.includes('dawn unfold'))).toBe(true)
  })

  it('recommends flow when low', () => {
    const rays = [makeRay('a.ts', 90, 90, 50, 90, 90)]
    const stats = makeStats({ avgWarmthRadiance: 90, avgDawnPatience: 90, avgConductiveFlow: 50, avgForgeClarity: 90, avgAgedWisdom: 90, overallRadiance: 82 })
    const recs = generateRecommendations(rays, [], { avgWarmth: 90, avgFlow: 50, avgWisdom: 90, isCopper: true, overallRadiance: 82 }, stats)
    expect(recs.some((r) => r.includes('conductive flow'))).toBe(true)
  })

  it('recommends clarity when low', () => {
    const rays = [makeRay('a.ts', 90, 90, 90, 50, 90)]
    const stats = makeStats({ avgWarmthRadiance: 90, avgDawnPatience: 90, avgConductiveFlow: 90, avgForgeClarity: 50, avgAgedWisdom: 90, overallRadiance: 82 })
    const recs = generateRecommendations(rays, [], { avgWarmth: 90, avgFlow: 90, avgWisdom: 90, isCopper: true, overallRadiance: 82 }, stats)
    expect(recs.some((r) => r.includes('forge smoke'))).toBe(true)
  })

  it('recommends wisdom when low', () => {
    const rays = [makeRay('a.ts', 90, 90, 90, 90, 50)]
    const stats = makeStats({ avgWarmthRadiance: 90, avgDawnPatience: 90, avgConductiveFlow: 90, avgForgeClarity: 90, avgAgedWisdom: 50, overallRadiance: 82 })
    const recs = generateRecommendations(rays, [], { avgWarmth: 90, avgFlow: 90, avgWisdom: 50, isCopper: true, overallRadiance: 82 }, stats)
    expect(recs.some((r) => r.includes('patina deepen'))).toBe(true)
  })

  it('warns about darkness when overall < 40', () => {
    const rays = [makeRay('a.ts', 30, 30, 30, 30, 30)]
    const stats = makeStats({ avgWarmthRadiance: 30, avgDawnPatience: 30, avgConductiveFlow: 30, avgForgeClarity: 30, avgAgedWisdom: 30, overallRadiance: 30 })
    const recs = generateRecommendations(rays, [], { avgWarmth: 30, avgFlow: 30, avgWisdom: 30, isCopper: false, overallRadiance: 30 }, stats)
    expect(recs.some((r) => r.includes('faded to darkness'))).toBe(true)
  })

  it('lists void rays when <= 5', () => {
    const rays = [makeRay('a.ts', 5, 5, 5, 5, 5), makeRay('b.ts', 90, 90, 90, 90, 90)]
    const stats = makeStats({ overallRadiance: 47 })
    const recs = generateRecommendations(rays, [], { avgWarmth: 47, avgFlow: 47, avgWisdom: 47, isCopper: false, overallRadiance: 47 }, stats)
    expect(recs.some((r) => r.includes('a.ts'))).toBe(true)
  })

  it('warns about many void rays', () => {
    const rays = Array.from({ length: 6 }, (_, i) => makeRay(`${i}.ts`, 5, 5, 5, 5, 5))
    const stats = makeStats({ overallRadiance: 5, voidCount: 6 })
    const recs = generateRecommendations(rays, [], { avgWarmth: 5, avgFlow: 5, avgWisdom: 5, isCopper: false, overallRadiance: 5 }, stats)
    expect(recs.some((r) => r.includes('6 raw ores'))).toBe(true)
  })

  it('warns about all collapsed foundries', () => {
    const rays = [makeRay('a.ts', 5, 5, 5, 5, 5)]
    const foundries = [{ directory: 'src', rays, avgWarmth: 5, avgFlow: 5, avgWisdom: 5, copperMasterpieceCount: 0, voidCount: 1, foundryType: 'no-forge' as FoundryType, condition: 'void' as FoundryCondition }]
    const stats = makeStats({ overallRadiance: 5 })
    const recs = generateRecommendations(rays, foundries, { avgWarmth: 5, avgFlow: 5, avgWisdom: 5, isCopper: false, overallRadiance: 5 }, stats)
    expect(recs.some((r) => r.includes('All foundries have collapsed'))).toBe(true)
  })

  it('returns positive when scores are good', () => {
    const rays = [makeRay('a.ts', 80, 80, 80, 80, 80)]
    const stats = makeStats({ overallRadiance: 80 })
    const recs = generateRecommendations(rays, [], { avgWarmth: 80, avgFlow: 80, avgWisdom: 80, isCopper: true, overallRadiance: 80 }, stats)
    expect(recs.some((r) => r.includes('radiates well'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for high score', () => { expect(typeof colorScore(95)).toBe('string') })
  it('returns string for low score', () => { expect(typeof colorScore(5)).toBe('string') })
  it('returns string for mid score', () => { expect(typeof colorScore(50)).toBe('string') })
})

describe('colorFoundryCondition', () => {
  it('colors copper-hall', () => { expect(typeof colorFoundryCondition('copper-hall')).toBe('string') })
  it('colors void', () => { expect(typeof colorFoundryCondition('void')).toBe('string') })
  it('colors unknown', () => { expect(typeof colorFoundryCondition('unknown')).toBe('string') })
})

describe('formatRayTable', () => {
  it('formats single ray', () => {
    const ray = makeRay('app.ts', 80, 80, 80, 80, 80)
    const result = formatRayTable(ray)
    expect(result).toContain('Copper Ray: app.ts')
    expect(result).toContain('Warmth Radiance')
    expect(result).toContain('Quality Score')
  })
})

describe('formatRaysTable', () => {
  it('returns no-rays message for empty', () => { expect(formatRaysTable([])).toContain('No copper rays') })
  it('formats multiple rays', () => {
    const rays = [makeRay('a.ts', 80, 80, 80, 80, 80), makeRay('b.ts', 60, 60, 60, 60, 60)]
    const result = formatRaysTable(rays)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatFoundryTable', () => {
  it('formats single foundry', () => {
    const foundry: CopperFoundryType = { directory: 'src', rays: [], avgWarmth: 80, avgFlow: 80, avgWisdom: 80, copperMasterpieceCount: 1, voidCount: 0, foundryType: 'grand-foundry', condition: 'copper-hall' }
    const result = formatFoundryTable(foundry)
    expect(result).toContain('Copper Foundry: src')
    expect(result).toContain('Masterpieces')
  })
})

describe('formatFoundriesTable', () => {
  it('returns no-foundries for empty', () => { expect(formatFoundriesTable([])).toContain('No copper foundries') })
  it('formats multiple foundries', () => {
    const foundries = [
      { directory: 'src', rays: [], avgWarmth: 80, avgFlow: 80, avgWisdom: 80, copperMasterpieceCount: 0, voidCount: 0, foundryType: 'copper-workshop' as FoundryType, condition: 'warm-workshop' as FoundryCondition },
      { directory: 'lib', rays: [], avgWarmth: 50, avgFlow: 50, avgWisdom: 50, copperMasterpieceCount: 0, voidCount: 0, foundryType: 'proper-forge' as FoundryType, condition: 'proper-forge' as FoundryCondition },
    ]
    const result = formatFoundriesTable(foundries)
    expect(result).toContain('src')
    expect(result).toContain('lib')
  })
})

describe('formatStatsTable', () => {
  it('formats all stats', () => {
    const stats = makeStats()
    const result = formatStatsTable(stats)
    expect(result).toContain('Copper Morning Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Smith Grade')
    expect(result).toContain('Best Ray')
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
    const result = await buildCopperMorningResult(['app.ts'], [richContent])
    const table = formatResultTable(result)
    expect(table).toContain('Copper Morning Analysis')
    expect(table).toContain('Dawn Overview')
    expect(table).toContain('Copper Morning Statistics')
    expect(table).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildCopperMorningResult(['app.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.rays).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
