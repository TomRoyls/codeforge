import { describe, expect, it } from 'vitest'
import {
  analyzeSapphireBolt,
  analyzeSapphireCloud,
  buildSapphireStormResult,
  classifyCondition,
  classifyCloudCondition,
  classifyCloudType,
  classifyStormGrade,
  generateRecommendations,
  measureCharging,
  measureStriking,
  measureIlluminating,
  measureEchoing,
  measureNourishing,
  type SapphireBolt,
  type SapphireStormStats,
  type SapphireStormResult,
  type SapphireCloud,
} from '../src/commands/sapphire-tempest-helpers.js'
import {
  colorCondition,
  colorCloudCondition,
  colorScore,
  formatBoltTable,
  formatBoltsTable,
  formatCloudTable,
  formatCloudsTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/sapphire-tempest-format-helpers.js'

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

// ─── measureCharging ────────────────────────────────────

describe('measureCharging', () => {
  it('returns zero for empty content', () => {
    const result = measureCharging(emptyContent)
    expect(result.fury).toBe(0)
    expect(result.storm).toBe('no-fury')
    expect(result.hasHighFury).toBe(false)
  })

  it('detects exported code', () => {
    expect(measureCharging(richContent).hasExported).toBe(true)
  })

  it('detects active code', () => {
    expect(measureCharging(richContent).hasActive).toBe(true)
  })

  it('detects contributing code', () => {
    expect(measureCharging(richContent).hasContributing).toBe(true)
  })

  it('detects evolving code', () => {
    expect(measureCharging(richContent).hasEvolving).toBe(true)
  })

  it('detects alive code', () => {
    expect(measureCharging(richContent).hasAlive).toBe(true)
  })

  it('detects powerful code', () => {
    expect(measureCharging(richContent).hasPowerful).toBe(true)
  })

  it('detects purposeful code', () => {
    expect(measureCharging(richContent).hasPurposeful).toBe(true)
  })

  it('hasNoIsolated is true for rich content', () => {
    expect(measureCharging(richContent).hasNoIsolated).toBe(true)
  })

  it('hasNoDead is true for rich content', () => {
    expect(measureCharging(richContent).hasNoDead).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureCharging(richContent)
    const empty = measureCharging(emptyContent)
    expect(rich.fury).toBeGreaterThan(empty.fury)
  })

  it('counts isolated patterns', () => {
    const result = measureCharging('const isolated = true')
    expect(result.isolatedCount).toBeGreaterThan(0)
  })

  it('hasNoIsolated is false with isolated', () => {
    expect(measureCharging('const isolated = true').hasNoIsolated).toBe(false)
  })
})

// ─── measureStriking ────────────────────────────────────

describe('measureStriking', () => {
  it('returns zero for empty content', () => {
    const result = measureStriking(emptyContent)
    expect(result.precision).toBe(0)
    expect(result.lightning).toBe('no-precision')
    expect(result.hasHighPrecision).toBe(false)
  })

  it('detects type-safe code', () => {
    expect(measureStriking(richContent).hasTypeSafe).toBe(true)
  })

  it('detects accurate code', () => {
    expect(measureStriking(richContent).hasAccurate).toBe(true)
  })

  it('detects exact code', () => {
    expect(measureStriking(richContent).hasExact).toBe(true)
  })

  it('detects correct code', () => {
    expect(measureStriking(richContent).hasCorrect).toBe(true)
  })

  it('detects validated code', () => {
    expect(measureStriking(richContent).hasValidated).toBe(true)
  })

  it('detects focused code', () => {
    expect(measureStriking(richContent).hasFocused).toBe(true)
  })

  it('detects consistent code', () => {
    expect(measureStriking(richContent).hasConsistent).toBe(true)
  })

  it('detects precise code', () => {
    expect(measureStriking(richContent).hasPrecise).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureStriking(richContent)
    const empty = measureStriking(emptyContent)
    expect(rich.precision).toBeGreaterThan(empty.precision)
  })

  it('counts unsafe any usage', () => {
    const result = measureStriking('const x: any = 1')
    expect(result.unsafeCount).toBeGreaterThan(0)
  })

  it('hasNoUnsafe is true without any', () => {
    expect(measureStriking(richContent).hasNoUnsafe).toBe(true)
  })
})

// ─── measureIlluminating ────────────────────────────────

describe('measureIlluminating', () => {
  it('returns zero for empty content', () => {
    const result = measureIlluminating(emptyContent)
    expect(result.clarity).toBe(0)
    expect(result.flash).toBe('no-clarity')
    expect(result.hasHighClarity).toBe(false)
  })

  it('detects readable code', () => {
    expect(measureIlluminating(richContent).hasReadable).toBe(true)
  })

  it('detects self-documenting code', () => {
    expect(measureIlluminating(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects clear types', () => {
    expect(measureIlluminating(richContent).hasClear).toBe(true)
  })

  it('detects transparent code', () => {
    expect(measureIlluminating(richContent).hasTransparent).toBe(true)
  })

  it('detects understandable code', () => {
    expect(measureIlluminating(richContent).hasUnderstandable).toBe(true)
  })

  it('detects visible exports', () => {
    expect(measureIlluminating(richContent).hasVisible).toBe(true)
  })

  it('detects documented code', () => {
    expect(measureIlluminating(richContent).hasDocumented).toBe(true)
  })

  it('detects revealing code', () => {
    expect(measureIlluminating(richContent).hasRevealing).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureIlluminating(richContent)
    const empty = measureIlluminating(emptyContent)
    expect(rich.clarity).toBeGreaterThan(empty.clarity)
  })

  it('hasNoHidden is true without ts-ignore', () => {
    expect(measureIlluminating(richContent).hasNoHidden).toBe(true)
  })

  it('hasNoHidden is false with ts-ignore', () => {
    expect(measureIlluminating('// @ts-ignore\n').hasNoHidden).toBe(false)
  })
})

// ─── measureEchoing ─────────────────────────────────────

describe('measureEchoing', () => {
  it('returns zero for empty content', () => {
    const result = measureEchoing(emptyContent)
    expect(result.resilience).toBe(0)
    expect(result.thunder).toBe('no-resilience')
    expect(result.hasHighResilience).toBe(false)
  })

  it('detects error handling', () => {
    expect(measureEchoing(richContent).hasErrorHandled).toBe(true)
  })

  it('detects tested code', () => {
    expect(measureEchoing(richContent).hasTested).toBe(true)
  })

  it('detects defensive code', () => {
    expect(measureEchoing(richContent).hasDefensive).toBe(true)
  })

  it('detects graceful handling', () => {
    expect(measureEchoing(richContent).hasGraceful).toBe(true)
  })

  it('detects recoverable code', () => {
    expect(measureEchoing(richContent).hasRecoverable).toBe(true)
  })

  it('detects robust code', () => {
    expect(measureEchoing(richContent).hasRobust).toBe(true)
  })

  it('detects persistent code', () => {
    expect(measureEchoing(richContent).hasPersistent).toBe(true)
  })

  it('detects antifragile code', () => {
    expect(measureEchoing(richContent).hasAntifragile).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureEchoing(richContent)
    const empty = measureEchoing(emptyContent)
    expect(rich.resilience).toBeGreaterThan(empty.resilience)
  })

  it('hasNoBareCrash is true without eval', () => {
    expect(measureEchoing(richContent).hasNoBareCrash).toBe(true)
  })

  it('hasNoBareCrash is false with eval', () => {
    expect(measureEchoing('eval("code")').hasNoBareCrash).toBe(false)
  })
})

// ─── measureNourishing ──────────────────────────────────

describe('measureNourishing', () => {
  it('returns low for empty content', () => {
    const result = measureNourishing(emptyContent)
    expect(result.wisdom).toBeGreaterThanOrEqual(0)
    expect(result.hasHighWisdom).toBe(false)
  })

  it('detects well-architected code', () => {
    expect(measureNourishing(richContent).hasWellArchitected).toBe(true)
  })

  it('detects principled code', () => {
    expect(measureNourishing(richContent).hasPrincipled).toBe(true)
  })

  it('detects proven code', () => {
    expect(measureNourishing(richContent).hasProven).toBe(true)
  })

  it('detects patterned code', () => {
    expect(measureNourishing(richContent).hasPatterned).toBe(true)
  })

  it('detects deep code', () => {
    expect(measureNourishing(richContent).hasDeep).toBe(true)
  })

  it('detects mature code', () => {
    expect(measureNourishing(richContent).hasMature).toBe(true)
  })

  it('detects distributed code', () => {
    expect(measureNourishing(richContent).hasDistributed).toBe(true)
  })

  it('detects connected code', () => {
    expect(measureNourishing(richContent).hasConnected).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureNourishing(richContent)
    const empty = measureNourishing(emptyContent)
    expect(rich.wisdom).toBeGreaterThan(empty.wisdom)
  })

  it('hasNoHacked is true without hack', () => {
    expect(measureNourishing(richContent).hasNoHacked).toBe(true)
  })

  it('hasNoAdHoc is true without any', () => {
    expect(measureNourishing(richContent).hasNoAdHoc).toBe(true)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies storm-masterpiece', () => expect(classifyCondition(95)).toBe('storm-masterpiece'))
  it('classifies blue-tempest', () => expect(classifyCondition(78)).toBe('blue-tempest'))
  it('classifies proper-storm', () => expect(classifyCondition(65)).toBe('proper-storm'))
  it('classifies gray-cloud', () => expect(classifyCondition(45)).toBe('gray-cloud'))
  it('classifies clear-sky', () => expect(classifyCondition(25)).toBe('clear-sky'))
  it('classifies void', () => expect(classifyCondition(10)).toBe('void'))
})

describe('classifyCloudType', () => {
  it('returns no-cloud for empty', () => expect(classifyCloudType([])).toBe('no-cloud'))
  it('classifies cumulonimbus', () => {
    expect(classifyCloudType([{ qualityScore: 95 } as SapphireBolt])).toBe('cumulonimbus')
  })
  it('classifies thunderhead', () => {
    expect(classifyCloudType([{ qualityScore: 78 } as SapphireBolt])).toBe('thunderhead')
  })
  it('classifies proper-cloud', () => {
    expect(classifyCloudType([{ qualityScore: 65 } as SapphireBolt])).toBe('proper-cloud')
  })
  it('classifies small-cumulus', () => {
    expect(classifyCloudType([{ qualityScore: 45 } as SapphireBolt])).toBe('small-cumulus')
  })
})

describe('classifyCloudCondition', () => {
  it('classifies tempest-front', () => expect(classifyCloudCondition(90)).toBe('tempest-front'))
  it('classifies storm-cloud', () => expect(classifyCloudCondition(72)).toBe('storm-cloud'))
  it('classifies proper-overcast', () => expect(classifyCloudCondition(58)).toBe('proper-overcast'))
  it('classifies light-clouds', () => expect(classifyCloudCondition(40)).toBe('light-clouds'))
  it('classifies clear-sky', () => expect(classifyCloudCondition(20)).toBe('clear-sky'))
  it('classifies void', () => expect(classifyCloudCondition(10)).toBe('void'))
})

describe('classifyStormGrade', () => {
  it('classifies storm-lord', () => expect(classifyStormGrade(85)).toBe('storm-lord'))
  it('classifies weather-master', () => expect(classifyStormGrade(70)).toBe('weather-master'))
  it('classifies storm-rider', () => expect(classifyStormGrade(55)).toBe('storm-rider'))
  it('classifies apprentice', () => expect(classifyStormGrade(40)).toBe('apprentice'))
  it('classifies novice', () => expect(classifyStormGrade(25)).toBe('novice'))
  it('classifies fair-weather', () => expect(classifyStormGrade(10)).toBe('fair-weather'))
})

// ─── analyzeSapphireBolt ────────────────────────────────

describe('analyzeSapphireBolt', () => {
  it('returns valid structure for empty content', () => {
    const bolt = analyzeSapphireBolt(emptyContent, 'empty.ts')
    expect(bolt.file).toBe('empty.ts')
    expect(bolt.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('returns valid structure for rich content', () => {
    const bolt = analyzeSapphireBolt(richContent, 'rich.ts')
    expect(bolt.file).toBe('rich.ts')
    expect(bolt.qualityScore).toBeGreaterThan(0)
    expect(bolt.gemFury).toBeGreaterThan(0)
    expect(bolt.strikePrecision).toBeGreaterThan(0)
    expect(bolt.lightningClarity).toBeGreaterThan(0)
    expect(bolt.thunderResilience).toBeGreaterThan(0)
    expect(bolt.rainWisdom).toBeGreaterThan(0)
  })

  it('qualityScore is average of 5 measures', () => {
    const bolt = analyzeSapphireBolt(richContent, 'test.ts')
    const expected = Math.round(
      bolt.gemFury * 0.2 +
      bolt.strikePrecision * 0.2 +
      bolt.lightningClarity * 0.2 +
      bolt.thunderResilience * 0.2 +
      bolt.rainWisdom * 0.2,
    )
    expect(bolt.qualityScore).toBe(expected)
  })

  it('contains all nested measures', () => {
    const bolt = analyzeSapphireBolt(richContent, 'test.ts')
    expect(bolt.charging).toBeDefined()
    expect(bolt.striking).toBeDefined()
    expect(bolt.illuminating).toBeDefined()
    expect(bolt.echoing).toBeDefined()
    expect(bolt.nourishing).toBeDefined()
  })

  it('scores rich content at max for charging', () => {
    expect(analyzeSapphireBolt(richContent, 'rich.ts').charging.fury).toBe(100)
  })

  it('scores rich content at max for striking', () => {
    expect(analyzeSapphireBolt(richContent, 'rich.ts').striking.precision).toBe(100)
  })

  it('scores rich content at max for illuminating', () => {
    expect(analyzeSapphireBolt(richContent, 'rich.ts').illuminating.clarity).toBe(100)
  })

  it('scores rich content at max for echoing', () => {
    expect(analyzeSapphireBolt(richContent, 'rich.ts').echoing.resilience).toBe(100)
  })

  it('scores rich content at max for nourishing', () => {
    expect(analyzeSapphireBolt(richContent, 'rich.ts').nourishing.wisdom).toBe(100)
  })

  it('rich content yields storm-masterpiece', () => {
    expect(analyzeSapphireBolt(richContent, 'rich.ts').condition).toBe('storm-masterpiece')
  })
})

// ─── analyzeSapphireCloud ───────────────────────────────

describe('analyzeSapphireCloud', () => {
  it('returns empty cloud for no bolts', () => {
    const cloud = analyzeSapphireCloud([], 'src')
    expect(cloud.directory).toBe('src')
    expect(cloud.bolts).toEqual([])
    expect(cloud.avgPrecision).toBe(0)
    expect(cloud.cloudType).toBe('no-cloud')
    expect(cloud.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const bolts = [
      analyzeSapphireBolt(richContent, 'src/a.ts'),
      analyzeSapphireBolt(richContent, 'src/b.ts'),
    ]
    const cloud = analyzeSapphireCloud(bolts, 'src')
    expect(cloud.avgPrecision).toBeGreaterThan(0)
    expect(cloud.avgClarity).toBeGreaterThan(0)
    expect(cloud.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildSapphireStormResult ───────────────────────────

describe('buildSapphireStormResult', () => {
  it('returns valid result for empty input', async () => {
    const result = await buildSapphireStormResult([], [])
    expect(result.bolts).toEqual([])
    expect(result.clouds).toEqual([])
    expect(result.weather.overallFury).toBe(0)
    expect(result.weather.isSapphire).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns valid result for rich content', async () => {
    const result = await buildSapphireStormResult(['a.ts'], [richContent])
    expect(result.bolts.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgGemFury).toBeGreaterThan(0)
  })

  it('groups files by directory into clouds', async () => {
    const result = await buildSapphireStormResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.bolts.length).toBe(3)
    expect(result.clouds.length).toBe(2)
  })

  it('weather.isSapphire is true when fury >= 60', async () => {
    const result = await buildSapphireStormResult(['a.ts'], [richContent])
    expect(result.weather.isSapphire).toBe(true)
  })

  it('computes stats correctly for multiple files', async () => {
    const result = await buildSapphireStormResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.bestBolt).toBeTruthy()
    expect(result.stats.mostFurious).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('counts condition categories', async () => {
    const result = await buildSapphireStormResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, minimalContent, emptyContent],
    )
    const total =
      result.stats.stormMasterpieceCount +
      result.stats.blueTempestCount +
      result.stats.properStormCount +
      result.stats.grayCloudCount +
      result.stats.clearSkyCount +
      result.stats.voidCount
    expect(total).toBe(3)
  })

  it('sets stormGrade correctly', async () => {
    const result = await buildSapphireStormResult(['a.ts'], [richContent])
    expect(result.stats.stormGrade).toBeDefined()
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message for all-90 scores', () => {
    const bolts = [analyzeSapphireBolt(richContent, 'a.ts')]
    const stats: SapphireStormStats = {
      totalFiles: 1, totalClouds: 0,
      avgGemFury: 95, avgStrikePrecision: 95, avgLightningClarity: 95,
      avgThunderResilience: 95, avgRainWisdom: 95,
      stormMasterpieceCount: 1, blueTempestCount: 0, properStormCount: 0,
      grayCloudCount: 0, clearSkyCount: 0, voidCount: 0,
      hasHighFuryCount: 1, hasHighPrecisionCount: 1, hasHighClarityCount: 1,
      hasHighResilienceCount: 1, hasHighWisdomCount: 1,
      overallFury: 95, stormGrade: 'storm-lord',
      bestBolt: 'a.ts', mostFurious: 'a.ts', mostPrecise: 'a.ts',
      clearest: 'a.ts', mostResilient: 'a.ts', wisest: 'a.ts',
    }
    const weather = { avgPrecision: 95, avgClarity: 95, avgWisdom: 95, isSapphire: true, overallFury: 95 }
    const recs = generateRecommendations(bolts, [], weather, stats)
    expect(recs.length).toBe(1)
    expect(recs[0]).toContain('masterwork')
  })

  it('recommends improving fury when low', () => {
    const emptyBolt = analyzeSapphireBolt(emptyContent, 'a.ts')
    const stats: SapphireStormStats = {
      totalFiles: 1, totalClouds: 0,
      avgGemFury: 10, avgStrikePrecision: 70, avgLightningClarity: 70,
      avgThunderResilience: 70, avgRainWisdom: 70,
      stormMasterpieceCount: 0, blueTempestCount: 0, properStormCount: 0,
      grayCloudCount: 0, clearSkyCount: 0, voidCount: 1,
      hasHighFuryCount: 0, hasHighPrecisionCount: 1, hasHighClarityCount: 1,
      hasHighResilienceCount: 1, hasHighWisdomCount: 1,
      overallFury: 58, stormGrade: 'storm-rider',
      bestBolt: 'a.ts', mostFurious: 'a.ts', mostPrecise: 'a.ts',
      clearest: 'a.ts', mostResilient: 'a.ts', wisest: 'a.ts',
    }
    const weather = { avgPrecision: 70, avgClarity: 70, avgWisdom: 70, isSapphire: false, overallFury: 58 }
    const recs = generateRecommendations([emptyBolt], [], weather, stats)
    expect(recs.some((r) => r.includes('gem fury'))).toBe(true)
  })

  it('warns about many void bolts', () => {
    const bolts = Array.from({ length: 6 }, () => analyzeSapphireBolt(emptyContent, 'void.ts'))
    const stats: SapphireStormStats = {
      totalFiles: 6, totalClouds: 0,
      avgGemFury: 0, avgStrikePrecision: 0, avgLightningClarity: 0,
      avgThunderResilience: 0, avgRainWisdom: 0,
      stormMasterpieceCount: 0, blueTempestCount: 0, properStormCount: 0,
      grayCloudCount: 0, clearSkyCount: 0, voidCount: 6,
      hasHighFuryCount: 0, hasHighPrecisionCount: 0, hasHighClarityCount: 0,
      hasHighResilienceCount: 0, hasHighWisdomCount: 0,
      overallFury: 0, stormGrade: 'fair-weather',
      bestBolt: 'void.ts', mostFurious: 'void.ts', mostPrecise: 'void.ts',
      clearest: 'void.ts', mostResilient: 'void.ts', wisest: 'void.ts',
    }
    const weather = { avgPrecision: 0, avgClarity: 0, avgWisdom: 0, isSapphire: false, overallFury: 0 }
    const recs = generateRecommendations(bolts, [], weather, stats)
    expect(recs.some((r) => r.includes('depleted bolts'))).toBe(true)
  })

  it('recommends improving precision when low', () => {
    const stats: SapphireStormStats = {
      totalFiles: 1, totalClouds: 0,
      avgGemFury: 70, avgStrikePrecision: 10, avgLightningClarity: 70,
      avgThunderResilience: 70, avgRainWisdom: 70,
      stormMasterpieceCount: 0, blueTempestCount: 0, properStormCount: 0,
      grayCloudCount: 0, clearSkyCount: 0, voidCount: 1,
      hasHighFuryCount: 1, hasHighPrecisionCount: 0, hasHighClarityCount: 1,
      hasHighResilienceCount: 1, hasHighWisdomCount: 1,
      overallFury: 58, stormGrade: 'storm-rider',
      bestBolt: 'a.ts', mostFurious: 'a.ts', mostPrecise: 'a.ts',
      clearest: 'a.ts', mostResilient: 'a.ts', wisest: 'a.ts',
    }
    const weather = { avgPrecision: 10, avgClarity: 70, avgWisdom: 70, isSapphire: false, overallFury: 58 }
    const recs = generateRecommendations([], [], weather, stats)
    expect(recs.some((r) => r.includes('strike precision'))).toBe(true)
  })

  it('recommends improving clarity when low', () => {
    const stats: SapphireStormStats = {
      totalFiles: 1, totalClouds: 0,
      avgGemFury: 70, avgStrikePrecision: 70, avgLightningClarity: 10,
      avgThunderResilience: 70, avgRainWisdom: 70,
      stormMasterpieceCount: 0, blueTempestCount: 0, properStormCount: 0,
      grayCloudCount: 0, clearSkyCount: 0, voidCount: 1,
      hasHighFuryCount: 1, hasHighPrecisionCount: 1, hasHighClarityCount: 0,
      hasHighResilienceCount: 1, hasHighWisdomCount: 1,
      overallFury: 58, stormGrade: 'storm-rider',
      bestBolt: 'a.ts', mostFurious: 'a.ts', mostPrecise: 'a.ts',
      clearest: 'a.ts', mostResilient: 'a.ts', wisest: 'a.ts',
    }
    const weather = { avgPrecision: 70, avgClarity: 10, avgWisdom: 70, isSapphire: false, overallFury: 58 }
    const recs = generateRecommendations([], [], weather, stats)
    expect(recs.some((r) => r.includes('lightning clarity'))).toBe(true)
  })

  it('recommends improving resilience when low', () => {
    const stats: SapphireStormStats = {
      totalFiles: 1, totalClouds: 0,
      avgGemFury: 70, avgStrikePrecision: 70, avgLightningClarity: 70,
      avgThunderResilience: 10, avgRainWisdom: 70,
      stormMasterpieceCount: 0, blueTempestCount: 0, properStormCount: 0,
      grayCloudCount: 0, clearSkyCount: 0, voidCount: 1,
      hasHighFuryCount: 1, hasHighPrecisionCount: 1, hasHighClarityCount: 1,
      hasHighResilienceCount: 0, hasHighWisdomCount: 1,
      overallFury: 58, stormGrade: 'storm-rider',
      bestBolt: 'a.ts', mostFurious: 'a.ts', mostPrecise: 'a.ts',
      clearest: 'a.ts', mostResilient: 'a.ts', wisest: 'a.ts',
    }
    const weather = { avgPrecision: 70, avgClarity: 70, avgWisdom: 70, isSapphire: false, overallFury: 58 }
    const recs = generateRecommendations([], [], weather, stats)
    expect(recs.some((r) => r.includes('thunder resilience'))).toBe(true)
  })

  it('recommends improving wisdom when low', () => {
    const stats: SapphireStormStats = {
      totalFiles: 1, totalClouds: 0,
      avgGemFury: 70, avgStrikePrecision: 70, avgLightningClarity: 70,
      avgThunderResilience: 70, avgRainWisdom: 10,
      stormMasterpieceCount: 0, blueTempestCount: 0, properStormCount: 0,
      grayCloudCount: 0, clearSkyCount: 0, voidCount: 1,
      hasHighFuryCount: 1, hasHighPrecisionCount: 1, hasHighClarityCount: 1,
      hasHighResilienceCount: 1, hasHighWisdomCount: 0,
      overallFury: 58, stormGrade: 'storm-rider',
      bestBolt: 'a.ts', mostFurious: 'a.ts', mostPrecise: 'a.ts',
      clearest: 'a.ts', mostResilient: 'a.ts', wisest: 'a.ts',
    }
    const weather = { avgPrecision: 70, avgClarity: 70, avgWisdom: 10, isSapphire: false, overallFury: 58 }
    const recs = generateRecommendations([], [], weather, stats)
    expect(recs.some((r) => r.includes('rain wisdom'))).toBe(true)
  })

  it('warns about all poor clouds', () => {
    const emptyBolt = analyzeSapphireBolt(emptyContent, 'a.ts')
    const cloud: SapphireCloud = {
      directory: 'src', bolts: [emptyBolt], avgPrecision: 0, avgClarity: 0,
      avgWisdom: 0, stormMasterpieceCount: 0, voidCount: 1,
      cloudType: 'no-cloud', condition: 'void',
    }
    const stats: SapphireStormStats = {
      totalFiles: 1, totalClouds: 1,
      avgGemFury: 0, avgStrikePrecision: 0, avgLightningClarity: 0,
      avgThunderResilience: 0, avgRainWisdom: 0,
      stormMasterpieceCount: 0, blueTempestCount: 0, properStormCount: 0,
      grayCloudCount: 0, clearSkyCount: 0, voidCount: 1,
      hasHighFuryCount: 0, hasHighPrecisionCount: 0, hasHighClarityCount: 0,
      hasHighResilienceCount: 0, hasHighWisdomCount: 0,
      overallFury: 0, stormGrade: 'fair-weather',
      bestBolt: 'a.ts', mostFurious: 'a.ts', mostPrecise: 'a.ts',
      clearest: 'a.ts', mostResilient: 'a.ts', wisest: 'a.ts',
    }
    const weather = { avgPrecision: 0, avgClarity: 0, avgWisdom: 0, isSapphire: false, overallFury: 0 }
    const recs = generateRecommendations([emptyBolt], [cloud], weather, stats)
    expect(recs.some((r) => r.includes('atmospheric rebuild'))).toBe(true)
  })

  it('lists specific void bolts when <= 5', () => {
    const bolts = Array.from({ length: 3 }, (_, i) => analyzeSapphireBolt(emptyContent, `void${i}.ts`))
    const stats: SapphireStormStats = {
      totalFiles: 3, totalClouds: 0,
      avgGemFury: 0, avgStrikePrecision: 0, avgLightningClarity: 0,
      avgThunderResilience: 0, avgRainWisdom: 0,
      stormMasterpieceCount: 0, blueTempestCount: 0, properStormCount: 0,
      grayCloudCount: 0, clearSkyCount: 0, voidCount: 3,
      hasHighFuryCount: 0, hasHighPrecisionCount: 0, hasHighClarityCount: 0,
      hasHighResilienceCount: 0, hasHighWisdomCount: 0,
      overallFury: 0, stormGrade: 'fair-weather',
      bestBolt: 'void0.ts', mostFurious: 'void0.ts', mostPrecise: 'void0.ts',
      clearest: 'void0.ts', mostResilient: 'void0.ts', wisest: 'void0.ts',
    }
    const weather = { avgPrecision: 0, avgClarity: 0, avgWisdom: 0, isSapphire: false, overallFury: 0 }
    const recs = generateRecommendations(bolts, [], weather, stats)
    expect(recs.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('returns default message for moderate scores', () => {
    const stats: SapphireStormStats = {
      totalFiles: 1, totalClouds: 0,
      avgGemFury: 70, avgStrikePrecision: 70, avgLightningClarity: 70,
      avgThunderResilience: 70, avgRainWisdom: 70,
      stormMasterpieceCount: 0, blueTempestCount: 0, properStormCount: 0,
      grayCloudCount: 0, clearSkyCount: 0, voidCount: 0,
      hasHighFuryCount: 1, hasHighPrecisionCount: 1, hasHighClarityCount: 1,
      hasHighResilienceCount: 1, hasHighWisdomCount: 1,
      overallFury: 70, stormGrade: 'weather-master',
      bestBolt: 'a.ts', mostFurious: 'a.ts', mostPrecise: 'a.ts',
      clearest: 'a.ts', mostResilient: 'a.ts', wisest: 'a.ts',
    }
    const weather = { avgPrecision: 70, avgClarity: 70, avgWisdom: 70, isSapphire: true, overallFury: 70 }
    const recs = generateRecommendations([], [], weather, stats)
    expect(recs.some((r) => r.includes('electric brilliance'))).toBe(true)
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
    expect(typeof colorCondition('storm-masterpiece')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
  })
})

describe('colorCloudCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorCloudCondition('tempest-front')).toBe('string')
    expect(typeof colorCloudCondition('void')).toBe('string')
  })
})

describe('formatBoltTable', () => {
  it('formats a single bolt', () => {
    const bolt = analyzeSapphireBolt(richContent, 'test.ts')
    const output = formatBoltTable(bolt)
    expect(output).toContain('Sapphire Bolt: test.ts')
    expect(output).toContain('Gem Fury')
  })
})

describe('formatBoltsTable', () => {
  it('returns message for empty', () => {
    expect(formatBoltsTable([])).toContain('No sapphire bolts found')
  })

  it('formats multiple bolts', () => {
    const bolts = [analyzeSapphireBolt(richContent, 'a.ts'), analyzeSapphireBolt(minimalContent, 'b.ts')]
    const output = formatBoltsTable(bolts)
    expect(output).toContain('Sapphire Bolts')
    expect(output).toContain('a.ts')
  })
})

describe('formatCloudTable', () => {
  it('formats a cloud', () => {
    const bolts = [analyzeSapphireBolt(richContent, 'src/a.ts')]
    const cloud = analyzeSapphireCloud(bolts, 'src')
    expect(formatCloudTable(cloud)).toContain('Sapphire Cloud: src')
  })
})

describe('formatCloudsTable', () => {
  it('returns message for empty', () => {
    expect(formatCloudsTable([])).toContain('No sapphire clouds found')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildSapphireStormResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Sapphire Storm Statistics')
    expect(output).toContain('Storm Grade')
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
    const result = await buildSapphireStormResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Sapphire Storm Analysis')
    expect(output).toContain('Weather Overview')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildSapphireStormResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.bolts).toBeDefined()
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
