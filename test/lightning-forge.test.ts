import { describe, it, expect } from 'vitest'
import {
  measureStriking,
  measureCommanding,
  measureWeathering,
  measureFocusing,
  measureLearning,
  classifyCondition,
  classifyAnvilType,
  classifySmithGrade,
  classifyAnvilCondition,
  analyzeThunderBolt,
  analyzeThunderAnvil,
  buildThunderForgeResult,
  generateRecommendations,
} from '../src/commands/lightning-forge-helpers.js'
import {
  colorScore,
  colorCondition,
  formatBoltTable,
  formatBoltsTable,
  formatAnvilTable,
  formatAnvilsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/lightning-forge-format-helpers.js'

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

// ─── measureStriking ──────────────────────────────────────────────

describe('measureStriking', () => {
  it('returns 0 for empty content', () => {
    const m = measureStriking('')
    expect(m.speed).toBe(0)
    expect(m.bolt).toBe('no-speed')
    expect(m.hasHighSpeed).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureStriking(minimalContent)
    expect(m.speed).toBe(0)
    expect(m.bolt).toBe('no-speed')
    expect(m.hasEfficient).toBe(false)
    expect(m.hasNoWasteful).toBe(true)
    expect(m.hasNoCircuits).toBe(true)
    expect(m.wastefulCount).toBe(0)
    expect(m.circuitCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureStriking(richContent)
    expect(m.speed).toBe(100)
    expect(m.bolt).toBe('lightning-fast')
    expect(m.hasHighSpeed).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasDirect).toBe(true)
    expect(m.hasStreamlined).toBe(true)
    expect(m.hasFast).toBe(true)
    expect(m.hasOptimized).toBe(true)
    expect(m.hasConcurrent).toBe(true)
    expect(m.hasResponsive).toBe(true)
    expect(m.hasQuick).toBe(true)
  })

  it('detects wasteful usage', () => {
    const m = measureStriking('delete x[0]; void x')
    expect(m.wastefulCount).toBe(2)
    expect(m.hasNoWasteful).toBe(false)
  })

  it('detects circuit any usage', () => {
    const m = measureStriking('const x: any = 1')
    expect(m.circuitCount).toBe(1)
    expect(m.hasNoCircuits).toBe(false)
  })
})

// ─── measureCommanding ──────────────────────────────────────────────

describe('measureCommanding', () => {
  it('returns 0 for empty content', () => {
    const m = measureCommanding('')
    expect(m.authority).toBe(0)
    expect(m.thunder).toBe('no-authority')
    expect(m.hasHighAuthority).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureCommanding(minimalContent)
    expect(m.authority).toBe(0)
    expect(m.thunder).toBe('no-authority')
    expect(m.hasExported).toBe(false)
    expect(m.hasNoHidden).toBe(true)
    expect(m.hasNoUndocumented).toBe(true)
    expect(m.hiddenCount).toBe(0)
    expect(m.undocumentedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureCommanding(richContent)
    expect(m.authority).toBe(100)
    expect(m.thunder).toBe('thunderous-decree')
    expect(m.hasHighAuthority).toBe(true)
    expect(m.hasExported).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasClearAPI).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasDecisive).toBe(true)
    expect(m.hasTyped).toBe(true)
    expect(m.hasNamed).toBe(true)
    expect(m.hasAuthoritative).toBe(true)
  })

  it('detects hidden any usage', () => {
    const m = measureCommanding('const x: any = 1')
    expect(m.hiddenCount).toBe(1)
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects undocumented var usage', () => {
    const m = measureCommanding('var x = 1')
    expect(m.undocumentedCount).toBe(1)
    expect(m.hasNoUndocumented).toBe(false)
  })
})

// ─── measureWeathering ──────────────────────────────────────────────

