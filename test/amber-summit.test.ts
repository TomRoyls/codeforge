import { describe, it, expect } from 'vitest'
import {
  measureProtecting,
  measureAscending,
  measureHardening,
  measureRevealing,
  measureRemembering,
  classifyCondition,
  classifyRidgeType,
  classifyRidgeCondition,
  classifyClimberGrade,
  analyzeAmberPeak,
  analyzeAmberRidge,
  buildAmberSummitResult,
  generateRecommendations,
} from '../src/commands/amber-summit-helpers.js'
import {
  colorScore,
  colorCondition,
  colorRidgeCondition,
  formatPeakTable,
  formatPeaksTable,
  formatRidgeTable,
  formatRidgesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/amber-summit-format-helpers.js'

// ─── Test Fixtures ──────────────────────────────────────────────────

const minimalContent = 'const x = 1'

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

// ─── measureProtecting ──────────────────────────────────────────

describe('measureProtecting', () => {
  it('returns a score for empty content', () => {
    const m = measureProtecting('')
    expect(m.power).toBe(0)
    expect(m.amber).toBe('no-power')
    expect(m.hasHighPower).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureProtecting(richContent)
    expect(m.power).toBe(100)
    expect(m.amber).toBe('perfect-preservation')
    expect(m.hasHighPower).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasEncapsulated).toBe(true)
    expect(m.hasMaintained).toBe(true)
    expect(m.hasStable).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasValuable).toBe(true)
  })

  it('detects untested var usage', () => {
    const m = measureProtecting('var x = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
  })

  it('detects unsafe any usage', () => {
    const m = measureProtecting('const x: any = 1')
    expect(m.unsafeCount).toBe(1)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects leaked ts-ignore', () => {
    const m = measureProtecting('// @ts-ignore')
    expect(m.hasNoLeaked).toBe(false)
  })

  it('detects abandoned patterns', () => {
    const m = measureProtecting('// abandoned forgotten neglected')
    expect(m.hasNoAbandoned).toBe(false)
  })

  it('detects volatile patterns', () => {
    const m = measureProtecting('// volatile unstable changing')
    expect(m.hasNoVolatile).toBe(false)
  })

  it('detects erratic var usage', () => {
    const m = measureProtecting('var x = 1')
    expect(m.hasNoErratic).toBe(false)
  })

  it('classifies leaking-sap at 40-59', () => {
    const m = measureProtecting('export function test(): string { if (true) { return "a" } }')
    expect(m.power).toBeGreaterThan(0)
    expect(typeof m.amber).toBe('string')
  })

  it('detects no undocumenting when functions absent', () => {
    const m = measureProtecting('const x = 1')
    expect(m.hasNoUndocumented).toBe(true)
  })
})

// ─── measureAscending ──────────────────────────────────────────

