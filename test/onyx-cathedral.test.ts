import { describe, it, expect } from 'vitest'
import {
  measureClarifying,
  measureEnduring,
  measureReflecting,
  measureCutting,
  measureKnowing,
  classifyCondition,
  classifyNaveType,
  classifyNaveCondition,
  classifyArchitectGrade,
  analyzeOnyxPillar,
  analyzeOnyxNave,
  buildOnyxCathedralResult,
  generateRecommendations,
} from '../src/commands/onyx-cathedral-helpers.js'
import {
  colorScore,
  colorCondition,
  colorNaveCondition,
  formatPillarTable,
  formatPillarsTable,
  formatNaveTable,
  formatNavesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/onyx-cathedral-format-helpers.js'

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

// ─── measureClarifying ──────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns 0 for empty content', () => {
    const m = measureClarifying('')
    expect(m.clarity).toBe(0)
    expect(m.glass).toBe('no-clarity')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBe(0)
    expect(m.hasReadable).toBe(false)
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasClear).toBe(false)
    expect(m.hasTransparent).toBe(false)
    expect(m.hasUnderstandable).toBe(false)
    expect(m.crypticCount).toBe(0)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBe(100)
    expect(m.glass).toBe('flawless-mirror')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasDirect).toBe(true)
    expect(m.hasLuminous).toBe(true)
    expect(m.hasRevealing).toBe(true)
  })

  it('detects cryptic eval usage', () => {
    const m = measureClarifying('eval("code")')
    expect(m.crypticCount).toBe(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated any usage', () => {
    const m = measureClarifying('const x: any = 1')
    expect(m.obfuscatedCount).toBe(1)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('detects mystery patterns negatively', () => {
    const m = measureClarifying('// mystery magic code')
    expect(m.hasNoMystery).toBe(false)
  })

  it('detects hidden ts-ignore patterns', () => {
    const m = measureClarifying('// @ts-ignore')
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects arcane patterns negatively', () => {
    const m = measureClarifying('// arcane esoteric cryptic')
    expect(m.hasNoArcane).toBe(false)
  })

  it('detects circuit patterns negatively', () => {
    const m = measureClarifying('// circuit spaghetti tangle')
    expect(m.hasNoCircuits).toBe(false)
  })

  it('detects opaque patterns negatively', () => {
    const m = measureClarifying('// opaque impenetrable dense')
    expect(m.hasNoOpaque).toBe(false)
  })

  it('classifies glass levels correctly', () => {
    expect(measureClarifying(richContent).glass).toBe('flawless-mirror')
    expect(measureClarifying('').glass).toBe('no-clarity')
  })
})

// ─── measureEnduring ──────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns 0 for empty content', () => {
    const m = measureEnduring('')
    expect(m.resilience).toBe(0)
    expect(m.shadow).toBe('no-resilience')
    expect(m.hasHighResilience).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureEnduring(minimalContent)
    expect(m.resilience).toBe(0)
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasTested).toBe(false)
    expect(m.hasDefensive).toBe(false)
    expect(m.bareCrashCount).toBe(0)
    expect(m.untestedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBe(100)
    expect(m.shadow).toBe('shadow-master')
    expect(m.hasHighResilience).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasRecoverable).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasFearless).toBe(true)
  })

  it('detects bare crash eval usage', () => {
    const m = measureEnduring('eval("code")')
    expect(m.bareCrashCount).toBe(1)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects untested var usage', () => {
    const m = measureEnduring('var x = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
  })

  it('detects naive trust patterns', () => {
    const m = measureEnduring('// trust assume hope')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects unsafe any usage', () => {
    const m = measureEnduring('const x: any = 1')
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects harsh fail patterns', () => {
    const m = measureEnduring('// abort kill terminate')
    expect(m.hasNoHarshFail).toBe(false)
  })

  it('detects fatal patterns', () => {
    const m = measureEnduring('// fatal panic crash')
    expect(m.hasNoFatal).toBe(false)
  })

  it('detects fragile var patterns', () => {
    const m = measureEnduring('var x = 1')
    expect(m.hasNoFragile).toBe(false)
  })

  it('classifies shadow levels correctly', () => {
    expect(measureEnduring(richContent).shadow).toBe('shadow-master')
    expect(measureEnduring('').shadow).toBe('no-resilience')
  })
})

