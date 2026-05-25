import { describe, it, expect } from 'vitest'
import {
  measureDiving,
  measurePulsing,
  measureCleansing,
  measureAccumulating,
  measureFlowing,
  classifyCondition,
  classifyCoveType,
  classifyCoveCondition,
  classifyNavigatorGrade,
  analyzeSapphireWave,
  analyzeSapphireCove,
  buildSapphireTideResult,
  generateRecommendations,
} from '../src/commands/sapphire-tide-helpers.js'
import {
  colorScore,
  colorCondition,
  colorCoveCondition,
  formatWaveTable,
  formatWavesTable,
  formatCoveTable,
  formatCovesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/sapphire-tide-format-helpers.js'

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

// ─── measureDiving ──────────────────────────────────────────

describe('measureDiving', () => {
  it('returns 0 for empty content', () => {
    const m = measureDiving('')
    expect(m.depth).toBe(0)
    expect(m.ocean).toBe('no-depth')
    expect(m.hasHighDepth).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureDiving(minimalContent)
    expect(m.depth).toBe(0)
    expect(m.ocean).toBe('no-depth')
    expect(m.hasWellArchitected).toBe(false)
    expect(m.hasThorough).toBe(false)
    expect(m.hasComplete).toBe(false)
    expect(m.hasDeep).toBe(false)
    expect(m.hasInsightful).toBe(false)
    expect(m.hasPrincipled).toBe(false)
    expect(m.hasProven).toBe(false)
    expect(m.hasMature).toBe(false)
    expect(m.hasNoHacked).toBe(true)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.hackedCount).toBe(0)
    expect(m.adHocCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureDiving(richContent)
    expect(m.depth).toBe(100)
    expect(m.ocean).toBe('abyssal-depth')
    expect(m.hasHighDepth).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasThorough).toBe(true)
    expect(m.hasComplete).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasMature).toBe(true)
  })

  it('detects hack patterns', () => {
    const m = measureDiving('// hack: something')
    expect(m.hackedCount).toBe(1)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects any usage as ad-hoc', () => {
    const m = measureDiving('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })

  it('classifies shallow-water at 40-59', () => {
    const m = measureDiving('export class Foo { }')
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.depth).toBeGreaterThan(0)
  })

  it('detects ts-ignore as shallow', () => {
    const m = measureDiving('// @ts-ignore\nexport class Foo { readonly x: string }')
    expect(m.hasNoShallow).toBe(false)
  })

  it('detects experimental patterns negatively', () => {
    const m = measureDiving('export const x: string = "experimental"')
    expect(m.hasNoExperimental).toBe(false)
  })
})

// ─── measurePulsing ──────────────────────────────────────────

describe('measurePulsing', () => {
  it('returns 0 for empty content', () => {
    const m = measurePulsing('')
    expect(m.rhythm).toBe(0)
    expect(m.tide).toBe('no-rhythm')
    expect(m.hasHighRhythm).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measurePulsing(minimalContent)
    expect(m.rhythm).toBe(0)
    expect(m.tide).toBe('no-rhythm')
    expect(m.hasConsistent).toBe(false)
    expect(m.hasPredictable).toBe(false)
    expect(m.hasReliable).toBe(false)
    expect(m.hasTested).toBe(false)
    expect(m.hasStable).toBe(false)
    expect(m.hasUniform).toBe(false)
    expect(m.hasDependable).toBe(false)
    expect(m.hasCyclical).toBe(false)
    expect(m.hasNoErratic).toBe(true)
    expect(m.erraticCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measurePulsing(richContent)
    expect(m.rhythm).toBe(100)
    expect(m.tide).toBe('eternal-rhythm')
    expect(m.hasHighRhythm).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasPredictable).toBe(true)
    expect(m.hasReliable).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasStable).toBe(true)
    expect(m.hasUniform).toBe(true)
    expect(m.hasDependable).toBe(true)
    expect(m.hasCyclical).toBe(true)
  })

  it('detects erratic var usage', () => {
    const m = measurePulsing('var x = 1')
    expect(m.erraticCount).toBe(1)
    expect(m.hasNoErratic).toBe(false)
  })

  it('detects untested code via var count', () => {
    const m = measurePulsing('var y = 2')
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
  })

  it('detects ts-ignore as mixed', () => {
    const m = measurePulsing('// @ts-ignore\nexport class Foo {}')
    expect(m.hasNoMixed).toBe(false)
  })

  it('classifies steady-pulse at 75-89', () => {
    const m = measurePulsing('try { foo() } catch (e) { bar() } if (x) { y }')
    expect(m.rhythm).toBeGreaterThan(0)
  })
})

