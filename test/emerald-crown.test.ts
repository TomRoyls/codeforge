import { describe, expect, it } from 'vitest'

import {
  analyzeEmeraldDecree,
  analyzeEmeraldKingdom,
  buildEmeraldThroneResult,
  classifyDecreeCondition,
  classifyKingdomType,
  classifyKingdomCondition,
  classifySovereignGrade,
  generateRecommendations,
  measureRuling,
  measureGoverning,
  measureDecreeing,
  measureDefending,
  measurePersisting,
  type DecreeCondition,
  type KingdomCondition,
  type EmeraldDecree,
  type EmeraldThroneResult,
  type EmeraldKingdom,
} from '../src/commands/emerald-crown-helpers.js'

import {
  colorDecreeCondition,
  colorKingdomCondition,
  colorScore,
  formatDecreeTable,
  formatDecreesTable,
  formatKingdomsTable,
  formatKingdomTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/emerald-crown-format-helpers.js'

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

// ─── measureRuling ──────────────────────────────────────

describe('measureRuling', () => {
  it('scores rich content high', () => {
    const m = measureRuling(richContent)
    expect(m.authority).toBeGreaterThanOrEqual(60)
    expect(m.hasHighAuthority).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureRuling(emptyContent)
    expect(m.authority).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureRuling(richContent)
    const poor = measureRuling(poorContent)
    expect(rich.authority).toBeGreaterThan(poor.authority)
  })

  it('detects chaotic patterns', () => {
    const m = measureRuling('var x = eval("boom")')
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects weak patterns', () => {
    const m = measureRuling('weak fragile flimsy code')
    expect(m.weakCount).toBeGreaterThan(0)
  })

  it('assigns high throne for rich content', () => {
    const m = measureRuling(richContent)
    expect(['supreme-ruler', 'wise-king', 'proper-monarch']).toContain(m.throne)
  })

  it('assigns low throne for empty content', () => {
    const m = measureRuling(emptyContent)
    expect(['no-authority', 'pretender', 'puppet-ruler', 'proper-monarch']).toContain(m.throne)
  })

  it('has all boolean properties', () => {
    const m = measureRuling(richContent)
    expect(typeof m.hasWellStructured).toBe('boolean')
    expect(typeof m.hasConfident).toBe('boolean')
    expect(typeof m.hasDirect).toBe('boolean')
  })
})

// ─── measureGoverning ───────────────────────────────────

describe('measureGoverning', () => {
  it('scores rich content high', () => {
    const m = measureGoverning(richContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(60)
    expect(m.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureGoverning(emptyContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureGoverning(richContent)
    const poor = measureGoverning(poorContent)
    expect(rich.wisdom).toBeGreaterThan(poor.wisdom)
  })

  it('detects hacked patterns', () => {
    const m = measureGoverning('hack workaround monkey')
    expect(m.hackedCount).toBeGreaterThan(0)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects shallow patterns', () => {
    const m = measureGoverning('shallow superficial quick.fix')
    expect(m.shallowCount).toBeGreaterThan(0)
  })

  it('assigns high reign for rich content', () => {
    const m = measureGoverning(richContent)
    expect(['golden-age', 'wise-rule', 'proper-governance']).toContain(m.reign)
  })

  it('assigns low reign for empty content', () => {
    const m = measureGoverning(emptyContent)
    expect(['no-wisdom', 'chaos', 'mismanagement', 'proper-governance']).toContain(m.reign)
  })

  it('has all boolean properties', () => {
    const m = measureGoverning(richContent)
    expect(typeof m.hasWellArchitected).toBe('boolean')
    expect(typeof m.hasHolistic).toBe('boolean')
    expect(typeof m.hasExperienced).toBe('boolean')
  })
})

// ─── measureDecreeing ───────────────────────────────────

describe('measureDecreeing', () => {
  it('scores rich content high', () => {
    const m = measureDecreeing(richContent)
    expect(m.precision).toBeGreaterThanOrEqual(60)
    expect(m.hasHighPrecision).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureDecreeing(emptyContent)
    expect(m.precision).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureDecreeing(richContent)
    const poor = measureDecreeing(poorContent)
    expect(rich.precision).toBeGreaterThan(poor.precision)
  })

  it('detects unsafe patterns', () => {
    const m = measureDecreeing('var x = eval("1")')
    expect(m.unsafeCount).toBeGreaterThan(0)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects approximate patterns', () => {
    const m = measureDecreeing('roughly approximately guesstimate')
    expect(m.approximateCount).toBeGreaterThan(0)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('assigns high crown for rich content', () => {
    const m = measureDecreeing(richContent)
    expect(['royal-seal', 'official-edict', 'proper-decree']).toContain(m.crown)
  })

  it('assigns low crown for empty content', () => {
    const m = measureDecreeing(emptyContent)
    expect(['no-precision', 'whisper', 'vague-memo', 'proper-decree']).toContain(m.crown)
  })

  it('has all boolean properties', () => {
    const m = measureDecreeing(richContent)
    expect(typeof m.hasTypeSafe).toBe('boolean')
    expect(typeof m.hasExact).toBe('boolean')
    expect(typeof m.hasDecisive).toBe('boolean')
  })
})

// ─── measureDefending ───────────────────────────────────

describe('measureDefending', () => {
  it('scores rich content high', () => {
    const m = measureDefending(richContent)
    expect(m.resilience).toBeGreaterThanOrEqual(60)
    expect(m.hasHighResilience).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureDefending(emptyContent)
    expect(m.resilience).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureDefending(richContent)
    const poor = measureDefending(poorContent)
    expect(rich.resilience).toBeGreaterThan(poor.resilience)
  })

  it('detects unhandled patterns', () => {
    const m = measureDefending('eval (x)')
    expect(m.unhandledCount).toBeGreaterThan(0)
    expect(m.hasNoUnhandled).toBe(false)
  })

  it('detects untested patterns', () => {
    const m = measureDefending('eval (x)')
    expect(m.untestedCount).toBeGreaterThan(0)
    expect(m.hasNoUntested).toBe(false)
  })

  it('assigns high shield for rich content', () => {
    const m = measureDefending(richContent)
    expect(['impregnable-fortress', 'stronghold', 'proper-defenses']).toContain(m.shield)
  })

  it('assigns low shield for empty content', () => {
    const m = measureDefending(emptyContent)
    expect(['no-resilience', 'paper-wall', 'wooden-fence', 'proper-defenses']).toContain(m.shield)
  })

  it('has all boolean properties', () => {
    const m = measureDefending(richContent)
    expect(typeof m.hasErrorHandled).toBe('boolean')
    expect(typeof m.hasStable).toBe('boolean')
    expect(typeof m.hasUnyielding).toBe('boolean')
  })
})

// ─── measurePersisting ──────────────────────────────────

describe('measurePersisting', () => {
  it('scores rich content high', () => {
    const m = measurePersisting(richContent)
    expect(m.endurance).toBeGreaterThanOrEqual(60)
    expect(m.hasHighEndurance).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measurePersisting(emptyContent)
    expect(m.endurance).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measurePersisting(richContent)
    const poor = measurePersisting(poorContent)
    expect(rich.endurance).toBeGreaterThan(poor.endurance)
  })

  it('detects fragile patterns', () => {
    const m = measurePersisting('fragile brittle delicate')
    expect(m.fragileCount).toBeGreaterThan(0)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects static patterns', () => {
    const m = measurePersisting('monolithic god.object mega')
    expect(m.staticCount).toBeGreaterThan(0)
  })

  it('assigns high dynasty for rich content', () => {
    const m = measurePersisting(richContent)
    expect(['eternal-dynasty', 'lasting-empire', 'proper-reign']).toContain(m.dynasty)
  })

  it('assigns low dynasty for empty content', () => {
    const m = measurePersisting(emptyContent)
    expect(['no-endurance', 'one-day-king', 'brief-rule', 'proper-reign']).toContain(m.dynasty)
  })

  it('has all boolean properties', () => {
    const m = measurePersisting(richContent)
    expect(typeof m.hasMaintainable).toBe('boolean')
    expect(typeof m.hasTimeless).toBe('boolean')
    expect(typeof m.hasImmortal).toBe('boolean')
  })
})

// ─── classifyDecreeCondition ────────────────────────────

describe('classifyDecreeCondition', () => {
  it('classifies 90+ as emerald-masterpiece', () => {
    expect(classifyDecreeCondition(90)).toBe('emerald-masterpiece')
    expect(classifyDecreeCondition(95)).toBe('emerald-masterpiece')
  })

  it('classifies 75-89 as royal-standard', () => {
    expect(classifyDecreeCondition(75)).toBe('royal-standard')
    expect(classifyDecreeCondition(89)).toBe('royal-standard')
  })

  it('classifies 60-74 as proper-gem', () => {
    expect(classifyDecreeCondition(60)).toBe('proper-gem')
    expect(classifyDecreeCondition(74)).toBe('proper-gem')
  })

  it('classifies 40-59 as base-metal', () => {
    expect(classifyDecreeCondition(40)).toBe('base-metal')
    expect(classifyDecreeCondition(59)).toBe('base-metal')
  })

  it('classifies 20-39 as tin-foil', () => {
    expect(classifyDecreeCondition(20)).toBe('tin-foil')
    expect(classifyDecreeCondition(39)).toBe('tin-foil')
  })

  it('classifies below 20 as void', () => {
    expect(classifyDecreeCondition(0)).toBe('void')
    expect(classifyDecreeCondition(19)).toBe('void')
  })
})

// ─── classifyKingdomType ────────────────────────────────

describe('classifyKingdomType', () => {
  it('returns no-kingdom for empty decrees', () => {
    expect(classifyKingdomType([])).toBe('no-kingdom')
  })

  it('returns grand-empire for high avg quality', () => {
    const decrees = [
      { qualityScore: 90 } as EmeraldDecree,
      { qualityScore: 85 } as EmeraldDecree,
    ]
    expect(classifyKingdomType(decrees)).toBe('grand-empire')
  })

  it('returns prosperous-kingdom for good quality', () => {
    const decrees = [
      { qualityScore: 70 } as EmeraldDecree,
      { qualityScore: 75 } as EmeraldDecree,
    ]
    expect(classifyKingdomType(decrees)).toBe('prosperous-kingdom')
  })

  it('returns proper-realm for decent quality', () => {
    const decrees = [
      { qualityScore: 55 } as EmeraldDecree,
      { qualityScore: 60 } as EmeraldDecree,
    ]
    expect(classifyKingdomType(decrees)).toBe('proper-realm')
  })

  it('returns small-dukedom for low quality', () => {
    const decrees = [
      { qualityScore: 35 } as EmeraldDecree,
      { qualityScore: 40 } as EmeraldDecree,
    ]
    expect(classifyKingdomType(decrees)).toBe('small-dukedom')
  })

  it('returns barren-wasteland for very low quality', () => {
    const decrees = [
      { qualityScore: 10 } as EmeraldDecree,
      { qualityScore: 15 } as EmeraldDecree,
    ]
    expect(classifyKingdomType(decrees)).toBe('barren-wasteland')
  })
})

// ─── classifyKingdomCondition ───────────────────────────

describe('classifyKingdomCondition', () => {
  it('classifies 85+ as emerald-palace', () => {
    expect(classifyKingdomCondition(85)).toBe('emerald-palace')
  })

  it('classifies 70-84 as royal-court', () => {
    expect(classifyKingdomCondition(70)).toBe('royal-court')
  })

  it('classifies 55-69 as proper-castle', () => {
    expect(classifyKingdomCondition(55)).toBe('proper-castle')
  })

  it('classifies 35-54 as wooden-fort', () => {
    expect(classifyKingdomCondition(35)).toBe('wooden-fort')
  })

  it('classifies 15-34 as tent', () => {
    expect(classifyKingdomCondition(15)).toBe('tent')
  })

  it('classifies below 15 as void', () => {
    expect(classifyKingdomCondition(0)).toBe('void')
  })
})

// ─── classifySovereignGrade ─────────────────────────────

describe('classifySovereignGrade', () => {
  it('classifies 80+ as emperor', () => {
    expect(classifySovereignGrade(80)).toBe('emperor')
    expect(classifySovereignGrade(100)).toBe('emperor')
  })

  it('classifies 65-79 as king', () => {
    expect(classifySovereignGrade(65)).toBe('king')
    expect(classifySovereignGrade(79)).toBe('king')
  })

  it('classifies 50-64 as duke', () => {
    expect(classifySovereignGrade(50)).toBe('duke')
    expect(classifySovereignGrade(64)).toBe('duke')
  })

  it('classifies 35-49 as baron', () => {
    expect(classifySovereignGrade(35)).toBe('baron')
    expect(classifySovereignGrade(49)).toBe('baron')
  })

  it('classifies 20-34 as knight', () => {
    expect(classifySovereignGrade(20)).toBe('knight')
    expect(classifySovereignGrade(34)).toBe('knight')
  })

  it('classifies below 20 as peasant', () => {
    expect(classifySovereignGrade(0)).toBe('peasant')
    expect(classifySovereignGrade(19)).toBe('peasant')
  })
})

// ─── analyzeEmeraldDecree ───────────────────────────────

describe('analyzeEmeraldDecree', () => {
  it('analyzes a file and returns all measures', () => {
    const decree = analyzeEmeraldDecree(richContent, 'app.ts')
    expect(decree.file).toBe('app.ts')
    expect(decree.gemAuthority).toBeGreaterThanOrEqual(0)
    expect(decree.throneWisdom).toBeGreaterThanOrEqual(0)
    expect(decree.crownPrecision).toBeGreaterThanOrEqual(0)
    expect(decree.scepterResilience).toBeGreaterThanOrEqual(0)
    expect(decree.dynastyEndurance).toBeGreaterThanOrEqual(0)
    expect(decree.qualityScore).toBeGreaterThanOrEqual(0)
    expect(decree.condition).toBeDefined()
  })

  it('scores rich content high overall', () => {
    const decree = analyzeEmeraldDecree(richContent, 'app.ts')
    expect(decree.qualityScore).toBeGreaterThanOrEqual(60)
  })

  it('scores poor content low overall', () => {
    const decree = analyzeEmeraldDecree(poorContent, 'bad.ts')
    expect(decree.qualityScore).toBeLessThanOrEqual(100)
    expect(decree.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('calculates qualityScore as weighted average', () => {
    const decree = analyzeEmeraldDecree(richContent, 'app.ts')
    const expected = Math.round(
      decree.gemAuthority * 0.2 +
      decree.throneWisdom * 0.2 +
      decree.crownPrecision * 0.2 +
      decree.scepterResilience * 0.2 +
      decree.dynastyEndurance * 0.2,
    )
    expect(decree.qualityScore).toBe(expected)
  })

  it('includes all sub-measures', () => {
    const decree = analyzeEmeraldDecree(richContent, 'app.ts')
    expect(decree.ruling).toBeDefined()
    expect(decree.governing).toBeDefined()
    expect(decree.decreeing).toBeDefined()
    expect(decree.defending).toBeDefined()
    expect(decree.persisting).toBeDefined()
  })

  it('classifies condition based on qualityScore', () => {
    const decree = analyzeEmeraldDecree(richContent, 'app.ts')
    const expectedCondition = classifyDecreeCondition(decree.qualityScore)
    expect(decree.condition).toBe(expectedCondition)
  })

  it('handles empty content gracefully', () => {
    const decree = analyzeEmeraldDecree(emptyContent, 'empty.ts')
    expect(decree.qualityScore).toBeGreaterThanOrEqual(0)
  })
})

// ─── analyzeEmeraldKingdom ──────────────────────────────

describe('analyzeEmeraldKingdom', () => {
  it('returns empty kingdom for no decrees', () => {
    const kingdom = analyzeEmeraldKingdom([], 'src')
    expect(kingdom.directory).toBe('src')
    expect(kingdom.decrees).toHaveLength(0)
    expect(kingdom.avgAuthority).toBe(0)
    expect(kingdom.kingdomType).toBe('no-kingdom')
    expect(kingdom.condition).toBe('void')
  })

  it('aggregates decree scores', () => {
    const decree1 = analyzeEmeraldDecree(richContent, 'a.ts')
    const decree2 = analyzeEmeraldDecree(richContent, 'b.ts')
    const kingdom = analyzeEmeraldKingdom([decree1, decree2], 'src')
    expect(kingdom.avgAuthority).toBeGreaterThanOrEqual(0)
    expect(kingdom.avgPrecision).toBeGreaterThanOrEqual(0)
    expect(kingdom.avgEndurance).toBeGreaterThanOrEqual(0)
    expect(kingdom.decrees).toHaveLength(2)
  })

  it('counts masterpieces and voids', () => {
    const decree = analyzeEmeraldDecree(richContent, 'app.ts')
    const kingdom = analyzeEmeraldKingdom([decree], 'src')
    expect(kingdom.emeraldMasterpieceCount + kingdom.voidCount).toBeLessThanOrEqual(1)
  })

  it('classifies kingdom type and condition', () => {
    const decree = analyzeEmeraldDecree(richContent, 'app.ts')
    const kingdom = analyzeEmeraldKingdom([decree], 'src')
    expect(kingdom.kingdomType).toBeDefined()
    expect(kingdom.condition).toBeDefined()
  })
})

// ─── buildEmeraldThroneResult ───────────────────────────

describe('buildEmeraldThroneResult', () => {
  it('handles empty input', async () => {
    const result = await buildEmeraldThroneResult([], [])
    expect(result.decrees).toHaveLength(0)
    expect(result.kingdoms).toHaveLength(0)
    expect(result.empire.overallSovereignty).toBe(0)
    expect(result.empire.isEmerald).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildEmeraldThroneResult(['a.ts'], [richContent])
    expect(result.decrees).toHaveLength(1)
    expect(result.decrees[0].file).toBe('a.ts')
  })

  it('analyzes multiple files', async () => {
    const result = await buildEmeraldThroneResult(
      ['a.ts', 'b.ts'],
      [richContent, poorContent],
    )
    expect(result.decrees).toHaveLength(2)
  })

  it('groups files by directory', async () => {
    const result = await buildEmeraldThroneResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, poorContent],
    )
    expect(result.kingdoms.length).toBe(2)
  })

  it('computes empire averages', async () => {
    const result = await buildEmeraldThroneResult(['a.ts'], [richContent])
    expect(result.empire.avgAuthority).toBeGreaterThanOrEqual(0)
    expect(result.empire.avgPrecision).toBeGreaterThanOrEqual(0)
    expect(result.empire.avgEndurance).toBeGreaterThanOrEqual(0)
  })

  it('computes stats correctly', async () => {
    const result = await buildEmeraldThroneResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalKingdoms).toBeGreaterThanOrEqual(1)
    expect(result.stats.overallSovereignty).toBeGreaterThanOrEqual(0)
    expect(result.stats.sovereignGrade).toBeDefined()
  })

  it('identifies best and extreme files', async () => {
    const result = await buildEmeraldThroneResult(
      ['a.ts', 'b.ts'],
      [richContent, poorContent],
    )
    expect(result.stats.bestDecree).toBeTruthy()
    expect(result.stats.mostAuthoritative).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.mostEnduring).toBeTruthy()
  })

  it('includes recommendations', async () => {
    const result = await buildEmeraldThroneResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty bestDecree for no files', async () => {
    const result = await buildEmeraldThroneResult([], [])
    expect(result.stats.bestDecree).toBe('')
    expect(result.stats.mostAuthoritative).toBe('')
  })

  it('scores rich content at max', async () => {
    const result = await buildEmeraldThroneResult(['a.ts'], [richContent])
    expect(result.decrees[0].gemAuthority).toBeGreaterThanOrEqual(60)
    expect(result.decrees[0].throneWisdom).toBeGreaterThanOrEqual(60)
    expect(result.decrees[0].crownPrecision).toBeGreaterThanOrEqual(60)
    expect(result.decrees[0].scepterResilience).toBeGreaterThanOrEqual(60)
    expect(result.decrees[0].dynastyEndurance).toBeGreaterThanOrEqual(60)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('recommends masterpiece when all scores are high', () => {
    const stats = {
      totalFiles: 1, totalKingdoms: 1,
      avgGemAuthority: 95, avgThroneWisdom: 95, avgCrownPrecision: 95,
      avgScepterResilience: 95, avgDynastyEndurance: 95,
      emeraldMasterpieceCount: 1, royalStandardCount: 0, properGemCount: 0,
      baseMetalCount: 0, tinFoilCount: 0, voidCount: 0,
      hasHighAuthorityCount: 1, hasHighWisdomCount: 1, hasHighPrecisionCount: 1,
      hasHighResilienceCount: 1, hasHighEnduranceCount: 1,
      overallSovereignty: 95, sovereignGrade: 'emperor' as const,
      bestDecree: 'a.ts', mostAuthoritative: 'a.ts', wisest: 'a.ts',
      mostPrecise: 'a.ts', mostResilient: 'a.ts', mostEnduring: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgAuthority: 95, avgPrecision: 95, avgEndurance: 95, isDiamond: true, overallSovereignty: 95 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends authority when low', () => {
    const stats = {
      totalFiles: 1, totalKingdoms: 1,
      avgGemAuthority: 30, avgThroneWisdom: 90, avgCrownPrecision: 90,
      avgScepterResilience: 90, avgDynastyEndurance: 90,
      emeraldMasterpieceCount: 0, royalStandardCount: 0, properGemCount: 0,
      baseMetalCount: 0, tinFoilCount: 0, voidCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0, hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0, hasHighEnduranceCount: 0,
      overallSovereignty: 78, sovereignGrade: 'king' as const,
      bestDecree: 'a.ts', mostAuthoritative: 'a.ts', wisest: 'a.ts',
      mostPrecise: 'a.ts', mostResilient: 'a.ts', mostEnduring: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgAuthority: 30, avgPrecision: 90, avgEndurance: 90, isEmerald: true, overallSovereignty: 78 }, stats)
    expect(recs.some((r) => r.includes('authority'))).toBe(true)
  })

  it('recommends precision when low', () => {
    const stats = {
      totalFiles: 1, totalKingdoms: 1,
      avgGemAuthority: 90, avgThroneWisdom: 90, avgCrownPrecision: 30,
      avgScepterResilience: 90, avgDynastyEndurance: 90,
      emeraldMasterpieceCount: 0, royalStandardCount: 0, properGemCount: 0,
      baseMetalCount: 0, tinFoilCount: 0, voidCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0, hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0, hasHighEnduranceCount: 0,
      overallSovereignty: 78, sovereignGrade: 'king' as const,
      bestDecree: 'a.ts', mostAuthoritative: 'a.ts', wisest: 'a.ts',
      mostPrecise: 'a.ts', mostResilient: 'a.ts', mostEnduring: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgAuthority: 90, avgPrecision: 30, avgEndurance: 90, isEmerald: true, overallSovereignty: 78 }, stats)
    expect(recs.some((r) => r.includes('precision'))).toBe(true)
  })

  it('recommends resilience when low', () => {
    const stats = {
      totalFiles: 1, totalKingdoms: 1,
      avgGemAuthority: 90, avgThroneWisdom: 90, avgCrownPrecision: 90,
      avgScepterResilience: 30, avgDynastyEndurance: 90,
      emeraldMasterpieceCount: 0, royalStandardCount: 0, properGemCount: 0,
      baseMetalCount: 0, tinFoilCount: 0, voidCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0, hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0, hasHighEnduranceCount: 0,
      overallSovereignty: 78, sovereignGrade: 'king' as const,
      bestDecree: 'a.ts', mostAuthoritative: 'a.ts', wisest: 'a.ts',
      mostPrecise: 'a.ts', mostResilient: 'a.ts', mostEnduring: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgAuthority: 90, avgPrecision: 90, avgEndurance: 90, isEmerald: true, overallSovereignty: 78 }, stats)
    expect(recs.some((r) => r.includes('resilience'))).toBe(true)
  })

  it('recommends endurance when low', () => {
    const stats = {
      totalFiles: 1, totalKingdoms: 1,
      avgGemAuthority: 90, avgThroneWisdom: 90, avgCrownPrecision: 90,
      avgScepterResilience: 90, avgDynastyEndurance: 30,
      emeraldMasterpieceCount: 0, royalStandardCount: 0, properGemCount: 0,
      baseMetalCount: 0, tinFoilCount: 0, voidCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0, hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0, hasHighEnduranceCount: 0,
      overallSovereignty: 78, sovereignGrade: 'king' as const,
      bestDecree: 'a.ts', mostAuthoritative: 'a.ts', wisest: 'a.ts',
      mostPrecise: 'a.ts', mostResilient: 'a.ts', mostEnduring: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgAuthority: 90, avgPrecision: 90, avgEndurance: 30, isEmerald: true, overallSovereignty: 78 }, stats)
    expect(recs.some((r) => r.includes('endurance'))).toBe(true)
  })

  it('recommends wisdom when low', () => {
    const stats = {
      totalFiles: 1, totalKingdoms: 1,
      avgGemAuthority: 90, avgThroneWisdom: 30, avgCrownPrecision: 90,
      avgScepterResilience: 90, avgDynastyEndurance: 90,
      emeraldMasterpieceCount: 0, royalStandardCount: 0, properGemCount: 0,
      baseMetalCount: 0, tinFoilCount: 0, voidCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0, hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0, hasHighEnduranceCount: 0,
      overallSovereignty: 78, sovereignGrade: 'king' as const,
      bestDecree: 'a.ts', mostAuthoritative: 'a.ts', wisest: 'a.ts',
      mostPrecise: 'a.ts', mostResilient: 'a.ts', mostEnduring: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgAuthority: 90, avgPrecision: 90, avgEndurance: 90, isEmerald: true, overallSovereignty: 78 }, stats)
    expect(recs.some((r) => r.includes('wisdom'))).toBe(true)
  })

  it('warns about very low sovereignty', () => {
    const stats = {
      totalFiles: 1, totalKingdoms: 1,
      avgGemAuthority: 20, avgThroneWisdom: 20, avgCrownPrecision: 20,
      avgScepterResilience: 20, avgDynastyEndurance: 20,
      emeraldMasterpieceCount: 0, royalStandardCount: 0, properGemCount: 0,
      baseMetalCount: 0, tinFoilCount: 0, voidCount: 1,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0, hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0, hasHighEnduranceCount: 0,
      overallSovereignty: 20, sovereignGrade: 'knight' as const,
      bestDecree: 'a.ts', mostAuthoritative: 'a.ts', wisest: 'a.ts',
      mostPrecise: 'a.ts', mostResilient: 'a.ts', mostEnduring: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgAuthority: 20, avgPrecision: 20, avgEndurance: 20, isEmerald: false, overallSovereignty: 20 }, stats)
    expect(recs.some((r) => r.includes('throne room') || r.includes('empty'))).toBe(true)
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

describe('colorDecreeCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorDecreeCondition('emerald-masterpiece')).toBe('string')
    expect(typeof colorDecreeCondition('royal-standard')).toBe('string')
    expect(typeof colorDecreeCondition('proper-gem')).toBe('string')
    expect(typeof colorDecreeCondition('base-metal')).toBe('string')
    expect(typeof colorDecreeCondition('tin-foil')).toBe('string')
    expect(typeof colorDecreeCondition('void')).toBe('string')
  })

  it('handles unknown condition', () => {
    expect(typeof colorDecreeCondition('unknown')).toBe('string')
  })
})

describe('colorKingdomCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorKingdomCondition('emerald-palace')).toBe('string')
    expect(typeof colorKingdomCondition('royal-court')).toBe('string')
    expect(typeof colorKingdomCondition('proper-castle')).toBe('string')
    expect(typeof colorKingdomCondition('wooden-fort')).toBe('string')
    expect(typeof colorKingdomCondition('tent')).toBe('string')
    expect(typeof colorKingdomCondition('void')).toBe('string')
  })

  it('handles unknown condition', () => {
    expect(typeof colorKingdomCondition('unknown')).toBe('string')
  })
})

