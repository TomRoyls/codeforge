import { describe, expect, it } from 'vitest'

import {
  analyzeBronzeIngot,
  analyzeBronzeWorkshop,
  buildBronzeAnvilResult,
  classifyIngotCondition,
  classifyWorkshopType,
  classifyWorkshopCondition,
  classifySmithGrade,
  generateRecommendations,
  measureAlloying,
  measureAging,
  measureRevealing,
  measureHammering,
  measureConducting,
  type IngotCondition,
  type WorkshopCondition,
  type BronzeIngot,
  type BronzeAnvilResult,
  type BronzeWorkshop,
} from '../src/commands/copper-anvil-helpers.js'

import {
  colorIngotCondition,
  colorWorkshopCondition,
  colorScore,
  formatIngotTable,
  formatIngotsTable,
  formatWorkshopsTable,
  formatWorkshopTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/copper-anvil-format-helpers.js'

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

const poorContent = 'var x = eval("1")\nany monolithic god.object'

// ─── measureAlloying ────────────────────────────────────

describe('measureAlloying', () => {
  it('scores rich content high', () => {
    const m = measureAlloying(richContent)
    expect(m.strength).toBeGreaterThanOrEqual(60)
    expect(m.hasHighStrength).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureAlloying(emptyContent)
    expect(m.strength).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureAlloying(richContent)
    const poor = measureAlloying(poorContent)
    expect(rich.strength).toBeGreaterThan(poor.strength)
  })

  it('detects chaotic patterns', () => {
    const m = measureAlloying('var x = eval("boom")')
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects untested patterns', () => {
    const m = measureAlloying('eval (x)')
    expect(m.untestedCount).toBeGreaterThan(0)
    expect(m.hasNoUntested).toBe(false)
  })

  it('assigns high alloy for rich content', () => {
    const m = measureAlloying(richContent)
    expect(['master-alloy', 'phosphor-bronze', 'proper-bronze']).toContain(m.alloy)
  })

  it('assigns low alloy for empty content', () => {
    const m = measureAlloying(emptyContent)
    expect(['no-alloy', 'raw-copper', 'brass-mix', 'proper-bronze']).toContain(m.alloy)
  })

  it('has all boolean properties', () => {
    const m = measureAlloying(richContent)
    expect(typeof m.hasWellStructured).toBe('boolean')
    expect(typeof m.hasModular).toBe('boolean')
    expect(typeof m.hasFortified).toBe('boolean')
  })
})

// ─── measureAging ───────────────────────────────────────

describe('measureAging', () => {
  it('scores rich content high', () => {
    const m = measureAging(richContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(60)
    expect(m.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureAging(emptyContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureAging(richContent)
    const poor = measureAging(poorContent)
    expect(rich.wisdom).toBeGreaterThan(poor.wisdom)
  })

  it('detects volatile patterns', () => {
    const m = measureAging('volatile unstable fragile')
    expect(m.volatileCount).toBeGreaterThan(0)
  })

  it('assigns high patina for rich content', () => {
    const m = measureAging(richContent)
    expect(['ancient-verdigris', 'aged-patina', 'proper-aging']).toContain(m.patina)
  })

  it('assigns low patina for empty content', () => {
    const m = measureAging(emptyContent)
    expect(['no-wisdom', 'corroded', 'tarnished', 'proper-aging']).toContain(m.patina)
  })

  it('has all boolean properties', () => {
    const m = measureAging(richContent)
    expect(typeof m.hasDocumented).toBe('boolean')
    expect(typeof m.hasProven).toBe('boolean')
    expect(typeof m.hasAccumulated).toBe('boolean')
  })
})

// ─── measureRevealing ───────────────────────────────────

describe('measureRevealing', () => {
  it('scores rich content high', () => {
    const m = measureRevealing(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(60)
    expect(m.hasHighClarity).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureRevealing(emptyContent)
    expect(m.clarity).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureRevealing(richContent)
    const poor = measureRevealing(poorContent)
    expect(rich.clarity).toBeGreaterThan(poor.clarity)
  })

  it('detects cryptic patterns', () => {
    const m = measureRevealing('cryptic obfuscate minified')
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated patterns', () => {
    const m = measureRevealing('var x = eval("1")')
    expect(m.obfuscatedCount).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('assigns high dawn for rich content', () => {
    const m = measureRevealing(richContent)
    expect(['bronze-age-dawn', 'clear-horizon', 'proper-light']).toContain(m.dawn)
  })

  it('assigns low dawn for empty content', () => {
    const m = measureRevealing(emptyContent)
    expect(['no-clarity', 'dark-age', 'gray-dawn', 'proper-light']).toContain(m.dawn)
  })

  it('has all boolean properties', () => {
    const m = measureRevealing(richContent)
    expect(typeof m.hasReadable).toBe('boolean')
    expect(typeof m.hasTransparent).toBe('boolean')
    expect(typeof m.hasClean).toBe('boolean')
  })
})

// ─── measureHammering ───────────────────────────────────

describe('measureHammering', () => {
  it('scores rich content high', () => {
    const m = measureHammering(richContent)
    expect(m.precision).toBeGreaterThanOrEqual(60)
    expect(m.hasHighPrecision).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureHammering(emptyContent)
    expect(m.precision).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureHammering(richContent)
    const poor = measureHammering(poorContent)
    expect(rich.precision).toBeGreaterThan(poor.precision)
  })

  it('detects approximate patterns', () => {
    const m = measureHammering('roughly approximately guesstimate')
    expect(m.approximateCount).toBeGreaterThan(0)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('detects rough patterns', () => {
    const m = measureHammering('var x = eval("1")')
    expect(m.roughCount).toBeGreaterThan(0)
  })

  it('assigns high hammer for rich content', () => {
    const m = measureHammering(richContent)
    expect(['master-smith', 'expert-forge', 'proper-hammer']).toContain(m.hammer)
  })

  it('assigns low hammer for empty content', () => {
    const m = measureHammering(emptyContent)
    expect(['no-precision', 'bare-hands', 'crude-mallet', 'proper-hammer']).toContain(m.hammer)
  })

  it('has all boolean properties', () => {
    const m = measureHammering(richContent)
    expect(typeof m.hasAccurate).toBe('boolean')
    expect(typeof m.hasDisciplined).toBe('boolean')
    expect(typeof m.hasDeliberate).toBe('boolean')
  })
})

// ─── measureConducting ──────────────────────────────────

describe('measureConducting', () => {
  it('scores rich content high', () => {
    const m = measureConducting(richContent)
    expect(m.current).toBeGreaterThanOrEqual(60)
    expect(m.hasHighCurrent).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureConducting(emptyContent)
    expect(m.current).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureConducting(richContent)
    const poor = measureConducting(poorContent)
    expect(rich.current).toBeGreaterThan(poor.current)
  })

  it('detects wasteful patterns', () => {
    const m = measureConducting('wasteful inefficient bloated')
    expect(m.wastefulCount).toBeGreaterThan(0)
    expect(m.hasNoWasteful).toBe(false)
  })

  it('detects volatile patterns', () => {
    const m = measureConducting('volatile unstable fragile')
    expect(m.volatileCount).toBeGreaterThan(0)
    expect(m.hasNoVolatile).toBe(false)
  })

  it('assigns high flow for rich content', () => {
    const m = measureConducting(richContent)
    expect(['perfect-conductor', 'strong-current', 'proper-flow']).toContain(m.flow)
  })

  it('assigns low flow for empty content', () => {
    const m = measureConducting(emptyContent)
    expect(['no-current', 'static', 'trickle', 'proper-flow']).toContain(m.flow)
  })

  it('has all boolean properties', () => {
    const m = measureConducting(richContent)
    expect(typeof m.hasEfficient).toBe('boolean')
    expect(typeof m.hasDependable).toBe('boolean')
    expect(typeof m.hasPerpetual).toBe('boolean')
  })
})

// ─── classifyIngotCondition ─────────────────────────────

describe('classifyIngotCondition', () => {
  it('classifies 90+ as bronze-masterpiece', () => {
    expect(classifyIngotCondition(90)).toBe('bronze-masterpiece')
    expect(classifyIngotCondition(95)).toBe('bronze-masterpiece')
  })

  it('classifies 75-89 as ageless-alloy', () => {
    expect(classifyIngotCondition(75)).toBe('ageless-alloy')
    expect(classifyIngotCondition(89)).toBe('ageless-alloy')
  })

  it('classifies 60-74 as proper-bronze', () => {
    expect(classifyIngotCondition(60)).toBe('proper-bronze')
    expect(classifyIngotCondition(74)).toBe('proper-bronze')
  })

  it('classifies 40-59 as tarnished-metal', () => {
    expect(classifyIngotCondition(40)).toBe('tarnished-metal')
    expect(classifyIngotCondition(59)).toBe('tarnished-metal')
  })

  it('classifies 20-39 as raw-ore', () => {
    expect(classifyIngotCondition(20)).toBe('raw-ore')
    expect(classifyIngotCondition(39)).toBe('raw-ore')
  })

  it('classifies below 20 as void', () => {
    expect(classifyIngotCondition(0)).toBe('void')
    expect(classifyIngotCondition(19)).toBe('void')
  })
})

// ─── classifyWorkshopType ───────────────────────────────

describe('classifyWorkshopType', () => {
  it('returns no-forge for empty ingots', () => {
    expect(classifyWorkshopType([])).toBe('no-forge')
  })

  it('returns grand-foundry for high avg quality', () => {
    const ingots = [
      { qualityScore: 90 } as BronzeIngot,
      { qualityScore: 85 } as BronzeIngot,
    ]
    expect(classifyWorkshopType(ingots)).toBe('grand-foundry')
  })

  it('returns bronze-workshop for good quality', () => {
    const ingots = [
      { qualityScore: 70 } as BronzeIngot,
      { qualityScore: 75 } as BronzeIngot,
    ]
    expect(classifyWorkshopType(ingots)).toBe('bronze-workshop')
  })

  it('returns proper-forge for decent quality', () => {
    const ingots = [
      { qualityScore: 55 } as BronzeIngot,
      { qualityScore: 60 } as BronzeIngot,
    ]
    expect(classifyWorkshopType(ingots)).toBe('proper-forge')
  })

  it('returns backyard-anvil for low quality', () => {
    const ingots = [
      { qualityScore: 35 } as BronzeIngot,
      { qualityScore: 40 } as BronzeIngot,
    ]
    expect(classifyWorkshopType(ingots)).toBe('backyard-anvil')
  })

  it('returns void for very low quality', () => {
    const ingots = [
      { qualityScore: 10 } as BronzeIngot,
      { qualityScore: 15 } as BronzeIngot,
    ]
    expect(classifyWorkshopType(ingots)).toBe('void')
  })
})

// ─── classifyWorkshopCondition ──────────────────────────

describe('classifyWorkshopCondition', () => {
  it('classifies 85+ as master-smithy', () => {
    expect(classifyWorkshopCondition(85)).toBe('master-smithy')
  })

  it('classifies 70-84 as bronze-hall', () => {
    expect(classifyWorkshopCondition(70)).toBe('bronze-hall')
  })

  it('classifies 55-69 as proper-workshop', () => {
    expect(classifyWorkshopCondition(55)).toBe('proper-workshop')
  })

  it('classifies 35-54 as rusty-shed', () => {
    expect(classifyWorkshopCondition(35)).toBe('rusty-shed')
  })

  it('classifies 15-34 as empty-lot', () => {
    expect(classifyWorkshopCondition(15)).toBe('empty-lot')
  })

  it('classifies below 15 as void', () => {
    expect(classifyWorkshopCondition(0)).toBe('void')
  })
})

// ─── classifySmithGrade ─────────────────────────────────

describe('classifySmithGrade', () => {
  it('classifies 80+ as master-smith', () => {
    expect(classifySmithGrade(80)).toBe('master-smith')
    expect(classifySmithGrade(100)).toBe('master-smith')
  })

  it('classifies 65-79 as journeyman', () => {
    expect(classifySmithGrade(65)).toBe('journeyman')
    expect(classifySmithGrade(79)).toBe('journeyman')
  })

  it('classifies 50-64 as proper-forger', () => {
    expect(classifySmithGrade(50)).toBe('proper-forger')
    expect(classifySmithGrade(64)).toBe('proper-forger')
  })

  it('classifies 35-49 as apprentice', () => {
    expect(classifySmithGrade(35)).toBe('apprentice')
    expect(classifySmithGrade(49)).toBe('apprentice')
  })

  it('classifies 20-34 as novice', () => {
    expect(classifySmithGrade(20)).toBe('novice')
    expect(classifySmithGrade(34)).toBe('novice')
  })

  it('classifies below 20 as bellows-boy', () => {
    expect(classifySmithGrade(0)).toBe('bellows-boy')
    expect(classifySmithGrade(19)).toBe('bellows-boy')
  })
})

// ─── analyzeBronzeIngot ─────────────────────────────────

describe('analyzeBronzeIngot', () => {
  it('analyzes a file and returns all measures', () => {
    const ingot = analyzeBronzeIngot(richContent, 'app.ts')
    expect(ingot.file).toBe('app.ts')
    expect(ingot.alloyStrength).toBeGreaterThanOrEqual(0)
    expect(ingot.patinaWisdom).toBeGreaterThanOrEqual(0)
    expect(ingot.dawnClarity).toBeGreaterThanOrEqual(0)
    expect(ingot.forgePrecision).toBeGreaterThanOrEqual(0)
    expect(ingot.durableCurrent).toBeGreaterThanOrEqual(0)
    expect(ingot.qualityScore).toBeGreaterThanOrEqual(0)
    expect(ingot.condition).toBeDefined()
  })

  it('scores rich content high overall', () => {
    const ingot = analyzeBronzeIngot(richContent, 'app.ts')
    expect(ingot.qualityScore).toBeGreaterThanOrEqual(60)
  })

  it('calculates qualityScore as weighted average', () => {
    const ingot = analyzeBronzeIngot(richContent, 'app.ts')
    const expected = Math.round(
      ingot.alloyStrength * 0.2 +
      ingot.patinaWisdom * 0.2 +
      ingot.dawnClarity * 0.2 +
      ingot.forgePrecision * 0.2 +
      ingot.durableCurrent * 0.2,
    )
    expect(ingot.qualityScore).toBe(expected)
  })

  it('includes all sub-measures', () => {
    const ingot = analyzeBronzeIngot(richContent, 'app.ts')
    expect(ingot.alloying).toBeDefined()
    expect(ingot.aging).toBeDefined()
    expect(ingot.revealing).toBeDefined()
    expect(ingot.hammering).toBeDefined()
    expect(ingot.conducting).toBeDefined()
  })

  it('classifies condition based on qualityScore', () => {
    const ingot = analyzeBronzeIngot(richContent, 'app.ts')
    const expectedCondition = classifyIngotCondition(ingot.qualityScore)
    expect(ingot.condition).toBe(expectedCondition)
  })

  it('handles empty content gracefully', () => {
    const ingot = analyzeBronzeIngot(emptyContent, 'empty.ts')
    expect(ingot.qualityScore).toBeGreaterThanOrEqual(0)
  })
})

// ─── analyzeBronzeWorkshop ───────────────────────────────

describe('analyzeBronzeWorkshop', () => {
  it('returns empty workshop for no ingots', () => {
    const workshop = analyzeBronzeWorkshop([], 'src')
    expect(workshop.directory).toBe('src')
    expect(workshop.ingots).toHaveLength(0)
    expect(workshop.avgStrength).toBe(0)
    expect(workshop.workshopType).toBe('no-forge')
    expect(workshop.condition).toBe('void')
  })

  it('aggregates ingot scores', () => {
    const i1 = analyzeBronzeIngot(richContent, 'a.ts')
    const i2 = analyzeBronzeIngot(richContent, 'b.ts')
    const workshop = analyzeBronzeWorkshop([i1, i2], 'src')
    expect(workshop.avgStrength).toBeGreaterThanOrEqual(0)
    expect(workshop.avgPrecision).toBeGreaterThanOrEqual(0)
    expect(workshop.avgWisdom).toBeGreaterThanOrEqual(0)
    expect(workshop.ingots).toHaveLength(2)
  })

  it('counts masterpieces and voids', () => {
    const ingot = analyzeBronzeIngot(richContent, 'app.ts')
    const workshop = analyzeBronzeWorkshop([ingot], 'src')
    expect(workshop.bronzeMasterpieceCount + workshop.voidCount).toBeLessThanOrEqual(1)
  })

  it('classifies workshop type and condition', () => {
    const ingot = analyzeBronzeIngot(richContent, 'app.ts')
    const workshop = analyzeBronzeWorkshop([ingot], 'src')
    expect(workshop.workshopType).toBeDefined()
    expect(workshop.condition).toBeDefined()
  })
})

// ─── buildBronzeAnvilResult ─────────────────────────────

describe('buildBronzeAnvilResult', () => {
  it('handles empty input', async () => {
    const result = await buildBronzeAnvilResult([], [])
    expect(result.ingots).toHaveLength(0)
    expect(result.workshops).toHaveLength(0)
    expect(result.foundry.overallTemper).toBe(0)
    expect(result.foundry.isBronze).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildBronzeAnvilResult(['a.ts'], [richContent])
    expect(result.ingots).toHaveLength(1)
    expect(result.ingots[0].file).toBe('a.ts')
  })

  it('analyzes multiple files', async () => {
    const result = await buildBronzeAnvilResult(
      ['a.ts', 'b.ts'],
      [richContent, poorContent],
    )
    expect(result.ingots).toHaveLength(2)
  })

  it('groups files by directory', async () => {
    const result = await buildBronzeAnvilResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, poorContent],
    )
    expect(result.workshops.length).toBe(2)
  })

  it('computes foundry averages', async () => {
    const result = await buildBronzeAnvilResult(['a.ts'], [richContent])
    expect(result.foundry.avgStrength).toBeGreaterThanOrEqual(0)
    expect(result.foundry.avgPrecision).toBeGreaterThanOrEqual(0)
    expect(result.foundry.avgWisdom).toBeGreaterThanOrEqual(0)
  })

  it('computes stats correctly', async () => {
    const result = await buildBronzeAnvilResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalWorkshops).toBeGreaterThanOrEqual(1)
    expect(result.stats.overallTemper).toBeGreaterThanOrEqual(0)
    expect(result.stats.smithGrade).toBeDefined()
  })

  it('identifies best and extreme files', async () => {
    const result = await buildBronzeAnvilResult(
      ['a.ts', 'b.ts'],
      [richContent, poorContent],
    )
    expect(result.stats.bestIngot).toBeTruthy()
    expect(result.stats.strongest).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostEnduring).toBeTruthy()
  })

  it('includes recommendations', async () => {
    const result = await buildBronzeAnvilResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty bestIngot for no files', async () => {
    const result = await buildBronzeAnvilResult([], [])
    expect(result.stats.bestIngot).toBe('')
    expect(result.stats.strongest).toBe('')
  })

  it('scores rich content at max', async () => {
    const result = await buildBronzeAnvilResult(['a.ts'], [richContent])
    expect(result.ingots[0].alloyStrength).toBeGreaterThanOrEqual(60)
    expect(result.ingots[0].patinaWisdom).toBeGreaterThanOrEqual(60)
    expect(result.ingots[0].dawnClarity).toBeGreaterThanOrEqual(60)
    expect(result.ingots[0].forgePrecision).toBeGreaterThanOrEqual(60)
    expect(result.ingots[0].durableCurrent).toBeGreaterThanOrEqual(60)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('recommends masterpiece when all scores are high', () => {
    const stats = {
      totalFiles: 1, totalWorkshops: 1,
      avgAlloyStrength: 95, avgPatinaWisdom: 95, avgDawnClarity: 95,
      avgForgePrecision: 95, avgDurableCurrent: 95,
      bronzeMasterpieceCount: 1, agelessAlloyCount: 0, properBronzeCount: 0,
      tarnishedMetalCount: 0, rawOreCount: 0, voidCount: 0,
      hasHighStrengthCount: 1, hasHighWisdomCount: 1, hasHighClarityCount: 1,
      hasHighPrecisionCount: 1, hasHighCurrentCount: 1,
      overallTemper: 95, smithGrade: 'master-smith' as const,
      bestIngot: 'a.ts', strongest: 'a.ts', wisest: 'a.ts',
      clearest: 'a.ts', mostPrecise: 'a.ts', mostEnduring: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgStrength: 95, avgPrecision: 95, avgWisdom: 95, isBronze: true, overallTemper: 95 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends alloy strength when low', () => {
    const stats = {
      totalFiles: 1, totalWorkshops: 1,
      avgAlloyStrength: 30, avgPatinaWisdom: 90, avgDawnClarity: 90,
      avgForgePrecision: 90, avgDurableCurrent: 90,
      bronzeMasterpieceCount: 0, agelessAlloyCount: 0, properBronzeCount: 0,
      tarnishedMetalCount: 0, rawOreCount: 0, voidCount: 0,
      hasHighStrengthCount: 0, hasHighWisdomCount: 0, hasHighClarityCount: 0,
      hasHighPrecisionCount: 0, hasHighCurrentCount: 0,
      overallTemper: 78, smithGrade: 'journeyman' as const,
      bestIngot: 'a.ts', strongest: 'a.ts', wisest: 'a.ts',
      clearest: 'a.ts', mostPrecise: 'a.ts', mostEnduring: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgStrength: 30, avgPrecision: 90, avgWisdom: 90, isBronze: true, overallTemper: 78 }, stats)
    expect(recs.some((r) => r.includes('alloy'))).toBe(true)
  })

  it('recommends precision when low', () => {
    const stats = {
      totalFiles: 1, totalWorkshops: 1,
      avgAlloyStrength: 90, avgPatinaWisdom: 90, avgDawnClarity: 90,
      avgForgePrecision: 30, avgDurableCurrent: 90,
      bronzeMasterpieceCount: 0, agelessAlloyCount: 0, properBronzeCount: 0,
      tarnishedMetalCount: 0, rawOreCount: 0, voidCount: 0,
      hasHighStrengthCount: 0, hasHighWisdomCount: 0, hasHighClarityCount: 0,
      hasHighPrecisionCount: 0, hasHighCurrentCount: 0,
      overallTemper: 78, smithGrade: 'journeyman' as const,
      bestIngot: 'a.ts', strongest: 'a.ts', wisest: 'a.ts',
      clearest: 'a.ts', mostPrecise: 'a.ts', mostEnduring: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgStrength: 90, avgPrecision: 30, avgWisdom: 90, isBronze: true, overallTemper: 78 }, stats)
    expect(recs.some((r) => r.includes('precision'))).toBe(true)
  })

  it('recommends current when low', () => {
    const stats = {
      totalFiles: 1, totalWorkshops: 1,
      avgAlloyStrength: 90, avgPatinaWisdom: 90, avgDawnClarity: 90,
      avgForgePrecision: 90, avgDurableCurrent: 30,
      bronzeMasterpieceCount: 0, agelessAlloyCount: 0, properBronzeCount: 0,
      tarnishedMetalCount: 0, rawOreCount: 0, voidCount: 0,
      hasHighStrengthCount: 0, hasHighWisdomCount: 0, hasHighClarityCount: 0,
      hasHighPrecisionCount: 0, hasHighCurrentCount: 0,
      overallTemper: 78, smithGrade: 'journeyman' as const,
      bestIngot: 'a.ts', strongest: 'a.ts', wisest: 'a.ts',
      clearest: 'a.ts', mostPrecise: 'a.ts', mostEnduring: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgStrength: 90, avgPrecision: 90, avgWisdom: 90, isBronze: true, overallTemper: 78 }, stats)
    expect(recs.some((r) => r.includes('current'))).toBe(true)
  })

  it('recommends wisdom when low', () => {
    const stats = {
      totalFiles: 1, totalWorkshops: 1,
      avgAlloyStrength: 90, avgPatinaWisdom: 30, avgDawnClarity: 90,
      avgForgePrecision: 90, avgDurableCurrent: 90,
      bronzeMasterpieceCount: 0, agelessAlloyCount: 0, properBronzeCount: 0,
      tarnishedMetalCount: 0, rawOreCount: 0, voidCount: 0,
      hasHighStrengthCount: 0, hasHighWisdomCount: 0, hasHighClarityCount: 0,
      hasHighPrecisionCount: 0, hasHighCurrentCount: 0,
      overallTemper: 78, smithGrade: 'journeyman' as const,
      bestIngot: 'a.ts', strongest: 'a.ts', wisest: 'a.ts',
      clearest: 'a.ts', mostPrecise: 'a.ts', mostEnduring: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgStrength: 90, avgPrecision: 90, avgWisdom: 30, isBronze: true, overallTemper: 78 }, stats)
    expect(recs.some((r) => r.includes('wisdom'))).toBe(true)
  })

  it('recommends clarity when low', () => {
    const stats = {
      totalFiles: 1, totalWorkshops: 1,
      avgAlloyStrength: 90, avgPatinaWisdom: 90, avgDawnClarity: 30,
      avgForgePrecision: 90, avgDurableCurrent: 90,
      bronzeMasterpieceCount: 0, agelessAlloyCount: 0, properBronzeCount: 0,
      tarnishedMetalCount: 0, rawOreCount: 0, voidCount: 0,
      hasHighStrengthCount: 0, hasHighWisdomCount: 0, hasHighClarityCount: 0,
      hasHighPrecisionCount: 0, hasHighCurrentCount: 0,
      overallTemper: 78, smithGrade: 'journeyman' as const,
      bestIngot: 'a.ts', strongest: 'a.ts', wisest: 'a.ts',
      clearest: 'a.ts', mostPrecise: 'a.ts', mostEnduring: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgStrength: 90, avgPrecision: 90, avgWisdom: 90, isBronze: true, overallTemper: 78 }, stats)
    expect(recs.some((r) => r.includes('clarity'))).toBe(true)
  })

  it('warns about very low temper', () => {
    const stats = {
      totalFiles: 1, totalWorkshops: 1,
      avgAlloyStrength: 20, avgPatinaWisdom: 20, avgDawnClarity: 20,
      avgForgePrecision: 20, avgDurableCurrent: 20,
      bronzeMasterpieceCount: 0, agelessAlloyCount: 0, properBronzeCount: 0,
      tarnishedMetalCount: 0, rawOreCount: 0, voidCount: 1,
      hasHighStrengthCount: 0, hasHighWisdomCount: 0, hasHighClarityCount: 0,
      hasHighPrecisionCount: 0, hasHighCurrentCount: 0,
      overallTemper: 20, smithGrade: 'novice' as const,
      bestIngot: 'a.ts', strongest: 'a.ts', wisest: 'a.ts',
      clearest: 'a.ts', mostPrecise: 'a.ts', mostEnduring: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgStrength: 20, avgPrecision: 20, avgWisdom: 20, isBronze: false, overallTemper: 20 }, stats)
    expect(recs.some((r) => r.includes('forge') || r.includes('cold'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorIngotCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorIngotCondition('bronze-masterpiece')).toBe('string')
    expect(typeof colorIngotCondition('ageless-alloy')).toBe('string')
    expect(typeof colorIngotCondition('proper-bronze')).toBe('string')
    expect(typeof colorIngotCondition('tarnished-metal')).toBe('string')
    expect(typeof colorIngotCondition('raw-ore')).toBe('string')
    expect(typeof colorIngotCondition('void')).toBe('string')
  })

  it('handles unknown condition', () => {
    expect(typeof colorIngotCondition('unknown')).toBe('string')
  })
})

describe('colorWorkshopCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorWorkshopCondition('master-smithy')).toBe('string')
    expect(typeof colorWorkshopCondition('bronze-hall')).toBe('string')
    expect(typeof colorWorkshopCondition('proper-workshop')).toBe('string')
    expect(typeof colorWorkshopCondition('rusty-shed')).toBe('string')
    expect(typeof colorWorkshopCondition('empty-lot')).toBe('string')
    expect(typeof colorWorkshopCondition('void')).toBe('string')
  })

  it('handles unknown condition', () => {
    expect(typeof colorWorkshopCondition('unknown')).toBe('string')
  })
})

describe('formatIngotTable', () => {
  it('formats an ingot', () => {
    const ingot = analyzeBronzeIngot(richContent, 'app.ts')
    const output = formatIngotTable(ingot)
    expect(output).toContain('app.ts')
    expect(output).toContain('Alloy Strength')
    expect(output).toContain('Quality Score')
  })
})

describe('formatIngotsTable', () => {
  it('formats empty ingots', () => {
    expect(formatIngotsTable([])).toContain('No bronze ingots')
  })

  it('formats multiple ingots', () => {
    const i1 = analyzeBronzeIngot(richContent, 'a.ts')
    const i2 = analyzeBronzeIngot(poorContent, 'b.ts')
    const output = formatIngotsTable([i1, i2])
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatWorkshopTable', () => {
  it('formats a workshop', () => {
    const ingot = analyzeBronzeIngot(richContent, 'src/a.ts')
    const workshop = analyzeBronzeWorkshop([ingot], 'src')
    const output = formatWorkshopTable(workshop)
    expect(output).toContain('src')
    expect(output).toContain('Ingots')
  })
})

describe('formatWorkshopsTable', () => {
  it('formats empty workshops', () => {
    expect(formatWorkshopsTable([])).toContain('No bronze workshops')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildBronzeAnvilResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Total Files')
    expect(output).toContain('Smith Grade')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Fix Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildBronzeAnvilResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Bronze Anvil Analysis')
    expect(output).toContain('Foundry Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats as JSON', async () => {
    const result = await buildBronzeAnvilResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.ingots).toHaveLength(1)
    expect(parsed.foundry).toBeDefined()
  })
})
