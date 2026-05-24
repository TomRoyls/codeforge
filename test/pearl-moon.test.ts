import { describe, it, expect } from 'vitest'
import {
  measureShining,
  measureLayering,
  measureShifting,
  measurePerfecting,
  measureWarming,
  classifyPearlCondition,
  classifyBedType,
  classifyBedCondition,
  classifyDiverGrade,
  analyzePearlLuster,
  analyzePearlBed,
  buildPearlMoonResult,
  generateRecommendations,
} from '../src/commands/pearl-moon-helpers.js'
import {
  colorScore,
  colorGrade,
  formatLusterTable,
  formatLustersTable,
  formatBedTable,
  formatBedsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/pearl-moon-format-helpers.js'

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
    const result = readFileSync(input, 'utf8')
    if (result === 'test') {
      return JSON.parse(result) as Result
    }
    return {} as Result
  }
}

export const defaultConfig: Options = { name: 'test' }
`

// ─── measureShining ─────────────────────────────────────────────────

describe('measureShining', () => {
  it('returns 0 luster for minimal content', () => {
    const m = measureShining(minimalContent)
    expect(m.luster).toBe(0)
  })

  it('detects polished (export + import)', () => {
    const m = measureShining(richContent)
    expect(m.hasPolished).toBe(true)
  })

  it('detects refined (private + readonly)', () => {
    const m = measureShining(richContent)
    expect(m.hasRefined).toBe(true)
  })

  it('detects presentable (interface + class)', () => {
    const m = measureShining(richContent)
    expect(m.hasPresentable).toBe(true)
  })

  it('detects elegant (strictEq + returnType)', () => {
    const m = measureShining(richContent)
    expect(m.hasElegant).toBe(true)
  })

  it('detects glossy (generics + async)', () => {
    const m = measureShining(richContent)
    expect(m.hasGlossy).toBe(true)
  })

  it('detects beautiful (export + generics)', () => {
    const m = measureShining(richContent)
    expect(m.hasBeautiful).toBe(true)
  })

  it('has no rough for clean code', () => {
    const m = measureShining(richContent)
    expect(m.hasNoRough).toBe(true)
    expect(m.roughCount).toBe(0)
  })

  it('has no unfinished for clean code', () => {
    const m = measureShining(richContent)
    expect(m.hasNoUnfinished).toBe(true)
    expect(m.unfinishedCount).toBe(0)
  })

  it('has no crude when no eval', () => {
    const m = measureShining(richContent)
    expect(m.hasNoCrude).toBe(true)
  })

  it('has no matte when no debugger', () => {
    const m = measureShining(minimalContent)
    expect(m.hasNoMatte).toBe(true)
  })

  it('gives high luster for rich content', () => {
    const m = measureShining(richContent)
    expect(m.luster).toBeGreaterThanOrEqual(70)
    expect(m.hasHighLuster).toBe(true)
  })

  it('detects rough in var code', () => {
    const m = measureShining('var x = 1')
    expect(m.roughCount).toBe(1)
    expect(m.hasNoRough).toBe(false)
  })

  it('detects unfinished in any code', () => {
    const m = measureShining('const x: any = 1')
    expect(m.unfinishedCount).toBe(1)
    expect(m.hasNoUnfinished).toBe(false)
  })

  it('assigns no-luster for very low scores', () => {
    const m = measureShining(minimalContent)
    expect(m.grade).toBe('no-luster')
  })

  it('assigns mirror-luster for very high scores', () => {
    const m = measureShining(richContent)
    expect(m.grade).toBe('mirror-luster')
  })

  it('caps luster at 100', () => {
    const m = measureShining(richContent)
    expect(m.luster).toBeLessThanOrEqual(100)
  })
})

// ─── measureLayering ────────────────────────────────────────────────

describe('measureLayering', () => {
  it('returns low depth for minimal content', () => {
    const m = measureLayering(minimalContent)
    expect(m.depth).toBe(8)
  })

  it('detects layered (docComments + interface)', () => {
    const m = measureLayering(richContent)
    expect(m.hasLayered).toBe(true)
  })

  it('detects deep (generics + typeAlias)', () => {
    const m = measureLayering(richContent)
    expect(m.hasDeep).toBe(true)
  })

  it('detects rich (readonly + returnType)', () => {
    const m = measureLayering(richContent)
    expect(m.hasRich).toBe(true)
  })

  it('detects substantive (strictEq + private)', () => {
    const m = measureLayering(richContent)
    expect(m.hasSubstantive).toBe(true)
  })

  it('detects built (const + interface)', () => {
    const m = measureLayering(richContent)
    expect(m.hasBuilt).toBe(true)
  })

  it('detects gradual (class + docComments)', () => {
    const m = measureLayering(richContent)
    expect(m.hasGradual).toBe(true)
  })

  it('has no shallow for clean code', () => {
    const m = measureLayering(richContent)
    expect(m.hasNoShallow).toBe(true)
    expect(m.shallowCount).toBe(0)
  })

  it('has no thin for clean code', () => {
    const m = measureLayering(richContent)
    expect(m.hasNoThin).toBe(true)
    expect(m.thinCount).toBe(0)
  })

  it('has no superficial when no eval', () => {
    const m = measureLayering(richContent)
    expect(m.hasNoSuperficial).toBe(true)
  })

  it('has no hollow when no debugger', () => {
    const m = measureLayering(minimalContent)
    expect(m.hasNoHollow).toBe(true)
  })

  it('gives high depth for rich content', () => {
    const m = measureLayering(richContent)
    expect(m.depth).toBeGreaterThanOrEqual(70)
    expect(m.hasHighDepth).toBe(true)
  })

  it('detects shallow in var code', () => {
    const m = measureLayering('var x = 1')
    expect(m.shallowCount).toBe(1)
    expect(m.hasNoShallow).toBe(false)
  })

  it('detects thin in any code', () => {
    const m = measureLayering('const x: any = 1')
    expect(m.thinCount).toBe(1)
    expect(m.hasNoThin).toBe(false)
  })

  it('assigns no-coating for very low scores', () => {
    const m = measureLayering('')
    expect(m.nacre).toBe('no-coating')
  })

  it('assigns thick-nacre for very high scores', () => {
    const m = measureLayering(richContent)
    expect(m.nacre).toBe('thick-nacre')
  })

  it('caps depth at 100', () => {
    const m = measureLayering(richContent)
    expect(m.depth).toBeLessThanOrEqual(100)
  })
})

// ─── measureShifting ────────────────────────────────────────────────

describe('measureShifting', () => {
  it('returns low level for minimal content', () => {
    const m = measureShifting(minimalContent)
    expect(m.level).toBe(8)
  })

  it('detects varied (namedExport + export)', () => {
    const m = measureShifting(richContent)
    expect(m.hasVaried).toBe(true)
  })

  it('detects dynamic (returnType + strictEq)', () => {
    const m = measureShifting(richContent)
    expect(m.hasDynamic).toBe(true)
  })

  it('detects colorful (interface + generics)', () => {
    const m = measureShifting(richContent)
    expect(m.hasColorful).toBe(true)
  })

  it('detects shifting (readonly + private)', () => {
    const m = measureShifting(richContent)
    expect(m.hasShifting).toBe(true)
  })

  it('detects multifaceted (class + const)', () => {
    const m = measureShifting(richContent)
    expect(m.hasMultifaceted).toBe(true)
  })

  it('detects diverse (namedExport + returnType)', () => {
    const m = measureShifting(richContent)
    expect(m.hasDiverse).toBe(true)
  })

  it('has no static for clean code', () => {
    const m = measureShifting(richContent)
    expect(m.hasNoStatic).toBe(true)
    expect(m.staticCount).toBe(0)
  })

  it('has no monotone for clean code', () => {
    const m = measureShifting(richContent)
    expect(m.hasNoMonotone).toBe(true)
    expect(m.monotoneCount).toBe(0)
  })

  it('has no fixed when no eval', () => {
    const m = measureShifting(richContent)
    expect(m.hasNoFixed).toBe(true)
  })

  it('has no one-dimensional when no debugger', () => {
    const m = measureShifting(minimalContent)
    expect(m.hasNoOneDimensional).toBe(true)
  })

  it('gives high level for rich content', () => {
    const m = measureShifting(richContent)
    expect(m.level).toBeGreaterThanOrEqual(70)
    expect(m.hasHighLevel).toBe(true)
  })

  it('detects static in var code', () => {
    const m = measureShifting('var x = 1')
    expect(m.staticCount).toBe(1)
    expect(m.hasNoStatic).toBe(false)
  })

  it('detects monotone in any code', () => {
    const m = measureShifting('const x: any = 1')
    expect(m.monotoneCount).toBe(1)
    expect(m.hasNoMonotone).toBe(false)
  })

  it('assigns no-color for very low scores', () => {
    const m = measureShifting('')
    expect(m.iridescence).toBe('no-color')
  })

  it('assigns rainbow-orient for very high scores', () => {
    const m = measureShifting(richContent)
    expect(m.iridescence).toBe('rainbow-orient')
  })

  it('caps level at 100', () => {
    const m = measureShifting(richContent)
    expect(m.level).toBeLessThanOrEqual(100)
  })
})

// ─── measurePerfecting ──────────────────────────────────────────────

describe('measurePerfecting', () => {
  it('returns low grade for minimal content', () => {
    const m = measurePerfecting(minimalContent)
    expect(m.grade).toBe(8)
  })

  it('detects clean (docComments + interface)', () => {
    const m = measurePerfecting(richContent)
    expect(m.hasClean).toBe(true)
  })

  it('detects smooth (typeAlias + generics)', () => {
    const m = measurePerfecting(richContent)
    expect(m.hasSmooth).toBe(true)
  })

  it('detects pristine (returnType + readonly)', () => {
    const m = measurePerfecting(richContent)
    expect(m.hasPristine).toBe(true)
  })

  it('detects immaculate (private + strictEq)', () => {
    const m = measurePerfecting(richContent)
    expect(m.hasImmaculate).toBe(true)
  })

  it('detects perfect (const + docComments)', () => {
    const m = measurePerfecting(richContent)
    expect(m.hasPerfect).toBe(true)
  })

  it('detects unblemished (class + interface)', () => {
    const m = measurePerfecting(richContent)
    expect(m.hasUnblemished).toBe(true)
  })

  it('has no blemished for clean code', () => {
    const m = measurePerfecting(richContent)
    expect(m.hasNoBlemished).toBe(true)
    expect(m.blemishedCount).toBe(0)
  })

  it('has no marked for clean code', () => {
    const m = measurePerfecting(richContent)
    expect(m.hasNoMarked).toBe(true)
    expect(m.markedCount).toBe(0)
  })

  it('has no flawed when no eval', () => {
    const m = measurePerfecting(richContent)
    expect(m.hasNoFlawed).toBe(true)
  })

  it('has no damaged when no debugger', () => {
    const m = measurePerfecting(minimalContent)
    expect(m.hasNoDamaged).toBe(true)
  })

  it('gives high grade for rich content', () => {
    const m = measurePerfecting(richContent)
    expect(m.grade).toBeGreaterThanOrEqual(70)
    expect(m.hasHighGrade).toBe(true)
  })

  it('detects blemished in var code', () => {
    const m = measurePerfecting('var x = 1')
    expect(m.blemishedCount).toBe(1)
    expect(m.hasNoBlemished).toBe(false)
  })

  it('detects marked in any code', () => {
    const m = measurePerfecting('const x: any = 1')
    expect(m.markedCount).toBe(1)
    expect(m.hasNoMarked).toBe(false)
  })

  it('assigns damaged for very low scores', () => {
    const m = measurePerfecting('')
    expect(m.flaw).toBe('damaged')
  })

  it('assigns flawless for very high scores', () => {
    const m = measurePerfecting(richContent)
    expect(m.flaw).toBe('flawless')
  })

  it('caps grade at 100', () => {
    const m = measurePerfecting(richContent)
    expect(m.grade).toBeLessThanOrEqual(100)
  })
})

// ─── measureWarming ─────────────────────────────────────────────────

describe('measureWarming', () => {
  it('returns low warmth for minimal content', () => {
    const m = measureWarming(minimalContent)
    expect(m.warmth).toBe(8)
  })

  it('detects warm (returnType + strictEq)', () => {
    const m = measureWarming(richContent)
    expect(m.hasWarm).toBe(true)
  })

  it('detects alive (readonly + private)', () => {
    const m = measureWarming(richContent)
    expect(m.hasAlive).toBe(true)
  })

  it('detects inviting (interface + generics)', () => {
    const m = measureWarming(richContent)
    expect(m.hasInviting).toBe(true)
  })

  it('detects glowing (typeAlias + docComments)', () => {
    const m = measureWarming(richContent)
    expect(m.hasGlowing).toBe(true)
  })

  it('detects friendly (class + returnType)', () => {
    const m = measureWarming(richContent)
    expect(m.hasFriendly).toBe(true)
  })

  it('detects approachable (const + strictEq)', () => {
    const m = measureWarming(richContent)
    expect(m.hasApproachable).toBe(true)
  })

  it('has no cold for clean code', () => {
    const m = measureWarming(richContent)
    expect(m.hasNoCold).toBe(true)
    expect(m.coldCount).toBe(0)
  })

  it('has no dead for clean code', () => {
    const m = measureWarming(richContent)
    expect(m.hasNoDead).toBe(true)
    expect(m.deadCount).toBe(0)
  })

  it('has no distant when no eval', () => {
    const m = measureWarming(richContent)
    expect(m.hasNoDistant).toBe(true)
  })

  it('has no hostile when no debugger', () => {
    const m = measureWarming(minimalContent)
    expect(m.hasNoHostile).toBe(true)
  })

  it('gives high warmth for rich content', () => {
    const m = measureWarming(richContent)
    expect(m.warmth).toBeGreaterThanOrEqual(70)
    expect(m.hasHighWarmth).toBe(true)
  })

  it('detects cold in var code', () => {
    const m = measureWarming('var x = 1')
    expect(m.coldCount).toBe(1)
    expect(m.hasNoCold).toBe(false)
  })

  it('detects dead in any code', () => {
    const m = measureWarming('const x: any = 1')
    expect(m.deadCount).toBe(1)
    expect(m.hasNoDead).toBe(false)
  })

  it('assigns lifeless for very low scores', () => {
    const m = measureWarming('')
    expect(m.orient).toBe('lifeless')
  })

  it('assigns warm-orient for very high scores', () => {
    const m = measureWarming(richContent)
    expect(m.orient).toBe('warm-orient')
  })

  it('caps warmth at 100', () => {
    const m = measureWarming(richContent)
    expect(m.warmth).toBeLessThanOrEqual(100)
  })
})

// ─── classifyPearlCondition ─────────────────────────────────────────

describe('classifyPearlCondition', () => {
  it('returns south-sea-treasure for 85+', () => {
    expect(classifyPearlCondition(90)).toBe('south-sea-treasure')
  })
  it('returns akoya-perfect for 70-84', () => {
    expect(classifyPearlCondition(75)).toBe('akoya-perfect')
  })
  it('returns proper-pearl for 55-69', () => {
    expect(classifyPearlCondition(60)).toBe('proper-pearl')
  })
  it('returns freshwater-decent for 40-54', () => {
    expect(classifyPearlCondition(45)).toBe('freshwater-decent')
  })
  it('returns imitation for 25-39', () => {
    expect(classifyPearlCondition(30)).toBe('imitation')
  })
  it('returns sand-grain for below 25', () => {
    expect(classifyPearlCondition(10)).toBe('sand-grain')
  })
})

// ─── classifyBedType ────────────────────────────────────────────────

describe('classifyBedType', () => {
  it('returns no-oyster for empty array', () => {
    expect(classifyBedType([])).toBe('no-oyster')
  })
})

// ─── classifyBedCondition ───────────────────────────────────────────

describe('classifyBedCondition', () => {
  it('returns treasure-trove for 75+', () => {
    expect(classifyBedCondition(80)).toBe('treasure-trove')
  })
  it('returns quality-harvest for 60-74', () => {
    expect(classifyBedCondition(65)).toBe('quality-harvest')
  })
  it('returns decent-yield for 45-59', () => {
    expect(classifyBedCondition(50)).toBe('decent-yield')
  })
  it('returns poor-catch for 30-44', () => {
    expect(classifyBedCondition(35)).toBe('poor-catch')
  })
  it('returns empty-shells for 15-29', () => {
    expect(classifyBedCondition(20)).toBe('empty-shells')
  })
  it('returns barren for below 15', () => {
    expect(classifyBedCondition(5)).toBe('barren')
  })
})

// ─── classifyDiverGrade ─────────────────────────────────────────────

describe('classifyDiverGrade', () => {
  it('returns pearl-diver-master for 80+', () => {
    expect(classifyDiverGrade(85)).toBe('pearl-diver-master')
  })
  it('returns expert-diver for 65-79', () => {
    expect(classifyDiverGrade(70)).toBe('expert-diver')
  })
  it('returns skilled-fisher for 50-64', () => {
    expect(classifyDiverGrade(55)).toBe('skilled-fisher')
  })
  it('returns apprentice for 35-49', () => {
    expect(classifyDiverGrade(40)).toBe('apprentice')
  })
  it('returns novice for 20-34', () => {
    expect(classifyDiverGrade(25)).toBe('novice')
  })
  it('returns landlubber for below 20', () => {
    expect(classifyDiverGrade(10)).toBe('landlubber')
  })
})

// ─── analyzePearlLuster ─────────────────────────────────────────────

describe('analyzePearlLuster', () => {
  it('returns a luster with correct file path', () => {
    const luster = analyzePearlLuster(minimalContent, 'index.ts')
    expect(luster.file).toBe('index.ts')
  })

  it('calculates qualityScore correctly for minimal content', () => {
    const luster = analyzePearlLuster(minimalContent, 'index.ts')
    expect(luster.qualityScore).toBe(6)
  })

  it('classifies minimal content as sand-grain', () => {
    const luster = analyzePearlLuster(minimalContent, 'index.ts')
    expect(luster.condition).toBe('sand-grain')
  })

  it('has all measure fields', () => {
    const luster = analyzePearlLuster(minimalContent, 'index.ts')
    expect(luster).toHaveProperty('shining')
    expect(luster).toHaveProperty('layering')
    expect(luster).toHaveProperty('shifting')
    expect(luster).toHaveProperty('perfecting')
    expect(luster).toHaveProperty('warming')
  })

  it('returns high qualityScore for rich content', () => {
    const luster = analyzePearlLuster(richContent, 'rich.ts')
    expect(luster.qualityScore).toBeGreaterThanOrEqual(60)
  })

  it('classifies rich content as south-sea-treasure', () => {
    const luster = analyzePearlLuster(richContent, 'rich.ts')
    expect(luster.condition).toBe('south-sea-treasure')
  })

  it('has all score fields', () => {
    const luster = analyzePearlLuster(minimalContent, 'index.ts')
    expect(typeof luster.lusterQuality).toBe('number')
    expect(typeof luster.nacreDepth).toBe('number')
    expect(typeof luster.iridescenceLevel).toBe('number')
    expect(typeof luster.flawlessnessGrade).toBe('number')
    expect(typeof luster.orientWarmth).toBe('number')
  })
})

// ─── analyzePearlBed ────────────────────────────────────────────────

describe('analyzePearlBed', () => {
  it('returns empty bed for no lusters', () => {
    const bed = analyzePearlBed([], 'src')
    expect(bed.directory).toBe('src')
    expect(bed.lusters.length).toBe(0)
    expect(bed.avgLuster).toBe(0)
    expect(bed.avgDepth).toBe(0)
    expect(bed.avgFlawlessness).toBe(0)
    expect(bed.bedType).toBe('no-oyster')
    expect(bed.condition).toBe('barren')
  })

  it('computes averages from lusters', () => {
    const l1 = analyzePearlLuster(richContent, 'a.ts')
    const l2 = analyzePearlLuster(richContent, 'b.ts')
    const bed = analyzePearlBed([l1, l2], 'src')
    expect(bed.avgLuster).toBe(l1.lusterQuality)
    expect(bed.avgDepth).toBe(l1.nacreDepth)
  })
})

// ─── buildPearlMoonResult ───────────────────────────────────────────

describe('buildPearlMoonResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildPearlMoonResult([], [])
    expect(result.lusters.length).toBe(0)
    expect(result.beds.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalBeds).toBe(0)
    expect(result.ocean.isLuminous).toBe(false)
    expect(result.ocean.overallLuminance).toBe(0)
  })

  it('returns correct structure for single file', async () => {
    const result = await buildPearlMoonResult(['index.ts'], [richContent])
    expect(result.lusters.length).toBe(1)
    expect(result.beds.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestLuster).toBe('index.ts')
    expect(result.stats.shiniest).toBe('index.ts')
    expect(result.stats.deepest).toBe('index.ts')
    expect(result.stats.mostColorful).toBe('index.ts')
    expect(result.stats.warmest).toBe('index.ts')
  })

  it('computes ocean.isLuminous when avgLuster >= 60', async () => {
    const result = await buildPearlMoonResult(['rich.ts'], [richContent])
    expect(result.ocean.isLuminous).toBe(true)
  })

  it('computes overallLuminance as avg of luster+depth+flawlessness/3', async () => {
    const result = await buildPearlMoonResult(['rich.ts'], [richContent])
    const expectedLuminance = Math.round(
      (result.ocean.avgLuster + result.ocean.avgDepth + result.ocean.avgFlawlessness) / 3,
    )
    expect(result.ocean.overallLuminance).toBe(expectedLuminance)
  })

  it('counts condition categories correctly', async () => {
    const result = await buildPearlMoonResult(
      ['rich.ts', 'min.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.southSeaTreasureCount + result.stats.akoyaPerfectCount +
      result.stats.properPearlCount + result.stats.freshwaterDecentCount +
      result.stats.imitationCount + result.stats.sandGrainCount).toBe(2)
  })

  it('counts high measure flags correctly', async () => {
    const result = await buildPearlMoonResult(['rich.ts'], [richContent])
    expect(result.stats.hasHighLusterCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighDepthCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighLevelCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighGradeCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighWarmthCount).toBeGreaterThanOrEqual(1)
  })

  it('groups files by directory into beds', async () => {
    const result = await buildPearlMoonResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.beds.length).toBe(2)
  })

  it('sets diverGrade based on overallLuminance', async () => {
    const result = await buildPearlMoonResult(['rich.ts'], [richContent])
    expect(result.stats.diverGrade).toBe(classifyDiverGrade(result.ocean.overallLuminance))
  })

  it('returns minimal content qualityScore of 6', async () => {
    const result = await buildPearlMoonResult(['min.ts'], [minimalContent])
    expect(result.lusters[0]!.qualityScore).toBe(6)
  })

  it('returns recommendations array', async () => {
    const result = await buildPearlMoonResult(['min.ts'], [minimalContent])
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive message when all metrics are good', async () => {
    const result = await buildPearlMoonResult(['rich.ts'], [richContent])
    expect(result.recommendations).toContain(
      'Your pearl collection is pearl-diver-master quality! Every luster radiates moonlit perfection',
    )
  })

  it('recommends luster improvement when low', async () => {
    const result = await buildPearlMoonResult(['min.ts'], [minimalContent])
    const hasLusterRec = result.recommendations.some(r => r.includes('luster'))
    expect(hasLusterRec).toBe(true)
  })

  it('recommends iridescence improvement when low', async () => {
    const result = await buildPearlMoonResult(['min.ts'], [minimalContent])
    const hasIridescenceRec = result.recommendations.some(r => r.includes('iridescence'))
    expect(hasIridescenceRec).toBe(true)
  })

  it('recommends flawlessness improvement when low', async () => {
    const result = await buildPearlMoonResult(['min.ts'], [minimalContent])
    const hasFlawlessnessRec = result.recommendations.some(r => r.includes('flawlessness'))
    expect(hasFlawlessnessRec).toBe(true)
  })

  it('recommends warmth improvement when low', async () => {
    const result = await buildPearlMoonResult(['min.ts'], [minimalContent])
    const hasWarmthRec = result.recommendations.some(r => r.includes('Warm orient'))
    expect(hasWarmthRec).toBe(true)
  })

  it('mentions sand-grain files when present', async () => {
    const result = await buildPearlMoonResult(['min.ts'], [minimalContent])
    const hasSandGrainRec = result.recommendations.some(r => r.includes('sand-grain'))
    expect(hasSandGrainRec).toBe(true)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for all tiers', () => {
    expect(typeof colorScore(90)).toBe('string')
    expect(typeof colorScore(70)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(30)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for known grades', () => {
    expect(typeof colorGrade('south-sea-treasure')).toBe('string')
    expect(typeof colorGrade('sand-grain')).toBe('string')
    expect(typeof colorGrade('pearl-diver-master')).toBe('string')
  })

  it('returns a string for unknown grades', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatLusterTable', () => {
  it('formats a luster with labels', () => {
    const luster = analyzePearlLuster(richContent, 'test.ts')
    const output = formatLusterTable(luster)
    expect(output).toContain('File:')
    expect(output).toContain('test.ts')
    expect(output).toContain('Luster:')
    expect(output).toContain('Score:')
  })
})

describe('formatLustersTable', () => {
  it('returns no lusters message for empty array', () => {
    expect(formatLustersTable([])).toContain('No pearl lusters found')
  })

  it('formats multiple lusters', () => {
    const l1 = analyzePearlLuster(richContent, 'a.ts')
    const l2 = analyzePearlLuster(minimalContent, 'b.ts')
    const output = formatLustersTable([l1, l2])
    expect(output).toContain('Pearl Moon Analysis')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatBedTable', () => {
  it('formats a bed with labels', async () => {
    const result = await buildPearlMoonResult(['src/a.ts'], [richContent])
    const output = formatBedTable(result.beds[0]!)
    expect(output).toContain('Bed:')
    expect(output).toContain('Type:')
    expect(output).toContain('Condition:')
  })
})

describe('formatBedsTable', () => {
  it('returns no beds message for empty array', () => {
    expect(formatBedsTable([])).toContain('No pearl beds found')
  })

  it('formats multiple beds', async () => {
    const result = await buildPearlMoonResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, richContent],
    )
    const output = formatBedsTable(result.beds)
    expect(output).toContain('Pearl Bed Analysis')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all labels', async () => {
    const result = await buildPearlMoonResult(['test.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Pearl Moon Statistics')
    expect(output).toContain('Total Files:')
    expect(output).toContain('Overall Luminance:')
    expect(output).toContain('Diver Grade:')
    expect(output).toContain('Best Luster:')
    expect(output).toContain('Shiniest:')
    expect(output).toContain('Deepest:')
    expect(output).toContain('Most Colorful:')
    expect(output).toContain('Warmest:')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations message for empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations with bullets', () => {
    const recs = ['First recommendation', 'Second recommendation']
    const output = formatRecommendations(recs)
    expect(output).toContain('Recommendations')
    expect(output).toContain('First recommendation')
    expect(output).toContain('Second recommendation')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildPearlMoonResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Pearl Moon Analysis')
    expect(output).toContain('Pearl Moon Statistics')
    expect(output).toContain('Ocean')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON string', async () => {
    const result = await buildPearlMoonResult(['test.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.lusters).toBeDefined()
    expect(parsed.beds).toBeDefined()
    expect(parsed.ocean).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Grade Boundary Tests ───────────────────────────────────────────

describe('grade boundaries', () => {
  it('LusterGrade boundaries are correct', () => {
    expect(measureShining('').grade).toBe('no-luster')
  })

  it('NacreGrade boundaries are correct', () => {
    expect(measureLayering('').nacre).toBe('no-coating')
  })

  it('IridescenceGrade boundaries are correct', () => {
    expect(measureShifting('').iridescence).toBe('no-color')
  })

  it('FlawGrade boundaries are correct', () => {
    expect(measurePerfecting('').flaw).toBe('damaged')
  })

  it('OrientGrade boundaries are correct', () => {
    expect(measureWarming('').orient).toBe('lifeless')
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles eval detection correctly', () => {
    const m = measureShining('eval("code")')
    expect(m.hasNoCrude).toBe(false)
  })

  it('handles debugger detection correctly', () => {
    const m = measureShining('debugger')
    expect(m.hasNoMatte).toBe(false)
  })

  it('handles mixed good and bad patterns', () => {
    const mixed = `${richContent}\nvar y: any = eval("test")\ndebugger`
    const m = measureShining(mixed)
    expect(m.roughCount).toBe(1)
    expect(m.unfinishedCount).toBe(1)
    expect(m.hasNoCrude).toBe(false)
    expect(m.hasNoMatte).toBe(false)
  })

  it('handles deeply nested content', async () => {
    const result = await buildPearlMoonResult(
      ['a/b/c/d.ts', 'a/b/c/e.ts'],
      [richContent, richContent],
    )
    expect(result.beds.length).toBe(1)
    expect(result.lusters.length).toBe(2)
  })

  it('handles empty content', async () => {
    const result = await buildPearlMoonResult(['empty.ts'], [''])
    expect(result.lusters[0]!.qualityScore).toBe(0)
    expect(result.lusters[0]!.condition).toBe('sand-grain')
  })

  it('handles multiple files with mixed quality', async () => {
    const result = await buildPearlMoonResult(
      ['good.ts', 'bad.ts', 'ugly.ts'],
      [richContent, minimalContent, 'var x: any = eval("")'],
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.sandGrainCount).toBeGreaterThanOrEqual(1)
  })

  it('produces unique best/worst file names', async () => {
    const result = await buildPearlMoonResult(
      ['alpha.ts', 'beta.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.bestLuster).toBeTruthy()
    expect(result.stats.shiniest).toBeTruthy()
  })
})