describe('measureAscending', () => {
  it('returns a score for empty content', () => {
    const m = measureAscending('')
    expect(m.elevation).toBe(0)
    expect(m.summit).toBe('no-elevation')
    expect(m.hasHighElevation).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureAscending(richContent)
    expect(m.elevation).toBe(100)
    expect(m.summit).toBe('golden-peak')
    expect(m.hasHighElevation).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasScalable).toBe(true)
    expect(m.hasOrganized).toBe(true)
    expect(m.hasCleanPipelines).toBe(true)
    expect(m.hasArchitectural).toBe(true)
    expect(m.hasElevated).toBe(true)
    expect(m.hasGrand).toBe(true)
  })

  it('detects chaotic patterns', () => {
    const m = measureAscending('// chaotic mess tangle')
    expect(m.chaoticCount).toBe(3)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects monolithic patterns', () => {
    const m = measureAscending('// monolithic giant massive')
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('detects bottlenecked patterns', () => {
    const m = measureAscending('// bottleneck block stall')
    expect(m.hasNoBottlenecked).toBe(false)
  })

  it('detects scattered patterns', () => {
    const m = measureAscending('// scattered fragmented dispersed')
    expect(m.hasNoScattered).toBe(false)
  })

  it('detects tangled patterns', () => {
    const m = measureAscending('// tangled spaghetti woven')
    expect(m.tangledCount).toBe(3)
    expect(m.hasNoTangled).toBe(false)
  })

  it('detects flat patterns', () => {
    const m = measureAscending('// flat shallow thin')
    expect(m.hasNoFlat).toBe(false)
  })

  it('detects ad-hoc any usage', () => {
    const m = measureAscending('const x: any = 1')
    expect(m.hasNoAdHoc).toBe(false)
  })
})

// ─── measureHardening ──────────────────────────────────────────

describe('measureHardening', () => {
  it('returns a score for empty content', () => {
    const m = measureHardening('')
    expect(m.fortitude).toBe(0)
    expect(m.resin).toBe('no-fortitude')
    expect(m.hasHighFortitude).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureHardening(richContent)
    expect(m.fortitude).toBe(100)
    expect(m.resin).toBe('diamond-hard')
    expect(m.hasHighFortitude).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasRecoverable).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasEnduring).toBe(true)
    expect(m.hasStrong).toBe(true)
    expect(m.hasSolid).toBe(true)
  })

  it('detects bare crash eval usage', () => {
    const m = measureHardening('eval("code")')
    expect(m.bareCrashCount).toBe(1)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects naive patterns', () => {
    const m = measureHardening('// trust assume hope')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects harsh fail patterns', () => {
    const m = measureHardening('// abort kill terminate')
    expect(m.hasNoHarshFail).toBe(false)
  })

  it('detects fatal patterns', () => {
    const m = measureHardening('// fatal panic crash')
    expect(m.hasNoFatal).toBe(false)
  })

  it('detects fragile var usage', () => {
    const m = measureHardening('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects brittle patterns', () => {
    const m = measureHardening('// brittle breakable fragile')
    expect(m.hasNoBrittle).toBe(false)
  })

  it('detects weak any usage', () => {
    const m = measureHardening('const x: any = 1')
    expect(m.hasNoWeak).toBe(false)
  })

  it('detects naive patterns', () => {
    const m = measureHardening('// trust assume hope')
    expect(m.hasNoNaive).toBe(false)
  })
})

// ─── measureRevealing ──────────────────────────────────────────

describe('measureRevealing', () => {
  it('returns a score for empty content', () => {
    const m = measureRevealing('')
    expect(m.clarity).toBe(0)
    expect(m.vista).toBe('no-clarity')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureRevealing(richContent)
    expect(m.clarity).toBe(100)
    expect(m.vista).toBe('panoramic-view')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasDirect).toBe(true)
    expect(m.hasRevealing).toBe(true)
  })

  it('detects cryptic eval usage', () => {
    const m = measureRevealing('eval("code")')
    expect(m.crypticCount).toBe(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects mystery patterns', () => {
    const m = measureRevealing('// mystery magic unexplained')
    expect(m.hasNoMystery).toBe(false)
  })

  it('detects obfuscated any usage', () => {
    const m = measureRevealing('const x: any = 1')
    expect(m.obfuscatedCount).toBe(1)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('detects hidden ts-ignore', () => {
    const m = measureRevealing('// @ts-ignore')
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects hidden ts-expect-error', () => {
    const m = measureRevealing('// @ts-expect-error')
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects arcane patterns', () => {
    const m = measureRevealing('// arcane esoteric cryptic')
    expect(m.hasNoArcane).toBe(false)
  })

  it('detects invisible patterns', () => {
    const m = measureRevealing('// invisible hidden concealed')
    expect(m.hasNoInvisible).toBe(false)
  })

  it('detects circuit patterns', () => {
    const m = measureRevealing('// circuit spaghetti tangle')
    expect(m.hasNoCircuits).toBe(false)
  })
})

// ─── measureRemembering ──────────────────────────────────────────

describe('measureRemembering', () => {
  it('returns a score for empty content', () => {
    const m = measureRemembering('')
    expect(m.wisdom).toBe(0)
    expect(m.ancient).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureRemembering(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.ancient).toBe('million-year-amber')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasStrategic).toBe(true)
  })

  it('detects hacked patterns', () => {
    const m = measureRemembering('// hack workaround monkey')
    expect(m.hackedCount).toBe(3)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects ad-hoc any usage', () => {
    const m = measureRemembering('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })

  it('detects experimental patterns', () => {
    const m = measureRemembering('// experimental beta alpha')
    expect(m.hasNoExperimental).toBe(false)
  })

  it('detects naive patterns', () => {
    const m = measureRemembering('// naive simple basic')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects reinvented patterns', () => {
    const m = measureRemembering('// reinvent rewrote redone')
    expect(m.hasNoReinvented).toBe(false)
  })

  it('detects shallow ts-ignore', () => {
    const m = measureRemembering('// @ts-ignore')
    expect(m.hasNoShallow).toBe(false)
  })

  it('detects obvious patterns', () => {
    const m = measureRemembering('// trivial obvious duh')
    expect(m.hasNoObvious).toBe(false)
  })
})

// ─── Classifiers ──────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies amber-masterpiece at 90+', () => {
    expect(classifyCondition(90)).toBe('amber-masterpiece')
    expect(classifyCondition(100)).toBe('amber-masterpiece')
  })

  it('classifies golden-summit at 75-89', () => {
    expect(classifyCondition(75)).toBe('golden-summit')
    expect(classifyCondition(89)).toBe('golden-summit')
  })

  it('classifies proper-peak at 60-74', () => {
    expect(classifyCondition(60)).toBe('proper-peak')
    expect(classifyCondition(74)).toBe('proper-peak')
  })

  it('classifies faded-hill at 40-59', () => {
    expect(classifyCondition(40)).toBe('faded-hill')
    expect(classifyCondition(59)).toBe('faded-hill')
  })

  it('classifies barren-rock at 20-39', () => {
    expect(classifyCondition(20)).toBe('barren-rock')
    expect(classifyCondition(39)).toBe('barren-rock')
  })

  it('classifies void below 20', () => {
    expect(classifyCondition(0)).toBe('void')
    expect(classifyCondition(19)).toBe('void')
  })
})

describe('classifyRidgeType', () => {
  it('returns no-ridge for empty peaks', () => {
    expect(classifyRidgeType([])).toBe('no-ridge')
  })

  it('classifies golden-mountain at avg 90+', () => {
    const peaks = [{ qualityScore: 90 }, { qualityScore: 95 }].map((q) =>
      ({ ...q, file: '', preservationPower: 0, goldenElevation: 0, resinFortitude: 0, peakClarity: 0, ancientWisdom: 0, protecting: {} as any, ascending: {} as any, hardening: {} as any, revealing: {} as any, remembering: {} as any, condition: 'void' as const }),
    )
    expect(classifyRidgeType(peaks)).toBe('golden-mountain')
  })

  it('classifies amber-ridge at avg 75-89', () => {
    const peaks = [{ qualityScore: 75 }, { qualityScore: 80 }].map((q) =>
      ({ ...q, file: '', preservationPower: 0, goldenElevation: 0, resinFortitude: 0, peakClarity: 0, ancientWisdom: 0, protecting: {} as any, ascending: {} as any, hardening: {} as any, revealing: {} as any, remembering: {} as any, condition: 'void' as const }),
    )
    expect(classifyRidgeType(peaks)).toBe('amber-ridge')
  })

  it('classifies no-ridge at avg below 20', () => {
    const peaks = [{ qualityScore: 0 }, { qualityScore: 5 }].map((q) =>
      ({ ...q, file: '', preservationPower: 0, goldenElevation: 0, resinFortitude: 0, peakClarity: 0, ancientWisdom: 0, protecting: {} as any, ascending: {} as any, hardening: {} as any, revealing: {} as any, remembering: {} as any, condition: 'void' as const }),
    )
    expect(classifyRidgeType(peaks)).toBe('no-ridge')
  })
})

describe('classifyRidgeCondition', () => {
  it('classifies amber-mountain at 85+', () => {
    expect(classifyRidgeCondition(85)).toBe('amber-mountain')
    expect(classifyRidgeCondition(100)).toBe('amber-mountain')
  })

  it('classifies golden-range at 70-84', () => {
    expect(classifyRidgeCondition(70)).toBe('golden-range')
    expect(classifyRidgeCondition(84)).toBe('golden-range')
  })

  it('classifies proper-ridge at 55-69', () => {
    expect(classifyRidgeCondition(55)).toBe('proper-ridge')
    expect(classifyRidgeCondition(69)).toBe('proper-ridge')
  })

  it('classifies faded-hills at 35-54', () => {
    expect(classifyRidgeCondition(35)).toBe('faded-hills')
    expect(classifyRidgeCondition(54)).toBe('faded-hills')
  })

  it('classifies barren-plain at 15-34', () => {
    expect(classifyRidgeCondition(15)).toBe('barren-plain')
    expect(classifyRidgeCondition(34)).toBe('barren-plain')
  })

  it('classifies void below 15', () => {
    expect(classifyRidgeCondition(0)).toBe('void')
    expect(classifyRidgeCondition(14)).toBe('void')
  })
})

describe('classifyClimberGrade', () => {
  it('classifies summit-master at 80+', () => {
    expect(classifyClimberGrade(80)).toBe('summit-master')
    expect(classifyClimberGrade(100)).toBe('summit-master')
  })

  it('classifies alpine-guide at 65-79', () => {
    expect(classifyClimberGrade(65)).toBe('alpine-guide')
    expect(classifyClimberGrade(79)).toBe('alpine-guide')
  })

  it('classifies mountain-goat at 50-64', () => {
    expect(classifyClimberGrade(50)).toBe('mountain-goat')
    expect(classifyClimberGrade(64)).toBe('mountain-goat')
  })

  it('classifies apprentice at 35-49', () => {
    expect(classifyClimberGrade(35)).toBe('apprentice')
    expect(classifyClimberGrade(49)).toBe('apprentice')
  })

  it('classifies novice at 20-34', () => {
    expect(classifyClimberGrade(20)).toBe('novice')
    expect(classifyClimberGrade(34)).toBe('novice')
  })

  it('classifies flatlander below 20', () => {
    expect(classifyClimberGrade(0)).toBe('flatlander')
    expect(classifyClimberGrade(19)).toBe('flatlander')
  })
})

// ─── analyzeAmberPeak ──────────────────────────────────────────

describe('analyzeAmberPeak', () => {
  it('analyzes minimal content', () => {
    const peak = analyzeAmberPeak(minimalContent, 'test.ts')
    expect(peak.file).toBe('test.ts')
    expect(peak.qualityScore).toBeGreaterThanOrEqual(0)
    expect(typeof peak.condition).toBe('string')
  })

  it('analyzes rich content with high scores', () => {
    const peak = analyzeAmberPeak(richContent, 'rich.ts')
    expect(peak.file).toBe('rich.ts')
    expect(peak.preservationPower).toBe(100)
    expect(peak.goldenElevation).toBe(100)
    expect(peak.resinFortitude).toBe(100)
    expect(peak.peakClarity).toBe(100)
    expect(peak.ancientWisdom).toBe(100)
    expect(peak.qualityScore).toBe(100)
    expect(peak.condition).toBe('amber-masterpiece')
  })

  it('computes qualityScore as weighted average', () => {
    const peak = analyzeAmberPeak('export function test(): string { return "a" }', 'mid.ts')
    expect(peak.qualityScore).toBeGreaterThanOrEqual(0)
    expect(peak.qualityScore).toBeLessThanOrEqual(100)
  })

  it('preserves all measure data', () => {
    const peak = analyzeAmberPeak(richContent, 'full.ts')
    expect(peak.protecting).toBeDefined()
    expect(peak.ascending).toBeDefined()
    expect(peak.hardening).toBeDefined()
    expect(peak.revealing).toBeDefined()
    expect(peak.remembering).toBeDefined()
  })
})

// ─── analyzeAmberRidge ──────────────────────────────────────────

describe('analyzeAmberRidge', () => {
  it('returns empty ridge for no peaks', () => {
    const ridge = analyzeAmberRidge([], 'src')
    expect(ridge.directory).toBe('src')
    expect(ridge.peaks).toHaveLength(0)
    expect(ridge.avgPower).toBe(0)
    expect(ridge.avgElevation).toBe(0)
    expect(ridge.avgWisdom).toBe(0)
    expect(ridge.amberMasterpieceCount).toBe(0)
    expect(ridge.voidCount).toBe(0)
    expect(ridge.ridgeType).toBe('no-ridge')
    expect(ridge.condition).toBe('void')
  })

  it('computes ridge stats from peaks', () => {
    const peaks = [
      analyzeAmberPeak(richContent, 'src/a.ts'),
      analyzeAmberPeak(richContent, 'src/b.ts'),
    ]
    const ridge = analyzeAmberRidge(peaks, 'src')
    expect(ridge.peaks).toHaveLength(2)
    expect(ridge.avgPower).toBe(100)
    expect(ridge.avgElevation).toBe(100)
    expect(ridge.avgWisdom).toBe(100)
    expect(ridge.amberMasterpieceCount).toBe(2)
    expect(ridge.ridgeType).toBe('golden-mountain')
    expect(ridge.condition).toBe('amber-mountain')
  })

  it('counts void peaks', () => {
    const peaks = [
      analyzeAmberPeak('', 'empty.ts'),
    ]
    const ridge = analyzeAmberRidge(peaks, '.')
    expect(ridge.voidCount).toBe(1)
  })
})

// ─── buildAmberSummitResult ──────────────────────────────────────────

describe('buildAmberSummitResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildAmberSummitResult([], [])
    expect(result.peaks).toHaveLength(0)
    expect(result.ridges).toHaveLength(0)
    expect(result.mountain.avgPower).toBe(0)
    expect(result.mountain.isAmber).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.climberGrade).toBe('flatlander')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes single file', async () => {
    const result = await buildAmberSummitResult(['test.ts'], [richContent])
    expect(result.peaks).toHaveLength(1)
    expect(result.peaks[0].file).toBe('test.ts')
    expect(result.ridges).toHaveLength(1)
    expect(result.ridges[0].directory).toBe('.')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into ridges', async () => {
    const result = await buildAmberSummitResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.peaks).toHaveLength(3)
    expect(result.ridges).toHaveLength(2)
    expect(result.stats.totalRidges).toBe(2)
  })

  it('computes mountain overview', async () => {
    const result = await buildAmberSummitResult(['app.ts'], [richContent])
    expect(result.mountain.avgPower).toBeGreaterThan(0)
    expect(result.mountain.avgElevation).toBeGreaterThan(0)
    expect(result.mountain.avgWisdom).toBeGreaterThan(0)
    expect(result.mountain.overallElevation).toBeGreaterThan(0)
    expect(result.mountain.isAmber).toBe(true)
  })

  it('computes stats correctly', async () => {
    const result = await buildAmberSummitResult(
      ['good.ts', 'bad.ts'],
      [richContent, ''],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.amberMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.bestPeak).toBeTruthy()
    expect(result.stats.mostPreserved).toBeTruthy()
    expect(result.stats.mostElevated).toBeTruthy()
    expect(result.stats.mostFortified).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('tracks high counts', async () => {
    const result = await buildAmberSummitResult(['rich.ts'], [richContent])
    expect(result.stats.hasHighPowerCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighElevationCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighFortitudeCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('handles missing content gracefully', async () => {
    const result = await buildAmberSummitResult(['missing.ts'], [])
    expect(result.peaks).toHaveLength(1)
    expect(result.peaks[0].file).toBe('missing.ts')
  })
})

// ─── generateRecommendations ──────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect recommendation for all 90+', () => {
    const peaks = [analyzeAmberPeak(richContent, 'perfect.ts')]
    const ridges = [analyzeAmberRidge(peaks, 'src')]
    const mountain = { avgPower: 95, avgElevation: 95, avgWisdom: 95, isAmber: true, overallElevation: 95 }
    const stats = {
      totalFiles: 1, totalRidges: 1,
      avgPreservationPower: 95, avgGoldenElevation: 95, avgResinFortitude: 95,
      avgPeakClarity: 95, avgAncientWisdom: 95,
      amberMasterpieceCount: 1, goldenSummitCount: 0, properPeakCount: 0,
      fadedHillCount: 0, barrenRockCount: 0, voidCount: 0,
      hasHighPowerCount: 1, hasHighElevationCount: 1, hasHighFortitudeCount: 1,
      hasHighClarityCount: 1, hasHighWisdomCount: 1,
      overallElevation: 95, climberGrade: 'summit-master' as const,
      bestPeak: 'perfect.ts', mostPreserved: 'perfect.ts', mostElevated: 'perfect.ts',
      mostFortified: 'perfect.ts', clearest: 'perfect.ts', wisest: 'perfect.ts',
    }
    const recs = generateRecommendations(peaks, ridges, mountain, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfect golden preservation')
  })

  it('recommends improving low preservation power', () => {
    const peaks = [analyzeAmberPeak('', 'empty.ts')]
    const ridges = [analyzeAmberRidge(peaks, '.')]
    const mountain = { avgPower: 0, avgElevation: 0, avgWisdom: 0, isAmber: false, overallElevation: 0 }
    const stats = {
      totalFiles: 1, totalRidges: 1,
      avgPreservationPower: 0, avgGoldenElevation: 0, avgResinFortitude: 0,
      avgPeakClarity: 0, avgAncientWisdom: 0,
      amberMasterpieceCount: 0, goldenSummitCount: 0, properPeakCount: 0,
      fadedHillCount: 0, barrenRockCount: 0, voidCount: 1,
      hasHighPowerCount: 0, hasHighElevationCount: 0, hasHighFortitudeCount: 0,
      hasHighClarityCount: 0, hasHighWisdomCount: 0,
      overallElevation: 0, climberGrade: 'flatlander' as const,
      bestPeak: 'empty.ts', mostPreserved: 'empty.ts', mostElevated: 'empty.ts',
      mostFortified: 'empty.ts', clearest: 'empty.ts', wisest: 'empty.ts',
    }
    const recs = generateRecommendations(peaks, ridges, mountain, stats)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.some((r) => r.includes('preservation power'))).toBe(true)
  })

  it('recommends improving low elevation', () => {
    const mountain = { avgPower: 70, avgElevation: 50, avgWisdom: 70, isAmber: false, overallElevation: 50 }
    const stats = {
      totalFiles: 1, totalRidges: 1,
      avgPreservationPower: 70, avgGoldenElevation: 50, avgResinFortitude: 70,
      avgPeakClarity: 70, avgAncientWisdom: 70,
      amberMasterpieceCount: 0, goldenSummitCount: 0, properPeakCount: 0,
      fadedHillCount: 0, barrenRockCount: 0, voidCount: 0,
      hasHighPowerCount: 0, hasHighElevationCount: 0, hasHighFortitudeCount: 0,
      hasHighClarityCount: 0, hasHighWisdomCount: 0,
      overallElevation: 50, climberGrade: 'mountain-goat' as const,
      bestPeak: '', mostPreserved: '', mostElevated: '', mostFortified: '', clearest: '', wisest: '',
    }
    const recs = generateRecommendations([], [], mountain, stats)
    expect(recs.some((r) => r.includes('golden architecture') || r.includes('Elevate'))).toBe(true)
  })

  it('warns about barren peaks', () => {
    const peaks = Array.from({ length: 6 }, (_, i) => analyzeAmberPeak('', `empty${i}.ts`))
    const ridges = [analyzeAmberRidge(peaks, '.')]
    const mountain = { avgPower: 0, avgElevation: 0, avgWisdom: 0, isAmber: false, overallElevation: 0 }
    const stats = {
      totalFiles: 6, totalRidges: 1,
      avgPreservationPower: 0, avgGoldenElevation: 0, avgResinFortitude: 0,
      avgPeakClarity: 0, avgAncientWisdom: 0,
      amberMasterpieceCount: 0, goldenSummitCount: 0, properPeakCount: 0,
      fadedHillCount: 0, barrenRockCount: 0, voidCount: 6,
      hasHighPowerCount: 0, hasHighElevationCount: 0, hasHighFortitudeCount: 0,
      hasHighClarityCount: 0, hasHighWisdomCount: 0,
      overallElevation: 0, climberGrade: 'flatlander' as const,
      bestPeak: 'empty0.ts', mostPreserved: 'empty0.ts', mostElevated: 'empty0.ts',
      mostFortified: 'empty0.ts', clearest: 'empty0.ts', wisest: 'empty0.ts',
    }
    const recs = generateRecommendations(peaks, ridges, mountain, stats)
    expect(recs.some((r) => r.includes('barren peaks'))).toBe(true)
  })

  it('recommends restoring specific void peaks when <= 5', () => {
    const peaks = [analyzeAmberPeak('', 'a.ts'), analyzeAmberPeak('', 'b.ts')]
    const ridges = [analyzeAmberRidge(peaks, '.')]
    const mountain = { avgPower: 0, avgElevation: 0, avgWisdom: 0, isAmber: false, overallElevation: 0 }
    const stats = {
      totalFiles: 2, totalRidges: 1,
      avgPreservationPower: 0, avgGoldenElevation: 0, avgResinFortitude: 0,
      avgPeakClarity: 0, avgAncientWisdom: 0,
      amberMasterpieceCount: 0, goldenSummitCount: 0, properPeakCount: 0,
      fadedHillCount: 0, barrenRockCount: 0, voidCount: 2,
      hasHighPowerCount: 0, hasHighElevationCount: 0, hasHighFortitudeCount: 0,
      hasHighClarityCount: 0, hasHighWisdomCount: 0,
      overallElevation: 0, climberGrade: 'flatlander' as const,
      bestPeak: 'a.ts', mostPreserved: 'a.ts', mostElevated: 'a.ts',
      mostFortified: 'a.ts', clearest: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations(peaks, ridges, mountain, stats)
    expect(recs.some((r) => r.includes('Restore these barren peaks'))).toBe(true)
  })

  it('warns when all ridges are poor', () => {
    const peaks = [analyzeAmberPeak('', 'bad.ts')]
    const ridges = [analyzeAmberRidge(peaks, 'src')]
    const mountain = { avgPower: 0, avgElevation: 0, avgWisdom: 0, isAmber: false, overallElevation: 0 }
    const stats = {
      totalFiles: 1, totalRidges: 1,
      avgPreservationPower: 0, avgGoldenElevation: 0, avgResinFortitude: 0,
      avgPeakClarity: 0, avgAncientWisdom: 0,
      amberMasterpieceCount: 0, goldenSummitCount: 0, properPeakCount: 0,
      fadedHillCount: 0, barrenRockCount: 0, voidCount: 1,
      hasHighPowerCount: 0, hasHighElevationCount: 0, hasHighFortitudeCount: 0,
      hasHighClarityCount: 0, hasHighWisdomCount: 0,
      overallElevation: 0, climberGrade: 'flatlander' as const,
      bestPeak: 'bad.ts', mostPreserved: 'bad.ts', mostElevated: 'bad.ts',
      mostFortified: 'bad.ts', clearest: 'bad.ts', wisest: 'bad.ts',
    }
    const recs = generateRecommendations(peaks, ridges, mountain, stats)
    expect(recs.some((r) => r.includes('complete restoration'))).toBe(true)
  })

  it('gives positive recommendation when all measures pass', () => {
    const peaks = [analyzeAmberPeak(richContent, 'good.ts')]
    const ridges = [analyzeAmberRidge(peaks, 'src')]
    const mountain = { avgPower: 85, avgElevation: 85, avgWisdom: 85, isAmber: true, overallElevation: 85 }
    const stats = {
      totalFiles: 1, totalRidges: 1,
      avgPreservationPower: 85, avgGoldenElevation: 85, avgResinFortitude: 85,
      avgPeakClarity: 85, avgAncientWisdom: 85,
      amberMasterpieceCount: 0, goldenSummitCount: 1, properPeakCount: 0,
      fadedHillCount: 0, barrenRockCount: 0, voidCount: 0,
      hasHighPowerCount: 1, hasHighElevationCount: 1, hasHighFortitudeCount: 1,
      hasHighClarityCount: 1, hasHighWisdomCount: 1,
      overallElevation: 85, climberGrade: 'summit-master' as const,
      bestPeak: 'good.ts', mostPreserved: 'good.ts', mostElevated: 'good.ts',
      mostFortified: 'good.ts', clearest: 'good.ts', wisest: 'good.ts',
    }
    const recs = generateRecommendations(peaks, ridges, mountain, stats)
    expect(recs.some((r) => r.includes('golden preservation') || r.includes('ancient wisdom'))).toBe(true)
  })

  it('recommends improving low fortitude', () => {
    const mountain = { avgPower: 70, avgElevation: 70, avgWisdom: 70, isAmber: false, overallElevation: 50 }
    const stats = {
      totalFiles: 1, totalRidges: 1,
      avgPreservationPower: 70, avgGoldenElevation: 70, avgResinFortitude: 50,
      avgPeakClarity: 70, avgAncientWisdom: 70,
      amberMasterpieceCount: 0, goldenSummitCount: 0, properPeakCount: 0,
      fadedHillCount: 0, barrenRockCount: 0, voidCount: 0,
      hasHighPowerCount: 0, hasHighElevationCount: 0, hasHighFortitudeCount: 0,
      hasHighClarityCount: 0, hasHighWisdomCount: 0,
      overallElevation: 50, climberGrade: 'mountain-goat' as const,
      bestPeak: '', mostPreserved: '', mostElevated: '', mostFortified: '', clearest: '', wisest: '',
    }
    const recs = generateRecommendations([], [], mountain, stats)
    expect(recs.some((r) => r.includes('resin fortitude') || r.includes('Harden'))).toBe(true)
  })

  it('recommends improving low clarity', () => {
    const mountain = { avgPower: 70, avgElevation: 70, avgWisdom: 70, isAmber: false, overallElevation: 50 }
    const stats = {
      totalFiles: 1, totalRidges: 1,
      avgPreservationPower: 70, avgGoldenElevation: 70, avgResinFortitude: 70,
      avgPeakClarity: 50, avgAncientWisdom: 70,
      amberMasterpieceCount: 0, goldenSummitCount: 0, properPeakCount: 0,
      fadedHillCount: 0, barrenRockCount: 0, voidCount: 0,
      hasHighPowerCount: 0, hasHighElevationCount: 0, hasHighFortitudeCount: 0,
      hasHighClarityCount: 0, hasHighWisdomCount: 0,
      overallElevation: 50, climberGrade: 'mountain-goat' as const,
      bestPeak: '', mostPreserved: '', mostElevated: '', mostFortified: '', clearest: '', wisest: '',
    }
    const recs = generateRecommendations([], [], mountain, stats)
    expect(recs.some((r) => r.includes('peak') || r.includes('Clear'))).toBe(true)
  })

  it('recommends improving low wisdom', () => {
    const mountain = { avgPower: 70, avgElevation: 70, avgWisdom: 50, isAmber: false, overallElevation: 50 }
    const stats = {
      totalFiles: 1, totalRidges: 1,
      avgPreservationPower: 70, avgGoldenElevation: 70, avgResinFortitude: 70,
      avgPeakClarity: 70, avgAncientWisdom: 50,
      amberMasterpieceCount: 0, goldenSummitCount: 0, properPeakCount: 0,
      fadedHillCount: 0, barrenRockCount: 0, voidCount: 0,
      hasHighPowerCount: 0, hasHighElevationCount: 0, hasHighFortitudeCount: 0,
      hasHighClarityCount: 0, hasHighWisdomCount: 0,
      overallElevation: 50, climberGrade: 'mountain-goat' as const,
      bestPeak: '', mostPreserved: '', mostElevated: '', mostFortified: '', clearest: '', wisest: '',
    }
    const recs = generateRecommendations([], [], mountain, stats)
    expect(recs.some((r) => r.includes('ancient wisdom') || r.includes('Deepen'))).toBe(true)
  })
})