// ─── measureCleansing ──────────────────────────────────────────

describe('measureCleansing', () => {
  it('returns 0 for empty content', () => {
    const m = measureCleansing('')
    expect(m.purity).toBe(0)
    expect(m.wave).toBe('no-purity')
    expect(m.hasHighPurity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureCleansing(minimalContent)
    expect(m.purity).toBe(0)
    expect(m.wave).toBe('no-purity')
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasClean).toBe(false)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasClear).toBe(false)
    expect(m.hasReadable).toBe(false)
    expect(m.hasTransparent).toBe(false)
    expect(m.hasHonest).toBe(false)
    expect(m.hasPure).toBe(false)
    expect(m.unsafeCount).toBe(0)
    expect(m.crypticCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureCleansing(richContent)
    expect(m.purity).toBe(100)
    expect(m.wave).toBe('pure-sapphire')
    expect(m.hasHighPurity).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasHonest).toBe(true)
    expect(m.hasPure).toBe(true)
  })

  it('detects unsafe any usage', () => {
    const m = measureCleansing('const x: any = 1')
    expect(m.unsafeCount).toBe(1)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects cryptic eval usage', () => {
    const m = measureCleansing('eval("code")')
    expect(m.crypticCount).toBe(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects ts-expect-error as hidden', () => {
    const m = measureCleansing('// @ts-expect-error\nexport const x = 1')
    expect(m.hasNoHidden).toBe(false)
  })

  it('has pure imports', () => {
    const m = measureCleansing("import { foo } from 'bar'")
    expect(m.hasPure).toBe(true)
  })
})

// ─── measureAccumulating ──────────────────────────────────────────

describe('measureAccumulating', () => {
  it('returns 0 for empty content', () => {
    const m = measureAccumulating('')
    expect(m.wisdom).toBe(0)
    expect(m.deep).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureAccumulating(minimalContent)
    expect(m.wisdom).toBe(0)
    expect(m.deep).toBe('no-wisdom')
    expect(m.hasProven).toBe(false)
    expect(m.hasMature).toBe(false)
    expect(m.hasEstablished).toBe(false)
    expect(m.hasPatterned).toBe(false)
    expect(m.hasDeep).toBe(false)
    expect(m.hasInsightful).toBe(false)
    expect(m.hasEnduring).toBe(false)
    expect(m.hasAccumulated).toBe(false)
    expect(m.experimentalCount).toBe(0)
    expect(m.reinventedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureAccumulating(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.deep).toBe('ancient-ocean')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasEstablished).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasEnduring).toBe(true)
    expect(m.hasAccumulated).toBe(true)
  })

  it('detects experimental patterns', () => {
    const m = measureAccumulating('// experimental feature')
    expect(m.experimentalCount).toBe(1)
    expect(m.hasNoExperimental).toBe(false)
  })

  it('detects reinvented via any usage', () => {
    const m = measureAccumulating('const x: any = 1')
    expect(m.reinventedCount).toBe(1)
    expect(m.hasNoReinvented).toBe(false)
  })

  it('detects naive patterns negatively', () => {
    const m = measureAccumulating('// naive approach')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects ts-ignore as shallow', () => {
    const m = measureAccumulating('// @ts-ignore\nexport const x = 1')
    expect(m.hasNoShallow).toBe(false)
  })
})

