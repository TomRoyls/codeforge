import { describe, expect, it } from 'vitest'

import {
  type CartographerGrade as CartographerGradeType,
  type CrystallizingMeasure,
  type CuttingMeasure,
  type DiamondAtlasResult,
  type DiamondPage as DiamondPageType,
  type DiamondVolume as DiamondVolumeType,
  type DispersingMeasure,
  type MappingMeasure,
  type NavigatingMeasure,
  type PageCondition as PageConditionType,
  type VolumeCondition as VolumeConditionType,
  type VolumeType as VolumeTypeType,
  analyzeDiamondPage,
  analyzeDiamondVolume,
  buildDiamondAtlasResult,
  classifyCartographerGrade,
  classifyPageCondition,
  classifyVolumeCondition,
  classifyVolumeType,
  generateRecommendations,
  measureCrystallizing,
  measureCutting,
  measureDispersing,
  measureMapping,
  measureNavigating,
} from '../src/commands/diamond-index-helpers.js'

import {
  colorScore,
  colorVolumeCondition,
  formatPagesTable,
  formatPageTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
  formatVolumesTable,
  formatVolumeTable,
} from '../src/commands/diamond-index-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

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

const emptyContent = ''
const poorContent = 'var x = eval("1")'
const moderateContent = [
  'import { X } from "y"',
  'export class App {',
  '  name: string',
  '  run() { return 1 }',
  '}',
].join('\n')

function makePage(
  file: string,
  hardness: number,
  precision: number,
  completeness: number,
  fire: number,
  wisdom: number,
): DiamondPageType {
  const qualityScore = Math.round(hardness * 0.2 + precision * 0.2 + completeness * 0.2 + fire * 0.2 + wisdom * 0.2)
  return {
    file,
    hardnessClarity: hardness,
    cutPrecision: precision,
    mapCompleteness: completeness,
    fireDispersion: fire,
    cartographicWisdom: wisdom,
    crystallizing: { hardness, crystal: 'flawless-diamond', hasHighHardness: hardness >= 60, hasWellStructured: true, hasNoChaotic: true, hasTypeSafe: true, hasNoUnsafe: true, hasTested: true, hasNoUntested: true, hasStable: true, hasRobust: true, hasHardened: true, hasEnduring: true, hasSolid: true, hasDurable: true, hasReinforced: true, hasPermanent: true, hasImpervious: true, chaoticCount: 0, untestedCount: 0 } as CrystallizingMeasure,
    cutting: { precision, cut: 'ideal-brilliant', hasHighPrecision: precision >= 60, hasAccurate: true, hasNoApproximate: true, hasExact: true, hasClean: true, hasPrecise: true, hasCorrect: true, hasSharp: true, hasCrisp: true, hasDefined: true, hasRefined: true, hasPolished: true, hasFaceted: true, hasSymmetrical: true, hasProportional: true, hasMasterful: true, approximateCount: 0, roughCount: 0 } as CuttingMeasure,
    mapping: { completeness, coverage: 'complete-atlas', hasHighCompleteness: completeness >= 60, hasDocumented: true, hasNoUndocumented: true, hasExported: true, hasNoHidden: true, hasComprehensive: true, hasThorough: true, hasComplete: true, hasCovered: true, hasDetailed: true, hasExplained: true, hasDescribed: true, hasAnnotated: true, hasIndexed: true, hasReferenced: true, hasMapped: true, undocumentedCount: 0, hiddenCount: 0 } as MappingMeasure,
    dispersing: { fire, spectrum: 'rainbow-fire', hasHighFire: fire >= 60, hasVersatile: true, hasMultiPurpose: true, hasAdaptable: true, hasFlexible: true, hasExtensible: true, hasModular: true, hasComposable: true, hasRich: true, hasDiverse: true, hasMultiFaceted: true, hasColorful: true, hasBrilliant: true, hasRadiant: true, hasLuminous: true, hasSpectral: true, rigidCount: 0, monolithicCount: 0 } as DispersingMeasure,
    navigating: { wisdom, chart: 'master-cartographer', hasHighWisdom: wisdom >= 60, hasWellArchitected: true, hasNoHacked: true, hasPrincipled: true, hasDeep: true, hasStrategic: true, hasHolistic: true, hasSystemic: true, hasProven: true, hasMature: true, hasInsightful: true, hasVisionary: true, hasComprehensive: true, hasConnected: true, hasEvolved: true, hasWise: true, hackedCount: 0, shallowCount: 0 } as NavigatingMeasure,
    condition: classifyPageCondition(qualityScore),
    qualityScore,
  }
}

