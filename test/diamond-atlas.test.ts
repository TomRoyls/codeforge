import { describe, it, expect } from 'vitest'
import {
  measureCrystallizing,
  measureFaceting,
  measureMapping,
  measureDispersing,
  measureGuiding,
  classifyCondition,
  classifyVolumeType,
  classifyVolumeCondition,
  classifyCartographerGrade,
  analyzeDiamondPage,
  analyzeDiamondVolume,
  buildDiamondAtlasResult,
  generateRecommendations,
} from '../src/commands/diamond-atlas-helpers.js'
import {
  colorScore,
  colorCondition,
  colorVolumeCondition,
  formatPageTable,
  formatPagesTable,
  formatVolumeTable,
  formatVolumesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/diamond-atlas-format-helpers.js'

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

// ─── measureCrystallizing ──────────────────────────────────────────

describe('measureCrystallizing', () => {
  it('returns a score for empty content', () => {
    const m = measureCrystallizing('')
    expect(m.clarity).toBeGreaterThanOrEqual(0)
    expect(typeof m.diamond).toBe('string')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureCrystallizing(richContent)
    expect(m.clarity).toBe(100)
    expect(m.diamond).toBe('flawless-clarity')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasEnduring).toBe(true)
    expect(m.hasImmutable).toBe(true)
  })

  it('detects cryptic eval usage', () => {
    const m = measureCrystallizing('eval("code")')
    expect(m.crypticCount).toBe(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects mystery patterns', () => {
    const m = measureCrystallizing('// mystery magic unexplained')
    expect(m.hasNoMystery).toBe(false)
  })

  it('detects obfuscated any usage', () => {
    const m = measureCrystallizing('const x: any = 1')
    expect(m.obfuscatedCount).toBe(1)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('detects hidden ts-ignore', () => {
    const m = measureCrystallizing('// @ts-ignore')
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects hidden ts-expect-error', () => {
    const m = measureCrystallizing('// @ts-expect-error')
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects arcane patterns', () => {
    const m = measureCrystallizing('// arcane esoteric cryptic')
    expect(m.hasNoArcane).toBe(false)
  })

  it('detects contradictory patterns', () => {
    const m = measureCrystallizing('// contradictory conflicting inconsistent')
    expect(m.hasNoContradictory).toBe(false)
  })

  it('detects fleeting patterns', () => {
    const m = measureCrystallizing('// fleeting temporary ephemeral')
    expect(m.hasNoFleeting).toBe(false)
  })
})

// ─── measureFaceting ──────────────────────────────────────────

describe('measureFaceting', () => {
  it('returns a score for empty content', () => {
    const m = measureFaceting('')
    expect(m.precision).toBeGreaterThanOrEqual(0)
    expect(typeof m.cut).toBe('string')
    expect(m.hasHighPrecision).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureFaceting(richContent)
    expect(m.precision).toBe(100)
    expect(m.cut).toBe('ideal-cut')
    expect(m.hasHighPrecision).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasCorrect).toBe(true)
    expect(m.hasValidated).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasDeterministic).toBe(true)
    expect(m.hasPrecise).toBe(true)
  })

  it('detects unsafe any usage', () => {
    const m = measureFaceting('const x: any = 1')
    expect(m.unsafeCount).toBe(1)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects wrong patterns', () => {
    const m = measureFaceting('// wrong incorrect error.prone')
    expect(m.hasNoWrong).toBe(false)
  })

  it('detects approximate patterns', () => {
    const m = measureFaceting('// approximate rough close.enough')
    expect(m.hasNoApproximate).toBe(false)
  })

  it('detects buggy patterns', () => {
    const m = measureFaceting('// buggy broken defective')
    expect(m.buggyCount).toBe(3)
    expect(m.hasNoBuggy).toBe(false)
  })

  it('detects assumed patterns', () => {
    const m = measureFaceting('// assume guess hope')
    expect(m.hasNoAssumed).toBe(false)
  })

  it('detects erratic var usage', () => {
    const m = measureFaceting('var x = 1')
    expect(m.hasNoErratic).toBe(false)
  })

  it('detects random patterns', () => {
    const m = measureFaceting('// random arbitrary chaotic')
    expect(m.hasNoRandom).toBe(false)
  })
})

// ─── measureMapping ──────────────────────────────────────────

describe('measureMapping', () => {
  it('returns a score for empty content', () => {
    const m = measureMapping('')
    expect(m.completeness).toBeGreaterThanOrEqual(0)
    expect(typeof m.coverage).toBe('string')
    expect(m.hasHighCompleteness).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureMapping(richContent)
    expect(m.completeness).toBe(100)
    expect(m.coverage).toBe('complete-atlas')
    expect(m.hasHighCompleteness).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasExported).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasEdgeCaseHandled).toBe(true)
    expect(m.hasComplete).toBe(true)
    expect(m.hasThorough).toBe(true)
    expect(m.hasComprehensive).toBe(true)
  })

  it('detects untested var usage', () => {
    const m = measureMapping('var x = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
  })

  it('detects undocumented functions', () => {
    const m = measureMapping('function foo() {}')
    expect(m.undocumentedCount).toBeGreaterThan(0)
    expect(m.hasNoUndocumented).toBe(false)
  })

  it('detects bare crash eval usage', () => {
    const m = measureMapping('eval("code")')
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects edge ignored patterns', () => {
    const m = measureMapping('// ignore skip bypass')
    expect(m.hasNoEdgeIgnored).toBe(false)
  })

  it('detects incomplete patterns', () => {
    const m = measureMapping('// incomplete partial unfinished')
    expect(m.hasNoIncomplete).toBe(false)
  })

  it('detects superficial patterns', () => {
    const m = measureMapping('// superficial shallow surface')
    expect(m.hasNoSuperficial).toBe(false)
  })
})

