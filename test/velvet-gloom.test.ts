import { describe, expect, it } from 'vitest'

import {
  type ComfortingMeasure,
  type ContemplatingMeasure,
  type CurtainCondition as CurtainConditionType,
  type CurtainType as CurtainTypeType,
  type DrapingMeasure,
  type FoldCondition as FoldConditionType,
  type PersistingMeasure,
  type SoothingMeasure,
  type VelvetCurtain as VelvetCurtainType,
  type VelvetDarknessResult,
  type VelvetFold as VelvetFoldType,
  type WeaverGrade as WeaverGradeType,
  analyzeVelvetCurtain,
  analyzeVelvetFold,
  buildVelvetDarknessResult,
  classifyCurtainCondition,
  classifyCurtainType,
  classifyFoldCondition,
  classifyWeaverGrade,
  generateRecommendations,
  measureComforting,
  measureContemplating,
  measureDraping,
  measurePersisting,
  measureSoothing,
} from '../src/commands/velvet-gloom-helpers.js'

import {
  colorCurtainCondition,
  colorScore,
  formatCurtainsTable,
  formatCurtainTable,
  formatFoldsTable,
  formatFoldTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/velvet-gloom-format-helpers.js'

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

function makeFold(
  file: string,
  softness: number,
  comfort: number,
  elegance: number,
  wisdom: number,
  resilience: number,
): VelvetFoldType {
  const qualityScore = Math.round(softness * 0.2 + comfort * 0.2 + elegance * 0.2 + wisdom * 0.2 + resilience * 0.2)
  return {
    file,
    softnessQuality: softness,
    darkComfort: comfort,
    shadowElegance: elegance,
    nocturnalWisdom: wisdom,
    nightResilience: resilience,
    soothing: { softness, texture: 'silk-velvet', hasHighSoftness: softness >= 60, hasApproachable: true, hasNoHostile: true, hasReadable: true, hasNoCryptic: true, hasWelcoming: true, hasGentle: true, hasSmooth: true, hasInviting: true, hasWarm: true, hasKind: true, hasForgiving: true, hasComfortable: true, hasPatient: true, hasGracious: true, hostileCount: 0, crypticCount: 0 } as SoothingMeasure,
    comforting: { comfort, embrace: 'safe-haven', hasHighComfort: comfort >= 60, hasErrorHandled: true, hasNoUnhandled: true, hasDefensive: true, hasRobust: true, hasForgiving: true, hasSafe: true, hasProtective: true, hasReassuring: true, hasSupportive: true, hasGentle: true, hasUnderstanding: true, hasPatient: true, hasNurturing: true, hasCaring: true, hasAccepting: true, unhandledCount: 0, hostileCount: 0 } as ComfortingMeasure,
    draping: { elegance, drape: 'haute-couture', hasHighElegance: elegance >= 60, hasElegant: true, hasNoClunky: true, hasRefined: true, hasPolished: true, hasGraceful: true, hasSubtle: true, hasTasteful: true, hasSophisticated: true, hasHarmonious: true, hasBalanced: true, hasAesthetic: true, hasCrafted: true, hasDeliberate: true, hasArtistic: true, hasBeautiful: true, clunkyCount: 0, roughCount: 0 } as DrapingMeasure,
    contemplating: { wisdom, insight: 'night-philosopher', hasHighWisdom: wisdom >= 60, hasWellArchitected: true, hasNoHacked: true, hasPrincipled: true, hasDeep: true, hasReflective: true, hasContemplative: true, hasInsightful: true, hasStrategic: true, hasEvolved: true, hasThoughtful: true, hasMindful: true, hasMature: true, hasProven: true, hasWise: true, hasAccumulated: true, hackedCount: 0, shallowCount: 0 } as ContemplatingMeasure,
    persisting: { resilience, endurance: 'eternal-night', hasHighResilience: resilience >= 60, hasTested: true, hasNoUntested: true, hasStable: true, hasNoVolatile: true, hasConsistent: true, hasEnduring: true, hasReliable: true, hasPersistent: true, hasUnyielding: true, hasResolute: true, hasSteadfast: true, hasTireless: true, hasIndomitable: true, hasUnfailing: true, hasPerpetual: true, untestedCount: 0, volatileCount: 0 } as PersistingMeasure,
    condition: classifyFoldCondition(qualityScore),
    qualityScore,
  }
}

function makeStats(overrides: Partial<VelvetDarknessResult['stats']> = {}): VelvetDarknessResult['stats'] {
  return {
    totalFiles: 1,
    totalCurtains: 1,
    avgSoftnessQuality: 80,
    avgDarkComfort: 80,
    avgShadowElegance: 80,
    avgNocturnalWisdom: 80,
    avgNightResilience: 80,
    velvetMasterpieceCount: 0,
    midnightSilkCount: 1,
    properFabricCount: 0,
    coarseWeaveCount: 0,
    tornRagCount: 0,
    voidCount: 0,
    hasHighSoftnessCount: 1,
    hasHighComfortCount: 1,
    hasHighEleganceCount: 1,
    hasHighWisdomCount: 1,
    hasHighResilienceCount: 1,
    overallDepth: 80,
    weaverGrade: 'velvet-artisan' as WeaverGradeType,
    bestFold: 'app.ts',
    softest: 'app.ts',
    mostComforting: 'app.ts',
    mostElegant: 'app.ts',
    wisest: 'app.ts',
    mostResilient: 'app.ts',
    ...overrides,
  }
}

// ─── measureSoothing ────────────────────────────────────

describe('measureSoothing', () => {
  it('scores rich content at max', () => {
    const result = measureSoothing(richContent)
    expect(result.softness).toBe(100)
    expect(result.hasHighSoftness).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureSoothing(emptyContent).softness).toBeLessThan(50)
  })

  it('detects hostile patterns', () => {
    const result = measureSoothing('hostile aggressive dangerous violent code')
    expect(result.hostileCount).toBeGreaterThan(0)
    expect(result.hasNoHostile).toBe(false)
  })

  it('detects cryptic patterns', () => {
    const result = measureSoothing('cryptic obfuscate minified code')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects approachable class/interface', () => { expect(measureSoothing('class Foo {}').hasApproachable).toBe(true) })
  it('penalizes var/eval', () => { expect(measureSoothing('var x = eval("1")').hasGentle).toBe(false) })
  it('penalizes any keyword', () => { expect(measureSoothing('const x: any').hasSmooth).toBe(false) })
  it('detects forgiving try/catch', () => { expect(measureSoothing('try { x } catch { y }').hasForgiving).toBe(true) })
  it('detects warm const/readonly', () => { expect(measureSoothing('const x = 1').hasWarm).toBe(true) })
  it('penalizes hack/workaround', () => { expect(measureSoothing('hack workaround kludge').hasKind).toBe(false) })
})

// ─── measureComforting ──────────────────────────────────

describe('measureComforting', () => {
  it('scores rich content at max', () => {
    const result = measureComforting(richContent)
    expect(result.comfort).toBe(100)
    expect(result.hasHighComfort).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureComforting(emptyContent).comfort).toBeLessThan(50)
  })

  it('detects unhandled patterns', () => {
    const result = measureComforting('unhandled unchecked bare code')
    expect(result.unhandledCount).toBeGreaterThan(0)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects hostile patterns', () => {
    const result = measureComforting('hostile aggressive dangerous violent code')
    expect(result.hostileCount).toBeGreaterThan(0)
  })

  it('detects error handling', () => { expect(measureComforting('try { x } catch { y }').hasErrorHandled).toBe(true) })
  it('penalizes var/eval', () => { expect(measureComforting('var x = eval("1")').hasForgiving).toBe(false) })
  it('penalizes any keyword', () => { expect(measureComforting('const x: any').hasRobust).toBe(false) })
  it('detects understanding docs', () => { expect(measureComforting('/** doc */').hasUnderstanding).toBe(true) })
  it('penalizes global/window/document', () => { expect(measureComforting('window.document').hasCaring).toBe(false) })
})

// ─── measureDraping ─────────────────────────────────────

describe('measureDraping', () => {
  it('scores rich content at max', () => {
    const result = measureDraping(richContent)
    expect(result.elegance).toBe(100)
    expect(result.hasHighElegance).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureDraping(emptyContent).elegance).toBeLessThan(50)
  })

  it('detects clunky patterns', () => {
    const result = measureDraping('clunky ugly messy sloppy code')
    expect(result.clunkyCount).toBeGreaterThan(0)
    expect(result.hasNoClunky).toBe(false)
  })

  it('detects rough patterns', () => {
    const result = measureDraping('rough crude primitive bare code')
    expect(result.roughCount).toBeGreaterThan(0)
  })

  it('detects elegant class/interface', () => { expect(measureDraping('class Foo {}').hasElegant).toBe(true) })
  it('penalizes any keyword', () => { expect(measureDraping('const x: any').hasPolished).toBe(false) })
  it('detects tasteful docs', () => { expect(measureDraping('/** doc */').hasTasteful).toBe(true) })
  it('penalizes global/window/document', () => { expect(measureDraping('window.document').hasArtistic).toBe(false) })
})