describe('measureWeathering', () => {
  it('returns 0 for empty content', () => {
    const m = measureWeathering('')
    expect(m.resilience).toBe(0)
    expect(m.storm).toBe('no-resilience')
    expect(m.hasHighResilience).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureWeathering(minimalContent)
    expect(m.resilience).toBe(0)
    expect(m.storm).toBe('no-resilience')
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasNoUntested).toBe(true)
    expect(m.bareCrashCount).toBe(0)
    expect(m.untestedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureWeathering(richContent)
    expect(m.resilience).toBe(100)
    expect(m.storm).toBe('storm-proof')
    expect(m.hasHighResilience).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasRecoverable).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasAdaptive).toBe(true)
    expect(m.hasEnduring).toBe(true)
  })

  it('detects bare crash eval usage', () => {
    const m = measureWeathering('eval("1")')
    expect(m.bareCrashCount).toBe(1)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects untested var usage', () => {
    const m = measureWeathering('var x = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
  })
})

// ─── measureFocusing ──────────────────────────────────────────────

describe('measureFocusing', () => {
  it('returns 0 for empty content', () => {
    const m = measureFocusing('')
    expect(m.precision).toBe(0)
    expect(m.spark).toBe('no-precision')
    expect(m.hasHighPrecision).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureFocusing(minimalContent)
    expect(m.precision).toBe(0)
    expect(m.spark).toBe('no-precision')
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasNoBuggy).toBe(true)
    expect(m.unsafeCount).toBe(0)
    expect(m.buggyCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureFocusing(richContent)
    expect(m.precision).toBe(100)
    expect(m.spark).toBe('laser-focused')
    expect(m.hasHighPrecision).toBe(true)
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

  it('detects buggy var usage', () => {
    const m = measureFocusing('var x = 1')
    expect(m.buggyCount).toBe(1)
    expect(m.hasNoBuggy).toBe(false)
  })
})

// ─── measureLearning ──────────────────────────────────────────────

describe('measureLearning', () => {
  it('returns 0 for empty content', () => {
    const m = measureLearning('')
    expect(m.wisdom).toBe(0)
    expect(m.lightning).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureLearning(minimalContent)
    expect(m.wisdom).toBe(0)
    expect(m.lightning).toBe('no-wisdom')
    expect(m.hasProven).toBe(false)
    expect(m.hasNoExperimental).toBe(true)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.experimentalCount).toBe(0)
    expect(m.adHocCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureLearning(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.lightning).toBe('ancient-storm')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasEstablished).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasStrategic).toBe(true)
  })

  it('detects experimental var usage', () => {
    const m = measureLearning('var x = 1')
    expect(m.experimentalCount).toBe(1)
    expect(m.hasNoExperimental).toBe(false)
  })

  it('detects ad-hoc any usage', () => {
    const m = measureLearning('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })
})

// ─── classifyCondition ─────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies thunder-masterpiece for 90+', () => {
    expect(classifyCondition(90)).toBe('thunder-masterpiece')
    expect(classifyCondition(100)).toBe('thunder-masterpiece')
  })

  it('classifies lightning-crafted for 75-89', () => {
    expect(classifyCondition(75)).toBe('lightning-crafted')
    expect(classifyCondition(89)).toBe('lightning-crafted')
  })

  it('classifies proper-forge for 60-74', () => {
    expect(classifyCondition(60)).toBe('proper-forge')
    expect(classifyCondition(74)).toBe('proper-forge')
  })

  it('classifies dying-ember for 40-59', () => {
    expect(classifyCondition(40)).toBe('dying-ember')
    expect(classifyCondition(59)).toBe('dying-ember')
  })

  it('classifies cold-anvil for 20-39', () => {
    expect(classifyCondition(20)).toBe('cold-anvil')
    expect(classifyCondition(39)).toBe('cold-anvil')
  })

  it('classifies void for 0-19', () => {
    expect(classifyCondition(0)).toBe('void')
    expect(classifyCondition(19)).toBe('void')
  })
})

// ─── classifyAnvilType ─────────────────────────────────────────

