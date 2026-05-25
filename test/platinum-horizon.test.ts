import { describe, it, expect } from 'vitest'
import {
  measureShining,
  measureEnvisioning,
  measureEnduring,
  measureCommanding,
  measurePreparing,
  classifyCondition,
  classifyTowerType,
  classifyTowerCondition,
  classifyArchitectGrade,
  analyzePlatinumRay,
  analyzePlatinumTower,
  buildPlatinumHorizonResult,
  generateRecommendations,
} from '../src/commands/platinum-horizon-helpers.js'
import {
  colorScore,
  colorCondition,
  colorTowerCondition,
  formatRayTable,
  formatRaysTable,
  formatTowerTable,
  formatTowersTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/platinum-horizon-format-helpers.js'

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

// ─── measureShining ──────────────────────────────────────────

describe('measureShining', () => {
  it('returns low score for empty content', () => {
    const m = measureShining('')
    expect(m.purity).toBeGreaterThan(0)
    expect(m.metal).toBeDefined()
    expect(m.hasHighPurity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureShining(minimalContent)
    expect(m.purity).toBeGreaterThan(0)
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasClean).toBe(true)
    expect(m.hasTested).toBe(false)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasConsistent).toBe(false)
    expect(m.unsafeCount).toBe(0)
    expect(m.untestedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureShining(richContent)
    expect(m.purity).toBe(100)
    expect(m.metal).toBe('pure-platinum')
    expect(m.hasHighPurity).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasNoDirty).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasNoUntested).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasHonest).toBe(true)
    expect(m.hasPure).toBe(true)
    expect(m.hasNoContaminated).toBe(true)
    expect(m.hasPolished).toBe(true)
    expect(m.hasNoRough).toBe(true)
  })

  it('detects unsafe any usage', () => {
    const m = measureShining('const x: any = 1')
    expect(m.unsafeCount).toBe(1)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects dirty patterns', () => {
    const m = measureShining('// dirty messy hacky')
    expect(m.hasClean).toBe(false)
    expect(m.hasNoDirty).toBe(false)
  })

  it('detects untested var usage', () => {
    const m = measureShining('var x = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
  })

  it('detects contaminated ts-expect-error', () => {
    const m = measureShining('// @ts-expect-error')
    expect(m.hasNoContaminated).toBe(false)
  })

  it('detects rough patterns', () => {
    const m = measureShining('// rough unpolished crude')
    expect(m.hasNoRough).toBe(false)
  })

  it('detects erratic var patterns', () => {
    const m = measureShining('var x = 1')
    expect(m.hasNoErratic).toBe(false)
  })

  it('detects deceptive patterns', () => {
    const m = measureShining('// cheat fake deceive')
    expect(m.hasNoDeceptive).toBe(false)
  })

  it('detects undocumented functions', () => {
    const m = measureShining('function foo() { return 1 }')
    expect(m.hasNoUndocumented).toBe(false)
  })
})

// ─── measureEnvisioning ──────────────────────────────────────────