// ─── measureReflecting ──────────────────────────────────────────

describe('measureReflecting', () => {
  it('returns low score for empty content', () => {
    const m = measureReflecting('')
    expect(m.depth).toBeGreaterThan(0)
    expect(m.mirror).toBe('broken-glass')
    expect(m.hasHighDepth).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureReflecting(minimalContent)
    expect(m.depth).toBeGreaterThan(0)
    expect(m.hasSelfAware).toBe(false)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasHonest).toBe(false)
    expect(m.blindCount).toBe(0)
    expect(m.contradictoryCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureReflecting(richContent)
    expect(m.depth).toBe(100)
    expect(m.mirror).toBe('true-reflection')
    expect(m.hasHighDepth).toBe(true)
    expect(m.hasSelfAware).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasHonest).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasPure).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasTruthful).toBe(true)
  })

  it('detects blind patterns', () => {
    const m = measureReflecting('// blind ignorant unaware')
    expect(m.blindCount).toBe(3)
    expect(m.hasNoBlind).toBe(false)
  })

  it('detects contradictory patterns', () => {
    const m = measureReflecting('// contradict conflict clash')
    expect(m.contradictoryCount).toBe(3)
    expect(m.hasNoContradictory).toBe(false)
  })

  it('detects deceptive patterns', () => {
    const m = measureReflecting('// cheat fake deceive')
    expect(m.hasNoDeceptive).toBe(false)
  })

  it('detects contaminated ts-expect-error', () => {
    const m = measureReflecting('// @ts-expect-error')
    expect(m.hasNoContaminated).toBe(false)
  })

  it('detects dirty patterns', () => {
    const m = measureReflecting('// dirty messy hacky')
    expect(m.hasNoDirty).toBe(false)
  })

  it('detects ad hoc any usage', () => {
    const m = measureReflecting('const x: any = 1')
    expect(m.hasNoAdHoc).toBe(false)
  })

  it('handles undocumented functions without docs', () => {
    const m = measureReflecting('function foo() { return 1 }')
    expect(m.hasNoUndocumented).toBe(false)
  })

  it('classifies mirror levels correctly', () => {
    expect(measureReflecting(richContent).mirror).toBe('true-reflection')
    expect(measureReflecting('').mirror).toBe('broken-glass')
  })
})

// ─── measureCutting ──────────────────────────────────────────

describe('measureCutting', () => {
  it('returns 0 for empty content', () => {
    const m = measureCutting('')
    expect(m.precision).toBe(0)
    expect(m.blade).toBe('no-precision')
    expect(m.hasHighPrecision).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureCutting(minimalContent)
    expect(m.precision).toBeGreaterThan(0)
    expect(m.hasAccurate).toBe(false)
    expect(m.hasExact).toBe(false)
    expect(m.hasCorrect).toBe(false)
    expect(m.wrongCount).toBe(0)
    expect(m.buggyCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureCutting(richContent)
    expect(m.precision).toBe(100)
    expect(m.blade).toBe('obsidian-scalpel')
    expect(m.hasHighPrecision).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasCorrect).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasValidated).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasDeterministic).toBe(true)
    expect(m.hasPrecise).toBe(true)
  })

  it('detects wrong patterns', () => {
    const m = measureCutting('// wrong incorrect mistake')
    expect(m.wrongCount).toBe(3)
    expect(m.hasNoWrong).toBe(false)
  })

  it('detects buggy patterns', () => {
    const m = measureCutting('// bug fixme')
    expect(m.buggyCount).toBe(2)
    expect(m.hasNoBuggy).toBe(false)
  })

  it('detects approximate patterns', () => {
    const m = measureCutting('// approximate rough guess')
    expect(m.hasNoApproximate).toBe(false)
  })

  it('detects assumed patterns', () => {
    const m = measureCutting('// assume guess hope')
    expect(m.hasNoAssumed).toBe(false)
  })

  it('detects erratic var patterns', () => {
    const m = measureCutting('var x = 1')
    expect(m.hasNoErratic).toBe(false)
  })

  it('detects random patterns', () => {
    const m = measureCutting('Math.random()')
    expect(m.hasNoRandom).toBe(false)
  })

  it('detects casting any patterns', () => {
    const m = measureCutting('const x: any = 1')
    expect(m.hasNoCasting).toBe(false)
  })

  it('classifies blade levels correctly', () => {
    expect(measureCutting(richContent).blade).toBe('obsidian-scalpel')
    expect(measureCutting('').blade).toBe('no-precision')
  })
})

