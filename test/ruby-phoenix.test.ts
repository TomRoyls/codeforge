import { describe, it, expect } from 'vitest'
import {
  measureBlazing,
  measureRenewing,
  measureRemembering,
  measureFocusing,
  measureSurviving,
  classifyCondition,
  classifyNestType,
  classifyNestCondition,
  classifyPhoenixGrade,
  analyzeRubyFeather,
  analyzeRubyNest,
  buildRubyPhoenixResult,
  generateRecommendations,
} from '../src/commands/ruby-phoenix-helpers.js'
import {
  colorScore,
  colorCondition,
  colorNestCondition,
  formatFeatherTable,
  formatFeathersTable,
  formatNestTable,
  formatNestsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/ruby-phoenix-format-helpers.js'

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

// ─── measureBlazing ──────────────────────────────────────────

describe('measureBlazing', () => {
  it('returns 0 for empty content', () => {
    const m = measureBlazing('')
    expect(m.vitality).toBe(0)
    expect(m.fire).toBe('no-vitality')
    expect(m.hasHighVitality).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureBlazing(minimalContent)
    expect(m.vitality).toBe(0)
    expect(m.hasExported).toBe(false)
    expect(m.hasActive).toBe(false)
    expect(m.hasAlive).toBe(false)
    expect(m.hasConnected).toBe(false)
    expect(m.isolatedCount).toBe(0)
    expect(m.deadCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureBlazing(richContent)
    expect(m.vitality).toBe(100)
    expect(m.fire).toBe('inferno-of-life')
    expect(m.hasHighVitality).toBe(true)
    expect(m.hasExported).toBe(true)
    expect(m.hasActive).toBe(true)
    expect(m.hasAlive).toBe(true)
    expect(m.hasEvolving).toBe(true)
    expect(m.hasConnected).toBe(true)
    expect(m.hasContributing).toBe(true)
    expect(m.hasVital).toBe(true)
    expect(m.hasThriving).toBe(true)
  })

  it('detects dead code patterns', () => {
    const m = measureBlazing('// dead code here')
    expect(m.deadCount).toBe(1)
    expect(m.hasNoDead).toBe(false)
  })

  it('detects zombie patterns negatively', () => {
    const m = measureBlazing('// zombie code')
    expect(m.hasNoZombie).toBe(false)
  })

  it('detects TODO as isolated', () => {
    const m = measureBlazing('// TODO: fix this')
    expect(m.isolatedCount).toBe(1)
    expect(m.hasNoIsolated).toBe(false)
  })
})

// ─── measureRenewing ──────────────────────────────────────────

describe('measureRenewing', () => {
  it('returns 0 for empty content', () => {
    const m = measureRenewing('')
    expect(m.quality).toBe(0)
    expect(m.rebirth).toBe('no-rebirth')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureRenewing(richContent)
    expect(m.quality).toBe(100)
    expect(m.rebirth).toBe('glorious-rebirth')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasExtensible).toBe(true)
    expect(m.hasRefactorable).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasAdaptive).toBe(true)
    expect(m.hasCleanPipelines).toBe(true)
    expect(m.hasFutureProof).toBe(true)
    expect(m.hasTransformable).toBe(true)
    expect(m.hasReborn).toBe(true)
  })

  it('detects tangled eval usage', () => {
    const m = measureRenewing('eval("code")')
    expect(m.tangledCount).toBe(1)
    expect(m.hasNoTangled).toBe(false)
  })

  it('detects rigid hardcode patterns', () => {
    const m = measureRenewing('hardcode everything')
    expect(m.rigidCount).toBe(1)
    expect(m.hasNoRigid).toBe(false)
  })

  it('detects fossilized patterns negatively', () => {
    const m = measureRenewing('// fossilized code')
    expect(m.hasNoFossilized).toBe(false)
  })

  it('detects legacy patterns negatively', () => {
    const m = measureRenewing('// legacy code')
    expect(m.hasNoLegacy).toBe(false)
  })
})

// ─── measureRemembering ──────────────────────────────────────────