describe('classifyAnvilType', () => {
  it('returns no-anvil for empty bolts', () => {
    expect(classifyAnvilType([])).toBe('no-anvil')
  })

  it('classifies divine-forge for high avg', () => {
    const bolts = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeThunderBolt(richContent, `f${i}.ts`),
    }))
    expect(classifyAnvilType(bolts)).toBe('divine-forge')
  })

  it('classifies no-anvil for low scores', () => {
    const bolts = [analyzeThunderBolt('', 'a.ts')]
    expect(classifyAnvilType(bolts)).toBe('no-anvil')
  })

  it('classifies storm-anvil for mid-high scores', () => {
    const bolts = Array.from({ length: 3 }, () => ({
      ...analyzeThunderBolt(richContent, 'f.ts'),
      qualityScore: 75,
      condition: 'lightning-crafted' as const,
    }))
    expect(classifyAnvilType(bolts)).toBe('storm-anvil')
  })

  it('classifies proper-forge for mid scores', () => {
    const bolts = Array.from({ length: 3 }, () => ({
      ...analyzeThunderBolt(richContent, 'f.ts'),
      qualityScore: 60,
      condition: 'proper-forge' as const,
    }))
    expect(classifyAnvilType(bolts)).toBe('proper-forge')
  })

  it('classifies small-workshop for low scores', () => {
    const bolts = Array.from({ length: 3 }, () => ({
      ...analyzeThunderBolt(richContent, 'f.ts'),
      qualityScore: 42,
      condition: 'dying-ember' as const,
    }))
    expect(classifyAnvilType(bolts)).toBe('small-workshop')
  })

  it('classifies cold-hearth for very low scores', () => {
    const bolts = Array.from({ length: 3 }, () => ({
      ...analyzeThunderBolt(richContent, 'f.ts'),
      qualityScore: 25,
      condition: 'void' as const,
    }))
    expect(classifyAnvilType(bolts)).toBe('cold-hearth')
  })
})

// ─── classifySmithGrade ─────────────────────────────────────────

describe('classifySmithGrade', () => {
  it('classifies thunder-god for 80+', () => {
    expect(classifySmithGrade(80)).toBe('thunder-god')
    expect(classifySmithGrade(100)).toBe('thunder-god')
  })

  it('classifies storm-smith for 65-79', () => {
    expect(classifySmithGrade(65)).toBe('storm-smith')
    expect(classifySmithGrade(79)).toBe('storm-smith')
  })

  it('classifies lightning-worker for 50-64', () => {
    expect(classifySmithGrade(50)).toBe('lightning-worker')
    expect(classifySmithGrade(64)).toBe('lightning-worker')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifySmithGrade(35)).toBe('apprentice')
    expect(classifySmithGrade(49)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifySmithGrade(20)).toBe('novice')
    expect(classifySmithGrade(34)).toBe('novice')
  })

  it('classifies scorched-fingers for 0-19', () => {
    expect(classifySmithGrade(0)).toBe('scorched-fingers')
    expect(classifySmithGrade(19)).toBe('scorched-fingers')
  })
})

// ─── classifyAnvilCondition ─────────────────────────────────────

describe('classifyAnvilCondition', () => {
  it('classifies thunder-hall for 85+', () => {
    expect(classifyAnvilCondition(85)).toBe('thunder-hall')
  })

  it('classifies storm-forge for 70-84', () => {
    expect(classifyAnvilCondition(70)).toBe('storm-forge')
  })

  it('classifies proper-workshop for 55-69', () => {
    expect(classifyAnvilCondition(55)).toBe('proper-workshop')
  })

  it('classifies dying-fire for 35-54', () => {
    expect(classifyAnvilCondition(35)).toBe('dying-fire')
  })

  it('classifies cold-anvil for 15-34', () => {
    expect(classifyAnvilCondition(15)).toBe('cold-anvil')
  })

  it('classifies void for 0-14', () => {
    expect(classifyAnvilCondition(0)).toBe('void')
  })
})

// ─── analyzeThunderBolt ───────────────────────────────────────

