import { describe, expect, it } from 'vitest'
import {
  analyzeBronzeIngot,
  analyzeBronzeWorkshop,
  buildBronzeForgeResult,
  classifyCondition,
  classifySmithGrade,
  classifyWorkshopCondition,
  classifyWorkshopType,
  generateRecommendations,
  measureAging,
  measureFlowing,
  measureHammering,
  measureKindling,
  measureSmelting,
  type BronzeIngot,
  type BronzeForgeStats,
  type BronzeForgeResult,
  type BronzeWorkshop,
} from '../src/commands/bronze-anvil-helpers.js'
import {
  colorCondition,
  colorScore,
  colorWorkshopCondition,
  formatIngotsTable,
  formatIngotTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
  formatWorkshopTable,
  formatWorkshopsTable,
} from '../src/commands/bronze-anvil-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const emptyContent = ''

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

const minimalContent = 'const x = 1'

// ─── measureSmelting ────────────────────────────────────

describe('measureSmelting', () => {
  it('returns zero for empty content', () => {
    const result = measureSmelting(emptyContent)
    expect(result.strength).toBe(0)
    expect(result.metal).toBe('no-strength')
    expect(result.hasHighStrength).toBe(false)
  })

  it('detects well-structured code', () => {
    expect(measureSmelting(richContent).hasWellStructured).toBe(true)
  })

  it('detects modular code', () => {
    expect(measureSmelting(richContent).hasModular).toBe(true)
  })

  it('detects clean pipelines', () => {
    expect(measureSmelting(richContent).hasCleanPipelines).toBe(true)
  })

  it('detects robust code', () => {
    expect(measureSmelting(richContent).hasRobust).toBe(true)
  })

  it('detects combined approaches', () => {
    expect(measureSmelting(richContent).hasCombined).toBe(true)
  })

  it('detects tested code', () => {
    expect(measureSmelting(richContent).hasTested).toBe(true)
  })

  it('detects type-safe code', () => {
    expect(measureSmelting(richContent).hasTypeSafe).toBe(true)
  })

  it('detects enduring code', () => {
    expect(measureSmelting(richContent).hasEnduring).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureSmelting(richContent)
    const empty = measureSmelting(emptyContent)
    expect(rich.strength).toBeGreaterThan(empty.strength)
  })

  it('counts chaotic var usage', () => {
    const result = measureSmelting('var x = 1')
    expect(result.chaoticCount).toBeGreaterThan(0)
  })

  it('hasNoChaotic is true without var', () => {
    expect(measureSmelting(richContent).hasNoChaotic).toBe(true)
  })
})

// ─── measureAging ───────────────────────────────────────

describe('measureAging', () => {
  it('returns low for empty content', () => {
    const result = measureAging(emptyContent)
    expect(result.wisdom).toBeGreaterThanOrEqual(0)
    expect(result.hasHighWisdom).toBe(false)
  })

  it('detects documentation', () => {
    expect(measureAging(richContent).hasDocumented).toBe(true)
  })

  it('detects proven code', () => {
    expect(measureAging(richContent).hasProven).toBe(true)
  })

  it('detects mature code', () => {
    expect(measureAging(richContent).hasMature).toBe(true)
  })

  it('detects established code', () => {
    expect(measureAging(richContent).hasEstablished).toBe(true)
  })

  it('detects stable code', () => {
    expect(measureAging(richContent).hasStable).toBe(true)
  })

  it('detects principled code', () => {
    expect(measureAging(richContent).hasPrincipled).toBe(true)
  })

  it('detects timeless code', () => {
    expect(measureAging(richContent).hasTimeless).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureAging(richContent)
    const empty = measureAging(emptyContent)
    expect(rich.wisdom).toBeGreaterThan(empty.wisdom)
  })

  it('hasNoExperimental is true without beta', () => {
    expect(measureAging(richContent).hasNoExperimental).toBe(true)
  })
})

// ─── measureKindling ────────────────────────────────────

