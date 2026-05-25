import { describe, it, expect } from 'vitest'
import {
  measureRuling,
  measureJudging,
  measureCrowning,
  measureWielding,
  measureReigning,
  classifyCondition,
  classifyCourtType,
  classifyCourtCondition,
  classifyMonarchGrade,
  analyzeEmeraldSeat,
  analyzeEmeraldCourt,
  buildEmeraldThroneResult,
  generateRecommendations,
} from '../src/commands/emerald-throne-helpers.js'
import {
  colorScore,
  colorCondition,
  colorCourtCondition,
  formatSeatTable,
  formatSeatsTable,
  formatCourtTable,
  formatCourtsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/emerald-throne-format-helpers.js'

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

// ─── measureRuling ──────────────────────────────────────────

describe('measureRuling', () => {
  it('returns a score for empty content', () => {
    const m = measureRuling('')
    expect(m.authority).toBeGreaterThanOrEqual(0)
    expect(typeof m.throne).toBe('string')
    expect(m.hasHighAuthority).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureRuling(richContent)
    expect(m.authority).toBe(100)
    expect(m.throne).toBe('supreme-authority')
    expect(m.hasHighAuthority).toBe(true)
    expect(m.hasExported).toBe(true)
    expect(m.hasNoHidden).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasClearAPI).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasDecisive).toBe(true)
    expect(m.hasTyped).toBe(true)
    expect(m.hasNamed).toBe(true)
    expect(m.hasCommanding).toBe(true)
  })

  it('detects hidden ts-ignore', () => {
    const m = measureRuling('// @ts-ignore')
    expect(m.hiddenCount).toBe(1)
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects hidden ts-expect-error', () => {
    const m = measureRuling('// @ts-expect-error')
    expect(m.hiddenCount).toBe(1)
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects undocumented functions', () => {
    const m = measureRuling('function foo() {}')
    expect(m.undocumentedCount).toBeGreaterThan(0)
    expect(m.hasNoUndocumented).toBe(false)
  })

  it('detects mystery API patterns', () => {
    const m = measureRuling('// mystery magic unexplained')
    expect(m.hasNoMysteryAPI).toBe(false)
  })

  it('detects contradictory patterns', () => {
    const m = measureRuling('// contradictory conflicting inconsistent')
    expect(m.hasNoContradictory).toBe(false)
  })

  it('detects ambiguous patterns', () => {
    const m = measureRuling('// ambiguous vague unclear')
    expect(m.hasNoAmbiguous).toBe(false)
  })

  it('detects untyped any usage', () => {
    const m = measureRuling('const x: any = 1')
    expect(m.hasNoUntyped).toBe(false)
  })

  it('detects anonymous patterns', () => {
    const m = measureRuling('// anonymous unnamed implicit')
    expect(m.hasNoAnonymous).toBe(false)
  })
})

// ─── measureJudging ──────────────────────────────────────────