describe('measureRemembering', () => {
  it('returns 0 for empty content', () => {
    const m = measureRemembering('')
    expect(m.wisdom).toBe(0)
    expect(m.ash).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureRemembering(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.ash).toBe('ancient-ashes')
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasStrategic).toBe(true)
  })

  it('detects hack patterns', () => {
    const m = measureRemembering('// hack: something')
    expect(m.hackedCount).toBe(1)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects any usage as ad-hoc', () => {
    const m = measureRemembering('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })

  it('detects experimental patterns negatively', () => {
    const m = measureRemembering('// experimental feature')
    expect(m.hasNoExperimental).toBe(false)
  })

  it('detects ts-ignore as shallow', () => {
    const m = measureRemembering('// @ts-ignore\nexport class Foo {}')
    expect(m.hasNoShallow).toBe(false)
  })
})

// ─── measureFocusing ──────────────────────────────────────────

describe('measureFocusing', () => {
  it('returns minimal for empty content', () => {
    const m = measureFocusing('')
    expect(m.precision).toBe(12)
    expect(m.flame).toBe('no-precision')
    expect(m.hasHighPrecision).toBe(false)
    expect(m.hasClean).toBe(true)
  })

  it('scores rich content at max', () => {
    const m = measureFocusing(richContent)
    expect(m.precision).toBe(100)
    expect(m.flame).toBe('laser-flame')
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasCorrect).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasValidated).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasFocused).toBe(true)
  })

  it('detects unsafe any usage', () => {
    const m = measureFocusing('const x: any = 1')
    expect(m.unsafeCount).toBe(1)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects buggy patterns', () => {
    const m = measureFocusing('// bug: crashes here')
    expect(m.buggyCount).toBe(1)
    expect(m.hasNoBuggy).toBe(false)
  })

  it('detects wrong patterns negatively', () => {
    const m = measureFocusing('// wrong calculation')
    expect(m.hasNoWrong).toBe(false)
  })

  it('detects var as erratic', () => {
    const m = measureFocusing('var x = 1')
    expect(m.hasNoErratic).toBe(false)
  })
})

// ─── measureSurviving ──────────────────────────────────────────

describe('measureSurviving', () => {
  it('returns 0 for empty content', () => {
    const m = measureSurviving('')
    expect(m.resilience).toBe(0)
    expect(m.ember).toBe('no-resilience')
    expect(m.hasHighResilience).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureSurviving(richContent)
    expect(m.resilience).toBe(100)
    expect(m.ember).toBe('eternal-ember')
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasRecoverable).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasAntifragile).toBe(true)
    expect(m.hasPersistent).toBe(true)
    expect(m.hasReignitable).toBe(true)
  })

  it('detects bare crash via eval', () => {
    const m = measureSurviving('eval("code")')
    expect(m.bareCrashCount).toBe(1)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects fragile var usage', () => {
    const m = measureSurviving('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('antifragile detects test keywords', () => {
    const m = measureSurviving('describe("test", () => {})')
    expect(m.hasAntifragile).toBe(true)
  })

  it('detects naive trust patterns', () => {
    const m = measureSurviving('// trust the input')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects fatal patterns', () => {
    const m = measureSurviving('// fatal error')
    expect(m.hasNoFatal).toBe(false)
  })

  it('detects brittle patterns', () => {
    const m = measureSurviving('// brittle code')
    expect(m.hasNoBrittle).toBe(false)
  })
})

// ─── Classifiers ──────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies phoenix-masterpiece at 90+', () => {
    expect(classifyCondition(90)).toBe('phoenix-masterpiece')
    expect(classifyCondition(100)).toBe('phoenix-masterpiece')
  })

  it('classifies reborn-glory at 75-89', () => {
    expect(classifyCondition(75)).toBe('reborn-glory')
  })

  it('classifies proper-bird at 60-74', () => {
    expect(classifyCondition(60)).toBe('proper-bird')
  })

  it('classifies dying-flame at 40-59', () => {
    expect(classifyCondition(40)).toBe('dying-flame')
  })

  it('classifies cold-remains at 20-39', () => {
    expect(classifyCondition(20)).toBe('cold-remains')
  })

  it('classifies void below 20', () => {
    expect(classifyCondition(0)).toBe('void')
  })
})

describe('classifyNestType', () => {
  it('returns no-nest for empty feathers', () => {
    expect(classifyNestType([])).toBe('no-nest')
  })

  it('returns phoenix-nest for high scores', () => {
    const feather = analyzeRubyFeather(richContent, 'test.ts')
    expect(classifyNestType([feather])).toBe('phoenix-nest')
  })
})

describe('classifyNestCondition', () => {
  it('classifies blazing-aerie at 85+', () => {
    expect(classifyNestCondition(85)).toBe('blazing-aerie')
  })

  it('classifies void below 15', () => {
    expect(classifyNestCondition(0)).toBe('void')
  })
})

