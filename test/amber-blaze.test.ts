import { describe, it, expect } from 'vitest'
import {
  measurePreserving,
  measureIlluminating,
  measurePersisting,
  measureLearning,
  measureBinding,
  classifyEmberCondition,
  classifyHearthType,
  classifyKeeperGrade,
  classifyHearthCondition,
  analyzeAmberGlow,
  analyzeAmberHearth,
  buildAmberEmberResult,
  generateRecommendations,
} from '../src/commands/amber-blaze-helpers.js'
import {
  colorScore,
  colorCondition,
  formatGlowTable,
  formatGlowsTable,
  formatHearthTable,
  formatHearthsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/amber-blaze-format-helpers.js'

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

// ─── measurePreserving ──────────────────────────────────────────────

describe('measurePreserving', () => {
  it('returns 0 for empty content', () => {
    const m = measurePreserving('')
    expect(m.warmth).toBe(0)
    expect(m.amber).toBe('no-warmth')
    expect(m.hasHighWarmth).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measurePreserving(minimalContent)
    expect(m.warmth).toBe(0)
    expect(m.amber).toBe('no-warmth')
    expect(m.hasDocumented).toBe(false)
    expect(m.hasNoUndocumented).toBe(true)
    expect(m.hasNoUntested).toBe(true)
    expect(m.undocumentedCount).toBe(0)
    expect(m.untestedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measurePreserving(richContent)
    expect(m.warmth).toBe(100)
    expect(m.amber).toBe('golden-preservation')
    expect(m.hasHighWarmth).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasEncapsulated).toBe(true)
    expect(m.hasMaintained).toBe(true)
    expect(m.hasStable).toBe(true)
    expect(m.hasValuable).toBe(true)
    expect(m.hasPreserved).toBe(true)
  })

  it('detects undocumented any usage', () => {
    const m = measurePreserving('const x: any = 1')
    expect(m.undocumentedCount).toBe(1)
    expect(m.hasNoUndocumented).toBe(false)
  })

  it('detects untested var usage', () => {
    const m = measurePreserving('var x = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
  })
})

// ─── measureIlluminating ────────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns 0 for empty content', () => {
    const m = measureIlluminating('')
    expect(m.clarity).toBe(0)
    expect(m.glow).toBe('no-glow')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureIlluminating(minimalContent)
    expect(m.clarity).toBe(0)
    expect(m.glow).toBe('no-glow')
    expect(m.hasReadable).toBe(false)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.crypticCount).toBe(0)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureIlluminating(richContent)
    expect(m.clarity).toBe(100)
    expect(m.glow).toBe('radiant-amber')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasObvious).toBe(true)
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

// ─── measurePersisting ──────────────────────────────────────────────