describe('measureJudging', () => {
  it('returns a score for empty content', () => {
    const m = measureJudging('')
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
    expect(typeof m.court).toBe('string')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureJudging(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.court).toBe('supreme-court')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasStrategic).toBe(true)
  })

  it('detects hacked patterns', () => {
    const m = measureJudging('// hack workaround monkey')
    expect(m.hackedCount).toBe(3)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects ad-hoc any usage', () => {
    const m = measureJudging('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })

  it('detects experimental patterns', () => {
    const m = measureJudging('// experimental beta alpha')
    expect(m.hasNoExperimental).toBe(false)
  })

  it('detects shallow ts-ignore', () => {
    const m = measureJudging('// @ts-ignore')
    expect(m.hasNoShallow).toBe(false)
  })

  it('detects naive patterns', () => {
    const m = measureJudging('// naive simple basic')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects reinvented patterns', () => {
    const m = measureJudging('// reinvent rewrote redone')
    expect(m.hasNoReinvented).toBe(false)
  })

  it('detects obvious patterns', () => {
    const m = measureJudging('// trivial obvious duh')
    expect(m.hasNoObvious).toBe(false)
  })
})

// ─── measureCrowning ──────────────────────────────────────────

describe('measureCrowning', () => {
  it('returns a score for empty content', () => {
    const m = measureCrowning('')
    expect(m.precision).toBeGreaterThanOrEqual(0)
    expect(typeof m.crown).toBe('string')
    expect(m.hasHighPrecision).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureCrowning(richContent)
    expect(m.precision).toBe(100)
    expect(m.crown).toBe('perfect-fit')
    expect(m.hasHighPrecision).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasCorrect).toBe(true)
    expect(m.hasValidated).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasDefined).toBe(true)
    expect(m.hasSharp).toBe(true)
  })

  it('detects unsafe any usage', () => {
    const m = measureCrowning('const x: any = 1')
    expect(m.unsafeCount).toBe(1)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects wrong patterns', () => {
    const m = measureCrowning('// wrong incorrect error.prone')
    expect(m.hasNoWrong).toBe(false)
  })

  it('detects approximate patterns', () => {
    const m = measureCrowning('// approximate rough close.enough')
    expect(m.hasNoApproximate).toBe(false)
  })

  it('detects buggy patterns', () => {
    const m = measureCrowning('// buggy broken defective')
    expect(m.buggyCount).toBe(3)
    expect(m.hasNoBuggy).toBe(false)
  })

  it('detects assumed patterns', () => {
    const m = measureCrowning('// assume guess hope')
    expect(m.hasNoAssumed).toBe(false)
  })

  it('detects erratic var usage', () => {
    const m = measureCrowning('var x = 1')
    expect(m.hasNoErratic).toBe(false)
  })

  it('detects blurry patterns', () => {
    const m = measureCrowning('// blurry vague fuzzy')
    expect(m.hasNoBlurry).toBe(false)
  })
})

// ─── measureWielding ──────────────────────────────────────────

describe('measureWielding', () => {
  it('returns a score for empty content', () => {
    const m = measureWielding('')
    expect(m.resilience).toBeGreaterThanOrEqual(0)
    expect(typeof m.scepter).toBe('string')
    expect(m.hasHighResilience).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureWielding(richContent)
    expect(m.resilience).toBe(100)
    expect(m.scepter).toBe('unwavering-power')
    expect(m.hasHighResilience).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasRecoverable).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasPersistent).toBe(true)
    expect(m.hasEnduring).toBe(true)
  })

  it('detects bare crash eval usage', () => {
    const m = measureWielding('eval("code")')
    expect(m.bareCrashCount).toBe(1)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects untested var usage', () => {
    const m = measureWielding('var x = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
  })

  it('detects naive patterns', () => {
    const m = measureWielding('// trust assume hope')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects harsh fail patterns', () => {
    const m = measureWielding('// abort kill terminate')
    expect(m.hasNoHarshFail).toBe(false)
  })

  it('detects fatal patterns', () => {
    const m = measureWielding('// fatal panic crash')
    expect(m.hasNoFatal).toBe(false)
  })

  it('detects fragile var usage', () => {
    const m = measureWielding('var x = 1')
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects quitting patterns', () => {
    const m = measureWielding('// quit give.up surrender')
    expect(m.hasNoQuitting).toBe(false)
  })
})

// ─── measureReigning ──────────────────────────────────────────

describe('measureReigning', () => {
  it('returns a score for empty content', () => {
    const m = measureReigning('')
    expect(m.endurance).toBeGreaterThanOrEqual(0)
    expect(typeof m.dynasty).toBe('string')
    expect(m.hasHighEndurance).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureReigning(richContent)
    expect(m.endurance).toBe(100)
    expect(m.dynasty).toBe('eternal-dynasty')
    expect(m.hasHighEndurance).toBe(true)
    expect(m.hasMaintained).toBe(true)
    expect(m.hasStable).toBe(true)
    expect(m.hasEstablished).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasTimeless).toBe(true)
    expect(m.hasEnduring).toBe(true)
    expect(m.hasLegacy).toBe(true)
    expect(m.hasPerennial).toBe(true)
  })

  it('detects abandoned patterns', () => {
    const m = measureReigning('// abandoned forgotten neglected')
    expect(m.hasNoAbandoned).toBe(false)
  })

  it('detects volatile patterns', () => {
    const m = measureReigning('// volatile unstable changing')
    expect(m.volatileCount).toBe(3)
    expect(m.hasNoVolatile).toBe(false)
  })

  it('detects novel patterns', () => {
    const m = measureReigning('// novel experimental untested')
    expect(m.hasNoNovel).toBe(false)
  })

  it('detects experimental patterns', () => {
    const m = measureReigning('// experimental beta alpha')
    expect(m.experimentalCount).toBe(3)
    expect(m.hasNoExperimental).toBe(false)
  })

  it('detects faddish patterns', () => {
    const m = measureReigning('// faddish trendy hyped')
    expect(m.hasNoFaddish).toBe(false)
  })

  it('detects temporary patterns', () => {
    const m = measureReigning('// temporary ephemeral transient')
    expect(m.hasNoTemporary).toBe(false)
  })

  it('detects disposable patterns', () => {
    const m = measureReigning('// disposable throwaway single.use')
    expect(m.hasNoDisposable).toBe(false)
  })
})

