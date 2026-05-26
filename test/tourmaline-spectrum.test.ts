import { describe, expect, it } from 'vitest'

import {
  analyzeTourmalineCluster,
  analyzeTourmalineShard,
  buildTourmalineSpectrumResult,
  classifyClusterCondition,
  classifyClusterType,
  classifyGemologistGrade,
  classifyTourmalineCondition,
  generateRecommendations,
  measureCharging,
  measureClarifying,
  measureDiversifying,
  measureRefracting,
  measureUnderstanding,
} from '../src/commands/tourmaline-spectrum-helpers.js'
import type { TourmalineSpectrumResult } from '../src/commands/tourmaline-spectrum-helpers.js'
import {
  colorClusterCondition,
  colorClusterType,
  colorGemologistGrade,
  colorScore,
  colorTourmalineCondition,
  formatClustersTable,
  formatClusterTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatShardsTable,
  formatShardTable,
  formatStatsTable,
} from '../src/commands/tourmaline-spectrum-format-helpers.js'

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

const richDiv = measureDiversifying(richContent).diversity
const richClr = measureClarifying(richContent).clarity
const richPrec = measureRefracting(richContent).precision
const richRes = measureCharging(richContent).resilience
const richWis = measureUnderstanding(richContent).wisdom

function makeStats(overrides: Partial<TourmalineSpectrumResult['stats']> = {}): TourmalineSpectrumResult['stats'] {
  return {
    totalFiles: 1,
    totalClusters: 1,
    avgRainbowDiversity: 50,
    avgCrystalClarity: 50,
    avgPrismPrecision: 50,
    avgPiezoelectricResilience: 50,
    avgMineralWisdom: 50,
    tourmalineMasterpieceCount: 0,
    paraibaGemCount: 0,
    properTourmalineCount: 0,
    commonStoneCount: 0,
    roughCrystalCount: 0,
    voidCount: 0,
    hasHighDiversityCount: 1,
    hasHighClarityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallSpectrum: 50,
    gemologistGrade: 'proper-gemologist',
    bestShard: 'a.ts',
    mostDiverse: 'a.ts',
    clearest: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureDiversifying ────────────────────────────────

describe('measureDiversifying', () => {
  it('scores rich content highly', () => {
    const result = measureDiversifying(richContent)
    expect(result.diversity).toBeGreaterThan(60)
    expect(result.hasHighDiversity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureDiversifying(emptyContent).diversity).toBeLessThan(richDiv)
  })

  it('detects hasVersatile (class/interface/type)', () => {
    expect(measureDiversifying(richContent).hasVersatile).toBe(true)
  })

  it('counts rigid keywords', () => {
    const content = 'const rigid = 1; const inflexible = 2; const brittle = 3; const fragile = 4'
    const result = measureDiversifying(content)
    expect(result.rigidCount).toBe(4)
    expect(result.hasNoRigid).toBe(false)
  })

  it('counts single-use keywords', () => {
    const content = 'const single.use = 1; const disposable = 2; const one.time = 3'
    const result = measureDiversifying(content)
    expect(result.singleUseCount).toBe(3)
    expect(result.hasNoSingleUse).toBe(false)
  })

  it('detects hasAdaptable (import/export)', () => {
    expect(measureDiversifying(richContent).hasAdaptable).toBe(true)
  })

  it('detects hasMultiPurpose (type annotations)', () => {
    expect(measureDiversifying(richContent).hasMultiPurpose).toBe(true)
  })

  it('detects hasFlexible (no any)', () => {
    expect(measureDiversifying(richContent).hasFlexible).toBe(true)
  })

  it('detects hasDiverse (async/await/Promise)', () => {
    expect(measureDiversifying(richContent).hasDiverse).toBe(true)
  })

  it('detects hasRich (JSDoc)', () => {
    expect(measureDiversifying(richContent).hasRich).toBe(true)
  })

  it('detects hasLayered (function/arrow/return)', () => {
    expect(measureDiversifying(richContent).hasLayered).toBe(true)
  })

  it('classifies spectrum correctly for high scores', () => {
    const result = measureDiversifying(richContent)
    expect(['watermelon-tourmaline', 'bi-color-crystal', 'proper-variety']).toContain(result.spectrum)
  })

  it('classifies spectrum correctly for low scores', () => {
    expect(measureDiversifying(emptyContent).spectrum).not.toBe('watermelon-tourmaline')
  })
})

// ─── measureClarifying ──────────────────────────────────

describe('measureClarifying', () => {
  it('scores rich content highly', () => {
    const result = measureClarifying(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureClarifying(emptyContent).clarity).toBeLessThan(richClr)
  })

  it('detects hasReadable (class/interface/type)', () => {
    expect(measureClarifying(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureClarifying(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureClarifying(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects hasSelfDocumenting (type annotations)', () => {
    expect(measureClarifying(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects hasTransparent (no any)', () => {
    expect(measureClarifying(richContent).hasTransparent).toBe(true)
  })

  it('detects hasOpen (JSDoc)', () => {
    expect(measureClarifying(richContent).hasOpen).toBe(true)
  })

  it('classifies gem correctly for high scores', () => {
    const result = measureClarifying(richContent)
    expect(['paraiba-clarity', 'rubellite-clear', 'proper-transparent']).toContain(result.gem)
  })

  it('classifies gem correctly for low scores', () => {
    expect(measureClarifying(emptyContent).gem).not.toBe('paraiba-clarity')
  })
})

// ─── measureRefracting ──────────────────────────────────

describe('measureRefracting', () => {
  it('scores rich content highly', () => {
    const result = measureRefracting(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureRefracting(emptyContent).precision).toBeLessThan(richPrec)
  })

  it('detects hasTypeSafe (no any)', () => {
    expect(measureRefracting(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureRefracting(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const imprecise = 3; const loose = 4; const sloppy = 5'
    const result = measureRefracting(content)
    expect(result.approximateCount).toBe(5)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects hasExact (class/interface/type)', () => {
    expect(measureRefracting(richContent).hasExact).toBe(true)
  })

  it('detects hasCrisp (JSDoc)', () => {
    expect(measureRefracting(richContent).hasCrisp).toBe(true)
  })

  it('detects hasMeasured (try/catch/if)', () => {
    expect(measureRefracting(richContent).hasMeasured).toBe(true)
  })

  it('detects hasGeometric (function/arrow/return)', () => {
    expect(measureRefracting(richContent).hasGeometric).toBe(true)
  })

  it('classifies cut correctly for high scores', () => {
    const result = measureRefracting(richContent)
    expect(['faceted-perfect', 'proper-cut', 'good-proportions']).toContain(result.cut)
  })

  it('classifies cut correctly for low scores', () => {
    expect(measureRefracting(emptyContent).cut).not.toBe('faceted-perfect')
  })
})

// ─── measureCharging ────────────────────────────────────

describe('measureCharging', () => {
  it('scores rich content highly', () => {
    const result = measureCharging(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureCharging(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects hasErrorHandled (try/catch)', () => {
    expect(measureCharging(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const unprocessed = 3; const unresolved = 4'
    const result = measureCharging(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureCharging(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects hasRobust (class/interface/type)', () => {
    expect(measureCharging(richContent).hasRobust).toBe(true)
  })

  it('detects hasReactive (no any)', () => {
    expect(measureCharging(richContent).hasReactive).toBe(true)
  })

  it('detects hasResilient (async/await/Promise)', () => {
    expect(measureCharging(richContent).hasResilient).toBe(true)
  })

  it('classifies charge correctly for high scores', () => {
    const result = measureCharging(richContent)
    expect(['high-voltage', 'strong-current', 'proper-charge']).toContain(result.charge)
  })

  it('classifies charge correctly for low scores', () => {
    expect(measureCharging(emptyContent).charge).not.toBe('high-voltage')
  })
})

// ─── measureUnderstanding ───────────────────────────────

describe('measureUnderstanding', () => {
  it('scores rich content highly', () => {
    const result = measureUnderstanding(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureUnderstanding(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects hasWellArchitected (class/interface/type)', () => {
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

  it('detects hasPrincipled (no any)', () => {
    expect(measureUnderstanding(richContent).hasPrincipled).toBe(true)
  })

  it('detects hasInsightful (JSDoc)', () => {
    expect(measureUnderstanding(richContent).hasInsightful).toBe(true)
  })

  it('detects hasComprehensive (try/catch/if)', () => {
    expect(measureUnderstanding(richContent).hasComprehensive).toBe(true)
  })

  it('detects hasPerceptive (function/arrow/return)', () => {
    expect(measureUnderstanding(richContent).hasPerceptive).toBe(true)
  })

  it('classifies insight correctly for high scores', () => {
    const result = measureUnderstanding(richContent)
    expect(['spectrum-master', 'color-sage', 'proper-mineralogist']).toContain(result.insight)
  })

  it('classifies insight correctly for low scores', () => {
    expect(measureUnderstanding(emptyContent).insight).not.toBe('spectrum-master')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyTourmalineCondition', () => {
  it('returns tourmaline-masterpiece for 90+', () => {
    expect(classifyTourmalineCondition(90)).toBe('tourmaline-masterpiece')
    expect(classifyTourmalineCondition(95)).toBe('tourmaline-masterpiece')
  })

  it('returns paraiba-gem for 75-89', () => {
    expect(classifyTourmalineCondition(75)).toBe('paraiba-gem')
  })

  it('returns proper-tourmaline for 60-74', () => {
    expect(classifyTourmalineCondition(60)).toBe('proper-tourmaline')
  })

  it('returns common-stone for 40-59', () => {
    expect(classifyTourmalineCondition(40)).toBe('common-stone')
  })

  it('returns rough-crystal for 20-39', () => {
    expect(classifyTourmalineCondition(20)).toBe('rough-crystal')
  })

  it('returns void below 20', () => {
    expect(classifyTourmalineCondition(0)).toBe('void')
    expect(classifyTourmalineCondition(10)).toBe('void')
  })
})

describe('classifyClusterType', () => {
  it('returns no-cluster for empty shards', () => {
    expect(classifyClusterType([])).toBe('no-cluster')
  })

  it('returns rainbow-cluster for avg >= 85', () => {
    const shards = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyClusterType(shards)).toBe('rainbow-cluster')
  })

  it('returns empty-cavity for low avg', () => {
    const shards = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyClusterType(shards)).toBe('empty-cavity')
  })
})

describe('classifyClusterCondition', () => {
  it('returns tourmaline-palace for 85+', () => {
    expect(classifyClusterCondition(85)).toBe('tourmaline-palace')
  })

  it('returns void below 15', () => {
    expect(classifyClusterCondition(5)).toBe('void')
  })
})

describe('classifyGemologistGrade', () => {
  it('returns spectrum-master for 80+', () => {
    expect(classifyGemologistGrade(80)).toBe('spectrum-master')
  })

  it('returns color-blind below 20', () => {
    expect(classifyGemologistGrade(5)).toBe('color-blind')
  })

  it('returns color-expert for 65-79', () => {
    expect(classifyGemologistGrade(65)).toBe('color-expert')
  })

  it('returns proper-gemologist for 50-64', () => {
    expect(classifyGemologistGrade(50)).toBe('proper-gemologist')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyGemologistGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyGemologistGrade(20)).toBe('novice')
  })
})

// ─── analyzeTourmalineShard ─────────────────────────────

describe('analyzeTourmalineShard', () => {
  it('creates a shard with all 5 measures', () => {
    const shard = analyzeTourmalineShard(richContent, 'app.ts')
    expect(shard.file).toBe('app.ts')
    expect(typeof shard.rainbowDiversity).toBe('number')
    expect(typeof shard.crystalClarity).toBe('number')
    expect(typeof shard.prismPrecision).toBe('number')
    expect(typeof shard.piezoelectricResilience).toBe('number')
    expect(typeof shard.mineralWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const shard = analyzeTourmalineShard(richContent, 'app.ts')
    const expected = Math.round(
      shard.rainbowDiversity * 0.2 +
      shard.crystalClarity * 0.2 +
      shard.prismPrecision * 0.2 +
      shard.piezoelectricResilience * 0.2 +
      shard.mineralWisdom * 0.2,
    )
    expect(shard.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const shard = analyzeTourmalineShard(richContent, 'app.ts')
    expect(shard.condition).toBe(classifyTourmalineCondition(shard.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richShard = analyzeTourmalineShard(richContent, 'rich.ts')
    const emptyShard = analyzeTourmalineShard(emptyContent, 'empty.ts')
    expect(richShard.qualityScore).toBeGreaterThan(emptyShard.qualityScore)
  })

  it('scores rich content higher than minimal', () => {
    const richShard = analyzeTourmalineShard(richContent, 'rich.ts')
    const minShard = analyzeTourmalineShard(minimalContent, 'min.ts')
    expect(richShard.qualityScore).toBeGreaterThan(minShard.qualityScore)
  })
})

// ─── analyzeTourmalineCluster ───────────────────────────

describe('analyzeTourmalineCluster', () => {
  it('returns empty cluster for no shards', () => {
    const cluster = analyzeTourmalineCluster([], 'src')
    expect(cluster.directory).toBe('src')
    expect(cluster.shards).toEqual([])
    expect(cluster.clusterType).toBe('no-cluster')
    expect(cluster.condition).toBe('void')
  })

  it('computes averages from shards', () => {
    const shards = [analyzeTourmalineShard(richContent, 'a.ts'), analyzeTourmalineShard(richContent, 'b.ts')]
    const cluster = analyzeTourmalineCluster(shards, 'src')
    expect(cluster.avgDiversity).toBeGreaterThan(0)
    expect(cluster.avgPrecision).toBeGreaterThan(0)
    expect(cluster.avgWisdom).toBeGreaterThan(0)
  })

  it('counts tourmaline masterpieces', () => {
    const shard = analyzeTourmalineShard(richContent, 'a.ts')
    const cluster = analyzeTourmalineCluster([shard], 'src')
    expect(typeof cluster.tourmalineMasterpieceCount).toBe('number')
  })
})

// ─── buildTourmalineSpectrumResult ──────────────────────

describe('buildTourmalineSpectrumResult', () => {
  it('returns full result structure', async () => {
    const result = await buildTourmalineSpectrumResult(['a.ts'], [richContent])
    expect(result.shards).toHaveLength(1)
    expect(result.clusters).toHaveLength(1)
    expect(result.rainbow).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into clusters', async () => {
    const result = await buildTourmalineSpectrumResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.clusters.length).toBe(2)
  })

  it('computes rainbow overview', async () => {
    const result = await buildTourmalineSpectrumResult(['a.ts'], [richContent])
    expect(result.rainbow.avgDiversity).toBeGreaterThan(0)
    expect(result.rainbow.isTourmaline).toBe(true)
    expect(result.rainbow.overallSpectrum).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildTourmalineSpectrumResult([], [])
    expect(result.shards).toHaveLength(0)
    expect(result.clusters).toHaveLength(0)
    expect(result.rainbow.overallSpectrum).toBe(0)
    expect(result.rainbow.isTourmaline).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildTourmalineSpectrumResult(['a.ts'], [richContent])
    const total = result.stats.tourmalineMasterpieceCount +
      result.stats.paraibaGemCount +
      result.stats.properTourmalineCount +
      result.stats.commonStoneCount +
      result.stats.roughCrystalCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildTourmalineSpectrumResult(['a.ts'], [richContent])
    expect(result.stats.hasHighDiversityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best shard and top performers', async () => {
    const result = await buildTourmalineSpectrumResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestShard).toBeTruthy()
    expect(result.stats.mostDiverse).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes gemologist grade from overall spectrum', async () => {
    const result = await buildTourmalineSpectrumResult(['a.ts'], [richContent])
    expect(result.stats.gemologistGrade).toBe(classifyGemologistGrade(result.stats.overallSpectrum))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgRainbowDiversity: 90,
      avgCrystalClarity: 90,
      avgPrismPrecision: 90,
      avgPiezoelectricResilience: 90,
      avgMineralWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgDiversity: 90, avgPrecision: 90, avgWisdom: 90, isTourmaline: true, overallSpectrum: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('tourmaline masterpiece')
  })

  it('recommends rainbow diversity when < 60', () => {
    const stats = makeStats({ avgRainbowDiversity: 50 })
    const result = generateRecommendations([], [], { avgDiversity: 50, avgPrecision: 50, avgWisdom: 50, isTourmaline: false, overallSpectrum: 50 }, stats)
    expect(result.some((r) => r.includes('rainbow diversity') || r.includes('watermelon-tourmaline'))).toBe(true)
  })

  it('recommends crystal clarity when < 60', () => {
    const stats = makeStats({ avgCrystalClarity: 50 })
    const result = generateRecommendations([], [], { avgDiversity: 50, avgPrecision: 50, avgWisdom: 50, isTourmaline: false, overallSpectrum: 50 }, stats)
    expect(result.some((r) => r.includes('crystal clarity') || r.includes('paraiba-clarity'))).toBe(true)
  })

  it('recommends prism precision when < 60', () => {
    const stats = makeStats({ avgPrismPrecision: 50 })
    const result = generateRecommendations([], [], { avgDiversity: 50, avgPrecision: 50, avgWisdom: 50, isTourmaline: false, overallSpectrum: 50 }, stats)
    expect(result.some((r) => r.includes('prism precision') || r.includes('faceted-perfect'))).toBe(true)
  })

  it('recommends piezoelectric resilience when < 60', () => {
    const stats = makeStats({ avgPiezoelectricResilience: 50 })
    const result = generateRecommendations([], [], { avgDiversity: 50, avgPrecision: 50, avgWisdom: 50, isTourmaline: false, overallSpectrum: 50 }, stats)
    expect(result.some((r) => r.includes('piezoelectric resilience') || r.includes('high-voltage'))).toBe(true)
  })

  it('recommends mineral wisdom when < 60', () => {
    const stats = makeStats({ avgMineralWisdom: 50 })
    const result = generateRecommendations([], [], { avgDiversity: 50, avgPrecision: 50, avgWisdom: 50, isTourmaline: false, overallSpectrum: 50 }, stats)
    expect(result.some((r) => r.includes('mineral wisdom') || r.includes('spectrum-master'))).toBe(true)
  })

  it('warns about faded spectrum when overallSpectrum < 40', () => {
    const stats = makeStats({ overallSpectrum: 30 })
    const result = generateRecommendations([], [], { avgDiversity: 30, avgPrecision: 30, avgWisdom: 30, isTourmaline: false, overallSpectrum: 30 }, stats)
    expect(result.some((r) => r.includes('faded'))).toBe(true)
  })

  it('lists void shards by name when <= 5', () => {
    const shards = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(shards, [], { avgDiversity: 50, avgPrecision: 50, avgWisdom: 50, isTourmaline: false, overallSpectrum: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void shards when > 5', () => {
    const shards = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(shards, [], { avgDiversity: 50, avgPrecision: 50, avgWisdom: 50, isTourmaline: false, overallSpectrum: 50 }, stats)
    expect(result.some((r) => r.includes('6 rough crystals'))).toBe(true)
  })

  it('warns when all clusters are poor', () => {
    const clusters = [{ condition: 'empty-case' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], clusters as Array<{ condition: string }>, { avgDiversity: 50, avgPrecision: 50, avgWisdom: 50, isTourmaline: false, overallSpectrum: 50 }, stats)
    expect(result.some((r) => r.includes('empty cases'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgRainbowDiversity: 70,
      avgCrystalClarity: 70,
      avgPrismPrecision: 70,
      avgPiezoelectricResilience: 70,
      avgMineralWisdom: 70,
      overallSpectrum: 70,
    })
    const result = generateRecommendations([], [], { avgDiversity: 70, avgPrecision: 70, avgWisdom: 70, isTourmaline: true, overallSpectrum: 70 }, stats)
    expect(result.some((r) => r.includes('rainbow brilliance'))).toBe(true)
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

describe('colorTourmalineCondition', () => {
  it('colors tourmaline-masterpiece', () => {
    expect(typeof colorTourmalineCondition('tourmaline-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorTourmalineCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorTourmalineCondition('unknown')).toBe('string')
  })
})

describe('colorClusterType', () => {
  it('colors rainbow-cluster', () => {
    expect(typeof colorClusterType('rainbow-cluster')).toBe('string')
  })

  it('colors no-cluster', () => {
    expect(typeof colorClusterType('no-cluster')).toBe('string')
  })
})

describe('colorClusterCondition', () => {
  it('colors tourmaline-palace', () => {
    expect(typeof colorClusterCondition('tourmaline-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorClusterCondition('void')).toBe('string')
  })
})

describe('colorGemologistGrade', () => {
  it('colors spectrum-master', () => {
    expect(typeof colorGemologistGrade('spectrum-master')).toBe('string')
  })

  it('colors color-blind', () => {
    expect(typeof colorGemologistGrade('color-blind')).toBe('string')
  })
})

describe('formatShardTable', () => {
  it('formats a shard with all measures', () => {
    const shard = analyzeTourmalineShard(richContent, 'app.ts')
    const output = formatShardTable(shard)
    expect(output).toContain('Tourmaline Shard: app.ts')
    expect(output).toContain('Rainbow Diversity')
    expect(output).toContain('Crystal Clarity')
    expect(output).toContain('Prism Precision')
    expect(output).toContain('Piezoelectric Resilience')
    expect(output).toContain('Mineral Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatShardsTable', () => {
  it('shows no shards message for empty array', () => {
    expect(formatShardsTable([])).toContain('No tourmaline shards')
  })

  it('lists shards in output', () => {
    const shards = [analyzeTourmalineShard(richContent, 'a.ts')]
    expect(formatShardsTable(shards)).toContain('a.ts')
  })
})

describe('formatClusterTable', () => {
  it('formats a cluster with all fields', () => {
    const shards = [analyzeTourmalineShard(richContent, 'a.ts')]
    const cluster = analyzeTourmalineCluster(shards, 'src')
    const output = formatClusterTable(cluster)
    expect(output).toContain('Tourmaline Cluster: src')
    expect(output).toContain('Shards')
    expect(output).toContain('Avg Diversity')
  })
})

describe('formatClustersTable', () => {
  it('shows no clusters message for empty array', () => {
    expect(formatClustersTable([])).toContain('No tourmaline clusters')
  })

  it('lists clusters in output', () => {
    const shards = [analyzeTourmalineShard(richContent, 'a.ts')]
    const cluster = analyzeTourmalineCluster(shards, 'src')
    expect(formatClustersTable([cluster])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildTourmalineSpectrumResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Tourmaline Spectrum Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Gemologist Grade')
    expect(output).toContain('Best Shard')
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
    const result = await buildTourmalineSpectrumResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Tourmaline Spectrum Analysis')
    expect(output).toContain('Rainbow Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildTourmalineSpectrumResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.shards).toHaveLength(1)
    expect(parsed.rainbow).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