describe('measurePersisting', () => {
  it('returns 0 for empty content', () => {
    const m = measurePersisting('')
    expect(m.persistence).toBe(0)
    expect(m.fire).toBe('no-persistence')
    expect(m.hasHighPersistence).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measurePersisting(minimalContent)
    expect(m.persistence).toBe(0)
    expect(m.fire).toBe('no-persistence')
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasNoFragile).toBe(true)
    expect(m.bareCrashCount).toBe(0)
    expect(m.fragileCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measurePersisting(richContent)
    expect(m.persistence).toBe(100)
    expect(m.fire).toBe('eternal-ember')
    expect(m.hasHighPersistence).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasRecoverable).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasEnduring).toBe(true)
    expect(m.hasReliable).toBe(true)
  })

  it('detects bare crash eval usage', () => {
    const m = measurePersisting('eval("1")')
    expect(m.bareCrashCount).toBe(1)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects fragile var usage', () => {
    const m = measurePersisting('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })
})

// ─── measureLearning ────────────────────────────────────────────────

describe('measureLearning', () => {
  it('returns 0 for empty content', () => {
    const m = measureLearning('')
    expect(m.wisdom).toBe(0)
    expect(m.ash).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureLearning(minimalContent)
    expect(m.wisdom).toBe(0)
    expect(m.ash).toBe('no-wisdom')
    expect(m.hasWellArchitected).toBe(false)
    expect(m.hasNoHacked).toBe(true)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.hackedCount).toBe(0)
    expect(m.adHocCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureLearning(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.ash).toBe('ancient-wisdom')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasStrategic).toBe(true)
  })

  it('detects hacked var usage', () => {
    const m = measureLearning('var x = 1')
    expect(m.hackedCount).toBe(1)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects ad-hoc any usage', () => {
    const m = measureLearning('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })
})

// ─── measureBinding ─────────────────────────────────────────────────

describe('measureBinding', () => {
  it('returns 0 for empty content', () => {
    const m = measureBinding('')
    expect(m.strength).toBe(0)
    expect(m.resin).toBe('no-strength')
    expect(m.hasHighStrength).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureBinding(minimalContent)
    expect(m.strength).toBe(0)
    expect(m.resin).toBe('no-strength')
    expect(m.hasWellStructured).toBe(false)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.hasNoTangled).toBe(true)
    expect(m.chaoticCount).toBe(0)
    expect(m.tangledCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureBinding(richContent)
    expect(m.strength).toBe(100)
    expect(m.resin).toBe('diamond-hard-resin')
    expect(m.hasHighStrength).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasOrganized).toBe(true)
    expect(m.hasCleanPipelines).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasCohesive).toBe(true)
    expect(m.hasStrong).toBe(true)
    expect(m.hasSolid).toBe(true)
  })

  it('detects chaotic var usage', () => {
    const m = measureBinding('var x = 1')
    expect(m.chaoticCount).toBe(1)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects tangled any usage', () => {
    const m = measureBinding('const x: any = 1')
    expect(m.tangledCount).toBe(1)
    expect(m.hasNoTangled).toBe(false)
  })
})

// ─── classifyEmberCondition ─────────────────────────────────────────

describe('classifyEmberCondition', () => {
  it('classifies amber-masterpiece for 90+', () => {
    expect(classifyEmberCondition(90)).toBe('amber-masterpiece')
    expect(classifyEmberCondition(100)).toBe('amber-masterpiece')
  })

  it('classifies golden-ember for 75-89', () => {
    expect(classifyEmberCondition(75)).toBe('golden-ember')
    expect(classifyEmberCondition(89)).toBe('golden-ember')
  })

  it('classifies proper-glow for 60-74', () => {
    expect(classifyEmberCondition(60)).toBe('proper-glow')
    expect(classifyEmberCondition(74)).toBe('proper-glow')
  })

  it('classifies cool-stone for 40-59', () => {
    expect(classifyEmberCondition(40)).toBe('cool-stone')
    expect(classifyEmberCondition(59)).toBe('cool-stone')
  })

  it('classifies dead-ash for 20-39', () => {
    expect(classifyEmberCondition(20)).toBe('dead-ash')
    expect(classifyEmberCondition(39)).toBe('dead-ash')
  })

  it('classifies void for 0-19', () => {
    expect(classifyEmberCondition(0)).toBe('void')
    expect(classifyEmberCondition(19)).toBe('void')
  })
})

// ─── classifyHearthType ─────────────────────────────────────────────

describe('classifyHearthType', () => {
  it('returns no-hearth for empty glows', () => {
    expect(classifyHearthType([])).toBe('no-hearth')
  })

  it('classifies grand-fireplace for high avg', () => {
    const glows = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeAmberGlow(richContent, `f${i}.ts`),
    }))
    expect(classifyHearthType(glows)).toBe('grand-fireplace')
  })

  it('classifies no-hearth for low scores', () => {
    const glows = [analyzeAmberGlow('', 'a.ts')]
    expect(classifyHearthType(glows)).toBe('no-hearth')
  })

  it('classifies warm-hearth for mid-high scores', () => {
    const glows = Array.from({ length: 3 }, () => ({
      ...analyzeAmberGlow(richContent, 'f.ts'),
      qualityScore: 75,
      condition: 'golden-ember' as const,
    }))
    expect(classifyHearthType(glows)).toBe('warm-hearth')
  })

  it('classifies proper-fire for mid scores', () => {
    const glows = Array.from({ length: 3 }, () => ({
      ...analyzeAmberGlow(richContent, 'f.ts'),
      qualityScore: 60,
      condition: 'proper-glow' as const,
    }))
    expect(classifyHearthType(glows)).toBe('proper-fire')
  })

  it('classifies small-flame for low scores', () => {
    const glows = Array.from({ length: 3 }, () => ({
      ...analyzeAmberGlow(richContent, 'f.ts'),
      qualityScore: 36,
      condition: 'cool-stone' as const,
    }))
    expect(classifyHearthType(glows)).toBe('small-flame')
  })

  it('classifies cold-ash for very low scores', () => {
    const glows = Array.from({ length: 3 }, () => ({
      ...analyzeAmberGlow(richContent, 'f.ts'),
      qualityScore: 18,
      condition: 'void' as const,
    }))
    expect(classifyHearthType(glows)).toBe('cold-ash')
  })
})