describe('classifyPhoenixGrade', () => {
  it('classifies phoenix-lord at 80+', () => {
    expect(classifyPhoenixGrade(80)).toBe('phoenix-lord')
  })

  it('classifies ash-scatterer below 20', () => {
    expect(classifyPhoenixGrade(0)).toBe('ash-scatterer')
  })
})

// ─── analyzeRubyFeather ──────────────────────────────────────────

describe('analyzeRubyFeather', () => {
  it('analyzes empty content', () => {
    const feather = analyzeRubyFeather('', 'empty.ts')
    expect(feather.file).toBe('empty.ts')
    expect(feather.crimsonVitality).toBe(0)
    expect(feather.rebirthQuality).toBe(0)
    expect(feather.ashWisdom).toBe(0)
    expect(feather.flamePrecision).toBe(12)
    expect(feather.emberResilience).toBe(0)
    expect(feather.condition).toBe('void')
  })

  it('analyzes rich content', () => {
    const feather = analyzeRubyFeather(richContent, 'rich.ts')
    expect(feather.file).toBe('rich.ts')
    expect(feather.crimsonVitality).toBe(100)
    expect(feather.rebirthQuality).toBe(100)
    expect(feather.ashWisdom).toBe(100)
    expect(feather.flamePrecision).toBe(100)
    expect(feather.emberResilience).toBe(100)
    expect(feather.qualityScore).toBe(100)
    expect(feather.condition).toBe('phoenix-masterpiece')
  })

  it('computes qualityScore as weighted average', () => {
    const feather = analyzeRubyFeather('export class Foo { }', 'foo.ts')
    expect(feather.qualityScore).toBe(
      Math.round(
        feather.crimsonVitality * 0.2 +
        feather.rebirthQuality * 0.2 +
        feather.ashWisdom * 0.2 +
        feather.flamePrecision * 0.2 +
        feather.emberResilience * 0.2,
      ),
    )
  })

  it('includes all measure objects', () => {
    const feather = analyzeRubyFeather(richContent, 'test.ts')
    expect(feather.blazing).toBeDefined()
    expect(feather.renewing).toBeDefined()
    expect(feather.remembering).toBeDefined()
    expect(feather.focusing).toBeDefined()
    expect(feather.surviving).toBeDefined()
  })
})

// ─── analyzeRubyNest ──────────────────────────────────────────

describe('analyzeRubyNest', () => {
  it('handles empty feathers', () => {
    const nest = analyzeRubyNest([], 'empty-dir')
    expect(nest.directory).toBe('empty-dir')
    expect(nest.feathers).toEqual([])
    expect(nest.avgVitality).toBe(0)
    expect(nest.nestType).toBe('no-nest')
    expect(nest.condition).toBe('void')
  })

  it('aggregates feather data correctly', () => {
    const f1 = analyzeRubyFeather(richContent, 'a.ts')
    const f2 = analyzeRubyFeather(richContent, 'b.ts')
    const nest = analyzeRubyNest([f1, f2], 'src')
    expect(nest.feathers).toHaveLength(2)
    expect(nest.avgVitality).toBe(100)
    expect(nest.phoenixMasterpieceCount).toBe(2)
    expect(nest.nestType).toBe('phoenix-nest')
  })

  it('counts void feathers', () => {
    const f1 = analyzeRubyFeather('', 'a.ts')
    const nest = analyzeRubyNest([f1], 'src')
    expect(nest.voidCount).toBe(1)
    expect(nest.phoenixMasterpieceCount).toBe(0)
  })
})

// ─── buildRubyPhoenixResult ──────────────────────────────────────────