function makeStats(overrides: Partial<DiamondAtlasResult['stats']> = {}): DiamondAtlasResult['stats'] {
  return {
    totalFiles: 1,
    totalVolumes: 1,
    avgHardnessClarity: 80,
    avgCutPrecision: 80,
    avgMapCompleteness: 80,
    avgFireDispersion: 80,
    avgCartographicWisdom: 80,
    diamondMasterpieceCount: 0,
    flawlessMapCount: 1,
    properGemCount: 0,
    includedStoneCount: 0,
    roughRockCount: 0,
    voidCount: 0,
    hasHighHardnessCount: 1,
    hasHighPrecisionCount: 1,
    hasHighCompletenessCount: 1,
    hasHighFireCount: 1,
    hasHighWisdomCount: 1,
    overallBrilliance: 80,
    cartographerGrade: 'diamond-cutter' as CartographerGradeType,
    bestPage: 'app.ts',
    hardest: 'app.ts',
    mostPrecise: 'app.ts',
    mostComplete: 'app.ts',
    mostBrilliant: 'app.ts',
    wisest: 'app.ts',
    ...overrides,
  }
}

// ─── measureCrystallizing ───────────────────────────────

describe('measureCrystallizing', () => {
  it('scores rich content at max', () => {
    const result = measureCrystallizing(richContent)
    expect(result.hardness).toBe(100)
    expect(result.hasHighHardness).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureCrystallizing(emptyContent).hardness).toBeLessThan(50)
  })

  it('detects chaotic patterns', () => {
    const result = measureCrystallizing('chaotic messy disorganized tangled code')
    expect(result.chaoticCount).toBeGreaterThan(0)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects untested eval/Function', () => {
    const result = measureCrystallizing('eval("code")')
    expect(result.untestedCount).toBeGreaterThan(0)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects well-structured', () => { expect(measureCrystallizing('class Foo {}').hasWellStructured).toBe(true) })
  it('penalizes any keyword', () => { expect(measureCrystallizing('const x: any').hasTypeSafe).toBe(false) })
  it('penalizes var/eval', () => { expect(measureCrystallizing('var x = eval("1")').hasNoUnsafe).toBe(false) })
  it('detects tested try/catch', () => { expect(measureCrystallizing('try { x } catch { y }').hasTested).toBe(true) })
  it('detects impervious docs', () => { expect(measureCrystallizing('/** doc */').hasImpervious).toBe(true) })
})

// ─── measureCutting ─────────────────────────────────────

describe('measureCutting', () => {
  it('scores rich content at max', () => {
    const result = measureCutting(richContent)
    expect(result.precision).toBe(100)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureCutting(emptyContent).precision).toBeLessThan(50)
  })

  it('detects approximate patterns', () => {
    const result = measureCutting('approximate rough vague fuzzy code')
    expect(result.approximateCount).toBeGreaterThan(0)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects rough patterns', () => {
    const result = measureCutting('crude clunky slapped hacked code')
    expect(result.roughCount).toBeGreaterThan(0)
  })

  it('detects accurate types', () => { expect(measureCutting('const x: string').hasAccurate).toBe(true) })
  it('penalizes any keyword', () => { expect(measureCutting('const x: any').hasCorrect).toBe(false) })
  it('detects polished docs', () => { expect(measureCutting('/** doc */').hasPolished).toBe(true) })
  it('detects faceted try/catch', () => { expect(measureCutting('try { x } catch { y }').hasFaceted).toBe(true) })
})

// ─── measureMapping ─────────────────────────────────────