// ─── measureContemplating ───────────────────────────────

describe('measureContemplating', () => {
  it('scores rich content at max', () => {
    const result = measureContemplating(richContent)
    expect(result.wisdom).toBe(100)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureContemplating(emptyContent).wisdom).toBeLessThan(50)
  })

  it('detects hacked patterns', () => {
    const result = measureContemplating('hack workaround kludge code')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects shallow patterns', () => {
    const result = measureContemplating('shallow superficial trivial code')
    expect(result.shallowCount).toBeGreaterThan(0)
  })

  it('detects well-architected', () => { expect(measureContemplating('class Foo {}').hasWellArchitected).toBe(true) })
  it('penalizes any keyword', () => { expect(measureContemplating('const x: any').hasPrincipled).toBe(false) })
  it('detects contemplative docs', () => { expect(measureContemplating('/** doc */').hasContemplative).toBe(true) })
})

// ─── measurePersisting ──────────────────────────────────

describe('measurePersisting', () => {
  it('scores rich content at max', () => {
    const result = measurePersisting(richContent)
    expect(result.resilience).toBe(100)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measurePersisting(emptyContent).resilience).toBeLessThan(50)
  })

  it('detects untested eval/Function', () => {
    const result = measurePersisting('eval("code")')
    expect(result.untestedCount).toBeGreaterThan(0)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects volatile patterns', () => {
    const result = measurePersisting('volatile unstable flaky erratic code')
    expect(result.volatileCount).toBeGreaterThan(0)
    expect(result.hasNoVolatile).toBe(false)
  })

  it('detects stable const/readonly', () => { expect(measurePersisting('const x = 1').hasStable).toBe(true) })
  it('penalizes any keyword', () => { expect(measurePersisting('const x: any').hasReliable).toBe(false) })
  it('detects unfailing docs', () => { expect(measurePersisting('/** doc */').hasUnfailing).toBe(true) })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyFoldCondition', () => {
  it('returns velvet-masterpiece for 90+', () => { expect(classifyFoldCondition(95)).toBe('velvet-masterpiece') })
  it('returns midnight-silk for 75-89', () => { expect(classifyFoldCondition(80)).toBe('midnight-silk') })
  it('returns proper-fabric for 60-74', () => { expect(classifyFoldCondition(65)).toBe('proper-fabric') })
  it('returns coarse-weave for 40-59', () => { expect(classifyFoldCondition(50)).toBe('coarse-weave') })
  it('returns torn-rag for 20-39', () => { expect(classifyFoldCondition(30)).toBe('torn-rag') })
  it('returns void below 20', () => { expect(classifyFoldCondition(10)).toBe('void') })
})

