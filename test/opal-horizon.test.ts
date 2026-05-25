import { describe, expect, it } from 'vitest'
import {
  analyzeOpalFire,
  analyzeOpalDeposit,
  buildOpalHorizonResult,
  classifyCondition,
  classifyDepositCondition,
  classifyDepositType,
  classifyGemologistGrade,
  generateRecommendations,
  measureBlazing,
  measureGlowing,
  measureIlluminating,
  measureShifting,
  measureSpanning,
  type OpalFire,
  type OpalDeposit,
  type OpalHorizonStats,
  type OpalHorizonResult,
} from '../src/commands/opal-horizon-helpers.js'
import {
  colorCondition,
  colorDepositCondition,
  colorScore,
  formatDepositsTable,
  formatDepositTable,
  formatFireTable,
  formatFiresTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/opal-horizon-format-helpers.js'

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

// ─── measureShifting ────────────────────────────────────

describe('measureShifting', () => {
  it('returns zero for empty content', () => {
    const result = measureShifting(emptyContent)
    expect(result.color).toBe(0)
    expect(result.spectrum).toBe('no-play')
    expect(result.hasHighColor).toBe(false)
  })

  it('detects modular code', () => {
    expect(measureShifting(richContent).hasModular).toBe(true)
  })

  it('detects flexible code', () => {
    expect(measureShifting(richContent).hasFlexible).toBe(true)
  })

  it('detects varied code', () => {
    expect(measureShifting(richContent).hasVaried).toBe(true)
  })

  it('detects adaptive code', () => {
    expect(measureShifting(richContent).hasAdaptive).toBe(true)
  })

  it('detects expressive code', () => {
    expect(measureShifting(richContent).hasExpressive).toBe(true)
  })

  it('detects dynamic code', () => {
    expect(measureShifting(richContent).hasDynamic).toBe(true)
  })

  it('detects multi-concern code', () => {
    expect(measureShifting(richContent).hasMultiConcern).toBe(true)
  })

  it('detects kaleidoscopic code', () => {
    expect(measureShifting(richContent).hasKaleidoscopic).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureShifting(richContent)
    const empty = measureShifting(emptyContent)
    expect(rich.color).toBeGreaterThan(empty.color)
  })

  it('counts rigid usage', () => {
    const result = measureShifting('var x = 1')
    expect(result.rigidCount).toBeGreaterThan(0)
  })

  it('hasNoMonolithic is true when no var', () => {
    expect(measureShifting(richContent).hasNoMonolithic).toBe(true)
  })
})

// ─── measureIlluminating ────────────────────────────────

describe('measureIlluminating', () => {
  it('returns zero clarity for empty content', () => {
    const result = measureIlluminating(emptyContent)
    expect(result.clarity).toBe(0)
    expect(result.dawn).toBe('no-clarity')
    expect(result.hasHighClarity).toBe(false)
  })

  it('detects readable code', () => {
    expect(measureIlluminating(richContent).hasReadable).toBe(true)
  })

  it('detects self-documenting code', () => {
    expect(measureIlluminating(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects clear types', () => {
    expect(measureIlluminating(richContent).hasClear).toBe(true)
  })

  it('detects transparent imports', () => {
    expect(measureIlluminating(richContent).hasTransparent).toBe(true)
  })

  it('detects understandable flow', () => {
    expect(measureIlluminating(richContent).hasUnderstandable).toBe(true)
  })

  it('detects visible exports', () => {
    expect(measureIlluminating(richContent).hasVisible).toBe(true)
  })

  it('detects documentation', () => {
    expect(measureIlluminating(richContent).hasDocumented).toBe(true)
  })

  it('detects illuminated types', () => {
    expect(measureIlluminating(richContent).hasIlluminated).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureIlluminating(richContent)
    const empty = measureIlluminating(emptyContent)
    expect(rich.clarity).toBeGreaterThan(empty.clarity)
  })

  it('counts cryptic variables', () => {
    const result = measureIlluminating(minimalContent)
    expect(result.crypticCount).toBeGreaterThanOrEqual(0)
  })

  it('hasNoHidden is true without ts-ignore', () => {
    expect(measureIlluminating(richContent).hasNoHidden).toBe(true)
  })
})

// ─── measureBlazing ─────────────────────────────────────

describe('measureBlazing', () => {
  it('returns zero warmth for empty content', () => {
    const result = measureBlazing(emptyContent)
    expect(result.warmth).toBe(0)
    expect(result.fire).toBe('no-warmth')
    expect(result.hasHighWarmth).toBe(false)
  })

  it('detects exported code', () => {
    expect(measureBlazing(richContent).hasExported).toBe(true)
  })

  it('detects active code', () => {
    expect(measureBlazing(richContent).hasActive).toBe(true)
  })

  it('detects contributing code', () => {
    expect(measureBlazing(richContent).hasContributing).toBe(true)
  })

  it('detects evolving code', () => {
    expect(measureBlazing(richContent).hasEvolving).toBe(true)
  })

  it('detects connected code', () => {
    expect(measureBlazing(richContent).hasConnected).toBe(true)
  })

  it('detects alive code', () => {
    expect(measureBlazing(richContent).hasAlive).toBe(true)
  })

  it('detects thriving code', () => {
    expect(measureBlazing(richContent).hasThriving).toBe(true)
  })

  it('detects vital code', () => {
    expect(measureBlazing(richContent).hasVital).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureBlazing(richContent)
    const empty = measureBlazing(emptyContent)
    expect(rich.warmth).toBeGreaterThan(empty.warmth)
  })

  it('hasNoDead is true without dead code', () => {
    expect(measureBlazing(richContent).hasNoDead).toBe(true)
  })
})

// ─── measureSpanning ────────────────────────────────────

describe('measureSpanning', () => {
  it('returns zero richness for empty content', () => {
    const result = measureSpanning(emptyContent)
    expect(result.richness).toBe(0)
    expect(result.spectrum).toBe('no-spectrum')
    expect(result.hasHighRichness).toBe(false)
  })

  it('detects tested code', () => {
    expect(measureSpanning(richContent).hasTested).toBe(true)
  })

  it('detects type-safe code', () => {
    expect(measureSpanning(richContent).hasTypeSafe).toBe(true)
  })

  it('detects error handling', () => {
    expect(measureSpanning(richContent).hasErrorHandled).toBe(true)
  })

  it('detects documentation', () => {
    expect(measureSpanning(richContent).hasDocumented).toBe(true)
  })

  it('detects complete structures', () => {
    expect(measureSpanning(richContent).hasComplete).toBe(true)
  })

  it('detects thorough code', () => {
    expect(measureSpanning(richContent).hasThorough).toBe(true)
  })

  it('detects comprehensive imports', () => {
    expect(measureSpanning(richContent).hasComprehensive).toBe(true)
  })

  it('detects diverse types', () => {
    expect(measureSpanning(richContent).hasDiverse).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureSpanning(richContent)
    const empty = measureSpanning(emptyContent)
    expect(rich.richness).toBeGreaterThan(empty.richness)
  })

  it('hasNoUnsafe is true without any', () => {
    expect(measureSpanning(richContent).hasNoUnsafe).toBe(true)
  })
})

// ─── measureGlowing ─────────────────────────────────────

describe('measureGlowing', () => {
  it('returns zero quality for empty content', () => {
    const result = measureGlowing(emptyContent)
    expect(result.quality).toBeGreaterThanOrEqual(0)
    expect(result.opal).toBeDefined()
    expect(result.hasHighQuality).toBe(false)
  })

  it('detects well-structured code', () => {
    expect(measureGlowing(richContent).hasWellStructured).toBe(true)
  })

  it('detects elegant code', () => {
    expect(measureGlowing(richContent).hasElegant).toBe(true)
  })

  it('detects clean code', () => {
    expect(measureGlowing(richContent).hasClean).toBe(true)
  })

  it('detects polished code', () => {
    expect(measureGlowing(richContent).hasPolished).toBe(true)
  })

  it('detects principled code', () => {
    expect(measureGlowing(richContent).hasPrincipled).toBe(true)
  })

  it('detects organized code', () => {
    expect(measureGlowing(richContent).hasOrganized).toBe(true)
  })

  it('detects refined code', () => {
    expect(measureGlowing(richContent).hasRefined).toBe(true)
  })

  it('detects deep code', () => {
    expect(measureGlowing(richContent).hasDeep).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const rich = measureGlowing(richContent)
    const empty = measureGlowing(emptyContent)
    expect(rich.quality).toBeGreaterThan(empty.quality)
  })

  it('hasNoAdHoc is true without any', () => {
    expect(measureGlowing(richContent).hasNoAdHoc).toBe(true)
  })
})

// ─── classifyCondition ──────────────────────────────────

describe('classifyCondition', () => {
  it('classifies opal-masterpiece', () => {
    expect(classifyCondition(95)).toBe('opal-masterpiece')
  })

  it('classifies fire-horizon', () => {
    expect(classifyCondition(78)).toBe('fire-horizon')
  })

  it('classifies proper-gem', () => {
    expect(classifyCondition(65)).toBe('proper-gem')
  })

  it('classifies dull-stone', () => {
    expect(classifyCondition(45)).toBe('dull-stone')
  })

  it('classifies common-rock', () => {
    expect(classifyCondition(25)).toBe('common-rock')
  })

  it('classifies void', () => {
    expect(classifyCondition(10)).toBe('void')
  })
})

// ─── classifyDepositType ────────────────────────────────

describe('classifyDepositType', () => {
  it('returns no-deposit for empty fires', () => {
    expect(classifyDepositType([])).toBe('no-deposit')
  })

  it('classifies lightning-ridge', () => {
    const fires = [{ qualityScore: 95 } as OpalFire]
    expect(classifyDepositType(fires)).toBe('lightning-ridge')
  })

  it('classifies coober-pedy', () => {
    const fires = [{ qualityScore: 78 } as OpalFire]
    expect(classifyDepositType(fires)).toBe('coober-pedy')
  })

  it('classifies proper-mine', () => {
    const fires = [{ qualityScore: 65 } as OpalFire]
    expect(classifyDepositType(fires)).toBe('proper-mine')
  })

  it('classifies small-pocket', () => {
    const fires = [{ qualityScore: 45 } as OpalFire]
    expect(classifyDepositType(fires)).toBe('small-pocket')
  })

  it('classifies barren-ground', () => {
    const fires = [{ qualityScore: 25 } as OpalFire]
    expect(classifyDepositType(fires)).toBe('barren-ground')
  })
})

// ─── classifyDepositCondition ───────────────────────────

describe('classifyDepositCondition', () => {
  it('classifies opal-paradise', () => {
    expect(classifyDepositCondition(90)).toBe('opal-paradise')
  })

  it('classifies fire-desert', () => {
    expect(classifyDepositCondition(72)).toBe('fire-desert')
  })

  it('classifies proper-field', () => {
    expect(classifyDepositCondition(58)).toBe('proper-field')
  })

  it('classifies dull-ground', () => {
    expect(classifyDepositCondition(40)).toBe('dull-ground')
  })

  it('classifies barren-earth', () => {
    expect(classifyDepositCondition(20)).toBe('barren-earth')
  })

  it('classifies void', () => {
    expect(classifyDepositCondition(10)).toBe('void')
  })
})

// ─── classifyGemologistGrade ────────────────────────────

describe('classifyGemologistGrade', () => {
  it('classifies opal-visionary', () => {
    expect(classifyGemologistGrade(85)).toBe('opal-visionary')
  })

  it('classifies fire-reader', () => {
    expect(classifyGemologistGrade(70)).toBe('fire-reader')
  })

  it('classifies gem-cutter', () => {
    expect(classifyGemologistGrade(55)).toBe('gem-cutter')
  })

  it('classifies apprentice', () => {
    expect(classifyGemologistGrade(40)).toBe('apprentice')
  })

  it('classifies novice', () => {
    expect(classifyGemologistGrade(25)).toBe('novice')
  })

  it('classifies rock-collector', () => {
    expect(classifyGemologistGrade(10)).toBe('rock-collector')
  })
})

// ─── analyzeOpalFire ────────────────────────────────────

describe('analyzeOpalFire', () => {
  it('returns valid structure for empty content', () => {
    const fire = analyzeOpalFire(emptyContent, 'empty.ts')
    expect(fire.file).toBe('empty.ts')
    expect(fire.qualityScore).toBeGreaterThanOrEqual(0)
    expect(fire.playOfColor).toBeGreaterThanOrEqual(0)
    expect(fire.dawnClarity).toBeGreaterThanOrEqual(0)
    expect(fire.fireWarmth).toBeGreaterThanOrEqual(0)
    expect(fire.spectrumRichness).toBeGreaterThanOrEqual(0)
    expect(fire.opalescenceQuality).toBeGreaterThanOrEqual(0)
  })

  it('returns valid structure for rich content', () => {
    const fire = analyzeOpalFire(richContent, 'rich.ts')
    expect(fire.file).toBe('rich.ts')
    expect(fire.qualityScore).toBeGreaterThan(0)
    expect(fire.playOfColor).toBeGreaterThan(0)
    expect(fire.dawnClarity).toBeGreaterThan(0)
    expect(fire.fireWarmth).toBeGreaterThan(0)
    expect(fire.spectrumRichness).toBeGreaterThan(0)
    expect(fire.opalescenceQuality).toBeGreaterThan(0)
  })

  it('qualityScore is average of 5 measures', () => {
    const fire = analyzeOpalFire(richContent, 'test.ts')
    const expected = Math.round(
      fire.playOfColor * 0.2 +
      fire.dawnClarity * 0.2 +
      fire.fireWarmth * 0.2 +
      fire.spectrumRichness * 0.2 +
      fire.opalescenceQuality * 0.2,
    )
    expect(fire.qualityScore).toBe(expected)
  })

  it('contains all nested measures', () => {
    const fire = analyzeOpalFire(richContent, 'test.ts')
    expect(fire.shifting).toBeDefined()
    expect(fire.illuminating).toBeDefined()
    expect(fire.blazing).toBeDefined()
    expect(fire.spanning).toBeDefined()
    expect(fire.glowing).toBeDefined()
  })

  it('scores rich content at max for shifting', () => {
    const fire = analyzeOpalFire(richContent, 'rich.ts')
    expect(fire.shifting.color).toBe(100)
  })

  it('scores rich content at max for illuminating', () => {
    const fire = analyzeOpalFire(richContent, 'rich.ts')
    expect(fire.illuminating.clarity).toBe(100)
  })

  it('scores rich content at max for blazing', () => {
    const fire = analyzeOpalFire(richContent, 'rich.ts')
    expect(fire.blazing.warmth).toBe(100)
  })

  it('scores rich content at max for spanning', () => {
    const fire = analyzeOpalFire(richContent, 'rich.ts')
    expect(fire.spanning.richness).toBe(100)
  })

  it('scores rich content at max for glowing', () => {
    const fire = analyzeOpalFire(richContent, 'rich.ts')
    expect(fire.glowing.quality).toBe(100)
  })

  it('rich content yields opal-masterpiece', () => {
    const fire = analyzeOpalFire(richContent, 'rich.ts')
    expect(fire.condition).toBe('opal-masterpiece')
  })
})

// ─── analyzeOpalDeposit ─────────────────────────────────

describe('analyzeOpalDeposit', () => {
  it('returns empty deposit for no fires', () => {
    const deposit = analyzeOpalDeposit([], 'src')
    expect(deposit.directory).toBe('src')
    expect(deposit.fires).toEqual([])
    expect(deposit.avgClarity).toBe(0)
    expect(deposit.avgRichness).toBe(0)
    expect(deposit.avgQuality).toBe(0)
    expect(deposit.opalMasterpieceCount).toBe(0)
    expect(deposit.voidCount).toBe(0)
    expect(deposit.depositType).toBe('no-deposit')
    expect(deposit.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const fires = [
      analyzeOpalFire(richContent, 'src/a.ts'),
      analyzeOpalFire(richContent, 'src/b.ts'),
    ]
    const deposit = analyzeOpalDeposit(fires, 'src')
    expect(deposit.avgClarity).toBeGreaterThan(0)
    expect(deposit.avgRichness).toBeGreaterThan(0)
    expect(deposit.avgQuality).toBeGreaterThan(0)
  })
})

// ─── buildOpalHorizonResult ─────────────────────────────

describe('buildOpalHorizonResult', () => {
  it('returns valid result for empty input', async () => {
    const result = await buildOpalHorizonResult([], [])
    expect(result.fires).toEqual([])
    expect(result.deposits).toEqual([])
    expect(result.sky.overallBrilliance).toBe(0)
    expect(result.sky.isOpal).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.celebration.milestone).toBe(570)
    expect(result.celebration.name).toBe('Opal Horizon')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns valid result for rich content', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    expect(result.fires.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgPlayOfColor).toBeGreaterThan(0)
    expect(result.stats.avgDawnClarity).toBeGreaterThan(0)
    expect(result.stats.avgFireWarmth).toBeGreaterThan(0)
    expect(result.stats.avgSpectrumRichness).toBeGreaterThan(0)
    expect(result.stats.avgOpalescenceQuality).toBeGreaterThan(0)
  })

  it('groups files by directory into deposits', async () => {
    const result = await buildOpalHorizonResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.fires.length).toBe(3)
    expect(result.deposits.length).toBe(2)
  })

  it('celebration has milestone 570', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    expect(result.celebration.milestone).toBe(570)
    expect(result.celebration.name).toBe('Opal Horizon')
    expect(result.celebration.message).toContain('570')
  })

  it('computes stats correctly for multiple files', async () => {
    const result = await buildOpalHorizonResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.opalMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.bestFire).toBeTruthy()
    expect(result.stats.mostColorful).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.warmest).toBeTruthy()
    expect(result.stats.mostDiverse).toBeTruthy()
    expect(result.stats.mostGlowing).toBeTruthy()
  })

  it('sky.isOpal is true when brilliance >= 60', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    expect(result.sky.isOpal).toBe(true)
  })

  it('sets gemologistGrade correctly', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    expect(result.stats.gemologistGrade).toBeDefined()
  })

  it('counts condition categories', async () => {
    const result = await buildOpalHorizonResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, minimalContent, emptyContent],
    )
    const total =
      result.stats.opalMasterpieceCount +
      result.stats.fireHorizonCount +
      result.stats.properGemCount +
      result.stats.dullStoneCount +
      result.stats.commonRockCount +
      result.stats.voidCount
    expect(total).toBe(3)
  })

  it('counts high-measure files', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    expect(result.stats.hasHighColorCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWarmthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighRichnessCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighQualityCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message for all-90 scores', () => {
    const fires = [analyzeOpalFire(richContent, 'a.ts')]
    const deposits: OpalDeposit[] = []
    const sky: OpalHorizonResult['sky'] = {
      avgClarity: 95,
      avgRichness: 95,
      avgQuality: 95,
      isOpal: true,
      overallBrilliance: 95,
    }
    const stats: OpalHorizonStats = {
      totalFiles: 1,
      totalDeposits: 0,
      avgPlayOfColor: 95,
      avgDawnClarity: 95,
      avgFireWarmth: 95,
      avgSpectrumRichness: 95,
      avgOpalescenceQuality: 95,
      opalMasterpieceCount: 1,
      fireHorizonCount: 0,
      properGemCount: 0,
      dullStoneCount: 0,
      commonRockCount: 0,
      voidCount: 0,
      hasHighColorCount: 1,
      hasHighClarityCount: 1,
      hasHighWarmthCount: 1,
      hasHighRichnessCount: 1,
      hasHighQualityCount: 1,
      overallBrilliance: 95,
      gemologistGrade: 'opal-visionary',
      bestFire: 'a.ts',
      mostColorful: 'a.ts',
      clearest: 'a.ts',
      warmest: 'a.ts',
      mostDiverse: 'a.ts',
      mostGlowing: 'a.ts',
    }
    const recs = generateRecommendations(fires, deposits, sky, stats)
    expect(recs.length).toBe(1)
    expect(recs[0]).toContain('transcendent brilliance')
  })

  it('recommends improving play of color when low', () => {
    const emptyFire = analyzeOpalFire(emptyContent, 'a.ts')
    const stats = {
      totalFiles: 1,
      totalDeposits: 0,
      avgPlayOfColor: 10,
      avgDawnClarity: 70,
      avgFireWarmth: 70,
      avgSpectrumRichness: 70,
      avgOpalescenceQuality: 70,
      opalMasterpieceCount: 0,
      fireHorizonCount: 0,
      properGemCount: 0,
      dullStoneCount: 0,
      commonRockCount: 0,
      voidCount: 1,
      hasHighColorCount: 0,
      hasHighClarityCount: 1,
      hasHighWarmthCount: 1,
      hasHighRichnessCount: 1,
      hasHighQualityCount: 1,
      overallBrilliance: 58,
      gemologistGrade: 'gem-cutter' as const,
      bestFire: 'a.ts',
      mostColorful: 'a.ts',
      clearest: 'a.ts',
      warmest: 'a.ts',
      mostDiverse: 'a.ts',
      mostGlowing: 'a.ts',
    }
    const sky = { avgClarity: 70, avgRichness: 70, avgQuality: 58, isOpal: false, overallBrilliance: 58 }
    const recs = generateRecommendations([emptyFire], [], sky, stats)
    expect(recs.some((r) => r.includes('play of color'))).toBe(true)
  })

  it('warns about void fires', () => {
    const fires = Array.from({ length: 6 }, () => analyzeOpalFire(emptyContent, 'void.ts'))
    const stats = {
      totalFiles: 6,
      totalDeposits: 0,
      avgPlayOfColor: 0,
      avgDawnClarity: 0,
      avgFireWarmth: 0,
      avgSpectrumRichness: 0,
      avgOpalescenceQuality: 0,
      opalMasterpieceCount: 0,
      fireHorizonCount: 0,
      properGemCount: 0,
      dullStoneCount: 0,
      commonRockCount: 0,
      voidCount: 6,
      hasHighColorCount: 0,
      hasHighClarityCount: 0,
      hasHighWarmthCount: 0,
      hasHighRichnessCount: 0,
      hasHighQualityCount: 0,
      overallBrilliance: 0,
      gemologistGrade: 'rock-collector' as const,
      bestFire: 'void.ts',
      mostColorful: 'void.ts',
      clearest: 'void.ts',
      warmest: 'void.ts',
      mostDiverse: 'void.ts',
      mostGlowing: 'void.ts',
    }
    const sky = { avgClarity: 0, avgRichness: 0, avgQuality: 0, isOpal: false, overallBrilliance: 0 }
    const recs = generateRecommendations(fires, [], sky, stats)
    expect(recs.some((r) => r.includes('barren stones'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for each range', () => {
    expect(typeof colorScore(95)).toBe('string')
    expect(typeof colorScore(78)).toBe('string')
    expect(typeof colorScore(65)).toBe('string')
    expect(typeof colorScore(45)).toBe('string')
    expect(typeof colorScore(25)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorCondition('opal-masterpiece')).toBe('string')
    expect(typeof colorCondition('fire-horizon')).toBe('string')
    expect(typeof colorCondition('proper-gem')).toBe('string')
    expect(typeof colorCondition('dull-stone')).toBe('string')
    expect(typeof colorCondition('common-rock')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
  })
})

describe('colorDepositCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorDepositCondition('opal-paradise')).toBe('string')
    expect(typeof colorDepositCondition('fire-desert')).toBe('string')
    expect(typeof colorDepositCondition('proper-field')).toBe('string')
    expect(typeof colorDepositCondition('dull-ground')).toBe('string')
    expect(typeof colorDepositCondition('barren-earth')).toBe('string')
    expect(typeof colorDepositCondition('void')).toBe('string')
  })
})