describe('measureMapping', () => {
  it('scores rich content at max', () => {
    const result = measureMapping(richContent)
    expect(result.completeness).toBe(100)
    expect(result.hasHighCompleteness).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureMapping(emptyContent).completeness).toBeLessThan(50)
  })

  it('detects undocumented patterns', () => {
    const result = measureMapping('TODO FIXME HACK XXX code')
    expect(result.undocumentedCount).toBeGreaterThan(0)
    expect(result.hasNoUndocumented).toBe(false)
  })

  it('detects hidden patterns', () => {
    const result = measureMapping('hidden obscured concealed secret code')
    expect(result.hiddenCount).toBeGreaterThan(0)
    expect(result.hasNoHidden).toBe(false)
  })

  it('detects documented', () => { expect(measureMapping('/** doc */').hasDocumented).toBe(true) })
  it('detects exported', () => { expect(measureMapping('export class X {}').hasExported).toBe(true) })
  it('detects comprehensive class/interface', () => { expect(measureMapping('class Foo {}').hasComprehensive).toBe(true) })
  it('detects detailed no-any', () => { expect(measureMapping('const x: any').hasDetailed).toBe(false) })
})

// ─── measureDispersing ──────────────────────────────────

describe('measureDispersing', () => {
  it('scores rich content high', () => {
    const result = measureDispersing(richContent)
    expect(result.fire).toBeGreaterThan(90)
    expect(result.hasHighFire).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureDispersing(emptyContent).fire).toBeLessThan(50)
  })

  it('detects rigid patterns', () => {
    const result = measureDispersing('rigid inflexible brittle stiff code')
    expect(result.rigidCount).toBeGreaterThan(0)
  })

  it('detects monolithic patterns', () => {
    const result = measureDispersing('monolithic god.object mega code')
    expect(result.monolithicCount).toBeGreaterThan(0)
    expect(result.hasSpectral).toBe(false)
  })

  it('detects versatile class/interface', () => { expect(measureDispersing('class Foo {}').hasVersatile).toBe(true) })
  it('penalizes any keyword', () => { expect(measureDispersing('const x: any').hasModular).toBe(false) })
  it('detects multi-faceted docs', () => { expect(measureDispersing('/** doc */').hasMultiFaceted).toBe(true) })
})

// ─── measureNavigating ──────────────────────────────────

describe('measureNavigating', () => {
  it('scores rich content at max', () => {
    const result = measureNavigating(richContent)
    expect(result.wisdom).toBe(100)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    expect(measureNavigating(emptyContent).wisdom).toBeLessThan(50)
  })

  it('detects hacked patterns', () => {
    const result = measureNavigating('hack workaround kludge code')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects shallow patterns', () => {
    const result = measureNavigating('shallow superficial trivial code')
    expect(result.shallowCount).toBeGreaterThan(0)
  })

  it('detects well-architected', () => { expect(measureNavigating('class Foo {}').hasWellArchitected).toBe(true) })
  it('penalizes any keyword', () => { expect(measureNavigating('const x: any').hasPrincipled).toBe(false) })
  it('detects insightful docs', () => { expect(measureNavigating('/** doc */').hasInsightful).toBe(true) })
  it('detects deep types', () => { expect(measureNavigating('const x: string').hasDeep).toBe(true) })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyPageCondition', () => {
  it('returns diamond-masterpiece for 90+', () => { expect(classifyPageCondition(95)).toBe('diamond-masterpiece') })
  it('returns flawless-map for 75-89', () => { expect(classifyPageCondition(80)).toBe('flawless-map') })
  it('returns proper-gem for 60-74', () => { expect(classifyPageCondition(65)).toBe('proper-gem') })
  it('returns included-stone for 40-59', () => { expect(classifyPageCondition(50)).toBe('included-stone') })
  it('returns rough-rock for 20-39', () => { expect(classifyPageCondition(30)).toBe('rough-rock') })
  it('returns void below 20', () => { expect(classifyPageCondition(10)).toBe('void') })
})

describe('classifyVolumeType', () => {
  it('returns void for empty', () => { expect(classifyVolumeType([])).toBe('void') })
  it('returns complete-atlas for high', () => { expect(classifyVolumeType([makePage('a.ts', 90, 90, 90, 90, 90)])).toBe('complete-atlas') })
  it('returns regional-map for medium-high', () => { expect(classifyVolumeType([makePage('a.ts', 75, 75, 75, 75, 75)])).toBe('regional-map') })
  it('returns proper-chart for medium', () => { expect(classifyVolumeType([makePage('a.ts', 60, 60, 60, 60, 60)])).toBe('proper-chart') })
  it('returns single-page for low', () => { expect(classifyVolumeType([makePage('a.ts', 40, 40, 40, 40, 40)])).toBe('single-page') })
  it('returns blank-book for very low', () => { expect(classifyVolumeType([makePage('a.ts', 20, 20, 20, 20, 20)])).toBe('blank-book') })
})