describe('analyzeThunderBolt', () => {
  it('analyzes minimal content', () => {
    const bolt = analyzeThunderBolt(minimalContent, 'minimal.ts')
    expect(bolt.file).toBe('minimal.ts')
    expect(bolt.lightningSpeed).toBe(0)
    expect(bolt.thunderAuthority).toBe(0)
    expect(bolt.stormResilience).toBe(0)
    expect(bolt.sparkPrecision).toBe(0)
    expect(bolt.boltWisdom).toBe(0)
    expect(bolt.qualityScore).toBe(0)
    expect(bolt.condition).toBe('void')
    expect(bolt.striking.bolt).toBe('no-speed')
    expect(bolt.commanding.thunder).toBe('no-authority')
    expect(bolt.weathering.storm).toBe('no-resilience')
    expect(bolt.focusing.spark).toBe('no-precision')
    expect(bolt.learning.lightning).toBe('no-wisdom')
  })

  it('analyzes rich content', () => {
    const bolt = analyzeThunderBolt(richContent, 'rich.ts')
    expect(bolt.file).toBe('rich.ts')
    expect(bolt.lightningSpeed).toBe(100)
    expect(bolt.thunderAuthority).toBe(100)
    expect(bolt.stormResilience).toBe(100)
    expect(bolt.sparkPrecision).toBe(100)
    expect(bolt.boltWisdom).toBe(100)
    expect(bolt.qualityScore).toBe(100)
    expect(bolt.condition).toBe('thunder-masterpiece')
    expect(bolt.striking.bolt).toBe('lightning-fast')
    expect(bolt.commanding.thunder).toBe('thunderous-decree')
    expect(bolt.weathering.storm).toBe('storm-proof')
    expect(bolt.focusing.spark).toBe('laser-focused')
    expect(bolt.learning.lightning).toBe('ancient-storm')
  })

  it('computes qualityScore as weighted average', () => {
    const bolt = analyzeThunderBolt('export const x = 1', 'mid.ts')
    const expected = Math.round(
      bolt.lightningSpeed * 0.2 +
      bolt.thunderAuthority * 0.2 +
      bolt.stormResilience * 0.2 +
      bolt.sparkPrecision * 0.2 +
      bolt.boltWisdom * 0.2,
    )
    expect(bolt.qualityScore).toBe(expected)
  })
})

// ─── analyzeThunderAnvil ───────────────────────────────────────

describe('analyzeThunderAnvil', () => {
  it('returns empty anvil for empty bolts', () => {
    const anvil = analyzeThunderAnvil([], 'empty-dir')
    expect(anvil.directory).toBe('empty-dir')
    expect(anvil.bolts).toHaveLength(0)
    expect(anvil.avgSpeed).toBe(0)
    expect(anvil.anvilType).toBe('no-anvil')
    expect(anvil.condition).toBe('void')
  })

  it('analyzes anvil with rich bolts', () => {
    const bolts = [
      analyzeThunderBolt(richContent, 'dir/a.ts'),
      analyzeThunderBolt(richContent, 'dir/b.ts'),
    ]
    const anvil = analyzeThunderAnvil(bolts, 'dir')
    expect(anvil.avgSpeed).toBe(100)
    expect(anvil.thunderMasterpieceCount).toBe(2)
    expect(anvil.voidCount).toBe(0)
    expect(anvil.anvilType).toBe('divine-forge')
  })

  it('analyzes anvil with mixed bolts', () => {
    const bolts = [
      analyzeThunderBolt(richContent, 'dir/a.ts'),
      analyzeThunderBolt(minimalContent, 'dir/b.ts'),
    ]
    const anvil = analyzeThunderAnvil(bolts, 'dir')
    expect(anvil.thunderMasterpieceCount).toBe(1)
    expect(anvil.voidCount).toBe(1)
  })
})

// ─── buildThunderForgeResult ──────────────────────────────────