// ─── measureDispersing ──────────────────────────────────────────

describe('measureDispersing', () => {
  it('returns a score for empty content', () => {
    const m = measureDispersing('')
    expect(m.fire).toBeGreaterThanOrEqual(0)
    expect(typeof m.spectrum).toBe('string')
    expect(m.hasHighFire).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureDispersing(richContent)
    expect(m.fire).toBe(100)
    expect(m.spectrum).toBe('full-rainbow')
    expect(m.hasHighFire).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasSeparation).toBe(true)
    expect(m.hasCleanPipelines).toBe(true)
    expect(m.hasMultiConcern).toBe(true)
    expect(m.hasAbstracted).toBe(true)
    expect(m.hasOrganized).toBe(true)
    expect(m.hasFlexible).toBe(true)
    expect(m.hasVersatile).toBe(true)
  })

  it('detects monolithic patterns', () => {
    const m = measureDispersing('// monolithic giant massive')
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('detects tangled patterns', () => {
    const m = measureDispersing('// tangled woven intertwined')
    expect(m.tangledCount).toBe(3)
    expect(m.hasNoTangled).toBe(false)
  })

  it('detects spaghetti patterns', () => {
    const m = measureDispersing('// spaghetti tangle mess')
    expect(m.spaghettiCount).toBe(3)
    expect(m.hasNoSpaghetti).toBe(false)
  })

  it('detects single purpose patterns', () => {
    const m = measureDispersing('// single.purpose only.does just.one')
    expect(m.hasNoSinglePurpose).toBe(false)
  })

  it('detects leaky ts-ignore', () => {
    const m = measureDispersing('// @ts-ignore')
    expect(m.hasNoLeaky).toBe(false)
  })

  it('detects mixed any usage', () => {
    const m = measureDispersing('const x: any = 1')
    expect(m.hasNoMixed).toBe(false)
  })

  it('detects rigid patterns', () => {
    const m = measureDispersing('// rigid inflexible hardcoded')
    expect(m.hasNoRigid).toBe(false)
  })
})

// ─── measureGuiding ──────────────────────────────────────────

describe('measureGuiding', () => {
  it('returns a score for empty content', () => {
    const m = measureGuiding('')
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
    expect(typeof m.compass).toBe('string')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureGuiding(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.compass).toBe('true-north')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasStrategic).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasNavigable).toBe(true)
  })

  it('detects hacked patterns', () => {
    const m = measureGuiding('// hack workaround monkey')
    expect(m.hackedCount).toBe(3)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects ad-hoc any usage', () => {
    const m = measureGuiding('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })

  it('detects reinvented patterns', () => {
    const m = measureGuiding('// reinvent rewrote redone')
    expect(m.hasNoReinvented).toBe(false)
  })

  it('detects experimental patterns', () => {
    const m = measureGuiding('// experimental beta alpha')
    expect(m.hasNoExperimental).toBe(false)
  })

  it('detects shallow ts-ignore', () => {
    const m = measureGuiding('// @ts-ignore')
    expect(m.hasNoShallow).toBe(false)
  })

  it('detects naive patterns', () => {
    const m = measureGuiding('// naive simple basic')
    expect(m.hasNoNaive).toBe(false)
  })
})

// ─── Classifiers ──────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies diamond-masterpiece at 90+', () => {
    expect(classifyCondition(90)).toBe('diamond-masterpiece')
    expect(classifyCondition(100)).toBe('diamond-masterpiece')
  })

  it('classifies crystal-atlas at 75-89', () => {
    expect(classifyCondition(75)).toBe('crystal-atlas')
  })

  it('classifies proper-map at 60-74', () => {
    expect(classifyCondition(60)).toBe('proper-map')
  })

  it('classifies faded-chart at 40-59', () => {
    expect(classifyCondition(40)).toBe('faded-chart')
  })

  it('classifies torn-page at 20-39', () => {
    expect(classifyCondition(20)).toBe('torn-page')
  })

  it('classifies void below 20', () => {
    expect(classifyCondition(0)).toBe('void')
  })
})