describe('measureEnvisioning', () => {
  it('returns 0 for empty content', () => {
    const m = measureEnvisioning('')
    expect(m.vision).toBe(0)
    expect(m.horizon).toBe('no-vision')
    expect(m.hasHighVision).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureEnvisioning(richContent)
    expect(m.vision).toBe(100)
    expect(m.horizon).toBe('infinite-vista')
    expect(m.hasHighVision).toBe(true)
    expect(m.hasExtensible).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasFutureProof).toBe(true)
    expect(m.hasScalable).toBe(true)
    expect(m.hasAdaptive).toBe(true)
    expect(m.hasAbstracted).toBe(true)
    expect(m.hasVisionary).toBe(true)
    expect(m.hasEvolving).toBe(true)
  })

  it('detects rigid patterns', () => {
    const m = measureEnvisioning('// rigid inflexible stiff')
    expect(m.rigidCount).toBe(3)
    expect(m.hasNoRigid).toBe(false)
  })

  it('detects monolithic patterns', () => {
    const m = measureEnvisioning('// monolithic giant massive')
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('detects legacy patterns', () => {
    const m = measureEnvisioning('// legacy deprecated outdated')
    expect(m.hasNoLegacy).toBe(false)
  })

  it('detects bottlenecked patterns', () => {
    const m = measureEnvisioning('// bottleneck block stall')
    expect(m.hasNoBottlenecked).toBe(false)
  })

  it('detects hardcoded patterns', () => {
    const m = measureEnvisioning('// hardcoded hard-coded magic.number')
    expect(m.hardcodedCount).toBe(3)
    expect(m.hasNoHardcoded).toBe(false)
  })

  it('detects short-sighted patterns', () => {
    const m = measureEnvisioning('// shortsighted quick.fix band.aid')
    expect(m.hasNoShortSighted).toBe(false)
  })

  it('classifies horizon levels correctly', () => {
    expect(measureEnvisioning(richContent).horizon).toBe('infinite-vista')
    expect(measureEnvisioning('').horizon).toBe('no-vision')
  })
})

// ─── measureEnduring ──────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns 0 for empty content', () => {
    const m = measureEnduring('')
    expect(m.resilience).toBe(0)
    expect(m.shield).toBe('no-resilience')
    expect(m.hasHighResilience).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBe(100)
    expect(m.shield).toBe('eternal-platinum')
    expect(m.hasHighResilience).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasNoNaive).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasRecoverable).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasMaintained).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasStable).toBe(true)
  })

  it('detects bare crash eval usage', () => {
    const m = measureEnduring('eval("code")')
    expect(m.bareCrashCount).toBe(1)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects fragile var patterns', () => {
    const m = measureEnduring('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects naive trust patterns', () => {
    const m = measureEnduring('// trust assume hope')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects harsh fail patterns', () => {
    const m = measureEnduring('// abort kill terminate')
    expect(m.hasNoHarshFail).toBe(false)
  })

  it('detects fatal patterns', () => {
    const m = measureEnduring('// fatal panic crash')
    expect(m.hasNoFatal).toBe(false)
  })

  it('detects abandoned patterns', () => {
    const m = measureEnduring('// abandoned forgotten neglected')
    expect(m.hasNoAbandoned).toBe(false)
  })

  it('detects experimental patterns', () => {
    const m = measureEnduring('// experimental beta alpha')
    expect(m.hasNoExperimental).toBe(false)
  })

  it('classifies shield levels correctly', () => {
    expect(measureEnduring(richContent).shield).toBe('eternal-platinum')
    expect(measureEnduring('').shield).toBe('no-resilience')
  })
})

// ─── measureCommanding ──────────────────────────────────────────

describe('measureCommanding', () => {
  it('returns low score for empty content', () => {
    const m = measureCommanding('')
    expect(m.authority).toBe(0)
    expect(m.crest).toBe('no-crest')
    expect(m.hasHighAuthority).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureCommanding(richContent)
    expect(m.authority).toBe(100)
    expect(m.crest).toBe('platinum-crest')
    expect(m.hasHighAuthority).toBe(true)
    expect(m.hasExported).toBe(true)
    expect(m.hasNoHidden).toBe(true)
    expect(m.hasClearAPI).toBe(true)
    expect(m.hasNoMysteryAPI).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasDecisive).toBe(true)
    expect(m.hasTyped).toBe(true)
    expect(m.hasNamed).toBe(true)
    expect(m.hasAuthoritative).toBe(true)
  })

  it('detects hidden ts-ignore patterns', () => {
    const m = measureCommanding('// @ts-ignore')
    expect(m.hiddenCount).toBe(1)
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects mystery API patterns', () => {
    const m = measureCommanding('// mystery magic secret')
    expect(m.hasNoMysteryAPI).toBe(false)
  })

  it('detects undocumented functions', () => {
    const m = measureCommanding('function foo() { return 1 }')
    expect(m.undocumentedCount).toBe(1)
    expect(m.hasNoUndocumented).toBe(false)
  })

  it('detects contradictory patterns', () => {
    const m = measureCommanding('// contradict conflict clash')
    expect(m.hasNoContradictory).toBe(false)
  })

  it('detects ambiguous patterns', () => {
    const m = measureCommanding('// ambiguous vague unclear')
    expect(m.hasNoAmbiguous).toBe(false)
  })

  it('detects untyped any usage', () => {
    const m = measureCommanding('const x: any = 1')
    expect(m.hasNoUntyped).toBe(false)
  })

  it('detects anonymous patterns', () => {
    const m = measureCommanding('// anonymous unnamed nameless')
    expect(m.hasNoAnonymous).toBe(false)
  })

  it('classifies crest levels correctly', () => {
    expect(measureCommanding(richContent).crest).toBe('platinum-crest')
    expect(measureCommanding('').crest).toBe('no-crest')
  })
})