// ─── Classifiers ──────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies emerald-masterpiece at 90+', () => {
    expect(classifyCondition(90)).toBe('emerald-masterpiece')
  })
  it('classifies royal-throne at 75-89', () => {
    expect(classifyCondition(75)).toBe('royal-throne')
  })
  it('classifies proper-seat at 60-74', () => {
    expect(classifyCondition(60)).toBe('proper-seat')
  })
  it('classifies wooden-chair at 40-59', () => {
    expect(classifyCondition(40)).toBe('wooden-chair')
  })
  it('classifies broken-stool at 20-39', () => {
    expect(classifyCondition(20)).toBe('broken-stool')
  })
  it('classifies void below 20', () => {
    expect(classifyCondition(0)).toBe('void')
  })
})

describe('classifyCourtType', () => {
  it('returns no-court for empty seats', () => {
    expect(classifyCourtType([])).toBe('no-court')
  })
  it('classifies grand-palace at avg 90+', () => {
    const seats = [{ qualityScore: 90 }, { qualityScore: 95 }].map((q) =>
      ({ ...q, file: '', gemAuthority: 0, throneWisdom: 0, crownPrecision: 0, scepterResilience: 0, dynastyEndurance: 0, ruling: {} as any, judging: {} as any, crowning: {} as any, wielding: {} as any, reigning: {} as any, condition: 'void' as const }),
    )
    expect(classifyCourtType(seats)).toBe('grand-palace')
  })
})

describe('classifyCourtCondition', () => {
  it('classifies emerald-palace at 85+', () => {
    expect(classifyCourtCondition(85)).toBe('emerald-palace')
  })
  it('classifies void below 15', () => {
    expect(classifyCourtCondition(0)).toBe('void')
  })
})

describe('classifyMonarchGrade', () => {
  it('classifies emperor at 80+', () => { expect(classifyMonarchGrade(80)).toBe('emperor') })
  it('classifies king at 65-79', () => { expect(classifyMonarchGrade(65)).toBe('king') })
  it('classifies duke at 50-64', () => { expect(classifyMonarchGrade(50)).toBe('duke') })
  it('classifies baron at 35-49', () => { expect(classifyMonarchGrade(35)).toBe('baron') })
  it('classifies knight at 20-34', () => { expect(classifyMonarchGrade(20)).toBe('knight') })
  it('classifies peasant below 20', () => { expect(classifyMonarchGrade(0)).toBe('peasant') })
})

// ─── analyzeEmeraldSeat ──────────────────────────────────────────

