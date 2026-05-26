import { describe, expect, it } from 'vitest'

import {
  analyzeEmeraldDecree,
  analyzeEmeraldKingdom,
  buildEmeraldThroneResult,
  classifyDecreeCondition,
  classifyKingdomCondition,
  classifyKingdomType,
  classifySovereignGrade,
  generateRecommendations,
  measureRuling,
  measureGoverning,
  measureDecreeing,
  measureDefending,
  measurePersisting,
  type EmeraldDecree,
  type EmeraldKingdom,
  type EmeraldThroneResult,
} from '../src/commands/emerald-scepter-helpers.js'

import {
  colorScore,
  colorKingdomCondition,
  formatDecreeTable,
  formatDecreesTable,
  formatKingdomTable,
  formatKingdomsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/emerald-scepter-format-helpers.js'

// ─── Test fixtures ──────────────────────────────────────

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

const poorContent = 'var x = eval("1+2") any global hack'

// ─── measureRuling ──────────────────────────────────────

describe('measureRuling', () => {
  it('scores rich content highly', () => {
    const result = measureRuling(richContent)
    expect(result.authority).toBeGreaterThan(60)
    expect(result.hasHighAuthority).toBe(true)
  })

  it('scores empty content poorly', () => {
    const result = measureRuling(emptyContent)
    expect(result.authority).toBeLessThan(50)
    expect(result.hasHighAuthority).toBe(false)
  })

  it('scores poor content low', () => {
    const result = measureRuling(poorContent)
    expect(result.authority).toBeLessThan(50)
  })

  it('classifies throne correctly for high scores', () => {
    const result = measureRuling(richContent)
    expect(['supreme-ruler', 'wise-king', 'proper-monarch']).toContain(result.throne)
  })

  it('classifies throne correctly for low scores', () => {
    const result = measureRuling(emptyContent)
    expect(['no-authority', 'pretender']).toContain(result.throne)
  })

  it('detects chaotic content', () => {
    const result = measureRuling('chaotic messy code')
    expect(result.chaoticCount).toBeGreaterThan(0)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects weak content', () => {
    const result = measureRuling('weak flimsy code')
    expect(result.weakCount).toBeGreaterThan(0)
  })

  it('has all boolean fields', () => {
    const result = measureRuling(richContent)
    expect(typeof result.hasWellStructured).toBe('boolean')
    expect(typeof result.hasConfident).toBe('boolean')
    expect(typeof result.hasClear).toBe('boolean')
    expect(typeof result.hasDecisive).toBe('boolean')
    expect(typeof result.hasDocumented).toBe('boolean')
    expect(typeof result.hasTyped).toBe('boolean')
    expect(typeof result.hasOrganized).toBe('boolean')
    expect(typeof result.hasCommanding).toBe('boolean')
    expect(typeof result.hasStrong).toBe('boolean')
    expect(typeof result.hasAuthoritative).toBe('boolean')
    expect(typeof result.hasBold).toBe('boolean')
    expect(typeof result.hasDirect).toBe('boolean')
    expect(typeof result.hasPrincipled).toBe('boolean')
    expect(typeof result.hasFirm).toBe('boolean')
  })
})

// ─── measureGoverning ───────────────────────────────────

describe('measureGoverning', () => {
  it('scores rich content highly', () => {
    const result = measureGoverning(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content poorly', () => {
    const result = measureGoverning(emptyContent)
    expect(result.wisdom).toBeLessThan(50)
  })

  it('classifies reign correctly for high scores', () => {
    const result = measureGoverning(richContent)
    expect(['golden-age', 'wise-rule', 'proper-governance']).toContain(result.reign)
  })

  it('detects hacked content', () => {
    const result = measureGoverning('hack workaround code')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects shallow content', () => {
    const result = measureGoverning('shallow superficial code')
    expect(result.shallowCount).toBeGreaterThan(0)
  })

  it('has all boolean fields', () => {
    const result = measureGoverning(richContent)
    expect(typeof result.hasWellArchitected).toBe('boolean')
    expect(typeof result.hasPrincipled).toBe('boolean')
    expect(typeof result.hasDeep).toBe('boolean')
    expect(typeof result.hasStrategic).toBe('boolean')
    expect(typeof result.hasHolistic).toBe('boolean')
    expect(typeof result.hasProven).toBe('boolean')
    expect(typeof result.hasMature).toBe('boolean')
    expect(typeof result.hasInsightful).toBe('boolean')
    expect(typeof result.hasVisionary).toBe('boolean')
    expect(typeof result.hasComprehensive).toBe('boolean')
    expect(typeof result.hasConnected).toBe('boolean')
    expect(typeof result.hasFarSighted).toBe('boolean')
    expect(typeof result.hasWise).toBe('boolean')
    expect(typeof result.hasExperienced).toBe('boolean')
  })
})

// ─── measureDecreeing ───────────────────────────────────

describe('measureDecreeing', () => {
  it('scores rich content highly', () => {
    const result = measureDecreeing(richContent)
    expect(result.precision).toBeGreaterThan(60)
  })

  it('scores poor content low', () => {
    const result = measureDecreeing(poorContent)
    expect(result.precision).toBeLessThan(50)
  })

  it('detects unsafe content', () => {
    const result = measureDecreeing('var x = eval("1")')
    expect(result.unsafeCount).toBeGreaterThan(0)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects approximate content', () => {
    const result = measureDecreeing('approximate rough code')
    expect(result.approximateCount).toBeGreaterThan(0)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('classifies crown correctly', () => {
    const result = measureDecreeing(richContent)
    expect(['royal-seal', 'official-edict', 'proper-decree']).toContain(result.crown)
  })

  it('classifies crown for empty content', () => {
    const result = measureDecreeing(emptyContent)
    expect(['no-precision', 'whisper', 'vague-memo']).toContain(result.crown)
  })
})

// ─── measureDefending ───────────────────────────────────

describe('measureDefending', () => {
  it('scores rich content highly', () => {
    const result = measureDefending(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content poorly', () => {
    const result = measureDefending(emptyContent)
    expect(result.resilience).toBeLessThan(50)
  })

  it('detects unhandled content', () => {
    const result = measureDefending('eval("code") Function("x")')
    expect(result.unhandledCount).toBeGreaterThan(0)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('classifies shield correctly for rich content', () => {
    const result = measureDefending(richContent)
    expect(['impregnable-fortress', 'stronghold', 'proper-defenses']).toContain(result.shield)
  })

  it('classifies shield for empty content', () => {
    const result = measureDefending(emptyContent)
    expect(['no-resilience', 'paper-wall', 'wooden-fence']).toContain(result.shield)
  })
})

// ─── measurePersisting ──────────────────────────────────

describe('measurePersisting', () => {
  it('scores rich content with endurance', () => {
    const result = measurePersisting(richContent)
    expect(result.endurance).toBeGreaterThan(60)
  })

  it('detects fragile content', () => {
    const result = measurePersisting('fragile brittle code')
    expect(result.fragileCount).toBeGreaterThan(0)
    expect(result.hasNoFragile).toBe(false)
  })

  it('detects static content', () => {
    const result = measurePersisting('static hardcoded rigid code')
    expect(result.staticCount).toBeGreaterThan(0)
    expect(result.hasNoStatic).toBe(false)
  })

  it('classifies dynasty for high scores', () => {
    const result = measurePersisting(richContent)
    expect(['eternal-dynasty', 'lasting-empire', 'proper-reign']).toContain(result.dynasty)
  })

  it('has hasEvolved checking extends/implements/abstract', () => {
    const result = measurePersisting('class X extends Y {}')
    expect(result.hasEvolved).toBe(true)
  })

  it('richContent does not have extends/implements/abstract so hasEvolved is false', () => {
    const result = measurePersisting(richContent)
    expect(result.hasEvolved).toBe(false)
  })
})

// ─── classifyDecreeCondition ────────────────────────────

describe('classifyDecreeCondition', () => {
  it('returns emerald-masterpiece for 90+', () => {
    expect(classifyDecreeCondition(90)).toBe('emerald-masterpiece')
    expect(classifyDecreeCondition(100)).toBe('emerald-masterpiece')
  })

  it('returns royal-standard for 75-89', () => {
    expect(classifyDecreeCondition(75)).toBe('royal-standard')
    expect(classifyDecreeCondition(89)).toBe('royal-standard')
  })

  it('returns proper-gem for 60-74', () => {
    expect(classifyDecreeCondition(60)).toBe('proper-gem')
    expect(classifyDecreeCondition(74)).toBe('proper-gem')
  })

  it('returns base-metal for 40-59', () => {
    expect(classifyDecreeCondition(40)).toBe('base-metal')
    expect(classifyDecreeCondition(59)).toBe('base-metal')
  })

  it('returns tin-foil for 20-39', () => {
    expect(classifyDecreeCondition(20)).toBe('tin-foil')
    expect(classifyDecreeCondition(39)).toBe('tin-foil')
  })

  it('returns void below 20', () => {
    expect(classifyDecreeCondition(0)).toBe('void')
    expect(classifyDecreeCondition(19)).toBe('void')
  })
})

// ─── classifyKingdomType ────────────────────────────────

describe('classifyKingdomType', () => {
  function makeDecree(score: number): EmeraldDecree {
    return {
      file: 'test.ts',
      gemAuthority: score, throneWisdom: score, crownPrecision: score,
      scepterResilience: score, dynastyEndurance: score,
      qualityScore: score,
      condition: classifyDecreeCondition(score),
      ruling: {} as EmeraldDecree['ruling'],
      governing: {} as EmeraldDecree['governing'],
      decreeing: {} as EmeraldDecree['decreeing'],
      defending: {} as EmeraldDecree['defending'],
      persisting: {} as EmeraldDecree['persisting'],
    }
  }

  it('returns no-kingdom for empty decrees', () => {
    expect(classifyKingdomType([])).toBe('no-kingdom')
  })

  it('returns grand-empire for high scores', () => {
    expect(classifyKingdomType([makeDecree(90)])).toBe('grand-empire')
  })

  it('returns barren-wasteland for low scores', () => {
    expect(classifyKingdomType([makeDecree(10)])).toBe('barren-wasteland')
  })
})

// ─── classifyKingdomCondition ───────────────────────────

describe('classifyKingdomCondition', () => {
  it('returns emerald-palace for 85+', () => {
    expect(classifyKingdomCondition(85)).toBe('emerald-palace')
  })

  it('returns royal-court for 70-84', () => {
    expect(classifyKingdomCondition(70)).toBe('royal-court')
  })

  it('returns proper-castle for 55-69', () => {
    expect(classifyKingdomCondition(55)).toBe('proper-castle')
  })

  it('returns wooden-fort for 35-54', () => {
    expect(classifyKingdomCondition(35)).toBe('wooden-fort')
  })

  it('returns tent for 15-34', () => {
    expect(classifyKingdomCondition(15)).toBe('tent')
  })

  it('returns void below 15', () => {
    expect(classifyKingdomCondition(0)).toBe('void')
  })
})

// ─── classifySovereignGrade ─────────────────────────────

describe('classifySovereignGrade', () => {
  it('returns emperor for 80+', () => {
    expect(classifySovereignGrade(80)).toBe('emperor')
    expect(classifySovereignGrade(100)).toBe('emperor')
  })

  it('returns king for 65-79', () => {
    expect(classifySovereignGrade(65)).toBe('king')
    expect(classifySovereignGrade(79)).toBe('king')
  })

  it('returns duke for 50-64', () => {
    expect(classifySovereignGrade(50)).toBe('duke')
  })

  it('returns baron for 35-49', () => {
    expect(classifySovereignGrade(35)).toBe('baron')
  })

  it('returns knight for 20-34', () => {
    expect(classifySovereignGrade(20)).toBe('knight')
  })

  it('returns peasant below 20', () => {
    expect(classifySovereignGrade(0)).toBe('peasant')
  })
})

// ─── analyzeEmeraldDecree ───────────────────────────────

describe('analyzeEmeraldDecree', () => {
  it('returns a complete EmeraldDecree', () => {
    const decree = analyzeEmeraldDecree(richContent, 'test.ts')
    expect(decree.file).toBe('test.ts')
    expect(typeof decree.gemAuthority).toBe('number')
    expect(typeof decree.throneWisdom).toBe('number')
    expect(typeof decree.crownPrecision).toBe('number')
    expect(typeof decree.scepterResilience).toBe('number')
    expect(typeof decree.dynastyEndurance).toBe('number')
    expect(typeof decree.qualityScore).toBe('number')
    expect(decree.ruling).toBeDefined()
    expect(decree.governing).toBeDefined()
    expect(decree.decreeing).toBeDefined()
    expect(decree.defending).toBeDefined()
    expect(decree.persisting).toBeDefined()
  })

  it('computes qualityScore as weighted average', () => {
    const decree = analyzeEmeraldDecree(richContent, 'test.ts')
    const expected = Math.round(
      decree.gemAuthority * 0.2 +
      decree.throneWisdom * 0.2 +
      decree.crownPrecision * 0.2 +
      decree.scepterResilience * 0.2 +
      decree.dynastyEndurance * 0.2,
    )
    expect(decree.qualityScore).toBe(expected)
  })

  it('scores rich content highly', () => {
    const decree = analyzeEmeraldDecree(richContent, 'test.ts')
    expect(decree.qualityScore).toBeGreaterThan(60)
  })

  it('scores empty content low', () => {
    const decree = analyzeEmeraldDecree(emptyContent, 'empty.ts')
    expect(decree.qualityScore).toBeLessThan(50)
  })
})

// ─── analyzeEmeraldKingdom ──────────────────────────────

describe('analyzeEmeraldKingdom', () => {
  it('returns empty kingdom for no decrees', () => {
    const kingdom = analyzeEmeraldKingdom([], 'src')
    expect(kingdom.directory).toBe('src')
    expect(kingdom.decrees).toHaveLength(0)
    expect(kingdom.kingdomType).toBe('no-kingdom')
    expect(kingdom.condition).toBe('void')
  })

  it('computes averages from decrees', () => {
    const decree = analyzeEmeraldDecree(richContent, 'test.ts')
    const kingdom = analyzeEmeraldKingdom([decree], 'src')
    expect(kingdom.avgAuthority).toBe(decree.gemAuthority)
    expect(kingdom.emeraldMasterpieceCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── buildEmeraldThroneResult ───────────────────────────

describe('buildEmeraldThroneResult', () => {
  it('returns complete result for empty input', async () => {
    const result = await buildEmeraldThroneResult([], [])
    expect(result.decrees).toHaveLength(0)
    expect(result.kingdoms).toHaveLength(0)
    expect(result.empire.overallSovereignty).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('returns complete result for single file', async () => {
    const result = await buildEmeraldThroneResult(['test.ts'], [richContent])
    expect(result.decrees).toHaveLength(1)
    expect(result.decrees[0].file).toBe('test.ts')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.overallSovereignty).toBeGreaterThan(0)
    expect(result.stats.sovereignGrade).toBeDefined()
  })

  it('returns complete result for multiple files', async () => {
    const result = await buildEmeraldThroneResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, poorContent],
    )
    expect(result.decrees).toHaveLength(3)
    expect(result.kingdoms).toHaveLength(2)
    expect(result.stats.totalKingdoms).toBe(2)
  })

  it('computes stats correctly', async () => {
    const result = await buildEmeraldThroneResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(typeof result.stats.bestDecree).toBe('string')
    expect(typeof result.stats.mostAuthoritative).toBe('string')
    expect(typeof result.stats.wisest).toBe('string')
    expect(typeof result.stats.mostPrecise).toBe('string')
    expect(typeof result.stats.mostResilient).toBe('string')
    expect(typeof result.stats.mostEnduring).toBe('string')
  })

  it('computes empire overview', async () => {
    const result = await buildEmeraldThroneResult(['a.ts'], [richContent])
    expect(typeof result.empire.avgAuthority).toBe('number')
    expect(typeof result.empire.avgPrecision).toBe('number')
    expect(typeof result.empire.avgEndurance).toBe('number')
    expect(typeof result.empire.isEmerald).toBe('boolean')
    expect(typeof result.empire.overallSovereignty).toBe('number')
  })

  it('generates recommendations', async () => {
    const result = await buildEmeraldThroneResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(typeof result.recommendations[0]).toBe('string')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  function makeStats(overrides: Partial<EmeraldThroneResult['stats']> = {}): EmeraldThroneResult['stats'] {
    return {
      totalFiles: 1,
      totalKingdoms: 1,
      avgGemAuthority: 50,
      avgThroneWisdom: 50,
      avgCrownPrecision: 50,
      avgScepterResilience: 50,
      avgDynastyEndurance: 50,
      emeraldMasterpieceCount: 0,
      royalStandardCount: 0,
      properGemCount: 1,
      baseMetalCount: 0,
      tinFoilCount: 0,
      voidCount: 0,
      hasHighAuthorityCount: 0,
      hasHighWisdomCount: 0,
      hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0,
      hasHighEnduranceCount: 0,
      overallSovereignty: 50,
      sovereignGrade: 'duke',
      bestDecree: 'a.ts',
      mostAuthoritative: 'a.ts',
      wisest: 'a.ts',
      mostPrecise: 'a.ts',
      mostResilient: 'a.ts',
      mostEnduring: 'a.ts',
      ...overrides,
    }
  }

  it('returns masterpiece message when all scores >= 90', () => {
    const stats = makeStats({
      avgGemAuthority: 92,
      avgThroneWisdom: 91,
      avgCrownPrecision: 90,
      avgScepterResilience: 93,
      avgDynastyEndurance: 90,
    })
    const recs = generateRecommendations(
      [],
      [],
      { avgAuthority: 92, avgPrecision: 90, avgEndurance: 90, isEmerald: true, overallSovereignty: 90 },
      stats,
    )
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('absolute sovereignty')
  })

  it('recommends authority improvement when low', () => {
    const stats = makeStats({ avgGemAuthority: 40 })
    const recs = generateRecommendations([], [], { avgAuthority: 40, avgPrecision: 50, avgEndurance: 50, isEmerald: false, overallSovereignty: 40 }, stats)
    expect(recs.some((r) => r.includes('gem authority'))).toBe(true)
  })

  it('recommends wisdom improvement when low', () => {
    const stats = makeStats({ avgThroneWisdom: 40 })
    const recs = generateRecommendations([], [], { avgAuthority: 50, avgPrecision: 50, avgEndurance: 50, isEmerald: false, overallSovereignty: 40 }, stats)
    expect(recs.some((r) => r.includes('throne wisdom'))).toBe(true)
  })

  it('recommends precision improvement when low', () => {
    const stats = makeStats({ avgCrownPrecision: 40 })
    const recs = generateRecommendations([], [], { avgAuthority: 50, avgPrecision: 40, avgEndurance: 50, isEmerald: false, overallSovereignty: 40 }, stats)
    expect(recs.some((r) => r.includes('crown precision'))).toBe(true)
  })

  it('recommends resilience improvement when low', () => {
    const stats = makeStats({ avgScepterResilience: 40 })
    const recs = generateRecommendations([], [], { avgAuthority: 50, avgPrecision: 50, avgEndurance: 50, isEmerald: false, overallSovereignty: 40 }, stats)
    expect(recs.some((r) => r.includes('scepter resilience'))).toBe(true)
  })

  it('recommends endurance improvement when low', () => {
    const stats = makeStats({ avgDynastyEndurance: 40 })
    const recs = generateRecommendations([], [], { avgAuthority: 50, avgPrecision: 50, avgEndurance: 40, isEmerald: false, overallSovereignty: 40 }, stats)
    expect(recs.some((r) => r.includes('dynasty endurance'))).toBe(true)
  })

  it('warns about overall low sovereignty', () => {
    const stats = makeStats({ overallSovereignty: 30 })
    const recs = generateRecommendations([], [], { avgAuthority: 30, avgPrecision: 30, avgEndurance: 30, isEmerald: false, overallSovereignty: 30 }, stats)
    expect(recs.some((r) => r.includes('crumbled'))).toBe(true)
  })

  it('lists void decrees', () => {
    const decree: EmeraldDecree = {
      file: 'bad.ts', gemAuthority: 0, throneWisdom: 0, crownPrecision: 0,
      scepterResilience: 0, dynastyEndurance: 0, qualityScore: 0,
      condition: 'void',
      ruling: {} as EmeraldDecree['ruling'],
      governing: {} as EmeraldDecree['governing'],
      decreeing: {} as EmeraldDecree['decreeing'],
      defending: {} as EmeraldDecree['defending'],
      persisting: {} as EmeraldDecree['persisting'],
    }
    const recs = generateRecommendations([decree], [], { avgAuthority: 0, avgPrecision: 0, avgEndurance: 0, isEmerald: false, overallSovereignty: 0 }, makeStats({ overallSovereignty: 0 }))
    expect(recs.some((r) => r.includes('bad.ts'))).toBe(true)
  })

  it('warns about many void decrees', () => {
    const decrees: EmeraldDecree[] = Array.from({ length: 6 }, (_, i) => ({
      file: `bad${i}.ts`, gemAuthority: 0, throneWisdom: 0, crownPrecision: 0,
      scepterResilience: 0, dynastyEndurance: 0, qualityScore: 0,
      condition: 'void' as const,
      ruling: {} as EmeraldDecree['ruling'],
      governing: {} as EmeraldDecree['governing'],
      decreeing: {} as EmeraldDecree['decreeing'],
      defending: {} as EmeraldDecree['defending'],
      persisting: {} as EmeraldDecree['persisting'],
    }))
    const recs = generateRecommendations(decrees, [], { avgAuthority: 0, avgPrecision: 0, avgEndurance: 0, isEmerald: false, overallSovereignty: 0 }, makeStats({ overallSovereignty: 0 }))
    expect(recs.some((r) => r.includes('6 tin-foil decrees'))).toBe(true)
  })

  it('warns when all kingdoms are poor', () => {
    const kingdom: EmeraldKingdom = {
      directory: 'src', decrees: [], avgAuthority: 0, avgPrecision: 0, avgEndurance: 0,
      emeraldMasterpieceCount: 0, voidCount: 0, kingdomType: 'barren-wasteland', condition: 'void',
    }
    const recs = generateRecommendations([], [kingdom], { avgAuthority: 0, avgPrecision: 0, avgEndurance: 0, isEmerald: false, overallSovereignty: 0 }, makeStats({ overallSovereignty: 0 }))
    expect(recs.some((r) => r.includes('tents and wastelands'))).toBe(true)
  })

  it('gives positive feedback when no issues', () => {
    const stats = makeStats({
      avgGemAuthority: 70,
      avgThroneWisdom: 70,
      avgCrownPrecision: 70,
      avgScepterResilience: 70,
      avgDynastyEndurance: 70,
      overallSovereignty: 70,
    })
    const recs = generateRecommendations(
      [],
      [],
      { avgAuthority: 70, avgPrecision: 70, avgEndurance: 70, isEmerald: true, overallSovereignty: 70 },
      stats,
    )
    expect(recs.some((r) => r.includes('sovereign brilliance'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('handles all score ranges', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(25)).toBe('string')
    expect(typeof colorScore(45)).toBe('string')
    expect(typeof colorScore(65)).toBe('string')
    expect(typeof colorScore(80)).toBe('string')
    expect(typeof colorScore(95)).toBe('string')
  })
})

describe('colorKingdomCondition', () => {
  it('returns a string for all conditions', () => {
    expect(typeof colorKingdomCondition('emerald-palace')).toBe('string')
    expect(typeof colorKingdomCondition('royal-court')).toBe('string')
    expect(typeof colorKingdomCondition('proper-castle')).toBe('string')
    expect(typeof colorKingdomCondition('wooden-fort')).toBe('string')
    expect(typeof colorKingdomCondition('tent')).toBe('string')
    expect(typeof colorKingdomCondition('void')).toBe('string')
    expect(typeof colorKingdomCondition('unknown')).toBe('string')
  })
})

describe('formatDecreeTable', () => {
  it('formats a decree', () => {
    const decree = analyzeEmeraldDecree(richContent, 'test.ts')
    const result = formatDecreeTable(decree)
    expect(result).toContain('Emerald Decree')
    expect(result).toContain('test.ts')
  })
})

describe('formatDecreesTable', () => {
  it('handles empty decrees', () => {
    expect(formatDecreesTable([])).toContain('No emerald decrees')
  })

  it('formats multiple decrees', () => {
    const d1 = analyzeEmeraldDecree(richContent, 'a.ts')
    const d2 = analyzeEmeraldDecree(richContent, 'b.ts')
    const result = formatDecreesTable([d1, d2])
    expect(result).toContain('Emerald Decrees')
  })
})

describe('formatKingdomTable', () => {
  it('formats a kingdom', () => {
    const decree = analyzeEmeraldDecree(richContent, 'test.ts')
    const kingdom = analyzeEmeraldKingdom([decree], 'src')
    const result = formatKingdomTable(kingdom)
    expect(result).toContain('Emerald Kingdom')
    expect(result).toContain('src')
  })
})

describe('formatKingdomsTable', () => {
  it('handles empty kingdoms', () => {
    expect(formatKingdomsTable([])).toContain('No emerald kingdoms')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildEmeraldThroneResult(['a.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Emerald Throne Statistics')
    expect(formatted).toContain('Total Files')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const result = formatRecommendations(['Fix X', 'Improve Y'])
    expect(result).toContain('Fix X')
    expect(result).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildEmeraldThroneResult(['a.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Emerald Throne Analysis')
    expect(formatted).toContain('Empire Overview')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildEmeraldThroneResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.decrees).toHaveLength(1)
  })
})

// ─── Integration: scores rich content at max ────────────

describe('rich content integration', () => {
  it('ruling scores rich content highly', () => {
    const result = measureRuling(richContent)
    expect(result.authority).toBeGreaterThan(60)
    expect(result.hasWellStructured).toBe(true)
    expect(result.hasConfident).toBe(true)
    expect(result.hasClear).toBe(true)
    expect(result.hasDecisive).toBe(true)
    expect(result.hasDocumented).toBe(true)
    expect(result.hasTyped).toBe(true)
    expect(result.hasOrganized).toBe(true)
    expect(result.hasCommanding).toBe(true)
    expect(result.hasStrong).toBe(true)
    expect(result.hasAuthoritative).toBe(true)
    expect(result.hasBold).toBe(true)
    expect(result.hasDirect).toBe(true)
    expect(result.hasPrincipled).toBe(true)
    expect(result.hasFirm).toBe(true)
  })

  it('governing scores rich content highly', () => {
    const result = measureGoverning(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasWellArchitected).toBe(true)
    expect(result.hasPrincipled).toBe(true)
    expect(result.hasDeep).toBe(true)
    expect(result.hasProven).toBe(true)
    expect(result.hasMature).toBe(true)
    expect(result.hasInsightful).toBe(true)
    expect(result.hasVisionary).toBe(true)
    expect(result.hasComprehensive).toBe(true)
    expect(result.hasConnected).toBe(true)
    expect(result.hasExperienced).toBe(true)
  })

  it('decreeing scores rich content highly', () => {
    const result = measureDecreeing(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasTypeSafe).toBe(true)
    expect(result.hasAccurate).toBe(true)
    expect(result.hasExact).toBe(true)
    expect(result.hasPrecise).toBe(true)
    expect(result.hasSharp).toBe(true)
    expect(result.hasCrisp).toBe(true)
    expect(result.hasDefined).toBe(true)
    expect(result.hasUnambiguous).toBe(true)
    expect(result.hasClear).toBe(true)
    expect(result.hasDecisive).toBe(true)
  })

  it('defending scores rich content highly', () => {
    const result = measureDefending(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasErrorHandled).toBe(true)
    expect(result.hasDefensive).toBe(true)
    expect(result.hasRobust).toBe(true)
    expect(result.hasStable).toBe(true)
    expect(result.hasHardened).toBe(true)
    expect(result.hasUnshakable).toBe(true)
    expect(result.hasIndomitable).toBe(true)
    expect(result.hasUnyielding).toBe(true)
  })

  it('persisting scores rich content well but hasEvolved is false', () => {
    const result = measurePersisting(richContent)
    expect(result.endurance).toBeGreaterThan(60)
    expect(result.hasEvolved).toBe(false)
  })

  it('qualityScore for rich content is high', async () => {
    const result = await buildEmeraldThroneResult(['test.ts'], [richContent])
    expect(result.decrees[0].qualityScore).toBeGreaterThan(60)
    expect(result.stats.overallSovereignty).toBeGreaterThan(60)
  })
})