// ─── measurePreparing ──────────────────────────────────────────

describe('measurePreparing', () => {
  it('returns 0 for empty content', () => {
    const m = measurePreparing('')
    expect(m.wisdom).toBe(0)
    expect(m.oracle).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measurePreparing(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.oracle).toBe('visionary-sage')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasStrategic).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasInsightful).toBe(true)
  })

  it('detects hacked patterns', () => {
    const m = measurePreparing('// hack workaround monkey')
    expect(m.hackedCount).toBe(3)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects ad hoc any usage', () => {
    const m = measurePreparing('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })

  it('detects reinvented patterns', () => {
    const m = measurePreparing('// reinvent rewrote redone')
    expect(m.hasNoReinvented).toBe(false)
  })

  it('detects shallow ts-ignore', () => {
    const m = measurePreparing('// @ts-ignore')
    expect(m.hasNoShallow).toBe(false)
  })

  it('detects tactical patterns', () => {
    const m = measurePreparing('// quick.fix band.aid patch')
    expect(m.hasNoTactical).toBe(false)
  })

  it('detects experimental patterns', () => {
    const m = measurePreparing('// experimental beta alpha')
    expect(m.hasNoExperimental).toBe(false)
  })

  it('detects naive patterns', () => {
    const m = measurePreparing('// naive simple basic')
    expect(m.hasNoNaive).toBe(false)
  })

  it('classifies oracle levels correctly', () => {
    expect(measurePreparing(richContent).oracle).toBe('visionary-sage')
    expect(measurePreparing('').oracle).toBe('no-wisdom')
  })
})

// ─── Classifiers ──────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies all levels', () => {
    expect(classifyCondition(90)).toBe('platinum-masterpiece')
    expect(classifyCondition(75)).toBe('noble-horizon')
    expect(classifyCondition(60)).toBe('proper-vista')
    expect(classifyCondition(40)).toBe('faded-skyline')
    expect(classifyCondition(20)).toBe('dark-valley')
    expect(classifyCondition(0)).toBe('void')
  })
})

describe('classifyTowerType', () => {
  it('returns no-tower for empty rays', () => {
    expect(classifyTowerType([])).toBe('no-tower')
  })
})

describe('classifyTowerCondition', () => {
  it('classifies all levels', () => {
    expect(classifyTowerCondition(85)).toBe('platinum-palace')
    expect(classifyTowerCondition(70)).toBe('noble-fortress')
    expect(classifyTowerCondition(55)).toBe('proper-watchtower')
    expect(classifyTowerCondition(35)).toBe('faded-tower')
    expect(classifyTowerCondition(15)).toBe('dark-valley')
    expect(classifyTowerCondition(0)).toBe('void')
  })
})

describe('classifyArchitectGrade', () => {
  it('classifies all levels', () => {
    expect(classifyArchitectGrade(80)).toBe('platinum-sovereign')
    expect(classifyArchitectGrade(65)).toBe('horizon-architect')
    expect(classifyArchitectGrade(50)).toBe('noble-builder')
    expect(classifyArchitectGrade(35)).toBe('apprentice')
    expect(classifyArchitectGrade(20)).toBe('novice')
    expect(classifyArchitectGrade(0)).toBe('ground-dweller')
  })
})

// ─── analyzePlatinumRay ──────────────────────────────────────────

