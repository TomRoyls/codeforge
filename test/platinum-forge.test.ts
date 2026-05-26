import { describe, expect, it } from 'vitest'

import {
  analyzePlatinumFoundry,
  analyzePlatinumIngot,
  buildPlatinumForgeResult,
  classifyFoundryCondition,
  classifyFoundryType,
  classifyIngotCondition,
  classifySmithGrade,
  generateRecommendations,
  measureRefining,
  measureShaping,
  measureSmithing,
  measureTempering,
  measureTesting,
} from '../src/commands/platinum-forge-helpers.js'
import type { PlatinumForgeResult, PlatinumIngot } from '../src/commands/platinum-forge-helpers.js'
import {
  colorCondition,
  colorScore,
  formatFoundriesTable,
  formatFoundryTable,
  formatIngotsTable,
  formatIngotTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/platinum-forge-format-helpers.js'

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

function makeStats(overrides: Partial<PlatinumForgeResult['stats']> = {}): PlatinumForgeResult['stats'] {
  return {
    totalFiles: 1,
    totalFoundries: 1,
    avgNoblePurity: 90,
    avgForgeMastery: 90,
    avgAnvilPrecision: 90,
    avgHammerResilience: 90,
    avgCrucibleWisdom: 90,
    platinumMasterpieceCount: 1,
    refinedIngotCount: 0,
    properMetalCount: 0,
    baseAlloyCount: 0,
    rawOreCount: 0,
    voidCount: 0,
    hasHighPurityCount: 1,
    hasHighMasteryCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallRefinement: 90,
    smithGrade: 'grand-master',
    bestIngot: 'a.ts',
    purest: 'a.ts',
    mostMasterful: 'a.ts',
    mostPrecise: 'a.ts',
    toughest: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureRefining ────────────────────────────────────

describe('measureRefining', () => {
  it('scores rich content highly', () => {
    const result = measureRefining(richContent)
    expect(result.purity).toBeGreaterThan(60)
    expect(result.hasClean).toBe(true)
    expect(result.hasNoHack).toBe(true)
    expect(result.hasSpotless).toBe(true)
    expect(result.hasPure).toBe(true)
  })

  it('scores empty content lower than rich', () => {
    const result = measureRefining(emptyContent)
    const rich = measureRefining(richContent)
    expect(result.purity).toBeLessThan(rich.purity)
    expect(result.hackCount).toBe(0)
    expect(result.workaroundCount).toBe(0)
  })

  it('detects hack patterns', () => {
    const result = measureRefining('const hack = true; const kludge = true')
    expect(result.hasNoHack).toBe(false)
    expect(result.hackCount).toBeGreaterThan(0)
  })

  it('detects workaround patterns', () => {
    const result = measureRefining('const workaround = true')
    expect(result.hasNoWorkaround).toBe(false)
    expect(result.workaroundCount).toBeGreaterThan(0)
  })

  it('classifies grade correctly', () => {
    const high = measureRefining(richContent)
    expect(['triple-nine', 'double-nine', 'proper-grade']).toContain(high.grade)
  })
})

// ─── measureSmithing ────────────────────────────────────

describe('measureSmithing', () => {
  it('scores rich content highly', () => {
    const result = measureSmithing(richContent)
    expect(result.mastery).toBeGreaterThan(60)
    expect(result.hasWellStructured).toBe(true)
    expect(result.hasModular).toBe(true)
    expect(result.hasProficient).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureSmithing(emptyContent)
    expect(result.mastery).toBeLessThan(55)
    expect(result.spaghettiCount).toBe(0)
    expect(result.monolithicCount).toBe(0)
  })

  it('detects monolithic patterns', () => {
    const result = measureSmithing('const monolithic = true; const godObject = true')
    expect(result.hasNoMonolithic).toBe(false)
    expect(result.monolithicCount).toBeGreaterThan(0)
  })

  it('classifies skill correctly', () => {
    const high = measureSmithing(richContent)
    expect(['master-smith', 'journeyman', 'proper-craftsman']).toContain(high.skill)
  })
})

// ─── measureShaping ─────────────────────────────────────

describe('measureShaping', () => {
  it('scores rich content highly', () => {
    const result = measureShaping(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasTypeSafe).toBe(true)
    expect(result.hasExact).toBe(true)
    expect(result.hasSharp).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureShaping(emptyContent)
    expect(result.precision).toBeLessThan(55)
    expect(result.unsafeCount).toBe(0)
    expect(result.approximateCount).toBe(0)
  })

  it('detects unsafe patterns', () => {
    const result = measureShaping('var x = 1; eval("test")')
    expect(result.hasNoUnsafe).toBe(false)
    expect(result.unsafeCount).toBeGreaterThan(0)
  })

  it('classifies cut correctly', () => {
    const high = measureShaping(richContent)
    expect(['surgical-precision', 'fine-tooling', 'proper-shaping']).toContain(high.cut)
  })
})

// ─── measureTempering ───────────────────────────────────

describe('measureTempering', () => {
  it('scores rich content highly', () => {
    const result = measureTempering(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasErrorHandled).toBe(true)
    expect(result.hasTested).toBe(true)
    expect(result.hasDefensive).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureTempering(emptyContent)
    expect(result.resilience).toBeLessThan(55)
    expect(result.unhandledCount).toBe(0)
    expect(result.untestedCount).toBe(0)
  })

  it('detects untested patterns', () => {
    const result = measureTempering('eval("test"); Function("x")')
    expect(result.hasNoUntested).toBe(false)
    expect(result.untestedCount).toBeGreaterThan(0)
  })

  it('classifies temper correctly', () => {
    const high = measureTempering(richContent)
    expect(['unbreakable', 'spring-steel', 'proper-temper']).toContain(high.temper)
  })
})

// ─── measureTesting ─────────────────────────────────────

describe('measureTesting', () => {
  it('scores rich content highly', () => {
    const result = measureTesting(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasWellArchitected).toBe(true)
    expect(result.hasPrincipled).toBe(true)
    expect(result.hasMature).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureTesting(emptyContent)
    expect(result.wisdom).toBeLessThan(55)
    expect(result.hackedCount).toBe(0)
    expect(result.shallowCount).toBe(0)
  })

  it('detects hacked patterns', () => {
    const result = measureTesting('const hack = true; const workaround = true')
    expect(result.hasNoHacked).toBe(false)
    expect(result.hackedCount).toBeGreaterThan(0)
  })

  it('classifies trial correctly', () => {
    const high = measureTesting(richContent)
    expect(['fire-proven', 'forge-tested', 'proper-trial']).toContain(high.trial)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyIngotCondition', () => {
  it('classifies platinum-masterpiece at 90+', () => {
    expect(classifyIngotCondition(90)).toBe('platinum-masterpiece')
    expect(classifyIngotCondition(100)).toBe('platinum-masterpiece')
  })

  it('classifies refined-ingot at 75-89', () => {
    expect(classifyIngotCondition(75)).toBe('refined-ingot')
  })

  it('classifies proper-metal at 60-74', () => {
    expect(classifyIngotCondition(60)).toBe('proper-metal')
  })

  it('classifies base-alloy at 40-59', () => {
    expect(classifyIngotCondition(40)).toBe('base-alloy')
  })

  it('classifies raw-ore at 20-39', () => {
    expect(classifyIngotCondition(20)).toBe('raw-ore')
  })

  it('classifies void below 20', () => {
    expect(classifyIngotCondition(0)).toBe('void')
  })
})

describe('classifyFoundryType', () => {
  it('returns no-foundry for empty array', () => {
    expect(classifyFoundryType([])).toBe('no-foundry')
  })

  it('classifies world-class for high avg', () => {
    const ingots = [{ qualityScore: 90 }, { qualityScore: 90 }].map((q) => ({ qualityScore: q.qualityScore } as PlatinumIngot))
    expect(classifyFoundryType(ingots)).toBe('world-class')
  })

  it('classifies cold-hearth for low avg', () => {
    const ingots = [{ qualityScore: 10 }, { qualityScore: 10 }].map((q) => ({ qualityScore: q.qualityScore } as PlatinumIngot))
    expect(classifyFoundryType(ingots)).toBe('cold-hearth')
  })
})

describe('classifyFoundryCondition', () => {
  it('classifies platinum-palace at 85+', () => {
    expect(classifyFoundryCondition(85)).toBe('platinum-palace')
  })

  it('classifies void below 15', () => {
    expect(classifyFoundryCondition(0)).toBe('void')
  })
})

describe('classifySmithGrade', () => {
  it('classifies grand-master at 80+', () => {
    expect(classifySmithGrade(80)).toBe('grand-master')
  })

  it('classifies bellows-boy below 20', () => {
    expect(classifySmithGrade(0)).toBe('bellows-boy')
  })
})

// ─── analyzePlatinumIngot ───────────────────────────────

describe('analyzePlatinumIngot', () => {
  it('returns complete ingot for rich content', () => {
    const ingot = analyzePlatinumIngot(richContent, 'app.ts')
    expect(ingot.file).toBe('app.ts')
    expect(ingot.noblePurity).toBeGreaterThan(0)
    expect(ingot.forgeMastery).toBeGreaterThan(0)
    expect(ingot.anvilPrecision).toBeGreaterThan(0)
    expect(ingot.hammerResilience).toBeGreaterThan(0)
    expect(ingot.crucibleWisdom).toBeGreaterThan(0)
    expect(ingot.qualityScore).toBeGreaterThan(0)
    expect(ingot.condition).toBeDefined()
  })

  it('computes qualityScore as weighted average', () => {
    const ingot = analyzePlatinumIngot(richContent, 'test.ts')
    const expected = Math.round(
      ingot.noblePurity * 0.2 +
      ingot.forgeMastery * 0.2 +
      ingot.anvilPrecision * 0.2 +
      ingot.hammerResilience * 0.2 +
      ingot.crucibleWisdom * 0.2,
    )
    expect(ingot.qualityScore).toBe(expected)
  })

  it('handles empty content', () => {
    const ingot = analyzePlatinumIngot(emptyContent, 'empty.ts')
    expect(ingot.file).toBe('empty.ts')
    expect(ingot.qualityScore).toBeGreaterThanOrEqual(0)
  })
})

// ─── analyzePlatinumFoundry ─────────────────────────────

describe('analyzePlatinumFoundry', () => {
  it('returns empty foundry for no ingots', () => {
    const foundry = analyzePlatinumFoundry([], 'empty-dir')
    expect(foundry.directory).toBe('empty-dir')
    expect(foundry.ingots).toEqual([])
    expect(foundry.foundryType).toBe('no-foundry')
    expect(foundry.condition).toBe('void')
  })

  it('computes averages from ingots', () => {
    const ingots = [analyzePlatinumIngot(richContent, 'a.ts'), analyzePlatinumIngot(richContent, 'b.ts')]
    const foundry = analyzePlatinumFoundry(ingots, 'src')
    expect(foundry.avgPurity).toBeGreaterThan(0)
    expect(foundry.avgMastery).toBeGreaterThan(0)
    expect(foundry.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildPlatinumForgeResult ───────────────────────────

describe('buildPlatinumForgeResult', () => {
  it('returns complete result for single file', async () => {
    const result = await buildPlatinumForgeResult(['app.ts'], [richContent])
    expect(result.ingots).toHaveLength(1)
    expect(result.foundries).toHaveLength(1)
    expect(result.furnace).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
    expect(result.stats.totalFiles).toBe(1)
  })

  it('returns empty result for no files', async () => {
    const result = await buildPlatinumForgeResult([], [])
    expect(result.ingots).toHaveLength(0)
    expect(result.foundries).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.furnace.isPlatinum).toBe(false)
  })

  it('groups files by directory into foundries', async () => {
    const result = await buildPlatinumForgeResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.foundries).toHaveLength(2)
    expect(result.stats.totalFoundries).toBe(2)
  })

  it('finds best ingot', async () => {
    const result = await buildPlatinumForgeResult(['good.ts', 'bad.ts'], [richContent, emptyContent])
    expect(result.stats.bestIngot).toBe('good.ts')
  })

  it('finds purest file', async () => {
    const result = await buildPlatinumForgeResult(['pure.ts', 'dirty.ts'], [richContent, emptyContent])
    expect(result.stats.purest).toBe('pure.ts')
  })

  it('finds most masterful file', async () => {
    const result = await buildPlatinumForgeResult(['skilled.ts', 'novice.ts'], [richContent, emptyContent])
    expect(result.stats.mostMasterful).toBe('skilled.ts')
  })

  it('finds most precise file', async () => {
    const result = await buildPlatinumForgeResult(['precise.ts', 'rough.ts'], [richContent, emptyContent])
    expect(result.stats.mostPrecise).toBe('precise.ts')
  })

  it('finds toughest file', async () => {
    const result = await buildPlatinumForgeResult(['tough.ts', 'brittle.ts'], [richContent, emptyContent])
    expect(result.stats.toughest).toBe('tough.ts')
  })

  it('finds wisest file', async () => {
    const result = await buildPlatinumForgeResult(['wise.ts', 'naive.ts'], [richContent, emptyContent])
    expect(result.stats.wisest).toBe('wise.ts')
  })

  it('counts condition categories', async () => {
    const result = await buildPlatinumForgeResult(['good.ts', 'bad.ts'], [richContent, emptyContent])
    const total =
      result.stats.platinumMasterpieceCount +
      result.stats.refinedIngotCount +
      result.stats.properMetalCount +
      result.stats.baseAlloyCount +
      result.stats.rawOreCount +
      result.stats.voidCount
    expect(total).toBe(2)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all 90+', () => {
    const furnace: PlatinumForgeResult['furnace'] = {
      avgPurity: 90, avgMastery: 90, avgWisdom: 90,
      isPlatinum: true, overallRefinement: 90,
    }
    const stats = makeStats()
    const recs = generateRecommendations([], [], furnace, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfect refinement')
  })

  it('recommends purity when avgNoblePurity < 60', () => {
    const stats = makeStats({
      avgNoblePurity: 50, avgForgeMastery: 70, avgAnvilPrecision: 70, avgHammerResilience: 70, avgCrucibleWisdom: 70,
    })
    const furnace: PlatinumForgeResult['furnace'] = {
      avgPurity: 50, avgMastery: 70, avgWisdom: 70,
      isPlatinum: true, overallRefinement: 70,
    }
    const recs = generateRecommendations([], [], furnace, stats)
    expect(recs.some((r) => r.includes('noble purity'))).toBe(true)
  })

  it('recommends mastery when avgForgeMastery < 60', () => {
    const stats = makeStats({
      avgForgeMastery: 50, avgNoblePurity: 70, avgAnvilPrecision: 70, avgHammerResilience: 70, avgCrucibleWisdom: 70,
    })
    const furnace: PlatinumForgeResult['furnace'] = {
      avgPurity: 70, avgMastery: 50, avgWisdom: 70,
      isPlatinum: true, overallRefinement: 70,
    }
    const recs = generateRecommendations([], [], furnace, stats)
    expect(recs.some((r) => r.includes('forge mastery'))).toBe(true)
  })

  it('recommends precision when avgAnvilPrecision < 60', () => {
    const stats = makeStats({
      avgAnvilPrecision: 50, avgNoblePurity: 70, avgForgeMastery: 70, avgHammerResilience: 70, avgCrucibleWisdom: 70,
    })
    const furnace: PlatinumForgeResult['furnace'] = {
      avgPurity: 70, avgMastery: 70, avgWisdom: 70,
      isPlatinum: true, overallRefinement: 70,
    }
    const recs = generateRecommendations([], [], furnace, stats)
    expect(recs.some((r) => r.includes('anvil precision'))).toBe(true)
  })

  it('recommends resilience when avgHammerResilience < 60', () => {
    const stats = makeStats({
      avgHammerResilience: 50, avgNoblePurity: 70, avgForgeMastery: 70, avgAnvilPrecision: 70, avgCrucibleWisdom: 70,
    })
    const furnace: PlatinumForgeResult['furnace'] = {
      avgPurity: 70, avgMastery: 70, avgWisdom: 70,
      isPlatinum: true, overallRefinement: 70,
    }
    const recs = generateRecommendations([], [], furnace, stats)
    expect(recs.some((r) => r.includes('hammer resilience'))).toBe(true)
  })

  it('recommends wisdom when avgCrucibleWisdom < 60', () => {
    const stats = makeStats({
      avgCrucibleWisdom: 50, avgNoblePurity: 70, avgForgeMastery: 70, avgAnvilPrecision: 70, avgHammerResilience: 70,
    })
    const furnace: PlatinumForgeResult['furnace'] = {
      avgPurity: 70, avgMastery: 70, avgWisdom: 50,
      isPlatinum: true, overallRefinement: 70,
    }
    const recs = generateRecommendations([], [], furnace, stats)
    expect(recs.some((r) => r.includes('crucible wisdom'))).toBe(true)
  })

  it('warns about cold forge when overall < 40', () => {
    const stats = makeStats({
      overallRefinement: 30, avgNoblePurity: 30, avgForgeMastery: 30, avgAnvilPrecision: 30, avgHammerResilience: 30, avgCrucibleWisdom: 30,
    })
    const furnace: PlatinumForgeResult['furnace'] = {
      avgPurity: 30, avgMastery: 30, avgWisdom: 30,
      isPlatinum: false, overallRefinement: 30,
    }
    const recs = generateRecommendations([], [], furnace, stats)
    expect(recs.some((r) => r.includes('gone cold'))).toBe(true)
  })

  it('returns positive message when no issues', () => {
    const stats = makeStats()
    const furnace: PlatinumForgeResult['furnace'] = {
      avgPurity: 90, avgMastery: 90, avgWisdom: 90,
      isPlatinum: true, overallRefinement: 90,
    }
    const recs = generateRecommendations([], [], furnace, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfect refinement')
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(85)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
  })

  it('colorCondition handles all conditions', () => {
    expect(typeof colorCondition('platinum-palace')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
  })

  it('formatIngotTable returns string', () => {
    const ingot = analyzePlatinumIngot(richContent, 'app.ts')
    const result = formatIngotTable(ingot)
    expect(result).toContain('Platinum Ingot')
    expect(result).toContain('app.ts')
  })

  it('formatIngotsTable handles empty array', () => {
    const result = formatIngotsTable([])
    expect(result).toContain('No platinum ingots')
  })

  it('formatFoundryTable returns string', () => {
    const ingots = [analyzePlatinumIngot(richContent, 'a.ts')]
    const foundry = analyzePlatinumFoundry(ingots, 'src')
    const result = formatFoundryTable(foundry)
    expect(result).toContain('Platinum Foundry')
    expect(result).toContain('src')
  })

  it('formatFoundriesTable handles empty array', () => {
    const result = formatFoundriesTable([])
    expect(result).toContain('No platinum foundries')
  })

  it('formatStatsTable returns string', () => {
    const stats = makeStats()
    const result = formatStatsTable(stats)
    expect(result).toContain('Platinum Forge Statistics')
    expect(result).toContain('Smith Grade')
  })

  it('formatRecommendations handles empty array', () => {
    const result = formatRecommendations([])
    expect(result).toContain('No recommendations')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildPlatinumForgeResult(['app.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.ingots).toHaveLength(1)
  })

  it('formatResultTable returns full output', async () => {
    const result = await buildPlatinumForgeResult(['app.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Platinum Forge Analysis')
  })
})

// ─── Edge cases ─────────────────────────────────────────

describe('edge cases', () => {
  it('handles single file in root directory', async () => {
    const result = await buildPlatinumForgeResult(['app.ts'], [richContent])
    expect(result.foundries[0].directory).toBe('.')
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 20 }, (_, i) => `src/file${i}.ts`)
    const contents = files.map(() => richContent)
    const result = await buildPlatinumForgeResult(files, contents)
    expect(result.stats.totalFiles).toBe(20)
    expect(result.ingots).toHaveLength(20)
  })

  it('minimal content scores lower than rich content', () => {
    const r = measureRefining(minimalContent)
    const s = measureSmithing(minimalContent)
    const sh = measureShaping(minimalContent)
    const t = measureTempering(minimalContent)
    const te = measureTesting(minimalContent)
    const rr = measureRefining(richContent)
    const rs = measureSmithing(richContent)
    const rsh = measureShaping(richContent)
    const rt = measureTempering(richContent)
    const rte = measureTesting(richContent)
    expect(r.purity).toBeLessThan(rr.purity)
    expect(s.mastery).toBeLessThan(rs.mastery)
    expect(sh.precision).toBeLessThan(rsh.precision)
    expect(t.resilience).toBeLessThan(rt.resilience)
    expect(te.wisdom).toBeLessThan(rte.wisdom)
  })

  it('handles content with any keyword', () => {
    const result = measureShaping('const x: any = null')
    expect(result.hasTypeSafe).toBe(false)
  })

  it('handles content with global references', () => {
    const result = measureShaping('window.location.href = "/"')
    expect(result.hasFaithful).toBe(false)
  })
})