describe('classifyVolumeCondition', () => {
  it('returns diamond-library for 85+', () => { expect(classifyVolumeCondition(90)).toBe('diamond-library') })
  it('returns gem-collection for 70-84', () => { expect(classifyVolumeCondition(75)).toBe('gem-collection') })
  it('returns proper-bookshelf for 55-69', () => { expect(classifyVolumeCondition(60)).toBe('proper-bookshelf') })
  it('returns pamphlet-rack for 35-54', () => { expect(classifyVolumeCondition(40)).toBe('pamphlet-rack') })
  it('returns empty-shelf for 15-34', () => { expect(classifyVolumeCondition(20)).toBe('empty-shelf') })
  it('returns void below 15', () => { expect(classifyVolumeCondition(5)).toBe('void') })
})

describe('classifyCartographerGrade', () => {
  it('returns master-gem-cutter for 80+', () => { expect(classifyCartographerGrade(85)).toBe('master-gem-cutter') })
  it('returns diamond-cutter for 65-79', () => { expect(classifyCartographerGrade(70)).toBe('diamond-cutter') })
  it('returns proper-lapidary for 50-64', () => { expect(classifyCartographerGrade(55)).toBe('proper-lapidary') })
  it('returns apprentice for 35-49', () => { expect(classifyCartographerGrade(40)).toBe('apprentice') })
  it('returns novice for 20-34', () => { expect(classifyCartographerGrade(25)).toBe('novice') })
  it('returns glass-cutter below 20', () => { expect(classifyCartographerGrade(10)).toBe('glass-cutter') })
})

// ─── analyzeDiamondPage ─────────────────────────────────