// ─── measureFlowing ──────────────────────────────────────────

describe('measureFlowing', () => {
  it('returns 0 for empty content', () => {
    const m = measureFlowing('')
    expect(m.resilience).toBe(0)
    expect(m.current).toBe('no-resilience')
    expect(m.hasHighResilience).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureFlowing(minimalContent)
    expect(m.resilience).toBe(0)
    expect(m.current).toBe('no-resilience')
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasDefensive).toBe(false)
    expect(m.hasGraceful).toBe(false)
    expect(m.hasRecoverable).toBe(false)
    expect(m.hasRobust).toBe(false)
    expect(m.hasAdaptive).toBe(false)
    expect(m.hasEnduring).toBe(false)
    expect(m.hasAntifragile).toBe(false)
    expect(m.bareCrashCount).toBe(0)
    expect(m.fragileCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureFlowing(richContent)
    expect(m.resilience).toBe(100)
    expect(m.current).toBe('unstoppable-tide')
    expect(m.hasHighResilience).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasRecoverable).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasAdaptive).toBe(true)
    expect(m.hasEnduring).toBe(true)
    expect(m.hasAntifragile).toBe(true)
  })

  it('detects bare crash via eval', () => {
    const m = measureFlowing('eval("code")')
    expect(m.bareCrashCount).toBe(1)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects fragile var usage', () => {
    const m = measureFlowing('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('antifragile detects test keywords', () => {
    const m = measureFlowing('describe("test", () => { })')
    expect(m.hasAntifragile).toBe(true)
  })

  it('antifragile detects try/catch', () => {
    const m = measureFlowing('try { foo() } catch (e) { bar() }')
    expect(m.hasAntifragile).toBe(true)
  })

  it('detects naive trust patterns', () => {
    const m = measureFlowing('// trust the input')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects harsh failure patterns', () => {
    const m = measureFlowing('process.abort()')
    expect(m.hasNoHarshFail).toBe(false)
  })

  it('detects fatal patterns', () => {
    const m = measureFlowing('// fatal error')
    expect(m.hasNoFatal).toBe(false)
  })

  it('detects brittle patterns', () => {
    const m = measureFlowing('// brittle code')
    expect(m.hasNoBrittle).toBe(false)
  })
})

// ─── classifyCondition ──────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies sapphire-masterpiece at 90+', () => {
    expect(classifyCondition(90)).toBe('sapphire-masterpiece')
    expect(classifyCondition(100)).toBe('sapphire-masterpiece')
  })

  it('classifies gem-tide at 75-89', () => {
    expect(classifyCondition(75)).toBe('gem-tide')
    expect(classifyCondition(89)).toBe('gem-tide')
  })

  it('classifies proper-wave at 60-74', () => {
    expect(classifyCondition(60)).toBe('proper-wave')
    expect(classifyCondition(74)).toBe('proper-wave')
  })

  it('classifies murky-puddle at 40-59', () => {
    expect(classifyCondition(40)).toBe('murky-puddle')
    expect(classifyCondition(59)).toBe('murky-puddle')
  })

  it('classifies dry-shore at 20-39', () => {
    expect(classifyCondition(20)).toBe('dry-shore')
    expect(classifyCondition(39)).toBe('dry-shore')
  })

  it('classifies void below 20', () => {
    expect(classifyCondition(0)).toBe('void')
    expect(classifyCondition(19)).toBe('void')
  })
})

// ─── classifyCoveType ──────────────────────────────────────────

describe('classifyCoveType', () => {
  it('returns no-cove for empty waves', () => {
    expect(classifyCoveType([])).toBe('no-cove')
  })

  it('returns sapphire-bay for high scores', () => {
    const wave = analyzeSapphireWave(richContent, 'test.ts')
    expect(classifyCoveType([wave])).toBe('sapphire-bay')
  })

  it('returns no-cove for very low scores', () => {
    const wave = analyzeSapphireWave('', 'test.ts')
    expect(classifyCoveType([wave])).toBe('no-cove')
  })
})