// ─── classifyKeeperGrade ────────────────────────────────────────────

describe('classifyKeeperGrade', () => {
  it('classifies amber-keeper for 80+', () => {
    expect(classifyKeeperGrade(80)).toBe('amber-keeper')
    expect(classifyKeeperGrade(100)).toBe('amber-keeper')
  })

  it('classifies fire-tender for 65-79', () => {
    expect(classifyKeeperGrade(65)).toBe('fire-tender')
    expect(classifyKeeperGrade(79)).toBe('fire-tender')
  })

  it('classifies ember-guardian for 50-64', () => {
    expect(classifyKeeperGrade(50)).toBe('ember-guardian')
    expect(classifyKeeperGrade(64)).toBe('ember-guardian')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyKeeperGrade(35)).toBe('apprentice')
    expect(classifyKeeperGrade(49)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyKeeperGrade(20)).toBe('novice')
    expect(classifyKeeperGrade(34)).toBe('novice')
  })

  it('classifies ash-scatterer for 0-19', () => {
    expect(classifyKeeperGrade(0)).toBe('ash-scatterer')
    expect(classifyKeeperGrade(19)).toBe('ash-scatterer')
  })
})

// ─── classifyHearthCondition ────────────────────────────────────────

describe('classifyHearthCondition', () => {
  it('classifies amber-temple for 85+', () => {
    expect(classifyHearthCondition(85)).toBe('amber-temple')
  })

  it('classifies golden-hearth for 70-84', () => {
    expect(classifyHearthCondition(70)).toBe('golden-hearth')
  })

  it('classifies proper-fireplace for 55-69', () => {
    expect(classifyHearthCondition(55)).toBe('proper-fireplace')
  })

  it('classifies cool-hearth for 35-54', () => {
    expect(classifyHearthCondition(35)).toBe('cool-hearth')
  })

  it('classifies dead-ashes for 15-34', () => {
    expect(classifyHearthCondition(15)).toBe('dead-ashes')
  })

  it('classifies void for 0-14', () => {
    expect(classifyHearthCondition(0)).toBe('void')
  })
})

// ─── analyzeAmberGlow ───────────────────────────────────────────────

describe('analyzeAmberGlow', () => {
  it('analyzes minimal content', () => {
    const glow = analyzeAmberGlow(minimalContent, 'minimal.ts')
    expect(glow.file).toBe('minimal.ts')
    expect(glow.preservationWarmth).toBe(0)
    expect(glow.glowClarity).toBe(0)
    expect(glow.firePersistence).toBe(0)
    expect(glow.ashWisdom).toBe(0)
    expect(glow.resinStrength).toBe(0)
    expect(glow.qualityScore).toBe(0)
    expect(glow.condition).toBe('void')
    expect(glow.preserving.amber).toBe('no-warmth')
    expect(glow.illuminating.glow).toBe('no-glow')
    expect(glow.persisting.fire).toBe('no-persistence')
    expect(glow.learning.ash).toBe('no-wisdom')
    expect(glow.binding.resin).toBe('no-strength')
  })

  it('analyzes rich content', () => {
    const glow = analyzeAmberGlow(richContent, 'rich.ts')
    expect(glow.file).toBe('rich.ts')
    expect(glow.preservationWarmth).toBe(100)
    expect(glow.glowClarity).toBe(100)
    expect(glow.firePersistence).toBe(100)
    expect(glow.ashWisdom).toBe(100)
    expect(glow.resinStrength).toBe(100)
    expect(glow.qualityScore).toBe(100)
    expect(glow.condition).toBe('amber-masterpiece')
    expect(glow.preserving.amber).toBe('golden-preservation')
    expect(glow.illuminating.glow).toBe('radiant-amber')
    expect(glow.persisting.fire).toBe('eternal-ember')
    expect(glow.learning.ash).toBe('ancient-wisdom')
    expect(glow.binding.resin).toBe('diamond-hard-resin')
  })

  it('computes qualityScore as weighted average', () => {
    const glow = analyzeAmberGlow('export const x = 1', 'mid.ts')
    const expected = Math.round(
      glow.preservationWarmth * 0.2 +
      glow.glowClarity * 0.2 +
      glow.firePersistence * 0.2 +
      glow.ashWisdom * 0.2 +
      glow.resinStrength * 0.2,
    )
    expect(glow.qualityScore).toBe(expected)
  })
})

