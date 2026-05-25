import { describe, it, expect } from 'vitest'

import {
  measureCombining,
  measureAging,
  measureIlluminating,
  measureCrafting,
  measureConducting,
  classifyRayCondition,
  classifyForgeType,
  classifyForgeCondition,
  classifySmithGrade,
  analyzeBronzeRay,
  analyzeBronzeForge,
  generateRecommendations,
  buildBronzeHorizonResult,
} from '../src/commands/bronze-horizon-helpers.js'

import {
  colorScore,
  colorGrade,
  formatRayTable,
  formatRaysTable,
  formatForgeTable,
  formatForgesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/bronze-horizon-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const minimalContent = 'const x = 1'

const richContent = `/**
 * A rich module
 */
export interface Widget<T> {
  readonly id: string
  name?: string
}

export type Status = 'active' | 'inactive'

export enum Color { Red, Green, Blue }

export class Processor {
  private items: Widget<string>[] = []

  async run(): Promise<void> {
    try {
      const found = this.items.find(i => i.id !== '')
      if (found) {
        throw new Error('Found')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
    }
  }
}

export function helper(val: string): string {
  return val
}
`

const badContent = `var x = eval("1 + 2")
debugger
// TODO: fix this
// FIXME: broken
console.log(x as any)
`

const emptyContent = ''

const perfectContent = `/**
 * Perfect module
 */
import { Base } from './base.js'

export interface Perfect<T> {
  readonly id: string
  name?: string
}

export type Result = 'success' | 'failure'

export enum Grade { A, B, C }

export abstract class BaseService {
  abstract execute(): Promise<void>

  protected validate(input: string): boolean {
    return input.length > 0
  }
}

export class MainService extends BaseService implements MainService {
  private data: Perfect<string>[] = []

  async execute(): Promise<void> {
    try {
      const result = this.data.find(d => d.id !== '')
      if (result) {
        throw new Error('validation failed')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
    }
  }
}

export function compute(value: string): string {
  return value
}
`

// ─── measureCombining ──────────────────────────────────────────────

describe('measureCombining', () => {
  it('scores minimal content', () => {
    const m = measureCombining(minimalContent)
    expect(m.strength).toBeGreaterThanOrEqual(0)
    expect(m.strength).toBeLessThanOrEqual(100)
    expect(typeof m.alloy).toBe('string')
  })

  it('scores rich content higher than minimal', () => {
    const rich = measureCombining(richContent)
    const minimal = measureCombining(minimalContent)
    expect(rich.strength).toBeGreaterThan(minimal.strength)
  })

  it('penalizes var usage', () => {
    const m = measureCombining('var x = 1')
    expect(m.strength).toBeLessThan(50)
    expect(m.hasNoUntested).toBe(false)
    expect(m.untestedCount).toBeGreaterThan(0)
  })

  it('penalizes god files as monolithic', () => {
    const long = 'const x = 1\n'.repeat(350)
    const m = measureCombining(long)
    expect(m.monolithicCount).toBeGreaterThan(0)
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('detects modular (import)', () => {
    const m = measureCombining(perfectContent)
    expect(m.hasModular).toBe(true)
  })

  it('detects composable (export + optional)', () => {
    const m = measureCombining(richContent)
    expect(m.hasComposable).toBe(true)
  })

  it('detects flexible (optional or nullish)', () => {
    const m = measureCombining(richContent)
    expect(m.hasFlexible).toBe(true)
  })

  it('detects resilient (try/catch or nullish)', () => {
    const m = measureCombining(richContent)
    expect(m.hasResilient).toBe(true)
  })

  it('detects robust (export + named)', () => {
    const m = measureCombining(richContent)
    expect(m.hasRobust).toBe(true)
  })

  it('detects type safe', () => {
    const m = measureCombining(richContent)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasNoUnsafe).toBe(true)
  })

  it('handles empty content', () => {
    const m = measureCombining(emptyContent)
    expect(m.strength).toBeGreaterThanOrEqual(0)
    expect(m.alloy).toBe('no-alloy')
  })
})

// ─── measureAging ──────────────────────────────────────────────────

describe('measureAging', () => {
  it('scores minimal content', () => {
    const m = measureAging(minimalContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
    expect(m.wisdom).toBeLessThanOrEqual(100)
    expect(typeof m.patina).toBe('string')
  })

  it('rewards documentation and structure', () => {
    const m = measureAging(richContent)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellStructured).toBe(true)
  })

  it('rewards abstract and extends', () => {
    const m = measureAging(perfectContent)
    expect(m.hasMature).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasDeep).toBe(true)
  })

  it('penalizes var as ad hoc', () => {
    const m = measureAging('var x = 1')
    expect(m.adHocCount).toBeGreaterThan(0)
    expect(m.hasNoAdHoc).toBe(false)
  })

  it('penalizes eval as experimental', () => {
    const m = measureAging('eval("code")')
    expect(m.experimentalCount).toBeGreaterThan(0)
    expect(m.hasNoNovel).toBe(false)
  })

  it('detects battle tested (extends/implements + doc)', () => {
    const m = measureAging(perfectContent)
    expect(m.hasBattleTested).toBe(true)
  })

  it('detects timeless (doc + interface + extends/abstract)', () => {
    const m = measureAging(perfectContent)
    expect(m.hasTimeless).toBe(true)
  })

  it('detects established (wisdom >= 70)', () => {
    const m = measureAging(perfectContent)
    expect(m.hasEstablished).toBe(true)
  })

  it('detects no unproven (no eval, no debugger)', () => {
    const m = measureAging(richContent)
    expect(m.hasNoUnproven).toBe(true)
  })

  it('handles empty content', () => {
    const m = measureAging(emptyContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
    expect(m.patina).toBe('no-patina')
  })
})

// ─── measureIlluminating ───────────────────────────────────────────

describe('measureIlluminating', () => {
  it('scores minimal content', () => {
    const m = measureIlluminating(minimalContent)
    expect(m.clarity).toBeGreaterThanOrEqual(0)
    expect(m.clarity).toBeLessThanOrEqual(100)
    expect(typeof m.dawn).toBe('string')
  })

  it('rewards exports and docs', () => {
    const m = measureIlluminating(richContent)
    expect(m.hasReadable).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
  })

  it('penalizes var as cryptic', () => {
    const m = measureIlluminating('var x = 1')
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('penalizes debugger as obfuscated', () => {
    const m = measureIlluminating('debugger')
    expect(m.obfuscatedCount).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('detects approachable (export + named)', () => {
    const m = measureIlluminating(richContent)
    expect(m.hasApproachable).toBe(true)
  })

  it('detects inviting (doc + export)', () => {
    const m = measureIlluminating(richContent)
    expect(m.hasInviting).toBe(true)
  })

  it('detects transparent (named + no eval)', () => {
    const m = measureIlluminating(richContent)
    expect(m.hasTransparent).toBe(true)
  })

  it('detects warm (doc + const)', () => {
    const m = measureIlluminating(richContent)
    expect(m.hasWarm).toBe(true)
  })

  it('detects no hostile (no eval, no debugger)', () => {
    const m = measureIlluminating(richContent)
    expect(m.hasNoHostile).toBe(true)
  })

  it('handles empty content', () => {
    const m = measureIlluminating(emptyContent)
    expect(m.clarity).toBeGreaterThanOrEqual(0)
    expect(m.dawn).toBe('no-dawn')
  })
})

// ─── measureCrafting ───────────────────────────────────────────────

describe('measureCrafting', () => {
  it('scores minimal content', () => {
    const m = measureCrafting(minimalContent)
    expect(m.precision).toBeGreaterThanOrEqual(0)
    expect(m.precision).toBeLessThanOrEqual(100)
    expect(typeof m.forge).toBe('string')
  })

  it('rewards return types and generics', () => {
    const m = measureCrafting(richContent)
    expect(m.hasExact).toBe(true)
    expect(m.hasAccurate).toBe(true)
  })

  it('penalizes var as approximate', () => {
    const m = measureCrafting('var x = 1')
    expect(m.approximateCount).toBeGreaterThan(0)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('penalizes eval as sloppy', () => {
    const m = measureCrafting('eval("code")')
    expect(m.sloppyCount).toBeGreaterThan(0)
    expect(m.hasNoSloppy).toBe(false)
  })

  it('detects precise (readonly + optional)', () => {
    const m = measureCrafting(richContent)
    expect(m.hasPrecise).toBe(true)
  })

  it('detects sharp (return type + no any)', () => {
    const m = measureCrafting(richContent)
    expect(m.hasSharp).toBe(true)
  })

  it('detects defined (interface or type)', () => {
    const m = measureCrafting(richContent)
    expect(m.hasDefined).toBe(true)
  })

  it('detects immaculate (named + doc + no debugger)', () => {
    const m = measureCrafting(richContent)
    expect(m.hasImmaculate).toBe(true)
  })

  it('detects refined (readonly + named)', () => {
    const m = measureCrafting(richContent)
    expect(m.hasRefined).toBe(true)
  })

  it('handles empty content', () => {
    const m = measureCrafting(emptyContent)
    expect(m.precision).toBeGreaterThanOrEqual(0)
    expect(m.forge).toBe('no-craft')
  })
})

// ─── measureConducting ─────────────────────────────────────────────

describe('measureConducting', () => {
  it('scores minimal content', () => {
    const m = measureConducting(minimalContent)
    expect(m.current).toBeGreaterThanOrEqual(0)
    expect(m.current).toBeLessThanOrEqual(100)
    expect(typeof m.flow).toBe('string')
  })

  it('rewards pipelines and async', () => {
    const m = measureConducting(richContent)
    expect(m.hasEfficientFlow).toBe(true)
    expect(m.hasCleanPipelines).toBe(true)
  })

  it('penalizes god files as bottleneck', () => {
    const long = 'const x = 1\n'.repeat(350)
    const m = measureConducting(long)
    expect(m.bottleneckCount).toBeGreaterThan(0)
    expect(m.hasNoBottlenecks).toBe(false)
  })

  it('penalizes debugger as tangled', () => {
    const m = measureConducting('debugger')
    expect(m.tangledCount).toBeGreaterThan(0)
    expect(m.hasNoTangled).toBe(false)
  })

  it('detects streamlined (arrow + const)', () => {
    const m = measureConducting(richContent)
    expect(m.hasStreamlined).toBe(true)
  })

  it('detects durable (try/catch or async)', () => {
    const m = measureConducting(richContent)
    expect(m.hasDurable).toBe(true)
  })

  it('detects extensible (optional or generics)', () => {
    const m = measureConducting(richContent)
    expect(m.hasExtensible).toBe(true)
  })

  it('detects maintainable (named + no var)', () => {
    const m = measureConducting(richContent)
    expect(m.hasMaintainable).toBe(true)
  })

  it('detects direct paths (export + no any)', () => {
    const m = measureConducting(richContent)
    expect(m.hasDirectPaths).toBe(true)
  })

  it('handles empty content', () => {
    const m = measureConducting(emptyContent)
    expect(m.current).toBeGreaterThanOrEqual(0)
    expect(m.flow).toBe('no-flow')
  })
})

// ─── Classifications ───────────────────────────────────────────────

describe('classifyRayCondition', () => {
  it('classifies bronze-masterpiece', () => { expect(classifyRayCondition(95)).toBe('bronze-masterpiece') })
  it('classifies aged-treasure', () => { expect(classifyRayCondition(80)).toBe('aged-treasure') })
  it('classifies proper-alloy', () => { expect(classifyRayCondition(65)).toBe('proper-alloy') })
  it('classifies tarnished-metal', () => { expect(classifyRayCondition(45)).toBe('tarnished-metal') })
  it('classifies rusty-iron', () => { expect(classifyRayCondition(25)).toBe('rusty-iron') })
  it('classifies scrap', () => { expect(classifyRayCondition(10)).toBe('scrap') })
})

describe('classifyForgeType', () => {
  it('returns no-forge for empty rays', () => {
    expect(classifyForgeType([])).toBe('no-forge')
  })

  it('returns ancient-foundry or better for high quality', () => {
    const ray = analyzeBronzeRay(perfectContent, 'perfect.ts')
    const ft = classifyForgeType([ray])
    expect(ft).toBeOneOf(['ancient-foundry', 'proper-forge', 'workshop'])
  })

  it('returns no-forge for very low quality', () => {
    const ray = analyzeBronzeRay('', 'empty.ts')
    expect(classifyForgeType([ray])).toBe('no-forge')
  })
})

describe('classifyForgeCondition', () => {
  it('classifies golden-age', () => { expect(classifyForgeCondition(90)).toBe('golden-age') })
  it('classifies prosperous-era', () => { expect(classifyForgeCondition(75)).toBe('prosperous-era') })
  it('classifies proper-workshop', () => { expect(classifyForgeCondition(60)).toBe('proper-workshop') })
  it('classifies declining-era', () => { expect(classifyForgeCondition(40)).toBe('declining-era') })
  it('classifies abandoned-mine', () => { expect(classifyForgeCondition(20)).toBe('abandoned-mine') })
  it('classifies void', () => { expect(classifyForgeCondition(5)).toBe('void') })
})

describe('classifySmithGrade', () => {
  it('classifies master-smith', () => { expect(classifySmithGrade(90)).toBe('master-smith') })
  it('classifies expert-forger', () => { expect(classifySmithGrade(75)).toBe('expert-forger') })
  it('classifies skilled-metallurgist', () => { expect(classifySmithGrade(60)).toBe('skilled-metallurgist') })
  it('classifies apprentice', () => { expect(classifySmithGrade(45)).toBe('apprentice') })
  it('classifies novice', () => { expect(classifySmithGrade(25)).toBe('novice') })
  it('classifies scrap-collector', () => { expect(classifySmithGrade(10)).toBe('scrap-collector') })
})

// ─── analyzeBronzeRay ──────────────────────────────────────────────

describe('analyzeBronzeRay', () => {
  it('returns a complete ray object', () => {
    const ray = analyzeBronzeRay(richContent, 'test.ts')
    expect(ray.file).toBe('test.ts')
    expect(ray.alloyStrength).toBeGreaterThan(0)
    expect(ray.patinaWisdom).toBeGreaterThan(0)
    expect(ray.dawnClarity).toBeGreaterThan(0)
    expect(ray.forgePrecision).toBeGreaterThan(0)
    expect(ray.durableCurrent).toBeGreaterThan(0)
    expect(ray.qualityScore).toBeGreaterThan(0)
    expect(typeof ray.condition).toBe('string')
  })

  it('computes qualityScore as weighted average', () => {
    const ray = analyzeBronzeRay(richContent, 'test.ts')
    const expected = Math.round(
      ray.alloyStrength * 0.2 +
      ray.patinaWisdom * 0.2 +
      ray.dawnClarity * 0.2 +
      ray.forgePrecision * 0.2 +
      ray.durableCurrent * 0.2,
    )
    expect(ray.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const ray = analyzeBronzeRay(richContent, 'test.ts')
    expect(ray.combining).toBeDefined()
    expect(ray.aging).toBeDefined()
    expect(ray.illuminating).toBeDefined()
    expect(ray.crafting).toBeDefined()
    expect(ray.conducting).toBeDefined()
  })

  it('handles empty content gracefully', () => {
    const ray = analyzeBronzeRay(emptyContent, 'empty.ts')
    expect(ray.qualityScore).toBe(0)
    expect(ray.condition).toBe('scrap')
  })

  it('bad content scores lower than rich content', () => {
    const bad = analyzeBronzeRay(badContent, 'bad.ts')
    const rich = analyzeBronzeRay(richContent, 'rich.ts')
    expect(bad.qualityScore).toBeLessThan(rich.qualityScore)
  })
})

// ─── analyzeBronzeForge ────────────────────────────────────────────

describe('analyzeBronzeForge', () => {
  it('returns empty forge for no rays', () => {
    const forge = analyzeBronzeForge([], 'empty-dir')
    expect(forge.directory).toBe('empty-dir')
    expect(forge.rays).toHaveLength(0)
    expect(forge.avgStrength).toBe(0)
    expect(forge.forgeType).toBe('no-forge')
    expect(forge.condition).toBe('void')
  })

  it('aggregates ray scores', () => {
    const rays = [
      analyzeBronzeRay(richContent, 'a.ts'),
      analyzeBronzeRay(richContent, 'b.ts'),
    ]
    const forge = analyzeBronzeForge(rays, 'src')
    expect(forge.rays).toHaveLength(2)
    expect(forge.avgStrength).toBeGreaterThan(0)
    expect(forge.avgClarity).toBeGreaterThan(0)
    expect(forge.avgCurrent).toBeGreaterThan(0)
  })

  it('counts masterpieces and scrap', () => {
    const good = analyzeBronzeRay(perfectContent, 'perfect.ts')
    const bad = analyzeBronzeRay(emptyContent, 'empty.ts')
    const forge = analyzeBronzeForge([good, bad], 'mix')
    expect(forge.scrapCount).toBeGreaterThanOrEqual(1)
    expect(forge.rays).toHaveLength(2)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high luster and no scrap', () => {
    const rays = [analyzeBronzeRay(perfectContent, 'p.ts')]
    const forges = [analyzeBronzeForge(rays, 'src')]
    const age = { avgStrength: 90, avgClarity: 90, avgCurrent: 90, isBronze: true, overallLuster: 90 }
    const stats = {
      totalFiles: 1, totalForges: 1,
      avgAlloyStrength: 90, avgPatinaWisdom: 90, avgDawnClarity: 90,
      avgForgePrecision: 90, avgDurableCurrent: 90,
      bronzeMasterpieceCount: 1, agedTreasureCount: 0, properAlloyCount: 0,
      tarnishedMetalCount: 0, rustyIronCount: 0, scrapCount: 0,
      hasHighStrengthCount: 1, hasHighWisdomCount: 1, hasHighClarityCount: 1,
      hasHighPrecisionCount: 1, hasHighCurrentCount: 1,
      overallLuster: 90, smithGrade: 'master-smith' as const,
      bestRay: 'p.ts', strongest: 'p.ts', wisest: 'p.ts',
      clearest: 'p.ts', mostConductive: 'p.ts',
    }
    const recs = generateRecommendations(rays, forges, age, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('Bronze horizon perfection')
  })

  it('suggests alloy improvement for low scores', () => {
    const rays = [analyzeBronzeRay('', 'e.ts')]
    const forges = [analyzeBronzeForge(rays, 'src')]
    const age = { avgStrength: 0, avgClarity: 0, avgCurrent: 0, isBronze: false, overallLuster: 0 }
    const stats = {
      totalFiles: 1, totalForges: 1,
      avgAlloyStrength: 0, avgPatinaWisdom: 0, avgDawnClarity: 0,
      avgForgePrecision: 0, avgDurableCurrent: 0,
      bronzeMasterpieceCount: 0, agedTreasureCount: 0, properAlloyCount: 0,
      tarnishedMetalCount: 0, rustyIronCount: 0, scrapCount: 1,
      hasHighStrengthCount: 0, hasHighWisdomCount: 0, hasHighClarityCount: 0,
      hasHighPrecisionCount: 0, hasHighCurrentCount: 0,
      overallLuster: 0, smithGrade: 'scrap-collector' as const,
      bestRay: 'e.ts', strongest: 'e.ts', wisest: 'e.ts',
      clearest: 'e.ts', mostConductive: 'e.ts',
    }
    const recs = generateRecommendations(rays, forges, age, stats)
    expect(recs.some(r => r.includes('Strengthen'))).toBe(true)
  })

  it('mentions scrap files by name when few', () => {
    const rays = [analyzeBronzeRay('', 'bad1.ts'), analyzeBronzeRay('', 'bad2.ts')]
    const forges = [analyzeBronzeForge(rays, 'src')]
    const age = { avgStrength: 0, avgClarity: 0, avgCurrent: 0, isBronze: false, overallLuster: 0 }
    const stats = {
      totalFiles: 2, totalForges: 1,
      avgAlloyStrength: 0, avgPatinaWisdom: 0, avgDawnClarity: 0,
      avgForgePrecision: 0, avgDurableCurrent: 0,
      bronzeMasterpieceCount: 0, agedTreasureCount: 0, properAlloyCount: 0,
      tarnishedMetalCount: 0, rustyIronCount: 0, scrapCount: 2,
      hasHighStrengthCount: 0, hasHighWisdomCount: 0, hasHighClarityCount: 0,
      hasHighPrecisionCount: 0, hasHighCurrentCount: 0,
      overallLuster: 0, smithGrade: 'scrap-collector' as const,
      bestRay: 'bad1.ts', strongest: 'bad1.ts', wisest: 'bad1.ts',
      clearest: 'bad1.ts', mostConductive: 'bad1.ts',
    }
    const recs = generateRecommendations(rays, forges, age, stats)
    expect(recs.some(r => r.includes('bad1.ts'))).toBe(true)
  })

  it('reports scrap count when many files', () => {
    const rayList = Array.from({ length: 5 }, (_, i) => analyzeBronzeRay('', `v${i}.ts`))
    const forges = [analyzeBronzeForge(rayList, 'src')]
    const age = { avgStrength: 0, avgClarity: 0, avgCurrent: 0, isBronze: false, overallLuster: 0 }
    const stats = {
      totalFiles: 5, totalForges: 1,
      avgAlloyStrength: 0, avgPatinaWisdom: 0, avgDawnClarity: 0,
      avgForgePrecision: 0, avgDurableCurrent: 0,
      bronzeMasterpieceCount: 0, agedTreasureCount: 0, properAlloyCount: 0,
      tarnishedMetalCount: 0, rustyIronCount: 0, scrapCount: 5,
      hasHighStrengthCount: 0, hasHighWisdomCount: 0, hasHighClarityCount: 0,
      hasHighPrecisionCount: 0, hasHighCurrentCount: 0,
      overallLuster: 0, smithGrade: 'scrap-collector' as const,
      bestRay: 'v0.ts', strongest: 'v0.ts', wisest: 'v0.ts',
      clearest: 'v0.ts', mostConductive: 'v0.ts',
    }
    const recs = generateRecommendations(rayList, forges, age, stats)
    expect(recs.some(r => r.includes('5 scrap'))).toBe(true)
  })
})

// ─── buildBronzeHorizonResult ──────────────────────────────────────

describe('buildBronzeHorizonResult', () => {
  it('returns complete result for single file', async () => {
    const result = await buildBronzeHorizonResult(['test.ts'], [richContent])
    expect(result.rays).toHaveLength(1)
    expect(result.forges).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.age.overallLuster).toBeGreaterThan(0)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('handles multiple files in different directories', async () => {
    const result = await buildBronzeHorizonResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, richContent],
    )
    expect(result.rays).toHaveLength(2)
    expect(result.forges).toHaveLength(2)
    expect(result.stats.totalForges).toBe(2)
  })

  it('computes correct averages', async () => {
    const result = await buildBronzeHorizonResult(
      ['a.ts', 'b.ts'],
      [richContent, perfectContent],
    )
    expect(result.stats.avgAlloyStrength).toBeGreaterThan(0)
    expect(result.stats.avgPatinaWisdom).toBeGreaterThan(0)
    expect(result.stats.overallLuster).toBeGreaterThan(0)
  })

  it('computes overall luster as avg of strength, clarity, current', async () => {
    const result = await buildBronzeHorizonResult(['a.ts'], [richContent])
    const expected = Math.round(
      (result.stats.avgAlloyStrength + result.stats.avgDawnClarity + result.stats.avgDurableCurrent) / 3,
    )
    expect(result.stats.overallLuster).toBe(expected)
  })

  it('identifies best ray', async () => {
    const result = await buildBronzeHorizonResult(
      ['bad.ts', 'good.ts'],
      [emptyContent, perfectContent],
    )
    expect(result.stats.bestRay).toBe('good.ts')
  })

  it('identifies strongest', async () => {
    const result = await buildBronzeHorizonResult(
      ['bad.ts', 'good.ts'],
      [minimalContent, perfectContent],
    )
    expect(result.stats.strongest).toBe('good.ts')
  })

  it('identifies wisest', async () => {
    const result = await buildBronzeHorizonResult(
      ['bad.ts', 'good.ts'],
      [minimalContent, perfectContent],
    )
    expect(result.stats.wisest).toBe('good.ts')
  })

  it('identifies clearest', async () => {
    const result = await buildBronzeHorizonResult(
      ['bad.ts', 'good.ts'],
      [minimalContent, perfectContent],
    )
    expect(result.stats.clearest).toBe('good.ts')
  })

  it('identifies most conductive', async () => {
    const result = await buildBronzeHorizonResult(
      ['bad.ts', 'good.ts'],
      [minimalContent, perfectContent],
    )
    expect(result.stats.mostConductive).toBe('good.ts')
  })

  it('handles empty input', async () => {
    const result = await buildBronzeHorizonResult([], [])
    expect(result.rays).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallLuster).toBe(0)
    expect(result.age.isBronze).toBe(false)
  })

  it('counts condition categories', async () => {
    const result = await buildBronzeHorizonResult(
      ['perfect.ts', 'empty.ts'],
      [perfectContent, emptyContent],
    )
    expect(result.stats.scrapCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('assigns smith grade based on overall luster', async () => {
    const result = await buildBronzeHorizonResult(['p.ts'], [perfectContent])
    expect(typeof result.stats.smithGrade).toBe('string')
    expect(result.stats.smithGrade).not.toBe('scrap-collector')
  })

  it('handles missing content gracefully', async () => {
    const result = await buildBronzeHorizonResult(['x.ts'], [])
    expect(result.rays).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('format helpers', () => {
  const ray = analyzeBronzeRay(richContent, 'test.ts')
  const forge = analyzeBronzeForge([ray], 'src')

  it('colorScore returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('colorGrade returns a string', () => {
    expect(typeof colorGrade('bronze-masterpiece')).toBe('string')
  })

  it('formatRayTable returns multi-line string', () => {
    const output = formatRayTable(ray)
    expect(output).toContain('test.ts')
    expect(output).toContain('Alloy Strength')
    expect(output).toContain('Patina Wisdom')
    expect(output).toContain('Dawn Clarity')
    expect(output).toContain('Forge Precision')
    expect(output).toContain('Durable Current')
  })

  it('formatRaysTable handles empty array', () => {
    expect(formatRaysTable([])).toContain('No bronze rays')
  })

  it('formatRaysTable formats multiple rays', () => {
    const ray2 = analyzeBronzeRay(perfectContent, 'perfect.ts')
    const output = formatRaysTable([ray, ray2])
    expect(output).toContain('test.ts')
    expect(output).toContain('perfect.ts')
  })

  it('formatForgeTable returns multi-line string', () => {
    const output = formatForgeTable(forge)
    expect(output).toContain('src')
    expect(output).toContain('Rays')
    expect(output).toContain('Avg Strength')
    expect(output).toContain('Forge Type')
  })

  it('formatForgesTable handles empty array', () => {
    expect(formatForgesTable([])).toContain('No bronze forges')
  })

  it('formatStatsTable returns stats', async () => {
    const result = await buildBronzeHorizonResult(['t.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Total Files')
    expect(output).toContain('Overall Luster')
    expect(output).toContain('Smith Grade')
  })

  it('formatRecommendations handles empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formatRecommendations formats items', () => {
    const output = formatRecommendations(['improve X'])
    expect(output).toContain('improve X')
  })

  it('formatResultTable returns full output', async () => {
    const result = await buildBronzeHorizonResult(['t.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Bronze Ray Analysis')
    expect(output).toContain('Bronze Forges')
    expect(output).toContain('Bronze Horizon Statistics')
    expect(output).toContain('Age')
    expect(output).toContain('Recommendations')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildBronzeHorizonResult(['t.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.rays).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles single-line content', () => {
    const ray = analyzeBronzeRay('export const x = 1', 'single.ts')
    expect(ray.qualityScore).toBeGreaterThan(0)
  })

  it('handles content with only comments', () => {
    const ray = analyzeBronzeRay('// just a comment', 'comment.ts')
    expect(ray.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('handles very long content', () => {
    const longContent = richContent.repeat(20)
    const ray = analyzeBronzeRay(longContent, 'long.ts')
    expect(ray.qualityScore).toBeGreaterThan(0)
  })

  it('handles mixed good and bad content', () => {
    const mixed = richContent + '\n' + badContent
    const ray = analyzeBronzeRay(mixed, 'mixed.ts')
    expect(ray.qualityScore).toBeGreaterThan(0)
    expect(ray.combining.untestedCount).toBeGreaterThan(0)
  })

  it('classifies all alloy levels', () => {
    const alloys = [
      measureCombining(perfectContent).alloy,
      measureCombining(richContent).alloy,
      measureCombining(badContent).alloy,
      measureCombining(emptyContent).alloy,
    ]
    expect(alloys.every(a => typeof a === 'string')).toBe(true)
  })

  it('classifies all patina levels', () => {
    const patinas = [
      measureAging(perfectContent).patina,
      measureAging(richContent).patina,
      measureAging(badContent).patina,
      measureAging(emptyContent).patina,
    ]
    expect(patinas.every(p => typeof p === 'string')).toBe(true)
  })

  it('classifies all dawn levels', () => {
    const dawns = [
      measureIlluminating(perfectContent).dawn,
      measureIlluminating(richContent).dawn,
      measureIlluminating(badContent).dawn,
      measureIlluminating(emptyContent).dawn,
    ]
    expect(dawns.every(d => typeof d === 'string')).toBe(true)
  })

  it('classifies all forge craft levels', () => {
    const forges = [
      measureCrafting(perfectContent).forge,
      measureCrafting(richContent).forge,
      measureCrafting(badContent).forge,
      measureCrafting(emptyContent).forge,
    ]
    expect(forges.every(f => typeof f === 'string')).toBe(true)
  })

  it('classifies all flow levels', () => {
    const flows = [
      measureConducting(perfectContent).flow,
      measureConducting(richContent).flow,
      measureConducting(badContent).flow,
      measureConducting(emptyContent).flow,
    ]
    expect(flows.every(f => typeof f === 'string')).toBe(true)
  })

  it('buildBronzeHorizonResult with many files', async () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => richContent)
    const result = await buildBronzeHorizonResult(files, contents)
    expect(result.rays).toHaveLength(20)
    expect(result.stats.totalFiles).toBe(20)
  })
})