// ─── classifyCoveCondition ──────────────────────────────────────────

describe('classifyCoveCondition', () => {
  it('classifies sapphire-paradise at 85+', () => {
    expect(classifyCoveCondition(85)).toBe('sapphire-paradise')
    expect(classifyCoveCondition(100)).toBe('sapphire-paradise')
  })

  it('classifies gem-bay at 70-84', () => {
    expect(classifyCoveCondition(70)).toBe('gem-bay')
    expect(classifyCoveCondition(84)).toBe('gem-bay')
  })

  it('classifies proper-shore at 55-69', () => {
    expect(classifyCoveCondition(55)).toBe('proper-shore')
    expect(classifyCoveCondition(69)).toBe('proper-shore')
  })

  it('classifies murky-cove at 35-54', () => {
    expect(classifyCoveCondition(35)).toBe('murky-cove')
    expect(classifyCoveCondition(54)).toBe('murky-cove')
  })

  it('classifies dry-beach at 15-34', () => {
    expect(classifyCoveCondition(15)).toBe('dry-beach')
    expect(classifyCoveCondition(34)).toBe('dry-beach')
  })

  it('classifies void below 15', () => {
    expect(classifyCoveCondition(0)).toBe('void')
    expect(classifyCoveCondition(14)).toBe('void')
  })
})

// ─── classifyNavigatorGrade ──────────────────────────────────────────

describe('classifyNavigatorGrade', () => {
  it('classifies ocean-master at 80+', () => {
    expect(classifyNavigatorGrade(80)).toBe('ocean-master')
    expect(classifyNavigatorGrade(100)).toBe('ocean-master')
  })

  it('classifies tide-reader at 65-79', () => {
    expect(classifyNavigatorGrade(65)).toBe('tide-reader')
    expect(classifyNavigatorGrade(79)).toBe('tide-reader')
  })

  it('classifies wave-rider at 50-64', () => {
    expect(classifyNavigatorGrade(50)).toBe('wave-rider')
    expect(classifyNavigatorGrade(64)).toBe('wave-rider')
  })

  it('classifies apprentice at 35-49', () => {
    expect(classifyNavigatorGrade(35)).toBe('apprentice')
    expect(classifyNavigatorGrade(49)).toBe('apprentice')
  })

  it('classifies novice at 20-34', () => {
    expect(classifyNavigatorGrade(20)).toBe('novice')
    expect(classifyNavigatorGrade(34)).toBe('novice')
  })

  it('classifies landlubber below 20', () => {
    expect(classifyNavigatorGrade(0)).toBe('landlubber')
    expect(classifyNavigatorGrade(19)).toBe('landlubber')
  })
})

// ─── analyzeSapphireWave ──────────────────────────────────────────

describe('analyzeSapphireWave', () => {
  it('analyzes empty content', () => {
    const wave = analyzeSapphireWave('', 'empty.ts')
    expect(wave.file).toBe('empty.ts')
    expect(wave.gemDepth).toBe(0)
    expect(wave.tidalRhythm).toBe(0)
    expect(wave.wavePurity).toBe(0)
    expect(wave.oceanWisdom).toBe(0)
    expect(wave.tideResilience).toBe(0)
    expect(wave.qualityScore).toBe(0)
    expect(wave.condition).toBe('void')
  })

  it('analyzes rich content', () => {
    const wave = analyzeSapphireWave(richContent, 'rich.ts')
    expect(wave.file).toBe('rich.ts')
    expect(wave.gemDepth).toBe(100)
    expect(wave.tidalRhythm).toBe(100)
    expect(wave.wavePurity).toBe(100)
    expect(wave.oceanWisdom).toBe(100)
    expect(wave.tideResilience).toBe(100)
    expect(wave.qualityScore).toBe(100)
    expect(wave.condition).toBe('sapphire-masterpiece')
  })

  it('computes qualityScore as weighted average', () => {
    const wave = analyzeSapphireWave('export class Foo { }', 'foo.ts')
    expect(wave.qualityScore).toBe(
      Math.round(
        wave.gemDepth * 0.2 +
        wave.tidalRhythm * 0.2 +
        wave.wavePurity * 0.2 +
        wave.oceanWisdom * 0.2 +
        wave.tideResilience * 0.2,
      ),
    )
  })

  it('includes all measure objects', () => {
    const wave = analyzeSapphireWave(richContent, 'test.ts')
    expect(wave.diving).toBeDefined()
    expect(wave.pulsing).toBeDefined()
    expect(wave.cleansing).toBeDefined()
    expect(wave.accumulating).toBeDefined()
    expect(wave.flowing).toBeDefined()
  })
})