// ─── measureKnowing ──────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns 0 for empty content', () => {
    const m = measureKnowing('')
    expect(m.wisdom).toBe(0)
    expect(m['void']).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureKnowing(minimalContent)
    expect(m.wisdom).toBe(0)
    expect(m.hasWellArchitected).toBe(false)
    expect(m.hasPrincipled).toBe(false)
    expect(m.hasPatterned).toBe(false)
    expect(m.hackedCount).toBe(0)
    expect(m.adHocCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureKnowing(richContent)
    expect(m.wisdom).toBe(100)
    expect(m['void']).toBe('cosmic-void')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasVisionary).toBe(true)
  })

  it('detects hacked patterns', () => {
    const m = measureKnowing('// hack workaround monkey')
    expect(m.hackedCount).toBe(3)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects ad hoc any usage', () => {
    const m = measureKnowing('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })

  it('detects reinvented patterns', () => {
    const m = measureKnowing('// reinvent rewrote redone')
    expect(m.hasNoReinvented).toBe(false)
  })

  it('detects shallow ts-ignore', () => {
    const m = measureKnowing('// @ts-ignore')
    expect(m.hasNoShallow).toBe(false)
  })

  it('detects experimental patterns', () => {
    const m = measureKnowing('// experimental beta alpha')
    expect(m.hasNoExperimental).toBe(false)
  })

  it('detects naive patterns', () => {
    const m = measureKnowing('// naive simple basic')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects obvious patterns', () => {
    const m = measureKnowing('// trivial obvious duh')
    expect(m.hasNoObvious).toBe(false)
  })

  it('classifies void levels correctly', () => {
    expect(measureKnowing(richContent)['void']).toBe('cosmic-void')
    expect(measureKnowing('')['void']).toBe('no-wisdom')
  })
})

// ─── Classifiers ──────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies onyx-masterpiece for 90+', () => {
    expect(classifyCondition(90)).toBe('onyx-masterpiece')
    expect(classifyCondition(100)).toBe('onyx-masterpiece')
  })

  it('classifies dark-sanctuary for 75-89', () => {
    expect(classifyCondition(75)).toBe('dark-sanctuary')
    expect(classifyCondition(89)).toBe('dark-sanctuary')
  })

  it('classifies proper-temple for 60-74', () => {
    expect(classifyCondition(60)).toBe('proper-temple')
    expect(classifyCondition(74)).toBe('proper-temple')
  })

  it('classifies crumbling-stone for 40-59', () => {
    expect(classifyCondition(40)).toBe('crumbling-stone')
    expect(classifyCondition(59)).toBe('crumbling-stone')
  })

  it('classifies shattered-ruin for 20-39', () => {
    expect(classifyCondition(20)).toBe('shattered-ruin')
    expect(classifyCondition(39)).toBe('shattered-ruin')
  })

  it('classifies void for 0-19', () => {
    expect(classifyCondition(0)).toBe('void')
    expect(classifyCondition(19)).toBe('void')
  })
})

describe('classifyNaveType', () => {
  it('returns no-nave for empty pillars', () => {
    expect(classifyNaveType([])).toBe('no-nave')
  })

  it('returns grand-cathedral for avg 90+', () => {
    const pillars = [{ qualityScore: 95 }, { qualityScore: 92 }].map((q) => ({ ...q, file: '', obsidianClarity: 0, darkResilience: 0, mirrorDepth: 0, midnightPrecision: 0, voidWisdom: 0, clarifying: {} as any, enduring: {} as any, reflecting: {} as any, cutting: {} as any, knowing: {} as any, condition: 'onyx-masterpiece' as const }))
    expect(classifyNaveType(pillars)).toBe('grand-cathedral')
  })
})