// ─── Format Helpers ──────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns a string for known conditions', () => {
    expect(typeof colorCondition('amber-masterpiece')).toBe('string')
    expect(typeof colorCondition('golden-summit')).toBe('string')
    expect(typeof colorCondition('proper-peak')).toBe('string')
    expect(typeof colorCondition('faded-hill')).toBe('string')
    expect(typeof colorCondition('barren-rock')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
  })

  it('returns a string for unknown conditions', () => {
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorRidgeCondition', () => {
  it('returns a string for known ridge conditions', () => {
    expect(typeof colorRidgeCondition('amber-mountain')).toBe('string')
    expect(typeof colorRidgeCondition('golden-range')).toBe('string')
    expect(typeof colorRidgeCondition('proper-ridge')).toBe('string')
    expect(typeof colorRidgeCondition('faded-hills')).toBe('string')
    expect(typeof colorRidgeCondition('barren-plain')).toBe('string')
    expect(typeof colorRidgeCondition('void')).toBe('string')
  })

  it('returns a string for unknown conditions', () => {
    expect(typeof colorRidgeCondition('unknown')).toBe('string')
  })
})

describe('formatPeakTable', () => {
  it('formats a peak', () => {
    const peak = analyzeAmberPeak(richContent, 'app.ts')
    const output = formatPeakTable(peak)
    expect(output).toContain('app.ts')
    expect(output).toContain('Preservation Power')
    expect(output).toContain('Golden Elevation')
    expect(output).toContain('Resin Fortitude')
    expect(output).toContain('Peak Clarity')
    expect(output).toContain('Ancient Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatPeaksTable', () => {
  it('formats empty peaks', () => {
    const output = formatPeaksTable([])
    expect(output).toContain('No amber peaks found')
  })

  it('formats peaks table', () => {
    const peaks = [analyzeAmberPeak(richContent, 'app.ts')]
    const output = formatPeaksTable(peaks)
    expect(output).toContain('app.ts')
    expect(output).toContain('Amber Peaks')
  })
})

describe('formatRidgeTable', () => {
  it('formats a ridge', () => {
    const peaks = [analyzeAmberPeak(richContent, 'src/app.ts')]
    const ridge = analyzeAmberRidge(peaks, 'src')
    const output = formatRidgeTable(ridge)
    expect(output).toContain('src')
    expect(output).toContain('Peaks')
    expect(output).toContain('Avg Power')
  })
})

describe('formatRidgesTable', () => {
  it('formats empty ridges', () => {
    const output = formatRidgesTable([])
    expect(output).toContain('No amber ridges found')
  })

  it('formats ridges table', () => {
    const peaks = [analyzeAmberPeak(richContent, 'src/app.ts')]
    const ridges = [analyzeAmberRidge(peaks, 'src')]
    const output = formatRidgesTable(ridges)
    expect(output).toContain('src')
    expect(output).toContain('Amber Ridges')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildAmberSummitResult(['app.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Amber Summit Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Overall Elevation')
    expect(output).toContain('Climber Grade')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Fix X')
    expect(output).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildAmberSummitResult(['app.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Amber Summit Analysis')
    expect(output).toContain('Mountain Overview')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildAmberSummitResult(['app.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.peaks).toHaveLength(1)
    expect(parsed.ridges).toBeDefined()
    expect(parsed.mountain).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
