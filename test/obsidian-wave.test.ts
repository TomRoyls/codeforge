import { describe, it, expect } from 'vitest'

import {
  measureForming,
  measureRevealing,
  measureEnduring,
  measureReflecting,
  measureChanneling,
  analyzeObsidianShard,
  analyzeObsidianReef,
  buildObsidianTideResult,
  classifyCondition,
  classifyReefType,
  classifyReefCondition,
  classifyBladesmithGrade,
  generateRecommendations,
  type ObsidianShard,
} from '../src/commands/obsidian-wave-helpers.js'

import {
  colorScore,
  colorCondition,
  colorReefCondition,
  formatShardTable,
  formatShardsTable,
  formatReefTable,
  formatReefsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/obsidian-wave-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const emptyContent = ''

const minimalContent = 'const x = 1'

const richContent = `import { type Result } from './types.js'
export interface Config { readonly name: string; private value: number }
export class Processor {
  private async handle(input: unknown): Promise<Result> {
    try {
      const data = JSON.parse(input as string)
      if (!data) throw new Error('empty')
      return data as Result
    } catch {
      return { ok: false } as Result
    }
  }
}
/** Documentation */
export type Handler = (input: string) => Promise<void>
`

// ─── measureForming ─────────────────────────────────────

describe('measureForming', () => {
  it('returns a forming measure with all fields', () => {
    const result = measureForming(richContent)
    expect(result).toHaveProperty('glass')
    expect(result).toHaveProperty('formation')
    expect(result).toHaveProperty('hasHighGlass')
    expect(result).toHaveProperty('hasWellStructured')
    expect(result).toHaveProperty('hasNoChaotic')
    expect(result).toHaveProperty('hasModular')
    expect(result).toHaveProperty('hasNoMonolithic')
    expect(result).toHaveProperty('hasCleanPipelines')
    expect(result).toHaveProperty('hasNoTangled')
    expect(result).toHaveProperty('hasIntentional')
    expect(result).toHaveProperty('hasNoAccidental')
    expect(result).toHaveProperty('hasDisciplined')
    expect(result).toHaveProperty('hasCrafted')
    expect(result).toHaveProperty('hasShaped')
    expect(result).toHaveProperty('hasForged')
    expect(result).toHaveProperty('hasTempered')
    expect(result).toHaveProperty('hasHardened')
    expect(result).toHaveProperty('hasRefined')
    expect(result).toHaveProperty('chaoticCount')
    expect(result).toHaveProperty('tangledCount')
  })

  it('scores low on empty content', () => {
    const result = measureForming(emptyContent)
    expect(result.glass).toBeGreaterThanOrEqual(0)
    expect(result.glass).toBeLessThan(40)
  })

  it('scores greater than 0 on minimal content', () => {
    const result = measureForming(minimalContent)
    expect(result.glass).toBeGreaterThan(0)
  })

  it('detects chaotic patterns (var, eval)', () => {
    const result = measureForming('var x = 1; eval("y")')
    expect(result.chaoticCount).toBe(2)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects no chaotic patterns in clean code', () => {
    const result = measureForming(richContent)
    expect(result.hasNoChaotic).toBe(true)
    expect(result.chaoticCount).toBe(0)
  })

  it('detects tangled patterns (hack, workaround)', () => {
    const result = measureForming('// hack: workaround for bug')
    expect(result.tangledCount).toBeGreaterThan(0)
    expect(result.hasNoTangled).toBe(false)
  })

  it('detects modular code (import, export)', () => {
    const result = measureForming(richContent)
    expect(result.hasModular).toBe(true)
  })

  it('detects monolithic patterns (global, window)', () => {
    const result = measureForming('global.x = 1; window.y = 2; document.z = 3')
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('detects clean pipelines (function, =>)', () => {
    const result = measureForming('function f() { return 1 }')
    expect(result.hasCleanPipelines).toBe(true)
  })

  it('detects intentional code (const, readonly)', () => {
    const result = measureForming('const x = 1 as const')
    expect(result.hasIntentional).toBe(true)
  })

  it('detects disciplined code (try, catch, throw, if)', () => {
    const result = measureForming(richContent)
    expect(result.hasDisciplined).toBe(true)
  })

  it('detects crafted code (string, number)', () => {
    const result = measureForming('let x: string = ""')
    expect(result.hasCrafted).toBe(true)
  })

  it('detects shaped code (async, await, Promise)', () => {
    const result = measureForming(richContent)
    expect(result.hasShaped).toBe(true)
  })

  it('detects forged code (readonly, private)', () => {
    const result = measureForming(richContent)
    expect(result.hasForged).toBe(true)
  })

  it('detects refined code (export, public)', () => {
    const result = measureForming(richContent)
    expect(result.hasRefined).toBe(true)
  })

  it('classifies formation correctly', () => {
    const result = measureForming(richContent)
    expect(result.formation).toBeDefined()
  })

  it('sets hasHighGlass when glass >= 60', () => {
    const result = measureForming(richContent)
    if (result.glass >= 60) {
      expect(result.hasHighGlass).toBe(true)
    }
  })
})

// ─── measureRevealing ───────────────────────────────────

describe('measureRevealing', () => {
  it('returns a revealing measure with all fields', () => {
    const result = measureRevealing(richContent)
    expect(result).toHaveProperty('depth')
    expect(result).toHaveProperty('clarity')
    expect(result).toHaveProperty('hasHighDepth')
    expect(result).toHaveProperty('hasReadable')
    expect(result).toHaveProperty('hasNoCryptic')
    expect(result).toHaveProperty('hasSelfDocumenting')
    expect(result).toHaveProperty('hasNoMystery')
    expect(result).toHaveProperty('hasClear')
    expect(result).toHaveProperty('hasNoObfuscated')
    expect(result).toHaveProperty('hasTransparent')
    expect(result).toHaveProperty('hasUnderstandable')
    expect(result).toHaveProperty('hasDeepLogic')
    expect(result).toHaveProperty('hasInsightful')
    expect(result).toHaveProperty('hasDocumented')
    expect(result).toHaveProperty('hasVisible')
    expect(result).toHaveProperty('hasRevealed')
    expect(result).toHaveProperty('hasProfound')
    expect(result).toHaveProperty('hasIlluminated')
    expect(result).toHaveProperty('crypticCount')
    expect(result).toHaveProperty('obfuscatedCount')
  })

  it('scores low on empty content', () => {
    const result = measureRevealing(emptyContent)
    expect(result.depth).toBeGreaterThanOrEqual(0)
    expect(result.depth).toBeLessThan(40)
  })

  it('detects readable code', () => {
    const result = measureRevealing('const x = 1; function f() {} class A {}')
    expect(result.hasReadable).toBe(true)
  })

  it('detects cryptic names', () => {
    const result = measureRevealing('const a = 1; const b = 2')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects self-documenting code', () => {
    const result = measureRevealing(richContent)
    expect(result.hasSelfDocumenting).toBe(true)
  })

  it('detects mystery patterns', () => {
    const result = measureRevealing('const magic = 42; const mystery = "unknown"')
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects clear type annotations', () => {
    const result = measureRevealing('function f(): string { return "" }')
    expect(result.hasClear).toBe(true)
  })

  it('detects obfuscated code (eval)', () => {
    const result = measureRevealing('eval("code")')
    expect(result.hasNoObfuscated).toBe(false)
  })

  it('detects transparent code (export)', () => {
    const result = measureRevealing(richContent)
    expect(result.hasTransparent).toBe(true)
  })

  it('detects documented code', () => {
    const result = measureRevealing(richContent)
    expect(result.hasDocumented).toBe(true)
  })

  it('detects visible code (import, export)', () => {
    const result = measureRevealing(richContent)
    expect(result.hasVisible).toBe(true)
  })

  it('classifies clarity correctly', () => {
    const result = measureRevealing(richContent)
    expect(result.clarity).toBeDefined()
  })

  it('sets hasHighDepth when depth >= 60', () => {
    const result = measureRevealing(richContent)
    if (result.depth >= 60) {
      expect(result.hasHighDepth).toBe(true)
    }
  })

  it('sets obfuscatedCount equal to crypticCount', () => {
    const result = measureRevealing('const a = 1')
    expect(result.obfuscatedCount).toBe(result.crypticCount)
  })
})

// ─── measureEnduring ────────────────────────────────────

describe('measureEnduring', () => {
  it('returns an enduring measure with all fields', () => {
    const result = measureEnduring(richContent)
    expect(result).toHaveProperty('resilience')
    expect(result).toHaveProperty('darkness')
    expect(result).toHaveProperty('hasHighResilience')
    expect(result).toHaveProperty('hasErrorHandled')
    expect(result).toHaveProperty('hasNoUnhandled')
    expect(result).toHaveProperty('hasDefensive')
    expect(result).toHaveProperty('hasRobust')
    expect(result).toHaveProperty('hasTested')
    expect(result).toHaveProperty('hasNoUntested')
    expect(result).toHaveProperty('hasTypeSafe')
    expect(result).toHaveProperty('hasNoUnsafe')
    expect(result).toHaveProperty('hasStable')
    expect(result).toHaveProperty('hasResilient')
    expect(result).toHaveProperty('hasForgiving')
    expect(result).toHaveProperty('hasEnduring')
    expect(result).toHaveProperty('hasHardened')
    expect(result).toHaveProperty('hasNoVulnerable')
    expect(result).toHaveProperty('hasRecoverable')
    expect(result).toHaveProperty('unhandledCount')
    expect(result).toHaveProperty('untestedCount')
  })

  it('scores low on empty content', () => {
    const result = measureEnduring(emptyContent)
    expect(result.resilience).toBeGreaterThanOrEqual(0)
    expect(result.resilience).toBeLessThan(40)
  })

  it('detects error handling', () => {
    const result = measureEnduring(richContent)
    expect(result.hasErrorHandled).toBe(true)
  })

  it('detects unhandled (any keyword)', () => {
    const result = measureEnduring('const x: any = 1')
    expect(result.unhandledCount).toBeGreaterThan(0)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects defensive code', () => {
    const result = measureEnduring(richContent)
    expect(result.hasDefensive).toBe(true)
  })

  it('detects robust code (readonly, private)', () => {
    const result = measureEnduring(richContent)
    expect(result.hasRobust).toBe(true)
  })

  it('detects untested patterns (var)', () => {
    const result = measureEnduring('var x = 1; var y = 2')
    expect(result.untestedCount).toBeGreaterThan(0)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects type-safe code', () => {
    const result = measureEnduring(richContent)
    expect(result.hasTypeSafe).toBe(true)
  })

  it('detects unsafe code (eval)', () => {
    const result = measureEnduring('eval("code")')
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects stable code (const, readonly)', () => {
    const result = measureEnduring('const x = 1; readonly y: string')
    expect(result.hasStable).toBe(true)
  })

  it('detects vulnerable patterns', () => {
    const result = measureEnduring('vulnerable code with inject exploit')
    expect(result.hasNoVulnerable).toBe(false)
  })

  it('detects forgiving code (try, catch)', () => {
    const result = measureEnduring(richContent)
    expect(result.hasForgiving).toBe(true)
  })

  it('classifies darkness correctly', () => {
    const result = measureEnduring(richContent)
    expect(result.darkness).toBeDefined()
  })

  it('sets hasHighResilience when resilience >= 60', () => {
    const result = measureEnduring(richContent)
    if (result.resilience >= 60) {
      expect(result.hasHighResilience).toBe(true)
    }
  })
})

// ─── measureReflecting ──────────────────────────────────

describe('measureReflecting', () => {
  it('returns a reflecting measure with all fields', () => {
    const result = measureReflecting(richContent)
    expect(result).toHaveProperty('precision')
    expect(result).toHaveProperty('mirror')
    expect(result).toHaveProperty('hasHighPrecision')
    expect(result).toHaveProperty('hasAccurate')
    expect(result).toHaveProperty('hasNoApproximate')
    expect(result).toHaveProperty('hasExact')
    expect(result).toHaveProperty('hasNoVague')
    expect(result).toHaveProperty('hasTypeSafe')
    expect(result).toHaveProperty('hasPrecise')
    expect(result).toHaveProperty('hasClean')
    expect(result).toHaveProperty('hasNoDirty')
    expect(result).toHaveProperty('hasCorrect')
    expect(result).toHaveProperty('hasFaithful')
    expect(result).toHaveProperty('hasUndistorted')
    expect(result).toHaveProperty('hasSharp')
    expect(result).toHaveProperty('hasDefined')
    expect(result).toHaveProperty('hasCrisp')
    expect(result).toHaveProperty('hasNoBlurry')
    expect(result).toHaveProperty('approximateCount')
    expect(result).toHaveProperty('vagueCount')
  })

  it('scores low on empty content', () => {
    const result = measureReflecting(emptyContent)
    expect(result.precision).toBeGreaterThanOrEqual(0)
    expect(result.precision).toBeLessThan(60)
  })

  it('detects accurate type annotations', () => {
    const result = measureReflecting(richContent)
    expect(result.hasAccurate).toBe(true)
  })

  it('detects approximate patterns', () => {
    const result = measureReflecting('const x = approximate(1); const y = rough(2)')
    expect(result.approximateCount).toBeGreaterThan(0)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects exact code (readonly, as const)', () => {
    const result = measureReflecting(richContent)
    expect(result.hasExact).toBe(true)
  })

  it('detects vague patterns', () => {
    const result = measureReflecting('const x = vague(1); maybe it works')
    expect(result.vagueCount).toBeGreaterThan(0)
    expect(result.hasNoVague).toBe(false)
  })

  it('detects type-safe code', () => {
    const result = measureReflecting('function f(): string { return "" }')
    expect(result.hasTypeSafe).toBe(true)
  })

  it('detects dirty code', () => {
    const result = measureReflecting('dirty hacky gross code')
    expect(result.hasNoDirty).toBe(false)
  })

  it('detects correct code (no any)', () => {
    const result = measureReflecting(richContent)
    expect(result.hasCorrect).toBe(true)
  })

  it('detects blurry patterns', () => {
    const result = measureReflecting('blur fuzzy unclear muddy code')
    expect(result.hasNoBlurry).toBe(false)
  })

  it('classifies mirror correctly', () => {
    const result = measureReflecting(richContent)
    expect(result.mirror).toBeDefined()
  })

  it('sets hasHighPrecision when precision >= 60', () => {
    const result = measureReflecting(richContent)
    if (result.precision >= 60) {
      expect(result.hasHighPrecision).toBe(true)
    }
  })

  it('detects clean code (no eval)', () => {
    const result = measureReflecting(richContent)
    expect(result.hasClean).toBe(true)
  })
})

// ─── measureChanneling ──────────────────────────────────

describe('measureChanneling', () => {
  it('returns a channeling measure with all fields', () => {
    const result = measureChanneling(richContent)
    expect(result).toHaveProperty('wisdom')
    expect(result).toHaveProperty('abyss')
    expect(result).toHaveProperty('hasHighWisdom')
    expect(result).toHaveProperty('hasWellArchitected')
    expect(result).toHaveProperty('hasNoHacked')
    expect(result).toHaveProperty('hasPrincipled')
    expect(result).toHaveProperty('hasNoAdHoc')
    expect(result).toHaveProperty('hasProven')
    expect(result).toHaveProperty('hasDeep')
    expect(result).toHaveProperty('hasNoShallow')
    expect(result).toHaveProperty('hasMature')
    expect(result).toHaveProperty('hasPatterned')
    expect(result).toHaveProperty('hasStrategic')
    expect(result).toHaveProperty('hasInsightful')
    expect(result).toHaveProperty('hasVisionary')
    expect(result).toHaveProperty('hasEvolved')
    expect(result).toHaveProperty('hasConnected')
    expect(result).toHaveProperty('hasAccumulated')
    expect(result).toHaveProperty('hackedCount')
    expect(result).toHaveProperty('adHocCount')
  })

  it('scores low on empty content', () => {
    const result = measureChanneling(emptyContent)
    expect(result.wisdom).toBeGreaterThanOrEqual(0)
    expect(result.wisdom).toBeLessThan(40)
  })

  it('detects well-architected code', () => {
    const result = measureChanneling(richContent)
    expect(result.hasWellArchitected).toBe(true)
  })

  it('detects hacked patterns', () => {
    const result = measureChanneling('hack: workaround using monkey patch')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects ad-hoc patterns (any)', () => {
    const result = measureChanneling('const x: any = 1')
    expect(result.adHocCount).toBeGreaterThan(0)
    expect(result.hasNoAdHoc).toBe(false)
  })

  it('detects principled code', () => {
    const result = measureChanneling(richContent)
    expect(result.hasPrincipled).toBe(true)
  })

  it('detects shallow patterns', () => {
    const result = measureChanneling('quick dirty temporary fix')
    expect(result.hasNoShallow).toBe(false)
  })

  it('detects documented code', () => {
    const result = measureChanneling(richContent)
    expect(result.hasInsightful).toBe(true)
  })

  it('detects visionary code (async)', () => {
    const result = measureChanneling(richContent)
    expect(result.hasVisionary).toBe(true)
  })

  it('classifies abyss correctly', () => {
    const result = measureChanneling(richContent)
    expect(result.abyss).toBeDefined()
  })

  it('sets hasHighWisdom when wisdom >= 60', () => {
    const result = measureChanneling(richContent)
    if (result.wisdom >= 60) {
      expect(result.hasHighWisdom).toBe(true)
    }
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns obsidian-masterpiece for 90+', () => {
    expect(classifyCondition(90)).toBe('obsidian-masterpiece')
    expect(classifyCondition(100)).toBe('obsidian-masterpiece')
  })

  it('returns volcanic-perfection for 75-89', () => {
    expect(classifyCondition(75)).toBe('volcanic-perfection')
    expect(classifyCondition(89)).toBe('volcanic-perfection')
  })

  it('returns proper-blade for 60-74', () => {
    expect(classifyCondition(60)).toBe('proper-blade')
    expect(classifyCondition(74)).toBe('proper-blade')
  })

  it('returns dull-glass for 40-59', () => {
    expect(classifyCondition(40)).toBe('dull-glass')
    expect(classifyCondition(59)).toBe('dull-glass')
  })

  it('returns warm-stone for 20-39', () => {
    expect(classifyCondition(20)).toBe('warm-stone')
    expect(classifyCondition(39)).toBe('warm-stone')
  })

  it('returns void for 0-19', () => {
    expect(classifyCondition(0)).toBe('void')
    expect(classifyCondition(19)).toBe('void')
  })
})

describe('classifyReefType', () => {
  it('returns no-reef for empty array', () => {
    expect(classifyReefType([])).toBe('no-reef')
  })

  it('returns volcanic-reef for high avg', () => {
    const shards = [{ qualityScore: 90 }, { qualityScore: 90 }].map((s) =>
      ({ ...s } as ObsidianShard))
    expect(classifyReefType(shards)).toBe('volcanic-reef')
  })

  it('returns obsidian-shelf for medium-high avg', () => {
    const shards = [{ qualityScore: 75 }, { qualityScore: 75 }].map((s) =>
      ({ ...s } as ObsidianShard))
    expect(classifyReefType(shards)).toBe('obsidian-shelf')
  })

  it('returns proper-formation for medium avg', () => {
    const shards = [{ qualityScore: 55 }, { qualityScore: 55 }].map((s) =>
      ({ ...s } as ObsidianShard))
    expect(classifyReefType(shards)).toBe('proper-formation')
  })

  it('returns rocky-outcrop for low avg', () => {
    const shards = [{ qualityScore: 35 }, { qualityScore: 35 }].map((s) =>
      ({ ...s } as ObsidianShard))
    expect(classifyReefType(shards)).toBe('rocky-outcrop')
  })

  it('returns sandbar for very low avg', () => {
    const shards = [{ qualityScore: 10 }, { qualityScore: 10 }].map((s) =>
      ({ ...s } as ObsidianShard))
    expect(classifyReefType(shards)).toBe('sandbar')
  })
})

describe('classifyReefCondition', () => {
  it('returns obsidian-cathedral for 85+', () => {
    expect(classifyReefCondition(85)).toBe('obsidian-cathedral')
    expect(classifyReefCondition(100)).toBe('obsidian-cathedral')
  })

  it('returns dark-palace for 70-84', () => {
    expect(classifyReefCondition(70)).toBe('dark-palace')
    expect(classifyReefCondition(84)).toBe('dark-palace')
  })

  it('returns proper-cave for 55-69', () => {
    expect(classifyReefCondition(55)).toBe('proper-cave')
    expect(classifyReefCondition(69)).toBe('proper-cave')
  })

  it('returns shallow-pool for 35-54', () => {
    expect(classifyReefCondition(35)).toBe('shallow-pool')
    expect(classifyReefCondition(54)).toBe('shallow-pool')
  })

  it('returns dry-land for 15-34', () => {
    expect(classifyReefCondition(15)).toBe('dry-land')
    expect(classifyReefCondition(34)).toBe('dry-land')
  })

  it('returns void for 0-14', () => {
    expect(classifyReefCondition(0)).toBe('void')
    expect(classifyReefCondition(14)).toBe('void')
  })
})

describe('classifyBladesmithGrade', () => {
  it('returns master-bladesmith for 80+', () => {
    expect(classifyBladesmithGrade(80)).toBe('master-bladesmith')
    expect(classifyBladesmithGrade(100)).toBe('master-bladesmith')
  })

  it('returns obsidian-forger for 65-79', () => {
    expect(classifyBladesmithGrade(65)).toBe('obsidian-forger')
    expect(classifyBladesmithGrade(79)).toBe('obsidian-forger')
  })

  it('returns stone-cutter for 50-64', () => {
    expect(classifyBladesmithGrade(50)).toBe('stone-cutter')
    expect(classifyBladesmithGrade(64)).toBe('stone-cutter')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyBladesmithGrade(35)).toBe('apprentice')
    expect(classifyBladesmithGrade(49)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyBladesmithGrade(20)).toBe('novice')
    expect(classifyBladesmithGrade(34)).toBe('novice')
  })

  it('returns rock-basher for 0-19', () => {
    expect(classifyBladesmithGrade(0)).toBe('rock-basher')
    expect(classifyBladesmithGrade(19)).toBe('rock-basher')
  })
})

// ─── analyzeObsidianShard ───────────────────────────────

describe('analyzeObsidianShard', () => {
  it('returns a complete shard', () => {
    const shard = analyzeObsidianShard(richContent, 'app.ts')
    expect(shard.file).toBe('app.ts')
    expect(shard.volcanicGlass).toBeGreaterThanOrEqual(0)
    expect(shard.clarityDepth).toBeGreaterThanOrEqual(0)
    expect(shard.darkResilience).toBeGreaterThanOrEqual(0)
    expect(shard.mirrorPrecision).toBeGreaterThanOrEqual(0)
    expect(shard.abyssWisdom).toBeGreaterThanOrEqual(0)
    expect(shard.qualityScore).toBeGreaterThanOrEqual(0)
    expect(shard.condition).toBeDefined()
    expect(shard.forming).toBeDefined()
    expect(shard.revealing).toBeDefined()
    expect(shard.enduring).toBeDefined()
    expect(shard.reflecting).toBeDefined()
    expect(shard.channeling).toBeDefined()
  })

  it('computes qualityScore as 0.2 weighted average', () => {
    const shard = analyzeObsidianShard(richContent, 'test.ts')
    const expected = Math.round(
      shard.volcanicGlass * 0.2 +
      shard.clarityDepth * 0.2 +
      shard.darkResilience * 0.2 +
      shard.mirrorPrecision * 0.2 +
      shard.abyssWisdom * 0.2,
    )
    expect(shard.qualityScore).toBe(expected)
  })

  it('handles empty content', () => {
    const shard = analyzeObsidianShard(emptyContent, 'empty.ts')
    expect(shard.volcanicGlass).toBeGreaterThanOrEqual(0)
    expect(shard.clarityDepth).toBeGreaterThanOrEqual(0)
    expect(shard.qualityScore).toBeLessThan(40)
    expect(['warm-stone', 'void']).toContain(shard.condition)
  })
})

// ─── analyzeObsidianReef ────────────────────────────────

describe('analyzeObsidianReef', () => {
  it('returns empty reef for no shards', () => {
    const reef = analyzeObsidianReef([], 'src')
    expect(reef.directory).toBe('src')
    expect(reef.shards).toHaveLength(0)
    expect(reef.avgGlass).toBe(0)
    expect(reef.avgPrecision).toBe(0)
    expect(reef.avgWisdom).toBe(0)
    expect(reef.obsidianMasterpieceCount).toBe(0)
    expect(reef.voidCount).toBe(0)
    expect(reef.reefType).toBe('no-reef')
    expect(reef.condition).toBe('void')
  })

  it('computes averages from shards', () => {
    const shard = analyzeObsidianShard(richContent, 'app.ts')
    const reef = analyzeObsidianReef([shard], 'src')
    expect(reef.avgGlass).toBe(shard.volcanicGlass)
    expect(reef.avgPrecision).toBe(shard.mirrorPrecision)
    expect(reef.avgWisdom).toBe(shard.abyssWisdom)
  })

  it('counts obsidian-masterpiece shards', () => {
    const shard = analyzeObsidianShard(richContent, 'app.ts')
    const reef = analyzeObsidianReef([shard], 'src')
    const expectedCount = shard.condition === 'obsidian-masterpiece' ? 1 : 0
    expect(reef.obsidianMasterpieceCount).toBe(expectedCount)
  })

  it('counts warm-stone shards', () => {
    const shard = analyzeObsidianShard(emptyContent, 'empty.ts')
    const reef = analyzeObsidianReef([shard], 'src')
    expect(reef.voidCount).toBe(0)
    expect(shard.condition).toBe('warm-stone')
  })
})

// ─── buildObsidianTideResult ────────────────────────────

describe('buildObsidianTideResult', () => {
  it('returns a complete result for empty input', async () => {
    const result = await buildObsidianTideResult([], [])
    expect(result.shards).toHaveLength(0)
    expect(result.reefs).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalReefs).toBe(0)
    expect(result.volcano.isObsidian).toBe(false)
    expect(result.volcano.overallSharpness).toBe(0)
    expect(result.stats.bladesmithGrade).toBe('rock-basher')
  })

  it('returns a complete result for rich content', async () => {
    const result = await buildObsidianTideResult(['app.ts'], [richContent])
    expect(result.shards).toHaveLength(1)
    expect(result.shards[0].file).toBe('app.ts')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.overallSharpness).toBeGreaterThan(0)
    expect(result.recommendations).toBeDefined()
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('groups files into reefs by directory', async () => {
    const result = await buildObsidianTideResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.reefs).toHaveLength(2)
    expect(result.stats.totalReefs).toBe(2)
  })

  it('computes all stats fields', async () => {
    const result = await buildObsidianTideResult(['a.ts'], [richContent])
    expect(result.stats.avgVolcanicGlass).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgClarityDepth).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgDarkResilience).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgMirrorPrecision).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgAbyssWisdom).toBeGreaterThanOrEqual(0)
    expect(result.stats.obsidianMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.volcanicPerfectionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.properBladeCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.dullGlassCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.warmStoneCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighGlassCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighDepthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.bladesmithGrade).toBeDefined()
    expect(typeof result.stats.bestShard).toBe('string')
    expect(typeof result.stats.bestFormed).toBe('string')
    expect(typeof result.stats.deepest).toBe('string')
    expect(typeof result.stats.mostResilient).toBe('string')
    expect(typeof result.stats.sharpest).toBe('string')
    expect(typeof result.stats.wisest).toBe('string')
  })

  it('sets bestShard to highest qualityScore file', async () => {
    const result = await buildObsidianTideResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.bestShard).toBe('rich.ts')
  })

  it('sets bestFormed to highest volcanicGlass file', async () => {
    const result = await buildObsidianTideResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.bestFormed).toBe('rich.ts')
  })

  it('sets volcano.isObsidian when overallSharpness >= 60', async () => {
    const result = await buildObsidianTideResult(['a.ts'], [richContent])
    if (result.volcano.overallSharpness >= 60) {
      expect(result.volcano.isObsidian).toBe(true)
    } else {
      expect(result.volcano.isObsidian).toBe(false)
    }
  })

  it('scores rich content at max (100)', async () => {
    const result = await buildObsidianTideResult(['a.ts'], [richContent])
    const shard = result.shards[0]
    expect(shard.volcanicGlass).toBe(100)
    expect(shard.clarityDepth).toBe(100)
    expect(shard.darkResilience).toBe(100)
    expect(shard.mirrorPrecision).toBe(100)
    expect(shard.abyssWisdom).toBe(100)
    expect(shard.qualityScore).toBe(100)
  })

  it('handles multiple files with varying quality', async () => {
    const result = await buildObsidianTideResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.shards).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('files in root directory map to . reef', async () => {
    const result = await buildObsidianTideResult(['app.ts'], [richContent])
    expect(result.reefs).toHaveLength(1)
    expect(result.reefs[0].directory).toBe('.')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all scores >= 90', async () => {
    const result = await buildObsidianTideResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('recommends reforging when volcanic glass is low', async () => {
    const result = await buildObsidianTideResult(['a.ts'], ['var x = 1'])
    const hasForgeRec = result.recommendations.some((r) => r.includes('forge'))
    expect(hasForgeRec).toBe(true)
  })

  it('recommends sharpening when mirror precision is low', async () => {
    const result = await buildObsidianTideResult(['a.ts'], ['var x = 1'])
    const hasSharpenRec = result.recommendations.some((r) => r.includes('Sharpen'))
    expect(hasSharpenRec).toBe(true)
  })

  it('returns default recommendation when all scores are good', async () => {
    const result = await buildObsidianTideResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('mentions warm-stone shards when <= 5', async () => {
    const result = await buildObsidianTideResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    const hasRec = result.recommendations.length > 0
    expect(hasRec).toBe(true)
  })

  it('mentions warm-stone shard count when > 5', async () => {
    const files = Array.from({ length: 8 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => emptyContent)
    const result = await buildObsidianTideResult(files, contents)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns a string for each condition', () => {
    expect(typeof colorCondition('obsidian-masterpiece')).toBe('string')
    expect(typeof colorCondition('volcanic-perfection')).toBe('string')
    expect(typeof colorCondition('proper-blade')).toBe('string')
    expect(typeof colorCondition('dull-glass')).toBe('string')
    expect(typeof colorCondition('warm-stone')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorReefCondition', () => {
  it('returns a string for each condition', () => {
    expect(typeof colorReefCondition('obsidian-cathedral')).toBe('string')
    expect(typeof colorReefCondition('dark-palace')).toBe('string')
    expect(typeof colorReefCondition('proper-cave')).toBe('string')
    expect(typeof colorReefCondition('shallow-pool')).toBe('string')
    expect(typeof colorReefCondition('dry-land')).toBe('string')
    expect(typeof colorReefCondition('void')).toBe('string')
    expect(typeof colorReefCondition('unknown')).toBe('string')
  })
})

describe('formatShardTable', () => {
  it('returns formatted string for a shard', async () => {
    const result = await buildObsidianTideResult(['a.ts'], [richContent])
    const output = formatShardTable(result.shards[0])
    expect(output).toContain('Obsidian Shard')
    expect(output).toContain('a.ts')
    expect(output).toContain('Volcanic Glass')
    expect(output).toContain('Quality Score')
  })
})

describe('formatShardsTable', () => {
  it('returns no shards message for empty', () => {
    const output = formatShardsTable([])
    expect(output).toContain('No obsidian shards')
  })

  it('returns formatted table for shards', async () => {
    const result = await buildObsidianTideResult(['a.ts', 'b.ts'], [richContent, richContent])
    const output = formatShardsTable(result.shards)
    expect(output).toContain('Obsidian Shards')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatReefTable', () => {
  it('returns formatted reef info', async () => {
    const result = await buildObsidianTideResult(['a.ts'], [richContent])
    const output = formatReefTable(result.reefs[0])
    expect(output).toContain('Obsidian Reef')
    expect(output).toContain('Shards')
    expect(output).toContain('Condition')
  })
})

describe('formatReefsTable', () => {
  it('returns no reefs message for empty', () => {
    const output = formatReefsTable([])
    expect(output).toContain('No obsidian reefs')
  })

  it('returns formatted reefs', async () => {
    const result = await buildObsidianTideResult(['src/a.ts', 'lib/b.ts'], [richContent, richContent])
    const output = formatReefsTable(result.reefs)
    expect(output).toContain('Obsidian Reefs')
  })
})

describe('formatStatsTable', () => {
  it('returns formatted stats', async () => {
    const result = await buildObsidianTideResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Obsidian Wave Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Bladesmith Grade')
    expect(output).toContain('Best Shard')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations message for empty', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })

  it('returns formatted recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Fix X')
    expect(output).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('returns formatted full result', async () => {
    const result = await buildObsidianTideResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Obsidian Wave Analysis')
    expect(output).toContain('Obsidian Shards')
    expect(output).toContain('Obsidian Reefs')
    expect(output).toContain('Volcano Overview')
    expect(output).toContain('Obsidian Wave Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildObsidianTideResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.shards).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.volcano).toBeDefined()
  })
})