describe('classifyNaveCondition', () => {
  it('classifies obsidian-basilica for 85+', () => {
    expect(classifyNaveCondition(85)).toBe('obsidian-basilica')
    expect(classifyNaveCondition(100)).toBe('obsidian-basilica')
  })

  it('classifies dark-temple for 70-84', () => {
    expect(classifyNaveCondition(70)).toBe('dark-temple')
    expect(classifyNaveCondition(84)).toBe('dark-temple')
  })

  it('classifies proper-chapel for 55-69', () => {
    expect(classifyNaveCondition(55)).toBe('proper-chapel')
    expect(classifyNaveCondition(69)).toBe('proper-chapel')
  })

  it('classifies crumbling-ruin for 35-54', () => {
    expect(classifyNaveCondition(35)).toBe('crumbling-ruin')
    expect(classifyNaveCondition(54)).toBe('crumbling-ruin')
  })

  it('classifies shattered-vestibule for 15-34', () => {
    expect(classifyNaveCondition(15)).toBe('shattered-vestibule')
    expect(classifyNaveCondition(34)).toBe('shattered-vestibule')
  })

  it('classifies void for 0-14', () => {
    expect(classifyNaveCondition(0)).toBe('void')
    expect(classifyNaveCondition(14)).toBe('void')
  })
})

describe('classifyArchitectGrade', () => {
  it('classifies dark-architect for 80+', () => {
    expect(classifyArchitectGrade(80)).toBe('dark-architect')
    expect(classifyArchitectGrade(100)).toBe('dark-architect')
  })

  it('classifies shadow-builder for 65-79', () => {
    expect(classifyArchitectGrade(65)).toBe('shadow-builder')
    expect(classifyArchitectGrade(79)).toBe('shadow-builder')
  })

  it('classifies stone-mason for 50-64', () => {
    expect(classifyArchitectGrade(50)).toBe('stone-mason')
    expect(classifyArchitectGrade(64)).toBe('stone-mason')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyArchitectGrade(35)).toBe('apprentice')
    expect(classifyArchitectGrade(49)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyArchitectGrade(20)).toBe('novice')
    expect(classifyArchitectGrade(34)).toBe('novice')
  })

  it('classifies blind-walker for 0-19', () => {
    expect(classifyArchitectGrade(0)).toBe('blind-walker')
    expect(classifyArchitectGrade(19)).toBe('blind-walker')
  })
})

// ─── analyzeOnyxPillar ──────────────────────────────────────────

describe('analyzeOnyxPillar', () => {
  it('analyzes empty content', () => {
    const p = analyzeOnyxPillar('', 'empty.ts')
    expect(p.file).toBe('empty.ts')
    expect(p.obsidianClarity).toBe(0)
    expect(p.darkResilience).toBe(0)
    expect(p.mirrorDepth).toBeGreaterThan(0)
    expect(p.midnightPrecision).toBe(0)
    expect(p.voidWisdom).toBe(0)
    expect(p.qualityScore).toBeGreaterThan(0)
    expect(p.condition).toBe('void')
  })

  it('analyzes rich content', () => {
    const p = analyzeOnyxPillar(richContent, 'rich.ts')
    expect(p.file).toBe('rich.ts')
    expect(p.obsidianClarity).toBe(100)
    expect(p.darkResilience).toBe(100)
    expect(p.mirrorDepth).toBe(100)
    expect(p.midnightPrecision).toBe(100)
    expect(p.voidWisdom).toBe(100)
    expect(p.qualityScore).toBe(100)
    expect(p.condition).toBe('onyx-masterpiece')
  })

  it('computes qualityScore as weighted average', () => {
    const p = analyzeOnyxPillar('export function add(): number { return 1 }', 'mid.ts')
    expect(p.qualityScore).toBeGreaterThan(0)
    expect(p.qualityScore).toBeLessThanOrEqual(100)
  })

  it('includes all measures', () => {
    const p = analyzeOnyxPillar(richContent, 'all.ts')
    expect(p.clarifying).toBeDefined()
    expect(p.enduring).toBeDefined()
    expect(p.reflecting).toBeDefined()
    expect(p.cutting).toBeDefined()
    expect(p.knowing).toBeDefined()
  })
})

// ─── analyzeOnyxNave ──────────────────────────────────────────

