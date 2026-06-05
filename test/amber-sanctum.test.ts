import { describe, expect, it } from 'vitest'

import {
  analyzeAmberCollection,
  analyzeAmberSpecimen,
  buildAmberSanctumResult,
  classifyCollectionCondition,
  classifyCollectionType,
  classifyCuratorGrade,
  classifySpecimenCondition,
  generateRecommendations,
  measureFortifying,
  measureKnowing,
  measurePreserving,
  measureRevealing,
  measureSheltering,
} from '../src/commands/amber-sanctum-helpers.js'
import type { AmberSanctumResult, AmberSpecimen } from '../src/commands/amber-sanctum-helpers.js'
import {
  colorCondition,
  colorScore,
  formatCollectionsTable,
  formatCollectionTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatSpecimensTable,
  formatSpecimenTable,
  formatStatsTable,
} from '../src/commands/amber-sanctum-format-helpers.js'

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

function makeStats(overrides: Partial<AmberSanctumResult['stats']> = {}): AmberSanctumResult['stats'] {
  return {
    totalFiles: 1,
    totalCollections: 1,
    avgPreservationPower: 90,
    avgGoldenSanctuary: 90,
    avgResinFortitude: 90,
    avgAmberClarity: 90,
    avgAncientWisdom: 90,
    amberMasterpieceCount: 1,
    goldenSpecimenCount: 0,
    properAmberCount: 0,
    cloudyResinCount: 0,
    rawSapCount: 0,
    voidCount: 0,
    hasHighPowerCount: 1,
    hasHighSanctuaryCount: 1,
    hasHighFortitudeCount: 1,
    hasHighClarityCount: 1,
    hasHighWisdomCount: 1,
    overallPreservation: 90,
    curatorGrade: 'master-curator',
    bestSpecimen: 'a.ts',
    mostPreserved: 'a.ts',
    safest: 'a.ts',
    toughest: 'a.ts',
    clearest: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measurePreserving ──────────────────────────────────

describe('measurePreserving', () => {
  it('scores rich content highly', () => {
    const result = measurePreserving(richContent)
    expect(result.power).toBeGreaterThan(60)
    expect(result.hasStable).toBe(true)
    expect(result.hasMaintainable).toBe(true)
    expect(result.hasPreserved).toBe(true)
    expect(result.hasDocumented).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measurePreserving(emptyContent)
    expect(result.power).toBeLessThan(55)
    expect(result.fragileCount).toBe(0)
    expect(result.volatileCount).toBe(0)
  })

  it('detects fragile patterns', () => {
    const result = measurePreserving('const fragile = true; const brittle = true')
    expect(result.hasNoFragile).toBe(false)
    expect(result.fragileCount).toBeGreaterThan(0)
  })

  it('detects volatile patterns', () => {
    const result = measurePreserving('const volatile = true; const transient = true')
    expect(result.hasNoVolatile).toBe(false)
    expect(result.volatileCount).toBeGreaterThan(0)
  })

  it('classifies fossil correctly', () => {
    const high = measurePreserving(richContent)
    expect(['perfect-preservation', 'excellent-specimen', 'proper-amber']).toContain(high.fossil)
  })
})

// ─── measureSheltering ──────────────────────────────────

describe('measureSheltering', () => {
  it('scores rich content highly', () => {
    const result = measureSheltering(richContent)
    expect(result.sanctuary).toBeGreaterThan(60)
    expect(result.hasErrorHandled).toBe(true)
    expect(result.hasDefensive).toBe(true)
    expect(result.hasFortified).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureSheltering(emptyContent)
    expect(result.sanctuary).toBeLessThan(55)
    expect(result.unhandledCount).toBe(0)
    expect(result.vulnerableCount).toBe(0)
  })

  it('detects unhandled patterns', () => {
    const result = measureSheltering('const unsafe = true; const unchecked = true')
    expect(result.hasNoUnhandled).toBe(false)
    expect(result.unhandledCount).toBeGreaterThan(0)
  })

  it('detects vulnerable patterns', () => {
    const result = measureSheltering('eval("test"); Function("x")')
    expect(result.hasNoVulnerable).toBe(false)
    expect(result.vulnerableCount).toBeGreaterThan(0)
  })

  it('classifies haven correctly', () => {
    const high = measureSheltering(richContent)
    expect(['golden-vault', 'safe-temple', 'proper-shrine']).toContain(high.haven)
  })
})

// ─── measureFortifying ──────────────────────────────────

describe('measureFortifying', () => {
  it('scores rich content highly', () => {
    const result = measureFortifying(richContent)
    expect(result.fortitude).toBeGreaterThan(60)
    expect(result.hasWellStructured).toBe(true)
    expect(result.hasTypeSafe).toBe(true)
    expect(result.hasSolid).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureFortifying(emptyContent)
    expect(result.fortitude).toBeLessThan(55)
    expect(result.chaoticCount).toBe(0)
    expect(result.unsafeCount).toBe(0)
  })

  it('detects chaotic patterns', () => {
    const result = measureFortifying('const chaotic = true; const messy = true')
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects unsafe patterns', () => {
    const result = measureFortifying('var x = 1; eval("test")')
    expect(result.hasNoUnsafe).toBe(false)
    expect(result.unsafeCount).toBeGreaterThan(0)
  })
})

// ─── measureRevealing ───────────────────────────────────

describe('measureRevealing', () => {
  it('scores rich content highly', () => {
    const result = measureRevealing(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasReadable).toBe(true)
    expect(result.hasSelfDocumenting).toBe(true)
    expect(result.hasVisible).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureRevealing(emptyContent)
    expect(result.clarity).toBeLessThan(55)
    expect(result.crypticCount).toBe(0)
    expect(result.mysteryCount).toBe(0)
  })

  it('detects cryptic patterns', () => {
    const result = measureRevealing('const cryptic = true; const mysterious = true')
    expect(result.hasNoCryptic).toBe(false)
  })

  it('classifies transparency correctly', () => {
    const high = measureRevealing(richContent)
    expect(['crystal-clear', 'golden-clarity', 'proper-transparency']).toContain(high.transparency)
  })
})

// ─── measureKnowing ─────────────────────────────────────

describe('measureKnowing', () => {
  it('scores rich content highly', () => {
    const result = measureKnowing(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasWellArchitected).toBe(true)
    expect(result.hasPrincipled).toBe(true)
    expect(result.hasMature).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureKnowing(emptyContent)
    expect(result.wisdom).toBeLessThan(55)
    expect(result.hackedCount).toBe(0)
    expect(result.shallowCount).toBe(0)
  })

  it('detects hacked patterns', () => {
    const result = measureKnowing('const hack = true; const workaround = true')
    expect(result.hasNoHacked).toBe(false)
    expect(result.hackedCount).toBeGreaterThan(0)
  })

  it('classifies epoch correctly', () => {
    const high = measureKnowing(richContent)
    expect(['primordial-sage', 'ancient-scholar', 'proper-elder']).toContain(high.epoch)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifySpecimenCondition', () => {
  it('classifies amber-masterpiece at 90+', () => {
    expect(classifySpecimenCondition(90)).toBe('amber-masterpiece')
    expect(classifySpecimenCondition(100)).toBe('amber-masterpiece')
  })

  it('classifies golden-specimen at 75-89', () => {
    expect(classifySpecimenCondition(75)).toBe('golden-specimen')
    expect(classifySpecimenCondition(89)).toBe('golden-specimen')
  })

  it('classifies proper-amber at 60-74', () => {
    expect(classifySpecimenCondition(60)).toBe('proper-amber')
  })

  it('classifies cloudy-resin at 40-59', () => {
    expect(classifySpecimenCondition(40)).toBe('cloudy-resin')
  })

  it('classifies raw-sap at 20-39', () => {
    expect(classifySpecimenCondition(20)).toBe('raw-sap')
  })

  it('classifies void below 20', () => {
    expect(classifySpecimenCondition(0)).toBe('void')
  })
})

describe('classifyCollectionType', () => {
  it('returns no-collection for empty array', () => {
    expect(classifyCollectionType([])).toBe('no-collection')
  })

  it('classifies museum-grade for high avg', () => {
    const specimens = [{ qualityScore: 90 }, { qualityScore: 90 }].map((q) => ({ qualityScore: q.qualityScore } as AmberSpecimen))
    expect(classifyCollectionType(specimens)).toBe('museum-grade')
  })

  it('classifies empty-case for low avg', () => {
    const specimens = [{ qualityScore: 10 }, { qualityScore: 10 }].map((q) => ({ qualityScore: q.qualityScore } as AmberSpecimen))
    expect(classifyCollectionType(specimens)).toBe('empty-case')
  })
})

describe('classifyCollectionCondition', () => {
  it('classifies golden-palace at 85+', () => {
    expect(classifyCollectionCondition(85)).toBe('golden-palace')
  })

  it('classifies amber-vault at 70-84', () => {
    expect(classifyCollectionCondition(70)).toBe('amber-vault')
  })

  it('classifies void below 15', () => {
    expect(classifyCollectionCondition(0)).toBe('void')
  })
})

describe('classifyCuratorGrade', () => {
  it('classifies master-curator at 80+', () => {
    expect(classifyCuratorGrade(80)).toBe('master-curator')
  })

  it('classifies expert-collector at 65-79', () => {
    expect(classifyCuratorGrade(65)).toBe('expert-collector')
  })

  it('classifies casual-finder below 20', () => {
    expect(classifyCuratorGrade(0)).toBe('casual-finder')
  })
})

// ─── analyzeAmberSpecimen ───────────────────────────────

describe('analyzeAmberSpecimen', () => {
  it('returns complete specimen for rich content', () => {
    const specimen = analyzeAmberSpecimen(richContent, 'app.ts')
    expect(specimen.file).toBe('app.ts')
    expect(specimen.preservationPower).toBeGreaterThan(0)
    expect(specimen.goldenSanctuary).toBeGreaterThan(0)
    expect(specimen.resinFortitude).toBeGreaterThan(0)
    expect(specimen.amberClarity).toBeGreaterThan(0)
    expect(specimen.ancientWisdom).toBeGreaterThan(0)
    expect(specimen.qualityScore).toBeGreaterThan(0)
    expect(specimen.condition).toBeDefined()
    expect(specimen.preserving).toBeDefined()
    expect(specimen.sheltering).toBeDefined()
    expect(specimen.fortifying).toBeDefined()
    expect(specimen.revealing).toBeDefined()
    expect(specimen.knowing).toBeDefined()
  })

  it('computes qualityScore as weighted average', () => {
    const specimen = analyzeAmberSpecimen(richContent, 'test.ts')
    const expected = Math.round(
      specimen.preservationPower * 0.2 +
      specimen.goldenSanctuary * 0.2 +
      specimen.resinFortitude * 0.2 +
      specimen.amberClarity * 0.2 +
      specimen.ancientWisdom * 0.2,
    )
    expect(specimen.qualityScore).toBe(expected)
  })

  it('handles empty content', () => {
    const specimen = analyzeAmberSpecimen(emptyContent, 'empty.ts')
    expect(specimen.file).toBe('empty.ts')
    expect(specimen.qualityScore).toBeGreaterThanOrEqual(0)
  })
})

// ─── analyzeAmberCollection ─────────────────────────────

describe('analyzeAmberCollection', () => {
  it('returns empty collection for no specimens', () => {
    const collection = analyzeAmberCollection([], 'empty-dir')
    expect(collection.directory).toBe('empty-dir')
    expect(collection.specimens).toEqual([])
    expect(collection.collectionType).toBe('no-collection')
    expect(collection.condition).toBe('void')
  })

  it('computes averages from specimens', () => {
    const specimens = [analyzeAmberSpecimen(richContent, 'a.ts'), analyzeAmberSpecimen(richContent, 'b.ts')]
    const collection = analyzeAmberCollection(specimens, 'src')
    expect(collection.avgPower).toBeGreaterThan(0)
    expect(collection.avgFortitude).toBeGreaterThan(0)
    expect(collection.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildAmberSanctumResult ────────────────────────────

describe('buildAmberSanctumResult', () => {
  it('returns complete result for single file', async () => {
    const result = await buildAmberSanctumResult(['app.ts'], [richContent])
    expect(result.specimens).toHaveLength(1)
    expect(result.collections).toHaveLength(1)
    expect(result.sanctum).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
    expect(result.stats.totalFiles).toBe(1)
  })

  it('returns empty result for no files', async () => {
    const result = await buildAmberSanctumResult([], [])
    expect(result.specimens).toHaveLength(0)
    expect(result.collections).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.sanctum.isAmber).toBe(false)
  })

  it('groups files by directory into collections', async () => {
    const result = await buildAmberSanctumResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.collections).toHaveLength(2)
    expect(result.stats.totalCollections).toBe(2)
  })

  it('sets isAmber when overall >= 60', async () => {
    const result = await buildAmberSanctumResult(['app.ts'], [richContent])
    if (result.stats.overallPreservation >= 60) {
      expect(result.sanctum.isAmber).toBe(true)
    }
  })

  it('finds best specimen', async () => {
    const result = await buildAmberSanctumResult(
      ['good.ts', 'bad.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestSpecimen).toBe('good.ts')
  })

  it('finds most preserved file', async () => {
    const result = await buildAmberSanctumResult(
      ['preserved.ts', 'lost.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.mostPreserved).toBe('preserved.ts')
  })

  it('finds safest file', async () => {
    const result = await buildAmberSanctumResult(
      ['safe.ts', 'risky.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.safest).toBe('safe.ts')
  })

  it('finds toughest file', async () => {
    const result = await buildAmberSanctumResult(
      ['tough.ts', 'weak.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.toughest).toBe('tough.ts')
  })

  it('finds clearest file', async () => {
    const result = await buildAmberSanctumResult(
      ['clear.ts', 'cloudy.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.clearest).toBe('clear.ts')
  })

  it('finds wisest file', async () => {
    const result = await buildAmberSanctumResult(
      ['wise.ts', 'naive.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.wisest).toBe('wise.ts')
  })

  it('counts condition categories', async () => {
    const result = await buildAmberSanctumResult(
      ['good.ts', 'bad.ts'],
      [richContent, emptyContent],
    )
    const total =
      result.stats.amberMasterpieceCount +
      result.stats.goldenSpecimenCount +
      result.stats.properAmberCount +
      result.stats.cloudyResinCount +
      result.stats.rawSapCount +
      result.stats.voidCount
    expect(total).toBe(2)
  })

  it('classifies curator grade correctly', async () => {
    const result = await buildAmberSanctumResult(['app.ts'], [richContent])
    expect(result.stats.curatorGrade).toBe(classifyCuratorGrade(result.stats.overallPreservation))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all 90+', () => {
    const sanctum: AmberSanctumResult['sanctum'] = {
      avgPower: 90, avgFortitude: 90, avgWisdom: 90,
      isAmber: true, overallPreservation: 90,
    }
    const stats = makeStats()
    const recs = generateRecommendations([], [], sanctum, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfect preservation')
  })

  it('recommends preserving when avgPreservationPower < 60', () => {
    const stats = makeStats({
      avgPreservationPower: 50,
      avgGoldenSanctuary: 70,
      avgResinFortitude: 70,
      avgAmberClarity: 70,
      avgAncientWisdom: 70,
    })
    const sanctum: AmberSanctumResult['sanctum'] = {
      avgPower: 50, avgFortitude: 70, avgWisdom: 70,
      isAmber: true, overallPreservation: 70,
    }
    const recs = generateRecommendations([], [], sanctum, stats)
    expect(recs.some((r) => r.includes('preservation power'))).toBe(true)
  })

  it('recommends sanctuary when avgGoldenSanctuary < 60', () => {
    const stats = makeStats({
      avgGoldenSanctuary: 50,
      avgPreservationPower: 70,
      avgResinFortitude: 70,
      avgAmberClarity: 70,
      avgAncientWisdom: 70,
    })
    const sanctum: AmberSanctumResult['sanctum'] = {
      avgPower: 70, avgFortitude: 70, avgWisdom: 70,
      isAmber: true, overallPreservation: 70,
    }
    const recs = generateRecommendations([], [], sanctum, stats)
    expect(recs.some((r) => r.includes('golden sanctuary'))).toBe(true)
  })

  it('recommends fortitude when avgResinFortitude < 60', () => {
    const stats = makeStats({
      avgResinFortitude: 50,
      avgPreservationPower: 70,
      avgGoldenSanctuary: 70,
      avgAmberClarity: 70,
      avgAncientWisdom: 70,
    })
    const sanctum: AmberSanctumResult['sanctum'] = {
      avgPower: 70, avgFortitude: 50, avgWisdom: 70,
      isAmber: true, overallPreservation: 70,
    }
    const recs = generateRecommendations([], [], sanctum, stats)
    expect(recs.some((r) => r.includes('resin fortitude'))).toBe(true)
  })

  it('recommends clarity when avgAmberClarity < 60', () => {
    const stats = makeStats({
      avgAmberClarity: 50,
      avgPreservationPower: 70,
      avgGoldenSanctuary: 70,
      avgResinFortitude: 70,
      avgAncientWisdom: 70,
    })
    const sanctum: AmberSanctumResult['sanctum'] = {
      avgPower: 70, avgFortitude: 70, avgWisdom: 70,
      isAmber: true, overallPreservation: 70,
    }
    const recs = generateRecommendations([], [], sanctum, stats)
    expect(recs.some((r) => r.includes('amber clarity'))).toBe(true)
  })

  it('recommends wisdom when avgAncientWisdom < 60', () => {
    const stats = makeStats({
      avgAncientWisdom: 50,
      avgPreservationPower: 70,
      avgGoldenSanctuary: 70,
      avgResinFortitude: 70,
      avgAmberClarity: 70,
    })
    const sanctum: AmberSanctumResult['sanctum'] = {
      avgPower: 70, avgFortitude: 70, avgWisdom: 50,
      isAmber: true, overallPreservation: 70,
    }
    const recs = generateRecommendations([], [], sanctum, stats)
    expect(recs.some((r) => r.includes('ancient wisdom'))).toBe(true)
  })

  it('warns about crumbling sanctum when overall < 40', () => {
    const stats = makeStats({
      overallPreservation: 30,
      avgPreservationPower: 30,
      avgGoldenSanctuary: 30,
      avgResinFortitude: 30,
      avgAmberClarity: 30,
      avgAncientWisdom: 30,
    })
    const sanctum: AmberSanctumResult['sanctum'] = {
      avgPower: 30, avgFortitude: 30, avgWisdom: 30,
      isAmber: false, overallPreservation: 30,
    }
    const recs = generateRecommendations([], [], sanctum, stats)
    expect(recs.some((r) => r.includes('crumbles'))).toBe(true)
  })

  it('returns positive message when no issues', () => {
    const stats = makeStats()
    const sanctum: AmberSanctumResult['sanctum'] = {
      avgPower: 90, avgFortitude: 90, avgWisdom: 90,
      isAmber: true, overallPreservation: 90,
    }
    const recs = generateRecommendations([], [], sanctum, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfect preservation')
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(85)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
  })

  it('colorCondition handles all conditions', () => {
    expect(typeof colorCondition('golden-palace')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
  })

  it('formatSpecimenTable returns string', () => {
    const specimen = analyzeAmberSpecimen(richContent, 'app.ts')
    const result = formatSpecimenTable(specimen)
    expect(result).toContain('Amber Specimen')
    expect(result).toContain('app.ts')
  })

  it('formatSpecimensTable handles empty array', () => {
    const result = formatSpecimensTable([])
    expect(result).toContain('No amber specimens')
  })

  it('formatCollectionTable returns string', () => {
    const specimens = [analyzeAmberSpecimen(richContent, 'a.ts')]
    const collection = analyzeAmberCollection(specimens, 'src')
    const result = formatCollectionTable(collection)
    expect(result).toContain('Amber Collection')
    expect(result).toContain('src')
  })

  it('formatCollectionsTable handles empty array', () => {
    const result = formatCollectionsTable([])
    expect(result).toContain('No amber collections')
  })

  it('formatStatsTable returns string', () => {
    const stats = makeStats()
    const result = formatStatsTable(stats)
    expect(result).toContain('Amber Sanctum Statistics')
    expect(result).toContain('Curator Grade')
  })

  it('formatRecommendations handles empty array', () => {
    const result = formatRecommendations([])
    expect(result).toContain('No recommendations')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildAmberSanctumResult(['app.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.specimens).toHaveLength(1)
  })

  it('formatResultTable returns full output', async () => {
    const result = await buildAmberSanctumResult(['app.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Amber Sanctum Analysis')
  })
})

// ─── Edge cases ─────────────────────────────────────────

describe('edge cases', () => {
  it('handles single file in root directory', async () => {
    const result = await buildAmberSanctumResult(['app.ts'], [richContent])
    expect(result.collections[0].directory).toBe('.')
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 20 }, (_, i) => `src/file${i}.ts`)
    const contents = files.map(() => richContent)
    const result = await buildAmberSanctumResult(files, contents)
    expect(result.stats.totalFiles).toBe(20)
    expect(result.specimens).toHaveLength(20)
  })

  it('minimal content scores low', () => {
    const p = measurePreserving(minimalContent)
    const s = measureSheltering(minimalContent)
    const f = measureFortifying(minimalContent)
    const r = measureRevealing(minimalContent)
    const k = measureKnowing(minimalContent)
    expect(p.power).toBeLessThan(60)
    expect(s.sanctuary).toBeLessThan(60)
    expect(f.fortitude).toBeLessThan(60)
    expect(r.clarity).toBeLessThan(55)
    expect(k.wisdom).toBeLessThan(55)
  })

  it('handles content with any keyword', () => {
    const result = measureFortifying('const x: any = null')
    expect(result.hasTypeSafe).toBe(false)
  })

  it('handles content with global references', () => {
    const result = measureFortifying('window.location.href = "/"')
    expect(result.hasUnyielding).toBe(false)
  })
})
