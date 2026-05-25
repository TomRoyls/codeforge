import { describe, expect, it } from 'vitest'
import {
  analyzeCopperRay,
  analyzeCopperHearth,
  buildCopperMorningResult,
  classifyCondition,
  classifyHearthCondition,
  classifyHearthType,
  classifySmithGrade,
  generateRecommendations,
  measureAging,
  measureKindling,
  measureConnecting,
  measureComforting,
  measureGrounding,
  type CopperRay,
  type CopperMorningStats,
  type CopperMorningResult,
  type CopperHearth,
} from '../src/commands/copper-morning-helpers.js'
import {
  colorCondition,
  colorHearthCondition,
  colorScore,
  formatRayTable,
  formatRaysTable,
  formatHearthTable,
  formatHearthsTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/copper-morning-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const emptyContent = ''

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

const minimalContent = 'const x = 1'

// ─── measureAging ───────────────────────────────────────

describe('measureAging', () => {
  it('returns zero for empty content', () => {
    const result = measureAging(emptyContent)
    expect(result.wisdom).toBe(0)
    expect(result.patina).toBe('no-wisdom')
    expect(result.hasHighWisdom).toBe(false)
  })

  it('detects documented code', () => {
    expect(measureAging(richContent).hasDocumented).toBe(true)
  })

  it('detects proven code', () => {
    expect(measureAging(richContent).hasProven).toBe(true)
  })

  it('detects mature code', () => {
    expect(measureAging(richContent).hasMature).toBe(true)
  })

  it('detects established code', () => {
    expect(measureAging(richContent).hasEstablished).toBe(true)
  })

  it('detects maintained code', () => {
    expect(measureAging(richContent).hasMaintained).toBe(true)
  })

  it('detects stable code', () => {
    expect(measureAging(richContent).hasStable).toBe(true)
  })

  it('detects timeless code', () => {
    expect(measureAging(richContent).hasTimeless).toBe(true)
  })

  it('detects enduring code', () => {
    expect(measureAging(richContent).hasEnduring).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureAging(richContent)
    const empty = measureAging(emptyContent)
    expect(rich.wisdom).toBeGreaterThan(empty.wisdom)
  })

  it('hasNoExperimental is true without beta', () => {
    expect(measureAging(richContent).hasNoExperimental).toBe(true)
  })

  it('hasNoVolatile is true without var', () => {
    expect(measureAging(richContent).hasNoVolatile).toBe(true)
  })
})

// ─── measureKindling ────────────────────────────────────

describe('measureKindling', () => {
  it('returns zero for empty content', () => {
    const result = measureKindling(emptyContent)
    expect(result.clarity).toBe(0)
    expect(result.dawn).toBe('no-clarity')
    expect(result.hasHighClarity).toBe(false)
  })

  it('detects readable code', () => {
    expect(measureKindling(richContent).hasReadable).toBe(true)
  })

  it('detects self-documenting code', () => {
    expect(measureKindling(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects clear types', () => {
    expect(measureKindling(richContent).hasClear).toBe(true)
  })

  it('detects transparent code', () => {
    expect(measureKindling(richContent).hasTransparent).toBe(true)
  })

  it('detects understandable code', () => {
    expect(measureKindling(richContent).hasUnderstandable).toBe(true)
  })

  it('detects direct code', () => {
    expect(measureKindling(richContent).hasDirect).toBe(true)
  })

  it('detects purpose code', () => {
    expect(measureKindling(richContent).hasPurpose).toBe(true)
  })

  it('detects illuminated code', () => {
    expect(measureKindling(richContent).hasIlluminated).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureKindling(richContent)
    const empty = measureKindling(emptyContent)
    expect(rich.clarity).toBeGreaterThan(empty.clarity)
  })

  it('hasNoHidden is true without ts-ignore', () => {
    expect(measureKindling(richContent).hasNoHidden).toBe(true)
  })

  it('hasNoHidden is false with ts-ignore', () => {
    expect(measureKindling('// @ts-ignore\n').hasNoHidden).toBe(false)
  })
})

// ─── measureConnecting ──────────────────────────────────

describe('measureConnecting', () => {
  it('returns zero for empty content', () => {
    const result = measureConnecting(emptyContent)
    expect(result.conductivity).toBe(0)
    expect(result.wire).toBe('no-conductivity')
    expect(result.hasHighConductivity).toBe(false)
  })

  it('detects exported code', () => {
    expect(measureConnecting(richContent).hasExported).toBe(true)
  })

  it('detects clean pipelines', () => {
    expect(measureConnecting(richContent).hasCleanPipelines).toBe(true)
  })

  it('detects modular code', () => {
    expect(measureConnecting(richContent).hasModular).toBe(true)
  })

  it('detects connected code', () => {
    expect(measureConnecting(richContent).hasConnected).toBe(true)
  })

  it('detects efficient code', () => {
    expect(measureConnecting(richContent).hasEfficient).toBe(true)
  })

  it('detects organized code', () => {
    expect(measureConnecting(richContent).hasOrganized).toBe(true)
  })

  it('detects linked code', () => {
    expect(measureConnecting(richContent).hasLinked).toBe(true)
  })

  it('detects flowing code', () => {
    expect(measureConnecting(richContent).hasFlowing).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureConnecting(richContent)
    const empty = measureConnecting(emptyContent)
    expect(rich.conductivity).toBeGreaterThan(empty.conductivity)
  })

  it('hasNoTangled is true without tangled', () => {
    expect(measureConnecting(richContent).hasNoTangled).toBe(true)
  })

  it('hasNoIsolated is true for rich content', () => {
    expect(measureConnecting(richContent).hasNoIsolated).toBe(true)
  })
})

// ─── measureComforting ──────────────────────────────────

describe('measureComforting', () => {
  it('returns zero for empty content', () => {
    const result = measureComforting(emptyContent)
    expect(result.resilience).toBe(0)
    expect(result.warmth).toBe('no-resilience')
    expect(result.hasHighResilience).toBe(false)
  })

  it('detects error handling', () => {
    expect(measureComforting(richContent).hasErrorHandled).toBe(true)
  })

  it('detects defensive code', () => {
    expect(measureComforting(richContent).hasDefensive).toBe(true)
  })

  it('detects graceful handling', () => {
    expect(measureComforting(richContent).hasGraceful).toBe(true)
  })

  it('detects recoverable code', () => {
    expect(measureComforting(richContent).hasRecoverable).toBe(true)
  })

  it('detects robust code', () => {
    expect(measureComforting(richContent).hasRobust).toBe(true)
  })

  it('detects tested code', () => {
    expect(measureComforting(richContent).hasTested).toBe(true)
  })

  it('detects caring code', () => {
    expect(measureComforting(richContent).hasCaring).toBe(true)
  })

  it('detects enduring code', () => {
    expect(measureComforting(richContent).hasEnduring).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureComforting(richContent)
    const empty = measureComforting(emptyContent)
    expect(rich.resilience).toBeGreaterThan(empty.resilience)
  })

  it('hasNoBareCrash is true without eval', () => {
    expect(measureComforting(richContent).hasNoBareCrash).toBe(true)
  })

  it('hasNoBareCrash is false with eval', () => {
    expect(measureComforting('eval("code")').hasNoBareCrash).toBe(false)
  })
})

// ─── measureGrounding ───────────────────────────────────

describe('measureGrounding', () => {
  it('returns zero for empty content', () => {
    const result = measureGrounding(emptyContent)
    expect(result.strength).toBe(0)
    expect(result.forge).toBe('no-strength')
    expect(result.hasHighStrength).toBe(false)
  })

  it('detects well-structured code', () => {
    expect(measureGrounding(richContent).hasWellStructured).toBe(true)
  })

  it('detects principled code', () => {
    expect(measureGrounding(richContent).hasPrincipled).toBe(true)
  })

  it('detects patterned code', () => {
    expect(measureGrounding(richContent).hasPatterned).toBe(true)
  })

  it('detects deep code', () => {
    expect(measureGrounding(richContent).hasDeep).toBe(true)
  })

  it('detects foundational code', () => {
    expect(measureGrounding(richContent).hasFoundational).toBe(true)
  })

  it('detects solid code', () => {
    expect(measureGrounding(richContent).hasSolid).toBe(true)
  })

  it('detects proven code', () => {
    expect(measureGrounding(richContent).hasProven).toBe(true)
  })

  it('detects enduring code', () => {
    expect(measureGrounding(richContent).hasEnduring).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureGrounding(richContent)
    const empty = measureGrounding(emptyContent)
    expect(rich.strength).toBeGreaterThan(empty.strength)
  })

  it('hasNoChaotic is true without var', () => {
    expect(measureGrounding(richContent).hasNoChaotic).toBe(true)
  })

  it('hasNoAdHoc is true without any', () => {
    expect(measureGrounding(richContent).hasNoAdHoc).toBe(true)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies copper-masterpiece', () => expect(classifyCondition(95)).toBe('copper-masterpiece'))
  it('classifies rose-gold-dawn', () => expect(classifyCondition(78)).toBe('rose-gold-dawn'))
  it('classifies proper-metal', () => expect(classifyCondition(65)).toBe('proper-metal'))
  it('classifies tarnished-bronze', () => expect(classifyCondition(45)).toBe('tarnished-bronze'))
  it('classifies rusted-iron', () => expect(classifyCondition(25)).toBe('rusted-iron'))
  it('classifies void', () => expect(classifyCondition(10)).toBe('void'))
})

describe('classifyHearthType', () => {
  it('returns no-hearth for empty', () => expect(classifyHearthType([])).toBe('no-hearth'))
  it('classifies ancient-forge', () => {
    expect(classifyHearthType([{ qualityScore: 95 } as CopperRay])).toBe('ancient-forge')
  })
  it('classifies copper-hearth', () => {
    expect(classifyHearthType([{ qualityScore: 78 } as CopperRay])).toBe('copper-hearth')
  })
  it('classifies proper-fire', () => {
    expect(classifyHearthType([{ qualityScore: 65 } as CopperRay])).toBe('proper-fire')
  })
  it('classifies small-flame', () => {
    expect(classifyHearthType([{ qualityScore: 45 } as CopperRay])).toBe('small-flame')
  })
})

describe('classifyHearthCondition', () => {
  it('classifies copper-temple', () => expect(classifyHearthCondition(90)).toBe('copper-temple'))
  it('classifies warm-forge', () => expect(classifyHearthCondition(72)).toBe('warm-forge'))
  it('classifies proper-hearth', () => expect(classifyHearthCondition(58)).toBe('proper-hearth'))
  it('classifies dying-ember', () => expect(classifyHearthCondition(40)).toBe('dying-ember'))
  it('classifies cold-ash', () => expect(classifyHearthCondition(20)).toBe('cold-ash'))
  it('classifies void', () => expect(classifyHearthCondition(10)).toBe('void'))
})

describe('classifySmithGrade', () => {
  it('classifies copper-sage', () => expect(classifySmithGrade(85)).toBe('copper-sage'))
  it('classifies dawn-smith', () => expect(classifySmithGrade(70)).toBe('dawn-smith'))
  it('classifies wire-master', () => expect(classifySmithGrade(55)).toBe('wire-master'))
  it('classifies apprentice', () => expect(classifySmithGrade(40)).toBe('apprentice'))
  it('classifies novice', () => expect(classifySmithGrade(25)).toBe('novice'))
  it('classifies cold-hands', () => expect(classifySmithGrade(10)).toBe('cold-hands'))
})

// ─── analyzeCopperRay ───────────────────────────────────

describe('analyzeCopperRay', () => {
  it('returns valid structure for empty content', () => {
    const ray = analyzeCopperRay(emptyContent, 'empty.ts')
    expect(ray.file).toBe('empty.ts')
    expect(ray.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('returns valid structure for rich content', () => {
    const ray = analyzeCopperRay(richContent, 'rich.ts')
    expect(ray.file).toBe('rich.ts')
    expect(ray.qualityScore).toBeGreaterThan(0)
    expect(ray.patinaWisdom).toBeGreaterThan(0)
    expect(ray.dawnClarity).toBeGreaterThan(0)
    expect(ray.conductivityQuality).toBeGreaterThan(0)
    expect(ray.warmthResilience).toBeGreaterThan(0)
    expect(ray.forgeStrength).toBeGreaterThan(0)
  })

  it('qualityScore is average of 5 measures', () => {
    const ray = analyzeCopperRay(richContent, 'test.ts')
    const expected = Math.round(
      ray.patinaWisdom * 0.2 +
      ray.dawnClarity * 0.2 +
      ray.conductivityQuality * 0.2 +
      ray.warmthResilience * 0.2 +
      ray.forgeStrength * 0.2,
    )
    expect(ray.qualityScore).toBe(expected)
  })

  it('contains all nested measures', () => {
    const ray = analyzeCopperRay(richContent, 'test.ts')
    expect(ray.aging).toBeDefined()
    expect(ray.kindling).toBeDefined()
    expect(ray.connecting).toBeDefined()
    expect(ray.comforting).toBeDefined()
    expect(ray.grounding).toBeDefined()
  })

  it('scores rich content at max for aging', () => {
    expect(analyzeCopperRay(richContent, 'rich.ts').aging.wisdom).toBe(100)
  })

  it('scores rich content at max for kindling', () => {
    expect(analyzeCopperRay(richContent, 'rich.ts').kindling.clarity).toBe(100)
  })

  it('scores rich content at max for connecting', () => {
    expect(analyzeCopperRay(richContent, 'rich.ts').connecting.conductivity).toBe(100)
  })

  it('scores rich content at max for comforting', () => {
    expect(analyzeCopperRay(richContent, 'rich.ts').comforting.resilience).toBe(100)
  })

  it('scores rich content at max for grounding', () => {
    expect(analyzeCopperRay(richContent, 'rich.ts').grounding.strength).toBe(100)
  })

  it('rich content yields copper-masterpiece', () => {
    expect(analyzeCopperRay(richContent, 'rich.ts').condition).toBe('copper-masterpiece')
  })
})

// ─── analyzeCopperHearth ────────────────────────────────

describe('analyzeCopperHearth', () => {
  it('returns empty hearth for no rays', () => {
    const hearth = analyzeCopperHearth([], 'src')
    expect(hearth.directory).toBe('src')
    expect(hearth.rays).toEqual([])
    expect(hearth.avgWisdom).toBe(0)
    expect(hearth.hearthType).toBe('no-hearth')
    expect(hearth.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const rays = [
      analyzeCopperRay(richContent, 'src/a.ts'),
      analyzeCopperRay(richContent, 'src/b.ts'),
    ]
    const hearth = analyzeCopperHearth(rays, 'src')
    expect(hearth.avgWisdom).toBeGreaterThan(0)
    expect(hearth.avgConductivity).toBeGreaterThan(0)
    expect(hearth.avgStrength).toBeGreaterThan(0)
  })
})

// ─── buildCopperMorningResult ───────────────────────────

describe('buildCopperMorningResult', () => {
  it('returns valid result for empty input', async () => {
    const result = await buildCopperMorningResult([], [])
    expect(result.rays).toEqual([])
    expect(result.hearths).toEqual([])
    expect(result.morning.overallWarmth).toBe(0)
    expect(result.morning.isCopper).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns valid result for rich content', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [richContent])
    expect(result.rays.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgPatinaWisdom).toBeGreaterThan(0)
  })

  it('groups files by directory into hearths', async () => {
    const result = await buildCopperMorningResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.rays.length).toBe(3)
    expect(result.hearths.length).toBe(2)
  })

  it('morning.isCopper is true when warmth >= 60', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [richContent])
    expect(result.morning.isCopper).toBe(true)
  })

  it('computes stats correctly for multiple files', async () => {
    const result = await buildCopperMorningResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.bestRay).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostConnected).toBeTruthy()
    expect(result.stats.warmest).toBeTruthy()
    expect(result.stats.strongest).toBeTruthy()
  })

  it('counts condition categories', async () => {
    const result = await buildCopperMorningResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, minimalContent, emptyContent],
    )
    const total =
      result.stats.copperMasterpieceCount +
      result.stats.roseGoldDawnCount +
      result.stats.properMetalCount +
      result.stats.tarnishedBronzeCount +
      result.stats.rustedIronCount +
      result.stats.voidCount
    expect(total).toBe(3)
  })

  it('sets smithGrade correctly', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [richContent])
    expect(result.stats.smithGrade).toBeDefined()
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message for all-90 scores', () => {
    const rays = [analyzeCopperRay(richContent, 'a.ts')]
    const stats: CopperMorningStats = {
      totalFiles: 1, totalHearths: 0,
      avgPatinaWisdom: 95, avgDawnClarity: 95, avgConductivityQuality: 95,
      avgWarmthResilience: 95, avgForgeStrength: 95,
      copperMasterpieceCount: 1, roseGoldDawnCount: 0, properMetalCount: 0,
      tarnishedBronzeCount: 0, rustedIronCount: 0, voidCount: 0,
      hasHighWisdomCount: 1, hasHighClarityCount: 1, hasHighConductivityCount: 1,
      hasHighResilienceCount: 1, hasHighStrengthCount: 1,
      overallWarmth: 95, smithGrade: 'copper-sage',
      bestRay: 'a.ts', wisest: 'a.ts', clearest: 'a.ts',
      mostConnected: 'a.ts', warmest: 'a.ts', strongest: 'a.ts',
    }
    const morning = { avgWisdom: 95, avgConductivity: 95, avgStrength: 95, isCopper: true, overallWarmth: 95 }
    const recs = generateRecommendations(rays, [], morning, stats)
    expect(recs.length).toBe(1)
    expect(recs[0]).toContain('masterwork')
  })

  it('recommends improving wisdom when low', () => {
    const emptyRay = analyzeCopperRay(emptyContent, 'a.ts')
    const stats: CopperMorningStats = {
      totalFiles: 1, totalHearths: 0,
      avgPatinaWisdom: 10, avgDawnClarity: 70, avgConductivityQuality: 70,
      avgWarmthResilience: 70, avgForgeStrength: 70,
      copperMasterpieceCount: 0, roseGoldDawnCount: 0, properMetalCount: 0,
      tarnishedBronzeCount: 0, rustedIronCount: 0, voidCount: 1,
      hasHighWisdomCount: 0, hasHighClarityCount: 1, hasHighConductivityCount: 1,
      hasHighResilienceCount: 1, hasHighStrengthCount: 1,
      overallWarmth: 58, smithGrade: 'wire-master',
      bestRay: 'a.ts', wisest: 'a.ts', clearest: 'a.ts',
      mostConnected: 'a.ts', warmest: 'a.ts', strongest: 'a.ts',
    }
    const morning = { avgWisdom: 10, avgConductivity: 70, avgStrength: 70, isCopper: false, overallWarmth: 58 }
    const recs = generateRecommendations([emptyRay], [], morning, stats)
    expect(recs.some((r) => r.includes('patina wisdom'))).toBe(true)
  })

  it('warns about many void rays', () => {
    const rays = Array.from({ length: 6 }, () => analyzeCopperRay(emptyContent, 'void.ts'))
    const stats: CopperMorningStats = {
      totalFiles: 6, totalHearths: 0,
      avgPatinaWisdom: 0, avgDawnClarity: 0, avgConductivityQuality: 0,
      avgWarmthResilience: 0, avgForgeStrength: 0,
      copperMasterpieceCount: 0, roseGoldDawnCount: 0, properMetalCount: 0,
      tarnishedBronzeCount: 0, rustedIronCount: 0, voidCount: 6,
      hasHighWisdomCount: 0, hasHighClarityCount: 0, hasHighConductivityCount: 0,
      hasHighResilienceCount: 0, hasHighStrengthCount: 0,
      overallWarmth: 0, smithGrade: 'cold-hands',
      bestRay: 'void.ts', wisest: 'void.ts', clearest: 'void.ts',
      mostConnected: 'void.ts', warmest: 'void.ts', strongest: 'void.ts',
    }
    const morning = { avgWisdom: 0, avgConductivity: 0, avgStrength: 0, isCopper: false, overallWarmth: 0 }
    const recs = generateRecommendations(rays, [], morning, stats)
    expect(recs.some((r) => r.includes('cold rays'))).toBe(true)
  })

  it('recommends improving clarity when low', () => {
    const stats: CopperMorningStats = {
      totalFiles: 1, totalHearths: 0,
      avgPatinaWisdom: 70, avgDawnClarity: 10, avgConductivityQuality: 70,
      avgWarmthResilience: 70, avgForgeStrength: 70,
      copperMasterpieceCount: 0, roseGoldDawnCount: 0, properMetalCount: 0,
      tarnishedBronzeCount: 0, rustedIronCount: 0, voidCount: 1,
      hasHighWisdomCount: 1, hasHighClarityCount: 0, hasHighConductivityCount: 1,
      hasHighResilienceCount: 1, hasHighStrengthCount: 1,
      overallWarmth: 58, smithGrade: 'wire-master',
      bestRay: 'a.ts', wisest: 'a.ts', clearest: 'a.ts',
      mostConnected: 'a.ts', warmest: 'a.ts', strongest: 'a.ts',
    }
    const morning = { avgWisdom: 70, avgConductivity: 70, avgStrength: 70, isCopper: false, overallWarmth: 58 }
    const recs = generateRecommendations([], [], morning, stats)
    expect(recs.some((r) => r.includes('dawn clarity'))).toBe(true)
  })

  it('recommends improving conductivity when low', () => {
    const stats: CopperMorningStats = {
      totalFiles: 1, totalHearths: 0,
      avgPatinaWisdom: 70, avgDawnClarity: 70, avgConductivityQuality: 10,
      avgWarmthResilience: 70, avgForgeStrength: 70,
      copperMasterpieceCount: 0, roseGoldDawnCount: 0, properMetalCount: 0,
      tarnishedBronzeCount: 0, rustedIronCount: 0, voidCount: 1,
      hasHighWisdomCount: 1, hasHighClarityCount: 1, hasHighConductivityCount: 0,
      hasHighResilienceCount: 1, hasHighStrengthCount: 1,
      overallWarmth: 58, smithGrade: 'wire-master',
      bestRay: 'a.ts', wisest: 'a.ts', clearest: 'a.ts',
      mostConnected: 'a.ts', warmest: 'a.ts', strongest: 'a.ts',
    }
    const morning = { avgWisdom: 70, avgConductivity: 10, avgStrength: 70, isCopper: false, overallWarmth: 58 }
    const recs = generateRecommendations([], [], morning, stats)
    expect(recs.some((r) => r.includes('conductivity'))).toBe(true)
  })

  it('recommends improving resilience when low', () => {
    const stats: CopperMorningStats = {
      totalFiles: 1, totalHearths: 0,
      avgPatinaWisdom: 70, avgDawnClarity: 70, avgConductivityQuality: 70,
      avgWarmthResilience: 10, avgForgeStrength: 70,
      copperMasterpieceCount: 0, roseGoldDawnCount: 0, properMetalCount: 0,
      tarnishedBronzeCount: 0, rustedIronCount: 0, voidCount: 1,
      hasHighWisdomCount: 1, hasHighClarityCount: 1, hasHighConductivityCount: 1,
      hasHighResilienceCount: 0, hasHighStrengthCount: 1,
      overallWarmth: 58, smithGrade: 'wire-master',
      bestRay: 'a.ts', wisest: 'a.ts', clearest: 'a.ts',
      mostConnected: 'a.ts', warmest: 'a.ts', strongest: 'a.ts',
    }
    const morning = { avgWisdom: 70, avgConductivity: 70, avgStrength: 70, isCopper: false, overallWarmth: 58 }
    const recs = generateRecommendations([], [], morning, stats)
    expect(recs.some((r) => r.includes('warmth resilience'))).toBe(true)
  })

  it('recommends improving strength when low', () => {
    const stats: CopperMorningStats = {
      totalFiles: 1, totalHearths: 0,
      avgPatinaWisdom: 70, avgDawnClarity: 70, avgConductivityQuality: 70,
      avgWarmthResilience: 70, avgForgeStrength: 10,
      copperMasterpieceCount: 0, roseGoldDawnCount: 0, properMetalCount: 0,
      tarnishedBronzeCount: 0, rustedIronCount: 0, voidCount: 1,
      hasHighWisdomCount: 1, hasHighClarityCount: 1, hasHighConductivityCount: 1,
      hasHighResilienceCount: 1, hasHighStrengthCount: 0,
      overallWarmth: 58, smithGrade: 'wire-master',
      bestRay: 'a.ts', wisest: 'a.ts', clearest: 'a.ts',
      mostConnected: 'a.ts', warmest: 'a.ts', strongest: 'a.ts',
    }
    const morning = { avgWisdom: 70, avgConductivity: 70, avgStrength: 10, isCopper: false, overallWarmth: 58 }
    const recs = generateRecommendations([], [], morning, stats)
    expect(recs.some((r) => r.includes('forge'))).toBe(true)
  })

  it('warns about all poor hearths', () => {
    const emptyRay = analyzeCopperRay(emptyContent, 'a.ts')
    const hearth: CopperHearth = {
      directory: 'src', rays: [emptyRay], avgWisdom: 0, avgConductivity: 0,
      avgStrength: 0, copperMasterpieceCount: 0, voidCount: 1,
      hearthType: 'no-hearth', condition: 'void',
    }
    const stats: CopperMorningStats = {
      totalFiles: 1, totalHearths: 1,
      avgPatinaWisdom: 0, avgDawnClarity: 0, avgConductivityQuality: 0,
      avgWarmthResilience: 0, avgForgeStrength: 0,
      copperMasterpieceCount: 0, roseGoldDawnCount: 0, properMetalCount: 0,
      tarnishedBronzeCount: 0, rustedIronCount: 0, voidCount: 1,
      hasHighWisdomCount: 0, hasHighClarityCount: 0, hasHighConductivityCount: 0,
      hasHighResilienceCount: 0, hasHighStrengthCount: 0,
      overallWarmth: 0, smithGrade: 'cold-hands',
      bestRay: 'a.ts', wisest: 'a.ts', clearest: 'a.ts',
      mostConnected: 'a.ts', warmest: 'a.ts', strongest: 'a.ts',
    }
    const morning = { avgWisdom: 0, avgConductivity: 0, avgStrength: 0, isCopper: false, overallWarmth: 0 }
    const recs = generateRecommendations([emptyRay], [hearth], morning, stats)
    expect(recs.some((r) => r.includes('reignition'))).toBe(true)
  })

  it('lists specific void rays when <= 5', () => {
    const rays = Array.from({ length: 3 }, (_, i) => analyzeCopperRay(emptyContent, `void${i}.ts`))
    const stats: CopperMorningStats = {
      totalFiles: 3, totalHearths: 0,
      avgPatinaWisdom: 0, avgDawnClarity: 0, avgConductivityQuality: 0,
      avgWarmthResilience: 0, avgForgeStrength: 0,
      copperMasterpieceCount: 0, roseGoldDawnCount: 0, properMetalCount: 0,
      tarnishedBronzeCount: 0, rustedIronCount: 0, voidCount: 3,
      hasHighWisdomCount: 0, hasHighClarityCount: 0, hasHighConductivityCount: 0,
      hasHighResilienceCount: 0, hasHighStrengthCount: 0,
      overallWarmth: 0, smithGrade: 'cold-hands',
      bestRay: 'void0.ts', wisest: 'void0.ts', clearest: 'void0.ts',
      mostConnected: 'void0.ts', warmest: 'void0.ts', strongest: 'void0.ts',
    }
    const morning = { avgWisdom: 0, avgConductivity: 0, avgStrength: 0, isCopper: false, overallWarmth: 0 }
    const recs = generateRecommendations(rays, [], morning, stats)
    expect(recs.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('returns default message for moderate scores', () => {
    const stats: CopperMorningStats = {
      totalFiles: 1, totalHearths: 0,
      avgPatinaWisdom: 70, avgDawnClarity: 70, avgConductivityQuality: 70,
      avgWarmthResilience: 70, avgForgeStrength: 70,
      copperMasterpieceCount: 0, roseGoldDawnCount: 0, properMetalCount: 0,
      tarnishedBronzeCount: 0, rustedIronCount: 0, voidCount: 0,
      hasHighWisdomCount: 1, hasHighClarityCount: 1, hasHighConductivityCount: 1,
      hasHighResilienceCount: 1, hasHighStrengthCount: 1,
      overallWarmth: 70, smithGrade: 'dawn-smith',
      bestRay: 'a.ts', wisest: 'a.ts', clearest: 'a.ts',
      mostConnected: 'a.ts', warmest: 'a.ts', strongest: 'a.ts',
    }
    const morning = { avgWisdom: 70, avgConductivity: 70, avgStrength: 70, isCopper: true, overallWarmth: 70 }
    const recs = generateRecommendations([], [], morning, stats)
    expect(recs.some((r) => r.includes('copper perfection'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for each range', () => {
    expect(typeof colorScore(95)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorCondition('copper-masterpiece')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
  })
})

describe('colorHearthCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorHearthCondition('copper-temple')).toBe('string')
    expect(typeof colorHearthCondition('void')).toBe('string')
  })
})

describe('formatRayTable', () => {
  it('formats a single ray', () => {
    const ray = analyzeCopperRay(richContent, 'test.ts')
    const output = formatRayTable(ray)
    expect(output).toContain('Copper Ray: test.ts')
    expect(output).toContain('Patina Wisdom')
  })
})

describe('formatRaysTable', () => {
  it('returns message for empty', () => {
    expect(formatRaysTable([])).toContain('No copper rays found')
  })

  it('formats multiple rays', () => {
    const rays = [analyzeCopperRay(richContent, 'a.ts'), analyzeCopperRay(minimalContent, 'b.ts')]
    const output = formatRaysTable(rays)
    expect(output).toContain('Copper Rays')
    expect(output).toContain('a.ts')
  })
})

describe('formatHearthTable', () => {
  it('formats a hearth', () => {
    const rays = [analyzeCopperRay(richContent, 'src/a.ts')]
    const hearth = analyzeCopperHearth(rays, 'src')
    expect(formatHearthTable(hearth)).toContain('Copper Hearth: src')
  })
})

describe('formatHearthsTable', () => {
  it('returns message for empty', () => {
    expect(formatHearthsTable([])).toContain('No copper hearths found')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Copper Morning Statistics')
    expect(output).toContain('Smith Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    expect(formatRecommendations(['Fix X'])).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Copper Morning Analysis')
    expect(output).toContain('Morning Overview')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.rays).toBeDefined()
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