describe('buildRubyPhoenixResult', () => {
  it('handles empty input', async () => {
    const result = await buildRubyPhoenixResult([], [])
    expect(result.feathers).toEqual([])
    expect(result.nests).toEqual([])
    expect(result.blaze.overallInferno).toBe(0)
    expect(result.blaze.isPhoenix).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('analyzes single rich file', async () => {
    const result = await buildRubyPhoenixResult(['src/a.ts'], [richContent])
    expect(result.feathers).toHaveLength(1)
    expect(result.feathers[0]?.file).toBe('src/a.ts')
    expect(result.feathers[0]?.qualityScore).toBe(100)
    expect(result.nests).toHaveLength(1)
    expect(result.blaze.isPhoenix).toBe(true)
  })

  it('computes stats correctly', async () => {
    const result = await buildRubyPhoenixResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.phoenixGrade).toBeDefined()
    expect(result.stats.bestFeather).toBeDefined()
    expect(result.stats.mostVital).toBeDefined()
    expect(result.stats.mostReborn).toBeDefined()
    expect(result.stats.wisest).toBeDefined()
    expect(result.stats.mostPrecise).toBeDefined()
    expect(result.stats.mostResilient).toBeDefined()
  })

  it('groups feathers by directory', async () => {
    const result = await buildRubyPhoenixResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.nests).toHaveLength(2)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildRubyPhoenixResult(
      ['a.ts', 'b.ts'],
      [richContent, ''],
    )
    expect(result.stats.phoenixMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(0)
  })

  it('handles single file with no directory', async () => {
    const result = await buildRubyPhoenixResult(['app.ts'], [richContent])
    expect(result.feathers).toHaveLength(1)
    expect(result.nests).toHaveLength(1)
    expect(result.nests[0]?.directory).toBe('.')
  })
})

// ─── generateRecommendations ──────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message when all scores are 90+', () => {
    const feather = analyzeRubyFeather(richContent, 'perfect.ts')
    const stats: import('../src/commands/ruby-phoenix-helpers.js').RubyPhoenixStats = {
      avgCrimsonVitality: 95,
      avgRebirthQuality: 95,
      avgAshWisdom: 95,
      avgFlamePrecision: 95,
      avgEmberResilience: 95,
      totalFiles: 1,
      totalNests: 1,
      phoenixMasterpieceCount: 1,
      rebornGloryCount: 0,
      properBirdCount: 0,
      dyingFlameCount: 0,
      coldRemainsCount: 0,
      voidCount: 0,
      hasHighVitalityCount: 1,
      hasHighQualityCount: 1,
      hasHighWisdomCount: 1,
      hasHighPrecisionCount: 1,
      hasHighResilienceCount: 1,
      overallInferno: 95,
      phoenixGrade: 'phoenix-lord',
      bestFeather: 'perfect.ts',
      mostVital: 'perfect.ts',
      mostReborn: 'perfect.ts',
      wisest: 'perfect.ts',
      mostPrecise: 'perfect.ts',
      mostResilient: 'perfect.ts',
    }
    const recs = generateRecommendations([feather], [], { avgVitality: 95, avgPrecision: 95, avgResilience: 95, isPhoenix: true, overallInferno: 95 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('ruby phoenix')
  })

  it('recommends improving vitality when low', () => {
    const feather = analyzeRubyFeather('', 'empty.ts')
    const nest = analyzeRubyNest([feather], '.')
    const stats: import('../src/commands/ruby-phoenix-helpers.js').RubyPhoenixStats = {
      avgCrimsonVitality: 0,
      avgRebirthQuality: 0,
      avgAshWisdom: 0,
      avgFlamePrecision: 0,
      avgEmberResilience: 0,
      totalFiles: 1,
      totalNests: 1,
      phoenixMasterpieceCount: 0,
      rebornGloryCount: 0,
      properBirdCount: 0,
      dyingFlameCount: 0,
      coldRemainsCount: 0,
      voidCount: 1,
      hasHighVitalityCount: 0,
      hasHighQualityCount: 0,
      hasHighWisdomCount: 0,
      hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0,
      overallInferno: 0,
      phoenixGrade: 'ash-scatterer',
      bestFeather: '',
      mostVital: '',
      mostReborn: '',
      wisest: '',
      mostPrecise: '',
      mostResilient: '',
    }
    const recs = generateRecommendations([feather], [nest], { avgVitality: 0, avgPrecision: 0, avgResilience: 0, isPhoenix: false, overallInferno: 0 }, stats)
    expect(recs.some((r: string) => r.includes('vitality'))).toBe(true)
  })

  it('recommends reignition for many void feathers', () => {
    const feathers = Array.from({ length: 6 }, (_, i) => analyzeRubyFeather('', `empty${i}.ts`))
    const stats: import('../src/commands/ruby-phoenix-helpers.js').RubyPhoenixStats = {
      avgCrimsonVitality: 0,
      avgRebirthQuality: 0,
      avgAshWisdom: 0,
      avgFlamePrecision: 0,
      avgEmberResilience: 0,
      totalFiles: 6,
      totalNests: 1,
      phoenixMasterpieceCount: 0,
      rebornGloryCount: 0,
      properBirdCount: 0,
      dyingFlameCount: 0,
      coldRemainsCount: 0,
      voidCount: 6,
      hasHighVitalityCount: 0,
      hasHighQualityCount: 0,
      hasHighWisdomCount: 0,
      hasHighPrecisionCount: 0,
      hasHighResilienceCount: 0,
      overallInferno: 0,
      phoenixGrade: 'ash-scatterer',
      bestFeather: '',
      mostVital: '',
      mostReborn: '',
      wisest: '',
      mostPrecise: '',
      mostResilient: '',
    }
    const recs = generateRecommendations(feathers, [], { avgVitality: 0, avgPrecision: 0, avgResilience: 0, isPhoenix: false, overallInferno: 0 }, stats)
    expect(recs.some((r: string) => r.includes('6'))).toBe(true)
  })
})