describe('analyzeEmeraldSeat', () => {
  it('analyzes minimal content', () => {
    const seat = analyzeEmeraldSeat(minimalContent, 'test.ts')
    expect(seat.file).toBe('test.ts')
    expect(seat.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('analyzes rich content with high scores', () => {
    const seat = analyzeEmeraldSeat(richContent, 'rich.ts')
    expect(seat.gemAuthority).toBe(100)
    expect(seat.throneWisdom).toBe(100)
    expect(seat.crownPrecision).toBe(100)
    expect(seat.scepterResilience).toBe(100)
    expect(seat.dynastyEndurance).toBe(100)
    expect(seat.qualityScore).toBe(100)
    expect(seat.condition).toBe('emerald-masterpiece')
  })

  it('preserves all measure data', () => {
    const seat = analyzeEmeraldSeat(richContent, 'full.ts')
    expect(seat.ruling).toBeDefined()
    expect(seat.judging).toBeDefined()
    expect(seat.crowning).toBeDefined()
    expect(seat.wielding).toBeDefined()
    expect(seat.reigning).toBeDefined()
  })
})

// ─── analyzeEmeraldCourt ──────────────────────────────────────────

describe('analyzeEmeraldCourt', () => {
  it('returns empty court for no seats', () => {
    const court = analyzeEmeraldCourt([], 'src')
    expect(court.directory).toBe('src')
    expect(court.seats).toHaveLength(0)
    expect(court.courtType).toBe('no-court')
    expect(court.condition).toBe('void')
  })

  it('computes court stats from seats', () => {
    const seats = [
      analyzeEmeraldSeat(richContent, 'src/a.ts'),
      analyzeEmeraldSeat(richContent, 'src/b.ts'),
    ]
    const court = analyzeEmeraldCourt(seats, 'src')
    expect(court.avgAuthority).toBe(100)
    expect(court.emeraldMasterpieceCount).toBe(2)
    expect(court.courtType).toBe('grand-palace')
    expect(court.condition).toBe('emerald-palace')
  })
})

// ─── buildEmeraldThroneResult ──────────────────────────────────────────

describe('buildEmeraldThroneResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildEmeraldThroneResult([], [])
    expect(result.seats).toHaveLength(0)
    expect(result.courts).toHaveLength(0)
    expect(result.kingdom.isEmerald).toBe(false)
    expect(result.stats.monarchGrade).toBe('peasant')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes single file', async () => {
    const result = await buildEmeraldThroneResult(['test.ts'], [richContent])
    expect(result.seats).toHaveLength(1)
    expect(result.courts).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into courts', async () => {
    const result = await buildEmeraldThroneResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.seats).toHaveLength(3)
    expect(result.courts).toHaveLength(2)
    expect(result.stats.totalCourts).toBe(2)
  })

  it('computes kingdom overview', async () => {
    const result = await buildEmeraldThroneResult(['app.ts'], [richContent])
    expect(result.kingdom.avgAuthority).toBeGreaterThan(0)
    expect(result.kingdom.isEmerald).toBe(true)
    expect(result.kingdom.overallSovereignty).toBeGreaterThan(0)
  })

  it('computes stats correctly', async () => {
    const result = await buildEmeraldThroneResult(['good.ts', 'bad.ts'], [richContent, ''])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.bestSeat).toBeTruthy()
    expect(result.stats.mostAuthoritative).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.mostEnduring).toBeTruthy()
  })

  it('handles missing content gracefully', async () => {
    const result = await buildEmeraldThroneResult(['missing.ts'], [])
    expect(result.seats).toHaveLength(1)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect recommendation for all 90+', () => {
    const seats = [analyzeEmeraldSeat(richContent, 'perfect.ts')]
    const courts = [analyzeEmeraldCourt(seats, 'src')]
    const kingdom = { avgAuthority: 95, avgPrecision: 95, avgWisdom: 95, isEmerald: true, overallSovereignty: 95 }
    const stats = {
      totalFiles: 1, totalCourts: 1,
      avgGemAuthority: 95, avgThroneWisdom: 95, avgCrownPrecision: 95,
      avgScepterResilience: 95, avgDynastyEndurance: 95,
      emeraldMasterpieceCount: 1, royalThroneCount: 0, properSeatCount: 0,
      woodenChairCount: 0, brokenStoolCount: 0, voidCount: 0,
      hasHighAuthorityCount: 1, hasHighWisdomCount: 1, hasHighPrecisionCount: 1,
      hasHighResilienceCount: 1, hasHighEnduranceCount: 1,
      overallSovereignty: 95, monarchGrade: 'emperor' as const,
      bestSeat: 'perfect.ts', mostAuthoritative: 'perfect.ts', wisest: 'perfect.ts',
      mostPrecise: 'perfect.ts', mostResilient: 'perfect.ts', mostEnduring: 'perfect.ts',
    }
    const recs = generateRecommendations(seats, courts, kingdom, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('sovereign perfection')
  })

  it('recommends improving low authority', () => {
    const seats = [analyzeEmeraldSeat('', 'empty.ts')]
    const courts = [analyzeEmeraldCourt(seats, '.')]
    const kingdom = { avgAuthority: 0, avgPrecision: 0, avgWisdom: 0, isEmerald: false, overallSovereignty: 0 }
    const stats = {
      totalFiles: 1, totalCourts: 1,
      avgGemAuthority: 0, avgThroneWisdom: 0, avgCrownPrecision: 0,
      avgScepterResilience: 0, avgDynastyEndurance: 0,
      emeraldMasterpieceCount: 0, royalThroneCount: 0, properSeatCount: 0,
      woodenChairCount: 0, brokenStoolCount: 0, voidCount: 1,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0, hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0, hasHighEnduranceCount: 0,
      overallSovereignty: 0, monarchGrade: 'peasant' as const,
      bestSeat: 'empty.ts', mostAuthoritative: 'empty.ts', wisest: 'empty.ts',
      mostPrecise: 'empty.ts', mostResilient: 'empty.ts', mostEnduring: 'empty.ts',
    }
    const recs = generateRecommendations(seats, courts, kingdom, stats)
    expect(recs.some((r) => r.includes('gem authority') || r.includes('command'))).toBe(true)
  })

  it('recommends improving low wisdom', () => {
    const kingdom = { avgAuthority: 70, avgPrecision: 70, avgWisdom: 50, isEmerald: false, overallSovereignty: 50 }
    const stats = {
      totalFiles: 1, totalCourts: 1,
      avgGemAuthority: 70, avgThroneWisdom: 50, avgCrownPrecision: 70,
      avgScepterResilience: 70, avgDynastyEndurance: 70,
      emeraldMasterpieceCount: 0, royalThroneCount: 0, properSeatCount: 0,
      woodenChairCount: 0, brokenStoolCount: 0, voidCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0, hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0, hasHighEnduranceCount: 0,
      overallSovereignty: 50, monarchGrade: 'duke' as const,
      bestSeat: '', mostAuthoritative: '', wisest: '', mostPrecise: '', mostResilient: '', mostEnduring: '',
    }
    const recs = generateRecommendations([], [], kingdom, stats)
    expect(recs.some((r) => r.includes('throne wisdom') || r.includes('Deepen'))).toBe(true)
  })

  it('recommends improving low precision', () => {
    const kingdom = { avgAuthority: 70, avgPrecision: 50, avgWisdom: 70, isEmerald: false, overallSovereignty: 50 }
    const stats = {
      totalFiles: 1, totalCourts: 1,
      avgGemAuthority: 70, avgThroneWisdom: 70, avgCrownPrecision: 50,
      avgScepterResilience: 70, avgDynastyEndurance: 70,
      emeraldMasterpieceCount: 0, royalThroneCount: 0, properSeatCount: 0,
      woodenChairCount: 0, brokenStoolCount: 0, voidCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0, hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0, hasHighEnduranceCount: 0,
      overallSovereignty: 50, monarchGrade: 'duke' as const,
      bestSeat: '', mostAuthoritative: '', wisest: '', mostPrecise: '', mostResilient: '', mostEnduring: '',
    }
    const recs = generateRecommendations([], [], kingdom, stats)
    expect(recs.some((r) => r.includes('crown precision') || r.includes('Refine'))).toBe(true)
  })

  it('recommends improving low resilience', () => {
    const kingdom = { avgAuthority: 70, avgPrecision: 70, avgWisdom: 70, isEmerald: false, overallSovereignty: 50 }
    const stats = {
      totalFiles: 1, totalCourts: 1,
      avgGemAuthority: 70, avgThroneWisdom: 70, avgCrownPrecision: 70,
      avgScepterResilience: 50, avgDynastyEndurance: 70,
      emeraldMasterpieceCount: 0, royalThroneCount: 0, properSeatCount: 0,
      woodenChairCount: 0, brokenStoolCount: 0, voidCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0, hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0, hasHighEnduranceCount: 0,
      overallSovereignty: 50, monarchGrade: 'duke' as const,
      bestSeat: '', mostAuthoritative: '', wisest: '', mostPrecise: '', mostResilient: '', mostEnduring: '',
    }
    const recs = generateRecommendations([], [], kingdom, stats)
    expect(recs.some((r) => r.includes('scepter') || r.includes('Fortify'))).toBe(true)
  })

  it('recommends improving low endurance', () => {
    const kingdom = { avgAuthority: 70, avgPrecision: 70, avgWisdom: 70, isEmerald: false, overallSovereignty: 50 }
    const stats = {
      totalFiles: 1, totalCourts: 1,
      avgGemAuthority: 70, avgThroneWisdom: 70, avgCrownPrecision: 70,
      avgScepterResilience: 70, avgDynastyEndurance: 50,
      emeraldMasterpieceCount: 0, royalThroneCount: 0, properSeatCount: 0,
      woodenChairCount: 0, brokenStoolCount: 0, voidCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0, hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0, hasHighEnduranceCount: 0,
      overallSovereignty: 50, monarchGrade: 'duke' as const,
      bestSeat: '', mostAuthoritative: '', wisest: '', mostPrecise: '', mostResilient: '', mostEnduring: '',
    }
    const recs = generateRecommendations([], [], kingdom, stats)
    expect(recs.some((r) => r.includes('dynasty endurance') || r.includes('dynasty'))).toBe(true)
  })

  it('warns about broken seats', () => {
    const seats = Array.from({ length: 6 }, (_, i) => analyzeEmeraldSeat('', `empty${i}.ts`))
    const courts = [analyzeEmeraldCourt(seats, '.')]
    const kingdom = { avgAuthority: 0, avgPrecision: 0, avgWisdom: 0, isEmerald: false, overallSovereignty: 0 }
    const stats = {
      totalFiles: 6, totalCourts: 1,
      avgGemAuthority: 0, avgThroneWisdom: 0, avgCrownPrecision: 0,
      avgScepterResilience: 0, avgDynastyEndurance: 0,
      emeraldMasterpieceCount: 0, royalThroneCount: 0, properSeatCount: 0,
      woodenChairCount: 0, brokenStoolCount: 0, voidCount: 6,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0, hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0, hasHighEnduranceCount: 0,
      overallSovereignty: 0, monarchGrade: 'peasant' as const,
      bestSeat: 'empty0.ts', mostAuthoritative: 'empty0.ts', wisest: 'empty0.ts',
      mostPrecise: 'empty0.ts', mostResilient: 'empty0.ts', mostEnduring: 'empty0.ts',
    }
    const recs = generateRecommendations(seats, courts, kingdom, stats)
    expect(recs.some((r) => r.includes('broken seats'))).toBe(true)
  })

  it('warns when all courts are poor', () => {
    const seats = [analyzeEmeraldSeat('', 'bad.ts')]
    const courts = [analyzeEmeraldCourt(seats, 'src')]
    const kingdom = { avgAuthority: 0, avgPrecision: 0, avgWisdom: 0, isEmerald: false, overallSovereignty: 0 }
    const stats = {
      totalFiles: 1, totalCourts: 1,
      avgGemAuthority: 0, avgThroneWisdom: 0, avgCrownPrecision: 0,
      avgScepterResilience: 0, avgDynastyEndurance: 0,
      emeraldMasterpieceCount: 0, royalThroneCount: 0, properSeatCount: 0,
      woodenChairCount: 0, brokenStoolCount: 0, voidCount: 1,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0, hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0, hasHighEnduranceCount: 0,
      overallSovereignty: 0, monarchGrade: 'peasant' as const,
      bestSeat: 'bad.ts', mostAuthoritative: 'bad.ts', wisest: 'bad.ts',
      mostPrecise: 'bad.ts', mostResilient: 'bad.ts', mostEnduring: 'bad.ts',
    }
    const recs = generateRecommendations(seats, courts, kingdom, stats)
    expect(recs.some((r) => r.includes('complete restoration'))).toBe(true)
  })

  it('gives positive recommendation when all measures pass', () => {
    const seats = [analyzeEmeraldSeat(richContent, 'good.ts')]
    const courts = [analyzeEmeraldCourt(seats, 'src')]
    const kingdom = { avgAuthority: 85, avgPrecision: 85, avgWisdom: 85, isEmerald: true, overallSovereignty: 85 }
    const stats = {
      totalFiles: 1, totalCourts: 1,
      avgGemAuthority: 85, avgThroneWisdom: 85, avgCrownPrecision: 85,
      avgScepterResilience: 85, avgDynastyEndurance: 85,
      emeraldMasterpieceCount: 0, royalThroneCount: 1, properSeatCount: 0,
      woodenChairCount: 0, brokenStoolCount: 0, voidCount: 0,
      hasHighAuthorityCount: 1, hasHighWisdomCount: 1, hasHighPrecisionCount: 1,
      hasHighResilienceCount: 1, hasHighEnduranceCount: 1,
      overallSovereignty: 85, monarchGrade: 'emperor' as const,
      bestSeat: 'good.ts', mostAuthoritative: 'good.ts', wisest: 'good.ts',
      mostPrecise: 'good.ts', mostResilient: 'good.ts', mostEnduring: 'good.ts',
    }
    const recs = generateRecommendations(seats, courts, kingdom, stats)
    expect(recs.some((r) => r.includes('emerald throne') || r.includes('sovereign'))).toBe(true)
  })
})