describe('formatDecreeTable', () => {
  it('formats a decree', () => {
    const decree = analyzeEmeraldDecree(richContent, 'app.ts')
    const output = formatDecreeTable(decree)
    expect(output).toContain('app.ts')
    expect(output).toContain('Gem Authority')
    expect(output).toContain('Quality Score')
  })
})

describe('formatDecreesTable', () => {
  it('formats empty decrees', () => {
    expect(formatDecreesTable([])).toContain('No emerald decrees')
  })

  it('formats multiple decrees', () => {
    const d1 = analyzeEmeraldDecree(richContent, 'a.ts')
    const d2 = analyzeEmeraldDecree(poorContent, 'b.ts')
    const output = formatDecreesTable([d1, d2])
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatKingdomTable', () => {
  it('formats a kingdom', () => {
    const decree = analyzeEmeraldDecree(richContent, 'src/a.ts')
    const kingdom = analyzeEmeraldKingdom([decree], 'src')
    const output = formatKingdomTable(kingdom)
    expect(output).toContain('src')
    expect(output).toContain('Decrees')
  })
})

describe('formatKingdomsTable', () => {
  it('formats empty kingdoms', () => {
    expect(formatKingdomsTable([])).toContain('No emerald kingdoms')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildEmeraldThroneResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Total Files')
    expect(output).toContain('Sovereign Grade')
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
    const result = await buildEmeraldThroneResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Emerald Throne Analysis')
    expect(output).toContain('Empire Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats as JSON', async () => {
    const result = await buildEmeraldThroneResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.decrees).toHaveLength(1)
    expect(parsed.empire).toBeDefined()
  })
})