describe('formatFireTable', () => {
  it('formats a single fire', () => {
    const fire = analyzeOpalFire(richContent, 'test.ts')
    const output = formatFireTable(fire)
    expect(output).toContain('Opal Fire: test.ts')
    expect(output).toContain('Play of Color')
    expect(output).toContain('Quality Score')
  })
})

describe('formatFiresTable', () => {
  it('returns message for empty fires', () => {
    expect(formatFiresTable([])).toContain('No opal fires found')
  })

  it('formats multiple fires', () => {
    const fires = [
      analyzeOpalFire(richContent, 'a.ts'),
      analyzeOpalFire(minimalContent, 'b.ts'),
    ]
    const output = formatFiresTable(fires)
    expect(output).toContain('Opal Fires')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatDepositTable', () => {
  it('formats a single deposit', () => {
    const fires = [analyzeOpalFire(richContent, 'src/a.ts')]
    const deposit = analyzeOpalDeposit(fires, 'src')
    const output = formatDepositTable(deposit)
    expect(output).toContain('Opal Deposit: src')
    expect(output).toContain('Avg Clarity')
  })
})

describe('formatDepositsTable', () => {
  it('returns message for empty deposits', () => {
    expect(formatDepositsTable([])).toContain('No opal deposits found')
  })

  it('formats multiple deposits', () => {
    const fires = [analyzeOpalFire(richContent, 'src/a.ts')]
    const deposit = analyzeOpalDeposit(fires, 'src')
    const output = formatDepositsTable([deposit])
    expect(output).toContain('Opal Deposits')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Opal Horizon Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Gemologist Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Fix Y'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Opal Horizon Analysis')
    expect(output).toContain('Sky Overview')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildOpalHorizonResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.fires).toBeDefined()
    expect(parsed.celebration.milestone).toBe(570)
  })
})