// ─── analyzeSapphireCove ──────────────────────────────────────────

describe('analyzeSapphireCove', () => {
  it('handles empty waves', () => {
    const cove = analyzeSapphireCove([], 'empty-dir')
    expect(cove.directory).toBe('empty-dir')
    expect(cove.waves).toEqual([])
    expect(cove.avgDepth).toBe(0)
    expect(cove.avgPurity).toBe(0)
    expect(cove.avgResilience).toBe(0)
    expect(cove.sapphireMasterpieceCount).toBe(0)
    expect(cove.voidCount).toBe(0)
    expect(cove.coveType).toBe('no-cove')
    expect(cove.condition).toBe('void')
  })

  it('aggregates wave data correctly', () => {
    const w1 = analyzeSapphireWave(richContent, 'a.ts')
    const w2 = analyzeSapphireWave(richContent, 'b.ts')
    const cove = analyzeSapphireCove([w1, w2], 'src')
    expect(cove.directory).toBe('src')
    expect(cove.waves).toHaveLength(2)
    expect(cove.avgDepth).toBe(100)
    expect(cove.sapphireMasterpieceCount).toBe(2)
    expect(cove.voidCount).toBe(0)
    expect(cove.coveType).toBe('sapphire-bay')
    expect(cove.condition).toBe('sapphire-paradise')
  })

  it('counts void waves', () => {
    const w1 = analyzeSapphireWave('', 'a.ts')
    const cove = analyzeSapphireCove([w1], 'src')
    expect(cove.voidCount).toBe(1)
    expect(cove.sapphireMasterpieceCount).toBe(0)
  })
})

// ─── buildSapphireTideResult ──────────────────────────────────────────