describe('classifyVolumeType', () => {
  it('returns no-volume for empty pages', () => {
    expect(classifyVolumeType([])).toBe('no-volume')
  })

  it('classifies complete-atlas at avg 90+', () => {
    const pages = [{ qualityScore: 90 }, { qualityScore: 95 }].map((q) =>
      ({ ...q, file: '', hardnessClarity: 0, cutPrecision: 0, mapCompleteness: 0, fireDispersion: 0, cartographicWisdom: 0, crystallizing: {} as any, faceting: {} as any, mapping: {} as any, dispersing: {} as any, guiding: {} as any, condition: 'void' as const }),
    )
    expect(classifyVolumeType(pages)).toBe('complete-atlas')
  })
})

describe('classifyVolumeCondition', () => {
  it('classifies crystal-library at 85+', () => {
    expect(classifyVolumeCondition(85)).toBe('crystal-library')
    expect(classifyVolumeCondition(100)).toBe('crystal-library')
  })

  it('classifies void below 15', () => {
    expect(classifyVolumeCondition(0)).toBe('void')
  })
})

describe('classifyCartographerGrade', () => {
  it('classifies master-cartographer at 80+', () => {
    expect(classifyCartographerGrade(80)).toBe('master-cartographer')
  })

  it('classifies diamond-cutter at 65-79', () => {
    expect(classifyCartographerGrade(65)).toBe('diamond-cutter')
  })

  it('classifies map-maker at 50-64', () => {
    expect(classifyCartographerGrade(50)).toBe('map-maker')
  })

  it('classifies apprentice at 35-49', () => {
    expect(classifyCartographerGrade(35)).toBe('apprentice')
  })

  it('classifies novice at 20-34', () => {
    expect(classifyCartographerGrade(20)).toBe('novice')
  })

  it('classifies lost-soul below 20', () => {
    expect(classifyCartographerGrade(0)).toBe('lost-soul')
  })
})

