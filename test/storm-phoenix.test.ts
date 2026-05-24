import { describe, expect, it } from 'vitest'

import {
  analyzePhoenixEmber,
  analyzePhoenixFlock,
  buildStormPhoenixResult,
  classifyAviatorGrade,
  classifyFlockCondition,
  classifyFlockType,
  classifyPhoenixCondition,
  generateRecommendations,
  measureAdapting,
  measureLearning,
  measureRebirthing,
  measureTransforming,
  measureWeathering,
  type PhoenixEmber,
  type PhoenixFlock,
  type StormPhoenixStats,
  type StormSummary,
} from '../src/commands/storm-phoenix-helpers.js'
import {
  colorGrade,
  colorScore,
  formatEmberTable,
  formatEmbersTable,
  formatFlockTable,
  formatFlocksTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/storm-phoenix-format-helpers.js'

// ─── Test Content Fixtures ────────────────────────────────────────

const resilientContent = `import { readFileSync } from 'node:fs'
import type { Config } from './types.js'

/** Read config safely */
export async function readConfig(path: string): Promise<Config> {
  try {
    const raw = readFileSync(path, 'utf8')
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object') {
      throw new Error('Invalid config')
    }
    return parsed as Config
  } catch (error) {
    const fallback = readFileSync('default.json', 'utf8')
    return JSON.parse(fallback) ?? {}
  } finally {
    console.log('Config read complete')
  }
}

export class ConfigManager {
  private readonly configs: Map<string, Config> = new Map()
  readonly version: string = '1.0.0'

  add(key: string, config: Config): void {
    if (config === null || config === undefined) {
      throw new Error('Config cannot be null')
    }
    this.configs.set(key, config)
  }

  get(key: string): Config | undefined {
    return this.configs.get(key) ?? undefined
  }
}

export type { Config }
export interface ConfigOpts { debug: boolean; verbose: boolean }
export const DEFAULT_OPTS: ConfigOpts = { debug: false, verbose: false }
const val: string | null = null
const result = val ?? 'default'
`

const minimalContent = `var x = 1
var y = 2
any
`

const emptyContent = ''

const moderateContent = `import { something } from './mod.js'
export const name = 'test'
export function hello(): string {
  return 'hello'
}
`

// ─── measureRebirthing ────────────────────────────────────────────

describe('measureRebirthing', () => {
  it('returns high quality for rich content', () => {
    const m = measureRebirthing(resilientContent)
    expect(m.quality).toBeGreaterThan(60)
    expect(m.hasRefactorable).toBe(true)
    expect(m.hasModular).toBe(true)
  })

  it('returns low quality for minimal content', () => {
    const m = measureRebirthing(minimalContent)
    expect(m.quality).toBeLessThan(30)
  })

  it('returns 0 quality for empty content', () => {
    const m = measureRebirthing(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('ashes-only')
  })

  it('detects monolithic patterns', () => {
    const m = measureRebirthing(minimalContent)
    expect(m.monolithicCount).toBeGreaterThan(0)
    expect(m.tangledCount).toBeGreaterThan(0)
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('detects clean patterns in resilient code', () => {
    const m = measureRebirthing(resilientContent)
    expect(m.hasNoMonolithic).toBe(true)
    expect(m.hasNoTangled).toBe(true)
  })

  it('classifies grade based on quality', () => {
    const m = measureRebirthing(resilientContent)
    expect(m.grade).toBe('divine-rebirth')
  })

  it('sets hasHighQuality when quality >= 70', () => {
    const m = measureRebirthing(resilientContent)
    expect(m.hasHighQuality).toBe(true)
  })

  it('detects decoupled patterns', () => {
    const m = measureRebirthing(resilientContent)
    expect(m.hasDecoupled).toBe(true)
  })

  it('detects extensible patterns', () => {
    const m = measureRebirthing(resilientContent)
    expect(m.hasExtensible).toBe(true)
  })

  it('detects clean patterns', () => {
    const m = measureRebirthing(resilientContent)
    expect(m.hasClean).toBe(true)
  })
})

// ─── measureWeathering ────────────────────────────────────────────

describe('measureWeathering', () => {
  it('returns high resilience for content with try/catch', () => {
    const m = measureWeathering(resilientContent)
    expect(m.resilience).toBeGreaterThan(60)
    expect(m.hasTryCatch).toBe(true)
    expect(m.hasErrorBoundary).toBe(true)
  })

  it('returns low resilience for minimal content', () => {
    const m = measureWeathering(minimalContent)
    expect(m.resilience).toBeLessThan(30)
  })

  it('returns 0 resilience for empty content', () => {
    const m = measureWeathering(emptyContent)
    expect(m.resilience).toBe(0)
    expect(m.storm).toBe('no-protection')
  })

  it('detects try/catch patterns', () => {
    const m = measureWeathering(resilientContent)
    expect(m.hasTryCatch).toBe(true)
    expect(m.hasErrorBoundary).toBe(true)
  })

  it('detects graceful patterns', () => {
    const m = measureWeathering(resilientContent)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasFallback).toBe(true)
  })

  it('classifies storm grade', () => {
    const m = measureWeathering(resilientContent)
    expect(m.storm).toBe('impervious-shield')
  })

  it('sets hasHighResilience when resilience >= 70', () => {
    const m = measureWeathering(resilientContent)
    expect(m.hasHighResilience).toBe(true)
  })

  it('detects validation patterns', () => {
    const m = measureWeathering(resilientContent)
    expect(m.hasValidation).toBe(true)
  })

  it('detects recovery patterns', () => {
    const m = measureWeathering(resilientContent)
    expect(m.hasRecovery).toBe(true)
  })
})

// ─── measureLearning ──────────────────────────────────────────────

describe('measureLearning', () => {
  it('returns high wisdom for documented content', () => {
    const m = measureLearning(resilientContent)
    expect(m.wisdom).toBeGreaterThan(60)
    expect(m.hasDocumented).toBe(true)
  })

  it('returns low wisdom for minimal content', () => {
    const m = measureLearning(minimalContent)
    expect(m.wisdom).toBeLessThan(30)
  })

  it('returns 0 wisdom for empty content', () => {
    const m = measureLearning(emptyContent)
    expect(m.wisdom).toBe(0)
    expect(m.ember).toBe('no-wisdom')
  })

  it('detects typed patterns', () => {
    const m = measureLearning(resilientContent)
    expect(m.hasTyped).toBe(true)
  })

  it('detects documented patterns', () => {
    const m = measureLearning(resilientContent)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasCommented).toBe(true)
  })

  it('classifies ember grade', () => {
    const m = measureLearning(resilientContent)
    expect(m.ember).toBe('ancient-wisdom')
  })

  it('sets hasHighWisdom when wisdom >= 70', () => {
    const m = measureLearning(resilientContent)
    expect(m.hasHighWisdom).toBe(true)
  })

  it('detects versioned patterns', () => {
    const m = measureLearning(resilientContent)
    expect(m.hasVersioned).toBe(true)
  })

  it('detects logged patterns', () => {
    const m = measureLearning(resilientContent)
    expect(m.hasLogged).toBe(true)
  })
})

// ─── measureAdapting ──────────────────────────────────────────────

describe('measureAdapting', () => {
  it('returns high adaptation for flexible content', () => {
    const m = measureAdapting(resilientContent)
    expect(m.adaptation).toBeGreaterThan(60)
    expect(m.hasFlexible).toBe(true)
  })

  it('returns low adaptation for minimal content', () => {
    const m = measureAdapting(minimalContent)
    expect(m.adaptation).toBeLessThan(30)
  })

  it('returns 0 adaptation for empty content', () => {
    const m = measureAdapting(emptyContent)
    expect(m.adaptation).toBe(0)
    expect(m.lightning).toBe('petrified')
  })

  it('detects hardcoded patterns', () => {
    const m = measureAdapting(minimalContent)
    expect(m.hardcodedCount).toBeGreaterThan(0)
  })

  it('classifies lightning grade', () => {
    const m = measureAdapting(resilientContent)
    expect(m.lightning).toBe('lightning-fast')
  })

  it('sets hasHighAdaptation when adaptation >= 70', () => {
    const m = measureAdapting(resilientContent)
    expect(m.hasHighAdaptation).toBe(true)
  })

  it('detects configurable patterns', () => {
    const m = measureAdapting(resilientContent)
    expect(m.hasConfigurable).toBe(true)
  })

  it('detects pluggable patterns', () => {
    const m = measureAdapting(resilientContent)
    expect(m.hasPluggable).toBe(true)
  })

  it('detects portable patterns', () => {
    const m = measureAdapting(resilientContent)
    expect(m.hasPortable).toBe(true)
  })

  it('detects scalable patterns', () => {
    const m = measureAdapting(resilientContent)
    expect(m.hasScalable).toBe(true)
  })
})

// ─── measureTransforming ──────────────────────────────────────────

describe('measureTransforming', () => {
  it('returns high transformation for content with error recovery', () => {
    const m = measureTransforming(resilientContent)
    expect(m.transformation).toBeGreaterThan(60)
    expect(m.hasLearningFromErrors).toBe(true)
  })

  it('returns low transformation for minimal content', () => {
    const m = measureTransforming(minimalContent)
    expect(m.transformation).toBeLessThan(30)
  })

  it('returns 0 transformation for empty content', () => {
    const m = measureTransforming(emptyContent)
    expect(m.transformation).toBe(0)
    expect(m.ash).toBe('no-transformation')
  })

  it('detects retry logic', () => {
    const m = measureTransforming(resilientContent)
    expect(m.hasRetryLogic).toBe(true)
  })

  it('detects learning from errors', () => {
    const m = measureTransforming(resilientContent)
    expect(m.hasLearningFromErrors).toBe(true)
  })

  it('detects improvement patterns', () => {
    const m = measureTransforming(resilientContent)
    expect(m.hasImprovement).toBe(true)
  })

  it('detects evolution patterns', () => {
    const m = measureTransforming(resilientContent)
    expect(m.hasEvolution).toBe(true)
  })

  it('detects progression patterns', () => {
    const m = measureTransforming(resilientContent)
    expect(m.hasProgression).toBe(true)
  })

  it('classifies ash grade', () => {
    const m = measureTransforming(resilientContent)
    expect(m.ash).toBe('phoenix-ascension')
  })

  it('sets hasHighTransformation when transformation >= 70', () => {
    const m = measureTransforming(resilientContent)
    expect(m.hasHighTransformation).toBe(true)
  })
})

// ─── classifyPhoenixCondition ─────────────────────────────────────

describe('classifyPhoenixCondition', () => {
  it('returns mythical-phoenix for 85+', () => {
    expect(classifyPhoenixCondition(90)).toBe('mythical-phoenix')
    expect(classifyPhoenixCondition(85)).toBe('mythical-phoenix')
  })

  it('returns soaring-bird for 70-84', () => {
    expect(classifyPhoenixCondition(75)).toBe('soaring-bird')
    expect(classifyPhoenixCondition(70)).toBe('soaring-bird')
  })

  it('returns proper-fledgling for 55-69', () => {
    expect(classifyPhoenixCondition(60)).toBe('proper-fledgling')
    expect(classifyPhoenixCondition(55)).toBe('proper-fledgling')
  })

  it('returns wounded-bird for 40-54', () => {
    expect(classifyPhoenixCondition(45)).toBe('wounded-bird')
    expect(classifyPhoenixCondition(40)).toBe('wounded-bird')
  })

  it('returns fallen-phoenix for 25-39', () => {
    expect(classifyPhoenixCondition(30)).toBe('fallen-phoenix')
    expect(classifyPhoenixCondition(25)).toBe('fallen-phoenix')
  })

  it('returns egg for below 25', () => {
    expect(classifyPhoenixCondition(20)).toBe('egg')
    expect(classifyPhoenixCondition(0)).toBe('egg')
  })
})

// ─── classifyFlockType ────────────────────────────────────────────

describe('classifyFlockType', () => {
  it('returns no-flock for empty embers', () => {
    expect(classifyFlockType([])).toBe('no-flock')
  })

  it('returns eternal-flock for high quality with high mythical ratio', () => {
    const embers = Array.from({ length: 4 }, () => ({
      qualityScore: 90, condition: 'mythical-phoenix',
    })) as PhoenixEmber[]
    expect(classifyFlockType(embers)).toBe('eternal-flock')
  })

  it('returns storm-riders for good quality', () => {
    const embers = Array.from({ length: 2 }, () => ({
      qualityScore: 65, condition: 'soaring-bird',
    })) as PhoenixEmber[]
    expect(classifyFlockType(embers)).toBe('storm-riders')
  })

  it('returns proper-flock for decent quality', () => {
    const embers = [{ qualityScore: 50, condition: 'proper-fledgling' }] as PhoenixEmber[]
    expect(classifyFlockType(embers)).toBe('proper-flock')
  })

  it('returns scattered-feathers for lower quality', () => {
    const embers = [{ qualityScore: 35, condition: 'wounded-bird' }] as PhoenixEmber[]
    expect(classifyFlockType(embers)).toBe('scattered-feathers')
  })

  it('returns no-flock for zero quality', () => {
    const embers = [{ qualityScore: 5, condition: 'egg' }] as PhoenixEmber[]
    expect(classifyFlockType(embers)).toBe('no-flock')
  })
})

// ─── classifyFlockCondition ───────────────────────────────────────

describe('classifyFlockCondition', () => {
  it('returns legendary-sky for 75+', () => {
    expect(classifyFlockCondition(80)).toBe('legendary-sky')
  })
  it('returns storm-survivors for 60-74', () => {
    expect(classifyFlockCondition(65)).toBe('storm-survivors')
  })
  it('returns decent-flight for 45-59', () => {
    expect(classifyFlockCondition(50)).toBe('decent-flight')
  })
  it('returns grounded for 30-44', () => {
    expect(classifyFlockCondition(35)).toBe('grounded')
  })
  it('returns extinguished for 15-29', () => {
    expect(classifyFlockCondition(20)).toBe('extinguished')
  })
  it('returns void for below 15', () => {
    expect(classifyFlockCondition(10)).toBe('void')
  })
})

// ─── classifyAviatorGrade ─────────────────────────────────────────

describe('classifyAviatorGrade', () => {
  it('returns phoenix-lord for 80+', () => {
    expect(classifyAviatorGrade(85)).toBe('phoenix-lord')
  })
  it('returns storm-rider for 65-79', () => {
    expect(classifyAviatorGrade(70)).toBe('storm-rider')
  })
  it('returns skilled-flyer for 50-64', () => {
    expect(classifyAviatorGrade(55)).toBe('skilled-flyer')
  })
  it('returns apprentice for 35-49', () => {
    expect(classifyAviatorGrade(40)).toBe('apprentice')
  })
  it('returns novice for 20-34', () => {
    expect(classifyAviatorGrade(25)).toBe('novice')
  })
  it('returns flightless for below 20', () => {
    expect(classifyAviatorGrade(10)).toBe('flightless')
  })
})

// ─── analyzePhoenixEmber ──────────────────────────────────────────

describe('analyzePhoenixEmber', () => {
  it('returns a complete ember analysis', () => {
    const ember = analyzePhoenixEmber(resilientContent, 'index.ts')
    expect(ember.file).toBe('index.ts')
    expect(ember.rebirthQuality).toBeGreaterThan(0)
    expect(ember.stormResilience).toBeGreaterThan(0)
    expect(ember.emberWisdom).toBeGreaterThan(0)
    expect(ember.lightningAdaptation).toBeGreaterThan(0)
    expect(ember.ashTransformation).toBeGreaterThan(0)
    expect(ember.qualityScore).toBeGreaterThan(0)
    expect(ember.condition).toBeDefined()
  })

  it('computes quality score as weighted average', () => {
    const ember = analyzePhoenixEmber(resilientContent, 'test.ts')
    const expected = Math.round(
      ember.rebirthing.quality * 0.2 +
      ember.weathering.resilience * 0.2 +
      ember.learning.wisdom * 0.2 +
      ember.adapting.adaptation * 0.2 +
      ember.transforming.transformation * 0.2,
    )
    expect(ember.qualityScore).toBe(expected)
  })

  it('returns egg for empty content', () => {
    const ember = analyzePhoenixEmber(emptyContent, 'empty.ts')
    expect(ember.qualityScore).toBe(0)
    expect(ember.condition).toBe('egg')
  })

  it('returns mythical-phoenix for resilient content', () => {
    const ember = analyzePhoenixEmber(resilientContent, 'rich.ts')
    expect(ember.condition).toBe('mythical-phoenix')
  })

  it('includes all measure objects', () => {
    const ember = analyzePhoenixEmber(resilientContent, 'test.ts')
    expect(ember.rebirthing).toBeDefined()
    expect(ember.weathering).toBeDefined()
    expect(ember.learning).toBeDefined()
    expect(ember.adapting).toBeDefined()
    expect(ember.transforming).toBeDefined()
  })
})

// ─── analyzePhoenixFlock ──────────────────────────────────────────

describe('analyzePhoenixFlock', () => {
  it('returns empty flock for no embers', () => {
    const flock = analyzePhoenixFlock([], 'src')
    expect(flock.directory).toBe('src')
    expect(flock.embers).toHaveLength(0)
    expect(flock.avgRebirth).toBe(0)
    expect(flock.flockType).toBe('no-flock')
    expect(flock.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const embers = [
      analyzePhoenixEmber(resilientContent, 'src/a.ts'),
      analyzePhoenixEmber(moderateContent, 'src/b.ts'),
    ]
    const flock = analyzePhoenixFlock(embers, 'src')
    expect(flock.avgRebirth).toBeGreaterThan(0)
    expect(flock.avgResilience).toBeGreaterThan(0)
    expect(flock.avgAdaptation).toBeGreaterThan(0)
    expect(flock.embers).toHaveLength(2)
  })

  it('counts mythical and egg embers', () => {
    const rich = analyzePhoenixEmber(resilientContent, 'src/rich.ts')
    const empty = analyzePhoenixEmber(emptyContent, 'src/empty.ts')
    const flock = analyzePhoenixFlock([rich, empty], 'src')
    expect(flock.mythicalPhoenixCount).toBe(1)
    expect(flock.eggCount).toBe(1)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  const goodStats: StormPhoenixStats = {
    totalFiles: 5, totalFlocks: 1,
    avgRebirthQuality: 80, avgStormResilience: 80,
    avgEmberWisdom: 80, avgLightningAdaptation: 80,
    avgAshTransformation: 80,
    mythicalPhoenixCount: 3, soaringBirdCount: 1,
    properFledglingCount: 1, woundedBirdCount: 0,
    fallenPhoenixCount: 0, eggCount: 0,
    hasHighQualityCount: 5, hasHighResilienceCount: 5,
    hasHighWisdomCount: 5, hasHighAdaptationCount: 5,
    hasHighTransformationCount: 5,
    overallPower: 80, aviatorGrade: 'phoenix-lord',
    bestEmber: 'a.ts', bestRebirth: 'a.ts',
    mostResilient: 'a.ts', wisest: 'a.ts', mostAdaptive: 'a.ts',
  }

  const goodStorm: StormSummary = {
    avgRebirth: 80, avgResilience: 80, avgAdaptation: 80,
    isLegendary: true, overallPower: 80,
  }

  it('returns success message when all metrics are good', () => {
    const recs = generateRecommendations([], [], goodStorm, goodStats)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs[recs.length - 1]).toContain('phoenix-lord')
  })

  it('recommends improving rebirth quality when low', () => {
    const stats = { ...goodStats, avgRebirthQuality: 40 }
    const recs = generateRecommendations([], [], goodStorm, stats)
    expect(recs.some(r => r.includes('rebirth quality'))).toBe(true)
  })

  it('recommends strengthening storm resilience when low', () => {
    const stats = { ...goodStats, avgStormResilience: 40 }
    const recs = generateRecommendations([], [], goodStorm, stats)
    expect(recs.some(r => r.includes('storm resilience'))).toBe(true)
  })

  it('recommends growing ember wisdom when low', () => {
    const stats = { ...goodStats, avgEmberWisdom: 40 }
    const recs = generateRecommendations([], [], goodStorm, stats)
    expect(recs.some(r => r.includes('ember wisdom'))).toBe(true)
  })

  it('recommends boosting lightning adaptation when low', () => {
    const stats = { ...goodStats, avgLightningAdaptation: 40 }
    const recs = generateRecommendations([], [], goodStorm, stats)
    expect(recs.some(r => r.includes('lightning adaptation'))).toBe(true)
  })

  it('recommends enhancing ash transformation when low', () => {
    const stats = { ...goodStats, avgAshTransformation: 40 }
    const recs = generateRecommendations([], [], goodStorm, stats)
    expect(recs.some(r => r.includes('ash transformation'))).toBe(true)
  })

  it('flags egg files', () => {
    const stats = { ...goodStats, eggCount: 2 }
    const recs = generateRecommendations([], [], goodStorm, stats)
    expect(recs.some(r => r.includes('eggs'))).toBe(true)
  })

  it('warns about low overall power', () => {
    const storm = { ...goodStorm, overallPower: 30 }
    const recs = generateRecommendations([], [], storm, goodStats)
    expect(recs.some(r => r.includes('storm power'))).toBe(true)
  })

  it('warns when all flocks have fallen', () => {
    const flocks: PhoenixFlock[] = [{
      directory: 'src', embers: [], avgRebirth: 0, avgResilience: 0, avgAdaptation: 0,
      mythicalPhoenixCount: 0, eggCount: 0, flockType: 'no-flock', condition: 'void',
    }]
    const recs = generateRecommendations([], flocks, goodStorm, goodStats)
    expect(recs.some(r => r.includes('resurrection'))).toBe(true)
  })

  it('lists specific egg files when few', () => {
    const embers = [
      { file: 'a.ts', condition: 'egg', qualityScore: 0 } as PhoenixEmber,
      { file: 'b.ts', condition: 'egg', qualityScore: 0 } as PhoenixEmber,
    ]
    const recs = generateRecommendations(embers, [], goodStorm, goodStats)
    expect(recs.some(r => r.includes('a.ts') && r.includes('b.ts'))).toBe(true)
  })
})

// ─── buildStormPhoenixResult ──────────────────────────────────────

describe('buildStormPhoenixResult', () => {
  it('returns complete result with empty inputs', async () => {
    const result = await buildStormPhoenixResult([], [])
    expect(result.embers).toHaveLength(0)
    expect(result.flocks).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallPower).toBe(0)
    expect(result.storm.isLegendary).toBe(false)
  })

  it('analyzes multiple files correctly', async () => {
    const result = await buildStormPhoenixResult(
      ['src/a.ts', 'src/b.ts'],
      [resilientContent, moderateContent],
    )
    expect(result.embers).toHaveLength(2)
    expect(result.flocks).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalFlocks).toBe(1)
  })

  it('groups files by directory into flocks', async () => {
    const result = await buildStormPhoenixResult(
      ['src/a.ts', 'lib/b.ts'],
      [resilientContent, moderateContent],
    )
    expect(result.flocks).toHaveLength(2)
  })

  it('computes storm summary', async () => {
    const result = await buildStormPhoenixResult(
      ['a.ts'],
      [resilientContent],
    )
    expect(result.storm.avgRebirth).toBeGreaterThan(0)
    expect(result.storm.avgResilience).toBeGreaterThan(0)
    expect(result.storm.avgAdaptation).toBeGreaterThan(0)
    expect(result.storm.overallPower).toBeGreaterThan(0)
    expect(result.storm.isLegendary).toBe(true)
  })

  it('computes stats correctly', async () => {
    const result = await buildStormPhoenixResult(
      ['a.ts', 'b.ts'],
      [resilientContent, emptyContent],
    )
    expect(result.stats.avgRebirthQuality).toBeGreaterThan(0)
    expect(result.stats.avgStormResilience).toBeGreaterThan(0)
    expect(result.stats.avgEmberWisdom).toBeGreaterThan(0)
    expect(result.stats.avgLightningAdaptation).toBeGreaterThan(0)
    expect(result.stats.avgAshTransformation).toBeGreaterThan(0)
    expect(result.stats.mythicalPhoenixCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.eggCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best files', async () => {
    const result = await buildStormPhoenixResult(
      ['a.ts', 'b.ts'],
      [resilientContent, moderateContent],
    )
    expect(result.stats.bestEmber).toBe('a.ts')
    expect(result.stats.bestRebirth).toBe('a.ts')
    expect(result.stats.mostResilient).toBe('a.ts')
    expect(result.stats.wisest).toBe('a.ts')
    expect(result.stats.mostAdaptive).toBe('a.ts')
  })

  it('generates recommendations', async () => {
    const result = await buildStormPhoenixResult(
      ['a.ts'],
      [emptyContent],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes aviator grade', async () => {
    const result = await buildStormPhoenixResult(
      ['a.ts'],
      [resilientContent],
    )
    expect(result.stats.aviatorGrade).toBeDefined()
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for each tier', () => {
    expect(typeof colorScore(90)).toBe('string')
    expect(typeof colorScore(70)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(30)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for known grades', () => {
    expect(typeof colorGrade('mythical-phoenix')).toBe('string')
    expect(typeof colorGrade('egg')).toBe('string')
  })
  it('returns a string for unknown grades', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatEmberTable', () => {
  it('formats an ember without error', () => {
    const ember = analyzePhoenixEmber(resilientContent, 'index.ts')
    const result = formatEmberTable(ember)
    expect(result).toContain('index.ts')
    expect(result).toContain('Rebirth Quality')
    expect(result).toContain('Score')
  })
})

describe('formatEmbersTable', () => {
  it('returns empty message for no embers', () => {
    expect(formatEmbersTable([])).toContain('No phoenix embers found')
  })
  it('formats multiple embers', () => {
    const embers = [
      analyzePhoenixEmber(resilientContent, 'a.ts'),
      analyzePhoenixEmber(moderateContent, 'b.ts'),
    ]
    const result = formatEmbersTable(embers)
    expect(result).toContain('Storm Phoenix Analysis')
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatFlockTable', () => {
  it('formats a flock', () => {
    const flock = analyzePhoenixFlock([analyzePhoenixEmber(resilientContent, 'a.ts')], 'src')
    const result = formatFlockTable(flock)
    expect(result).toContain('src')
    expect(result).toContain('Type:')
    expect(result).toContain('Embers:')
  })
})

describe('formatFlocksTable', () => {
  it('returns empty message for no flocks', () => {
    expect(formatFlocksTable([])).toContain('No phoenix flocks found')
  })
})

describe('formatStatsTable', () => {
  it('formats stats correctly', async () => {
    const result = await buildStormPhoenixResult(['a.ts'], [resilientContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Storm Phoenix Statistics')
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Aviator Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns empty message for no recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations with bullets', () => {
    const recs = formatRecommendations(['First recommendation', 'Second recommendation'])
    expect(recs).toContain('Recommendations')
    expect(recs).toContain('First recommendation')
  })
})

describe('formatResultTable', () => {
  it('formats full result as table', async () => {
    const result = await buildStormPhoenixResult(['a.ts'], [resilientContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Storm Phoenix Analysis')
    expect(formatted).toContain('Phoenix Flocks')
    expect(formatted).toContain('Storm Phoenix Statistics')
    expect(formatted).toContain('Storm')
    expect(formatted).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats full result as JSON', async () => {
    const result = await buildStormPhoenixResult(['a.ts'], [resilientContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.embers).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.storm).toBeDefined()
  })
})