describe('classifyCurtainType', () => {
  it('returns void for empty', () => { expect(classifyCurtainType([])).toBe('void') })
  it('returns grand-curtain for high', () => { expect(classifyCurtainType([makeFold('a.ts', 90, 90, 90, 90, 90)])).toBe('grand-curtain') })
  it('returns velvet-drape for medium-high', () => { expect(classifyCurtainType([makeFold('a.ts', 75, 75, 75, 75, 75)])).toBe('velvet-drape') })
  it('returns proper-blinds for medium', () => { expect(classifyCurtainType([makeFold('a.ts', 60, 60, 60, 60, 60)])).toBe('proper-blinds') })
  it('returns bedsheet for low', () => { expect(classifyCurtainType([makeFold('a.ts', 40, 40, 40, 40, 40)])).toBe('bedsheet') })
  it('returns no-covering for very low', () => { expect(classifyCurtainType([makeFold('a.ts', 20, 20, 20, 20, 20)])).toBe('no-covering') })
})

describe('classifyCurtainCondition', () => {
  it('returns velvet-theater for 85+', () => { expect(classifyCurtainCondition(90)).toBe('velvet-theater') })
  it('returns silk-parlor for 70-84', () => { expect(classifyCurtainCondition(75)).toBe('silk-parlor') })
  it('returns proper-room for 55-69', () => { expect(classifyCurtainCondition(60)).toBe('proper-room') })
  it('returns bare-walls for 35-54', () => { expect(classifyCurtainCondition(40)).toBe('bare-walls') })
  it('returns ruin for 15-34', () => { expect(classifyCurtainCondition(20)).toBe('ruin') })
  it('returns void below 15', () => { expect(classifyCurtainCondition(5)).toBe('void') })
})