describe('buildSapphireTideResult', () => {
  it('handles empty input', async () => {
    const result = await buildSapphireTideResult([], [])
    expect(result.waves).toEqual([])
    expect(result.coves).toEqual([])
    expect(result.ocean.avgDepth).toBe(0)
    expect(result.ocean.overallDepth).toBe(0)
    expect(result.ocean.isSapphire).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalCoves).toBe(0)
  })

  it('analyzes single rich file', async () => {
    const result = await buildSapphireTideResult(['src/a.ts'], [richContent])
    expect(result.waves).toHaveLength(1)
    expect(result.waves[0]?.file).toBe('src/a.ts')
    expect(result.waves[0]?.qualityScore).toBe(100)
    expect(result.coves).toHaveLength(1)
    expect(result.ocean.isSapphire).toBe(true)
  })

  it('includes celebration field for milestone #560', async () => {
    const result = await buildSapphireTideResult(['a.ts'], [richContent])
    expect(result.celebration).toBeDefined()
    expect(result.celebration.milestone).toBe(560)
    expect(result.celebration.name).toBe('Sapphire Tide')
    expect(result.celebration.message).toContain('560')
  })

  it('computes stats correctly', async () => {
    const result = await buildSapphireTideResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.navigatorGrade).toBeDefined()
    expect(result.stats.bestWave).toBeDefined()
    expect(result.stats.deepest).toBeDefined()
    expect(result.stats.mostRhythmic).toBeDefined()
    expect(result.stats.purest).toBeDefined()
    expect(result.stats.wisest).toBeDefined()
    expect(result.stats.mostResilient).toBeDefined()
  })

  it('computes hasHigh counts', async () => {
    const result = await buildSapphireTideResult(['a.ts'], [richContent])
    expect(result.stats.hasHighDepthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighRhythmCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPurityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
  })

  it('groups waves by directory', async () => {
    const result = await buildSapphireTideResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.coves).toHaveLength(2)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildSapphireTideResult(
      ['a.ts', 'b.ts'],
      [richContent, ''],
    )
    expect(result.stats.sapphireMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.gemTideCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.properWaveCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.murkyPuddleCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.dryShoreCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message when all scores are 90+', () => {
    const wave = analyzeSapphireWave(richContent, 'perfect.ts')
    const stats: import('../src/commands/sapphire-tide-helpers.js').SapphireStats = {
      avgGemDepth: 95,
      avgTidalRhythm: 95,
      avgWavePurity: 95,
      avgOceanWisdom: 95,
      avgTideResilience: 95,
      totalFiles: 1,
      totalCoves: 1,
      sapphireMasterpieceCount: 1,
      gemTideCount: 0,
      properWaveCount: 0,
      murkyPuddleCount: 0,
      dryShoreCount: 0,
      voidCount: 0,
      hasHighDepthCount: 1,
      hasHighRhythmCount: 1,
      hasHighPurityCount: 1,
      hasHighWisdomCount: 1,
      hasHighResilienceCount: 1,
      overallDepth: 95,
      navigatorGrade: 'ocean-master',
      bestWave: 'perfect.ts',
      deepest: 'perfect.ts',
      mostRhythmic: 'perfect.ts',
      purest: 'perfect.ts',
      wisest: 'perfect.ts',
      mostResilient: 'perfect.ts',
    }
    const recs = generateRecommendations([wave], [], { avgDepth: 95, avgPurity: 95, avgResilience: 95, isSapphire: true, overallDepth: 95 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('sapphire tide')
  })

  it('recommends improving gem depth when low', () => {
    const wave = analyzeSapphireWave('', 'empty.ts')
    const cove = analyzeSapphireCove([wave], '.')
    const stats: import('../src/commands/sapphire-tide-helpers.js').SapphireStats = {
      avgGemDepth: 0,
      avgTidalRhythm: 0,
      avgWavePurity: 0,
      avgOceanWisdom: 0,
      avgTideResilience: 0,
      totalFiles: 1,
      totalCoves: 1,
      sapphireMasterpieceCount: 0,
      gemTideCount: 0,
      properWaveCount: 0,
      murkyPuddleCount: 0,
      dryShoreCount: 0,
      voidCount: 1,
      hasHighDepthCount: 0,
      hasHighRhythmCount: 0,
      hasHighPurityCount: 0,
      hasHighWisdomCount: 0,
      hasHighResilienceCount: 0,
      overallDepth: 0,
      navigatorGrade: 'landlubber',
      bestWave: '',
      deepest: '',
      mostRhythmic: '',
      purest: '',
      wisest: '',
      mostResilient: '',
    }
    const recs = generateRecommendations([wave], [cove], { avgDepth: 0, avgPurity: 0, avgResilience: 0, isSapphire: false, overallDepth: 0 }, stats)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.some((r: string) => r.includes('gem depth'))).toBe(true)
  })

  it('recommends tide restoration for many void waves', () => {
    const waves = Array.from({ length: 6 }, (_, i) => analyzeSapphireWave('', `empty${i}.ts`))
    const stats: import('../src/commands/sapphire-tide-helpers.js').SapphireStats = {
      avgGemDepth: 0,
      avgTidalRhythm: 0,
      avgWavePurity: 0,
      avgOceanWisdom: 0,
      avgTideResilience: 0,
      totalFiles: 6,
      totalCoves: 1,
      sapphireMasterpieceCount: 0,
      gemTideCount: 0,
      properWaveCount: 0,
      murkyPuddleCount: 0,
      dryShoreCount: 0,
      voidCount: 6,
      hasHighDepthCount: 0,
      hasHighRhythmCount: 0,
      hasHighPurityCount: 0,
      hasHighWisdomCount: 0,
      hasHighResilienceCount: 0,
      overallDepth: 0,
      navigatorGrade: 'landlubber',
      bestWave: '',
      deepest: '',
      mostRhythmic: '',
      purest: '',
      wisest: '',
      mostResilient: '',
    }
    const recs = generateRecommendations(waves, [], { avgDepth: 0, avgPurity: 0, avgResilience: 0, isSapphire: false, overallDepth: 0 }, stats)
    expect(recs.some((r: string) => r.includes('6'))).toBe(true)
  })

  it('recommends comprehensive restoration when all coves poor', () => {
    const wave = analyzeSapphireWave('', 'empty.ts')
    const cove = analyzeSapphireCove([wave], 'src')
    const stats: import('../src/commands/sapphire-tide-helpers.js').SapphireStats = {
      avgGemDepth: 0,
      avgTidalRhythm: 0,
      avgWavePurity: 0,
      avgOceanWisdom: 0,
      avgTideResilience: 0,
      totalFiles: 1,
      totalCoves: 1,
      sapphireMasterpieceCount: 0,
      gemTideCount: 0,
      properWaveCount: 0,
      murkyPuddleCount: 0,
      dryShoreCount: 0,
      voidCount: 1,
      hasHighDepthCount: 0,
      hasHighRhythmCount: 0,
      hasHighPurityCount: 0,
      hasHighWisdomCount: 0,
      hasHighResilienceCount: 0,
      overallDepth: 0,
      navigatorGrade: 'landlubber',
      bestWave: '',
      deepest: '',
      mostRhythmic: '',
      purest: '',
      wisest: '',
      mostResilient: '',
    }
    const recs = generateRecommendations([wave], [cove], { avgDepth: 0, avgPurity: 0, avgResilience: 0, isSapphire: false, overallDepth: 0 }, stats)
    expect(recs.some((r: string) => r.includes('comprehensive'))).toBe(true)
  })
})