describe('measureKindling', () => {
  it('returns zero for empty content', () => {
    const result = measureKindling(emptyContent)
    expect(result.clarity).toBe(0)
    expect(result.dawn).toBe('no-clarity')
    expect(result.hasHighClarity).toBe(false)
  })

  it('detects readable code', () => {
    expect(measureKindling(richContent).hasReadable).toBe(true)
  })

  it('detects self-documenting code', () => {
    expect(measureKindling(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects clear types', () => {
    expect(measureKindling(richContent).hasClear).toBe(true)
  })

  it('detects transparent imports', () => {
    expect(measureKindling(richContent).hasTransparent).toBe(true)
  })

  it('detects understandable flow', () => {
    expect(measureKindling(richContent).hasUnderstandable).toBe(true)
  })

  it('detects direct code', () => {
    expect(measureKindling(richContent).hasDirect).toBe(true)
  })

  it('detects visible exports', () => {
    expect(measureKindling(richContent).hasVisible).toBe(true)
  })

  it('detects focused code', () => {
    expect(measureKindling(richContent).hasFocused).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureKindling(richContent)
    const empty = measureKindling(emptyContent)
    expect(rich.clarity).toBeGreaterThan(empty.clarity)
  })
})

// ─── measureHammering ───────────────────────────────────

describe('measureHammering', () => {
  it('returns zero for empty content', () => {
    const result = measureHammering(emptyContent)
    expect(result.precision).toBe(0)
    expect(result.craft).toBe('no-precision')
    expect(result.hasHighPrecision).toBe(false)
  })

  it('detects accurate code', () => {
    expect(measureHammering(richContent).hasAccurate).toBe(true)
  })

  it('detects exact types', () => {
    expect(measureHammering(richContent).hasExact).toBe(true)
  })

  it('detects correct returns', () => {
    expect(measureHammering(richContent).hasCorrect).toBe(true)
  })

  it('detects consistent imports', () => {
    expect(measureHammering(richContent).hasConsistent).toBe(true)
  })

  it('detects validated code', () => {
    expect(measureHammering(richContent).hasValidated).toBe(true)
  })

  it('detects type-safe code', () => {
    expect(measureHammering(richContent).hasTypeSafe).toBe(true)
  })

  it('detects refined code', () => {
    expect(measureHammering(richContent).hasRefined).toBe(true)
  })

  it('detects polished code', () => {
    expect(measureHammering(richContent).hasPolished).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureHammering(richContent)
    const empty = measureHammering(emptyContent)
    expect(rich.precision).toBeGreaterThan(empty.precision)
  })

  it('hasNoWrong is true without wrong', () => {
    expect(measureHammering(richContent).hasNoWrong).toBe(true)
  })
})

// ─── measureFlowing ─────────────────────────────────────

describe('measureFlowing', () => {
  it('returns zero for empty content', () => {
    const result = measureFlowing(emptyContent)
    expect(result.current).toBe(0)
    expect(result.flow).toBe('no-current')
    expect(result.hasHighCurrent).toBe(false)
  })

  it('detects error handling', () => {
    expect(measureFlowing(richContent).hasErrorHandled).toBe(true)
  })

  it('detects defensive code', () => {
    expect(measureFlowing(richContent).hasDefensive).toBe(true)
  })

  it('detects graceful handling', () => {
    expect(measureFlowing(richContent).hasGraceful).toBe(true)
  })

  it('detects recoverable code', () => {
    expect(measureFlowing(richContent).hasRecoverable).toBe(true)
  })

  it('detects robust code', () => {
    expect(measureFlowing(richContent).hasRobust).toBe(true)
  })

  it('detects extensible code', () => {
    expect(measureFlowing(richContent).hasExtensible).toBe(true)
  })

  it('detects future-proof code', () => {
    expect(measureFlowing(richContent).hasFutureProof).toBe(true)
  })

  it('detects enduring code', () => {
    expect(measureFlowing(richContent).hasEnduring).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureFlowing(richContent)
    const empty = measureFlowing(emptyContent)
    expect(rich.current).toBeGreaterThan(empty.current)
  })

  it('hasNoBareCrash is true without eval', () => {
    expect(measureFlowing(richContent).hasNoBareCrash).toBe(true)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies bronze-masterpiece', () => expect(classifyCondition(95)).toBe('bronze-masterpiece'))
  it('classifies golden-alloy', () => expect(classifyCondition(78)).toBe('golden-alloy'))
  it('classifies proper-metal', () => expect(classifyCondition(65)).toBe('proper-metal'))
  it('classifies tarnished-brass', () => expect(classifyCondition(45)).toBe('tarnished-brass'))
  it('classifies rusted-iron', () => expect(classifyCondition(25)).toBe('rusted-iron'))
  it('classifies void', () => expect(classifyCondition(10)).toBe('void'))
})

describe('classifyWorkshopType', () => {
  it('returns no-workshop for empty', () => expect(classifyWorkshopType([])).toBe('no-workshop'))
  it('classifies grand-forge', () => {
    expect(classifyWorkshopType([{ qualityScore: 95 } as BronzeIngot])).toBe('grand-forge')
  })
  it('classifies bronze-foundry', () => {
    expect(classifyWorkshopType([{ qualityScore: 78 } as BronzeIngot])).toBe('bronze-foundry')
  })
  it('classifies proper-forge', () => {
    expect(classifyWorkshopType([{ qualityScore: 65 } as BronzeIngot])).toBe('proper-forge')
  })
  it('classifies small-anvil', () => {
    expect(classifyWorkshopType([{ qualityScore: 45 } as BronzeIngot])).toBe('small-anvil')
  })
})

describe('classifyWorkshopCondition', () => {
  it('classifies ancient-foundry', () => expect(classifyWorkshopCondition(90)).toBe('ancient-foundry'))
  it('classifies bronze-workshop', () => expect(classifyWorkshopCondition(72)).toBe('bronze-workshop'))
  it('classifies proper-forge', () => expect(classifyWorkshopCondition(58)).toBe('proper-forge'))
  it('classifies dying-ember', () => expect(classifyWorkshopCondition(40)).toBe('dying-ember'))
  it('classifies cold-anvil', () => expect(classifyWorkshopCondition(20)).toBe('cold-anvil'))
  it('classifies void', () => expect(classifyWorkshopCondition(10)).toBe('void'))
})

describe('classifySmithGrade', () => {
  it('classifies master-smith', () => expect(classifySmithGrade(85)).toBe('master-smith'))
  it('classifies journeyman', () => expect(classifySmithGrade(70)).toBe('journeyman'))
  it('classifies apprentice-smith', () => expect(classifySmithGrade(55)).toBe('apprentice-smith'))
  it('classifies bellows-boy', () => expect(classifySmithGrade(40)).toBe('bellows-boy'))
  it('classifies novice', () => expect(classifySmithGrade(25)).toBe('novice'))
  it('classifies scorched-fingers', () => expect(classifySmithGrade(10)).toBe('scorched-fingers'))
})

// ─── analyzeBronzeIngot ─────────────────────────────────

describe('analyzeBronzeIngot', () => {
  it('returns valid structure for empty content', () => {
    const ingot = analyzeBronzeIngot(emptyContent, 'empty.ts')
    expect(ingot.file).toBe('empty.ts')
    expect(ingot.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('returns valid structure for rich content', () => {
    const ingot = analyzeBronzeIngot(richContent, 'rich.ts')
    expect(ingot.file).toBe('rich.ts')
    expect(ingot.qualityScore).toBeGreaterThan(0)
    expect(ingot.alloyStrength).toBeGreaterThan(0)
    expect(ingot.patinaWisdom).toBeGreaterThan(0)
    expect(ingot.dawnClarity).toBeGreaterThan(0)
    expect(ingot.forgePrecision).toBeGreaterThan(0)
    expect(ingot.durableCurrent).toBeGreaterThan(0)
  })

  it('qualityScore is average of 5 measures', () => {
    const ingot = analyzeBronzeIngot(richContent, 'test.ts')
    const expected = Math.round(
      ingot.alloyStrength * 0.2 +
      ingot.patinaWisdom * 0.2 +
      ingot.dawnClarity * 0.2 +
      ingot.forgePrecision * 0.2 +
      ingot.durableCurrent * 0.2,
    )
    expect(ingot.qualityScore).toBe(expected)
  })

  it('contains all nested measures', () => {
    const ingot = analyzeBronzeIngot(richContent, 'test.ts')
    expect(ingot.smelting).toBeDefined()
    expect(ingot.aging).toBeDefined()
    expect(ingot.kindling).toBeDefined()
    expect(ingot.hammering).toBeDefined()
    expect(ingot.flowing).toBeDefined()
  })

  it('scores rich content at max for smelting', () => {
    expect(analyzeBronzeIngot(richContent, 'rich.ts').smelting.strength).toBe(100)
  })

  it('scores rich content at max for aging', () => {
    expect(analyzeBronzeIngot(richContent, 'rich.ts').aging.wisdom).toBe(100)
  })

  it('scores rich content at max for kindling', () => {
    expect(analyzeBronzeIngot(richContent, 'rich.ts').kindling.clarity).toBe(100)
  })

  it('scores rich content at max for hammering', () => {
    expect(analyzeBronzeIngot(richContent, 'rich.ts').hammering.precision).toBe(100)
  })

  it('scores rich content at max for flowing', () => {
    expect(analyzeBronzeIngot(richContent, 'rich.ts').flowing.current).toBe(100)
  })

  it('rich content yields bronze-masterpiece', () => {
    expect(analyzeBronzeIngot(richContent, 'rich.ts').condition).toBe('bronze-masterpiece')
  })
})

// ─── analyzeBronzeWorkshop ──────────────────────────────

describe('analyzeBronzeWorkshop', () => {
  it('returns empty workshop for no ingots', () => {
    const ws = analyzeBronzeWorkshop([], 'src')
    expect(ws.directory).toBe('src')
    expect(ws.ingots).toEqual([])
    expect(ws.avgStrength).toBe(0)
    expect(ws.workshopType).toBe('no-workshop')
    expect(ws.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const ingots = [
      analyzeBronzeIngot(richContent, 'src/a.ts'),
      analyzeBronzeIngot(richContent, 'src/b.ts'),
    ]
    const ws = analyzeBronzeWorkshop(ingots, 'src')
    expect(ws.avgStrength).toBeGreaterThan(0)
    expect(ws.avgPrecision).toBeGreaterThan(0)
    expect(ws.avgCurrent).toBeGreaterThan(0)
  })
})

// ─── buildBronzeForgeResult ─────────────────────────────

describe('buildBronzeForgeResult', () => {
  it('returns valid result for empty input', async () => {
    const result = await buildBronzeForgeResult([], [])
    expect(result.ingots).toEqual([])
    expect(result.workshops).toEqual([])
    expect(result.foundry.overallCraft).toBe(0)
    expect(result.foundry.isBronze).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns valid result for rich content', async () => {
    const result = await buildBronzeForgeResult(['a.ts'], [richContent])
    expect(result.ingots.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgAlloyStrength).toBeGreaterThan(0)
  })

  it('groups files by directory into workshops', async () => {
    const result = await buildBronzeForgeResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.ingots.length).toBe(3)
    expect(result.workshops.length).toBe(2)
  })

  it('foundry.isBronze is true when craft >= 60', async () => {
    const result = await buildBronzeForgeResult(['a.ts'], [richContent])
    expect(result.foundry.isBronze).toBe(true)
  })

  it('computes stats correctly for multiple files', async () => {
    const result = await buildBronzeForgeResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.bestIngot).toBeTruthy()
    expect(result.stats.strongest).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostEnduring).toBeTruthy()
  })

  it('counts condition categories', async () => {
    const result = await buildBronzeForgeResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, minimalContent, emptyContent],
    )
    const total =
      result.stats.bronzeMasterpieceCount +
      result.stats.goldenAlloyCount +
      result.stats.properMetalCount +
      result.stats.tarnishedBrassCount +
      result.stats.rustedIronCount +
      result.stats.voidCount
    expect(total).toBe(3)
  })

  it('sets smithGrade correctly', async () => {
    const result = await buildBronzeForgeResult(['a.ts'], [richContent])
    expect(result.stats.smithGrade).toBeDefined()
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message for all-90 scores', () => {
    const ingots = [analyzeBronzeIngot(richContent, 'a.ts')]
    const stats: BronzeForgeStats = {
      totalFiles: 1, totalWorkshops: 0,
      avgAlloyStrength: 95, avgPatinaWisdom: 95, avgDawnClarity: 95,
      avgForgePrecision: 95, avgDurableCurrent: 95,
      bronzeMasterpieceCount: 1, goldenAlloyCount: 0, properMetalCount: 0,
      tarnishedBrassCount: 0, rustedIronCount: 0, voidCount: 0,
      hasHighStrengthCount: 1, hasHighWisdomCount: 1, hasHighClarityCount: 1,
      hasHighPrecisionCount: 1, hasHighCurrentCount: 1,
      overallCraft: 95, smithGrade: 'master-smith',
      bestIngot: 'a.ts', strongest: 'a.ts', wisest: 'a.ts',
      clearest: 'a.ts', mostPrecise: 'a.ts', mostEnduring: 'a.ts',
    }
    const foundry = { avgStrength: 95, avgPrecision: 95, avgCurrent: 95, isBronze: true, overallCraft: 95 }
    const recs = generateRecommendations(ingots, [], foundry, stats)
    expect(recs.length).toBe(1)
    expect(recs[0]).toContain('masterwork alloy')
  })

  it('recommends improving alloy when low', () => {
    const emptyIngot = analyzeBronzeIngot(emptyContent, 'a.ts')
    const stats: BronzeForgeStats = {
      totalFiles: 1, totalWorkshops: 0,
      avgAlloyStrength: 10, avgPatinaWisdom: 70, avgDawnClarity: 70,
      avgForgePrecision: 70, avgDurableCurrent: 70,
      bronzeMasterpieceCount: 0, goldenAlloyCount: 0, properMetalCount: 0,
      tarnishedBrassCount: 0, rustedIronCount: 0, voidCount: 1,
      hasHighStrengthCount: 0, hasHighWisdomCount: 1, hasHighClarityCount: 1,
      hasHighPrecisionCount: 1, hasHighCurrentCount: 1,
      overallCraft: 58, smithGrade: 'apprentice-smith',
      bestIngot: 'a.ts', strongest: 'a.ts', wisest: 'a.ts',
      clearest: 'a.ts', mostPrecise: 'a.ts', mostEnduring: 'a.ts',
    }
    const foundry = { avgStrength: 10, avgPrecision: 70, avgCurrent: 70, isBronze: false, overallCraft: 58 }
    const recs = generateRecommendations([emptyIngot], [], foundry, stats)
    expect(recs.some((r) => r.includes('alloy composition'))).toBe(true)
  })

  it('warns about many void ingots', () => {
    const ingots = Array.from({ length: 6 }, () => analyzeBronzeIngot(emptyContent, 'void.ts'))
    const stats: BronzeForgeStats = {
      totalFiles: 6, totalWorkshops: 0,
      avgAlloyStrength: 0, avgPatinaWisdom: 0, avgDawnClarity: 0,
      avgForgePrecision: 0, avgDurableCurrent: 0,
      bronzeMasterpieceCount: 0, goldenAlloyCount: 0, properMetalCount: 0,
      tarnishedBrassCount: 0, rustedIronCount: 0, voidCount: 6,
      hasHighStrengthCount: 0, hasHighWisdomCount: 0, hasHighClarityCount: 0,
      hasHighPrecisionCount: 0, hasHighCurrentCount: 0,
      overallCraft: 0, smithGrade: 'scorched-fingers',
      bestIngot: 'void.ts', strongest: 'void.ts', wisest: 'void.ts',
      clearest: 'void.ts', mostPrecise: 'void.ts', mostEnduring: 'void.ts',
    }
    const foundry = { avgStrength: 0, avgPrecision: 0, avgCurrent: 0, isBronze: false, overallCraft: 0 }
    const recs = generateRecommendations(ingots, [], foundry, stats)
    expect(recs.some((r) => r.includes('broken ingots'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for each range', () => {
    expect(typeof colorScore(95)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorCondition('bronze-masterpiece')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
  })
})

describe('colorWorkshopCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorWorkshopCondition('ancient-foundry')).toBe('string')
    expect(typeof colorWorkshopCondition('void')).toBe('string')
  })
})

describe('formatIngotTable', () => {
  it('formats a single ingot', () => {
    const ingot = analyzeBronzeIngot(richContent, 'test.ts')
    const output = formatIngotTable(ingot)
    expect(output).toContain('Bronze Ingot: test.ts')
    expect(output).toContain('Alloy Strength')
  })
})

describe('formatIngotsTable', () => {
  it('returns message for empty', () => {
    expect(formatIngotsTable([])).toContain('No bronze ingots found')
  })

  it('formats multiple ingots', () => {
    const ingots = [analyzeBronzeIngot(richContent, 'a.ts'), analyzeBronzeIngot(minimalContent, 'b.ts')]
    const output = formatIngotsTable(ingots)
    expect(output).toContain('Bronze Ingots')
    expect(output).toContain('a.ts')
  })
})

describe('formatWorkshopTable', () => {
  it('formats a workshop', () => {
    const ingots = [analyzeBronzeIngot(richContent, 'src/a.ts')]
    const ws = analyzeBronzeWorkshop(ingots, 'src')
    expect(formatWorkshopTable(ws)).toContain('Bronze Workshop: src')
  })
})

describe('formatWorkshopsTable', () => {
  it('returns message for empty', () => {
    expect(formatWorkshopsTable([])).toContain('No bronze workshops found')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildBronzeForgeResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Bronze Forge Statistics')
    expect(output).toContain('Smith Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    expect(formatRecommendations(['Fix X'])).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildBronzeForgeResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Bronze Forge Analysis')
    expect(output).toContain('Foundry Overview')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildBronzeForgeResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.ingots).toBeDefined()
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