// ─── analyzeAmberHearth ─────────────────────────────────────────────

describe('analyzeAmberHearth', () => {
  it('returns empty hearth for empty glows', () => {
    const hearth = analyzeAmberHearth([], 'empty-dir')
    expect(hearth.directory).toBe('empty-dir')
    expect(hearth.glows).toHaveLength(0)
    expect(hearth.avgWarmth).toBe(0)
    expect(hearth.hearthType).toBe('no-hearth')
    expect(hearth.condition).toBe('void')
  })

  it('analyzes hearth with rich glows', () => {
    const glows = [
      analyzeAmberGlow(richContent, 'dir/a.ts'),
      analyzeAmberGlow(richContent, 'dir/b.ts'),
    ]
    const hearth = analyzeAmberHearth(glows, 'dir')
    expect(hearth.avgWarmth).toBe(100)
    expect(hearth.amberMasterpieceCount).toBe(2)
    expect(hearth.voidCount).toBe(0)
    expect(hearth.hearthType).toBe('grand-fireplace')
  })

  it('analyzes hearth with mixed glows', () => {
    const glows = [
      analyzeAmberGlow(richContent, 'dir/a.ts'),
      analyzeAmberGlow(minimalContent, 'dir/b.ts'),
    ]
    const hearth = analyzeAmberHearth(glows, 'dir')
    expect(hearth.amberMasterpieceCount).toBe(1)
    expect(hearth.voidCount).toBe(1)
  })
})

// ─── buildAmberEmberResult ──────────────────────────────────────────

