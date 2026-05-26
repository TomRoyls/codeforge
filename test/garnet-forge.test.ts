import { describe, expect, it } from 'vitest'

import {
  analyzeGarnetCrucible,
  analyzeGarnetIngot,
  buildGarnetForgeResult,
  classifyCrucibleCondition,
  classifyCrucibleType,
  classifyGarnetCondition,
  classifySmithGrade,
  generateRecommendations,
  measureEnduring,
  measureFocusing,
  measureSurviving,
  measureTransforming,
  measureUnderstanding,
} from '../src/commands/garnet-forge-helpers.js'
import type { GarnetForgeResult } from '../src/commands/garnet-forge-helpers.js'
import {
  colorCrucibleCondition,
  colorCrucibleType,
  colorGarnetCondition,
  colorScore,
  colorSmithGrade,
  formatCrucibleTable,
  formatCruciblesTable,
  formatIngotTable,
  formatIngotsTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/garnet-forge-format-helpers.js'

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

const richEnd = measureEnduring(richContent).endurance
const richMas = measureTransforming(richContent).mastery
const richPre = measureFocusing(richContent).precision
const richRes = measureSurviving(richContent).resilience
const richWis = measureUnderstanding(richContent).wisdom

function makeStats(overrides: Partial<GarnetForgeResult['stats']> = {}): GarnetForgeResult['stats'] {
  return {
    totalFiles: 1,
    totalCrucibles: 1,
    avgCrimsonEndurance: 50,
    avgFlameMastery: 50,
    avgEmberPrecision: 50,
    avgHeatResilience: 50,
    avgForgeWisdom: 50,
    garnetMasterpieceCount: 0,
    crimsonGemCount: 0,
    properGarnetCount: 0,
    roughStoneCount: 0,
    rawOreCount: 0,
    voidCount: 0,
    hasHighEnduranceCount: 1,
    hasHighMasteryCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallTemper: 50,
    smithGrade: 'proper-forge-worker',
    bestIngot: 'a.ts',
    mostEnduring: 'a.ts',
    mostMasterful: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureEnduring ─────────────────────────────────────

describe('measureEnduring', () => {
  it('scores rich content highly', () => {
    const result = measureEnduring(richContent)
    expect(result.endurance).toBeGreaterThan(60)
    expect(result.hasHighEndurance).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureEnduring(emptyContent).endurance).toBeLessThan(richEnd)
  })

  it('detects stable (class/interface/type)', () => {
    expect(measureEnduring(richContent).hasStable).toBe(true)
  })

  it('counts fragile keywords', () => {
    const content = 'const fragile = 1; const brittle = 2; const flimsy = 3; const delicate = 4'
    const result = measureEnduring(content)
    expect(result.fragileCount).toBe(4)
    expect(result.hasNoFragile).toBe(false)
  })

  it('counts volatile keywords', () => {
    const content = 'const volatile = 1; const unstable = 2; const erratic = 3; const temperamental = 4'
    const result = measureEnduring(content)
    expect(result.volatileCount).toBe(4)
    expect(result.hasNoVolatile).toBe(false)
  })

  it('detects robust (import/export)', () => {
    expect(measureEnduring(richContent).hasRobust).toBe(true)
  })

  it('detects tested (try/catch)', () => {
    expect(measureEnduring(richContent).hasTested).toBe(true)
  })

  it('detects durable (type annotations)', () => {
    expect(measureEnduring(richContent).hasDurable).toBe(true)
  })

  it('detects enduring (readonly/private/protected)', () => {
    expect(measureEnduring(richContent).hasEnduring).toBe(true)
  })

  it('detects permanent (JSDoc)', () => {
    expect(measureEnduring(richContent).hasPermanent).toBe(true)
  })

  it('classifies stone correctly for high scores', () => {
    const result = measureEnduring(richContent)
    expect(['almandine-grade', 'pyrope-hard', 'proper-garnet']).toContain(result.stone)
  })

  it('classifies stone correctly for low scores', () => {
    expect(measureEnduring(emptyContent).stone).not.toBe('almandine-grade')
  })

  it('detects steadfast (async/await/Promise)', () => {
    expect(measureEnduring(richContent).hasSteadfast).toBe(true)
  })

  it('detects resilient (if/return)', () => {
    expect(measureEnduring(richContent).hasResilient).toBe(true)
  })
})

// ─── measureTransforming ─────────────────────────────────

describe('measureTransforming', () => {
  it('scores rich content highly', () => {
    const result = measureTransforming(richContent)
    expect(result.mastery).toBeGreaterThan(60)
    expect(result.hasHighMastery).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureTransforming(emptyContent).mastery).toBeLessThan(richMas)
  })

  it('counts spaghetti keywords', () => {
    const content = 'const spaghetti = 1; const tangled = 2; const knotted = 3; const muddled = 4'
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

  it('detects well-structured (class/interface/type)', () => {
    expect(measureTransforming(richContent).hasWellStructured).toBe(true)
  })

  it('detects modular (import/export)', () => {
    expect(measureTransforming(richContent).hasModular).toBe(true)
  })

  it('detects crafted (readonly/private/protected)', () => {
    expect(measureTransforming(richContent).hasCrafted).toBe(true)
  })

  it('detects shaped (JSDoc)', () => {
    expect(measureTransforming(richContent).hasShaped).toBe(true)
  })

  it('detects evolved (async/await/Promise)', () => {
    expect(measureTransforming(richContent).hasEvolved).toBe(true)
  })

  it('classifies flame correctly for high scores', () => {
    const result = measureTransforming(richContent)
    expect(['white-flame', 'blue-fire', 'proper-heat']).toContain(result.flame)
  })

  it('classifies flame correctly for low scores', () => {
    expect(measureTransforming(emptyContent).flame).not.toBe('white-flame')
  })
})

// ─── measureFocusing ─────────────────────────────────────

describe('measureFocusing', () => {
  it('scores rich content highly', () => {
    const result = measureFocusing(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureFocusing(emptyContent).precision).toBeLessThan(richPre)
  })

  it('detects type-safe (no any)', () => {
    expect(measureFocusing(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureFocusing(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3; const imprecise = 4'
    const result = measureFocusing(content)
    expect(result.approximateCount).toBe(4)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects exact (class/interface/type)', () => {
    expect(measureFocusing(richContent).hasExact).toBe(true)
  })

  it('detects precise (readonly/private/protected)', () => {
    expect(measureFocusing(richContent).hasPrecise).toBe(true)
  })

  it('detects crisp (JSDoc)', () => {
    expect(measureFocusing(richContent).hasCrisp).toBe(true)
  })

  it('classifies heat correctly for high scores', () => {
    const result = measureFocusing(richContent)
    expect(['surgical-flame', 'focused-laser', 'proper-heat']).toContain(result.heat)
  })

  it('classifies heat correctly for low scores', () => {
    expect(measureFocusing(emptyContent).heat).not.toBe('surgical-flame')
  })

  it('detects pinpoint (async/await/Promise)', () => {
    expect(measureFocusing(richContent).hasPinpoint).toBe(true)
  })

  it('detects concentrated (try/catch/if)', () => {
    expect(measureFocusing(richContent).hasConcentrated).toBe(true)
  })
})

// ─── measureSurviving ────────────────────────────────────

describe('measureSurviving', () => {
  it('scores rich content highly', () => {
    const result = measureSurviving(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureSurviving(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects error-handled (try/catch)', () => {
    expect(measureSurviving(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const bare-throw = 3; const raw-error = 4'
    const result = measureSurviving(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts vulnerable keywords', () => {
    const content = 'const vulnerable = 1; const exposed = 2; const defenseless = 3; const unprotected = 4'
    const result = measureSurviving(content)
    expect(result.vulnerableCount).toBe(4)
  })

  it('detects defensive (if/return)', () => {
    expect(measureSurviving(richContent).hasDefensive).toBe(true)
  })

  it('detects robust (import/export)', () => {
    expect(measureSurviving(richContent).hasRobust).toBe(true)
  })

  it('detects protected (readonly/private/protected)', () => {
    expect(measureSurviving(richContent).hasProtected).toBe(true)
  })

  it('classifies shield correctly for high scores', () => {
    const result = measureSurviving(richContent)
    expect(['fireproof-vault', 'heat-shield', 'proper-insulation']).toContain(result.shield)
  })

  it('classifies shield correctly for low scores', () => {
    expect(measureSurviving(emptyContent).shield).not.toBe('fireproof-vault')
  })

  it('detects unbreachable (async/await/Promise)', () => {
    expect(measureSurviving(richContent).hasUnbreachable).toBe(true)
  })
})

// ─── measureUnderstanding ────────────────────────────────

describe('measureUnderstanding', () => {
  it('scores rich content highly', () => {
    const result = measureUnderstanding(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureUnderstanding(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects well-architected (class/interface/type)', () => {
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

  it('detects principled (no any)', () => {
    expect(measureUnderstanding(richContent).hasPrincipled).toBe(true)
  })

  it('detects visionary (async/await/Promise)', () => {
    expect(measureUnderstanding(richContent).hasVisionary).toBe(true)
  })

  it('detects mature (import/export)', () => {
    expect(measureUnderstanding(richContent).hasMature).toBe(true)
  })

  it('detects insightful (JSDoc)', () => {
    expect(measureUnderstanding(richContent).hasInsightful).toBe(true)
  })

  it('classifies craft correctly for high scores', () => {
    const result = measureUnderstanding(richContent)
    expect(['master-forge-smith', 'veteran-smith', 'proper-artisan']).toContain(result.craft)
  })

  it('classifies craft correctly for low scores', () => {
    expect(measureUnderstanding(emptyContent).craft).not.toBe('master-forge-smith')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyGarnetCondition', () => {
  it('returns garnet-masterpiece for 90+', () => {
    expect(classifyGarnetCondition(90)).toBe('garnet-masterpiece')
    expect(classifyGarnetCondition(95)).toBe('garnet-masterpiece')
  })

  it('returns crimson-gem for 75-89', () => {
    expect(classifyGarnetCondition(75)).toBe('crimson-gem')
  })

  it('returns proper-garnet for 60-74', () => {
    expect(classifyGarnetCondition(60)).toBe('proper-garnet')
  })

  it('returns rough-stone for 40-59', () => {
    expect(classifyGarnetCondition(40)).toBe('rough-stone')
  })

  it('returns raw-ore for 20-39', () => {
    expect(classifyGarnetCondition(20)).toBe('raw-ore')
  })

  it('returns void below 20', () => {
    expect(classifyGarnetCondition(0)).toBe('void')
    expect(classifyGarnetCondition(10)).toBe('void')
  })
})

describe('classifyCrucibleType', () => {
  it('returns no-crucible for empty ingots', () => {
    expect(classifyCrucibleType([])).toBe('no-crucible')
  })

  it('returns grand-forge for avg >= 85', () => {
    const ingots = [{ qualityScore: 90 }] as any
    expect(classifyCrucibleType(ingots)).toBe('grand-forge')
  })

  it('returns cold-hearth for low avg', () => {
    const ingots = [{ qualityScore: 10 }] as any
    expect(classifyCrucibleType(ingots)).toBe('cold-hearth')
  })
})

describe('classifyCrucibleCondition', () => {
  it('returns garnet-palace for 85+', () => {
    expect(classifyCrucibleCondition(85)).toBe('garnet-palace')
  })

  it('returns void below 15', () => {
    expect(classifyCrucibleCondition(5)).toBe('void')
  })
})

describe('classifySmithGrade', () => {
  it('returns forge-master for 80+', () => {
    expect(classifySmithGrade(80)).toBe('forge-master')
  })

  it('returns bellows-boy below 20', () => {
    expect(classifySmithGrade(5)).toBe('bellows-boy')
  })

  it('returns veteran-smith for 65-79', () => {
    expect(classifySmithGrade(65)).toBe('veteran-smith')
  })

  it('returns proper-forge-worker for 50-64', () => {
    expect(classifySmithGrade(50)).toBe('proper-forge-worker')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifySmithGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifySmithGrade(20)).toBe('novice')
  })
})

// ─── analyzeGarnetIngot ──────────────────────────────────

describe('analyzeGarnetIngot', () => {
  it('creates an ingot with all 5 measures', () => {
    const ingot = analyzeGarnetIngot(richContent, 'app.ts')
    expect(ingot.file).toBe('app.ts')
    expect(typeof ingot.crimsonEndurance).toBe('number')
    expect(typeof ingot.flameMastery).toBe('number')
    expect(typeof ingot.emberPrecision).toBe('number')
    expect(typeof ingot.heatResilience).toBe('number')
    expect(typeof ingot.forgeWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const ingot = analyzeGarnetIngot(richContent, 'app.ts')
    const expected = Math.round(
      ingot.crimsonEndurance * 0.2 +
      ingot.flameMastery * 0.2 +
      ingot.emberPrecision * 0.2 +
      ingot.heatResilience * 0.2 +
      ingot.forgeWisdom * 0.2,
    )
    expect(ingot.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const ingot = analyzeGarnetIngot(richContent, 'app.ts')
    expect(ingot.condition).toBe(classifyGarnetCondition(ingot.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richIngot = analyzeGarnetIngot(richContent, 'rich.ts')
    const emptyIngot = analyzeGarnetIngot(emptyContent, 'empty.ts')
    expect(richIngot.qualityScore).toBeGreaterThan(emptyIngot.qualityScore)
  })
})

// ─── analyzeGarnetCrucible ───────────────────────────────

describe('analyzeGarnetCrucible', () => {
  it('returns empty crucible for no ingots', () => {
    const crucible = analyzeGarnetCrucible([], 'src')
    expect(crucible.directory).toBe('src')
    expect(crucible.ingots).toEqual([])
    expect(crucible.crucibleType).toBe('no-crucible')
    expect(crucible.condition).toBe('void')
  })

  it('computes averages from ingots', () => {
    const ingots = [analyzeGarnetIngot(richContent, 'a.ts'), analyzeGarnetIngot(richContent, 'b.ts')]
    const crucible = analyzeGarnetCrucible(ingots, 'src')
    expect(crucible.avgEndurance).toBeGreaterThan(0)
    expect(crucible.avgPrecision).toBeGreaterThan(0)
    expect(crucible.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildGarnetForgeResult ──────────────────────────────

describe('buildGarnetForgeResult', () => {
  it('returns full result structure', async () => {
    const result = await buildGarnetForgeResult(['a.ts'], [richContent])
    expect(result.ingots).toHaveLength(1)
    expect(result.crucibles).toHaveLength(1)
    expect(result.furnace).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into crucibles', async () => {
    const result = await buildGarnetForgeResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.crucibles.length).toBe(2)
  })

  it('computes furnace overview', async () => {
    const result = await buildGarnetForgeResult(['a.ts'], [richContent])
    expect(result.furnace.avgEndurance).toBeGreaterThan(0)
    expect(result.furnace.isGarnet).toBe(true)
    expect(result.furnace.overallTemper).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildGarnetForgeResult([], [])
    expect(result.ingots).toHaveLength(0)
    expect(result.crucibles).toHaveLength(0)
    expect(result.furnace.overallTemper).toBe(0)
    expect(result.furnace.isGarnet).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildGarnetForgeResult(['a.ts'], [richContent])
    const total = result.stats.garnetMasterpieceCount +
      result.stats.crimsonGemCount +
      result.stats.properGarnetCount +
      result.stats.roughStoneCount +
      result.stats.rawOreCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildGarnetForgeResult(['a.ts'], [richContent])
    expect(result.stats.hasHighEnduranceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighMasteryCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best ingot and top performers', async () => {
    const result = await buildGarnetForgeResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestIngot).toBeTruthy()
    expect(result.stats.mostEnduring).toBeTruthy()
    expect(result.stats.mostMasterful).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes smith grade from overall temper', async () => {
    const result = await buildGarnetForgeResult(['a.ts'], [richContent])
    expect(result.stats.smithGrade).toBe(classifySmithGrade(result.stats.overallTemper))
  })
})

// ─── generateRecommendations ─────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgCrimsonEndurance: 90,
      avgFlameMastery: 90,
      avgEmberPrecision: 90,
      avgHeatResilience: 90,
      avgForgeWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgEndurance: 90, avgPrecision: 90, avgWisdom: 90, isGarnet: true, overallTemper: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('garnet forge burns')
  })

  it('recommends endurance when < 60', () => {
    const stats = makeStats({ avgCrimsonEndurance: 50 })
    const result = generateRecommendations([], [], { avgEndurance: 50, avgPrecision: 50, avgWisdom: 50, isGarnet: false, overallTemper: 50 }, stats)
    expect(result.some((r) => r.includes('endurance') || r.includes('crimson'))).toBe(true)
  })

  it('recommends mastery when < 60', () => {
    const stats = makeStats({ avgFlameMastery: 50 })
    const result = generateRecommendations([], [], { avgEndurance: 50, avgPrecision: 50, avgWisdom: 50, isGarnet: false, overallTemper: 50 }, stats)
    expect(result.some((r) => r.includes('flame') || r.includes('mastery'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgEmberPrecision: 50 })
    const result = generateRecommendations([], [], { avgEndurance: 50, avgPrecision: 50, avgWisdom: 50, isGarnet: false, overallTemper: 50 }, stats)
    expect(result.some((r) => r.includes('ember') || r.includes('precision'))).toBe(true)
  })

  it('recommends resilience when < 60', () => {
    const stats = makeStats({ avgHeatResilience: 50 })
    const result = generateRecommendations([], [], { avgEndurance: 50, avgPrecision: 50, avgWisdom: 50, isGarnet: false, overallTemper: 50 }, stats)
    expect(result.some((r) => r.includes('resilience') || r.includes('heat'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgForgeWisdom: 50 })
    const result = generateRecommendations([], [], { avgEndurance: 50, avgPrecision: 50, avgWisdom: 50, isGarnet: false, overallTemper: 50 }, stats)
    expect(result.some((r) => r.includes('wisdom') || r.includes('forge'))).toBe(true)
  })

  it('warns about cold forge when temper < 40', () => {
    const stats = makeStats({ overallTemper: 30 })
    const result = generateRecommendations([], [], { avgEndurance: 30, avgPrecision: 30, avgWisdom: 30, isGarnet: false, overallTemper: 30 }, stats)
    expect(result.some((r) => r.includes('cold'))).toBe(true)
  })

  it('lists void ingots by name when <= 5', () => {
    const ingots = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as any))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(ingots, [], { avgEndurance: 50, avgPrecision: 50, avgWisdom: 50, isGarnet: false, overallTemper: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void ingots when > 5', () => {
    const ingots = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as any))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(ingots, [], { avgEndurance: 50, avgPrecision: 50, avgWisdom: 50, isGarnet: false, overallTemper: 50 }, stats)
    expect(result.some((r) => r.includes('6 raw ores'))).toBe(true)
  })

  it('warns when all crucibles are poor', () => {
    const crucibles = [{ condition: 'empty-hearth' as const, crucibleType: 'cold-hearth' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], crucibles as any, { avgEndurance: 50, avgPrecision: 50, avgWisdom: 50, isGarnet: false, overallTemper: 50 }, stats)
    expect(result.some((r) => r.includes('empty hearths'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgCrimsonEndurance: 70,
      avgFlameMastery: 70,
      avgEmberPrecision: 70,
      avgHeatResilience: 70,
      avgForgeWisdom: 70,
      overallTemper: 70,
    })
    const result = generateRecommendations([], [], { avgEndurance: 70, avgPrecision: 70, avgWisdom: 70, isGarnet: true, overallTemper: 70 }, stats)
    expect(result.some((r) => r.includes('burns true'))).toBe(true)
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

describe('colorGarnetCondition', () => {
  it('colors garnet-masterpiece', () => {
    expect(typeof colorGarnetCondition('garnet-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorGarnetCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorGarnetCondition('unknown')).toBe('string')
  })
})

describe('colorCrucibleType', () => {
  it('colors grand-forge', () => {
    expect(typeof colorCrucibleType('grand-forge')).toBe('string')
  })

  it('colors no-crucible', () => {
    expect(typeof colorCrucibleType('no-crucible')).toBe('string')
  })
})

describe('colorCrucibleCondition', () => {
  it('colors garnet-palace', () => {
    expect(typeof colorCrucibleCondition('garnet-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorCrucibleCondition('void')).toBe('string')
  })
})

describe('colorSmithGrade', () => {
  it('colors forge-master', () => {
    expect(typeof colorSmithGrade('forge-master')).toBe('string')
  })

  it('colors bellows-boy', () => {
    expect(typeof colorSmithGrade('bellows-boy')).toBe('string')
  })
})

describe('formatIngotTable', () => {
  it('formats an ingot with all measures', () => {
    const ingot = analyzeGarnetIngot(richContent, 'app.ts')
    const output = formatIngotTable(ingot)
    expect(output).toContain('Garnet Ingot: app.ts')
    expect(output).toContain('Crimson Endurance')
    expect(output).toContain('Flame Mastery')
    expect(output).toContain('Ember Precision')
    expect(output).toContain('Heat Resilience')
    expect(output).toContain('Forge Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatIngotsTable', () => {
  it('shows no ingots message for empty array', () => {
    expect(formatIngotsTable([])).toContain('No garnet ingots')
  })

  it('lists ingots in output', () => {
    const ingots = [analyzeGarnetIngot(richContent, 'a.ts')]
    expect(formatIngotsTable(ingots)).toContain('a.ts')
  })
})

describe('formatCrucibleTable', () => {
  it('formats a crucible with all fields', () => {
    const ingots = [analyzeGarnetIngot(richContent, 'a.ts')]
    const crucible = analyzeGarnetCrucible(ingots, 'src')
    const output = formatCrucibleTable(crucible)
    expect(output).toContain('Garnet Crucible: src')
    expect(output).toContain('Ingots')
    expect(output).toContain('Avg Endurance')
  })
})

describe('formatCruciblesTable', () => {
  it('shows no crucibles message for empty array', () => {
    expect(formatCruciblesTable([])).toContain('No garnet crucibles')
  })

  it('lists crucibles in output', () => {
    const ingots = [analyzeGarnetIngot(richContent, 'a.ts')]
    const crucible = analyzeGarnetCrucible(ingots, 'src')
    expect(formatCruciblesTable([crucible])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildGarnetForgeResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Garnet Forge Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Smith Grade')
    expect(output).toContain('Best Ingot')
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
    const result = await buildGarnetForgeResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Garnet Forge Analysis')
    expect(output).toContain('Furnace Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildGarnetForgeResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.ingots).toHaveLength(1)
    expect(parsed.furnace).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