// ─── analyzeDiamondPage ──────────────────────────────────────────

describe('analyzeDiamondPage', () => {
  it('analyzes minimal content', () => {
    const page = analyzeDiamondPage(minimalContent, 'test.ts')
    expect(page.file).toBe('test.ts')
    expect(page.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('analyzes rich content with high scores', () => {
    const page = analyzeDiamondPage(richContent, 'rich.ts')
    expect(page.hardnessClarity).toBe(100)
    expect(page.cutPrecision).toBe(100)
    expect(page.mapCompleteness).toBe(100)
    expect(page.fireDispersion).toBe(100)
    expect(page.cartographicWisdom).toBe(100)
    expect(page.qualityScore).toBe(100)
    expect(page.condition).toBe('diamond-masterpiece')
  })

  it('preserves all measure data', () => {
    const page = analyzeDiamondPage(richContent, 'full.ts')
    expect(page.crystallizing).toBeDefined()
    expect(page.faceting).toBeDefined()
    expect(page.mapping).toBeDefined()
    expect(page.dispersing).toBeDefined()
    expect(page.guiding).toBeDefined()
  })
})

// ─── analyzeDiamondVolume ──────────────────────────────────────────

describe('analyzeDiamondVolume', () => {
  it('returns empty volume for no pages', () => {
    const vol = analyzeDiamondVolume([], 'src')
    expect(vol.directory).toBe('src')
    expect(vol.pages).toHaveLength(0)
    expect(vol.volumeType).toBe('no-volume')
    expect(vol.condition).toBe('void')
  })

  it('computes volume stats from pages', () => {
    const pages = [
      analyzeDiamondPage(richContent, 'src/a.ts'),
      analyzeDiamondPage(richContent, 'src/b.ts'),
    ]
    const vol = analyzeDiamondVolume(pages, 'src')
    expect(vol.avgClarity).toBe(100)
    expect(vol.diamondMasterpieceCount).toBe(2)
    expect(vol.volumeType).toBe('complete-atlas')
    expect(vol.condition).toBe('crystal-library')
  })
})

// ─── buildDiamondAtlasResult ──────────────────────────────────────────

describe('buildDiamondAtlasResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildDiamondAtlasResult([], [])
    expect(result.pages).toHaveLength(0)
    expect(result.volumes).toHaveLength(0)
    expect(result.cartography.isDiamond).toBe(false)
    expect(result.stats.cartographerGrade).toBe('lost-soul')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes single file', async () => {
    const result = await buildDiamondAtlasResult(['test.ts'], [richContent])
    expect(result.pages).toHaveLength(1)
    expect(result.volumes).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into volumes', async () => {
    const result = await buildDiamondAtlasResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.pages).toHaveLength(3)
    expect(result.volumes).toHaveLength(2)
    expect(result.stats.totalVolumes).toBe(2)
  })

  it('computes cartography overview', async () => {
    const result = await buildDiamondAtlasResult(['app.ts'], [richContent])
    expect(result.cartography.avgClarity).toBeGreaterThan(0)
    expect(result.cartography.isDiamond).toBe(true)
    expect(result.cartography.overallBrilliance).toBeGreaterThan(0)
  })

  it('computes stats correctly', async () => {
    const result = await buildDiamondAtlasResult(['good.ts', 'bad.ts'], [richContent, ''])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.bestPage).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostComplete).toBeTruthy()
    expect(result.stats.mostColorful).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('tracks high counts', async () => {
    const result = await buildDiamondAtlasResult(['rich.ts'], [richContent])
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighCompletenessCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighFireCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('handles missing content gracefully', async () => {
    const result = await buildDiamondAtlasResult(['missing.ts'], [])
    expect(result.pages).toHaveLength(1)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect recommendation for all 90+', () => {
    const pages = [analyzeDiamondPage(richContent, 'perfect.ts')]
    const volumes = [analyzeDiamondVolume(pages, 'src')]
    const cartography = { avgClarity: 95, avgPrecision: 95, avgWisdom: 95, isDiamond: true, overallBrilliance: 95 }
    const stats = {
      totalFiles: 1, totalVolumes: 1,
      avgHardnessClarity: 95, avgCutPrecision: 95, avgMapCompleteness: 95,
      avgFireDispersion: 95, avgCartographicWisdom: 95,
      diamondMasterpieceCount: 1, crystalAtlasCount: 0, properMapCount: 0,
      fadedChartCount: 0, tornPageCount: 0, voidCount: 0,
      hasHighClarityCount: 1, hasHighPrecisionCount: 1, hasHighCompletenessCount: 1,
      hasHighFireCount: 1, hasHighWisdomCount: 1,
      overallBrilliance: 95, cartographerGrade: 'master-cartographer' as const,
      bestPage: 'perfect.ts', clearest: 'perfect.ts', mostPrecise: 'perfect.ts',
      mostComplete: 'perfect.ts', mostColorful: 'perfect.ts', wisest: 'perfect.ts',
    }
    const recs = generateRecommendations(pages, volumes, cartography, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('flawless crystalline perfection')
  })

  it('recommends improving low clarity', () => {
    const pages = [analyzeDiamondPage('', 'empty.ts')]
    const volumes = [analyzeDiamondVolume(pages, '.')]
    const cartography = { avgClarity: 0, avgPrecision: 0, avgWisdom: 0, isDiamond: false, overallBrilliance: 0 }
    const stats = {
      totalFiles: 1, totalVolumes: 1,
      avgHardnessClarity: 0, avgCutPrecision: 0, avgMapCompleteness: 0,
      avgFireDispersion: 0, avgCartographicWisdom: 0,
      diamondMasterpieceCount: 0, crystalAtlasCount: 0, properMapCount: 0,
      fadedChartCount: 0, tornPageCount: 0, voidCount: 1,
      hasHighClarityCount: 0, hasHighPrecisionCount: 0, hasHighCompletenessCount: 0,
      hasHighFireCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 0, cartographerGrade: 'lost-soul' as const,
      bestPage: 'empty.ts', clearest: 'empty.ts', mostPrecise: 'empty.ts',
      mostComplete: 'empty.ts', mostColorful: 'empty.ts', wisest: 'empty.ts',
    }
    const recs = generateRecommendations(pages, volumes, cartography, stats)
    expect(recs.some((r) => r.includes('hardness clarity') || r.includes('diamond'))).toBe(true)
  })

  it('recommends improving low precision', () => {
    const cartography = { avgClarity: 70, avgPrecision: 50, avgWisdom: 70, isDiamond: false, overallBrilliance: 50 }
    const stats = {
      totalFiles: 1, totalVolumes: 1,
      avgHardnessClarity: 70, avgCutPrecision: 50, avgMapCompleteness: 70,
      avgFireDispersion: 70, avgCartographicWisdom: 70,
      diamondMasterpieceCount: 0, crystalAtlasCount: 0, properMapCount: 0,
      fadedChartCount: 0, tornPageCount: 0, voidCount: 0,
      hasHighClarityCount: 0, hasHighPrecisionCount: 0, hasHighCompletenessCount: 0,
      hasHighFireCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 50, cartographerGrade: 'map-maker' as const,
      bestPage: '', clearest: '', mostPrecise: '', mostComplete: '', mostColorful: '', wisest: '',
    }
    const recs = generateRecommendations([], [], cartography, stats)
    expect(recs.some((r) => r.includes('cut precision') || r.includes('facet'))).toBe(true)
  })

  it('recommends improving low completeness', () => {
    const cartography = { avgClarity: 70, avgPrecision: 70, avgWisdom: 70, isDiamond: false, overallBrilliance: 50 }
    const stats = {
      totalFiles: 1, totalVolumes: 1,
      avgHardnessClarity: 70, avgCutPrecision: 70, avgMapCompleteness: 50,
      avgFireDispersion: 70, avgCartographicWisdom: 70,
      diamondMasterpieceCount: 0, crystalAtlasCount: 0, properMapCount: 0,
      fadedChartCount: 0, tornPageCount: 0, voidCount: 0,
      hasHighClarityCount: 0, hasHighPrecisionCount: 0, hasHighCompletenessCount: 0,
      hasHighFireCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 50, cartographerGrade: 'map-maker' as const,
      bestPage: '', clearest: '', mostPrecise: '', mostComplete: '', mostColorful: '', wisest: '',
    }
    const recs = generateRecommendations([], [], cartography, stats)
    expect(recs.some((r) => r.includes('atlas') || r.includes('Complete'))).toBe(true)
  })

  it('recommends improving low fire dispersion', () => {
    const cartography = { avgClarity: 70, avgPrecision: 70, avgWisdom: 70, isDiamond: false, overallBrilliance: 50 }
    const stats = {
      totalFiles: 1, totalVolumes: 1,
      avgHardnessClarity: 70, avgCutPrecision: 70, avgMapCompleteness: 70,
      avgFireDispersion: 50, avgCartographicWisdom: 70,
      diamondMasterpieceCount: 0, crystalAtlasCount: 0, properMapCount: 0,
      fadedChartCount: 0, tornPageCount: 0, voidCount: 0,
      hasHighClarityCount: 0, hasHighPrecisionCount: 0, hasHighCompletenessCount: 0,
      hasHighFireCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 50, cartographerGrade: 'map-maker' as const,
      bestPage: '', clearest: '', mostPrecise: '', mostComplete: '', mostColorful: '', wisest: '',
    }
    const recs = generateRecommendations([], [], cartography, stats)
    expect(recs.some((r) => r.includes('fire dispersion') || r.includes('Enhance'))).toBe(true)
  })

  it('recommends improving low wisdom', () => {
    const cartography = { avgClarity: 70, avgPrecision: 70, avgWisdom: 50, isDiamond: false, overallBrilliance: 50 }
    const stats = {
      totalFiles: 1, totalVolumes: 1,
      avgHardnessClarity: 70, avgCutPrecision: 70, avgMapCompleteness: 70,
      avgFireDispersion: 70, avgCartographicWisdom: 50,
      diamondMasterpieceCount: 0, crystalAtlasCount: 0, properMapCount: 0,
      fadedChartCount: 0, tornPageCount: 0, voidCount: 0,
      hasHighClarityCount: 0, hasHighPrecisionCount: 0, hasHighCompletenessCount: 0,
      hasHighFireCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 50, cartographerGrade: 'map-maker' as const,
      bestPage: '', clearest: '', mostPrecise: '', mostComplete: '', mostColorful: '', wisest: '',
    }
    const recs = generateRecommendations([], [], cartography, stats)
    expect(recs.some((r) => r.includes('cartographic wisdom') || r.includes('Deepen'))).toBe(true)
  })

  it('warns about torn pages', () => {
    const panels = Array.from({ length: 6 }, (_, i) => analyzeDiamondPage('', `empty${i}.ts`))
    const volumes = [analyzeDiamondVolume(panels, '.')]
    const cartography = { avgClarity: 0, avgPrecision: 0, avgWisdom: 0, isDiamond: false, overallBrilliance: 0 }
    const stats = {
      totalFiles: 6, totalVolumes: 1,
      avgHardnessClarity: 0, avgCutPrecision: 0, avgMapCompleteness: 0,
      avgFireDispersion: 0, avgCartographicWisdom: 0,
      diamondMasterpieceCount: 0, crystalAtlasCount: 0, properMapCount: 0,
      fadedChartCount: 0, tornPageCount: 0, voidCount: 6,
      hasHighClarityCount: 0, hasHighPrecisionCount: 0, hasHighCompletenessCount: 0,
      hasHighFireCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 0, cartographerGrade: 'lost-soul' as const,
      bestPage: 'empty0.ts', clearest: 'empty0.ts', mostPrecise: 'empty0.ts',
      mostComplete: 'empty0.ts', mostColorful: 'empty0.ts', wisest: 'empty0.ts',
    }
    const recs = generateRecommendations(panels, volumes, cartography, stats)
    expect(recs.some((r) => r.includes('torn pages'))).toBe(true)
  })

  it('lists specific torn pages when <= 5', () => {
    const pages = [analyzeDiamondPage('', 'a.ts'), analyzeDiamondPage('', 'b.ts')]
    const volumes = [analyzeDiamondVolume(pages, '.')]
    const cartography = { avgClarity: 0, avgPrecision: 0, avgWisdom: 0, isDiamond: false, overallBrilliance: 0 }
    const stats = {
      totalFiles: 2, totalVolumes: 1,
      avgHardnessClarity: 0, avgCutPrecision: 0, avgMapCompleteness: 0,
      avgFireDispersion: 0, avgCartographicWisdom: 0,
      diamondMasterpieceCount: 0, crystalAtlasCount: 0, properMapCount: 0,
      fadedChartCount: 0, tornPageCount: 0, voidCount: 2,
      hasHighClarityCount: 0, hasHighPrecisionCount: 0, hasHighCompletenessCount: 0,
      hasHighFireCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 0, cartographerGrade: 'lost-soul' as const,
      bestPage: 'a.ts', clearest: 'a.ts', mostPrecise: 'a.ts',
      mostComplete: 'a.ts', mostColorful: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations(pages, volumes, cartography, stats)
    expect(recs.some((r) => r.includes('Restore these torn pages'))).toBe(true)
  })

  it('warns when all volumes are poor', () => {
    const pages = [analyzeDiamondPage('', 'bad.ts')]
    const volumes = [analyzeDiamondVolume(pages, 'src')]
    const cartography = { avgClarity: 0, avgPrecision: 0, avgWisdom: 0, isDiamond: false, overallBrilliance: 0 }
    const stats = {
      totalFiles: 1, totalVolumes: 1,
      avgHardnessClarity: 0, avgCutPrecision: 0, avgMapCompleteness: 0,
      avgFireDispersion: 0, avgCartographicWisdom: 0,
      diamondMasterpieceCount: 0, crystalAtlasCount: 0, properMapCount: 0,
      fadedChartCount: 0, tornPageCount: 0, voidCount: 1,
      hasHighClarityCount: 0, hasHighPrecisionCount: 0, hasHighCompletenessCount: 0,
      hasHighFireCount: 0, hasHighWisdomCount: 0,
      overallBrilliance: 0, cartographerGrade: 'lost-soul' as const,
      bestPage: 'bad.ts', clearest: 'bad.ts', mostPrecise: 'bad.ts',
      mostComplete: 'bad.ts', mostColorful: 'bad.ts', wisest: 'bad.ts',
    }
    const recs = generateRecommendations(pages, volumes, cartography, stats)
    expect(recs.some((r) => r.includes('complete restoration'))).toBe(true)
  })

  it('gives positive recommendation when all measures pass', () => {
    const pages = [analyzeDiamondPage(richContent, 'good.ts')]
    const volumes = [analyzeDiamondVolume(pages, 'src')]
    const cartography = { avgClarity: 85, avgPrecision: 85, avgWisdom: 85, isDiamond: true, overallBrilliance: 85 }
    const stats = {
      totalFiles: 1, totalVolumes: 1,
      avgHardnessClarity: 85, avgCutPrecision: 85, avgMapCompleteness: 85,
      avgFireDispersion: 85, avgCartographicWisdom: 85,
      diamondMasterpieceCount: 0, crystalAtlasCount: 1, properMapCount: 0,
      fadedChartCount: 0, tornPageCount: 0, voidCount: 0,
      hasHighClarityCount: 1, hasHighPrecisionCount: 1, hasHighCompletenessCount: 1,
      hasHighFireCount: 1, hasHighWisdomCount: 1,
      overallBrilliance: 85, cartographerGrade: 'master-cartographer' as const,
      bestPage: 'good.ts', clearest: 'good.ts', mostPrecise: 'good.ts',
      mostComplete: 'good.ts', mostColorful: 'good.ts', wisest: 'good.ts',
    }
    const recs = generateRecommendations(pages, volumes, cartography, stats)
    expect(recs.some((r) => r.includes('diamond atlas') || r.includes('crystalline'))).toBe(true)
  })
})

// ─── Format Helpers ──────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns strings for all conditions', () => {
    expect(typeof colorCondition('diamond-masterpiece')).toBe('string')
    expect(typeof colorCondition('crystal-atlas')).toBe('string')
    expect(typeof colorCondition('proper-map')).toBe('string')
    expect(typeof colorCondition('faded-chart')).toBe('string')
    expect(typeof colorCondition('torn-page')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorVolumeCondition', () => {
  it('returns strings for all conditions', () => {
    expect(typeof colorVolumeCondition('crystal-library')).toBe('string')
    expect(typeof colorVolumeCondition('diamond-archive')).toBe('string')
    expect(typeof colorVolumeCondition('proper-collection')).toBe('string')
    expect(typeof colorVolumeCondition('faded-shelf')).toBe('string')
    expect(typeof colorVolumeCondition('torn-book')).toBe('string')
    expect(typeof colorVolumeCondition('void')).toBe('string')
  })
})

describe('formatPageTable', () => {
  it('formats a page', () => {
    const page = analyzeDiamondPage(richContent, 'app.ts')
    const output = formatPageTable(page)
    expect(output).toContain('app.ts')
    expect(output).toContain('Hardness Clarity')
    expect(output).toContain('Cut Precision')
    expect(output).toContain('Map Completeness')
    expect(output).toContain('Fire Dispersion')
    expect(output).toContain('Cartographic Wisdom')
  })
})

describe('formatPagesTable', () => {
  it('formats empty pages', () => {
    expect(formatPagesTable([])).toContain('No diamond pages found')
  })

  it('formats pages table', () => {
    const pages = [analyzeDiamondPage(richContent, 'app.ts')]
    expect(formatPagesTable(pages)).toContain('app.ts')
  })
})

describe('formatVolumeTable', () => {
  it('formats a volume', () => {
    const pages = [analyzeDiamondPage(richContent, 'src/app.ts')]
    const vol = analyzeDiamondVolume(pages, 'src')
    const output = formatVolumeTable(vol)
    expect(output).toContain('src')
    expect(output).toContain('Avg Clarity')
  })
})

describe('formatVolumesTable', () => {
  it('formats empty volumes', () => {
    expect(formatVolumesTable([])).toContain('No diamond volumes found')
  })

  it('formats volumes table', () => {
    const pages = [analyzeDiamondPage(richContent, 'src/app.ts')]
    const volumes = [analyzeDiamondVolume(pages, 'src')]
    expect(formatVolumesTable(volumes)).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildDiamondAtlasResult(['app.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Diamond Atlas Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Overall Brilliance')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildDiamondAtlasResult(['app.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Diamond Atlas Analysis')
    expect(output).toContain('Cartography Overview')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildDiamondAtlasResult(['app.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.pages).toHaveLength(1)
    expect(parsed.volumes).toBeDefined()
    expect(parsed.cartography).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
