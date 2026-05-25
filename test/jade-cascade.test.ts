import { describe, it, expect } from 'vitest'
import {
  measureFlowing,
  measureCascading,
  measurePooling,
  measureMisting,
  measureCarrying,
  classifyJadeCondition,
  classifyPoolType,
  classifyGardenerGrade,
  classifyPoolCondition,
  analyzeJadeDrop,
  analyzeJadePool,
  buildJadeWaterfallResult,
  generateRecommendations,
} from '../src/commands/jade-cascade-helpers.js'
import {
  colorScore,
  colorCondition,
  formatDropTable,
  formatDropsTable,
  formatPoolTable,
  formatPoolsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/jade-cascade-format-helpers.js'

// ─── Test Fixtures ──────────────────────────────────────────────────

const minimalContent = 'const x = 1'

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

export const processItems = (items: string[]) => items.map(i => i.trim()).filter(Boolean)
`

// ─── measureFlowing ─────────────────────────────────────────────────

describe('measureFlowing', () => {
  it('returns 0 for empty content', () => {
    const m = measureFlowing('')
    expect(m.grace).toBe(0)
    expect(m.current).toBe('no-flow')
    expect(m.hasHighGrace).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureFlowing(minimalContent)
    expect(m.grace).toBe(0)
    expect(m.current).toBe('no-flow')
    expect(m.hasReadable).toBe(false)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasNoCircuits).toBe(true)
    expect(m.tangledCount).toBe(0)
    expect(m.circuitCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureFlowing(richContent)
    expect(m.grace).toBe(100)
    expect(m.current).toBe('perfect-flow')
    expect(m.hasHighGrace).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasDirect).toBe(true)
    expect(m.hasCleanPipelines).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasSmooth).toBe(true)
    expect(m.hasNatural).toBe(true)
  })

  it('detects tangled var usage', () => {
    const m = measureFlowing('var x = 1')
    expect(m.tangledCount).toBe(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects circuit any usage', () => {
    const m = measureFlowing('const x: any = 1')
    expect(m.circuitCount).toBe(1)
    expect(m.hasNoCircuits).toBe(false)
  })

  it('hasPredictable is true for clean content', () => {
    const m = measureFlowing('export function clean(): Result { return {} }')
    expect(m.hasPredictable).toBe(true)
  })

  it('hasPredictable is false for eval content', () => {
    const m = measureFlowing('eval("1")')
    expect(m.hasPredictable).toBe(false)
  })
})

// ─── measureCascading ───────────────────────────────────────────────

describe('measureCascading', () => {
  it('returns 0 for empty content', () => {
    const m = measureCascading('')
    expect(m.clarity).toBe(0)
    expect(m.step).toBe('no-clarity')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureCascading(minimalContent)
    expect(m.clarity).toBe(0)
    expect(m.step).toBe('no-clarity')
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasNoMystery).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.mysteryCount).toBe(0)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureCascading(richContent)
    expect(m.clarity).toBe(100)
    expect(m.step).toBe('crystal-steps')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasExplained).toBe(true)
    expect(m.hasRevealed).toBe(true)
  })

  it('detects mystery eval usage', () => {
    const m = measureCascading('eval("1")')
    expect(m.mysteryCount).toBe(1)
    expect(m.hasNoMystery).toBe(false)
  })

  it('detects obfuscated any usage', () => {
    const m = measureCascading('const x: any = 1')
    expect(m.obfuscatedCount).toBe(1)
    expect(m.hasNoObfuscated).toBe(false)
  })
})

// ─── measurePooling ─────────────────────────────────────────────────

describe('measurePooling', () => {
  it('returns 0 for empty content', () => {
    const m = measurePooling('')
    expect(m.depth).toBe(0)
    expect(m.pool).toBe('no-depth')
    expect(m.hasHighDepth).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measurePooling(minimalContent)
    expect(m.depth).toBe(0)
    expect(m.pool).toBe('no-depth')
    expect(m.hasWellArchitected).toBe(false)
    expect(m.hasNoHacked).toBe(true)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.hackedCount).toBe(0)
    expect(m.adHocCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measurePooling(richContent)
    expect(m.depth).toBe(100)
    expect(m.pool).toBe('ancient-depth')
    expect(m.hasHighDepth).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasStrategic).toBe(true)
  })

  it('detects hacked var usage', () => {
    const m = measurePooling('var x = 1')
    expect(m.hackedCount).toBe(1)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects ad-hoc any usage', () => {
    const m = measurePooling('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })
})

// ─── measureMisting ─────────────────────────────────────────────────

describe('measureMisting', () => {
  it('returns 0 for empty content', () => {
    const m = measureMisting('')
    expect(m.purity).toBe(0)
    expect(m.mist).toBe('no-mist')
    expect(m.hasHighPurity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureMisting(minimalContent)
    expect(m.purity).toBe(0)
    expect(m.mist).toBe('no-mist')
    expect(m.hasClean).toBe(true)
    expect(m.hasNoLeaky).toBe(true)
    expect(m.leakyCount).toBe(0)
    expect(m.untestedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureMisting(richContent)
    expect(m.purity).toBe(100)
    expect(m.mist).toBe('pure-vapor')
    expect(m.hasHighPurity).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasAbstracted).toBe(true)
    expect(m.hasEncapsulated).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasPolished).toBe(true)
  })

  it('detects leaky any usage', () => {
    const m = measureMisting('const x: any = 1')
    expect(m.leakyCount).toBe(1)
    expect(m.hasNoLeaky).toBe(false)
  })

  it('detects untested var usage', () => {
    const m = measureMisting('var x = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
  })
})

// ─── measureCarrying ────────────────────────────────────────────────

describe('measureCarrying', () => {
  it('returns 0 for empty content', () => {
    const m = measureCarrying('')
    expect(m.wisdom).toBe(0)
    expect(m.river).toBe('no-river')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureCarrying(minimalContent)
    expect(m.wisdom).toBe(0)
    expect(m.river).toBe('no-river')
    expect(m.hasExported).toBe(false)
    expect(m.hasNoIsolated).toBe(false)
    expect(m.hasNoSingleUse).toBe(true)
    expect(m.isolatedCount).toBe(1)
    expect(m.singleUseCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureCarrying(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.river).toBe('ancient-river')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasExported).toBe(true)
    expect(m.hasReusable).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasExtensible).toBe(true)
    expect(m.hasValuable).toBe(true)
    expect(m.hasMaintained).toBe(true)
    expect(m.hasImpactful).toBe(true)
    expect(m.hasEnduring).toBe(true)
  })

  it('detects isolated unexported code', () => {
    const m = measureCarrying('function internal() {}')
    expect(m.isolatedCount).toBe(1)
    expect(m.hasNoIsolated).toBe(false)
  })

  it('detects single-use var usage', () => {
    const m = measureCarrying('var x = 1')
    expect(m.singleUseCount).toBe(1)
    expect(m.hasNoSingleUse).toBe(false)
  })
})

// ─── classifyJadeCondition ──────────────────────────────────────────

describe('classifyJadeCondition', () => {
  it('classifies jade-masterpiece for 90+', () => {
    expect(classifyJadeCondition(90)).toBe('jade-masterpiece')
    expect(classifyJadeCondition(100)).toBe('jade-masterpiece')
  })

  it('classifies emerald-falls for 75-89', () => {
    expect(classifyJadeCondition(75)).toBe('emerald-falls')
    expect(classifyJadeCondition(89)).toBe('emerald-falls')
  })

  it('classifies proper-waterfall for 60-74', () => {
    expect(classifyJadeCondition(60)).toBe('proper-waterfall')
    expect(classifyJadeCondition(74)).toBe('proper-waterfall')
  })

  it('classifies murky-stream for 40-59', () => {
    expect(classifyJadeCondition(40)).toBe('murky-stream')
    expect(classifyJadeCondition(59)).toBe('murky-stream')
  })

  it('classifies dry-creek for 20-39', () => {
    expect(classifyJadeCondition(20)).toBe('dry-creek')
    expect(classifyJadeCondition(39)).toBe('dry-creek')
  })

  it('classifies void for 0-19', () => {
    expect(classifyJadeCondition(0)).toBe('void')
    expect(classifyJadeCondition(19)).toBe('void')
  })
})

// ─── classifyPoolType ───────────────────────────────────────────────

describe('classifyPoolType', () => {
  it('returns no-pool for empty drops', () => {
    expect(classifyPoolType([])).toBe('no-pool')
  })

  it('classifies grand-waterfall for high avg', () => {
    const drops = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeJadeDrop(richContent, `f${i}.ts`),
    }))
    expect(classifyPoolType(drops)).toBe('grand-waterfall')
  })

  it('classifies no-pool for low scores', () => {
    const drops = [analyzeJadeDrop('', 'a.ts')]
    expect(classifyPoolType(drops)).toBe('no-pool')
  })

  it('classifies jade-cascade for mid-high scores', () => {
    const drops = Array.from({ length: 3 }, () => ({
      ...analyzeJadeDrop(richContent, 'f.ts'),
      qualityScore: 75,
      condition: 'emerald-falls' as const,
    }))
    expect(classifyPoolType(drops)).toBe('jade-cascade')
  })

  it('classifies proper-pool for mid scores', () => {
    const drops = Array.from({ length: 3 }, () => ({
      ...analyzeJadeDrop(richContent, 'f.ts'),
      qualityScore: 60,
      condition: 'proper-waterfall' as const,
    }))
    expect(classifyPoolType(drops)).toBe('proper-pool')
  })

  it('classifies small-stream for low scores', () => {
    const drops = Array.from({ length: 3 }, () => ({
      ...analyzeJadeDrop(richContent, 'f.ts'),
      qualityScore: 36,
      condition: 'murky-stream' as const,
    }))
    expect(classifyPoolType(drops)).toBe('small-stream')
  })

  it('classifies dry-bed for very low scores', () => {
    const drops = Array.from({ length: 3 }, () => ({
      ...analyzeJadeDrop(richContent, 'f.ts'),
      qualityScore: 18,
      condition: 'void' as const,
    }))
    expect(classifyPoolType(drops)).toBe('dry-bed')
  })
})

// ─── classifyGardenerGrade ──────────────────────────────────────────

describe('classifyGardenerGrade', () => {
  it('classifies jade-master for 80+', () => {
    expect(classifyGardenerGrade(80)).toBe('jade-master')
    expect(classifyGardenerGrade(100)).toBe('jade-master')
  })

  it('classifies water-keeper for 65-79', () => {
    expect(classifyGardenerGrade(65)).toBe('water-keeper')
    expect(classifyGardenerGrade(79)).toBe('water-keeper')
  })

  it('classifies stream-tender for 50-64', () => {
    expect(classifyGardenerGrade(50)).toBe('stream-tender')
    expect(classifyGardenerGrade(64)).toBe('stream-tender')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyGardenerGrade(35)).toBe('apprentice')
    expect(classifyGardenerGrade(49)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyGardenerGrade(20)).toBe('novice')
    expect(classifyGardenerGrade(34)).toBe('novice')
  })

  it('classifies drought-bringer for 0-19', () => {
    expect(classifyGardenerGrade(0)).toBe('drought-bringer')
    expect(classifyGardenerGrade(19)).toBe('drought-bringer')
  })
})

// ─── classifyPoolCondition ──────────────────────────────────────────

describe('classifyPoolCondition', () => {
  it('classifies jade-paradise for 85+', () => {
    expect(classifyPoolCondition(85)).toBe('jade-paradise')
  })

  it('classifies emerald-pool for 70-84', () => {
    expect(classifyPoolCondition(70)).toBe('emerald-pool')
  })

  it('classifies proper-waterfall for 55-69', () => {
    expect(classifyPoolCondition(55)).toBe('proper-waterfall')
  })

  it('classifies murky-stream for 35-54', () => {
    expect(classifyPoolCondition(35)).toBe('murky-stream')
  })

  it('classifies dry-creek for 15-34', () => {
    expect(classifyPoolCondition(15)).toBe('dry-creek')
  })

  it('classifies void for 0-14', () => {
    expect(classifyPoolCondition(0)).toBe('void')
  })
})

// ─── analyzeJadeDrop ────────────────────────────────────────────────

describe('analyzeJadeDrop', () => {
  it('analyzes minimal content', () => {
    const drop = analyzeJadeDrop(minimalContent, 'minimal.ts')
    expect(drop.file).toBe('minimal.ts')
    expect(drop.flowGrace).toBe(0)
    expect(drop.cascadeClarity).toBe(0)
    expect(drop.poolDepth).toBe(0)
    expect(drop.mistPurity).toBe(0)
    expect(drop.riverWisdom).toBe(0)
    expect(drop.qualityScore).toBe(0)
    expect(drop.condition).toBe('void')
    expect(drop.flowing.current).toBe('no-flow')
    expect(drop.cascading.step).toBe('no-clarity')
    expect(drop.pooling.pool).toBe('no-depth')
    expect(drop.misting.mist).toBe('no-mist')
    expect(drop.carrying.river).toBe('no-river')
  })

  it('analyzes rich content', () => {
    const drop = analyzeJadeDrop(richContent, 'rich.ts')
    expect(drop.file).toBe('rich.ts')
    expect(drop.flowGrace).toBe(100)
    expect(drop.cascadeClarity).toBe(100)
    expect(drop.poolDepth).toBe(100)
    expect(drop.mistPurity).toBe(100)
    expect(drop.riverWisdom).toBe(100)
    expect(drop.qualityScore).toBe(100)
    expect(drop.condition).toBe('jade-masterpiece')
    expect(drop.flowing.current).toBe('perfect-flow')
    expect(drop.cascading.step).toBe('crystal-steps')
    expect(drop.pooling.pool).toBe('ancient-depth')
    expect(drop.misting.mist).toBe('pure-vapor')
    expect(drop.carrying.river).toBe('ancient-river')
  })

  it('computes qualityScore as weighted average', () => {
    const drop = analyzeJadeDrop('export const x = 1', 'mid.ts')
    const expected = Math.round(
      drop.flowGrace * 0.2 +
      drop.cascadeClarity * 0.2 +
      drop.poolDepth * 0.2 +
      drop.mistPurity * 0.2 +
      drop.riverWisdom * 0.2,
    )
    expect(drop.qualityScore).toBe(expected)
  })
})

// ─── analyzeJadePool ────────────────────────────────────────────────

describe('analyzeJadePool', () => {
  it('returns empty pool for empty drops', () => {
    const pool = analyzeJadePool([], 'empty-dir')
    expect(pool.directory).toBe('empty-dir')
    expect(pool.drops).toHaveLength(0)
    expect(pool.avgGrace).toBe(0)
    expect(pool.poolType).toBe('no-pool')
    expect(pool.condition).toBe('void')
  })

  it('analyzes pool with rich drops', () => {
    const drops = [
      analyzeJadeDrop(richContent, 'dir/a.ts'),
      analyzeJadeDrop(richContent, 'dir/b.ts'),
    ]
    const pool = analyzeJadePool(drops, 'dir')
    expect(pool.avgGrace).toBe(100)
    expect(pool.jadeMasterpieceCount).toBe(2)
    expect(pool.voidCount).toBe(0)
    expect(pool.poolType).toBe('grand-waterfall')
  })

  it('analyzes pool with mixed drops', () => {
    const drops = [
      analyzeJadeDrop(richContent, 'dir/a.ts'),
      analyzeJadeDrop(minimalContent, 'dir/b.ts'),
    ]
    const pool = analyzeJadePool(drops, 'dir')
    expect(pool.jadeMasterpieceCount).toBe(1)
    expect(pool.voidCount).toBe(1)
  })
})

// ─── buildJadeWaterfallResult ───────────────────────────────────────

describe('buildJadeWaterfallResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildJadeWaterfallResult([], [])
    expect(result.drops).toHaveLength(0)
    expect(result.pools).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallFlow).toBe(0)
    expect(result.stats.gardenerGrade).toBe('drought-bringer')
    expect(result.river.isJade).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildJadeWaterfallResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.drops).toHaveLength(2)
    expect(result.pools).toHaveLength(1)
    expect(result.stats.avgFlowGrace).toBe(100)
    expect(result.stats.avgCascadeClarity).toBe(100)
    expect(result.stats.avgPoolDepth).toBe(100)
    expect(result.stats.avgMistPurity).toBe(100)
    expect(result.stats.avgRiverWisdom).toBe(100)
    expect(result.stats.jadeMasterpieceCount).toBe(2)
    expect(result.stats.voidCount).toBe(0)
    expect(result.stats.hasHighGraceCount).toBe(2)
    expect(result.stats.hasHighClarityCount).toBe(2)
    expect(result.stats.hasHighDepthCount).toBe(2)
    expect(result.stats.hasHighPurityCount).toBe(2)
    expect(result.stats.hasHighWisdomCount).toBe(2)
    expect(result.stats.overallFlow).toBe(100)
    expect(result.stats.gardenerGrade).toBe('jade-master')
    expect(result.river.isJade).toBe(true)
    expect(result.stats.bestDrop).toBeTruthy()
    expect(result.stats.mostGraceful).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.deepest).toBeTruthy()
    expect(result.stats.purest).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildJadeWaterfallResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.pools).toHaveLength(2)
    const dirs = result.pools.map(p => p.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall flow correctly', async () => {
    const result = await buildJadeWaterfallResult(['a.ts'], [minimalContent])
    expect(result.river.overallFlow).toBe(0)
  })

  it('sets isJade when overallFlow >= 60', async () => {
    const result = await buildJadeWaterfallResult(['a.ts'], [richContent])
    expect(result.river.isJade).toBe(true)
  })

  it('sets isJade false when overallFlow < 60', async () => {
    const result = await buildJadeWaterfallResult(['a.ts'], [minimalContent])
    expect(result.river.isJade).toBe(false)
  })

  it('picks best drop by qualityScore', async () => {
    const result = await buildJadeWaterfallResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestDrop).toBe('high.ts')
    expect(result.stats.mostGraceful).toBe('high.ts')
    expect(result.stats.clearest).toBe('high.ts')
    expect(result.stats.deepest).toBe('high.ts')
    expect(result.stats.purest).toBe('high.ts')
    expect(result.stats.wisest).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildJadeWaterfallResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.jadeMasterpieceCount).toBe(1)
    expect(result.stats.voidCount).toBe(1)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildJadeWaterfallResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your jade waterfall flows with perfection! Every drop is wisdom, every cascade is clarity',
    ])
  })

  it('recommends improving flow grace when low', async () => {
    const result = await buildJadeWaterfallResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('flow grace'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving cascade clarity when low', async () => {
    const result = await buildJadeWaterfallResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('cascade clarity'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving pool depth when low', async () => {
    const result = await buildJadeWaterfallResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('pool'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving mist purity when low', async () => {
    const result = await buildJadeWaterfallResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('mist'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving river wisdom when low', async () => {
    const result = await buildJadeWaterfallResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('river wisdom'))
    expect(rec).toBeTruthy()
  })

  it('warns about dry creeks', async () => {
    const result = await buildJadeWaterfallResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('dry creek') || r.includes('Restore'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall flow', async () => {
    const result = await buildJadeWaterfallResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('flow'))
    expect(rec).toBeTruthy()
  })

  it('lists specific dry creeks to restore', async () => {
    const result = await buildJadeWaterfallResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Restore these'))
    expect(rec).toBeTruthy()
  })

  it('warns when all pools are dry-bed/no-pool', async () => {
    const result = await buildJadeWaterfallResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('dry') || r.includes('empty') || r.includes('dead code'))
    expect(rec).toBeTruthy()
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for score 90', () => {
    expect(typeof colorScore(90)).toBe('string')
  })

  it('returns a string for score 50', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns a string for score 10', () => {
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns a string for jade-masterpiece', () => {
    expect(typeof colorCondition('jade-masterpiece')).toBe('string')
  })

  it('returns a string for void', () => {
    expect(typeof colorCondition('void')).toBe('string')
  })

  it('returns a string for unknown condition', () => {
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('formatDropTable', () => {
  it('formats a drop', () => {
    const drop = analyzeJadeDrop(richContent, 'test.ts')
    const output = formatDropTable(drop)
    expect(output).toContain('test.ts')
    expect(output).toContain('Flow Grace')
    expect(output).toContain('Cascade Clarity')
    expect(output).toContain('Pool Depth')
    expect(output).toContain('Mist Purity')
    expect(output).toContain('River Wisdom')
  })
})

describe('formatDropsTable', () => {
  it('handles empty drops', () => {
    const output = formatDropsTable([])
    expect(output).toContain('No jade drops')
  })

  it('formats multiple drops', () => {
    const drops = [
      analyzeJadeDrop(richContent, 'a.ts'),
      analyzeJadeDrop(minimalContent, 'b.ts'),
    ]
    const output = formatDropsTable(drops)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatPoolTable', () => {
  it('formats a pool', () => {
    const drops = [analyzeJadeDrop(richContent, 'dir/a.ts')]
    const pool = analyzeJadePool(drops, 'dir')
    const output = formatPoolTable(pool)
    expect(output).toContain('dir')
    expect(output).toContain('Pool')
  })
})

describe('formatPoolsTable', () => {
  it('handles empty pools', () => {
    const output = formatPoolsTable([])
    expect(output).toContain('No jade pools')
  })

  it('formats multiple pools', () => {
    const drops = [analyzeJadeDrop(richContent, 'src/a.ts')]
    const pools = [analyzeJadePool(drops, 'src')]
    const output = formatPoolsTable(pools)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildJadeWaterfallResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Jade Waterfall Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Gardener Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildJadeWaterfallResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Jade Waterfall Analysis')
    expect(output).toContain('Jade Drops')
    expect(output).toContain('Jade Pools')
    expect(output).toContain('River Overview')
    expect(output).toContain('Jade Waterfall Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildJadeWaterfallResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.drops).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.river.isJade).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const drop = analyzeJadeDrop('   \n\t  ', 'blank.ts')
    expect(drop.flowGrace).toBe(0)
    expect(drop.qualityScore).toBe(0)
    expect(drop.condition).toBe('void')
  })

  it('handles content with only comments', () => {
    const drop = analyzeJadeDrop('// just a comment\n/* block */', 'comment.ts')
    expect(drop.flowGrace).toBe(0)
    expect(drop.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildJadeWaterfallResult(['big.ts'], [longContent])
    expect(result.drops).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildJadeWaterfallResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.jadeMasterpieceCount).toBe(50)
  })

  it('handles single file pool', async () => {
    const result = await buildJadeWaterfallResult(['single.ts'], [richContent])
    expect(result.pools).toHaveLength(1)
    expect(result.pools[0]!.drops).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const drop = analyzeJadeDrop(richContent, 'cap.ts')
    expect(drop.qualityScore).toBeLessThanOrEqual(100)
    expect(drop.flowGrace).toBeLessThanOrEqual(100)
    expect(drop.cascadeClarity).toBeLessThanOrEqual(100)
    expect(drop.poolDepth).toBeLessThanOrEqual(100)
    expect(drop.mistPurity).toBeLessThanOrEqual(100)
    expect(drop.riverWisdom).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildJadeWaterfallResult([], [])
    const r2 = await buildJadeWaterfallResult(['a.ts'], [richContent])
    const r3 = await buildJadeWaterfallResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