describe('analyzeDiamondPage', () => {
  it('returns full DiamondPage for rich content', () => {
    const result = analyzeDiamondPage(richContent, 'app.ts')
    expect(result.file).toBe('app.ts')
    expect(result.hardnessClarity).toBeGreaterThan(0)
    expect(result.cutPrecision).toBeGreaterThan(0)
    expect(result.mapCompleteness).toBeGreaterThan(0)
    expect(result.fireDispersion).toBeGreaterThan(0)
    expect(result.cartographicWisdom).toBeGreaterThan(0)
    expect(result.qualityScore).toBeGreaterThan(0)
    expect(result.condition).toBeDefined()
  })

  it('scores poor content low', () => {
    expect(analyzeDiamondPage(poorContent, 'bad.ts').qualityScore).toBeLessThan(50)
  })

  it('computes qualityScore as 0.2 weighted', () => {
    const result = analyzeDiamondPage(richContent, 'test.ts')
    const expected = Math.round(
      result.hardnessClarity * 0.2 + result.cutPrecision * 0.2 +
      result.mapCompleteness * 0.2 + result.fireDispersion * 0.2 + result.cartographicWisdom * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })
})

// ─── analyzeDiamondVolume ───────────────────────────────

describe('analyzeDiamondVolume', () => {
  it('returns empty volume for no pages', () => {
    const result = analyzeDiamondVolume([], 'src')
    expect(result.directory).toBe('src')
    expect(result.pages).toHaveLength(0)
    expect(result.volumeType).toBe('void')
    expect(result.condition).toBe('void')
  })

  it('aggregates page scores', () => {
    const pages = [makePage('a.ts', 80, 80, 80, 80, 80), makePage('b.ts', 60, 60, 60, 60, 60)]
    const result = analyzeDiamondVolume(pages, 'src')
    expect(result.avgHardness).toBe(70)
    expect(result.avgPrecision).toBe(70)
    expect(result.avgWisdom).toBe(70)
  })

  it('counts masterpiece and void', () => {
    const masterpiece = makePage('a.ts', 95, 95, 95, 95, 95)
    const voidP = makePage('b.ts', 5, 5, 5, 5, 5)
    const result = analyzeDiamondVolume([masterpiece, voidP], 'src')
    expect(result.diamondMasterpieceCount).toBe(1)
    expect(result.voidCount).toBe(1)
  })
})

// ─── buildDiamondAtlasResult ────────────────────────────

describe('buildDiamondAtlasResult', () => {
  it('returns valid result for single file', async () => {
    const result = await buildDiamondAtlasResult(['app.ts'], [richContent])
    expect(result.pages).toHaveLength(1)
    expect(result.volumes).toHaveLength(1)
    expect(result.cartography.overallBrilliance).toBeGreaterThan(0)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('returns zero averages for empty input', async () => {
    const result = await buildDiamondAtlasResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallBrilliance).toBe(0)
    expect(result.cartography.isDiamond).toBe(false)
  })

  it('groups files by directory', async () => {
    const result = await buildDiamondAtlasResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, moderateContent],
    )
    expect(result.volumes.length).toBe(2)
    expect(result.stats.totalVolumes).toBe(2)
  })

  it('computes cartographer grade', async () => {
    const result = await buildDiamondAtlasResult(['a.ts'], [richContent])
    expect(result.stats.cartographerGrade).toBeDefined()
    expect(result.cartography.isDiamond).toBe(result.cartography.overallBrilliance >= 60)
  })

  it('finds extremes', async () => {
    const result = await buildDiamondAtlasResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    expect(result.stats.bestPage).toBeTruthy()
    expect(result.stats.hardest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostComplete).toBeTruthy()
    expect(result.stats.mostBrilliant).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('scores rich content measures', async () => {
    const result = await buildDiamondAtlasResult(['perfect.ts'], [richContent])
    expect(result.pages[0].hardnessClarity).toBe(100)
    expect(result.pages[0].cutPrecision).toBe(100)
    expect(result.pages[0].mapCompleteness).toBe(100)
    expect(result.pages[0].fireDispersion).toBeGreaterThan(90)
    expect(result.pages[0].cartographicWisdom).toBe(100)
  })

  it('handles mixed content', async () => {
    const result = await buildDiamondAtlasResult(['good.ts', 'bad.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.pages).toHaveLength(2)
  })

  it('counts condition categories', async () => {
    const result = await buildDiamondAtlasResult(['perfect.ts'], [richContent])
    expect(result.stats.diamondMasterpieceCount + result.stats.flawlessMapCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.voidCount).toBe(0)
  })

  it('counts high measure counts', async () => {
    const result = await buildDiamondAtlasResult(['perfect.ts'], [richContent])
    expect(result.stats.hasHighHardnessCount).toBe(1)
    expect(result.stats.hasHighPrecisionCount).toBe(1)
    expect(result.stats.hasHighCompletenessCount).toBe(1)
    expect(result.stats.hasHighFireCount).toBe(1)
    expect(result.stats.hasHighWisdomCount).toBe(1)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece when all >= 90', () => {
    const pages = [makePage('a.ts', 95, 95, 95, 95, 95)]
    const stats = makeStats({ avgHardnessClarity: 95, avgCutPrecision: 95, avgMapCompleteness: 95, avgFireDispersion: 95, avgCartographicWisdom: 95, overallBrilliance: 95 })
    const recs = generateRecommendations(pages, [], { avgHardness: 95, avgPrecision: 95, avgWisdom: 95, isDiamond: true, overallBrilliance: 95 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends hardness when hardness low', () => {
    const pages = [makePage('a.ts', 50, 90, 90, 90, 90)]
    const stats = makeStats({ avgHardnessClarity: 50, avgCutPrecision: 90, avgMapCompleteness: 90, avgFireDispersion: 90, avgCartographicWisdom: 90, overallBrilliance: 82 })
    const recs = generateRecommendations(pages, [], { avgHardness: 50, avgPrecision: 90, avgWisdom: 90, isDiamond: true, overallBrilliance: 82 }, stats)
    expect(recs.some((r) => r.includes('diamond clarity'))).toBe(true)
  })

  it('recommends precision when low', () => {
    const pages = [makePage('a.ts', 90, 50, 90, 90, 90)]
    const stats = makeStats({ avgHardnessClarity: 90, avgCutPrecision: 50, avgMapCompleteness: 90, avgFireDispersion: 90, avgCartographicWisdom: 90, overallBrilliance: 82 })
    const recs = generateRecommendations(pages, [], { avgHardness: 90, avgPrecision: 50, avgWisdom: 90, isDiamond: true, overallBrilliance: 82 }, stats)
    expect(recs.some((r) => r.includes('cut precision'))).toBe(true)
  })

  it('recommends completeness when low', () => {
    const pages = [makePage('a.ts', 90, 90, 50, 90, 90)]
    const stats = makeStats({ avgHardnessClarity: 90, avgCutPrecision: 90, avgMapCompleteness: 50, avgFireDispersion: 90, avgCartographicWisdom: 90, overallBrilliance: 82 })
    const recs = generateRecommendations(pages, [], { avgHardness: 90, avgPrecision: 90, avgWisdom: 90, isDiamond: true, overallBrilliance: 82 }, stats)
    expect(recs.some((r) => r.includes('atlas maps'))).toBe(true)
  })

  it('recommends fire when low', () => {
    const pages = [makePage('a.ts', 90, 90, 90, 50, 90)]
    const stats = makeStats({ avgHardnessClarity: 90, avgCutPrecision: 90, avgMapCompleteness: 90, avgFireDispersion: 50, avgCartographicWisdom: 90, overallBrilliance: 82 })
    const recs = generateRecommendations(pages, [], { avgHardness: 90, avgPrecision: 90, avgWisdom: 90, isDiamond: true, overallBrilliance: 82 }, stats)
    expect(recs.some((r) => r.includes('fire dispersion'))).toBe(true)
  })

  it('recommends wisdom when low', () => {
    const pages = [makePage('a.ts', 90, 90, 90, 90, 50)]
    const stats = makeStats({ avgHardnessClarity: 90, avgCutPrecision: 90, avgMapCompleteness: 90, avgFireDispersion: 90, avgCartographicWisdom: 50, overallBrilliance: 82 })
    const recs = generateRecommendations(pages, [], { avgHardness: 90, avgPrecision: 90, avgWisdom: 50, isDiamond: true, overallBrilliance: 82 }, stats)
    expect(recs.some((r) => r.includes('cartographic wisdom'))).toBe(true)
  })

  it('warns about clouded when overall < 40', () => {
    const pages = [makePage('a.ts', 30, 30, 30, 30, 30)]
    const stats = makeStats({ avgHardnessClarity: 30, avgCutPrecision: 30, avgMapCompleteness: 30, avgFireDispersion: 30, avgCartographicWisdom: 30, overallBrilliance: 30 })
    const recs = generateRecommendations(pages, [], { avgHardness: 30, avgPrecision: 30, avgWisdom: 30, isDiamond: false, overallBrilliance: 30 }, stats)
    expect(recs.some((r) => r.includes('clouded'))).toBe(true)
  })

  it('lists void pages when <= 5', () => {
    const pages = [makePage('a.ts', 5, 5, 5, 5, 5), makePage('b.ts', 90, 90, 90, 90, 90)]
    const stats = makeStats({ overallBrilliance: 47 })
    const recs = generateRecommendations(pages, [], { avgHardness: 47, avgPrecision: 47, avgWisdom: 47, isDiamond: false, overallBrilliance: 47 }, stats)
    expect(recs.some((r) => r.includes('a.ts'))).toBe(true)
  })

  it('warns about many rough rocks', () => {
    const pages = Array.from({ length: 6 }, (_, i) => makePage(`${i}.ts`, 5, 5, 5, 5, 5))
    const stats = makeStats({ overallBrilliance: 5, voidCount: 6 })
    const recs = generateRecommendations(pages, [], { avgHardness: 5, avgPrecision: 5, avgWisdom: 5, isDiamond: false, overallBrilliance: 5 }, stats)
    expect(recs.some((r) => r.includes('6 rough rocks'))).toBe(true)
  })

  it('warns about all empty shelves', () => {
    const pages = [makePage('a.ts', 5, 5, 5, 5, 5)]
    const volumes = [{ directory: 'src', pages, avgHardness: 5, avgPrecision: 5, avgWisdom: 5, diamondMasterpieceCount: 0, voidCount: 1, volumeType: 'blank-book' as VolumeTypeType, condition: 'void' as VolumeConditionType }]
    const stats = makeStats({ overallBrilliance: 5 })
    const recs = generateRecommendations(pages, volumes, { avgHardness: 5, avgPrecision: 5, avgWisdom: 5, isDiamond: false, overallBrilliance: 5 }, stats)
    expect(recs.some((r) => r.includes('All volumes are empty shelves'))).toBe(true)
  })

  it('returns positive when scores are good', () => {
    const pages = [makePage('a.ts', 80, 80, 80, 80, 80)]
    const stats = makeStats({ overallBrilliance: 80 })
    const recs = generateRecommendations(pages, [], { avgHardness: 80, avgPrecision: 80, avgWisdom: 80, isDiamond: true, overallBrilliance: 80 }, stats)
    expect(recs.some((r) => r.includes('cartographic brilliance'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for high score', () => { expect(typeof colorScore(95)).toBe('string') })
  it('returns string for low score', () => { expect(typeof colorScore(5)).toBe('string') })
  it('returns string for mid score', () => { expect(typeof colorScore(50)).toBe('string') })
})

describe('colorVolumeCondition', () => {
  it('colors diamond-library', () => { expect(typeof colorVolumeCondition('diamond-library')).toBe('string') })
  it('colors void', () => { expect(typeof colorVolumeCondition('void')).toBe('string') })
  it('colors unknown', () => { expect(typeof colorVolumeCondition('unknown')).toBe('string') })
})

describe('formatPageTable', () => {
  it('formats single page', () => {
    const page = makePage('app.ts', 80, 80, 80, 80, 80)
    const result = formatPageTable(page)
    expect(result).toContain('Diamond Page: app.ts')
    expect(result).toContain('Hardness Clarity')
    expect(result).toContain('Quality Score')
  })
})

describe('formatPagesTable', () => {
  it('returns no-pages message for empty', () => { expect(formatPagesTable([])).toContain('No diamond pages') })
  it('formats multiple pages', () => {
    const pages = [makePage('a.ts', 80, 80, 80, 80, 80), makePage('b.ts', 60, 60, 60, 60, 60)]
    const result = formatPagesTable(pages)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatVolumeTable', () => {
  it('formats single volume', () => {
    const volume: DiamondVolumeType = { directory: 'src', pages: [], avgHardness: 80, avgPrecision: 80, avgWisdom: 80, diamondMasterpieceCount: 1, voidCount: 0, volumeType: 'complete-atlas', condition: 'diamond-library' }
    const result = formatVolumeTable(volume)
    expect(result).toContain('Diamond Volume: src')
    expect(result).toContain('Masterpieces')
  })
})

describe('formatVolumesTable', () => {
  it('returns no-volumes for empty', () => { expect(formatVolumesTable([])).toContain('No diamond volumes') })
  it('formats multiple volumes', () => {
    const volumes = [
      { directory: 'src', pages: [], avgHardness: 80, avgPrecision: 80, avgWisdom: 80, diamondMasterpieceCount: 0, voidCount: 0, volumeType: 'regional-map' as VolumeTypeType, condition: 'gem-collection' as VolumeConditionType },
      { directory: 'lib', pages: [], avgHardness: 50, avgPrecision: 50, avgWisdom: 50, diamondMasterpieceCount: 0, voidCount: 0, volumeType: 'proper-chart' as VolumeTypeType, condition: 'proper-bookshelf' as VolumeConditionType },
    ]
    const result = formatVolumesTable(volumes)
    expect(result).toContain('src')
    expect(result).toContain('lib')
  })
})

describe('formatStatsTable', () => {
  it('formats all stats', () => {
    const stats = makeStats()
    const result = formatStatsTable(stats)
    expect(result).toContain('Diamond Atlas Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Cartographer Grade')
    expect(result).toContain('Best Page')
  })
})

describe('formatRecommendations', () => {
  it('returns no-recs for empty', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recommendations', () => {
    expect(formatRecommendations(['Fix X', 'Improve Y'])).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildDiamondAtlasResult(['app.ts'], [richContent])
    const table = formatResultTable(result)
    expect(table).toContain('Diamond Atlas Analysis')
    expect(table).toContain('Cartography Overview')
    expect(table).toContain('Diamond Atlas Statistics')
    expect(table).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildDiamondAtlasResult(['app.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.pages).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