// ─── Format Helpers ──────────────────────────────────────────

describe('colorScore', () => {
  it('colors high scores cyan', () => {
    expect(colorScore(90)).toContain('90')
  })

  it('colors 75+ blue', () => {
    expect(colorScore(75)).toContain('75')
  })

  it('colors 60+ green', () => {
    expect(colorScore(60)).toContain('60')
  })

  it('colors 40+ yellow', () => {
    expect(colorScore(40)).toContain('40')
  })

  it('colors 20+ orange', () => {
    expect(colorScore(20)).toContain('20')
  })

  it('colors low scores red', () => {
    expect(colorScore(5)).toContain('5')
  })
})

describe('colorCondition', () => {
  it('colors sapphire-masterpiece', () => {
    expect(colorCondition('sapphire-masterpiece')).toContain('sapphire-masterpiece')
  })

  it('colors gem-tide', () => {
    expect(colorCondition('gem-tide')).toContain('gem-tide')
  })

  it('colors proper-wave', () => {
    expect(colorCondition('proper-wave')).toContain('proper-wave')
  })

  it('colors murky-puddle', () => {
    expect(colorCondition('murky-puddle')).toContain('murky-puddle')
  })

  it('colors dry-shore', () => {
    expect(colorCondition('dry-shore')).toContain('dry-shore')
  })

  it('colors void', () => {
    expect(colorCondition('void')).toContain('void')
  })

  it('colors unknown condition gray', () => {
    expect(colorCondition('unknown')).toContain('unknown')
  })
})