describe('buildAmberEmberResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildAmberEmberResult([], [])
    expect(result.glows).toHaveLength(0)
    expect(result.hearths).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallRadiance).toBe(0)
    expect(result.stats.keeperGrade).toBe('ash-scatterer')
    expect(result.fire.isAmber).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildAmberEmberResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.glows).toHaveLength(2)
    expect(result.hearths).toHaveLength(1)
    expect(result.stats.avgPreservationWarmth).toBe(100)
    expect(result.stats.avgGlowClarity).toBe(100)
    expect(result.stats.avgFirePersistence).toBe(100)
    expect(result.stats.avgAshWisdom).toBe(100)
    expect(result.stats.avgResinStrength).toBe(100)
    expect(result.stats.amberMasterpieceCount).toBe(2)
    expect(result.stats.voidCount).toBe(0)
    expect(result.stats.hasHighWarmthCount).toBe(2)
    expect(result.stats.hasHighClarityCount).toBe(2)
    expect(result.stats.hasHighPersistenceCount).toBe(2)
    expect(result.stats.hasHighWisdomCount).toBe(2)
    expect(result.stats.hasHighStrengthCount).toBe(2)
    expect(result.stats.overallRadiance).toBe(100)
    expect(result.stats.keeperGrade).toBe('amber-keeper')
    expect(result.fire.isAmber).toBe(true)
    expect(result.stats.bestGlow).toBeTruthy()
    expect(result.stats.warmest).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPersistent).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
    expect(result.stats.strongest).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildAmberEmberResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.hearths).toHaveLength(2)
    const dirs = result.hearths.map(h => h.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall radiance correctly', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [minimalContent])
    expect(result.fire.overallRadiance).toBe(0)
  })

  it('sets isAmber when overallRadiance >= 60', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [richContent])
    expect(result.fire.isAmber).toBe(true)
  })

  it('sets isAmber false when overallRadiance < 60', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [minimalContent])
    expect(result.fire.isAmber).toBe(false)
  })

  it('picks best glow by qualityScore', async () => {
    const result = await buildAmberEmberResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestGlow).toBe('high.ts')
    expect(result.stats.warmest).toBe('high.ts')
    expect(result.stats.clearest).toBe('high.ts')
    expect(result.stats.mostPersistent).toBe('high.ts')
    expect(result.stats.wisest).toBe('high.ts')
    expect(result.stats.strongest).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildAmberEmberResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.amberMasterpieceCount).toBe(1)
    expect(result.stats.voidCount).toBe(1)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your amber ember burns with eternal warmth! Every glow is preservation, every ember is wisdom',
    ])
  })

  it('recommends improving preservation warmth when low', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('preservation'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving glow clarity when low', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('glow'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving fire persistence when low', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('persistence'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving ash wisdom when low', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('wisdom'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving resin strength when low', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('resin'))
    expect(rec).toBeTruthy()
  })

  it('warns about dead ashes', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Rekindle') || r.includes('dead ash'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall radiance', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('radiance'))
    expect(rec).toBeTruthy()
  })

  it('lists specific dead ashes to rekindle', async () => {
    const result = await buildAmberEmberResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Rekindle these'))
    expect(rec).toBeTruthy()
  })

  it('warns when all hearths are cold-ash/no-hearth', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('cold') || r.includes('empty') || r.includes('dead code'))
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
  it('returns a string for amber-masterpiece', () => {
    expect(typeof colorCondition('amber-masterpiece')).toBe('string')
  })

  it('returns a string for void', () => {
    expect(typeof colorCondition('void')).toBe('string')
  })

  it('returns a string for unknown condition', () => {
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('formatGlowTable', () => {
  it('formats a glow', () => {
    const glow = analyzeAmberGlow(richContent, 'test.ts')
    const output = formatGlowTable(glow)
    expect(output).toContain('test.ts')
    expect(output).toContain('Preservation Warmth')
    expect(output).toContain('Glow Clarity')
    expect(output).toContain('Fire Persistence')
    expect(output).toContain('Ash Wisdom')
    expect(output).toContain('Resin Strength')
  })
})

describe('formatGlowsTable', () => {
  it('handles empty glows', () => {
    const output = formatGlowsTable([])
    expect(output).toContain('No amber glows')
  })

  it('formats multiple glows', () => {
    const glows = [
      analyzeAmberGlow(richContent, 'a.ts'),
      analyzeAmberGlow(minimalContent, 'b.ts'),
    ]
    const output = formatGlowsTable(glows)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatHearthTable', () => {
  it('formats a hearth', () => {
    const glows = [analyzeAmberGlow(richContent, 'dir/a.ts')]
    const hearth = analyzeAmberHearth(glows, 'dir')
    const output = formatHearthTable(hearth)
    expect(output).toContain('dir')
    expect(output).toContain('Hearth')
  })
})

describe('formatHearthsTable', () => {
  it('handles empty hearths', () => {
    const output = formatHearthsTable([])
    expect(output).toContain('No amber hearths')
  })

  it('formats multiple hearths', () => {
    const glows = [analyzeAmberGlow(richContent, 'src/a.ts')]
    const hearths = [analyzeAmberHearth(glows, 'src')]
    const output = formatHearthsTable(hearths)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Amber Ember Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Keeper Grade')
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
    const result = await buildAmberEmberResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Amber Ember Analysis')
    expect(output).toContain('Amber Glows')
    expect(output).toContain('Amber Hearths')
    expect(output).toContain('Fire Overview')
    expect(output).toContain('Amber Ember Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildAmberEmberResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.glows).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.fire.isAmber).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const glow = analyzeAmberGlow('   \n\t  ', 'blank.ts')
    expect(glow.preservationWarmth).toBe(0)
    expect(glow.qualityScore).toBe(0)
    expect(glow.condition).toBe('void')
  })

  it('handles content with only comments', () => {
    const glow = analyzeAmberGlow('// just a comment\n/* block */', 'comment.ts')
    expect(glow.preservationWarmth).toBe(0)
    expect(glow.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildAmberEmberResult(['big.ts'], [longContent])
    expect(result.glows).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildAmberEmberResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.amberMasterpieceCount).toBe(50)
  })

  it('handles single file hearth', async () => {
    const result = await buildAmberEmberResult(['single.ts'], [richContent])
    expect(result.hearths).toHaveLength(1)
    expect(result.hearths[0]!.glows).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const glow = analyzeAmberGlow(richContent, 'cap.ts')
    expect(glow.qualityScore).toBeLessThanOrEqual(100)
    expect(glow.preservationWarmth).toBeLessThanOrEqual(100)
    expect(glow.glowClarity).toBeLessThanOrEqual(100)
    expect(glow.firePersistence).toBeLessThanOrEqual(100)
    expect(glow.ashWisdom).toBeLessThanOrEqual(100)
    expect(glow.resinStrength).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildAmberEmberResult([], [])
    const r2 = await buildAmberEmberResult(['a.ts'], [richContent])
    const r3 = await buildAmberEmberResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
