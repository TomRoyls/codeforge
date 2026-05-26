import { describe, expect, it } from 'vitest'

import {
  analyzeAlexandritePair,
  analyzeAlexandriteShift,
  buildAlexandriteDuskResult,
  classifyAlexandriteCondition,
  classifyGemologistGrade,
  classifyPairCondition,
  classifyPairType,
  generateRecommendations,
  measureAdapting,
  measureDualSurviving,
  measureTransforming,
  measureTransitioning,
  measureUnderstanding,
} from '../src/commands/alexandrite-dusk-helpers.js'
import type { AlexandriteDuskResult } from '../src/commands/alexandrite-dusk-helpers.js'
import {
  colorAlexandriteCondition,
  colorGemologistGrade,
  colorPairCondition,
  colorPairType,
  colorScore,
  formatPairsTable,
  formatPairTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatShiftsTable,
  formatShiftTable,
  formatStatsTable,
} from '../src/commands/alexandrite-dusk-format-helpers.js'

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

const richClr = measureAdapting(richContent).clarity
const richPrec = measureTransitioning(richContent).precision
const richRes = measureDualSurviving(richContent).resilience
const richWis = measureUnderstanding(richContent).wisdom
const richMst = measureTransforming(richContent).mastery

function makeStats(overrides: Partial<AlexandriteDuskResult['stats']> = {}): AlexandriteDuskResult['stats'] {
  return {
    totalFiles: 1,
    totalPairs: 1,
    avgColorShiftClarity: 50,
    avgTwilightPrecision: 50,
    avgDualNatureResilience: 50,
    avgChrysoberylWisdom: 50,
    avgTransformationMastery: 50,
    alexandriteMasterpieceCount: 0,
    imperialGemCount: 0,
    properAlexandriteCount: 0,
    commonChrysoberylCount: 0,
    glassStoneCount: 0,
    voidCount: 0,
    hasHighClarityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    hasHighMasteryCount: 1,
    overallTransformation: 50,
    gemologistGrade: 'proper-appraiser',
    bestShift: 'a.ts',
    mostAdaptive: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    mostTransformative: 'a.ts',
    ...overrides,
  }
}

// ─── measureAdapting ────────────────────────────────────

describe('measureAdapting', () => {
  it('scores rich content highly', () => {
    const result = measureAdapting(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureAdapting(emptyContent).clarity).toBeLessThan(richClr)
  })

  it('detects hasAdaptable (class/interface/type)', () => {
    expect(measureAdapting(richContent).hasAdaptable).toBe(true)
  })

  it('counts rigid keywords', () => {
    const content = 'const rigid = 1; const inflexible = 2; const static = 3; const fixed = 4'
    const result = measureAdapting(content)
    expect(result.rigidCount).toBe(4)
    expect(result.hasNoRigid).toBe(false)
  })

  it('counts hardcoded keywords', () => {
    const content = 'const hardcoded = 1; const hard-coded = 2; const hard.coded = 3; const baked.in = 4'
    const result = measureAdapting(content)
    expect(result.hardcodedCount).toBe(4)
    expect(result.hasNoHardcoded).toBe(false)
  })

  it('detects hasFlexible (type annotations)', () => {
    expect(measureAdapting(richContent).hasFlexible).toBe(true)
  })

  it('detects hasResponsive (JSDoc)', () => {
    expect(measureAdapting(richContent).hasResponsive).toBe(true)
  })

  it('classifies shift correctly for high scores', () => {
    const result = measureAdapting(richContent)
    expect(['dramatic-change', 'clear-shift', 'proper-adaptation']).toContain(result.shift)
  })

  it('classifies shift correctly for low scores', () => {
    expect(measureAdapting(emptyContent).shift).not.toBe('dramatic-change')
  })
})

// ─── measureTransitioning ───────────────────────────────