// ─── Format Helpers ──────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns strings for all conditions', () => {
    expect(typeof colorCondition('emerald-masterpiece')).toBe('string')
    expect(typeof colorCondition('royal-throne')).toBe('string')
    expect(typeof colorCondition('proper-seat')).toBe('string')
    expect(typeof colorCondition('wooden-chair')).toBe('string')
    expect(typeof colorCondition('broken-stool')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorCourtCondition', () => {
  it('returns strings for all conditions', () => {
    expect(typeof colorCourtCondition('emerald-palace')).toBe('string')
    expect(typeof colorCourtCondition('royal-court')).toBe('string')
    expect(typeof colorCourtCondition('proper-hall')).toBe('string')
    expect(typeof colorCourtCondition('modest-room')).toBe('string')
    expect(typeof colorCourtCondition('ruined-keep')).toBe('string')
    expect(typeof colorCourtCondition('void')).toBe('string')
  })
})

describe('formatSeatTable', () => {
  it('formats a seat', () => {
    const seat = analyzeEmeraldSeat(richContent, 'app.ts')
    const output = formatSeatTable(seat)
    expect(output).toContain('app.ts')
    expect(output).toContain('Gem Authority')
    expect(output).toContain('Throne Wisdom')
    expect(output).toContain('Crown Precision')
    expect(output).toContain('Scepter Resilience')
    expect(output).toContain('Dynasty Endurance')
  })
})