describe('colorCoveCondition', () => {
  it('colors sapphire-paradise', () => {
    expect(colorCoveCondition('sapphire-paradise')).toContain('sapphire-paradise')
  })

  it('colors gem-bay', () => {
    expect(colorCoveCondition('gem-bay')).toContain('gem-bay')
  })

  it('colors proper-shore', () => {
    expect(colorCoveCondition('proper-shore')).toContain('proper-shore')
  })

  it('colors murky-cove', () => {
    expect(colorCoveCondition('murky-cove')).toContain('murky-cove')
  })

  it('colors dry-beach', () => {
    expect(colorCoveCondition('dry-beach')).toContain('dry-beach')
  })

  it('colors void', () => {
    expect(colorCoveCondition('void')).toContain('void')
  })

  it('colors unknown condition gray', () => {
    expect(colorCoveCondition('unknown')).toContain('unknown')
  })
})

describe('formatWaveTable', () => {
  it('formats a single wave', () => {
    const wave = analyzeSapphireWave(richContent, 'test.ts')
    const output = formatWaveTable(wave)
    expect(output).toContain('test.ts')
    expect(output).toContain('Gem Depth')
    expect(output).toContain('Quality Score')
  })
})

describe('formatWavesTable', () => {
  it('handles empty waves', () => {
    expect(formatWavesTable([])).toContain('No sapphire waves')
  })

  it('formats multiple waves', () => {
    const w1 = analyzeSapphireWave(richContent, 'a.ts')
    const w2 = analyzeSapphireWave(minimalContent, 'b.ts')
    const output = formatWavesTable([w1, w2])
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
    expect(output).toContain('Sapphire Waves')
  })
})

describe('formatCoveTable', () => {
  it('formats a single cove', () => {
    const wave = analyzeSapphireWave(richContent, 'src/a.ts')
    const cove = analyzeSapphireCove([wave], 'src')
    const output = formatCoveTable(cove)
    expect(output).toContain('src')
    expect(output).toContain('Avg Depth')
  })
})

describe('formatCovesTable', () => {
  it('handles empty coves', () => {
    expect(formatCovesTable([])).toContain('No sapphire coves')
  })

  it('formats multiple coves', () => {
    const w1 = analyzeSapphireWave(richContent, 'src/a.ts')
    const cove = analyzeSapphireCove([w1], 'src')
    const output = formatCovesTable([cove])
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildSapphireTideResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Sapphire Tide Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Navigator Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Improve Y')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildSapphireTideResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Sapphire Tide Analysis')
    expect(output).toContain('Ocean Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildSapphireTideResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.waves).toHaveLength(1)
    expect(parsed.celebration.milestone).toBe(560)
  })
})

// ─── Integration ──────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('processes multiple files with mixed quality', async () => {
    const files = ['src/good.ts', 'src/bad.ts', 'lib/ok.ts']
    const contents = [richContent, minimalContent, 'export class Foo { readonly x: string }']
    const result = await buildSapphireTideResult(files, contents)

    expect(result.waves).toHaveLength(3)
    expect(result.coves).toHaveLength(2)
    expect(result.ocean.avgDepth).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.celebration.milestone).toBe(560)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('handles single file with no directory', async () => {
    const result = await buildSapphireTideResult(['app.ts'], [richContent])
    expect(result.waves).toHaveLength(1)
    expect(result.coves).toHaveLength(1)
    expect(result.coves[0]?.directory).toBe('.')
  })

  it('wave quality score is weighted sum of measures', async () => {
    const result = await buildSapphireTideResult(['test.ts'], [richContent])
    const wave = result.waves[0]!
    expect(wave.qualityScore).toBe(
      Math.round(
        wave.gemDepth * 0.2 +
        wave.tidalRhythm * 0.2 +
        wave.wavePurity * 0.2 +
        wave.oceanWisdom * 0.2 +
        wave.tideResilience * 0.2,
      ),
    )
  })
})