describe('buildThunderForgeResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildThunderForgeResult([], [])
    expect(result.bolts).toHaveLength(0)
    expect(result.anvils).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallPower).toBe(0)
    expect(result.stats.smithGrade).toBe('scorched-fingers')
    expect(result.storm.isThunderous).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildThunderForgeResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.bolts).toHaveLength(2)
    expect(result.anvils).toHaveLength(1)
    expect(result.stats.avgLightningSpeed).toBe(100)
    expect(result.stats.avgThunderAuthority).toBe(100)
    expect(result.stats.avgStormResilience).toBe(100)
    expect(result.stats.avgSparkPrecision).toBe(100)
    expect(result.stats.avgBoltWisdom).toBe(100)
    expect(result.stats.thunderMasterpieceCount).toBe(2)
    expect(result.stats.voidCount).toBe(0)
    expect(result.stats.hasHighSpeedCount).toBe(2)
    expect(result.stats.hasHighAuthorityCount).toBe(2)
    expect(result.stats.hasHighResilienceCount).toBe(2)
    expect(result.stats.hasHighPrecisionCount).toBe(2)
    expect(result.stats.hasHighWisdomCount).toBe(2)
    expect(result.stats.overallPower).toBe(100)
    expect(result.stats.smithGrade).toBe('thunder-god')
    expect(result.storm.isThunderous).toBe(true)
    expect(result.stats.bestBolt).toBeTruthy()
    expect(result.stats.fastest).toBeTruthy()
    expect(result.stats.mostAuthoritative).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildThunderForgeResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.anvils).toHaveLength(2)
    const dirs = result.anvils.map(a => a.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall power correctly', async () => {
    const result = await buildThunderForgeResult(['a.ts'], [minimalContent])
    expect(result.storm.overallPower).toBe(0)
  })

  it('sets isThunderous when overallPower >= 60', async () => {
    const result = await buildThunderForgeResult(['a.ts'], [richContent])
    expect(result.storm.isThunderous).toBe(true)
  })

  it('sets isThunderous false when overallPower < 60', async () => {
    const result = await buildThunderForgeResult(['a.ts'], [minimalContent])
    expect(result.storm.isThunderous).toBe(false)
  })

  it('picks best bolt by qualityScore', async () => {
    const result = await buildThunderForgeResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestBolt).toBe('high.ts')
    expect(result.stats.fastest).toBe('high.ts')
    expect(result.stats.mostAuthoritative).toBe('high.ts')
    expect(result.stats.mostResilient).toBe('high.ts')
    expect(result.stats.mostPrecise).toBe('high.ts')
    expect(result.stats.wisest).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildThunderForgeResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.thunderMasterpieceCount).toBe(1)
    expect(result.stats.voidCount).toBe(1)
  })
})