// ─── Format Helpers ──────────────────────────────────────────

describe('colorScore', () => {
  it('colors high scores red', () => {
    expect(colorScore(90)).toContain('90')
  })

  it('colors low scores gray', () => {
    expect(colorScore(5)).toContain('5')
  })
})

describe('colorCondition', () => {
  it('colors phoenix-masterpiece', () => {
    expect(colorCondition('phoenix-masterpiece')).toContain('phoenix-masterpiece')
  })

  it('colors void', () => {
    expect(colorCondition('void')).toContain('void')
  })

  it('colors unknown condition gray', () => {
    expect(colorCondition('unknown')).toContain('unknown')
  })
})

describe('colorNestCondition', () => {
  it('colors blazing-aerie', () => {
    expect(colorNestCondition('blazing-aerie')).toContain('blazing-aerie')
  })

  it('colors void', () => {
    expect(colorNestCondition('void')).toContain('void')
  })
})

describe('formatFeatherTable', () => {
  it('formats a single feather', () => {
    const feather = analyzeRubyFeather(richContent, 'test.ts')
    const output = formatFeatherTable(feather)
    expect(output).toContain('test.ts')
    expect(output).toContain('Crimson Vitality')
    expect(output).toContain('Quality Score')
  })
})

describe('formatFeathersTable', () => {
  it('handles empty feathers', () => {
    expect(formatFeathersTable([])).toContain('No ruby feathers')
  })

  it('formats multiple feathers', () => {
    const f1 = analyzeRubyFeather(richContent, 'a.ts')
    const f2 = analyzeRubyFeather(minimalContent, 'b.ts')
    const output = formatFeathersTable([f1, f2])
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatNestTable', () => {
  it('formats a single nest', () => {
    const feather = analyzeRubyFeather(richContent, 'src/a.ts')
    const nest = analyzeRubyNest([feather], 'src')
    const output = formatNestTable(nest)
    expect(output).toContain('src')
    expect(output).toContain('Avg Vitality')
  })
})

describe('formatNestsTable', () => {
  it('handles empty nests', () => {
    expect(formatNestsTable([])).toContain('No ruby nests')
  })

  it('formats nests', () => {
    const feather = analyzeRubyFeather(richContent, 'src/a.ts')
    const nest = analyzeRubyNest([feather], 'src')
    const output = formatNestsTable([nest])
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildRubyPhoenixResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Ruby Phoenix Statistics')
    expect(output).toContain('Phoenix Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildRubyPhoenixResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Ruby Phoenix Analysis')
    expect(output).toContain('Blaze Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildRubyPhoenixResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.feathers).toHaveLength(1)
  })
})

// ─── Integration ──────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('processes multiple files with mixed quality', async () => {
    const files = ['src/good.ts', 'src/bad.ts', 'lib/ok.ts']
    const contents = [richContent, minimalContent, 'export class Foo { readonly x: string }']
    const result = await buildRubyPhoenixResult(files, contents)

    expect(result.feathers).toHaveLength(3)
    expect(result.nests).toHaveLength(2)
    expect(result.blaze.avgVitality).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('quality score is weighted sum of measures', async () => {
    const result = await buildRubyPhoenixResult(['test.ts'], [richContent])
    const feather = result.feathers[0]!
    expect(feather.qualityScore).toBe(
      Math.round(
        feather.crimsonVitality * 0.2 +
        feather.rebirthQuality * 0.2 +
        feather.ashWisdom * 0.2 +
        feather.flamePrecision * 0.2 +
        feather.emberResilience * 0.2,
      ),
    )
  })
})
