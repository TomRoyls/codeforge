import { describe, it, expect } from 'vitest'
import {
  measureIlluminating,
  measureWeaving,
  measurePurifying,
  measureEnduring,
  measureInheriting,
  classifyCondition,
  classifyLoomType,
  classifyWeaverGrade,
  classifyLoomCondition,
  analyzeGoldenThread,
  analyzeGoldenLoom,
  buildGoldenVeilResult,
  generateRecommendations,
} from '../src/commands/golden-veil-helpers.js'
import {
  colorScore,
  colorCondition,
  formatThreadTable,
  formatThreadsTable,
  formatLoomTable,
  formatLoomsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/golden-veil-format-helpers.js'

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
`

// ─── measureIlluminating ──────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns 0 for empty content', () => {
    const m = measureIlluminating('')
    expect(m.clarity).toBe(0)
    expect(m.radiance).toBe('no-clarity')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureIlluminating(minimalContent)
    expect(m.clarity).toBe(0)
    expect(m.radiance).toBe('no-clarity')
    expect(m.hasReadable).toBe(false)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.crypticCount).toBe(0)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureIlluminating(richContent)
    expect(m.clarity).toBe(100)
    expect(m.radiance).toBe('golden-light')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWarm).toBe(true)
  })

  it('detects cryptic eval usage', () => {
    const m = measureIlluminating('eval("1")')
    expect(m.crypticCount).toBe(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated any usage', () => {
    const m = measureIlluminating('const x: any = 1')
    expect(m.obfuscatedCount).toBe(1)
    expect(m.hasNoObfuscated).toBe(false)
  })
})

// ─── measureWeaving ──────────────────────────────────────────

describe('measureWeaving', () => {
  it('returns 0 for empty content', () => {
    const m = measureWeaving('')
    expect(m.elegance).toBe(0)
    expect(m.veil).toBe('no-elegance')
    expect(m.hasHighElegance).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureWeaving(minimalContent)
    expect(m.elegance).toBe(0)
    expect(m.veil).toBe('no-elegance')
    expect(m.hasWellStructured).toBe(false)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.hasNoTangled).toBe(true)
    expect(m.chaoticCount).toBe(0)
    expect(m.tangledCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureWeaving(richContent)
    expect(m.elegance).toBe(100)
    expect(m.veil).toBe('golden-gossamer')
    expect(m.hasHighElegance).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasCleanPipelines).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasOrganized).toBe(true)
    expect(m.hasAbstracted).toBe(true)
    expect(m.hasElegant).toBe(true)
    expect(m.hasBeautiful).toBe(true)
  })

  it('detects chaotic var usage', () => {
    const m = measureWeaving('var x = 1')
    expect(m.chaoticCount).toBe(1)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects tangled any usage', () => {
    const m = measureWeaving('const x: any = 1')
    expect(m.tangledCount).toBe(1)
    expect(m.hasNoTangled).toBe(false)
  })
})

// ─── measurePurifying ──────────────────────────────────────────

describe('measurePurifying', () => {
  it('returns 0 for empty content', () => {
    const m = measurePurifying('')
    expect(m.purity).toBe(0)
    expect(m.aurum).toBe('no-purity')
    expect(m.hasHighPurity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measurePurifying(minimalContent)
    expect(m.purity).toBe(0)
    expect(m.aurum).toBe('no-purity')
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasNoUntested).toBe(true)
    expect(m.unsafeCount).toBe(0)
    expect(m.untestedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measurePurifying(richContent)
    expect(m.purity).toBe(100)
    expect(m.aurum).toBe('pure-gold')
    expect(m.hasHighPurity).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasHonest).toBe(true)
    expect(m.hasPure).toBe(true)
    expect(m.hasReliable).toBe(true)
  })

  it('detects unsafe any usage', () => {
    const m = measurePurifying('const x: any = 1')
    expect(m.unsafeCount).toBe(1)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects untested var usage', () => {
    const m = measurePurifying('var x = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
  })
})

// ─── measureEnduring ──────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns 0 for empty content', () => {
    const m = measureEnduring('')
    expect(m.resilience).toBe(0)
    expect(m.gold).toBe('no-resilience')
    expect(m.hasHighResilience).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureEnduring(minimalContent)
    expect(m.resilience).toBe(0)
    expect(m.gold).toBe('no-resilience')
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasNoFragile).toBe(true)
    expect(m.bareCrashCount).toBe(0)
    expect(m.fragileCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBe(100)
    expect(m.gold).toBe('eternal-gold')
    expect(m.hasHighResilience).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasRecoverable).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasMaintained).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasStable).toBe(true)
  })

  it('detects bare crash eval usage', () => {
    const m = measureEnduring('eval("1")')
    expect(m.bareCrashCount).toBe(1)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects fragile var usage', () => {
    const m = measureEnduring('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })
})

// ─── measureInheriting ──────────────────────────────────────────

describe('measureInheriting', () => {
  it('returns 0 for empty content', () => {
    const m = measureInheriting('')
    expect(m.wisdom).toBe(0)
    expect(m.legacy).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureInheriting(minimalContent)
    expect(m.wisdom).toBe(0)
    expect(m.legacy).toBe('no-wisdom')
    expect(m.hasWellArchitected).toBe(false)
    expect(m.hasNoHacked).toBe(true)
    expect(m.hasNoReinvented).toBe(true)
    expect(m.hackedCount).toBe(0)
    expect(m.reinventedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureInheriting(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.legacy).toBe('ancient-gold')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasStrategic).toBe(true)
    expect(m.hasEnduring).toBe(true)
  })

  it('detects hacked usage', () => {
    const m = measureInheriting('const hack = 1')
    expect(m.hackedCount).toBe(1)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects reinvented any usage', () => {
    const m = measureInheriting('const x: any = 1')
    expect(m.reinventedCount).toBe(1)
    expect(m.hasNoReinvented).toBe(false)
  })
})

// ─── classifyCondition ─────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies golden-masterpiece for 90+', () => {
    expect(classifyCondition(90)).toBe('golden-masterpiece')
    expect(classifyCondition(100)).toBe('golden-masterpiece')
  })

  it('classifies radiant-veil for 75-89', () => {
    expect(classifyCondition(75)).toBe('radiant-veil')
    expect(classifyCondition(89)).toBe('radiant-veil')
  })

  it('classifies proper-curtain for 60-74', () => {
    expect(classifyCondition(60)).toBe('proper-curtain')
    expect(classifyCondition(74)).toBe('proper-curtain')
  })

  it('classifies faded-fabric for 40-59', () => {
    expect(classifyCondition(40)).toBe('faded-fabric')
    expect(classifyCondition(59)).toBe('faded-fabric')
  })

  it('classifies torn-rag for 20-39', () => {
    expect(classifyCondition(20)).toBe('torn-rag')
    expect(classifyCondition(39)).toBe('torn-rag')
  })

  it('classifies void for 0-19', () => {
    expect(classifyCondition(0)).toBe('void')
    expect(classifyCondition(19)).toBe('void')
  })
})

// ─── classifyLoomType ─────────────────────────────────────────

describe('classifyLoomType', () => {
  it('returns no-loom for empty threads', () => {
    expect(classifyLoomType([])).toBe('no-loom')
  })

  it('classifies master-loom for high avg', () => {
    const threads = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeGoldenThread(richContent, `f${i}.ts`),
    }))
    expect(classifyLoomType(threads)).toBe('master-loom')
  })

  it('classifies no-loom for low scores', () => {
    const threads = [analyzeGoldenThread('', 'a.ts')]
    expect(classifyLoomType(threads)).toBe('no-loom')
  })

  it('classifies golden-weave for mid-high scores', () => {
    const threads = Array.from({ length: 3 }, () => ({
      ...analyzeGoldenThread(richContent, 'f.ts'),
      qualityScore: 75,
      condition: 'radiant-veil' as const,
    }))
    expect(classifyLoomType(threads)).toBe('golden-weave')
  })

  it('classifies proper-craft for mid scores', () => {
    const threads = Array.from({ length: 3 }, () => ({
      ...analyzeGoldenThread(richContent, 'f.ts'),
      qualityScore: 60,
      condition: 'proper-curtain' as const,
    }))
    expect(classifyLoomType(threads)).toBe('proper-craft')
  })

  it('classifies small-loom for low scores', () => {
    const threads = Array.from({ length: 3 }, () => ({
      ...analyzeGoldenThread(richContent, 'f.ts'),
      qualityScore: 42,
      condition: 'faded-fabric' as const,
    }))
    expect(classifyLoomType(threads)).toBe('small-loom')
  })

  it('classifies broken-frame for very low scores', () => {
    const threads = Array.from({ length: 3 }, () => ({
      ...analyzeGoldenThread(richContent, 'f.ts'),
      qualityScore: 25,
      condition: 'void' as const,
    }))
    expect(classifyLoomType(threads)).toBe('broken-frame')
  })
})

// ─── classifyWeaverGrade ─────────────────────────────────────────

describe('classifyWeaverGrade', () => {
  it('classifies golden-master for 80+', () => {
    expect(classifyWeaverGrade(80)).toBe('golden-master')
    expect(classifyWeaverGrade(100)).toBe('golden-master')
  })

  it('classifies master-weaver for 65-79', () => {
    expect(classifyWeaverGrade(65)).toBe('master-weaver')
    expect(classifyWeaverGrade(79)).toBe('master-weaver')
  })

  it('classifies skilled-artisan for 50-64', () => {
    expect(classifyWeaverGrade(50)).toBe('skilled-artisan')
    expect(classifyWeaverGrade(64)).toBe('skilled-artisan')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyWeaverGrade(35)).toBe('apprentice')
    expect(classifyWeaverGrade(49)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyWeaverGrade(20)).toBe('novice')
    expect(classifyWeaverGrade(34)).toBe('novice')
  })

  it('classifies thread-breaker for 0-19', () => {
    expect(classifyWeaverGrade(0)).toBe('thread-breaker')
    expect(classifyWeaverGrade(19)).toBe('thread-breaker')
  })
})

// ─── classifyLoomCondition ─────────────────────────────────────

describe('classifyLoomCondition', () => {
  it('classifies golden-palace for 85+', () => {
    expect(classifyLoomCondition(85)).toBe('golden-palace')
  })

  it('classifies radiant-hall for 70-84', () => {
    expect(classifyLoomCondition(70)).toBe('radiant-hall')
  })

  it('classifies proper-chamber for 55-69', () => {
    expect(classifyLoomCondition(55)).toBe('proper-chamber')
  })

  it('classifies faded-room for 35-54', () => {
    expect(classifyLoomCondition(35)).toBe('faded-room')
  })

  it('classifies dark-corner for 15-34', () => {
    expect(classifyLoomCondition(15)).toBe('dark-corner')
  })

  it('classifies void for 0-14', () => {
    expect(classifyLoomCondition(0)).toBe('void')
  })
})

// ─── analyzeGoldenThread ───────────────────────────────────────

describe('analyzeGoldenThread', () => {
  it('analyzes minimal content', () => {
    const thread = analyzeGoldenThread(minimalContent, 'minimal.ts')
    expect(thread.file).toBe('minimal.ts')
    expect(thread.radiantClarity).toBe(0)
    expect(thread.veilElegance).toBe(0)
    expect(thread.aurumPurity).toBe(0)
    expect(thread.goldenResilience).toBe(0)
    expect(thread.legacyWisdom).toBe(0)
    expect(thread.qualityScore).toBe(0)
    expect(thread.condition).toBe('void')
    expect(thread.illuminating.radiance).toBe('no-clarity')
    expect(thread.weaving.veil).toBe('no-elegance')
    expect(thread.purifying.aurum).toBe('no-purity')
    expect(thread.enduring.gold).toBe('no-resilience')
    expect(thread.inheriting.legacy).toBe('no-wisdom')
  })

  it('analyzes rich content', () => {
    const thread = analyzeGoldenThread(richContent, 'rich.ts')
    expect(thread.file).toBe('rich.ts')
    expect(thread.radiantClarity).toBe(100)
    expect(thread.veilElegance).toBe(100)
    expect(thread.aurumPurity).toBe(100)
    expect(thread.goldenResilience).toBe(100)
    expect(thread.legacyWisdom).toBe(100)
    expect(thread.qualityScore).toBe(100)
    expect(thread.condition).toBe('golden-masterpiece')
    expect(thread.illuminating.radiance).toBe('golden-light')
    expect(thread.weaving.veil).toBe('golden-gossamer')
    expect(thread.purifying.aurum).toBe('pure-gold')
    expect(thread.enduring.gold).toBe('eternal-gold')
    expect(thread.inheriting.legacy).toBe('ancient-gold')
  })

  it('computes qualityScore as weighted average', () => {
    const thread = analyzeGoldenThread('export const x = 1', 'mid.ts')
    const expected = Math.round(
      thread.radiantClarity * 0.2 +
      thread.veilElegance * 0.2 +
      thread.aurumPurity * 0.2 +
      thread.goldenResilience * 0.2 +
      thread.legacyWisdom * 0.2,
    )
    expect(thread.qualityScore).toBe(expected)
  })
})

// ─── analyzeGoldenLoom ───────────────────────────────────────

describe('analyzeGoldenLoom', () => {
  it('returns empty loom for empty threads', () => {
    const loom = analyzeGoldenLoom([], 'empty-dir')
    expect(loom.directory).toBe('empty-dir')
    expect(loom.threads).toHaveLength(0)
    expect(loom.avgClarity).toBe(0)
    expect(loom.loomType).toBe('no-loom')
    expect(loom.condition).toBe('void')
  })

  it('analyzes loom with rich threads', () => {
    const threads = [
      analyzeGoldenThread(richContent, 'dir/a.ts'),
      analyzeGoldenThread(richContent, 'dir/b.ts'),
    ]
    const loom = analyzeGoldenLoom(threads, 'dir')
    expect(loom.avgClarity).toBe(100)
    expect(loom.goldenMasterpieceCount).toBe(2)
    expect(loom.voidCount).toBe(0)
    expect(loom.loomType).toBe('master-loom')
  })

  it('analyzes loom with mixed threads', () => {
    const threads = [
      analyzeGoldenThread(richContent, 'dir/a.ts'),
      analyzeGoldenThread(minimalContent, 'dir/b.ts'),
    ]
    const loom = analyzeGoldenLoom(threads, 'dir')
    expect(loom.goldenMasterpieceCount).toBe(1)
    expect(loom.voidCount).toBe(1)
  })
})

// ─── buildGoldenVeilResult ──────────────────────────────────

describe('buildGoldenVeilResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildGoldenVeilResult([], [])
    expect(result.threads).toHaveLength(0)
    expect(result.looms).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallRadiance).toBe(0)
    expect(result.stats.weaverGrade).toBe('thread-breaker')
    expect(result.tapestry.isGolden).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildGoldenVeilResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.threads).toHaveLength(2)
    expect(result.looms).toHaveLength(1)
    expect(result.stats.avgRadiantClarity).toBe(100)
    expect(result.stats.avgVeilElegance).toBe(100)
    expect(result.stats.avgAurumPurity).toBe(100)
    expect(result.stats.avgGoldenResilience).toBe(100)
    expect(result.stats.avgLegacyWisdom).toBe(100)
    expect(result.stats.goldenMasterpieceCount).toBe(2)
    expect(result.stats.voidCount).toBe(0)
    expect(result.stats.hasHighClarityCount).toBe(2)
    expect(result.stats.hasHighEleganceCount).toBe(2)
    expect(result.stats.hasHighPurityCount).toBe(2)
    expect(result.stats.hasHighResilienceCount).toBe(2)
    expect(result.stats.hasHighWisdomCount).toBe(2)
    expect(result.stats.overallRadiance).toBe(100)
    expect(result.stats.weaverGrade).toBe('golden-master')
    expect(result.tapestry.isGolden).toBe(true)
    expect(result.stats.bestThread).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostElegant).toBeTruthy()
    expect(result.stats.purest).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildGoldenVeilResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.looms).toHaveLength(2)
    const dirs = result.looms.map(l => l.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall radiance correctly', async () => {
    const result = await buildGoldenVeilResult(['a.ts'], [minimalContent])
    expect(result.tapestry.overallRadiance).toBe(0)
  })

  it('sets isGolden when overallRadiance >= 60', async () => {
    const result = await buildGoldenVeilResult(['a.ts'], [richContent])
    expect(result.tapestry.isGolden).toBe(true)
  })

  it('sets isGolden false when overallRadiance < 60', async () => {
    const result = await buildGoldenVeilResult(['a.ts'], [minimalContent])
    expect(result.tapestry.isGolden).toBe(false)
  })

  it('picks best thread by qualityScore', async () => {
    const result = await buildGoldenVeilResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestThread).toBe('high.ts')
    expect(result.stats.clearest).toBe('high.ts')
    expect(result.stats.mostElegant).toBe('high.ts')
    expect(result.stats.purest).toBe('high.ts')
    expect(result.stats.mostResilient).toBe('high.ts')
    expect(result.stats.wisest).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildGoldenVeilResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.goldenMasterpieceCount).toBe(1)
    expect(result.stats.voidCount).toBe(1)
  })
})

// ─── generateRecommendations ────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildGoldenVeilResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your golden veil shines with divine radiance! Every thread is a masterpiece of golden craftsmanship',
    ])
  })

  it('recommends improving radiant clarity when low', async () => {
    const result = await buildGoldenVeilResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('clarity'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving veil elegance when low', async () => {
    const result = await buildGoldenVeilResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('elegance'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving aurum purity when low', async () => {
    const result = await buildGoldenVeilResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('purity'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving golden resilience when low', async () => {
    const result = await buildGoldenVeilResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('resilience'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving legacy wisdom when low', async () => {
    const result = await buildGoldenVeilResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('wisdom'))
    expect(rec).toBeTruthy()
  })

  it('warns about void threads', async () => {
    const result = await buildGoldenVeilResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Reweave') || r.includes('broken'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall radiance', async () => {
    const result = await buildGoldenVeilResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('veil') || r.includes('dimmed'))
    expect(rec).toBeTruthy()
  })

  it('lists specific void threads to reweave', async () => {
    const result = await buildGoldenVeilResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Reweave these'))
    expect(rec).toBeTruthy()
  })

  it('warns when all looms are poor', async () => {
    const result = await buildGoldenVeilResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('fading') || r.includes('reweaving') || r.includes('strategy'))
    expect(rec).toBeTruthy()
  })
})

// ─── Format Helpers ──────────────────────────────────────────────

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
  it('returns a string for golden-masterpiece', () => {
    expect(typeof colorCondition('golden-masterpiece')).toBe('string')
  })

  it('returns a string for void', () => {
    expect(typeof colorCondition('void')).toBe('string')
  })

  it('returns a string for unknown condition', () => {
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('formatThreadTable', () => {
  it('formats a thread', () => {
    const thread = analyzeGoldenThread(richContent, 'test.ts')
    const output = formatThreadTable(thread)
    expect(output).toContain('test.ts')
    expect(output).toContain('Radiant Clarity')
    expect(output).toContain('Veil Elegance')
    expect(output).toContain('Aurum Purity')
    expect(output).toContain('Golden Resilience')
    expect(output).toContain('Legacy Wisdom')
  })
})

describe('formatThreadsTable', () => {
  it('handles empty threads', () => {
    const output = formatThreadsTable([])
    expect(output).toContain('No golden threads')
  })

  it('formats multiple threads', () => {
    const threads = [
      analyzeGoldenThread(richContent, 'a.ts'),
      analyzeGoldenThread(minimalContent, 'b.ts'),
    ]
    const output = formatThreadsTable(threads)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatLoomTable', () => {
  it('formats a loom', () => {
    const threads = [analyzeGoldenThread(richContent, 'dir/a.ts')]
    const loom = analyzeGoldenLoom(threads, 'dir')
    const output = formatLoomTable(loom)
    expect(output).toContain('dir')
    expect(output).toContain('Loom')
  })
})

describe('formatLoomsTable', () => {
  it('handles empty looms', () => {
    const output = formatLoomsTable([])
    expect(output).toContain('No golden looms')
  })

  it('formats multiple looms', () => {
    const threads = [analyzeGoldenThread(richContent, 'src/a.ts')]
    const looms = [analyzeGoldenLoom(threads, 'src')]
    const output = formatLoomsTable(looms)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildGoldenVeilResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Golden Veil Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Weaver Grade')
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
    const result = await buildGoldenVeilResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Golden Veil Analysis')
    expect(output).toContain('Golden Threads')
    expect(output).toContain('Golden Looms')
    expect(output).toContain('Tapestry Overview')
    expect(output).toContain('Golden Veil Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildGoldenVeilResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.threads).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.tapestry.isGolden).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const thread = analyzeGoldenThread('   \n\t  ', 'blank.ts')
    expect(thread.radiantClarity).toBe(0)
    expect(thread.qualityScore).toBe(0)
    expect(thread.condition).toBe('void')
  })

  it('handles content with only comments', () => {
    const thread = analyzeGoldenThread('// just a comment\n/* block */', 'comment.ts')
    expect(thread.radiantClarity).toBe(0)
    expect(thread.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildGoldenVeilResult(['big.ts'], [longContent])
    expect(result.threads).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildGoldenVeilResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.goldenMasterpieceCount).toBe(50)
  })

  it('handles single file loom', async () => {
    const result = await buildGoldenVeilResult(['single.ts'], [richContent])
    expect(result.looms).toHaveLength(1)
    expect(result.looms[0]!.threads).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const thread = analyzeGoldenThread(richContent, 'cap.ts')
    expect(thread.qualityScore).toBeLessThanOrEqual(100)
    expect(thread.radiantClarity).toBeLessThanOrEqual(100)
    expect(thread.veilElegance).toBeLessThanOrEqual(100)
    expect(thread.aurumPurity).toBeLessThanOrEqual(100)
    expect(thread.goldenResilience).toBeLessThanOrEqual(100)
    expect(thread.legacyWisdom).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildGoldenVeilResult([], [])
    const r2 = await buildGoldenVeilResult(['a.ts'], [richContent])
    const r3 = await buildGoldenVeilResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
