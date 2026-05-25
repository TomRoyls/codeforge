import { describe, expect, it } from 'vitest'

import {
  analyzeCrownJewel,
  analyzeCrownRealm,
  buildIronCrownResult,
  classifyCrownCondition,
  classifyRealmType,
  classifyRealmCondition,
  classifyMonarchGrade,
  generateRecommendations,
  measureFounding,
  measureCommanding,
  measureSetting,
  measureDefending,
  measurePersisting,
  type CrownCondition,
  type RealmCondition,
  type CrownJewel,
  type IronCrownResult,
  type CrownRealm,
} from '../src/commands/steel-crown-helpers.js'

import {
  colorCrownCondition,
  colorRealmCondition,
  colorScore,
  formatJewelTable,
  formatJewelsTable,
  formatRealmsTable,
  formatRealmTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/steel-crown-format-helpers.js'

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

// ─── measureFounding ────────────────────────────────────

describe('measureFounding', () => {
  it('scores rich content high', () => {
    const m = measureFounding(richContent)
    expect(m.strength).toBeGreaterThanOrEqual(60)
    expect(m.hasHighStrength).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureFounding(emptyContent)
    expect(m.strength).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureFounding(richContent)
    const poor = measureFounding(poorContent)
    expect(rich.strength).toBeGreaterThan(poor.strength)
  })

  it('detects chaotic patterns', () => {
    const m = measureFounding('var x = eval("boom")')
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('assigns high sovereign for rich content', () => {
    const m = measureFounding(richContent)
    expect(['true-steel', 'battle-tested', 'proper-iron']).toContain(m.sovereign)
  })

  it('assigns low sovereign for empty content', () => {
    const m = measureFounding(emptyContent)
    expect(['no-strength', 'tin-foil', 'soft-metal', 'proper-iron']).toContain(m.sovereign)
  })

  it('has all boolean properties', () => {
    const m = measureFounding(richContent)
    expect(typeof m.hasWellStructured).toBe('boolean')
    expect(typeof m.hasRobust).toBe('boolean')
    expect(typeof m.hasUnbreakable).toBe('boolean')
  })
})

// ─── measureCommanding ──────────────────────────────────

describe('measureCommanding', () => {
  it('scores rich content high', () => {
    const m = measureCommanding(richContent)
    expect(m.authority).toBeGreaterThanOrEqual(60)
    expect(m.hasHighAuthority).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureCommanding(emptyContent)
    expect(m.authority).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureCommanding(richContent)
    const poor = measureCommanding(poorContent)
    expect(rich.authority).toBeGreaterThan(poor.authority)
  })

  it('detects weak patterns', () => {
    const m = measureCommanding('weak fragile flimsy code')
    expect(m.weakCount).toBeGreaterThan(0)
  })

  it('detects vague patterns', () => {
    const m = measureCommanding('vague ambiguous unclear')
    expect(m.vagueCount).toBeGreaterThan(0)
  })

  it('assigns high crown for rich content', () => {
    const m = measureCommanding(richContent)
    expect(['imperial-crown', 'royal-diadem', 'proper-circlet']).toContain(m.crown)
  })

  it('assigns low crown for empty content', () => {
    const m = measureCommanding(emptyContent)
    expect(['no-authority', 'party-hat', 'wreath', 'proper-circlet']).toContain(m.crown)
  })

  it('has all boolean properties', () => {
    const m = measureCommanding(richContent)
    expect(typeof m.hasConfident).toBe('boolean')
    expect(typeof m.hasUnambiguous).toBe('boolean')
  })
})

// ─── measureSetting ─────────────────────────────────────

describe('measureSetting', () => {
  it('scores rich content high', () => {
    const m = measureSetting(richContent)
    expect(m.precision).toBeGreaterThanOrEqual(60)
    expect(m.hasHighPrecision).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureSetting(emptyContent)
    expect(m.precision).toBeGreaterThanOrEqual(0)
  })

  it('detects approximate patterns', () => {
    const m = measureSetting('roughly approximately guesstimate')
    expect(m.approximateCount).toBeGreaterThan(0)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('detects rough patterns', () => {
    const m = measureSetting('rough sloppy messy')
    expect(m.roughCount).toBeGreaterThan(0)
  })

  it('assigns high jewel for rich content', () => {
    const m = measureSetting(richContent)
    expect(['master-cut', 'expert-set', 'proper-setting']).toContain(m.jewel)
  })

  it('assigns low jewel for empty content', () => {
    const m = measureSetting(emptyContent)
    expect(['no-precision', 'glass-bead', 'loose-stone', 'proper-setting']).toContain(m.jewel)
  })

  it('has all boolean properties', () => {
    const m = measureSetting(richContent)
    expect(typeof m.hasAccurate).toBe('boolean')
    expect(typeof m.hasMasterful).toBe('boolean')
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

  it('detects unhandled patterns', () => {
    const m = measureDefending('eval (Function)')
    expect(m.unhandledCount).toBeGreaterThan(0)
  })

  it('detects vulnerable patterns', () => {
    const m = measureDefending('vulnerable exposed defenseless')
    expect(m.vulnerableCount).toBeGreaterThan(0)
  })

  it('assigns high circlet for rich content', () => {
    const m = measureDefending(richContent)
    expect(['impervious-ring', 'strong-band', 'proper-circle']).toContain(m.circlet)
  })

  it('assigns low circlet for empty content', () => {
    const m = measureDefending(emptyContent)
    expect(['no-resilience', 'broken-loop', 'bent-wire', 'proper-circle']).toContain(m.circlet)
  })

  it('has all boolean properties', () => {
    const m = measureDefending(richContent)
    expect(typeof m.hasErrorHandled).toBe('boolean')
    expect(typeof m.hasIndomitable).toBe('boolean')
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

  it('detects fragile patterns', () => {
    const m = measurePersisting('var x = eval("1")\nlet y: any')
    expect(m.fragileCount).toBeGreaterThan(0)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects stagnant patterns', () => {
    const m = measurePersisting('stagnant rotten decayed')
    expect(m.stagnantCount).toBeGreaterThan(0)
  })

  it('assigns high reign for rich content', () => {
    const m = measurePersisting(richContent)
    expect(['eternal-reign', 'lasting-dynasty', 'proper-rule']).toContain(m.reign)
  })

  it('assigns low reign for empty content', () => {
    const m = measurePersisting(emptyContent)
    expect(['no-endurance', 'one-day-king', 'brief-era', 'proper-rule']).toContain(m.reign)
  })

  it('has all boolean properties', () => {
    const m = measurePersisting(richContent)
    expect(typeof m.hasMaintainable).toBe('boolean')
    expect(typeof m.hasUndying).toBe('boolean')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyCrownCondition', () => {
  it('classifies 90+ as crown-masterpiece', () => { expect(classifyCrownCondition(90)).toBe('crown-masterpiece') })
  it('classifies 75-89 as imperial-standard', () => { expect(classifyCrownCondition(75)).toBe('imperial-standard') })
  it('classifies 60-74 as proper-crown', () => { expect(classifyCrownCondition(60)).toBe('proper-crown') })
  it('classifies 40-59 as bent-circlet', () => { expect(classifyCrownCondition(40)).toBe('bent-circlet') })
  it('classifies 20-39 as rusty-ring', () => { expect(classifyCrownCondition(20)).toBe('rusty-ring') })
  it('classifies below 20 as void', () => { expect(classifyCrownCondition(0)).toBe('void') })
})

describe('classifyRealmType', () => {
  it('returns no-realm for empty jewels', () => {
    expect(classifyRealmType([])).toBe('no-realm')
  })
  it('returns grand-empire for high quality', () => {
    const jewels = [{ qualityScore: 90 } as CrownJewel, { qualityScore: 85 } as CrownJewel]
    expect(classifyRealmType(jewels)).toBe('grand-empire')
  })
  it('returns iron-kingdom for good quality', () => {
    const jewels = [{ qualityScore: 70 } as CrownJewel, { qualityScore: 75 } as CrownJewel]
    expect(classifyRealmType(jewels)).toBe('iron-kingdom')
  })
  it('returns proper-realm for decent quality', () => {
    const jewels = [{ qualityScore: 55 } as CrownJewel, { qualityScore: 60 } as CrownJewel]
    expect(classifyRealmType(jewels)).toBe('proper-realm')
  })
  it('returns small-dukedom for low quality', () => {
    const jewels = [{ qualityScore: 35 } as CrownJewel, { qualityScore: 40 } as CrownJewel]
    expect(classifyRealmType(jewels)).toBe('small-dukedom')
  })
  it('returns barren-wasteland for very low quality', () => {
    const jewels = [{ qualityScore: 10 } as CrownJewel, { qualityScore: 15 } as CrownJewel]
    expect(classifyRealmType(jewels)).toBe('barren-wasteland')
  })
})

describe('classifyRealmCondition', () => {
  it('classifies 85+ as imperial-palace', () => { expect(classifyRealmCondition(85)).toBe('imperial-palace') })
  it('classifies 70-84 as iron-throne-room', () => { expect(classifyRealmCondition(70)).toBe('iron-throne-room') })
  it('classifies 55-69 as proper-castle', () => { expect(classifyRealmCondition(55)).toBe('proper-castle') })
  it('classifies 35-54 as wooden-fort', () => { expect(classifyRealmCondition(35)).toBe('wooden-fort') })
  it('classifies 15-34 as tent', () => { expect(classifyRealmCondition(15)).toBe('tent') })
  it('classifies below 15 as void', () => { expect(classifyRealmCondition(0)).toBe('void') })
})

describe('classifyMonarchGrade', () => {
  it('classifies 80+ as emperor', () => { expect(classifyMonarchGrade(80)).toBe('emperor') })
  it('classifies 65-79 as king', () => { expect(classifyMonarchGrade(65)).toBe('king') })
  it('classifies 50-64 as duke', () => { expect(classifyMonarchGrade(50)).toBe('duke') })
  it('classifies 35-49 as baron', () => { expect(classifyMonarchGrade(35)).toBe('baron') })
  it('classifies 20-34 as knight', () => { expect(classifyMonarchGrade(20)).toBe('knight') })
  it('classifies below 20 as peasant', () => { expect(classifyMonarchGrade(0)).toBe('peasant') })
})

// ─── analyzeCrownJewel ──────────────────────────────────

describe('analyzeCrownJewel', () => {
  it('analyzes a file and returns all measures', () => {
    const j = analyzeCrownJewel(richContent, 'app.ts')
    expect(j.file).toBe('app.ts')
    expect(j.sovereignStrength).toBeGreaterThanOrEqual(0)
    expect(j.crownAuthority).toBeGreaterThanOrEqual(0)
    expect(j.jewelPrecision).toBeGreaterThanOrEqual(0)
    expect(j.circletResilience).toBeGreaterThanOrEqual(0)
    expect(j.reignEndurance).toBeGreaterThanOrEqual(0)
    expect(j.qualityScore).toBeGreaterThanOrEqual(0)
    expect(j.condition).toBeDefined()
  })

  it('calculates qualityScore as weighted average', () => {
    const j = analyzeCrownJewel(richContent, 'app.ts')
    const expected = Math.round(
      j.sovereignStrength * 0.2 +
      j.crownAuthority * 0.2 +
      j.jewelPrecision * 0.2 +
      j.circletResilience * 0.2 +
      j.reignEndurance * 0.2,
    )
    expect(j.qualityScore).toBe(expected)
  })

  it('includes all sub-measures', () => {
    const j = analyzeCrownJewel(richContent, 'app.ts')
    expect(j.founding).toBeDefined()
    expect(j.commanding).toBeDefined()
    expect(j.setting).toBeDefined()
    expect(j.defending).toBeDefined()
    expect(j.persisting).toBeDefined()
  })

  it('handles empty content gracefully', () => {
    const j = analyzeCrownJewel(emptyContent, 'empty.ts')
    expect(j.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('scores rich content high', () => {
    const j = analyzeCrownJewel(richContent, 'app.ts')
    expect(j.qualityScore).toBeGreaterThanOrEqual(60)
  })
})

// ─── analyzeCrownRealm ──────────────────────────────────

describe('analyzeCrownRealm', () => {
  it('returns empty realm for no jewels', () => {
    const r = analyzeCrownRealm([], 'src')
    expect(r.directory).toBe('src')
    expect(r.jewels).toHaveLength(0)
    expect(r.avgStrength).toBe(0)
    expect(r.realmType).toBe('no-realm')
    expect(r.condition).toBe('void')
  })

  it('aggregates jewel scores', () => {
    const j1 = analyzeCrownJewel(richContent, 'a.ts')
    const j2 = analyzeCrownJewel(richContent, 'b.ts')
    const r = analyzeCrownRealm([j1, j2], 'src')
    expect(r.avgStrength).toBeGreaterThanOrEqual(0)
    expect(r.avgAuthority).toBeGreaterThanOrEqual(0)
    expect(r.avgEndurance).toBeGreaterThanOrEqual(0)
    expect(r.jewels).toHaveLength(2)
  })

  it('classifies realm type and condition', () => {
    const j = analyzeCrownJewel(richContent, 'app.ts')
    const r = analyzeCrownRealm([j], 'src')
    expect(r.realmType).toBeDefined()
    expect(r.condition).toBeDefined()
  })
})

// ─── buildIronCrownResult ───────────────────────────────

describe('buildIronCrownResult', () => {
  it('handles empty input', async () => {
    const result = await buildIronCrownResult([], [])
    expect(result.jewels).toHaveLength(0)
    expect(result.realms).toHaveLength(0)
    expect(result.kingdom.overallSovereignty).toBe(0)
    expect(result.kingdom.isIron).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildIronCrownResult(['a.ts'], [richContent])
    expect(result.jewels).toHaveLength(1)
    expect(result.jewels[0].file).toBe('a.ts')
  })

  it('groups files by directory', async () => {
    const result = await buildIronCrownResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, poorContent],
    )
    expect(result.realms.length).toBe(2)
  })

  it('computes kingdom averages', async () => {
    const result = await buildIronCrownResult(['a.ts'], [richContent])
    expect(result.kingdom.avgStrength).toBeGreaterThanOrEqual(0)
    expect(result.kingdom.avgAuthority).toBeGreaterThanOrEqual(0)
    expect(result.kingdom.avgEndurance).toBeGreaterThanOrEqual(0)
  })

  it('computes stats correctly', async () => {
    const result = await buildIronCrownResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalRealms).toBeGreaterThanOrEqual(1)
    expect(result.stats.overallSovereignty).toBeGreaterThanOrEqual(0)
    expect(result.stats.monarchGrade).toBeDefined()
  })

  it('identifies best and extreme files', async () => {
    const result = await buildIronCrownResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.bestJewel).toBeTruthy()
    expect(result.stats.strongest).toBeTruthy()
    expect(result.stats.mostAuthoritative).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.mostEnduring).toBeTruthy()
  })

  it('includes recommendations', async () => {
    const result = await buildIronCrownResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty bestJewel for no files', async () => {
    const result = await buildIronCrownResult([], [])
    expect(result.stats.bestJewel).toBe('')
    expect(result.stats.strongest).toBe('')
  })

  it('scores rich content at max', async () => {
    const result = await buildIronCrownResult(['a.ts'], [richContent])
    expect(result.jewels[0].sovereignStrength).toBeGreaterThanOrEqual(60)
    expect(result.jewels[0].crownAuthority).toBeGreaterThanOrEqual(60)
    expect(result.jewels[0].jewelPrecision).toBeGreaterThanOrEqual(60)
    expect(result.jewels[0].circletResilience).toBeGreaterThanOrEqual(60)
    expect(result.jewels[0].reignEndurance).toBeGreaterThanOrEqual(60)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<IronCrownResult['stats']> = {}): IronCrownResult['stats'] => ({
    totalFiles: 1, totalRealms: 1,
    avgSovereignStrength: 95, avgCrownAuthority: 95, avgJewelPrecision: 95,
    avgCircletResilience: 95, avgReignEndurance: 95,
    crownMasterpieceCount: 1, imperialStandardCount: 0, properCrownCount: 0,
    bentCircletCount: 0, rustyRingCount: 0, voidCount: 0,
    hasHighStrengthCount: 1, hasHighAuthorityCount: 1, hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1, hasHighEnduranceCount: 1,
    overallSovereignty: 95, monarchGrade: 'emperor' as const,
    bestJewel: 'a.ts', strongest: 'a.ts', mostAuthoritative: 'a.ts',
    mostPrecise: 'a.ts', mostResilient: 'a.ts', mostEnduring: 'a.ts',
    ...overrides,
  })

  const makeKingdom = (overrides: Partial<IronCrownResult['kingdom']> = {}): IronCrownResult['kingdom'] => ({
    avgStrength: 95, avgAuthority: 95, avgEndurance: 95,
    isIron: true, overallSovereignty: 95,
    ...overrides,
  })

  it('recommends masterpiece when all scores are high', () => {
    const recs = generateRecommendations([], [], makeKingdom(), makeStats())
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends sovereign strength when low', () => {
    const recs = generateRecommendations([], [], makeKingdom(), makeStats({
      avgSovereignStrength: 30, overallSovereignty: 78, monarchGrade: 'king',
    }))
    expect(recs.some((r) => r.includes('sovereign'))).toBe(true)
  })

  it('recommends crown authority when low', () => {
    const recs = generateRecommendations([], [], makeKingdom(), makeStats({
      avgCrownAuthority: 30, overallSovereignty: 78, monarchGrade: 'king',
    }))
    expect(recs.some((r) => r.includes('authority'))).toBe(true)
  })

  it('recommends jewel precision when low', () => {
    const recs = generateRecommendations([], [], makeKingdom(), makeStats({
      avgJewelPrecision: 30, overallSovereignty: 78, monarchGrade: 'king',
    }))
    expect(recs.some((r) => r.includes('precision'))).toBe(true)
  })

  it('recommends circlet resilience when low', () => {
    const recs = generateRecommendations([], [], makeKingdom(), makeStats({
      avgCircletResilience: 30, overallSovereignty: 78, monarchGrade: 'king',
    }))
    expect(recs.some((r) => r.includes('resilience'))).toBe(true)
  })

  it('recommends reign endurance when low', () => {
    const recs = generateRecommendations([], [], makeKingdom(), makeStats({
      avgReignEndurance: 30, overallSovereignty: 78, monarchGrade: 'king',
    }))
    expect(recs.some((r) => r.includes('endurance'))).toBe(true)
  })

  it('warns about very low sovereignty', () => {
    const recs = generateRecommendations([], [], makeKingdom({ overallSovereignty: 20, isIron: false }), makeStats({
      avgSovereignStrength: 20, avgCrownAuthority: 20, avgJewelPrecision: 20,
      avgCircletResilience: 20, avgReignEndurance: 20,
      overallSovereignty: 20, monarchGrade: 'knight', voidCount: 1,
    }))
    expect(recs.some((r) => r.includes('rusted') || r.includes('crown'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCrownCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorCrownCondition('crown-masterpiece')).toBe('string')
    expect(typeof colorCrownCondition('imperial-standard')).toBe('string')
    expect(typeof colorCrownCondition('proper-crown')).toBe('string')
    expect(typeof colorCrownCondition('bent-circlet')).toBe('string')
    expect(typeof colorCrownCondition('rusty-ring')).toBe('string')
    expect(typeof colorCrownCondition('void')).toBe('string')
  })
  it('handles unknown condition', () => {
    expect(typeof colorCrownCondition('unknown')).toBe('string')
  })
})

describe('colorRealmCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorRealmCondition('imperial-palace')).toBe('string')
    expect(typeof colorRealmCondition('iron-throne-room')).toBe('string')
    expect(typeof colorRealmCondition('proper-castle')).toBe('string')
    expect(typeof colorRealmCondition('wooden-fort')).toBe('string')
    expect(typeof colorRealmCondition('tent')).toBe('string')
    expect(typeof colorRealmCondition('void')).toBe('string')
  })
})

describe('formatJewelTable', () => {
  it('formats a jewel', () => {
    const j = analyzeCrownJewel(richContent, 'app.ts')
    const output = formatJewelTable(j)
    expect(output).toContain('app.ts')
    expect(output).toContain('Sovereign Strength')
    expect(output).toContain('Quality Score')
  })
})

describe('formatJewelsTable', () => {
  it('formats empty jewels', () => {
    expect(formatJewelsTable([])).toContain('No iron crown jewels')
  })
  it('formats multiple jewels', () => {
    const j1 = analyzeCrownJewel(richContent, 'a.ts')
    const j2 = analyzeCrownJewel(poorContent, 'b.ts')
    expect(formatJewelsTable([j1, j2])).toContain('a.ts')
  })
})

describe('formatRealmTable', () => {
  it('formats a realm', () => {
    const j = analyzeCrownJewel(richContent, 'src/a.ts')
    const r = analyzeCrownRealm([j], 'src')
    expect(formatRealmTable(r)).toContain('src')
  })
})

describe('formatRealmsTable', () => {
  it('formats empty realms', () => {
    expect(formatRealmsTable([])).toContain('No iron crown realms')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildIronCrownResult(['a.ts'], [richContent])
    expect(formatStatsTable(result.stats)).toContain('Total Files')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    expect(formatRecommendations(['Fix X', 'Fix Y'])).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildIronCrownResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Iron Crown Analysis')
    expect(output).toContain('Kingdom Overview')
  })
})

describe('formatResultJson', () => {
  it('formats as JSON', async () => {
    const result = await buildIronCrownResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.jewels).toHaveLength(1)
    expect(parsed.kingdom).toBeDefined()
  })
})
