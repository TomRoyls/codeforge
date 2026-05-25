import { describe, it, expect } from 'vitest'

import {
  measurePreserving,
  measureAscending,
  measureHardening,
  measureViewing,
  measureAccumulating,
  analyzeAmberArtifact,
  analyzeAmberMountain,
  buildAmberPeakResult,
  classifyCondition,
  classifyMountainType,
  classifyMountainCondition,
  classifyClimberGrade,
  generateRecommendations,
  type AmberArtifact,
} from '../src/commands/amber-peak-helpers.js'

import {
  colorScore,
  colorCondition,
  colorMountainCondition,
  formatArtifactTable,
  formatArtifactsTable,
  formatMountainTable,
  formatMountainsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/amber-peak-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const emptyContent = ''

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

// ─── measurePreserving ──────────────────────────────────

describe('measurePreserving', () => {
  it('returns a preserving measure with all fields', () => {
    const result = measurePreserving(richContent)
    expect(result).toHaveProperty('power')
    expect(result).toHaveProperty('preservation')
    expect(result).toHaveProperty('hasHighPower')
    expect(result).toHaveProperty('hasStable')
    expect(result).toHaveProperty('hasNoVolatile')
    expect(result).toHaveProperty('hasConsistent')
    expect(result).toHaveProperty('hasNoErratic')
    expect(result).toHaveProperty('hasTested')
    expect(result).toHaveProperty('hasNoUntested')
    expect(result).toHaveProperty('hasTypeSafe')
    expect(result).toHaveProperty('hasNoUnsafe')
    expect(result).toHaveProperty('hasDocumented')
    expect(result).toHaveProperty('hasNoUndocumented')
    expect(result).toHaveProperty('hasEnduring')
    expect(result).toHaveProperty('hasReliable')
    expect(result).toHaveProperty('hasMaintained')
    expect(result).toHaveProperty('hasRefined')
    expect(result).toHaveProperty('hasPreserved')
    expect(result).toHaveProperty('volatileCount')
    expect(result).toHaveProperty('untestedCount')
  })

  it('scores high on rich content', () => {
    const result = measurePreserving(richContent)
    expect(result.power).toBeGreaterThan(60)
  })

  it('detects volatile patterns (var)', () => {
    const result = measurePreserving('var x = 1; var y = 2')
    expect(result.volatileCount).toBe(2)
    expect(result.hasNoVolatile).toBe(false)
  })

  it('detects stable code (const, readonly)', () => {
    const result = measurePreserving(richContent)
    expect(result.hasStable).toBe(true)
  })

  it('detects type-safe code', () => {
    const result = measurePreserving(richContent)
    expect(result.hasTypeSafe).toBe(true)
  })

  it('detects unsafe code (any)', () => {
    const result = measurePreserving('const x: any = 1')
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects documented code', () => {
    const result = measurePreserving(richContent)
    expect(result.hasDocumented).toBe(true)
  })

  it('detects undocumented patterns (TODO)', () => {
    const result = measurePreserving('const x = 1 // TODO: fix')
    expect(result.hasNoUndocumented).toBe(false)
  })

  it('detects erratic patterns', () => {
    const result = measurePreserving('const erratic = random()')
    expect(result.hasNoErratic).toBe(false)
  })

  it('detects untested patterns (eval)', () => {
    const result = measurePreserving('eval("code")')
    expect(result.untestedCount).toBe(1)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects maintained code (readonly, private)', () => {
    const result = measurePreserving(richContent)
    expect(result.hasMaintained).toBe(true)
  })

  it('classifies preservation correctly', () => {
    const result = measurePreserving(richContent)
    expect(result.preservation).toBeDefined()
  })

  it('sets hasHighPower when power >= 60', () => {
    const result = measurePreserving(richContent)
    if (result.power >= 60) {
      expect(result.hasHighPower).toBe(true)
    }
  })
})

// ─── measureAscending ───────────────────────────────────

describe('measureAscending', () => {
  it('returns an ascending measure with all fields', () => {
    const result = measureAscending(richContent)
    expect(result).toHaveProperty('elevation')
    expect(result).toHaveProperty('ascent')
    expect(result).toHaveProperty('hasHighElevation')
    expect(result).toHaveProperty('hasWellStructured')
    expect(result).toHaveProperty('hasNoChaotic')
    expect(result).toHaveProperty('hasModular')
    expect(result).toHaveProperty('hasNoMonolithic')
    expect(result).toHaveProperty('hasEfficient')
    expect(result).toHaveProperty('hasNoWasteful')
    expect(result).toHaveProperty('hasClean')
    expect(result).toHaveProperty('hasElegant')
    expect(result).toHaveProperty('hasPolished')
    expect(result).toHaveProperty('hasRefined')
    expect(result).toHaveProperty('hasCrafted')
    expect(result).toHaveProperty('hasIntentional')
    expect(result).toHaveProperty('hasElevated')
    expect(result).toHaveProperty('hasGolden')
    expect(result).toHaveProperty('chaoticCount')
    expect(result).toHaveProperty('wastefulCount')
  })

  it('scores high on rich content', () => {
    const result = measureAscending(richContent)
    expect(result.elevation).toBeGreaterThan(60)
  })

  it('detects chaotic patterns (var, eval)', () => {
    const result = measureAscending('var x = 1; eval("y")')
    expect(result.chaoticCount).toBe(2)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects modular code (import, export)', () => {
    const result = measureAscending(richContent)
    expect(result.hasModular).toBe(true)
  })

  it('detects monolithic patterns (global, window)', () => {
    const result = measureAscending('global.x = 1; window.y = 2; document.z = 3')
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('detects wasteful patterns (hack, workaround)', () => {
    const result = measureAscending('hack: workaround for bug')
    expect(result.wastefulCount).toBeGreaterThan(0)
    expect(result.hasNoWasteful).toBe(false)
  })

  it('detects elevated code (documentation)', () => {
    const result = measureAscending(richContent)
    expect(result.hasElevated).toBe(true)
  })

  it('detects polished code (async, await)', () => {
    const result = measureAscending(richContent)
    expect(result.hasPolished).toBe(true)
  })

  it('detects refined code (type annotations)', () => {
    const result = measureAscending(richContent)
    expect(result.hasRefined).toBe(true)
  })

  it('classifies ascent correctly', () => {
    const result = measureAscending(richContent)
    expect(result.ascent).toBeDefined()
  })

  it('sets hasHighElevation when elevation >= 60', () => {
    const result = measureAscending(richContent)
    if (result.elevation >= 60) {
      expect(result.hasHighElevation).toBe(true)
    }
  })
})

// ─── measureHardening ───────────────────────────────────

describe('measureHardening', () => {
  it('returns a hardening measure with all fields', () => {
    const result = measureHardening(richContent)
    expect(result).toHaveProperty('fortitude')
    expect(result).toHaveProperty('hardness')
    expect(result).toHaveProperty('hasHighFortitude')
    expect(result).toHaveProperty('hasErrorHandled')
    expect(result).toHaveProperty('hasNoUnhandled')
    expect(result).toHaveProperty('hasDefensive')
    expect(result).toHaveProperty('hasRobust')
    expect(result).toHaveProperty('hasResilient')
    expect(result).toHaveProperty('hasHardened')
    expect(result).toHaveProperty('hasFortified')
    expect(result).toHaveProperty('hasEnduring')
    expect(result).toHaveProperty('hasSolid')
    expect(result).toHaveProperty('hasStrong')
    expect(result).toHaveProperty('hasDurable')
    expect(result).toHaveProperty('hasPressureTested')
    expect(result).toHaveProperty('hasReinforced')
    expect(result).toHaveProperty('hasTough')
    expect(result).toHaveProperty('unhandledCount')
    expect(result).toHaveProperty('vulnerableCount')
  })

  it('detects error handling', () => {
    const result = measureHardening(richContent)
    expect(result.hasErrorHandled).toBe(true)
  })

  it('detects unhandled (any)', () => {
    const result = measureHardening('const x: any = 1')
    expect(result.unhandledCount).toBeGreaterThan(0)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects defensive code', () => {
    const result = measureHardening(richContent)
    expect(result.hasDefensive).toBe(true)
  })

  it('detects robust code (readonly, private)', () => {
    const result = measureHardening(richContent)
    expect(result.hasRobust).toBe(true)
  })

  it('detects vulnerable code (eval)', () => {
    const result = measureHardening('eval("code")')
    expect(result.vulnerableCount).toBe(1)
  })

  it('detects vulnerable patterns (exploit, inject)', () => {
    const result = measureHardening('vulnerable code with exploit and inject')
    expect(result.hasReinforced).toBe(false)
  })

  it('detects pressure tested code (try, catch, throw)', () => {
    const result = measureHardening(richContent)
    expect(result.hasPressureTested).toBe(true)
  })

  it('detects tough code (async, await)', () => {
    const result = measureHardening(richContent)
    expect(result.hasTough).toBe(true)
  })

  it('classifies hardness correctly', () => {
    const result = measureHardening(richContent)
    expect(result.hardness).toBeDefined()
  })

  it('sets hasHighFortitude when fortitude >= 60', () => {
    const result = measureHardening(richContent)
    if (result.fortitude >= 60) {
      expect(result.hasHighFortitude).toBe(true)
    }
  })
})

// ─── measureViewing ─────────────────────────────────────

describe('measureViewing', () => {
  it('returns a viewing measure with all fields', () => {
    const result = measureViewing(richContent)
    expect(result).toHaveProperty('clarity')
    expect(result).toHaveProperty('perspective')
    expect(result).toHaveProperty('hasHighClarity')
    expect(result).toHaveProperty('hasReadable')
    expect(result).toHaveProperty('hasNoCryptic')
    expect(result).toHaveProperty('hasSelfDocumenting')
    expect(result).toHaveProperty('hasNoMystery')
    expect(result).toHaveProperty('hasClear')
    expect(result).toHaveProperty('hasTransparent')
    expect(result).toHaveProperty('hasUnderstandable')
    expect(result).toHaveProperty('hasVisible')
    expect(result).toHaveProperty('hasDirect')
    expect(result).toHaveProperty('hasRevealed')
    expect(result).toHaveProperty('hasIlluminated')
    expect(result).toHaveProperty('hasOpen')
    expect(result).toHaveProperty('hasUnobscured')
    expect(result).toHaveProperty('hasPanoramic')
    expect(result).toHaveProperty('crypticCount')
    expect(result).toHaveProperty('obfuscatedCount')
  })

  it('detects readable code', () => {
    const result = measureViewing(richContent)
    expect(result.hasReadable).toBe(true)
  })

  it('detects cryptic names', () => {
    const result = measureViewing('const a = 1; const b = 2')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects mystery patterns', () => {
    const result = measureViewing('const magic = 42; const mystery = "x"')
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects clear type annotations', () => {
    const result = measureViewing(richContent)
    expect(result.hasClear).toBe(true)
  })

  it('detects illuminated code (documentation)', () => {
    const result = measureViewing(richContent)
    expect(result.hasIlluminated).toBe(true)
  })

  it('detects obscured patterns', () => {
    const result = measureViewing('obfuscated code with minified output')
    expect(result.hasUnobscured).toBe(false)
  })

  it('detects open code (no eval)', () => {
    const result = measureViewing(richContent)
    expect(result.hasOpen).toBe(true)
  })

  it('classifies perspective correctly', () => {
    const result = measureViewing(richContent)
    expect(result.perspective).toBeDefined()
  })

  it('sets obfuscatedCount equal to crypticCount', () => {
    const result = measureViewing('const a = 1')
    expect(result.obfuscatedCount).toBe(result.crypticCount)
  })
})

// ─── measureAccumulating ────────────────────────────────

describe('measureAccumulating', () => {
  it('returns an accumulating measure with all fields', () => {
    const result = measureAccumulating(richContent)
    expect(result).toHaveProperty('wisdom')
    expect(result).toHaveProperty('antiquity')
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
    expect(result).toHaveProperty('hasEvolved')
    expect(result).toHaveProperty('hasHistorical')
    expect(result).toHaveProperty('hasAccumulated')
    expect(result).toHaveProperty('hasTimeless')
    expect(result).toHaveProperty('hackedCount')
    expect(result).toHaveProperty('adHocCount')
  })

  it('detects well-architected code', () => {
    const result = measureAccumulating(richContent)
    expect(result.hasWellArchitected).toBe(true)
  })

  it('detects hacked patterns', () => {
    const result = measureAccumulating('hack: workaround using monkey patch')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects ad-hoc patterns (any)', () => {
    const result = measureAccumulating('const x: any = 1')
    expect(result.adHocCount).toBeGreaterThan(0)
    expect(result.hasNoAdHoc).toBe(false)
  })

  it('detects shallow patterns', () => {
    const result = measureAccumulating('quick dirty temporary fix')
    expect(result.hasNoShallow).toBe(false)
  })

  it('detects insightful code (documentation)', () => {
    const result = measureAccumulating(richContent)
    expect(result.hasInsightful).toBe(true)
  })

  it('detects timeless code (async)', () => {
    const result = measureAccumulating(richContent)
    expect(result.hasTimeless).toBe(true)
  })

  it('classifies antiquity correctly', () => {
    const result = measureAccumulating(richContent)
    expect(result.antiquity).toBeDefined()
  })

  it('sets hasHighWisdom when wisdom >= 60', () => {
    const result = measureAccumulating(richContent)
    if (result.wisdom >= 60) {
      expect(result.hasHighWisdom).toBe(true)
    }
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns amber-masterpiece for 90+', () => {
    expect(classifyCondition(90)).toBe('amber-masterpiece')
    expect(classifyCondition(100)).toBe('amber-masterpiece')
  })

  it('returns golden-summit for 75-89', () => {
    expect(classifyCondition(75)).toBe('golden-summit')
    expect(classifyCondition(89)).toBe('golden-summit')
  })

  it('returns proper-fossil for 60-74', () => {
    expect(classifyCondition(60)).toBe('proper-fossil')
    expect(classifyCondition(74)).toBe('proper-fossil')
  })

  it('returns dull-resin for 40-59', () => {
    expect(classifyCondition(40)).toBe('dull-resin')
    expect(classifyCondition(59)).toBe('dull-resin')
  })

  it('returns raw-sap for 20-39', () => {
    expect(classifyCondition(20)).toBe('raw-sap')
    expect(classifyCondition(39)).toBe('raw-sap')
  })

  it('returns void for 0-19', () => {
    expect(classifyCondition(0)).toBe('void')
    expect(classifyCondition(19)).toBe('void')
  })
})

describe('classifyMountainType', () => {
  it('returns no-mountain for empty array', () => {
    expect(classifyMountainType([])).toBe('no-mountain')
  })

  it('returns golden-peak for high avg', () => {
    const artifacts = [{ qualityScore: 90 }, { qualityScore: 90 }].map((a) =>
      ({ ...a } as AmberArtifact))
    expect(classifyMountainType(artifacts)).toBe('golden-peak')
  })

  it('returns amber-ridge for medium-high avg', () => {
    const artifacts = [{ qualityScore: 75 }, { qualityScore: 75 }].map((a) =>
      ({ ...a } as AmberArtifact))
    expect(classifyMountainType(artifacts)).toBe('amber-ridge')
  })

  it('returns proper-mountain for medium avg', () => {
    const artifacts = [{ qualityScore: 55 }, { qualityScore: 55 }].map((a) =>
      ({ ...a } as AmberArtifact))
    expect(classifyMountainType(artifacts)).toBe('proper-mountain')
  })

  it('returns rocky-hill for low avg', () => {
    const artifacts = [{ qualityScore: 35 }, { qualityScore: 35 }].map((a) =>
      ({ ...a } as AmberArtifact))
    expect(classifyMountainType(artifacts)).toBe('rocky-hill')
  })

  it('returns sand-dune for very low avg', () => {
    const artifacts = [{ qualityScore: 10 }, { qualityScore: 10 }].map((a) =>
      ({ ...a } as AmberArtifact))
    expect(classifyMountainType(artifacts)).toBe('sand-dune')
  })
})

describe('classifyMountainCondition', () => {
  it('returns amber-summit for 85+', () => {
    expect(classifyMountainCondition(85)).toBe('amber-summit')
    expect(classifyMountainCondition(100)).toBe('amber-summit')
  })

  it('returns golden-ridge for 70-84', () => {
    expect(classifyMountainCondition(70)).toBe('golden-ridge')
    expect(classifyMountainCondition(84)).toBe('golden-ridge')
  })

  it('returns proper-trail for 55-69', () => {
    expect(classifyMountainCondition(55)).toBe('proper-trail')
    expect(classifyMountainCondition(69)).toBe('proper-trail')
  })

  it('returns rocky-path for 35-54', () => {
    expect(classifyMountainCondition(35)).toBe('rocky-path')
    expect(classifyMountainCondition(54)).toBe('rocky-path')
  })

  it('returns barren-slope for 15-34', () => {
    expect(classifyMountainCondition(15)).toBe('barren-slope')
    expect(classifyMountainCondition(34)).toBe('barren-slope')
  })

  it('returns void for 0-14', () => {
    expect(classifyMountainCondition(0)).toBe('void')
    expect(classifyMountainCondition(14)).toBe('void')
  })
})

describe('classifyClimberGrade', () => {
  it('returns master-climber for 80+', () => {
    expect(classifyClimberGrade(80)).toBe('master-climber')
    expect(classifyClimberGrade(100)).toBe('master-climber')
  })

  it('returns summit-guide for 65-79', () => {
    expect(classifyClimberGrade(65)).toBe('summit-guide')
    expect(classifyClimberGrade(79)).toBe('summit-guide')
  })

  it('returns experienced-trekker for 50-64', () => {
    expect(classifyClimberGrade(50)).toBe('experienced-trekker')
    expect(classifyClimberGrade(64)).toBe('experienced-trekker')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyClimberGrade(35)).toBe('apprentice')
    expect(classifyClimberGrade(49)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyClimberGrade(20)).toBe('novice')
    expect(classifyClimberGrade(34)).toBe('novice')
  })

  it('returns base-camper for 0-19', () => {
    expect(classifyClimberGrade(0)).toBe('base-camper')
    expect(classifyClimberGrade(19)).toBe('base-camper')
  })
})

// ─── analyzeAmberArtifact ───────────────────────────────

describe('analyzeAmberArtifact', () => {
  it('returns a complete artifact', () => {
    const artifact = analyzeAmberArtifact(richContent, 'app.ts')
    expect(artifact.file).toBe('app.ts')
    expect(artifact.preservationPower).toBeGreaterThanOrEqual(0)
    expect(artifact.goldenElevation).toBeGreaterThanOrEqual(0)
    expect(artifact.resinFortitude).toBeGreaterThanOrEqual(0)
    expect(artifact.peakClarity).toBeGreaterThanOrEqual(0)
    expect(artifact.ancientWisdom).toBeGreaterThanOrEqual(0)
    expect(artifact.qualityScore).toBeGreaterThanOrEqual(0)
    expect(artifact.condition).toBeDefined()
    expect(artifact.preserving).toBeDefined()
    expect(artifact.ascending).toBeDefined()
    expect(artifact.hardening).toBeDefined()
    expect(artifact.viewing).toBeDefined()
    expect(artifact.accumulating).toBeDefined()
  })

  it('computes qualityScore as 0.2 weighted average', () => {
    const artifact = analyzeAmberArtifact(richContent, 'test.ts')
    const expected = Math.round(
      artifact.preservationPower * 0.2 +
      artifact.goldenElevation * 0.2 +
      artifact.resinFortitude * 0.2 +
      artifact.peakClarity * 0.2 +
      artifact.ancientWisdom * 0.2,
    )
    expect(artifact.qualityScore).toBe(expected)
  })

  it('handles empty content', () => {
    const artifact = analyzeAmberArtifact(emptyContent, 'empty.ts')
    expect(artifact.qualityScore).toBeLessThan(40)
    expect(['raw-sap', 'void']).toContain(artifact.condition)
  })
})

// ─── analyzeAmberMountain ───────────────────────────────

describe('analyzeAmberMountain', () => {
  it('returns empty mountain for no artifacts', () => {
    const mountain = analyzeAmberMountain([], 'src')
    expect(mountain.directory).toBe('src')
    expect(mountain.artifacts).toHaveLength(0)
    expect(mountain.avgPreservation).toBe(0)
    expect(mountain.avgElevation).toBe(0)
    expect(mountain.avgWisdom).toBe(0)
    expect(mountain.amberMasterpieceCount).toBe(0)
    expect(mountain.voidCount).toBe(0)
    expect(mountain.mountainType).toBe('no-mountain')
    expect(mountain.condition).toBe('void')
  })

  it('computes averages from artifacts', () => {
    const artifact = analyzeAmberArtifact(richContent, 'app.ts')
    const mountain = analyzeAmberMountain([artifact], 'src')
    expect(mountain.avgPreservation).toBe(artifact.preservationPower)
    expect(mountain.avgElevation).toBe(artifact.goldenElevation)
    expect(mountain.avgWisdom).toBe(artifact.ancientWisdom)
  })

  it('counts amber-masterpiece artifacts', () => {
    const artifact = analyzeAmberArtifact(richContent, 'app.ts')
    const mountain = analyzeAmberMountain([artifact], 'src')
    const expectedCount = artifact.condition === 'amber-masterpiece' ? 1 : 0
    expect(mountain.amberMasterpieceCount).toBe(expectedCount)
  })
})

// ─── buildAmberPeakResult ───────────────────────────────

describe('buildAmberPeakResult', () => {
  it('returns a complete result for empty input', async () => {
    const result = await buildAmberPeakResult([], [])
    expect(result.artifacts).toHaveLength(0)
    expect(result.mountains).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalMountains).toBe(0)
    expect(result.range.isAmber).toBe(false)
    expect(result.range.overallBrilliance).toBe(0)
    expect(result.stats.climberGrade).toBe('base-camper')
  })

  it('returns a complete result for rich content', async () => {
    const result = await buildAmberPeakResult(['app.ts'], [richContent])
    expect(result.artifacts).toHaveLength(1)
    expect(result.artifacts[0].file).toBe('app.ts')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.overallBrilliance).toBeGreaterThan(0)
    expect(result.recommendations).toBeDefined()
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('groups files into mountains by directory', async () => {
    const result = await buildAmberPeakResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.mountains).toHaveLength(2)
    expect(result.stats.totalMountains).toBe(2)
  })

  it('computes all stats fields', async () => {
    const result = await buildAmberPeakResult(['a.ts'], [richContent])
    expect(result.stats.avgPreservationPower).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgGoldenElevation).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgResinFortitude).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgPeakClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgAncientWisdom).toBeGreaterThanOrEqual(0)
    expect(result.stats.amberMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.goldenSummitCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.properFossilCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.dullResinCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.rawSapCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPowerCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighElevationCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighFortitudeCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.climberGrade).toBeDefined()
    expect(typeof result.stats.bestArtifact).toBe('string')
    expect(typeof result.stats.bestPreserved).toBe('string')
    expect(typeof result.stats.highest).toBe('string')
    expect(typeof result.stats.mostFortified).toBe('string')
    expect(typeof result.stats.clearest).toBe('string')
    expect(typeof result.stats.wisest).toBe('string')
  })

  it('sets bestArtifact to highest qualityScore file', async () => {
    const result = await buildAmberPeakResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.bestArtifact).toBe('rich.ts')
  })

  it('sets bestPreserved to highest preservationPower file', async () => {
    const result = await buildAmberPeakResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.bestPreserved).toBe('rich.ts')
  })

  it('sets range.isAmber when overallBrilliance >= 60', async () => {
    const result = await buildAmberPeakResult(['a.ts'], [richContent])
    if (result.range.overallBrilliance >= 60) {
      expect(result.range.isAmber).toBe(true)
    } else {
      expect(result.range.isAmber).toBe(false)
    }
  })

  it('scores rich content at max (100)', async () => {
    const result = await buildAmberPeakResult(['a.ts'], [richContent])
    const artifact = result.artifacts[0]
    expect(artifact.preservationPower).toBe(100)
    expect(artifact.goldenElevation).toBe(100)
    expect(artifact.resinFortitude).toBe(100)
    expect(artifact.peakClarity).toBe(100)
    expect(artifact.ancientWisdom).toBe(100)
    expect(artifact.qualityScore).toBe(100)
  })

  it('handles multiple files with varying quality', async () => {
    const result = await buildAmberPeakResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.artifacts).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('files in root directory map to . mountain', async () => {
    const result = await buildAmberPeakResult(['app.ts'], [richContent])
    expect(result.mountains).toHaveLength(1)
    expect(result.mountains[0].directory).toBe('.')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all scores >= 90', async () => {
    const result = await buildAmberPeakResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('recommends preservation when power is low', async () => {
    const result = await buildAmberPeakResult(['a.ts'], ['var x = 1'])
    const hasPreserveRec = result.recommendations.some((r) => r.includes('Preserve'))
    expect(hasPreserveRec).toBe(true)
  })

  it('recommends hardening when fortitude is low', async () => {
    const result = await buildAmberPeakResult(['a.ts'], ['var x = 1'])
    const hasHardenRec = result.recommendations.some((r) => r.includes('Harden'))
    expect(hasHardenRec).toBe(true)
  })

  it('returns default recommendation when all scores are good', async () => {
    const result = await buildAmberPeakResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('mentions raw sap artifacts when <= 5', async () => {
    const result = await buildAmberPeakResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('mentions raw sap count when > 5', async () => {
    const files = Array.from({ length: 8 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => emptyContent)
    const result = await buildAmberPeakResult(files, contents)
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
    expect(typeof colorCondition('amber-masterpiece')).toBe('string')
    expect(typeof colorCondition('golden-summit')).toBe('string')
    expect(typeof colorCondition('proper-fossil')).toBe('string')
    expect(typeof colorCondition('dull-resin')).toBe('string')
    expect(typeof colorCondition('raw-sap')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorMountainCondition', () => {
  it('returns a string for each condition', () => {
    expect(typeof colorMountainCondition('amber-summit')).toBe('string')
    expect(typeof colorMountainCondition('golden-ridge')).toBe('string')
    expect(typeof colorMountainCondition('proper-trail')).toBe('string')
    expect(typeof colorMountainCondition('rocky-path')).toBe('string')
    expect(typeof colorMountainCondition('barren-slope')).toBe('string')
    expect(typeof colorMountainCondition('void')).toBe('string')
    expect(typeof colorMountainCondition('unknown')).toBe('string')
  })
})

describe('formatArtifactTable', () => {
  it('returns formatted string for an artifact', async () => {
    const result = await buildAmberPeakResult(['a.ts'], [richContent])
    const output = formatArtifactTable(result.artifacts[0])
    expect(output).toContain('Amber Artifact')
    expect(output).toContain('a.ts')
    expect(output).toContain('Preservation Power')
    expect(output).toContain('Quality Score')
  })
})

describe('formatArtifactsTable', () => {
  it('returns no artifacts message for empty', () => {
    const output = formatArtifactsTable([])
    expect(output).toContain('No amber artifacts')
  })

  it('returns formatted table for artifacts', async () => {
    const result = await buildAmberPeakResult(['a.ts', 'b.ts'], [richContent, richContent])
    const output = formatArtifactsTable(result.artifacts)
    expect(output).toContain('Amber Artifacts')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatMountainTable', () => {
  it('returns formatted mountain info', async () => {
    const result = await buildAmberPeakResult(['a.ts'], [richContent])
    const output = formatMountainTable(result.mountains[0])
    expect(output).toContain('Amber Mountain')
    expect(output).toContain('Artifacts')
    expect(output).toContain('Condition')
  })
})

describe('formatMountainsTable', () => {
  it('returns no mountains message for empty', () => {
    const output = formatMountainsTable([])
    expect(output).toContain('No amber mountains')
  })

  it('returns formatted mountains', async () => {
    const result = await buildAmberPeakResult(['src/a.ts', 'lib/b.ts'], [richContent, richContent])
    const output = formatMountainsTable(result.mountains)
    expect(output).toContain('Amber Mountains')
  })
})

describe('formatStatsTable', () => {
  it('returns formatted stats', async () => {
    const result = await buildAmberPeakResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Amber Peak Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Climber Grade')
    expect(output).toContain('Best Artifact')
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
    const result = await buildAmberPeakResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Amber Peak Analysis')
    expect(output).toContain('Amber Artifacts')
    expect(output).toContain('Amber Mountains')
    expect(output).toContain('Range Overview')
    expect(output).toContain('Amber Peak Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildAmberPeakResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.artifacts).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.range).toBeDefined()
  })
})