describe('measureTransitioning', () => {
  it('scores rich content highly', () => {
    const result = measureTransitioning(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureTransitioning(emptyContent).precision).toBeLessThan(richPrec)
  })

  it('detects hasTypeSafe (no any)', () => {
    expect(measureTransitioning(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureTransitioning(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const imprecise = 3; const loose = 4; const sloppy = 5'
    const result = measureTransitioning(content)
    expect(result.approximateCount).toBe(5)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects hasSharp (JSDoc)', () => {
    expect(measureTransitioning(richContent).hasSharp).toBe(true)
  })

  it('classifies phase correctly for high scores', () => {
    const result = measureTransitioning(richContent)
    expect(['perfect-twilight', 'smooth-transition', 'proper-shift']).toContain(result.phase)
  })

  it('classifies phase correctly for low scores', () => {
    expect(measureTransitioning(emptyContent).phase).not.toBe('perfect-twilight')
  })
})

// ─── measureDualSurviving ───────────────────────────────

describe('measureDualSurviving', () => {
  it('scores rich content highly', () => {
    const result = measureDualSurviving(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureDualSurviving(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects hasErrorHandled (try/catch)', () => {
    expect(measureDualSurviving(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const unprocessed = 3; const unresolved = 4'
    const result = measureDualSurviving(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureDualSurviving(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects hasRobust (class/interface/type)', () => {
    expect(measureDualSurviving(richContent).hasRobust).toBe(true)
  })

  it('classifies armor correctly for high scores', () => {
    const result = measureDualSurviving(richContent)
    expect(['double-plated', 'dual-shield', 'proper-defense']).toContain(result.armor)
  })

  it('classifies armor correctly for low scores', () => {
    expect(measureDualSurviving(emptyContent).armor).not.toBe('double-plated')
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

  it('classifies gem correctly for high scores', () => {
    const result = measureUnderstanding(richContent)
    expect(['imperial-alexandrite', 'fine-chrysoberyl', 'proper-gem']).toContain(result.gem)
  })

  it('classifies gem correctly for low scores', () => {
    expect(measureUnderstanding(emptyContent).gem).not.toBe('imperial-alexandrite')
  })
})

// ─── measureTransforming ────────────────────────────────

describe('measureTransforming', () => {
  it('scores rich content highly', () => {
    const result = measureTransforming(richContent)
    expect(result.mastery).toBeGreaterThan(60)
    expect(result.hasHighMastery).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureTransforming(emptyContent).mastery).toBeLessThan(richMst)
  })

  it('detects hasWellStructured (class/interface/type)', () => {
    expect(measureTransforming(richContent).hasWellStructured).toBe(true)
  })

  it('counts spaghetti keywords', () => {
    const content = 'const spaghetti = 1; const tangled = 2; const twisted = 3; const knotted = 4'
    const result = measureTransforming(content)
    expect(result.spaghettiCount).toBe(4)
    expect(result.hasNoSpaghetti).toBe(false)
  })

  it('counts monolithic keywords', () => {
    const content = 'const monolithic = 1; const god.object = 2; const mega = 3'
    const result = measureTransforming(content)
    expect(result.monolithicCount).toBe(3)
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('detects hasEvolved (no any)', () => {
    expect(measureTransforming(richContent).hasEvolved).toBe(true)
  })

  it('detects hasOptimized (JSDoc)', () => {
    expect(measureTransforming(richContent).hasOptimized).toBe(true)
  })

  it('classifies art correctly for high scores', () => {
    const result = measureTransforming(richContent)
    expect(['master-illusionist', 'skilled-shapeshifter', 'proper-adaptor']).toContain(result.art)
  })

  it('classifies art correctly for low scores', () => {
    expect(measureTransforming(emptyContent).art).not.toBe('master-illusionist')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyAlexandriteCondition', () => {
  it('returns alexandrite-masterpiece for 90+', () => {
    expect(classifyAlexandriteCondition(90)).toBe('alexandrite-masterpiece')
    expect(classifyAlexandriteCondition(95)).toBe('alexandrite-masterpiece')
  })

  it('returns imperial-gem for 75-89', () => {
    expect(classifyAlexandriteCondition(75)).toBe('imperial-gem')
  })

  it('returns proper-alexandrite for 60-74', () => {
    expect(classifyAlexandriteCondition(60)).toBe('proper-alexandrite')
  })

  it('returns common-chrysoberyl for 40-59', () => {
    expect(classifyAlexandriteCondition(40)).toBe('common-chrysoberyl')
  })

  it('returns glass-stone for 20-39', () => {
    expect(classifyAlexandriteCondition(20)).toBe('glass-stone')
  })

  it('returns void below 20', () => {
    expect(classifyAlexandriteCondition(0)).toBe('void')
    expect(classifyAlexandriteCondition(10)).toBe('void')
  })
})

describe('classifyPairType', () => {
  it('returns no-pair for empty shifts', () => {
    expect(classifyPairType([])).toBe('no-pair')
  })

  it('returns perfect-pair for avg >= 85', () => {
    const shifts = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyPairType(shifts)).toBe('perfect-pair')
  })

  it('returns empty-case for low avg', () => {
    const shifts = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyPairType(shifts)).toBe('empty-case')
  })
})

describe('classifyPairCondition', () => {
  it('returns alexandrite-palace for 85+', () => {
    expect(classifyPairCondition(85)).toBe('alexandrite-palace')
  })

  it('returns void below 15', () => {
    expect(classifyPairCondition(5)).toBe('void')
  })
})

describe('classifyGemologistGrade', () => {
  it('returns imperial-gemologist for 80+', () => {
    expect(classifyGemologistGrade(80)).toBe('imperial-gemologist')
  })

  it('returns blind-buyer below 20', () => {
    expect(classifyGemologistGrade(5)).toBe('blind-buyer')
  })

  it('returns color-change-expert for 65-79', () => {
    expect(classifyGemologistGrade(65)).toBe('color-change-expert')
  })

  it('returns proper-appraiser for 50-64', () => {
    expect(classifyGemologistGrade(50)).toBe('proper-appraiser')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyGemologistGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyGemologistGrade(20)).toBe('novice')
  })
})

// ─── analyzeAlexandriteShift ────────────────────────────

describe('analyzeAlexandriteShift', () => {
  it('creates a shift with all 5 measures', () => {
    const shift = analyzeAlexandriteShift(richContent, 'app.ts')
    expect(shift.file).toBe('app.ts')
    expect(typeof shift.colorShiftClarity).toBe('number')
    expect(typeof shift.twilightPrecision).toBe('number')
    expect(typeof shift.dualNatureResilience).toBe('number')
    expect(typeof shift.chrysoberylWisdom).toBe('number')
    expect(typeof shift.transformationMastery).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const shift = analyzeAlexandriteShift(richContent, 'app.ts')
    const expected = Math.round(
      shift.colorShiftClarity * 0.2 +
      shift.twilightPrecision * 0.2 +
      shift.dualNatureResilience * 0.2 +
      shift.chrysoberylWisdom * 0.2 +
      shift.transformationMastery * 0.2,
    )
    expect(shift.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const shift = analyzeAlexandriteShift(richContent, 'app.ts')
    expect(shift.condition).toBe(classifyAlexandriteCondition(shift.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richShift = analyzeAlexandriteShift(richContent, 'rich.ts')
    const emptyShift = analyzeAlexandriteShift(emptyContent, 'empty.ts')
    expect(richShift.qualityScore).toBeGreaterThan(emptyShift.qualityScore)
  })
})

// ─── analyzeAlexandritePair ─────────────────────────────

describe('analyzeAlexandritePair', () => {
  it('returns empty pair for no shifts', () => {
    const pair = analyzeAlexandritePair([], 'src')
    expect(pair.directory).toBe('src')
    expect(pair.shifts).toEqual([])
    expect(pair.pairType).toBe('no-pair')
    expect(pair.condition).toBe('void')
  })

  it('computes averages from shifts', () => {
    const shifts = [analyzeAlexandriteShift(richContent, 'a.ts'), analyzeAlexandriteShift(richContent, 'b.ts')]
    const pair = analyzeAlexandritePair(shifts, 'src')
    expect(pair.avgClarity).toBeGreaterThan(0)
    expect(pair.avgResilience).toBeGreaterThan(0)
    expect(pair.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildAlexandriteDuskResult ──────────────────────────

describe('buildAlexandriteDuskResult', () => {
  it('returns full result structure', async () => {
    const result = await buildAlexandriteDuskResult(['a.ts'], [richContent])
    expect(result.shifts).toHaveLength(1)
    expect(result.pairs).toHaveLength(1)
    expect(result.twilight).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into pairs', async () => {
    const result = await buildAlexandriteDuskResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.pairs.length).toBe(2)
  })

  it('computes twilight overview', async () => {
    const result = await buildAlexandriteDuskResult(['a.ts'], [richContent])
    expect(result.twilight.avgClarity).toBeGreaterThan(0)
    expect(result.twilight.isAlexandrite).toBe(true)
    expect(result.twilight.overallTransformation).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildAlexandriteDuskResult([], [])
    expect(result.shifts).toHaveLength(0)
    expect(result.pairs).toHaveLength(0)
    expect(result.twilight.overallTransformation).toBe(0)
    expect(result.twilight.isAlexandrite).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildAlexandriteDuskResult(['a.ts'], [richContent])
    const total = result.stats.alexandriteMasterpieceCount +
      result.stats.imperialGemCount +
      result.stats.properAlexandriteCount +
      result.stats.commonChrysoberylCount +
      result.stats.glassStoneCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildAlexandriteDuskResult(['a.ts'], [richContent])
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighMasteryCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best shift and top performers', async () => {
    const result = await buildAlexandriteDuskResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestShift).toBeTruthy()
    expect(result.stats.mostAdaptive).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
    expect(result.stats.mostTransformative).toBeTruthy()
  })

  it('computes gemologist grade from overall transformation', async () => {
    const result = await buildAlexandriteDuskResult(['a.ts'], [richContent])
    expect(result.stats.gemologistGrade).toBe(classifyGemologistGrade(result.stats.overallTransformation))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgColorShiftClarity: 90,
      avgTwilightPrecision: 90,
      avgDualNatureResilience: 90,
      avgChrysoberylWisdom: 90,
      avgTransformationMastery: 90,
    })
    const result = generateRecommendations([], [], { avgClarity: 90, avgResilience: 90, avgWisdom: 90, isAlexandrite: true, overallTransformation: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('color-shift')
  })

  it('recommends clarity when < 60', () => {
    const stats = makeStats({ avgColorShiftClarity: 50 })
    const result = generateRecommendations([], [], { avgClarity: 50, avgResilience: 50, avgWisdom: 50, isAlexandrite: false, overallTransformation: 50 }, stats)
    expect(result.some((r) => r.includes('color-shift clarity') || r.includes('dramatic-change'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgTwilightPrecision: 50 })
    const result = generateRecommendations([], [], { avgClarity: 50, avgResilience: 50, avgWisdom: 50, isAlexandrite: false, overallTransformation: 50 }, stats)
    expect(result.some((r) => r.includes('twilight precision') || r.includes('perfect-twilight'))).toBe(true)
  })

  it('recommends resilience when < 60', () => {
    const stats = makeStats({ avgDualNatureResilience: 50 })
    const result = generateRecommendations([], [], { avgClarity: 50, avgResilience: 50, avgWisdom: 50, isAlexandrite: false, overallTransformation: 50 }, stats)
    expect(result.some((r) => r.includes('dual-nature resilience') || r.includes('double-plated'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgChrysoberylWisdom: 50 })
    const result = generateRecommendations([], [], { avgClarity: 50, avgResilience: 50, avgWisdom: 50, isAlexandrite: false, overallTransformation: 50 }, stats)
    expect(result.some((r) => r.includes('chrysoberyl wisdom') || r.includes('imperial-alexandrite'))).toBe(true)
  })

  it('recommends mastery when < 60', () => {
    const stats = makeStats({ avgTransformationMastery: 50 })
    const result = generateRecommendations([], [], { avgClarity: 50, avgResilience: 50, avgWisdom: 50, isAlexandrite: false, overallTransformation: 50 }, stats)
    expect(result.some((r) => r.includes('transformation') || r.includes('master-illusionist'))).toBe(true)
  })

  it('warns about frozen when overallTransformation < 40', () => {
    const stats = makeStats({ overallTransformation: 30 })
    const result = generateRecommendations([], [], { avgClarity: 30, avgResilience: 30, avgWisdom: 30, isAlexandrite: false, overallTransformation: 30 }, stats)
    expect(result.some((r) => r.includes('frozen'))).toBe(true)
  })

  it('lists void shifts by name when <= 5', () => {
    const shifts = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(shifts, [], { avgClarity: 50, avgResilience: 50, avgWisdom: 50, isAlexandrite: false, overallTransformation: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void shifts when > 5', () => {
    const shifts = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(shifts, [], { avgClarity: 50, avgResilience: 50, avgWisdom: 50, isAlexandrite: false, overallTransformation: 50 }, stats)
    expect(result.some((r) => r.includes('6 glass stones'))).toBe(true)
  })

  it('warns when all pairs are poor', () => {
    const pairs = [{ condition: 'empty-box' as const, pairType: 'single-stone' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], pairs as Array<{ condition: string; pairType: string }>, { avgClarity: 50, avgResilience: 50, avgWisdom: 50, isAlexandrite: false, overallTransformation: 50 }, stats)
    expect(result.some((r) => r.includes('empty boxes'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgColorShiftClarity: 70,
      avgTwilightPrecision: 70,
      avgDualNatureResilience: 70,
      avgChrysoberylWisdom: 70,
      avgTransformationMastery: 70,
      overallTransformation: 70,
    })
    const result = generateRecommendations([], [], { avgClarity: 70, avgResilience: 70, avgWisdom: 70, isAlexandrite: true, overallTransformation: 70 }, stats)
    expect(result.some((r) => r.includes('transformation brilliance'))).toBe(true)
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

describe('colorAlexandriteCondition', () => {
  it('colors alexandrite-masterpiece', () => {
    expect(typeof colorAlexandriteCondition('alexandrite-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorAlexandriteCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorAlexandriteCondition('unknown')).toBe('string')
  })
})

describe('colorPairType', () => {
  it('colors perfect-pair', () => {
    expect(typeof colorPairType('perfect-pair')).toBe('string')
  })

  it('colors no-pair', () => {
    expect(typeof colorPairType('no-pair')).toBe('string')
  })
})

describe('colorPairCondition', () => {
  it('colors alexandrite-palace', () => {
    expect(typeof colorPairCondition('alexandrite-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorPairCondition('void')).toBe('string')
  })
})

describe('colorGemologistGrade', () => {
  it('colors imperial-gemologist', () => {
    expect(typeof colorGemologistGrade('imperial-gemologist')).toBe('string')
  })

  it('colors blind-buyer', () => {
    expect(typeof colorGemologistGrade('blind-buyer')).toBe('string')
  })
})

describe('formatShiftTable', () => {
  it('formats a shift with all measures', () => {
    const shift = analyzeAlexandriteShift(richContent, 'app.ts')
    const output = formatShiftTable(shift)
    expect(output).toContain('Alexandrite Shift: app.ts')
    expect(output).toContain('Color-Shift Clarity')
    expect(output).toContain('Twilight Precision')
    expect(output).toContain('Dual-Nature Resilience')
    expect(output).toContain('Chrysoberyl Wisdom')
    expect(output).toContain('Transformation Mastery')
    expect(output).toContain('Quality Score')
  })
})

describe('formatShiftsTable', () => {
  it('shows no shifts message for empty array', () => {
    expect(formatShiftsTable([])).toContain('No alexandrite shifts')
  })

  it('lists shifts in output', () => {
    const shifts = [analyzeAlexandriteShift(richContent, 'a.ts')]
    expect(formatShiftsTable(shifts)).toContain('a.ts')
  })
})

describe('formatPairTable', () => {
  it('formats a pair with all fields', () => {
    const shifts = [analyzeAlexandriteShift(richContent, 'a.ts')]
    const pair = analyzeAlexandritePair(shifts, 'src')
    const output = formatPairTable(pair)
    expect(output).toContain('Alexandrite Pair: src')
    expect(output).toContain('Shifts')
    expect(output).toContain('Avg Clarity')
  })
})

describe('formatPairsTable', () => {
  it('shows no pairs message for empty array', () => {
    expect(formatPairsTable([])).toContain('No alexandrite pairs')
  })

  it('lists pairs in output', () => {
    const shifts = [analyzeAlexandriteShift(richContent, 'a.ts')]
    const pair = analyzeAlexandritePair(shifts, 'src')
    expect(formatPairsTable([pair])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildAlexandriteDuskResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Alexandrite Dusk Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Gemologist Grade')
    expect(output).toContain('Best Shift')
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
    const result = await buildAlexandriteDuskResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Alexandrite Dusk Analysis')
    expect(output).toContain('Twilight Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildAlexandriteDuskResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.shifts).toHaveLength(1)
    expect(parsed.twilight).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
