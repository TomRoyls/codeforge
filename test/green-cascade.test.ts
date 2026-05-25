import { describe, expect, it } from 'vitest'

import {
  analyzeJadeDrop,
  analyzeJadeStream,
  buildJadeCascadeResult,
  classifyJadeCondition,
  classifyStreamType,
  classifyStreamCondition,
  classifyGardenerGrade,
  generateRecommendations,
  measureFlowing,
  measureClarifying,
  measureDeepening,
  measurePurifying,
  measureAccumulating,
  type JadeCondition,
  type StreamCondition,
  type JadeDrop,
  type JadeCascadeResult,
  type JadeStream,
} from '../src/commands/green-cascade-helpers.js'

import {
  colorJadeCondition,
  colorStreamCondition,
  colorScore,
  formatDropTable,
  formatDropsTable,
  formatStreamsTable,
  formatStreamTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/green-cascade-format-helpers.js'

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

// ─── measureFlowing ─────────────────────────────────────

describe('measureFlowing', () => {
  it('scores rich content high', () => {
    const m = measureFlowing(richContent)
    expect(m.grace).toBeGreaterThanOrEqual(60)
    expect(m.hasHighGrace).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureFlowing(emptyContent)
    expect(m.grace).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureFlowing(richContent)
    const poor = measureFlowing(poorContent)
    expect(rich.grace).toBeGreaterThan(poor.grace)
  })

  it('detects dirty patterns', () => {
    const m = measureFlowing('var x = eval("boom")')
    expect(m.dirtyCount).toBeGreaterThan(0)
    expect(m.hasNoDirty).toBe(false)
  })

  it('assigns high current for rich content', () => {
    const m = measureFlowing(richContent)
    expect(['perfect-flow', 'graceful-stream', 'proper-current']).toContain(m.current)
  })

  it('assigns low current for empty content', () => {
    const m = measureFlowing(emptyContent)
    expect(['no-grace', 'stagnant-pool', 'rough-water', 'proper-current']).toContain(m.current)
  })

  it('has all boolean properties', () => {
    const m = measureFlowing(richContent)
    expect(typeof m.hasClean).toBe('boolean')
    expect(typeof m.hasOptimized).toBe('boolean')
  })
})

// ─── measureClarifying ──────────────────────────────────

describe('measureClarifying', () => {
  it('scores rich content high', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(60)
    expect(m.hasHighClarity).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureClarifying(emptyContent)
    expect(m.clarity).toBeGreaterThanOrEqual(0)
  })

  it('detects cryptic patterns', () => {
    const m = measureClarifying('cryptic obfuscate minified')
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated patterns', () => {
    const m = measureClarifying('var x = eval("1")')
    expect(m.obfuscatedCount).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('assigns high cascade for rich content', () => {
    const m = measureClarifying(richContent)
    expect(['crystal-pool', 'clear-stream', 'proper-water']).toContain(m.cascade)
  })

  it('assigns low cascade for empty content', () => {
    const m = measureClarifying(emptyContent)
    expect(['no-clarity', 'muddy-puddle', 'murky-creek', 'proper-water']).toContain(m.cascade)
  })

  it('has all boolean properties', () => {
    const m = measureClarifying(richContent)
    expect(typeof m.hasReadable).toBe('boolean')
    expect(typeof m.hasPure).toBe('boolean')
  })
})

// ─── measureDeepening ───────────────────────────────────

describe('measureDeepening', () => {
  it('scores rich content high', () => {
    const m = measureDeepening(richContent)
    expect(m.depth).toBeGreaterThanOrEqual(60)
    expect(m.hasHighDepth).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureDeepening(emptyContent)
    expect(m.depth).toBeGreaterThanOrEqual(0)
  })

  it('detects hacked patterns', () => {
    const m = measureDeepening('hack workaround kludge')
    expect(m.hackedCount).toBeGreaterThan(0)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects shallow patterns', () => {
    const m = measureDeepening('shallow superficial trivial')
    expect(m.shallowCount).toBeGreaterThan(0)
    expect(m.hasNoShallow).toBe(false)
  })

  it('assigns high pool for rich content', () => {
    const m = measureDeepening(richContent)
    expect(['bottomless-pool', 'deep-basin', 'proper-depth']).toContain(m.pool)
  })

  it('assigns low pool for empty content', () => {
    const m = measureDeepening(emptyContent)
    expect(['no-depth', 'dry-bed', 'shallow-pan', 'proper-depth']).toContain(m.pool)
  })

  it('has all boolean properties', () => {
    const m = measureDeepening(richContent)
    expect(typeof m.hasWellArchitected).toBe('boolean')
    expect(typeof m.hasRich).toBe('boolean')
  })
})

// ─── measurePurifying ───────────────────────────────────

describe('measurePurifying', () => {
  it('scores rich content high', () => {
    const m = measurePurifying(richContent)
    expect(m.purity).toBeGreaterThanOrEqual(60)
    expect(m.hasHighPurity).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measurePurifying(emptyContent)
    expect(m.purity).toBeGreaterThanOrEqual(0)
  })

  it('detects unsafe patterns', () => {
    const m = measurePurifying('var x = eval("1")')
    expect(m.unsafeCount).toBeGreaterThan(0)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects contradictory patterns', () => {
    const m = measurePurifying('contradictory inconsistent paradox')
    expect(m.contradictoryCount).toBeGreaterThan(0)
    expect(m.hasNoContradictory).toBe(false)
  })

  it('assigns high mist for rich content', () => {
    const m = measurePurifying(richContent)
    expect(['purest-vapor', 'clean-mist', 'proper-fog']).toContain(m.mist)
  })

  it('assigns low mist for empty content', () => {
    const m = measurePurifying(emptyContent)
    expect(['no-purity', 'toxic-cloud', 'smog', 'proper-fog']).toContain(m.mist)
  })

  it('has all boolean properties', () => {
    const m = measurePurifying(richContent)
    expect(typeof m.hasTypeSafe).toBe('boolean')
    expect(typeof m.hasUndiluted).toBe('boolean')
  })
})

// ─── measureAccumulating ────────────────────────────────

describe('measureAccumulating', () => {
  it('scores rich content high', () => {
    const m = measureAccumulating(richContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(60)
    expect(m.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureAccumulating(emptyContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
  })

  it('detects naive patterns', () => {
    const m = measureAccumulating('naive simplistic amateur')
    expect(m.naiveCount).toBeGreaterThan(0)
  })

  it('detects rigid patterns', () => {
    const m = measureAccumulating('rigid inflexible brittle')
    expect(m.rigidCount).toBeGreaterThan(0)
  })

  it('assigns high river for rich content', () => {
    const m = measureAccumulating(richContent)
    expect(['ancient-river', 'wise-stream', 'proper-creek']).toContain(m.river)
  })

  it('assigns low river for empty content', () => {
    const m = measureAccumulating(emptyContent)
    expect(['no-wisdom', 'dry-wash', 'seasonal-brook', 'proper-creek']).toContain(m.river)
  })

  it('has all boolean properties', () => {
    const m = measureAccumulating(richContent)
    expect(typeof m.hasWellArchitected).toBe('boolean')
    expect(typeof m.hasWise).toBe('boolean')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyJadeCondition', () => {
  it('classifies 90+ as jade-masterpiece', () => { expect(classifyJadeCondition(90)).toBe('jade-masterpiece') })
  it('classifies 75-89 as perfect-flow', () => { expect(classifyJadeCondition(75)).toBe('perfect-flow') })
  it('classifies 60-74 as proper-stream', () => { expect(classifyJadeCondition(60)).toBe('proper-stream') })
  it('classifies 40-59 as murky-water', () => { expect(classifyJadeCondition(40)).toBe('murky-water') })
  it('classifies 20-39 as dry-bed', () => { expect(classifyJadeCondition(20)).toBe('dry-bed') })
  it('classifies below 20 as void', () => { expect(classifyJadeCondition(0)).toBe('void') })
})

describe('classifyStreamType', () => {
  it('returns no-stream for empty drops', () => {
    expect(classifyStreamType([])).toBe('no-stream')
  })
  it('returns great-river for high quality', () => {
    const drops = [{ qualityScore: 90 } as JadeDrop, { qualityScore: 85 } as JadeDrop]
    expect(classifyStreamType(drops)).toBe('great-river')
  })
  it('returns jade-stream for good quality', () => {
    const drops = [{ qualityScore: 70 } as JadeDrop, { qualityScore: 75 } as JadeDrop]
    expect(classifyStreamType(drops)).toBe('jade-stream')
  })
  it('returns proper-creek for decent quality', () => {
    const drops = [{ qualityScore: 55 } as JadeDrop, { qualityScore: 60 } as JadeDrop]
    expect(classifyStreamType(drops)).toBe('proper-creek')
  })
  it('returns trickle for low quality', () => {
    const drops = [{ qualityScore: 35 } as JadeDrop, { qualityScore: 40 } as JadeDrop]
    expect(classifyStreamType(drops)).toBe('trickle')
  })
  it('returns dry-bed for very low quality', () => {
    const drops = [{ qualityScore: 10 } as JadeDrop, { qualityScore: 15 } as JadeDrop]
    expect(classifyStreamType(drops)).toBe('dry-bed')
  })
})

describe('classifyStreamCondition', () => {
  it('classifies 85+ as jade-garden', () => { expect(classifyStreamCondition(85)).toBe('jade-garden') })
  it('classifies 70-84 as flowing-sanctuary', () => { expect(classifyStreamCondition(70)).toBe('flowing-sanctuary') })
  it('classifies 55-69 as proper-pond', () => { expect(classifyStreamCondition(55)).toBe('proper-pond') })
  it('classifies 35-54 as stagnant-pool', () => { expect(classifyStreamCondition(35)).toBe('stagnant-pool') })
  it('classifies 15-34 as desert', () => { expect(classifyStreamCondition(15)).toBe('desert') })
  it('classifies below 15 as void', () => { expect(classifyStreamCondition(0)).toBe('void') })
})

describe('classifyGardenerGrade', () => {
  it('classifies 80+ as zen-master', () => { expect(classifyGardenerGrade(80)).toBe('zen-master') })
  it('classifies 65-79 as garden-keeper', () => { expect(classifyGardenerGrade(65)).toBe('garden-keeper') })
  it('classifies 50-64 as proper-cultivator', () => { expect(classifyGardenerGrade(50)).toBe('proper-cultivator') })
  it('classifies 35-49 as apprentice', () => { expect(classifyGardenerGrade(35)).toBe('apprentice') })
  it('classifies 20-34 as novice', () => { expect(classifyGardenerGrade(20)).toBe('novice') })
  it('classifies below 20 as drought-bringer', () => { expect(classifyGardenerGrade(0)).toBe('drought-bringer') })
})

// ─── analyzeJadeDrop ────────────────────────────────────

describe('analyzeJadeDrop', () => {
  it('analyzes a file and returns all measures', () => {
    const d = analyzeJadeDrop(richContent, 'app.ts')
    expect(d.file).toBe('app.ts')
    expect(d.flowGrace).toBeGreaterThanOrEqual(0)
    expect(d.cascadeClarity).toBeGreaterThanOrEqual(0)
    expect(d.poolDepth).toBeGreaterThanOrEqual(0)
    expect(d.mistPurity).toBeGreaterThanOrEqual(0)
    expect(d.riverWisdom).toBeGreaterThanOrEqual(0)
    expect(d.qualityScore).toBeGreaterThanOrEqual(0)
    expect(d.condition).toBeDefined()
  })

  it('calculates qualityScore as weighted average', () => {
    const d = analyzeJadeDrop(richContent, 'app.ts')
    const expected = Math.round(
      d.flowGrace * 0.2 +
      d.cascadeClarity * 0.2 +
      d.poolDepth * 0.2 +
      d.mistPurity * 0.2 +
      d.riverWisdom * 0.2,
    )
    expect(d.qualityScore).toBe(expected)
  })

  it('includes all sub-measures', () => {
    const d = analyzeJadeDrop(richContent, 'app.ts')
    expect(d.flowing).toBeDefined()
    expect(d.clarifying).toBeDefined()
    expect(d.deepening).toBeDefined()
    expect(d.purifying).toBeDefined()
    expect(d.accumulating).toBeDefined()
  })

  it('handles empty content gracefully', () => {
    const d = analyzeJadeDrop(emptyContent, 'empty.ts')
    expect(d.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('scores rich content high', () => {
    const d = analyzeJadeDrop(richContent, 'app.ts')
    expect(d.qualityScore).toBeGreaterThanOrEqual(60)
  })
})

// ─── analyzeJadeStream ──────────────────────────────────

describe('analyzeJadeStream', () => {
  it('returns empty stream for no drops', () => {
    const s = analyzeJadeStream([], 'src')
    expect(s.directory).toBe('src')
    expect(s.drops).toHaveLength(0)
    expect(s.avgGrace).toBe(0)
    expect(s.streamType).toBe('no-stream')
    expect(s.condition).toBe('void')
  })

  it('aggregates drop scores', () => {
    const d1 = analyzeJadeDrop(richContent, 'a.ts')
    const d2 = analyzeJadeDrop(richContent, 'b.ts')
    const s = analyzeJadeStream([d1, d2], 'src')
    expect(s.avgGrace).toBeGreaterThanOrEqual(0)
    expect(s.avgDepth).toBeGreaterThanOrEqual(0)
    expect(s.avgWisdom).toBeGreaterThanOrEqual(0)
    expect(s.drops).toHaveLength(2)
  })

  it('classifies stream type and condition', () => {
    const d = analyzeJadeDrop(richContent, 'app.ts')
    const s = analyzeJadeStream([d], 'src')
    expect(s.streamType).toBeDefined()
    expect(s.condition).toBeDefined()
  })
})

// ─── buildJadeCascadeResult ─────────────────────────────

describe('buildJadeCascadeResult', () => {
  it('handles empty input', async () => {
    const result = await buildJadeCascadeResult([], [])
    expect(result.drops).toHaveLength(0)
    expect(result.streams).toHaveLength(0)
    expect(result.garden.overallSerenity).toBe(0)
    expect(result.garden.isJade).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildJadeCascadeResult(['a.ts'], [richContent])
    expect(result.drops).toHaveLength(1)
    expect(result.drops[0].file).toBe('a.ts')
  })

  it('groups files by directory', async () => {
    const result = await buildJadeCascadeResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, poorContent],
    )
    expect(result.streams.length).toBe(2)
  })

  it('computes garden averages', async () => {
    const result = await buildJadeCascadeResult(['a.ts'], [richContent])
    expect(result.garden.avgGrace).toBeGreaterThanOrEqual(0)
    expect(result.garden.avgDepth).toBeGreaterThanOrEqual(0)
    expect(result.garden.avgWisdom).toBeGreaterThanOrEqual(0)
  })

  it('computes stats correctly', async () => {
    const result = await buildJadeCascadeResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalStreams).toBeGreaterThanOrEqual(1)
    expect(result.stats.overallSerenity).toBeGreaterThanOrEqual(0)
    expect(result.stats.gardenerGrade).toBeDefined()
  })

  it('identifies best and extreme files', async () => {
    const result = await buildJadeCascadeResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.bestDrop).toBeTruthy()
    expect(result.stats.mostGraceful).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.deepest).toBeTruthy()
    expect(result.stats.purest).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('includes recommendations', async () => {
    const result = await buildJadeCascadeResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty bestDrop for no files', async () => {
    const result = await buildJadeCascadeResult([], [])
    expect(result.stats.bestDrop).toBe('')
    expect(result.stats.mostGraceful).toBe('')
  })

  it('scores rich content at max', async () => {
    const result = await buildJadeCascadeResult(['a.ts'], [richContent])
    expect(result.drops[0].flowGrace).toBeGreaterThanOrEqual(60)
    expect(result.drops[0].cascadeClarity).toBeGreaterThanOrEqual(60)
    expect(result.drops[0].poolDepth).toBeGreaterThanOrEqual(60)
    expect(result.drops[0].mistPurity).toBeGreaterThanOrEqual(60)
    expect(result.drops[0].riverWisdom).toBeGreaterThanOrEqual(60)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<JadeCascadeResult['stats']> = {}): JadeCascadeResult['stats'] => ({
    totalFiles: 1, totalStreams: 1,
    avgFlowGrace: 95, avgCascadeClarity: 95, avgPoolDepth: 95,
    avgMistPurity: 95, avgRiverWisdom: 95,
    jadeMasterpieceCount: 1, perfectFlowCount: 0, properStreamCount: 0,
    murkyWaterCount: 0, dryBedCount: 0, voidCount: 0,
    hasHighGraceCount: 1, hasHighClarityCount: 1, hasHighDepthCount: 1,
    hasHighPurityCount: 1, hasHighWisdomCount: 1,
    overallSerenity: 95, gardenerGrade: 'zen-master' as const,
    bestDrop: 'a.ts', mostGraceful: 'a.ts', clearest: 'a.ts',
    deepest: 'a.ts', purest: 'a.ts', wisest: 'a.ts',
    ...overrides,
  })

  const makeGarden = (overrides: Partial<JadeCascadeResult['garden']> = {}): JadeCascadeResult['garden'] => ({
    avgGrace: 95, avgDepth: 95, avgWisdom: 95,
    isJade: true, overallSerenity: 95,
    ...overrides,
  })

  it('recommends masterpiece when all scores are high', () => {
    const recs = generateRecommendations([], [], makeGarden(), makeStats())
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends flow grace when low', () => {
    const recs = generateRecommendations([], [], makeGarden(), makeStats({
      avgFlowGrace: 30, overallSerenity: 78, gardenerGrade: 'garden-keeper',
    }))
    expect(recs.some((r) => r.includes('flow grace'))).toBe(true)
  })

  it('recommends cascade clarity when low', () => {
    const recs = generateRecommendations([], [], makeGarden(), makeStats({
      avgCascadeClarity: 30, overallSerenity: 78, gardenerGrade: 'garden-keeper',
    }))
    expect(recs.some((r) => r.includes('clarity'))).toBe(true)
  })

  it('recommends pool depth when low', () => {
    const recs = generateRecommendations([], [], makeGarden(), makeStats({
      avgPoolDepth: 30, overallSerenity: 78, gardenerGrade: 'garden-keeper',
    }))
    expect(recs.some((r) => r.includes('depth'))).toBe(true)
  })

  it('recommends mist purity when low', () => {
    const recs = generateRecommendations([], [], makeGarden(), makeStats({
      avgMistPurity: 30, overallSerenity: 78, gardenerGrade: 'garden-keeper',
    }))
    expect(recs.some((r) => r.includes('mist') || r.includes('purity'))).toBe(true)
  })

  it('recommends river wisdom when low', () => {
    const recs = generateRecommendations([], [], makeGarden(), makeStats({
      avgRiverWisdom: 30, overallSerenity: 78, gardenerGrade: 'garden-keeper',
    }))
    expect(recs.some((r) => r.includes('wisdom'))).toBe(true)
  })

  it('warns about very low serenity', () => {
    const recs = generateRecommendations([], [], makeGarden({ overallSerenity: 20, isJade: false }), makeStats({
      avgFlowGrace: 20, avgCascadeClarity: 20, avgPoolDepth: 20,
      avgMistPurity: 20, avgRiverWisdom: 20,
      overallSerenity: 20, gardenerGrade: 'novice', voidCount: 1,
    }))
    expect(recs.some((r) => r.includes('dry') || r.includes('cascade'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorJadeCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorJadeCondition('jade-masterpiece')).toBe('string')
    expect(typeof colorJadeCondition('perfect-flow')).toBe('string')
    expect(typeof colorJadeCondition('proper-stream')).toBe('string')
    expect(typeof colorJadeCondition('murky-water')).toBe('string')
    expect(typeof colorJadeCondition('dry-bed')).toBe('string')
    expect(typeof colorJadeCondition('void')).toBe('string')
  })
  it('handles unknown condition', () => {
    expect(typeof colorJadeCondition('unknown')).toBe('string')
  })
})

describe('colorStreamCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorStreamCondition('jade-garden')).toBe('string')
    expect(typeof colorStreamCondition('flowing-sanctuary')).toBe('string')
    expect(typeof colorStreamCondition('proper-pond')).toBe('string')
    expect(typeof colorStreamCondition('stagnant-pool')).toBe('string')
    expect(typeof colorStreamCondition('desert')).toBe('string')
    expect(typeof colorStreamCondition('void')).toBe('string')
  })
})

describe('formatDropTable', () => {
  it('formats a drop', () => {
    const d = analyzeJadeDrop(richContent, 'app.ts')
    const output = formatDropTable(d)
    expect(output).toContain('app.ts')
    expect(output).toContain('Flow Grace')
    expect(output).toContain('Quality Score')
  })
})

describe('formatDropsTable', () => {
  it('formats empty drops', () => {
    expect(formatDropsTable([])).toContain('No jade drops')
  })
  it('formats multiple drops', () => {
    const d1 = analyzeJadeDrop(richContent, 'a.ts')
    const d2 = analyzeJadeDrop(poorContent, 'b.ts')
    expect(formatDropsTable([d1, d2])).toContain('a.ts')
  })
})

describe('formatStreamTable', () => {
  it('formats a stream', () => {
    const d = analyzeJadeDrop(richContent, 'src/a.ts')
    const s = analyzeJadeStream([d], 'src')
    expect(formatStreamTable(s)).toContain('src')
  })
})

describe('formatStreamsTable', () => {
  it('formats empty streams', () => {
    expect(formatStreamsTable([])).toContain('No jade streams')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildJadeCascadeResult(['a.ts'], [richContent])
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
    const result = await buildJadeCascadeResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Jade Cascade Analysis')
    expect(output).toContain('Garden Overview')
  })
})

describe('formatResultJson', () => {
  it('formats as JSON', async () => {
    const result = await buildJadeCascadeResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.drops).toHaveLength(1)
    expect(parsed.garden).toBeDefined()
  })
})
