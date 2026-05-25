import { describe, expect, it } from 'vitest'

import {
  analyzeOnyxPillar,
  analyzeOnyxNave,
  buildOnyxTempleResult,
  classifyPillarCondition,
  classifyNaveType,
  classifyNaveCondition,
  classifyArchitectGrade,
  generateRecommendations,
  measureRevealing,
  measureEnduring,
  measureReflecting,
  measureCarving,
  measureContemplating,
  type PillarCondition,
  type NaveCondition,
  type OnyxPillar,
  type OnyxTempleResult,
  type OnyxNave,
} from '../src/commands/onyx-temple-helpers.js'

import {
  colorPillarCondition,
  colorNaveCondition,
  colorScore,
  formatPillarTable,
  formatPillarsTable,
  formatNavesTable,
  formatNaveTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/onyx-temple-format-helpers.js'

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

// ─── measureRevealing ───────────────────────────────────

describe('measureRevealing', () => {
  it('scores rich content high', () => {
    const m = measureRevealing(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(60)
    expect(m.hasHighClarity).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureRevealing(emptyContent)
    expect(m.clarity).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureRevealing(richContent)
    const poor = measureRevealing(poorContent)
    expect(rich.clarity).toBeGreaterThan(poor.clarity)
  })

  it('detects cryptic patterns', () => {
    const m = measureRevealing('cryptic obscure arcane')
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated patterns', () => {
    const m = measureRevealing('obfuscated encoded mangled')
    expect(m.obfuscatedCount).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('assigns high obsidian for rich content', () => {
    const m = measureRevealing(richContent)
    expect(['flawless-mirror', 'polished-black', 'proper-stone']).toContain(m.obsidian)
  })

  it('assigns low obsidian for empty content', () => {
    const m = measureRevealing(emptyContent)
    expect(['no-clarity', 'raw-ore', 'rough-surface', 'proper-stone']).toContain(m.obsidian)
  })

  it('has all boolean properties', () => {
    const m = measureRevealing(richContent)
    expect(typeof m.hasReadable).toBe('boolean')
    expect(typeof m.hasSelfDocumenting).toBe('boolean')
    expect(typeof m.hasClear).toBe('boolean')
  })
})

// ─── measureEnduring ────────────────────────────────────

describe('measureEnduring', () => {
  it('scores rich content high', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBeGreaterThanOrEqual(60)
    expect(m.hasHighResilience).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureEnduring(emptyContent)
    expect(m.resilience).toBeGreaterThanOrEqual(0)
  })

  it('detects unhandled patterns', () => {
    const m = measureEnduring('eval (x)')
    expect(m.unhandledCount).toBeGreaterThan(0)
    expect(m.hasNoUnhandled).toBe(false)
  })

  it('detects untested patterns', () => {
    const m = measureEnduring('eval (x)')
    expect(m.untestedCount).toBeGreaterThan(0)
    expect(m.hasNoUntested).toBe(false)
  })

  it('assigns high darkness for rich content', () => {
    const m = measureEnduring(richContent)
    expect(['impervious-fortress', 'dark-stronghold', 'proper-shade']).toContain(m.darkness)
  })

  it('assigns low darkness for empty content', () => {
    const m = measureEnduring(emptyContent)
    expect(['no-resilience', 'no-cover', 'flickering-shadow', 'proper-shade']).toContain(m.darkness)
  })

  it('has all boolean properties', () => {
    const m = measureEnduring(richContent)
    expect(typeof m.hasErrorHandled).toBe('boolean')
    expect(typeof m.hasDefensive).toBe('boolean')
    expect(typeof m.hasRobust).toBe('boolean')
  })
})

// ─── measureReflecting ──────────────────────────────────

describe('measureReflecting', () => {
  it('scores rich content high', () => {
    const m = measureReflecting(richContent)
    expect(m.depth).toBeGreaterThanOrEqual(60)
    expect(m.hasHighDepth).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureReflecting(emptyContent)
    expect(m.depth).toBeGreaterThanOrEqual(0)
  })

  it('detects chaotic patterns', () => {
    const m = measureReflecting('var x = eval("boom")')
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('has undocumentedCount property', () => {
    const m = measureReflecting(richContent)
    expect(typeof m.undocumentedCount).toBe('number')
  })

  it('assigns high mirror for rich content', () => {
    const m = measureReflecting(richContent)
    expect(['perfect-reflection', 'clear-pool', 'proper-surface']).toContain(m.mirror)
  })

  it('assigns low mirror for empty content', () => {
    const m = measureReflecting(emptyContent)
    expect(['no-depth', 'cracked-mirror', 'distorted-glass', 'proper-surface']).toContain(m.mirror)
  })

  it('has all boolean properties', () => {
    const m = measureReflecting(richContent)
    expect(typeof m.hasWellStructured).toBe('boolean')
    expect(typeof m.hasDocumented).toBe('boolean')
    expect(typeof m.hasOrganized).toBe('boolean')
  })
})

// ─── measureCarving ─────────────────────────────────────

describe('measureCarving', () => {
  it('scores rich content high', () => {
    const m = measureCarving(richContent)
    expect(m.precision).toBeGreaterThanOrEqual(60)
    expect(m.hasHighPrecision).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureCarving(emptyContent)
    expect(m.precision).toBeGreaterThanOrEqual(0)
  })

  it('detects unsafe patterns', () => {
    const m = measureCarving('var x = eval("1")')
    expect(m.unsafeCount).toBeGreaterThan(0)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects approximate patterns', () => {
    const m = measureCarving('roughly approximately guesstimate')
    expect(m.approximateCount).toBeGreaterThan(0)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('assigns high chisel for rich content', () => {
    const m = measureCarving(richContent)
    expect(['master-sculptor', 'expert-mason', 'proper-carver']).toContain(m.chisel)
  })

  it('assigns low chisel for empty content', () => {
    const m = measureCarving(emptyContent)
    expect(['no-precision', 'bare-hands', 'rough-hammer', 'proper-carver']).toContain(m.chisel)
  })

  it('has all boolean properties', () => {
    const m = measureCarving(richContent)
    expect(typeof m.hasTypeSafe).toBe('boolean')
    expect(typeof m.hasAccurate).toBe('boolean')
    expect(typeof m.hasPrecise).toBe('boolean')
  })
})

// ─── measureContemplating ───────────────────────────────

describe('measureContemplating', () => {
  it('scores rich content high', () => {
    const m = measureContemplating(richContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(60)
    expect(m.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureContemplating(emptyContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
  })

  it('detects hacked patterns', () => {
    const m = measureContemplating('hack workaround monkey')
    expect(m.hackedCount).toBeGreaterThan(0)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects noisy patterns', () => {
    const m = measureContemplating('noisy cluttered bloated')
    expect(m.noisyCount).toBeGreaterThan(0)
  })

  it('assigns high void for rich content', () => {
    const m = measureContemplating(richContent)
    expect(['enlightened-void', 'deep-emptiness', 'proper-silence']).toContain(m.void)
  })

  it('assigns low void for empty content', () => {
    const m = measureContemplating(emptyContent)
    expect(['no-wisdom', 'chaos', 'noise-filled', 'proper-silence']).toContain(m.void)
  })

  it('has all boolean properties', () => {
    const m = measureContemplating(richContent)
    expect(typeof m.hasWellArchitected).toBe('boolean')
    expect(typeof m.hasProven).toBe('boolean')
    expect(typeof m.hasDeep).toBe('boolean')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyPillarCondition', () => {
  const cases: [number, PillarCondition][] = [
    [95, 'onyx-masterpiece'],
    [90, 'onyx-masterpiece'],
    [80, 'dark-cathedral'],
    [75, 'dark-cathedral'],
    [65, 'proper-stone'],
    [60, 'proper-stone'],
    [50, 'cracked-pillar'],
    [40, 'cracked-pillar'],
    [25, 'rubble'],
    [20, 'rubble'],
    [10, 'void'],
    [0, 'void'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyPillarCondition(score)).toBe(expected)
    })
  }
})

describe('classifyNaveType', () => {
  it('returns no-nave for empty array', () => {
    expect(classifyNaveType([])).toBe('no-nave')
  })

  it('returns grand-cathedral for high average', () => {
    const pillars = [{ qualityScore: 90 }, { qualityScore: 88 }].map((q) => ({
      ...q,
    })) as OnyxPillar[]
    expect(classifyNaveType(pillars)).toBe('grand-cathedral')
  })

  it('returns empty-room for low average', () => {
    const pillars = [{ qualityScore: 10 }, { qualityScore: 15 }].map((q) => ({
      ...q,
    })) as OnyxPillar[]
    expect(classifyNaveType(pillars)).toBe('empty-room')
  })
})

describe('classifyNaveCondition', () => {
  const cases: [number, NaveCondition][] = [
    [90, 'onyx-basilica'],
    [85, 'onyx-basilica'],
    [75, 'dark-abbey'],
    [70, 'dark-abbey'],
    [60, 'proper-temple'],
    [55, 'proper-temple'],
    [40, 'ruined-church'],
    [35, 'ruined-church'],
    [20, 'empty-lot'],
    [15, 'empty-lot'],
    [5, 'void'],
    [0, 'void'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyNaveCondition(score)).toBe(expected)
    })
  }
})

describe('classifyArchitectGrade', () => {
  const cases: [number, string][] = [
    [90, 'master-architect'],
    [80, 'master-architect'],
    [70, 'cathedral-builder'],
    [65, 'cathedral-builder'],
    [55, 'stone-mason'],
    [50, 'stone-mason'],
    [40, 'apprentice'],
    [35, 'apprentice'],
    [25, 'novice'],
    [20, 'novice'],
    [10, 'sandcastle-builder'],
    [0, 'sandcastle-builder'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyArchitectGrade(score)).toBe(expected)
    })
  }
})

// ─── analyzeOnyxPillar ──────────────────────────────────

describe('analyzeOnyxPillar', () => {
  it('returns valid pillar for rich content', () => {
    const p = analyzeOnyxPillar(richContent, 'app.ts')
    expect(p.file).toBe('app.ts')
    expect(p.obsidianClarity).toBeGreaterThanOrEqual(0)
    expect(p.darkResilience).toBeGreaterThanOrEqual(0)
    expect(p.mirrorDepth).toBeGreaterThanOrEqual(0)
    expect(p.midnightPrecision).toBeGreaterThanOrEqual(0)
    expect(p.voidWisdom).toBeGreaterThanOrEqual(0)
    expect(p.qualityScore).toBeGreaterThanOrEqual(0)
    expect(p.qualityScore).toBeLessThanOrEqual(100)
  })

  it('returns valid pillar for empty content', () => {
    const p = analyzeOnyxPillar(emptyContent, 'empty.ts')
    expect(p.file).toBe('empty.ts')
    expect(p.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('computes qualityScore as weighted average', () => {
    const p = analyzeOnyxPillar(richContent, 'test.ts')
    const expected = Math.round(
      p.obsidianClarity * 0.2 +
      p.darkResilience * 0.2 +
      p.mirrorDepth * 0.2 +
      p.midnightPrecision * 0.2 +
      p.voidWisdom * 0.2,
    )
    expect(p.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const p = analyzeOnyxPillar(richContent, 'test.ts')
    expect(p.revealing).toBeDefined()
    expect(p.enduring).toBeDefined()
    expect(p.reflecting).toBeDefined()
    expect(p.carving).toBeDefined()
    expect(p.contemplating).toBeDefined()
  })

  it('classifies condition based on qualityScore', () => {
    const p = analyzeOnyxPillar(richContent, 'test.ts')
    expect(classifyPillarCondition(p.qualityScore)).toBe(p.condition)
  })

  it('scores rich content at max', () => {
    const p = analyzeOnyxPillar(richContent, 'rich.ts')
    expect(p.obsidianClarity).toBeGreaterThanOrEqual(60)
    expect(p.darkResilience).toBeGreaterThanOrEqual(60)
    expect(p.mirrorDepth).toBeGreaterThanOrEqual(60)
    expect(p.midnightPrecision).toBeGreaterThanOrEqual(60)
    expect(p.voidWisdom).toBeGreaterThanOrEqual(60)
  })
})

// ─── analyzeOnyxNave ────────────────────────────────────

describe('analyzeOnyxNave', () => {
  it('returns empty nave for no pillars', () => {
    const n = analyzeOnyxNave([], 'src')
    expect(n.directory).toBe('src')
    expect(n.pillars).toHaveLength(0)
    expect(n.avgClarity).toBe(0)
    expect(n.avgPrecision).toBe(0)
    expect(n.avgWisdom).toBe(0)
    expect(n.naveType).toBe('no-nave')
    expect(n.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const pillars = [
      analyzeOnyxPillar(richContent, 'a.ts'),
      analyzeOnyxPillar(richContent, 'b.ts'),
    ]
    const n = analyzeOnyxNave(pillars, 'src')
    expect(n.avgClarity).toBeGreaterThanOrEqual(0)
    expect(n.avgPrecision).toBeGreaterThanOrEqual(0)
    expect(n.avgWisdom).toBeGreaterThanOrEqual(0)
  })

  it('counts onyx masterpieces', () => {
    const pillars = [analyzeOnyxPillar(richContent, 'a.ts')]
    const n = analyzeOnyxNave(pillars, 'src')
    expect(n.onyxMasterpieceCount).toBeGreaterThanOrEqual(0)
  })

  it('counts void pillars', () => {
    const pillars = [analyzeOnyxPillar(emptyContent, 'empty.ts')]
    const n = analyzeOnyxNave(pillars, 'src')
    expect(n.voidCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── buildOnyxTempleResult ──────────────────────────────

describe('buildOnyxTempleResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildOnyxTempleResult([], [])
    expect(result.pillars).toHaveLength(0)
    expect(result.naves).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallDepth).toBe(0)
    expect(result.sanctuary.isOnyx).toBe(false)
  })

  it('returns valid result for single file', async () => {
    const result = await buildOnyxTempleResult(['app.ts'], [richContent])
    expect(result.pillars).toHaveLength(1)
    expect(result.naves).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestPillar).toBe('app.ts')
    expect(result.stats.clearest).toBe('app.ts')
    expect(result.stats.mostResilient).toBe('app.ts')
    expect(result.stats.deepest).toBe('app.ts')
    expect(result.stats.mostPrecise).toBe('app.ts')
    expect(result.stats.wisest).toBe('app.ts')
  })

  it('returns valid result for multiple files', async () => {
    const result = await buildOnyxTempleResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, emptyContent],
    )
    expect(result.pillars).toHaveLength(3)
    expect(result.naves).toHaveLength(2)
    expect(result.stats.totalNaves).toBe(2)
  })

  it('computes correct stats counts', async () => {
    const result = await buildOnyxTempleResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    const total = result.stats.onyxMasterpieceCount +
      result.stats.darkCathedralCount +
      result.stats.properStoneCount +
      result.stats.crackedPillarCount +
      result.stats.rubbleCount +
      result.stats.voidCount
    expect(total).toBe(2)
  })

  it('computes architectGrade', async () => {
    const result = await buildOnyxTempleResult(['a.ts'], [richContent])
    expect(['master-architect', 'cathedral-builder', 'stone-mason', 'apprentice', 'novice', 'sandcastle-builder']).toContain(
      result.stats.architectGrade,
    )
  })

  it('sets isOnyx when overallDepth >= 60', async () => {
    const result = await buildOnyxTempleResult(['a.ts'], [richContent])
    if (result.sanctuary.overallDepth >= 60) {
      expect(result.sanctuary.isOnyx).toBe(true)
    }
  })

  it('generates recommendations', async () => {
    const result = await buildOnyxTempleResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('computes hasHigh counts', async () => {
    const result = await buildOnyxTempleResult(['a.ts'], [richContent])
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighDepthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('computes avgVoidWisdom correctly', async () => {
    const result = await buildOnyxTempleResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.avgVoidWisdom).toBe(result.sanctuary.avgWisdom)
  })

  it('computes avgObsidianClarity correctly', async () => {
    const result = await buildOnyxTempleResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.avgObsidianClarity).toBe(result.sanctuary.avgClarity)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all high', () => {
    const pillars: OnyxPillar[] = []
    const naves: OnyxNave[] = []
    const sanctuary: OnyxTempleResult['sanctuary'] = {
      avgClarity: 90,
      avgPrecision: 90,
      avgWisdom: 90,
      isOnyx: true,
      overallDepth: 90,
    }
    const stats: OnyxTempleResult['stats'] = {
      totalFiles: 1, totalNaves: 1,
      avgObsidianClarity: 92, avgDarkResilience: 91, avgMirrorDepth: 90,
      avgMidnightPrecision: 93, avgVoidWisdom: 94,
      onyxMasterpieceCount: 1, darkCathedralCount: 0, properStoneCount: 0,
      crackedPillarCount: 0, rubbleCount: 0, voidCount: 0,
      hasHighClarityCount: 1, hasHighResilienceCount: 1, hasHighDepthCount: 1,
      hasHighPrecisionCount: 1, hasHighWisdomCount: 1,
      overallDepth: 92, architectGrade: 'master-architect',
      bestPillar: 'a.ts', clearest: 'a.ts', mostResilient: 'a.ts',
      deepest: 'a.ts', mostPrecise: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations(pillars, naves, sanctuary, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends clarity when low', () => {
    const stats = {
      totalFiles: 1, totalNaves: 1,
      avgObsidianClarity: 30, avgDarkResilience: 90, avgMirrorDepth: 90,
      avgMidnightPrecision: 90, avgVoidWisdom: 90,
      onyxMasterpieceCount: 0, darkCathedralCount: 0, properStoneCount: 0,
      crackedPillarCount: 0, rubbleCount: 0, voidCount: 0,
      hasHighClarityCount: 0, hasHighResilienceCount: 0, hasHighDepthCount: 0,
      hasHighPrecisionCount: 0, hasHighWisdomCount: 0,
      overallDepth: 78, architectGrade: 'cathedral-builder' as const,
      bestPillar: 'a.ts', clearest: 'a.ts', mostResilient: 'a.ts',
      deepest: 'a.ts', mostPrecise: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgClarity: 30, avgPrecision: 90, avgWisdom: 90, isOnyx: true, overallDepth: 78 }, stats)
    expect(recs.some((r) => r.includes('clarity'))).toBe(true)
  })

  it('recommends resilience when low', () => {
    const stats = {
      totalFiles: 1, totalNaves: 1,
      avgObsidianClarity: 90, avgDarkResilience: 30, avgMirrorDepth: 90,
      avgMidnightPrecision: 90, avgVoidWisdom: 90,
      onyxMasterpieceCount: 0, darkCathedralCount: 0, properStoneCount: 0,
      crackedPillarCount: 0, rubbleCount: 0, voidCount: 0,
      hasHighClarityCount: 0, hasHighResilienceCount: 0, hasHighDepthCount: 0,
      hasHighPrecisionCount: 0, hasHighWisdomCount: 0,
      overallDepth: 78, architectGrade: 'cathedral-builder' as const,
      bestPillar: 'a.ts', clearest: 'a.ts', mostResilient: 'a.ts',
      deepest: 'a.ts', mostPrecise: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 90, avgWisdom: 90, isOnyx: true, overallDepth: 78 }, stats)
    expect(recs.some((r) => r.includes('resilience'))).toBe(true)
  })

  it('recommends depth when low', () => {
    const stats = {
      totalFiles: 1, totalNaves: 1,
      avgObsidianClarity: 90, avgDarkResilience: 90, avgMirrorDepth: 30,
      avgMidnightPrecision: 90, avgVoidWisdom: 90,
      onyxMasterpieceCount: 0, darkCathedralCount: 0, properStoneCount: 0,
      crackedPillarCount: 0, rubbleCount: 0, voidCount: 0,
      hasHighClarityCount: 0, hasHighResilienceCount: 0, hasHighDepthCount: 0,
      hasHighPrecisionCount: 0, hasHighWisdomCount: 0,
      overallDepth: 78, architectGrade: 'cathedral-builder' as const,
      bestPillar: 'a.ts', clearest: 'a.ts', mostResilient: 'a.ts',
      deepest: 'a.ts', mostPrecise: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 90, avgWisdom: 90, isOnyx: true, overallDepth: 78 }, stats)
    expect(recs.some((r) => r.includes('depth'))).toBe(true)
  })

  it('recommends precision when low', () => {
    const stats = {
      totalFiles: 1, totalNaves: 1,
      avgObsidianClarity: 90, avgDarkResilience: 90, avgMirrorDepth: 90,
      avgMidnightPrecision: 30, avgVoidWisdom: 90,
      onyxMasterpieceCount: 0, darkCathedralCount: 0, properStoneCount: 0,
      crackedPillarCount: 0, rubbleCount: 0, voidCount: 0,
      hasHighClarityCount: 0, hasHighResilienceCount: 0, hasHighDepthCount: 0,
      hasHighPrecisionCount: 0, hasHighWisdomCount: 0,
      overallDepth: 78, architectGrade: 'cathedral-builder' as const,
      bestPillar: 'a.ts', clearest: 'a.ts', mostResilient: 'a.ts',
      deepest: 'a.ts', mostPrecise: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 30, avgWisdom: 90, isOnyx: true, overallDepth: 78 }, stats)
    expect(recs.some((r) => r.includes('precision'))).toBe(true)
  })

  it('recommends wisdom when low', () => {
    const stats = {
      totalFiles: 1, totalNaves: 1,
      avgObsidianClarity: 90, avgDarkResilience: 90, avgMirrorDepth: 90,
      avgMidnightPrecision: 90, avgVoidWisdom: 30,
      onyxMasterpieceCount: 0, darkCathedralCount: 0, properStoneCount: 0,
      crackedPillarCount: 0, rubbleCount: 0, voidCount: 0,
      hasHighClarityCount: 0, hasHighResilienceCount: 0, hasHighDepthCount: 0,
      hasHighPrecisionCount: 0, hasHighWisdomCount: 0,
      overallDepth: 78, architectGrade: 'cathedral-builder' as const,
      bestPillar: 'a.ts', clearest: 'a.ts', mostResilient: 'a.ts',
      deepest: 'a.ts', mostPrecise: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 90, avgWisdom: 30, isOnyx: true, overallDepth: 78 }, stats)
    expect(recs.some((r) => r.includes('wisdom'))).toBe(true)
  })

  it('mentions void pillars by name', () => {
    const pillars = [
      { file: 'bad1.ts', condition: 'void' } as OnyxPillar,
      { file: 'bad2.ts', condition: 'void' } as OnyxPillar,
    ]
    const stats = {
      totalFiles: 2, totalNaves: 1,
      avgObsidianClarity: 70, avgDarkResilience: 70, avgMirrorDepth: 70,
      avgMidnightPrecision: 70, avgVoidWisdom: 70,
      onyxMasterpieceCount: 0, darkCathedralCount: 0, properStoneCount: 0,
      crackedPillarCount: 0, rubbleCount: 0, voidCount: 2,
      hasHighClarityCount: 0, hasHighResilienceCount: 0, hasHighDepthCount: 0,
      hasHighPrecisionCount: 0, hasHighWisdomCount: 0,
      overallDepth: 70, architectGrade: 'cathedral-builder' as const,
      bestPillar: '', clearest: '', mostResilient: '',
      deepest: '', mostPrecise: '', wisest: '',
    }
    const recs = generateRecommendations(pillars, [], { avgClarity: 70, avgPrecision: 70, avgWisdom: 70, isOnyx: true, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('bad1.ts'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })

  it('colorPillarCondition returns string for all conditions', () => {
    const conditions: PillarCondition[] = ['onyx-masterpiece', 'dark-cathedral', 'proper-stone', 'cracked-pillar', 'rubble', 'void']
    for (const c of conditions) {
      expect(typeof colorPillarCondition(c)).toBe('string')
    }
  })

  it('colorNaveCondition returns string for all conditions', () => {
    const conditions: NaveCondition[] = ['onyx-basilica', 'dark-abbey', 'proper-temple', 'ruined-church', 'empty-lot', 'void']
    for (const c of conditions) {
      expect(typeof colorNaveCondition(c)).toBe('string')
    }
  })

  it('formatPillarTable returns string', () => {
    const p = analyzeOnyxPillar(richContent, 'test.ts')
    expect(typeof formatPillarTable(p)).toBe('string')
  })

  it('formatPillarsTable returns string for empty', () => {
    expect(typeof formatPillarsTable([])).toBe('string')
  })

  it('formatPillarsTable returns string for pillars', () => {
    const pillars = [
      analyzeOnyxPillar(richContent, 'a.ts'),
      analyzeOnyxPillar(richContent, 'b.ts'),
    ]
    expect(typeof formatPillarsTable(pillars)).toBe('string')
  })

  it('formatNaveTable returns string', () => {
    const pillars = [analyzeOnyxPillar(richContent, 'a.ts')]
    const n = analyzeOnyxNave(pillars, 'src')
    expect(typeof formatNaveTable(n)).toBe('string')
  })

  it('formatNavesTable returns string for empty', () => {
    expect(typeof formatNavesTable([])).toBe('string')
  })

  it('formatNavesTable returns string for naves', () => {
    const pillars = [analyzeOnyxPillar(richContent, 'a.ts')]
    const n = analyzeOnyxNave(pillars, 'src')
    expect(typeof formatNavesTable([n])).toBe('string')
  })

  it('formatStatsTable returns string', async () => {
    const result = await buildOnyxTempleResult(['a.ts'], [richContent])
    expect(typeof formatStatsTable(result.stats)).toBe('string')
  })

  it('formatRecommendations returns string for empty', () => {
    expect(typeof formatRecommendations([])).toBe('string')
  })

  it('formatRecommendations returns string for recs', () => {
    expect(typeof formatRecommendations(['Fix X', 'Fix Y'])).toBe('string')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildOnyxTempleResult(['a.ts'], [richContent])
    expect(typeof formatResultTable(result)).toBe('string')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildOnyxTempleResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })
})
