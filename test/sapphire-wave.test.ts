import { describe, it, expect } from 'vitest'

import {
  measureSurging,
  measureCrashing,
  measureClarifying,
  measureThundering,
  measureNourishing,
  analyzeSapphireWave,
  analyzeSapphireOcean,
  buildSapphireWaveResult,
  classifyWaveCondition,
  classifyOceanType,
  classifyOceanCondition,
  classifyCaptainGrade,
  generateRecommendations,
  type SapphireWave,
} from '../src/commands/sapphire-wave-helpers.js'

import {
  colorScore,
  colorCondition,
  colorOceanCondition,
  formatWaveTable,
  formatWavesTable,
  formatOceanTable,
  formatOceansTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/sapphire-wave-format-helpers.js'

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

// ─── measureSurging ─────────────────────────────────────

describe('measureSurging', () => {
  it('returns all fields', () => {
    const result = measureSurging(richContent)
    expect(result).toHaveProperty('fury')
    expect(result).toHaveProperty('intensity')
    expect(result).toHaveProperty('hasHighFury')
    expect(result).toHaveProperty('hasWellStructured')
    expect(result).toHaveProperty('hasNoChaotic')
    expect(result).toHaveProperty('hasModular')
    expect(result).toHaveProperty('hasNoMonolithic')
    expect(result).toHaveProperty('hasIntentional')
    expect(result).toHaveProperty('hasFocused')
    expect(result).toHaveProperty('hasDriven')
    expect(result).toHaveProperty('hasPurposeful')
    expect(result).toHaveProperty('hasDetermined')
    expect(result).toHaveProperty('hasCommitted')
    expect(result).toHaveProperty('hasPassionate')
    expect(result).toHaveProperty('hasEnergetic')
    expect(result).toHaveProperty('hasForceful')
    expect(result).toHaveProperty('hasPowerful')
    expect(result).toHaveProperty('hasIntense')
    expect(result).toHaveProperty('chaoticCount')
    expect(result).toHaveProperty('monolithicCount')
  })

  it('detects well-structured code', () => {
    expect(measureSurging(richContent).hasWellStructured).toBe(true)
  })

  it('detects chaotic patterns (var, eval)', () => {
    const result = measureSurging('var x = eval("1")')
    expect(result.chaoticCount).toBeGreaterThan(0)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects modular code (import, export)', () => {
    expect(measureSurging(richContent).hasModular).toBe(true)
  })

  it('detects monolithic patterns', () => {
    const result = measureSurging('monolithic god.object mega')
    expect(result.monolithicCount).toBeGreaterThan(0)
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('detects intentional code (no any)', () => {
    expect(measureSurging(richContent).hasIntentional).toBe(true)
  })

  it('detects focused code (readonly, private)', () => {
    expect(measureSurging(richContent).hasFocused).toBe(true)
  })

  it('classifies intensity correctly', () => {
    expect(measureSurging(richContent).intensity).toBeDefined()
  })
})

// ─── measureCrashing ────────────────────────────────────

describe('measureCrashing', () => {
  it('returns all fields', () => {
    const result = measureCrashing(richContent)
    expect(result).toHaveProperty('precision')
    expect(result).toHaveProperty('strike')
    expect(result).toHaveProperty('hasHighPrecision')
    expect(result).toHaveProperty('hasTypeSafe')
    expect(result).toHaveProperty('hasNoUnsafe')
    expect(result).toHaveProperty('hasAccurate')
    expect(result).toHaveProperty('hasNoApproximate')
    expect(result).toHaveProperty('hasExact')
    expect(result).toHaveProperty('hasClean')
    expect(result).toHaveProperty('hasPrecise')
    expect(result).toHaveProperty('hasCorrect')
    expect(result).toHaveProperty('hasFaithful')
    expect(result).toHaveProperty('hasSharp')
    expect(result).toHaveProperty('hasDefined')
    expect(result).toHaveProperty('hasCrisp')
    expect(result).toHaveProperty('hasTargeted')
    expect(result).toHaveProperty('hasFocused')
    expect(result).toHaveProperty('hasSurgical')
    expect(result).toHaveProperty('unsafeCount')
    expect(result).toHaveProperty('approximateCount')
  })

  it('detects type-safe code (no any)', () => {
    expect(measureCrashing(richContent).hasTypeSafe).toBe(true)
  })

  it('detects unsafe (any)', () => {
    const result = measureCrashing('const x: any = 1')
    expect(result.unsafeCount).toBe(1)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects approximate patterns', () => {
    const result = measureCrashing('roughly approximately guesstimate')
    expect(result.approximateCount).toBeGreaterThan(0)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects precise code (readonly)', () => {
    expect(measureCrashing(richContent).hasPrecise).toBe(true)
  })

  it('detects dirty patterns', () => {
    expect(measureCrashing('dirty hacky gross').hasSurgical).toBe(false)
  })

  it('classifies strike correctly', () => {
    expect(measureCrashing(richContent).strike).toBeDefined()
  })
})

// ─── measureClarifying ──────────────────────────────────

describe('measureClarifying', () => {
  it('returns all fields', () => {
    const result = measureClarifying(richContent)
    expect(result).toHaveProperty('clarity')
    expect(result).toHaveProperty('vision')
    expect(result).toHaveProperty('hasHighClarity')
    expect(result).toHaveProperty('hasReadable')
    expect(result).toHaveProperty('hasNoCryptic')
    expect(result).toHaveProperty('hasSelfDocumenting')
    expect(result).toHaveProperty('hasNoMystery')
    expect(result).toHaveProperty('hasClear')
    expect(result).toHaveProperty('hasNoObfuscated')
    expect(result).toHaveProperty('hasTransparent')
    expect(result).toHaveProperty('hasUnderstandable')
    expect(result).toHaveProperty('hasVisible')
    expect(result).toHaveProperty('hasDirect')
    expect(result).toHaveProperty('hasIlluminated')
    expect(result).toHaveProperty('hasRevealed')
    expect(result).toHaveProperty('hasFocused')
    expect(result).toHaveProperty('hasLucid')
    expect(result).toHaveProperty('hasPenetrating')
    expect(result).toHaveProperty('crypticCount')
    expect(result).toHaveProperty('obfuscatedCount')
  })

  it('detects readable code', () => {
    expect(measureClarifying(richContent).hasReadable).toBe(true)
  })

  it('detects cryptic names', () => {
    const result = measureClarifying('const a = 1')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects mystery patterns', () => {
    expect(measureClarifying('const magic = 42').hasNoMystery).toBe(false)
  })

  it('detects self-documenting code', () => {
    expect(measureClarifying(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects obfuscated patterns', () => {
    expect(measureClarifying('eval("code")').hasNoObfuscated).toBe(false)
  })

  it('classifies vision correctly', () => {
    expect(measureClarifying(richContent).vision).toBeDefined()
  })
})

// ─── measureThundering ──────────────────────────────────

describe('measureThundering', () => {
  it('returns all fields', () => {
    const result = measureThundering(richContent)
    expect(result).toHaveProperty('resilience')
    expect(result).toHaveProperty('armor')
    expect(result).toHaveProperty('hasHighResilience')
    expect(result).toHaveProperty('hasErrorHandled')
    expect(result).toHaveProperty('hasNoUnhandled')
    expect(result).toHaveProperty('hasDefensive')
    expect(result).toHaveProperty('hasRobust')
    expect(result).toHaveProperty('hasTested')
    expect(result).toHaveProperty('hasNoUntested')
    expect(result).toHaveProperty('hasStable')
    expect(result).toHaveProperty('hasHardened')
    expect(result).toHaveProperty('hasEnduring')
    expect(result).toHaveProperty('hasSolid')
    expect(result).toHaveProperty('hasReinforced')
    expect(result).toHaveProperty('hasImpervious')
    expect(result).toHaveProperty('hasDurable')
    expect(result).toHaveProperty('hasUnshakable')
    expect(result).toHaveProperty('hasUnyielding')
    expect(result).toHaveProperty('unhandledCount')
    expect(result).toHaveProperty('untestedCount')
  })

  it('detects error handling', () => {
    expect(measureThundering(richContent).hasErrorHandled).toBe(true)
  })

  it('detects unhandled (any)', () => {
    const result = measureThundering('const x: any = 1')
    expect(result.unhandledCount).toBeGreaterThan(0)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects stable code', () => {
    expect(measureThundering(richContent).hasStable).toBe(true)
  })

  it('detects vulnerable patterns', () => {
    expect(measureThundering('vulnerable exploit inject').hasImpervious).toBe(false)
  })

  it('detects untested patterns (eval)', () => {
    const result = measureThundering('eval("code")')
    expect(result.untestedCount).toBeGreaterThan(0)
    expect(result.hasNoUntested).toBe(false)
  })

  it('classifies armor correctly', () => {
    expect(measureThundering(richContent).armor).toBeDefined()
  })
})

// ─── measureNourishing ──────────────────────────────────

describe('measureNourishing', () => {
  it('returns all fields', () => {
    const result = measureNourishing(richContent)
    expect(result).toHaveProperty('wisdom')
    expect(result).toHaveProperty('rainfall')
    expect(result).toHaveProperty('hasHighWisdom')
    expect(result).toHaveProperty('hasWellArchitected')
    expect(result).toHaveProperty('hasNoHacked')
    expect(result).toHaveProperty('hasPrincipled')
    expect(result).toHaveProperty('hasDeep')
    expect(result).toHaveProperty('hasProven')
    expect(result).toHaveProperty('hasMature')
    expect(result).toHaveProperty('hasStrategic')
    expect(result).toHaveProperty('hasInsightful')
    expect(result).toHaveProperty('hasNourishing')
    expect(result).toHaveProperty('hasEnriching')
    expect(result).toHaveProperty('hasCultivating')
    expect(result).toHaveProperty('hasSustaining')
    expect(result).toHaveProperty('hasFertile')
    expect(result).toHaveProperty('hasGenerative')
    expect(result).toHaveProperty('hasAbundant')
    expect(result).toHaveProperty('hackedCount')
    expect(result).toHaveProperty('shallowCount')
  })

  it('detects hacked patterns', () => {
    const result = measureNourishing('hack: workaround')
    expect(result.hackedCount).toBeGreaterThan(0)
  })

  it('detects shallow patterns', () => {
    const result = measureNourishing('shallow superficial skin.deep')
    expect(result.shallowCount).toBeGreaterThan(0)
  })

  it('detects insightful code (documentation)', () => {
    expect(measureNourishing(richContent).hasInsightful).toBe(true)
  })

  it('detects fertile code (no any)', () => {
    expect(measureNourishing(richContent).hasFertile).toBe(true)
  })

  it('classifies rainfall correctly', () => {
    expect(measureNourishing(richContent).rainfall).toBeDefined()
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyWaveCondition', () => {
  it('returns sapphire-masterpiece for 90+', () => {
    expect(classifyWaveCondition(90)).toBe('sapphire-masterpiece')
  })
  it('returns royal-blue for 75-89', () => {
    expect(classifyWaveCondition(75)).toBe('royal-blue')
  })
  it('returns proper-gem for 60-74', () => {
    expect(classifyWaveCondition(60)).toBe('proper-gem')
  })
  it('returns cloudy-stone for 40-59', () => {
    expect(classifyWaveCondition(40)).toBe('cloudy-stone')
  })
  it('returns plain-rock for 20-39', () => {
    expect(classifyWaveCondition(20)).toBe('plain-rock')
  })
  it('returns void for 0-19', () => {
    expect(classifyWaveCondition(0)).toBe('void')
  })
})

describe('classifyOceanType', () => {
  it('returns no-ocean for empty', () => {
    expect(classifyOceanType([])).toBe('no-ocean')
  })
  it('returns deep-ocean for high avg', () => {
    const waves = [{ qualityScore: 90 }].map((w) => ({ ...w } as SapphireWave))
    expect(classifyOceanType(waves)).toBe('deep-ocean')
  })
})

describe('classifyOceanCondition', () => {
  it('returns sapphire-palace for 85+', () => {
    expect(classifyOceanCondition(85)).toBe('sapphire-palace')
  })
  it('returns void for 0-14', () => {
    expect(classifyOceanCondition(0)).toBe('void')
  })
  it('returns coral-castle for 70-84', () => {
    expect(classifyOceanCondition(70)).toBe('coral-castle')
  })
  it('returns proper-harbor for 55-69', () => {
    expect(classifyOceanCondition(55)).toBe('proper-harbor')
  })
  it('returns rocky-shore for 35-54', () => {
    expect(classifyOceanCondition(35)).toBe('rocky-shore')
  })
  it('returns dry-dock for 15-34', () => {
    expect(classifyOceanCondition(15)).toBe('dry-dock')
  })
})

describe('classifyCaptainGrade', () => {
  it('returns sea-king for 80+', () => {
    expect(classifyCaptainGrade(80)).toBe('sea-king')
  })
  it('returns landlubber for 0-19', () => {
    expect(classifyCaptainGrade(0)).toBe('landlubber')
  })
  it('returns ocean-captain for 65-79', () => {
    expect(classifyCaptainGrade(65)).toBe('ocean-captain')
  })
  it('returns navigator for 50-64', () => {
    expect(classifyCaptainGrade(50)).toBe('navigator')
  })
  it('returns apprentice for 35-49', () => {
    expect(classifyCaptainGrade(35)).toBe('apprentice')
  })
  it('returns novice for 20-34', () => {
    expect(classifyCaptainGrade(20)).toBe('novice')
  })
})

// ─── analyzeSapphireWave ────────────────────────────────

describe('analyzeSapphireWave', () => {
  it('returns a complete wave', () => {
    const wave = analyzeSapphireWave(richContent, 'app.ts')
    expect(wave.file).toBe('app.ts')
    expect(wave.gemFury).toBeGreaterThanOrEqual(0)
    expect(wave.strikePrecision).toBeGreaterThanOrEqual(0)
    expect(wave.lightningClarity).toBeGreaterThanOrEqual(0)
    expect(wave.thunderResilience).toBeGreaterThanOrEqual(0)
    expect(wave.rainWisdom).toBeGreaterThanOrEqual(0)
    expect(wave.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('computes qualityScore as 0.2 weighted average', () => {
    const wave = analyzeSapphireWave(richContent, 'test.ts')
    const expected = Math.round(
      wave.gemFury * 0.2 +
      wave.strikePrecision * 0.2 +
      wave.lightningClarity * 0.2 +
      wave.thunderResilience * 0.2 +
      wave.rainWisdom * 0.2,
    )
    expect(wave.qualityScore).toBe(expected)
  })

  it('handles empty content', () => {
    expect(analyzeSapphireWave(emptyContent, 'e.ts').qualityScore).toBeLessThan(40)
  })
})

// ─── analyzeSapphireOcean ───────────────────────────────

describe('analyzeSapphireOcean', () => {
  it('returns empty ocean for no waves', () => {
    const ocean = analyzeSapphireOcean([], 'src')
    expect(ocean.oceanType).toBe('no-ocean')
    expect(ocean.condition).toBe('void')
  })

  it('computes averages from waves', () => {
    const wave = analyzeSapphireWave(richContent, 'app.ts')
    const ocean = analyzeSapphireOcean([wave], 'src')
    expect(ocean.avgFury).toBe(wave.gemFury)
  })
})

// ─── buildSapphireWaveResult ────────────────────────────

describe('buildSapphireWaveResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildSapphireWaveResult([], [])
    expect(result.waves).toHaveLength(0)
    expect(result.sea.isSapphire).toBe(false)
    expect(result.stats.captainGrade).toBe('landlubber')
  })

  it('returns complete result for rich content', async () => {
    const result = await buildSapphireWaveResult(['app.ts'], [richContent])
    expect(result.waves).toHaveLength(1)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('groups files into oceans by directory', async () => {
    const result = await buildSapphireWaveResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, richContent],
    )
    expect(result.oceans).toHaveLength(2)
  })

  it('computes all stats fields', async () => {
    const result = await buildSapphireWaveResult(['a.ts'], [richContent])
    expect(result.stats.avgGemFury).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgStrikePrecision).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgLightningClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgThunderResilience).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgRainWisdom).toBeGreaterThanOrEqual(0)
    expect(typeof result.stats.bestWave).toBe('string')
    expect(typeof result.stats.mostIntense).toBe('string')
    expect(typeof result.stats.mostPrecise).toBe('string')
    expect(typeof result.stats.clearest).toBe('string')
    expect(typeof result.stats.mostResilient).toBe('string')
    expect(typeof result.stats.wisest).toBe('string')
  })

  it('scores rich content at max (100)', async () => {
    const result = await buildSapphireWaveResult(['a.ts'], [richContent])
    const wave = result.waves[0]
    expect(wave.gemFury).toBe(100)
    expect(wave.strikePrecision).toBe(100)
    expect(wave.lightningClarity).toBe(100)
    expect(wave.thunderResilience).toBe(100)
    expect(wave.rainWisdom).toBe(100)
    expect(wave.qualityScore).toBe(100)
  })

  it('sets sea.isSapphire when depth >= 60', async () => {
    const result = await buildSapphireWaveResult(['a.ts'], [richContent])
    expect(result.sea.isSapphire).toBe(true)
  })

  it('files in root map to . ocean', async () => {
    const result = await buildSapphireWaveResult(['app.ts'], [richContent])
    expect(result.oceans[0].directory).toBe('.')
  })

  it('sets bestWave to highest qualityScore', async () => {
    const result = await buildSapphireWaveResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.bestWave).toBe('rich.ts')
  })

  it('tracks all condition counts', async () => {
    const result = await buildSapphireWaveResult(['a.ts'], [richContent])
    expect(result.stats.sapphireMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.royalBlueCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.properGemCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.cloudyStoneCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.plainRockCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(0)
  })

  it('tracks high-measure counts', async () => {
    const result = await buildSapphireWaveResult(['a.ts'], [richContent])
    expect(result.stats.hasHighFuryCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('computes most intense, precise, clearest, resilient, wisest', async () => {
    const result = await buildSapphireWaveResult(
      ['low.ts', 'high.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.mostIntense).toBe('high.ts')
    expect(result.stats.mostPrecise).toBe('high.ts')
    expect(result.stats.clearest).toBe('high.ts')
    expect(result.stats.mostResilient).toBe('high.ts')
    expect(result.stats.wisest).toBe('high.ts')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece when all >= 90', async () => {
    const result = await buildSapphireWaveResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('recommends surge when fury low', async () => {
    const result = await buildSapphireWaveResult(['a.ts'], ['var x = 1'])
    const hasRec = result.recommendations.some((r) => r.includes('Surge'))
    expect(hasRec).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorCondition('sapphire-masterpiece')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorOceanCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorOceanCondition('sapphire-palace')).toBe('string')
    expect(typeof colorOceanCondition('void')).toBe('string')
  })
})

describe('formatWaveTable', () => {
  it('formats a wave', async () => {
    const result = await buildSapphireWaveResult(['a.ts'], [richContent])
    const output = formatWaveTable(result.waves[0])
    expect(output).toContain('Sapphire Wave')
    expect(output).toContain('Gem Fury')
  })
})

describe('formatWavesTable', () => {
  it('returns no waves for empty', () => {
    expect(formatWavesTable([])).toContain('No sapphire waves')
  })
})

describe('formatOceanTable', () => {
  it('formats an ocean', async () => {
    const result = await buildSapphireWaveResult(['a.ts'], [richContent])
    expect(formatOceanTable(result.oceans[0])).toContain('Sapphire Ocean')
  })
})

describe('formatOceansTable', () => {
  it('returns no oceans for empty', () => {
    expect(formatOceansTable([])).toContain('No sapphire oceans')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildSapphireWaveResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Captain Grade')
    expect(output).toContain('Best Wave')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildSapphireWaveResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Sapphire Wave Analysis')
    expect(output).toContain('Sea Overview')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildSapphireWaveResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.waves).toHaveLength(1)
  })
})