describe('formatSeatsTable', () => {
  it('formats empty seats', () => {
    expect(formatSeatsTable([])).toContain('No emerald seats found')
  })
  it('formats seats table', () => {
    const seats = [analyzeEmeraldSeat(richContent, 'app.ts')]
    expect(formatSeatsTable(seats)).toContain('app.ts')
  })
})

describe('formatCourtTable', () => {
  it('formats a court', () => {
    const seats = [analyzeEmeraldSeat(richContent, 'src/app.ts')]
    const court = analyzeEmeraldCourt(seats, 'src')
    const output = formatCourtTable(court)
    expect(output).toContain('src')
    expect(output).toContain('Avg Authority')
  })
})

describe('formatCourtsTable', () => {
  it('formats empty courts', () => {
    expect(formatCourtsTable([])).toContain('No emerald courts found')
  })
  it('formats courts table', () => {
    const seats = [analyzeEmeraldSeat(richContent, 'src/app.ts')]
    const courts = [analyzeEmeraldCourt(seats, 'src')]
    expect(formatCourtsTable(courts)).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildEmeraldThroneResult(['app.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Emerald Throne Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Overall Sovereignty')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildEmeraldThroneResult(['app.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Emerald Throne Analysis')
    expect(output).toContain('Kingdom Overview')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildEmeraldThroneResult(['app.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.seats).toHaveLength(1)
    expect(parsed.courts).toBeDefined()
    expect(parsed.kingdom).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