// ─── generateRecommendations ────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildThunderForgeResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your thunder forge roars with divine power! Every bolt is a masterpiece of lightning and thunder',
    ])
  })

  it('recommends improving lightning speed when low', async () => {
    const result = await buildThunderForgeResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('speed'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving thunder authority when low', async () => {
    const result = await buildThunderForgeResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('authority'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving storm resilience when low', async () => {
    const result = await buildThunderForgeResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('resilience'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving spark precision when low', async () => {
    const result = await buildThunderForgeResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('precision'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving bolt wisdom when low', async () => {
    const result = await buildThunderForgeResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('wisdom'))
    expect(rec).toBeTruthy()
  })

  it('warns about void bolts', async () => {
    const result = await buildThunderForgeResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Reforge') || r.includes('spent'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall power', async () => {
    const result = await buildThunderForgeResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('forge') || r.includes('cold'))
    expect(rec).toBeTruthy()
  })

  it('lists specific void bolts to reforge', async () => {
    const result = await buildThunderForgeResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Reforge these'))
    expect(rec).toBeTruthy()
  })

  it('warns when all anvils are poor', async () => {
    const result = await buildThunderForgeResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('rust') || r.includes('reforging') || r.includes('strategy'))
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
  it('returns a string for thunder-masterpiece', () => {
    expect(typeof colorCondition('thunder-masterpiece')).toBe('string')
  })

  it('returns a string for void', () => {
    expect(typeof colorCondition('void')).toBe('string')
  })

  it('returns a string for unknown condition', () => {
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('formatBoltTable', () => {
  it('formats a bolt', () => {
    const bolt = analyzeThunderBolt(richContent, 'test.ts')
    const output = formatBoltTable(bolt)
    expect(output).toContain('test.ts')
    expect(output).toContain('Lightning Speed')
    expect(output).toContain('Thunder Authority')
    expect(output).toContain('Storm Resilience')
    expect(output).toContain('Spark Precision')
    expect(output).toContain('Bolt Wisdom')
  })
})

describe('formatBoltsTable', () => {
  it('handles empty bolts', () => {
    const output = formatBoltsTable([])
    expect(output).toContain('No thunder bolts')
  })

  it('formats multiple bolts', () => {
    const bolts = [
      analyzeThunderBolt(richContent, 'a.ts'),
      analyzeThunderBolt(minimalContent, 'b.ts'),
    ]
    const output = formatBoltsTable(bolts)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatAnvilTable', () => {
  it('formats an anvil', () => {
    const bolts = [analyzeThunderBolt(richContent, 'dir/a.ts')]
    const anvil = analyzeThunderAnvil(bolts, 'dir')
    const output = formatAnvilTable(anvil)
    expect(output).toContain('dir')
    expect(output).toContain('Anvil')
  })
})

describe('formatAnvilsTable', () => {
  it('handles empty anvils', () => {
    const output = formatAnvilsTable([])
    expect(output).toContain('No thunder anvils')
  })

  it('formats multiple anvils', () => {
    const bolts = [analyzeThunderBolt(richContent, 'src/a.ts')]
    const anvils = [analyzeThunderAnvil(bolts, 'src')]
    const output = formatAnvilsTable(anvils)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildThunderForgeResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Thunder Forge Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Smith Grade')
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
    const result = await buildThunderForgeResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Thunder Forge Analysis')
    expect(output).toContain('Thunder Bolts')
    expect(output).toContain('Thunder Anvils')
    expect(output).toContain('Storm Overview')
    expect(output).toContain('Thunder Forge Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildThunderForgeResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.bolts).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.storm.isThunderous).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const bolt = analyzeThunderBolt('   \n\t  ', 'blank.ts')
    expect(bolt.lightningSpeed).toBe(0)
    expect(bolt.qualityScore).toBe(0)
    expect(bolt.condition).toBe('void')
  })

  it('handles content with only comments', () => {
    const bolt = analyzeThunderBolt('// just a comment\n/* block */', 'comment.ts')
    expect(bolt.lightningSpeed).toBe(0)
    expect(bolt.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildThunderForgeResult(['big.ts'], [longContent])
    expect(result.bolts).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildThunderForgeResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.thunderMasterpieceCount).toBe(50)
  })

  it('handles single file anvil', async () => {
    const result = await buildThunderForgeResult(['single.ts'], [richContent])
    expect(result.anvils).toHaveLength(1)
    expect(result.anvils[0]!.bolts).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const bolt = analyzeThunderBolt(richContent, 'cap.ts')
    expect(bolt.qualityScore).toBeLessThanOrEqual(100)
    expect(bolt.lightningSpeed).toBeLessThanOrEqual(100)
    expect(bolt.thunderAuthority).toBeLessThanOrEqual(100)
    expect(bolt.stormResilience).toBeLessThanOrEqual(100)
    expect(bolt.sparkPrecision).toBeLessThanOrEqual(100)
    expect(bolt.boltWisdom).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildThunderForgeResult([], [])
    const r2 = await buildThunderForgeResult(['a.ts'], [richContent])
    const r3 = await buildThunderForgeResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
