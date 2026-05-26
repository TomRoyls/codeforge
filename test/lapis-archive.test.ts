import { describe, expect, it } from 'vitest'

import {
  analyzeLapisCollection,
  analyzeLapisTablet,
  buildLapisArchiveResult,
  classifyArchivistGrade,
  classifyCollectionCondition,
  classifyCollectionType,
  classifyLapisCondition,
  generateRecommendations,
  measureIlluminating,
  measureKnowing,
  measurePreserving,
  measureRecording,
  measureSurviving,
} from '../src/commands/lapis-archive-helpers.js'
import type { LapisArchiveResult } from '../src/commands/lapis-archive-helpers.js'
import {
  colorArchivistGrade,
  colorCollectionCondition,
  colorCollectionType,
  colorLapisCondition,
  colorScore,
  formatCollectionsTable,
  formatCollectionTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
  formatTabletsTable,
  formatTabletTable,
} from '../src/commands/lapis-archive-format-helpers.js'

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
const minimalContent = 'const x = 1'

const richClr = measureIlluminating(richContent).clarity
const richPrec = measureRecording(richContent).precision
const richEnd = measurePreserving(richContent).endurance
const richRes = measureSurviving(richContent).resilience
const richWis = measureKnowing(richContent).wisdom

function makeStats(overrides: Partial<LapisArchiveResult['stats']> = {}): LapisArchiveResult['stats'] {
  return {
    totalFiles: 1,
    totalCollections: 1,
    avgCelestialBlueClarity: 50,
    avgHistoricalPrecision: 50,
    avgPigmentEndurance: 50,
    avgTabletResilience: 50,
    avgAncientWisdom: 50,
    lapisMasterpieceCount: 0,
    ultramarineGemCount: 0,
    properLapisCount: 0,
    dyedStoneCount: 0,
    blueGlassCount: 0,
    voidCount: 0,
    hasHighClarityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighEnduranceCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallPreservation: 50,
    archivistGrade: 'proper-librarian',
    bestTablet: 'a.ts',
    clearest: 'a.ts',
    mostPrecise: 'a.ts',
    mostEnduring: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureIlluminating ────────────────────────────────

describe('measureIlluminating', () => {
  it('scores rich content highly', () => {
    const result = measureIlluminating(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureIlluminating(emptyContent).clarity).toBeLessThan(richClr)
  })

  it('detects hasReadable (class/interface/type)', () => {
    expect(measureIlluminating(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureIlluminating(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureIlluminating(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects hasSelfDocumenting (type annotations)', () => {
    expect(measureIlluminating(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects hasTransparent (no any)', () => {
    expect(measureIlluminating(richContent).hasTransparent).toBe(true)
  })

  it('detects hasClear (import/export)', () => {
    expect(measureIlluminating(richContent).hasClear).toBe(true)
  })

  it('detects hasOpen (JSDoc)', () => {
    expect(measureIlluminating(richContent).hasOpen).toBe(true)
  })

  it('detects hasObvious (no hack/workaround/kludge)', () => {
    expect(measureIlluminating(richContent).hasObvious).toBe(true)
  })

  it('detects hasVisible (async/await/Promise)', () => {
    expect(measureIlluminating(richContent).hasVisible).toBe(true)
  })

  it('detects hasDirect (function/arrow/return)', () => {
    expect(measureIlluminating(richContent).hasDirect).toBe(true)
  })

  it('classifies blue correctly for high scores', () => {
    const result = measureIlluminating(richContent)
    expect(['ultramarine-pure', 'lapis-bright', 'proper-blue']).toContain(result.blue)
  })

  it('classifies blue correctly for low scores', () => {
    expect(measureIlluminating(emptyContent).blue).not.toBe('ultramarine-pure')
  })
})

// ─── measureRecording ───────────────────────────────────

describe('measureRecording', () => {
  it('scores rich content highly', () => {
    const result = measureRecording(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureRecording(emptyContent).precision).toBeLessThan(richPrec)
  })

  it('detects hasTypeSafe (no any)', () => {
    expect(measureRecording(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureRecording(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const imprecise = 3; const loose = 4; const sloppy = 5'
    const result = measureRecording(content)
    expect(result.approximateCount).toBe(5)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects hasExact (class/interface/type)', () => {
    expect(measureRecording(richContent).hasExact).toBe(true)
  })

  it('detects hasVerbatim (async/await/Promise)', () => {
    expect(measureRecording(richContent).hasVerbatim).toBe(true)
  })

  it('detects hasAuthentic (try/catch/if)', () => {
    expect(measureRecording(richContent).hasAuthentic).toBe(true)
  })

  it('detects hasSharp (readonly/private/protected)', () => {
    expect(measureRecording(richContent).hasSharp).toBe(true)
  })

  it('detects hasCrisp (JSDoc)', () => {
    expect(measureRecording(richContent).hasCrisp).toBe(true)
  })

  it('classifies record correctly for high scores', () => {
    const result = measureRecording(richContent)
    expect(['royal-decree', 'temple-record', 'proper-tablet']).toContain(result.record)
  })

  it('classifies record correctly for low scores', () => {
    expect(measureRecording(emptyContent).record).not.toBe('royal-decree')
  })
})

// ─── measurePreserving ──────────────────────────────────

describe('measurePreserving', () => {
  it('scores rich content highly', () => {
    const result = measurePreserving(richContent)
    expect(result.endurance).toBeGreaterThan(60)
    expect(result.hasHighEndurance).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measurePreserving(emptyContent).endurance).toBeLessThan(richEnd)
  })

  it('detects hasClean (class/interface/type)', () => {
    expect(measurePreserving(richContent).hasClean).toBe(true)
  })

  it('counts hack keywords', () => {
    const content = 'const hack = 1; const todo = 2; const fixme = 3; const xxx = 4'
    const result = measurePreserving(content)
    expect(result.hackCount).toBe(4)
    expect(result.hasNoHack).toBe(false)
  })

  it('counts workaround keywords', () => {
    const content = 'const workaround = 1; const kludge = 2; const temp = 3; const temporary = 4'
    const result = measurePreserving(content)
    expect(result.workaroundCount).toBe(4)
    expect(result.hasNoWorkaround).toBe(false)
  })

  it('detects hasNoTodo', () => {
    expect(measurePreserving(richContent).hasNoTodo).toBe(true)
  })

  it('detects hasNoCommentedOut', () => {
    expect(measurePreserving(richContent).hasNoCommentedOut).toBe(true)
  })

  it('detects hasNoDebugCode', () => {
    expect(measurePreserving(richContent).hasNoDebugCode).toBe(true)
  })

  it('detects hasPristine (import/export)', () => {
    expect(measurePreserving(richContent).hasPristine).toBe(true)
  })

  it('detects hasEnduring (try/catch/if)', () => {
    expect(measurePreserving(richContent).hasEnduring).toBe(true)
  })

  it('classifies color correctly for high scores', () => {
    const result = measurePreserving(richContent)
    expect(['eternal-ultramarine', 'lasting-blue', 'proper-pigment']).toContain(result.color)
  })

  it('classifies color correctly for low scores', () => {
    expect(measurePreserving(emptyContent).color).not.toBe('eternal-ultramarine')
  })
})

// ─── measureSurviving ───────────────────────────────────

describe('measureSurviving', () => {
  it('scores rich content highly', () => {
    const result = measureSurviving(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureSurviving(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects hasErrorHandled (try/catch)', () => {
    expect(measureSurviving(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const unprocessed = 3; const unresolved = 4'
    const result = measureSurviving(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureSurviving(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects hasRobust (class/interface/type)', () => {
    expect(measureSurviving(richContent).hasRobust).toBe(true)
  })

  it('detects hasDurable (no any)', () => {
    expect(measureSurviving(richContent).hasDurable).toBe(true)
  })

  it('detects hasImmortal (async/await/Promise)', () => {
    expect(measureSurviving(richContent).hasImmortal).toBe(true)
  })

  it('classifies stone correctly for high scores', () => {
    const result = measureSurviving(richContent)
    expect(['baked-clay', 'hardened-tablet', 'proper-cuneiform']).toContain(result.stone)
  })

  it('classifies stone correctly for low scores', () => {
    expect(measureSurviving(emptyContent).stone).not.toBe('baked-clay')
  })
})

// ─── measureKnowing ─────────────────────────────────────

describe('measureKnowing', () => {
  it('scores rich content highly', () => {
    const result = measureKnowing(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureKnowing(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects hasWellArchitected (class/interface/type)', () => {
    expect(measureKnowing(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureKnowing(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureKnowing(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects hasPrincipled (no any)', () => {
    expect(measureKnowing(richContent).hasPrincipled).toBe(true)
  })

  it('detects hasDeep (type annotations)', () => {
    expect(measureKnowing(richContent).hasDeep).toBe(true)
  })

  it('detects hasInsightful (JSDoc)', () => {
    expect(measureKnowing(richContent).hasInsightful).toBe(true)
  })

  it('detects hasComprehensive (try/catch/if)', () => {
    expect(measureKnowing(richContent).hasComprehensive).toBe(true)
  })

  it('detects hasVenerable (function/arrow/return)', () => {
    expect(measureKnowing(richContent).hasVenerable).toBe(true)
  })

  it('classifies archive correctly for high scores', () => {
    const result = measureKnowing(richContent)
    expect(['library-of-ashurbanipal', 'house-of-tablets', 'proper-archive']).toContain(result.archive)
  })

  it('classifies archive correctly for low scores', () => {
    expect(measureKnowing(emptyContent).archive).not.toBe('library-of-ashurbanipal')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyLapisCondition', () => {
  it('returns lapis-masterpiece for 90+', () => {
    expect(classifyLapisCondition(90)).toBe('lapis-masterpiece')
    expect(classifyLapisCondition(95)).toBe('lapis-masterpiece')
  })

  it('returns ultramarine-gem for 75-89', () => {
    expect(classifyLapisCondition(75)).toBe('ultramarine-gem')
  })

  it('returns proper-lapis for 60-74', () => {
    expect(classifyLapisCondition(60)).toBe('proper-lapis')
  })

  it('returns dyed-stone for 40-59', () => {
    expect(classifyLapisCondition(40)).toBe('dyed-stone')
  })

  it('returns blue-glass for 20-39', () => {
    expect(classifyLapisCondition(20)).toBe('blue-glass')
  })

  it('returns void below 20', () => {
    expect(classifyLapisCondition(0)).toBe('void')
    expect(classifyLapisCondition(10)).toBe('void')
  })
})

describe('classifyCollectionType', () => {
  it('returns no-collection for empty tablets', () => {
    expect(classifyCollectionType([])).toBe('no-collection')
  })

  it('returns royal-archive for avg >= 85', () => {
    const tablets = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyCollectionType(tablets)).toBe('royal-archive')
  })

  it('returns empty-shelf for low avg', () => {
    const tablets = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyCollectionType(tablets)).toBe('empty-shelf')
  })
})

describe('classifyCollectionCondition', () => {
  it('returns lapis-palace for 85+', () => {
    expect(classifyCollectionCondition(85)).toBe('lapis-palace')
  })

  it('returns void below 15', () => {
    expect(classifyCollectionCondition(5)).toBe('void')
  })
})

describe('classifyArchivistGrade', () => {
  it('returns master-archivist for 80+', () => {
    expect(classifyArchivistGrade(80)).toBe('master-archivist')
  })

  it('returns scroll-thief below 20', () => {
    expect(classifyArchivistGrade(5)).toBe('scroll-thief')
  })

  it('returns royal-scribe for 65-79', () => {
    expect(classifyArchivistGrade(65)).toBe('royal-scribe')
  })

  it('returns proper-librarian for 50-64', () => {
    expect(classifyArchivistGrade(50)).toBe('proper-librarian')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyArchivistGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyArchivistGrade(20)).toBe('novice')
  })
})

// ─── analyzeLapisTablet ─────────────────────────────────

describe('analyzeLapisTablet', () => {
  it('creates a tablet with all 5 measures', () => {
    const tablet = analyzeLapisTablet(richContent, 'app.ts')
    expect(tablet.file).toBe('app.ts')
    expect(typeof tablet.celestialBlueClarity).toBe('number')
    expect(typeof tablet.historicalPrecision).toBe('number')
    expect(typeof tablet.pigmentEndurance).toBe('number')
    expect(typeof tablet.tabletResilience).toBe('number')
    expect(typeof tablet.ancientWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const tablet = analyzeLapisTablet(richContent, 'app.ts')
    const expected = Math.round(
      tablet.celestialBlueClarity * 0.2 +
      tablet.historicalPrecision * 0.2 +
      tablet.pigmentEndurance * 0.2 +
      tablet.tabletResilience * 0.2 +
      tablet.ancientWisdom * 0.2,
    )
    expect(tablet.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const tablet = analyzeLapisTablet(richContent, 'app.ts')
    expect(tablet.condition).toBe(classifyLapisCondition(tablet.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richTablet = analyzeLapisTablet(richContent, 'rich.ts')
    const emptyTablet = analyzeLapisTablet(emptyContent, 'empty.ts')
    expect(richTablet.qualityScore).toBeGreaterThan(emptyTablet.qualityScore)
  })
})

// ─── analyzeLapisCollection ─────────────────────────────

describe('analyzeLapisCollection', () => {
  it('returns empty collection for no tablets', () => {
    const collection = analyzeLapisCollection([], 'src')
    expect(collection.directory).toBe('src')
    expect(collection.tablets).toEqual([])
    expect(collection.collectionType).toBe('no-collection')
    expect(collection.condition).toBe('void')
  })

  it('computes averages from tablets', () => {
    const tablets = [analyzeLapisTablet(richContent, 'a.ts'), analyzeLapisTablet(richContent, 'b.ts')]
    const collection = analyzeLapisCollection(tablets, 'src')
    expect(collection.avgClarity).toBeGreaterThan(0)
    expect(collection.avgPrecision).toBeGreaterThan(0)
    expect(collection.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildLapisArchiveResult ────────────────────────────

describe('buildLapisArchiveResult', () => {
  it('returns full result structure', async () => {
    const result = await buildLapisArchiveResult(['a.ts'], [richContent])
    expect(result.tablets).toHaveLength(1)
    expect(result.collections).toHaveLength(1)
    expect(result.library).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into collections', async () => {
    const result = await buildLapisArchiveResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.collections.length).toBe(2)
  })

  it('computes library overview', async () => {
    const result = await buildLapisArchiveResult(['a.ts'], [richContent])
    expect(result.library.avgClarity).toBeGreaterThan(0)
    expect(result.library.isLapis).toBe(true)
    expect(result.library.overallPreservation).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildLapisArchiveResult([], [])
    expect(result.tablets).toHaveLength(0)
    expect(result.collections).toHaveLength(0)
    expect(result.library.overallPreservation).toBe(0)
    expect(result.library.isLapis).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildLapisArchiveResult(['a.ts'], [richContent])
    const total = result.stats.lapisMasterpieceCount +
      result.stats.ultramarineGemCount +
      result.stats.properLapisCount +
      result.stats.dyedStoneCount +
      result.stats.blueGlassCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildLapisArchiveResult(['a.ts'], [richContent])
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighEnduranceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best tablet and top performers', async () => {
    const result = await buildLapisArchiveResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestTablet).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostEnduring).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes archivist grade from overall preservation', async () => {
    const result = await buildLapisArchiveResult(['a.ts'], [richContent])
    expect(result.stats.archivistGrade).toBe(classifyArchivistGrade(result.stats.overallPreservation))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgCelestialBlueClarity: 90,
      avgHistoricalPrecision: 90,
      avgPigmentEndurance: 90,
      avgTabletResilience: 90,
      avgAncientWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 90, avgWisdom: 90, isLapis: true, overallPreservation: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('lapis masterpiece')
  })

  it('recommends clarity when < 60', () => {
    const stats = makeStats({ avgCelestialBlueClarity: 50 })
    const result = generateRecommendations([], [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isLapis: false, overallPreservation: 50 }, stats)
    expect(result.some((r) => r.includes('celestial blue clarity') || r.includes('ultramarine-pure'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgHistoricalPrecision: 50 })
    const result = generateRecommendations([], [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isLapis: false, overallPreservation: 50 }, stats)
    expect(result.some((r) => r.includes('historical precision') || r.includes('royal-decree'))).toBe(true)
  })

  it('recommends endurance when < 60', () => {
    const stats = makeStats({ avgPigmentEndurance: 50 })
    const result = generateRecommendations([], [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isLapis: false, overallPreservation: 50 }, stats)
    expect(result.some((r) => r.includes('pigment endurance') || r.includes('eternal-ultramarine'))).toBe(true)
  })

  it('recommends resilience when < 60', () => {
    const stats = makeStats({ avgTabletResilience: 50 })
    const result = generateRecommendations([], [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isLapis: false, overallPreservation: 50 }, stats)
    expect(result.some((r) => r.includes('tablet resilience') || r.includes('baked-clay'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgAncientWisdom: 50 })
    const result = generateRecommendations([], [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isLapis: false, overallPreservation: 50 }, stats)
    expect(result.some((r) => r.includes('ancient wisdom') || r.includes('library-of-ashurbanipal'))).toBe(true)
  })

  it('warns about crumbled archive when overallPreservation < 40', () => {
    const stats = makeStats({ overallPreservation: 30 })
    const result = generateRecommendations([], [], { avgClarity: 30, avgPrecision: 30, avgWisdom: 30, isLapis: false, overallPreservation: 30 }, stats)
    expect(result.some((r) => r.includes('crumbled'))).toBe(true)
  })

  it('lists void tablets by name when <= 5', () => {
    const tablets = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(tablets, [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isLapis: false, overallPreservation: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void tablets when > 5', () => {
    const tablets = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(tablets, [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isLapis: false, overallPreservation: 50 }, stats)
    expect(result.some((r) => r.includes('6 blue glass fragments'))).toBe(true)
  })

  it('warns when all collections are poor', () => {
    const collections = [{ condition: 'void' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], collections as Array<{ condition: string }>, { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isLapis: false, overallPreservation: 50 }, stats)
    expect(result.some((r) => r.includes('dusty corners'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgCelestialBlueClarity: 70,
      avgHistoricalPrecision: 70,
      avgPigmentEndurance: 70,
      avgTabletResilience: 70,
      avgAncientWisdom: 70,
      overallPreservation: 70,
    })
    const result = generateRecommendations([], [], { avgClarity: 70, avgPrecision: 70, avgWisdom: 70, isLapis: true, overallPreservation: 70 }, stats)
    expect(result.some((r) => r.includes('ultramarine brilliance'))).toBe(true)
  })
})

// ─── Format helpers ──────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns different colors for different ranges', () => {
    expect(colorScore(95)).not.toBe(colorScore(10))
  })
})

describe('colorLapisCondition', () => {
  it('colors lapis-masterpiece', () => {
    expect(typeof colorLapisCondition('lapis-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorLapisCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorLapisCondition('unknown')).toBe('string')
  })
})

describe('colorCollectionType', () => {
  it('colors royal-archive', () => {
    expect(typeof colorCollectionType('royal-archive')).toBe('string')
  })

  it('colors no-collection', () => {
    expect(typeof colorCollectionType('no-collection')).toBe('string')
  })
})

describe('colorCollectionCondition', () => {
  it('colors lapis-palace', () => {
    expect(typeof colorCollectionCondition('lapis-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorCollectionCondition('void')).toBe('string')
  })
})

describe('colorArchivistGrade', () => {
  it('colors master-archivist', () => {
    expect(typeof colorArchivistGrade('master-archivist')).toBe('string')
  })

  it('colors scroll-thief', () => {
    expect(typeof colorArchivistGrade('scroll-thief')).toBe('string')
  })
})

describe('formatTabletTable', () => {
  it('formats a tablet with all measures', () => {
    const tablet = analyzeLapisTablet(richContent, 'app.ts')
    const output = formatTabletTable(tablet)
    expect(output).toContain('Lapis Tablet: app.ts')
    expect(output).toContain('Celestial Blue Clarity')
    expect(output).toContain('Historical Precision')
    expect(output).toContain('Pigment Endurance')
    expect(output).toContain('Tablet Resilience')
    expect(output).toContain('Ancient Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatTabletsTable', () => {
  it('shows no tablets message for empty array', () => {
    expect(formatTabletsTable([])).toContain('No lapis tablets')
  })

  it('lists tablets in output', () => {
    const tablets = [analyzeLapisTablet(richContent, 'a.ts')]
    expect(formatTabletsTable(tablets)).toContain('a.ts')
  })
})

describe('formatCollectionTable', () => {
  it('formats a collection with all fields', () => {
    const tablets = [analyzeLapisTablet(richContent, 'a.ts')]
    const collection = analyzeLapisCollection(tablets, 'src')
    const output = formatCollectionTable(collection)
    expect(output).toContain('Lapis Collection: src')
    expect(output).toContain('Tablets')
    expect(output).toContain('Avg Clarity')
  })
})

describe('formatCollectionsTable', () => {
  it('shows no collections message for empty array', () => {
    expect(formatCollectionsTable([])).toContain('No lapis collections')
  })

  it('lists collections in output', () => {
    const tablets = [analyzeLapisTablet(richContent, 'a.ts')]
    const collection = analyzeLapisCollection(tablets, 'src')
    expect(formatCollectionsTable([collection])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildLapisArchiveResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Lapis Archive Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Archivist Grade')
    expect(output).toContain('Best Tablet')
  })
})

describe('formatRecommendations', () => {
  it('shows no recommendations message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('lists recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Fix Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildLapisArchiveResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Lapis Archive Analysis')
    expect(output).toContain('Library Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildLapisArchiveResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.tablets).toHaveLength(1)
    expect(parsed.library).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