describe('analyzePlatinumRay', () => {
  it('analyzes empty content', () => {
    const r = analyzePlatinumRay('', 'empty.ts')
    expect(r.file).toBe('empty.ts')
    expect(r.royalPurity).toBeGreaterThan(0)
    expect(r.qualityScore).toBeGreaterThan(0)
    expect(r.condition).toBe('void')
  })

  it('analyzes rich content', () => {
    const r = analyzePlatinumRay(richContent, 'rich.ts')
    expect(r.file).toBe('rich.ts')
    expect(r.royalPurity).toBe(100)
    expect(r.horizonVision).toBe(100)
    expect(r.platinumResilience).toBe(100)
    expect(r.crestAuthority).toBe(100)
    expect(r.futureWisdom).toBe(100)
    expect(r.qualityScore).toBe(100)
    expect(r.condition).toBe('platinum-masterpiece')
  })

  it('computes qualityScore as weighted average', () => {
    const r = analyzePlatinumRay('export function add(): number { return 1 }', 'mid.ts')
    expect(r.qualityScore).toBeGreaterThan(0)
    expect(r.qualityScore).toBeLessThanOrEqual(100)
  })

  it('includes all measures', () => {
    const r = analyzePlatinumRay(richContent, 'all.ts')
    expect(r.shining).toBeDefined()
    expect(r.envisioning).toBeDefined()
    expect(r.enduring).toBeDefined()
    expect(r.commanding).toBeDefined()
    expect(r.preparing).toBeDefined()
  })
})

// ─── analyzePlatinumTower ──────────────────────────────────────────