describe('classifyWeaverGrade', () => {
  it('returns master-weaver for 80+', () => { expect(classifyWeaverGrade(85)).toBe('master-weaver') })
  it('returns velvet-artisan for 65-79', () => { expect(classifyWeaverGrade(70)).toBe('velvet-artisan') })
  it('returns proper-tailor for 50-64', () => { expect(classifyWeaverGrade(55)).toBe('proper-tailor') })
  it('returns apprentice for 35-49', () => { expect(classifyWeaverGrade(40)).toBe('apprentice') })
  it('returns novice for 20-34', () => { expect(classifyWeaverGrade(25)).toBe('novice') })
  it('returns rag-picker below 20', () => { expect(classifyWeaverGrade(10)).toBe('rag-picker') })
})

// ─── analyzeVelvetFold ──────────────────────────────────

describe('analyzeVelvetFold', () => {
  it('returns full VelvetFold for rich content', () => {
    const result = analyzeVelvetFold(richContent, 'app.ts')
    expect(result.file).toBe('app.ts')
    expect(result.softnessQuality).toBeGreaterThan(0)
    expect(result.darkComfort).toBeGreaterThan(0)
    expect(result.shadowElegance).toBeGreaterThan(0)
    expect(result.nocturnalWisdom).toBeGreaterThan(0)
    expect(result.nightResilience).toBeGreaterThan(0)
    expect(result.qualityScore).toBeGreaterThan(0)
    expect(result.condition).toBeDefined()
  })

  it('scores poor content low', () => {
    expect(analyzeVelvetFold(poorContent, 'bad.ts').qualityScore).toBeLessThan(50)
  })

  it('computes qualityScore as 0.2 weighted', () => {
    const result = analyzeVelvetFold(richContent, 'test.ts')
    const expected = Math.round(
      result.softnessQuality * 0.2 + result.darkComfort * 0.2 +
      result.shadowElegance * 0.2 + result.nocturnalWisdom * 0.2 + result.nightResilience * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })
})

// ─── analyzeVelvetCurtain ───────────────────────────────

describe('analyzeVelvetCurtain', () => {
  it('returns empty curtain for no folds', () => {
    const result = analyzeVelvetCurtain([], 'src')
    expect(result.directory).toBe('src')
    expect(result.folds).toHaveLength(0)
    expect(result.curtainType).toBe('void')
    expect(result.condition).toBe('void')
  })

  it('aggregates fold scores', () => {
    const folds = [makeFold('a.ts', 80, 80, 80, 80, 80), makeFold('b.ts', 60, 60, 60, 60, 60)]
    const result = analyzeVelvetCurtain(folds, 'src')
    expect(result.avgSoftness).toBe(70)
    expect(result.avgElegance).toBe(70)
    expect(result.avgWisdom).toBe(70)
  })

  it('counts masterpiece and void', () => {
    const masterpiece = makeFold('a.ts', 95, 95, 95, 95, 95)
    const voidF = makeFold('b.ts', 5, 5, 5, 5, 5)
    const result = analyzeVelvetCurtain([masterpiece, voidF], 'src')
    expect(result.velvetMasterpieceCount).toBe(1)
    expect(result.voidCount).toBe(1)
  })
})

// ─── buildVelvetDarknessResult ──────────────────────────

describe('buildVelvetDarknessResult', () => {
  it('returns valid result for single file', async () => {
    const result = await buildVelvetDarknessResult(['app.ts'], [richContent])
    expect(result.folds).toHaveLength(1)
    expect(result.curtains).toHaveLength(1)
    expect(result.night.overallDepth).toBeGreaterThan(0)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('returns zero averages for empty input', async () => {
    const result = await buildVelvetDarknessResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallDepth).toBe(0)
    expect(result.night.isVelvet).toBe(false)
  })

  it('groups files by directory', async () => {
    const result = await buildVelvetDarknessResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, moderateContent],
    )
    expect(result.curtains.length).toBe(2)
    expect(result.stats.totalCurtains).toBe(2)
  })

  it('computes weaver grade', async () => {
    const result = await buildVelvetDarknessResult(['a.ts'], [richContent])
    expect(result.stats.weaverGrade).toBeDefined()
    expect(result.night.isVelvet).toBe(result.night.overallDepth >= 60)
  })

  it('finds extremes', async () => {
    const result = await buildVelvetDarknessResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.bestFold).toBeTruthy()
    expect(result.stats.softest).toBeTruthy()
    expect(result.stats.mostComforting).toBeTruthy()
    expect(result.stats.mostElegant).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
  })

  it('scores rich content at max', async () => {
    const result = await buildVelvetDarknessResult(['perfect.ts'], [richContent])
    expect(result.folds[0].softnessQuality).toBe(100)
    expect(result.folds[0].darkComfort).toBe(100)
    expect(result.folds[0].shadowElegance).toBe(100)
    expect(result.folds[0].nocturnalWisdom).toBe(100)
    expect(result.folds[0].nightResilience).toBe(100)
    expect(result.folds[0].qualityScore).toBe(100)
  })

  it('handles mixed content', async () => {
    const result = await buildVelvetDarknessResult(['good.ts', 'bad.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.folds).toHaveLength(2)
  })

  it('counts condition categories', async () => {
    const result = await buildVelvetDarknessResult(['perfect.ts'], [richContent])
    expect(result.stats.velvetMasterpieceCount).toBe(1)
    expect(result.stats.voidCount).toBe(0)
  })

  it('counts high measure counts', async () => {
    const result = await buildVelvetDarknessResult(['perfect.ts'], [richContent])
    expect(result.stats.hasHighSoftnessCount).toBe(1)
    expect(result.stats.hasHighComfortCount).toBe(1)
    expect(result.stats.hasHighEleganceCount).toBe(1)
    expect(result.stats.hasHighWisdomCount).toBe(1)
    expect(result.stats.hasHighResilienceCount).toBe(1)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece when all >= 90', () => {
    const folds = [makeFold('a.ts', 95, 95, 95, 95, 95)]
    const stats = makeStats({ avgSoftnessQuality: 95, avgDarkComfort: 95, avgShadowElegance: 95, avgNocturnalWisdom: 95, avgNightResilience: 95, overallDepth: 95 })
    const recs = generateRecommendations(folds, [], { avgSoftness: 95, avgElegance: 95, avgWisdom: 95, isVelvet: true, overallDepth: 95 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends softness when softness low', () => {
    const folds = [makeFold('a.ts', 50, 90, 90, 90, 90)]
    const stats = makeStats({ avgSoftnessQuality: 50, avgDarkComfort: 90, avgShadowElegance: 90, avgNocturnalWisdom: 90, avgNightResilience: 90, overallDepth: 82 })
    const recs = generateRecommendations(folds, [], { avgSoftness: 50, avgElegance: 90, avgWisdom: 90, isVelvet: true, overallDepth: 82 }, stats)
    expect(recs.some((r) => r.includes('velvet texture'))).toBe(true)
  })

  it('recommends comfort when low', () => {
    const folds = [makeFold('a.ts', 90, 50, 90, 90, 90)]
    const stats = makeStats({ avgSoftnessQuality: 90, avgDarkComfort: 50, avgShadowElegance: 90, avgNocturnalWisdom: 90, avgNightResilience: 90, overallDepth: 82 })
    const recs = generateRecommendations(folds, [], { avgSoftness: 90, avgElegance: 90, avgWisdom: 90, isVelvet: true, overallDepth: 82 }, stats)
    expect(recs.some((r) => r.includes('dark comfort'))).toBe(true)
  })

  it('recommends elegance when low', () => {
    const folds = [makeFold('a.ts', 90, 90, 50, 90, 90)]
    const stats = makeStats({ avgSoftnessQuality: 90, avgDarkComfort: 90, avgShadowElegance: 50, avgNocturnalWisdom: 90, avgNightResilience: 90, overallDepth: 82 })
    const recs = generateRecommendations(folds, [], { avgSoftness: 90, avgElegance: 50, avgWisdom: 90, isVelvet: true, overallDepth: 82 }, stats)
    expect(recs.some((r) => r.includes('shadow elegance'))).toBe(true)
  })

  it('recommends wisdom when low', () => {
    const folds = [makeFold('a.ts', 90, 90, 90, 50, 90)]
    const stats = makeStats({ avgSoftnessQuality: 90, avgDarkComfort: 90, avgShadowElegance: 90, avgNocturnalWisdom: 50, avgNightResilience: 90, overallDepth: 82 })
    const recs = generateRecommendations(folds, [], { avgSoftness: 90, avgElegance: 90, avgWisdom: 50, isVelvet: true, overallDepth: 82 }, stats)
    expect(recs.some((r) => r.includes('nocturnal wisdom'))).toBe(true)
  })

  it('recommends resilience when low', () => {
    const folds = [makeFold('a.ts', 90, 90, 90, 90, 50)]
    const stats = makeStats({ avgSoftnessQuality: 90, avgDarkComfort: 90, avgShadowElegance: 90, avgNocturnalWisdom: 90, avgNightResilience: 50, overallDepth: 82 })
    const recs = generateRecommendations(folds, [], { avgSoftness: 90, avgElegance: 90, avgWisdom: 90, isVelvet: true, overallDepth: 82 }, stats)
    expect(recs.some((r) => r.includes('night resilience'))).toBe(true)
  })

  it('warns about frayed when overall < 40', () => {
    const folds = [makeFold('a.ts', 30, 30, 30, 30, 30)]
    const stats = makeStats({ avgSoftnessQuality: 30, avgDarkComfort: 30, avgShadowElegance: 30, avgNocturnalWisdom: 30, avgNightResilience: 30, overallDepth: 30 })
    const recs = generateRecommendations(folds, [], { avgSoftness: 30, avgElegance: 30, avgWisdom: 30, isVelvet: false, overallDepth: 30 }, stats)
    expect(recs.some((r) => r.includes('frayed'))).toBe(true)
  })

  it('lists void folds when <= 5', () => {
    const folds = [makeFold('a.ts', 5, 5, 5, 5, 5), makeFold('b.ts', 90, 90, 90, 90, 90)]
    const stats = makeStats({ overallDepth: 47 })
    const recs = generateRecommendations(folds, [], { avgSoftness: 47, avgElegance: 47, avgWisdom: 47, isVelvet: false, overallDepth: 47 }, stats)
    expect(recs.some((r) => r.includes('a.ts'))).toBe(true)
  })

  it('warns about many void folds', () => {
    const folds = Array.from({ length: 6 }, (_, i) => makeFold(`${i}.ts`, 5, 5, 5, 5, 5))
    const stats = makeStats({ overallDepth: 5, voidCount: 6 })
    const recs = generateRecommendations(folds, [], { avgSoftness: 5, avgElegance: 5, avgWisdom: 5, isVelvet: false, overallDepth: 5 }, stats)
    expect(recs.some((r) => r.includes('6 torn rags'))).toBe(true)
  })

  it('warns about all fallen curtains', () => {
    const folds = [makeFold('a.ts', 5, 5, 5, 5, 5)]
    const curtains = [{ directory: 'src', folds, avgSoftness: 5, avgElegance: 5, avgWisdom: 5, velvetMasterpieceCount: 0, voidCount: 1, curtainType: 'void' as CurtainTypeType, condition: 'void' as CurtainConditionType }]
    const stats = makeStats({ overallDepth: 5 })
    const recs = generateRecommendations(folds, curtains, { avgSoftness: 5, avgElegance: 5, avgWisdom: 5, isVelvet: false, overallDepth: 5 }, stats)
    expect(recs.some((r) => r.includes('All curtains have fallen'))).toBe(true)
  })

  it('returns positive when scores are good', () => {
    const folds = [makeFold('a.ts', 80, 80, 80, 80, 80)]
    const stats = makeStats({ overallDepth: 80 })
    const recs = generateRecommendations(folds, [], { avgSoftness: 80, avgElegance: 80, avgWisdom: 80, isVelvet: true, overallDepth: 80 }, stats)
    expect(recs.some((r) => r.includes('drapes beautifully'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for high score', () => { expect(typeof colorScore(95)).toBe('string') })
  it('returns string for low score', () => { expect(typeof colorScore(5)).toBe('string') })
  it('returns string for mid score', () => { expect(typeof colorScore(50)).toBe('string') })
})

describe('colorCurtainCondition', () => {
  it('colors velvet-theater', () => { expect(typeof colorCurtainCondition('velvet-theater')).toBe('string') })
  it('colors void', () => { expect(typeof colorCurtainCondition('void')).toBe('string') })
  it('colors unknown', () => { expect(typeof colorCurtainCondition('unknown')).toBe('string') })
})

describe('formatFoldTable', () => {
  it('formats single fold', () => {
    const fold = makeFold('app.ts', 80, 80, 80, 80, 80)
    const result = formatFoldTable(fold)
    expect(result).toContain('Velvet Fold: app.ts')
    expect(result).toContain('Softness Quality')
    expect(result).toContain('Quality Score')
  })
})

describe('formatFoldsTable', () => {
  it('returns no-folds message for empty', () => { expect(formatFoldsTable([])).toContain('No velvet folds') })
  it('formats multiple folds', () => {
    const folds = [makeFold('a.ts', 80, 80, 80, 80, 80), makeFold('b.ts', 60, 60, 60, 60, 60)]
    const result = formatFoldsTable(folds)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatCurtainTable', () => {
  it('formats single curtain', () => {
    const curtain: VelvetCurtainType = { directory: 'src', folds: [], avgSoftness: 80, avgElegance: 80, avgWisdom: 80, velvetMasterpieceCount: 1, voidCount: 0, curtainType: 'grand-curtain', condition: 'velvet-theater' }
    const result = formatCurtainTable(curtain)
    expect(result).toContain('Velvet Curtain: src')
    expect(result).toContain('Masterpieces')
  })
})

describe('formatCurtainsTable', () => {
  it('returns no-curtains for empty', () => { expect(formatCurtainsTable([])).toContain('No velvet curtains') })
  it('formats multiple curtains', () => {
    const curtains = [
      { directory: 'src', folds: [], avgSoftness: 80, avgElegance: 80, avgWisdom: 80, velvetMasterpieceCount: 0, voidCount: 0, curtainType: 'velvet-drape' as CurtainTypeType, condition: 'silk-parlor' as CurtainConditionType },
      { directory: 'lib', folds: [], avgSoftness: 50, avgElegance: 50, avgWisdom: 50, velvetMasterpieceCount: 0, voidCount: 0, curtainType: 'proper-blinds' as CurtainTypeType, condition: 'proper-room' as CurtainConditionType },
    ]
    const result = formatCurtainsTable(curtains)
    expect(result).toContain('src')
    expect(result).toContain('lib')
  })
})

describe('formatStatsTable', () => {
  it('formats all stats', () => {
    const stats = makeStats()
    const result = formatStatsTable(stats)
    expect(result).toContain('Velvet Darkness Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Weaver Grade')
    expect(result).toContain('Best Fold')
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
    const result = await buildVelvetDarknessResult(['app.ts'], [richContent])
    const table = formatResultTable(result)
    expect(table).toContain('Velvet Darkness Analysis')
    expect(table).toContain('Night Overview')
    expect(table).toContain('Velvet Darkness Statistics')
    expect(table).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildVelvetDarknessResult(['app.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.folds).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
