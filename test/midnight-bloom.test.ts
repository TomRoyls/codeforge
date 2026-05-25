import { describe, expect, it } from 'vitest'
import {
  analyzeMoonflower,
  analyzeMoonGarden,
  buildMidnightBloomResult,
  classifyCondition,
  classifyGardenCondition,
  classifyGardenType,
  classifyGardenerGrade,
  generateRecommendations,
  measureBlossoming,
  measureDeepening,
  measureRevealing,
  measureScenting,
  measureEnduring,
  type Moonflower,
  type MidnightBloomStats,
  type MidnightBloomResult,
  type MoonGarden,
} from '../src/commands/midnight-bloom-helpers.js'
import {
  colorCondition,
  colorGardenCondition,
  colorScore,
  formatFlowerTable,
  formatFlowersTable,
  formatGardenTable,
  formatGardensTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/midnight-bloom-format-helpers.js'

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

// ─── measureBlossoming ──────────────────────────────────

describe('measureBlossoming', () => {
  it('returns zero for empty content', () => {
    const result = measureBlossoming(emptyContent)
    expect(result.bloom).toBe(0)
    expect(result.petal).toBe('no-bloom')
    expect(result.hasHighBloom).toBe(false)
  })

  it('detects exported code', () => {
    expect(measureBlossoming(richContent).hasExported).toBe(true)
  })

  it('detects evolving code', () => {
    expect(measureBlossoming(richContent).hasEvolving).toBe(true)
  })

  it('detects thriving code', () => {
    expect(measureBlossoming(richContent).hasThriving).toBe(true)
  })

  it('detects alive code', () => {
    expect(measureBlossoming(richContent).hasAlive).toBe(true)
  })

  it('detects contributing code', () => {
    expect(measureBlossoming(richContent).hasContributing).toBe(true)
  })

  it('detects adaptive code', () => {
    expect(measureBlossoming(richContent).hasAdaptive).toBe(true)
  })

  it('detects vibrant code', () => {
    expect(measureBlossoming(richContent).hasVibrant).toBe(true)
  })

  it('detects unconventional code', () => {
    expect(measureBlossoming(richContent).hasUnconventional).toBe(true)
  })

  it('hasNoIsolated is true for rich content', () => {
    expect(measureBlossoming(richContent).hasNoIsolated).toBe(true)
  })

  it('hasNoDead is true for rich content', () => {
    expect(measureBlossoming(richContent).hasNoDead).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureBlossoming(richContent)
    const empty = measureBlossoming(emptyContent)
    expect(rich.bloom).toBeGreaterThan(empty.bloom)
  })

  it('counts isolated patterns', () => {
    const result = measureBlossoming('const isolated = true')
    expect(result.isolatedCount).toBeGreaterThan(0)
  })

  it('hasNoIsolated is false with isolated', () => {
    expect(measureBlossoming('const isolated = true').hasNoIsolated).toBe(false)
  })
})

// ─── measureDeepening ───────────────────────────────────

describe('measureDeepening', () => {
  it('returns low for empty content', () => {
    const result = measureDeepening(emptyContent)
    expect(result.depth).toBeGreaterThanOrEqual(0)
    expect(result.hasHighDepth).toBe(false)
  })

  it('detects well-architected code', () => {
    expect(measureDeepening(richContent).hasWellArchitected).toBe(true)
  })

  it('detects deep code', () => {
    expect(measureDeepening(richContent).hasDeep).toBe(true)
  })

  it('detects insightful code', () => {
    expect(measureDeepening(richContent).hasInsightful).toBe(true)
  })

  it('detects principled code', () => {
    expect(measureDeepening(richContent).hasPrincipled).toBe(true)
  })

  it('detects patterned code', () => {
    expect(measureDeepening(richContent).hasPatterned).toBe(true)
  })

  it('detects mature code', () => {
    expect(measureDeepening(richContent).hasMature).toBe(true)
  })

  it('detects proven code', () => {
    expect(measureDeepening(richContent).hasProven).toBe(true)
  })

  it('detects strategic code', () => {
    expect(measureDeepening(richContent).hasStrategic).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureDeepening(richContent)
    const empty = measureDeepening(emptyContent)
    expect(rich.depth).toBeGreaterThan(empty.depth)
  })

  it('hasNoHacked is true without hack', () => {
    expect(measureDeepening(richContent).hasNoHacked).toBe(true)
  })

  it('hasNoAdHoc is true without any', () => {
    expect(measureDeepening(richContent).hasNoAdHoc).toBe(true)
  })
})

// ─── measureRevealing ───────────────────────────────────

describe('measureRevealing', () => {
  it('returns zero for empty content', () => {
    const result = measureRevealing(emptyContent)
    expect(result.clarity).toBe(0)
    expect(result.moon).toBe('no-clarity')
    expect(result.hasHighClarity).toBe(false)
  })

  it('detects readable code', () => {
    expect(measureRevealing(richContent).hasReadable).toBe(true)
  })

  it('detects self-documenting code', () => {
    expect(measureRevealing(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects clear types', () => {
    expect(measureRevealing(richContent).hasClear).toBe(true)
  })

  it('detects transparent code', () => {
    expect(measureRevealing(richContent).hasTransparent).toBe(true)
  })

  it('detects understandable code', () => {
    expect(measureRevealing(richContent).hasUnderstandable).toBe(true)
  })

  it('detects subtle code', () => {
    expect(measureRevealing(richContent).hasSubtle).toBe(true)
  })

  it('detects documented code', () => {
    expect(measureRevealing(richContent).hasDocumented).toBe(true)
  })

  it('detects illuminated code', () => {
    expect(measureRevealing(richContent).hasIlluminated).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureRevealing(richContent)
    const empty = measureRevealing(emptyContent)
    expect(rich.clarity).toBeGreaterThan(empty.clarity)
  })

  it('hasNoHidden is true without ts-ignore', () => {
    expect(measureRevealing(richContent).hasNoHidden).toBe(true)
  })

  it('hasNoHidden is false with ts-ignore', () => {
    expect(measureRevealing('// @ts-ignore\n').hasNoHidden).toBe(false)
  })
})

// ─── measureScenting ────────────────────────────────────

describe('measureScenting', () => {
  it('returns zero for empty content', () => {
    const result = measureScenting(emptyContent)
    expect(result.fragrance).toBe(0)
    expect(result.scent).toBe('no-fragrance')
    expect(result.hasHighFragrance).toBe(false)
  })

  it('detects clean pipelines', () => {
    expect(measureScenting(richContent).hasCleanPipelines).toBe(true)
  })

  it('detects organized code', () => {
    expect(measureScenting(richContent).hasOrganized).toBe(true)
  })

  it('detects modular code', () => {
    expect(measureScenting(richContent).hasModular).toBe(true)
  })

  it('detects efficient code', () => {
    expect(measureScenting(richContent).hasEfficient).toBe(true)
  })

  it('detects elegant code', () => {
    expect(measureScenting(richContent).hasElegant).toBe(true)
  })

  it('detects subtle code', () => {
    expect(measureScenting(richContent).hasSubtle).toBe(true)
  })

  it('detects refined code', () => {
    expect(measureScenting(richContent).hasRefined).toBe(true)
  })

  it('detects polished code', () => {
    expect(measureScenting(richContent).hasPolished).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureScenting(richContent)
    const empty = measureScenting(emptyContent)
    expect(rich.fragrance).toBeGreaterThan(empty.fragrance)
  })

  it('hasNoTangled is true without tangled', () => {
    expect(measureScenting(richContent).hasNoTangled).toBe(true)
  })

  it('counts tangled patterns', () => {
    const result = measureScenting('const tangled = true')
    expect(result.tangledCount).toBeGreaterThan(0)
  })
})

// ─── measureEnduring ────────────────────────────────────

describe('measureEnduring', () => {
  it('returns zero for empty content', () => {
    const result = measureEnduring(emptyContent)
    expect(result.resilience).toBe(0)
    expect(result.night).toBe('no-resilience')
    expect(result.hasHighResilience).toBe(false)
  })

  it('detects error handling', () => {
    expect(measureEnduring(richContent).hasErrorHandled).toBe(true)
  })

  it('detects tested code', () => {
    expect(measureEnduring(richContent).hasTested).toBe(true)
  })

  it('detects defensive code', () => {
    expect(measureEnduring(richContent).hasDefensive).toBe(true)
  })

  it('detects type-safe code', () => {
    expect(measureEnduring(richContent).hasTypeSafe).toBe(true)
  })

  it('detects graceful handling', () => {
    expect(measureEnduring(richContent).hasGraceful).toBe(true)
  })

  it('detects recoverable code', () => {
    expect(measureEnduring(richContent).hasRecoverable).toBe(true)
  })

  it('detects robust code', () => {
    expect(measureEnduring(richContent).hasRobust).toBe(true)
  })

  it('detects adaptive code', () => {
    expect(measureEnduring(richContent).hasAdaptive).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureEnduring(richContent)
    const empty = measureEnduring(emptyContent)
    expect(rich.resilience).toBeGreaterThan(empty.resilience)
  })

  it('hasNoBareCrash is true without eval', () => {
    expect(measureEnduring(richContent).hasNoBareCrash).toBe(true)
  })

  it('hasNoBareCrash is false with eval', () => {
    expect(measureEnduring('eval("code")').hasNoBareCrash).toBe(false)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies midnight-masterpiece', () => expect(classifyCondition(95)).toBe('midnight-masterpiece'))
  it('classifies moonlit-paradise', () => expect(classifyCondition(78)).toBe('moonlit-paradise'))
  it('classifies proper-garden', () => expect(classifyCondition(65)).toBe('proper-garden'))
  it('classifies dim-plot', () => expect(classifyCondition(45)).toBe('dim-plot'))
  it('classifies barren-earth', () => expect(classifyCondition(25)).toBe('barren-earth'))
  it('classifies void', () => expect(classifyCondition(10)).toBe('void'))
})

describe('classifyGardenType', () => {
  it('returns no-garden for empty', () => expect(classifyGardenType([])).toBe('no-garden'))
  it('classifies secret-garden', () => {
    expect(classifyGardenType([{ qualityScore: 95 } as Moonflower])).toBe('secret-garden')
  })
  it('classifies moonlit-grove', () => {
    expect(classifyGardenType([{ qualityScore: 78 } as Moonflower])).toBe('moonlit-grove')
  })
  it('classifies proper-bed', () => {
    expect(classifyGardenType([{ qualityScore: 65 } as Moonflower])).toBe('proper-bed')
  })
  it('classifies small-patch', () => {
    expect(classifyGardenType([{ qualityScore: 45 } as Moonflower])).toBe('small-patch')
  })
})

describe('classifyGardenCondition', () => {
  it('classifies nocturnal-paradise', () => expect(classifyGardenCondition(90)).toBe('nocturnal-paradise'))
  it('classifies moonlit-garden', () => expect(classifyGardenCondition(72)).toBe('moonlit-garden'))
  it('classifies proper-plot', () => expect(classifyGardenCondition(58)).toBe('proper-plot'))
  it('classifies dim-corner', () => expect(classifyGardenCondition(40)).toBe('dim-corner'))
  it('classifies barren-earth', () => expect(classifyGardenCondition(20)).toBe('barren-earth'))
  it('classifies void', () => expect(classifyGardenCondition(10)).toBe('void'))
})

describe('classifyGardenerGrade', () => {
  it('classifies night-botanist', () => expect(classifyGardenerGrade(85)).toBe('night-botanist'))
  it('classifies shadow-gardener', () => expect(classifyGardenerGrade(70)).toBe('shadow-gardener'))
  it('classifies moon-cultivator', () => expect(classifyGardenerGrade(55)).toBe('moon-cultivator'))
  it('classifies apprentice', () => expect(classifyGardenerGrade(40)).toBe('apprentice'))
  it('classifies novice', () => expect(classifyGardenerGrade(25)).toBe('novice'))
  it('classifies day-worker', () => expect(classifyGardenerGrade(10)).toBe('day-worker'))
})

// ─── analyzeMoonflower ──────────────────────────────────

describe('analyzeMoonflower', () => {
  it('returns valid structure for empty content', () => {
    const flower = analyzeMoonflower(emptyContent, 'empty.ts')
    expect(flower.file).toBe('empty.ts')
    expect(flower.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('returns valid structure for rich content', () => {
    const flower = analyzeMoonflower(richContent, 'rich.ts')
    expect(flower.file).toBe('rich.ts')
    expect(flower.qualityScore).toBeGreaterThan(0)
    expect(flower.nocturnalBloom).toBeGreaterThan(0)
    expect(flower.shadowDepth).toBeGreaterThan(0)
    expect(flower.moonlitClarity).toBeGreaterThan(0)
    expect(flower.nightFragrance).toBeGreaterThan(0)
    expect(flower.darkResilience).toBeGreaterThan(0)
  })

  it('qualityScore is average of 5 measures', () => {
    const flower = analyzeMoonflower(richContent, 'test.ts')
    const expected = Math.round(
      flower.nocturnalBloom * 0.2 +
      flower.shadowDepth * 0.2 +
      flower.moonlitClarity * 0.2 +
      flower.nightFragrance * 0.2 +
      flower.darkResilience * 0.2,
    )
    expect(flower.qualityScore).toBe(expected)
  })

  it('contains all nested measures', () => {
    const flower = analyzeMoonflower(richContent, 'test.ts')
    expect(flower.blossoming).toBeDefined()
    expect(flower.deepening).toBeDefined()
    expect(flower.revealing).toBeDefined()
    expect(flower.scenting).toBeDefined()
    expect(flower.enduring).toBeDefined()
  })

  it('scores rich content at max for blossoming', () => {
    expect(analyzeMoonflower(richContent, 'rich.ts').blossoming.bloom).toBe(100)
  })

  it('scores rich content at max for deepening', () => {
    expect(analyzeMoonflower(richContent, 'rich.ts').deepening.depth).toBe(100)
  })

  it('scores rich content at max for revealing', () => {
    expect(analyzeMoonflower(richContent, 'rich.ts').revealing.clarity).toBe(100)
  })

  it('scores rich content at max for scenting', () => {
    expect(analyzeMoonflower(richContent, 'rich.ts').scenting.fragrance).toBe(100)
  })

  it('scores rich content at max for enduring', () => {
    expect(analyzeMoonflower(richContent, 'rich.ts').enduring.resilience).toBe(100)
  })

  it('rich content yields midnight-masterpiece', () => {
    expect(analyzeMoonflower(richContent, 'rich.ts').condition).toBe('midnight-masterpiece')
  })
})

// ─── analyzeMoonGarden ──────────────────────────────────

describe('analyzeMoonGarden', () => {
  it('returns empty garden for no flowers', () => {
    const garden = analyzeMoonGarden([], 'src')
    expect(garden.directory).toBe('src')
    expect(garden.flowers).toEqual([])
    expect(garden.avgBloom).toBe(0)
    expect(garden.gardenType).toBe('no-garden')
    expect(garden.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const flowers = [
      analyzeMoonflower(richContent, 'src/a.ts'),
      analyzeMoonflower(richContent, 'src/b.ts'),
    ]
    const garden = analyzeMoonGarden(flowers, 'src')
    expect(garden.avgBloom).toBeGreaterThan(0)
    expect(garden.avgDepth).toBeGreaterThan(0)
    expect(garden.avgResilience).toBeGreaterThan(0)
  })
})

// ─── buildMidnightBloomResult ───────────────────────────

describe('buildMidnightBloomResult', () => {
  it('returns valid result for empty input', async () => {
    const result = await buildMidnightBloomResult([], [])
    expect(result.flowers).toEqual([])
    expect(result.gardens).toEqual([])
    expect(result.night.overallLuminosity).toBe(0)
    expect(result.night.isMidnight).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns valid result for rich content', async () => {
    const result = await buildMidnightBloomResult(['a.ts'], [richContent])
    expect(result.flowers.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgNocturnalBloom).toBeGreaterThan(0)
  })

  it('groups files by directory into gardens', async () => {
    const result = await buildMidnightBloomResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.flowers.length).toBe(3)
    expect(result.gardens.length).toBe(2)
  })

  it('night.isMidnight is true when luminosity >= 60', async () => {
    const result = await buildMidnightBloomResult(['a.ts'], [richContent])
    expect(result.night.isMidnight).toBe(true)
  })

  it('computes stats correctly for multiple files', async () => {
    const result = await buildMidnightBloomResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.bestFlower).toBeTruthy()
    expect(result.stats.mostBlooming).toBeTruthy()
    expect(result.stats.deepest).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostFragrant).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
  })

  it('counts condition categories', async () => {
    const result = await buildMidnightBloomResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, minimalContent, emptyContent],
    )
    const total =
      result.stats.midnightMasterpieceCount +
      result.stats.moonlitParadiseCount +
      result.stats.properGardenCount +
      result.stats.dimPlotCount +
      result.stats.barrenEarthCount +
      result.stats.voidCount
    expect(total).toBe(3)
  })

  it('sets gardenerGrade correctly', async () => {
    const result = await buildMidnightBloomResult(['a.ts'], [richContent])
    expect(result.stats.gardenerGrade).toBeDefined()
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message for all-90 scores', () => {
    const flowers = [analyzeMoonflower(richContent, 'a.ts')]
    const stats: MidnightBloomStats = {
      totalFiles: 1, totalGardens: 0,
      avgNocturnalBloom: 95, avgShadowDepth: 95, avgMoonlitClarity: 95,
      avgNightFragrance: 95, avgDarkResilience: 95,
      midnightMasterpieceCount: 1, moonlitParadiseCount: 0, properGardenCount: 0,
      dimPlotCount: 0, barrenEarthCount: 0, voidCount: 0,
      hasHighBloomCount: 1, hasHighDepthCount: 1, hasHighClarityCount: 1,
      hasHighFragranceCount: 1, hasHighResilienceCount: 1,
      overallLuminosity: 95, gardenerGrade: 'night-botanist',
      bestFlower: 'a.ts', mostBlooming: 'a.ts', deepest: 'a.ts',
      clearest: 'a.ts', mostFragrant: 'a.ts', mostResilient: 'a.ts',
    }
    const night = { avgBloom: 95, avgDepth: 95, avgResilience: 95, isMidnight: true, overallLuminosity: 95 }
    const recs = generateRecommendations(flowers, [], night, stats)
    expect(recs.length).toBe(1)
    expect(recs[0]).toContain('nocturnal masterpiece')
  })

  it('recommends improving bloom when low', () => {
    const emptyFlower = analyzeMoonflower(emptyContent, 'a.ts')
    const stats: MidnightBloomStats = {
      totalFiles: 1, totalGardens: 0,
      avgNocturnalBloom: 10, avgShadowDepth: 70, avgMoonlitClarity: 70,
      avgNightFragrance: 70, avgDarkResilience: 70,
      midnightMasterpieceCount: 0, moonlitParadiseCount: 0, properGardenCount: 0,
      dimPlotCount: 0, barrenEarthCount: 0, voidCount: 1,
      hasHighBloomCount: 0, hasHighDepthCount: 1, hasHighClarityCount: 1,
      hasHighFragranceCount: 1, hasHighResilienceCount: 1,
      overallLuminosity: 58, gardenerGrade: 'moon-cultivator',
      bestFlower: 'a.ts', mostBlooming: 'a.ts', deepest: 'a.ts',
      clearest: 'a.ts', mostFragrant: 'a.ts', mostResilient: 'a.ts',
    }
    const night = { avgBloom: 10, avgDepth: 70, avgResilience: 70, isMidnight: false, overallLuminosity: 58 }
    const recs = generateRecommendations([emptyFlower], [], night, stats)
    expect(recs.some((r) => r.includes('nocturnal bloom'))).toBe(true)
  })

  it('warns about many void flowers', () => {
    const flowers = Array.from({ length: 6 }, () => analyzeMoonflower(emptyContent, 'void.ts'))
    const stats: MidnightBloomStats = {
      totalFiles: 6, totalGardens: 0,
      avgNocturnalBloom: 0, avgShadowDepth: 0, avgMoonlitClarity: 0,
      avgNightFragrance: 0, avgDarkResilience: 0,
      midnightMasterpieceCount: 0, moonlitParadiseCount: 0, properGardenCount: 0,
      dimPlotCount: 0, barrenEarthCount: 0, voidCount: 6,
      hasHighBloomCount: 0, hasHighDepthCount: 0, hasHighClarityCount: 0,
      hasHighFragranceCount: 0, hasHighResilienceCount: 0,
      overallLuminosity: 0, gardenerGrade: 'day-worker',
      bestFlower: 'void.ts', mostBlooming: 'void.ts', deepest: 'void.ts',
      clearest: 'void.ts', mostFragrant: 'void.ts', mostResilient: 'void.ts',
    }
    const night = { avgBloom: 0, avgDepth: 0, avgResilience: 0, isMidnight: false, overallLuminosity: 0 }
    const recs = generateRecommendations(flowers, [], night, stats)
    expect(recs.some((r) => r.includes('wilted flowers'))).toBe(true)
  })

  it('recommends improving depth when low', () => {
    const stats: MidnightBloomStats = {
      totalFiles: 1, totalGardens: 0,
      avgNocturnalBloom: 70, avgShadowDepth: 10, avgMoonlitClarity: 70,
      avgNightFragrance: 70, avgDarkResilience: 70,
      midnightMasterpieceCount: 0, moonlitParadiseCount: 0, properGardenCount: 0,
      dimPlotCount: 0, barrenEarthCount: 0, voidCount: 1,
      hasHighBloomCount: 1, hasHighDepthCount: 0, hasHighClarityCount: 1,
      hasHighFragranceCount: 1, hasHighResilienceCount: 1,
      overallLuminosity: 58, gardenerGrade: 'moon-cultivator',
      bestFlower: 'a.ts', mostBlooming: 'a.ts', deepest: 'a.ts',
      clearest: 'a.ts', mostFragrant: 'a.ts', mostResilient: 'a.ts',
    }
    const night = { avgBloom: 70, avgDepth: 10, avgResilience: 70, isMidnight: false, overallLuminosity: 58 }
    const recs = generateRecommendations([], [], night, stats)
    expect(recs.some((r) => r.includes('shadows'))).toBe(true)
  })

  it('recommends improving clarity when low', () => {
    const stats: MidnightBloomStats = {
      totalFiles: 1, totalGardens: 0,
      avgNocturnalBloom: 70, avgShadowDepth: 70, avgMoonlitClarity: 10,
      avgNightFragrance: 70, avgDarkResilience: 70,
      midnightMasterpieceCount: 0, moonlitParadiseCount: 0, properGardenCount: 0,
      dimPlotCount: 0, barrenEarthCount: 0, voidCount: 1,
      hasHighBloomCount: 1, hasHighDepthCount: 1, hasHighClarityCount: 0,
      hasHighFragranceCount: 1, hasHighResilienceCount: 1,
      overallLuminosity: 58, gardenerGrade: 'moon-cultivator',
      bestFlower: 'a.ts', mostBlooming: 'a.ts', deepest: 'a.ts',
      clearest: 'a.ts', mostFragrant: 'a.ts', mostResilient: 'a.ts',
    }
    const night = { avgBloom: 70, avgDepth: 70, avgResilience: 70, isMidnight: false, overallLuminosity: 58 }
    const recs = generateRecommendations([], [], night, stats)
    expect(recs.some((r) => r.includes('moonlight'))).toBe(true)
  })

  it('recommends improving fragrance when low', () => {
    const stats: MidnightBloomStats = {
      totalFiles: 1, totalGardens: 0,
      avgNocturnalBloom: 70, avgShadowDepth: 70, avgMoonlitClarity: 70,
      avgNightFragrance: 10, avgDarkResilience: 70,
      midnightMasterpieceCount: 0, moonlitParadiseCount: 0, properGardenCount: 0,
      dimPlotCount: 0, barrenEarthCount: 0, voidCount: 1,
      hasHighBloomCount: 1, hasHighDepthCount: 1, hasHighClarityCount: 1,
      hasHighFragranceCount: 0, hasHighResilienceCount: 1,
      overallLuminosity: 58, gardenerGrade: 'moon-cultivator',
      bestFlower: 'a.ts', mostBlooming: 'a.ts', deepest: 'a.ts',
      clearest: 'a.ts', mostFragrant: 'a.ts', mostResilient: 'a.ts',
    }
    const night = { avgBloom: 70, avgDepth: 70, avgResilience: 70, isMidnight: false, overallLuminosity: 58 }
    const recs = generateRecommendations([], [], night, stats)
    expect(recs.some((r) => r.includes('fragrance'))).toBe(true)
  })

  it('recommends improving resilience when low', () => {
    const stats: MidnightBloomStats = {
      totalFiles: 1, totalGardens: 0,
      avgNocturnalBloom: 70, avgShadowDepth: 70, avgMoonlitClarity: 70,
      avgNightFragrance: 70, avgDarkResilience: 10,
      midnightMasterpieceCount: 0, moonlitParadiseCount: 0, properGardenCount: 0,
      dimPlotCount: 0, barrenEarthCount: 0, voidCount: 1,
      hasHighBloomCount: 1, hasHighDepthCount: 1, hasHighClarityCount: 1,
      hasHighFragranceCount: 1, hasHighResilienceCount: 0,
      overallLuminosity: 58, gardenerGrade: 'moon-cultivator',
      bestFlower: 'a.ts', mostBlooming: 'a.ts', deepest: 'a.ts',
      clearest: 'a.ts', mostFragrant: 'a.ts', mostResilient: 'a.ts',
    }
    const night = { avgBloom: 70, avgDepth: 70, avgResilience: 10, isMidnight: false, overallLuminosity: 58 }
    const recs = generateRecommendations([], [], night, stats)
    expect(recs.some((r) => r.includes('resilience'))).toBe(true)
  })

  it('warns about all poor gardens', () => {
    const emptyFlower = analyzeMoonflower(emptyContent, 'a.ts')
    const garden: MoonGarden = {
      directory: 'src', flowers: [emptyFlower], avgBloom: 0, avgDepth: 0,
      avgResilience: 0, midnightMasterpieceCount: 0, voidCount: 1,
      gardenType: 'no-garden', condition: 'void',
    }
    const stats: MidnightBloomStats = {
      totalFiles: 1, totalGardens: 1,
      avgNocturnalBloom: 0, avgShadowDepth: 0, avgMoonlitClarity: 0,
      avgNightFragrance: 0, avgDarkResilience: 0,
      midnightMasterpieceCount: 0, moonlitParadiseCount: 0, properGardenCount: 0,
      dimPlotCount: 0, barrenEarthCount: 0, voidCount: 1,
      hasHighBloomCount: 0, hasHighDepthCount: 0, hasHighClarityCount: 0,
      hasHighFragranceCount: 0, hasHighResilienceCount: 0,
      overallLuminosity: 0, gardenerGrade: 'day-worker',
      bestFlower: 'a.ts', mostBlooming: 'a.ts', deepest: 'a.ts',
      clearest: 'a.ts', mostFragrant: 'a.ts', mostResilient: 'a.ts',
    }
    const night = { avgBloom: 0, avgDepth: 0, avgResilience: 0, isMidnight: false, overallLuminosity: 0 }
    const recs = generateRecommendations([emptyFlower], [garden], night, stats)
    expect(recs.some((r) => r.includes('replanting'))).toBe(true)
  })

  it('lists specific void flowers when <= 5', () => {
    const flowers = Array.from({ length: 3 }, (_, i) => analyzeMoonflower(emptyContent, `void${i}.ts`))
    const stats: MidnightBloomStats = {
      totalFiles: 3, totalGardens: 0,
      avgNocturnalBloom: 0, avgShadowDepth: 0, avgMoonlitClarity: 0,
      avgNightFragrance: 0, avgDarkResilience: 0,
      midnightMasterpieceCount: 0, moonlitParadiseCount: 0, properGardenCount: 0,
      dimPlotCount: 0, barrenEarthCount: 0, voidCount: 3,
      hasHighBloomCount: 0, hasHighDepthCount: 0, hasHighClarityCount: 0,
      hasHighFragranceCount: 0, hasHighResilienceCount: 0,
      overallLuminosity: 0, gardenerGrade: 'day-worker',
      bestFlower: 'void0.ts', mostBlooming: 'void0.ts', deepest: 'void0.ts',
      clearest: 'void0.ts', mostFragrant: 'void0.ts', mostResilient: 'void0.ts',
    }
    const night = { avgBloom: 0, avgDepth: 0, avgResilience: 0, isMidnight: false, overallLuminosity: 0 }
    const recs = generateRecommendations(flowers, [], night, stats)
    expect(recs.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('returns default message for moderate scores', () => {
    const stats: MidnightBloomStats = {
      totalFiles: 1, totalGardens: 0,
      avgNocturnalBloom: 70, avgShadowDepth: 70, avgMoonlitClarity: 70,
      avgNightFragrance: 70, avgDarkResilience: 70,
      midnightMasterpieceCount: 0, moonlitParadiseCount: 0, properGardenCount: 0,
      dimPlotCount: 0, barrenEarthCount: 0, voidCount: 0,
      hasHighBloomCount: 1, hasHighDepthCount: 1, hasHighClarityCount: 1,
      hasHighFragranceCount: 1, hasHighResilienceCount: 1,
      overallLuminosity: 70, gardenerGrade: 'shadow-gardener',
      bestFlower: 'a.ts', mostBlooming: 'a.ts', deepest: 'a.ts',
      clearest: 'a.ts', mostFragrant: 'a.ts', mostResilient: 'a.ts',
    }
    const night = { avgBloom: 70, avgDepth: 70, avgResilience: 70, isMidnight: true, overallLuminosity: 70 }
    const recs = generateRecommendations([], [], night, stats)
    expect(recs.some((r) => r.includes('nocturnal brilliance'))).toBe(true)
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
    expect(typeof colorCondition('midnight-masterpiece')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
  })
})

describe('colorGardenCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorGardenCondition('nocturnal-paradise')).toBe('string')
    expect(typeof colorGardenCondition('void')).toBe('string')
  })
})

describe('formatFlowerTable', () => {
  it('formats a single flower', () => {
    const flower = analyzeMoonflower(richContent, 'test.ts')
    const output = formatFlowerTable(flower)
    expect(output).toContain('Moonflower: test.ts')
    expect(output).toContain('Nocturnal Bloom')
  })
})

describe('formatFlowersTable', () => {
  it('returns message for empty', () => {
    expect(formatFlowersTable([])).toContain('No moonflowers found')
  })

  it('formats multiple flowers', () => {
    const flowers = [analyzeMoonflower(richContent, 'a.ts'), analyzeMoonflower(minimalContent, 'b.ts')]
    const output = formatFlowersTable(flowers)
    expect(output).toContain('Moonflowers')
    expect(output).toContain('a.ts')
  })
})

describe('formatGardenTable', () => {
  it('formats a garden', () => {
    const flowers = [analyzeMoonflower(richContent, 'src/a.ts')]
    const garden = analyzeMoonGarden(flowers, 'src')
    expect(formatGardenTable(garden)).toContain('Moon Garden: src')
  })
})

describe('formatGardensTable', () => {
  it('returns message for empty', () => {
    expect(formatGardensTable([])).toContain('No moon gardens found')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildMidnightBloomResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Midnight Bloom Statistics')
    expect(output).toContain('Gardener Grade')
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
    const result = await buildMidnightBloomResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Midnight Bloom Analysis')
    expect(output).toContain('Night Overview')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildMidnightBloomResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.flowers).toBeDefined()
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
