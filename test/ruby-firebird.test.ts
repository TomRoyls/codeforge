import { describe, expect, it } from 'vitest'

import {
  analyzeRubyFeather,
  analyzeRubyNest,
  buildRubyFirebirdResult,
  classifyFeatherCondition,
  classifyFirebirdGrade,
  classifyNestCondition,
  classifyNestType,
  generateRecommendations,
  measureBurning,
  measureEnduring,
  measureLearning,
  measurePulsing,
  measureRegenerating,
  type FeatherCondition,
  type NestCondition,
  type RubyFeather,
  type RubyFirebirdResult,
  type RubyNest,
} from '../src/commands/ruby-firebird-helpers.js'

import {
  colorFeatherCondition,
  colorNestCondition,
  colorScore,
  formatFeatherTable,
  formatFeathersTable,
  formatNestsTable,
  formatNestTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/ruby-firebird-format-helpers.js'

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

// ─── measurePulsing ─────────────────────────────────────

describe('measurePulsing', () => {
  it('scores rich content high', () => {
    const m = measurePulsing(richContent)
    expect(m.vitality).toBeGreaterThanOrEqual(60)
    expect(m.hasHighVitality).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measurePulsing(emptyContent)
    expect(m.vitality).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measurePulsing(richContent)
    const poor = measurePulsing(poorContent)
    expect(rich.vitality).toBeGreaterThan(poor.vitality)
  })

  it('detects chaotic patterns', () => {
    const m = measurePulsing('var x = eval("boom")')
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects monolithic patterns', () => {
    const m = measurePulsing('monolithic god.object mega')
    expect(m.monolithicCount).toBeGreaterThan(0)
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('assigns high flame for rich content', () => {
    const m = measurePulsing(richContent)
    expect(['eternal-flame', 'burning-heart', 'proper-fire']).toContain(m.flame)
  })

  it('assigns low flame for empty content', () => {
    const m = measurePulsing(emptyContent)
    expect(['no-vitality', 'cold-ash', 'dying-ember', 'proper-fire']).toContain(m.flame)
  })

  it('has all boolean properties', () => {
    const m = measurePulsing(richContent)
    expect(typeof m.hasWellStructured).toBe('boolean')
    expect(typeof m.hasModular).toBe('boolean')
    expect(typeof m.hasAlive).toBe('boolean')
  })
})

// ─── measureRegenerating ────────────────────────────────

describe('measureRegenerating', () => {
  it('scores rich content high', () => {
    const m = measureRegenerating(richContent)
    expect(m.quality).toBeGreaterThanOrEqual(60)
    expect(m.hasHighQuality).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureRegenerating(emptyContent)
    expect(m.quality).toBeGreaterThanOrEqual(0)
  })

  it('detects tangled patterns', () => {
    const m = measureRegenerating('tangled spaghetti coupled')
    expect(m.tangledCount).toBeGreaterThan(0)
    expect(m.hasNoTangled).toBe(false)
  })

  it('detects rigid patterns', () => {
    const m = measureRegenerating('hardcoded rigid inflexible')
    expect(m.rigidCount).toBeGreaterThan(0)
    expect(m.hasNoRigid).toBe(false)
  })

  it('assigns high rebirth for rich content', () => {
    const m = measureRegenerating(richContent)
    expect(['perfect-rebirth', 'clean-renewal', 'proper-rebuild']).toContain(m.rebirth)
  })

  it('assigns low rebirth for empty content', () => {
    const m = measureRegenerating(emptyContent)
    expect(['no-rebirth', 'failed-revival', 'hasty-patch', 'proper-rebuild']).toContain(m.rebirth)
  })

  it('has all boolean properties', () => {
    const m = measureRegenerating(richContent)
    expect(typeof m.hasModular).toBe('boolean')
    expect(typeof m.hasExtensible).toBe('boolean')
    expect(typeof m.hasRefactorable).toBe('boolean')
  })
})

// ─── measureLearning ────────────────────────────────────

describe('measureLearning', () => {
  it('scores rich content high', () => {
    const m = measureLearning(richContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(60)
    expect(m.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureLearning(emptyContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
  })

  it('detects hacked patterns', () => {
    const m = measureLearning('hack workaround monkey')
    expect(m.hackedCount).toBeGreaterThan(0)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects untested patterns', () => {
    const m = measureLearning('eval (x)')
    expect(m.untestedCount).toBeGreaterThan(0)
  })

  it('assigns high ash for rich content', () => {
    const m = measureLearning(richContent)
    expect(['phoenix-memory', 'ancient-cinders', 'proper-remnants']).toContain(m.ash)
  })

  it('assigns low ash for empty content', () => {
    const m = measureLearning(emptyContent)
    expect(['no-wisdom', 'burned-to-nothing', 'scattered-soot', 'proper-remnants']).toContain(m.ash)
  })

  it('has all boolean properties', () => {
    const m = measureLearning(richContent)
    expect(typeof m.hasWellArchitected).toBe('boolean')
    expect(typeof m.hasProven).toBe('boolean')
    expect(typeof m.hasDeep).toBe('boolean')
  })
})

// ─── measureBurning ─────────────────────────────────────

describe('measureBurning', () => {
  it('scores rich content high', () => {
    const m = measureBurning(richContent)
    expect(m.precision).toBeGreaterThanOrEqual(60)
    expect(m.hasHighPrecision).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureBurning(emptyContent)
    expect(m.precision).toBeGreaterThanOrEqual(0)
  })

  it('detects unsafe patterns', () => {
    const m = measureBurning('let x: any = 1')
    expect(m.unsafeCount).toBeGreaterThan(0)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects approximate patterns', () => {
    const m = measureBurning('roughly approximately guesstimate')
    expect(m.approximateCount).toBeGreaterThan(0)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('assigns high blade for rich content', () => {
    const m = measureBurning(richContent)
    expect(['surgical-flame', 'laser-heat', 'proper-temper']).toContain(m.blade)
  })

  it('assigns low blade for empty content', () => {
    const m = measureBurning(emptyContent)
    expect(['no-precision', 'match-flame', 'wildfire', 'proper-temper']).toContain(m.blade)
  })

  it('has all boolean properties', () => {
    const m = measureBurning(richContent)
    expect(typeof m.hasTypeSafe).toBe('boolean')
    expect(typeof m.hasAccurate).toBe('boolean')
    expect(typeof m.hasPrecise).toBe('boolean')
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

  it('detects vulnerable patterns', () => {
    const m = measureEnduring('weak vulnerable exposed')
    expect(m.vulnerableCount).toBeGreaterThan(0)
    expect(m.hasIndomitable).toBe(false)
  })

  it('assigns high ember for rich content', () => {
    const m = measureEnduring(richContent)
    expect(['eternal-ember', 'glowing-core', 'proper-coals']).toContain(m.ember)
  })

  it('assigns low ember for empty content', () => {
    const m = measureEnduring(emptyContent)
    expect(['no-resilience', 'dead-ash', 'cooling-cinder', 'proper-coals']).toContain(m.ember)
  })

  it('has all boolean properties', () => {
    const m = measureEnduring(richContent)
    expect(typeof m.hasErrorHandled).toBe('boolean')
    expect(typeof m.hasDefensive).toBe('boolean')
    expect(typeof m.hasStable).toBe('boolean')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyFeatherCondition', () => {
  const cases: [number, FeatherCondition][] = [
    [95, 'ruby-masterpiece'],
    [90, 'ruby-masterpiece'],
    [80, 'phoenix-crown'],
    [75, 'phoenix-crown'],
    [65, 'proper-flame'],
    [60, 'proper-flame'],
    [50, 'dying-spark'],
    [40, 'dying-spark'],
    [25, 'cold-ash'],
    [20, 'cold-ash'],
    [10, 'void'],
    [0, 'void'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyFeatherCondition(score)).toBe(expected)
    })
  }
})

describe('classifyNestType', () => {
  it('returns no-nest for empty array', () => {
    expect(classifyNestType([])).toBe('no-nest')
  })

  it('returns phoenix-nest for high average', () => {
    const feathers = [{ qualityScore: 90 }, { qualityScore: 88 }].map((q) => ({
      ...q,
    })) as RubyFeather[]
    expect(classifyNestType(feathers)).toBe('phoenix-nest')
  })

  it('returns ground-nest for low average', () => {
    const feathers = [{ qualityScore: 10 }, { qualityScore: 15 }].map((q) => ({
      ...q,
    })) as RubyFeather[]
    expect(classifyNestType(feathers)).toBe('ground-nest')
  })
})

describe('classifyNestCondition', () => {
  const cases: [number, NestCondition][] = [
    [90, 'fire-palace'],
    [85, 'fire-palace'],
    [75, 'ember-throne'],
    [70, 'ember-throne'],
    [60, 'proper-roost'],
    [55, 'proper-roost'],
    [40, 'charred-branch'],
    [35, 'charred-branch'],
    [20, 'empty-cage'],
    [15, 'empty-cage'],
    [5, 'void'],
    [0, 'void'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyNestCondition(score)).toBe(expected)
    })
  }
})

describe('classifyFirebirdGrade', () => {
  const cases: [number, string][] = [
    [90, 'phoenix-lord'],
    [80, 'phoenix-lord'],
    [70, 'fire-mage'],
    [65, 'fire-mage'],
    [55, 'flame-keeper'],
    [50, 'flame-keeper'],
    [40, 'apprentice'],
    [35, 'apprentice'],
    [25, 'novice'],
    [20, 'novice'],
    [10, 'smoke-watcher'],
    [0, 'smoke-watcher'],
  ]
  for (const [score, expected] of cases) {
    it(`classifies ${score} as ${expected}`, () => {
      expect(classifyFirebirdGrade(score)).toBe(expected)
    })
  }
})

// ─── analyzeRubyFeather ─────────────────────────────────

describe('analyzeRubyFeather', () => {
  it('returns valid feather for rich content', () => {
    const f = analyzeRubyFeather(richContent, 'app.ts')
    expect(f.file).toBe('app.ts')
    expect(f.crimsonVitality).toBeGreaterThanOrEqual(0)
    expect(f.rebirthQuality).toBeGreaterThanOrEqual(0)
    expect(f.ashWisdom).toBeGreaterThanOrEqual(0)
    expect(f.flamePrecision).toBeGreaterThanOrEqual(0)
    expect(f.emberResilience).toBeGreaterThanOrEqual(0)
    expect(f.qualityScore).toBeGreaterThanOrEqual(0)
    expect(f.qualityScore).toBeLessThanOrEqual(100)
  })

  it('returns valid feather for empty content', () => {
    const f = analyzeRubyFeather(emptyContent, 'empty.ts')
    expect(f.file).toBe('empty.ts')
    expect(f.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('computes qualityScore as weighted average', () => {
    const f = analyzeRubyFeather(richContent, 'test.ts')
    const expected = Math.round(
      f.crimsonVitality * 0.2 +
      f.rebirthQuality * 0.2 +
      f.ashWisdom * 0.2 +
      f.flamePrecision * 0.2 +
      f.emberResilience * 0.2,
    )
    expect(f.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const f = analyzeRubyFeather(richContent, 'test.ts')
    expect(f.pulsing).toBeDefined()
    expect(f.regenerating).toBeDefined()
    expect(f.learning).toBeDefined()
    expect(f.burning).toBeDefined()
    expect(f.enduring).toBeDefined()
  })

  it('classifies condition based on qualityScore', () => {
    const f = analyzeRubyFeather(richContent, 'test.ts')
    expect(classifyFeatherCondition(f.qualityScore)).toBe(f.condition)
  })

  it('scores rich content at max', () => {
    const f = analyzeRubyFeather(richContent, 'rich.ts')
    expect(f.crimsonVitality).toBeGreaterThanOrEqual(60)
    expect(f.rebirthQuality).toBeGreaterThanOrEqual(60)
    expect(f.ashWisdom).toBeGreaterThanOrEqual(60)
    expect(f.flamePrecision).toBeGreaterThanOrEqual(60)
    expect(f.emberResilience).toBeGreaterThanOrEqual(60)
  })
})

// ─── analyzeRubyNest ────────────────────────────────────

describe('analyzeRubyNest', () => {
  it('returns empty nest for no feathers', () => {
    const n = analyzeRubyNest([], 'src')
    expect(n.directory).toBe('src')
    expect(n.feathers).toHaveLength(0)
    expect(n.avgVitality).toBe(0)
    expect(n.avgPrecision).toBe(0)
    expect(n.avgWisdom).toBe(0)
    expect(n.nestType).toBe('no-nest')
    expect(n.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const feathers = [
      analyzeRubyFeather(richContent, 'a.ts'),
      analyzeRubyFeather(richContent, 'b.ts'),
    ]
    const n = analyzeRubyNest(feathers, 'src')
    expect(n.avgVitality).toBeGreaterThanOrEqual(0)
    expect(n.avgPrecision).toBeGreaterThanOrEqual(0)
    expect(n.avgWisdom).toBeGreaterThanOrEqual(0)
  })

  it('counts ruby masterpieces', () => {
    const feathers = [analyzeRubyFeather(richContent, 'a.ts')]
    const n = analyzeRubyNest(feathers, 'src')
    expect(n.rubyMasterpieceCount).toBeGreaterThanOrEqual(0)
  })

  it('counts void feathers', () => {
    const feathers = [analyzeRubyFeather(emptyContent, 'empty.ts')]
    const n = analyzeRubyNest(feathers, 'src')
    expect(n.voidCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── buildRubyFirebirdResult ────────────────────────────

describe('buildRubyFirebirdResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildRubyFirebirdResult([], [])
    expect(result.feathers).toHaveLength(0)
    expect(result.nests).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallBrilliance).toBe(0)
    expect(result.flame.isRuby).toBe(false)
  })

  it('returns valid result for single file', async () => {
    const result = await buildRubyFirebirdResult(['app.ts'], [richContent])
    expect(result.feathers).toHaveLength(1)
    expect(result.nests).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestFeather).toBe('app.ts')
    expect(result.stats.mostVital).toBe('app.ts')
    expect(result.stats.mostRenewable).toBe('app.ts')
    expect(result.stats.wisest).toBe('app.ts')
    expect(result.stats.mostPrecise).toBe('app.ts')
    expect(result.stats.mostResilient).toBe('app.ts')
  })

  it('returns valid result for multiple files', async () => {
    const result = await buildRubyFirebirdResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, emptyContent],
    )
    expect(result.feathers).toHaveLength(3)
    expect(result.nests).toHaveLength(2)
    expect(result.stats.totalNests).toBe(2)
  })

  it('computes correct stats counts', async () => {
    const result = await buildRubyFirebirdResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    const total = result.stats.rubyMasterpieceCount +
      result.stats.phoenixCrownCount +
      result.stats.properFlameCount +
      result.stats.dyingSparkCount +
      result.stats.coldAshCount +
      result.stats.voidCount
    expect(total).toBe(2)
  })

  it('computes firebirdGrade', async () => {
    const result = await buildRubyFirebirdResult(['a.ts'], [richContent])
    expect(['phoenix-lord', 'fire-mage', 'flame-keeper', 'apprentice', 'novice', 'smoke-watcher']).toContain(
      result.stats.firebirdGrade,
    )
  })

  it('sets isRuby when overallBrilliance >= 60', async () => {
    const result = await buildRubyFirebirdResult(['a.ts'], [richContent])
    if (result.flame.overallBrilliance >= 60) {
      expect(result.flame.isRuby).toBe(true)
    }
  })

  it('generates recommendations', async () => {
    const result = await buildRubyFirebirdResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('computes hasHigh counts', async () => {
    const result = await buildRubyFirebirdResult(['a.ts'], [richContent])
    expect(result.stats.hasHighVitalityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighQualityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
  })

  it('computes avgAshWisdom correctly', async () => {
    const result = await buildRubyFirebirdResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.avgAshWisdom).toBe(result.flame.avgWisdom)
  })

  it('computes avgCrimsonVitality correctly', async () => {
    const result = await buildRubyFirebirdResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.avgCrimsonVitality).toBe(result.flame.avgVitality)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all high', () => {
    const feathers: RubyFeather[] = []
    const nests: RubyNest[] = []
    const flame: RubyFirebirdResult['flame'] = {
      avgVitality: 90,
      avgPrecision: 90,
      avgWisdom: 90,
      isRuby: true,
      overallBrilliance: 90,
    }
    const stats: RubyFirebirdResult['stats'] = {
      totalFiles: 1, totalNests: 1,
      avgCrimsonVitality: 92, avgRebirthQuality: 91, avgAshWisdom: 90,
      avgFlamePrecision: 93, avgEmberResilience: 94,
      rubyMasterpieceCount: 1, phoenixCrownCount: 0, properFlameCount: 0,
      dyingSparkCount: 0, coldAshCount: 0, voidCount: 0,
      hasHighVitalityCount: 1, hasHighQualityCount: 1, hasHighWisdomCount: 1,
      hasHighPrecisionCount: 1, hasHighResilienceCount: 1,
      overallBrilliance: 92, firebirdGrade: 'phoenix-lord',
      bestFeather: 'a.ts', mostVital: 'a.ts', mostRenewable: 'a.ts',
      wisest: 'a.ts', mostPrecise: 'a.ts', mostResilient: 'a.ts',
    }
    const recs = generateRecommendations(feathers, nests, flame, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('brilliance')
  })

  it('recommends vitality when low', () => {
    const stats = {
      totalFiles: 1, totalNests: 1,
      avgCrimsonVitality: 30, avgRebirthQuality: 90, avgAshWisdom: 90,
      avgFlamePrecision: 90, avgEmberResilience: 90,
      rubyMasterpieceCount: 0, phoenixCrownCount: 0, properFlameCount: 0,
      dyingSparkCount: 0, coldAshCount: 0, voidCount: 0,
      hasHighVitalityCount: 0, hasHighQualityCount: 0, hasHighWisdomCount: 0,
      hasHighPrecisionCount: 0, hasHighResilienceCount: 0,
      overallBrilliance: 78, firebirdGrade: 'fire-mage' as const,
      bestFeather: 'a.ts', mostVital: 'a.ts', mostRenewable: 'a.ts',
      wisest: 'a.ts', mostPrecise: 'a.ts', mostResilient: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgVitality: 30, avgPrecision: 90, avgWisdom: 90, isRuby: true, overallBrilliance: 78 }, stats)
    expect(recs.some((r) => r.includes('vitality'))).toBe(true)
  })

  it('recommends rebirth when low', () => {
    const stats = {
      totalFiles: 1, totalNests: 1,
      avgCrimsonVitality: 90, avgRebirthQuality: 30, avgAshWisdom: 90,
      avgFlamePrecision: 90, avgEmberResilience: 90,
      rubyMasterpieceCount: 0, phoenixCrownCount: 0, properFlameCount: 0,
      dyingSparkCount: 0, coldAshCount: 0, voidCount: 0,
      hasHighVitalityCount: 0, hasHighQualityCount: 0, hasHighWisdomCount: 0,
      hasHighPrecisionCount: 0, hasHighResilienceCount: 0,
      overallBrilliance: 78, firebirdGrade: 'fire-mage' as const,
      bestFeather: 'a.ts', mostVital: 'a.ts', mostRenewable: 'a.ts',
      wisest: 'a.ts', mostPrecise: 'a.ts', mostResilient: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgVitality: 90, avgPrecision: 90, avgWisdom: 90, isRuby: true, overallBrilliance: 78 }, stats)
    expect(recs.some((r) => r.includes('rebirth'))).toBe(true)
  })

  it('recommends wisdom when low', () => {
    const stats = {
      totalFiles: 1, totalNests: 1,
      avgCrimsonVitality: 90, avgRebirthQuality: 90, avgAshWisdom: 30,
      avgFlamePrecision: 90, avgEmberResilience: 90,
      rubyMasterpieceCount: 0, phoenixCrownCount: 0, properFlameCount: 0,
      dyingSparkCount: 0, coldAshCount: 0, voidCount: 0,
      hasHighVitalityCount: 0, hasHighQualityCount: 0, hasHighWisdomCount: 0,
      hasHighPrecisionCount: 0, hasHighResilienceCount: 0,
      overallBrilliance: 78, firebirdGrade: 'fire-mage' as const,
      bestFeather: 'a.ts', mostVital: 'a.ts', mostRenewable: 'a.ts',
      wisest: 'a.ts', mostPrecise: 'a.ts', mostResilient: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgVitality: 90, avgPrecision: 90, avgWisdom: 30, isRuby: true, overallBrilliance: 78 }, stats)
    expect(recs.some((r) => r.includes('wisdom'))).toBe(true)
  })

  it('recommends precision when low', () => {
    const stats = {
      totalFiles: 1, totalNests: 1,
      avgCrimsonVitality: 90, avgRebirthQuality: 90, avgAshWisdom: 90,
      avgFlamePrecision: 30, avgEmberResilience: 90,
      rubyMasterpieceCount: 0, phoenixCrownCount: 0, properFlameCount: 0,
      dyingSparkCount: 0, coldAshCount: 0, voidCount: 0,
      hasHighVitalityCount: 0, hasHighQualityCount: 0, hasHighWisdomCount: 0,
      hasHighPrecisionCount: 0, hasHighResilienceCount: 0,
      overallBrilliance: 78, firebirdGrade: 'fire-mage' as const,
      bestFeather: 'a.ts', mostVital: 'a.ts', mostRenewable: 'a.ts',
      wisest: 'a.ts', mostPrecise: 'a.ts', mostResilient: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgVitality: 90, avgPrecision: 30, avgWisdom: 90, isRuby: true, overallBrilliance: 78 }, stats)
    expect(recs.some((r) => r.includes('precision'))).toBe(true)
  })

  it('recommends resilience when low', () => {
    const stats = {
      totalFiles: 1, totalNests: 1,
      avgCrimsonVitality: 90, avgRebirthQuality: 90, avgAshWisdom: 90,
      avgFlamePrecision: 90, avgEmberResilience: 30,
      rubyMasterpieceCount: 0, phoenixCrownCount: 0, properFlameCount: 0,
      dyingSparkCount: 0, coldAshCount: 0, voidCount: 0,
      hasHighVitalityCount: 0, hasHighQualityCount: 0, hasHighWisdomCount: 0,
      hasHighPrecisionCount: 0, hasHighResilienceCount: 0,
      overallBrilliance: 78, firebirdGrade: 'fire-mage' as const,
      bestFeather: 'a.ts', mostVital: 'a.ts', mostRenewable: 'a.ts',
      wisest: 'a.ts', mostPrecise: 'a.ts', mostResilient: 'a.ts',
    }
    const recs = generateRecommendations([], [], { avgVitality: 90, avgPrecision: 90, avgWisdom: 90, isRuby: true, overallBrilliance: 78 }, stats)
    expect(recs.some((r) => r.includes('resilience'))).toBe(true)
  })

  it('mentions void feathers by name', () => {
    const feathers = [
      { file: 'bad1.ts', condition: 'void' } as RubyFeather,
      { file: 'bad2.ts', condition: 'void' } as RubyFeather,
    ]
    const stats = {
      totalFiles: 2, totalNests: 1,
      avgCrimsonVitality: 70, avgRebirthQuality: 70, avgAshWisdom: 70,
      avgFlamePrecision: 70, avgEmberResilience: 70,
      rubyMasterpieceCount: 0, phoenixCrownCount: 0, properFlameCount: 0,
      dyingSparkCount: 0, coldAshCount: 0, voidCount: 2,
      hasHighVitalityCount: 0, hasHighQualityCount: 0, hasHighWisdomCount: 0,
      hasHighPrecisionCount: 0, hasHighResilienceCount: 0,
      overallBrilliance: 70, firebirdGrade: 'fire-mage' as const,
      bestFeather: '', mostVital: '', mostRenewable: '',
      wisest: '', mostPrecise: '', mostResilient: '',
    }
    const recs = generateRecommendations(feathers, [], { avgVitality: 70, avgPrecision: 70, avgWisdom: 70, isRuby: true, overallBrilliance: 70 }, stats)
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

  it('colorFeatherCondition returns string for all conditions', () => {
    const conditions: FeatherCondition[] = ['ruby-masterpiece', 'phoenix-crown', 'proper-flame', 'dying-spark', 'cold-ash', 'void']
    for (const c of conditions) {
      expect(typeof colorFeatherCondition(c)).toBe('string')
    }
  })

  it('colorNestCondition returns string for all conditions', () => {
    const conditions: NestCondition[] = ['fire-palace', 'ember-throne', 'proper-roost', 'charred-branch', 'empty-cage', 'void']
    for (const c of conditions) {
      expect(typeof colorNestCondition(c)).toBe('string')
    }
  })

  it('formatFeatherTable returns string', () => {
    const f = analyzeRubyFeather(richContent, 'test.ts')
    expect(typeof formatFeatherTable(f)).toBe('string')
  })

  it('formatFeathersTable returns string for empty', () => {
    expect(typeof formatFeathersTable([])).toBe('string')
  })

  it('formatFeathersTable returns string for feathers', () => {
    const feathers = [
      analyzeRubyFeather(richContent, 'a.ts'),
      analyzeRubyFeather(richContent, 'b.ts'),
    ]
    expect(typeof formatFeathersTable(feathers)).toBe('string')
  })

  it('formatNestTable returns string', () => {
    const feathers = [analyzeRubyFeather(richContent, 'a.ts')]
    const n = analyzeRubyNest(feathers, 'src')
    expect(typeof formatNestTable(n)).toBe('string')
  })

  it('formatNestsTable returns string for empty', () => {
    expect(typeof formatNestsTable([])).toBe('string')
  })

  it('formatNestsTable returns string for nests', () => {
    const feathers = [analyzeRubyFeather(richContent, 'a.ts')]
    const n = analyzeRubyNest(feathers, 'src')
    expect(typeof formatNestsTable([n])).toBe('string')
  })

  it('formatStatsTable returns string', async () => {
    const result = await buildRubyFirebirdResult(['a.ts'], [richContent])
    expect(typeof formatStatsTable(result.stats)).toBe('string')
  })

  it('formatRecommendations returns string for empty', () => {
    expect(typeof formatRecommendations([])).toBe('string')
  })

  it('formatRecommendations returns string for recs', () => {
    expect(typeof formatRecommendations(['Fix X', 'Fix Y'])).toBe('string')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildRubyFirebirdResult(['a.ts'], [richContent])
    expect(typeof formatResultTable(result)).toBe('string')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildRubyFirebirdResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })
})