describe('analyzePlatinumTower', () => {
  it('returns empty tower for no rays', () => {
    const t = analyzePlatinumTower([], 'src')
    expect(t.directory).toBe('src')
    expect(t.rays).toHaveLength(0)
    expect(t.avgPurity).toBe(0)
    expect(t.avgVision).toBe(0)
    expect(t.avgWisdom).toBe(0)
    expect(t.platinumMasterpieceCount).toBe(0)
    expect(t.voidCount).toBe(0)
    expect(t.towerType).toBe('no-tower')
    expect(t.condition).toBe('void')
  })

  it('computes averages from rays', () => {
    const rays = [
      analyzePlatinumRay(richContent, 'src/a.ts'),
      analyzePlatinumRay(richContent, 'src/b.ts'),
    ]
    const t = analyzePlatinumTower(rays, 'src')
    expect(t.avgPurity).toBe(100)
    expect(t.avgVision).toBe(100)
    expect(t.avgWisdom).toBe(100)
    expect(t.platinumMasterpieceCount).toBe(2)
    expect(t.voidCount).toBe(0)
  })

  it('counts masterpieces and voids', () => {
    const rich = analyzePlatinumRay(richContent, 'src/good.ts')
    const empty = analyzePlatinumRay('', 'src/bad.ts')
    const t = analyzePlatinumTower([rich, empty], 'src')
    expect(t.platinumMasterpieceCount).toBeGreaterThanOrEqual(1)
    expect(t.voidCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── buildPlatinumHorizonResult ──────────────────────────────────────────

describe('buildPlatinumHorizonResult', () => {
  it('handles empty input', async () => {
    const r = await buildPlatinumHorizonResult([], [])
    expect(r.rays).toHaveLength(0)
    expect(r.towers).toHaveLength(0)
    expect(r.skyline.avgPurity).toBe(0)
    expect(r.skyline.isPlatinum).toBe(false)
    expect(r.stats.totalFiles).toBe(0)
  })

  it('analyzes single file', async () => {
    const r = await buildPlatinumHorizonResult(['test.ts'], [richContent])
    expect(r.rays).toHaveLength(1)
    expect(r.rays[0].file).toBe('test.ts')
    expect(r.towers).toHaveLength(1)
    expect(r.skyline.isPlatinum).toBe(true)
    expect(r.stats.totalFiles).toBe(1)
  })

  it('groups files by directory', async () => {
    const r = await buildPlatinumHorizonResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(r.rays).toHaveLength(3)
    expect(r.towers).toHaveLength(2)
  })

  it('computes stats correctly', async () => {
    const r = await buildPlatinumHorizonResult(
      ['good.ts', 'bad.ts'],
      [richContent, ''],
    )
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.avgRoyalPurity).toBeGreaterThan(0)
    expect(r.stats.architectGrade).toBeDefined()
    expect(r.stats.bestRay).toBeDefined()
    expect(r.stats.purest).toBeDefined()
    expect(r.stats.mostVisionary).toBeDefined()
    expect(r.stats.mostResilient).toBeDefined()
    expect(r.stats.mostAuthoritative).toBeDefined()
    expect(r.stats.wisest).toBeDefined()
  })

  it('computes high counts', async () => {
    const r = await buildPlatinumHorizonResult(['a.ts'], [richContent])
    expect(r.stats.hasHighPurityCount).toBeGreaterThan(0)
    expect(r.stats.hasHighVisionCount).toBeGreaterThan(0)
    expect(r.stats.hasHighResilienceCount).toBeGreaterThan(0)
    expect(r.stats.hasHighAuthorityCount).toBeGreaterThan(0)
    expect(r.stats.hasHighWisdomCount).toBeGreaterThan(0)
  })

  it('computes condition counts', async () => {
    const r = await buildPlatinumHorizonResult(['a.ts'], [richContent])
    expect(r.stats.platinumMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.nobleHorizonCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.properVistaCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.fadedSkylineCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.darkValleyCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.voidCount).toBeGreaterThanOrEqual(0)
  })

  it('finds best ray and extremes', async () => {
    const r = await buildPlatinumHorizonResult(
      ['high.ts', 'low.ts'],
      [richContent, ''],
    )
    expect(r.stats.bestRay).toBe('high.ts')
    expect(r.stats.purest).toBe('high.ts')
    expect(r.stats.mostVisionary).toBe('high.ts')
    expect(r.stats.mostResilient).toBe('high.ts')
    expect(r.stats.mostAuthoritative).toBe('high.ts')
    expect(r.stats.wisest).toBe('high.ts')
  })
})

// ─── generateRecommendations ──────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends perfection for all-100 stats', () => {
    const rays = [analyzePlatinumRay(richContent, 'a.ts')]
    const towers = [analyzePlatinumTower(rays, '.')]
    const skyline = { avgPurity: 100, avgVision: 100, avgWisdom: 100, isPlatinum: true, overallBrilliance: 100 }
    const stats = {
      totalFiles: 1, totalTowers: 1,
      avgRoyalPurity: 100, avgHorizonVision: 100, avgPlatinumResilience: 100,
      avgCrestAuthority: 100, avgFutureWisdom: 100,
      platinumMasterpieceCount: 1, nobleHorizonCount: 0, properVistaCount: 0,
      fadedSkylineCount: 0, darkValleyCount: 0, voidCount: 0,
      hasHighPurityCount: 1, hasHighVisionCount: 1, hasHighResilienceCount: 1,
      hasHighAuthorityCount: 1, hasHighWisdomCount: 1,
      overallBrilliance: 100, architectGrade: 'platinum-sovereign' as const,
      bestRay: 'a.ts', purest: 'a.ts', mostVisionary: 'a.ts',
      mostResilient: 'a.ts', mostAuthoritative: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations(rays, towers, skyline, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfect brilliance')
  })

  it('recommends polishing when purity is low', () => {
    const rays = [analyzePlatinumRay('', 'a.ts')]
    const towers = [analyzePlatinumTower(rays, '.')]
    const skyline = { avgPurity: 0, avgVision: 0, avgWisdom: 0, isPlatinum: false, overallBrilliance: 0 }
    const stats = {
      totalFiles: 1, totalTowers: 1,
      avgRoyalPurity: 0, avgHorizonVision: 0, avgPlatinumResilience: 0,
      avgCrestAuthority: 0, avgFutureWisdom: 0,
      platinumMasterpieceCount: 0, nobleHorizonCount: 0, properVistaCount: 0,
      fadedSkylineCount: 0, darkValleyCount: 0, voidCount: 1,
      hasHighPurityCount: 0, hasHighVisionCount: 0, hasHighResilienceCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 0, architectGrade: 'ground-dweller' as const,
      bestRay: 'a.ts', purest: 'a.ts', mostVisionary: 'a.ts',
      mostResilient: 'a.ts', mostAuthoritative: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations(rays, towers, skyline, stats)
    expect(recs.some((r) => r.includes('royal purity'))).toBe(true)
  })

  it('recommends restoring darkened rays (few)', () => {
    const voidRays = Array.from({ length: 3 }, (_, i) =>
      analyzePlatinumRay('', `void${i}.ts`),
    )
    const towers = [analyzePlatinumTower(voidRays, '.')]
    const skyline = { avgPurity: 0, avgVision: 0, avgWisdom: 0, isPlatinum: false, overallBrilliance: 0 }
    const stats = {
      totalFiles: 3, totalTowers: 1,
      avgRoyalPurity: 0, avgHorizonVision: 0, avgPlatinumResilience: 0,
      avgCrestAuthority: 0, avgFutureWisdom: 0,
      platinumMasterpieceCount: 0, nobleHorizonCount: 0, properVistaCount: 0,
      fadedSkylineCount: 0, darkValleyCount: 0, voidCount: 3,
      hasHighPurityCount: 0, hasHighVisionCount: 0, hasHighResilienceCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 0, architectGrade: 'ground-dweller' as const,
      bestRay: '', purest: '', mostVisionary: '',
      mostResilient: '', mostAuthoritative: '', wisest: '',
    }
    const recs = generateRecommendations(voidRays, towers, skyline, stats)
    expect(recs.some((r) => r.includes('darkened rays'))).toBe(true)
  })

  it('recommends restoring darkened rays (many)', () => {
    const voidRays = Array.from({ length: 10 }, (_, i) =>
      analyzePlatinumRay('', `void${i}.ts`),
    )
    const towers = [analyzePlatinumTower(voidRays, '.')]
    const skyline = { avgPurity: 0, avgVision: 0, avgWisdom: 0, isPlatinum: false, overallBrilliance: 0 }
    const stats = {
      totalFiles: 10, totalTowers: 1,
      avgRoyalPurity: 0, avgHorizonVision: 0, avgPlatinumResilience: 0,
      avgCrestAuthority: 0, avgFutureWisdom: 0,
      platinumMasterpieceCount: 0, nobleHorizonCount: 0, properVistaCount: 0,
      fadedSkylineCount: 0, darkValleyCount: 0, voidCount: 10,
      hasHighPurityCount: 0, hasHighVisionCount: 0, hasHighResilienceCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 0, architectGrade: 'ground-dweller' as const,
      bestRay: '', purest: '', mostVisionary: '',
      mostResilient: '', mostAuthoritative: '', wisest: '',
    }
    const recs = generateRecommendations(voidRays, towers, skyline, stats)
    expect(recs.some((r) => r.includes('10 darkened rays'))).toBe(true)
  })

  it('recommends complete restoration when all towers poor', () => {
    const rays = [analyzePlatinumRay('', 'a.ts')]
    const towers = [analyzePlatinumTower(rays, '.')]
    const skyline = { avgPurity: 0, avgVision: 0, avgWisdom: 0, isPlatinum: false, overallBrilliance: 0 }
    const stats = {
      totalFiles: 1, totalTowers: 1,
      avgRoyalPurity: 0, avgHorizonVision: 0, avgPlatinumResilience: 0,
      avgCrestAuthority: 0, avgFutureWisdom: 0,
      platinumMasterpieceCount: 0, nobleHorizonCount: 0, properVistaCount: 0,
      fadedSkylineCount: 0, darkValleyCount: 0, voidCount: 1,
      hasHighPurityCount: 0, hasHighVisionCount: 0, hasHighResilienceCount: 0,
      hasHighAuthorityCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 0, architectGrade: 'ground-dweller' as const,
      bestRay: 'a.ts', purest: 'a.ts', mostVisionary: 'a.ts',
      mostResilient: 'a.ts', mostAuthoritative: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations(rays, towers, skyline, stats)
    expect(recs.some((r) => r.includes('complete restoration'))).toBe(true)
  })
})

// ─── Format Helpers ──────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns string for all conditions', () => {
    expect(typeof colorCondition('platinum-masterpiece')).toBe('string')
    expect(typeof colorCondition('noble-horizon')).toBe('string')
    expect(typeof colorCondition('proper-vista')).toBe('string')
    expect(typeof colorCondition('faded-skyline')).toBe('string')
    expect(typeof colorCondition('dark-valley')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorTowerCondition', () => {
  it('returns string for all tower conditions', () => {
    expect(typeof colorTowerCondition('platinum-palace')).toBe('string')
    expect(typeof colorTowerCondition('noble-fortress')).toBe('string')
    expect(typeof colorTowerCondition('proper-watchtower')).toBe('string')
    expect(typeof colorTowerCondition('faded-tower')).toBe('string')
    expect(typeof colorTowerCondition('dark-valley')).toBe('string')
    expect(typeof colorTowerCondition('void')).toBe('string')
    expect(typeof colorTowerCondition('unknown')).toBe('string')
  })
})

describe('formatRayTable', () => {
  it('formats a ray', () => {
    const r = analyzePlatinumRay(richContent, 'test.ts')
    const out = formatRayTable(r)
    expect(out).toContain('test.ts')
    expect(out).toContain('Royal Purity')
    expect(out).toContain('Quality Score')
  })
})

describe('formatRaysTable', () => {
  it('handles empty rays', () => {
    expect(formatRaysTable([])).toContain('No platinum rays')
  })

  it('formats multiple rays', () => {
    const rays = [
      analyzePlatinumRay(richContent, 'a.ts'),
      analyzePlatinumRay(richContent, 'b.ts'),
    ]
    const out = formatRaysTable(rays)
    expect(out).toContain('Platinum Rays')
    expect(out).toContain('a.ts')
    expect(out).toContain('b.ts')
  })
})

describe('formatTowerTable', () => {
  it('formats a tower', () => {
    const rays = [analyzePlatinumRay(richContent, 'src/a.ts')]
    const t = analyzePlatinumTower(rays, 'src')
    const out = formatTowerTable(t)
    expect(out).toContain('src')
    expect(out).toContain('Rays')
    expect(out).toContain('Tower Type')
  })
})

describe('formatTowersTable', () => {
  it('handles empty towers', () => {
    expect(formatTowersTable([])).toContain('No platinum towers')
  })

  it('formats multiple towers', () => {
    const t1 = [analyzePlatinumRay(richContent, 'src/a.ts')]
    const t2 = [analyzePlatinumRay(richContent, 'lib/b.ts')]
    const towers = [
      analyzePlatinumTower(t1, 'src'),
      analyzePlatinumTower(t2, 'lib'),
    ]
    const out = formatTowersTable(towers)
    expect(out).toContain('Platinum Towers')
    expect(out).toContain('src')
    expect(out).toContain('lib')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const r = await buildPlatinumHorizonResult(['a.ts'], [richContent])
    const out = formatStatsTable(r.stats)
    expect(out).toContain('Total Files')
    expect(out).toContain('Architect Grade')
    expect(out).toContain('Best Ray')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const out = formatRecommendations(['Fix A', 'Fix B'])
    expect(out).toContain('Recommendations')
    expect(out).toContain('Fix A')
    expect(out).toContain('Fix B')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const r = await buildPlatinumHorizonResult(['a.ts'], [richContent])
    const out = formatResultTable(r)
    expect(out).toContain('Platinum Horizon Analysis')
    expect(out).toContain('Skyline Overview')
    expect(out).toContain('Platinum Horizon Statistics')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const r = await buildPlatinumHorizonResult(['a.ts'], [richContent])
    const json = formatResultJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.rays).toHaveLength(1)
    expect(parsed.skyline).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────

describe('integration', () => {
  it('end-to-end with mixed content', async () => {
    const r = await buildPlatinumHorizonResult(
      ['good.ts', 'bad.ts', 'ok.ts'],
      [richContent, '', 'export function test(): void { return }'],
    )
    expect(r.rays).toHaveLength(3)
    expect(r.stats.totalFiles).toBe(3)
    expect(r.skyline.overallBrilliance).toBeGreaterThan(0)
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('handles files in same directory', async () => {
    const r = await buildPlatinumHorizonResult(
      ['src/a.ts', 'src/b.ts'],
      [richContent, richContent],
    )
    expect(r.towers).toHaveLength(1)
    expect(r.towers[0].rays).toHaveLength(2)
  })

  it('handles root-level files', async () => {
    const r = await buildPlatinumHorizonResult(
      ['a.ts'],
      [richContent],
    )
    expect(r.towers).toHaveLength(1)
    expect(r.towers[0].directory).toBe('.')
  })
})