describe('analyzeOnyxNave', () => {
  it('returns empty nave for no pillars', () => {
    const n = analyzeOnyxNave([], 'src')
    expect(n.directory).toBe('src')
    expect(n.pillars).toHaveLength(0)
    expect(n.avgClarity).toBe(0)
    expect(n.avgPrecision).toBe(0)
    expect(n.avgWisdom).toBe(0)
    expect(n.onyxMasterpieceCount).toBe(0)
    expect(n.voidCount).toBe(0)
    expect(n.naveType).toBe('no-nave')
    expect(n.condition).toBe('void')
  })

  it('computes averages from pillars', () => {
    const pillars = [
      analyzeOnyxPillar(richContent, 'src/a.ts'),
      analyzeOnyxPillar(richContent, 'src/b.ts'),
    ]
    const n = analyzeOnyxNave(pillars, 'src')
    expect(n.directory).toBe('src')
    expect(n.avgClarity).toBe(100)
    expect(n.avgPrecision).toBe(100)
    expect(n.avgWisdom).toBe(100)
    expect(n.onyxMasterpieceCount).toBe(2)
    expect(n.voidCount).toBe(0)
  })

  it('counts onyx masterpieces and voids', () => {
    const rich = analyzeOnyxPillar(richContent, 'src/good.ts')
    const empty = analyzeOnyxPillar('', 'src/bad.ts')
    const n = analyzeOnyxNave([rich, empty], 'src')
    expect(n.onyxMasterpieceCount).toBeGreaterThanOrEqual(1)
    expect(n.voidCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── buildOnyxCathedralResult ──────────────────────────────────────────

describe('buildOnyxCathedralResult', () => {
  it('handles empty input', async () => {
    const r = await buildOnyxCathedralResult([], [])
    expect(r.pillars).toHaveLength(0)
    expect(r.naves).toHaveLength(0)
    expect(r.darkness.avgClarity).toBe(0)
    expect(r.darkness.avgPrecision).toBe(0)
    expect(r.darkness.avgWisdom).toBe(0)
    expect(r.darkness.overallDepth).toBe(0)
    expect(r.darkness.isOnyx).toBe(false)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.totalNaves).toBe(0)
  })

  it('analyzes single file', async () => {
    const r = await buildOnyxCathedralResult(['test.ts'], [richContent])
    expect(r.pillars).toHaveLength(1)
    expect(r.pillars[0].file).toBe('test.ts')
    expect(r.naves).toHaveLength(1)
    expect(r.darkness.isOnyx).toBe(true)
    expect(r.stats.totalFiles).toBe(1)
  })

  it('groups files by directory', async () => {
    const r = await buildOnyxCathedralResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(r.pillars).toHaveLength(3)
    expect(r.naves).toHaveLength(2)
  })

  it('computes stats correctly', async () => {
    const r = await buildOnyxCathedralResult(
      ['good.ts', 'bad.ts'],
      [richContent, ''],
    )
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.avgObsidianClarity).toBeGreaterThan(0)
    expect(r.stats.architectGrade).toBeDefined()
    expect(r.stats.bestPillar).toBeDefined()
    expect(r.stats.clearest).toBeDefined()
    expect(r.stats.mostResilient).toBeDefined()
    expect(r.stats.deepest).toBeDefined()
    expect(r.stats.sharpest).toBeDefined()
    expect(r.stats.wisest).toBeDefined()
  })

  it('computes high counts', async () => {
    const r = await buildOnyxCathedralResult(['a.ts'], [richContent])
    expect(r.stats.hasHighClarityCount).toBeGreaterThan(0)
    expect(r.stats.hasHighResilienceCount).toBeGreaterThan(0)
    expect(r.stats.hasHighDepthCount).toBeGreaterThan(0)
    expect(r.stats.hasHighPrecisionCount).toBeGreaterThan(0)
    expect(r.stats.hasHighWisdomCount).toBeGreaterThan(0)
  })

  it('computes condition counts', async () => {
    const r = await buildOnyxCathedralResult(['a.ts'], [richContent])
    expect(r.stats.onyxMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.darkSanctuaryCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.properTempleCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.crumblingStoneCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.shatteredRuinCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.voidCount).toBeGreaterThanOrEqual(0)
  })

  it('finds best pillar and extremes', async () => {
    const r = await buildOnyxCathedralResult(
      ['high.ts', 'low.ts'],
      [richContent, ''],
    )
    expect(r.stats.bestPillar).toBe('high.ts')
    expect(r.stats.clearest).toBe('high.ts')
    expect(r.stats.mostResilient).toBe('high.ts')
    expect(r.stats.deepest).toBe('high.ts')
    expect(r.stats.sharpest).toBe('high.ts')
    expect(r.stats.wisest).toBe('high.ts')
  })
})

// ─── generateRecommendations ──────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends perfection for all-100 stats', () => {
    const pillars = [analyzeOnyxPillar(richContent, 'a.ts')]
    const naves = [analyzeOnyxNave(pillars, '.')]
    const darkness = { avgClarity: 100, avgPrecision: 100, avgWisdom: 100, isOnyx: true, overallDepth: 100 }
    const stats = {
      totalFiles: 1, totalNaves: 1,
      avgObsidianClarity: 100, avgDarkResilience: 100, avgMirrorDepth: 100,
      avgMidnightPrecision: 100, avgVoidWisdom: 100,
      onyxMasterpieceCount: 1, darkSanctuaryCount: 0, properTempleCount: 0,
      crumblingStoneCount: 0, shatteredRuinCount: 0, voidCount: 0,
      hasHighClarityCount: 1, hasHighResilienceCount: 1, hasHighDepthCount: 1,
      hasHighPrecisionCount: 1, hasHighWisdomCount: 1,
      overallDepth: 100, architectGrade: 'dark-architect' as const,
      bestPillar: 'a.ts', clearest: 'a.ts', mostResilient: 'a.ts',
      deepest: 'a.ts', sharpest: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations(pillars, naves, darkness, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfect dark brilliance')
  })

  it('recommends polishing when clarity is low', () => {
    const pillars = [analyzeOnyxPillar('', 'a.ts')]
    const naves = [analyzeOnyxNave(pillars, '.')]
    const darkness = { avgClarity: 0, avgPrecision: 0, avgWisdom: 0, isOnyx: false, overallDepth: 0 }
    const stats = {
      totalFiles: 1, totalNaves: 1,
      avgObsidianClarity: 0, avgDarkResilience: 0, avgMirrorDepth: 0,
      avgMidnightPrecision: 0, avgVoidWisdom: 0,
      onyxMasterpieceCount: 0, darkSanctuaryCount: 0, properTempleCount: 0,
      crumblingStoneCount: 0, shatteredRuinCount: 0, voidCount: 1,
      hasHighClarityCount: 0, hasHighResilienceCount: 0, hasHighDepthCount: 0,
      hasHighPrecisionCount: 0, hasHighWisdomCount: 0,
      overallDepth: 0, architectGrade: 'blind-walker' as const,
      bestPillar: 'a.ts', clearest: 'a.ts', mostResilient: 'a.ts',
      deepest: 'a.ts', sharpest: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations(pillars, naves, darkness, stats)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.some((r) => r.includes('obsidian clarity'))).toBe(true)
  })

  it('recommends restoring void pillars (few)', () => {
    const voidPillars = Array.from({ length: 3 }, (_, i) =>
      analyzeOnyxPillar('', `void${i}.ts`),
    )
    const naves = [analyzeOnyxNave(voidPillars, '.')]
    const darkness = { avgClarity: 0, avgPrecision: 0, avgWisdom: 0, isOnyx: false, overallDepth: 0 }
    const stats = {
      totalFiles: 3, totalNaves: 1,
      avgObsidianClarity: 0, avgDarkResilience: 0, avgMirrorDepth: 0,
      avgMidnightPrecision: 0, avgVoidWisdom: 0,
      onyxMasterpieceCount: 0, darkSanctuaryCount: 0, properTempleCount: 0,
      crumblingStoneCount: 0, shatteredRuinCount: 0, voidCount: 3,
      hasHighClarityCount: 0, hasHighResilienceCount: 0, hasHighDepthCount: 0,
      hasHighPrecisionCount: 0, hasHighWisdomCount: 0,
      overallDepth: 0, architectGrade: 'blind-walker' as const,
      bestPillar: '', clearest: '', mostResilient: '',
      deepest: '', sharpest: '', wisest: '',
    }
    const recs = generateRecommendations(voidPillars, naves, darkness, stats)
    expect(recs.some((r) => r.includes('Restore these shattered pillars'))).toBe(true)
  })

  it('recommends restoring void pillars (many)', () => {
    const voidPillars = Array.from({ length: 10 }, (_, i) =>
      analyzeOnyxPillar('', `void${i}.ts`),
    )
    const naves = [analyzeOnyxNave(voidPillars, '.')]
    const darkness = { avgClarity: 0, avgPrecision: 0, avgWisdom: 0, isOnyx: false, overallDepth: 0 }
    const stats = {
      totalFiles: 10, totalNaves: 1,
      avgObsidianClarity: 0, avgDarkResilience: 0, avgMirrorDepth: 0,
      avgMidnightPrecision: 0, avgVoidWisdom: 0,
      onyxMasterpieceCount: 0, darkSanctuaryCount: 0, properTempleCount: 0,
      crumblingStoneCount: 0, shatteredRuinCount: 0, voidCount: 10,
      hasHighClarityCount: 0, hasHighResilienceCount: 0, hasHighDepthCount: 0,
      hasHighPrecisionCount: 0, hasHighWisdomCount: 0,
      overallDepth: 0, architectGrade: 'blind-walker' as const,
      bestPillar: '', clearest: '', mostResilient: '',
      deepest: '', sharpest: '', wisest: '',
    }
    const recs = generateRecommendations(voidPillars, naves, darkness, stats)
    expect(recs.some((r) => r.includes('10 shattered pillars'))).toBe(true)
  })

  it('recommends complete restoration when all naves are poor', () => {
    const pillars = [analyzeOnyxPillar('', 'a.ts')]
    const naves = [analyzeOnyxNave(pillars, '.')]
    const darkness = { avgClarity: 0, avgPrecision: 0, avgWisdom: 0, isOnyx: false, overallDepth: 0 }
    const stats = {
      totalFiles: 1, totalNaves: 1,
      avgObsidianClarity: 0, avgDarkResilience: 0, avgMirrorDepth: 0,
      avgMidnightPrecision: 0, avgVoidWisdom: 0,
      onyxMasterpieceCount: 0, darkSanctuaryCount: 0, properTempleCount: 0,
      crumblingStoneCount: 0, shatteredRuinCount: 0, voidCount: 1,
      hasHighClarityCount: 0, hasHighResilienceCount: 0, hasHighDepthCount: 0,
      hasHighPrecisionCount: 0, hasHighWisdomCount: 0,
      overallDepth: 0, architectGrade: 'blind-walker' as const,
      bestPillar: 'a.ts', clearest: 'a.ts', mostResilient: 'a.ts',
      deepest: 'a.ts', sharpest: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations(pillars, naves, darkness, stats)
    expect(recs.some((r) => r.includes('complete restoration'))).toBe(true)
  })

  it('returns default positive when no issues', () => {
    const pillars = [analyzeOnyxPillar(richContent, 'a.ts')]
    const naves = [analyzeOnyxNave(pillars, '.')]
    const darkness = { avgClarity: 100, avgPrecision: 100, avgWisdom: 100, isOnyx: true, overallDepth: 100 }
    const stats = {
      totalFiles: 1, totalNaves: 1,
      avgObsidianClarity: 100, avgDarkResilience: 100, avgMirrorDepth: 100,
      avgMidnightPrecision: 100, avgVoidWisdom: 100,
      onyxMasterpieceCount: 1, darkSanctuaryCount: 0, properTempleCount: 0,
      crumblingStoneCount: 0, shatteredRuinCount: 0, voidCount: 0,
      hasHighClarityCount: 1, hasHighResilienceCount: 1, hasHighDepthCount: 1,
      hasHighPrecisionCount: 1, hasHighWisdomCount: 1,
      overallDepth: 100, architectGrade: 'dark-architect' as const,
      bestPillar: 'a.ts', clearest: 'a.ts', mostResilient: 'a.ts',
      deepest: 'a.ts', sharpest: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations(pillars, naves, darkness, stats)
    expect(recs).toHaveLength(1)
  })
})

// ─── Format Helpers ──────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns string for all conditions', () => {
    expect(typeof colorCondition('onyx-masterpiece')).toBe('string')
    expect(typeof colorCondition('dark-sanctuary')).toBe('string')
    expect(typeof colorCondition('proper-temple')).toBe('string')
    expect(typeof colorCondition('crumbling-stone')).toBe('string')
    expect(typeof colorCondition('shattered-ruin')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorNaveCondition', () => {
  it('returns string for all nave conditions', () => {
    expect(typeof colorNaveCondition('obsidian-basilica')).toBe('string')
    expect(typeof colorNaveCondition('dark-temple')).toBe('string')
    expect(typeof colorNaveCondition('proper-chapel')).toBe('string')
    expect(typeof colorNaveCondition('crumbling-ruin')).toBe('string')
    expect(typeof colorNaveCondition('shattered-vestibule')).toBe('string')
    expect(typeof colorNaveCondition('void')).toBe('string')
    expect(typeof colorNaveCondition('unknown')).toBe('string')
  })
})

describe('formatPillarTable', () => {
  it('formats a pillar', () => {
    const p = analyzeOnyxPillar(richContent, 'test.ts')
    const out = formatPillarTable(p)
    expect(out).toContain('test.ts')
    expect(out).toContain('Obsidian Clarity')
    expect(out).toContain('Quality Score')
  })
})

describe('formatPillarsTable', () => {
  it('handles empty pillars', () => {
    expect(formatPillarsTable([])).toContain('No onyx pillars')
  })

  it('formats multiple pillars', () => {
    const pillars = [
      analyzeOnyxPillar(richContent, 'a.ts'),
      analyzeOnyxPillar(richContent, 'b.ts'),
    ]
    const out = formatPillarsTable(pillars)
    expect(out).toContain('Onyx Pillars')
    expect(out).toContain('a.ts')
    expect(out).toContain('b.ts')
  })
})

describe('formatNaveTable', () => {
  it('formats a nave', () => {
    const pillars = [analyzeOnyxPillar(richContent, 'src/a.ts')]
    const n = analyzeOnyxNave(pillars, 'src')
    const out = formatNaveTable(n)
    expect(out).toContain('src')
    expect(out).toContain('Pillars')
    expect(out).toContain('Nave Type')
  })
})

describe('formatNavesTable', () => {
  it('handles empty naves', () => {
    expect(formatNavesTable([])).toContain('No onyx naves')
  })

  it('formats multiple naves', () => {
    const p1 = [analyzeOnyxPillar(richContent, 'src/a.ts')]
    const p2 = [analyzeOnyxPillar(richContent, 'lib/b.ts')]
    const naves = [
      analyzeOnyxNave(p1, 'src'),
      analyzeOnyxNave(p2, 'lib'),
    ]
    const out = formatNavesTable(naves)
    expect(out).toContain('Onyx Naves')
    expect(out).toContain('src')
    expect(out).toContain('lib')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const r = await buildOnyxCathedralResult(['a.ts'], [richContent])
    const out = formatStatsTable(r.stats)
    expect(out).toContain('Total Files')
    expect(out).toContain('Architect Grade')
    expect(out).toContain('Best Pillar')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const out = formatRecommendations(['Fix A', 'Fix B'])
    expect(out).toContain('Recommendations')
    expect(out).toContain('Fix A')
    expect(out).toContain('Fix B')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const r = await buildOnyxCathedralResult(['a.ts'], [richContent])
    const out = formatResultTable(r)
    expect(out).toContain('Onyx Cathedral Analysis')
    expect(out).toContain('Darkness Overview')
    expect(out).toContain('Onyx Cathedral Statistics')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const r = await buildOnyxCathedralResult(['a.ts'], [richContent])
    const json = formatResultJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.pillars).toHaveLength(1)
    expect(parsed.darkness).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────

describe('integration', () => {
  it('end-to-end with mixed content', async () => {
    const r = await buildOnyxCathedralResult(
      ['good.ts', 'bad.ts', 'ok.ts'],
      [richContent, '', 'export function test(): void { return }'],
    )
    expect(r.pillars).toHaveLength(3)
    expect(r.stats.totalFiles).toBe(3)
    expect(r.darkness.overallDepth).toBeGreaterThan(0)
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('handles files in same directory', async () => {
    const r = await buildOnyxCathedralResult(
      ['src/a.ts', 'src/b.ts'],
      [richContent, richContent],
    )
    expect(r.naves).toHaveLength(1)
    expect(r.naves[0].pillars).toHaveLength(2)
  })

  it('handles root-level files', async () => {
    const r = await buildOnyxCathedralResult(
      ['a.ts'],
      [richContent],
    )
    expect(r.naves).toHaveLength(1)
    expect(r.naves[0].directory).toBe('.')
  })
})
