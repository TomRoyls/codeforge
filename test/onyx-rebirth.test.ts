import { describe, expect, it } from 'vitest'

import {
  analyzeOnyxFeather,
  analyzeOnyxNest,
  buildOnyxPhoenixResult,
  classifyFirebirdGrade,
  classifyNestCondition,
  classifyNestType,
  classifyOnyxCondition,
  generateRecommendations,
  measureEnduring,
  measureIlluminating,
  measureRefining,
  measureTransforming,
  measureUnderstanding,
} from '../src/commands/onyx-rebirth-helpers.js'
import type { OnyxPhoenixResult } from '../src/commands/onyx-rebirth-helpers.js'
import {
  colorFirebirdGrade,
  colorNestCondition,
  colorNestType,
  colorOnyxCondition,
  colorScore,
  formatFeathersTable,
  formatFeatherTable,
  formatNestsTable,
  formatNestTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/onyx-rebirth-format-helpers.js'

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
const minimalContent = 'const x = 1'

const richReb = measureTransforming(richContent).rebirth
const richPrec = measureRefining(richContent).precision
const richRes = measureEnduring(richContent).resilience
const richClr = measureIlluminating(richContent).clarity
const richWis = measureUnderstanding(richContent).wisdom

function makeStats(overrides: Partial<OnyxPhoenixResult['stats']> = {}): OnyxPhoenixResult['stats'] {
  return {
    totalFiles: 1,
    totalNests: 1,
    avgObsidianRebirth: 50,
    avgAshPrecision: 50,
    avgDarkResilience: 50,
    avgFireClarity: 50,
    avgPhoenixWisdom: 50,
    onyxMasterpieceCount: 0,
    phoenixGemCount: 0,
    properOnyxCount: 0,
    burntStoneCount: 0,
    coldEmberCount: 0,
    voidCount: 0,
    hasHighRebirthCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighClarityCount: 1,
    hasHighWisdomCount: 1,
    overallRebirth: 50,
    firebirdGrade: 'proper-fledgling',
    bestFeather: 'a.ts',
    mostTransformed: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    clearest: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureTransforming ────────────────────────────────

describe('measureTransforming', () => {
  it('scores rich content highly', () => {
    const result = measureTransforming(richContent)
    expect(result.rebirth).toBeGreaterThan(60)
    expect(result.hasHighRebirth).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureTransforming(emptyContent).rebirth).toBeLessThan(richReb)
  })

  it('detects hasRefactored (class/interface/type)', () => {
    expect(measureTransforming(richContent).hasRefactored).toBe(true)
  })

  it('counts duplicated keywords', () => {
    const content = 'const copy = 1; const paste = 2; const duplicate = 3; const clone = 4; const replica = 5'
    const result = measureTransforming(content)
    expect(result.duplicatedCount).toBe(5)
    expect(result.hasNoDuplicated).toBe(false)
  })

  it('counts stagnant keywords', () => {
    const content = 'const stagnant = 1; const stale = 2; const rotten = 3; const decay = 4; const decompose = 5'
    const result = measureTransforming(content)
    expect(result.stagnantCount).toBe(5)
    expect(result.hasNoStagnant).toBe(false)
  })

  it('detects hasImproved (type annotations)', () => {
    expect(measureTransforming(richContent).hasImproved).toBe(true)
  })

  it('detects hasEvolved (import/export)', () => {
    expect(measureTransforming(richContent).hasEvolved).toBe(true)
  })

  it('detects hasNoStatic (no any)', () => {
    expect(measureTransforming(richContent).hasNoStatic).toBe(true)
  })

  it('detects hasRegenerated (JSDoc)', () => {
    expect(measureTransforming(richContent).hasRegenerated).toBe(true)
  })

  it('detects hasReborn (no hack/workaround/kludge)', () => {
    expect(measureTransforming(richContent).hasReborn).toBe(true)
  })

  it('detects hasRevived (no var/eval)', () => {
    expect(measureTransforming(richContent).hasRevived).toBe(true)
  })

  it('detects hasCleansed (no dead/unused/obsolete/deprecated)', () => {
    expect(measureTransforming(richContent).hasCleansed).toBe(true)
  })

  it('classifies flame correctly for high scores', () => {
    const result = measureTransforming(richContent)
    expect(['supernova-rebirth', 'phoenix-rising', 'proper-renewal']).toContain(result.flame)
  })

  it('classifies flame correctly for low scores', () => {
    expect(measureTransforming(emptyContent).flame).not.toBe('supernova-rebirth')
  })
})

// ─── measureRefining ────────────────────────────────────

describe('measureRefining', () => {
  it('scores rich content highly', () => {
    const result = measureRefining(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureRefining(emptyContent).precision).toBeLessThan(richPrec)
  })

  it('detects hasTypeSafe (no any)', () => {
    expect(measureRefining(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureRefining(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const imprecise = 3; const loose = 4; const sloppy = 5'
    const result = measureRefining(content)
    expect(result.approximateCount).toBe(5)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects hasExact (class/interface/type)', () => {
    expect(measureRefining(richContent).hasExact).toBe(true)
  })

  it('detects hasRefined (async/await/Promise)', () => {
    expect(measureRefining(richContent).hasRefined).toBe(true)
  })

  it('detects hasDistilled (try/catch/if)', () => {
    expect(measureRefining(richContent).hasDistilled).toBe(true)
  })

  it('detects hasCrisp (JSDoc)', () => {
    expect(measureRefining(richContent).hasCrisp).toBe(true)
  })

  it('detects hasPure (no eval/Function)', () => {
    expect(measureRefining(richContent).hasPure).toBe(true)
  })

  it('classifies ash correctly for high scores', () => {
    const result = measureRefining(richContent)
    expect(['phoenix-ash', 'refined-residue', 'proper-cinder']).toContain(result.ash)
  })

  it('classifies ash correctly for low scores', () => {
    expect(measureRefining(emptyContent).ash).not.toBe('phoenix-ash')
  })
})

// ─── measureEnduring ────────────────────────────────────

describe('measureEnduring', () => {
  it('scores rich content highly', () => {
    const result = measureEnduring(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureEnduring(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects hasErrorHandled (try/catch)', () => {
    expect(measureEnduring(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const unprocessed = 3; const unresolved = 4'
    const result = measureEnduring(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureEnduring(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects hasRobust (class/interface/type)', () => {
    expect(measureEnduring(richContent).hasRobust).toBe(true)
  })

  it('detects hasHardened (no any)', () => {
    expect(measureEnduring(richContent).hasHardened).toBe(true)
  })

  it('detects hasUnconquerable (async/await/Promise)', () => {
    expect(measureEnduring(richContent).hasUnconquerable).toBe(true)
  })

  it('detects hasTough (no hack/workaround/kludge)', () => {
    expect(measureEnduring(richContent).hasTough).toBe(true)
  })

  it('classifies shadow correctly for high scores', () => {
    const result = measureEnduring(richContent)
    expect(['void-walker', 'dark-survivor', 'proper-endurance']).toContain(result.shadow)
  })

  it('classifies shadow correctly for low scores', () => {
    expect(measureEnduring(emptyContent).shadow).not.toBe('void-walker')
  })
})

// ─── measureIlluminating ────────────────────────────────

describe('measureIlluminating', () => {
  it('scores rich content highly', () => {
    const result = measureIlluminating(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureIlluminating(emptyContent).clarity).toBeLessThan(richClr)
  })

  it('detects hasReadable (class/interface/type)', () => {
    expect(measureIlluminating(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureIlluminating(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureIlluminating(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects hasSelfDocumenting (type annotations)', () => {
    expect(measureIlluminating(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects hasTransparent (no any)', () => {
    expect(measureIlluminating(richContent).hasTransparent).toBe(true)
  })

  it('detects hasExposed (JSDoc)', () => {
    expect(measureIlluminating(richContent).hasExposed).toBe(true)
  })

  it('detects hasVisible (async/await/Promise)', () => {
    expect(measureIlluminating(richContent).hasVisible).toBe(true)
  })

  it('classifies light correctly for high scores', () => {
    const result = measureIlluminating(richContent)
    expect(['phoenix-flare', 'bright-ember', 'proper-glow']).toContain(result.light)
  })

  it('classifies light correctly for low scores', () => {
    expect(measureIlluminating(emptyContent).light).not.toBe('phoenix-flare')
  })
})

// ─── measureUnderstanding ───────────────────────────────

describe('measureUnderstanding', () => {
  it('scores rich content highly', () => {
    const result = measureUnderstanding(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureUnderstanding(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects hasWellArchitected (class/interface/type)', () => {
    expect(measureUnderstanding(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureUnderstanding(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureUnderstanding(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects hasPrincipled (no any)', () => {
    expect(measureUnderstanding(richContent).hasPrincipled).toBe(true)
  })

  it('detects hasInsightful (JSDoc)', () => {
    expect(measureUnderstanding(richContent).hasInsightful).toBe(true)
  })

  it('detects hasComprehensive (try/catch/if)', () => {
    expect(measureUnderstanding(richContent).hasComprehensive).toBe(true)
  })

  it('detects hasCyclical (no unused/dead/obsolete/deprecated)', () => {
    expect(measureUnderstanding(richContent).hasCyclical).toBe(true)
  })

  it('detects hasTransformative (function/arrow/return)', () => {
    expect(measureUnderstanding(richContent).hasTransformative).toBe(true)
  })

  it('classifies cycle correctly for high scores', () => {
    const result = measureUnderstanding(richContent)
    expect(['eternal-phoenix', 'cycle-master', 'proper-renewer']).toContain(result.cycle)
  })

  it('classifies cycle correctly for low scores', () => {
    expect(measureUnderstanding(emptyContent).cycle).not.toBe('eternal-phoenix')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyOnyxCondition', () => {
  it('returns onyx-masterpiece for 90+', () => {
    expect(classifyOnyxCondition(90)).toBe('onyx-masterpiece')
    expect(classifyOnyxCondition(95)).toBe('onyx-masterpiece')
  })

  it('returns phoenix-gem for 75-89', () => {
    expect(classifyOnyxCondition(75)).toBe('phoenix-gem')
  })

  it('returns proper-onyx for 60-74', () => {
    expect(classifyOnyxCondition(60)).toBe('proper-onyx')
  })

  it('returns burnt-stone for 40-59', () => {
    expect(classifyOnyxCondition(40)).toBe('burnt-stone')
  })

  it('returns cold-ember for 20-39', () => {
    expect(classifyOnyxCondition(20)).toBe('cold-ember')
  })

  it('returns void below 20', () => {
    expect(classifyOnyxCondition(0)).toBe('void')
    expect(classifyOnyxCondition(10)).toBe('void')
  })
})

describe('classifyNestType', () => {
  it('returns no-nest for empty feathers', () => {
    expect(classifyNestType([])).toBe('no-nest')
  })

  it('returns phoenix-nest for avg >= 85', () => {
    const feathers = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyNestType(feathers)).toBe('phoenix-nest')
  })

  it('returns empty-ground for low avg', () => {
    const feathers = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyNestType(feathers)).toBe('empty-ground')
  })
})

describe('classifyNestCondition', () => {
  it('returns onyx-palace for 85+', () => {
    expect(classifyNestCondition(85)).toBe('onyx-palace')
  })

  it('returns void below 15', () => {
    expect(classifyNestCondition(5)).toBe('void')
  })
})

describe('classifyFirebirdGrade', () => {
  it('returns immortal-phoenix for 80+', () => {
    expect(classifyFirebirdGrade(80)).toBe('immortal-phoenix')
  })

  it('returns ash below 20', () => {
    expect(classifyFirebirdGrade(5)).toBe('ash')
  })

  it('returns rising-firebird for 65-79', () => {
    expect(classifyFirebirdGrade(65)).toBe('rising-firebird')
  })

  it('returns proper-fledgling for 50-64', () => {
    expect(classifyFirebirdGrade(50)).toBe('proper-fledgling')
  })

  it('returns nestling for 35-49', () => {
    expect(classifyFirebirdGrade(35)).toBe('nestling')
  })

  it('returns egg for 20-34', () => {
    expect(classifyFirebirdGrade(20)).toBe('egg')
  })
})

// ─── analyzeOnyxFeather ─────────────────────────────────

describe('analyzeOnyxFeather', () => {
  it('creates a feather with all 5 measures', () => {
    const feather = analyzeOnyxFeather(richContent, 'app.ts')
    expect(feather.file).toBe('app.ts')
    expect(typeof feather.obsidianRebirth).toBe('number')
    expect(typeof feather.ashPrecision).toBe('number')
    expect(typeof feather.darkResilience).toBe('number')
    expect(typeof feather.fireClarity).toBe('number')
    expect(typeof feather.phoenixWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const feather = analyzeOnyxFeather(richContent, 'app.ts')
    const expected = Math.round(
      feather.obsidianRebirth * 0.2 +
      feather.ashPrecision * 0.2 +
      feather.darkResilience * 0.2 +
      feather.fireClarity * 0.2 +
      feather.phoenixWisdom * 0.2,
    )
    expect(feather.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const feather = analyzeOnyxFeather(richContent, 'app.ts')
    expect(feather.condition).toBe(classifyOnyxCondition(feather.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richFeather = analyzeOnyxFeather(richContent, 'rich.ts')
    const emptyFeather = analyzeOnyxFeather(emptyContent, 'empty.ts')
    expect(richFeather.qualityScore).toBeGreaterThan(emptyFeather.qualityScore)
  })
})

// ─── analyzeOnyxNest ────────────────────────────────────

describe('analyzeOnyxNest', () => {
  it('returns empty nest for no feathers', () => {
    const nest = analyzeOnyxNest([], 'src')
    expect(nest.directory).toBe('src')
    expect(nest.feathers).toEqual([])
    expect(nest.nestType).toBe('no-nest')
    expect(nest.condition).toBe('void')
  })

  it('computes averages from feathers', () => {
    const feathers = [analyzeOnyxFeather(richContent, 'a.ts'), analyzeOnyxFeather(richContent, 'b.ts')]
    const nest = analyzeOnyxNest(feathers, 'src')
    expect(nest.avgRebirth).toBeGreaterThan(0)
    expect(nest.avgPrecision).toBeGreaterThan(0)
    expect(nest.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildOnyxPhoenixResult ─────────────────────────────

describe('buildOnyxPhoenixResult', () => {
  it('returns full result structure', async () => {
    const result = await buildOnyxPhoenixResult(['a.ts'], [richContent])
    expect(result.feathers).toHaveLength(1)
    expect(result.nests).toHaveLength(1)
    expect(result.pyre).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into nests', async () => {
    const result = await buildOnyxPhoenixResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.nests.length).toBe(2)
  })

  it('computes pyre overview', async () => {
    const result = await buildOnyxPhoenixResult(['a.ts'], [richContent])
    expect(result.pyre.avgRebirth).toBeGreaterThan(0)
    expect(result.pyre.isOnyx).toBe(true)
    expect(result.pyre.overallRebirth).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildOnyxPhoenixResult([], [])
    expect(result.feathers).toHaveLength(0)
    expect(result.nests).toHaveLength(0)
    expect(result.pyre.overallRebirth).toBe(0)
    expect(result.pyre.isOnyx).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildOnyxPhoenixResult(['a.ts'], [richContent])
    const total = result.stats.onyxMasterpieceCount +
      result.stats.phoenixGemCount +
      result.stats.properOnyxCount +
      result.stats.burntStoneCount +
      result.stats.coldEmberCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildOnyxPhoenixResult(['a.ts'], [richContent])
    expect(result.stats.hasHighRebirthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best feather and top performers', async () => {
    const result = await buildOnyxPhoenixResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestFeather).toBeTruthy()
    expect(result.stats.mostTransformed).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes firebird grade from overall rebirth', async () => {
    const result = await buildOnyxPhoenixResult(['a.ts'], [richContent])
    expect(result.stats.firebirdGrade).toBe(classifyFirebirdGrade(result.stats.overallRebirth))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgObsidianRebirth: 90,
      avgAshPrecision: 90,
      avgDarkResilience: 90,
      avgFireClarity: 90,
      avgPhoenixWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgRebirth: 90, avgPrecision: 90, avgWisdom: 90, isOnyx: true, overallRebirth: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('onyx phoenix has achieved immortality')
  })

  it('recommends rebirth when < 60', () => {
    const stats = makeStats({ avgObsidianRebirth: 50 })
    const result = generateRecommendations([], [], { avgRebirth: 50, avgPrecision: 50, avgWisdom: 50, isOnyx: false, overallRebirth: 50 }, stats)
    expect(result.some((r) => r.includes('obsidian rebirth') || r.includes('supernova-rebirth'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgAshPrecision: 50 })
    const result = generateRecommendations([], [], { avgRebirth: 50, avgPrecision: 50, avgWisdom: 50, isOnyx: false, overallRebirth: 50 }, stats)
    expect(result.some((r) => r.includes('ash precision') || r.includes('phoenix-ash'))).toBe(true)
  })

  it('recommends resilience when < 60', () => {
    const stats = makeStats({ avgDarkResilience: 50 })
    const result = generateRecommendations([], [], { avgRebirth: 50, avgPrecision: 50, avgWisdom: 50, isOnyx: false, overallRebirth: 50 }, stats)
    expect(result.some((r) => r.includes('dark resilience') || r.includes('void-walker'))).toBe(true)
  })

  it('recommends clarity when < 60', () => {
    const stats = makeStats({ avgFireClarity: 50 })
    const result = generateRecommendations([], [], { avgRebirth: 50, avgPrecision: 50, avgWisdom: 50, isOnyx: false, overallRebirth: 50 }, stats)
    expect(result.some((r) => r.includes('fire clarity') || r.includes('phoenix-flare'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgPhoenixWisdom: 50 })
    const result = generateRecommendations([], [], { avgRebirth: 50, avgPrecision: 50, avgWisdom: 50, isOnyx: false, overallRebirth: 50 }, stats)
    expect(result.some((r) => r.includes('phoenix wisdom') || r.includes('eternal-phoenix'))).toBe(true)
  })

  it('warns about cold pyre when overallRebirth < 40', () => {
    const stats = makeStats({ overallRebirth: 30 })
    const result = generateRecommendations([], [], { avgRebirth: 30, avgPrecision: 30, avgWisdom: 30, isOnyx: false, overallRebirth: 30 }, stats)
    expect(result.some((r) => r.includes('not yet risen'))).toBe(true)
  })

  it('lists void feathers by name when <= 5', () => {
    const feathers = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(feathers, [], { avgRebirth: 50, avgPrecision: 50, avgWisdom: 50, isOnyx: false, overallRebirth: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void feathers when > 5', () => {
    const feathers = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(feathers, [], { avgRebirth: 50, avgPrecision: 50, avgWisdom: 50, isOnyx: false, overallRebirth: 50 }, stats)
    expect(result.some((r) => r.includes('6 cold embers'))).toBe(true)
  })

  it('warns when all nests are poor', () => {
    const nests = [{ condition: 'empty-hearth' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], nests as Array<{ condition: string }>, { avgRebirth: 50, avgPrecision: 50, avgWisdom: 50, isOnyx: false, overallRebirth: 50 }, stats)
    expect(result.some((r) => r.includes('empty hearths'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgObsidianRebirth: 70,
      avgAshPrecision: 70,
      avgDarkResilience: 70,
      avgFireClarity: 70,
      avgPhoenixWisdom: 70,
      overallRebirth: 70,
    })
    const result = generateRecommendations([], [], { avgRebirth: 70, avgPrecision: 70, avgWisdom: 70, isOnyx: true, overallRebirth: 70 }, stats)
    expect(result.some((r) => r.includes('dark fire'))).toBe(true)
  })
})

// ─── Format helpers ──────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns different colors for different ranges', () => {
    expect(colorScore(95)).not.toBe(colorScore(10))
  })
})

describe('colorOnyxCondition', () => {
  it('colors onyx-masterpiece', () => {
    expect(typeof colorOnyxCondition('onyx-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorOnyxCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorOnyxCondition('unknown')).toBe('string')
  })
})

describe('colorNestType', () => {
  it('colors phoenix-nest', () => {
    expect(typeof colorNestType('phoenix-nest')).toBe('string')
  })

  it('colors no-nest', () => {
    expect(typeof colorNestType('no-nest')).toBe('string')
  })
})

describe('colorNestCondition', () => {
  it('colors onyx-palace', () => {
    expect(typeof colorNestCondition('onyx-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorNestCondition('void')).toBe('string')
  })
})

describe('colorFirebirdGrade', () => {
  it('colors immortal-phoenix', () => {
    expect(typeof colorFirebirdGrade('immortal-phoenix')).toBe('string')
  })

  it('colors ash', () => {
    expect(typeof colorFirebirdGrade('ash')).toBe('string')
  })
})

describe('formatFeatherTable', () => {
  it('formats a feather with all measures', () => {
    const feather = analyzeOnyxFeather(richContent, 'app.ts')
    const output = formatFeatherTable(feather)
    expect(output).toContain('Onyx Feather: app.ts')
    expect(output).toContain('Obsidian Rebirth')
    expect(output).toContain('Ash Precision')
    expect(output).toContain('Dark Resilience')
    expect(output).toContain('Fire Clarity')
    expect(output).toContain('Phoenix Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatFeathersTable', () => {
  it('shows no feathers message for empty array', () => {
    expect(formatFeathersTable([])).toContain('No onyx feathers')
  })

  it('lists feathers in output', () => {
    const feathers = [analyzeOnyxFeather(richContent, 'a.ts')]
    expect(formatFeathersTable(feathers)).toContain('a.ts')
  })
})

describe('formatNestTable', () => {
  it('formats a nest with all fields', () => {
    const feathers = [analyzeOnyxFeather(richContent, 'a.ts')]
    const nest = analyzeOnyxNest(feathers, 'src')
    const output = formatNestTable(nest)
    expect(output).toContain('Onyx Nest: src')
    expect(output).toContain('Feathers')
    expect(output).toContain('Avg Rebirth')
  })
})

describe('formatNestsTable', () => {
  it('shows no nests message for empty array', () => {
    expect(formatNestsTable([])).toContain('No onyx nests')
  })

  it('lists nests in output', () => {
    const feathers = [analyzeOnyxFeather(richContent, 'a.ts')]
    const nest = analyzeOnyxNest(feathers, 'src')
    expect(formatNestsTable([nest])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildOnyxPhoenixResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Onyx Phoenix Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Firebird Grade')
    expect(output).toContain('Best Feather')
  })
})

describe('formatRecommendations', () => {
  it('shows no recommendations message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('lists recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Fix Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildOnyxPhoenixResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Onyx Phoenix Analysis')
    expect(output).toContain('Pyre Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildOnyxPhoenixResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.feathers).toHaveLength(1)
    expect(parsed.pyre).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
